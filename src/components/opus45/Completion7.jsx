import React, { useState, useEffect, useRef, useCallback } from 'react';

// Sample data: Scores over time for different entities
const generateSampleData = () => {
  const entities = [
    { id: 1, name: 'Magnus Carlsen', color: '#FF6B6B' },
    { id: 2, name: 'Garry Kasparov', color: '#4ECDC4' },
    { id: 3, name: 'Bobby Fischer', color: '#45B7D1' },
    { id: 4, name: 'Anatoly Karpov', color: '#96CEB4' },
    { id: 5, name: 'Viswanathan Anand', color: '#FFEAA7' },
    { id: 6, name: 'Vladimir Kramnik', color: '#DDA0DD' },
    { id: 7, name: 'Mikhail Tal', color: '#98D8C8' },
    { id: 8, name: 'Jose Capablanca', color: '#F7DC6F' },
    { id: 9, name: 'Emanuel Lasker', color: '#BB8FCE' },
    { id: 10, name: 'Fabiano Caruana', color: '#85C1E9' },
  ];

  // Generate timeline data from 1970 to 2024
  const years = [];
  for (let year = 1970; year <= 2024; year++) {
    years.push(year);
  }

  const timelineData = years.map((year) => {
    const scores = entities.map((entity) => {
      // Generate realistic-looking ELO ratings based on player's era
      let baseScore = 2400;
      let variation = Math.random() * 100 - 50;

      switch (entity.name) {
        case 'Bobby Fischer':
          baseScore =
            year >= 1970 && year <= 1975 ? 2780 + (year - 1970) * 5 : 2650 - (year - 1975) * 10;
          break;
        case 'Garry Kasparov':
          baseScore =
            year >= 1985 && year <= 2005 ? 2800 + Math.sin((year - 1985) * 0.3) * 50 : 2600;
          break;
        case 'Anatoly Karpov':
          baseScore =
            year >= 1975 && year <= 1995 ? 2750 + Math.sin((year - 1975) * 0.2) * 40 : 2550;
          break;
        case 'Magnus Carlsen':
          baseScore = year >= 2004 ? 2600 + (year - 2004) * 15 : 2400;
          if (year >= 2013) baseScore = Math.min(baseScore, 2880);
          break;
        case 'Viswanathan Anand':
          baseScore =
            year >= 1988 && year <= 2015 ? 2750 + Math.sin((year - 1988) * 0.25) * 50 : 2600;
          break;
        case 'Vladimir Kramnik':
          baseScore =
            year >= 1992 && year <= 2018 ? 2780 + Math.sin((year - 1992) * 0.2) * 40 : 2550;
          break;
        case 'Mikhail Tal':
          baseScore =
            year >= 1970 && year <= 1990 ? 2650 + Math.sin((year - 1970) * 0.3) * 50 : 2500;
          break;
        case 'Jose Capablanca':
          baseScore = year <= 1980 ? 2600 - (year - 1970) * 20 : 2400;
          break;
        case 'Emanuel Lasker':
          baseScore = year <= 1980 ? 2550 - (year - 1970) * 25 : 2300;
          break;
        case 'Fabiano Caruana':
          baseScore = year >= 2007 ? 2500 + (year - 2007) * 20 : 2400;
          if (year >= 2018) baseScore = Math.min(baseScore, 2840);
          break;
        default:
          baseScore = 2500;
      }

      return {
        ...entity,
        score: Math.max(2300, Math.round(baseScore + variation)),
      };
    });

    return {
      year,
      scores: scores.sort((a, b) => b.score - a.score),
    };
  });

  return timelineData;
};

