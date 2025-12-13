import React, { useState, useEffect, useRef } from 'react';

const Completion12 = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const containerRef = useRef(null);
  const [interactiveElements, setInteractiveElements] = useState([]);

  // Update list of interactive elements
  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(
        'button, a, input, textarea, [role="button"]'
      );
      setInteractiveElements(Array.from(elements));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (interactiveElements.length === 0) return;

      let minDist = Infinity;
      let nearestEl = null;

      interactiveElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Get center of the element
        const elX = rect.left + rect.width / 2;
        const elY = rect.top + rect.height / 2;

        // Calculate distance
        const dx = elX - e.clientX;
        const dy = elY - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          minDist = dist;
          nearestEl = { x: elX, y: elY };
        }
      });

      if (nearestEl) {
        // Calculate angle to look at the nearest element
        // atan2(dy, dx) returns angle in radians.
        // 0 radians is pointing right (positive x).
        // Our cursor by default points up-left (-45deg visually or something).
        // Let's assume the SVG default rotation points "North" (up) or adjusted accordingly.
        // Actually, standard cursor points top-left.
        // dx, dy is vector FROM cursor TO target.
        const dx = nearestEl.x - e.clientX;
        const dy = nearestEl.y - e.clientY;

        let rad = Math.atan2(dy, dx);
        let deg = rad * (180 / Math.PI);

        // Adjust for cursor's default orientation.
        // A standard arrow cursor points roughly to (-1, -1) but let's draw one pointing UP (0,-1) and rotate.
        // If we draw an arrow pointing UP (0 degrees is usually Right in math, Up in CSS often 0 or -90?).
        // Math: 0 deg = right. 90 deg = down.
        // If our SVG points UP (-90 deg in math world), we need to add 90 deg.
        setAngle(deg + 90);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactiveElements]);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        padding: '40px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        cursor: 'none', // Hide default cursor
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <h1 className="text-3xl font-bold mb-8 text-center text-emerald-400">Fool's Cursor</h1>
      <p className="text-center mb-12 text-gray-400">The cursor knows what you want...</p>

      {/* Grid of random interactive elements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        <button className="p-4 bg-blue-600 rounded hover:bg-blue-500 transition shadow-lg">
          Click Me
        </button>
        <div
          role="button"
          className="p-4 bg-purple-600 rounded hover:bg-purple-500 transition flex items-center justify-center cursor-pointer shadow-lg"
        >
          Div Button
        </div>
        <input
          type="text"
          placeholder="Type here..."
          className="p-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-400 outline-none shadow-lg text-white"
        />
        <button className="p-4 bg-red-600 rounded hover:bg-red-500 transition shadow-lg">
          Danger Zone
        </button>
        <button className="p-4 bg-green-600 rounded hover:bg-green-500 transition shadow-lg">
          Submit
        </button>
        <a
          href="#"
          className="p-4 bg-orange-600 rounded hover:bg-orange-500 transition flex items-center justify-center shadow-lg block text-center"
        >
          Link Style
        </a>
        <textarea
          placeholder="Tell me more..."
          className="p-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-400 outline-none shadow-lg text-white resize-none"
        ></textarea>
        <button className="p-4 bg-pink-600 rounded hover:bg-pink-500 transition shadow-lg">
          Surprise
        </button>
      </div>

      <div className="mt-16 text-center">
        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition transform shadow-xl">
          The One True Button
        </button>
      </div>

      {/* Custom Cursor */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          pointerEvents: 'none', // Pass clicks through
          zIndex: 9999,
          transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) rotate(${angle}deg)`,
          // We center the rotation on the tip or center?
          // Usually cursor tip is top-left (0,0) of this div.
          // But for rotation to look right, maybe center?
          // Let's try transformOrigin: 'top left' and offset translate by half size if needed,
          // OR purely translate top-left and rotate around a pivot.
          // Standard arrow: tip is at 0,0.
          transformOrigin: 'top left',
          marginTop: '-5px', // Fine tune to register 'click' at the tip
          marginLeft: '-5px',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }}
        >
          {/* Simple Arrow Cursor Shape */}
          <path
            d="M5.5 3.21l10.08 10.08-4.24 1.14 3.73 8.32-2.3 1.02-3.72-8.32-3.13 2.95V3.21z"
            fill="white"
            stroke="black"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
};

export default Completion12;
