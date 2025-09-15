import React from "react";
import styles from "./../styles/components/TableFilterElement.module.css";

interface TableFilterElementProps {
  columnName: string;
  selectedRadio: string;
  filterValue: number | string;
  onFilterChange: (
    columnName: string,
    selectedRadio: string,
    filterValue: number | string
  ) => void;
}

const TableFilterElement = ({
  columnName,
  selectedRadio,
  filterValue,
  onFilterChange,
}: TableFilterElementProps) => {
  /**
   * handle change for comparison (>, <, =) selection change
   */
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(columnName, event.target.value, filterValue);
  };

  /**
   * handle change for change in value to flter by
   */
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(columnName, selectedRadio, event.target.value);
  };

  return (
    <div className={styles.tableFilterElement}>
      <p>{columnName}</p>
      <div
        className="btn-group btn-group-sm ${styles.btnGroup}"
        role="group"
        aria-label="Basic radio toggle button group"
      >
        <input
          type="radio"
          className="btn-check"
          name={`btnradio-${columnName}`}
          id={`btnradio2-${columnName}`}
          value="<"
          autoComplete="off"
          checked={selectedRadio === "<"}
          onChange={handleRadioChange}
        />
        <label
          className="btn btn-outline-primary"
          htmlFor={`btnradio2-${columnName}`}
        >
          {"<"}
        </label>
        <input
          type="radio"
          className="btn-check"
          name={`btnradio-${columnName}`}
          id={`btnradio1-${columnName}`}
          value=">"
          autoComplete="off"
          checked={selectedRadio === ">"}
          onChange={handleRadioChange}
        />
        <label
          className="btn btn-outline-primary"
          htmlFor={`btnradio1-${columnName}`}
        >
          {">"}
        </label>
        <input
          type="radio"
          className="btn-check"
          name={`btnradio-${columnName}`}
          id={`btnradio3-${columnName}`}
          value="="
          autoComplete="off"
          checked={selectedRadio === "="}
          onChange={handleRadioChange}
        />
        <label
          className="btn btn-outline-primary"
          htmlFor={`btnradio3-${columnName}`}
        >
          {"="}
        </label>
      </div>
      <input
        type="number"
        name="filterValue"
        className={`form-control form-control-sm filter-input ${styles.filterValue}`}
        value={filterValue}
        onChange={handleValueChange}
      />
    <button
      type="button"
      className="btn btn-primary btn-sm clear-button"
      onClick={() => onFilterChange(columnName, "", "")}
    >
      Clear
    </button>
    </div>
  );
};

export default TableFilterElement;
