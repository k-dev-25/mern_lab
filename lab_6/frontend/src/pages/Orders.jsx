import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer, getOrders } from '../services/api.js';

export default function Orders() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  async function load() { setStatus('loading'); try { const result = await getOrders(); setOrders(result.orders || []); setStatus('ready'); } catch { setStatus('error'); } }
  useEffect(() => {
    let current = true;
    getCurrentCustomer().then((data) => current && setCustomer(data.customer || data)).catch(() => current && navigate('/customer/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);
  useEffect(() => { if (customer) load(); }, [customer]);
  if (!customer) return <main className="loading-screen">Checking your account…</main>;
  return <div className="app-shell"><Navbar customer={customer} /><main className="products-page"><h1>My Orders</h1>
    {status === 'loading' && <p>Loading your orders...</p>}
    {status === 'error' && <section className="wishlist-empty"><p className="form-error">Unable to load orders.</p><button className="button button-primary" onClick={load}>Try Again</button></section>}
    {status === 'ready' && !orders.length && <section className="wishlist-empty"><h2>You have not placed any orders yet.</h2><Link className="button button-primary" to="/products">Start Shopping</Link></section>}
    {status === 'ready' && !!orders.length && <section className="order-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="wishlist-header"><strong>Order #{order._id}</strong><span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span></div><ul>{order.items.map((item, index) => <li key={`${item.product}-${index}`}>{item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString('en-IN')}</li>)}</ul><p>Total: <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong></p><p>Status: <strong>{order.status}</strong> · Payment: {order.paymentStatus}</p><Link to={`/order-success/${order._id}`}>View Details</Link></article>)}</section>}
  </main></div>;
}
