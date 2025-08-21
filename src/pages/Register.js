import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    username: '', password: '', password2: '', email: '', first_name: '', last_name: ''
  });
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
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Erro ao registrar');
      onRegister(form.username, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar</h2>
      <input name="username" placeholder="Usuário" value={form.username} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="first_name" placeholder="Nome" value={form.first_name} onChange={handleChange} required />
      <input name="last_name" placeholder="Sobrenome" value={form.last_name} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
      <input name="password2" type="password" placeholder="Repita a senha" value={form.password2} onChange={handleChange} required />
      <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar'}</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
