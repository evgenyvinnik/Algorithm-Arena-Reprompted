import React, { useState, useCallback, useEffect, useRef } from "react";

// Chess piece Unicode symbols
const PIECES = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

// Initial board setup
const initialBoard = () => [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];

// Convert board position to algebraic notation
const toAlgebraic = (row, col) => {
  const files = "abcdefgh";
  const ranks = "87654321";
  return files[col] + ranks[row];
};

// Convert algebraic notation to board position
const fromAlgebraic = (notation) => {
  const files = "abcdefgh";
  const ranks = "87654321";
  const col = files.indexOf(notation[0]);
  const row = ranks.indexOf(notation[1]);
  return { row, col };
};

// Generate FEN string from board state
const boardToFEN = (board, turn, castling, enPassant, halfmove, fullmove) => {
  let fen = "";
  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const pieceChar = piece[1];
        fen +=
          piece[0] === "w" ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
      } else {
        empty++;
      }
    }
    if (empty > 0) fen += empty;
    if (row < 7) fen += "/";
  }
  fen += ` ${turn} ${castling || "-"} ${
    enPassant || "-"
  } ${halfmove} ${fullmove}`;
  return fen;
};

// Check if a position is valid
const isValidPosition = (row, col) =>
  row >= 0 && row < 8 && col >= 0 && col < 8;

// Get all possible moves for a piece
const getPossibleMoves = (
  board,
  row,
  col,
  enPassantSquare = null,
  castlingRights = { wK: true, wQ: true, bK: true, bQ: true }
) => {
  const piece = board[row][col];
  if (!piece) return [];

  const color = piece[0];
  const type = piece[1];
  const moves = [];
  const direction = color === "w" ? -1 : 1;

  const addMoveIfValid = (r, c, captureOnly = false, moveOnly = false) => {
    if (!isValidPosition(r, c)) return false;
    const target = board[r][c];
    if (target && target[0] === color) return false;
    if (captureOnly && !target) return false;
    if (moveOnly && target) return false;
    moves.push({ row: r, col: c });
    return !target;
  };

  switch (type) {
    case "P": {
      const startRow = color === "w" ? 6 : 1;
      if (addMoveIfValid(row + direction, col, false, true)) {
        if (row === startRow) {
          addMoveIfValid(row + 2 * direction, col, false, true);
        }
      }
      addMoveIfValid(row + direction, col - 1, true);
      addMoveIfValid(row + direction, col + 1, true);
      if (enPassantSquare) {
        const ep = fromAlgebraic(enPassantSquare);
        if (row + direction === ep.row && Math.abs(col - ep.col) === 1) {
          moves.push({ row: ep.row, col: ep.col, enPassant: true });
        }
      }
      break;
    }
    case "N": {
      const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      knightMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
      break;
    }
    case "B": {
      for (const d of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + d[0] * i, col + d[1] * i)) break;
        }
      }
      break;
    }
    case "R": {
      for (const d of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + d[0] * i, col + d[1] * i)) break;
        }
      }
      break;
    }
    case "Q": {
      for (const d of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + d[0] * i, col + d[1] * i)) break;
        }
      }
      break;
    }
    case "K": {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) addMoveIfValid(row + dr, col + dc);
        }
      }
      const backRank = color === "w" ? 7 : 0;
      if (row === backRank && col === 4) {
        if (
          castlingRights[`${color}K`] &&
          !board[backRank][5] &&
          !board[backRank][6] &&
          board[backRank][7] === `${color}R`
        ) {
          moves.push({ row: backRank, col: 6, castling: "K" });
        }
        if (
          castlingRights[`${color}Q`] &&
          !board[backRank][3] &&
          !board[backRank][2] &&
          !board[backRank][1] &&
          board[backRank][0] === `${color}R`
        ) {
          moves.push({ row: backRank, col: 2, castling: "Q" });
        }
      }
      break;
    }
    default:
      break;
  }

  return moves;
};

