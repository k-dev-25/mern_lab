import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

function validAddress(address) {
  const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  if (!address || required.some((field) => typeof address[field] !== 'string' || !address[field].trim())) return false;
  return /^[6-9]\d{9}$/.test(address.phone.replace(/[\s+-]/g, '')) && /^\d{6}$/.test(address.pincode.trim());
}

async function createPaymentOrder(req, res, next) {
  let order;
  try {
    if (!validAddress(req.body?.shippingAddress)) return res.status(400).json({ success: false, message: 'Enter a valid shipping address and 10-digit phone and 6-digit pincode' });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ success: false, message: 'Razorpay Test Mode keys are not configured on the backend' });
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart.length) return res.status(400).json({ success: false, message: 'Your cart is empty' });
    const items = [];
    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) return res.status(400).json({ success: false, message: 'A product in your cart no longer exists' });
      if (cartItem.quantity > product.stock) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      items.push({ product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image });
    }
    const totalAmount = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    order = await Order.create({ user: customer._id, items, shippingAddress: Object.fromEntries(Object.entries(req.body.shippingAddress).map(([key, value]) => [key, value.trim()])), totalAmount });
    const { default: Razorpay } = await import('razorpay');
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const paymentOrder = await razorpay.orders.create({ amount: Math.round(totalAmount * 100), currency: 'INR', receipt: order._id.toString() });
    order.razorpayOrderId = paymentOrder.id;
    await order.save();
    res.status(201).json({ success: true, shopKartOrderId: order._id, razorpayOrderId: paymentOrder.id, amount: paymentOrder.amount, currency: paymentOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (order?._id) await Order.deleteOne({ _id: order._id }).catch(() => {});
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ success: false, message: 'Unable to create order from the current cart' });
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (![shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === 'string' && value)) return res.status(400).json({ success: false, message: 'Payment details are required' });
    if (!mongoose.isObjectIdOrHexString(shopKartOrderId)) return res.status(400).json({ success: false, message: 'Invalid order ID' });
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'PAID') return res.json({ success: true, order });
    if (!order.razorpayOrderId || razorpay_order_id !== order.razorpayOrderId) return res.status(400).json({ success: false, message: 'Payment order does not match' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest();
    const supplied = Buffer.from(razorpay_signature, 'hex');
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    const customer = await Customer.findById(req.user._id);
    order.paymentStatus = 'PAID'; order.status = 'PLACED'; order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    customer.cart = [];
    await customer.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
}

async function getOrders(req, res, next) {
  try { const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); res.json({ success: true, orders }); }
  catch (error) { next(error); }
}

async function getOrder(req, res, next) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid order ID' });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) { next(error); }
}

export { createPaymentOrder, verifyPayment, getOrders, getOrder };
