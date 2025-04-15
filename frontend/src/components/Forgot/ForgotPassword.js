import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { css } from "@emotion/react";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Preloader from '../Preloader/Preloader';
import {
  faAngleDoubleLeft
} from "@fortawesome/free-solid-svg-icons";
import { FadeLoader } from 'react-spinners';
import ModalManager from '../GeopicxPopupModals/ModalManager';
import MaxLengthErrorMessage from "../MaxLengthErrorMessage/MaxLengthErrorMessage";
import CentraliseheaderBody from '../Centraliseheaderbody/CentraliseheaderBody';
import CentraliseButton from '../CentraliseButton/CentraliseButton';
import './Forgot.css'


const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#36D7B7');
  const location = useLocation();
  //const { username, email, userType, Q1_ID, Q2_ID } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [question1Text, setQuestion1Text] = useState('');
  // const [question2Text, setQuestion2Text] = useState('');
  // const [q1Error, setQ1Error] = useState("");
  // const [q2Error, setQ2Error] = useState("");
  // const [Q1_AN, setQ1_AN] = useState("");
  // const [Q2_AN, setQ2_AN] = useState("");
  const [showMaxLengthError, setShowMaxLengthError] = useState(false);
  const [showMaxLengthError1, setShowMaxLengthError1] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isUserType, setIsUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  const [data, setData] = useState(null);

  useEffect(() => {
    // Retrieve data from localStorage
    const storedData = localStorage.getItem('componentBData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      setUserName(parsedData.username);
      setEmail(parsedData.email);
      setIsUserType(parsedData.userType);
    }
  }, [userName]);

  const navigate = useNavigate();

  const handleGeneratedOTP = async () => {

    // if (isUserType === 'UU') {
    //   if (!Q1_AN) {
    //     setQ1Error("Field is required");
    //     return;
    //   }

    //   if (!Q2_AN) {
    //     setQ2Error("Field is required");
    //     return;
    //   }
    // }
    setIsLoading(false);
    try {
      setLoading(true);
      setProgress(0);
      const steps = 10;
      const stepDuration = 500;
      for (let i = 1; i <= steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        const progressPercentage = (i / steps) * 100;
        setProgress(progressPercentage);
      }
      const response = await axios.post('http://127.0.0.1:8000/forget_password/', {
        EMAIL: email,
        USERNAME: userName,
        // ...(data.userType === 'UU' && {
        //   Q1_AN: Q1_AN,
        //   Q2_AN: Q2_AN
        // })
      });
      if (response.status === 200) {
        const data = response.data;
        const userId = data.USERID;
        const time = data.time;

        navigate('/GenerateOTP', { state: { userId, userName, isUserType, time } })

        ModalManager.success({
          modalHeaderHeading: 'Forgot Password',
          modalBodyHeading: 'Success',
          message: "Check your email for the OTP.",
          onConfirm: () => {
            // navigate('/GenerateOTP', { state: { userId, username, userType, Q1_AN, Q2_AN, time } })
          },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      const msgerror = error.response.data.errors;

      ModalManager.error({
        modalHeaderHeading: 'Forgot Password',
        modalBodyHeading: 'Error',
        message: msgerror,
        confirmButtonText: 'OK',
      });
    }
    finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Change the background color periodically
      setBackgroundColor(generateRandomColor());
    }, 1000);

    // Cleanup the interval when the component unmounts or loading stops
    return () => clearInterval(intervalId);
  }, [isLoading]);

  const override = css` display: block; margin: 0 auto;`;


  const generateRandomColor = () => {
    // Function to generate a random color (you can replace this with your logic)
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const handleBackButtonClick = () => {
    // Redirect to the login page
    navigate('/login');
  };

  // const securityQuestions = [
  //   { id: 1, text: "Whats your birth year?" },
  //   { id: 2, text: "What is your mother's maiden name?" },
  //   { id: 3, text: "In which city were you born?" },
  //   { id: 4, text: "What is your favorite pet's name?" },
  // ];

  // useEffect(() => {
  //   if (data) {
  //     const question1 = securityQuestions.find((q) => q.id === data.Q1_ID);
  //     const question2 = securityQuestions.find((q) => q.id === data.Q2_ID);
  //     if (question1) {
  //       setQuestion1Text(question1.text);
  //     }
  //     if (question2) {
  //       setQuestion2Text(question2.text);
  //     }
  //   }
  // }, [securityQuestions]);


  return (
    <div style={{
      // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1064161204/photo/mount-rainier-3d-render-topographic-map-color.jpg?s=612x612&w=0&k=20&c=4cyVfQY9V-wSKy0Zx4jHdPRnhImnF9LP6PqqBhbUans=')`,
      // backgroundSize: 'cover',
      // backgroundRepeat: 'no-repeat',
      // backgroundPosition: 'center center',
      // minHeight: '87vh',
    }}>
      {/* <div className=" registrationBack">
        <button
          className="registrationButton"
          onClick={handleBackButtonClick}
        >
          <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleLeft} />
          Back
        </button>
      </div> */}
      <div className="GeCs mx-2">
        <div className="d-flex justify-content-center align-items-center pt-5 vh-90">
          <Preloader loading={loading} progress={progress} />
          {isLoading && (
            <div className="loading-overlay position-absolute "
              style={{ zIndex: "100" }}
            >
              <div className="d-flex justify-content-center align-items-center "
                style={{
                  top: '1000%',
                  left: '800%',
                  transform: 'translate(700%, 450%)',
                }}>

                < FadeLoader color={backgroundColor} loading css={override} size={50} />

                <p className="mt-2 ml-3 " style={{ color: backgroundColor }}>Loading...</p>
              </div>
            </div>
          )}
          <div className="mx-auto py-auto uforgotforms">
            {/* <div className=" image p-3">
              <img
                src="logo.png "
                alt="Site Logo"
                width="50"
                height="50"
                style={{ marginTop: "-5px" }}
              />
              <h1 className="LogoForgot font-italic">GeoPicX</h1>
            </div> */}
            <div
            //  class="mainDiv"
            >
              <div
                class="cardStyle"
              >
                <CentraliseheaderBody
                  header="Forgot Password"
                  logo="GEOPICX_LOGO.png"
                  headerBgColor="rgb(64 37 136)"        // Set your desired header background color
                  headerTextColor="white"

                  onClose={handleBackButtonClick}
                >
                  <form
                    action=""
                    method="post"
                    name="signupForm"
                    id="signupForm"
                    className="resetForm">
                    <fieldset className="the-fieldset mb-4">
                      <legend className="the-legendSuEditUse">Password Recovery </legend>

                      {/* <div class="inputDiv mx-4">
                    <h2 class="formTitle">Forgot Password</h2>
                  </div> */}
                      <div class="inputDiv mx-4">
                        <label class="inputLabel Input-Field-Label " >
                          <strong>User Name</strong>
                        </label>
                        <input
                          type="text"
                          id="password"
                          required
                          className='form-control Input-Field'
                          value={userName}
                          disabled
                          readOnly
                        />
                      </div>

                      <div class="inputDiv mx-4">
                        <label class="inputLabel Input-Field-Label" >
                          <strong> Email Id</strong>
                        </label>
                        <input
                          value={email}
                          className='form-control Input-Field'
                          disabled
                          readOnly
                        />
                      </div>

                      {/* question code */}
                      {/* {isUserType === "UU" &&
                    <>
                      <div class="inputDiv mx-4">
                        <label class="inputLabel Input-Field-Label" for="confirmPassword">
                          Question.1 &nbsp; &nbsp;
                          <strong className="text-xl" style={{ fontSize: "13px" }}>
                            {question1Text} &nbsp; &nbsp;
                          </strong>

                          {(q1Error || (showError && !Q1_AN.trim())) && (
                            <span style={{ color: "red", fontSize: "12px" }}>
                              {q1Error || ""}
                            </span>
                          )}
                          <span className="maxlength-messageGU" id="maxlength-message">
                            <MaxLengthErrorMessage
                              isVisible={showMaxLengthError}
                              InputFields={20} 
                            />
                          </span>

                        </label>
                        <input
                          className={`form-control Input-Field ${q1Error ? 'is-invalid' : ''}`}
                          type="text"
                          id="confirmPassword"
                          placeholder="Answer for Question 1"
                          onChange={(e) => handleChange("Q1_AN", e.target.value)}
                          onBlur={() => handleBlur("Q1_AN")}
                          onFocus={() => handleFocus("Q1_AN")}
                          maxLength={20}
                          value={Q1_AN}
                          name="Q1_AN"
                        />
                      </div>
                      <div class="inputDiv mx-4">
                        <label class="inputLabel Input-Field-Label" for="confirmPassword">
                          Question.2 &nbsp; &nbsp;
                          <strong className="text-xl" style={{ fontSize: "13px" }}>
                            {question2Text}&nbsp; &nbsp;
                          </strong>
                          {(q2Error || (showError && !Q2_AN.trim())) && (
                            <span style={{ color: "red", fontSize: "12px" }}>
                              {q2Error || ""}
                            </span>
                          )}
                          <span className="maxlength-messageGU" id="maxlength-message">
                            <MaxLengthErrorMessage
                              isVisible={showMaxLengthError1}
                              InputFields={20} 
                            />
                          </span>
                        </label>
                        <input
                          type="text"
                          id="confirmPassword"
                          className={`form-control Input-Field ${q2Error ? 'is-invalid' : ''}`}                       
                          placeholder="Answer for Question 2"
                          onChange={(e) => handleChange("Q2_AN", e.target.value)}
                          value={Q2_AN}
                          onBlur={() => handleBlur("Q2_AN")}
                          onFocus={() => handleFocus("Q2_AN")}
                          maxLength={20}
                          name="Q2_AN"
                        />
                      </div>
                    </>
                  } */}

                    </fieldset>
                    <div class="buttonWrapper d-flex justify-content-center align-items-center mb-3">
                      <div
                        className='mx-3'>
                        <CentraliseButton
                          className="mb-sm-3"
                          type="Button"
                          text="GENERATE & SEND OTP TO EMAIL"
                          onClick={handleGeneratedOTP}
                          variant="#2b6e5b"
                          hoverBgColor="#2b6e5bcf"
                          hoverTextColor="white"
                          fontsize="16px"
                          padding="3px 6px"
                          width="270px"
                        />
                      </div>

                      <div className='mx-3'>
                        <CentraliseButton
                          className="  "
                          type="submit"
                          text="CANCEL"
                          variant="#ab683f"
                          padding="3px 6px"
                           hoverBgColor="#ab683f9e"
                          hoverTextColor="white"
                          onClick={handleBackButtonClick}
                          fontsize="16px"
                          width="100px"
                        />
                      </div>


                      {/* <Link>
                      <button

                        type="submit"
                        id="submitButton"
                        onClick={handleGeneratedOTP}
                        class="submitButton pure-button pure-button-primary">
                        <span>Generate & send OTP to Email</span>
                      </button>
                    </Link> */}
                    </div>
                  </form>
                </CentraliseheaderBody>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword;