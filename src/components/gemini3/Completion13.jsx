import React, { useState, useEffect, useRef, useCallback } from 'react';

// Physics constants
const G = 0.5; // Gravitational constant
const DT = 0.1; // Time step
const PREDICTION_MAX_STEPS = 100000;
const ALIGNMENT_THRESHOLD = 0.1; // Threshold for collinearity (roughly width of alignment)

const Completion13 = () => {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [bodies, setBodies] = useState([]);
  const [prediction, setPrediction] = useState(null); // { time, bodies }
  const [simTime, setSimTime] = useState(0);

  // Initialize random bodies
  const initBodies = useCallback(() => {
    const newBodies = [
      { id: 1, x: 400, y: 300, vx: 0, vy: 1.5, mass: 1000, color: '#FFD700', radius: 20 }, // Sun-ish
      { id: 2, x: 600, y: 300, vx: 0, vy: -2, mass: 200, color: '#00BFFF', radius: 10 }, // Earth-ish
      { id: 3, x: 200, y: 300, vx: 0, vy: 1, mass: 150, color: '#FF4500', radius: 8 }, // Mars-ish
    ];
    // Add some random initial velocity perturbations for chaos
    newBodies.forEach((b) => {
      if (b.id !== 1) {
        // Keep sun relatively stable initially
        b.vx += (Math.random() - 0.5) * 2;
        b.vy += (Math.random() - 0.5) * 2;
      }
    });

    setBodies(newBodies);
    setSimTime(0);
    setPrediction(null);
  }, []);

  useEffect(() => {
    initBodies();
  }, [initBodies]);

  // Physics engine step
  const stepPhysics = (currentBodies) => {
    const newBodies = currentBodies.map((b) => ({ ...b }));

    // Calculate forces
    for (let i = 0; i < newBodies.length; i++) {
      for (let j = i + 1; j < newBodies.length; j++) {
        const b1 = newBodies[i];
        const b2 = newBodies[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 5) {
          // Softening parameter to prevent infinity
          const f = (G * b1.mass * b2.mass) / distSq;
          const fx = f * (dx / dist);
          const fy = f * (dy / dist);

          b1.vx += (fx / b1.mass) * DT;
          b1.vy += (fy / b1.mass) * DT;
          b2.vx -= (fx / b2.mass) * DT;
          b2.vy -= (fy / b2.mass) * DT;
        }
      }
    }

    // Update positions
    newBodies.forEach((b) => {
      b.x += b.vx * DT;
      b.y += b.vy * DT;

      // Bounce off walls (optional, keeps them on screen)
      // if (b.x < 0 || b.x > 800) b.vx *= -1;
      // if (b.y < 0 || b.y > 600) b.vy *= -1;
    });

    return newBodies;
  };

  // Check alignment (Eclipse)
  // Area of triangle formed by 3 points: 0.5 * |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)|
  const checkAlignment = (currentBodies) => {
    if (currentBodies.length < 3) return false;
    const [b1, b2, b3] = currentBodies;

    const area = 0.5 * Math.abs(b1.x * (b2.y - b3.y) + b2.x * (b3.y - b1.y) + b3.x * (b1.y - b2.y));

    // Normalize by distance to make threshold scale-independent-ish
    // Use max distance between any two
    const d12 = Math.hypot(b2.x - b1.x, b2.y - b1.y);
    const d23 = Math.hypot(b3.x - b2.x, b3.y - b2.y);
    const d13 = Math.hypot(b3.x - b1.x, b3.y - b1.y);
    const maxDist = Math.max(d12, d23, d13);

    // Normalized "thickness" of line
    return area / maxDist < ALIGNMENT_THRESHOLD * 20; // 20 is arbitrary scaling factor
  };

  // Prediction Logic
  const predictNextEclipse = () => {
    setIsRunning(false);
    let sim = bodies.map((b) => ({ ...b }));
    let steps = 0;

    // Fast forward
    while (steps < PREDICTION_MAX_STEPS) {
      sim = stepPhysics(sim);
      steps++;

      // Skip first 100 steps to avoid matching current state
      if (steps > 100 && checkAlignment(sim)) {
        setPrediction({
          time: steps * DT,
          bodies: sim,
          steps: steps,
        });
        return;
      }
    }
    alert('No eclipse found within ' + PREDICTION_MAX_STEPS + ' steps.');
  };

  // Main Game Loop
  useEffect(() => {
    let animationFrameId;

    const render = () => {
      // Update Physics Logic inside render loop to avoid state thrashing?
      // No, let's keep it simple. If running, update state.
      // Actually, updating state inside requestAnimationFrame is the standard React loop pattern these days if carefully done.
      // But purely for smooth animation, we might want to do logic outside React state.
      // However, for this challenge, this is sufficient.

      if (isRunning) {
        setBodies((prev) => stepPhysics(prev));
        setSimTime((t) => t + DT);
      }

      // Drawing happens via side-effect of state change?
      // No, draw in Ref.
    };

    // But wait, if we setBodies, the component re-renders.
    // So the drawing should happen in the main body or a separate effect dependent on bodies.
    // Let's split simulation loop and render loop.

    if (isRunning) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]); // This effect only handles the *triggering* of updates.

  // Drawing Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Stars (static bg)
    // ctx.fillStyle = 'white';
    // ...

    // Draw Bodies
    bodies.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = b.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Prediction
    if (prediction) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;

      // Draw line through predicted bodies
      ctx.beginPath();
      ctx.moveTo(prediction.bodies[0].x, prediction.bodies[0].y);
      ctx.lineTo(prediction.bodies[1].x, prediction.bodies[1].y);
      ctx.lineTo(prediction.bodies[2].x, prediction.bodies[2].y);
      ctx.stroke();

      // Draw predicted positions
      prediction.bodies.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.setLineDash([]);
        ctx.stroke();
      });

      ctx.restore();
    }
  }, [bodies, prediction]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-purple-500 text-transparent bg-clip-text">
        Three Body Eclipse Predictor
      </h1>

      <div className="relative border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-black cursor-crosshair"
          // Click to add body or perturb? Maybe later.
        />

        <div className="absolute top-4 right-4 text-right pointer-events-none">
          <p className="text-gray-400 font-mono">Time: {simTime.toFixed(1)}</p>
        </div>

        {prediction && (
          <div className="absolute top-4 left-4 bg-black/70 p-4 rounded border border-white/20 backdrop-blur-sm pointer-events-none animate-pulse">
            <h3 className="text-xl font-bold text-green-400">Eclipse Predicted!</h3>
            <p>Time offset: +{prediction.time.toFixed(1)}s</p>
            <p className="text-xs text-gray-400">Simulated {prediction.steps} steps</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-3 rounded font-bold transition shadow-lg transform active:scale-95 ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isRunning ? 'Thinking...' : 'Resume'}
          {/* Wait, logic: running means simulating. 'Thinking' is confusing. */}
          {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
        </button>

        <button
          onClick={predictNextEclipse}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold transition disabled:opacity-50 shadow-lg transform active:scale-95"
          disabled={!!prediction}
        >
          Predict Next Eclipse
        </button>

        <button
          onClick={initBodies}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded font-bold transition shadow-lg transform active:scale-95"
        >
          Reset System
        </button>
      </div>

      <div className="mt-4 text-gray-400 max-w-2xl text-center">
        <p>
          A simulation of the 3-body problem. Click "Predict Next Eclipse" to fast-forward the
          physics engine (up to 100k steps) and find the next moment these three chaotic bodies
          align.
        </p>
      </div>
    </div>
  );
};

export default Completion13;
