import React, { useRef, useEffect, useState, useCallback } from 'react';

const Completion23 = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const pendulumRef = useRef(null);
  const randomBitsRef = useRef([]);
  const lastAngleRef = useRef(0);

  const [randomNumbers, setRandomNumbers] = useState([]);
  const [bitString, setBitString] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [trailLength, setTrailLength] = useState(100);
  const [showPendulum, setShowPendulum] = useState(true);

  // Double pendulum physics parameters
  const initPendulum = useCallback((canvas) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;

    // Use current timestamp for tiny initial variations (chaos source)
    const microTime = performance.now() % 1;
    const seed = (Date.now() % 1000) / 10000;

    pendulumRef.current = {
      // First pendulum
      angle1: Math.PI / 2 + seed + microTime * 0.001,
      angle2: Math.PI / 2 + seed * 0.5,
      angularVel1: 0,
      angularVel2: 0,
      length1: Math.min(canvas.width, canvas.height) * 0.2,
      length2: Math.min(canvas.width, canvas.height) * 0.2,
      mass1: 15,
      mass2: 15,
      gravity: 1,
      damping: 0.9999,
      centerX,
      centerY,
      trail: [],
      hue: 0,
    };
  }, []);

  // Generate random bit from pendulum state
  const generateBit = useCallback(() => {
    if (!pendulumRef.current) return;

    const p = pendulumRef.current;

    // Use various chaotic properties to generate bits
    const angle = (p.angle2 * 1000) % 1;
    const velocity = Math.abs(p.angularVel2 * 100) % 1;
    const combined = (angle + velocity) % 1;

    // Generate bit based on threshold crossing
    const bit = combined > 0.5 ? 1 : 0;

    // Only add bit if angle changed significantly (avoid repeated bits)
    const angleDelta = Math.abs(p.angle2 - lastAngleRef.current);
    if (angleDelta > 0.1) {
      randomBitsRef.current.push(bit);
      lastAngleRef.current = p.angle2;

      // Update bit string display
      if (randomBitsRef.current.length > 64) {
        randomBitsRef.current = randomBitsRef.current.slice(-64);
      }
      setBitString(randomBitsRef.current.join(''));

      // Convert to numbers when we have 8 bits
      if (randomBitsRef.current.length >= 8 && randomBitsRef.current.length % 8 === 0) {
        const lastByte = randomBitsRef.current.slice(-8);
        const num = parseInt(lastByte.join(''), 2);
        setRandomNumbers((prev) => {
          const newNums = [...prev, num];
          return newNums.slice(-20);
        });
      }
    }
  }, []);

  // Double pendulum physics update
  const updatePendulum = useCallback(
    (dt) => {
      if (!pendulumRef.current) return;

      const p = pendulumRef.current;
      const g = p.gravity;
      const m1 = p.mass1;
      const m2 = p.mass2;
      const l1 = p.length1;
      const l2 = p.length2;
      const a1 = p.angle1;
      const a2 = p.angle2;
      const w1 = p.angularVel1;
      const w2 = p.angularVel2;

      // Double pendulum equations of motion
      const delta = a1 - a2;
      const den1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
      const den2 = (l2 / l1) * den1;

      // Angular accelerations
      const acc1 =
        (m2 * l1 * w1 * w1 * Math.sin(delta) * Math.cos(delta) +
          m2 * g * Math.sin(a2) * Math.cos(delta) +
          m2 * l2 * w2 * w2 * Math.sin(delta) -
          (m1 + m2) * g * Math.sin(a1)) /
        den1;

      const acc2 =
        (-m2 * l2 * w2 * w2 * Math.sin(delta) * Math.cos(delta) +
          (m1 + m2) *
            (g * Math.sin(a1) * Math.cos(delta) -
              l1 * w1 * w1 * Math.sin(delta) -
              g * Math.sin(a2))) /
        den2;

      // Update velocities and angles
      p.angularVel1 += acc1 * dt;
      p.angularVel2 += acc2 * dt;
      p.angularVel1 *= p.damping;
      p.angularVel2 *= p.damping;
      p.angle1 += p.angularVel1 * dt;
      p.angle2 += p.angularVel2 * dt;

      // Calculate end positions
      const x1 = p.centerX + l1 * Math.sin(a1);
      const y1 = p.centerY + l1 * Math.cos(a1);
      const x2 = x1 + l2 * Math.sin(p.angle2);
      const y2 = y1 + l2 * Math.cos(p.angle2);

      // Update trail
      p.hue = (p.hue + 0.5) % 360;
      p.trail.push({ x: x2, y: y2, hue: p.hue });
      if (p.trail.length > trailLength) {
        p.trail.shift();
      }

      // Generate random bit from chaotic motion
      generateBit();

      return { x1, y1, x2, y2 };
    },
    [generateBit, trailLength]
  );

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initPendulum(canvas);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!isRunning) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const p = pendulumRef.current;
      if (!p) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Run physics multiple times per frame for stability
      let positions;
      for (let i = 0; i < speed * 3; i++) {
        positions = updatePendulum(0.5);
      }

      if (!positions) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { x1, y1, x2, y2 } = positions;

      // Draw trail with gradient colors
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);

        for (let i = 1; i < p.trail.length; i++) {
          const point = p.trail[i];
          const prevPoint = p.trail[i - 1];

          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);

          const alpha = i / p.trail.length;
          ctx.strokeStyle = `hsla(${point.hue}, 100%, 60%, ${alpha * 0.8})`;
          ctx.lineWidth = 2 + alpha * 3;
          ctx.stroke();
        }
      }

      if (showPendulum) {
        // Draw pendulum arms
        ctx.beginPath();
        ctx.moveTo(p.centerX, p.centerY);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pivot point
        ctx.beginPath();
        ctx.arc(p.centerX, p.centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#444';
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw first mass
        const gradient1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, 20);
        gradient1.addColorStop(0, '#ff6b6b');
        gradient1.addColorStop(1, '#c92a2a');
        ctx.beginPath();
        ctx.arc(x1, y1, 15, 0, Math.PI * 2);
        ctx.fillStyle = gradient1;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw second mass (chaos source)
        const gradient2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, 20);
        gradient2.addColorStop(0, '#4dabf7');
        gradient2.addColorStop(1, '#1864ab');
        ctx.beginPath();
        ctx.arc(x2, y2, 15, 0, Math.PI * 2);
        ctx.fillStyle = gradient2;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw glow around second mass
        const glowGradient = ctx.createRadialGradient(x2, y2, 0, x2, y2, 40);
        glowGradient.addColorStop(0, 'rgba(77, 171, 247, 0.4)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x2, y2, 40, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();
      }

      // Draw info text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px monospace';
      ctx.fillText(`θ1: ${(p.angle1 % (Math.PI * 2)).toFixed(4)}`, 10, 20);
      ctx.fillText(`θ2: ${(p.angle2 % (Math.PI * 2)).toFixed(4)}`, 10, 35);
      ctx.fillText(`ω1: ${p.angularVel1.toFixed(4)}`, 10, 50);
      ctx.fillText(`ω2: ${p.angularVel2.toFixed(4)}`, 10, 65);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initPendulum, updatePendulum, isRunning, speed, showPendulum]);

  // Reset pendulum with new initial conditions
  const resetPendulum = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      randomBitsRef.current = [];
      setBitString('');
      setRandomNumbers([]);
      initPendulum(canvas);
    }
  };

  // Copy numbers to clipboard
  const copyNumbers = () => {
    navigator.clipboard.writeText(randomNumbers.join(', '));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: '#0a0a14',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '15px 20px',
          background: 'linear-gradient(180deg, rgba(20,20,40,0.95) 0%, rgba(10,10,20,0.9) 100%)',
          borderBottom: '1px solid rgba(100, 100, 255, 0.2)',
          display: 'flex',
          gap: '20px',
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
            background: 'linear-gradient(90deg, #4dabf7, #ff6b6b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🎲 Chaos Theory RNG
        </h2>

        <span style={{ color: '#888', fontSize: '12px' }}>
          Double Pendulum Randomness Generator
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              background: isRunning
                ? 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)'
                : 'linear-gradient(135deg, #51cf66 0%, #2f9e44 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            {isRunning ? '⏸ Pause' : '▶ Resume'}
          </button>

          <button
            onClick={resetPendulum}
            style={{
              background: 'linear-gradient(135deg, #845ef7 0%, #5f3dc4 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas area */}
        <canvas
          ref={canvasRef}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />

        {/* Side panel */}
        <div
          style={{
            width: '320px',
            background: 'rgba(20, 20, 40, 0.9)',
            borderLeft: '1px solid rgba(100, 100, 255, 0.2)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Controls</h3>

            <div>
              <label
                style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}
              >
                Simulation Speed: {speed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#4dabf7' }}
              />
            </div>

            <div>
              <label
                style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}
              >
                Trail Length: {trailLength}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={trailLength}
                onChange={(e) => setTrailLength(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#4dabf7' }}
              />
            </div>

            <label
              style={{
                color: '#aaa',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={showPendulum}
                onChange={(e) => setShowPendulum(e.target.checked)}
                style={{ accentColor: '#4dabf7' }}
              />
              Show Pendulum
            </label>
          </div>

          {/* Bit stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Random Bits</h3>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#4dabf7',
                wordBreak: 'break-all',
                minHeight: '60px',
                border: '1px solid rgba(77, 171, 247, 0.3)',
              }}
            >
              {bitString || 'Generating...'}
            </div>
            <div style={{ color: '#888', fontSize: '11px' }}>{bitString.length} bits generated</div>
          </div>

          {/* Random numbers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Random Numbers (0-255)</h3>
              <button
                onClick={copyNumbers}
                style={{
                  background: 'transparent',
                  color: '#4dabf7',
                  border: '1px solid #4dabf7',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                📋 Copy
              </button>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                padding: '12px',
                flex: 1,
                overflowY: 'auto',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              }}
            >
              {randomNumbers.length === 0 ? (
                <div style={{ color: '#888', fontSize: '12px' }}>Waiting for bits...</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {randomNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: `hsla(${(num / 255) * 360}, 70%, 50%, 0.3)`,
                        border: `1px solid hsla(${(num / 255) * 360}, 70%, 50%, 0.5)`,
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#fff',
                      }}
                    >
                      {num.toString().padStart(3, '0')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div
            style={{
              background: 'rgba(77, 171, 247, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(77, 171, 247, 0.2)',
            }}
          >
            <h4 style={{ margin: '0 0 8px', color: '#4dabf7', fontSize: '13px' }}>
              💡 How it works
            </h4>
            <p style={{ margin: 0, color: '#aaa', fontSize: '11px', lineHeight: '1.5' }}>
              A double pendulum is a chaotic system - even tiny differences in initial conditions
              lead to vastly different trajectories. We extract randomness from the chaotic motion
              by sampling the pendulum's angle at significant state changes, converting the
              fractional part into binary bits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion23;
