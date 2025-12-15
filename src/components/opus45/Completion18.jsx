import React, { useState, useEffect, useCallback } from 'react';

// Startup name generators
const adjectives = [
  'Quick',
  'Smart',
  'Cloud',
  'Data',
  'Cyber',
  'Digital',
  'Meta',
  'Quantum',
  'Neural',
  'Hyper',
  'Ultra',
  'Mega',
  'Super',
  'Turbo',
  'Flash',
  'Swift',
  'Rapid',
  'Prime',
  'Alpha',
  'Beta',
];
const nouns = [
  'AI',
  'Tech',
  'Labs',
  'Systems',
  'Networks',
  'Solutions',
  'Dynamics',
  'Ventures',
  'Innovations',
  'Analytics',
  'Robotics',
  'Metrics',
  'Logic',
  'Sync',
  'Stack',
  'Flow',
  'Base',
  'Hub',
  'Link',
  'Wave',
];
const sectors = [
  'AI/ML',
  'FinTech',
  'HealthTech',
  'EdTech',
  'CleanTech',
  'SaaS',
  'E-commerce',
  'Gaming',
  'Cybersecurity',
  'IoT',
  'Blockchain',
  'SpaceTech',
];

const generateStartupName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
};

const generateStartup = (id) => {
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const quality = Math.random(); // 0-1, affects success probability
  return {
    id,
    name: generateStartupName(),
    sector,
    quality,
    stage: 'seed',
    valuation: Math.floor(1 + Math.random() * 4) * 1000000, // $1M - $5M
    monthsAlive: 0,
    status: 'active', // active, acquired, dead, ipo
    fundingRounds: 0,
    totalRaised: 0,
    employees: Math.floor(2 + Math.random() * 8),
    revenue: 0,
    growth: 0.1 + Math.random() * 0.3, // monthly growth rate
  };
};

const stages = ['seed', 'series-a', 'series-b', 'series-c', 'series-d', 'pre-ipo'];

const formatMoney = (amount) => {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '15px 25px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#aaa',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    color: '#fff',
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  startupName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  sector: {
    fontSize: '0.75rem',
    background: 'rgba(124, 58, 237, 0.3)',
    padding: '4px 10px',
    borderRadius: '12px',
    color: '#c4b5fd',
  },
  stage: {
    fontSize: '0.7rem',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px',
  },
  metric: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '10px',
    borderRadius: '8px',
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: '#888',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  investButton: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  portfolio: {
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '30px',
    border: '1px solid rgba(0, 212, 255, 0.2)',
  },
  portfolioTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px',
    color: '#00d4ff',
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  portfolioItem: {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '15px',
    borderRadius: '10px',
  },
  eventLog: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '15px',
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: '20px',
  },
  eventItem: {
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize: '0.85rem',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
};

