"use client";

import { useState } from "react";
import styles from "../styles/components/FileUpload.module.css";

interface FileUploadProps {
  onUpload: (file: File) => void;
}
export default function FileUpload({ onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  /**
   * trigger the file upload process when the upload button is clicked
   */
  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div id="uploadEventLogButton" className={`${styles.rounded} ${styles.fileUpload}`}>
      <p>Upload an event log</p>
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center">
          <input
            type="file"
            id="fileInput"
            className="d-none"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="fileInput" className="btn btn-primary">
            Choose File
          </label>
          <span className="ms-2">{file ? file.name : "No file chosen"}</span>
        </div>
        <button
          id="fetchButton"
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
