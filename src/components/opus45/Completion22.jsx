import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

const Completion22 = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const attractorRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [colorScheme, setColorScheme] = useState(0);
  const [effectMode, setEffectMode] = useState(0);

  const colorSchemes = useMemo(
    () => [
      // Neon Cyberpunk
      ['#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#00ff80'],
      // Fire & Ice
      ['#ff4400', '#ff8800', '#00aaff', '#0044ff', '#ffffff'],
      // Aurora
      ['#00ff88', '#00ffcc', '#ff00aa', '#aa00ff', '#ffff00'],
      // Deep Ocean
      ['#0066ff', '#00ccff', '#00ffaa', '#ffffff', '#0088aa'],
      // Sunset
      ['#ff0055', '#ff6600', '#ffcc00', '#ff0088', '#ff3300'],
    ],
    []
  );

  const initParticles = useCallback((width, height) => {
    const particles = [];
    const numParticles = 300;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 8 + 2,
        baseSize: Math.random() * 8 + 2,
        colorIndex: Math.floor(Math.random() * 5),
        phase: Math.random() * Math.PI * 2,
        trail: [],
      });
    }

    particlesRef.current = particles;
  }, []);

  const enableAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      setIsAudioEnabled(true);
    } catch (err) {
      console.log('Audio not available:', err);
    }
  };

  const getAudioIntensity = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return intensity;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    return sum / (dataArrayRef.current.length * 255);
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
      attractorRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      attractorRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const currentIntensity = isAudioEnabled ? getAudioIntensity() : intensity;
      const colors = colorSchemes[colorScheme];

      // Clear with fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + currentIntensity * 0.1})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate attractor in circular motion when not using mouse
      const autoAttractor = {
        x: canvas.width / 2 + Math.cos(time * 0.5) * canvas.width * 0.3,
        y: canvas.height / 2 + Math.sin(time * 0.7) * canvas.height * 0.3,
      };

      // Draw background effects based on mode
      if (effectMode === 0 || effectMode === 2) {
        // Radial burst effect
        const numRays = 24;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2 + time * 0.3;
          const length = (100 + Math.sin(time * 3 + i) * 50) * (1 + currentIntensity);

          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, canvas.height / 2);
          ctx.lineTo(
            canvas.width / 2 + Math.cos(angle) * length * 3,
            canvas.height / 2 + Math.sin(angle) * length * 3
          );

          const gradient = ctx.createLinearGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2 + Math.cos(angle) * length * 3,
            canvas.height / 2 + Math.sin(angle) * length * 3
          );
          gradient.addColorStop(0, colors[i % 5] + '88');
          gradient.addColorStop(1, 'transparent');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3 + currentIntensity * 10;
          ctx.stroke();
        }
      }

      if (effectMode === 1 || effectMode === 2) {
        // Circular rings
        for (let i = 0; i < 5; i++) {
          const radius = ((time * 100 + i * 80) % 400) * (1 + currentIntensity * 0.5);
          const alpha = 1 - radius / 400;

          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          ctx.strokeStyle =
            colors[i] +
            Math.floor(alpha * 200)
              .toString(16)
              .padStart(2, '0');
          ctx.lineWidth = 3 + currentIntensity * 5;
          ctx.stroke();
        }
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Attractor force
        const dx = attractorRef.current.x - particle.x;
        const dy = attractorRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Auto attractor influence
        const adx = autoAttractor.x - particle.x;
        const ady = autoAttractor.y - particle.y;
        const adist = Math.sqrt(adx * adx + ady * ady);

        const force = 0.5 + currentIntensity * 2;

        if (dist > 5) {
          particle.vx += (dx / dist) * force * 0.1;
          particle.vy += (dy / dist) * force * 0.1;
        }

        if (adist > 5) {
          particle.vx += (adx / adist) * force * 0.05;
          particle.vy += (ady / adist) * force * 0.05;
        }

        // Add some turbulence
        particle.vx += Math.sin(time * 2 + particle.phase) * 0.2 * currentIntensity;
        particle.vy += Math.cos(time * 2 + particle.phase) * 0.2 * currentIntensity;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Clamp position
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Update trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 15) particle.trail.shift();

        // Pulsating size based on intensity
        particle.size =
          particle.baseSize *
          (1 + Math.sin(time * 5 + particle.phase) * 0.3 + currentIntensity * 2);

        // Draw trail
        if (particle.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          const trailGradient = ctx.createLinearGradient(
            particle.trail[0].x,
            particle.trail[0].y,
            particle.x,
            particle.y
          );
          trailGradient.addColorStop(0, 'transparent');
          trailGradient.addColorStop(1, colors[particle.colorIndex] + '88');
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = particle.size * 0.5;
          ctx.stroke();
        }

        // Draw particle with glow
        const glowSize = particle.size * (2 + currentIntensity * 3);
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        );
        gradient.addColorStop(0, colors[particle.colorIndex]);
        gradient.addColorStop(0.3, colors[particle.colorIndex] + 'aa');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections to nearby particles
        for (let j = index + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const cdx = particle.x - other.x;
          const cdy = particle.y - other.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 80 + currentIntensity * 50) {
            const alpha = (1 - cdist / (80 + currentIntensity * 50)) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle =
              colors[particle.colorIndex] +
              Math.floor(alpha * 255)
                .toString(16)
                .padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      // Draw central glow
      const centerGlow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        200 + currentIntensity * 200
      );
      centerGlow.addColorStop(0, colors[Math.floor(time) % 5] + '44');
      centerGlow.addColorStop(0.5, colors[(Math.floor(time) + 2) % 5] + '22');
      centerGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 200 + currentIntensity * 200, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [
    colorScheme,
    effectMode,
    intensity,
    isAudioEnabled,
    initParticles,
    colorSchemes,
    getAudioIntensity,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#000',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Controls Panel */}
      <div
        style={{
          padding: '15px 20px',
          background: 'linear-gradient(180deg, rgba(20,20,30,0.95) 0%, rgba(10,10,15,0.9) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: '25px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            textShadow: '0 0 20px rgba(255,0,255,0.5)',
          }}
        >
          🎵 Concert Effects
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#aaa', fontSize: '13px' }}>Intensity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            disabled={isAudioEnabled}
            style={{
              width: '100px',
              accentColor: '#ff00ff',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#aaa', fontSize: '13px' }}>Colors:</label>
          <select
            value={colorScheme}
            onChange={(e) => setColorScheme(parseInt(e.target.value))}
            style={{
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            <option value={0}>Neon Cyberpunk</option>
            <option value={1}>Fire & Ice</option>
            <option value={2}>Aurora</option>
            <option value={3}>Deep Ocean</option>
            <option value={4}>Sunset</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#aaa', fontSize: '13px' }}>Effect:</label>
          <select
            value={effectMode}
            onChange={(e) => setEffectMode(parseInt(e.target.value))}
            style={{
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            <option value={0}>Radial Burst</option>
            <option value={1}>Ripple Rings</option>
            <option value={2}>Combined</option>
          </select>
        </div>

        <button
          onClick={enableAudio}
          disabled={isAudioEnabled}
          style={{
            background: isAudioEnabled
              ? 'linear-gradient(135deg, #00aa44 0%, #008833 100%)'
              : 'linear-gradient(135deg, #ff0080 0%, #8000ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            cursor: isAudioEnabled ? 'default' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: isAudioEnabled
              ? '0 0 20px rgba(0,170,68,0.4)'
              : '0 0 20px rgba(255,0,128,0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          {isAudioEnabled ? '🎤 Audio Active' : '🎤 Enable Mic'}
        </button>

        <span
          style={{
            color: '#666',
            fontSize: '12px',
            marginLeft: 'auto',
          }}
        >
          Move mouse to attract particles
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          width: '100%',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
};

export default Completion22;
