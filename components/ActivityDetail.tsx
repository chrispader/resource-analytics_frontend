import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DataTable from "./DataTable";
import { AnalysisData } from "@/models/AnalysisData";

interface ActivityDetailProps {
  nodeSelectData: AnalysisData;
}

const ActivityDetail = ({ nodeSelectData }: ActivityDetailProps) => {
  const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
  const [parsedPlot, setParsedPlot] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Parse the plot JSON data when nodeSelectData changes.
   */
  useEffect(() => {
    if (nodeSelectData?.plot) {
      try {
        const parsed =
          typeof nodeSelectData.plot === "string"
            ? JSON.parse(nodeSelectData.plot)
            : nodeSelectData.plot;
        setParsedPlot(parsed);
      } catch (err) {
        console.error("Failed to parse plot JSON:", err);
        setParsedPlot(null);
      }
    } else {
      setParsedPlot(null);
    }
  }, [nodeSelectData]);

  return (
    <div>
      {nodeSelectData?.table && (
        <DataTable
          data={nodeSelectData.table
            .map((row: Record<string, string | number>) =>
              Object.keys(row).map((key) => ({
                column: key,
                value: row[key],
              }))
            )
            .flat()}
          useHeader={false}
        />
      )}

      {parsedPlot ? (
        <Plot
          data={parsedPlot.data}
          layout={parsedPlot.layout}
          config={parsedPlot.config || {}}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      ) : nodeSelectData?.plot ? (
        <p style={{ color: "red" }}>Plot data is invalid or could not be parsed.</p>
      ) : null}
    </div>
  );
};

export default ActivityDetail;
