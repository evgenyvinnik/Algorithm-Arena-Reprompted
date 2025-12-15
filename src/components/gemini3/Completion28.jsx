import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Simulation Constants & Config ---
const CONFIG = {
  ROWS: 20,
  COLS_LEFT: 3,
  COLS_RIGHT: 3,
  AISLE_COL: 3, // 0,1,2 (Left) | 3 (Aisle) | 4,5,6 (Right)
  WALK_TICKS: 1, // Ticks per step
  STOW_TICKS_MIN: 10,
  STOW_TICKS_MAX: 30,
  SEAT_DELAY: 5, // Delay for sitting down
  INTERFERENCE_DELAY: 15, // Delay if someone is in the way in the row
};

const SEAT_LETTERS = ['A', 'B', 'C', '', 'D', 'E', 'F'];

// --- Helper Functions ---

// Generate passengers based on strategy
const generatePassengers = (strategy) => {
  const passengers = [];
  let id = 1;

  // Create full seating manifest
  for (let r = 0; r < CONFIG.ROWS; r++) {
    for (let c = 0; c < CONFIG.COLS_LEFT + CONFIG.COLS_RIGHT + 1; c++) {
      if (c === CONFIG.AISLE_COL) continue;
      passengers.push({
        id: id++,
        targetRow: r,
        targetCol: c,
        state: 'QUEUED', // QUEUED, WALKING, STOWING, SEATING, SEATED
        x: CONFIG.AISLE_COL, // Start at aisle, outside
        y: -1, // Start outside
        progress: 0, // for smooth animations if needed
        stowTime: Math.floor(Math.random() * (CONFIG.STOW_TICKS_MAX - CONFIG.STOW_TICKS_MIN) + CONFIG.STOW_TICKS_MIN),
        waitTimer: 0,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        group: null // For strategies that group people
      });
    }
  }

  // Apply Sorting Strategies
  switch (strategy) {
    case 'random':
      passengers.sort(() => Math.random() - 0.5);
      break;
    case 'backToFront':
      // Sort by Row Descending
      passengers.sort((a, b) => b.targetRow - a.targetRow);
      break;
    case 'frontToBack':
      // Sort by Row Ascending
      passengers.sort((a, b) => a.targetRow - b.targetRow);
      break;
    case 'windowToAisle':
      // Sort by distance from aisle (Window first)
      // Dist from aisle: |c - 3|. Window=3, Middle=2, Aisle=1
      passengers.sort((a, b) => {
        const distA = Math.abs(a.targetCol - CONFIG.AISLE_COL);
        const distB = Math.abs(b.targetCol - CONFIG.AISLE_COL);
        return distB - distA; // Descending distance
      });
      break;
    case 'steffen':
      // Steffen Method (Perfect Interleaving)
      // 1. Back to Front
      // 2. Window first, then Middle, then Aisle
      // 3. Skip rows (interleave) - e.g., Right Window Row 20, Left Window Row 20, Right Window Row 18...

      // We can implement a simplified Steffen:
      // Separate into 4 groups: Window Odd, Window Even, Middle Odd, Middle Even, Aisle Odd, Aisle Even ?
      // Steffen's optimal is:
      // Order: 
      // 1. Window seats, Back to Front, Skipping every other row (e.g. 20, 18, 16...) (Right side)
      // 2. Window seats, Back to Front, Skipping every other row (e.g. 20, 18, 16...) (Left side) -> Interleaved actually better

      // Let's implement explicit Steffen ordering function for simplicity
      // It sorts by: 
      // class: Window(0), Middle(1), Aisle(2)
      // side: Left(0), Right(1) -> actually interleaved is better
      // row parity: Even(0), Odd(1) -> spacing

      // Actually simple Steffen (perfect):
      // W-Right-Even, W-Left-Even, W-Right-Odd, W-Left-Odd
      // M-Right-Even, M-Left-Even ...

      // Let's assign a score and sort.
      passengers.sort((a, b) => getSteffenScore(a) - getSteffenScore(b));
      break;
    default:
      break;
  }

  // Assign queue order
  passengers.forEach((p, i) => p.queueIndex = i);
  return passengers;
};

