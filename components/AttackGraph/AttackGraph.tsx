"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAegis } from "@/hooks/useAegis";

function Graph() {
  const nodesData = useAegis((s) => s.nodes);
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const depth: Record<string, number> = {};
    const perDepth: Record<number, number> = {};

    const rfNodes: Node[] = nodesData.map((n) => {
      const d = n.parent ? (depth[n.parent] ?? 0) + 1 : 0;
      depth[n.id] = d;
      const idx = perDepth[d] ?? 0;
      perDepth[d] = idx + 1;

      return {
        id: n.id,
        position: { x: idx * 220, y: d * 70 },
        data: { label: n.predicted ? `Next: ${n.label}` : n.label },
        style: {
          background: n.predicted ? "#ffffff" : "#171717",
          color: n.predicted ? "#525252" : "#fafafa",
          border: n.predicted ? "1.5px dashed #a3a3a3" : "1px solid #171717",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 13,
          width: 190,
        },
      };
    });

    const rfEdges: Edge[] = nodesData
      .filter((n) => n.parent)
      .map((n) => ({
        id: `${n.parent}-${n.id}`,
        source: n.parent as string,
        target: n.id,
        animated: !!n.predicted,
        style: {
          stroke: n.predicted ? "#a3a3a3" : "#525252",
          strokeDasharray: n.predicted ? "6 4" : undefined,
        },
      }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [nodesData]);

  useEffect(() => {
    const t = setTimeout(
      () => fitView({ duration: 400, padding: 0.15, maxZoom: 1 }),
      150
    );
    return () => clearTimeout(t);
  }, [nodes.length, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      colorMode="light"
      fitView
      nodesDraggable={false}
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={24} color="#e5e5e5" />
    </ReactFlow>
  );
}

export function AttackGraph() {
  return (
    <div className="h-[420px] rounded-xl border border-neutral-200 bg-white">
      <h2 className="px-4 pt-4 text-xs font-medium uppercase tracking-wider text-neutral-500">How the scam unfolded</h2>
      <div className="h-[calc(100%-2.25rem)]">
        <ReactFlowProvider>
          <Graph />
        </ReactFlowProvider>
      </div>
    </div>
  );
} 