"use client";

import styles from "../styles/components/AnalysisDropdown.module.css";
import React from "react";
import DropdownElement from "./DropdownElement";
import { useEffect, useState } from "react";
import { fetchAnalysisData } from "@/app/api/fetch/fetchDataAnalysis";
import { AnalysisData } from "../models/AnalysisData";

interface AnalysisDropdownProps {
  panelId: string;
  selectedAnalysis: string;
  setSelectedAnalysis: (analysis: string) => void;
  setInitialHeaders: (headers: string[]) => void;
  setSelectedHeaders: (headers: string[]) => void;
  setData: (data: AnalysisData | null) => void;
  dropdownOptions: {
    metrics: { label: string; value: string }[];
    resources: { label: string; value: string }[];
    roles: { label: string; value: string }[];
    activities: { label: string; value: string }[];
  };
  nodeSelectData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  setNodeSelectData?: (data: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  initialPanelId?: string | null;
  setAnalysisSelected: (analysisSelected: boolean) => void;
}

/**
 * Dropdown options for analysis selection.
 */
const options = [
  { value: "", label: "No Analysis" },
  { value: "", label: "Resource Allocation", disabled: true },
  { value: "units", label: "Unique Resources" },
  { value: "resource_roles", label: "Roles per Resource" },
  { value: "resources_per_activity", label: "Resources per Activity" },
  { value: "activities_per_role", label: "Activities per Role" },
  { value: "", label: "Case Duration", disabled: true },
  { value: "duration_per_role", label: "Duration per Role" },
  {
    value: "resource_within_role_norm",
    label: "Duration per Role and Resource",
  },
  { value: "duration_per_activity", label: "Duration per Activity" },
  {
    value: "activity_average_duration",
    label: "Duration per Activity and Role (Heatmap)",
  },
  {
    value: "activity_resource_comparison",
    label: "Duration per Activity and Resource",
  },
  {
    value: "activity_resource_comparison_norm",
    label: "Duration per Activity and Resource (Heatmap)",
  },
  {
    value: "normalized_activity_resource_duration_matrix",
    label: "Normalized Average Case Duration per Activity and Resource",
  },
  { value: "", label: "Workload Distribution", disabled: true },
  { value: "resource_role_time_distribution", label: "Role by Resource" },
  { value: "resource_time_distribution", label: "Activity by Resource" },
  { value: "role_time_distribution", label: "Activity by Role" },
  { value: "resource_role_matrix", label: "Resource-Role Matrix" },
  {
    value: "resource_role_matrix_evaluation",
    label: "Resource-Role Matrix Evaluation",
  },
  { value: "", label: "Capacity Utilization", disabled: true },
  {
    value: "capacity_utilization_resource",
    label: "Resource Capacity Utilization",
  },
  { value: "capacity_utilization_role", label: "Role Capacity Utilization" },
  {
    value: "capacity_utilization_activity",
    label: "Activity Capacity Utilization",
  },
  { value: "analysis_detail", label: "Analysis Details", disabled: true },
];

export default function AnalysisDropdown({
  panelId,
  selectedAnalysis,
  setSelectedAnalysis,
  setInitialHeaders,
  setSelectedHeaders,
  setData,
  dropdownOptions,
  nodeSelectData,
  setNodeSelectData,
  initialPanelId,
  setAnalysisSelected
}: AnalysisDropdownProps) {
  const [selectedValues, setSelectedValues] = useState<{
    metric: string[];
    resource: string[];
    role: string[];
    activity: string[];
  }>({
    metric: [],
    resource: [],
    role: [],
    activity: [],
  });

  const [isInitialRender, setIsInitialRender] = useState(true);

  /**
   * change Analysis Selection to "analysis_detail" when user clicks on a node in the DFG
   */
  useEffect(() => {
    if (nodeSelectData && panelId === initialPanelId) {
      setSelectedAnalysis("analysis_detail");
    }
  }, [nodeSelectData, setSelectedAnalysis]);

  /**
   * Reset nodeSelectData when changing analysis from "analysis_detail" to another analysis
   * to avoid displaying stale data in the detail panel.
   * Only reset if the panelId matches the initialPanelId to ensure it only affects the relevant panel.
   */
  useEffect(() => {
    if (selectedAnalysis !== "analysis_detail" && panelId === initialPanelId) {
      if (setNodeSelectData) {
        setNodeSelectData(null);
      }
    }
  }, [selectedAnalysis, setNodeSelectData]);

  /**
   * Fetch filtered analysis data whenever the selected filter values change considering the current state of the analysis filter.
   * Skips the initial render as not all information may be available at this application state.
   */
  useEffect(() => {
    const sendFilterData = async () => {
      try {
        const bodyData = JSON.stringify({
          panel_id: panelId,
          metric: selectedValues.metric || [],
          resource: selectedValues.resource || [],
          role: selectedValues.role || [],
          activity: selectedValues.activity || [],
        });
        const response = await fetch(`http://localhost:9090/filter_analysis`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: bodyData,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch filtered analysis data");
        }

        const filteredData = await response.json();
        console.log("Filtered Response:", filteredData);

        if (selectedAnalysis && selectedAnalysis !== "analysis_detail") {
          const analysisData = await fetchAnalysisData(selectedAnalysis, panelId);
          setData(analysisData);

          if (analysisData.table) {
            const headers = Object.keys(analysisData.table[0] || {});
            setInitialHeaders(headers);
            setSelectedHeaders(headers);
          }
        }
      } catch (error) {
        console.error("Error fetching filtered analysis data:", error);
      }
    };

    if (!isInitialRender) {
      // Only call sendFilterData if it's not the initial render
      sendFilterData();
    } else {
      setIsInitialRender(false);
    }
  }, [selectedValues]);

  return (
    <div className={styles.container}>
      <div id="analysisSelectionPanel" className={styles.analysisSelection}>
        <p>Select the analysis</p>
        <select
          id="analysisDropdown"
          className={styles.customSelect}
          value={selectedAnalysis}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setAnalysisSelected(e.target.value !== "");
            setSelectedAnalysis(e.target.value);
          }}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${styles.iconButton}`}
          data-bs-toggle="modal"
          data-bs-target="#infoModal"
          hidden={!selectedAnalysis}
        >
          <i className="bi bi-info-circle"></i>
        </button>
      </div>

      <div id="analysisFilterPanel" className={styles.analysisFilter}>
        <p>Analysis Filter</p>
        <div className={styles.dropdownElements}>
          <DropdownElement
            label="Metric"
            options={dropdownOptions.metrics}
            onChange={(value) => {
              setSelectedValues((prev) => ({
                ...prev,
                metric: value,
              }));
            }}
          />
          <DropdownElement
            label="Resource"
            options={dropdownOptions.resources}
            onChange={(value) => {
              setSelectedValues((prev) => ({
                ...prev,
                resource: value,
              }));
            }}
          />
          <DropdownElement
            label="Role"
            options={dropdownOptions.roles}
            onChange={(value) => {
              setSelectedValues((prev) => ({
                ...prev,
                role: value,
              }));
            }}
          />
          <DropdownElement
            label="Activity"
            options={dropdownOptions.activities}
            onChange={(value) => {
              setSelectedValues((prev) => ({
                ...prev,
                activity: value,
              }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
