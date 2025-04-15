import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import DockLayout from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import "./MyLayoutComponent.css"; // Import the CSS file
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";

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
import { FolderAddOutlined } from '@ant-design/icons';
import UploadShapefile from '../DraggingBox/UploadShapefile'
import HandleShapeToggle from '../DraggingBox/MapContents/HandleShapeToggle'
import MapComp from "./MapPanel/MapComp";
import GpAudralaComp from "./MapApplications/GpAudralaComp";
import TableContentComp from "./TablePanelContents/TableContents";
// import { useSelector } from "react-redux";
import {
  setpouringpoint,
  addFileName,
  clearFileName,
  clearPouringPoint
} from "../StoreContext/features/dragbox/dragboxReducer";

// Create Context
const Context = createContext();

const MyLayoutComponent = () => {
  const { selected_pour_point, FileName } = useSelector((state) => state.drag)
  const dispatch = useDispatch();
  const [sharedData, setSharedData] = useState('');
  const functionFrommap = useRef(null);
  const [activePanel, setActivePanel] = useState("panel1"); // Set default active panel
  // const layoutRef = useRef(null); // Reference to the layout
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [updatedata, setUpdatedata] = useState('');
  const [updatedataTable, setUpdatedataTable] = useState('');
  const [Geometrydata, setGeometrydata] = useState(null);
  const [FileName_N, setFileName] = useState([]);
  const fileLayersMap = useRef(new Map()); // Initialize the Map inside useRef
  const [isLoading, setIsLoading] = useState(false); // State to manage loading
  const [apiError, setApiError] = useState(null); // State to manage API errors
  const [ActivePourPoint, setActivePourPoint] = useState(false);
  const [fileuploadis, setFileuploadis] = useState(false);
  const [urls, seturls] = useState({});
  // const wsbebRef = useRef(null);

  const getSessionIdCookie = () => {
    const cookies = document.cookie.split("; ");
    // //console.log("Cookies:", cookies);
    const sessionCookie = cookies.find(cookie => cookie.startsWith("sessionid="));
    // console.log("Session cookie:", sessionCookie);
    return sessionCookie ? sessionCookie.split("=")[1] : null;  // Extract the value
  };

  const handleselectPourpoint = () => {
    setActivePourPoint(true)
  }

  const handleDataChange_file_name = (data) => {
    console.log("data1111_________", data)
    setSharedData(data);
  };

  const extract_zip = async (file) => {
    // console.log("File selected:", file);

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true); // Show loader
    const sessionid = getSessionIdCookie();
    function getCookie(name) {
      const value = `; ${document.cookie}`;  // Add a semicolon and space for easy splitting
      const parts = value.split(`; ${name}=`); // Split the cookie string at the name of the cookie
      if (parts.length === 2) {
        return parts.pop().split(';').shift();  // Return the value of the cookie
      }
      return null;  // Return null if the cookie is not found
    }
    const csrfToken = getCookie('csrftoken');

    try {
      const response = await fetch("http://127.0.0.1:8000/file_upload_asc/", {
        method: "POST",
        body: formData,
        credentials:'include',
        // headers: {
        //   credentials: 'include',
        // },
      });

      const data = await response.json();
      if (response.ok) {
          dispatch(clearPouringPoint());
      }
    } catch (error) {
      //console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };


  const load_colour_ordsh = async(maxOrdsh, filename) => {
    console.log("maxOrdsh_________", maxOrdsh)
    // console.log("fileName_________", FileName)
   
    if (!filename) {
        alert("MYLAOUT FILE NAME IS EMPTY");
        return;
    }
    console.log("load_colour_ordsh Ordering button clicked!");
    // Add your logic here
      try {
        // console.log("FileName_________", FileName[0]);
        console.log("FileName[0]_________", filename);
        const response = await fetch(`http://127.0.0.1:8000/Colur_ordsh/${filename}/`, {
            method: "POST",
            credentials: "include", // Include cookies in the request
            headers: {
                "Content-Type": "application/json" // Specify that you're sending JSON data
              },
              body: JSON.stringify({ max_ordsh: maxOrdsh })
            
        });
        const dataresult = await response.json(); // Parse the response JSON
        console.log("Response:", dataresult);
        if (response.status === 201) {
            console.log("Status code is 201. Operation successful! rendering the map");
            // myFunction(); // Call the function if status code is 201
            // seturls(dataresult.status);
              seturls({ status: dataresult.status });
            // seturls(prevUrls => ({ ...prevUrls, ...dataresult.status }));
        }
    } catch (error) {
        console.error("Error in fetch request:", error);
    }

  };

  const reopenPanel = (panelId, FileNamedata) => {
    //console.log("sdgdfgdfg ", FileNamedata)
    if (FileNamedata) {
      setUpdatedataTable(FileNamedata)
    }
    const panelElement = document.querySelector(
      `.dock-panel[data-dockid="${panelId}"]`
    );
    if (panelElement) {
      panelElement.style.display = "block"; // Show the panel again
    }
  };

  const HandleGetShapeGeo = (data) => {
    //console.log("data 1", data)
    if (data) {
      setGeometrydata(data)
    }
  }
  // const renderTab1Content = () => (
  //   <HandleShapeToggle Geometrydata={Geometrydata} />
  // );
  const renderTab1Content = () => (
    <Context.Consumer>
      {({ Geometrydata, FileName_N }) => (
        <div
          style={{ height: "100%" }}
          onClick={() => handlePanelClick("panel1")}
        >
          <HandleShapeToggle
            onreopentablePanel={reopenPanel}
            FileName_N={FileName_N}
            mapContainerRef={mapContainerRef}
            mapRef={mapRef}
            fileLayersMap={fileLayersMap}
            Geometrydata={Geometrydata} />
        </div>
      )}
    </Context.Consumer>
  );

  const renderTab2MapContent = () => (
    <Context.Consumer>
      {({ Geometrydata, sharedData,ActivePourPoint, urls }) => (
        <div style={{ height: "100%" }}
          onClick={() => handlePanelClick("panel2")}
        >
          <MapComp
            ref={functionFrommap}
            mapContainerRef={mapContainerRef}
            mapRef={mapRef}
            datavalue={Geometrydata}
            fileLayersMap={fileLayersMap}
            sent_datav={sharedData}
            ActivePourPoint={ActivePourPoint}
            urls_1={urls}
          />
        </div>
      )}
    </Context.Consumer>
  );

  const rendertableContentsComp = () => (
    <Context.Consumer>
      {(updatedataTable) => (
        <div className="gp-content-main-div "
          onClick={() => handlePanelClick("panel2-bottom")}
        >
          <TableContentComp updatedataTable={updatedataTable} />
        </div>
      )}
    </Context.Consumer>
  );

  const renderTab3GpAudralaComp = () => (
    <Context.Consumer>
      {(isLoading) => (
        <div className="gp-content-main-div "
          onClick={() => handlePanelClick("panel3")}
        >
          <GpAudralaComp onhandleselectPourpoint={handleselectPourpoint} isLoading={isLoading} onAction={extract_zip} onAction_ord={load_colour_ordsh} onDataChange={handleDataChange_file_name} callMapFunction={() => functionFrommap.current?.flip_data_steller()} />
        </div>
      )}
    </Context.Consumer>
  );

  const [layout, setLayout] = useState({
    dockbox: {
      mode: "horizontal", // Layout direction (horizontal or vertical)
      children: [
        {
          size: 20,
          id: "panel1",
          tabs: [
            {
              id: "tab1",
              title: (
                <div
                  onClick={() => handlePanelClick("panel1")}
                  className="dock-tab-title"
                >
                  <span>Map Contents</span>
                </div>
              ),
              cached: true,
              content: renderTab1Content(),
            },
          ],
        },
        {
          size: 60,
          id: "panel2", // Add unique panel id (id = data-dockid)
          tabs: [
            {
              id: "tab2",
              title: (
                <div
                  className="map-middle-part"
                  onClick={() => handlePanelClick("panel2")}
                >
                  <span><i className="fa-solid fa-earth-americas fa-earth"></i></span>
                  <span className="map-middle-name">Map</span>
                </div>
              ),
              cached: true,
              content: renderTab2MapContent(),
            },
          ],
        },

        {
          size: 20,
          id: "panel3", // Add unique panel id (id = data-dockid)
          tabs: [
            {
              id: "tab3",
              title: (
                <div
                  onClick={() => handlePanelClick("panel3")}
                  className="dock-tab-title"
                // text-overflow: ellipsis;
                >
                  <span>GP: Audrala</span>
                  {/* <span className="close-btn">&#10006;</span> */}
                </div>
              ),
              cached: true,
              // title: <CustomTab title="GP: NDVI" onClose={() => handleTabClose('tab3')} />,
              content: renderTab3GpAudralaComp(),
            },
          ],
        },

      ],
    },

    // Floatable Table panel ************************************************ 
    floatbox: {
      mode: 'float',
      children: [
        {
          size: 20,
          id: "panel2-bottom", // Add unique panel id (id = data-dockid)
          className: "dock-panel-bottom", // Add custom class
          // mode: 'float',
          tabs: [
            {
              id: "tab4",
              className: "Table-Tab-one",
              title: (
                <div
                  className="table-tab-title"
                  onClick={() => handlePanelClick("panel2-bottom")}
                >
                  <span><i class="fa-regular fa-table"></i></span>
                  <span className="tble-name">Export_Import_Table</span>
                </div>
              ),
              cached: true,
              content: rendertableContentsComp(),
            },

            // Create Second tab in table panel
            {
              id: "tab5",
              className: "Table-Tab-Two",
              title: (
                <div
                  className="table-tab-title"
                  onClick={() => handlePanelClick("panel2-bottom")}
                >
                  <span><i class="fa-regular fa-table"></i></span>
                  <span className="tble-name">Export_Import_Table_2</span>
                </div>
              ),
              cached: true,
              content: rendertableContentsComp(),
            },

          ],
          x: 550, y: 450, w: 800, h: 300
        }
      ]
    }

  });

  // __----------------------------------------------------------------------------------------__

  // Use effect to apply dynamic styles after each render
  const applyPanelStyles = () => {
    // Reset styles for panel1 and panel3 (don't apply to panel2)
    const panels = ["panel1", "panel3"]; // Only apply to panel1 and panel3
    panels.forEach((panelId) => {
      const panelElement = document.querySelector(
        `.dock-panel[data-dockid="${panelId}"]`
      );
      const titleElement = document.querySelector(
        `.dock-panel[data-dockid="${panelId}"] .dock-tab-title span`
      );

      if (panelElement) {
        panelElement.style.borderTop = "3px solid #a8a7a7"; // Default border
      }
      if (titleElement) {
        titleElement.style.color = "#a8a7a7"; // Default title color (black)
      }
    });

    // Apply active style to the selected panel if it's panel1 or panel3
    const activeElement = document.querySelector(
      `.dock-panel[data-dockid="${activePanel}"]`
    );
    const activeTitle = document.querySelector(
      `.dock-panel[data-dockid="${activePanel}"] .dock-tab-title span`
    );

    if (activeElement && (activePanel === "panel1" || activePanel === "panel3")) {
      activeElement.style.borderTop = "3px solid #af8ad0"; // Highlight for active panel
    }
    if (activeTitle && (activePanel === "panel1" || activePanel === "panel3")) {
      activeTitle.style.color = "#af8ad0"; // Highlight active title
    }
  };

  // Add a click event listener to the panel header
  const addHeaderClickListeners = () => {
    document.querySelectorAll(".dock-bar").forEach((header) => {
      header.addEventListener("click", (event) => {
        const panelId = header.closest(".dock-panel")?.dataset.dockid; // Get panel ID from the parent container
        if (panelId) {
          handlePanelClick(panelId); // Activate the panel
        }
      });
    });
  };

  useEffect(() => {
    applyPanelStyles(); // Apply styles when activePanel changes
    addHeaderClickListeners(); // Add header click listeners after each render
  }, [activePanel]); // Re-run when activePanel changes

  // useEffect(() => {
  //   applyPanelStyles(); // Apply styles when activePanel changes
  // }, [activePanel]); // Re-run when activePanel changes

  const handlePanelClick = (panelId) => {
    //console.log(`Activating panel: ${panelId}`); // Log the activated panel
    setActivePanel(panelId); // Update the active panel
    renderTab1Content()
  };


  const pinnedPanels = []; // To track the pinned panels

  const addButtonToExtraContent = () => {
    const panelIds = ["panel1", "panel3", "panel2-bottom"];

    panelIds.forEach((panelId) => {
      const panelElement = document.querySelector(
        `.dock-panel[data-dockid="${panelId}"]`
      );
      const extraContentDivs = panelElement?.querySelector(
        ".dock-extra-content"
      );
      const extraContentPinDivs = panelElement?.querySelector(
        ".dock-extra-content"
      );
      // const extraContentDownBtnDivs = panelElement?.querySelector('.dock-extra-content');
      // const extraContentDivs = document.querySelectorAll('.dock-extra-content');
      // const extraContentPinDivs = document.querySelectorAll('.dock-extra-content');

      const extraContentDownBtnDivs = document.querySelectorAll(
        ".dock-extra-content"
      );

      if (!panelElement || !extraContentDivs) return;

      // Check panel position (left/right) based on offsetLeft
      const isPanelOnLeft = panelElement.offsetLeft < window.innerWidth / 2;
      const isPanelOnTop = panelElement.offsetTop < window.innerHeight / 2;

      // Store pinned panel information with correct side
      pinnedPanels.push({ panelId, isPanelOnLeft, isPanelOnTop });

      // Down arrow to show in the ALL Panels
      extraContentDownBtnDivs.forEach((div) => {
        if (!div.querySelector(".custom-down-btn")) {
          const downButton = document.createElement("div");
          downButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>'; // Cross symbol (X)
          downButton.className = "custom-down-btn";
          downButton.style.cursor = "pointer";
          // closeButton.style.marginLeft = '10px';

          const tabPanel = div.closest(".dock-panel");
          const tabId = tabPanel?.getAttribute("data-tab-id");

          // Attach click handler for the close button
          downButton.onclick = () => {
            //console.log(`Toglling Panel: ${tabId}`); // Placeholder for your close tab logic
            handlePanelClick(tabId); // Replace with your tab close handling
          };

          div.appendChild(downButton);
        }
      });


      if (
        extraContentPinDivs &&
        !extraContentPinDivs.querySelector(".custom-pin-btn")
      ) {
        const pinButton = document.createElement("div");
        pinButton.innerHTML =
          '<i class="fa fa-thumb-tack" aria-hidden="true"></i>'; // Cross symbol (X)
        pinButton.className = "custom-pin-btn";
        pinButton.style.cursor = "pointer";
        pinButton.style.position = "relative";


        pinButton.onclick = () => {
          //console.log(`Pinning Panel: ${panelId}`);
          panelElement.style.display = "none"; // Hide the panel

          const panelRect = panelElement.getBoundingClientRect();
          pinnedPanels.push({ panelId, isPanelOnLeft, isPanelOnTop });

          // Create the unpin button on the correct side
          createUnpinButton(panelId, isPanelOnLeft, isPanelOnTop);
        };

        extraContentPinDivs.appendChild(pinButton);
      }

      // Check if the close button is already added to avoid duplication
      // if (!div.querySelector('.custom-close-btn'))
      if (
        extraContentDivs &&
        !extraContentDivs.querySelector(".custom-close-btn")
      ) {
        const closeButton = document.createElement("div");
        closeButton.innerHTML = "&#10006;"; // Cross symbol (X)
        closeButton.className = "custom-close-btn";
        closeButton.style.cursor = "pointer";
        // Attach click handler for the close button
        closeButton.onclick = () => {
          //console.log(`Closing tab: ${panelId}`); // Placeholder for your close tab logic
          // handlePanelClick(panelId); // Replace with your tab close handling
          closePanel(panelId); // Call close panel logic
        };

        // div.appendChild(closeButton);
        extraContentDivs.appendChild(closeButton);
      }
    });
  };

  const createUnpinButton = (panelId, isPanelOnLeft, isPanelOnTop) => {
    const layoutDiv = document.querySelector(".Layout-main-div");

    // Check if layoutDiv exists
    if (!layoutDiv) {
      // //console.error("Layout-main-div not found.");
      return;
    }

    // Create unpin button
    const unpinButton = document.createElement("button");
    unpinButton.innerHTML = `Unpin ${panelId}`;
    unpinButton.className = "unpin-btn";
    unpinButton.style.cursor = "pointer";
    unpinButton.style.position = "absolute";
    unpinButton.style.zIndex = "1000";

    // Adjust position based on whether the panel is on the left or right side
    if (isPanelOnLeft) {
      unpinButton.style.left = "10px"; // Position unpin button on the left
      unpinButton.style.top = "100px";
      unpinButton.style.right = "unset"; // Ensure right is unset
    } else {
      unpinButton.style.right = "10px"; // Position unpin button on the right
      unpinButton.style.top = "100px";
      unpinButton.style.left = "unset"; // Ensure left is unset
    }

    if (isPanelOnTop) {
      unpinButton.style.top = "10px";
      unpinButton.style.bottom = "unset";
    } else {
      unpinButton.style.bottom = "10px";
      unpinButton.style.top = "unset";
    }

    // Calculate vertical position based on the count of pinned panels on each side
    // const verticalOffset = pinnedPanels.filter(panel => panel.isPanelOnLeft === isPanelOnLeft).length * 50;
    // unpinButton.style.top = `${verticalOffset}px`;

    // Unpin button click handler
    unpinButton.onclick = () => {
      //console.log(`Unpinning Panel: ${panelId}`);
      const panelElement = document.querySelector(
        `.dock-panel[data-dockid="${panelId}"]`
      );
      if (panelElement) {
        panelElement.style.display = "block"; // Show the panel again
      }

      // Remove unpin button from layout and update pinnedPanels
      layoutDiv.removeChild(unpinButton);
      const panelIndex = pinnedPanels.findIndex(panel => panel.panelId === panelId);
      if (panelIndex > -1) {
        pinnedPanels.splice(panelIndex, 1);
      }
    };

    // Append unpin button to the layout
    layoutDiv.appendChild(unpinButton);
  };

  // Call createUnpinButton after component mounts
  // useEffect(() => {
  //   createUnpinButton("panel1", true); // Example for a left panel
  //   createUnpinButton("panel2", false); // Example for a right panel
  // }, []);

  // Observing for .dock-drop-layer and adding border
  useEffect(() => {
    const observer = new MutationObserver(addBordersToDropLayer);
    observer.observe(document.body, { childList: true, subtree: true });
    addBordersToDropLayer(); // Initial run in case elements are already present
    return () => observer.disconnect(); // Clean up on component unmount
  }, []);

  const addBordersToDropLayer = () => {
    document.querySelectorAll(".dock-drop-layer").forEach(layer => {
      if (!layer.querySelector(".custom-drag-border")) {
        const borderDiv = document.createElement("div");
        borderDiv.className = "custom-drag-border";
        // borderDiv.style.border = "2px solid #a8a7a7";
        layer.appendChild(borderDiv);
      }
    });
  };

  // Function to close the panel and add reopen button in the header
  const closePanel = (panelId) => {
    const panelElement = document.querySelector(
      `.dock-panel[data-dockid="${panelId}"]`
    );
    if (panelElement) {
      panelElement.style.display = "none"; // Hide the panel
      // addReopenTableButton(panelId); // Add the reopen button
      addReopenOption(panelId); // Add the reopen option in dropdown

    }

  };


  const addReopenOption = (panelId) => {
    // Add the reopen option for other panels in the general dropdown
    const dropdownMenu = document.querySelector(".reopen-dropdown-menu");
    if (!dropdownMenu.querySelector(`.reopen-option[data-panelid="${panelId}"]`)) {
      // const reopenOption = document.createElement("li");
      // reopenOption.className = "reopen-option";
      // reopenOption.innerHTML = `Reopen ${panelId}`;
      // reopenOption.setAttribute("data-panelid", panelId);

      // // Reopen option click handler
      // reopenOption.onclick = () => {
      //   //console.log(`Reopening panel: ${panelId}`);
      //   reopenPanel(panelId);
      //   reopenOption.remove(); // Remove the reopen option from the dropdown
      // };
      // dropdownMenu.appendChild(reopenOption);

      if (panelId != "panel2-bottom") {
        const reopenOption = document.createElement("li");
        reopenOption.className = "reopen-option";
        reopenOption.innerHTML = `Reopen ${panelId}`;
        reopenOption.setAttribute("data-panelid", panelId);

        // Reopen option click handler
        reopenOption.onclick = () => {
          //console.log(`Reopening panel: ${panelId}`);
          reopenPanel(panelId);
          reopenOption.remove(); // Remove the reopen option from the dropdown
        };

        dropdownMenu.appendChild(reopenOption);
      }
    }
  };

  // Ensure that Panel2-bottom is hidden by default when the component is mounted
  useEffect(() => {
    const panelElement = document.querySelector(
      `.dock-panel[data-dockid="panel2-bottom"]`
    );
    if (panelElement) {
      panelElement.style.display = "none"; // Hide Panel2-bottom on load
    }
  }, []);

  const handleLayoutChange = (newLayout) => {

    setLayout(newLayout); // Update the layout state
    // Use a timeout to ensure DOM updates are applied
    setTimeout(() => {
      applyPanelStyles(); // Ensure styles are reapplied after dragging
      addButtonToExtraContent(); // Re-add close buttons after layout change
      addHeaderClickListeners();
      // addDownButtonToExtraContent();
    }, 0); // Use a small timeout to allow DOM updates
  };

  // Use effect to run the button addition after the initial render
  useEffect(() => {
    addButtonToExtraContent(); // Run on mount
    // addDownButtonToExtraContent();
  }, []); // Empty dependency array to run once on mount


  document.addEventListener("DOMContentLoaded", function () {
    const dropLayers = document.querySelectorAll('.dock-drop-layer');
    dropLayers.forEach(layer => {
      const borderDiv = document.createElement('div');
      borderDiv.className = 'custom-drag-border';
      layer.appendChild(borderDiv);
    });
  });



  return (
    <Context.Provider value={{ Geometrydata, sharedData,urls, FileName_N, updatedataTable, isLoading,ActivePourPoint }}>

      <div className="Layout-main-div">
        <div className="Layout-Header">

          <div class="dropdown">
            <button class="dropdown-btn">Reopen Panel</button>
            <ul class="reopen-dropdown-menu">

            </ul>
          </div>
          {/* shapeFileButton */}
          <div>
            <UploadShapefile
              onHandleGetShapeGeo={HandleGetShapeGeo}
            />
          </div>
        </div>
        {/* <Context.Provider value={Geometrydata}> */}
        {/* Layout Panel */}
        <DockLayout
          defaultLayout={layout}
          style={{ width: "100%", height: "100%" }}
          onLayoutChange={handleLayoutChange}
        // canDrop={canDrop} // Add custom drop logic
        />

        {/* Unpin button */}
        <div className="unpin-buttons-container" style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}>
          {/* Unpin buttons will be dynamically added here */}
        </div>

      </div>
    </Context.Provider>

  );
};

export default MyLayoutComponent;

