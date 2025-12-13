import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, X, Shield, Lock, Meh, Hash, Palette, Type } from 'lucide-react';

const Completion10 = () => {
  const [password, setPassword] = useState('');
  const [selectedRules, setSelectedRules] = useState({
    rainbow: true,
    math: true,
    emoji: true,
    summer: true,
    alternator: true,
    animal: true,
  });
  const [copied, setCopied] = useState(false);
  const [validations, setValidations] = useState({});

  const COLORS = [
    'Red',
    'Blue',
    'Green',
    'Pink',
    'Gold',
    'Cyan',
    'Lime',
    'Teal',
    'Ruby',
    'Onyx',
    'Jade',
    'Rose',
    'Iron',
    'Sand',
    'Coal',
    'Rust',
    'Navy',
    'Gray',
    'Mint',
    'Plum',
  ];

  const ANIMALS = [
    'Cat',
    'Dog',
    'Fox',
    'Bat',
    'Owl',
    'Yak',
    'Emu',
    'Bee',
    'Ant',
    'Elk',
    'Pig',
    'Rat',
    'Lion',
    'Wolf',
    'Bear',
    'Frog',
    'Duck',
    'Swan',
    'Hawk',
    'Seal',
    'Deer',
    'Crab',
  ];

  const EMOJIS = [
    '🔥',
    '💀',
    '🚀',
    '🍕',
    '🎉',
    '💩',
    '🦄',
    '🤖',
    '💎',
    '🌮',
    '🌵',
    '🎈',
    '🔮',
    '🧬',
    '🧸',
    '🦠',
    '🧩',
    '🎲',
  ];

  const RULES_CONFIG = {
    rainbow: {
      id: 'rainbow',
      name: 'The Rainbow Rule',
      desc: 'Must contain a color name',
      icon: <Palette size={18} />,
      check: (pwd) => COLORS.some((c) => pwd.toLowerCase().includes(c.toLowerCase())),
    },
    math: {
      id: 'math',
      name: 'The Mathematician',
      desc: 'Must contain an equation (e.g. 2+2=4)',
      icon: <Hash size={18} />,
      check: (pwd) => /\d+[\+\-\*]\d+=\d+/.test(pwd),
    },
    emoji: {
      id: 'emoji',
      name: 'The Emoji Rule',
      desc: 'Must contain at least 2 distinct emojis',
      icon: <Meh size={18} />,
      check: (pwd) => {
        const found = EMOJIS.filter((e) => pwd.includes(e));
        // Distinct count
        return new Set(found).size >= 2;
      },
    },
    animal: {
      id: 'animal',
      name: 'The Zoo Rule',
      desc: 'Must contain an animal name',
      icon: <Shield size={18} />, // Generic icon
      check: (pwd) => ANIMALS.some((a) => pwd.toLowerCase().includes(a.toLowerCase())),
    },
    summer: {
      id: 'summer',
      name: 'The Summer Rule',
      desc: 'Digits must sum to exactly 25',
      icon: <Lock size={18} />,
      check: (pwd) => {
        const sum = pwd
          .split('')
          .filter((c) => /\d/.test(c))
          .reduce((acc, c) => acc + parseInt(c, 10), 0);
        return sum === 25;
      },
    },
    alternator: {
      id: 'alternator',
      name: 'The Alternator',
      desc: 'Case must alternate (e.g. AbCdEf)',
      icon: <Type size={18} />,
      check: (pwd) => {
        // Filter only letters
        const letters = pwd.split('').filter((c) => /[a-zA-Z]/.test(c));
        if (letters.length < 2) return true; // Trivial pass
        for (let i = 0; i < letters.length - 1; i++) {
          const curr = letters[i];
          const next = letters[i + 1];
          const isCurrUpper = curr === curr.toUpperCase();
          const isNextUpper = next === next.toUpperCase();
          if (isCurrUpper === isNextUpper) return false;
        }
        return true;
      },
    },
  };

  const generate = () => {
    let attempts = 0;
    const maxAttempts = 100;

    // Helper to get random
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    while (attempts < maxAttempts) {
      attempts++;
      let components = [];

      // 1. Content Generation
      if (selectedRules.rainbow) components.push(rnd(COLORS));
      if (selectedRules.animal) components.push(rnd(ANIMALS));

      if (selectedRules.math) {
        const a = rndInt(1, 9);
        const b = rndInt(1, 9);
        const op = Math.random() > 0.5 ? '+' : '-';
        let c = op === '+' ? a + b : a - b;
        // Avoid negative for simplicity of parsing if desired, but negative is fine.
        // Let's keep it positive for clean looking equations
        if (c < 0) components.push(`${a}+${b}=${a + b}`);
        else components.push(`${a}${op}${b}=${c}`);
      }

      if (selectedRules.emoji) {
        const e1 = rnd(EMOJIS);
        let e2 = rnd(EMOJIS);
        while (e1 === e2) e2 = rnd(EMOJIS);
        components.push(e1);
        components.push(e2);
      }

      // Shuffle components to make it interesting
      components.sort(() => Math.random() - 0.5);
      let rawPwd = components.join('');

      // 2. Structural Generation

      // Summer Rule Handler
      // We need to add digits until sum is 25.
      // First calculate current sum.
      if (selectedRules.summer) {
        let currentSum = rawPwd
          .split('')
          .filter((c) => /\d/.test(c))
          .reduce((a, b) => a + parseInt(b, 10), 0);

        // If we overshoot, we fail this attempt and retry (it's hard to subtract without breaking equations)
        if (currentSum > 25) continue;

        let remaining = 25 - currentSum;
        let digitStr = '';
        while (remaining > 0) {
          // Add digits properly
          // Try to add largest possible digit that fits
          let d = Math.min(9, remaining);
          // Randomize a bit to not always have 9s
          if (remaining > 9) d = rndInt(1, 9);
          else d = remaining; // must finish exactly

          digitStr += d;
          remaining -= d;
        }
        // Insert digits randomly or at end
        rawPwd += digitStr;
      }

      // Alternator Rule Handler
      // Map string to alternating case
      if (selectedRules.alternator) {
        let chars = rawPwd.split('');
        let upperNext = Math.random() > 0.5;

        // We only touch letters. We must NOT touch other requirements if possible,
        // but requirements like Color and Animal are case-insensitive in our check.
        // So we can freely modify case.

        const newChars = chars.map((c) => {
          if (/[a-zA-Z]/.test(c)) {
            const res = upperNext ? c.toUpperCase() : c.toLowerCase();
            upperNext = !upperNext;
            return res;
          }
          return c;
        });
        rawPwd = newChars.join('');
      }

      setPassword(rawPwd);
      validateAll(rawPwd);
      return;
    }
    setPassword('Failed to generate! Constraints too hard.');
  };

  const validateAll = (pwd) => {
    const res = {};
    Object.keys(RULES_CONFIG).forEach((key) => {
      if (selectedRules[key]) {
        res[key] = RULES_CONFIG[key].check(pwd);
      }
    });
    setValidations(res);
  };

  useEffect(() => {
    generate();
  }, []); // Init

  const toggleRule = (key) => {
    const newRules = { ...selectedRules, [key]: !selectedRules[key] };
    setSelectedRules(newRules);
    // Optional: auto-regenerate when rules change?
    // User might want to toggle first. Let's not auto-gen, just plain toggle.
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Output */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Absurd Password
              <br />
              Generator
            </h1>
            <p className="text-gray-400 text-lg">
              Secure? Maybe. Ridiculous? Absolutely.
              <br />
              Satisfy the arbitrary demands of the digital bureaucracy.
            </p>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#111] p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-4">
              <div className="min-h-[120px] flex items-center justify-center text-center">
                <span className="text-3xl md:text-4xl font-mono font-bold break-all text-white drop-shadow-md">
                  {password}
                </span>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="flex gap-4 justify-between">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium active:scale-95 flex-1 justify-center"
                >
                  {copied ? <Check className="text-green-400" size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={generate}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-bold shadow-lg shadow-purple-900/30 active:scale-95 flex-[2] justify-center"
                >
                  <RefreshCw
                    size={20}
                    className="group-hover:rotate-180 transition-transform duration-500"
                  />
                  Generate New
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rules */}
        <div className="bg-[#111] rounded-3xl border border-white/10 p-6 shadow-2xl max-h-[600px] overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="text-purple-400" />
            Active Constraints
          </h3>

          <div className="space-y-3">
            {Object.values(RULES_CONFIG).map((rule) => {
              const isActive = selectedRules[rule.id];
              const isValid = password && isActive ? rule.check(password) : false;

              return (
                <div
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`
                                relative p-4 rounded-xl border transition-all cursor-pointer select-none
                                flex items-center justify-between gap-4 group
                                ${
                                  isActive
                                    ? 'bg-white/5 border-purple-500/50 hover:bg-white/10'
                                    : 'bg-transparent border-white/5 opacity-50 hover:opacity-100 hover:bg-white/5'
                                }
                            `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                                    p-3 rounded-lg transition-colors
                                    ${isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}
                                `}
                    >
                      {rule.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {rule.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{rule.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isActive && (
                      <div
                        className={`
                                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                                        ${
                                          isValid
                                            ? 'bg-green-500/20 border-green-500/50 text-green-500 scale-100'
                                            : 'bg-red-500/20 border-red-500/50 text-red-500 scale-90 opacity-0'
                                          /* Note: Initially before generation, validation might be false, but distinct from unchecked */
                                        }
                                        ${isValid ? 'opacity-100' : 'opacity-0'} 
                                    `}
                      >
                        {isValid ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <X size={16} strokeWidth={3} />
                        )}
                      </div>
                    )}
                    <div
                      className={`
                                    w-12 h-6 rounded-full p-1 transition-colors duration-300
                                    ${isActive ? 'bg-purple-600' : 'bg-white/10'}
                                `}
                    >
                      <div
                        className={`
                                        w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300
                                        ${isActive ? 'translate-x-6' : 'translate-x-0'}
                                    `}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/5 text-sm text-center text-gray-400">
            Tip: Toggle rules to control how absurd your password gets.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion10;
