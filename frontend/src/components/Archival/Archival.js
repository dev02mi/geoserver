import React, { useState, useEffect, useRef } from "react";
import "./Archival.css";
import axios from "axios";
import { Tooltip } from "antd";
// npm i react-leaflet
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Swal from "sweetalert2";
// import shpwrite from 'shp-write';
import shpwrite from "@simwrapper/shp-write";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDrawPolygon,
  faAngleUp,
  faAngleDown,
  faCircleInfo,
  faWindowRestore,
  faDeleteLeft,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "../Preloader/Loader";
import ImageModal from "./ImageModal/ImageModal";
import ArchivalValidationComponent from "./ArchivalFromValidation/ArchivalValidationComponent";
import ModalManager from "../GeopicxPopupModals/ModalManager";
import * as turf from "@turf/turf"; // Import Turf.js library
// import JSZip from "jszip";
import { BlobReader, BlobWriter, ZipReader, ZipWriter } from "@zip.js/zip.js";
import { useNavigate } from "react-router-dom";
import { Tab, Tabs, TabContent, TabPane } from "react-bootstrap";

import ZoomInIcon from "../../asset/SVG_ICONS_128/NAZoom_In128.svg";
import ZoomOutIcon from "../../asset/SVG_ICONS_128/NAZoom_Out128.svg";

// import { Tooltip } from "react-bootstrap";
import ClosedIcon from "../../asset/SVG_ICONS_128/GNCancel128.svg";

const subjectObject = {
  AIRBUS: {
    OPTICAL: ["PHR", "PNEO", "SPOT"],
    RADAR: ["TERRASAR-x-BAND", "TANDAM-X-BAND", "PAZ"],
    DEM: [
      "WORLD-DEM-NEO(DSM)",
      "WORLD-DEM-NEO(DTM)",
      "WORLD-DEM(DSM)",
      "WORLD-DEM(DTM)",
    ],
  },
  SENTINEL: {
    SENTINEL1: ["SENTINEL-1A", "SENTINEL-1B"],
    SENTINEL2: ["MSI-l1C", "MSI-l1A"],
  },
};

// Arrow function to transform the data
const processData = (data) => {
  const result = {};

  for (const key in data) {
    if (key.startsWith("dname")) {
      const index = key.match(/\d+/)[0];
      const bandKeys = Object.keys(data).filter((k) =>
        k.startsWith(`Band_ID_${index}_`)
      );

      const bands = bandKeys.map((bandKey) => {
        const bandIndex = bandKey.match(/\d+$/)[0];
        return {
          Band_ID: data[`Band_ID_${index}_${bandIndex}`],
          MIN: data[`MIN_${index}_${bandIndex}`],
          MAX: data[`MAX_${index}_${bandIndex}`],
          MEASURE_UNIT: data[`MEASURE_UNIT_${index}_${bandIndex}`],
        };
      });

      result[`xmlFile${index}`] = {
        dname: data[`dname${index}`],
        cname: data[`cname${index}`],
        sname: data[`sname${index}`],
        clRef: data[`clRef${index}`],
        senName: data[`senName${index}`],
        imgDataType: data[`imgDataType${index}`],
        imgDataProcSpec: data[`imgDataProcSpec${index}`],
        imgDate: data[`imgDate${index}`],
        img_dt_rng: data[`img_dt_rng${index}`],
        dSize: data[`dSize${index}`],
        dCloud: data[`dCloud${index}`],
        dPRJTable: data[`dPRJTable${index}`],
        dRows: data[`dRows${index}`],
        dBands: data[`dBands${index}`],
        dGSDAxt: data[`dGSDAxt${index}`],
        dGSDAlt: data[`dGSDAlt${index}`],
        dArea: data[`dArea${index}`],
        dSnow: data[`dSnow${index}`],
        dPRJTable: data[`dPRJTable${index}`],
        dPRJName: data[`dPRJName${index}`],
        dCols: data[`dCols${index}`],
        dTiles: data[`dTiles${index}`],
        dPixelX: data[`dPixelX${index}`],
        dPixelY: data[`dPixelY${index}`],
        dFormat: data[`dFormat${index}`],
        dType: data[`dType${index}`],
        dAQBits: data[`dAQBits${index}`],
        dPRBits: data[`dPRBits${index}`],
        dSign: data[`dSign${index}`],
        dBits: data[`dBits${index}`],
        dINAngle: data[`dINAngle${index}`],
        dQLname: data[`dQLname${index}`],
        xmlFile: data[`xmlFile${index}`],
        bands,
      };
    }
  }

  return result;
};
// i push
const captureDataTypeOptions = ["MONO", "STEREO", "TRI-STEREO"];

