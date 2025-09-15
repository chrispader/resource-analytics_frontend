import React, { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowInstance,
} from "reactflow";
import { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

import { layoutWithElk } from "@/models/elkLayout";
import CustomEdge from "./CustomEdge";
import FlowChartTooltip from "./FlowChartTooltip";

const nodeTypes = {
  tooltipNode: FlowChartTooltip,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface ReactFlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeSelect: (node: Node) => void;
  panelId: string;
  selectedAnalysis: string;
  colorMappings: Record<string, Record<string, string>>;
  activityUtilization: Record<string, number>;
}

/**
 * 
 * @param dfg Data flow graph from the backend
 * transforms the unstructured backend dfg data into structured nodes and edges for React Flow
 * custom handle ensure better edge flow with less overlaps
 */
function transformBackendData(dfg: { nodes: Node[]; edges: Edge[] }) {
  const nodes = dfg.nodes.map((n) => ({
    id: n.id,
    data: { label: n.data.label },
    type: "tooltipNode",
    position: { x: 0, y: 0 },
  }));

  const edges = dfg.edges.map((e) => {
    const sourceNode = dfg.nodes.find((n) => n.id === e.source);
    const targetNode = dfg.nodes.find((n) => n.id === e.target);

    const sourceY = sourceNode?.position?.y ?? 0;
    const targetY = targetNode?.position?.y ?? 0;

    let sourceHandle = "bottom";
    let targetHandle = "top";

    if (sourceY > targetY) {
      // upward edge
      sourceHandle = "top";
      targetHandle = "bottom";
    }

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "custom",
      data: { label: e.label },
      sourceHandle,
      targetHandle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };
  });

  return { nodes, edges };
}

/**
 * 
 * @param utilization utilization percentage between 0 and 100
 * maps a utilization percentage to a color between white (0%) and red (100%)
 */
function utilizationToColor(utilization: number) {
  // Clamp between 0 and 100
  const percent = Math.max(0, Math.min(100, utilization));
  // Interpolate between white (255,255,255) and red (255,0,0)
  const r = 255;
  const g = Math.round(255 - (255 * percent) / 100);
  const b = Math.round(255 - (255 * percent) / 100);
  return `rgb(${r},${g},${b})`;
}

