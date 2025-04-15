import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import "./GpAudralaComp.css"; // Import the CSS file
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCloud,
    faCircle,
    faSnowflake,
    faChevronDown,
    faWindowRestore,
    faCircleInfo,
    faChevronUp,
    faSpinner,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import L from "leaflet";
import { none } from "ol/centerconstraint";
import { useSelector } from "react-redux";
import { useMap } from "../../UseContext/MapContext"; // Adjust the import path as needed


import ShreveOrder from '../../../asset/SVG_Icons_64/Shreve_order_128.png'
import StrahlerOrder from '../../../asset/SVG_Icons_64/Strahler_order_128.png'


const GpAudralaComp = ({ onAction,onAction_ord, onhandleselectPourpoint, isLoading, onDataChange }) => {

    const { selected_pour_point, FileName } = useSelector((state) => state.drag)
    console.log("data_pouring", selected_pour_point)
    console.log("FileName", FileName)
    // const [sessionId, setSessionId] = useState(null); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [file_data, setFile] = useState("");    //Select File

    const { mapRef, fileLayersMap } = useMap(); // Access context values
    const groupColorsLegendsline = { ...fileLayersMap.current.get(`${file_data.name}_LineString`) } || {};
    // const groupColorsLegendsline = { ...fileLayersMap.current.get("AWS_DRAINERR.zip_LineString") } || {};
    const GrouplineLegend = groupColorsLegendsline?.groupColorsLegendsline || {};
    console.log("groupColorsLegendsline::::", groupColorsLegendsline);
    // console.log("fileLayersMap::::", fileLayersMap)
    const [info, setInfo] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const [webbsocket, setwebbsocket] = useState("");
    const [Files_name, setFiles_name] = useState("");
    

      const fetchCookie = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/set-cookie/", {
                method: "POST",
                credentials: "include", // Include cookies in the request
            });
            console.log("_____________________RESPONSE",response)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response from server:__________________", data.sessionid);
            if (data.sessionid){
                const webSocketUrl = `ws://127.0.0.1:9000/ws/gis/`;
                const webSocket = new WebSocket(webSocketUrl, [], {      
                    });

          webSocket.onopen = () => {
            console.log("WebSocket connection opened.");
            // setIsConnected(true);
          //   webSocket.send(JSON.stringify({ type: "INIT", message: "Hello from GpAudralaComp" }));
          };


          webSocket.onmessage = (event) => {
            console.log("Message received from WebSocket:", event.data);
            setwebbsocket(event.data);
            // Parse the message as JSON
            const message = JSON.parse(event.data);
            
            if (message.type === "chat.message") {  
                console.log("Chat message received:", message.text);
                // alert("New Chat Message: " + message.text);
                console.log("task_id: ", message.task_id);
                if (message.task_id){setFiles_name(message.task_id);}
            }
               else {
                  // Handle other message types
                  //console.log("Other message type:", message);
              }
            // Handle different types of messages
            if (message.type === "websocket.send") {
                // Here, we get the 'Operation done!' message from the server
                console.log("Operation complete:", message.text);
                // Optionally, show this message to the user, for example, in an alert or UI update
                alert(message.text);  // This will show an alert with 'Operation done!'
            } else {
                // Handle other message types
                console.log("Other message type:", message);
            }
        };
          webSocket.onclose = () => {
            console.log("WebSocket connection closed.");
            // setIsConnected(false);
          };
          wsRef.current = webSocket;
            }
        
            else{
                alert("No response from server WebSocket");
            }

            console.log("Response from server:", data);
            // Optionally, you can update the state with the session ID or data
            // setSessionId(data.sessionid);
        } catch (error) {
            console.error("Error in fetch request:", error);
        }
    };


    useEffect(() => {
        fetchCookie();
        if (wsRef.current) {
                    console.log("Component unmounted. Closing WebSocket connection.");
                    // wsRef.current.close();
                  }
}, []);   // This will run on component mount

    useEffect(() => {
        if (Files_name){ 
            console.log("Files_name____________________________________________", Files_name);
            onDataChange(Files_name);
          }}
    , [Files_name]);    // This will run on component mount        
    
    const handleStrahlerOrdering = async() => {
        if (!selected_pour_point.length) {
            alert("Please select the Pour Point first!");
            return;
        }
        if (!FileName.length) {
            alert("Please select the Drainage Layer first!");
            return;
        }
        console.log("Strahler Ordering button clicked!");
        // Add your logic here
        const pouring_pt_obj = selected_pour_point.map(item => ({
            NODEID: item.node,
            AUD_GRP: item.group,
            LI_LINKIDS: item.LI_LINKIDS
          }));
            console.log("pouring_pt_obj______________________", pouring_pt_obj);
          try {
            console.log("FileName_________", FileName[0]);
            console.log("FileName[0]_________", FileName[0]);
            const response = await fetch(`http://127.0.0.1:8000/Ordering_shp/${FileName[0]}/`, {
                method: "POST",
                credentials: "include", // Include cookies in the request
                headers: {
                    "Content-Type": "application/json" // Specify that you're sending JSON data
                  },
                body: JSON.stringify(pouring_pt_obj)
                
            });
            const dataresult = await response.json(); // Parse the response JSON
            console.log("Response:", dataresult);
            if (response.status === 201) {
                console.log("Status code is 201. Operation successful!");
                // myFunction(); // Call the function if status code is 201
                // const send_ordsh = (file_data) => {
                //     // const data = 'Hello from Child';
                //     onAction_ord(dataresult.max_ordsh); // Call the parent function
                // };
                const maxOrdshValue = dataresult.max_ordsh;  // Extract `max_ordsh`
                console.log("Sending maxOrdsh to Parent:", maxOrdshValue);
                // const send_ordsh = () => {
                // onAction_ord(maxOrdshValue); // Call parent function with data
                // }
                if (maxOrdshValue) {
                    onAction_ord(maxOrdshValue, FileName[0]); // Call the function to send the value to the parent
                }
            }
        } catch (error) {
            console.error("Error in fetch request:", error);
        }

      };













    // Check if sessionId cookie exists and fetch it if necessary
