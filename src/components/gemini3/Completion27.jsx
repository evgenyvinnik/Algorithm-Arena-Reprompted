import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// --- Icons ---
const Icons = {
  Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
};

// --- Node Definitions ---
const NODE_TYPES = {
  NUMBER: {
    type: 'NUMBER',
    label: 'Number',
    color: '#3b82f6',
    inputs: [],
    outputs: ['value'],
    control: 'slider', // internal value control
  },
  TIMER: {
    type: 'TIMER',
    label: 'Time (s)',
    color: '#8b5cf6',
    inputs: [],
    outputs: ['value'],
  },
  MOUSE_X: {
    type: 'MOUSE_X',
    label: 'Mouse X',
    color: '#ec4899',
    inputs: [],
    outputs: ['value'],
  },
  MOUSE_Y: {
    type: 'MOUSE_Y',
    label: 'Mouse Y',
    color: '#ec4899',
    inputs: [],
    outputs: ['value'],
  },
  ADD: {
    type: 'ADD',
    label: 'Add',
    color: '#10b981',
    inputs: ['a', 'b'],
    outputs: ['sum'],
  },
  SUBTRACT: {
    type: 'SUBTRACT',
    label: 'Subtract',
    color: '#10b981',
    inputs: ['a', 'b'],
    outputs: ['diff'],
  },
  MULTIPLY: {
    type: 'MULTIPLY',
    label: 'Multiply',
    color: '#10b981',
    inputs: ['a', 'b'],
    outputs: ['prod'],
  },
  DIVIDE: {
    type: 'DIVIDE',
    label: 'Divide',
    color: '#10b981',
    inputs: ['a', 'b'],
    outputs: ['quot'],
  },
  SINE: {
    type: 'SINE',
    label: 'Sine',
    color: '#f59e0b',
    inputs: ['x'],
    outputs: ['sin'],
  },
  GREATER_THAN: {
    type: 'GREATER_THAN',
    label: '>',
    color: '#ef4444',
    inputs: ['a', 'b'],
    outputs: ['bool'],
  },
  IF_ELSE: {
    type: 'IF_ELSE',
    label: 'If / Else',
    color: '#ef4444',
    inputs: ['cond', 'true', 'false'],
    outputs: ['out'],
  },
  DISPLAY: {
    type: 'DISPLAY',
    label: 'Display',
    color: '#6366f1',
    inputs: ['in'],
    outputs: [],
  },
  COLOR_BOX: {
    type: 'COLOR_BOX',
    label: 'Color Box',
    color: '#6366f1',
    inputs: ['r', 'g', 'b'],
    outputs: [],
  },
};

const INITIAL_NODES = [
  { id: '1', type: 'TIMER', x: 50, y: 50, data: {} },
  { id: '2', type: 'SINE', x: 250, y: 50, data: {} },
  { id: '3', type: 'MULTIPLY', x: 250, y: 200, data: {} },
  { id: '4', type: 'NUMBER', x: 50, y: 200, data: { value: 50 } },
  { id: '5', type: 'ADD', x: 450, y: 100, data: {} },
  { id: '6', type: 'NUMBER', x: 250, y: 350, data: { value: 100 } },
  { id: '7', type: 'DISPLAY', x: 650, y: 100, data: {} },
];

const INITIAL_CONNECTIONS = [
  { fromNode: '1', fromSocket: 'value', toNode: '2', toSocket: 'x' },
  { fromNode: '2', fromSocket: 'sin', toNode: '3', toSocket: 'a' },
  { fromNode: '4', fromSocket: 'value', toNode: '3', toSocket: 'b' },
  { fromNode: '3', fromSocket: 'prod', toNode: '5', toSocket: 'a' },
  { fromNode: '6', fromSocket: 'value', toNode: '5', toSocket: 'b' },
  { fromNode: '5', fromSocket: 'sum', toNode: '7', toSocket: 'in' },
];


