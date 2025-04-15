import React, { useState, useRef, useEffect, useCallback } from 'react'
import Modal from "react-modal";
import MaxLengthErrorMessage from '../../../MaxLengthErrorMessage/MaxLengthErrorMessage';
import axios from 'axios';
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import Preloader from '../../../Preloader/Preloader';
import Swal from 'sweetalert2'
import {
  faBars,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft, faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
Modal.setAppElement("#root");
const Agriproject = ({ userType, userName, THEME_OPT, refreshToken, userId, closeForm , projectId, onSuccess}) => {
  //////////////////////////////////////////////////////////////////update the project id when confirm button is clicked///////
  const getLastProjectId = () => {
    const lastId = sessionStorage.getItem('lastProjectId');
    return lastId ? lastId : 'AGRI0001'; // Default to 'AGRI0000' if no ID is found
  };

  const incrementProjectId = (lastId) => {
    const numberPart = parseInt(lastId.replace('AGRI', ''), 10);
    const newNumber = numberPart + 1;
    return `AGRI${String(newNumber).padStart(4, '0')}`;
  };

  const saveNewProjectId = (newId) => {
    sessionStorage.setItem('lastProjectId', newId);
  };
  const [newProjectId, setNewProjectId] = useState(sessionStorage.getItem('lastProjectId') || "AGRI0001");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isActives, setIsActives] = useState(false);
  // show sidebar//
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  //   modal open and close//
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setIsActives(false);
  };

  // Function to open the success modal
  const openModal = () => {
    setShowSuccessModal(true);
  };
  const handleSubmitButtonClick = () => {
    // Perform any necessary actions here
    // Then open the success modal
    setIsActives(!isActives);
    openModal();
  };
  const handleClose = () => {
    closeForm(); // Call the closeForm function passed from the parent component
  };
  //time//
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10); // Get current date
    const currentTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // Get current time
    return { currentDate, currentTime };
  };

  // State variables to store date and time values
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [timeValue, setTimeValue] = useState("");

  // Set current date and time on component mount
  useEffect(() => {
    const { currentDate, currentTime } = getCurrentDateTime();
    setDateValue(currentDate);
    setTimeValue(currentTime);
  }, []);


  // year//
  const currentYear = new Date().getFullYear();
  const startYear = 2010;
  const endYear = 2024;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getButtonText = () => {
    const count = selectedYears.length;
    if (count === 0) return 'Select a Cropping Years';
    if (count <= 3) return `${selectedYears.join(', ')} year${count > 1 ? 's are' : ' is'} selected`;
    return `${count} years are selected`;
  };
  // const handleYearCheckboxChange = (year) => {
  //   if (selectedYears.includes(year)) {
  //     setSelectedYears(selectedYears.filter((selectedYear) => selectedYear !== year));
  //   } else {
  //     setSelectedYears([...selectedYears, year]);
  //   }
  // };

  // const handleYearCheckboxChange = (year) => {
  //   setSelectedYears(prevSelectedYears => {
  //     let newSelectedYears;
  //     if (prevSelectedYears.includes(year)) {
  //       newSelectedYears = prevSelectedYears.filter(y => y !== year);
  //     } else {
  //       newSelectedYears = [...prevSelectedYears, year];
  //     }

      
  //     setFormData(prevFormData => ({
  //       ...prevFormData,
  //       croppingYear: newSelectedYears.join(', '), // Update this as per your requirements
  //     }));

  //     return newSelectedYears;
  //   });
  // };

  // Function to handle clicks on the dropdown button
  const handleDropdownClick = (e) => {

    e.stopPropagation();
    // toggleDropdown();
    toggleDropdown(); // Toggle the dropdown visibility
    if (!isOpen) {
      e.preventDefault();
    }
  };


  // Function to prevent the default action when clicking on checkboxes
  const preventCheckboxClickDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        e.preventDefault();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  //time //
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Function to get the current time in HH:MM:SS format
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // useEffect hook to update the current time every second
  useEffect(() => {
    const timerID = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(timerID);
    };
  }, []);
  // for change form//
  const [currentSection, setCurrentSection] = useState("projectInfo");

  const handleButtonClick = (section) => {
    setCurrentSection(section);
  };
  // set next step//

  const handleNextButtonClick = () => {

    if (currentSection === "") {
      setCurrentSection("projectInfo");
    } else if (currentSection === "projectInfo") {
      setCurrentSection("projectInputs");
    } else if (currentSection === "projectInputs") {
      setCurrentSection("projectManagement");
    }
  };

  const handleNextButtoninfo = (e) => {


    if (currentSection === "projectInfo") {
      setCurrentSection("projectInputs");
    } else if (currentSection === "projectInputs") {
      setCurrentSection("projectManagement");
    }

    e.preventDefault();

    // Define key mappings inside handleSubmit
    const keyMappings = {
      projectClientOrganization: 'CLIENT_ORGANIZATION',
      projectExecutedOrganization: 'EXECUTED_ORGANIZATION',
      ProjectId: 'PROJECT_ID', // Assuming PROJECT_ID is the key expected by the backend
      ProjectName: 'PROJECT_NAME',
      ProjectDescription: 'PROJECT_DESCRIPTION',
      AreaInformation: 'AREA_INFORMATION',
      croppingYear: 'CROPPING_YEAR',
      // Add other mappings as needed
    };

    // Map old keys to new keys
    const postData = Object.keys(formData).reduce((acc, key) => {
      acc[keyMappings[key]] = formData[key];
      return acc;
    }, {});

    axios.post('http://127.0.0.1:8000/createproject/ProjectInformation/', postData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log('Success:', response.data);
        // Optionally, reset the form after successful submission
        setFormData({
          projectClientOrganization: '',
          projectExecutedOrganization: '',
          ProjectId: projectId,
          ProjectName: '',
          ProjectDescription: '',
          AreaInformation: '',
          croppingYear: '',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  //back//
  const handleBackButtonClick = () => {
    if (currentSection === "projectInfo") {
      setCurrentSection("");
    } else if (currentSection === "projectInputs") {
      setCurrentSection("projectInfo");
    } else if (currentSection === "projectManagement") {
      setCurrentSection("projectInputs");
    }
    // Add more conditions as needed for other sections
  };

  //for project information//
  const [counter, setCounter] = useState(1);
  const initialSelectedYearsList = [];

  // Define initial state for optionsOpen
  const initialOptionsOpen = false;

  const [selectedYearsList, setSelectedYearsList] = useState([]);
  const [optionsOpen, setOptionsOpen] = useState(initialOptionsOpen);
  
  const [formData, setFormData] = useState({

    projectClientOrganization: " ",
    projectExecutedOrganization: "",
    ProjectId: projectId,
    // ProjectId:"AGRI0001",
    ProjectName: "",
    croppingYear: "",
    // ProjectCreationByAu:"Rajesh_Reddy",
    ProjectDescription: "",
    AreaInformation: "",
    croppingSeason: "",
    CREATED_BY:"",
    
  });
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ProjectId: projectId,
     
    }));
  }, [projectId]);
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };
  const isFormValid = () => {
    // Add logic to check if all required fields are filled
    return (
      formData.projectClientOrganization.trim() !== "" &&
      formData.projectExecutedOrganization.trim() !== "" &&
      formData.ProjectName.trim() !== "" &&
      !errors.projectClientOrganization && // Check if there are no errors for projectClientOrganization
      !errors.projectExecutedOrganization && // Check if there are no errors for projectExecutedOrganization
      !errors.ProjectName
      // formData.ProjectDescription.trim() !== "" 
      // formData.AreaInformation.trim() !== ""
    );
  };
  // newone//
  // Define initial state for selectedYearsList
  

  const startingYear = 2010;
  const endingYear = 2024;
  const month = 5; // June is month 5 (0-based index)

  const toggleOptions = () => {
    setOptionsOpen(!optionsOpen);
  };

  // const handleCheckboxChange = (year) => {
  //   if (selectedYearsList.includes(year)) {
  //     setSelectedYearsList(selectedYearsList.filter(y => y !== year));
  //   } else {
  //     setSelectedYearsList([...selectedYearsList, year]);
  //   }
  // };
  const handleCheckboxChange = (year) => {
    setSelectedYearsList((prevList) =>
      prevList.includes(year) ? prevList.filter((y) => y !== year) : [...prevList, year]
    );
  };
  const handleYearCheckboxChange = (year) => {
    setSelectedYears(prevSelectedYears => {
      let newSelectedYears;
      if (prevSelectedYears.includes(year)) {
        newSelectedYears = prevSelectedYears.filter(y => y !== year);
      } else {
        newSelectedYears = [...prevSelectedYears, year];
      }

      // Update formData with the new croppingYear
      setFormData(prevFormData => ({
        ...prevFormData,
        croppingYear: newSelectedYears.join(', '), // Update this as per your requirements
      }));

      return newSelectedYears;
    });
  };
  const handleSelectChange = (event) => {
    const year = parseInt(event.target.value);
    handleCheckboxChange(year);
  };

  const yearOptions = [];
  for (let year = startingYear; year <= endingYear; year++) {
    const startDate = new Date(year, month);
    const endDate = new Date(year + 1, month - 1);
    const label = startDate.toLocaleString('default', { month: 'long' }) + ' ' + year + ' - ' + endDate.toLocaleString('default', { month: 'long' }) + ' ' + (year + 1);

    yearOptions.push(
      <option key={year} value={year}>
        {label}
      </option>
    );
  }
  const resetStates = useCallback(() => {
    console.log('Resetting states...');
    setSelectedYearsList(initialSelectedYearsList);
    setOptionsOpen(initialOptionsOpen);
  }, []);
  //UserName by local storage item//
  const [user, setUser] = useState("");
  const [themeOption, setThemeOption] = useState(null);
  const getUserNameFromsessionStorage = () => {

    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
      setUser(storedUserName);
    }
  };
  useEffect(() => {
    // Store userType and userName in sessionStorage when they're available as props
    if (userType && userName && THEME_OPT) {
      sessionStorage.setItem("userType", userType);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("themeOption", THEME_OPT)
      console.log("theme opt:" + THEME_OPT);
      setUser(userName);
      setThemeOption(THEME_OPT);
    } else {
      // If userName is not available as a prop, try to retrieve it from sessionStorage
      getUserNameFromsessionStorage();
    }

  }, [userName, userType, THEME_OPT]);
  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      User: user,
      ThemeOption: themeOption,
    }));
  }, [user, themeOption]);
  // console.log("theme opt:" + THEME_OPT);
  const initialCheckedItems = {
    Kharif: false,
    Rabi: false,
    Summer: false,
    All: false // Initially set to true
  };
  // checkbox selection//
  const [checkedItems, setCheckedItems] = useState(initialCheckedItems);

  // const handleChange = (event) => {
  //   const { name, checked } = event.target;
  //   if (name === 'vehicle4') {
  //     setCheckedItems({
  //       vehicle1: checked,
  //       vehicle2: checked,
  //       vehicle3: checked,
  //       vehicle4: checked
  //     });
  //   } else {
  //     setCheckedItems(prevState => ({
  //       ...prevState,
  //       [name]: checked
  //     }));
     
  //     if (checkedItems.vehicle4) {
  //       setCheckedItems(prevState => ({
  //         ...prevState,
  //         vehicle4: false
  //       }));
  //     }
  //   }
  // };
  const handleChange = (event) => {
    const { name, checked } = event.target;
    let updatedCheckedItems;
  
    if (name === 'All') {
      updatedCheckedItems = {
        Kharif: checked,
        Rabi: checked,
        Summer: checked,
        All: checked
      };
    } else {
      updatedCheckedItems = {
        ...checkedItems,
        [name]: checked
      };
      if (checkedItems.vehicle4) {
        updatedCheckedItems.vehicle4 = false;
      }
    }
  
    setCheckedItems(updatedCheckedItems);
  
    // Update croppingSeason in formData
    const selectedSeasons = [];
    for (const key in updatedCheckedItems) {
      if (updatedCheckedItems[key]) {
        selectedSeasons.push(key);
      }
    }
    setFormData(prevFormData => ({
      ...prevFormData,
      croppingSeason: selectedSeasons.join(", ")
    }));
  };

  // folderupload and create//
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [projectInfoFolderName, setProjectInfoFolderName] = useState('');
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [FormId, seFormId] = useState('');

  const [createAoIFolder, setCreateAoIFolder] = useState(false);
  const [aoiCheckbox, setAoiCheckbox] = useState('');
  const [aoi, setAoi] = useState('');
  const [gtcheckbox, setGtcheckbox] = useState('');
  const [gt, setGt] = useState(''); // State for GIS folder checkbox
  const [createGTFolder, setCreateGTFolder] = useState(false);
  //Gismask//
  const [createGismask, setGismask] = useState(false);
  const [gismaskCheckbox, setGismaskCheckbox] = useState('');
  const [gismask, setgismask] = useState('');
  //satellites///
  const [createsatellite, setcreateSatellite] = useState(false);
  const [satelliteCheckbox, setSatelliteCheckbox] = useState('');
  const [satellite, setSatellite] = useState('');
  //weather///
  const [createweather, setcreateWeather] = useState(false);
  const [weatherCheckbox, setWeatherCheckbox] = useState('');
  const [weather, setWeather] = useState('');
  //////////historical////////////
  const [createhistorical, setcreateHistorical] = useState(false);
  const [historicalCheckbox, setHistoricalCheckbox] = useState('');
  const [historical, setHistorical] = useState('');

  const selectDirectory = async () => {
    try {

      const handle = await window.showDirectoryPicker();
      console.log('Directory selected:', handle);
      const directoryName = handle.name || 'Unknown Directory';
      const filesystemName = handle.filesystem?.name || '';
      const filesystemInfo = filesystemName ? `(${filesystemName})` : '';
      setDirectoryHandle(handle);
      setSelectedFolderName(handle.name); // Set the selected folder name
      setMessage('Directory selected. Creating project folder...');
      createFolder(handle); // Automatically create the project folder after selecting the directory
    } catch (error) {
      console.error('Error selecting directory:', error);
      setMessage('Error selecting directory: ' + error.message);
    }
  };

  const createFolder = async (directoryHandle) => {
    if (!directoryHandle) {
      setMessage('Please select a directory first.');
      return;
    }
    if (!formData.ProjectId) {
      setMessage('Please enter a project name.');
      return;
    }

    try {
      console.log('Creating new folder:', formData.ProjectId);
      // Create a new directory within the selected directory using the project name
      const newDirectoryHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId, { create: true });
      console.log('Folder created successfully:', newDirectoryHandle);
      seFormId(` ${formData.ProjectId} `);

      // Create the project info folder within the project folder
      const ProjectInfo = `${formData.ProjectId}_ProjectInfo`;
      const projectInfoFolderHandle = await newDirectoryHandle.getDirectoryHandle(ProjectInfo, { create: true });
      console.log('Project info folder created successfully:', projectInfoFolderHandle);
      setProjectInfoFolderName('ProjectInfo');
      setAoi("AOI");
      setGt("GT")
      setgismask("MASK")
      setSatellite("SATELLITE")
      setWeather("WEATHER")
      setHistorical("Historical")
      // Set the project info folder name
    } catch (error) {
      console.error('Error creating folder:', error);
      setMessage('Error creating folder: ' + error.message);
    }
  };
  const createAoIFolderInProject = async (projectFolderHandle) => {
    try {
      const aoiFolderName = `${formData.ProjectId}_AOI`;
      const AoIFolderHandle = await projectFolderHandle.getDirectoryHandle(aoiFolderName, { create: true });
      console.log('AoI folder created successfully inside project:', AoIFolderHandle);
      const path = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${aoi}`;
      setAoiCheckbox(` ${path}`);
    } catch (error) {
      console.error('Error creating AoI folder:', error);
      setAoiCheckbox('Error creating AoI folder: ' + error.message);
    }
  };
  const handleCheckboxChangeFolder = async (e) => {

    if (!createAoIFolder) {
      setCreateAoIFolder(true);
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the AoI folder inside the project folder
        await createAoIFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        // setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };

  const createGTFolderInProject = async (projectFolderHandle) => {

    try {
      const gt_infoFolderName = `${formData.ProjectId}_GT`;
      const GTFolderHandle = await projectFolderHandle.getDirectoryHandle(gt_infoFolderName, { create: true });
      console.log('GT folder created successfully inside project:', GTFolderHandle);
      const gtpath = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${gt}`;
      setGtcheckbox(gtpath);
      // setGtcheckbox(`GT folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GT folder:', error);
      setMessage('Error creating GT folder: ' + error.message);
    }
  };
  const handleGTFolderCheckboxChange = async (e) => {
    // setCreateGTFolder(e.target.checked);
    if (!createGTFolder) {
      setCreateGTFolder(true);
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the GT folder inside the project folder
        await createGTFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        // setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };
  // gismask
  const createGISFolderInProject = async (projectFolderHandle) => {
    try {
      const gismask_FolderName = `${formData.ProjectId}_GISMASK`;
      const GISFolderHandle = await projectFolderHandle.getDirectoryHandle(gismask_FolderName, { create: true });
      console.log('GIS folder created successfully inside project:', GISFolderHandle);
      const gisPath = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${gismask}`;
      setGismaskCheckbox(gisPath);
      // setMessage(`GIS folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GIS folder:', error);
      // setMessage('Error creating GIS folder: ' + error.message);
    }
  };
  const handleGISmaskFolderCheckboxChange = async (e) => {
    // setGismask(e.target.checked);
    if (!createGismask) {
      setGismask(true)
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the GIS folder inside the project folder
        await createGISFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };
  ////satellite Data//
  const createSatelliteFolderInProject = async (projectFolderHandle) => {
    try {
      const Satellite_FolderName = `${formData.ProjectId}_SATELLITE`;
      const SatelliteFolderHandle = await projectFolderHandle.getDirectoryHandle(Satellite_FolderName, { create: true });
      console.log('GIS folder created successfully inside project:', SatelliteFolderHandle);
      const satellitePath = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${satellite}`;
      setSatelliteCheckbox(satellitePath);
      // setMessage(`GIS folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GIS folder:', error);
      // setMessage('Error creating GIS folder: ' + error.message);
    }
  };
  const handleSatelliteFolderCheckboxChange = async (e) => {
    // setcreateSatellite(e.target.checked);
    if (!createsatellite) {
      setcreateSatellite(true)
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the GIS folder inside the project folder
        await createSatelliteFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };
  ////////////////// //weather//////////////
  const createWeatherFolderInProject = async (projectFolderHandle) => {
    try {
      const weather_FolderName = `${formData.ProjectId}_WEATHER`;
      const WeatherFolderHandle = await projectFolderHandle.getDirectoryHandle(weather_FolderName, { create: true });
      console.log('GIS folder created successfully inside project:', WeatherFolderHandle);
      const WeatherPath = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${weather}`;
      setWeatherCheckbox(WeatherPath);
      // setMessage(`GIS folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GIS folder:', error);
      // setMessage('Error creating GIS folder: ' + error.message);
    }
  };
  const handleWeatherFolderCheckboxChange = async (e) => {
    // setcreateWeather(e.target.checked);
    if (!createweather) {
      setcreateWeather(true);
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the GIS folder inside the project folder
        await createWeatherFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };
  ////////////////////////////////////////historicaldata//////////////////
  const createHistoricalFolderInProject = async (projectFolderHandle) => {
    try {
      const historical_FolderName = `${formData.ProjectId}_HISTORICAL`;
      const HistoricalFolderHandle = await projectFolderHandle.getDirectoryHandle(historical_FolderName, { create: true });
      console.log('GIS folder created successfully inside project:', HistoricalFolderHandle);
      const HistoricalPath = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${historical}`;
      setHistoricalCheckbox(HistoricalPath);
      // setMessage(`GIS folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GIS folder:', error);
      // setMessage('Error creating GIS folder: ' + error.message);
    }
  };
  const handleHistoricalFolderCheckboxChange = async (e) => {
    // setcreateHistorical(e.target.checked);
    if (!createhistorical) {
      setcreateHistorical(true);
      try {
        let projectFolderHandle;
        // Create the project folder if it doesn't exist
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
        } catch {
          projectFolderHandle = await createFolder();
        }

        // Create the GIS folder inside the project folder
        await createHistoricalFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };
  /////////////////////////////////////////Upload AOI ////////////////
  // const handleUploadAoi = async () => {
  //   try {
  //     if (!aoiCheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }


  //     const uploadDirHandle = await window.showDirectoryPicker();
  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const aoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI');

  //     await copyDirectory(uploadDirHandle, aoIFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };
  //   const handleUploadAoi = async () => {
  //     try {
  //         if (!aoiCheckbox) {
  //             setMessage('Please create the AoI folder first.');
  //             return;
  //         }


  //         const [fileHandle] = await window.showOpenFilePicker();
  //         const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //         const aoiFolderName = `${formData.ProjectId}_AOI`;
  //         const aoIFolderHandle = await projectFolderHandle.getDirectoryHandle( aoiFolderName);

  //         await copyFile(fileHandle, aoIFolderHandle);
  //         setMessage('AOI file uploaded successfully.');
  //     } catch (error) {
  //         console.error('Error uploading AOI:', error);
  //         setMessage('Error uploading AOI: ' + error.message);
  //     }
  // };
  const [fileHandle, setFileHandle] = useState(null);
  const [aoiFileHandle, setAoiFileHandle] = useState(null);
  const [gismaskFileHandle, setGismaskFileHandle] = useState(null);
  const [satelliteFileHandle, setSatelliteFileHandle] = useState(null);
  const [weatherFileHandle, setWeatherFileHandle] = useState(null);
  const [historicalFileHandle, setHistoricalFileHandle] = useState(null);
  const handleUploadAoi = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setAoiFileHandle(fileHandle);
      setMessage('AOI file selected.');
    } catch (error) {
      console.error('Error selecting AOI file:', error);
      setMessage('Error selecting AOI file: ' + error.message);
    }
  };
  const copyFileToFolder = async (fileHandle, folderName) => {
    try {
      if (!fileHandle || !directoryHandle || !formData.ProjectId) {
        throw new Error('Missing required information for copying the file.');
      }

      const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
      const folderHandle = await projectFolderHandle.getDirectoryHandle(folderName, { create: true });

      const file = await fileHandle.getFile();
      const newFileHandle = await folderHandle.getFileHandle(file.name, { create: true });
      const writable = await newFileHandle.createWritable();
      await writable.write(file);
      await writable.close();
    } catch (error) {
      console.error(`Error copying file to ${folderName}:`, error);
      throw new Error(`Error copying file to ${folderName}: ` + error.message);
    }
  };

  // const copyFileToAoiFolder = async () => {
  //     try {
  //       if (!fileHandle || !directoryHandle || !formData.ProjectId) {
  //         throw new Error('Missing required information for copying the file.');
  //       }

  //       const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //       const aoiFolderName = `${formData.ProjectId}_AOI`;
  //       const aoIFolderHandle = await projectFolderHandle.getDirectoryHandle(aoiFolderName, { create: true });

  //       const file = await fileHandle.getFile();
  //       const newFileHandle = await aoIFolderHandle.getFileHandle(file.name, { create: true });
  //       const writable = await newFileHandle.createWritable();
  //       await writable.write(file);
  //       await writable.close();
  //     } catch (error) {
  //       console.error('Error copying AOI file:', error);
  //       throw new Error('Error copying AOI file: ' + error.message);
  //     }
  //   };

  const copyFile = async (fileHandle, destDirHandle) => {
    const file = await fileHandle.getFile();
    const newFileHandle = await destDirHandle.getFileHandle(file.name, { create: true });
    const writable = await newFileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  };

  // ////////////////////////////////////SelectGT/////////////////////
  // const handleUploadGT = async () => {
  //   try {
  //     if (!gtcheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }

  //     const [fileHandle] = await window.showOpenFilePicker();

  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const gt_infoFolderName = `${formData.ProjectId}_GT`;
  //     const gtIFolderHandle = await projectFolderHandle.getDirectoryHandle(gt_infoFolderName);

  //     await copyFile(fileHandle, gtIFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };
  const [gtFileHandle, setGtFileHandle] = useState(null);
  const handleUploadGT = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setGtFileHandle(fileHandle);
      setMessage('GT file selected.');
    } catch (error) {
      console.error('Error selecting GT file:', error);
      setMessage('Error selecting GT file: ' + error.message);
    }
  };
  /////////////////////////SelectGismask///////////////////////////
  // const handleUploadGISMASK = async () => {
  //   try {
  //     if (!gismaskCheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }


  //     const [fileHandle] = await window.showOpenFilePicker();;
  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const gismask_FolderName = `${formData.ProjectId}_GISMASK`;
  //     const gismaskIFolderHandle = await projectFolderHandle.getDirectoryHandle( gismask_FolderName);

  //     await  copyFile(fileHandle, gismaskIFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };


  const handleUploadGISMASK = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setGismaskFileHandle(fileHandle);
      setMessage('GT file selected.');
    } catch (error) {
      console.error('Error selecting GT file:', error);
      setMessage('Error selecting GT file: ' + error.message);
    }
  };
  //////////////////////Upload satellite///////////////////////
  // const handleUploadSatellite = async () => {
  //   try {
  //     if (!satelliteCheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }

  //     const [fileHandle] = await window.showOpenFilePicker();;
  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const Satellite_FolderName = `${formData.ProjectId}_SATELLITE`;
  //     const satelliteFolderHandle = await projectFolderHandle.getDirectoryHandle(Satellite_FolderName);

  //     await copyFile(fileHandle, satelliteFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };
  const handleUploadSatellite = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setSatelliteFileHandle(fileHandle);
      setMessage('GT file selected.');
    } catch (error) {
      console.error('Error selecting GT file:', error);
      setMessage('Error selecting GT file: ' + error.message);
    }
  };
  //////////////////////Upload Weather///////////////////////
  // const handleUploadWeather = async () => {
  //   try {
  //     if (!weatherCheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }

  //     const [fileHandle] = await window.showOpenFilePicker();
  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const weather_FolderName = `${formData.ProjectId}_WEATHER`;
  //     const weatherFolderHandle = await projectFolderHandle.getDirectoryHandle( weather_FolderName);

  //     await copyFile(fileHandle, weatherFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };
  const handleUploadWeather = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setWeatherFileHandle(fileHandle);
      setMessage('GT file selected.');
    } catch (error) {
      console.error('Error selecting GT file:', error);
      setMessage('Error selecting GT file: ' + error.message);
    }
  };
  //////////////////////Upload HistoricalData///////////////////////
  // const handleUploadHistoricalData = async () => {
  //   try {
  //     if (!historicalCheckbox) {
  //       setMessage('Please create the AoI folder first.');
  //       return;
  //     }

  //     const [fileHandle] = await window.showOpenFilePicker();
  //     const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
  //     const historical_FolderName = `${formData.ProjectId}_HISTORICAL`;
  //     const historicalFolderHandle = await projectFolderHandle.getDirectoryHandle( historical_FolderName);

  //     await copyFile(fileHandle, historicalFolderHandle);

  //   } catch (error) {
  //     console.error('Error uploading AOI:', error);
  //     setMessage('Error uploading AOI: ' + error.message);
  //   }
  // };
  const handleUploadHistoricalData = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      setHistoricalFileHandle(fileHandle);
      setMessage('GT file selected.');
    } catch (error) {
      console.error('Error selecting GT file:', error);
      setMessage('Error selecting GT file: ' + error.message);
    }
  };
  const inputFields = [
    { name: "ProjectName", maxLength: 50 },
    { name: "projectClientOrganization", maxLength: 50 },
    { name: "ProjectDescription", maxLength: 200 },
    { name: "AreaInformation", maxLength: 200 },
    { name: "projectExecutedOrganization", maxLength: 20 }
  ];

  const projectNameMaxLength = inputFields.find(
    (field) => field.name === "ProjectName"
  ).maxLength;
  const projectClientOrganizationM = inputFields.find(
    (field) => field.name === "projectClientOrganization"
  ).maxLength;
  const projectAreaInformation = inputFields.find(
    (field) => field.name === "AreaInformation"
  ).maxLength;
  const projectDescriptionMaxLength = inputFields.find(
    (field) => field.name === "ProjectDescription"
  ).maxLength;
  const projectExecutedMaxLength = inputFields.find(
    (field) => field.name === "projectExecutedOrganization"
  ).maxLength;

  const copyDirectory = async (srcDirHandle, destDirHandle) => {
    for await (const entry of srcDirHandle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const newFileHandle = await destDirHandle.getFileHandle(entry.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      } else if (entry.kind === 'directory') {
        const newDirHandle = await destDirHandle.getDirectoryHandle(entry.name, { create: true });
        await copyDirectory(entry, newDirHandle);
      }
    }
  };
  ////////nextbutton//////
  const isNextButtonDisabled = !selectedFolderName || !satelliteCheckbox;


  ////////////add uu user in it ///////
  // ASCII code for 'a'
  // const [checkboxes, setCheckboxes] = useState({
  //   a: false,
  //   b: false,
  //   c: false,
  //   d: false,
  //   e: false,
  //   f: false,

  // });

  const [checkboxes, setCheckboxes] = useState({
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: '',
  });

  const getCheckboxValue = (id) => {
    switch (id) {
      case 'a': return 'Stacking';
      case 'b': return 'Unsupervised Classification';
      case 'c': return 'Supervised Classification';
      case 'd': return 'Recode, Clump, Eliminate';
      case 'e': return 'Analysis';
      case 'f': return 'Statistics';
      default: return '';
    }
  };



  const handleCheckboxManagement = (event) => {
    const { id, checked } = event.target;
    setCheckboxes(prevState => ({
      ...prevState,
      [id]: checked ? getCheckboxValue(id) : ''
    }));
    // setCheckboxes({ ...checkboxes, [id]: checked });
  };


  //////////////Addeach row for uu user/////
  const [addformData, setAddFormData] = useState([]);


  // const handleAddButtonClick = () => {
  //   const newName = `UU${addformData.length + 1}`;
  //   setAddFormData([...addformData, { name: newName, uuname: "", permissions: { a: false, b: false, c: false, d: false, e: false, f: false } }]);
  // };

  const handleAddButtonClick = () => {
    setAddFormData((prevFormData) => [
      ...prevFormData,
      { name: '', uuname: '', permissions: { a: '', b: '', c: '', d: '', e: '', f: '' } },
    ]);
  };
  // const handleClearButtonClick = () => {
  //   setAddFormData(addformData.slice(1));
  // };
  const handleClearButtonClick = () => {

    const newAddFormData = [...addformData];
    newAddFormData.pop();
    setAddFormData(newAddFormData);
  };
  // const handleCheckboxChang = (index, permission) => {
  //   const newAddFormData = [...addformData];
  //   newAddFormData[index].permissions[permission] = !newAddFormData[index].permissions[permission];
  //   setAddFormData(newAddFormData);
  // };
  const handleCheckboxChang = (index, permission) => {
    setAddFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        permissions: {
          ...updatedFormData[index].permissions,
          [permission]: updatedFormData[index].permissions[permission] ? '' : getCheckboxValue(permission),
        },
      };
      return updatedFormData;
    });
  };
  ///////ad input value for uu user////
  // const handleNameChange = (index, event) => {
  //   const newAddFormData = [...addformData];
  //   newAddFormData[index].uuname = event.target.value;
  //   setAddFormData(newAddFormData);
  // };
  const handleNameChange = (index, event) => {
    const { value } = event.target;
    setAddFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        uuname: value,
      };
      return updatedFormData;
    });
  };
  ///modal edit////
  const handleEdit = () => {

    setShowSuccessModal(false);
    setCurrentSection("projectInfo");  // Navigate to "projectInfo" section
  };

  /////////////create xml while clicking on confirm button//////////////////////////////////////////////////
  //  const [newProjectId, setNewProjectId] = useState(formData.ProjectId);
 ////////////preloadercomponent//////////////////
 const [loading, setLoading] = useState(false);
 const [progress, setProgress] = useState(0);
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
}
const [receivedProjectInfo, setReceivedProjectInfo] = useState(null); 
  const handleConfirm = async () => {

    try {
      setLoading(true);
      setProgress(0);
      LoaderUpdateProgress();
      if (!directoryHandle || !formData.ProjectId) {
        setMessage('Please complete the project setup first.');
        return;
      }
      // const lastProjectId = getLastProjectId();
      // const newProjectId = incrementProjectId(lastProjectId);
      // saveNewProjectId(newProjectId);
      // sessionStorage.setItem('projectId', newProjectId);
      // saveNewProjectId(newProjectId);

      try {
        if (aoiFileHandle) await copyFileToFolder(aoiFileHandle, `${formData.ProjectId}_AOI`);
        if (gtFileHandle) await copyFileToFolder(gtFileHandle, `${formData.ProjectId}_GT`);
        if (gismaskFileHandle) await copyFileToFolder(gismaskFileHandle, `${formData.ProjectId}_GISMask`);
        if (satelliteFileHandle) await copyFileToFolder(satelliteFileHandle, `${formData.ProjectId}_Satellite`);
        if (weatherFileHandle) await copyFileToFolder(weatherFileHandle, `${formData.ProjectId}_Weather`);
        if (historicalFileHandle) await copyFileToFolder(historicalFileHandle, `${formData.ProjectId}_Historical`);

        setMessage('Files uploaded successfully.');
      } catch (error) {
        
        setMessage(error.message);
        return; // Exit the function if file upload fails
      }
      formData.CREATED_BY = sessionStorage.getItem("userName");
//       const folderData = {
//   PROJECT_ID: formData.ProjectId,
//   WORKSPACE_LOCATION: selectedFolderName,
//   PROJECT_FOLDER: `${selectedFolderName} / ${FormId}`,
//   PROJECT_INFORMATION:`${selectedFolderName} / ${FormId}/${FormId}_${projectInfoFolderName}`,
//   AREA_OF_INTEREST: aoiCheckbox,
//   GROUND_TRUTH: gtcheckbox,
//   GIS_MASK_BASEMAP: gismaskCheckbox,
//   SATELLITE_DATA: satelliteCheckbox,
//   WEATHER_DATA: weatherCheckbox,
//   HISTORICAL_DATA: historicalCheckbox,
// };
const folderData = {
  PROJECT_ID: formData.ProjectId || "",
  WORKSPACE_LOCATION: selectedFolderName || "",
  PROJECT_FOLDER: `${selectedFolderName || ""} / ${FormId || ""}`,
  PROJECT_INFORMATION: `${selectedFolderName || ""} / ${FormId || ""}/${FormId || ""}_${projectInfoFolderName || ""}`,
  AREA_OF_INTEREST: aoiCheckbox || "",
  GROUND_TRUTH: gtcheckbox || "",
  GIS_MASK_BASEMAP: gismaskCheckbox || "",
  SATELLITE_DATA: satelliteCheckbox || "",
  WEATHER_DATA: weatherCheckbox || "",
  HISTORICAL_DATA: historicalCheckbox || "",
  CLIENT_ORGANIZATION: formData.projectClientOrganization || "",
  EXECUTED_ORGANIZATION: formData.projectExecutedOrganization || "",
  PROJECT_NAME: formData.ProjectName || "",
  PROJECT_DESCRIPTION: formData.ProjectDescription || "",
  AREA_INFORMATION: formData.AreaInformation || "",
  CROPPING_YEAR: formData.croppingYear || "",
  CROPPING_SEASON: formData.croppingSeason || "",
  CREATED_BY: formData.CREATED_BY || "",
};
      // Define key mappings inside handleConfirm
      const keyMappings = {
        ...folderData,
        projectClientOrganization: 'CLIENT_ORGANIZATION',
        projectExecutedOrganization: 'EXECUTED_ORGANIZATION',
        ProjectId: projectId,
        ProjectName: 'PROJECT_NAME',
        ProjectDescription: 'PROJECT_DESCRIPTION',
        AreaInformation: 'AREA_INFORMATION',
        croppingYear: 'CROPPING_YEAR',
        croppingSeason: 'CROPPING_SEASON',
        CREATED_BY: 'CREATED_BY',
       
      };

      // Map old keys to new keys
      const postData = Object.keys(formData).reduce((acc, key) => {
        // Check if keyMappings has a mapping for the current key
        if (keyMappings[key]) {
          acc[keyMappings[key]] = formData[key];
        }
        return acc;
      }, {});
      // const postData = Object.keys(formData).reduce((acc, key) => {
      //   acc[keyMappings[key]] = formData[key];
      //   return acc;
      // }, {});
         ///////for ProjectInformation//////
      // try {
      //   const response = await axios.post('http://127.0.0.1:8000/createproject/ProjectInformation/', postData, {
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
          
      //   });
      try {
        const response = await axios.post('http://127.0.0.1:8000/createproject/wcprojectinformationinput/', folderData, {
          headers: {
            'Content-Type': 'application/json',
          },
          
        });
        /////////for updating the value of id////
        const newResponse = await axios.get('http://127.0.0.1:8000/createproject/wcgetnextprojectid/');
        const { next_project_id: newProjectId } = newResponse.data;
        setFormData({ ...formData, ProjectId: newProjectId });
        onSuccess(newProjectId);
        console.log('Success:', response.data);
///////////////////////////for folderpost request/////////


// const folderData = {
//   PROJECT_ID: formData.ProjectId,
//   WORKSPACE_LOCATION: selectedFolderName,
//   PROJECT_FOLDER: `${selectedFolderName} / ${FormId}`,
//   PROJECT_INFORMATION:`${selectedFolderName} / ${FormId}/${FormId}_${projectInfoFolderName}`,
//   AREA_OF_INTEREST: aoiCheckbox,
//   GROUND_TRUTH: gtcheckbox,
//   GIS_MASK_BASEMAP: gismaskCheckbox,
//   SATELLITE_DATA: satelliteCheckbox,
//   WEATHER_DATA: weatherCheckbox,
//   HISTORICAL_DATA: historicalCheckbox,
// };

// try {
//   await axios.post('http://127.0.0.1:8000/createproject/ProjectsInputs/', folderData, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// } catch (error) {
  
//   console.error('Error posting folder data:', error);
  
// }
const projectManagementData = {
  PROJECT_ID: formData.ProjectId,
  ADMIN_USER: formData.CREATED_BY,
  WORK_ASSIGN_USER: [
      formData.CREATED_BY, // Include ADMIN_USER
      ...addformData.map(item => item.uuname)
  ],
  STACKING: [
      checkboxes.a ? 'STACKING' : '',
      ...addformData.map(item => item.permissions.a ? 'STACKING' : '')
  ],
  UNSUPERVISED_CLASSIFICATION: [
      checkboxes.b ? 'UNSUPERVISED_CLASSIFICATION' : '',
      ...addformData.map(item => item.permissions.b ? 'UNSUPERVISED_CLASSIFICATION' : '')
  ],
  SUPERVISED_CLASSIFICATION: [
      checkboxes.c ? 'SUPERVISED_CLASSIFICATION' : '',
      ...addformData.map(item => item.permissions.c ? 'SUPERVISED_CLASSIFICATION' : '')
  ],
  RECODE_CLUMP_ELIMINATE: [
      checkboxes.d ? 'RECODE_CLUMP_ELIMINATE' : '',
      ...addformData.map(item => item.permissions.d ? 'RECODE_CLUMP_ELIMINATE' : '')
  ],
  ANALYSIS: [
      checkboxes.e ? 'ANALYSIS' : '',
      ...addformData.map(item => item.permissions.e ? 'ANALYSIS' : '')
  ],
  STATISTICS: [
      checkboxes.f ? 'STATISTICS' : '',
      ...addformData.map(item => item.permissions.f ? 'STATISTICS' : '')
  ]
};

//  const projectManagementData = {
      
//         PROJECT_ID: formData.ProjectId,
//         ADMIN_USER: formData.CREATED_BY, // Assuming this is where ADMIN_USER is stored
//         WORK_ASSIGN_USER: [
//           formData.CREATED_BY, // Include ADMIN_USER
//           ...addformData.map(item => item.uuname)
//         ],
//         STACKING: addformData.map(item => (item.permissions.a ? 'STACKING' : '')),
//         UNSUPERVISED_CLASSIFICATION: addformData.map(item => (item.permissions.b ? 'UNSUPERVISED_CLASSIFICATION' : '')),
//         SUPERVISED_CLASSIFICATION: addformData.map(item => (item.permissions.c ? 'SUPERVISED_CLASSIFICATION' : '')),
//         RECODE_CLUMP_ELIMINATE: addformData.map(item => (item.permissions.d ? 'RECODE_CLUMP_ELIMINATE' : '')),
//         ANALYSIS: addformData.map(item => (item.permissions.e ? 'ANALYSIS' : '')),
//         STATISTICS: addformData.map(item => (item.permissions.f ? 'STATISTICS' : '')),
//       };

// const projectManagementData = {
//   PROJECT_ID: formData.ProjectId,
//   ADMIN_USER: user,
//   WORK_ASSIGN_USER: addformData.map(item => item.uuname),
//   STACKING: addformData.map(item => (item.permissions.a ? 'STACKING' : '')),
//   UNSUPERVISED_CLASSIFICATION: addformData.map(item => (item.permissions.b ? 'UNSUPERVISED_CLASSIFICATION' : '')),
//   SUPERVISED_CLASSIFICATION: addformData.map(item => (item.permissions.c ? 'UPERVISED_CLASSIFICATION' : '')),
//   RECODE_CLUMP_ELIMINATE: addformData.map(item => (item.permissions.d ? 'RECODE_CLUMP_ELIMINATE' : '')),
//   ANALYSIS: addformData.map(item => (item.permissions.e ? 'ANALYSIS' : '')),
//   STATISTICS: addformData.map(item => (item.permissions.f ? 'STATISTICS' : '')),
// };
// // const projectManagementData = {
//   PROJECT_ID: formData.ProjectId,
//   ADMIN_USER: user,
//   STACKING: checkboxes.a ? 'STACKING' : '',
//   UNSUPERVISED_CLASSIFICATION: checkboxes.b ? 'unsupervised_info' : '',
//   SUPERVISED_CLASSIFICATION: checkboxes.c ? 'supervised_info' : '',
//   RECODE_CLUMP_ELIMINATE: checkboxes.d ? 'recode_info' : '',
//   ANALYSIS: checkboxes.e ? 'analysis_info' : '',
//   STATISTICS: checkboxes.f ? 'fgfdgtfhy' : '',
//   UU_USER: JSON.stringify(addformData.map(item => ({
//     newName: item.uuname,
//     permissions: item.permissions,
//   }))),
//    UU_USER: (addformData.map(item => ({
//     newName: item.uuname,
//     permissions: {
//       STACKING: item.permissions.a ? 'dfdgfdgfgfht' : '',
//       UNSUPERVISED_CLASSIFICATION: item.permissions.b ? 'unsupervised_info' : '',
//       SUPERVISED_CLASSIFICATION: item.permissions.c ? 'supervised_info' : '',
//       RECODE_CLUMP_ELIMINATE: item.permissions.d ? 'recode_info' : '',
//       ANALYSIS: item.permissions.e ? 'analysis_info' : '',
//       STATISTICS: item.permissions.f ? 'fgfdgtfhy' : ''
//     }
//   }))),
//   // UU_USER: addformData.map(item => ({
//   //   newName: item.uuname,
//   //   permissions: {
//   //     a: item.permissions.a,
//   //     b: item.permissions.b,
//   //     c: item.permissions.c,
//   //     d: item.permissions.d,
//   //     e: item.permissions.e,
//   //     f: item.permissions.f,
//   //   }
//   // })),
// };
// const projectManagementData = {
//   PROJECT_ID: formData.ProjectId,
//   ADMIN_USER: user,
//   UU_USER: addformData.map(item => item.uuname),
//   STACKING: addformData.map(item => item.permissions.a ? 'dfdgfdgfgfht' : ''),
//   UNSUPERVISED_CLASSIFICATION: addformData.map(item => item.permissions.b ? 'unsupervised_info1' : ''),
//   SUPERVISED_CLASSIFICATION: addformData.map(item => item.permissions.c ? 'supervised_info1' : ''),
//   RECODE_CLUMP_ELIMINATE: addformData.map(item => item.permissions.d ? 'recode_info1' : ''),
//   ANALYSIS: addformData.map(item => item.permissions.e ? 'analysis_info1' : ''),
//   STATISTICS: addformData.map(item => item.permissions.f ? 'fgfdgtfhy1' : '')
// };
try {
  await axios.post('http://127.0.0.1:8000/createproject/wcprojectmanagement/',projectManagementData,
     {
    
    headers: {
      'Content-Type': 'application/json',
    },
  });
  setReceivedProjectInfo(response.data);
} catch (error) {
  
  console.error('Error posting folder data:', error);
  
}
//////////////////////end of post request for folder name////
        // Reset the form after successful submission
        setFormData({
          projectClientOrganization: '',
          projectExecutedOrganization: '',
          ProjectId:newProjectId ,
          ProjectName: '',
          ProjectDescription: '',
          AreaInformation: '',
          croppingYear: '',
          croppingSeason: "",
          CREATED_BY: 'CREATED_BY',
        });
        setSelectedYearsList(initialSelectedYearsList);
        setOptionsOpen(initialOptionsOpen);
        resetStates();

      } catch (error) {
        console.error('Error:', error);
      }
      
      
      setSelectedYearsList(initialSelectedYearsList)
      setSelectedYears([]);
      // Update formData with the new ProjectId
      // setFormData((prevFormData) => ({
      //   ...prevFormData,
      //   projectId: newProjectId,
      // }));

      // Update formData with the new ProjectId
      // setFormData({
      //   projectClientOrganization: " ",
      //   projectExecutedOrganization: "",
      //   ProjectId: newProjectId,
      //   ProjectName: "",
      //   ProjectDescription: "",
      //   AreaInformation: "",
      // });
      setSelectedFolderName("");
      setDirectoryHandle("")
      setProjectInfoFolderName("")
      setCreateAoIFolder("")
      setAoiCheckbox("")
      setAoi("")
      setGtcheckbox("")
      setGt("")
      setCreateGTFolder("")
      setGismask("")
      setGismaskCheckbox("")
      setgismask("")
      setcreateSatellite("")
      setSatelliteCheckbox("")
      setSatellite("")
      setcreateWeather("")
      setWeatherCheckbox("")
      setWeather("")
      setcreateHistorical("")
      setHistoricalCheckbox("")
      setCheckboxes(false)
      setAddFormData([])
      setCheckedItems([false] )   
      // setSelectedYearsList(initialSelectedYearsList)
      // setOptionsOpen(initialOptionsOpen)
        setCheckedItems(initialCheckedItems);

      // try {
      //   await copyFileToAoiFolder();
      //   setMessage('AOI file uploaded successfully.');
      // } catch (error) {
      //   setMessage(error.message);
      //   return; 
      // }

      // Generate XML content
      const xmlContent = generateXMLContent();

      // Save XML content to a file
      await saveXMLToFile(xmlContent);

      // setMessage('Project information saved successfully.');
      handleSuccessModalClose();
      // projectId(projectId+1);
      setCurrentSection('projectInfo');
    } catch (error) {
      setLoading(false);
      console.error('Error saving project information:', error);
      setMessage('Error saving project information: ' + error.message);
      setLoading(false);
      Swal.fire({
        icon: 'Error',
        title: 'Check Your Input Field',
        text: 'Incorrect Input Field',
        confirmButtonText: 'OK'
      });
      
    }finally {
      setLoading(false);
    }
  };

  const generateXMLContent = () => {
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<ProjectInfo>\n`;

    const addElement = (name, value) => {
      return `<${name}>${value}</${name}>\n`;
    };

    xmlContent += addElement('ProjectId', projectId);
    xmlContent += addElement('ProjectName', formData.ProjectName);
    xmlContent += addElement('ProjectCreationDate', dateValue);
    xmlContent += addElement('ProjectDescription', formData.ProjectDescription);
    xmlContent += addElement('ProjectClientOrganization', formData.projectClientOrganization);
    xmlContent += addElement('ProjectExecutedOrganization', formData.projectExecutedOrganization);
    xmlContent += addElement('ProjectWorkspaceLocation', selectedFolderName);
    xmlContent += addElement('ProjectFolder', `${selectedFolderName}/${FormId}`);
    xmlContent += addElement('ProjectInformationFolder', `${selectedFolderName}/${FormId}/${FormId}_${projectInfoFolderName}`);
    xmlContent += addElement('AOI', aoiCheckbox);
    xmlContent += addElement('GroundTruth', gtcheckbox);
    xmlContent += addElement('SatelliteData', satelliteCheckbox);
    xmlContent += addElement('WeatherData', weatherCheckbox);
    xmlContent += addElement('HistoricalData', historicalCheckbox);

    // Add project participants data if needed
    addformData.forEach((participant) => {
      xmlContent += `<Participant name="${participant.name}" uuname="${participant.uuname}">\n`;
      Object.keys(participant.permissions).forEach(key => {
        xmlContent += `<${key}>${participant.permissions[key]}</${key}>\n`;
      });
      xmlContent += `</Participant>\n`;
    });

    xmlContent += `</ProjectInfo>`;
    return xmlContent;
  };

  const saveXMLToFile = async (xmlContent) => {
    if (!directoryHandle || !projectId) {
      throw new Error('Directory handle or Project ID is missing');
    }

    // Access the ProjectInfo folder within the project directory
    const projectDirectoryHandle = await directoryHandle.getDirectoryHandle(projectId);
    
    const ProjectInfo = `${formData.ProjectId}_ProjectInfo`;
      
    const projectInfoFolderHandle = await projectDirectoryHandle.getDirectoryHandle(ProjectInfo);

    // Create a file for the XML content
    const xmlFileHandle = await projectInfoFolderHandle.getFileHandle('project_info.xml', { create: true });
    const writable = await xmlFileHandle.createWritable();

    // Write the XML content to the file
    await writable.write(xmlContent);
    await writable.close();
  };
  //  /////////////////////////////////////////validation//////////////////////////////////////////////////
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;


    if (name === "ProjectName") {

      filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
    } else if (name === "AnotherField") {

      filteredValue = value.replace(/[^a-zA-Z@.!]/g, '');
    }
    setFormData({
      ...formData,
      [name]: filteredValue,
    });
    validateField(name, filteredValue);
  };
  /////validation///

  const [errors, setErrors] = useState({});
  const validateField = (name, value) => {
    let error = "";

    if (!value.trim()&& name !== "ProjectDescription") {
      error = "Field is required";
    } else {
      if (name === "ProjectName") {
        if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
          error = "Alphabet and Number required.";
        } else if (value.length < 5) {
          error = "Minimum 5 characters required.";
        }
      } else if (name === "projectClientOrganization") {
        if (value.length < 5) {
          error = "Minimum 5 characters required.";
        }
      } else if (name === "projectExecutedOrganization") {
        if (value.length < 5) {
          error = "Minimum 5 characters required.";
        }
      } else if (name === "ProjectDescription") {
        if (value.length < 5) {
          error = "Minimum 5 characters required.";
        }
      } else if (name === "AreaInformation") {
        if (value.length < 5) {
          error = "Minimum 5 characters required.";
        }
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

/////////////

  //   let error = "";
  //   if (!value.trim()) {
  //     error = "Field is required";
  //   } else if(name === "ProjectName") {
  //     if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
  //       error = "Alphabet and Number require.";
  //     }
  //      else if (value.length < 5){
  //       error = "Minimum 5 characters required.";
  //      }
  //     else if (name === "projectClientOrganization") {
  //       if (value.length < 5) {
  //         error = "Minimum 5 characters required.";
  //       }

  //     } else if (name === "projectExecutedOrganization") {
  //       if (!value.trim()) {
  //         error = "Project Executed Organization is required.";
  //       }

  //     } else if (name === "ProjectDescription") {
  //       if (value.length < 5) {
  //         error = "Project Description is required.";
  //       }
  //     } else if (name === "AreaInformation") {
  //       if (!value.trim()) {
  //         error = "Area Information is required.";
  //       }
  //       // else if (value.length < 5){
  //       //   error = "Minimum 5 characters required.";
  //       //  }
  //     }
  //   }
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: error,
  //   }));
  // };

  const [touched, setTouched] = useState({
    ProjectName: false,
    projectClientOrganization: false,
    projectExecutedOrganization: false,
    // Add other fields here
  });
  
  const handleInputFocus = (fieldName) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [fieldName]: true,
    }));
  };
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  const atLeastOneChecked = Object.values(checkboxes).some(Boolean);
  return (
    <>
      <div style={{ fontSize: "14px", textAlign: "center" }}>
        <div className="">
          <div class="d-flex  mx-5 justify-content-center align-items-center ">
            <div class="Agriform mt-5">
              <div className="row mx-auto AgriRow">
                <div className="col-lg-1 p-0">
                  <img
                    className="agrilogo "
                    src="agrilogonew.png"
                  ></img>
                </div>
                <div className="col-lg-3 fw-bold p-0 mt-4">
                  <p className="font-weight-bold Agri-Heading">
                    Agriculture-Create Project
                  </p>
                </div>
                <div
                  className="col-lg-8 AgriClose"
                // onClick={handleSuccessModalClose}
                >
                  <button className="border-0" onClick={handleClose}> X</button>

                </div>
              </div>
              <div className="">
                <div className="row mx-auto py-3">
                  <div className="col my-auto">
                    <button
                      className={`w-100 ${currentSection === "projectInfo"
                          ? "activeAgri"
                          : ""
                        }`}
                      onClick={() => handleButtonClick("projectInfo")}
                    >
                      Project Information
                    </button>
                  </div>
                  <div className="col my-auto">
                    <button
                      className={`w-100 ${currentSection === "projectInputs"
                          ? "activeAgri"
                          : ""
                        }`}
                      onClick={() =>
                        handleButtonClick("projectInputs")
                      }
                    >
                      Project Inputs
                    </button>
                  </div>
                  <div className="col my-auto">
                    <button
                      className={`w-100 ${currentSection === "projectManagement"
                          ? "activeAgri"
                          : ""
                        }`}
                      onClick={() =>
                        handleButtonClick("projectManagement")
                      }
                    >
                      Project Management{" "}
                    </button>
                  </div>
                </div>

                <div class="mx-3">
                  <form
                    className="mx-auto px-3 Project_info"
                    style={{
                      display:
                        currentSection === "" ? "block" : "none",
                      width: "1080px",
                      height: "525px",
                    }}
                  >
                    <div><p className="my-5">To proceed with the form, please click on the 'Pre-information' button.</p></div>
                  </form>
                  <form
                    className="mx-auto px-3 Project_info"
                    style={{
                      display:
                        currentSection === "projectInfo"
                          ? "block"
                          : "none",
                      width: "1080px",
                      height: "530px",
                    }}
                  >
                    <div className="Section_one m-3">
                      <div className="row mb-5">
                        <div className="col-lg-4 p-0 1">
                          <div className="row ">
                            <div className="col-lg-4 p-0 text-center">
                              {" "}
                              <label className="mt-0 pl-3">
                                {/* <span className="required-field">
                                            *
                                          </span> */}
                                Project ID:
                              </label>{" "}
                              {/* <p>{ projectId}</p> */}
                            </div>
                            <div className="col-lg-8 p-0 text-left">
                              {" "}
                              <input
                                name=" ProjectId"
                                // value={projectId}
                                value={formData.ProjectId}
                                className="border-0 w-50"
                                type="text"
                                read
                              />
                            </div>
                          </div>
                          {/* <label className='AgriLabel'><span className="required-field">*</span>Project ID:</label>   
                             <input className='w-50' type='text'/> */}
                        </div>
                        <div className="col-lg-8  2">
                          <div className="row ">
                            <div className="col-lg-6 p-0 mr-0 text-right">
                              {" "}
                              <label className="mt-0">
                                {/* <span className="required-field">
                                            *
                                          </span> */}
                                Project Creation Date and Time :
                              </label>{" "}
                            </div>
                            <div className="col-lg-3 p-0 ">
                              {" "}
                              <input
                                className="border-0 w-75 p-0 m-0"
                                type="date"
                                value={dateValue}
                                onChange={(e) =>
                                  setDateValue(e.target.value)
                                }
                                readOnly
                              />
                            </div>
                            <div className="col-lg-3 p-0 ">
                              {" "}
                              <input
                                className="w-75 border-0 p-0 m-0"
                                type="text"
                                value={currentTime}
                                readOnly
                              />
                            </div>
                          </div>

                          {/* <input className='w-75 border-0' type="text" value={currentTime} readOnly /> */}
                          {/* <label className='AgriLabel'><span className="required-field">*</span>Project Creation Date:</label>  
                            <input className='w-50' type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)}/>   */}
                        </div>
                        {/* <div className='col-lg-2  3'> */}
                        {/* <label className='AgriLabel'><span className="required-field">*</span>Project creation Time:</label>  
                            <input className='w-50' type="time" value={timeValue} onChange={(e) => setTimeValue(e.target.value)}/>  */}
                        {/* <div className='row '>
                                      <div className='col-lg-6 pr-0 mr-0 '>  <label className=''><span className="required-field">*</span>Project Creation Time:</label>  </div>
                                      <div className='col-lg-6 pr-0 mr-0 '>  <input className='w-75 border-0' type="text" value={currentTime} readOnly /></div>
                                    </div> */}
                        {/* </div> */}
                      </div>
                    </div>
                    <div className="Section_Two m-3">
                      <div className="row my-4">
                        <div className="col-lg-6">
                          <div className="row">
                            <div className="col-lg-3 ">
                              <label className="mt-0">
                                {" "}
                                <span className="required-field">
                                  *
                                </span>
                                Project Name:
                              </label>
                            </div>
                            <div className="col-lg-9 pl-0 text-left ">
                              {" "}
                              {errors.ProjectName && (
                                <span
                                  className="error-message mt-0"
                                  style={{ position: "absolute", top: "-71%" }}
                                >
                                  {errors.ProjectName}
                                </span>
                              )}
                              <span
                                className="max-length-error ml-2"
                                style={{ position: "absolute", top: "-90%" }}
                              >
                                {!errors.ProjectName &&
                                  formData.ProjectName.length >=
                                  projectNameMaxLength && (
                                    <MaxLengthErrorMessage
                                      isVisible={true}
                                      InputFields={projectNameMaxLength}
                                    />
                                  )}

                              </span>
                              <input
                                minLength={5}
                                maxLength={50}
                                name="ProjectName"
                                onChange={handleInputChange}
                                value={formData.ProjectName}
                                onBlur={handleInputBlur}
                                onFocus={() => handleInputFocus("ProjectName")}
                                className={` w-75  ${touched.ProjectName && errors.ProjectName ? 'border border-danger' : 'border border-light'}`}
                                // className="w-75 border-0"
                                // style={{ border: touched.ProjectName && errors.ProjectName ? '1px solid red' : '1px solid #ced4da' }}
                                type="text"
                              />
                            </div>
                          </div>
                          {/* <label> <span className="required-field">*</span>Project Name:</label>
                        <input className='w-50' type='text'/> */}
                        </div>
                        <div className="col-lg-6">
                          <div className="row">
                            <div className="col-lg-5 mr-0 pr-0">
                              <label className="mt-0">
                                {" "}
                                {/* <span className="required-field">
                                            *
                                          </span> */}
                                Project Creation By (AU):
                              </label >
                            </div>
                            <div className="col-lg-7 ml-0 pl-0">
                              {" "}
                              <input

                                name="user"
                                value={user}
                                className="w-100 border-0"
                                type="text"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    <div className="Section_Three m-3 text-left">
                      <label className="pb-2 pl-2">Project Description</label>
                      {errors.ProjectDescription && (
                        <span className="error-message mt-0" >
                          {errors.ProjectDescription}
                        </span>
                      )}
                      <span className="max-length-error ml-2" >
                        {!errors.ProjectDescription && formData.ProjectDescription.length >= projectDescriptionMaxLength && (
                          <MaxLengthErrorMessage
                            isVisible={true}
                            InputFields={projectDescriptionMaxLength}
                          />
                        )}
                      </span>
                      <textarea
                        minLength={5}
                        maxLength={200}
                        name="ProjectDescription"
                        value={formData.ProjectDescription}
                        onChange={handleInputChange}
                        class="w-100 border-0 h-50 scrollable-input border-0  px-1"
                        id="exampleFormControlTextarea1"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="Section_Four m-3">
                      <div className="row mb-5 mt-5">
                        <div className="col-lg-3 mr-0 pr-0 text-left">
                          <label className="mt-0">
                            <span className="required-field">*</span>
                            Project Client Organization:
                          </label>
                        </div>
                        <div className="col-lg-8 m1-0 pl-0 text-left">

                          {errors.projectClientOrganization && (
                            <span
                              className="error-message mt-0"
                              style={{ position: "absolute", top: "-75%" }}
                            >
                              {errors.projectClientOrganization}
                            </span>
                          )}
                          <span
                            className="max-length-error ml-2"
                            style={{ position: "absolute", top: "-88%" }}
                          >
                            {
                              formData.projectClientOrganization.length >= projectClientOrganizationM && (
                                <MaxLengthErrorMessage
                                  isVisible={true}
                                  InputFields={projectClientOrganizationM}
                                />
                              )}
                          </span>
                          <input
                            minLength={5}
                            maxLength={50}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus("projectClientOrganization")}
                            onBlur={handleInputBlur}
                            name="projectClientOrganization"
                            value={formData.projectClientOrganization}
                            className={` w-75  ${touched.ProjectName && errors.projectClientOrganization ? 'border border-danger' : 'border border-light'}`}

                            // className="w-50 border-0"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="Section_Five m-3">
                      <div className="row mb-5">
                        <div className="col-lg-3 mr-0 pr-0 text-left">
                          <label className="mt-0">
                            <span className="required-field">*</span>
                            Project Executed Organization:
                          </label>
                        </div>
                        <div className="col-lg-8 m1-0 pl-0 text-left">
                          {" "}

                          {errors.projectExecutedOrganization && (
                            <span
                              className="error-message mt-0"
                              style={{ position: "absolute", top: "-75%" }}
                            >
                              {errors.projectExecutedOrganization}
                            </span>
                          )}
                          <span
                            className="max-length-error ml-2"
                            style={{ position: "absolute", top: "-85%" }}
                          >
                            {!errors.projectExecutedOrganization &&
                              formData.projectExecutedOrganization.length >= projectExecutedMaxLength && (
                                <MaxLengthErrorMessage
                                  isVisible={true}
                                  InputFields={projectExecutedMaxLength}
                                />
                              )}
                          </span>
                          <input
                            minLength={5}
                            maxLength={50}
                            onChange={handleInputChange}
                            name="projectExecutedOrganization"
                            value={formData.projectExecutedOrganization}
                            onBlur={handleInputBlur}
                            onFocus={() => handleInputFocus("projectExecutedOrganization")}
                            className={` w-75  ${touched.projectExecutedOrganization && errors.projectExecutedOrganization ? 'border border-danger' : 'border border-light'}`}

                            // className="w-50 border-0"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="Section_Six m-3">
                      <div className="row mb-4">
                        <div className="col-lg-3 mr-0 pr-0 text-left">
                          <label className="mt-0">
                            {/* <span className="required-field">*</span> */}
                            Cropping year:
                          </label>
                        </div>
                        <div className="col-lg-8 m1-0 pl-0 text-left ">
                          {" "}
                          {/* <select
                                      className="w-50 border-0"
                                      id="yearRange"
                                    >
                                      {options}
                                    </select> */}
                          <div className="YearDropdownWithCheckbox" ref={dropdownRef}>
                            <div className={`dropdown ${isOpen ? 'open' : ''}`}  >
                              <button type="button" className="dropdown-toggle w-50 border-0" onClick={handleDropdownClick}>
                              {getButtonText()}
                                {/* {selectedYears.length > 0 ? selectedYears.join(', ') : 'Select a Cropping Years'} */}
                              </button>
                              <div className="dropdown-menu" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map((year) => (
                                  <div key={year} className="dropdown-item">
                                    <input

                                      type="checkbox"
                                      id={`year-${year}`}
                                      value={year}
                                      checked={selectedYears.includes(year)}
                                      onChange={() => handleYearCheckboxChange(year)}
                                      onClick={preventCheckboxClickDefault}
                                    />
                                    <label htmlFor={`year-${year}`}>
                                      {currentYear === year ? '(Current Year) ' : ''}
                                      {`June ${year} - May ${year + 1}`}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Seven m-3">
                      <div className="row mb-4">
                        <div className="col-lg-3 mr-0 pr-0 text-left">
                          <label className="mt-0">
                            {/* <span className="required-field">*</span> */}
                            Cropping season:
                          </label>
                        </div>
                        <div className="col-lg-8 m1-0 pl-0 text-left">
                          <div className="row">
                            <div className="col">
                              <input
                                checked={checkedItems.Kharif}
                                onChange={handleChange}
                                className="mr-2"
                                type="checkbox"
                                id="Kharif"
                                name="Kharif"
                                value="Bike"
                              />
                              <label className="mr-3" for="Kharif">
                                {" "}
                                Kharif
                              </label>
                            </div>
                            <div className="col">
                              <input
                                checked={checkedItems.Rabi}
                                onChange={handleChange}
                                className="mr-2"
                                type="checkbox"
                                id="Rabi"
                                name="Rabi"
                                value="Car"
                              />
                              <label className="mr-3" for="Rabi">
                                {" "}
                                Rabi
                              </label>
                            </div>
                            <div className="col">
                              <input
                                checked={checkedItems.Summer}
                                onChange={handleChange}
                                className="mr-2"
                                type="checkbox"
                                id="Summer"
                                name="Summer"
                                value="Boat"
                              />
                              <label className="mr-3" for="Summer">
                                {" "}
                                Summer
                              </label>
                            </div>
                            <div className="col">
                              <input
                                checked={checkedItems.All}
                                onChange={handleChange}
                                className="mr-2"
                                type="checkbox"
                                id="All"
                                name="All"
                                value="Boats"

                              />
                              <label className="mr-3" for="All">
                                {" "}
                                All
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Eight m-3">
                      <div className="row ">
                        <div className="col-lg-3 text-left">
                          <label>Area Information:</label>
                        </div>
                        <div className="col-lg-9 pl-0 text-left">
                          {" "}
                          {/* {errors.AreaInformation && (
                                <span
                                  className="error-message mt-0"
                                  style={{ position: "absolute", top: "-16%" }}
                                >
                                  {errors.AreaInformation}
                                </span>
                              )} */}
                          <span
                            className="max-length-error ml-2"
                            style={{ position: "absolute", top: "-20%" }}
                          >
                            {!errors.AreaInformation &&
                              formData.AreaInformation.length >
                              projectAreaInformation && (
                                <MaxLengthErrorMessage
                                  isVisible={true}
                                  InputFields={projectAreaInformation}
                                />
                              )}
                            {/* <MaxLengthErrorMessage
                    isVisible={formData.ProjectName.length > projectNameMaxLength}
                    InputFields={projectNameMaxLength}
                /> */}
                          </span>
                          <textarea
                            onChange={handleInputChange}
                            name="AreaInformation"
                            value={formData.AreaInformation}
                            className="w-100 scrollable-input border-0"
                            id="exampleFormControlTextarea1"
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </form>
                  <form
                    className="mx-auto px-3 Project_info"
                    style={{
                      display:
                        currentSection === "projectInputs"
                          ? "block"
                          : "none",
                      width: "1080px",
                      height: "530px",
                    }}
                  >
                    <div className="Section_one m-3">
                      <div className="row mt-4">
                        <div className="col-lg-3 p-0 m-0 pl-3">
                          <label className="AgriLabel  w-100 text-left">
                            <span className="required-field">*</span>
                            Project Workspace Location
                          </label>
                          {/* <input className='w-50' type='text'/> */}
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          {/* <div className='row '>
                                <div className='col-lg-6 p-0 mr-0'>  <label className=''><span className="required-field">*</span>Project Creation Date:</label>  </div>
                                <div className='col-lg-6 p-0 '>  <input className='border-0'  type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)}/></div>
                            </div> */}
                          {/* <label className='AgriLabel'><span className="required-field">*</span>Project Creation Date:</label>   */}
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={selectedFolderName}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button onClick={selectDirectory} className=" w-100" >

                            Select folder
                          </button>
                          {/* <label className='AgriLabel'><span className="required-field">*</span>Project creation Time:</label>  
                            <input className='w-50' type="time" value={timeValue} onChange={(e) => setTimeValue(e.target.value)}/>  */}
                          {/* <div className='row '>
                                <div className='col-lg-6 pr-0 mr-0 '>  <label className=''><span className="required-field">*</span>Project Creation Time:</label>  </div>
                                <div className='col-lg-6 pr-0 mr-0 '>  <input className='w-75 border-0' type="text" value={currentTime} readOnly/></div>
                            </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="Section_Two m-3 ">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 pl-3">
                          <label className="AgriLabel  w-100 text-left ">
                            <span className="required-field">*</span>
                            Project Folder
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            disabled={!selectedFolderName}
                            className="w-100  border-0"
                            type="text"
                            value={
                              selectedFolderName
                                ? `${selectedFolderName} / ${FormId}`
                                : ""
                            }
                          // value={`${selectedFolderName }/${FormId}`}
                          // value={message} 
                          />
                        </div>
                        <div className="col-lg-2  3"></div>
                      </div>
                    </div>
                    <div className="Section_Three m-3 ">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 pl-3">
                          <label className="AgriLabel  w-100 text-left">
                            <span className="required-field">*</span>
                            Project Information
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            disabled={!selectedFolderName}
                            //  value={`${selectedFolderName} / ${FormId}/${FormId}_${projectInfoFolderName}`}
                            value={
                              selectedFolderName
                                ? `${selectedFolderName} / ${FormId}/${FormId}_${projectInfoFolderName}`
                                : ""
                            }
                            // value={projectInfoFolderName}
                            className="w-100  border-0"
                            type="text"
                          />
                        </div>
                        <div className="col-lg-2  3"></div>
                      </div>
                    </div>
                    <div className="text-left my-5">
                      <strong className="text-xl">
                        GIS Inputs Folders
                      </strong>
                    </div>
                    <div className="Section_Four m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input
                            className="mx-4"
                            checked={createAoIFolder}
                            onChange={handleCheckboxChangeFolder}
                            type="checkbox" id="createAoIFolder"
                            disabled={!selectedFolderName}
                          />
                          <label className="mr-3" htmlFor="createAoIFolder">
                            {" "}
                            Area of intrest AOI
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={aoiCheckbox}
                            disabled={!createAoIFolder}
                            maxLength={200}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createAoIFolder} onClick={handleUploadAoi} className=" w-100">
                            Select AOI
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Five m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input
                            className="mx-4"
                            type="checkbox"
                            id="createGTFolder"
                            checked={createGTFolder}
                            onChange={handleGTFolderCheckboxChange}
                            disabled={!selectedFolderName}
                          />
                          <label className="mr-3" htmlFor="createGTFolder">
                            GT (Ground Truth)
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100 border-0"
                            type="text"
                            value={gtcheckbox}
                            disabled={!createGTFolder}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createGTFolder} onClick={handleUploadGT} className=" w-100">UPLOAD</button>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Six m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input
                            type="checkbox"
                            className="mx-4"
                            id="createGismask"
                            checked={createGismask}
                            onChange={handleGISmaskFolderCheckboxChange}
                            disabled={!selectedFolderName}
                          />
                          <label className="mr-3" htmlFor="createGismask">
                            GIS Mask Or Basemap
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={gismaskCheckbox}
                            disabled={!createGismask}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createGismask} onClick={handleUploadGISMASK} className=" w-100">UPLOAD</button>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Seven m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input
                            type="checkbox"
                            className="mx-4"
                            id="createsatellite"
                            checked={createsatellite}
                            onChange={handleSatelliteFolderCheckboxChange}
                            disabled={!selectedFolderName}
                          />
                          <label className="mr-3" HtmlFor="createsatellite">
                            <span className="required-field">*</span>
                            Satellite Data
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={satelliteCheckbox}
                            disabled={!createsatellite}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createsatellite} onClick={handleUploadSatellite} className=" w-100">UPLOAD</button>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Nine m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input

                            type="checkbox"
                            className="mx-4"
                            id="createweather"
                            checked={createweather}
                            onChange={handleWeatherFolderCheckboxChange}
                            disabled={!selectedFolderName}
                          />
                          <label className="mr-3" for="vehicle1">
                            Weather Data
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={weatherCheckbox}
                            disabled={!createweather}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createweather} onClick={handleUploadWeather} className=" w-100">UPLOAD</button>
                        </div>
                      </div>
                    </div>
                    <div className="Section_Eight m-3">
                      <div className="row">
                        <div className="col-lg-3 p-0 m-0 1 text-left">
                          <input
                            type="checkbox"
                            className="mx-4"
                            id="createhistorical"
                            checked={createhistorical}
                            onChange={handleHistoricalFolderCheckboxChange}
                            disabled={!selectedFolderName}

                          />
                          <label className="mr-3" for="createhistorical">
                            Historical Data
                          </label>
                        </div>
                        <div className="col-lg-7 p-0 m-0 2">
                          <input
                            className="w-100  border-0"
                            type="text"
                            value={historicalCheckbox}
                            disabled={!createhistorical}
                          />
                        </div>
                        <div className="col-lg-2  3">
                          <button disabled={!createhistorical} onClick={handleUploadHistoricalData} className=" w-100">UPLOAD</button>
                        </div>
                      </div>
                    </div>
                  </form>
                  <form
                    className="mx-auto px-3 Project_info"
                    style={{
                      display:
                        currentSection === "projectManagement"
                          ? "block"
                          : "none",
                      width: "1080px",
                      height: "530px",
                    }}
                  >
                    <div className="Section_one m-3">
                      <div className="row mx-3">
                        <div className="col-lg-3 p-0 1 text-left">
                          <p className="mt-4"><strong>Assign Tasks To users</strong></p>

                        </div>
                        <div className="col-lg-1 p-0 text-left">
                          <button className="py-3">Stacking</button>

                        </div>
                        <div className="col-lg-2  text-left">
                          <button>Unsupervised Classification</button>

                        </div>
                        <div className="col-lg-2  text-left">
                          <button>Supervised Classification</button>

                        </div>
                        <div className="col-lg-2  text-left">
                          <button>Recode, clump, Eliminate</button>

                        </div>
                        <div className="col-lg-1  text-left">
                          <button className="py-3">Analysis</button>
                        </div>
                        <div className="col-lg-1  text-left">
                          <button className="py-3">Stastistics</button>
                        </div>


                      </div>
                    </div>
                    <div className="Section_TwoMAnagement m-3">
                      <div className="row mx-3">
                        
                        <div className="col-lg-1 p-0 mt-0 1 text-left">
                          <p className="mt-4"> <span className="required-field">
                            *
                          </span><strong>Admin&nbsp;User</strong></p>

                        </div>
                        <div className="col-lg-2 p-0 1 mt-4">
                          <input className="w-75 border-0" type="text" name="user"
                            value={user} />

                        </div>
                        <div className="col-lg-1 p-0 text-center">
                          <input type="checkbox" className="mt-4" id="a" checked={checkboxes.a} onClick={handleCheckboxManagement} />

                        </div>
                        <div className="col-lg-2  text-center">
                          <input type="checkbox" className="mt-4" id="b" checked={checkboxes.b} onClick={handleCheckboxManagement} />

                        </div>
                        <div className="col-lg-2  text-center">
                          <input type="checkbox" className="mt-4" id="c" checked={checkboxes.c} onClick={handleCheckboxManagement} />

                        </div>
                        <div className="col-lg-2  text-center">
                          <input type="checkbox" className="mt-4" id="d" checked={checkboxes.d} onClick={handleCheckboxManagement} />

                        </div>
                        <div className="col-lg-1  text-center">
                          <input type="checkbox" className="mt-4" id="e" checked={checkboxes.e} onClick={handleCheckboxManagement} />
                        </div>
                        <div className="col-lg-1  text-center">
                          <input type="checkbox" className="mt-4" id="f" checked={checkboxes.f} onClick={handleCheckboxManagement} />
                        </div>


                      </div>
                    </div>
                    <div className="Section_ThreeManagement m-3 text-left px-3">
                      <label className=""><stron>Assign Authorized User (UU) for Task</stron></label>
                      <div
                        class="Asign_Autherise  border-0"
                        id="exampleFormControlTextarea1"
                        rows="3"

                      // dangerouslySetInnerHTML={{ __html: content }}
                      >
                        {addformData.map((item, index) => (
                          <div className="Section_TwoMAnagement m-3" key={index}>
                            <div className="row mx-3">
                              <div className="col-lg-1 p-0 mt-0 1 text-left">
                                <p className="mt-4"><strong>{item.name}</strong></p>

                              </div>
                              <div className="col-lg-2 p-0 1 mt-1"><label></label>
                                <input className="w-75 border-0" type="text" value={addformData[index].uuname}
                                  onChange={(e) => handleNameChange(index, e)} />

                              </div>
                              <div className="col-lg-1 p-0 text-center">
                                <input type="checkbox" className="mt-4" id={`a-${index}`} checked={item.permissions.a} onChange={() => handleCheckboxChang(index, 'a')} />

                              </div>
                              <div className="col-lg-2  text-center">
                                <input type="checkbox" className="mt-4" id={`b-${index}`} checked={item.permissions.b} onChange={() => handleCheckboxChang(index, 'b')} />

                              </div>
                              <div className="col-lg-2  text-center">
                                <input type="checkbox" className="mt-4" id={`c-${index}`} checked={item.permissions.c} onChange={() => handleCheckboxChang(index, 'c')} />

                              </div>
                              <div className="col-lg-2  text-center">
                                <input type="checkbox" className="mt-4" id={`d-${index}`} checked={item.permissions.d} onChange={() => handleCheckboxChang(index, 'd')} />

                              </div>
                              <div className="col-lg-1  text-center">
                                <input type="checkbox" className="mt-4" id={`e-${index}`} checked={item.permissions.e} onChange={() => handleCheckboxChang(index, 'e')} />
                              </div>
                              <div className="col-lg-1  text-center">
                                <input type="checkbox" className="mt-4" id={`f-${index}`} checked={item.permissions.f} onChange={() => handleCheckboxChang(index, 'f')} />
                              </div>


                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="row  d-flex justify-content-space-evenly my-4 mx-auto">
                        <div className="col"><button onClick={handleAddButtonClick} id="addButton" className="btn rounded AgriNext p-0 px-3">Add</button></div>
                        <div className="col-lg-1"><button onClick={handleClearButtonClick} disabled={addformData.length < 1} className="btn rounded AgriCancel p-0 px-3">Clear</button></div>
                      </div>
                    </div>

                  </form>
                </div>
                <div className="d-flex justify-content-end align-item-end">
                  <div className="row py-3 mx-2">
                    {currentSection === "projectInfo" && (
                      <>
                        <div className="col-lg-3 align-self-start AgriBack">
                          <button
                            className="AgriNext"
                            onClick={handleBackButtonClick}
                          >
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleLeft} />
                            Back
                          </button>
                        </div>
                        <div className="col">
                          <button
                            className="AgriCancel"
                            onClick={handleClose}
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="col">
                          <button
                            disabled={!isFormValid()}
                            className="AgriNext"
                            // onClick={ handleNextButtoninfo}
                            onClick={handleNextButtonClick}
                          >
                            Next
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleRight} />
                          </button>
                        </div>
                      </>
                    )}
                    {currentSection === "projectInputs" && (
                      <>
                        <div className="col-lg-3 align-self-start AgriBack">
                          <button
                            className="AgriNext"
                            onClick={handleBackButtonClick}
                          >
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleLeft} />
                            Back
                          </button>
                        </div>
                        <div className="col">
                          <button
                            className="AgriCancel"
                            onClick={handleClose}
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="col">
                          <button
                            className="AgriNext"
                            onClick={handleNextButtonClick}
                            disabled={isNextButtonDisabled}
                          >
                            Next
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleRight} />
                          </button>
                        </div>
                      </>
                    )}
                    {currentSection === "projectManagement" && (
                      <>
                        <div className="col-lg-3 align-self-start AgriBack">
                          <button
                            className="AgriNext"
                            onClick={handleBackButtonClick}
                          >
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleLeft} />
                            Back
                          </button>
                        </div>
                        <div className="col">
                          <button
                            className="AgriCancel"
                            onClick={handleClose}
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="col">
                          <button
                            onClick={handleSubmitButtonClick}
                            disabled={!atLeastOneChecked}
                            className="AgriNext">
                            create&nbsp;Project
                          </button>
                        </div>
                      </>
                    )}

                    {currentSection === "" && (
                      <>
                        <div className="col">
                          <button
                            className="AgriCancel"
                            onClick={handleClose}
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="col">
                          <button
                            className="AgriNext"
                            onClick={handleNextButtonClick}
                          >
                            Next
                            <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleRight} />
                          </button>
                        </div>
                      </>
                    )}
                    {/* modal open */}
                    <Modal
                      isOpen={showSuccessModal}
                      onRequestClose={handleSuccessModalClose}
                      contentLabel="Confirmation Modal"
                      style={{
                        overlay: {
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          zIndex: 1000,
                        },
                        content: {
                          position: "absolute",
                          top: "40px",
                          left: "130px",
                          width: "100%", // Full width
                          height: "100%", // Full height
                          margin: 0,
                          display: "flex",
                          justifyContent: "center", // Center horizontally
                          alignItems: "center", // Center vertically
                          border: "none",
                          borderRadius: 0,
                          background: "none",
                          padding: 0,
                          outline: "none",
                          overflow: "auto",
                        },
                        //
                      }}
                    >
                      <Preloader loading={loading} progress={progress} />
                      <div style={{ fontSize: "14px", textAlign: "center" }}>
                        <div className="">
                          <div class="d-flex  mx-5 justify-content-center align-items-center my-5">
                            <div class="Agriform " >
                              <div className="row mx-auto AgriRow" style={{ backgroundColor: "gray" }}>
                                <div className="col-lg-1 p-0">
                                  <img
                                    className="agrilogo "
                                    src="agrilogonew.png"
                                  ></img>
                                </div>
                                <div className="col-lg-4 fw-bold p-0 mt-4 text-left">
                                  <p className="font-weight-bold Agri-Heading" style={{ color: "white", fontSize: "18px" }}>
                                    Agriculture
                                  </p>
                                </div>
                                <div
                                  className="col-lg-7 fw-bold text-left d-flex align-items-center"
                                  style={{ color: "#7cfc0091", fontSize: "15px" }}
                                // onClick={handleSuccessModalClose}
                                >
                                  <strong> Create Project Information</strong>

                                  {/* <button className="border-0"  onClick={handleSuccessModalClose}> X</button> */}

                                </div>
                              </div>
                              <div className="">
                                {/* <div className="row mx-auto py-3">
                            <div className="col my-auto">
                              <button
                                className={`w-100 ${
                                  currentSection === "projectInfo"
                                    ? "activeAgri"
                                    : ""
                                }`}
                                onClick={() => handleButtonClick("projectInfo")}
                              >
                                Project Information
                              </button>
                            </div>
                            <div className="col my-auto">
                              <button
                                className={`w-100 ${
                                  currentSection === "projectInputs"
                                    ? "activeAgri"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("projectInputs")
                                }
                              >
                                Project Inputs
                              </button>
                            </div>
                            <div className="col my-auto">
                              <button
                                className={`w-100 ${
                                  currentSection === "projectManagement"
                                    ? "activeAgri"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleButtonClick("projectManagement")
                                }
                              >
                                Project Management{" "}
                              </button>
                            </div>
                          </div> */}

                                <div class="mx-3">



                                  <form
                                    className="mx-auto px-3 "
                                    style={{

                                      width: "1080px",
                                      height: "600px",
                                      overflowY: "scroll"
                                    }}
                                  >
                                    <div className="Section_one">

                                      <p className='text-left mt-4 mb-1'><strong>Project Information</strong></p>
                                      <hr className='Agrihr mb-1' ></hr>
                                    </div>
                                    <div className="Section_Two ">
                                      <div className="row mx-3 text-left mt-0 p-0">
                                        <div className="col-lg-3 p-0 mt-0  ">
                                          <label className=' p-0 mt-0 font-weight-bold'>Project Id</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{projectId}</p>

                                        </div>



                                      </div>
                                    </div>

                                    <div className="Section_Three ">
                                      <div className="row mx-3 text-left mt-0 p-0">
                                        <div className="col-lg-3 p-0 mt-0 1 ">
                                          <label className=' p-0 mt-0 font-weight-bold '>Project Name</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{formData.ProjectName}</p>

                                        </div>



                                      </div>
                                    </div>

                                    <div className="Section_Four ">
                                      <div className="row mx-3 text-left mt-0 p-0">
                                        <div className="col-lg-3 p-0 mt-0 1 ">
                                          <label className=' p-0 mt-0 font-weight-bold'>Project creation date</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{dateValue}</p>

                                        </div>



                                      </div>
                                    </div>

                                    <div className="Section_five ">
                                      <div className="row mx-3 text-left mt-0 p-0">
                                        <div className="col-lg-3 p-0 mt-0 1 ">
                                          <label className=' p-0 mt-0 font-weight-bold'>Project Discription</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{formData.ProjectDescription}</p>

                                        </div>



                                      </div>
                                    </div>

                                    <div className="Section_six ">
                                      <div className="row mx-3 text-left mt-0 p-0">
                                        <div className="col-lg-3 p-0 mt-0 1 ">
                                          <label className=' p-0 mt-0 font-weight-bold'>Project client Organization</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{formData.projectClientOrganization}</p>

                                        </div>



                                      </div>
                                    </div>
                                    <div className="Section_ seven ">
                                      <div className="row mx-3 text-left  p-0">
                                        <div className="col-lg-3 p-0 mt-0 1 ">
                                          <label className=' p-0 mt-0 font-weight-bold'>Project executed organization</label>

                                        </div>
                                        <div className="col-lg-9 p-0  mt-0  " >
                                          <p>{formData.projectExecutedOrganization}</p>

                                        </div>



                                      </div>
                                    </div>
                                    <p className='text-left mt-4 mb-1'><strong>Input data folder</strong></p>
                                    <hr className='Agrihr mb-1' ></hr>
                                    <div className='folder-section'>

                                      <div className="Section_Two ">
                                        <div className="row mx-3 text-left mt-0 p-0">
                                          <div className="col-lg-3 p-0 mt-0  ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Project Workspace Location</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{selectedFolderName}</p>

                                          </div>



                                        </div>
                                      </div>

                                      <div className="Section_Three ">
                                        <div className="row mx-3 text-left mt-0 p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Project Folder</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{selectedFolderName
                                              ? `${selectedFolderName} / ${FormId}`
                                              : ""}</p>

                                          </div>



                                        </div>
                                      </div>

                                      <div className="Section_Four ">
                                        <div className="row mx-3 text-left mt-0 p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Project Information</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{selectedFolderName
                                              ? `${selectedFolderName} / ${FormId}/${FormId}_${projectInfoFolderName}`
                                              : ""}</p>

                                          </div>



                                        </div>
                                      </div>

                                      <div className="Section_five ">
                                        <div className="row mx-3 text-left mt-0 p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Area Of intrest AOI</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{aoiCheckbox}</p>

                                          </div>



                                        </div>
                                      </div>

                                      <div className="Section_six ">
                                        <div className="row mx-3 text-left mt-0 p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>GT (Ground Truth)</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{gtcheckbox}</p>

                                          </div>



                                        </div>
                                      </div>
                                      <div className="Section_ seven ">
                                        <div className="row mx-3 text-left  p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Satellite Data</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{satelliteCheckbox}</p>

                                          </div>



                                        </div>
                                      </div>
                                      <div className="Section_Eight ">
                                        <div className="row mx-3 text-left  p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Weather Data</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{weatherCheckbox}</p>

                                          </div>



                                        </div>
                                      </div>
                                      <div className="Section_Nine ">
                                        <div className="row mx-3 text-left  p-0">
                                          <div className="col-lg-3 p-0 mt-0 1 ">
                                            <label className=' p-0 mt-0 font-weight-bold'>Historical Data</label>

                                          </div>
                                          <div className="col-lg-9 p-0  mt-0  " >
                                            <p>{historicalCheckbox}</p>

                                          </div>



                                        </div>
                                      </div>
                                    </div>
                                    <div className='ProjectManagementsection'>
                                      <p className='text-left mt-4 mb-1'><strong>Project Participate</strong></p>
                                      <hr className='Agrihr mb-1' ></hr>

                                      <div className="Section_one ">
                                        <div className="row mx-3">
                                          <div className="col-lg-3 p-0 1 text-left">
                                            <p className="mt-4"><strong>Assign Tasks To users</strong></p>

                                          </div>
                                          <div className="col-lg-1 p-0 text-left">
                                            <button className="py-3">Stacking</button>

                                          </div>
                                          <div className="col-lg-2  text-left">
                                            <button>Unsupervised Classification</button>

                                          </div>
                                          <div className="col-lg-2  text-left">
                                            <button>Supervised Classification</button>

                                          </div>
                                          <div className="col-lg-2  text-left">
                                            <button>Recode, clump, Eliminate</button>

                                          </div>
                                          <div className="col-lg-1  text-left">
                                            <button className="py-3">Analysis</button>
                                          </div>
                                          <div className="col-lg-1  text-left">
                                            <button className="py-3">Stastistics</button>
                                          </div>


                                        </div>
                                      </div>
                                      <div className="Section_TwoMAnagement m-3">
                                        <div className="row mx-3">
                                          <div className="col-lg-1 p-0 mt-0 1 text-left">
                                            <p className="mt-4"><strong>Admin User</strong></p>

                                          </div>
                                          <div className="col-lg-2 p-0 1 mt-4">
                                            <input className="w-75 border-0" type="text" name="user"
                                              value={user} />

                                          </div>
                                          <div className="col-lg-1 p-0 text-center">
                                            <input type="checkbox" className="mt-4" id="a" checked={checkboxes.a !== ''} onClick={handleCheckboxManagement} />

                                          </div>
                                          <div className="col-lg-2  text-center">
                                            <input type="checkbox" className="mt-4" id="b" checked={checkboxes.b !== ''} onClick={handleCheckboxManagement} />

                                          </div>
                                          <div className="col-lg-2  text-center">
                                            <input type="checkbox" className="mt-4" id="c" checked={checkboxes.c} onClick={handleCheckboxManagement} />

                                          </div>
                                          <div className="col-lg-2  text-center">
                                            <input type="checkbox" className="mt-4" id="d" checked={checkboxes.d !== ''} onClick={handleCheckboxManagement} />

                                          </div>
                                          <div className="col-lg-1  text-center">
                                            <input type="checkbox" className="mt-4" id="e" checked={checkboxes.e !== ''} onClick={handleCheckboxManagement} />
                                          </div>
                                          <div className="col-lg-1  text-center">
                                            <input type="checkbox" className="mt-4" id="f"checked={checkboxes.f !== ''} onClick={handleCheckboxManagement} />
                                          </div>


                                        </div>

                                      </div>
                                      <div className="Section_ m-3 text-left ">

                                        <div
                                          class="Asign_Autherise  border-0"
                                          id="exampleFormControlTextarea1"
                                          rows="3"

                                        // dangerouslySetInnerHTML={{ __html: content }}
                                        >
                                          {addformData.map((item, index) => (
                                            <div className="Section_TwoMAnagement m-3" key={index}>
                                              <div className="row mx-3">
                                                <div className="col-lg-1 p-0 mt-0 1 text-left">
                                                  <p className="mt-4"><strong>{item.name}</strong></p>

                                                </div>
                                                <div className="col-lg-2 p-0 1 mt-4">
                                                  <input className="w-75 border-0" type="text" value={addformData[index].uuname} />

                                                </div>
                                                <div className="col-lg-1 px-0 text-center">
                                                  <input type="checkbox" className="mt-4" id={`a-${index}`} checked={item.permissions.a !== ''} onChange={() => handleCheckboxChang(index, 'a')} />

                                                </div>
                                                <div className="col-lg-2 px-0 text-center">
                                                  <input type="checkbox" className="mt-4" id={`b-${index}`} checked={item.permissions.b !== ''} onChange={() => handleCheckboxChang(index, 'b')} />

                                                </div>
                                                <div className="col-lg-2 px-0  text-center">
                                                  <input type="checkbox" className="mt-4 pr-0 ml-4 " id={`c-${index}`} checked={item.permissions.c !== ''} onChange={() => handleCheckboxChang(index, 'c')} />

                                                </div>
                                                <div className="col-lg-2 px-0 text-center">
                                                  <input type="checkbox" className="mt-4 px-0 ml-5 " id={`d-${index}`} checked={item.permissions.d !== ''} onChange={() => handleCheckboxChang(index, 'd')} />

                                                </div>
                                                <div className="col-lg-1 px-0 text-right">
                                                  <input type="checkbox" className="mt-4 px-0 mr-2" id={`e-${index}`} checked={item.permissions.e !== ''} onChange={() => handleCheckboxChang(index, 'e')} />
                                                </div>
                                                <div className="col-lg-1 px-0 text-right">
                                                  <input type="checkbox" className="mt-4 mr-3" id={`f-${index}`} checked={item.permissions.f !== ''} onChange={() => handleCheckboxChang(index, 'f')} />
                                                </div>


                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                      </div>
                                    </div>
                                  </form>
                                </div>
                                <div className="d-flex justify-content-end align-item-end">

                                  <div className="row py-3 mx-2">
                                    <div className="col">
                                      <button
                                        className="AgriNext"
                                        onClick={handleConfirm}
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                    <div className="col">
                                      <button
                                        // disabled={!isFormValid()}
                                        className="AgriNext"
                                        onClick={handleEdit}
                                      >
                                        Edit

                                      </button>
                                    </div>
                                    <div className="col">
                                      <button

                                        className="AgriCancel"
                                        onClick={handleSuccessModalClose}
                                      >
                                        Cancel

                                      </button>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-4"></div>
                    </Modal>
                    {/* modal close */}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Agriproject