const getSteffenScore = (p) => {
  // Sort key logic for Steffen:
  // 1. Seat Type: Window (0), Middle (1), Aisle (2)
  // 2. Row Section: Back (0) -> Front (actually Steffen does back to front order within the sets)
  // 3. Spacing: We need to interleave rows.

  // Let's just implement the specific groups defined in Steffen method:
  // Blocks:
  // 1. Window seats (col 0, 6). Back to front. Evens then Odds (or vice versa).

  const isWindow = p.targetCol === 0 || p.targetCol === 6;
  const isMiddle = p.targetCol === 1 || p.targetCol === 5;
  const isAisleSeat = p.targetCol === 2 || p.targetCol === 4;

  const seatTypeScore = isWindow ? 0 : isMiddle ? 1000 : 2000;

  const rowParity = p.targetRow % 2; // 0 or 1
  const side = p.targetCol > 3 ? 1 : 0; // 0 Left, 1 Right

  // Steffen Interleaving:
  // Standard Steffen:
  // Wave 1: Window seats, Odd Rows, Right Side (Back to Front)
  // Wave 2: Window seats, Odd Rows, Left Side
  // Wave 3: Window seats, Even Rows, Right Side
  // Wave 4: Window seats, Even Rows, Left Side
  // ... repeat for Middle, then Aisle.

  // Actually, standard Steffen is: Windows Back-to-Front (Evens), Windows Back-to-Front (Odds)...
  // Let's try: Window(0) -> Spacing Parity -> Side -> Row(desc)

  // Wave priority
  let wave = 0;
  if (isWindow) wave = 0;
  else if (isMiddle) wave = 1;
  else wave = 2;

  let parity = p.targetRow % 2; // 0 or 1
  let sideScore = (p.targetCol > 3) ? 0 : 1; // Right side first usually in papers, or arbitrary.

  // Score = Wave * 10000 + Parity * 1000 + Side * 500 + (ROWS - row)
  // Note: Spacing ensures no one sits directly next to another in previous wave immediately?

  return (wave * 10000) + (parity * 2000) + (side * 1000) + (CONFIG.ROWS - p.targetRow);
};


// --- Component ---

