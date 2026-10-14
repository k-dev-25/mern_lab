import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getCurrentCustomer } from '../services/api.js';

export default function Cart() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const { cartItems, loading, error, refreshCart, setQuantity, removeItem, subtotal, itemCount } = useCart();

  useEffect(() => {
    let current = true;
    getCurrentCustomer().then((data) => current && setCustomer(data.customer || data)).catch(() => current && navigate('/customer/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);

  async function run(key, action) {
    setBusy(key); setActionError('');
    try { await action(); } catch (e) { setActionError(e.message || 'Unable to update cart.'); }
    finally { setBusy(''); }
  }

  if (!customer) return <main className="loading-screen">Checking your account…</main>;
  return <div className="app-shell"><Navbar customer={customer} /><main className="products-page">
    <header className="wishlist-header"><div><h1>My Cart</h1><p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p></div><Link to="/products">Continue Shopping</Link></header>
    {loading && <p>Loading your cart...</p>}
    {!loading && error && <section className="wishlist-empty"><p className="form-error">Unable to load your cart.</p><button className="button button-primary" onClick={() => refreshCart().catch(() => {})}>Try Again</button></section>}
    {actionError && <p className="form-error" role="alert">{actionError}</p>}
    {!loading && !error && !cartItems.length && <section className="wishlist-empty"><p>🛒</p><h2>Your cart is empty</h2><p>Looks like you haven't added anything yet.</p><Link className="button button-primary" to="/products">Browse Products</Link></section>}
    {!loading && !error && cartItems.length > 0 && <div className="cart-layout"><section className="cart-lines">{cartItems.map(({ product, quantity }) => <article className="cart-line" key={product._id}>
      <img src={product.image} alt={product.name} /><div className="cart-line-info"><p className="product-category">{product.category}</p><h2>{product.name}</h2><p className="product-price">₹{product.price.toLocaleString('en-IN')}</p><p>{product.stock} units available</p><div className="quantity-controls"><button aria-label={`Decrease ${product.name}`} disabled={quantity <= 1 || busy === product._id} onClick={() => run(product._id, () => setQuantity(product._id, quantity - 1))}>−</button><span>{quantity}</span><button aria-label={`Increase ${product.name}`} disabled={quantity >= product.stock || busy === product._id} onClick={() => run(product._id, () => setQuantity(product._id, quantity + 1))}>+</button><button className="button button-quiet" disabled={busy === product._id} onClick={() => run(product._id, () => removeItem(product._id))}>Remove</button></div></div><strong>₹{(product.price * quantity).toLocaleString('en-IN')}</strong>
    </article>)}</section><aside className="order-summary"><h2>Order Summary</h2><p>Items <strong>{itemCount}</strong></p><p>Subtotal <strong>₹{subtotal.toLocaleString('en-IN')}</strong></p><button className="button button-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button></aside></div>}
  </main></div>;
}
