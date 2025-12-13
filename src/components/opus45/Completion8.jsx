import React, { useState, useCallback, useEffect } from 'react';

// Constants
const EMPTY = null;
const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Win patterns for a 3x3 board
const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

// Check winner for a single 3x3 board
const checkWinner = (board) => {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

// Check if board is full
const isBoardFull = (board) => board.every((cell) => cell !== EMPTY);

// Create empty board
const createEmptyBoard = () => Array(9).fill(EMPTY);

// Create empty meta board (9 small boards)
const createEmptyMetaBoard = () =>
  Array(9)
    .fill(null)
    .map(() => createEmptyBoard());

// Monte Carlo Tree Search AI
class MCTS {
  constructor(iterations = 1000) {
    this.iterations = iterations;
  }

  clone(state) {
    return {
      boards: state.boards.map((b) => [...b]),
      metaBoard: [...state.metaBoard],
      currentPlayer: state.currentPlayer,
      activeBoard: state.activeBoard,
    };
  }

  getValidMoves(state) {
    const moves = [];
    const { boards, metaBoard, activeBoard } = state;

    if (activeBoard !== null && metaBoard[activeBoard] === null) {
      // Must play in specific board
      for (let cell = 0; cell < 9; cell++) {
        if (boards[activeBoard][cell] === EMPTY) {
          moves.push({ board: activeBoard, cell });
        }
      }
    } else {
      // Can play in any non-won board
      for (let board = 0; board < 9; board++) {
        if (metaBoard[board] === null) {
          for (let cell = 0; cell < 9; cell++) {
            if (boards[board][cell] === EMPTY) {
              moves.push({ board, cell });
            }
          }
        }
      }
    }
    return moves;
  }

  makeMove(state, move) {
    const newState = this.clone(state);
    newState.boards[move.board][move.cell] = newState.currentPlayer;

    // Check if small board is won
    const winner = checkWinner(newState.boards[move.board]);
    if (winner) {
      newState.metaBoard[move.board] = winner;
    } else if (isBoardFull(newState.boards[move.board])) {
      newState.metaBoard[move.board] = 'D'; // Draw
    }

    // Set next active board
    if (newState.metaBoard[move.cell] === null) {
      newState.activeBoard = move.cell;
    } else {
      newState.activeBoard = null;
    }

    newState.currentPlayer = newState.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    return newState;
  }

  getGameResult(state) {
    const winner = checkWinner(state.metaBoard.map((b) => (b === 'D' ? null : b)));
    if (winner) return winner;
    if (state.metaBoard.every((b) => b !== null)) return 'D';
    if (this.getValidMoves(state).length === 0) return 'D';
    return null;
  }

  simulate(state) {
    let current = this.clone(state);
    let result = this.getGameResult(current);
    let depth = 0;
    const maxDepth = 81;

    while (result === null && depth < maxDepth) {
      const moves = this.getValidMoves(current);
      if (moves.length === 0) break;
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      current = this.makeMove(current, randomMove);
      result = this.getGameResult(current);
      depth++;
    }

    return result;
  }

  findBestMove(state) {
    const moves = this.getValidMoves(state);
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];

    const scores = new Map();
    const visits = new Map();

    for (const move of moves) {
      scores.set(JSON.stringify(move), 0);
      visits.set(JSON.stringify(move), 0);
    }

    for (let i = 0; i < this.iterations; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      const key = JSON.stringify(move);
      const newState = this.makeMove(state, move);
      const result = this.simulate(newState);

      visits.set(key, visits.get(key) + 1);
      if (result === state.currentPlayer) {
        scores.set(key, scores.get(key) + 1);
      } else if (result === 'D') {
        scores.set(key, scores.get(key) + 0.5);
      }
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const key = JSON.stringify(move);
      const score = visits.get(key) > 0 ? scores.get(key) / visits.get(key) : 0;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }
}

// Small Board Component
const SmallBoard = ({
  boardIndex,
  board,
  metaWinner,
  isActive,
  onCellClick,
  currentPlayer,
  disabled,
}) => {
  const getBoardStyle = () => {
    let backgroundColor = '#1a1a2e';
    let borderColor = '#333';

    if (metaWinner === PLAYER_X) {
      backgroundColor = 'rgba(99, 102, 241, 0.3)';
      borderColor = '#6366f1';
    } else if (metaWinner === PLAYER_O) {
      backgroundColor = 'rgba(236, 72, 153, 0.3)';
      borderColor = '#ec4899';
    } else if (metaWinner === 'D') {
      backgroundColor = 'rgba(107, 114, 128, 0.3)';
      borderColor = '#6b7280';
    } else if (isActive) {
      backgroundColor = 'rgba(34, 197, 94, 0.2)';
      borderColor = '#22c55e';
    }

    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2px',
      padding: '4px',
      backgroundColor,
      borderRadius: '8px',
      border: `3px solid ${borderColor}`,
      position: 'relative',
      transition: 'all 0.3s ease',
    };
  };

  const getCellStyle = (cellIndex) => {
    const cell = board[cellIndex];
    const canClick = isActive && cell === EMPTY && !metaWinner && !disabled;

    return {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(14px, 3vw, 24px)',
      fontWeight: 'bold',
      backgroundColor: canClick ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
      border: 'none',
      borderRadius: '4px',
      cursor: canClick ? 'pointer' : 'default',
      color: cell === PLAYER_X ? '#6366f1' : cell === PLAYER_O ? '#ec4899' : '#666',
      transition: 'all 0.2s ease',
      ...(canClick && {
        ':hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
      }),
    };
  };

  const getOverlayStyle = () => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(40px, 8vw, 80px)',
    fontWeight: 'bold',
    color: metaWinner === PLAYER_X ? '#6366f1' : metaWinner === PLAYER_O ? '#ec4899' : '#6b7280',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
  });

  return (
    <div style={getBoardStyle()}>
      {board.map((cell, cellIndex) => (
        <button
          key={cellIndex}
          style={getCellStyle(cellIndex)}
          onClick={() => onCellClick(boardIndex, cellIndex)}
          disabled={!isActive || cell !== EMPTY || metaWinner || disabled}
          onMouseOver={(e) => {
            if (isActive && cell === EMPTY && !metaWinner && !disabled) {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (isActive && cell === EMPTY && !metaWinner && !disabled) {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
        >
          {cell}
        </button>
      ))}
      {metaWinner && metaWinner !== 'D' && <div style={getOverlayStyle()}>{metaWinner}</div>}
      {metaWinner === 'D' && <div style={getOverlayStyle()}>―</div>}
    </div>
  );
};

// Main Game Component
const Completion8 = () => {
  const [boards, setBoards] = useState(createEmptyMetaBoard);
  const [metaBoard, setMetaBoard] = useState(() => Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  const [activeBoard, setActiveBoard] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'pvp'
  const [aiDifficulty, setAiDifficulty] = useState(500); // MCTS iterations
  const [moveHistory, setMoveHistory] = useState([]);

  const mcts = useCallback(() => new MCTS(aiDifficulty), [aiDifficulty]);

  const resetGame = () => {
    setBoards(createEmptyMetaBoard());
    setMetaBoard(Array(9).fill(null));
    setCurrentPlayer(PLAYER_X);
    setActiveBoard(null);
    setGameWinner(null);
    setIsAIThinking(false);
    setMoveHistory([]);
  };

  const handleCellClick = useCallback(
    (boardIndex, cellIndex) => {
      if (gameWinner || isAIThinking) return;
      if (activeBoard !== null && activeBoard !== boardIndex) return;
      if (metaBoard[boardIndex] !== null) return;
      if (boards[boardIndex][cellIndex] !== EMPTY) return;

      const newBoards = boards.map((b, i) =>
        i === boardIndex ? b.map((c, j) => (j === cellIndex ? currentPlayer : c)) : [...b]
      );
      const newMetaBoard = [...metaBoard];

      // Check if small board is won
      const winner = checkWinner(newBoards[boardIndex]);
      if (winner) {
        newMetaBoard[boardIndex] = winner;
      } else if (isBoardFull(newBoards[boardIndex])) {
        newMetaBoard[boardIndex] = 'D';
      }

      // Determine next active board
      let nextActiveBoard = cellIndex;
      if (newMetaBoard[cellIndex] !== null) {
        nextActiveBoard = null;
      }

      // Check for game winner
      const gameResult = checkWinner(newMetaBoard.map((b) => (b === 'D' ? null : b)));
      const allBoardsFilled = newMetaBoard.every((b) => b !== null);

      setBoards(newBoards);
      setMetaBoard(newMetaBoard);
      setActiveBoard(nextActiveBoard);
      setMoveHistory((prev) => [
        ...prev,
        { board: boardIndex, cell: cellIndex, player: currentPlayer },
      ]);

      if (gameResult) {
        setGameWinner(gameResult);
      } else if (allBoardsFilled) {
        setGameWinner('D');
      } else {
        setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
      }
    },
    [boards, metaBoard, activeBoard, currentPlayer, gameWinner, isAIThinking]
  );

  // AI Move
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === PLAYER_O && !gameWinner && !isAIThinking) {
      setIsAIThinking(true);

      setTimeout(() => {
        const ai = mcts();
        const state = {
          boards: boards.map((b) => [...b]),
          metaBoard: [...metaBoard],
          currentPlayer: PLAYER_O,
          activeBoard,
        };

        const bestMove = ai.findBestMove(state);
        if (bestMove) {
          handleCellClick(bestMove.board, bestMove.cell);
        }
        setIsAIThinking(false);
      }, 100);
    }
  }, [
    currentPlayer,
    gameMode,
    gameWinner,
    isAIThinking,
    boards,
    metaBoard,
    activeBoard,
    mcts,
    handleCellClick,
  ]);

  const isActiveBoardForCell = (boardIndex) => {
    if (gameWinner) return false;
    if (metaBoard[boardIndex] !== null) return false;
    if (activeBoard === null) return true;
    return activeBoard === boardIndex;
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  };

  const titleStyle = {
    fontSize: 'clamp(24px, 5vw, 48px)',
    fontWeight: 'bold',
    marginBottom: '10px',
    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
  };

  const subtitleStyle = {
    fontSize: 'clamp(12px, 2vw, 16px)',
    color: '#888',
    marginBottom: '20px',
    textAlign: 'center',
  };

  const controlsStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const buttonStyle = (active = false) => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: active ? 'linear-gradient(90deg, #6366f1, #ec4899)' : '#333',
    color: '#fff',
    transition: 'all 0.3s ease',
  });

  const statusStyle = {
    fontSize: 'clamp(16px, 3vw, 24px)',
    marginBottom: '20px',
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  };

  const mainBoardStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'clamp(4px, 1vw, 12px)',
    padding: 'clamp(8px, 2vw, 20px)',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  };

  const legendStyle = {
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    fontSize: 'clamp(10px, 2vw, 14px)',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
  };

  const getStatusMessage = () => {
    if (gameWinner === 'D') return '🤝 Game ended in a draw!';
    if (gameWinner) return `🎉 Player ${gameWinner} wins!`;
    if (isAIThinking) return '🤔 AI is thinking...';
    return `Current turn: Player ${currentPlayer} ${currentPlayer === PLAYER_X ? '🔵' : '🔴'}`;
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Ultimate Tic-Tac-Toe</h1>
      <p style={subtitleStyle}>Win 3 small boards in a row to claim victory!</p>

      <div style={controlsStyle}>
        <button
          style={buttonStyle(gameMode === 'ai')}
          onClick={() => {
            setGameMode('ai');
            resetGame();
          }}
        >
          🤖 vs AI
        </button>
        <button
          style={buttonStyle(gameMode === 'pvp')}
          onClick={() => {
            setGameMode('pvp');
            resetGame();
          }}
        >
          👥 2 Players
        </button>
        <button style={buttonStyle()} onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {gameMode === 'ai' && (
        <div
          style={{
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>AI Difficulty:</span>
          <select
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(Number(e.target.value))}
            style={{
              padding: '8px',
              borderRadius: '4px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              cursor: 'pointer',
            }}
          >
            <option value={200}>Easy</option>
            <option value={500}>Medium</option>
            <option value={1000}>Hard</option>
            <option value={2000}>Expert</option>
          </select>
        </div>
      )}

      <div style={statusStyle}>{getStatusMessage()}</div>

      <div style={mainBoardStyle}>
        {boards.map((board, boardIndex) => (
          <SmallBoard
            key={boardIndex}
            boardIndex={boardIndex}
            board={board}
            metaWinner={metaBoard[boardIndex]}
            isActive={isActiveBoardForCell(boardIndex)}
            onCellClick={handleCellClick}
            currentPlayer={currentPlayer}
            disabled={isAIThinking || gameWinner}
          />
        ))}
      </div>

      <div style={legendStyle}>
        <div style={{ marginBottom: '10px' }}>
          <strong>How to play:</strong>
        </div>
        <div>
          • Your move in a small board determines which board your opponent must play in next
        </div>
        <div>• Win a small board by getting 3 in a row (like regular tic-tac-toe)</div>
        <div>• Win the game by winning 3 small boards in a row</div>
        <div>
          • <span style={{ color: '#22c55e' }}>Green border</span> = Active board(s) where you can
          play
        </div>
        <div>
          • <span style={{ color: '#6366f1' }}>Blue</span> = Player X won |{' '}
          <span style={{ color: '#ec4899' }}>Pink</span> = Player O won
        </div>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Moves played: {moveHistory.length}
      </div>
    </div>
  );
};

export default Completion8;
