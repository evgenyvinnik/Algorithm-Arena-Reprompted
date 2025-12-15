import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Code
} from 'lucide-react';

// --- ARC Data & Logic ---

const COLORS = [
  'bg-black',       // 0
  'bg-blue-600',    // 1
  'bg-red-600',     // 2
  'bg-green-600',   // 3
  'bg-yellow-500',  // 4
  'bg-gray-500',    // 5
  'bg-fuchsia-600', // 6
  'bg-orange-500',  // 7
  'bg-cyan-400',    // 8
  'bg-rose-800'     // 9
];

// Problem 1: Gravity (Pixels fall to the bottom)
const PROBLEM_1 = {
  id: 1,
  name: "Gravity Well",
  description: "Objects fall to the lowest available position in their column.",
  difficulty: "Easy",
  train: [
    {
      input: [
        [0, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 0]
      ],
      output: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 2, 0, 1]
      ]
    },
    {
      input: [
        [1, 0, 3, 0],
        [0, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 0, 0]
      ],
      output: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 2, 3, 0]
      ]
    }
  ],
  test: {
    input: [
      [2, 0, 1, 0],
      [0, 3, 0, 0],
      [4, 0, 0, 8],
      [0, 0, 5, 0]
    ],
    // The expected output will be computed by the solver for verification, 
    // or we can hardcode it to check correctness.
    expected: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 3, 5, 8] // Actually gravity stacks them. 
      // Col 0: 2, 4 -> 2 on top of 4? Or order maintained?
      // Let's say order maintained.
      // Col 0: 2, 4 => Bottom: 4, Top: 2
    ]
  }
};

// Logic for P1: Gravity
const solveGravity = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(0));

  for (let c = 0; c < cols; c++) {
    let stack = [];
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] !== 0) {
        stack.push(grid[r][c]);
      }
    }
    // Place at bottom
    for (let i = 0; i < stack.length; i++) {
      newGrid[rows - stack.length + i][c] = stack[i];
    }
  }
  return newGrid;
};


// Problem 2: Color Swap (Specific Interaction)
// Rule: Swap colors 2 (Red) and 8 (Cyan), leave others alone.
const PROBLEM_2 = {
  id: 2,
  name: "Chromatic Inversion",
  description: "Red becomes Cyan, Cyan becomes Red. All other colors remain.",
  difficulty: "Medium",
  train: [
    {
      input: [
        [2, 0, 8],
        [0, 1, 0],
        [8, 0, 2]
      ],
      output: [
        [8, 0, 2],
        [0, 1, 0],
        [2, 0, 8]
      ]
    }
  ],
  test: {
    input: [
      [2, 2, 0, 8],
      [8, 0, 5, 2],
      [0, 8, 8, 0],
      [1, 2, 0, 3]
    ]
  }
};

const solveColorSwap = (grid) => {
  return grid.map(row => row.map(cell => {
    if (cell === 2) return 8;
    if (cell === 8) return 2;
    return cell;
  }));
};


// Problem 3: Enclosure Fill
// Rule: If 4 cells of the same color form a rectangle outline, fill it.
// Actually let's do something easier to implement robustly:
// "Draw Diagonal": If there is a dot in a corner, draw a diagonal line to the opposite corner.
// OR "Completion": Complete the square.
// Let's go with "Draw Diagonals".
// Rule: Given a start point (marked with 2) and an end point (marked with 3), draw a line of 1s between them.
// Keep it simple: "Rectangular Fill". Given two corner points of the same color, fill the rectangle.
const PROBLEM_3 = {
  id: 3,
  name: "Rectangular Manifestation",
  description: "Two matching colored pixels define opposite corners of a rectangle. Fill the rectangle with that color.",
  difficulty: "Hard",
  train: [
    {
      input: [
        [2, 0, 0],
        [0, 0, 0],
        [0, 0, 2]
      ],
      output: [
        [2, 2, 2],
        [2, 2, 2],
        [2, 2, 2]
      ]
    },
    {
      input: [
        [0, 0, 0, 0],
        [0, 3, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 3, 0]
      ],
      output: [
        [0, 0, 0, 0],
        [0, 3, 3, 0],
        [0, 3, 3, 0],
        [0, 3, 3, 0]
      ]
    }
  ],
  test: {
    input: [
      [0, 4, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 4],
      [0, 0, 0, 0, 0]
    ]
  }
};

const solveRectFill = (grid) => {
  // Find the two non-zero identical points
  const rows = grid.length;
  const cols = grid[0].length;
  const points = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) {
        points.push({ r, c, val: grid[r][c] });
      }
    }
  }

  // Clone grid
  const newGrid = grid.map(row => [...row]);

  if (points.length === 2 && points[0].val === points[1].val) {
    const p1 = points[0];
    const p2 = points[1];
    const val = p1.val;

    const startR = Math.min(p1.r, p2.r);
    const endR = Math.max(p1.r, p2.r);
    const startC = Math.min(p1.c, p2.c);
    const endC = Math.max(p1.c, p2.c);

    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        newGrid[r][c] = val;
      }
    }
  }
  return newGrid;
};

// --- Main Component ---

