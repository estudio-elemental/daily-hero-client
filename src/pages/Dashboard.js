import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ token }) {
  const [hero, setHero] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/hero/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHero)
      .catch(() => setError('Erro ao carregar herói.'));
    fetch('http://127.0.0.1:8000/api/monsters/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMonsters(data.results))
      .catch(() => setError('Erro ao carregar monstros.'));
  }, [token]);

  const startFight = async (monsterId) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/start-fight/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hero_id: hero.id,
          monster_id: monsterId
        })
      });
      if (!res.ok) throw new Error('Erro ao iniciar luta');
      const data = await res.json();
      // Navega para a página de luta com todos os dados iniciais
      navigate('/fight', { 
        state: { 
          fight_id: data.fight_id,
          hero_hp: data.hero_hp,
          monster_hp: data.monster_hp,
          turn: data.turn,
          winner: data.winner,
          hero_max_hp: data.hero_max_hp,
          monster_max_hp: data.monster_max_hp
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <button 
              onClick={() => startFight(m.id)}
              disabled={loading}
            >
              {m.name} (Lv {m.level}) - EXP: {m.exp_earn} | HP: {m.hp} | Atk: {m.attack} | Def: {m.defense}
              {loading && ' (Iniciando luta...)'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
