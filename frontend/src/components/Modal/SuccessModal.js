// SuccessModal.js
import React,{ useEffect, useState } from "react";
import Modal from "react-modal";
import "./Modal.css";
import axios from "axios";
import { Link } from "react-router-dom";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adds a semi-transparent overlay
  },
};

Modal.setAppElement("#root"); // Define the root app element

const SuccessModal = ({
  isOpen,
  onRequestClose,
  onConfirm,
  onCancel,
  userName, userType, userId, refreshToken, THEME_OPT,
  modalMessage,
  modalBackgroundColor,
}) => {
  const closeButtonStyle = {
    position: "absolute",
    top: "-3px",
    right: "0px",
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#ff0000",
    maxWidth: "90%",
  };
  const [accessToken, setToken] = useState(null);
  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          const newAccessToken = response.data.access;
          setToken(newAccessToken);

          sessionStorage.setItem("access_token", newAccessToken);

          // console.log("Token refreshed successfully!", newAccessToken);

          if (newAccessToken) {
            sessionStorage.setItem("access_token", newAccessToken);
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Handle the error, possibly redirect to the login page
      }
    };

    // Call refreshAccessToken immediately
    refreshAccessToken();

    // Set up interval to call refreshAccessToken every 5 minutes (300,000 milliseconds)
    const intervalId = setInterval(refreshAccessToken, 300000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshToken]);

  const handleLogout = async () => {
    sessionStorage.removeItem("userType", userType);
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem("refresh_token", refreshToken);
    sessionStorage.removeItem("userName", userName);
    sessionStorage.removeItem("THEME_OPT", THEME_OPT);
    sessionStorage.removeItem("isApplication");
    // navigate("/Login");
    window.location.href = "/Login";
  };
  useEffect(() => {
    // Clear modal state or perform any other cleanup on component unmount
    return () => {
      // Cleanup code
    };
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Success Modal"
      userName={userName} userType={userType} userId={userId} refreshToken={refreshToken} 
    >
      <button onClick={onRequestClose} style={closeButtonStyle}>
        &#10006;
      </button>
      {/* <h2>Form Submitted sucessfully </h2>
      <p>{message}</p>
      <button onClick={onRequestClose}>Close</button> */}
      <div className='"d-flex justify-content-space-between my-auto mx-auto'>
        <h5 className="mb-4 TextOfMODAl">{modalMessage}</h5>
        {/* <button onClick={onRequestClose} style={{ border: 'none', background: 'none' }}>
          <span aria-hidden="true" role="img" aria-label="Close" style={{ fontSize: '24px' }}>
            &#10006;
          </span>
        </button> */}
      </div>
      
      <div className='"d-flex justify-content-center modalbutton'>
      {/* <h5 className="mb-4 TextOfMODAl">{modalMessage}</h5> */}
        <Link to="/Login">
          <button
            style={{ backgroundColor: modalBackgroundColor }}
            className="confirm-button ml-5"
            onClick={handleLogout}
          >
            OK
          </button>
        </Link>
      </div>
    </Modal>
  );
};

export default SuccessModal;
