import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './src/models/product.model.js';

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    stock: 18,
  },
  {
    name: 'Cotton Casual Shirt',
    description: 'Comfortable regular-fit cotton shirt for everyday wear.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?w=800',
    stock: 24,
  },
  {
    name: 'Clean Code',
    description: 'A practical guide to writing readable and maintainable software.',
    price: 799,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    stock: 12,
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'Simple 350 ml ceramic mug for coffee, tea, or hot chocolate.',
    price: 349,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    stock: 30,
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Fitness watch with activity tracking, heart-rate monitoring, and notifications.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    stock: 9,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight cushioned shoes designed for daily walks and runs.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    stock: 15,
  },
];

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart');
await Product.deleteMany({ name: { $in: products.map(({ name }) => name) } });
await Product.insertMany(products);
console.log(`Seeded ${products.length} products.`);
await mongoose.disconnect();
