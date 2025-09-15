import React, { useState } from "react";
import TableFilterElement from "./TableFilterElement";
import styles from "@/styles/components/TableFilter.module.css";

interface TableFilterProps {
  numericColumns: string[];
  onFiltersChange: (filters: {
    [key: string]: { selectedRadio: string; filterValue: number | string };
  }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handlePageChange: (newPage: number) => void;
  selectedAnalysis: string;
  showFilterSelector: boolean;
  setShowFilterSelector: (show: boolean) => void;
  setShowColumnSelector: (show: boolean) => void;
  setAnalysisPanelControl: (analysisPanelControl: boolean) => void;
}

const TableFilter = ({
  numericColumns,
  onFiltersChange,
  searchQuery,
  setSearchQuery,
  handlePageChange,
  selectedAnalysis,
  showFilterSelector,
  setShowFilterSelector,
  setShowColumnSelector,
  setAnalysisPanelControl,
}: TableFilterProps) => {

  /**
   * handles the change of page to fit search results
   */
  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
    handlePageChange(1);
  };

  const [filters, setFilters] = useState<{
    [key: string]: { selectedRadio: string; filterValue: number | string };
  }>({});

  /**
   * @param columnName name of the numeric column being filtered
   * @param selectedRadio the selected radio button value either >, < or =
   * @param filterValue the value to filter by
   * apply filters and notify parent component of changes
   */
  const handleFilterChange = (
    columnName: string,
    selectedRadio: string,
    filterValue: number | string
  ) => {
    const updatedFilters = {
      ...filters,
      [columnName]: { selectedRadio, filterValue },
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <div
      style={{
        borderTop: "1px solid darkgrey",
        padding: "10px",
        marginTop: "10px",
      }}
    >
      <div className={styles.filterHeader}>
        <div id="searchTableString" className={styles.searchBar}>
          <input
            type="text"
            id="searchQuery"
            className="form-control search-input"
            placeholder="Search Table..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        <button
          className="btn btn-primary"
          style={{ marginLeft: "15px", whiteSpace: "nowrap" }}
          hidden={!selectedAnalysis}
          onClick={() => {
            setShowFilterSelector(!showFilterSelector);
            setShowColumnSelector(false);
            setAnalysisPanelControl(true);
          }}
        >
          <span>Table Filter</span>
          {showFilterSelector ? (
            <i className="bi bi-chevron-up ms-2 fs-6"></i>
          ) : (
            <i className="bi bi-chevron-down ms-2 fs-6"></i>
          )}
        </button>
      </div>
      {numericColumns.map((column) => (
        <TableFilterElement
          key={column}
          columnName={column}
          selectedRadio={filters[column]?.selectedRadio || ""}
          filterValue={filters[column]?.filterValue || ""}
          onFilterChange={handleFilterChange}
        />
      ))}
    </div>
  );
};

export default TableFilter;
