import React,{useState, useEffect} from 'react';
import "./CreateAgriculture.css"

const CreateAgriculture = ({ closeForm }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10); // Get current date
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time
    return { currentDate, currentTime };
  };

  // State variables to store date and time values
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');

  // Set current date and time on component mount
  useEffect(() => {
    const { currentDate, currentTime } = getCurrentDateTime();
    setDateValue(currentDate);
    setTimeValue(currentTime);
  }, []);
  // for year selection//
  const currentYear = new Date().getFullYear();

  // Start from June 2016
  const startYear = 2010;

  // End at 2024
  const endYear = 2024;

  // Initialize options array
  const options = [<option key="default" value="">Select a year</option>];

  // Loop through each year
  for (let year = startYear; year <endYear; year++) {
    // Generate the label for each option
    let label = '';
    if (year === startYear) {
      label = `June ${year} - May ${year + 1}`;
    } else if (year === endYear) {
      label = `June ${year - 1} - May ${year}`;
    } else {
      label = `June ${year} - May ${year + 1}`;
    }

    // Push the option to the options array
    options.push(<option key={year} value={year}>{label}</option>);
  }
  //time //
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Function to get the current time in HH:MM:SS format
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
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
  // for folder upload//
 
  
  
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [projectInfoFolderPath, setProjectInfoFolderPath] = useState('');
  const [message, setMessage] = useState('');
  const [createAoIFolder, setCreateAoIFolder] = useState();
  const [aoIFolderPath, setAoIFolderPath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createGTFolder, setCreateGTFolder] = useState();
  const [createGISFolder, setCreateGISFolder] = useState(false);
  const [gtFolderPath, setGTFolderPath] = useState('');
  const [gisFolderPath, setGISFolderPath] = useState('');
 
  const selectDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      console.log('Directory selected:', handle);
      setDirectoryHandle(handle);

      const directoryName = handle.name || 'Unknown Directory';
      const filesystemName = handle.filesystem?.name || '';
      const filesystemInfo = filesystemName ? `(${filesystemName})` : '';
      setSelectedFolderName(`${directoryName} ${filesystemInfo}`);
      setErrorMessage('');
    } catch (error) {
      if (error.name === 'AbortError') {
        setErrorMessage('Directory selection canceled by the user.');
      } else {
        console.error('Error selecting directory:', error);
        setErrorMessage('Error selecting directory: ' + error.message);
      }
    }
  };

  const createFolder = async () => {
    if (!directoryHandle) {
      setErrorMessage('Please select a directory first.');
      return;
    }
    if (!projectName) {
      setErrorMessage('Please enter a project name.');
      return;
    }

    try {
      const projectFolderHandle = await directoryHandle.getDirectoryHandle(projectName, { create: true });
      console.log('Project folder created successfully:', projectFolderHandle);
      const aoIPath = `${selectedFolderName}/${projectName}/AoI`;
      setAoIFolderPath(aoIPath);
      setMessage(`Folder '${projectName}' created successfully in the selected directory!`);

      const projectInfoFolderHandle = await projectFolderHandle.getDirectoryHandle('ProjectInfo', { create: true });
      console.log('Project info folder created successfully:', projectInfoFolderHandle);
      setProjectInfoFolderPath(`${selectedFolderName}/${projectName}/ProjectInfo`);

      return projectFolderHandle; // Return the handle to be used by the checkbox change handler
    } catch (error) {
      console.error('Error creating folder:', error);
      setErrorMessage('Error creating folder: ' + error.message);
    }
  };

  const createAoIFolderInProject = async (projectFolderHandle) => {
    try {
      const AoIFolderHandle = await projectFolderHandle.getDirectoryHandle('AoI', { create: true });
      console.log('AoI folder created successfully inside project:', AoIFolderHandle);
      const aoIPath = `${selectedFolderName}/${projectName}/AoI`;
      setAoIFolderPath(aoIPath);
      setMessage(`AoI folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating AoI folder:', error);
      setMessage('Error creating AoI folder: ' + error.message);
    }
  };

  const handleCheckboxChange = async (e) => {
    setCreateAoIFolder(e.target.checked);
    if (e.target.checked) {
      try {
        let projectFolderHandle;
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(projectName);
        } catch {
          projectFolderHandle = await createFolder();
        }
        await createAoIFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };

  const handleGTFolderCheckboxChange = async (e) => {
    setCreateGTFolder(e.target.checked);
    if (e.target.checked) {
      try {
        let projectFolderHandle;
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(projectName);
        } catch {
          projectFolderHandle = await createFolder();
        }
        await createGTFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };

  const handleGISFolderCheckboxChange = async (e) => {
    setCreateGISFolder(e.target.checked);
    if (e.target.checked) {
      try {
        let projectFolderHandle;
        try {
          projectFolderHandle = await directoryHandle.getDirectoryHandle(projectName);
        } catch {
          projectFolderHandle = await createFolder();
        }
        await createGISFolderInProject(projectFolderHandle);
      } catch (error) {
        console.error('Error accessing project folder:', error);
        setMessage('Error accessing project folder: ' + error.message);
      }
    }
  };

  const createGTFolderInProject = async (projectFolderHandle) => {
    try {
      const GTFolderHandle = await projectFolderHandle.getDirectoryHandle('GT', { create: true });
      console.log('GT folder created successfully inside project:', GTFolderHandle);
      const gtPath = `${selectedFolderName}/${projectName}/GT`;
      setGTFolderPath(gtPath);
      setMessage(`GT folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GT folder:', error);
      setMessage('Error creating GT folder: ' + error.message);
    }
  };

  const createGISFolderInProject = async (projectFolderHandle) => {
    try {
      const GISFolderHandle = await projectFolderHandle.getDirectoryHandle('GIS Mask or Basemap', { create: true });
      console.log('GIS folder created successfully inside project:', GISFolderHandle);
      const gisPath = `${selectedFolderName}/${projectName}/GIS Mask or Basemap`;
      setGISFolderPath(gisPath);
      setMessage(`GIS folder created successfully inside project.`);
    } catch (error) {
      console.error('Error creating GIS folder:', error);
      setMessage('Error creating GIS folder: ' + error.message);
    }
  };

  
  const handleUploadAoi = async () => {
    try {
        if (!aoIFolderPath) {
            setMessage('Please create the AoI folder first.');
            return;
        }

        // Open file picker instead of directory picker
        const [fileHandle] = await window.showOpenFilePicker();
        const projectFolderHandle = await directoryHandle.getDirectoryHandle(projectName);
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

  const [addformData, setAddFormData] = useState([]);

  const handleAddButtonClick = () => {
    const newName = `UU${addformData.length + 1}`;
    setAddFormData([...addformData, { name: newName }]);
  };
  // const handleClearButtonClick = () => {
  //   setAddFormData(addformData.slice(1));
  // };
  const handleClearButtonClick = () => {
    const newAddFormData = [...addformData];
    newAddFormData.pop();
    setAddFormData(newAddFormData);
  };
  
  const handleClose = () => {
    closeForm(); 
  };
 /////////////////////////////////////////////
  const [formData, setFormData] = useState({
    projectName: '',
    selectedFolderName: '',
    projectInfoFolderPath: '',
    createAoIFolder: false,
    createGTFolder: false,
    createGISFolder: false,
    // Add more fields as needed
  });
  const [showFormData, setShowFormData] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleCheckInfo = () => {
    setShowFormData(true);
  };

  const handleEditInfo = () => {
    setShowFormData(false);
  };
  return (
    <div>
         <div class="d-flex  mx-5 justify-content-center my-5">
        <div class="Agriform mb-5" >
         
            <div className='row mx-auto'>
                <div className='col-lg-1 p-0'><img className='agrilogo ' src="agrilogonew.png"></img></div>
                <div className='col-lg-3 fw-bold p-0 mt-4'><p className='font-weight-bold Agri-Heading'>Agriculture-Create Project</p></div>
                <div className='col-lg-8 AgriClose' onClick={handleClose} >X</div>
            </div>
            <div className='bg-info'>
           <div className='row mx-auto py-3'>
            <div className='col my-auto'><button className='w-100'>Project Information</button></div>
            <div className='col my-auto'><button className='w-100'>Project Inputs</button></div>
            <div className='col my-auto'><button className='w-100'>Project Management </button></div>
           </div>
           
          
          
          <div class="mx-3">
           
          
          </div>
          <div>
      <div>
        <label htmlFor="projectName">Project Name:</label>
        <input 
          id="projectName"
          type="text" 
          placeholder="Enter project name" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="selectedFolder">Selected Folder:</label>
        <input 
          id="selectedFolder"
          type="text" 
          placeholder="Selected folder" 
          value={selectedFolderName}
          readOnly
        />
        <button onClick={selectDirectory}>Select Folder</button>
      </div>
      <div>
        <label htmlFor="projectInfoFolder">Project Info Folder:</label>
        <input 
          id="projectInfoFolder"
          type="text" 
          placeholder="Project info folder" 
          value={projectInfoFolderPath}
          readOnly
        />
      </div>
      <div>
        <input 
          type="checkbox" 
          id="createAoIFolder"
          checked={createAoIFolder}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="createAoIFolder">Create AoI Folder</label>
        {createAoIFolder && (
          <>
            <input 
              type="text"
              value={aoIFolderPath}
              readOnly
            />
            <button onClick={handleUploadAoi}>Upload AOI</button>
          </>
        )}
      </div>
      <div>
        <input 
          type="checkbox" 
          id="createGTFolder"
          checked={createGTFolder}
          onChange={handleGTFolderCheckboxChange}
        />
        <label htmlFor="createGTFolder">Create GT Folder</label>
      </div>
      <div>
        <input 
          type="checkbox" 
          id="createGISFolder"
          checked={createGISFolder}
          onChange={handleGISFolderCheckboxChange}
        />
        <label htmlFor="createGISFolder">Create GIS Mask or Basemap Folder</label>
      </div>
      {gtFolderPath && <p>GT Folder Path: {gtFolderPath}</p>}
      {gisFolderPath && <p>GIS Mask or Basemap Folder Path: {gisFolderPath}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      {aoIFolderPath && <p>AoI Folder Path: {aoIFolderPath}</p>}
    </div>

         
          </div>
        </div>
      </div>
      <div 
                                  class="Asign_Autherise  border-0"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                 
                                 
                                >
                                    {/* {addformData.map((item, index) => (
       <div className="Section_TwoMAnagement " key={index}>
       <div className="row mx-3">
           <div className="col-lg-1 p-0 mt-0 1 text-left">
            <p className="mt-4"><strong>{item.name}</strong></p>
             
           </div>
           <div className="col-lg-2 p-0 1 mt-4">
            <input className="w-75 border-0" type="text"  />
             
           </div>
           <div className="col-lg-1 p-0 text-center">
                <input type="checkbox" className="mt-4" id="a"   />
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id="b" />
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id="c" />
                 
               </div>
               <div className="col-lg-2  text-center">
               <input type="checkbox" className="mt-4" id="d" />
                 
               </div>
               <div className="col-lg-1  text-center">
               <input type="checkbox" className="mt-4" id="e" />
               </div>
               <div className="col-lg-1  text-center">
               <input type="checkbox" className="mt-4" id="f" />
               </div>
          
         
         </div>
       </div>
    ))} */}
                                </div>
                                <div>
      {!showFormData && (
        <form>
          {/* Form fields */}
          <label htmlFor="projectName">Project Name:</label>
          <input 
            type="text" 
            name="projectName" 
            value={formData.projectName} 
            onChange={handleChange} 
            required 
          />
          {/* Add more form fields as needed */}

          <button type="button" onClick={handleCheckInfo}>Check Info</button>
        </form>
      )}

      {showFormData && (
        <div>
          <h6>Form Data</h6>
          {/* Display form data */}
          <p>Project Name: {formData.projectName}</p>
          <p>Selected Folder: {formData.selectedFolderName}</p>
          <p>Project Info Folder: {formData.projectInfoFolderPath}</p>
          <p>Create AoI Folder: {formData.createAoIFolder ? 'Yes' : 'No'}</p>
          <p>Create GT Folder: {formData.createGTFolder ? 'Yes' : 'No'}</p>
          <p>Create GIS Folder: {formData.createGISFolder ? 'Yes' : 'No'}</p>
          {/* Add more fields as needed */}

          <button onClick={handleEditInfo}>Edit Info</button>
        </div>
      )}
    </div>
    
    <div className="row d-flex justify-content-space-evenly my-4 mx-auto">
      <div className="col"><button id="addButton" className="btn rounded AgriNext p-0 px-3" onClick={handleAddButtonClick}>Add</button></div>
      <div className="col-lg-1"><button onClick={handleClearButtonClick} className="btn rounded AgriCancel p-0 px-3">Clear</button></div>
    </div>
  <div><button>Create Project</button></div>
    </div>
  )
}

export default CreateAgriculture