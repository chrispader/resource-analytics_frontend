"use client";

import React, { useEffect, useState } from "react";
import { fetchAnalysisData } from "@/app/api/fetch/fetchDataAnalysis";
import TableComponent from "./TableComponent";
import { AnalysisData } from "../models/AnalysisData";
import ActivityDetail from "./ActivityDetail";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface AnalysisDropdownContentProps {
  panelId: string;
  selectedAnalysis: string;
  setIsLoading: (isLoading: boolean) => void;
  showFilterSelector: boolean;
  setShowFilterSelector: (show: boolean) => void;
  showColumnSelector: boolean;
  setShowColumnSelector: (show: boolean) => void;
  initialHeaders: string[];
  setInitialHeaders: (headers: string[]) => void;
  selectedHeaders: string[];
  setSelectedHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  data: AnalysisData | null;
  setData: (data: AnalysisData | null) => void;
  nodeSelectData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  setAnalysisPanelControl: (analysisPanelControl: boolean) => void;
}

const RESOURCE_ROLE_MATRIX_EVALUATION = "resource_role_matrix_evaluation";

const AnalysisDropdownContent = ({
  panelId,
  selectedAnalysis,
  setIsLoading,
  showFilterSelector,
  setShowFilterSelector,
  showColumnSelector,
  setShowColumnSelector,
  initialHeaders,
  setInitialHeaders,
  selectedHeaders,
  setSelectedHeaders,
  data,
  setData,
  nodeSelectData,
  setAnalysisPanelControl,
}: AnalysisDropdownContentProps) => {

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [parsedPlot, setParsedPlot] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [bigParsedPlot, setBigParsedPlot] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedRow, setSelectedRow] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectionSource, setSelectionSource] = useState<"plot" | "table" | null>(null);

  /**
   * Fetch analysis data whenever the selected analysis type or panel ID changes.
   * Resets the data if "No Analysis" or "analysis_detail" is selected.
   * Updates initial and selected headers based on the fetched data.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAnalysis || selectedAnalysis === "analysis_detail") {
        setData(null);
        return;
      }
      setIsLoading(true);

      try {
        const data = await fetchAnalysisData(selectedAnalysis, panelId);
        setData(data);
        if (data.table) {
          const headers = Object.keys(data.table[0] || {});
          setInitialHeaders(headers);
          setSelectedHeaders(headers);
        }
      } catch (error) {
        console.error("Error fetching analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedAnalysis, setIsLoading]);

  /**
   * Parse the plot and big_plot JSON data whenever the data changes from the last request.
   * Updates the parsedPlot and bigParsedPlot state variables.
   */
  useEffect(() => {
    if (data?.plot) {
      try {
        const parsed =
          typeof data.plot === "string" ? JSON.parse(data.plot) : data.plot;
        setParsedPlot(parsed);
      } catch (err) {
        console.error("Failed to parse plot JSON:", err);
        setParsedPlot(null);
      }
    } else {
      setParsedPlot(null);
    }
    if (data?.big_plot) {
      try {
        const parsed = JSON.parse(data.big_plot);
        setBigParsedPlot(parsed);
      } catch (err) {
        console.error("Failed to parse big plot JSON:", err);
        setBigParsedPlot(null);
      }
    } else {
      setBigParsedPlot(null);
    }
  }, [data]);

  /**
   * 
   * @param event Change event from the header checkbox.
   */
  const handleHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedHeaders((prevSelectedHeaders) => {
      const updatedHeaders = checked
        ? [...prevSelectedHeaders, value]
        : prevSelectedHeaders.filter((header) => header !== value);
      return [...new Set(updatedHeaders)];
    });
  };

  /**
   * 
   * @param event Change event from the "Select All" checkbox.
   * Selects or deselects all columns in the table.
   */
  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    if (selectedHeaders.length === initialHeaders.length) {
      return;
    }
    setSelectedHeaders(checked ? initialHeaders : []);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  /**
   * Filter the table data based on the search query.
   * set all values to lowercase and check if any value includes the search query
   */
  const filteredTableData = data?.table
    ? data.table.filter((row) =>
        initialHeaders.some((key) =>
          row[key].toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  /**
   * Handle click events on the plot.
   * @param event Click event from the plot.
   * Highlights the corresponding row in the table based on the clicked data point.
   * Matches the y-value of the clicked point with the selected headers in the table.
   * If a match is found, updates the selectedRow and sets the selectionSource to "plot".
   */
  const handlePlotClick = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!data?.table || !parsedPlot) return;

    const point = event.points[0];
    if (!point) return;

    const yKey = initialHeaders.find((header) => selectedHeaders.includes(header));
    if (!yKey) return;

    const clickedYValue = point.y;
    const matchedRow = filteredTableData.find((row) => row[yKey] === clickedYValue);

    if (matchedRow) {
      setSelectedRow(matchedRow);
      setSelectionSource("plot");
    }
  };

  // Calculate total pages for pagination by ensuring at least 1 page
  const totalPages = filteredTableData ? Math.ceil(filteredTableData.length / rowsPerPage) : 1;

  if (selectedAnalysis === RESOURCE_ROLE_MATRIX_EVALUATION) {
    return null;
  }

  return (
    <>
      {nodeSelectData ? (
        <ActivityDetail nodeSelectData={nodeSelectData} />
      ) : (
        <div>
          {data?.image && (
            <img
              src={`data:image/jpeg;base64,${data.image}`}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          )}
          {data?.text && <p>{data.text}</p>}
          {data?.table && (
            <TableComponent
              setAnalysisPanelControl={setAnalysisPanelControl}
              initialHeaders={initialHeaders}
              selectedHeaders={selectedHeaders}
              showColumnSelector={showColumnSelector}
              setShowColumnSelector={setShowColumnSelector}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleHeaderChange={handleHeaderChange}
              handleSelectAllChange={handleSelectAllChange}
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              currentTableData={filteredTableData} // pass the full filtered data
              showFilterSelector={showFilterSelector}
              selectedAnalysis={selectedAnalysis}
              setShowFilterSelector={setShowFilterSelector}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              selectionSource={selectionSource}
              setSelectionSource={setSelectionSource}
            />
          )}
          {data?.plot && parsedPlot && (
            <Plot
              data={parsedPlot.data.map((trace: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                if (selectedRow && trace.y && trace.y.length > 0) {
                  const yKey = initialHeaders.find((header) =>
                    selectedHeaders.includes(header)
                  );
                  const selectedYValue = yKey ? selectedRow[yKey] : null;
                  const highlightIndices = trace.y
                    .map((yVal: any, idx: number) => // eslint-disable-line @typescript-eslint/no-explicit-any
                      yVal === selectedYValue ? idx : -1
                    )
                    .filter((idx: number) => idx !== -1);

                  const colorArr = trace.y.map((_: any, idx: number) => // eslint-disable-line @typescript-eslint/no-explicit-any
                    highlightIndices.includes(idx)
                      ? "lightblue"
                      : trace.marker?.color || "blue"
                  );
                  const sizeArr = trace.y.map((_: any, idx: number) => // eslint-disable-line @typescript-eslint/no-explicit-any
                    highlightIndices.includes(idx)
                      ? 16
                      : trace.marker?.size || 8
                  );

                  return {
                    ...trace,
                    marker: {
                      ...trace.marker,
                      color: colorArr,
                      size: sizeArr,
                    },
                  };
                }
                return trace;
              })}
              layout={parsedPlot.layout}
              config={parsedPlot.config || {}}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler={true}
              onClick={handlePlotClick}
            />
          )}
          {data?.big_plot && bigParsedPlot && (
            <>
              <Plot
                data={bigParsedPlot.data}
                layout={bigParsedPlot.layout}
                config={bigParsedPlot.config || {}}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AnalysisDropdownContent;
