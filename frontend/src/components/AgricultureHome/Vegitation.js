import { React, useState, useRef, useEffect } from 'react';
import "./vegitation.css"
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import 'ol/ol.css';
import * as olExtent from 'ol/extent';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import TileWMS from 'ol/source/TileWMS';
import LayerSwitcher from 'ol-layerswitcher';
import { useMapEvent } from 'react-leaflet';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import ScaleLine from 'ol/control/ScaleLine';
import { getJSON } from "jquery";
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import LayerGroup from 'ol/layer/Group';
import { Zoom, Rotate, Attribution, ZoomSlider, OverviewMap } from 'ol/control';
import { defaults as defaultInteractions, Select } from 'ol/interaction';
import { Fill, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { pointerMove } from 'ol/events/condition';
import WFS from 'ol/format/WFS';



import $ from 'jquery';
// import CQL from 'ol-ext/filter/CQL';
import { getCenter } from 'ol/extent';
import { CQLFilter } from 'ol/format';
import { createEmpty, extend } from 'ol/extent';
import bbox from '@turf/bbox';
import { fromExtent } from 'ol/extent';
import SuccessModal from '../Modal/SuccessModal';
import {faCaretRight
   } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from "react-modal";
Modal.setAppElement("#root");
// import turf from '@turf/turf';
const Vegitation = (props) => {
  const [isActives, setIsActives] = useState(false);

  const handleClick = () => {
    setIsActives(!isActives);
  };
  const [featureInfoFlag, setFeatureInfoFlag] = useState(false);
  const [cropMaskVisible, setCropMaskVisible] = useState(false);
  const [horticulVisible, setHorticulVisible] = useState(false);
  const [selectedRefTheme, setSelectedRefTheme] = useState('');
  const [cm_st, setCmSt] = useState('');
  const [cm_crp, setCmCrp] = useState('');
  const [cm_yr, setCmYr] = useState('');
  const [htr_city, setHtrCity] = useState('');
  const [htr_crp, setHtrCrp] = useState('');
  const overlayRef = useRef(null);
  const [tabstatus, setTabStatus] = useState('chart');
  const [loadingChartData, setLoadingChartData] = useState(false);
  const [randomCode, setRandomCode] = useState('');
  const [windowSize, setWindowSize] = useState(3);
  const [showHeatmapDiv, setShowHeatmapDiv] = useState(true);
  const [clickedLongitude, setClickedLongitude] = useState(null);
  const [clickedLatitude, setClickedLatitude] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [animMode, setAnimMode] = useState(false);
  const [swipeMode, setSwipeMode] = useState(false);
  const [configSide, setConfigSide] = useState('left');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isShown, setIsShown] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [stateNames, setStateNames] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [districtNames, setDistrictNames] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [vectorLayer, setVectorLayer] = useState(null);
  const [map, setMap] = useState(null);
  const [highlightedFeature, setHighlightedFeature] = useState(null);
  const [tooltip, setTooltip] = useState('');
  const [wfsLayer, setWfsLayer] = useState(null); // Initialize wfsLayer state
  const [states, setStates] = useState([]);
  // Initialize WFS layer outside useEffect
  const wfsLayerRef = useRef(null);

  const toggleDataLayers = () => {
    setIsShown(!isShown);
    // Add logic for toggling data layers
  };




  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setIsActives(false); 
  };

  // Function to open the success modal
  const openModal = () => {
    setShowSuccessModal(true);

  };

  // Function to close the modal when Submit button is clicked
  const handleSubmitButtonClick = () => {
    // Perform any necessary actions here
    // Then open the success modal
    setIsActives(!isActives);
    openModal();
  };



  const [infoVisible, setInfoVisible] = useState(false);

  const handleDisplayInfo = () => {
    setInfoVisible(!infoVisible); // Toggles the visibility state
  };

  const handleCloseInfo = () => {
    setInfoVisible(false); // Close the information pop-up
  };
  const [sliderEnable, setSliderEnable] = useState(true);
  const [opacity, setOpacity] = useState(1);





  const [layerList, setLayerList] = useState(null);

  const showPopup = (layer) => {
    console.log("showpopup() Layer Name", layer);
    setSliderEnable(true);
    setLayerList(layer);
  };

  const closepop = () => {
    console.log("slider disable....");
    setSliderEnable(false);
    if (layerList) {
      setLayerList(prevLayer => ({
        ...prevLayer,
        sliderEnable: false
      }));
    }
  };
  const [sliderValue, setSliderValue] = useState(1);

  const updateOpacity = (layer) => {
    console.log("Opacity change layer...", layer);
    console.log("slider opacity value...", sliderValue);
    layer.setOpacity(parseFloat(sliderValue));
  };

  const handleSliderChange = (event) => {
    setSliderValue(parseFloat(event.target.value));
  };

  //   useEffect(() => {
  //     async function fetchData() {
  //         try {

  //             const url = `http://localhost:8080/geoserver/District/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=District%3ADistricts&maxFeatures=50&outputFormat=application%2Fjson&CQL_FILTER=STATE='${selectedState}' AND DIST='${selectedDistrict}'`;

  //             const response = await fetch(url);
  //             if (!response.ok) {
  //                 throw new Error('Failed to fetch GeoJSON data');
  //             }
  //             const jsonData = await response.json();
  //             setGeoJsonData(jsonData);
  //             console.log('API is running:', jsonData);

  //         } catch (error) {
  //             console.error('Error fetching GeoJSON data:', error);
  //         }
  //     }

  //     fetchData();
  // }, [selectedState, selectedDistrict]); 
  useEffect(() => {
    async function fetchData() {
      try {
        const url = 'http://localhost:8080/geoserver/District/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=District%3ADistricts&outputFormat=application/json';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch GeoJSON data');
        }
        const jsonData = await response.json();
        setGeoJsonData(jsonData);
        console.log('API is running:', jsonData);
        // const states = extractStatesWithDistricts(jsonData);
        // setStatesWithDistricts(states);
        const { states, districts } = extractStatesAndDistricts(jsonData);

        // Update state variables
        setStates(states);
        setDistricts(districts);
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    }

    fetchData();
  }, []);
  
  const handleQuery = () => {
    if (!geoJsonData || !selectedState || !selectedDistrict) return;

    // Find the feature that matches the selected state and district
    const queriedFeature = geoJsonData.features.find(feature =>
      feature.properties.STATE === selectedState &&
      feature.properties.DIST === selectedDistrict
    );

    if (queriedFeature) {
      
      // Create a table dynamically for the queried feature
      const table = document.createElement('table');
      table.classList.add('draggable-table'); // Add a class for easier targeting
      
      const tbody = document.createElement('tbody');
      for (const [key, value] of Object.entries(queriedFeature.properties)) {
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        cell1.textContent = key;
        const cell2 = document.createElement('td');
        cell2.textContent = value;
        row.appendChild(cell1);
        row.appendChild(cell2);
        tbody.appendChild(row);
      }
      // table.appendChild(tbody);
      const cancelRow = document.createElement('tr');
      const cancelCell = document.createElement('td');
      cancelCell.setAttribute('colspan', '2');
      cancelCell.innerHTML = 'cancel'; // Unicode for cancel symbol
      cancelCell.classList.add('cancel-symbol');
      cancelCell.addEventListener('click', () => {
        tableContainer.innerHTML = ''; // Clear table on cancel
      });
      cancelRow.appendChild(cancelCell);
      tbody.appendChild(cancelRow);

      table.appendChild(tbody);

      // Append the table to the desired element in your HTML
      const tableContainer = document.getElementById('table-container');
      tableContainer.innerHTML = ''; // Clear previous content
      tableContainer.appendChild(table);
      tableContainer.style.overflowY = 'auto';
      table.addEventListener('mousedown', startDrag);



    }
  };
  const startDrag = (event) => {
    const table = event.target.closest('.draggable-table');
    if (!table) return; // Ensure the target is the draggable table
    const tableRect = table.getBoundingClientRect();
    const offsetX = event.clientX - tableRect.left;
    const offsetY = event.clientY - tableRect.top;

    // const offsetX = event.clientX - table.getBoundingClientRect().left;
    // const offsetY = event.clientY - table.getBoundingClientRect().top;

    const moveHandler = (e) => {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;


       const maxX = window.innerWidth - tableRect.width;
        const maxY = window.innerHeight - tableRect.height;


      const constrainedX = Math.max(0, Math.min(maxX, newX));
      const constrainedY = Math.max(0, Math.min(maxY, newY));
      // table.style.left = e.clientX - offsetX + 'px';
      // table.style.top = e.clientY - offsetY + 'px';
      if (newX < 0) {
        table.style.left = '0px';
    } else if (newX > maxX) {
        table.style.left = maxX + 'px';
    } else {
        table.style.left = newX + 'px';
    }

    if (newY < 0) {
        table.style.top = '0px';
    } else if (newY > maxY) {
        table.style.top = maxY + 'px';
    } else {
        table.style.top = newY + 'px';
    }

    };


    const removeListeners = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', removeListeners);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', removeListeners);
  };


  useEffect(() => {
    handleQuery();
  }, [geoJsonData, selectedState, selectedDistrict]);

  // const handleQuery = () => {
  //   if (!geoJsonData) return;

  //   // Get the queried feature or any logic you use to determine the queried feature
  //   const queriedFeature = geoJsonData.features[0];
  //   console.log('Query condition is met!');
  //   // Create a table dynamically
  //   const table = document.createElement('table');
  //   const tbody = document.createElement('tbody');
  //   for (const [key, value] of Object.entries(queriedFeature.properties)) {
  //       const row = document.createElement('tr');
  //       const cell1 = document.createElement('td');
  //       cell1.textContent = key;
  //       const cell2 = document.createElement('td');
  //       cell2.textContent = value;
  //       row.appendChild(cell1);
  //       row.appendChild(cell2);
  //       tbody.appendChild(row);
  //   }
  //   table.appendChild(tbody);

  //   // Append the table to the desired element in your HTML
  //   const tableContainer = document.getElementById('table-container');
  //   tableContainer.innerHTML = ''; // Clear previous content
  //   tableContainer.appendChild(table);
  // };

  const extractStatesAndDistricts = (jsonData) => {
    const statesSet = new Set();
    const districtsSet = new Set();

    jsonData.features.forEach(feature => {
      const properties = feature.properties;
      const state = properties.state;
      const district = properties.district;

      if (state) {
        statesSet.add(state);
      }
      if (district) {
        districtsSet.add(district);
      }
    });

    const states = Array.from(statesSet);
    const districts = Array.from(districtsSet);
    return { states, districts };
  };

  function calculateExtent(selectedState, selectedDistrict, geoJsonData) {
    if (!geoJsonData || !selectedState || !selectedDistrict) {
      return null; // Return null if any of the required parameters are missing
    }

    // Filter the GeoJSON features based on the selected state and district
    const filteredFeatures = geoJsonData.features.filter(feature =>
      feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict
    );
    console.log(filteredFeatures, "Filtered Features CHHAYA");

    if (filteredFeatures.length === 0) {
      return null; // Return null if no features match the selected state and district
    }

    // Extract the geometries from the filtered features
    const geometries = filteredFeatures.map(feature => feature.geometry);

    // Calculate the bounding box of the geometries
    const bboxArray = geometries.map(geometry => bbox(geometry));

    // Flatten the array of bounding boxes and calculate the extent
    const extent = bboxArray.reduce((acc, val) => {
      return [
        Math.min(acc[0], val[0]), // minX
        Math.min(acc[1], val[1]), // minY
        Math.max(acc[2], val[2]), // maxX
        Math.max(acc[3], val[3])  // maxY
      ];
    }, bboxArray[0]);
    console.log(extent, "EXTENTCHHAYA")

    return extent; // Return the calculated extent
  }






  // Function to zoom to the extent
  const zoomToExtent = (mapView, extent) => {
    if (!mapView || !extent) return;

    // Check if the geometry has a getExtent function
    if (extent && typeof extent.getExtent === 'function') {
      const extentCoordinates = extent.getExtent();

      // Zoom to the extent
      mapView.fit(extentCoordinates, {
        duration: 1000,
        padding: [50, 50, 50, 50], // Optional padding
      });
    } else {
      console.error('Extent does not have a getExtent function or is invalid:', extent);
    }
  };


  // useEffect(() => {
  //   async function fetchData() {
  //       try {
  //           const response = await fetch("http://localhost:8080/geoserver/District/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=District%3ADistricts&maxFeatures=50&outputFormat=application%2Fjson");
  //           if (!response.ok) {
  //               throw new Error('Failed to fetch GeoJSON data');
  //           }
  //           const jsonData = await response.json();
  //           setGeoJsonData(jsonData);
  //           console.log('API is running:', jsonData);

  //       } catch (error) {
  //           console.error('Error fetching GeoJSON data:', error);
  //       }
  //   }

  //   fetchData();
  // }, []);
  // for map//
  // useEffect(() => {
  //   const fetchPreviewLayer = async () => {
  //     try {
  //       // Define the GeoServer preview layer URL
  //       const previewLayerURL = 'http://localhost:8080/geoserver/Agriculture/wms?service=WMS&version=1.1.0&request=GetMap&layers=Agriculture%3AStates&bbox=68.10611385809977%2C6.760442899569935%2C97.415292377793%2C37.07826805731187&width=742&height=768&srs=EPSG%3A4326&styles=&format=image/png';

  //       const response = await axios.get(previewLayerURL, {
  //         responseType: 'arraybuffer',
  //       });


  //       const blob = new Blob([response.data], { type: 'image/png' });



  //       const dataUrl = URL.createObjectURL(blob);


  //       const overlay = L.imageOverlay(
  //         dataUrl,
  //         [[6.760442479513282, 68.1061136064066], [37.07826805731187, 97.41529266145325]]
  //       );


  //       if (!mapRef.current) {
  //         mapRef.current = L.map('map').setView([20, 80], 5);
  //       }


  //       overlay.addTo(mapRef.current);


  //       mapRef.current.fitBounds(overlay.getBounds());
  //     } catch (error) {
  //       if (error.response) {

  //         console.error('Request failed with status code:', error.response.status);
  //       } else if (error.request) {

  //         console.error('No response received:', error.request);
  //       } else {

  //         console.error('Error setting up request:', error.message);
  //       }
  //     }
  //   };


  //   fetchPreviewLayer();

  //   // Cleanup function
  //   return () => {
  //     // Remove the map when the component unmounts
  //     if (mapRef.current) {
  //       mapRef.current.remove();
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!mapRef.current) return;


  //   const mapView = new View({
  //     center: fromLonLat([72.585717, 23.021245]),
  //     zoom: 8,
  //   });

  //   const map = new Map({
  //     target: mapRef.current,
  //     view: mapView,
  //   });


  //   const osmTile = new TileLayer({
  //     title: "OpenStreetMap",
  //     visible: true,
  //     source: new OSM(),
  //   });


  //   map.addLayer(osmTile);

  //   const indiandtTile = new TileLayer({
  //     title: "Indian District",
  //     visible: true,
  //     source: new TileWMS({
  //       url: "http://localhost:8080/geoserver/District/wms",
  //       params: {
  //         'LAYERS': 'District:Districts',
  //         'TILED': true
  //       },
  //       serverType: 'geoserver',
  //     }),

  //     attribution: 'Indian District data © <a href="http://example.com/">Example.com</a>',
  //   });


  //   map.addLayer(indiandtTile);

  //   const indianstTile = new TileLayer({
  //     title: "Indian States",
  //     visible: true,
  //     source: new TileWMS({
  //       url: "http://localhost:8080/geoserver/Agriculture/wms",
  //       params: {
  //         'LAYERS': 'Agriculture:States',
  //         'TILED': true
  //       },
  //       serverType: 'geoserver',
  //     }),

  //     attribution: 'Indian States data © <a href="http://example.com/">Example.com</a>',
  //   });


  //   map.addLayer(indianstTile);
  //   const layerSwitcher = new LayerSwitcher({
  //     activationMode: "click",
  //     startActive: false,
  //     groupSelectionStyle: "children"
  //   });

  //   map.addControl(layerSwitcher);

  //   return () => {
  //     map.setTarget(null);
  //   };
  // }, []);
  //   useEffect(() => {
  //     if (!mapRef.current || !geoJsonData) return;

  //     const mapView = new View({
  //       center: fromLonLat([78.9629, 20.5937]),
  //       zoom: 8,
  //     });

  //     const map = new Map({
  //       target: 'map-container',
  //       target: mapRef.current,
  //       view: mapView,
  //     });

  //     const osmTile = new TileLayer({
  //       title: 'OpenStreetMap',
  //       visible: true,
  //       type: 'base',
  //       source: new OSM(),
  //     });
  //     map.addLayer(osmTile);


  //     const indiandtTile = new TileLayer({
  //           title: "Indian District",
  //           visible: true,
  //           source: new TileWMS({
  //             url: "http://localhost:8080/geoserver/District/wms",
  //             params: {
  //               'LAYERS': 'District:Districts',
  //               'TILED': true,
  //               CQL_FILTER: `DIST='${selectedDistrict}' AND STATE='${selectedState}'`
  //               // 'CQL_FILTER': "DIST='SERCHHIP' ",
  //             },
  //             serverType: 'geoserver',
  //           }),

  //           attribution: 'Indian District data © <a href="http://example.com/">Example.com</a>',
  //         });

  //         const indianstTile = new TileLayer({
  //           title: 'Indian States',
  //           visible: true,
  //           source: new TileWMS({
  //             url: 'http://localhost:8080/geoserver/Agriculture/wms',
  //             params: {
  //               LAYERS: 'Agriculture:States',
  //               TILED: true,
  //             },
  //             serverType: 'geoserver',
  //           }),
  //         });
  //         map.addLayer(indiandtTile);

  //     map.addLayer(indianstTile);

  //     const layerSwitcher = new LayerSwitcher({
  //       activationMode: 'click',
  //       startActive: false,
  //       groupSelectionStyle: 'children',
  //     });
  //     map.addControl(layerSwitcher);

  //     const noneTile = new TileLayer({
  //       title: 'None',
  //       type: 'base',
  //       visible: false,
  //     });

  //     const baseGroup = new TileLayer({
  //       title: 'Base Maps',
  //       layers: [osmTile, noneTile],
  //       fold: true,
  //     });
  //     map.addLayer(baseGroup);

  //     const overLayGroup = new TileLayer({
  //       title: 'Overlays',
  //       layers: [indiandtTile, indianstTile],
  //       fold: true,
  //     });

  //     map.addLayer(overLayGroup);

  //     const mousePosition = new MousePosition({
  //       coordinateFormat: createStringXY(6),
  //       className: 'mouse-position',
  //     });
  //     map.addControl(mousePosition);

  //     const scaleLine = new ScaleLine({
  //       units: 'metric',


  //   });
  //   if (highlightedFeature) {
  //     const highlightStyle = new Style({
  //         fill: new Fill({
  //             color: 'rgba(255, 255, 0, 0.5)'
  //         })
  //     });

  //     const highlightLayer = new VectorLayer({
  //         source: new VectorSource({
  //             features: [highlightedFeature]
  //         }),
  //         style: highlightStyle
  //     });
  //     map.addLayer(highlightLayer);
  // }

  //   map.addControl(scaleLine);


  //     const scaleControl = new ScaleLine({
  //       bar: true,
  //       text: true,

  //   });

  //   map.addControl(scaleControl);

  //   const featureInfoButton = document.createElement('button');
  //     featureInfoButton.innerHTML = '<img>';
  //     featureInfoButton.className = 'myButton';
  //     featureInfoButton.id = 'featureInfoButton';

  //     const featureInfoElement = document.createElement('div');
  //     featureInfoElement.className = 'featureInfoDiv';
  //     featureInfoElement.appendChild(featureInfoButton);

  //     const featureInfoControl = new Control({
  //         element: featureInfoElement,
  //     });
  //     map.addControl(featureInfoControl);


  //     featureInfoButton.addEventListener('click', () => {
  //         setFeatureInfoFlag(!featureInfoFlag);
  //         featureInfoButton.classList.toggle('clicked');
  //     });


  //     map.on('singleclick', (evt) => {
  //         if (featureInfoFlag) {
  //             // Your feature info logic here...
  //             const resolution = mapView.getResolution();
  //             const url = indiandtTile.getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG:4326', {
  //                 'INFO_FORMAT': 'application/json',
  //                 'propertyName': 'STATE,DIST'
  //             });
  //             if (url) {
  //                 fetch(url)
  //                     .then(response => response.json())
  //                     .then(data => {
  //                         const feature = data.features[0];
  //                         const props = feature.properties;
  //                         console.log('STATE:', props.state.toUpperCase());
  //                         console.log('DIST:', props.district.toUpperCase());
  //                     })
  //                     .catch(error => {
  //                         console.error('Error fetching feature info:', error);
  //                     });
  //             }
  //         }
  //     });

  //     setMap(map);


  //     // return () => {
  //     //   map.setTarget(null);
  //     // };
  //   }, [map, geoJsonData, selectedState, selectedDistrict, highlightedFeature]);


  useEffect(() => {
    console.log('Selected State:', selectedState);
    console.log('Selected District:', selectedDistrict);
    console.log('GeoJSON Data:', geoJsonData);
    if (!map || !selectedState || !selectedDistrict) return;


    // const selectedFeature = geoJsonData.features.find(feature => {
    //     return feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict;
    // });
    const selectedFeature = geoJsonData.features.find(feature => {
      return feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict;
    });

    if (selectedFeature) {
      const geoJsonFormat = new GeoJSON();
      const feature = geoJsonFormat.readFeature(selectedFeature);

      // Calculate the extent based on the selected feature
      const extent = calculateExtent(selectedState, selectedDistrict, geoJsonData);

      // Fit the map view to the calculated extent
      if (extent) {
        map.getView().fit(extent, {
          size: map.getSize(),
          duration: 1000
        });
      }
    }

    if (selectedFeature) {
      const geoJsonFormat = new GeoJSON();
      const feature = geoJsonFormat.readFeature(selectedFeature);

      map.getView().fit(feature.getGeometry(), {
        size: map.getSize(),
        duration: 1000
      });
    }
  }, [map, selectedState, selectedDistrict, geoJsonData]);


  useEffect(() => {
    if (!mapRef.current || !geoJsonData) return;


    const mapView = new View({
      center: fromLonLat([78.9629, 20.5937]),
      zoom: 4,
      // minResolution: 1000 

    });


    const map = new Map({
      target: mapRef.current,
      view: mapView,
      controls: [
        new Zoom(),
        new Rotate(),
        new Attribution(),
        new ZoomSlider(),
        // new MousePosition(),
        new ScaleLine(),
        new OverviewMap(),
      ],

    });
    // const map = new Map({
    //   target: 'map',
    //   layers: [
    //     new TileLayer({
    //       source: new OSM()
    //     }),
    //     vectorLayer
    //   ],
    //   controls: [
    //     new Zoom(),
    //     new Rotate(),
    //     new Attribution(),
    //     new ZoomSlider(),
    //     new MousePosition(),
    //     new ScaleLine(),
    //     new OverviewMap()
    //   ],
    //   interactions: defaultInteractions().extend([
    //     new Select({
    //       layers: [vectorLayer]
    //     })
    //   ]),
    // })

    const osmTile = new TileLayer({
      title: 'OpenStreetMap',
      visible: true,
      type: 'base',
      source: new OSM(),
    });
    map.addLayer(osmTile);

    const indiandtTile = new TileLayer({
      title: "Indian District",
      visible: true,
      source: new TileWMS({
        url: "http://localhost:8080/geoserver/District/wms",
        params: {
          'LAYERS': 'District:Districts',
          'TILED': true,
          CQL_FILTER: `DIST='${selectedDistrict}' AND STATE='${selectedState}'`
        },
        serverType: 'geoserver',
      }),
      attribution: 'Indian District data © <a href="http://example.com/">Example.com</a>',
    });
    const wfsSource = new VectorSource({
      format: new WFS(),
      url: function (extent) {
        return (
          'http://localhost:8080/geoserver/District/ows?' +
          'service=WFS&' +
          'version=1.0.0&' +
          'request=GetFeature&' +
          'typename=District:Districts&' +
          'outputFormat=application/json&' +
          'srsname=EPSG:3857&' +
          `CQL_FILTER=DIST='${selectedDistrict}' AND STATE='${selectedState}'`
        );
      },
      strategy: function (extent, resolution) {
        return [extent];
      },
    });


    map.on('pointermove', function (event) {
      const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
      });
      if (feature) {
        const properties = feature.getProperties();
        const tooltipContent = `${properties.STATE} - ${properties.DIST}`;
        overlay.getElement().innerHTML = tooltipContent;
        overlay.setPosition(event.coordinate);
      } else {
        overlay.setPosition(undefined);
      }
    });
    const wfsLayer = new VectorLayer({
      source: wfsSource,
    });

    const indianstTile = new TileLayer({
      title: 'Indian States',
      visible: true,
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Agriculture/wms',
        params: {
          LAYERS: 'Agriculture:States',
          TILED: true,

        },
        serverType: 'geoserver',
      }),
    });

    const nashikTile = new TileLayer({
      title: 'Nashik Nandgaon',
      visible: true,
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Nashisk3/wms',
        params: {
          LAYERS: 'Nashisk3:Nandgaon',
          TILED: true,

        },
        serverType: 'geoserver',
      }),
    });
    map.addLayer(nashikTile);
    map.addLayer(indiandtTile);
    map.addLayer(indianstTile);

    const layerSwitcher = new LayerSwitcher({
      activationMode: 'click',
      startActive: false,
      groupSelectionStyle: 'children',
    });
    map.addControl(layerSwitcher);


    // map.addControl(layerSwitcher);
    const overLayGroup = new TileLayer({
      title: 'Overlays',
      layers: [indiandtTile, indianstTile, nashikTile],
      fold: true,
    });
    const mousePositionControl = new MousePosition({
      coordinateFormat: function (coordinate) {
        return `${coordinate[1]}, ${coordinate[0]}`;
      },
      projection: 'EPSG:4326',
      className: 'mouse-position',
    });
    map.addControl(mousePositionControl);
    const scaleLineControl = new ScaleLine({
      bar: true,
      text: true,
    });
    map.addControl(scaleLineControl);
    const highlightSource = new VectorSource();
    const highlightLayer = new VectorLayer({
      source: highlightSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.5)'
        })
      })
    });


    map.addLayer(highlightLayer);
    let districtCenter = [78.9629, 20.5937];

    if (selectedState && selectedDistrict) {
      const selectedFeature = geoJsonData.features.find(feature => {
        return feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict;
      });

      if (selectedFeature) {
        const geoJsonFormat = new GeoJSON();
        const feature = geoJsonFormat.readFeature(selectedFeature);
        highlightSource.clear(); // Clear previous highlight
        highlightSource.addFeature(feature); // Add new highlight
        const selectedCoordinate = feature.getGeometry().getCoordinates();
        zoomToCoordinate(selectedCoordinate, 8);

        districtCenter = getCenter(selectedFeature.geometry);
       
          mapView.animate({
            zoom: 6, 
            duration: 1000
          });
        }


      }


    // }

  //   if (selectedState && selectedDistrict) {
  //     // Find the selected feature based on the state and district
  //     const selectedFeature = geoJsonData.features.find(feature => {
  //         return feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict;
  //     });
  
  //     if (selectedFeature) {
  //         const geoJsonFormat = new GeoJSON();
  //         const feature = geoJsonFormat.readFeature(selectedFeature);
  
  //         // Check if the feature has valid geometry
  //         if (feature && feature.getGeometry() && feature.getGeometry().getCoordinates()) {
  //             highlightSource.clear(); // Clear previous highlight
  //             highlightSource.addFeature(feature); // Add new highlight
  
  //             // Get the coordinates of the selected feature
  //             let selectedCoordinates = feature.getGeometry().getCoordinates();
  
  //             // Check if selectedCoordinates is an array of arrays
  //             if (Array.isArray(selectedCoordinates) && selectedCoordinates.length > 0 && Array.isArray(selectedCoordinates[0])) {
  //                 // Extract the first set of coordinates
  //                 selectedCoordinates = selectedCoordinates[0];
  
  //                 // Log the selected coordinate to check its validity
  //                 console.log('Selected Coordinate:', selectedCoordinates);
  
  //                 // Check if selectedCoordinates contains valid coordinates
  //                 if (selectedCoordinates.length === 2 && !isNaN(selectedCoordinates[0]) && !isNaN(selectedCoordinates[1])) {
  //                     // Zoom to the selected coordinate with a zoom level of 8
  //                     zoomToCoordinate(selectedCoordinates, 8);
  
  //                     // Animate the map view to a zoom level of 6 centered on the selected coordinate
  //                     mapView.animate({
  //                         center: selectedCoordinates,
  //                         zoom: 6,
  //                         duration: 1000
  //                     });
  //                 } else {
  //                     console.error('Invalid selected coordinate:', selectedCoordinates);
  //                 }
  //             } else {
  //                 console.error('Invalid format of selected coordinates:', selectedCoordinates);
  //             }
  //         } else {
  //             console.error('Invalid geometry or coordinates for the selected feature:', feature);
  //         }
  //     } else {
  //         console.error('Selected feature not found for state:', selectedState, 'and district:', selectedDistrict);
  //     }
  // } else {
  //     console.error('Selected state or district is not available.');
  // }
  
  
  
  
  

    handleHighlights();

    const selectInteraction = new Select({
      condition: pointerMove, // Trigger tooltip on hover
      style: function (feature) {
        // Style for the selected feature
      }
    });
    map.addInteraction(selectInteraction);

    // Create an Overlay to display the tooltip
    const overlay = new Overlay({
      element: document.getElementById('tooltip'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);

    // Event listener to update tooltip content and position
    map.on('pointermove', function (event) {
      const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
        return feature;
      });
      if (feature) {
        const properties = feature.getProperties();
        const tooltipContent = `${properties.STATE} - ${properties.DIST}`;
        overlay.getElement().innerHTML = tooltipContent;
        overlay.setPosition(event.coordinate);
      } else {
        overlay.setPosition(undefined);
      }
    });


   
    const extent = selectedState && selectedDistrict ? calculateExtent(selectedState, selectedDistrict, geoJsonData) : null;
    zoomToExtent(mapView, extent);
    
    console.log('Extent chhaya:', extent);


    map.on("singleClick", function (evt) {
      const content = document.getElementById("popup-content");
      content.innerHTML = ""; // Clear previous content
      const resolution = map.getView().getResolution();
      const coordinate = evt.coordinate;

      const url = indiandtTile.getSource().getFeatureInfoUrl(coordinate, resolution, map.getView().getProjection(), {
        "INFO_FORMAT": 'application/json',
        "propertyName": "DIST, STATE"
      });

      if (url) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch GeoJSON data');
            }
            return response.json();
          })
          .then(data => {
            const feature = data.features[0];
            const props = feature.properties;

            // Create a table dynamically
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            for (const [key, value] of Object.entries(props)) {
              const row = document.createElement('tr');
              const cell1 = document.createElement('td');
              cell1.textContent = key;
              const cell2 = document.createElement('td');
              cell2.textContent = value;
              row.appendChild(cell1);
              row.appendChild(cell2);
              tbody.appendChild(row);
            }
            table.appendChild(tbody);

            // Append the table to the popup content
            content.appendChild(table);

            // Set position for the popup
            overlay.setPosition(coordinate);
          })
          .catch(error => {
            console.error('Error fetching GeoJSON data:', error);
          });
      } else {
        overlay.setPosition(undefined);
      }
    });

    map.on("singleClick", function (evt) {
      const content = document.getElementById("popup-content");
      content.innerHTML = ""; // Clear previous content
      const resolution = map.getView().getResolution();
      const coordinate = evt.coordinate;

      // Construct the GetFeatureInfo URL for the district layer
      const url = indiandtTile.getSource().getFeatureInfoUrl(coordinate, resolution, map.getView().getProjection(), {
        "INFO_FORMAT": 'application/json',
        "propertyName": "DIST, STATE",
        "CQL_FILTER": `DIST='${selectedDistrict}' AND STATE='${selectedState}'` // Add the selected state and district as a filter
      });

      if (url) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch GeoJSON data');
            }
            return response.json();
          })
          .then(data => {
            // Process response data and display in popup
            // Code for creating table and populating attributes
          })
          .catch(error => {
            console.error('Error fetching GeoJSON data:', error);
          });
      } else {
        overlay.setPosition(undefined);
      }
    });

    return () => {
      // Clean up the map when the component unmounts
      if (map) {

        map.setTarget(null);

      }
    };

    // var container = document.getElementById("popup");
    // var content = document.getElementById("popup-content");
    // var  closer = document.getElementById("popup-closer");

    // var popup = new overlay({
    //   element : container,
    //   autoPan: true,
    //   autoPanAnimation: {
    //     duration:250,

    //   }
    // })
    // map.addOverlay(popup)

    // closer.onclick = function(){
    //   popup.setposition(undefined);
    //   closer.blurr();
    //   return false;
    // };
    // map.on("singleClick",function(evt){
    //   content.innerHTML ="";
    //   var resolution = map.getResolution();
    //   var url = indiandtTile.getSource().getFeatureInfoUrl(evt.coordinate, resolution, "EPSG:4326", {
    //     "INFO_FORMAT": 'application/json',
    //     "propertyName" : "DIST, STATE"


    //   }) 
    //   if (url){
    //     $.getJSON(url, function(data){
    //       var feature = data.feature[0]
    //       var props = feature.properties;
    //       content.innerHTML= "<h3>State.</h3><p>"+props.STATE+"</p><br><h3>District.</h3><p>"+props.DIST+"</p>";
    //       popup.setposition(evt.coordinate);
    //     })

    //   }else{
    //     popup.setPosition(undefined);
    //   }

    // })
    // var container = document.getElementById("popup");
    // var content = document.getElementById("popup-content");
    // var  closer = document.getElementById("popup-closer");

    // const popup = new Overlay({
    //   element: container,
    //   autoPan: true,
    //   autoPanAnimation: {
    //     duration: 250
    //   }
    // });
    // map.addOverlay(popup);
    // closer.onclick = function(){
    //     popup.setposition(undefined);
    //     closer.blurr();
    //     return false;
    //   };

    // closer.onclick = function(){
    //   popup.setPosition(undefined);
    //   closer.blur();
    //   return false;
    // };

    // map.on("singleClick", function(evt){
    //   content.innerHTML = "";
    //   const resolution = map.getView().getResolution();
    //   const coordinate = evt.coordinate; // Assuming coordinate is in the view's projection

    //   const url = indiandtTile.getSource().getFeatureInfoUrl(coordinate, resolution, map.getView().getProjection(), {
    //     "INFO_FORMAT": 'application/json',
    //     "propertyName": "DIST, STATE"
    //   });

    //   if (url) {
    //     fetch(url)
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Failed to fetch GeoJSON data');
    //         }
    //         return response.json();
    //       })
    //       .then(data => {
    //         const feature = data.features[0]; // Assuming features is an array
    //         const props = feature.properties;
    //         content.innerHTML = "<h3>State.</h3><p>" + props.STATE + "</p><br><h3>District.</h3><p>" + props.DIST + "</p>";
    //         popup.setPosition(coordinate);
    //       })
    //       .catch(error => {
    //         console.error('Error fetching GeoJSON data:', error);
    //       });
    //   } else {
    //     popup.setPosition(undefined);
    //   }
    // });

    // setMap(map);
  }, [geoJsonData, selectedState, selectedDistrict, map]);

  useEffect(() => {
    if (map) {
      map.getView().setCenter(fromLonLat([78.9629, 20.5937]));
      map.getView().setZoom(5);
    }
  }, [map]);

  // function toggleLayer(event){
  //   var lyrname = event.target.value;
  //   var checkedStatus = event.target.checked;
  //   var lyrlist = map.getLayers();
  //   lyrlist.forEach(function(element){
  //     if( lyrname == element.get('title')){
  //       element.setVisible(checkedStatus);

  //     }
  //   }
  //   )
  // }


  // useEffect(() => {
  //     if (!map) return;

  //     const mapInstance = new Map({
  //         target: 'map-container',
  //         layers: [],
  //         view: new View({
  //             center: fromLonLat([78.9629, 20.5937]),
  //             zoom: 5
  //         })
  //     });

  //     setMap(mapInstance);
  // }, []);

  //   useEffect(() => {

  //     const initialCenter = fromLonLat([72.585717, 23.021245]);
  //     const initialZoom = 8;
  //     const mapView = new View({
  //         center: initialCenter,
  //         zoom: initialZoom,
  //     });


  //     const mapInstance = new Map({
  //         target: 'map',
  //         view: mapView,
  //     });


  //     const osmTile = new TileLayer({
  //         title: 'OpenStreetMap',
  //         source: new OSM(),
  //     });
  //     mapInstance.addLayer(osmTile);


  //     const indiandtTile = new TileLayer({
  //               title: "Indian District",
  //               visible: true,
  //               source: new TileWMS({
  //                 url: "http://localhost:8080/geoserver/District/wms",
  //                 params: {
  //                   'LAYERS': 'District:Districts',
  //                   'TILED': true,
  //                   'CQL_FILTER': "DIST='SERCHHIP' ",
  //                 },
  //                 serverType: 'geoserver',
  //               }),

  //               attribution: 'Indian District data © <a href="http://example.com/">Example.com</a>',
  //             });

  //             const indianstTile = new TileLayer({
  //               title: 'Indian States',
  //               visible: true,
  //               source: new TileWMS({
  //                 url: 'http://localhost:8080/geoserver/Agriculture/wms',
  //                 params: {
  //                   LAYERS: 'Agriculture:States',
  //                   TILED: true,
  //                 },
  //                 serverType: 'geoserver',
  //               }),
  //             });
  //             map.addLayer(indiandtTile);

  //         map.addLayer(indianstTile);


  //     const baseGroup = new LayerGroup({
  //         title: 'Base Maps',
  //         layers: [osmTile],
  //         fold: true,
  //     });

  //     const overlayGroup = new LayerGroup({
  //         title: 'Overlays',
  //         layers: [indiandtTile],
  //         fold: true,
  //     });


  //     mapInstance.addLayer(baseGroup);
  //     mapInstance.addLayer(overlayGroup);


  //     const mousePositionControl = new MousePosition({
  //         coordinateFormat: function (coordinate) {
  //             return `${coordinate[1]}, ${coordinate[0]}`;
  //         },
  //         projection: 'EPSG:4326',
  //         className: 'mouse-position',
  //     });
  //     mapInstance.addControl(mousePositionControl);

  //     const scaleLineControl = new ScaleLine({
  //         bar: true,
  //         text: true,
  //     });
  //     mapInstance.addControl(scaleLineControl);


  //     const featureInfoButton = document.createElement('button');
  //     featureInfoButton.innerHTML = '<img>';
  //     featureInfoButton.className = 'myButton';
  //     featureInfoButton.id = 'featureInfoButton';

  //     const featureInfoElement = document.createElement('div');
  //     featureInfoElement.className = 'featureInfoDiv';
  //     featureInfoElement.appendChild(featureInfoButton);

  //     const featureInfoControl = new Control({
  //         element: featureInfoElement,
  //     });
  //     mapInstance.addControl(featureInfoControl);


  //     featureInfoButton.addEventListener('click', () => {
  //         setFeatureInfoFlag(!featureInfoFlag);
  //         featureInfoButton.classList.toggle('clicked');
  //     });


  //     mapInstance.on('singleclick', (evt) => {
  //         if (featureInfoFlag) {

  //             const resolution = mapView.getResolution();
  //             const url = indiandtTile.getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG:4326', {
  //                 'INFO_FORMAT': 'application/json',
  //                 'propertyName': 'state,district'
  //             });
  //             if (url) {
  //                 fetch(url)
  //                     .then(response => response.json())
  //                     .then(data => {
  //                         const feature = data.features[0];
  //                         const props = feature.properties;
  //                         console.log('State:', props.state.toUpperCase());
  //                         console.log('District:', props.district.toUpperCase());
  //                     })
  //                     .catch(error => {
  //                         console.error('Error fetching feature info:', error);
  //                     });
  //             }
  //         }
  //     });

  //     setMap(mapInstance);


  //     return () => {
  //         mapInstance.setTarget(null);
  //     };
  // }, []);

  useEffect(() => {
    if (geoJsonData) {
      // Extract unique states from geoJsonData
      const uniqueStates = [...new Set(geoJsonData.features.map(feature => feature.properties.STATE))];
      setStates(uniqueStates);
    }
  }, [geoJsonData]);

  useEffect(() => {
    if (geoJsonData && selectedState) {
      // Extract districts for the selected state
      const stateDistricts = geoJsonData.features
        .filter(feature => feature.properties.STATE === selectedState)
        .map(feature => feature.properties.DIST);
      setDistricts(stateDistricts);
    } else {
      setDistricts([]);
    }
  }, [geoJsonData, selectedState]);

  const handleStateChanges = (event) => {
    const newState = event.target.value;
    setSelectedState(newState);
    setSelectedDistrict('');

  };
  useEffect(() => {
    console.log('Updating districts based on selected state:', selectedState);
    if (!geoJsonData || !selectedState) return;

    const districtsForSelectedState = geoJsonData.features
      .filter(feature => feature.properties.STATE === selectedState)
      .map(feature => feature.properties.DIST);
    console.log('Filtered districts:', districtsForSelectedState);
    setDistricts(districtsForSelectedState);
  }, [geoJsonData, selectedState]);

  const handleDistrictChanges = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const zoomToCoordinate = (coordinate, zoomLevel) => {
    if (!map) return;
    map.getView().animate({
      center: coordinate,
      zoom: zoomLevel,
      duration: 1000,
    });
  };

  const handleHighlights = () => {
    if (!geoJsonData || !selectedState || !selectedDistrict || !map) return;

    const selectedFeature = geoJsonData.features.find(
      (feature) =>
        feature.properties.STATE === selectedState &&
        feature.properties.DIST === selectedDistrict
    );

    if (selectedFeature) {
      const geoJsonFormat = new GeoJSON();
      const feature = geoJsonFormat.readFeature(selectedFeature);
      const selectedCoordinate = feature.getGeometry().getCoordinates();
      zoomToCoordinate(selectedCoordinate, 8); // Adjust the zoom level as needed
    }
  };
  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };
  const handleHighlight = () => {
    if (!geoJsonData) return;

    const selectedFeature = geoJsonData.features.find(feature => {
      return feature.properties.STATE === selectedState && feature.properties.DIST === selectedDistrict;
    });


    if (selectedFeature && highlightedFeature !== selectedFeature) {
      setHighlightedFeature(new GeoJSON().readFeature(selectedFeature));

    } else {
      setHighlightedFeature(null);
    }
  };



  // Import bbox function instead of box







  //  useEffect(() => {
  //   var container = document.getElementById("popup");
  //   var content = document.getElementById("popup-content");
  //   var closer = document.getElementById("popup-closer");

  //   const popup = new Overlay({
  //     element: container,
  //     autoPan: true,
  //     autoPanAnimation: {
  //       duration: 250
  //     }
  //   });
  //   map.addOverlay(popup);

  //   closer.onclick = function () {
  //     popup.setPosition(undefined);
  //     closer.blur();
  //     return false;
  //   };

  //   map.on("singleClick", function (evt) {
  //     content.innerHTML = "";
  //     const resolution = map.getView().getResolution();
  //     const coordinate = evt.coordinate; // Assuming coordinate is in the view's projection

  //     const url = indiandtTile.getSource().getFeatureInfoUrl(coordinate, resolution, map.getView().getProjection(), {
  //       "INFO_FORMAT": 'application/json',
  //       "propertyName": "DIST, STATE"
  //     });

  //     if (url) {
  //       fetch(url)
  //         .then(response => {
  //           if (!response.ok) {
  //             throw new Error('Failed to fetch GeoJSON data');
  //           }
  //           return response.json();
  //         })
  //         .then(data => {
  //           const feature = data.features[0]; // Assuming features is an array
  //           const props = feature.properties;
  //           content.innerHTML = "<h3>State.</h3><p>" + props.STATE + "</p><br><h3>District.</h3><p>" + props.DIST + "</p>";
  //           popup.setPosition(coordinate);
  //         })
  //         .catch(error => {
  //           console.error('Error fetching GeoJSON data:', error);
  //         });
  //     } else {
  //       popup.setPosition(undefined);
  //     }
  //   });

  //   return () => {
  //     // Clean up the event listener when the component unmounts
  //     map.un('singleClick');
  //   };
  // }, [map]);

  useEffect(() => {
    if (!map) {
      console.error('Map is not initialized');
      return;
    }
    var container = document.getElementById("popup");
    var content = document.getElementById("popup-content");
    var closer = document.getElementById("popup-closer");

    const popup = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(popup);

    closer.onclick = function () {
      popup.setPosition(undefined);
      closer.blur();
      return false;
    };

    map.on("singleClick", function (evt) {
      content.innerHTML = "";
      const resolution = map.getView().getResolution();
      const coordinate = evt.coordinate; // Assuming coordinate is in the view's projection

      // Construct the API URL manually
      const apiUrl = 'http://localhost:8080/geoserver/District/ows?' +
        'service=WFS&' +
        'version=1.0.0&' +
        'request=GetFeature&' +
        'typeName=District%3ADistricts&' +
        'outputFormat=application/json&' +
        'srsname=' + map.getView().getProjection() + '&' +
        'INFO_FORMAT=application/json&' +
        'propertyName=DIST,STATE';

      const url = apiUrl; // Use the constructed API URL

      if (url) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch GeoJSON data');
            }
            return response.json();
          })
          .then(data => {
            const feature = data.features[0]; // Assuming features is an array
            const props = feature.properties;
            content.innerHTML = "<h3>State.</h3><p>" + props.STATE + "</p><br><h3>District.</h3><p>" + props.DIST + "</p>";
            popup.setPosition(coordinate);
          })
          .catch(error => {
            console.error('Error fetching GeoJSON data:', error);
          });
      } else {
        popup.setPosition(undefined);
      }
    });

    return () => {
      // Clean up the event listener when the component unmounts
      map.un('singleClick');
    };
  }, [map]);


  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8; // Length of the random code
    let code = '';

    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  };
  //////
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (

    <div>
      <div style={{
        marginBottom: "9rem"
      }}>
        <div className="info">
          <button className="info_button" onClick={handleDisplayInfo}>Help</button>
        </div>
        {infoVisible && (
          <div className="info_div" id="info_div" style={{ overflowY: 'scroll', height: '400px', backgroundColor: "#d4ebf2" }}>
            <table className="info_table"
              style={{
                borderCollapse: 'initial',
                borderSpacing: 'initial',
                backgroundColor: "#d4ebf2"
              }}>
              <tbody>
                <tr style={{
                  borderBottom: 'initial'
                }}>
                  <td className="info_close pb-3" style={{
                    border: 'initial',





                  }}>
                    <button className="info_close_button" onClick={handleCloseInfo}>X</button> {/* Close button now closes the pop-up */}
                  </td>
                </tr>

                <tr>
                  <td style={{
                    border: 'initial',
                    borderWidth: 'initial',
                    borderColor: 'initial',
                    padding: 'initial',
                    whiteSpace: 'initial',
                    fontSize: 'initial',
                    textAlign: 'initial'
                  }}>
                    <p className="info_textarea">Vegetation is a very complex eco-system and is influenced by, besides management practices, many environmental factors such temperature, rainfall, soil moisture. A web-based geo-spatial processing and visualization system is developed to assist practitioners and resource managers in making informed decisions about current season vegetation performance.</p>
                    <p className="info_textarea">Actual field level information is sparse and not available in near-real-time. To overcome the limitation of timely availability of field information, it is a recent trend to use information derived from spaceborne platforms which provide repetitive and synoptic coverage of the area. One of the most important indicators of evaluating the performance of vegetation is the Normalised Vegetation Difference Index (NDVI) which is the ratio of difference of NIR and red reflectance over their sum. Vast amounts of historical and current data on NDVI are available from various sensors such as AWiFS, OCM, MODIS, PROBA. It is well known that there are considerable year-to-year variations in the performance of vegetation systems – mainly due to changing crop growing conditions. To account for them, information on temperature, rainfall, and soil moisture is also provided.</p>
                    <p className="info_textarea">The main outcome of the developed system is the platform it provides for monitoring crop growth. With the use of the developed web-based platform and analytical functionalities, it is possible to infer vegetation condition at various spatial and temporal scales. It is possible to compare areas/regions that are deviating from the average and/or a particular year along with temperature and moisture conditions. The developed web-GIS analysis platform can be exploited by stakeholders to make informed policy and/or management interventions at the right time.</p>
                    <p className="info_textarea">There are three sections on this webpage (on the Bottom strip). The section on reference layers has static information such as SOI administrative boundaries, Infrastructure (roads, railway lines), India mosaics prepared using microwave and optical data, DEM, and rivers. Under “data visualization,” historical as well as most recent image data (Indian as well as global) of NDVI, Soil Moisture, Rainfall, Temperature are populated. Under “data analysis,” web-based geospatial processing/functionalities for NDVI difference, range analysis, temporal classification, long-term statistics can be performed on the web.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {/* slider div start */}
        <div id="legend" className='legend' >
          <svg width="200" height="23">
            <defs>
              <linearGradient id="legend-traffic" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0" stopColor="#f0ebec"></stop>
                <stop offset="0.1111111111111111" stopColor="#d8c4b6"></stop>
                <stop offset="0.2222222222222222" stopColor="#ab8a75"></stop>
                <stop offset="0.33333333333333337" stopColor="#917732"></stop>
                <stop offset="0.4444444444444444" stopColor="#70ab06"></stop>
                <stop offset="0.5555555555555555" stopColor="#459200"></stop>
                <stop offset="0.6666666666666667" stopColor="#267b01"></stop>
                <stop offset="0.7777777777777779" stopColor="#0a6701"></stop>
                <stop offset="0.8888888888888888" stopColor="#004800"></stop>
                <stop offset="1" stopColor="#001901"></stop>
              </linearGradient>
            </defs>
            <g>
              <rect className="legendRect" x="0" y="0" width="200" height="5" style={{ fill: 'url(#legend-traffic)' }}></rect>
              <g className="axis" transform="translate(0,2)">
                <g className="tick" transform="translate(10,0)" style={{ opacity: 1 }}>
                  <line y2="6" x2="0"></line>
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle' }}>0.0</text>
                </g>
                <g className="tick" transform="translate(55,0)" style={{ opacity: 1 }}>
                  <line y2="6" x2="0"></line>
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle' }}>0.2</text>
                </g>
                <g className="tick" transform="translate(100,0)" style={{ opacity: 1 }}>
                  <line y2="6" x2="0"></line>
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle' }}>0.4</text>
                </g>
                <g className="tick" transform="translate(145,0)" style={{ opacity: 1 }}>
                  <line y2="6" x2="0"></line>
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle' }}>0.6</text>
                </g>
                <g className="tick" transform="translate(190,0)" style={{ opacity: 1 }}>
                  <line y2="6" x2="0"></line>
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle' }}>0.8</text>
                </g>
                {/* <path className="domain" d="M10,6V0H190V6"></path> */}
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className='mt-5'>
        <div className='row mt-5'>
        {showSidebar && (
          <div className='col-2 SidebarMenu'>
            <div className='pt-2'>
            <FontAwesomeIcon icon={faCaretRight} className="mr-1 iconofAGRI" />
              {/* Button to trigger the modal */}
              <FontAwesomeIcon icon={ faCaretRight} className="mr-1 iconofAGRI" />
              <button
                type="button"
                // className="authsignupbtn"
                className={isActives ? 'buttons active' : 'ButtonOfCreateProject'}
                // onClick={handleClick}
                // className="Administrativeselection"
                onClick={handleSubmitButtonClick}
              >
               Create/Open Project
              </button>

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
      left: 0,
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
                    // width: "600px",
                    // height: "470px",
                    // margin: "auto",
                    // display: "flex",
                    // flexDirection: "column",
                    // justifyContent: "space-between",
                    // alignItems: "center",
                    // border:"none",
                    // // border: "1px solid rgb(0 189 245)",
                    // borderRadius: "4px",
                    // background:"none",
                    // padding: "10px",
                    // // backgroundColor: "#f7f5e3",
                    // outline: "none",
                    // overflow: "none",
                  },
    //               border: 1px solid rgb(0 189 245);
    // background: #f7f5e3;
                }}
              >
                {/* Close button */}
                {/* <button
                  onClick={handleSuccessModalClose}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color:"red",
                   fontWeight:"bolder"
                  }}
                >
                  X
                </button> */}

                {/* Modal content */}
                <div style={{ fontSize: "14px", textAlign: "center" }}>
                  <div className="">

                    {/* {isLoading && (
        <div
          className="loading-overlay position-absolute "
          style={{ zIndex: "100" }}
        >
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              top: "2000%",
              left: "800%",
              transform: "translate(350%, 350%)",
            }}
          >
            <FadeLoader
              color={backgroundColor}
              loading
              css={override}
              size={50}
            />

            
            <p className="mt-2 ml-3 text-danger">
              Fetching data, please wait...
            </p>
          </div>
        </div>
      )} */}

        <div class="d-flex  mx-5 justify-content-center my-5">
        <div class="Agriform mb-5" >
         
            <div className='row mx-auto'>
                <div className='col-lg-2'>Logo</div>
                <div className='col-lg-3 fw-bold'><p className='font-weight-bold Agri-Heading'>Agriculture-Create Project</p></div>
                <div className='col-lg-7 AgriClose'>X</div>
            </div>
            <div className='bg-info'>
           <div className='row mx-auto py-3'>
            <div className='col my-auto'><button className='w-100'>Project Information</button></div>
            <div className='col my-auto'><button className='w-100'>Project Inputs</button></div>
            <div className='col my-auto'><button className='w-100'>Project Management </button></div>
           </div>
           
          
          
          <div class="mx-3">
            {/* <div class="mx-5 w-75">
             

              <div class="form-group mb-1 mx-4">
                <label>
                  <span className="required-field">*</span>
                  User Name
                 
                
                </label>
                <input
                  type="text"
                  name="USERNAME"
                
                
                  placeholder="Enter User Name..."
                  autoComplete="off"
                  maxLength={20}
                 
               
                />
              </div>
            

              <div class="form-group mb-1 mx-4">
                <label>
                  <span className="required-field">*</span>
                  Email
                 
                
                </label>
                <input
                 
                  type="email"
                  name="EMAIL"
                 
                 
                 
                  maxLength={100}
                  autoComplete="off"

                 
                />
              </div>

            

              <div class="form-group mb-1 mx-4">
                <label>
                  <span className="required-field">*</span>
                 
                  <span className="maxlength-message" id="maxlength-message">
                    
                  </span>
                </label>

                <div class="input-group-prepend">
                  <select
                    className="input-group-text p-0 bg-white"
                  
                  >
                    
                  </select>
                  <input
                    class="form-control w-100"
                  
                    maxLength="10"
                    autoComplete="off"
                  />
                </div>
              
              </div>

           
              <div class="form-group mb-1 mx-4">
                <label>
                  <span className="required-field">*</span>
                  Password
                 
                  
                </label>

                <div class="input-group-prepend">
                  <input
                   
                    id="genpasswordinput"
               
                  
                    placeholder="Enter Password..."
                    autoComplete="off"
                    maxLength="40"
                  />
                 
                </div>
              </div>

             

              <div class="form-group  mx-4 ">
                <button
                  type="submit"
                
                  className="signupbtnbox"
                >
                  Sign Up
                </button>
              </div>
            </div> */}
            <form className='mx-auto px-3 Project_info'>
                <div className='Section_one'>
                    <div className='row'>
                        <div className='col-lg-4 1'>
                            {/* <div className='row'>
                                <div className='col-lg-4'>  <label className='w-100'><span className="required-field">*</span>Project ID:</label>  </div>
                                <div className='col-lg-8 '>  <input className='w-100' type='text'/></div>
                            </div> */}
                          <label className='AgriLabel'><span className="required-field">*</span>Project ID:</label>   
                             <input className='w-50' type='text'/>
                        </div>
                        <div className='col-lg-4  2'>
                        <label className='AgriLabel'><span className="required-field">*</span>Project Creation Date:</label>  
                            <input className='w-50' type='text'/>  
                        </div>
                        <div className='col-lg-4  3'>
                        <label className='AgriLabel'><span className="required-field">*</span>Project creation Time:</label>  
                            <input className='w-50' type='text'/> 
                        </div>
                    </div>
                </div>
                <div className='Section_Two'>
                    <div className='row my-4'>
                        <div className='col-lg-6'>
                            {/* <div className='row'>
                                <div className='col-lg-3 mr-0 pr-0'><label> <span className="required-field">*</span>Project Name:</label></div>
                                <div className='col-lg-9 ml-0 pl-0'> <input className='w-75' type='text'/></div>
                            </div> */}
                            <label> <span className="required-field">*</span>Project Name:</label>
                        <input className='w-50' type='text'/>
                        </div>
                        <div className='col-lg-6'>
                        {/* <div className='row'>
                                <div className='col-lg-4 mr-0 pr-0'><label> <span className="required-field">*</span>Project Creation Time:</label></div>
                                <div className='col-lg-8 ml-0 pl-0'> <input className='w-100' type='text'/>
                                </div>
                            </div> */}
                        <label><span className="required-field">*</span>Project Creation Time:</label>
                        <input className='w-50' type='text'/>
                        </div>
                    </div>
                </div>
                <div className='Section_Three'>
            <label>Project Description</label>
            <textarea class="form-control scrollable-input" id="exampleFormControlTextarea1" rows="3"></textarea>
                </div>
                <div  className='Section_Four my-4'>
                  <div className='row'>
                    <div className='col-lg-3 mr-0 pr-0'><label><span className="required-field">*</span>Project Client Organization:</label></div>
                   <div  className='col-lg-8 m1-0 pl-0'><input className='w-50' type='text'/></div>
                  </div>
                </div>
                <div  className='Section_Five my-4'>
                  <div className='row'>
                    <div className='col-lg-3 mr-0 pr-0'><label><span className="required-field">*</span>Project Exicuted Organization:</label></div>
                   <div  className='col-lg-8 m1-0 pl-0'><input className='w-50' type='text'/></div>
                  </div>
                </div>
                <div  className='Section_Six my-4'>
                  <div className='row'>
                    <div className='col-lg-3 mr-0 pr-0'><label><span className="required-field">*</span>Cropping year:</label></div>
                   <div  className='col-lg-8 m1-0 pl-0'><input className='w-50' type='text'/></div>
                  </div>
                </div>
                <div  className='Section_Seven my-4'>
                  <div className='row'>
                    <div className='col-lg-3 mr-0 pr-0'><label><span className="required-field">*</span>Cropping season:</label></div>
                   <div  className='col-lg-8 m1-0 pl-0'><input type="checkbox" id="vehicle1" name="vehicle1" value="Bike"/>
<label className='mr-3' for="vehicle1"> Kharif</label>
<input type="checkbox" id="vehicle2" name="vehicle2" value="Car"/>
<label className='mr-3' for="vehicle2"> Rabi</label>
<input type="checkbox" id="vehicle3" name="vehicle3" value="Boat"/>
<label className='mr-3' for="vehicle3"> Summer</label>
<input type="checkbox" id="vehicle4" name="vehicle4" value="Boats"/>
<label className='mr-3' for="vehicle4"> Default</label>
</div>
                  </div>
                </div>
                <div  className='Section_Eight my-4 mr-4'>
                  <div className='row'>
                    <div className='col-lg-3 mr-0 pr-0'><label>Area Information:</label></div>
                    <textarea className="w-75 scrollable-input" id="exampleFormControlTextarea1" rows="3"></textarea>
                  </div>
                </div>
            </form>
          </div>
          <div className='d-flex justify-content-end align-item-end'>
            <div className='row py-3 mx-2'>
                <div className='col'><button className='AgriCancel' onClick={handleSuccessModalClose}>CANCEL</button></div>
                <div className='col'><button className='AgriNext'>Next</button></div>
            </div>
          </div>
          </div>
        </div>
      </div>

                    {/* <form
                     
                      className=" AgriForm"
                    >
                      <div className='row'>
                     
                        <div className='col'><input type= "radio" name="projectType"/><label for="html">New Project</label> </div>
                        <div className='col'><input type= "radio" id="age1" name="projectType" value="30"/><label  for="age1">create  project</label></div>
                       
                      </div>
                       <header className='bg-danger'>agri</header>
                    <div className='mx-3'>
                    <div className="headingname">
                     
                     <h3 className="gene-heading"> Create Project</h3>
                    
                   </div>
                 
                   <div class="form-group mt-0">
                    
                     <hr className="my-2 custom-hr"></hr>
                   </div>

                   <div class="form-row space">
                     <div class="form-group col mb-0 text-left">
                       <label for="fname" className="lable2 text-left">
                         <span className="required-field">*</span>
                         Project Name
                         
                       </label>
                       <input
                         type="text"
                         class="form-control"
                         
                         placeholder="Project Name..."
                         autocomplete="off"
                         maxLength="20"
                       />
                     </div>
                    
                    
                    
                    
                  
                  
                   </div>
                   
                   <div class="form-row space mt-5">
                     <div class="form-group col mb-0 text-left">
                       <label for="fname" className="lable2 text-left">
                         <span className="required-field">*</span>
                         Project Desacription
                         
                       </label>
                       <input
                         type="text"
                         class="form-control"
                         
                         placeholder="Project Desacription..."
                         autocomplete="off"
                         maxLength="20"
                       />
                     </div>
                    
                    
                    
                    
                  
                  
                   </div>
                   <div class="form-group" >
                     <h4
                       style={{
                         textAlign: "left",
                         fontSize: "min(4vw,14px)",
                         fontWeight: "bold",
                       }}
                       className="mt-5"
                     >
                       Choose AOI
                     </h4>
                     <hr className="my-2 custom-hr"></hr>
                   </div>
                   <div class="row space text-left">
                     <div class="form-group col-lg-4  mb-0">
                       <label for="inputState" className="lable2">
                         <span className="required-field">*</span>
                        State
                       
                       </label>
                       <select
                        
                         class="form-control"
                       >
                         <option value="" disabled selected>
                           Choose State...
                         </option>
                      
                       </select>
                     </div>
                     <div class="form-group col-lg-4   mb-0">
                       <label for="inputState" className="lable2">
                         <span className="required-field">*</span>
                         City
              
                       </label>
                       <select
                       
                         class="form-control"

                       >
                         <option value="" disabled selected>
                           Choose State...
                         </option>

                       
                       </select>
                     </div>
                     <div class="form-group col-lg-4  mb-0">
                       <label for="inputCity" className="lable2">
                         <span className="required-field">*</span>
                         Taluka
                       
                       </label>
                       <select
                        
                         class="form-control"
                     
                       >
                         <option value="" disabled selected>
                           Choose City...
                         </option>
                        
                       </select>
                     </div>
                     <b className='text-center'>or</b>
                    
                     
                   </div>
                 
                   <div class="form-group" >
                 
                     <h4
                       style={{
                         textAlign: "left",
                         fontSize: "min(4vw,14px)",
                         fontWeight: "bold",
                       }}
                       className="mt-5"
                     >
                     AOI
                     </h4>
                  
                     <hr className="my-2 custom-hr"></hr>
                   </div>
                    
                   <div class="form-row text-left space">
                     <div class="form-group col mb-0">
                       <label for="inputCityfff" className="lable223">
                         <span className="required-field">*</span>
                         Select AOI
                         <span className="error-message">
                        
                         </span>
                       </label>
                       <input
                          type="file"
                         class="form-control sp"
                     
                       />
                     </div>
                    

                    
                   </div>

                 

              <div className='row ButtonOfagri'>
               <div className='col-lg-4'>
               <button className='buttonAgri' onClick={handleSuccessModalClose}>CREATE</button>
               </div>
               <div className='col-lg-4'>
               <button className='buttonAgric' onClick={handleSuccessModalClose} >
                 CANCEL
               </button>
               </div>
               <div className='col-lg-4'>
               <button className='buttonAgrih' onClick={handleSuccessModalClose}>
                 HELP
               </button>
               </div>
              </div>

                    </div>
                    
                      
                    </form> */}
                  </div>
                </div>

                {/* Buttons */}
                <div className='mt-4'>
                 
                 
                </div>
              </Modal>
            </div>
            {/* <div className='StateDropdown'>
                <label className='State' htmlFor="stateDropdown">Select State:</label>
                <select  className='SelectDistrict' id="stateDropdown" value={selectedState} onChange={handleStateChange}>
                    <option className='OptionState' value="">Select State</option>
                    {geoJsonData && geoJsonData.features.map(feature => (
                        <option key={feature.id} value={feature.properties.STATE}>
                            {feature.properties.STATE}
                        </option>
                    ))}
                </select>
            </div> */}

            {/* <div className='DistrictDropdown'>
                <label className='District' htmlFor="districtDropdown">Select District:</label>
                <select className='SelectDistrict' id="districtDropdown" value={selectedDistrict} onChange={handleDistrictChange}>
                    <option className='OptionDistrict'  value="">Select District</option>
                    {geoJsonData && geoJsonData.features
                        .filter(feature => feature.properties.STATE === selectedState)
                        .map(feature => (
                            <option key={feature.id} value={feature.properties.DIST}>
                                {feature.properties.DIST}
                            </option>
                        ))}
                </select>
            </div> */}

            {/* <button className='SearchButton' onClick={handleHighlight}>Search</button> */}
            <div>
              <div className='StateDropdown'>
                <label className='State' htmlFor="stateDropdown">Select State:</label>
                <select className='SelectDistrict' id="stateDropdown" value={selectedState} onChange={handleStateChanges}>
                  <option className='OptionState' value="">Select State</option>
                  {states.sort((a, b) => a.localeCompare(b)).map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className='DistrictDropdown'>
                <label className='District' htmlFor="districtDropdown">Select District:</label>
                <select className='SelectDistrict' id="districtDropdown" value={selectedDistrict} onChange={handleDistrictChanges}>
                  <option className='OptionDistrict' value="">Select District</option>
                  {districts.sort((a, b) => a.localeCompare(b)).map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <button className='SearchButton'
                //  onClick={handleHighlights}
                onClick={handleQuery}
              >Search</button>
            </div>

            {/* <div>
              <input type='checkbox'
              id='osm'
              value="open Street Map" 
              checked
              onChange={toggleLayer}/>
              <label for="osm">Open Street Map</label>
              <br></br>
              <input type='checkbox'
              id='States'
              value="Indian States" 
              checked
              onChange="toggleLayer(event);"/>
              <label for="osm">Open Street Map</label>
              <br></br>
              <input type='checkbox'
              id='osm'
              value="open Street Map" 
              checked
              onChange={toggleLayer}/>
              <label for="osm">Open Street Map</label>
              <br></br>
              <input type='checkbox'
              id='District'
              value="Indian District" 
              
              onChange={toggleLayer}/>
              <label for="osm">Open Street Map</label>
              <br></br>
            </div> */}
          </div>
        )}
          {/* <button onClick={handleQuery}>Query Data</button> */}

          <div className={`col-${showSidebar ? '10' : '12'} mr-0 pr-0`}>
          <button onClick={toggleSidebar}>Toggle Sidebar</button>
            <div id="popup" class="ol-popup">
              <a href='#' id='popup-closer' class="ol-popup-closer"></a>
              <div id='popup-content'></div>
            </div>
            <div id="tooltip" className='bg-dark' style={{ display: 'block' }}></div>
            <div ref={overlayRef} id="tooltip" className="ol-tooltip" />
            <div ref={mapRef} style={{ width: '101%', height: '700px' }}>

              <div id="table-container"></div>

            </div>

            {popupContent && (
              <table>
                <tbody>
                  {popupContent.map((attribute, index) => (
                    <tr key={index}>
                      <td>{attribute.key}</td>
                      <td>{attribute.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>


        {/* <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>; */}
        {/* <div style={{ height: "100vh" }}>
      <div id="map" style={{ height: "100%" }}></div>
    </div> */}
      </div>
      {/* <div className="slidercontainer_pop">
      <div style={{ paddingBottom: '30px' }}>
        <span style={{ color: 'firebrick', textAlign: 'center', float: 'left', fontWeight: 'bold', fontSize: '14px' }}>Opacity</span>
        <button onClick={props.closepop} className="close-button">x close</button>
      </div>
      <div>
        <input type="range" min="0" max="1" step="0.1" value={sliderValue} className="slider_pop" id="myrange" onChange={handleSliderChange} />
      </div>
      <div style={{ textAlign: 'center', paddingTop: '10px' }}>{props.layerList ? props.layerList.displayName : null}</div>
    </div> */}
      {/* slider div end */}
    </div>




  )
}

export default Vegitation;