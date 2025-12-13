import React, { useRef, useEffect, useState, useCallback } from 'react';

const Completion15 = () => {
  const canvasRef = useRef(null);

  // Use window size for strict bounding
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [config, setConfig] = useState({
    depth: 5,
    spread: 30, // degrees
    scale: 0.8,
    startSize: 80,
    seed: 1234,
  });

  // Handle Window Resize only - decouples from container layout loops
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Debounce slightly to prevent thrashing
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Simple Linear Congruential Generator for seeded randomness
  const createRandom = useCallback((seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }, []);

  const regenerate = () => {
    setConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 100000),
    }));
  };

  const drawCactus = useCallback(
    (ctx, x, y, angle, size, depth, rand) => {
      if (depth === 0) {
        // Draw Flower
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);

        // Flower petals
        const flowerColor = rand() > 0.5 ? '#FF69B4' : '#FFFF00'; // Hot pink or yellow
        ctx.fillStyle = flowerColor;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.rotate((72 * Math.PI) / 180);
          ctx.ellipse(0, -size * 0.4, size * 0.2, size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Flower center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);

      // Draw Limb
      const width = size * 0.35;
      const height = size;

      // Gradient for 3D effect
      const grad = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
      grad.addColorStop(0, '#2E8B57'); // SeaGreen
      grad.addColorStop(0.5, '#66CDAA'); // MediumAquamarine (Highlight)
      grad.addColorStop(1, '#006400'); // DarkGreen (Shadow)

      ctx.fillStyle = grad;

      // Main body: Rounded rectangle-ish
      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(-width / 3, -height);
      ctx.quadraticCurveTo(0, -height - width / 2, width / 3, -height);
      ctx.lineTo(width / 2, 0);
      ctx.quadraticCurveTo(0, width / 4, -width / 2, 0);
      ctx.fill();

      // Spines
      ctx.strokeStyle = '#DCDCDC'; // Gainsboro
      ctx.lineWidth = 1;
      const numSpines = 5 + Math.floor(rand() * 5);
      for (let i = 0; i < numSpines; i++) {
        const spineY = -height * 0.1 - rand() * height * 0.8;
        const spineX = (rand() - 0.5) * width * 0.8;

        ctx.beginPath();
        ctx.moveTo(spineX, spineY);
        const spineLen = 5 + rand() * 5;
        const spineAngle = spineX > 0 ? Math.PI / 4 : -Math.PI / 4;
        ctx.lineTo(
          spineX + Math.cos(spineAngle) * spineLen,
          spineY + Math.sin(spineAngle) * spineLen
        );
        ctx.stroke();
      }

      // Children calculation
      const branchDecision = rand();
      let branches = [];

      if (depth === config.depth) {
        // Base always has 1 trunk
        branches.push(0);
      } else {
        if (branchDecision < 0.2) {
          // 1 branch, continues straight-ish
          branches.push((rand() - 0.5) * 20);
        } else if (branchDecision < 0.7) {
          // 2 branches
          branches.push(-config.spread + (rand() - 0.5) * 15);
          branches.push(config.spread + (rand() - 0.5) * 15);
        } else {
          // 3 branches
          branches.push(-config.spread * 1.2 + (rand() - 0.5) * 10);
          branches.push((rand() - 0.5) * 15);
          branches.push(config.spread * 1.2 + (rand() - 0.5) * 10);
        }
      }

      // Recurse
      branches.forEach((branchAngle) => {
        const newSize = size * config.scale;
        if (newSize > 5) {
          drawCactus(ctx, 0, -height * 0.9, branchAngle, newSize, depth - 1, rand);
        }
      });

      ctx.restore();
    },
    [config.depth, config.spread, config.scale]
  );

  // Main Draw Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match window (or viewport)
    // We deduct nothing here, just full screen canvas
    // The UI will float on top
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    const ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground drawing
    ctx.fillStyle = '#E6C288'; // Sand color
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Ground texture
    const groundRand = createRandom(999);
    ctx.fillStyle = '#D2B48C';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      const rX = groundRand() * canvas.width;
      const rY = canvas.height - 100 + groundRand() * 100;
      ctx.arc(rX, rY, 1 + groundRand() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Start drawing Cactus from bottom center
    const startX = canvas.width / 2;
    const startY = canvas.height - 80;

    const cactusRand = createRandom(config.seed);
    drawCactus(ctx, startX, startY, 0, config.startSize, config.depth, cactusRand);
  }, [config, windowSize, drawCactus, createRandom]);

  return (
    // Fixed container ensures no scrollbars ever
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-orange-100 overflow-hidden font-sans">
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Header */}
        <div className="flex-grow pt-8 text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-md tracking-wider">
            CACTUS GENERATOR
          </h1>
          <p className="text-white/80 text-lg mt-2">Procedural Fractal Nature</p>
        </div>

        {/* Controls - Box at bottom */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md border-t border-white/50 p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex flex-wrap gap-8 justify-center items-center">
          <div className="flex flex-col space-y-2 w-48">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              <span>Recursion Depth</span>
              <span className="text-emerald-600">{config.depth}</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={config.depth}
              onChange={(e) => setConfig({ ...config, depth: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col space-y-2 w-48">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              <span>Branch Angle</span>
              <span className="text-emerald-600">{config.spread}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={config.spread}
              onChange={(e) => setConfig({ ...config, spread: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col space-y-2 w-48">
            <label className="text-sm font-semibold text-gray-700 flex justify-between">
              <span>Size Decay</span>
              <span className="text-emerald-600">{config.scale.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.01"
              value={config.scale}
              onChange={(e) => setConfig({ ...config, scale: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={regenerate}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transform active:scale-95 transition-all flex items-center gap-2 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Completion15;
