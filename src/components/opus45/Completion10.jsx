import React, { useState, useCallback, useMemo } from 'react';

// Available rules configuration
const AVAILABLE_RULES = [
  {
    id: 'minLength',
    name: 'Minimum Length',
    description: 'Password must be at least {param} characters long',
    defaultParam: 12,
    paramType: 'number',
    paramMin: 6,
    paramMax: 50,
    validate: (password, param) => password.length >= param,
    generate: (current, param) => {
      while (current.length < param) {
        current += getRandomChar('abcdefghijklmnopqrstuvwxyz');
      }
      return current;
    },
  },
  {
    id: 'maxLength',
    name: 'Maximum Length',
    description: 'Password must be at most {param} characters long',
    defaultParam: 24,
    paramType: 'number',
    paramMin: 8,
    paramMax: 100,
    validate: (password, param) => password.length <= param,
    generate: (current, param) => current.slice(0, param),
  },
  {
    id: 'uppercase',
    name: 'Uppercase Letters',
    description: 'Must contain at least {param} uppercase letter(s)',
    defaultParam: 2,
    paramType: 'number',
    paramMin: 1,
    paramMax: 10,
    validate: (password, param) => (password.match(/[A-Z]/g) || []).length >= param,
    generate: (current, param) => {
      const count = (current.match(/[A-Z]/g) || []).length;
      let result = current;
      for (let i = 0; i < param - count; i++) {
        result += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      }
      return result;
    },
  },
  {
    id: 'lowercase',
    name: 'Lowercase Letters',
    description: 'Must contain at least {param} lowercase letter(s)',
    defaultParam: 2,
    paramType: 'number',
    paramMin: 1,
    paramMax: 10,
    validate: (password, param) => (password.match(/[a-z]/g) || []).length >= param,
    generate: (current, param) => {
      const count = (current.match(/[a-z]/g) || []).length;
      let result = current;
      for (let i = 0; i < param - count; i++) {
        result += getRandomChar('abcdefghijklmnopqrstuvwxyz');
      }
      return result;
    },
  },
  {
    id: 'numbers',
    name: 'Numbers',
    description: 'Must contain at least {param} digit(s)',
    defaultParam: 2,
    paramType: 'number',
    paramMin: 1,
    paramMax: 10,
    validate: (password, param) => (password.match(/[0-9]/g) || []).length >= param,
    generate: (current, param) => {
      const count = (current.match(/[0-9]/g) || []).length;
      let result = current;
      for (let i = 0; i < param - count; i++) {
        result += getRandomChar('0123456789');
      }
      return result;
    },
  },
  {
    id: 'specialChars',
    name: 'Special Characters',
    description: 'Must contain at least {param} special character(s)',
    defaultParam: 2,
    paramType: 'number',
    paramMin: 1,
    paramMax: 10,
    validate: (password, param) =>
      (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= param,
    generate: (current, param) => {
      const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const count = (current.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length;
      let result = current;
      for (let i = 0; i < param - count; i++) {
        result += getRandomChar(specials);
      }
      return result;
    },
  },
  {
    id: 'noConsecutive',
    name: 'No Consecutive Characters',
    description: 'No character can appear {param} or more times in a row',
    defaultParam: 3,
    paramType: 'number',
    paramMin: 2,
    paramMax: 5,
    validate: (password, param) => {
      const regex = new RegExp(`(.)\\1{${param - 1},}`);
      return !regex.test(password);
    },
    generate: (current, param) => {
      let result = '';
      let lastChar = '';
      let count = 0;
      for (const char of current) {
        if (char === lastChar) {
          count++;
          if (count < param) {
            result += char;
          } else {
            result += getRandomChar('abcdefghijklmnopqrstuvwxyz'.replace(char, ''));
          }
        } else {
          result += char;
          lastChar = char;
          count = 1;
        }
      }
      return result;
    },
  },
  {
    id: 'mustContainWord',
    name: 'Must Contain Word',
    description: 'Must contain the word "{param}"',
    defaultParam: 'secure',
    paramType: 'text',
    validate: (password, param) => password.toLowerCase().includes(param.toLowerCase()),
    generate: (current, param) => {
      if (!current.toLowerCase().includes(param.toLowerCase())) {
        const pos = Math.floor(Math.random() * (current.length + 1));
        return current.slice(0, pos) + param + current.slice(pos);
      }
      return current;
    },
  },
  {
    id: 'palindrome',
    name: 'Palindrome Section',
    description: 'Must contain a palindrome of at least {param} characters',
    defaultParam: 3,
    paramType: 'number',
    paramMin: 3,
    paramMax: 7,
    validate: (password, param) => {
      const lower = password.toLowerCase();
      for (let i = 0; i <= lower.length - param; i++) {
        for (let len = param; len <= lower.length - i; len++) {
          const sub = lower.slice(i, i + len);
          if (sub === sub.split('').reverse().join('') && /[a-z]/.test(sub)) {
            return true;
          }
        }
      }
      return false;
    },
    generate: (current, param) => {
      const palindromes = ['aba', 'abba', 'abcba', 'deed', 'noon', 'level', 'radar'];
      const suitable = palindromes.filter((p) => p.length >= param);
      const pal = suitable[Math.floor(Math.random() * suitable.length)] || 'aba';
      const pos = Math.floor(Math.random() * (current.length + 1));
      return current.slice(0, pos) + pal + current.slice(pos);
    },
  },
  {
    id: 'emoji',
    name: 'Emoji Required',
    description: 'Must contain at least {param} emoji(s)',
    defaultParam: 1,
    paramType: 'number',
    paramMin: 1,
    paramMax: 5,
    validate: (password, param) => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      return (password.match(emojiRegex) || []).length >= param;
    },
    generate: (current, param) => {
      const emojis = ['🔐', '🔑', '🛡️', '💪', '🎯', '⭐', '🚀', '💎', '🔥', '❤️'];
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const count = (current.match(emojiRegex) || []).length;
      let result = current;
      for (let i = 0; i < param - count; i++) {
        result += emojis[Math.floor(Math.random() * emojis.length)];
      }
      return result;
    },
  },
  {
    id: 'sumDigits',
    name: 'Digit Sum',
    description: 'Sum of all digits must equal {param}',
    defaultParam: 15,
    paramType: 'number',
    paramMin: 1,
    paramMax: 50,
    validate: (password, param) => {
      const digits = password.match(/[0-9]/g) || [];
      const sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
      return sum === param;
    },
    generate: (current, param) => {
      // Remove existing digits first
      let result = current.replace(/[0-9]/g, '');
      let remaining = param;
      while (remaining > 0) {
        const digit = Math.min(remaining, 9);
        result += digit;
        remaining -= digit;
      }
      return result;
    },
  },
  {
    id: 'noSequential',
    name: 'No Sequential Characters',
    description: 'Cannot contain {param} or more sequential characters (abc, 123)',
    defaultParam: 3,
    paramType: 'number',
    paramMin: 3,
    paramMax: 5,
    validate: (password, param) => {
      const lower = password.toLowerCase();
      for (let i = 0; i <= lower.length - param; i++) {
        let isSequential = true;
        for (let j = 1; j < param; j++) {
          if (lower.charCodeAt(i + j) !== lower.charCodeAt(i + j - 1) + 1) {
            isSequential = false;
            break;
          }
        }
        if (isSequential) return false;
      }
      return true;
    },
    generate: (current, param) => {
      // This is complex - just shuffle the password
      return current
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    },
  },
  {
    id: 'primeLength',
    name: 'Prime Length',
    description: 'Password length must be a prime number',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      const len = password.length;
      if (len < 2) return false;
      for (let i = 2; i <= Math.sqrt(len); i++) {
        if (len % i === 0) return false;
      }
      return true;
    },
    generate: (current) => {
      const primes = [7, 11, 13, 17, 19, 23, 29, 31];
      const targetLen = primes.find((p) => p >= current.length) || 13;
      while (current.length < targetLen) {
        current += getRandomChar('abcdefghijklmnopqrstuvwxyz');
      }
      return current.slice(0, targetLen);
    },
  },
  {
    id: 'evenOddBalance',
    name: 'Even/Odd Digit Balance',
    description: 'Must have equal number of even and odd digits',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      const digits = password.match(/[0-9]/g) || [];
      if (digits.length === 0) return false;
      const even = digits.filter((d) => parseInt(d) % 2 === 0).length;
      const odd = digits.length - even;
      return even === odd;
    },
    generate: (current) => {
      const digits = current.match(/[0-9]/g) || [];
      const even = digits.filter((d) => parseInt(d) % 2 === 0).length;
      const odd = digits.length - even;
      let result = current;
      if (even > odd) {
        for (let i = 0; i < even - odd; i++) {
          result += getRandomChar('13579');
        }
      } else if (odd > even) {
        for (let i = 0; i < odd - even; i++) {
          result += getRandomChar('02468');
        }
      } else if (digits.length === 0) {
        result += '12'; // Add one even, one odd
      }
      return result;
    },
  },
  {
    id: 'romanNumeral',
    name: 'Roman Numeral',
    description: 'Must contain a valid Roman numeral',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      const romanPattern = /M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})/g;
      const upper = password.toUpperCase();
      const matches = upper.match(romanPattern);
      return matches && matches.some((m) => m.length > 0);
    },
    generate: (current) => {
      const romans = ['VII', 'XII', 'XIV', 'XVI', 'XXI', 'XLII', 'LIV'];
      const roman = romans[Math.floor(Math.random() * romans.length)];
      const pos = Math.floor(Math.random() * (current.length + 1));
      return current.slice(0, pos) + roman + current.slice(pos);
    },
  },
  {
    id: 'musicalNote',
    name: 'Musical Notes',
    description: 'Must contain musical note(s): A-G followed by # or b',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      return /[A-Ga-g][#b]/.test(password);
    },
    generate: (current) => {
      const notes = ['C#', 'Db', 'F#', 'Gb', 'A#', 'Bb'];
      const note = notes[Math.floor(Math.random() * notes.length)];
      return current + note;
    },
  },
  {
    id: 'chemicalElement',
    name: 'Chemical Element',
    description: 'Must contain a chemical element symbol (He, Na, Fe, etc.)',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      const elements = [
        'He',
        'Li',
        'Be',
        'Na',
        'Mg',
        'Al',
        'Si',
        'Cl',
        'Ar',
        'Ca',
        'Fe',
        'Cu',
        'Zn',
        'Ag',
        'Au',
        'Pb',
      ];
      return elements.some((el) => password.includes(el));
    },
    generate: (current) => {
      const elements = ['Au', 'Fe', 'Cu', 'Ag', 'Na', 'Ca'];
      const el = elements[Math.floor(Math.random() * elements.length)];
      return current + el;
    },
  },
  {
    id: 'asciiArt',
    name: 'ASCII Art Face',
    description: 'Must contain an ASCII emoticon like :) or ;-)',
    defaultParam: null,
    paramType: null,
    validate: (password) => {
      const faces = [':)', ':(', ':D', ';)', ':-)', ':-(', ':-D', ';-)', ':P', ':-P', 'XD', ':O'];
      return faces.some((f) => password.includes(f));
    },
    generate: (current) => {
      const faces = [':)', ';)', ':D', ':P'];
      return current + faces[Math.floor(Math.random() * faces.length)];
    },
  },
  {
    id: 'leetSpeak',
    name: 'L33t Sp34k',
    description: 'Must contain at least {param} l33t speak substitution(s)',
    defaultParam: 2,
    paramType: 'number',
    paramMin: 1,
    paramMax: 5,
    validate: (password, param) => {
      // Check for common leet substitutions in context
      const leetPatterns = [
        /4[a-zA-Z]/i, // 4 as A
        /3[a-zA-Z]/i, // 3 as E
        /1[a-zA-Z]/i, // 1 as I or L
        /0[a-zA-Z]/i, // 0 as O
        /5[a-zA-Z]/i, // 5 as S
        /7[a-zA-Z]/i, // 7 as T
        /[a-zA-Z]4/i,
        /[a-zA-Z]3/i,
        /[a-zA-Z]1/i,
        /[a-zA-Z]0/i,
        /[a-zA-Z]5/i,
        /[a-zA-Z]7/i,
      ];
      let count = 0;
      for (const pattern of leetPatterns) {
        if (pattern.test(password)) count++;
      }
      return count >= param;
    },
    generate: (current, param) => {
      const leetWords = ['p4ss', 's3cur3', 'h4ck', 'c0d3', 'l33t'];
      let result = current;
      const word = leetWords[Math.floor(Math.random() * leetWords.length)];
      return result + word;
    },
  },
];

