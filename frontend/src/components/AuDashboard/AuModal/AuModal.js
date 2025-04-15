import React, { useState, useEffect } from "react";
import "./AuModal.css";
// loading//
import Preloader from "../../Preloader/Preloader";
import ModalManager from "../../GeopicxPopupModals/ModalManager.js";
import { useDispatch, useSelector } from "react-redux";
import { adminFormClose } from "../../StoreContext/features/profile/modalReducer.js";
import MaxLengthErrorMessage from "../../MaxLengthErrorMessage/MaxLengthErrorMessage.js";
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CentraliseheaderBody from "../../Centraliseheaderbody/CentraliseheaderBody.js";
import CentraliseButton from "../../CentraliseButton/CentraliseButton.js";
import ViewProfile from "../../viewprofile/ViewProfile.js";


const AuModal = ({ modalProps }) => {

  const newaccessToken = useSelector((state) => state.auth.accessToken);
  const [username, setUsername] = useState("");
  const [AU_APRO_REM, setAU_APRO_REM] = useState("");
  const [AU_APRO_STAT, setAU_APRO_STAT] = useState("");
  const [remarkError, setRemarkError] = useState(false);
  const [remarkLengthError, setRemarkLengthError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [isProfile, setIsProfile] = useState(false);

  const [inputClicked, setInputClicked] = useState({
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    ORGANIZATION: false,
    DESIGNATION: false,
    ADDRESS_1: false,
    ADDRESS_2: false,
    PIN_CODE: false,
    USERNAME: false,
    EMAIL: false,
    MOBILE_NO: false,
    AU_APRO_REM: false,
  });

  const inputFields = [
    { name: "AU_APRO_REM", maxLength: 100 },
  ];

  const LoaderUpdateProgress = async () => {
    setLoading(true);
    setProgress(0);
    const steps = 10; // Define the number of steps
    const stepDuration = 500; // Define the duration for each step (in milliseconds)

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      const progressPercentage = (i / steps) * 100;
      setProgress(progressPercentage);
    }
  };


  const handleCheckboxChange = (module) => {
    modalProps.setSelectedModules((prevModules) => ({
      ...prevModules,
      [module]: !prevModules[module]
    }));
  };

  const handleSave = async (value) => {

    let response;
    const transformedModules = Object.fromEntries(
      Object.entries(modalProps.selectedModules).map(([key, value]) => [key, value])
    );

    const formData = {
      USERNAME: modalProps.authName || "",
      AU_APRO_STAT: value,
      USERID: modalProps.uuId,
      AU_APRO_REM: AU_APRO_REM,
      //...modalProps.uuValue === 2 ? AU_APRO_REM: AU_APRO_REM,
      // APRO_DATE: auDate,

      PERMISSION: {
        ...transformedModules,
      }
    };

    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      response = await fetch("http://127.0.0.1:8000/authorized_singup/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify(formData),
      }
      );

      if (response.status === 200 || response.status === 201) {
        modalProps.onClose();
        setAU_APRO_REM("");
        setRemarkError(false);
        ModalManager.success({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "User Updated Successfully, Confirmation Email sent to the respective User Email Address.",
          onConfirm: () => {
            modalProps.fetchData();
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK',
        });

      }

    } catch (error) {
      console.error("Error updating user:", error.message);
    } finally {

      if (response.status === 400) {
        modalProps.onClose();
        const errorData = await response.json();

        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: errorData.errors,
          confirmButtonText: 'OK',
        });
      }

      setLoading(false);
      setProgress(100);
    }
    // modalProps.onClose();
  };


  //DELETE API
  const handleDelete = async () => {
    // setIsLoading(false);
    let apiStatus, apiRemark, response;

    if (modalProps.userType === "AU") {
      apiStatus = "AU_APRO_STAT";
      apiRemark = "AU_APRO_REM";
    } else {
      apiStatus = "SU_APRO_STAT";
      apiRemark = "SU_APRO_REM";
    }
    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      response = await fetch("http://127.0.0.1:8000/authorized_singup/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify({
          USERID: modalProps.uuId,
          [apiStatus]: "DELETE",
          [apiRemark]: AU_APRO_REM || "",
          APRO_DATE: new Date(),
        }),
      });

      if (response.ok) {
        modalProps.onClose();

        ModalManager.success({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "User DELETED Successfully, and a Confirmation Email has been sent to the respective User Email Address.",
          onConfirm: () => {
            modalProps.fetchData();
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK',
        });
        setAU_APRO_REM("");
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
    } finally {

      if (response.status === 400) {
        modalProps.onClose();
        const errorData = await response.json();

        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: errorData.errors,
          confirmButtonText: 'OK',
        });
      }

      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  };

  //Block Api
  const handleBlock = async () => {
    let response;
    const apiUrl = 'http://127.0.0.1:8000/authorized_singup/';

    try {
      LoaderUpdateProgress();
      response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify({
          AU_APRO_STAT: 'BLOCKED',
          USERID: modalProps.uuId,
          AU_APRO_REM: AU_APRO_REM || "",
          // APRO_DATE: auDate,
        }),
      });

      if (response.ok) {
        setAU_APRO_REM("");
        modalProps.onClose();

        ModalManager.success({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "User BLOCKED Successfully and a <b>Confirmation</b> Email has been sent to the respective User Email Address.",
          onConfirm: () => {
            modalProps.fetchData();
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    finally {

      if (response.status === 400) {
        modalProps.onClose();
        const errorData = await response.json();

        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: errorData.errors,
          confirmButtonText: 'OK',
        });
      }

      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  };

  const handleModalClose = () => {
    setAU_APRO_REM("");
    setRemarkLengthError("");
    setRemarkError(false);
    modalProps.onClose();
    // setIsLoading(false);
  };

  const handleUnBlock = async () => {

    let response;
    const formData = {
      AU_APRO_STAT: "APPROVED",
      USERID: modalProps.uuId,
      AU_APRO_REM: AU_APRO_REM
      // APRO_DATE: date,
    };

    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      response = await fetch("http://127.0.0.1:8000/authorized_singup/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200 || response.status === 201) {
        modalProps.onClose();

        ModalManager.success({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "User UNBLOCKED successfully. Confirmation Email sent to the respective User Email Address.",
          onConfirm: () => {
            modalProps.fetchData();
            setAU_APRO_REM("")
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK',
        });
      }

    } catch (error) {
      console.error("Error updating user:", error.message);
    }
    finally {
      if (response.status === 400) {
        modalProps.onClose();
        const errorData = await response.json();

        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: errorData.errors,
          confirmButtonText: 'OK',
        });
      }

      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    // if (!AU_APRO_REM) {
    if (modalProps.uuValue === 1) {
      handleSave("APPROVED");
    }
    //   else {
    //     setRemarkError(true);
    //     return; // Prevent form submission if remark is missing
    //   }
    // }

    if (AU_APRO_REM.trim()) {
      if (modalProps.uuValue === 3) {
        handleBlock();
      } if (modalProps.uuValue === 2) {
        handleSave("REJECTED");
      }
      else if (modalProps.uuValue === 4) {
        handleDelete();
      }
      else if (modalProps.uuValue === 5) {
        handleUnBlock();
      }
    } else {
      setRemarkError(true);
    }
  };

  const handleInputFocus = (fieldName) => {
    setInputClicked((prevInputClicked) => ({
      ...prevInputClicked,
      [fieldName]: true,
    }));
  };

  const handleProfile = () => {
    setIsProfile(true);
  };

  const closeModal = () => {
    setIsProfile(false);
  };



  return (
    <div className={`modal ${modalProps.isOpen ? "open" : "closed"}`}>
      <Preloader loading={loading} progress={progress} />

      <div className="AuModal_wrap ">
        <div className=" Model_header_wraper ">
          <div className="d-flex align-items-center">
            <img src="GEOPICX_LOGO.png" alt="Logo" class="GeopicxModalLogo" />
            <h2 className="ModalTitle_su">Manage User</h2>
          </div>
          <span className="close_model" onClick={handleModalClose}>
            &times;
          </span>
        </div>

        <form class="mx-4 my-3 text-dark" onSubmit={handleSubmit}>
          {!(modalProps.uuValue === 3 || modalProps.uuValue === 4 || modalProps.uuValue === 5) && (
            <>
              <div class="form-group mb-0">

                <div className="view_Au_model">

                  <label className="AuModal-U-label">User Name</label>
                  {(modalProps.uuValue === 1 || modalProps.uuValue === 2) &&
                    <div className="d-flex justifify-content-end">
                      <img
                        src="UserProfile.png"
                        alt="Site Logo"
                        width="25"
                        height="25"
                        title="User Profile Data"
                        className="hoverable-image"
                        onClick={() => handleProfile()}
                      />
                    </div>

                  }

                </div>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  disabled
                  value={modalProps?.authName}
                  //value={modalProps.authName === null ? "" : modalProps.authName}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

            </>


          )}

          {modalProps.uuValue === 2 ? (
            <>
              <div class="form-group">
                <label className="AuModal-label">
                  <span className="required-field">*</span>Remark
                  <span className="Reject-Remark-Required">
                    {remarkError && (
                      <div className="Re-error-message-au">Field is required</div>
                    )}
                    <span
                      className="maxlength-message-aupop"
                      id="maxlength-message"
                    >
                      <MaxLengthErrorMessage
                        isVisible={
                          inputClicked.AU_APRO_REM && AU_APRO_REM &&
                          AU_APRO_REM.length >= 100
                        }
                        InputFields={inputFields[0].maxLength}
                      />
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  id="AU_APRO_REM"
                  // className=" form-control"
                  className={`form-control ${remarkError ? "is-invalid" : ""}`}
                  //value={AU_APRO_REM}
                  value={AU_APRO_REM}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const validInput = inputValue;

                    if (validInput.trim() !== "") {
                      setRemarkError(false);
                    } else {
                      setRemarkError(true);
                    }

                    if (validInput.length > 100) {
                      //setRemarkLengthError(true);
                    } else {
                      setRemarkLengthError(false);
                    }
                    setAU_APRO_REM(validInput);

                  }}
                  onBlur={() => {
                    setIsTouched(true);
                    setIsFocused(false);
                    if (AU_APRO_REM.trim() === '') {
                      setRemarkError(true);
                    }
                  }}
                  onFocus={() => {
                    setIsFocused(true);
                    handleInputFocus("AU_APRO_REM");
                  }}
                  maxLength={100}
                />
              </div>
              <div className="form-group SaveBtn mb-0">
                {/* <button
                  // class="btn btn-danger"
                  className="AuModal_RejectBtn_model"
                  size="sm"
                >
                  REJECT
                </button> */}


                <CentraliseButton
                  className="ml-5  my-sm-2"
                  type="submit"
                  text="REJECT"
                  // onClick={() => {
                  //   handleSave("REJECTED");
                  // }}
                  variant="#888"
                  padding="3px 3px"
                  hoverBgColor="#ab683f9e"
                  // hoverBgColor="#bd0a0b"
                  hoverTextColor="white"
                  width="150px"
                  fontsize="15px"
                />


                <CentraliseButton
                  className="ml-5  my-sm-2"
                  type="button"
                  text="CANCEL"
                  onClick={() => {
                    handleModalClose()
                  }}
                  variant="#ab683f"
                  padding="3px 3px"
                  hoverBgColor="#ab683f9e"
                  // hoverBgColor="#bd0a0b"
                  hoverTextColor="white"
                  width="150px"
                  fontsize="15px"
                />

              </div>
            </>
          ) : (
            !(modalProps.uuValue === 3 || modalProps.uuValue === 4 || modalProps.uuValue === 5) && (
              <>
                <div class="form-group mt-2 ">
                  <label className="AuModal-label">Modules:</label>
                  <div className="">

                    {Object.keys(modalProps.selectedModules).map((module) => (


                      <div className="col-12 col-sm-12 col-md-6 col-lg-6 mb-2 p-0 pr-3 " key={module}>
                        <span
                          // className="Module_wraper"
                          className="d-flex "
                          style={{
                            cursor: 'pointer',
                            opacity: 1,
                          }}
                          onClick={() => handleCheckboxChange(module)}
                        >
                          <span className={` rounded  px-2 inline-block text-white w-100 ${modalProps.selectedModules[module] ? "bg-success" : "Icon_box_background"} `}>
                            {module}
                          </span>

                          <span className={` Icon_box_model ${modalProps.selectedModules[module] ? "icon_box_border_success" : "icon_box_border"}`}>
                            {modalProps.selectedModules[module] && (
                              <FontAwesomeIcon className={` ${modalProps.selectedModules[module] ? "text-success" : "Icon_Text_color"}`} icon={modalProps.selectedModules[module] ? faCheck : faTimes} />
                            )}
                          </span>

                        </span>

                      </div>

                    ))}
                  </div>
                </div>

                <div className="SaveBtn">
                  <div>
                    {/* <button
                      variant="success"
                      className="AuModal_Btn_model"
                      size="sm"
                    // onClick={() => handleSave("APPROVED", 1)}
                    >
                      APPROVAL
                    </button> */}

                    <CentraliseButton
                      className="ml-5  my-sm-2"
                      type="button"
                      text="APPROVAL"
                      variant="#026d02"
                      padding="3px 3px"
                      onClick={() => handleSave("APPROVED", 1)}
                      hoverBgColor="#2b6e5bcf"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />

                    <CentraliseButton
                      className="ml-5  my-sm-2"
                      type="button"
                      text="CANCEL"
                      onClick={() => {
                        handleModalClose()
                      }}
                      variant="#ab683f"
                      padding="3px 3px"
                      hoverBgColor="#ab683f9e"
                      // hoverBgColor="#bd0a0b"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />
                  </div>
                </div>

              </>
            )
          )}
        </form>

        {/* ________________________________________________________________________ */}
        {(modalProps.uuValue === 3 || modalProps.uuValue === 4 || modalProps.uuValue === 5) && (
          <form className="mx-4 mt-4" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="AuModal-Status" htmlFor="AU_APRO_STAT">Au Status</label>
              <input
                type="text"
                id="AU_APRO_STAT"
                className="form-control"
                disabled
                value={modalProps.status.charAt(0).toUpperCase() + modalProps.status.slice(1).toLowerCase()}
                onChange={(e) => setAU_APRO_STAT(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="AuModal-Status" htmlFor="AU_APRO_REM">
                <span className="required-field">*</span>Remark
                <span className="Remark-Requireds">
                  {remarkError && (
                    <div className="Re-error-message-au">Field is required</div>
                  )}
                  <span
                    className="maxlength-message-aupop"
                    id="maxlength-message"
                  >
                    <MaxLengthErrorMessage
                      isVisible={
                        inputClicked.AU_APRO_REM && AU_APRO_REM &&
                        AU_APRO_REM.length >= 100
                      }
                      InputFields={inputFields[0].maxLength}
                    />
                  </span>
                </span>
              </label>
              <input
                type="text"
                id="AU_APRO_REM"
                // className="form-control"
                className={`form-control ${remarkError ? "is-invalid" : ""}`}
                value={AU_APRO_REM}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setAU_APRO_REM(inputValue);

                  if (inputValue.trim() !== '' || !isTouched) {
                    setRemarkError(false);
                  } else {
                    setRemarkError(true);
                  }

                  if (inputValue.length >= 100) {
                    //setRemarkLengthError(true);
                  } else {
                    setRemarkLengthError(false);
                  }
                }}
                onBlur={() => {
                  setIsTouched(true);
                  setIsFocused(false);
                  if (AU_APRO_REM.trim() === '') {
                    setRemarkError(true);
                  }
                }}
                onFocus={() => {
                  setIsFocused(true);
                  handleInputFocus("AU_APRO_REM");
                }}
                maxLength={100}
              />
            </div>
            <div className="form-group SaveBtn">
              <CentraliseButton
                className="  my-sm-2"
                type="submit"
                text={modalProps.uuValue === 3 ? "BLOCK" : modalProps.uuValue === 5 ? "UNBLOCK" : "DELETE"}

                // onClick={handleBackButtonClick }
                variant="black"
                padding="3px 3px"
                hoverBgColor="gray"
                hoverTextColor="white"
                width="150px"
                fontsize="15px"
              />
              {/* <button
                className="btn btn-dark"
                size="sm"
                type="submit"
              >
                {modalProps.uuValue === 3 ? "BLOCK" : modalProps.uuValue === 5 ? "UNBLOCK" : "DELETE"}
              </button> */}
            </div>
          </form>
        )}
      </div>

      {isProfile &&
        <ViewProfile
          isOpen={isProfile}
          selectedUser={modalProps.IsIndex}
          onClose={closeModal}
          userType={modalProps.userType}
        />

      }


    </div>




  );
};

export default AuModal;
