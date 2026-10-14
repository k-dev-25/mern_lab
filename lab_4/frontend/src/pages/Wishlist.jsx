import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer, getWishlist, removeFromWishlist } from '../services/api.js';

export default function Wishlist() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState('loading');

  const loadWishlist = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let current = true;
    getCurrentCustomer()
      .then((data) => current && setCustomer(data.customer || data))
      .catch(() => current && navigate('/customer/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);

  useEffect(() => {
    if (!customer) return undefined;
    loadWishlist();
  }, [customer, loadWishlist]);

  async function handleRemove(productId) {
    try {
      await removeFromWishlist(productId);
      setWishlist((products) => products.filter((product) => product._id !== productId));
    } catch (error) {
      window.alert(error.message || 'Unable to remove product. Please try again.');
    }
  }

  if (!customer) return <main className="loading-screen">Checking your account…</main>;

  return (
    <div className="app-shell">
      <Navbar customer={customer} />
      <main className="products-page">
        <header className="wishlist-header">
          <div><h1>My Wishlist</h1><p>{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved</p></div>
          <Link to="/products">Continue Shopping</Link>
        </header>
        {status === 'loading' && <p>Loading your wishlist...</p>}
        {status === 'error' && (
          <section className="wishlist-empty">
            <p className="form-error">Unable to load wishlist.</p>
            <button className="button button-primary" type="button" onClick={loadWishlist}>Try Again</button>
          </section>
        )}
        {status === 'ready' && wishlist.length === 0 && (
          <section className="wishlist-empty">
            <p aria-hidden="true">❤️</p>
            <h2>Your wishlist is empty ❤️</h2>
            <p>Start saving products you love.</p>
            <Link className="button button-primary" to="/products">Browse Products</Link>
          </section>
        )}
        {status === 'ready' && wishlist.length > 0 && (
          <section className="product-grid" aria-label="Wishlist products">
            {wishlist.map((product) => (
              <article className="product-card" key={product._id}>
                <img src={product.image} alt={product.name} />
                <div className="product-card-content">
                  <p className="product-category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                  <p>{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
                  <div className="product-card-actions">
                    <Link className="button button-primary" to={`/products/${product._id}`}>View Details</Link>
                    <button className="button button-quiet" type="button" onClick={() => handleRemove(product._id)}>
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
