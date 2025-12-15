import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Zap, Code, Terminal, Cpu, Bug, Coffee, Award, Star, ArrowLeft, Grid } from 'lucide-react';

// --- Card Data ---
const CARDS_DATA = [
  {
    id: 'ada',
    name: 'Ada Lovelace',
    role: 'The First Programmer',
    rarity: 'Legendary',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg',
    stats: { impact: 99, innovation: 98, legacy: 100 },
    desc: "Wrote the first algorithm intended to be processed by a machine.",
    color: '#fbbf24'
  },
  {
    id: 'turing',
    name: 'Alan Turing',
    role: 'Father of CS',
    rarity: 'Legendary',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Alan_Turing_Aged_16.jpg',
    stats: { impact: 100, innovation: 99, logic: 100 },
    desc: "Formalized the concepts of algorithm and computation.",
    color: '#fbbf24'
  },
  {
    id: 'grace',
    name: 'Grace Hopper',
    role: 'Rear Admiral',
    rarity: 'Legendary',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg',
    stats: { impact: 95, debugging: 100, leadership: 98 },
    desc: "Pioneered machine-independent programming languages.",
    color: '#fbbf24'
  },
  {
    id: 'linus',
    name: 'Linus Torvalds',
    role: 'Kernel Master',
    rarity: 'Epic',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/LinuxCon_Europe_Linus_Torvalds_03_%28cropped%29.jpg',
    stats: { impact: 98, coding: 99, rage: 90 },
    desc: "Created Linux and Git. Just for fun.",
    color: '#a855f7'
  },
  {
    id: 'berners-lee',
    name: 'Tim Berners-Lee',
    role: 'Web Inventor',
    rarity: 'Epic',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg',
    stats: { impact: 100, humility: 95, html: 100 },
    desc: "Invented the World Wide Web.",
    color: '#a855f7'
  },
  {
    id: 'brendan',
    name: 'Brendan Eich',
    role: 'JS Creator',
    rarity: 'Epic',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Brendan_Eich_Mozilla_Foundation_official_photo.jpg',
    stats: { speed: 99, chaos: 85, ubiquity: 100 },
    desc: "Created JavaScript in 10 days.",
    color: '#a855f7'
  },
  {
    id: 'carmack',
    name: 'John Carmack',
    role: 'Rendering God',
    rarity: 'Rare',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/John_Carmack_GDC_2010.jpg/440px-John_Carmack_GDC_2010.jpg',
    stats: { optimization: 100, math: 98, rockets: 90 },
    desc: "Pioneered 3D graphics techniques used in Doom and Quake.",
    color: '#3b82f6'
  },
  {
    id: 'dan',
    name: 'Dan Abramov',
    role: 'React Core',
    rarity: 'Rare',
    image: 'https://avatars.githubusercontent.com/u/810438?v=4',
    stats: { teaching: 95, redux: 90, hot_loading: 85 },
    desc: "Co-authored Redux and Create React App.",
    color: '#3b82f6'
  },
  {
    id: 'vjeux',
    name: 'Vjeux',
    role: 'Challenge Creator',
    rarity: 'Rare',
    image: 'https://avatars.githubusercontent.com/u/197597?v=4',
    stats: { css_in_js: 90, react_native: 90, challenges: 100 },
    desc: "Judge of the Algorithm Arena.",
    color: '#3b82f6'
  },
  {
    id: 'junior',
    name: 'Junior Dev',
    role: 'Console Logger',
    rarity: 'Common',
    image: null,
    fallbackInitials: 'JD',
    stats: { enthusiasm: 100, experience: 10, google_fu: 80 },
    desc: "Breaks production on Fridays.",
    color: '#a1a1aa'
  },
  {
    id: 'senior',
    name: 'Senior Dev',
    role: 'Meeting Attendee',
    rarity: 'Common',
    image: null,
    fallbackInitials: 'SD',
    stats: { code_review: 95, meetings: 100, coding: 20 },
    desc: "Hasn't pushed code in weeks. 'It depends'.",
    color: '#a1a1aa'
  },
  {
    id: '10x',
    name: '10x Developer',
    role: 'The Myth',
    rarity: 'Common',
    image: null,
    fallbackInitials: '10x',
    stats: { speed: 100, readability: 0, ego: 100 },
    desc: "Writes code nobody else can understand.",
    color: '#a1a1aa'
  },
];

const RARITY_WEIGHTS = {
  Common: 60,
  Rare: 30,
  Epic: 9,
  Legendary: 1
};

