import React, { useState, useMemo } from 'react';

// Tech stack data organized by categories
const techData = {
  'Frontend Frameworks': {
    color: '#61DAFB',
    icon: '⚛️',
    items: [
      { name: 'React', desc: 'UI library by Meta' },
      { name: 'Vue', desc: 'Progressive framework' },
      { name: 'Angular', desc: 'Platform by Google' },
      { name: 'Svelte', desc: 'Compiler-based' },
      { name: 'Solid', desc: 'Reactive primitives' },
      { name: 'Preact', desc: 'Lightweight React' },
    ],
  },
  'Backend Languages': {
    color: '#68A063',
    icon: '🖥️',
    items: [
      { name: 'Node.js', desc: 'JavaScript runtime' },
      { name: 'Python', desc: 'General purpose' },
      { name: 'Go', desc: 'Fast & simple' },
      { name: 'Rust', desc: 'Safe & fast' },
      { name: 'Java', desc: 'Enterprise grade' },
      { name: 'C#', desc: '.NET ecosystem' },
    ],
  },
  Databases: {
    color: '#336791',
    icon: '🗄️',
    items: [
      { name: 'PostgreSQL', desc: 'Relational DB' },
      { name: 'MongoDB', desc: 'Document store' },
      { name: 'Redis', desc: 'In-memory cache' },
      { name: 'MySQL', desc: 'Popular SQL' },
      { name: 'SQLite', desc: 'Embedded DB' },
      { name: 'Cassandra', desc: 'Wide column' },
    ],
  },
  'Cloud Services': {
    color: '#FF9900',
    icon: '☁️',
    items: [
      { name: 'AWS', desc: 'Amazon cloud' },
      { name: 'GCP', desc: 'Google cloud' },
      { name: 'Azure', desc: 'Microsoft cloud' },
      { name: 'Vercel', desc: 'Frontend cloud' },
      { name: 'Netlify', desc: 'Web hosting' },
      { name: 'Cloudflare', desc: 'Edge network' },
    ],
  },
  DevOps: {
    color: '#2496ED',
    icon: '🔧',
    items: [
      { name: 'Docker', desc: 'Containers' },
      { name: 'Kubernetes', desc: 'Orchestration' },
      { name: 'GitHub Actions', desc: 'CI/CD' },
      { name: 'Terraform', desc: 'Infrastructure' },
      { name: 'Ansible', desc: 'Automation' },
      { name: 'Jenkins', desc: 'Build server' },
    ],
  },
  'Testing Tools': {
    color: '#C21325',
    icon: '🧪',
    items: [
      { name: 'Jest', desc: 'JS testing' },
      { name: 'Cypress', desc: 'E2E testing' },
      { name: 'Playwright', desc: 'Browser testing' },
      { name: 'Vitest', desc: 'Vite-native' },
      { name: 'pytest', desc: 'Python testing' },
      { name: 'Selenium', desc: 'Web automation' },
    ],
  },
  'CSS & Styling': {
    color: '#38BDF8',
    icon: '🎨',
    items: [
      { name: 'Tailwind', desc: 'Utility-first' },
      { name: 'Sass', desc: 'CSS preprocessor' },
      { name: 'styled-components', desc: 'CSS-in-JS' },
      { name: 'CSS Modules', desc: 'Scoped CSS' },
      { name: 'Emotion', desc: 'CSS-in-JS lib' },
      { name: 'Bootstrap', desc: 'Component lib' },
    ],
  },
  'Build Tools': {
    color: '#F7DF1E',
    icon: '📦',
    items: [
      { name: 'Vite', desc: 'Fast dev server' },
      { name: 'Webpack', desc: 'Module bundler' },
      { name: 'esbuild', desc: 'Fast bundler' },
      { name: 'Rollup', desc: 'ES modules' },
      { name: 'Turbopack', desc: 'Rust bundler' },
      { name: 'Parcel', desc: 'Zero config' },
    ],
  },
};