// Find king position
const findKing = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === `${color}K`) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check if king is in check
const isInCheck = (board, color) => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const enemyColor = color === "w" ? "b" : "w";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === enemyColor) {
        const moves = getPossibleMoves(board, row, col);
        if (moves.some((m) => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Make a move and return new board
const makeMove = (
  board,
  fromRow,
  fromCol,
  toRow,
  toCol,
  promotionPiece = "Q"
) => {
  const newBoard = board.map((r) => [...r]);
  const piece = newBoard[fromRow][fromCol];
  const color = piece[0];

  if (piece[1] === "P" && fromCol !== toCol && !newBoard[toRow][toCol]) {
    newBoard[fromRow][toCol] = null;
  }

  if (piece[1] === "K" && Math.abs(fromCol - toCol) === 2) {
    if (toCol === 6) {
      newBoard[fromRow][5] = newBoard[fromRow][7];
      newBoard[fromRow][7] = null;
    } else if (toCol === 2) {
      newBoard[fromRow][3] = newBoard[fromRow][0];
      newBoard[fromRow][0] = null;
    }
  }

  if (piece[1] === "P" && (toRow === 0 || toRow === 7)) {
    newBoard[toRow][toCol] = `${color}${promotionPiece}`;
  } else {
    newBoard[toRow][toCol] = piece;
  }

  newBoard[fromRow][fromCol] = null;
  return newBoard;
};

// Check if a move is legal
const isLegalMove = (board, fromRow, fromCol, toRow, toCol) => {
  const piece = board[fromRow][fromCol];
  if (!piece) return false;
  const color = piece[0];
  const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);
  return !isInCheck(newBoard, color);
};

// Get all legal moves for a color
const getAllLegalMoves = (board, color, enPassantSquare, castlingRights) => {
  const legalMoves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece[0] === color) {
        const moves = getPossibleMoves(
          board,
          row,
          col,
          enPassantSquare,
          castlingRights
        );
        moves.forEach((move) => {
          if (isLegalMove(board, row, col, move.row, move.col)) {
            legalMoves.push({ from: { row, col }, to: move });
          }
        });
      }
    }
  }
  return legalMoves;
};

// Convert move to UCI notation
const toUCI = (fromRow, fromCol, toRow, toCol, promotion = "") => {
  return (
    toAlgebraic(fromRow, fromCol) +
    toAlgebraic(toRow, toCol) +
    promotion.toLowerCase()
  );
};

// Parse UCI move
const parseUCI = (uci) => {
  const from = fromAlgebraic(uci.substring(0, 2));
  const to = fromAlgebraic(uci.substring(2, 4));
  const promotion = uci.length > 4 ? uci[4].toUpperCase() : null;
  return { from, to, promotion };
};

