import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Upload, RefreshCw } from 'lucide-react';

export default function Completion16() {
  const [text, setText] = useState('https://evgenyvinnik.github.io/Algorithm-Arena-Reprompted/');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(0.2); // Percentage of QR size
  const [style, setStyle] = useState('square'); // square, circle, rounded
  const [eyeStyle, setEyeStyle] = useState('square'); // square, circle, rounded
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('H'); // H is best for logos
  const [resolution, setResolution] = useState(1024);
  const canvasRef = useRef(null);

  const generateQR = async () => {
    if (!canvasRef.current) return;

    try {
      const qrData = QRCode.create(text, {
        errorCorrectionLevel: errorCorrectionLevel,
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const size = resolution;
      const modules = qrData.modules.data;
      const moduleCount = qrData.modules.size;
      const updatedModuleSize = size / moduleCount;

      // Clear canvas
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Draw modules
      ctx.fillStyle = fgColor;

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          const isDark = modules[r * moduleCount + c];

          // Determine if this module is part of the "finder patterns" (eyes)
          // Top-left
          const isTL = r < 7 && c < 7;
          // Top-right
          const isTR = r < 7 && c >= moduleCount - 7;
          // Bottom-left
          const isBL = r >= moduleCount - 7 && c < 7;

          const isEye = isTL || isTR || isBL;

          if (isDark) {
            const x = c * updatedModuleSize;
            const y = r * updatedModuleSize;
            const w = updatedModuleSize;
            const h = updatedModuleSize;

            if (isEye) {
              // Draw Eye
              drawModule(ctx, x, y, w, h, eyeStyle);
            } else {
              // Draw Data
              drawModule(ctx, x, y, w, h, style);
            }
          }
        }
      }

      // Draw Logo
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.src = logoUrl;
        logoImg.crossOrigin = "Anonymous";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; // Continue even if fail
        });

        if (logoImg.complete && logoImg.naturalWidth !== 0) {
          const logoW = size * logoSize;
          const logoH = (logoImg.height / logoImg.width) * logoW;
          const logoX = (size - logoW) / 2;
          const logoY = (size - logoH) / 2;

          // Optional: Draw background for logo to clear QR modules
          // ctx.fillStyle = bgColor;
          // ctx.fillRect(logoX, logoY, logoW, logoH);

          // Or better: clear a circle or rounded rect behind it? 
          // For now, simple fillRect is safer for scanability if logo is transparent

          ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
        }
      }

    } catch (err) {
      console.error("QR Generation Error:", err);
    }
  };

  const drawModule = (ctx, x, y, w, h, shape) => {
    // Add slight padding to prevent aliasing lines or merging too much if desired? 
    // Actually standard QR expects touching.

    // Let's create a *slightly* smaller shape for "dots" effect if circle
    let gap = 0;
    if (shape === 'circle' || shape === 'rounded') {
      gap = w * 0.1; // 10% gap
    }

    const drawX = x + gap / 2;
    const drawY = y + gap / 2;
    const drawW = w - gap;
    const drawH = h - gap;

    if (shape === 'square') {
      ctx.fillRect(x, y, w, h); // No gap for squares to ensure connectivity
    } else if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, (w - gap) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'rounded') {
      // Rounded rect
      const r = drawW * 0.3;
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, drawW, drawH, r);
      ctx.fill();
    }
  };

  useEffect(() => {
    generateQR();
  }, [text, fgColor, bgColor, style, eyeStyle, logoUrl, logoSize, resolution, errorCorrectionLevel]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'branded-qrcode.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Branded QR Code Generator
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl">
        {/* Controls */}
        <div className="flex-1 space-y-6 bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Content</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
              placeholder="Enter URL or text..."
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Foreground</label>
              <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                />
                <span className="text-sm font-mono text-gray-300">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Background</label>
              <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                />
                <span className="text-sm font-mono text-gray-300">{bgColor}</span>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Logo Overlay</label>
            <div className="flex md:flex-row flex-col gap-4 items-center">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Image URL..."
                className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors whitespace-nowrap">
                  <Upload size={18} />
                  <span>Upload</span>
                </button>
              </div>
            </div>
            {logoUrl && (
              <div className="pt-2">
                <label className="text-xs text-gray-500 mb-1 block">Logo Size ({Math.round(logoSize * 100)}%)</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={logoSize}
                  onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            )}
          </div>

          {/* Styling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Data Shape</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="circle">Dots</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Eye Shape</label>
              <select
                value={eyeStyle}
                onChange={(e) => setEyeStyle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="circle">Circles</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Error Correction</label>
            <select
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="L">L (Low ~7%)</option>
              <option value="M">M (Medium ~15%)</option>
              <option value="Q">Q (Quartile ~25%)</option>
              <option value="H">H (High ~30%)</option>
            </select>
            <p className="text-xs text-gray-500">Higher levels allow more of the code to be covered by a logo.</p>
          </div>


        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800 relative">
          <div className="relative group">
            <canvas
              ref={canvasRef}
              width={resolution}
              height={resolution}
              className="w-full max-w-md h-auto rounded-lg shadow-2xl border-4 border-white/10"
              style={{ imageRendering: 'high-quality' }}
            />
            <button
              onClick={refresh}
              className="absolute top-2 right-2 p-2 bg-gray-800/80 rounded-full hover:bg-purple-500 text-white transition-all opacity-0 group-hover:opacity-100"
              title="Regenerate"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="mt-8 flex gap-4 w-full max-w-md">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              <Download size={20} />
              Download PNG
            </button>
          </div>

          <p className="mt-6 text-gray-500 text-sm italic text-center max-w-xs">
            "Creativity is intelligence having fun." — Albert Einstein
          </p>
        </div>
      </div>
    </div>
  );

  function refresh() {
    generateQR();
  }
}
