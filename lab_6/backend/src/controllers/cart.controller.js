import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

const fields = 'name price category image stock';

async function getCart(req, res, next) {
  try {
    const customer = await Customer.findById(req.user._id).populate({ path: 'cart.product', select: fields });
    res.json({ success: true, cart: customer.cart.filter((item) => item.product) });
  } catch (error) { next(error); }
}

async function addToCart(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isObjectIdOrHexString(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((entry) => entry.product.toString() === productId);
    if (item && item.quantity >= product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) of ${product.name} are available` });
    if (item) item.quantity += 1;
    else customer.cart.push({ product: product._id, quantity: 1 });
    await customer.save();
    await customer.populate({ path: 'cart.product', select: fields });
    res.json({ success: true, message: 'Cart updated', cart: customer.cart.filter((entry) => entry.product) });
  } catch (error) { next(error); }
}

async function updateQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};
    if (!mongoose.isObjectIdOrHexString(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be a whole number of at least 1' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (quantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) of ${product.name} are available` });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((entry) => entry.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found in cart' });
    item.quantity = quantity;
    await customer.save();
    await customer.populate({ path: 'cart.product', select: fields });
    res.json({ success: true, message: 'Cart updated', cart: customer.cart.filter((entry) => entry.product) });
  } catch (error) { next(error); }
}

async function removeFromCart(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isObjectIdOrHexString(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.id?.(productId) || customer.cart.find((entry) => entry.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found in cart' });
    item.deleteOne ? item.deleteOne() : customer.cart.pull(item._id);
    await customer.save();
    await customer.populate({ path: 'cart.product', select: fields });
    res.json({ success: true, message: 'Product removed from cart', cart: customer.cart.filter((entry) => entry.product) });
  } catch (error) { next(error); }
}

export { addToCart, getCart, updateQuantity, removeFromCart };
