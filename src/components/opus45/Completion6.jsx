import React, { useState, useCallback, useMemo } from "react";

const defaultCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const quickSort = (arr) => {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
};

class BinaryTree {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
  insert(value) {
    if (value < this.value) {
      if (this.left) this.left.insert(value);
      else this.left = new BinaryTree(value);
    } else {
      if (this.right) this.right.insert(value);
      else this.right = new BinaryTree(value);
    }
  }
}`;

// Shape generators that return array of widths for each row
const shapes = {
  circle: (rows, maxWidth) => {
    const result = [];
    const radius = rows / 2;
    for (let i = 0; i < rows; i++) {
      const y = (i - radius + 0.5) / radius;
      const width = Math.sqrt(1 - y * y) * maxWidth;
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  triangle: (rows, maxWidth) => {
    const result = [];
    for (let i = 0; i < rows; i++) {
      const width = ((i + 1) / rows) * maxWidth;
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  diamond: (rows, maxWidth) => {
    const result = [];
    const half = rows / 2;
    for (let i = 0; i < rows; i++) {
      const distFromCenter = Math.abs(i - half + 0.5);
      const width = (1 - distFromCenter / half) * maxWidth;
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  heart: (rows, maxWidth) => {
    const result = [];
    for (let i = 0; i < rows; i++) {
      const t = i / rows;
      let width;
      if (t < 0.3) {
        // Top of heart - two bumps
        const localT = t / 0.3;
        width = (0.5 + 0.5 * Math.sin(localT * Math.PI)) * maxWidth;
      } else {
        // Bottom of heart - tapering
        const localT = (t - 0.3) / 0.7;
        width = (1 - localT * localT) * maxWidth;
      }
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  star: (rows, maxWidth) => {
    const result = [];
    const points = 5;
    for (let i = 0; i < rows; i++) {
      const angle = ((i / rows) * Math.PI * 2 * points) / 2;
      const outerRadius = maxWidth / 2;
      const innerRadius = maxWidth / 4;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const y = i / rows;
      const width = Math.max(
        innerRadius,
        (1 - Math.abs(y - 0.5) * 1.5) * radius * 2
      );
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  hourglass: (rows, maxWidth) => {
    const result = [];
    const half = rows / 2;
    for (let i = 0; i < rows; i++) {
      const distFromCenter = Math.abs(i - half + 0.5);
      const width = (0.3 + 0.7 * (distFromCenter / half)) * maxWidth;
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  wave: (rows, maxWidth) => {
    const result = [];
    for (let i = 0; i < rows; i++) {
      const wave = Math.sin((i / rows) * Math.PI * 3);
      const width = (0.5 + 0.5 * wave) * maxWidth * 0.6 + maxWidth * 0.3;
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },

  tree: (rows, maxWidth) => {
    const result = [];
    const trunkStart = Math.floor(rows * 0.85);
    for (let i = 0; i < rows; i++) {
      let width;
      if (i < trunkStart) {
        // Tree crown - triangular with slight steps
        const section = Math.floor((i / trunkStart) * 3);
        const localProgress = ((i / trunkStart) * 3) % 1;
        const baseWidth = ((section + 1) / 3) * 0.3 + localProgress * 0.3;
        width = baseWidth * maxWidth;
      } else {
        // Trunk
        width = maxWidth * 0.15;
      }
      result.push(Math.max(10, Math.round(width)));
    }
    return result;
  },
};

// Tokenize code into meaningful parts
const tokenize = (code) => {
  const tokens = [];
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    if (inString) {
      current += char;
      if (char === stringChar && code[i - 1] !== "\\") {
        tokens.push(current);
        current = "";
        inString = false;
      }
    } else if (char === '"' || char === "'" || char === "`") {
      if (current) tokens.push(current);
      current = char;
      inString = true;
      stringChar = char;
    } else if (/\s/.test(char)) {
      if (current) tokens.push(current);
      current = "";
    } else if (/[{}()\[\];,.]/.test(char)) {
      if (current) tokens.push(current);
      tokens.push(char);
      current = "";
    } else if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
      if (current && !/[+\-*/%=<>!&|^~?:]/.test(current[current.length - 1])) {
        tokens.push(current);
        current = "";
      }
      current += char;
    } else {
      if (current && /[+\-*/%=<>!&|^~?:]/.test(current[current.length - 1])) {
        tokens.push(current);
        current = "";
      }
      current += char;
    }
  }
  if (current) tokens.push(current);

  return tokens.filter((t) => t.trim());
};

