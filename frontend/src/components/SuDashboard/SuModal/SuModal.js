import React, { useState, useEffect } from "react";
import "./SuModal.css";
import {
  Col,
  Row,
} from "react-bootstrap";
import Swal from "sweetalert2";
// loader
import { FadeLoader } from 'react-spinners';
import { css } from "@emotion/react";
import Preloader from "../../Preloader/Preloader";
import axios from "axios";
import ModalManager from "../../GeopicxPopupModals/ModalManager.js";
import { useDispatch, useSelector } from "react-redux";
import { adminFormClose, adminFormopen } from "../../StoreContext/features/profile/modalReducer.js";
import MaxLengthErrorMessage from "../../MaxLengthErrorMessage/MaxLengthErrorMessage.js";
import CentraliseButton from "../../CentraliseButton/CentraliseButton.js";

function SuModal({ modalProps, }) {

  const [SU_APRO_REM, setSU_APRO_REM] = useState("");
  const [SU_APRO_STAT, setSU_APRO_STAT] = useState("");
  const [remarkError, setRemarkError] = useState(false);
  const [remarkLengthError, setRemarkLengthError] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#36D7B7');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();

  const newaccessToken = useSelector((state) => state.auth.accessToken);

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

  const handleModalClose = () => {
    setSU_APRO_REM("");
    setRemarkError("");
    setRemarkLengthError("");
    modalProps.onClose();
  };


  const handleBlock = async () => {
    let url;
    const formData = {
      SU_APRO_STAT: modalProps.userStaus,
      USERID: modalProps.uuId,
      SU_APRO_REM: SU_APRO_REM || "",
      // THEME_OPT: modifiedTheme,
    };

    try {
      LoaderUpdateProgress();
      if (modalProps.isselectedType === 'UU') {
        url = "http://127.0.0.1:8000/authorized_singup/"
      } else if (modalProps.isselectedType === 'AU') {
        url = "http://127.0.0.1:8000/admin_url/"
      } else {
        url = "http://127.0.0.1:8000/general_signup/"
      };

      const response = await fetch(
        url,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newaccessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.status === 200) {
        modalProps.onClose();
        const result = await ModalManager.success({
          modalHeaderHeading: modalProps.isselectedType === 'AU' ? 'Manage User' : (modalProps.isselectedType === 'UU' ? 'Manage User' : 'Manage User'),
          modalBodyHeading: 'Success',
          message: 'User BLOCKED Successfully, Confirmation Email sent to the respective User Email Address.',
          onConfirm: () => {
            if (modalProps.isselectedType !== 'GU') {
              modalProps.handleAuthtable(modalProps.selectedUserId);
            }
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK'
        });
        setSU_APRO_REM("");

        if (result.isConfirmed) {
          if (modalProps.isselectedType !== "GU") {
            modalProps.setShowAuthorizedTable(true);
            modalProps.fetchData();
            if (modalProps.isselectedType === 'AU') {
              modalProps.setShowAuthorizedTable(true);
              modalProps.handleAuthtable(modalProps.selectedUserId);
            }
          } else if (result.isConfirmed || result.isDismissed) {
            modalProps.setGeneralShowTable(true);
            modalProps.setActiveButton("general");
            handleModalClose();
            modalProps.GeneralData();
          }
        }


      }
    } catch (error) {
      console.error("Error updating user:", error.message);
    }
    finally {
      //Set isLoading to false after the API call is complete
      setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  }

  const handleDelete = async () => {
    let formData, url;

    formData = {
      SU_APRO_STAT: modalProps.userStaus,
      USERID: modalProps.uuId,
      SU_APRO_REM: SU_APRO_REM || "",
    };

    if (modalProps.isselectedType === 'AU') {
      url = "http://127.0.0.1:8000/admin_url/"
    }
    else if (modalProps.isselectedType === 'UU') {
      url = "http://127.0.0.1:8000/authorized_singup/"
    } else {
      url = "http://127.0.0.1:8000/general_signup/"
    }

    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      const response = await fetch(
        url,
        {
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

        // Show success modal
        const result = await ModalManager.success({
          modalHeaderHeading: modalProps.isselectedType === 'AU' ? 'Manage User' : (modalProps.isselectedType === 'UU' ? 'Manage User' : 'Manage User'),
          modalBodyHeading: 'Success',
          message: "User DELETED Successfully. Confirmation Email sent to the respective User Email Address.",
          onConfirm: () => {
            if (modalProps.isselectedType !== 'GU') {
              modalProps.handleAuthtable(modalProps.selectedUserId);
            }
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK'
        });
        setSU_APRO_REM("");

        if (result.isConfirmed) {
          if (modalProps.isselectedType !== "GU") {
            modalProps.fetchData();
            if (modalProps.isselectedType === 'AU') {
              modalProps.setShowAuthorizedTable(false);
            } else {
              modalProps.setShowAuthorizedTable(true);
              modalProps.handleAuthtable(modalProps.selectedUserId);
            }
          } else if (result.isConfirmed || result.isDismissed) {
            modalProps.setGeneralShowTable(true);
            modalProps.setActiveButton("general");
            handleModalClose();
            modalProps.GeneralData();
          }
        }

      }
    } catch (error) {
      console.error("Error updating user:", error.message);
    }
    finally {
      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  }

  //Unblock User Api
  const handleUnBlockUser = async () => {
    let url;
    // const Key_Status = type === 'UU' ? 'AU_APRO_STAT' : 'SU_APRO_STAT';
    const formData = {
      // USERNAME: name,
      SU_APRO_STAT: "APPROVED",
      USERID: modalProps.uuId,
      SU_APRO_REM: SU_APRO_REM || "",
    };

    if (modalProps.isselectedType === "AU") {
      url = "http://127.0.0.1:8000/admin_url/";
    } else if (modalProps.isselectedType === "UU") {
      url = "http://127.0.0.1:8000/authorized_singup/";
    } else {
      url = "http://127.0.0.1:8000/general_signup/";
    }

    // setIsLoading(false);
    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.status === 200 || response.status === 201) {
        modalProps.onClose();
        const result = await ModalManager.success({
          //modalHeaderHeading: type === 'AU' ? 'Admin User' : 'Authorized User',
          modalHeaderHeading: modalProps.isselectedType === 'AU' ? 'Manage User' : (modalProps.isselectedType === 'UU' ? 'Manage User' : 'Manage User'),

          modalBodyHeading: 'Success',
          message: 'User UNBLOCKED Successfully. Confirmation Email sent to the respective User Email Address.',
          onConfirm: () => {
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK'
        });
        setSU_APRO_REM("");
        if (result.isConfirmed) {
          if (modalProps.isselectedType !== "GU") {
            modalProps.fetchData();
            if (modalProps.isselectedType === 'AU') {
            } else {
              modalProps.setShowAuthorizedTable(true);
              modalProps.handleAuthtable(modalProps.selectedUserId);
            }
          } else if (result.isConfirmed || result.isDismissed) {
            modalProps.setGeneralShowTable(true);
            modalProps.setActiveButton("general");
            // handleCloseModal();
            modalProps.GeneralData();
          }
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        ModalManager.error({
          modalHeaderHeading: modalProps.isselectedType === 'AU' ? 'Manage User' : (modalProps.isselectedType === 'UU' ? 'Manage User' : 'Manage User'),
          modalBodyHeading: "Error",
          message: `${error}`,
          confirmButtonText: 'OK',
        });
      }
      console.error("Error updating user:", error.message);
    } finally {
      // Set isLoading to false after the API call is complete
      setIsLoading(false);
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
  }, [isLoading]);

  //   const override = css`
  // display: block;
  // margin: 0 auto;
  // `;

  const generateRandomColor = () => {
    // Function to generate a random color (you can replace this with your logic)
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  // ////////// loading timer///
  useEffect(() => {
    let timer;
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 3000);

    // Clear the timeout if the API call completes before 3 seconds
    if (!isLoading) {
      clearTimeout(timeoutId);
    }

    // Start the loading timer when isLoading becomes true
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(true);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);


  const handleSubmit = (event) => {
    event.preventDefault();

    if (!SU_APRO_REM.trim()) {
      setRemarkError(true);
      return; // Prevent form submission if remark is missing
    } else {
      setRemarkError(false);
    }

    if (modalProps.userStaus === 'BLOCKED') {
      handleBlock();
    } else if (modalProps.userStaus === 'UNBLOCKED') {
      handleUnBlockUser();
    } else if (modalProps.userStaus === 'REPLACE') {
      modalProps.handleREMARK(SU_APRO_REM);
    } else {
      handleDelete();
    }
  };

  // MaxLength \\
  const inputFields = [
    { name: "SU_APRO_REM", maxLength: 100 },
  ];

  const [inputClicked, setInputClicked] = useState({
    SU_APRO_REM: false,
  });


  const handleInputFocus = (fieldName) => {
    setInputClicked((prevInputClicked) => ({
      ...prevInputClicked,
      [fieldName]: true,
    }));
  };


  return (
    <div className={`modal ${modalProps.isOpen ? "open" : "closed"}`}>
      <Preloader loading={loading} progress={progress} />

      <div className="AuModal">
        <div className=" Model_header_wraper ">
          <div className="d-flex align-items-center">
            <img src="GEOPICX_LOGO.png" alt="Logo" class="GeopicxModalLogo" />
            <h2 className="ModalTitle_su">Manage User</h2>
          </div>
          <span className="close_model" onClick={handleModalClose}>
            &times;
          </span>


        </div>

        <form class="mx-4 my-3" onSubmit={handleSubmit}>
          <div class="form-group">
            <label className="AuModal-label">Su Status</label>
            <input
              type="text"
              id="SU_APRO_STAT"
              className="form-control" disabled
              value={modalProps.status.charAt(0).toUpperCase() + modalProps.status.slice(1).toLowerCase()}
              onChange={(e) => setSU_APRO_STAT(e.target.value)}
            />
          </div>
          <div class="form-group">
            <label className="AuModal-label"><span className="required-field">*</span>Remark
              <span className="Remark-Requireds"> 
                {remarkError && (
                  <div className="Re-error-message-su">Field is required</div>
                )}
                {/* {remarkLengthError && (
                  <div className="Re-error-messageMaxlength text-align-left">Max 100 Characters</div>
                )} */}
                <span
                  className="maxlength-message-supop"
                  id="maxlength-message"
                >
                  <MaxLengthErrorMessage
                    isVisible={
                      inputClicked.SU_APRO_REM && SU_APRO_REM &&
                      SU_APRO_REM.length >= 100
                    }
                    InputFields={inputFields[0].maxLength}
                  />
                </span>
              </span>
            </label>
            <input
              type="text"
              id="SU_APRO_REM"
              //className="form-control"
              className={`form-control ${remarkError ? "is-invalid" : ""}`}
              value={SU_APRO_REM}
              onChange={(e) => {
                const inputValue = e.target.value;
                const validInput = inputValue;
                setSU_APRO_REM(validInput);
                if (validInput.trim() !== '' || !isTouched) {
                  setRemarkError(false);
                } else {
                  setRemarkError(true);
                }

                if (validInput.length >= 100) {
                  // setRemarkLengthError('100');
                } else {
                  setRemarkLengthError(false);
                }
              }}
              onBlur={() => {
                setIsTouched(true);
                setIsFocused(false);
                if (SU_APRO_REM.trim() === '') {
                  setRemarkError(true);
                }
              }}
              onFocus={() => {
                setIsFocused(true);
                handleInputFocus("SU_APRO_REM");
              }}
              maxLength={100}
            />

          </div>

          <div class="form-group">
            {modalProps.userStaus === 'BLOCKED' ? (
              <div className="SaveBtn">
                <CentraliseButton
                  className=" my-sm-2"
                  type="submit"
                  text="BLOCK"

                  // onClick={handleBackButtonClick }
                  variant="black"
                  padding="3px 3px"
                  hoverBgColor="gray"
                  hoverTextColor="white"
                  width="150px"
                  fontsize="15px"
                />
                {/* <button class="btn btn-dark" size="sm"
                  type="submit"
                // onClick={() => {
                //   if (SU_APRO_REM) {
                //     handleBlock();
                //   } else {
                //     setRemarkError(true);
                //   }
                // }}
                >
                  BLOCKrrrrrr
                </button> */}
              </div>
            ) :
              modalProps.userStaus === 'UNBLOCKED' ? (
                <div className="SaveBtn">
                  <CentraliseButton
                    className="my-sm-2"
                    type="submit"
                    text="UNBLOCK"

                    // onClick={handleBackButtonClick }
                    variant="black"
                    padding="3px 3px"
                    hoverBgColor="gray"
                    hoverTextColor="white"
                    width="150px"
                    fontsize="15px"
                  />
                  {/* <button class="btn btn-dark" size="sm"
                    type="submit"
                  // onClick={() => {
                  //   if (SU_APRO_REM) {
                  //     handleBlock();
                  //   } else {
                  //     setRemarkError(true);
                  //   }
                  // }}
                  >
                    UNBLOCK
                  </button> */}
                </div>
              ) :
                modalProps.userStaus === 'DELETE' ? (
                  <div className="SaveBtn">
                    {/* <button class="btn btn-dark" size="sm"
                      type="submit"
                    // onClick={() => {
                    //   if (SU_APRO_REM) {
                    //     handleDelete();
                    //   } else {
                    //     setRemarkError(true);
                    //   }
                    // }}
                    >
                      DELETE
                    </button> */}

                    <CentraliseButton
                      className="my-sm-2"
                      type="submit"
                      text=" DELETE"
                      variant="#bd0a0a"
                      padding="3px 3px"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />
                  </div>
                ) : (
                  <div className="SaveBtn">
                    <button class="btn btn-dark" size="sm"
                      type="submit"
                    // onClick={() => {
                    //   if (SU_APRO_REM) {
                    //     handleDelete();
                    //   } else {
                    //     setRemarkError(true);
                    //   }
                    // }}
                    >
                      REPLACE ACCOUNT
                    </button>
                  </div>

                )}

          </div>
        </form>
      </div>
    </div>
  );
};

export default SuModal;
