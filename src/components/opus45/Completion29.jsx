import React, { useState, useCallback } from 'react';

// Predefined tech personalities with their stats
const TECH_PERSONALITIES = [
  {
    id: 1,
    name: 'Linus Torvalds',
    title: 'Creator of Linux & Git',
    company: 'Linux Foundation',
    year: 1991,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinuxCon_Europe_Linus_Torvalds_03_%28cropped%29.jpg/220px-LinuxCon_Europe_Linus_Torvalds_03_%28cropped%29.jpg',
    stats: { influence: 99, code: 98, vision: 95, legacy: 100 },
    achievements: ['Created Linux Kernel', 'Invented Git', 'Open Source Pioneer'],
    rarity: 'legendary',
    quote: 'Talk is cheap. Show me the code.',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    title: 'First Computer Programmer',
    company: 'Independent',
    year: 1843,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/220px-Ada_Lovelace_portrait.jpg',
    stats: { influence: 100, code: 90, vision: 100, legacy: 100 },
    achievements: ['First Algorithm Author', 'Computing Visionary', 'Mathematical Genius'],
    rarity: 'legendary',
    quote: 'The Analytical Engine weaves algebraic patterns.',
  },
  {
    id: 3,
    name: 'Grace Hopper',
    title: 'Queen of Code',
    company: 'US Navy / UNIVAC',
    year: 1952,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg/220px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg',
    stats: { influence: 98, code: 95, vision: 97, legacy: 99 },
    achievements: ['Created First Compiler', 'COBOL Pioneer', 'Found First Bug'],
    rarity: 'legendary',
    quote: "It's easier to ask forgiveness than permission.",
  },
  {
    id: 4,
    name: 'Dennis Ritchie',
    title: 'Creator of C',
    company: 'Bell Labs',
    year: 1972,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Dennis_Ritchie_2011.jpg/220px-Dennis_Ritchie_2011.jpg',
    stats: { influence: 99, code: 99, vision: 96, legacy: 100 },
    achievements: ['Created C Language', 'Co-created Unix', 'Turing Award Winner'],
    rarity: 'legendary',
    quote: 'Unix is simple. It just takes a genius to understand its simplicity.',
  },
  {
    id: 5,
    name: 'Guido van Rossum',
    title: 'Creator of Python',
    company: 'Microsoft',
    year: 1991,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Guido-portrait-2014-drc.jpg/220px-Guido-portrait-2014-drc.jpg',
    stats: { influence: 95, code: 96, vision: 94, legacy: 97 },
    achievements: ['Created Python', 'BDFL of Python', 'Readability Advocate'],
    rarity: 'epic',
    quote: 'Python is an experiment in how much freedom programmers need.',
  },
  {
    id: 6,
    name: 'Margaret Hamilton',
    title: 'Apollo Software Director',
    company: 'MIT / NASA',
    year: 1969,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Margaret_Hamilton_1995.jpg/220px-Margaret_Hamilton_1995.jpg',
    stats: { influence: 97, code: 98, vision: 99, legacy: 100 },
    achievements: ['Apollo 11 Software', 'Software Engineering Pioneer', 'Presidential Medal'],
    rarity: 'legendary',
    quote: 'There was no choice but to be pioneers.',
  },
  {
    id: 7,
    name: 'Brendan Eich',
    title: 'Creator of JavaScript',
    company: 'Brave Software',
    year: 1995,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Brendan_Eich_Mozilla_Foundation_official_photo.jpg/220px-Brendan_Eich_Mozilla_Foundation_official_photo.jpg',
    stats: { influence: 94, code: 92, vision: 88, legacy: 96 },
    achievements: ['Created JavaScript', 'Co-founded Mozilla', 'Web Pioneer'],
    rarity: 'epic',
    quote: 'Always bet on JavaScript.',
  },
  {
    id: 8,
    name: 'Tim Berners-Lee',
    title: 'Inventor of WWW',
    company: 'W3C',
    year: 1989,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tim_Berners-Lee_April_2009.jpg/220px-Tim_Berners-Lee_April_2009.jpg',
    stats: { influence: 100, code: 90, vision: 100, legacy: 100 },
    achievements: ['Invented World Wide Web', 'Created HTML', 'Open Web Advocate'],
    rarity: 'legendary',
    quote: 'The Web as I envisaged it, we have not seen it yet.',
  },
  {
    id: 9,
    name: 'James Gosling',
    title: 'Father of Java',
    company: 'Amazon Web Services',
    year: 1995,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/James_Gosling_2008.jpg/220px-James_Gosling_2008.jpg',
    stats: { influence: 93, code: 95, vision: 91, legacy: 94 },
    achievements: ['Created Java', 'Write Once Run Anywhere', 'Enterprise Pioneer'],
    rarity: 'epic',
    quote: 'Java was designed to be a simple language.',
  },
  {
    id: 10,
    name: 'Bjarne Stroustrup',
    title: 'Creator of C++',
    company: 'Morgan Stanley',
    year: 1985,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/BjarneStroustrup.jpg/220px-BjarneStroustrup.jpg',
    stats: { influence: 92, code: 97, vision: 90, legacy: 95 },
    achievements: ['Created C++', 'OOP Pioneer', 'Systems Programming'],
    rarity: 'epic',
    quote:
      'There are only two kinds of languages: the ones people complain about and the ones nobody uses.',
  },
  {
    id: 11,
    name: 'John Carmack',
    title: 'Game Engine Legend',
    company: 'Consulting CTO @ Meta',
    year: 1991,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/John_Carmack_GDC_2010.jpg/220px-John_Carmack_GDC_2010.jpg',
    stats: { influence: 90, code: 99, vision: 95, legacy: 93 },
    achievements: ['Created Doom/Quake', 'VR Pioneer', '3D Graphics Innovator'],
    rarity: 'epic',
    quote: 'Focused, hard work is the real key to success.',
  },
  {
    id: 12,
    name: 'Ken Thompson',
    title: 'Co-creator of Unix & Go',
    company: 'Google',
    year: 1969,
    photo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ken_Thompson_%28sitting%29_and_Dennis_Ritchie_at_PDP-11_%282876612463%29.jpg/300px-Ken_Thompson_%28sitting%29_and_Dennis_Ritchie_at_PDP-11_%282876612463%29.jpg',
    stats: { influence: 97, code: 99, vision: 96, legacy: 99 },
    achievements: ['Co-created Unix', 'Created B Language', 'Created Go'],
    rarity: 'legendary',
    quote: 'When in doubt, use brute force.',
  },
];

