import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Music, Maximize2 } from 'lucide-react';

export default function Completion22() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showUI, setShowUI] = useState(true);

  // Animation state refs to avoid re-renders
  const stateRef = useRef({
    time: 0,
    beat: 0,
    bpm: 128,
    energy: 0, // 0 to 1, derived from beat
    camera: { x: 0, y: 5, z: -20 },
    particles: [],
    lasers: [],
    colorCycle: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize particles
    for (let i = 0; i < 200; i++) {
      stateRef.current.particles.push({
        x: (Math.random() - 0.5) * 200,
        y: Math.random() * 50,
        z: Math.random() * 200 + 10,
        visible: true // Used for flashing effect
      });
    }

    // Initialize lasers
    for (let i = 0; i < 8; i++) {
      stateRef.current.lasers.push({
        angle: (i / 8) * Math.PI * 2,
        active: false,
        targetAngle: (i / 8) * Math.PI * 2
      });
    }

    let animationFrameId;

    const render = (timestamp) => {
      const state = stateRef.current;

      // Update dimensions
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Time and Beat Simulation
      if (isPlaying) {
        state.time += 0.016; // approx 60fps
        state.colorCycle += 0.5;

        // Simulate a beat
        const bps = state.bpm / 60;
        const beatDuration = 1 / bps;
        const rawBeat = (state.time % beatDuration) / beatDuration; // 0 to 1 sawtooth

        // Pulse energy on the beat
        if (rawBeat < 0.1) {
          state.energy = 1.0;
        } else {
          state.energy *= 0.9; // decay
        }

        state.beat = rawBeat;
      }

      // Clear Screen with trail effect
      ctx.fillStyle = `rgba(10, 5, 20, 0.4)`;
      ctx.fillRect(0, 0, width, height);

      // Project 3D point to 2D
      const project = (x, y, z) => {
        const fov = 300;
        // Camera shake
        const shake = state.energy * 0.5;
        const camX = state.camera.x + (Math.random() - 0.5) * shake;
        const camY = state.camera.y + (Math.random() - 0.5) * shake;

        const px = x - camX;
        const py = y - camY;
        const pz = z - state.camera.z;

        if (pz <= 0) return null;

        const scale = fov / pz;
        return {
          x: cx + px * scale,
          y: cy + py * scale,
          scale: scale
        };
      };

      // Draw Grid (Retro/Synthwave style)
      ctx.lineWidth = 2;
      const gridSpeed = (state.time * 20) % 20;
      const gridColor = `hsl(${state.colorCycle}, 70%, 50%)`;
      ctx.strokeStyle = gridColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = gridColor;

      ctx.beginPath();
      // Vertical lines
      for (let x = -100; x <= 100; x += 20) {
        const p1 = project(x, 0, 10);
        const p2 = project(x, 0, 200);
        if (p1 && p2) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      // Horizontal lines (moving)
      for (let z = 10; z <= 200; z += 20) {
        const effectiveZ = z - gridSpeed;
        if (effectiveZ < 10) continue;

        const p1 = project(-100, 0, effectiveZ);
        const p2 = project(100, 0, effectiveZ);
        if (p1 && p2) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset for performance

      // Draw Particles
      state.particles.forEach(p => {
        p.z -= 0.5 + (state.energy * 2); // Move faster on beat
        if (p.z < 10) p.z = 210;

        const pos = project(p.x, p.y, p.z);
        if (pos) {
          const particleSize = 2 * pos.scale * (0.5 + state.energy); // Pulse size
          ctx.fillStyle = 'white';
          ctx.globalAlpha = p.z > 150 ? 1 - (p.z - 150) / 50 : 1; // Fade in distance
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // Draw Lasers
      state.lasers.forEach((laser, i) => {
        // Rotate lasers
        laser.angle += 0.01 + (state.energy * 0.02);

        const length = 100;
        const lx = Math.cos(laser.angle) * length;
        const ly = Math.sin(laser.angle) * length; // height
        const lz = 100; // depth target

        // Origin at top center of "stage" in distance
        const origin = project(0, 30, 200);
        const target = project(lx * 2, 0, 50); // Aim at floor

        if (origin && target) {
          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.moveTo(origin.x, origin.y);
          ctx.lineTo(target.x, target.y);

          const laserColor = `hsl(${(state.colorCycle + i * 45) % 360}, 100%, 70%)`;
          ctx.strokeStyle = laserColor;
          ctx.lineWidth = 5 * state.energy + 1;
          ctx.shadowColor = laserColor;
          ctx.shadowBlur = 20 * state.energy;

          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalCompositeOperation = 'source-over';
        }
      });

      // Draw "Sun" / Background Glow
      const sunPos = project(0, 40, 300);
      if (sunPos) {
        const gradient = ctx.createRadialGradient(sunPos.x, sunPos.y, 10, sunPos.x, sunPos.y, 200);
        gradient.addColorStop(0, `hsl(${state.colorCycle + 180}, 100%, 80%)`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Overlay UI */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 
          bg-black/50 backdrop-blur-md rounded-full px-6 py-4 flex items-center gap-6
          border border-white/10 transition-opacity duration-300
          ${showUI ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
        onMouseEnter={() => setShowUI(true)}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
        >
          {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
        </button>

        <div className="flex flex-col items-center">
          <div className="text-xs text-white/50 mb-1">VISUALIZER</div>
          <div className="flex gap-1 h-8 items-end">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t-sm animate-pulse"
                style={{
                  height: `${Math.max(20, Math.random() * 100)}%`,
                  animationDuration: `${0.2 + i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        <button
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          onClick={() => {
            // Reset camera
            stateRef.current.camera = { x: 0, y: 5, z: -20 };
            stateRef.current.colorCycle = Math.random() * 360;
          }}
        >
          <Music className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="absolute top-4 right-4 text-white/30 text-xs font-mono">
        CONCERT FX // WEEKLY CHALLENGE 22
      </div>
    </div>
  );
}
