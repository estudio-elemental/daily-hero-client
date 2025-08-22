import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/auth.css';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Login inválido');
      const data = await res.json();
      onLogin(data.access);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <input 
          name="username" 
          placeholder="Usuário" 
          value={form.username} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          value={form.password} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="auth-button"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <div className="auth-error">{error}</div>}
      </form>
      
      <div className="auth-switch">
        <p>Não tem uma conta?</p>
        <button 
          onClick={() => navigate('/register')}
          className="auth-switch-button"
        >
          Registrar-se
        </button>
      </div>
    </div>
  );
}
