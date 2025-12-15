import React, { useState, useCallback, useRef } from 'react';

// Block types for the visual programming language
const BLOCK_TYPES = {
  // Values
  NUMBER: { type: 'NUMBER', color: '#9b59b6', label: 'Number', category: 'value' },
  STRING: { type: 'STRING', color: '#3498db', label: 'Text', category: 'value' },
  // Variables
  SET_VAR: { type: 'SET_VAR', color: '#e67e22', label: 'Set Variable', category: 'variable' },
  GET_VAR: { type: 'GET_VAR', color: '#e67e22', label: 'Get Variable', category: 'variable' },
  // Math
  ADD: { type: 'ADD', color: '#2ecc71', label: '+ Add', category: 'math' },
  SUBTRACT: { type: 'SUBTRACT', color: '#2ecc71', label: '− Subtract', category: 'math' },
  MULTIPLY: { type: 'MULTIPLY', color: '#2ecc71', label: '× Multiply', category: 'math' },
  DIVIDE: { type: 'DIVIDE', color: '#2ecc71', label: '÷ Divide', category: 'math' },
  // Comparison
  EQUALS: { type: 'EQUALS', color: '#1abc9c', label: '= Equals', category: 'compare' },
  GREATER: { type: 'GREATER', color: '#1abc9c', label: '> Greater', category: 'compare' },
  LESS: { type: 'LESS', color: '#1abc9c', label: '< Less', category: 'compare' },
  // Logic
  AND: { type: 'AND', color: '#f39c12', label: 'AND', category: 'logic' },
  OR: { type: 'OR', color: '#f39c12', label: 'OR', category: 'logic' },
  NOT: { type: 'NOT', color: '#f39c12', label: 'NOT', category: 'logic' },
  // Control
  IF: { type: 'IF', color: '#e74c3c', label: 'If', category: 'control' },
  REPEAT: { type: 'REPEAT', color: '#e74c3c', label: 'Repeat', category: 'control' },
  WHILE: { type: 'WHILE', color: '#e74c3c', label: 'While', category: 'control' },
  // Output
  PRINT: { type: 'PRINT', color: '#34495e', label: 'Print', category: 'output' },
};

const VARIABLE_NAMES = ['x', 'y', 'z', 'a', 'b', 'c', 'i', 'j', 'n', 'sum', 'count', 'result'];
const NUMBER_VALUES = [0, 1, 2, 3, 4, 5, 10, 20, 50, 100];
const STRING_VALUES = ['Hello', 'World', 'Yes', 'No', 'Done', '!', ' '];

// Generate unique ID
let blockIdCounter = 0;
const generateId = () => `block_${++blockIdCounter}`;

// Block component
const Block = ({ block, onDragStart, onRemove, isInPalette, onValueClick }) => {
  const blockType = BLOCK_TYPES[block.type];
  const hasValue = block.value !== undefined && block.value !== null;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: blockType.color,
    color: 'white',
    borderRadius: '6px',
    cursor: 'grab',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    userSelect: 'none',
    minHeight: '36px',
    position: 'relative',
  };

  const valueStyle = {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: isInPalette ? 'grab' : 'pointer',
  };

  const removeStyle = {
    marginLeft: '4px',
    padding: '2px 6px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  };

  return (
    <div draggable onDragStart={(e) => onDragStart(e, block, isInPalette)} style={style}>
      <span>{blockType.label}</span>
      {hasValue && (
        <span
          style={valueStyle}
          onClick={
            !isInPalette
              ? (e) => {
                  e.stopPropagation();
                  onValueClick && onValueClick(block);
                }
              : undefined
          }
        >
          {block.value}
        </span>
      )}
      {!isInPalette && (
        <span
          style={removeStyle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
          }}
        >
          ×
        </span>
      )}
    </div>
  );
};

// Drop slot for nested blocks
const DropSlot = ({ label, block, onDrop, onDragStart, onRemove, onValueClick, depth = 0 }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e);
  };

  const slotStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: '80px',
    minHeight: '36px',
    padding: '4px 8px',
    backgroundColor: isDragOver ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
    borderRadius: '4px',
    border: '2px dashed rgba(255,255,255,0.4)',
    margin: '2px',
  };

  const labelStyle = {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontStyle: 'italic',
  };

  return (
    <div
      style={slotStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {block ? (
        <CompoundBlock
          block={block}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth + 1}
        />
      ) : (
        <span style={labelStyle}>{label}</span>
      )}
    </div>
  );
};

