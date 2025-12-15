import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Download,
  FileText
} from 'lucide-react';

const Completion32 = () => {
  const [mode, setMode] = useState('setup'); // setup, recording, review
  const [script, setScript] = useState("Enter your script here...\n\nJust start typing or paste your text. Even if you don't use it word-for-word, it helps to have your key points in front of you.\n\nRelax, take a deep breath, and press Record when you're ready.");
  const [takes, setTakes] = useState([]);
  const [currentTake, setCurrentTake] = useState(null); // The one currently being recorded or just finished
  const [isTeleprompterActive, setIsTeleprompterActive] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 0 to 5

  const handleRecordingComplete = (blob, duration) => {
    const url = URL.createObjectURL(blob);
    const newTake = {
      id: Date.now(),
      url,
      blob,
      timestamp: new Date(),
      duration,
      name: `Take ${takes.length + 1}`
    };
    setTakes(prev => [newTake, ...prev]);
    setMode('review');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
          <h1 className="text-lg font-bold tracking-tight">FlowState<span className="text-slate-500 font-light">Recorder</span></h1>
        </div>
        <div className="text-xs font-mono text-slate-500">
          CHALLENGE #32
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar / Takes List */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Session Takes</h2>
            <div className="text-2xl font-mono">{takes.length} <span className="text-sm text-slate-600">recorded</span></div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {takes.length === 0 && (
              <div className="text-center py-10 text-slate-600 text-sm">
                <p>No takes yet.</p>
                <p>Press record to start.</p>
              </div>
            )}
            <AnimatePresence>
              {takes.map(take => (
                <TakeItem key={take.id} take={take} onDelete={(id) => setTakes(prev => prev.filter(t => t.id !== id))} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 flex flex-col relative bg-slate-950">

          {/* Teleprompter / Script Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col items-center">
            <Teleprompter
              script={script}
              setScript={setScript}
              isRecording={mode === 'recording'}
              scrollSpeed={scrollSpeed}
              active={isTeleprompterActive}
            />
          </div>

          {/* Recorder Controls Overlay */}
          <div className="h-48 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 flex flex-col items-center justify-center relative p-6">
            <Recorder
              onRecordingComplete={handleRecordingComplete}
              isRecording={mode === 'recording'}
              onStateChange={(state) => setMode(state)}
            />

            {/* Settings Row */}
            <div className="absolute bottom-4 right-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full">
                <span className="uppercase tracking-wider font-semibold">Prompter Speed</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                  className="w-20 accent-rose-500 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-4 text-center">{scrollSpeed}x</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const Teleprompter = ({ script, setScript, isRecording, scrollSpeed, active }) => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationFrameId;
    const scrollContainer = scrollRef.current;

    const animate = () => {
      if (isRecording && scrollSpeed > 0 && scrollContainer && !isHovered) {
        scrollContainer.scrollTop += scrollSpeed * 0.5; // Adjust multiplier for feel
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    if (isRecording) {
      animate();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRecording, scrollSpeed, isHovered]);

  return (
    <div className="w-full h-full max-w-3xl relative">
      <textarea
        ref={scrollRef}
        value={script}
        onChange={(e) => setScript(e.target.value)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full h-full bg-transparent p-12 text-3xl md:text-5xl font-bold text-center leading-relaxed outline-none resize-none transition-colors duration-300 font-serif
                    ${isRecording ? 'text-slate-200 placeholder-slate-600' : 'text-slate-400 placeholder-slate-700 hover:text-slate-300'}
                `}
        placeholder="Paste your script here..."
        spellCheck="false"
      />
      {!isRecording && script.length < 50 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-slate-700 opacity-50">
          <FileText size={64} />
        </div>
      )}
    </div>
  );
};

const Recorder = ({ onRecordingComplete, isRecording, onStateChange }) => {
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRecording) {
      startTimeRef.current = Date.now();
      interval = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format time
  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio Context for Visualization
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      // Media Recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const finalDuration = Date.now() - startTimeRef.current;
        onRecordingComplete(blob, finalDuration);

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        audioCtx.close();
        setAnalyser(null);
      };

      mediaRecorder.start();
      onStateChange('recording');

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onStateChange('review');
    }
  };

  // Visualization Loop
  const draw = () => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5; // Spread out a bit
    let barHeight;
    let x = 0;

    // Mirror effect setup
    const centerX = canvas.width / 2;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2; // Scale down

      // Gradient color based on height/volume
      const r = barHeight + 25 * (i / bufferLength);
      const g = 250 * (i / bufferLength);
      const b = 50;

      ctx.fillStyle = `rgb(${244}, ${63}, ${94})`; // Rose-500 consistently? Or dynamic?
      // Let's use a nice gradient fill
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, `rgba(244, 63, 94, 1)`); // Rose
      gradient.addColorStop(1, `rgba(100, 20, 50, 0.5)`);

      ctx.fillStyle = gradient;

      // Draw mostly in center 
      // We want a symmetric viz. 
      // Let's just do a standard one for simplicity first, but centered looks cooler.

      // Standard centered approach:
      // Symmetrical drawing
      // We only really use half the FFT data for visual usually as high freqs are empty often

    }

    // Simpler clean symmetric visualizer
    // Only use first 40 bins for better bass/voice look
    const relevantData = dataArray.slice(0, 60);
    const items = relevantData.length;
    const totalWidth = canvas.width;
    const bWidth = totalWidth / (items * 2); // *2 for symmetry

    for (let i = 0; i < items; i++) {
      const val = relevantData[i];
      const h = (val / 255) * canvas.height * 0.8; // Max 80% height

      const gradient = ctx.createLinearGradient(0, canvas.height / 2 - h, 0, canvas.height / 2 + h);
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0)');
      gradient.addColorStop(0.5, 'rgba(244, 63, 94, 1)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');

      ctx.fillStyle = gradient;

      // Right side
      ctx.fillRect(centerX + (i * bWidth), (canvas.height - h) / 2, bWidth - 1, h);
      // Left side
      ctx.fillRect(centerX - ((i + 1) * bWidth), (canvas.height - h) / 2, bWidth - 1, h);
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (analyser && isRecording) {
      draw();
    } else if (!isRecording && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isRecording]);


  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Visualizer Canvas */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Timer */}
      <div className="font-mono text-4xl font-bold tracking-widest text-slate-200 z-10 drop-shadow-md">
        {formatTime(duration)}
        {isRecording && <span className="animate-pulse text-rose-500">.</span>}
        {!isRecording && <span className="text-transparent">.</span>}
      </div>

      {/* Main Button */}
      <div className="flex items-center gap-6 z-10 relative">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-rose-500 transition-all duration-300 shadow-lg hover:shadow-rose-500/20"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500 group-hover:scale-110 transition-transform duration-300"></div>
            <span className="sr-only">Record</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 hover:border-rose-400 transition-all duration-300 shadow-lg hover:shadow-rose-500/20"
          >
            <div className="w-8 h-8 rounded-md bg-rose-400 group-hover:scale-90 transition-transform duration-300"></div>
            <span className="sr-only">Stop</span>
          </button>
        )}
      </div>

      <div className="h-4 text-xs font-medium tracking-wider text-rose-500/80 z-10 uppercase">
        {isRecording ? "Listening..." : "Ready to Record"}
      </div>
    </div>
  );
};

const TakeItem = ({ take, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => setIsPlaying(false);

  const formatDuration = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{take.name}</span>
          <span className="text-xs font-mono text-slate-500">{formatDuration(take.duration)}</span>
        </div>
        <button
          onClick={() => onDelete(take.id)}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-rose-400 hover:bg-slate-600 hover:text-rose-300 transition-colors"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Visual Fake Waveform */}
        <div className="flex-1 h-8 flex items-center gap-0.5 opacity-50">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex-1 bg-slate-600 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
          ))}
        </div>

        <a
          href={take.url}
          download={`recording-${take.id}.webm`}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <Download size={14} />
        </a>
      </div>
      <audio ref={audioRef} src={take.url} onEnded={handleEnded} className="hidden" />
    </motion.div>
  );
}

export default Completion32;
