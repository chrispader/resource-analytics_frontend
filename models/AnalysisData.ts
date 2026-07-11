import type {
  FixedOrderingMatrices,
  PlotlyFigureJson,
  ResourceRoleMatrixColorMetrics,
  ResourceRoleMatrixEvaluationMatrix,
  ResourceRoleMatrixEvaluations,
} from "./ResourceRoleMatrixEvaluation";

export interface AnalysisData {
  image?: string;
  text?: string;
  table?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  plot?: string | PlotlyFigureJson;
  big_plot?: string;
  resource_count?: number;
  role_count?: number;
  filled_cells?: number;
  density?: number;
  color_metrics?: ResourceRoleMatrixColorMetrics;
  matrix?: ResourceRoleMatrixEvaluationMatrix;
  matrices?: FixedOrderingMatrices;
  evaluations?: ResourceRoleMatrixEvaluations;
}
