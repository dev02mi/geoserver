import React, { useEffect, useState, useRef } from "react";
import "./UpdateUserProfile.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal,
} from "react-bootstrap";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "axios";
import { City, Country, State } from "country-state-city";
import MaxLengthErrorMessage from "../MaxLengthErrorMessage/MaxLengthErrorMessage";
import Preloader from "../Preloader/Preloader";
import ModalManager from "../GeopicxPopupModals/ModalManager.js";
import { hideUpdateProfile } from "../StoreContext/features/profile/updateProfileSlice.js";
import { useSelector, useDispatch } from 'react-redux';
import FormInputGroup from "../../ReuseCompomenent/FormInputGroup.js";
import SelectBox from "../../ReuseCompomenent/SelectBox.js";
import Validators from "../../ReuseCompomenent/validators.js";
import { GenderType, startSelectableDateISO, maxDateForDOBISO } from "../Constant";
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody.js";
import CentraliseButton from "../CentraliseButton/CentraliseButton.js";




const UpdateUserProfile = ({
  userType,
  userId,
  userProfileData,
  fetchUserGetData
}) => {

  const dispatch = useDispatch();
  const newaccessToken = useSelector((state) => state.auth.accessToken)

  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const countryvalue = userProfileData.COUNTRY;
  const stateValue = userProfileData.STATE;
  // const [isTouched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [gender, setGender] = useState(userProfileData?.GENDER);

  // ********Centralized**** 
  const [formData, setFormData] = useState({
    USERNAME: userProfileData?.USERNAME || "",
    MOBILE_NO: userProfileData?.MOBILE_NO || "",
    EMAIL: userProfileData?.EMAIL || "",
    USER_TYPE: userType,
    // USERID: userProfileData.USERID,
    Theme_Section: userProfileData?.Theme_Section || "",
    AU_APRO_REM: userProfileData?.AU_APRO_REM || "",
    APRO_DATE: userProfileData?.APRO_DATE || null,
    USERID: userProfileData?.USERID || "",
    FIRST_NAME: userProfileData?.FIRST_NAME || "",
    MIDDLE_NAME: userProfileData?.MIDDLE_NAME || "",
    LAST_NAME: userProfileData?.LAST_NAME || "",
    ORGANIZATION: userProfileData?.ORGANIZATION || "",
    DESIGNATION: userProfileData?.DESIGNATION || "",
    COUNTRY: userProfileData.COUNTRY,
    STATE: userProfileData?.STATE,
    CITY: userProfileData?.CITY,
    GENDER: userProfileData?.GENDER || "",
    DOB: userProfileData?.DOB || "",
    PIN_CODE: userProfileData?.PIN_CODE || "",
    ADDRESS_1: userProfileData?.ADDRESS_1 || "",
    ADDRESS_2: userProfileData?.ADDRESS_2 || "",
    SU_APRO_STAT: userProfileData?.SU_APRO_STAT,
    AU_APRO_STAT: userProfileData?.AU_APRO_STAT,
    PHONE_LAN: userProfileData?.LAN_LINE || "",
    LOCATION: userProfileData?.OFF_LOCA || "",

  });

  const [touched, setTouched] = useState({
    USERNAME: false,
    PASSWORD: false,
    EMAIL: false,
    USER_TYPE: false,
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    AU_APRO_REM: false,
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
    PHONE_LAN: false,
    LOCATION: false

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
    AU_APRO_REM: "",
    PHONE_LAN: "",
    LOCATION: "",

  });


  const handleChangeGender = (e) => {
    const { value } = e.target;
    setGender(value);
  };


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

  useEffect(() => { }, [userProfileData]);

  const countryCodes = [
    { code: "+91", name: "IND" },
    // { code: '+1', name: 'USA' },
    // Add more country codes here
  ];

  const handleCountryCodeChange = (e) => {
    const selectedCode = e.target.value;
    setSelectedCountryCode(selectedCode);
    // formik.setFieldValue("MOBILE_NO", ""); // Clear the input when changing country code
  };

  const getCountryName = (isoCode) => {
    if (countryvalue === isoCode) {
      return countryvalue;
    } else {
      const country = Country.getAllCountries().find(
        (c) => c.isoCode === isoCode
      );
      return country ? country.name : "";
    }
  };

  const getStateName = (countryIsoCode, stateIsoCode) => {
    if (stateValue === stateIsoCode) {
      return stateValue;
    } else {
      const states = State.getStatesOfCountry(countryIsoCode);
      const state = states.find((s) => s.isoCode === stateIsoCode);

      return state ? state.name : "";
    }
  };

  let initialValues = {};
  if (userType === "GU") {
    initialValues = {
      USERNAME: userProfileData?.USERNAME || "",
      MOBILE_NO: userProfileData?.MOBILE_NO || "",
      EMAIL: userProfileData?.EMAIL || "",
      USER_TYPE: userType,
      USERID: userId,
    };
  } else {
    initialValues = {
      USERNAME: userProfileData?.USERNAME || "",
      MOBILE_NO: userProfileData?.MOBILE_NO || "",
      EMAIL: userProfileData?.EMAIL || "",
      USER_TYPE: userType || "",
      ...(userType !== "SU" ? { Theme_Section: formData?.Theme_Section || "", } : {}),
      AU_APRO_REM: userProfileData?.AU_APRO_REM || "",
      APRO_DATE: userProfileData?.APRO_DATE || null,
      // USERID: userProfileData?.USERID || "",

      logindata: {
        FIRST_NAME: userProfileData?.FIRST_NAME,
        MIDDLE_NAME: userProfileData?.MIDDLE_NAME || "",
        LAST_NAME: userProfileData?.LAST_NAME || "",
        ORGANIZATION: userProfileData?.ORGANIZATION || "",
        DESIGNATION: userProfileData?.DESIGNATION || "",
        COUNTRY: userProfileData?.COUNTRY,
        STATE: userProfileData?.STATE,
        CITY: userProfileData?.CITY || "",
        ...(userType === "SU" || userType === "AU" ? {
          LAN_LINE: userProfileData?.LAN_LINE || "",
          OFF_LOCA: userProfileData?.OFF_LOCA || null,
          ALT_EMAIL: userProfileData?.ALT_EMAIL || "",
        } : undefined),  // Return undefined if condition is false to skip spreading
        ...(userType === "UU" ? {
          GENDER: userProfileData?.GENDER || "",
          DOB: userProfileData?.DOB || null,
          PIN_CODE: userProfileData?.PIN_CODE || "",
          ADDRESS_1: userProfileData?.ADDRESS_1 || "",
          ADDRESS_2: userProfileData?.ADDRESS_2 || "",
        } : undefined),
      },

    };

  }

  //COUNTRYY
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData((prevData) => ({
      ...prevData,
      COUNTRY: country,
      STATE: '',
      CITY: '',
    }));

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
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setFormData((prevData) => ({
      ...prevData,
      STATE: state,
      CITY: '',
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: '',
      CITY: 'Field is required',
    }));

    setCities(City.getCitiesOfState(selectedCountry, state));
  };

  const currentDate = new Date();
  const minDate = new Date(currentDate);
  minDate.setFullYear(minDate.getFullYear() - 95);

  const maxDate = new Date(currentDate);
  maxDate.setFullYear(maxDate.getFullYear() - 16);


  // ************************* Centralized Code New ****************************** //

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

    if (
      name === "ORGANIZATION" ||
      name === "DESIGNATION" ||
      name === "ADDRESS_1" ||
      name === "ADDRESS_2" ||
      name === "UU_REM" ||
      name === "LOCATION"
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

    if (name === 'PHONE_LAN') {
      if (!/^[\d-]*$/.test(value)) {
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

    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: '',
      CITY: ''
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



  const HandleForm = (event) => {
    event.preventDefault();


    let payload;
    if (userType !== "GU") {
      const countryName = getCountryName(formData?.COUNTRY);
      const stateName = getStateName(formData?.COUNTRY, formData?.STATE);

      payload = {
        USERNAME: formData?.USERNAME || "",
        MOBILE_NO: formData?.MOBILE_NO || "",
        EMAIL: formData?.EMAIL || "",
        USER_TYPE: userType || "",
        ...(userType !== "SU" ? { Theme_Section: formData?.Theme_Section || "", } : {}),
        AU_APRO_REM: formData?.AU_APRO_REM || "",
        APRO_DATE: formData?.APRO_DATE || null,
        // USERID: formData?.USERID || "",

        logindata: {
          FIRST_NAME: formData?.FIRST_NAME,
          MIDDLE_NAME: formData?.MIDDLE_NAME,
          LAST_NAME: formData?.LAST_NAME,
          ORGANIZATION: formData?.ORGANIZATION || "",
          DESIGNATION: formData?.DESIGNATION || "",
          COUNTRY: countryName,
          STATE: stateName,
          CITY: formData?.CITY || "",
          ...(userType === "SU" || userType === "AU" ? {
            LAN_LINE: formData.PHONE_LAN || "",
            OFF_LOCA: formData.LOCATION || null,
            ALT_EMAIL: formData?.ALT_EMAIL || "",
          } : {}),  // Use {} if condition is false to skip spreading
          ...(userType === "UU" ? {
            GENDER: gender || "",
            DOB: formData?.DOB || null,
            PIN_CODE: formData?.PIN_CODE || "",
            ADDRESS_1: formData?.ADDRESS_1 || "",
            ADDRESS_2: formData?.ADDRESS_2 || "",
          } : {}),  // Use {} if condition is false to skip spreading
        },
      };
    } else {
      payload = {
        USERNAME: formData?.USERNAME || "",
        MOBILE_NO: formData?.MOBILE_NO || "",
        EMAIL: formData?.EMAIL || "",
        USER_TYPE: userType || "",
        USERID: formData?.USERID || ""
      };
    }

    //console.log("pay,load", payload);
    //console.log("value", initialValues);
    const isFormDataChanged = JSON.stringify(payload) !== JSON.stringify(initialValues);

    if (!isFormDataChanged) {
      ModalManager.warning({
        modalHeaderHeading: 'Update User Profile',
        modalBodyHeading: "Warning",
        message: `No changes were made to the form.`,
        confirmButtonText: 'OK',
      });
      return;
    }
    setTouched({
      USERNAME: true,
      EMAIL: true,
      USER_TYPE: true,
      FIRST_NAME: true,
      MIDDLE_NAME: true,
      LAST_NAME: true,
      MOBILE_NO: true,
      CITY: true,
      STATE: true,
      COUNTRY: true,
      PIN_CODE: true,
      ORGANIZATION: true,
      DESIGNATION: true,
      Theme_Section: true,
      EMAIL_ALT: true,
      LOCATION: true,
      PHONE_LAN: true
    });
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));

    //console.log(filteredErrors, "filteredErrordfvbdfs");

    if (userType !== 'GU' &&
      Object.keys(filteredErrors).length === 0 &&
      formData.USERNAME &&
      formData.EMAIL &&
      formData.FIRST_NAME &&
      formData.LAST_NAME &&
      formData.MOBILE_NO &&
      formData.CITY &&
      formData.STATE &&
      formData.COUNTRY &&
      formData.ORGANIZATION &&
      formData.DESIGNATION
    ) {
      ModalManager.confirm({
        modalHeaderHeading: 'Update User Profile',
        modalBodyHeading: 'Confirmation',
        message: 'Are you sure want to proceed?',
        onConfirm: () => {
          HandleConfirm(payload);
        },
        confirmButtonText: 'OK',
      });
    } else {
      if (userType === 'GU' &&
        Object.keys(filteredErrors).length === 0 && formData.USERNAME && formData.EMAIL && formData.MOBILE_NO) {
        ModalManager.confirm({
          modalHeaderHeading: 'Update User Profile',
          modalBodyHeading: 'Confirmation',
          message: 'Are you sure want to proceed?',
          onConfirm: () => {
            HandleConfirm(payload);
          },
          confirmButtonText: 'OK',
        });
      }
      setErrors(filteredErrors);
    }
  }


  const HandleConfirm = async (payload) => {

    try {
      LoaderUpdateProgress();
      let url = null;
      if (userType === "SU") {
        url = "http://127.0.0.1:8000/superuser_api/";
      } else if (userType === "AU") {
        url = "http://127.0.0.1:8000/admin_url/";
      }
      else if (userType === "UU") {
        url = "http://127.0.0.1:8000/authorized_singup/";
      } else {
        url = "http://127.0.0.1:8000/general_signup/";
      }

      const response = await fetch(
        url,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newaccessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 200 || response.status === 201) {

        ModalManager.success({
          modalHeaderHeading: 'User Update Profile',
          modalBodyHeading: "Success",
          message: "User Update Successfully",
          onConfirm: () => {
            dispatch(hideUpdateProfile())
          },
          confirmButtonText: 'OK',
        });

        setLoading(false);
        setProgress(100);
        fetchUserGetData()

      } else {
        if (response.status === 400 || response.status === 404) {

          let msgerr;
          return response.json().then(data => {

            if (data.errors) {
              msgerr = data.errors;
            } else {
              msgerr = data.errors?.logindata?.ALT_EMAIL?.[0];
            }

            if (msgerr) {
              ModalManager.warning({
                modalHeaderHeading: 'User Update Profile',
                modalBodyHeading: "Warning",
                message: `${msgerr}`,
                confirmButtonText: 'OK',
                onConfirm: () => {
                  sessionStorage.clear(); 
                  // Redirect to login page
                  window.location.href = '/Login';
              },
              });
            }
          });
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


  return (
    <div
      id="Profile"
    >
      <Preloader loading={loading} progress={progress} />

      <div className="Profile-Popup-Content text-dark" >

        {/* <span className="Close" onClick={() => dispatch(hideUpdateProfile())}>
          &times;
        </span> */}

        <div id="mt-5">
          <div className="px-4">
            <CentraliseheaderBody
              header="Profile Update"
              logo="GEOPICX_LOGO.png"
              headerBgColor="rgb(64 37 136)"        // Set your desired header background color
              headerTextColor="white"

              onClose={() => dispatch(hideUpdateProfile())}
            >
              <div class="d-flex justify-content-center">
                {/* <h4 className=" Profile-HeadingText">Profile Update Form</h4> */}
              </div>
              {/* <hr id="" class="mb-1 mt-1"></hr> */}
              <Form onSubmit={HandleForm}>
                <fieldset className="the-fieldset mb-4">
                  <legend className="the-legendSuEditUse">User Details</legend>
                  {userType !== "GU" && (
                    <Row>
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
                          inputType="text"
                          placeHolder="Enter First Name"
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

                    </Row>
                  )}
                  {/* Gender */}
                  {userType === "UU" && userType !== "GU" && (
                    <Row>
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
                    </Row>
                  )}
                  {/* Organization Designation , Theme filed */}
                  {userType !== "GU" && (
                    <Row>
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

                      {userType !== "SU" && (
                        <Col xs={12} sm={6} md={4}  >
                          <SelectBox
                            required
                            label="Theme Section"
                            type="theme"
                            value={userProfileData.Theme_Section}
                            onBlur={handleBlur}
                            onblur={touched.Theme_Section}
                            onChangeError={(error) => handleChangeError('Theme_Section', error)}
                            onChange={handleChange}
                            errorMessage={errors.Theme_Section}
                            touched={touched.Theme_Section}
                            name="Theme_Section"
                            disabled
                            userType={userType}
                          />
                        </Col>
                      )}
                    </Row>
                  )}

                  {/* Country field */}
                  {userType !== "GU" && (
                    <Row>
                      <Col xs={12} sm={6} md={4}  >
                        <SelectBox
                          label="Country"
                          required
                          name="COUNTRY"
                          value={formData.COUNTRY}
                          onChange={handleCountryChange}
                          onBlur={handleBlur}
                          options={Country.getAllCountries().map((country) => ({
                            value: country.isoCode,
                            label: country.name,
                          }))}
                          errorMessage={errors.COUNTRY}
                          touched={touched.COUNTRY}
                          onblur={touched.COUNTRY}
                          type="country"
                          maxLength={30}
                          onChangeError={(error) => handleChangeError('COUNTRY', error)}
                        />
                      </Col>

                      <Col xs={12} sm={6} md={4}  >
                        <SelectBox
                          required
                          label="State"
                          name="STATE"
                          value={formData.STATE}
                          onChange={handleStateChange}
                          onBlur={handleBlur}
                          options={State.getStatesOfCountry(selectedCountry).map((state) => ({
                            value: state.isoCode,
                            label: state.name,
                          }))}
                          errorMessage={errors.STATE}
                          touched={touched.STATE}
                          type="state"
                          onblur={touched.STATE}
                          maxLength={30}
                          onChangeError={(error) => handleChangeError('STATE', error)}
                        />
                      </Col>

                      <Col xs={12} sm={6} md={4}  >
                        <SelectBox
                          required
                          label="City"
                          name="CITY"
                          value={formData.CITY}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          options={cities.map((city) => ({
                            value: city.name,
                            label: city.name,
                          }))}
                          errorMessage={errors.CITY}
                          touched={touched.CITY}
                          type="city"
                          onblur={touched.CITY}
                          maxLength={20}
                          onChangeError={(error) => handleChangeError('CITY', error)}
                        />
                      </Col>
                    </Row>
                  )}

                  {/* Address1, 2 Pincode */}
                  {userType === "UU" && (
                    <Row>
                      <Col xs={12} sm={6} md={4}  >
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
                      <Col xs={12} sm={6} md={4}  >
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

                      <Col xs={12} sm={6} md={4}  >
                        <FormInputGroup
                          label="Pin Code"
                          required
                          value={formData.PIN_CODE}
                          type="pincode"
                          onBlur={handleBlur}
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
                    </Row>
                  )}
                  {/* Mobile , LAN, Location */}
                  <Row>
                    {(userType == "SU" || userType === "AU") && (
                      <>
                        <Col xs={12} sm={6} md={4}  >
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

                        <Col xs={12} sm={6} md={4}  >
                          <FormInputGroup
                            label="Phone (LAN)"
                            value={formData.PHONE_LAN}
                            type="PHONE_LAN"
                            onBlur={handleBlur}
                            onblur={touched.PHONE_LAN}
                            maxLength={15}
                            onChangeError={(error) => handleChangeError('PHONE_LAN', error)}
                            onChange={handleChange}
                            errorMessage={errors.PHONE_LAN}
                            name="PHONE_LAN"
                            touched={touched.PHONE_LAN}
                            inputType="text"
                            placeHolder="Phone (LAN)"
                          />

                        </Col>

                        <Col xs={12} sm={6} md={4}  >
                          <FormInputGroup
                            label="Location"
                            value={formData.LOCATION}
                            type="Location"
                            onBlur={handleBlur}
                            onblur={touched.LOCATION}
                            maxLength={50}
                            onChangeError={(error) => handleChangeError('LOCATION', error)}
                            onChange={handleChange}
                            errorMessage={errors.LOCATION}
                            name="LOCATION"
                            touched={touched.LOCATION}
                            inputType="text"
                            placeHolder="Location"
                          />
                        </Col>
                      </>
                    )}
                  </Row>
                  {/* Username, Email Credentials */}
                  <Row>
                    <Col xs={12} sm={6} md={4}  >
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
                        disabled
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}  >
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
                        disabled

                      />
                    </Col>

                    {(userType === "UU" || userType === "GU") && (

                      <Col xs={12} sm={6} md={4}  >
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

                    )}

                    {(userType === "SU" || userType === "AU") && (
                      <></>
                      // <Col md="4" className="Col-Class-2">
                      //   <Form.Label>
                      //     Email Id (ALT)
                      //     <span className="error-messageSU">
                      //       {altEmailError && altEmailError}
                      //     </span>
                      //     {altEmailError === '' &&
                      //       <MaxLengthErrorMessage
                      //         isVisible={formik.values.ALT_EMAIL.length >= inputFields[13].maxLength}
                      //         InputFields={inputFields[13].maxLength}
                      //       />
                      //     }
                      //   </Form.Label>
                      //   <Form.Group className="mb-4">
                      //     <Form.Control
                      //       size="lg"
                      //       className={`Input-Text ${altEmailError ? "is-invalid" : ""
                      //         }`}
                      //       type="text"
                      //       name="ALT_EMAIL"
                      //       value={
                      //         formik.values.ALT_EMAIL !== ""
                      //           ? formik.values.ALT_EMAIL
                      //           : altEmail
                      //       }
                      //       onChange={handleAltEmailChange}
                      //       onBlur={() => setAltEmailError(validateAltEmail(altEmail))}
                      //       maxLength={100}
                      //     />
                      //   </Form.Group>
                      // </Col>
                    )}
                  </Row>

                </fieldset>

                <span className="">
                  <h4 className="Manage-UserProfile" >
                    Manage Profile Account
                  </h4>
                </span>
                <Row>
                  <Col className="Profile-SaveBtn">


                    <CentraliseButton
                      className=""
                      type="submit"
                      text="SAVE"
                      // onClick={HandleGeneraform}
                      variant="#026d02"
                      padding="3px 3px"
                      hoverBgColor="#2b6e5bcf"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />

                    <CentraliseButton
                      className=" ml-lg-5 ml-md-5 ml-sm-5  ml-xs-0 my-sm-2 ml-xl-5 "
                      // type="submit"
                      text=" CANCEL"
                      variant="#ab683f"
                      padding="3px 3px"
                      hoverBgColor="#ab683f9e"
                      // hoverBgColor="#ab553f"
                      hoverTextColor="white"
                      onClick={() => dispatch(hideUpdateProfile())}
                      fontsize="15px"
                      width="150px"
                    />






                    {/* <Button
                    type="submit"
                    variant="success"
                    size="sm"
                  // onClick={handleSuccessModalClose}
                  >
                    SAVE
                  </Button> */}
                  </Col>
                </Row>
              </Form>
            </CentraliseheaderBody>

          </div>
        </div>
      </div>
    </div >
  );
};

export default UpdateUserProfile;