const ReactFlowChart = ({
  initialNodes,
  initialEdges,
  onNodeSelect,
  panelId,
  selectedAnalysis,
  colorMappings,
  activityUtilization,
}: ReactFlowChartProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoverDetails, setHoverDetails] = useState<Record<string, any>>({}); // eslint-disable-line @typescript-eslint/no-explicit-any
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const lastNonDetailAnalysis = useRef<string | null>(null);

  const handleInit = (instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  };

  /**
   * fetch additional hover details for nodes on component mount
   */
  useEffect(() => {
    async function fetchHoverDetails() {
      if (initialNodes.length > 0 && panelId) {
        try {
          const postResult = await fetch(
            "http://localhost:9090/node_hover_detail",
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                panel_id: panelId,
              }),
            }
          );

          const hoverData = await postResult.json();
          setHoverDetails(hoverData);
        } catch (error) {
          console.error("Error fetching node hover detail:", error);
        }
      }
    }

    fetchHoverDetails();
  }, [initialNodes, panelId]);

  /**
   * Perform layout using ELK and set nodes and edges with proper handles whenever initialNodes or initialEdges change.
   */
  useEffect(() => {
    async function load() {
      const raw = transformBackendData({
        nodes: initialNodes,
        edges: initialEdges,
      });

      // Layout with ELK
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await layoutWithElk(raw.nodes, raw.edges);

      // Use positions to assign handle directions
      const nodeMap = Object.fromEntries(layoutedNodes.map((n) => [n.id, n]));

      // First, assign direction (top/bottom/left/right) based on position
      const edgesWithDirections = layoutedEdges.map((e) => {
        const sourceNode = nodeMap[e.source];
        const targetNode = nodeMap[e.target];

        let sourceHandle = "bottom";
        let targetHandle = "top";

        if (
          sourceNode &&
          targetNode &&
          sourceNode.position.y > targetNode.position.y
        ) {
          // This is an upward edge
          sourceHandle = "top";
          targetHandle = "bottom";
        }

        return {
          ...e,
          sourceHandle,
          targetHandle,
        };
      });

      // Then, make handles unique per node/side, but keep the direction info
      function assignUniqueHandlesBySide(edges: Edge[]) {
        // Track used handles for each node and side
        const handleCount: Record<string, Record<string, number>> = {};

        return edges.map((edge) => {
          // Source
          const srcSide = edge.sourceHandle || "bottom";
          handleCount[edge.source] = handleCount[edge.source] || {};
          handleCount[edge.source][srcSide] =
            (handleCount[edge.source][srcSide] || 0) + 1;
          const sourceHandle = `${srcSide}-${
            handleCount[edge.source][srcSide]
          }`;

          // Target
          const tgtSide = edge.targetHandle || "top";
          handleCount[edge.target] = handleCount[edge.target] || {};
          handleCount[edge.target][tgtSide] =
            (handleCount[edge.target][tgtSide] || 0) + 1;
          const targetHandle = `${tgtSide}-${
            handleCount[edge.target][tgtSide]
          }`;

          return {
            ...edge,
            sourceHandle,
            targetHandle,
          };
        });
      }

      const updatedEdges = assignUniqueHandlesBySide(edgesWithDirections);

      const nodeHandlesMap: Record<string, Set<string>> = {};
      updatedEdges.forEach((edge) => {
        if (!nodeHandlesMap[edge.source])
          nodeHandlesMap[edge.source] = new Set();
        if (!nodeHandlesMap[edge.target])
          nodeHandlesMap[edge.target] = new Set();
        nodeHandlesMap[edge.source].add(edge.sourceHandle);
        nodeHandlesMap[edge.target].add(edge.targetHandle);
      });

      const nodesWithHandles = layoutedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          usedHandles: nodeHandlesMap[node.id]
            ? Array.from(nodeHandlesMap[node.id])
            : [],
        },
      }));

      setNodes(nodesWithHandles);
      setEdges(updatedEdges);

      setTimeout(() => {
        const instance = reactFlowInstanceRef.current;
        if (instance) {
          instance.fitView({ padding: 0.1 });
          const bounds = instance.getViewport();
          instance.setViewport(
            { x: bounds.x, y: 0, zoom: bounds.zoom },
            { duration: 500 }
          );
        }
      }, 300);
    }

    load();
  }, [initialNodes, initialEdges]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    onNodeSelect(node);
  };

  useEffect(() => {
    if (
      selectedAnalysis !== "analysis_detail" &&
      selectedAnalysis !== "" &&
      selectedAnalysis !== null
    ) {
      lastNonDetailAnalysis.current = selectedAnalysis;
    }
  }, [selectedAnalysis]);

  const colorKey =
    selectedAnalysis === "analysis_detail" && lastNonDetailAnalysis.current
      ? lastNonDetailAnalysis.current
      : selectedAnalysis;

  const nodesWithHoverDetails = nodes.map((node) => {
    let color = "#fff"; // default white
    let utilization = null;
    if (
      (colorKey === "capacity_utilization_resource" ||
        colorKey === "capacity_utilization_role" ||
        colorKey === "capacity_utilization_activity") &&
      activityUtilization &&
      node.data?.label
    ) {
      const util = activityUtilization[node.data.label];
      if (typeof util === "number") {
        utilization = util;
        color = utilizationToColor(util);
      }
    } else {
      color = colorMappings[colorKey]?.[node.data.label] || "#3498db";
    }
    return {
      ...node,
      data: {
        ...node.data,
        ...(hoverDetails[node.id] ? hoverDetails[node.id] : {}),
        color,
        utilization,
      },
    };
  });

  return (
    <div style={{ width: "100%", height: "70vh" }}>
      {nodes.length > 0 && (
        <ReactFlow
          nodes={nodesWithHoverDetails}
          edges={edges}
          onInit={handleInit}
          fitView
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Controls />
          <MiniMap style={{ height: "50", width: "50" }} pannable zoomable />
        </ReactFlow>
      )}
    </div>
  );
};

export default ReactFlowChart;
