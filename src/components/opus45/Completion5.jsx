import React, { useState, useRef, useCallback, useEffect } from "react";

// Format types in the conversion loop
const FORMATS = {
  TEXT: "text/plain",
  HTML: "text/html",
  IMAGE: "image/png",
  JSON: "application/json",
};

// Color palette for syntax highlighting
const SYNTAX_COLORS = {
  keyword: "#ff79c6",
  string: "#f1fa8c",
  number: "#bd93f9",
  comment: "#6272a4",
  function: "#50fa7b",
  operator: "#ff79c6",
  default: "#f8f8f2",
};

// Simple syntax highlighter
const highlightSyntax = (text) => {
  const keywords =
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|new|this)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const numbers = /\b\d+\.?\d*\b/g;
  const comments = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
  const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;

  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  result = result.replace(
    comments,
    (m) => `<span style="color:${SYNTAX_COLORS.comment}">${m}</span>`
  );
  result = result.replace(
    strings,
    (m) => `<span style="color:${SYNTAX_COLORS.string}">${m}</span>`
  );
  result = result.replace(
    keywords,
    (m) => `<span style="color:${SYNTAX_COLORS.keyword}">${m}</span>`
  );
  result = result.replace(
    numbers,
    (m) => `<span style="color:${SYNTAX_COLORS.number}">${m}</span>`
  );
  result = result.replace(
    functions,
    (m, p1) => `<span style="color:${SYNTAX_COLORS.function}">${p1}</span>(`
  );

  return result;
};

