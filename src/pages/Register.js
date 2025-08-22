import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/auth.css';

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    username: '', password: '', password2: '', email: '', first_name: '', last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Erro ao registrar');
      }
      
      onRegister(form.username, form.password);
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
        <h2>Registrar</h2>
        <input 
          name="username" 
          placeholder="Usuário" 
          value={form.username} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <input 
          name="email" 
          placeholder="Email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <input 
          name="first_name" 
          placeholder="Nome" 
          value={form.first_name} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <input 
          name="last_name" 
          placeholder="Sobrenome" 
          value={form.last_name} 
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
        <input 
          name="password2" 
          type="password" 
          placeholder="Repita a senha" 
          value={form.password2} 
          onChange={handleChange} 
          required 
          className="auth-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="auth-button"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {error && <div className="auth-error">{error}</div>}
      </form>

      <div className="auth-switch">
        <p>Já tem uma conta?</p>
        <button 
          onClick={() => navigate('/login')}
          className="auth-switch-button"
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
}