// Format code to fit shape
const formatCodeToShape = (code, shapeWidths, fontSize) => {
  const tokens = tokenize(code);
  const lines = [];
  let tokenIndex = 0;

  const charWidth = fontSize * 0.6; // Approximate character width for monospace

  for (
    let row = 0;
    row < shapeWidths.length && tokenIndex < tokens.length;
    row++
  ) {
    const maxChars = Math.floor(shapeWidths[row] / charWidth);
    let line = "";
    let lineChars = 0;

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const tokenLen = token.length + 1; // +1 for space

      if (lineChars + tokenLen <= maxChars || lineChars === 0) {
        line += (line ? " " : "") + token;
        lineChars += tokenLen;
        tokenIndex++;
      } else {
        break;
      }
    }

    // Center the line based on shape width
    const padding = Math.max(
      0,
      Math.floor((shapeWidths[row] - line.length * charWidth) / (2 * charWidth))
    );
    lines.push({ text: line, padding, width: shapeWidths[row] });
  }

  // If we have remaining tokens, add them to extra rows
  while (tokenIndex < tokens.length) {
    const maxChars = Math.floor(
      shapeWidths[shapeWidths.length - 1] / charWidth
    );
    let line = "";
    let lineChars = 0;

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const tokenLen = token.length + 1;

      if (lineChars + tokenLen <= maxChars || lineChars === 0) {
        line += (line ? " " : "") + token;
        lineChars += tokenLen;
        tokenIndex++;
      } else {
        break;
      }
    }
    lines.push({
      text: line,
      padding: 0,
      width: shapeWidths[shapeWidths.length - 1],
    });
  }

  return lines;
};