const getRandomCard = () => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let chosenRarity = 'Common';

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (rand <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }

  const pool = CARDS_DATA.filter(c => c.rarity === chosenRarity);
  const card = pool[Math.floor(Math.random() * pool.length)];

  // Return unique instance
  return { ...card, instanceId: Math.random().toString(36).substr(2, 9), pulledAt: Date.now() };
};

// --- Styles ---

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  :root {
    --color-legendary: #fbbf24;
    --color-epic: #a855f7;
    --color-rare: #3b82f6;
    --color-common: #a1a1aa;
  }

  .font-outfit {
    font-family: 'Outfit', sans-serif;
  }

  .tech-card-scene {
    perspective: 1200px;
    user-select: none;
  }

  .tech-card {
    transition: transform 0.1s ease-out;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .is-revealed {
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Holographic Foil Effect */
  .foil-layer {
    background: linear-gradient(
      115deg,
      transparent 20%,
      rgba(255, 255, 255, 0.2) 35%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0.2) 65%,
      transparent 80%
    );
    mix-blend-mode: color-dodge;
    background-size: 200% 200%;
    opacity: 0;
    pointer-events: none;
    z-index: 20;
  }
  
  .holo-sparkle {
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cstar points='50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35' fill='white'/%3E%3C/svg%3E");
    background-size: 10px 10px;
    opacity: 0.1;
  }

  .card-face {
    backface-visibility: hidden;
    position: absolute;
    inset: 0;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }

  .floating {
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(1deg); }
  }
  
  .bg-grid-pattern {
    background-size: 50px 50px;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    z-index: 0;
    animation: pulse-glow 10s infinite alternate;
  }
  
  @keyframes pulse-glow {
    0% { transform: scale(1); opacity: 0.3; }
    100% { transform: scale(1.2); opacity: 0.5; }
  }

  .rarity-glow-Legendary { box-shadow: 0 0 30px rgba(251, 191, 36, 0.3); }
  .rarity-glow-Epic { box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); }
  .rarity-glow-Rare { box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); }
  .rarity-glow-Common { box-shadow: 0 0 10px rgba(161, 161, 170, 0.1); }
