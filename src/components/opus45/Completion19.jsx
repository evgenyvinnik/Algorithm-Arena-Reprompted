import React, { useRef, useEffect, useState, useCallback } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 8;
const BALL_RADIUS = 8;
const BALL_SPEED = 5;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT =
  (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;
const BRICK_FALL_SPEED = 0.5;
const NEW_ROW_INTERVAL = 5000; // New row every 5 seconds

const BRICK_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FF8C42', // Orange
];

const shadeColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const Completion19 = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'paused', 'gameOver', 'won'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fallingBreakoutHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 40 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60, dx: BALL_SPEED, dy: -BALL_SPEED },
    bricks: [],
    keys: { left: false, right: false },
    animationId: null,
    lastRowTime: 0,
    rowColorIndex: 0,
  });

  const initBricks = useCallback(() => {
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
          alive: true,
        });
      }
    }
    return bricks;
  }, []);

  const addNewRow = useCallback(() => {
    const game = gameRef.current;
    const newBricks = [];

    // Move existing bricks down
    game.bricks.forEach((brick) => {
      brick.y += BRICK_HEIGHT + BRICK_PADDING;
    });

    // Add new row at top
    for (let col = 0; col < BRICK_COLS; col++) {
      newBricks.push({
        x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: BRICK_COLORS[game.rowColorIndex % BRICK_COLORS.length],
        alive: true,
      });
    }

    game.rowColorIndex++;
    game.bricks = [...newBricks, ...game.bricks];
  }, []);

  const resetBall = useCallback(() => {
    const game = gameRef.current;
    game.ball.x = CANVAS_WIDTH / 2;
    game.ball.y = CANVAS_HEIGHT - 60;
    game.ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    game.ball.dy = -BALL_SPEED;
  }, []);

  const startGame = useCallback(() => {
    const game = gameRef.current;
    game.paddle = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 40 };
    game.bricks = initBricks();
    game.lastRowTime = Date.now();
    game.rowColorIndex = BRICK_ROWS;
    resetBall();
    setScore(0);
    setLives(3);
    setGameState('playing');
  }, [initBricks, resetBall]);

  const draw = useCallback((ctx) => {
    const game = gameRef.current;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw starfield background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 59) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw bricks with glow effect
    game.bricks.forEach((brick) => {
      if (brick.alive) {
        // Glow
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 10;

        // Brick gradient
        const gradient = ctx.createLinearGradient(
          brick.x,
          brick.y,
          brick.x,
          brick.y + brick.height
        );
        gradient.addColorStop(0, brick.color);
        gradient.addColorStop(1, shadeColor(brick.color, -30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 3);

        ctx.shadowBlur = 0;
      }
    });

    // Draw paddle with gradient
    const paddleGradient = ctx.createLinearGradient(
      game.paddle.x,
      game.paddle.y,
      game.paddle.x,
      game.paddle.y + PADDLE_HEIGHT
    );
    paddleGradient.addColorStop(0, '#00d4ff');
    paddleGradient.addColorStop(1, '#0099cc');

    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = paddleGradient;
    ctx.beginPath();
    ctx.roundRect(game.paddle.x, game.paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw ball with glow
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 20;
    const ballGradient = ctx.createRadialGradient(
      game.ball.x - 2,
      game.ball.y - 2,
      0,
      game.ball.x,
      game.ball.y,
      BALL_RADIUS
    );
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(1, '#aaaaff');

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw danger zone line
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 100);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 100);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const update = useCallback(
    (currentScore, currentLives, updateScore, updateLives) => {
      const game = gameRef.current;

      // Move paddle
      if (game.keys.left && game.paddle.x > 0) {
        game.paddle.x -= PADDLE_SPEED;
      }
      if (game.keys.right && game.paddle.x < CANVAS_WIDTH - PADDLE_WIDTH) {
        game.paddle.x += PADDLE_SPEED;
      }

      // Move ball
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Ball collision with walls
      if (game.ball.x - BALL_RADIUS <= 0 || game.ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
        game.ball.dx = -game.ball.dx;
      }
      if (game.ball.y - BALL_RADIUS <= 0) {
        game.ball.dy = -game.ball.dy;
      }

      // Ball collision with paddle
      if (
        game.ball.y + BALL_RADIUS >= game.paddle.y &&
        game.ball.y - BALL_RADIUS <= game.paddle.y + PADDLE_HEIGHT &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + PADDLE_WIDTH
      ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPos = (game.ball.x - game.paddle.x) / PADDLE_WIDTH;
        const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63 to 63 degrees
        const speed = Math.sqrt(game.ball.dx * game.ball.dx + game.ball.dy * game.ball.dy);

        game.ball.dx = speed * Math.sin(angle);
        game.ball.dy = -Math.abs(speed * Math.cos(angle));
        game.ball.y = game.paddle.y - BALL_RADIUS;
      }

      // Ball falls below paddle
      if (game.ball.y + BALL_RADIUS >= CANVAS_HEIGHT) {
        const newLives = currentLives - 1;
        updateLives(newLives);
        if (newLives <= 0) {
          return 'gameOver';
        }
        resetBall();
      }

      // Move bricks down (the falling twist!)
      game.bricks.forEach((brick) => {
        if (brick.alive) {
          brick.y += BRICK_FALL_SPEED;
        }
      });

      // Add new row periodically
      if (Date.now() - game.lastRowTime > NEW_ROW_INTERVAL) {
        addNewRow();
        game.lastRowTime = Date.now();
      }

      // Check if any brick reached the danger zone (paddle level)
      const brickReachedBottom = game.bricks.some(
        (brick) => brick.alive && brick.y + brick.height >= game.paddle.y
      );
      if (brickReachedBottom) {
        return 'gameOver';
      }

      // Ball collision with bricks
      let newScore = currentScore;
      game.bricks.forEach((brick) => {
        if (brick.alive) {
          if (
            game.ball.x + BALL_RADIUS >= brick.x &&
            game.ball.x - BALL_RADIUS <= brick.x + brick.width &&
            game.ball.y + BALL_RADIUS >= brick.y &&
            game.ball.y - BALL_RADIUS <= brick.y + brick.height
          ) {
            brick.alive = false;
            newScore += 10;

            // Determine collision side
            const overlapLeft = game.ball.x + BALL_RADIUS - brick.x;
            const overlapRight = brick.x + brick.width - (game.ball.x - BALL_RADIUS);
            const overlapTop = game.ball.y + BALL_RADIUS - brick.y;
            const overlapBottom = brick.y + brick.height - (game.ball.y - BALL_RADIUS);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
              game.ball.dx = -game.ball.dx;
            } else {
              game.ball.dy = -game.ball.dy;
            }
          }
        }
      });

      if (newScore !== currentScore) {
        updateScore(newScore);
      }

      // Check win condition (unlikely in this falling mode, but still)
      const aliveBricks = game.bricks.filter((b) => b.alive).length;
      if (aliveBricks === 0) {
        return 'won';
      }

      return 'playing';
    },
    [resetBall, addNewRow]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let localScore = score;
    let localLives = lives;

    const updateScore = (newScore) => {
      localScore = newScore;
      setScore(newScore);
    };

    const updateLives = (newLives) => {
      localLives = newLives;
      setLives(newLives);
    };

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      const result = update(localScore, localLives, updateScore, updateLives);

      if (result === 'gameOver') {
        setGameState('gameOver');
        if (localScore > highScore) {
          setHighScore(localScore);
          localStorage.setItem('fallingBreakoutHighScore', localScore.toString());
        }
        return;
      }

      if (result === 'won') {
        setGameState('won');
        if (localScore > highScore) {
          setHighScore(localScore);
          localStorage.setItem('fallingBreakoutHighScore', localScore.toString());
        }
        return;
      }

      draw(ctx);
      gameRef.current.animationId = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    } else {
      draw(ctx);
    }

    const currentGameRef = gameRef.current;
    return () => {
      if (currentGameRef.animationId) {
        cancelAnimationFrame(currentGameRef.animationId);
      }
    };
  }, [gameState, update, draw, score, lives, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        gameRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        gameRef.current.keys.right = true;
      }
      if (e.key === ' ' && gameState === 'start') {
        startGame();
      }
      if (e.key === 'p' && gameState === 'playing') {
        setGameState('paused');
      } else if (e.key === 'p' && gameState === 'paused') {
        setGameState('playing');
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        gameRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        gameRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        padding: '20px',
      }}
    >
      <h1
        style={{
          color: '#00d4ff',
          textShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff',
          fontSize: '2.5rem',
          marginBottom: '10px',
          letterSpacing: '3px',
        }}
      >
        🎮 FALLING BREAKOUT
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: CANVAS_WIDTH,
          marginBottom: '10px',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
        }}
      >
        <span style={{ color: '#4ECDC4', fontSize: '1.2rem' }}>
          Score: <strong style={{ color: '#fff' }}>{score}</strong>
        </span>
        <span style={{ color: '#FF6B6B', fontSize: '1.2rem' }}>
          Lives: <strong style={{ color: '#fff' }}>{'❤️'.repeat(lives)}</strong>
        </span>
        <span style={{ color: '#FFEAA7', fontSize: '1.2rem' }}>
          High Score: <strong style={{ color: '#fff' }}>{highScore}</strong>
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: '3px solid #00d4ff',
            borderRadius: '10px',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
          }}
        />

        {gameState === 'start' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '10px',
            }}
          >
            <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px' }}>
              Welcome to Falling Breakout!
            </h2>
            <p
              style={{
                color: '#aaa',
                marginBottom: '10px',
                textAlign: 'center',
                maxWidth: '500px',
              }}
            >
              The classic Breakout with a twist - bricks keep falling down!
              <br />
              Don&apos;t let them reach your paddle!
            </p>
            <div style={{ color: '#4ECDC4', marginBottom: '30px' }}>
              <p>← → or A/D to move paddle</p>
              <p>P to pause</p>
            </div>
            <button
              onClick={startGame}
              style={{
                padding: '15px 40px',
                fontSize: '1.3rem',
                background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                border: 'none',
                borderRadius: '30px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
              }}
            >
              START GAME
            </button>
            <p style={{ color: '#666', marginTop: '15px' }}>or press SPACE</p>
          </div>
        )}

        {gameState === 'paused' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '10px',
            }}
          >
            <h2 style={{ color: '#FFEAA7', fontSize: '3rem' }}>⏸️ PAUSED</h2>
            <p style={{ color: '#aaa', marginTop: '20px' }}>Press P to resume</p>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '10px',
            }}
          >
            <h2 style={{ color: '#FF6B6B', fontSize: '3rem', marginBottom: '20px' }}>
              💥 GAME OVER
            </h2>
            <p style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>
              Final Score: <strong style={{ color: '#4ECDC4' }}>{score}</strong>
            </p>
            {score >= highScore && score > 0 && (
              <p style={{ color: '#FFEAA7', fontSize: '1.2rem', marginBottom: '20px' }}>
                🏆 New High Score!
              </p>
            )}
            <button
              onClick={startGame}
              style={{
                padding: '15px 40px',
                fontSize: '1.3rem',
                background: 'linear-gradient(45deg, #FF6B6B, #cc5555)',
                border: 'none',
                borderRadius: '30px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {gameState === 'won' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '10px',
            }}
          >
            <h2 style={{ color: '#4ECDC4', fontSize: '3rem', marginBottom: '20px' }}>
              🎉 YOU WON! 🎉
            </h2>
            <p style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '20px' }}>
              Score: <strong style={{ color: '#FFEAA7' }}>{score}</strong>
            </p>
            <button
              onClick={startGame}
              style={{
                padding: '15px 40px',
                fontSize: '1.3rem',
                background: 'linear-gradient(45deg, #4ECDC4, #3ba89e)',
                border: 'none',
                borderRadius: '30px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(78, 205, 196, 0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 0 30px rgba(78, 205, 196, 0.8)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 0 20px rgba(78, 205, 196, 0.5)';
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <p
        style={{
          color: '#666',
          marginTop: '20px',
          fontSize: '0.9rem',
        }}
      >
        Weekly Challenge #19 - Falling Breakout
      </p>
    </div>
  );
};

export default Completion19;
