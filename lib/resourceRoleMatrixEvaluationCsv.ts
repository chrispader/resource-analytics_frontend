import type {
  OrderingMetricsTableRow,
  ResourceRoleMatrixEvaluations,
} from "../models/ResourceRoleMatrixEvaluation";

const CSV_COLUMNS = [
  "event_log",
  "ordering",
  "source",
  "seed",
  "row_coherence",
  "column_coherence",
  "degree_order_agreement",
  "row_fragmentation",
  "column_fragmentation",
  "color_discriminability",
] as const;

export function buildOrderingRows(
  evaluations: ResourceRoleMatrixEvaluations
): OrderingMetricsTableRow[] {
  const rows: OrderingMetricsTableRow[] = [];

  for (const [orderingKey, metrics] of Object.entries(
    evaluations.orderings ?? {}
  )) {
    rows.push({
      ...metrics,
      ordering_key: orderingKey,
      source: "ordering",
    });
  }

  evaluations.random_baselines?.forEach((metrics, index) => {
    rows.push({
      ...metrics,
      ordering_key: metrics.variant || `baseline_${index}`,
      source: "baseline",
    });
  });

  return rows;
}

function escapeCsvValue(value: string | number | null): string {
  if (value === null) {
    return "";
  }

  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createEvaluationCsv(
  eventLogFileName: string,
  evaluations: ResourceRoleMatrixEvaluations
): string {
  const lines = [CSV_COLUMNS.join(",")];

  for (const row of buildOrderingRows(evaluations)) {
    lines.push(
      [
        eventLogFileName,
        row.ordering_key,
        row.source,
        row.seed,
        row.row_coherence,
        row.column_coherence,
        row.degree_order_agreement,
        row.row_fragmentation,
        row.column_fragmentation,
        evaluations.color_discriminability.score,
      ]
        .map(escapeCsvValue)
        .join(",")
    );
  }

  return lines.join("\r\n");
}

export function evaluationCsvFileName(eventLogFileName: string): string {
  const baseName = eventLogFileName.replace(/\.[^./\\]+$/, "").trim();
  const safeBaseName = baseName
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeBaseName || "event-log"}-resource-role-matrix-evaluation.csv`;
}
