import React, { useState, useRef, useEffect } from 'react';

const Completion2 = () => {
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const svgRef = useRef(null);

  // Configuration
  const LINE_WIDTH = 20; // Distance between the two lines
  const STROKE_WIDTH = 2;

  const getRelativeMousePos = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getSnappedPoint = (currentPoints, mouseP) => {
    if (currentPoints.length < 2) return mouseP;

    const lastPoint = currentPoints[currentPoints.length - 1];
    const prevPoint = currentPoints[currentPoints.length - 2];

    const isHorizontal = Math.abs(lastPoint.y - prevPoint.y) < 0.01;
    
    // If previous segment was horizontal, this one must be vertical
    if (isHorizontal) {
      return { x: lastPoint.x, y: mouseP.y };
    } else {
      // If previous segment was vertical, this one must be horizontal
      return { x: mouseP.x, y: lastPoint.y };
    }
  };

  const handleMouseMove = (e) => {
    setMousePos(getRelativeMousePos(e));
  };

  const handleClick = (e) => {
    const rawPos = getRelativeMousePos(e);
    let newPoint = rawPos;

    if (points.length >= 2) {
      newPoint = getSnappedPoint(points, rawPos);
    } else if (points.length === 1) {
        // For the second point, we can enforce axis alignment if we want strictly 90 degrees from start,
        // but usually the first segment defines the grid. 
        // Let's allow free movement for 2nd point, OR snap to X/Y axis relative to 1st point for cleaner start.
        // Let's snap to nearest axis for better UX.
        const p1 = points[0];
        const dx = Math.abs(rawPos.x - p1.x);
        const dy = Math.abs(rawPos.y - p1.y);
        if (dx > dy) {
            newPoint = { x: rawPos.x, y: p1.y };
        } else {
            newPoint = { x: p1.x, y: rawPos.y };
        }
    }

    setPoints([...points, newPoint]);
  };

  const handleReset = () => {
    setPoints([]);
  };

  // --- Algorithm Implementation ---

  const calculateOffsetLines = (pts, offset) => {
    if (pts.length < 2) return { left: [], right: [] };

    const leftLine = [];
    const rightLine = [];

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // Direction vector
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      dx /= len;
      dy /= len;

      // Normal vector (rotated -90 degrees: x -> y, y -> -x)
      // Standard 2D normal: (-dy, dx)
      const nx = -dy;
      const ny = dx;

      // Offset points for this segment
      const p1Left = { x: p1.x + nx * offset, y: p1.y + ny * offset };
      const p1Right = { x: p1.x - nx * offset, y: p1.y - ny * offset };
      const p2Left = { x: p2.x + nx * offset, y: p2.y + ny * offset };
      const p2Right = { x: p2.x - nx * offset, y: p2.y - ny * offset };

      // For the very first segment, just add the start points
      if (i === 0) {
        leftLine.push(p1Left);
        rightLine.push(p1Right);
      }

      // For subsequent segments, we need to compute the intersection with the previous segment's offset lines.
      // However, since we are strictly 90 degrees, the intersection is simply the corner.
      // The "inner" corner will be closer to the pivot, the "outer" corner will be farther.
      // Actually, a simpler approach for strictly 90-degree paths:
      // The intersection of two parallel offset lines at a 90 degree turn is just the offset point extended.
      // Let's look at the geometry.
      // If we just add p2Left and p2Right, we get disjoint segments. We need to join them.
      // For 90 degree turns, the join is a simple point.
      
      // Let's just push the end points of the segment for now. 
      // A naive approach: just draw the segments. 
      // But we want a continuous line. 
      // We need to calculate the intersection of (p1Left->p2Left) and (next_p1Left->next_p2Left).
      
      // Since we process iteratively, let's store the current segment's end offset points
      // and when we process the next segment, we fix the previous join.
      
      // Actually, let's pre-calculate all segment normals.
    }
    
    // Revised approach:
    // 1. Calculate normals for all segments.
    // 2. For each vertex i (from 1 to n-2), find intersection of segment (i-1) offset and segment (i) offset.
    
    const segments = [];
    for(let i=0; i<pts.length-1; i++) {
        const p1 = pts[i];
        const p2 = pts[i+1];
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len === 0) continue;
        segments.push({
            p1, p2,
            dx: dx/len, dy: dy/len,
            nx: -dy/len, ny: dx/len 
        });
    }

    const finalLeft = [];
    const finalRight = [];

    if (segments.length > 0) {
        // Start points
        finalLeft.push({ 
            x: segments[0].p1.x + segments[0].nx * offset, 
            y: segments[0].p1.y + segments[0].ny * offset 
        });
        finalRight.push({ 
            x: segments[0].p1.x - segments[0].nx * offset, 
            y: segments[0].p1.y - segments[0].ny * offset 
        });

        for (let i = 0; i < segments.length - 1; i++) {
            const s1 = segments[i];
            const s2 = segments[i+1];

            // Intersection for Left Line
            // Line 1: P = (s1.p1 + off) + t * s1.dir
            // Line 2: P = (s2.p1 + off) + u * s2.dir
            // Since s1.p2 == s2.p1 (the corner), let's call it C.
            // We want intersection of line parallel to s1 passing through (C + s1.n * off)
            // and line parallel to s2 passing through (C + s2.n * off).
            
            // For 90 degree turns, it's easy.
            // The intersection point is C + s1.n * offset + s2.n * offset? 
            // No, that's vector addition.
            
            // General line intersection formula:
            // L1: P1_L -> P2_L
            // L2: P2_L_next -> P3_L
            
            // L1 end point (unadjusted): C + s1.n * offset
            // L2 start point (unadjusted): C + s2.n * offset
            
            // We need a point I such that (I - (C + s1.n*off)) is parallel to s1.d
            // AND (I - (C + s2.n*off)) is parallel to s2.d
            
            // This is a classic "miter joint" calculation.
            // Miter vector = (n1 + n2).normalized() / cos(theta/2)
            // But for 90 degrees, it's simpler.
            
            // Let's use a robust line-line intersection function.
            
            const p1L = { x: s1.p1.x + s1.nx * offset, y: s1.p1.y + s1.ny * offset };
            const p2L = { x: s1.p2.x + s1.nx * offset, y: s1.p2.y + s1.ny * offset };
            
            const p3L = { x: s2.p1.x + s2.nx * offset, y: s2.p1.y + s2.ny * offset }; // s2.p1 is same as s1.p2
            const p4L = { x: s2.p2.x + s2.nx * offset, y: s2.p2.y + s2.ny * offset };
            
            const intL = getLineIntersection(p1L, p2L, p3L, p4L);
            
            const p1R = { x: s1.p1.x - s1.nx * offset, y: s1.p1.y - s1.ny * offset };
            const p2R = { x: s1.p2.x - s1.nx * offset, y: s1.p2.y - s1.ny * offset };
            
            const p3R = { x: s2.p1.x - s2.nx * offset, y: s2.p1.y - s2.ny * offset };
            const p4R = { x: s2.p2.x - s2.nx * offset, y: s2.p2.y - s2.ny * offset };
            
            const intR = getLineIntersection(p1R, p2R, p3R, p4R);
            
            if (intL) finalLeft.push(intL);
            else finalLeft.push(p2L); // Should not happen for 90 deg unless 180?
            
            if (intR) finalRight.push(intR);
            else finalRight.push(p2R);
        }

        // End points
        const lastS = segments[segments.length - 1];
        finalLeft.push({ 
            x: lastS.p2.x + lastS.nx * offset, 
            y: lastS.p2.y + lastS.ny * offset 
        });
        finalRight.push({ 
            x: lastS.p2.x - lastS.nx * offset, 
            y: lastS.p2.y - lastS.ny * offset 
        });
    }

    return { left: finalLeft, right: finalRight };
  };

  const getLineIntersection = (p1, p2, p3, p4) => {
    // Check if lines are parallel
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return null;
    
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y)
    };
  };

  // --- Rendering ---

  // Calculate preview point
  let previewPoint = null;
  if (mousePos && points.length > 0) {
    if (points.length >= 2) {
        previewPoint = getSnappedPoint(points, mousePos);
    } else {
        // Snap logic for 2nd point
        const p1 = points[0];
        const dx = Math.abs(mousePos.x - p1.x);
        const dy = Math.abs(mousePos.y - p1.y);
        if (dx > dy) {
            previewPoint = { x: mousePos.x, y: p1.y };
        } else {
            previewPoint = { x: p1.x, y: mousePos.y };
        }
    }
  }

  const pointsToRender = previewPoint ? [...points, previewPoint] : points;
  const { left, right } = calculateOffsetLines(pointsToRender, LINE_WIDTH / 2);

  const pointsToString = (pts) => pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Double Lines Challenge</h2>
      <p>Click to add points. Lines must form 90-degree angles.</p>
      <button onClick={handleReset} style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}>
        Reset
      </button>
      
      <div 
        style={{ border: '1px solid #ccc', display: 'inline-block', cursor: 'crosshair' }}
      >
        <svg 
            ref={svgRef}
            width="800" 
            height="600" 
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{ display: 'block' }}
        >
            {/* Center Path (faint) */}
            <polyline 
                points={pointsToString(pointsToRender)} 
                fill="none" 
                stroke="#ddd" 
                strokeWidth="1" 
                strokeDasharray="5,5"
            />

            {/* Left Line */}
            <polyline 
                points={pointsToString(left)} 
                fill="none" 
                stroke="blue" 
                strokeWidth={STROKE_WIDTH} 
            />

            {/* Right Line */}
            <polyline 
                points={pointsToString(right)} 
                fill="none" 
                stroke="red" 
                strokeWidth={STROKE_WIDTH} 
            />

            {/* Points */}
            {pointsToRender.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#333" />
            ))}
        </svg>
      </div>
    </div>
  );
};

export default Completion2;
