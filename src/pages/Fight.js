import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Fight({ token }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fight_id = location.state?.fight_id;
  // Removendo o fight_id dos dados iniciais da luta
  const { fight_id: _, ...initialFightData } = location.state || {};
  const [fightData, setFightData] = useState(initialFightData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doFight = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/fight/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ fight_id })
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
  if (!fight_id) return <div>Luta não iniciada corretamente.</div>;
  if (!fightData) return <div>Dados da luta não disponíveis.</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <button onClick={() => navigate('/dashboard')}>Voltar</button>
      <h2>Luta</h2>
      <div style={{display:'flex', justifyContent:'space-between', maxWidth:500, margin:'20px auto'}}>
        <div>
          <h3>Herói</h3>
          <div>HP: {fightData.hero_hp}/{fightData.hero_max_hp}</div>
        </div>
        <div style={{textAlign:'center', marginTop:'20px'}}>
          <div style={{fontWeight:'bold'}}>Turno: {fightData.turn === 'hero' ? 'Herói' : 'Monstro'}</div>
        </div>
        <div>
          <h3>Monstro</h3>
          <div>HP: {fightData.monster_hp}/{fightData.monster_max_hp}</div>
        </div>
      </div>
      {fightData.winner ? (
        <div style={{textAlign:'center', marginTop:'20px'}}>
          <h3>Vencedor: {fightData.winner === 'hero' ? 'Herói' : 'Monstro'}</h3>
        </div>
      ) : (
        <div style={{textAlign:'center', marginTop:'20px'}}>
          <button 
            onClick={doFight} 
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Lutando...' : 'Ataque do ' + (fightData.turn === 'hero' ? 'Herói' : 'Monstro')}
          </button>
        </div>
      )}
    </div>
  );
}
