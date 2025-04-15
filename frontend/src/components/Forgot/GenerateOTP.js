import { useState, useEffect, useRef } from "react";
import React from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ModalManager from "../GeopicxPopupModals/ModalManager";
import OtpInput from 'react-otp-input';
import CentralizedHeading from "../CentralizeHeading/CentralizedHeading";
import CentraliseButton from "../CentraliseButton/CentraliseButton";
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody";


const GenerateOTP = () => {
  const location = useLocation();
  // const [correctOTP, setCorrectOTP] = useState(null);
  const { userId, userName, isUserType, time } = location.state || {};
  const [spaceErrorn, setSpaceErrorn] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const [buttonLabel, setButtonLabel] = useState("Verify & PROCEED");
  const [otp, setOtp] = useState(() => {
    const savedCount = localStorage.getItem('otpTimeFinish');
    return savedCount ? parseInt(savedCount, 10) : '';
  });
  // const [otpCount, setOtpCount] = useState(0);
  const [otpCount, setOtpCount] = useState(() => {
    const storedOtpCount = localStorage.getItem('otpCount');
    return storedOtpCount !== null ? parseInt(storedOtpCount, 10) : 0;
  });
  const [action, setAction] = useState('');
  const [resendTime, setResendTime] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0); // To force useEffect to run
  const [resendCount, setResendCount] = useState(() => {
    const savedCount = localStorage.getItem('resendCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  }); // To track resend attempts


  // Save the username to localStorage when the component mounts
  useEffect(() => {
    if (userName) {
      localStorage.setItem('username', userName);
    }
  }, [userName]);

  useEffect(() => {
    // console.log(`Resend count updated to: ${resendCount}`);
  }, [resendCount]);

  // Retrieve the username from localStorage
  const [username, setUsername] = useState(() => localStorage.getItem('username') || userName);


  //akshay added code
  const intervalRef = useRef(null); // To store the interval ID

  const startTimer = (endTime) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = Math.max(0, Math.floor((endTime - currentTime) / 1000));

      setTimer(remainingTime);

      if (remainingTime === 0) {
        setOtp(0);
        localStorage.removeItem('otpEndTime');
        localStorage.setItem('RemainingEndTime', remainingTime);
        localStorage.setItem('otpTimeFinish', remainingTime);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
  };

  useEffect(() => {
    // if (resendTime !== null) {
    const endTime = localStorage.getItem('otpEndTime');
    const timefinsh = localStorage.getItem('otpTimeFinish');

    if (endTime && !resendTime) {
      const remainingTime = Math.max(0, Math.floor((endTime - new Date().getTime()) / 1000));
      // console.log("Existing endTime found, remainingTime:", remainingTime);
      setTimer(remainingTime);
      if (remainingTime > 0) {
        startTimer(parseInt(endTime));
      }
    } else {
      if (timefinsh !== "0") {
        if (endTime) {
          const remainingTime = Math.max(0, Math.floor((endTime - new Date().getTime()) / 1000));
          setTimer(remainingTime);
          if (remainingTime > 0) {
            startTimer(endTime);
          }
        } else {
          const newEndTime = new Date().getTime() + time * 60 * 1000;
          setTimer(Math.floor((newEndTime - new Date().getTime()) / 1000));
          startTimer(newEndTime);
          localStorage.setItem('otpEndTime', newEndTime);
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [time, forceUpdate]);


  const handleClick = (event) => {
    event.preventDefault();

    const action = event.currentTarget.getAttribute('data-action');
    if (action === 'verify') {
      updatePassword();
    }
    else if (action === 'resend') {
      if (resendCount >= 3) {
        navigate('/Login');
      } else {
        resendOTP();
      }
    }
    setAction(action);
  };


  const updatePassword = async () => {
    if (!otp) {
      setSpaceErrorn("Field is required");
      return;
    }

    if (otp.length !== 6) {
      setSpaceErrorn("Invalid OTP length");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/update_fo_password/?token=${otp}&USERID=${userId}`
      );

      if (response.status === 200) {
        // setCorrectOTP(data.correctOTP);
        localStorage.clear();
        const UpdatedTime = response.data.time;
        // console.log("updatetiemn....", data)

        ModalManager.success({
          modalHeaderHeading: 'Forget Password',
          modalBodyHeading: 'Success',
          message: "Now reset your password.",
          onConfirm: () => {
            navigate("/UpdatePassword", { state: { userId, otp, UpdatedTime } });
          },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      const isInvalidOTP = error.response?.status === 403 && error.response.data.Message === "Do not MATCH THE CREDENTIAL";
      ModalManager.error({
        modalHeaderHeading: isInvalidOTP ? 'Forget Password' : 'Error',
        modalBodyHeading: 'Error',
        message: isInvalidOTP ? "Invalid OTP" : "Failed to update password",
        confirmButtonText: 'OK',
      });
    }
  };


  const resendOTP = async () => {
    localStorage.removeItem('otpEndTime');
    localStorage.removeItem('otpTimeFinish');
    try {
      const payload = {
        USERNAME: username
      };

      // if (isUserType === 'UU') {
      //   payload.Q1_AN = Q1_AN;
      //   payload.Q2_AN = Q2_AN;
      // }

      const response = await axios.post(`http://127.0.0.1:8000/forget_password/`, payload);
      if (response.status === 200) {

        setOtp('');
        const time = response.data.time;
        setResendTime(time);
        setForceUpdate(prev => prev + 1);

        setResendCount(prevCount => {
          const newCount = prevCount + 1;
          localStorage.setItem('resendCount', newCount);
          return newCount;
        });


        // setButtonLabel("Verify & PROCEED");
        ModalManager.success({
          modalHeaderHeading: 'Forget Password',
          modalBodyHeading: 'Success',
          message: "OTP has been resend successfully.",
          // onConfirm: () => {
          // },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      ModalManager.error({
        modalHeaderHeading: 'Forget Password',
        modalBodyHeading: 'Error',
        message: "Failed to resend OTP. Please try again.",
        confirmButtonText: 'OK',
      });
    }
  };


  const handleInputChange = (otp) => {
    // Filter out non-digit characters
    const filteredValue = otp.replace(/\D/g, '');
    setOtp(filteredValue);
  };


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} sec`;
  };
  const handleClose = () => {
    // Redirect to the login page when the 'X' button is clicked
    navigate("/login");
  };


  return (
    <div style={{
      // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1064161204/photo/mount-rainier-3d-render-topographic-map-color.jpg?s=612x612&w=0&k=20&c=4cyVfQY9V-wSKy0Zx4jHdPRnhImnF9LP6PqqBhbUans=')`,
      // backgroundSize: 'cover',
      // backgroundRepeat: 'no-repeat',
      // backgroundPosition: 'center center',
      // minHeight: '87vh',
    }}>

      <div className="GeCs  mx-2 ">
        <div className="d-flex justify-content-center align-items-center pt-5 " >
          <CentraliseheaderBody
            className="otpPage"
            header="Forgot Password"
            logo="GEOPICX_LOGO.png"
            headerBgColor="rgb(64 37 136)"        // Set your desired header background color
            headerTextColor="white"
            onClose={handleClose}

          //  onClose={handleBackButtonClick}
          >

            <form

            //  className="mx-auto py-auto
            //   OTPFORm mx-2"
            >

              <fieldset className="the-fieldset mb-4">
                <legend className="the-legendSuEditUse">OTP Verification </legend>

                <div class="inputDiv">
                  <label className="Otp-Label">
                    <strong className="text-dark">Enter  OTP&nbsp;</strong>
                    {spaceErrorn && <span className="text-danger font-italic ml-2"
                      style={{ fontSize: "12px", fontWeight: "400" }}>{spaceErrorn}</span>}
                  </label>

                  <div className="Otp-Input-Box">

                    <OtpInput
                      value={otp}
                      onChange={handleInputChange} // handleInputChange will receive the OTP string directly
                      numInputs={6}
                      renderSeparator={<span></span>}
                      renderInput={(props) => (
                        <input
                          {...props}
                          class="Otp-input-field"
                          style={{ textAlign: 'center' }}
                          disabled={buttonLabel === 'Resend OTP' ? true : false}
                        />
                      )}
                    />

                  </div>

                  <span className="Otptime text-center text-danger">
                    {timer > 0 && <p>Time remaining: {formatTime(timer)} seconds {localStorage.getItem('otpCount') === "2" && '(Last attempt you redirected to login page.. )'}</p>}
                  </span>

                </div>
              </fieldset>
              <div class="buttonWrapperMobileView d-flex justify-content-center align-items-center mb-3 mx-auto mt-2">
                {/* <button
                  type="button"
                  className="btn-rounded btn btn-primary"
                  data-action="verify"
                  onClick={handleClick}
                >
                  <span className="Otpbutton">Verify & PROCEED</span>
                </button> */}
                <CentraliseButton
                  className="OtpButtonMobileView"
                  data-action="verify"
                  type="button"
                  text="VERIFY & PROCEED"
                  onClick={handleClick}
                  variant="#2b6e5b"
                  hoverBgColor="#2b6e5bcf"
                  hoverTextColor="white"
                  fontsize="16px"
                  padding="3px 6px"
                  width="160px"
                  disabled={otp === 0} />
                &nbsp;&nbsp;&nbsp;&nbsp;

                <CentraliseButton
                  data-action="resend"
                  className="OtpButtonMobileView"
                  type="button"
                  text="RESEND OTP"
                  onClick={handleClick}
                  variant="#2b6e5b"
                  hoverBgColor="#2b6e5bcf"
                  hoverTextColor="white"
                  fontsize="16px"
                  padding="3px 6px"
                  width="160px"
                />
                {/* <button
                  type="button"
                  className="btn-rounded btn btn-primary"
                  data-action="resend"
                  onClick={handleClick}
                >
                  <span className="Otpbutton">Resend OTP</span>
                </button> */}

              </div>
              {/* <div className=" image p-3">
              <img
                src="logo.png "
                alt="Site Logo"
                width="50"
                height="50"
                style={{ marginTop: "-5px" }}
              />
              <h1 className="LogoForgotOTP font-italic">GeoPicX</h1>
            </div> */}


            </form>
          </CentraliseheaderBody>

        </div>

      </div>
    </div>

  );
};

export default GenerateOTP;
