import type {
  PlotlyFigureJson,
  ResourceRoleMatrixEvaluationMatrix,
} from "./ResourceRoleMatrixEvaluation";

export interface AnalysisData {
  image?: string;
  text?: string;
  table?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  plot?: string | PlotlyFigureJson;
  big_plot?: string;
  matrix?: ResourceRoleMatrixEvaluationMatrix;
}