import React, { useState, useEffect, useRef } from 'react';
import "./MapTools.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import ResponseDisplay from '../ResponseDisplay';


const MapTools = ({ mapRef, onDataFromChild, setFieldsEnabled }) => {
    const [autocompleteVisible, setAutocompleteVisible] = useState(false);
    const [drawGeometry, setDrawGeometry] = useState(null);


    const toggleAutocomplete = () => {
        setAutocompleteVisible(!autocompleteVisible);
    };
    useEffect(() => {
        // Function to create a polygon based on the current map zoom
        const createPolygonOnZoom = (map) => {
            // Get the current map bounds
            const bounds = map.getBounds();
            // Create a polygon using the bounds coordinates
            const polygonCoordinates = [
                bounds.getSouthWest(),
                bounds.getNorthWest(),
                bounds.getNorthEast(),
                bounds.getSouthEast(),
                bounds.getSouthWest(),
            ];
            // Create a GeoJSON object for the polygon
            const geoJsonPolygon = {
                type: 'Polygon',
                coordinates: [polygonCoordinates.map(coord => [coord.lng, coord.lat])],
            };
            // Extract relevant drawing values and send them to the parent component
            const drawingValues = {
                type: 'Polygon', // Specify the type as Polygon
                geometry: geoJsonPolygon,
                // Add other relevant properties as needed
            };
            console.log("🈳🚢✈ == ", drawingValues);
            // Set initial draw geometry state
            // setDrawGeometry(drawingValues);
            // onDataFromChild(drawingValues);
        };

        if (mapRef.current) {
            setTimeout(() => {
                // Initialize Leaflet Geoman
                const geoman = mapRef.current.pm;

                // Add an event handler for zoom
                mapRef.current.on('zoomend', () => {
                    console.log('Zoomed In');
                    // Create a polygon when zoomed in (customize this logic)
                    // createPolygonOnZoom(mapRef.current);
                });

                if (geoman) {
                    // Add Geoman controls
                    geoman.addControls({
                        position: 'topright',
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
                        removalMode: true,
                        drawText: false
                    });

                    mapRef.current.on('pm:remove', function (e) {
                        // Disable fields when a polygon is removed
                        setFieldsEnabled(false);
                    });

                    // Event handler for Geoman drawing
                    mapRef.current.on('pm:create', function (e) {
                        const drawnLayer = e.layer;
                        // Extract relevant drawing values and send them to the parent component
                        const drawingValues = {
                            type: drawnLayer.pm.options.layerType,
                            geometry: drawnLayer.toGeoJSON().geometry,
                            // Add other relevant properties as needed
                        };
                        console.log("🈳🚢✈ == ", drawingValues);
                        // Set initial draw geometry state
                        setDrawGeometry(drawingValues);
                        onDataFromChild(drawingValues);
                        // Event handler for shape editing
                        drawnLayer.on('pm:edit', function (editEvent) {
                            // Extract updated editing values and send them to the parent component
                            const updatedValues = {
                                type: drawnLayer.pm.options.layerType,
                                geometry: drawnLayer.toGeoJSON().geometry,
                                // Add other relevant properties as needed
                            };
                            console.log("🔧 Edit == ", updatedValues);
                            // Update your state or trigger a callback function with the updated values
                            setDrawGeometry(updatedValues);
                            onDataFromChild(updatedValues);
                        });
                    });
                }
            }, 100); //This delay allows the Leaflet map to fully initialize before adding Geoman controls, which may help to resolve the addTo issue. Adjust the delay value as needed based on your application's requirements.
        }
    }, [mapRef]);


    // useEffect(() => {
    //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         maxZoom: 19,
    //     }).addTo(mapRef.current);
    //     if (responseData && responseData.Data && responseData.Data.marsboundsinfromation) {
    //         const polygons = responseData.Data.marsboundsinfromation;

    //         // Group polygons by DATACODE
    //         const groupedPolygons = {};
    //         polygons.forEach((polygonData) => {
    //             const { DATACODE } = polygonData;
    //             if (!groupedPolygons[DATACODE]) {
    //                 groupedPolygons[DATACODE] = [];
    //             }
    //             groupedPolygons[DATACODE].push(polygonData);
    //         });

    //         // Create polygons for each group
    //         Object.values(groupedPolygons).forEach((group) => {
    //             const coordinates = group.map((polygonData) => [
    //                 polygonData.COOD_YY,
    //                 polygonData.COOD_XX,
    //             ]);

    //             // Create a polygon from the coordinates
    //             const polygon = L.polygon(coordinates, {
    //                 color: 'blue',
    //                 fillColor: 'lightblue',
    //             }).addTo(mapRef.current);

    //             // Bind a popup with data code
    //             polygon.bindPopup(`Data Code: ${group[0].DATACODE}`);
    //             // const dataCode = group[0].DATACODE;
    //             // polygon.on('click', () => handlePolygonClick(dataCode));


    //             // const zoomButton = document.createElement("button");
    //             // zoomButton.innerText = `Zoom to Polygon ${group[0].DATACODE}`;
    //             // zoomButton.addEventListener("click", () => {
    //             //   const polygonBounds = L.polygon(coordinates).getBounds();
    //             //   mapRef.current.fitBounds(polygonBounds);
    //             // });

    //             // // Append the button to the UI
    //             // document.getElementById("search").appendChild(zoomButton);

    //         });
    //     }
    // }, [responseData]);




    return (
        <>
            <div>
                {/* <div id="searchMap" className="mapbox">
                    <div id="SearchCoordinate"></div>
                </div> */}
                <div className="ui-widget" id="search">
                    <input id="autocomplete" placeholder="Search for: State" style={{ display: autocompleteVisible ? 'inline-block' : 'none' }} />
                    <i class="fa fa-search" aria-hidden="true" id="SearchButton" onClick={toggleAutocomplete}></i>
                </div>
            </div>
        </>
    )
}

export default MapTools;