// Card rarity configurations
const RARITY_CONFIG = {
  legendary: {
    gradient:
      'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF6B00 50%, #FFD700 75%, #FFA500 100%)',
    borderColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.6)',
    label: '★ LEGENDARY',
    labelBg: 'linear-gradient(90deg, #FFD700, #FFA500)',
  },
  epic: {
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 50%, #9B59B6 100%)',
    borderColor: '#9B59B6',
    glowColor: 'rgba(155, 89, 182, 0.6)',
    label: '◆ EPIC',
    labelBg: 'linear-gradient(90deg, #9B59B6, #8E44AD)',
  },
  rare: {
    gradient: 'linear-gradient(135deg, #3498DB 0%, #2980B9 50%, #3498DB 100%)',
    borderColor: '#3498DB',
    glowColor: 'rgba(52, 152, 219, 0.6)',
    label: '● RARE',
    labelBg: 'linear-gradient(90deg, #3498DB, #2980B9)',
  },
  common: {
    gradient: 'linear-gradient(135deg, #7F8C8D 0%, #95A5A6 50%, #7F8C8D 100%)',
    borderColor: '#7F8C8D',
    glowColor: 'rgba(127, 140, 141, 0.4)',
    label: 'COMMON',
    labelBg: '#7F8C8D',
  },
};

