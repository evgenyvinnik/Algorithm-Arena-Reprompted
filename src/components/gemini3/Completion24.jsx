import React, { useRef, useEffect, useState } from 'react';

const Completion24 = () => {
  const canvasRef = useRef(null);

  // Prevent default scroll behavior for arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown, false);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // --- Configuration ---
    const STEP_WIDTH = 60;
    const STEP_HEIGHT = 40;
    const LEG_LENGTH_THIGH = 50;
    const LEG_LENGTH_CALF = 50;
    // Initial position relative to start
    const INITIAL_X = 200;

    // --- State ---
    let cameraX = 0;
    let cameraY = 0;

    // Input state
    const keys = {
      ArrowRight: false,
      ArrowLeft: false,
    };

    // Vector Helper
    const dist = (v1, v2) => Math.hypot(v2.x - v1.x, v2.y - v1.y);

    // --- Physics/Game State ---
    const character = {
      x: 0, // World x
      y: 0, // World y (vertical position of hips)
      vx: 0,
      vy: 0,
      speed: 4, // Slightly faster
      // Leg states
      legs: [
        { name: 'left', activeX: 0, activeY: 0, lastLandedX: null, lastLandedY: null, phase: 0 },
        { name: 'right', activeX: 0, activeY: 0, lastLandedX: null, lastLandedY: null, phase: 0.5 },
      ],
      strideLength: 110,
    };

    // Initialize character 
    character.x = 0;
    character.y = - (LEG_LENGTH_THIGH + LEG_LENGTH_CALF - 5);

    // Step logic: Get step surface Y at given world X
    const getStepY = (worldX) => {
      // 0,0 is the corner of the first step. Steps go UP and RIGHT.
      // Index = floor(worldX / width)
      const stepIndex = Math.floor(worldX / STEP_WIDTH);
      return -stepIndex * STEP_HEIGHT;
    };

    const getStepX = (stepIndex) => {
      return stepIndex * STEP_WIDTH;
    }

    // Inverse Kinematics: 2-bone system
    const solveIK = (hipX, hipY, ankleX, ankleY, L1, L2, flipKnee) => {
      const D = dist({ x: hipX, y: hipY }, { x: ankleX, y: ankleY });

      // Unreachable? Fully extend
      if (D > L1 + L2) {
        // Return end of extended leg for visual debugging
        const angle = Math.atan2(ankleY - hipY, ankleX - hipX);
        return {
          x: hipX + L1 * Math.cos(angle),
          y: hipY + L1 * Math.sin(angle)
        };
      }

      // Law of Cosines
      const cosTheta = (L1 ** 2 + D ** 2 - L2 ** 2) / (2 * L1 * D);
      // Clamp to avoiding floating point errors
      const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));

      const baseAngle = Math.atan2(ankleY - hipY, ankleX - hipX);
      const kneeAngle = baseAngle + (flipKnee ? theta : -theta);

      return {
        x: hipX + L1 * Math.cos(kneeAngle),
        y: hipY + L1 * Math.sin(kneeAngle)
      };
    };

    // --- Update Loop ---
    const update = () => {
      // 1. Movement Logic
      if (keys.ArrowRight) {
        character.vx = character.speed;
      } else if (keys.ArrowLeft) {
        // Optional backward movement
        character.vx = -character.speed;
      } else {
        character.vx = 0;
      }

      character.x += character.vx;

      // Body height Management:
      // Average slope height at current X
      const slopeY = -(character.x / STEP_WIDTH) * STEP_HEIGHT;
      // Target body height relative to the ground under feet
      const targetBodyY = slopeY - 90; // Hip height

      // Smooth damp
      character.y += (targetBodyY - character.y) * 0.1;


      // 2. Leg Animation Logic
      character.legs.forEach(leg => {
        // Phase calculation based on distance traveled
        // We use absolute distance to drive the cycle forward or backward
        const cycle = (character.x / character.strideLength) + leg.phase;
        // Normalize 0-1
        let cycleLocal = cycle % 1;
        if (cycleLocal < 0) cycleLocal += 1;

        // 0.0 - 0.5: Stance
        // 0.5 - 1.0: Swing

        // Determine Current Step Index for Stance
        // Ideally we snap to the nearest step center

        if (cycleLocal < 0.5) {
          // STANCE PHASE
          // If we don't have a landed position, find one
          if (leg.lastLandedX === null) {
            const currentStepIdx = Math.floor((character.x + (leg.name === 'right' ? 30 : -30)) / STEP_WIDTH);
            leg.lastLandedX = getStepX(currentStepIdx) + 20;
            leg.lastLandedY = getStepY(leg.lastLandedX);
          }

          leg.activeX = leg.lastLandedX;
          leg.activeY = leg.lastLandedY;

        } else {
          // SWING PHASE
          // Reset landed position so we find a new one next stance
          leg.lastLandedX = null;
          leg.lastLandedY = null;

          // Calculate Target for this swing
          // Forward prediction: Where will we be at end of swing?
          // End of swing is when cycleLocal loops back to 0 (or 1)
          // Roughly 0.5 cycle units away = 0.5 * strideLength
          const direction = character.vx >= 0 ? 1 : -1;
          const lookAhead = character.strideLength * 0.6 * direction;

          const predictedX = character.x + lookAhead;
          const targetStepIdx = Math.floor(predictedX / STEP_WIDTH);

          // Fixed target for the duration of the swing would be better to avoid jitter, 
          // but continuous update is smoother for variable speed.

          const targetX = getStepX(targetStepIdx) + (direction > 0 ? 20 : 40);
          const targetY = getStepY(targetX);

          // Render Current Position in Swing
          // Map 0.5->1.0 to 0.0->1.0
          const swingProgress = (cycleLocal - 0.5) * 2;

          // We need a stable "Start" point for the swing. 
          // In a stateless system driven by X, this is hard without memory.
          // Approximation: Start was 'Stride Length' behind Target?

          const startX = targetX - (character.strideLength * direction);
          const startY = getStepY(startX);

          // Interpolate
          const currentX = startX + (targetX - startX) * swingProgress;

          // Lift
          const baseLinearY = startY + (targetY - startY) * swingProgress;
          const liftHeight = 50;
          const arc = Math.sin(swingProgress * Math.PI);

          leg.activeX = currentX;
          leg.activeY = baseLinearY - (liftHeight * arc);
        }
      });


      // Camera Follow
      const targetCamX = character.x - 200;
      const targetCamY = character.y - 300;
      cameraX += (targetCamX - cameraX) * 0.1;
      cameraY += (targetCamY - cameraY) * 0.1;
    };

    // --- Draw Loop ---
    const draw = () => {
      // Clear
      ctx.fillStyle = '#111'; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera
      ctx.translate(-cameraX, -cameraY);

      // 1. Draw Stairs
      const startStep = Math.floor((cameraX - 100) / STEP_WIDTH);
      const endStep = startStep + 20;

      for (let i = startStep; i <= endStep; i++) {
        const sx = i * STEP_WIDTH;
        const sy = -i * STEP_HEIGHT;

        // Draw Step Body
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(sx, sy, STEP_WIDTH + 1, STEP_HEIGHT + 1); // +1 to fix gaps

        // Draw Top Highlight (Carpet/Pad)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(sx + 5, sy, STEP_WIDTH - 10, 5);

        // Debug index
        // ctx.fillStyle = '#555';
        // ctx.fillText(i, sx + 20, sy + 25);
      }

      // 2. Draw Character
      // Draw Legs first (so body is on top)
      character.legs.forEach(leg => {
        const knee = solveIK(
          character.x, character.y,
          leg.activeX, leg.activeY,
          LEG_LENGTH_THIGH, LEG_LENGTH_CALF,
          true
        );

        if (knee) {
          // Thigh
          ctx.strokeStyle = leg.name === 'left' ? '#7f8c8d' : '#ecf0f1'; // Back leg darker
          ctx.lineWidth = 12;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(character.x, character.y);
          ctx.lineTo(knee.x, knee.y);
          ctx.stroke();

          // Calf
          ctx.beginPath();
          ctx.lineTo(knee.x, knee.y);
          ctx.lineTo(leg.activeX, leg.activeY);
          ctx.stroke();

          // Shoe
          ctx.fillStyle = '#e67e22';
          ctx.beginPath();
          ctx.ellipse(leg.activeX + 5, leg.activeY, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Body (Torso)
      ctx.fillStyle = '#3498db';
      ctx.beginPath();
      // Slightly tilted body
      ctx.ellipse(character.x, character.y - 15, 20, 35, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(character.x + 5, character.y - 60, 15, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(character.x + 10, character.y - 60, 3, 0, Math.PI * 2);
      ctx.fill();


      ctx.restore();

      // UI Overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px sans-serif';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText('Hold Arrow Right to Climb', 20, 40);

      ctx.font = '14px monospace';
      ctx.fillText(`Steps: ${Math.floor(character.x / STEP_WIDTH)}`, 20, 70);

    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    // Events
    const handleKeyDownInternal = (e) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    };
    const handleKeyUpInternal = (e) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDownInternal);
    window.addEventListener('keyup', handleKeyUpInternal);

    // Start
    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDownInternal);
      window.removeEventListener('keyup', handleKeyUpInternal);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
      />
    </div>
  );
};

export default Completion24;
