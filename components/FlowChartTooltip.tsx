import React, { useState, memo, useRef } from "react";
import { createPortal } from "react-dom";
import { Handle, NodeProps, Position } from "reactflow";

interface TooltipProps extends NodeProps {
  panelId?: string;
}

const FlowChartTooltip = memo(({ data }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  /**
   * Handle mouse enter event to show tooltip and calculate its position.
   * The tooltip is positioned above the node and centered horizontally.
   */
  const handleMouseEnter = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY - 10,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
    setShowTooltip(true);
  };

  /**
   * Handle mouse leave event to hide tooltip.
  */
  const handleMouseLeave = () => setShowTooltip(false);

  // Only use handles that are actually used
  const usedHandles: string[] = data?.usedHandles || [];

  // Group handles by side
  const topHandles = usedHandles.filter((h) => h.startsWith("top"));
  const bottomHandles = usedHandles.filter((h) => h.startsWith("bottom"));

  const utilization = typeof data.utilization === "number" ? data.utilization : null;
  const nodeBg = utilization !== null
    ? `linear-gradient(to right, #e74c3c ${utilization}%, #fff ${utilization}%)`
    : (data.color || "#00BCD4");

  return (
    <div
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="react-flow__node-default"
      style={{
        position: "relative",
        background: nodeBg,
        color: "black",
        border: "1px solid black",
        borderRadius: "2px",
        padding: "10px",
        fontWeight: 500,
        textAlign: "center",
        minWidth: 180,
      }}
    >
      {/* Render only used top handles, distributed */}
      {topHandles.map((handleId, i) => (
        <Handle
          key={handleId}
          type="source"
          position={Position.Top}
          id={handleId}
          style={{
            background: "#000",
            left: `calc(${((i + 1) / (topHandles.length + 1)) * 100}% - 8px)`,
          }}
        />
      ))}
      {topHandles.map((handleId, i) => (
        <Handle
          key={handleId + "-target"}
          type="target"
          position={Position.Top}
          id={handleId}
          style={{
            background: "#000",
            left: `calc(${((i + 1) / (topHandles.length + 1)) * 100}% - 8px)`,
          }}
        />
      ))}
      {/* Render only used bottom handles, distributed */}
      {bottomHandles.map((handleId, i) => (
        <Handle
          key={handleId}
          type="source"
          position={Position.Bottom}
          id={handleId}
          style={{
            background: "#000",
            left: `calc(${
              ((i + 1) / (bottomHandles.length + 1)) * 100
            }% - 8px)`,
          }}
        />
      ))}
      {bottomHandles.map((handleId, i) => (
        <Handle
          key={handleId + "-target"}
          type="target"
          position={Position.Bottom}
          id={handleId}
          style={{
            background: "#000",
            left: `calc(${
              ((i + 1) / (bottomHandles.length + 1)) * 100
            }% - 8px)`,
          }}
        />
      ))}

      {/* Node label */}
      {data?.label || "No Label"}

      {/* Tooltip rendering */}
      {showTooltip &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translate(-50%, -100%)",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              marginBottom: "5px",
              whiteSpace: "nowrap",
              zIndex: 99999,
              minWidth: "150px",
              maxWidth: "300px",
              pointerEvents: "none",
            }}
          >
            <table style={{ color: "white" }}>
              <tbody>
                {[
                  { label: "Case Count", value: data?.case_count ?? "N/A" },
                  { label: "Unique Cases", value: data?.unique_cases ?? "N/A" },
                  {
                    label: "Unique Resources",
                    value: data?.unique_resources ?? "N/A",
                  },
                  {
                    label: "Responsible Role",
                    value: data?.responsible_role ?? "N/A",
                  },
                  {
                    label: "Avg. Duration",
                    value: data?.average_duration ?? "N/A",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td>
                      <strong>{row.label}</strong>
                    </td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
          document.body
        )}
    </div>
  );
});

FlowChartTooltip.displayName = "FlowChartTooltip";

export default FlowChartTooltip;