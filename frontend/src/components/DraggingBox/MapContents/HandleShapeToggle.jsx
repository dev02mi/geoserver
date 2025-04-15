import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import "./HandleShapeToggle.css"; // Import the CSS file
import { useMap } from "../../UseContext/MapContext"; // Adjust the import path as needed

const HandleShapeToggle = ({ onreopentablePanel }) => {
    const { mapRef, fileLayersMap } = useMap(); // Access context values
    const { FileName } = useSelector((state) => state.drag);
    const [layerVisibility, setLayerVisibility] = useState({});
    const [LayerSVisigd, setLayerSVisigd] = useState(true);
    const [LegendVisi, setLegendVisi] = useState(true);
    const [fileNames, setFileNames] = useState([]);

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        fileName: null,
    });
    const handleMainLayer = () => {
        setLayerSVisigd(!LayerSVisigd);
    }
    const handleLegendVisi = () => {
        setLegendVisi(!LegendVisi);
    }
    const MenuTableOpen = (data) => {
        if (data) {
            onreopentablePanel(data, contextMenu.fileName);
        }
        setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
    };

    // Function to retrieve layers for a specific file
    const getFileLayers = (fileName) => {
        if (fileLayersMap.current.has(fileName)) {
            return fileLayersMap.current.get(fileName).layerGroup;
        } else {
            console.warn(`No layers found for file: ${fileName}`);
            return null;
        }
    };

    // Function to extract geometry type from a layer
    const getGeometryTypeFromLayer = (fileName) => {
        if (!fileLayersMap.current.has(fileName)) {
            console.warn(`No entry in fileLayersMap for file: ${fileName}`);
            return "Unknown";
        }

        const layerInfo = fileLayersMap.current.get(fileName);

        if (!layerInfo || !layerInfo.geometryType) {
            console.warn(`Missing or invalid layerInfo for file: ${fileName}`);
            return "Unknown";
        }

        return layerInfo.geometryType;
    };

    // Mapping of geometry types to legend descriptions
    const geometryLegendMap = {
        Point: "⚫ Represents individual points on the map.",
        LineString: "➖ Represents linear features like roads or rivers.",
        Polygon: "⬜ Represents areas such as buildings or lakes.",
        Unknown: "❓ Geometry type not recognized.",
    };

    useEffect(() => {
        // Extract file names from FileName
        if (FileName && FileName.length > 0) {
            const names = FileName.map((item) => item);
            setFileNames(names);
        } else {
            setFileNames([]);
        }
    }, [FileName]);

    useEffect(() => {
        // Initialize the visibility state for each file
        const initialVisibility = {};
        fileNames.forEach((fileName) => {
            initialVisibility[fileName] = true; // Assume all layers are visible by default
        });
        setLayerVisibility(initialVisibility);
    }, [fileNames]);

    const handleToggle = (fileName) => {
        const fileLayerGroup = getFileLayers(fileName);

        if (!fileLayerGroup) {
            console.warn(`Layer group for ${fileName} not found.`);
            return;
        }

        setLayerVisibility((prev) => {
            const isVisible = prev[fileName];

            if (isVisible) {
                // Remove the layer group from the map
                fileLayerGroup.removeFrom(mapRef.current);
                console.log(`Layer group for ${fileName} removed from the map.`);
            } else {
                // Add the layer group to the map
                fileLayerGroup.addTo(mapRef.current);
                console.log(`Layer group for ${fileName} added to the map.`);
            }

            // Return the updated state
            return {
                ...prev,
                [fileName]: !isVisible, // Toggle the visibility
            };
        });
    };

    const handleContextMenu = (event, fileName) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            fileName,
        });
    };

    const handleContextMenuOption = (option) => {
        console.log(`Selected option: ${option} for file: ${contextMenu.fileName}`);
        setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
    };

    const closeContextMenu = () =>
        setContextMenu({ visible: false, x: 0, y: 0, fileName: null });

    useEffect(() => {
        document.addEventListener("click", closeContextMenu);
        return () => {
            document.removeEventListener("click", closeContextMenu);
        };
    }, []);
    const uniqueFileNames = Array.from(new Set(fileNames));

    return (
        <div className="map-content-main-div" style={{ padding: '5px' }}>
            <label>
                <input
                    type="checkbox"
                    checked={LayerSVisigd}
                    onChange={handleMainLayer}
                    style={{ marginRight: '5px' }}
                />
                Layers
            </label>


            {LayerSVisigd && (
                uniqueFileNames.length > 0 ? (
                    uniqueFileNames.map((fileName) => {
                        const fileLayer = fileLayersMap.current.get(fileName);
                        console.log("fileLayer:-", fileLayer);
                        
                        if (!fileLayer) return null; // Skip if no layer data is found
                        const pointLegend = fileLayer?.groupColorsLegendspoint || {};
                        const lineLegend = fileLayer?.groupColorsLegendsline || {};
                        return (
                            <div
                                key={fileName}
                                style={{ marginBottom: "10px", marginLeft: '13px', position: "relative" }}
                            >
                                <label onContextMenu={(e) => handleContextMenu(e, fileName)}>
                                    <input
                                        type="checkbox"
                                        checked={layerVisibility[fileName] || false}
                                        onChange={() => handleToggle(fileName)}
                                        style={{ marginRight: '5px' }}
                                    />
                                    {fileName}
                                </label>
                                {/* Show content only if checkbox is checked */}
                                {layerVisibility[fileName] && (
                                    <div style={{ marginLeft: "20px" }}>
                                        {Object.entries(pointLegend).map(([group, { color, size }]) => (
                                            <div key={group} style={{ display: "flex", alignItems: "center" }}>
                                                <div
                                                    style={{
                                                        backgroundColor: color,
                                                        width: size * 1.5 + "px",
                                                        height: size * 1.5 + "px",
                                                        borderRadius: "50%",
                                                        marginRight: "8px",
                                                    }}
                                                />
                                                <span style={{ fontSize: '10px' }}>{group}</span>
                                            </div>
                                        ))}
                                        {Object.entries(lineLegend).map(([group, { color, size }]) => (
                                            <div key={group} style={{ display: "flex", alignItems: "center" }}>
                                                <div
                                                    style={{
                                                        backgroundColor: color,
                                                        width: size * 15 + "px",
                                                        height: size * 2,
                                                        marginRight: "8px",
                                                    }}
                                                />
                                                <span style={{ fontSize: '10px' }}>{group}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No layers available.</p>
                )
            )}

            {contextMenu.visible && (
                <div
                    style={{
                        position: "fixed",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: "#fff",
                        boxShadow: "0px 2px 10px #999",
                        zIndex: 1000,
                        // padding: "10px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="contextMenu--option"
                        disabled={true} // Initially enabled if the panel is open
                        onClick={() => MenuTableOpen("panel2-bottom")}
                    >
                        Open Table
                    </div>
                    <div
                        className="contextMenu--option"
                        onClick={() => handleContextMenuOption("Show Details")}
                    >
                        Option2nd
                    </div>
                    <div
                        className="contextMenu--option"
                        onClick={() => handleContextMenuOption("Remove Layer")}
                    >
                        Option3rd
                    </div>
                    <div className="contextMenu--separator" />
                    <div
                        className="contextMenu--option "
                        onClick={() => handleContextMenuOption("Remove Layer")}
                    >
                        Properties
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandleShapeToggle;
