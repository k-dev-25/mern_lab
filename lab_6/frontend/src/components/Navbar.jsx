import { Link, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar({ customer }) {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  async function handleLogout() {
    try {
      await logoutCustomer();
    } finally {
      navigate('/customer/login', { replace: true });
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/home">ShopKart</Link>
      <div className="nav-actions">
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart ({itemCount})</Link>
        <Link to="/orders">Orders</Link>
        <span className="nav-greeting">Hi, {customer.fullName.split(' ')[0]}</span>
        <button className="button button-quiet" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
