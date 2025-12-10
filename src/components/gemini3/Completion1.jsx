import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const Completion1 = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [stockfishLevel, setStockfishLevel] = useState(10);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [status, setStatus] = useState('');
  const [bestMove, setBestMove] = useState(null);
  const engine = useRef(null);

  useEffect(() => {
    // Initialize Stockfish worker
    // Assuming stockfish.js is available in the public folder
    engine.current = new Worker('/stockfish.js');
    
    engine.current.onmessage = (event) => {
      const line = event.data;
      // console.log('Stockfish:', line);

      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        setBestMove(move);
        
        // If it was the engine's turn to play (Black)
        if (game.turn() === 'b') {
           makeAMove({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: move.length > 4 ? move[4] : 'q' });
        }
      }
    };

    engine.current.postMessage('uci');
    engine.current.postMessage('isready');

    return () => {
      if (engine.current) engine.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
      } else if (game.isDraw()) {
        setStatus('Draw!');
      } else {
        setStatus('Game Over!');
      }
    } else {
        setStatus('');
        // If it's black's turn, ask engine for a move
        if (game.turn() === 'b') {
            // Small delay for realism
            setTimeout(() => {
                engine.current.postMessage(`position fen ${game.fen()}`);
                engine.current.postMessage(`go depth ${stockfishLevel}`);
            }, 500);
        }
    }
  }, [fen, stockfishLevel]); // Depend on fen to trigger on turn change

  function makeAMove(move) {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen())); // Update game instance state
        setFen(game.fen());
        setBestMove(null); // Clear best move
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {
    if (game.turn() !== 'w' || game.isGameOver()) return false;

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });

    return move;
  }

  const getHint = () => {
    if (hintsLeft > 0 && game.turn() === 'w' && !game.isGameOver()) {
      setHintsLeft(hintsLeft - 1);
      engine.current.postMessage(`position fen ${game.fen()}`);
      engine.current.postMessage(`go depth 15`); // Higher depth for hint
      
      // We need to intercept the 'bestmove' for the hint, but our onmessage handler
      // is set up to play the move if it's black's turn. 
      // Since it's white's turn, the existing handler will just setBestMove(move) 
      // but NOT play it automatically because of the `if (game.turn() === 'b')` check.
      // So we can just display `bestMove` to the user or highlight it.
    }
  };
  
  // Effect to handle displaying the hint when bestMove updates and it's White's turn
  useEffect(() => {
      if (bestMove && game.turn() === 'w') {
          // It's a hint!
          // We could highlight the arrow or just show text.
          // For now, let's just show it in the status or a separate area.
      }
  }, [bestMove, game]);


  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 min-h-screen text-white font-sans">
      <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Stockfish Chess Challenge
      </h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-[400px] h-[400px] shadow-2xl border-4 border-gray-700 rounded-lg overflow-hidden">
          <Chessboard 
            position={fen} 
            onPieceDrop={onDrop}
            boardOrientation="white"
            customDarkSquareStyle={{ backgroundColor: '#779556' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
            customArrows={bestMove && game.turn() === 'w' ? [[bestMove.substring(0, 2), bestMove.substring(2, 4), 'rgb(0, 128, 0)']] : []}
          />
        </div>

        <div className="flex flex-col gap-4 bg-gray-800 p-6 rounded-xl shadow-lg w-full md:w-80">
          <div className="text-xl font-semibold border-b border-gray-700 pb-2 mb-2">Game Info</div>
          
          <div className="flex justify-between items-center">
             <span>Status:</span>
             <span className={`font-bold ${status.includes('Checkmate') ? 'text-red-400' : 'text-green-400'}`}>
               {status || 'Playing...'}
             </span>
          </div>
          
          <div className="flex justify-between items-center">
             <span>Turn:</span>
             <span className="font-bold capitalize">{game.turn() === 'w' ? 'White (You)' : 'Black (Stockfish)'}</span>
          </div>

          <div className="flex justify-between items-center">
             <span>Difficulty (Depth):</span>
             <input 
                type="number" 
                min="1" 
                max="20" 
                value={stockfishLevel} 
                onChange={(e) => setStockfishLevel(parseInt(e.target.value))}
                className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center"
             />
          </div>

          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h3 className="font-bold text-yellow-400 mb-2">The Twist: Perfect Hints</h3>
            <p className="text-sm text-gray-300 mb-4">
              Stuck? Ask Stockfish for the perfect move. You have <strong>{hintsLeft}</strong> hints remaining.
            </p>
            <button
              onClick={getHint}
              disabled={hintsLeft === 0 || game.turn() !== 'w' || game.isGameOver()}
              className={`w-full py-2 px-4 rounded font-bold transition-all duration-200 ${
                hintsLeft > 0 && game.turn() === 'w' && !game.isGameOver()
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {hintsLeft > 0 ? 'Get Perfect Move Hint' : 'No Hints Left'}
            </button>
          </div>
          
          <button 
            onClick={() => {
                const newGame = new Chess();
                setGame(newGame);
                setFen(newGame.fen());
                setHintsLeft(3);
                setStatus('');
                setBestMove(null);
            }}
            className="mt-auto bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded font-bold transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Completion1;

