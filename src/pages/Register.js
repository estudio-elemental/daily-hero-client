import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
        body: JSON.stringify(form)  // Enviando o formulário completo, incluindo password2
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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Registrar</h2>
        <input 
          name="username" 
          placeholder="Usuário" 
          value={form.username} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          name="email" 
          placeholder="Email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          name="first_name" 
          placeholder="Nome" 
          value={form.first_name} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          name="last_name" 
          placeholder="Sobrenome" 
          value={form.last_name} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          value={form.password} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          name="password2" 
          type="password" 
          placeholder="Repita a senha" 
          value={form.password2} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {error && <div style={{color:'red', textAlign: 'center'}}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button 
            type="button"
            onClick={() => navigate('/login')}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Voltar para Login
          </button>
        </div>
      </form>
    </div>
  );
}
