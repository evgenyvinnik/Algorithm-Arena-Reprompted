import React, { useRef, useEffect, useState } from 'react';

const Completion19 = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const [gameState, setGameState] = useState('playing'); // playing, gameover
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Game constants
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 15;
  const BALL_RADIUS = 6;
  const BRICK_ROW_COUNT = 8;
  const BRICK_COLUMN_COUNT = 10;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 35;
  const BRICK_HEIGHT = 20;

  // Refs for mutable game state to avoid re-renders in loop
  const gameStateRef = useRef({
    paddleX: 300,
    ball: { x: 400, y: 300, dx: 4, dy: -4 },
    bricks: [],
    particles: [],
    lastBrickDropTime: 0,
    brickDropInterval: 5000, // ms
    width: 800,
    height: 600,
    score: 0
  });

  const initGame = () => {
    const width = 800;
    const initialBricks = [];
    const brickWidth = (width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

    // Create initial rows
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        initialBricks.push({
          x: c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: brickWidth,
          height: BRICK_HEIGHT,
          status: 1, // 1 = active, 0 = broken
          color: `hsl(${c * 36}, 70%, 50%)`
        });
      }
    }

    gameStateRef.current = {
      paddleX: width / 2 - PADDLE_WIDTH / 2,
      ball: { x: width / 2, y: width / 2, dx: 4, dy: -4 },
      bricks: initialBricks,
      particles: [],
      lastBrickDropTime: Date.now(),
      brickDropInterval: 5000,
      width: width,
      height: 600,
      score: 0
    };
    setScore(0);
    setLevel(1);
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const createParticles = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
      gameStateRef.current.particles.push({
        x: x,
        y: y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color: color
      });
    }
  };

  const update = () => {
    if (gameState !== 'playing') return;

    const state = gameStateRef.current;

    // Ball movement
    state.ball.x += state.ball.dx;
    state.ball.y += state.ball.dy;

    // Wall collision
    if (state.ball.x + state.ball.dx > state.width - BALL_RADIUS || state.ball.x + state.ball.dx < BALL_RADIUS) {
      state.ball.dx = -state.ball.dx;
    }
    if (state.ball.y + state.ball.dy < BALL_RADIUS) {
      state.ball.dy = -state.ball.dy;
    } else if (state.ball.y + state.ball.dy > state.height - BALL_RADIUS) {
      // Ball hit bottom - Check paddle or game over
      if (state.ball.x > state.paddleX && state.ball.x < state.paddleX + PADDLE_WIDTH) {
        // Hit paddle
        // Calculate angle based on where hit
        let hitPoint = state.ball.x - (state.paddleX + PADDLE_WIDTH / 2);
        // Normalize (-1 to 1)
        hitPoint = hitPoint / (PADDLE_WIDTH / 2);

        let angle = hitPoint * (Math.PI / 3); // Max 60 degrees

        const speed = Math.sqrt(state.ball.dx * state.ball.dx + state.ball.dy * state.ball.dy) * 1.02; // Slight speed up
        state.ball.dx = speed * Math.sin(angle);
        state.ball.dy = -speed * Math.cos(angle);
      } else {
        setGameState('gameover');
        return;
      }
    }

    // Brick collision
    state.bricks.forEach(b => {
      if (b.status === 1) {
        if (state.ball.x > b.x && state.ball.x < b.x + b.width && state.ball.y > b.y && state.ball.y < b.y + b.height) {
          state.ball.dy = -state.ball.dy;
          b.status = 0;
          state.score += 10;
          setScore(state.score);
          createParticles(b.x + b.width / 2, b.y + b.height / 2, b.color);
        }
      }
    });

    // Remove broken bricks
    state.bricks = state.bricks.filter(b => b.status === 1);

    // Falling Bricks Logic
    if (Date.now() - state.lastBrickDropTime > state.brickDropInterval) {
      // Move all bricks down
      let gameOver = false;
      state.bricks.forEach(b => {
        b.y += (BRICK_HEIGHT + BRICK_PADDING);
        if (b.y + BRICK_HEIGHT >= state.height - 50) { // Near paddle
          gameOver = true;
        }
      });

      if (gameOver) {
        setGameState('gameover');
        return;
      }

      // Add new row at top
      const brickWidth = (state.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        // Randomly skip some bricks for interest
        if (Math.random() > 0.1) {
          state.bricks.push({
            x: c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT,
            y: BRICK_OFFSET_TOP,
            width: brickWidth,
            height: BRICK_HEIGHT,
            status: 1,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
          });
        }
      }

      state.lastBrickDropTime = Date.now();
      // Speed updates
      if (state.score > state.level * 500) {
        setLevel(l => l + 1);
        state.brickDropInterval = Math.max(1000, state.brickDropInterval - 500);
      }
    }

    // Particle updates
    state.particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life -= 0.05;
    });
    state.particles = state.particles.filter(p => p.life > 0);
  };

  const draw = (ctx) => {
    const state = gameStateRef.current;

    // Clear
    ctx.clearRect(0, 0, state.width, state.height);

    // Background gradient for deep space feel
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(1, '#302b63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    // Paddle
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2ff';
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(state.paddleX, state.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Ball
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Bricks
    state.bricks.forEach(b => {
      if (b.status === 1) {
        ctx.beginPath();
        ctx.rect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = b.color;
        ctx.fill();
        ctx.closePath();
      }
    });

    // Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1.0;
    });
  };

  const loop = () => {
    update();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      draw(ctx);
    }
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]); // Re-start loop if gamestate changes back to playing

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    let paddleX = relativeX - PADDLE_WIDTH / 2;

    // Clamp
    if (paddleX < 0) paddleX = 0;
    if (paddleX + PADDLE_WIDTH > gameStateRef.current.width) paddleX = gameStateRef.current.width - PADDLE_WIDTH;

    gameStateRef.current.paddleX = paddleX;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 min-h-screen font-sans text-white">
      <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Falling Breakout
      </h2>

      <div className="mb-4 flex gap-8 text-xl">
        <div className="px-4 py-2 bg-gray-800 rounded border border-gray-700">
          Score: <span className="text-blue-400 font-bold">{score}</span>
        </div>
        <div className="px-4 py-2 bg-gray-800 rounded border border-gray-700">
          Level: <span className="text-purple-400 font-bold">{level}</span>
        </div>
      </div>

      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseMove={handleMouseMove}
          className="border-4 border-gray-700 rounded-lg shadow-2xl cursor-none"
          style={{ background: '#000' }}
        />

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <h3 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">GAME OVER</h3>
            <p className="text-2xl mb-8">Final Score: {score}</p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-blue-500/50"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-gray-400 text-sm max-w-2xl text-center">
        <p>Control the paddle with your mouse. Don't let the bricks reach the bottom!</p>
      </div>
    </div>
  );
};

export default Completion19;
