import styles from "../styles/components/AnalysisPanel.module.css";
import type {
  HeuristicFindingStatus,
  PlotlyHeuristicFinding,
  PlotlyHeuristicReport,
} from "../models/ResourceRoleMatrixEvaluation";

const STATUS_ORDER: readonly HeuristicFindingStatus[] = [
  "warning",
  "advice",
  "pass",
];

const STATUS_LABELS: Record<HeuristicFindingStatus, string> = {
  warning: "Warnings",
  advice: "Review advice",
  pass: "Passed checks",
};

function Finding({ finding }: { finding: PlotlyHeuristicFinding }) {
  return (
    <li className={styles.heuristicFinding} data-status={finding.status}>
      <div className={styles.heuristicFindingHeader}>
        <span className={styles.heuristicStatus}>{finding.status}</span>
        <span className={styles.heuristicAssistance}>
          {finding.assistance === "automatic-check"
            ? "Automatic check"
            : "Human review"}
        </span>
      </div>
      <p className={styles.heuristicRule}>{finding.heuristic}</p>
      <p className={styles.heuristicMessage}>{finding.message}</p>
      {finding.recommendation ? (
        <p className={styles.heuristicRecommendation}>
          <strong>Recommendation:</strong> {finding.recommendation}
        </p>
      ) : null}
      <a
        className={styles.heuristicSource}
        href={finding.source}
        target="_blank"
        rel="noreferrer"
      >
        Published source
      </a>
    </li>
  );
}

export default function PlotlyHeuristicFindings({
  report,
}: {
  report: PlotlyHeuristicReport;
}) {
  return (
    <section className={styles.evaluationSection}>
      <h2 className={styles.evaluationGroupTitle}>Plotly heuristic review</h2>
      <p className={styles.evaluationSectionHint}>
        Published rules are matched against the current Plotly JSON figure.
        Warnings are automatic checks; advice identifies questions that still
        require human judgment. No aggregate score is calculated.
      </p>
      <div className={styles.heuristicSummary} aria-label="Heuristic review summary">
        {STATUS_ORDER.map((status) => (
          <span key={status} className={styles.heuristicSummaryItem} data-status={status}>
            <strong>{report.summary[status]}</strong> {STATUS_LABELS[status]}
          </span>
        ))}
      </div>
      {STATUS_ORDER.map((status) => {
        const findings = report.findings.filter(
          (finding) => finding.status === status
        );
        if (findings.length === 0) {
          return null;
        }
        return (
          <details
            key={status}
            className={styles.heuristicGroup}
            open={status !== "pass"}
          >
            <summary>
              {STATUS_LABELS[status]} ({findings.length})
            </summary>
            <ul className={styles.heuristicList}>
              {findings.map((finding) => (
                <Finding key={finding.rule_id} finding={finding} />
              ))}
            </ul>
          </details>
        );
      })}
    </section>
  );
}