const Completion18 = () => {
  const [fund, setFund] = useState({
    cash: 10000000, // $10M initial fund
    totalInvested: 0,
    totalReturns: 0,
    investments: [], // { startupId, amount, shares, investedAt }
  });
  const [startups, setStartups] = useState(() =>
    Array.from({ length: 12 }, (_, i) => generateStartup(i))
  );
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [activeTab, setActiveTab] = useState('market');
  const [gameOver, setGameOver] = useState(false);

  const addEvent = useCallback(
    (message, type = 'info') => {
      setEvents((prev) =>
        [
          {
            id: Date.now(),
            message,
            type,
            month,
          },
          ...prev,
        ].slice(0, 50)
      );
    },
    [month]
  );

  const invest = useCallback(
    (startup, amount) => {
      if (fund.cash < amount || startup.status !== 'active') return;

      const shares = amount / startup.valuation;

      setFund((prev) => ({
        ...prev,
        cash: prev.cash - amount,
        totalInvested: prev.totalInvested + amount,
        investments: [
          ...prev.investments,
          {
            startupId: startup.id,
            startupName: startup.name,
            amount,
            shares,
            investedAt: month,
            valuationAtInvestment: startup.valuation,
          },
        ],
      }));

      addEvent(
        `💰 Invested ${formatMoney(amount)} in ${startup.name} for ${(shares * 100).toFixed(2)}% equity`,
        'investment'
      );
    },
    [fund.cash, month, addEvent]
  );

  const simulateMonth = useCallback(() => {
    setMonth((m) => {
      const newMonth = m + 1;
      // Check game over at 120 months (10 years)
      if (newMonth >= 120) {
        setIsRunning(false);
        setGameOver(true);
      }
      return newMonth;
    });

    setStartups((prevStartups) => {
      const newStartups = [...prevStartups];
      const startupsToAdd = [];

      newStartups.forEach((startup) => {
        if (startup.status !== 'active') return;

        startup.monthsAlive++;

        // Revenue growth
        startup.revenue = Math.floor(
          startup.revenue * (1 + startup.growth) + startup.quality * 50000 * Math.random()
        );

        // Employee growth
        if (Math.random() < 0.1 && startup.revenue > 100000) {
          startup.employees = Math.min(startup.employees + Math.floor(1 + Math.random() * 3), 1000);
        }

        // Valuation update based on revenue and stage
        const revenueMultiple = 10 + startup.quality * 20;
        startup.valuation = Math.max(
          startup.valuation,
          startup.revenue * 12 * revenueMultiple,
          startup.valuation * (1 + (Math.random() - 0.3) * 0.1)
        );

        // Funding round probability
        const fundingProb = 0.03 * startup.quality + (startup.monthsAlive > 12 ? 0.02 : 0);
        if (Math.random() < fundingProb && startup.stage !== 'pre-ipo') {
          const stageIndex = stages.indexOf(startup.stage);
          if (stageIndex < stages.length - 1) {
            startup.stage = stages[stageIndex + 1];
            startup.fundingRounds++;
            const raiseAmount = startup.valuation * (0.2 + Math.random() * 0.1);
            startup.totalRaised += raiseAmount;
            startup.valuation *= 1.5 + Math.random() * 0.5;
            addEvent(
              `🚀 ${startup.name} raised ${formatMoney(raiseAmount)} at ${formatMoney(startup.valuation)} (${startup.stage})`,
              'funding'
            );
          }
        }

        // Acquisition probability (increases with valuation and quality)
        const acquireProb = startup.quality * 0.01 * (startup.valuation > 100000000 ? 2 : 1);
        if (Math.random() < acquireProb && startup.stage !== 'seed') {
          const acquireMultiple = 1.5 + Math.random() * 2;
          const exitValuation = startup.valuation * acquireMultiple;
          startup.status = 'acquired';
          startup.exitValuation = exitValuation;
          addEvent(`🎉 ${startup.name} acquired for ${formatMoney(exitValuation)}!`, 'exit');

          // Calculate returns for fund
          setFund((prev) => {
            const investment = prev.investments.find((inv) => inv.startupId === startup.id);
            if (investment) {
              const returnAmount = investment.shares * exitValuation;
              return {
                ...prev,
                cash: prev.cash + returnAmount,
                totalReturns: prev.totalReturns + returnAmount,
              };
            }
            return prev;
          });
        }

        // IPO probability
        const ipoProb = startup.stage === 'pre-ipo' ? 0.05 : 0;
        if (Math.random() < ipoProb) {
          const ipoMultiple = 2 + Math.random() * 3;
          const exitValuation = startup.valuation * ipoMultiple;
          startup.status = 'ipo';
          startup.exitValuation = exitValuation;
          addEvent(`🔔 ${startup.name} IPO at ${formatMoney(exitValuation)}!`, 'exit');

          setFund((prev) => {
            const investment = prev.investments.find((inv) => inv.startupId === startup.id);
            if (investment) {
              const returnAmount = investment.shares * exitValuation;
              return {
                ...prev,
                cash: prev.cash + returnAmount,
                totalReturns: prev.totalReturns + returnAmount,
              };
            }
            return prev;
          });
        }

        // Death probability (decreases with quality and stage)
        const deathProb = (1 - startup.quality) * 0.02 * (startup.revenue < 10000 ? 2 : 1);
        if (Math.random() < deathProb) {
          startup.status = 'dead';
          addEvent(`💀 ${startup.name} shut down`, 'death');
        }
      });

      // Spawn new startups occasionally
      if (Math.random() < 0.15) {
        const newStartup = generateStartup(Date.now());
        startupsToAdd.push(newStartup);
        addEvent(`🌱 New startup ${newStartup.name} enters the market`, 'new');
      }

      return [...newStartups, ...startupsToAdd];
    });
  }, [addEvent]);

  // Auto-simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(simulateMonth, speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, simulateMonth]);

  const activeStartups = startups.filter((s) => s.status === 'active');
  const exitedStartups = startups.filter((s) => s.status === 'acquired' || s.status === 'ipo');
  const deadStartups = startups.filter((s) => s.status === 'dead');

  const portfolioValue = fund.investments.reduce((sum, inv) => {
    const startup = startups.find((s) => s.id === inv.startupId);
    if (!startup) return sum;
    if (startup.status === 'active') {
      return sum + inv.shares * startup.valuation;
    }
    if (startup.status === 'acquired' || startup.status === 'ipo') {
      return sum + inv.shares * startup.exitValuation;
    }
    return sum;
  }, 0);

  const totalValue = fund.cash + portfolioValue;
  const roi = (((totalValue - 10000000) / 10000000) * 100).toFixed(1);

  const resetGame = () => {
    setFund({
      cash: 10000000,
      totalInvested: 0,
      totalReturns: 0,
      investments: [],
    });
    setStartups(Array.from({ length: 12 }, (_, i) => generateStartup(i)));
    setEvents([]);
    setMonth(0);
    setIsRunning(false);
    setGameOver(false);
  };

  const getStageColor = (stage) => {
    const colors = {
      seed: '#22c55e',
      'series-a': '#3b82f6',
      'series-b': '#8b5cf6',
      'series-c': '#f59e0b',
      'series-d': '#ef4444',
      'pre-ipo': '#ec4899',
    };
    return colors[stage] || '#888';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#22c55e',
      acquired: '#3b82f6',
      ipo: '#f59e0b',
      dead: '#ef4444',
    };
    return colors[status] || '#888';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💼 VC Simulator</h1>
        <p style={{ color: '#aaa' }}>
          Build your venture capital empire • Year {Math.floor(month / 12) + 1}, Month{' '}
          {(month % 12) + 1}
        </p>
      </div>

      {/* Fund Stats */}
      <div style={styles.stats}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Fund Cash</div>
          <div style={styles.statValue}>{formatMoney(fund.cash)}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Portfolio Value</div>
          <div style={styles.statValue}>{formatMoney(portfolioValue)}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Total Value</div>
          <div
            style={{ ...styles.statValue, color: totalValue >= 10000000 ? '#22c55e' : '#ef4444' }}
          >
            {formatMoney(totalValue)}
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>ROI</div>
          <div style={{ ...styles.statValue, color: parseFloat(roi) >= 0 ? '#22c55e' : '#ef4444' }}>
            {roi}%
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Investments</div>
          <div style={styles.statValue}>{fund.investments.length}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Active Startups</div>
          <div style={styles.statValue}>{activeStartups.length}</div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={simulateMonth}
          disabled={isRunning}
        >
          ⏭️ Next Month
        </button>
        <select
          style={{ ...styles.button, ...styles.secondaryButton, cursor: 'pointer' }}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={2000}>🐢 Slow</option>
          <option value={1000}>🚶 Normal</option>
          <option value={500}>🏃 Fast</option>
          <option value={200}>🚀 Very Fast</option>
        </select>
        <button style={{ ...styles.button, ...styles.dangerButton }} onClick={resetGame}>
          🔄 Reset
        </button>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: '40px',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '500px',
            }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>🎮 Game Over!</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>10 Years Complete</p>
            <p style={{ fontSize: '2rem', color: '#00d4ff', marginBottom: '10px' }}>
              Final Value: {formatMoney(totalValue)}
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                color: parseFloat(roi) >= 0 ? '#22c55e' : '#ef4444',
                marginBottom: '20px',
              }}
            >
              ROI: {roi}%
            </p>
            <p style={{ marginBottom: '10px' }}>Exits: {exitedStartups.length}</p>
            <p style={{ marginBottom: '20px' }}>Failures: {deadStartups.length}</p>
            <button style={{ ...styles.button, ...styles.primaryButton }} onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            background:
              activeTab === 'market'
                ? 'linear-gradient(135deg, #00d4ff, #7c3aed)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
          onClick={() => setActiveTab('market')}
        >
          📊 Market ({activeStartups.length})
        </button>
        <button
          style={{
            ...styles.tab,
            background:
              activeTab === 'portfolio'
                ? 'linear-gradient(135deg, #00d4ff, #7c3aed)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
          onClick={() => setActiveTab('portfolio')}
        >
          💼 Portfolio ({fund.investments.length})
        </button>
        <button
          style={{
            ...styles.tab,
            background:
              activeTab === 'exits'
                ? 'linear-gradient(135deg, #00d4ff, #7c3aed)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
          onClick={() => setActiveTab('exits')}
        >
          🏆 Exits ({exitedStartups.length})
        </button>
        <button
          style={{
            ...styles.tab,
            background:
              activeTab === 'graveyard'
                ? 'linear-gradient(135deg, #00d4ff, #7c3aed)'
                : 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
          onClick={() => setActiveTab('graveyard')}
        >
          💀 Graveyard ({deadStartups.length})
        </button>
      </div>

      {/* Market View */}
      {activeTab === 'market' && (
        <div style={styles.grid}>
          {activeStartups.map((startup) => {
            const hasInvestment = fund.investments.some((inv) => inv.startupId === startup.id);
            return (
              <div
                key={startup.id}
                style={{
                  ...styles.card,
                  border: hasInvestment
                    ? '2px solid #00d4ff'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.startupName}>{startup.name}</div>
                    <span style={styles.sector}>{startup.sector}</span>
                  </div>
                  <span
                    style={{
                      ...styles.stage,
                      background: `${getStageColor(startup.stage)}33`,
                      color: getStageColor(startup.stage),
                    }}
                  >
                    {startup.stage}
                  </span>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Valuation</div>
                    <div style={styles.metricValue}>{formatMoney(startup.valuation)}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Revenue/mo</div>
                    <div style={styles.metricValue}>{formatMoney(startup.revenue)}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Employees</div>
                    <div style={styles.metricValue}>{startup.employees}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Age</div>
                    <div style={styles.metricValue}>{startup.monthsAlive}mo</div>
                  </div>
                </div>

                <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#888' }}>
                  Quality Score: {'⭐'.repeat(Math.ceil(startup.quality * 5))}
                </div>

                {!hasInvestment && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        ...styles.investButton,
                        background:
                          fund.cash >= 100000
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                            : '#555',
                        color: '#fff',
                        cursor: fund.cash >= 100000 ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() => invest(startup, 100000)}
                      disabled={fund.cash < 100000}
                    >
                      Invest $100K
                    </button>
                    <button
                      style={{
                        ...styles.investButton,
                        background:
                          fund.cash >= 500000
                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                            : '#555',
                        color: '#fff',
                        cursor: fund.cash >= 500000 ? 'pointer' : 'not-allowed',
                      }}
                      onClick={() => invest(startup, 500000)}
                      disabled={fund.cash < 500000}
                    >
                      Invest $500K
                    </button>
                  </div>
                )}
                {hasInvestment && (
                  <div
                    style={{
                      background: 'rgba(0, 212, 255, 0.2)',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#00d4ff',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ Portfolio Company
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Portfolio View */}
      {activeTab === 'portfolio' && (
        <div style={styles.grid}>
          {fund.investments.map((inv) => {
            const startup = startups.find((s) => s.id === inv.startupId);
            if (!startup) return null;

            const currentValue =
              startup.status === 'active'
                ? inv.shares * startup.valuation
                : startup.exitValuation
                  ? inv.shares * startup.exitValuation
                  : 0;
            const multiple = currentValue / inv.amount;

            return (
              <div
                key={inv.startupId}
                style={{
                  ...styles.card,
                  border: `2px solid ${getStatusColor(startup.status)}`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.startupName}>{startup.name}</div>
                    <span style={styles.sector}>{startup.sector}</span>
                  </div>
                  <span
                    style={{
                      ...styles.stage,
                      background: `${getStatusColor(startup.status)}33`,
                      color: getStatusColor(startup.status),
                    }}
                  >
                    {startup.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Invested</div>
                    <div style={styles.metricValue}>{formatMoney(inv.amount)}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Current Value</div>
                    <div
                      style={{
                        ...styles.metricValue,
                        color: currentValue >= inv.amount ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {formatMoney(currentValue)}
                    </div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Ownership</div>
                    <div style={styles.metricValue}>{(inv.shares * 100).toFixed(2)}%</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Multiple</div>
                    <div
                      style={{
                        ...styles.metricValue,
                        color: multiple >= 1 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {multiple.toFixed(2)}x
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  Invested at Month {inv.investedAt + 1} @ {formatMoney(inv.valuationAtInvestment)}
                </div>
              </div>
            );
          })}
          {fund.investments.length === 0 && (
            <div
              style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px' }}
            >
              No investments yet. Browse the market and invest in promising startups!
            </div>
          )}
        </div>
      )}

      {/* Exits View */}
      {activeTab === 'exits' && (
        <div style={styles.grid}>
          {exitedStartups.map((startup) => {
            const investment = fund.investments.find((inv) => inv.startupId === startup.id);
            return (
              <div
                key={startup.id}
                style={{
                  ...styles.card,
                  border: `2px solid ${startup.status === 'ipo' ? '#f59e0b' : '#3b82f6'}`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.startupName}>{startup.name}</div>
                    <span style={styles.sector}>{startup.sector}</span>
                  </div>
                  <span
                    style={{
                      ...styles.stage,
                      background:
                        startup.status === 'ipo'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(59, 130, 246, 0.3)',
                      color: startup.status === 'ipo' ? '#f59e0b' : '#3b82f6',
                    }}
                  >
                    {startup.status === 'ipo' ? '🔔 IPO' : '🎉 ACQUIRED'}
                  </span>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Exit Valuation</div>
                    <div style={styles.metricValue}>{formatMoney(startup.exitValuation)}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Total Raised</div>
                    <div style={styles.metricValue}>{formatMoney(startup.totalRaised)}</div>
                  </div>
                </div>

                {investment ? (
                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      padding: '10px',
                      borderRadius: '8px',
                      color: '#22c55e',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      Your Return: {formatMoney(investment.shares * startup.exitValuation)}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {((investment.shares * startup.exitValuation) / investment.amount).toFixed(2)}
                      x multiple
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>
                    You didn&apos;t invest in this company
                  </div>
                )}
              </div>
            );
          })}
          {exitedStartups.length === 0 && (
            <div
              style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px' }}
            >
              No exits yet. Keep the simulation running!
            </div>
          )}
        </div>
      )}

      {/* Graveyard View */}
      {activeTab === 'graveyard' && (
        <div style={styles.grid}>
          {deadStartups.map((startup) => {
            const investment = fund.investments.find((inv) => inv.startupId === startup.id);
            return (
              <div
                key={startup.id}
                style={{
                  ...styles.card,
                  border: '2px solid #ef4444',
                  opacity: 0.7,
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.startupName}>{startup.name}</div>
                    <span style={styles.sector}>{startup.sector}</span>
                  </div>
                  <span
                    style={{
                      ...styles.stage,
                      background: 'rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                    }}
                  >
                    💀 DEAD
                  </span>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Final Stage</div>
                    <div style={styles.metricValue}>{startup.stage}</div>
                  </div>
                  <div style={styles.metric}>
                    <div style={styles.metricLabel}>Months Alive</div>
                    <div style={styles.metricValue}>{startup.monthsAlive}</div>
                  </div>
                </div>

                {investment && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      padding: '10px',
                      borderRadius: '8px',
                      color: '#ef4444',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>Lost: {formatMoney(investment.amount)}</div>
                  </div>
                )}
              </div>
            );
          })}
          {deadStartups.length === 0 && (
            <div
              style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px' }}
            >
              No failures yet. Good luck!
            </div>
          )}
        </div>
      )}

      {/* Event Log */}
      <div style={styles.eventLog}>
        <h3 style={{ marginBottom: '15px', color: '#00d4ff' }}>📋 Event Log</h3>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              ...styles.eventItem,
              background:
                event.type === 'investment'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : event.type === 'funding'
                    ? 'rgba(59, 130, 246, 0.2)'
                    : event.type === 'exit'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : event.type === 'death'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ color: '#888', marginRight: '10px' }}>M{event.month + 1}</span>
            {event.message}
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center' }}>
            Start the simulation to see events
          </div>
        )}
      </div>
    </div>
  );
};

export default Completion18;
