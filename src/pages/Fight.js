import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { fetchWithAuth, handleApiError } from '../utils/api';

export default function Fight({ token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fight_id = location.state?.fight_id;
  const { fight_id: _, ...initialFightData } = location.state || {};
  const [fightData, setFightData] = useState(initialFightData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doFight = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/fight/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ fight_id })
      });
      
      if (!res.ok) throw { status: res.status, message: 'Erro ao lutar' };
      
      const data = await res.json();
      setFightData(data);
    } catch (err) {
      handleApiError(err, navigate);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (!token) return <div className="message">Faça login para acessar.</div>;
  if (!fight_id) return <div className="message">Luta não iniciada corretamente.</div>;
  if (!fightData) return <div className="message">Dados da luta não disponíveis.</div>;
  if (error) return <div style={{ color: '#e74c3c', textAlign: 'center', padding: '20px' }}>{error}</div>;

  const calculateHealthPercentage = (current, max) => {
    return (current / max) * 100;
  };

  const getHealthColor = (percentage) => {
    if (percentage > 60) return '#27ae60';
    if (percentage > 30) return '#f1c40f';
    return '#e74c3c';
  };

  const heroHealthPercentage = calculateHealthPercentage(fightData.hero_hp, fightData.hero_max_hp);
  const monsterHealthPercentage = calculateHealthPercentage(fightData.monster_hp, fightData.monster_max_hp);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Voltar para o Dashboard
        </button>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </div>

      <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px' }}>Arena de Combate</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '20px',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Herói */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Herói</h3>
          <div style={{ 
            width: '100%', 
            height: '20px', 
            backgroundColor: '#ecf0f1',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              width: `${heroHealthPercentage}%`,
              height: '100%',
              backgroundColor: getHealthColor(heroHealthPercentage),
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
          <div style={{ color: '#34495e' }}>
            {fightData.hero_hp}/{fightData.hero_max_hp} HP
          </div>
        </div>

        {/* Indicador de Turno */}
        <div style={{ 
          textAlign: 'center',
          backgroundColor: '#34495e',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px'
        }}>
          Turno do {fightData.turn === 'hero' ? 'Herói' : 'Monstro'}
        </div>

        {/* Monstro */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Monstro</h3>
          <div style={{ 
            width: '100%', 
            height: '20px', 
            backgroundColor: '#ecf0f1',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              width: `${monsterHealthPercentage}%`,
              height: '100%',
              backgroundColor: getHealthColor(monsterHealthPercentage),
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
          <div style={{ color: '#34495e' }}>
            {fightData.monster_hp}/{fightData.monster_max_hp} HP
          </div>
        </div>
      </div>

      {fightData.winner ? (
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: fightData.winner === 'hero' ? '#27ae60' : '#e74c3c',
          color: 'white',
          borderRadius: '8px',
          animation: 'fadeIn 0.5s ease'
        }}>
          <h3 style={{ margin: 0 }}>
            {fightData.winner === 'hero' ? 'Vitória do Herói!' : 'Vitória do Monstro!'}
          </h3>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={doFight} 
            disabled={loading}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Lutando...' : `Ataque do ${fightData.turn === 'hero' ? 'Herói' : 'Monstro'}`}
          </button>
        </div>
      )}
    </div>
  );
}
