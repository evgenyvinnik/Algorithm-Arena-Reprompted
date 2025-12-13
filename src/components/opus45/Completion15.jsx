import React, { useState, useRef, useEffect, useCallback } from 'react';

// Random number in range
const random = (min, max) => Math.random() * (max - min) + min;

// Generate a random cactus color palette
const generatePalette = () => {
  const palettes = [
    { main: '#2D5A27', light: '#4A7C43', dark: '#1E3D1A', flower: '#FF69B4', pot: '#8B4513' },
    { main: '#3A6B35', light: '#5C8C55', dark: '#254D22', flower: '#FFD700', pot: '#A0522D' },
    { main: '#228B22', light: '#32CD32', dark: '#006400', flower: '#FF4500', pot: '#8B4513' },
    { main: '#355E3B', light: '#4F7942', dark: '#1B3A1B', flower: '#FF1493', pot: '#CD853F' },
    { main: '#4A7023', light: '#6B8E23', dark: '#2E4615', flower: '#FF6347', pot: '#D2691E' },
  ];
  return palettes[Math.floor(Math.random() * palettes.length)];
};

// Cactus Arm segment
const CactusArm = ({ x, y, angle, length, thickness, depth, palette, maxDepth }) => {
  if (depth > maxDepth) return null;

  const endX = x + Math.sin((angle * Math.PI) / 180) * length;
  const endY = y - Math.cos((angle * Math.PI) / 180) * length;

  // Calculate control points for a curved arm
  const midX = (x + endX) / 2 + Math.sin(((angle + 90) * Math.PI) / 180) * (length * 0.1);
  const midY = (y + endY) / 2 - Math.cos(((angle + 90) * Math.PI) / 180) * (length * 0.1);

  const shouldBranch = Math.random() > 0.3 && depth < maxDepth;
  const hasFlower = Math.random() > 0.7 && depth > 1;

  return (
    <g>
      {/* Main arm segment */}
      <path
        d={`M ${x} ${y} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke={palette.main}
        strokeWidth={thickness}
        fill="none"
        strokeLinecap="round"
      />
      {/* Lighter edge for 3D effect */}
      <path
        d={`M ${x} ${y} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke={palette.light}
        strokeWidth={thickness * 0.3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${length * 0.1} ${length * 0.2}`}
      />
      {/* Spines */}
      {Array.from({ length: Math.floor(length / 15) }).map((_, i) => {
        const t = (i + 1) / (Math.floor(length / 15) + 1);
        const spineX = x + (endX - x) * t;
        const spineY = y + (endY - y) * t;
        return (
          <g key={i}>
            <line
              x1={spineX}
              y1={spineY}
              x2={spineX + Math.cos((angle * Math.PI) / 180) * 5}
              y2={spineY + Math.sin((angle * Math.PI) / 180) * 5}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
            <line
              x1={spineX}
              y1={spineY}
              x2={spineX - Math.cos((angle * Math.PI) / 180) * 5}
              y2={spineY - Math.sin((angle * Math.PI) / 180) * 5}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
          </g>
        );
      })}
      {/* Flower at the end */}
      {hasFlower && (
        <g>
          <circle cx={endX} cy={endY - 3} r={8} fill={palette.flower} />
          <circle cx={endX - 5} cy={endY - 6} r={6} fill={palette.flower} opacity={0.8} />
          <circle cx={endX + 5} cy={endY - 6} r={6} fill={palette.flower} opacity={0.8} />
          <circle cx={endX - 3} cy={endY + 2} r={5} fill={palette.flower} opacity={0.8} />
          <circle cx={endX + 3} cy={endY + 2} r={5} fill={palette.flower} opacity={0.8} />
          <circle cx={endX} cy={endY - 3} r={4} fill="#FFD700" />
        </g>
      )}
      {/* Recursive branches */}
      {shouldBranch && (
        <>
          <CactusArm
            x={endX}
            y={endY}
            angle={angle + random(20, 50)}
            length={length * random(0.6, 0.8)}
            thickness={thickness * 0.7}
            depth={depth + 1}
            palette={palette}
            maxDepth={maxDepth}
          />
          {Math.random() > 0.5 && (
            <CactusArm
              x={endX}
              y={endY}
              angle={angle - random(20, 50)}
              length={length * random(0.6, 0.8)}
              thickness={thickness * 0.7}
              depth={depth + 1}
              palette={palette}
              maxDepth={maxDepth}
            />
          )}
        </>
      )}
    </g>
  );
};

// Saguaro-style cactus
const SaguaroCactus = ({ x, y, height, palette }) => {
  const bodyWidth = height * 0.15;
  const hasLeftArm = Math.random() > 0.3;
  const hasRightArm = Math.random() > 0.3;
  const leftArmHeight = random(0.3, 0.6) * height;
  const rightArmHeight = random(0.3, 0.6) * height;
  const hasFlower = Math.random() > 0.5;

  return (
    <g>
      {/* Main body */}
      <rect
        x={x - bodyWidth / 2}
        y={y - height}
        width={bodyWidth}
        height={height}
        rx={bodyWidth / 2}
        fill={palette.main}
      />
      {/* Body highlight */}
      <rect
        x={x - bodyWidth / 4}
        y={y - height + 10}
        width={bodyWidth / 4}
        height={height - 20}
        rx={bodyWidth / 8}
        fill={palette.light}
        opacity={0.5}
      />
      {/* Ribs/lines on body */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={x - bodyWidth / 2 + ((i + 1) * bodyWidth) / 6}
          y1={y - height + bodyWidth / 2}
          x2={x - bodyWidth / 2 + ((i + 1) * bodyWidth) / 6}
          y2={y - bodyWidth / 2}
          stroke={palette.dark}
          strokeWidth={1}
          opacity={0.3}
        />
      ))}
      {/* Left arm */}
      {hasLeftArm && (
        <g>
          <path
            d={`M ${x - bodyWidth / 2} ${y - leftArmHeight} 
                H ${x - bodyWidth / 2 - bodyWidth * 1.5}
                V ${y - leftArmHeight - height * 0.3}
                Q ${x - bodyWidth / 2 - bodyWidth * 1.5} ${y - leftArmHeight - height * 0.3 - bodyWidth / 2}
                  ${x - bodyWidth / 2 - bodyWidth * 1.5 + bodyWidth * 0.8} ${y - leftArmHeight - height * 0.3 - bodyWidth / 2}
                V ${y - leftArmHeight}
                Q ${x - bodyWidth / 2 - bodyWidth * 1.5 + bodyWidth * 0.8} ${y - leftArmHeight + bodyWidth / 2}
                  ${x - bodyWidth / 2} ${y - leftArmHeight + bodyWidth / 2}`}
            fill={palette.main}
          />
        </g>
      )}
      {/* Right arm */}
      {hasRightArm && (
        <g>
          <path
            d={`M ${x + bodyWidth / 2} ${y - rightArmHeight} 
                H ${x + bodyWidth / 2 + bodyWidth * 1.5}
                V ${y - rightArmHeight - height * 0.25}
                Q ${x + bodyWidth / 2 + bodyWidth * 1.5} ${y - rightArmHeight - height * 0.25 - bodyWidth / 2}
                  ${x + bodyWidth / 2 + bodyWidth * 1.5 - bodyWidth * 0.8} ${y - rightArmHeight - height * 0.25 - bodyWidth / 2}
                V ${y - rightArmHeight}
                Q ${x + bodyWidth / 2 + bodyWidth * 1.5 - bodyWidth * 0.8} ${y - rightArmHeight + bodyWidth / 2}
                  ${x + bodyWidth / 2} ${y - rightArmHeight + bodyWidth / 2}`}
            fill={palette.main}
          />
        </g>
      )}
      {/* Top flower */}
      {hasFlower && (
        <g>
          <ellipse cx={x} cy={y - height - 5} rx={12} ry={8} fill={palette.flower} />
          <ellipse
            cx={x - 8}
            cy={y - height - 8}
            rx={8}
            ry={6}
            fill={palette.flower}
            opacity={0.8}
          />
          <ellipse
            cx={x + 8}
            cy={y - height - 8}
            rx={8}
            ry={6}
            fill={palette.flower}
            opacity={0.8}
          />
          <circle cx={x} cy={y - height - 5} r={5} fill="#FFD700" />
        </g>
      )}
      {/* Spines */}
      {Array.from({ length: Math.floor(height / 20) }).map((_, i) => {
        const spineY = y - height + 15 + i * 20;
        return (
          <g key={i}>
            <line
              x1={x - bodyWidth / 2}
              y1={spineY}
              x2={x - bodyWidth / 2 - 6}
              y2={spineY - 3}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
            <line
              x1={x + bodyWidth / 2}
              y1={spineY}
              x2={x + bodyWidth / 2 + 6}
              y2={spineY - 3}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
};

// Round barrel cactus
const BarrelCactus = ({ x, y, size, palette }) => {
  const ribs = Math.floor(random(8, 16));
  const hasFlower = Math.random() > 0.5;

  return (
    <g>
      {/* Main body */}
      <ellipse cx={x} cy={y - size * 0.4} rx={size * 0.5} ry={size * 0.4} fill={palette.main} />
      {/* Ribs */}
      {Array.from({ length: ribs }).map((_, i) => {
        const angle = (i / ribs) * Math.PI;
        const ribX = x + Math.cos(angle) * size * 0.5;
        return (
          <ellipse
            key={i}
            cx={ribX}
            cy={y - size * 0.4}
            rx={2}
            ry={size * 0.35}
            fill={i % 2 === 0 ? palette.light : palette.dark}
            opacity={0.5}
          />
        );
      })}
      {/* Spines */}
      {Array.from({ length: ribs }).map((_, i) => {
        const angle = (i / ribs) * Math.PI * 2;
        const spineX = x + Math.cos(angle) * size * 0.5;
        const spineY = y - size * 0.4 + Math.sin(angle) * size * 0.3;
        return (
          <g key={i}>
            <line
              x1={spineX}
              y1={spineY}
              x2={spineX + Math.cos(angle) * 8}
              y2={spineY + Math.sin(angle) * 8}
              stroke="#F5F5DC"
              strokeWidth={1.5}
            />
            <line
              x1={spineX}
              y1={spineY}
              x2={spineX + Math.cos(angle + 0.3) * 6}
              y2={spineY + Math.sin(angle + 0.3) * 6}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
            <line
              x1={spineX}
              y1={spineY}
              x2={spineX + Math.cos(angle - 0.3) * 6}
              y2={spineY + Math.sin(angle - 0.3) * 6}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
          </g>
        );
      })}
      {/* Flower crown */}
      {hasFlower && (
        <g>
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI + Math.PI;
            const flowerX = x + Math.cos(angle) * size * 0.25;
            const flowerY = y - size * 0.75 + Math.sin(angle) * size * 0.1;
            return <circle key={i} cx={flowerX} cy={flowerY} r={6} fill={palette.flower} />;
          })}
          <circle cx={x} cy={y - size * 0.78} r={4} fill="#FFD700" />
        </g>
      )}
    </g>
  );
};

// Prickly pear / paddle cactus
const PaddleCactus = ({ x, y, depth, angle, size, palette, maxDepth }) => {
  if (depth > maxDepth) return null;

  const paddleWidth = size * 0.6;
  const paddleHeight = size;
  const endY = y - paddleHeight * Math.cos((angle * Math.PI) / 180);
  const endX = x + paddleHeight * Math.sin((angle * Math.PI) / 180);

  const hasLeftPaddle = Math.random() > 0.4 && depth < maxDepth;
  const hasRightPaddle = Math.random() > 0.4 && depth < maxDepth;
  const hasFlower = Math.random() > 0.6 && depth > 0;

  return (
    <g>
      {/* Paddle */}
      <ellipse
        cx={(x + endX) / 2}
        cy={(y + endY) / 2}
        rx={paddleWidth / 2}
        ry={paddleHeight / 2}
        fill={palette.main}
        transform={`rotate(${angle}, ${(x + endX) / 2}, ${(y + endY) / 2})`}
      />
      {/* Paddle highlight */}
      <ellipse
        cx={(x + endX) / 2 - paddleWidth * 0.1}
        cy={(y + endY) / 2}
        rx={paddleWidth / 4}
        ry={paddleHeight / 2.5}
        fill={palette.light}
        opacity={0.4}
        transform={`rotate(${angle}, ${(x + endX) / 2}, ${(y + endY) / 2})`}
      />
      {/* Spine dots */}
      {Array.from({ length: 8 }).map((_, i) => {
        const dotAngle = (i / 8) * Math.PI * 2;
        const dotX =
          (x + endX) / 2 + Math.cos(dotAngle + (angle * Math.PI) / 180) * (paddleWidth / 3);
        const dotY =
          (y + endY) / 2 + Math.sin(dotAngle + (angle * Math.PI) / 180) * (paddleHeight / 3);
        return (
          <g key={i}>
            <circle cx={dotX} cy={dotY} r={3} fill={palette.dark} opacity={0.5} />
            <line
              x1={dotX}
              y1={dotY}
              x2={dotX + Math.cos(dotAngle) * 4}
              y2={dotY + Math.sin(dotAngle) * 4}
              stroke="#F5F5DC"
              strokeWidth={1}
            />
          </g>
        );
      })}
      {/* Flower */}
      {hasFlower && (
        <g>
          <ellipse cx={endX} cy={endY - 5} rx={10} ry={7} fill={palette.flower} />
          <circle cx={endX} cy={endY - 5} r={4} fill="#FFD700" />
        </g>
      )}
      {/* Recursive paddles */}
      {hasLeftPaddle && (
        <PaddleCactus
          x={endX - paddleWidth * 0.3}
          y={endY}
          depth={depth + 1}
          angle={angle - random(20, 40)}
          size={size * 0.75}
          palette={palette}
          maxDepth={maxDepth}
        />
      )}
      {hasRightPaddle && (
        <PaddleCactus
          x={endX + paddleWidth * 0.3}
          y={endY}
          depth={depth + 1}
          angle={angle + random(20, 40)}
          size={size * 0.75}
          palette={palette}
          maxDepth={maxDepth}
        />
      )}
    </g>
  );
};

// Pot component
const Pot = ({ x, y, width, height, color }) => (
  <g>
    <path
      d={`M ${x - width / 2} ${y}
          L ${x - width / 2 + width * 0.1} ${y + height}
          L ${x + width / 2 - width * 0.1} ${y + height}
          L ${x + width / 2} ${y}
          Z`}
      fill={color}
    />
    <rect x={x - width / 2 - 5} y={y - 8} width={width + 10} height={12} rx={3} fill={color} />
    <rect
      x={x - width / 2 - 5}
      y={y - 8}
      width={width + 10}
      height={6}
      rx={3}
      fill="#000"
      opacity={0.2}
    />
    {/* Soil */}
    <ellipse cx={x} cy={y} rx={width / 2 - 2} ry={8} fill="#3D2817" />
    <ellipse cx={x} cy={y - 2} rx={width / 2 - 5} ry={5} fill="#4A3520" />
  </g>
);

// Ground with sand/rocks
const Ground = ({ width, height }) => (
  <g>
    <rect x={0} y={height - 60} width={width} height={60} fill="#E6D5AC" />
    {/* Sand texture */}
    {Array.from({ length: 50 }).map((_, i) => (
      <circle
        key={i}
        cx={random(0, width)}
        cy={random(height - 55, height - 5)}
        r={random(1, 3)}
        fill={Math.random() > 0.5 ? '#D4C4A0' : '#C9B896'}
      />
    ))}
    {/* Small rocks */}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse
        key={`rock-${i}`}
        cx={random(20, width - 20)}
        cy={random(height - 40, height - 10)}
        rx={random(5, 15)}
        ry={random(3, 8)}
        fill={`hsl(30, ${random(10, 30)}%, ${random(40, 60)}%)`}
      />
    ))}
  </g>
);

// Background with gradient sky
const Background = ({ width, height, isNight }) => (
  <g>
    <defs>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        {isNight ? (
          <>
            <stop offset="0%" stopColor="#0a0a23" />
            <stop offset="50%" stopColor="#1a1a3a" />
            <stop offset="100%" stopColor="#2d1b4e" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#B0E2FF" />
            <stop offset="100%" stopColor="#FFE4B5" />
          </>
        )}
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={width} height={height} fill="url(#skyGradient)" />
    {/* Sun/Moon */}
    {isNight ? (
      <>
        <circle cx={width - 80} cy={60} r={30} fill="#F5F5DC" opacity={0.9} />
        <circle cx={width - 70} cy={55} r={30} fill="url(#skyGradient)" />
        {/* Stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={random(10, width - 10)}
            cy={random(10, height - 100)}
            r={random(0.5, 2)}
            fill="#FFF"
            opacity={random(0.3, 1)}
          />
        ))}
      </>
    ) : (
      <>
        <circle cx={width - 60} cy={50} r={35} fill="#FFD700" opacity={0.9} />
        <circle cx={width - 60} cy={50} r={30} fill="#FFEB3B" />
      </>
    )}
    {/* Clouds (day only) */}
    {!isNight &&
      Array.from({ length: 3 }).map((_, i) => {
        const cloudX = random(50, width - 100);
        const cloudY = random(30, 100);
        return (
          <g key={i} opacity={0.8}>
            <ellipse cx={cloudX} cy={cloudY} rx={40} ry={20} fill="#FFF" />
            <ellipse cx={cloudX - 25} cy={cloudY + 5} rx={25} ry={15} fill="#FFF" />
            <ellipse cx={cloudX + 30} cy={cloudY + 5} rx={30} ry={15} fill="#FFF" />
          </g>
        );
      })}
    {/* Mountains in background */}
    <polygon
      points={`0,${height - 60} 100,${height - 150} 200,${height - 60}`}
      fill="#C9A86C"
      opacity={0.5}
    />
    <polygon
      points={`150,${height - 60} 280,${height - 200} 400,${height - 60}`}
      fill="#B8956E"
      opacity={0.5}
    />
    <polygon
      points={`300,${height - 60} 450,${height - 130} 600,${height - 60}`}
      fill="#C9A86C"
      opacity={0.5}
    />
  </g>
);

const Completion15 = () => {
  const [seed, setSeed] = useState(Date.now());
  const [cactusType, setCactusType] = useState('random');
  const [showPot, setShowPot] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [cactusCount, setCactusCount] = useState(3);
  const svgRef = useRef(null);

  const width = 600;
  const height = 450;

  // Generate new cactus
  const regenerate = useCallback(() => {
    setSeed(Date.now());
  }, []);

  // Download SVG
  const downloadSVG = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cactus-${seed}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [seed]);

  // Download PNG
  const downloadPNG = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `cactus-${seed}.png`;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [seed]);

  // Reset random seed for consistent rendering
  useEffect(() => {
    // Force re-render on seed change
  }, [seed]);

  // Generate cacti based on seed
  const renderCacti = () => {
    // Seed the random number generator (pseudo-seeding by setting Math.random calls)
    let seededRandom = seed;
    const nextRandom = () => {
      seededRandom = (seededRandom * 9301 + 49297) % 233280;
      return seededRandom / 233280;
    };

    // Override Math.random temporarily
    const originalRandom = Math.random;
    Math.random = nextRandom;

    const cacti = [];
    const spacing = width / (cactusCount + 1);

    for (let i = 0; i < cactusCount; i++) {
      const x = spacing * (i + 1) + random(-30, 30);
      const palette = generatePalette();
      const type =
        cactusType === 'random'
          ? ['saguaro', 'barrel', 'paddle', 'branching'][Math.floor(Math.random() * 4)]
          : cactusType;

      const baseY = height - 60;
      const potHeight = 50;
      const cactusY = showPot ? baseY - potHeight + 5 : baseY;

      cacti.push(
        <g key={i}>
          {showPot && (
            <Pot
              x={x}
              y={baseY - potHeight + 10}
              width={type === 'barrel' ? 80 : 60}
              height={potHeight}
              color={palette.pot}
            />
          )}
          {type === 'saguaro' && (
            <SaguaroCactus x={x} y={cactusY} height={random(120, 180)} palette={palette} />
          )}
          {type === 'barrel' && (
            <BarrelCactus x={x} y={cactusY} size={random(60, 90)} palette={palette} />
          )}
          {type === 'paddle' && (
            <PaddleCactus
              x={x}
              y={cactusY}
              depth={0}
              angle={0}
              size={random(50, 70)}
              palette={palette}
              maxDepth={3}
            />
          )}
          {type === 'branching' && (
            <CactusArm
              x={x}
              y={cactusY}
              angle={0}
              length={random(80, 120)}
              thickness={random(15, 25)}
              depth={0}
              palette={palette}
              maxDepth={4}
            />
          )}
        </g>
      );
    }

    // Restore original Math.random
    Math.random = originalRandom;

    return cacti;
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #1a4a3a 0%, #0d2820 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '2.5rem',
      margin: '0',
      background: 'linear-gradient(90deg, #4ECDC4, #2ECC71)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      color: '#888',
      fontSize: '0.9rem',
      marginTop: '5px',
    },
    canvas: {
      background: '#fff',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      marginBottom: '20px',
      overflow: 'hidden',
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      justifyContent: 'center',
      maxWidth: '600px',
    },
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontSize: '0.8rem',
      color: '#aaa',
    },
    select: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: 'none',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
      minWidth: '120px',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    generateButton: {
      background: 'linear-gradient(90deg, #4ECDC4, #2ECC71)',
      color: '#fff',
    },
    downloadButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
    slider: {
      width: '100px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌵 Cactus Generator</h1>
        <p style={styles.subtitle}>Procedurally generated desert cacti</p>
      </header>

      <div style={styles.canvas}>
        <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Background width={width} height={height} isNight={isNight} />
          {!showPot && <Ground width={width} height={height} />}
          {renderCacti()}
        </svg>
      </div>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <span style={styles.label}>Cactus Type</span>
          <select
            style={styles.select}
            value={cactusType}
            onChange={(e) => setCactusType(e.target.value)}
          >
            <option value="random">Random</option>
            <option value="saguaro">Saguaro</option>
            <option value="barrel">Barrel</option>
            <option value="paddle">Prickly Pear</option>
            <option value="branching">Branching</option>
          </select>
        </div>

        <div style={styles.controlGroup}>
          <span style={styles.label}>Count: {cactusCount}</span>
          <input
            type="range"
            min="1"
            max="5"
            value={cactusCount}
            onChange={(e) => setCactusCount(parseInt(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.controlGroup}>
          <span style={styles.label}>Options</span>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={showPot}
              onChange={(e) => setShowPot(e.target.checked)}
            />
            Show Pots
          </label>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={isNight}
              onChange={(e) => setIsNight(e.target.checked)}
            />
            Night Mode
          </label>
        </div>

        <button style={{ ...styles.button, ...styles.generateButton }} onClick={regenerate}>
          🔄 Generate New
        </button>

        <button style={{ ...styles.button, ...styles.downloadButton }} onClick={downloadSVG}>
          📥 SVG
        </button>

        <button style={{ ...styles.button, ...styles.downloadButton }} onClick={downloadPNG}>
          📥 PNG
        </button>
      </div>
    </div>
  );
};

export default Completion15;
