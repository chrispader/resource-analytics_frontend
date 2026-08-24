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
    <div
      id="uploadEventLogButton"
      className={`${styles.rounded} ${styles.fileUpload}`}
    >
      <p>Upload an event log</p>
      <div className={styles.uploadActions}>
        <div className={styles.fileSelection}>
          <input
            type="file"
            id="fileInput"
            className="d-none"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="fileInput" className="btn btn-primary">
            Choose File
          </label>
          <span className={styles.fileName}>
            {file ? file.name : "No file chosen"}
          </span>
        </div>
        <button
          id="fetchButton"
          className={`btn btn-primary ${styles.uploadButton}`}
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