const Completion33 = () => {
  const [activeProblem, setActiveProblem] = useState(0);
  const [solvedState, setSolvedState] = useState(null); // null, 'solving', 'solved'
  const [testOutput, setTestOutput] = useState(null);

  // Editable State
  const [currentInput, setCurrentInput] = useState(null);
  const [selectedColor, setSelectedColor] = useState(1); // Default to Blue

  const problems = [PROBLEM_1, PROBLEM_2, PROBLEM_3];
  const solvers = [solveGravity, solveColorSwap, solveRectFill];

  const currentProblem = problems[activeProblem];

  // Initialize input when problem changes
  useEffect(() => {
    // Deep copy to avoid mutating the original definition
    const initialGrid = currentProblem.test.input.map(row => [...row]);
    setCurrentInput(initialGrid);
    setSolvedState(null);
    setTestOutput(null);
  }, [activeProblem]);

  const handleRun = () => {
    if (!currentInput) return;
    setSolvedState('solving');
    setTestOutput(null);

    // Simulate thinking time
    setTimeout(() => {
      const solver = solvers[activeProblem];
      const result = solver(currentInput);
      setTestOutput(result);
      setSolvedState('solved');
    }, 600);
  };

  const handleProblemChange = (index) => {
    setActiveProblem(index);
  };

  const handleCellClick = (r, c) => {
    if (!currentInput) return;
    // Don't allow editing if currently solving/solved (optional, but cleaner)
    if (solvedState === 'solving') return;

    const newGrid = currentInput.map(row => [...row]);
    newGrid[r][c] = selectedColor;
    setCurrentInput(newGrid);

    // Reset solution if input changes
    if (solvedState === 'solved') {
      setSolvedState(null);
      setTestOutput(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Brain className="text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ARC-AGI <span className="text-slate-500 font-light">Solver</span></h1>
            <p className="text-xs text-slate-500">Abstract Reasoning Challenge</p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500">
          CHALLENGE #33
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Problems</h2>
            <div className="space-y-2">
              {problems.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleProblemChange(idx)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 border ${activeProblem === idx
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                      : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    {activeProblem === idx && <ChevronRight size={14} />}
                  </div>
                  <div className={`mt-1 text-xs px-1.5 py-0.5 rounded-full w-fit ${p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                    }`}>
                    {p.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Palette</div>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((colorClass, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(idx)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${colorClass} ${selectedColor === idx ? 'border-white ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-slate-900' : 'border-transparent'
                    }`}
                  title={`Color ${idx}`}
                />
              ))}
            </div>
            <div className="mt-2 text-[10px] text-slate-600 text-center">
              Select a color to paint on the Input Grid
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Description Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                {currentProblem.name}
              </h2>
              <p className="text-slate-400 mt-2">{currentProblem.description}</p>
            </div>

            {/* Training Examples */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Training Examples</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {currentProblem.train.map((example, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center">
                    <div className="text-xs text-slate-500 mb-3 font-mono self-start">Example {idx + 1}</div>
                    <div className="flex items-center justify-center gap-6">
                      <GridDisplay grid={example.input} label="Input" />
                      <ArrowRight className="text-slate-600" />
                      <GridDisplay grid={example.output} label="Output" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test & Solver Section */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Test & Solve</h3>
                </div>
                {solvedState && (
                  <button
                    onClick={() => { setSolvedState(null); setTestOutput(null); }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <RefreshCw size={12} /> Reset
                  </button>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                <div className="flex flex-col items-center">

                  <div className="flex flex-col md:flex-row items-center gap-12 mb-10">
                    {/* Input */}
                    <div className="flex flex-col items-center gap-4 relative group">
                      {/* Hover Overlay hint */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Click cells to edit
                      </div>
                      <GridDisplay
                        grid={currentInput}
                        label="Test Input (Editable)"
                        size="lg"
                        onCellClick={handleCellClick}
                        editable={true}
                      />
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col items-center justify-center pt-6 md:pt-0">
                      <button
                        onClick={handleRun}
                        disabled={solvedState === 'solving'}
                        className={`group relative flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${solvedState === 'solving'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : solvedState === 'solved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 scale-100 hover:scale-105 active:scale-95'
                          }`}
                      >
                        {solvedState === 'solving' ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Thinking...
                          </>
                        ) : solvedState === 'solved' ? (
                          <>
                            <CheckCircle2 size={18} />
                            Solved!
                          </>
                        ) : (
                          <>
                            <Play size={18} fill="currentColor" />
                            Run Solver
                          </>
                        )}
                      </button>
                    </div>

                    {/* Output */}
                    <div className="flex flex-col items-center gap-4 min-w-[200px]">
                      <AnimatePresence mode="wait">
                        {testOutput ? (
                          <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ type: "spring", bounce: 0.4 }}
                          >
                            <GridDisplay grid={testOutput} label="Generated Output" size="lg" active />
                          </motion.div>
                        ) : (
                          <div
                            className="w-48 h-48 border-2 border-dashed border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-800/20 text-slate-600"
                          >
                            <span className="text-xs font-mono">Waiting for output...</span>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {solvedState === 'solved' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-emerald-400 text-sm font-medium flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={14} />
                        Logic applied successfully
                      </p>
                    </motion.div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GridDisplay = ({ grid, label, size = 'sm', active = false, onCellClick, editable = false }) => {
  if (!grid) return null;
  const rows = grid.length;
  const cols = grid[0].length;

  const cellSize = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  const gap = size === 'lg' ? 'gap-1' : 'gap-px';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`grid ${gap} bg-slate-800 p-1 border-2 transition-all duration-300 ${active ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-slate-700'
          } ${editable ? 'cursor-pointer hover:border-slate-500' : ''}`}
        style={{ gridTemplateColumns: `repeat(${cols}, min-content)` }}
      >
        {grid.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => editable && onCellClick && onCellClick(r, c)}
              className={`${cellSize} ${COLORS[cell]} transition-all duration-200 
                ${editable ? 'hover:brightness-110 hover:scale-95 active:scale-90' : 'hover:opacity-90'}
              `}
              title={`Val: ${cell}`}
            />
          ))
        ))}
      </div>
      {label && <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</span>}
    </div>
  );
};

export default Completion33;