const Archival = (onValidationChange) => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [loading, setLoading] = useState(false);
  const [Tableloading, setTableloading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [loaderOk, setloaderOk] = useState(false);
  const uploadRequestRef = useRef(null);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [chapter, setChapter] = useState("");
  const [captureDataType, setcaptureDataType] = useState("");
  const [path, setPath] = useState("");
  const [saveuploadedFiles, setSaveUploadedFile] = useState(null);
  // const [popupVisible, setPopupVisible] = useState(false);
  const [newpopupVisible, setNewPopupVisible] = useState(false);
  const [downloadTimer, setDownloadTimer] = useState(null); // State to store download timer
  const [reslistofxml, setReslistofxml] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  // State variables for parsed variables
  const [parsedVariables, setParsedVariables] = useState(null);
  const [resformobject, setResformobject] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const responseDataRef = useRef(null);
  const parsedVariablesRef = useRef(null);
  const [tableData, setTableData] = useState({});
  const [page, setPage] = useState(1);
  const [disableNext, setDisableNext] = useState(false);
  const [totalPages, setTotalPages] = useState(1); // Adjust based on your data
  const [showImage, setShowImage] = useState(false);
  const [showPolygon, setShowPolygon] = useState(true); // Initial visibility state
  const [polygons, setPolygons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  // const [xmlText, setXmlText] = useState(null);
  const [showlistdatanotfound, setShowlistdatanotfound] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorClass, setErrorClass] = useState("");

  const [extents, setExtents] = useState([]); // Array to hold the extents
  const [currentExtentIndex, setCurrentExtentIndex] = useState(-1); // Index to track current extent
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  // tab
  const [selectedTab, setSelectedTab] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Zoom Functionality
  const [scale, setScale] = useState(1); // Default scale
  const [offsetX, setOffsetX] = useState(0); // Default X offset for panning
  const [offsetY, setOffsetY] = useState(0); // Default Y offset for panning
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  // let readableFileSize = '';
  const [readableFileSize, setreadableFileSize] = useState('');

  // Zoom Functionality code End

  // Reset zoom and panning position
  const resetSize = () => {
    setScale(1); // Reset to default scale
    setOffsetX(0); // Reset panning offset
    setOffsetY(0); // Reset panning offset
  };

  // Handle scroll zoom
  const handleWheel = (e) => {
    e.preventDefault(); // Prevent default scroll behavior

    // Adjust scale based on scroll direction (up = zoom in, down = zoom out)
    const zoomIntensity = 0.1;
    const newScale = scale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);

    // Set the new scale, ensuring it doesn't go below a certain level (e.g., 0.5) or above max (e.g., 3)
    setScale(Math.min(Math.max(newScale, 0.5), 3));
  };

  const imageStyle = {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    transformOrigin: "top left",
    transition: "transform 0.1s ease-out",
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const [table1Visible, setTable1Visible] = useState(true);
  const [table2Visible, setTable2Visible] = useState(false);
  const [table3Visible, setTable3Visible] = useState(false);

  const showTable1 = () => {
    setTable1Visible(true);
    setTable2Visible(false);
    setTable3Visible(false);
  };

  const showTable2 = () => {
    setTable1Visible(false);
    setTable2Visible(true);
    setTable3Visible(false);
  };

  const showTable3 = () => {
    setTable1Visible(false);
    setTable2Visible(false);
    setTable3Visible(true);
  };

  // console.log("jhghghgsfghshfhfhdfhdfhdfhdfhdfhdfhdf", reslistofxml);

  useEffect(() => {
    // Get references to the buttons and content containers
    const togglebtn = document.getElementById("readxml-btn");
    const editinfobutton = document.getElementById("viewinfo-btn");
    const mapbtn = document.getElementById("map-btn");
    const content = document.getElementById("content");
    const content1 = document.getElementById("content1");
    const mapcontent = document.getElementById("map");
    const ViewInfoTabsclosed = document.getElementById("View-Info-Tabs-closed");

    // Initialize the button states
    const handleButtonStates = () => {
      if (reslistofxml.length === 0) {
        content.classList.add("hidden");
        content1.classList.add("hidden");
        mapcontent.classList.remove("hidden");

        mapbtn.disabled = true; // Disable the map button
        mapbtn.style.backgroundColor = ""; // Make the map button active
        mapbtn.style.boxShadow = "";
        mapbtn.style.fontWeight = "";

        editinfobutton.disabled = true;
        editinfobutton.style.backgroundColor = ""; // Make the map button active
        editinfobutton.style.boxShadow = "";
        editinfobutton.style.fontWeight = "";

        togglebtn.disabled = true;
        togglebtn.style.backgroundColor = ""; // Make the map button active
        togglebtn.style.boxShadow = "";
        togglebtn.style.fontWeight = "";
      } else {
        content.classList.add("hidden");
        content1.classList.add("hidden");
        mapcontent.classList.remove("hidden");

        mapbtn.disabled = false; // Enable the map button
        mapbtn.style.backgroundColor = "#bf9000"; // Make the map button active
        mapbtn.style.boxShadow = "2px 4px 2px #262626";
        mapbtn.style.fontWeight = "600";

        // editinfobutton.disabled = false;
        // editinfobutton.style.backgroundColor = "#bf9000"; // Make the map button active
        // editinfobutton.style.boxShadow = "2px 4px 2px #262626";
      }
    };

    // Call to initialize button states
    handleButtonStates();

    // Event handlers
    const handleToggleClick = () => {
      content.classList.toggle("hidden");
      content1.classList.add("hidden");
      mapcontent.classList.add("hidden");
      togglebtn.style.backgroundColor = "#bf9000";
      togglebtn.style.boxShadow = "2px 4px 2px #262626";
      togglebtn.style.fontWeight = "600";
      editinfobutton.style.backgroundColor = "";
      editinfobutton.style.boxShadow = "";
      editinfobutton.style.fontWeight = "";
      mapbtn.style.backgroundColor = "";
      mapbtn.style.boxShadow = "";
      mapbtn.style.fontWeight = "";
    };

    const handleEditInfoClick = () => {
      content.classList.add("hidden");
      content1.classList.toggle("hidden");
      mapcontent.classList.add("hidden");
      editinfobutton.style.backgroundColor = "#bf9000";
      editinfobutton.style.boxShadow = "2px 4px 2px #262626";
      editinfobutton.style.fontWeight = "600";
      togglebtn.style.backgroundColor = "";
      togglebtn.style.boxShadow = "";
      togglebtn.style.fontWeight = "";
      mapbtn.style.backgroundColor = "";
      mapbtn.style.boxShadow = "";
      mapbtn.style.fontWeight = "";
    };

    const handleMapClick = () => {
      content.classList.add("hidden");
      content1.classList.add("hidden");
      mapcontent.classList.toggle("hidden");
      mapcontent.classList.remove("hidden");
      mapbtn.style.backgroundColor = "#bf9000";
      mapbtn.style.boxShadow = "2px 4px 2px #262626";
      mapbtn.style.fontWeight = "600";
      togglebtn.style.backgroundColor = "";
      togglebtn.style.boxShadow = "";
      togglebtn.style.fontWeight = "";
      editinfobutton.style.backgroundColor = "";
      editinfobutton.style.boxShadow = "";
      editinfobutton.style.fontWeight = "";
    };

    // const handleTabClosedClick = () => {
    //   content.classList.add("hidden");
    //   content1.classList.add("hidden");
    //   mapcontent.classList.toggle("hidden");
    //   mapcontent.classList.remove("hidden");
    //   mapbtn.style.backgroundColor = "#bf9000";
    //   mapbtn.style.boxShadow = "2px 4px 2px #262626";
    //   mapbtn.style.fontWeight = "600";
    //   togglebtn.style.backgroundColor = "";
    //   togglebtn.style.boxShadow = "";
    //   togglebtn.style.fontWeight = "";
    //   editinfobutton.style.backgroundColor = "";
    //   editinfobutton.style.boxShadow = "";
    //   editinfobutton.style.fontWeight = "";
    // };

    // const handleTabClosedClickReadxml = () => {
    //   content.classList.add("hidden");
    //   content1.classList.add("hidden");
    //   mapcontent.classList.toggle("hidden");
    //   mapcontent.classList.remove("hidden");
    //   mapbtn.style.backgroundColor = "#bf9000";
    //   mapbtn.style.boxShadow = "2px 4px 2px #262626";
    //   mapbtn.style.fontWeight = "600";
    //   togglebtn.style.backgroundColor = "";
    //   togglebtn.style.boxShadow = "";
    //   togglebtn.style.fontWeight = "";
    //   editinfobutton.style.backgroundColor = "";
    //   editinfobutton.style.boxShadow = "";
    //   editinfobutton.style.fontWeight = "";
    // };

    const handleTabClosedClick = () => {
      content.classList.add("hidden");
      content1.classList.add("hidden");
      mapcontent.classList.toggle("hidden");
      mapcontent.classList.remove("hidden");
      mapbtn.style.backgroundColor = "#bf9000";
      mapbtn.style.boxShadow = "2px 4px 2px #262626";
      mapbtn.style.fontWeight = "600";
      togglebtn.style.backgroundColor = "";
      togglebtn.style.boxShadow = "";
      togglebtn.style.fontWeight = "";
      editinfobutton.style.backgroundColor = "";
      editinfobutton.style.boxShadow = "";
      editinfobutton.style.fontWeight = "";
    };

    // const handleTabClosedClickReadxml = () => {
    //   content.classList.add("hidden");
    //   content1.classList.add("hidden");
    //   mapcontent.classList.remove("hidden");
    // };

    togglebtn.addEventListener("click", handleToggleClick);
    editinfobutton.addEventListener("click", handleEditInfoClick);
    mapbtn.addEventListener("click", handleMapClick);
    // ViewInfoTabsclosed.addEventListener("click", handleTabClosedClick);
    //ReadxmlTabsclosed.addEventListener("click", handleTabClosedClickReadxml);

    if (ViewInfoTabsclosed) {
      ViewInfoTabsclosed.addEventListener("click", handleTabClosedClick);
    }

    // Cleanup event listeners when the component is unmounted
    return () => {
      togglebtn.removeEventListener("click", handleToggleClick);
      editinfobutton.removeEventListener("click", handleEditInfoClick);
      mapbtn.removeEventListener("click", handleMapClick);

      if (ViewInfoTabsclosed) {
        ViewInfoTabsclosed.removeEventListener("click", handleTabClosedClick);
      }
    };
  }, [reslistofxml]); // Depend on reslistofxml to re-run effect when it changes

  // const closedtabs = function(){

  // }

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    setSubject(selectedSubject);
    setTopic(""); // Reset topic and chapter when subject changes
    setChapter("");
  };

  const handleTopicChange = (e) => {
    const selectedTopic = e.target.value;
    setTopic(selectedTopic);
    setChapter(""); // Reset chapter when topic changes
  };

  const newOpenPopup = () => {
    setNewPopupVisible(true);
  };

  const newClosePopup = () => {
    setNewPopupVisible(false);
  };

  const toggleContentDiv = () => {
    const contentDiv = document.getElementById("content");
    contentDiv.classList.remove("hidden");

    //contentDiv.classList.toggle("toggle-div");
  };

  const toggleContentDiv1 = () => {
    const contentDiv = document.getElementById("content1");
    contentDiv.classList.remove("hidden");
  };

  const [visibleContent, setVisibleContent] = useState("map");

  // Determine if buttons should be disabled
  const isDisabled = reslistofxml.length === 0;

  const handleButtonClick1 = (contentType) => {
    setVisibleContent(contentType);
  };

  const [filePaths, setFilePaths] = useState([]);

  const handleFileChange = (e) => {
    const selectedFilesArray = Array.from(e.target.files);
    setFilePaths(selectedFilesArray);
    setSaveUploadedFile(selectedFilesArray);
    // Extract file names from selected files and update path state
    const fileNames = selectedFilesArray.map((file) => file.name);
    setPath(fileNames.join(", "));
  };

  //search text in read xml box
  //search text in read xml box
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchPositions, setSearchPositions] = useState([]);
  const [currentPositionText, setCurrentPositionText] = useState("");

  const highlightText = () => {
    const contentElement = document.getElementById("xml_data_id");
    const searchValue = searchTerm.trim();

    // Remove previous highlighting
    contentElement.querySelectorAll(".highlight").forEach((span) => {
      span.classList.remove("highlight");
      span.classList.remove("highlighted");
    });

    if (searchValue !== "") {
      const regex = new RegExp(`(${searchValue})`, "gi");

      const wrapTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          const parts = text.split(regex);
          if (parts.length > 1) {
            const fragment = document.createDocumentFragment();
            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                const span = document.createElement("span");
                span.textContent = part;
                span.classList.add("highlight");
                fragment.appendChild(span);
              } else {
                fragment.appendChild(document.createTextNode(part));
              }
            });
            node.parentNode.replaceChild(fragment, node);
          }
        } else {
          node.childNodes.forEach(wrapTextNodes);
        }
      };

      wrapTextNodes(contentElement);

      const spans = contentElement.querySelectorAll(".highlight");
      const positions = Array.from(spans, (span) => {
        return span.textContent.indexOf(searchValue);
      });
      setSearchPositions(positions);
      setCurrentIndex(0);

      // Update position text
      if (spans.length > 0) {
        setCurrentPositionText(`1/${spans.length}`);
        spans[0].classList.add("highlighted");
        spans[0].scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setCurrentPositionText("");
      }
    } else {
      setSearchPositions([]);
      setCurrentIndex(0);
      setCurrentPositionText(""); // Clear position text
    }
  };

  const navigateSearch = (direction) => {
    if (searchPositions.length === 0) return;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) {
      newIndex = searchPositions.length - 1;
    } else if (newIndex >= searchPositions.length) {
      newIndex = 0;
    }
    setCurrentIndex(newIndex);

    const contentElement = document.getElementById("xml_data_id");
    const spans = contentElement.querySelectorAll(".highlight");

    if (spans.length === 0 || newIndex < 0 || newIndex >= spans.length) {
      console.error("No spans found or invalid index.");
      return;
    }

    spans.forEach((span) => {
      span.classList.remove("highlighted");
    });

    spans[newIndex].classList.add("highlighted");
    spans[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });

    // Update position text
    setCurrentPositionText(`${newIndex + 1}/${spans.length}`);
  };

  const clearSearch = () => {
    const contentElement = document.getElementById("xml_data_id");
    const spans = contentElement.querySelectorAll(".highlight");
    spans.forEach((span) => {
      span.outerHTML = span.innerHTML; // Remove the span element but keep the inner text
    });

    setSearchTerm("");
    setCurrentIndex(0);
    setSearchPositions([]);
    setCurrentPositionText("");
  };

  const isUploadDisabled = !(subject && topic && chapter && captureDataType);

  const handleArchiveClick = () => {
    if (!saveuploadedFiles || saveuploadedFiles.length === 0) {
      // Handle the case where no files are uploaded
      Swal.fire({
        icon: "warning",
        title: "File Upload",
        text: "No files uploaded. Please upload files to archive data!",
      });
      return;
    }

    try {
      // Iterate through each uploaded file
      saveuploadedFiles.forEach((file) => {
        const blob = new Blob([file], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;

        // Append the link to the document and trigger the click
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while processing the files. Please try again.",
      });
    }
  };

  const handleButtonClick = async () => {
    // Check if parsedVariables or its properties have null values
    if (!parsedVariables || parsedVariables.length === 0) {
      // Show SweetAlert error message
      ModalManager.error({
        modalHeaderHeading: "Error",
        modalBodyHeading: "Archival Error",
        message: "No File Upload",
        logo: "MARS_LOGO.png",
        // redirectTo: '/Login' // Specify the URL to redirect to
        // onConfirm: () => fetchData(page),
        confirmButtonText: "ok",
      });
      // Swal.fire({
      //   icon: "warning",
      //   title: "File Upload",
      //   text: "No file uploaded, First Upload the File to Archive Data!",
      // });
      return;
    }

    const features = [];

    parsedVariables.forEach((variable, index) => {
      const { Vertex_LON_LAT } = variable;

      if (Vertex_LON_LAT) {
        const coordinates = Object.keys(Vertex_LON_LAT).map((key) => {
          const yKey = `Y_${key.split("_")[1]}`;
          const xKey = `X_${key.split("_")[1]}`;
          const yValue = parseFloat(Vertex_LON_LAT[yKey]);
          const xValue = parseFloat(Vertex_LON_LAT[xKey]);
          return [xValue, yValue]; // Swap x and y for GeoJSON format
        });

        // Check if we have enough coordinates to create a polygon
        if (coordinates.length >= 3) {
          // Add the first coordinate to the end to close the polygon
          coordinates.push(coordinates[0]);

          // Create a GeoJSON Polygon feature
          const feature = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coordinates],
            },
            // properties: {
            //   xmlFile: responseData && responseData.dim_file_name,
            //   dataCODE: variable.dataCODE,
            //   dataName: variable.dataName,
            // },
          };

          // Add the feature to the features array
          features.push(feature);
        }
      }
    });

    if (features.length === 0) {
      // Show SweetAlert error message
      Swal.fire({
        icon: "warning",
        title: "No Polygons",
        text: "No valid polygons found in the data.",
      });
      return;
    }

    try {
      // Create a GeoJSON FeatureCollection
      const geojson = {
        type: "FeatureCollection",
        features: features,
      };

      // Download the Shapefile directly
      shpwrite.download(geojson, {
        folder: "PolygonShapefile",
        types: { polygon: "PolygonShapefile" },
      });
    } catch (error) {
      // Show SweetAlert error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while processing the file. Please try again.",
      });
    }
  };

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = imageData;
  //   link.download = 'image.jpg';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // map
  const mapRef = useRef(null);
  // const [drawingRectangle, setDrawingRectangle] = useState(false);
  const [drawingRectangleZoomIn, setDrawingRectangleZoomIn] = useState(false);
  const [drawingRectangleZoomOut, setDrawingRectangleZoomOut] = useState(false);

  // useEffect(() => {
  //   // Create a map centered at a specific location
  //   const map = L.map("map").setView([20.5937, 78.9629], 4);
  //   mapRef.current = map;

  //   // Add an OpenStreetMap tile layer
  //   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
  //     mapRef.current
  //   );

  //   // Create different tile layers (basemaps)
  //   const openStreetMap = L.tileLayer(
  //     "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //     {
  //       maxZoom: 19,
  //     }
  //   );
  //   const Esri_WorldImagery = L.tileLayer(
  //     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  //     {
  //       maxZoom: 18,
  //     }
  //   );
  //   const BlankMap = L.tileLayer("", {
  //     attribution: "Blank Map",
  //     // You can customize options for the blank map here
  //   });

  //   // Create an object to hold basemaps
  //   const baseMaps = {
  //     "Open Street Map": openStreetMap,
  //     "ESRI WorldImagery": Esri_WorldImagery,
  //     // "Balnk Map": BlankMap,
  //   };

  //   // Add layer control to switch between basemaps
  //   L.control.layers(baseMaps, null, { position: 'topleft' }).addTo(map);

  //   // Add Map Scale
  //   L.control
  //     .scale({
  //       metric: true,
  //       imperial: false,
  //       position: "bottomleft",
  //     })
  //     .addTo(map);
  //   // Remove default zoom control
  //   map.removeControl(map.zoomControl);

  //   // Add zoom control
  //   L.control
  //     .zoom({
  //       position: "topleft",
  //     })
  //     .addTo(map);
  //   var startPoint, endPoint, rectangle;
  //   var isDrawing = false;

  //   map.on('mousedown', function (e) {
  //     isDrawing = true;
  //     startPoint = e.latlng;

  //     // Create a rectangle with the starting point (no size yet)
  //     rectangle = L.rectangle([startPoint, startPoint], { color: "#ff7800", weight: 1 }).addTo(map);
  //   });

  //   map.on('mousemove', function (e) {
  //     if (!isDrawing) return;

  //     endPoint = e.latlng;

  //     // Update the rectangle bounds as the mouse moves
  //     rectangle.setBounds(L.latLngBounds(startPoint, endPoint));
  //   });

  //   map.on('mouseup', function (e) {
  //     isDrawing = false;

  //     if (rectangle) {
  //       // Fit the map to the bounds of the rectangle
  //       map.fitBounds(rectangle.getBounds());
  //     }

  //     // Optionally, remove the rectangle after zooming or keep it on the map
  //     // map.removeLayer(rectangle); // Uncomment to remove the rectangle
  //   });

  //   openStreetMap.addTo(map);
  //   // Save the initial extent
  //   // setExtents([map.getBounds()]);
  //   // setCurrentExtentIndex(0); // Set initial extent index to 0
  //   const updateScaleLineStyle = (mapElements, isEsriImagery) => {
  //     mapElements.forEach(mapElement => {
  //       if (!mapElement) return;

  //       // Ensure there's only one scale line element
  //       const scaleLines = mapElement.querySelectorAll('.leaflet-control-scale-line');
  //       if (scaleLines.length > 1) {
  //         // If more than one scale line is found, remove the duplicates
  //         scaleLines.forEach((scaleLine, index) => {
  //           if (index > 0) scaleLine.remove();
  //         });
  //       }

  //       const scaleLine = mapElement.querySelector('.leaflet-control-scale-line');

  //       if (scaleLine) {
  //         // Update styles based on the layer type
  //         if (isEsriImagery) {
  //           scaleLine.style.backgroundColor = 'none';
  //           scaleLine.style.borderBottomColor = 'yellow';
  //           scaleLine.style.borderLeftColor = 'yellow';
  //           scaleLine.style.borderRightColor = 'yellow';
  //           scaleLine.style.color = 'white';
  //         } else {
  //           scaleLine.style.backgroundColor = 'none';
  //           scaleLine.style.borderBottomColor = 'black';
  //           scaleLine.style.borderLeftColor = 'black';
  //           scaleLine.style.borderRightColor = 'black';
  //           scaleLine.style.color = 'black';
  //         }
  //       }
  //     });
  //   };

  //   mapRef.current.on('baselayerchange', function (e) {
  //     const mapElements = [
  //       document.getElementById('map')
  //     ];

  //     const isEsriImagery = (e.name === 'ESRI WorldImagery');

  //     mapElements.forEach(mapElement => {
  //       if (!mapElement) return;

  //       // Toggle the appropriate class based on the base layer type
  //       if (isEsriImagery) {
  //         mapElement.classList.add('esriimagery');
  //         mapElement.classList.remove('openstreetmap');
  //       } else {
  //         mapElement.classList.add('openstreetmap');
  //         mapElement.classList.remove('esriimagery');
  //       }
  //     });

  //     updateScaleLineStyle(mapElements, isEsriImagery);
  //   });

  //   // Map Coordinates Display (lat and long)
  //   mapRef.current.on("mousemove", function (e) {
  //     // //console.log(e); // You can remove this line if you don't need to log the event

  //     const coordinateElement = document.getElementById("coordinate");
  //     if (coordinateElement) {
  //       coordinateElement.innerHTML = `Lat: ${e.latlng.lat.toFixed(4)} &nbsp; &nbsp; Long: ${e.latlng.lng.toFixed(4)}`;
  //     }
  //   });

  //   // Function to capture the map's bounds
  //   // const captureExtent = () => {
  //   //   setExtents(prevExtents => {
  //   //     const newExtent = map.getBounds();
  //   //     return [...prevExtents, newExtent];
  //   //   });
  //   //   setCurrentExtentIndex(prevIndex => extents.length);
  //   // };

  //   // // Add event listeners to capture bounds changes
  //   // map.on('moveend', captureExtent);
  //   // map.on('zoomend', captureExtent);

  //   // Capture initial extent
  //   // captureExtent();

  //   return () => {
  //     // Clean up the map when the component is unmounted
  //     if (mapRef.current) {
  //       mapRef.current.remove();
  //     }
  //   };
  // }, []); // Empty dependency array to run only once when the component mounts

  const rectangleZoomInRef = useRef(null);
  const rectangleZoomOutRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    let map = null;
    let scrollWheelZoomEnable = () => { };
    let scrollWheelZoomDisable = () => { };
    mapContainerRef.current = document.getElementById("map");

    if (!mapContainerRef.current) {
      console.error("Error: Map container not found.");
      return;
    }
    map = L.map("map",
      {
        scrollWheelZoom: false,
        minZoom: 2,
      }
    ).setView([20.5937, 78.9629], 4);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );

    const openStreetMap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19 }
    );
    const Esri_WorldImagery = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18 }
    );
    const baseMaps = {
      "Open Street Map": openStreetMap,
      "ESRI WorldImagery": Esri_WorldImagery,
    };
    openStreetMap.addTo(map);
    L.control.layers(baseMaps, null, { position: "topleft" }).addTo(map);
    L.control
      .scale({ metric: true, imperial: false, position: "bottomleft" })
      .addTo(map);
    map.removeControl(map.zoomControl);
    // L.control.zoom({ position: 'topleft' }).addTo(map);
    mapContainerRef.current.addEventListener(
      "mouseenter",
      (scrollWheelZoomEnable = () => {
        if (map) {
          map.scrollWheelZoom.enable();
        }
      })
    );

    mapContainerRef.current.addEventListener(
      "mouseleave",
      (scrollWheelZoomDisable = () => {
        if (map) {
          map.scrollWheelZoom.disable();
        }
      })
    );

    const updateScaleLineStyle = (mapElements, isEsriImagery) => {
      mapElements.forEach((mapElement) => {
        if (!mapElement) return;
        const scaleLines = mapElement.querySelectorAll(
          ".leaflet-control-scale-line"
        );
        if (scaleLines.length > 1) {
          scaleLines.forEach((scaleLine, index) => {
            if (index > 0) scaleLine.remove();
          });
        }
        const scaleLine = mapElement.querySelector(
          ".leaflet-control-scale-line"
        );
        if (scaleLine) {
          scaleLine.style.backgroundColor = "none";
          scaleLine.style.borderBottomColor = isEsriImagery
            ? "yellow"
            : "black";
          scaleLine.style.borderLeftColor = isEsriImagery ? "yellow" : "black";
          scaleLine.style.borderRightColor = isEsriImagery ? "yellow" : "black";
          scaleLine.style.color = isEsriImagery ? "white" : "black";
        }
      });
    };

    map.on("baselayerchange", function (e) {
      const mapElements = [document.getElementById("map")];
      const isEsriImagery = e.name === "ESRI WorldImagery";
      mapElements.forEach((mapElement) => {
        if (mapElement) {
          mapElement.classList.toggle("esriimagery", isEsriImagery);
          mapElement.classList.toggle("openstreetmap", !isEsriImagery);
        }
      });
      updateScaleLineStyle(mapElements, isEsriImagery);
    });

    map.on("mousemove", function (e) {
      const coordinateElement = document.getElementById("coordinate");
      if (coordinateElement) {
        coordinateElement.innerHTML = `Lat: ${e.latlng.lat.toFixed(
          4
        )} &nbsp; &nbsp; Long: ${e.latlng.lng.toFixed(4)}`;
      }
    });

    return () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.removeEventListener(
          "mouseenter",
          scrollWheelZoomEnable
        );
        mapContainerRef.current.removeEventListener(
          "mouseleave",
          scrollWheelZoomDisable
        );
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    let isDrawing = false;
    let startPoint = null;
    let bounds = null;

    const handleMouseDown = (e) => {
      if (!drawingRectangleZoomOut) return;
      isDrawing = true;
      startPoint = e.latlng;
      bounds = L.latLngBounds(startPoint, startPoint);

      // Create and add the rectangle to the map
      if (rectangleZoomOutRef.current) {
        map.removeLayer(rectangleZoomOutRef.current);
      }
      rectangleZoomOutRef.current = L.rectangle(bounds, {
        color: "#ff7800",
        weight: 1,
      }).addTo(map);

      // Keep 'zoom-out' cursor during drawing
      map.getContainer().style.cursor = "zoom-out";
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !drawingRectangleZoomOut) return;
      bounds = L.latLngBounds(startPoint, e.latlng);
      rectangleZoomOutRef.current.setBounds(bounds);
      // Keep 'zoom-out' cursor during drawing
      map.getContainer().style.cursor = "zoom-out";
    };

    const handleMouseUp = () => {
      if (!isDrawing || !drawingRectangleZoomOut || !bounds) return;
      isDrawing = false;

      const center = bounds.getCenter(); // Get the center of the bounds
      const zoom = map.getBoundsZoom(bounds); // Calculate the zoom level for the bounds

      // Set the view with the center and zoom level after drawing is complete
      map.setView(center, zoom);

      // After setting the view, zoom out by 2 levels
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom - 2);

      // Remove the rectangle layer after zooming
      if (rectangleZoomOutRef.current) {
        map.removeLayer(rectangleZoomOutRef.current);
        rectangleZoomOutRef.current = null; // Clear the reference
      }

      map.getContainer().style.cursor = "";
    };

    if (drawingRectangleZoomOut) {
      map.on("mousedown", handleMouseDown);
      map.on("mousemove", handleMouseMove);
      map.on("mouseup", handleMouseUp);

      // Set initial 'zoom-in' cursor when starting drawing
      map.getContainer().classList.add("ArchivalSelectedZoomOut");
    } else {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      // Reset cursor when not drawing
      map.getContainer().classList.remove("ArchivalSelectedZoomOut");
      map.getContainer().style.cursor = ""; // Clear any applied cursor styles
    }

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      map.getContainer().style.cursor = ""; // Reset cursor on cleanup
    };
  }, [drawingRectangleZoomOut]);


  const toggleRectangleDrawingZoomOut = (e) => {
    e.stopPropagation(); // Prevents the click from reaching the map
    if (drawingRectangleZoomOut) {
      // If drawing is enabled, disable it
      setDrawingRectangleZoomOut(false);
    } else {
      // If drawing is disabled, enable it
      setDrawingRectangleZoomOut(true);
    }
    setDrawingRectangleZoomIn(false); // Disable the zoom-in mode
    setIsPanningEnabled(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    let isDrawing = false;
    let startPoint = null;
    let bounds = null;

    const handleMouseDown = (e) => {
      if (!drawingRectangleZoomIn) return;

      isDrawing = true;
      startPoint = e.latlng;
      bounds = L.latLngBounds(startPoint, startPoint);

      // Create and add the rectangle to the map
      if (rectangleZoomInRef.current) {
        map.removeLayer(rectangleZoomInRef.current);
      }
      rectangleZoomInRef.current = L.rectangle(bounds, {
        color: "#ff7800",
        weight: 1,
      }).addTo(map);

      // Set cursor to 'zoom-in' during drawing
      map.getContainer().style.cursor = "zoom-in";
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || !drawingRectangleZoomIn) return;

      bounds = L.latLngBounds(startPoint, e.latlng);
      rectangleZoomInRef.current.setBounds(bounds);

      // Keep 'zoom-in' cursor during drawing
      map.getContainer().style.cursor = "zoom-in";
    };

    const handleMouseUp = () => {
      if (!isDrawing || !drawingRectangleZoomIn || !bounds) return;
      isDrawing = false;

      const center = bounds.getCenter(); // Get the center of the bounds
      const zoom = map.getBoundsZoom(bounds); // Calculate the zoom level for the bounds
      map.setView(center, zoom); // Set the view with center and zoom

      // Remove the rectangle layer after zooming
      if (rectangleZoomInRef.current) {
        map.removeLayer(rectangleZoomInRef.current);
        rectangleZoomInRef.current = null; // Clear the reference
      }

      // Reset cursor after drawing is complete
      map.getContainer().style.cursor = "";
    };

    if (drawingRectangleZoomIn) {
      map.on("mousedown", handleMouseDown);
      map.on("mousemove", handleMouseMove);
      map.on("mouseup", handleMouseUp);

      // Set initial 'zoom-in' cursor when starting drawing
      map.getContainer().classList.add("ArchivalSelectedZoomIn");
    } else {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);

      // Reset cursor when not drawing
      map.getContainer().classList.remove("ArchivalSelectedZoomIn");
      map.getContainer().style.cursor = ""; // Clear any applied cursor styles
    }

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      map.getContainer().style.cursor = ""; // Reset cursor on cleanup
    };
  }, [drawingRectangleZoomIn, mapRef]);

  const toggleRectangleDrawingZoomIn = (e) => {
    e.stopPropagation(); // Prevents the click from reaching the map
    if (drawingRectangleZoomIn) {
      // If drawing is enabled, disable it
      setDrawingRectangleZoomIn(false);
    } else {
      // If drawing is disabled, enable it
      setDrawingRectangleZoomIn(true);
    }
    setDrawingRectangleZoomOut(false); // Disable the zoom-out mode
    setIsPanningEnabled(false);
  };

  // useEffect(() => {
  //   if (!mapRef.current) return;
  //   if (mapRef.current) {
  //     // Set max bounds to a specific area // maxBounds that encompass the entire globe
  //     // const maxBounds = [[43.0, 74.0], [1.0, 78.0]]; // Example bounds for a region// Set max bounds once during initialization
  //     const maxBounds = [
  //       [-85, -180],
  //       [85, 180],
  //     ];
  //     mapRef.current.setMaxBounds(maxBounds);
  //     // Setting map options with maxBoundsViscosity
  //     mapRef.current.options.maxBoundsViscosity = 1.0;
  //   }

  //   // Select all button elements within the toolbar
  //   const buttonElements = document.querySelectorAll(
  //     ".leaflet-pm-toolbar .button-container"
  //   );

  //   // Loop over each button and disable click propagation for each one
  //   buttonElements.forEach((button) => {
  //     L.DomEvent.disableClickPropagation(button);
  //   });

  //   // Select all button elements within the toolbar
  //   const buttonElements1 = document.querySelectorAll(".polygonebutntoggle");

  //   // Loop over each button and disable click propagation for each one
  //   buttonElements1.forEach((button) => {
  //     L.DomEvent.disableClickPropagation(button);
  //   });
  // }, [mapRef]);


  useEffect(() => {
    if (!mapRef.current) return; // Ensure the mapRef is initialized

    // Ensure mapRef.current is a valid Leaflet map instance
    const map = mapRef.current;

    // Set max bounds to the entire globe
    const maxBounds = [
      [-85, -180],
      [85, 180],
    ];
    map.setMaxBounds(maxBounds); // Set max bounds

    // Set maxBoundsViscosity directly on the map instance if needed
    map.options.maxBoundsViscosity = 1.0;

    // Disable click propagation for buttons within the toolbar
    const buttonElements = document.querySelectorAll(
      ".leaflet-pm-toolbar .button-container"
    );
    buttonElements.forEach((button) => {
      L.DomEvent.disableClickPropagation(button);
    });

    // Disable click propagation for other buttons as well
    const polygonButtonElements = document.querySelectorAll(".polygonebutntoggle");
    polygonButtonElements.forEach((button) => {
      L.DomEvent.disableClickPropagation(button);
    });

  }, [mapRef.current]); // You can also use [mapRef.current] instead of [mapRef]


  const handleFullExtent = () => {
    if (mapRef.current) {
      // const currentZoom = mapRef.current.getZoom();

      // // If the current zoom is 2, do nothing
      // if (currentZoom === 2) {
      //   return;
      // }

      // // Otherwise, fit the map to the global bounds and set zoom level to 2
      // const bounds = [[-85, -180], [85, 180]]; // The entire world within reasonable latitude bounds
      // mapRef.current.fitBounds(bounds, { animate: true });
      // mapRef.current.setZoom(2);

      // setExtents([mapRef.current.getBounds()]);
      // setCurrentExtentIndex(0); // Reset to full extent

      mapRef.current.setView([20.5937, 78.9629], 4);
      setExtents([mapRef.current.getBounds()]);
      setCurrentExtentIndex(0); // Reset to full extent
      setIsPanningEnabled(false);
      setDrawingRectangleZoomIn(false);
      setDrawingRectangleZoomOut(false);
    }
  };

  const captureExtent = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();

      // Capture polygon coordinates for the current extent
      const coords = [
        bounds.getSouthWest(),
        bounds.getNorthWest(),
        bounds.getNorthEast(),
        bounds.getSouthEast(),
        bounds.getSouthWest(),
      ].map((latlng) => [latlng.lat, latlng.lng]); // Convert to [lat, lng]

      // Add the new coordinates to the array
      setPolygonCoordinates((prevCoords) => {
        const newCoords = [...prevCoords, coords];

        // Remove duplicate arrays from the array
        const uniqueCoords = removeDuplicates(newCoords);

        // Set current extent index to the last index after adding new coordinates
        setCurrentExtentIndex((prevIndex) =>
          Math.min(prevIndex, uniqueCoords.length - 1)
        );

        return uniqueCoords;
      });
    }
  };

  // Helper function to remove duplicate arrays
  const removeDuplicates = (array) => {
    const seen = new Set();
    return array.filter((item) => {
      const serializedItem = JSON.stringify(item);
      if (seen.has(serializedItem)) {
        return false; // It's a duplicate, so filter it out
      }
      seen.add(serializedItem);
      return true; // It's unique, so keep it
    });
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("moveend", captureExtent);
      mapRef.current.on("zoomend", captureExtent);

      // Capture initial extent
      captureExtent();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", captureExtent);
        mapRef.current.off("zoomend", captureExtent);
      }
    };
  }, [mapRef.current]); // Add mapRef.current as a dependency

  const handlePreviousExtent = () => {
    if (mapRef.current && polygonCoordinates.length > 0) {
      // Calculate the next index (in the reversed sequence, so we add 1)
      const nextIndex = Math.min(
        polygonCoordinates.length - 1,
        currentExtentIndex + 1
      );
      const nextCoords = polygonCoordinates[nextIndex];

      if (nextCoords && nextCoords.length > 0) {
        const bounds = L.latLngBounds(
          nextCoords.map((coord) => L.latLng(coord))
        );
        mapRef.current.fitBounds(bounds);
        setCurrentExtentIndex(nextIndex);
      } else {
        console.error("No coordinates found for the next index:", nextCoords);
      }
    } else {
      console.error(
        "Map reference is not available, or coordinates array is empty."
      );
    }
    setIsPanningEnabled(false);
    setDrawingRectangleZoomIn(false);
    setDrawingRectangleZoomOut(false);
  };

  const handleNextExtent = () => {
    if (
      mapRef.current &&
      polygonCoordinates.length > 0 &&
      currentExtentIndex > 0
    ) {
      // Calculate the previous index (in the reversed sequence, so we subtract 1)
      const previousIndex = Math.max(0, currentExtentIndex - 1);
      const previousCoords = polygonCoordinates[previousIndex];

      if (previousCoords && previousCoords.length > 0) {
        const bounds = L.latLngBounds(
          previousCoords.map((coord) => L.latLng(coord))
        );
        mapRef.current.fitBounds(bounds);
        setCurrentExtentIndex(previousIndex);
      } else {
        console.error(
          "No coordinates found for the previous index:",
          previousCoords
        );
      }
    } else {
      console.error(
        "Map reference is not available, or coordinates array is empty."
      );
    }
    setIsPanningEnabled(false);
    setDrawingRectangleZoomIn(false);
    setDrawingRectangleZoomOut(false);
  };
  const [isPanningEnabled, setIsPanningEnabled] = useState(true);

  // Function to toggle panning mode
  // const handlePanToggle = () => {
  //   setIsPanningEnabled((prev) => !prev);
  //   console.log('Pan toggled:', !isPanningEnabled);
  // };

  const handlePanToggle = () => {
    if (isPanningEnabled) {
      // If panning is already enabled, disable it
      setIsPanningEnabled(false);
    } else {
      // If panning is disabled, enable it
      setIsPanningEnabled(true);
    }
    setDrawingRectangleZoomIn(false);
    setDrawingRectangleZoomOut(false);
  };

  // Function to cancel panning mode
  const handleCancelPan = (event) => {
    event.stopPropagation(); // Prevent any event bubbling issues
    setIsPanningEnabled(false);
  };

  // Effect to handle enabling/disabling panning
  useEffect(() => {
    if (mapRef.current) {
      if (isPanningEnabled) {
        mapRef.current.dragging.enable();
        // console.log("Panning enabled");
      } else {
        mapRef.current.dragging.disable();
        // console.log("Panning disabled");
      }
    }
  }, [isPanningEnabled, mapRef]);

  const handleFixedZoomIn = () => {
    // Adjust the zoom level to zoom in (e.g., zoom in one level)
    const currentZoom = mapRef.current.getZoom();
    mapRef.current.setZoom(currentZoom + 1);
    setIsPanningEnabled(false);
    setDrawingRectangleZoomIn(false);
    setDrawingRectangleZoomOut(false);
  };

  const handleFixedZoomOut = () => {
    // Adjust the zoom level to zoom out (e.g., zoom out one level)
    const currentZoom = mapRef.current.getZoom();
    mapRef.current.setZoom(currentZoom - 1);
    setIsPanningEnabled(false);
    setDrawingRectangleZoomIn(false);
    setDrawingRectangleZoomOut(false);
  };

  const [layers, setLayers] = useState([]);
  const [layerVisibility, setLayerVisibility] = useState({});
  const [isArchivalLayerBoxVisible, setIsArchivalLayerBoxVisible] =
    useState(false);

  const colorPalette = [
    "#333333",
    "#4B0082",
    "#800020",
    "#654321",
    "#013220",
    "#00008B",
  ]; // Added dark blue

  useEffect(() => {
    if (
      !parsedVariables ||
      !Array.isArray(parsedVariables) ||
      parsedVariables.length === 0
    ) {
      return;
    }

    if (mapRef.current) {
      // Remove all existing layers from the map
      mapRef.current.eachLayer((layer) => {
        layer.remove();
      });
      // Add the OpenStreetMap layer as the default basemap
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {}
      ).addTo(mapRef.current);
    }

    const newLayers = [];
    const newLayerVisibility = {};
    console.log("parsedVariables: ", parsedVariables);

    parsedVariables.forEach((variable, index) => {
      // console.log("variable ",variable, index)
      const { Vertex_LON_LAT } = variable;

      if (!Vertex_LON_LAT) {
        return;
      }

      const coordinates = Object.keys(Vertex_LON_LAT).map((key) => {
        const yKey = `Y_${key.split("_")[1]}`;
        const xKey = `X_${key.split("_")[1]}`;
        const yValue = parseFloat(Vertex_LON_LAT[yKey]);
        const xValue = parseFloat(Vertex_LON_LAT[xKey]);
        return [yValue, xValue];
      });

      const randomColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];

      if (
        showPolygon &&
        coordinates.length >= 3 &&
        coordinates.every((coord) => !isNaN(coord[0]) && !isNaN(coord[1]))
      ) {
        const polygon = L.polygon(coordinates, {
          color: randomColor,
          fillColor: randomColor,
          fillOpacity: 0.1,
        }).addTo(mapRef.current);

        const layerName = `Layer ${index + 1}`;
        newLayers.push({
          id: polygon._leaflet_id,
          name: layerName,
          layer: polygon,
        });
        newLayerVisibility[layerName] = true;

        mapRef.current.fitBounds(polygon.getBounds());

        const geoJson = polygon.toGeoJSON();
        // const area = turf.area(geoJson) / 1000000; // Convert square meters to square kilometers
        const tooltipContent = `
          <div style="text-transform; font-size: 12px;">
            <span>${layerName}</span><br>
            Area: ${` ${parseFloat(variable.DAREA).toFixed(2)} ${variable.DAREA_UNIT}`} 
          </div>`;
        const tooltip = L.tooltip({
          permanent: true,
          className: "custom-tooltip", // Add a custom class for further styling
          direction: "top",
          offset: [0, -10], // Offset to position tooltip above the layer
        }).setContent(tooltipContent);

        polygon.bindTooltip(tooltip);
      }
    });

    setLayers(newLayers);
    setLayerVisibility(newLayerVisibility);
  }, [parsedVariables, showPolygon]);

  const handleCheckboxChange = (layerName) => {
    setLayerVisibility((prevState) => {
      const newState = { ...prevState, [layerName]: !prevState[layerName] };
      const layer = layers.find((l) => l.name === layerName).layer;
      if (newState[layerName]) {
        layer.addTo(mapRef.current);
        mapRef.current.fitBounds(layer.getBounds()); // Fit bounds when the layer is added
      } else {
        mapRef.current.removeLayer(layer);
      }
      return newState;
    });
  };
  const zoomToLayerSelected = () => {
    // Initialize an empty LatLngBounds object
    const bounds = new L.LatLngBounds();

    // Loop through all layers and extend the bounds to include each layer's bounds
    layers.forEach((layerObj) => {
      const layer = layerObj.layer;
      if (mapRef.current.hasLayer(layer)) {
        bounds.extend(layer.getBounds());
      }
    });

    // Check if bounds are valid before fitting them to the map
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds);
    }
    setIsPanningEnabled(false);
  };

  const toggleArchivalLayerBox = () => {
    if (layers.length === 0) return;
    setIsArchivalLayerBoxVisible(!isArchivalLayerBoxVisible);
  };

  const uploadFile = async () => {
    try {
      setLoading(true); // Set loading to true when starting the upload
      setProgress(0);
      setDownloadUrl("");

      let allMessages = [];
      const newZipBlobWriter = new BlobWriter("application/zip");
      const newZipWriter = new ZipWriter(newZipBlobWriter);
      let hasMatchingXmlFiles = false;

      // Iterate over file paths
      for (const file of filePaths) {

        // ____________________________________________________________________

        // Get the size of the file in bytes
        const fileSizeInBytes = file.size;

        // Convert to more readable format (KB/MB)
        // const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Size in KB
        // const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Size in MB

        // Log or store file size information
        // console.log(
        //   `File size: ${fileSizeInBytes} bytes (${fileSizeInKB} KB, ${fileSizeInMB} MB)`
        // );

        // Log the actual file size in GB
        // const fileSizeInGB = (fileSizeInBytes / 1024 ** 3).toFixed(2); // Size in GB, rounded to 2 decimal places
        // console.log(`File size: ${fileSizeInGB} GB`);


        // Convert the file size into readable formats
        const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Size in KB
        const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Size in MB
        const fileSizeInGB = (fileSizeInBytes / (1024 ** 3)).toFixed(2); // Size in GB

        // Determine which unit to use for display
        let readableXMLFileSize = '';
        
        if (fileSizeInBytes < 1024) {
          readableXMLFileSize = `${fileSizeInBytes} bytes`;
        } else if (fileSizeInBytes < 1024 * 1024) {
          readableXMLFileSize = `${fileSizeInKB} KB`;
        } else if (fileSizeInBytes < 1024 ** 3) {
          readableXMLFileSize = `${fileSizeInMB} MB`;
        } else {
          readableXMLFileSize = `${fileSizeInGB} GB`;
        }

        // Log or display the file size
        console.log(`File size: ${readableXMLFileSize}`);

        setreadableFileSize(readableXMLFileSize)
        


        // ___________________________________________________________________

        const zipFileReader = new BlobReader(file);
        const zipReader = new ZipReader(zipFileReader);
        const entries = await zipReader.getEntries();
        const fileNames = entries.map((entry) => entry.filename);

        const desiredFile = "DIM_";
        const desiredPrefix = "PREVIEW_";
        const desiredExtension = ".jpg";

        // Filter XML files and extract values
        const matchingFiles = fileNames.filter(
          (item) => item.includes(desiredFile) && item.endsWith(".XML")
        );
        // //console.log(matchingFiles)
        matchingFiles.forEach((file) => {
          const filename = file.split("/").pop();
          // //console.log(filename);
          const match = filename.split("_")[1];
          // //console.log(match)
          allMessages.push(match);
        });

        // Filter JPG files
        const matchingFilesJpg = fileNames.filter(
          (item) =>
            item.includes(desiredPrefix) &&
            item.toLowerCase().endsWith(desiredExtension)
        );

        if (matchingFiles.length > 0) {
          hasMatchingXmlFiles = true;

          // Add matching files to the new ZIP
          for (const filePath of matchingFiles) {
            const entry = entries.find((entry) => entry.filename === filePath);
            const fileContent = await entry.getData(new BlobWriter());
            await newZipWriter.add(filePath, new BlobReader(fileContent));
          }

          for (const filePath of matchingFilesJpg) {
            const entry = entries.find((entry) => entry.filename === filePath);
            const fileContent = await entry.getData(new BlobWriter());
            await newZipWriter.add(filePath, new BlobReader(fileContent));
          }
        }

        await zipReader.close();
      }

      const selectedMissionForValidation =
        document.getElementById("chapter").value;
      const allMatch = allMessages.every((message) =>
        message.startsWith(selectedMissionForValidation)
      );
      console.table([selectedMissionForValidation, allMatch, allMessages]);
      if (!allMatch) {
        const notMatchedMessages = allMessages.filter(
          (message) => !message.startsWith(selectedMissionForValidation)
        );
        const notMatchedNames = Array.from(new Set(notMatchedMessages)).join(
          ", "
        );

        ModalManager.warning({
          modalHeaderHeading: "Archival Warning",
          modalBodyHeading: "Extract Data",
          message: `No Selected Mission matches with the uploaded files.<br> Selected Mission: ${selectedMissionForValidation} <br> Uploaded Mission: ${notMatchedNames}`,
          confirmButtonText: "ok",
          logo: "MARS_LOGO.png",
          ////onConfirm: () => window.location.reload(),
        });

        setLoading(false);
        return;
      }

      if (!hasMatchingXmlFiles) {
        ModalManager.warning({
          modalHeaderHeading: "Archival Warning",
          modalBodyHeading: "Extract Data",
          message: "No XML files found in Zip files.",
          confirmButtonText: "ok",
          logo: "MARS_LOGO.png",
          ////onConfirm: () => window.location.reload(),
        });

        setLoading(false);
        return;
      }

      const newZipBlob = await newZipWriter.close();
      const formData = new FormData();
      formData.append("file", newZipBlob, "filtered_files.zip");

      const selectedMission = document.getElementById("chapter").value;
      const selectedCaptureDataType =
        document.getElementById("captureDataType").value;
      const data = {
        mission: selectedMission,
        option: selectedCaptureDataType,
      };

      // Convert the object to JSON string
      const jsonData = JSON.stringify(data);

      // Append the JSON data to formData
      formData.append("data", jsonData);

      const source = axios.CancelToken.source();
      uploadRequestRef.current = source;

      const response = await axios.post(
        "http://127.0.0.1:8000/archival/my_new_file_upload_view_tri_sterio/",
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
          cancelToken: source.token,
        }
      );

      if (response.status === 201) {
        const {
          Something_wrong_in_ZIP,
          COUNT_XML_FILE,
          tags_present_in_xml_file,
        } = response.data;

        if (Something_wrong_in_ZIP) {
          setLoading(false);
          ModalManager.warning({
            modalHeaderHeading: "Warning",
            modalBodyHeading: "Extract Data",
            logo: "MARS_LOGO.png",
            message: `You Have Did SomeThing Wrong - <p class="output-folder-path">${Something_wrong_in_ZIP + COUNT_XML_FILE
              } XML only</p>`,
            confirmButtonText: "ok",
            ////onConfirm: () => window.location.reload(),
          });
        } else {
          if (tags_present_in_xml_file.length !== 0) {
            const satName = tags_present_in_xml_file[0].SATT_NA;

            if (satName) {
              responseDataRef.current = response.data;
            } else {
              Swal.fire({
                icon: "warning",
                title: "Extract Warning",
                text: `You Selected Data Parameter\n${satName} and Extract ${selectedMission}`,
              });
              responseDataRef.current = null;
            }

            const imageDataXml =
              tags_present_in_xml_file[0]?.image_data_xml?.image_data;
            if (imageDataXml && imageDataXml.length < 0) {
              ModalManager.warning({
                modalHeaderHeading: "Warning",
                modalBodyHeading: "Extract Data",
                logo: "MARS_LOGO.png",
                message: "Extract Data File Don't Have Preview Image",
                confirmButtonText: "ok",
              });
              setShowImage(false);
            }
          } else {
            ModalManager.warning({
              modalHeaderHeading: "Warning",
              modalBodyHeading: "Upload warning",
              logo: "MARS_LOGO.png",
              message: "No DIM_ file found in the ZIP file.",
              confirmButtonText: "ok",
              ////onConfirm: () => window.location.reload(),
            });
          }
        }
      }
    } catch (error) {
      setLoading(false);
      setProgress(100);
      if (axios.isCancel(error)) {
        //console.log("Request cancelled", error.message);
      } else {
        let errorMessage = "An unknown error occurred";
        if (
          error.response &&
          error.response.data &&
          error.response.data["PIXEL NOT FOUND"]
        ) {
          errorMessage = error.response.data["PIXEL NOT FOUND"];
        }

        ModalManager.error({
          modalHeaderHeading: "Error",
          modalBodyHeading: "Extract Data Failed",
          message: errorMessage,
          logo: "MARS_LOGO.png",
          confirmButtonText: "ok",
          //onConfirm: () => window.location.reload(),
        });
      }
    }
  };

  const handleOKButtonClick = () => {
    if (responseDataRef.current) {
      // Handle data not found
      if (responseDataRef.current.list_data_not_found) {
        const datanotfoundinxml = responseDataRef.current.list_data_not_found;
        setShowlistdatanotfound(datanotfoundinxml);
      }

      // Update parsed variables and file names
      if (responseDataRef.current.tags_present_in_xml_file) {
        parsedVariablesRef.current =
          responseDataRef.current.tags_present_in_xml_file;
        // //console.log("parsedVariablesRef ", parsedVariablesRef.current); // Ensure logging current value

        const fileNamesXML =
          responseDataRef.current.tags_present_in_xml_file.map(
            (item) => item.file_name_xml
          );
        setReslistofxml(fileNamesXML);
        // Assuming responseDataRef.current.tags_present_in_xml_file is an array of objects
        const tagsArray = responseDataRef.current.tags_present_in_xml_file;

        // Reverse the array
        const reversedTagsArray = tagsArray.slice().reverse(); // Use slice() to create a shallow copy before reversing

        // Set the reversed array to parsedVariables
        setParsedVariables(reversedTagsArray);
        // setParsedVariables(responseDataRef.current.tags_present_in_xml_file);
      }

      // Update other state
      setResponseData(responseDataRef.current);
      setXmlCount(responseDataRef.current.COUNT_XML_FILE);
    }

    // Final updates
    setLoading(false);
    setProgress(100);
  };

  const [xmlCount, setXmlCount] = useState(0); // State to store the count of XML files
  const [formData, setFormData] = useState({}); // State to store form data
  const [formErrors, setFormErrors] = useState({});

  // Clinet Infromation
  const [CL_ORDNA, setCL_ORDNA] = useState("");
  const [CL_PROJNA, setCL_PROJNA] = useState("");
  const [CL_PURPOSE, setCL_PURPOSE] = useState("");
  const [CL_ADDRESS1, setCL_ADDRESS1] = useState("");
  const [CL_ADDRESS2, setCL_ADDRESS2] = useState("");
  // Data Location Infromation
  const [DLOCA_CY, setDLOCA_CY] = useState("");
  const [DLOCA_ST, setDLOCA_ST] = useState("");
  const [DLOCA_DT, setDLOCA_DT] = useState("");
  const [DLOCA_LOCA, setDLOCA_LOCA] = useState("");
  // Archivl data Folder path infromation
  const [AL_DA_PATH, setAL_DA_PATH] = useState("");
  const [AL_SH_PATH, setAL_SH_PATH] = useState("");
  const [AL_QL_PATH, setAL_QL_PATH] = useState("");

  useEffect(() => {
    const initialFormData = {};
    const initialVlaueSort = parsedVariables?.sort((a, b) => {
      const numA = parseInt(
        a.file_name_xml.split("-").pop().replace(".xml", ""),
        10
      );
      const numB = parseInt(
        b.file_name_xml.split("-").pop().replace(".xml", ""),
        10
      );
      return numA - numB; // Ascending order
    });
    // console.log("initialVlaueSort ", initialVlaueSort);

    for (let i = 0; i < xmlCount; i++) {
      const InputData = parsedVariables[i] || {};

      // //console.log("InputData 1", InputData);
      const bandsInformation = InputData?.BAND_ID;
      // //console.log("bandsInformation", bandsInformation);

      // Initialize marsbandinformation_set
      let marsbandinformation = [];

      if (bandsInformation) {
        const bandsData = [];
        for (let key in bandsInformation) {
          if (key.startsWith("Band_ID_")) {
            const index = key.split("_")[2];
            const bandName = bandsInformation[key];
            const measureUnit = bandsInformation[`MEASURE_UNIT_${index}`];
            const min = bandsInformation[`MIN_${index}`];
            const max = bandsInformation[`MAX_${index}`];
            bandsData.push({
              BAND_NAME: bandName,
              BAND_S_SPEC: min,
              BAND_E_SPEC: max,
              MEASURE_UNIT: measureUnit,
            });
          }
        }
        marsbandinformation = bandsData;
      }
      // //console.log("marsbandinformation", marsbandinformation);
      // Handling form data with default empty strings
      initialFormData[`dname${i}`] = InputData?.DATANAME || "";
      initialFormData[`cname${i}`] = InputData?.COMP_NA || "";
      initialFormData[`sname${i}`] = InputData?.SATT_NA || "";
      initialFormData[`clRef${i}`] = InputData?.CL_REF || "";
      initialFormData[`senName${i}`] =
        (InputData?.SEN_NAME_1 || "") + (InputData?.SEN_NAME_2 || "");
      initialFormData[`imgDataType${i}`] = InputData?.IMG_DATYPE || "";
      initialFormData[`imgDataProcSpec${i}`] = InputData?.IMG_DAPROC || "";
      initialFormData[`imgDate${i}`] = InputData?.IMG_DATE || ""; // Ensure empty string if undefined
      initialFormData[`img_dt_rng${i}`] = "a";

      // let dataSize = InputData?.ZIP_SIZE
      //   ? InputData.ZIP_SIZE.match(/(\d+(\.\d+)?)/)
      //   : null;
      // let numericPart = dataSize ? parseFloat(dataSize[0]).toFixed(2) : ""; // Parse numeric part as float and apply .toFixed()
      // let remainingCharacters = dataSize
      //   ? InputData.ZIP_SIZE.replace(dataSize[0], "")
      //   : ""; // Extract remaining characters
      console.log("readableFileSize :", readableFileSize);
      
      // initialFormData[`dSize${i}`] = numericPart + remainingCharacters; // Concatenate numeric part and remaining characters
      initialFormData[`dSize${i}`] = readableFileSize; // Concatenate numeric part and remaining characters

      initialFormData[`dCloud${i}`] = `${InputData?.DCLOUD ? parseFloat(InputData.DCLOUD).toFixed(2) : ""
        }`; // Ensure empty string if undefined

      let DPRJ_TABLE_NAME = InputData?.DPRJ_TABLE
        ? InputData.DPRJ_TABLE.replace(/[:]+/g, "")
        : "";
      let resultCRSdPRJTable = DPRJ_TABLE_NAME.match(/EPSG/)?.[0] || ""; // Match EPSG
      let resultCRSdPRJName = DPRJ_TABLE_NAME.match(/\d+/)?.[0] || ""; // Match digits

      initialFormData[`dPRJTable${i}`] = resultCRSdPRJTable;
      initialFormData[`dRows${i}`] = InputData?.D_NROWS || "";
      initialFormData[`dBands${i}`] = InputData?.D_NBANDS || "";
      initialFormData[`dGSDAxt${i}`] = InputData?.D_GSD_AXT?.D_GSD_AXT_0
        ? parseFloat(InputData.D_GSD_AXT.D_GSD_AXT_0).toFixed(10)
        : "";
      initialFormData[`dGSDAlt${i}`] = InputData?.D_GSD_ALT?.D_GSD_ALT_0
        ? parseFloat(InputData.D_GSD_ALT.D_GSD_ALT_0).toFixed(10)
        : "";
      initialFormData[`dArea${i}`] = `${InputData?.DAREA ? parseFloat(InputData?.DAREA).toFixed(4) : ""
        }`; // Ensure empty string if undefined
      initialFormData[`dSnow${i}`] = `${InputData?.DSNOW ? parseFloat(InputData?.DSNOW).toFixed(2) : ""
        }`; // Ensure empty string if undefined
      initialFormData[`dPRJName${i}`] = resultCRSdPRJName;
      initialFormData[`dCols${i}`] = InputData?.D_NCOLS || "";
      initialFormData[`dTiles${i}`] = InputData?.D_NTILES || "";
      initialFormData[`dPixelX${i}`] = InputData?.D_PIXELX || "";
      initialFormData[`dPixelY${i}`] = InputData?.D_PIXELX || ""; // Use D_PIXELY if it exists
      initialFormData[`dFormat${i}`] = InputData?.DFORMAT || "";
      initialFormData[`dType${i}`] = InputData?.D_TYPE || "";
      initialFormData[`dAQBits${i}`] = InputData?.D_AQ_BITS || "";
      initialFormData[`dPRBits${i}`] = InputData?.D_PR_BITS || "";
      initialFormData[`dSign${i}`] = InputData?.D_SIGN || "";
      initialFormData[`dBits${i}`] = InputData?.D_NBITS || "";
      initialFormData[`dINAngle${i}`] = InputData?.D_IN_ANGL?.INCIDENCE_ANGLE_0
        ? parseFloat(InputData.D_IN_ANGL.INCIDENCE_ANGLE_0).toFixed(10)
        : "";
      initialFormData[`dQLname${i}`] = InputData?.DQLNAME || "";
      initialFormData[`xmlFile${i}`] = InputData?.file_name_xml || "";

      // Add bands information to initialFormData
      if (marsbandinformation.length > 0) {
        marsbandinformation.forEach((band, index) => {
          initialFormData[`Band_ID_${i}_${index}`] = band.BAND_NAME || "";
          initialFormData[`MIN_${i}_${index}`] = band.BAND_S_SPEC || "";
          initialFormData[`MAX_${i}_${index}`] = band.BAND_E_SPEC || "";
          initialFormData[`MEASURE_UNIT_${i}_${index}`] =
            band.MEASURE_UNIT || "";
        });
      }

      // //console.log(initialFormData);
    }

    setFormData(initialFormData);
  }, [parsedVariables, xmlCount]);

  const handleNEWFormSubmit = (e) => {
    e.preventDefault();
    const hasErrors = Object.values(formErrors).some((error) => error !== "");
    if (hasErrors) {
      // alert('Please fix the errors before submitting the form.');
      return;
    }
    ModalManager.confirm({
      modalHeaderHeading: "Archival Confirm ",
      modalBodyHeading: "Are you sure?",
      message: "Please confirm form submission",
      logo: "MARS_LOGO.png",
      // redirectTo: '/Login' // Specify the URL to redirect to
      // onConfirm: () => fetchData(page),
      confirmButtonText: "Yes, submit!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        let zipinfo_setlist = [];
        let area_coordinateList = [];
        for (let i = 0; i < xmlCount; i++) {
          let dAreaValue,
            dAreaUnit,
            dCloud,
            dCloudUnit,
            dSnow,
            dSnowUnit,
            imageDate;
          // Handle dArea
          if (formData[`dArea${i}`]) {
            let dAreaMatch = formData[`dArea${i}`].match(/[\d.]+/);
            dAreaValue = dAreaMatch ? parseFloat(dAreaMatch[0]) : NaN;

            // let dAreaUnitMatch = formData[`dArea${i}`].match(/[a-zA-Z\s]+$/);
            const dAreaUnitMatch =
              parsedVariables[i]?.DAREA_UNIT || "square km";
            dAreaUnit = dAreaUnitMatch;
          } else {
            // Handle case when dArea is not provided
            dAreaValue = formData[`dArea${i}`];
            dAreaUnit = "square km";
          }

          // Handle dCloud
          if (formData[`dCloud${i}`]) {
            let dCloudMatch = formData[`dCloud${i}`].match(/[\d.]+/);
            dCloud = dCloudMatch ? parseFloat(dCloudMatch[0]) : NaN;

            // let dCloudUnitMatch = formData[`dCloud${i}`].match(/[a-zA-Z\s]+$/);
            const dCloudUnitMatch =
              parsedVariables[i]?.DCLOUD_UNIT || "percent";
            dCloudUnit = dCloudUnitMatch;
          } else {
            // Handle case when dCloud is not provided
            dCloud = formData[`dCloud${i}`];
            dCloudUnit = "percent";
          }

          // Handle dSnow
          if (formData[`dSnow${i}`]) {
            let dSnowMatch = formData[`dSnow${i}`].match(/[\d.]+/);
            dSnow = dSnowMatch ? parseFloat(dSnowMatch[0]) : NaN;

            // let dSnowUnitMatch = formData[`dSnow${i}`].match(/[a-zA-Z\s]+$/);
            const dSnowUnitMatch = parsedVariables[i]?.DSNOW_UNIT || "percent";
            dSnowUnit = dSnowUnitMatch;
          } else {
            // Handle case when dSnow is not provided
            dSnow = formData[`dSnow${i}`];
            dSnowUnit = "percent";
          }

          // console.table([dAreaUnit,dCloudUnit,dSnowUnit]);

          // User input from formData
          const userInput = formData[`cname${i}`]; // Replace with your actual user input key
          // Determine COMP_NA value based on user input
          let COMP_NA;
          if (userInput === subject) {
            COMP_NA = userInput; // Use user input if it matches subject
          } else {
            COMP_NA = subject; // Use subject variable value if user input does not match
          }

          // Initialize array for MarsBandInformation
          const marsbandinformation_set = [];

          // Extract and process band data
          for (let j = 0; ; j++) {
            const bandIdKey = `Band_ID_${i}_${j}`;
            if (!formData[bandIdKey]) break;

            const bandName = formData[bandIdKey];
            const min = formData[`MIN_${i}_${j}`] || "";
            const max = formData[`MAX_${i}_${j}`] || "";
            const measureUnit = formData[`MEASURE_UNIT_${i}_${j}`] || "";

            marsbandinformation_set.push({
              BAND_NAME: bandName,
              BAND_S_SPEC: min,
              BAND_E_SPEC: max,
              MEASURE_UNIT: measureUnit,
            });
          }

          const formDataItem = {
            DATANAME: formData[`dname${i}`],
            COMP_NA: COMP_NA,
            SATT_NA: formData[`sname${i}`],
            CL_REF: formData[`clRef${i}`],
            CL_ORDNA: CL_ORDNA,
            CL_PROJNA: CL_PROJNA,
            CL_PURPOSE: CL_PURPOSE,
            CL_ADDRESS1: CL_ADDRESS1,
            CL_ADDRESS2: CL_ADDRESS2,
            SEN_NAME: formData[`senName${i}`],
            IMG_DATYPE: formData[`imgDataType${i}`],
            IMG_DAPROC: formData[`imgDataProcSpec${i}`],
            IMG_DATE: formData[`imgDate${i}`],
            IMG_DT_RNG: formData[`img_dt_rng${i}`],
            DLOCA_CY: DLOCA_CY,
            DLOCA_ST: DLOCA_ST,
            DLOCA_DT: DLOCA_DT,
            DLOCA_LOCA: DLOCA_LOCA,
            DAREA: dAreaValue,
            DAREA_UNIT: dAreaUnit, // Assuming you have a unit field for DAREA
            DSIZE: formData[`dSize${i}`],
            DQLNAME: formData[`dQLname${i}`],
            DFORMAT: formData[`dFormat${i}`],
            DCLOUD: dCloud,
            DCLOUD_UNIT: dCloudUnit, // Assuming you have a unit field for DCLOUD
            DSNOW: dSnow,
            DSNOW_UNIT: dSnowUnit, // Assuming you have a unit field for DSNOW
            D_AQ_BITS: formData[`dAQBits${i}`],
            D_PR_BITS: formData[`dPRBits${i}`],
            DPRJ_TABLE: formData[`dPRJTable${i}`],
            DPRJ_NAME: formData[`dPRJName${i}`],
            D_NROWS: formData[`dRows${i}`],
            D_NCOLS: formData[`dCols${i}`],
            D_NBANDS: formData[`dBands${i}`],
            D_NTILES: formData[`dTiles${i}`],
            D_TYPE: formData[`dType${i}`],
            D_NBITS: formData[`dBits${i}`],
            D_SIGN: formData[`dSign${i}`],
            D_IN_ANGL: formData[`dINAngle${i}`],
            D_GSD_AXT: formData[`dGSDAxt${i}`],
            D_GSD_ALT: formData[`dGSDAlt${i}`],
            D_PIXELX: formData[`dPixelX${i}`],
            D_PIXELY: formData[`dPixelY${i}`],
            AL_DA_PATH: AL_DA_PATH,
            AL_SH_PATH: AL_SH_PATH,
            AL_QL_PATH: AL_QL_PATH,
            XML_FILE: formData[`xmlFile${i}`],
            SAT_NO: captureDataType,
            // MarsBandInformation: [],
            // MarsBoundsCoordinates: []
            geometry_shape: {},
            marsbandinformation_set: marsbandinformation_set,
            marsboundscoordinates_set: [],
          };

          // Get coordinates and bands from parsedVariablesRef.current
          const coordinates = parsedVariables[i]?.Vertex_LON_LAT;
          // //console.log("coordinates ", coordinates)
          const bands = parsedVariables[i]?.BAND_ID;
          const imgData = parsedVariables[i]?.image_data_xml;
          const area_coordinate = parsedVariables[i]?.area_coordinate;
          // //console.log("area_coordinate ", area_coordinate);

          // Create an array to store the coordinates
          const coordinatesArray = [];

          // Iterate over the keys in the coordinates object
          for (let key in coordinates) {
            if (key.startsWith("X_")) {
              const index = key.split("_")[1];
              const x = parseFloat(coordinates[key]); // Parse the X value as float
              const y = parseFloat(coordinates[`Y_${index}`]); // Parse the corresponding Y value as float
              coordinatesArray.push([x, y]); // Push the [x, y] pair into the coordinatesArray
            }
          }
          // Copy the first [x, y] pair to the end of coordinatesArray
          if (coordinatesArray.length > 0) {
            // Check if there's at least one pair
            const firstPair = coordinatesArray[0]; // Get the first [x, y] pair
            coordinatesArray.push(firstPair); // Add it to the end of coordinatesArray
          }
          // Create geometry_shape object
          const geometryShape = {
            type: "Polygon",
            coordinates: [coordinatesArray], // Pass the coordinatesArray to the coordinates property
          };
          // Add geometry_shape to formDataItem
          formDataItem.geometry_shape = geometryShape;

          // Check if imgData is defined and has image_data property
          if (imgData && imgData.image_data) {
            // If image_data is not null or undefined, assign it to formDataItem.IMG_PREVIEW
            formDataItem.IMG_PREVIEW = imgData.image_data;
          } else {
            // If image_data is null or undefined, assign an empty string
            formDataItem.IMG_PREVIEW = "";
          }

          // Create bounds array
          if (coordinates) {
            const boundsData = [];
            for (let key in coordinates) {
              if (key.startsWith("X_")) {
                const index = key.split("_")[1];
                const x = coordinates[key];
                const y = coordinates[`Y_${index}`];
                boundsData.push({
                  COOD_XX: x,
                  COOD_YY: y,
                  COOD_NO: parseInt(index) + 1,
                });
              }
            }
            formDataItem.marsboundscoordinates_set = boundsData;
          }

          zipinfo_setlist.push(formDataItem);
          area_coordinateList.push(area_coordinate);
        }
        const updatedFormData = {
          CL_REF: formData["clRef0"],
          CL_ORDNA: CL_ORDNA,
          CL_PROJNA: CL_PROJNA,
          CL_PURPOSE: CL_PURPOSE,
          CL_ADDRESS1: CL_ADDRESS1,
          CL_ADDRESS2: CL_ADDRESS2,
          comman_area_shape: {
            type: "Polygon",
            coordinates: [responseDataRef.current.area_coordinate],
          },
          COMP_NA: formData["cname0"],
          zipinfo_set: zipinfo_setlist,
        };

        // Now `updatedFormData` contains the formatted data
        // //console.log(updatedFormData);

        // Make your submission request here with `updatedFormData`
        try {
          setLoading(true);
          setProgress(0);
          const response = await fetch(
            "http://127.0.0.1:8000/archival/optical_mono_sterio_tri_data_save/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              onUploadProgress: (progressEvent) => {
                const percentage = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setProgress(percentage);
              },
              body: JSON.stringify(updatedFormData),
            }
          );
          if (
            response.ok ||
            response.status === 200 ||
            response.status === 201
          ) {
            // Set formSubmitted to true to indicate the form has been submitted
            setFormSubmitted(true);
            // Form submitted successfully
            const responseData = await response.json();
            ////console.log("Form submitted successfully:", responseData);
            setNewPopupVisible(false);
            setFormData({});
            setXmlCount(0); // Reset XML count if needed
            ModalManager.success({
              modalHeaderHeading: "Success",
              modalBodyHeading: "Archival Extract Data Form",
              message: "Form Data Save Successfully..!✔",
              logo: "MARS_LOGO.png",
              // redirectTo: '/Login' // Specify the URL to redirect to
              // onConfirm: () => fetchData(page),
              confirmButtonText: "ok!",
            }).then((result) => {
              if (result.isConfirmed) {
                fetchData(page);
              }
            });
            setLoading(false);
            setProgress(100);
          } else {
            setLoading(false);
            setProgress(100);
            const showErrorModal = (errorMessage) => {
              ModalManager.error({
                modalHeaderHeading: "Archival Extract Data",
                modalBodyHeading: "Error",
                logo: "MARS_LOGO.png",
                message: errorMessage,
                confirmButtonText: "OK",
              });
            };
            // Request failed
            const errorData = await response.json();
            if (
              errorData &&
              errorData.message === "Validation error" &&
              errorData.errors
            ) {
              // Accumulate all error messages into a single HTML string
              let errorMessageHTML = "<ul>";

              // Iterate over each field in the errors object
              Object.keys(errorData.errors).forEach((fieldName) => {
                const fieldErrors = errorData.errors[fieldName];

                // Iterate over each error message for the field
                fieldErrors.forEach((errorObj) => {
                  Object.keys(errorObj).forEach((errorType) => {
                    const errorMessages = errorObj[errorType];

                    // Add each error message to the HTML string
                    errorMessages.forEach((errorMessage) => {
                      errorMessageHTML += `<li>${fieldName}: ${errorMessage}</li>`;
                    });
                  });
                });
              });
              errorMessageHTML += "</ul>";
              showErrorModal(errorMessageHTML);
            } else {
              ////console.log("No validation errors found.");
            }
          }
        } catch (error) {
          setLoading(false);
          setProgress(100);
          ModalManager.error({
            modalHeaderHeading: "Archival Extract Data",
            modalBodyHeading: "Error",
            logo: "MARS_LOGO.png",
            message: error,
            confirmButtonText: "OK",
          });
          // Handle network or other errors
          console.error("Error submitting form:", error);
        } finally {
          setLoading(false);
          setProgress(100);
        }
      }
    });
  };

  const handleNEWInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleValidationError = (name, error) => {
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  // Tool Tip Functions

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
        delay: { show: 1000, hide: 0 }, // Ensure tooltips show and hide immediately
        placement: "right",
        // placement: 'left',
        // placement: 'bottom',
        // placement: 'top',
        // fallbackPlacements: [] // Prevent fallback placements
      });
    });
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip-top"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
        delay: { show: 1000, hide: 0 },
        placement: "top",
      });
    });
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip-left"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
        delay: { show: 1000, hide: 0 },
        placement: "left",
      });
    });
  }, []);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip-bottom"]'
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
        delay: { show: 1000, hide: 0 },
        placement: "bottom",
      });
    });
  }, []);

  // Tool Tip Functions Ends **************************

  // ***************************

  const renderBandsTable = (InputData, formData, i) => {
    ////console.log("formData ghdkhg ", formData);
    if (!InputData || !InputData.BAND_ID) return null;

    // Filter keys to include only those starting with "Band_ID_"
    const filteredKeys = Object.keys(InputData.BAND_ID).filter((key) =>
      key.startsWith("Band_ID_")
    );

    // Generate bands data
    const bandsData = filteredKeys.map((key) => {
      const suffix = key.split("_")[2]; // Extract index from key
      return {
        BAND_NAME: InputData.BAND_ID[key],
        BAND_S_SPEC: InputData.BAND_ID[`MIN_${suffix}`] || "",
        BAND_E_SPEC: InputData.BAND_ID[`MAX_${suffix}`] || "",
        MEASURE_UNIT: InputData.BAND_ID[`MEASURE_UNIT_${suffix}`] || "",
      };
    });

    return (
      <div>
        <table className="newFormtable">
          <thead>
            <tr className="newFormtableRow">
              <th className="newFormtableheader maintabledataheading-srno">
                Sr.No.
              </th>
              <th className="newFormtableheader">Band Name</th>
              <th className="newFormtableheader">Spec Min List</th>
              <th className="newFormtableheader">Spec Max List</th>
              <th className="newFormtableheader">MEASURE UNIT</th>
            </tr>
          </thead>
          <tbody>
            {bandsData.map((band, index) => (
              <tr key={index} className="newFormtableRow">
                <td className="newFormtabledata" style={{ textAlign: "right" }}>
                  {index + 1}
                </td>
                <td className="newFormtabledata">
                  <input
                    type="text"
                    className="tableInput"
                    name={`Band_ID_${i}_${index}`}
                    value={
                      formData[`Band_ID_${i}_${index}`] || band.BAND_NAME || ""
                    }
                    onChange={handleNEWInputChange}
                  />
                </td>
                <td className="newFormtabledata">
                  <input
                    type="text"
                    className="tableInput"
                    style={{ textAlign: "right" }}
                    name={`MIN_${i}_${index}`}
                    value={
                      formData[`MIN_${i}_${index}`] || band.BAND_S_SPEC || ""
                    }
                    onChange={handleNEWInputChange}
                  />
                </td>
                <td className="newFormtabledata">
                  <input
                    type="text"
                    className="tableInput"
                    style={{ textAlign: "right" }}
                    name={`MAX_${i}_${index}`}
                    value={
                      formData[`MAX_${i}_${index}`] || band.BAND_E_SPEC || ""
                    }
                    onChange={handleNEWInputChange}
                  />
                </td>
                <td className="newFormtabledata">
                  <input
                    type="text"
                    className="tableInput"
                    name={`MEASURE_UNIT_${i}_${index}`}
                    value={
                      formData[`MEASURE_UNIT_${i}_${index}`] ||
                      band.MEASURE_UNIT ||
                      ""
                    }
                    onChange={handleNEWInputChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFormFields = () => {
    const tabs = [];
    for (let i = 0; i < xmlCount; i++) {
      const InputData =
        parsedVariables[i] !== null && parsedVariables[i] !== undefined
          ? parsedVariables[i]
          : {};

      if (InputData && InputData.Vertex_LON_LAT) {
        const vertexData = InputData.Vertex_LON_LAT;

        // Extract X and Y coordinates dynamically
        const coordinates = Object.keys(vertexData)
          .filter(
            (key) =>
              key.startsWith("X_") &&
              vertexData[key] &&
              vertexData[`Y_${key.slice(2)}`]
          )
          .map((key) => ({
            x: vertexData[key],
            y: vertexData[`Y_${key.slice(2)}`],
          }));

        // Generate table rows dynamically based on the collected coordinates
        let sequentialIndex1 = 1;
        const tableRows = coordinates.map((coordinate) => (
          <tr key={sequentialIndex1} className="newFormtableRow">
            <td className="newFormtabledata" style={{ textAlign: "right" }}>
              {sequentialIndex1++}
            </td>
            <td className="newFormtabledata" style={{ textAlign: "right" }}>
              {coordinate.x}
            </td>
            <td className="newFormtabledata" style={{ textAlign: "right" }}>
              {coordinate.y}
            </td>
          </tr>
        ));

        // Generate each tab with its content
        tabs.push(
          <Tab
            className="Tab-Btn"
            eventKey={`xmlFile${i}`}
            title={`XML File ${i + 1}`}
            key={i}
          >
            <span className="XMLFileCount">
              Numbers of XML File {i + 1} - {formData[`xmlFile${i}`]}
            </span>
            <hr />
            {/* <div>
              <h4 className="ArchivalFormSectionHeading">
                First Part (PRIMERY INFROMATION)
              </h4>
            </div> */}
            <div className="primeryinfomainbox">
              <h4 className="ArchivalFormSectionHeading">
                First Part (PRIMERY INFROMATION)
              </h4>
              <div className="primeryinfo-input-div">
                <div className="primeryinfofirstbox">
                  <div className="data-Name-div">
                    <ArchivalValidationComponent
                      label="Data Name"
                      validationRules={[{ required: true }, { maxLength: 100 }]}
                      type="text"
                      className="dname"
                      id={`dnameid${i}`}
                      name={`dname${i}`}
                      placeholder="Ex. DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156"
                      maxLength="100"
                      value={formData[`dname${i}`]}
                      onChange={handleNEWInputChange}
                      onValidationError={handleValidationError}
                    />
                  </div>
                  <div className="company-name-div">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Company"
                      type="text"
                      className="cname"
                      id="cnameid"
                      name={`cname${i}`}
                      placeholder="Ex. AIRBUS, SENTINEL"
                      value={formData[`cname${i}`]}
                      onChange={handleNEWInputChange}
                      maxLength="50"
                      validationRules={[
                        { required: true },
                        { maxLength: 50 },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: " Alphabet is allowed",
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* <div className="primeryinfosecondbox"> */}
                <div className="satelite-name-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Satellite Name"
                    type="text"
                    id="snameid"
                    name={`sname${i}`}
                    className="sname"
                    value={formData[`sname${i}`]}
                    onChange={handleNEWInputChange}
                    placeholder="Ex. PLEIADES, PNEO, SPOT"
                    maxLength="50"
                    validationRules={[
                      { required: true },
                      { maxLength: 50 },
                      {
                        pattern: /^[a-zA-Z\s]+$/,
                        message: " Alphabet is allowed",
                      },
                    ]}
                  />
                </div>
                {/* </div> */}
                {/* </div> */}
              </div>
            </div>

            <div className="clientinfomainbox-two">
              {/* <div className="clientinfofirstbox"> */}
              <h4 className="ArchivalFormSectionHeading">
                Second Part (CLIENT INFROMATION)
              </h4>
              {/* <div className="card-box-new-client"> */}
              <ArchivalValidationComponent
                onValidationError={handleValidationError}
                label="Customer Reference"
                type="text"
                id="clRefid"
                name={`clRef${i}`}
                className="clRef"
                placeholder="Enter Customer Reference..."
                value={formData[`clRef${i}`]}
                onChange={handleNEWInputChange}
                maxLength="50"
                validationRules={[{ required: true }, { maxLength: 50 }]}
              />
              {/* </div> */}
              {/* </div> */}
            </div>

            <div className="imageinfomainbox">
              {/* <div> */}
              <h4 className="ArchivalFormSectionHeading">
                Third Part (IMAGE INFROMATION)
              </h4>
              {/* </div> */}

              <div className="image-info-third-box">
                <div className="third-box-input-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Sensor Name"
                    type="text"
                    id="senNameid"
                    name={`senName${i}`}
                    className="senName"
                    placeholder="Ex. PHR, PNEO, SPOT"
                    value={formData[`senName${i}`]}
                    onChange={handleNEWInputChange}
                    maxLength="20"
                    validationRules={[
                      { required: true },
                      { maxLength: 20 },
                      {
                        pattern: /^[a-zA-Z0-9\s]+$/,
                        message: "Alphabet, Digits is allowed",
                      },
                    ]}
                  />
                </div>

                <div className="third-box-input-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Image Date"
                    type="date"
                    id="imgDateid"
                    name={`imgDate${i}`}
                    className="imgDate"
                    placeholder="Enter Image Date..."
                    value={formData[`imgDate${i}`]}
                    onChange={handleNEWInputChange}
                    maxLength="11"
                    validationRules={[{ required: true }, { maxLength: 11 }]}
                  />
                </div>

                <div className="third-box-input-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Image Data Type"
                    type="text"
                    id="imgDataTypeid"
                    name={`imgDataType${i}`}
                    className="imgDataType"
                    placeholder="Ex. ORTHO,PROJECTED,SENSOR/PRIMARY"
                    value={formData[`imgDataType${i}`]}
                    onChange={handleNEWInputChange}
                    maxLength="30"
                    validationRules={[
                      { required: true },
                      { maxLength: 30 },
                      {
                        pattern: /^[a-zA-Z\s]+$/,
                        message: " Alphabet is allowed",
                      },
                    ]}
                  />
                </div>

                <div className="third-box-input-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Image Data Range"
                    type="text"
                    id="img_dt_rngid"
                    name={`img_dt_rng${i}`}
                    className="img_dt_rng"
                    value={formData[`img_dt_rng${i}`] || ""}
                    onChange={handleNEWInputChange}
                    placeholder="Enter Image Date Range..."
                    maxLength="20"
                    validationRules={[{ required: true }, { maxLength: 20 }]}
                  />
                </div>

                <div className="third-box-input-div">
                  <ArchivalValidationComponent
                    onValidationError={handleValidationError}
                    label="Image Data Processing"
                    type="text"
                    id="imgDataProcSpecid"
                    name={`imgDataProcSpec${i}`}
                    className="imgDataProcSpec"
                    placeholder="Ex. MS,P,PMS"
                    value={formData[`imgDataProcSpec${i}`]}
                    onChange={handleNEWInputChange}
                    maxLength="20"
                    validationRules={[
                      { required: true },
                      { maxLength: 20 },
                      {
                        pattern: /^[a-zA-Z-\s]+$/,
                        message: " Alphabet is allowed",
                      },
                    ]}
                  />
                </div>
                {/* </div> */}

                {/* <div className="imageinfosecondbox"> */}
              </div>
            </div>

            {/* <div>
              <h4 className="ArchivalFormSectionHeading">
                Fifth Part (IMAGE DETAILS)
              </h4>
            </div> */}
            <div className="Fiftth-part-main-div">
              <h4 className="ArchivalFormSectionHeading">
                Fifth Part (IMAGE DETAILS)
              </h4>

              <div className="imgdetailsinfomainbox">
                <div className="imgdetailsinfofirstbox">
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Size(Zip)"
                      type="text"
                      id="dSizeid"
                      name={`dSize${i}`}
                      className="dSize"
                      placeholder="Ex. 100 MB..."
                      maxLength="10"
                      value={formData[`dSize${i}`]}
                      onChange={handleNEWInputChange}
                      validationRules={[
                        { required: true },
                        { maxLength: 10 },
                        {
                          pattern: /^[a-zA-Z0-9.\s]+$/,
                          message: " Alphabet,Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Cloud Cover(in %)"
                      type="text"
                      id="dCloudid"
                      name={`dCloud${i}`}
                      className="dCloud"
                      placeholder="Ex. 10.5percent"
                      value={formData[`dCloud${i}`]}
                      onChange={handleNEWInputChange}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[a-zA-Z0-9.\s]+$/,
                          message: " Alphabet,Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="(CRS)"
                      type="text"
                      id="dPRJTableid"
                      name={`dPRJTable${i}`}
                      className="dPRJTable"
                      value={formData[`dPRJTable${i}`]}
                      onChange={handleNEWInputChange}
                      placeholder="Ex. EPSG"
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: " Alphabet is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Rows Number"
                      type="text"
                      id="dRowsid"
                      name={`dRows${i}`}
                      className="dRows"
                      placeholder="Ex. 200"
                      value={formData[`dRows${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Number Of Bands"
                      type="text"
                      id="dBandsid"
                      name={`dBands${i}`}
                      className="dBands"
                      placeholder="Ex. 1,2,3,4..."
                      value={formData[`dBands${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      // onChange={(e) => setDBands(e.target.value)}

                      maxLength="5"
                      validationRules={[
                        { required: true },
                        { maxLength: 5 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="GSD Across Track"
                      type="text"
                      id="dGSDAxtid"
                      name={`dGSDAxt${i}`}
                      className="dGSDAxt"
                      placeholder="Ex. 10.1111"
                      value={formData[`dGSDAxt${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      // onChange={(e) => setDGSDAxt(e.target.value)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[0-9.\s]+$/,
                          message: "Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      label="GSD Along Track"
                      onValidationError={handleValidationError}
                      type="text"
                      id="dGSDAltid"
                      name={`dGSDAlt${i}`}
                      className="dGSDAlt"
                      placeholder="Ex. 10.111"
                      value={formData[`dGSDAlt${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[0-9.\s]+$/,
                          message: "Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="imgdetailsinfosecondbox">
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Surface Area(sqkm)"
                      type="text"
                      id="dAreaid"
                      name={`dArea${i}`}
                      className="dArea"
                      placeholder="Ex. 158.318 square km"
                      value={formData[`dArea${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[a-zA-Z0-9.\s]+$/,
                          message: " Alphabet,Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Snow Cover(in %)"
                      type="text"
                      id="dSnowid"
                      name={`dSnow${i}`}
                      className="dSnow"
                      placeholder="Ex. 10.11percent"
                      value={formData[`dSnow${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[a-zA-Z0-9.\s]+$/,
                          message: " Alphabet,Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Projection Number"
                      type="text"
                      id="dPRJNameid"
                      name={`dPRJName${i}`}
                      className="dPRJName"
                      placeholder="Ex. 32643, 4823"
                      value={formData[`dPRJName${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="7"
                      validationRules={[
                        { required: true },
                        { maxLength: 7 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Column Number"
                      type="text"
                      id="dColsid"
                      name={`dCols${i}`}
                      className="dCols"
                      placeholder="Ex. 200"
                      value={formData[`dCols${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Number Of Tiles"
                      type="text"
                      id="dTilesid"
                      name={`dTiles${i}`}
                      className="dTiles"
                      placeholder="Ex. 1,2,3,4..."
                      value={formData[`dTiles${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="7"
                      validationRules={[
                        { required: true },
                        { maxLength: 7 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Pixel Size(m) X"
                      type="text"
                      id="dPixelXid"
                      name={`dPixelX${i}`}
                      className="dPixelX"
                      placeholder="Ex. 0.5, 0.3"
                      value={formData[`dPixelX${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="6"
                      validationRules={[
                        { required: true },
                        { maxLength: 6 },
                        {
                          pattern: /^[0-9.\s]+$/,
                          message: " Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>

                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Pixel Size(m) Y"
                      type="text"
                      id="dPixelYid"
                      name={`dPixelY${i}`}
                      className="dPixelY"
                      placeholder="Ex. 0.5, 0.3"
                      value={
                        formData[`dPixelY${i}`] !== undefined
                          ? formData[`dPixelY${i}`]
                          : parsedVariables?.D_PIXELX || ""
                      }
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="6"
                      validationRules={[
                        { required: true },
                        { maxLength: 6 },
                        {
                          pattern: /^[0-9.\s]+$/,
                          message: " Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="imgdetailsinfothirdbox">
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Format"
                      type="text"
                      id="dFormatid"
                      name={`dFormat${i}`}
                      className="dFormat"
                      placeholder="Ex. Tiff, GeoTiff, JPEG2000"
                      value={formData[`dFormat${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[{ required: true }, { maxLength: 20 }]}
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Type"
                      type="text"
                      id="dTypeid"
                      name={`dType${i}`}
                      className="dType"
                      placeholder="Ex. INTEGER, FLOAT "
                      value={formData[`dType${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: " Alphabet is allowed",
                        },
                      ]}
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Acquisition Range"
                      type="text"
                      id="dAQBitsid"
                      name={`dAQBits${i}`}
                      className="dAQBits"
                      placeholder="Ex. 8, 12"
                      value={formData[`dAQBits${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="7"
                      validationRules={[
                        { required: true },
                        { maxLength: 7 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Product Range"
                      validationRules={[
                        { required: true },
                        { maxLength: 7 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                      type="text"
                      id="dPRBitsid"
                      name={`dPRBits${i}`}
                      className="dPRBits"
                      placeholder="Ex. 8, 12, 16"
                      value={formData[`dPRBits${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="7"
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Signed"
                      type="text"
                      id="dSignid"
                      name={`dSign${i}`}
                      className="dSign"
                      placeholder="Ex. UNSIGNED, SIGNED"
                      value={formData[`dSign${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="10"
                      validationRules={[
                        { required: true },
                        { maxLength: 10 },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: " Alphabet is allowed",
                        },
                      ]}
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Bits"
                      type="text"
                      id="dBitsid"
                      name={`dBits${i}`}
                      className="dBits"
                      placeholder="Ex. 8, 12, 16"
                      value={formData[`dBits${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="7"
                      validationRules={[
                        { required: true },
                        { maxLength: 7 },
                        {
                          pattern: /^[0-9\s]+$/,
                          message: " Digits is allowed",
                        },
                      ]}
                    />
                  </div>
                  <div className="card-box-new">
                    <ArchivalValidationComponent
                      onValidationError={handleValidationError}
                      label="Data Incident Angle"
                      type="text"
                      id="dINAngleid"
                      name={`dINAngle${i}`}
                      className="dINAngle"
                      placeholder="Ex. 7.27456941476"
                      value={formData[`dINAngle${i}`]}
                      onChange={(e) => handleNEWInputChange(e, i)}
                      maxLength="20"
                      validationRules={[
                        { required: true },
                        { maxLength: 20 },
                        {
                          pattern: /^[0-9.\s]+$/,
                          message: "Digits,Dot is allowed",
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="card-box-new">
                <ArchivalValidationComponent
                  onValidationError={handleValidationError}
                  label="Quick Look Data Name"
                  type="text"
                  id="dQLnameid"
                  name={`dQLname${i}`}
                  className="dQLname"
                  placeholder="Ex. PREVIEW_SPOT7_MS_201802171117155_ORT_5983177101.JPG"
                  value={formData[`dQLname${i}`]}
                  onChange={(e) => handleNEWInputChange(e, i)}
                  maxLength="150"
                  validationRules={[{ required: true }, { maxLength: 150 }]}
                />
              </div>
            </div>

            {/* <div>
              <h4 className="ArchivalFormSectionHeading">
                Six Part (ARCHIVAL INFROMATION)
              </h4>
            </div> */}

            <div className="archivalinfomainbox">
              <h4 className="ArchivalFormSectionHeading">
                Six Part (ARCHIVAL INFROMATION)
              </h4>
              {/* <div className="archivalinfofirstbox"> */}
              <div className="card-box-new">
                <ArchivalValidationComponent
                  onValidationError={handleValidationError}
                  label="XML File Name"
                  type="text"
                  id="xmlFileid"
                  name={`xmlFile${i}`}
                  className="xmlFile"
                  placeholder="Ex. DIM_SPOT7_MS_201802171117155_ORT_5983177101.XML"
                  maxLength="100"
                  value={formData[`xmlFile${i}`]}
                  onChange={(e) => handleNEWInputChange(e, i)}
                  validationRules={[{ required: true }, { maxLength: 100 }]}
                />
              </div>
              {/* </div> */}
            </div>

            {/* <div>
              <h4 className="ArchivalFormSectionHeading">
                Seventh Part (COORDINATES INFROMATION)
              </h4>
            </div> */}

            <div className="coordinatesinfomainbox">
              <h4 className="ArchivalFormSectionHeading mb-2">
                Seventh Part (COORDINATES INFROMATION)
              </h4>

              <div className="coordinatesinfofirstbox">
                <table className="newFormtable">
                  <thead>
                    <tr className="newFormtableRow">
                      <th className="newFormtableheader maintabledataheading-srno">
                        Sr.No..{" "}
                      </th>
                      <th className="newFormtableheader">COOD XX</th>
                      <th className="newFormtableheader">COOD YY</th>
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </table>
              </div>
            </div>

            <div className="bandsinfomainbox">
              {/* <div> */}
              <h4 className="ArchivalFormSectionHeading mb-2">
                Eight Part (BANDS INFROMATION)
              </h4>
              {/* </div> */}
              <div className="bandsinfofirstbox">
                {/* Render bands table */}
                {/* {bandsTable} */}
                {renderBandsTable(InputData, formData, i)}
              </div>
            </div>
          </Tab>
        );
      }
    }

    return tabs;
  };

  // const [processedData, setProcessedData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // const handleDropdownChange = (event) => {
  //   const selectedIndex = parseInt(event.target.value);
  //   if (processedData[selectedIndex]) {
  //     const selectedOption = processedData[selectedIndex];
  //     setSelectedOption(selectedOption);
  //   }
  // };
  const [processedData, setProcessedData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activexmlTab, setActivexmlTab] = useState("xmlFile-0"); // For controlling active tab

  // const handleDropdownChange = (event) => {
  //   const selectedIndex = parseInt(event.target.value);
  //   setSelectedIndex(selectedIndex);
  //   setActivexmlTab(`xmlFile-${selectedIndex}`); // Change active tab when dropdown is used
  // };

  //   const handleDropdownChange = (event) => {
  //   const selectedIndex = parseInt(event.target.value);
  //   if (processedData[selectedIndex]) {
  //     const selectedOption = processedData[selectedIndex];
  //     setSelectedOption(selectedOption);
  //   }
  // };

  const handleDropdownChange = (event) => {
    const selectedIndex = parseInt(event.target.value);

    // Set the selected index for other functionality
    setSelectedIndex(selectedIndex);

    // Update the active XML tab based on the selected index
    setActivexmlTab(`xmlFile-${selectedIndex}`);

    // Check if there's a processed option and update it
    if (processedData[selectedIndex]) {
      const selectedOption = processedData[selectedIndex];
      setSelectedOption(selectedOption);
    }
  };

  const handleRowClick = (index) => {
    const eventKey = `xmlFile-${index}`;
  handleTabSelectP(eventKey); // Pass
    // Set the selected index based on the row click
    setSelectedIndex(index);

    // Update the active XML tab based on the selected index
    setActivexmlTab(`xmlFile-${index}`);

    // Check if there's a processed option and update it
    if (processedData[index]) {
      const selectedOption = processedData[index];
      setSelectedOption(selectedOption);
    }
  };
  const handleTabSelectP = (eventKey) => {
    const index = parseInt(eventKey.split('-')[1]); // Extract the index from eventKey
    console.log('Selected Tab Index:', index);
    
    setSelectedIndex(index); // Update the selected index
  
    // Set selected option based on processed data
    if (processedData[index]) {
      const selectedOption = processedData[index];
      setSelectedOption(selectedOption);
    }
  
    // Update the active XML tab
    setActivexmlTab(eventKey); // Only set this once
  };
  
  // const handleTabSelectP = (index) => {
  //   console.log('Selected Tab Index:', index);
  //   setSelectedIndex(index);
  //   if (processedData[index]) {
  //     const selectedOption = processedData[index];
  //     setSelectedOption(selectedOption);
  //   }
  //   setActivexmlTab(`xmlFile-${index}`);
  //   setActivexmlTab(index); 
  //   setSelectedOption(processedData[index]); 
  // };
  // const handleTabSelectP = (index) => {
  //   console.log('Selected Tab Index:', index); 
  //   setSelectedIndex(index);
  //   setActivexmlTab(`xmlFile-${index}`);
  
  //   if (processedData[index]) {
  //     setSelectedOption(processedData[index]);
  //   }
  // };
  const handleTabSelect = (tabKey) => {
    const selectedIndex = parseInt(tabKey.split("-")[1]); // Extract the index from the tab key
    setSelectedIndex(selectedIndex);
    setActivexmlTab(tabKey);
  };

  // useEffect(() => {
  //   if (formData && parsedVariables) {
  //     // Process the formData and set processedData
  //     const data = processData(formData);
  //     const dataValues = Object.values(data); // Convert the data object to an array of values
  //     setProcessedData(dataValues);

  //     // Loop through each item in the parsedVariables
  //     parsedVariables.forEach((item, index) => {
  //       const bandId = item.BAND_ID;
  //       const vertexLonLat = item.Vertex_LON_LAT;
  //       const imageDataXml = item.image_data_xml;
  //       const xmltext = item.xml_text;
  //       const xmlfilename = item.file_name_xml;

  //       // Update dataValues with the matching variables
  //       dataValues.forEach((dataObj, dataIndex) => {
  //         if (dataObj.xmlFile === xmlfilename) {
  //           ////console.log(`Updating dataObj at index ${dataIndex}`);
  //           dataObj.BAND_ID = bandId;
  //           dataObj.Vertex_LON_LAT = vertexLonLat;
  //           dataObj.image_data_xml = imageDataXml;
  //           dataObj.xml_text = xmltext;
  //         }
  //       });
  //     });

  //     // Optionally set the first item as the default selected option
  //     if (dataValues.length > 0) {
  //       setSelectedOption(dataValues[0]);
  //     }
  //   }
  // }, [formData, parsedVariables]);

  // // Function to handle dropdown change
  // const handleDropdownChange = (event) => {
  //   const selectedIndex = parseInt(event.target.value);
  //   setSelectedOption(parsedVariables[selectedIndex]);
  // };

  // useEffect(() => {
  //   // Trigger the event listener manually to display default data
  //   if (parsedVariables && parsedVariables.length > 0) {
  //     setSelectedOption(parsedVariables[0]);
  //   }
  // }, [parsedVariables]);

  // ////console.log("parsedVariables ", parsedVariables)
  //console.log("processedData ", processedData);

  // //console.log("FormData ", formData);
  useEffect(() => {
    if (formData && parsedVariables) {
      // Process the formData and set processedData
      const data = processData(formData);
      const dataValues = Object.values(data); // Convert the data object to an array of values

      // Loop through each item in the parsedVariables
      parsedVariables.forEach((item) => {
        const bandId = item.BAND_ID;
        const vertexLonLat = item.Vertex_LON_LAT;
        const imageDataXml = item.image_data_xml;
        const xmltext = item.xml_text;
        const xmlfilename = item.file_name_xml;

        // Update dataValues with the matching variables
        dataValues.forEach((dataObj) => {
          if (dataObj.xmlFile === xmlfilename) {
            dataObj.BAND_ID = bandId;
            dataObj.Vertex_LON_LAT = vertexLonLat;
            dataObj.image_data_xml = imageDataXml;
            dataObj.xml_text = xmltext;
          }
        });
      });
      // console.log("dataValues ", dataValues);

      // Sort the dataValues based on the numeric part of the xmlFile
      const sortedDataValues = dataValues.sort((a, b) => {
        const numA = parseInt(
          a.xmlFile.split("-").pop().replace(".xml", ""),
          10
        );
        const numB = parseInt(
          b.xmlFile.split("-").pop().replace(".xml", ""),
          10
        );
        return numA - numB; // Ascending order
      });

      // Set the sorted processedData
      setProcessedData(sortedDataValues);

      // Optionally set the first item as the default selected option
      if (sortedDataValues.length > 0) {
        setSelectedOption(sortedDataValues[0]);
      }
    }
  }, [formData, parsedVariables]);

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/search/optical_mono_sterio_tri_data_search_from_main/?page=${page}`
      );
      setTableData(response.data.message);
      setDisableNext(false); // Reset disableNext if the fetch is successful
      setTotalPages(response.data.data); // Update based on actual response
      setTableloading(false); // Stop loading after data is fetched
      // //console.log('Table Data' + response.data.data)
    } catch (error) {
      // console.error('Error fetching data:', error.response.data.errror);
      if (error.response && error.response.data.errror === "Invalid page.") {
        setDisableNext(true);
      }
      setTableloading(false); // Stop loading if there is an error
      // console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    setTableloading(true);
    fetchData(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const renderPagination = () => {
    const pages = [];
    const ellipsis = <span key="ellipsis">...</span>;
    if (totalPages <= 5) {
      // Case when there are 5 or fewer pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={page === i ? "active" : ""}
          >
            {i}
          </button>
        );
      }
    } else {
      // Case when there are more than 5 pages
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={page === 1 ? "active" : ""}
        >
          {1}
        </button>
      );
      pages.push(
        <button
          key={2}
          onClick={() => handlePageChange(2)}
          className={page === 2 ? "active" : ""}
        >
          {2}
        </button>
      );
      if (page > 3) {
        pages.push(ellipsis);
      }
      for (
        let i = Math.max(3, page - 1);
        i <= Math.min(page + 1, totalPages - 1);
        i++
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={page === i ? "active" : ""}
          >
            {i}
          </button>
        );
      }
      if (page < totalPages - 2) {
        pages.push(ellipsis);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={page === totalPages ? "active" : ""}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // table skeleton loading
  const skeletonRows = Array.from({ length: 13 }, (_, index) => (
    <tr key={index} className="marstablerow">
      {Array.from({ length: 47 }, (_, cellIndex) => (
        <td key={cellIndex} className="marstabledata">
          <div className="archivaltableloading"></div>
        </td>
      ))}
    </tr>
  ));

  // const handleReload = () => {
  //   window.location.reload(); // Reload the page
  // };

  const handleReset = () => {
    // window.location.reload();

    // Clear file input
    document.getElementById("myfile").value = null;

    // Reset select elements
    document.getElementById("path").selectedIndex = 0;
    document.getElementById("dimFileName").selectedIndex = 0;

    // Reset states if needed
    setFilePaths([]);
    setProcessedData([]);
    setReslistofxml([]);
    setSubject("");
    setTopic("");
    setChapter("");
    setcaptureDataType("");
    setIsArchivalLayerBoxVisible(false);
    setLayers([]);
    setLayerVisibility({});
    setSelectedIndex(0);
    setActivexmlTab("xmlFile-0");

    layers.forEach((layerObj) => {
      const layer = layerObj.layer;
      if (mapRef.current.hasLayer(layer)) {
        mapRef.current.removeLayer(layer);
      }
    });
  };

  // const handleQuit = () => {
  //   navigate('/');
  // };
  useEffect(() => {
    const quitButton = document.querySelector('.Quit-btn');
    const tooltip = new window.bootstrap.Tooltip(quitButton);

    return () => {
      tooltip.dispose(); // Clean up the tooltip when the component unmounts
    };
  }, []);
  useEffect(() => {
    // Initialize the Bootstrap tooltip
    const quitButton = document.querySelector('.Quit-btn');
    if (quitButton) {
      // Initialize tooltip
      const tooltip = new window.bootstrap.Tooltip(quitButton);
      
      // Cleanup function to destroy tooltip on component unmount
      return () => {
        tooltip.dispose();
      };
    }
  }, []);

  const handleQuit = () => {
    
    // window.history.go("/");
    navigate("/MarsHome");
  };
  const handleClear = () => {
    // Clear file input
    document.getElementById("myfile").value = null;

    // Reset select elements
    document.getElementById("path").selectedIndex = 0;
    document.getElementById("dimFileName").selectedIndex = 0;

    // Reset states if needed
    setFilePaths([]);
    setProcessedData([]);
    setReslistofxml([]);
  };
  // Extract Vertex_LON_LAT data directly
  // Extract Vertex_LON_LAT data from all objects in the array
  const allCoordinates = processedData.flatMap((data) =>
    data.Vertex_LON_LAT
      ? Object.keys(data.Vertex_LON_LAT)
        .filter((key) => key.startsWith("X_"))
        .map((key) => {
          const coordIndex = key.split("_")[1];
          const x = data.Vertex_LON_LAT[`X_${coordIndex}`];
          const y = data.Vertex_LON_LAT[`Y_${coordIndex}`];
          return { x, y };
        })
      : []
  );
  let globalSequenceNumber = 1; // Initialize a global sequence number
  // Debug: Check all coordinates extracted
  // //console.log('All Coordinates:', allCoordinates);

  const handleClose = () => {
    const togglebtn = document.getElementById("readxml-btn");
    const editinfobutton = document.getElementById("viewinfo-btn");
    const mapbtn = document.getElementById("map-btn");
    const content = document.getElementById("content");
    const content1 = document.getElementById("content1");
    const mapcontent = document.getElementById("map");

    content.classList.add("hidden");
    content1.classList.add("hidden");
    mapcontent.classList.toggle("hidden");
    mapcontent.classList.remove("hidden");
    mapbtn.style.backgroundColor = "#bf9000";
    mapbtn.style.boxShadow = "2px 4px 2px #262626";
    mapbtn.style.fontWeight = "600";
    togglebtn.style.backgroundColor = "";
    togglebtn.style.boxShadow = "";
    togglebtn.style.fontWeight = "";
    editinfobutton.style.backgroundColor = "";
    editinfobutton.style.boxShadow = "";
    editinfobutton.style.fontWeight = "";
  };

  useEffect(() => {
    // Getting the element by ID
    const closedTab = document.getElementById("ReadCLosed");
    if (closedTab) {
      closedTab.addEventListener("click", handleClose);
    }

    // Cleanup function to remove the event listener on component unmount
    return () => {
      if (closedTab) {
        closedTab.removeEventListener("click", handleClose);
      }
    };
  }, []);

  // console.log("sdsdsdsdsdsdsd", processedData);

  return (
    <div className="mainarchivalbody">
      {/* <Preloader loading={loading} progress={progress} /> */}
      <Loader
        loading={loading}
        progress={progress}
        // onPause={handlePause}
        // onResume={handleResume}
        // onCancel={handleCancel}
        onCancel={() => setLoading(false)}
        onOKButtonClick={handleOKButtonClick}
      />
      <div className="maincontainer content-container none">
        <div className="maincontainerbox1">
          <div className="Fieldset-div">
            <fieldset class="the-archival-fieldset mb-1">
              <legend class="the-archival-legend mx-2">
                MARS DATA ARCHIVAL
              </legend>
              <div className="arch-products-divs">
                <fieldset class="products-fieldset">
                  <legend class="products-legend mx-2">
                    PRODUCT Parameters
                  </legend>
                  <div className="dropdown-flex-container">
                    <div className="tooltip-wrapper">
                      <label className="product-para-label">
                        COMPANY Selection
                      </label>
                      <select
                        name="subject"
                        id="subject"
                        value={subject}
                        onChange={handleSubjectChange}
                        className="inpuselectionoption"
                      >
                        <option value="" selected="selected" disabled>
                          Select Satellite Provider
                        </option>
                        {Object.keys(subjectObject).map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="product-para-label">
                        DATA TYPE Selection
                      </label>

                      <select
                        name="topic"
                        id="topic"
                        value={topic}
                        onChange={handleTopicChange}
                        className="inpuselectionoption"
                      //style={{ width: "199px", cursor: "pointer" }}
                      >
                        <option value="" selected="selected" disabled>
                          Select Type Of Data
                        </option>
                        {subjectObject[subject] &&
                          Object.keys(subjectObject[subject]).map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="product-para-label">
                        MISSION Selection
                      </label>

                      <select
                        name="chapter"
                        id="chapter"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="inpuselectionoption"
                      //style={{ width: "199px", cursor: "pointer" }}
                      >
                        <option value="" selected="selected" disabled>
                          Select Mission
                        </option>
                        {subjectObject[subject] &&
                          subjectObject[subject][topic] &&
                          subjectObject[subject][topic].map((chap) => (
                            <option key={chap} value={chap}>
                              {chap}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="product-para-label">
                        ACQUISATION Mode
                      </label>

                      <select
                        name="captureDataType"
                        id="captureDataType"
                        value={captureDataType}
                        onChange={(e) => setcaptureDataType(e.target.value)}
                        className="inpuselectionoption"
                      //style={{ width: "199px", cursor: "pointer" }}
                      >
                        <option value="" selected="selected" disabled>
                          Select Capture Data Type
                        </option>
                        {chapter &&
                          captureDataTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </fieldset>
              </div>
              <div className="arch-products-divs">
                <fieldset class="products-fieldset">
                  <legend class="products-legend mx-2">EXTRACT Metadata</legend>

                  {/* <div className="d-flex"> */}
                  <div className="Extract-Div ">
                    <div>
                      <label className="Extract-metadata-label">
                        ZIP FILE Path
                      </label>
                      <span className="ErrorShowDisableUplodBtn">
                        {isUploadDisabled &&
                          "Please Select Data Upload Parameters"}
                      </span>
                      {/* <br /> */}
                      <div className=" d-flex ">
                        <div className="File-div">
                          <select
                            id="path"
                            className={`file-path ${isUploadDisabled ? "disabled" : ""
                              }`}
                            // value={path}
                            disabled={isUploadDisabled}
                            // onChange={handleSelectChange} // Add an onChange event handler
                            placeholder="Select a file"
                          >
                            {filePaths.length === 0 ? (
                              <option value="" disabled selected>
                                Selected File Path
                              </option>
                            ) : (
                              <>
                                <option value="" disabled>
                                  Selected File Path
                                </option>
                                {filePaths.map((file, index) => (
                                  <option key={index} value={file.name}>
                                    {file.name}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                        <div className="custom-file-div">
                          <label
                            for="myfile"
                            // data-bs-toggle="tooltip-bottom"
                            // data-bs-placement="bottom"
                            // title="Upload File"

                            disabled={isUploadDisabled}
                            class={`custom-file-upload ${isUploadDisabled ? "disabled" : ""
                              }`}
                          >
                            <FontAwesomeIcon
                              className="archivalUploadIcon"
                              icon={faWindowRestore}
                            />
                          </label>
                          <input
                            type="file"
                            id="myfile"
                            name="file"
                            class="hidden-file-input"
                            required
                            accept=".zip"
                            onChange={handleFileChange}
                            disabled={isUploadDisabled}
                            multiple
                          />
                        </div>
                      </div>
                    </div>

                    {/* _______________ */}
                    <div className="Extract-btn-div">
                    <Tooltip title="Exrtact Image Information" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-493px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >  <button
                        onClick={uploadFile}
                        // disabled={reslistofxml.length === 0}
                        disabled={isUploadDisabled}
                        className={`Ext-img-info ${isUploadDisabled ? "disabled" : ""
                          }`}
                        // data-bs-toggle="tooltip-bottom"
                        // data-bs-placement="bottom"
                        // title="Exrtact Image Information"
                      >
                        EXTRACT IMAGE INFORMATION
                      </button></Tooltip>
                    
                    </div>
                    {/* _______________ */}

                    <div className="xmlFIlePathDiv">
                      <label className="Extract-metadata-label" id="XMLFILE">
                        XML FILE Path{" "}
                      </label>
                      {/* <br /> */}
                      {processedData && processedData.length > 0 ? (
                        <select
                          id="dimFileName"
                          onChange={handleDropdownChange}
                          value={selectedIndex} // Sync dropdown with selected index
                          className={`dimFileName_class ${reslistofxml.length === 0 ? "disabled" : ""
                            }`}
                          disabled={reslistofxml.length === 0}
                        >
                          {processedData
                            .sort((a, b) => {
                              // Extract the numeric part from the filenames
                              const numA = parseInt(
                                a.xmlFile.split("-").pop().replace(".xml", ""),
                                10
                              );
                              const numB = parseInt(
                                b.xmlFile.split("-").pop().replace(".xml", ""),
                                10
                              );

                              // Return comparison
                              return numA - numB; // Ascending order All XML Files
                            })
                            .map((variable, index) => (
                              <option key={index} value={index}>
                                {variable.xmlFile}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <select
                          id="dimFileName"
                          className={`dimFileName_class ${reslistofxml.length === 0 ? "disabled" : ""
                            }`}
                          disabled={reslistofxml.length === 0}
                        >
                          <option value="" disabled selected>
                            No Files Available
                          </option>
                        </select>
                      )}
                    </div>

                    <div className="ClearExtract-btn-div">
                    <Tooltip title="Clear" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-393px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
                          <button
                        onClick={handleClear}
                        // disabled={reslistofxml.length === 0}
                        disabled={isUploadDisabled}
                        className={`ReloadButton ${isUploadDisabled ? "disabled" : ""
                          }`}
                        // data-bs-toggle="tooltip"
                        // data-bs-placement="right"
                        // title="Clear"
                      >
                        CLEAR
                      </button>
 
                        </Tooltip>
                     
                      {/* <button
                      onClick={uploadFile}
                      disabled={isUploadDisabled}
                      className={`Ext-img-info ${isUploadDisabled ? "disabled" : ""
                        }`}
                      title="Exrtact Image Information"
                    >
                      EXTRACT IMAGE INFORMATION
                    </button> */}
                    </div>
                  </div>
                </fieldset>
              </div>
              {showlistdatanotfound.length > 0 && (
                <div className="listDataNotGetMainBox">
                  <button
                    onClick={toggleDetails}
                    title="To See The List Of Data Not Get"
                  >
                    <FontAwesomeIcon
                      className="dataMissIformation"
                      icon={faCircleInfo}
                    />
                  </button>
                  {showDetails && (
                    <div className="listDataNotGet">
                      {showlistdatanotfound.map((item, index) => (
                        <details key={index}>
                          <summary>
                            {index}:&nbsp;{item.file_name.split("/").pop()}
                          </summary>
                          <p>
                            Some_tag_attrib_not_found: <br></br>
                            <b>
                              {" "}
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              {item.Some_tag_attrib_not_found.join(",\n ")
                                .split("/")
                                .pop()}{" "}
                            </b>
                            {/* or used .match(/\/([^\/]+)$/)[1] */}
                          </p>
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="arch-products-divs">
                <fieldset class="products-fieldset">
                  <legend class="products-legend mx-2">
                    VIEW & EDIT Metadata
                  </legend>
                  <div className="togglebuttonbox">
                  <Tooltip
                          className="mb-0 pb-0"
                          title="View Info"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{ position: "relative", top: "-289px" }}
                        >
                        <button
                      id="viewinfo-btn"
                      // title={"View Info chhasy6"}
                      onClick={toggleContentDiv1}
                      disabled={reslistofxml.length === 0}
                      className={`viewinfo-btn ${reslistofxml.length === 0 ? "disabled" : ""
                        }`}
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                    >
                      VIEW INFO
                    </button>
                        </Tooltip>
                        <Tooltip title="Edit Info" placement="bottom"
                         overlayStyle={{ position: "relative", top: "-289px" }}
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
                            <button
                      onClick={newOpenPopup}
                      id="editinfo-btn"
                      className={`editinfo-btn ${reslistofxml.length === 0 ? "disabled" : ""
                        }`}
                      // title={"Edit Info"}
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                      disabled={reslistofxml.length === 0}
                    >
                      EDIT INFO
                    </button>
                        </Tooltip>


                        <Tooltip title="See Map Here" placement="bottom"
                         overlayStyle={{ position: "relative", top: "-289px" }}
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  >
                           <button
                      id="readxml-btn"
                      onClick={toggleContentDiv}
                      // title={"Read XML"}
                      disabled={reslistofxml.length === 0}
                      className={`readxml-btn ${reslistofxml.length === 0 ? "disabled" : ""
                        }`}
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                    >
                      READ XML
                    </button>

                         </Tooltip>
                  
                         <Tooltip title="Read XML" placement="bottom"
                         overlayStyle={{ position: "relative", top: "-289px" }}
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  >
                           <button
                      id="map-btn"
                      // title={"See Map Here"}
                      disabled={reslistofxml.length === 0}
                      className={`map-btn ${reslistofxml.length === 0 ? "disabled" : ""
                        }`}
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                    >
                      VIEW MAP
                    </button>
                         </Tooltip>
                   
                  </div>
                </fieldset>
              </div>
              <div className="arch-products-divs">
                <fieldset class="View-table-fieldset">
                  <legend class="View-table-legend mx-2">VIEW Table</legend>
                  <div className="databasetablebox">
                  <Tooltip title="Main Table Data" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
   <button
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                      // title={"Main Table Data"}
                      id="button1"
                      onClick={showTable1}
                      className={`button1 ${table1Visible ? "table-visible" : "table-hidden"
                        }`}
                    >
                      MAIN TABLE INFO
                    </button>
                        </Tooltip>
                 
                    <Tooltip title="Bands Table Data" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
                              <button
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                      // title={"Bands Table Data"}
                      id="button2"
                      onClick={showTable2}
                      className={`button2 ${table2Visible ? "table-visible" : "table-hidden"
                        }`}
                    >
                      BAND TABLE INFO
                    </button>
                        </Tooltip>
                    
                    <Tooltip title="Bounds Table Data" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
                           <button
                      // data-bs-toggle="tooltip-bottom"
                      // data-bs-placement="bottom"
                      // title={"Bounds Table Data"}
                      id="button3"
                      onClick={showTable3}
                      className={`button3 ${table3Visible ? "table-visible" : "table-hidden"
                        }`}
                    >
                      BOUND TABLE INFO
                    </button>
                        </Tooltip>
                   
                  </div>
                </fieldset>
              </div>

              {/* ===================== Buttons ================= */}
              <div className="tooltipDownloadtimer">
                <div className="">
                <Tooltip title="Archive Data" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-123px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        >
                           <button
                    className={`submit_taks ${reslistofxml.length === 0 ? "disabled" : ""
                      }`}
                    disabled={reslistofxml.length === 0}
                    onClick={handleArchiveClick}
                    // data-bs-toggle="tooltip-bottom"
                    // data-bs-placement="bottom"
                    // title={"Archive Data"}
                  >
                    ARCHIVE DATA
                  </button>
                        </Tooltip>
                 
                  <Tooltip title="Archive Shapefile" placement="bottom"
                //  overlayStyle={{ position: "relative", top: "-125px" }}
                         mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                         mouseLeaveDelay={0.5} // Delay before the tooltip disappears 
                        >  <button
                        onClick={handleButtonClick}
                        className={`shapefileExport ${reslistofxml.length === 0 ? "disabled" : ""
                          }`}
                        disabled={reslistofxml.length === 0}
                        // data-bs-toggle="tooltip-bottom"
                        // data-bs-placement="bottom"
                        // title={"Archive Shapefile"}
                      >
                        EXPORT AS SHAPEFILE
                      </button> </Tooltip>
                
                </div>
                <div className="">
                <Tooltip title="Reset Data" placement="bottom"
                 overlayStyle={{ position: "relative", top: "-123px" }}
                         mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                         mouseLeaveDelay={0.5} // Delay before the tooltip disappears 
                        > <button
                        // className={`Reset-btn ${
                        //   reslistofxml.length === 0 ? "disabled" : ""
                        // }`}
                        className="Reset-btn"
                        // disabled={reslistofxml.length === 0}
                        // onClick={handleReload}
                        onClick={handleReset}
                        // data-bs-toggle="tooltip-bottom"
                        // data-bs-placement="bottom"
                        // title={"Reset Data"}
                      >
                        RESET
                      </button></Tooltip>
                 
                  <Tooltip title="Quite" placement="bottom"
                    overlayStyle={{ position: "relative", top: "-58px" }}
                         mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                         mouseLeaveDelay={0.5} // Delay before the tooltip disappears 
                       
                        ><button
                        onClick={handleQuit}
                        // className={`Quit-btn ${
                        //   reslistofxml.length === 0 ? "disabled" : ""
                        // }`}
                        // disabled={reslistofxml.length === 0}
                        className="Quit-btn"
                        // data-bs-toggle="tooltip-bottom"
                        // data-bs-placement="bottom"
                        // title={"Quit"}
                      >
                        QUIT
                      </button></Tooltip>
                  
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        <div
          id="newpopup"
          className="newpopup"
          style={{ display: newpopupVisible ? "block" : "none" }}
        >
          <div className="Archival-data-newpopup-content">
            <div className="newfromheader">
              <div
                className="new-form-header-label"
                style={{ display: "inline-flex" }}
              >
                <img
                  src="MARS_LOGO.png"
                  alt="Site Logo"
                  width="28"
                  height="28"
                />
                <label className="newformheading">
                  MARS-ARCHIVAL DATA EXTRACTED INFROMATION
                </label>
              </div>

              <div className="newclosebox">
                <span className="newclose" onClick={newClosePopup}>
                  &#9932;
                </span>
              </div>
            </div>
            <div>
              {/* Include your function call here */}
              {xmlCount !== null && xmlCount === 0 ? (
                <div className="messageBox">
                  <h1 className="messageBoxHeading">
                    You can submit the form only once.
                  </h1>
                </div>
              ) : (
                <div className="formbox">
                  <form id="myForm" onSubmit={handleNEWFormSubmit}>
                    <div>
                      <div className="formMainBoxArchival">
                        <div className="FirstBoxForm">
                          <div className="XMLFileCount-div">
                            <span className="XMLFileCount">
                              User Fill Infromation
                            </span>
                          </div>
                          <hr></hr>
                          {/* <div>
                            <h4 className="ArchivalFormSectionHeading">Second Part (CLIENT INFROMATION)</h4>
                          </div> */}

                          <div className="clientinfomainbox">
                            <h4 className="ArchivalFormSectionHeading">
                              Second Part (CLIENT INFROMATION)
                            </h4>
                            {/* <div className="clientinfofirstbox"> */}
                            <div className="card-box-new-client">
                              <ArchivalValidationComponent
                                onValidationError={handleValidationError}
                                label="Client Order Name"
                                type="text"
                                id="cl_orderna"
                                name="cl_orderna"
                                className="cl_orderna"
                                value={CL_ORDNA}
                                onChange={(e) => setCL_ORDNA(e.target.value)}
                                placeholder="Enter Client Order Name..."
                                maxLength="50"
                                validationRules={[
                                  { required: true },
                                  { maxLength: 50 },
                                ]}
                              />
                            </div>
                            {/* </div> */}
                            <div className="clientinfosecondbox">
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Client Project Name, If Any"
                                  type="text"
                                  id="cl_projna"
                                  name="cl_projna"
                                  className="cl_projna"
                                  value={CL_PROJNA}
                                  onChange={(e) => setCL_PROJNA(e.target.value)}
                                  placeholder="Enter Client Project Name..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Client Data Project Description"
                                  type="text"
                                  id="cl_purpose"
                                  name="cl_purpose"
                                  className="cl_purpose"
                                  value={CL_PURPOSE}
                                  onChange={(e) =>
                                    setCL_PURPOSE(e.target.value)
                                  }
                                  placeholder="Enter Client Data Project Description..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Client Address(Flat No/Building Name/Colony/Landmark)"
                                  type="text"
                                  id="cl_address1"
                                  name="cl_address1"
                                  className="cl_address1"
                                  value={CL_ADDRESS1}
                                  onChange={(e) =>
                                    setCL_ADDRESS1(e.target.value)
                                  }
                                  placeholder="Enter Client Address..."
                                  maxLength="150"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 150 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Client Address (P.O,City/Pin/State/Country)"
                                  type="text"
                                  id="cl_address2"
                                  name="cl_address2"
                                  className="cl_address2"
                                  value={CL_ADDRESS2}
                                  onChange={(e) =>
                                    setCL_ADDRESS2(e.target.value)
                                  }
                                  placeholder="Enter Client Address..."
                                  maxLength="150"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 150 },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>

                          {/* <div>
                            <h4 className="ArchivalFormSectionHeading">Fourth Part (LOCATION INFROMATION)</h4>
                          </div> */}

                          <div className="loactioninfomainbox">
                            <h4 className="ArchivalFormSectionHeading">
                              Fourth Part (LOCATION INFROMATION)
                            </h4>

                            <div className="loactioninfofirstbox">
                              <div className="card-box-new-loaction">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Data Location Country"
                                  type="text"
                                  id="dloca_cyid"
                                  name="dloca_cy"
                                  className="dloca_cy"
                                  value={DLOCA_CY}
                                  onChange={(e) => setDLOCA_CY(e.target.value)}
                                  placeholder="Enter Data Location Country..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new-loaction">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Data Location State"
                                  type="text"
                                  id="dloca_stid"
                                  name="dloca_st"
                                  className="dloca_st"
                                  value={DLOCA_ST}
                                  onChange={(e) => setDLOCA_ST(e.target.value)}
                                  placeholder="Enter Data Location State..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                              {/* </div>

                            <div className="loactioninfosecondbox"> */}
                              <div className="card-box-new-loactionname">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Data Location District"
                                  type="text"
                                  id="dloca_dtid"
                                  name="dloca_dt"
                                  className="dloca_dt"
                                  value={DLOCA_DT}
                                  onChange={(e) => setDLOCA_DT(e.target.value)}
                                  placeholder="Enter Data Location District..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new-loactionname">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Location Name"
                                  type="text"
                                  id="dloca_locaid"
                                  name="dloca_loca"
                                  className="dloca_loca"
                                  value={DLOCA_LOCA}
                                  onChange={(e) =>
                                    setDLOCA_LOCA(e.target.value)
                                  }
                                  placeholder="Enter Data Location Name..."
                                  maxLength="100"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 100 },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>

                          {/* <div>
                            <h4 className="ArchivalFormSectionHeading">
                              Six Part (ARCHIVAL INFROMATION)
                            </h4>
                          </div> */}

                          <div className="archivalinfomainbox">
                            <h4 className="ArchivalFormSectionHeading">
                              Six Part (ARCHIVAL INFROMATION)
                            </h4>

                            <div className="archivalinfofirstbox">
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Archival Data Path"
                                  type="text"
                                  id="al_da_path"
                                  name="al_da_path"
                                  className="al_da_path"
                                  value={AL_DA_PATH}
                                  onChange={(e) =>
                                    setAL_DA_PATH(e.target.value)
                                  }
                                  placeholder="Enter Archival Data Path..."
                                  maxLength="150"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 150 },
                                  ]}
                                />
                              </div>
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Archival Link- Shapefile Data Location"
                                  type="text"
                                  id="al_sh_path"
                                  name="al_sh_path"
                                  className="al_sh_path"
                                  value={AL_SH_PATH}
                                  onChange={(e) =>
                                    setAL_SH_PATH(e.target.value)
                                  }
                                  placeholder="Enter Shapefile Data Location..."
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 150 },
                                  ]}
                                  maxLength="150"
                                />
                              </div>
                              <div className="card-box-new">
                                <ArchivalValidationComponent
                                  onValidationError={handleValidationError}
                                  label="Archival Link- QL Path"
                                  type="text"
                                  id="al_ql_path"
                                  name="al_ql_path"
                                  className="al_ql_path"
                                  value={AL_QL_PATH}
                                  onChange={(e) =>
                                    setAL_QL_PATH(e.target.value)
                                  }
                                  placeholder="Enter Archival Link- QL Path..."
                                  maxLength="150"
                                  validationRules={[
                                    { required: true },
                                    { maxLength: 150 },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="vl-line-edit-info"></div>
                        <div className="SecondBoxForm">
                          <div className="xml-tab-heading">
                            <span className="xmlTabHeading">
                              Extracted Form Input Data And Editable
                            </span>
                          </div>
                          <hr></hr>
                          <Tabs>{renderFormFields()}</Tabs>
                        </div>
                      </div>

                      {/* Button */}
                      <div
                        className={
                          xmlCount !== null && xmlCount === 0
                            ? "card-box-btn hidden"
                            : "card-box-btn "
                        }
                      >
                        <button
                          type="submit"
                          id="cardboxbtn"
                          data-bs-toggle="tooltip-bottom"
                          data-bs-placement="bottom"
                          title={"Submit Form Data"}
                        >
                          Submit
                        </button>

                        <button
                          type="submit"
                          id="cancel-cardboxbtn"
                          data-bs-toggle="tooltip-bottom"
                          data-bs-placement="bottom"
                          title={"Cancel Submiting"}
                          onClick={newClosePopup}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
            {/* Form Footer */}
            {/* <div className="newfromfooter">
              <div>
                <span>
                  Copyright © 2023 Micronet Solutions, All Rights Reserved.
                </span>
              </div>
              <div>
                <span>Terms of use</span>
                <span>|</span>
                <span>Privacy policy</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* **************** Right Side portion ******************** */}
        <div className="maincontainerbox2">
          <div id="ContBox2-innerDiv" className="ContBox2-innerDiv">
            {/* <fieldset class="cont-box2-fieldset mb-4"> */}
            {/* <legend class="cont-box2-legend mx-2">Extract Image Data Info</legend> */}
            <div id="im-da-info">
              {/* {visibleContent === 'content' && ( */}
              <div className="toggle-div scrollable-div" id="content">
                <div className="Search-bar-XML">
                  <span className="ReadXMLSearchBox">
                    <input
                      type="text"
                      id="searchTerm"
                      className="Search-bar-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search XML data..."
                    />
                    {/* Display the current position */}
                    {searchPositions.length > 0 ? (
                      <label className="search-position-text">
                        {currentPositionText}
                      </label>
                    ) : (
                      <label className="search-position-text">No results</label>
                    )}
                    <button className="search-btn-con" onClick={highlightText}>
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                    <button
                      className="search-btn-con"
                      onClick={() => navigateSearch(-1)}
                      title="Go Up"
                    >
                      <FontAwesomeIcon icon={faAngleUp} />
                    </button>
                    <button
                      className="search-btn-con"
                      onClick={() => navigateSearch(1)}
                      title="Go Down"
                    >
                      <FontAwesomeIcon icon={faAngleDown} />
                    </button>
                    <button
                      className="search-btn-con"
                      onClick={clearSearch}
                      title="Clear Search"
                    >
                      <FontAwesomeIcon icon={faDeleteLeft} />
                    </button>
                  </span>
                </div>

                {processedData.length > 0 && (
                  <div className="read-xml-file-tab-container">
                    <div className="Read-xml-Tabs-closed" onClick={handleClose}>
                      &#9932;
                    </div>

                    <Tabs
                      activeKey={activexmlTab}
                      onSelect={handleTabSelect}
                      id="xml-tabs"
                      className="View-xml-tab"
                    >
                      {processedData.map((xmlFile, index) => (
                        <Tab
                          key={index}
                          eventKey={`xmlFile-${index}`}
                          title={`XML File ${index + 1}`}
                        >
                          <span className="Read-XMLFileCount">
                            <strong>Name Of XML File: &nbsp; </strong>
                            {xmlFile.xmlFile}
                          </span>
                          <pre id="xml_data_id" className="pre-xmldata">
                            {xmlFile.xml_text}
                          </pre>
                        </Tab>
                      ))}
                    </Tabs>
                  </div>
                )}
              </div>

              <div className="toggle-div1 scrollable-div1" id="content1">
                <div id="viewinfoid" className="viewInfo-class" style={{ lineHeight: "1.6" }}>
                  <div className="ArchivalTab-container mb-0">
                    {/* <div className="ArchivalTab-content-container"> */}
                    <span
                      className="View-Info-Tabs-closed"
                      id="View-Info-Tabs-closed"
                    >
                      &#9932;
                    </span>

                    <Tabs
                      defaultActiveKey="TABLEDATA"
                      id="uncontrolled-tab-example"
                      className="View-Info-Tabs"
                    >
                      
                      {/* Tab -1 */}
                      <Tab eventKey="TABLEDATA" title="MAIN TABLE DATA">
                        {/* <div className={`ArchivalTab-content ${activeTab === 0 ? 'ArchivalActive-tab-content' : ''}`}> */}
                        
                        <Tabs
        activeKey={activexmlTab}
        // onSelect={(k) => handleTabSelectP(parseInt(k.split('-')[1]))}
        onSelect={handleTabSelectP} 
        value={selectedIndex}
       className="View-Info-Tabs"
        // onChange={handleDropdownChange}
        // onClick={handleTabSelect}
      //  id="uncontrolled-tab-example"
      //                 className="View-Info-Tabs"
      >
        {processedData &&
          processedData.length > 0 &&
          processedData.map((item, index) => (
            <Tab
            className={`maintabledatarow ViewinfoTab ${activexmlTab === `xmlFile-${index}` ? "active-tab" : ""}`}
            //  id="dimFileName"
              key={index}
              eventKey={`xmlFile-${index}`}
              // eventKey={index}
              title={`XML ${index + 1}`}
              style={index === processedData.length - 1 ? { borderLeft: "1px solid black" } : {}}
            >
              <TabContent>
                <TabPane>
                  <div className="nested-tab-content">
                    <p>{`Data for tab ${index + 1}`}</p>
                  </div>
                </TabPane>
              </TabContent>
            </Tab>
          ))}
      </Tabs>
                        <div className="ArchivalTab-content-container">
                          {selectedOption && (
                            <table
                              style={{ width: "30%", maxWidth: "100%" }}
                              className="maintabledata"
                            >
                              <thead>
                                <tr className="maintabledatarow">
                                  <th className="maintabledataheading maintabledataheading-srno">
                                    Sr.No.
                                  </th>
                                  <th className="maintabledataheading">
                                    ATTRIBUTE
                                  </th>
                                  <th className="maintabledataheading">
                                    VALUE
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  {
                                    label: "XLM FILE NAME",
                                    value: selectedOption.xmlFile,
                                  },
                                  {
                                    label: "DATA NAME",
                                    value: selectedOption.dname,
                                  },
                                  {
                                    label: "COMPANY NAME",
                                    value: selectedOption.cname,
                                  },
                                  {
                                    label: "SATELLITE NAME",
                                    value: selectedOption.sname,
                                  },
                                  {
                                    label: "CUSTOMER ID",
                                    value: selectedOption.clRef,
                                  },
                                  {
                                    label: "SENSOR NAME",
                                    value: selectedOption.senName,
                                  },
                                  {
                                    label: "DATA PROCESS LEVEL",
                                    value: selectedOption.imgDataType,
                                  },
                                  {
                                    label: "DATA SPECTRAL PROC",
                                    value: selectedOption.imgDataProcSpec,
                                  },
                                  {
                                    label: "IMAGING DATE",
                                    value: selectedOption.imgDate,
                                  },
                                  // { label: "DATA Size", value: selectedOption.ZIP_SIZE },
                                  {
                                    label: "DATA Size",
                                    value: selectedOption.dSize,
                                  },
                                  {
                                    label: "SURFACE AREA(sqkm)",
                                    value: selectedOption.dArea,
                                  },
                                  {
                                    label: "QL PATH",
                                    value: selectedOption.dQLname,
                                  },
                                  {
                                    label: "DATA FORMAT",
                                    value: selectedOption.dFormat,
                                  },
                                  {
                                    label: "CLOUD COVERAGE",
                                    value: selectedOption.dCloud,
                                  },
                                  {
                                    label: "SNOW COVERAGE",
                                    value: selectedOption.dSnow,
                                  },
                                  {
                                    label: "ACQUISITION RANGE",
                                    value: selectedOption.dAQBits,
                                  },
                                  {
                                    label: "PRODUCT RANGE",
                                    value: selectedOption.dPRBits,
                                  },
                                  // { label: "PROJECTION TABLE", value: selectedOption.DPRJ_TABLE },
                                  {
                                    label: "PROJECTION Table",
                                    value: selectedOption.dPRJTable,
                                  },
                                  {
                                    label: "PROJECTION NAME",
                                    value: selectedOption.dPRJName,
                                  },
                                  // { label: "PROJECTION NAME", value: selectedOption.DPRJ_TABLE },
                                  {
                                    label: "DATA ROWS NO",
                                    value: selectedOption.dRows,
                                  },
                                  {
                                    label: "DATA COLUMNS NO",
                                    value: selectedOption.dCols,
                                  },
                                  {
                                    label: "DATA BANDS NO",
                                    value: selectedOption.dBands,
                                  },
                                  {
                                    label: "DATA TILES NO",
                                    value: selectedOption.dTiles,
                                  },
                                  {
                                    label: "DATA TYPE",
                                    value: selectedOption.dType,
                                  },
                                  {
                                    label: "DATA SIGNAGE",
                                    value: selectedOption.dSign,
                                  },
                                  {
                                    label: "INCIDENCE ANGLE",
                                    value: selectedOption.dINAngle,
                                  },
                                  {
                                    label: "GSD ACROSS PATH",
                                    value: selectedOption.dGSDAxt,
                                  },
                                  {
                                    label: "GSD ALONG PATH",
                                    value: selectedOption.dGSDAlt,
                                  },
                                  {
                                    label: "PIXEL IN X DIR",
                                    value: selectedOption.dPixelX,
                                  },
                                  {
                                    label: "PIXEL IN Y DIR",
                                    value: selectedOption.dPixelY,
                                  },
                                ].map((item, index) => (
                                  <tr
                                    key={index}
                                    className={`maintabledatarow ${item.value
                                      ? "background-blue"
                                      : "background-red"
                                      }`}
                                  >
                                    <td className="maintabledata_data maintabledata_data-srno">
                                      {index + 1}
                                    </td>
                                    <td className="maintabledata_data">
                                      {item.label}
                                    </td>
                                    <td className="maintabledata_data">
                                      {item.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* </div> */}
                      </Tab>
                      {/* Tab -2 */}
                      <Tab
                        eventKey="BANDSINFORMATION"
                        title="BANDS INFORMATION"
                      >
                          <Tabs
        activeKey={activexmlTab}
        // onSelect={(k) => handleTabSelectP(parseInt(k.split('-')[1]))}
        onSelect={handleTabSelectP} 
        value={selectedIndex}
       className="View-Info-Tabs"
        // onChange={handleDropdownChange}
        // onClick={handleTabSelect}
      //  id="uncontrolled-tab-example"
      //                 className="View-Info-Tabs"
      >
        {processedData &&
          processedData.length > 0 &&
          processedData.map((item, index) => (
            <Tab
            className={`maintabledatarow ViewinfoTab ${activexmlTab === `xmlFile-${index}` ? "active-tab" : ""}`}
            //  id="dimFileName"
              key={index}
              eventKey={`xmlFile-${index}`}
              // eventKey={index}
              title={`XML ${index + 1}`}
              style={index === processedData.length - 1 ? { borderLeft: "1px solid black" } : {}}
            >
              <TabContent>
                <TabPane>
                  <div className="nested-tab-content">
                    <p>{`Data for tab ${index + 1}`}</p>
                  </div>
                </TabPane>
              </TabContent>
            </Tab>
          ))}
      </Tabs>
                        {/* <div className={`ArchivalTab-content ${activeTab === 1 ? 'ArchivalActive-tab-content' : ''}`}> */}
                        <div className="ArchivalTab-content-container">
                          {selectedOption && selectedOption.bands ? (
                            <table
                              id="bandsTable"
                              style={{ width: "28%", maxWidth: "100%" }}
                              className="maintabledata"
                            >
                              <thead>
                                <tr className="maintabledatarow">
                                  <th className="maintabledataheading maintabledataheading-srno">
                                    Sr.No.
                                  </th>
                                  <th className="maintabledataheading">
                                    BANDS NAME
                                  </th>
                                  <th className="maintabledataheading">
                                    SPEC MIN LIST
                                  </th>
                                  <th className="maintabledataheading">
                                    SPEC MAX LIST
                                  </th>
                                  <th className="maintabledataheading">
                                    MEASURE UNIT
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedOption.bands.length > 0 ? (
                                  selectedOption.bands.map((band, index) => {
                                    const isRedBackground =
                                      !band.Band_ID ||
                                      !band.MIN ||
                                      !band.MAX ||
                                      !band.MEASURE_UNIT;

                                    return (
                                      <tr
                                        key={index}
                                        className={`maintabledatarow ${isRedBackground
                                          ? "background-red"
                                          : "background-blue"
                                          }`}
                                      >
                                        <td className="maintabledata_data maintabledata_data-srno">
                                          {index + 1}
                                        </td>
                                        <td className="maintabledata_data ">
                                          {band.Band_ID || "Data not available"}
                                        </td>
                                        <td className="maintabledata_data maintabledata_data-srno">
                                          {band.MIN || "Data not available"}
                                        </td>
                                        <td className="maintabledata_data maintabledata_data-srno">
                                          {band.MAX || "Data not available"}
                                        </td>
                                        <td className="maintabledata_data">
                                          {band.MEASURE_UNIT ||
                                            "Data not available"}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr className="maintabledatarow background-red">
                                    <td
                                      colSpan="5"
                                      className="maintabledata_data nodata-table-heading"
                                    >
                                      No data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          ) : (
                            <table
                              id="bandsTable"
                              style={{ width: "33%", maxWidth: "100%" }}
                              className="maintabledata"
                            >
                              <thead>
                                <tr className="maintabledatarow">
                                  <th className="maintabledataheading maintabledataheading-srno">
                                    Sr.No.
                                  </th>
                                  <th className="maintabledataheading">
                                    BANDS NAME
                                  </th>
                                  <th className="maintabledataheading">
                                    SPEC MIN LIST
                                  </th>
                                  <th className="maintabledataheading">
                                    SPEC MAX LIST
                                  </th>
                                  <th className="maintabledataheading">
                                    MEASURE UNIT
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="maintabledatarow background-red">
                                  <td
                                    colSpan="5"
                                    className="maintabledata_data nodata-table-heading"
                                  >
                                    No data available
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                        </div>
                        {/* </div> */}
                      </Tab>
                      {/* Tab -3 */}
                      <Tab
                        eventKey="BOUNDSINFORMATION"
                        title="BOUNDS INFORMATION"
                      >
                          <Tabs
        activeKey={activexmlTab}
        // onSelect={(k) => handleTabSelectP(parseInt(k.split('-')[1]))}
        onSelect={handleTabSelectP} 
        value={selectedIndex}
       className="View-Info-Tabs"
        // onChange={handleDropdownChange}
        // onClick={handleTabSelect}
      //  id="uncontrolled-tab-example"
      //                 className="View-Info-Tabs"
      >
        {processedData &&
          processedData.length > 0 &&
          processedData.map((item, index) => (
            <Tab
            className={`maintabledatarow ViewinfoTab ${activexmlTab === `xmlFile-${index}` ? "active-tab" : ""}`}
            //  id="dimFileName"
              key={index}
              eventKey={`xmlFile-${index}`}
              // eventKey={index}
              title={`XML ${index + 1}`}
              style={index === processedData.length - 1 ? { borderLeft: "1px solid black" } : {}}
            >
              <TabContent>
                <TabPane>
                  <div className="nested-tab-content">
                    <p>{`Data for tab ${index + 1}`}</p>
                  </div>
                </TabPane>
              </TabContent>
            </Tab>
          ))}
      </Tabs>
                        {/* <div className={`ArchivalTab-content ${activeTab === 2 ? 'ArchivalActive-tab-content' : ''}`}> */}
                        <div className="ArchivalTab-content-container">
                          {selectedOption && selectedOption.Vertex_LON_LAT ? (
                            <table
                              id="boundsTable"
                              style={{ width: "15%", maxWidth: "70%" }}
                              className="maintabledata"
                            >
                              <thead>
                                <tr className="maintabledatarow">
                                  <th className="maintabledataheading maintabledataheading-srno">
                                    Sr.No.
                                  </th>
                                  <th className="maintabledataheading">
                                    COOD XX
                                  </th>
                                  <th className="maintabledataheading">
                                    COOD YY
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  let sequentialIndex4 = 1;
                                  return Object.entries(
                                    selectedOption.Vertex_LON_LAT
                                  )
                                    .filter(([key]) => key.startsWith("X_"))
                                    .map(([key, value]) => {
                                      const coordX = value;
                                      const coordY =
                                        selectedOption.Vertex_LON_LAT[
                                        `Y_${key.substr(2)}`
                                        ];
                                      const isRedBackground =
                                        !coordX || !coordY;
                                      return (
                                        <tr
                                          key={sequentialIndex4}
                                          className={`maintabledatarow ${isRedBackground
                                            ? "background-red"
                                            : "background-blue"
                                            }`}
                                        >
                                          <td className="maintabledata_data maintabledata_data-srno">
                                            {sequentialIndex4++}
                                          </td>
                                          <td className="maintabledata_data maintabledata_data-srno">
                                            {coordX || "Data not available"}
                                          </td>
                                          <td className="maintabledata_data maintabledata_data-srno">
                                            {coordY || "Data not available"}
                                          </td>
                                        </tr>
                                      );
                                    });
                                })()}
                                {Object.entries(
                                  selectedOption.Vertex_LON_LAT
                                ).filter(([key]) => key.startsWith("X_"))
                                  .length === 0 && (
                                    <tr className="maintabledatarow background-red">
                                      <td
                                        colSpan="3"
                                        className="maintabledata_data nodata-table-heading"
                                      >
                                        No data available
                                      </td>
                                    </tr>
                                  )}
                              </tbody>
                            </table>
                          ) : (
                            <table
                              id="boundsTable"
                              style={{ width: "15%", maxWidth: "70%" }}
                              className="maintabledata"
                            >
                              <thead>
                                <tr className="maintabledatarow">
                                  <th className="maintabledataheading maintabledataheading-srno">
                                    Sr.No.
                                  </th>
                                  <th className="maintabledataheading">
                                    COOD XX
                                  </th>
                                  <th className="maintabledataheading">
                                    COOD YY
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="maintabledatarow background-red">
                                  <td
                                    colSpan="3"
                                    className="maintabledata_data nodata-table-heading"
                                  >
                                    No data available
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                        </div>
                        {/* </div> */}
                      </Tab>

                      {/* Tab -4 */}
                      <Tab
                        eventKey="PREVIEWIMAGE"
                        className="preview-img-tag"
                        title="PREVIEW IMAGE"
                      >
                          <Tabs
        activeKey={activexmlTab}
        // onSelect={(k) => handleTabSelectP(parseInt(k.split('-')[1]))}
        onSelect={handleTabSelectP} 
        value={selectedIndex}
       className="View-Info-Tabs"
        // onChange={handleDropdownChange}
        // onClick={handleTabSelect}
      //  id="uncontrolled-tab-example"
      //                 className="View-Info-Tabs"
      >
        {processedData &&
          processedData.length > 0 &&
          processedData.map((item, index) => (
            <Tab
            className={`maintabledatarow ViewinfoTab ${activexmlTab === `xmlFile-${index}` ? "active-tab" : ""}`}
            //  id="dimFileName"
              key={index}
              eventKey={`xmlFile-${index}`}
              // eventKey={index}
              title={`XML ${index + 1}`}
              style={index === processedData.length - 1 ? { borderLeft: "1px solid black" } : {}}
            >
              <TabContent>
                <TabPane>
                  <div className="nested-tab-content">
                    <p>{`Data for tab ${index + 1}`}</p>
                  </div>
                </TabPane>
              </TabContent>
            </Tab>
          ))}
      </Tabs>
                        {/* <div className={`ArchivalTab-content ${activeTab === 3 ? 'ArchivalActive-tab-content' : ''}`}> */}
                        <div className="ArchivalTab-content-container">
                          {selectedOption && selectedOption.image_data_xml ? (
                            <div className="preview-img-content-box">
                              <div className="view-info-Preview-img-label">
                                <span>
                                  <strong>Preview Image File Name:</strong>{" "}
                                  &nbsp;
                                  {selectedOption &&
                                    selectedOption.image_data_xml &&
                                    selectedOption.image_data_xml.file_path
                                    ? selectedOption.image_data_xml.file_path
                                      .split("/")
                                      .pop()
                                    : "No file path available"}
                                </span>
                              </div>
                              <div className="preview-img-zoom">
                                <div
                                  className="preview-img-content-img"
                                  ref={containerRef}
                                  onWheel={handleWheel} // Zoom control using mouse wheel
                                >
                                  <img
                                    className="preview-image"
                                    src={`data:image/jpg;base64,${selectedOption.image_data_xml.image_data}`}
                                    alt="Preview Image"
                                    style={imageStyle}
                                    ref={imgRef}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p>No image data available</p>
                          )}
                        </div>
                        {/* </div> */}
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
              {/* )} */}
            </div>
            <div className="map-main-div">
              {/* {visibleContent === 'map' && ( */}
              <div id="map" className="mapbox">
                <div className="polygonebutntoggle-div">
                  <div
                    className="ArchivalVextorLayerBox"
                    onClick={toggleArchivalLayerBox}
                  >
                    <div
                      // onClick={toggleArchivalLayerBox}
                      className="polygonebutntoggle"
                    // className={`polygonebutntoggle ${layers.length === 0 ? 'disable-polygonebutntoggle' : ''}`}
                    >
                      {/* <img src="/Vectors_Layers.svg" alt="Icon" width="30" height="30" /> */}
                      <a
                        onClick={toggleArchivalLayerBox}
                        // class="ArchivalVextorLayerIcon"
                        className={`ArchivalVextorLayerIcon ${layers.length === 0
                          ? "disable-ArchivalVextorLayerIcon"
                          : ""
                          }`}
                        href="#"
                        data-bs-toggle="tooltip-bottom"
                        data-bs-placement="bottom"
                        title="Vector Layers"
                        role="button"
                      ></a>
                    </div>
                  </div>

                  {/* <div className="archivalmappolygontip">
                    <span className="tooltipTextPolygone">We Can See Extract Data Bounds Box</span>
                  </div> */}

                  {layers.length === 0 && (
                    <div className="archivalmappolygontip">
                      <span className="tooltipTextPolygone">
                        We Can See Extract Data Bounds Box
                      </span>
                    </div>
                  )}

                  {isArchivalLayerBoxVisible && (
                    <div className="ArchivalLayerMainBox">
                      {/* <div className="layercontrolarchivaluparrow"></div> */}
                      <div className="ArchivalLayer-control">
                        {/* <span>We Can See Extract Data Bounds Box</span> */}

                        {layers.map((layer) => (
                          <div key={layer.id} className="ArchivalLayer-item">
                            <label>
                              <input
                                type="checkbox"
                                checked={layerVisibility[layer.name]}
                                onChange={() =>
                                  handleCheckboxChange(layer.name)
                                }
                              />
                              {layer.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div id="coordinate">Lat:21.18 Lng:79.05</div>
                <div className="leaflet-top leaflet-left OurToolArchival">
                  <div className="leaflet-pm-toolbar leaflet-pm-fullextent leaflet-bar leaflet-control">
                  <Tooltip title="Selected ZoomIn" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        > 
                          <div
                      className="button-container pos-right"
                      id="recZoomIN"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="Selected ZoomIn"
                      onClick={toggleRectangleDrawingZoomIn}
                    >
                      <a
                        className={`leaflet-buttons-control-button ${drawingRectangleZoomIn ? "active-btn" : ""
                          }`}
                      >
                        <div className="control-icon leaflet-pm-icon-SelectedZoomIn"></div>
                      </a>
                    </div>
                        </Tooltip>
                        <Tooltip title="Selected ZoomOut" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5}  
                        > <div
                        className="button-container pos-right"
                        // data-bs-toggle="tooltip"
                        // data-bs-placement="right"
                        // title="Selected ZoomOut"
                        onClick={toggleRectangleDrawingZoomOut}
                      >
                        <a
                          className={`leaflet-buttons-control-button ${drawingRectangleZoomOut ? "active-btn" : ""
                            }`}
                        >
                          <div className="control-icon leaflet-pm-icon-SelectedZoomOut"></div>
                        </a>
                      </div> </Tooltip>
                     <Tooltip title="Pan" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} >
                     <div
                      className="button-container pos-right"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="Pan"
                      onClick={handlePanToggle}
                    >
                      <a
                        className={`leaflet-buttons-control-button ${isPanningEnabled ? "active-btn" : ""
                          }`}
                      >
                        <div className="control-icon leaflet-pm-icon-MapPan"></div>
                      </a>
                      {/* Cancel Pan Button - Show only when panning is enabled */}
                      {/* {isPanningEnabled && (
                        <div className="leaflet-pm-actions-container pos-right" onClick={handleCancelPan}>
                          <a className="leaflet-pm-action pos-right action-cancel" role="button" tabIndex="0" href="#">
                            Cancel
                          </a>
                        </div>
                      )} */}
                    </div>
                     </Tooltip>
                     <Tooltip title="Fixed ZoomIn" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} >  <div
                         className="button-container  pos-right"
                        //  data-bs-toggle="tooltip"
                        //  data-bs-placement="right"
                        //  title="Fixed ZoomIn"
                         onClick={handleFixedZoomIn}
                       >
                         <a className="leaflet-buttons-control-button">
                           <div className="control-icon leaflet-pm-icon-FixedZoomIn"></div>
                         </a>
                       </div>
                         </Tooltip>
                         <Tooltip title="Fixed ZoomOut" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} >
                            <div
                      className="button-container  pos-right"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="Fixed ZoomOut"
                      onClick={handleFixedZoomOut}
                    >
                      <a className="leaflet-buttons-control-button">
                        <div className="control-icon leaflet-pm-icon-FixedZoomOut"></div>
                      </a>
                    </div>
                         </Tooltip>
                         <Tooltip title="GoToPreviousExtent" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} >
                               <div
                      className="button-container  pos-right"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="GoToPreviousExtent"
                      onClick={handlePreviousExtent}
                    >
                      <a className="leaflet-buttons-control-button">
                        <div className="control-icon leaflet-pm-icon-GoToPreviousExtent"></div>
                      </a>
                    </div>
                         </Tooltip>
                         <Tooltip title="GoToNextExtent" placement="right" >
                         <div
                      className="button-container  pos-right"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="GoToNextExtent"
                      onClick={handleNextExtent}
                    >
                      <a className="leaflet-buttons-control-button">
                        <div className="control-icon leaflet-pm-icon-GoToNextExtent"></div>
                      </a>
                    </div>
                         </Tooltip>
                   
                         <Tooltip title="ZoomSelected" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} > <div
                         className="button-container  pos-right"
                        //  data-bs-toggle="tooltip"
                        //  data-bs-placement="right"
                        //  title="ZoomSelected"
                         onClick={zoomToLayerSelected}
                       >
                         <a className="leaflet-buttons-control-button">
                           <div className="control-icon leaflet-pm-icon-ZoomSelected"></div>
                         </a>
                       </div></Tooltip>
                       <Tooltip title="Full Extent" placement="right"
                //  overlayStyle={{ position: "relative", top: "-196px" }}
                         mouseEnterDelay={1} 
                         mouseLeaveDelay={0.5} >
                            <div
                      className="button-container  pos-right"
                      // data-bs-toggle="tooltip"
                      // data-bs-placement="right"
                      // title="Full Extent"
                      onClick={handleFullExtent}
                    >
                      <a className="leaflet-buttons-control-button">
                        <div className="control-icon leaflet-pm-icon-fullextent"></div>
                      </a>
                    </div>
                         </Tooltip>
                  
                  </div>
                </div>
              </div>
              {/* )} */}
            </div>
            {/* </fieldset> */}
          </div>

          {/************************** Table Code below ********************************/}

          <div className="Mars-main-table">
            {/* MARS Main Table Data */}
            <div
              className={`miantablebox ${table1Visible ? "" : "hidden"}`}
              id="table1"
            >
              {/* <fieldset className="Heading-t1-fieldset"> */}
              {/* <legend className="Heading-t1-legend mx-2">MARS-Archival Main Table Data</legend> */}
              <div className="table1-heading">
                MARS-Archival Main Table Data
              </div>
              <div className="tablebox">
                <table className="marstable">
                  <thead>
                    <tr className="marstablerow">
                      <th className="marstableheader">Sr.No.</th>
                      <th className="marstableheader">DATANAME</th>
                      <th className="marstableheader">IMG_PREVIEW</th>
                      <th className="marstableheader">COMP_NA</th>
                      <th className="marstableheader">SATT_NA</th>
                      <th className="marstableheader">SEN_NAME</th>
                      <th className="marstableheader">CL_REF</th>
                      <th className="marstableheader">IMG_DATYPE</th>
                      <th className="marstableheader">IMG_DAPROC</th>
                      <th className="marstableheader">IMG_DATE</th>
                      <th className="marstableheader">IMG_DT_RNG</th>
                      <th className="marstableheader">D_SIZE</th>
                      <th className="marstableheader">D_CLOUD</th>
                      <th className="marstableheader">D_PRJ_TABLE</th>
                      <th className="marstableheader">D_PRJ_NAME</th>
                      <th className="marstableheader">D_ROWS</th>
                      <th className="marstableheader">D_BANDS</th>
                      <th className="marstableheader">D_GSD_AXT</th>
                      <th className="marstableheader">D_GSD_ALT</th>
                      <th className="marstableheader">D_AREA</th>
                      <th className="marstableheader">D_SNOW</th>
                      <th className="marstableheader">D_COLS</th>
                      <th className="marstableheader">D_TILES</th>
                      <th className="marstableheader">D_PIXEL_X</th>
                      <th className="marstableheader">D_PIXEL_Y</th>
                      <th className="marstableheader">D_FORMAT</th>
                      <th className="marstableheader">D_TYPE</th>
                      <th className="marstableheader">D_AQ_BITS</th>
                      <th className="marstableheader">D_PR_BITS</th>
                      <th className="marstableheader">D_SIGN</th>
                      <th className="marstableheader">D_BITS</th>
                      <th className="marstableheader">D_IN_ANGLE</th>
                      <th className="marstableheader">D_QL_NAME</th>
                      <th className="marstableheader">XML_FILE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData && processedData.length > 0 ? (
                      processedData.map((item, index) => (
                        // <tr
                        //   key={index}
                        //   className={`maintabledatarow ${
                        //     item.dSize ? "background-blue" : "background-red"
                        //   }`}
                        // >
                        <tr
                          key={index}
                          className={`maintabledatarow ${selectedIndex === index
                            ? "background-yellow"
                            : item.dSize
                              ? "background-blue"
                              : "background-red"
                            }`}
                          onClick={() => handleRowClick(index)} // Update selected row on click
                        >
                          <td className="maintabledata_data maintabledata_data-srno">
                            {index + 1}
                          </td>
                          <td className="maintabledata_data ">{item.dname}</td>
                          <td className="maintabledata_data">
                            <ImageModal image={item.image_data_xml} />
                          </td>
                          <td className="maintabledata_data">{item.cname}</td>
                          <td className="maintabledata_data">{item.sname}</td>
                          <td className="maintabledata_data">{item.senName}</td>
                          <td className="maintabledata_data">{item.clRef}</td>
                          <td className="maintabledata_data">
                            {item.imgDataType}
                          </td>
                          <td className="maintabledata_data">
                            {item.imgDataProcSpec}
                          </td>
                          <td className="maintabledata_data">{item.imgDate}</td>
                          <td className="maintabledata_data">
                            {item.img_dt_rng}
                          </td>
                          <td className="maintabledata_data">{item.dSize}</td>
                          <td className="maintabledata_data">{item.dCloud}</td>
                          <td className="maintabledata_data">
                            {item.dPRJTable}
                          </td>
                          <td className="maintabledata_data">
                            {item.dPRJName}
                          </td>
                          <td className="maintabledata_data">{item.dRows}</td>
                          <td className="maintabledata_data">{item.dBands}</td>
                          <td className="maintabledata_data">{item.dGSDAxt}</td>
                          <td className="maintabledata_data">{item.dGSDAlt}</td>
                          <td className="maintabledata_data">{item.dArea}</td>
                          <td className="maintabledata_data">{item.dSnow}</td>
                          <td className="maintabledata_data">{item.dCols}</td>
                          <td className="maintabledata_data">{item.dTiles}</td>
                          <td className="maintabledata_data">{item.dPixelX}</td>
                          <td className="maintabledata_data">{item.dPixelY}</td>
                          <td className="maintabledata_data">{item.dFormat}</td>
                          <td className="maintabledata_data">{item.dType}</td>
                          <td className="maintabledata_data">{item.dAQBits}</td>
                          <td className="maintabledata_data">{item.dPRBits}</td>
                          <td className="maintabledata_data">{item.dSign}</td>
                          <td className="maintabledata_data">{item.dBits}</td>
                          <td className="maintabledata_data">
                            {item.dINAngle}
                          </td>
                          <td className="maintabledata_data">{item.dQLname}</td>
                          <td className="maintabledata_data">{item.xmlFile}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="maintabledatarow background-red">
                        <td
                          colSpan="46"
                          className="maintabledata_data nodata-table-heading"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* </fieldset> */}
            </div>

            {/* MARS Bands Information */}
            <div
              className={`miantablebox ${table2Visible ? "" : "hidden"}`}
              id="table2"
            >
              {/* <fieldset className="Heading-t1-fieldset"> */}
              {/* <legend className="Heading-t1-legend mx-2">MARS-Archival Bands Information Data</legend> */}
              <div className="table-heading2">
                MARS-Archival Bands Information Data
              </div>
              <div className="tablebox">
                <table
                  id="bandsTable"
                  style={{ width: "40%", maxWidth: "100%" }}
                  className="maintabledata"
                >
                  <thead>
                    <tr className="maintabledatarow">
                      <th className="maintabledataheading maintabledataheading-srno  ">
                        Sr.No.
                      </th>
                      <th className="maintabledataheading ">BANDS SR NO</th>{" "}
                      {/* New Column Header */}
                      <th className="maintabledataheading">BANDS NAME</th>
                      <th className="maintabledataheading">SPEC MIN LIST</th>
                      <th className="maintabledataheading">SPEC MAX LIST</th>
                      <th className="maintabledataheading">MEASURE UNIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.length > 0 ? (
                      processedData?.map((dataObject, dataIndex) => {
                        const bands = dataObject.bands || [];
                        let bandStartIndex = 1; // Start numbering for each dataObject

                        return bands.length > 0 ? (
                          bands?.map((band, bandIndex) => {
                            const isRedBackground =
                              !band.Band_ID ||
                              !band.MIN ||
                              !band.MAX ||
                              !band.MEASURE_UNIT;
                            const bandSerialNumber = bandStartIndex + bandIndex;
                            const isSelectedFile = selectedIndex === dataIndex;

                            return (
                              <tr
                                key={`${dataIndex}-${bandIndex}`}
                                className={`maintabledatarow ${isSelectedFile
                                  ? "background-yellow"
                                  : isRedBackground
                                    ? "background-red"
                                    : "background-blue"
                                  }`}
                              >
                                <td className="maintabledata_data maintabledata_data-srno ">
                                  {globalSequenceNumber++}
                                </td>{" "}
                                {/* Global Sr.No. */}
                                <td className="maintabledata_data maintabledata_data-srno">
                                  {bandSerialNumber}
                                </td>{" "}
                                {/* Bands SR NO column */}
                                <td className="maintabledata_data">
                                  {band.Band_ID || "Data not available"}
                                </td>
                                <td className="maintabledata_data maintabledata_data-srno">
                                  {band.MIN || "Data not available"}
                                </td>
                                <td className="maintabledata_data maintabledata_data-srno">
                                  {band.MAX || "Data not available"}
                                </td>
                                <td className="maintabledata_data">
                                  {band.MEASURE_UNIT || "Data not available"}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr
                            key={dataIndex}
                            className="maintabledatarow background-red"
                          >
                            <td
                              colSpan="6"
                              className="maintabledata_data nodata-table-heading"
                            >
                              No data available for object
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="maintabledatarow background-red">
                        <td
                          colSpan="6"
                          className="maintabledata_data nodata-table-heading"
                        >
                          No data available for object
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* </fieldset> */}
            </div>
            {/* MARS Bounds Information */}

            <div
              className={`miantablebox ${table3Visible ? "" : "hidden"}`}
              id="table3"
            >
              {/* <fieldset className="Heading-t1-fieldset"> */}
              {/* <legend className="Heading-t1-legend mx-2">MARS-Archival Bounds Information Data</legend> */}
              <div className="table-heading3">
                MARS-Archival Bounds Information Data
              </div>
              <div className="tablebox">
                <table
                  id="boundsTable"
                  style={{ width: "15%", maxWidth: "70%" }}
                  className="maintabledata"
                >
                  <thead>
                    <tr className="maintabledatarow">
                      <th className="maintabledataheading maintabledataheading-srno">
                        Sr.No.
                      </th>
                      <th className="maintabledataheading">COOD XX</th>
                      <th className="maintabledataheading">COOD YY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCoordinates.length > 0 ? (
                      allCoordinates.map((coord, index) => {
                        // Determine the background color based on the presence of coord.x and coord.y
                        // const backgroundColorClass =
                        //   !coord.x || !coord.y
                        //     ? "background-red"
                        //     : "background-blue";
                        let totalCoordinates = 0;

                        // Loop through processedData to calculate fileIndex dynamically
                        const fileIndex = processedData.findIndex(
                          (fileData) => {
                            const coordsInFile = fileData.Vertex_LON_LAT
                              ? Object.keys(fileData.Vertex_LON_LAT).length / 2 // Each file has X and Y pairs, so divide by 2
                              : 0;
                            totalCoordinates += coordsInFile;
                            return totalCoordinates > index; // This tells us if the current row belongs to the file
                          }
                        );

                        // Determine if the current row corresponds to the selected file
                        const isSelectedFile = fileIndex === selectedIndex;

                        // Determine if there is missing data (either x or y is missing)
                        const isRedBackground = !coord.x || !coord.y;

                        // Determine the background color class based on the conditions
                        const backgroundColorClass = isSelectedFile
                          ? "background-yellow"
                          : isRedBackground
                            ? "background-red"
                            : "background-blue";

                        return (
                          <tr
                            key={index}
                            className={`maintabledatarow ${backgroundColorClass}`}
                          >
                            <td className="maintabledata_data maintabledata_data-srno">
                              {index + 1}
                            </td>
                            <td className="maintabledata_data maintabledata_data-srno">
                              {coord.x || "Data not available"}
                            </td>
                            <td className="maintabledata_data maintabledata_data-srno">
                              {coord.y || "Data not available"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="maintabledatarow background-red">
                        <td
                          colSpan="3"
                          className="maintabledata_data nodata-table-heading"
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* </fieldset> */}
            </div>
          </div>
          {/* table code portion */}
        </div>
        <div id="imageContainer"></div>
      </div>
    </div>
  );
};

export default Archival;
