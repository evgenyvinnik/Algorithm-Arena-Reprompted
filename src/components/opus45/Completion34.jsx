import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// Block types with their colors and textures
const BLOCK_TYPES = {
  grass: { top: '#4a7c23', side: '#6b8e23', bottom: '#8b4513' },
  dirt: { top: '#8b4513', side: '#8b4513', bottom: '#8b4513' },
  stone: { top: '#808080', side: '#808080', bottom: '#808080' },
  wood: { top: '#8b6914', side: '#a0522d', bottom: '#8b6914' },
  leaves: { top: '#228b22', side: '#228b22', bottom: '#228b22' },
  sand: { top: '#f4a460', side: '#f4a460', bottom: '#f4a460' },
  water: { top: '#4169e1', side: '#4169e1', bottom: '#4169e1' },
  brick: { top: '#b22222', side: '#b22222', bottom: '#b22222' },
  snow: { top: '#fffafa', side: '#fffafa', bottom: '#fffafa' },
  glass: { top: '#87ceeb', side: '#87ceeb', bottom: '#87ceeb' },
};

// Block component
const Block = React.memo(({ position, type, onRemove, onAdd }) => {
  const colors = BLOCK_TYPES[type] || BLOCK_TYPES.grass;
  const isTransparent = type === 'glass' || type === 'water';

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.button === 2 || e.shiftKey) {
        // Right click or shift+click to remove
        onRemove(position);
      } else {
        // Left click to add adjacent block
        const face = e.face.normal;
        const newPos = [position[0] + face.x, position[1] + face.y, position[2] + face.z];
        onAdd(newPos);
      }
    },
    [position, onRemove, onAdd]
  );

  return (
    <mesh position={position} onClick={handleClick} onContextMenu={handleClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material-0"
        color={colors.side}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
      <meshStandardMaterial
        attach="material-1"
        color={colors.side}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
      <meshStandardMaterial
        attach="material-2"
        color={colors.top}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
      <meshStandardMaterial
        attach="material-3"
        color={colors.bottom}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
      <meshStandardMaterial
        attach="material-4"
        color={colors.side}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
      <meshStandardMaterial
        attach="material-5"
        color={colors.side}
        transparent={isTransparent}
        opacity={isTransparent ? 0.7 : 1}
      />
    </mesh>
  );
});

Block.displayName = 'Block';

// Ground plane for initial click area
const Ground = React.memo(({ onAdd }) => {
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      const point = e.point;
      const newPos = [Math.round(point.x), 0, Math.round(point.z)];
      onAdd(newPos);
    },
    [onAdd]
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      onClick={handleClick}
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#3d2817" />
    </mesh>
  );
});

Ground.displayName = 'Ground';

// Grid helper
const GridHelper = () => {
  return <gridHelper args={[100, 100, '#555', '#333']} position={[0, -0.49, 0]} />;
};

// Player movement controller
const PlayerController = ({ controlsRef }) => {
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const moveUp = useRef(false);
  const moveDown = useRef(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = true;
          break;
        case 'Space':
          moveUp.current = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveDown.current = true;
          break;
      }
    };

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = false;
          break;
        case 'Space':
          moveUp.current = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveDown.current = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const speed = 10;
    velocity.current.x -= velocity.current.x * 10 * delta;
    velocity.current.z -= velocity.current.z * 10 * delta;
    velocity.current.y -= velocity.current.y * 10 * delta;

    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.y = Number(moveUp.current) - Number(moveDown.current);
    direction.current.normalize();

    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * speed * delta;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * speed * delta;
    }
    if (moveUp.current || moveDown.current) {
      velocity.current.y += direction.current.y * speed * delta;
    }

    controlsRef.current.moveRight(-velocity.current.x);
    controlsRef.current.moveForward(-velocity.current.z);
    // Use getObject() to modify camera position in PointerLockControls
    controlsRef.current.getObject().position.y += velocity.current.y;
  });

  return null;
};

// Scene component
const Scene = ({ blocks, selectedBlock, onRemoveBlock, onAddBlock, controlsRef }) => {
  const handleAddBlock = useCallback(
    (position) => {
      onAddBlock(position, selectedBlock);
    },
    [onAddBlock, selectedBlock]
  );

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />

      <GridHelper />
      <Ground onAdd={handleAddBlock} />

      {blocks.map((block) => (
        <Block
          key={block.id}
          position={block.position}
          type={block.type}
          onRemove={onRemoveBlock}
          onAdd={handleAddBlock}
        />
      ))}

      <PointerLockControls ref={controlsRef} />
      <PlayerController controlsRef={controlsRef} />
    </>
  );
};

// Generate initial terrain
const generateInitialTerrain = () => {
  const blocks = [];
  let id = 0;

  // Create a small hill terrain
  for (let x = -8; x <= 8; x++) {
    for (let z = -8; z <= 8; z++) {
      const distance = Math.sqrt(x * x + z * z);
      const height = Math.max(0, Math.floor(3 - distance / 3));

      for (let y = 0; y <= height; y++) {
        blocks.push({
          id: id++,
          position: [x, y, z],
          type: y === height ? 'grass' : y >= height - 1 ? 'dirt' : 'stone',
        });
      }
    }
  }

  // Add some trees
  const treePositions = [
    [3, 4],
    [-4, 2],
    [2, -5],
    [-3, -4],
  ];

  treePositions.forEach(([tx, tz]) => {
    const baseY = blocks.filter((b) => b.position[0] === tx && b.position[2] === tz).length || 0;

    // Trunk
    for (let y = baseY; y < baseY + 4; y++) {
      blocks.push({
        id: id++,
        position: [tx, y, tz],
        type: 'wood',
      });
    }

    // Leaves
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy <= 2; dy++) {
          if (Math.abs(dx) + Math.abs(dz) + dy <= 3 && !(dx === 0 && dz === 0 && dy < 2)) {
            blocks.push({
              id: id++,
              position: [tx + dx, baseY + 3 + dy, tz + dz],
              type: 'leaves',
            });
          }
        }
      }
    }
  });

  return blocks;
};