const Completion25 = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const categories = Object.keys(techData);

  const filteredData = useMemo(() => {
    if (!searchTerm) return techData;

    const filtered = {};
    const term = searchTerm.toLowerCase();

    Object.entries(techData).forEach(([category, data]) => {
      const matchingItems = data.items.filter(
        (item) => item.name.toLowerCase().includes(term) || item.desc.toLowerCase().includes(term)
      );
      if (matchingItems.length > 0 || category.toLowerCase().includes(term)) {
        filtered[category] = {
          ...data,
          items: matchingItems.length > 0 ? matchingItems : data.items,
        };
      }
    });

    return filtered;
  }, [searchTerm]);

  const displayedCategories = selectedCategory ? [selectedCategory] : Object.keys(filteredData);

  const totalItems = Object.values(filteredData).reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '30px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '2.5rem',
            marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          📊 Tech Stack Grid
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '20px' }}>
          Explore {totalItems} technologies across {categories.length} categories
        </p>

        {/* Search and Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '1rem',
              borderRadius: '25px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              width: '280px',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />

          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '10px 15px',
                borderRadius: '10px 0 0 10px',
                border: 'none',
                background: viewMode === 'grid' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                transition: 'all 0.2s ease',
              }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '10px 15px',
                borderRadius: '0 10px 10px 0',
                border: 'none',
                background: viewMode === 'list' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                transition: 'all 0.2s ease',
              }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: selectedCategory === null ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background:
                  selectedCategory === cat ? techData[cat].color : 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>{techData[cat].icon}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '25px',
            maxWidth: '1600px',
            margin: '0 auto',
          }}
        >
          {displayedCategories.map((category) => {
            const catData = filteredData[category];
            if (!catData) return null;

            return (
              <div
                key={category}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                  padding: '25px',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${catData.color}33`,
                  transition: 'all 0.3s ease',
                  transform: hoveredItem?.startsWith(category) ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: `2px solid ${catData.color}44`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '2rem',
                      background: `${catData.color}33`,
                      padding: '10px',
                      borderRadius: '12px',
                    }}
                  >
                    {catData.icon}
                  </span>
                  <div>
                    <h2
                      style={{
                        color: catData.color,
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: '600',
                      }}
                    >
                      {category}
                    </h2>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {catData.items.length} technologies
                    </span>
                  </div>
                </div>

                {/* Items Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                  }}
                >
                  {catData.items.map((item) => {
                    const itemKey = `${category}-${item.name}`;
                    const isHovered = hoveredItem === itemKey;

                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          background: isHovered ? `${catData.color}22` : 'rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          padding: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: `1px solid ${isHovered ? catData.color : 'transparent'}`,
                          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                          boxShadow: isHovered ? `0 8px 25px ${catData.color}33` : 'none',
                        }}
                      >
                        <h3
                          style={{
                            color: '#fff',
                            margin: '0 0 5px 0',
                            fontSize: '1rem',
                            fontWeight: '500',
                          }}
                        >
                          {item.name}
                        </h3>
                        <p
                          style={{
                            color: '#94a3b8',
                            margin: 0,
                            fontSize: '0.8rem',
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {displayedCategories.map((category) => {
            const catData = filteredData[category];
            if (!catData) return null;

            return (
              <div
                key={category}
                style={{
                  marginBottom: '15px',
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px 20px',
                    background: `${catData.color}22`,
                    borderRadius: '15px 15px 0 0',
                    borderLeft: `4px solid ${catData.color}`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{catData.icon}</span>
                  <h2
                    style={{
                      color: catData.color,
                      margin: 0,
                      fontSize: '1.2rem',
                      fontWeight: '600',
                    }}
                  >
                    {category}
                  </h2>
                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.85rem',
                      marginLeft: 'auto',
                    }}
                  >
                    {catData.items.length} items
                  </span>
                </div>

                {/* Items List */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0 0 15px 15px',
                    padding: '15px',
                    gap: '10px',
                  }}
                >
                  {catData.items.map((item) => {
                    const itemKey = `${category}-${item.name}`;
                    const isHovered = hoveredItem === itemKey;

                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setHoveredItem(itemKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 15px',
                          background: isHovered ? `${catData.color}22` : 'rgba(255,255,255,0.02)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: `1px solid ${isHovered ? catData.color : 'transparent'}`,
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: catData.color,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <span
                            style={{
                              color: '#fff',
                              fontSize: '0.95rem',
                              fontWeight: '500',
                            }}
                          >
                            {item.name}
                          </span>
                          <span
                            style={{
                              color: '#64748b',
                              fontSize: '0.8rem',
                              marginLeft: '8px',
                            }}
                          >
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '15px',
          maxWidth: '800px',
          margin: '40px auto 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '50px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#6366f1',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {categories.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Categories</div>
          </div>
          <div>
            <div
              style={{
                color: '#22c55e',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {Object.values(techData).reduce((sum, cat) => sum + cat.items.length, 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Technologies</div>
          </div>
          <div>
            <div
              style={{
                color: '#f59e0b',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {viewMode === 'grid' ? '⊞' : '☰'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>View Mode</div>
          </div>
        </div>

        <p style={{ color: '#64748b', marginTop: '20px', fontSize: '0.85rem' }}>
          Grid Group Challenge - Inspired by Google Cloud Cheat Sheet visualization
        </p>
      </div>
    </div>
  );
};

export default Completion25;
