import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
// import { kml } from '@tmcw/togeojson'; // Assuming toGeoJSON library is installed
import { FolderAddOutlined } from '@ant-design/icons';
import { kml } from '@mapbox/togeojson'; // Import kml function from toGeoJSON
import * as shapefile from "shapefile";


const UploadShapefile = ({ onHandleGetShapeGeo }) => {
    const [activeFormat, setActiveFormat] = useState('SHP');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [importDataGeometry, setImportDataGeometry] = useState([]);
    const [isUploaded, setIsUploaded] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // console.log("importDataGeometry ", importDataGeometry)
    const fileInputRef = useRef(null);

    useEffect(() => {
        onHandleGetShapeGeo(importDataGeometry);
    }, [importDataGeometry, onHandleGetShapeGeo])

    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };

    const extractGeometryRecursively = (data) => {
        const extractedData = [];

        function findGeometry(obj) {
            if (obj && typeof obj === 'object') {
                if (obj.geometry && obj.geometry.type && obj.geometry.coordinates) {
                    const newFeature = {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: obj.geometry.type,
                                    coordinates: obj.geometry.coordinates,
                                },
                            },
                        ],
                    };

                    if (!extractedData.some(feature =>
                        JSON.stringify(feature.features[0].geometry) === JSON.stringify(newFeature.features[0].geometry)
                    )) {
                        extractedData.push(newFeature);
                    }
                } else if (obj.type && obj.coordinates) {
                    const newFeature = {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: obj.type,
                                    coordinates: obj.coordinates,
                                },
                            },
                        ],
                    };

                    if (!extractedData.some(feature =>
                        JSON.stringify(feature.features[0].geometry) === JSON.stringify(newFeature.features[0].geometry)
                    )) {
                        extractedData.push(newFeature);
                    }
                }

                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (typeof value === 'object') {
                        findGeometry(value);
                    }
                });
            }
        }

        findGeometry(data);
        return extractedData;
    };

    const handleShapefile = async (file) => {
        return await readShapefile(file);
    };

    const handleKmlFile = async (file) => {
        const kmlData = await file.text();
        return kml(new DOMParser().parseFromString(kmlData, "text/xml"));
    };

    const handleGeoJsonFile = async (file) => {
        return JSON.parse(await file.text());
    };

    const handleKmzFile = async (file) => {
        const zip = new JSZip();
        const kmzData = await zip.loadAsync(file);
        const kmlFile = kmzData.file(/\.kml$/i)[0];
        if (kmlFile) {
            const kmlData = await kmlFile.async("text");
            return kml(new DOMParser().parseFromString(kmlData, "text/xml"));
        } else {
            alert("KMZ file does not contain a .kml file");
            return null;
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

    const handleFileUpload = async (event) => {
        try {
            const chosenFiles = Array.from(event.target.files);

            if (chosenFiles.length === 0) {
                alert("No files selected.");
                return;
            }

            for (const file of chosenFiles) {
                if (uploadedFiles.some((uploadedFile) => uploadedFile.name === file.name)) {
                    alert("You have already uploaded this file.");
                    setIsModalOpen(false);
                    continue;
                }

                let importDataGeometryLet;
                setSelectedFiles(file.name);

                if (file.name.toLowerCase().endsWith(".shp")) {
                    importDataGeometryLet = await handleShapefile(file);
                } else if (file.name.toLowerCase().endsWith(".kml")) {
                    importDataGeometryLet = await handleKmlFile(file);
                } else if (
                    file.name.toLowerCase().endsWith(".geojson") ||
                    file.name.toLowerCase().endsWith(".json")
                ) {
                    importDataGeometryLet = await handleGeoJsonFile(file);
                } else if (file.name.toLowerCase().endsWith(".kmz")) {
                    importDataGeometryLet = await handleKmzFile(file);
                } else {
                    alert("Unsupported file format");
                    continue;
                }

                setIsUploaded(true);

                const feature = extractGeometryRecursively(importDataGeometryLet);

                setUploadedFiles((prevFiles) => [...prevFiles, file]);

                feature.forEach((data) => {
                    setImportDataGeometry((prevGeometries) => [
                        ...prevGeometries,
                        { name: file.name, geometry: data },
                    ]);
                });
            }
        } catch (error) {
            alert("An error occurred while uploading files.");
            console.error(error);
        }
    };

    return (
        // <div>
        //     <button onClick={handleFileButtonClick}>Upload File</button>
        //     <input
        //         type="file"
        //         ref={fileInputRef}
        //         onChange={handleFileUpload}
        //         style={{ display: 'none' }}
        //         multiple
        //     />
        //     <ul>
        //         {uploadedFiles.map((file, index) => (
        //             <li key={index}>{file.name}</li>
        //         ))}
        //     </ul>
        // </div>
        <>
            <div className="flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept='.shp'
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <input
                    type="text"
                    placeholder="Select File from folder"
                    value={
                        uploadedFiles && uploadedFiles.length > 0
                            ? uploadedFiles.map(file => file.name).join(', ')
                            : ''
                    }
                    readOnly
                    className="w-full px-2 py-1 italic text-sm bg-white border border-gray-300 focus:outline-none"
                />
                <button
                    className="px-1 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                    onClick={handleFileButtonClick}
                >
                    <FolderAddOutlined style={{ fontSize: '15px', color: '#1890ff' }} />
                </button>
            </div>
        </>
    );
};

export default UploadShapefile;
