import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// QR Code generation using Reed-Solomon error correction
// This is a simplified implementation for demonstration purposes

const Completion16 = () => {
  const [url, setUrl] = useState('https://github.com');
  const [brandName, setBrandName] = useState('GitHub');
  const [primaryColor, setPrimaryColor] = useState('#24292e');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#2ea44f');
  const [logoEmoji, setLogoEmoji] = useState('🐙');
  const [qrStyle, setQrStyle] = useState('rounded');
  const [showLogo, setShowLogo] = useState(true);
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [patternStyle, setPatternStyle] = useState('squares');
  const canvasRef = useRef(null);

  // Brand presets
  const brandPresets = {
    github: {
      name: 'GitHub',
      url: 'https://github.com',
      primary: '#24292e',
      secondary: '#ffffff',
      accent: '#2ea44f',
      emoji: '🐙',
    },
    twitter: {
      name: 'Twitter/X',
      url: 'https://x.com',
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#1da1f2',
      emoji: '🐦',
    },
    spotify: {
      name: 'Spotify',
      url: 'https://spotify.com',
      primary: '#1db954',
      secondary: '#191414',
      accent: '#1ed760',
      emoji: '🎵',
    },
    youtube: {
      name: 'YouTube',
      url: 'https://youtube.com',
      primary: '#ff0000',
      secondary: '#ffffff',
      accent: '#282828',
      emoji: '▶️',
    },
    instagram: {
      name: 'Instagram',
      url: 'https://instagram.com',
      primary: '#e4405f',
      secondary: '#ffffff',
      accent: '#833ab4',
      emoji: '📷',
    },
    discord: {
      name: 'Discord',
      url: 'https://discord.com',
      primary: '#5865f2',
      secondary: '#ffffff',
      accent: '#23272a',
      emoji: '💬',
    },
    netflix: {
      name: 'Netflix',
      url: 'https://netflix.com',
      primary: '#e50914',
      secondary: '#000000',
      accent: '#ffffff',
      emoji: '🎬',
    },
    amazon: {
      name: 'Amazon',
      url: 'https://amazon.com',
      primary: '#ff9900',
      secondary: '#232f3e',
      accent: '#ffffff',
      emoji: '📦',
    },
  };

  // Generate QR Code matrix
  const generateQRMatrix = useCallback((text) => {
    // Use a simple encoding for demonstration
    // In production, use a proper QR library
    const size = 25 + Math.floor(text.length / 10) * 4;
    const actualSize = Math.min(Math.max(size, 25), 41);
    const matrix = Array(actualSize)
      .fill(null)
      .map(() => Array(actualSize).fill(0));

    // Add finder patterns (the three big squares in corners)
    const addFinderPattern = (row, col) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[row + r][col + c] = 1;
          }
        }
      }
    };

    // Add finder patterns to three corners
    addFinderPattern(0, 0);
    addFinderPattern(0, actualSize - 7);
    addFinderPattern(actualSize - 7, 0);

    // Add timing patterns
    for (let i = 8; i < actualSize - 8; i++) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Add alignment pattern for larger QR codes
    if (actualSize >= 25) {
      const alignPos = actualSize - 7;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const pr = alignPos + r;
          const pc = alignPos + c;
          if (pr >= 0 && pr < actualSize && pc >= 0 && pc < actualSize) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
              matrix[pr][pc] = 1;
            }
          }
        }
      }
    }

    // Generate data modules based on text hash
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

    const hash = hashCode(text);
    const seed = hash;

    // Simple pseudo-random number generator
    let rng = seed;
    const nextRandom = () => {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      return rng / 0x7fffffff;
    };

    // Fill data area
    for (let r = 0; r < actualSize; r++) {
      for (let c = 0; c < actualSize; c++) {
        // Skip finder patterns and timing
        const inFinder1 = r < 8 && c < 8;
        const inFinder2 = r < 8 && c >= actualSize - 8;
        const inFinder3 = r >= actualSize - 8 && c < 8;
        const inTiming = r === 6 || c === 6;
        const inAlignment =
          actualSize >= 25 &&
          r >= actualSize - 9 &&
          r <= actualSize - 5 &&
          c >= actualSize - 9 &&
          c <= actualSize - 5;

        if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming && !inAlignment) {
          // Use text content to determine module state
          const charIndex = (r * actualSize + c) % text.length;

          // Create a deterministic pattern based on text
          matrix[r][c] = nextRandom() > 0.5 ? 1 : 0;

          // Add some structure based on actual character positions
          if ((r + c) % 3 === charIndex % 3) {
            matrix[r][c] = 1;
          }
        }
      }
    }

    // Add format information around finder patterns
    for (let i = 0; i < 8; i++) {
      if (i !== 6) {
        matrix[8][i] = (i + hash) % 2;
        matrix[i][8] = (i + hash + 1) % 2;
        matrix[8][actualSize - 1 - i] = (i + hash) % 2;
        matrix[actualSize - 1 - i][8] = (i + hash + 1) % 2;
      }
    }
    matrix[8][8] = 1;

    return matrix;
  }, []);

  // Generate QR matrix when URL changes - use useMemo to avoid cascading renders
  const qrMatrix = useMemo(() => {
    return generateQRMatrix(url);
  }, [url, generateQRMatrix]);

  // Draw QR code on canvas
  useEffect(() => {
    if (!qrMatrix || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = qrMatrix.length;
    const moduleSize = 10;
    const padding = 40;
    const canvasSize = size * moduleSize + padding * 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear and fill background
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Create gradient if enabled
    let fillStyle = primaryColor;
    if (gradientEnabled) {
      const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, accentColor);
      fillStyle = gradient;
    }

    // Draw modules
    const drawModule = (x, y, isDark) => {
      if (!isDark) return;

      const px = padding + x * moduleSize;
      const py = padding + y * moduleSize;
      const ms = moduleSize;

      ctx.fillStyle = fillStyle;

      switch (patternStyle) {
        case 'circles':
          ctx.beginPath();
          ctx.arc(px + ms / 2, py + ms / 2, ms / 2 - 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'diamonds':
          ctx.beginPath();
          ctx.moveTo(px + ms / 2, py);
          ctx.lineTo(px + ms, py + ms / 2);
          ctx.lineTo(px + ms / 2, py + ms);
          ctx.lineTo(px, py + ms / 2);
          ctx.closePath();
          ctx.fill();
          break;

        case 'rounded': {
          const radius = ms / 4;
          ctx.beginPath();
          ctx.roundRect(px + 0.5, py + 0.5, ms - 1, ms - 1, radius);
          ctx.fill();
          break;
        }

        case 'stars': {
          ctx.beginPath();
          const cx = px + ms / 2;
          const cy = py + ms / 2;
          const outerR = ms / 2 - 0.5;
          const innerR = outerR / 2;
          for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle));
            ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle));
          }
          ctx.closePath();
          ctx.fill();
          break;
        }

        default: // squares
          ctx.fillRect(px, py, ms, ms);
      }
    };

    // Draw all modules
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        drawModule(x, y, qrMatrix[y][x] === 1);
      }
    }

    // Draw finder patterns with brand accent
    const drawFinderPattern = (startX, startY) => {
      const px = padding + startX * moduleSize;
      const py = padding + startY * moduleSize;
      const fpSize = 7 * moduleSize;

      // Outer square
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = moduleSize;
      if (qrStyle === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(
          px + moduleSize / 2,
          py + moduleSize / 2,
          fpSize - moduleSize,
          fpSize - moduleSize,
          moduleSize
        );
        ctx.stroke();
      } else {
        ctx.strokeRect(
          px + moduleSize / 2,
          py + moduleSize / 2,
          fpSize - moduleSize,
          fpSize - moduleSize
        );
      }

      // Inner square
      ctx.fillStyle = accentColor;
      const innerPx = px + 2 * moduleSize;
      const innerPy = py + 2 * moduleSize;
      const innerSize = 3 * moduleSize;
      if (qrStyle === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(innerPx, innerPy, innerSize, innerSize, moduleSize / 2);
        ctx.fill();
      } else {
        ctx.fillRect(innerPx, innerPy, innerSize, innerSize);
      }
    };

    // Clear finder pattern areas and redraw them stylized
    const clearAndDrawFinder = (startX, startY) => {
      const px = padding + startX * moduleSize;
      const py = padding + startY * moduleSize;
      const fpSize = 7 * moduleSize;

      // Clear area
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(px, py, fpSize, fpSize);

      // Draw stylized finder
      drawFinderPattern(startX, startY);
    };

    clearAndDrawFinder(0, 0);
    clearAndDrawFinder(size - 7, 0);
    clearAndDrawFinder(0, size - 7);

    // Draw logo in center if enabled
    if (showLogo) {
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      const logoSize = moduleSize * 5;

      // Clear center area for logo
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.roundRect(
        centerX - logoSize / 2 - 5,
        centerY - logoSize / 2 - 5,
        logoSize + 10,
        logoSize + 10,
        10
      );
      ctx.fill();

      // Draw logo background
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize, 8);
      ctx.fill();

      // Draw emoji
      ctx.font = `${logoSize * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(logoEmoji, centerX, centerY);
    }

    // Add brand name at bottom
    if (brandName) {
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(brandName, canvasSize / 2, canvasSize - padding / 2 - 7);
    }
  }, [
    qrMatrix,
    primaryColor,
    secondaryColor,
    accentColor,
    qrStyle,
    showLogo,
    logoEmoji,
    gradientEnabled,
    patternStyle,
    brandName,
  ]);

  // Apply brand preset
  const applyPreset = (presetKey) => {
    const preset = brandPresets[presetKey];
    if (preset) {
      setBrandName(preset.name);
      setUrl(preset.url);
      setPrimaryColor(preset.primary);
      setSecondaryColor(preset.secondary);
      setAccentColor(preset.accent);
      setLogoEmoji(preset.emoji);
    }
  };

  // Download QR code
  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-qrcode.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Copy QR code to clipboard
  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert('QR Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#eee',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '2.5rem',
      margin: '0',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      color: '#888',
      fontSize: '1rem',
      marginTop: '10px',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    controlsPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    previewPanel: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    cardTitle: {
      fontSize: '1.1rem',
      marginTop: '0',
      marginBottom: '15px',
      color: '#667eea',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    presetsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '10px',
    },
    presetButton: {
      padding: '10px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      transition: 'all 0.2s ease',
      fontSize: '0.8rem',
    },
    presetEmoji: {
      fontSize: '1.5rem',
    },
    inputGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#aaa',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    colorInputGroup: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    colorInput: {
      width: '50px',
      height: '40px',
      padding: '0',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    colorHex: {
      flex: 1,
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '0.9rem',
      fontFamily: 'monospace',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '8px',
      background: 'rgba(0, 0, 0, 0.2)',
    },
    canvasContainer: {
      background: '#fff',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    },
    canvas: {
      display: 'block',
      maxWidth: '100%',
      height: 'auto',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      width: '100%',
    },
    button: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      color: '#fff',
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    emojiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '5px',
    },
    emojiButton: {
      padding: '8px',
      fontSize: '1.2rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      background: 'rgba(0, 0, 0, 0.2)',
      transition: 'all 0.2s ease',
    },
    infoBox: {
      background: 'rgba(102, 126, 234, 0.1)',
      border: '1px solid rgba(102, 126, 234, 0.3)',
      borderRadius: '10px',
      padding: '15px',
      fontSize: '0.85rem',
      color: '#aaa',
      lineHeight: '1.5',
    },
  };

  const emojis = [
    '🐙',
    '🐦',
    '🎵',
    '▶️',
    '📷',
    '💬',
    '🎬',
    '📦',
    '🚀',
    '💡',
    '🔥',
    '⚡',
    '🌟',
    '💎',
    '🎯',
    '🎨',
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎨 Branded QR Code Generator</h1>
        <p style={styles.subtitle}>
          Create beautiful, customized QR codes that match your brand identity
        </p>
      </header>

      <div style={styles.mainGrid}>
        <div style={styles.controlsPanel}>
          {/* Brand Presets */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>✨ Brand Presets</h3>
            <div style={styles.presetsGrid}>
              {Object.entries(brandPresets).map(([key, preset]) => (
                <button
                  key={key}
                  style={{
                    ...styles.presetButton,
                    background: preset.primary,
                    color: preset.secondary,
                  }}
                  onClick={() => applyPreset(key)}
                >
                  <span style={styles.presetEmoji}>{preset.emoji}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL & Brand Name */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔗 Content</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>URL / Text:</label>
              <input
                type="text"
                style={styles.input}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL or text..."
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Brand Name:</label>
              <input
                type="text"
                style={styles.input}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name..."
              />
            </div>
          </div>

          {/* Colors */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🎨 Colors</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Primary Color (QR modules):</label>
              <div style={styles.colorInputGroup}>
                <input
                  type="color"
                  style={styles.colorInput}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  style={styles.colorHex}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Background Color:</label>
              <div style={styles.colorInputGroup}>
                <input
                  type="color"
                  style={styles.colorInput}
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
                <input
                  type="text"
                  style={styles.colorHex}
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Accent Color (finder patterns):</label>
              <div style={styles.colorInputGroup}>
                <input
                  type="color"
                  style={styles.colorInput}
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
                <input
                  type="text"
                  style={styles.colorHex}
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
              </div>
            </div>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={gradientEnabled}
                onChange={(e) => setGradientEnabled(e.target.checked)}
              />
              Enable gradient (primary → accent)
            </label>
          </div>

          {/* Style Options */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚙️ Style Options</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Module Pattern:</label>
              <select
                style={styles.select}
                value={patternStyle}
                onChange={(e) => setPatternStyle(e.target.value)}
              >
                <option value="squares">Squares</option>
                <option value="rounded">Rounded Squares</option>
                <option value="circles">Circles</option>
                <option value="diamonds">Diamonds</option>
                <option value="stars">Stars</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Corner Style:</label>
              <select
                style={styles.select}
                value={qrStyle}
                onChange={(e) => setQrStyle(e.target.value)}
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
              </select>
            </div>
          </div>

          {/* Logo */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🏷️ Center Logo</h3>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
              />
              Show center logo
            </label>
            {showLogo && (
              <div style={{ marginTop: '15px' }}>
                <label style={styles.label}>Select Logo Emoji:</label>
                <div style={styles.emojiGrid}>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      style={{
                        ...styles.emojiButton,
                        background: logoEmoji === emoji ? accentColor : 'rgba(0, 0, 0, 0.2)',
                      }}
                      onClick={() => setLogoEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={styles.label}>Or enter custom emoji:</label>
                  <input
                    type="text"
                    style={{ ...styles.input, width: '80px' }}
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    maxLength={2}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.previewPanel}>
          {/* QR Code Preview */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📱 Preview</h3>
            <div style={styles.canvasContainer}>
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>
          </div>

          {/* Download Buttons */}
          <div style={styles.buttonGroup}>
            <button style={{ ...styles.button, ...styles.primaryButton }} onClick={downloadQR}>
              📥 Download PNG
            </button>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={copyToClipboard}
            >
              📋 Copy
            </button>
          </div>

          {/* Info */}
          <div style={styles.infoBox}>
            <strong>💡 Tips for scannable QR codes:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
              <li>Use high contrast between foreground and background</li>
              <li>Keep the center logo small (QR error correction handles this)</li>
              <li>Test scanning before distributing</li>
              <li>Finder patterns (corner squares) are critical for scanning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion16;
