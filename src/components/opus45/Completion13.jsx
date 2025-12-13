import React, { useState, useEffect, useRef, useCallback } from 'react';

// Constants
const G = 0.5; // Gravitational constant (adjusted for simulation)
const DT = 0.02; // Time step
const SOFTENING = 5; // Softening factor to prevent singularities
const ECLIPSE_THRESHOLD = 0.02; // Threshold for alignment detection (radians)

// Body class for physics
class CelestialBody {
  constructor(x, y, vx, vy, mass, radius, color, name) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.name = name;
    this.trail = [];
    this.maxTrailLength = 200;
  }

  updateTrail() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  clone() {
    const clone = new CelestialBody(
      this.x,
      this.y,
      this.vx,
      this.vy,
      this.mass,
      this.radius,
      this.color,
      this.name
    );
    clone.trail = [...this.trail];
    return clone;
  }
}

// Calculate gravitational force between two bodies
const calculateForce = (body1, body2) => {
  const dx = body2.x - body1.x;
  const dy = body2.y - body1.y;
  const distSq = dx * dx + dy * dy + SOFTENING * SOFTENING;
  const dist = Math.sqrt(distSq);
  const force = (G * body1.mass * body2.mass) / distSq;
  return {
    fx: (force * dx) / dist,
    fy: (force * dy) / dist,
  };
};

// Check if three points are collinear (aligned)
const checkAlignment = (bodies) => {
  const [a, b, c] = bodies;

  // Calculate vectors AB and AC
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const acx = c.x - a.x;
  const acy = c.y - a.y;

  // Cross product magnitude
  const cross = Math.abs(abx * acy - aby * acx);

  // Calculate distances
  const abLen = Math.sqrt(abx * abx + aby * aby);
  const acLen = Math.sqrt(acx * acx + acy * acy);

  if (abLen === 0 || acLen === 0) return { aligned: false, error: Infinity };

  // Normalize by the product of distances to get sin(angle)
  const sinAngle = cross / (abLen * acLen);

  return {
    aligned: sinAngle < ECLIPSE_THRESHOLD,
    error: sinAngle,
  };
};

// Get eclipse type based on body order
const getEclipseType = (bodies) => {
  const [a, b, c] = bodies;

  // Calculate distances
  const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  const ac = Math.sqrt((c.x - a.x) ** 2 + (c.y - a.y) ** 2);
  const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);

  // Determine which body is in the middle
  if (ab + bc < ac + 1 && ab + bc < ab + ac + 1) {
    return { middle: b, observer: a, occulted: c };
  } else if (ab + ac < bc + 1) {
    return { middle: a, observer: b, occulted: c };
  } else {
    return { middle: c, observer: a, occulted: b };
  }
};

// Initial configurations
const createStableSystem = () => {
  // Figure-8 inspired stable configuration
  const scale = 150;
  return [
    new CelestialBody(-scale, 0, 0, -0.8, 100, 25, '#FFD700', 'Sun'),
    new CelestialBody(scale * 0.5, scale * 0.866, 0.7, 0.4, 50, 18, '#4169E1', 'Earth'),
    new CelestialBody(scale * 0.5, -scale * 0.866, -0.7, 0.4, 30, 12, '#C0C0C0', 'Moon'),
  ];
};

const createChaosSystem = () => {
  // More chaotic configuration
  return [
    new CelestialBody(0, 0, 0, 0, 150, 30, '#FF4500', 'Star A'),
    new CelestialBody(120, 80, -0.5, 0.8, 80, 20, '#00CED1', 'Star B'),
    new CelestialBody(-100, 120, 0.6, -0.3, 60, 15, '#9370DB', 'Star C'),
  ];
};

const createBinaryWithPlanet = () => {
  // Binary star system with orbiting planet
  return [
    new CelestialBody(-60, 0, 0, 0.6, 100, 25, '#FFA500', 'Star A'),
    new CelestialBody(60, 0, 0, -0.6, 100, 25, '#FF6347', 'Star B'),
    new CelestialBody(0, 200, -1.2, 0, 20, 10, '#32CD32', 'Planet'),
  ];
};

