import React, { useState, useEffect, useRef, useCallback } from 'react';

// Custom cursor that points towards interactive elements
const Completion12 = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [nearestElement, setNearestElement] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  // Find all interactive elements
  const getInteractiveElements = useCallback(() => {
    if (!containerRef.current) return [];
    const selectors = 'button, a, input, select, textarea, [role="button"], [tabindex]';
    return Array.from(containerRef.current.querySelectorAll(selectors));
  }, []);

  // Calculate distance between two points
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Get center of an element
  const getElementCenter = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // Calculate angle between cursor and target
  const getAngle = (cx, cy, tx, ty) => {
    const dx = tx - cx;
    const dy = ty - cy;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Find nearest interactive element and calculate rotation
  const updateCursor = useCallback(
    (x, y) => {
      const elements = getInteractiveElements();
      if (elements.length === 0) {
        setRotation(-45); // Default cursor angle
        setNearestElement(null);
        return;
      }

      let nearest = null;
      let minDistance = Infinity;

      elements.forEach((element) => {
        const center = getElementCenter(element);
        const distance = getDistance(x, y, center.x, center.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { element, center, distance };
        }
      });

      if (nearest) {
        setNearestElement(nearest);
        // Calculate angle to point cursor towards the element
        // Subtract 45 degrees to account for the default cursor arrow direction
        const angle = getAngle(x, y, nearest.center.x, nearest.center.y) - 45;
        setRotation(angle);

        // Check if hovering over an interactive element
        const rect = nearest.element.getBoundingClientRect();
        const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        setIsHovering(isOver);
      }
    },
    [getInteractiveElements]
  );

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      updateCursor(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [updateCursor]);

  // Cursor SVG - Arrow shape that rotates
  const CursorSVG = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.3))',
      }}
    >
      {/* Main arrow */}
      <path
        d="M4 4 L4 28 L11 21 L18 30 L22 27 L15 18 L24 18 Z"
        fill={isHovering ? '#ff6b6b' : '#ffffff'}
        stroke="#000000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Sparkle effect when pointing */}
      {nearestElement && nearestElement.distance < 200 && (
        <>
          <circle cx="26" cy="6" r="2" fill="#ffdd59" opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="28" cy="10" r="1.5" fill="#ffdd59" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.6;0.2;0.6"
              dur="0.7s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
    </svg>
  );

  // Demo content styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '40px',
    cursor: 'none', // Hide default cursor
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const titleStyle = {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 'bold',
    marginBottom: '20px',
    background: 'linear-gradient(90deg, #ff6b6b, #ffdd59, #6bff6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: 'clamp(14px, 2vw, 18px)',
    color: '#888',
    marginBottom: '40px',
    textAlign: 'center',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
  };

  const buttonStyle = (color) => ({
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    cursor: 'none',
    background: color,
    color: '#fff',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  });

  const linkStyle = {
    color: '#6bff6b',
    textDecoration: 'underline',
    cursor: 'none',
    fontSize: '16px',
    padding: '10px',
    display: 'inline-block',
  };

  const inputStyle = {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #444',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'none',
    width: '250px',
    outline: 'none',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const statsStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '15px 20px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'monospace',
    zIndex: 1000,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Custom cursor */}
      <div
        style={{
          position: 'fixed',
          left: cursorPos.x,
          top: cursorPos.y,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: '4px 4px',
          pointerEvents: 'none',
          zIndex: 10000,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <CursorSVG />
      </div>

      {/* Line to nearest element */}
      {nearestElement && (
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        >
          <line
            x1={cursorPos.x}
            y1={cursorPos.y}
            x2={nearestElement.center.x}
            y2={nearestElement.center.y}
            stroke="rgba(255, 107, 107, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;10"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </line>
          {/* Target indicator */}
          <circle
            cx={nearestElement.center.x}
            cy={nearestElement.center.y}
            r="8"
            fill="none"
            stroke="rgba(255, 107, 107, 0.5)"
            strokeWidth="2"
          >
            <animate attributeName="r" values="8;15;8" dur="1s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.5;0.2;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      )}

      <h1 style={titleStyle}>🎯 Fools Cursor</h1>
      <p style={subtitleStyle}>
        Watch your cursor always point towards the nearest interactive element!
        <br />
        April Fools Day special - Add this to your website for a fun prank! 🃏
      </p>

      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Interactive Buttons</h2>
        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle('linear-gradient(135deg, #ff6b6b, #ee5a5a)')}
            onClick={() => alert('🎉 You clicked me!')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            Click Me!
          </button>
          <button
            style={buttonStyle('linear-gradient(135deg, #4ecdc4, #3db9b1)')}
            onClick={() => alert('🎊 Nice click!')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            Try This
          </button>
          <button
            style={buttonStyle('linear-gradient(135deg, #a55eea, #8854d0)')}
            onClick={() => alert('✨ Magic click!')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 25px rgba(165, 94, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            Or This
          </button>
          <button
            style={buttonStyle('linear-gradient(135deg, #ffa502, #ff7f50)')}
            onClick={() => alert('🔥 Hot click!')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 25px rgba(255, 165, 2, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            Hot Button
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Links Section</h2>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#" style={linkStyle} onClick={(e) => e.preventDefault()}>
            🔗 Cool Link 1
          </a>
          <a href="#" style={linkStyle} onClick={(e) => e.preventDefault()}>
            🌟 Amazing Link 2
          </a>
          <a href="#" style={linkStyle} onClick={(e) => e.preventDefault()}>
            🚀 Awesome Link 3
          </a>
          <a href="#" style={linkStyle} onClick={(e) => e.preventDefault()}>
            💎 Premium Link 4
          </a>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Form Elements</h2>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Type something..."
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = '#6bff6b';
              e.target.style.boxShadow = '0 0 15px rgba(107, 255, 107, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#444';
              e.target.style.boxShadow = 'none';
            }}
          />
          <select
            style={{
              ...inputStyle,
              width: '200px',
            }}
          >
            <option>Select an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
          <button
            style={buttonStyle('linear-gradient(135deg, #26de81, #20bf6b)')}
            onClick={() => alert('📝 Form submitted!')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Submit Form
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Scattered Buttons</h2>
        <div
          style={{
            position: 'relative',
            height: '200px',
            width: '100%',
          }}
        >
          {[
            { top: '10%', left: '10%', color: '#ff6b6b' },
            { top: '60%', left: '25%', color: '#4ecdc4' },
            { top: '20%', left: '70%', color: '#a55eea' },
            { top: '70%', left: '80%', color: '#ffa502' },
            { top: '40%', left: '45%', color: '#2ed573' },
          ].map((pos, idx) => (
            <button
              key={idx}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'none',
                background: pos.color,
                color: '#fff',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => alert(`Button ${idx + 1} clicked!`)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              Button {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Stats panel */}
      <div style={statsStyle}>
        <div>
          📍 Cursor: ({Math.round(cursorPos.x)}, {Math.round(cursorPos.y)})
        </div>
        <div>🔄 Rotation: {Math.round(rotation)}°</div>
        <div>📏 Distance: {nearestElement ? Math.round(nearestElement.distance) : '-'}px</div>
        <div>🎯 Hovering: {isHovering ? 'Yes' : 'No'}</div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#666',
          fontSize: '14px',
        }}
      >
        <p>🃏 Happy April Fools Day! 🃏</p>
        <p>Add this component to your website to prank your visitors!</p>
      </div>
    </div>
  );
};

export default Completion12;
