// Loader.js

import React, { useState, useEffect } from "react";
import "./Loader.css";

const Loader = ({ loading, progress, onCancel, onOKButtonClick }) => {
  const [okButtonEnabled, setOkButtonEnabled] = useState(false);

  useEffect(() => {
    let timer;
    if (progress === 100) {
      // Disable OK button initially and set timer to enable after 5 seconds
      setOkButtonEnabled(false);
      timer = setTimeout(() => {
        setOkButtonEnabled(true);
      }, 5000);
    }
    // Clear timer if component unmounts or progress changes
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    loading && (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="loader-header">
            <div className="d-flex justify-content-center align-items-center"
            // style={{ display: "flex" }}
            >
              <img src="MARS_LOGO.png" alt="Logo" className="Loaderlogo" />
              <span className="LoaderHeadingBox">
                <span className="LoaderGeopicsHeading">MARS</span>
              </span>
            </div>
            <div className="Loadernewclosebox">
              <span className="Loadernewclose" onClick={onCancel}>
                &#9932;
              </span>
            </div>
          </div>
          <div className="loader-body">
            <div className="LoaderBodyBox">
             
              <div>
                {progress === 100 ? (
                  <div className="success-animation">
                    <svg
                      className="checkmark"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 52 52"
                    >
                      <circle
                        className="checkmark__circle"
                        cx="26"
                        cy="26"
                        r="25"
                        fill="none"
                      />
                      <path
                        className="checkmark__check"
                        fill="none"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="loaderEfficet"></div>
                )}
              </div>
              <div>
                <p className="ExtractData" style={{ color: "#6c757d" }}>Extract The Data</p>
              </div>
            </div>
            <div className="loader-progress">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="loader-buttons px-5">
              {progress === 100 ? (
                <button
                  className="ok-btn"
                  onClick={onOKButtonClick}
                  disabled={!okButtonEnabled} // Disable button if not enabled yet
                >
                  OK
                </button>
              ) : (
                <button className="cancel-btn" onClick={onCancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Loader;
