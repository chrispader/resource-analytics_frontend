import type {
  OrderingMetricBounds,
  PlotlyFigureJson,
  ResourceRoleMatrixEvaluations,
  PlotOrdering,
} from "./ResourceRoleMatrixEvaluation";

export interface AnalysisData {
  image?: string;
  text?: string;
  table?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  plot?: string | PlotlyFigureJson;
  big_plot?: string;
  evaluations?: ResourceRoleMatrixEvaluations;
  metric_bounds?: OrderingMetricBounds;
  plots?: Record<PlotOrdering, PlotlyFigureJson>;
}
