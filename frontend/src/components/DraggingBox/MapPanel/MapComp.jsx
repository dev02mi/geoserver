import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet.vectorgrid";
import "leaflet-polylinedecorator";
import "leaflet.markercluster";
import { useSelector, useDispatch } from "react-redux";
import {
  setpouringpoint,
  addFileName,
  clearFileName,
  clearPouringPoint
} from "../../StoreContext/features/dragbox/dragboxReducer";
// import { useSelector } from "react-redux";
import GNGrid from "../../../asset/SVG_Icons_64/GNGrid_64.svg";
import GNRefresh from "../../../asset/SVG_Icons_64/GNReferesh_64.svg";
import TAZoomToSelected from "../../../asset/SVG_Icons_64/TAZoom_To_Selected64.svg";
import NAFullExtend from "../../../asset/SVG_Icons_64/NAFull_Extent64.svg";
import { useMap } from "../../UseContext/MapContext"; // Adjust the import path as needed

import Form from "react-bootstrap/Form";

import "./MapComp.css"; // Import the CSS file
import { Tooltip } from "antd";

const MapComp = forwardRef(
  ({ mapContainerRef, datavalue, sent_datav, ActivePourPoint, urls_1 }, ref) => {
    // console.log("gdfg 😒",ActivePourPoint)
    
    const { mapRef, fileLayersMap } = useMap(); // Access context values
    const { selected_pour_point, FileName } = useSelector((state) => state.drag);
    const [updated_data, setUpdated_data] = useState({});
    const [newGraph, setNewGraph] = useState({});
    const [groups, setgroups] = useState({});
    const [projected_point, setProjected_point] = useState({});
    const [projected_line, setProjected_line] = useState({});
    const dispatch = useDispatch();
    const [urls, seturls] = useState({});

    const [drawingRectangleZoomIn, setDrawingRectangleZoomIn] = useState(false);

    const [drawingRectangleZoomOut, setDrawingRectangleZoomOut] =
      useState(false);
    const [isPanningEnabled, setIsPanningEnabled] = useState(true);
    const [polygonCoordinates, setPolygonCoordinates] = useState([]);
    const [currentExtentIndex, setCurrentExtentIndex] = useState(-1);
    const polygonGroupRef = useRef([]);
    const [extents, setExtents] = useState([]); // Array to hold the extents

    const customProjection =
      "+proj=tmerc +lat_0=0 +lon_0=0 +k=1 +x_0=500000 +y_0=0 +datum=WGS84 +units=m +no_defs";
    const wgs84 = "EPSG:4326";

    const [currentScale, setCurrentScale] = useState("1:15,000,000"); // State to store the current scale
    const [visibleScales, setVisibleScales] = useState([]); // Scales to display in the dropdown
    const currentZoom = 4; // Set your initial zoom level here

    const [selectedFormat, setSelectedFormat] = useState("DD"); // Track selected option
    const [coordinateValue, setCoordinateValue] = useState(""); // Track coordinate value

    const scales = {
      // 0: "1:300,000,000",
      // 1: "1:150,000,000",
      // 2: "1:70,000,000",
      3: "1:35,000,000",
      4: "1:15,000,000",
      5: "1:7,000,000",
      6: "1:4,000,000",
      7: "1:2,000,000",
      8: "1:1,000,000",
      9: "1:500,000",
      10: "1:250,000",
      11: "1:125,000",
      12: "1:70,000",
      13: "1:35,000",
      14: "1:15,000",
      15: "1:8,000",
      16: "1:4,000",
      17: "1:2,000",
      18: "1:1,000",
      19: "1:500",
      20: "1:250",
      // 21: "1:125",
      // 22: "1:70",
      // 23: "1:35",
    };
    const visibleOptions = Object.keys(scales).slice(0, 10); // Limit to 10 visible options

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownDirection, setDropdownDirection] = useState("down");
    const dropdownRef = useRef(null);

    const handleDropdownToggle = () => {
      setIsDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
      if (urls_1) {
        console.log("urls_1_______________________________", urls_1.status);
        seturls({ status: urls_1.status }); // ✅ Only updates when urls_1 changes
      }
    }, [urls_1]);
    

    useEffect(() => {
      if (isDropdownOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 200; // Match `max-height` in CSS

        if (
          viewportHeight - rect.bottom < dropdownHeight &&
          rect.top > dropdownHeight
        ) {
          setDropdownDirection("up");
        } else {
          setDropdownDirection("down");
        }
      }
    }, [isDropdownOpen]);

    const handleOptionClick = (scaleValue) => {
      setCurrentScale(scaleValue);
      setZoomFromScale(scaleValue);
      setIsDropdownOpen(false);
    };

    // console.log("datavalue_________________________________urlsurls", urls)

    useEffect(() => {
      let map = null;
      console.log("invoke rendering_____________________________________________urlsurls", urls);

      if (!mapContainerRef.current) {
        console.error("Error: Map container not found.");
        return;
      }
      if (!mapRef.current) {
        console.log("Creating new map instance");
        map = L.map(mapContainerRef.current, {
          // zoom: currentZoom,
          scrollWheelZoom: true,
          minZoom: 3,
          maxZoom: 20,
          maxBounds: [
            [-85, -180],
            [85, 180],
          ],
          maxBoundsViscosity: 1.0,
        }).setView([21.5937, 79.9629], currentZoom);
        mapRef.current = map;
      }

      const baseMaps = {
        "Open Street Map": L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 20,
            zIndex: 1, // Set zIndex for Open Street Map
          }
        ),

        "ESRI WorldImagery": L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            zIndex: 1, // Set zIndex for Open Street Map
          }
        ),

        "Blank Map": L.tileLayer("", {
          noWrap: true,
          zIndex: 1, // Set zIndex for Open Street Map
        }),
      };

      baseMaps["Open Street Map"].addTo(map);
      L.control.layers(baseMaps, null, { position: "topleft" }).addTo(map);

      // Add the WMS layer
      const wmsLayer = L.tileLayer.wms(
        "http://13.232.99.245:8085/geoserver/indialayer/wms",
        {
          layers: "indialayer:India-State-and-Country-Shapefile-WGS",
          format: "image/png", // Use 'image/png' for better compatibility
          transparent: true, // Allows transparency for overlapping layers
          version: "1.1.0",
          zIndex: 3, // set zindex 3 because
          // crs: L.CRS.EPSG4326
        }
      );
      // Add the WMS layer to the map
      wmsLayer.addTo(map);

      

      if (true) {
        // dispatch(clearPouringPoint());
        // dispatch(clearFileName()); 
        let lay = `my_workspace:${sent_datav}`;
        console.log("lay_______________________________________", lay);
        const ssss = L.tileLayer.wms(
          "http://localhost:8085/geoserver/my_workspace/wms",
          {
            layers: lay,

            // layers: `my_workspace:8096fc0f-3abd-4a03-8824-5aae21ed2fc6`,
            format: "image/png", // PNG supports transparency //d3579ceb-f72b-46e3-a9d2-a7664eb0e353
            transparent: true, // Enables background visibility 0ebd54d8-6032-4dab-a717-635b93b9816c
            zIndex: 3, // Ensure it's above base maps
          }
        );
        if (sent_datav){
          console.log("sent_datav_______________________", sent_datav)
          dispatch(clearFileName());
          dispatch(addFileName(sent_datav));}
        
        ssss.addTo(map);
        let lay_point = null;
        if (urls.status !=="success"){
          let lay_point = `my_workspace:${sent_datav}_POINT`;
          console.log("lay_______________________________________", lay_point);
          const ssss_point = L.tileLayer.wms(
            "http://localhost:8085/geoserver/my_workspace/wms",
            {
              layers: lay_point,
  
              // layers: `my_workspace:8096fc0f-3abd-4a03-8824-5aae21ed2fc6`,
              format: "image/png", // PNG supports transparency //d3579ceb-f72b-46e3-a9d2-a7664eb0e353
              transparent: true, // Enables background visibility 0ebd54d8-6032-4dab-a717-635b93b9816c
              zIndex: 3, // Ensure it's above base maps
              identify: true
            }
          );
          ssss_point.addTo(map);
        }
       





        map.on("click", function (e) {
          let lat = e.latlng.lat;
          let lng = e.latlng.lng;
          console.log("lat____________", lat, "lng_______________________", lng);
          
          // Build GetFeatureInfo URL
          // let url = `http://localhost:8085/geoserver/my_workspace/wms?` +
          //           `service=WMS&version=1.1.1&request=GetFeatureInfo` +
          //           `&layers=${lay_point}` +
          //           `&query_layers=${lay_point}` +
          //           `&info_format=application/json` +  // Request JSON response 
          //           `&width=101&height=101` +
          //           `&x=50&y=50` + // Adjust x, y for pixel selection
          //           `&srs=EPSG:4326` +
          //           `&bbox=${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}`;
          let point_q = `${lay}_POINT`;
          let url = `http://localhost:8085/geoserver/my_workspace/wms?` +
          `SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo` +
          `&FORMAT=${encodeURIComponent('image/jpeg')}&TRANSPARENT=true` +
          `&QUERY_LAYERS=${encodeURIComponent(`${point_q}`)}` +
          `&STYLES&LAYERS=${encodeURIComponent(`${point_q}`)}` +
          `&EXCEPTIONS=${encodeURIComponent('application/vnd.ogc.se_inimage')}` +
          // `&INFO_FORMAT=${encodeURIComponent('text/html')}&FEATURE_COUNT=50` +
          `&INFO_FORMAT=${encodeURIComponent('application/json')}&FEATURE_COUNT=50` +
          `&X=50&Y=50&SRS=${encodeURIComponent('EPSG:4326')}` +
          `&WIDTH=101&HEIGHT=101` +
          `&BBOX=${encodeURIComponent(`${lng - 0.001},${lat - 0.001},${lng + 0.001},${lat + 0.001}`)}`;


  
          // Fetch feature info
          fetch(url)
              .then(response => response.json())
              .then(data => {
                  if (data.features.length > 0) {
                      // let feature = data.features[0];
                      function calculateDistance(lat1, lng1, lat2, lng2) {
                        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
                    }
                    let nearestFeature = data.features.reduce((closest, feature) => {
                      let [featureLng, featureLat] = feature.geometry.coordinates;
                      let featureDist = calculateDistance(lat, lng, featureLat, featureLng);
                      let closestDist = calculateDistance(lat, lng, closest.geometry.coordinates[1], closest.geometry.coordinates[0]);
      
                      return featureDist < closestDist ? feature : closest;
                  }, data.features[0]); 


                      let properties = nearestFeature.properties;

                      // Display attributes in an alert or popup
                      let content = "<b>Point Attributes:</b><br>";
                      for (let key in properties) {
                          content += `<b>${key}:</b> ${properties[key]}<br>`;
                      }
                      L.popup()
                          .setLatLng(e.latlng)
                          .setContent(content)
                          .openOn(map);
                          console.log("properties___________-----------------", properties.NODEID,  properties.AUD_GRP)
                          dispatch(setpouringpoint({ node: properties.NODEID, group: properties.AUD_GRP, LI_LINKIDS: properties.LI_LINKIDS }));
                  } else {
                      alert("No feature found at this location.");
                  }
              })
              .catch(error => console.error("Error fetching feature info:", error));
      });




      }

      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });

      resizeObserver.observe(mapContainerRef.current);

      map.on("zoomend", function () {
        const zoomLevel = map.getZoom();
        const scaleValue = getScale(zoomLevel);
        setCurrentScale(scaleValue);
        updateVisibleScales(zoomLevel);
      });

      // Initial scale setup
      const initialZoom = map.getZoom();
      setCurrentScale(getScale(initialZoom));
      updateVisibleScales(initialZoom);

      return () => {
        if (resizeObserver && mapContainerRef.current) {
          resizeObserver.unobserve(mapContainerRef.current);
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [urls]); // Depend on 'urls' to re-run  , sent_datav, urls

    // DD, DMS, Meters
    // Handle Select Change
    const handleSelectChange = (e) => {
      console.log("Runn : ", e.target.value);
      setSelectedFormat(e.target.value);
      setCoordinateValue("");
    };

    useEffect(() => {
      // Ensure the map reference is valid
      if (mapRef.current) {
        mapRef.current.on("mousemove", function (e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          // Calculate values based on selected format
          const latDMS = convertToDMS(lat);
          const lngDMS = convertToDMS(lng);
          const latMeters = convertLatToMeters(lat);
          const lngMeters = convertLngToMeters(lng, lat);

          // Update the coordinate value based on the selected format
          if (selectedFormat === "DD") {
            setCoordinateValue(`${lat.toFixed(4)} , ${lng.toFixed(4)} DD`);
          } else if (selectedFormat === "DMS") {
            setCoordinateValue(`${latDMS}E, ${lngDMS}N`);
          } else if (selectedFormat === "Meters") {
            setCoordinateValue(`${latMeters}, ${lngMeters} m`);
          }
        });
      }
    }, [handleSelectChange]); // Recalculate when the selected format changes

    // Helper Functions
    function convertToDMS(decimal) {
      const degrees = Math.floor(decimal);
      const minutes = Math.floor((decimal - degrees) * 60);
      const seconds = ((decimal - degrees - minutes / 60) * 3600).toFixed(2);
      return `${degrees}°${minutes}'${seconds}"`;
    }

    function convertLatToMeters(lat) {
      const metersPerDegreeLat = 111320; // Approx meters per degree latitude
      return Math.round(lat * metersPerDegreeLat);
    }

    function convertLngToMeters(lng, lat) {
      const metersPerDegreeLng = 111320 * Math.cos((lat * Math.PI) / 180);
      return Math.round(lng * metersPerDegreeLng);
    }

    // Function to get interpolated scale
    const getScale = (zoomLevel) => {
      const zoomFloor = Math.floor(zoomLevel);
      const zoomCeil = Math.ceil(zoomLevel);

      // If zoom is an integer, return exact scale
      if (zoomFloor === zoomCeil) {
        return scales[zoomLevel] || "Unknown Scale";
      }

      // Interpolate for fractional zoom levels
      const scaleFloor = parseInt(scales[zoomFloor].replace("1:", ""), 10);
      const scaleCeil = parseInt(scales[zoomCeil].replace("1:", ""), 10);
      const interpolatedScale = Math.round(
        scaleFloor - (scaleFloor - scaleCeil) * (zoomLevel - zoomFloor)
      );

      return `1:${interpolatedScale.toLocaleString()}`;
    };

    // Define styles for each AUD_ERRP value
    const audErrpStyles = {
      0: { size: 2, color: "black", shape: "circle", fill: true },
      1: { size: 11, color: "red", shape: "circle", fill: true },
      2: { size: 4, color: "blue", shape: "triangle", fill: true },
      3: { size: 5, color: "green", shape: "box", fill: false },
      9: { size: 5, color: "purple", shape: "box", fill: true },
    };

    // Generate group colors for both points and lines

    // Common vector styling

    // console.log("groupColorsLegendspoint ", groupColorsLegendspoint)
    // console.log("groupColorsLegendsline ", groupColorsLegendspoint)
    // Fit bounds for all features

    const updateVisibleScales = (zoomLevel) => {
      const zoomRange = Object.keys(scales).map(Number);
      const startIndex = Math.max(0, zoomLevel - 5); // Show 5 scales above and below
      const endIndex = Math.min(zoomRange.length - 1, zoomLevel + 5);

      setVisibleScales(zoomRange.slice(startIndex, endIndex + 1));
    };

    // Function to set zoom level from dropdown
    const setZoomFromScale = (selectedScale) => {
      const zoomLevel = Object.keys(scales).find(
        (key) => scales[key] === selectedScale
      );
      if (zoomLevel && mapRef.current) {
        mapRef.current.setZoom(parseFloat(zoomLevel));
      }
    };

    useEffect(() => {
      if (mapRef.current && currentZoom) {
        mapRef.current.setZoom(currentZoom); // Ensure map zoom is updated when currentZoom changes
      }
    }, [currentZoom]);

    useEffect(() => {
      console.log("Invoking useEffect");

      if (!sent_datav) {
        console.error("Error: sent_datav is undefined or null");
        return;
      }
      console.log("sent_datav =", sent_datav);
      
      const fetchData = async () => {
        try {
          const taskId = sent_datav;
          if (!taskId) {
            console.error("Task ID is not available");
            return;
          }
    
          // const response = await fetch(`http://127.0.0.1:8000/api/task/${taskId}`, {
          //   credentials: "include",
          // });
          const response = await fetch(`http://127.0.0.1:8000/api/task_sec/${taskId}`, {
            credentials: "include",
          });
    
          if (!response.ok) {
            console.error("Unexpected response status:", response.status);
            return;
          }
    
          const data = await response.json();
    
          if (response.status === 201) {
            console.log(
              "tile_response_________________________________________________________SSSSSSSSSSSSS",
              data.wms_url
            );
            seturls({status : data.wms_url}); //{ status: urls_1.status }
          }
        } catch (error) {
          console.error("Error while processing sent_datav:", error);
        }
      };

      fetchData();

    }, [sent_datav]); //sent_datav


 


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

        mapRef.current.setView([21.5937, 79.9629], currentZoom);
        setExtents([mapRef.current.getBounds()]);
        setCurrentExtentIndex(0); // Reset to full extent
        setIsPanningEnabled(false);
        setDrawingRectangleZoomIn(false);
        setDrawingRectangleZoomOut(false);
        // setCurrentZoom(currentZoom);
      }
    };

    // _-----------------------------------------------------------_

    return (
      <>
        <div className="Main-div-of-map">
          <div
            id="LayoutMap"
            className="Layout-mapbox"
            style={{
              height: "100%",
              position: "relative",
              outlineStyle: "none",
            }}
            ref={mapContainerRef}
          >
            {/* <div id="SearchCoordinate">Lng:78.96 Lat:20.59</div> */}
            <div className="leaflet-bottom leaflet-left OurTool ">
              <div
                id=".leaflet-touch .leaflet-control-layers, .leaflet-touch .leaflet-bar {"
                className="leaflet-pm-toolbar leaflet-pm-fullextent leaflet-bar leaflet-control map-button-alignment "
              >
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
          </div>

          <div className="map-footer">
            <div className="ordinate-div">
              <div className="font-10">
               

                <div
                  className="dropdown-container"
                  tabIndex={0}
                  onBlur={() => setIsDropdownOpen(false)}
                  ref={dropdownRef}
                >
                  <div
                    className="dropdown-header"
                    onClick={handleDropdownToggle}
                  >
                    {currentScale}
                    <span className="dropdown-arrow">
                      {isDropdownOpen ? "▲" : "▼"}
                    </span>
                  </div>

                  {isDropdownOpen && (
                    <ul
                      className={`dropdown-list ${
                        dropdownDirection === "up"
                          ? "dropdown-up"
                          : "dropdown-down"
                      }`}
                    >
                      {Object.keys(scales).map((zoomIndex, index) => (
                        <li
                          key={zoomIndex}
                          className={`dropdown-item ${
                            index >= 10 ? "hidden-item" : ""
                          }`}
                          onClick={() => handleOptionClick(scales[zoomIndex])}
                        >
                          {scales[zoomIndex]}
                        </li>
                      ))}
                      {/* {Object.keys(scales).length > 10 && (
                        <li className="dropdown-item disabled">
                          ...more options
                        </li>
                      )} */}
                    </ul>
                  )}
                </div>
              </div>

              <div className="font-10">
                <select
                  className="co-ordinate-select"
                  value={selectedFormat} // The value of the dropdown shows the selected format
                  onChange={handleSelectChange} // Handle the selection change
                >
                  {/* Default "DD" option */}
                  <option value="DD">
                    {selectedFormat === "DD"
                      ? coordinateValue || "Decimal Degree(DD)"
                      : "Decimal Degree(DD)"}
                  </option>

                  {/* DMS Option */}
                  <option value="DMS">
                    {selectedFormat === "DMS"
                      ? coordinateValue || "Degree Minutes Second(DMS)"
                      : "Degree Minutes Second(DMS)"}
                  </option>

                  {/* Meters Option */}
                  <option value="Meters">
                    {selectedFormat === "Meters"
                      ? coordinateValue || "Meter Co-ordinate System(M)"
                      : "Meter Co-ordinate System(M)"}
                  </option>
                </select>
              </div>
              {/* <div className="coordinate-value">{coordinateValue}</div> */}

              <div className="vr-line"></div>
              <span className="SVG-Grid-icon">
                <img src={GNGrid} alt="GNGrid" />
              </span>
            </div>

            <div className="d-flex">
              <div className="vr-line"></div>
              <div className="int-feature-div ">
                <span onClick={handleFullExtent}>
                  <img src={NAFullExtend} alt="TAZoomToSelected" />
                </span>

                <span onClick={zoomToLayerSelected} className="SVG-TAZoom-size">
                  <img src={TAZoomToSelected} alt="TAZoomToSelected" />
                </span>
                <input className="input-feature-selected" />

                <span className="SVG-Refresh-icon">
                  <img src={GNRefresh} alt="GNRefresh" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default MapComp;

