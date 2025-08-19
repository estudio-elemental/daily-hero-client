import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ token }) {
  const [hero, setHero] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/hero', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHero)
      .catch(() => setError('Erro ao carregar herói.'));
    fetch('http://127.0.0.1:8000/api/monster', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setMonsters)
      .catch(() => setError('Erro ao carregar monstros.'));
  }, [token]);

  if (!token) return <div>Faça login para acessar.</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!hero) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Herói</h2>
      <div>ID: {hero.id} | Level: {hero.level} | HP: {hero.hp}/{hero.max_hp}</div>
      <h2>Monstros</h2>
      <ul>
        {monsters.map(m => (
          <li key={m.id} style={{marginBottom:8}}>
            <button onClick={() => navigate(`/fight/${m.id}`)}>
              {m.name} (Lv {m.level}) - EXP: {m.exp_earn} | HP: {m.hp} | Atk: {m.attack} | Def: {m.defense}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
