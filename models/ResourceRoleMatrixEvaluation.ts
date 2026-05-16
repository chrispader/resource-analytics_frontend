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

export interface ResourceRoleMatrixEvaluationResponse {
  plot?: PlotlyFigureJson | string;
  matrix?: ResourceRoleMatrixEvaluationMatrix;
}
