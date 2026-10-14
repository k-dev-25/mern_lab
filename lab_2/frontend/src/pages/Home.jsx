import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getCurrentCustomer } from '../services/api.js';

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    getCurrentCustomer()
      .then((data) => isCurrent && setCustomer(data.customer || data))
      .catch(() => isCurrent && navigate('/login', { replace: true }));
    return () => { isCurrent = false; };
  }, [navigate]);

  if (!customer) {
    return <main className="loading-screen">Checking your account…</main>;
  }

  return (
    <div className="app-shell">
      <Navbar customer={customer} />
      <main className="home-content">
        <section className="profile-card">
          <p className="eyebrow">Customer profile</p>
          <h1>Welcome, {customer.fullName}</h1>
          <div className="details-list">
            <p><span>Name</span><strong>{customer.fullName}</strong></p>
            <p><span>Email</span><strong>{customer.email}</strong></p>
            <p><span>Phone</span><strong>{customer.phone}</strong></p>
          </div>
        </section>
      </main>
    </div>
  );
}
