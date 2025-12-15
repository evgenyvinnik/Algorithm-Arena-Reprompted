import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Clock, Play, Pause, FastForward } from "lucide-react";

// --- Constants & Config ---
const TICK_RATE_MS = 1000; // Base speed: 1 second per month
const SECTORS = [
  { name: "SaaS", volatility: 0.1, potential: 1.5, color: "#3b82f6" },
  { name: "AI", volatility: 0.3, potential: 3.0, color: "#8b5cf6" },
  { name: "BioTech", volatility: 0.4, potential: 5.0, color: "#10b981" },
  { name: "FinTech", volatility: 0.15, potential: 1.8, color: "#f59e0b" },
  { name: "Consumer", volatility: 0.25, potential: 2.0, color: "#ec4899" },
  { name: "Crypto", volatility: 0.6, potential: 10.0, color: "#6366f1" },
];

const STAGES = {
  SEED: { name: "Seed", minVal: 1000000, maxVal: 5000000, color: "bg-gray-200 text-gray-800" },
  SERIES_A: { name: "Series A", minVal: 10000000, maxVal: 25000000, color: "bg-blue-100 text-blue-800" },
  SERIES_B: { name: "Series B", minVal: 50000000, maxVal: 100000000, color: "bg-purple-100 text-purple-800" },
  SERIES_C: { name: "Series C", minVal: 200000000, maxVal: 500000000, color: "bg-orange-100 text-orange-800" },
  IPO: { name: "IPO", minVal: 1000000000, maxVal: 100000000000, color: "bg-green-100 text-green-800" },
  DEAD: { name: "Bankrupt", minVal: 0, maxVal: 0, color: "bg-red-100 text-red-800" },
  ACQUIRED: { name: "Acquired", minVal: 0, maxVal: 0, color: "bg-teal-100 text-teal-800" },
};

const STARTUP_NAMES_PREFIX = ["Hyper", "Super", "Mega", "Uber", "Insta", "Snap", "Meta", "Block", "Open", "Deep", "Rapid", "Smart"];
const STARTUP_NAMES_SUFFIX = ["base", "flow", "scale", "loop", "chain", "mind", "brain", "pulse", "link", "net", "sys", "tech"];

const INITIAL_FUND = 10000000; // $10M

