import { useMemo } from "react";
import styles from "../styles/components/AnalysisPanel.module.css";
import { AnalysisData } from "../models/AnalysisData";
import type { PlotlyFigureJson } from "../models/ResourceRoleMatrixEvaluation";
import OrderingMetricsTable from "./OrderingMetricsTable";

interface EvaluationSectionProps {
  title: string;
  description?: string;
  value: unknown;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function normalizePlot(
  plot: AnalysisData["plot"] | null
): PlotlyFigureJson | string | null {
  if (!plot) {
    return null;
  }

  if (typeof plot === "string") {
    try {
      return JSON.parse(plot) as PlotlyFigureJson;
    } catch {
      return plot;
    }
  }

  return plot;
}

function EvaluationSection({
  title,
  description,
  value,
}: EvaluationSectionProps) {
  const jsonText = useMemo(() => formatJson(value), [value]);

  return (
    <article className={styles.evaluationSection}>
      <h3 className={styles.evaluationSectionTitle}>{title}</h3>
      {description && (
        <p className={styles.evaluationSectionHint}>{description}</p>
      )}
      <pre className={styles.evaluationOutput}>{jsonText}</pre>
    </article>
  );
}

interface ResourceRoleMatrixEvaluationPanelProps {
  data: AnalysisData | null;
}

export default function ResourceRoleMatrixEvaluationPanel({
  data,
}: ResourceRoleMatrixEvaluationPanelProps) {
  const plot = useMemo(() => normalizePlot(data?.plot ?? null), [data?.plot]);
  const matrix = data?.matrix;
  const matrices = data?.matrices;
  const evaluations = data?.evaluations;
  const datasetMetrics =
    data?.resource_count !== undefined &&
    data.role_count !== undefined &&
    data.filled_cells !== undefined &&
    data.density !== undefined
      ? {
          resource_count: data.resource_count,
          role_count: data.role_count,
          filled_cells: data.filled_cells,
          density: data.density,
        }
      : null;

  const hasContent = Boolean(
    plot ||
      datasetMetrics ||
      data?.color_metrics ||
      matrix ||
      matrices ||
      evaluations
  );

  if (!hasContent) {
    return (
      <p className={styles.evaluationPlaceholder}>Loading evaluation data…</p>
    );
  }

  return (
    <>
      {datasetMetrics && (
        <EvaluationSection
          title="Dataset metrics"
          description="Values shared by every matrix ordering."
          value={datasetMetrics}
        />
      )}

      {data?.color_metrics && (
        <EvaluationSection
          title="Color metrics"
          description="Visual encoding values shared by every matrix ordering."
          value={data.color_metrics}
        />
      )}

      {evaluations && (
        <section className={styles.evaluationSection}>
          <h2 className={styles.evaluationGroupTitle}>Ordering metrics</h2>
          <p className={styles.evaluationSectionHint}>
            Click a column header to sort. Includes orderings and random
            baselines.
          </p>
          <OrderingMetricsTable evaluations={evaluations} />
        </section>
      )}

      {plot && (
        <EvaluationSection
          title="plot"
          description="Plotly figure JSON (data + layout)."
          value={plot}
        />
      )}

      {matrix && (
        <>
          <h2 className={styles.evaluationGroupTitle}>matrix</h2>

          <EvaluationSection
            title="matrix.roles"
            description="Column labels (same order as z)."
            value={matrix.roles}
          />

          <EvaluationSection
            title="matrix.resources"
            description="Row labels (same order as z)."
            value={matrix.resources}
          />

          <EvaluationSection
            title="matrix.mapping"
            description="Boolean assignment grid indexed by resource, then role."
            value={matrix.mapping}
          />

          <EvaluationSection
            title="matrix.z"
            description="Cell values (0 = no assignment, j + 1 = role at column j)."
            value={matrix.z}
          />

          <EvaluationSection
            title="matrix.assignments"
            description="Explicit resource–role pairs."
            value={matrix.assignments}
          />

          <EvaluationSection
            title="matrix.table"
            description="Summary table (same as /resource_role_matrix)."
            value={matrix.table}
          />

          <EvaluationSection
            title="matrix.metrics"
            description="Assignment counts."
            value={matrix.metrics}
          />
        </>
      )}

      {matrices && (
        <EvaluationSection
          title="matrices"
          description="Matrix data for each fixed ordering."
          value={matrices}
        />
      )}
    </>
  );
}
