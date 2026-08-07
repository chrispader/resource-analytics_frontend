"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import styles from "../styles/components/AnalysisPanel.module.css";
import { AnalysisData } from "../models/AnalysisData";
import type {
  PlotOrdering,
  PlotlyFigureJson,
} from "../models/ResourceRoleMatrixEvaluation";
import { RESOURCE_ROLE_ORDERING_OPTIONS } from "../models/ResourceRoleMatrixEvaluation";
import OrderingMetricsTable from "./OrderingMetricsTable";
import PlotlyHeuristicFindings from "./PlotlyHeuristicFindings";
import {
  createEvaluationCsv,
  evaluationCsvFileName,
} from "../lib/resourceRoleMatrixEvaluationCsv";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface MatrixComparisonProps {
  label: string;
  ordering: PlotOrdering;
  onOrderingChange: (ordering: PlotOrdering) => void;
  plots: Record<PlotOrdering, PlotlyFigureJson>;
}

function MatrixComparison({
  label,
  ordering,
  onOrderingChange,
  plots,
}: MatrixComparisonProps) {
  const plot = plots[ordering];
  const layout = useMemo(
    () => ({
      ...(plot.layout ?? {}),
      autosize: true,
      width: undefined,
      height: undefined,
    }),
    [plot]
  );

  return (
    <article className={styles.matrixComparisonCard}>
      <label className={styles.matrixOrderingLabel}>
        {label}
        <select
          className={styles.matrixOrderingSelect}
          value={ordering}
          onChange={(event) =>
            onOrderingChange(event.target.value as PlotOrdering)
          }
        >
          {RESOURCE_ROLE_ORDERING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.matrixPlot}>
        <Plot
          key={ordering}
          data={plot.data}
          layout={layout}
          config={{ ...(plot.config ?? {}), responsive: true }}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler
        />
      </div>
    </article>
  );
}

interface ResourceRoleMatrixEvaluationPanelProps {
  data: AnalysisData | null;
  eventLogFileName: string;
}

export default function ResourceRoleMatrixEvaluationPanel({
  data,
  eventLogFileName,
}: ResourceRoleMatrixEvaluationPanelProps) {
  const [leftOrdering, setLeftOrdering] =
    useState<PlotOrdering>("row_degree");
  const [rightOrdering, setRightOrdering] =
    useState<PlotOrdering>("similarity_based");

  if (
    !data?.evaluations ||
    !data.metric_bounds ||
    !data.plots ||
    !data.heuristic_report
  ) {
    return (
      <p className={styles.evaluationPlaceholder}>Loading evaluation data…</p>
    );
  }

  const handleExport = () => {
    const csv = createEvaluationCsv(eventLogFileName, data.evaluations!);
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = evaluationCsvFileName(eventLogFileName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  return (
    <>
      <section className={styles.evaluationSection}>
        <div className={styles.evaluationSectionHeader}>
          <h2 className={styles.evaluationGroupTitle}>Ordering metrics</h2>
          <button
            type="button"
            className={styles.evaluationExportButton}
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>
        <p className={styles.evaluationSectionHint}>
          More saturated cells indicate better quality. For fragmentation,
          lower values are better. Click a column header to sort.
        </p>
        <p className={styles.colorDiscriminabilityScore}>
          <strong>Color discriminability:</strong>{" "}
          {data.evaluations.color_discriminability.score.toFixed(3)} / 1
          <span> (higher is better; independent of ordering)</span>
        </p>
        <OrderingMetricsTable
          evaluations={data.evaluations}
          metricBounds={data.metric_bounds}
        />
      </section>

      <PlotlyHeuristicFindings report={data.heuristic_report} />

      <section className={styles.matrixComparisonSection}>
        <h2 className={styles.evaluationGroupTitle}>Matrix comparison</h2>
        <div className={styles.matrixComparisonGrid}>
          <MatrixComparison
            label="Left ordering"
            ordering={leftOrdering}
            onOrderingChange={setLeftOrdering}
            plots={data.plots}
          />
          <MatrixComparison
            label="Right ordering"
            ordering={rightOrdering}
            onOrderingChange={setRightOrdering}
            plots={data.plots}
          />
        </div>
      </section>
    </>
  );
}
