import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// Configuration
const ROWS = 30;
const AISLE_SPEED = 150;
const SEATING_TIME = 800;

const SEAT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const STRATEGIES = {
  RANDOM: 'Random',
  BACK_TO_FRONT: 'Back to Front',
  FRONT_TO_BACK: 'Front to Back',
  WINDOW_MIDDLE_AISLE: 'Window → Middle → Aisle',
  STEFFEN: 'Steffen Method',
  WILMA: 'WilMA (Half-rows)',
};

const generatePassengers = () => {
  const passengers = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let seat = 0; seat < 6; seat++) {
      passengers.push({
        id: `${row}-${SEAT_LABELS[seat]}`,
        row,
        seat,
        seatLabel: SEAT_LABELS[seat],
        state: 'waiting',
        aislePosition: -1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      });
    }
  }
  return passengers;
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const sortByStrategy = (passengers, strategy) => {
  const pax = [...passengers];

  switch (strategy) {
    case STRATEGIES.RANDOM:
      return shuffleArray(pax);

    case STRATEGIES.BACK_TO_FRONT:
      return pax.sort((a, b) => b.row - a.row);

    case STRATEGIES.FRONT_TO_BACK:
      return pax.sort((a, b) => a.row - b.row);

    case STRATEGIES.WINDOW_MIDDLE_AISLE: {
      const priority = { 0: 0, 5: 0, 1: 1, 4: 1, 2: 2, 3: 2 };
      return pax.sort((a, b) => {
        if (priority[a.seat] !== priority[b.seat]) {
          return priority[a.seat] - priority[b.seat];
        }
        return b.row - a.row;
      });
    }

    case STRATEGIES.STEFFEN: {
      const result = [];
      for (let row = ROWS; row >= 1; row -= 2) {
        const wL = pax.find((p) => p.row === row && p.seat === 0);
        const wR = pax.find((p) => p.row === row && p.seat === 5);
        if (wL) result.push(wL);
        if (wR) result.push(wR);
      }
      for (let row = ROWS - 1; row >= 1; row -= 2) {
        const wL = pax.find((p) => p.row === row && p.seat === 0);
        const wR = pax.find((p) => p.row === row && p.seat === 5);
        if (wL) result.push(wL);
        if (wR) result.push(wR);
      }
      for (let row = ROWS; row >= 1; row -= 2) {
        const mL = pax.find((p) => p.row === row && p.seat === 1);
        const mR = pax.find((p) => p.row === row && p.seat === 4);
        if (mL) result.push(mL);
        if (mR) result.push(mR);
      }
      for (let row = ROWS - 1; row >= 1; row -= 2) {
        const mL = pax.find((p) => p.row === row && p.seat === 1);
        const mR = pax.find((p) => p.row === row && p.seat === 4);
        if (mL) result.push(mL);
        if (mR) result.push(mR);
      }
      for (let row = ROWS; row >= 1; row -= 2) {
        const aL = pax.find((p) => p.row === row && p.seat === 2);
        const aR = pax.find((p) => p.row === row && p.seat === 3);
        if (aL) result.push(aL);
        if (aR) result.push(aR);
      }
      for (let row = ROWS - 1; row >= 1; row -= 2) {
        const aL = pax.find((p) => p.row === row && p.seat === 2);
        const aR = pax.find((p) => p.row === row && p.seat === 3);
        if (aL) result.push(aL);
        if (aR) result.push(aR);
      }
      return result;
    }

    case STRATEGIES.WILMA: {
      const result = [];
      for (let row = ROWS; row >= 1; row--) {
        const wL = pax.find((p) => p.row === row && p.seat === 0);
        const wR = pax.find((p) => p.row === row && p.seat === 5);
        if (wL) result.push(wL);
        if (wR) result.push(wR);
      }
      for (let row = ROWS; row >= 1; row--) {
        const mL = pax.find((p) => p.row === row && p.seat === 1);
        const mR = pax.find((p) => p.row === row && p.seat === 4);
        if (mL) result.push(mL);
        if (mR) result.push(mR);
      }
      for (let row = ROWS; row >= 1; row--) {
        const aL = pax.find((p) => p.row === row && p.seat === 2);
        const aR = pax.find((p) => p.row === row && p.seat === 3);
        if (aL) result.push(aL);
        if (aR) result.push(aR);
      }
      return result;
    }

    default:
      return shuffleArray(pax);
  }
};

