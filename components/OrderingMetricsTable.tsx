"use client";

import { useMemo, useState } from "react";
import styles from "../styles/components/AnalysisPanel.module.css";
import {
  ORDERING_METRIC_COLUMNS,
  OrderingMetricBounds,
  OrderingMetricsTableRow,
  ResourceRoleMatrixEvaluations,
} from "../models/ResourceRoleMatrixEvaluation";
import { buildOrderingRows } from "../lib/resourceRoleMatrixEvaluationCsv";

type SortDirection = "asc" | "desc";

type SortableColumn = keyof OrderingMetricsTableRow;

const LABEL_COLUMNS: SortableColumn[] = ["ordering_key"];

function formatColumnLabel(column: string): string {
  return column
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return String(value);
    }
    return value.toFixed(3);
  }

  return String(value);
}

function compareRowValues(
  left: unknown,
  right: unknown,
  direction: SortDirection
): number {
  const factor = direction === "asc" ? 1 : -1;

  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * factor;
  }

  const leftText = String(left ?? "");
  const rightText = String(right ?? "");
  return (
    leftText.localeCompare(rightText, undefined, { numeric: true }) * factor
  );
}

interface OrderingMetricsTableProps {
  evaluations: ResourceRoleMatrixEvaluations;
  metricBounds: OrderingMetricBounds;
}

export default function OrderingMetricsTable({
  evaluations,
  metricBounds,
}: OrderingMetricsTableProps) {
  const rows = useMemo(() => buildOrderingRows(evaluations), [evaluations]);

  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedRows = useMemo(() => {
    if (!sortColumn) {
      return rows;
    }

    return [...rows].sort((left, right) =>
      compareRowValues(left[sortColumn], right[sortColumn], sortDirection)
    );
  }, [rows, sortColumn, sortDirection]);

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  const renderSortIndicator = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <span className={styles.metricsSortIdle}>↕</span>;
    }

    return (
      <span className={styles.metricsSortActive}>
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (rows.length === 0) {
    return (
      <p className={styles.evaluationPlaceholder}>
        No ordering metrics available.
      </p>
    );
  }

  const allColumns: readonly SortableColumn[] = [
    ...LABEL_COLUMNS,
    ...ORDERING_METRIC_COLUMNS,
  ];

  const metricCellStyle = (
    column: SortableColumn,
    value: unknown
  ): React.CSSProperties | undefined => {
    if (typeof value !== "number" || column === "ordering_key") {
      return undefined;
    }

    const bound = metricBounds[column as keyof OrderingMetricBounds];
    if (!bound) {
      return undefined;
    }

    const span = bound.upper - bound.lower;
    const normalized = span === 0 ? 1 : (value - bound.lower) / span;
    const clamped = Math.min(1, Math.max(0, normalized));
    const quality = bound.higher_is_better ? clamped : 1 - clamped;

    return {
      backgroundColor: `hsl(142 ${Math.round(58 * quality)}% ${Math.round(
        100 - 28 * quality
      )}%)`,
    };
  };

  return (
    <div
      className={styles.metricsTableWrapper}
      role="region"
      aria-label="Ordering metrics table"
      tabIndex={0}
    >
      <table className={styles.metricsTable}>
        <thead>
          <tr>
            {allColumns.map((column) => (
              <th key={column} scope="col">
                <button
                  type="button"
                  className={styles.metricsSortButton}
                  onClick={() => handleSort(column)}
                >
                  <span>
                    {formatColumnLabel(column)}
                    {column !== "ordering_key" && (
                      <small className={styles.metricsRange}>
                        {formatCellValue(
                          metricBounds[column as keyof OrderingMetricBounds]
                            .lower
                        )}
                        {" – "}
                        {formatCellValue(
                          metricBounds[column as keyof OrderingMetricBounds]
                            .upper
                        )}
                      </small>
                    )}
                  </span>
                  {renderSortIndicator(column)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={`${row.source}-${row.ordering_key}`}>
              {allColumns.map((column) => (
                <td
                  key={column}
                  style={metricCellStyle(column, row[column])}
                >
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
