import React, { useState, useCallback, useRef, useEffect } from 'react';

// Game states
const GAME_STATES = {
  IDLE: 'idle',
  WAITING: 'waiting',
  PITCH: 'pitch',
  HIT: 'hit',
  MISS: 'miss',
  TOO_EARLY: 'too_early',
  RESULTS: 'results',
};

// Pitch types with different speeds
const PITCH_TYPES = {
  fastball: { name: 'Fastball', speed: 95, color: '#ff4444', time: 400 },
  slider: { name: 'Slider', speed: 85, color: '#44aaff', time: 500 },
  changeup: { name: 'Changeup', speed: 75, color: '#44ff44', time: 600 },
  curveball: { name: 'Curveball', speed: 70, color: '#ffaa44', time: 650 },
};

// Helper to get reaction rating
const getReactionRating = (time) => {
  if (time < 200) return { rating: 'MLB Pro!', color: '#ffd700', emoji: '⭐' };
  if (time < 300) return { rating: 'All-Star', color: '#c0c0c0', emoji: '🏆' };
  if (time < 400) return { rating: 'Starter', color: '#cd7f32', emoji: '👍' };
  if (time < 500) return { rating: 'Rookie', color: '#4ade80', emoji: '🌱' };
  return { rating: 'Keep Practicing', color: '#888', emoji: '💪' };
};

// Baseball component
const Baseball = ({ isVisible, animationPhase }) => {
  const baseStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #fff 0%, #f0f0f0 50%, #ccc 100%)',
    boxShadow: '2px 4px 10px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(0,0,0,0.1)',
    position: 'absolute',
    transition: animationPhase === 'flying' ? 'all 0.3s ease-out' : 'none',
    opacity: isVisible ? 1 : 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const getPosition = () => {
    switch (animationPhase) {
      case 'pitcher':
        return { top: '20%', left: '50%', transform: 'translate(-50%, -50%) scale(0.5)' };
      case 'flying':
        return { top: '60%', left: '50%', transform: 'translate(-50%, -50%) scale(1.2)' };
      case 'plate':
        return { top: '75%', left: '50%', transform: 'translate(-50%, -50%) scale(1.5)' };
      default:
        return { top: '20%', left: '50%', transform: 'translate(-50%, -50%) scale(0.5)' };
    }
  };

  return (
    <div style={{ ...baseStyle, ...getPosition() }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M 20 50 Q 50 30 80 50" stroke="#cc0000" strokeWidth="3" fill="none" />
        <path d="M 20 50 Q 50 70 80 50" stroke="#cc0000" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
};

// Bat swing animation
const BatSwing = ({ isSwinging }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        width: '120px',
        height: '20px',
        background: 'linear-gradient(90deg, #8B4513 0%, #D2691E 50%, #8B4513 100%)',
        borderRadius: '10px',
        transformOrigin: 'left center',
        transform: isSwinging
          ? 'translateX(-50%) rotate(-45deg)'
          : 'translateX(-50%) rotate(45deg)',
        transition: 'transform 0.15s ease-out',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
      }}
    />
  );
};

