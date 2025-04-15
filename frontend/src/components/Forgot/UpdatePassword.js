import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Preloader from "../Preloader/Preloader";
import MaxLengthErrorMessage from "../MaxLengthErrorMessage/MaxLengthErrorMessage"
import ModalManager from "../GeopicxPopupModals/ModalManager";
import PasswordStrengthBar from "react-password-strength-bar";
import FormInputGroup from "../../ReuseCompomenent/FormInputGroup";
import CustomPasswordStrengthBar from "../../ReuseCompomenent/CustomPasswordStrengthBar";
import CentraliseheaderBody from '../Centraliseheaderbody/CentraliseheaderBody';
import CentraliseButton from '../CentraliseButton/CentraliseButton';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(0);
  const [npasswordError, setNpasswordError] = useState("");
  const { userId, otp, UpdatedTime } = location.state || {};
  const [NEW_PASSWORD, setNEW_PASSWORD] = useState("");
  const [PASSWORD, setPASSWORD] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updatedTime, setUpdatedTime] = useState(() => {
    const savedCount = localStorage.getItem('resetUpdatedtime');
    return savedCount ? parseInt(savedCount, 10) : UpdatedTime;
  });

  const [touched, setTouched] = useState({
    PASSWORD: false,
    CONFIRM_PASSWORD: false,
    OLD_PASSWORD: false,
  });

  const [errors, setErrors] = useState({
    PASSWORD: "",
    CONFIRM_PASSWORD: "",
    OLD_PASSWORD: "",
  });

  const initialFormState = {
    PASSWORD: "",
    CONFIRM_PASSWORD: "",
  };

  const [formData, setFormData] = useState(initialFormState);


  //Akshay added code below
  useEffect(() => {

    // console.log("remainTime....", remainTime);
    const endTime = localStorage.getItem('otpEndTime');
    if (endTime) {
      const remainingTime = Math.max(0, Math.floor((endTime - new Date().getTime()) / 1000));
      setTimer(remainingTime);
      if (remainingTime > 0) {
        startTimer(endTime);
      }
    } else {
      // const newEndTime = new Date().getTime() + 5 * 60 * 1000; // 20 seconds from now
      // localStorage.setItem('otpEndTime', newEndTime);
      // setTimer(newEndTime);
      // startTimer(newEndTime);
      if (updatedTime) {
        const minutes = Number(Object.keys(updatedTime)[0]) || 0;
        const seconds = Number(Object.values(updatedTime)[0]) || 0;
        const totalMilliseconds = (minutes * 60 + seconds) * 1000;

        // Use the time from data if available, otherwise default to 5 minutes
        const newEndTime = new Date().getTime() + (totalMilliseconds > 0 ? totalMilliseconds : 5 * 60 * 1000);
        localStorage.setItem('otpEndTime', newEndTime);
        setTimer(Math.floor((totalMilliseconds > 0 ? totalMilliseconds : 5 * 60 * 1000) / 1000)); // Initialize timer to the specified time or 5 minutes
        startTimer(newEndTime);
      }
    }
  }, []);


  const startTimer = (endTime) => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((endTime - currentTime) / 1000));

      setTimer(remainingTime);

      if (remainingTime === timer) {
        clearInterval(interval);
        localStorage.removeItem('otpEndTime');
        navigate("/Login")
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} sec`;
  };

  //end

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

  const handleForm = async (event) => {
    event.preventDefault();

    if (updatedTime === 0) {
      console.log("ssdsdsS");
      ModalManager.error({
        modalHeaderHeading: 'Forget Password',
        modalBodyHeading: 'Error',
        message: 'Link is Expired',
        confirmButtonText: 'OK',
      });

      return;
    }

    setTouched({
      PASSWORD: true,
      OLD_PASSWORD: true,
      CONFIRM_PASSWORD: true,
    });

    // Check for errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value)
    );

    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.PASSWORD &&
      formData.CONFIRM_PASSWORD
    ) {
      const initialValues = {
        token: otp,
        USERID: userId,
        PASSWORD: formData.PASSWORD,
        NEW_PASSWORD: formData.CONFIRM_PASSWORD,
      };

      try {
        LoaderUpdateProgress();
        if (PASSWORD !== NEW_PASSWORD) {
          setNpasswordError("Passwords do not match.");
          return;
        }

        const response = await axios.patch(
          "http://127.0.0.1:8000/update_fo_password/", initialValues

        );

        if (response.status === 200) {
          localStorage.removeItem('otpEndTime');

          localStorage.setItem('resetUpdatedtime', 0);


          ModalManager.success({
            modalHeaderHeading: 'Forget Password',
            modalBodyHeading: 'Success',
            message: "Password updated successfully",
            onConfirm: () => {
              navigate('/Login');
            },
            confirmButtonText: 'OK',
          });
        }
      } catch (error) {
        console.error("Failed to update password:", error.message);
        ModalManager.error({
          modalHeaderHeading: 'Forget Password',
          modalBodyHeading: 'Error',
          message: error.message,
          confirmButtonText: 'OK',
        });

      } finally {
        setLoading(false);
        setProgress(100);
      }
    } else {
      setErrors(filteredErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const letterRegex = /^[A-Za-z]*$/;
    const emailRegex = /^[a-z0-9.@]*$/;
    const usernameRegex = /[^@%&*_\-a-zA-Z0-9]/g;

    if (
      name === "FIRST_NAME" ||
      name === "MIDDLE_NAME" ||
      name === "LAST_NAME"
    ) {
      if (!letterRegex.test(value)) {
        return;
      }

      const formattedValue =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: formattedValue,
      }));

      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      return;
    }

    if (name === "EMAIL") {
      if (!emailRegex.test(value.toLowerCase())) {
        return;
      }

      const formattedValue = value.toLowerCase();

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: formattedValue,
      }));

      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      return;
    }

    if (name === "USERNAME") {
      if (usernameRegex.test(value)) {
        return;
      }
    }

    if (name === "MOBILE_NO") {
      if (value.charAt(0) === "0" || !/^\d*$/.test(value)) {
        return;
      }
    }

    if (name === "PASSWORD" || name === "CONFIRM_PASSWORD") {
      const filteredValue = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "");

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: filteredValue,
      }));

      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleChangeError = (name, error) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleBackButtonClick = () => {
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div className=""
      // style={{
      //   backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1064161204/photo/mount-rainier-3d-render-topographic-map-color.jpg?s=612x612&w=0&k=20&c=4cyVfQY9V-wSKy0Zx4jHdPRnhImnF9LP6PqqBhbUans=')`,
      //   backgroundSize: 'cover',
      //   backgroundRepeat: 'no-repeat',
      //   backgroundPosition: 'center center',
      //   minHeight: '87vh',
      //   width: '100%'
      // }}
      >
      <Preloader loading={loading} progress={progress} />
      <div className="d-flex justify-content-center align-items-center ">

        <form className="mx-auto  uforms ">
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
          // class="mainDiv"
          >

            <div
            // class="cardStyle"
            >
              <CentraliseheaderBody
                className="mt-5"
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
                  className="resetForm"
                >
                  <fieldset className="the-fieldset mb-4">
                    {/* <h2 class="formTitle">Generate Password</h2> */}
                    <legend className="the-legendSuEditUse">Generate Password</legend>
                    <div className="mx-3">
                      <FormInputGroup
                        label="New Password"
                        required
                        value={formData.PASSWORD}
                        type="password"
                        onBlur={handleBlur}
                        onblur={touched.PASSWORD}
                        maxLength={40}
                        onChangeError={(error) =>
                          handleChangeError("PASSWORD", error)
                        }
                        onChange={handleChange}
                        errorMessage={errors.PASSWORD}
                        name="PASSWORD"
                        touched={touched.PASSWORD}
                        inputType="password"
                        placeHolder="New Password"
                      />

                      <div class="form-group mb-1 mx-4">
                        <CustomPasswordStrengthBar
                          className="mb-0"
                          password={formData.PASSWORD}
                        />
                      </div>

                      <FormInputGroup
                        label="Confirm Password"
                        required
                        value={formData.CONFIRM_PASSWORD}
                        type="confirm_password"
                        onBlur={handleBlur}
                        onblur={touched.CONFIRM_PASSWORD}
                        maxLength={40}
                        onChangeError={(error) =>
                          handleChangeError("CONFIRM_PASSWORD", error)
                        }
                        onChange={handleChange}
                        errorMessage={errors.CONFIRM_PASSWORD}
                        name="CONFIRM_PASSWORD"
                        touched={touched.CONFIRM_PASSWORD}
                        inputType="password"
                        placeHolder="Confirm Password "
                        password={formData.PASSWORD}
                      />
                    </div>

                    <span className="text-center text-center-size text-danger">
                      {timer > 0 && <p>Time remaining: {formatTime(timer)} left</p>}
                    </span>


                  </fieldset>
                  <div class="buttonWrapper mx-5 mb-4 d-flex justify-content-center align-items-center">
                    {/* <button
                    onClick={handleForm}
                    type="button"
                    id="submitButton"
                    class="submitButton pure-button pure-button-primary"
                  >
                    <span>Submit</span>
                    <span></span>
                  </button> */}
                    <CentraliseButton
                      className=""
                      type="button"
                      text="SUBMIT"
                      onClick={handleForm}
                      variant="#2b6e5b"
                      hoverBgColor="#2b6e5bcf"
                      hoverTextColor="white"
                      fontsize="16px"
                      padding="3px 6px"
                      width="160px"
                    />
                    <span className="text-center text-danger">

                    </span>
                  </div>

                </form>
              </CentraliseheaderBody>

            </div>
          </div>
        </form>
      </div>

    </div>
  );
};

export default UpdatePassword;
