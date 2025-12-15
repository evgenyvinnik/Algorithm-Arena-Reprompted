import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Music } from 'lucide-react';

const SONG_DATA = {
  title: "Twinkle Twinkle Little Star",
  artist: "Traditional",
  bpm: 100, // Beats per minute, useful for pulsing effects
  lyrics: [
    {
      lineId: 1,
      startTime: 1000,
      words: [
        { text: "Twinkle", start: 1000, end: 1500 },
        { text: "twinkle", start: 1500, end: 2000 },
        { text: "little", start: 2000, end: 2500 },
        { text: "star", start: 2500, end: 3500 },
      ]
    },
    {
      lineId: 2,
      startTime: 4000,
      words: [
        { text: "How", start: 4000, end: 4500 },
        { text: "I", start: 4500, end: 4700 },
        { text: "wonder", start: 4700, end: 5500 },
        { text: "what", start: 5500, end: 6000 },
        { text: "you", start: 6000, end: 6500 },
        { text: "are", start: 6500, end: 7500 },
      ]
    },
    {
      lineId: 3,
      startTime: 8000,
      words: [
        { text: "Up", start: 8000, end: 8500 },
        { text: "above", start: 8500, end: 9000 },
        { text: "the", start: 9000, end: 9500 },
        { text: "world", start: 9500, end: 10000 },
        { text: "so", start: 10000, end: 10500 },
        { text: "high", start: 10500, end: 11500 },
      ]
    },
    {
      lineId: 4,
      startTime: 12000,
      words: [
        { text: "Like", start: 12000, end: 12500 },
        { text: "a", start: 12500, end: 13000 },
        { text: "diamond", start: 13000, end: 14000 },
        { text: "in", start: 14000, end: 14500 },
        { text: "the", start: 14500, end: 15000 },
        { text: "sky", start: 15000, end: 16000 },
      ]
    },
  ]
};

const Completion17 = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in ms
  const requestRef = useRef();
  const startTimeRef = useRef(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Animation Loop
  const animate = (time) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = time - currentTime;
    }
    const newTime = time - startTimeRef.current;

    // Check if song finished
    const lastLine = SONG_DATA.lyrics[SONG_DATA.lyrics.length - 1];
    const lastWord = lastLine.words[lastLine.words.length - 1];

    if (newTime > lastWord.end + 2000) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    setCurrentTime(newTime);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0; // Reset this so frame loop recalculates offset
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);


  // Determine active line
  useEffect(() => {
    // Look ahead logic could go here, but simple find is okay for now
    const index = SONG_DATA.lyrics.findIndex((line, i) => {
      const nextLine = SONG_DATA.lyrics[i + 1];
      if (!nextLine) return true; // It's the last line
      return currentTime < nextLine.startTime;
    });
    if (index !== -1) setCurrentLineIndex(index);
  }, [currentTime]);


  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLineIndex(0);
  };

  // --- Visuals helper ---
  const getNextLineStartTime = () => {
    if (currentLineIndex < SONG_DATA.lyrics.length - 1) {
      return SONG_DATA.lyrics[currentLineIndex + 1].startTime;
    }
    return null;
  };

  // Calculate "Anticipation" progress
  // We want a bar or ball to fill up/move X ms before the NEXT line starts
  const ANTICIPATION_WINDOW = 2000; // 2 seconds before start

  const getAnticipationProgress = (targetLineIndex) => {
    if (targetLineIndex >= SONG_DATA.lyrics.length) return 0;
    const targetTime = SONG_DATA.lyrics[targetLineIndex].startTime;
    const timeUntilStart = targetTime - currentTime;

    if (timeUntilStart <= ANTICIPATION_WINDOW && timeUntilStart > 0) {
      return 1 - (timeUntilStart / ANTICIPATION_WINDOW);
    }
    return 0;
  };

  const getWordStyle = (word) => {
    if (currentTime >= word.end) return "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"; // Sang
    if (currentTime >= word.start) return "text-white scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,1)]"; // Singing
    return "text-gray-500/50"; // Upcoming
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1a] text-white p-8 font-sans overflow-hidden relative">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* Main Stage */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">

        {/* Header / Song Info */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {SONG_DATA.title}
          </h1>
          <p className="text-xl text-gray-400 font-light tracking-widest uppercase">{SONG_DATA.artist}</p>
        </div>


        {/* Karaoke Display Area */}
        <div className="relative w-full h-[400px] bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center justify-center p-12 overflow-hidden group">

          {/* Playback Status Icon */}
          <div className={`absolute top-4 right-4 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-1 items-end h-6">
              <div className="w-1 bg-purple-500 animate-[bounce_1s_infinite] h-3"></div>
              <div className="w-1 bg-pink-500 animate-[bounce_1.2s_infinite] h-5"></div>
              <div className="w-1 bg-blue-500 animate-[bounce_0.8s_infinite] h-4"></div>
            </div>
          </div>


          {/* Previous Line (Fading out) */}
          <div className="absolute top-12 opacity-30 blur-[1px] transform scale-90 transition-all duration-1000 ease-out select-none pointer-events-none">
            {currentLineIndex > 0 && SONG_DATA.lyrics[currentLineIndex - 1].words.map(w => w.text).join(' ')}
          </div>

          {/* Current Line */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-4xl md:text-6xl font-black tracking-wide leading-tight transition-all duration-300">
            {SONG_DATA.lyrics[currentLineIndex]?.words.map((word, idx) => (
              <span
                key={idx}
                className={`transition-all duration-100 ${getWordStyle(word)}`}
              >
                {word.text}
              </span>
            ))}
          </div>

          {/* Anticipation Indicator (Visual Cue) */}
          {/* We show this for the ACTIVE line if it hasn't started, OR the NEXT line if current is finishing */}
          {(() => {
            // Logic: always show anticipation for the very upcoming phrase.
            // If we are "between" lines, we are anticipating the next one.
            // If we are at start of song, anticipate first.

            let targetLineIdx = currentLineIndex;
            // If current line is done or playing, we might be looking at next
            // Actually, let's just match "time until next line start" globally
            // Find the next line that hasn't started yet
            const upcomingLineIdx = SONG_DATA.lyrics.findIndex(l => l.startTime > currentTime);

            if (upcomingLineIdx !== -1) {
              const progress = getAnticipationProgress(upcomingLineIdx);
              if (progress > 0) {
                return (
                  <div className="absolute bottom-12 w-full max-w-md h-2 bg-gray-800 rounded-full overflow-hidden mt-8">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                      style={{ width: `${progress * 100}%` }}
                    />
                    <div className="absolute top-[-25px] left-0 w-full text-center text-sm text-pink-400 font-mono animate-pulse">
                      GET READY...
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}

        </div>

        {/* Controls */}
        <div className="flex gap-6 items-center z-20">
          <button
            onClick={handleReset}
            className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 transition-all active:scale-95 border border-white/10"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-6 rounded-full bg-white text-black hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <div className="text-gray-400 font-mono text-xl tabular-nums min-w-[80px] text-center">
            {(currentTime / 1000).toFixed(1)}s
          </div>
        </div>

      </div>
    </div>
  );
};

export default Completion17;
