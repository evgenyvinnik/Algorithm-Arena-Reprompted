import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Trophy, Zap, RefreshCw, Play, Volume2, VolumeX } from 'lucide-react';

const BaseballReflex = () => {
  const [gameState, setGameState] = useState('MENU'); // MENU, WAITING, PITCHING, RESULT, GAMEOVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pitchSpeed, setPitchSpeed] = useState(2000); // ms for ball to travel (starts slow)
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ pitches: 0, hits: 0, homeRuns: 0, strikes: 0 });
  const [muted, setMuted] = useState(false);

  // Refs for timing and state access in timeouts
  const pitchStartTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const handleSwingRef = useRef(null); // Will hold the latest function

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Constants
  const SWEET_SPOT_WINDOW = 150; // ms window for a HIT (+/- 75ms)
  const PERFECT_WINDOW = 50; // ms window for HOME RUN (+/- 25ms)
  const BASE_PITCH_SPEED = 1000;
  const MIN_PITCH_SPEED = 400; // Fastest it gets

  const startGame = () => {
    setGameState('WAITING');
    setScore(0);
    setStats({ pitches: 0, hits: 0, homeRuns: 0, strikes: 0 });
    setPitchSpeed(1000);
    setFeedback({ text: 'Get Ready...', type: 'info' });
    schedulePitch();
  };

  const schedulePitch = () => {
    const randomDelay = Math.random() * 2000 + 1000; // 1-3s delay

    timeoutRef.current = setTimeout(() => {
      startPitch();
    }, randomDelay);
  };

  const startPitch = () => {
    setGameState('PITCHING');
    pitchStartTimeRef.current = performance.now();
    setFeedback({ text: '', type: '' });

    // Schedule the "miss" if user doesn't swing
    // Use ref to call the latest version of handleSwing
    timeoutRef.current = setTimeout(() => {
      if (handleSwingRef.current) handleSwingRef.current('MISS_TIMEOUT');
    }, pitchSpeed + 500);
  };

  const handleSwing = useCallback((triggerType = 'USER') => {
    const currentGameState = gameStateRef.current; // Use ref for current state check

    // Safety check: only swing if waiting or pitching
    if (currentGameState !== 'PITCHING' && currentGameState !== 'WAITING') return;

    // Clear the miss timeout immediately
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (currentGameState === 'WAITING') {
      // Swung before pitch
      const penaltyText = 'TOO EARLY!';
      setFeedback({ text: penaltyText, type: 'bad' });
      setStats(s => ({ ...s, strikes: s.strikes + 1 }));
      endPitchRound('STRIKE');
      return;
    }

    if (triggerType === 'MISS_TIMEOUT') {
      const missText = 'STRIKE! Too Late';
      setFeedback({ text: missText, type: 'bad' });
      setStats(s => ({ ...s, strikes: s.strikes + 1 }));
      endPitchRound('STRIKE');
      return;
    }

    // Calculate timing
    const swingTime = performance.now();
    const flightTime = swingTime - pitchStartTimeRef.current;

    // Calculate timing relative to arrival at plate (pitchSpeed)
    const difference = flightTime - pitchSpeed;
    const absDiff = Math.abs(difference);

    let result = '';
    let resultText = '';
    let resultType = '';

    if (absDiff <= PERFECT_WINDOW) {
      result = 'HOMERUN';
      resultText = 'HOME RUN!!';
      resultType = 'perfect';
      setScore(s => s + 100);
      setStats(s => ({ ...s, hits: s.hits + 1, homeRuns: s.homeRuns + 1 }));
    } else if (absDiff <= SWEET_SPOT_WINDOW) {
      result = 'HIT';
      const points = 50 - Math.floor((absDiff / SWEET_SPOT_WINDOW) * 25);
      resultText = difference < 0 ? 'Early Hit!' : 'Late Hit!';
      resultType = 'good';
      setScore(s => s + points);
      setStats(s => ({ ...s, hits: s.hits + 1 }));
    } else {
      result = 'STRIKE';
      resultText = difference < 0 ? 'SWING & MISS (Early)' : 'STRIKE (Late)';
      resultType = 'bad';
      setStats(s => ({ ...s, strikes: s.strikes + 1 }));
    }

    setFeedback({ text: resultText, type: resultType });
    endPitchRound(result);
  }, [pitchSpeed]); // dependent on pitchSpeed

  // Update logic ref
  useEffect(() => {
    handleSwingRef.current = handleSwing;
  }, [handleSwing]);

  const endPitchRound = (result) => {
    setGameState('RESULT');

    // Update speed for next round if hit
    if (result === 'HIT' || result === 'HOMERUN') {
      setPitchSpeed(prev => Math.max(MIN_PITCH_SPEED, prev * 0.95));
    }

    // Game over logic will catch the stats update in effect
  };

  // Improved Stats/Game Over handling
  useEffect(() => {
    if (stats.strikes >= 3 && gameState !== 'GAMEOVER' && gameState !== 'MENU') {
      // Wait a moment to show the 3rd strike message
      const timer = setTimeout(() => {
        setGameState('GAMEOVER');
        setHighScore(prev => Math.max(prev, score));
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameState === 'RESULT') {
      // Prepare next round if not game over
      const timer = setTimeout(() => {
        if (stats.strikes < 3) {
          setGameState('WAITING');
          schedulePitch();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stats.strikes, gameState, score]);


  // Clean up
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        // Prevent scroll
        e.preventDefault();
        if (gameState === 'WAITING' || gameState === 'PITCHING') {
          // We use the Ref to call, just to be consistent, but direct call works too if deps are correct
          if (handleSwingRef.current) handleSwingRef.current('USER');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Visual Styling Helpers
  // ... (keeping component styling inline mostly)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans overflow-hidden select-none">

      {/* Header / HUD */}
      <div className="absolute top-4 w-full max-w-4xl flex justify-between px-6 z-10">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Score</p>
            <p className="text-2xl font-bold font-mono text-yellow-400">{score.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-left">
            <p className="text-xs text-gray-400 uppercase tracking-wider">High Score</p>
            <p className="text-xl font-bold font-mono text-white/80">{Math.max(score, highScore).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-red-500 transition-all duration-300 ${i < stats.strikes ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110' : 'bg-transparent scale-100'}`} />
            ))}
            <span className="ml-2 text-sm font-bold text-red-400 self-center">OUTS</span>
          </div>
          <button onClick={() => setMuted(!muted)} className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Game View */}
      <div
        className="relative w-full max-w-5xl aspect-video bg-gradient-to-b from-sky-900 via-sky-800 to-green-900 rounded-2xl shadow-2xl overflow-hidden cursor-pointer group hover:shadow-sky-900/20 transition-all border-4 border-gray-800 ring-1 ring-white/10"
        onMouseDown={() => (gameState === 'WAITING' || gameState === 'PITCHING') && handleSwingRef.current && handleSwingRef.current('USER')}
      >
        {/* Sky / Stadium Lights */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* The Field (Perspective) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#2d5a27] origin-bottom transform perspective-[1000px] rotate-x-60">
          {/* Dirt Diamond */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5c4033] rotate-45 translate-y-[300px] border-[20px] border-[#e6d0aa]/30 rounded-[40px]"></div>

          {/* Grass Stripes */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_50%,#000_50%)] bg-[length:100px_100px]"></div>
        </div>

        {/* Pitcher's Mound & Pitcher */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-32 h-8 bg-[#6b4c3a] rounded-[50%] opacity-80 shadow-lg mb-2"></div> {/* Mound */}
          <PitcherCharacter state={gameState} />
        </div>

        {/* Batter (User) - Bottom Center */}
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
          <BatterCharacter swing={gameState === 'RESULT' && feedback.type !== 'bad'} miss={gameState === 'RESULT' && feedback.type === 'bad'} />
        </div>

        {/* Start / Menu Overlay */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center z-50">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-4 italic tracking-tighter transform -rotate-2">
              BASEBALL<br />REFLEX
            </h1>
            <p className="text-gray-300 mb-8 max-w-md text-lg px-4">
              Test your reaction time. Click or press <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono border border-white/30">SPACE</kbd> exactly when the ball crosses the plate!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)] ring-4 ring-blue-500/20 active:scale-95"
            >
              <Play fill="currentColor" /> PLAY BALL
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center z-50 animate-in fade-in duration-500">
            <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-5xl font-bold text-white mb-2">GAME OVER</h2>
            <div className="flex gap-8 my-6 text-left bg-white/5 p-6 rounded-2xl border border-white/10">
              <div>
                <p className="text-gray-400 text-sm">FINAL SCORE</p>
                <p className="text-3xl font-mono font-bold text-yellow-400">{score.toLocaleString()}</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <p className="text-gray-400 text-sm">HOME RUNS</p>
                <p className="text-3xl font-mono font-bold text-white">{stats.homeRuns}</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all hover:scale-105"
            >
              <RefreshCw size={20} /> Play Again
            </button>
          </div>
        )}

        {/* Visual Feedback Text (Strike, Hit, etc) */}
        {feedback.text && gameState !== 'MENU' && gameState !== 'GAMEOVER' && (
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 whitespace-nowrap pointer-events-none origin-center
                ${feedback.type === 'perfect' ? 'scale-150' : 'scale-100'}
             `}>
            <h2 className={`
                    text-6xl font-black italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] transform -rotate-3 transition-all duration-200
                    ${feedback.type === 'perfect' ? 'text-yellow-400 animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1]' : ''}
                    ${feedback.type === 'good' ? 'text-green-400' : ''}
                    ${feedback.type === 'bad' ? 'text-red-500' : ''}
                    ${feedback.type === 'info' ? 'text-white/80 text-4xl not-italic' : ''}
                `}>
              {feedback.text}
            </h2>
          </div>
        )}

        {/* The Ball */}
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: gameState === 'PITCHING' ? '80%' : '44%', // 44% is pitcher hand height, 80% is plate
            left: '50%',
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: 'inset -2px -2px 10px rgba(0,0,0,0.2), 0 0 10px rgba(255,255,255,0.5)',
            transform: gameState === 'PITCHING' ? 'translate(-50%, -50%) scale(1.5)' : 'translate(-50%, -50%) scale(0.1)',
            opacity: gameState === 'PITCHING' || gameState === 'WAITING' ? 1 : 0,
            // Only animate during PITCHING state
            transition: gameState === 'PITCHING' ? `top ${pitchSpeed}ms cubic-bezier(0.5, 0.0, 1, 1), transform ${pitchSpeed}ms linear` : 'none',
          }}
        >
          {/* Seams */}
          <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full opacity-50 rotate-45"></div>
        </div>

        {/* Strike Zone Indicator (Subtle) */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-32 h-4 border-2 border-white/20 rounded-full transform scale-x-110"></div>
        {/* Sweet Spot Marker (Visual Aid only visible in Easy mode? Let's leave it mostly hidden) */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-4 h-1 bg-yellow-400/30 rounded-full"></div>

      </div>

      <div className="mt-6 text-gray-400 text-sm max-w-lg text-center font-mono">
        <p>Timing: Wait for the windup... Swing when the ball hits the zone.</p>
        <p className="text-xs mt-1 text-gray-600">Speed increases with every hit.</p>
      </div>
    </div>
  );
};

// --- Sub Components for Characters ---

const PitcherCharacter = ({ state }) => {
  // Determine posture based on state
  const isWinding = state === 'WAITING';
  const isThrowing = state === 'PITCHING';

  return (
    <div className={`relative transition-all duration-500 ${isWinding ? 'translate-y-1' : ''}`}>
      <svg width="60" height="100" viewBox="0 0 60 100" className="drop-shadow-lg overflow-visible">
        <g transform={`translate(30, 80)`}>
          {/* Body */}
          <rect x="-15" y="-50" width="30" height="50" rx="5" fill="#e2e8f0" />
          {/* Head */}
          <circle cx="0" cy="-65" r="12" fill="#e2e8f0" />
          {/* Cap */}
          <path d="M-12,-68 Q0,-78 12,-68 L12,-65 L-12,-65 Z" fill="#1e293b" />

          {/* Arms - Animate based on state */}
          <g className={`transition-transform duration-300 origin-top
                        ${isWinding ? 'rotate-[-20deg] translate-x-[-10px] translate-y-[5px]' : ''} 
                        ${isThrowing ? 'rotate-[45deg] translate-x-[15px]' : ''}
                    `}>
            <rect x="-20" y="-45" width="10" height="30" rx="3" fill="#e2e8f0" />
            <circle cx="-15" cy="-15" r="4" fill="#64748b" /> {/* Glove */}
          </g>
          <g className={`transition-transform origin-top duration-100 
                        ${isWinding ? 'rotate-[180deg] translate-y-[-20px]' : ''} 
                        ${isThrowing ? 'rotate-[-45deg]' : ''}
                     `}>
            <rect x="10" y="-45" width="10" height="30" rx="3" fill="#e2e8f0" />
          </g>
        </g>
      </svg>
    </div>
  );
};

const BatterCharacter = ({ swing, miss }) => {
  // Bat Swing Animation
  const batClass = swing ? 'rotate-[-110deg]' : miss ? 'rotate-[-60deg]' : 'rotate-[20deg]'; // Miss is a half swing or full?
  const swingDuration = swing || miss ? 'duration-100 ease-out' : 'duration-500 ease-in-out';

  return (
    <div className="relative">
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl overflow-visible">
        <g transform="translate(100, 150)">
          {/* Shadows */}
          <ellipse cx="0" cy="40" rx="40" ry="10" fill="black" opacity="0.3" />

          {/* Legs */}
          <line x1="-20" y1="0" x2="-25" y2="40" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
          <line x1="20" y1="0" x2="25" y2="40" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />

          {/* Body */}
          <rect x="-25" y="-50" width="50" height="60" rx="10" fill="#f1f5f9" />
          <path d="M-25,-50 L25,-50 L25,10 L-25,10 Z" fill="#3b82f6" opacity="0.8" /> {/* Jersey */}

          {/* Head */}
          <circle cx="0" cy="-70" r="18" fill="#f8fafc" />
          <path d="M-18,-75 Q0,-90 18,-75 L22,-70 L-22,-70 Z" fill="#1e40af" /> {/* Helmet */}

          {/* Bat & Arms Group */}
          <g className={`origin-bottom transition-transform ${swingDuration} ${batClass}`}>
            {/* Arms */}
            <path d="M-15,-40 L0,-10 L15,-40" stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Bat */}
            <rect x="-4" y="-100" width="8" height="80" rx="2" fill="#d97706" transform="rotate(-15) translate(0, -10)" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BaseballReflex;
