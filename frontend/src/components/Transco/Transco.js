import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { ReactComponent as ChevronCollapse } from './chevron-collapse.svg';
import './Transco.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Preloader from "../Preloader/Preloader";





const Transco = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const mapRef = useRef(null);
  const geoserverLayers = useRef([]);
  const [layerCheckboxes, setLayerCheckboxes] = useState([]);
  const [legendLayers, setLegendLayers] = useState([]);
  const [sliderValue, setSliderValue] = useState(100);
  const [transcoMenu, setTranscoMenu] = useState(false);
  const [currentBaseMap, setCurrentBaseMap] = useState("OpenStreetMap");
  const [openToolModel, setopenToolModel] = useState(false);
  const [pathTransco, setPathTransco] = useState("");

  const [GdbFolderPath, setGdbFolderPath] = useState('');
  const [OutputFolderPath, setOutputFolderPath] = useState('');

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


  const handleGdbFolderPath = (event) => {
    setGdbFolderPath(event.target.value);
  };
  const handleOutputFolderPath = (event) => {
    setOutputFolderPath(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      LoaderUpdateProgress();
      const response = await axios.post('http://127.0.0.1:8000/search/upload_gdb/', {
        GdbFolderPath, OutputFolderPath,
      });
      console.log('Value submitted successfully:', response.data);
      Swal.fire({
        icon: 'success',
        title: 'Successful',
        html: `Transco Standard QC Report Successfully Saved in this Path - <p class="output-folder-path">${OutputFolderPath}</p>`,
      })
      setopenToolModel(false);
      setGdbFolderPath('');
      setOutputFolderPath('');
    } catch (error) {
      console.error('Error during submission:', error);
      let errorMessage = 'An error occurred in response. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      Swal.fire({
        icon: 'error',
        title: 'API Response Error',
        text: errorMessage,
      });
      setopenToolModel(false);
      setGdbFolderPath('');
      setOutputFolderPath('');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const HandleOpenopenToolModel = () => {
    setopenToolModel(true);
  };

  const HandleCloseopenToolModel = () => {
    setopenToolModel(false);
  };

  // const handleFileChangeTransco = (e) => {
  //   const filePath = e.target.value;
  //   const fileName = filePath.split("\\").pop().split("/").pop();
  //   setPathTransco(fileName);
  //   // const file = e.target.files[0];
  //   // setSaveUploadedFile(file);
  //   // setPath(file.name);
  // };

  // useEffect(() => {
  //   const handleFileUpload = async () => {
  //     try {
  //       const formData = new FormData();
  //       formData.append("file", document.getElementById("TranscomyFile").files[0]);
  //       console.log("📁", formData)

  //       // Replace 'YOUR_DJANGO_API_ENDPOINT' with your actual Django API endpoint
  //       const response = await axios.post('YOUR_DJANGO_API_ENDPOINT', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });

  //       console.log('File uploaded successfully:', response.data);
  //     } catch (error) {
  //       console.error('Error during file upload:', error);
  //     }
  //   };


  //   // Call the uploadFile function whenever the 'path' state changes
  //   if (pathTransco !== "") {
  //     // Call the file upload function when the component mounts
  //     handleFileUpload();
  //   }
  // }, [pathTransco]); // Empty dependency array ensures this effect runs only once when the component mounts



  // Declare base map layers
  const streetMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }
  );

  const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: "© OpenStreetMap contributors",
  });
  const blankMap = L.tileLayer("", {
    attribution: "Blank Map",
    // You can customize options for the blank map here
  });

  const baseMaps = {
    OpenStreetMap: streetMap,
    EsriWorldImagery: Esri_WorldImagery,
    BlankMap: blankMap, // Add this line to include the blank map
  };

  const fetchLegendGraphic = async (layerName) => {
    try {
      const legendUrl = `http://localhost:8080/geoserver/transco/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${layerName}`;
      const response = await axios.get(legendUrl, {
        responseType: "arraybuffer",
      });
      const legendBlob = new Blob([response.data], { type: "image/png" });
      const legendUrlObject = URL.createObjectURL(legendBlob);
      return legendUrlObject;
    } catch (error) {
      alert(`Error fetching legend for layer ${layerName}:`, error);
      return null;
    }
  };

  const fetchGeoServerLayers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/geoserver/transco/ows",
        {
          params: {
            service: "wms",
            version: "1.3.0",
            request: "GetCapabilities",
          },
        }
      );

      const layers = parseCapabilities(response.data);
      // console.log("layers ⚪🏠🎉🎶", layers)

      // Initialize geoserverLayers.current as an empty array
      geoserverLayers.current = [];

      // Separate layers into categories
      const stateLayers = layers.filter((layer) =>
        ["A_TSADMINPO", "B_TS_STATE", "C_TS_DISTRICT", "D_TS_MANDAL"].includes(
          layer.Name
        )
      );
      const transcoLayers = layers.filter((layer) =>
        ["E_TTADMINPO", "F_TT_ZONE", "G_TT_CIRCLE"].includes(
          layer.Name
        )
      );
      const assetLayers = layers.filter((layer) =>
        ["H_TT_SS_LOCA", "I_TT_SS_BOUND", "J_TT_TLINES", "K_TT_TLTOWERS"].includes(
          layer.Name
        )
      );

      // Create WMS layers for each category
      const stateWMSLayers = stateLayers.map((layer) => createWMSLayer(layer));
      const transcoWMSLayers = transcoLayers.map((layer) =>
        createWMSLayer(layer)
      );
      const assetWMSLayers = assetLayers.map((layer) => createWMSLayer(layer));

      geoserverLayers.current = [
        ...stateWMSLayers,
        ...transcoWMSLayers,
        ...assetWMSLayers,
      ];

      const checkboxes = layers.map(async (layer, index) => {
        const legendUrl = await fetchLegendGraphic(layer.Name);
        return {
          name: layer.Name,
          title: layer.Title,
          checked: true,
          legendUrl: legendUrl,
        };
      });

      Promise.all(checkboxes).then((checkboxes) => {
        setLayerCheckboxes(checkboxes);
      });

      // Show all layers by default
      if (mapRef.current && geoserverLayers.current.length > 0) {
        geoserverLayers.current.forEach((layer) => {
          mapRef.current.addLayer(layer);
        });
      }
      // Re-render the legend with updated checkbox states
      renderLegend();
    } catch (error) {
      alert("Error fetching GeoServer layers:", error);
    }
  };

  const createWMSLayer = (layer) => {
    return L.tileLayer.wms("http://localhost:8080/geoserver/transco/wms", {
      layers: layer.Name,
      format: "image/png",
      transparent: true,
      zIndex: 9999,
    });
  };

  const parseCapabilities = (capabilities) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(capabilities, "text/xml");
    const layers = xmlDoc.querySelectorAll('Layer[queryable="1"]');
    return Array.from(layers).map((layer) => ({
      Name: layer.querySelector("Name").textContent,
      Title: layer.querySelector("Title").textContent,
    }));
  };

  const handleCheckboxChange = (layerName) => {
    const updatedCheckboxes = layerCheckboxes.map((checkbox) =>
      checkbox.name === layerName
        ? { ...checkbox, checked: !checkbox.checked }
        : checkbox
    );
    console.log("updatedCheckboxes 🎆", updatedCheckboxes)

    setLayerCheckboxes(updatedCheckboxes);

    if (mapRef.current && geoserverLayers.current.length > 0) {
      // Toggle visibility of GeoServer layers based on checkbox state
      updatedCheckboxes.forEach((checkbox, i) => {
        const layer = geoserverLayers.current[i];
        if (layer) {
          if (checkbox.checked) {
            mapRef.current.addLayer(layer);
          } else {
            mapRef.current.removeLayer(layer);
          }
        }
      });
    }

    // Re-render the legend with updated checkbox states
    renderLegend();
  };

  const renderLegend = () => {
    const stateLayers = layerCheckboxes.filter((checkbox) =>
      ["A_TSADMINPO", "B_TS_STATE", "C_TS_DISTRICT", "D_TS_MANDAL"].includes(
        checkbox.name
      )
    );
    const transcoLayers = layerCheckboxes.filter((checkbox) =>
      ["E_TTADMINPO", "F_TT_ZONE", "G_TT_CIRCLE"].includes(
        checkbox.name
      )
    );
    const assetLayers = layerCheckboxes.filter((checkbox) =>
      ["H_TT_SS_LOCA", "I_TT_SS_BOUND", "J_TT_TLINES", "K_TT_TLTOWERS"].includes(
        checkbox.name
      )
    );

    const renderLayerGroup = (layers, title) => (
      <div key={title}>
        <h4>{title}</h4>
        {layers.map((checkbox) => (
          <div key={checkbox.name}>
            <input
              type="checkbox"
              id={checkbox.name}
              checked={checkbox.checked}
              onChange={() => handleCheckboxChange(checkbox.name)}
            />
            &ensp;
            <label htmlFor={checkbox.name}>{checkbox.title}</label>
            {checkbox.legendUrl && (
              <img
                src={checkbox.legendUrl}
                alt={`Legend for ${checkbox.title}`}
                style={{ marginLeft: "10px", width: "20px", height: "20px" }}
              />
            )}
          </div>
        ))}
      </div>
    );

    setLegendLayers(
      <>
        {renderLayerGroup(stateLayers, "Administrative Layers of State")}
        {renderLayerGroup(transcoLayers, "Administrative Layers of TSTRANSCO")}
        {renderLayerGroup(assetLayers, "Electric Assets")}
      </>
    );
  };

  const handleOpacityChange = () => {
    if (geoserverLayers.current.length > 0) {
      geoserverLayers.current.forEach((layer) => {
        layer.setOpacity(sliderValue / 100);
      });
    }
  };



  useEffect(() => {
    mapRef.current = L.map("map", { layers: [baseMaps[currentBaseMap]] }).setView([18.1124, 79.0193], 7);
    mapRef.current.zoomControl.setPosition("bottomright");

    L.control.layers({
      'OpenStreetMap': streetMap,
      'EsriWorldImagery': Esri_WorldImagery,
      'BlankMap': blankMap, // Add this line to include the blank map
    }, {}, { collapsed: true }).addTo(mapRef.current);

    mapRef.current.on('baselayerchange', (event) => {
      setCurrentBaseMap(event.name);
      console.log("setcurrentbasemap", event.name);

      if (event.name && mapRef.current) {
        // Show layers when changing the base map
        geoserverLayers.current.forEach(layer => {
          mapRef.current.addLayer(layer);
        });
      }
    });
    console.log("basemap", currentBaseMap);
    // mapRef.current = L.map("map").setView([20.5937, 78.9629], 4.5);
    // mapRef.current.zoomControl.setPosition("bottomright");

    // // Add the base maps to the map
    // L.control.layers(baseMaps).addTo(mapRef.current);
    // streetMap.addTo(mapRef.current); // Default base map

    fetchGeoServerLayers();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [currentBaseMap]);

  useEffect(() => {
    renderLegend();
    handleOpacityChange();
  }, [sliderValue, layerCheckboxes]);


  const toggleTools = () => {
    setTranscoMenu(!transcoMenu);
  };


  // const toggleTools = () => {
  //   setTranscoMenu(!transcoMenu);
  //   if (!transcoMenu && mapRef.current) {
  //     // Hide layers when opening the slider bar
  //     geoserverLayers.current.forEach(layer => {
  //       mapRef.current.removeLayer(layer);
  //     });
  //   } else if (transcoMenu && mapRef.current) {
  //     // Show layers when closing the slider bar
  //     geoserverLayers.current.forEach(layer => {
  //       mapRef.current.addLayer(layer);
  //     });
  //   }
  // };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Preloader loading={loading} progress={progress} />
      <div
        style={{
          width: "20%",
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRight: "1px solid #dee2e6",
          overflowY: "auto",
          maxHeight: "80vh",
          display: transcoMenu ? 'block' : 'none',
        }}
      >
        <h2>Transco</h2>
        {legendLayers}
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
        />
        <p>Opacity: {sliderValue}%</p>
      </div>
      <div style={{ flex: 1 }}>
        <div id="map" style={{ height: "85.6vh", width: "100%" }}>
          <div className="TranscoOpen-tools" onClick={toggleTools} >
            {/* Show the open/close button based on the transcoMenu state */}
            {transcoMenu ? (
              <ChevronCollapse className="TranscoChevron-collapse" onClick={toggleTools} title="Close Slider Bar" />
              // <i className="fa fa-times ToolsClose" />
            ) : (
              <i className="fa fa-bars ToolsOpen" title="Open Slider Bar" />
            )}
          </div>
          <button className="OpenTool" onClick={HandleOpenopenToolModel}>OpenTool</button>
        </div>
      </div>
      <div className="OpenToolModel" id="OpenToolModel" style={{ display: openToolModel ? "block" : "none" }}>
        <div className="OpenToolModelContent">
          <div className="OpenToolModelHeader">
            <div className="OpenToolModelHeadingBox">
              <span className="OpenToolModelHeading">GDBQC</span>
            </div>
            <div className="OpenToolModelClosebox">
              <span className="OpenToolModelCloseBtn" onClick={HandleCloseopenToolModel}>
                &#9932;
              </span>
            </div>
          </div>
          <div className="OpenToolModelBody">
            <div className="OpenToolModelBodyFirstBox">
              {/* <div>
                <label className="zip_label">Select The GEODATABASE:</label>
                <br />
                <input
                  type="text"
                  id="TranscoPath"
                  className="TranscoPath"
                  placeholder="Selected File.."
                  readOnly
                  value={pathTransco}
                />
                <button title={'Upload File Here'} >
                  <FontAwesomeIcon
                    className="TranscoUploadIcon"
                    icon={faFolderPlus}
                  />
                  <input
                    type="file"
                    id="TranscomyFile"
                    name="TranscoFile"
                    className="TranscoFile"
                    required
                    accept=".zip"
                    onChange={handleFileChangeTransco}
                  />
                </button>
              </div> */}
              <div>
                <form onSubmit={handleSubmit} >
                  <div>
                    <label htmlFor="inputValue" className="zip_label">
                      Enter GDB Folder Path:
                    </label>
                    <br />
                    <input
                      type="text"
                      id="gdbfolderpath"
                      name="GdbFolderPath"
                      value={GdbFolderPath}
                      onChange={handleGdbFolderPath}
                      required
                      className="GdbFolderPath"
                    />
                  </div>
                  <div>
                    <label htmlFor="inputValue" className="zip_label">
                      Enter Output Folder Path:
                    </label>
                    <br />
                    <input
                      type="text"
                      id="OutputFolderPath"
                      name="OutputFolderPath"
                      value={OutputFolderPath}
                      onChange={handleOutputFolderPath}
                      required
                      className="OutputFolderPath"
                    />
                  </div>
                  <br />
                  <button type="submit" title="Submit Value" className="SubmitGDBForm">
                    Submit
                  </button>
                </form>
              </div>
            </div>
            <div className="OpenToolModelBodySecondBox">
              <div className="OpenToolModelBOX">
                <span className="OpenToolModelHeading">GDBQC</span>
                <p>This ios for the quality checking of the feature database and feature classes. It also checks the Domain tables and the other object tables. </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Transco;