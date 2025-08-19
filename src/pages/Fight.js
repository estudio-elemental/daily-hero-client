import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Fight({ token }) {
  const { monsterId } = useParams();
  const [hero, setHero] = useState(null);
  const [monster, setMonster] = useState(null);
  const [fightId, setFightId] = useState(null);
  const [fightData, setFightData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('http://127.0.0.1:8000/api/hero', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/monster', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([hero, monsters]) => {
      setHero(hero);
      setMonster(monsters.find(m => m.id.toString() === monsterId));
    }).catch(() => setError('Erro ao carregar dados.'));
  }, [token, monsterId]);

  const startFight = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/start-fight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monster_id: monsterId, hero_id: hero.id })
      });
      if (!res.ok) throw new Error('Erro ao iniciar luta');
      const data = await res.json();
      setFightId(data.fight_id);
      setFightData({ hero_hp: hero.hp, monster_hp: monster.hp, turn: 'monster', winner: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doFight = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/fight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fight_id: fightId })
      });
      if (!res.ok) throw new Error('Erro ao lutar');
      const data = await res.json();
      setFightData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div>Faça login para acessar.</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!hero || !monster) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Voltar</button>
      <h2>Luta</h2>
      <div style={{display:'flex',justifyContent:'space-between',maxWidth:500}}>
        <div>
          <h3>Herói</h3>
          <div>ID: {hero.id} | Level: {hero.level} | HP: {fightData ? fightData.hero_hp : hero.hp}</div>
        </div>
        <div>
          <h3>Monstro</h3>
          <div>{monster.name} (Lv {monster.level}) | HP: {fightData ? fightData.monster_hp : monster.hp}</div>
        </div>
      </div>
      {fightData && <div>Turno: {fightData.turn} {fightData.winner && <b>Vencedor: {fightData.winner}</b>}</div>}
      {!fightId ? (
        <button onClick={startFight} disabled={loading}>{loading ? 'Iniciando...' : 'Começar Luta'}</button>
      ) : (
        <button onClick={doFight} disabled={loading || fightData?.winner}>{loading ? 'Lutando...' : 'Luta'}</button>
      )}
    </div>
  );
}
