import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import customerRoutes from './src/routes/customer.routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

if (process.argv[1] === new URL(import.meta.url).pathname) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart')
    .then(() => app.listen(port, () => console.log(`ShopKart API running on port ${port}`)))
    .catch((error) => {
      console.error('Could not connect to MongoDB:', error.message);
      process.exit(1);
    });
}

export default app;