`;

// --- Components ---

const Card = ({ data, isRevealed, onClick, size = 'normal' }) => {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Parallax / Tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotateX, y: rotateY });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return '#fbbf24';
      case 'Epic': return '#a855f7';
      case 'Rare': return '#3b82f6';
      default: return '#71717a';
    }
  };

  const borderColor = getRarityColor(data.rarity);
  // Scale mapping
  const scaleMap = { 'large': 1.4, 'small': 0.75, 'normal': 1 };
  const scale = scaleMap[size];

  const width = 300;
  const height = 450;

  return (
    <div
      className="tech-card-scene relative cursor-pointer group"
      style={{ width: width * scale, height: height * scale }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        ref={cardRef}
        className={`tech-card absolute w-full h-full rounded-2xl transition-all duration-300 ${isRevealed ? `rarity-glow-${data.rarity}` : 'shadow-2xl'}`}
        style={{
          transform: isRevealed
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            : `rotateY(180deg)`,
        }}
      >
        {/* FRONT */}
        <div
          className="card-face bg-zinc-900 border-[6px] flex flex-col"
          style={{ borderColor: borderColor }}
        >
          {/* Header */}
          <div className="relative px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50 flex justify-between items-center z-10 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
            <div>
              <h3 className="font-outfit font-bold text-lg leading-none tracking-tight text-white">{data.name}</h3>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{data.role}</span>
            </div>

            {data.rarity === 'Legendary' && <Star size={18} className="fill-yellow-400 text-yellow-400 animate-pulse" />}
            {data.rarity === 'Epic' && <Sparkles size={18} className="text-purple-400" />}
          </div>

          {/* Image */}
          <div className="relative h-52 bg-zinc-950 flex items-center justify-center overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(${borderColor}33 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}>
            </div>

            {data.image ? (
              <div className="relative w-full h-full p-2">
                <div className="w-full h-full rounded overflow-hidden relative group-hover:scale-105 transition-transform duration-700 ease-out">
                  <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-60"></div>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-500 font-mono">
                {data.fallbackInitials}
              </div>
            )}

            {/* Rarity Watermark */}
            <div className="absolute bottom-[-10px] right-[-10px] text-8xl font-black text-white/5 rotate-[-15deg] pointer-events-none select-none">
              {data.rarity[0]}
            </div>
          </div>

          {/* Stats & Description */}
          <div className="flex-1 bg-zinc-900 p-4 flex flex-col gap-3 relative overflow-hidden">
            {/* Tech Decoration */}
            <div className="absolute top-0 right-0 p-1 opacity-20">
              <Grid size={120} className="text-zinc-500" />
            </div>

            <div className="space-y-2 relative z-10">
              {Object.entries(data.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-3">
                  <div className="w-20 text-[10px] font-bold uppercase text-zinc-500 tracking-wider text-right">{stat.replace('_', ' ')}</div>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                    <div
                      className="h-full rounded-full relative"
                      style={{ width: `${value}%`, backgroundColor: borderColor }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full opacity-50"></div>
                    </div>
                  </div>
                  <div className="w-6 text-[10px] font-mono text-zinc-300 text-right">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-auto relative z-10 bg-zinc-800/50 p-2 rounded border border-zinc-700/50">
              <p className="text-[11px] text-zinc-400 italic leading-snug text-center">"{data.desc}"</p>
            </div>
          </div>

          {/* Holographic Overlays */}
          <div
            className="foil-layer absolute inset-0 rounded-2xl"
            style={{
              opacity: isHovered ? 0.35 : 0,
              backgroundPosition: `${glow.x}% ${glow.y}%`,
              transition: 'opacity 0.2s'
            }}
          />
          {/* Edge Glow */}
          <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/10"></div>
        </div>

        {/* BACK */}
        <div className="card-face card-back bg-zinc-900 border-4 border-zinc-700 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950"></div>

          {/* Circuit Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%23fff'/%3E%3C/svg%3E")` }}></div>

          <div className="z-10 relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 rotate-12 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-6 mx-auto group-hover:rotate-[24deg] transition-all duration-500">
              <Cpu className="text-white w-12 h-12 -rotate-12 group-hover:-rotate-[24deg] transition-all duration-500" />
            </div>

            <h2 className="text-3xl font-black text-white tracking-widest text-center leading-none font-outfit">
              TECH<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CARDS</span>
            </h2>
            <div className="mt-4 flex gap-2 justify-center opacity-50">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pack = ({ onClick, disabled }) => {
  return (
    <div className="perspective-1000">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative w-64 h-96 group transition-all duration-500
          ${disabled ? 'opacity-0 scale-75 pointer-events-none' : 'hover:scale-105 cursor-pointer floating'}
        `}
      >
        <div className="absolute inset-0 bg-zinc-900/20 transform rotate-x-12 blur-xl scale-90 translate-y-8"></div>

        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-black border border-white/10 shadow-2xl transform-style-3d rotate-y-12 group-hover:rotate-y-0 transition-transform duration-500">

          {/* Foil Texture */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/crumpled-paper.png')]"></div>

          {/* Color Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-pink-600/80 mix-blend-color-dodge"></div>

          {/* Shine Sweep */}
          <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-black/30 p-4 rounded-full backdrop-blur-md border border-white/20 mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Zap size={48} className="fill-yellow-400 text-yellow-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </div>

            <h2 className="text-4xl font-black uppercase text-white tracking-tighter drop-shadow-md font-outfit mb-2">
              Cyber<br />Legends
            </h2>

            <div className="inline-block bg-white/10 rounded px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-indigo-200 border border-white/10">
              SERIES 1
            </div>

            <div className="mt-12 text-xs font-medium text-white/60">
              Contains 5 Premium Cards
            </div>
          </div>

          {/* Sealing Ridges */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/20 to-transparent repeating-linear-gradient-x"></div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
      </button>
    </div>
  );
};

// --- Main App ---

export default function TechCardsGame() {
  const [scene, setScene] = useState('menu');
  const [openingCards, setOpeningCards] = useState([]);
  const [inventory, setInventory] = useState([]);

  const openPack = () => {
    setScene('opening');
    const newCards = Array.from({ length: 5 }, () => getRandomCard());
    setOpeningCards(newCards);
  };

  const handlePackFinished = () => {
    setInventory(prev => [...prev, ...openingCards]);
    setScene('collection');
  };

  // Sort inventory: Legendary -> Epic -> Rare -> Common
  const sortedInventory = [...inventory].sort((a, b) => {
    const rarityOrder = { Legendary: 3, Epic: 2, Rare: 1, Common: 0 };
    if (rarityOrder[b.rarity] !== rarityOrder[a.rarity]) {
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    }
    return b.pulledAt - a.pulledAt; // Newest first for same rarity
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <style>{styles}</style>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="orb bg-indigo-600 top-[-10%] left-[20%] w-[500px] h-[500px]"></div>
        <div className="orb bg-purple-600 bottom-[-10%] right-[10%] w-[600px] h-[600px] animation-delay-2000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setScene('menu')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur rounded-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-zinc-900 p-2 rounded-lg border border-white/10">
                <Code size={24} className="text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-outfit font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Tech<span className="text-indigo-500">Cards</span></h1>
            </div>
          </div>

          <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-full border border-white/5">
            <button
              onClick={() => setScene('collection')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${scene === 'collection' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Collection <span className="ml-1 opacity-60 text-xs">({inventory.length})</span>
            </button>
            <button
              onClick={() => setScene('menu')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${scene === 'menu' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Pack Store
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="relative pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">

        {scene === 'menu' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-4 mb-16 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4">
                <Star size={12} fill="currentColor" /> Season 1 Available
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 pb-2 font-outfit drop-shadow-sm">
                LEGENDS OF CODE
              </h2>
              <p className="text-zinc-400 max-w-lg mx-auto text-lg leading-relaxed">
                Discover, collect, and trade the visionaries who built the digital world. Find the elusive <span className="text-yellow-400 font-bold">Legendary</span> cards.
              </p>
            </div>

            <div className="relative z-10">
              <Pack onClick={openPack} />

              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Click Pack to Open</p>
              </div>
            </div>
          </div>
        )}

        {scene === 'opening' && (
          <OpeningScene cards={openingCards} onFinished={handlePackFinished} />
        )}

        {scene === 'collection' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-white/5 pb-8">
              <div>
                <h2 className="text-4xl font-black font-outfit text-white mb-2">My Collection</h2>
                <div className="flex gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>{inventory.filter(c => c.rarity === 'Legendary').length} Legendary</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#a855f7]"></div>{inventory.filter(c => c.rarity === 'Epic').length} Epic</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>{inventory.filter(c => c.rarity === 'Rare').length} Rare</div>
                </div>
              </div>

              <button
                onClick={() => setScene('menu')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 group"
              >
                <Zap size={18} className="group-hover:text-yellow-300 transition-colors" />
                Open New Pack
              </button>
            </div>

            {inventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <Code size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No cards found</h3>
                <p className="text-zinc-500 mb-8 max-w-sm text-center">Your binder is currently empty. Go to the store to start your collection!</p>
                <button onClick={() => setScene('menu')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Go to Pack Store &rarr;</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 justify-items-center">
                {sortedInventory.map((card) => (
                  <div key={card.instanceId} className="group relative">
                    <Card data={card} isRevealed={true} size="small" />
                    {/* Hover detail */}
                    <div className="absolute -bottom-10 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-900 border border-white/10`}
                        style={{ color: card.color }}>
                        {card.rarity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// Sub-component for Opening Scene
function OpeningScene({ cards, onFinished }) {
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [canFinish, setCanFinish] = useState(false);

  useEffect(() => {
    if (revealedIndices.size === cards.length) {
      setTimeout(() => setCanFinish(true), 800);
    }
  }, [revealedIndices, cards.length]);

  const toggleReveal = (index) => {
    const newRv = new Set(revealedIndices);
    newRv.add(index);
    setRevealedIndices(newRv);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-3xl font-bold text-white mb-2">Pack Opening</h2>
        <p className="text-zinc-400">Click on each card to reveal it.</p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-8 perspective-1000 w-full max-w-6xl">
        {cards.map((card, idx) => {
          const isRevealed = revealedIndices.has(idx);
          return (
            <div
              key={card.instanceId}
              className={`transition-all duration-700 ease-out transform`}
              style={{
                animation: `deal-card 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                animationDelay: `${idx * 0.15}s`,
                opacity: 0,
                transform: 'translateY(100px) scale(0.8)'
              }}
              onAnimationEnd={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.animation = 'none';
              }}
            >
              <style>{`
                 @keyframes deal-card {
                   to { opacity: 1; transform: translateY(0) scale(1); }
                 }
              `}</style>

              <div className={!isRevealed ? 'hover:-translate-y-4 transition-transform duration-300' : ''}>
                <Card
                  data={card}
                  isRevealed={isRevealed}
                  onClick={() => toggleReveal(idx)}
                />
              </div>

              {!isRevealed && (
                <div className="text-center mt-6">
                  <div className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`fixed bottom-12 left-0 right-0 flex justify-center transition-all duration-700 ${canFinish ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
        <button
          onClick={onFinished}
          className="bg-white text-black text-lg font-bold px-10 py-4 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 z-50"
        >
          Collect All <ArrowLeft className="rotate-180" size={20} />
        </button>
      </div>
    </div>
  );
}
