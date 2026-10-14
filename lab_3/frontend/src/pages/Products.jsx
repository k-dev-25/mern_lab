import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer, getProducts } from '../services/api.js';

const categories = ['Electronics', 'Fashion', 'Books', 'Home'];

export default function Products() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let current = true;
    getCurrentCustomer()
      .then((data) => current && setCustomer(data.customer || data))
      .catch(() => current && navigate('/login', { replace: true }));
    return () => { current = false; };
  }, [navigate]);

  useEffect(() => {
    if (!customer) return undefined;
    let current = true;
    setStatus('loading');
    getProducts(filters)
      .then((data) => {
        if (current) {
          setProducts(data.products || []);
          setStatus('ready');
        }
      })
      .catch(() => current && setStatus('error'));
    return () => { current = false; };
  }, [customer, filters]);

  if (!customer) return <main className="loading-screen">Checking your account…</main>;

  return (
    <div className="app-shell">
      <Navbar customer={customer} />
      <main className="products-page">
      <header className="products-header">
        <div><Link to="/home">← ShopKart</Link><h1>Products</h1></div>
        <div className="product-filters">
          <input
            aria-label="Search products"
            placeholder="Search products..."
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
      </header>
      {status === 'loading' && <p>Loading products...</p>}
      {status === 'error' && <p className="form-error">Something went wrong while loading products.</p>}
      {status === 'ready' && !products.length && <p>No products found.</p>}
      {status === 'ready' && products.length > 0 && (
        <section className="product-grid" aria-label="Products">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </section>
      )}
      </main>
    </div>
  );
}
