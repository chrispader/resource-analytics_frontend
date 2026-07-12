import type { Config, Data, Layout } from "plotly.js";

export interface PlotlyFigureJson {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

export type FixedOrdering =
  | "current"
  | "alphabetical"
  | "degree_based"
  | "similarity_based";

export type PlotOrdering = FixedOrdering | "random_0";

export const RESOURCE_ROLE_ORDERING_OPTIONS: ReadonlyArray<{
  value: PlotOrdering;
  label: string;
}> = [
  { value: "current", label: "Current" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "degree_based", label: "Degree based" },
  { value: "similarity_based", label: "Similarity based" },
  { value: "random_0", label: "Random (seed 0)" },
];

export interface OrderingEvaluation {
  variant: string;
  seed: number | null;
  row_coherence: number;
  column_coherence: number;
  blockiness: number;
  row_fragmentation: number;
  column_fragmentation: number;
  color_discriminability: number;
}

export interface ResourceRoleMatrixEvaluations {
  orderings: Record<FixedOrdering, OrderingEvaluation>;
  random_baselines: OrderingEvaluation[];
}

export interface OrderingMetricBound {
  lower: number;
  upper: number;
  higher_is_better: boolean;
}

export type OrderingMetricBounds = Record<
  (typeof ORDERING_METRIC_COLUMNS)[number],
  OrderingMetricBound
>;

export interface OrderingMetricsTableRow extends OrderingEvaluation {
  ordering_key: string;
  source: "ordering" | "baseline";
}

export type HeuristicFindingStatus = "warning" | "advice" | "pass";

export interface PlotlyHeuristicRuleLabels {
  visual_frames: string[];
  visual_structures: string[];
  visual_unities: string[];
  visual_primitives: string[];
  labeling: string[];
  interaction: string[];
  data_attributes: string[];
}

export interface PlotlyHeuristicFinding {
  rule_id: string;
  heuristic: string;
  assistance: "automatic-check" | "advice";
  status: HeuristicFindingStatus;
  message: string;
  recommendation: string | null;
  labels: PlotlyHeuristicRuleLabels;
  evidence: Record<string, unknown>;
  source: string;
}

export interface PlotlyHeuristicReport {
  summary: Record<HeuristicFindingStatus, number>;
  feature_summary: {
    frame_count?: number;
    trace_types?: string[];
    axis_count?: number;
    detected_colors?: number;
  };
  findings: PlotlyHeuristicFinding[];
}

export const ORDERING_METRIC_COLUMNS = [
  "row_coherence",
  "column_coherence",
  "blockiness",
  "row_fragmentation",
  "column_fragmentation",
  "color_discriminability",
] as const satisfies readonly (keyof OrderingEvaluation)[];

export interface ResourceRoleMatrixEvaluationResponse {
  evaluations: ResourceRoleMatrixEvaluations;
  metric_bounds: OrderingMetricBounds;
  plots: Record<PlotOrdering, PlotlyFigureJson>;
  heuristic_report: PlotlyHeuristicReport;
}
