import React, { useState, useEffect, useRef } from "react";
import "./ResponseDisplay.css";
import MapTools from "./MapTools/MapTools";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const ResponseDisplay = ({ responseData, handleBackToSearch, mapRef }) => {
    const [newpopupVisible, setNewPopupVisible] = useState(false);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const polygonGroupRef = useRef([]);

    const newOpenPopup = () => {
        setNewPopupVisible(true);
    };

    const newClosePopup = () => {
        setNewPopupVisible(false);
    };

    console.log("responseData  🚢 ", responseData)


    useEffect(() => {
        // Ensure the map container exists
        if (mapRef.current) {
            // Add a base tile layer to the map
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(mapRef.current);

            // Check if Mars-bound information is available
            if (responseData && responseData.Data && responseData.Data.marsboundsinfromation) {
                const polygons = responseData.Data.marsboundsinfromation;

                console.log("first polygons 🚢 ", polygons)

                // Group polygons by DATACODE
                const groupedPolygons = {};
                polygons.forEach((polygonData) => {
                    const { DATACODE } = polygonData;
                    if (!groupedPolygons[DATACODE]) {
                        groupedPolygons[DATACODE] = [];
                    }
                    groupedPolygons[DATACODE].push(polygonData);
                });
                console.log("groupedPolygons ✈ ", groupedPolygons)

                // Create polygons for each group
                Object.values(groupedPolygons).forEach((group) => {
                    const coordinates = group.map((polygonData) => [
                        polygonData.COOD_YY,
                        polygonData.COOD_XX,
                    ]);

                    // Create a polygon from the coordinates
                    const polygon = L.polygon(coordinates, {
                        color: 'blue',
                        fillColor: 'lightblue',
                        opacity: '0.5',
                    }).addTo(mapRef.current);
                    console.log("polygon 🍗", polygon)
                    polygonGroupRef.current.push(polygon);
                    // Bind a popup with data code
                    polygon.bindPopup(`Data Code: ${group[0].DATACODE}`);
                    console.log(`Data Code: ${group[0].DATACODE}`)

                    // Add click event listener for zooming to the selected polygon
                    // polygon.on('click', () => handleZoomToProduct(group[0]));
                });
            }
        }
    }, [mapRef, responseData]);

    const handleZoomIn = (index) => {
        if (polygonGroupRef.current.length > 0) {
            const bounds = polygonGroupRef.current[index].getBounds();
            mapRef.current.fitBounds(bounds);
        }
    };


    const { marsbandsinformation, marsboundsinfromation, marsmaintabledata } =
        responseData.Data || {};


    return (
        <>
            <div className="SearchDisplayResult">
                <div className="SearchDisplayResultHeader">
                    <button onClick={handleBackToSearch} className="BackToSearchButton">Back to Search</button>
                    <div>Showing results</div>
                </div>
                {marsmaintabledata &&
                    marsmaintabledata.map((item, index) => (
                        <div className="response-item" key={item.pk}>
                            <div className="SearchDispalyResultPanel">
                                <div className="SearchDispalyResultPanelList">
                                    <div className="SearchDispalyResultPanelListItem">
                                        <div className="SearchDispalyResultPanelListItemContainer">
                                            <div
                                                className="SearchDisplayResultPrivew"
                                                title="Privew Image"
                                            >
                                                <img
                                                    src="img.png"
                                                    alt="No preview available"
                                                    className="SearchDisplayResultPrivewimg"
                                                />
                                            </div>
                                            <div className="SearchDisplayResultDetails">
                                                <div
                                                    className="SearchDisplayResultDataName"
                                                    title="DataName"
                                                >
                                                    {item.DATANAME}
                                                </div>
                                                <div className="SearchDisplayResultContent">
                                                    <div className="SearchDisplayResultOtherContent">
                                                        <strong>Comapny:&nbsp;</strong>
                                                        {item.COMP_NA}
                                                    </div>
                                                    <div className="SearchDisplayResultOtherContent">
                                                        <strong>Satellite:&nbsp;</strong>
                                                        {item.SATT_NA}
                                                    </div>
                                                    <div className="SearchDisplayResultOtherContent">
                                                        <strong>Sensor:&nbsp;</strong>
                                                        {item.SEN_NAME}
                                                    </div>
                                                    <div className="SearchDisplayResultOtherContent">
                                                        <strong>Sensing Date:&nbsp;</strong>
                                                        {item.IMG_DATE}
                                                    </div>
                                                    <div className="SearchDisplayResultOtherContent">
                                                        <strong>Size:&nbsp;</strong>
                                                        {item.DSIZE}
                                                    </div>
                                                </div>
                                            </div>
                                            <sapn className="visbtn small" title="Visualize">
                                                Visualize
                                            </sapn>
                                            <div className="SearchDisplayResultFooter">
                                                <div className="SearchDisplayResultDataTags">
                                                    <div className="SearchDisplayResultDataTag">
                                                        {item.DATACODE}
                                                    </div>
                                                    <div className="SearchDisplayResultDataTag">
                                                        {item.IMG_DAPROC}
                                                    </div>
                                                    <div className="SearchDisplayResultDataTag">
                                                        {item.IMG_DATYPE}
                                                    </div>
                                                </div>
                                                <div className="SearchDisplayResultButtons">
                                                    <i
                                                        class="fa fa-info-circle ProductInfo"
                                                        title="Product info" onClick={newOpenPopup}
                                                    ></i>
                                                    <i
                                                        class="fa fa-crosshairs"
                                                        title="Zoom to product"
                                                        onClick={() => handleZoomIn(index)}
                                                    ></i>
                                                    <i
                                                        class="fa fa-download disabled"
                                                        title="Download product"
                                                    ></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            <div id="newpopup" className="newpopup" style={{ display: newpopupVisible ? "block" : "none" }}>
                <div className="newpopup-content">
                    <h3>New One</h3>
                    <div></div>
                    <span className="newclose" onClick={newClosePopup}>❌</span>
                </div>
            </div>
        </>
    );
};

export default ResponseDisplay;