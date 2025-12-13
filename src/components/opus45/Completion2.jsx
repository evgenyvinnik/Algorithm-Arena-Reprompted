import React, { useState, useRef, useCallback } from 'react';

const Completion2 = () => {
  const [points, setPoints] = useState([]);
  const [lineWidth, setLineWidth] = useState(10);
  const [gap, setGap] = useState(4);
  const svgRef = useRef(null);

  // Calculate perpendicular offset for a point
  const getPerpendicularOffset = (p1, p2, offset) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: 0, y: 0 };
    // Perpendicular direction (rotate 90 degrees)
    return { x: (-dy / len) * offset, y: (dx / len) * offset };
  };

  // Get direction from p1 to p2
  const getDirection = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  };

  // Calculate the turn type at a corner
  const getTurnType = useCallback((p1, p2, p3) => {
    const dir1 = getDirection(p1, p2);
    const dir2 = getDirection(p2, p3);

    const turns = {
      'right-down': 'right',
      'right-up': 'left',
      'left-down': 'left',
      'left-up': 'right',
      'down-right': 'left',
      'down-left': 'right',
      'up-right': 'right',
      'up-left': 'left',
    };

    return turns[`${dir1}-${dir2}`] || 'straight';
  }, []);

  // Generate double line paths
  const generateDoubleLinePaths = useCallback(() => {
    if (points.length < 2) return { inner: [], outer: [] };

    const offset = (lineWidth + gap) / 2;
    const innerPath = [];
    const outerPath = [];

    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];
      const next = points[i + 1];

      if (i === 0) {
        // First point - offset perpendicular to first segment
        const perp = getPerpendicularOffset(curr, next, offset);
        innerPath.push({ x: curr.x + perp.x, y: curr.y + perp.y });
        outerPath.push({ x: curr.x - perp.x, y: curr.y - perp.y });
      } else if (i === points.length - 1) {
        // Last point - offset perpendicular to last segment
        const perp = getPerpendicularOffset(prev, curr, offset);
        innerPath.push({ x: curr.x + perp.x, y: curr.y + perp.y });
        outerPath.push({ x: curr.x - perp.x, y: curr.y - perp.y });
      } else {
        // Corner point - handle the turn
        const turnType = getTurnType(prev, curr, next);
        const perpIn = getPerpendicularOffset(prev, curr, offset);
        const perpOut = getPerpendicularOffset(curr, next, offset);

        if (turnType === 'right') {
          // Right turn: inner line needs extra point, outer cuts corner
          innerPath.push({ x: curr.x + perpIn.x, y: curr.y + perpIn.y });
          innerPath.push({ x: curr.x + perpOut.x, y: curr.y + perpOut.y });
          outerPath.push({
            x: curr.x - perpIn.x - perpOut.x,
            y: curr.y - perpIn.y - perpOut.y,
          });
        } else if (turnType === 'left') {
          // Left turn: outer line needs extra point, inner cuts corner
          innerPath.push({
            x: curr.x + perpIn.x + perpOut.x,
            y: curr.y + perpIn.y + perpOut.y,
          });
          outerPath.push({ x: curr.x - perpIn.x, y: curr.y - perpIn.y });
          outerPath.push({ x: curr.x - perpOut.x, y: curr.y - perpOut.y });
        }
      }
    }

    return { inner: innerPath, outer: outerPath };
  }, [points, lineWidth, gap, getTurnType]);

  // Convert path to SVG path string
  const pathToSvgString = (path) => {
    if (path.length === 0) return '';
    return path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Handle canvas click to add points
  const handleCanvasClick = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (points.length === 0) {
      setPoints([{ x, y }]);
      return;
    }

    // Snap to 90 degrees (horizontal or vertical from last point)
    const lastPoint = points[points.length - 1];
    const dx = Math.abs(x - lastPoint.x);
    const dy = Math.abs(y - lastPoint.y);

    let newPoint;
    if (dx > dy) {
      newPoint = { x, y: lastPoint.y };
    } else {
      newPoint = { x: lastPoint.x, y };
    }

    // Don't add if too close to last point
    if (Math.abs(newPoint.x - lastPoint.x) < 10 && Math.abs(newPoint.y - lastPoint.y) < 10) {
      return;
    }

    setPoints([...points, newPoint]);
  };

  const { inner, outer } = generateDoubleLinePaths();

  const reset = () => setPoints([]);

  const loadExample = () => {
    // Example path that forms a snake pattern
    setPoints([
      { x: 50, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 },
      { x: 100, y: 300 },
      { x: 250, y: 300 },
      { x: 250, y: 400 },
      { x: 50, y: 400 },
    ]);
  };

  const loadSpiralExample = () => {
    setPoints([
      { x: 200, y: 50 },
      { x: 350, y: 50 },
      { x: 350, y: 350 },
      { x: 100, y: 350 },
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 150, y: 300 },
      { x: 150, y: 150 },
      { x: 250, y: 150 },
      { x: 250, y: 250 },
      { x: 200, y: 250 },
    ]);
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ marginBottom: '10px' }}>Double Lines Challenge</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Click on the canvas to add points. Lines are automatically snapped to 90° angles. Two
        parallel lines are drawn without overlapping.
      </p>

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button
          onClick={loadExample}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Load Snake Example
        </button>
        <button
          onClick={loadSpiralExample}
          style={{
            padding: '8px 16px',
            backgroundColor: '#44aa44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Load Spiral Example
        </button>
      </div>

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Line Width: {lineWidth}px
          <input
            type="range"
            min="2"
            max="30"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{ width: '120px' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Gap: {gap}px
          <input
            type="range"
            min="0"
            max="30"
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            style={{ width: '120px' }}
          />
        </label>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="450"
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          cursor: 'crosshair',
        }}
        onClick={handleCanvasClick}
      >
        {/* Center line (for reference) */}
        <path
          d={pathToSvgString(points)}
          fill="none"
          stroke="#ddd"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Inner double line */}
        <path
          d={pathToSvgString(inner)}
          fill="none"
          stroke="#3498db"
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer double line */}
        <path
          d={pathToSvgString(outer)}
          fill="none"
          stroke="#e74c3c"
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points markers */}
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="6" fill="#2c3e50" stroke="white" strokeWidth="2" />
            <text x={point.x + 10} y={point.y - 10} fontSize="12" fill="#2c3e50">
              {index + 1}
            </text>
          </g>
        ))}

        {/* Instructions when empty */}
        {points.length === 0 && (
          <text x="50%" y="50%" textAnchor="middle" fill="#999" fontSize="16">
            Click anywhere to start drawing
          </text>
        )}
      </svg>

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <strong>Points:</strong> {points.length} |
        <span style={{ color: '#3498db', marginLeft: '10px' }}>■</span> Inner Line |
        <span style={{ color: '#e74c3c', marginLeft: '10px' }}>■</span> Outer Line
      </div>
    </div>
  );
};

export default Completion2;