// UI Components
const BlockSelector = ({ selectedBlock, onSelectBlock }) => {
  const blockTypes = Object.keys(BLOCK_TYPES);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {blockTypes.map((type, index) => (
        <button
          key={type}
          onClick={() => onSelectBlock(type)}
          style={{
            width: '50px',
            height: '50px',
            border: selectedBlock === type ? '3px solid #fff' : '2px solid #555',
            borderRadius: '8px',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${BLOCK_TYPES[type].top} 0%, ${BLOCK_TYPES[type].side} 100%)`,
            boxShadow: selectedBlock === type ? '0 0 15px rgba(255,255,255,0.5)' : 'none',
            transform: selectedBlock === type ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          title={`${type} (${index + 1})`}
        >
          <span
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#fff',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
          >
            {type}
          </span>
        </button>
      ))}
    </div>
  );
};

const Instructions = ({ isLocked }) => (
  <div
    style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px 20px',
      borderRadius: '12px',
      fontSize: '13px',
      lineHeight: '1.8',
      maxWidth: '280px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    }}
  >
    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4ade80' }}>🎮 Controls</h3>
    <div style={{ color: '#aaa' }}>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>WASD / Arrows</strong> - Move
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>Space</strong> - Fly up
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>Shift</strong> - Fly down
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>Mouse</strong> - Look around
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>Click</strong> - Place block
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>Shift+Click</strong> - Remove block
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>1-0</strong> - Select block
      </p>
      <p style={{ margin: '4px 0' }}>
        <strong style={{ color: '#fff' }}>ESC</strong> - Release mouse
      </p>
    </div>
    {!isLocked && (
      <p
        style={{
          marginTop: '10px',
          color: '#fbbf24',
          fontWeight: 'bold',
        }}
      >
        Click on the game to start!
      </p>
    )}
  </div>
);

const Stats = ({ blockCount }) => (
  <div
    style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    }}
  >
    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#60a5fa' }}>📊 Stats</h3>
    <p style={{ margin: '0', color: '#aaa' }}>
      Blocks placed: <strong style={{ color: '#fff' }}>{blockCount}</strong>
    </p>
  </div>
);

const Crosshair = ({ isLocked }) =>
  isLocked ? (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '24px',
        height: '24px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  ) : null;

const StartOverlay = ({ onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      cursor: 'pointer',
      zIndex: 10,
    }}
  >
    <h1
      style={{
        color: '#fff',
        fontSize: '48px',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      ⛏️ Mini Minecraft
    </h1>
    <p style={{ color: '#aaa', fontSize: '20px' }}>Click anywhere to start playing</p>
  </div>
);

// Main component
const Completion34 = () => {
  const [blocks, setBlocks] = useState(() => generateInitialTerrain());
  const [selectedBlock, setSelectedBlock] = useState('grass');
  const [isLocked, setIsLocked] = useState(false);
  const [nextId, setNextId] = useState(1000);
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);

  const handleAddBlock = useCallback(
    (position, type) => {
      const key = position.join(',');
      const exists = blocks.some((b) => b.position.join(',') === key);
      if (!exists) {
        setBlocks((prev) => [...prev, { id: nextId, position: [...position], type }]);
        setNextId((prev) => prev + 1);
      }
    },
    [blocks, nextId]
  );

  const handleRemoveBlock = useCallback((position) => {
    const key = position.join(',');
    setBlocks((prev) => prev.filter((b) => b.position.join(',') !== key));
  }, []);

  const handleSelectBlock = useCallback((type) => {
    setSelectedBlock(type);
  }, []);

  // Keyboard shortcuts for block selection
  useEffect(() => {
    const blockTypes = Object.keys(BLOCK_TYPES);

    const handleKeyPress = (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= blockTypes.length) {
        setSelectedBlock(blockTypes[num - 1]);
      } else if (e.key === '0' && blockTypes.length >= 10) {
        setSelectedBlock(blockTypes[9]);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Handle pointer lock change
  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  const handleStart = useCallback(() => {
    controlsRef.current?.lock();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
      }}
    >
      <Canvas
        ref={canvasRef}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 10, 20] }}
        shadows
        style={{ background: 'linear-gradient(to bottom, #87ceeb, #e0f6ff)' }}
      >
        <Scene
          blocks={blocks}
          selectedBlock={selectedBlock}
          onRemoveBlock={handleRemoveBlock}
          onAddBlock={handleAddBlock}
          controlsRef={controlsRef}
        />
      </Canvas>

      {!isLocked && <StartOverlay onClick={handleStart} />}

      <Instructions isLocked={isLocked} />
      <Stats blockCount={blocks.length} />
      <BlockSelector selectedBlock={selectedBlock} onSelectBlock={handleSelectBlock} />
      <Crosshair isLocked={isLocked} />
    </div>
  );
};

export default Completion34;