// Compound block that can contain other blocks
const CompoundBlock = ({
  block,
  onDragStart,
  onRemove,
  onDrop,
  onValueClick,
  isInPalette = false,
  depth = 0,
}) => {
  const blockType = BLOCK_TYPES[block.type];
  const hasSlots = [
    'ADD',
    'SUBTRACT',
    'MULTIPLY',
    'DIVIDE',
    'EQUALS',
    'GREATER',
    'LESS',
    'AND',
    'OR',
    'NOT',
    'IF',
    'REPEAT',
    'WHILE',
    'PRINT',
    'SET_VAR',
  ].includes(block.type);

  if (!hasSlots || isInPalette) {
    return (
      <Block
        block={block}
        onDragStart={onDragStart}
        onRemove={onRemove}
        isInPalette={isInPalette}
        onValueClick={onValueClick}
      />
    );
  }

  const containerStyle = {
    display: 'inline-flex',
    flexDirection:
      block.type === 'IF' || block.type === 'REPEAT' || block.type === 'WHILE' ? 'column' : 'row',
    alignItems:
      block.type === 'IF' || block.type === 'REPEAT' || block.type === 'WHILE'
        ? 'stretch'
        : 'center',
    gap: '4px',
    padding: '8px',
    backgroundColor: blockType.color,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    position: 'relative',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'white',
    fontWeight: '500',
  };

  const bodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '4px',
    minHeight: '50px',
    marginTop: '4px',
  };

  const removeStyle = {
    padding: '2px 6px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white',
    marginLeft: 'auto',
  };

  const handleSlotDrop = (slotName) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData('application/json');
    if (data && onDrop) {
      const droppedBlock = JSON.parse(data);
      onDrop(block.id, slotName, droppedBlock);
    }
  };

  // Render binary operations (math, comparison, logic)
  if (
    ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'EQUALS', 'GREATER', 'LESS', 'AND', 'OR'].includes(
      block.type
    )
  ) {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <DropSlot
          label="left"
          block={block.left}
          onDrop={handleSlotDrop('left')}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth}
        />
        <span style={{ color: 'white', fontWeight: 'bold' }}>{blockType.label}</span>
        <DropSlot
          label="right"
          block={block.right}
          onDrop={handleSlotDrop('right')}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth}
        />
        <span style={removeStyle} onClick={() => onRemove(block.id)}>
          ×
        </span>
      </div>
    );
  }

  // Render NOT
  if (block.type === 'NOT') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <span style={{ color: 'white', fontWeight: 'bold' }}>NOT</span>
        <DropSlot
          label="value"
          block={block.operand}
          onDrop={handleSlotDrop('operand')}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth}
        />
        <span style={removeStyle} onClick={() => onRemove(block.id)}>
          ×
        </span>
      </div>
    );
  }

  // Render PRINT
  if (block.type === 'PRINT') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <span style={{ color: 'white', fontWeight: 'bold' }}>Print</span>
        <DropSlot
          label="value"
          block={block.value}
          onDrop={handleSlotDrop('value')}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth}
        />
        <span style={removeStyle} onClick={() => onRemove(block.id)}>
          ×
        </span>
      </div>
    );
  }

  // Render SET_VAR
  if (block.type === 'SET_VAR') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <span style={{ color: 'white', fontWeight: 'bold' }}>Set</span>
        <span
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
          }}
          onClick={() => onValueClick && onValueClick(block, 'varName')}
        >
          {block.varName || 'x'}
        </span>
        <span style={{ color: 'white' }}>=</span>
        <DropSlot
          label="value"
          block={block.value}
          onDrop={handleSlotDrop('value')}
          onDragStart={onDragStart}
          onRemove={onRemove}
          onValueClick={onValueClick}
          depth={depth}
        />
        <span style={removeStyle} onClick={() => onRemove(block.id)}>
          ×
        </span>
      </div>
    );
  }

  // Render IF
  if (block.type === 'IF') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <div style={headerStyle}>
          <span>If</span>
          <DropSlot
            label="condition"
            block={block.condition}
            onDrop={handleSlotDrop('condition')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
          <span>then</span>
          <span style={removeStyle} onClick={() => onRemove(block.id)}>
            ×
          </span>
        </div>
        <div style={bodyStyle}>
          {(block.body || []).map((child) => (
            <CompoundBlock
              key={child.id}
              block={child}
              onDragStart={onDragStart}
              onRemove={onRemove}
              onDrop={onDrop}
              onValueClick={onValueClick}
              depth={depth + 1}
            />
          ))}
          <DropSlot
            label="add statement"
            onDrop={handleSlotDrop('body')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
        </div>
      </div>
    );
  }

  // Render REPEAT
  if (block.type === 'REPEAT') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <div style={headerStyle}>
          <span>Repeat</span>
          <DropSlot
            label="times"
            block={block.times}
            onDrop={handleSlotDrop('times')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
          <span>times</span>
          <span style={removeStyle} onClick={() => onRemove(block.id)}>
            ×
          </span>
        </div>
        <div style={bodyStyle}>
          {(block.body || []).map((child) => (
            <CompoundBlock
              key={child.id}
              block={child}
              onDragStart={onDragStart}
              onRemove={onRemove}
              onDrop={onDrop}
              onValueClick={onValueClick}
              depth={depth + 1}
            />
          ))}
          <DropSlot
            label="add statement"
            onDrop={handleSlotDrop('body')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
        </div>
      </div>
    );
  }

  // Render WHILE
  if (block.type === 'WHILE') {
    return (
      <div style={containerStyle} draggable onDragStart={(e) => onDragStart(e, block, false)}>
        <div style={headerStyle}>
          <span>While</span>
          <DropSlot
            label="condition"
            block={block.condition}
            onDrop={handleSlotDrop('condition')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
          <span style={removeStyle} onClick={() => onRemove(block.id)}>
            ×
          </span>
        </div>
        <div style={bodyStyle}>
          {(block.body || []).map((child) => (
            <CompoundBlock
              key={child.id}
              block={child}
              onDragStart={onDragStart}
              onRemove={onRemove}
              onDrop={onDrop}
              onValueClick={onValueClick}
              depth={depth + 1}
            />
          ))}
          <DropSlot
            label="add statement"
            onDrop={handleSlotDrop('body')}
            onDragStart={onDragStart}
            onRemove={onRemove}
            onValueClick={onValueClick}
            depth={depth}
          />
        </div>
      </div>
    );
  }

  return (
    <Block
      block={block}
      onDragStart={onDragStart}
      onRemove={onRemove}
      isInPalette={isInPalette}
      onValueClick={onValueClick}
    />
  );
};