// Convert text to styled HTML
const textToHtml = (text) => {
  const highlighted = highlightSyntax(text);
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      padding: 20px;
      margin: 0;
    }
    .code-block {
      background: rgba(0,0,0,0.5);
      border-radius: 12px;
      padding: 20px;
      color: #f8f8f2;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .header {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27ca40; }
  </style>
</head>
<body>
  <div class="code-block">
    <div class="header">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="content">${highlighted}</div>
  </div>
</body>
</html>`;
};

// Convert HTML string to plain text (strip tags)
const htmlToText = (html) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

// Convert JSON to formatted text
const jsonToText = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr);
    return JSON.stringify(obj, null, 2);
  } catch {
    return jsonStr;
  }
};

// Convert text to JSON structure
const textToJson = (text) => {
  const lines = text.split("\n").filter((line) => line.trim());
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const charCount = text.length;

  return JSON.stringify(
    {
      meta: {
        type: "copy-pasta-converted",
        timestamp: new Date().toISOString(),
        stats: {
          lines: lines.length,
          words: words.length,
          characters: charCount,
        },
      },
      content: text,
      preview: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    },
    null,
    2
  );
};

const Completion5 = () => {
  const [currentFormat, setCurrentFormat] = useState(FORMATS.TEXT);
  const [content, setContent] = useState("");
  const [history, setHistory] = useState([]);
  const [loopCount, setLoopCount] = useState(0);
  const [notification, setNotification] = useState("");
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Show notification
  const showNotification = useCallback((message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2000);
  }, []);

  // Get next format in the loop
  const getNextFormat = useCallback((format) => {
    const formatOrder = [
      FORMATS.TEXT,
      FORMATS.HTML,
      FORMATS.IMAGE,
      FORMATS.JSON,
    ];
    const currentIndex = formatOrder.indexOf(format);
    return formatOrder[(currentIndex + 1) % formatOrder.length];
  }, []);

  // Convert content to next format
  const convertToNextFormat = useCallback(async () => {
    if (!content) return;

    const nextFormat = getNextFormat(currentFormat);
    let convertedContent = "";

    try {
      switch (currentFormat) {
        case FORMATS.TEXT:
          if (nextFormat === FORMATS.HTML) {
            convertedContent = textToHtml(content);
          }
          break;
        case FORMATS.HTML:
          if (nextFormat === FORMATS.IMAGE) {
            // Render HTML to canvas
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            // Create an iframe to render HTML
            const iframe = document.createElement("iframe");
            iframe.style.cssText =
              "position:absolute;left:-9999px;width:600px;height:400px;border:none;";
            document.body.appendChild(iframe);

            iframe.contentDocument.open();
            iframe.contentDocument.write(content);
            iframe.contentDocument.close();

            // Wait for content to render
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Draw to canvas using html2canvas approach (simplified)
            canvas.width = 600;
            canvas.height = 400;

            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, 600, 400);
            gradient.addColorStop(0, "#1a1a2e");
            gradient.addColorStop(1, "#16213e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 600, 400);

            // Draw code block
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.roundRect(20, 20, 560, 360, 12);
            ctx.fill();

            // Draw window dots
            ctx.fillStyle = "#ff5f56";
            ctx.beginPath();
            ctx.arc(45, 45, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffbd2e";
            ctx.beginPath();
            ctx.arc(70, 45, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#27ca40";
            ctx.beginPath();
            ctx.arc(95, 45, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw text content
            ctx.font = "14px Monaco, Menlo, monospace";
            const plainText = htmlToText(content);
            const lines = plainText.split("\n").slice(0, 20);
            let y = 80;

            lines.forEach((line, index) => {
              // Simple color cycling for visual interest
              const colors = [
                "#ff79c6",
                "#f1fa8c",
                "#bd93f9",
                "#50fa7b",
                "#f8f8f2",
              ];
              ctx.fillStyle = colors[index % colors.length];
              ctx.fillText(line.substring(0, 60), 40, y);
              y += 18;
            });

            document.body.removeChild(iframe);
            convertedContent = canvas.toDataURL("image/png");
          }
          break;
        case FORMATS.IMAGE:
          if (nextFormat === FORMATS.JSON) {
            // Extract metadata from image
            const img = new Image();
            img.src = content;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });

            convertedContent = JSON.stringify(
              {
                meta: {
                  type: "image-metadata",
                  timestamp: new Date().toISOString(),
                  dimensions: {
                    width: img.width || 600,
                    height: img.height || 400,
                  },
                  format: "image/png",
                  dataLength: content.length,
                },
                content: "Image data converted to JSON metadata",
                base64Preview: content.substring(0, 100) + "...",
              },
              null,
              2
            );
          }
          break;
        case FORMATS.JSON:
          if (nextFormat === FORMATS.TEXT) {
            convertedContent = jsonToText(content);
            setLoopCount((prev) => prev + 1);
          }
          break;
        default:
          convertedContent = content;
      }

      if (convertedContent) {
        setHistory((prev) => [
          ...prev,
          { format: currentFormat, content: content.substring(0, 200) },
        ]);
        setContent(convertedContent);
        setCurrentFormat(nextFormat);
        showNotification(`Converted to ${nextFormat}`);
      }
    } catch (error) {
      console.error("Conversion error:", error);
      showNotification("Conversion failed!");
    }
  }, [content, currentFormat, getNextFormat, showNotification]);

  // Copy content to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!content) return;

    try {
      if (currentFormat === FORMATS.IMAGE && content.startsWith("data:image")) {
        // Convert data URL to blob and copy as image
        const response = await fetch(content);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } else if (currentFormat === FORMATS.HTML) {
        const blob = new Blob([content], { type: "text/html" });
        const textBlob = new Blob([htmlToText(content)], {
          type: "text/plain",
        });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blob,
            "text/plain": textBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(content);
      }
      showNotification("Copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      // Fallback
      await navigator.clipboard.writeText(content);
      showNotification("Copied as text!");
    }
  }, [content, currentFormat, showNotification]);

  // Handle paste from clipboard
  const handlePaste = useCallback(
    async (e) => {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;

      // Check for image
      const items = clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setContent(event.target.result);
            setCurrentFormat(FORMATS.IMAGE);
            showNotification("Pasted image!");
          };
          reader.readAsDataURL(blob);
          return;
        }
      }

      // Check for HTML
      const htmlContent = clipboardData.getData("text/html");
      if (htmlContent && htmlContent.trim()) {
        setContent(htmlContent);
        setCurrentFormat(FORMATS.HTML);
        showNotification("Pasted HTML!");
        return;
      }

      // Fall back to text
      const textContent = clipboardData.getData("text/plain");
      if (textContent) {
        // Try to detect JSON
        try {
          JSON.parse(textContent);
          setContent(textContent);
          setCurrentFormat(FORMATS.JSON);
          showNotification("Pasted JSON!");
        } catch {
          setContent(textContent);
          setCurrentFormat(FORMATS.TEXT);
          showNotification("Pasted text!");
        }
      }
    },
    [showNotification]
  );

  // Handle file drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.onload = (event) => {
          setContent(event.target.result);
          setCurrentFormat(FORMATS.IMAGE);
          showNotification("Dropped image!");
        };
        reader.readAsDataURL(file);
      } else if (file.type === "text/html" || file.name.endsWith(".html")) {
        reader.onload = (event) => {
          setContent(event.target.result);
          setCurrentFormat(FORMATS.HTML);
          showNotification("Dropped HTML!");
        };
        reader.readAsText(file);
      } else if (
        file.type === "application/json" ||
        file.name.endsWith(".json")
      ) {
        reader.onload = (event) => {
          setContent(event.target.result);
          setCurrentFormat(FORMATS.JSON);
          showNotification("Dropped JSON!");
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          setContent(event.target.result);
          setCurrentFormat(FORMATS.TEXT);
          showNotification("Dropped text file!");
        };
        reader.readAsText(file);
      }
    },
    [showNotification]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && content) {
        e.preventDefault();
        copyToClipboard();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && content) {
        e.preventDefault();
        convertToNextFormat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, copyToClipboard, convertToNextFormat]);

  // Get format display info
  const getFormatInfo = (format) => {
    const info = {
      [FORMATS.TEXT]: { icon: "📝", label: "Plain Text", color: "#f8f8f2" },
      [FORMATS.HTML]: { icon: "🌐", label: "HTML", color: "#ff79c6" },
      [FORMATS.IMAGE]: { icon: "🖼️", label: "Image (PNG)", color: "#bd93f9" },
      [FORMATS.JSON]: { icon: "📋", label: "JSON", color: "#f1fa8c" },
    };
    return info[format] || { icon: "❓", label: "Unknown", color: "#888" };
  };

  const currentInfo = getFormatInfo(currentFormat);
  const nextInfo = getFormatInfo(getNextFormat(currentFormat));

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      padding: "20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#fff",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "bold",
      margin: "0 0 10px 0",
      background: "linear-gradient(90deg, #ff79c6, #bd93f9, #f1fa8c)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: "16px",
      color: "#888",
      margin: "0 0 20px 0",
    },
    loopBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "20px",
      fontSize: "14px",
    },
    mainContent: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    formatFlow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      marginBottom: "30px",
      flexWrap: "wrap",
    },
    formatBox: {
      padding: "12px 20px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.05)",
      border: "2px solid transparent",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    formatBoxActive: {
      background: "rgba(255,255,255,0.15)",
      border: "2px solid",
      transform: "scale(1.05)",
    },
    arrow: {
      fontSize: "20px",
      color: "#888",
    },
    dropZone: {
      border: "2px dashed rgba(255,255,255,0.3)",
      borderRadius: "16px",
      padding: "40px",
      textAlign: "center",
      marginBottom: "20px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "rgba(255,255,255,0.02)",
      minHeight: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    dropZoneActive: {
      borderColor: "#bd93f9",
      background: "rgba(189,147,249,0.1)",
    },
    contentPreview: {
      width: "100%",
      maxHeight: "300px",
      overflow: "auto",
      textAlign: "left",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "8px",
      padding: "16px",
      fontFamily: "Monaco, Menlo, monospace",
      fontSize: "13px",
      lineHeight: "1.5",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
    },
    imagePreview: {
      maxWidth: "100%",
      maxHeight: "280px",
      borderRadius: "8px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },
    actions: {
      display: "flex",
      gap: "15px",
      justifyContent: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
    },
    button: {
      padding: "14px 28px",
      borderRadius: "12px",
      border: "none",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    primaryButton: {
      background: "linear-gradient(90deg, #ff79c6, #bd93f9)",
      color: "#fff",
    },
    secondaryButton: {
      background: "rgba(255,255,255,0.1)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    disabledButton: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    history: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "20px",
    },
    historyTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    historyItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "8px",
      marginBottom: "8px",
      fontSize: "13px",
    },
    notification: {
      position: "fixed",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 24px",
      background: "rgba(0,0,0,0.9)",
      borderRadius: "30px",
      fontSize: "14px",
      zIndex: 1000,
      animation: "fadeIn 0.3s ease",
    },
    canvas: {
      display: "none",
    },
    keyboard: {
      display: "flex",
      gap: "20px",
      justifyContent: "center",
      marginTop: "30px",
      flexWrap: "wrap",
    },
    shortcut: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#888",
    },
    key: {
      padding: "4px 8px",
      background: "rgba(255,255,255,0.1)",
      borderRadius: "4px",
      fontFamily: "monospace",
    },
  };

  return (
    <div
      style={styles.container}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
    >
      <canvas ref={canvasRef} style={styles.canvas} />

      {notification && <div style={styles.notification}>{notification}</div>}

      <div style={styles.header}>
        <h1 style={styles.title}>🍝 Copy Pasta</h1>
        <p style={styles.subtitle}>
          Paste content, convert between formats, copy again — infinite loop!
        </p>
        <div style={styles.loopBadge}>
          <span>🔄</span>
          <span>Loop Count: {loopCount}</span>
          {loopCount > 0 && <span>🎉</span>}
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Format Flow Visualization */}
        <div style={styles.formatFlow}>
          {[FORMATS.TEXT, FORMATS.HTML, FORMATS.IMAGE, FORMATS.JSON].map(
            (format, index, arr) => {
              const info = getFormatInfo(format);
              const isActive = format === currentFormat;
              return (
                <React.Fragment key={format}>
                  <div
                    style={{
                      ...styles.formatBox,
                      ...(isActive ? styles.formatBoxActive : {}),
                      borderColor: isActive ? info.color : "transparent",
                    }}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <span style={styles.arrow}>→</span>
                  )}
                </React.Fragment>
              );
            }
          )}
          <span style={styles.arrow}>↩️</span>
        </div>

        {/* Drop Zone / Content Area */}
        <div
          ref={dropZoneRef}
          style={{
            ...styles.dropZone,
            ...(content ? {} : styles.dropZoneActive),
          }}
        >
          {!content ? (
            <>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
              <h3 style={{ margin: "0 0 10px 0" }}>
                Paste or Drop Content Here
              </h3>
              <p style={{ color: "#888", margin: 0 }}>
                Supports: Text, HTML, Images, JSON
                <br />
                Press Ctrl/Cmd + V to paste
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "14px",
                  color: currentInfo.color,
                  marginBottom: "10px",
                }}
              >
                {currentInfo.icon} Current Format: {currentInfo.label}
              </div>
              {currentFormat === FORMATS.IMAGE &&
              content.startsWith("data:image") ? (
                <img src={content} alt="Preview" style={styles.imagePreview} />
              ) : (
                <div style={styles.contentPreview}>
                  {content.length > 2000
                    ? content.substring(0, 2000) + "..."
                    : content}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(content ? {} : styles.disabledButton),
            }}
            onClick={convertToNextFormat}
            disabled={!content}
          >
            <span>🔄</span>
            Convert to {nextInfo.icon} {nextInfo.label}
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              ...(content ? {} : styles.disabledButton),
            }}
            onClick={copyToClipboard}
            disabled={!content}
          >
            <span>📋</span>
            Copy to Clipboard
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.secondaryButton,
            }}
            onClick={() => {
              setContent("");
              setCurrentFormat(FORMATS.TEXT);
            }}
          >
            <span>🗑️</span>
            Clear
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={styles.keyboard}>
          <div style={styles.shortcut}>
            <span style={styles.key}>⌘/Ctrl</span>
            <span>+</span>
            <span style={styles.key}>V</span>
            <span>Paste</span>
          </div>
          <div style={styles.shortcut}>
            <span style={styles.key}>⌘/Ctrl</span>
            <span>+</span>
            <span style={styles.key}>C</span>
            <span>Copy</span>
          </div>
          <div style={styles.shortcut}>
            <span style={styles.key}>⌘/Ctrl</span>
            <span>+</span>
            <span style={styles.key}>↵</span>
            <span>Convert</span>
          </div>
        </div>

        {/* Conversion History */}
        {history.length > 0 && (
          <div style={{ ...styles.history, marginTop: "30px" }}>
            <div style={styles.historyTitle}>
              <span>📜</span>
              <span>Conversion History</span>
            </div>
            {history
              .slice(-5)
              .reverse()
              .map((item, index) => {
                const info = getFormatInfo(item.format);
                return (
                  <div key={index} style={styles.historyItem}>
                    <span style={{ fontSize: "20px" }}>{info.icon}</span>
                    <span style={{ color: info.color }}>{info.label}</span>
                    <span
                      style={{
                        color: "#666",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.content.substring(0, 50)}...
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {/* Info Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#666",
            fontSize: "13px",
          }}
        >
          <p>🍝 Copy Pasta — Format Conversion Loop</p>
          <p>Text → HTML → Image → JSON → Text (and repeat!)</p>
          <p>Built for the Algorithm Arena Weekly Challenge #5</p>
        </div>
      </div>
    </div>
  );
};

export default Completion5;
