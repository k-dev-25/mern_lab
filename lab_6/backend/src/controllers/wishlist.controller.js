import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

async function addProduct(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    if (!(await Product.exists({ _id: productId }))) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.wishlist.some((id) => id.toString() === productId)) {
      return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
    }

    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } },
    );
    if (!result.modifiedCount) {
      return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
    }
    res.status(201).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    next(error);
  }
}

async function getWishlist(req, res, next) {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate({ path: 'wishlist', select: 'name price category image stock' });
    if (!customer) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const wishlist = customer.wishlist.filter(Boolean);
    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    next(error);
  }
}

async function removeProduct(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
    );
    if (!result.modifiedCount) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    next(error);
  }
}

export { addProduct, getWishlist, removeProduct };