// Syntax highlighting colors
const highlightToken = (token) => {
  const keywords = [
    "function",
    "const",
    "let",
    "var",
    "if",
    "else",
    "return",
    "class",
    "constructor",
    "new",
    "this",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "try",
    "catch",
    "throw",
    "async",
    "await",
    "import",
    "export",
    "default",
    "from",
  ];
  const builtins = [
    "Math",
    "Array",
    "Object",
    "String",
    "Number",
    "Boolean",
    "console",
    "null",
    "undefined",
    "true",
    "false",
  ];

  if (keywords.includes(token)) {
    return { color: "#c678dd", fontWeight: "bold" };
  }
  if (builtins.includes(token)) {
    return { color: "#e5c07b" };
  }
  if (/^["'`].*["'`]$/.test(token)) {
    return { color: "#98c379" };
  }
  if (/^\d+$/.test(token)) {
    return { color: "#d19a66" };
  }
  if (/^[+\-*/%=<>!&|^~?:]+$/.test(token)) {
    return { color: "#56b6c2" };
  }
  if (/^[{}()\[\];,.]$/.test(token)) {
    return { color: "#abb2bf" };
  }
  if (/^[a-z][a-zA-Z0-9]*$/.test(token) && token.length > 1) {
    return { color: "#61afef" };
  }
  if (/^[A-Z][a-zA-Z0-9]*$/.test(token)) {
    return { color: "#e5c07b" };
  }
  return { color: "#abb2bf" };
};

const Completion6 = () => {
  const [code, setCode] = useState(defaultCode);
  const [selectedShape, setSelectedShape] = useState("circle");
  const [rows, setRows] = useState(30);
  const [maxWidth, setMaxWidth] = useState(500);
  const [fontSize, setFontSize] = useState(12);
  const [showOutline, setShowOutline] = useState(true);

  const shapeWidths = useMemo(() => {
    return shapes[selectedShape](rows, maxWidth);
  }, [selectedShape, rows, maxWidth]);

  const formattedLines = useMemo(() => {
    return formatCodeToShape(code, shapeWidths, fontSize);
  }, [code, shapeWidths, fontSize]);

  const renderHighlightedLine = useCallback((text) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (/^\s+$/.test(token)) {
        return <span key={i}>{token}</span>;
      }
      const style = highlightToken(token);
      return (
        <span key={i} style={style}>
          {token}
        </span>
      );
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#fff",
            marginBottom: "10px",
            fontSize: "2.5rem",
            textShadow: "0 0 20px rgba(100, 200, 255, 0.5)",
          }}
        >
          ✨ Pretty Shape Code Formatter ✨
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#8892b0",
            marginBottom: "30px",
            fontSize: "1.1rem",
          }}
        >
          Transform your code into beautiful shapes
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "30px",
          }}
        >
          {/* Input Panel */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "15px" }}>
              📝 Input Code
            </h3>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: "100%",
                height: "300px",
                background: "#1e1e1e",
                color: "#d4d4d4",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "15px",
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: "13px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Paste your code here..."
            />
          </div>

          {/* Controls Panel */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 style={{ color: "#fff", marginTop: 0, marginBottom: "15px" }}>
              ⚙️ Settings
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{ color: "#ccc", display: "block", marginBottom: "8px" }}
              >
                Shape:
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                }}
              >
                {Object.keys(shapes).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    style={{
                      padding: "10px",
                      background:
                        selectedShape === shape
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontWeight: selectedShape === shape ? "bold" : "normal",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {shape === "circle" && "⭕"}
                    {shape === "triangle" && "🔺"}
                    {shape === "diamond" && "💎"}
                    {shape === "heart" && "❤️"}
                    {shape === "star" && "⭐"}
                    {shape === "hourglass" && "⏳"}
                    {shape === "wave" && "🌊"}
                    {shape === "tree" && "🎄"}
                    <br />
                    <span style={{ fontSize: "11px" }}>{shape}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ color: "#ccc", display: "block", marginBottom: "5px" }}
              >
                Rows: {rows}
              </label>
              <input
                type="range"
                min="15"
                max="60"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#667eea" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ color: "#ccc", display: "block", marginBottom: "5px" }}
              >
                Max Width: {maxWidth}px
              </label>
              <input
                type="range"
                min="200"
                max="800"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#667eea" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{ color: "#ccc", display: "block", marginBottom: "5px" }}
              >
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#667eea" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  color: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showOutline}
                  onChange={(e) => setShowOutline(e.target.checked)}
                  style={{
                    accentColor: "#667eea",
                    width: "18px",
                    height: "18px",
                  }}
                />
                Show Shape Outline
              </label>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            overflow: "auto",
          }}
        >
          <h3
            style={{
              color: "#fff",
              marginTop: 0,
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            🎨 Formatted Output
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: '"Fira Code", "Consolas", monospace',
              fontSize: `${fontSize}px`,
              lineHeight: "1.4",
              position: "relative",
            }}
          >
            {formattedLines.map((line, i) => (
              <div
                key={i}
                style={{
                  width: `${line.width}px`,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  background: showOutline
                    ? "rgba(102, 126, 234, 0.1)"
                    : "transparent",
                  borderLeft: showOutline
                    ? "1px solid rgba(102, 126, 234, 0.3)"
                    : "none",
                  borderRight: showOutline
                    ? "1px solid rgba(102, 126, 234, 0.3)"
                    : "none",
                  borderTop:
                    showOutline && i === 0
                      ? "1px solid rgba(102, 126, 234, 0.3)"
                      : "none",
                  borderBottom:
                    showOutline && i === formattedLines.length - 1
                      ? "1px solid rgba(102, 126, 234, 0.3)"
                      : "none",
                  padding: "1px 5px",
                  boxSizing: "border-box",
                }}
              >
                {renderHighlightedLine(line.text)}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "#5a6a8a",
            marginTop: "30px",
            fontSize: "0.9rem",
          }}
        >
          Weekly Challenge #6 - Pretty Shape | Opus 4.5
        </p>
      </div>
    </div>
  );
};

export default Completion6;
