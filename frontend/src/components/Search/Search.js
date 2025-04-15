import React, { useState, useEffect, useRef } from "react";
import "./Search.css";
import axios from "axios";
import Swal from "sweetalert2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloud,
  faSnowflake,
  faChevronDown,
  faCircle,
  faChevronUp,
  faWindowRestore,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import shp from "shpjs";
import toGeoJSON from "togeojson";
import JSZip from "jszip";
import PDFGenerator from "./Pdf/PDFGenerator.js";
import DownloadSearchReportModal from "./SearchReportGenerator/DownloadSearchReportModal.js";
import html2canvas from "html2canvas";
import * as turf from "@turf/turf"; // Import Turf.js library
import { buffer, point, featureCollection } from "@turf/turf"; // Import turf functions
import { bbox, bboxPolygon } from "@turf/turf";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"; // Import Font Awesome icons
import { Card, Collapse } from "react-bootstrap"; // Import Bootstrap components
import domtoimage from "dom-to-image-more";
import ModalManager from "../GeopicxPopupModals/ModalManager.js";
import ImageModal from "../Archival/ImageModal/ImageModal.js";
import Preloader from "../Preloader/Preloader.js";
import * as shapefile from "shapefile";
import ZoomInIcon from "../../asset/SVG_ICONS_128/NAZoom_In128.svg";
import ZoomOutIcon from "../../asset/SVG_ICONS_128/NAZoom_Out128.svg";
import { saveAs } from "file-saver";
import shpwrite from "@mapbox/shp-write";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, format } from "date-fns";

import GNCalendar from "../../asset/GNCalander_128.png";

const geojsonToKml = (geojson) => {
  let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
  kml += "<Document>\n";

  geojson.features.forEach((feature) => {
    const geometry = feature.geometry;
    console.log("geometry ", geometry);
    const properties = feature.properties;

    kml += "  <Placemark>\n";
    kml += `    <name>${properties.name || "No Name"}</name>\n`;

    if (geometry.type === "Point") {
      kml += "    <Point>\n";
      kml += `      <coordinates>${geometry.coordinates[0]},${geometry.coordinates[1]}</coordinates>\n`;
      kml += "    </Point>\n";
    } else if (geometry.type === "LineString") {
      kml += "    <LineString>\n";
      kml += "      <coordinates>\n";
      geometry.coordinates.forEach((coord) => {
        kml += `        ${coord[0]},${coord[1]}\n`;
      });
      kml += "      </coordinates>\n";
      kml += "    </LineString>\n";
    } else if (geometry.type === "Polygon") {
      kml += "    <Polygon>\n";
      kml += "      <outerBoundaryIs>\n";
      kml += "        <LinearRing>\n";
      kml += "          <coordinates>\n";
      geometry.coordinates[0].forEach((coord) => {
        kml += `            ${coord[0]},${coord[1]}\n`;
      });
      kml += "          </coordinates>\n";
      kml += "        </LinearRing>\n";
      kml += "      </outerBoundaryIs>\n";
      kml += "    </Polygon>\n";
    } else {
      console.warn(`Unsupported geometry type: ${geometry.type}`);
    }

    kml += "  </Placemark>\n";
  });

  kml += "</Document>\n";
  kml += "</kml>\n";

  return kml;
};

const subjectObject = {
  AIRBUS: {
    OPTICAL: ["PHR", "PNEO", "SPOT"],
    // SAR: ["TanSAR", "TerraSARX", "TanDEMX", "TanDEMPAZ"],
    SAR: [],
    // ELEVATION: [
    //   "WorldDEMDTM",
    //   "WorldDEMDSM",
    //   "WorldDEMNEODTM",
    //   "WorldDEMNEODSM",
    // ],
    ELEVATION: [],
  },
  SENTINEL: {
    // SENTINEL1: ["SENTINEL-1A", "SENTINEL-1B"],
    // SENTINEL2: ["MSI-l1C", "MSI-l1A"],
  },
  PLANET: {
    // PHP: ["Variables", "Strings", "Arrays"],
    // SQL: ["SELECT", "UPDATE", "DELETE"],
  },
};

let layerAdded = false; // Flag to track whether the layer has been added
let layerXyPoint = false;