const Completion7 = () => {
  const [timelineData] = useState(generateSampleData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [maxBars, setMaxBars] = useState(8);
  const animationRef = useRef(null);
  const [prevScores, setPrevScores] = useState({});

  const currentData = timelineData[currentIndex];
  const maxScore = Math.max(...currentData.scores.map((s) => s.score));

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timelineData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, speed, timelineData.length]);

  // Track previous scores for animation
  useEffect(() => {
    const newPrevScores = {};
    currentData.scores.forEach((item, index) => {
      newPrevScores[item.id] = { score: item.score, rank: index };
    });
    setPrevScores(newPrevScores);
  }, [currentData]);

  const togglePlay = useCallback(() => {
    if (currentIndex >= timelineData.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentIndex, timelineData.length]);

  const handleSliderChange = useCallback((e) => {
    setCurrentIndex(parseInt(e.target.value, 10));
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      color: '#fff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#aaa',
    },
    yearDisplay: {
      fontSize: '4rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '20px',
      color: '#667eea',
      textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
    },
    chartContainer: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '30px',
      marginBottom: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    barWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      height: '45px',
      transition: 'all 0.4s ease-out',
    },
    rank: {
      width: '30px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#888',
      textAlign: 'center',
    },
    name: {
      width: '150px',
      fontSize: '0.9rem',
      fontWeight: '600',
      paddingRight: '15px',
      textAlign: 'right',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    barContainer: {
      flex: 1,
      height: '35px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
    },
    bar: {
      height: '100%',
      borderRadius: '8px',
      transition: 'width 0.4s ease-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    },
    score: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
      minWidth: '50px',
      textAlign: 'right',
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
    },
    button: {
      padding: '12px 30px',
      fontSize: '1rem',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    },
    secondaryButton: {
      padding: '12px 25px',
      fontSize: '1rem',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      transition: 'all 0.3s ease',
    },
    slider: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
      background: 'rgba(255, 255, 255, 0.2)',
      outline: 'none',
      cursor: 'pointer',
      WebkitAppearance: 'none',
    },
    sliderContainer: {
      width: '100%',
      padding: '0 10px',
    },
    settingsRow: {
      display: 'flex',
      gap: '30px',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    settingGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    label: {
      fontSize: '0.9rem',
      color: '#aaa',
    },
    select: {
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Chess Rating Timeline</h1>
        <p style={styles.subtitle}>Top Chess Players by ELO Rating (1970-2024)</p>
      </div>

      <div style={styles.yearDisplay}>{currentData.year}</div>

      <div style={styles.chartContainer}>
        {currentData.scores.slice(0, maxBars).map((item, index) => {
          const barWidth = (item.score / maxScore) * 100;
          const prevRank = prevScores[item.id]?.rank ?? index;

          return (
            <div
              key={item.id}
              style={{
                ...styles.barWrapper,
                transform: `translateY(${(index - prevRank) * 0}px)`,
              }}
            >
              <div style={styles.rank}>{index + 1}</div>
              <div style={styles.name}>{item.name}</div>
              <div style={styles.barContainer}>
                <div
                  style={{
                    ...styles.bar,
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                  }}
                >
                  <span style={styles.score}>{item.score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.controls}>
        <button
          style={styles.button}
          onClick={togglePlay}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button
          style={styles.secondaryButton}
          onClick={reset}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div style={styles.sliderContainer}>
        <input
          type="range"
          min="0"
          max={timelineData.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          style={styles.slider}
        />
      </div>

      <div style={{ ...styles.controls, marginTop: '20px' }}>
        <div style={styles.settingsRow}>
          <div style={styles.settingGroup}>
            <span style={styles.label}>Speed:</span>
            <select
              style={styles.select}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            >
              <option value={1000}>Slow (1s)</option>
              <option value={500}>Normal (0.5s)</option>
              <option value={250}>Fast (0.25s)</option>
              <option value={100}>Very Fast (0.1s)</option>
            </select>
          </div>
          <div style={styles.settingGroup}>
            <span style={styles.label}>Show top:</span>
            <select
              style={styles.select}
              value={maxBars}
              onChange={(e) => setMaxBars(parseInt(e.target.value, 10))}
            >
              <option value={5}>5 players</option>
              <option value={8}>8 players</option>
              <option value={10}>10 players</option>
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#666',
          fontSize: '0.8rem',
        }}
      >
        <p>📊 Animated Bar Chart Race - Scores Timeline</p>
        <p>Data shown is for demonstration purposes only</p>
      </div>
    </div>
  );
};

export default Completion7;