export default function Completion28() {
  const [passengers, setPassengers] = useState([]);
  const [ticks, setTicks] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [strategy, setStrategy] = useState('random');
  const [simSpeed, setSimSpeed] = useState(50); // ms per tick
  const canvasRef = useRef(null);

  // State required for the simulation loop reference to avoid closure staleness
  const simulationState = useRef({
    passengers: [],
    grid: {}, // Map "x,y" -> passengerId
    seatedCount: 0,
    finished: false
  });

  const requestRef = useRef();

  // Initialize
  const resetSimulation = useCallback(() => {
    const newPassengers = generatePassengers(strategy);
    simulationState.current = {
      passengers: newPassengers,
      grid: {},
      seatedCount: 0,
      finished: false
    };
    setPassengers(newPassengers); // For UI initially
    setTicks(0);
    setIsRunning(false);
  }, [strategy]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  // Simulation Tick Logic
  const tick = useCallback(() => {
    const state = simulationState.current;
    if (state.finished) return;

    let anyoneMoved = false;
    let newGrid = {}; // Rebuild grid every tick for simplicity or update it. 
    // Rebuilding might be safer to avoid artifacts.
    // However, to process movement correctly (conflict resolution), we need current positions.

    // 1. Build occupancy map of CURRENT positions
    // We treat the grid as (row, col). Aisle is col=3.
    const currentOccupancy = new Map();
    state.passengers.forEach(p => {
      if (p.state !== 'QUEUED' && p.state !== 'SEATED') {
        currentOccupancy.set(`${p.y},${p.x}`, p.id);
      }
      // Seated passengers block their SEAT, but we don't need to check collision for walking in aisle against seated people (unless moving INTO seat)
      if (p.state === 'SEATED') {
        currentOccupancy.set(`${p.y},${p.x}`, p.id);
      }
    });

    // 2. Process logic for each passenger
    // Sort by y (row) descending (closest to front processed FIRST? No, closest to front is y=0. 
    // Actually, those closer to destination or front of queue should move first?
    // Physical simulation: usually iterating front-to-back prevents teleporting through people?
    // If I process row 0, they move to 1. Then row 1 moves to 2... this allows bunched movement.
    // If I process back-to-front (row 20 down to 0), if 20 moves to 21, then 19 moves to 20...

    // Let's iterate logic based on their active state. Queue order doesn't matter once on plane.
    // We want to avoid conflicts.
    // Simplest: Calculate DESIRED moves, check conflicts, apply valid ones.

    const nextPassengers = state.passengers.map(p => ({ ...p }));
    const nextOccupancy = new Map(currentOccupancy); // Copy for checking next steps? No, we need to know if someone moved OUT.

    // We can't do simultaneous updates easily without conflict issues.
    // Sequential update: Iterate from advanced passengers (closest to target) to new ones.
    // Those further down the aisle (larger y) should move first so space opens up behind them.
    // So sort by Y descending.

    const activeIndices = nextPassengers
      .map((p, i) => i)
      .filter(i => nextPassengers[i].state !== 'SEATED');

    // Sort indices by Y descending (furthest down aisle first)
    activeIndices.sort((a, b) => nextPassengers[b].y - nextPassengers[a].y);

    let enteredPlaneThisTick = false;

    for (const idx of activeIndices) {
      const p = nextPassengers[idx];

      // -- STATE MACHINE --

      if (p.state === 'QUEUED') {
        // Can only enter if entrance (0, AISLE) is empty.
        // Actually entrance is -1 -> 0.
        // Let's say y=0, x=3 is first step.
        const entranceKey = `0,${CONFIG.AISLE_COL}`;

        // Only one person enters per tick max? Or if space.
        // Also respect queue order?
        // We only process specific p. If p is not next in queue, wait?
        // Ideally only the top of the queue tries to enter.
        const isNextInQueue = state.passengers.every(other => other.state !== 'QUEUED' || other.queueIndex >= p.queueIndex);

        if (isNextInQueue && !currentOccupancy.has(entranceKey) && !enteredPlaneThisTick) {
          // Enter plane
          p.state = 'WALKING';
          p.x = CONFIG.AISLE_COL;
          p.y = 0;
          currentOccupancy.set(entranceKey, p.id);
          enteredPlaneThisTick = true;
          anyoneMoved = true;
        }
      }
      else if (p.state === 'WALKING') {
        // Move towards target row
        if (p.y < p.targetRow) {
          const nextY = p.y + 1;
          const nextKey = `${nextY},${p.x}`;
          if (!currentOccupancy.has(nextKey)) {
            // Move forward
            currentOccupancy.delete(`${p.y},${p.x}`);
            currentOccupancy.set(nextKey, p.id);
            p.y = nextY;
            anyoneMoved = true;
          }
        } else {
          // Arived at row
          p.state = 'STOWING';
          p.waitTimer = p.stowTime;
        }
      }
      else if (p.state === 'STOWING') {
        if (p.waitTimer > 0) {
          p.waitTimer--;
          anyoneMoved = true; // Still active
        } else {
          // Done stowing, try to sit
          p.state = 'SEATING';
        }
      }
      else if (p.state === 'SEATING') {
        // Move from Aisle to Seat.
        // Need to check if path to seat is blocked by SEATED passengers?
        // Seat shuffling logic:
        // Path: from (row, 3) to (row, targetCol).
        // Check cells between.

        // Simple movement: Move 1 cell towards col per tick?
        // Or specific penalty logic?

        // Let's do step-by-step sidestep
        const dir = Math.sign(p.targetCol - p.x);
        if (dir === 0) {
          // At seat
          p.state = 'SEATED';
          state.seatedCount++;
        } else {
          const nextX = p.x + dir;
          const nextKey = `${p.y},${nextX}`;

          // Seat Interference Logic:
          // If someone is in the way (SEATED or SEATING), we add penalty delay.
          // Simplified: If blocked, swap places? No, real life they get up.
          // "Getting up" takes time.

          // Check if blocked
          const blockerId = currentOccupancy.get(nextKey);
          if (blockerId) {
            // Determine penalty.
            // If blocker is SEATED, add penalty to `p.waitTimer` (simulating them getting up)
            // And we don't move.
            // We only pay penalty ONCE per blocker encounter?
            // Or we assume they get up, allowing us to pass, but it takes time.

            // Let's say if blocked, we wait X ticks, then move (swapping visually or just clipping through after delay).
            if (p.waitTimer <= 0) {
              p.waitTimer = CONFIG.INTERFERENCE_DELAY; // Penalty
            } else {
              p.waitTimer--;
              if (p.waitTimer <= 0) {
                // Move implies blocker moved aside. 
                // In our simple grid, we might just clip through after waiting.
                currentOccupancy.delete(`${p.y},${p.x}`);
                // We don't overwrite the blocker in map because they are still there?
                // Actually if we clip through, we temporarily share space?
                // Let's just allow move if penalty paid.
                p.x = nextX;
                // Don't update occupancy at nextX if it's seat (keep owner). 
                // But if it's aisle? no we are in row.
              }
            }
          } else {
            // Not blocked, move freely
            currentOccupancy.delete(`${p.y},${p.x}`);
            // Note: If seat is empty, we occupy it.
            // But wait, are we claiming the seat yet?
            if (nextX === p.targetCol) {
              // Claiming target
              // p.state will become SEATED next tick
            }
            p.x = nextX;
            currentOccupancy.set(`${p.y},${p.x}`, p.id);
            anyoneMoved = true;
          }
        }
      }
    }

    // Check completion
    const allSeated = state.seatedCount === state.passengers.length;

    state.passengers = nextPassengers;
    if (allSeated) {
      state.finished = true;
      setIsRunning(false);
    }

    setPassengers(nextPassengers);
    setTicks(prev => prev + 1);

  }, []);


  // Loop driver
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(tick, simSpeed);
    }
    return () => clearInterval(interval);
  }, [isRunning, simSpeed, tick]);


  // --- Render ---

  return (
    <div className="w-full flex flex-col items-center bg-[#1e1e23] text-white p-6 font-sans min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Airplane Loading Simulator
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8 bg-[#2b2b30] p-4 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl justify-between items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-400">Strategy:</label>
          <select
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm outline-none focus:border-emerald-500"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            disabled={isRunning || ticks > 0}
          >
            <option value="random">Random</option>
            <option value="backToFront">Back to Front</option>
            <option value="frontToBack">Front to Back</option>
            <option value="windowToAisle">Window to Aisle</option>
            <option value="steffen">Steffen Method</option>
          </select>
        </div>

        <div className="flex gap-4 items-center flex-1 justify-center">
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-2xl font-mono text-emerald-400">{ticks}</span>
            <span className="text-[10px] uppercase text-gray-500 tracking-wider">Ticks</span>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2 rounded-lg font-bold shadow-md transition-all ${isRunning ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>

          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-colors"
          >
            RESET
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">Speed:</span>
          <input
            type="range"
            min="10" max="500" step="10"
            value={510 - simSpeed}
            onChange={(e) => setSimSpeed(510 - Number(e.target.value))}
            className="w-24 accent-emerald-500"
          />
        </div>
      </div>

      {/* Visualization */}
      <div className="relative bg-white rounded-t-[4rem] rounded-b-[2rem] p-8 pb-12 shadow-2xl overflow-hidden min-h-[600px]">
        {/* Plane Interior */}
        <div className="relative bg-gray-100/50 border-4 border-gray-300 rounded-[3rem] p-4 min-w-[300px]">
          {/* Cockpit area */}
          <div className="h-16 border-b-2 border-gray-200 mb-4 flex justify-center items-end pb-2 opacity-30">
            <div className="w-16 h-8 bg-gray-300 rounded-t-full"></div>
          </div>

          {/* Grid */}
          <div
            className="grid gap-y-1 relative"
            style={{
              gridTemplateColumns: `repeat(${CONFIG.COLS_LEFT}, 24px) 30px repeat(${CONFIG.COLS_RIGHT}, 24px)`
            }}
          >
            {Array.from({ length: CONFIG.ROWS }).map((_, r) => (
              <React.Fragment key={r}>
                {/* Seats Left */}
                {[0, 1, 2].map(c => (
                  <div key={`s-${r}-${c}`} className="w-6 h-8 bg-gray-300 rounded-sm border-t-2 border-gray-400 relative">
                    {/* Armrests/details could go here */}
                  </div>
                ))}

                {/* Aisle */}
                <div className="w-[30px] h-8 relative flex items-center justify-center">
                  <span className="text-[8px] text-gray-300">{r + 1}</span>
                </div>

                {/* Seats Right */}
                {[4, 5, 6].map(c => (
                  <div key={`s-${r}-${c}`} className="w-6 h-8 bg-gray-300 rounded-sm border-t-2 border-gray-400 relative"></div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Passengers Layer */}
          <div className="absolute top-[88px] left-4 bottom-4 right-4 pointer-events-none">
            {/* 
                 Grid logic needs to map (row, col) to pixels.
                 Our grid uses gap-y-1 (4px) and h-8 (32px) -> Row height = 36px.
                 Col width = 24px. Aisle = 30px.
                 Gap between cols? In grid above there is no gap-x, so packed.
               */}
            <AnimatePresence>
              {passengers.map(p => {
                if (p.state === 'QUEUED') return null; // Or show queue outside?

                // Calc position
                let left = 0;
                if (p.x < 3) left = p.x * 24;
                else if (p.x === 3) left = 3 * 24 + (30 - 24) / 2; // Center in aisle
                else left = 3 * 24 + 30 + (p.x - 4) * 24;

                const top = p.y * (32 + 4); // row * (h + gap)

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: left,
                      y: top,
                      transition: { duration: simSpeed * 0.001, ease: "linear" }
                    }}
                    className="absolute w-5 h-5 rounded-full shadow-sm flex items-center justify-center z-10 border border-black/10"
                    style={{
                      backgroundColor: p.color,
                      // Higher z-index for walking people?
                      zIndex: p.state === 'SEATED' ? 1 : 10
                    }}
                  >
                    {/* Status Indicator */}
                    {p.state === 'STOWING' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-full h-full border-2 border-white border-t-transparent rounded-full opacity-50"
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-gray-500 text-xs">
        Passengers: {passengers.length} | Rows: {CONFIG.ROWS}
      </div>
    </div>
  );
}
