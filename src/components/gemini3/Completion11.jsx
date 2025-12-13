import React, { useRef, useEffect, useState } from 'react';

const Completion11 = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, level_complete, game_over, game_complete
  const [levelIndex, setLevelIndex] = useState(0);
  const [strokes, setStrokes] = useState(0);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const FRICTION = 0.975; // Air friction
  const WALL_BOUNCE = 0.7; // Energy loss on wall bounce
  const MIN_VELOCITY = 0.05;

  // Levels definition
  const levels = [
    {
      start: { x: 100, y: 300 },
      hole: { x: 700, y: 300, radius: 15 },
      walls: [
        { x: 400, y: 0, w: 20, h: 250 },
        { x: 400, y: 350, w: 20, h: 250 },
      ],
      obstacles: [],
    },
    {
      start: { x: 100, y: 100 },
      hole: { x: 700, y: 500, radius: 15 },
      walls: [
        { x: 300, y: 150, w: 20, h: 450 },
        { x: 500, y: 0, w: 20, h: 450 },
      ],
      obstacles: [
        { x: 400, y: 300, radius: 30 },
        { x: 200, y: 200, radius: 20 },
        { x: 600, y: 400, radius: 20 },
      ],
    },
    {
      start: { x: 50, y: 50 },
      hole: { x: 750, y: 550, radius: 20 },
      walls: [],
      obstacles: Array.from({ length: 15 }, () => ({
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        radius: Math.random() * 20 + 10,
      })),
    },
  ];

  // Game state refs
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, radius: 8 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragCurrentRef = useRef({ x: 0, y: 0 });

  // Initialize ball position when level changes
  useEffect(() => {
    if (levels[levelIndex]) {
      ballRef.current = {
        ...ballRef.current,
        x: levels[levelIndex].start.x,
        y: levels[levelIndex].start.y,
        vx: 0,
        vy: 0,
      };
    }
  }, [levelIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updatePhysics = () => {
      const ball = ballRef.current;
      const currentLevel = levels[levelIndex];

      // Apply velocity
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Apply Friction
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;

      // Stop if too slow
      if (Math.abs(ball.vx) < MIN_VELOCITY) ball.vx = 0;
      if (Math.abs(ball.vy) < MIN_VELOCITY) ball.vy = 0;

      // Wall Collisions (Canvas Borders)
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * WALL_BOUNCE;
      } else if (ball.x + ball.radius > CANVAS_WIDTH) {
        ball.x = CANVAS_WIDTH - ball.radius;
        ball.vx = -ball.vx * WALL_BOUNCE;
      }

      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * WALL_BOUNCE;
      } else if (ball.y + ball.radius > CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.vy = -ball.vy * WALL_BOUNCE;
      }

      // Level Walls Collision
      if (currentLevel) {
        currentLevel.walls.forEach((wall) => {
          // Simple AABB collision with response
          // Find closest point on rect to circle center
          const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.w));
          const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.h));

          const dx = ball.x - closestX;
          const dy = ball.y - closestY;
          const distSq = dx * dx + dy * dy;

          if (distSq < ball.radius * ball.radius && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const overlap = ball.radius - dist;

            // Normalize collision normal
            const nx = dx / dist;
            const ny = dy / dist;

            // Resolve overlap
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity
            // v' = v - 2 * (v . n) * n
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * WALL_BOUNCE;
            ball.vy = (ball.vy - 2 * dot * ny) * WALL_BOUNCE;
          }
        });

        // Obstacles Collision (Circle-Circle)
        currentLevel.obstacles.forEach((obs) => {
          const dx = ball.x - obs.x;
          const dy = ball.y - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + obs.radius;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * WALL_BOUNCE;
            ball.vy = (ball.vy - 2 * dot * ny) * WALL_BOUNCE;
          }
        });

        // Hole Detection
        const dxHole = ball.x - currentLevel.hole.x;
        const dyHole = ball.y - currentLevel.hole.y;
        const distHole = Math.sqrt(dxHole * dxHole + dyHole * dyHole);

        if (distHole < currentLevel.hole.radius) {
          // Check if moving slowly enough to fall in
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          if (speed < 5) {
            // Level Complete
            ball.vx = 0;
            ball.vy = 0;
            ball.x = currentLevel.hole.x;
            ball.y = currentLevel.hole.y;

            // Trigger next level after short delay
            // We track this with a flag or transition in state, implementing simple alert for now
            // But inside render loop it's tricky, better to use state
            setGameState('level_complete');
          }
        }
      }
    };

    const render = () => {
      const currentLevel = levels[levelIndex];
      if (!currentLevel) return;

      // Clear canvas
      ctx.fillStyle = '#2d2d2d';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Hole
      ctx.beginPath();
      ctx.arc(currentLevel.hole.x, currentLevel.hole.y, currentLevel.hole.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // Draw Walls
      ctx.fillStyle = '#8B4513'; // Wood color
      currentLevel.walls.forEach((wall) => {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
        ctx.strokeStyle = '#5c2e0e';
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      });

      // Draw Obstacles
      ctx.fillStyle = '#556B2F'; // Dark olive green
      currentLevel.obstacles.forEach((obs) => {
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3e4d22';
        ctx.stroke();
        ctx.closePath();
      });

      // Draw Ball
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      // Ball shadow/shading for 3d effect
      ctx.beginPath();
      ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      ctx.closePath();

      // Draw Drag Line
      if (isDraggingRef.current && ball.vx === 0 && ball.vy === 0) {
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        const dx = dragStartRef.current.x - dragCurrentRef.current.x;
        const dy = dragStartRef.current.y - dragCurrentRef.current.y;
        // Limit power visual
        ctx.lineTo(ball.x + dx, ball.y + dy);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        // Draw arrow head?
        ctx.closePath();
      }

      updatePhysics();
      animationFrameId = requestAnimationFrame(render);
    };

    if (gameState === 'playing') {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, levelIndex]);

  const handleStartGame = () => {
    setGameState('playing');
    setStrokes(0);
    setLevelIndex(0);
  };

  const handleNextLevel = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex((prev) => prev + 1);
      setGameState('playing');
    } else {
      setGameState('game_complete');
    }
  };

  const handleMouseDown = (e) => {
    if (gameState !== 'playing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Simple check if clicking near ball AND ball is stopped
    const ball = ballRef.current;
    if (Math.abs(ball.vx) > 0.1 || Math.abs(ball.vy) > 0.1) return;

    const dist = Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2);

    if (dist < 40) {
      isDraggingRef.current = true;
      dragStartRef.current = { x, y };
      dragCurrentRef.current = { x, y };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    dragCurrentRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Shoot ball logic
    const dx = dragStartRef.current.x - dragCurrentRef.current.x;
    const dy = dragStartRef.current.y - dragCurrentRef.current.y;

    const POWER_SCALE = 0.15;
    const MAX_POWER = 20;

    let vx = dx * POWER_SCALE;
    let vy = dy * POWER_SCALE;

    // Cap max speed
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_POWER) {
      const ratio = MAX_POWER / speed;
      vx *= ratio;
      vy *= ratio;
    }

    ballRef.current.vx = vx;
    ballRef.current.vy = vy;

    if (speed > 0.5) setStrokes((s) => s + 1);
  };

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ color: '#4CAF50', textShadow: '0 0 10px rgba(76, 175, 80, 0.5)' }}>
        Mini Code Golf
      </h2>

      {gameState === 'menu' && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <p style={{ fontSize: '24px', marginBottom: '30px' }}>Welcome to Mini Code Golf!</p>
          <p>Drag and release to shoot the ball into the hole.</p>
          <button
            onClick={handleStartGame}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              cursor: 'pointer',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'level_complete' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '2px solid #4CAF50',
          }}
        >
          <h3 style={{ fontSize: '30px', color: '#4CAF50' }}>Level Complete!</h3>
          <button
            onClick={handleNextLevel}
            style={{
              padding: '10px 30px',
              fontSize: '18px',
              cursor: 'pointer',
              marginTop: '20px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
            }}
          >
            Next Level
          </button>
        </div>
      )}

      {gameState === 'game_complete' && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h3 style={{ fontSize: '40px', color: '#FFD700' }}>Course Completed!</h3>
          <p style={{ fontSize: '24px' }}>Total Strokes: {strokes}</p>
          <button
            onClick={handleStartGame}
            style={{
              padding: '15px 40px',
              fontSize: '20px',
              cursor: 'pointer',
              marginTop: '30px',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: CANVAS_WIDTH,
              marginBottom: '10px',
              fontSize: '18px',
            }}
          >
            <span>
              Hole: {levelIndex + 1} / {levels.length}
            </span>
            <span>Strokes: {strokes}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              border: '4px solid #333',
              borderRadius: '8px',
              cursor: 'crosshair',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              backgroundColor: '#2d2d2d',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => (isDraggingRef.current = false)}
          />
        </div>
      )}
    </div>
  );
};

export default Completion11;