// Value picker popup
const ValuePicker = ({ type, onSelect, onClose, position }) => {
  const values =
    type === 'NUMBER' ? NUMBER_VALUES : type === 'STRING' ? STRING_VALUES : VARIABLE_NAMES;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  };

  const popupStyle = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    padding: '12px',
    zIndex: 1001,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    maxWidth: '300px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={popupStyle}>
        {values.map((v) => (
          <button
            key={v}
            style={buttonStyle}
            onClick={() => onSelect(v)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
          >
            {v}
          </button>
        ))}
      </div>
    </>
  );
};

// Execute blocks
const executeBlocks = (blocks, variables = {}, output = [], maxIterations = 1000) => {
  let iterations = 0;

  const evaluate = (block) => {
    if (!block) return null;

    switch (block.type) {
      case 'NUMBER':
        return Number(block.value) || 0;
      case 'STRING':
        return String(block.value || '');
      case 'GET_VAR':
        return variables[block.value] ?? 0;
      case 'ADD':
        return evaluate(block.left) + evaluate(block.right);
      case 'SUBTRACT':
        return evaluate(block.left) - evaluate(block.right);
      case 'MULTIPLY':
        return evaluate(block.left) * evaluate(block.right);
      case 'DIVIDE': {
        const divisor = evaluate(block.right);
        return divisor !== 0 ? evaluate(block.left) / divisor : 0;
      }
      case 'EQUALS':
        return evaluate(block.left) === evaluate(block.right);
      case 'GREATER':
        return evaluate(block.left) > evaluate(block.right);
      case 'LESS':
        return evaluate(block.left) < evaluate(block.right);
      case 'AND':
        return evaluate(block.left) && evaluate(block.right);
      case 'OR':
        return evaluate(block.left) || evaluate(block.right);
      case 'NOT':
        return !evaluate(block.operand);
      default:
        return null;
    }
  };

  const execute = (block) => {
    if (++iterations > maxIterations) {
      throw new Error('Maximum iterations exceeded');
    }

    switch (block.type) {
      case 'PRINT':
        output.push(String(evaluate(block.value)));
        break;
      case 'SET_VAR':
        variables[block.varName || 'x'] = evaluate(block.value);
        break;
      case 'IF':
        if (evaluate(block.condition)) {
          (block.body || []).forEach(execute);
        }
        break;
      case 'REPEAT': {
        const times = Math.min(evaluate(block.times) || 0, 100);
        for (let i = 0; i < times; i++) {
          (block.body || []).forEach(execute);
        }
        break;
      }
      case 'WHILE': {
        let whileIterations = 0;
        while (evaluate(block.condition) && whileIterations < 100) {
          (block.body || []).forEach(execute);
          whileIterations++;
        }
        break;
      }
      default:
        break;
    }
  };

  blocks.forEach(execute);
  return { output, variables };
};

