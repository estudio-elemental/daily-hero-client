
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fight from './pages/Fight';

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
      fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingLogin)
      })
        .then(res => res.json())
        .then(data => handleLogin(data.token))
        .catch(() => {});
    }
  }, [pendingLogin]);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
        <Route path="/fight/:monsterId" element={token ? <Fight token={token} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
