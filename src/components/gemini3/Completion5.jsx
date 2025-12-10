import React, { useState, useRef, useEffect } from 'react';

const Completion5 = () => {
  const [content, setContent] = useState(null);
  const [format, setFormat] = useState('empty'); // 'empty', 'text', 'html', 'image'
  const [message, setMessage] = useState('');
  const canvasRef = useRef(null);

  const handlePaste = async (e) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    setMessage('');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setContent(event.target.result);
          setFormat('image');
        };
        reader.readAsDataURL(blob);
        return;
      } else if (item.type === 'text/html') {
        item.getAsString((s) => {
          setContent(s);
          setFormat('html');
        });
        return;
      } else if (item.type === 'text/plain') {
        item.getAsString((s) => {
          setContent(s);
          setFormat('text');
        });
        return;
      }
    }
  };

  const copyAsHtml = async () => {
    if (format !== 'text') return;
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const htmlContent = `
      <div style="
        background-color: ${randomColor};
        color: white;
        padding: 20px;
        font-family: 'Courier New', monospace;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">
        ${content}
      </div>
    `;

    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([content], { type: 'text/plain' });
      const data = [new ClipboardItem({ 
        'text/html': blob,
        'text/plain': textBlob 
      })];
      await navigator.clipboard.write(data);
      setMessage('Copied as HTML! Paste it back to continue.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to copy. ' + err.message);
    }
  };

  const copyAsImage = async () => {
    if (format !== 'html') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Extract text from HTML (simple strip tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || "";

    // Canvas setup
    canvas.width = 600;
    canvas.height = 400;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Simple word wrap
    const words = text.split(' ');
    let line = '';
    let y = 200 - (Math.floor(words.length / 10) * 20); // Approximate centering
    
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 500 && n > 0) {
        ctx.fillText(line, 300, y);
        line = words[n] + ' ';
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 300, y);

    // Add "glitch" effect lines
    for(let i=0; i<10; i++) {
        ctx.strokeStyle = `rgba(255,255,255,0.1)`;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * 400);
        ctx.lineTo(600, Math.random() * 400);
        ctx.stroke();
    }

    try {
      canvas.toBlob(async (blob) => {
        const data = [new ClipboardItem({ 'image/png': blob })];
        await navigator.clipboard.write(data);
        setMessage('Copied as Image! Paste it back to continue.');
      });
    } catch (err) {
       console.error(err);
       setMessage('Failed to copy image. ' + err.message);
    }
  };

  const copyAsText = async () => {
    if (format !== 'image') return;

    const textDescription = `An image was processed at ${new Date().toLocaleTimeString()}. It contained visual data that has now been distilled back into pure thought. The cycle continues.`;

    try {
      await navigator.clipboard.writeText(textDescription);
      setMessage('Copied as Text! Paste it back to continue.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to copy text. ' + err.message);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      color: '#333'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🍝 Copy Pasta Converter 🍝</h2>
      
      <div 
        onPaste={handlePaste}
        style={{
          border: '3px dashed #ccc',
          borderRadius: '20px',
          padding: '40px',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          transition: 'all 0.3s ease',
          cursor: 'text',
          position: 'relative'
        }}
      >
        {format === 'empty' && (
          <div style={{ textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <h3>Paste anything here!</h3>
            <p>Supports: Text -> HTML -> Image -> Text loop</p>
          </div>
        )}

        {format === 'text' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              fontSize: '18px'
            }}>
              {content}
            </div>
            <div style={{ color: '#666', marginBottom: '20px' }}>Detected: Plain Text</div>
            <button 
              onClick={copyAsHtml}
              style={buttonStyle}
            >
              ✨ Copy as HTML
            </button>
          </div>
        )}

        {format === 'html' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div 
              dangerouslySetInnerHTML={{ __html: content }} 
              style={{ 
                marginBottom: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            />
            <div style={{ color: '#666', marginBottom: '20px' }}>Detected: HTML Content</div>
            <button 
              onClick={copyAsImage}
              style={buttonStyle}
            >
              🖼️ Copy as Image
            </button>
          </div>
        )}

        {format === 'image' && (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <img 
              src={content} 
              alt="Pasted content" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }} 
            />
            <div style={{ color: '#666', marginBottom: '20px' }}>Detected: Image</div>
            <button 
              onClick={copyAsText}
              style={buttonStyle}
            >
              📝 Copy as Text
            </button>
          </div>
        )}
      </div>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '8px',
          textAlign: 'center',
          animation: 'fadeIn 0.5s'
        }}>
          {message}
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ marginTop: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
        <p>Challenge: Infinite Copy Paste Loop</p>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  backgroundColor: '#2196f3',
  color: 'white',
  border: 'none',
  borderRadius: '50px',
  cursor: 'pointer',
  transition: 'transform 0.1s, background-color 0.2s',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  fontWeight: 'bold'
};

export default Completion5;
