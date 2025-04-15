import React, { useState, useEffect } from "react";
import "./SuEditUser.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import { City, Country, State } from "country-state-city";
import axios from "axios";
import SuModal from "../SuModal/SuModal.js";
import ViewProfile from "../../viewprofile/ViewProfile.js";
import Preloader from "../../Preloader/Preloader.js";
import ModalManager from "../../GeopicxPopupModals/ModalManager.js";
import { useDispatch, useSelector } from "react-redux";
import { adminFormClose, adminFormopen } from "../../StoreContext/features/profile/modalReducer.js";
import { useLocation, useNavigate } from 'react-router-dom';
import CentraliseheaderBody from "../../Centraliseheaderbody/CentraliseheaderBody.js";
import CentraliseButton from "../../CentraliseButton/CentraliseButton.js";
import FormInputGroup from "../../../ReuseCompomenent/FormInputGroup.js";
import { GenderType, startSelectableDateISO, maxDateForDOBISO, removeWarningMassege } from "../../Constant";
import SelectBox from "../../../ReuseCompomenent/SelectBox.js";
import Validators from "../../../ReuseCompomenent/validators.js";
import CentraliseButtonForActivestatus from "../../CentraliseButton/CentraliseButtonForActivestatus.js";

function SuEditUser({ userName }) {

  const isOpenprofile = useSelector((state) => state.modal.isadminformOpen);
  const newaccessToken = useSelector((state) => state.auth.accessToken);

  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const replaceAdminId = query.get('replaceAdminId');
  const indexId = query.get('indexId');
  const nType = query.get('nType');
  const selectedBackTheme = query.get('newTheme');
  const [showAdminTable, setShowTable] = useState(true);
  const [showGeneralTable, setGeneralShowTable] = useState(false);
  const [showAuthorizedTable, setShowAuthorizedTable] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isUserType, setUserType] = useState("");
  const [activeButton, setActiveButton] = useState("WCADMIN");
  const [isFirstTdClicked, setFirstTdClicked] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [authData, setAuthData] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [generalData, setGeneralData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isProfile, setIsProfile] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [isselectedType, setIsSelectedType] = useState(null);
  const [isSuModalOpen, setSuModalOpen] = useState(false);
  const [uuId, setUUId] = useState(null);
  const [auCurrentDate, setCurrentDate] = useState(null);
  const [isTheme, isSelectedTheme] = useState("");
  const [uuCount, setUUCount] = useState(null);
  const [userstatus, setUserstatus] = useState(null);
  const [userStaus, setUserStatus] = useState(null);
  const [currentDateremark, setCurrentDateform] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  // loading component//
  const [isLoading, setIsLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState([]);
  const [adminType, setAdminType] = useState(nType ? nType : 'WCADMIN');
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [gender, setGender] = useState('');

  // Function to clear URL parameters
  const clearUrlParams = () => {
    const params = new URLSearchParams(location.search);
    params.delete('replaceAdminId');
    params.delete('indexId');
    params.delete('nType');
    params.delete('newTheme');
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleChangeGender = (e) => {
    const { value } = e.target;
    setGender(value);
  };

  const [formData, setFormData] = useState({
    USERNAME: "",
    EMAIL: "",
    USER_TYPE: "",
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    MOBILE_NO: "",
    GENDER: "",
    DOB: "",
    CITY: "",
    STATE: "",
    COUNTRY: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    Theme_Section: "",
    PHONE_LAN: "",
    LOCATION: "",
    EMAIL_ALT: "",
    SU_APRO_REM: "",
    ADDRESS_1: "",
    ADDRESS_2: "",
    SU_APRO_STAT: "",
    SU_APRO_REM: "",
    AU_APRO_STAT: ""
  });

  const [touched, setTouched] = useState({
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
    SU_APRO_REM: false,
    EMAIL_ALT: false

  });

  const [errors, setErrors] = useState({
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
    SU_APRO_REM: "",
    EMAIL_ALT: "",

  });

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
    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: "",
      CITY: 'Field is required',
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      CITY: true,
    }));

    setCities(City.getCitiesOfState(selectedCountry, state));
  };


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
      name === "LOCATION" ||
      name === "SU_APRO_REM"
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
  };

  const handleREMARK = (SU_APRO_REM) => {
    navigate(`/CreateAdmin?AUID=${editUserId}&Theme_Section=${isTheme}&ADMIN_TYPE=${adminType}&INDEX=${selectedUserIndex}&SU_APRO_REM=${SU_APRO_REM}`);
  };

  useEffect(() => {
    dispatch(adminFormClose())
  }, []);

  // MaxLength \\
  const inputFields = [
    { name: "FIRST_NAME", maxLength: 20 },
    { name: "MIDDLE_NAME", maxLength: 20 },
    { name: "LAST_NAME", maxLength: 20 },
    { name: "ORGANIZATION", maxLength: 100 },
    { name: "DESIGNATION", maxLength: 50 },
    { name: "ADDRESS_1", maxLength: 100 },
    { name: "ADDRESS_2", maxLength: 100 },
    { name: "PIN_CODE", maxLength: 6 },
    { name: "MOBILE_NO", maxLength: 10 },
    { name: "LAN_LINE", maxLength: 15 },
    { name: "OFF_LOCA", maxLength: 50 },
    { name: "USERNAME", maxLength: 20 },
    { name: "EMAIL", maxLength: 100 },
    { name: "ALT_EMAIL", maxLength: 100 },
    { name: "SU_APRO_REM", maxLength: 100 },
  ];

  const [inputClicked, setInputClicked] = useState({
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    ORGANIZATION: false,
    DESIGNATION: false,
    ADDRESS_1: false,
    ADDRESS_2: false,
    PIN_CODE: false,
    MOBILE_NO: false,
    LAN_LINE: false,
    OFF_LOCA: false,
    USERNAME: false,
    EMAIL: false,
    ALT_EMAIL: false,
    SU_APRO_REM: false,
  });

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

  const handleSuCloseModal = () => {
    setSuModalOpen(false);
    setIsLoading(false);
    // if(isUserType === 'GU'){
    //   setShowModal(false);
    // }
  };

  const checkAdminType = () => {
    if (adminType === 'WCADMIN') {
      sessionStorage.setItem('adminType', 'WCADMIN');
      setAdminType('WCADMIN');
    } else {
      sessionStorage.setItem('adminType', 'UDADMIN');
      setAdminType('UDADMIN');
    }
  };

  const countryCodes = [
    { code: "+91", name: "IND" },
    // { code: '+1', name: 'USA' },
    // Add more country codes here
  ];

  useEffect(() => {
    const storedAdminType = sessionStorage.getItem('adminType');
    if (storedAdminType) {
      setAdminType(storedAdminType);
      setActiveButton(storedAdminType);
      sessionStorage.removeItem('adminType'); // Remove the value after setting it
    }
  }, [activeButton, adminType]);

  useEffect(() => {
    if (newaccessToken) {
      fetchData();
    }
  }, [adminType, newaccessToken]);


  const fetchData = async () => {
    setIsLoading(false);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/admin_url/?ADMIN_TYPE=${adminType}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const userDataFromResponse = response.data.message;
        setUserData(userDataFromResponse);
        setInputClicked(false);
      }
    } catch (error) {
      console.error("API request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };


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
    // "Country",
    // "State",
    // "City",
    // "Email Id",
    // "Mobile No",
    "Su Status",
    //"AU STATUS",
    "Creation Date",
    "Action Date",
    "Profile",
    "Manage",
  ];

  const headings2 = [
    "Sr No",
    "User Id",
    "User Name",
    "User Type",
    // "FirstName",
    // "MiddleName",
    // "LastName",
    // "Organization",
    // "Designation",
    "Theme Section",
    // "Country",
    // "State",
    // "City",
    // "Email Id",
    // "Mobile No",
    "Su Status",
    "Au Status",
    "Creation Date",
    "Action Date",
    "Profile",
    "Manage",
  ];

  const headings3 = [
    "Sr No",
    "User Id",
    "User Name",
    "User Type",
    // "Email Id",
    // "Mobile No",
    "Su Status",
    "Creation Date",
    "Action Date",
    "Manage",
  ];
  const fixedTableHeight = "400px";

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
    // Update the date and time initially
    updateDateTime();

    // Update the date and time every second (you can adjust the interval as needed)
    const intervalId = setInterval(updateDateTime, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleAdminEditClick = (
    index,
    userId,
    type,
    // userName,
    theme,
    userStatus
  ) => {
    setSelectedUserIndex(index);
    setEditUserId(userId);
    // setShowModal(true);
    setUserType("AU");
    setIsSelectedType(type);
    isSelectedTheme(theme);
    setUserstatus(userStatus);
    uuCOUNT_Api(userId);
    dispatch(adminFormopen())
  };

  const handleAuthEditClick = (
    index,
    userId,
    type,
    theme,
    userName,
    userStatus
  ) => {
    dispatch(adminFormopen());
    setSelectedUserIndex(index);
    // setShowModal(true);
    setUserType("UU");
    setEditUserId(userId);
    setIsSelectedType(type);
    isSelectedTheme(theme);
    // fetchModuleGetData(userId);
    setUserstatus(userStatus);
  };

  const handleGenralEditClick = (index, userId, type, userStatus) => {
    dispatch(adminFormopen());
    setSelectedUserIndex(index);
    setShowModal(true);
    setUserType("GU");
    setIsSelectedType(type);
    setEditUserId(userId);
    setUserstatus(userStatus);
  };


  const countryvalue = initialFormValues.COUNTRY;
  const stateValue = initialFormValues.STATE;

  const getCountryName = (isoCode) => {
    if (countryvalue === isoCode) {
      return countryvalue;
    }
    const country = Country.getAllCountries().find(
      (c) => c.isoCode === isoCode
    );
    return country ? country.name : "";
  };

  const getStateName = (countryIsoCode, stateIsoCode) => {
    if (stateValue === stateIsoCode) {
      return stateValue;
    }
    const states = State.getStatesOfCountry(countryIsoCode);
    const state = states.find((s) => s.isoCode === stateIsoCode);

    return state ? state.name : "";
  };

  const initialValues = {
    USERNAME: initialFormValues?.USERNAME || "",
    MOBILE_NO: initialFormValues?.MOBILE_NO || "",
    EMAIL: initialFormValues?.EMAIL || "",
    USER_TYPE: isUserType,
    Theme_Section: initialFormValues?.Theme_Section || "",
    SU_APRO_REM: initialFormValues?.SU_APRO_REM || "",
    APRO_DATE: initialFormValues?.APRO_DATE || null,
    USERID: initialFormValues?.USERID || "",

    logindata: {
      FIRST_NAME: initialFormValues?.FIRST_NAME || "",
      MIDDLE_NAME: initialFormValues?.MIDDLE_NAME || "",
      LAST_NAME: initialFormValues?.LAST_NAME || "",
      ORGANIZATION: initialFormValues?.ORGANIZATION || "",
      DESIGNATION: initialFormValues?.DESIGNATION || "",
      COUNTRY: initialFormValues?.COUNTRY || "",
      STATE: initialFormValues?.STATE || "",
      CITY: initialFormValues?.CITY || "",
      ...(isUserType === "AU" && {
        LAN_LINE: initialFormValues?.LAN_LINE || "",
        OFF_LOCA: initialFormValues?.OFF_LOCA || null,
        ALT_EMAIL: initialFormValues?.ALT_EMAIL || "",
      }),
      ...(isUserType === "UU" && {
        GENDER: initialFormValues?.GENDER || "",
        DOB: initialFormValues?.DOB || null,
        PIN_CODE: initialFormValues?.PIN_CODE || "",
        ADDRESS_1: initialFormValues?.ADDRESS_1 || "",
        ADDRESS_2: initialFormValues?.ADDRESS_2 || "",
      }),
    },

  };



  useEffect(() => {
    if (selectedCountry && selectedState) {
      setCities(City.getCitiesOfState(selectedCountry, selectedState) || []);
    }
  }, [selectedCountry, selectedState]);





  const handleSubmitSform = (event) => {
    event.preventDefault();

    const payload = {
      USERNAME: formData?.USERNAME || "",
      MOBILE_NO: formData?.MOBILE_NO || "",
      EMAIL: formData?.EMAIL || "",
      USER_TYPE: isUserType,
      Theme_Section: formData?.Theme_Section || "",
      SU_APRO_REM: formData?.SU_APRO_REM || "",
      APRO_DATE: formData?.APRO_DATE || null,
      USERID: formData?.USERID || "",

      logindata: {
        FIRST_NAME: formData?.FIRST_NAME || "",
        MIDDLE_NAME: formData?.MIDDLE_NAME || "",
        LAST_NAME: formData?.LAST_NAME || "",
        ORGANIZATION: formData?.ORGANIZATION || "",
        DESIGNATION: formData?.DESIGNATION || "",
        COUNTRY: getCountryName(formData.COUNTRY),
        STATE: getStateName(formData.COUNTRY, formData.STATE),
        CITY: formData?.CITY || "",
        ...(isUserType === "AU" && {
          LAN_LINE: formData?.PHONE_LAN || "",
          OFF_LOCA: formData?.LOCATION || null,
          ALT_EMAIL: formData?.EMAIL_ALT || "",
        }),
        ...(isUserType === "UU" && {
          GENDER: gender || "",
          DOB: formData?.DOB || null,
          PIN_CODE: formData?.PIN_CODE || "",
          ADDRESS_1: formData?.ADDRESS_1 || "",
          ADDRESS_2: formData?.ADDRESS_2 || "",
        }),
      },
    };

    // console.log(payload, "______paylod")
    // console.log(initialValues, "initialValues")

    const isModified = JSON.stringify(payload) !== JSON.stringify(initialValues);
    if (!isModified) {
      ModalManager.warning({
        modalHeaderHeading: isUserType === 'AU' ? 'Manage User' : 'Manage User',
        modalBodyHeading: "Warning",
        message: `No changes were made to the form.`,
        confirmButtonText: 'OK',
      });
      return;
    }


    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    // console.log(filteredErrors, "____filteredErrors")
    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.USERNAME &&
      formData.EMAIL &&
      formData.FIRST_NAME &&
      formData.LAST_NAME &&
      formData.MOBILE_NO &&
      formData.CITY &&
      formData.STATE &&
      formData.COUNTRY &&
      // formData.PIN_CODE &&
      formData.ORGANIZATION &&
      formData.DESIGNATION &&
      formData.Theme_Section

    ) {
      ModalManager.confirm({
        modalHeaderHeading: isUserType === 'AU' ? 'Manage User' : 'Manage User',
        modalBodyHeading: 'Confirmation',
        message: 'Are you sure want to proceed?',
        onConfirm: () => HandleConfirm(payload),
        confirmButtonText: 'OK',
      });

    } else {
      setErrors(filteredErrors);
    }

  }


  const HandleConfirm = async (payload) => {

    if (isUserType === "AU") {
      // setIsLoading(false);
      LoaderUpdateProgress();
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:8000/admin_url/", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newaccessToken}`,
          },
          //body: JSON.stringify(modifiedValues),
          body: JSON.stringify(payload),
        });

        if (response.status === 200 || response.status === 201) {
          const data = await response.json();

          setUserData((prevUserData) =>
            prevUserData.map((user) =>
              user.USERID === data.USERID ? data : user
            )
          );

          ModalManager.success({
            modalHeaderHeading: 'Manage User',
            modalBodyHeading: "Success",
            message: "Form Edit Successfully",
            onConfirm: () => {
              removeWarningMassege(setTouched)
              fetchData()
              dispatch(adminFormClose());
            },
            confirmButtonText: 'OK',
          });
        } else {
          if (response.status === 404) {
            return response.json().then(data => {
              const msgerr = data.message?.logindata?.ALT_EMAIL?.[0];
              if (msgerr) {
                ModalManager.warning({
                  modalHeaderHeading: 'Manage User',
                  modalBodyHeading: "Warning",
                  message: `${msgerr}`,
                  confirmButtonText: 'OK',
                });
              }
            });
          }
        }
      }

      catch (error) {
        if (error.response.status === 500) {
          ModalManager.error({
            modalHeaderHeading: 'Manage User',
            modalBodyHeading: "Error",
            message: `${error}`,
            confirmButtonText: 'OK',
          });
        }
        // console.error("Error updating user:", error.message);
      } finally {
        // Set isLoading to false after the API call is complete
        // setIsLoading(false);
        setLoading(false);
        setProgress(100);
      }
    } else {
      // setIsLoading(false);

      try {
        // setIsLoading(true);
        LoaderUpdateProgress();
        const response = await fetch(
          `http://127.0.0.1:8000/authorized_singup/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newaccessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.status === 200) {
          checkAdminType();

          ModalManager.success({
            modalHeaderHeading: 'Manage User',
            modalBodyHeading: "Success",
            message: "Form Edit Successfully",
            onConfirm: () => {
              removeWarningMassege(setTouched);
              handleAuthtable(selectedUserId);
              dispatch(adminFormClose());
            },
            confirmButtonText: 'OK',
          });
        }
      } catch (error) {
        if (error.response.status === 500) {
          ModalManager.error({
            modalHeaderHeading: 'Manage User',
            modalBodyHeading: "Error",
            message: `${error}`,
            confirmButtonText: 'OK',
          });
        }
        console.error("Error updating user:", error.message);
      } finally {
        setLoading(false);
        setProgress(100);
      }
    }

  }

  const genaralvalue = {
    USERNAME: initialFormValues?.USERNAME || "",
    MOBILE_NO: initialFormValues?.MOBILE_NO || "",
    EMAIL: initialFormValues?.EMAIL || "",
  }

  const HandleGeneraform = (e) => {
    e.preventDefault()
    const isModifiedGU = formData?.MOBILE_NO !== initialValues.MOBILE_NO;

    const Values = {
      USERID: editUserId,
      USERNAME: formData?.USERNAME || "",
      MOBILE_NO: formData?.MOBILE_NO || "",
      EMAIL: formData?.EMAIL || "",
    };

    if (!isModifiedGU) {
      ModalManager.warning({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: "Warning",
        message: "No changes were made to the form.",

        confirmButtonText: 'OK',
      });
      return;
    }

    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.USERNAME &&
      formData.EMAIL &&
      formData.MOBILE_NO
    ) {

      ModalManager.confirm({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: 'Confirmation',
        message: 'Are you sure want to proceed?',
        onConfirm: () => generalConfirm(Values),
        confirmButtonText: 'OK',
      });


    } else {
      setErrors(filteredErrors);
    }
  }

  const generalConfirm = async (Values) => {
    try {
      // setIsLoading(true);
      LoaderUpdateProgress();
      const response = await fetch(`http://127.0.0.1:8000/general_signup/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        body: JSON.stringify(Values),
      });

      if (response.status === 200) {
        // Fetch the updated data after successful form submission
        GeneralModalClosed();

        ModalManager.success({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "Form Edit Successfully",
          onConfirm: () => {
            removeWarningMassege(setTouched)
            GeneralData();
            setGeneralShowTable(true);
            handleCloseModal();
            setActiveButton("general");
          },
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      if (error.response.status === 500) {
        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: `${error}`,
          confirmButtonText: 'OK',
        });
      }
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }

  useEffect(() => {
    if (isUserType === "AU" || isUserType === "UU" || isUserType === "GU") {
      if (selectedUserIndex !== null) {
        let selectedUserData;

        if (isUserType === "AU") {
          selectedUserData = userData[selectedUserIndex];
        } else if (isUserType === "UU") {
          selectedUserData = authData[selectedUserIndex];
        } else if (isUserType === "GU") {
          // Add your logic to get GU data, assuming there's a variable named guData
          selectedUserData = generalData[selectedUserIndex];
        }

        if (selectedUserData) {
          // Update form values using setFieldValue from Formik
          if (isUserType === "GU") {
            Object.keys(selectedUserData).forEach((key) => {
              // formikGeneral.setFieldValue(key, selectedUserData[key]);
            });
          } else {
            Object.keys(selectedUserData).forEach((key) => {
              // formik.setFieldValue(key, selectedUserData[key]);
            });
          }

          // setInitialFormValues(selectedUserData);
          setFormData({
            USERNAME: selectedUserData?.USERNAME || "",
            MOBILE_NO: selectedUserData?.MOBILE_NO || "",
            EMAIL: selectedUserData?.EMAIL || "",
            USER_TYPE: isUserType,
            Theme_Section: selectedUserData?.Theme_Section || "",
            AU_APRO_REM: selectedUserData?.AU_APRO_REM || "",
            APRO_DATE: selectedUserData?.APRO_DATE || null,
            USERID: selectedUserData?.USERID || "",
            FIRST_NAME: selectedUserData?.FIRST_NAME || "",
            MIDDLE_NAME: selectedUserData?.MIDDLE_NAME || "",
            LAST_NAME: selectedUserData?.LAST_NAME || "",
            ORGANIZATION: selectedUserData?.ORGANIZATION || "",
            DESIGNATION: selectedUserData?.DESIGNATION || "",
            CITY: selectedUserData?.CITY || "",
            STATE: selectedUserData?.STATE || "",
            COUNTRY: selectedUserData?.COUNTRY || "",
            GENDER: selectedUserData?.GENDER || "",
            DOB: selectedUserData?.DOB || "",
            PIN_CODE: selectedUserData?.PIN_CODE || "",
            ADDRESS_1: selectedUserData?.ADDRESS_1 || "",
            ADDRESS_2: selectedUserData?.ADDRESS_2 || "",
            SU_APRO_STAT: selectedUserData?.SU_APRO_STAT,
            SU_APRO_REM: selectedUserData?.SU_APRO_REM || "",
            PHONE_LAN: selectedUserData?.LAN_LINE || "",
            LOCATION: selectedUserData?.OFF_LOCA || "",
            EMAIL_ALT: selectedUserData?.ALT_EMAIL || "",
            // AU_APRO_STAT: selectedUserData?.AU_APRO_STAT
          });

          // Set selected country, state, and cities
          setSelectedCountry(selectedUserData?.COUNTRY || "");
          setSelectedState(selectedUserData?.STATE || "");
          setCities(City.getCitiesOfState(selectedUserData?.COUNTRY, selectedUserData?.STATE) || []);
          setGender(selectedUserData?.GENDER || "");

          setInitialFormValues(selectedUserData)
          //console.log(selectedUserData, "___data fpdp")
        }
      }
    }
  }, [selectedUserIndex, userData, authData, isUserType, generalData, adminType]);



  const handleCloseModal = () => {
    removeWarningMassege(setTouched)
    // setCities([]);
    // setSelectedCountry('');
    setShowModal(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: '',
      CITY: '',
    }));

    fetchData();
  };

  const GeneralModalClosed = () => {
    removeWarningMassege(setTouched)
    setShowModal(false);
    setIsClicked(false);
  };

  const handleAdmintable = (type) => {
    if (type === 'WCADMIN') {
      setAdminType("WCADMIN");
      setActiveButton("WCADMIN");
      setShowAuthorizedTable(false);
      setSelectedUserId(null);
    } else {
      setAdminType("UDADMIN");
      setActiveButton("UDADMIN");
      setShowAuthorizedTable(false);
      setSelectedUserId(null);
    }
    setShowTable(true);
    setGeneralShowTable(false);
  };

  const GeneralData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/general_signup/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newaccessToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setGeneralData(response.data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGeneralTable = async () => {
    GeneralData();
    setGeneralShowTable(true);
    setShowTable(false);
    setShowAuthorizedTable(false);
    setActiveButton("general");
    setFirstTdClicked(false);
    setSelectedUserId(null);
  };

  useEffect(() => { }, [generalData]);

  const handleAuthtable = async (userId, name) => {
    // setShowAuthorizedTable(true);
    if ((prevSelectedUserId) => prevSelectedUserId !== userId) {
      setSelectedUserId(userId);
      setShowAuthorizedTable(true);
    } else {
      setShowAuthorizedTable((prevShowAuthorizedTable) => !prevShowAuthorizedTable);
      setSelectedUserId((prevSelectedUserId) =>
        prevSelectedUserId === userId ? null : userId
      );
    }
    setAdminName(name);

    try {
      const response = await axios.request({
        url: "http://127.0.0.1:8000/authorized_singup/",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        params: {
          USERID: userId,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data?.message;

        if (Array.isArray(data) && data.length > 0) {
          setAuthData(data);
        } else {
          const adminName =
            name !== undefined && name !== null ? name : "DefaultName";

          setAdminName(adminName);
          ////console.log("Before setAuthData([]):", { adminName, authData });
          setAuthData([]);
          // //console.log("After setAuthData([]):", { adminName, authData });
        }
      }
    } catch (error) {
      setAuthData([]);
      console.error("API request failed:", error);
    }
  };




  // const handleCountryCodeChange = (e) => {
  //   const selectedCode = e.target.value;
  //   setSelectedCountryCode(selectedCode);
  //   formik.setFieldValue("MOBILE_NO", "");
  // };

  const getRowBackgroundColor = (user) => {
    //  if (user?.SU_APRO_STAT === "INPROGRESS") {
    //   return " rgb(223, 196, 156)";
    // } else
    if (user?.SU_APRO_STAT === "APPROVED") {
      return "#ACE1AF";
    } else if (user.SU_APRO_STAT === "BLOCKED") {
      return "#A9A9A9";
    }
    else if (user.SU_APRO_STAT === "REPLACE") {
      return "rgb(209 171 171)";
    }
    else if (user.SU_APRO_STAT === "PENDING") {
      return "#00298054";
    }

    else {
      return "#D2691E";
    }
  };

  const getUURowBackgroundColor = (user) => {
    if (user.SU_APRO_STAT === "BLOCKED") {
      return "#C0C0C0";
    } else if (user.AU_APRO_STAT === "BLOCKED") {
      return "#C0C0C0";
    } else if (user?.AU_APRO_STAT === "INPROGRESS") {
      return "rgb(223, 196, 156)";
    } else if (user?.AU_APRO_STAT === "APPROVED") {
      return "#ACE1AF";
    } else {
      return "#D2691E";
    }
  };

  const handleProfile = (index, type) => {
    if (type === "AU") {
      const selectedUser = userData[index];
      setSelectedUser(selectedUser);
      setIsProfile(true);

      setIsSelectedType("AU");
      sessionStorage.setItem("isselectedType", isselectedType);
    } else {
      const selectedUser = authData[index];
      setSelectedUser(selectedUser);
      setIsProfile(true);

      setIsSelectedType("UU");
      sessionStorage.setItem("isselectedType", isselectedType);
    }
  };

  const closeModal = () => {
    setIsProfile(false);
  };

  const handleCloseUUModal = () => {
    removeWarningMassege(setTouched)

    setCities([]);
    setSelectedCountry('');
    setShowModal(false);
    handleAuthtable(selectedUserId);
    setIsClicked(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: '',
      CITY: '',
    }));

  };


  const handleDelete = async () => {

    let response = null;
    let confirmResult = null;
    if (uuCount !== 0) {
      confirmResult = await ModalManager.warning({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: 'Warning',
        message: `This Admin Has (${uuCount}) UU user. You need to REPLACE account before delete.`,
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonText: 'OK',
      });

    } else {
      confirmResult = await ModalManager.confirm({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: 'Confirmation',
        message: 'Do you want to delete this ADMIN ?',
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonText: 'OK',

      });
      if (!confirmResult.isConfirmed) {
        return;
      }

      handleSuModal(editUserId, new Date(), "DELETE");
    }
  };

  function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return dateObject.toLocaleDateString("en-GB", options); // 'en-GB' ensures dd/mm/yyyy format
  }


  const handleSuModal = (userId, currentDateTime, isStatus) => {
    setSuModalOpen(true);
    // setUuValue(value);
    setUUId(userId);
    setUserStatus(isStatus);

    if (currentDateTime instanceof Date && !isNaN(currentDateTime)) {
      const formattedDate = currentDateTime.toISOString();

      setCurrentDate(formattedDate);
    } else {
      // console.error('Invalid date:', currentDateTime);
    }
  };

  //UU count Api
  const uuCOUNT_Api = async (userId) => {
    // setIsLoading(false);
    try {
      // setIsLoading(true);
      const response = await axios.request({
        url: "http://127.0.0.1:8000/authorized_singup/",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
        },
        params: {
          USERID: userId,
          COUNT: "COUNT",
        },
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data.Count;

        setUUCount(data);
        ////console.log("User Data:", data);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("API request failed:", error);
    } finally {
      // Set isLoading to false after the API call is complete
      // setIsLoading(false);
    }
  };


  ///////////for loading take time//////
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


  const adminDepartmentType = () => {
    return adminType === 'WCADMIN' ? 'WorkCenter' : 'UserDepartment';
  };



  // Function to handle input focus
  const handleInputFocus = (fieldName) => {
    setInputClicked((prevInputClicked) => ({
      ...prevInputClicked,
      [fieldName]: true,
    }));
  };

  const currentDate = new Date();
  const minDate = new Date(currentDate);
  minDate.setFullYear(minDate.getFullYear() - 95);

  const maxDate = new Date(currentDate);
  maxDate.setFullYear(maxDate.getFullYear() - 16);


  const message = (
    `<p>
      The present user will be BLOCKED and all the UU will be allocated to the new ADMIN User in this process.
    </p>`
  );


  const replaceAccount = async (editUserId) => {

    const HandelConfirm = () => {
      handleSuModal(editUserId, new Date(), "REPLACE")
    }

    ModalManager.confirm({
      modalHeaderHeading: 'Manage User',
      modalBodyHeading: `This Admin Has (${uuCount}) UU USER`,
      message: message,
      confirmButtonText: 'OK',
      showCancelButton: true,
      onConfirm: HandelConfirm,
      cancelButtonColor: "#d33",
      cancelButtonText: "CANCEL"
    });
  };


  useEffect(() => {
    if (nType) {
      setAdminType(nType);
      setActiveButton(nType);
      handleAdminEditClick(indexId, replaceAdminId, 'AU', selectedBackTheme);
      fetchData();
      // Clear URL parameters after performing the actions
      clearUrlParams();
    }
  }, [selectedUserIndex, replaceAdminId, indexId, nType, selectedBackTheme]);


  //SuModal Props
  const modalProps = {
    isOpen: isSuModalOpen,
    onClose: handleSuCloseModal,
    uuId: uuId,
    // accessToken: newaccessToken,
    isselectedType: isselectedType,
    userStaus: userStaus,
    GeneralData: GeneralData,
    setGeneralShowTable: setGeneralShowTable,
    setActiveButton: setActiveButton,
    // setShowModal: setShowModal,
    adminType: adminType,
    setAdminType: setAdminType,
    fetchData: fetchData,
    handleAuthtable: handleAuthtable,
    setShowAuthorizedTable: setShowAuthorizedTable,
    selectedUserId: selectedUserId,
    status: formData.SU_APRO_STAT,
    handleREMARK: handleREMARK,

  };



  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Formatting options
      const dateOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };

      // Formatting date and time
      const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
      const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(now);

      // Updating state
      setCurrentDateform(`${formattedDate}`);
      setCurrentTime(`${formattedTime}`);
    };

    // Update the date and time initially
    updateDateTime();

    // Update the date and time every second
    const intervalId = setInterval(updateDateTime, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);




  // email link//
  const [email, setEmail] = useState('');
  useEffect(() => {
    fetchData();
  }, []);


  const handleResend = async (user) => {
    try {

      const formData = new FormData();
      const userId = typeof user.USERID === 'object' ? user.USERID.id : user.USERID;
      formData.append('USERID', selectedUserId);
      formData.append('SU_APRO_STAT', userstatus);

      const response = await axios({
        url: "http://127.0.0.1:8000/admin_url/",
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${newaccessToken}`,
        },
        params: {
          admin_resend_link: 'resend_link', // Query parameter
        },
        data: formData,
        // data: payload, // Request body
      });

      if (response.status === 200) {

        ModalManager.success({
          modalHeaderHeading: "Manage User",
          modalBodyHeading: "Success",
          message: "Link is send to your provided email id please reset your password ",
          // redirectTo: '/Login' // Specify the URL to redirect to
          // onConfirm: () => {
          //   sessionStorage.clear();
          //   navigate("/Login");
          // },
          confirmButtonText: "OK",
        })
      } else {
        alert("success")
        // ModalManager.error({
        //   modalHeaderHeading: "Change Password",
        //   modalBodyHeading: "Error",
        //   message: error.response.data.message,
        //   // redirectTo: '/Login' // Specify the URL to redirect to

        //   confirmButtonText: "OK",
        // }); 
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again later.";

      if (error.response) {
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      ModalManager.error({
        modalHeaderHeading: "Manage User",
        modalBodyHeading: "Error",
        message: error.response.data.message,
        // redirectTo: '/Login' // Specify the URL to redirect to

        confirmButtonText: "OK",
      });
      // setAuthData([]);
      // console.error("API request failed:", error);
    }

  };


  const adminTypeSelection = () => {
    if (adminType === "WCADMIN") {
      return 'WorkCenter Admin User (WCAU) View';
    } else {
      return 'UserDepartment Admin User (UDAU) View';
    }
  };


  const capitalizeThemeSection = (section) => {
    return section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
  };


  const handleBackButtonClick = () => {
    dispatch(adminFormClose());
    localStorage.clear();
  };

  return (
    <Container fluid className="su_Edit">
      <Preloader loading={loading} progress={progress} />
      <div class="flex-container my-5">
        <h4 className="my-4 ED-MainText">
          Manage ADMIN User : {userName} (SU)
        </h4>
        <div class="row justify-content-center ">
          <div class="col-4">

            {/* <Button
              type="button"
              variant={activeButton === "WCADMIN" ? "success" : ""}
              className={
                activeButton === "WCADMIN" ? "WC-Btn" : "Unclicked-Btn"
              }
             
              size="sm"
              onClick={() => handleAdmintable('WCADMIN')}
            >
              WC Admin Users
            </Button> */}
            <CentraliseButtonForActivestatus
              variant={activeButton === "WCADMIN" ? "success" : ""}
              text="WC Admin Users"
              onClick={() => handleAdmintable('WCADMIN')}
              isActive={activeButton === "WCADMIN"}
              activeVariant="success"
              inactiveVariant="gray"
              textColor="white"
              // padding="6px"
              width="auto"
              fontsize="15px"
              className={`btn px-3 my-1 ResponsiveButtonEdituser ${activeButton === "WCADMIN" ? 'activebut' : 'Nactive'}`}
            />
          </div>

          <div class="col-4">
            {/* <Button
              type="button"
              variant={activeButton === "UDADMIN" ? "success-outline" : "custom-outline"}
              className={
                activeButton === "UDADMIN" ? "UD-Btn" : "Unclicked-Btn"
              }
              // className={mb-5}
              size="sm"
              class="btn btn-info"
              onClick={() => handleAdmintable('UDADMIN')}
            >
              UD Admin Users
            </Button> */}
            <CentraliseButtonForActivestatus
              variant={activeButton === "UDADMIN" ? "success-outline" : "custom-outline"}
              text=" UD Admin Users"
              onClick={() => handleAdmintable('UDADMIN')}
              isActive={activeButton === "UDADMIN"}
              activeVariant="success"
              inactiveVariant="gray"
              textColor="white"
              // padding="6px"
              width="auto"
              fontsize="15px"
              className={`btn px-3 my-1 ResponsiveButtonEdituser  ${activeButton === "UDADMIN" ? 'activebut' : 'Nactive'}`}
            // className=`btn px-3 my-1{
            //   activeButton === "UDADMIN" ? 'activebut' : 'Nactive'
            // }`
            />
          </div>

          <div class="col-4">
            {/* <Button
              type="button"
              variant={
                activeButton === "general"
                  ? "success-outline"
                  : "custom-outline"
              }
              className={
                activeButton === "general"
                  ? "SU-General-Btn"
                  : "Unclicked-Btn"
              }
              size="sm"
              class="btn btn-info"
              onClick={handleGeneralTable}
            >
              General Users
            </Button> */}

            <CentraliseButtonForActivestatus
              variant={activeButton === "general" ? "success-outline" : "custom-outline"}
              text="General Users"
              onClick={handleGeneralTable}
              isActive={activeButton === "general"}
              activeVariant="success"
              inactiveVariant="gray"
              textColor="white"
              // padding="6px"
              width="auto"
              fontsize="15px"
              className={`btn px-3 my-1 ResponsiveButtonEdituser  ${activeButton === "general" ? 'activebut' : 'Nactive'}`}
            // className=`btn px-3 my-1{
            //   activeButton === "UDADMIN" ? 'activebut' : 'Nactive'
            // }`
            />
          </div>
        </div>
      </div>

      {/* ______________________________________________________________________ */}



      {/* Table Start from below */}
      {/* Admin Table */}
      {showAdminTable && (
        <>
          <span className="Admin-Table-heading">
            <h5>
              <strong>{adminTypeSelection()}</strong> - {userName} (SU)
            </h5>
          </span>
          <div>
            <div className="Table">
              <div
                className="table-container"
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  height: fixedTableHeight,
                  scrollbarWidth: "auto"
                  // scrollbarWidth: "none",
                }}
              >
                <table className="AU-Table ">
                  <thead className="mainbandsinfromation-heading ">
                    {/* <span>
                      <strong>Table</strong>
                    </span> */}
                    <tr className="text-dark">
                      {headings1.map((heading, index) => (
                        <th key={index}>{heading}</th>
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
                          onClick={() => handleAuthtable(user.USERID, user?.USERNAME)}
                          className={
                            selectedUserId === user?.USERID
                              ? "SelectedValue AU-TD"
                              : "UnClicked AU-TD"
                          }
                        >
                          <td className="AU-Space">{index + 1}</td>
                          <td
                            className="AU-TD"
                          // onClick={() =>
                          //   handleAuthtable(user?.USERID, user?.USERNAME)
                          // }
                          // className={
                          //   selectedUserId === user?.USERID
                          //     ? "SelectedValue AU-TD"
                          //     : "UnClicked AU-TD"
                          // }
                          >
                            {user?.USERID}
                          </td>
                          <td className="AU-TD TD-DATA">{user?.USERNAME}</td>
                          <td className="AU-TD">{user?.ADMIN_TYPE ? capitalizeThemeSection(user.ADMIN_TYPE) : ''}</td>

                          <td className="AU-TD">
                            {user?.Theme_Section ? capitalizeThemeSection(user.Theme_Section) : ''}
                          </td>

                          <td className="AU-TD">
                            {user?.SU_APRO_STAT ? capitalizeThemeSection(user.SU_APRO_STAT) : ''}
                          </td>

                          {/* <td >{user?.AU_APRO_STAT}</td> */}
                          <td className="CR-Date">
                            {formatDate(user?.CREATION_DATE)}
                          </td>
                          <td className="AU-TD">
                            {user?.APRO_DATE
                              ? formatDate(user.APRO_DATE)
                              : null}
                          </td>
                          <td onClick={() => handleProfile(index, "AU")}>
                            {
                              <img
                                src="UserProfile.png"
                                alt="Site Logo"
                                width="25"
                                height="25"
                                title="User Profile Data"
                                className="hoverable-image"
                              />
                            }
                          </td>

                          <td>
                            <div>
                              <a
                                className="edit-btn AU-TD"
                                onClick={() =>
                                  handleAdminEditClick(
                                    index,
                                    user?.USERID,
                                    "AU",
                                    //user?.USERNAME,
                                    user?.Theme_Section,
                                    user?.SU_APRO_STAT
                                  )
                                }
                              >
                                {/* <strong className="Edit-BtnColor">EDIT</strong> */}
                                <img
                                  src="edit.png"
                                  alt="Site Logo"
                                  width="20"
                                  height="20"
                                  title="Manage User"
                                  className="hoverable-image"
                                />
                              </a>
                              &nbsp;
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Authorized Table */}
      {showAuthorizedTable && (
        <>
          <span className="UU-Table-heading">
            <h5>
              <strong>Authorized User (UU) View  </strong> - {adminName} ({adminType === "WCADMIN" ? 'WCAU' : 'UDAU'})
            </h5>
          </span>
          <div>
            <div className="S-UU-Table">
              <div
                className="table-container"
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  height: fixedTableHeight,
                  scrollbarWidth: "auto"
                  // scrollbarWidth: "none",
                }}
              >
                <table className="AU-Table">
                  <thead>
                    <tr className="text-dark">
                      {headings2.map((heading, index) => (
                        <th key={index}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {authData
                      && authData.map((user, authindex) => (
                        // <tr key={user.USERID}>

                        <tr
                          key={authindex}
                          style={{
                            backgroundColor: getUURowBackgroundColor(user),
                          }}
                        >
                          <td className="AU-Space">{authindex + 1}</td>
                          <td className="AU-TD">{user.USERID}</td>
                          <td
                            className="AU-TD TD-DATA
                        "
                          >
                            {user?.USERNAME}
                          </td>
                          <td className="AU-TD">Authorized</td>
                          {/* <td>{user?.FIRST_NAME}</td>
                        <td>{user?.MIDDLE_NAME}</td>
                        <td>{user?.LAST_NAME}</td>
                        <td>{user?.GENDER}</td>
                        <td>{user?.DOB}</td>
                        <td>{user?.ORGANIZATION}</td>
                        <td>{user?.DESIGNATION}</td> */}
                          {/* <td>{user?.Theme_Section}</td> */}
                          <td className="AU-TD">
                            {user?.Theme_Section ? capitalizeThemeSection(user.Theme_Section) : ''}
                          </td>
                          {/* <td>{user?.COUNTRY}</td>
                        <td>{user?.STATE}</td>
                        <td>{user?.CITY}</td>
                        <td>{user?.MOBILE_NO}</td>
                        <td>{user?.EMAIL}</td> */}
                          <td className="AU-TD">
                            {user?.SU_APRO_STAT ? capitalizeThemeSection(user.SU_APRO_STAT) : ''}
                          </td>
                          <td className="AU-TD">
                            {user?.AU_APRO_STAT ? capitalizeThemeSection(user.AU_APRO_STAT) : ''}
                          </td>
                          <td className="CR-Date">
                            {formatDate(user?.CREATION_DATE)}
                          </td>
                          <td className="AU-TD">
                            {user?.APRO_DATE ? formatDate(user.APRO_DATE) : null}
                          </td>
                          <td
                            className="AU-TD"
                            onClick={() => handleProfile(authindex, user?.USERID)}
                          >
                            {
                              <img
                                src="UserProfile.png"
                                alt="Site Logo"
                                width="25"
                                height="25"
                                title="User Profile Data"
                                className="hoverable-image"
                              />
                            }
                          </td>

                          <td>
                            <a
                              className="edit-btn AU-TD"
                              onClick={() =>
                                handleAuthEditClick(
                                  authindex,
                                  user?.USERID,
                                  "UU",
                                  user?.Theme_Section,
                                  user?.USERNAME,
                                  user?.SU_APRO_STAT
                                )
                              }
                            >
                              {/* <strong className="Edit-BtnColor">EDIT</strong> */}
                              <img
                                src="edit.png"
                                alt="Site Logo"
                                width="20"
                                height="20"
                                title="Manage User"
                                className="hoverable-image"
                              />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* General User Table */}
      {showGeneralTable && (
        <>
          <span className="Admin-Table-heading">
            <h5>
              <strong>General User (GU) View </strong> - {userName} (SU)
            </h5>
          </span>
          <div>
            <div className="Table">
              <div
                className="table-container"
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  height: fixedTableHeight,
                  scrollbarWidth: "auto"
                  // scrollbarWidth: "none",
                }}
              >
                <table className="AU-Table">
                  <thead className="mainbandsinfromation-heading text-dark">
                    <tr>
                      {headings3.map((heading, index) => (
                        <th key={index}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generalData.map((user, generalindex) => (
                      <tr
                        key={user.USERID}
                        style={{
                          backgroundColor: getRowBackgroundColor(user),
                        }}
                      >
                        <td className="AU-Space">{generalindex + 1}</td>
                        <td className="AU-TD">{user.USERID}</td>
                        <td className="AU-TD">{user?.USERNAME}</td>
                        <td className="AU-TD">General</td>
                        {/* <td className="AU-TD">{user?.EMAIL}</td>
                        <td className="AU-TD">{user?.MOBILE_NO}</td> */}
                        <td
                          className={`AU-TD ${user?.SU_APRO_STAT}`}
                        >
                          {user?.SU_APRO_STAT ? capitalizeThemeSection(user.SU_APRO_STAT) : ''}
                        </td>
                        <td className="CR-Date">
                          {formatDate(user?.CREATION_DATE)}
                        </td>
                        <td className="AU-TD">
                          {user?.APRO_DATE ? formatDate(user.APRO_DATE) : null}
                        </td>

                        <td>
                          <div>
                            <a
                              className="edit-btn"
                              onClick={() =>
                                handleGenralEditClick(
                                  generalindex,
                                  user?.USERID,
                                  "GU",
                                  user?.SU_APRO_STAT
                                )
                              }
                            >
                              {/* <strong className="Edit-BtnColor">EDIT</strong> */}
                              <img
                                src="edit.png"
                                alt="Site Logo"
                                width="20"
                                height="20"
                                title="Manage User"
                                className="hoverable-image"
                              />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin & Authorized EDIT Form */}
      {isOpenprofile && isUserType != "GU" && (
        <div
          id="popup"
          className="popup"
          style={{ display: isOpenprofile ? "block" : "none" }}
        >
          <div className="AUU-Popup-Content">
            {/* <span className="Close"
              // onClick={handleCloseModal}
              onClick={() => {
                dispatch(adminFormClose())
                if (isUserType === 'AU') {
                  handleCloseModal();
                } else {
                  handleCloseUUModal();
                }
              }}
            >
              &times;
            </span> */}

            {/* <Card id="Card-Body border border-primary"> */}
            {/* <Card.Body className="px-4 pt-1"> */}
            <CentraliseheaderBody
              header={<> {isUserType === "AU"
                ? `Manage ${adminDepartmentType()} Admin User (${adminType === 'WCADMIN' ? 'WCAU' : 'UDAU'}) Account`
                : "Manage Authorized User (UU) Account"}</>}

              logo="GEOPICX_LOGO.png"
              headerBgColor="rgb(64 37 136)"        // Set your desired header background color
              headerTextColor="white"
              onClose={() => {
                if (isUserType === 'AU') {
                  handleCloseModal();
                } else {
                  handleCloseUUModal();
                }
                dispatch(adminFormClose())
              }}
            // onClose={handleBackButtonClick}
            >
              {/* _____________________Time & Top Heading _________________________________*/}
              {/* <div class="row justify-content-end">
                  <div class="col-md-6  text-right">
                    <p id="Time-Timer" className="mb-0">
                      <strong>Date:</strong> {currentDateTime}{" "}
                    </p>
                  </div>
                </div> */}

              <div class="container-fluid mt-0">
              </div>

              <Form onSubmit={handleSubmitSform} className="SUEditUser-form">
                <fieldset className="the-fieldset mb-4">
                  <legend className="the-legendSuEditUse">  {isUserType === 'AU' ? adminDepartmentType : ``} User Details</legend>
                  {/* <span>
                    <h5 className="Heading-Details">Personal Details</h5>
                  </span>
                  <hr id="Hrline"></hr> */}
                  <Row className="SU-Col-Class-1">

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
                        disabled
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
                        disabled
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
                        disabled
                      />
                    </Col>

                  </Row>
                  {/* Gender */}
                  {isUserType === "UU" && (
                    <Row className="SU-Col-Class-2">
                      <Col xs={12} sm={6} md={4}  >
                        <SelectBox
                          label="Gender"
                          name="Gender"
                          value={gender}
                          onChange={handleChangeGender}
                          options={GenderType}
                          disabled
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
                          disabled
                          min={startSelectableDateISO}
                          max={maxDateForDOBISO}  // Set min date to 16 years ago in ISO format                  
                        />
                      </Col>
                    </Row>
                  )}
                  {/* Designation */}
                  <Row className="SU-Col-Class-2">
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
                        disabled
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
                        disabled
                      />

                    </Col>
                    <Col xs={12} sm={6} md={4}  >
                      <SelectBox
                        required
                        label="Theme Section"
                        type="theme"
                        // value={formData.Theme_Section}
                        value={
                          formData.Theme_Section
                            ? formData.Theme_Section.charAt(0).toUpperCase() + formData.Theme_Section.slice(1).toLowerCase()
                            : ''
                        }
                        onBlur={handleBlur}
                        onblur={touched.Theme_Section}
                        onChangeError={(error) => handleChangeError('Theme_Section', error)}
                        onChange={handleChange}
                        errorMessage={errors.Theme_Section}
                        touched={touched.Theme_Section}
                        name="Theme_Section"
                        disabled
                        userType={isUserType}
                      />
                    </Col>
                  </Row>
                  <Row className="SU-Col-Class-2">
                    {/* COUNTRY */}
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
                        maxLength={30}
                        onChangeError={(error) => handleChangeError('COUNTRY', error)}
                        disabled
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
                        maxLength={30}
                        onChangeError={(error) => handleChangeError('STATE', error)}
                        disabled
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
                        maxLength={20}
                        onChangeError={(error) => handleChangeError('CITY', error)}
                        disabled
                      />
                    </Col>
                  </Row>
                  {/* Address */}
                  {isUserType === "UU" && (
                    <Row className="SU-Col-Class-2">
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
                          disabled
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
                          disabled
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
                          disabled
                        />
                      </Col>
                    </Row>
                  )}
                  <Row>
                    {isUserType === "AU" && (
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
                            disabled
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
                            disabled
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
                            disabled
                          />
                        </Col>
                      </>
                    )}
                  </Row>

                  {/* Username Credentials */}
                  {/* <span>
                    <h5 className="Heading-Details">User Credentials</h5>
                  </span>
                  <hr id="Hrline"></hr> */}
                  {/* ______________________Mobile No. Au act ________________________ */}
                  <Row className="SU-Col-Class-2">
                    {isUserType === "UU" && (
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
                          disabled
                        />
                      </Col>
                    )}
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

                    {isUserType === "AU" && (
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
                          disabled
                        />
                      </Col>
                    )}
                  </Row>

                  <Row>
                    <Col md="6">
                      <Form>
                        <Form.Group>
                          <Form.Label className="d-flex mx-2 Remark_leble" >
                            Remark
                            <Validators
                              value={formData.SU_APRO_REM}
                              type="Remark"
                              maxLength={100}
                              onblur={touched.SU_APRO_REM}
                              onChangeError={(error) => handleChangeError('SU_APRO_REM', error)}
                              touched={touched.SU_APRO_REM}
                            />
                          </Form.Label>
                          <Form.Control
                            type="text"
                            rows={3}
                            as="textarea"
                            name="SU_APRO_REM"
                            placeholder="Enter your remark here..."
                            value={formData.SU_APRO_REM}
                            onChange={handleChange}
                            maxLength={100}
                            onFocus={() => handleInputFocus("SU_APRO_REM")}
                            disabled
                          />
                        </Form.Group>
                      </Form>
                    </Col>


                    {/* <div className="col-md-6 d-flex justify-content-center align-items-center">
                      <div className="text-center">
                        <p className="mb-0 italic" id="Au-Time">
                          <strong className="text-dark mr-2">Date:</strong> {currentDateremark}
                        </p>
                        <p className="mb-0 italic" id="Au-Time">
                          <strong className="text-dark mr-2">Time:</strong> {currentTime}
                        </p>
                      </div>
                    </div> */}

                  </Row>
                  <div class="row justify-content-end">
                    <div class="col-md-6  text-right">
                      <p className="mb-0 SuEdit-Time">
                        <strong>Date:</strong> {currentDateTime}
                      </p>
                    </div>
                  </div>

                </fieldset>

                <span className="">
                  <h4
                    className={
                      isUserType === "AU" ? "Manage-AU" : "Manage-UU"
                    }
                  >
                    {isUserType === "AU"
                      ? "Manage Admin Account"
                      : "Manage Authorized Account"}
                  </h4>
                </span>
                {userstatus !== "BLOCKED" ? (
                  <Row className="my-5 button_wraper">
                    {/* <Col classn="EditBtn">
                        <Button
                          type="submit"
                          variant="success"
                          size="sm"
                          onClick={handleSuccessModalClose}
                        >
                          SAVE
                        </Button>
                      </Col> */}
                    {isselectedType === 'AU' &&
                      <Col class="AuthorizedBtn">
                        {/* <Button
                          class="Button"
                          type="button"
                          variant="btn btn-secondary"
                          size="sm"
                          // onClick={replaceAccount}
                          onClick={() => replaceAccount(editUserId)}
                        >
                          REPLACE ACCOUNT
                        </Button> */}
                        <CentraliseButton
                          type="button"
                          text="REPLACE ACCOUNT"
                          variant="#235c73"
                          padding="3px 3px"
                          hoverBgColor="skyblue"
                          hoverTextColor="white"
                          onClick={() => replaceAccount(editUserId)}
                          width="200px"
                          fontsize="15px"
                        />

                      </Col>
                    }
                    {userstatus !== 'PENDING' &&
                      <Col class="RejectBtn">
                        <CentraliseButton
                          type="button"
                          text="BLOCK"
                          variant="black"
                          padding="3px 3px"
                          hoverBgColor="gray"
                          hoverTextColor="white"
                          onClick={() =>
                            handleSuModal(editUserId, new Date(), "BLOCKED")
                          }
                          width="150px"
                          fontsize="15px"
                        />
                      </Col>
                    }
                    {userstatus === 'PENDING' && <Col>
                      <CentraliseButton
                        type="button"
                        text="RESEND"
                        variant="#73235a"
                        padding="3px 3px"
                        hoverBgColor="skyblue"
                        hoverTextColor="white"
                        onClick={handleResend}
                        width="150px"
                        fontsize="15px"
                      />
                    </Col>}
                    <Col class="DeleteBtn">
                      <CentraliseButton
                        type="button"
                        text="DELETE"
                        variant=" #bd0a0a"
                        padding="3px 3px"
                        // hoverBgColor="#bd0a0b"
                        hoverTextColor="white"
                        onClick={() => {
                          if (isUserType === "UU") {
                            handleSuModal(editUserId, new Date(), "DELETE");
                          } else {
                            handleDelete();
                          }
                        }}
                        width="150px"
                        fontsize="15px"
                      />
                    </Col>
                    <Col class="">
                      <CentraliseButton
                        type="button"
                        text="CANCEL"
                        variant="#ab683f"
                        padding="3px 3px"
                        hoverBgColor="#ab683f9e"
                        hoverTextColor="white"
                        onClick={() => {
                          handleBackButtonClick()
                        }}
                        width="150px"
                        fontsize="15px"
                      />
                    </Col>

                  </Row>
                ) : (
                  <>

                    <Col class="RejectBtn">
                      <CentraliseButton
                        className="ml-5  my-sm-2"
                        type="button"
                        text="UNBLOCK"
                        onClick={() =>
                          handleSuModal(editUserId, new Date(), "UNBLOCKED")
                        }
                        // onClick={handleBackButtonClick }
                        variant="black"
                        padding="3px 3px"
                        hoverBgColor="gray"
                        hoverTextColor="white"
                        width="150px"
                        fontsize="15px"
                      />

                      <CentraliseButton
                        className="ml-5  my-sm-2"
                        type="button"
                        text="DELETE"
                        variant=" #bd0a0a"
                        padding="3px 3px"
                        // hoverBgColor="#bd0a0b"
                        hoverTextColor="white"
                        onClick={() => {
                          if (isUserType === "UU") {
                            handleSuModal(editUserId, new Date(), "DELETE");
                          } else {
                            handleDelete();
                          }
                        }}
                        width="150px"
                        fontsize="15px"
                      />

                      <CentraliseButton
                        className="ml-5  my-sm-2"
                        type="button"
                        text="CANCEL"
                        onClick={() => {
                          handleBackButtonClick()
                        }}
                        variant="#ab683f"
                        padding="3px 3px"
                        // hoverBgColor="#ab683f9e"
                        // hoverBgColor="#bd0a0b"
                        hoverTextColor="white"
                        width="150px"
                        fontsize="15px"
                      />
                    </Col>
                  </>
                )}

              </Form>
            </CentraliseheaderBody>
            {/* </Card.Body> */}
            {/* </Card> */}
          </div>
        </div>
      )}

      {/* General Edit Form */}
      {showModal && isUserType === "GU" && (
        <div
          id="popup"
          className="popup"
          style={{ display: isOpenprofile ? "block" : "none" }}
        >
          <div className="General-Popup-Content">
            {/* <span className="Close" onClick={GeneralModalClosed}>
              &times;
            </span> */}
            {/* <Card id="Card-Body border border-primary"> */}
            <Card.Body className="px-4 pt-1">
              <div class="row justify-content-end">
                {/* <div class="col-md-4  text-right">
                    <p className="GeneralEdit-Time mb-0">
                      <strong>Date:</strong> {currentDateTime}
                    </p>
                  </div> */}
              </div>

              <CentraliseheaderBody
                header="Manage General User (GU) Account"
                logo="GEOPICX_LOGO.png"
                headerBgColor="rgb(64 37 136)"        // Set your desired header background color
                headerTextColor="white"
                onClose={GeneralModalClosed}
              >
                <fieldset className="the-fieldsetGeneral mb-4 px-3 pt-4">
                  <legend className="the-legendSuEditUse"> User Details</legend>
                  <Form onSubmit={HandleGeneraform}>
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
                          disabled
                        />
                      </Col>
                    </Row>

                  </Form>
                  <div className="DateOfGEneral">
                    <p className="mb-0">
                      <strong>Date:</strong> {currentDateTime}
                    </p>
                  </div>

                </fieldset>
                {userstatus !== "BLOCKED" ? (
                  <>
                    <span className="">
                      <h4 className="Manage-GU" >
                        Manage General Account
                      </h4>
                    </span>

                    <Row className="my-4">
                      {/* <Col class="SaveGeneralBtn">
                      <CentraliseButton
                        className="ml-5  my-sm-2"
                        type="submit"
                        text="SAVE"
                        onClick={HandleGeneraform}
                        variant="#2b6e5b"
                        padding="6px 6px"
                        hoverBgColor="#2b6e5bcf"
                        hoverTextColor="white"
                        width="90px"
                        fontsize="15px"
                      />
                    </Col> */}

                      <Col class="RejectBtn">
                        <CentraliseButton
                          // className="ml-5  my-sm-2"
                          type="button"
                          text="BLOCK"
                          onClick={() =>
                            handleSuModal(editUserId, new Date(), "BLOCKED")
                          }
                          // onClick={handleBackButtonClick }
                          variant="black"
                          padding="3px 3px"
                          hoverBgColor="gray"
                          hoverTextColor="white"
                          width="150px"
                          fontsize="15px"
                        />
                        {/* <Button
                          class="Button"
                          type="button"
                          variant="btn btn-dark"
                          size="sm"
                          onClick={() =>
                         
                            handleSuModal(editUserId, new Date(), "BLOCKED")
                          }
                        >
                          BLOCK
                        </Button> */}
                      </Col>
                      <Col >
                        <CentraliseButton
                          // className="ml-5  my-sm-2"
                          type="button"
                          text=" DELETE"
                          onClick={() =>
                            handleSuModal(editUserId, new Date(), "DELETE")
                          }
                          // onClick={handleBackButtonClick }
                          variant="#bd0a0a"
                          padding="3px 3px"
                          // hoverBgColor="#bd0a0b"
                          hoverTextColor="white"
                          width="150px"
                          fontsize="15px"
                        />
                      </Col>

                      <Col class="DeleteBtn">
                        <CentraliseButton
                          // className="ml-5  my-sm-2"
                          type="button"
                          text="CANCEL"
                          variant="#ab683f"
                          padding="3px 3px"
                          hoverBgColor="#ab683f9e"
                          hoverTextColor="white"
                          onClick={() => {
                            handleBackButtonClick()
                          }}
                          width="150px"
                          fontsize="15px"
                        />
                      </Col>

                    </Row>
                  </>

                ) : (
                  <Col >
                    {/* <Button
                        class="Button"
                        type="button"
                        variant="btn btn-dark"
                        size="sm"
                        onClick={() =>
                          handleSuModal(editUserId, new Date(), "UNBLOCKED")
                        }
                      >
                        UNBLOCK
                      </Button> */}
                    <CentraliseButton
                      className="ml-5  my-sm-2"
                      type="button"
                      text="UNBLOCK"
                      onClick={() =>
                        handleSuModal(editUserId, new Date(), "UNBLOCKED")
                      }
                      // onClick={handleBackButtonClick }
                      variant="black"
                      padding="3px 3px"
                      hoverBgColor="gray"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />

                    <CentraliseButton
                      className="ml-5  my-sm-2"
                      type="button"
                      text=" DELETE"
                      onClick={() =>
                        handleSuModal(editUserId, new Date(), "DELETE")
                      }
                      // onClick={handleBackButtonClick }
                      variant="#bd0a0a"
                      padding="3px 3px"
                      // hoverBgColor="#bd0a0b"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />

                    <CentraliseButton
                      className="ml-5  my-sm-2"
                      type="button"
                      text="CANCEL"
                      onClick={() => {
                        handleBackButtonClick()
                      }}
                      variant="#ab683f"
                      padding="3px 3px"
                      // hoverBgColor="#ab683f9e"
                      // hoverBgColor="#bd0a0b"
                      hoverTextColor="white"
                      width="150px"
                      fontsize="15px"
                    />
                  </Col>
                )}

              </CentraliseheaderBody>


            </Card.Body>
            {/* </Card> */}
          </div>
        </div>
      )}




      {isProfile && (
        <ViewProfile
          isOpen={isProfile}
          selectedUser={selectedUser}
          onClose={closeModal}
          userType={isselectedType}
        />
      )}

      {/* MODAL  */}
      <SuModal modalProps={modalProps} />

    </Container>
  );
}

export default SuEditUser;