// Stadium background
const Stadium = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #2d5016 100%)',
      overflow: 'hidden',
    }}
  >
    {/* Sky and stars */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'radial-gradient(circle at 50% 100%, #2d3a4f 0%, #1a1a2e 70%)',
      }}
    />

    {/* Stadium lights */}
    {[20, 80].map((left) => (
      <div
        key={left}
        style={{
          position: 'absolute',
          top: '5%',
          left: `${left}%`,
          width: '60px',
          height: '80px',
          background: 'linear-gradient(180deg, #333 0%, #222 100%)',
          borderRadius: '5px',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '40px',
            background:
              'radial-gradient(ellipse at center, rgba(255,255,200,0.8) 0%, transparent 70%)',
          }}
        />
      </div>
    ))}

    {/* Grass pattern */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: `
          repeating-linear-gradient(
            90deg,
            #2d5016 0px,
            #2d5016 40px,
            #3d6020 40px,
            #3d6020 80px
          )
        `,
      }}
    />

    {/* Pitcher's mound */}
    <div
      style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '50px',
        background: 'radial-gradient(ellipse at center, #c9a66b 0%, #8b6914 100%)',
        borderRadius: '50%',
      }}
    />

    {/* Home plate */}
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '60px',
        background: '#fff',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        boxShadow: '0 0 20px rgba(255,255,255,0.3)',
      }}
    />

    {/* Batter's box lines */}
    <div
      style={{
        position: 'absolute',
        bottom: '8%',
        left: 'calc(50% - 60px)',
        width: '40px',
        height: '80px',
        border: '3px solid rgba(255,255,255,0.5)',
        borderRadius: '5px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '8%',
        left: 'calc(50% + 20px)',
        width: '40px',
        height: '80px',
        border: '3px solid rgba(255,255,255,0.5)',
        borderRadius: '5px',
      }}
    />
  </div>
);

// Pitch type selector
const PitchSelector = ({ selectedPitch, onSelect, disabled }) => (
  <div
    style={{
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '10px',
    }}
  >
    {Object.entries(PITCH_TYPES).map(([key, pitch]) => (
      <button
        key={key}
        onClick={() => onSelect(key)}
        disabled={disabled}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          background:
            selectedPitch === key
              ? `linear-gradient(135deg, ${pitch.color} 0%, ${pitch.color}aa 100%)`
              : 'rgba(255,255,255,0.1)',
          color: '#fff',
          border: selectedPitch === key ? '2px solid #fff' : '2px solid transparent',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          minWidth: '100px',
        }}
      >
        <div>{pitch.name}</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>{pitch.speed} mph</div>
      </button>
    ))}
  </div>
);

// Stats display
const StatsDisplay = ({ attempts, hits, averageTime, bestTime }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      padding: '15px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '15px',
      margin: '10px 0',
    }}
  >
    {[
      { label: 'At Bats', value: attempts, icon: '⚾' },
      { label: 'Hits', value: hits, icon: '🎯' },
      { label: 'Avg Time', value: averageTime ? `${Math.round(averageTime)}ms` : '-', icon: '⏱️' },
      { label: 'Best Time', value: bestTime ? `${bestTime}ms` : '-', icon: '🏆' },
    ].map((stat, index) => (
      <div
        key={index}
        style={{
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.icon}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stat.value}</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>{stat.label}</div>
      </div>
    ))}
  </div>
);

