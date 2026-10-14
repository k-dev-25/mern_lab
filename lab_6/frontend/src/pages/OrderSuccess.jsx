import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer, getOrder } from '../services/api.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let current = true;
    Promise.all([getCurrentCustomer(), getOrder(id)]).then(([who, result]) => { if (current) { setCustomer(who.customer || who); setOrder(result.order); } }).catch(() => current && setError(true));
    return () => { current = false; };
  }, [id, navigate]);
  if (!customer) return <main className="loading-screen">{error ? <p>Unable to load this order.</p> : 'Loading order…'}</main>;
  return <div className="app-shell"><Navbar customer={customer} /><main className="products-page"><section className="wishlist-empty"><p>✅</p><h1>{order?.status === 'PLACED' ? 'Order Placed Successfully' : 'Order Details'}</h1><p>Order ID: {order?._id}</p><p>Total: ₹{order?.totalAmount.toLocaleString('en-IN')}</p><p>Status: {order?.status}</p><p>{order?.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ')}</p><div className="product-card-actions"><Link className="button button-primary" to="/orders">View My Orders</Link><Link className="button button-quiet" to="/products">Continue Shopping</Link></div></section></main></div>;
}
