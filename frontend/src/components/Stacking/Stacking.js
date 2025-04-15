// src/App.js
import React, { useState, useEffect } from "react";
import "./Stacking.css";
import Button from 'react-bootstrap/Button';
import axios from "axios";
import Preloader from "../Preloader/Preloader";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'; // Import your icons here
import Swal from 'sweetalert2';

// import React, { useState } from 'react';


// const Stacking = () => {
//     const [file, setFile] = useState([]);
//     const [inputImage, setInputImage] = useState(null);
//     const [outputFolder, setOutputFolder] = useState('');
//     const [allBands, setAllBands] = useState([]); // New state for all bands across images
//     const [textareaValue, setTextareaValue] = useState('');
//     const [previousValue, setPreviousValue] = useState('');
//     const [value, setValue] = useState('All');
//     const [output_value, setoutputValue] = useState('');
//     const [imageCount, setImageCount] = useState(0);

//     const handleInputFolderSelect = async (e) => {
//         const selectedFilesArray = Array.from(e.target.files);
//         setFile(selectedFilesArray);
//         console.log("fileNames ", selectedFilesArray);

//         try {
//             const files = document.getElementById("input-folder").files;
//             const formData = new FormData();
//             let currentCount = imageCount;

//             for (let i = 0; i < files.length; i++) {
//                 currentCount++;
//                 formData.append("file", files[i]);
//             }

//             setImageCount(currentCount);

//             const response = await axios.post(
//                 "http://127.0.0.1:8000/layerstacking/stacking/",
//                 formData,
//                 {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );

//             if (response.status === 200) {
//                 const res = response.data.band_names;
//                 setAllBands(prevBands => [...new Set([...prevBands, ...res])]); // Update all bands
//                 setInputImage(selectedFilesArray[0]);
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };



//     const handleOutputFolderSelect = (e) => {
//         setOutputFolder(e.target.files[0].path);
//     };

//     const drophandleChange = (event) => {
//         const selectedValue = event.target.value;
//         setValue(selectedValue);
//     };

//     const Output_drophandleChange = (event) => {
//         setoutputValue(event.target.value);
//     };

//     console.log("Output resp", allBands);

//     const generateImageName = (bandName, count) => {
//         return `${bandName} img${count}`;
//     };


//     // Define a state to track the number of times "All" is clicked
//     const [allClickCount, setAllClickCount] = useState(0);

//     const handleAddClick = () => {
//         if (value === "All") {
//             const allImageNames = allBands.flatMap(band =>
//                 Array.from({ length: imageCount }, (_, index) => generateImageName(band, index + 1))
//             );

//             setTextareaValue(prevValue => {
//                 const existingNames = prevValue ? prevValue.split('\n') : [];
//                 const updatedNames = [...existingNames, ...allImageNames];
//                 return updatedNames.join('\n');
//             });

//             // Increment the click count when "All" is clicked
//             setAllClickCount(prevCount => prevCount + 1);
//         } else {
//             const imageName = generateImageName(value, imageCount);
//             setTextareaValue(prevValue => {
//                 return prevValue ? prevValue + '\n' + imageName : imageName;
//             });
//         }
//     };




//     const handleClearClick = () => {
//         setTextareaValue("");
//         setPreviousValue("");
//     };