// --- Helpers ---
const formatCurrency = (val) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}k`;
  return `$${val}`;
};

const generateStartupName = () => {
  const prefix = STARTUP_NAMES_PREFIX[Math.floor(Math.random() * STARTUP_NAMES_PREFIX.length)];
  const suffix = STARTUP_NAMES_SUFFIX[Math.floor(Math.random() * STARTUP_NAMES_SUFFIX.length)];
  return `${prefix}${suffix}`;
};

const generateStartup = (id, currentTick) => {
  const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  const baseValuation = Math.floor(Math.random() * (STAGES.SEED.maxVal - STAGES.SEED.minVal) + STAGES.SEED.minVal);

  return {
    id,
    name: generateStartupName(),
    sector: sector.name,
    foundedTick: currentTick,
    stage: "SEED",
    valuation: baseValuation,
    cash: baseValuation * 0.2, // Raise 20% at seed
    burnRate: baseValuation * 0.015, // Burn 1.5% of val per month approx
    marketFit: Math.random(), // 0 to 1, hidden stat
    founderSkill: Math.random(), // 0 to 1, hidden stat
    volatility: sector.volatility,
    history: [{ tick: currentTick, valuation: baseValuation }],
    capTable: {
      founders: 0.8,
      investors: 0.0,
      pool: 0.2
    },
    playerEquity: 0,
    status: "ACTIVE", // ACTIVE, DEAD, ACQUIRED, IPO
  };
};

export default function VC_Simulator() {
  // Game State
  const [ticks, setTicks] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fundBalance, setFundBalance] = useState(INITIAL_FUND);
  const [startups, setStartups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(null);

  const startTickRef = useRef(0);
  const nextStartupIdRef = useRef(1);

  // --- Engine ---

  const advanceTime = useCallback(() => {
    setTicks((t) => t + 1);

    setStartups((prevStartups) => {
      let newStartups = prevStartups.map(startup => {
        if (startup.status !== "ACTIVE") return startup;

        // 1. Calculate Growth
        // Growth depends on Market Fit, Founder Skill, and random market fluctuations
        const marketNoise = (Math.random() - 0.5) * startup.volatility;
        const growthFactor = (1 + (startup.marketFit * 0.05) + (startup.founderSkill * 0.02) + marketNoise);

        let newValuation = startup.valuation * growthFactor;
        let newCash = startup.cash - startup.burnRate;
        let newStatus = startup.status;
        let newStage = startup.stage;

        // 2. Lifecycle Checks

        // Bankruptcy: Out of cash
        if (newCash <= 0) {
          newStatus = "DEAD";
          newValuation = 0;
          addNotification(`💀 ${startup.name} has gone bankrupt!`);
        }
        // Acquisition Offer (Rare, high valuation)
        else if (newValuation > 100000000 && Math.random() < 0.005) {
          newStatus = "ACQUIRED";
          newValuation *= 1.2; // Premium
          addNotification(`💰 ${startup.name} was ACQUIRED for ${formatCurrency(newValuation)}!`);
        }
        // IPO (Very Rare, huge valuation)
        else if (newValuation > 1000000000 && Math.random() < 0.002) {
          newStatus = "IPO";
          addNotification(`🚀 ${startup.name} is going IPO at ${formatCurrency(newValuation)}!`);
        }

        // Series Progression (Simplistic)
        if (newStatus === "ACTIVE") {
          if (newStage === "SEED" && newValuation > STAGES.SERIES_A.minVal) newStage = "SERIES_A";
          else if (newStage === "SERIES_A" && newValuation > STAGES.SERIES_B.minVal) newStage = "SERIES_B";
          else if (newStage === "SERIES_B" && newValuation > STAGES.SERIES_C.minVal) newStage = "SERIES_C";
        }

        // 3. Update History (limit size for perf)
        const newHistory = [...startup.history, { tick: ticks + 1, valuation: newValuation }];
        if (newHistory.length > 50) newHistory.shift();

        return {
          ...startup,
          valuation: newValuation,
          cash: newCash,
          status: newStatus,
          stage: newStage,
          history: newHistory
        };
      });

      // 4. Generate New Startups
      if (Math.random() < 0.2) { // 20% chance per month
        const ns = generateStartup(nextStartupIdRef.current++, ticks + 1);
        newStartups.push(ns);
        addNotification(`✨ New startup founded: ${ns.name} (${ns.sector})`);
      }

      return newStartups;
    });

  }, [ticks]);

  // Game Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(advanceTime, TICK_RATE_MS / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, advanceTime]);

  const addNotification = (msg) => {
    setNotifications(prev => [{ id: Date.now() + Math.random(), msg }, ...prev].slice(0, 5));
  };

  // --- Interaction ---
  const handleInvest = (startupId, amount) => {
    if (fundBalance < amount) {
      alert("Not enough funds!");
      return;
    }

    setStartups(prev => prev.map(s => {
      if (s.id !== startupId) return s;

      // Simple equity math: Amount / Valuation = Equity %
      // Dilute everyone
      const equityPurchased = amount / s.valuation;

      // In simulation, we assume money goes into company cash (Primary)
      // Adjust valuation post-money? keeping it simple: pre-money logic for purchase, then add cash

      return {
        ...s,
        cash: s.cash + amount,
        valuation: s.valuation + amount, // value increases by cash injection
        playerEquity: s.playerEquity + equityPurchased,
        // Assuming simplified dilution of others for now
        capTable: {
          ...s.capTable,
          founders: s.capTable.founders * (1 - equityPurchased),
          investors: s.capTable.investors * (1 - equityPurchased) + equityPurchased
        }
      }
    }));

    setFundBalance(prev => prev - amount);
    addNotification(`💸 Invested ${formatCurrency(amount)} in ${startups.find(s => s.id === startupId).name}`);
  };

  const selectedStartup = startups.find(s => s.id === selectedStartupId);
  const playerPortfolio = startups.filter(s => s.playerEquity > 0);

  // Calculate total portfolio value
  const portfolioValue = playerPortfolio.reduce((acc, s) => {
    if (s.status === "DEAD") return acc;
    return acc + (s.valuation * s.playerEquity);
  }, 0);

  const totalAssets = fundBalance + portfolioValue;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            VC Simulator 2025
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>Month {ticks}</span>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Liquid Capital</p>
            <p className="text-lg font-mono font-bold text-green-600">{formatCurrency(fundBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total AUM</p>
            <p className="text-lg font-mono font-bold text-blue-600">{formatCurrency(totalAssets)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-white rounded-md transition-colors shadow-sm">
            {isPlaying ? <Pause className="w-5 h-5 text-gray-700" /> : <Play className="w-5 h-5 text-green-600" />}
          </button>
          <button onClick={() => setSpeed(1)} className={`p-2 rounded-md transition-colors ${speed === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            1x
          </button>
          <button onClick={() => setSpeed(5)} className={`p-2 rounded-md transition-colors ${speed === 5 ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <FastForward className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Market Feed */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Feed
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {startups.filter(s => s.status === "ACTIVE").reverse().map(startup => (
              <div
                key={startup.id}
                onClick={() => setSelectedStartupId(startup.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedStartupId === startup.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{startup.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{startup.sector}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STAGES[startup.stage]?.color || 'bg-gray-100'}`}>
                        {STAGES[startup.stage]?.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-semibold text-gray-900">{formatCurrency(startup.valuation)}</span>
                    <span className={`text-xs ${startup.history.length > 1 && startup.valuation >= startup.history[startup.history.length - 2].valuation ? 'text-green-500' : 'text-red-500'}`}>
                      {startup.history.length > 1 && startup.valuation >= startup.history[startup.history.length - 2].valuation ? '▲' : '▼'}
                      {startup.history.length > 1 ? ((startup.valuation - startup.history[startup.history.length - 2].valuation) / startup.history[startup.history.length - 2].valuation * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                {/* Mini Chart */}
                <div className="h-10 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={startup.history}>
                      <Line type="monotone" dataKey="valuation" stroke={startup.valuation >= (startup.history[0]?.valuation || 0) ? "#10b981" : "#ef4444"} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Detail View */}
        <div className="w-1/3 bg-gray-50 flex flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Due Diligence
            </h2>
          </div>
          {selectedStartup ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{selectedStartup.name}</div>
                    <div className="text-sm text-gray-500 mb-4">{selectedStartup.sector} • Founded Month {selectedStartup.foundedTick}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${STAGES[selectedStartup.stage]?.color}`}>
                    {STAGES[selectedStartup.stage]?.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase">Valuation</span>
                    <div className="text-xl font-mono font-bold">{formatCurrency(selectedStartup.valuation)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase">Cash on Hand</span>
                    <div className={`text-xl font-mono font-bold ${selectedStartup.cash < selectedStartup.burnRate * 3 ? 'text-red-500' : 'text-gray-900'}`}>{formatCurrency(selectedStartup.cash)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase">Your Equity</span>
                    <div className="text-xl font-mono font-bold text-blue-600">{(selectedStartup.playerEquity * 100).toFixed(2)}%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase">Burn Rate</span>
                    <div className="text-xl font-mono font-bold text-red-400">-{formatCurrency(selectedStartup.burnRate)}/mo</div>
                  </div>
                </div>

                <div className="h-48 w-full bg-gray-50 rounded-lg p-2 mb-6 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedStartup.history}>
                      <XAxis dataKey="tick" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        labelFormatter={(label) => `Month ${label}`}
                        formatter={(value) => [formatCurrency(value), "Valuation"]}
                      />
                      <Line type="monotone" dataKey="valuation" stroke="#3b82f6" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {selectedStartup.status === "ACTIVE" && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Make Investment</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[50000, 250000, 1000000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => handleInvest(selectedStartup.id, amt)}
                          disabled={fundBalance < amt}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedStartup.status !== "ACTIVE" && (
                  <div className={`p-4 rounded-lg text-center font-bold ${selectedStartup.status === "DEAD" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    Company is {selectedStartup.status}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a startup to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Portfolio & Notifications */}
        <div className="w-1/3 bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Your Portfolio
              </h2>
              {playerPortfolio.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No investments yet. Start spending that cash!</p>
              ) : (
                <div className="space-y-2">
                  {playerPortfolio.map(s => (
                    <div key={s.id} onClick={() => setSelectedStartupId(s.id)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                      <div>
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500">{(s.playerEquity * 100).toFixed(2)}% Equity</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{formatCurrency(s.valuation * s.playerEquity)}</div>
                        <div className={`text-xs ${s.status === "ACTIVE" ? "text-green-600" : "text-gray-500"}`}>{s.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Recent Events</h2>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="text-sm p-3 bg-blue-50 text-blue-900 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    {n.msg}
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-sm text-gray-400">All quiet on Sand Hill Road...</p>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
