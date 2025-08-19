import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Login inválido');
      const data = await res.json();
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="username" placeholder="Usuário" value={form.username} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