// This will run on component mount

  

    // const connectWebSocket = () => {
    //     if (isConnected) {
    //       console.log("WebSocket is already connected.");
    //       return;
    //     }
    //     // const sessionid = getSessionIdCookie();
    //     // console.log("Session ID from cookie:", sessionid);
    //     const webSocketUrl = `ws://127.0.0.1:8000/ws/gis/`;
    //     const webSocket = new WebSocket(webSocketUrl, [], {
    //         // headers: {
    //         //     'Cookie': `sessionid=${sessionid}`,  // Add 'Cookie': cookie.serialize('id', '496E66DD') //websocket header not working
    //         // }
    //       });

          
    //     // const webSocket = new WebSocket("ws://127.0.0.1:8000/ws/gis/"); // Replace with your WebSocket URL
    //     console.log("WebSocket connection created.");
    //     webSocket.onopen = () => {
    //       console.log("WebSocket connection opened.");
    //       setIsConnected(true);
    //     //   webSocket.send(JSON.stringify({ type: "INIT", message: "Hello from GpAudralaComp" }));
    //     };
    
    //     webSocket.onmessage = (event) => {
    //       console.log("Message received:", event.data);
    //       const message = JSON.parse(event.data);
    //       if (message.type === "SESSION_ID") {
    //         console.log("Session ID received from server:", message.sessionid);
    //         const domain = window.location.hostname;
    //         document.cookie = `sessionid=${message.sessionid}; path=/; domain=${domain}, SameSite=None; Secure=False;`;
    //       } else {
    //         console.log("Message received:", message);
    //       }
    //     //   setMessages((prevMessages) => [...prevMessages, event.data]);
    //     };
    
    //     webSocket.onerror = (error) => {
    //       console.error("WebSocket error:", error);
    //     };
    
    //     webSocket.onclose = () => {
    //       console.log("WebSocket connection closed.");
    //       setIsConnected(false);
    //     };
    
    //     wsRef.current = webSocket; // Store the WebSocket instance
    //   };




    //   useEffect(() => {
    //     connectWebSocket();
    //   }, []);


    // useEffect(() => {
    //     connectWebSocket();
    
    //     return () => {
    //       if (wsRef.current) {
    //         console.log("Component unmounted. Closing WebSocket connection.");
    //         wsRef.current.close();
    //       }
    //     };
    //   }, []);

    // Function to handle file selection
    const handleFileSelect = (file, index) => {
        // setSelectedFiles(file.name);
        setShowDropdown(false);
    };

    const sendDataToParent = (file_data) => {
        // const data = 'Hello from Child';
        onAction(file_data); // Call the parent function
    };

    const handleFileChange_zip = (e) => {

        console.log("eeee", e);
        const selectedFile = e.target.files[0];
        console.log("sssss", selectedFile);
        if (selectedFile) {
            // Validate if the file is a ZIP file
            if (
                selectedFile.type === "application/zip" ||
                selectedFile.name.endsWith(".zip")
            ) {
                setFile(selectedFile); // Set the file object
                console.log("file_data", file_data.name);
            } else {
                alert("Please upload a valid ZIP file!");
                setFile(""); // Reset file data
            }
        } else {
            setFile(""); // Reset file data
        }
    };

    const clearLayers = () => {
        if (mapRef.current) {
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Layer && !(layer instanceof L.TileLayer)) {
                    mapRef.current.removeLayer(layer);
                }
            });
            console.log("All layers cleared from the map.");
            // Reset the map view
            mapRef.current.setView([21.55, 80.9629], 5, { animate: true });
            setFile("");
            setUploadedFiles([]);
        }
    };



    const groupLines = Object.keys(GrouplineLegend);
    // Initialize state to track the selected group line
    const [selectedGroupLine, setSelectedGroupLine] = useState(groupLines[0]); // Default to the first group line

    console.log("selectedGroupLine oOOO1:", groupLines[0]);


    // const handleOnChange = (event) => {
    //     const currentIndex = groupLines.indexOf(selectedGroupLine);
    //     console.log("selectedGroupLine oOOOOo:", selectedGroupLine);
    //     console.log("currentIndex oOOOOo:", currentIndex);

    //     setSelectedGroupLine(event.target.value);
    //     fitBoundsForGroup(file_data.name, groupLines[currentIndex])
    //   };

    const handleOnChange = (event) => {
        const newValue = event.target.value; // Directly get the new value
        const currentIndex = groupLines.indexOf(newValue); // Find the index of the new value
        // console.log("selectedGroupLine oOOOOo:", newValue); // Log the selected value
        // console.log("currentIndex oOOOOo:", currentIndex); // Log the current index

        setSelectedGroupLine(newValue); // Update the state
        fitBoundsForGroup(file_data.name, groupLines[currentIndex]); // Pass the updated value
    };

    const fitBoundsForGroup = (filename, targetGroupId) => {
        const fileLayer = fileLayersMap.current.get(`${filename}_LineString`);
        if (!fileLayer || !fileLayer.groupFeatures[targetGroupId]) {
            console.warn(`No features found for AUD_GRP: ${targetGroupId}`);
            return;
        }

        const groupFeatures = fileLayer.groupFeatures[targetGroupId];
        const bounds = [];

        groupFeatures.forEach((feature) => {
            if (feature.geometry.type === "LineString") {
                const latlngs = feature.geometry.coordinates.map(([lng, lat]) => [
                    lat,
                    lng,
                ]);
                bounds.push(...latlngs);
            }
        });

        if (bounds.length > 0) {
            const fitBounds = L.latLngBounds(bounds);
            mapRef.current.fitBounds(fitBounds, { animate: true, duration: 1.5 });
        }
    };
    // Function to handle the increment (right arrow)
    const handleIncrement = () => {
        const currentIndex = groupLines.indexOf(selectedGroupLine);
        if (currentIndex < groupLines.length - 1) {
            fitBoundsForGroup(file_data.name, groupLines[currentIndex + 1])
            setSelectedGroupLine(groupLines[currentIndex + 1]); // Increase value
        }
    };
    // Function to handle the decrement (left arrow)
    const handleDecrement = () => {
        const currentIndex = groupLines.indexOf(selectedGroupLine);
        if (currentIndex > 0) {
            fitBoundsForGroup(file_data.name, groupLines[currentIndex - 1])
            // console.log("FILEEEEEEEEDATAAA", file_data.name);

            setSelectedGroupLine(groupLines[currentIndex - 1]); // Decrease value
        }
    };



    return (
        <>
            {/* <div> */}
            <div className="gp-content-div-fix">

                <div className="gp-info-heading">
                    <p className="d-flex align-items-center m-2"><i class="fa-solid fa-square-question" style={{ fontSize: "25px" }}></i></p>
                    <p className="m-0">Audrala is an automatic drainage ordering tool for both stahler and shreve methods. Click 'Help' icon for more information.</p>
                </div>

                <div className="Drainage-contents">
                    <fieldset className="Drainage-fieldset">
                        <legend class="Drainage-legend mx-1">Read And View Drainage Network</legend>
                        <div className="select-Drainage-contents">
                            <label>Select Drainage Layer (*.shp, *.dbf, *.prj):</label>

                            <div className="Select-Drainage-Div">
                                {/* <div className="Aoi-File-div"> */}
                                <input
                                    id="path"
                                    className="Drainage-LayerFile-path"
                                    value={
                                        file_data ? file_data.name : "No Spatial Selection"
                                    }
                                    readOnly
                                />
                                {/* Down arrow icon */}
                                <span
                                    className="Drainage-arrow-span"
                                // onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    {/* {uploadedFiles.length > 0 ? (
                                            <FontAwesomeIcon
                                                className="iconfaChevronDown"
                                                icon={showDropdown ? faChevronUp : faChevronDown}
                                            />
                                            ) : (
                                            <FontAwesomeIcon
                                                className="iconfaChevronDown"
                                                icon={faChevronDown}
                                            />
                                            )} */}
                                </span>
                                {/* Dropdown list */}
                                {showDropdown && (
                                    <ul className="DropDown-List-UL">
                                        {uploadedFiles.map((file, index) => (
                                            <React.Fragment key={index}>
                                                <div>
                                                    <span
                                                        className="uploaded-file-list"
                                                    // onClick={() => handleFileSelect(file, index)}
                                                    >
                                                        {file.name}
                                                    </span>
                                                    <button
                                                        className="btn mr-2 float-right Search-RemoveButton"
                                                    // onClick={() =>
                                                    //   handleRemoveFiles(index, file.name)
                                                    // }
                                                    >
                                                        {/* {isModalOpen ? "" : "X"} */}
                                                    </button>
                                                </div>
                                                <hr className="new-hr" />
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                )}
                                {/* </div> */}
                                <div className="Drainage-custom-file-div">
                                    <label for="myfile" className="Drainage-custom-file-upload">
                                        <FontAwesomeIcon
                                            className="Aoi-UploadIcon"
                                            icon={faWindowRestore}
                                        />
                                    </label>
                                    <input
                                        type="file"
                                        id="myfile"
                                        name="file"
                                        className="Drainage-custom-hidden-file-input"
                                        required
                                        accept=".zip"
                                        onChange={handleFileChange_zip}
                                    />
                                </div>
                            </div>

                            <div className="Drainage-btnDIv">

                                <div className="d-flex align-items-center">
                                    <button
                                        onClick={() => sendDataToParent(file_data)}
                                        className="Drainage-read-btn mr-2"
                                        disabled={!file_data}
                                    >
                                        R E A D
                                    </button>
                                    {/* <button disabled={!file_data} className="Drainage-read-btn mr-2" onClick={clearLayers}>LAYER REMOVE</button> */}
                                    {/* <FontAwesomeIcon className="mr-2" icon={faSpinner} /> */}
                                    <FontAwesomeIcon icon={faCircleInfo} className=" mr-2" />
                                    {isLoading.isLoading &&
                                        <div className="GpAudralaloader mr-2"></div>
                                    }
                                </div>


                                {/* <div>
                                    <button
                                        // onClick={() => handleViewMapClickAoik(selectedFiles)}
                                        className="Drainage-draw-btn mr-2"
                                    >
                                        D R A W
                                    </button>

                                </div> */}
                            </div>
                        </div>
                    </fieldset>

                    {/* --------------------- */}

                    <fieldset className="Drainage-fieldset">
                        <legend class="Drainage-legend mx-1">OUTLET Point Selection</legend>
                        <div className="select-pour-contents">
                            {/* Options */}
                            <div className="Group-nuber-div" >
                                <i class="arrow-size fa-solid fa-caret-left"
                                    onClick={handleDecrement} // Decrement value when clicked
                                    disabled={Object.keys(GrouplineLegend).length === 0}
                                    style={{
                                        cursor: Object.keys(GrouplineLegend).length === 0 ? 'not-allowed' : 'pointer',

                                    }}
                                />
                                <select
                                    className="group-number-dropdown"
                                    value={selectedGroupLine} // Set the selected value dynamically
                                    onChange={handleOnChange}
                                    disabled={Object.keys(GrouplineLegend).length === 0}


                                    style={{
                                        cursor: Object.keys(GrouplineLegend).length === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <option
                                        selected
                                        disabled
                                    >Line Group List</option>
                                    {Object.entries(GrouplineLegend).map((geoType, groupLine) => (
                                        <option key={groupLine} value={groupLine} >
                                            Line Group {groupLine}
                                        </option>
                                    ))}
                                </select>

                                <i class="arrow-size fa-solid fa-caret-right"
                                    onClick={handleIncrement} // Increment value when clicked
                                    disabled={Object.keys(GrouplineLegend).length === 0}
                                    style={{
                                        cursor: Object.keys(GrouplineLegend).length === 0 ? 'not-allowed' : 'pointer',

                                    }}
                                />
                            </div>

                            <div className="Pour-btnDIv">
                                <button
                                    onClick={onhandleselectPourpoint}
                                    disabled={Object.keys(GrouplineLegend).length === 0}
                                    className="Single-Point-btn" >
                                    Select Pour Point
                                </button>
                                {/* <button
                                    // onClick={() => handleViewMapClickAoik(selectedFiles)}
                                    className="Multi-Point-btn"
                                >
                                    Multi Point
                                </button> */}
                            </div>

                            {/* <div className="select-options-div">
                                <label>Select Options: </label>

                                <div className="selectOpt-btnDIv">
                                    <button
                                        // onClick={() => handleViewMapClickAoik(selectedFiles)}
                                        className="select-append"
                                    >
                                        Append
                                    </button>
                                    <button
                                        // onClick={() => handleViewMapClickAoik(selectedFiles)}
                                        className="select-delete"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        // onClick={() => handleViewMapClickAoik(selectedFiles)}
                                        className=" select-new"
                                    >
                                        New
                                    </button>
                                </div>

                            </div> */}

                            <div>
                                <label>Selected OUTLET Point list:</label>
                                <textarea
                                    type="text"
                                    name="xLocation"
                                    className="pour-input"
                                    rows={2}
                                    // placeholder="Value"
                                    value={selected_pour_point.filter(item => item.node && item.group && item.LI_LINKIDS).map((item) => `${item.node}(${item.group})(${item.LI_LINKIDS})`).join(" , ")}
                                    readOnly
                                />
                                <textarea
                                    type="text"
                                    name="xLocation"
                                    className="pour-input"
                                    // rows={2}
                                    // placeholder="Value"
                                    value={webbsocket}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label>Unselected drainage group list:</label>
                                {/* <textarea
                                    type="text"
                                    name="xLocation"
                                    className="pour-input"
                                    rows={2}
                                    value={Object.entries(GrouplineLegend).map((geoType, groupLine) => `${groupLine}`).join(", ")}
                                    // value={selected_pour_point.map((item) => `(${item.group})`).join(" , ")}
                                    readOnly
                                /> */}

                                <textarea
                                    type="text"
                                    className="pour-input"
                                    rows={2}
                                    value={Object.entries(GrouplineLegend)
                                        .filter((geoType, groupLine) => !selected_pour_point.some((item) => item.group === groupLine))
                                        .map((geoType, groupLine) => groupLine)
                                        .join(", ")}

                                 

                                        
                                    readOnly
                                />
                            </div>

                        </div>
                    </fieldset>

                    {/* --------------------- */}

                    <fieldset className="Drainage-fieldset">
                        <legend class="Drainage-legend mx-1">Drainage Ordering</legend>
                        {/* <div className="Drainage-ordering-div"> */}

                        <div className="Drainage-ordering-btn">
                            <div className="Strahler-Ordering-btn">
                                <span className="Img-icon-size"><img src={StrahlerOrder} alt="StrahlerOrder" /></span>
                                <button className="Strahler-Ordering"
                                 onClick={handleStrahlerOrdering} > Strahler Ordering </button>
                            </div>
                            <div className="Shreve-Ordering-btn">
                                <span className="Img-icon-size"><img src={ShreveOrder} alt="ShreveOrder" /></span>
                                <button className="Shreve-Ordering"
                                > Shreve Ordering </button>
                            </div>
                        </div>
                        {/* </div> */}
                    </fieldset>

                    {/* --------------------- */}
                    <div className="quit-ref-btnDIv">
                        <button className="Drainage-read-btn mr-2">
                            SAVE
                        </button>
                    </div>
                    <div className="quit-ref-btn">
                        <div className="quit-ref-btnDIv">
                            <button className="Drainage-read-btn mr-2">
                                QUIT
                            </button>
                            <button className="Drainage-draw-btn mr-2">
                                Refresh
                            </button>
                            {/* </div> */}
                        </div>
                        <div className="quit-ref-btnDIv">
                            <button className="Drainage-read-btn mr-2">
                                Show Statistics
                            </button>
                        </div>
                    </div>
                    {/* --------------------- */}

                    <fieldset className="Drainage-fieldset">
                        <legend class="Drainage-legend mx-1">Console</legend>
                        <div className="Drainage-Console-box">
                            <textarea
                                className="console-textarea"
                                rows={5}
                                readOnly

                            />
                        </div>
                    </fieldset>
                </div>
            </div>
            {/* </div> */}
        </>
    )
}

export default GpAudralaComp
