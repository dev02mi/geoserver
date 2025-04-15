import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import PasswordStrengthBar from "react-password-strength-bar";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import PhoneInput from "react-phone-number-input/input";
import Input from "react-phone-number-input/input";
import SuccessModal from "../Modal/SuccessModal";
import { css } from "@emotion/react";
import MaxLengthErrorMessage from "../MaxLengthErrorMessage/MaxLengthErrorMessage";
import { FadeLoader } from "react-spinners";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Preloader from "../Preloader/Preloader";
import "./Registration.css";
// import useValidation from '../Custom_Validations/useValidation';
import ModalManager from "../GeopicxPopupModals/ModalManager";
import CentraliseButton from "../CentraliseButton/CentraliseButton";
import FormInputGroup from "../../ReuseCompomenent/FormInputGroup";
import SelectBox from "../../ReuseCompomenent/SelectBox";
import { Country, State, City } from 'country-state-city';
import CustomPasswordStrengthBar from "../../ReuseCompomenent/CustomPasswordStrengthBar";
Modal.setAppElement("#root");
//  bhushan is mad

const General = () => {


  const countryCodes = [

    { code: '+91', name: 'India' },

  ];
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);
  const [selectedCountry, setSelectedCountry] = useState('');

  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);

  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  }


  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();




  const initialFormState = {

    USERNAME: '',
    EMAIL: '',
    MOBILE_NO: '',
    PASSWORD: '',
    COUNTRY: ""

  };

  const [formData, setFormData] = useState(initialFormState);

  const [touched, setTouched] = useState({

    USERNAME: false,
    EMAIL: false,
    MOBILE_NO: false,
    PASSWORD: false,
    COUNTRY: false

  });


  const [errors, setErrors] = useState({

    USERNAME: "",
    EMAIL: "",
    MOBILE_NO: "",
    PASSWORD: "",
    COUNTRY: ""

  });

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData({
      ...formData,
      COUNTRY: country,
      STATE: '',
      CITY: '',
    });
    setSelectedState('');
    setCities([]);

    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: 'State is required',
      CITY: 'City is required',
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      STATE: true,
      CITY: true,
    }));
  }
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setFormData({
      ...formData,
      STATE: state,
      CITY: '',
    });
    setCities(City.getCitiesOfState(selectedCountry, state));
  };




  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   console.log(value,"______",name)

  //   const letterRegex = /^[A-Za-z]*$/;
  //   const emailRegex = /^[a-z0-9.@]*$/;
  //   const usernameRegex = /[^@%&*_\-a-zA-Z0-9]/g;

  //   if (name === 'FIRST_NAME' || name === 'MIDDLE_NAME' || name === 'LAST_NAME') {
  //     if (!letterRegex.test(value)) {
  //       return;
  //     }

  //     const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [name]: formattedValue,
  //     }));

  //     setTouched((prevTouched) => ({
  //       ...prevTouched,
  //       [name]: true,
  //     }));

  //     return;
  //   }

  //   if (name === 'EMAIL') {
  //     if (!emailRegex.test(value.toLowerCase())) {
  //       return;
  //     }

  //     const formattedValue = value.toLowerCase();

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [name]: formattedValue,
  //     }));

  //     setTouched((prevTouched) => ({
  //       ...prevTouched,
  //       [name]: true,
  //     }));

  //     return;
  //   }

  //   if (name === 'USERNAME') {
  //     if (usernameRegex.test(value)) {
  //       return;
  //     }
  //   }

  //   if (name === 'MOBILE_NO') {

  //     if (value.charAt(0) === '0' || !/^\d*$/.test(value)) {

  //       return;
  //     }
  //   }

  //   if (name === 'PASSWORD' || name === 'CONFIRM_PASSWORD') {
  //     const filteredValue = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "");


  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [name]: filteredValue,
  //     }));

  //     setTouched((prevTouched) => ({
  //       ...prevTouched,
  //       [name]: true,
  //     }));

  //     return;
  //   }

  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: value,
  //   }));

  //   setTouched((prevTouched) => ({
  //     ...prevTouched,
  //     [name]: true,
  //   }));
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const letterRegex = /^[A-Za-z]*$/;
    const emailRegex = /^[a-z0-9.@]*$/;
    const usernameRegex = /^[a-zA-Z0-9@%&*_\-]*$/;

    if (name === 'FIRST_NAME' || name === 'MIDDLE_NAME' || name === 'LAST_NAME') {
      if (!letterRegex.test(value)) {
        return;
      }
      const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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


    if (name === 'EMAIL') {
      const lowercasedValue = value.toLowerCase();

      // Validate email format
      if (!emailRegex.test(lowercasedValue)) {
        return;
      }

      const domain = lowercasedValue.split('@')[1];
      if (domain) {
        const domainParts = domain.split('.');
        if (domainParts.length > 1) {
          const tld = domainParts[domainParts.length - 1];
          if (tld.length > 15) {
            return "Invalid Email format";
          }
        }
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: lowercasedValue,
      }));
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));

      return;
    }

    if (name === 'USERNAME') {
      if (!usernameRegex.test(value)) {
        return;
      }
    }

    if (name === 'MOBILE_NO') {
      if (value.charAt(0) === '0' || !/^\d*$/.test(value)) {
        return;
      }
    }

    if (name === 'PASSWORD' || name === 'CONFIRM_PASSWORD') {
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

  }




  const handleSuperUser = async (event) => {
    event.preventDefault();

    setTouched({

      USERNAME: true,
      EMAIL: true,
      MOBILE_NO: true,
      PASSWORD: true,

    });

    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    console.log(filteredErrors, "filteredErrors");

    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.EMAIL &&
      formData.MOBILE_NO &&
      formData.PASSWORD &&
      formData.USERNAME

    ) {
      ModalManager.confirm({
        modalHeaderHeading: 'Registration',
        modalBodyHeading: 'Confirmation',
        message: 'Are you sure want to proceed?',
        onConfirm: HandleConfirm,
        confirmButtonText: 'OK',
      });

    } else {
      setErrors(filteredErrors);
      console.log("Form contains errors", filteredErrors);
    }
  };


  const HandleConfirm = async () => {
    const initialValues = {
      USERNAME: formData.USERNAME,
      PASSWORD: formData.PASSWORD,
      EMAIL: formData.EMAIL,
      MOBILE_NO: formData.MOBILE_NO,
    }

    try {

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
      const response = await axios.post(
        "http://127.0.0.1:8000/general_signup/",
        initialValues,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        ModalManager.success({
          modalHeaderHeading: 'Registration',
          modalBodyHeading: "Success",
          message: "General Registration Submitted Successfully.",
          // redirectTo: '/Login' // Specify the URL to redirect to
          onConfirm: () => {
            navigate('/Login');
          },
          confirmButtonText: 'OK',
        });
      }

      setLoading(false);
      setProgress(100);
    } catch (error) {

      if (error.response.status === 403 || error.response.status === 400) {
        const { data } = error.response;

        if (data.errors) {
          const usernameError = data.errors?.USERNAME?.unique;
          const emailError = data.errors?.EMAIL?.unique;
          let errorMessage = '';

          if (usernameError) {
            errorMessage += usernameError;
          }

          if (emailError) {
            errorMessage += (errorMessage ? '\n' : '') + emailError;
          } else {
            errorMessage = data.errors;
          }
          
          if (errorMessage) {
            // Swal.fire({ icon: "warning", title: "Error", text: errorMessage });
            ModalManager.warning({
              modalHeaderHeading: 'Registration',
              modalBodyHeading: "Warning",
              message: `${errorMessage}`,
              confirmButtonText: 'OK',
            });
          }
        }
      }

      if (error.response.status === 500) {
        const errorMessage = "An internal server error occurred. Please try again later.";
        ModalManager.error({
          modalHeaderHeading: 'Server Error',
          modalBodyHeading: 'Error 500',
          message: errorMessage,
          confirmButtonText: 'OK',
        });
      }

      console.error("Error during API call:", error.message);
    } finally {
      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  }

  const handleBackButtonClick = () => {
    // Redirect to the login page
    navigate('/login');
  };
  return (
    <div >


      <Preloader loading={loading} progress={progress} />

      <ToastContainer />

      <div className="d-flex newform  mx-lg-5 mx-md-5 justify-content-center">

        <form cclassName="" onSubmit={handleSuperUser}>
          <fieldset className="the-fieldset mb-4">
            <legend className="the-legend ">General Registration</legend>
            <div className="headingnames mx-4 mt-1 text-justify">
              {/* <h3 class="gene-heading">General Registration</h3> */}
              <h6 className="validations-text text-dark">
                <span className="validations-p">
                  <strong>After </strong>completing you can access our
                  <strong> Products, Services, and Applications. </strong>
                </span>
                <br />
                <span className="validations-p">
                  <strong>Username:</strong> Use only lowercase alphanumeric
                  characters; the use of the dot "." is not allowed.
                </span>
                <br />
                <span className="validations-p">
                  <strong>Password:</strong> Password: 8+ characters,
                  alphanumeric, can include '!', '$', '@', '&', '%', '^', '*' etc..
                </span>
              </h6>

              <hr className="custom-hr mb-1"></hr>
              <br />
            </div>
            <div class="mx-lg-5 d-flex justify-content-center">
              <div class="mx-lg-5 w-75">
                <div className="mb-0 text-dark">
                  <FormInputGroup
                    label="User Name"
                    required
                    value={formData.USERNAME}
                    type="username"
                    onBlur={handleBlur}
                    onblur={touched.USERNAME}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('USERNAME', error)}
                    onChange={handleChange}
                    errorMessage={errors.USERNAME}
                    name="USERNAME"
                    touched={touched.USERNAME}
                    inputType="text"
                    placeHolder="Enter User Name"
                  />

                  <FormInputGroup
                    label="Email Id"
                    required
                    value={formData.EMAIL}
                    type="email"
                    onBlur={handleBlur}
                    onblur={touched.EMAIL}
                    maxLength={100}
                    onChangeError={(error) => handleChangeError('EMAIL', error)}
                    onChange={handleChange}
                    errorMessage={errors.EMAIL}
                    name="EMAIL"
                    touched={touched.EMAIL}
                    inputType="email"
                    placeHolder="Enter Your Email "
                  />

                  <FormInputGroup
                    label="Mobile No"
                    required
                    value={formData.MOBILE_NO}
                    type="mobile"
                    onBlur={handleBlur}
                    onblur={touched.MOBILE_NO}
                    maxLength={10}
                    onChangeError={(error) => handleChangeError('MOBILE_NO', error)}
                    onChange={handleChange}
                    errorMessage={errors.MOBILE_NO}
                    name="MOBILE_NO"
                    touched={touched.MOBILE_NO}
                    inputType="text"
                    countryCodes={countryCodes}
                    selectedCountryCode={selectedCountryCode}
                    handleCountryCodeChange={handleCountryCodeChange}
                    placeHolder="Enter Mobile No "
                  />

                  <FormInputGroup
                    label="Password"
                    required
                    value={formData.PASSWORD}
                    type="password"
                    onBlur={handleBlur}
                    onblur={touched.PASSWORD}
                    maxLength={40}
                    onChangeError={(error) => handleChangeError('PASSWORD', error)}
                    onChange={handleChange}
                    errorMessage={errors.PASSWORD}
                    name="PASSWORD"
                    touched={touched.PASSWORD}
                    inputType="password"
                    placeHolder="Enter Password "
                    inputboxClass='passwordInput'
                  />
                </div>
                <div class="form-group">
                  <CustomPasswordStrengthBar password={formData.PASSWORD} />
                </div>
              </div>
            </div>
          </fieldset>
          <div className="row d-flex justify-content-center align-items-center  mt-5 mb-3  mx-auto">

            <div class="d-flex justify-content-center align-items-center mx-auto">
              <CentraliseButton
                className=""
                type="submit"
                text="REGISTER"
                onClick={() => { }}
                variant="#026d02"
                padding="3px 3px"
                hoverBgColor="#2b6e5bcf"
                hoverTextColor="white"
                fontsize="15px"
                width="250px"
              />
            </div>
            <div class=" d-flex justify-content-center align-items-center  my-md-2 mx-auto ">
              <CentraliseButton
                className="  "
                width="150px"
                type="submit"
                text="CANCEL"
                variant="#ab683f"
                padding="3px 3px"
                hoverBgColor="#ab683f9e"
                hoverTextColor="white"
                fontsize="15px"
                onClick={handleBackButtonClick}
              />
            </div>
          </div>
        </form>


      </div>
    </div>
  );
};

export default General;
