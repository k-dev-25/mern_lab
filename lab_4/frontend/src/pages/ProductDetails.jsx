import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer, getProduct } from '../services/api.js';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let current = true;
    getCurrentCustomer()
      .then((data) => current && setCustomer(data.customer || data))
      .catch(() => current && navigate('/customer/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);

  useEffect(() => {
    if (!customer) return undefined;
    let current = true;
    getProduct(id)
      .then((data) => current && (setProduct(data.product), setStatus('ready')))
      .catch(() => current && setStatus('error'));
    return () => { current = false; };
  }, [customer, id]);

  if (!customer) return <main className="loading-screen">Checking your account…</main>;
  if (status === 'loading') return <div className="app-shell"><Navbar customer={customer} /><main className="products-page"><p>Loading product...</p></main></div>;
  if (status === 'error') return <div className="app-shell"><Navbar customer={customer} /><main className="products-page"><p className="form-error">Something went wrong while loading the product.</p><Link to="/products">Back to products</Link></main></div>;

  return (
    <div className="app-shell">
      <Navbar customer={customer} />
      <main className="products-page">
        <Link to="/products">← Back to products</Link>
        <article className="product-details">
          <img src={product.image} alt={product.name} />
          <div>
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
            <p>{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
            <button className="button button-primary" type="button">Add to Cart</button>
          </div>
        </article>
      </main>
    </div>
  );
}
