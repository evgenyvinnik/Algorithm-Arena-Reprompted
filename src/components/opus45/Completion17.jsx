import React, { useState, useRef, useEffect, useCallback } from 'react';

// Sample songs with lyrics and timing (time in seconds)
const SONGS = [
  {
    id: 1,
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    bpm: 90,
    lyrics: [
      { text: 'Twinkle, twinkle, little star,', startTime: 0, endTime: 3 },
      { text: 'How I wonder what you are!', startTime: 3.5, endTime: 6.5 },
      { text: 'Up above the world so high,', startTime: 7, endTime: 10 },
      { text: 'Like a diamond in the sky.', startTime: 10.5, endTime: 13.5 },
      { text: 'Twinkle, twinkle, little star,', startTime: 14, endTime: 17 },
      { text: 'How I wonder what you are!', startTime: 17.5, endTime: 20.5 },
    ],
    duration: 22,
  },
  {
    id: 2,
    title: 'Happy Birthday',
    artist: 'Traditional',
    bpm: 120,
    lyrics: [
      { text: 'Happy birthday to you,', startTime: 0, endTime: 3 },
      { text: 'Happy birthday to you,', startTime: 3.5, endTime: 6.5 },
      { text: 'Happy birthday dear friend,', startTime: 7, endTime: 10.5 },
      { text: 'Happy birthday to you!', startTime: 11, endTime: 14 },
    ],
    duration: 16,
  },
  {
    id: 3,
    title: 'Row Row Row Your Boat',
    artist: 'Traditional',
    bpm: 100,
    lyrics: [
      { text: 'Row, row, row your boat,', startTime: 0, endTime: 2.5 },
      { text: 'Gently down the stream.', startTime: 3, endTime: 5.5 },
      { text: 'Merrily, merrily, merrily, merrily,', startTime: 6, endTime: 9 },
      { text: 'Life is but a dream.', startTime: 9.5, endTime: 12 },
    ],
    duration: 14,
  },
  {
    id: 4,
    title: 'Old MacDonald Had a Farm',
    artist: 'Traditional',
    bpm: 110,
    lyrics: [
      { text: 'Old MacDonald had a farm,', startTime: 0, endTime: 2.5 },
      { text: 'E-I-E-I-O!', startTime: 2.8, endTime: 5 },
      { text: 'And on his farm he had a cow,', startTime: 5.5, endTime: 8 },
      { text: 'E-I-E-I-O!', startTime: 8.3, endTime: 10.5 },
      { text: 'With a moo moo here,', startTime: 11, endTime: 12.5 },
      { text: 'And a moo moo there,', startTime: 12.8, endTime: 14.3 },
      { text: 'Here a moo, there a moo,', startTime: 14.6, endTime: 16.3 },
      { text: 'Everywhere a moo moo!', startTime: 16.6, endTime: 18.5 },
      { text: 'Old MacDonald had a farm,', startTime: 19, endTime: 21.5 },
      { text: 'E-I-E-I-O!', startTime: 21.8, endTime: 24 },
    ],
    duration: 26,
  },
];

