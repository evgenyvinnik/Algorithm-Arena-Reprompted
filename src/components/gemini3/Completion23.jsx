
import React, { useRef, useEffect, useState, useCallback } from 'react';

const Completion23 = () => {
  const canvasRef = useRef(null);
  const [randomNumbers, setRandomNumbers] = useState([]);
  const [entropyLevel, setEntropyLevel] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const metaBallsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const timeRef = useRef(0);

  // Configuration
  const NUM_BALLS = 15;
  const ATTRACTION_FORCE = 0.05;
  const DAMPING = 0.96;

  // Initialize balls
  useEffect(() => {
    const balls = [];
    for (let i = 0; i < NUM_BALLS; i++) {
      balls.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 40 + Math.random() * 60,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)` // Blues/Cyans
      });
    }
    metaBallsRef.current = balls;
  }, []);

  const generateRandomFromEntropy = useCallback((ctx) => {
    // 1. Sample pixels from dynamic locations based on current balls positions
    // We don't want to read whole canvas (too slow), so we sample specific points influenced by chaos
    let entropyValue = 0;

    // Use the first ball's position as a "chaos pointer" to sample other locations
    // This makes the sampling location itself chaotic
    const probeX = Math.floor(Math.abs(metaBallsRef.current[0].x)) % 800;
    const probeY = Math.floor(Math.abs(metaBallsRef.current[0].y)) % 600;

    // Sample a 5x5 pixel area
    try {
      const pixelData = ctx.getImageData(probeX, probeY, 5, 5).data;
      for (let i = 0; i < pixelData.length; i += 4) {
        entropyValue += pixelData[i] + pixelData[i + 1] + pixelData[i + 2];
        entropyValue = (entropyValue << 5) - entropyValue; // Simple hash mix
      }
    } catch (e) {
      // Fallback if coordinates out of bounds (shouldn't happen with mod)
    }

    // 2. Mix with high-res timestamp and mouse entropy
    const timestamp = performance.now();
    const mouseChaos = (mouseRef.current.x * 1234) ^ (mouseRef.current.y * 5678);

    let mixedSeed = entropyValue ^ Math.floor(timestamp * 1000) ^ mouseChaos;

    // Avalanche effect simple hash
    mixedSeed = ((mixedSeed >> 16) ^ mixedSeed) * 0x45d9f3b;
    mixedSeed = ((mixedSeed >> 16) ^ mixedSeed) * 0x45d9f3b;
    mixedSeed = (mixedSeed >> 16) ^ mixedSeed;

    return Math.abs(mixedSeed); // Return positive integer
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Function to draw metaballs
    const draw = () => {
      timeRef.current += 0.01;
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update balls
      let totalSpeed = 0;
      metaBallsRef.current.forEach(ball => {
        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - ball.x;
          const dy = mouseRef.current.y - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ball.vx += (dx / dist) * ATTRACTION_FORCE;
            ball.vy += (dy / dist) * ATTRACTION_FORCE;
            // Stirring adds coloring chaos
            ball.color = `hsl(${(timeRef.current * 50) % 360}, 70%, 60%)`;
          }
        }

        // Boundary bounce
        if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.vx *= -1;
        if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;

        // Keep within bounds
        ball.x = Math.max(ball.r, Math.min(canvas.width - ball.r, ball.x));
        ball.y = Math.max(ball.r, Math.min(canvas.height - ball.r, ball.y));

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= DAMPING; // Friction
        ball.vy *= DAMPING;

        // Add inherent wandering motion (lava lamp heat convection sim)
        ball.vy += (Math.sin(timeRef.current + ball.x * 0.01) * 0.05);

        totalSpeed += Math.abs(ball.vx) + Math.abs(ball.vy);
      });

      // Current entropy level visualized as speed of the system
      setEntropyLevel(Math.min(100, Math.floor(totalSpeed * 2)));

      // Render balls
      // To get gooey effect, we can use a blur filter or thresholding.
      // Canvas simple approach: Radial gradients
      // High performance approach for many balls is hard in pure 2D canvas without shaders, 
      // but for 15 balls, gradients are fine. 
      // Actually, for true "Meta" effect we usually use Thresholding filter, 
      // but `filter` prop is slow. Let's stick to additive blending for a "energy field" look which is also cool.

      ctx.globalCompositeOperation = 'lighter'; // Additive blending
      metaBallsRef.current.forEach(ball => {
        const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.r);
        gradient.addColorStop(0, ball.color);
        gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      // Generate Random Number every ~60 frames (approx 1 sec) or faster if high entropy
      if (Math.random() < 0.05 + (totalSpeed * 0.005)) { // More speed = more random generation capability
        const newNum = generateRandomFromEntropy(ctx);
        setRandomNumbers(prev => [newNum, ...prev].slice(0, 20));
        setGeneratedCount(prev => prev + 1);
      }

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [generateRandomFromEntropy]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl w-full">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Entropy Lamp
          </h1>
          <p className="text-gray-400">
            Unconventional Randomness Generator.
            <br />
            Move your mouse over the lamp to stir entropy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visualizer Column */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="relative bg-gray-900 rounded-xl shadow-2xl cursor-pointer ring-1 ring-white/10"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              <div className="absolute bottom-4 left-4 text-xs text-gray-400 select-none pointer-events-none">
                System Energy: {entropyLevel}%
              </div>
            </div>
          </div>

          {/* Data Column */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <h2 className="text-xl font-bold text-gray-200">Generated Stream</h2>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded text-cyan-400">Count: {generatedCount}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm scrollbar-thin scrollbar-thumb-gray-700">
              {randomNumbers.length === 0 && (
                <div className="text-gray-600 italic text-center mt-10">Waiting for entropy...<br />Stir the lamp!</div>
              )}
              {randomNumbers.map((num, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-800/30 rounded border border-white/5 animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-purple-400">0x{num.toString(16).toUpperCase().padStart(8, '0')}</span>
                  <span className="text-gray-400">{num}</span>
                  <span className="text-cyan-600 text-xs">{(num / 4294967296).toFixed(6)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-center text-gray-500">
              Source: Visual Chaos + User Interaction
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-600 max-w-lg mx-auto">
          Technical: This generator samples pixel data from the dynamic "lava" visualization and mixes it with high-resolution timestamps and mouse interaction coordinates to seed a hashing algorithm.
        </div>
      </div>
    </div>
  );
};

export default Completion23;