const Completion1 = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [turn, setTurn] = useState("w");
  const [gameStatus, setGameStatus] = useState("playing");
  const [moveHistory, setMoveHistory] = useState([]);
  const [stockfishReady, setStockfishReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintMove, setHintMove] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [difficulty, setDifficulty] = useState(10);
  const [enPassantSquare, setEnPassantSquare] = useState(null);
  const [castlingRights, setCastlingRights] = useState({
    wK: true,
    wQ: true,
    bK: true,
    bQ: true,
  });
  const [halfmoveClock, setHalfmoveClock] = useState(0);
  const [fullmoveNumber, setFullmoveNumber] = useState(1);
  const [showPromotion, setShowPromotion] = useState(null);

  const stockfishRef = useRef(null);
  const pendingEvalRef = useRef(null);
  const gameStateRef = useRef({
    board: initialBoard(),
    castlingRights: { wK: true, wQ: true, bK: true, bQ: true },
  });

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = { board, castlingRights };
  }, [board, castlingRights]);

  // Execute bot move function
  const executeBotMoveFromRef = useCallback((from, to, promotion) => {
    const currentCastlingRights = gameStateRef.current.castlingRights;

    setBoard((prevBoard) => {
      const newBoard = makeMove(
        prevBoard,
        from.row,
        from.col,
        to.row,
        to.col,
        promotion || "Q"
      );

      const legalMoves = getAllLegalMoves(
        newBoard,
        "w",
        null,
        currentCastlingRights
      );
      if (legalMoves.length === 0) {
        if (isInCheck(newBoard, "w")) {
          setGameStatus("checkmate-black");
        } else {
          setGameStatus("stalemate");
        }
      } else if (isInCheck(newBoard, "w")) {
        setGameStatus("check");
      } else {
        setGameStatus("playing");
      }
      setTurn("w");

      return newBoard;
    });

    setMoveHistory((prev) => [
      ...prev,
      toUCI(from.row, from.col, to.row, to.col, promotion || ""),
    ]);
    setHintMove(null);
  }, []);

  // Initialize Stockfish
  useEffect(() => {
    const initStockfish = () => {
      try {
        const worker = new Worker(
          "https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16-single.js"
        );

        worker.onmessage = (e) => {
          const message = e.data;

          if (message === "uciok") {
            worker.postMessage("isready");
          } else if (message === "readyok") {
            setStockfishReady(true);
          } else if (message.startsWith("bestmove")) {
            const parts = message.split(" ");
            const bestMove = parts[1];
            if (pendingEvalRef.current === "hint") {
              setHintMove(bestMove);
              pendingEvalRef.current = null;
            } else if (pendingEvalRef.current === "bot") {
              const { from, to, promotion } = parseUCI(bestMove);
              executeBotMoveFromRef(from, to, promotion);
              pendingEvalRef.current = null;
            }
            setThinking(false);
          } else if (message.startsWith("info") && message.includes("score")) {
            const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
            if (scoreMatch) {
              const type = scoreMatch[1];
              const value = parseInt(scoreMatch[2]);
              if (type === "cp") {
                setEvaluation((value / 100).toFixed(2));
              } else {
                setEvaluation(`M${value}`);
              }
            }
          }
        };

        worker.postMessage("uci");
        stockfishRef.current = worker;
      } catch (error) {
        console.error("Failed to initialize Stockfish:", error);
      }
    };

    initStockfish();

    return () => {
      if (stockfishRef.current) {
        stockfishRef.current.terminate();
      }
    };
  }, [executeBotMoveFromRef]);

  // Bot makes a move
  const makeBotMove = useCallback(
    (currentBoard) => {
      if (!stockfishRef.current || !stockfishReady) return;

      setThinking(true);
      pendingEvalRef.current = "bot";

      const fen = boardToFEN(
        currentBoard,
        "b",
        (castlingRights.wK ? "K" : "") +
          (castlingRights.wQ ? "Q" : "") +
          (castlingRights.bK ? "k" : "") +
          (castlingRights.bQ ? "q" : "") || "-",
        enPassantSquare,
        halfmoveClock,
        fullmoveNumber
      );

      stockfishRef.current.postMessage(`position fen ${fen}`);
      stockfishRef.current.postMessage(`go depth ${difficulty}`);
    },
    [
      stockfishReady,
      castlingRights,
      enPassantSquare,
      halfmoveClock,
      fullmoveNumber,
      difficulty,
    ]
  );

  // Execute a move
  const executeMove = useCallback(
    (fromRow, fromCol, toRow, toCol, promotionPiece = "Q") => {
      const currentBoard = gameStateRef.current.board;
      const piece = currentBoard[fromRow][fromCol];
      const newBoard = makeMove(
        currentBoard,
        fromRow,
        fromCol,
        toRow,
        toCol,
        promotionPiece
      );

      // Update castling rights
      const newCastlingRights = { ...castlingRights };
      if (piece === "wK") {
        newCastlingRights.wK = false;
        newCastlingRights.wQ = false;
      } else if (piece === "wR") {
        if (fromCol === 0) newCastlingRights.wQ = false;
        if (fromCol === 7) newCastlingRights.wK = false;
      }
      setCastlingRights(newCastlingRights);

      // Update en passant square
      let newEnPassant = null;
      if (piece[1] === "P" && Math.abs(fromRow - toRow) === 2) {
        newEnPassant = toAlgebraic((fromRow + toRow) / 2, fromCol);
      }
      setEnPassantSquare(newEnPassant);

      // Update clocks
      const isCapture = currentBoard[toRow][toCol] !== null;
      const isPawnMove = piece[1] === "P";
      setHalfmoveClock(isCapture || isPawnMove ? 0 : halfmoveClock + 1);

      setBoard(newBoard);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setMoveHistory((prev) => [
        ...prev,
        toUCI(
          fromRow,
          fromCol,
          toRow,
          toCol,
          piece[1] === "P" && (toRow === 0 || toRow === 7) ? promotionPiece : ""
        ),
      ]);
      setHintMove(null);

      // Check game status
      const legalMoves = getAllLegalMoves(
        newBoard,
        "b",
        newEnPassant,
        newCastlingRights
      );
      if (legalMoves.length === 0) {
        if (isInCheck(newBoard, "b")) {
          setGameStatus("checkmate-white");
        } else {
          setGameStatus("stalemate");
        }
        setTurn("b");
        return;
      }

      setTurn("b");
      setGameStatus(isInCheck(newBoard, "b") ? "check" : "playing");

      // Bot moves
      setTimeout(() => makeBotMove(newBoard), 500);
    },
    [castlingRights, halfmoveClock, makeBotMove]
  );

  // Handle promotion selection
  const handlePromotion = useCallback(
    (piece) => {
      if (showPromotion) {
        executeMove(
          showPromotion.fromRow,
          showPromotion.fromCol,
          showPromotion.toRow,
          showPromotion.toCol,
          piece
        );
        setShowPromotion(null);
      }
    },
    [showPromotion, executeMove]
  );

  // Handle square click
  const handleSquareClick = useCallback(
    (row, col) => {
      if (
        gameStatus.startsWith("checkmate") ||
        gameStatus === "stalemate" ||
        turn !== "w" ||
        thinking
      )
        return;

      const piece = board[row][col];

      if (selectedSquare) {
        const move = possibleMoves.find((m) => m.row === row && m.col === col);
        if (move) {
          const fromRow = selectedSquare.row;
          const fromCol = selectedSquare.col;
          const movingPiece = board[fromRow][fromCol];

          if (movingPiece[1] === "P" && (row === 0 || row === 7)) {
            setShowPromotion({ fromRow, fromCol, toRow: row, toCol: col });
            setSelectedSquare(null);
            setPossibleMoves([]);
            return;
          }

          executeMove(fromRow, fromCol, row, col);
          return;
        }

        if (!piece || piece[0] !== "w") {
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      }

      if (piece && piece[0] === "w") {
        setSelectedSquare({ row, col });
        const moves = getPossibleMoves(
          board,
          row,
          col,
          enPassantSquare,
          castlingRights
        ).filter((m) => isLegalMove(board, row, col, m.row, m.col));
        setPossibleMoves(moves);
      }
    },
    [
      board,
      selectedSquare,
      possibleMoves,
      gameStatus,
      turn,
      thinking,
      enPassantSquare,
      castlingRights,
      executeMove,
    ]
  );

  // Request a hint from Stockfish
  const requestHint = useCallback(() => {
    if (
      !stockfishRef.current ||
      !stockfishReady ||
      hintsRemaining <= 0 ||
      turn !== "w" ||
      thinking
    )
      return;

    setThinking(true);
    setHintsRemaining(hintsRemaining - 1);
    pendingEvalRef.current = "hint";

    const fen = boardToFEN(
      board,
      "w",
      (castlingRights.wK ? "K" : "") +
        (castlingRights.wQ ? "Q" : "") +
        (castlingRights.bK ? "k" : "") +
        (castlingRights.bQ ? "q" : "") || "-",
      enPassantSquare,
      halfmoveClock,
      fullmoveNumber
    );

    stockfishRef.current.postMessage(`position fen ${fen}`);
    stockfishRef.current.postMessage("go depth 15");
  }, [
    stockfishReady,
    hintsRemaining,
    turn,
    thinking,
    board,
    castlingRights,
    enPassantSquare,
    halfmoveClock,
    fullmoveNumber,
  ]);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(initialBoard());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setTurn("w");
    setGameStatus("playing");
    setMoveHistory([]);
    setHintsRemaining(3);
    setHintMove(null);
    setEvaluation(null);
    setEnPassantSquare(null);
    setCastlingRights({ wK: true, wQ: true, bK: true, bQ: true });
    setHalfmoveClock(0);
    setFullmoveNumber(1);
    setShowPromotion(null);
  }, []);

  // Get square color
  const getSquareColor = (row, col) => {
    const isLight = (row + col) % 2 === 0;

    if (
      selectedSquare &&
      selectedSquare.row === row &&
      selectedSquare.col === col
    ) {
      return "#7b61ff";
    }

    if (hintMove) {
      const { from, to } = parseUCI(hintMove);
      if (
        (from.row === row && from.col === col) ||
        (to.row === row && to.col === col)
      ) {
        return "#4caf50";
      }
    }

    if (possibleMoves.some((m) => m.row === row && m.col === col)) {
      return isLight ? "#90EE90" : "#228B22";
    }

    return isLight ? "#f0d9b5" : "#b58863";
  };

  // Get status message
  const getStatusMessage = () => {
    switch (gameStatus) {
      case "checkmate-white":
        return "🎉 Checkmate! You win!";
      case "checkmate-black":
        return "😔 Checkmate! Bot wins!";
      case "stalemate":
        return "🤝 Stalemate! Draw!";
      case "check":
        return "⚠️ Check!";
      default:
        return turn === "w" ? "♔ Your turn (White)" : "♚ Bot is thinking...";
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#1a1a2e",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ marginBottom: "10px", color: "#7b61ff" }}>
        ♟️ Stockfish Chess
      </h1>
      <p
        style={{
          marginBottom: "20px",
          color: "#888",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        Play against Stockfish! Use your hints wisely - you only have{" "}
        {hintsRemaining} left. The bot plays black and will respond to your
        moves.
      </p>

      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Chess Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 60px)",
            gridTemplateRows: "repeat(8, 60px)",
            border: "4px solid #333",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: getSquareColor(rowIndex, colIndex),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "45px",
                  cursor: turn === "w" && !thinking ? "pointer" : "default",
                  userSelect: "none",
                  position: "relative",
                }}
              >
                {piece && PIECES[piece]}
                {possibleMoves.some(
                  (m) => m.row === rowIndex && m.col === colIndex
                ) &&
                  !board[rowIndex][colIndex] && (
                    <div
                      style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
              </div>
            ))
          )}
        </div>

        {/* Controls Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            minWidth: "250px",
          }}
        >
          {/* Status */}
          <div
            style={{
              padding: "15px",
              backgroundColor: "#16213e",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {getStatusMessage()}
            </div>
            {thinking && (
              <div style={{ marginTop: "10px", color: "#7b61ff" }}>
                🤔 Thinking...
              </div>
            )}
          </div>

          {/* Evaluation */}
          {evaluation && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#16213e",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#888", fontSize: "12px" }}>Evaluation</div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: parseFloat(evaluation) > 0 ? "#4caf50" : "#f44336",
                }}
              >
                {evaluation}
              </div>
            </div>
          )}

          {/* Hint Button */}
          <button
            onClick={requestHint}
            disabled={
              hintsRemaining <= 0 ||
              turn !== "w" ||
              thinking ||
              gameStatus.startsWith("checkmate") ||
              gameStatus === "stalemate"
            }
            style={{
              padding: "15px",
              fontSize: "16px",
              backgroundColor: hintsRemaining > 0 ? "#7b61ff" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor:
                hintsRemaining > 0 && turn === "w" && !thinking
                  ? "pointer"
                  : "not-allowed",
              transition: "all 0.3s",
            }}
          >
            💡 Get Hint ({hintsRemaining} remaining)
          </button>

          {hintMove && (
            <div
              style={{
                padding: "10px",
                backgroundColor: "#4caf50",
                borderRadius: "10px",
                textAlign: "center",
                color: "#fff",
              }}
            >
              Suggested: <strong>{hintMove}</strong>
            </div>
          )}

          {/* Difficulty */}
          <div
            style={{
              padding: "10px",
              backgroundColor: "#16213e",
              borderRadius: "10px",
            }}
          >
            <div
              style={{ marginBottom: "5px", color: "#888", fontSize: "12px" }}
            >
              Bot Difficulty (Depth: {difficulty})
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            style={{
              padding: "15px",
              fontSize: "16px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            🔄 New Game
          </button>

          {/* Move History */}
          <div
            style={{
              padding: "10px",
              backgroundColor: "#16213e",
              borderRadius: "10px",
              maxHeight: "150px",
              overflow: "auto",
            }}
          >
            <div
              style={{ color: "#888", fontSize: "12px", marginBottom: "5px" }}
            >
              Move History
            </div>
            <div style={{ fontSize: "12px", fontFamily: "monospace" }}>
              {moveHistory.length === 0
                ? "No moves yet"
                : moveHistory.map((move, i) => (
                    <span key={i} style={{ marginRight: "10px" }}>
                      {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                      {move}
                    </span>
                  ))}
            </div>
          </div>

          {/* Stockfish Status */}
          <div
            style={{
              padding: "10px",
              backgroundColor: stockfishReady ? "#1e4620" : "#462020",
              borderRadius: "10px",
              textAlign: "center",
              fontSize: "12px",
            }}
          >
            {stockfishReady ? "✅ Stockfish Ready" : "⏳ Loading Stockfish..."}
          </div>
        </div>
      </div>

      {/* Promotion Modal */}
      {showPromotion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#16213e",
              padding: "20px",
              borderRadius: "15px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Choose Promotion</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              {["Q", "R", "B", "N"].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "40px",
                    backgroundColor: "#f0d9b5",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  {PIECES[`w${piece}`]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Completion1;
