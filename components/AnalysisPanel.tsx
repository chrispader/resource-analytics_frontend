import { useMemo, useState } from "react";
import AnalysisDropdown from "./AnalysisDropdown";
import InfoPanel from "./InfoPanel";
import AnalysisDropdownContent from "./AnalysisDropdownContent";
import panelStyles from "../styles/components/AnalysisPanel.module.css";
import styles from "../styles/components/Home.module.css";
import { AnalysisData } from "../models/AnalysisData";

const RESOURCE_ROLE_MATRIX_EVALUATION = "resource_role_matrix_evaluation";

function formatPlotlyJsonPayload(data: AnalysisData | null): string {
  if (!data) {
    return "";
  }

  if (data.plot) {
    try {
      const parsed =
        typeof data.plot === "string" ? JSON.parse(data.plot) : data.plot;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(data.plot);
    }
  }

  if (data.big_plot) {
    try {
      const parsed =
        typeof data.big_plot === "string"
          ? JSON.parse(data.big_plot)
          : data.big_plot;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(data.big_plot);
    }
  }

  return JSON.stringify(data, null, 2);
}

interface AnalysisPanelProps {
  panelId: string;
  initialDropdownOptions: {
    metrics: { label: string; value: string }[];
    resources: { label: string; value: string }[];
    roles: { label: string; value: string }[];
    activities: { label: string; value: string }[];
  };
  nodeSelectData?: AnalysisData;
  setNodeSelectData?: (data: AnalysisData) => void;
  initialPanelId?: string | null;
  setIsLoading: (isLoading: boolean) => void;
  setAnalysisSelected: (analysisSelected: boolean) => void;
  setAnalysisPanelControl: (analysisPanelControl: boolean) => void;
  selectedAnalysis?: string; // made optional
  setSelectedAnalysis?: (analysis: string) => void; // made optional
}

export default function AnalysisPanel({
  panelId,
  initialDropdownOptions,
  nodeSelectData,
  setNodeSelectData,
  initialPanelId,
  setIsLoading,
  setAnalysisSelected,
  setAnalysisPanelControl,
  selectedAnalysis,
  setSelectedAnalysis,
}: AnalysisPanelProps) {
  const [dropdownOptions] = useState(initialDropdownOptions);

  // Internal state for uncontrolled mode
  const [internalSelectedAnalysis, setInternalSelectedAnalysis] =
    useState<string>("");

  // Use controlled or uncontrolled state
  const analysisValue =
    selectedAnalysis !== undefined
      ? selectedAnalysis
      : internalSelectedAnalysis;
  const setAnalysisValue =
    setSelectedAnalysis !== undefined
      ? setSelectedAnalysis
      : setInternalSelectedAnalysis;

  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
  const [showFilterSelector, setShowFilterSelector] = useState<boolean>(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [initialHeaders, setInitialHeaders] = useState<string[]>([]);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);

  const isMatrixEvaluation =
    analysisValue === RESOURCE_ROLE_MATRIX_EVALUATION;
  const evaluationJsonText = useMemo(
    () => formatPlotlyJsonPayload(data),
    [data]
  );

  return (
    <div className={`${styles.rounded} ${styles.rightPanel}`}>
      <AnalysisDropdown
        setAnalysisSelected={setAnalysisSelected}
        panelId={panelId}
        selectedAnalysis={analysisValue}
        setSelectedAnalysis={setAnalysisValue}
        setData={setData}
        setInitialHeaders={setInitialHeaders}
        setSelectedHeaders={setSelectedHeaders}
        dropdownOptions={dropdownOptions}
        nodeSelectData={nodeSelectData}
        setNodeSelectData={setNodeSelectData}
        initialPanelId={initialPanelId}
      />
      <InfoPanel selectedAnalysis={analysisValue} />
      {isMatrixEvaluation && (
        <section
          id="resourceRoleMatrixEvaluationPanel"
          className={panelStyles.evaluationPanel}
          aria-label="Resource role matrix evaluation output"
        >
          <p className={panelStyles.evaluationTitle}>
            Plotly visualization JSON
          </p>
          <p className={panelStyles.evaluationHint}>
            Raw output from{" "}
            <code>/resource_role_matrix_evaluation</code> (equivalent to{" "}
            <code>json.loads(fig.to_json())</code>).
          </p>
          {evaluationJsonText ? (
            <pre className={panelStyles.evaluationOutput}>
              {evaluationJsonText}
            </pre>
          ) : (
            <p className={panelStyles.evaluationPlaceholder}>
              Loading evaluation data…
            </p>
          )}
        </section>
      )}
      <AnalysisDropdownContent
        panelId={panelId}
        selectedAnalysis={analysisValue}
        setIsLoading={setIsLoading}
        showFilterSelector={showFilterSelector}
        setShowFilterSelector={setShowFilterSelector}
        showColumnSelector={showColumnSelector}
        setShowColumnSelector={setShowColumnSelector}
        data={data}
        setData={setData}
        initialHeaders={initialHeaders}
        setInitialHeaders={setInitialHeaders}
        selectedHeaders={selectedHeaders}
        setSelectedHeaders={setSelectedHeaders}
        nodeSelectData={nodeSelectData}
        setAnalysisPanelControl={setAnalysisPanelControl}
      />
    </div>
  );
}
