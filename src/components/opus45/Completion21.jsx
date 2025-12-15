import React, { useState, useEffect, useMemo } from 'react';

const Completion21 = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Generate particles for seconds visualization
  const particles = useMemo(() => {
    const newParticles = [];
    for (let i = 0; i < seconds; i++) {
      // Use deterministic pseudo-random values based on index
      newParticles.push({
        id: i,
        x: (i * 17 + 7) % 100,
        delay: ((i * 13) % 20) / 10,
        duration: 3 + ((i * 11) % 20) / 10,
        size: 3 + ((i * 7) % 4),
      });
    }
    return newParticles;
  }, [seconds]);

  // Determine if it's day or night (6am - 6pm is day)
  const isDaytime = hours >= 6 && hours < 18;

  // Calculate sun/moon position based on hour
  const celestialAngle = useMemo(() => {
    const hourIn12 = hours % 12;
    // Map 0-12 hours to 0-180 degrees arc
    return (hourIn12 / 12) * 180;
  }, [hours]);

  // Calculate celestial body position on arc
  const celestialPosition = useMemo(() => {
    const angleRad = (celestialAngle * Math.PI) / 180;
    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    return {
      x: centerX - Math.cos(angleRad) * radius,
      y: centerY - Math.sin(angleRad) * radius,
    };
  }, [celestialAngle]);

  // Generate flower petals for minutes
  const flowerPetals = useMemo(() => {
    const petals = [];
    const totalPetals = 60;
    const filledPetals = minutes;

    for (let i = 0; i < totalPetals; i++) {
      const angle = (i / totalPetals) * 360 - 90;
      const isFilled = i < filledPetals;
      const isCurrentMinute = i === filledPetals - 1;

      petals.push(
        <g key={i} transform={`rotate(${angle}, 200, 350)`} style={{ transition: 'all 0.5s ease' }}>
          <ellipse
            cx={200}
            cy={290}
            rx={4}
            ry={20}
            fill={
              isFilled
                ? isCurrentMinute
                  ? '#ff6b6b'
                  : isDaytime
                    ? '#ff9ff3'
                    : '#a29bfe'
                : isDaytime
                  ? 'rgba(255, 159, 243, 0.2)'
                  : 'rgba(162, 155, 254, 0.2)'
            }
            stroke={isDaytime ? '#ff6b9d' : '#6c5ce7'}
            strokeWidth={0.5}
            style={{
              transition: 'fill 0.3s ease',
              filter: isCurrentMinute ? 'drop-shadow(0 0 5px #ff6b6b)' : 'none',
            }}
          />
        </g>
      );
    }

    return petals;
  }, [minutes, isDaytime]);

  // Particle elements (falling leaves/stars for seconds)
  const particleElements = useMemo(() => {
    return particles.map((particle) => (
      <g key={particle.id}>
        {isDaytime ? (
          <path
            d={`M ${particle.x * 4} 50 
               Q ${particle.x * 4 + 5} 55, ${particle.x * 4 + 3} 60 
               Q ${particle.x * 4 - 2} 55, ${particle.x * 4} 50`}
            fill="#27ae60"
            style={{
              animation: `fall ${particle.duration}s ease-in infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ) : (
          <circle
            cx={particle.x * 4}
            cy={30 + particle.id * 2}
            r={particle.size / 2}
            fill="#f1c40f"
            style={{
              animation: `twinkle ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        )}
      </g>
    ));
  }, [particles, isDaytime]);

  // Digital time display with nature theme
  const formatTime = (num) => num.toString().padStart(2, '0');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: isDaytime
        ? 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #7CB342 100%)'
        : 'linear-gradient(180deg, #0c0c3d 0%, #1a1a4e 50%, #2d2d6d 100%)',
      padding: '20px',
      transition: 'background 2s ease',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    title: {
      color: isDaytime ? '#2d5016' : '#f1c40f',
      marginBottom: '10px',
      fontSize: '2rem',
      textShadow: isDaytime ? '2px 2px 4px rgba(255,255,255,0.5)' : '2px 2px 4px rgba(0,0,0,0.5)',
    },
    subtitle: {
      color: isDaytime ? '#4a7023' : '#bdc3c7',
      marginBottom: '20px',
      fontSize: '1rem',
    },
    svgContainer: {
      position: 'relative',
      width: '400px',
      height: '450px',
    },
    digitalTime: {
      marginTop: '20px',
      fontSize: '1.5rem',
      color: isDaytime ? '#2d5016' : '#ecf0f1',
      fontFamily: 'monospace',
      background: isDaytime ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      padding: '10px 20px',
      borderRadius: '10px',
      backdropFilter: 'blur(5px)',
    },
    legend: {
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      color: isDaytime ? '#2d5016' : '#ecf0f1',
      fontSize: '0.9rem',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    legendIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
    },
  };

  const keyframes = `
    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(400px) rotate(360deg);
        opacity: 0;
      }
    }
    
    @keyframes twinkle {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(0.8);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        filter: drop-shadow(0 0 10px currentColor);
      }
      50% {
        filter: drop-shadow(0 0 20px currentColor);
      }
    }
  `;

  // Hour markers on arc
  const hourMarkers = useMemo(() => {
    return [...Array(13)].map((_, i) => {
      const angle = (i / 12) * 180;
      const angleRad = (angle * Math.PI) / 180;
      const x = 200 - Math.cos(angleRad) * 150;
      const y = 200 - Math.sin(angleRad) * 150;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={3} fill={isDaytime ? '#fff' : '#f1c40f'} opacity={0.6} />
          <text
            x={x}
            y={y - 10}
            textAnchor="middle"
            fill={isDaytime ? '#2d5016' : '#ecf0f1'}
            fontSize="10"
          >
            {i === 0 ? '12' : i}
          </text>
        </g>
      );
    });
  }, [isDaytime]);

  // Sun rays
  const sunRays = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const rayAngle = (i / 8) * 360;
      const rayRad = (rayAngle * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={celestialPosition.x + Math.cos(rayRad) * 30}
          y1={celestialPosition.y + Math.sin(rayRad) * 30}
          x2={celestialPosition.x + Math.cos(rayRad) * 40}
          y2={celestialPosition.y + Math.sin(rayRad) * 40}
          stroke="#f1c40f"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    });
  }, [celestialPosition]);

  // Second dots around flower
  const secondDots = useMemo(() => {
    return [...Array(seconds)].map((_, i) => {
      const segmentAngle = -90 + (i / 60) * 360;
      const segmentRad = (segmentAngle * Math.PI) / 180;
      const length = 80 + (i % 10) * 2;
      return (
        <circle
          key={i}
          cx={Math.cos(segmentRad) * length}
          cy={Math.sin(segmentRad) * length}
          r={2}
          fill={isDaytime ? '#27ae60' : '#00cec9'}
          opacity={0.5 + (i / 60) * 0.5}
        />
      );
    });
  }, [seconds, isDaytime]);

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <h1 style={styles.title}>🌿 Nature&apos;s Clock 🌿</h1>
      <p style={styles.subtitle}>Time told through the rhythms of nature</p>

      <div style={styles.svgContainer}>
        <svg width="400" height="450" viewBox="0 0 400 450" style={{ overflow: 'visible' }}>
          {/* Sky arc for sun/moon path */}
          <path
            d="M 50 200 A 150 150 0 0 1 350 200"
            fill="none"
            stroke={isDaytime ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Hour markers on arc */}
          {hourMarkers}

          {/* Sun or Moon */}
          {isDaytime ? (
            <g>
              {/* Sun */}
              <circle
                cx={celestialPosition.x}
                cy={celestialPosition.y}
                r={25}
                fill="#f1c40f"
                style={{
                  filter: 'drop-shadow(0 0 15px #f39c12)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              {/* Sun rays */}
              {sunRays}
            </g>
          ) : (
            <g>
              {/* Moon */}
              <circle
                cx={celestialPosition.x}
                cy={celestialPosition.y}
                r={25}
                fill="#f5f5dc"
                style={{ filter: 'drop-shadow(0 0 15px #bdc3c7)' }}
              />
              {/* Moon craters */}
              <circle
                cx={celestialPosition.x - 8}
                cy={celestialPosition.y - 5}
                r={5}
                fill="#e0e0d1"
              />
              <circle
                cx={celestialPosition.x + 10}
                cy={celestialPosition.y + 8}
                r={3}
                fill="#e0e0d1"
              />
              <circle
                cx={celestialPosition.x + 5}
                cy={celestialPosition.y - 10}
                r={4}
                fill="#e0e0d1"
              />
            </g>
          )}

          {/* Ground/Horizon */}
          <path
            d="M 0 220 Q 100 200, 200 220 Q 300 240, 400 220 L 400 450 L 0 450 Z"
            fill={isDaytime ? '#7CB342' : '#1a472a'}
          />

          {/* Flower center */}
          <circle
            cx={200}
            cy={350}
            r={25}
            fill={isDaytime ? '#ffeaa7' : '#74b9ff'}
            stroke={isDaytime ? '#fdcb6e' : '#0984e3'}
            strokeWidth={2}
          />
          <circle cx={200} cy={350} r={15} fill={isDaytime ? '#fdcb6e' : '#0984e3'} />

          {/* Flower petals for minutes */}
          {flowerPetals}

          {/* Seconds visualization - particles */}
          <g>{particleElements}</g>

          {/* Second hand as growing vine */}
          <g transform="translate(200, 350)">{secondDots}</g>
        </svg>
      </div>

      <div style={styles.digitalTime}>
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendIcon,
              background: isDaytime ? '#f1c40f' : '#f5f5dc',
            }}
          />
          <span>
            {isDaytime ? '☀️ Sun' : '🌙 Moon'} position = Hours ({hours % 12 || 12})
          </span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendIcon,
              background: isDaytime ? '#ff9ff3' : '#a29bfe',
            }}
          />
          <span>🌸 Flower petals = Minutes ({minutes})</span>
        </div>
        <div style={styles.legendItem}>
          <div
            style={{
              ...styles.legendIcon,
              background: isDaytime ? '#27ae60' : '#00cec9',
            }}
          />
          <span>
            {isDaytime ? '🍃 Falling leaves' : '✨ Twinkling stars'} = Seconds ({seconds})
          </span>
        </div>
      </div>
    </div>
  );
};

export default Completion21;
