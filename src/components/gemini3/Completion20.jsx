import React, { useState, useEffect, useRef } from 'react';

export const Completion20 = () => {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (clicked) {
      const timeout = setTimeout(() => setClicked(false), 2000); // Reset click state
      return () => clearTimeout(timeout);
    }
  }, [clicked]);

  const sparkParticles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    dist: 50 + Math.random() * 100,
    size: 2 + Math.random() * 4,
    color: `hsl(${Math.random() * 60 + 280}, 100%, 70%)`,
    delay: Math.random() * 0.2,
  }));

  const handlePointerMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Calculate rotation based on mouse position
    const rotateX = -y / 2; // Inverted for natural feel
    const rotateY = x / 2;

    buttonRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.1, 1.1, 1.1)
    `;
  };

  const handlePointerLeave = () => {
    setHovered(false);
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  const handlePointerEnter = () => {
    setHovered(true);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative font-sans text-white">
      {/* Background with animated gradient mesh */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #2a0a4a 0%, #000000 100%)',
          filter: 'contrast(120%) brightness(120%)'
        }}>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spin-slow opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, purple, blue, cyan, purple)',
            filter: 'blur(100px)',
            animation: 'spin20 20s linear infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes spin20 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float20 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow20 {
          0%, 100% { box-shadow: 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 80px #a855f7; }
          50% { box-shadow: 0 0 30px #d8b4fe, 0 0 60px #d8b4fe, 0 0 100px #d8b4fe; }
        }
        @keyframes particle20 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .extravagant-text-20 {
            background: linear-gradient(to bottom, #fff, #d8b4fe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
      `}</style>

      <div
        className="relative z-10"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onMouseEnter={handlePointerEnter}
      >
        <button
          ref={buttonRef}
          onClick={() => setClicked(true)}
          className={`
            relative px-16 py-8
            text-4xl font-black tracking-widest uppercase
            bg-transparent border-none outline-none cursor-pointer
            transition-all duration-100 ease-out
            group
          `}
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* The "Body" of the button - multile layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-600 rounded-2xl transform translate-z-[-20px] shadow-[0_20px_50px_rgba(168,85,247,0.6)]"
            style={{ transform: 'translateZ(-10px)' }}></div>

          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-500 rounded-2xl opacity-80"
            style={{ transform: 'translateZ(-5px)' }}></div>

          {/* Glossy top layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-2xl border border-white/40"
            style={{
              backdropFilter: 'blur(4px)',
              transform: 'translateZ(0px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.2)'
            }}
          ></div>

          {/* Inner Neon Border */}
          <div className="absolute inset-1 border-2 border-fuchsia-300 rounded-xl opacity-70 blur-[1px]"
            style={{ transform: 'translateZ(2px)' }}></div>

          {/* Text Content */}
          <span className="extravagant-text-20 relative block transform transition-transform group-hover:scale-110"
            style={{ transform: 'translateZ(20px)', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
            {clicked ? "BOOM!" : "ACTIVATE"}
          </span>

          {/* Particles on Click */}
          {clicked && sparkParticles.map(p => (
            <div key={p.id}
              className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                '--tx': `${Math.cos(p.angle * Math.PI / 180) * p.dist}px`,
                '--ty': `${Math.sin(p.angle * Math.PI / 180) * p.dist}px`,
                animation: `particle20 0.8s ease-out forwards ${p.delay}s`
              }}
            />
          ))}

        </button>

        {/* Ambient Glow underneath */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 bg-fuchsia-600 blur-[80px] opacity-40 animate-pulse"></div>

      </div>

      <div className="mt-20 text-center z-10 opacity-70">
        <p className="text-sm font-light tracking-[0.5em] text-fuchsia-200">
          ALGORITHM ARENA CHALLENGE #20
        </p>
      </div>

    </div>
  );
};

export default Completion20;