// Result message component
const ResultMessage = ({ gameState, reactionTime, pitchType }) => {
  if (gameState === GAME_STATES.IDLE) {
    return (
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>⚾ Baseball Reflex Test</h2>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Test your reflexes like an MLB batter!</p>
      </div>
    );
  }

  if (gameState === GAME_STATES.WAITING) {
    return (
      <div style={{ textAlign: 'center', color: '#ffd700' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>🎯 Get Ready...</h2>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>Watch for the pitch and SWING!</p>
      </div>
    );
  }

  if (gameState === GAME_STATES.PITCH) {
    return (
      <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
        <h2 style={{ fontSize: '48px', animation: 'pulse 0.3s infinite' }}>⚾ SWING NOW!</h2>
      </div>
    );
  }

  if (gameState === GAME_STATES.TOO_EARLY) {
    return (
      <div style={{ textAlign: 'center', color: '#ff4444' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>❌ Too Early!</h2>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Wait for the pitch before swinging!</p>
      </div>
    );
  }

  if (gameState === GAME_STATES.MISS) {
    return (
      <div style={{ textAlign: 'center', color: '#ff8844' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>😅 Strike!</h2>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>Too slow! The pitch got past you.</p>
      </div>
    );
  }

  if (gameState === GAME_STATES.HIT && reactionTime) {
    const { rating, color, emoji } = getReactionRating(reactionTime);
    return (
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '5px', color }}>
          {emoji} {rating}! {emoji}
        </h2>
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#4ade80' }}>{reactionTime}ms</p>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          {pitchType && `${PITCH_TYPES[pitchType].name} at ${PITCH_TYPES[pitchType].speed} mph`}
        </p>
      </div>
    );
  }

  return null;
};

// History chart
const HistoryChart = ({ history }) => {
  if (history.length === 0) return null;

  const maxTime = Math.max(...history.map((h) => h.time), 500);
  const chartHeight = 100;

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '10px',
        padding: '15px',
        margin: '10px 0',
      }}
    >
      <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px' }}>📊 Reaction History</h4>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          height: `${chartHeight}px`,
          padding: '5px 0',
        }}
      >
        {history.slice(-20).map((item, index) => {
          const height = (item.time / maxTime) * chartHeight;
          const { color } = getReactionRating(item.time);
          return (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${height}px`,
                background: item.hit
                  ? `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`
                  : 'rgba(255,68,68,0.5)',
                borderRadius: '3px 3px 0 0',
                minWidth: '8px',
                transition: 'height 0.3s ease',
              }}
              title={`${item.time}ms - ${item.hit ? 'Hit' : 'Miss'}`}
            />
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
        }}
      >
        <span style={{ fontSize: '10px', color: '#888' }}>Older</span>
        <span style={{ fontSize: '10px', color: '#888' }}>Recent</span>
      </div>
    </div>
  );
};

// Difficulty comparison
const DifficultyInfo = () => (
  <div
    style={{
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '10px',
      padding: '15px',
      margin: '10px 0',
    }}
  >
    <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '14px' }}>
      ⚡ Real MLB Reaction Times
    </h4>
    <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}>
      <p style={{ margin: '5px 0' }}>
        🏟️ <strong style={{ color: '#fff' }}>400ms</strong> - Ball travels from pitcher to plate
      </p>
      <p style={{ margin: '5px 0' }}>
        👀 <strong style={{ color: '#fff' }}>150ms</strong> - Time to recognize pitch type
      </p>
      <p style={{ margin: '5px 0' }}>
        ⚡ <strong style={{ color: '#fff' }}>150ms</strong> - Swing execution time
      </p>
      <p style={{ margin: '5px 0' }}>
        🎯 <strong style={{ color: '#fff' }}>100ms</strong> - Decision window!
      </p>
    </div>
  </div>
);

// Main component
const Completion35 = () => {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [selectedPitch, setSelectedPitch] = useState('fastball');
  const [reactionTime, setReactionTime] = useState(null);
  const [ballPhase, setBallPhase] = useState('pitcher');
  const [isSwinging, setIsSwinging] = useState(false);
  const [stats, setStats] = useState({
    attempts: 0,
    hits: 0,
    totalTime: 0,
    bestTime: null,
  });
  const [history, setHistory] = useState([]);

  const pitchStartTime = useRef(null);
  const timeoutRef = useRef(null);
  const missTimeoutRef = useRef(null);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState(GAME_STATES.WAITING);
    setReactionTime(null);
    setBallPhase('pitcher');
    setIsSwinging(false);

    // Random delay before pitch (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;

    timeoutRef.current = setTimeout(() => {
      setGameState(GAME_STATES.PITCH);
      setBallPhase('flying');
      pitchStartTime.current = performance.now();

      // Ball reaches plate animation
      setTimeout(() => {
        setBallPhase('plate');
      }, 200);

      // Miss timeout based on pitch speed
      const pitchTime = PITCH_TYPES[selectedPitch].time;
      missTimeoutRef.current = setTimeout(() => {
        if (pitchStartTime.current) {
          setGameState(GAME_STATES.MISS);
          setStats((prev) => ({
            ...prev,
            attempts: prev.attempts + 1,
          }));
          setHistory((prev) => [...prev, { time: pitchTime + 100, hit: false }]);
          pitchStartTime.current = null;
        }
      }, pitchTime);
    }, delay);
  }, [selectedPitch]);

  const handleSwing = useCallback(() => {
    // Already processed
    if (gameState === GAME_STATES.HIT || gameState === GAME_STATES.MISS) return;

    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 200);

    if (gameState === GAME_STATES.WAITING) {
      // Swung too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState(GAME_STATES.TOO_EARLY);
      setStats((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
      }));
      return;
    }

    if (gameState === GAME_STATES.PITCH && pitchStartTime.current) {
      // Clear miss timeout
      if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);

      const time = Math.round(performance.now() - pitchStartTime.current);
      pitchStartTime.current = null;

      setReactionTime(time);
      setGameState(GAME_STATES.HIT);
      setHistory((prev) => [...prev, { time, hit: true }]);
      setStats((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
        hits: prev.hits + 1,
        totalTime: prev.totalTime + time,
        bestTime: prev.bestTime === null ? time : Math.min(prev.bestTime, time),
      }));
    }
  }, [gameState]);

  const resetGame = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
    setGameState(GAME_STATES.IDLE);
    setReactionTime(null);
    setBallPhase('pitcher');
    setIsSwinging(false);
    pitchStartTime.current = null;
  }, []);

  const averageTime = stats.hits > 0 ? stats.totalTime / stats.hits : null;

  const isPlaying = gameState === GAME_STATES.WAITING || gameState === GAME_STATES.PITCH;

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Game area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          cursor: isPlaying ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={isPlaying ? handleSwing : undefined}
        onKeyDown={(e) => {
          if (e.code === 'Space' && isPlaying) {
            e.preventDefault();
            handleSwing();
          }
        }}
        tabIndex={0}
      >
        <Stadium />

        {/* Baseball */}
        <Baseball isVisible={isPlaying} animationPhase={ballPhase} />

        {/* Bat */}
        <BatSwing isSwinging={isSwinging} />

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <ResultMessage
            gameState={gameState}
            reactionTime={reactionTime}
            pitchType={selectedPitch}
          />

          {/* Action buttons */}
          <div style={{ marginTop: '20px' }}>
            {gameState === GAME_STATES.IDLE && (
              <button
                onClick={startGame}
                style={{
                  padding: '20px 50px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                ⚾ Start Pitching!
              </button>
            )}

            {(gameState === GAME_STATES.HIT ||
              gameState === GAME_STATES.MISS ||
              gameState === GAME_STATES.TOO_EARLY) && (
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={startGame}
                  style={{
                    padding: '15px 35px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                  }}
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={resetGame}
                  style={{
                    padding: '15px 35px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🏠 Menu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions overlay when playing */}
        {isPlaying && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              padding: '15px 30px',
              borderRadius: '25px',
              color: '#fff',
              fontSize: '18px',
              animation: 'pulse 1s infinite',
            }}
          >
            👆 Click or press SPACE to swing!
          </div>
        )}
      </div>

      {/* Control panel */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          padding: '20px',
          borderTop: '2px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Pitch selector */}
          <div style={{ marginBottom: '15px' }}>
            <h4
              style={{
                color: '#fff',
                margin: '0 0 10px 0',
                textAlign: 'center',
                fontSize: '14px',
                opacity: 0.7,
              }}
            >
              Select Pitch Type:
            </h4>
            <PitchSelector
              selectedPitch={selectedPitch}
              onSelect={setSelectedPitch}
              disabled={isPlaying}
            />
          </div>

          {/* Stats */}
          <StatsDisplay
            attempts={stats.attempts}
            hits={stats.hits}
            averageTime={averageTime}
            bestTime={stats.bestTime}
          />

          {/* History chart and info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >
            <HistoryChart history={history} />
            <DifficultyInfo />
          </div>
        </div>
      </div>

      {/* CSS animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
            50% { opacity: 0.8; transform: translateX(-50%) scale(1.02); }
          }
        `}
      </style>
    </div>
  );
};

export default Completion35;
