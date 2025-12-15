import React, { useState, useCallback } from 'react';

// Color palette for ARC-AGI puzzles
const COLORS = [
  '#000000', // 0 - black
  '#0074D9', // 1 - blue
  '#FF4136', // 2 - red
  '#2ECC40', // 3 - green
  '#FFDC00', // 4 - yellow
  '#AAAAAA', // 5 - gray
  '#F012BE', // 6 - magenta
  '#FF851B', // 7 - orange
  '#7FDBFF', // 8 - cyan
  '#B10DC9', // 9 - maroon
];

// Three ARC-AGI puzzles with their solutions
const PUZZLES = [
  {
    id: 'fill-rectangle',
    name: 'Fill Rectangle',
    description: 'Fill the rectangle marked by colored corners',
    examples: [
      {
        input: [
          [0, 0, 0, 0, 0],
          [0, 1, 0, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 0, 1, 0],
          [0, 0, 0, 0, 0],
        ],
        output: [
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 1, 1, 1, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        input: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 2, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 2, 0, 2, 0],
          [0, 0, 0, 0, 0, 0],
        ],
        output: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 2, 2, 2, 0],
          [0, 0, 2, 2, 2, 0],
          [0, 0, 2, 2, 2, 0],
          [0, 0, 0, 0, 0, 0],
        ],
      },
    ],
    test: {
      input: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 3, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 3, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      output: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 3, 3, 3, 3, 3, 0],
        [0, 3, 3, 3, 3, 3, 0],
        [0, 3, 3, 3, 3, 3, 0],
        [0, 3, 3, 3, 3, 3, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
    solve: (grid) => {
      const result = grid.map((row) => [...row]);
      const nonZeroCells = [];

      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (grid[i][j] !== 0) {
            nonZeroCells.push({ row: i, col: j, color: grid[i][j] });
          }
        }
      }

      if (nonZeroCells.length === 4) {
        const color = nonZeroCells[0].color;
        const minRow = Math.min(...nonZeroCells.map((c) => c.row));
        const maxRow = Math.max(...nonZeroCells.map((c) => c.row));
        const minCol = Math.min(...nonZeroCells.map((c) => c.col));
        const maxCol = Math.max(...nonZeroCells.map((c) => c.col));

        for (let i = minRow; i <= maxRow; i++) {
          for (let j = minCol; j <= maxCol; j++) {
            result[i][j] = color;
          }
        }
      }

      return result;
    },
  },
  {
    id: 'mirror-horizontal',
    name: 'Mirror Horizontal',
    description: 'Mirror the pattern horizontally across the center',
    examples: [
      {
        input: [
          [1, 0, 0, 0, 0],
          [1, 1, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        output: [
          [1, 0, 0, 0, 1],
          [1, 1, 0, 1, 1],
          [0, 0, 0, 0, 0],
          [1, 1, 0, 1, 1],
          [1, 0, 0, 0, 1],
        ],
      },
      {
        input: [
          [0, 0, 0, 0, 0],
          [0, 2, 2, 0, 0],
          [0, 2, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        output: [
          [0, 0, 0, 0, 0],
          [0, 2, 2, 2, 0],
          [0, 2, 0, 2, 0],
          [0, 2, 2, 2, 0],
          [0, 0, 0, 0, 0],
        ],
      },
    ],
    test: {
      input: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 4, 4, 4, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      output: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 4, 4, 4, 4, 4, 0],
        [0, 0, 4, 0, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 0, 4, 0, 0],
        [0, 4, 4, 4, 4, 4, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
    solve: (grid) => {
      const rows = grid.length;
      const cols = grid[0].length;
      const result = grid.map((row) => [...row]);

      // Mirror horizontally and vertically
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j] !== 0) {
            result[i][cols - 1 - j] = grid[i][j];
            result[rows - 1 - i][j] = grid[i][j];
            result[rows - 1 - i][cols - 1 - j] = grid[i][j];
          }
        }
      }

      return result;
    },
  },
  {
    id: 'flood-fill-border',
    name: 'Flood Fill Border',
    description: 'Draw a border around the colored shape',
    examples: [
      {
        input: [
          [0, 0, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0],
        ],
        output: [
          [0, 2, 2, 2, 0],
          [2, 2, 1, 2, 2],
          [2, 1, 1, 1, 2],
          [2, 2, 1, 2, 2],
          [0, 2, 2, 2, 0],
        ],
      },
      {
        input: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 0, 0],
          [0, 0, 3, 3, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ],
        output: [
          [0, 2, 2, 2, 2, 0],
          [0, 2, 3, 3, 2, 0],
          [0, 2, 3, 3, 2, 0],
          [0, 2, 2, 2, 2, 0],
        ],
      },
    ],
    test: {
      input: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 4, 4, 4, 0],
        [0, 0, 4, 4, 4, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      output: [
        [0, 0, 0, 0, 0, 0],
        [0, 2, 2, 2, 2, 2],
        [0, 2, 4, 4, 4, 2],
        [0, 2, 4, 4, 4, 2],
        [0, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0],
      ],
    },
    solve: (grid) => {
      const rows = grid.length;
      const cols = grid[0].length;
      const result = grid.map((row) => [...row]);

      // Find all non-zero cells and add border
      const coloredCells = new Set();
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j] !== 0) {
            coloredCells.add(`${i},${j}`);
          }
        }
      }

      // Add border (color 2) around colored cells
      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j] !== 0) {
            for (const [di, dj] of directions) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && result[ni][nj] === 0) {
                result[ni][nj] = 2;
              }
            }
          }
        }
      }

      return result;
    },
  },
];