const KaraokeBox = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSongPicker, setShowSongPicker] = useState(true);
  const [countdown, setCountdown] = useState(null);

  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    const animationFrame = animationFrameRef.current;
    const audioContext = audioContextRef.current;
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const playBeat = useCallback(() => {
    if (!audioContextRef.current || !selectedSong) return;

    const beatInterval = 60 / selectedSong.bpm;
    let beatCount = 0;

    const playNextBeat = () => {
      if (!audioContextRef.current) return;

      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);

      osc.frequency.value = beatCount % 4 === 0 ? 880 : 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);

      osc.start(audioContextRef.current.currentTime);
      osc.stop(audioContextRef.current.currentTime + 0.1);

      beatCount++;

      if (
        startTimeRef.current &&
        (performance.now() - startTimeRef.current) / 1000 < selectedSong.duration
      ) {
        setTimeout(playNextBeat, beatInterval * 1000);
      }
    };

    playNextBeat();
  }, [selectedSong]);

  const beginSong = useCallback(() => {
    setIsPlaying(true);
    startTimeRef.current = performance.now();

    // Create audio context for metronome/backing
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      if (selectedSong && elapsed < selectedSong.duration + 2) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        stopPlayback();
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    // Simple beat sound
    playBeat();
  }, [selectedSong, stopPlayback, playBeat]);

  const startPlayback = useCallback(() => {
    if (!selectedSong) return;

    // Start countdown
    setCountdown(3);
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);
        beginSong();
      }
    }, 1000);
  }, [selectedSong, beginSong]);

  const selectSong = (song) => {
    setSelectedSong(song);
    setShowSongPicker(false);
  };

  const goBack = () => {
    stopPlayback();
    setSelectedSong(null);
    setShowSongPicker(true);
  };

  // Find current and upcoming lyrics
  const getCurrentLyricIndex = () => {
    if (!selectedSong) return -1;
    for (let i = 0; i < selectedSong.lyrics.length; i++) {
      if (currentTime < selectedSong.lyrics[i].endTime) {
        return i;
      }
    }
    return selectedSong.lyrics.length - 1;
  };

  const currentLyricIndex = getCurrentLyricIndex();

  return (
    <div style={styles.container}>
      {/* Animated background */}
      <div style={styles.backgroundGradient} />
      <div style={styles.backgroundParticles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes countdown {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 105, 180, 0.5); }
          50% { box-shadow: 0 0 40px rgba(255, 105, 180, 0.8); }
        }
      `}</style>

      {showSongPicker ? (
        <SongPicker songs={SONGS} onSelect={selectSong} />
      ) : (
        <div style={styles.karaokeView}>
          {/* Header */}
          <div style={styles.header}>
            <button onClick={goBack} style={styles.backButton}>
              ← Back
            </button>
            <div style={styles.songInfo}>
              <h2 style={styles.songTitle}>{selectedSong?.title}</h2>
              <p style={styles.songArtist}>{selectedSong?.artist}</p>
            </div>
            <div style={styles.controls}>
              {!isPlaying ? (
                <button onClick={startPlayback} style={styles.playButton}>
                  ▶ Start
                </button>
              ) : (
                <button onClick={stopPlayback} style={styles.stopButton}>
                  ⬛ Stop
                </button>
              )}
            </div>
          </div>

          {/* Countdown overlay */}
          {countdown && (
            <div style={styles.countdownOverlay}>
              <div style={styles.countdownNumber}>{countdown}</div>
            </div>
          )}

          {/* Progress bar */}
          {isPlaying && selectedSong && (
            <div style={styles.progressContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${(currentTime / selectedSong.duration) * 100}%`,
                }}
              />
              <div style={styles.progressTime}>
                {Math.floor(currentTime)}s / {selectedSong.duration}s
              </div>
            </div>
          )}

          {/* Lyrics display */}
          <div style={styles.lyricsContainer}>
            {selectedSong?.lyrics.map((lyric, index) => {
              const isCurrentLine = index === currentLyricIndex;
              const isPastLine = currentTime > lyric.endTime;
              const isUpcoming = currentTime < lyric.startTime;
              const lineProgress = isCurrentLine
                ? Math.min(
                    1,
                    Math.max(0, (currentTime - lyric.startTime) / (lyric.endTime - lyric.startTime))
                  )
                : isPastLine
                  ? 1
                  : 0;

              // Time until this line starts
              const timeUntilStart = lyric.startTime - currentTime;
              const showCountdownBall = isUpcoming && timeUntilStart <= 3 && timeUntilStart > 0;

              return (
                <div
                  key={index}
                  style={{
                    ...styles.lyricLine,
                    ...(isCurrentLine && styles.currentLine),
                    ...(isPastLine && styles.pastLine),
                    ...(isUpcoming && styles.upcomingLine),
                    opacity: isPastLine ? 0.4 : isCurrentLine ? 1 : 0.7,
                    transform: isCurrentLine ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {/* Countdown indicator for upcoming lines */}
                  {showCountdownBall && (
                    <div style={styles.countdownBallContainer}>
                      <div
                        style={{
                          ...styles.countdownBall,
                          animation: 'bounce 0.5s ease-in-out infinite',
                        }}
                      >
                        {Math.ceil(timeUntilStart)}
                      </div>
                      <div
                        style={{
                          ...styles.countdownBar,
                          width: `${((3 - timeUntilStart) / 3) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  {/* Lyric text with highlight progress */}
                  <div style={styles.lyricTextContainer}>
                    <div style={styles.lyricTextBackground}>{lyric.text}</div>
                    <div
                      style={{
                        ...styles.lyricTextHighlight,
                        clipPath: `inset(0 ${100 - lineProgress * 100}% 0 0)`,
                      }}
                    >
                      {lyric.text}
                    </div>

                    {/* Bouncing ball indicator */}
                    {isCurrentLine && isPlaying && (
                      <div
                        style={{
                          ...styles.bouncingBall,
                          left: `${lineProgress * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Beat indicator */}
          {isPlaying && selectedSong && (
            <div style={styles.beatIndicator}>
              <div style={styles.beatDots}>
                {[0, 1, 2, 3].map((i) => {
                  const beatPosition = ((currentTime * selectedSong.bpm) / 60) % 4;
                  const isActive = Math.floor(beatPosition) === i;
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.beatDot,
                        backgroundColor: isActive ? '#ff69b4' : 'rgba(255, 255, 255, 0.3)',
                        transform: isActive ? 'scale(1.5)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
              <div style={styles.bpmDisplay}>{selectedSong.bpm} BPM</div>
            </div>
          )}

          {/* Instructions when not playing */}
          {!isPlaying && !countdown && (
            <div style={styles.instructions}>
              <p>🎤 Press Start to begin singing!</p>
              <p style={styles.instructionDetail}>
                Watch for the countdown ball and follow the highlighted lyrics
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Song Picker Component
const SongPicker = ({ songs, onSelect }) => {
  const [hoveredSong, setHoveredSong] = useState(null);

  return (
    <div style={styles.songPickerContainer}>
      <h1 style={styles.pickerTitle}>🎤 Karaoke Box 🎤</h1>
      <p style={styles.pickerSubtitle}>Select a song to start singing!</p>

      <div style={styles.songGrid}>
        {songs.map((song) => (
          <div
            key={song.id}
            style={{
              ...styles.songCard,
              transform: hoveredSong === song.id ? 'scale(1.05) rotate(-2deg)' : 'scale(1)',
              boxShadow:
                hoveredSong === song.id
                  ? '0 20px 40px rgba(255, 105, 180, 0.4)'
                  : '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={() => setHoveredSong(song.id)}
            onMouseLeave={() => setHoveredSong(null)}
            onClick={() => onSelect(song)}
          >
            <div style={styles.songCardIcon}>🎵</div>
            <h3 style={styles.songCardTitle}>{song.title}</h3>
            <p style={styles.songCardArtist}>{song.artist}</p>
            <div style={styles.songCardMeta}>
              <span>⏱ {song.duration}s</span>
              <span>🥁 {song.bpm} BPM</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    zIndex: -2,
  },
  backgroundParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'rgba(255, 105, 180, 0.3)',
    animation: 'float 10s linear infinite',
  },
  songPickerContainer: {
    padding: '40px',
    textAlign: 'center',
  },
  pickerTitle: {
    fontSize: '3rem',
    color: '#fff',
    marginBottom: '10px',
    textShadow: '0 0 20px rgba(255, 105, 180, 0.5)',
  },
  pickerSubtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '40px',
  },
  songGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  songCard: {
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  songCardIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  songCardTitle: {
    color: '#fff',
    fontSize: '1.3rem',
    marginBottom: '5px',
  },
  songCardArtist: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    marginBottom: '15px',
  },
  songCardMeta: {
    display: 'flex',
    justifyContent: 'space-around',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.8rem',
  },
  karaokeView: {
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '0 20px',
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  songInfo: {
    textAlign: 'center',
  },
  songTitle: {
    color: '#fff',
    fontSize: '1.8rem',
    margin: 0,
    textShadow: '0 0 10px rgba(255, 105, 180, 0.5)',
  },
  songArtist: {
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '5px 0 0 0',
  },
  controls: {
    display: 'flex',
    gap: '10px',
  },
  playButton: {
    background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
    border: 'none',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 20px rgba(255, 105, 180, 0.4)',
  },
  stopButton: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
    border: 'none',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 20px rgba(255, 107, 107, 0.4)',
  },
  countdownOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  countdownNumber: {
    fontSize: '10rem',
    color: '#ff69b4',
    fontWeight: 'bold',
    textShadow: '0 0 50px rgba(255, 105, 180, 0.8)',
    animation: 'countdown 1s ease-in-out',
  },
  progressContainer: {
    position: 'relative',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    margin: '0 20px 30px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff69b4, #ff1493)',
    borderRadius: '4px',
    transition: 'width 0.1s linear',
  },
  progressTime: {
    position: 'absolute',
    right: '0',
    top: '-25px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
  },
  lyricsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '40px 20px',
  },
  lyricLine: {
    position: 'relative',
    transition: 'all 0.3s ease',
    padding: '10px 0',
  },
  currentLine: {
    animation: 'glow 1s ease-in-out infinite',
  },
  pastLine: {},
  upcomingLine: {},
  countdownBallContainer: {
    position: 'absolute',
    left: '-80px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '60px',
  },
  countdownBall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffd700, #ffb700)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
  },
  countdownBar: {
    height: '4px',
    background: 'linear-gradient(90deg, #ffd700, #ffb700)',
    borderRadius: '2px',
    marginTop: '5px',
    transition: 'width 0.1s linear',
  },
  lyricTextContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  lyricTextBackground: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.3)',
    whiteSpace: 'nowrap',
  },
  lyricTextHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff69b4',
    whiteSpace: 'nowrap',
    transition: 'clip-path 0.05s linear',
  },
  bouncingBall: {
    position: 'absolute',
    top: '-20px',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    animation: 'bounce 0.3s ease-in-out infinite',
    transform: 'translateX(-50%)',
  },
  beatIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '40px',
  },
  beatDots: {
    display: 'flex',
    gap: '15px',
  },
  beatDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: 'all 0.1s ease',
  },
  bpmDisplay: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '10px',
    fontSize: '0.9rem',
  },
  instructions: {
    textAlign: 'center',
    marginTop: '50px',
  },
  instructionDetail: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.9rem',
  },
};

const Completion17 = () => {
  return <KaraokeBox />;
};

export default Completion17;
