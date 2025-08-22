import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { fetchWithAuth, handleApiError } from '../utils/api';

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
      
      if (!res.ok) throw { status: res.status, message: 'Erro ao iniciar luta' };
      
      const data = await res.json();
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
      handleApiError(err, navigate);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="message">Faça login para acessar.</div>;
  if (!hero || !monsters) return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>;
  if (error) return <div style={{ color: '#e74c3c', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '20px' 
      }}>
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

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Seu Herói</h2>
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          fontSize: '16px',
          color: '#34495e'
        }}>
          <div>Nível: {hero.level}</div>
          <div>
            HP: <span style={{ color: '#e74c3c' }}>{hero.hp}</span>/<span style={{ color: '#27ae60' }}>{hero.max_hp}</span>
          </div>
        </div>
      </div>

      <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Monstros Disponíveis</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        {monsters && monsters.length > 0 ? monsters.map(m => (
          <div key={m.id} style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <h3 style={{ color: '#2c3e50', margin: 0 }}>{m.name}</h3>
            <div style={{ fontSize: '14px', color: '#34495e' }}>
              <div>Nível: {m.level}</div>
              <div>HP: {m.hp}</div>
              <div>Ataque: {m.attack}</div>
              <div>Defesa: {m.defense}</div>
              <div>EXP: {m.exp_earn}</div>
            </div>
            <button 
              onClick={() => startFight(m.id)}
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Iniciando luta...' : 'Lutar!'}
            </button>
          </div>
        )) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '20px',
            color: '#7f8c8d'
          }}>
            Nenhum monstro disponível no momento.
          </div>
        )}
      </div>
    </div>
  );
}
