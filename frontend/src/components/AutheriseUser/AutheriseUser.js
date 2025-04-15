import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Modal from "react-modal";
import { css } from "@emotion/react";
import { City, Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import "./AutheriseUser.css"
import Preloader from "../Preloader/Preloader";
import ModalManager from "../GeopicxPopupModals/ModalManager";
import CentraliseButton from "../CentraliseButton/CentraliseButton";
import FormInputGroup from "../../ReuseCompomenent/FormInputGroup";
import SelectBox from "../../ReuseCompomenent/SelectBox";

import { GenderType, adminList, securityQuestions, startSelectableDateISO, maxDateForDOBISO } from "../Constant";

import {
  Col,
} from "react-bootstrap";
import CustomPasswordStrengthBar from "../../ReuseCompomenent/CustomPasswordStrengthBar";
import Validators from "../../ReuseCompomenent/validators";
import { useSelector } from "react-redux";
Modal.setAppElement("#root");


const AutheriseUser = ({ }) => {
  //const themeList = useSelector((state) => state.auth.theme);

  const [backgroundColor, setBackgroundColor] = useState("#36D7B7");
  const navigate = useNavigate();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedQuestion1, setSelectedQuestion1] = useState(null);
  const [selectedQuestion2, setSelectedQuestion2] = useState(null);
  const [questionId1, setQuestionId1] = useState();
  const [questionId2, setQuestionId2] = useState();
  // coutry change////
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [gender, setGender] = useState('');
  const [themeList, setThemeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);


  const handleChangeGender = (e) => {
    const { value } = e.target;
    setGender(value);
  };
  //GU to UU conversion added by akshay
  const [mydata, setMyData] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem('guData');
    if (storedData) {
      // setMyData(storedData);
      setMyData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    GetDepartmnetList();
  }, []);


  const GetDepartmnetList = async () => {
    try {

      const response = await fetch(`http://127.0.0.1:8000/Check_Admintype/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      // Transform the data
      const transformedData = data.map(department => ({
        value: department,
        label: department.charAt(0).toUpperCase() + department.slice(1).toLowerCase()
      }));

      setDepartmentList(transformedData);


    } catch (error) {
      console.error('Error fetching data:', error.message);

    }
  };


  const newaccessToken = useSelector((state) => state.auth.accessToken);

  const [formData, setFormData] = useState({
    USERNAME: "",
    PASSWORD: "",
    EMAIL: "",
    USER_TYPE: "UU",
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    DOB: "",
    MOBILE_NO: "",
    CITY: "",
    STATE: "",
    COUNTRY: "",
    PIN_CODE: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    Theme_Section: "",
    DEPARTMENT: "",
    UU_REM: "",
    ADDRESS_1: "",
    ADDRESS_2: "",
    // Q1_ID: selectedQuestion1,
    // Q1_AN: selectedQuestion2,
    // Q2_ID: questionId1,
    // Q2_AN: questionId2,
    // GENDER: gender || "",
  });

  const [touched, setTouched] = useState({
    USERNAME: false,
    PASSWORD: false,
    EMAIL: false,
    USER_TYPE: false,
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    DOB: false,
    MOBILE_NO: false,
    CITY: false,
    STATE: false,
    COUNTRY: false,
    PIN_CODE: false,
    ORGANIZATION: false,
    DESIGNATION: false,
    Theme_Section: false,
    DEPARTMENT: false,
    UU_REM: false,
    ADDRESS_1: false,
    ADDRESS_2: false,
    // Q1_ID: false,
    // Q1_AN: false,
    // Q2_ID: false,
    // Q2_AN: false,
  });

  const [errors, setErrors] = useState({
    USERNAME: "",
    PASSWORD: "",
    EMAIL: "",
    USER_TYPE: "",
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    DOB: "",
    MOBILE_NO: "",
    CITY: "",
    STATE: "",
    COUNTRY: "",
    PIN_CODE: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    Theme_Section: "",
    DEPARTMENT: "",
    UU_REM: "",
    ADDRESS_1: "",
    ADDRESS_2: "",
    // Q1_ID: "",
    // Q1_AN: "",
    // Q2_ID: "",
    // Q2_AN: "",
  });

  useEffect(() => {
    if (mydata) {
      setFormData({
        FIRST_NAME: "",
        MIDDLE_NAME: "",
        LAST_NAME: "",
        PIN_CODE: "",
        USERNAME: mydata.username || "",
        EMAIL: mydata.email || "",
        PASSWORD: "Jay@12345" || "",
        MOBILE_NO: mydata.mobile || "",
        USER_TYPE: mydata.isUserType || "",
      });
    }
  }, [mydata]);

  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  }

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
      STATE: 'Field is required',
      CITY: 'Field is required',
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

  const ThemeList = async (value) => {
    try {

      const response = await fetch(`http://127.0.0.1:8000/Department_Value/?ADMIN_TYPE=${value}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      // Transform the data
      // const transformedData = data.map(department => ({
      //   value: department,
      //   label: department
      // }));

      setThemeList(data);


    } catch (error) {
      console.error('Error fetching data:', error.message);

    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "DEPARTMENT") {
      ThemeList(value);
    }

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

    if (
      name === "ORGANIZATION" ||
      name === "DESIGNATION" ||
      name === "ADDRESS_1" ||
      name === "ADDRESS_2" ||
      name === "UU_REM"
    ) {
      const trimmedValue = value.trimStart(); // Remove leading spaces
      const formattedValue = trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1).toLowerCase();

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

    if (name === 'PIN_CODE') {

      if (!/^\d*$/.test(value) || value.startsWith('0')) {
        return;
      }
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



  const countryCodes = [
    { code: "+91", name: "IND" },
  ];

  // to send the response to backend not shortform in full form country name and state name
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

  const HandleAUform = (event) => {
    event.preventDefault();
    setTouched({
      USERNAME: true,
      PASSWORD: true,
      EMAIL: true,
      USER_TYPE: true,
      FIRST_NAME: true,
      MIDDLE_NAME: true,
      LAST_NAME: true,
      GENDER: true,
      DOB: true,
      MOBILE_NO: true,
      CITY: true,
      STATE: true,
      COUNTRY: true,
      PIN_CODE: true,
      ORGANIZATION: true,
      DESIGNATION: true,
      Theme_Section: true,
      DEPARTMENT: true,
      UU_REM: true,
      ADDRESS_1: true,
      ADDRESS_2: true,
      // Q1_ID: true,
      // Q1_AN: true,
      // Q2_ID: true,
      // Q2_AN: true,
    });

    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    // console.log(formData, "filteredErrors");

    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.USERNAME &&
      formData.PASSWORD &&
      formData.EMAIL &&
      formData.USER_TYPE &&
      formData.FIRST_NAME &&
      formData.LAST_NAME &&
      formData.MOBILE_NO &&
      formData.CITY &&
      formData.STATE &&
      formData.COUNTRY &&
      formData.PIN_CODE &&
      formData.ORGANIZATION &&
      formData.DESIGNATION &&
      formData.Theme_Section &&
      formData.DEPARTMENT &&
      formData.ADDRESS_1
      // formData.Q1_ID &&
      // formData.Q1_AN &&
      // formData.Q2_ID &&
      // formData.Q2_AN
    ) {

      ModalManager.confirm({
        modalHeaderHeading: 'Registration',
        modalBodyHeading: ' Confirmation',
        message: 'Are you sure want to proceed?',
        onConfirm: HandleConfirm,
        confirmButtonText: 'OK',
      });

    } else {
      setErrors(filteredErrors);
    }
  }

  const HandleConfirm = async () => {
    const updatedFormData = {
      MOBILE_NO: formData.MOBILE_NO || "",
      USERNAME: formData.USERNAME || "",
      PASSWORD: formData.PASSWORD || "",
      EMAIL: formData.EMAIL || "",
      USER_TYPE: formData?.USER_TYPE || "",
      Theme_Section: formData?.Theme_Section || "",
      ADMIN_TYPE: formData.DEPARTMENT || "",
      // Q1_ID: formData?.Q1_ID || "",
      // Q1_AN: formData?.Q1_AN || "",
      // Q2_ID: formData?.Q2_ID || "",
      // Q2_AN: formData?.Q2_AN || "",
      ...(mydata ? { USERID: mydata.userId } : {}),

      logindata: {
        FIRST_NAME: formData?.FIRST_NAME || "",
        MIDDLE_NAME: formData?.MIDDLE_NAME || "",
        LAST_NAME: formData?.LAST_NAME || "",
        DOB: formData.DOB || "",
        GENDER: gender || "",
        ORGANIZATION: formData?.ORGANIZATION || "",
        DESIGNATION: formData?.DESIGNATION || "",
        COUNTRY: getCountryName(formData?.COUNTRY), // Convert country code to country name
        STATE: getStateName(formData?.COUNTRY, formData?.STATE), // Convert state code to state name
        CITY: formData?.CITY || "",
        ADDRESS_1: formData.ADDRESS_1 || "",
        ADDRESS_2: formData.ADDRESS_2 || "",
        PIN_CODE: formData.PIN_CODE || "",
        UU_REM: formData.UU_REM || "",
      }
    };


    try {
      setLoading(true);
      setProgress(0);
      const steps = 10; // Define the number of steps
      const stepDuration = 500; // Define the duration for each step (in milliseconds)
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        const progressPercentage = (i / steps) * 100;
        setProgress(progressPercentage);
      }
      let response;

      if (mydata) {
        response = await axios.put(
          "http://127.0.0.1:8000/authorized_singup/",
          updatedFormData,
          {
            headers: {
              Authorization: `Bearer ${newaccessToken}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "http://127.0.0.1:8000/authorized_singup/",
          updatedFormData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      if (response.status === 200 || response.status === 201) {
        localStorage.clear();

        ModalManager.success({
          modalHeaderHeading: 'Registration',
          modalBodyHeading: "Success",
          message: "Authorized Registration Submit Successfully.",
          onConfirm: () => {
            sessionStorage.clear();
            if (mydata) {
              window.location.href = "/Login";
            } else {
              navigate('/Login');
            }
          },
          confirmButtonText: 'OK',
        });

      }
      setLoading(false);
      setProgress(100);
    } catch (error) {
      setLoading(false);
      setProgress(0);
      if (error.response && error.response.status === 400) {
        const { data } = error.response;

        if (data.errors) {
          const usernameError = data.errors.USERNAME?.unique;
          const emailError = data.errors.EMAIL?.unique;
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
            ModalManager.warning({
              modalHeaderHeading: 'Registration',
              modalBodyHeading: "Warning",
              message: `${errorMessage}`,
              confirmButtonText: 'OK',
            });
          }
        }
      }
      else if (error.response && error.response.status === 500) {
        const errorMessage = "An internal server error occurred. Please try again later.";
        ModalManager.error({
          modalHeaderHeading: 'Server Error',
          modalBodyHeading: 'Error 500',
          message: errorMessage,
          confirmButtonText: 'OK',
        });
      }
    } finally {
      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
      setLoading(false);
      setProgress(100);
    }
  }

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

  // date form 16 years to 95 years
  const currentDate = new Date();
  const minDate = new Date(currentDate);
  minDate.setFullYear(minDate.getFullYear() - 95);
  const maxDate = new Date(currentDate);
  maxDate.setFullYear(maxDate.getFullYear() - 16);


  const options = Object.values(themeList).map((value) => ({
    value: value,
    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  }));

  const defaultOptions = options.length > 0 ? options : [];

  const handleBackButtonClick = () => {
    // Redirect to the login page
    localStorage.clear();
    navigate('/login');
  };


  return (
    <div className="">
      <Preloader loading={loading} progress={progress} />
      <div className="d-flex  mx-lg-5 mx-md-5 justify-content-center text-dark">
        <form
          onSubmit={HandleAUform}
          className="mb-0  authorizeregtA authorizeregt_wraperA">
          <fieldset class="the-fieldset mb-4 px-5">
            <legend class="the-legend">Authorized Registration</legend>
            <div className="headingname mx-3 mt-1 text-justify">
              {/* <h3 class="gene-heading">Authorized Registration</h3> */}
              <h6 className="validations-text mb-0">
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
                  <strong>Password:</strong> Password: 8+ characters, alphanumeric,
                  can include '!', '$', '@', '&', '%', '^', '*'  etc..
                </span>
              </h6>
            </div>
            <br />
            <div class="mb-1">
              <h4

                style={{
                  // textAlign: "left",
                  fontSize: "min(4vw,14px)",
                  fontWeight: "bold",
                  marginBottom: "3px"
                }}
              >
                Personal Information
              </h4>
              <hr className=" custom-hr"></hr>
            </div>

            <div class="row">
              <Col xs={12} sm={6} md={4}  >

                <FormInputGroup
                  label="First Name"
                  required
                  value={formData.FIRST_NAME}
                  type="firstname"
                  onBlur={handleBlur}
                  onblur={touched.FIRST_NAME}
                  maxLength={20}
                  onChangeError={(error) => handleChangeError('FIRST_NAME', error)}
                  onChange={handleChange}
                  errorMessage={errors.FIRST_NAME}
                  name="FIRST_NAME"
                  touched={touched.FIRST_NAME}
                  inputType="text" // Specifying inputType
                  placeHolder="Enter First Name"
                // inputboxClass="inputBox_wraper_box"

                />

              </Col>

              <Col xs={12} sm={6} md={4}  >
                <FormInputGroup
                  label="Middle Name"
                  value={formData.MIDDLE_NAME}
                  type="middlename"
                  onBlur={handleBlur}
                  onblur={touched.MIDDLE_NAME}
                  maxLength={20}
                  onChangeError={(error) => handleChangeError('MIDDLE_NAME', error)}
                  onChange={handleChange}
                  errorMessage={errors.MIDDLE_NAME}
                  name="MIDDLE_NAME"
                  touched={touched.MIDDLE_NAME}
                  inputType="text" // Specifying inputType
                  placeHolder="Enter Middle Name"
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <FormInputGroup
                  label="Last Name"
                  required
                  value={formData.LAST_NAME}
                  type="lastname"
                  onBlur={handleBlur}
                  onblur={touched.LAST_NAME}
                  maxLength={20}
                  onChangeError={(error) => handleChangeError('LAST_NAME', error)}
                  onChange={handleChange}
                  errorMessage={errors.LAST_NAME}
                  name="LAST_NAME"
                  touched={touched.LAST_NAME}
                  inputType="text"
                  placeHolder="Enter Last Name"
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <SelectBox
                  label="Gender"
                  name="Gender"
                  value={gender}
                  onChange={handleChangeGender}
                  options={GenderType}
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <FormInputGroup
                  label="Date Of Birth"
                  value={formData.DOB}
                  type="DOB"
                  onBlur={handleBlur}
                  onblur={touched.DOB}
                  onChangeError={(error) => handleChangeError('DOB', error)}
                  onChange={handleChange}
                  errorMessage={errors.DOB}
                  name="DOB"
                  touched={touched.DOB}
                  inputType="date"
                  disabled={formData.AU_APRO_STAT === "BLOCKED"}
                  min={startSelectableDateISO}
                  max={maxDateForDOBISO}  // Set min date to 16 years ago in ISO format                  
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <FormInputGroup
                  label="Organization"
                  required
                  value={formData.ORGANIZATION}
                  type="organization"
                  onBlur={handleBlur}
                  onblur={touched.ORGANIZATION}
                  maxLength={100}
                  onChangeError={(error) => handleChangeError('ORGANIZATION', error)}
                  onChange={handleChange}
                  errorMessage={errors.ORGANIZATION}
                  name="ORGANIZATION"
                  touched={touched.ORGANIZATION}
                  inputType="text"
                  placeHolder="Enter Organization"
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <FormInputGroup
                  label="Designation"
                  required
                  value={formData.DESIGNATION}
                  type="organization"
                  onBlur={handleBlur}
                  onblur={touched.DESIGNATION}
                  maxLength={50}
                  onChangeError={(error) => handleChangeError('DESIGNATION', error)}
                  onChange={handleChange}
                  errorMessage={errors.DESIGNATION}
                  name="DESIGNATION"
                  touched={touched.DESIGNATION}
                  inputType="text"
                  placeHolder="Enter Designation"
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <SelectBox
                  label="Department"
                  required
                  type="department"
                  value={formData.DEPARTMENT}
                  onBlur={handleBlur}
                  onblur={touched.DEPARTMENT}
                  options={departmentList}
                  onChangeError={(error) => handleChangeError('DEPARTMENT', error)}
                  onChange={handleChange}
                  errorMessage={errors.DEPARTMENT}
                  touched={touched.DEPARTMENT}
                  name="DEPARTMENT"
                />
              </Col>

              <Col xs={12} sm={6} md={4}  >
                <SelectBox
                  required
                  label="Theme Section"
                  type="theme"
                  value={formData.Theme_Section}
                  onBlur={handleBlur}
                  onblur={touched.Theme_Section}
                  options={defaultOptions}
                  onChangeError={(error) => handleChangeError('Theme_Section', error)}
                  onChange={handleChange}
                  errorMessage={errors.Theme_Section}
                  touched={touched.Theme_Section}
                  name="Theme_Section"
                />
              </Col>


            </div>

            <div class="mb-1 ">
              <h4
                style={{
                  textAlign: "left",
                  fontSize: "min(4vw,14px)",
                  fontWeight: "bold",
                  marginBottom: "3px"
                }}
              >
                Address Information
              </h4>
              <hr className="custom-hr"></hr>
            </div>

            {/*   COUNTRY */}
            <div class="row  ">
              <Col xs={12} sm={6} md={4} xl={3}  >
                <SelectBox
                  label="Country"
                  required
                  name="COUNTRY"
                  value={formData.COUNTRY}
                  onChange={handleCountryChange}
                  onBlur={handleBlur}
                  options={Country.getAllCountries().map((country) => ({
                    value: country.isoCode,
                    label: country.name
                  }))}
                  errorMessage={errors.COUNTRY}
                  touched={touched.COUNTRY}
                  type="country"
                  onblur={touched.COUNTRY}
                  maxLength={30}
                  onChangeError={(error) => handleChangeError('COUNTRY', error)}
                />
              </Col>

              <Col xs={12} sm={6} md={4} xl={3}  >
                <SelectBox
                  required
                  label="State"
                  name="STATE"
                  value={formData.STATE}
                  onChange={handleStateChange}
                  onBlur={handleBlur}
                  options={State.getStatesOfCountry(selectedCountry).map((state) => ({
                    value: state.isoCode,
                    label: state.name
                  }))}
                  errorMessage={errors.STATE}
                  touched={touched.STATE}
                  type="state"
                  onblur={touched.STATE}
                  maxLength={30}
                  onChangeError={(error) => handleChangeError('STATE', error)}
                />
              </Col>

              <Col xs={12} sm={6} md={4} xl={3}  >
                <SelectBox
                  required
                  label="City"
                  name="CITY"
                  value={formData.CITY}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name
                  }))}
                  errorMessage={errors.CITY}
                  touched={touched.CITY}
                  type="city"
                  onblur={touched.CITY}
                  maxLength={20}
                  onChangeError={(error) => handleChangeError('CITY', error)}
                />
              </Col>

              <Col xs={12} sm={6} md={4} xl={3}  >
                <FormInputGroup
                  label="Pin Code"
                  required
                  value={formData.PIN_CODE}
                  type="pincode"
                  onBlur={handleBlur}
                  // onFocus={handleFocus}
                  onblur={touched.PIN_CODE}
                  maxLength={6}
                  onChangeError={(error) => handleChangeError('PIN_CODE', error)}
                  onChange={handleChange}
                  errorMessage={errors.PIN_CODE}
                  name="PIN_CODE"
                  touched={touched.PIN_CODE}
                  inputType="text"
                  placeHolder="Pin Code"
                />
              </Col>

              <Col xs={12} sm={6} md={6}  >
                <FormInputGroup
                  label="Address 1"
                  required
                  value={formData.ADDRESS_1}
                  type="address1"
                  onBlur={handleBlur}
                  onblur={touched.ADDRESS_1}
                  maxLength={100}
                  onChangeError={(error) => handleChangeError('ADDRESS_1', error)}
                  onChange={handleChange}
                  errorMessage={errors.ADDRESS_1}
                  name="ADDRESS_1"
                  touched={touched.ADDRESS_1}
                  inputType="text"
                  placeHolder="Flat No / Building Name  "
                />
              </Col>

              <Col xs={12} sm={6} md={6}  >
                <FormInputGroup
                  label="Address 2"
                  value={formData.ADDRESS_2}
                  type="address2"
                  onBlur={handleBlur}
                  onblur={touched.ADDRESS_2}
                  maxLength={100}
                  onChangeError={(error) => handleChangeError('ADDRESS_2', error)}
                  onChange={handleChange}
                  errorMessage={errors.ADDRESS_2}
                  name="ADDRESS_2"
                  touched={touched.ADDRESS_2}
                  inputType="text"
                  placeHolder="Land Mark / Locality "
                />
              </Col>
            </div>
            <div class="">
              <h4
                style={{
                  textAlign: "left",
                  fontSize: "min(4vw,14px)",
                  fontWeight: "bold",
                  marginBottom: "3px"
                }}
                className=""
              >
                Authorized User Credential
              </h4>
              <hr className=" custom-hr "></hr>
            </div>

            <div class="row ">
              <Col xs={12} sm={6} md={3}  >
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
                  disabled={Boolean(mydata)}
                />
              </Col>
              <Col xs={12} sm={6} md={3}  >
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
                  disabled={Boolean(mydata)}
                />
              </Col>
              {!mydata &&
                <Col xs={12} sm={6} md={3}  >
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
                  <CustomPasswordStrengthBar password={formData.PASSWORD} />

                </Col>}
              <Col xs={12} sm={6} md={3}  >
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
              </Col>
            </div>

            {/* <div class="form-group mb-1">
              <h4
                style={{
                  textAlign: "left",
                  fontSize: "min(4vw,14px)",
                  fontWeight: "bold",
                  marginBottom: "3px"
                }}
              >
                Security Question
              </h4>
              <hr className="custom-hr"></hr>
            </div> */}

            <div class="row">

              <div class="form-group col-md-6">
                <label className="lable2">
                  Remark &nbsp;
                </label>

                <Validators
                  value={formData.UU_REM}
                  type="Remark"
                  maxLength={200}
                  onblur={touched.UU_REM}
                  onChangeError={(error) => handleChangeError('UU_REM', error)}
                  touched={touched.UU_REM}
                />

                <textarea
                  rows="4"
                  cols="50"
                  name="UU_REM"
                  type="Remark"
                  value={formData.UU_REM}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  id="exampleTextarea"
                  className="form-control text_area"
                  maxLength={200}
                  placeholder="Comments..."
                ></textarea>
              </div>
            </div>
          </fieldset>
          <div className="row d-flex justify-content-center align-items-center mt-5 mb-3 ">

            <div class="d-flex justify-content-start align-items-center">
              <CentraliseButton
                className="mr-lg-5 mr-md-5 mr-sm-5"
                type="submit"
                text="REGISTER"
                onClick={() => { }}
                variant="#026d02"
                hoverBgColor="#2b6e5bcf"
                hoverTextColor="white"
                padding="3px 3px"
                fontsize="15px"
                width="300px" // Pass width here
              />
            </div>

            <div class="  d-flex justify-content-center align-items-center  my-md-2 ">
              <CentraliseButton
                className="ml-lg-5 ml-md-5 ml-sm-5"
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

export default AutheriseUser;
