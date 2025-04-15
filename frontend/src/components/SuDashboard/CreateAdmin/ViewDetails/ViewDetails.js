import React, { useState, useEffect } from "react";
import "./ViewDetails.css";
import Modal from "react-modal";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { css } from "@emotion/react";
import Preloader from "../../../Preloader/Preloader";
import ModalManager from "../../../GeopicxPopupModals/ModalManager.js";
import { useSelector } from "react-redux";
import { City, Country, State } from "country-state-city";
import CentraliseButton from "../../../CentraliseButton/CentraliseButton.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import CentraliseheaderBody from "../../../Centraliseheaderbody/CentraliseheaderBody.js";
function ViewDetails({
  isOpen,
  closeModal,
  adminData,
  selectedTheme,
  selectedAdminType,
  replaceAdminId,
  fetchData,
  SU_APRO_REM
}) {


  const newAccessToken = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const [backgroundColor, setBackgroundColor] = useState("#36D7B7");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adminToken, setAdminToken] = useState(null);

  const LoaderUpdateProgress = async () => {
    setLoading(true);
    setProgress(0);
    const steps = 10; // Define the number of steps
    const stepDuration = 500; // Define the duration for each step (in milliseconds)

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const progressPercentage = (i / steps) * 100;
      setProgress(progressPercentage);
    }
  };


  const getCountryName = (isoCode) => {
    const country = Country.getAllCountries().find(
      (c) => c.isoCode === isoCode
    );
    return country ? country.name : "";
  };

  // Helper function to get the state name from ISO code
  const getStateName = (countryIsoCode, stateIsoCode) => {
    const states = State.getStatesOfCountry(countryIsoCode);
    const state = states.find((s) => s.isoCode === stateIsoCode);
    return state ? state.name : "";
  };

  const country = getCountryName(adminData.COUNTRY)
  const state = getStateName(adminData.COUNTRY, adminData.STATE)




  useEffect(() => {
    if (adminToken) {
      // Call your function here with the updated adminToken
      setAdminToken(adminToken);
    }
  }, [adminToken]);

  const handleReplaceAdmin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/admin_url/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
        },
        body: JSON.stringify({
          USERID: replaceAdminId,
          SU_APRO_STAT: "REPLACE",
          SU_APRO_REM: SU_APRO_REM
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newToken = responseData.token;
        setAdminToken(newToken);
        return newToken; // Return the new token
      } else {
        console.error(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error during delete:", error);
    }
    return null; // Return null if there's an error
  };



  const formattedAdmin = {
    MOBILE_NO: adminData.MOBILE_NO || "",
    USERNAME: adminData.USERNAME,
    EMAIL: adminData.EMAIL,
    USER_TYPE: adminData.USER_TYPE,
    Theme_Section: adminData.Theme_Section,
    ADMIN_TYPE: adminData.ADMIN_TYPE,
    logindata: {
      FIRST_NAME: adminData.FIRST_NAME,
      MIDDLE_NAME: adminData.MIDDLE_NAME,
      LAST_NAME: adminData.LAST_NAME,
      ORGANIZATION: adminData.ORGANIZATION,
      DESIGNATION: adminData.DESIGNATION,
      COUNTRY: country,
      STATE: state,
      CITY: adminData.CITY,
      ALT_EMAIL: adminData.EMAIL_ALT,
      LAN_LINE: adminData.PHONE_LAN,
      OFF_LOCA: adminData.LOCATION
    }
  };

  const handleSave = async () => {
    try {
      let newToken;
      let url = "http://127.0.0.1:8000/admin_url/";

      if (replaceAdminId) {
        newToken = await handleReplaceAdmin();
        if (!newToken) return; // Exit if there's an error
        url += `?token=${newToken}`;
      }

      LoaderUpdateProgress();

      const response = await axios.post(url, formattedAdmin, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        closeModal();
        ModalManager.success({
          modalHeaderHeading: 'Create Admin User',
          modalBodyHeading: "Success",
          message: "Admin created successfully. An email has been sent to the respective user's email address.",
          onConfirm: () => {
            if (selectedTheme !== null) {
              fetchData()
              navigate("/CreateAdmin");
              window.location.reload();
            } else {
              window.location.reload();
            }
          },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      const { data } = error.response;
      let errorMessage = '';

      const usernameErrors = data.errors.USERNAME;
      const emailErrors = data.errors.EMAIL;

      const usernameError = usernameErrors?.[0];
      const emailError = emailErrors?.[0];

      const usernameUniqError = usernameErrors?.unique
      const emailUniqError = emailErrors?.unique

      if (usernameError) errorMessage += usernameError;
      if (usernameUniqError) errorMessage += (errorMessage ? '\n' : '') + usernameUniqError;

      if (emailError) errorMessage += (errorMessage ? '\n' : '') + emailError;
      if (emailUniqError) errorMessage += (errorMessage ? '\n' : '') + emailUniqError;

      if (!errorMessage) errorMessage = data.errors;

      if (errorMessage) {
        ModalManager.warning({
          modalHeaderHeading: 'Create Admin User',
          modalBodyHeading: 'Warning',
          message: errorMessage,
          confirmButtonText: 'OK',
        });
      }

    } finally {
      setLoading(false);
      setProgress(100);
    }
  };


  // loading code//
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Change the background color periodically
      setBackgroundColor(generateRandomColor());
    }, 1000);

    // Cleanup the interval when the component unmounts or loading stops
    return () => clearInterval(intervalId);
  }, []);


  const generateRandomColor = () => {
    // Function to generate a random color (you can replace this with your logic)
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    handleSave();
  };


  return (
    <div>
      <Preloader loading={loading} progress={progress} />

      <Modal
        isOpen={isOpen}
        // onClose={onClose}
        className="user-modal usermoder_wrap"
        overlayClassName="modal-overlay"
      >
        <CentraliseheaderBody
          header="Verify the details before submitting the data"
          logo="GEOPICX_LOGO.png"
          headerBgColor="rgb(64 37 136)"        // Set your desired header background color
          headerTextColor="white"
          onClose={closeModal}
        >
          <div className="t">
            <form class="mx-2 py-3" onSubmit={handleSubmit}>

              <div class="container" style={{ width: "555px" }}>
                <div class="row Row-1">
                  <div class="col-sm">

                    <p className="verify_text">
                      First Name
                    </p>
                    {adminData.FIRST_NAME.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.FIRST_NAME.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.FIRST_NAME}</p>
                    )}                </div>
                  <div class="col-sm">
                    <p className="verify_text">
                      Middle Name
                    </p>
                    {adminData.MIDDLE_NAME.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.MIDDLE_NAME.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.MIDDLE_NAME}</p>
                    )}
                  </div>
                  <div class="col-sm">
                    <p className="verify_text">
                      Last Name
                    </p>
                    {adminData.LAST_NAME.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.LAST_NAME.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.LAST_NAME}</p>
                    )}
                  </div>
                </div>
                <hr className="line" />

                <div class="row ">
                  <div class="col-sm">
                    <p className="verify_text">
                      Organization
                    </p>
                    {adminData.ORGANIZATION.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.ORGANIZATION.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.ORGANIZATION}</p>
                    )}
                  </div>

                  <div class="col-sm">
                    <p className="verify_text">
                      Designation
                    </p>
                    {adminData.DESIGNATION.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.DESIGNATION.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.DESIGNATION}</p>
                    )}
                  </div>

                  <div class="col-sm">
                    <p className="verify_text" >
                      Theme Section{" "}
                    </p>
                    <p className="ValueClass">
                      {adminData.Theme_Section.charAt(0).toUpperCase() + adminData.Theme_Section.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
                <hr className="line" />
                <div class="row ">
                  <div class="col-sm">
                    <p className="verify_text" >
                      Country{" "}
                    </p>
                    <p className="ValueClass"> {country}</p>
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      State
                    </p>
                    <p className="ValueClass">{state}</p>
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      City{" "}
                    </p>
                    <p className="ValueClass"> {adminData.CITY}</p>
                  </div>
                </div>
                <hr className="line" />
                <div class="row ">
                  <div class="col-sm">
                    <p className="verify_text" >
                      Mobile No{" "}
                    </p>
                    <p className="ValueClass"> {adminData?.MOBILE_NO}</p>
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      Phone (LAN)
                    </p>
                    <p className="ValueClass">{adminData?.PHONE_LAN}</p>
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      Location{" "}
                    </p>
                    {/* <p className="ValueClass"> {adminData.OFF_LOCA}</p> */}
                    {adminData.LOCATION.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.LOCATION.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.LOCATION}</p>
                    )}
                  </div>
                </div>
                <hr className="line" />
                <div class="row ">
                  <div class="col-sm">
                    <p className="verify_text" >
                      User Name{" "}
                    </p>
                    <p className="ValueClass"> {adminData.USERNAME}</p>
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      Email Id
                    </p>
                    {/* <p className="ValueClass">{adminData.EMAIL}</p> */}
                    {adminData.EMAIL.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.EMAIL.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.EMAIL}</p>
                    )}
                  </div>
                  <div class="col-sm">
                    <p className="verify_text" >
                      Email Id (ALT){" "}
                    </p>
                    {/* <p className="ValueClass"> {adminData.ALT_EMAIL}</p> */}
                    {adminData.EMAIL_ALT.length > 15 ? (
                      <div>
                        <p className="ValueClass">
                          {adminData.EMAIL_ALT.slice(0, 20)}...
                        </p>
                      </div>
                    ) : (
                      <p className="ValueClass">{adminData.EMAIL_ALT}</p>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="d-flex justify-content-center align-items-center"
              // className="SU-submitbutton"
              >
                <CentraliseButton
                  className="  my-sm-2"
                  type="submit"
                  text="SUBMIT"
                  // onClick={HandleGeneraform}
                  variant="#026d02"
                  padding="6px 6px"
                  hoverBgColor="#2b6e5bcf"
                  hoverTextColor="white"
                  width="90px"
                  fontsize="15px"
                />
                {/* <button
                type="submit"
                variant="success"
                className="mb-5"
                size="sm"
                class="btn btn-success"
              >
                Submit
              </button>{" "} */}
                &nbsp;
                <CentraliseButton
                  className="ml-5  my-sm-2"
                  type="button"
                  text="CANCEL"
                  onClick={closeModal}
                  // onClick={handleBackButtonClick }
                  variant="#ab683f"
                  padding="6px 6px"
                    hoverBgColor="#ab683f9e"
                  // hoverBgColor="#bd0a0b"
                  hoverTextColor="white"
                  width="90px"
                  fontsize="15px"
                />
                {/* <button
                type="button"
                class="btn btn-danger"
                size="sm"
                onClick={closeModal}
              >
                Cancel
              </button> */}
              </div>
            </form>

          </div>
        </CentraliseheaderBody>
      </Modal>
    </div>
  );
}

export default ViewDetails;
