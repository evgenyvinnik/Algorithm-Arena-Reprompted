import React, { useState, useEffect, useRef } from 'react';

// Generates random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Initial Data: Programming Languages
const INITIAL_DATA = [
  { id: 'js', name: 'JavaScript', color: '#f7df1e', score: 1000 },
  { id: 'py', name: 'Python', color: '#3776ab', score: 950 },
  { id: 'java', name: 'Java', color: '#007396', score: 900 },
  { id: 'cpp', name: 'C++', color: '#00599c', score: 850 },
  { id: 'cs', name: 'C#', color: '#239120', score: 800 },
  { id: 'ts', name: 'TypeScript', color: '#3178c6', score: 750 },
  { id: 'php', name: 'PHP', color: '#777bb4', score: 700 },
  { id: 'swift', name: 'Swift', color: '#f05138', score: 650 },
  { id: 'go', name: 'Go', color: '#00add8', score: 600 },
  { id: 'rb', name: 'Ruby', color: '#cc342d', score: 550 },
  { id: 'rust', name: 'Rust', color: '#dea584', score: 500 },
  { id: 'c', name: 'C', color: '#a8b9cc', score: 450 },
  { id: 'kt', name: 'Kotlin', color: '#7f52ff', score: 400 },
  { id: 'dart', name: 'Dart', color: '#00b4ab', score: 350 },
  { id: 'scala', name: 'Scala', color: '#dc322f', score: 300 },
];

const Completion7 = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [year, setYear] = useState(2000); // Fictional timeline start
  const requestRef = useRef();

  // Sort data descending by score
  const sortedData = [...data].sort((a, b) => b.score - a.score);
  const maxScore = sortedData[0].score;

  // Simulate tick
  const tick = () => {
    setData(prevData => {
      return prevData.map(item => ({
        ...item,
        // Randomly increase score, weighted slightly by current rank to make it interesting but allowing upsets
        score: item.score + Math.floor(Math.random() * 50)
      }));
    });
    setYear(prev => prev + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        tick();
      }, 500); // Update every 500ms
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setData(INITIAL_DATA);
    setYear(2000);
  };

  // Get top 12 for display
  const topItems = sortedData.slice(0, 12);
  // Create a map to find rank (index) for absolute positioning
  const idToRank = new Map();
  topItems.forEach((item, index) => idToRank.set(item.id, index));

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '40px',
      borderRadius: '12px',
      minHeight: '600px',
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Popularity Timeline</h2>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: '#444', marginTop: '10px' }}>{year}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '12px 24px',
              backgroundColor: isPlaying ? '#ff4d4f' : '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            {isPlaying ? 'Pause' : 'Start Race'}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', height: '600px' }}>
        {data.map((item) => {
          // If item is not in top 12, don't render or render hidden?
          // To animate entering/leaving, it's better to render but fade out/move down.
          // For simplicity, we only render if in idToRank map (or just keep all in DOM but hidden - better for React keys)
          
          const rank = idToRank.get(item.id);
          const isVisible = rank !== undefined;
          
          // Layout constants
          const rowHeight = 45;
          const barHeight = 35;
          const maxBarWidth = 600; // max width in px
          
          const width = (item.score / maxScore) * 100 + '%';
          const top = isVisible ? rank * rowHeight : 600; // Drop to bottom if not in list
          
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: 0,
                width: '100%',
                height: `${barHeight}px`,
                transition: 'top 0.5s ease-in-out, opacity 0.5s ease-in-out',
                opacity: isVisible ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none' // allow clicks through if needed
              }}
            >
              <div 
                style={{
                  width: width,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '0 4px 4px 0',
                  transition: 'width 0.5s linear',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '10px',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                  minWidth: '1px' // ensure visibility
                }}
              >
                {/* Optional: Icon could go here */}
              </div>
              
              <div style={{ 
                marginLeft: '12px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
              }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</span>
                <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{item.score.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        button:hover {
          filter: brightness(1.1);
        }
        button:active {
          transform: translateY(1px);
        }
      `}</style>
    </div>
  );
};

export default Completion7;
