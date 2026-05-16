"use client";

import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import styles from "../styles/components/pages.module.css";
import Head from "next/head";
import AnalysisPanel from "../components/AnalysisPanel";
import { v4 as uuidv4 } from "uuid";
import ReactFlowChart from "@/components/ReactFlowChart";
import { Edge, Node, ReactFlowProvider } from "reactflow";
import dynamic from "next/dynamic";

const OnboardingTutorial = dynamic(
  () => import("@/components/OnboardingTutorial"),
  { ssr: false }
);

export default function Home() {
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [metaData, setMetaData] = useState<MetaEventData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    metrics: [] as { label: string; value: string }[],
    resources: [] as { label: string; value: string }[],
    roles: [] as { label: string; value: string }[],
    activities: [] as { label: string; value: string }[],
  });
  const [showProcessOverview, setShowProcessOverview] = useState(true);
  const [analysisInstances, setAnalysisInstances] = useState<string[]>([
    uuidv4(),
  ]);
  const [nodeSelectData, setNodeSelectData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [initialPanelId, setInitialPanelId] = useState<string | null>(null);
  const [showUploadMenue, setShowUploadMenue] = useState(true);

  const [runOnboardingTutorial, setRunOnboardingTutorial] = useState(false);
  const [eventlogUploaded, setEventlogUploaded] = useState(false);
  const [analysisSelected, setAnalysisSelected] = useState(false);
  const [analysisPanelControl, setAnalysisPanelControl] = useState(true);
  const [firstSelectedAnalysis, setFirstSelectedAnalysis] =
    useState<string>("");

  const [colorMappings, setColorMappings] = useState<
    Record<string, Record<string, string>>
  >({});
  const [activityUtilization, setActivityUtilization] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    /**
     * Fetch color scheme for the DFG nodes based on the initial panel ID.
     * These effects run when the event log is uploaded.
     */
    const fetchColorScheme = async () => {
      if (eventlogUploaded) {
        const response = await fetch(
          `http://localhost:9090/dfg_color_scheme?panel_id=${initialPanelId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setColorMappings(data.colors);
        }
      }
    };

    /**
     * Fetch activity utilization data based on the initial panel ID.
     * These effects run when the event log is uploaded.
     */
    const fetchActivityUtilization = async () => {
      if (eventlogUploaded) {
        const response = await fetch(
          `http://localhost:9090/dfg_node_utilization?panel_id=${initialPanelId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setActivityUtilization(data.utilization);
        }
      }
    };

    fetchColorScheme();
    fetchActivityUtilization();
  }, [eventlogUploaded]);


  /**
   * Add a new analysis panel when the user clicks the "Add Analysis Panel" button.
   * A new unique panel ID is generated, and a request is sent to the backend to create the panel.
   * The new panel ID is added to the list of analysis instances.
   */
  const addAnalysisInstance = () => {
    const panelId = uuidv4();
    fetch(`http://localhost:9090/add_panel?panel_id=${panelId}`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add panel");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setAnalysisInstances([...analysisInstances, panelId]);
  };

  /**
   * 
   * @param index Index of the analysis panel to be removed.
   * Index matches the last added panelId
   * Remove an analysis panel when the user clicks the "Remove Analysis Panel" button.
   */
  const removeAnalysisInstance = (index: number) => {
    setAnalysisInstances(analysisInstances.filter((_, i) => i !== index));
  };

  /**
   * Load the Plotly library for rendering charts.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const plotlyScript = document.createElement("script");
      plotlyScript.src = "https://cdn.plot.ly/plotly-2.27.0.min.js";
      plotlyScript.async = true;
      document.body.appendChild(plotlyScript);

      return () => {
        document.body.removeChild(plotlyScript);
      };
    }
  }, []);

  /**
   * 
   * @param file Uploaded event log file.
   * Handle the event log file upload.
   * Sends the file to the backend and updates the state with the received metadata and DFG.
   * Also updates dropdown options for filtering analyses based on the uploaded data.
   */
  const handleUpload = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `http://localhost:9090/upload?panel_id=${analysisInstances[0]}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();

      setEventlogUploaded(true);
      setMetaData(data.table);
      setDropdownOptions({
        metrics: [],
        resources: (data.resource || []).map((item: string) => ({
          label: item,
          value: item,
        })),
        roles: (data.role || []).map((item: string) => ({
          label: item,
          value: item,
        })),
        activities: (data.activity || []).map((item: string) => ({
          label: item,
          value: item,
        })),
      });

      if (data.dfg) {
        setFlowNodes(data.dfg.nodes);
        setFlowEdges(data.dfg.edges);
      }
      setShowUploadMenue(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setInitialPanelId(analysisInstances[0]);
      setIsLoading(false);
    }
  };

  /**
   * 
   * @param node Clicked node in the DFG.
   * Handle node selection in the DFG.
   * Sends the selected node information to the backend and updates the state with the received node details.
   */
  const handleNodeSelect = async (node: Node) => {
    const response = await fetch(
      "http://localhost:9090/node_selection_detail",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity: node.data.label,
          panel_id: analysisInstances[0],
        }),
      }
    );

    const data = await response.json();
    setNodeSelectData(data);
  };

  return (
    <>
      <Head>
        <title>Resource Load Analytics</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/tabulator-tables@5.5.4/dist/css/tabulator.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        />
      </Head>

      <OnboardingTutorial
        runOnboardingTutorial={runOnboardingTutorial}
        setRunOnboardingTutorial={setRunOnboardingTutorial}
        eventlogUploaded={eventlogUploaded}
        analysisSelected={analysisSelected}
        analysisPanelControl={analysisPanelControl}
      />

      <div className={styles.placeholder}>
        <div className={styles.layoutNavigation}>
          <div className={styles.alignLeft}>
            {metaData.length > 0 && !showUploadMenue && (
              <button
                type="button"
                onClick={() =>
                  setShowProcessOverview((isVisible) => !isVisible)
                }
                className={`btn btn-primary btn-sm ${styles.buttonElement} ${styles.processOverviewToggle} processOverviewButton`}
                aria-controls="processOverviewPanel"
                aria-expanded={showProcessOverview}
                title={
                  showProcessOverview
                    ? "Hide process overview"
                    : "Show process overview"
                }
              >
                <i
                  className={`bi ${
                    showProcessOverview
                      ? "bi-layout-sidebar-inset"
                      : "bi-layout-sidebar"
                  }`}
                  aria-hidden="true"
                ></i>
                <span>
                  {showProcessOverview
                    ? "Hide process overview"
                    : "Show process overview"}
                </span>
              </button>
            )}
            {showProcessOverview && !showUploadMenue && (
              <button
                onClick={() => {
                  setShowUploadMenue(true);
                  setEventlogUploaded(false);
                }}
                className="btn btn-primary btn-sm"
              >
                Upload New Event Log
              </button>
            )}
          </div>

          <div className={styles.alignRight}>
            <button
              onClick={addAnalysisInstance}
              className={`btn btn-success btn-sm ${styles.buttonElement} addAnalysisButton`}
            >
              Add Analysis Panel
            </button>
            {analysisInstances.length > 1 && (
              <button
                onClick={() =>
                  removeAnalysisInstance(analysisInstances.length - 1)
                }
                className={`btn btn-danger btn-sm`}
              >
                Remove Analysis Panel
              </button>
            )}
          </div>
        </div>

        <div className={styles.container}>
          <aside
            id="processOverviewPanel"
            className={`${styles.leftPanel} ${
              showProcessOverview ? "" : styles.leftPanelHidden
            }`}
            hidden={!showProcessOverview}
            aria-label="Process overview"
          >
            {metaData.length > 0 && !showUploadMenue ? (
              <DataTable data={metaData} />
            ) : (
              <FileUpload onUpload={handleUpload} />
            )}
            {flowNodes.length > 0 && initialPanelId && (
              <div id="interactiveGraph">
                <ReactFlowProvider>
                  <ReactFlowChart
                    panelId={initialPanelId}
                    initialNodes={flowNodes}
                    initialEdges={flowEdges}
                    onNodeSelect={handleNodeSelect}
                    selectedAnalysis={firstSelectedAnalysis}
                    colorMappings={colorMappings}
                    activityUtilization={activityUtilization}
                  />
                </ReactFlowProvider>
              </div>
            )}
          </aside>
          {metaData.length > 0 && (
            <div
              className={`${styles.rightPanel} ${
                showProcessOverview ? "" : styles.rightPanelExpanded
              }`}
              aria-label="Analysis panels"
              style={{
                flex: showProcessOverview ? "0 0 70%" : "1 1 0",
                maxWidth: showProcessOverview ? "70%" : "100%",
              }}
            >
              {analysisInstances.map((panelId, idx) => (
                <div
                  key={panelId}
                  className={styles.rightPanelElement}
                  style={
                    analysisInstances.length > 1
                      ? {
                          flex: "0 0 850px",
                          width: "850px",
                          maxWidth: "850px",
                          minWidth: 0,
                        }
                      : {
                          flex: "1 1 0",
                          maxWidth: "100%",
                          minWidth: 0,
                        }
                  }
                >
                  <AnalysisPanel
                    // Only the first panel is controlled
                    {...(idx === 0
                      ? {
                          selectedAnalysis: firstSelectedAnalysis,
                          setSelectedAnalysis: setFirstSelectedAnalysis,
                        }
                      : {})}
                    setAnalysisSelected={setAnalysisSelected}
                    setAnalysisPanelControl={setAnalysisPanelControl}
                    panelId={panelId}
                    initialDropdownOptions={dropdownOptions}
                    setIsLoading={setIsLoading}
                    nodeSelectData={
                      panelId === initialPanelId ? nodeSelectData : null
                    }
                    setNodeSelectData={setNodeSelectData}
                    initialPanelId={initialPanelId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setRunOnboardingTutorial(true)}
        className={`btn btn-primary btn-sm`}
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
      >
        <i className="bi bi-info-square"></i>
      </button>

      {isLoading && <Loader />}
    </>
  );
}
