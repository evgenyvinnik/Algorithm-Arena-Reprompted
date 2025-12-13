import React, { useState, useEffect, useMemo } from 'react';

const Completion6 = () => {
  const [inputCode, setInputCode] = useState(`function hello() {
  console.log("Hello World!");
  return true;
}

// Write your code here and see it take shape!
// You can copy paste a large block of code to see the effect better.
`);
  const [shape, setShape] = useState('heart');
  const [resolution, setResolution] = useState(40); // Width in characters
  const [output, setOutput] = useState('');

  const shapes = useMemo(
    () => ({
      heart: (x, y, w, h) => {
        // Normalized coordinates -1 to 1
        const nx = (x / w) * 2 - 1;
        const ny = -((y / h) * 2 - 1); // Flip Y so + is up

        // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        const ax = nx * 1.2;
        const ay = ny * 1.2 + 0.3;

        const a = ax * ax + ay * ay - 1;
        return a * a * a - ax * ax * ay * ay * ay <= 0;
      },
      circle: (x, y, w, h) => {
        const nx = (x / w) * 2 - 1;
        const ny = -((y / h) * 2 - 1);
        return nx * nx + ny * ny <= 0.8;
      },
      square: (x, y, w, h) => {
        const nx = Math.abs((x / w) * 2 - 1);
        const ny = Math.abs((y / h) * 2 - 1);
        return nx < 0.8 && ny < 0.8;
      },
      triangle: (x, y, w, h) => {
        // Triangle pointing up
        const nx = (x / w) * 2 - 1;
        const ny = -((y / h) * 2 - 1);

        // y < -2|x| + 1  approx
        return ny <= -Math.abs(nx) * 1.5 + 0.8 && ny >= -0.8;
      },
      star: (x, y, w, h) => {
        // Parametric star (curvy)
        const nx = (x / w) * 2 - 1;
        const ny = -((y / h) * 2 - 1);

        const r = Math.sqrt(nx * nx + ny * ny);
        const theta = Math.atan2(ny, nx) - Math.PI / 2; // Rotate so point is up

        // Curvy star
        return r <= 0.5 + 0.2 * Math.cos(5 * theta);
      },
    }),
    []
  );

  useEffect(() => {
    formatCode();
  }, [inputCode, shape, resolution]);

  const formatCode = () => {
    if (!inputCode) {
      setOutput('');
      return;
    }

    // Clean code: remove whitespace to stream characters
    const cleanCode = inputCode.replace(/\s+/g, ' ');
    const chars = cleanCode.split('');
    let charIndex = 0;

    // Grid Setup
    const width = resolution;
    // Aspect ratio correction: Chars are taller than they are wide.
    const calculatedRows = Math.floor(width * 0.55);

    let result = [];

    // Iterate Grid
    for (let y = 0; y < calculatedRows; y++) {
      let rowStr = '';
      for (let x = 0; x < width; x++) {
        // Check if inside shape
        const isInside = shapes[shape](x, y, width, calculatedRows);

        if (isInside) {
          if (charIndex >= chars.length) {
            charIndex = 0; // Loop code
          }
          rowStr += chars[charIndex++];
        } else {
          rowStr += ' ';
        }
      }
      result.push(rowStr);
    }

    setOutput(result.join('\n'));
  };

  return (
    <div className="flex flex-col h-full w-full p-6 bg-gray-900 text-white gap-6 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Challenge #6: Pretty Shape
        </h1>
        <p className="text-gray-400">
          Shape your code into art! Paste your code below and choose a shape.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
        {/* Controls & Input */}
        <div className="flex flex-col gap-4 w-full md:w-1/3 min-w-[300px]">
          <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="text-sm font-semibold text-gray-300">Choose Shape</label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(shapes).map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                    shape === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="text-sm font-semibold text-gray-300">
              Resolution (Width: {resolution} chars)
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 flex-1 min-h-[200px]">
            <label className="text-sm font-semibold text-gray-300">Input Code</label>
            <textarea
              className="w-full h-full p-3 font-mono text-xs bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-300"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your source code here..."
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative">
          <div className="absolute top-0 left-0 bg-gray-700/50 px-3 py-1 text-xs text-gray-400 rounded-br-lg">
            Output Preview
          </div>
          <div className="flex items-center justify-center p-8 overflow-auto flex-1 w-full h-full">
            <pre
              className="font-mono text-center leading-none text-blue-300 transition-all duration-300 select-all"
              style={{
                fontSize: '12px',
                lineHeight: '1.2em',
                whiteSpace: 'pre',
              }}
            >
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion6;