//     return (
//         <div className="App-stack container mt-5">
//             <div className="container-fluid Fields-stack">
//                 <form>
//                     <div className="form-row">
//                         <div className="form-group col-md-6">
//                             <label htmlFor="input-folder">Input File:</label>
//                             <div className="file-input">
//                                 <input
//                                     id="input-folder"
//                                     type="file"
//                                     // accept=".tif,.tiff"
//                                     onChange={handleInputFolderSelect}
//                                     multiple
//                                 />
//                                 <input
//                                     type="text"
//                                     className="form-control inputField"
//                                     value={inputImage ? inputImage.name : ''}
//                                     readOnly
//                                     placeholder="No file selected"
//                                 />
//                                 <label className="choosefile-stack" htmlFor="input-folder"><FontAwesomeIcon icon={faFolderOpen} /></label>
//                             </div>
//                         </div>
//                         <div className="form-group col-md-6">
//                             <label htmlFor="output-folder">Output File:</label>
//                             <div className="file-input">
//                                 <input
//                                     id="output-folder"
//                                     type="file"
//                                     directory=""
//                                     webkitdirectory=""
//                                     onChange={handleOutputFolderSelect}
//                                 />
//                                 <input
//                                     type="text"
//                                     className="form-control outputField"
//                                     value={outputFolder}
//                                     readOnly
//                                     placeholder="Select output folder"
//                                 />
//                                 <label className=" choosefile-stack" htmlFor="output-folder"><FontAwesomeIcon icon={faFolderOpen} /></label>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label>
//                             Layer:
//                             <select className="drop-layer" value={value} onChange={drophandleChange}>
//                                 <option value="All">All</option>
//                                 {allBands.map((band, index) => (
//                                     <option key={index} value={band}>{band}</option>
//                                 ))}
//                             </select>
//                         </label>
//                     </div>

//                     <div className="form-group text-area-stack">
//                         <textarea className="form-control textarea-input" readOnly value={textareaValue} id="exampleFormControlTextarea1" rows="6"></textarea>
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" onClick={handleAddClick} variant="outline-secondary">Add</Button>
//                             <Button className="text-area-button" onClick={handleClearClick} variant="outline-secondary">Clear</Button>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="label-datatype" htmlFor="inputCity">Data Type:</label>
//                         <div className="form-inline d-flex justify-content-between data-type-stack">
//                             <div className="d-flex justify-content-start">
//                                 <label className="data-types-labels" htmlFor="inputCity">Input:</label>
//                                 <label className="mx-4 data-types-labels" htmlFor="inputCity">Input Values</label>
//                             </div>
//                             <div className="d-flex justify-content-start">
//                                 <label className="data-types-labels" htmlFor="inputZip">Output:</label>
//                                 <select className="drop-layer-output" value={output_value} onChange={Output_drophandleChange}>
//                                     <option value="All">Select</option>
//                                     <option value="1">1</option>
//                                     <option value="2">2</option>
//                                     <option value="3">3</option>
//                                     <option value="4">4</option>
//                                     <option value="5">5</option>
//                                     <option value="6">6</option>
//                                     <option value="7">7</option>
//                                     <option value="8">8</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="label-datatype" htmlFor="inputCity">Output Option:</label>
//                         <div className="form-inline d-flex justify-content-between data-type-stack">
//                             <div className="d-flex justify-content-between">
//                                 <div className="form-check">
//                                     <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel1" value="" aria-label="..." />
//                                     <label className="data-types-labels" htmlFor="radioNoLabel1">Union</label>
//                                 </div>
//                                 <div className="form-check ml-5">
//                                     <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel2" value="" aria-label="..." />
//                                     <label className="data-types-labels" htmlFor="radioNoLabel2">Intersection</label>
//                                 </div>
//                             </div>
//                             <div className="form-check d-flex justify-content-start">
//                                 <input className="form-check-input" type="checkbox" value="" id="gridCheck" />
//                                 <label className="data-types-labels" htmlFor="gridCheck">Ignore Zero in Stats.</label>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group stack-buttons">
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" variant="outline-secondary">OK</Button>
//                             <Button className="text-area-button" variant="outline-secondary">Batch</Button>
//                             <Button className="text-area-button" variant="outline-secondary">AOI...</Button>
//                         </div>
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" variant="outline-secondary">Cancel</Button>
//                             <Button className="text-area-button" variant="outline-secondary">View...</Button>
//                             <Button className="text-area-button" variant="outline-secondary">Help</Button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );


// };

// export default Stacking;


