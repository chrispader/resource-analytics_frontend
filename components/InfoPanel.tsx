'use client';

import React, { useEffect, useState } from "react";
import styles from "../styles/components/InfoPanel.module.css";

interface InfoPanelProps {
  selectedAnalysis: string;
}

const InfoPanel = ({ selectedAnalysis }: InfoPanelProps) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const [infoContent, setInfoContent] = useState("");
  const [analysisLabel, setAnalysisLabel] = useState("");
  const [options, setOptions] = useState<AnalysisType[]>([]);

  /**
   * Fetch analysis options and their info content from the backend when the component mounts.
   * The fetched data is expected to be an array of objects with 'value', 'label', and 'info' properties.
   */
  useEffect(() => {
    fetch("http://localhost:9090/infoPanel")
      .then((response) => response.json())
      .then((data) => setOptions(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  /**
   * Update the info content and analysis label whenever the selected analysis changes.
   */
  useEffect(() => {
    const selectedOption = options.find(
      (option) => option.value === selectedAnalysis
    );
    setInfoContent(selectedOption?.info || "");
    setAnalysisLabel(selectedOption?.label || "");
  }, [selectedAnalysis]);

  return (
    <>
      <div className="modal fade" id="infoModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title d-flex">
                <i className="bi bi-info-circle-fill me-2"></i>
                <h5 className="mb-0">{analysisLabel}</h5>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className={`modal-body ${styles.textBody}`}>{infoContent}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoPanel;
