import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { fetchWithAuth, handleApiError } from '../utils/api';
import '../styles/fight.css';

export default function Fight({ token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fight_id = location.state?.fight_id;
  const { fight_id: _, ...initialFightData } = location.state || {};
  const [fightData, setFightData] = useState(initialFightData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

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

  if (!token) return <div className="message">Faça login para acessar.</div>;
  if (!fight_id) return <div className="message">Luta não iniciada corretamente.</div>;
  if (!fightData) return <div className="message">Dados da luta não disponíveis.</div>;
  if (error) return <div className="error-message">{error}</div>;

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
    <div className="fight-container">
      <div className="header-buttons">
        <button 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          ← Voltar para o Dashboard
        </button>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Sair
        </button>
      </div>

      <h2 className="arena-title">Arena de Combate</h2>

      <div className="fight-arena">
        {/* Herói */}
        <div className="character-info">
          <h3 className="character-title">Herói</h3>
          <div className="character-image-fallback">
            H
          </div>
          <div className="health-bar">
            <div 
              className="health-bar-fill"
              style={{
                width: `${heroHealthPercentage}%`,
                backgroundColor: getHealthColor(heroHealthPercentage)
              }}
            />
          </div>
          <div className="health-text">
            {fightData.hero_hp} / {fightData.hero_max_hp} HP
          </div>
        </div>

        {/* VS */}
        <div className="versus-text">
          VS
        </div>

        {/* Monstro */}
        <div className="character-info">
          <h3 className="character-title">Monstro</h3>
          {location.state?.monster_image_url ? (
            <img 
              src={location.state.monster_image_url} 
              alt="Monstro" 
              className="character-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="character-image-fallback">
              M
            </div>
          )}
          <div className="health-bar">
            <div 
              className="health-bar-fill"
              style={{
                width: `${monsterHealthPercentage}%`,
                backgroundColor: getHealthColor(monsterHealthPercentage)
              }}
            />
          </div>
          <div className="health-text">
            {fightData.monster_hp} / {fightData.monster_max_hp} HP
          </div>
        </div>
      </div>

      {fightData.winner ? (
        <>
          <div className="winner-message">
            Vencedor: {fightData.winner}!
          </div>
          <Link to="/dashboard" className="return-link">
            Retornar ao Dashboard
          </Link>
        </>
      ) : (
        <button
          onClick={doFight}
          disabled={loading}
          className="action-button"
        >
          {loading ? 'Lutando...' : `${fightData.turn} Atacar!`}
        </button>
      )}
    </div>
  );
}
