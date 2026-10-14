import mongoose from 'mongoose';
import Product from '../models/product.model.js';

const listFields = 'name price category image stock';
const detailFields = `${listFields} description createdAt`;

function validationError(error) {
  return error.name === 'ValidationError' || error.name === 'CastError';
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body || {});
    res.status(201).json({ success: true, product });
  } catch (error) {
    if (validationError(error)) {
      return res.status(400).json({ success: false, message: 'Invalid product data' });
    }
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const query = {};
    if (req.query.search) {
      const search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = new RegExp(search, 'i');
    }
    if (req.query.category) query.category = req.query.category;

    const products = await Product.find(query).select(listFields).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const product = await Product.findById(req.params.id).select(detailFields);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export { createProduct, getProducts, getProduct };
