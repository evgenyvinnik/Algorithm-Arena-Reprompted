import React, { useState, useEffect } from 'react';

const Completion8 = () => {
  // 9 boards, each with 9 cells
  const [board, setBoard] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );
  const [xIsNext, setXIsNext] = useState(true);
  const [nextBoard, setNextBoard] = useState(null); // null means can play anywhere valid
  const [macroBoard, setMacroBoard] = useState(Array(9).fill(null)); // Winner of each local board: 'X', 'O', or 'D' (Draw)

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const isBoardFull = (squares) => {
    return squares.every((cell) => cell !== null);
  };

  const handleClick = (macroIndex, cellIndex) => {
    // 1. Check if game is already won globally
    if (calculateWinner(macroBoard)) return;

    // 2. Check if valid board to play in
    // If nextBoard is defined, must play there.
    if (nextBoard !== null && nextBoard !== macroIndex) return;

    // 3. Check if target cell is empty
    if (board[macroIndex][cellIndex]) return;

    // 4. Check if current local board is already won or full
    if (macroBoard[macroIndex]) return;

    // Execute Move
    const newBoard = [...board];
    newBoard[macroIndex] = [...board[macroIndex]];
    newBoard[macroIndex][cellIndex] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);

    // Check Local Win/Draw
    // We need to check win on the *new* state of the local board
    // Note: macroBoard state update is async, so we calculate it here
    const newLocalBoard = newBoard[macroIndex];
    let localWinner = calculateWinner(newLocalBoard);
    let newMacroBoard = [...macroBoard];

    if (localWinner) {
      newMacroBoard[macroIndex] = localWinner;
    } else if (isBoardFull(newLocalBoard)) {
      newMacroBoard[macroIndex] = 'D'; // Draw
    }
    setMacroBoard(newMacroBoard);

    // Determine Next Board
    // The move was at cellIndex. Next player must play in board #cellIndex.
    // UNLESS board #cellIndex is full or won.
    // IMPORTANT: Check condition on newMacroBoard, not the old state state
    // But we need to know if board[cellIndex] is full.
    // And if newMacroBoard[cellIndex] is set.

    // We need the state of the TARGET board (index = cellIndex)
    // Be careful: if macroIndex == cellIndex, we just updated it.
    // So we should look at newBoard and newMacroBoard.

    const targetBoardIsWon = newMacroBoard[cellIndex];
    const targetBoardIsFull = isBoardFull(newBoard[cellIndex]);

    if (targetBoardIsWon || targetBoardIsFull) {
      setNextBoard(null); // Can play anywhere
    } else {
      setNextBoard(cellIndex);
    }

    setXIsNext(!xIsNext);
  };

  const globalWinner = calculateWinner(macroBoard);
  let status;
  if (globalWinner) {
    status = `Winner: ${globalWinner}`;
  } else if (macroBoard.every((b) => b !== null)) {
    status = 'Draw!'; // Global draw
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  const resetGame = () => {
    setBoard(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(null))
    );
    setXIsNext(true);
    setNextBoard(null);
    setMacroBoard(Array(9).fill(null));
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gray-900 text-white min-h-screen font-sans">
      <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Ultimate Tic Tac Toe
      </h1>

      <div className="mb-4 text-2xl font-bold flex items-center gap-4">
        <span>{status}</span>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-2 bg-gray-800 rounded-xl shadow-2xl relative">
        {/* Global Winner Overlay */}
        {globalWinner && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm pointer-events-none">
            <h2 className="text-8xl font-black text-yellow-400 animate-bounce">
              {globalWinner} WINS!
            </h2>
          </div>
        )}

        {board.map((localBoard, macroIndex) => {
          const isWon = macroBoard[macroIndex];
          // isTarget visualization:
          // If game over, no target.
          // If nextBoard is specific, only that one is target.
          // If nextBoard is null, ALL non-won/non-full boards are targets.
          const isFull = isBoardFull(localBoard);

          let isTarget = false;
          if (!globalWinner && !isWon && !isFull) {
            if (nextBoard === null) {
              isTarget = true;
            } else if (nextBoard === macroIndex) {
              isTarget = true;
            }
          }

          return (
            <div
              key={macroIndex}
              className={`grid grid-cols-3 gap-1 p-1 rounded-lg relative transition-all duration-300 ${
                isTarget
                  ? 'bg-gray-700 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'bg-gray-700/50 opacity-80'
              }`}
            >
              {/* Local Board Winner Overlay */}
              {isWon && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800/80 rounded-lg">
                  <span
                    className={`text-6xl font-black ${
                      isWon === 'X'
                        ? 'text-blue-500'
                        : isWon === 'O'
                          ? 'text-purple-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {isWon === 'D' ? '-' : isWon}
                  </span>
                </div>
              )}

              {localBoard.map((cell, cellIndex) => (
                <button
                  key={cellIndex}
                  disabled={!!globalWinner || !!isWon || !isTarget}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded hover:bg-white/10 transition-colors disabled:cursor-not-allowed ${
                    cell === 'X' ? 'text-blue-400' : 'text-purple-400'
                  }`}
                  onClick={() => handleClick(macroIndex, cellIndex)}
                >
                  {cell}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-8 max-w-lg text-gray-400 text-sm">
        <h3 className="font-bold text-gray-300 mb-2">Rules:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Win 3 small boards in a line to win the game.</li>
          <li>Your move determines the board your opponent must play in next.</li>
          <li>If sent to a won or full board, you can play anywhere.</li>
        </ul>
      </div>
    </div>
  );
};

export default Completion8;
