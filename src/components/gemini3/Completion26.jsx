import React, { useState, useEffect, useRef } from 'react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DDA0DD',
  '#FFD700', '#87CEFA', '#F08080', '#90EE90', '#DB7093', '#20B2AA',
  '#FF6347', '#BA55D3', '#3CB371', '#6495ED'
];

const Completion26 = () => {
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]); // Array of arrays of matches
  const [tournamentStatus, setTournamentStatus] = useState('idle'); // idle, playing, finished
  const [champion, setChampion] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [logs, setLogs] = useState([]);

  // Generate 16 random players
  const generatePlayers = () => {
    const newPlayers = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      skill: Math.floor(Math.random() * 90) + 10, // Skill 10-99
      color: COLORS[i % COLORS.length],
      status: 'active'
    }));

    // Sort slightly to mix them up visually if needed, but random is fine
    setPlayers(newPlayers);

    // Create first round matches
    const round1 = [];
    for (let i = 0; i < newPlayers.length; i += 2) {
      round1.push({
        p1: newPlayers[i],
        p2: newPlayers[i + 1],
        winner: null,
        id: `r1-${i / 2}`
      });
    }

    setRounds([round1]); // Start with just round 1
    setTournamentStatus('idle');
    setChampion(null);
    setLogs([]);
  };

  useEffect(() => {
    generatePlayers();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const simulateMatch = (match) => {
    if (!match.p1 || !match.p2) return match.p1 || match.p2; // Bye scenarios if odd number (not here though)

    const skillA = match.p1.skill;
    const skillB = match.p2.skill;

    // The core mechanic: Inverse probability
    // Probability A wins = 1 - (A / (A + B)) = B / (A + B)
    // Actually, let's make it clearer: 
    // Chance to win is inversely proportional to skill.
    // Weight A = 1/skillA, Weight B = 1/skillB
    // Prob A = Weight A / (Weight A + Weight B)

    const weightA = 1000 / skillA;
    const weightB = 1000 / skillB;
    const totalWeight = weightA + weightB;
    const probA = weightA / totalWeight;

    const roll = Math.random();
    const winner = roll < probA ? match.p1 : match.p2;
    const loser = winner === match.p1 ? match.p2 : match.p1;

    addLog(`Match: ${match.p1.name} (${match.p1.skill}) vs ${match.p2.name} (${match.p2.skill}). Winner: ${winner.name}! (Odds: ${(probA * 100).toFixed(1)}% vs ${((1 - probA) * 100).toFixed(1)}%)`);

    return { ...match, winner };
  };

  const advanceTournament = () => {
    if (tournamentStatus === 'finished') return;

    setTournamentStatus('playing');

    const currentRoundIdx = rounds.findIndex(r => r.some(m => !m.winner));

    if (currentRoundIdx === -1) {
      // All matches in current rounds are done, need to generate next round?
      // Check if we have a champion
      const lastRound = rounds[rounds.length - 1];
      if (lastRound.length === 1 && lastRound[0].winner) {
        setChampion(lastRound[0].winner);
        setTournamentStatus('finished');
        setAutoPlay(false);
        addLog(`🏆 CHAMPION: ${lastRound[0].winner.name} with skill ${lastRound[0].winner.skill}!`);
        return;
      }

      // Generate next round
      const winners = lastRound.map(m => m.winner);
      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextRoundMatches.push({
          p1: winners[i],
          p2: winners[i + 1],
          winner: null,
          id: `r${rounds.length + 1}-${i / 2}`
        });
      }
      setRounds([...rounds, nextRoundMatches]);
    } else {
      // Play next match in current round
      const currentRound = rounds[currentRoundIdx];
      const matchIdx = currentRound.findIndex(m => !m.winner);

      const match = currentRound[matchIdx];
      const completedMatch = simulateMatch(match);

      const newRound = [...currentRound];
      newRound[matchIdx] = completedMatch;

      const newRounds = [...rounds];
      newRounds[currentRoundIdx] = newRound;
      setRounds(newRounds);
    }
  };

  // Auto play effect
  useEffect(() => {
    let timer;
    if (autoPlay && tournamentStatus !== 'finished') {
      timer = setTimeout(advanceTournament, 800); // Speed of simulation
    }
    return () => clearTimeout(timer);
  }, [autoPlay, rounds, tournamentStatus]);

  const getConnectorPath = (roundIndex, matchIndex, totalMatchesInRound) => {
    // Crude SVG path logic for brackets - strictly decorative
    // Not critical for logic, implementing basic boxes instead usually easier
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
            The Underdog Championship
          </h1>
          <p className="text-gray-400 mt-2">Where skill is a liability.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={generatePlayers}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full font-bold transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setAutoPlay(!autoPlay);
              if (tournamentStatus === 'idle') advanceTournament();
            }}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${autoPlay ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {autoPlay ? 'Pause' : 'Start / Auto'}
          </button>
          <button
            onClick={() => {
              setAutoPlay(false);
              advanceTournament();
            }}
            disabled={tournamentStatus === 'finished'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-colors disabled:opacity-50"
          >
            Next Match
          </button>
        </div>
      </div>

      <div className="flex flex-grow gap-8 overflow-x-auto pb-8">
        {/* Bracket View */}
        <div className="flex gap-16 items-center">
          {rounds.map((round, rIdx) => (
            <div key={rIdx} className="flex flex-col justify-around h-full gap-8">
              <h3 className="text-center text-gray-500 uppercase tracking-widest text-sm mb-4 absolute top-32">
                {rIdx === rounds.length - 1 && rounds.length === 4 ? 'Finals' : `Round ${rIdx + 1}`}
              </h3>
              {round.map((match, mIdx) => (
                <div key={match.id} className="relative flex flex-col justify-center">
                  <RoundMatch
                    match={match}
                    isActive={!match.winner && rounds.findIndex(r => r.some(m => !m.winner)) === rIdx && round.findIndex(m => !m.winner) === mIdx}
                  />
                  {/* Connectors could go here */}
                </div>
              ))}
            </div>
          ))}
          {champion && (
            <div className="flex flex-col items-center justify-center animate-bounce ml-8">
              <div className="text-6xl mb-4">🏆</div>
              <div
                className="text-2xl font-bold px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.5)] border-4 border-yellow-400"
                style={{ backgroundColor: champion.color, color: '#000' }}
              >
                {champion.name}
              </div>
              <div className="mt-2 text-yellow-400 font-mono">Skill: {champion.skill}</div>
            </div>
          )}
        </div>
      </div>

      {/* Logs / Info Panel */}
      <div className="fixed bottom-8 right-8 w-96 bg-gray-800 bg-opacity-90 rounded-xl p-4 max-h-64 overflow-y-auto border border-gray-700 shadow-2xl backdrop-blur-sm">
        <h3 className="font-bold text-gray-300 mb-2 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">Tournament Logs</h3>
        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-400 border-b border-gray-700/50 pb-1">
              {log}
            </div>
          ))}
          {logs.length === 0 && <div className="text-gray-600 italic">Waiting for tournament to start...</div>}
        </div>
      </div>

      {/* Rule Explanation */}
      <div className="fixed top-24 right-8 w-64 text-xs text-gray-500 bg-gray-900/80 p-4 rounded-lg border border-gray-800">
        <p><strong>Win Probability Rule:</strong></p>
        <p className="mt-1">P(A wins) = Skill(B) / (Skill(A) + Skill(B))</p>
        <p className="mt-2 italic">A player with 10 skill implies they are "terrible". A player with 90 skill is "excellent". In this tournament, the terrible player has a 90% chance vs the pro.</p>
      </div>

    </div>
  );
};

const RoundMatch = ({ match, isActive }) => {
  const getBorder = (player) => {
    if (!match.winner) return 'border-transparent';
    return match.winner === player ? 'border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'border-transparent opacity-40 grayscale';
  };

  return (
    <div className={`w-48 bg-gray-800 rounded-lg overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-blue-500 scale-105 shadow-xl' : 'border-gray-700'}`}>
      <PlayerRow player={match.p1} statusClass={getBorder(match.p1)} />
      <div className="h-[1px] bg-gray-700 w-full" />
      <PlayerRow player={match.p2} statusClass={getBorder(match.p2)} />
    </div>
  );
};

const PlayerRow = ({ player, statusClass }) => (
  <div className={`flex items-center justify-between p-3 ${statusClass} transition-all duration-500`}>
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: player.color }}
      />
      <span className="font-bold text-sm truncate w-24">{player.name}</span>
    </div>
    <span className="text-xs font-mono text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded">
      {player.skill}
    </span>
  </div>
);

export default Completion26;
