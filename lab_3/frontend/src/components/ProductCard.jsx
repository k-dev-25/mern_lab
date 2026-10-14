import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
        <p>{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
        <Link className="button button-primary" to={`/products/${product._id}`}>View Details</Link>
      </div>
    </article>
  );
}
