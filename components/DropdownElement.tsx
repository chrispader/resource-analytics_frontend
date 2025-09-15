import React, { useState } from "react";
import styles from "@/styles/components/DropdownElement.module.css";

const DropdownElement = ({
  label,
  options,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  onChange: (value: string[]) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  /**
   * Handle changes to the checkbox inputs.
   * @param value The value of the checkbox.
   * @param isChecked Whether the checkbox is checked or not.
   */
  const handleCheckboxChange = (value: string, isChecked: boolean) => {
    const newSelected = isChecked
      ? [...new Set([...selected, value])]
      : selected.filter((v) => v !== value);

    setSelected(newSelected);
    onChange(newSelected);
  };

  /**
   * triggered by the first dropdown option which resets all selections
   */
  const handleReset = () => {
    setSelected([]);
    onChange([]);
  };

  /**
   * Handle changes to the search input that filters the dropdown options.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  /**
   * triggered by the clear button in the search input to reset the search term
   */
  const clearSearch = () => {
    setSearchTerm("");
  };

  /**
   * Filter the dropdown options based on the search term.
   * All values are converted to lowercase for easier and more robust filtering
   */
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dropdown">
      <button
        className="btn btn-primary dropdown-toggle"
        type="button"
        id="multiSelectDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </button>
      <ul className="dropdown-menu" aria-labelledby="multiSelectDropdown">
        <li className="position-relative px-2">
          <input
            type="text"
            className={`form-control ${styles.searchInput}`}
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              backgroundColor: "lightgrey",
              outline: "none",
              boxShadow: "none",
              border: "1px solid #ced4da",
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearSearchButton}
              onClick={clearSearch}
            >
              &times;
            </button>
          )}
        </li>
        {selected.length > 0 && (
          <li>
            <button
              className="dropdown-item text-danger"
              type="button"
              onClick={handleReset}
            >
              Reset Selections
            </button>
          </li>
        )}
        {filteredOptions.map((option) => (
          <li key={option.value}>
            <label className="dropdown-item">
              <input
                type="checkbox"
                className="form-check-input me-2"
                value={option.value}
                checked={selected.includes(option.value)}
                onChange={
                  (e) => { handleCheckboxChange(option.value, e.target.checked); }
                }
              />
              {option.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownElement;
