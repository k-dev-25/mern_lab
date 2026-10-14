import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api.js';

const initialForm = { fullName: '', email: '', password: '', phone: '' };

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email.';
  if (form.password.length < 6) errors.password = 'Use at least 6 characters.';
  if (!/^\+?[0-9\s()-]{7,}$/.test(form.phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    try {
      await registerCustomer({ ...form, fullName: form.fullName.trim() });
      navigate('/customer/login', { replace: true, state: { registered: true } });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="form-card">
        <p className="eyebrow">ShopKart</p>
        <h1>Create an account</h1>
        <p className="form-intro">Register to start shopping.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" />{errors.fullName && <small>{errors.fullName}</small>}</label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" />{errors.email && <small>{errors.email}</small>}</label>
          <label>Password<input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" />{errors.password && <small>{errors.password}</small>}</label>
          <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} autoComplete="tel" />{errors.phone && <small>{errors.phone}</small>}</label>
          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="form-footer">Already have an account? <Link to="/customer/login">Login</Link></p>
      </div>
    </main>
  );
}
