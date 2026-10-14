import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginCustomer } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginCustomer(form);
      navigate('/products', { replace: true });
    } catch {
      setError('Invalid Credentials');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="form-card compact-card">
        <p className="eyebrow">ShopKart</p>
        <h1>Login</h1>
        <p className="form-intro">Enter your details to continue.</p>
        {location.state?.registered && <p className="success-message" role="status">Account created. You can log in now.</p>}
        <form onSubmit={handleSubmit} noValidate>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Login'}</button>
        </form>
        <p className="form-footer">New customer? <Link to="/customer/register">Register</Link></p>
      </div>
    </main>
  );
}
