import React, { useState, useEffect } from "react";
import "./Newagri.css";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import {
  faBars,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { faTimes, faMapLocation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
// import NdviComponent from "../Agri_Applications/NDVI/NdviComponent.js";
import { Link } from "react-router-dom";

Modal.setAppElement("#root");

const Newagri = () => {
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleYearCheckboxChange = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(
        selectedYears.filter((selectedYear) => selectedYear !== year)
      );
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  // Function to handle clicks on the dropdown button
  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up and causing the page to reload
    toggleDropdown(); // Toggle the dropdown visibility
    if (!isOpen) {
      e.preventDefault(); // Prevent the default action if the dropdown is not open
    }
  };

  // Function to prevent the default action when clicking on checkboxes
  const preventCheckboxClickDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

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
  const [formData, setFormData] = useState({
    projectClientOrganization: " ",
    projectExecutedOrganization: "",
    ProjectId: "AGRI0001",
    ProjectName: "",
    ProjectCreationByAu: "Rajesh_Reddy",
    ProjectDescription: "",
    AreaInformation: "",
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
      setSelectedYearsList(selectedYearsList.filter((y) => y !== year));
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
    const label =
      startDate.toLocaleString("default", { month: "long" }) +
      " " +
      year +
      " - " +
      endDate.toLocaleString("default", { month: "long" }) +
      " " +
      (year + 1);

    yearOptions.push(
      <option key={year} value={year}>
        {label}
      </option>
    );
  }
  return (
    <div>
      <div className="row mt-5">
        {showSidebar && (
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
              {/* Button to trigger the modal */}

              <button
                type="button"
                // className="authsignupbtn"
                className={
                  isActives ? "buttons active" : "ButtonOfCreateProject"
                }
                // onClick={handleClick}
                // className="Administrativeselection"
                onClick={handleSubmitButtonClick}
              >
                Create/Open Project
              </button>

              <div className="ndvi-menu">
                <FontAwesomeIcon
                  className="iconForCreateproject mr-3"
                  icon={faMapLocation}
                />
                {/* <button
                  type="button"
                  // className="authsignupbtn"
                  className={
                    isActives ? "buttons active" : "ButtonOfCreateProject"
                  }
                  // onClick={handleClick}
                  // className="Administrativeselection"
                  onClick={handleSubmitButtonClick}
                >
                  NDVI
                </button> */}
                <Link to="/NdviComponent" className="ButtonOfCreateProject">
                  NDVI
                </Link>
              </div>

                  {/* Layer Stacking Button */}
              <div className="ndvi-menu">
                <FontAwesomeIcon
                  className="iconForCreateproject mr-3"
                  icon={faMapLocation}
                />
                <Link to="/Stacking" className="ButtonOfCreateProject">
                  Layer Stack
                </Link>
              </div>

              {/* Success Modal */}
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
                      <div class="Agriform ">
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
                            onClick={handleSuccessModalClose}
                          >
                            X
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
                                height: "475px",
                              }}
                            >
                              <div>
                                <p className="my-5">
                                  To proceed with the form, please click on the
                                  'Pre-information' button.
                                </p>
                              </div>
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
                                <div className="row">
                                  <div className="col-lg-4 p-0 1">
                                    <div className="row ">
                                      <div className="col-lg-4 p-0 text-center">
                                        {" "}
                                        <label className="">
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project ID:
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-8 p-0 text-left">
                                        {" "}
                                        <input
                                          name=" ProjectId"
                                          value={formData.ProjectId}
                                          className="border-0"
                                          type="text"
                                        />
                                      </div>
                                    </div>
                                    {/* <label className='AgriLabel'><span className="required-field">*</span>Project ID:</label>   
                             <input className='w-50' type='text'/> */}
                                  </div>
                                  <div className="col-lg-8  2">
                                    <div className="row ">
                                      <div className="col-lg-4 p-0 mr-0">
                                        {" "}
                                        <label className="">
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project Creation Date and Time :
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-4 p-0 ">
                                        {" "}
                                        <input
                                          className="border-0 w-75 p-0 m-0"
                                          type="date"
                                          value={dateValue}
                                          onChange={(e) =>
                                            setDateValue(e.target.value)
                                          }
                                        />
                                      </div>
                                      <div className="col-lg-4 p-0 ">
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
                                        <label>
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
                                        <label>
                                          {" "}
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project Creation By (AU):
                                        </label>
                                      </div>
                                      <div className="col-lg-7 ml-0 pl-0">
                                        {" "}
                                        <input
                                          name="ProjectCreationByAu"
                                          value={formData.ProjectCreationByAu}
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
                              <div className="Section_Three m-3 text-left">
                                <label className="">Project Description</label>
                                <textarea
                                  name="ProjectDescription"
                                  value={formData.ProjectDescription}
                                  onChange={handleInputChange}
                                  class="form-control scrollable-input border-0"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                ></textarea>
                              </div>
                              <div className="Section_Four m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Project Client Organization:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <input
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
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Project Exicuted Organization:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <input
                                      onChange={handleInputChange}
                                      name="projectExecutedOrganization"
                                      value={
                                        formData.projectExecutedOrganization
                                      }
                                      className="w-50 border-0"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Six m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
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
                                    <div className="YearDropdownWithCheckbox">
                                      <div
                                        className={`dropdown ${isOpen ? "open" : ""
                                          }`}
                                        onClick={handleDropdownClick}
                                      >
                                        <button className="dropdown-toggle">
                                          {selectedYears.length > 0
                                            ? selectedYears.join(", ")
                                            : "Select Years"}
                                        </button>
                                        <div
                                          className="dropdown-menu"
                                          style={{
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                          }}
                                        >
                                          {Array.from(
                                            { length: endYear - startYear + 1 },
                                            (_, i) => startYear + i
                                          ).map((year) => (
                                            <div
                                              key={year}
                                              className="dropdown-item"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`year-${year}`}
                                                value={year}
                                                checked={selectedYears.includes(
                                                  year
                                                )}
                                                onChange={() =>
                                                  handleYearCheckboxChange(year)
                                                }
                                                onClick={
                                                  preventCheckboxClickDefault
                                                }
                                              />
                                              <label htmlFor={`year-${year}`}>
                                                {currentYear === year
                                                  ? "(Current Year) "
                                                  : ""}
                                                {`June ${year} - May ${year + 1
                                                  }`}
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
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Cropping season:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <div className="row">
                                      <div className="col">
                                        <input
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
                                          className="mr-2"
                                          type="checkbox"
                                          id="vehicle4"
                                          name="vehicle4"
                                          value="Boats"
                                          checked
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
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">
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
                                      type="checkbox"
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      {" "}
                                      Area of intrest AOI
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">
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
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      GT (Ground Truth)
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100 border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">UPLOAD</button>
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Six m-3">
                                <div className="row">
                                  <div className="col-lg-3 p-0 m-0 1 text-left">
                                    <input
                                      className="mx-4"
                                      type="checkbox"
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      GIS Mask Or Basemap
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">UPLOAD</button>
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Seven m-3">
                                <div className="row">
                                  <div className="col-lg-3 p-0 m-0 1 text-left">
                                    <input
                                      className="mx-4"
                                      type="checkbox"
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      <span className="required-field">*</span>
                                      Satellite Data
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">UPLOAD</button>
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Nine m-3">
                                <div className="row">
                                  <div className="col-lg-3 p-0 m-0 1 text-left">
                                    <input
                                      className="mx-4"
                                      type="checkbox"
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      Weather Data
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">UPLOAD</button>
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Eight m-3">
                                <div className="row">
                                  <div className="col-lg-3 p-0 m-0 1 text-left">
                                    <input
                                      className="mx-4"
                                      type="checkbox"
                                      id="vehicle1"
                                      name="vehicle1"
                                      value="Bike"
                                    />
                                    <label className="mr-3" for="vehicle1">
                                      Historical Data
                                    </label>
                                  </div>
                                  <div className="col-lg-7 p-0 m-0 2">
                                    <input
                                      className="w-100  border-0"
                                      type="text"
                                    />
                                  </div>
                                  <div className="col-lg-2  3">
                                    <button className=" w-100">UPLOAD</button>
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
                                <div className="row">
                                  <div className="col-lg-4 p-0 1">
                                    <div className="row ">
                                      <div className="col-lg-4 p-0 text-center">
                                        {" "}
                                        <label className="">
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project chhaya:
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-8 p-0 text-left">
                                        {" "}
                                        <input
                                          className="border-0"
                                          type="text"
                                        />
                                      </div>
                                    </div>
                                    {/* <label className='AgriLabel'><span className="required-field">*</span>Project ID:</label>   
                             <input className='w-50' type='text'/> */}
                                  </div>
                                  <div className="col-lg-4  2">
                                    <div className="row ">
                                      <div className="col-lg-6 p-0 mr-0">
                                        {" "}
                                        <label className="">
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project Creation Date:
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-6 p-0 ">
                                        {" "}
                                        <input
                                          className="border-0"
                                          type="date"
                                          value={dateValue}
                                          onChange={(e) =>
                                            setDateValue(e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>
                                    {/* <label className='AgriLabel'><span className="required-field">*</span>Project Creation Date:</label>  
                            <input className='w-50' type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)}/>   */}
                                  </div>
                                  <div className="col-lg-4  3">
                                    {/* <label className='AgriLabel'><span className="required-field">*</span>Project creation Time:</label>  
                            <input className='w-50' type="time" value={timeValue} onChange={(e) => setTimeValue(e.target.value)}/>  */}
                                    <div className="row ">
                                      <div className="col-lg-6 pr-0 mr-0 ">
                                        {" "}
                                        <label className="">
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project Creation Time:
                                        </label>{" "}
                                      </div>
                                      <div className="col-lg-6 pr-0 mr-0 ">
                                        {" "}
                                        <input
                                          className="w-75 border-0"
                                          type="text"
                                          value={currentTime}
                                          readOnly
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
                                        <label>
                                          {" "}
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project rajni:
                                        </label>
                                      </div>
                                      <div className="col-lg-9 pl-0 text-left ">
                                        {" "}
                                        <input
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
                                      <div className="col-lg-4 mr-0 pr-0">
                                        <label>
                                          {" "}
                                          <span className="required-field">
                                            *
                                          </span>
                                          Project Creation :
                                        </label>
                                      </div>
                                      <div className="col-lg-8 ml-0 pl-0">
                                        {" "}
                                        <input
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
                              <div className="Section_Three m-3 text-left">
                                <label className="">Project Description</label>
                                <textarea
                                  class="form-control scrollable-input border-0"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                ></textarea>
                              </div>
                              <div className="Section_Four m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Project Client Organization:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <input
                                      className="w-50 border-0"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Five m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Project Exicuted Organization:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <input
                                      className="w-50 border-0"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Six m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Cropping year:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left ">
                                    <div className="YearDropdownWithCheckbox">
                                      <div
                                        className={`dropdown ${isOpen ? "open" : ""
                                          }`}
                                        onClick={handleDropdownClick}
                                      >
                                        <button className="dropdown-toggle">
                                          {selectedYears.length > 0
                                            ? selectedYears.join(", ")
                                            : "Select Years"}
                                        </button>
                                        <div className="dropdown-menu">
                                          {Array.from(
                                            { length: endYear - startYear + 1 },
                                            (_, i) => startYear + i
                                          ).map((year) => (
                                            <div
                                              key={year}
                                              className="dropdown-item"
                                            >
                                              <input
                                                type="checkbox"
                                                id={`year-${year}`}
                                                value={year}
                                                checked={selectedYears.includes(
                                                  year
                                                )}
                                                onChange={() =>
                                                  handleYearCheckboxChange(year)
                                                }
                                                onClick={
                                                  preventCheckboxClickDefault
                                                }
                                              />
                                              <label htmlFor={`year-${year}`}>
                                                {currentYear === year
                                                  ? "(Current Year) "
                                                  : ""}
                                                {`June ${year} - July ${year + 1
                                                  }`}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    {/* {" "}
                                    <select
                                      className="w-50 border-0"
                                      id="yearRange"
                                    >
                                      {options}
                                    </select> */}
                                  </div>
                                </div>
                              </div>
                              <div className="Section_Seven m-3">
                                <div className="row">
                                  <div className="col-lg-3 mr-0 pr-0 text-left">
                                    <label>
                                      <span className="required-field">*</span>
                                      Cropping season:
                                    </label>
                                  </div>
                                  <div className="col-lg-8 m1-0 pl-0 text-left">
                                    <div className="row">
                                      <div className="col">
                                        <input
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
                                          type="checkbox"
                                          id="vehicle4"
                                          name="vehicle4"
                                          value="Boats"
                                        />
                                        <label className="mr-3" for="vehicle4">
                                          {" "}
                                          Default
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
                                      className="w-100 scrollable-input border-0"
                                      id="exampleFormControlTextarea1"
                                      rows="3"
                                    ></textarea>
                                  </div>
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
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleLeft}
                                      />
                                      Back
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
                                  <div className="col">
                                    <button
                                      disabled={!isFormValid()}
                                      className="AgriNext"
                                      onClick={handleNextButtonClick}
                                    >
                                      Next
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleRight}
                                      />
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
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleLeft}
                                      />
                                      Back
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
                                  <div className="col">
                                    <button
                                      className="AgriNext"
                                      onClick={handleNextButtonClick}
                                    >
                                      Next
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleRight}
                                      />
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
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleLeft}
                                      />
                                      Back
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
                                  <div className="col">
                                    <button className="AgriFinish">
                                      Finish
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
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="col">
                                    <button
                                      className="AgriNext"
                                      onClick={handleNextButtonClick}
                                    >
                                      Next
                                      <FontAwesomeIcon
                                        className="Iconnextandprevious"
                                        icon={faAngleDoubleRight}
                                      />
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
            </div>
          </div>
        )}
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

export default Newagri;