const Seat = ({ passenger, isOccupied, seatLabel }) => {
  const seatStyle = {
    width: '24px',
    height: '24px',
    border: '2px solid #555',
    borderRadius: '4px',
    margin: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    backgroundColor: isOccupied ? passenger?.color || '#4CAF50' : '#e0e0e0',
    color: isOccupied ? '#fff' : '#888',
    transition: 'background-color 0.3s',
  };

  return <div style={seatStyle}>{isOccupied ? '●' : seatLabel}</div>;
};

const AislePassenger = ({ passenger, rowHeight }) => {
  if (!passenger || passenger.state === 'waiting' || passenger.state === 'seated') {
    return null;
  }

  const style = {
    position: 'absolute',
    left: '50%',
    top: `${passenger.aislePosition * rowHeight + 5}px`,
    transform: 'translateX(-50%)',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: passenger.color,
    border: '2px solid #333',
    transition: `top ${AISLE_SPEED}ms linear`,
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  };

  return <div style={style} title={passenger.id} />;
};

const Completion28 = () => {
  const [strategy, setStrategy] = useState(STRATEGIES.RANDOM);
  const [passengers, setPassengers] = useState(() => generatePassengers());
  const [boardingQueue, setBoardingQueue] = useState(() => {
    const pax = generatePassengers();
    return sortByStrategy(pax, STRATEGIES.RANDOM).map((p) => p.id);
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedTimes, setCompletedTimes] = useState({});
  const [speed, setSpeed] = useState(1);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const speedRef = useRef(1);
  const strategyRef = useRef(strategy);

  // Update refs in effects (not during render)
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    strategyRef.current = strategy;
  }, [strategy]);

  const initializeSimulation = useCallback((strat) => {
    const allPassengers = generatePassengers();
    const sorted = sortByStrategy(allPassengers, strat);
    setPassengers(allPassengers.map((p) => ({ ...p, state: 'waiting', aislePosition: -1 })));
    setBoardingQueue(sorted.map((p) => p.id));
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  }, []);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const currentTime = Date.now() - startTimeRef.current;
    const currentSpeed = speedRef.current;
    setElapsedTime(currentTime);

    setPassengers((prevPassengers) => {
      const newPassengers = prevPassengers.map((p) => ({ ...p }));
      const aisleOccupancy = new Array(ROWS + 2).fill(null);

      newPassengers.forEach((p) => {
        if (p.state === 'walking' || p.state === 'seating') {
          if (p.aislePosition >= 0 && p.aislePosition <= ROWS) {
            aisleOccupancy[p.aislePosition] = p.id;
          }
        }
      });

      newPassengers.forEach((p) => {
        if (p.state === 'seating') {
          if (p.seatingStartTime && Date.now() - p.seatingStartTime > SEATING_TIME / currentSpeed) {
            p.state = 'seated';
            p.aislePosition = -1;
          }
        } else if (p.state === 'walking') {
          if (p.aislePosition === p.row) {
            p.state = 'seating';
            p.seatingStartTime = Date.now();
          } else {
            const nextPos = p.aislePosition + 1;
            if (!aisleOccupancy[nextPos]) {
              aisleOccupancy[p.aislePosition] = null;
              p.aislePosition = nextPos;
              aisleOccupancy[nextPos] = p.id;
            }
          }
        }
      });

      const allSeated = newPassengers.every((p) => p.state === 'seated');
      if (allSeated && newPassengers.length > 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRunning(false);
        setCompletedTimes((prev) => ({
          ...prev,
          [strategyRef.current]: currentTime,
        }));
        startTimeRef.current = null;
      }

      return newPassengers;
    });

    setBoardingQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;

      let shouldRemove = false;

      setPassengers((prevPassengers) => {
        const aisleOccupancy = new Array(ROWS + 2).fill(null);
        prevPassengers.forEach((p) => {
          if ((p.state === 'walking' || p.state === 'seating') && p.aislePosition >= 0) {
            aisleOccupancy[p.aislePosition] = p.id;
          }
        });

        if (!aisleOccupancy[0] && prevQueue.length > 0) {
          const nextId = prevQueue[0];
          shouldRemove = true;
          return prevPassengers.map((p) => {
            if (p.id === nextId && p.state === 'waiting') {
              return { ...p, state: 'walking', aislePosition: 0 };
            }
            return p;
          });
        }
        return prevPassengers;
      });

      return shouldRemove ? prevQueue.slice(1) : prevQueue;
    });
  }, []);

  const handleStart = useCallback(() => {
    if (isPaused) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      setIsPaused(false);
      timerRef.current = setInterval(tick, AISLE_SPEED / speedRef.current);
    } else {
      initializeSimulation(strategy);
      setTimeout(() => {
        startTimeRef.current = Date.now();
        setIsRunning(true);
        timerRef.current = setInterval(tick, AISLE_SPEED / speedRef.current);
      }, 100);
    }
    setIsRunning(true);
  }, [isPaused, tick, initializeSimulation, strategy]);

  const handlePause = useCallback(() => {
    pausedTimeRef.current = elapsedTime;
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [elapsedTime]);

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    initializeSimulation(strategy);
  }, [initializeSimulation, strategy]);

  const handleStrategyChange = useCallback(
    (e) => {
      const newStrategy = e.target.value;
      setStrategy(newStrategy);
      if (!isRunning) {
        initializeSimulation(newStrategy);
      }
    },
    [isRunning, initializeSimulation]
  );

  const handleSpeedChange = useCallback(
    (e) => {
      const newSpeed = Number(e.target.value);
      setSpeed(newSpeed);
      if (isRunning && !isPaused && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, AISLE_SPEED / newSpeed);
      }
    },
    [isRunning, isPaused, tick]
  );

  const formatTime = useCallback((ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const seatedCount = passengers.filter((p) => p.state === 'seated').length;
  const totalPassengers = passengers.length;
  const progress = totalPassengers > 0 ? (seatedCount / totalPassengers) * 100 : 0;
  const rowHeight = 30;

  const sortedResults = useMemo(() => {
    return Object.entries(completedTimes).sort((a, b) => a[1] - b[1]);
  }, [completedTimes]);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>
        ✈️ Airplane Boarding Simulator
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Compare different boarding strategies to find the fastest method!
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Strategy:</label>
          <select
            value={strategy}
            onChange={handleStrategyChange}
            disabled={isRunning}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            {Object.values(STRATEGIES).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Speed:</label>
          <select
            value={speed}
            onChange={handleSpeedChange}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
            <option value={8}>8x</option>
          </select>
        </div>

        <button
          onClick={isRunning && !isPaused ? handlePause : handleStart}
          style={{
            padding: '10px 25px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: isRunning && !isPaused ? '#ff9800' : '#4CAF50',
            color: '#fff',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {isRunning && !isPaused ? '⏸ Pause' : isPaused ? '▶ Resume' : '▶ Start'}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '10px 25px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#f44336',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          🔄 Reset
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '20px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: '15px 25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {formatTime(elapsedTime)}
          </div>
        </div>

        <div
          style={{
            padding: '15px 25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Progress</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {seatedCount} / {totalPassengers}
          </div>
        </div>

        <div
          style={{
            padding: '15px 25px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '100px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Queue</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {boardingQueue.length}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#ddd',
          borderRadius: '10px',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s',
            borderRadius: '10px',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '50px 50px 20px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '3px solid #333',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '40px',
              backgroundColor: '#333',
              borderRadius: '40px 40px 0 0',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            ✈️ COCKPIT
          </div>

          <div style={{ position: 'relative' }}>
            {Array.from({ length: ROWS }, (_, rowIdx) => {
              const rowNum = rowIdx + 1;
              const leftSeats = passengers.filter((p) => p.row === rowNum && p.seat < 3);
              const rightSeats = passengers.filter((p) => p.row === rowNum && p.seat >= 3);

              return (
                <div
                  key={rowNum}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: `${rowHeight}px`,
                    marginBottom: '2px',
                  }}
                >
                  <div
                    style={{
                      width: '25px',
                      fontSize: '10px',
                      color: '#666',
                      textAlign: 'right',
                      paddingRight: '5px',
                    }}
                  >
                    {rowNum}
                  </div>

                  <div style={{ display: 'flex' }}>
                    {[0, 1, 2].map((seatIdx) => {
                      const pax = leftSeats.find((p) => p.seat === seatIdx);
                      const isOccupied = pax?.state === 'seated';
                      return (
                        <Seat
                          key={seatIdx}
                          passenger={pax}
                          isOccupied={isOccupied}
                          seatLabel={SEAT_LABELS[seatIdx]}
                        />
                      );
                    })}
                  </div>

                  <div
                    style={{
                      width: '40px',
                      height: '100%',
                      backgroundColor: '#f0f0f0',
                      position: 'relative',
                    }}
                  />

                  <div style={{ display: 'flex' }}>
                    {[3, 4, 5].map((seatIdx) => {
                      const pax = rightSeats.find((p) => p.seat === seatIdx);
                      const isOccupied = pax?.state === 'seated';
                      return (
                        <Seat
                          key={seatIdx}
                          passenger={pax}
                          isOccupied={isOccupied}
                          seatLabel={SEAT_LABELS[seatIdx]}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                position: 'absolute',
                left: '109px',
                top: '0',
                width: '40px',
                height: `${ROWS * (rowHeight + 2)}px`,
                pointerEvents: 'none',
              }}
            >
              {passengers
                .filter((p) => p.state === 'walking' || p.state === 'seating')
                .map((p) => (
                  <AislePassenger key={p.id} passenger={p} rowHeight={rowHeight + 2} />
                ))}
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#4CAF50',
              borderRadius: '0 0 10px 10px',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            🚪 ENTRANCE
          </div>
        </div>
      </div>

      {sortedResults.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Results Comparison</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {sortedResults.map(([strat, time], idx) => (
              <div
                key={strat}
                style={{
                  padding: '10px 15px',
                  backgroundColor: idx === 0 ? '#4CAF50' : '#e0e0e0',
                  color: idx === 0 ? '#fff' : '#333',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              >
                <strong>{strat}</strong>: {formatTime(time)}
                {idx === 0 && ' 🏆'}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>ℹ️ Strategy Descriptions</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#555' }}>
          <p>
            <strong>Random:</strong> Passengers board in random order (typical for budget airlines).
          </p>
          <p>
            <strong>Back to Front:</strong> Passengers in rear rows board first, then middle, then
            front.
          </p>
          <p>
            <strong>Front to Back:</strong> Front rows board first (often used for first-class
            priority).
          </p>
          <p>
            <strong>Window → Middle → Aisle:</strong> All window seats first, then middle, then
            aisle.
          </p>
          <p>
            <strong>Steffen Method:</strong> Alternating rows from back, window to aisle.
            Theoretically optimal!
          </p>
          <p>
            <strong>WilMA:</strong> Window seats from back, then middle from back, then aisle from
            back.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Completion28;
