import React, { useState, useRef, useEffect } from 'react'
import "./MainContainer.css"

import { faFileAlt, faL } from "@fortawesome/free-solid-svg-icons";
import {
    faBars,
    faChevronLeft,
    faChevronRight,
    faAngleDoubleLeft, faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CenteredForm from './open_Project_Component/CenteredForm';



const MainContainer = ({projectInfoP, setIsTrue, isTrue, userType, userName, THEME_OPT, refreshToken, userId, closeForm }) => {

    const [showForm, setShowForm] = useState(true);

    const openForm = () => setShowForm(true);
    const closeFormID = () => setShowForm(false);



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
    const [dateValue, setDateValue] = useState("26-04-2024");
    const [timeValue, setTimeValue] = useState("12:45");

    // Set current date and time on component mount
    useEffect(() => {
        const { currentDate, currentTime } = getCurrentDateTime();
        setDateValue(currentDate);
        setTimeValue(currentTime);
    }, []);



    const currentYear = new Date().getFullYear();
    const startYear = 2010;
    const endYear = 2024;



    const [selectedYears, setSelectedYears] = useState([]);
    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleYearCheckboxChange = (year) => {
        if (selectedYears.includes(year)) {
            setSelectedYears(selectedYears.filter((selectedYear) => selectedYear !== year));
        } else {
            setSelectedYears([...selectedYears, year]);
        }
    };

    // Function to handle clicks on the dropdown button
    const handleDropdownClick = (e) => {

        e.stopPropagation();
        // toggleDropdown();
        toggleDropdown();
        // Toggle the dropdown visibility
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
    const [currentSection, setCurrentSection] = useState("");

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

    const [formData, setFormData] = useState({

        projectClientOrganization: "Green AgriTech ",
        projectExecutedOrganization: "Micronet Solution",
        ProjectId: "",
        ProjectName: "",

        // ProjectCreationByAu:"Rajesh_Reddy",
        ProjectDescription: "Using remote senting satelite monitor ",
        AreaInformation: "Agriculture is a critical sector of the global economy, providing food, raw materials, and employment opportunities. ",
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const isFormValid = () => {
        // Add logic to check if all required fields are filled
        return (
            formData.projectClientOrganization.trim() !== "" &&
            formData.projectExecutedOrganization.trim() !== "" &&
            formData.ProjectName.trim() !== ""
            // formData.ProjectDescription.trim() !== "" 
            // formData.AreaInformation.trim() !== ""
        );
    };
    // newone//
    const [selectedYearsList, setSelectedYearsList] = useState([]);
    const [optionsOpen, setOptionsOpen] = useState(false);


    const startingYear = 2010;
    const endingYear = 2024;
    const month = 5; // June is month 5 (0-based index)

    const toggleOptions = () => {
        setOptionsOpen(!optionsOpen);
    };

    const handleCheckboxChange = (year) => {
        if (selectedYearsList.includes(year)) {
            setSelectedYearsList(selectedYearsList.filter(y => y !== year));
        } else {
            setSelectedYearsList([...selectedYearsList, year]);
        }
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
    //UserName by local storage item//
    const [user, setUser] = useState("Rajesh Redy");
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
    // console.log("theme opt:" + THEME_OPT);

    // checkbox selection//
    const [checkedItems, setCheckedItems] = useState({
        vehicle1: true,
        vehicle2: false,
        vehicle3: false,
        vehicle4: true // Initially set to true
    });

    const handleChange = (event) => {
        const { name, checked } = event.target;
        if (name === 'vehicle4') {
            setCheckedItems({
                vehicle1: checked,
                vehicle2: checked,
                vehicle3: checked,
                vehicle4: checked
            });
        } else {
            setCheckedItems(prevState => ({
                ...prevState,
                [name]: checked
            }));
            // If the "All" checkbox is checked, uncheck it
            if (checkedItems.vehicle4) {
                setCheckedItems(prevState => ({
                    ...prevState,
                    vehicle4: false
                }));
            }
        }
    };

    // folderupload and create//
    const [directoryHandle, setDirectoryHandle] = useState(null);
    const [projectInfoFolderName, setProjectInfoFolderName] = useState('');
    const [selectedFolderName, setSelectedFolderName] = useState();
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
            const projectInfoFolderHandle = await newDirectoryHandle.getDirectoryHandle('ProjectInfo', { create: true });
            console.log('Project info folder created successfully:', projectInfoFolderHandle);
            setProjectInfoFolderName('ProjectInfo');
            setAoi("GIS_AOI");
            setGt("GIS_GT")
            setgismask("GIS_MASK")
            setSatellite("GIS_SATELLITE")
            setWeather("GIS_WEATHER")
            setHistorical("GIS_Historical")
            // Set the project info folder name
        } catch (error) {
            console.error('Error creating folder:', error);
            setMessage('Error creating folder: ' + error.message);
        }
    };
    const createAoIFolderInProject = async (projectFolderHandle) => {
        try {
            const AoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI', { create: true });
            console.log('AoI folder created successfully inside project:', AoIFolderHandle);
            const path = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${aoi}`;
            setAoiCheckbox(` ${path}`);
        } catch (error) {
            console.error('Error creating AoI folder:', error);
            setAoiCheckbox('Error creating AoI folder: ' + error.message);
        }
    };
    // const handleCheckboxChangeFolder = async (e) => {
    //     setCreateAoIFolder(e.target.checked);
    //     if (e.target.checked) {
    //         try {
    //             let projectFolderHandle;
                
    //             try {
    //                 projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
    //             } catch {
    //                 projectFolderHandle = await createFolder();
    //             }

               
    //             await createAoIFolderInProject(projectFolderHandle);
    //         } catch (error) {
    //             console.error('Error accessing project folder:', error);
                
    //         }
    //     }
    // };

    const createGTFolderInProject = async (projectFolderHandle) => {

        try {
            const GTFolderHandle = await projectFolderHandle.getDirectoryHandle('GT', { create: true });
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
        setCreateGTFolder(e.target.checked);
        if (e.target.checked) {
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
            const GISFolderHandle = await projectFolderHandle.getDirectoryHandle('GIS Mask or Basemap', { create: true });
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
        setGismask(e.target.checked);
        if (e.target.checked) {
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
            const SatelliteFolderHandle = await projectFolderHandle.getDirectoryHandle('Satellite', { create: true });
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
        setcreateSatellite(e.target.checked);
        if (e.target.checked) {
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
            const WeatherFolderHandle = await projectFolderHandle.getDirectoryHandle('Weather', { create: true });
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
        setcreateWeather(e.target.checked);
        if (e.target.checked) {
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
            const HistoricalFolderHandle = await projectFolderHandle.getDirectoryHandle('Historical', { create: true });
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
        setcreateHistorical(e.target.checked);
        if (e.target.checked) {
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


    const handleUploadAoi = async () => {
        try {
            if (!aoiCheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }

            // Open file picker instead of directory picker
            const [fileHandle] = await window.showOpenFilePicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const aoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI');

            await copyFile(fileHandle, aoIFolderHandle);
            setMessage('AOI file uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };

    const copyFile = async (fileHandle, destDirHandle) => {
        const file = await fileHandle.getFile();
        const newFileHandle = await destDirHandle.getFileHandle(file.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
    };

    // ////////////////////////////////////SelectGT/////////////////////
    const handleUploadGT = async () => {
        try {
            if (!gtcheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }

            const [fileHandle] = await window.showOpenFilePicker();
            // const uploadDirHandle = await window.showDirectoryPicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const gtIFolderHandle = await projectFolderHandle.getDirectoryHandle('GT');

            await copyFile(fileHandle, gtIFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };
    /////////////////////////SelectGismask///////////////////////////
    const handleUploadGISMASK = async () => {
        try {
            if (!gismaskCheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }


            const [fileHandle] = await window.showOpenFilePicker();;
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const gismaskIFolderHandle = await projectFolderHandle.getDirectoryHandle('GIS Mask or Basemap');

            await copyFile(fileHandle, gismaskIFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };

    //////////////////////Upload satellite///////////////////////
    const handleUploadSatellite = async () => {
        try {
            if (!satelliteCheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }

            const [fileHandle] = await window.showOpenFilePicker();;
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const satelliteFolderHandle = await projectFolderHandle.getDirectoryHandle('Satellite');

            await copyFile(fileHandle, satelliteFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };
    //////////////////////Upload Weather///////////////////////
    const handleUploadWeather = async () => {
        try {
            if (!weatherCheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }

            const [fileHandle] = await window.showOpenFilePicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const weatherFolderHandle = await projectFolderHandle.getDirectoryHandle('Weather');

            await copyFile(fileHandle, weatherFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };

    //////////////////////Upload HistoricalData///////////////////////
    const handleUploadHistoricalData = async () => {
        try {
            if (!historicalCheckbox) {
                setMessage('Please create the AoI folder first.');
                return;
            }

            const [fileHandle] = await window.showOpenFilePicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const historicalFolderHandle = await projectFolderHandle.getDirectoryHandle('Historical');

            await copyFile(fileHandle, historicalFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
        } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
        }
    };

    // /////////copy////////////
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
    const [checkboxes, setCheckboxes] = useState({
        a: true,
        b: true,
        c: true,
        d: true,
        e: true,
        f: true,

    });






    const handleCheckboxManagements = (event) => {

        const { id, checked } = event.target;
        setCheckboxes({ ...checkboxes, [id]: checked });
    };


    //////////////Addeach row for uu user/////
    const [addformData, setAddFormData] = useState([{ name: "ur2", uuname: "59748", permissions: { a:true , b: false, c: true, d: false, e: true, f: true } },
    { name: "urr3", uuname: "11244", permissions: { a: true, b: false, c: true, d: true, e: false, f: true } }
    ]);


    const handleAddButtonClick = () => {
        const newName = `UU${addformData.length + 1}`;
        setAddFormData();
    };
    // const handleClearButtonClick = () => {
    //   setAddFormData(addformData.slice(1));
    // };
    const handleClearButtonClick = () => {

        const newAddFormData = [...addformData];
        newAddFormData.pop();
        setAddFormData(newAddFormData);
    };
    const handleCheckboxChang = (index, permission) => {
        const newAddFormData = [...addformData];
        newAddFormData[index].permissions[permission] = !newAddFormData[index].permissions[permission];
        setAddFormData(newAddFormData);
    };




    const [isOpenidform, setisOpenidform] = useState(false);
    const [isIconRotated, setIsIconRotated] = useState(false);

    // const toggleDropdownId = () => {
       
    //     setisOpenidform(!isOpenidform);
    //     setIsIconRotated(!isIconRotated);
    // };
    const toggleDropdownId = () => {
        setisOpenidform(!isOpenidform); // Toggle isOpenidform state
        setIsIconRotated(!isIconRotated); // Toggle isIconRotated state
    };


    const [inputValue, setInputValue] = useState('');

    const handleItemClick = (value) => {
        setProjectId(value); // Set projectId state with selected value
        // handleSubmit(value); 
        
        toggleDropdownId(); // Close the dropdown after selecting an item
        setIsIconRotated(false);
    };


    const ProjectIdhandler = () => {
        setIsTrue(false)
        setCurrentSection("projectInfo")
    }
////////////mynew//////

    const [projectId, setProjectId] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const handleInputChangeC = (event) => {
        setProjectId(event.target.value);
    };
        
    const handleSubmit = async (event) => {
        event.preventDefault();
        // setLoading(true);
        // setError(null);
        setProjectInfo(null);

        const apiUrl = `http://127.0.0.1:8000/createproject/ProjectInformation/?PROJECT_ID=${projectId}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const data = await response.json();
            setProjectInfo(data);
        } catch (error) {
            // setError(error.message);
            console.error('There was an error!', error);
        } finally {
            // setLoading(false);
        }
    };
    const [receivedProjectInfo, setReceivedProjectInfo] = useState(null);
    useEffect(() => {
        // Check if receivedProjectInfo.AREA_OF_INTEREST is non-empty string
        if (receivedProjectInfo && receivedProjectInfo.AREA_OF_INTEREST !== "") {
          setCreateAoIFolder(true); // Set checkbox to checked
        } else {
          setCreateAoIFolder(false); // Set checkbox to unchecked
        }
        if (receivedProjectInfo && receivedProjectInfo.SATELLITE_DATA !== "") {
            setSatelliteCheckbox(true); // Set checkbox to checked
          } else {
            setSatelliteCheckbox(false); // Set checkbox to unchecked
          }
          if (receivedProjectInfo && receivedProjectInfo.GIS_MASK_BASEMAP !== "") {
            setGismask(true); // Set checkbox to checked
          } else {
            setGismask(false); // Set checkbox to unchecked
          }
          if (receivedProjectInfo && receivedProjectInfo.GROUND_TRUTH !== "") {
            setGt(true); // Set checkbox to checked
          } else {
            setGt(false); // Set checkbox to unchecked
          }
          if (receivedProjectInfo && receivedProjectInfo.WEATHER_DATA !== "") {
            setcreateWeather(true); // Set checkbox to checked
          } else {
            setcreateWeather(false); // Set checkbox to unchecked
          }
          if (receivedProjectInfo && receivedProjectInfo.HISTORICAL_DATA !== "") {
            setGismaskCheckbox(true); // Set checkbox to checked
          } else {
            setGismaskCheckbox(false); // Set checkbox to unchecked
          }
      }, [receivedProjectInfo]);
    
      const handleCheckboxChangeFolder = () => {
        setCreateAoIFolder(!createAoIFolder);
        setCreateGTFolder(!createGTFolder);
        createGismask(!createGismask);
        createsatellite(!createsatellite)
        setCreateGTFolder(!createGTFolder);
        createweather(!createweather);
        createhistorical(!createhistorical)
         // Toggle checkbox state
      };
    const [croppingSeasons, setCroppingSeasons] = useState({
        Rabi: false,
        Kharif: false,
        Summer: false,
        All: false
    });

    const handleProjectInfo = (data) => {
        setReceivedProjectInfo(data);
        setCurrentSection("projectInfo");
      
        const newSeasons = {
            Rabi: false,
            Kharif: false,
            Summer: false,
            All: false
        };
        if (data.CROPPING_SEASON.includes("Rabi")) newSeasons.Rabi = true;
        if (data.CROPPING_SEASON.includes("Kharif")) newSeasons.Kharif = true;
        if (data.CROPPING_SEASON.includes("Summer")) newSeasons.Summer = true;

        // Check if all three specific seasons are checked
        if (newSeasons.Rabi && newSeasons.Kharif && newSeasons.Summer) {
            newSeasons.All = true;
        }
        // if (data.CROPPING_SEASON === "All") {
        //     newSeasons.Rabi = true;
        //     newSeasons.Kharif = true;
        //     newSeasons.Summer = true;
        //     newSeasons.All = true;
        // } else {
        //     if (data.CROPPING_SEASON.includes("Rabi")) newSeasons.Rabi = true;
        //     if (data.CROPPING_SEASON.includes("Kharif")) newSeasons.Kharif = true;
        //     if (data.CROPPING_SEASON.includes("Summer")) newSeasons.Summer = true;
        //     if (data.CROPPING_SEASON.includes("All")) newSeasons.Summer = true;
        // }

        setCroppingSeasons(newSeasons);
        setIsTrue(false);
    };
    const [projectManagementData, setProjectManagementData] = useState([]);
    const handleCheckboxManagement = (e) => {
        const { id, checked, dataset: { index } } = e.target;
        setProjectManagementData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [id]: checked ? id : null };
            return newData;
        });
    };

    useEffect(() => {
        if (receivedProjectInfo && receivedProjectInfo.project_management) {
            const managementData = receivedProjectInfo.project_management.map((management) => ({
                ...management,
                a: !!management.STACKING,
                b: !!management.UNSUPERVISED_CLASSIFICATION,
                c: !!management.SUPERVISED_CLASSIFICATION,
                d: !!management.RECODE_CLUMP_ELIMINATE,
                e: !!management.ANALYSIS,
                f: !!management.STATISTICS
            }));
            setProjectManagementData(managementData);
            setUser(managementData[0]?.ADMIN_USER || "");
        }
    }, [receivedProjectInfo]);

         console.log(
            "hello" +  projectInfo)
    return (
        <>



            <div className='relative' style={{ fontSize: "14px", textAlign: "center" }}>
                <div className="">
                    <div class="d-flex  mx-5 justify-content-center align-items-center ">
                        <div class="Agriform mt-5 ">
                            <div className="row mx-auto AgriRow">
                                <div className="col-lg-1 p-0">
                                    <img
                                        className="agrilogo "
                                        src="agrilogonew.png"
                                    ></img>
                                </div>
                                <div className="col-lg-3 fw-bold p-0 mt-4">
                                    <p className="font-weight-bold Agri-Heading">
                                        Agriculture - Open Project 
                                       
                                        {/* {receivedProjectInfo && (
                <div>
                    <p>Received Project Information:</p>
                    <pre>{JSON.stringify(receivedProjectInfo, null, 2)}</pre>
                </div>
            )} */}
                                        {/* {receivedProjectInfo && (
                <div className="project-info-container">
                    <p>Project Information</p>
                    <p>ID: {receivedProjectInfo.id}</p>
                    <p>PROJECT_ID: {receivedProjectInfo.PROJECT_ID}</p>
                    <p>PROJECT_NAME: {receivedProjectInfo.PROJECT_NAME}</p>
                    <p>CREATION_DATE: {new Date(receivedProjectInfo.CREATION_DATE).toLocaleString()}</p>
                    <p>CREATED_BY: {receivedProjectInfo.CREATED_BY}</p>
                    <p>PROJECT_DESCRIPTION: {receivedProjectInfo.PROJECT_DESCRIPTION}</p>
                    <p>CLIENT_ORGANIZATION: {receivedProjectInfo.CLIENT_ORGANIZATION}</p>
                    <p>EXECUTED_ORGANIZATION: {receivedProjectInfo.EXECUTED_ORGANIZATION}</p>
                    <p>CROPPING_YEAR: {receivedProjectInfo.CROPPING_YEAR}</p>
                    <p>CROPPING_SEASON: {receivedProjectInfo.CROPPING_SEASON}</p>
                    <p>AREA_INFORMATION: {receivedProjectInfo.AREA_INFORMATION}</p>
                </div>
            )} */}
                                    </p>
                                </div>
                                <div
                                    className="col-lg-8 AgriClose"
                                // onClick={handleSuccessModalClose}
                                >
                                    <button className="border-0" onClick={handleClose}> X</button>

                                </div>
                            </div>


                           

                            <div className="position-relative">

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
                                {/* {receivedProjectInfo && (
                <div className="project-info-container">
                    <h2>Project Information</h2>
                    <p>ID: {receivedProjectInfo.id}</p>
                    <p>PROJECT_ID: {receivedProjectInfo.PROJECT_ID}</p>
                    <p>PROJECT_NAME: {receivedProjectInfo.PROJECT_NAME}</p>
                    <p>CREATION_DATE: {new Date(receivedProjectInfo.CREATION_DATE).toLocaleString()}</p>
                    <p>CREATED_BY: {receivedProjectInfo.CREATED_BY}</p>
                    <p>PROJECT_DESCRIPTION: {receivedProjectInfo.PROJECT_DESCRIPTION}</p>
                    <p>CLIENT_ORGANIZATION: {receivedProjectInfo.CLIENT_ORGANIZATION}</p>
                    <p>EXECUTED_ORGANIZATION: {receivedProjectInfo.EXECUTED_ORGANIZATION}</p>
                    <p>CROPPING_YEAR: {receivedProjectInfo.CROPPING_YEAR}</p>
                    <p>CROPPING_SEASON: {receivedProjectInfo.CROPPING_SEASON}</p>
                    <p>AREA_INFORMATION: {receivedProjectInfo.AREA_INFORMATION}</p>
                </div>
            )} */}

                                <div class="mx-3">
                                    <form
                                        className="mx-auto px-3 Project_info"
                                        style={{
                                            display:
                                                currentSection === "" ? "block" : "none",
                                            width: "1080px",
                                            height: "530px",
                                        }}
                                    >


                                      




                                    </form>
                                    {receivedProjectInfo &&  (<>
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
                                         <fieldset disabled>
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
                                                            </label>
                                                           
                                                        </div>
                                                        <div className="col-lg-8 p-0 text-left">
                                                            {" "}
                                                            <input
                                                                // name="ProjectId"
                                                                value={receivedProjectInfo.PROJECT_ID}
                                                                className="border-0 w-50 pl-3 remove_outline_border"
                                                                type="text"
                                                                // disabled
                                                                readOnly
                                                            />

                                                        </div>
                                                    </div>
                                                   
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
                                                                className="border-0 w-75 p-0 m-0 pl-3 remove_outline_border"
                                                                type="date"
                                                                value={dateValue}
                                                                onChange={(e) =>
                                                                    setDateValue(e.target.value)
                                                                }
                                                                readOnly
                                                                // disabled
                                                            />
                                                        </div>
                                                        <div className="col-lg-3 p-0 ">
                                                            {" "}
                                                            <input
                                                                className="w-75 border-0 p-0 m-0 pl-3 remove_outline_border"
                                                                type="text"
                                                                value={timeValue}
                                                                readOnly
                                                                // disabled
                                                            />
                                                        </div>
                                                    </div>

                                                </div>






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
                                                            <input

                                                                minLength={5}
                                                                maxLength={50}
                                                                name="ProjectName"

                                                                value={receivedProjectInfo.PROJECT_NAME}
                                                                className="w-75 border-0 remove_outline_border pl-3"
                                                                type="text"
                                                                style={{ boxShadow: 'none' }}
                                                                readOnly
                                                                // disabled
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="row">
                                                        <div className="col-lg-5 mr-0 pr-0">
                                                            <label className="mt-0">

                                                                Project Creation By (AU):
                                                            </label >
                                                        </div>
                                                        <div className="col-lg-7 ml-0 pl-0">
                                                            {" "}
                                                            <input

                                                                name="user"
                                                                value={user}
                                                                className="w-100 border-0 remove_outline_border pl-3"
                                                                type="text"
                                                                readOnly
                                                                // disabled
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="Section_Three m-3 text-left ">
                                            <label className="pb-2 pl-2">Project Description</label>
                                            <textarea
                                                minLength={5}
                                                maxLength={200}
                                                name="ProjectDescription"
                                                value={receivedProjectInfo.PROJECT_DESCRIPTION}

                                                class="w-100 border-0 h-50 scrollable-input border-0  px-1"
                                                id="exampleFormControlTextarea1"
                                                      rows="3"
                                                      readOnly
                                                // disabled
                                            >

                                            </textarea>
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
                                                    <input
                                                        minLength={5}
                                                        maxLength={50}
                                                        
                                                        name={receivedProjectInfo.CLIENT_ORGANIZATION}
                                                        value={receivedProjectInfo.CLIENT_ORGANIZATION}
                                                        className="w-50 border-0 remove_outline_border pl-3 "
                                                        type="text"
                                                        readOnly
                                                        // disabled
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
                                                    <input
                                                        minLength={5}
                                                        maxLength={50}

                                                        name="projectExecutedOrganization"
                                                        value={receivedProjectInfo.EXECUTED_ORGANIZATION}
                                                        className="w-50 border-0 remove_outline_border pl-3 "
                                                        type="text"
                                                        readOnly
                                                        // disabled
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

                                                    <input
                                                        minLength={5}
                                                        maxLength={50}

                                                       
                                                        value={receivedProjectInfo.CROPPING_YEAR}
                                                       
                                                        className="w-50 border-0 remove_outline_border pl-3 "
                                                        type="text"
                                                        readOnly
                                                        // disabled
                                                    />
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
                                                              
                                                              checked={croppingSeasons.Kharif}
                                                              readOnly
                                                        
                                                                // checked={checkedItems.vehicle1}
                                                                // onChange={handleChange}
                                                                className="mr-2"
                                                                type="checkbox"
                                                                // id="vehicle1"
                                                                // name="vehicle1"
                                                                // value="Bike"
                                                                disabled
                                                            />
                                                            <label className="mr-3" for="vehicle1">
                                                                {" "}
                                                                Kharif
                                                            </label>
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                             checked={croppingSeasons.Rabi}
                                                              readOnly
                                                          
                                                                // checked={checkedItems.vehicle2}
                                                                // onChange={handleChange}
                                                                className="mr-2"
                                                                type="checkbox"
                                                                // id="vehicle2"
                                                                // name="vehicle2"
                                                                // value="Car"
                                                                disabled
                                                            />
                                                            <label className="mr-3" for="vehicle2">
                                                                {" "}
                                                                Rabi
                                                            </label>
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                              type="checkbox"
                                                              checked={croppingSeasons.Summer}
                                                              readOnly
                                                                // checked={checkedItems.vehicle3}
                                                                // onChange={handleChange}
                                                                className="mr-2"
                                                                // type="checkbox"
                                                                // id="vehicle3"
                                                                // name="vehicle3"
                                                                // value="Boat"
                                                                // disabled
                                                                
                                                            />
                                                            <label className="mr-3" for="vehicle3">
                                                                {" "}
                                                                Summer
                                                            </label>
                                                        </div>
                                                        <div className="col">
                                                            <input
                                                                // checked={checkedItems.vehicle4}
                                                                // onChange={handleChange}
                                                                className="mr-2"
                                                                // type="checkbox"
                                                                // id="vehicle4"
                                                                // name="vehicle4"
                                                                // value="Boats"
                                                                type="checkbox"
                                                                checked={croppingSeasons.All}
                                                                readOnly
                                                               
                                                                // disabled

                                                            />
                                                            <label className="mr-3" for="vehicle4">
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
                                                    <textarea

                                                        name="AreaInformation"
                                                        value={receivedProjectInfo.AREA_INFORMATION}
                                                        // value={formData.AreaInformation}
                                                        className="w-100 scrollable-input border-0 remove_outline_border pl-3"
                                                        id="exampleFormControlTextarea1"
                                                        rows="3"
                                                        readOnly
                                                        disabled
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        </fieldset>
                                    </form></>)}
                                  
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
                                        {receivedProjectInfo &&  (<>
                                            <div className="Section_one m-3">
                                            <div className="row mt-4">
                                                <div className="col-lg-3 p-0 m-0 1">
                                                    <label className="AgriLabel  w-100 text-left">
                                                        <span className="required-field">*</span>
                                                        Project Workspace Location
                                                    </label>
                                                    {/* <input className='w-50' type='text'/> */}
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">


                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.WORKSPACE_LOCATION
                                                        }
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button onClick={selectDirectory} className=" w-100" >

                                                        Select folder
                                                    </button>
                                                </div> */}
                                            </div>
                                        </div>
                                        <div className="Section_Two m-3 ">
                                            <div className="row">
                                                <div className="col-lg-3 p-0 m-0 1">
                                                    <label className="AgriLabel  w-100 text-center ">
                                                        <span className="required-field">*</span>
                                                        Project Folder
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input

                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.PROJECT_FOLDER

                                                        }
                                                        // value="E:\AGRICULTURE\AGR0001"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-lg-2  3"></div>
                                            </div>
                                        </div>
                                        <div className="Section_Three m-3 ">
                                            <div className="row">
                                                <div className="col-lg-3 p-0 m-0 1">
                                                    <label className="AgriLabel  w-100 text-center">
                                                        <span className="required-field">*</span>
                                                        Project Information
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input

                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        disabled
                                                        value={receivedProjectInfo.PROJECT_INFORMATION

                                                        }
                                                        // value="E:\AGRICULTURE\AGR0001.xml"
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
                                                        disabled
                                                    />
                                                    <label className="mr-3" htmlFor="createAoIFolder">
                                                        {" "}
                                                        Area of intrest AOI
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.AREA_OF_INTEREST
                                                        }
                                                        // value="E:\AGRICULTURE\AGR0001_GIS_AOI\MOUDA. (Vector Format)"
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createAoIFolder} onClick={handleUploadAoi} className=" w-100">
                                                        Select AOI
                                                    </button>
                                                </div> */}
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
                                                        disabled
                                                    />
                                                    <label className="mr-3" htmlFor="createGTFolder">
                                                        GT (Ground Truth)
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100 border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.GROUND_TRUTH

                                                        }
                                                        // value={gtcheckbox}
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createGTFolder} onClick={handleUploadGT} className=" w-100">UPLOAD</button>
                                                </div> */}
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
                                                        disabled
                                                    />
                                                    <label className="mr-3" htmlFor="createGismask">
                                                        GIS Mask Or Basemap
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.GIS_MASK_BASEMAP

                                                        }
                                                        // value="E:\AGRICULTURE\AGR0001_GIS\Satelite\MOUDAMASK. (Tabular Format)"
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createGismask} onClick={handleUploadGISMASK} className=" w-100">UPLOAD</button>
                                                </div> */}
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
                                                    />
                                                    <label className="mr-3" HtmlFor="createsatellite">
                                                        <span className="required-field">*</span>
                                                        Satellite Data
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.SATELLITE_DATA}
                                                        // value={satelliteCheckbox}
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createsatellite} onClick={handleUploadSatellite} className=" w-100">UPLOAD</button>
                                                </div> */}
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
                                                        disabled
                                                    />
                                                    <label className="mr-3" for="vehicle1">
                                                        Weather Data
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.WEATHER_DATA }

                                                        // value={weatherCheckbox}
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createweather} onClick={handleUploadWeather} className=" w-100">UPLOAD</button>
                                                </div> */}
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
                                                        disabled
                                                    />
                                                    <label className="mr-3" for="createhistorical">
                                                        Historical Data
                                                    </label>
                                                </div>
                                                <div className="col-lg-7 p-0 m-0 2">
                                                    <input
                                                        className="w-100  border-0 remove_outline_border pl-3"
                                                        type="text"
                                                        value={receivedProjectInfo.HISTORICAL_DATA
                                                        }
                                                        // value="E:\AGRICULTURE\AGR0001_GIS\Satelite\MOUDASATELLITEDATA. (Raster Format)"
                                                        disabled
                                                    />
                                                </div>
                                                {/* <div className="col-lg-2  3">
                                                    <button disabled={!createhistorical} onClick={handleUploadHistoricalData} className=" w-100">UPLOAD</button>
                                                </div> */}
                                            </div>
                                        </div></>)}
                                       
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
                                         {receivedProjectInfo && (<>
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
                                                    <p className="mt-4"><strong>Admin User</strong></p>

                                                </div>
                                                <div className="col-lg-2 p-0 1 mt-4">
                                                    <input className="w-75 border-0 bg-white pl-3" type="text" name="user"
                                                        value={user}
                                                        disabled
                                                    />


                                                </div>
                                                <div className="col-lg-1 p-0 text-center">
                                                    <input type="checkbox" className="mt-4" id="a"  checked={!!receivedProjectInfo.STACKING}  disabled/>

                                                </div>
                                                <div className="col-lg-2  text-center">
                                                    <input type="checkbox" className="mt-4" id="b" checked={!!receivedProjectInfo.UNSUPERVISED_CLASSIFICATION}  disabled/>

                                                </div>
                                                <div className="col-lg-2  text-center">
                                                    <input type="checkbox" className="mt-4" id="c" checked={!!receivedProjectInfo.SUPERVISED_CLASSIFICATION} />

                                                </div>
                                                <div className="col-lg-2  text-center">
                                                    <input type="checkbox" className="mt-4" id="d" hecked={!!receivedProjectInfo.RECODE_CLUMP_ELIMINATE} />

                                                </div>
                                                <div className="col-lg-1  text-center">
                                                    <input type="checkbox" className="mt-4" id="e"  checked={!!receivedProjectInfo.ANALYSIS} />
                                                </div>
                                                <div className="col-lg-1  text-center">
                                                    <input type="checkbox" className="mt-4" id="f" checked={!!receivedProjectInfo.STATISTICS} />
                                                </div>


                                            </div>
                                        </div>
                                        <div className="Section_ThreeManagement m-3 text-left px-3">
                                            <label className=""><stron>Assign Authorized User (UU) for Task </stron></label>
                                            <div
                                                class="Asign_Autherise  border-0"
                                                id="exampleFormControlTextarea1"
                                                rows="3"

                                            // dangerouslySetInnerHTML={{ __html: content }}


                                            >
                                                {projectManagementData.map((management, index) => (

                                                    <div className="Section_TwoMAnagement m-3" key={management.id}>
                                                        <div className="row mx-3">
                                                            <div className="col-lg-1 p-0 mt-0 1 text-left">
                                                                <p className="mt-4"><strong>{management.WORK_ASSIGN_USER}</strong></p>

                                                            </div>
                                                            <div className="col-lg-2 p-0  mt-1">
                                                                <input className="w-75 border-0 pl-2 bg-white " type="text" value={management.WORK_ASSIGN_USER}
                                                                    disabled />

                                                            </div>
                                                            <div className="col-lg-1 p-0 text-center">
                                                                <input type="checkbox" className="mt-4"    id={`stacking-${index}`}
          checked={!!management.STACKING} />

                                                            </div>
                                                            <div className="col-lg-2  text-center">
                                                                <input type="checkbox" className="mt-4"  id={`unsupervised-${index}`}
          checked={!!management.UNSUPERVISED_CLASSIFICATION} />

                                                            </div>
                                                            <div className="col-lg-2  text-center">
                                                                <input type="checkbox" className="mt-4"  id={`supervised-${index}`}
          checked={!!management.SUPERVISED_CLASSIFICATION} />

                                                            </div>
                                                            <div className="col-lg-2  text-center">
                                                                <input type="checkbox" className="mt-4"   id={`recode-${index}`}
          checked={!!management.RECODE_CLUMP_ELIMINATE}  />

                                                            </div>
                                                            <div className="col-lg-1  text-center">
                                                                <input type="checkbox" className="mt-4"   id={`analysis-${index}`}
          checked={!!management.ANALYSIS} />
                                                            </div>
                                                            <div className="col-lg-1  text-center">
                                                                <input type="checkbox" className="mt-4"    id={`stat-${index}`}
          checked={!!management.STATISTICS} />
                                                            </div>


                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                        </div>                                        
                                        </>)}
                                        

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
                                                    // onClick={handleBackButtonClick}
                                                    >
                                                        <FontAwesomeIcon className="Iconnextandprevious" icon={faAngleDoubleLeft} />
                                                        PREV
                                                    </button>
                                                </div>
                                                <div className="col">
                                                    <button
                                                        className="AgriCancel"
                                                        onClick={handleClose}
                                                    >
                                                        CLOSE
                                                    </button>
                                                </div>

                                            </>
                                        )}

                                        {!currentSection === "" && (
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
                                    </div>
                                </div>




                                {

                                    isTrue && (
                                        <>
                                            <div
                                                className="FormId "

                                            >
                                                <CenteredForm
                                                    isOpenidform={isOpenidform}
                                                    toggleDropdownId={toggleDropdownId}
                                                    handleItemClick={handleItemClick}
                                                    inputValue={projectId}
                                                    setInputValue={setInputValue}
                                                    ProjectIdhandler={ProjectIdhandler}
                                                    isIconRotated={isIconRotated}
                                                    onReceiveProjectInfo={handleProjectInfo}
                                                />
                                            </div>
                                        </>
                                    )


                                }




                            </div>
                        </div>
                    </div>
                </div>


            </div>






        </>
    )
}

export default MainContainer