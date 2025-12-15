import React, { useState, useCallback, useMemo } from 'react';

// Player names for the tournament
const PLAYER_NAMES = [
  'Dragon',
  'Phoenix',
  'Tiger',
  'Wolf',
  'Eagle',
  'Shark',
  'Falcon',
  'Panther',
  'Viper',
  'Bear',
  'Hawk',
  'Lion',
  'Cobra',
  'Jaguar',
  'Raven',
  'Lynx',
];

// Generate initial players with skill ratings
const generatePlayers = (count) => {
  return PLAYER_NAMES.slice(0, count).map((name, index) => ({
    id: index,
    name,
    skill: 50 + Math.floor(Math.random() * 50), // Skill 50-99
    wins: 0,
    losses: 0,
    loserPoints: 0, // Points for being an underdog
    eliminated: false,
  }));
};

// Calculate win probability based on skill difference
// In loser tournament, lower skill = advantage
const calculateWinProbability = (player1, player2, loserAdvantage) => {
  const skillDiff = player2.skill - player1.skill; // Reversed: lower skill is better
  const adjustedDiff = skillDiff * loserAdvantage;
  const probability = 1 / (1 + Math.pow(10, -adjustedDiff / 100));
  return Math.max(0.1, Math.min(0.9, probability)); // Clamp between 10-90%
};

// Simulate a match
const simulateMatch = (player1, player2, loserAdvantage) => {
  const prob = calculateWinProbability(player1, player2, loserAdvantage);
  const rand = Math.random();
  const winner = rand < prob ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;

  // Calculate loser points bonus (bigger bonus for beating higher-skilled opponents)
  const skillDiff = Math.max(0, loser.skill - winner.skill);
  const loserPointsGained = Math.floor(skillDiff / 5) + 1;

  return {
    winner,
    loser,
    probability: prob,
    upset: winner.skill < loser.skill,
    loserPointsGained,
  };
};

// Tournament formats
const TOURNAMENT_FORMATS = {
  SINGLE_ELIMINATION: 'Single Elimination (Reversed)',
  DOUBLE_ELIMINATION: 'Double Elimination Loser Bracket',
  SWISS: 'Swiss System (Worst Record Wins)',
  ROUND_ROBIN: 'Round Robin (Loser Points)',
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    minHeight: '100vh',
    color: '#eee',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    background: 'linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#888',
    fontSize: '1.1rem',
  },
  controls: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  select: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#2d3436',
    color: '#fff',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 25px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    background: 'linear-gradient(90deg, #6bcb77, #4ecdc4)',
    color: '#fff',
  },
  secondaryButton: {
    background: 'linear-gradient(90deg, #ff6b6b, #ee5a24)',
    color: '#fff',
  },
  disabledButton: {
    background: '#444',
    color: '#888',
    cursor: 'not-allowed',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#2d3436',
    padding: '10px 15px',
    borderRadius: '8px',
  },
  slider: {
    width: '100px',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  playerCard: {
    padding: '15px',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  playerName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  playerStat: {
    fontSize: '0.85rem',
    color: '#aaa',
    marginBottom: '4px',
  },
  playerSkill: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  matchesSection: {
    marginTop: '30px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    color: '#ffd93d',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  matchCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px',
  },
  matchPlayer: {
    flex: '1',
    minWidth: '120px',
    textAlign: 'center',
    padding: '10px',
    borderRadius: '8px',
  },
  vsText: {
    fontSize: '1.2rem',
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  matchResult: {
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(107, 203, 119, 0.2)',
    color: '#6bcb77',
    fontWeight: 'bold',
  },
  upsetBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    background: 'linear-gradient(90deg, #ff6b6b, #ffd93d)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#000',
    marginLeft: '10px',
  },
  bracket: {
    display: 'flex',
    gap: '30px',
    overflowX: 'auto',
    padding: '20px 0',
  },
  bracketRound: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '200px',
  },
  bracketMatch: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  bracketPlayer: {
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  winnerHighlight: {
    background: 'rgba(107, 203, 119, 0.3)',
    border: '2px solid #6bcb77',
  },
  loserHighlight: {
    background: 'rgba(255, 107, 107, 0.2)',
    opacity: 0.7,
  },
  leaderboard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
  },
  leaderboardRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'all 0.3s ease',
  },
  rank: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    width: '50px',
  },
  trophy: {
    fontSize: '1.5rem',
    marginRight: '10px',
  },
  explanation: {
    background: 'rgba(255, 217, 61, 0.1)',
    border: '1px solid #ffd93d',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
  },
  explanationTitle: {
    color: '#ffd93d',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};

