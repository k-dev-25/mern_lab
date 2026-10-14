import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';
import { createPaymentOrder, getCurrentCustomer, verifyPayment } from '../services/api.js';

const initialAddress = { fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' };

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { cartItems, loading, subtotal, clearCart } = useCart();

  useEffect(() => {
    let current = true;
    getCurrentCustomer().then((data) => current && setCustomer(data.customer || data)).catch(() => current && navigate('/customer/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);

  function validate() {
    if (Object.values(address).some((value) => !value.trim())) return 'Complete every shipping field.';
    if (!/^[6-9]\d{9}$/.test(address.phone.replace(/[\s+-]/g, ''))) return 'Phone must contain a valid 10-digit Indian number.';
    if (!/^\d{6}$/.test(address.pincode.trim())) return 'Pincode must contain 6 digits.';
    return '';
  }

  async function submit(event) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setBusy(true); setError('');
    try {
      const available = await loadRazorpay();
      if (!available) throw new Error('Unable to load Razorpay Checkout. Check your connection and try again.');
      const paymentOrder = await createPaymentOrder(address);
      const checkout = new window.Razorpay({
        key: paymentOrder.key, amount: paymentOrder.amount, currency: paymentOrder.currency,
        name: 'ShopKart', description: 'ShopKart Order', order_id: paymentOrder.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone }, theme: { color: '#1769aa' },
        handler: async (response) => {
          try {
            const result = await verifyPayment({ shopKartOrderId: paymentOrder.shopKartOrderId, ...response });
            clearCart();
            navigate(`/order-success/${result.order._id}`, { replace: true });
          } catch (verificationError) { setError(verificationError.message || 'Payment verification failed. Your cart is still saved.'); setBusy(false); }
        },
      });
      checkout.on('payment.failed', (response) => { setError(response.error?.description || 'Payment failed. Your cart has not been cleared.'); setBusy(false); });
      checkout.open();
      setBusy(false);
    } catch (requestError) { setError(requestError.message || 'Unable to start checkout.'); setBusy(false); }
  }

  if (!customer) return <main className="loading-screen">Checking your account…</main>;
  return <div className="app-shell"><Navbar customer={customer} /><main className="products-page"><header className="wishlist-header"><h1>Checkout</h1><Link to="/cart">Back to Cart</Link></header>
    {loading && <p>Loading your cart...</p>}
    {!loading && !cartItems.length && <section className="wishlist-empty"><h2>Your cart is empty</h2><Link className="button button-primary" to="/products">Browse Products</Link></section>}
    {!loading && cartItems.length > 0 && <div className="cart-layout"><form className="checkout-form" onSubmit={submit} noValidate><h2>Shipping Details</h2>
      {[['fullName','Full Name'],['phone','Phone'],['addressLine1','Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([name,label]) => <label key={name}>{label}<input name={name} value={address[name]} onChange={(event) => { setAddress((current) => ({ ...current, [name]: event.target.value })); setError(''); }} autoComplete={name === 'addressLine1' ? 'street-address' : name} /></label>)}
      <h2>Order Summary</h2>{cartItems.map(({ product, quantity }) => <p className="summary-item" key={product._id}>{product.name} × {quantity}<strong>₹{(product.price * quantity).toLocaleString('en-IN')}</strong></p>)}<p className="summary-total">Total <strong>₹{subtotal.toLocaleString('en-IN')}</strong></p>
      {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Starting secure checkout…' : 'Pay with Razorpay'}</button>
    </form><aside className="order-summary"><h2>Payment</h2><p>Secure payment through Razorpay Test Mode.</p><p>Your cart remains saved until payment verification succeeds.</p></aside></div>}
  </main></div>;
}
