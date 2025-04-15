import React, { createContext, useRef, useContext } from "react";

const MapContext = createContext(null);

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }) => {
    const mapRef = useRef(null);
    // fileLayersMap is initialized as a Map object and is being used to store layer data using a unique key (e.g., line.filename + "_LineString")
    //A Map in JavaScript does not allow duplicate keys.
    //If you call set() with an existing key, it will overwrite the existing entry rather than creating a duplicate.
    const fileLayersMap = useRef(new Map()); // Add fileLayersMap to the context

    const contextValue = {
        mapRef,
        fileLayersMap, // Expose the layers map via context
    };

    return (
        <MapContext.Provider value={contextValue}>
            {children}
        </MapContext.Provider>
    );
};