// const Stacking = () => {
//     const [file, setFile] = useState([]);
//     const [inputImage, setInputImage] = useState(null);
//     const [outputFolder, setOutputFolder] = useState('');
//     const [currentBands, setCurrentBands] = useState([]); // State for current image bands
//     const [textareaValue, setTextareaValue] = useState('');
//     const [value, setValue] = useState('All');
//     const [output_value, setOutputValue] = useState('');
//     const [imageCount, setImageCount] = useState(0);
//     const [totalImageCount, setTotalImageCount] = useState(0); // Total count of images uploaded

//     const handleInputFolderSelect = async (e) => {
//         const selectedFilesArray = Array.from(e.target.files);
//         setFile(selectedFilesArray);
//         console.log("fileNames ", selectedFilesArray);

//         try {
//             const files = document.getElementById("input-folder").files;
//             const formData = new FormData();
//             let currentCount = selectedFilesArray.length;

//             for (let i = 0; i < files.length; i++) {
//                 formData.append("file", files[i]);
//             }

//             const response = await axios.post(
//                 "http://127.0.0.1:8000/layerstacking/stacking/",
//                 formData,
//                 {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );

//             if (response.status === 200) {
//                 const res = response.data.band_names;
//                 setCurrentBands(res); // Set current bands to the latest uploaded image bands
//                 setInputImage(selectedFilesArray[0]);
//                 setImageCount(currentCount);
//                 setTotalImageCount(prevCount => prevCount + currentCount);
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleOutputFolderSelect = (e) => {
//         setOutputFolder(e.target.files[0].path);
//     };

//     const drophandleChange = (event) => {
//         const selectedValue = event.target.value;
//         setValue(selectedValue);
//     };

//     const Output_drophandleChange = (event) => {
//         setOutputValue(event.target.value);
//     };

//     console.log("Output resp", currentBands);

//     const generateImageName = (bandName, count) => {
//         return `${bandName} img${count}`;
//     };

//     const handleAddClick = () => {
//         if (value === "All") {
//             const allImageNames = currentBands.flatMap(band =>
//                 Array.from({ length: imageCount }, (_, index) => generateImageName(band, totalImageCount - imageCount + index + 1))
//             );

//             setTextareaValue(prevValue => {
//                 const existingNames = prevValue ? prevValue.split('\n') : [];
//                 const updatedNames = [...existingNames, ...allImageNames];
//                 return updatedNames.join('\n');
//             });
//         } else {
//             const imageName = generateImageName(value, totalImageCount);
//             setTextareaValue(prevValue => {
//                 return prevValue ? prevValue + '\n' + imageName : imageName;
//             });
//         }
//     };

//     const handleClearClick = () => {
//         setTextareaValue("");
//     };

//     return (
//         <div className="App-stack container mt-5">
//             <div className="container-fluid Fields-stack">
//                 <form>
//                     <div className="form-row">
//                         <div className="form-group col-md-6">
//                             <label htmlFor="input-folder">Input File:</label>
//                             <div className="file-input">
//                                 <input
//                                     id="input-folder"
//                                     type="file"
//                                     // accept=".tif,.tiff"
//                                     onChange={handleInputFolderSelect}
//                                     multiple
//                                 />
//                                 <input
//                                     type="text"
//                                     className="form-control inputField"
//                                     value={inputImage ? inputImage.name : ''}
//                                     readOnly
//                                     placeholder="No file selected"
//                                 />
//                                 <label className="choosefile-stack" htmlFor="input-folder"><FontAwesomeIcon icon={faFolderOpen} /></label>
//                             </div>
//                         </div>
//                         <div className="form-group col-md-6">
//                             <label htmlFor="output-folder">Output File:</label>
//                             <div className="file-input">
//                                 <input
//                                     id="output-folder"
//                                     type="file"
//                                     directory=""
//                                     webkitdirectory=""
//                                     onChange={handleOutputFolderSelect}
//                                 />
//                                 <input
//                                     type="text"
//                                     className="form-control outputField"
//                                     value={outputFolder}
//                                     readOnly
//                                     placeholder="Select output folder"
//                                 />
//                                 <label className=" choosefile-stack" htmlFor="output-folder"><FontAwesomeIcon icon={faFolderOpen} /></label>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label>
//                             Layer:
//                             <select className="drop-layer" value={value} onChange={drophandleChange}>
//                                 <option value="All">All</option>
//                                 {currentBands.map((band, index) => (
//                                     <option key={index} value={band}>{band}</option>
//                                 ))}
//                             </select>
//                         </label>
//                     </div>

//                     <div className="form-group text-area-stack">
//                         <textarea className="form-control textarea-input" readOnly value={textareaValue} id="exampleFormControlTextarea1" rows="6"></textarea>
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" onClick={handleAddClick} variant="outline-secondary">Add</Button>
//                             <Button className="text-area-button" onClick={handleClearClick} variant="outline-secondary">Clear</Button>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="label-datatype" htmlFor="inputCity">Data Type:</label>
//                         <div className="form-inline d-flex justify-content-between data-type-stack">
//                             <div className="d-flex justify-content-start">
//                                 <label className="data-types-labels" htmlFor="inputCity">Input:</label>
//                                 <label className="mx-4 data-types-labels" htmlFor="inputCity">Input Values</label>
//                             </div>
//                             <div className="d-flex justify-content-start">
//                                 <label className="data-types-labels" htmlFor="inputZip">Output:</label>
//                                 <select className="drop-layer-output" value={output_value} onChange={Output_drophandleChange}>
//                                     <option value="All">Select</option>
//                                     <option value="1">1</option>
//                                     <option value="2">2</option>
//                                     <option value="3">3</option>
//                                     <option value="4">4</option>
//                                     <option value="5">5</option>
//                                     <option value="6">6</option>
//                                     <option value="7">7</option>
//                                     <option value="8">8</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="label-datatype" htmlFor="inputCity">Output Option:</label>
//                         <div className="form-inline d-flex justify-content-between data-type-stack">
//                             <div className="d-flex justify-content-between">
//                                 <div className="form-check">
//                                     <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel1" value="" aria-label="..." />
//                                     <label className="data-types-labels" htmlFor="radioNoLabel1">Union</label>
//                                 </div>
//                                 <div className="form-check ml-5">
//                                     <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel2" value="" aria-label="..." />
//                                     <label className="data-types-labels" htmlFor="radioNoLabel2">Intersection</label>
//                                 </div>
//                             </div>
//                             <div className="form-check d-flex justify-content-start">
//                                 <input className="form-check-input" type="checkbox" value="" id="gridCheck" />
//                                 <label className="data-types-labels" htmlFor="gridCheck">Ignore Zero in Stats.</label>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-group stack-buttons">
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" variant="outline-secondary">OK</Button>
//                             <Button className="text-area-button" variant="outline-secondary">Batch</Button>
//                             <Button className="text-area-button" variant="outline-secondary">AOI...</Button>
//                         </div>
//                         <div className="mt-4 d-flex justify-content-between">
//                             <Button className="text-area-button" variant="outline-secondary">Cancel</Button>
//                             <Button className="text-area-button" variant="outline-secondary">View...</Button>
//                             <Button className="text-area-button" variant="outline-secondary">Help</Button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

const Stacking = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState([]);
    const [inputImage, setInputImage] = useState(null);
    const [outputFolderPath, setOutputFolder] = useState('');
    const [currentBands, setCurrentBands] = useState([]); // State for current image bands
    const [textareaValue, setTextareaValue] = useState('');
    const [value, setValue] = useState('All');
    const [output_value, setOutputValue] = useState('Unsigned 8 bit');
    const [imageCount, setImageCount] = useState(0);
    const [totalImageCount, setTotalImageCount] = useState(0); // Total count of images uploaded


    const [ImageDataType, setImageDataTypes] = useState('');


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


    const handleInputFolderSelect = async (e) => {
        const selectedFilesArray = Array.from(e.target.files);

        // Check if no files are selected
        if (selectedFilesArray.length === 0) {
            console.log("No files selected. Operation cancelled.");
            return; // Exit the function early
        }

        setFile(selectedFilesArray);
        console.log("fileNames ", selectedFilesArray);

        try {
            setLoading(true);
            setProgress(0);
            // LoaderUpdateProgress();
            const files = document.getElementById("input-folder").files;

            const selectBands = document.getElementById("Selected-Bands-Values").value
            console.log(selectBands)
            const formData = new FormData();
            let currentCount = selectedFilesArray.length;

            for (let i = 0; i < files.length; i++) {
                formData.append("file", files[i]);
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/layerstacking/stacking/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentage); // Update the progress state
                    },
                }
            );

            if (response.status === 200) {
                const res = response.data.band_names;
                setCurrentBands(res); // Set current bands to the latest uploaded image bands

                // const d_type = response.data.data_Type;
                // setImageDataTypes(d_type)

                //_____________________________

                let d_type = response.data.data_Type;
                switch (d_type) {
                    case 'uint1':
                        d_type = 'Unsigned 1 bit';
                        break;
                    case 'uint2':
                        d_type = 'Unsigned 2 bit';
                        break;
                    case 'uint4':
                        d_type = 'Unsigned 4 bit';
                        break;
                    case 'uint8':
                        d_type = 'Unsigned 8 bit';
                        break;
                    case 'uint16':
                        d_type = 'Unsigned 16 bit';
                        break;
                    case 'uint32':
                        d_type = 'Unsigned 32 bit';
                        break;
                    case 'int8':
                        d_type = 'Signed 8 bit';
                        break;
                    case 'int16':
                        d_type = 'Signed 16 bit';
                        break;
                    case 'int32':
                        d_type = 'Signed 32 bit';
                        break;
                    case 'float32':
                        d_type = 'Float Single';
                        break;
                    case 'float64':
                        d_type = 'Float Double';
                        break;
                    case 'complex64':
                        d_type = 'Complex Single';
                        break;
                    case 'complex128':
                        d_type = 'Complex Double';
                        break;
                    default:
                        d_type = 'Unsigned 1 bit';
                }

                setImageDataTypes(d_type);
                setOutputValue(d_type); // Update the output_value state

                //__________________________________

                setInputImage(selectedFilesArray[0]);
                setImageCount(currentCount);
                setTotalImageCount(prevCount => prevCount + currentCount);

                // Set the first band as the default value in the dropdown
                if (res.length > 0) {
                    setValue(res[0]);
                }
            }

            setLoading(false);
            setProgress(100);
        } catch (error) {
            console.error(error);
        }
    };

    // Final click on to generate ouput
    const handleStackingClick = async () => {

        try {
            // LoaderUpdateProgress();
            // setLoading(true);
            // setProgress(0);
            const selectBands = document.getElementById("Selected-Bands-Values").value

            // Check if selectBands is empty
            if (!selectBands.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No data provided',
                    text: 'Please select bands before proceeding.',
                    confirmButtonText: 'OK'
                });
                return; // Exit the function early
            }
            if (!outputFolderPath.trim()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Output Path Required',
                    text: 'Please enter your output path before proceeding.',
                    confirmButtonText: 'OK'
                });
                return;
            }

            LoaderUpdateProgress();
            let cleanedFiles = selectBands.split('\n').map(file => file.trim());
            const response = await axios.post(
                "http://127.0.0.1:8000/layerstacking/stack_bands/",
                {
                    selected_bands: cleanedFiles,
                    outputSavePath: outputFolderPath,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setLoading(false);
                setProgress(100);
                Swal.fire({
                    icon: 'success',
                    title: 'Stacking Completed',
                    text: `Stacking process completed successfully. Your files have been saved to: ${outputFolderPath}`,
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Clear all input data
                    setLoading(false);
                    setProgress(0);
                    setFile([]);
                    setInputImage(null);
                    setOutputFolder('');
                    setCurrentBands([]);
                    setTextareaValue('');
                    setValue('All');
                    setOutputValue('Unsigned 8 bit');
                    setImageDataTypes('');
                });

            }
            // setLoading(false);
            // setProgress(100);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred during the stacking process. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    };


    // const handleOutputFolderSelect = (e) => {
    //     const out_path = getElementById('output_path').value
    //     setOutputFolder(out_path);
    // };
    //  console.log('Output Folder State:', setOutputFolder); // Debugging

    // const handleOutputFolderSelect = (e) => {
    //     const selectedFolderPath = e.target.value;
    //     console.log('Selected Folder Path:', selectedFolderPath); // Debugging
    //     setOutputFolder(selectedFolderPath);
    // };
    console.log('Output Folder State:', outputFolderPath); // Debugging
    

    // layer Dropdown
    const drophandleChange = (event) => {
        const selectedValue = event.target.value;
        setValue(selectedValue);
    };

    // Output Dropdown Values 
    const Output_drophandleChange = (event) => {
        setOutputValue(event.target.value);
    };

    console.log("Output resp", currentBands);
    console.log("Image Data Type Response", ImageDataType);


    // Geenerating Image name
    const generateImageName = (bandName, count) => {
        // return `${bandName} img${count}`;
        return `${inputImage.name} (${bandName})`;
    };

    // Add Bands In Text Area
    const handleAddClick = () => {
        if (value === "All") {
            const allImageNames = currentBands.flatMap(band =>
                Array.from({ length: imageCount }, (_, index) => generateImageName(band, totalImageCount - imageCount + index + 1))
            );

            setTextareaValue(prevValue => {
                const existingNames = prevValue ? prevValue.split('\n') : [];
                const updatedNames = [...existingNames, ...allImageNames];
                return updatedNames.join('\n');
            });
        } else {
            const imageName = generateImageName(value, totalImageCount);
            setTextareaValue(prevValue => {
                return prevValue ? prevValue + '\n' + imageName : imageName;
            });
        }
    };

    // Clear Input Bands (text Area)
    const handleClearClick = () => {
        setTextareaValue("");
    };

    // Cancel Stakcking Progress
    const handleCancelClick = () => {
        Swal.fire({
            icon: 'info',
            title: 'Operation Cancelled',
            text: 'All input data has been cleared.',
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(false);
                setProgress(0);
                setFile([]);
                setInputImage(null);
                setOutputFolder(''); // If you want to clear the output folder as well
                setCurrentBands([]);
                setTextareaValue('');
                setValue('All');
                setOutputValue('Unsigned 8 bit');
                setImageDataTypes('');

                // Reset the file input elements to ensure they can detect new file selections
                document.getElementById("input-folder").value = null;
                document.getElementById("output_path").value = null;
            }
        });
    };
    

    return (
        <div className="App-stack container ">
            <Preloader loading={loading} progress={progress} />
            {/* <div className="set-div_stack"> */}
            <div className="Fields-stack">
                <form>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="input-folder">Input File:</label>
                            <div className="file-input">
                                <input
                                    id="input-folder"
                                    type="file"
                                    // accept=".tif,.tiff"
                                    onChange={handleInputFolderSelect}
                                    multiple
                                />
                                <input
                                
                                    type="text"
                                    className="form-control inputField"
                                    value={inputImage ? inputImage.name : ''}
                                    readOnly
                                    placeholder="No file selected"
                                />
                                <label className="choosefile-stack" htmlFor="input-folder"><FontAwesomeIcon icon={faFolderOpen} /></label>
                            </div>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="output-folder">Output File:</label>
                            <div className="file-input">
                                {/* <input
                                    id="output-folder"
                                    type="file"
                                    directory=""
                                    webkitdirectory=""
                                    // onChange={handleOutputFolderSelect}
                                /> */}
                                
                                <input
                                    type="text"
                                    id = "output_path"
                                    className="form-control outputField"
                                    value={outputFolderPath}
                                    // readOnly
                                    required
                                    onChange={e => setOutputFolder(e.target.value)}
                                    placeholder="Enter your Output Path"
                                />
                                {/* <label className=" choosefile-stack" htmlFor="output-folder"><FontAwesomeIcon icon={faFolderOpen} /></label> */}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            Layer:
                            <select className="drop-layer" value={value} onChange={drophandleChange}>
                                {/* <option value="All">All</option> */}
                                {currentBands.map((band, index) => (
                                    <option key={index} value={band}>{band}</option>
                                ))}
                                <option value="All">All</option>
                            </select>
                        </label>
                    </div>

                    <div className="form-group text-area-stack">
                        <textarea className="form-control textarea-input" readOnly value={textareaValue} id="Selected-Bands-Values" rows="6"></textarea>
                        <div className="mt-4 d-flex justify-content-between">
                            <Button className="text-area-button" onClick={handleAddClick} variant="outline-secondary">Add</Button>
                            <Button className="text-area-button" onClick={handleClearClick} variant="outline-secondary">Clear</Button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label-datatype" htmlFor="inputCity">Data Type:</label>
                        <div className="form-inline d-flex justify-content-between data-type-stack">
                            <div className="d-flex justify-content-start">
                                <label className="data-types-labels" htmlFor="inputCity">Input:</label>
                                <label className="mx-4 data-types-labels" htmlFor="inputCity">{ImageDataType}</label>
                            </div>
                            <div className="d-flex justify-content-start">
                                <label className="data-types-labels" htmlFor="Dtype_output">Output:</label>
                                <select className="drop-layer-output" value={output_value} onChange={Output_drophandleChange}>
                                    <option value="Unsigned 1 bit">Unsigned 1 bit</option>
                                    <option value="Unsigned 2 bit">Unsigned 2 bit</option>
                                    <option value="Unsigned 4 bit">Unsigned 4 bit</option>
                                    <option value="Unsigned 8 bit">Unsigned 8 bit</option>
                                    <option value="Signed 8 bit">Signed 8 bit</option>
                                    <option value="Unsigned 16 bit">Unsigned 16 bit</option>
                                    <option value="Signed 16 bit">Signed 16 bit</option>
                                    <option value="Unsigned 32 bit">Unsigned 32 bit</option>
                                    <option value="Float Single">Float Single</option>
                                    <option value="Float Double">Float Double</option>
                                    <option value="Complex Single">Complex Single</option>
                                    <option value="Complex Double">Complex Double</option>
                                </select>

                            </div>
                        </div>
                    </div>

                    {/* <div className="form-group">
                        <label className="label-datatype" htmlFor="inputCity">Output Option:</label>
                        <div className="form-inline d-flex justify-content-between data-type-stack">
                            <div className="d-flex justify-content-between">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel1" checked value="" aria-label="..." />
                                    <label className="data-types-labels" htmlFor="radioNoLabel1">Union</label>
                                </div>
                                <div className="form-check ml-5">
                                    <input className="form-check-input" type="radio" name="radioNoLabel" id="radioNoLabel2" value="" aria-label="..." />
                                    <label className="data-types-labels" htmlFor="radioNoLabel2">Intersection</label>
                                </div>
                            </div>
                            <div className="form-check d-flex justify-content-start">
                                <input className="form-check-input" type="checkbox" value="" id="gridCheck" />
                                <label className="data-types-labels" htmlFor="gridCheck">Ignore Zero in Stats.</label>
                            </div>
                        </div>
                    </div> */}

                    <div className="form-group stack-buttons">
                        <div className="mt-4  d-flex justify-content-between">
                            <Button className="text-area-button" variant="outline-secondary" onClick={handleStackingClick}>OK</Button>
                            <Button className="text-area-button" variant="outline-secondary" onClick={handleCancelClick} >CANCEL</Button>
                            {/* <Button className="text-area-button" variant="outline-secondary">Batch</Button>
                            <Button className="text-area-button" variant="outline-secondary">AOI...</Button> */}
                        </div>
                        {/* <div className="mt-4 d-flex justify-content-between">
                            <Button className="text-area-button" variant="outline-secondary">Cancel</Button>
                            <Button className="text-area-button" variant="outline-secondary">View...</Button>
                            <Button className="text-area-button" variant="outline-secondary">Help</Button>
                        </div> */}
                    </div>
                </form>
            </div>
            {/* </div> */}
        </div>
    );
};


export default Stacking;