const Search = () => {
  const navigate = useNavigate();
  // mapRef is used for map
  const mapRef = useRef(null);
  const exportButtonRef = useRef(null);
  // file upload state
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // update box as per button click
  const [selectAoi, setSelectAoi] = useState(false);
  const [xyLocation, setXyLocation] = useState(false);
  const [boundsState, setBoundsState] = useState(false);
  const [selectLocation, setLocation] = useState(false);
  const [COMP_NA, setCOMP_NA] = useState("");
  const [topic, setTopic] = useState("");
  const [SEN_NAME, setSEN_NAME] = useState("");
  const [DCLOUD, setDCLOUD] = useState(100);
  const [DSNOW, setDSNOW] = useState(100);
  const [isCheckboxCheckedCloud, setIsCheckboxCheckedCloud] = useState(false);
  const [isCheckboxCheckedSnow, setIsCheckboxCheckedSnow] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [showSearchTable, setShowSearchTable] = useState(true);
  const [isFieldsEnabled, setFieldsEnabled] = useState(false);
  // Bounds/bbox State
  const [upperRightX, setUpperRightX] = useState("74.89401352859657");
  const [upperRightY, setUpperRightY] = useState("34.16203132176326");
  const [lowerLeftX, setLowerLeftX] = useState("74.80241003127438");
  const [lowerLeftY, setLowerLeftY] = useState("34.0655077862292");
  // XY Location State
  const [xLocation, setXLocation] = useState("74.80218571763653");
  const [yLocation, setYLocation] = useState("34.16191768185");
  const [locationError, setLocationError] = useState({
    xLocation: "",
    yLocation: "",
  });
  const [dataFromChild, setDataFromChild] = useState(null);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [polygonCounter, setPolygonCounter] = useState(0);
  const [clickedRow, setClickedRow] = useState(null);
  const [shapefileGeometries, setShapefileGeometries] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isselected, setIsselected] = useState(false);
  const [clickedFile, setClickedFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(null);
  const [newpopupVisible, setNewPopupVisible] = useState(false);
  const polygonGroupRef = useRef([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  //checkbox Report
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportReport, setExportReport] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [collapseVisible, setCollapseVisible] = useState(true);
  const [collapseVisible1, setCollapseVisible1] = useState(false);
  const [collapseVisible2, setCollapseVisible2] = useState(false);
  const [collapseVisible3, setCollapseVisible3] = useState(false);
  const [selectedDataCode, setDataCode] = useState([]);
  const [missionToggle, setMissionToggle] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State to manage dropdown visibility
  const [unSelectedRow, setUnSelectedRow] = useState("");
  const [DownloadReportloading, setDownloadReportloading] = useState(false);
  const AcquisitionModeList = ["MONO", "STEREO", "TRI-STEREO"];
  const AcquisitionModeListselectRef = useRef(null);
  // State to keep track of which rows' layers are visible
  const [layerVisibility, setLayerVisibility] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [Noneaoi, setIsNoneActive] = useState(true);
  const [highlightedRowIndex, setHighlightedRow] = useState(null);

  const [isBufferEnabledDraw, setIsBufferEnabledDraw] = useState(true);
  const [selectedShapeDraw, setSelectedShapeDraw] = useState("CIRCLE"); // Default to 'CIRCLE'

  const [extents, setExtents] = useState([]); // Array to hold the extents
  const [currentExtentIndex, setCurrentExtentIndex] = useState(-1); // Index to track current extent
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [getkey, setGetKey] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [currentLayer, setCurrentLayer] = useState(null); // State to manage current layer

  const fileInputRef = useRef(null);

  const handleBufferCheckboxChangeDraw = (event) => {
    setIsBufferEnabledDraw(event.target.checked);
  };

  const handleShapeSelectionDraw = (shape) => {
    setSelectedShapeDraw(shape);
  };

  const createBoxBufferDraw = (pointFeature, distance, unit) => {
    console.log(pointFeature);
    // Calculate the bounding box (bbox) around the point with the given distance and unit
    const pointBbox = bbox(buffer(pointFeature, distance, { units: unit }));

    // Create a polygon from the bounding box
    const boxPolygon = bboxPolygon(pointBbox);

    return boxPolygon;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDate = getCurrentDate();

  const handleNoneClick = (e) => {
    e.preventDefault();
    setLocation(false);
    setSelectAoi(false);
    setXyLocation(false);
    setBoundsState(false);
    setIsNoneActive(true);
    // XY Lopcation Layres Remove
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }

    // if (tileLayer.current) {
    //   mapRef.current.removeLayer(tileLayer.current);
    //   tileLayer.current = null;
    // }
    // polygonGroupRef.current.forEach((polygon) => {
    //   mapRef.current.removeLayer(polygon);
    // });
  };

  const LoaderUpdateProgress = async () => {
    setLoading(true);
    setProgress(0);
    const steps = 10; // Define the number of steps
    const stepDuration = 500; // Define the duration for each step (in milliseconds)

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      const progressPercentage = (i / steps) * 100;
      setProgress(progressPercentage);
    }
  };

  // Function to handle file selection
  const handleFileSelect = (file, index) => {
    setSelectedFiles(file.name);
    setShowDropdown(false); // Hide dropdown when file is selected
    // Implement your logic for handling the selected file
    MapBounds(file.name, index);
  };

  const handleCollapseToggle = (key) => {
    if (key === "collapse") {
      setCollapseVisible(!collapseVisible);
    } else if (key === "collapse1") {
      setCollapseVisible1(!collapseVisible1);
    } else if (key === "collapse2") {
      setCollapseVisible2(!collapseVisible2);
    } else if (key === "collapse3") {
      setCollapseVisible3(!collapseVisible3);
    }
  };

  let fileLayerMap = {};
  // let latestDrawnLayer = null;
  const geometries = [];
  // let tileLayer;
  const tileLayer = useRef(null);
  let shapefileLayers = []; // Array to hold the GeoJSON layers
  let markerRef = null;
  let polygonRef = null;

  const [formData, setFormData] = useState({
    COMP_NA: "",
    topic: "",
    SEN_NAME: "",
    startDate: "",
    endDate: "",
    D_PIXELX_MIN: "0",
    D_PIXELX_MAX: "999",
    DCLOUD: "100",
    DSNOW: "100",
    IMG_DATYPE: [],
    D_IN_ANGL_MIN: "0",
    D_IN_ANGL_MAX: "90",
    aoigeometry: "",
    SAT_NO: "",
  });

  //________________  State Update by Akshay ______________________________

  useEffect(() => {
    if (uploadedData && getkey) {
      // Set the values from uploadedData to formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        COMP_NA: uploadedData.COMP_NA || "", // Set COMP_NA from uploadedData
        topic: uploadedData.topic || "", // Set topic from uploadedData
        SEN_NAME: uploadedData.SEN_NAME || "", // Set SEN_NAME from uploadedData
        SAT_NO: uploadedData.SAT_NO || "",
        startDate: uploadedData.startDate || "",
        endDate: uploadedData.endDate || "",
        D_PIXELX_MIN: uploadedData.D_PIXELX_MIN || "0",
        D_PIXELX_MAX: uploadedData.D_PIXELX_MAX || "999",
        DCLOUD: uploadedData.DCLOUD || "100",
        DSNOW: uploadedData.DSNOW || "100",
        IMG_DATYPE: uploadedData.IMG_DATYPE || [],
        D_IN_ANGL_MIN: uploadedData.D_IN_ANGL_MIN || "0",
        D_IN_ANGL_MAX: uploadedData.D_IN_ANGL_MAX || "90",
        aoigeometry: uploadedData.aoigeometry || "",
      }));
      const aoigeometry = uploadedData.aoigeometry;

      handleResponseMapClickAoik(aoigeometry);
      // Reset getkey to false after setting the data
    }
  }, [uploadedData, getkey]);

  // Separate useEffect to log or check formData after it updates
  useEffect(() => {
    console.log("Updated formData:", formData); // This will log after formData is updated
  }, [formData]); // Dependency on formData to trigger after update

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   let newStartDate = formData.startDate;
  //   let newEndDate = formData.endDate;

  //   if (name === 'startDate') {
  //     newStartDate = value;
  //     if (newEndDate && newEndDate < value) {
  //       newEndDate = value;
  //     }
  //   } else if (name === 'endDate') {
  //     newEndDate = value;
  //     if (newStartDate && newStartDate > value) {
  //       newStartDate = value;
  //     }
  //   }

  //   if (name === 'D_PIXELX_MAX' && value.length > 3) {
  //     return;
  //   }

  //   if (name === 'D_IN_ANGL_MAX' && value.length > 3) {
  //     return;
  //   }

  //   if (name === 'D_IN_ANGL_MIN' && value.length > 3) {
  //     return;
  //   }

  //   if (name === 'D_PIXELX_MIN' && value.length > 3) {
  //     return;
  //   }

  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //     startDate: newStartDate,
  //     endDate: newEndDate
  //   });
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newFormData = { ...formData, [name]: value };

    if (name === "startDate") {
      if (newFormData.endDate && newFormData.endDate < value) {
        newFormData.endDate = value;
      }
    } else if (name === "endDate") {
      if (newFormData.startDate && newFormData.startDate > value) {
        newFormData.startDate = value;
      }
    }

    // Ensure values do not exceed 3 characters
    const limitThreeChars = [
      "D_PIXELX_MAX",
      "D_IN_ANGL_MAX",
      "D_IN_ANGL_MIN",
      "D_PIXELX_MIN",
    ];
    if (limitThreeChars.includes(name) && value.length > 5) {
      return;
    }

    // Ensure min and max angle constraints
    if (
      name === "D_IN_ANGL_MIN" &&
      newFormData.D_IN_ANGL_MAX !== "" &&
      parseFloat(value) > parseFloat(newFormData.D_IN_ANGL_MAX)
    ) {
      newFormData.D_IN_ANGL_MAX = value;
    }

    if (
      name === "D_IN_ANGL_MAX" &&
      newFormData.D_IN_ANGL_MIN !== "" &&
      parseFloat(value) < parseFloat(newFormData.D_IN_ANGL_MIN)
    ) {
      newFormData.D_IN_ANGL_MIN = value;
    }

    // Ensure min and max pixel constraints
    if (
      name === "D_PIXELX_MIN" &&
      newFormData.D_PIXELX_MAX !== "" &&
      parseFloat(value) > parseFloat(newFormData.D_PIXELX_MAX)
    ) {
      newFormData.D_PIXELX_MAX = value;
    }

    if (
      name === "D_PIXELX_MAX" &&
      newFormData.D_PIXELX_MIN !== "" &&
      parseFloat(value) < parseFloat(newFormData.D_PIXELX_MIN)
    ) {
      newFormData.D_PIXELX_MIN = value;
    }

    setFormData(newFormData);
  };

  // let polygonCounter = 1; // Ensure polygonCounter is declared outside useEffect
  // Initialize a counter to keep track of the number of polygons created
  const toggleAutocomplete = () => {
    setAutocompleteVisible(!autocompleteVisible);
  };

  // Define the custom icon
  const locationIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const blackIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -20],
  });

  const LocationIconChange = () => {
    uploadedFiles.forEach((file) => {
      shapefileLayerRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.setIcon(blackIcon);
        }
      });
    });
  };

  const handelDrawOnMap = () => {
    // setLocation((prevState) => !prevState); // Toggle the selectLocation state
    setLocation(true);
    setSelectAoi(false);
    setXyLocation(false);
    setBoundsState(false);
    setIsNoneActive(false);
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }
  };

  const [hasDrawnShape, setHasDrawnShape] = useState(false);

  // useEffect(() => {
  //   if (mapRef.current) {
  //     setTimeout(() => {
  //       const geoman = mapRef.current.pm;

  //       // Remove existing event listener for 'pm:create' before adding a new one
  //       mapRef.current.off('pm:create');

  //       if (geoman) {
  //         if (selectLocation) {
  //           // Add Geoman controls when selectLocation is active
  //           geoman.addControls({
  //             position: 'topright', // Position the controls at the top-right
  //             drawCircle: false,
  //             drawCircleMarker: false,
  //             drawRectangle: true,
  //             drawMarker: true,
  //             drawPolyline: true,
  //             drawPolygon: true,
  //             drawLine: true,
  //             dragMode: false,
  //             rotateMode: false,
  //             cutPolygon: false,
  //             removalMode: true,
  //             drawText: false
  //           });

  //           // Handle drawing creation
  //           mapRef.current.on('pm:create', (e) => {
  //             const drawnLayer = e.layer;
  //             let hasSelfIntersection = false;

  //             const drawingValues = {
  //               type: drawnLayer.pm.options.layerType,
  //               geometry: drawnLayer.toGeoJSON().geometry,
  //             };

  //             if (shapefileLayerRef.current && shapefileLayerRef.current.getLayers().length > 0) {
  //               ModalManager.confirm({
  //                 modalHeaderHeading: 'Search',
  //                 modalBodyHeading: "Layer already exists!",
  //                 message: "Would you like to remove the previous layer and continue?",
  //                 logo: "MARS_LOGO.png",
  //                 confirmButtonText: "OK, Remove Layer",
  //               })
  //                 .then(async (result) => {
  //                   if (result.isConfirmed) {
  //                     if (circleLayerForDrawRef.current) {
  //                       mapRef.current.removeLayer(circleLayerForDrawRef.current);
  //                       circleLayerForDrawRef.current = null;
  //                     }
  //                     shapefileLayerRef.current.clearLayers();
  //                     addDrawnLayer(drawnLayer, drawingValues);
  //                   } else {
  //                     drawnLayer.remove();
  //                   }
  //                 });
  //             } else {
  //               addDrawnLayer(drawnLayer, drawingValues);
  //             }
  //           });
  //         } else {
  //           geoman.removeControls();
  //         }
  //       }
  //     }, 100);
  //   }
  // }, [selectLocation, mapRef, uploadedFiles, formData]);

  useEffect(() => {
    if (!mapRef.current) return;

    const geoman = mapRef.current.pm;

    if (!geoman) return;

    // Remove existing event listener for 'pm:create' before adding a new one
    mapRef.current.off("pm:create");

    if (selectLocation) {
      // Add Geoman controls when selectLocation is active
      geoman.addControls({
        position: "topright", // Position the controls at the top-right
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: true,
        drawMarker: true,
        drawPolyline: true,
        drawPolygon: true,
        drawLine: true,
        dragMode: false,
        rotateMode: false,
        cutPolygon: false,
        removalMode: false,
        drawText: false,
      });

      // Define the event handler
      const handlePmCreate = (e) => {
        const drawnLayer = e.layer;
        const drawingValues = {
          type: drawnLayer.pm.options.layerType,
          geometry: drawnLayer.toGeoJSON().geometry,
        };

        if (
          shapefileLayerRef.current &&
          shapefileLayerRef.current.getLayers().length > 0
        ) {
          ModalManager.confirm({
            modalHeaderHeading: "Search",
            modalBodyHeading: "Layer already exists!",
            message:
              "Would you like to remove the previous layer and continue?",
            logo: "MARS_LOGO.png",
            confirmButtonText: "OK, Remove Layer",
          }).then(async (result) => {
            if (result.isConfirmed) {
              // Remove existing buffer layer if any
              if (circleLayerForDrawRef.current) {
                mapRef.current.removeLayer(circleLayerForDrawRef.current);
                circleLayerForDrawRef.current = null;
              }
              // Clear existing shapefile layers
              shapefileLayerRef.current.clearLayers();
              // Add the new drawn layer
              addDrawnLayer(drawnLayer, drawingValues);
            } else {
              // Remove the drawn layer if the user cancels
              drawnLayer.remove();
            }
          });
        } else {
          addDrawnLayer(drawnLayer, drawingValues);
        }
      };

      // Attach the event handler
      mapRef.current.on("pm:create", handlePmCreate);

      // Cleanup function to remove the event listener when dependencies change
      return () => {
        mapRef.current.off("pm:create", handlePmCreate);
      };
    } else {
      geoman.removeControls();
    }

    // Cleanup function to remove 'pm:create' listener when the component unmounts or dependencies change
    return () => {
      mapRef.current.off("pm:create");
    };
  }, [
    selectLocation,
    isBufferEnabledDraw,
    selectedShapeDraw,
    mapRef,
    uploadedFiles,
    formData,
  ]);

  const polygonLayerRef = useRef(null);
  const lineLayerRef = useRef(null);
  const pointLayerRef = useRef(null);
  const texttoolstipRef = useRef(null);
  const circleLayerForDrawRef = useRef(null);

  const [latestDrawnLayer, setLatestDrawnLayer] = useState(null);

  // const addDrawnLayer = (drawnLayer, drawingValues) => {
  //   let hasSelfIntersection = false;

  //   if (drawingValues.geometry.type === 'Polygon' || drawingValues.geometry.type === 'LineString') {
  //     drawnLayer.pm.enable({
  //       allowSelfIntersection: false,
  //       preventSelfIntersection: true,
  //     });

  //     hasSelfIntersection = drawnLayer.pm.hasSelfIntersection();
  //   }

  //   if (!hasSelfIntersection) {
  //     drawnLayer.pm.disable({
  //       allowSelfIntersection: false,
  //       preventSelfIntersection: true,
  //     });

  //     const bufferDistanceInput = parseFloat(document.getElementById('bufferDistancedraw').value);
  //     const bufferUnit = document.getElementById('bufferUnitdraw').value;

  //     let boundsWithPadding;

  //     // Buffer the geometries and add them to the map if the buffer is enabled
  //     if (isBufferEnabledDraw) {
  //       const geometryType = drawingValues.geometry.type;
  //       if (geometryType === 'Point' || geometryType === 'LineString') {
  //         let bufferedGeoJson;

  //         if (geometryType === 'LineString' && selectedShapeDraw === 'CIRCLE') {
  //           // Handle buffer for LineString with circle shape
  //           bufferedGeoJson = buffer(drawingValues.geometry, bufferDistanceInput, { units: bufferUnit });

  //         } else if (geometryType === 'Point') {
  //           if (selectedShapeDraw === 'circle') {
  //             // Handle buffer for Point with circle shape
  //             bufferedGeoJson = buffer(drawingValues.geometry, bufferDistanceInput, { units: bufferUnit });

  //           } else if (selectedShapeDraw === 'BOX') {
  //             // Handle buffer for Point with box shape
  //             const pointBbox = bbox(buffer(drawingValues.geometry, bufferDistanceInput, { units: bufferUnit }));
  //             bufferedGeoJson = bboxPolygon(pointBbox);

  //           } else {
  //             // Default buffer logic for Point
  //             bufferedGeoJson = buffer(drawingValues.geometry, bufferDistanceInput, { units: bufferUnit });
  //           }
  //         }

  //         if (bufferedGeoJson) {
  //           const bufferedLayer = L.geoJSON(bufferedGeoJson, {
  //             style: {
  //               color: selectedShapeDraw === 'circle' ? 'green' : selectedShapeDraw === 'box' ? 'red' : 'blue',
  //               weight: 1,
  //               opacity: 0.5,
  //             },
  //           }).addTo(mapRef.current);

  //           circleLayerForDrawRef.current = bufferedLayer;

  //           // Convert the buffer layer to GeoJSON
  //           const geoJSON = circleLayerForDrawRef.current ? circleLayerForDrawRef.current.toGeoJSON() : null;

  //           console.log(geoJSON.features[0].geometry);
  //           extractCoordinates(geoJSON.features[0].geometry);
  //           mapRef.current.fitBounds(bufferedLayer.getBounds());
  //         }
  //       }

  //     }

  //     if (!isBufferEnabledDraw) {
  //       extractCoordinates(drawingValues.geometry);
  //     }

  // if (drawingValues.geometry.type === 'Polygon') {
  //   const area = turf.area(drawingValues.geometry) / 1000000;
  //   const customName = `AOI ${polygonCounter + 1}`;
  //   const polygonTooltipContent = `
  //     <div style="font-size: 12px;">
  //       <span>${customName}</span>
  //       <br/>
  //       Area: ${area.toFixed(2)} km²
  //     </div>`;
  //   drawnLayer.bindTooltip(polygonTooltipContent, { permanent: true, className: 'custom-tooltip' }).openTooltip();
  //   LocationIconChange();
  //   drawnLayer.setStyle({
  //     color: '#ff00ff',
  //     weight: 2,
  //     fillOpacity: 0,
  //   });
  //   boundsWithPadding = drawnLayer.getBounds().pad(0.1);

  //   // polygonLayerRef.current = drawnLayer;
  // } else if (drawingValues.geometry.type === 'LineString' || drawingValues.geometry.type === 'Point') {
  //   if (drawingValues.geometry.type === 'LineString') {
  //     boundsWithPadding = drawnLayer.getBounds().pad(0.1);
  //     // lineLayerRef.current = drawnLayer;
  //   } else if (drawingValues.geometry.type === 'Point') {
  //     const latlng = drawnLayer.getLatLng();
  //     boundsWithPadding = L.latLngBounds(latlng, latlng).pad(0.5);
  //     // pointLayerRef.current = drawnLayer;
  //     uploadedFiles.forEach(file => {
  //       shapefileLayerRef.current.eachLayer(layer => {
  //         if (layer instanceof L.Marker) {
  //           layer.setIcon(blackIcon);
  //         }
  //       });
  //       drawnLayer.setIcon(locationIcon);
  //     });

  //     if (uploadedFiles.length === 0) {
  //       drawnLayer.setIcon(locationIcon);
  //     }
  //     // Disable the drawing tool after adding the point
  //     mapRef.current.pm.disableDraw('Marker');
  //   }
  // }

  // shapefileLayerRef.current = shapefileLayerRef.current || L.layerGroup().addTo(mapRef.current);
  // shapefileLayerRef.current.addLayer(drawnLayer);

  // const customName = `AOI ${polygonCounter + 1}`;
  // setUploadedFiles((prevFiles) => [...prevFiles, { name: customName, geometry: drawingValues, color: 'pink' }]);
  // setShapefileGeometries((prevGeometries) => ({
  //   ...prevGeometries,
  //   [customName]: drawingValues.geometry,
  // }));

  // if (drawingValues.geometry.type !== 'Point') {
  //   setSelectedFiles(customName);
  //   setLatestDrawnLayer(drawnLayer);
  // }

  // setPolygonCounter(prevCounter => prevCounter + 1);

  // // Add event listener for shape editing
  // drawnLayer.on('pm:edit', (e) => {
  //   console.log('Shape edited:', e);
  //   extractCoordinates(e.layer.toGeoJSON().geometry);  // Extract and update coordinates
  //   setShapefileGeometries((prevGeometries) => ({
  //     ...prevGeometries,
  //     [customName]: e.layer.toGeoJSON().geometry,
  //   }));
  // });
  //   } else {
  //     console.log("Layer has self-intersection. Cannot add to map.");
  //     drawnLayer.remove();
  //   }
  // };

  const addDrawnLayer = (drawnLayer, drawingValues) => {
    let hasSelfIntersection = false;

    // Enable self-intersection prevention for Polygons and LineStrings
    if (
      drawingValues.geometry.type === "Polygon" ||
      drawingValues.geometry.type === "LineString"
    ) {
      drawnLayer.pm.enable({
        allowSelfIntersection: false,
        preventSelfIntersection: true,
      });

      hasSelfIntersection = drawnLayer.pm.hasSelfIntersection();
    }

    if (!hasSelfIntersection) {
      // Disable self-intersection prevention after checking
      drawnLayer.pm.disable({
        allowSelfIntersection: false,
        preventSelfIntersection: true,
      });

      const bufferDistanceInput = parseFloat(
        document.getElementById("bufferDistancedraw").value
      );
      const bufferUnit = document.getElementById("bufferUnitdraw").value;
      let boundsWithPadding;

      // Normalize selectedShapeDraw to lowercase
      const normalizedShapeDraw = selectedShapeDraw.toLowerCase();

      // Remove existing buffered layer if buffering is disabled
      if (!isBufferEnabledDraw && circleLayerForDrawRef.current) {
        mapRef.current.removeLayer(circleLayerForDrawRef.current);
        circleLayerForDrawRef.current = null;
      }

      // Buffer the geometries and add them to the map if buffering is enabled
      if (isBufferEnabledDraw) {
        const geometryType = drawingValues.geometry.type;
        let bufferedGeoJson;

        if (geometryType === "LineString") {
          // Buffer logic for LineString
          if (normalizedShapeDraw === "circle") {
            bufferedGeoJson = buffer(
              drawingValues.geometry,
              bufferDistanceInput,
              { units: bufferUnit }
            );
          } else {
            extractCoordinates(drawingValues.geometry);
          }
        } else if (geometryType === "Point") {
          // Buffer logic for Point
          if (normalizedShapeDraw === "circle") {
            bufferedGeoJson = buffer(
              drawingValues.geometry,
              bufferDistanceInput,
              { units: bufferUnit }
            );
          } else if (normalizedShapeDraw === "box") {
            const pointBbox = bbox(
              buffer(drawingValues.geometry, bufferDistanceInput, {
                units: bufferUnit,
              })
            );
            bufferedGeoJson = bboxPolygon(pointBbox);
          } else {
            bufferedGeoJson = buffer(
              drawingValues.geometry,
              bufferDistanceInput,
              { units: bufferUnit }
            );
          }
        }

        if (bufferedGeoJson) {
          const bufferedLayer = L.geoJSON(bufferedGeoJson, {
            style: {
              color: "blue",
              weight: 1,
              opacity: 0.5,
            },
          }).addTo(mapRef.current);

          circleLayerForDrawRef.current = bufferedLayer;

          const geoJSON = bufferedLayer.toGeoJSON();
          extractCoordinates(geoJSON.features[0].geometry);
          mapRef.current.fitBounds(bufferedLayer.getBounds());
        }
      } else {
        extractCoordinates(drawingValues.geometry);
      }

      // Adding drawn layer to shapefileLayerRef and other related logic
      if (
        drawingValues.geometry.type === "Polygon" ||
        drawingValues.geometry.type === "Rectangle"
      ) {
        const area = turf.area(drawingValues.geometry) / 1000000;
        const customName = `AOI ${polygonCounter + 1}`;
        const polygonTooltipContent = `
          <div style="font-size: 12px;">
            <span>${customName}</span>
            <br/>
            Area: ${area.toFixed(2)} km²
          </div>`;

        drawnLayer
          .bindTooltip(polygonTooltipContent, {
            permanent: true,
            className: "custom-tooltip",
          })
          .openTooltip();
        LocationIconChange();
        drawnLayer.setStyle({
          color: "blue",
          weight: 1,
          opacity: 0.5,
        });

        // Fit the map to the bounds
        const boundsWithPadding = drawnLayer.getBounds();
        mapRef.current.fitBounds(boundsWithPadding);

        // Extract coordinates for both drawRectangle and drawPolygon shapes
        extractCoordinates(drawingValues.geometry);
      }

      // Handle LineString and Point drawing logic
      if (
        drawingValues.geometry.type === "LineString" ||
        drawingValues.geometry.type === "Point"
      ) {
        if (drawingValues.geometry.type === "LineString") {
          boundsWithPadding = drawnLayer.getBounds().pad(0.1);
        } else if (drawingValues.geometry.type === "Point") {
          const latlng = drawnLayer.getLatLng();
          boundsWithPadding = L.latLngBounds(latlng, latlng).pad(0.5);
          uploadedFiles.forEach((file) => {
            shapefileLayerRef.current.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                layer.setIcon(blackIcon);
              }
            });
            drawnLayer.setIcon(locationIcon);
          });

          if (uploadedFiles.length === 0) {
            drawnLayer.setIcon(locationIcon);
          }
          // Disable the drawing tool after adding the point
          mapRef.current.pm.disableDraw("Marker");
        }
      }

      // Initialize shapefileLayerRef and add the drawn layer
      shapefileLayerRef.current =
        shapefileLayerRef.current || L.layerGroup().addTo(mapRef.current);
      shapefileLayerRef.current.addLayer(drawnLayer);

      const customName = `AOI ${polygonCounter + 1}`;
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        { name: customName, geometry: drawingValues, color: "pink" },
      ]);
      setShapefileGeometries((prevGeometries) => ({
        ...prevGeometries,
        [customName]: drawingValues.geometry,
      }));

      if (drawingValues.geometry.type !== "Point") {
        setSelectedFiles(customName);
        setLatestDrawnLayer(drawnLayer);
      }

      setPolygonCounter((prevCounter) => prevCounter + 1);

      // Add event listener for shape editing
      drawnLayer.on("pm:edit", (e) => {
        console.log("Shape edited:", e);
        extractCoordinates(e.layer.toGeoJSON().geometry); // Extract and update coordinates
        setShapefileGeometries((prevGeometries) => ({
          ...prevGeometries,
          [customName]: e.layer.toGeoJSON().geometry,
        }));
      });
    } else {
      console.log("Layer has self-intersection. Cannot add to map.");
      drawnLayer.remove();
    }
  };

  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [folderHandle, setFolderHandle] = useState(null);

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleFileFormatChange = (e) => {
    setFileFormat(e.target.value);
  };

  const handleSelectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setFolderHandle(handle);
      alert("Folder selected successfully!");
    } catch (error) {
      console.error("Error selecting folder:", error);
      alert("Failed to select folder.");
    }
  };

  const saveFileToFolder = async (filename, content) => {
    if (!folderHandle) {
      alert("No folder selected.");
      return;
    }

    try {
      const fileHandle = await folderHandle.getFileHandle(filename, {
        create: true,
      });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(content);
      await writableStream.close();
      alert(`File saved as ${filename}`);
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file.");
    }
  };

  // to export the draw on map shapes into folder
  const downloadDrawnShapes = async () => {
    if (
      !shapefileLayerRef.current ||
      shapefileLayerRef.current.getLayers().length === 0
    ) {
      alert("No shapes to download.");
      return;
    }

    if (!fileName) {
      alert("Please provide a file name.");
      return;
    }

    if (!fileFormat) {
      alert("Please select a file format.");
      return;
    }

    const geojson = shapefileLayerRef.current.toGeoJSON();

    if (!geojson || !geojson.features) {
      alert("Error: GeoJSON data is invalid.");
      return;
    }

    // Calculate area for each feature and add it to properties
    geojson.features.forEach((feature) => {
      if (feature.geometry) {
        const area = turf.area(feature) / 1000000; // Area in square kilometers
        feature.properties.area = `${area.toFixed(2)} km²`;
      }
    });

    try {
      if (fileFormat === "geojson") {
        // Save GeoJSON to selected folder
        const geojsonBlob = new Blob([JSON.stringify(geojson)], {
          type: "application/json",
        });
        await saveFileToFolder(`${fileName}.geojson`, geojsonBlob);
      } else if (fileFormat === "kml") {
        // Convert GeoJSON to KML and save to selected folder
        const kmlData = geojsonToKml(geojson);
        const kmlBlob = new Blob([kmlData], {
          type: "application/vnd.google-earth.kml+xml",
        });
        await saveFileToFolder(`${fileName}.kml`, kmlBlob);
      } else if (fileFormat === "shapefile") {
        // Convert GeoJSON to Shapefile and save to selected folder
        const shpData = shpwrite.zip(geojson);
        await saveFileToFolder(`${fileName}.shp`, shpData.shp);
        await saveFileToFolder(`${fileName}.shx`, shpData.shx);
        await saveFileToFolder(`${fileName}.dbf`, shpData.dbf);
      } else if (fileFormat === "zip") {
        // Create a ZIP file containing all formats, each in its own folder
        const zip = new JSZip();

        // Folder for GeoJSON
        const geojsonFolder = zip.folder("geojson");
        const geojsonBlob = new Blob([JSON.stringify(geojson)], {
          type: "application/json",
        });
        geojsonFolder.file(`${fileName}.geojson`, geojsonBlob);

        // Folder for KML
        const kmlFolder = zip.folder("kml");
        const kmlData = geojsonToKml(geojson);
        const kmlBlob = new Blob([kmlData], {
          type: "application/vnd.google-earth.kml+xml",
        });
        kmlFolder.file(`${fileName}.kml`, kmlBlob);

        // Folder for Shapefile
        const shapefileFolder = zip.folder("shapefile");
        const shpData = shpwrite.zip(geojson);
        shapefileFolder.file(`${fileName}.shp`, shpData.shp);
        shapefileFolder.file(`${fileName}.shx`, shpData.shx);
        shapefileFolder.file(`${fileName}.dbf`, shpData.dbf);

        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        await saveFileToFolder(`${fileName}_all_formats.zip`, zipBlob);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please check the console for details.");
    }
  };

  // const downloadDrawnShapes = async () => {
  //   if (!shapefileLayerRef.current || shapefileLayerRef.current.getLayers().length === 0) {
  //     alert("No shapes to download.");
  //     return;
  //   }

  //   if (!fileName) {
  //     alert("Please provide a file name.");
  //     return;
  //   }

  //   if (!fileFormat) {
  //     alert("Please select a file format.");
  //     return;
  //   }

  //   const geojson = shapefileLayerRef.current.toGeoJSON();

  //   if (!geojson || !geojson.features) {
  //     alert("Error: GeoJSON data is invalid.");
  //     return;
  //   }

  //   // Calculate area for each feature and add it to properties
  //   geojson.features.forEach((feature) => {
  //     if (feature.geometry) {
  //       const area = turf.area(feature) / 1000000; // Area in square kilometers
  //       feature.properties.area = `${area.toFixed(2)} km²`;
  //     }
  //   });

  //   try {
  //     if (fileFormat === 'geojson') {
  //       // Download GeoJSON
  //       const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
  //       saveAs(blob, `${fileName}.geojson`);
  //     } else if (fileFormat === 'kml') {
  //       // Convert GeoJSON to KML and download
  //       const kmlData = geojsonToKml(geojson);
  //       const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
  //       saveAs(blob, `${fileName}.kml`);
  //     } else if (fileFormat === 'shapefile') {
  //       // Convert GeoJSON to Shapefile using `shpwrite` and download
  //       const shpData = shpwrite.zip(geojson);
  //       const zip = new JSZip();

  //       zip.file(`${fileName}.shp`, shpData.shp);
  //       zip.file(`${fileName}.shx`, shpData.shx);
  //       zip.file(`${fileName}.dbf`, shpData.dbf);

  //       // Generate the ZIP file and trigger the download
  //       zip.generateAsync({ type: 'blob' })
  //         .then((blob) => {
  //           saveAs(blob, `${fileName}.zip`);
  //         })
  //         .catch((zipError) => {
  //           console.error('Error generating ZIP file:', zipError);
  //           alert('Error generating ZIP file. Please check the console for details.');
  //         });
  //     } else if (fileFormat === 'zip') {
  //       // Create a ZIP file containing all formats, each in its own folder
  //       const zip = new JSZip();

  //       // Folder for GeoJSON
  //       const geojsonFolder = zip.folder('geojson');
  //       const geojsonBlob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
  //       geojsonFolder.file(`${fileName}.geojson`, geojsonBlob);

  //       // Folder for KML
  //       const kmlFolder = zip.folder('kml');
  //       const kmlData = geojsonToKml(geojson);
  //       const kmlBlob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
  //       kmlFolder.file(`${fileName}.kml`, kmlBlob);

  //       // Folder for Shapefile
  //       const shapefileFolder = zip.folder('shapefile');
  //       const shpData = shpwrite.zip(geojson);
  //       shapefileFolder.file(`${fileName}.shp`, shpData.shp);
  //       shapefileFolder.file(`${fileName}.shx`, shpData.shx);
  //       shapefileFolder.file(`${fileName}.dbf`, shpData.dbf);

  //       // Generate the ZIP file and trigger the download
  //       zip.generateAsync({ type: 'blob' })
  //         .then((blob) => {
  //           saveAs(blob, `${fileName}_all_formats.zip`);
  //         })
  //         .catch((zipError) => {
  //           console.error('Error generating ZIP file:', zipError);
  //           alert('Error generating ZIP file. Please check the console for details.');
  //         });
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('An error occurred. Please check the console for details.');
  //   }
  // };

  const removePreviousLayer = () => {
    if (shapefileLayerRef.current) {
      shapefileLayerRef.current.clearLayers();
      setHasDrawnShape(false); // Reset the drawn shape state
    }
  };

  const newOpenPopup = (index, code) => {
    setNewPopupVisible(true);
    setSelectedRowIndex(index);
    setDataCode(code);
  };

  const newClosePopup = () => {
    setNewPopupVisible(false);
    setCollapseVisible1(false);
    setCollapseVisible2(false);
  };

  const getZoomLevel = (map, bounds, padding, maxZoom) => {
    const WORLD_DIM = { height: 100, width: 256 };
    const ZOOM_MAX = 12;

    const ne = map.project(bounds.getNorthEast());
    const sw = map.project(bounds.getSouthWest());

    const dx = ne.x - sw.x;
    const dy = sw.y - ne.y;

    const zoomWidth = Math.log2(
      (WORLD_DIM.width * (map.getSize().x - padding[1] - padding[3])) / dx
    );
    const zoomHeight = Math.log2(
      (WORLD_DIM.height * (map.getSize().y - padding[0] - padding[2])) / dy
    );

    const zoom = Math.min(
      Math.floor(Math.min(zoomWidth, zoomHeight)),
      ZOOM_MAX
    );

    return Math.min(zoom, maxZoom);
  };

  const toggleTools = () => {
    setToolsOpen(!toolsOpen);
  };
  const updateCloudCover = (event) => {
    const newPercentage = event.target.value;
    setDCLOUD(newPercentage);
    setFormData({
      ...formData,
      DCLOUD: event.target.value,
    });
  };

  const updateSnowCover = (event) => {
    const newPercentage = event.target.value;
    setDSNOW(newPercentage);
    setFormData({
      ...formData,
      DSNOW: event.target.value,
    });
  };

  const handleCheckboxChangeCloud = () => {
    setIsCheckboxCheckedCloud(!isCheckboxCheckedCloud);
  };

  const handleCheckboxChangeSnow = () => {
    setIsCheckboxCheckedSnow(!isCheckboxCheckedSnow);
  };

  // Function to handle file input change
  const handelSelectAoi = () => {
    setLocation(false);
    setSelectAoi(true);
    setXyLocation(false);
    setBoundsState(false);
    setIsNoneActive(false);
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }
  };

  const handelXyLocation = () => {
    setLocation(false);
    setPath("");
    setSelectAoi(false);
    setXyLocation(true);
    setBoundsState(false);
    setIsNoneActive(false);
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }
    if (polygonRef) {
      polygonRef.remove();
      polygonRef = null; // Reset the polygon reference
    }
  };
  const handelBoundsState = () => {
    setIsNoneActive(false);
    setLocation(false);
    setSelectAoi(false);
    setXyLocation(false);
    setBoundsState(true);
    setIsNoneActive(false);
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }
    if (polygonRef) {
      polygonRef.remove();
      polygonRef = null; // Reset the polygon reference
    }
  };

  const handelLocation = () => {
    setLocation(true);
    setFieldsEnabled(false);
    setSelectAoi(false);
    setXyLocation(false);
    setBoundsState(false);
    setIsNoneActive(false);
  };

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    setCOMP_NA(selectedSubject);
    setTopic(""); // Reset topic and SEN_NAME when COMP_NA changes
    setSEN_NAME("");
    setFormData({ ...formData, COMP_NA: e.target.value });
    setIsOpen(false);
  };

  const handleTopicChange = (e) => {
    const selectedTopic = e.target.value;
    setTopic(selectedTopic);
    setSEN_NAME(""); // Reset SEN_NAME when topic changes
    setFormData({ ...formData, topic: e.target.value });
    setIsOpen(true);
  };

  const handleDataFromChild = (data) => {
    setDataFromChild(data);
    setFormData((prevFormData) => ({
      ...prevFormData,
      aoigeometry: data ? data : "",
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formDataWithAoigeometry = {
      ...formData,
    };

    console.log("formDataWithAoigeometry ", formDataWithAoigeometry);

    try {
      LoaderUpdateProgress();
      const response = await axios.post(
        "http://127.0.0.1:8000/search/optical_mono_sterio_tri_data_search/",
        formDataWithAoigeometry,
        {
          // params: formDataWithAoigeometry, // Add form data as query parameters
          // params: {
          //   data: JSON.stringify(formDataWithAoigeometry) // Serialize the data object
          // },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if response status is 200 or 201
      if (response.status === 200 || response.status === 201) {
        setLoading(false);
        // Handle the response data
        //console.log("Response:", response.data);
        setShowSearchTable(true);
        setIsClicked(true);
        setResponseData(response.data.message);
        setShowSearchForm(false);
        ModalManager.success({
          modalHeaderHeading: "Search",
          logo: "MARS_LOGO.png",
          modalBodyHeading: "Search Query",
          message: "Response get: " + response.data.message.length + "xml",
          // redirectTo: '/Login' // Specify the URL to redirect to
          // onConfirm: () => fetchData(page),
          confirmButtonText: "OK",
        });
      }
      setLoading(false);
      setProgress(100);
    } catch (error) {
      setIsClicked(true);
      setResponseData(null);
      setShowSearchTable(true);
      setLoading(false);
      setProgress(100);
      ModalManager.SimpleModal({
        modalHeaderHeading: "Search",
        logo: "MARS_LOGO.png",
        modalBodyHeading: "Search Query",
        message: "No Data Found",
        // redirectTo: '/Login' // Specify the URL to redirect to
        // onConfirm: () => fetchData(page),
        confirmButtonText: "OK",
      });
      // Handle errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Server Error:", error.response.data);
        console.log("Status Code:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error:", error.message);
      }
    }
  };

  const handleBackToSearch = () => {
    setShowSearchForm(true);
    setResponseData(null);
  };
  const shapefileLayerRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    let map = null;
    let scrollWheelZoomEnable = () => {};
    let scrollWheelZoomDisable = () => {};
    let scaleControl = null; // Variable to hold the reference to the scale control

    mapContainerRef.current = document.getElementById("searchMap");

    if (!mapContainerRef.current) {
      console.error("Error: Map container not found.");
      return;
    }

    map = L.map("searchMap", {
      scrollWheelZoom: false,
      minZoom: 2,
    }).setView([20.5937, 78.9629], 4);
    mapRef.current = map;

    const baseMaps = {
      "Open Street Map": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
        }
      ),
      "ESRI WorldImagery": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
        }
      ),
    };

    baseMaps["Open Street Map"].addTo(map);

    L.control.layers(baseMaps, null, { position: "topleft" }).addTo(map);

    // Function to add scale control and remove existing one if it exists
    const addScaleControl = () => {
      if (scaleControl) {
        map.removeControl(scaleControl); // Remove the existing scale control
      }
      scaleControl = L.control
        .scale({
          metric: true,
          imperial: false,
          position: "bottomleft",
        })
        .addTo(map);

      // Retrieve and log the scale control text
      const metricScaleLine = document.querySelector(
        ".leaflet-control-scale-line"
      );
      if (metricScaleLine) {
        console.log("Scale text:", metricScaleLine.textContent);
      }
    };

    // Initial scale control addition
    addScaleControl();

    map.removeControl(map.zoomControl);

    // L.Control.CustomZoom = L.Control.extend({
    //   onAdd: function (map) {
    //     var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom-zoom');

    //     var zoomInButton = L.DomUtil.create('a', 'leaflet-control-zoom-in', container);
    //     zoomInButton.innerHTML = `<div class="control-icon ZoomInIcon"></div>`;
    //     zoomInButton.href = '#';
    //     zoomInButton.title = 'Zoom in';

    //     var zoomOutButton = L.DomUtil.create('a', 'leaflet-control-zoom-out', container);
    //     zoomOutButton.innerHTML = `<div class="control-icon ZoomOutIcon"></div>`;
    //     zoomOutButton.href = '#';
    //     zoomOutButton.title = 'Zoom out';

    //     L.DomEvent.on(zoomInButton, 'click', function (e) {
    //       e.preventDefault();
    //       map.zoomIn();
    //     });

    //     L.DomEvent.on(zoomOutButton, 'click', function (e) {
    //       e.preventDefault();
    //       map.zoomOut();
    //     });

    //     return container;
    //   }
    // });

    // map.addControl(new L.Control.CustomZoom({ position: 'topleft' }));

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

    mapRef.current.on("mousemove", function (e) {
      const coordinateElement = document.getElementById("SearchCoordinate");
      if (coordinateElement !== null) {
        coordinateElement.innerHTML = `Lat: ${e.latlng.lat.toFixed(
          4
        )} &nbsp; &nbsp; Long: ${e.latlng.lng.toFixed(4)} `;
      }
    });

    const updateScaleLineStyle = (mapElements, isEsriImagery) => {
      mapElements.forEach((mapElement) => {
        if (!mapElement) return;

        const scaleLine = mapElement.querySelector(
          ".leaflet-control-scale-line"
        );

        if (scaleLine) {
          if (isEsriImagery) {
            scaleLine.style.backgroundColor = "none";
            scaleLine.style.borderBottomColor = "yellow";
            scaleLine.style.borderLeftColor = "yellow";
            scaleLine.style.borderRightColor = "yellow";
            scaleLine.style.color = "white";
          } else {
            scaleLine.style.backgroundColor = "none";
            scaleLine.style.borderBottomColor = "black";
            scaleLine.style.borderLeftColor = "black";
            scaleLine.style.borderRightColor = "black";
            scaleLine.style.color = "black";
          }
        }
      });
    };

    mapRef.current.on("baselayerchange", function (e) {
      const mapElements = [
        document.getElementById("searchMap"),
        document.getElementById("searchMap1"),
      ];

      const isEsriImagery = e.name === "ESRI WorldImagery";

      mapElements.forEach((mapElement) => {
        if (!mapElement) return;

        if (isEsriImagery) {
          mapElement.classList.add("esriimagery");
          mapElement.classList.remove("openstreetmap");
        } else {
          mapElement.classList.add("openstreetmap");
          mapElement.classList.remove("esriimagery");
        }
      });

      updateScaleLineStyle(mapElements, isEsriImagery);
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

  const rectangleZoomInRef = useRef(null);
  const rectangleZoomOutRef = useRef(null);
  const [drawingRectangleZoomIn, setDrawingRectangleZoomIn] = useState(false);
  const [drawingRectangleZoomOut, setDrawingRectangleZoomOut] = useState(false);

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
      map.getContainer().classList.add("SearchSelectedZoomOut");
    } else {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      // Reset cursor when not drawing
      map.getContainer().classList.remove("SearchSelectedZoomOut");
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
      map.getContainer().classList.add("SearchSelectedZoomIn");
    } else {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);

      // Reset cursor when not drawing
      map.getContainer().classList.remove("SearchSelectedZoomIn");
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

  useEffect(() => {
    if (mapRef.current) {
      // Set max bounds to a specific area // maxBounds that encompass the entire globe
      // const maxBounds = [[43.0, 74.0], [1.0, 78.0]]; // Example bounds for a region// Set max bounds once during initialization
      const maxBounds = [
        [-85, -180],
        [85, 180],
      ];
      mapRef.current.setMaxBounds(maxBounds);
      // Setting map options with maxBoundsViscosity
      mapRef.current.options.maxBoundsViscosity = 1.0;
    }

    // Select all button elements within the toolbar
    const buttonElements = document.querySelectorAll(
      ".leaflet-pm-toolbar .button-container"
    );

    // Loop over each button and disable click propagation for each one
    buttonElements.forEach((button) => {
      L.DomEvent.disableClickPropagation(button);
    });
  }, []);

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
    setIsPanningEnabled(true);
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
        console.log("Panning enabled");
      } else {
        mapRef.current.dragging.disable();
        console.log("Panning disabled");
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

  //END MAP CODE
  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    // Regular expression to match positive or negative numbers with a single dot
    const validCharacters = /^-?[0-9]*\.?[0-9]*$/;

    // Check if the new value is valid
    if (validCharacters.test(value)) {
      // console.log("value ", value)
      // Update the appropriate state based on the input's name
      if (name === "xLocation") {
        setXLocation(value);
      } else if (name === "yLocation") {
        setYLocation(value);
      }
      // Bounds
      if (name === "upperRightX") {
        setUpperRightX(value);
      } else if (name === "upperRightY") {
        setUpperRightY(value);
      } else if (name === "lowerLeftX") {
        setLowerLeftX(value);
      } else if (name === "lowerLeftY") {
        setLowerLeftY(value);
      }
      setLocationError((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error if valid
    } else {
      // Set error message if the input is invalid
      setLocationError((prevErrors) => ({
        ...prevErrors,
        [name]: "Enter Valid Coordinates",
      }));
    }
  };

  // XY location with funcytion Done
  const bufferLayerRef = useRef(null);
  const textLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  const [isBufferEnabled, setIsBufferEnabled] = useState(true);
  const [selectedShape, setSelectedShape] = useState("CIRCLE"); // Default to 'CIRCLE'

  const handleBufferCheckboxChange = (event) => {
    setIsBufferEnabled(event.target.checked);
  };

  const handleShapeSelection = (shape) => {
    setSelectedShape(shape);
  };

  const createBoxBuffer = (pointFeature, distance, unit) => {
    console.log(pointFeature);
    // Calculate the bounding box (bbox) around the point with the given distance and unit
    const pointBbox = bbox(buffer(pointFeature, distance, { units: unit }));

    // Create a polygon from the bounding box
    const boxPolygon = bboxPolygon(pointBbox);

    return boxPolygon;
  };

  const handleViewMapClick = () => {
    const xLocationInput = parseFloat(xLocation);
    const yLocationInput = parseFloat(yLocation);

    const bufferDistanceInput = parseFloat(
      document.getElementById("bufferDistance").value
    );
    const bufferUnit = document.getElementById("bufferUnit").value;

    if (bufferDistanceInput < 1) {
      alert("Buffer distance cannot be less than 1.");
      return;
    }

    if (!isNaN(xLocationInput) && !isNaN(yLocationInput)) {
      // Remove existing buffer, text, and circle layers if they exist
      if (bufferLayerRef.current) {
        mapRef.current.removeLayer(bufferLayerRef.current);
        bufferLayerRef.current = null;
      }

      if (textLayerRef.current) {
        mapRef.current.removeLayer(textLayerRef.current);
        textLayerRef.current = null;
      }

      if (circleLayerRef.current) {
        mapRef.current.removeLayer(circleLayerRef.current);
        circleLayerRef.current = null;
      }

      // Set the map view to the specified coordinates
      mapRef.current.setView([yLocationInput, xLocationInput], 13);

      if (isBufferEnabled) {
        // Create a point feature for the specified location
        const pointFeature = point([xLocationInput, yLocationInput]);

        // Buffer the point based on the selected shape
        let buffered;
        if (selectedShape === "CIRCLE") {
          buffered = buffer(pointFeature, bufferDistanceInput, {
            units: bufferUnit,
          });
        } else if (selectedShape === "BOX") {
          buffered = createBoxBuffer(
            pointFeature,
            bufferDistanceInput,
            bufferUnit
          );
        }

        // Add the buffered geometry to the map as a new layer
        const newBufferLayer = L.geoJSON(buffered, {
          style: {
            color: "blue",
            weight: 1,
            opacity: 0.5,
          },
        }).addTo(mapRef.current);

        // Fit the map to the bounds of the buffered geometry
        mapRef.current.fitBounds(newBufferLayer.getBounds());

        bufferLayerRef.current = newBufferLayer;

        // Convert the buffer layer to GeoJSON
        const geoJSON = bufferLayerRef.current
          ? bufferLayerRef.current.toGeoJSON()
          : null;

        // Construct the boundpolygon object
        const boundpolygon = geoJSON
          ? {
              type: "Polygon",
              geometry: geoJSON.features[0].geometry,
            }
          : null;

        // Update the formData state with the new geometry
        if (boundpolygon) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            aoigeometry: boundpolygon ? boundpolygon.geometry : "",
          }));
        }

        // Add the buffer layer to the shapefileLayerRef if it exists
        if (!shapefileLayerRef.current) {
          shapefileLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }
        shapefileLayerRef.current.addLayer(bufferLayerRef.current);
      }

      // Add a small circle marker at the selected location
      const circleMarker = L.circleMarker([yLocationInput, xLocationInput], {
        radius: 5, // Radius of the circle marker
        color: "red", // Outline color of the circle
        fillColor: "red", // Fill color of the circle
        fillOpacity: 1, // Opacity of the fill
      }).addTo(mapRef.current);

      circleLayerRef.current = circleMarker;

      // Add a text marker at the selected location
      const textIcon = L.divIcon({
        html: '<span style="color: blue; font-size: 12px; font-weight: bold;">Selected Location</span>',
        className: "custom-text-icon",
        iconSize: [100, 40],
        iconAnchor: [50, 20],
      });

      const newTextLayer = L.marker([yLocationInput, xLocationInput], {
        icon: textIcon,
      }).addTo(mapRef.current);
      textLayerRef.current = newTextLayer;

      // Set the flag indicating the XY point layer has been created
      layerXyPoint = true;
    } else {
      alert("Please enter valid longitude and latitude values.");
    }
  };

  const currentPolygon = useRef(null);
  const currentPolygonTextRef = useRef(null);

  // const handleViewMapClickPolyGon = () => {
  //   // if (layerAdded) {
  //   //   return; // Exit the function if the layer has already been added
  //   // }

  //   // Get the values from the input fields
  //   const upperRightXInput = document.getElementById('upperrightx');
  //   const upperRightYInput = document.getElementById('upperrighty');
  //   const lowerLeftXInput = document.getElementById('lowerleftx');
  //   const lowerLeftYInput = document.getElementById('lowerlefty');

  //   if (upperRightXInput && upperRightYInput && lowerLeftXInput && lowerLeftYInput) {
  //     const upperRightX = parseFloat(upperRightXInput.value);
  //     const upperRightY = parseFloat(upperRightYInput.value);
  //     const lowerLeftX = parseFloat(lowerLeftXInput.value);
  //     const lowerLeftY = parseFloat(lowerLeftYInput.value);

  //     if (!isNaN(upperRightX) && !isNaN(upperRightY) && !isNaN(lowerLeftX) && !isNaN(lowerLeftY)) {
  //       // Remove the previous polygon if it exists
  //       if (currentPolygon.current) {
  //         mapRef.current.removeLayer(currentPolygon.current);
  //         currentPolygon.current = null;
  //       }

  //       // Create a polygon based on the input values
  //       const polygonCoordinates = [
  //         [upperRightY, upperRightX],
  //         [upperRightY, lowerLeftX],
  //         [lowerLeftY, lowerLeftX],
  //         [lowerLeftY, upperRightX],
  //       ];

  //       // currentPolygon = L.polygon(polygonCoordinates).addTo(mapRef.current);
  //       currentPolygon.current = L.polygon(polygonCoordinates).addTo(mapRef.current);

  //       // Fit the map to the bounds of the created polygon
  //       mapRef.current.fitBounds(currentPolygon.current.getBounds());

  //       // Zoom out the map a bit (optional)
  //       // mapRef.current.setZoom(mapRef.current.getZoom() - 1);

  //       // Create drawing values in the desired format
  //       const boundpolygon = {
  //         type: 'Polygon',
  //         geometry: currentPolygon.current.toGeoJSON().geometry,
  //       };
  //       layerAdded = true;

  //       // Zoom out the map a bit after adding the polygon layer
  //       const zoomOutLevel = 1; // Adjust the zoom level as needed

  //       // Calculate the center of the polygon
  //       const polygonBounds = currentPolygon.current.getBounds();
  //       const polygonCenter = polygonBounds.getCenter();

  //       // Set the map view to the center of the polygon with the zoom out level
  //       mapRef.current.setView(polygonCenter, mapRef.current.getZoom() - zoomOutLevel);

  //       if (boundpolygon) {
  //         setFormData((prevFormData) => ({
  //           ...prevFormData,
  //           aoigeometry: boundpolygon ? boundpolygon.geometry : "",
  //         }));
  //       }
  //       // Use the drawing values as needed (e.g., send to API, store in state, etc.)
  //     } else {
  //       alert('Please enter valid coordinates for the polygon.');
  //     }
  //   }
  // };

  // Show Response Data Polygon in after search
  // useEffect(() => {
  //   if (mapRef.current && document.getElementById(mapRef.current._container.id)) {
  //     if (!tileLayer) {
  //       tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //         maxZoom: 19,
  //       }).addTo(mapRef.current);
  //     }

  //     // console.log("responseData ", responseData);

  //     // Check if responseData is an array and contains data
  //     if (Array.isArray(responseData) && responseData.length > 0) {
  //       responseData.forEach((data) => {
  //         // Iterate over each object in responseData and create polygons for their coordinates
  //         data.coordinates.forEach((coordinates) => {
  //           const polygonCoordinates = coordinates.map(([lon, lat]) => [lat, lon]); // Assuming coordinates are in [longitude, latitude] format

  //           // Create a polygon from the coordinates
  //           const polygon = L.polygon(polygonCoordinates, {
  //             color: '#7F00FF',
  //             weight: 3, // Border thickness
  //             fillOpacity: 0,
  //           }).addTo(mapRef.current);

  //           polygonGroupRef.current.push(polygon);

  //           // Bind a popup with data code
  //           polygon.bindPopup(`ACQUISITION MODE: ${data.SAT_NO}`);

  //         });
  //       });
  //     } else {
  //       console.error("responseData is either empty or not in the expected format.");
  //     }
  //   }

  //   // Cleanup function
  //   return () => {
  //     if (tileLayer) {
  //       mapRef.current.removeLayer(tileLayer);
  //     }

  //     // Remove polygons
  //     polygonGroupRef.current.forEach((polygon) => {
  //       mapRef.current.removeLayer(polygon);
  //     });

  //     polygonGroupRef.current = [];
  //   };
  // }, [mapRef, uploadedFiles, responseData]);

  const handleViewMapClickPolyGon = () => {
    const upperRightXInput = document.getElementById("upperrightx");
    const upperRightYInput = document.getElementById("upperrighty");
    const lowerLeftXInput = document.getElementById("lowerleftx");
    const lowerLeftYInput = document.getElementById("lowerlefty");

    if (
      upperRightXInput &&
      upperRightYInput &&
      lowerLeftXInput &&
      lowerLeftYInput
    ) {
      const upperRightX = parseFloat(upperRightXInput.value);
      const upperRightY = parseFloat(upperRightYInput.value);
      const lowerLeftX = parseFloat(lowerLeftXInput.value);
      const lowerLeftY = parseFloat(lowerLeftYInput.value);

      if (
        !isNaN(upperRightX) &&
        !isNaN(upperRightY) &&
        !isNaN(lowerLeftX) &&
        !isNaN(lowerLeftY)
      ) {
        // Remove the previous polygon if it exists
        if (currentPolygon.current) {
          mapRef.current.removeLayer(currentPolygon.current);
          currentPolygon.current = null;
        }

        if (currentPolygonTextRef.current) {
          mapRef.current.removeLayer(currentPolygonTextRef.current);
          currentPolygonTextRef.current = null;
        }

        // Create a polygon based on the input values
        const polygonCoordinates = [
          [upperRightY, upperRightX],
          [upperRightY, lowerLeftX],
          [lowerLeftY, lowerLeftX],
          [lowerLeftY, upperRightX],
        ];

        // Style the polygon
        currentPolygon.current = L.polygon(polygonCoordinates, {
          color: "blue",
          weight: 1,
          opacity: 0.5,
        }).addTo(mapRef.current);

        // Fit the map to the bounds of the created polygon
        mapRef.current.fitBounds(currentPolygon.current.getBounds());

        // Calculate the center of the polygon
        const polygonBounds = currentPolygon.current.getBounds();
        const polygonCenter = polygonBounds.getCenter();

        // Add a text marker at the center of the polygon
        const textIcon = L.divIcon({
          html: '<span style="color: blue; font-size: 12px; font-weight: bold;">Selected location</span>',
          className: "custom-text-icon",
          iconSize: [100, 40],
          iconAnchor: [50, 20],
        });

        const textMarker = L.marker(polygonCenter, { icon: textIcon }).addTo(
          mapRef.current
        );
        currentPolygonTextRef.current = textMarker;

        // Set the map view to the center of the polygon with a slight zoom out
        const zoomOutLevel = 1; // Adjust the zoom level as needed
        mapRef.current.setView(
          polygonCenter,
          mapRef.current.getZoom() - zoomOutLevel
        );

        // Create drawing values in the desired format
        const boundpolygon = {
          type: "Polygon",
          geometry: currentPolygon.current.toGeoJSON().geometry,
        };

        if (boundpolygon) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            aoigeometry: boundpolygon.geometry,
          }));
        }
      } else {
        alert("Please enter valid coordinates for the polygon.");
      }
    }
  };

  useEffect(() => {
    if (
      mapRef.current &&
      document.getElementById(mapRef.current._container.id)
    ) {
      if (!tileLayer.current) {
        tileLayer.current = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
          }
        ).addTo(mapRef.current);
      }

      if (Array.isArray(responseData) && responseData.length > 0) {
        responseData.forEach((data, index) => {
          data.coordinates.forEach((coordinates) => {
            const polygonCoordinates = coordinates.map(([lon, lat]) => [
              lat,
              lon,
            ]); // Assuming coordinates are in [longitude, latitude] format
            const polygon = L.polygon(polygonCoordinates, {
              color: "#7F00FF",
              weight: 3, // Border thickness
              fillOpacity: 0,
            }).addTo(mapRef.current);

            polygonGroupRef.current.push(polygon);

            polygon.bindPopup(`DataCode: ${data.id}`);

            // Handle polygon click to highlight the corresponding table row
            polygon.on("click", () => {
              setHighlightedRow(index); // Set the highlighted row index
              scrollToRow(index); // Scroll to the highlighted row
            });
          });
        });
      } else {
        console.error(
          "responseData is either empty or not in the expected format."
        );
      }
    }

    // Cleanup function
    return () => {
      if (tileLayer.current) {
        mapRef.current.removeLayer(tileLayer.current);
      }

      polygonGroupRef.current.forEach((polygon) => {
        mapRef.current.removeLayer(polygon);
      });

      polygonGroupRef.current = [];
    };
  }, [mapRef, responseData]);

  const zoomToLayerSelected = () => {
    // Initialize an empty LatLngBounds object
    const bounds = new L.LatLngBounds();

    // Loop through all polygons and extend the bounds to include each polygon's bounds
    polygonGroupRef.current.forEach((polygon) => {
      const polygonBounds = polygon.getBounds();
      bounds.extend(polygonBounds);
    });

    // Check if bounds are valid before fitting them to the map
    if (bounds.isValid()) {
      // Add padding to fitBounds, e.g., 50 pixels of padding around the bounds
      mapRef.current.fitBounds(bounds, {
        padding: [10, 10], // Padding array where [top-bottom, left-right]
      });
    }

    setIsPanningEnabled(false);
  };

  const scrollToRow = (index) => {
    const rowElement = document.getElementById(`row-${index}`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  //new Function
  const [isClicked, setIsClicked] = useState(false);

  const handleButtonClick = () => {
    if (formData.SEN_NAME !== "") {
      setIsClicked(true);
    }
  };

  const handleClearForm = () => {
    // Reset form fields here
    setFormData({
      COMP_NA: "",
      topic: "",
      SEN_NAME: "",
      startDate: "",
      endDate: "",
      D_PIXELX_MIN: "0",
      D_PIXELX_MAX: "999",
      IMG_DATYPE: "",
      D_IN_ANGL_MIN: "0",
      D_IN_ANGL_MAX: "90",
      SAT_NO: "",
    });
    setIsCheckboxCheckedCloud("");
    setIsCheckboxCheckedSnow("");
    setDCLOUD(100);
    setDSNOW(100);
    setCOMP_NA("");
    setTopic("");
    setIsOpen(false);
    setXLocation("");
    setYLocation("");
    setUpperRightX("");
    setUpperRightY("");
    setLowerLeftX("");
    setLowerLeftY("");
    // Clear the select element using ref
    if (AcquisitionModeListselectRef.current) {
      AcquisitionModeListselectRef.current.value = "";
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setClickedFile(1);
  };

  const closeModal = (fileName, clickedFile) => {
    if (clickedFile === 2) {
      if ((uploadedFile) => uploadedFile.name === fileName) {
        const updatedFiles = uploadedFiles.filter(
          (uploadedFile) => uploadedFile.name !== fileName
        );
        // Update the state with the new array
        setUploadedFiles(updatedFiles);
      }
      setIsModalOpen(false);
    } else if (fileName !== null) {
      const indexToRemove = uploadedFiles.findIndex(
        (file) => file && file.name === fileName
      );

      if (indexToRemove !== -1) {
        const updatedFiles = [...uploadedFiles];
        updatedFiles.splice(indexToRemove, 1); // Remove the element at the given index
        setUploadedFiles(updatedFiles);
      }
    }
    setIsModalOpen(false);
  };

  // Define layerMapping object
  // const handleFileUpload = async (event) => {
  //   try {
  //     const chosenFiles = Array.from(event.target.files);

  //     if (chosenFiles.length === 0) {
  //       alert('No files selected.');
  //       return;
  //     }
  //     // const lastUploadedFile = uploadedFiles[uploadedFiles.length - 1];
  //     for (const file of chosenFiles) {

  //       if (uploadedFiles.some(uploadedFile => uploadedFile.name === file.name)) {
  //         alert('You have already uploaded this file.');
  //         setIsModalOpen(false);
  //         continue; // Skip processing this file
  //       }

  //       let shapefileGeometry;
  //       setSelectedFiles(file.name);

  //       if (file.name.toLowerCase().endsWith('.shp')) {
  //         const arrayBuffer = await file.arrayBuffer();
  //         shapefileGeometry = await shp(arrayBuffer);
  //       } else if (file.name.toLowerCase().endsWith('.kml')) {
  //         const kmlData = await file.text();
  //         shapefileGeometry = toGeoJSON.kml(
  //           new DOMParser().parseFromString(kmlData, 'text/xml')
  //         );
  //       } else if (
  //         file.name.toLowerCase().endsWith('.geojson') ||
  //         file.name.toLowerCase().endsWith('.json')
  //       ) {
  //         shapefileGeometry = JSON.parse(await file.text());
  //       } else if (file.name.toLowerCase().endsWith('.kmz')) {
  //         // Process KMZ file
  //         // Example code to process KMZ:
  //         const zip = new JSZip();
  //         const kmzData = await zip.loadAsync(file);
  //         const kmlData = await kmzData.file('doc.kml').async('text');
  //         shapefileGeometry = toGeoJSON.kml(
  //           new DOMParser().parseFromString(kmlData, 'text/xml')
  //         );
  //       }
  //       else {
  //         alert('Unsupported file format');
  //         continue;
  //       }
  //       setIsUploaded(11);

  //       //old code
  //       if (shapefileLayerRef.current === null) {
  //         shapefileLayerRef.current = L.layerGroup().addTo(mapRef.current);
  //       }
  //       setUploadedFiles((prevFiles) => [...prevFiles, file]);
  //       setShapefileGeometries((prevGeometries) => ({
  //         ...prevGeometries,
  //         [file.name]: shapefileGeometry,
  //       }));
  //     }
  //     setClickedFile(2);
  //   } catch (error) {
  //     alert('An error occurred while uploading files.', error);
  //   }
  // };

  const handleFileUpload = async (event) => {
    try {
      const chosenFiles = Array.from(event.target.files);

      if (chosenFiles.length === 0) {
        alert("No files selected.");
        return;
      }

      for (const file of chosenFiles) {
        if (
          uploadedFiles.some((uploadedFile) => uploadedFile.name === file.name)
        ) {
          alert("You have already uploaded this file.");
          setIsModalOpen(false);
          continue; // Skip processing this file
        }

        let shapefileGeometry;
        setSelectedFiles(file.name);

        // if (file.name.toLowerCase().endsWith('.shp')) {
        //   const arrayBuffer = await file.arrayBuffer();
        //   shapefileGeometry = await shp(arrayBuffer);
        // if (file.name.toLowerCase().endsWith('.shp')) {
        //   const arrayBuffer = await file.arrayBuffer();
        //   const reader = new FileReader();
        //   reader.onload = async (e) => {
        //     const arrayBuffer = e.target.result;
        //     const geojson = await shapefile.read(arrayBuffer);
        //     setUploadedFiles((prevFiles) => [...prevFiles, file]);
        //     setShapefileGeometries((prevGeometries) => ({
        //       ...prevGeometries,
        //       [file.name]: geojson,
        //     }));
        //   };
        //   reader.readAsArrayBuffer(file);
        if (file.name.toLowerCase().endsWith(".shp")) {
          shapefileGeometry = await readShapefile(file);
        } else if (file.name.toLowerCase().endsWith(".kml")) {
          const kmlData = await file.text();
          shapefileGeometry = toGeoJSON.kml(
            new DOMParser().parseFromString(kmlData, "text/xml")
          );
        } else if (
          file.name.toLowerCase().endsWith(".geojson") ||
          file.name.toLowerCase().endsWith(".json")
        ) {
          shapefileGeometry = JSON.parse(await file.text());
        } else if (file.name.toLowerCase().endsWith(".kmz")) {
          // Process KMZ file
          const zip = new JSZip();
          const kmzData = await zip.loadAsync(file);
          const kmlFile = kmzData.file(/\.kml$/i)[0]; // Find the .kml file inside the KMZ
          if (kmlFile) {
            const kmlData = await kmlFile.async("text");
            shapefileGeometry = toGeoJSON.kml(
              new DOMParser().parseFromString(kmlData, "text/xml")
            );
          } else {
            alert("KMZ file does not contain a .kml file");
            continue;
          }
        } else {
          alert("Unsupported file format");
          continue;
        }

        setIsUploaded(11);

        // Ensure the layer group is initialized
        if (shapefileLayerRef.current === null) {
          shapefileLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        // Add the uploaded file and geometry to state
        setUploadedFiles((prevFiles) => [...prevFiles, file]);
        setShapefileGeometries((prevGeometries) => ({
          ...prevGeometries,
          [file.name]: shapefileGeometry,
        }));
      }

      setClickedFile(2);
    } catch (error) {
      alert("An error occurred while uploading files.");
      console.error(error);
    }
  };
  const readShapefile = async (arrayBuffer) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const data = await shapefile.open(reader.result);
        const features = [];
        while (true) {
          const result = await data.read();
          if (result.done) break;
          features.push(result.value);
        }
        resolve({ type: "FeatureCollection", features });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(new Blob([arrayBuffer]));
    });
  };

  const extractCoordinates = (geometry) => {
    let coordinates; // Declare coordinates variable

    // Extracting coordinates from the features
    if (geometry.coordinates) {
      coordinates = geometry;
    } else if (geometry.features && geometry.features.length > 0) {
      coordinates = geometry.features[0].geometry;
    } else {
      coordinates = geometry.geometry;
    }
    handleDataFromChild(coordinates);
  };

  const handleViewMapClickAoik = async () => {
    try {
      const layerTooltips = []; // Define outside the loop

      for (const [index, file] of uploadedFiles.entries()) {
        let fileName, geometry;

        // Extract fileName and geometry based on file type
        if (typeof file === "object") {
          fileName = file.name;
          geometry = shapefileGeometries[file.name];
        } else {
          fileName = file;
          geometry = shapefileGeometries[file];
        }

        // Handle missing geometry
        if (!geometry) {
          throw new Error(`Geometry not found for the file: ${fileName}`);
        }

        // Calculate the area using Turf.js
        const area = turf.area(geometry) / 1000000; // Convert square meters to square kilometers
        // let shapefileLayer = shapefileLayers[fileName];
        extractCoordinates(geometry);

        // Remove layer if it exists
        if (
          typeof file === "object" &&
          file.color === "pink" &&
          geometry.type !== "Point"
        ) {
          const layers = shapefileLayerRef.current.getLayers();
          if (index >= 0 && index < layers.length) {
            const layerToRemove = layers[index];
            shapefileLayerRef.current.removeLayer(layerToRemove);
          }
        }

        // Change icon if geometry type is Point
        if (geometry.type === "Point") {
          LocationIconChange();
        }
        let shapefileLayer;
        const tooltipContent = `
              <div style="text-transform; font-size: 12px;"> <span> ${fileName} </span>
                  Area: ${area.toFixed(2)} km²</div>`;

        if (
          typeof file === "object" &&
          file.color === "pink" &&
          geometry.type !== "Point"
        ) {
          shapefileLayer = L.geoJSON(geometry, {
            style: {
              color: "black", // Border color
              weight: 2, // Border thickness
              fillOpacity: 0, // Setting fillOpacity to 0 makes the polygon hollow
            },
          }).addTo(shapefileLayerRef.current);
          file.color = "black";
          shapefileLayer.options.fileName = fileName;

          const tooltip = L.tooltip({
            permanent: true,
            className: "custom-tooltip", // Add a custom class for further styling
            direction: "top",
            offset: [0, -10], // Offset to position tooltip above the layer
          }).setContent(tooltipContent);

          shapefileLayer.bindTooltip(tooltip);
          shapefileLayer.openTooltip();

          // Store layer and tooltip in the array
          layerTooltips.push({ layer: shapefileLayer, tooltip });
        }

        // Add new layer
        if (typeof file === "object" && selectedFiles === fileName) {
          shapefileLayer = L.geoJSON(geometry, {
            style: {
              color: (file.color = "#ff00ff"), // Border color
              weight: 2, // Border thickness
              fillOpacity: 0, // Setting fillOpacity to 0 makes the polygon hollow
            },
          }).addTo(shapefileLayerRef.current);

          // Add tooltip to the layer
          const tooltip = L.tooltip({
            permanent: true,
            className: "custom-tooltip", // Add a custom class for further styling
            direction: "top",
            offset: [0, -10], // Offset to position tooltip above the layer
          }).setContent(tooltipContent);

          shapefileLayer.bindTooltip(tooltip);
          shapefileLayer.openTooltip();

          // Store layer and tooltip in the array
          layerTooltips.push({ layer: shapefileLayer, tooltip });

          // Update color and other properties
          file.color = "pink";

          // Fit bounds to the new layer
          const bounds = shapefileLayer.getBounds();
          const padding = [40, 40, 40, 40];
          mapRef.current.fitBounds(bounds, { padding });

          setIsselected(true);

          // Add geometry to the array
          geometries.push(geometry);
        }
      }

      // Store tooltips for previous layers
      uploadedFiles.forEach((file, index) => {
        const fileName = typeof file === "object" ? file.name : file;
        const layer = shapefileLayers[fileName];
        if (layer) {
          const tooltip = layerTooltips[index].tooltip;
          layer.bindTooltip(tooltip);
        }
      });

      setIsUploaded(0);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error in handleViewMapClickAoeweik:", error);
      alert("An error occurred while processing the AOI: " + error.message);
    }
  };

  const handleResponseMapClickAoik = async (aoigeometry) => {
    try {
      if (!aoigeometry) {
        throw new Error("No geometry data provided.");
      }

      // Remove the previously drawn layer if it exists
      if (currentLayer) {
        mapRef.current.removeLayer(currentLayer);
        setCurrentLayer(null);
      }

      // If the geometry is a Point, add a marker
      if (aoigeometry.type === "Point") {
        const coordinates = aoigeometry.coordinates;

        // Create the marker and assign it to currentLayer
        const marker = L.marker([coordinates[1], coordinates[0]], {
          icon: locationIcon,
        }).addTo(mapRef.current);
        setCurrentLayer(marker);

        // Optionally, center the map on the marker
        mapRef.current.setView([coordinates[1], coordinates[0]], 13);
      } else {
        // For other geometry types, add them as a GeoJSON layer
        const geoJsonLayer = L.geoJSON(aoigeometry).addTo(mapRef.current);
        setCurrentLayer(geoJsonLayer);

        // Fit the map to the bounds of the geometry
        if (geoJsonLayer) {
          mapRef.current.fitBounds(geoJsonLayer.getBounds());
        }
      }

      setGetKey(false);
    } catch (error) {
      console.error("Error in handleResponseMapClickAoik:", error);
      alert("An error occurred while processing the AOI: " + error.message);
    }
  };

  const MapBounds = (fileName, index) => {
    // Create the GeoJSON layer without adding it to the map
    const geometry = shapefileGeometries[fileName];
    console.log(geometry);
    extractCoordinates(geometry);
    let shapefileLayer;

    shapefileLayer = L.geoJSON(geometry);
    let layerIndex = 0; // Initialize the layer index counter

    shapefileLayerRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.Marker)) {
        // Check if the layer's file name matches the selected file name

        if (layerIndex === index) {
          // If the layer's file name matches, set it to pink
          layer.setStyle({
            color: "#ff00ff", // Pink color
            weight: 2, // Border thickness
            fillOpacity: 0, // Setting fillOpacity to 0 makes the polygon hollow
          });
        } else {
          // If the layer's file name does not match, set it to black
          layer.setStyle({
            color: "black", // Black color
            weight: 2, // Border thickness
            fillOpacity: 0, // Setting fillOpacity to 0 makes the polygon hollow
          });
        }
      } else {
        if (layerIndex === index) {
          layer.setIcon(locationIcon);
        } else {
          LocationIconChange();
        }
      }
      layerIndex++;
    });

    // Store the layer reference in the fileLayerMap with lastModified as the key
    // fileLayerMap[fileName.lastModified] = shapefileLayer;

    // Get the bounds of the GeoJSON data
    const bounds = shapefileLayer.getBounds();

    // Now you can use the bounds as needed, for example, to center the map with padding
    const padding = [40, 40]; // top/bottom, left/right
    mapRef.current.fitBounds(bounds, { padding });
  };

  //working code
  const handleRemoveFiles = (fileIndex) => {
    try {
      // Check if the fileIndex is within the bounds of the uploadedFiles array
      if (fileIndex >= 0 && fileIndex < uploadedFiles.length) {
        // Remove the layer from the map
        const layerToRemove = shapefileLayerRef.current.getLayers()[fileIndex];
        if (layerToRemove) {
          setResponseData(null);
          // Remove the corresponding file object from the uploadedFiles array
          const updatedFiles = uploadedFiles.filter(
            (_, index) => index !== fileIndex
          );
          // setUploadedFiles(updatedFiles);
          setUploadedFiles([...updatedFiles]); // Update state with updated files
          setSelectedFiles(
            updatedFiles.length > 0 ? updatedFiles[0].name : null
          ); // Update selected file

          shapefileLayerRef.current.removeLayer(layerToRemove);
          //flag for xyLocation & Bounds
          layerAdded = false;
          layerXyPoint = false;

          // Remove the corresponding polygonCounter value
          // setPolygonCounter(prevCounter => {
          //   if (fileIndex < prevCounter) {
          //     return prevCounter - 1;
          //   }
          //   return prevCounter;
          // });

          // Update polygonCounter value based on the remaining polygons and lines

          if (polygonCounter < 0) {
            const maxIndex = updatedFiles.reduce((maxIndex, file) => {
              if (
                file.geometry.geometry.type === "Polygon" ||
                file.geometry.type === "LineString"
              ) {
                const currentIndex = parseInt(file.name.split(" ")[1]); // Extracting the index from the name
                return currentIndex > maxIndex ? currentIndex : maxIndex;
              }
              return maxIndex;
            }, 0);

            // Increment the counter if the maxIndex is less than the current polygonCounter
            if (maxIndex < polygonCounter) {
              setPolygonCounter(maxIndex + 1);
            }
          }
          // Reset polygonCounter to 0 if all files are deleted
          if (updatedFiles.length === 0) {
            setPolygonCounter(0);
          }
          setIsClicked(false);
        } else {
          // console.error('Layer not found for file at index:', fileIndex);
          alert("Layer not found. Please provide a valid file index.");
        }
      } else {
        console.error("Invalid file index:", fileIndex);
        alert("Invalid file index. Please provide a valid index.");
      }
    } catch (error) {
      console.error("Error in handleRemoveFiless:", error);
      alert("An error occurred while removing the layer.");
    }
  };

  const handleOptionClick = (value) => {
    if (formData.SEN_NAME.includes(value)) {
      setFormData({
        ...formData,
        SEN_NAME: formData.SEN_NAME.filter((item) => item !== value),
      });
    } else {
      setFormData({ ...formData, SEN_NAME: [...formData.SEN_NAME, value] });
    }
  };

  const getRowBackgroundColor = (index) => {
    return selectedRows.includes(index) ? "#A3EBB1" : ""; // Set color if the index is selected
  };

  const handleDownloadClick = (index) => {
    const responseDataAtIndex = responseData[index];
    // Create a new instance of PDFGenerator
    const pdfGenerator = new PDFGenerator({
      formData,
      responseData: responseDataAtIndex,
    });

    // Call the generatePDF method directly
    pdfGenerator.generatePDF();
  };

  const captureScreenshot = () => {
    const container = document.createElement("div");
    container.innerHTML = document.documentElement.outerHTML;

    // Remove the message element if it exists
    const messageElement = container.querySelector(".js-disabled-message");
    if (messageElement) {
      messageElement.remove();
    }

    domtoimage
      .toBlob(document.documentElement)
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imgData = reader.result;
          setScreenshot(imgData);
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error capturing screenshot:", error);
      });
  };

  const downloadReport = () => {
    captureScreenshot();
    setExportReport(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDownloadReportloading(true); // Start loading
    // Perform your loading logic here, e.g., fetching data, etc.
    setTimeout(() => {
      setDownloadReportloading(false); // Simulate loading completion
    }, 2000); // Replace with your actual loading logic
  };

  const handleCheckboxChange = (index, dataCode) => {
    const selectedIndex = selectedRows.indexOf(index);
    const selectedIndex1 = selectedDataCode.indexOf(dataCode);

    let newSelectedRows = [...selectedRows];
    let newDataCodes = [...selectedDataCode];

    if (selectedIndex === -1) {
      newSelectedRows.push(index);
      newDataCodes.push(dataCode);
      // Set layer color to red when checked
      polygonGroupRef.current[index].setStyle({
        color: "#FF0000", // Red
        weight: 3, // Border thickness
        fillOpacity: 0,
      });
    } else {
      setUnSelectedRow(index);
      newSelectedRows.splice(selectedIndex, 1);
      newDataCodes.splice(selectedIndex1, 1);
      // Set layer color to white when unchecked
      polygonGroupRef.current[index].setStyle({
        color: "#FFFFFF", // White
        weight: 3, // Border thickness
        fillOpacity: 0,
      });
    }

    setSelectedRows(newSelectedRows);
    setDataCode(newDataCodes);
  };

  useEffect(() => {
    // This useEffect is responsible for handling map zoom based on selectedRows
    // It should not contain handleZoomIn logic
    if (selectedRows.length !== 0) {
      // Call handleZoomIn with the index of the last selected row
      handleZoomIn(selectedRows[selectedRows.length - 1]);
    }
    // console.log("selectedRows ..>>>>", selectedRows);
  }, [selectedRows]);

  const handleZoomIn = (index) => {
    const updatedIndexes = selectedRows.map((index) => index);
    const lastUpdatedIndex = selectedRows[selectedRows.length - 1];

    console.log("updatedIndexes...", updatedIndexes);

    const bounds = polygonGroupRef.current[index].getBounds();
    const padding = [20, 20, 20, 20];
    const maxZoom = 12;

    const zoom = getZoomLevel(mapRef.current, bounds, padding, maxZoom);
    // Fit the bounds to the map with the calculated zoom level
    mapRef.current.fitBounds(bounds, { padding, maxZoom: zoom });
    if (lastUpdatedIndex === index) {
      polygonGroupRef.current.forEach((layer, idx) => {
        if (selectedRows.includes(idx)) {
          layer.setStyle({
            color: "#ec6f60",
            weight: 3, // Border thickness
            fillOpacity: 0,
            // fillColor: color // Set the fill color
          });
        }
      });
    } else {
      if (unSelectedRow === index) {
        const bounds = polygonGroupRef.current[index].getBounds();
        const padding = [20, 20, 20, 20];
        const maxZoom = 12; // Set your desired maximum zoom level
        const color = "#FFFFFF";

        const zoom = getZoomLevel(mapRef.current, bounds, padding, maxZoom);
        mapRef.current.fitBounds(bounds, { padding, maxZoom: zoom }, color);
        polygonGroupRef.current.forEach((layer, idx) => {
          if (idx !== index) {
            layer.setStyle({
              color: "#FFFFFF",
              weight: 3, // Border thickness
              fillOpacity: 0,
            });
          }
        });
      }
    }
    // Reset zoom level if needed
    const resetZoomLevel = 10;
    mapRef.current.setZoom(resetZoomLevel);
  };

  const handleLayerToggle = (index) => {
    setLayerVisibility((prevState) => {
      const newVisibility = !prevState[index];
      if (newVisibility) {
        // Remove layer from the map when toggled to invisible
        mapRef.current.removeLayer(polygonGroupRef.current[index]);
      } else {
        // Add layer to the map when toggled to visible
        polygonGroupRef.current[index].addTo(mapRef.current);
      }
      return {
        ...prevState,
        [index]: newVisibility,
      };
    });
  };

  //export layer
  const handleExportButtonClick = () => {
    try {
      // Call the function to view the map, which will trigger the download function
      setModalOpen(true);
      setExportReport(true);

      console.log("geometries...", formData.aoigeometry);
    } catch (error) {
      console.error("Error in handleExportButtonClick:", error);
      alert("An error occurred during export: " + error.message);
    }
  };

  const exportLayer = () => {
    try {
      if (selectedDataCode.length !== 0) {
        let combinedKML = `<?xml version="1.0" encoding="UTF-8"?>
        <kml xmlns="http://www.opengis.net/kml/2.2">
          <Document>`;

        selectedDataCode.forEach((dataCode) => {
          // Find all items in responseData that match the selected dataCode
          const matchingItems = responseData.filter(
            (item) => item.id === dataCode
          );

          // Check if there are matching items
          if (matchingItems.length > 0) {
            // Extract coordinates from each matching item
            const coordinates = matchingItems.map((item) =>
              item.coordinates[0]
                .map((point) => `${point[0]},${point[1]}`)
                .join(" ")
            );

            // Create KML document for each set of coordinates
            const kmlDocument = `
              <Placemark>
                <Polygon>
                  <outerBoundaryIs>
                    <LinearRing>
                      <coordinates>
                        ${coordinates.join(" ")}
                      </coordinates>
                    </LinearRing>
                  </outerBoundaryIs>
                </Polygon>
              </Placemark>`;

            combinedKML += kmlDocument;
          }
        });

        combinedKML += `
          </Document>
        </kml>`;

        const blob = new Blob([combinedKML], {
          type: "application/vnd.google-earth.kml+xml",
        });
        const filename = "exported_data.kml";
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
  const handleDropdownClick = (e) => {
    e.stopPropagation();
    toggleDropdown();
  };

  const handleReset = (e) => {
    // window.location.reload();
    e.preventDefault();
    setLocation(false);
    setSelectAoi(false);
    setXyLocation(false);
    setBoundsState(false);
    setIsNoneActive(true);
    setUploadedData(null);

    if (currentLayer) {
      mapRef.current.removeLayer(currentLayer);
      setCurrentLayer(null);
    }

    // XY Lopcation Layres Remove
    if (bufferLayerRef.current) {
      mapRef.current.removeLayer(bufferLayerRef.current);
      bufferLayerRef.current = null;
    }
    if (textLayerRef.current) {
      mapRef.current.removeLayer(textLayerRef.current);
      textLayerRef.current = null;
    }
    if (circleLayerRef.current) {
      mapRef.current.removeLayer(circleLayerRef.current);
      circleLayerRef.current = null;
    }

    // Bounds Layers Remove
    if (currentPolygon.current) {
      mapRef.current.removeLayer(currentPolygon.current);
      currentPolygon.current = null;
    }
    if (currentPolygonTextRef.current) {
      mapRef.current.removeLayer(currentPolygonTextRef.current);
      currentPolygonTextRef.current = null;
    }

    // Select Aoi
    if (shapefileLayerRef.current) {
      mapRef.current.removeLayer(shapefileLayerRef.current);
      shapefileLayerRef.current = null;
      setUploadedFiles([]);
      setSelectedFiles(null);
    }

    if (circleLayerForDrawRef.current) {
      mapRef.current.removeLayer(circleLayerForDrawRef.current);
      circleLayerForDrawRef.current = null;
    }
    // if (tileLayer.current) {
    //   mapRef.current.removeLayer(tileLayer.current);
    //   tileLayer.current = null;
    // }
    // polygonGroupRef.current.forEach((polygon) => {
    //   mapRef.current.removeLayer(polygon);
    // });
    // Clear the map layers
    if (mapRef.current) {
      polygonGroupRef.current.forEach((polygon) => {
        mapRef.current.removeLayer(polygon);
      });
      polygonGroupRef.current = [];
    }

    // Clear the table data
    // setResponseData([]);
    setResponseData(null);

    // Clear the highlighted row
    setHighlightedRow(null);
    handleClearForm();
  };

  const handleQuit = () => {
    // window.history.go("/");
    navigate("/MarsHome");
  };

  // *****************************************************************************************************

  const [startDateselectedDate, startDatesetSelectedDate] = useState(null); //start Date
  const [startDatecalendarOpen, startDatesetCalendarOpen] = useState(false); // Control calendar visibility
  const startDatedatePickerRef = useRef(null); // Ref for DatePicker

  const [selectedDate, setSelectedDate] = useState(null); // End Date
  const [calendarOpen, setCalendarOpen] = useState(false); // Control calendar visibility
  const datePickerRef = useRef(null); // Ref for DatePicker

  // Handle date selection and formatting for start date
  const startDatehandleDateChange = (date) => {
    startDatesetSelectedDate(date);

    // If end date is set and it's before the new start date, reset end date
    if (selectedDate && date > selectedDate) {
      setSelectedDate(null); // Clear end date
    }
    setFormData((prevData) => ({
      ...prevData,
      startDate: date ? date.toISOString().split("T")[0] : "", // Formatting date as yyyy-mm-dd
    }));
    startDatesetCalendarOpen(false); // Close the calendar after selecting a date

    // startDatesetSelectedDate(date);
    // startDatesetCalendarOpen(false);
  };

  // Handle date selection and formatting for end date
  const handleDateChange = (date) => {
    // // If start date is set and end date is before start date, don't allow selection
    if (startDateselectedDate && date < startDateselectedDate) {
      alert("End date cannot be before the start date.");
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      endDate: date ? date.toISOString().split("T")[0] : "", // Formatting date as yyyy-mm-dd
    }));

    setSelectedDate(date);
    setCalendarOpen(false); // Close the calendar after selecting a date

    // setSelectedDate(date);
    // setCalendarOpen(false);
  };

  // Toggle calendar visibility
  const startDatehandleIconClick = () => {
    startDatesetCalendarOpen(!startDatecalendarOpen); // Toggle calendar open state
  };

  // Toggle calendar visibility
  const EndDatehandleIconClick = () => {
    setCalendarOpen(!calendarOpen); // Toggle calendar open state
  };

  // Prevent input from being focused or editable
  const startDatehandleInputClick = (e) => {
    e.preventDefault(); // Prevent default focus behavior
  };

  // Prevent input from being focused or editable
  const handleInputClick = (e) => {
    e.preventDefault(); // Prevent default focus behavior
  };

  // Prevent any manual input into the date field
  const startDatehandlePreventInput = (e) => {
    e.preventDefault(); // Block all manual input actions
  };

  // Prevent any manual input into the date field
  const handlePreventInput = (e) => {
    e.preventDefault(); // Block all manual input actions
  };

  // Allow only digits and '/' in the input and format as DD/MM/YYYY
  const handleInputChangestartDate = (e) => {
    const { value, name } = e.target;

    // Remove all non-digit characters
    let filteredValue = value.replace(/[^0-9]/g, "");

    // Define formatted value
    let formattedValue = "";

    // Insert '/' after the day part (2 digits)
    if (filteredValue.length > 2) {
      formattedValue += filteredValue.slice(0, 2) + "/";
      filteredValue = filteredValue.slice(2);
    }

    // Insert '/' after the month part (2 digits)
    if (filteredValue.length > 2) {
      formattedValue += filteredValue.slice(0, 2) + "/";
      filteredValue = filteredValue.slice(2);
    }

    // Add the year part
    formattedValue += filteredValue.slice(0, 4);

    // Limit the length to 10 characters (DD/MM/YYYY)
    e.target.value = formattedValue.slice(0, 10);
  };

  // Allow only digits and '/' in the input and format as DD/MM/YYYY
  const handleInputChangeEndDate = (e) => {
    const { value } = e.target;

    // Remove all non-digit characters
    let filteredValue = value.replace(/[^0-9]/g, "");

    // Define formatted value
    let formattedValue = "";

    // Insert '/' after the day part (2 digits)
    if (filteredValue.length > 2) {
      formattedValue += filteredValue.slice(0, 2) + "/";
      filteredValue = filteredValue.slice(2);
    }

    // Insert '/' after the month part (2 digits)
    if (filteredValue.length > 2) {
      formattedValue += filteredValue.slice(0, 2) + "/";
      filteredValue = filteredValue.slice(2);
    }

    // Add the year part
    formattedValue += filteredValue.slice(0, 4);

    // Limit the length to 10 characters (DD/MM/YYYY)
    e.target.value = formattedValue.slice(0, 10);
  };

  // ______________________SAVE QUERY _____________________________________

  const downloadJsonFile = (filename) => {
    const jsonData = JSON.stringify(formData, null, 2); // Convert formData to JSON string
    const blob = new Blob([jsonData], { type: "application/json" }); // Create a Blob
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const link = document.createElement("a"); // Create a temporary link element
    link.href = url; // Set the href to the Blob URL
    link.download = filename || "formData.json"; // Set the download attribute with a filename
    document.body.appendChild(link); // Append the link to the body
    link.click(); // Programmatically click the link to trigger the download
    document.body.removeChild(link); // Remove the link after downloading
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  // Usage example:
  const getQueryData = () => {
    console.log("formdat...", formData);
    downloadJsonFile(); // Call the download function
    return formData;
  };

  const saveQueryData = () => {
    //console.log("formdat...", formData);
    const filename = prompt("Enter filename:", "formData.json"); // Prompt for a filename
    downloadJsonFile(filename); // Call the download function with the user-defined filename
  };

  // ______________________GET QUERY________________________________________

  // Function to handle file selection and reading
  const handleGsonUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      setGetKey(true);
      //console.log("GSSSG....", getkey);

      // Check the file extension or type
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        //setError("Only .json files are allowed");

        ModalManager.warning({
          modalHeaderHeading: "Search",
          logo: "MARS_LOGO.png",
          modalBodyHeading: "Warning",
          message: "Only .json files are allowed",
          confirmButtonText: "OK",
        });
        return;
      }
      const reader = new FileReader(); // Create a new FileReader to read the file

      // Read the file as text
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result); // Parse the file contents to JSON
          console.log("Extracted JSON Data:", json);
          setUploadedData(json); // Set the extracted JSON data to state
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file); // Read the file as text
    }
  };

  // Function to trigger the file input click when the button is pressed
  const handleGetQuery = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  console.log("COMP_NA....", COMP_NA);
  // /////////////////////////////////////////////////////////
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const handleYearDropdownFocus = () => {
    setIsYearDropdownOpen(true);
    setIsMonthDropdownOpen(false); // Close month dropdown when year is focused
  };

  const handleMonthDropdownFocus = () => {
    setIsMonthDropdownOpen(true);
    setIsYearDropdownOpen(false); // Close year dropdown when month is focused
  };

  return (
    <>
      {/* <div id="marsSearch"> */}
      <Preloader loading={loading} progress={progress} />
      {/* New Form Section */}
      {/* <div className='MarsSearchPadMar'> */}
      {/* <div className="Maincontainer-search"> */}

      <div className="Maincontainer-upper">
        <div class="Search-box-1">
          {/* <div className="open-tools" onClick={toggleTools} style={{ display: toolsOpen ? 'none ' : 'block' }}>
                  <i className="fa fa-bars ToolsOepn" />
                </div> */}
          <div className="Head-Field-set mb-4">
            <fieldset class="Head-Search-fieldset">
              <legend class="Head-Search-legend mx-1">MARS DATA SEARCH</legend>
              <div className="spatialSearch-fieldset-DIV">
                <fieldset class="spatialSearch-fieldset">
                  <legend class="spatialSearch-legend mx-1">
                    SPATIAL Search
                  </legend>

                  {/* <div className="search-buttons-boxs">
                      <button onClick={handleNoneClick} id="" className={`spec-search-btn ${Noneaoi ? 'active' : 'inactive'}`}  >NONE</button>
                      <button id="selectaoi-btn" onClick={handelSelectAoi} className={`spec-search-btn ${selectAoi ? 'active' : 'inactive'}`} >Select AOI</button>
                      <button id="xylocation-btn" onClick={handelXyLocation} className={`spec-search-btn ${xyLocation ? 'active' : 'inactive'}`} >XY Location</button>
                      <button id="bounds-btn" onClick={handelBoundsState} className={`spec-search-btn ${boundsState ? 'active' : 'inactive'}`} >Bounds</button>
                      <button id="SelectLocationonMap-btn" onClick={handelLocation} className={`spec-search-btn ${selectLocation ? 'active' : 'inactive'}`} >Draw on Map</button>
                    </div> */}

                  <div className="container-fluid">
                    <div className="row search-buttons-boxs">
                      {/* <div className="search-toggle-button-box"> */}
                      <div className="col search-btn-col">
                        <Tooltip
                          title=" None of data get selected"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{
                            position: "fixed",
                            top: "210px",
                            transform: "translateY(0px)", // Adjust Y position to remove the gap
                          }}
                        >
                          {" "}
                          <button
                            onClick={handleNoneClick}
                            id=""
                            className={`spec-search-btn ${
                              Noneaoi ? "active" : "inactive"
                            }`}
                          >
                            NONE
                          </button>
                        </Tooltip>
                      </div>
                      <div className="col search-btn-col">
                        <Tooltip
                          title="Select AOI"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{
                            position: "fixed",
                            top: "210px",
                            transform: "translateY(0px)", // Adjust Y position to remove the gap
                          }}
                        >
                          <button
                            id="selectaoi-btn"
                            onClick={handelSelectAoi}
                            className={`spec-search-btn mb-0 ${
                              selectAoi ? "active" : "inactive"
                            }`}
                          >
                            SELECT AOI
                          </button>
                        </Tooltip>
                      </div>
                      <div className="col search-btn-col">
                        <Tooltip
                          title=" XY Location"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{
                            position: "fixed",
                            top: "210px",
                            transform: "translateY(0px)", // Adjust Y position to remove the gap
                          }}
                        >
                          <button
                            id="xylocation-btn"
                            onClick={handelXyLocation}
                            className={`spec-search-btn ${
                              xyLocation ? "active" : "inactive"
                            }`}
                          >
                            XY LOCATION
                          </button>
                        </Tooltip>
                      </div>
                      <div className="col search-btn-col">
                        <Tooltip
                          title="  bonds"
                          placement="bottom"
                          className="p-0 m-0"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{
                            position: "fixed",
                            top: "210px",
                            transform: "translateY(0px)", // Adjust Y position to remove the gap
                          }}
                        >
                          {" "}
                          <button
                            id="bounds-btn"
                            onClick={handelBoundsState}
                            className={`spec-search-btn ${
                              boundsState ? "active" : "inactive"
                            }`}
                          >
                            BOUNDS
                          </button>
                        </Tooltip>
                      </div>
                      <div className="col search-btn-col">
                        <Tooltip
                          title="  Draw on map"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{
                            position: "fixed",
                            top: "210px",
                            transform: "translateY(0px)", // Adjust Y position to remove the gap
                          }}
                        >
                          {" "}
                          <button
                            type="bottom"
                            id="SelectLocationonMap-btn"
                            onClick={handelDrawOnMap}
                            className={`spec-search-btn ${
                              selectLocation ? "active" : "inactive"
                            }`}
                          >
                            DRAW ON MAP
                          </button>
                        </Tooltip>
                      </div>
                      {/* </div> */}
                    </div>
                  </div>

                  {/* New Code Changes UI */}
                  {/* SELECT AOI */}

                  <div className={`None-btn ${Noneaoi ? "" : "hidden"}`}>
                    <label className="No-spati-sele-label">
                      No Spatial Selection
                    </label>
                  </div>

                  <div className={`Upload-btn ${selectAoi ? "" : "hidden"}`}>
                    <label className="spatial-Aoi-label">
                      SELECT AOI AS A FILE (Shape/XML/GeoJSON)
                    </label>

                    <div className=" selectAoi-File-Div">
                      {/* <div className="Aoi-File-div"> */}
                      <input
                        id="path"
                        className="Aoi-File-path"
                        placeholder="No spatial Selection"
                        value={
                          selectedFiles ? selectedFiles : "No Spatial Selection"
                        }
                        readOnly
                      />
                      {/* Down arrow icon */}
                      <span
                        className="arrow-span"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        {uploadedFiles.length > 0 ? (
                          <FontAwesomeIcon
                            className="iconfaChevronDown"
                            icon={showDropdown ? faChevronUp : faChevronDown}
                          />
                        ) : (
                          <FontAwesomeIcon
                            className="iconfaChevronDown"
                            icon={faChevronDown}
                          />
                        )}
                      </span>
                      {/* Dropdown list */}
                      {showDropdown && (
                        <ul className="DropDown-List-UL">
                          {uploadedFiles.map((file, index) => (
                            <React.Fragment key={index}>
                              <div>
                                <span
                                  className="uploaded-file-list"
                                  onClick={() => handleFileSelect(file, index)}
                                >
                                  {file.name}
                                </span>
                                <button
                                  className="btn mr-2 float-right Search-RemoveButton"
                                  onClick={() =>
                                    handleRemoveFiles(index, file.name)
                                  }
                                >
                                  {isModalOpen ? "" : "X"}
                                </button>
                              </div>
                              <hr className="new-hr" />
                            </React.Fragment>
                          ))}
                        </ul>
                      )}
                      {/* </div> */}
                      <div className="Aoi-custom-file-div">
                        <label for="myfile" className="Aoi-custom-file-upload">
                          <FontAwesomeIcon
                            className="Aoi-UploadIcon"
                            icon={faWindowRestore}
                          />
                        </label>
                        <input
                          type="file"
                          id="myfile"
                          name="file"
                          className="Aoi-hidden-file-input"
                          required
                          accept=".kml,.kmz,.json,.shp,.geson"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                    <div className="Viewmap-btnDIv">
                      <button
                        onClick={() => handleViewMapClickAoik(selectedFiles)}
                        className="View-on-map-btn"
                      >
                        VIEW ON MAP
                      </button>
                    </div>
                  </div>

                  {isModalOpen && (
                    <div class="file-upload-modal">
                      <div class="file-upload-modal-dialog">
                        <div class="file-upload-modal-content">
                          <div class=" file-upload-modal-header">
                            <h5>
                              Only kml, geojson, json & shape file format
                              allowed
                            </h5>
                            <button
                              type="button"
                              class="close"
                              onClick={() =>
                                closeModal(selectedFiles, clickedFile)
                              }
                              aria-label="Close"
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="file-upload-modal-body">
                            <input
                              id="fileUpload"
                              type="file"
                              multiple
                              accept=".kml,.kmz,.json,.shp,.geson"
                              onChange={handleFileUpload}
                              style={{ display: "block", margin: "10px 0" }}
                            />
                          </div>
                          <div class="file-upload-modal-footer">
                            <button
                              type="button"
                              id="view_map"
                              class="btn btn-primary"
                              onClick={() =>
                                handleViewMapClickAoik(selectedFiles)
                              }
                            >
                              OKAY
                            </button>{" "}
                            &nbsp;
                            {/* <button type="button" class="btn btn-secondary" onClick={closeModalss}>Close</button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* {modalOpen && <DownloadSearchReportModal onClose={handleCloseModal} formData={formData} responseData={responseData} screenshot={screenshot} selectedRows={selectedRows} exportReport={exportReport} setShowDropdown={setShowDropdown} />} */}
                  {/* END */}

                  {/* Input selection for 'XY LOCATION' */}

                  <div
                    className={`input-XY-location ${
                      xyLocation ? "" : "hidden"
                    }`}
                  >
                    <div className="xy-input-div">
                      <div className="provide-x-div col pl-0 mr-0">
                        <div className="x-coordinates-input">
                          <label className="providexlongitudeindegreedecimal_label">
                            Provide X (Longitude) in Degree Decimal
                          </label>
                          <input
                            type="text"
                            name="xLocation"
                            // className="inputxcoordinate"
                            className={`inputxcoordinate ${
                              locationError.xLocation ? "is-invalid" : ""
                            }`}
                            placeholder="Value"
                            value={xLocation}
                            onChange={handleLocationChange}
                          />
                          {locationError.xLocation && (
                            <span className="invalid-feedback">
                              {locationError.xLocation}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="provide-y-div col pr-0 mr-0">
                        <div className="y-coordinates-input">
                          <label className="provideylatitudeindegreedecimal_label">
                            Provide Y (Latitude) in Degree Decimal
                          </label>
                          <input
                            type="text"
                            name="yLocation"
                            // className="inputycoordinate"
                            className={`inputycoordinate ${
                              locationError.yLocation ? "is-invalid" : ""
                            }`}
                            placeholder="Value"
                            value={yLocation}
                            onChange={handleLocationChange}
                          />
                          {locationError.yLocation && (
                            <span className="invalid-feedback">
                              {locationError.yLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="xyLocation-fieldset-div">
                      <fieldset className="xyLocation-fieldset">
                        <legend className="xyLocation-legend ">
                          <input
                            type="checkbox"
                            className="Leg-square-input"
                            checked={isBufferEnabled}
                            onChange={handleBufferCheckboxChange}
                          />
                          &nbsp; BUFFER Search:
                        </legend>

                        {/* ROW */}
                        <div className=" Buffer-div">
                          <div className=" buffer-type-col">
                            <div className="Buffer-inner-row">
                              <div className="Label-buffer-type">
                                <label
                                  className="LAbelOf-Buffer"
                                  htmlFor="aoiFileInput"
                                >
                                  Buffer Type:
                                </label>
                              </div>
                              <div className="circle-box-btn ">
                                <button
                                  className={`Buff-search-btn1 ${
                                    selectedShape === "CIRCLE" ? "active" : ""
                                  }`}
                                  onClick={() => handleShapeSelection("CIRCLE")}
                                >
                                  CIRCLE
                                </button>
                                <button
                                  className={`Buff-search-btn2 ${
                                    selectedShape === "BOX" ? "active" : ""
                                  }`}
                                  onClick={() => handleShapeSelection("BOX")}
                                >
                                  BOX
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="buffer-Dist-unit-col">
                            <div className=" Buff-dist-row">
                              <div className="buff-dist-l ">
                                <label
                                  className="LAbelOf-Buffer "
                                  htmlFor="bufferDistance"
                                >
                                  Buffer Distance:
                                </label>
                              </div>
                              <div className="buff-dist-Input-div">
                                <input
                                  className="Buffer-dist-input"
                                  type="number"
                                  id="bufferDistance"
                                  placeholder="Value"
                                  defaultValue={1}
                                  min={1} // Minimum value set to 1
                                  step={1} // Step value for increment
                                  // onKeyPress={(e) => {
                                  //   // Allow only numbers, backspace, and tab
                                  //   if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                  //     e.preventDefault();
                                  //   }
                                  // }}
                                  maxLength={8}
                                  // onChange={(e) => {
                                  //   // Update the value if it exceeds max length
                                  //   if (e.target.value.length > 10) {
                                  //     e.target.value = e.target.value.slice(0, 10);
                                  //   }
                                  // }}
                                />
                              </div>
                            </div>
                            <div className=" Buff-unit-row">
                              <div className="buff-unit-label">
                                <label
                                  className="LAbelOf-Buffer "
                                  htmlFor="bufferUnit"
                                >
                                  Buffer Unit:
                                </label>
                              </div>
                              <div className="buff-unit-input ">
                                <select
                                  id="bufferUnit"
                                  className="OptionsSearch"
                                  defaultValue="kilometers"
                                >
                                  {" "}
                                  {/* Default value set to kilometers */}
                                  <option value="kilometers">kilometers</option>
                                  <option value="degrees">degrees</option>
                                  <option value="miles">miles</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    {/* "View on Map" Button */}
                    <div className="ViewMap">
                      <button
                        className="view-map2"
                        id="view_ma2"
                        onClick={handleViewMapClick}
                      >
                        VIEW ON MAP
                      </button>
                    </div>
                  </div>

                  {/* Input selection for 'BOUNDS' */}

                  <div
                    className={`input-Bounds ${boundsState ? "" : "hidden"}`}
                  >
                    <div className="mt-3">
                      <fieldset className="the-fieldset-Bounds mb-4">
                        <span className="upper-x-label">
                          <p className="firstl1p m-0 p-0">
                            Upper Right X (Longitude) in DD
                          </p>
                        </span>

                        <span className="upper-x-Input">
                          {/* <input type="text" className='input-box firstl1InputBox' placeholder="value" /> */}
                          {/* <div className="input-upper-right-x"> */}
                          <input
                            type="numbers"
                            id="upperrightx"
                            name="upperRightX"
                            // className="input-UpperRight-X-inDD"
                            className={`input-UpperRight-X-inDD ${
                              locationError.upperRightX ? "is-invalid" : ""
                            }`}
                            placeholder="Enter Here.."
                            // value={upperRightX}
                            value={
                              upperRightX
                                ? parseFloat(upperRightX).toFixed(4)
                                : ""
                            }
                            onChange={handleLocationChange}
                          />
                          {locationError.upperRightX && (
                            <span className="invalid-feedback">
                              {locationError.upperRightX}
                            </span>
                          )}
                          {/* </div> */}
                        </span>
                        <span className="upper-y-label">
                          <p className="firstl2p m-0 p-0">
                            Upper Right Y (Latitude) in DD
                          </p>
                        </span>
                        <span className="upper-y-Input">
                          {/* <input type="text" className='input-box firstl2InputBox' placeholder="value" /> */}

                          {/* <div className="input-upper-right-y"> */}
                          <input
                            type="numbers"
                            id="upperrighty"
                            // className="input-UpperRight-Y-inDD"
                            className={`input-UpperRight-Y-inDD ${
                              locationError.upperRightY ? "is-invalid" : ""
                            }`}
                            placeholder="Enter Here.."
                            // value={upperRightY}
                            value={
                              upperRightY
                                ? parseFloat(upperRightY).toFixed(4)
                                : ""
                            }
                            maxLength={10}
                            name="upperRightY"
                            onChange={handleLocationChange}
                          />
                          {locationError.upperRightY && (
                            <span className="invalid-feedback">
                              {locationError.upperRightY}
                            </span>
                          )}
                          {/* </div> */}
                        </span>

                        <span className="lower-x-label">
                          <p className="m-0 p-0 lower-x-label-p">
                            Lower Left X (Longitude) in DD
                          </p>
                        </span>
                        <span className="lower-x-Input">
                          {/* <input type="text" className='input-box firstInputBox' placeholder="value" /> */}
                          {/* <div className="input-lower-left-x"> */}
                          {locationError.lowerLeftX && (
                            <span className="invalid-feedbackbolefx">
                              {locationError.lowerLeftX}
                            </span>
                          )}
                          <input
                            type="numbers"
                            id="lowerleftx"
                            // className="input-LowerLeft-X-inDD"
                            className={`input-LowerLeft-X-inDD ${
                              locationError.lowerLeftX ? "is-invalid" : ""
                            }`}
                            placeholder="Enter Here.."
                            // value={lowerLeftX}
                            value={
                              lowerLeftX
                                ? parseFloat(lowerLeftX).toFixed(4)
                                : ""
                            }
                            name="lowerLeftX"
                            onChange={handleLocationChange}
                          />
                          {/* </div> */}
                        </span>

                        <span className="Lower-y-label">
                          <p className="m-0 p-0 secondp">
                            Lower Left Y (Latitude) in DD
                          </p>
                        </span>
                        <span className="Lower-y-Input">
                          {/* <input type="text" className='input-box secondInputBox' placeholder="value" /> */}

                          {/* <div className="input-lower-left-y"> */}
                          {locationError.lowerLeftY && (
                            <span className="invalid-feedbackbolefy">
                              {locationError.lowerLeftY}
                            </span>
                          )}
                          <input
                            type="numbers"
                            id="lowerlefty"
                            // className="input-LowerLeft-Y-inDD"
                            className={`input-LowerLeft-Y-inDD ${
                              locationError.lowerLeftY ? "is-invalid" : ""
                            }`}
                            placeholder="Enter Here.."
                            // value={lowerLeftY}
                            value={
                              lowerLeftY
                                ? parseFloat(lowerLeftY).toFixed(4)
                                : ""
                            }
                            name="lowerLeftY"
                            onChange={handleLocationChange}
                          />
                          {/* </div> */}
                        </span>
                      </fieldset>

                      {/* "View on Map" Button */}
                      <div className="ViewMap3">
                        <button
                          className="view-map3"
                          id="view_ma3"
                          onClick={handleViewMapClickPolyGon}
                        >
                          VIEW ON MAP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Input selection for 'SELECT LOCATION ON MAP' */}

                  <div
                    className={`input-select-location-on-map ${
                      selectLocation ? "" : "hidden"
                    }`}
                  >
                    {/* "Click on Map" Button */}

                    <div className="drawOn-map-Para">
                      <p className="mb-0">
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="bullet-circle-icon"
                        />{" "}
                        Use the DRAW Menu on the map to draw a point, line or a
                        polygon.
                      </p>
                      <p className="mb-0">
                        <FontAwesomeIcon
                          icon={faCircle}
                          className="bullet-circle-icon"
                        />{" "}
                        Only one shape can be drawn at a time.
                      </p>

                      {/* <ul>
                        <li>Use the DRAW Menu on the map to draw a point, line or a polygon.</li>
                        <li>Only one shape can be drwan at a time.</li>
                      </ul> */}
                    </div>

                    <div className="second-input-Y-on-mapBuffer">
                      <fieldset className="xyLocation-fieldset">
                        <legend className="xyLocation-legend ">
                          <input
                            type="checkbox"
                            className="Leg-square-icon"
                            checked={isBufferEnabledDraw}
                            onChange={handleBufferCheckboxChangeDraw}
                          />
                          &nbsp; BUFFER Search:
                        </legend>
                        <div className="Buffer-div">
                          <div className="buffer-type-col">
                            <div className="Buffer-inner-row">
                              <div className="Label-buffer-type">
                                <label
                                  className="LAbelOf-Buffer"
                                  htmlFor="aoiFileInput"
                                >
                                  Buffer Type:
                                </label>
                              </div>
                              <div className="circle-box-btn">
                                <button
                                  className={`Buff-search-btn1 ${
                                    selectedShapeDraw === "CIRCLE"
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleShapeSelectionDraw("CIRCLE")
                                  }
                                >
                                  CIRCLE
                                </button>
                                <button
                                  className={`Buff-search-btn2 ${
                                    selectedShapeDraw === "BOX" ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    handleShapeSelectionDraw("BOX")
                                  }
                                >
                                  BOX
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="buffer-Dist-unit-col">
                            <div className="Buff-dist-row">
                              <div className="buff-dist-l">
                                <label
                                  className="LAbelOf-Buffer"
                                  htmlFor="bufferDistance"
                                >
                                  Buffer Distance:
                                </label>
                              </div>
                              <div className="buff-dist-Input-div">
                                <input
                                  className=" Buffer-dist-input"
                                  type="number"
                                  id="bufferDistancedraw"
                                  placeholder="Value"
                                  defaultValue={1}
                                  min={1} // Minimum value set to 1
                                  step={1} // Step value for increment
                                />
                              </div>
                            </div>
                            <div className="Buff-unit-row">
                              <div className="buff-unit-label">
                                <label
                                  className="LAbelOf-Buffer"
                                  htmlFor="bufferUnit"
                                >
                                  Buffer Unit:
                                </label>
                              </div>
                              <div className="buff-unit-input">
                                <select
                                  id="bufferUnitdraw"
                                  className="OptionsSearch"
                                  defaultValue="kilometers"
                                >
                                  <option value="kilometers">kilometers</option>
                                  <option value="degrees">degrees</option>
                                  <option value="miles">miles</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                    <div className="Selected-XY-on-map">
                      <div className="first-input-X-on-map">
                        <label className="selectedexlongitudeindegreedecimal_label">
                          Give The Tile Name
                        </label>
                        <div className="Draw-on-fileName-Input-div">
                          <input
                            id="path"
                            className="DrawOn-File-Name-Input"
                            placeholder="Give File Name"
                            value={fileName}
                            onChange={handleFileNameChange}
                          />
                          <div
                            className="DrawOn-File-custom-file-div"
                            onClick={handleSelectFolder}
                          >
                            <label className="DrawOnMap-custom-file-upload">
                              <FontAwesomeIcon
                                className="DrawOnMap-UploadIcon"
                                icon={faWindowRestore}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="second-input-Y-on-map">
                        <label className="selectedylatitudeindegreedecimal_label">
                          File Format
                        </label>
                        <div className="y-coordinates-input">
                          <select
                            className="OptionsSearch"
                            value={fileFormat}
                            onChange={handleFileFormatChange}
                          >
                            <option disabled selected="selected" value="">
                              Select File format
                            </option>
                            <option value="shapefile">ShapeFile</option>
                            <option value="kml">KML</option>
                            <option value="geojson">GeoJSON</option>
                            {/* <option value="zip">ZIP (All formats)</option> */}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="Save-Geo-btn-div">
                      <button
                        className="GEOMETRY-map-btn"
                        id="click_map"
                        onClick={downloadDrawnShapes}
                      >
                        SAVE GEOMETRY
                      </button>
                    </div>
                  </div>
                </fieldset>
              </div>{" "}
              {/* Closed div - spatialSearch-fieldset-DIV */}
              {/* Search Attribute Container */}
              <div
                className="searchByAttributeContainer"
                onClick={closeDropdown}
              >
                {/* <div className='searchByAttributeContainerheadingbox'>
                  <span className='searchByAttributeContainerheading'>Search By Attribute:</span>
                </div> */}

                <fieldset class="Attribute-search-fieldset ">
                  <legend class="Attribute-search-legend">
                    ATTRIBUTE Search
                  </legend>
                  <div className="Att-search-fieldset-div">
                    <fieldset class="xyLocation-fieldset">
                      <legend class="xyLocation-legend">PRODUCT Search</legend>
                      <div className=" Product-div">
                        {/* <div className='container-fluid'>
                      <div className='row'>
                        <div className='col'><h5>hello</h5></div>
                        <div className='col'><h5>hello</h5></div>
                        <div className='col'><h5>hello</h5></div>
                        <div className='col'><h5>hello</h5></div>
                      </div>
                      </div> */}

                        {/* <div className='container-fluid'> */}
                        <div className="productSearcInputBox">
                          <div className="col atrribute-search-col">
                            <label className="productsearchlable1">
                              {/* <span className="required-field">*</span> */}
                              COMPANY Selection:{" "}
                            </label>

                            <select
                              name="COMP_NA"
                              id="COMP_NA"
                              value={formData.COMP_NA || ""}
                              onChange={handleSubjectChange}
                              className="InpuSelectionOption"
                              // required
                            >
                              <option
                                value=""
                                selected="selected"
                                className="InpuSelectionOption"
                                disabled
                              >
                                Select Option..
                              </option>
                              {Object.keys(subjectObject).map((COMP_NA) => (
                                <option key={COMP_NA} value={COMP_NA}>
                                  {COMP_NA}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col atrribute-search-col">
                            <label className="productsearchlable">
                              {/* <span className="required-field">*</span> */}
                              DATA TYPE Selection:
                            </label>

                            <select
                              name="topic"
                              id="topic"
                              value={formData.topic || ""}
                              onChange={handleTopicChange}
                              className="InpuSelectionOption-DataType"
                              // required
                            >
                              <option value="" selected="selected" disabled>
                                {formData.topic
                                  ? formData.topic
                                  : "Select Option.."}
                              </option>
                              {subjectObject[COMP_NA] &&
                                Object.keys(subjectObject[COMP_NA]).map(
                                  (topic) => (
                                    <option key={topic} value={topic}>
                                      {topic}
                                    </option>
                                  )
                                )}
                            </select>
                          </div>

                          {/* _________________________________ */}

                          <div className="col atrribute-search-col">
                            <label className="productsearchlable">
                              MISSION Selection:
                            </label>
                            <div
                              className={`InpuSelectionOption-Mission-Drop ${
                                !topic ? "disabled" : ""
                              }`}
                              onClick={handleDropdownClick}
                            >
                              {topic !== ""
                                ? formData.SEN_NAME.length !== 0
                                  ? formData.SEN_NAME.join(", ").slice(0, 10) +
                                    (formData.SEN_NAME.join(", ").length > 10
                                      ? "..."
                                      : "")
                                  : "Select Option"
                                : formData.SEN_NAME
                                ? formData.SEN_NAME
                                : "Select Option.."}
                              <span className="dropdown-icon">
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  className="iconfaChevronDown"
                                />
                              </span>
                            </div>
                            {topic && isDropdownOpen && (
                              <div
                                className="InpuSelectionOption-Mission-DropDown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {subjectObject[COMP_NA][topic].map((chap) => (
                                  <div
                                    key={chap}
                                    className="dropdown-item checkbox-hover"
                                  >
                                    <label className="checkbox-label">
                                      <input
                                        className="InpuSelectionOption-Mission"
                                        type="checkbox"
                                        value={chap}
                                        checked={formData.SEN_NAME.includes(
                                          chap
                                        )}
                                        onChange={() => handleOptionClick(chap)}
                                      />
                                      {chap}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* _________________________________ */}

                          {/* <div className='AcquisitionModeBox'> */}
                          <div className="col atrribute-search-col">
                            <label className="AcquisitionModelabel">
                              {/* <span className="required-field">*</span> */}
                              ACQUISITION Mode:
                            </label>
                            {/* <div> */}
                            <select
                              name="SAT_NO"
                              id="AcquisitionMode"
                              // value={topic}
                              // value={formData.AcquisitionMode}
                              onChange={handleInputChange}
                              className="InpuSelectionOption-AcquisitionMode"
                              // required
                              ref={AcquisitionModeListselectRef}
                              disabled={
                                COMP_NA === "SENTINEL" ||
                                COMP_NA === "PLANET" ||
                                topic === "SAR" ||
                                topic === "ELEVATION"
                              }
                            >
                              <option value="" selected="selected" disabled>
                                {formData.SAT_NO
                                  ? formData.SAT_NO
                                  : "Select Option.."}
                              </option>
                              {AcquisitionModeList.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            {/* </div> */}
                          </div>

                          {/* </div> */}
                        </div>
                        {/* </div> */}
                      </div>
                    </fieldset>

                    <fieldset class="xyLocation-fieldset">
                      <legend class="xyLocation-legend">PERIOD Search</legend>
                      <div className="Period-search-container">
                        <div className="periodSearchInputBox">
                          <div className="col-3 startDateperiodSearch">
                            <label className="periodStartlable">
                              START Date:
                            </label>

                            <div className="date-input-wrapper">
                              <div className="date-container">
                                <DatePicker
                                  className="startDateINputFiled"
                                  ref={startDatedatePickerRef}
                                
                                  selected={
                                    formData.startDate
                                      ? new Date(formData.startDate)
                                      : null
                                  }
                                  onChange={startDatehandleDateChange}
                                  placeholderText="Select Date"
                                  maxDate={formData.endDate || new Date()}
                                  dateFormat="dd/MM/yyyy"
                                  scrollableYearDropdown 
                                  showYearDropdown
                                  showMonthDropdown
                                  customInput={
                                    <input
                                      name="startDate"
                                      id="date"
                                      type="text"
                                      readOnly={true}
                                      value={formData.startDate || ""}
                                      onChange={handleInputChange}
                                      onMouseDown={startDatehandleInputClick}
                                      onInput={handleInputChangestartDate} // Filter allowed characters
                                      onKeyDown={startDatehandlePreventInput} // Prevent manual typing in the field
                                    />
                                  }
                                  open={startDatecalendarOpen}
                                  onClickOutside={() =>
                                    startDatesetCalendarOpen(false)
                                  }
                                  yearDropdownItemNumber={45} 
                                />

                                <img
                                  // src='/GNCalander_128.png'
                                  src={GNCalendar}
                                  alt="Calendar Icon"
                                  className="date-icon"
                                  onClick={startDatehandleIconClick}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-3 endDateperiodSearch">
                            <label className="periodEndlable">END Date:</label>

                            {/* <input
                                type="date"
                                className="ENDDateINputFiled enchilada"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                min={formData.startDate || ""}
                                max={currentDate}
                              /> */}

                            <div className="date-input-wrapper">
                              <div className="date-container">
                                <DatePicker
                                  className="ENDDateINputFiled"
                                  ref={datePickerRef}
                                  // selected={selectedDate}
                                  selected={
                                    formData.endDate
                                      ? new Date(formData.endDate)
                                      : null
                                  }
                                  onChange={handleDateChange}
                                  placeholderText="Select Date"
                                  // min={formData.startDate || ""}
                                  // max={currentDate}

                                  // minDate={formData.startDate}
                                  minDate={startDateselectedDate}
                                  maxDate={new Date()}
                                  dateFormat="dd/MM/yyyy"
                                  customInput={
                                    <input
                                      name="endDate"
                                      id="date"
                                      type="text"
                                      // placeholder="Select a date"
                                      readOnly={true}
                                      value={formData.endDate || ""}
                                      onChange={handleInputChange}
                                      onMouseDown={handleInputClick}
                                      onInput={handleInputChangeEndDate}
                                      onKeyDown={handlePreventInput}
                                    />
                                  }
                                  open={calendarOpen}
                                  onClickOutside={() => setCalendarOpen(false)}
                                  yearDropdownItemNumber={45} // Number of years to display in dropdown
                                  scrollableYearDropdown // Allows scrolling through years
                                  showYearDropdown // Show the year dropdown
                                  showMonthDropdown
                                />
                                {/* <i
                                  className="date-icon fa fa-calendar"
                                  aria-hidden="true"
                                  onClick={EndDatehandleIconClick}
                                /> */}

                                <img
                                  // src='/GNCalander_128.png'
                                  src={GNCalendar}
                                  alt="Calendar Icon"
                                  className="date-icon"
                                  onClick={EndDatehandleIconClick}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset class="xyLocation-fieldset">
                      <legend class="xyLocation-legend">
                        OTHER PARAMETER Search
                      </legend>
                      {/* <div className='container-fluid'> */}
                      <div className="Other-para-row">
                        <div className="col Other-para-col">
                          <label className="OtherParamSearcHlable mb-2">
                            RESOLUTION (m):
                          </label>
                          <div style={{ display: "flex", gap: "3px" }}>
                            <input
                              type="number"
                              className="ResoluationInputFiled"
                              placeholder="Min"
                              name="D_PIXELX_MIN"
                              value={formData.D_PIXELX_MIN}
                              onChange={handleInputChange}
                              min="0.0"
                              max={
                                formData.D_PIXELX_MAX !== ""
                                  ? parseFloat(formData.D_PIXELX_MAX).toFixed(2)
                                  : ""
                              }
                              step="0.1"
                            />{" "}
                            -
                            <input
                              type="number"
                              className="ResoluationInputFiled"
                              placeholder="Max"
                              name="D_PIXELX_MAX"
                              value={formData.D_PIXELX_MAX}
                              onChange={handleInputChange}
                              min={
                                formData.D_PIXELX_MIN !== ""
                                  ? parseFloat(formData.D_PIXELX_MIN).toFixed(2)
                                  : ""
                              }
                              max={999}
                              step="0.1"
                            />
                          </div>
                        </div>

                        <div className="col Other-para-col">
                          <label className="OtherParamSearcHlable">
                            <FontAwesomeIcon icon={faCloud} />
                            &nbsp; CLOUD Cover(%):&nbsp;{" "}
                            <span> {formData.DCLOUD || "100"}%</span>
                          </label>
                          <input
                            className="CloudCoverINputFiled"
                            type="range"
                            min="0"
                            max="100"
                            value={formData.DCLOUD || "100"}
                            onChange={updateCloudCover}
                            // disabled={!isCheckboxCheckedCloud}
                          />
                        </div>

                        <div className="col Other-para-col">
                          <label className="OtherParamSearcHlable">
                            <FontAwesomeIcon icon={faSnowflake} />
                            &nbsp; SNOW Cover(%):&nbsp;{" "}
                            <span> {formData.DSNOW || "100"}%</span>
                          </label>
                          <input
                            className="SnowCoverINputFiled"
                            type="range"
                            min="0"
                            max="100"
                            value={formData.DSNOW || "100"}
                            onChange={updateSnowCover}
                            // disabled={!isCheckboxCheckedSnow}
                          />
                        </div>
                      </div>
                      {/* </div> */}
                    </fieldset>

                    <fieldset class="xyLocation-fieldset">
                      <legend class="xyLocation-legend">
                        ADDITIONAL ATTRIBUTE Search
                      </legend>
                      {/* <div className='Additional-attri-cont'> */}
                      <div className="Additional-attri-div">
                        <div className="col-4 data-processing-div">
                          <label className="Dataprocesslable">
                            DATA PROCESSING Type
                          </label>
                          {/* <div> */}
                          <select
                            name="IMG_DATYPE"
                            value={formData.IMG_DATYPE}
                            className="dataProcessingTypeINputFiled"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                IMG_DATYPE: [e.target.value],
                              })
                            }
                          >
                            <option value="" selected="selected" disabled>
                              Select Type..
                            </option>
                            <option>SENSOR</option>
                            <option>PROJECTED</option>
                            <option>ORTHO</option>
                          </select>
                          {/* </div> */}
                        </div>

                        <div className="col-4 data-incidence-div">
                          <label className="addiAttriSearchlable">
                            DATA INCIDENCE Angle (°)
                          </label>
                          <div style={{ display: "flex", gap: "3px" }}>
                            <input
                              type="number"
                              className="daInceAngleINputFiled"
                              placeholder="Min"
                              name="D_IN_ANGL_MIN"
                              value={formData.D_IN_ANGL_MIN}
                              onChange={handleInputChange}
                              min="0.0"
                              max={
                                formData.D_IN_ANGL_MAX !== ""
                                  ? parseFloat(formData.D_IN_ANGL_MAX).toFixed(
                                      2
                                    )
                                  : ""
                              }
                              step="0.1"
                            />{" "}
                            -
                            <input
                              type="number"
                              className="daInceAngleINputFiled"
                              placeholder="Max"
                              name="D_IN_ANGL_MAX"
                              value={formData.D_IN_ANGL_MAX}
                              onChange={handleInputChange}
                              min={
                                formData.D_IN_ANGL_MIN !== ""
                                  ? parseFloat(formData.D_IN_ANGL_MIN).toFixed(
                                      2
                                    )
                                  : ""
                              }
                              max={90}
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                      {/* </div> */}
                    </fieldset>
                  </div>
                </fieldset>
              </div>
              {/* Button Div */}
              <div className="button-search">
                {/* <div className='row' > */}

                <div className="Get-save-querybtn-div">
                  <div className="mb-4">
                    <Tooltip title="Save query" placement="bottom"  mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                    >
                      {" "}
                      <button
                        type="submit"
                        className="save-query-btn"
                        onClick={saveQueryData}
                      >
                        SAVE QUERY
                      </button>
                    </Tooltip>
                  </div>
                  {/* <div className="mb-2">
                    <button type="button" className="get-query-btn" >
                      GET QUERY
                    </button>
                  </div> */}

                  <div className="mb-2">
                    <Tooltip title=" Get query" placement="bottom"  mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} >
                      {" "}
                      <button
                        type="button"
                        className="get-query-btn"
                        onClick={handleGetQuery}
                      >
                        {" "}
                        GET QUERY
                      </button>{" "}
                    </Tooltip>
                    {/* Button to trigger file upload */}
                    <input
                      type="file"
                      accept=".json" // Restrict file input to JSON files
                      onChange={handleGsonUpload}
                      ref={fileInputRef} // Attach the ref to the file input element
                      style={{ display: "none" }} // Hide the file input element
                    />
                    {/* {uploadedData && (
                      <div>
                        <h4>Extracted Data:</h4>
                        <pre>{JSON.stringify(uploadedData)}</pre>
                      </div>
                    )} */}
                  </div>
                </div>

                <div className="applyQuery-btn-div">
                  <div className="mb-4">
                    <Tooltip title=" Apply query" placement="bottom" mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                    >
                      {" "}
                      <button
                        type="submit"
                        className="apply-query-btn"
                        onClick={handleFormSubmit}
                      >
                        APPLY QUERY
                      </button>
                    </Tooltip>
                  </div>

                  <div className="container-fluid mb-2">
                    <div className="row reset-quit-btn-div">
                      <div className="col resetbtn-div">
                        <Tooltip
                          className="mb-0 pb-0"
                          title="Reset Data"
                          placement="bottom"
                          mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                          mouseLeaveDelay={0.5} // Delay before the tooltip disappears
                          overlayStyle={{ position: "relative", top: "-108px" }}
                        >
                          <button
                            type="button"
                            className="rest-btn"
                            onClick={handleReset}
                          >
                            RESET
                          </button>
                        </Tooltip>
                      </div>
                      <div className="col quitbtn-div">
                        <Tooltip title="Quite" placement="bottom"
                         mouseEnterDelay={1} // Delay in seconds before the tooltip appears
                         mouseLeaveDelay={0.5} // Delay before the tooltip disappears 
                        >
                          {" "}
                          <button
                            type="button"
                            className="quit-btn"
                            onClick={handleQuit}
                          >
                            QUIT
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                {/* </div> */}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Map Portion */}
        <div class="Search-box-2">
          {/* <div id="searchMap" className="mapbox"> */}
          {/* <div className='Search-map-mainDiv'> */}
          {/* <fieldset class="Map-Search-fieldset">
                  <legend class="Map-Search-legend mx-1">MARS DATA SEARCH MAP</legend> */}

          {/* <div> */}
          <div
            id={responseData === null ? "searchMap" : "searchMap1"}
            className="Search-mapbox"
            style={{
              height: responseData === null ? "100%" : "65%",
            }}
          >
            <div id="SearchCoordinate">Lng:78.96 Lat:20.59</div>
            <div className="leaflet-bottom leaflet-left OurTool">
              <div className="leaflet-pm-toolbar leaflet-pm-fullextent leaflet-bar leaflet-control">
                <Tooltip title=" Selected ZoomIn" placement="right">
                  {" "}
                  <div
                    className="button-container pos-right"
                    id="recZoomIN"
                    // title="Selected ZoomIn"
                    onClick={toggleRectangleDrawingZoomIn}
                  >
                    <a
                      className={`leaflet-buttons-control-button ${
                        drawingRectangleZoomIn ? "active-btn" : ""
                      }`}
                    >
                      <div className="control-icon leaflet-pm-icon-SelectedZoomIn"></div>
                    </a>
                  </div>
                </Tooltip>
                <Tooltip title=" Selected ZoomOut" placement="right">
                  <div
                    className="button-container pos-right"
                    // title="Selected ZoomOut"
                    onClick={toggleRectangleDrawingZoomOut}
                  >
                    <a
                      className={`leaflet-buttons-control-button ${
                        drawingRectangleZoomOut ? "active-btn" : ""
                      }`}
                    >
                      <div className="control-icon leaflet-pm-icon-SelectedZoomOut"></div>
                    </a>
                  </div>
                </Tooltip>
                <Tooltip title=" Pan" placement="right">
                  <div
                    className="button-container pos-right"
                    // title="Pan"
                    onClick={handlePanToggle}
                  >
                    <a
                      className={`leaflet-buttons-control-button ${
                        isPanningEnabled ? "active-btn" : ""
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
                <Tooltip title=" Fixed ZoomIn" placement="right">
                  {" "}
                  <div
                    className="button-container  pos-right"
                    // title="Fixed ZoomIn"
                    onClick={handleFixedZoomIn}
                  >
                    <a className="leaflet-buttons-control-button">
                      <div className="control-icon leaflet-pm-icon-FixedZoomIn"></div>
                    </a>
                  </div>
                </Tooltip>

                <Tooltip title=" Fixed ZoomOut" placement="right">
                  {" "}
                  <div
                    className="button-container  pos-right"
                    // title="Fixed ZoomOut"
                    onClick={handleFixedZoomOut}
                  >
                    <a className="leaflet-buttons-control-button">
                      <div className="control-icon leaflet-pm-icon-FixedZoomOut"></div>
                    </a>
                  </div>
                </Tooltip>

                <Tooltip title=" GoToPreviousExtent" placement="right">
                  <div
                    className="button-container  pos-right"
                    // title="GoToPreviousExtent"
                    onClick={handlePreviousExtent}
                  >
                    <a className="leaflet-buttons-control-button">
                      <div className="control-icon leaflet-pm-icon-GoToPreviousExtent"></div>
                    </a>
                  </div>
                </Tooltip>
                <Tooltip title=" GoToNextExtent" placement="right">
                  {" "}
                  <div
                    className="button-container  pos-right"
                    // title="GoToNextExtent"
                    onClick={handleNextExtent}
                  >
                    <a className="leaflet-buttons-control-button">
                      <div className="control-icon leaflet-pm-icon-GoToNextExtent"></div>
                    </a>
                  </div>
                </Tooltip>
                <Tooltip title=" ZoomSelected" placement="right">
                  {" "}
                  <div
                    className="button-container  pos-right"
                    // title="ZoomSelected"
                    onClick={zoomToLayerSelected}
                  >
                    <a className="leaflet-buttons-control-button">
                      <div className="control-icon leaflet-pm-icon-ZoomSelected"></div>
                    </a>
                  </div>
                </Tooltip>
                <Tooltip title=" Full Extent" placement="right">
                  {" "}
                  <div
                    className="button-container  pos-right"
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
            {/* <MapTools mapRef={mapRef} onDataFromChild={extractCoordinates} setFieldsEnabled={setFieldsEnabled} /> */}
            {/* <div className="ui-widget" id="search">
                  <input id="autocomplete" placeholder="Search for: State" style={{ display: autocompleteVisible ? 'inline-block' : 'none' }} />
                  <i class="fa fa-search" aria-hidden="true" id="SearchButton" onClick={toggleAutocomplete}></i>
                </div> */}
          </div>
          {/* </div> */}
          {/* </fieldset> */}
          {/* </div> */}

          {/* <MapTools onDataFromChild={handleDataFromChild} responseData={responseData} /> */}

          {/* Table Code  Part*/}

          {responseData && responseData.length > 0 ? (
            <div className="Search-Table d-flex">
              <div className="Container_Table">
                <div className="searchTableHeadingBox">
                  <h4 className="search-table-heading">Search Data Table</h4>
                  <div onClick={handleReset} className="searchTableClaoseIcon">
                    <FontAwesomeIcon icon={faXmark} title="Close Table" />
                  </div>
                </div>

                {/* <div className='Table-Scroll-Search'> */}
                {/* <table className="tableStyle">
                      <thead>
                        <tr >
                          <th className='search-table-font'>SR NO</th>
                          <th className='search-table-font search-th-1'>Selection</th>
                          <th className='search-table-font'>DATACODE</th>
                          <th className='search-table-font'>DATANAME</th>
                          <th className='search-table-font'>DSIZE</th>
                          <th className='search-table-font'>COMP_NA</th>
                          <th className='search-table-font'>SATT_NA</th>
                          <th className='search-table-font'>SEN_NAME</th>
                          <th className='search-table-font'>ACQUISITION</th>
                          <th className='search-table-font'>D_PIXELXY</th>
                          <th className='search-table-font'>D_IN_ANGL</th>
                          <th className='search-table-font'>DCLOUD</th>
                          <th className='search-table-font'>IMG_DATE</th>
                          <th className='search-table-font'>IMG_DAPROC</th>
                          <th className='search-table-font'>IMG_DATYPE</th>
                          <th className='search-table-font'>IMG_PREVIEW</th>

                          <th style={{ paddingLeft: '4vh', fontSize: '11px' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      {responseData && responseData.length > 0 ? (

                        <tbody>
                          {responseData.map((item, index) => (
                            <tr
                              key={index}
                              id={`row-${index}`}
                              style={{
                                backgroundColor: highlightedRowIndex === index ? '#FFD700' : getRowBackgroundColor(index),
                              }}
                            >
                              <td className='Search-SRNO'>{index + 1}</td>
                              <td className='Search-TD'>
                                <input type="checkbox" onChange={() => handleCheckboxChange(index, item.id)}
                                  checked={Array.isArray(selectedRows) && selectedRows.includes(index)}
                                />
                              </td>
                              <td className='Search-TD'>{item.id}</td>
                              <td className='Search-TD-1'>{item.DATANAME.length > 400 ? `${item.DATANAME.slice(0, 400)}....` : item.DATANAME}</td>
                              <td className='Search-TD'>{item.DSIZE}</td>
                              <td className='Search-TD'>{item.COMP_NA}</td>
                              <td className='Search-TD'>{item.SATT_NA}</td>
                              <td className='Search-TD'>{item.SEN_NAME}</td>
                              <td className='Search-TD'>{item.SAT_NO}</td>
                              <td className='Search-TD'>{item.D_PIXELX}</td>
                              <td className='Search-TD'>{item.D_IN_ANGL}</td>
                              <td className='Search-TD'>{item.DCLOUD}</td>
                              <td className='Search-TD'>{item.IMG_DATE}</td>
                              <td className='Search-TD'>{item.IMG_DAPROC}</td>
                              <td className='Search-TD'>{item.IMG_DATYPE}</td>
                              <td className="Search-TD">
                                <ImageModal image={item} />
                              </td>
                              <td className='Search-TD' style={{ width: '10%' }}>
                                <div className="SearchActionsButtons">
                                  <div className='Action-LayerToggle'>
                                    <i
                                      className={`fa ${layerVisibility[index] ? 'fa-eye-slash' : 'fa-eye'}`}
                                      title={layerVisibility[index] ? 'Show layer' : 'Hide layer'}
                                      onClick={() => handleLayerToggle(index)}
                                    ></i>
                                  </div>
                                  <div className='Action-Popup'>
                                    <i
                                      className="fa fa-info-circle ProductInfo"
                                      title="Product info"
                                      onClick={() => newOpenPopup(index, item.id)}
                                    ></i>
                                  </div>
                                  <div className='Action-ZoomIn'>
                                    <i
                                      className="fa fa-crosshairs"
                                      title="Zoom to product"
                                      onClick={() => handleZoomIn(index)}
                                    ></i>
                                  </div>
                                  <div className='Action-Download'>
                                    <i className="fa fa-download" title="Download Product Report PDF" onClick={() => handleDownloadClick(index)}></i>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                      ) : (
                        <tr>No data found.</tr>
                      )}
                    </table> */}
                <div className="Table-Scroll-Search">
                  <table className="tableStyle">
                    <thead>
                      <tr>
                        <th className="search-table-font">SR NO</th>
                        <th className="search-table-font search-th-1">
                          Selection
                        </th>
                        <th
                          style={{
                            marginLeft: "4px",
                            fontSize: "11px",
                            top: "-2px",
                          }}
                        >
                          ACTIONS
                        </th>
                        <th className="search-table-font">IMG_PREVIEW</th>
                        <th className="search-table-font">DATACODE</th>
                        <th className="search-table-font">DATANAME</th>
                        <th className="search-table-font">DSIZE</th>
                        <th className="search-table-font">COMP_NA</th>
                        <th className="search-table-font">SATT_NA</th>
                        <th className="search-table-font">SEN_NAME</th>
                        <th className="search-table-font">ACQUISITION</th>
                        <th className="search-table-font">D_PIXELXY</th>
                        <th className="search-table-font">D_IN_ANGL</th>
                        <th className="search-table-font">DCLOUD</th>
                        <th className="search-table-font">IMG_DATE</th>
                        <th className="search-table-font">IMG_DAPROC</th>
                        <th className="search-table-font">IMG_DATYPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responseData.map((item, index) => (
                        <tr
                          key={index}
                          id={`row-${index}`}
                          style={{
                            backgroundColor:
                              highlightedRowIndex === index
                                ? "#FFD700"
                                : getRowBackgroundColor(index),
                          }}
                        >
                          <td className="Search-SRNO">{index + 1}</td>
                          <td className="Search-TD">
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleCheckboxChange(index, item.id)
                              }
                              checked={
                                Array.isArray(selectedRows) &&
                                selectedRows.includes(index)
                              }
                            />
                          </td>
                          <td className="Search-TD" style={{ width: "10%" }}>
                            <div className="SearchActionsButtons">
                              <div className="Action-LayerToggle">
                                <i
                                  className={`fa ${
                                    layerVisibility[index]
                                      ? "fa-eye-slash"
                                      : "fa-eye"
                                  }`}
                                  title={
                                    layerVisibility[index]
                                      ? "Show layer"
                                      : "Hide layer"
                                  }
                                  onClick={() => handleLayerToggle(index)}
                                ></i>
                              </div>
                              <div className="Action-Popup">
                                <i
                                  className="fa fa-info-circle ProductInfo"
                                  title="Product info"
                                  onClick={() => newOpenPopup(index, item.id)}
                                ></i>
                              </div>
                              <div className="Action-ZoomIn">
                                <i
                                  className="fa fa-crosshairs"
                                  title="Zoom to product"
                                  onClick={() => handleZoomIn(index)}
                                ></i>
                              </div>
                              <div className="Action-Download">
                                <i
                                  className="fa fa-download"
                                  title="Download Product Report PDF"
                                  onClick={() => handleDownloadClick(index)}
                                ></i>
                              </div>
                            </div>
                          </td>
                          <td className="Search-TD">
                            <ImageModal image={item} />
                          </td>
                          <td className="Search-TD">{item.id}</td>
                          <td className="Search-TD-1">
                            {item.DATANAME.length > 400
                              ? `${item.DATANAME.slice(0, 400)}....`
                              : item.DATANAME}
                          </td>
                          <td className="Search-TD">{item.DSIZE}</td>
                          <td className="Search-TD">{item.COMP_NA}</td>
                          <td className="Search-TD">{item.SATT_NA}</td>
                          <td className="Search-TD">{item.SEN_NAME}</td>
                          <td className="Search-TD">{item.SAT_NO}</td>
                          <td className="Search-TD">{item.D_PIXELX}</td>
                          <td className="Search-TD">{item.D_IN_ANGL}</td>
                          <td className="Search-TD">{item.DCLOUD}</td>
                          <td className="Search-TD">{item.IMG_DATE}</td>
                          <td className="Search-TD">{item.IMG_DAPROC}</td>
                          <td className="Search-TD">{item.IMG_DATYPE}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* </div> */}
              </div>

              {/* </div> */}
            </div>
          ) : null}

          {/* </div> */}
        </div>
      </div>

      {/* </div > */}

      {/* </div> */}
      {/* </div> */}

      <div
        id="newpopup"
        className="SearchNewPopup"
        style={{ display: newpopupVisible ? "block" : "none" }}
      >
        <div className="newpopup-info-content">
          {/* <h3>Products information</h3>
            <span className="info-closed" onClick={newClosePopup}>❌</span> */}
          <div className="SearchNewfromheader">
            <div style={{ display: "inline-flex", marginLeft: "301px" }}>
              <img src="logo.png" alt="Site Logo" width="28" height="28" />
              <h3 className="SearchNewformheading">Products Information</h3>
            </div>
            <div className="SearchNewclosebox">
              <span className="SearchNewclose" onClick={newClosePopup}>
                &#9932;
              </span>
            </div>
          </div>
          <div className="SearchProductTabs">
            <Card>
              <Card.Header
                onClick={() => handleCollapseToggle("collapse")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Product Info
                <FontAwesomeIcon
                  className="collapse-icon"
                  icon={collapseVisible ? faMinus : faPlus}
                />
              </Card.Header>
              <Collapse in={collapseVisible}>
                <div id="collapse-content">
                  {responseData && responseData.length > 0 ? (
                    responseData.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display:
                            selectedRowIndex === index ? "block" : "none",
                        }}
                        className="mainTableDataRespo"
                      >
                        <Card.Body
                          style={{
                            fontSize: "14px",
                            lineHeight: "1",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Code
                            </span>
                            : &nbsp;
                            <span>{item.id}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Name
                            </span>
                            : &nbsp;
                            <span>{item.DATANAME}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Company Name
                            </span>
                            : &nbsp;
                            <span>{item.COMP_NA}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Satellite Name{" "}
                            </span>
                            : &nbsp;
                            <span>{item.SATT_NA}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Sensor Name
                            </span>
                            : &nbsp;
                            <span>{item.SEN_NAME}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Image Date
                            </span>
                            : &nbsp;
                            <span>{item.IMG_DATE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Size
                            </span>
                            : &nbsp;
                            <span>{item.DSIZE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Image Data Process
                            </span>
                            : &nbsp;
                            <span>{item.IMG_DAPROC}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Image Data Type
                            </span>
                            : &nbsp;
                            <span>{item.IMG_DATYPE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Image Data
                            </span>
                            : &nbsp;
                            <span>{item.IMG_DATE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Area
                            </span>
                            : &nbsp;
                            <span>{item.DAREA}&nbsp;sqkm</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Size
                            </span>
                            : &nbsp;
                            <span>{item.DSIZE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              Data Area
                            </span>
                            : &nbsp;
                            <span>{item.DAREA}&nbsp;sqkm</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA FORMAT{" "}
                            </span>
                            : &nbsp;
                            <span>{item.DFORMAT}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              CLOUD COVERAGE{" "}
                            </span>
                            : &nbsp;
                            <span>{item.DCLOUD}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              SNOW COVERAGE{" "}
                            </span>
                            : &nbsp;
                            <span>{item.DSNOW}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              ACQUISITION RANGE{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_AQ_BITS}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              PROJECTION TABLE{" "}
                            </span>
                            : &nbsp;
                            <span>{item.DPRJ_TABLE}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              PROJECTION NAME{" "}
                            </span>
                            : &nbsp;
                            <span>{item.DPRJ_NAME}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA ROWS NO{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_NROWS}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA COLUMNS NO{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_NCOLS}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA BANDS NO{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_NBANDS}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA TILES NO{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_NTILES}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA BITS{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_NBITS}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              DATA SIGNAGE
                            </span>
                            : &nbsp;
                            <span>{item.D_SIGN}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              INCIDENCE ANGLE{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_IN_ANGL}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              GSD ACROSS PATH{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_GSD_AXT}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              GSD ALONG PATH{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_GSD_ALT}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              PIXEL IN X DIR{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_PIXELX}</span>
                          </p>
                          <p className="info-label">
                            <span
                              style={{
                                minWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "16px",
                              }}
                            >
                              PIXEL IN Y DIR{" "}
                            </span>
                            : &nbsp;
                            <span>{item.D_PIXELY}</span>
                          </p>
                        </Card.Body>
                      </div>
                    ))
                  ) : (
                    <Card.Body>No data found.</Card.Body>
                  )}
                </div>
              </Collapse>
            </Card>

            {/* Bands Information */}
            <Card>
              <Card.Header
                onClick={() => handleCollapseToggle("collapse1")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Bands Information
                <FontAwesomeIcon
                  className="collapse-icon"
                  icon={collapseVisible1 ? faMinus : faPlus}
                />
              </Card.Header>
              <Collapse in={collapseVisible1}>
                <div id="collapse-content">
                  {responseData && responseData.length > 0 ? (
                    responseData.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display:
                            selectedRowIndex === index ? "block" : "none",
                        }}
                      >
                        {item.marsbandinformation_set &&
                        item.marsbandinformation_set.length > 0 ? (
                          <table striped bordered hover>
                            <thead>
                              <tr>
                                <th>Sr No</th>
                                <th>Band Name</th>
                                <th>Spec Min List</th>
                                <th>Spec Max List</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.marsbandinformation_set.map(
                                (bandItem, bandIndex) => (
                                  <tr key={bandIndex}>
                                    <td>{bandIndex + 1}</td>
                                    <td>{bandItem.BAND_NAME}</td>
                                    <td>{bandItem.BAND_S_SPEC}</td>
                                    <td>{bandItem.BAND_E_SPEC}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <Card.Body>No bands information found.</Card.Body>
                        )}
                      </div>
                    ))
                  ) : (
                    <Card.Body>No data found.</Card.Body>
                  )}
                </div>
              </Collapse>
            </Card>

            {/* Bounds Information */}
            <Card>
              <Card.Header
                onClick={() => handleCollapseToggle("collapse2")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Bounds Information
                <FontAwesomeIcon
                  className="collapse-icon"
                  icon={collapseVisible2 ? faMinus : faPlus}
                />
              </Card.Header>
              <Collapse in={collapseVisible2}>
                <div id="collapse-content">
                  {responseData && responseData.length > 0 ? (
                    responseData.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display:
                            selectedRowIndex === index ? "block" : "none",
                        }}
                      >
                        {item.coordinates && item.coordinates.length > 0 ? (
                          <table striped bordered hover>
                            <thead>
                              <tr>
                                <th>Sr No</th>
                                <th>Latitude</th>
                                <th>Longitude</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.coordinates[0].map((coordinate, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{coordinate[1]}</td>
                                  <td>{coordinate[0]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <Card.Body>No coordinates data found.</Card.Body>
                        )}
                      </div>
                    ))
                  ) : (
                    <Card.Body>No data found.</Card.Body>
                  )}
                </div>
              </Collapse>
            </Card>

            {/* Privew Image */}
            {/* <Card>
                <Card.Header onClick={() => handleCollapseToggle('collapse3')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Preview Image<FontAwesomeIcon className="collapse-icon" icon={collapseVisible3 ? faMinus : faPlus} />
                </Card.Header>
                <Collapse in={collapseVisible3}>
                  <div id="collapse-content">
                    {responseData && responseData.length > 0 ? (
                      responseData.map((item, index) => (
                        <div key={index} style={{ display: selectedRowIndex === index ? 'block' : 'none' }}>
                          <div>
                            {item.IMG_PREVIEW ? (
                              <div style={{ height: '212px', overflow: 'auto' }}>
                                <img
                                  className="preview-image"
                                  src={`data:image/jpeg;base64,${item.IMG_PREVIEW}`} // Ensure correct MIME type (e.g., image/jpeg)
                                  alt="Preview Image"
                                />
                              </div>
                            ) : (
                              <p>No image preview available</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <Card.Body>No data found.</Card.Body>
                    )}
                  </div>
                </Collapse>
              </Card> */}
          </div>
        </div>
      </div>

      {/* </div > */}
    </>
  );
};

export default Search;
