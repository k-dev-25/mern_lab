import { Link } from 'react-router-dom';
import { useState } from 'react';
import { addToWishlist } from '../services/api.js';

export default function ProductCard({ product }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleAddToWishlist() {
    setSaving(true);
    setError('');
    try {
      await addToWishlist(product._id);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
        <p>{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
        <div className="product-card-actions">
          <Link className="button button-primary" to={`/products/${product._id}`}>View Details</Link>
          <button className="button button-quiet" type="button" onClick={handleAddToWishlist} disabled={saving || saved}>
            {saving ? '⏳ Saving...' : saved ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </article>
  );
}
