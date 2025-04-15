import React, { useState, useEffect, useMemo } from "react";
import "./AuEditUser.css";
import {
  Row,
  Col,
  Form,
  Button,

} from "react-bootstrap";
import { City, Country, State } from "country-state-city";
import axios from "axios";
import AuModal from "../AuModal/AuModal.js";
import ViewProfile from "../../viewprofile/ViewProfile.js";
// loader
import Preloader from "../../Preloader/Preloader.js";
import ModalManager from "../../GeopicxPopupModals/ModalManager.js";
import { useDispatch, useSelector } from "react-redux";
import { adminFormClose, adminFormopen } from "../../StoreContext/features/profile/modalReducer.js";
import FormInputGroup from "../../../ReuseCompomenent/FormInputGroup.js";
import SelectBox from "../../../ReuseCompomenent/SelectBox.js";
import { GenderType, startSelectableDateISO, maxDateForDOBISO, removeWarningMassege } from "../../Constant";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faL, faTimes } from '@fortawesome/free-solid-svg-icons';
import Validators from "../../../ReuseCompomenent/validators.js";
import CentraliseheaderBody from "../../Centraliseheaderbody/CentraliseheaderBody.js";
import CentraliseButton from "../../CentraliseButton/CentraliseButton.js";


function AuEditUser({ userType, userName, userId }) {

  const newaccessToken = useSelector((state) => state.auth.accessToken);
  const [showTable, setShowTable] = useState(true);
  const [isUserType, setUserType] = useState("");
  const [initialFormValues, setInitialFormValues] = useState({});

  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [uuValue, setUuValue] = useState(null);
  const [authName, setAuthName] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfile, setIsProfile] = useState(false);
  const [uuId, setUUId] = useState(null);
  const [auCurrentDate, setCurrentDate] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [isAuModalOpen, setAuModalOpen] = useState(false);
  const [userstatus, setUserstatus] = useState(null);
  // loading component//
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState([]);
  const [admintype, setAdminType] = useState('');

  const [filteredData, setFilteredData] = useState(userData);
  const dataToMap = (filterText || filterDate) === '' ? userData : (filteredData);
  const isOpenprofile = useSelector((state) => state.modal.isadminformOpen);
  const [gender, setGender] = useState('');
  // coutry change////
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTheme, isSelectedTheme] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const departmentType = sessionStorage.getItem('departmentType');
  const [IsIndex, setIndex] = useState('');
  const [UuuserType, setUUuserType] = useState("");


  const dispatch = useDispatch();;

  const transformedModules = initialFormValues?.PERMISSION
    ? Object.fromEntries(
      Object.entries(initialFormValues.PERMISSION).map(([key, value]) => [key, value])
    )
    : {};

  const [selectedModules, setSelectedModules] = useState(transformedModules);

  const [formData, setFormData] = useState({
    USERNAME: "",
    MOBILE_NO: "",
    EMAIL: "",
    USER_TYPE: "UU",
    Theme_Section: "",
    AU_APRO_REM: "",
    APRO_DATE: "",
    USERID: "",
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    COUNTRY: '',
    STATE: '',
    CITY: '',
    GENDER: "",
    DOB: "",
    PIN_CODE: "",
    ADDRESS_1: "",
    ADDRESS_2: "",
    SU_APRO_STAT: "",
    AU_APRO_STAT: "",
    PERMISSION: {
      ...transformedModules,
    }
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

  const handleModuleChange = (module) => {
    setSelectedModules((prevModules) => ({
      ...prevModules,
      [module]: !prevModules[module],
    }));
  };



  const handleAuModal = (index, userId, value, uuName, currentDateTime, adminTheme, status) => {

    const selectedUser = userData[index];
    setIndex(selectedUser);
    setAuModalOpen(true);
    setUuValue(value);
    setAuthName(uuName);
    setUUId(userId);
    // if (value === 1) {
    //   fetchModuleGetData(userId);
    // }

    if (currentDateTime instanceof Date && !isNaN(currentDateTime)) {
      // Format the date as "YYYY-MM-DDTHH:mm:ssZ"
      const formattedDate = currentDateTime.toISOString();

      setCurrentDate(formattedDate);
    } else {
      console.error('Invalid date:', currentDateTime);
    }

    if (userId) {
      const result = userData.filter(user => user.USERID === userId);
      if (result.length > 0) {
        const permission_Modules = result[0].PERMISSION;
        setSelectedModules(permission_Modules);
      } else {
        // console.log("User not found");
      }
    }
  };

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

  useEffect(() => {
    if (newaccessToken) {
      fetchData();
    }
  }, [newaccessToken]);


  const fetchData = async () => {
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
        const authdata = response.data.message;
        setUserData(authdata);
        setAdminType(authdata[0].ADMIN_TYPE);


        // sessionStorage.setItem("user_data", JSON.stringify(authdata));
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("API request failed:", error);
    }
    finally {
      // Set isLoading to false after the API call is complete
      setIsLoading(false);
    }
  };

  const countryCodes = [
    { code: "+91", name: "IND" },
    // { code: '+1', name: 'USA' },
    // Add more country codes here
  ];

  const headings = [
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
    "Approval Date",
    "Profile",
    "Manage",
  ];



  const handleChangeGender = (e) => {
    const { value } = e.target;
    setGender(value);
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

  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  }

  const getCountryName = (isoCode) => {
    if (formData.COUNTRY === isoCode) {
      return formData.COUNTRY;
    }
    const country = Country.getAllCountries().find(
      (c) => c.isoCode === isoCode
    );
    return country ? country.name : "";
  };

  const getStateName = (countryIsoCode, stateIsoCode) => {
    if (formData.STATE === stateIsoCode) {
      return formData.STATE;
    }
    const states = State.getStatesOfCountry(countryIsoCode);
    const state = states.find((s) => s.isoCode === stateIsoCode);

    return state ? state.name : "";
  };

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

  useEffect(() => {
    if (selectedCountry && selectedState) {
      setCities(City.getCitiesOfState(selectedCountry, selectedState) || []);
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (userType === "AU" || userType === "UU") {
      if (selectedUserIndex !== null) {
        let selectedUserData;

        if (userType === "AU") {
          selectedUserData = userData[selectedUserIndex];
        }

        if (selectedUserData) {
          // Update form values using setFieldValue from Formik
          // Object.keys(selectedUserData).forEach((key) => {
          //   formik.setFieldValue(key, selectedUserData[key]);
          // });

          // Set form data
          setFormData({
            USERNAME: selectedUserData?.USERNAME || "",
            MOBILE_NO: selectedUserData?.MOBILE_NO || "",
            EMAIL: selectedUserData?.EMAIL || "",
            USER_TYPE: "UU",
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
            AU_APRO_STAT: selectedUserData?.AU_APRO_STAT
          });

          // Set selected country, state, and cities
          setSelectedCountry(selectedUserData?.COUNTRY || "");
          setSelectedState(selectedUserData?.STATE || "");
          setCities(City.getCitiesOfState(selectedUserData?.COUNTRY, selectedUserData?.STATE) || []);
          setGender(selectedUserData?.GENDER || "");

          setInitialFormValues(selectedUserData)
        }
      }
    }
  }, [selectedUserIndex, userData]);


  const initialValues = {

    USERNAME: initialFormValues?.USERNAME || "",
    MOBILE_NO: initialFormValues?.MOBILE_NO || "",
    EMAIL: initialFormValues?.EMAIL || "",
    USER_TYPE: "UU",
    Theme_Section: initialFormValues?.Theme_Section || "",
    AU_APRO_REM: initialFormValues?.AU_APRO_REM || "",
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
      GENDER: initialFormValues?.GENDER || "",
      DOB: initialFormValues?.DOB || "",
      PIN_CODE: initialFormValues?.PIN_CODE || "",
      ADDRESS_1: initialFormValues?.ADDRESS_1 || "",
      ADDRESS_2: initialFormValues?.ADDRESS_2 || "",
    },
    PERMISSION: {
      ...transformedModules,
    }
  };

  const HandleForm = (event) => {
    event.preventDefault();

    const transformedEditModules = Object.fromEntries(
      Object.entries(selectedModules).map(([key, value]) => [key, value])
    );

    const countryName = getCountryName(formData?.COUNTRY);
    const stateName = getStateName(formData?.COUNTRY, formData?.STATE);
    const payload = {
      USERNAME: formData?.USERNAME || "",
      MOBILE_NO: formData?.MOBILE_NO || "",
      EMAIL: formData?.EMAIL || "",
      USER_TYPE: formData?.USER_TYPE || "",
      Theme_Section: formData?.Theme_Section || "",
      AU_APRO_REM: formData?.AU_APRO_REM || "",
      APRO_DATE: formData?.APRO_DATE || null,
      USERID: formData?.USERID || "",

      logindata: {
        FIRST_NAME: formData?.FIRST_NAME,
        MIDDLE_NAME: formData?.MIDDLE_NAME,
        LAST_NAME: formData?.LAST_NAME,
        ORGANIZATION: formData?.ORGANIZATION || "",
        DESIGNATION: formData?.DESIGNATION || "",
        COUNTRY: countryName,
        STATE: stateName,
        CITY: formData?.CITY || "",
        GENDER: gender || "",
        DOB: formData?.DOB || "",
        PIN_CODE: formData?.PIN_CODE || "",
        ADDRESS_1: formData?.ADDRESS_1 || "",
        ADDRESS_2: formData?.ADDRESS_2 || "",
      },
      PERMISSION: {
        ...transformedEditModules,
      }
    };

    const isFormDataChanged = JSON.stringify(payload) !== JSON.stringify(initialValues);


    if (!isFormDataChanged) {
      ModalManager.warning({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: "Warning",
        message: `No changes were made to the form.`,
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
      formData.ADDRESS_1
    ) {

      ModalManager.confirm({
        modalHeaderHeading: 'Manage User',
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

    let response;
    try {
      // setIsLoading(true)
      LoaderUpdateProgress();
      response = await fetch(

        "http://127.0.0.1:8000/authorized_singup/",
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
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Success",
          message: "User Update Successfully",
          onConfirm: () => {
            removeWarningMassege(setTouched)
            fetchData();
            dispatch(adminFormClose());
          },
          confirmButtonText: 'OK',
        });
        // setShowSuccessModal(true);
      }

    } catch (error) {
      console.error("Error updating user:", error.message);
    }
    finally {

      if (response.status === 400) {
        modalProps.onClose();
        const errorData = await response.json();

        ModalManager.error({
          modalHeaderHeading: 'Manage User',
          modalBodyHeading: "Error",
          message: errorData.errors,
          confirmButtonText: 'OK',
        });
      }
      setLoading(false);
      setProgress(100);
    }

  }

  const handleAuthEditClick = (index, userId, theme, userName, userStatus) => {
    setSelectedUserIndex(index);
    setUserType("UU");
    setEditUserId(userId);
    isSelectedTheme(theme);
    // fetchModuleGetData(userId);
    setUserstatus(userStatus)
    setIsLoading(false);
    dispatch(adminFormopen())

    const result = userData.filter(user => user.USERID === userId);
    if (result.length > 0) {
      const permission_Modules = result[0].PERMISSION;
      setSelectedModules(permission_Modules);
    } else {
      // console.log("User not found");
    }
  };

  const handleProfile = (index, userId, userType) => {
    const selectedUser = userData[index];
    setSelectedUser(selectedUser);
    setIsLoading(false);
    setIsProfile(true);
    setUUuserType(userType)
  };

  const closeModal = () => {
    setIsProfile(false);
  };

  const handleCloseModal = () => {
    removeWarningMassege(setTouched)

    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: "",
      CITY: '',
    }));
    setUserType("");
    fetchData()

  };

  const handleAuCloseModal = () => {
    setAuModalOpen(false);
    //setUserType("");
    setIsLoading(false);
  };

  const handleAuthtable = (USERID, USERNAME) => {
    setShowTable(true);
    setIsLoading(false);
    const user = userData.find(u => u.USERID === USERID);
  };


  const getRowBackgroundColor = (user) => {
    if (user.SU_APRO_STAT === "BLOCKED") {
      return "#C0C0C0";
    }
    else if (user.AU_APRO_STAT === "BLOCKED") {
      return "#C0C0C0";
    }
    else if (user?.AU_APRO_STAT === "INPROGRESS") {
      return "rgb(223, 196, 156)";
    }
    else if (user?.AU_APRO_STAT === "APPROVED") {
      return "#ACE1AF";
    }
    else {
      return "#D2691E";
    }
  };

  function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return dateObject.toLocaleDateString("en-GB", options); // 'en-GB' ensures dd/mm/yyyy format
  }


  const handleUnBlockUser = async (index, userid, name, date, status) => {
    if (status === "BLOCKED") {

      const confirmationResult = await ModalManager.warning({
        modalHeaderHeading: 'Manage User',
        modalBodyHeading: 'Warning',
        message: 'You cannot UNBLOCK a User who has been blocked by the SUPERUSER..',
        confirmButtonText: 'OK',
      });

      if (!confirmationResult.isConfirmed) {
        return; // Do nothing if the user cancels
      }
    }
  };



  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    filterData(value);
    setFilterText(value);
    setStartDate('');
    setEndDate('');
  };

  const filterData = (text) => {
    const filtered = text === ''
      ? userData
      : userData.filter((user) =>
        user.USERNAME.toLowerCase().startsWith(text) ||
        user.AU_APRO_STAT.toLowerCase().startsWith(text)
      );
    setFilteredData(filtered);
  };

  const sortedHeadings = useMemo(() => {
    return headings.map((heading, index) => (
      <th key={index}>
        {heading}
      </th>
    ));
  }, [headings, handleFilterChange, isFilterOpen]);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const formatDateToString = (date) => {
    if (!date) {
      return '';  // or any default value you prefer for null dates
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleDateFilterButtonClick = (value) => {
    value.preventDefault();
    setFilterText('');

    const filteredData = userData.filter(user => {
      const creationDate = new Date(user.CREATION_DATE);
      const approvalDate = user.APRO_DATE ? new Date(user.APRO_DATE) : null;

      const formattedCreationDate = formatDateToString(creationDate);
      const formattedApprovalDate = formatDateToString(approvalDate);

      const isDateInRange =
        (!startDate || formattedCreationDate >= startDate) &&
        (!endDate || formattedCreationDate <= endDate) &&
        (!approvalDate || (!startDate || formattedApprovalDate >= startDate) && (!endDate || formattedApprovalDate <= endDate));

      // Include additional conditions for other filters if needed

      return isDateInRange;
    });

    if (startDate && endDate !== "") {
      setFilterDate(value);
    }

    setFilteredData(filteredData);
  };

  const handleClearFilter = (e) => {
    e.preventDefault();
    setFilterText('');
    setStartDate('');
    setFilteredData(userData);
    setEndDate('');
  }

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  //AU Modal
  const modalProps = {
    //isOpen: isSuModalOpen,
    isOpen: isAuModalOpen,
    onClose: handleAuCloseModal,
    uuValue: uuValue,
    uuId: uuId,
    authName: authName,
    auDate: auCurrentDate,
    userType: userType,
    selectedModules: selectedModules,
    setSelectedModules: setSelectedModules,
    fetchData: fetchData,
    status: formData.AU_APRO_STAT,

    IsIndex: IsIndex

  };


  const capitalizeThemeSection = (section) => {
    return section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
  };

  const handleBackButtonClick = () => {
    dispatch(adminFormClose());
    localStorage.clear();
  };

  return (
    // <Container fluid>
    <div className="container-flex">
      <Preloader loading={loading} progress={progress} />

      <span className="Admin-UU-Table-MainHeading">
        <h4 className="my-4 UU-Main-Heading">
          Manage AUTHORIZED User : {userName} ({departmentType === "WCADMIN" ? 'WCAU' : 'UDAU'})
        </h4>
        <div class="block_1 hline "></div>
      </span>

      <div class="flex-container mx-5 my-2">
        {/* <span className=""> */}
        {/* <h5 className=" View-heading">
          <strong>View & Manage Authorized USER  (UU)</strong>&nbsp;
        </h5> */}
        {/* </span> */}

        <form class="form-inline">

          <div class="form-group mb-2 p-2">
            <input type="text" class="form-control"
              value={filterText} onChange={handleFilterChange}
              placeholder="Username or AU Status"
              maxLength={15}
            />
          </div>

          <div class="form-group  mb-2 p-2">
            <input
              class="form-control "
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start Date"
              max={getCurrentDate()}
            />

          </div>
          <div class="form-group  mb-2 p-2">
            <input
              class="form-control"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End Date"
              max={getCurrentDate()}
            />
          </div>
          <div class="form-group  mb-2 p-2">
            <button onClick={handleDateFilterButtonClick} class="btn btn-success "  >Filter</button>
          </div>
          <div class="form-group mb-2 p-2">
            <button onClick={handleClearFilter} class="btn btn-success " >Clear</button>
          </div>
        </form>
        {/* </div> */}
      </div>



      {/* Table Start from below */}
      {/* Authorized Table */}
      {showTable && (
        <>

          {/* <div> */}
          <div className="mx-5">

            <span className="Admin-UU-Table-heading pb-sm-3">
              <h5 className="MobileheadingTableadmin">
                <strong >Authorized User (UU) View</strong> - {userName} ({departmentType === "WCADMIN" ? 'WCAU' : 'UDAU'})
              </h5>
            </span>
            <div
              className="table-container-au"

            // style={{
            //   overflowX: "auto",
            //   overflowY: "auto",
            //   height: fixedTableHeight,
            // }}
            >
              <div class="container-flex my-4">
              </div>
              <table className="UU-Table"
              style={{scrollbarWidth:"auto"}}>
                <thead >

                  <tr className="text-dark">{sortedHeadings}</tr>
                </thead>
                <tbody>
                  {dataToMap && dataToMap.length > 0 ? (
                    // {userData &&
                    dataToMap.map((user, index) => (

                      <tr
                        key={index}
                        style={{ backgroundColor: getRowBackgroundColor(user) }}
                      // style={{ backgroundColor: selectedUserIndex === index ? 'white' : getRowBackgroundColor(user) }}
                      >
                        <td className="UU-TD">{index + 1}</td>
                        <td className="UU-TD"
                          onClick={() =>
                            handleAuthtable(user?.USERID, user?.USERNAME)
                          }
                        //className={"UU-TD"}

                        >
                          {user?.USERID}
                        </td>
                        <td className="UU-TD">{user?.USERNAME}</td>
                        <td className="UU-TD">Authorized</td>

                        <td className="UU-TD">{user?.Theme_Section ? capitalizeThemeSection(user.Theme_Section) : ''}</td>

                        <td className="UU-TD">
                          {user?.SU_APRO_STAT ? capitalizeThemeSection(user.SU_APRO_STAT) : ''}
                        </td>
                        <td className="UU-TD">
                          {user?.AU_APRO_STAT ? capitalizeThemeSection(user.AU_APRO_STAT) : ''}
                        </td>
                        <td className="UU-TD">{formatDate(user?.CREATION_DATE)}</td>
                        <td className="UU-TD">{user?.APRO_DATE ? formatDate(user.APRO_DATE) : null}</td>
                        <td
                          // id="UUTD"
                          onClick={() => handleProfile(index, user?.USERID, user?.USER_TYPE)}
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
                        <td style={{ whiteSpace: 'nowrap', width: '210px' }}>
                          <div >
                            {(user?.SU_APRO_STAT !== 'BLOCKED' && user?.AU_APRO_STAT !== 'REJECTED' && user?.AU_APRO_STAT !== 'INPROGRESS') && (
                              <a
                                className="Edit-Btn UU-TD"
                                onClick={() => handleAuthEditClick(index, user?.USERID, user?.Theme_Section, user?.userName, user?.AU_APRO_STAT)}
                              >
                                <img
                                  src="edit.png"
                                  alt="Site Logo"
                                  width="20"
                                  height="20"
                                  title="Manage User"
                                  className="hoverable-image"
                                />
                                {/* EDIT */}
                              </a>)} &nbsp;

                            {(user.SU_APRO_STAT !== 'BLOCKED' && user.AU_APRO_STAT !== 'BLOCKED' && user.AU_APRO_STAT !== 'APPROVED') && (
                              <a
                                className="Approve-Btn UU-TD"
                                onClick={() =>
                                  handleAuModal(index, user?.USERID, 1, user?.USERNAME, new Date(), user?.Theme_Section, user.AU_APRO_STAT)
                                }
                              >
                                {/* <img
                                  src="approval.png"
                                  alt="Site Logo"
                                  width="20"
                                  height="20"
                                  title="Modules Approval"
                                  className="hoverable-image"
                                /> */}
                                APPROVAL
                              </a>
                            )}&nbsp;

                            {(user.SU_APRO_STAT !== 'BLOCKED' && user.AU_APRO_STAT !== 'BLOCKED' && user.AU_APRO_STAT !== 'REJECTED' && user.AU_APRO_STAT !== 'APPROVED') && (
                              <a
                                className="Reject-Btn UU-TD"
                                onClick={() =>
                                  handleAuModal(index, user?.USERID, 2, user?.USERNAME, new Date())
                                }
                              >
                                {/* <img
                                  src="rejected.png"
                                  alt="Site Logo"
                                  width="25"
                                  height="25"
                                  title="Reject User Request"
                                  className="hoverable-image"
                                /> */}
                                REJECT
                              </a>
                            )}

                            {(user.SU_APRO_STAT === 'BLOCKED') &&
                              <a
                                className="Block-Btn"
                                onClick={() =>
                                  handleUnBlockUser(index, user?.USERID, user?.USERNAME, new Date(), user?.SU_APRO_STAT)
                                }
                              >
                                <img
                                  src="edit.png"
                                  alt="Site Logo"
                                  width="20"
                                  height="20"
                                  title="Manage User"
                                  className="hoverable-image"
                                />

                              </a>
                            }
                          </div>
                        </td>
                      </tr>
                      // ))}
                    ))
                  ) : (
                    <tr>
                      <td colSpan="the_number_of_columns_in_your_table" style={{ textAlign: "center" }}>
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>
          {/* </div> */}
        </>
      )}

      {/* Auth EDIT Form */}
      {isOpenprofile && isUserType === "UU" && (
        <div
          id="popup"
          className="popup "
          style={{ display: isOpenprofile ? "block" : "none" }}

        >
          <div className="Popup-ContentAuEDit">
            {/* <span className="Au-Close" onClick={handleCloseModal}>
              &times;
            </span> */}
            <div Card
            // id="Card-Body border border-primary"
            >

              <div>

                <CentraliseheaderBody
                  className="FormAu"
                  // header={(
                  //   <>
                  //     {replaceAdminId ? 'Replace' : 'Create'} ADMIN User : Super User ({userName})
                  //   </>
                  // )}
                  header="Manage Authorized User (UU) Account"
                  logo="GEOPICX_LOGO.png"
                  headerBgColor="rgb(64 37 136)"        // Set your desired header background color
                  headerTextColor="white"
                  onClose={handleCloseModal}
                //  onClose={handleBackButtonClick}
                >
                  <Form onSubmit={HandleForm}>

                    <fieldset className="the-fieldsetAu mb-4">
                      {/* <legend className="the-legendAu">Account Details</legend> */}
                      <legend className="the-legendAu">User Details</legend>

                      <Row >
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
                        <Row >
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

                      <Row >
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
                            //value={initialFormValues.Theme_Section}
                            value={
                              initialFormValues.Theme_Section
                                ? initialFormValues.Theme_Section.charAt(0).toUpperCase() + initialFormValues.Theme_Section.slice(1).toLowerCase()
                                : ''
                            }
                            onBlur={handleBlur}
                            onblur={touched.Theme_Section}
                            onChangeError={(error) => handleChangeError('Theme_Section', error)}
                            onChange={handleChange}
                            errorMessage={errors.Theme_Section}
                            touched={touched.Theme_Section}
                            name="Theme_Section"
                            userType={isUserType}
                            disabled
                          />
                        </Col>
                      </Row>
                      <Row>

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
                      <Row className="mt-2" >
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

                      <Row >
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

                      </Row >
                      <Row>
                        <Col md="6">
                          <Form>
                            <Form.Group id="remarkField">
                              <Form.Label className="d-flex mx-2  Remark_leble" >Remark
                                <Validators
                                  value={formData.AU_APRO_REM}
                                  type="Remark"
                                  maxLength={100}
                                  onblur={touched.AU_APRO_REM}
                                  onChangeError={(error) => handleChangeError('AU_APRO_REM', error)}
                                  touched={touched.AU_APRO_REM}
                                />
                              </Form.Label>

                              <Form.Control
                                id="text_area"
                                type="text"
                                as="textarea"
                                rows={3}
                                name="AU_APRO_REM"
                                placeholder="Enter your remark here..."
                                value={formData.AU_APRO_REM}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={100}
                                disabled
                              />
                            </Form.Group>
                          </Form>
                        </Col>

                      </Row>

                      <hr class="mb-0 mt-4"></hr>
                      <div className="d-flex" >
                        <h4 className=" mb-3 Modle_heading_tage "> Manage Authorized User Module Approval</h4></div>
                      <Row >

                        <div className="row justify-content-start mx-4">
                          {Object.keys(selectedModules).map((module) => (
                            <React.Fragment key={module}>
                              <div className="col-12 col-sm-12 col-md-6 col-lg-6 mb-2">
                                <span
                                  // className="Module_wraper"
                                  className="d-flex align-items-center"
                                  style={{
                                    cursor: formData.AU_APRO_STAT === 'BLOCKED' ? 'not-allowed' : 'pointer',
                                    opacity: formData.AU_APRO_STAT === 'BLOCKED' ? 0.6 : 1,
                                  }}
                                  onClick={() => formData.AU_APRO_STAT !== 'BLOCKED' && handleModuleChange(module)}
                                >
                                  <span className={` rounded  px-5 inline-block text-white w-100 ${selectedModules[module] ? "bg-success" : "Icon_box_background"} `}>
                                    {module}
                                  </span>

                                  <span className={` Icon_box ${selectedModules[module] ? "icon_box_border_success" : "icon_box_border"}`} >
                                    <FontAwesomeIcon className={` ${selectedModules[module] ? "text-success" : "Icon_Text_color"}`} icon={selectedModules[module] ? faCheck : faTimes} />
                                  </span>

                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </Row>

                      <div class="row justify-content-end">
                        <div class="col-md-6  text-right">
                          <p className="mb-0 AuEdit-Time">
                            <strong>Date:</strong> {currentDateTime}
                          </p>
                        </div>
                      </div>

                    </fieldset>

                    {/* <hr class="mb-0 mt-4"></hr> */}
                    {/* <div className="container-flex text-left  mb-0 mt-0 ">
                      <h4 className="Modle_heading_tage">
                        Manage Authorized Account
                      </h4>
                    </div> */}

                    <span className="">
                      <h4 className="Manage-AU-UU" >
                        Manage Authorized Account
                      </h4>
                    </span>

                    {(!(userstatus === 'BLOCKED')) ? (
                      <Row className="mt-3 mb-4">
                        <Col classn="EditBtn">

                          <CentraliseButton
                            className="ml-5  my-sm-2"
                            type="submit"
                            text="AUTHORIZED"
                            // onClick={HandleGeneraform}
                            variant="#026d02"
                            padding="3px 3px"
                            hoverBgColor="#2b6e5bcf"
                            hoverTextColor="white"
                            width="150px"
                            fontsize="15px"
                          />
                        </Col>
                        {/* <Col class="AuthorizedBtn">
                          <CentraliseButton
                            className="ml-5  my-sm-2"
                            type="button"
                            text="AUTHORIZED"
                            // onClick={() =>
                            //   handleAuModal(editUserId, 3, null, new Date())
                            // }
                            // onClick={handleBackButtonClick }
                            variant="black"
                            padding="3px 3px"
                            hoverBgColor="gray"
                            hoverTextColor="white"
                            width="150px"
                            fontsize="15px"
                            disabled
                          />

                        </Col> */}
                        <Col class="RejectBtn">
                          <CentraliseButton
                            className="ml-5  my-sm-2"
                            type="button"
                            text=" BLOCK"
                            onClick={() =>
                              handleAuModal(IsIndex, editUserId, 3, null, new Date())
                            }
                            // onClick={handleBackButtonClick }
                            variant="black"
                            padding="3px 3px"
                            hoverBgColor="gray"
                            hoverTextColor="white"
                            width="150px"
                            fontsize="15px"
                          />
                        </Col>
                        <Col class="RejectBtn">
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
                      </Row>
                    ) : (
                      <Col class="RejectBtn">
                        <CentraliseButton
                          className="ml-5  my-sm-2"
                          type="button"
                          text="UNBLOCK"
                          onClick={() =>
                            handleAuModal(IsIndex, editUserId, 5, new Date(), "UNBLOCKED")
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
                    {/* </div> */}
                  </Form>
                </CentraliseheaderBody>
              </div>
              {/* Card.Body */}

            </div>
          </div>
        </div>
      )}

      {isProfile &&
        <ViewProfile
          isOpen={isProfile}
          selectedUser={selectedUser}
          onClose={closeModal}
          userType={UuuserType}
        />
      }

      {/* Modal */}
      {/* {isAuModalOpen && */}
      <AuModal
        modalProps={modalProps}
      />
      {/* } */}
      {/* </Container> */}
    </div>
  );
}

export default AuEditUser;

