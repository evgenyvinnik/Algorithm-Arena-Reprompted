import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';

// --- Assets & Constants ---
const TEXTURES = {
  dirt: '#5d4037',
  grass: '#388e3c',
  wood: '#795548',
  stone: '#757575',
  glass: '#aed9e0',
  log: '#4e342e',
  leaves: '#2e7d32',
  sand: '#fbc02d',
  water: '#0288d1',
  brick: '#d84315',
  gold: '#ffd700',
  diamond: '#00ced1',
  obsidian: '#1a1a1a'
};

const BLOCKS = Object.keys(TEXTURES);

// --- Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

const Player = () => {
  const { camera } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [jump, setJump] = useState(false);
  const [descend, setDescend] = useState(false);

  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(true); break;
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(true); break;
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(true); break;
        case 'ArrowRight':
        case 'KeyD': setMoveRight(true); break;
        case 'Space': setJump(true); break;
        case 'ShiftLeft':
        case 'ShiftRight': setDescend(true); break;
      }
    };
    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(false); break;
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(false); break;
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(false); break;
        case 'ArrowRight':
        case 'KeyD': setMoveRight(false); break;
        case 'Space': setJump(false); break;
        case 'ShiftLeft':
        case 'ShiftRight': setDescend(false); break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (state.controls?.isLocked) {
      // Damping
      velocity.current.x -= velocity.current.x * 10.0 * delta;
      velocity.current.z -= velocity.current.z * 10.0 * delta;
      velocity.current.y -= velocity.current.y * 10.0 * delta;

      direction.current.z = Number(moveForward) - Number(moveBackward);
      direction.current.x = Number(moveRight) - Number(moveLeft);
      direction.current.normalize();

      if (moveForward || moveBackward) velocity.current.z -= direction.current.z * 100.0 * delta;
      if (moveLeft || moveRight) velocity.current.x -= direction.current.x * 100.0 * delta;
      if (jump) velocity.current.y += 80.0 * delta;
      if (descend) velocity.current.y -= 80.0 * delta;

      camera.translateX(-velocity.current.x * delta);
      camera.translateZ(velocity.current.z * delta);
      camera.position.y += velocity.current.y * delta;

      // Simple floor collision
      if (camera.position.y < 2) {
        camera.position.y = 2;
        velocity.current.y = 0;
      }
    }
  });

  return null;
};

const Cube = ({ id, position, type, addCube, removeCube }) => {
  const [hover, setHover] = useState(false);

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (e.altKey || e.button === 2) {
          removeCube(id);
        } else {
          if (!e.face) return;
          const { x, y, z } = e.object.position;
          const dir = [
            x + e.face.normal.x,
            y + e.face.normal.y,
            z + e.face.normal.z
          ];
          addCube(dir);
        }
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(e) => {
        setHover(false);
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial
        color={TEXTURES[type]}
        transparent={type === 'glass' || type === 'water'}
        opacity={type === 'glass' || type === 'water' ? 0.6 : 1}
        roughness={0.8}
      />
      {hover && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry()]} />
          <lineBasicMaterial color="white" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
};

const PhysicsWorld = ({ cubes, addCube, removeCube }) => {
  return (
    <group>
      {cubes.map(cube => (
        <Cube
          key={cube.id}
          {...cube}
          addCube={addCube}
          removeCube={removeCube}
        />
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          const px = Math.floor(e.point.x + 0.5);
          const pz = Math.floor(e.point.z + 0.5);
          addCube([px, 0, pz]);
        }}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <gridHelper args={[100, 100]} position={[0, -0.49, 0]} />
    </group>
  );
}

// --- Styles ---
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '600px',
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #334155',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none', // Crucial for click-through
  },
  startBox: {
    textAlign: 'center',
    padding: '2.5rem',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: '1rem',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '28rem',
    margin: '0 1rem',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    marginBottom: '0.75rem',
    background: 'linear-gradient(to right, #4ade80, #059669)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  text: {
    marginBottom: '2rem',
    color: '#cbd5e1',
    lineHeight: '1.625',
  },
  button: {
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontSize: '1rem',
    display: 'inline-block', // Just a visual block now
  },
  uiContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    userSelect: 'none',
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '20px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 50,
  },
  crosshairH: {
    width: '100%',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  crosshairV: {
    height: '100%',
    width: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  hud: {
    padding: '1rem',
    margin: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'inline-block',
    maxWidth: '300px',
  },
  hudList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '0.875rem',
    color: '#e2e8f0',
    lineHeight: '1.5',
  },
  key: {
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  hotbarContainer: {
    pointerEvents: 'auto',
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '2rem',
    flexDirection: 'column',
    alignItems: 'center',
  },
  hotbar: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '0.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflowX: 'auto',
    maxWidth: '90%',
    scrollbarWidth: 'none', // FireFox
    msOverflowStyle: 'none', // IE
  },
  blockBtn: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    border: '2px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
};