// Main Component
const Completion13 = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [bodies, setBodies] = useState(() => createStableSystem());
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(0);
  const [eclipseEvents, setEclipseEvents] = useState([]);
  const [currentEclipse, setCurrentEclipse] = useState(null);
  const [showTrails, setShowTrails] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [nextEclipsePrediction, setNextEclipsePrediction] = useState(null);
  const bodiesRef = useRef(bodies);
  const lastEclipseTimeRef = useRef(-10);

  // Update physics
  const updatePhysics = useCallback((currentBodies, dt) => {
    const newBodies = currentBodies.map((b) => b.clone());

    // Calculate forces
    const forces = newBodies.map(() => ({ fx: 0, fy: 0 }));

    for (let i = 0; i < newBodies.length; i++) {
      for (let j = i + 1; j < newBodies.length; j++) {
        const force = calculateForce(newBodies[i], newBodies[j]);
        forces[i].fx += force.fx;
        forces[i].fy += force.fy;
        forces[j].fx -= force.fx;
        forces[j].fy -= force.fy;
      }
    }

    // Update velocities and positions (Velocity Verlet integration)
    for (let i = 0; i < newBodies.length; i++) {
      const ax = forces[i].fx / newBodies[i].mass;
      const ay = forces[i].fy / newBodies[i].mass;

      newBodies[i].vx += ax * dt;
      newBodies[i].vy += ay * dt;
      newBodies[i].x += newBodies[i].vx * dt;
      newBodies[i].y += newBodies[i].vy * dt;
      newBodies[i].updateTrail();
    }

    return newBodies;
  }, []);

  // Predict next eclipse using simulation lookahead
  const predictNextEclipse = useCallback(
    (currentBodies, currentTime) => {
      let simBodies = currentBodies.map((b) => b.clone());
      const maxSteps = 5000;
      const simDt = DT * 2;

      for (let step = 0; step < maxSteps; step++) {
        simBodies = updatePhysics(simBodies, simDt).map((b) => {
          const clone = b.clone();
          clone.trail = []; // Don't track trails in prediction
          return clone;
        });

        const alignment = checkAlignment(simBodies);
        if (alignment.aligned) {
          return {
            time: currentTime + step * simDt,
            bodies: simBodies.map((b) => ({ x: b.x, y: b.y, name: b.name })),
            stepsAhead: step,
          };
        }
      }

      return null;
    },
    [updatePhysics]
  );

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let currentTime = time;
    let currentBodies = bodiesRef.current;

    const animate = () => {
      // Update physics multiple times based on speed
      for (let i = 0; i < speed; i++) {
        currentBodies = updatePhysics(currentBodies, DT);
        currentTime += DT;
      }

      // Check for eclipse
      const alignment = checkAlignment(currentBodies);
      if (alignment.aligned && currentTime - lastEclipseTimeRef.current > 2) {
        const eclipseInfo = getEclipseType(currentBodies);
        const newEclipse = {
          time: currentTime,
          type: `${eclipseInfo.middle.name} between ${eclipseInfo.observer.name} and ${eclipseInfo.occulted.name}`,
          alignment: alignment.error,
        };
        setCurrentEclipse(newEclipse);
        setEclipseEvents((prev) => [...prev.slice(-9), newEclipse]);
        lastEclipseTimeRef.current = currentTime;

        // Predict next eclipse
        const prediction = predictNextEclipse(currentBodies, currentTime);
        setNextEclipsePrediction(prediction);
      } else if (!alignment.aligned) {
        setCurrentEclipse(null);
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 100; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 73.7) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw trails
      if (showTrails) {
        currentBodies.forEach((body) => {
          if (body.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(centerX + body.trail[0].x, centerY + body.trail[0].y);
            body.trail.forEach((point, i) => {
              ctx.lineTo(centerX + point.x, centerY + point.y);
            });
            ctx.strokeStyle = body.color + '40';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
      }

      // Draw alignment line during eclipse
      if (alignment.aligned) {
        ctx.beginPath();
        ctx.moveTo(centerX + currentBodies[0].x, centerY + currentBodies[0].y);
        ctx.lineTo(centerX + currentBodies[2].x, centerY + currentBodies[2].y);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw bodies
      currentBodies.forEach((body) => {
        // Glow effect
        const gradient = ctx.createRadialGradient(
          centerX + body.x,
          centerY + body.y,
          0,
          centerX + body.x,
          centerY + body.y,
          body.radius * 2
        );
        gradient.addColorStop(0, body.color);
        gradient.addColorStop(0.5, body.color + '80');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(centerX + body.x, centerY + body.y, body.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Main body
        ctx.beginPath();
        ctx.arc(centerX + body.x, centerY + body.y, body.radius, 0, Math.PI * 2);
        ctx.fillStyle = body.color;
        ctx.fill();

        // Name label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(body.name, centerX + body.x, centerY + body.y + body.radius + 15);
      });

      // Eclipse indicator
      if (alignment.aligned) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🌑 ECLIPSE! 🌑', centerX, 40);
      }

      // Update state
      bodiesRef.current = currentBodies;
      setTime(currentTime);
      setBodies([...currentBodies]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, speed, showTrails, updatePhysics, predictNextEclipse, time]);

  const resetSystem = (systemType) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    let newBodies;
    switch (systemType) {
      case 'stable':
        newBodies = createStableSystem();
        break;
      case 'chaos':
        newBodies = createChaosSystem();
        break;
      case 'binary':
        newBodies = createBinaryWithPlanet();
        break;
      default:
        newBodies = createStableSystem();
    }

    setBodies(newBodies);
    bodiesRef.current = newBodies;
    setTime(0);
    setEclipseEvents([]);
    setCurrentEclipse(null);
    setNextEclipsePrediction(null);
    lastEclipseTimeRef.current = -10;
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a1628 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  };

  const titleStyle = {
    fontSize: 'clamp(24px, 5vw, 42px)',
    fontWeight: 'bold',
    marginBottom: '10px',
    background: 'linear-gradient(90deg, #FFD700, #FF6347, #9370DB)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: 'clamp(12px, 2vw, 16px)',
    color: '#888',
    marginBottom: '20px',
    textAlign: 'center',
  };

  const canvasStyle = {
    borderRadius: '12px',
    border: '2px solid #333',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
    maxWidth: '100%',
  };

  const controlsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const buttonStyle = (active = false) => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: active ? 'linear-gradient(90deg, #FFD700, #FF6347)' : 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    transition: 'all 0.3s ease',
  });

  const infoBoxStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '20px',
    maxWidth: '800px',
    width: '100%',
  };

  const statStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🌌 Three-Body Eclipse Predictor</h1>
      <p style={subtitleStyle}>
        Watch three celestial bodies dance under gravity and predict their eclipses!
      </p>

      <div style={controlsStyle}>
        <button style={buttonStyle(isRunning)} onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button style={buttonStyle()} onClick={() => resetSystem('stable')}>
          🌟 Stable System
        </button>
        <button style={buttonStyle()} onClick={() => resetSystem('chaos')}>
          🌀 Chaotic System
        </button>
        <button style={buttonStyle()} onClick={() => resetSystem('binary')}>
          ⭐⭐ Binary + Planet
        </button>
        <button style={buttonStyle(showTrails)} onClick={() => setShowTrails(!showTrails)}>
          {showTrails ? '🔵 Hide Trails' : '⚪ Show Trails'}
        </button>
      </div>

      <div style={{ ...controlsStyle, marginBottom: '20px' }}>
        <span style={{ alignSelf: 'center' }}>Speed:</span>
        {[1, 2, 5, 10].map((s) => (
          <button key={s} style={buttonStyle(speed === s)} onClick={() => setSpeed(s)}>
            {s}x
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} width={800} height={600} style={canvasStyle} />

      <div style={infoBoxStyle}>
        <h3 style={{ marginTop: 0, color: '#FFD700' }}>📊 Simulation Info</h3>

        <div style={statStyle}>
          <span>⏱️ Time Elapsed:</span>
          <span>{time.toFixed(2)} units</span>
        </div>

        <div style={statStyle}>
          <span>🌑 Total Eclipses:</span>
          <span>{eclipseEvents.length}</span>
        </div>

        {currentEclipse && (
          <div
            style={{
              ...statStyle,
              background: 'rgba(255, 215, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px',
            }}
          >
            <span>🔆 Current Eclipse:</span>
            <span>{currentEclipse.type}</span>
          </div>
        )}

        {nextEclipsePrediction && (
          <div
            style={{
              ...statStyle,
              background: 'rgba(100, 149, 237, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px',
            }}
          >
            <span>🔮 Next Eclipse Predicted:</span>
            <span>~{(nextEclipsePrediction.time - time).toFixed(1)} time units</span>
          </div>
        )}

        {eclipseEvents.length > 0 && (
          <>
            <h4 style={{ color: '#9370DB', marginTop: '20px' }}>📜 Recent Eclipse Events</h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {eclipseEvents
                .slice()
                .reverse()
                .map((event, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '5px',
                      fontSize: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#FFD700' }}>t={event.time.toFixed(2)}</span>
                    {' - '}
                    <span>{event.type}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div style={{ ...infoBoxStyle, marginTop: '15px' }}>
        <h3 style={{ marginTop: 0, color: '#FF6347' }}>🪐 Body Positions</h3>
        {bodies.map((body, i) => (
          <div key={i} style={statStyle}>
            <span style={{ color: body.color }}>{body.name}</span>
            <span>
              x: {body.x.toFixed(1)}, y: {body.y.toFixed(1)} | v: ({body.vx.toFixed(2)},{' '}
              {body.vy.toFixed(2)})
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          maxWidth: '800px',
          fontSize: '14px',
          color: '#888',
        }}
      >
        <strong style={{ color: '#FFD700' }}>How it works:</strong>
        <p>
          This simulation models the gravitational three-body problem, where three celestial bodies
          interact through gravity. The system predicts eclipses by detecting when all three bodies
          align in a straight line. The chaotic nature of the three-body problem makes long-term
          predictions challenging, but the simulator runs ahead to forecast the next alignment.
        </p>
        <p>
          <strong>Eclipse Detection:</strong> An eclipse occurs when the angle between the vectors
          connecting the three bodies is nearly zero (within{' '}
          {((ECLIPSE_THRESHOLD * 180) / Math.PI).toFixed(2)}°).
        </p>
      </div>
    </div>
  );
};

export default Completion13;
