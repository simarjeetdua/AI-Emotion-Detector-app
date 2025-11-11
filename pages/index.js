import { useState } from 'react';
import Router from 'next/router';
import Swal from 'sweetalert2';

export default function Home() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Choose correct endpoint
    const url = `/api/auth/${mode === 'login' ? 'login' : 'signup'}`;
    const body =
      mode === 'login'
        ? { email: form.email, password: form.password }
        : form;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        // Show readable errors for signup
        let msg = data.error || 'Something went wrong';
        if (msg.includes('E11000')) msg = 'Email already registered.';
        setError(msg);
        return;
      }

      // ✅ Success popup (works for both login and signup)
      await Swal.fire({
        title: 'Success!',
        text:
          mode === 'login'
            ? 'You have logged in successfully!'
            : 'Your account has been created successfully!',
        icon: 'success',
        confirmButtonText: 'Continue',
      });

      // Redirect to dashboard
      Router.push('/dashboard');
    } catch (err) {
      console.error('Request failed:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        background: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <h1>{mode === 'login' ? 'Login' : 'Sign Up'}</h1>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
          required
        />

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : mode === 'login'
            ? 'Login'
            : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        {mode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}
      </p>
      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={{
          marginTop: '8px',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          background: '#6b7280',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Switch to {mode === 'login' ? 'Sign Up' : 'Login'}
      </button>
    </div>
  );
}