// Helper function to get random character
const getRandomChar = (charset) => {
  return charset[Math.floor(Math.random() * charset.length)];
};

// Shuffle array helper
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Rule Card Component
const RuleCard = ({ rule, isActive, onToggle, param, onParamChange, isValid }) => {
  const cardStyle = {
    background: isActive
      ? isValid
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))'
      : 'rgba(255, 255, 255, 0.05)',
    border: isActive
      ? isValid
        ? '2px solid #22c55e'
        : '2px solid #ef4444'
      : '2px solid transparent',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const checkboxStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: isActive ? 'none' : '2px solid #666',
    background: isActive ? (isValid ? '#22c55e' : '#ef4444') : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    flexShrink: 0,
  };

  const description = rule.paramType
    ? rule.description.replace('{param}', param)
    : rule.description;

  return (
    <div style={cardStyle} onClick={() => onToggle(rule.id)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={checkboxStyle}>{isActive && (isValid ? '✓' : '✗')}</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
              color: isActive ? (isValid ? '#22c55e' : '#ef4444') : '#fff',
            }}
          >
            {rule.name}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>{description}</div>
          {isActive && rule.paramType === 'number' && (
            <input
              type="range"
              min={rule.paramMin}
              max={rule.paramMax}
              value={param}
              onChange={(e) => {
                e.stopPropagation();
                onParamChange(rule.id, parseInt(e.target.value));
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', marginTop: '8px', cursor: 'pointer' }}
            />
          )}
          {isActive && rule.paramType === 'text' && (
            <input
              type="text"
              value={param}
              onChange={(e) => {
                e.stopPropagation();
                onParamChange(rule.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #555',
                background: '#1a1a2e',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const Completion10 = () => {
  const [password, setPassword] = useState('');
  const [activeRules, setActiveRules] = useState(
    new Set(['minLength', 'uppercase', 'lowercase', 'numbers', 'specialChars'])
  );
  const [ruleParams, setRuleParams] = useState(() => {
    const params = {};
    AVAILABLE_RULES.forEach((rule) => {
      if (rule.defaultParam !== null) {
        params[rule.id] = rule.defaultParam;
      }
    });
    return params;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [generationAttempts, setGenerationAttempts] = useState(0);

  // Validate all active rules
  const validationResults = useMemo(() => {
    const results = {};
    AVAILABLE_RULES.forEach((rule) => {
      if (activeRules.has(rule.id)) {
        results[rule.id] = rule.validate(password, ruleParams[rule.id]);
      }
    });
    return results;
  }, [password, activeRules, ruleParams]);

  const allRulesPass = useMemo(() => {
    return (
      activeRules.size > 0 && Array.from(activeRules).every((ruleId) => validationResults[ruleId])
    );
  }, [validationResults, activeRules]);

  const passedRulesCount = useMemo(() => {
    return Object.values(validationResults).filter(Boolean).length;
  }, [validationResults]);

  // Toggle rule
  const toggleRule = useCallback((ruleId) => {
    setActiveRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);

  // Update rule parameter
  const updateRuleParam = useCallback((ruleId, value) => {
    setRuleParams((prev) => ({ ...prev, [ruleId]: value }));
  }, []);

  // Generate password that satisfies all rules
  const generatePassword = useCallback(() => {
    setIsGenerating(true);
    setGenerationAttempts(0);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const activeRulesList = AVAILABLE_RULES.filter((r) => activeRules.has(r.id));
      let attempts = 0;
      const maxAttempts = 100;
      let bestPassword = '';
      let bestScore = 0;

      while (attempts < maxAttempts) {
        // Start with empty password and apply generators
        let candidate = '';

        // Shuffle the rules to try different orderings
        const shuffledRules = shuffleArray(activeRulesList);

        for (const rule of shuffledRules) {
          candidate = rule.generate(candidate, ruleParams[rule.id]);
        }

        // Shuffle the final password
        candidate = candidate
          .split('')
          .sort(() => Math.random() - 0.5)
          .join('');

        // Apply generators again after shuffle if needed
        for (const rule of activeRulesList) {
          if (!rule.validate(candidate, ruleParams[rule.id])) {
            candidate = rule.generate(candidate, ruleParams[rule.id]);
          }
        }

        // Count how many rules pass
        const score = activeRulesList.filter((r) => r.validate(candidate, ruleParams[r.id])).length;

        if (score > bestScore) {
          bestScore = score;
          bestPassword = candidate;
        }

        // Check if all rules pass
        const allPass = activeRulesList.every((r) => r.validate(candidate, ruleParams[r.id]));

        if (allPass) {
          setPassword(candidate);
          setGenerationAttempts(attempts + 1);
          setIsGenerating(false);
          return;
        }

        attempts++;
      }

      // Use best password found even if not perfect
      setPassword(bestPassword);
      setGenerationAttempts(attempts);
      setIsGenerating(false);
    }, 50);
  }, [activeRules, ruleParams]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(password).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  }, [password]);

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#fff',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #6366f1, #ec4899, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  };

  const subtitleStyle = {
    color: '#888',
    fontSize: 'clamp(14px, 2vw, 18px)',
  };

  const mainContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  };

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '24px',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const rulesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
    maxHeight: '600px',
    overflowY: 'auto',
    paddingRight: '8px',
  };

  const passwordInputStyle = {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontFamily: 'monospace',
    borderRadius: '12px',
    border: '2px solid',
    borderColor: allRulesPass ? '#22c55e' : password ? '#ef4444' : '#333',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const buttonStyle = (primary = false, disabled = false) => ({
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#333' : primary ? 'linear-gradient(90deg, #6366f1, #ec4899)' : '#333',
    color: disabled ? '#666' : '#fff',
    transition: 'all 0.3s ease',
    opacity: disabled ? 0.5 : 1,
  });

  const statsStyle = {
    display: 'flex',
    gap: '20px',
    marginTop: '16px',
    flexWrap: 'wrap',
  };

  const statBoxStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px 20px',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>🔐 Password Generator</h1>
        <p style={subtitleStyle}>Generate passwords that satisfy absurdly complex requirements!</p>
      </header>

      <div style={mainContentStyle}>
        {/* Rules Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            📋 Password Rules
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'normal',
                color: '#888',
                marginLeft: 'auto',
              }}
            >
              {activeRules.size} active
            </span>
          </h2>
          <div style={rulesGridStyle}>
            {AVAILABLE_RULES.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                isActive={activeRules.has(rule.id)}
                onToggle={toggleRule}
                param={ruleParams[rule.id]}
                onParamChange={updateRuleParam}
                isValid={validationResults[rule.id]}
              />
            ))}
          </div>
        </section>

        {/* Password Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            🔑 Your Password
            {allRulesPass && <span style={{ color: '#22c55e' }}>✓ Valid!</span>}
          </h2>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type a password or generate one..."
              style={passwordInputStyle}
            />
            {showCopied && (
              <div
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#22c55e',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                Copied!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              style={buttonStyle(true, activeRules.size === 0 || isGenerating)}
              onClick={generatePassword}
              disabled={activeRules.size === 0 || isGenerating}
            >
              {isGenerating ? '⏳ Generating...' : '✨ Generate Password'}
            </button>
            <button
              style={buttonStyle(false, !password)}
              onClick={copyToClipboard}
              disabled={!password}
            >
              📋 Copy
            </button>
            <button
              style={buttonStyle(false, !password)}
              onClick={() => setPassword('')}
              disabled={!password}
            >
              🗑️ Clear
            </button>
          </div>

          <div style={statsStyle}>
            <div style={statBoxStyle}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{password.length}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Characters</div>
            </div>
            <div style={statBoxStyle}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: allRulesPass ? '#22c55e' : '#ef4444',
                }}
              >
                {passedRulesCount}/{activeRules.size}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Rules Passed</div>
            </div>
            {generationAttempts > 0 && (
              <div style={statBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{generationAttempts}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Attempts</div>
              </div>
            )}
          </div>

          {/* Password Analysis */}
          {password && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Password Analysis</h3>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {password.split('').map((char, i) => {
                    let color = '#999';
                    if (/[A-Z]/.test(char)) color = '#6366f1';
                    else if (/[a-z]/.test(char)) color = '#22c55e';
                    else if (/[0-9]/.test(char)) color = '#f59e0b';
                    else color = '#ec4899';
                    return (
                      <span key={i} style={{ color }}>
                        {char}
                      </span>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    <span style={{ color: '#6366f1' }}>■</span> Uppercase
                  </span>
                  <span>
                    <span style={{ color: '#22c55e' }}>■</span> Lowercase
                  </span>
                  <span>
                    <span style={{ color: '#f59e0b' }}>■</span> Numbers
                  </span>
                  <span>
                    <span style={{ color: '#ec4899' }}>■</span> Special
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>💡 Tips</h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '12px',
                color: '#999',
              }}
            >
              <li>Click on rules to activate/deactivate them</li>
              <li>Adjust parameters with the sliders or text inputs</li>
              <li>Try combining weird rules like emojis + Roman numerals!</li>
              <li>The generator attempts to satisfy all rules automatically</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Responsive adjustment for mobile */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Completion10;
