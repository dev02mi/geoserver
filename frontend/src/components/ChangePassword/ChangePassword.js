import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { css } from "@emotion/react";
import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons";
import FormInputGroup from "../../ReuseCompomenent/FormInputGroup";
import Preloader from "../Preloader/Preloader";
import ModalManager from "../GeopicxPopupModals/ModalManager";
import CustomPasswordStrengthBar from "../../ReuseCompomenent/CustomPasswordStrengthBar";
import "./ChangePassword.css"
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody";
import CentraliseButton from "../CentraliseButton/CentraliseButton";


const ChangePassword = ({ refreshToken, THEME_OPT, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const departmentType = sessionStorage.getItem('departmentType');

  // Parse the query parameters
  const params = new URLSearchParams(location.search);

  // Get the username from the query parameters
  const username = params.get("username");

  const userType = params.get("userType");


  // const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#36D7B7");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordErrorn, setPasswordErrorn] = useState("");
  const [passwordErrorold, setPasswordErrorold] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // useEffect(() => {

  //   const storedUsername = sessionStorage.getItem('username');
  //   if (storedUsername) {
  //     setUsername(storedUsername);
  //   }
  // }, []);

  const initialFormState = {
    PASSWORD: "",
    CONFIRM_PASSWORD: "",
    OLD_PASSWORD: "",
  };

  const [formData, setFormData] = useState(initialFormState);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // if (formData.OLD_PASSWORD === value) {
    //   return;
    // }

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

  const handleForm = async (event) => {
    event.preventDefault();

    setTouched({
      PASSWORD: true,
      OLD_PASSWORD: true,
      CONFIRM_PASSWORD: true,
    });

    // Check for errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value)
    );
    console.log(filteredErrors, "filteredErrors");

    if (
      Object.keys(filteredErrors).length === 0 &&
      username &&
      formData.OLD_PASSWORD &&
      formData.PASSWORD &&
      formData.CONFIRM_PASSWORD
    ) {
      const initialValues = {
        USERNAME: username,
        PASSWORD: formData.PASSWORD,
        NEW_PASSWORD: formData.CONFIRM_PASSWORD,
        OLD_PASSWORD: formData.OLD_PASSWORD,
      };

      try {
        const confirmAction = await ModalManager.confirm({
          modalHeaderHeading: 'Change Password',
          modalBodyHeading: 'Confirmation',
          message: 'Are you sure you want to proceed?',
          confirmButtonText: 'OK',
          showCancelButton: true,
        });
        if (!confirmAction.isConfirmed) {
          return; // Do not proceed with API call if not confirmed
        }
        setLoading(true);
        setProgress(0);
        // Simulating progress
        const steps = 10; // Define the number of steps
        const stepDuration = 500; // Define the duration for each step (in milliseconds)
        for (let i = 1; i <= steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration));
          const progressPercentage = (i / steps) * 100;
          setProgress(progressPercentage);
        }
        // setIsLoading(true);
        // Make a POST request to the change password API
        const response = await axios.patch(
          "http://127.0.0.1:8000/change_password/", initialValues,

        );

        // Handle the response
        if (response.status === 200) {
          ModalManager.success({
            modalHeaderHeading: "Change Password",
            modalBodyHeading: "Success",
            message: "Your password has been changed successfully & Your user credentials have been temporarily logged out ",
            // redirectTo: '/Login' // Specify the URL to redirect to
            onConfirm: () => {
              sessionStorage.clear();
              navigate("/Login");
            },
            confirmButtonText: "OK",
          }).then(() => {
            sessionStorage.removeItem("userType", userType);
            sessionStorage.removeItem("userToken");
            sessionStorage.removeItem("refresh_token", refreshToken);
            sessionStorage.removeItem("userName", userName);
            sessionStorage.removeItem("THEME_OPT", THEME_OPT);
            sessionStorage.removeItem("isApplication");
            // navigate("/Login");
            window.location.href = "/Login";
          });
        } else {
          // Handle other status codes if needed
          setErrorMessage("Failed to change password. Please try again.");
          setSuccessMessage("");
        }
      } catch (error) {
        if (error.response) {
         //console.error("Error response:", error.response.data);

          ModalManager.error({
            modalHeaderHeading: "Change Password",
            modalBodyHeading: "Error",
            message: error.response.data.errors,
            // redirectTo: '/Login' // Specify the URL to redirect to

            confirmButtonText: "OK",
          });
        }
        // Handle errors
        console.error("Error changing password:", error);
      } finally {
        // Set isLoading to false after the API call is complete
        // setIsLoading(false);
        setLoading(false);
        setProgress(100);
      }
    } else {
      setErrors(filteredErrors);
      console.log("Form contains errors", filteredErrors);
    }
  };

  const [showMaxLengthError1, setShowMaxLengthError1] = useState(false);

  useEffect(() => {
    if (newPassword && password && newPassword !== password) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  }, [newPassword, password]);


  const redirectToLogin = () => {
    // Redirect to the login page when the 'X' button is clicked
    navigate("/login");
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Change the background color periodically
      setBackgroundColor(generateRandomColor());
    }, 1000);

    // Cleanup the interval when the component unmounts or loading stops
    return () => clearInterval(intervalId);
  }, [isLoading]);

  const generateRandomColor = () => {
    // Function to generate a random color (you can replace this with your logic)
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // };
  const handleBackButtonClick = () => {
    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div
      // style={{
      //   backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1064161204/photo/mount-rainier-3d-render-topographic-map-color.jpg?s=612x612&w=0&k=20&c=4cyVfQY9V-wSKy0Zx4jHdPRnhImnF9LP6PqqBhbUans=')`,
      //   backgroundSize: "cover",
      //   backgroundRepeat: "no-repeat",
      //   backgroundPosition: "center center",
      //   minHeight: "87vh",
      // }}
    >

      {/* <div className=" registrationBack">
      <button className="registrationButton" onClick={handleBackButtonClick}>
        <FontAwesomeIcon
          className="Iconnextandprevious"
          icon={faAngleDoubleLeft}
        />
        Back
      </button>
    </div> */}

      <div className=" mx-4 text-dark">
        <Preloader loading={loading} progress={progress} />

        <div>
          {/* <div className=" image p-3">
            <img
              src="logo.png "
              alt="Site Logo"
              width="50"
              height="50"
              style={{ marginTop: "-5px" }}
            />
            <h1 className="changepass-LogoForgot font-italic">GeoPicX</h1>
          </div> */}
          <div className="d-flex justify-content-center align-items-center pt-5">
            <div
            //  class="Change-pass-cardStyle"
            >
              <CentraliseheaderBody
                header="Change Password"
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
                  className="changepass-resetForm"
                >
                  <fieldset className="the-fieldset mb-4">
                    <legend className="the-legendSuEditUse">Create Your Password </legend>
                    {/* <div class="d-flex justify-content-center">
                  <h2 class="formTitle-changepass mt-0">Change Password</h2>
                </div> */}

                    <div className="closeButton" onClick={redirectToLogin}>
                      {/* You can replace this with an 'X' icon or any other close symbol */}
                      {/* <span
                        classname="changepass-CloseSign"
                        style={{
                          position: "absolute",
                          color: "red",
                          fontWeight: "1000",
                          top: "1px",
                          right: "7px",
                          cursor: "pointer",
                        }}
                      >
                        X
                      </span> */}
                    </div>

                    <div class="d-flex justify-content-center mt-2">
                      <h5 className=" text-center text-cp m-0 p-0 ">
                        Hello {username} ({userType === 'AU' ? (departmentType === 'WCADMIN' ? 'WCAU' : 'UDAU') : userType}) User
                      </h5>
                    </div>

                    <div class="form-group mx-4">
                      <FormInputGroup
                        label="Old Password"
                        required
                        type="oldpassword"
                        value={formData.OLD_PASSWORD}
                        onBlur={handleBlur}
                        onblur={touched.OLD_PASSWORD}
                        maxLength={40}
                        onChangeError={(error) =>
                          handleChangeError("OLD_PASSWORD", error)
                        }
                        onChange={handleChange}
                        errorMessage={errors.OLD_PASSWORD}
                        name="OLD_PASSWORD"
                        touched={touched.OLD_PASSWORD}
                        inputType="password"
                        placeHolder="Old Password"
                      />

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

                      <div class="form-group Confirmpassword mx-4">
                        <CustomPasswordStrengthBar
                          className="mb-0"
                          password={formData.PASSWORD}
                        />
                      </div>

                      <FormInputGroup
                        className="mt-0"
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
                        placeHolder="Confrim Password "
                        password={formData.PASSWORD}
                      />

                    </div>
                  </fieldset>

                  <div className="changepass_btn_div d-flex justify-content-center align-items-center">
                  <CentraliseButton
                      className=""
                      type="submit"
                      text="SUBMIT"
                      onClick={handleForm}
                      variant="#2b6e5b"
                      hoverBgColor="#2b6e5bcf"
                      hoverTextColor="white"
                      fontsize="16px"
                      padding="3px 6px"
                      width="150px"
                    />
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
                    
                    {/* <button
                      //onClick={handleResetPassword}
                      type="submit"
                      id="submitButton"
                      onClick={handleForm}
                      //onSubmit={handleChangePassword}
                      //onclick="validateSignupForm()"
                      class="submitButton-changepass py-2 w-50"
                    >
                      <span>Submit</span>
                      <span></span>
                    </button> */}

                    {/* <div className=" registrationBack"> */}
                    {/* <button className="Backbutton-changepass py-2 w-50"
                      onClick={handleBackButtonClick}> */}
                    {/* <FontAwesomeIcon
                    className="Iconnextandprevious"
                    icon={faAngleDoubleLeft}
                  /> */}
                    {/* Cancel */}
                    {/* </button> */}
                    {/* </div> */}
                  </div>


                  <div>
                    <ol className="text-success changepass-Info">
                      <li className="m-0 p-0 text-left">
                        Must be at least 8 characters long.
                      </li>
                      <li className="m-0 p-0 text-left">
                        Must include special characters like <b>!@#$%^&*</b>
                      </li>
                      <li className="m-0 p-0 text-left">
                        Must include  numbers.
                      </li>
                      <li className="m-0 p-0 text-left">
                        Must include at least one uppercase letter and one lowercase letter.
                      </li>
                    </ol>
                  </div>


                </form>
              </CentraliseheaderBody>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