const UI = ({ activeBlock, setActiveBlock }) => {
  return (
    <div style={styles.uiContainer}>
      <style>{`
        /* Hide scrollbar for Chrome/Safari/Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Crosshair */}
      <div style={styles.crosshair}>
        <div style={styles.crosshairH}></div>
        <div style={styles.crosshairV}></div>
      </div>

      {/* HUD Info */}
      <div style={styles.hud}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#4ade80' }}>Mini Minecraft</h1>
        <ul style={styles.hudList}>
          <li><span style={styles.key}>WASD</span>: Move</li>
          <li><span style={styles.key}>Space/Shift</span>: Fly Up/Down</li>
          <li><span style={{ fontWeight: 'bold', color: '#60a5fa' }}>Click</span>: Add Block</li>
          <li><span style={{ fontWeight: 'bold', color: '#f87171' }}>Alt+Click</span>: Remove</li>
        </ul>
      </div>

      {/* Hotbar */}
      <div style={styles.hotbarContainer}>
        <div style={styles.hotbar} className="no-scrollbar">
          {BLOCKS.map(block => (
            <button
              key={block}
              onClick={() => setActiveBlock(block)}
              style={{
                ...styles.blockBtn,
                backgroundColor: TEXTURES[block],
                borderColor: activeBlock === block ? 'white' : 'rgba(255,255,255,0.1)',
                transform: activeBlock === block ? 'scale(1.1)' : 'scale(1)',
                zIndex: activeBlock === block ? 10 : 1,
                boxShadow: activeBlock === block ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                opacity: activeBlock === block ? 1 : 0.7,
              }}
              title={block}
            />
          ))}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Select Block
        </div>
      </div>
    </div>
  );
};

const Completion34 = () => {
  const [cubes, setCubes] = useState(() => {
    // Initial world generation
    const initial = [];
    for (let x = -4; x <= 4; x++) {
      for (let z = -4; z <= 4; z++) {
        initial.push({
          id: generateId(),
          pos: [x, 0, z],
          type: Math.random() > 0.8 ? 'stone' : 'grass'
        });
      }
    }
    return initial;
  });

  const [activeBlock, setActiveBlock] = useState('grass');
  const [isLocked, setIsLocked] = useState(false);

  const addCube = useCallback((pos) => {
    setCubes(prev => {
      const exists = prev.some(c => c.pos[0] === pos[0] && c.pos[1] === pos[1] && c.pos[2] === pos[2]);
      if (exists) return prev;
      return [...prev, { id: generateId(), pos, type: activeBlock }];
    });
  }, [activeBlock]);

  const removeCube = useCallback((id) => {
    setCubes(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <div style={styles.container}>
      {/* Start Overlay */}
      {!isLocked && (
        <div style={styles.overlay}>
          <div style={styles.startBox}>
            <div style={{
              width: '5rem', height: '5rem',
              background: 'linear-gradient(135deg, #4ade80, #059669)',
              borderRadius: '1rem', margin: '0 auto 1.5rem auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transform: 'rotate(12deg)'
            }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}></div>
            </div>
            <h2 style={styles.title}>Mini Minecraft</h2>
            <p style={styles.text}>
              Step into a world of infinite creativity. Build structures, explore the grid, and shape your environment.
            </p>
            <div style={styles.button}>
              Click Anywhere to Start
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Press ESC to pause • Optimized for Desktop
            </div>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ fov: 60, position: [0, 5, 8] }} gl={{ alpha: false }}>
        <color attach="background" args={['#87CEEB']} />
        <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.7} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>

        <PhysicsWorld
          cubes={cubes}
          addCube={addCube}
          removeCube={removeCube}
          activeBlock={activeBlock}
        />

        <Player />
        <PointerLockControls
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
        />
      </Canvas>

      {isLocked && <UI activeBlock={activeBlock} setActiveBlock={setActiveBlock} />}
    </div>
  );
};

export default Completion34;
