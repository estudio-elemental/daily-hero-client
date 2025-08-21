import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fight from './pages/Fight';
import { API_BASE_URL } from './config';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [pendingLogin, setPendingLogin] = useState(null);

  const handleRegister = (username, password) => {
    setPendingLogin({ username, password });
  };

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    setPendingLogin(null);
  };

  // Se acabou de registrar, faz login automático
  React.useEffect(() => {
    if (pendingLogin) {
      fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingLogin)
      })
        .then(res => {
          if (!res.ok) throw new Error('Login falhou após registro');
          return res.json();
        })
        .then(data => handleLogin(data.access))
        .catch(() => setPendingLogin(null));
    }
  }, [pendingLogin]);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={
          token ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />
        } />
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/dashboard" element={
          token ? <Dashboard token={token} /> : <Navigate to="/login" />
        } />
        <Route path="/fight" element={
          token ? <Fight token={token} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={
          <Navigate to={token ? "/dashboard" : "/login"} />
        } />
      </Routes>
    </Router>
  );
}

export default App;
