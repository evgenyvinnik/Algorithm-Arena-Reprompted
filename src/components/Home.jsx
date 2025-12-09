import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const gemini3Completions = Array.from({ length: 36 }, (_, i) => i + 1);
  const opus45Completions = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Algorithm Arena Reprompted</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Gemini 3 Column */}
        <div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px'
          }}>
            Gemini 3
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gemini3Completions.map((num) => (
              <Link
                key={num}
                to={`/gemini3/${num}`}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  textDecoration: 'none',
                  color: '#1976d2',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              >
                Completion {num}
              </Link>
            ))}
          </div>
        </div>

        {/* Opus 4.5 Column */}
        <div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#fce4ec',
            borderRadius: '8px'
          }}>
            Opus 4.5
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {opus45Completions.map((num) => (
              <Link
                key={num}
                to={`/opus45/${num}`}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  textDecoration: 'none',
                  color: '#c2185b',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  textAlign: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              >
                Completion {num}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