// Inject keyframe animations
const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('trading-card-styles')) {
    const style = document.createElement('style');
    style.id = 'trading-card-styles';
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.02); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
        50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes cardHover {
        0% { transform: translateY(0) rotateX(0); }
        100% { transform: translateY(-8px) rotateX(2deg); }
      }
      .trading-card-container:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      }
      .stat-bar-fill {
        animation: shimmer 2s infinite linear;
        background-size: 200% 100%;
      }
    `;
    document.head.appendChild(style);
  }
};

// Stat bar component with enhanced styling
const StatBar = ({ label, value, color }) => (
  <div style={{ marginBottom: '8px' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontWeight: '600',
        color: '#e0e0e0',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{label}</span>
      <span style={{ color: color, fontWeight: '700' }}>{value}</span>
    </div>
    <div
      style={{
        width: '100%',
        height: '10px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: '5px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="stat-bar-fill"
        style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}dd, ${color})`,
          borderRadius: '5px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 12px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`,
        }}
      />
    </div>
  </div>
);

// Trading Card component
const TradingCard = ({ person, isFlipped, onFlip, style }) => {
  React.useEffect(() => {
    injectStyles();
  }, []);

  const rarityConfig = RARITY_CONFIG[person.rarity] || RARITY_CONFIG.common;

  const cardStyle = {
    width: '300px',
    height: '450px',
    perspective: '1200px',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
    ...style,
  };

  const cardInnerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const cardFaceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: `0 15px 50px ${rarityConfig.glowColor}, 0 0 30px ${rarityConfig.glowColor}, inset 0 0 60px rgba(255,255,255,0.05)`,
    border: `3px solid ${rarityConfig.borderColor}`,
  };

  const cardFrontStyle = {
    ...cardFaceStyle,
    background: 'linear-gradient(165deg, #1e2140 0%, #151833 40%, #0d1025 100%)',
  };

  const cardBackStyle = {
    ...cardFaceStyle,
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(165deg, #0d1025 0%, #151833 40%, #1e2140 100%)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  return (
    <div style={cardStyle} onClick={onFlip}>
      <div style={cardInnerStyle}>
        {/* Front of card */}
        <div style={cardFrontStyle}>
          {/* Rarity banner */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '-35px',
              background: rarityConfig.labelBg,
              color: '#fff',
              padding: '5px 40px',
              fontSize: '10px',
              fontWeight: 'bold',
              transform: 'rotate(45deg)',
              zIndex: 10,
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {rarityConfig.label}
          </div>

          {/* Header gradient */}
          <div
            style={{
              height: '8px',
              background: rarityConfig.gradient,
            }}
          />

          {/* Photo section */}
          <div
            style={{
              position: 'relative',
              height: '200px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={person.photo}
              alt={person.name}
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: `4px solid ${rarityConfig.borderColor}`,
                boxShadow: `0 0 20px ${rarityConfig.glowColor}`,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              style={{
                display: 'none',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: `4px solid ${rarityConfig.borderColor}`,
                boxShadow: `0 0 20px ${rarityConfig.glowColor}`,
                backgroundColor: '#2c3e50',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
              }}
            >
              👤
            </div>
          </div>

          {/* Name and title */}
          <div
            style={{
              padding: '15px',
              textAlign: 'center',
              borderBottom: `2px solid ${rarityConfig.borderColor}`,
            }}
          >
            <h3
              style={{
                margin: '0 0 5px 0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#fff',
                textShadow: `0 0 10px ${rarityConfig.glowColor}`,
              }}
            >
              {person.name}
            </h3>
            <p
              style={{
                margin: '0 0 5px 0',
                fontSize: '12px',
                color: rarityConfig.borderColor,
                fontWeight: 'bold',
              }}
            >
              {person.title}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              {person.company} • Est. {person.year}
            </p>
          </div>

          {/* Stats section */}
          <div style={{ padding: '15px' }}>
            <StatBar label="INFLUENCE" value={person.stats.influence} color="#E74C3C" />
            <StatBar label="CODE" value={person.stats.code} color="#3498DB" />
            <StatBar label="VISION" value={person.stats.vision} color="#2ECC71" />
            <StatBar label="LEGACY" value={person.stats.legacy} color="#F39C12" />
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: rarityConfig.gradient,
            }}
          />
        </div>

        {/* Back of card */}
        <div style={cardBackStyle}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '10px',
              }}
            >
              💻
            </div>
            <h3
              style={{
                margin: '0 0 5px 0',
                color: '#fff',
                fontSize: '18px',
              }}
            >
              {person.name}
            </h3>
            <div
              style={{
                fontSize: '10px',
                color: rarityConfig.borderColor,
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              TECH LEGEND CARD
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                margin: '0 0 10px 0',
                color: rarityConfig.borderColor,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              🏆 Achievements
            </h4>
            {person.achievements.map((achievement, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#fff',
                  borderLeft: `3px solid ${rarityConfig.borderColor}`,
                }}
              >
                {achievement}
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '15px',
              borderRadius: '10px',
              borderLeft: `3px solid ${rarityConfig.borderColor}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontStyle: 'italic',
                color: '#ccc',
                fontSize: '12px',
                lineHeight: '1.5',
              }}
            >
              &ldquo;{person.quote}&rdquo;
            </p>
          </div>

          <div
            style={{
              marginTop: 'auto',
              textAlign: 'center',
              fontSize: '10px',
              color: '#666',
              paddingTop: '15px',
            }}
          >
            Click to flip • #{String(person.id).padStart(3, '0')} / {TECH_PERSONALITIES.length}
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Card Creator Modal
const CardCreator = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    year: 2024,
    photo: '',
    influence: 50,
    code: 50,
    vision: 50,
    legacy: 50,
    achievements: ['', '', ''],
    quote: '',
    rarity: 'rare',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData((prev) => ({ ...prev, achievements: newAchievements }));
  };

  const handleSave = () => {
    const newCard = {
      id: Date.now(),
      name: formData.name || 'Unknown Dev',
      title: formData.title || 'Software Engineer',
      company: formData.company || 'Tech Inc.',
      year: formData.year,
      photo: formData.photo || '',
      stats: {
        influence: formData.influence,
        code: formData.code,
        vision: formData.vision,
        legacy: formData.legacy,
      },
      achievements: formData.achievements.filter((a) => a.trim()),
      quote: formData.quote || 'Code is poetry.',
      rarity: formData.rarity,
    };
    onSave(newCard);
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const formStyle = {
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '15px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '2px solid #3498DB',
    boxShadow: '0 0 30px rgba(52, 152, 219, 0.3)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #3498DB',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#3498DB',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color: '#fff', marginTop: 0, textAlign: 'center' }}>✨ Create Custom Card</h2>

        <label style={labelStyle}>Name</label>
        <input
          style={inputStyle}
          placeholder="Tech Legend Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          placeholder="e.g., Creator of React"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />

        <label style={labelStyle}>Company</label>
        <input
          style={inputStyle}
          placeholder="e.g., Meta"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
        />

        <label style={labelStyle}>Photo URL</label>
        <input
          style={inputStyle}
          placeholder="https://example.com/photo.jpg"
          value={formData.photo}
          onChange={(e) => handleChange('photo', e.target.value)}
        />

        <label style={labelStyle}>Year Established</label>
        <input
          style={inputStyle}
          type="number"
          value={formData.year}
          onChange={(e) => handleChange('year', parseInt(e.target.value) || 2024)}
        />

        <label style={labelStyle}>Rarity</label>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={formData.rarity}
          onChange={(e) => handleChange('rarity', e.target.value)}
        >
          <option value="legendary">Legendary</option>
          <option value="epic">Epic</option>
          <option value="rare">Rare</option>
          <option value="common">Common</option>
        </select>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Stats</label>
          {['influence', 'code', 'vision', 'legacy'].map((stat) => (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  color: '#fff',
                  width: '80px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                }}
              >
                {stat}
              </span>
              <input
                type="range"
                min="1"
                max="100"
                value={formData[stat]}
                onChange={(e) => handleChange(stat, parseInt(e.target.value))}
                style={{ flex: 1, marginRight: '10px' }}
              />
              <span style={{ color: '#3498DB', width: '30px', textAlign: 'right' }}>
                {formData[stat]}
              </span>
            </div>
          ))}
        </div>

        <label style={labelStyle}>Achievements (up to 3)</label>
        {formData.achievements.map((achievement, idx) => (
          <input
            key={idx}
            style={inputStyle}
            placeholder={`Achievement ${idx + 1}`}
            value={achievement}
            onChange={(e) => handleAchievementChange(idx, e.target.value)}
          />
        ))}

        <label style={labelStyle}>Famous Quote</label>
        <textarea
          style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
          placeholder="Their most famous quote..."
          value={formData.quote}
          onChange={(e) => handleChange('quote', e.target.value)}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '5px',
              border: '1px solid #E74C3C',
              backgroundColor: 'transparent',
              color: '#E74C3C',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '5px',
              border: 'none',
              background: 'linear-gradient(90deg, #3498DB, #2980B9)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Create Card
          </button>
        </div>
      </div>
    </div>
  );
};

// Pack Opening Animation
const PackOpening = ({ cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);

  const revealNext = () => {
    if (currentIndex < cards.length) {
      setRevealed((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <h2 style={{ color: '#FFD700', marginBottom: '30px', textAlign: 'center' }}>
        🎴 Opening Pack... ({revealed.length}/{cards.length})
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '30px',
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              width: '150px',
              height: '225px',
              borderRadius: '10px',
              background: revealed.includes(idx)
                ? 'transparent'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: revealed.includes(idx) ? 'none' : '2px solid #444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              transform: revealed.includes(idx) ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            {revealed.includes(idx) ? (
              <TradingCard
                person={card}
                isFlipped={false}
                onFlip={() => {}}
                style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}
              />
            ) : (
              <div style={{ color: '#666', fontSize: '40px' }}>?</div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={revealNext}
        style={{
          padding: '15px 40px',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '10px',
          border: 'none',
          background:
            currentIndex >= cards.length
              ? 'linear-gradient(90deg, #2ECC71, #27AE60)'
              : 'linear-gradient(90deg, #FFD700, #FFA500)',
          color: '#000',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        }}
      >
        {currentIndex >= cards.length ? '✓ Done' : '✨ Reveal Next Card'}
      </button>
    </div>
  );
};

const Completion29 = () => {
  const [allCards, setAllCards] = useState(TECH_PERSONALITIES);
  const [selectedCard, setSelectedCard] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [showCreator, setShowCreator] = useState(false);
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [packCards, setPackCards] = useState([]);
  const [collection, setCollection] = useState(() => new Set(TECH_PERSONALITIES.map((p) => p.id)));
  const [filter, setFilter] = useState('all');

  const toggleFlip = useCallback((cardId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  }, []);

  const handleCreateCard = useCallback((newCard) => {
    setAllCards((prev) => [...prev, newCard]);
    setCollection((prev) => new Set([...prev, newCard.id]));
    setShowCreator(false);
  }, []);

  const openPack = useCallback(() => {
    // Randomly select 3 cards with weighted rarity
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    setPackCards(selected);
    setShowPackOpening(true);
  }, [allCards]);

  const filteredCards = allCards.filter((card) => {
    if (filter === 'all') return true;
    return card.rarity === filter;
  });

  const totalStats = (card) =>
    card.stats.influence + card.stats.code + card.stats.vision + card.stats.legacy;

  const sortedCards = [...filteredCards].sort((a, b) => totalStats(b) - totalStats(a));

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #070714 0%, #0f0f23 25%, #1a1a35 50%, #0f0f23 75%, #070714 100%)',
        padding: '40px 20px',
        fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <h1
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: '800',
            background:
              'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF6B00 50%, #FFD700 75%, #FFA500 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 15px 0',
            letterSpacing: '-1px',
            animation: 'gradientShift 4s ease infinite',
          }}
        >
          🃏 Tech Legend Cards
        </h1>
        <p
          style={{
            color: '#9ca3af',
            fontSize: '18px',
            margin: 0,
            fontWeight: '400',
            letterSpacing: '0.5px',
          }}
        >
          Collect trading cards of the greatest minds in tech history!
        </p>
        <div
          style={{
            marginTop: '20px',
            height: '2px',
            width: '150px',
            margin: '20px auto 0',
            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={openPack}
          style={{
            padding: '16px 36px',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            color: '#1a1a2e',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.02)';
            e.target.style.boxShadow =
              '0 8px 30px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow =
              '0 4px 20px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
        >
          🎴 Open Pack
        </button>
        <button
          onClick={() => setShowCreator(true)}
          style={{
            padding: '16px 36px',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '50px',
            border: '2px solid #3498DB',
            background: 'rgba(52, 152, 219, 0.1)',
            color: '#3498DB',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)';
            e.target.style.color = '#fff';
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 8px 30px rgba(52, 152, 219, 0.4)';
            e.target.style.border = '2px solid transparent';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(52, 152, 219, 0.1)';
            e.target.style.color = '#3498DB';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
            e.target.style.border = '2px solid #3498DB';
          }}
        >
          ✨ Create Custom Card
        </button>
      </div>

      {/* Collection stats */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          padding: '0 20px',
        }}
      >
        {[
          { value: collection.size, label: 'Cards Collected', color: '#FFD700', icon: '🎴' },
          {
            value: allCards.filter((c) => c.rarity === 'legendary').length,
            label: 'Legendary',
            color: '#FFD700',
            icon: '⭐',
          },
          {
            value: allCards.filter((c) => c.rarity === 'epic').length,
            label: 'Epic',
            color: '#9B59B6',
            icon: '💎',
          },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              padding: '20px 30px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: '140px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.border = `1px solid ${stat.color}40`;
              e.currentTarget.style.boxShadow = `0 10px 40px ${stat.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
            <div
              style={{
                color: stat.color,
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-1px',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '4px',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '50px',
          maxWidth: 'fit-content',
          margin: '0 auto 40px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {[
          {
            key: 'all',
            label: 'All Cards',
            gradient: 'linear-gradient(135deg, #2ECC71, #27AE60)',
            textColor: '#fff',
          },
          {
            key: 'legendary',
            label: '★ Legendary',
            gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
            textColor: '#1a1a2e',
          },
          {
            key: 'epic',
            label: '◆ Epic',
            gradient: 'linear-gradient(135deg, #9B59B6, #8E44AD)',
            textColor: '#fff',
          },
          {
            key: 'rare',
            label: '● Rare',
            gradient: 'linear-gradient(135deg, #3498DB, #2980B9)',
            textColor: '#fff',
          },
          {
            key: 'common',
            label: 'Common',
            gradient: 'linear-gradient(135deg, #7F8C8D, #95A5A6)',
            textColor: '#fff',
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '10px 24px',
              borderRadius: '25px',
              border: filter === f.key ? 'none' : '1px solid rgba(255,255,255,0.15)',
              background: filter === f.key ? f.gradient : 'transparent',
              color: filter === f.key ? f.textColor : '#6b7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow:
                filter === f.key
                  ? `0 4px 15px ${f.key === 'legendary' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0,0,0,0.2)'}`
                  : 'none',
            }}
            onMouseEnter={(e) => {
              if (filter !== f.key) {
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f.key) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          justifyContent: 'center',
          maxWidth: '1500px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        {sortedCards.map((person) => (
          <TradingCard
            key={person.id}
            person={person}
            isFlipped={flippedCards[person.id] || false}
            onFlip={() => toggleFlip(person.id)}
          />
        ))}
      </div>

      {/* Selected card modal */}
      {selectedCard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedCard(null)}
        >
          <TradingCard
            person={selectedCard}
            isFlipped={flippedCards[selectedCard.id]}
            onFlip={() => toggleFlip(selectedCard.id)}
            style={{ transform: 'scale(1.2)' }}
          />
        </div>
      )}

      {/* Card creator modal */}
      {showCreator && (
        <CardCreator onClose={() => setShowCreator(false)} onSave={handleCreateCard} />
      )}

      {/* Pack opening animation */}
      {showPackOpening && (
        <PackOpening cards={packCards} onComplete={() => setShowPackOpening(false)} />
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '80px',
          padding: '40px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.3))',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              color: '#6b7280',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>👆</span> Click cards to flip
          </div>
          <div
            style={{
              color: '#6b7280',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🎴</span> Open packs for surprises
          </div>
          <div
            style={{
              color: '#6b7280',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>✨</span> Create custom legends
          </div>
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>
          Tech Legend Cards • Celebrating the pioneers of computing
        </p>
      </div>
    </div>
  );
};

export default Completion29;
