import React, { useState, useEffect, useMemo } from 'react';

const COLORS = [
  '#FF6B6B', // Red-ish
  '#4ECDC4', // Teal-ish
  '#45B7D1', // Blue-ish
  '#F7FFF7', // White-ish
  '#FFE66D', // Yellow-ish
];

const CATEGORIES = ['Alpha', 'Beta', 'Gamma', 'Delta'];

const Completion25 = () => {
  const [mode, setMode] = useState('grid'); // grid, radial, group, spiral
  const [items, setItems] = useState([]);

  // Generate Items
  useEffect(() => {
    const newItems = Array.from({ length: 144 }, (_, i) => {
      const categoryIndex = i % 4;
      return {
        id: i,
        category: CATEGORIES[categoryIndex],
        color: COLORS[categoryIndex],
        val: Math.random(),
      };
    });
    setItems(newItems);
  }, []);

  // Layout Calculations
  const getPosition = (index, total, mode, categoryIndex) => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (mode) {
      case 'grid': {
        const cols = 12;
        const row = Math.floor(index / cols);
        const col = index % cols;
        const spacing = 50;
        const startX = centerX - (cols * spacing) / 2 + spacing / 2;
        const startY = centerY - (12 * spacing) / 2 + spacing / 2;
        return {
          x: startX + col * spacing,
          y: startY + row * spacing,
          rotation: 0,
          scale: 1,
        };
      }
      case 'radial': {
        const anglePerItem = (2 * Math.PI) / total;
        const radius = Math.sqrt(index) * 20; // Spiral-ish distribution for visibility or concentric
        // Let's do concentric rings
        const ringSize = 20; // items per ring doubles? No, let's keep it simple.
        // Simple phyllotaxis
        const angle = index * 137.5 * (Math.PI / 180);
        const r = 25 * Math.sqrt(index);
        return {
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
          rotation: angle * (180 / Math.PI) - 90,
          scale: 1,
        };
      }
      case 'group': {
        // 4 Groups, one in each quadrant
        const groupIndex = categoryIndex;
        // Offsets for each group center
        const groupCenters = [
          { x: width * 0.25, y: height * 0.25 },
          { x: width * 0.75, y: height * 0.25 },
          { x: width * 0.25, y: height * 0.75 },
          { x: width * 0.75, y: height * 0.75 },
        ];
        const center = groupCenters[groupIndex];

        // Find index *within* this group
        // This is a bit tricky because index is global.
        // We can approximate or pre-calculate group-local indices.
        // Since we distributed categories simply (i % 4), the local index is roughly i / 4.
        const localIndex = Math.floor(index / 4);

        // Small grid within the group
        const gCols = 6;
        const gRow = Math.floor(localIndex / gCols);
        const gCol = localIndex % gCols;
        const spacing = 30;

        return {
          x: center.x + (gCol - gCols / 2) * spacing + spacing / 2,
          y: center.y + (gRow - 6 / 2) * spacing + spacing / 2, // assuming approx 6 rows
          rotation: 0,
          scale: 1,
        };
      }
      case 'spiral': {
        const angle = 0.2 * index;
        const r = 4 * index;
        // Normalize to fit
        return {
          x: centerX + (r * 0.6) * Math.cos(angle),
          y: centerY + (r * 0.6) * Math.sin(angle),
          rotation: angle * (180 / Math.PI),
          scale: 0.5 + (index / total) * 1.5, // Scale grows
        };
      }
      default:
        return { x: 0, y: 0, rotation: 0, scale: 1 };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '"Outfit", sans-serif',
      overflow: 'hidden'
    }}>
      <div style={{ marginTop: '20px', zIndex: 10 }}>
        <h1 style={{ marginBottom: '20px', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>Shape Shifting Grid</h1>
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '30px', backdropFilter: 'blur(10px)' }}>
          {['grid', 'radial', 'group', 'spiral'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? '#e94560' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: mode === m ? '0 4px 15px rgba(233, 69, 96, 0.4)' : 'none'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        marginTop: '20px',
        // background: 'rgba(0,0,0,0.2)', // Debug container
        borderRadius: '20px',
      }}>
        {items.map((item, i) => {
          const pos = getPosition(i, items.length, mode, i % 4);
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '30px',
                height: '30px',
                backgroundColor: item.color,
                borderRadius: mode === 'radial' ? '50%' : '8px',
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale})`,
                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
                boxShadow: `0 0 10px ${item.color}80`, // Glow
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'rgba(0,0,0,0.6)',
                cursor: 'pointer',
              }}
              title={`Category: ${item.category}`}
            >
              {/* Optional content inside */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Completion25;
