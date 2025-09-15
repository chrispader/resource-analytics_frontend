/**
 * CustomEdge component for rendering edges with improved arrowheads and labels in React Flow.
 * This component recreates the edge style of standard PM4Py diagrams
 */

import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  // Get the bezier path and control points
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // For straight lines, use the direct vector; for curves, use the tangent at t=1
  let dx, dy;
  if (sourceX === targetX || sourceY === targetY) {
    // Straight line (vertical or horizontal)
    dx = targetX - sourceX;
    dy = targetY - sourceY;
  } else {
    // Bezier curve: use the last control point for tangent at t=1
    const c2x = targetX;
    const c2y = sourceY + (targetY - sourceY) * 0.5;
    dx = targetX - c2x;
    dy = targetY - c2y;
  }
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Arrowhead position: at the end of the edge
  const arrowX = targetX;
  const arrowY = targetY;

  // Label offset logic so incoming and outgoing edges don't overlap
  const labelOffset = 16;
  const isLTR = targetX > sourceX;
  const labelTextX =
    (sourceX + targetX) / 2 + (isLTR ? labelOffset : -labelOffset);
  const labelTextY = (sourceY + targetY) / 2;

  return (
    <>
      {/* Draw the edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{ stroke: "#000", strokeWidth: 2, fill: "none" }}
      />

      {/* Draw the improved open arrowhead */}
      <g transform={`translate(${arrowX},${arrowY}) rotate(${angle})`}>
        <polyline
          points={`-12,6 0,0 -12,-6`}
          fill="none"
          stroke="#000"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>

      {/* Render the edge label */}
      {data?.label && (
        <g>
          <text
            x={labelTextX}
            y={labelTextY}
            style={{
              fontSize: 12,
              userSelect: "none",
              pointerEvents: "none",
              fill: "#000",
              fontWeight: 500,
            }}
            dominantBaseline="middle"
            textAnchor="middle"
            stroke="#fff"
            strokeWidth={4}
            paintOrder="stroke"
          >
            {data.label}
          </text>
          <text
            x={labelTextX}
            y={labelTextY}
            style={{
              fontSize: 12,
              userSelect: "none",
              pointerEvents: "none",
              fill: "#000",
              fontWeight: 500,
            }}
            dominantBaseline="middle"
            textAnchor="middle"
            pointerEvents="none"
          >
            {data.label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;
