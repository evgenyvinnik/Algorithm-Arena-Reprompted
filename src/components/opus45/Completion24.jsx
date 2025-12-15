import React, { useState, useEffect, useRef } from 'react';

const Completion24 = () => {
  const [position, setPosition] = useState({ x: 50, y: 400 });
  const [isMoving, setIsMoving] = useState(false);
  const [walkPhase, setWalkPhase] = useState(0);
  const [facingRight, setFacingRight] = useState(true);
  const animationRef = useRef(null);
  const keysPressed = useRef({ left: false, right: false });

  // Stair configuration
  const stairCount = 10;
  const stairWidth = 80;
  const stairHeight = 40;
  const stairStartX = 100;
  const stairStartY = 440;

  // Get the Y position based on X position (stairs)
  const getStairY = (x) => {
    const relativeX = x - stairStartX;
    if (relativeX < 0) return stairStartY;
    const stairIndex = Math.floor(relativeX / stairWidth);
    if (stairIndex >= stairCount) return stairStartY - stairCount * stairHeight;
    return stairStartY - stairIndex * stairHeight;
  };

  // Walk animation
  useEffect(() => {
    let walkInterval;
    if (isMoving) {
      walkInterval = setInterval(() => {
        setWalkPhase((prev) => (prev + 1) % 8);
      }, 80);
    } else {
      walkInterval = setInterval(() => {
        setWalkPhase(0);
      }, 80);
    }
    return () => clearInterval(walkInterval);
  }, [isMoving]);

  // Animation loop and key handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        keysPressed.current.right = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        keysPressed.current.left = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        keysPressed.current.right = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        keysPressed.current.left = false;
      }
    };

    const moveCharacter = () => {
      const speed = 3;
      let dx = 0;

      if (keysPressed.current.right) {
        dx = speed;
        setFacingRight(true);
      }
      if (keysPressed.current.left) {
        dx = -speed;
        setFacingRight(false);
      }

      if (dx !== 0) {
        setIsMoving(true);
        setPosition((prev) => {
          const newX = Math.max(
            20,
            Math.min(prev.x + dx, stairStartX + stairCount * stairWidth + 50)
          );
          const targetY = getStairY(newX);
          // Smooth Y transition for climbing
          const newY = prev.y + (targetY - prev.y) * 0.3;
          return { x: newX, y: newY };
        });
      } else {
        setIsMoving(false);
      }

      animationRef.current = requestAnimationFrame(moveCharacter);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    animationRef.current = requestAnimationFrame(moveCharacter);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate leg positions for walking animation
  const getLegAnimation = () => {
    const phases = [
      { leftLeg: { hip: 15, knee: 20, foot: 0 }, rightLeg: { hip: -15, knee: 0, foot: 10 } },
      { leftLeg: { hip: 10, knee: 30, foot: -5 }, rightLeg: { hip: -10, knee: 5, foot: 15 } },
      { leftLeg: { hip: 0, knee: 35, foot: -10 }, rightLeg: { hip: 0, knee: 10, foot: 20 } },
      { leftLeg: { hip: -10, knee: 25, foot: -5 }, rightLeg: { hip: 10, knee: 15, foot: 15 } },
      { leftLeg: { hip: -15, knee: 0, foot: 10 }, rightLeg: { hip: 15, knee: 20, foot: 0 } },
      { leftLeg: { hip: -10, knee: 5, foot: 15 }, rightLeg: { hip: 10, knee: 30, foot: -5 } },
      { leftLeg: { hip: 0, knee: 10, foot: 20 }, rightLeg: { hip: 0, knee: 35, foot: -10 } },
      { leftLeg: { hip: 10, knee: 15, foot: 15 }, rightLeg: { hip: -10, knee: 25, foot: -5 } },
    ];
    return phases[walkPhase];
  };

  // Calculate arm positions for walking animation
  const getArmAnimation = () => {
    const phases = [
      { leftArm: -20, rightArm: 20 },
      { leftArm: -15, rightArm: 25 },
      { leftArm: -5, rightArm: 20 },
      { leftArm: 5, rightArm: 10 },
      { leftArm: 20, rightArm: -20 },
      { leftArm: 25, rightArm: -15 },
      { leftArm: 20, rightArm: -5 },
      { leftArm: 10, rightArm: 5 },
    ];
    return phases[walkPhase];
  };

  const legAnim = getLegAnimation();
  const armAnim = getArmAnimation();

  // Body bob animation
  const bodyBob = isMoving ? Math.sin((walkPhase * Math.PI) / 4) * 3 : 0;

  const renderCharacter = () => {
    const scale = facingRight ? 1 : -1;

    return (
      <g transform={`translate(${position.x}, ${position.y - 60 + bodyBob}) scale(${scale}, 1)`}>
        {/* Shadow */}
        <ellipse cx="0" cy="62" rx="15" ry="5" fill="rgba(0,0,0,0.2)" />

        {/* Left Leg (back) */}
        <g transform={`rotate(${legAnim.leftLeg.hip}, 0, 30)`}>
          <line
            x1="0"
            y1="30"
            x2="0"
            y2="45"
            stroke="#2D3436"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <g transform={`translate(0, 45) rotate(${legAnim.leftLeg.knee}, 0, 0)`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="15"
              stroke="#2D3436"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <ellipse cx={legAnim.leftLeg.foot} cy="18" rx="8" ry="4" fill="#5D4037" />
          </g>
        </g>

        {/* Right Leg (front) */}
        <g transform={`rotate(${legAnim.rightLeg.hip}, 0, 30)`}>
          <line
            x1="0"
            y1="30"
            x2="0"
            y2="45"
            stroke="#2D3436"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <g transform={`translate(0, 45) rotate(${legAnim.rightLeg.knee}, 0, 0)`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="15"
              stroke="#2D3436"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <ellipse cx={legAnim.rightLeg.foot} cy="18" rx="8" ry="4" fill="#5D4037" />
          </g>
        </g>

        {/* Body */}
        <ellipse cx="0" cy="20" rx="12" ry="15" fill="#3498DB" />

        {/* Left Arm (back) */}
        <g transform={`rotate(${armAnim.leftArm}, -8, 10)`}>
          <line
            x1="-8"
            y1="10"
            x2="-8"
            y2="28"
            stroke="#FDBF60"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Right Arm (front) */}
        <g transform={`rotate(${armAnim.rightArm}, 8, 10)`}>
          <line
            x1="8"
            y1="10"
            x2="8"
            y2="28"
            stroke="#FDBF60"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Head */}
        <circle cx="0" cy="-5" r="12" fill="#FDBF60" />

        {/* Hair */}
        <path d="M -10 -10 Q -8 -18 0 -18 Q 8 -18 10 -10" fill="#5D4037" />

        {/* Eyes */}
        <circle cx="4" cy="-6" r="2" fill="#2D3436" />

        {/* Mouth */}
        <path d="M 2 0 Q 6 2 8 0" stroke="#2D3436" strokeWidth="1.5" fill="none" />
      </g>
    );
  };

  const renderStairs = () => {
    const stairs = [];
    for (let i = 0; i < stairCount; i++) {
      const x = stairStartX + i * stairWidth;
      const y = stairStartY - i * stairHeight;

      // Main stair surface
      stairs.push(
        <rect
          key={`stair-top-${i}`}
          x={x}
          y={y}
          width={stairWidth}
          height={10}
          fill="#8B7355"
          stroke="#6B5344"
          strokeWidth="1"
        />
      );

      // Stair front face
      stairs.push(
        <rect
          key={`stair-front-${i}`}
          x={x}
          y={y + 10}
          width={stairWidth}
          height={stairHeight - 10}
          fill="#A08060"
          stroke="#6B5344"
          strokeWidth="1"
        />
      );

      // Stair depth shading
      stairs.push(
        <line
          key={`stair-shadow-${i}`}
          x1={x + 5}
          y1={y + 5}
          x2={x + stairWidth - 5}
          y2={y + 5}
          stroke="#9B8365"
          strokeWidth="2"
        />
      );
    }

    // Ground before stairs
    stairs.push(
      <rect key="ground" x={0} y={stairStartY} width={stairStartX} height={60} fill="#7CB342" />
    );

    // Platform at top
    stairs.push(
      <rect
        key="platform"
        x={stairStartX + stairCount * stairWidth}
        y={stairStartY - stairCount * stairHeight}
        width={150}
        height={10}
        fill="#8B7355"
        stroke="#6B5344"
        strokeWidth="1"
      />
    );

    return stairs;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#1a1a2e',
        minHeight: '100vh',
        color: '#eee',
      }}
    >
      <h2 style={{ marginBottom: '10px', color: '#64B5F6' }}>🚶 Stairs Animation Challenge</h2>
      <p style={{ marginBottom: '20px', color: '#aaa' }}>
        Press{' '}
        <kbd
          style={{
            background: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #555',
          }}
        >
          →
        </kbd>{' '}
        or{' '}
        <kbd
          style={{
            background: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #555',
          }}
        >
          D
        </kbd>{' '}
        to move right,{' '}
        <kbd
          style={{
            background: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #555',
          }}
        >
          ←
        </kbd>{' '}
        or{' '}
        <kbd
          style={{
            background: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #555',
          }}
        >
          A
        </kbd>{' '}
        to move left
      </p>

      <svg
        width="950"
        height="500"
        style={{
          backgroundColor: '#87CEEB',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        tabIndex={0}
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E90FF" />
            <stop offset="100%" stopColor="#87CEEB" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="950" height="500" fill="url(#skyGradient)" />

        {/* Sun */}
        <circle cx="800" cy="80" r="50" fill="#FFD700" opacity="0.9" />
        <circle cx="800" cy="80" r="60" fill="#FFD700" opacity="0.3" />

        {/* Clouds */}
        <g opacity="0.8">
          <ellipse cx="150" cy="60" rx="40" ry="20" fill="white" />
          <ellipse cx="180" cy="50" rx="30" ry="18" fill="white" />
          <ellipse cx="120" cy="55" rx="25" ry="15" fill="white" />
        </g>
        <g opacity="0.8">
          <ellipse cx="500" cy="100" rx="50" ry="25" fill="white" />
          <ellipse cx="540" cy="90" rx="35" ry="20" fill="white" />
          <ellipse cx="460" cy="95" rx="30" ry="18" fill="white" />
        </g>

        {/* Ground */}
        <rect x="0" y="450" width="950" height="50" fill="#7CB342" />

        {/* Stairs */}
        {renderStairs()}

        {/* Character */}
        {renderCharacter()}

        {/* Trees */}
        <g>
          <rect x="850" y="380" width="15" height="70" fill="#8B4513" />
          <circle cx="857" cy="360" r="35" fill="#228B22" />
          <circle cx="840" cy="375" r="25" fill="#2E8B57" />
          <circle cx="875" cy="370" r="28" fill="#2E8B57" />
        </g>
      </svg>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#2a2a4e',
          borderRadius: '8px',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
          The character features natural walking animation with arm swing, leg movement, and body
          bob. Watch as they smoothly climb up and down the stairs!
        </p>
      </div>
    </div>
  );
};

export default Completion24;