// Deep clone a block with new IDs (outside component to avoid recreation)
const cloneBlock = (block) => {
  if (!block) return null;

  const newBlock = { ...block, id: generateId() };

  if (block.left) newBlock.left = cloneBlock(block.left);
  if (block.right) newBlock.right = cloneBlock(block.right);
  if (block.operand) newBlock.operand = cloneBlock(block.operand);
  if (block.value && typeof block.value === 'object') newBlock.value = cloneBlock(block.value);
  if (block.condition) newBlock.condition = cloneBlock(block.condition);
  if (block.times) newBlock.times = cloneBlock(block.times);
  if (block.body) newBlock.body = block.body.map(cloneBlock);

  return newBlock;
};

// Main component
const Completion27 = () => {
  const [program, setProgram] = useState([]);
  const [output, setOutput] = useState([]);
  const [valuePicker, setValuePicker] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [variables, setVariables] = useState({});
  const programAreaRef = useRef(null);

  // Create a new block instance from type
  const createBlock = (type) => {
    const block = { id: generateId(), type };

    if (type === 'NUMBER') block.value = 0;
    if (type === 'STRING') block.value = 'Hello';
    if (type === 'GET_VAR') block.value = 'x';
    if (type === 'SET_VAR') block.varName = 'x';
    if (
      ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'EQUALS', 'GREATER', 'LESS', 'AND', 'OR'].includes(
        type
      )
    ) {
      block.left = null;
      block.right = null;
    }
    if (type === 'NOT') block.operand = null;
    if (type === 'PRINT') block.value = null;
    if (type === 'SET_VAR') block.value = null;
    if (['IF', 'REPEAT', 'WHILE'].includes(type)) {
      block.body = [];
      if (type === 'IF' || type === 'WHILE') block.condition = null;
      if (type === 'REPEAT') block.times = null;
    }

    return block;
  };

  // Handle drag start
  const handleDragStart = useCallback((e, block, isFromPalette) => {
    const blockData = isFromPalette ? createBlock(block.type) : cloneBlock(block);
    e.dataTransfer.setData('application/json', JSON.stringify(blockData));
    e.dataTransfer.setData('isFromPalette', String(isFromPalette));
    e.dataTransfer.setData('originalId', block.id);
  }, []);

  // Remove a block by ID from the program
  const removeBlock = useCallback((id) => {
    const removeFromTree = (blocks) => {
      return blocks
        .filter((b) => b.id !== id)
        .map((block) => {
          const newBlock = { ...block };
          if (newBlock.left?.id === id) newBlock.left = null;
          else if (newBlock.left) newBlock.left = { ...newBlock.left };

          if (newBlock.right?.id === id) newBlock.right = null;
          else if (newBlock.right) newBlock.right = { ...newBlock.right };

          if (newBlock.operand?.id === id) newBlock.operand = null;
          else if (newBlock.operand) newBlock.operand = { ...newBlock.operand };

          if (newBlock.value?.id === id) newBlock.value = null;
          else if (newBlock.value && typeof newBlock.value === 'object')
            newBlock.value = { ...newBlock.value };

          if (newBlock.condition?.id === id) newBlock.condition = null;
          else if (newBlock.condition) newBlock.condition = { ...newBlock.condition };

          if (newBlock.times?.id === id) newBlock.times = null;
          else if (newBlock.times) newBlock.times = { ...newBlock.times };

          if (newBlock.body) newBlock.body = removeFromTree(newBlock.body);

          return newBlock;
        });
    };

    setProgram((prev) => removeFromTree(prev));
  }, []);

  // Handle drop on the main program area
  const handleProgramDrop = useCallback(
    (e) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const block = JSON.parse(data);
      const isFromPalette = e.dataTransfer.getData('isFromPalette') === 'true';

      if (!isFromPalette) {
        const originalId = e.dataTransfer.getData('originalId');
        removeBlock(originalId);
      }

      setProgram((prev) => [...prev, block]);
    },
    [removeBlock]
  );

  // Handle drop on a slot within a block
  const handleSlotDrop = useCallback((parentId, slotName, droppedBlock) => {
    const updateTree = (blocks) => {
      return blocks.map((block) => {
        if (block.id === parentId) {
          const newBlock = { ...block };
          if (slotName === 'body') {
            newBlock.body = [...(block.body || []), droppedBlock];
          } else {
            newBlock[slotName] = droppedBlock;
          }
          return newBlock;
        }

        const newBlock = { ...block };
        if (newBlock.left) newBlock.left = updateTree([newBlock.left])[0];
        if (newBlock.right) newBlock.right = updateTree([newBlock.right])[0];
        if (newBlock.operand) newBlock.operand = updateTree([newBlock.operand])[0];
        if (newBlock.value && typeof newBlock.value === 'object') {
          newBlock.value = updateTree([newBlock.value])[0];
        }
        if (newBlock.condition) newBlock.condition = updateTree([newBlock.condition])[0];
        if (newBlock.times) newBlock.times = updateTree([newBlock.times])[0];
        if (newBlock.body) newBlock.body = updateTree(newBlock.body);

        return newBlock;
      });
    };

    setProgram((prev) => updateTree(prev));
  }, []);

  // Handle value click to show picker
  const handleValueClick = useCallback((block, field = 'value') => {
    const type =
      block.type === 'NUMBER'
        ? 'NUMBER'
        : block.type === 'STRING'
          ? 'STRING'
          : block.type === 'GET_VAR' || field === 'varName'
            ? 'VAR'
            : null;

    if (type) {
      setValuePicker({ blockId: block.id, field, type, position: { x: 200, y: 200 } });
    }
  }, []);

  // Handle value selection
  const handleValueSelect = useCallback(
    (value) => {
      if (!valuePicker) return;

      const updateTree = (blocks) => {
        return blocks.map((block) => {
          if (block.id === valuePicker.blockId) {
            return { ...block, [valuePicker.field]: value };
          }

          const newBlock = { ...block };
          if (newBlock.left) newBlock.left = updateTree([newBlock.left])[0];
          if (newBlock.right) newBlock.right = updateTree([newBlock.right])[0];
          if (newBlock.operand) newBlock.operand = updateTree([newBlock.operand])[0];
          if (newBlock.value && typeof newBlock.value === 'object') {
            newBlock.value = updateTree([newBlock.value])[0];
          }
          if (newBlock.condition) newBlock.condition = updateTree([newBlock.condition])[0];
          if (newBlock.times) newBlock.times = updateTree([newBlock.times])[0];
          if (newBlock.body) newBlock.body = updateTree(newBlock.body);

          return newBlock;
        });
      };

      setProgram((prev) => updateTree(prev));
      setValuePicker(null);
    },
    [valuePicker]
  );

  // Run the program
  const runProgram = useCallback(() => {
    try {
      const result = executeBlocks(program);
      setOutput(result.output);
      setVariables(result.variables);
    } catch (error) {
      setOutput([`Error: ${error.message}`]);
    }
  }, [program]);

  // Clear program
  const clearProgram = useCallback(() => {
    setProgram([]);
    setOutput([]);
    setVariables({});
  }, []);

  // Filter blocks by category
  const filteredBlocks = Object.values(BLOCK_TYPES).filter(
    (block) => activeCategory === 'all' || block.category === activeCategory
  );

  const categories = ['all', 'value', 'variable', 'math', 'compare', 'logic', 'control', 'output'];

  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#1a1a2e',
    color: 'white',
  };

  const headerStyle = {
    padding: '16px 24px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const mainStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const paletteStyle = {
    width: '280px',
    backgroundColor: '#16213e',
    borderRight: '1px solid #0f3460',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const categoryTabsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    padding: '12px',
    borderBottom: '1px solid #0f3460',
  };

  const categoryTabStyle = (isActive) => ({
    padding: '6px 12px',
    backgroundColor: isActive ? '#e94560' : '#0f3460',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    textTransform: 'capitalize',
  });

  const blocksListStyle = {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    flex: 1,
  };

  const workspaceStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const programAreaStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#0f3460',
    margin: '16px',
    borderRadius: '12px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const outputStyle = {
    height: '150px',
    margin: '0 16px 16px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '14px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
  };

  const buttonStyle = (color) => ({
    padding: '10px 20px',
    backgroundColor: color,
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  });

  const dropHintStyle = {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
  };

  const variablesStyle = {
    display: 'flex',
    gap: '12px',
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    margin: '0 16px',
    borderRadius: '8px',
    fontSize: '13px',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '32px' }}>🖱️</span>
          Mouse Programming
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={buttonStyle('#e94560')} onClick={runProgram}>
            ▶ Run
          </button>
          <button style={buttonStyle('#6c757d')} onClick={clearProgram}>
            🗑 Clear
          </button>
        </div>
      </header>

      <main style={mainStyle}>
        <aside style={paletteStyle}>
          <div style={categoryTabsStyle}>
            {categories.map((cat) => (
              <button
                key={cat}
                style={categoryTabStyle(activeCategory === cat)}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={blocksListStyle}>
            {filteredBlocks.map((blockType) => (
              <CompoundBlock
                key={blockType.type}
                block={{
                  id: `palette_${blockType.type}`,
                  type: blockType.type,
                  value:
                    blockType.type === 'NUMBER'
                      ? 0
                      : blockType.type === 'STRING'
                        ? 'Hello'
                        : blockType.type === 'GET_VAR'
                          ? 'x'
                          : undefined,
                }}
                onDragStart={handleDragStart}
                onRemove={() => {}}
                isInPalette={true}
              />
            ))}
          </div>
        </aside>

        <div style={workspaceStyle}>
          <div
            ref={programAreaRef}
            style={programAreaStyle}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleProgramDrop}
          >
            {program.length === 0 ? (
              <div style={dropHintStyle}>Drag blocks here to build your program</div>
            ) : (
              program.map((block) => (
                <CompoundBlock
                  key={block.id}
                  block={block}
                  onDragStart={handleDragStart}
                  onRemove={removeBlock}
                  onDrop={handleSlotDrop}
                  onValueClick={handleValueClick}
                />
              ))
            )}
          </div>

          {Object.keys(variables).length > 0 && (
            <div style={variablesStyle}>
              <strong>Variables:</strong>
              {Object.entries(variables).map(([name, value]) => (
                <span
                  key={name}
                  style={{ backgroundColor: '#e67e22', padding: '2px 8px', borderRadius: '4px' }}
                >
                  {name} = {value}
                </span>
              ))}
            </div>
          )}

          <div style={outputStyle}>
            <strong style={{ color: '#2ecc71' }}>Output:</strong>
            <div style={{ marginTop: '8px' }}>
              {output.length === 0 ? (
                <span style={{ color: '#666' }}>Click "Run" to execute your program</span>
              ) : (
                output.map((line, i) => <div key={i}>{line}</div>)
              )}
            </div>
          </div>
        </div>
      </main>

      {valuePicker && (
        <ValuePicker
          type={valuePicker.type}
          position={valuePicker.position}
          onSelect={handleValueSelect}
          onClose={() => setValuePicker(null)}
        />
      )}
    </div>
  );
};

export default Completion27;
