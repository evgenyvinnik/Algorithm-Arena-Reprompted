import React, { useState, useEffect, useRef, useCallback } from 'react';

const Completion3 = () => {
  const [ballPosition, setBallPosition] = useState({ x: 100, y: 100 });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 100, y: 100 });
  const [isSquashing, setIsSquashing] = useState(false);
  const [squashDirection, setSquashDirection] = useState({
    scaleX: 1,
    scaleY: 1,
  });
  const [focusedField, setFocusedField] = useState(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const inputRefs = useRef({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const fields = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'John',
    },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'john@example.com',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: '+1 234 567 8900',
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Acme Inc.',
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Your message here...',
    },
  ];

  const getFieldPosition = useCallback((fieldName) => {
    const input = inputRefs.current[fieldName];
    const container = containerRef.current;
    if (input && container) {
      const inputRect = input.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        x: inputRect.left - containerRect.left - 50,
        y: inputRect.top - containerRect.top + inputRect.height / 2,
      };
    }
    return null;
  }, []);

  const updateTargetFromField = useCallback(
    (fieldName) => {
      if (fieldName) {
        const pos = getFieldPosition(fieldName);
        if (pos) {
          setTargetPosition(pos);
        }
      }
    },
    [getFieldPosition]
  );

  useEffect(() => {
    const springStiffness = 0.08;
    const damping = 0.75;
    const minVelocity = 0.01;

    const animate = () => {
      setBallPosition((prev) => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;

        let newVelX = ballVelocity.x + dx * springStiffness;
        let newVelY = ballVelocity.y + dy * springStiffness;

        newVelX *= damping;
        newVelY *= damping;

        const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);

        // Calculate squash and stretch based on velocity
        if (speed > 1) {
          setIsSquashing(true);
          const stretchFactor = Math.min(speed / 15, 0.4);
          const angle = Math.atan2(newVelY, newVelX);

          // Stretch in direction of movement, squash perpendicular
          const stretch = 1 + stretchFactor;
          const squash = 1 - stretchFactor * 0.5;

          setSquashDirection({
            scaleX: stretch,
            scaleY: squash,
            rotation: (angle * 180) / Math.PI,
          });
        } else {
          setIsSquashing(false);
          setSquashDirection({ scaleX: 1, scaleY: 1, rotation: 0 });
        }

        setBallVelocity({ x: newVelX, y: newVelY });

        if (
          Math.abs(newVelX) < minVelocity &&
          Math.abs(newVelY) < minVelocity &&
          Math.abs(dx) < 1 &&
          Math.abs(dy) < 1
        ) {
          return prev;
        }

        return {
          x: prev.x + newVelX,
          y: prev.y + newVelY,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition, ballVelocity]);

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
    updateTargetFromField(fieldName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Add a little bounce when typing
    setBallVelocity((prev) => ({
      x: prev.x + (Math.random() - 0.5) * 3,
      y: prev.y + (Math.random() - 0.5) * 3,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Big bounce on submit
    setBallVelocity({ x: 0, y: -30 });
    setTimeout(() => {
      alert('Form submitted! 🎉');
    }, 500);
  };

  const styles = {
    container: {
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: 'hidden',
    },
    formWrapper: {
      maxWidth: '500px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    title: {
      textAlign: 'center',
      color: 'white',
      fontSize: '2.5rem',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    },
    subtitle: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.8)',
      fontSize: '1rem',
      marginBottom: '30px',
    },
    form: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    fieldGroup: {
      marginBottom: '25px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#333',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '15px 20px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
    },
    inputFocused: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.2)',
    },
    textarea: {
      width: '100%',
      padding: '15px 20px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '18px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      marginTop: '10px',
    },
    ball: {
      position: 'absolute',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(145deg, #ff6b6b, #ee5a5a)',
      boxShadow: `
        inset -5px -5px 15px rgba(0,0,0,0.2),
        inset 5px 5px 15px rgba(255,255,255,0.3),
        0 10px 30px rgba(238, 90, 90, 0.4)
      `,
      zIndex: 100,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ballFace: {
      position: 'relative',
      width: '30px',
      height: '20px',
    },
    eye: {
      position: 'absolute',
      width: '8px',
      height: '10px',
      background: '#333',
      borderRadius: '50%',
      top: '0',
    },
    eyeLeft: {
      left: '4px',
    },
    eyeRight: {
      right: '4px',
    },
    mouth: {
      position: 'absolute',
      width: '15px',
      height: '8px',
      border: '3px solid #333',
      borderTop: 'none',
      borderRadius: '0 0 15px 15px',
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    highlight: {
      position: 'absolute',
      width: '12px',
      height: '12px',
      background: 'rgba(255,255,255,0.6)',
      borderRadius: '50%',
      top: '8px',
      right: '10px',
    },
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Bouncy Ball */}
      <div
        style={{
          ...styles.ball,
          left: ballPosition.x,
          top: ballPosition.y,
          transform: `
            translate(-50%, -50%)
            rotate(${squashDirection.rotation || 0}deg)
            scaleX(${squashDirection.scaleX})
            scaleY(${squashDirection.scaleY})
          `,
          transition: isSquashing ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div style={styles.highlight}></div>
        <div style={styles.ballFace}>
          <div style={{ ...styles.eye, ...styles.eyeLeft }}></div>
          <div style={{ ...styles.eye, ...styles.eyeRight }}></div>
          <div style={styles.mouth}></div>
        </div>
      </div>

      <div style={styles.formWrapper}>
        <h1 style={styles.title}>✨ Bouncy Form</h1>
        <p style={styles.subtitle}>Fill out the form and watch the ball follow along!</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} style={styles.fieldGroup}>
              <label style={styles.label}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  ref={(el) => (inputRefs.current[field.name] = el)}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onFocus={() => handleFocus(field.name)}
                  style={{
                    ...styles.textarea,
                    ...(focusedField === field.name ? styles.inputFocused : {}),
                  }}
                />
              ) : (
                <input
                  ref={(el) => (inputRefs.current[field.name] = el)}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onFocus={() => handleFocus(field.name)}
                  style={{
                    ...styles.input,
                    ...(focusedField === field.name ? styles.inputFocused : {}),
                  }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Submit 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default Completion3;
