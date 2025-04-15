import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { faSync, faRedo } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

import Cookies from 'js-cookie';
import CopyRightFooter from '../CopyRightFooter/CopyRightFooter';
import ModalManager from "../GeopicxPopupModals/ModalManager";
import { useDispatch } from 'react-redux';
import { setTokens } from "../StoreContext/apirefresh/authSlice";
import BlockedAdmin from "../BlockedUser/BlockedAdmin";
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody";
import CentraliseButton from "../CentraliseButton/CentraliseButton";

const Login = ({ onLogin }) => {

  const dispatch = useDispatch();


  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [isLogin, setIsLoggedIn] = useState(false);
  const [enteredCaptcha, setEnteredCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState(generateCaptcha());
  const [isCaptchaCorrect, setIsCaptchaCorrect] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageC, setErrorMessageC] = useState("");
  const [perrorMessage, setPerrorMessage] = useState("");
  const [Q1_ID, setQ1_ID] = useState("");
  const [Q2_ID, setQ2_ID] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserID] = useState(null);

  //Dont removed below code its usedful added by akshay
  useEffect(() => {
    localStorage.clear();
  }, []);
  const [captchaStyle, setCaptchaStyle] = useState({
    color: getRandomColor(),
    textDecoration: `line-through ${getRandomColor()}`,
    textDecorationAngle: getRandomAngle()
  });
  function generateCaptcha() {
    const characters = "abcdefghijkmnopqrstuvwxyz0123456789";
    const captcha = Array.from(
      { length: 6 },
      () => characters[Math.floor(Math.random() * characters.length)]
    );
    return captcha.join("");
  }
  const handleCaptchaChange = (e) => {
    setEnteredCaptcha(e.target.value);
    setErrorMessageC("");
  };

  const refreshCaptcha = () => {
    const refreshIcon = document.querySelector('.refresh-icon');
    refreshIcon.classList.add('rotate');

    // Remove the rotation class after the animation completes
    setTimeout(() => {
      refreshIcon.classList.remove('rotate');
    }, 500);
    setGeneratedCaptcha(generateCaptcha());
    setEnteredCaptcha("");
    setIsCaptchaCorrect(false);
    const isCorrect = enteredCaptcha === generatedCaptcha;
    setIsCaptchaCorrect(isCorrect);
    setCaptchaStyle({
      color: getRandomColor(),
      textDecoration: `line-through ${getRandomColor()}`,
      textDecorationAngle: getRandomAngle()
    });
  };
  const validateCaptcha = () => {
    setIsCaptchaCorrect(enteredCaptcha === generatedCaptcha);
  };
  function getRandomColor() {
    const letters = "0123456789abcdefghijkmnopqrstuvwxyz";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 10)];
    }
    return color;
  }

  function getRandomAngle() {
    return `${Math.floor(Math.random() * 8)}deg`; // Random angle between -23 and 23 degrees
  }

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("rememberedUsername");
    const storedPassword = sessionStorage.getItem("rememberedPassword");

    if (storedUsername) {
      setUsername(storedUsername);
      setRememberMe(true);
    }

    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);



  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };



  const loginValidation = () => {
    let isValid = true;
    let errorMessages = { username: "", password: "", captcha: "" };

    if (username.trim() === "") {
      setErrorMessage("Field is required");
      isValid = false;
    }
    if (password.trim() === "") {
      setPerrorMessage("Field is required");
      isValid = false;
    }
    if (enteredCaptcha.trim() === "") {
      setErrorMessageC("Field is required");
      isValid = false;
      refreshCaptcha();
    } else if
      (enteredCaptcha !== generatedCaptcha)
    //  (!isCaptchaCorrect)
    {
      setErrorMessageC("Incorrect captcha");
      isValid = false;
      refreshCaptcha();
    }

    if (!isValid) {
      console.log("Errors:", errorMessages);
    }

    return isValid;
  }
  const [htmlContent, setHtmlContent] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginValidation()) {
      return; // Don't proceed with the API call if validation fails
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login_user/",
        {
          USERNAME: username,
          PASSWORD: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const {
          // message,
          userType,
          username: user_un,
          refresh_token,
          userId,
          departmentType,
        } = response.data;


        const isHtml = /<\/html>/.test(response.data); // Simple check for HTML
        if (isHtml) {
          setHtmlContent(response.data); // Set the HTML content
          //console.log('isHtml.....', isHtml);
        } else {

          dispatch(setTokens({ refreshToken: refresh_token }));
          setUserID(userId);
          if (userType) {
            // sessionStorage.setItem("departmentType", departmentType);
            sessionStorage.setItem("userType", userType);
            sessionStorage.setItem("user_un", user_un);
            sessionStorage.setItem("isLogin", isLogin);
            sessionStorage.setItem("refresh_token", refresh_token);
            sessionStorage.setItem("userId", userId);
            sessionStorage.setItem("departmentType", departmentType);
            setIsLoggedIn(true);

            setTimeout(() => {
              onLogin(userType, user_un, refresh_token, userId, departmentType);
            },)
          }
          dispatch(setTokens({ refreshToken: refresh_token }));
          if (rememberMe) {
            Cookies.set('rememberedUsername', username, { expires: 7 });
            Cookies.set('rememberedPassword', password, { expires: 7 });
          } else {
            Cookies.remove('rememberedUsername');
            Cookies.remove('rememberedPassword');
          }

          ModalManager.success({
            modalHeaderHeading: 'Login',
            modalBodyHeading: 'Success',
            message: `${username} (${userType === 'AU' ? (departmentType === 'WCADMIN' ? 'WCAU' : 'UDAU') : userType}) Logged In Successfully`,
            confirmButtonText: 'OK',
          });
        }
      }
    } catch (error) {

      if (error.response && error.response.data) {
        const message = error.response.data.errors;
        setSubmitStatus("CAPTCHA verification failed.");
        ModalManager.warning({
          modalHeaderHeading: 'Login',
          modalBodyHeading: 'Warning',
          message: ` ${message}`,
          confirmButtonText: 'OK',
        });
        refreshCaptcha();
      }
      else if (error.response.status === 500) {
        const errorMessage = "An internal server error occurred. Please try again later.";
        ModalManager.error({
          modalHeaderHeading: 'Server Error',
          modalBodyHeading: 'Error 500',
          message: errorMessage,
          confirmButtonText: 'OK',
        });
      }
    }
  };


  // forgot password
  const handleForgotPassword = async () => {
    if (username.trim() === "") {
      setErrorMessage("Username is required for password recovery");
      setErrorMessageC("");
      setPerrorMessage("");
      return;
    }
    const enusername = encodeURIComponent(username);
    localStorage.clear();


    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/forget_password/?USERNAME=${enusername}`,
      );
      const {
        USER_TYPE: USER_TYPE,
        USERNAME: USERNAME,
        EMAIL: EMAIL,
        USERID,
        Q1_ID,
        Q2_ID,
      } = response.data;

      setUsername(username);
      setEmail(EMAIL);
      setQ1_ID(Q1_ID);
      setQ2_ID(Q2_ID);

      const data = {
        username: USERNAME,
        email: EMAIL,
        userType: USER_TYPE,
        userId: USERID,
        Q1_ID: Q1_ID,
        Q2_ID: Q2_ID,
      };

      // navigate("/ForgotPassword", {
      //   state: {
      //     username: USERNAME, email: EMAIL, userType: userType, USERID: USERID,
      //     Q1_ID: Q1_ID,
      //     Q2_ID: Q2_ID,
      //   },
      // });

      // Save data to localStorage
      localStorage.setItem('componentBData', JSON.stringify(data));
      navigate('/ForgotPassword');


    } catch (error) {
      const { data } = error.response;
      if (error.response.status === 403) {
        setErrorMessage("You are not Approved by the Admin");
        setErrorMessageC("");
        setPerrorMessage("");
      } else if (error.response.status === 400) {
        setErrorMessage(data.errors);
        setErrorMessageC("");
        setPerrorMessage("");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const rememberedUsername = Cookies.get('rememberedUsername');
    const rememberedPassword = Cookies.get('rememberedPassword');
    if (rememberedUsername && rememberedPassword) {
      setUsername(rememberedUsername);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  if (htmlContent) {
    return <BlockedAdmin htmlContent={htmlContent} />;
  }

  return (
    <div class="login-main-div">
      <div class="Login-bg-img">
        <ToastContainer />

        <div className="row align-items-center loginwraper py-auto">
          <div className=" co-12  col-md-5 my-about col-geopicx-6 ">
            {/* <div class="card border-0 "> */}
            <div class="para-body mt-5">
              <strong className="d-flex justify-content-left  WelcomHome mx-4">WELCOME TO ....</strong>
              <div className="d-flex justify-content-left mx-4  mb-0 p-0">

                <img src="GEOPICX_LOGO.png" className="mt-3" alt="Site Logo" width="40" height="40" />

                <h1 className="GeopicsHeadingLogin p-0 mb-0">GeoPicX</h1>
                {/* <span className="d-flex justify-content-center text-primary Gateway ml-5 mt-0 pt-0">GeoPicX: Your gateway to transformative geospatial intelligence and cutting-edge satellite imagery.</span> */}

                {/*  */}
              </div>
              <span className="d-flex justify-content-left mx-4  GatewayLogin  mt-0 pt-0 text-left"> Your gateway to transformative geospatial intelligence and cutting-edge satellite imagery.</span>
              <div>
                <p className="text-justify mx-4 geopicx_deatils_text mt-5">
                  GeoPicX is a web-based platform and an online gateway that provides access to geospatial information, data, and services through a systematic process of spatial world data collection, storage and analysis. It serves as a centralized hub for discovering, accessing, and managing data both in the form of spatial (geographic information system (GIS) resources) and nonspatial data (Management Information System (MIS). GeoPicX is designed to facilitate the exploration and utilization of spatial data for various purposes, including research, analysis, decision-making, and public information. <br></br><br></br>

                  GeoPicX will be used by a variety of stakeholders, including government agencies, researchers, businesses, and the general public. It plays a crucial role in promoting the availability and accessibility of geospatial information (location-based information), contributing to informed decision-making and fostering collaboration in the field of geographic information systems.
                </p>
                {/* <div className="mt-5">
                  <div><strong className="d-flex justify-content-center align-items-center HighlighthomeSpan">Developed by </strong>
                    <p className="d-flex justify-content-center align-items-center BlowSpan">  Micronet Solutions, Nagpur</p>
                  </div>
                  <div><strong className="d-flex justify-content-center align-items-center HighlighthomeSpan">Office </strong>
                    <p className="d-flex justify-content-center align-items-center BlowSpan"> Plot No. 80, Khare Tarkunde Nagar, Katol Road, Nagpur – 440013, Maharashtra   </p>
                  </div>
                </div> */}

              </div>
              {/* <span
                className=" geopicx-heading p-4 mt-5 "
              >
                GeoPicX
              </span> */}
              {/* <motion.p
                animate={{ x: 1, scale: 1 }}
                initial={{ scale: 0 }}
                transition={{ duration: 2, delay: 1 }}
                className="contactText" >
             
                GeoPicX is a web-based platform and an online gateway that provides access to geospatial information, data, and services through a systematic process of spatial world data collection, storage and analysis. It serves as a centralized hub for discovering, accessing, and managing data both in the form of spatial (geographic information system (GIS) resources) and nonspatial data (Management Information System (MIS). GeoPicX is designed to facilitate the exploration and utilization of spatial data for various purposes, including research, analysis, decision-making, and public information.
              </motion.p> */}

              {/* <motion.p>
                GeoPicX will be used by a variety of stakeholders, including government agencies, researchers, businesses, and the general public. It plays a crucial role in promoting the availability and accessibility of geospatial information (location-based information), contributing to informed decision-making and fostering collaboration in the field of geographic information systems.
              </motion.p> */}
            </div>

          </div>
          <div class="vertical "></div>

          <div className=" col-12 col-sm-12 col-md-6 d-flex  justify-content-center align-items-center justify-content-lg-center  justify-content-sm-center col-geopicx-4 ">
            <div className="form ">
              {/* <div className="image p-3 ">
                <img
                  src="LoginPage_LOGO_10k_purple.svg "
                  alt="Site Logo"
                  width="35"
                  height="35"
                  className="mr-2"
                />
                <h6 className="text-heading">Login</h6>
                <span className=" loginclose" onClick={handleClose} style={{ marginLeft: "300px", cursor: "pointer" }}>< FontAwesomeIcon icon={faXmark} /></span>
              </div> */}
              <CentraliseheaderBody
                header="Login"
                logo='LoginPage_LOGO_10k_purple.svg'
                headerBgColor="rgb(64 37 136)"        // Set your desired header background color
                headerTextColor="white"
                onClose={handleClose}
              >
                <form className="px-4 pt-4 pb-lg-4 pb-md-4 ">
                  {/* <div> */}
                  <div className="form-group pb-2">
                    <label className="text-dark">
                      <span className="required-field">*</span>
                      User Name
                      <span className="error-message">
                        {errorMessage && (
                          <span>
                            {errorMessage.toString()}
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      onChange={(e) => {
                        setErrorMessage("");
                        setUsername(e.target.value);
                      }}
                      value={username}
                      placeholder="Enter User Name"
                      className={`form-control inp_text  input-container ${errorMessage ? "is-invalid" : ""
                        }`}
                      id="username"
                      required
                      maxLength="20"
                      title="Username should be alphanumeric with a maximum of 20 characters"
                    />
                    <div className="tooltip-text">
                      Username should be alphanumeric with a maximum of 20 characters
                    </div>
                  </div>
                  <div className="form-group pb-2">
                    <label className="text-dark">
                      <span className="required-field">*</span>
                      Password
                      <span className="error-message">
                        {perrorMessage && (
                          <span className="">
                            {perrorMessage.toString()}
                          </span>
                        )}
                      </span>
                    </label>
                    <div className="mb-0">
                      <div className="input-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          onChange={(e) => {
                            setPerrorMessage("");
                            setPassword(e.target.value);
                          }}
                          value={password}
                          id="password"
                          placeholder="Enter Password"
                          className={`form-control ${perrorMessage ? "is-invalid" : ""}`}
                          required
                          maxLength="40"
                        />
                        <span className="password-icon text-dark">
                          <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash}
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer' }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="pb-3">
                    <label
                      className="text-dark" >
                      <span className="required-field">*</span>
                      Enter Captcha Here
                      <span className="error-message">
                        {errorMessageC && (
                          <span className="">{errorMessageC}</span>
                        )}
                      </span>
                    </label>
                    <div class="Captchwraper">

                      <div class="">
                        <input
                          id="captcha"
                          placeholder="Enter Captcha"
                          className=" text-center  py-2 mx-auto text-dark "
                          type="text"
                          value={enteredCaptcha}
                          onChange={handleCaptchaChange}
                          onBlur={validateCaptcha}
                          maxLength="6"
                          style={{ paddingLeft: "0px", paddingRight: "0px", letterSpacing: ".1px", width: "89%", borderRadius: "4px" }}
                        />
                      </div>

                      <div class=" w-50 h-100 ">
                        <div class="input-group-prepend CaptchaForFill m-0 p-0">

                          <div className=" CaptchTextCenter m-0 p-0 text-sm-center text-md-center w-100 h-100">
                            <p className=" text-center  paragraphofcaptcha  p-0"
                              style={{
                                color: captchaStyle.color,
                                textDecoration: captchaStyle.textDecoration,
                                transform: `rotate(${captchaStyle.textDecorationAngle})`
                              }}>
                              {generatedCaptcha}
                            </p>
                          </div>

                          {enteredCaptcha.length >= 6 &&
                            enteredCaptcha !== generatedCaptcha && (
                              <span className="text-danger CaptchaMessage">
                              </span>
                            )}

                        </div>

                      </div>
                      <span class="input-group-text bg-transparent refresh border-0" >
                        <FontAwesomeIcon
                          // icon={faRedo}
                          icon={faSync}
                          onClick={refreshCaptcha}
                          className="refresh-icon ml-3"
                        /></span>
                    </div>
                  </div>


                  {/* _____________________________________________________________ */}

                  <div className="remeberWraper ">
                    <div className="LoginRememberme">
                      <input className="form-check-input  " value="lsRememberMe" onChange={handleRememberMeChange} checked={rememberMe} type="checkbox" id="rememberMe" />
                      <label className="check-labels mb-0 mt-0 LoginRememberme" for="flexCheckDefault">
                        Remember Me
                      </label>
                    </div>

                    <div className=" LoginForgotDisplay " style={{ visibility: "hidden", }}>
                      <Link
                        onClick={handleForgotPassword}
                      >
                        <label className="LoginForgot  mb-0 mt-0">Forgot Password?</label>
                      </Link>
                    </div>
                    <div className=" LoginForgot">
                      <Link
                        onClick={handleForgotPassword}
                      >
                        <label className="LoginForgot  mb-0 mt-0">Forgot Password?</label>
                      </Link>
                    </div>
                  </div>


                  <div className="row mx-0 mt-lg-4 mt-md-5 p-0">
                    <div className="col-5 col-md-5 col-sm-6 my-2 p-0 ">
                      <Link to="#" className="mr-3 ">
                        {/* <button
                          type="submit"
                          className="btn btn-primary w-100 "
                          id="buttonId"
                          onClick={handleLogin}
                        >
                          Login
                        </button> */}


                        <CentraliseButton
                          className="ml-lg-5 ml-md-5 my-sm-2 mobileviewbuttonlogin"
                          type="submit"
                          text="LOGIN"
                          onClick={handleLogin}
                          variant="#026d02"
                          padding="4px 10px"
                          hoverBgColor="#2b6e5bcf"
                          hoverTextColor="white"
                          width="100px"
                          fontsize="15px"
                        />
                      </Link>
                    </div>
                    <div className=" col-7 col-md-7 col-sm-6 my-2 p-0  ">
                      <Link to="/Signup" className=" ml-3 ">

                        {/* <button
                            type="button"
                            className="btn btn-primary w-100 "
                            id="buttonId"
                          >
                            Sign-Up/Register
                          </button> */}

                        <CentraliseButton
                          className="ml-lg-5 ml-md-5  my-sm-2 mobileviewbuttonlogin"
                          type="submit"
                          text="SIGN-UP / REGISTER"
                          onClick={() => { }}
                          variant="#026d02"
                          padding="4px 10px"
                          hoverBgColor="#2b6e5bcf"
                          hoverTextColor="white"
                          // width="300px"
                          fontsize="15px"
                        />
                      </Link>
                    </div>
                  </div>
                </form>

              </CentraliseheaderBody>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
