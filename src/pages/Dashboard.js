import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { fetchWithAuth, handleApiError } from '../utils/api';
import '../styles/dashboard.css';

export default function Dashboard({ token, onLogout }) {
  const [hero, setHero] = useState(null);
  const [monsters, setMonsters] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  useEffect(() => {
    if (!token) return;
    
    const loadData = async () => {
      try {
        // Carregando herói
        const heroRes = await fetchWithAuth(`${API_BASE_URL}/api/hero/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!heroRes.ok) throw { status: heroRes.status, message: 'Erro ao carregar herói' };
        const heroData = await heroRes.json();
        setHero(heroData);

        // Carregando monstros
        const monstersRes = await fetchWithAuth(`${API_BASE_URL}/api/monsters/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!monstersRes.ok) throw { status: monstersRes.status, message: 'Erro ao carregar monstros' };
        const monstersData = await monstersRes.json();
        setMonsters(monstersData.results || []);
      } catch (err) {
        handleApiError(err, navigate);
        setError(err.message);
      }
    };

    loadData();
  }, [token, navigate]);

  const startFight = async (monsterId) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/start-fight/`, {
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
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 400 && errorData.error === 'Hero is not alive') {
          throw { status: 400, message: 'Seu herói está sem HP para lutar! Ele precisa dormir para se recuperar.' };
        }
        throw { status: res.status, message: 'Erro ao iniciar luta' };
      }
      
      const data = await res.json();
      const monster = monsters.find(m => m.id === monsterId);
      
      navigate('/fight', { 
        state: { 
          fight_id: data.fight_id,
          hero_hp: data.hero_hp,
          monster_hp: data.monster_hp,
          turn: data.turn,
          winner: data.winner,
          hero_max_hp: data.hero_max_hp,
          monster_max_hp: data.monster_max_hp,
          monster_image_url: monster?.image_url
        } 
      });
    } catch (err) {
      handleApiError(err, navigate);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="message">Faça login para acessar.</div>;
  if (!hero || !monsters) return <div className="message">Carregando...</div>;

  return (
    <div className="dashboard-container">
      {error && <div className="top-error">{error}</div>}
      
      <div className="header-container">
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Sair
        </button>
      </div>

      <div className="hero-card">
        <h2>Seu Herói</h2>
        <div className="hero-level">
          Nível {hero.level}
        </div>
        <div className="hero-stats">
          <p>Nome: {hero.name}</p>
          <p className={`hero-hp ${Math.max(0, hero.hp) === 0 ? 'zero' : ''}`}>
            HP: {Math.max(0, hero.hp)} / {hero.max_hp}
          </p>
        </div>
      </div>

      <div>
        <h2>Monstros Disponíveis</h2>
        <div className="monsters-grid">
          {monsters.map(monster => (
            <div key={monster.id} className="monster-card">
              {monster.image_url ? (
                <img 
                  src={monster.image_url} 
                  alt={monster.name} 
                  className="monster-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="monster-image-fallback">
                  {monster.name[0]}
                </div>
              )}
              <h3>{monster.name}</h3>
              <div className="monster-stats">
                <p>HP: {Math.max(0, monster.hp)}</p>
                <p>Ataque: {monster.attack}</p>
                <p>Defesa: {monster.defense}</p>
              </div>
              <button
                onClick={() => startFight(monster.id)}
                disabled={loading}
                className="fight-button"
              >
                {loading ? 'Iniciando...' : 'Lutar!'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
