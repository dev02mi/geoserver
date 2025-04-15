import React, { useState, useEffect, useRef } from "react";
import "./CreateProject.css";
import Sidebar from "./Sidebar";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import {
  faBars,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft, faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
Modal.setAppElement("#root");
const CreateProject = ({ userType, userName, THEME_OPT, refreshToken, userId }) => {
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
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  // Set current date and time on component mount
  useEffect(() => {
    const { currentDate, currentTime } = getCurrentDateTime();
    setDateValue(currentDate);
    setTimeValue(currentTime);
  }, []);
 
  // const currentYear = new Date().getFullYear();

 
  // const startYear = 2010;


  // const endYear = 2024;

  // const options = [
  //   <option key="default" value="">
  //     Select a year
  //   </option>,
  // ];

  
  // for (let year = startYear; year < endYear; year++) {
   
  //   let label = "";
  //   if (year === startYear) {
  //     label = `June ${year} - May ${year + 1}`;
  //   } else if (year === endYear) {
  //     label = `June ${year - 1} - May ${year}`;
  //   } else {
  //     label = `June ${year} - May ${year + 1}`;
  //   }

   
  //   options.push(
  //     <option key={year} value={year}>
  //       {label}
  //     </option>
  //   );
  // }
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
   
    projectClientOrganization: " ",
    projectExecutedOrganization: "",
    ProjectId:"AGRI0001",
    ProjectName:"",
    // ProjectCreationByAu:"Rajesh_Reddy",
    ProjectDescription:"",
    AreaInformation:"",
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
        formData.ProjectName.trim() !== "" &&
        formData.ProjectDescription.trim() !== "" &&
        formData.AreaInformation.trim() !== ""
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
// console.log("theme opt:" + THEME_OPT);

// checkbox selection//
const [checkedItems, setCheckedItems] = useState({
  vehicle1: false,
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
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [message, setMessage] = useState('');
  const [FormId, seFormId] = useState('');
  
  const [createAoIFolder, setCreateAoIFolder] = useState(false);
  const [aoiCheckbox, setAoiCheckbox] =  useState('');
  const [aoi, setAoi] = useState('');
   const [gtcheckbox, setGtcheckbox]=  useState('');
   const [gt, setGt] = useState(''); // State for GIS folder checkbox
   const [createGTFolder, setCreateGTFolder] = useState(false);
   //Gismask//
   const [createGismask, setGismask] = useState(false);
   const [gismaskCheckbox, setGismaskCheckbox] =  useState('');
   const [gismask, setgismask] = useState('');
//satellites///
   const [createsatellite, setcreateSatellite] = useState(false);
   const [satelliteCheckbox, setSatelliteCheckbox] =  useState('');
   const [satellite, setSatellite] = useState('');
  //weather///
  const [createweather, setcreateWeather] = useState(false);
  const [weatherCheckbox, setWeatherCheckbox] =  useState('');
  const [weather, setWeather] = useState('');
  //////////historical////////////
  const [createhistorical, setcreateHistorical] = useState(false);
  const [historicalCheckbox, setHistoricalCheckbox] =  useState('');
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
      const AoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI', { create: true });
      console.log('AoI folder created successfully inside project:', AoIFolderHandle);
      const path = `${selectedFolderName} / ${formData.ProjectId}/${formData.ProjectId}_${aoi}`;
      setAoiCheckbox(` ${path}`);
    } catch (error) {
      console.error('Error creating AoI folder:', error);
      setAoiCheckbox('Error creating AoI folder: ' + error.message);
    }
  };
  const handleCheckboxChangeFolder = async (e) => {
    setCreateAoIFolder(e.target.checked);
    if (e.target.checked) {
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
            
        
            const uploadDirHandle = await window.showDirectoryPicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const aoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI');
        
            await copyDirectory(uploadDirHandle, aoIFolderHandle);
            // setMessage('AOI folder uploaded successfully.');
          } catch (error) {
            console.error('Error uploading AOI:', error);
            setMessage('Error uploading AOI: ' + error.message);
          }
        };
       
        // ////////////////////////////////////SelectGT/////////////////////
        const handleUploadGT = async () => {
          try {
            if (!gtcheckbox) {
              setMessage('Please create the AoI folder first.');
              return;
            }
            
        
            const uploadDirHandle = await window.showDirectoryPicker();
            const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
            const gtIFolderHandle = await projectFolderHandle.getDirectoryHandle('GT');
        
            await copyDirectory(uploadDirHandle, gtIFolderHandle);
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
          
      
          const uploadDirHandle = await window.showDirectoryPicker();
          const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
          const gismaskIFolderHandle = await projectFolderHandle.getDirectoryHandle('GIS Mask or Basemap');
      
          await copyDirectory(uploadDirHandle, gismaskIFolderHandle);
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
    
    const uploadDirHandle = await window.showDirectoryPicker();
    const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
    const satelliteFolderHandle = await projectFolderHandle.getDirectoryHandle('Satellite');

    await copyDirectory(uploadDirHandle, satelliteFolderHandle);
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
    
    const uploadDirHandle = await window.showDirectoryPicker();
    const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
    const weatherFolderHandle = await projectFolderHandle.getDirectoryHandle('Weather');

    await copyDirectory(uploadDirHandle, weatherFolderHandle);
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
    
    const uploadDirHandle = await window.showDirectoryPicker();
    const projectFolderHandle = await directoryHandle.getDirectoryHandle(formData.ProjectId);
    const historicalFolderHandle = await projectFolderHandle.getDirectoryHandle('Historical');

    await copyDirectory(uploadDirHandle, historicalFolderHandle);
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
          a: false,
          b: false,
          c: false,
          d: false,
          e: false,
          f: false,
        
        });
        
       
        

        
      
        const handleCheckboxManagement = (event) => {
          const { id, checked } = event.target;
          setCheckboxes({ ...checkboxes, [id]: checked });
        };
       

        //////////////Addeach row for uu user/////
        const [addformData, setAddFormData] = useState([]);

        const handleAddButtonClick = () => {
          const newName = `UU${addformData.length + 1}`;
          setAddFormData([...addformData, { name: newName, permissions: { a: false, b: false, c: false, d: false, e: false, f: false } }]);
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
  return (
    <div>
      <div className="row mt-5">
        {showSidebar && (
        // <><Sidebar/>
        // </>
         
          <div className={`col-lg-${showSidebar ? "2" : "1"} SidebarMenu pl-5`}>
            <div className="pt-2">
              <div className="row ">
                <div className="col-lg-2">
                  {" "}
                  <img className="agrilogoSidebar " src="agrilogonew.png"></img>
                </div>
                <div className="col-lg-10 d-flex align-items-center justify-content-center ">
                  <p className="Agrihedingnav">Agriculture</p>
                </div>
              </div>

              <FontAwesomeIcon
                className="iconForCreateproject mr-3"
                icon={faFileAlt}
              />
             

              <button
                type="button"
               
                className={
                  isActives ? "buttons active" : "ButtonOfCreateProject"
                }
               
                onClick={handleSubmitButtonClick}
              >
                Create/Open Project
              </button>

              
             
            </div>
          </div>
        )}
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
                    top: 0,
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
                <div style={{ fontSize: "14px", textAlign: "center" }}>
                  <div className="">
                    <div class="d-flex  mx-5 justify-content-center align-items-center my-5">
                      <div class="Agriform " >
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
                            <button className="border-0"  onClick={handleSuccessModalClose}> X</button>
                           
                          </div>
                        </div>
                        <div className="">
                          <div className="row mx-auto py-3">
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
                          </div>

                          <div class="mx-3">
                            <form
                              className="mx-auto px-3 Project_info"
                              style={{
                                display:
                                  currentSection === "" ? "block" : "none",
                                width: "1080px",
                                height: "475px",
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
                                height: "475px",
                              }}
                            >
                              <div className="Section_one m-3">
                                <div className="row mb-5">
                                  <div className="col-lg-4 p-0 1">
                                    <div className="row ">
                                      <div className="col-lg-4 p-0 text-center">
                                        {" "}
                                        <label className="mt-0">
                                          {/* <span className="required-field">
                                            *
                                          </span> */}
                                          Project ID:
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-8 p-0 text-left">
                                        {" "}
                                        <input
                                        name=" ProjectId"
                                        value={formData.ProjectId}
                                          className="border-0 w-50"
                                          type="text"
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
                                        <label  className="mt-0">
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
                                        onChange={handleInputChange}
                                        value={formData.ProjectName}
                                          className="w-75 border-0"
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
                                        <label  className="mt-0">
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
                                    {/* <label><span className="required-field">*</span>Project Creation Time:</label>
                        <input  className='w-50' type='text'/> */}
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Three m-3 text-left mb-4">
                                <label className="">Project Description</label>
                                <textarea
                                minLength={5}
                                maxLength={200}
                                name="ProjectDescription"
                                value={formData.ProjectDescription}
                                onChange={handleInputChange}
                                  class="form-control scrollable-input border-0 p-0 lh-0"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                ></textarea>
                              </div>
                              <div className="Section_Four m-3">
                                <div className="row mb-4">
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
                                    onChange={handleInputChange}
                                    name="projectClientOrganization"
                                    value={formData.projectClientOrganization}
                                      className="w-50 border-0"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Five m-3">
                                <div className="row mb-4">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label  className="mt-0">
                                      <span className="required-field">*</span>
                                      Project Executed Organization:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <input
                                     minLength={5}
                                     maxLength={50}
                                     onChange={handleInputChange}
                                    name="projectExecutedOrganization"
                                    value={formData.projectExecutedOrganization}
                                      className="w-50 border-0"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Six m-3">
                                <div className="row mb-4">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label  className="mt-0">
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
      <div className={`dropdown ${isOpen ? 'open' : ''}`} onClick={handleDropdownClick} >
        <button type="button" className="dropdown-toggle w-50 border-0">
          {selectedYears.length > 0 ? selectedYears.join(', ') : 'Select a Cropping Years'}
        </button>
        <div className="dropdown-menu"style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                                    <label  className="mt-0">
                                      {/* <span className="required-field">*</span> */}
                                      Cropping season:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <div className="row">
                                      <div className="col">
                                        <input
                                        checked={checkedItems.vehicle1}
                                        onChange={handleChange}
                                          className="mr-2"
                                          type="checkbox"
                                          id="vehicle1"
                                          name="vehicle1"
                                          value="Bike"
                                        />
                                        <label className="mr-3" for="vehicle1">
                                          {" "}
                                          Kharif
                                        </label>
                                      </div>
                                      <div className="col">
                                        <input
                                        checked={checkedItems.vehicle2}
                                        onChange={handleChange}
                                          className="mr-2"
                                          type="checkbox"
                                          id="vehicle2"
                                          name="vehicle2"
                                          value="Car"
                                        />
                                        <label className="mr-3" for="vehicle2">
                                          {" "}
                                          Rabi
                                        </label>
                                      </div>
                                      <div className="col">
                                        <input
                                        checked={checkedItems.vehicle3}
                                        onChange={handleChange}
                                          className="mr-2"
                                          type="checkbox"
                                          id="vehicle3"
                                          name="vehicle3"
                                          value="Boat"
                                        />
                                        <label className="mr-3" for="vehicle3">
                                          {" "}
                                          Summer
                                        </label>
                                      </div>
                                      <div className="col">
                                        <input
                                        checked={checkedItems.vehicle4}
                                        onChange={handleChange}
                                          className="mr-2"
                                          type="checkbox"
                                          id="vehicle4"
                                          name="vehicle4"
                                          value="Boats"
                                          
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
                                height: "475px",
                              }}
                            >
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
                                  <div className="col-lg-3 p-0 m-0 1">
                                    <label className="AgriLabel  w-100 text-center ">
                                      <span className="required-field">*</span>
                                      Project Folder
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                      disabled={!selectedFolderName}
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
                                  <div className="col-lg-3 p-0 m-0 1">
                                    <label className="AgriLabel  w-100 text-center">
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
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                  <button disabled={!createAoIFolder}  onClick={handleUploadAoi} className=" w-100">
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
                                <button  disabled={!createGismask} onClick={handleUploadGISMASK} className=" w-100">UPLOAD</button>
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
                                   <button  disabled={!createsatellite} onClick={handleUploadSatellite} className=" w-100">UPLOAD</button>
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
                                 <button  disabled={!createweather} onClick={handleUploadWeather} className=" w-100">UPLOAD</button> 
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
                                  <button  disabled={!createhistorical} onClick={handleUploadHistoricalData} className=" w-100">UPLOAD</button>
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
                                height: "475px",
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
                                   <p className="mt-4"><strong>Admin User</strong></p>
                                    
                                  </div>
                                  <div className="col-lg-2 p-0 1 mt-4">
                                   <input className="w-75 border-0" type="text"  name="user"
                                       value={user} />
                                    
                                  </div>
                                  <div className="col-lg-1 p-0 text-center">
                                       <input type="checkbox" className="mt-4" id="a"   checked={checkboxes.a} onClick={handleCheckboxManagement} />
                                        
                                      </div>
                                      <div className="col-lg-2  text-center">
                                      <input type="checkbox" className="mt-4" id="b" checked={checkboxes.b} onClick={handleCheckboxManagement}/>
                                        
                                      </div>
                                      <div className="col-lg-2  text-center">
                                      <input type="checkbox" className="mt-4" id="c" checked={checkboxes.c} onClick={handleCheckboxManagement}/>
                                        
                                      </div>
                                      <div className="col-lg-2  text-center">
                                      <input type="checkbox" className="mt-4" id="d" checked={checkboxes.d} onClick={handleCheckboxManagement}/>
                                        
                                      </div>
                                      <div className="col-lg-1  text-center">
                                      <input type="checkbox" className="mt-4" id="e" checked={checkboxes.e} onClick={handleCheckboxManagement}/>
                                      </div>
                                      <div className="col-lg-1  text-center">
                                      <input type="checkbox" className="mt-4" id="f" checked={checkboxes.f} onClick={handleCheckboxManagement}/>
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
           <div className="col-lg-2 p-0 1 mt-4">
            <input className="w-75 border-0" type="text"  />
             
           </div>
           <div className="col-lg-1 p-0 text-center">
                <input type="checkbox" className="mt-4" id={`a-${index}`} checked={item.permissions.a} onChange={() => handleCheckboxChang(index, 'a')} />
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id={`b-${index}`} checked={item.permissions.b} onChange={() => handleCheckboxChang(index, 'b')}/>
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id={`c-${index}`} checked={item.permissions.c} onChange={() => handleCheckboxChang(index, 'c')} />
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id={`d-${index}`} checked={item.permissions.d} onChange={() => handleCheckboxChang(index, 'd')} />
                 
               </div>
               <div className="col-lg-1  text-center">
               <input type="checkbox" className="mt-4" id={`e-${index}`} checked={item.permissions.e} onChange={() => handleCheckboxChang(index, 'e')}/>
               </div>
               <div className="col-lg-1  text-center">
               <input type="checkbox" className="mt-4" id={`f-${index}`} checked={item.permissions.f} onChange={() => handleCheckboxChang(index, 'f')} />
               </div>
          
         
         </div>
       </div>
    ))}
                                </div>
                                <div className="row  d-flex justify-content-space-evenly my-4 mx-auto">
                                  <div className="col"><button  onClick={handleAddButtonClick} id="addButton" className="btn rounded AgriNext p-0 px-3">Add</button></div>
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
                                      onClick={handleSuccessModalClose}
                                    >
                                      CANCEL
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
                                      onClick={handleSuccessModalClose}
                                    >
                                      CANCEL
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
                                      onClick={handleSuccessModalClose}
                                    >
                                      CANCEL
                                    </button>
                                  </div>
                                  <div className="col">
                                    <button className="AgriNext">
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
                                      onClick={handleSuccessModalClose}
                                    >
                                      CANCEL
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4"></div>
              </Modal>
        {/* <button onClick={handleQuery}>Query Data</button> */}

        <div className={`col-${showSidebar ? "10" : "11"} mr-0 pr-0`}>
          <button
            className="rounded-pill"
            disabled={showSuccessModal}
            onClick={toggleSidebar}
          >
            {" "}
            {showSidebar ? (
              // If the sidebar is expanded, show the close icon
              <FontAwesomeIcon icon={faTimes} className="toggle-icon" />
            ) : (
              // If the sidebar is collapsed, show the open icon
              <FontAwesomeIcon icon={faBars} className="toggle-icon" />
            )}
          </button>
          <div id="popup" class="ol-popup">
            <a href="#" id="popup-closer" class="ol-popup-closer"></a>
            <div id="popup-content"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
