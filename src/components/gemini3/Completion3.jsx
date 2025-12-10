import React, { useState, useEffect, useRef } from 'react';

const Completion3 = () => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [ballState, setBallState] = useState({ x: 0, y: 0, vx: 0, vy: 0, scaleX: 1, scaleY: 1 });
  const formRef = useRef(null);
  const requestRef = useRef();

  // Physics constants
  const SPRING_STIFFNESS = 0.1;
  const DAMPING = 0.8;
  const SQUASH_FACTOR = 0.05;

  const inputs = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel' },
    { id: 'address', label: 'Address', type: 'text' },
    { id: 'comments', label: 'Comments', type: 'textarea' },
  ];

  const handleFocus = (e) => {
    const rect = e.target.getBoundingClientRect();
    const formRect = formRef.current.getBoundingClientRect();
    
    // Calculate position relative to the form container
    // Target position is centered vertically in the input, and slightly to the left or right
    // Let's put it to the left of the input for now
    const targetX = rect.left - formRect.left - 30; 
    const targetY = rect.top - formRect.top + rect.height / 2;

    setFocusedInput({ x: targetX, y: targetY });
  };

  const updatePhysics = () => {
    if (!focusedInput) return;

    setBallState((prevState) => {
      let { x, y, vx, vy } = prevState;
      const targetX = focusedInput.x;
      const targetY = focusedInput.y;

      // Spring force
      const ax = (targetX - x) * SPRING_STIFFNESS;
      const ay = (targetY - y) * SPRING_STIFFNESS;

      // Update velocity
      vx = (vx + ax) * DAMPING;
      vy = (vy + ay) * DAMPING;

      // Update position
      x += vx;
      y += vy;

      // Squash and stretch
      // Velocity magnitude
      const v = Math.sqrt(vx * vx + vy * vy);
      // Stretch along the velocity vector
      // For simplicity, we'll just scale based on overall speed for now, 
      // but ideally we rotate the ball to match velocity direction.
      // A simple squash/stretch without rotation:
      // Stretch in direction of movement, squash perpendicular.
      // Since we can't easily rotate the div without more complex transforms,
      // let's just do a "breathing" effect or simple scale based on speed.
      
      // Better approach for 2D squash/stretch without rotation:
      // Scale X and Y based on Vx and Vy?
      // If moving fast in X, scaleX > 1, scaleY < 1
      
      const stretchAmount = 1 + v * SQUASH_FACTOR;
      const squashAmount = 1 / stretchAmount;
      
      // Determine dominant direction
      let scaleX = 1;
      let scaleY = 1;
      
      if (Math.abs(vx) > Math.abs(vy)) {
          scaleX = stretchAmount;
          scaleY = squashAmount;
      } else {
          scaleX = squashAmount;
          scaleY = stretchAmount;
      }

      // Clamp scales to avoid extreme deformation
      scaleX = Math.max(0.5, Math.min(2, scaleX));
      scaleY = Math.max(0.5, Math.min(2, scaleY));

      // Stop if very close and slow
      if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1 && v < 0.1) {
         x = targetX;
         y = targetY;
         vx = 0;
         vy = 0;
         scaleX = 1;
         scaleY = 1;
      }

      return { x, y, vx, vy, scaleX, scaleY };
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    if (focusedInput) {
        // Start animation loop if not already running or just ensure it continues
        cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [focusedInput]);

  // Initial position setup
  useEffect(() => {
      // Set initial ball position to the first input or hidden
      // For now, let's just let it fly in from 0,0
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div 
        ref={formRef}
        style={{ 
          position: 'relative', 
          width: '500px', 
          padding: '20px', 
          border: '1px solid #ccc', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Bouncy Form</h2>
        
        {/* The Ball */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ff4081',
            transform: `translate(${ballState.x}px, ${ballState.y}px) translate(-50%, -50%) scale(${ballState.scaleX}, ${ballState.scaleY})`,
            pointerEvents: 'none', // Let clicks pass through
            zIndex: 10,
            willChange: 'transform',
          }}
        />

        <form onSubmit={(e) => e.preventDefault()}>
          {inputs.map((input) => (
            <div key={input.id} style={{ marginBottom: '15px' }}>
              <label 
                htmlFor={input.id} 
                style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}
              >
                {input.label}
              </label>
              {input.type === 'textarea' ? (
                <textarea
                  id={input.id}
                  onFocus={handleFocus}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    minHeight: '80px',
                    fontSize: '16px'
                  }}
                />
              ) : (
                <input
                  type={input.type}
                  id={input.id}
                  onFocus={handleFocus}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    fontSize: '16px'
                  }}
                />
              )}
            </div>
          ))}
          <button 
            type="submit"
            style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3f51b5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '10px'
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Completion3;
