import React, { useState, useEffect, useRef } from 'react';

// Use a reliable map source. Wikimedia has good public domain ones.
// Utilizing a high-contrast map for easier land detection if possible,
// or just a standard one and rely on color heuristics.
// This one is a standard equirectangular projection.
const MAP_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1024px-Equirectangular_projection_SW.jpg';

const BALL_COUNT = 7;

export default function Completion9() {
  const canvasRef = useRef(null);
  const [mapImage, setMapImage] = useState(null);
  const [balls, setBalls] = useState([]); // [{x, y, lat, lon, locked}]
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [status, setStatus] = useState('Loading Map...');
  const [iteration, setIteration] = useState(0);

  // Load map on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = MAP_URL;
    img.onload = () => {
      setMapImage(img);
      setStatus('Click on the map to place the first Dragon Ball!');
    };
  }, []);

  // Main drawing loop
  useEffect(() => {
    if (!mapImage || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Draw Map
    ctx.drawImage(mapImage, 0, 0, width, height);

    // Draw Balls
    balls.forEach((ball, idx) => {
      const isFirst = idx === 0;

      // Draw Connector lines (Minimum Spanning Tree or just Nearest Neighbors?
      // Fully connected might be messy. Let's just draw the balls for now or weak lines).

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, isFirst ? 8 : 6, 0, 2 * Math.PI);
      ctx.fillStyle = isFirst ? '#ffaa00' : '#ffcc00'; // Orange for leader, Yellow/Gold for others
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'white';
      ctx.stroke();

      // Star inside (simplified as generic text or dot for now)
      ctx.fillStyle = 'red';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idx + 1, ball.x, ball.y);
    });
  }, [mapImage, balls]);

  // Helper: Convert Canvas X/Y to Lat/Lon
  // Equirectangular: x goes -180 to 180, y goes 90 to -90
  const getLatLon = (x, y, width, height) => {
    const lon = (x / width) * 360 - 180;
    const lat = 90 - (y / height) * 180;
    return { lat, lon };
  };

  const getXY = (lat, lon, width, height) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  // Helper: Spherical Distance (Haversine or simple spherical chord length for maximization)
  // We want to maximize the minimum distance on sphere.
  // Returns distance in km (approx)
  const getDistance = (p1, p2) => {
    const R = 6371; // Earth Radius km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper: Check Land
  const isLand = (x, y, ctx, width, height) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    // Simple pixel color check. The map is white/blue/green-ish.
    // The specific Wikimedia map: Water is blue/white, land is grey/green.
    // Let's sample the pixel.
    const p = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    // Heuristic: Water is usually bluish or very light in some maps.
    // Map URL: https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1024px-Equirectangular_projection_SW.jpg
    // This map has:
    // Ocean: White/Light Blue (approx 200, 230, 255) ??
    // Actually checking the image visually... it looks like a standard colored relief.
    // Ocean is blue (R < G, B > R). Land is Earth tones.
    // Let's assume Land if Red channel is sufficiently high relative to Blue, or if it's not "Blue".
    // Blue pixel ~ [50-100, 100-200, 200-255].
    // Land pixel ~ [100-200, 100-200, 50-100].

    // Simple heuristic: If Blue > Red + 20 AND Blue > Green, it's likely water.
    const [r, g, b] = p;
    if (b > r + 20 && b > g) return false; // Ocean

    // Also check for white (poles logic might be weird, but white is usually ice which is land-ish enough or background)
    // If it's pure white (255,255,255) it might be border or empty space.
    if (r > 240 && g > 240 && b > 240) return false; // Assume white background is "not valid" if map has it.

    return true;
  };

  const handleStart = async (e) => {
    if (isOptimizing || !mapImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const ctx = canvasRef.current.getContext('2d');

    if (!isLand(x, y, ctx, width, height)) {
      setStatus('Please click on LAND, not water!');
      return;
    }

    const { lat, lon } = getLatLon(x, y, width, height);

    // Initialize Start Ball
    const startBall = { x, y, lat, lon, locked: true };

    // Initialize 6 random balls on land
    let newBalls = [startBall];
    setStatus('Scouting for land...');

    // Find initial valid random spots
    let attempts = 0;
    while (newBalls.length < BALL_COUNT && attempts < 1000) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      if (isLand(rx, ry, ctx, width, height)) {
        const { lat, lon } = getLatLon(rx, ry, width, height);
        newBalls.push({ x: rx, y: ry, lat, lon, locked: false });
      }
      attempts++;
    }

    if (newBalls.length < BALL_COUNT) {
      setStatus('Could not find enough land! Try again.');
      return;
    }

    setBalls(newBalls);
    setIsOptimizing(true);
    setStatus('Optimizing placement...');
  };

  // Optimization Effect
  useEffect(() => {
    if (!isOptimizing) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const ctx = canvasRef.current.getContext('2d');

    let currentBalls = [...balls];
    let tempInfo = { temperature: 1000, coolingRate: 0.99 };

    const step = () => {
      if (tempInfo.temperature < 0.1) {
        setIsOptimizing(false);
        setStatus('Optimization Complete!');
        return;
      }

      // Try improving a random unlocked ball
      // We want to MAXIMIZE the MINIMUM distance between any pair.

      const getScore = (testBalls) => {
        let minD = Infinity;
        for (let i = 0; i < testBalls.length; i++) {
          for (let j = i + 1; j < testBalls.length; j++) {
            const d = getDistance(testBalls[i], testBalls[j]);
            if (d < minD) minD = d;
          }
        }
        return minD;
      };

      const currentScore = getScore(currentBalls);

      // Mutate
      const idx = Math.floor(Math.random() * (BALL_COUNT - 1)) + 1; // 1 to 6 (0 is locked)
      const ball = currentBalls[idx];

      // Move by random amount proportional to temperature
      const moveScale = tempInfo.temperature * 0.5; // pixels
      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * moveScale;

      const newX = ball.x + Math.cos(angle) * dist;
      const newY = ball.y + Math.sin(angle) * dist;

      // Check Bounds & Land
      if (
        newX >= 0 &&
        newX < width &&
        newY >= 0 &&
        newY < height &&
        isLand(newX, newY, ctx, width, height)
      ) {
        const { lat, lon } = getLatLon(newX, newY, width, height);
        const nextBalls = [...currentBalls];
        nextBalls[idx] = { x: newX, y: newY, lat, lon, locked: false };

        const nextScore = getScore(nextBalls);

        // Simulated Annealing Acceptance
        // We want to MAXIMIZE score, so Delta = next - current
        const delta = nextScore - currentScore;

        // If better (delta > 0), taking it.
        // If worse (delta < 0), take it with prob exp(delta/temp)
        if (delta > 0 || Math.random() < Math.exp(delta / (tempInfo.temperature * 10))) {
          currentBalls = nextBalls;
        }
      }

      tempInfo.temperature *= tempInfo.coolingRate;
      setBalls([...currentBalls]);
      setIteration((prev) => prev + 1);

      requestAnimationFrame(step);
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isOptimizing]); // Only start when isOptimizing changes to true, logic handles loop

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 text-white min-h-screen">
      <h1
        className="text-3xl font-bold mb-4 text-yellow-400"
        style={{ fontFamily: 'Impact, sans-serif' }}
      >
        DRAGON BALL FINDER
      </h1>

      <div className="relative border-4 border-yellow-600 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleStart}
          className="cursor-crosshair bg-blue-900"
        />
        {isOptimizing && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs animate-pulse">
            Op: {iteration.toLocaleString()}
          </div>
        )}
      </div>

      <div className="mt-4 text-center max-w-2xl">
        <p className="text-xl mb-2 font-mono">{status}</p>
        <p className="text-gray-400 text-sm">
          Click on a landmass to place the first Dragon Ball. The radar will automatically calculate
          the 6 most distant positions for the remaining balls to maximize difficulty!
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl opacity-80">
        {balls.map((b, i) => (
          <div
            key={i}
            className="bg-gray-800 p-2 rounded border border-gray-700 flex items-center justify-between"
          >
            <span className="text-yellow-500 font-bold">#{i + 1}</span>
            <span className="text-xs font-mono">
              {b.lat.toFixed(2)}°, {b.lon.toFixed(2)}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
