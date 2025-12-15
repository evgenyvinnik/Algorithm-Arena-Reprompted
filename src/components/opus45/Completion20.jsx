import React, { useState, useEffect, useRef, useCallback } from 'react';

const Completion20 = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [rings, setRings] = useState([]);
  const [rainbowAngle, setRainbowAngle] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const buttonRef = useRef(null);
  const particleIdRef = useRef(0);

  // Continuous rainbow rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRainbowAngle((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation when hovered
  useEffect(() => {
    if (!isHovered) {
      return;
    }
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.05 : 1));
    }, 300);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Floating sparkles around the button
  useEffect(() => {
    const createSparkle = () => {
      const id = Date.now() + Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      setSparkles((prev) => [
        ...prev.slice(-15),
        {
          id,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 4 + Math.random() * 8,
          opacity: 0.5 + Math.random() * 0.5,
          color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        },
      ]);
    };

    const interval = setInterval(createSparkle, 200);
    return () => clearInterval(interval);
  }, []);

  // Clean up sparkles
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSparkles((prev) => prev.slice(1));
    }, 1500);
    return () => clearTimeout(timeout);
  }, [sparkles.length]);

  const createParticles = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newParticles = [];
    const particleCount = 30 + clickCount * 5;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = 3 + Math.random() * 8;
      const size = 5 + Math.random() * 15;
      const type = Math.random() > 0.5 ? 'star' : Math.random() > 0.5 ? 'heart' : 'circle';

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        color: `hsl(${Math.random() * 360}, 100%, ${50 + Math.random() * 30}%)`,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        type,
        life: 1,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Add explosion rings
    const newRings = [];
    for (let i = 0; i < 3; i++) {
      newRings.push({
        id: Date.now() + i,
        delay: i * 100,
        color: `hsl(${(rainbowAngle + i * 60) % 360}, 100%, 60%)`,
      });
    }
    setRings((prev) => [...prev, ...newRings]);
  }, [clickCount, rainbowAngle]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            rotation: p.rotation + p.rotationSpeed,
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  // Clean up rings
  useEffect(() => {
    if (rings.length === 0) return;
    const timeout = setTimeout(() => {
      setRings((prev) => prev.slice(1));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [rings.length]);

  const handleClick = (e) => {
    setClickCount((prev) => prev + 1);
    createParticles(e);
  };

  const renderParticle = (particle) => {
    const style = {
      position: 'absolute',
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
      opacity: particle.life,
      pointerEvents: 'none',
      filter: `drop-shadow(0 0 ${particle.size / 2}px ${particle.color})`,
    };

    if (particle.type === 'star') {
      return (
        <svg key={particle.id} style={style} viewBox="0 0 24 24">
          <polygon
            fill={particle.color}
            points="12,2 15,9 22,9 17,14 19,22 12,17 5,22 7,14 2,9 9,9"
          />
        </svg>
      );
    } else if (particle.type === 'heart') {
      return (
        <svg key={particle.id} style={style} viewBox="0 0 24 24">
          <path
            fill={particle.color}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      );
    } else {
      return (
        <div
          key={particle.id}
          style={{
            ...style,
            borderRadius: '50%',
            background: particle.color,
          }}
        />
      );
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(${rainbowAngle}deg, 
        #1a0a2e 0%, 
        #16213e 25%, 
        #0f3460 50%, 
        #16213e 75%, 
        #1a0a2e 100%)`,
      padding: '40px',
      overflow: 'hidden',
      position: 'relative',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '60px',
      textAlign: 'center',
      background: `linear-gradient(${rainbowAngle}deg, #ff0080, #ff8c00, #40e0d0, #ff0080)`,
      backgroundSize: '300% 300%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: 'none',
      filter: 'drop-shadow(0 0 20px rgba(255, 0, 128, 0.5))',
      animation: 'float 3s ease-in-out infinite',
    },
    buttonWrapper: {
      position: 'relative',
      perspective: '1000px',
    },
    button: {
      position: 'relative',
      padding: '25px 80px',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#fff',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      outline: 'none',
      transform: `
        scale(${pulseScale}) 
        rotateX(${isPressed ? 15 : isHovered ? -5 : 0}deg) 
        rotateY(${isHovered ? 5 : 0}deg)
        translateZ(${isPressed ? -20 : isHovered ? 30 : 0}px)
      `,
      transition: 'transform 0.2s ease',
      background: `
        linear-gradient(${rainbowAngle}deg, 
          #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)
      `,
      backgroundSize: '400% 400%',
      boxShadow: `
        0 0 20px rgba(255, 0, 128, 0.5),
        0 0 40px rgba(255, 140, 0, 0.3),
        0 0 60px rgba(64, 224, 208, 0.3),
        0 10px 30px rgba(0, 0, 0, 0.5),
        inset 0 -5px 20px rgba(0, 0, 0, 0.3),
        inset 0 5px 20px rgba(255, 255, 255, 0.3)
      `,
      textShadow: `
        0 0 10px rgba(255, 255, 255, 0.8),
        0 0 20px rgba(255, 255, 255, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.5)
      `,
      overflow: 'visible',
      zIndex: 10,
    },
    buttonText: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    glowOrb: {
      position: 'absolute',
      width: '200%',
      height: '200%',
      top: '-50%',
      left: '-50%',
      background: `radial-gradient(circle, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%)`,
      pointerEvents: 'none',
      animation: 'orbRotate 5s linear infinite',
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      animation: 'shimmer 2s infinite',
      borderRadius: '25px',
    },
    sparklesContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 0,
      height: 0,
      pointerEvents: 'none',
    },
    sparkle: (sparkle) => ({
      position: 'absolute',
      left: sparkle.x,
      top: sparkle.y,
      width: sparkle.size,
      height: sparkle.size,
      borderRadius: '50%',
      background: sparkle.color,
      boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
      opacity: sparkle.opacity,
      animation: 'twinkle 1.5s ease-in-out infinite',
      transform: 'translate(-50%, -50%)',
    }),
    ring: (ring) => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: `4px solid ${ring.color}`,
      boxShadow: `0 0 20px ${ring.color}, inset 0 0 20px ${ring.color}`,
      animation: `ringExpand 0.8s ease-out ${ring.delay}ms forwards`,
      opacity: 0,
      pointerEvents: 'none',
    }),
    particlesContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
    },
    clickCounter: {
      marginTop: '40px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: `0 0 10px rgba(255, 0, 128, 0.8)`,
      animation: clickCount > 0 ? 'bounce 0.3s ease' : 'none',
    },
    crown: {
      position: 'absolute',
      top: '-40px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '40px',
      filter: 'drop-shadow(0 0 10px gold)',
      animation: 'crownBounce 1s ease-in-out infinite',
    },
    wings: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '50px',
      opacity: isHovered ? 1 : 0.3,
      transition: 'all 0.3s ease',
      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
    },
    leftWing: {
      left: '-60px',
      animation: 'wingFlap 0.5s ease-in-out infinite',
    },
    rightWing: {
      right: '-60px',
      animation: 'wingFlap 0.5s ease-in-out infinite reverse',
    },
    gems: {
      position: 'absolute',
      fontSize: '20px',
      animation: 'gemFloat 2s ease-in-out infinite',
    },
    rainbowTrail: {
      position: 'absolute',
      top: '-10px',
      left: '-10px',
      right: '-10px',
      bottom: '-10px',
      borderRadius: '30px',
      background: `linear-gradient(${rainbowAngle}deg, 
        rgba(255, 0, 128, 0.3), 
        rgba(255, 140, 0, 0.3), 
        rgba(64, 224, 208, 0.3), 
        rgba(123, 104, 238, 0.3))`,
      filter: 'blur(15px)',
      zIndex: -1,
      animation: 'pulse 2s ease-in-out infinite',
    },
  };

  const keyframes = `
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 200%; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    }
    @keyframes ringExpand {
      0% { width: 50px; height: 50px; opacity: 1; }
      100% { width: 400px; height: 400px; opacity: 0; }
    }
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes crownBounce {
      0%, 100% { transform: translateX(-50%) translateY(0) rotate(-5deg); }
      50% { transform: translateX(-50%) translateY(-10px) rotate(5deg); }
    }
    @keyframes wingFlap {
      0%, 100% { transform: translateY(-50%) rotate(0deg) scaleX(1); }
      50% { transform: translateY(-50%) rotate(15deg) scaleX(0.9); }
    }
    @keyframes gemFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    @keyframes orbRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <h1 style={styles.title}>✨ Extravagant Button ✨</h1>

      <div style={styles.buttonWrapper}>
        {/* Sparkles around button */}
        <div style={styles.sparklesContainer}>
          {sparkles.map((sparkle) => (
            <div key={sparkle.id} style={styles.sparkle(sparkle)} />
          ))}
        </div>

        {/* Explosion rings */}
        {rings.map((ring) => (
          <div key={ring.id} style={styles.ring(ring)} />
        ))}

        <button
          ref={buttonRef}
          style={styles.button}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onClick={handleClick}
        >
          {/* Rainbow glow trail */}
          <div style={styles.rainbowTrail} />

          {/* Glow orb */}
          <div style={styles.glowOrb} />

          {/* Shimmer effect */}
          <div style={styles.shimmer} />

          {/* Crown */}
          <div style={styles.crown}>👑</div>

          {/* Wings */}
          <div style={{ ...styles.wings, ...styles.leftWing }}>🦋</div>
          <div style={{ ...styles.wings, ...styles.rightWing }}>🦋</div>

          {/* Gems around button */}
          <div style={{ ...styles.gems, top: '-25px', left: '20%' }}>💎</div>
          <div style={{ ...styles.gems, top: '-25px', right: '20%', animationDelay: '0.5s' }}>
            💎
          </div>
          <div style={{ ...styles.gems, bottom: '-25px', left: '30%', animationDelay: '1s' }}>
            ✨
          </div>
          <div style={{ ...styles.gems, bottom: '-25px', right: '30%', animationDelay: '1.5s' }}>
            ✨
          </div>

          {/* Button text */}
          <span style={styles.buttonText}>🌟 CLICK ME 🌟</span>

          {/* Particle container */}
          <div style={styles.particlesContainer}>{particles.map(renderParticle)}</div>
        </button>
      </div>

      <div style={styles.clickCounter} key={clickCount}>
        🎉 Clicks: {clickCount} 🎉
      </div>

      {clickCount >= 10 && (
        <div
          style={{
            marginTop: '20px',
            fontSize: '20px',
            color: '#ffd700',
            animation: 'float 2s ease-in-out infinite',
            textShadow: '0 0 20px gold',
          }}
        >
          🏆 You're a clicking champion! 🏆
        </div>
      )}

      {clickCount >= 25 && (
        <div
          style={{
            marginTop: '10px',
            fontSize: '24px',
            color: '#ff69b4',
            animation: 'bounce 0.5s ease infinite',
            textShadow: '0 0 30px #ff69b4',
          }}
        >
          🔥 UNSTOPPABLE! 🔥
        </div>
      )}
    </div>
  );
};

export default Completion20;
