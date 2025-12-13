import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Simplified land mass data - major continents approximated as polygons
// Each point is [longitude, latitude]
const LAND_MASSES = [
  // North America
  {
    name: 'North America',
    bounds: { minLat: 15, maxLat: 72, minLon: -170, maxLon: -50 },
  },
  // South America
  {
    name: 'South America',
    bounds: { minLat: -56, maxLat: 12, minLon: -82, maxLon: -34 },
  },
  // Europe
  {
    name: 'Europe',
    bounds: { minLat: 35, maxLat: 71, minLon: -10, maxLon: 40 },
  },
  // Africa
  {
    name: 'Africa',
    bounds: { minLat: -35, maxLat: 37, minLon: -18, maxLon: 52 },
  },
  // Asia
  { name: 'Asia', bounds: { minLat: 5, maxLat: 77, minLon: 40, maxLon: 180 } },
  // Australia
  {
    name: 'Australia',
    bounds: { minLat: -45, maxLat: -10, minLon: 113, maxLon: 154 },
  },
  // Antarctica (partial)
  {
    name: 'Antarctica',
    bounds: { minLat: -90, maxLat: -60, minLon: -180, maxLon: 180 },
  },
];

// Sample land points (pre-generated points known to be on land)
const LAND_POINTS = [
  // North America
  { lat: 40.7128, lon: -74.006, name: 'New York' },
  { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
  { lat: 41.8781, lon: -87.6298, name: 'Chicago' },
  { lat: 51.0447, lon: -114.0719, name: 'Calgary' },
  { lat: 19.4326, lon: -99.1332, name: 'Mexico City' },
  { lat: 64.2008, lon: -149.4937, name: 'Alaska' },
  { lat: 45.4215, lon: -75.6972, name: 'Ottawa' },
  { lat: 25.7617, lon: -80.1918, name: 'Miami' },
  { lat: 47.6062, lon: -122.3321, name: 'Seattle' },
  { lat: 29.7604, lon: -95.3698, name: 'Houston' },
  // South America
  { lat: -23.5505, lon: -46.6333, name: 'São Paulo' },
  { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires' },
  { lat: -33.4489, lon: -70.6693, name: 'Santiago' },
  { lat: -12.0464, lon: -77.0428, name: 'Lima' },
  { lat: 4.711, lon: -74.0721, name: 'Bogotá' },
  { lat: -15.7801, lon: -47.9292, name: 'Brasília' },
  { lat: -3.119, lon: -60.0217, name: 'Manaus' },
  { lat: -51.6226, lon: -69.2181, name: 'Patagonia' },
  // Europe
  { lat: 51.5074, lon: -0.1278, name: 'London' },
  { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  { lat: 52.52, lon: 13.405, name: 'Berlin' },
  { lat: 41.9028, lon: 12.4964, name: 'Rome' },
  { lat: 40.4168, lon: -3.7038, name: 'Madrid' },
  { lat: 55.7558, lon: 37.6173, name: 'Moscow' },
  { lat: 59.9343, lon: 30.3351, name: 'St. Petersburg' },
  { lat: 64.1466, lon: -21.9426, name: 'Reykjavik' },
  { lat: 59.3293, lon: 18.0686, name: 'Stockholm' },
  { lat: 37.9838, lon: 23.7275, name: 'Athens' },
  // Africa
  { lat: 30.0444, lon: 31.2357, name: 'Cairo' },
  { lat: -33.9249, lon: 18.4241, name: 'Cape Town' },
  { lat: -1.2921, lon: 36.8219, name: 'Nairobi' },
  { lat: 6.5244, lon: 3.3792, name: 'Lagos' },
  { lat: 33.5731, lon: -7.5898, name: 'Casablanca' },
  { lat: -26.2041, lon: 28.0473, name: 'Johannesburg' },
  { lat: 36.8065, lon: 10.1815, name: 'Tunis' },
  { lat: 9.082, lon: 8.6753, name: 'Nigeria Central' },
  { lat: -4.4419, lon: 15.2663, name: 'Kinshasa' },
  { lat: -18.8792, lon: 47.5079, name: 'Madagascar' },
  // Asia
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  { lat: 39.9042, lon: 116.4074, name: 'Beijing' },
  { lat: 31.2304, lon: 121.4737, name: 'Shanghai' },
  { lat: 28.6139, lon: 77.209, name: 'New Delhi' },
  { lat: 19.076, lon: 72.8777, name: 'Mumbai' },
  { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
  { lat: 13.7563, lon: 100.5018, name: 'Bangkok' },
  { lat: 37.5665, lon: 126.978, name: 'Seoul' },
  { lat: 55.0084, lon: 82.9357, name: 'Novosibirsk' },
  { lat: 43.238, lon: 76.9458, name: 'Almaty' },
  { lat: 41.2995, lon: 69.2401, name: 'Tashkent' },
  { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
  { lat: 31.7683, lon: 35.2137, name: 'Jerusalem' },
  { lat: 67.9, lon: 133.4, name: 'Siberia East' },
  { lat: 62.0, lon: 129.7, name: 'Yakutsk' },
  // Australia & Oceania
  { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
  { lat: -37.8136, lon: 144.9631, name: 'Melbourne' },
  { lat: -31.9505, lon: 115.8605, name: 'Perth' },
  { lat: -27.4698, lon: 153.0251, name: 'Brisbane' },
  { lat: -23.698, lon: 133.8807, name: 'Alice Springs' },
  { lat: -12.4634, lon: 130.8456, name: 'Darwin' },
  { lat: -41.2865, lon: 174.7762, name: 'Wellington' },
  { lat: -43.532, lon: 172.6306, name: 'Christchurch' },
  // Additional remote locations
  { lat: 71.2906, lon: -156.7886, name: 'Utqiagvik (Barrow)' },
  { lat: -54.8019, lon: -68.303, name: 'Ushuaia' },
  { lat: 78.2232, lon: 15.6267, name: 'Svalbard' },
  { lat: -77.8419, lon: 166.6863, name: 'McMurdo Station' },
  { lat: 21.3069, lon: -157.8583, name: 'Honolulu' },
];

// Calculate great circle distance between two points (Haversine formula)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate minimum distance from a point to a set of points
const minDistanceToSet = (point, points) => {
  if (points.length === 0) return Infinity;
  return Math.min(...points.map((p) => haversineDistance(point.lat, point.lon, p.lat, p.lon)));
};

// Calculate total minimum pairwise distance (sum of all pairwise distances)
const calculateTotalDistance = (points) => {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      total += haversineDistance(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
    }
  }
  return total;
};

// Calculate minimum pairwise distance
const calculateMinPairwiseDistance = (points) => {
  let minDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = haversineDistance(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      minDist = Math.min(minDist, dist);
    }
  }
  return minDist;
};

// Greedy algorithm to find well-distributed points
const greedyPlacement = (startPoint, numPoints, candidates) => {
  const selected = [startPoint];
  const remaining = candidates.filter((p) => p.lat !== startPoint.lat || p.lon !== startPoint.lon);

  while (selected.length < numPoints && remaining.length > 0) {
    let bestIdx = 0;
    let bestMinDist = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const minDist = minDistanceToSet(remaining[i], selected);
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected;
};

// Simulated annealing optimization
const simulatedAnnealing = (
  initialPoints,
  candidates,
  iterations = 1000,
  initialTemp = 1000,
  coolingRate = 0.995
) => {
  let current = [...initialPoints];
  let currentScore = calculateMinPairwiseDistance(current);
  let best = [...current];
  let bestScore = currentScore;
  let temp = initialTemp;

  const availableCandidates = candidates.filter(
    (c) => !initialPoints.some((p) => p.lat === c.lat && p.lon === c.lon)
  );

  for (let i = 0; i < iterations; i++) {
    // Try swapping a random point (except the first one which is user-selected)
    const swapIdx = 1 + Math.floor(Math.random() * (current.length - 1));
    const newPointIdx = Math.floor(Math.random() * availableCandidates.length);
    const newPoint = availableCandidates[newPointIdx];

    // Check if new point is already in current selection
    if (current.some((p) => p.lat === newPoint.lat && p.lon === newPoint.lon)) {
      continue;
    }

    const newSelection = [...current];
    newSelection[swapIdx] = newPoint;
    const newScore = calculateMinPairwiseDistance(newSelection);

    const delta = newScore - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / temp)) {
      current = newSelection;
      currentScore = newScore;

      if (currentScore > bestScore) {
        best = [...current];
        bestScore = currentScore;
      }
    }

    temp *= coolingRate;
  }

  return best;
};

// Convert lat/lon to x/y on map (simple equirectangular projection)
const latLonToXY = (lat, lon, width, height) => {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// Convert x/y on map to lat/lon
const xyToLatLon = (x, y, width, height) => {
  const lon = (x / width) * 360 - 180;
  const lat = 90 - (y / height) * 180;
  return { lat, lon };
};

// Find nearest land point from candidates
const findNearestLandPoint = (lat, lon) => {
  let nearest = LAND_POINTS[0];
  let minDist = Infinity;

  for (const point of LAND_POINTS) {
    const dist = haversineDistance(lat, lon, point.lat, point.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  }

  return nearest;
};

// Dragon Ball component
const DragonBall = ({ number, x, y, size = 40, onClick, isSelected }) => {
  const starSize = size * 0.12;

  // Arrange stars based on number
  const getStarPositions = (n) => {
    const positions = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.25;

    if (n === 1) {
      positions.push({ x: centerX, y: centerY });
    } else if (n === 2) {
      positions.push({ x: centerX - radius * 0.4, y: centerY });
      positions.push({ x: centerX + radius * 0.4, y: centerY });
    } else if (n === 3) {
      positions.push({ x: centerX, y: centerY - radius * 0.4 });
      positions.push({ x: centerX - radius * 0.35, y: centerY + radius * 0.3 });
      positions.push({ x: centerX + radius * 0.35, y: centerY + radius * 0.3 });
    } else if (n === 4) {
      positions.push({
        x: centerX - radius * 0.35,
        y: centerY - radius * 0.35,
      });
      positions.push({
        x: centerX + radius * 0.35,
        y: centerY - radius * 0.35,
      });
      positions.push({
        x: centerX - radius * 0.35,
        y: centerY + radius * 0.35,
      });
      positions.push({
        x: centerX + radius * 0.35,
        y: centerY + radius * 0.35,
      });
    } else if (n === 5) {
      positions.push({ x: centerX, y: centerY });
      positions.push({ x: centerX - radius * 0.4, y: centerY - radius * 0.35 });
      positions.push({ x: centerX + radius * 0.4, y: centerY - radius * 0.35 });
      positions.push({ x: centerX - radius * 0.4, y: centerY + radius * 0.35 });
      positions.push({ x: centerX + radius * 0.4, y: centerY + radius * 0.35 });
    } else if (n === 6) {
      positions.push({ x: centerX - radius * 0.35, y: centerY - radius * 0.4 });
      positions.push({ x: centerX + radius * 0.35, y: centerY - radius * 0.4 });
      positions.push({ x: centerX - radius * 0.35, y: centerY });
      positions.push({ x: centerX + radius * 0.35, y: centerY });
      positions.push({ x: centerX - radius * 0.35, y: centerY + radius * 0.4 });
      positions.push({ x: centerX + radius * 0.35, y: centerY + radius * 0.4 });
    } else if (n === 7) {
      positions.push({ x: centerX, y: centerY - radius * 0.45 });
      positions.push({ x: centerX - radius * 0.4, y: centerY - radius * 0.15 });
      positions.push({ x: centerX + radius * 0.4, y: centerY - radius * 0.15 });
      positions.push({ x: centerX, y: centerY + radius * 0.15 });
      positions.push({ x: centerX - radius * 0.4, y: centerY + radius * 0.45 });
      positions.push({ x: centerX + radius * 0.4, y: centerY + radius * 0.45 });
      positions.push({ x: centerX, y: centerY + radius * 0.75 });
    }

    return positions;
  };

  const starPositions = getStarPositions(number);

  return (
    <g
      transform={`translate(${x - size / 2}, ${y - size / 2})`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* Glow effect */}
      <defs>
        <radialGradient id={`ballGradient${number}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="50%" stopColor="#ff9800" />
          <stop offset="100%" stopColor="#e65100" />
        </radialGradient>
        <filter id={`glow${number}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 + 5}
          fill="none"
          stroke="#00ff00"
          strokeWidth="3"
          strokeDasharray="5,3"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${size / 2} ${size / 2}`}
            to={`360 ${size / 2} ${size / 2}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Main ball */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill={`url(#ballGradient${number})`}
        filter={`url(#glow${number})`}
        stroke="#b71c1c"
        strokeWidth="2"
      />

      {/* Shine */}
      <ellipse
        cx={size * 0.35}
        cy={size * 0.35}
        rx={size * 0.15}
        ry={size * 0.1}
        fill="rgba(255, 255, 255, 0.6)"
      />

      {/* Stars */}
      {starPositions.map((pos, idx) => (
        <polygon key={idx} points={createStarPoints(pos.x, pos.y, starSize)} fill="#b71c1c" />
      ))}
    </g>
  );
};

// Create star polygon points
const createStarPoints = (cx, cy, size) => {
  const points = [];
  const outerRadius = size;
  const innerRadius = size * 0.4;
  const spikes = 5;

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }

  return points.join(' ');
};

// Main component
const Completion9 = () => {
  const [mapDimensions, setMapDimensions] = useState({
    width: 800,
    height: 400,
  });
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [userPoint, setUserPoint] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hoveredBall, setHoveredBall] = useState(null);
  const [optimizationSteps, setOptimizationSteps] = useState(500);
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Compute statistics from selected points
  const totalDistance = useMemo(() => {
    if (selectedPoints.length >= 2) {
      return Math.round(calculateTotalDistance(selectedPoints));
    }
    return 0;
  }, [selectedPoints]);

  const minPairDistance = useMemo(() => {
    if (selectedPoints.length >= 2) {
      return Math.round(calculateMinPairwiseDistance(selectedPoints));
    }
    return 0;
  }, [selectedPoints]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 40, 1000);
        setMapDimensions({
          width,
          height: width / 2,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (e) => {
      if (isOptimizing) return;

      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { lat, lon } = xyToLatLon(x, y, mapDimensions.width, mapDimensions.height);

      // Find nearest land point
      const nearestLand = findNearestLandPoint(lat, lon);

      // Set as user's starting point
      setUserPoint({ ...nearestLand, isUserSelected: true });

      // Run greedy algorithm to find other 6 points
      const points = greedyPlacement(nearestLand, 7, LAND_POINTS);
      setSelectedPoints(points);
    },
    [mapDimensions, isOptimizing]
  );

  // Optimize placement
  const handleOptimize = useCallback(() => {
    if (selectedPoints.length < 7 || !userPoint) return;

    setIsOptimizing(true);

    // Run optimization in chunks to keep UI responsive
    setTimeout(() => {
      const optimized = simulatedAnnealing(
        selectedPoints,
        LAND_POINTS,
        optimizationSteps,
        1000,
        0.99
      );
      setSelectedPoints(optimized);
      setIsOptimizing(false);
    }, 50);
  }, [selectedPoints, userPoint, optimizationSteps]);

  // Reset everything
  const handleReset = () => {
    setSelectedPoints([]);
    setUserPoint(null);
  };

  // Random placement
  const handleRandomPlacement = () => {
    const shuffled = [...LAND_POINTS].sort(() => Math.random() - 0.5);
    const initial = shuffled.slice(0, 7);
    setUserPoint({ ...initial[0], isUserSelected: true });
    setSelectedPoints(initial);
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #4a148c 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  };

  const titleStyle = {
    fontSize: 'clamp(24px, 5vw, 48px)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    background: 'linear-gradient(90deg, #ff9800, #ffeb3b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtitleStyle = {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#b39ddb',
  };

  const mapContainerStyle = {
    position: 'relative',
    margin: '0 auto',
    maxWidth: '1000px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '3px solid #ff9800',
  };

  const controlsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  };

  const buttonStyle = (primary = false) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: isOptimizing ? 'not-allowed' : 'pointer',
    background: primary ? 'linear-gradient(90deg, #ff9800, #ff5722)' : 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    transition: 'all 0.3s ease',
    opacity: isOptimizing ? 0.5 : 1,
  });

  const statsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '20px auto',
  };

  const statBoxStyle = {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '150px',
  };

  const pointListStyle = {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '20px auto',
  };

  return (
    <div style={containerStyle} ref={containerRef}>
      <h1 style={titleStyle}>🐉 Dragon Ball Scatter 🐉</h1>
      <p style={subtitleStyle}>
        Click anywhere on the map to place the first Dragon Ball, then find the optimal hiding
        spots!
      </p>

      <div style={controlsStyle}>
        <button style={buttonStyle()} onClick={handleRandomPlacement} disabled={isOptimizing}>
          🎲 Random Placement
        </button>
        <button
          style={buttonStyle(true)}
          onClick={handleOptimize}
          disabled={isOptimizing || selectedPoints.length < 7}
        >
          {isOptimizing ? '⏳ Optimizing...' : '✨ Optimize Positions'}
        </button>
        <button style={buttonStyle()} onClick={handleReset} disabled={isOptimizing}>
          🔄 Reset
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px' }}>Steps:</label>
          <select
            value={optimizationSteps}
            onChange={(e) => setOptimizationSteps(Number(e.target.value))}
            style={{
              padding: '8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <option value={100}>100 (Fast)</option>
            <option value={500}>500 (Medium)</option>
            <option value={1000}>1000 (Slow)</option>
            <option value={2000}>2000 (Very Slow)</option>
          </select>
        </div>
      </div>

      <div style={mapContainerStyle}>
        <svg
          ref={mapRef}
          width={mapDimensions.width}
          height={mapDimensions.height}
          style={{ cursor: 'crosshair', display: 'block' }}
          onClick={handleMapClick}
        >
          {/* World map background */}
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d47a1" />
              <stop offset="100%" stopColor="#01579b" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Ocean */}
          <rect width="100%" height="100%" fill="url(#oceanGradient)" />
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Simplified land masses */}
          {LAND_MASSES.map((land, idx) => {
            const { bounds } = land;
            const topLeft = latLonToXY(
              bounds.maxLat,
              bounds.minLon,
              mapDimensions.width,
              mapDimensions.height
            );
            const bottomRight = latLonToXY(
              bounds.minLat,
              bounds.maxLon,
              mapDimensions.width,
              mapDimensions.height
            );
            return (
              <rect
                key={idx}
                x={topLeft.x}
                y={topLeft.y}
                width={Math.max(0, bottomRight.x - topLeft.x)}
                height={Math.max(0, bottomRight.y - topLeft.y)}
                fill="rgba(76, 175, 80, 0.4)"
                stroke="rgba(76, 175, 80, 0.6)"
                strokeWidth="1"
                rx="5"
              />
            );
          })}

          {/* Connection lines between balls */}
          {selectedPoints.length > 1 &&
            selectedPoints.map((p1, i) =>
              selectedPoints.slice(i + 1).map((p2, j) => {
                const pos1 = latLonToXY(p1.lat, p1.lon, mapDimensions.width, mapDimensions.height);
                const pos2 = latLonToXY(p2.lat, p2.lon, mapDimensions.width, mapDimensions.height);
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="rgba(255, 152, 0, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4,2"
                  />
                );
              })
            )}

          {/* Dragon Balls */}
          {selectedPoints.map((point, idx) => {
            const { x, y } = latLonToXY(
              point.lat,
              point.lon,
              mapDimensions.width,
              mapDimensions.height
            );
            return (
              <DragonBall
                key={idx}
                number={idx + 1}
                x={x}
                y={y}
                size={Math.max(30, mapDimensions.width / 25)}
                isSelected={hoveredBall === idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setHoveredBall(hoveredBall === idx ? null : idx);
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Statistics */}
      <div style={statsStyle}>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '12px', color: '#b39ddb', marginBottom: '4px' }}>
            Total Distance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffeb3b' }}>
            {totalDistance.toLocaleString()} km
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '12px', color: '#b39ddb', marginBottom: '4px' }}>
            Min Pair Distance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
            {minPairDistance.toLocaleString()} km
          </div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '12px', color: '#b39ddb', marginBottom: '4px' }}>
            Balls Placed
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
            {selectedPoints.length} / 7
          </div>
        </div>
      </div>

      {/* Point List */}
      {selectedPoints.length > 0 && (
        <div style={pointListStyle}>
          <h3 style={{ marginBottom: '10px', color: '#ffeb3b' }}>🌟 Dragon Ball Locations</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            {selectedPoints.map((point, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  background:
                    hoveredBall === idx ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: idx === 0 ? '2px solid #4caf50' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setHoveredBall(idx)}
                onMouseLeave={() => setHoveredBall(null)}
              >
                <span style={{ color: '#ff9800', fontWeight: 'bold' }}>{idx + 1}⭐</span>{' '}
                <span style={{ color: '#fff' }}>{point.name}</span>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                  {point.lat.toFixed(2)}°, {point.lon.toFixed(2)}°
                  {idx === 0 && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>(Your pick)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          maxWidth: '800px',
          margin: '20px auto',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <h3 style={{ color: '#ffeb3b', marginBottom: '10px' }}>📜 How to Play</h3>
        <ul style={{ paddingLeft: '20px', color: '#b39ddb' }}>
          <li>
            <strong>Click on the map</strong> to place the first Dragon Ball at a location of your
            choice
          </li>
          <li>The algorithm will automatically find 6 more locations on land that are far apart</li>
          <li>
            Click <strong>"Optimize Positions"</strong> to run simulated annealing and improve the
            placement
          </li>
          <li>
            The goal is to maximize the <strong>minimum pairwise distance</strong> between all 7
            balls
          </li>
          <li>Hover over locations in the list to highlight them on the map</li>
        </ul>
        <p style={{ marginTop: '10px', color: '#888', fontSize: '12px' }}>
          In memory of Akira Toriyama, creator of Dragon Ball 🙏
        </p>
      </div>
    </div>
  );
};

export default Completion9;