// Grid component to display ARC puzzles
const Grid = ({ data, cellSize = 30, editable = false, onChange }) => {
  const handleCellClick = (row, col) => {
    if (editable && onChange) {
      onChange(row, col);
    }
  };

  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${data[0]?.length || 1}, ${cellSize}px)`,
        gap: '1px',
        backgroundColor: '#666',
        padding: '1px',
        border: '2px solid #333',
      }}
    >
      {data.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            onClick={() => handleCellClick(i, j)}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: COLORS[cell] || COLORS[0],
              cursor: editable ? 'pointer' : 'default',
              transition: 'background-color 0.1s',
            }}
          />
        ))
      )}
    </div>
  );
};

// Example pair component
const ExamplePair = ({ example, index }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ fontSize: '14px', marginBottom: '5px', color: '#666' }}>Example {index + 1}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '3px', textAlign: 'center' }}>Input</div>
        <Grid data={example.input} cellSize={25} />
      </div>
      <div style={{ fontSize: '24px', color: '#666' }}>→</div>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '3px', textAlign: 'center' }}>Output</div>
        <Grid data={example.output} cellSize={25} />
      </div>
    </div>
  </div>
);

// Color palette component
const ColorPalette = ({ selectedColor, onSelectColor }) => (
  <div style={{ marginBottom: '15px' }}>
    <div style={{ fontSize: '14px', marginBottom: '5px' }}>Select Color:</div>
    <div style={{ display: 'flex', gap: '5px' }}>
      {COLORS.map((color, index) => (
        <div
          key={index}
          onClick={() => onSelectColor(index)}
          style={{
            width: 30,
            height: 30,
            backgroundColor: color,
            border: selectedColor === index ? '3px solid #fff' : '1px solid #666',
            cursor: 'pointer',
            boxShadow: selectedColor === index ? '0 0 5px #000' : 'none',
          }}
        />
      ))}
    </div>
  </div>
);

// Main puzzle component
const PuzzleSolver = ({ puzzle }) => {
  const [userGrid, setUserGrid] = useState(() => puzzle.test.input.map((row) => [...row]));
  const [selectedColor, setSelectedColor] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleCellChange = useCallback(
    (row, col) => {
      setUserGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = selectedColor;
        return newGrid;
      });
      setIsCorrect(null);
    },
    [selectedColor]
  );

  const resetGrid = () => {
    setUserGrid(puzzle.test.input.map((row) => [...row]));
    setIsCorrect(null);
  };

  const checkSolution = () => {
    const expected = puzzle.test.output;
    const correct = userGrid.every((row, i) => row.every((cell, j) => cell === expected[i][j]));
    setIsCorrect(correct);
  };

  const autoSolve = () => {
    const solution = puzzle.solve(puzzle.test.input);
    setUserGrid(solution);
    setIsCorrect(null);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h3 style={{ marginTop: 0, color: '#333' }}>{puzzle.name}</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>{puzzle.description}</p>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Examples:</h4>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
          }}
        >
          {puzzle.examples.map((example, index) => (
            <ExamplePair key={index} example={example} index={index} />
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #ddd',
          paddingTop: '20px',
          marginTop: '20px',
        }}
      >
        <h4 style={{ marginBottom: '10px' }}>Test Puzzle:</h4>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Input (Reference)
            </div>
            <Grid data={puzzle.test.input} cellSize={30} />
          </div>

          <div>
            <div
              style={{
                fontSize: '14px',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Your Output (Click to edit)
            </div>
            <Grid data={userGrid} cellSize={30} editable={true} onChange={handleCellChange} />

            <ColorPalette selectedColor={selectedColor} onSelectColor={setSelectedColor} />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={checkSolution}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2ECC40',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Check Solution
              </button>
              <button
                onClick={resetGrid}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FF4136',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={autoSolve}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0074D9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Auto-Solve
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#AAAAAA',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {showSolution ? 'Hide' : 'Show'} Solution
              </button>
            </div>

            {isCorrect !== null && (
              <div
                style={{
                  marginTop: '15px',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                  color: isCorrect ? '#155724' : '#721c24',
                  fontWeight: 'bold',
                }}
              >
                {isCorrect ? '✓ Correct! Well done!' : '✗ Not quite right. Try again!'}
              </div>
            )}
          </div>

          {showSolution && (
            <div>
              <div
                style={{
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  color: '#666',
                }}
              >
                Expected Output
              </div>
              <Grid data={puzzle.test.output} cellSize={30} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Completion33 = () => {
  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#333' }}>ARC-AGI Puzzle Solver</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Study the examples to understand the pattern, then solve the test puzzle. Click on cells to
        change their color, or use Auto-Solve to see the programmatic solution.
      </p>

      <div
        style={{
          backgroundColor: '#e8f4f8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '30px',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#0074D9' }}>How to Play:</h3>
        <ol style={{ color: '#333', lineHeight: '1.8' }}>
          <li>Look at the example input/output pairs to understand the pattern</li>
          <li>Select a color from the palette</li>
          <li>Click cells in &quot;Your Output&quot; grid to paint them</li>
          <li>Click &quot;Check Solution&quot; to verify your answer</li>
          <li>Use &quot;Auto-Solve&quot; to see how the algorithm solves it programmatically</li>
        </ol>
      </div>

      {PUZZLES.map((puzzle) => (
        <PuzzleSolver key={puzzle.id} puzzle={puzzle} />
      ))}

      <div
        style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ color: '#333' }}>About ARC-AGI</h3>
        <p style={{ color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          ARC-AGI (Abstraction and Reasoning Corpus) is a benchmark for measuring AI's ability to
          efficiently acquire new skills. These puzzles test pattern recognition and abstract
          reasoning - skills that humans excel at but current AI systems struggle with. The ARC
          Prize offers $1 million for an AI that can solve these puzzles.
        </p>
      </div>
    </div>
  );
};

export default Completion33;