// Player Card Component
const PlayerCard = ({ player, isChampion }) => {
  const bgColor = player.eliminated
    ? 'rgba(100,100,100,0.3)'
    : `rgba(${255 - player.skill * 2}, ${player.skill * 2}, 100, 0.3)`;

  const skillColor = player.skill < 60 ? '#6bcb77' : player.skill < 80 ? '#ffd93d' : '#ff6b6b';

  return (
    <div
      style={{
        ...styles.playerCard,
        background: bgColor,
        border: isChampion ? '3px solid #ffd93d' : '1px solid rgba(255,255,255,0.1)',
        transform: isChampion ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {isChampion && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            fontSize: '2rem',
          }}
        >
          👑
        </div>
      )}
      <div style={styles.playerName}>
        {player.eliminated ? '💀' : '🎮'} {player.name}
      </div>
      <div style={styles.playerStat}>
        W: {player.wins} / L: {player.losses}
      </div>
      <div style={styles.playerStat}>Loser Points: {player.loserPoints}</div>
      <div style={{ ...styles.playerSkill, background: skillColor + '40' }}>
        Skill: {player.skill}
      </div>
    </div>
  );
};

// Match Card Component
const MatchCard = ({ match }) => {
  return (
    <div style={styles.matchCard}>
      <div
        style={{
          ...styles.matchPlayer,
          background:
            match.winner?.id === match.player1.id
              ? 'rgba(107, 203, 119, 0.3)'
              : 'rgba(255, 107, 107, 0.2)',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{match.player1.name}</div>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>Skill: {match.player1.skill}</div>
      </div>
      <div style={styles.vsText}>⚔️ VS ⚔️</div>
      <div
        style={{
          ...styles.matchPlayer,
          background:
            match.winner?.id === match.player2.id
              ? 'rgba(107, 203, 119, 0.3)'
              : 'rgba(255, 107, 107, 0.2)',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{match.player2.name}</div>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>Skill: {match.player2.skill}</div>
      </div>
      {match.winner && (
        <div style={styles.matchResult}>
          🏆 {match.winner.name}
          {match.upset && <span style={styles.upsetBadge}>🔥 UPSET!</span>}
        </div>
      )}
    </div>
  );
};

// Bracket View Component
const BracketView = ({ rounds }) => {
  return (
    <div style={styles.bracket}>
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex}>
          <div style={{ textAlign: 'center', marginBottom: '10px', color: '#888' }}>
            Round {roundIndex + 1}
          </div>
          <div style={styles.bracketRound}>
            {round.map((match, matchIndex) => (
              <div key={matchIndex} style={styles.bracketMatch}>
                <div
                  style={{
                    ...styles.bracketPlayer,
                    ...(match.winner?.id === match.player1.id
                      ? styles.winnerHighlight
                      : match.winner
                        ? styles.loserHighlight
                        : {}),
                  }}
                >
                  <span>{match.player1.name}</span>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{match.player1.skill}</span>
                </div>
                <div
                  style={{
                    ...styles.bracketPlayer,
                    ...(match.winner?.id === match.player2.id
                      ? styles.winnerHighlight
                      : match.winner
                        ? styles.loserHighlight
                        : {}),
                  }}
                >
                  <span>{match.player2.name}</span>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{match.player2.skill}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Leaderboard Component
const Leaderboard = ({ players, format }) => {
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // In loser tournament, we want worst performers (by traditional metrics) to win
      if (format === TOURNAMENT_FORMATS.ROUND_ROBIN) {
        // Loser points take priority
        if (b.loserPoints !== a.loserPoints) return b.loserPoints - a.loserPoints;
        // Then by losses (more losses = better in loser tournament)
        if (b.losses !== a.losses) return b.losses - a.losses;
        // Lower skill is tie-breaker
        return a.skill - b.skill;
      } else if (format === TOURNAMENT_FORMATS.SWISS) {
        // Swiss: worst win-loss record wins
        const aRecord = a.wins - a.losses;
        const bRecord = b.wins - b.losses;
        if (aRecord !== bRecord) return aRecord - bRecord; // Lower record is better
        return a.skill - b.skill;
      }
      // Default: loser points
      return b.loserPoints - a.loserPoints;
    });
  }, [players, format]);

  const getTrophyIcon = (index) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getRowColor = (index) => {
    if (index === 0) return 'rgba(255, 217, 61, 0.3)';
    if (index === 1) return 'rgba(192, 192, 192, 0.2)';
    if (index === 2) return 'rgba(205, 127, 50, 0.2)';
    return 'rgba(255,255,255,0.05)';
  };

  return (
    <div style={styles.leaderboard}>
      <div style={styles.sectionTitle}>🏅 Loser Tournament Standings</div>
      {sortedPlayers.slice(0, 8).map((player, index) => (
        <div
          key={player.id}
          style={{
            ...styles.leaderboardRow,
            background: getRowColor(index),
          }}
        >
          <div style={styles.rank}>{getTrophyIcon(index)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{player.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>
              Skill: {player.skill} | W: {player.wins} L: {player.losses} | Loser Pts:{' '}
              {player.loserPoints}
            </div>
          </div>
          {index === 0 && <span style={styles.trophy}>👑</span>}
        </div>
      ))}
    </div>
  );
};

const Completion26 = () => {
  const [players, setPlayers] = useState(() => generatePlayers(16));
  const [format, setFormat] = useState(TOURNAMENT_FORMATS.ROUND_ROBIN);
  const [loserAdvantage, setLoserAdvantage] = useState(1.5);
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [_currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tournamentComplete, setTournamentComplete] = useState(false);

  // Reset tournament
  const resetTournament = useCallback(() => {
    setPlayers(generatePlayers(16));
    setMatches([]);
    setRounds([]);
    setCurrentRound(0);
    setIsRunning(false);
    setTournamentComplete(false);
  }, []);

  // Run single elimination tournament
  const runSingleElimination = useCallback(() => {
    setIsRunning(true);
    let currentPlayers = [...players];
    const allRounds = [];

    const runRound = (roundPlayers) => {
      const roundMatches = [];
      const nextRoundPlayers = [];

      for (let i = 0; i < roundPlayers.length; i += 2) {
        const p1 = roundPlayers[i];
        const p2 = roundPlayers[i + 1];

        if (!p2) {
          nextRoundPlayers.push(p1);
          continue;
        }

        const result = simulateMatch(p1, p2, loserAdvantage);

        // In reversed single elimination, the LOSER advances
        roundMatches.push({
          player1: p1,
          player2: p2,
          winner: result.loser, // Loser advances in loser tournament!
          loser: result.winner,
          upset: result.upset,
        });

        // Update player stats
        result.winner.wins++;
        result.loser.losses++;
        result.loser.loserPoints += result.loserPointsGained;

        nextRoundPlayers.push(result.loser); // Loser advances
        result.winner.eliminated = true; // Winner is eliminated!
      }

      allRounds.push(roundMatches);
      return nextRoundPlayers;
    };

    // Shuffle players for bracket
    currentPlayers = currentPlayers.sort(() => Math.random() - 0.5);

    let roundNum = 1;
    while (currentPlayers.length > 1) {
      currentPlayers = runRound(currentPlayers, roundNum);
      roundNum++;
    }

    setRounds(allRounds);
    setPlayers([...players]);
    setTournamentComplete(true);
    setIsRunning(false);
  }, [players, loserAdvantage]);

  // Run round robin tournament
  const runRoundRobin = useCallback(() => {
    setIsRunning(true);
    const allMatches = [];
    const updatedPlayers = [...players];

    // Generate all pairings
    for (let i = 0; i < updatedPlayers.length; i++) {
      for (let j = i + 1; j < updatedPlayers.length; j++) {
        const p1 = updatedPlayers[i];
        const p2 = updatedPlayers[j];

        const result = simulateMatch(p1, p2, loserAdvantage);

        allMatches.push({
          player1: p1,
          player2: p2,
          winner: result.winner,
          loser: result.loser,
          upset: result.upset,
        });

        // Update stats
        result.winner.wins++;
        result.loser.losses++;
        result.loser.loserPoints += result.loserPointsGained;
      }
    }

    setMatches(allMatches);
    setPlayers(updatedPlayers);
    setTournamentComplete(true);
    setIsRunning(false);
  }, [players, loserAdvantage]);

  // Run Swiss system tournament
  const runSwiss = useCallback(() => {
    setIsRunning(true);
    const updatedPlayers = [...players];
    const allRounds = [];
    const numRounds = Math.ceil(Math.log2(updatedPlayers.length));

    for (let round = 0; round < numRounds; round++) {
      // Sort by current record (worst record = paired together)
      updatedPlayers.sort((a, b) => {
        const aRecord = a.wins - a.losses;
        const bRecord = b.wins - b.losses;
        return aRecord - bRecord;
      });

      const roundMatches = [];
      const paired = new Set();

      for (let i = 0; i < updatedPlayers.length; i++) {
        if (paired.has(updatedPlayers[i].id)) continue;

        for (let j = i + 1; j < updatedPlayers.length; j++) {
          if (paired.has(updatedPlayers[j].id)) continue;

          const p1 = updatedPlayers[i];
          const p2 = updatedPlayers[j];

          paired.add(p1.id);
          paired.add(p2.id);

          const result = simulateMatch(p1, p2, loserAdvantage);

          roundMatches.push({
            player1: p1,
            player2: p2,
            winner: result.winner,
            loser: result.loser,
            upset: result.upset,
          });

          result.winner.wins++;
          result.loser.losses++;
          result.loser.loserPoints += result.loserPointsGained;

          break;
        }
      }

      allRounds.push(roundMatches);
    }

    setRounds(allRounds);
    setPlayers(updatedPlayers);
    setTournamentComplete(true);
    setIsRunning(false);
  }, [players, loserAdvantage]);

  // Start tournament based on format
  const startTournament = useCallback(() => {
    switch (format) {
      case TOURNAMENT_FORMATS.SINGLE_ELIMINATION:
        runSingleElimination();
        break;
      case TOURNAMENT_FORMATS.ROUND_ROBIN:
        runRoundRobin();
        break;
      case TOURNAMENT_FORMATS.SWISS:
        runSwiss();
        break;
      default:
        runRoundRobin();
    }
  }, [format, runSingleElimination, runRoundRobin, runSwiss]);

  // Find champion (lowest skilled player who did best)
  const champion = useMemo(() => {
    if (!tournamentComplete) return null;

    const sorted = [...players].sort((a, b) => {
      if (format === TOURNAMENT_FORMATS.SINGLE_ELIMINATION) {
        return a.eliminated ? 1 : -1;
      }
      if (b.loserPoints !== a.loserPoints) return b.loserPoints - a.loserPoints;
      return a.skill - b.skill;
    });

    return sorted[0];
  }, [players, tournamentComplete, format]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏆 Loser Tournament 🏆</h1>
        <p style={styles.subtitle}>Where the worst players have the best chance of winning!</p>
      </header>

      <div style={styles.explanation}>
        <h3 style={styles.explanationTitle}>📖 How It Works</h3>
        <p>
          In a <strong>Loser Tournament</strong>, the rules are flipped! Lower skill = Higher win
          probability. The system gives underdogs a massive advantage. Points are awarded based on
          beating higher-skilled opponents.
        </p>
        <ul style={{ marginTop: '10px', color: '#ccc' }}>
          <li>
            <strong>Loser Advantage</strong>: How much lower skill helps (1.0 = balanced, 2.0 = huge
            underdog boost)
          </li>
          <li>
            <strong>Loser Points</strong>: Bonus points for losing to higher-skilled players
          </li>
          <li>
            <strong>Reversed Elimination</strong>: In single elimination, the LOSER advances!
          </li>
        </ul>
      </div>

      <div style={styles.controls}>
        <select
          style={styles.select}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          disabled={isRunning}
        >
          {Object.values(TOURNAMENT_FORMATS).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div style={styles.sliderContainer}>
          <span>Loser Advantage:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={loserAdvantage}
            onChange={(e) => setLoserAdvantage(parseFloat(e.target.value))}
            style={styles.slider}
            disabled={isRunning}
          />
          <span>{loserAdvantage.toFixed(1)}x</span>
        </div>

        <button
          style={{
            ...styles.button,
            ...(isRunning ? styles.disabledButton : styles.primaryButton),
          }}
          onClick={startTournament}
          disabled={isRunning || tournamentComplete}
        >
          {isRunning ? '⏳ Running...' : '▶️ Start Tournament'}
        </button>

        <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={resetTournament}>
          🔄 Reset
        </button>
      </div>

      <div style={styles.playersGrid}>
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} isChampion={champion?.id === player.id} />
        ))}
      </div>

      {tournamentComplete && <Leaderboard players={players} format={format} />}

      {rounds.length > 0 && (
        <div style={styles.matchesSection}>
          <div style={styles.sectionTitle}>
            📊 Tournament Bracket
            {format === TOURNAMENT_FORMATS.SINGLE_ELIMINATION && ' (Losers Advance!)'}
          </div>
          <BracketView rounds={rounds} />
        </div>
      )}

      {matches.length > 0 && rounds.length === 0 && (
        <div style={styles.matchesSection}>
          <div style={styles.sectionTitle}>⚔️ Match Results</div>
          {matches.slice(0, 20).map((match, index) => (
            <MatchCard key={index} match={match} roundNum={1} />
          ))}
          {matches.length > 20 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              ... and {matches.length - 20} more matches
            </div>
          )}
        </div>
      )}

      {tournamentComplete && champion && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background:
              'linear-gradient(135deg, rgba(255, 217, 61, 0.2), rgba(107, 203, 119, 0.2))',
            borderRadius: '20px',
            marginTop: '30px',
          }}
        >
          <div style={{ fontSize: '4rem' }}>👑</div>
          <h2
            style={{
              fontSize: '2rem',
              background: 'linear-gradient(90deg, #ffd93d, #6bcb77)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Champion: {champion.name}!
          </h2>
          <p style={{ color: '#888', marginTop: '10px' }}>
            Original Skill: {champion.skill} | Loser Points: {champion.loserPoints} | Final Record:{' '}
            {champion.wins}W - {champion.losses}L
          </p>
          <p style={{ color: '#6bcb77', marginTop: '10px', fontStyle: 'italic' }}>
            The best loser wins! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default Completion26;
