import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateProject from './CreateProject';
import "./CreateProject.css"
import Agriproject from './Agriproject/Agriproject';
import CreateAgriculture from '../../CreateAgriculture/CreateAgriculture';
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import Stacking from '../../Stacking/Stacking';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import {
  faBars,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft, faAngleDoubleRight,faFolderOpen,faLayerGroup, faPlusCircle, faTree, faClipboardList
} from "@fortawesome/free-solid-svg-icons";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";

import MainContainer from '../openProject/MainContainer';

Modal.setAppElement("#root");

const Sidebar = () => {


// apicall for froject Id//
const [nextProjectId, setNextProjectId] = useState('');

  const [currentPage, setCurrentPage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isActives, setIsActives] = useState(false);
  // show sidebar//
  const [showSidebar, setShowSidebar] = useState(true);


  const [isTrue, setIsTrue] = useState(false);

  const handleOpenProjectClick = () => {
    setIsTrue(true);
    setCurrentPage('OpenProject');
  };


  const handleCreateProjectClick = async () => {
    try {
     
      setCurrentPage('CreateAgriculture');
      const response = await axios.get('http://127.0.0.1:8000/createproject/wcgetnextprojectid/'); // Make the API call to open the project
      const {next_project_id } = response.data; // Extract the project ID from the API response
      setNextProjectId(next_project_id); // Set the project ID in the component state
    } catch (error) {
      console.error('Error opening project:', error);
    }
  };
  const handleSuccess = (newProjectId) => {
    setNextProjectId(newProjectId);
  };
  const renderPage = () => {

    switch (currentPage) {
      case 'CreateAgriculture':
        return <Agriproject closeForm={() => setCurrentPage('')} projectId={nextProjectId} onSuccess={handleSuccess}/>;
        
      case 'OpenProject':
        return <MainContainer closeForm={() => setCurrentPage('')} isTrue={isTrue} setIsTrue={setIsTrue} />;
      case 'Stacking':
        return <Stacking />;
      case 'Contact':
        return <CreateAgriculture />;
      default:
        return (<>
          <div className='BackgroundAgricontainer' >
           <img className="backgroundAgriimage" src="https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2022/01/MAR-7834-body-image-BP_GIS-in-Agriculture_UPD-Featured-1.jpg" alt="Default" style={{ width: '100%', filter:"  brightness(0.5)", height:"976px"}} />
           <div className="overlay-text">Welcome to the Agriculture Portal</div>
         </div>
         </>)
    }
  };







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
  //api integration///
 

  return (
    <div className='d-flex'>
      <div className='SidebarContainer'>
      <div 
      className={`SidebarMenu ${showSidebar ? 'expanded' : 'collapsed'}`}
      // className={`col-lg-${showSidebar ? "2" : "1"} SidebarMenu `}
      >
        <div className="pt-2">
          <div className="mt-4 ">


            <div className="d-flex align-items-center justify-content-center mx-0 px-0">
              {" "}
              <img className="agrilogoSidebar " src="agrilogonew.png"></img>
            </div>





            <div className=" d-flex align-items-center justify-content-center ">
              <p className="Agrihedingnav">Agriculture</p>
            </div>
            <hr className='AgricultureSidebar' style={{border:"1px solid green"}}></hr>
          </div>
          <div className='Agrisidebarnav mt-5'>
          <div className='row sectionOfAgrisidebar mr-0'>
            <div className='col-lg-2 mt-1'>
            <FontAwesomeIcon
              className="iconForCreateproject ml-3"
              icon={faPlusCircle}
              style={{
            
                color: currentPage === 'CreateAgriculture' ? "green" : 'darkslategray',
              }}
              
            />
            </div>
            
<div className='col-lg-10 mt-4'>
<button
              type="button"

              className={currentPage === 'CreateAgriculture' ? "buttons active" : "ButtonOfCreateProject"}
              // onClick={() => setCurrentPage('CreateAgriculture')}

            onClick={handleCreateProjectClick}
            >
              Create Project
            </button>

</div>

           
          </div>


          <div className='row my-4 sectionOfAgrisidebar mr-0 '>
            <div className='col-lg-2 mt-1'>
            <FontAwesomeIcon
              className="iconForCreateproject ml-3"
              icon={faFolderOpen}
              style={{
            
                color: currentPage === 'OpenProject' ? "green" : 'darkslategray',
              }}
            />
            </div>
           <div className='col-lg-10 mt-4'>
           <button
              type="button"

              className={currentPage === 'OpenProject' ? "buttons active" : "ButtonOfCreateProject"}
             
              onClick={handleOpenProjectClick}

            // onClick={handleSubmitButtonClick}
            >
              Open Project
            </button>
           
           </div>

           
            

          </div>


          <div 
          className='row my-4 sectionOfAgrisidebar mr-0'
          >
            <div className='col-lg-2 mt-1'>
            <FontAwesomeIcon
           className="iconForCreateproject ml-3"
            
            style={{
            
              color: currentPage === 'Stacking' ? "green" : 'darkslategray',
            }}
              // className="iconForCreateproject mr-3 "
              icon={faLayerGroup}
            />
            </div>
            
  <div className='col-lg-10 mt-4'>
  <button
              type="button"

              className={currentPage === 'Stacking' ? "buttons active" : "ButtonOfCreateProject"}
              onClick={() => setCurrentPage('Stacking')}


            >
              Layer Stacking
            </button>
  </div>

            

          </div>
          <div 
          className='row my-4 sectionOfAgrisidebar mr-0'
          >
            <div className='col-lg-2 mt-1'>
            <FontAwesomeIcon
          className="iconForCreateproject ml-3"
            
            style={{
            
              color: currentPage === 'ndvi' ? "green" : 'darkslategray',
            }}
              // className="iconForCreateproject mr-3 "
              icon={faTree}
            />
            </div>
            
  <div className='col-lg-10 mt-4'>
  <button
              type="button"

              className={currentPage === 'ndvi' ? "buttons active" : "ButtonOfCreateProject"}
              onClick={() => setCurrentPage('')}


            >
              NDVI
            </button>
  </div>

            

          </div>
          <div 
          className='row sectionOfAgrisidebar mr-0'
          >
            <div className='col-lg-2 mt-1'>
            <FontAwesomeIcon
          className="iconForCreateproject ml-3"
            
            style={{
            
              color: currentPage === 'Classification' ? "green" : 'darkslategray',
            }}
              // className="iconForCreateproject mr-3 "
              icon={faClipboardList}
            />
            </div>
            
  <div className='col-lg-10 mt-4'>
  <button
              type="button"

              className={currentPage === 'classification' ? "buttons active" : "ButtonOfCreateProject"}
              onClick={() => setCurrentPage('')}


            >
              Classification
            </button>
  </div>

            

          </div>
          </div>
         


        </div>
      </div>
      </div>
     
      {/* <div className="sidebar">
        <ul>
          <li onClick={() => setCurrentPage('Home')}>Home</li>
          <li onClick={() => setCurrentPage('About')}>About</li>
          <li onClick={() => setCurrentPage('Contact')}>Contact</li>
        </ul>
      </div> */}
      <div className="maincontent ">

        <div 
        className='
        center-content'>
          {/* <div className='col p-0 m-0'> */}
          {renderPage()}
          {/* </div> */}
        </div>



      



      </div>



    </div>
  )
}

export default Sidebar;