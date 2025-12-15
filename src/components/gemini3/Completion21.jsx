import React, { useRef, useEffect, useState } from 'react';

const Completion21 = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const particlesRef = useRef([]);
  const textCoordinatesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 100 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Constants
  const PARTICLE_SIZE = 1; // Slightly larger for visibility
  const BASE_COLOR = 'rgba(0, 255, 255, 0.8)'; // Cyan glow
  const TEXT_SIZE = 120;
  const FONT = 'Verdana';

  // Particle Class Function
  class Particle {
    constructor(x, y) {
      this.x = Math.random() * dimensions.width;
      this.y = Math.random() * dimensions.height;
      this.size = Math.random() * 2 + 1; // Random size
      this.baseX = x;
      this.baseY = y;
      this.density = (Math.random() * 30) + 1; // For parallax/weight sensation
      this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // Cyan to Blue range
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Mouse Interaction
      let dx = mouseRef.current.x - this.x;
      let dy = mouseRef.current.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = mouseRef.current.radius;
      let force = (maxDistance - distance) / maxDistance;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;

      if (distance < mouseRef.current.radius) {
        this.x -= directionX;
        this.y -= directionY;
      } else {
        // Return to base position
        if (this.x !== this.baseX) {
          let dx = this.x - this.baseX;
          this.x -= dx / 10; // Easing
        }
        if (this.y !== this.baseY) {
          let dy = this.y - this.baseY;
          this.y -= dy / 10;
        }
      }
    }
  }

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        setDimensions({
          width: canvasRef.current.parentElement.clientWidth,
          height: canvasRef.current.parentElement.clientHeight || 600
        });
      }
    };

    // Initial resize
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Logic Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Helper to get text coordinates from an off-screen render
    const getTextCoordinates = (text) => {
      // Clear canvas for analysis? No, don't clear main canvas, use a virtual logic or just draw briefly
      // Actually, we can just draw on the main canvas, read data, then clear
      // Or better: keep a simpler approach. 
      // We will clear the canvas, draw text, read pixels, then start particle system.
      // Since we need to update time regularly, we need to do this efficiently.

      // Let's create an off-screen canvas for sampling
      /* 
         NOTE: Creating a fresh canvas every second might be expensive, 
         but for a simple clock it's fine. 
      */

      const offCanvas = document.createElement('canvas');
      offCanvas.width = dimensions.width;
      offCanvas.height = dimensions.height;
      const offCtx = offCanvas.getContext('2d');

      offCtx.font = `bold ${TEXT_SIZE}px ${FONT}`;
      offCtx.fillStyle = 'white';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, dimensions.width / 2, dimensions.height / 2);

      const imageData = offCtx.getImageData(0, 0, dimensions.width, dimensions.height);
      const data = imageData.data;
      const coordinates = [];

      // Sampling rate can be adjusted (step > 1) for performance
      const step = 4;

      for (let y = 0; y < dimensions.height; y += step) {
        for (let x = 0; x < dimensions.width; x += step) {
          const index = (y * dimensions.width + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 128) {
            coordinates.push({ x, y });
          }
        }
      }
      return coordinates;
    };

    let lastTimeStr = '';
    let frameId;

    const initParticles = (text) => {
      const coords = getTextCoordinates(text);
      textCoordinatesRef.current = coords;

      // Adjust particle count to match coords
      // If we have more coords than particles, add particles
      // If fewer, trim particles (or hide them)

      // Current approach: Re-assign targets to existing particles 
      // and add/remove as needed.

      const required = coords.length;
      let currentParticles = particlesRef.current;

      if (currentParticles.length < required) {
        const diff = required - currentParticles.length;
        for (let i = 0; i < diff; i++) {
          currentParticles.push(new Particle(coords[i].x, coords[i].y));
        }
      } else if (currentParticles.length > required) {
        currentParticles.splice(required);
      }

      // Re-assign targets (baseX, baseY)
      // Shuffle coords for cooler effect? 
      // Yes, otherwise they just move linearly which looks stiff.
      // Actually shuffling might be chaos. Let's try direct first.

      // We need to map particle i to coord i
      for (let i = 0; i < required; i++) {
        currentParticles[i].baseX = coords[i].x;
        currentParticles[i].baseY = coords[i].y;
        // Also re-randomize colors slightly on change? Maybe.
      }

      particlesRef.current = currentParticles;
    };

    const animate = () => {
      // 1. Check time
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false }); // HH:MM:SS

      if (timeStr !== lastTimeStr) {
        lastTimeStr = timeStr;
        initParticles(timeStr);
      }

      // 2. Clear
      // Use semi-transparent fill for trails?
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear with fade

      // 3. Update & Draw
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      // Connect particles with lines if close? (Too expensive for high count)
      // Let's stick to dots first.

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [dimensions]); // Re-run if dimensions change

  // Mouse Handlers
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = null;
    mouseRef.current.y = null;
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative" style={{ minHeight: '600px' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block"
        style={{ width: '100%', height: '100%', cursor: 'none' }}
      />

      {/* Overlay Instructions or decorative elements */}
      <div className="absolute top-4 left-4 text-white/30 text-xs font-mono select-none pointer-events-none">
        <div>PARTICLE CLOCK // SYSTEM: ACTIVE</div>
        <div>INTERACTION: MOUSE HOVER</div>
      </div>
    </div>
  );
};

export default Completion21;
