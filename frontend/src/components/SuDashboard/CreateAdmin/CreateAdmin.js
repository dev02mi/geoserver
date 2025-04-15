import React, { useState, useEffect } from "react";
import "./CreateAdmin.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { City, Country, State } from "country-state-city";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import ViewProfile from "../../viewprofile/ViewProfile";
import { useLocation, useNavigate } from "react-router-dom";
import ViewDetails from "./ViewDetails/ViewDetails";
// loader
import Preloader from "../../Preloader/Preloader";
import { useSelector } from "react-redux";
import CentraliseheaderBody from "../../Centraliseheaderbody/CentraliseheaderBody";
import CentraliseButton from "../../CentraliseButton/CentraliseButton";
import FormInputGroup from "../../../ReuseCompomenent/FormInputGroup";
import SelectBox from "../../../ReuseCompomenent/SelectBox";
import CentraliseButtonForActivestatus from "../../CentraliseButton/CentraliseButtonForActivestatus";
// import useValidation from '../../Custom_Validations/useValidation';



function CreateAdmin({ userType, userName, }) {

  const newaccessToken = useSelector((state) => state.auth.accessToken);
  const [showTable, setShowTable] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfile, setIsProfile] = useState(false);
  const fixedTableHeight = "225px";
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const adminDeleteValue = queryParams.get("ADMIN_DELETE");
  const replaceAdminId = queryParams.get("AUID");
  const themeOptValue = queryParams.get("Theme_Section");
  const selectedAdminType = queryParams.get("ADMIN_TYPE");
  const userIndexId = queryParams.get("INDEX");
  const SU_APRO_REM = queryParams.get("SU_APRO_REM");
  const [detailsViewed, setShowViewDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adminType, setAdminType] = useState("WCADMIN");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [legendHeading, setLegendHeading] = useState('Workcenter Admin Registration');
  const [themeList, setThemeList] = useState([]);
  const [fetchedAdminType, setFetchedAdminType] = useState(null);

  const initialParams = {
    adminDeleteValue,
    replaceAdminId,
    themeOptValue,
    selectedAdminType,
    userIndexId,
    SU_APRO_REM
  };

  const [params, setParams] = useState(initialParams);

  useEffect(() => {
    // Clean the URL by navigating to the same route without parameters
    if (location.search) {
      navigate('/CreateAdmin', { replace: true });
    }

    // Cleanup function to reset state when component is unmounted
    return () => {
      setParams(initialParams);
    };
  }, [location.search, navigate]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/themes_value/?admin_type=${adminType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newaccessToken}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          const themeList = response.data;
          // setThemeList(
          //   themeList
          //     .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
          //     .map(theme => ({ label: theme, value: theme }))
          // );

          setThemeList(
            themeList
              .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
              .map(theme => ({
                label: theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase(), // Convert to title case
                value: theme
              }))
          );
          setFetchedAdminType(adminType); // Track the adminType that was fetched
        }
      } catch (error) {
        console.error("API request failed:", error);
      }
    };
    if (adminType !== fetchedAdminType) {
      fetchData();
    }
  }, [adminType, newaccessToken, fetchedAdminType]);

  useEffect(() => {
    if (themeOptValue) {
      const formattedOptions = [{ value: themeOptValue.trim(), label: themeOptValue.trim() }];
      setThemeList(formattedOptions);
    }
  }, [themeOptValue]);

  useEffect(() => {
    if (replaceAdminId) {
      handleAdminSelect(selectedAdminType);
      setFormData((prevFormData) => ({
        ...prevFormData,
        "Theme_Section": params.themeOptValue !== null ? params.themeOptValue : null,
      }));

    }
  }, [params.themeOptValue]);


  const headings1 = [
    "Sr No",
    "User Id",
    "User Name",
    "Admin Type",
    // "FirstName",
    // "MiddleName",
    // "LastName",
    // "Organization",
    // "Designation",
    "Theme Section",
    "Su Status",
    "Creation Date",
    "Action Date",
    "Profile",
  ];

  const handleProfile = (index, type) => {
    const selectedUser = userData[index];
    setSelectedUser(selectedUser);
    setIsProfile(true);
  };

  const closeModal = () => {
    setIsProfile(false);
  };

  const countryCodes = [
    { code: "+91", name: "IND" },
    // { code: '+1', name: 'USA' },
    // Add more country codes here
  ];

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const formattedDateTime = new Intl.DateTimeFormat(
        "en-US",
        options
      ).format(now);
      setCurrentDateTime(`${formattedDateTime}`);
    };
    updateDateTime();

    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    if (newaccessToken) {
      fetchData();
    }

  }, [newaccessToken]);

  const fetchData = async () => {
    try {
      // setIsLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/admin_url/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const userDataFromResponse = response.data.message;

        setUserData(userDataFromResponse);

        // Store userDataFromResponse in local storage
        sessionStorage.setItem(
          "user_data",
          JSON.stringify(userDataFromResponse)
        );
      }
    } catch (error) {
      console.error("API request failed:", error);
    } finally {
      // Set isLoading to false after the API call is complete
      // setIsLoading(false);

    }
  };

  const handleViewtable = async () => {
    setShowTable(!showTable);
  };



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


  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };



  const handleSubmitForm = (event) => {

    event.preventDefault();

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

    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));

    //console.log(filteredErrors, "filteredErrordfvbdfs");

    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.USERNAME &&
      formData.EMAIL &&
      formData.USER_TYPE &&
      formData.FIRST_NAME &&
      formData.LAST_NAME &&
      formData.MOBILE_NO &&
      formData.CITY &&
      formData.STATE &&
      formData.COUNTRY &&
      formData.ORGANIZATION &&
      formData.DESIGNATION &&
      formData.Theme_Section

    ) {

      const newFormData = {
        ...formData,
        ADMIN_TYPE: adminType
      };

      setFormData(newFormData);
      setShowViewDetailsModal(true);


    } else {


      console.log("OLLLLd")
      setErrors(filteredErrors);
      console.log("Form contains errors", filteredErrors);
    }

  }

  const getRowBackgroundColor = (user) => {
    if (user?.SU_APRO_STAT === "APPROVED") {
      return "#ACE1AF";
    } else if (user.SU_APRO_STAT === "BLOCKED") {
      return "#A9A9A9";
    } else if (user.SU_APRO_STAT === "REPLACE") {
      return "rgb(209 171 171)";
    }
    else if (user.SU_APRO_STAT === "PENDING") {
      return "#00298054";
    }
  };

  function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return dateObject.toLocaleDateString("en-GB", options); // 'en-GB' ensures dd/mm/yyyy format
  }



  const handleGoBack = () => {
    const urlParams = new URLSearchParams({
      indexId: params.userIndexId,
      replaceAdminId: params.replaceAdminId,
      nType: adminType,
      newTheme: params.themeOptValue,
    });

    navigate(`/SuEditUser?${urlParams.toString()}`);
  };

  // const [formData, setFormData] = useState({
  //   USERNAME: "",
  //   EMAIL: "",
  //   USER_TYPE: "AU",
  //   FIRST_NAME: "",
  //   MIDDLE_NAME: "",
  //   LAST_NAME: "",
  //   MOBILE_NO: "",
  //   CITY: "",
  //   STATE: "",
  //   COUNTRY: "",
  //   ORGANIZATION: "",
  //   DESIGNATION: "",
  //   Theme_Section: "",
  //   PHONE_LAN: "",
  //   LOCATION: "",
  //   EMAIL_ALT: "",
  // });



  const initialFormData = {
    USERNAME: "",
    EMAIL: "",
    USER_TYPE: "AU",
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    MOBILE_NO: "",
    CITY: "",
    STATE: "",
    COUNTRY: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    Theme_Section: "",
    PHONE_LAN: "",
    LOCATION: "",
    EMAIL_ALT: "",
  };

  const [formData, setFormData] = useState(initialFormData);


  // const [touched, setTouched] = useState({
  //   USERNAME: false,
  //   EMAIL: false,
  //   USER_TYPE: false,
  //   FIRST_NAME: false,
  //   MIDDLE_NAME: false,
  //   LAST_NAME: false,
  //   MOBILE_NO: false,
  //   CITY: false,
  //   STATE: false,
  //   COUNTRY: false,
  //   PIN_CODE: false,
  //   ORGANIZATION: false,
  //   DESIGNATION: false,
  //   Theme_Section: false,
  //   PHONE_LAN: false,
  //   LOCATION: false,
  //   EMAIL_ALT: false
  // });

  // const [errors, setErrors] = useState({
  //   USERNAME: "",
  //   EMAIL: "",
  //   USER_TYPE: "",
  //   FIRST_NAME: "",
  //   MIDDLE_NAME: "",
  //   LAST_NAME: "",
  //   DOB: "",
  //   MOBILE_NO: "",
  //   CITY: "",
  //   STATE: "",
  //   COUNTRY: "",
  //   ORGANIZATION: "",
  //   DESIGNATION: "",
  //   Theme_Section: "",
  //   PHONE_LAN: "",
  //   LOCATION: "",
  //   EMAIL_ALT: ""
  // });

  // Define initial touched and errors outside the component
  const initialTouched = {
    USERNAME: false,
    EMAIL: false,
    USER_TYPE: false,
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    MOBILE_NO: false,
    CITY: false,
    STATE: false,
    COUNTRY: false,
    PIN_CODE: false,
    ORGANIZATION: false,
    DESIGNATION: false,
    Theme_Section: false,
    PHONE_LAN: false,
    LOCATION: false,
    EMAIL_ALT: false,
  };

  const initialErrors = {
    USERNAME: "",
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
    ORGANIZATION: "",
    DESIGNATION: "",
    Theme_Section: "",
    PHONE_LAN: "",
    LOCATION: "",
    EMAIL_ALT: "",
  };

  // Initialize the state
  const [touched, setTouched] = useState(initialTouched);
  const [errors, setErrors] = useState(initialErrors);

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
      STATE: '',
      CITY: '',
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
    setErrors((prevErrors) => ({
      ...prevErrors,
      CITY: '',
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      CITY: true,
    }));

    setCities(City.getCitiesOfState(selectedCountry, state));
  };


  // const handleCountryChange = (e) => {
  //   const country = e.target.value;
  //   setSelectedCountry(country);
  //   setFormData({
  //     ...formData,
  //     COUNTRY: country,
  //     STATE: '',
  //     CITY: '',
  //   });
  //   setSelectedState('');
  //   setCities([]);

  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     STATE: 'State is required',
  //     CITY: 'City is required',
  //   }));
  //   setTouched((prevTouched) => ({
  //     ...prevTouched,
  //     STATE: true,
  //     CITY: true,
  //   }));
  // }

  // const handleStateChange = (e) => {
  //   const state = e.target.value;
  //   setSelectedState(state);
  //   setFormData({
  //     ...formData,
  //     STATE: state,
  //     CITY: '',
  //   });
  //   setCities(City.getCitiesOfState(selectedCountry, state));
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


    if (name === 'EMAIL' || name === "EMAIL_ALT") {
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

    if (name === 'PHONE_LAN') {

      if (!/^[\d-]*$/.test(value)) {
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
  };

  const handleAdminSelect = (value) => {
    // Reset formData to initial values
    setFormData(initialFormData);
    setTouched(initialTouched);
    setErrors(initialErrors);

    setAdminType(value);

    if (value === "WCADMIN") {
      setLegendHeading("WorkCenter Admin Registration");
    } else if (value === "UDADMIN") {
      setLegendHeading("UserDepartment Admin Registration");
    }
  };

  const handleBackButtonClick = () => {
    // Redirect to the login page
    navigate('/login');
  };

  const capitalizeThemeSection = (section) => {
    return section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
  };


  return (
    <Container fluid className="create-admin">
      <Preloader loading={loading} progress={progress} />
      <ToastContainer />
      <Row className="justify-content-center align-items-center m-5">

        <div>
          <CentraliseheaderBody
            className="CreateAdmin-Card-Body"
            header={(
              <>
                {params.replaceAdminId ? 'Replace' : 'Create'} ADMIN User : {userName} (SU)
              </>
            )}
            //  header=" Registration"
            logo="GEOPICX_LOGO.png"
            headerBgColor="rgb(64 37 136)"        // Set your desired header background color
            headerTextColor="white"
            onClose={handleBackButtonClick}

          >
            {/* Add div date time */}

            <div class="container-flex justify-content-start">
              {/* <div class="col-4 d-flex"> */}
              {/* <h4 className="admin-heading my-0">
              {replaceAdminId ? 'Replace' : 'Create'} ADMIN User : Super User ({userName})
            </h4> */}
              &nbsp;
              <hr className="Horizontal-Line mb-1 mt-15"></hr>
              {/* </div> */}
            </div>


            <div className="Create-admin-button">

              {/* <button
                className={`btn px-3 my-1 fontAdminH ${adminType === "WCADMIN" ? 'btn-success' : 'btn_outline_primary'}`}
                onClick={() => handleAdminSelect("WCADMIN")}
                disabled={adminType === params.selectedAdminType}
              >
                CREATE Workcenter ADMIN
              </button> */}
              <CentraliseButtonForActivestatus
           
                text="CREATE Workcenter ADMIN"
                onClick={() => handleAdminSelect("WCADMIN")}
                isActive={adminType === "WCADMIN"}
                disabled={adminType === params.selectedAdminType}
                activeVariant="green"
                inactiveVariant="#808080a8"
                padding="6px 6px"
                //  textColor="black"
                width="auto"
                fontsize="15px"
                className={`btn px-3 my-1 fontAdminH ${adminType === "WCADMIN" ? 'btn-success' : 'btn_outline_primary'}`}

              />

              <CentraliseButtonForActivestatus
                text="CREATE Department ADMIN"
                onClick={() => handleAdminSelect("UDADMIN")}
                isActive={adminType === "UDADMIN"}
                disabled={adminType === params.selectedAdminType}
                activeVariant="green"
                inactiveVariant="#808080a8"
                // variant="#808080a8" 
                // hoverBgColor="skyblue" 
                // hoverTextColor="white" 
                padding="6px 6px" // Padding
                //  textColor="black"
                width="auto" // Width
                fontsize="15px" // Font size
                className={`btn px-3 my-1 fontAdminH ${adminType === "UDADMIN" ? 'btn-success' : 'btn_outline_primary'}`}
              />

              {/* <button
                className={`btn px-3 my-1 fontAdminH ${adminType === "UDADMIN" ? 'btn-success' : 'btn_outline_primary'}`}
                onClick={() => handleAdminSelect("UDADMIN")}
                disabled={adminType === params.selectedAdminType}
              >
                CREATE Department ADMIN
              </button> */}
            </div>

            <hr className="Horizontal-Line mb-1 mt-2"></hr>

            <Card.Body className="px-4">

              {/* Adding div Heading */}
              <Form onSubmit={handleSubmitForm}>
                <fieldset className="the-fieldsetAdmin  px-5">
                  <legend className="the-legend">{legendHeading}</legend>
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

                  </Row>

                  {/* Designation & theme fields */}
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

                    <Col xs={12} sm={6} md={4}  >

                      <SelectBox
                        required
                        label="Theme Section"
                        type="theme"
                        value={themeOptValue ? themeOptValue : formData.Theme_Section}
                        onBlur={handleBlur}
                        onblur={touched.Theme_Section}
                        options={themeList}
                        onChangeError={(error) => handleChangeError('Theme_Section', error)}
                        onChange={handleChange}
                        errorMessage={errors.Theme_Section}
                        touched={touched.Theme_Section}
                        name="Theme_Section"
                        disabled={params.SU_APRO_REM ? params.SU_APRO_REM : ""}
                        userType={userType}
                      />
                    </Col>



                  </Row>

                  {/* Country Fields */}
                  <Row>
                    <Col xs={12} sm={6} md={4}   >
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

                    <Col xs={12} sm={6} md={4}   >
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

                    <Col xs={12} sm={6} md={4}   >
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
                  </Row>

                  {/* Mobile No Fields */}
                  <Row>
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
                      // inputboxClass="inputBox_wraper_box"
                      />

                    </Col>

                    <Col xs={12} sm={6} md={4}  >
                      <FormInputGroup
                        label="Location"
                        value={formData.LOCATION}
                        type="Location"
                        onBlur={handleBlur}
                        onblur={touched.LOCATION}
                        onChangeError={(error) => handleChangeError('LOCATION', error)}
                        onChange={handleChange}
                        errorMessage={errors.LOCATION}
                        name="LOCATION"
                        touched={touched.LOCATION}
                        inputType="text"
                        placeHolder="Location"
                        maxLength={50}
                      // inputboxClass="inputBox_wraper_box"
                      />
                    </Col>

                  </Row>
                  {/* User Credentials */}
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
                      />
                    </Col>
                    <Col xs={12} sm={6} md={4}  >
                      <FormInputGroup
                        label="Email Id (ALT)"
                        value={formData.EMAIL_ALT}
                        type="EMAIL_ALT"
                        onBlur={handleBlur}
                        onblur={touched.EMAIL_ALT}
                        maxLength={100}
                        onChangeError={(error) => handleChangeError('EMAIL_ALT', error)}
                        onChange={handleChange}
                        errorMessage={errors.EMAIL_ALT}
                        name="EMAIL_ALT"
                        touched={touched.EMAIL_ALT}
                        inputType="email"
                        placeHolder="Enter Your (ALT) Email"
                      />
                    </Col>

                  </Row>
                  <div class="row justify-content-end">
                    <div class="col-md-6  text-right">
                      <p className="mb-0 Cre-admin-Time">
                        <strong>Date:</strong> {currentDateTime}
                      </p>
                    </div>
                  </div>
                  {/* <p className="mb-0  justify-content-end d-flex align-items- end mt-2">
                    <strong className="Cre-admin-Time">Date: {currentDateTime}</strong>
                  </p> */}
                </fieldset>

                <div class="row d-flex justify-content-center mt-5 mb-4 mx-3">
                  {/* <Row  class="row d-flex justify-content-center"> */}
                  <div class="col-lg-6  col-md-6 d-flex justify-content-center  col-sm-12">
                    {/* <Button
                    type="button"
                    variant="btn btn-info"
                    className=""
                    size="sm"
                    class="btn btn-info"
                    onClick={handleViewtable}
                  >
                    View Table
                  </Button> */}
                    <CentraliseButton
                    className="Mobileviewhide"
                      type="button"
                      text={showTable ? "HIDE TABLE" : "VIEW TABLE"}
                      variant="#1588b7"
                      padding="6px 20px"
                      hoverBgColor="skyblue"
                      hoverTextColor="white"
                      onClick={handleViewtable}
                      width="250px"
                      fontsize="14px"
                    />
                  </div>
                  <div class="col-lg-6 col-md-6 d-flex justify-content-center  col-sm-12">
                    {/* <Col className="CreateAdminBtn"> */}
                    <CentraliseButton
                      type="submit"
                      text={<> {params.themeOptValue ? 'CREATE & REPLACE ADMIN ACCOUNT' : 'CREATE ADMIN ACCOUNT'}</>}
                      onClick={handleSuccessModalClose}
                      // onClick={handleBackButtonClick }
                      variant="#026d02"
                      padding="6px 6px"
                      hoverBgColor="#2b6e5bcf"
                      hoverTextColor="white"
                      width="250px"
                      fontsize="14px"
                    />
                    {/* <Button
                    type="submit"
                    variant="success"
                    className=""
                    size="sm"
                    class="btn btn-success"
                    onClick={handleSuccessModalClose}
                  >
                    {params.themeOptValue ? 'Create & Replace ADMIN Account' : 'Create ADMIN Account'}
                  </Button> */}
                    {/* </Col> */}
                  </div>
                  {params.themeOptValue !== null && (
                    <div class="col d-flex justify-content-center ">
                      {/* <Col className="A-CancelBtn"> */}
                      {/* <Button
                        type="button"
                        class="btn btn-danger"
                        size="sm"
                        onClick={handleGoBack}
                      >
                        Go Back
                      </Button> */}
                      <CentraliseButton
                        type="submit"
                        text="GO BACK"
                        // text={<> {params.themeOptValue ? 'Create & Replace ADMIN Account' : 'Create ADMIN Account'}</>}
                        onClick={handleGoBack}
                        // onClick={handleBackButtonClick }
                        variant="indigo"
                        padding="0px 6px"
                        hoverBgColor="#2b6e5bcf"
                        hoverTextColor="white"
                        width="150px"
                        fontsize="14px"
                      />
                      {/* </Col> */}
                    </div>
                  )}
                  {/* </Row> */}
                </div>
              </Form>
            </Card.Body>
          </CentraliseheaderBody>
        </div>
      </Row>

      {/*----------------------- Table -----------------------------*/}
      <div class=" ">

        <div className="Table-Body mx-0 mb-3">
          {showTable && (
            <>
              <div className="text-center">
                <strong className="AdminList" >Admin List</strong>
              </div>
              <div
                className="table-container"
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  // marginTop: "-51px ",
                  height: fixedTableHeight,
                  scrollbarWidth: "auto",
                }}
              >
                {/* <Table striped bordered hover> */}
                {/* <span>
                <strong className="">ADMIN LIST</strong>
              </span> */}
                <table className="SU-AU-Table">
                  <thead>
                    <tr className="text-dark">
                      {headings1.map((heading, index) => (
                        <th key={index} >

                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userData &&
                      userData.map((user, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor: getRowBackgroundColor(user),
                          }}
                        >
                          <td className="SR-Space">{index + 1}</td>
                          <td className="Create-AU-TD">{user?.USERID}</td>
                          <td className="Create-AU-TD">{user?.USERNAME}</td>
                          <td className="Create-AU-TD">{user?.ADMIN_TYPE ? capitalizeThemeSection(user.ADMIN_TYPE) : ''}</td>

                          <td className="Create-AU-TD">
                            {user?.Theme_Section ? capitalizeThemeSection(user.Theme_Section) : ''}
                          </td>

                          {/* <td className={`Create-AU-TD ${user?.SU_APRO_STAT === "BLOCKED" ? "Bold-text" : ""
                              }`}
                          > */}
                          <td className="Create-AU-TD">
                            {user?.SU_APRO_STAT ? capitalizeThemeSection(user.SU_APRO_STAT) : ''}
                          </td>
                          {/* <td className="Create-AU-TD">{user?.AU_APRO_STAT}</td> */}
                          <td className="CR-Date">
                            {formatDate(user?.CREATION_DATE)}
                          </td>
                          <td className="Create-AU-TD">
                            {user?.APRO_DATE ? formatDate(user.APRO_DATE) : null}
                          </td>
                          <td
                            className="Create-AU-TD"
                            onClick={() => handleProfile(index, "AU")}
                          >
                            {
                              <img
                                src="UserProfile.png"
                                alt="Site Logo"
                                width="25"
                                height="25"
                              />
                            }
                          </td>

                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* END */}
          {isProfile && (
            <ViewProfile
              isOpen={isProfile}
              selectedUser={selectedUser}
              onClose={closeModal}
            />
          )}

          {detailsViewed && (
            <ViewDetails
              isOpen={detailsViewed}
              closeModal={() => setShowViewDetailsModal(false)}
              adminData={formData}
              setDetailsViewed={setShowViewDetailsModal}
              selectedTheme={params.themeOptValue}
              selectedAdminType={params.selectedAdminType}
              replaceAdminId={params.replaceAdminId}
              fetchData={fetchData}
              SU_APRO_REM={params.SU_APRO_REM}
            />
          )}
        </div>
      </div>
    </Container>
  );
}

export default CreateAdmin;
