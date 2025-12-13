import React, { useState, useEffect, useRef, useCallback } from 'react';

// Mini Golf Game
const Completion11 = () => {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [gameState, setGameState] = useState('aiming'); // aiming, moving, won, complete
  const [ball, setBall] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const [aim, setAim] = useState({ x: 0, y: 0, active: false });
  const [message, setMessage] = useState('');

  // Level definitions
  const levels = [
    {
      name: 'Straight Shot',
      ball: { x: 100, y: 300 },
      hole: { x: 700, y: 300, radius: 20 },
      obstacles: [],
      walls: [],
      par: 1,
    },
    {
      name: 'Around the Corner',
      ball: { x: 100, y: 100 },
      hole: { x: 700, y: 500, radius: 20 },
      obstacles: [{ type: 'rect', x: 300, y: 0, w: 40, h: 400 }],
      walls: [],
      par: 2,
    },
    {
      name: 'Obstacle Course',
      ball: { x: 100, y: 300 },
      hole: { x: 700, y: 300, radius: 20 },
      obstacles: [
        { type: 'circle', x: 300, y: 300, r: 50 },
        { type: 'circle', x: 500, y: 250, r: 40 },
        { type: 'circle', x: 500, y: 350, r: 40 },
      ],
      walls: [],
      par: 2,
    },
    {
      name: 'The Maze',
      ball: { x: 60, y: 300 },
      hole: { x: 740, y: 300, radius: 20 },
      obstacles: [
        { type: 'rect', x: 150, y: 100, w: 30, h: 300 },
        { type: 'rect', x: 300, y: 200, w: 30, h: 300 },
        { type: 'rect', x: 450, y: 100, w: 30, h: 300 },
        { type: 'rect', x: 600, y: 200, w: 30, h: 300 },
      ],
      walls: [],
      par: 4,
    },
    {
      name: 'Pinball',
      ball: { x: 100, y: 550 },
      hole: { x: 700, y: 50, radius: 20 },
      obstacles: [
        { type: 'circle', x: 200, y: 150, r: 35 },
        { type: 'circle', x: 400, y: 100, r: 35 },
        { type: 'circle', x: 600, y: 150, r: 35 },
        { type: 'circle', x: 300, y: 300, r: 35 },
        { type: 'circle', x: 500, y: 300, r: 35 },
        { type: 'circle', x: 200, y: 450, r: 35 },
        { type: 'circle', x: 400, y: 500, r: 35 },
        { type: 'circle', x: 600, y: 450, r: 35 },
      ],
      walls: [],
      par: 3,
    },
    {
      name: 'Narrow Path',
      ball: { x: 100, y: 300 },
      hole: { x: 700, y: 300, radius: 20 },
      obstacles: [
        { type: 'rect', x: 200, y: 0, w: 400, h: 230 },
        { type: 'rect', x: 200, y: 370, w: 400, h: 230 },
      ],
      walls: [],
      par: 1,
    },
    {
      name: 'Bouncy Castle',
      ball: { x: 100, y: 100 },
      hole: { x: 100, y: 500, radius: 20 },
      obstacles: [
        { type: 'rect', x: 0, y: 200, w: 600, h: 30 },
        { type: 'rect', x: 200, y: 400, w: 600, h: 30 },
      ],
      walls: [],
      par: 3,
    },
    {
      name: 'Circle of Trust',
      ball: { x: 400, y: 550 },
      hole: { x: 400, y: 300, radius: 20 },
      obstacles: [
        { type: 'circle', x: 400, y: 300, r: 150 },
        { type: 'circle', x: 400, y: 300, r: 120, isHollow: true },
      ],
      walls: [],
      par: 2,
    },
    {
      name: 'The Gauntlet',
      ball: { x: 50, y: 300 },
      hole: { x: 750, y: 300, radius: 20 },
      obstacles: [
        { type: 'circle', x: 150, y: 250, r: 30 },
        { type: 'circle', x: 150, y: 350, r: 30 },
        { type: 'circle', x: 300, y: 200, r: 30 },
        { type: 'circle', x: 300, y: 300, r: 30 },
        { type: 'circle', x: 300, y: 400, r: 30 },
        { type: 'circle', x: 450, y: 250, r: 30 },
        { type: 'circle', x: 450, y: 350, r: 30 },
        { type: 'circle', x: 600, y: 200, r: 30 },
        { type: 'circle', x: 600, y: 300, r: 30 },
        { type: 'circle', x: 600, y: 400, r: 30 },
      ],
      walls: [],
      par: 3,
    },
  ];

  const BALL_RADIUS = 12;
  const FRICTION = 0.985;
  const MIN_VELOCITY = 0.1;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const POWER_MULTIPLIER = 0.15;
  const MAX_POWER = 25;

  // Initialize level
  const initLevel = useCallback((levelIndex) => {
    const lvl = levels[levelIndex];
    setBall({ x: lvl.ball.x, y: lvl.ball.y, vx: 0, vy: 0 });
    setStrokes(0);
    setGameState('aiming');
    setMessage(`Hole ${levelIndex + 1}: ${lvl.name} (Par ${lvl.par})`);
  }, []);

  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // Check collision with circle obstacle
  const checkCircleCollision = (ballX, ballY, obstacle) => {
    const dx = ballX - obstacle.x;
    const dy = ballY - obstacle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (obstacle.isHollow) {
      // For hollow circles, collision is when ball tries to enter
      return dist < obstacle.r + BALL_RADIUS && dist > obstacle.r - 30;
    }
    return dist < obstacle.r + BALL_RADIUS;
  };

  // Check collision with rectangle obstacle
  const checkRectCollision = (ballX, ballY, obstacle) => {
    const closestX = Math.max(obstacle.x, Math.min(ballX, obstacle.x + obstacle.w));
    const closestY = Math.max(obstacle.y, Math.min(ballY, obstacle.y + obstacle.h));
    const dx = ballX - closestX;
    const dy = ballY - closestY;
    return Math.sqrt(dx * dx + dy * dy) < BALL_RADIUS;
  };

  // Handle collision response for circle
  const handleCircleCollision = (ballState, obstacle) => {
    const dx = ballState.x - obstacle.x;
    const dy = ballState.y - obstacle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    // Reflect velocity
    const dot = ballState.vx * nx + ballState.vy * ny;
    const newVx = ballState.vx - 2 * dot * nx;
    const newVy = ballState.vy - 2 * dot * ny;

    // Push ball outside obstacle
    const overlap = obstacle.r + BALL_RADIUS - dist;
    const newX = ballState.x + nx * (overlap + 1);
    const newY = ballState.y + ny * (overlap + 1);

    return { ...ballState, x: newX, y: newY, vx: newVx * 0.8, vy: newVy * 0.8 };
  };

  // Handle collision response for rectangle
  const handleRectCollision = (ballState, obstacle) => {
    const closestX = Math.max(obstacle.x, Math.min(ballState.x, obstacle.x + obstacle.w));
    const closestY = Math.max(obstacle.y, Math.min(ballState.y, obstacle.y + obstacle.h));

    const dx = ballState.x - closestX;
    const dy = ballState.y - closestY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const nx = dx / dist;
    const ny = dy / dist;

    // Determine which side we hit
    const dot = ballState.vx * nx + ballState.vy * ny;
    const newVx = ballState.vx - 2 * dot * nx;
    const newVy = ballState.vy - 2 * dot * ny;

    // Push ball outside
    const overlap = BALL_RADIUS - dist;
    const newX = ballState.x + nx * (overlap + 1);
    const newY = ballState.y + ny * (overlap + 1);

    return { ...ballState, x: newX, y: newY, vx: newVx * 0.8, vy: newVy * 0.8 };
  };

  // Physics update
  useEffect(() => {
    if (gameState !== 'moving') return;

    const interval = setInterval(() => {
      setBall((prev) => {
        let newBall = { ...prev };

        // Apply velocity
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;

        // Wall collisions
        if (newBall.x < BALL_RADIUS) {
          newBall.x = BALL_RADIUS;
          newBall.vx *= -0.8;
        }
        if (newBall.x > CANVAS_WIDTH - BALL_RADIUS) {
          newBall.x = CANVAS_WIDTH - BALL_RADIUS;
          newBall.vx *= -0.8;
        }
        if (newBall.y < BALL_RADIUS) {
          newBall.y = BALL_RADIUS;
          newBall.vy *= -0.8;
        }
        if (newBall.y > CANVAS_HEIGHT - BALL_RADIUS) {
          newBall.y = CANVAS_HEIGHT - BALL_RADIUS;
          newBall.vy *= -0.8;
        }

        // Obstacle collisions
        const currentLevel = levels[level];
        for (const obstacle of currentLevel.obstacles) {
          if (obstacle.isHollow) continue; // Skip hollow circles for now

          if (obstacle.type === 'circle' && checkCircleCollision(newBall.x, newBall.y, obstacle)) {
            newBall = handleCircleCollision(newBall, obstacle);
          } else if (
            obstacle.type === 'rect' &&
            checkRectCollision(newBall.x, newBall.y, obstacle)
          ) {
            newBall = handleRectCollision(newBall, obstacle);
          }
        }

        // Apply friction
        newBall.vx *= FRICTION;
        newBall.vy *= FRICTION;

        // Check if ball stopped
        const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);
        if (speed < MIN_VELOCITY) {
          newBall.vx = 0;
          newBall.vy = 0;
          setGameState('aiming');
        }

        // Check hole
        const hole = currentLevel.hole;
        const holeDistance = Math.sqrt(
          Math.pow(newBall.x - hole.x, 2) + Math.pow(newBall.y - hole.y, 2)
        );

        if (holeDistance < hole.radius && speed < 15) {
          // Ball in hole!
          newBall.x = hole.x;
          newBall.y = hole.y;
          newBall.vx = 0;
          newBall.vy = 0;

          const par = currentLevel.par;
          const strokeDiff = strokes - par;
          let scoreText = '';
          if (strokeDiff <= -2) scoreText = 'Eagle! 🦅';
          else if (strokeDiff === -1) scoreText = 'Birdie! 🐦';
          else if (strokeDiff === 0) scoreText = 'Par! ⛳';
          else if (strokeDiff === 1) scoreText = 'Bogey';
          else if (strokeDiff === 2) scoreText = 'Double Bogey';
          else scoreText = `+${strokeDiff}`;

          if (level < levels.length - 1) {
            setMessage(`Hole in! ${scoreText} - Click to continue`);
            setGameState('won');
          } else {
            setTotalStrokes((prev) => prev + strokes);
            setMessage(`🎉 Course Complete! Total: ${totalStrokes + strokes} strokes`);
            setGameState('complete');
          }
        }

        return newBall;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameState, level, strokes, totalStrokes]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#2d5a27'; // Golf green
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grass texture
    ctx.strokeStyle = '#3d7a37';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * CANVAS_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y - 10);
      ctx.stroke();
    }

    const currentLevel = levels[level];

    // Draw obstacles
    for (const obstacle of currentLevel.obstacles) {
      if (obstacle.type === 'circle') {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
        if (obstacle.isHollow) {
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 20;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#8B4513';
          ctx.fill();
          // Add shadow
          ctx.beginPath();
          ctx.arc(obstacle.x + 3, obstacle.y + 3, obstacle.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fill();
          // Redraw main
          ctx.beginPath();
          ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
          ctx.fillStyle = '#8B4513';
          ctx.fill();
        }
      } else if (obstacle.type === 'rect') {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(obstacle.x + 3, obstacle.y + 3, obstacle.w, obstacle.h);
        // Main
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      }
    }

    // Draw hole
    const hole = currentLevel.hole;
    // Hole shadow
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a3d18';
    ctx.fill();
    // Hole
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    // Flag
    ctx.fillStyle = '#fff';
    ctx.fillRect(hole.x, hole.y - 60, 3, 60);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(hole.x + 3, hole.y - 60);
    ctx.lineTo(hole.x + 30, hole.y - 50);
    ctx.lineTo(hole.x + 3, hole.y - 40);
    ctx.fill();

    // Draw aim line
    if (aim.active && gameState === 'aiming') {
      const dx = ball.x - aim.x;
      const dy = ball.y - aim.y;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER / POWER_MULTIPLIER);
      const angle = Math.atan2(dy, dx);

      // Power indicator
      const power = dist * POWER_MULTIPLIER;
      const powerPercent = (power / MAX_POWER) * 100;

      ctx.strokeStyle = `hsl(${120 - powerPercent * 1.2}, 100%, 50%)`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.x + Math.cos(angle) * dist, ball.y + Math.sin(angle) * dist);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw power dots
      for (let i = 1; i <= 5; i++) {
        const dotDist = (dist / 5) * i;
        const dotX = ball.x + Math.cos(angle) * dotDist;
        const dotY = ball.y + Math.sin(angle) * dotDist;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${120 - (i / 5) * powerPercent * 1.2}, 100%, 50%)`;
        ctx.fill();
      }
    }

    // Draw ball
    // Ball shadow
    ctx.beginPath();
    ctx.arc(ball.x + 3, ball.y + 3, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    // Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      ball.x - 4,
      ball.y - 4,
      0,
      ball.x,
      ball.y,
      BALL_RADIUS
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#cccccc');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [ball, aim, gameState, level]);

  // Mouse handlers
  const handleMouseDown = (e) => {
    if (gameState === 'won') {
      setTotalStrokes((prev) => prev + strokes);
      setLevel((prev) => prev + 1);
      return;
    }
    if (gameState === 'complete') {
      setLevel(0);
      setTotalStrokes(0);
      initLevel(0);
      return;
    }
    if (gameState !== 'aiming') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setAim({ x, y, active: true });
  };

  const handleMouseMove = (e) => {
    if (!aim.active || gameState !== 'aiming') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setAim({ x, y, active: true });
  };

  const handleMouseUp = () => {
    if (!aim.active || gameState !== 'aiming') return;

    const dx = ball.x - aim.x;
    const dy = ball.y - aim.y;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_POWER / POWER_MULTIPLIER);

    if (dist > 10) {
      const power = dist * POWER_MULTIPLIER;
      const angle = Math.atan2(dy, dx);

      setBall((prev) => ({
        ...prev,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power,
      }));

      setStrokes((prev) => prev + 1);
      setGameState('moving');
    }

    setAim({ x: 0, y: 0, active: false });
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp();
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a27 50%, #1a472a 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  };

  const titleStyle = {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    color: '#fff',
  };

  const scoreboardStyle = {
    display: 'flex',
    gap: '30px',
    marginBottom: '15px',
    padding: '15px 30px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '10px',
    fontSize: '18px',
  };

  const canvasContainerStyle = {
    border: '8px solid #5d4037',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  };

  const messageStyle = {
    marginTop: '15px',
    padding: '10px 20px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '8px',
    fontSize: '18px',
    textAlign: 'center',
  };

  const instructionsStyle = {
    marginTop: '15px',
    fontSize: '14px',
    color: '#aaa',
    textAlign: 'center',
  };

  const buttonStyle = {
    marginTop: '15px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#ff6b35',
    color: '#fff',
    transition: 'all 0.3s ease',
  };

  const currentPar = levels[level]?.par || 0;

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>⛳ Mini Golf</h1>

      <div style={scoreboardStyle}>
        <span>
          Hole: {level + 1}/{levels.length}
        </span>
        <span>Strokes: {strokes}</span>
        <span>Par: {currentPar}</span>
        <span>Total: {totalStrokes}</span>
      </div>

      <div style={canvasContainerStyle}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            maxWidth: '100%',
            height: 'auto',
            cursor: gameState === 'aiming' ? 'crosshair' : 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      <div style={messageStyle}>{message}</div>

      {gameState === 'aiming' && (
        <div style={instructionsStyle}>
          Click and drag to aim, release to shoot. Pull back for more power!
        </div>
      )}

      <button
        style={buttonStyle}
        onClick={() => initLevel(level)}
        onMouseOver={(e) => (e.target.style.background = '#ff8555')}
        onMouseOut={(e) => (e.target.style.background = '#ff6b35')}
      >
        Reset Hole
      </button>

      {gameState === 'complete' && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>🏆 Congratulations! 🏆</p>
          <p>You completed the course in {totalStrokes} strokes!</p>
          <p style={{ color: '#aaa', marginTop: '10px' }}>
            Course Par: {levels.reduce((sum, lvl) => sum + lvl.par, 0)}
          </p>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Holes available: {levels.length} | Total Par:{' '}
        {levels.reduce((sum, lvl) => sum + lvl.par, 0)}
      </div>
    </div>
  );
};

export default Completion11;
