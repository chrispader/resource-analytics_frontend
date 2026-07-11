export type PlotlyFigureJson = Record<string, unknown>;

export interface ResourceRoleAssignment {
  resource: string;
  role: string;
}

export interface OrderingMatrix {
  resources: string[];
  roles: string[];
  mapping: boolean[][];
  z: number[][];
  assignments: ResourceRoleAssignment[];
}

export interface ResourceRoleMatrixEvaluationMatrix extends OrderingMatrix {
  table: Array<Record<string, unknown>>;
  metrics: Record<string, unknown>;
}

export type FixedOrdering =
  | "current"
  | "alphabetical"
  | "degree_based"
  | "similarity_based";

export type FixedOrderingMatrices = Record<FixedOrdering, OrderingMatrix>;

export interface OrderingEvaluation {
  variant: string;
  seed: number | null;
  row_coherence: number;
  column_coherence: number;
  blockiness: number;
  row_fragmentation: number;
  column_fragmentation: number;
}

export interface ResourceRoleMatrixEvaluations {
  orderings: Record<FixedOrdering, OrderingEvaluation>;
  random_baselines: OrderingEvaluation[];
}

export interface ResourceRoleMatrixColorMetrics {
  min_delta_e: number;
  mean_delta_e: number;
  max_delta_e: number;
  min_contrast_ratio: number;
  empty_cell_contrast_ratio: number;
  empty_cell_delta_e: number;
}

export interface OrderingMetricsTableRow extends OrderingEvaluation {
  ordering_key: string;
  source: "ordering" | "baseline";
}

export const ORDERING_METRIC_COLUMNS = [
  "row_coherence",
  "column_coherence",
  "blockiness",
  "row_fragmentation",
  "column_fragmentation",
] as const satisfies readonly (keyof OrderingEvaluation)[];

export interface ResourceRoleMatrixEvaluationResponse {
  resource_count: number;
  role_count: number;
  filled_cells: number;
  density: number;
  color_metrics: ResourceRoleMatrixColorMetrics;
  plot: PlotlyFigureJson;
  matrix: ResourceRoleMatrixEvaluationMatrix;
  matrices: FixedOrderingMatrices;
  evaluations: ResourceRoleMatrixEvaluations;
}
