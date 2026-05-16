export interface PlotlyFigureJson {
  data: unknown[];
  layout: Record<string, unknown>;
}

export interface ResourceRoleAssignment {
  resource: string;
  role: string;
}

export interface ResourceRoleMatrixMetrics {
  total_assignments: number;
  resources_per_role: Record<string, number>;
  roles_per_resource: Record<string, number>;
}

export interface ResourceRoleMatrixEvaluationMatrix {
  roles: string[];
  resources: string[];
  z: number[][];
  assignments: ResourceRoleAssignment[];
  table: Record<string, string | number>[];
  metrics: ResourceRoleMatrixMetrics;
}

export interface OrderingMetrics {
  variant: string;
  resource_count: number;
  role_count: number;
  filled_cells: number;
  density: number;
  row_coherence: number;
  column_coherence: number;
  row_fragmentation: number;
  column_fragmentation: number;
  min_delta_e: number;
  mean_delta_e: number;
  max_delta_e: number;
  min_contrast_ratio: number;
  empty_cell_contrast_ratio: number;
  empty_cell_delta_e: number;
}

export interface ResourceRoleMatrixEvaluations {
  orderings: Record<string, OrderingMetrics>;
  random_baselines: OrderingMetrics[];
}

export interface OrderingMetricsTableRow extends OrderingMetrics {
  ordering_key: string;
  source: "ordering" | "baseline";
}

export const ORDERING_METRIC_COLUMNS: (keyof OrderingMetrics)[] = [
  "resource_count",
  "role_count",
  "filled_cells",
  "density",
  "row_coherence",
  "column_coherence",
  "row_fragmentation",
  "column_fragmentation",
  "min_delta_e",
  "mean_delta_e",
  "max_delta_e",
  "min_contrast_ratio",
  "empty_cell_contrast_ratio",
  "empty_cell_delta_e",
];

export interface ResourceRoleMatrixEvaluationResponse {
  plot?: PlotlyFigureJson | string;
  matrix?: ResourceRoleMatrixEvaluationMatrix;
  evaluations?: ResourceRoleMatrixEvaluations;
}