export default function Completion27() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [draggingNode, setDraggingNode] = useState(null);
  const [draggingWire, setDraggingWire] = useState(null); // { fromNode, fromSocket, x, y }
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Drag offset
  const workspaceRef = useRef(null);
  const [values, setValues] = useState({}); // Computed values for each node/socket
  const [time, setTime] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animation Loop
  useEffect(() => {
    let start = Date.now();
    const loop = () => {
      setTime((Date.now() - start) / 1000);
      requestAnimationFrame(loop);
    };
    const frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute Graph
  useEffect(() => {
    const newValues = {};

    // Helper to get value from a connection
    const getValue = (nodeId, socketName, currentRecursionStack = []) => {
      // Prevent cycles
      if (currentRecursionStack.includes(`${nodeId}-${socketName}`)) return 0;

      // Check if value is memoized in this frame
      const key = `${nodeId}-${socketName}`;
      if (newValues[key] !== undefined) return newValues[key];

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return 0;

      let val = 0;

      // Inputs come from connections
      const inputVals = {};
      const def = NODE_TYPES[node.type];

      if (def.inputs) {
        def.inputs.forEach(inputName => {
          const connection = connections.find(c => c.toNode === nodeId && c.toSocket === inputName);
          if (connection) {
            inputVals[inputName] = getValue(connection.fromNode, connection.fromSocket, [...currentRecursionStack, key]);
          } else {
            inputVals[inputName] = 0;
          }
        });
      }

      // Compute Logic
      switch (node.type) {
        case 'NUMBER': val = node.data.value || 0; break;
        case 'TIMER': val = time; break;
        case 'MOUSE_X': val = mousePos.x; break;
        case 'MOUSE_Y': val = mousePos.y; break;
        case 'ADD': val = (inputVals.a || 0) + (inputVals.b || 0); break;
        case 'SUBTRACT': val = (inputVals.a || 0) - (inputVals.b || 0); break;
        case 'MULTIPLY': val = (inputVals.a || 0) * (inputVals.b || 0); break;
        case 'DIVIDE': val = (inputVals.b === 0) ? 0 : (inputVals.a || 0) / (inputVals.b || 0); break;
        case 'SINE': val = Math.sin(inputVals.x || 0); break;
        case 'GREATER_THAN': val = (inputVals.a || 0) > (inputVals.b || 0) ? 1 : 0; break;
        case 'IF_ELSE': val = (inputVals.cond > 0) ? (inputVals.true || 0) : (inputVals.false || 0); break;
        case 'DISPLAY': val = inputVals.in || 0; break;
        case 'COLOR_BOX': val = { r: inputVals.r, g: inputVals.g, b: inputVals.b }; break; // Special case object
        default: val = 0;
      }

      // For multi-output nodes (none currently complicated, but good practice), we might just store the "main" value or logic here.
      // Since our getValue asks for a specific socket, currently all logic is simple enough to return the same 'val' or derive it.
      // But if we had DIVMOD, we'd need to switch on socketName.

      newValues[key] = val;
      return val;
    };

    // Trigger computation for all display nodes (and anything else to be safe, but lazy is better)
    // Actually, to show values on wires or debug, we might want to compute everything.
    // For now, let's just compute everything that is an output of a node.
    nodes.forEach(node => {
      const def = NODE_TYPES[node.type];
      def.outputs.forEach(out => {
        getValue(node.id, out);
      });
      // Also compute "virtual" outputs like Display contents
      if (node.type === 'DISPLAY' || node.type === 'COLOR_BOX') getValue(node.id, 'special');
    });

    setValues(newValues);

  }, [time, nodes, connections, mousePos]);

  // Interaction Handlers
  const handleMouseDownNode = (e, id) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === id);
    const rect = workspaceRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    setDraggingNode(id);
  };

  const handleMouseMove = (e) => {
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update global mouse pos for the MOUSE_X/Y nodes
    setMousePos({ x, y });

    if (draggingNode) {
      setNodes(nodes.map(n => {
        if (n.id === draggingNode) {
          return { ...n, x: x - offset.x, y: y - offset.y };
        }
        return n;
      }));
    }

    if (draggingWire) {
      setDraggingWire(prev => ({ ...prev, x, y }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setDraggingWire(null);
  };

  const handleSocketMouseDown = (e, nodeId, socketName, isInput) => {
    e.stopPropagation();
    const rect = workspaceRef.current.getBoundingClientRect();

    // If input, and already connected, maybe we want to disconnect?
    // For simplicity: dragging from Output creates a wire. 
    // Dragging from Input is not standard unless reconnecting.
    // Let's implement: Drag from Output -> Starts new wire.

    if (!isInput) {
      setDraggingWire({
        fromNode: nodeId,
        fromSocket: socketName,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    } else {
      // If it's an input and has a connection, remove it
      setConnections(connections.filter(c => !(c.toNode === nodeId && c.toSocket === socketName)));
    }
  };

  const handleSocketMouseUp = (e, nodeId, socketName, isInput) => {
    e.stopPropagation();
    if (draggingWire && isInput) {
      // Verify not connecting to itself or invalid types (simple check)
      if (draggingWire.fromNode === nodeId) return;

      // Remove existing connection to this input if any
      const newConns = connections.filter(c => !(c.toNode === nodeId && c.toSocket === socketName));

      setConnections([
        ...newConns,
        { fromNode: draggingWire.fromNode, fromSocket: draggingWire.fromSocket, toNode: nodeId, toSocket: socketName }
      ]);
      setDraggingWire(null);
    }
  };

  const addNode = (type) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNodes([...nodes, { id, type, x: 50 + Math.random() * 100, y: 50 + Math.random() * 100, data: {} }]);
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.fromNode !== id && c.toNode !== id));
  };

  const updateNodeData = (id, key, val) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: val } } : n));
  };

  return (
    <div className="w-full h-screen bg-[#1e1e23] text-white font-sans overflow-hidden flex flex-col items-center">
      <style>{`
        .scrolling-bg {
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .wire-path {
            stroke-dasharray: 10;
            animation: dash 1s linear infinite;
        }
        @keyframes dash {
            to { stroke-dashoffset: -20; }
        }
      `}</style>

      {/* Header / Palette */}
      <div className="w-full h-16 bg-[#2d2d35] flex items-center px-6 border-b border-gray-700 shadow-lg z-10 shrink-0 overflow-x-auto gap-4 custom-scrollbar">
        <span className="font-bold text-lg mr-4 text-emerald-400">MOUSE<br />PROG</span>
        {Object.values(NODE_TYPES).map(type => (
          <button
            key={type.type}
            onClick={() => addNode(type.type)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2"
            style={{ borderLeft: `4px solid ${type.color}` }}
          >
            {type.label}
          </button>
        ))}
        <div className="flex-grow"></div>
        <div className="text-xs text-gray-500">
          Drag Nodes. Connect Dots. Program with a Mouse.
        </div>
      </div>

      {/* Workspace */}
      <div
        ref={workspaceRef}
        className="relative w-full flex-grow scrolling-bg cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Wires Layer */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.fromNode);
            const toNode = nodes.find(n => n.id === conn.toNode);
            if (!fromNode || !toNode) return null;

            // Keep calculatePos consistent with render offsets
            const fromDef = NODE_TYPES[fromNode.type];
            const toDef = NODE_TYPES[toNode.type];

            // Simple assumption of socket positioning
            const fromIdx = fromDef.outputs.indexOf(conn.fromSocket);
            const toIdx = toDef.inputs.indexOf(conn.toSocket);

            // Calculate absolute positions (relative to node top-left)
            // Width is 160px. Output right side, Input left side.
            // Output Y: Header (32) + 10 + idx * 24
            const x1 = fromNode.x + 160;
            const y1 = fromNode.y + 42 + fromIdx * 24;
            const x2 = toNode.x;
            const y2 = toNode.y + 42 + toIdx * 24;

            const dist = Math.abs(x2 - x1) * 0.5;

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${x1 + dist} ${y1}, ${x2 - dist} ${y2}, ${x2} ${y2}`}
                stroke={fromDef.color}
                strokeWidth="3"
                fill="none"
                className="opacity-80"
              />
            );
          })}

          {draggingWire && (
            (() => {
              const fromNode = nodes.find(n => n.id === draggingWire.fromNode);
              if (!fromNode) return null;
              const fromDef = NODE_TYPES[fromNode.type];
              const fromIdx = fromDef.outputs.indexOf(draggingWire.fromSocket);

              const x1 = fromNode.x + 160;
              const y1 = fromNode.y + 42 + fromIdx * 24;
              const x2 = draggingWire.x;
              const y2 = draggingWire.y;

              const dist = Math.abs(x2 - x1) * 0.5;

              return (
                <path
                  d={`M ${x1} ${y1} C ${x1 + dist} ${y1}, ${x2 - dist} ${y2}, ${x2} ${y2}`}
                  stroke="#fff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
              );
            })()
          )}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(node => {
          const def = NODE_TYPES[node.type];
          return (
            <div
              key={node.id}
              className="absolute w-40 bg-[#2b2b30] rounded-lg shadow-xl border border-gray-700 flex flex-col"
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleMouseDownNode(e, node.id)}
            >
              {/* Node Header */}
              <div
                className="h-8 rounded-t-lg px-3 flex items-center justify-between cursor-move select-none"
                style={{ backgroundColor: def.color + '40' }} // Low opacity bg
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-sm">{def.label}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                  className="text-white opacity-40 hover:opacity-100"
                >
                  <Icons.Trash />
                </button>
              </div>

              {/* Body */}
              <div className="p-2 space-y-1 relative">
                {/* Inputs */}
                {def.inputs.map((input, idx) => (
                  <div key={input} className="flex items-center h-6 relative">
                    <span className="absolute -left-4 w-3 h-3 bg-gray-600 rounded-full border-2 border-[#1e1e23] hover:bg-white transition-colors cursor-pointer z-10"
                      onMouseUp={(e) => handleSocketMouseUp(e, node.id, input, true)}
                    ></span>
                    <span className="text-[10px] text-gray-400 ml-1 uppercase">{input}</span>
                  </div>
                ))}

                {/* Internal Controls */}
                {def.control === 'slider' && (
                  <div className="py-2" onMouseDown={e => e.stopPropagation()}>
                    <input
                      type="range"
                      min="0" max="100"
                      value={node.data.value || 0}
                      onChange={(e) => updateNodeData(node.id, 'value', Number(e.target.value))}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-right text-xs text-blue-400 font-mono mt-1">{node.data.value || 0}</div>
                  </div>
                )}

                {/* Outputs */}
                {def.outputs.map((output, idx) => (
                  <div key={output} className="flex items-center justify-end h-6 relative">
                    <span className="text-[10px] text-gray-400 mr-1 uppercase">{output}</span>
                    <span className="absolute -right-4 w-3 h-3 bg-gray-600 rounded-full border-2 border-[#1e1e23] hover:bg-white transition-colors cursor-pointer z-10"
                      onMouseDown={(e) => handleSocketMouseDown(e, node.id, output, false)}
                    ></span>
                  </div>
                ))}

                {/* Display Node Content */}
                {node.type === 'DISPLAY' && (
                  <div className="mt-2 bg-black/50 rounded p-2 text-right font-mono text-xl text-green-400 overflow-hidden">
                    {typeof values[`${node.id}-special`] === 'number'
                      ? values[`${node.id}-special`].toFixed(2)
                      : JSON.stringify(values[`${node.id}-special`])}
                  </div>
                )}

                {/* Color Node Content */}
                {node.type === 'COLOR_BOX' && (
                  <div
                    className="mt-2 h-12 rounded border border-white/10"
                    style={{
                      backgroundColor: `rgb(${values[`${node.id}-special`]?.r || 0}, ${values[`${node.id}-special`]?.g || 0}, ${values[`${node.id}-special`]?.b || 0})`
                    }}
                  ></div>
                )}
              </div>
            </div>
          );
        })}
      </div >

      {/* Help / Overlay */}
      < div className="absolute bottom-4 right-4 pointer-events-none opacity-50 text-xs text-right max-w-xs" >
        <p>Drag connections from OUTPUT (Right) to INPUT (Left)</p>
        <p>Click Input socket to Disconnect</p>
      </div >
    </div >
  );
}
