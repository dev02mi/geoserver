import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';


function CenteredForm({ isIconRotated, toggleDropdownId, isOpenidform, setInputValue, inputValue, ProjectIdhandler,onReceiveProjectInfo }) {


    const [projectId, setProjectId] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [projectIds, setProjectIds] = useState([]);
    const handleInputChange = (event) => {
        setProjectId(event.target.value);
    };

    const handleSubmit = async (event) => {
        ProjectIdhandler()
        event.preventDefault();
        setLoading(true);
        setError(null);
        setProjectInfo(null);

        const apiUrl = `http://127.0.0.1:8000/createproject/wcallprojectdata/?PROJECT_ID=${projectId}`;
                console.log("apiUrl", )
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
            const responseData = await response.json();
            const { WC_project_information_Input, WC_project_management } = responseData;
            // const { project_information, project_inputs, project_management } = responseData;
            // const combinedData = {
            //     ...project_information,
            //     ...project_inputs,
            //     project_management
            // };

            const combinedData = {
                ...WC_project_information_Input,
                WC_project_management
            };
            onReceiveProjectInfo(combinedData);
            // const data = await response.json();
            // console.log('Project Info from API:', data)
            // onReceiveProjectInfo(data);
            // setProjectInfo(data);
            console.log('Project Info:', WC_project_management);
            
        } catch (error) {
            setError(error.message);
            console.error('There was an error!', error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (value) => {
        setProjectId(value); // Update projectId state with selected value
        setInputValue(value); // Update input value state with selected value
        toggleDropdownId(); // Close the dropdown after selecting an item
        // Optionally reset icon rotation state if needed
    };
    useEffect(() => {
        const fetchProjectIds = async () => {
            try {
                const apiUrl = 'http://127.0.0.1:8000/createproject/wcgetprojectids';
                const response = await fetch(apiUrl);
                console.log(apiUrl ,"chhaya")
                if (!response.ok) {
                    throw new Error('Failed to fetch project IDs');
                }
                const data = await response.json();
                setProjectIds(data); // Assuming data is an array of project IDs like ["AGRI0001", "AGRI0002", ...]
            } catch (error) {
                console.error('Error fetching project IDs:', error);
                // Optionally handle error state here
            }
        };

        fetchProjectIds();
    }, []);
    return (


        <div
            className="d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100"

        >
            <div className=" col-5 bg-white p-5 rounded Form_shadow">

                <div className='p-3 bg-secondary text-white rounded '>
                    <h4 className=''>Please enter the Project  ID to open the project</h4>
                </div>

                <div className="my-5">

                    <div className=" LIst_input_text position-relative d-flex justify-content-center align-items-center">
                        <input
                            className="project_input"
                            value={projectId}
                    onChange={handleInputChange}
                    placeholder="Enter Project ID"
                    required
                            // placeholder='Project ID'
                            // type="text"
                            // value={inputValue}
                            // onChange={(e) => setInputValue(e.target.value)}
                        />
                        <span
                            className={`icon_Projectid ${isIconRotated ? 'rotate' : ''}`}
                            onClick={toggleDropdownId}
                        >
                            <FontAwesomeIcon icon={faAngleDown} />
                        </span>
                    </div>
                    {isOpenidform && (
                        <ul className="List_ProjectId">
                            {projectIds.map((id, index) => (
                                <li key={id} >
                                    <a href="#" onClick={() => handleItemClick(id)}>
                                        {id}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* {isOpenidform && (
                        <ul className="List_ProjectId">
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0001')}>AGRI0001</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0002')}>AGRI0002</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0003')}>AGRI0003</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0004')}>AGRI0004</a></li>
                        </ul>
                    )} */}
                    {/* {isOpenidform && (
                        <ul className="List_ProjectId">
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0101')}>AGRI0101</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('AGRI0101')}>6457</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('5464787')}>5464787</a></li>
                            <li><a className="" href="#" onClick={() => handleItemClick('5676')}>5676</a></li>
                        </ul>
                    )} */}

                </div>

                <button
                    type="submit"
                    className={`ms-2 btn   ${!projectId.trim() ? "btn-secondary" : "btn-success"} px-5`}
                    disabled={!projectId.trim()}
                    // onClick={ProjectIdhandler} 
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                {projectInfo && (
            <div>
                <p>ID: {projectInfo.id}</p>
                <p>PROJECT_ID: {projectInfo.PROJECT_ID}</p>
                <p>PROJECT_NAME: {projectInfo.PROJECT_NAME}</p>
                <p>CREATION_DATE: {new Date(projectInfo.CREATION_DATE).toLocaleString()}</p>
                <p>CREATED_BY: {projectInfo.CREATED_BY}</p>
                <p>PROJECT_DESCRIPTION: {projectInfo.PROJECT_DESCRIPTION}</p>
                <p>CLIENT_ORGANIZATION: {projectInfo.CLIENT_ORGANIZATION}</p>
                <p>EXECUTED_ORGANIZATION: {projectInfo.EXECUTED_ORGANIZATION}</p>
                <p>CROPPING_YEAR: {projectInfo.CROPPING_YEAR}</p>
                <p>CROPPING_SEASON: {projectInfo.CROPPING_SEASON}</p>
                <p>AREA_INFORMATION: {projectInfo.AREA_INFORMATION}</p>
            </div>
        )}
            </div>
        </div>
    );
}

export default CenteredForm;
