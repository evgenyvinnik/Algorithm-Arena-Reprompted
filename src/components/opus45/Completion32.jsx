import React, { useState, useRef, useEffect } from 'react';

const Completion32 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    countdownSeconds: 3,
    maxDuration: 300,
    autoSave: true,
  });

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const currentTimer = timerRef.current;
    const currentAnimation = animationRef.current;
    const currentStream = streamRef.current;
    const currentAudioContext = audioContextRef.current;

    return () => {
      if (currentTimer) clearInterval(currentTimer);
      if (currentAnimation) cancelAnimationFrame(currentAnimation);
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (currentAudioContext) {
        currentAudioContext.close();
      }
    };
  }, []);

  // Audio level visualization effect
  useEffect(() => {
    let frameId;
    const updateLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);
      }
      if (isRecording && !isPaused) {
        frameId = requestAnimationFrame(updateLevel);
      }
    };

    if (isRecording && !isPaused) {
      frameId = requestAnimationFrame(updateLevel);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isRecording, isPaused]);

  // Reset audio level when not recording or paused
  useEffect(() => {
    if (!isRecording || isPaused) {
      const timeoutId = setTimeout(() => setAudioLevel(0), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isRecording, isPaused]);

  const startCountdown = async () => {
    if (settings.countdownSeconds > 0) {
      setCountdown(settings.countdownSeconds);
      for (let i = settings.countdownSeconds; i > 0; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(null);
    }
    startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

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
        const url = URL.createObjectURL(blob);
        const newRecording = {
          id: Date.now(),
          url,
          blob,
          duration: currentTime,
          timestamp: new Date().toLocaleString(),
          name: `Take ${recordings.length + 1}`,
          starred: false,
          notes: '',
        };
        setRecordings((prev) => [newRecording, ...prev]);
        setCurrentTime(0);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= settings.maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
    }
  };

  const playRecording = (recording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedRecording(recording);
    setIsPlaying(true);
    setPlaybackTime(0);

    const audio = new Audio(recording.url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.play();
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const deleteRecording = (id) => {
    const recording = recordings.find((r) => r.id === id);
    if (recording) {
      URL.revokeObjectURL(recording.url);
    }
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecording?.id === id) {
      setSelectedRecording(null);
      stopPlayback();
    }
  };

  const toggleStar = (id) => {
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, starred: !r.starred } : r)));
  };

  const updateName = (id, name) => {
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  const updateNotes = (id, notes) => {
    setRecordings((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));
  };

  const downloadRecording = (recording) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.name}.webm`;
    a.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#fff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #e94560, #f39c12)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px',
    },
    subtitle: {
      color: '#888',
      fontSize: '1rem',
    },
    mainContent: {
      display: 'flex',
      gap: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
      flexWrap: 'wrap',
    },
    recorderPanel: {
      flex: '1',
      minWidth: '350px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    recordingsPanel: {
      flex: '1',
      minWidth: '350px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxHeight: '600px',
      overflowY: 'auto',
    },
    visualizer: {
      height: '150px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden',
    },
    levelBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(to top, #e94560, #f39c12)',
      transition: 'height 0.05s ease',
      opacity: 0.5,
    },
    countdown: {
      fontSize: '5rem',
      fontWeight: 'bold',
      color: '#e94560',
      animation: 'pulse 1s infinite',
    },
    timer: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: isRecording ? (isPaused ? '#f39c12' : '#e94560') : '#fff',
      zIndex: 1,
    },
    controls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginTop: '20px',
    },
    button: {
      padding: '15px 30px',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    recordButton: {
      background: isRecording
        ? 'linear-gradient(135deg, #e94560, #c73e54)'
        : 'linear-gradient(135deg, #4CAF50, #45a049)',
      color: '#fff',
      boxShadow: isRecording
        ? '0 0 30px rgba(233, 69, 96, 0.5)'
        : '0 0 20px rgba(76, 175, 80, 0.3)',
    },
    pauseButton: {
      background: isPaused
        ? 'linear-gradient(135deg, #4CAF50, #45a049)'
        : 'linear-gradient(135deg, #f39c12, #e67e22)',
      color: '#fff',
    },
    stopButton: {
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      color: '#fff',
    },
    settingsButton: {
      background: 'transparent',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      color: '#fff',
      padding: '10px 20px',
    },
    recordingItem: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '15px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
    },
    recordingItemSelected: {
      background: 'rgba(233, 69, 96, 0.2)',
      border: '1px solid rgba(233, 69, 96, 0.5)',
    },
    recordingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    recordingName: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      width: '100%',
      outline: 'none',
      padding: '5px',
      borderRadius: '5px',
    },
    recordingMeta: {
      display: 'flex',
      gap: '15px',
      color: '#888',
      fontSize: '0.85rem',
      marginBottom: '10px',
    },
    recordingActions: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    actionButton: {
      padding: '8px 15px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85rem',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      transition: 'all 0.2s ease',
    },
    starButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
      color: '#f39c12',
      padding: '0',
    },
    notesInput: {
      width: '100%',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '10px',
      color: '#fff',
      fontSize: '0.9rem',
      resize: 'vertical',
      marginTop: '10px',
      outline: 'none',
    },
    settingsPanel: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(26, 26, 46, 0.98)',
      borderRadius: '20px',
      padding: '30px',
      zIndex: 1000,
      minWidth: '350px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 999,
    },
    settingRow: {
      marginBottom: '20px',
    },
    settingLabel: {
      display: 'block',
      marginBottom: '8px',
      color: '#888',
    },
    settingInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontSize: '1rem',
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
      padding: '40px',
    },
    progressBar: {
      height: '4px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
      marginTop: '10px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #e94560, #f39c12)',
      borderRadius: '2px',
      transition: 'width 0.1s linear',
    },
    tips: {
      background: 'rgba(243, 156, 18, 0.1)',
      border: '1px solid rgba(243, 156, 18, 0.3)',
      borderRadius: '12px',
      padding: '15px',
      marginTop: '20px',
    },
    tipTitle: {
      color: '#f39c12',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    tipList: {
      color: '#888',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      listStyle: 'disc',
      paddingLeft: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          input:focus, textarea:focus, button:hover {
            transform: scale(1.02);
          }
          .recording-item:hover {
            background: rgba(255, 255, 255, 0.08) !important;
          }
        `}
      </style>

      <header style={styles.header}>
        <h1 style={styles.title}>🎙️ Press Record</h1>
        <p style={styles.subtitle}>Record your voice and get the perfect take</p>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.recorderPanel}>
          <h2 style={{ marginBottom: '20px', color: '#e94560' }}>🎤 Recorder</h2>

          <div style={styles.visualizer}>
            <div
              style={{
                ...styles.levelBar,
                height: `${audioLevel * 100}%`,
              }}
            />
            {countdown !== null ? (
              <div style={styles.countdown}>{countdown}</div>
            ) : (
              <div style={styles.timer}>{formatTime(currentTime)}</div>
            )}
          </div>

          {isRecording && (
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(currentTime / settings.maxDuration) * 100}%`,
                }}
              />
            </div>
          )}

          <div style={styles.controls}>
            {!isRecording ? (
              <button
                style={{ ...styles.button, ...styles.recordButton }}
                onClick={startCountdown}
                disabled={countdown !== null}
              >
                🔴 Start Recording
              </button>
            ) : (
              <>
                <button
                  style={{ ...styles.button, ...styles.pauseButton }}
                  onClick={pauseRecording}
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
                <button style={{ ...styles.button, ...styles.stopButton }} onClick={stopRecording}>
                  ⏹️ Stop
                </button>
              </>
            )}
            <button
              style={{ ...styles.button, ...styles.settingsButton }}
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          </div>

          <div style={styles.tips}>
            <div style={styles.tipTitle}>💡 Tips for the Best Take</div>
            <ul style={styles.tipList}>
              <li>Find a quiet space with minimal echo</li>
              <li>Keep a consistent distance from your mic</li>
              <li>Take a breath before you start speaking</li>
              <li>Use the countdown to prepare yourself</li>
              <li>Star your best takes to find them easily</li>
            </ul>
          </div>
        </div>

        <div style={styles.recordingsPanel}>
          <h2 style={{ marginBottom: '20px', color: '#f39c12' }}>
            📁 Your Takes ({recordings.length})
          </h2>

          {recordings.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '3rem', marginBottom: '15px' }}>🎧</p>
              <p>No recordings yet</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                Click &quot;Start Recording&quot; to create your first take
              </p>
            </div>
          ) : (
            recordings
              .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
              .map((recording) => (
                <div
                  key={recording.id}
                  className="recording-item"
                  style={{
                    ...styles.recordingItem,
                    ...(selectedRecording?.id === recording.id ? styles.recordingItemSelected : {}),
                  }}
                >
                  <div style={styles.recordingHeader}>
                    <input
                      style={styles.recordingName}
                      value={recording.name}
                      onChange={(e) => updateName(recording.id, e.target.value)}
                      placeholder="Name this take..."
                    />
                    <button style={styles.starButton} onClick={() => toggleStar(recording.id)}>
                      {recording.starred ? '⭐' : '☆'}
                    </button>
                  </div>

                  <div style={styles.recordingMeta}>
                    <span>⏱️ {formatTime(recording.duration)}</span>
                    <span>📅 {recording.timestamp}</span>
                  </div>

                  {selectedRecording?.id === recording.id && isPlaying && (
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${(playbackTime / recording.duration) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  <div style={styles.recordingActions}>
                    {selectedRecording?.id === recording.id && isPlaying ? (
                      <button
                        style={{
                          ...styles.actionButton,
                          background: 'rgba(231, 76, 60, 0.3)',
                        }}
                        onClick={stopPlayback}
                      >
                        ⏹️ Stop
                      </button>
                    ) : (
                      <button
                        style={{
                          ...styles.actionButton,
                          background: 'rgba(76, 175, 80, 0.3)',
                        }}
                        onClick={() => playRecording(recording)}
                      >
                        ▶️ Play
                      </button>
                    )}
                    <button
                      style={styles.actionButton}
                      onClick={() => downloadRecording(recording)}
                    >
                      💾 Download
                    </button>
                    <button
                      style={{
                        ...styles.actionButton,
                        background: 'rgba(231, 76, 60, 0.2)',
                      }}
                      onClick={() => deleteRecording(recording.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <textarea
                    style={styles.notesInput}
                    value={recording.notes}
                    onChange={(e) => updateNotes(recording.id, e.target.value)}
                    placeholder="Add notes about this take..."
                    rows={2}
                  />
                </div>
              ))
          )}
        </div>
      </div>

      {showSettings && (
        <>
          <div style={styles.overlay} onClick={() => setShowSettings(false)} />
          <div style={styles.settingsPanel}>
            <h3 style={{ marginBottom: '20px', color: '#e94560' }}>⚙️ Settings</h3>

            <div style={styles.settingRow}>
              <label style={styles.settingLabel}>Countdown Timer (seconds)</label>
              <input
                type="number"
                style={styles.settingInput}
                value={settings.countdownSeconds}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    countdownSeconds: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                min="0"
                max="10"
              />
            </div>

            <div style={styles.settingRow}>
              <label style={styles.settingLabel}>Max Recording Duration (seconds)</label>
              <input
                type="number"
                style={styles.settingInput}
                value={settings.maxDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxDuration: Math.max(10, parseInt(e.target.value) || 60),
                  })
                }
                min="10"
              />
            </div>

            <button
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #e94560, #c73e54)',
                width: '100%',
                justifyContent: 'center',
              }}
              onClick={() => setShowSettings(false)}
            >
              Save & Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Completion32;
