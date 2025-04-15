// import React, { useState } from 'react';
// import JSZip from 'jszip';
// import axios from 'axios';

// const ArchivalComponent = () => {
//     const [file, setFile] = useState(null);
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             setMessage('Please select a zip file to upload.');
//             return;
//         }

//         setLoading(true);
//         setMessage('');

//         try {
//             const zip = new JSZip();
//             console.log("Zip ", zip)
//             const content = await zip.loadAsync(file);
//             console.log("content ", content)
//             let fileNames = [];

//             // Collect all file names
//             content.forEach((relativePath, zipEntry) => {
//                 fileNames.push(relativePath);
//             });

//             const desiredFile = 'DIM_';
//             const desiredPrefix = 'PREVIEW_';
//             const desiredExtension = '.jpg';

//             // Filter files based on the criteria
//             const matchingFiles = fileNames.filter(item => item.includes(desiredFile) && item.endsWith('.XML'));
//             const matchingFilesJpg = fileNames.filter(item => item.includes(desiredPrefix) && item.toLowerCase().endsWith(desiredExtension));

//             setMessage(`Found files: ${matchingFiles.join(', ')}\nFound jpg files: ${matchingFilesJpg.join(', ')}`);

//             if (matchingFiles.length === 0) {
//                 setMessage('No matching XML files found in the zip.');
//                 setLoading(false);
//                 return;
//             }

//             // Create new zip with the found files
//             const newZip = new JSZip();
//             for (const filePath of matchingFiles) {
//                 const fileContent = await content.file(filePath).async('blob');
//                 newZip.file(filePath, fileContent);
//             }

//             for (const filePath of matchingFilesJpg) {
//                 const fileContent = await content.file(filePath).async('blob');
//                 newZip.file(filePath, fileContent);
//             }

//             const newZipBlob = await newZip.generateAsync({ type: 'blob' });

//             // Create form data
//             const formData = new FormData();
//             formData.append('file', newZipBlob, 'filtered.zip');
//             formData.append('data', JSON.stringify({ mission: "PHR", option: "MONO" }));

//             // Send to backend
//             const response = await axios.post('http://127.0.0.1:8000/archival/my_new_file_upload_view_tri_sterio/', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });

//             setMessage(`File uploaded successfully: ${response.data.COUNT_XML_FILE}`);
//         } catch (error) {
//             console.error(error);
//             setMessage('An error occurred while processing the zip file.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className='mainbox'>
//             <input type="file" accept=".zip" onChange={handleFileChange} multiple />
//             <button onClick={handleUpload} disabled={loading}>
//                 {loading ? 'Uploading...' : 'Upload'}
//             </button>
//             {message && <p>{message}</p>}
//             {loading && <div className="loader"></div>}
//             <style jsx>{`
//             .mainbox{
//             height:200px
//             }
//                 .loader {
//                     width: 40px;
//                     height: 40px;
//                     position: relative;
//                     left: 20px;
//                     --c: no-repeat linear-gradient(#25b09b 0 0);
//                     background:
//                         var(--c) center/100% 10px,
//                         var(--c) center/10px 100%;
//                 }
//                 .loader:before {
//                     content: '';
//                     position: absolute;
//                     inset: 0;
//                     background:
//                         var(--c) 0 0,
//                         var(--c) 100% 0,
//                         var(--c) 0 100%,
//                         var(--c) 100% 100%;
//                     background-size: 15.5px 15.5px;
//                     animation: l16 1.5s infinite cubic-bezier(0.3, 1, 0, 1);
//                 }
//                 @keyframes l16 {
//                     33% { inset: -10px; transform: rotate(0deg); }
//                     66% { inset: -10px; transform: rotate(90deg); }
//                     100% { inset: 0; transform: rotate(90deg); }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default ArchivalComponent;


import React, { useState, useEffect } from 'react';
import { BlobReader, BlobWriter, ZipReader, ZipWriter } from '@zip.js/zip.js';
import axios from 'axios';
import GeopicxTables from '../GeopicxTables/GeopicxTables';
import ArchivalValidationComponent from "./ArchivalFromValidation/ArchivalValidationComponent.js";

// Don't Delete This Links
// https://gildas-lormeau.github.io/zip.js/   {refer}
// read zip file tools webase {https://gildas-lormeau.github.io/zip.js/demos/demo-read-file.html}
// manage zip file tools {https://gildas-lormeau.github.io/zip-manager/}


const ArchivalComponent = () => {
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [response, setResponse] = useState(null);
    const [tables, setTables] = useState([]);


    const handleFileChange = (event) => {
        setFiles(Array.from(event.target.files));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage('Please select zip files to upload.');
            return;
        }

        setLoading(true);
        setMessage('');
        setDownloadUrl('');

        try {
            let allMessages = [];

            // Create new zip to hold the filtered files
            const newZipBlobWriter = new BlobWriter('application/zip');
            const newZipWriter = new ZipWriter(newZipBlobWriter);

            for (const file of files) {
                const zipFileReader = new BlobReader(file);
                const zipReader = new ZipReader(zipFileReader);
                const entries = await zipReader.getEntries();
                let fileNames = entries.map(entry => entry.filename);

                const desiredFile = 'DIM_';
                const desiredPrefix = 'PREVIEW_';
                const desiredExtension = '.jpg';

                // Filter files based on the criteria
                const matchingFiles = fileNames.filter(item => item.includes(desiredFile) && item.endsWith('.XML'));
                const matchingFilesJpg = fileNames.filter(item => item.includes(desiredPrefix) && item.toLowerCase().endsWith(desiredExtension));

                allMessages.push(`In ${file.name} found files: ${matchingFiles.join(', ')}\nFound jpg files: ${matchingFilesJpg.join(', ')}`);

                if (matchingFiles.length === 0) {
                    allMessages.push(`No matching XML files found in ${file.name}.`);
                    await zipReader.close();
                    continue;
                }

                // Add matching files to the new zip
                for (const filePath of matchingFiles) {
                    const entry = entries.find(entry => entry.filename === filePath);
                    const fileContent = await entry.getData(new BlobWriter());
                    await newZipWriter.add(filePath, new BlobReader(fileContent));
                }

                for (const filePath of matchingFilesJpg) {
                    const entry = entries.find(entry => entry.filename === filePath);
                    const fileContent = await entry.getData(new BlobWriter());
                    await newZipWriter.add(filePath, new BlobReader(fileContent));
                }

                await zipReader.close();
            }

            const newZipBlob = await newZipWriter.close();

            // Create form data
            const formData = new FormData();
            formData.append('file', newZipBlob, 'filtered_files.zip');
            formData.append('data', JSON.stringify({ mission: "PHR", option: "MONO" }));

            // Send to backend
            const response = await axios.post('http://127.0.0.1:8000/archival/my_new_file_upload_view_tri_sterio/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            allMessages.push(`Files uploaded successfully: ${response.data.COUNT_XML_FILE}`);
            setResponse(response.data.tags_present_in_xml_file);

            // Set download URL
            const downloadUrl = URL.createObjectURL(newZipBlob);
            setDownloadUrl(downloadUrl);

            setMessage(allMessages.join('\n'));
        } catch (error) {
            console.error(error);
            setMessage('An error occurred while processing the zip files.');
        } finally {
            setLoading(false);
        }
    };
    // console.log(response);

    // const tabless = [
    //     {
    //         name: "Table 1",
    //         columns: [
    //             { header: "Column 1", accessor: "col1" },
    //             { header: "Column 2", accessor: "col2" },
    //         ],
    //         data: [
    //             { col1: "Data 1-1", col2: "Data 1-2" },
    //             { col1: "Data 1-3", col2: "Data 1-4" },
    //         ],
    //     },
    //     {
    //         name: "Table 2",
    //         columns: [
    //             { header: "Column A", accessor: "colA" },
    //             { header: "Column B", accessor: "colB" },
    //         ],
    //         data: [
    //             { colA: "Data 2-1", colB: "Data 2-2" },
    //             { colA: "Data 2-3", colB: "Data 2-4" },
    //         ],
    //     },
    //     {
    //         name: "Table 3",
    //         columns: [
    //             { header: "Column A", accessor: "colA" },
    //             { header: "Column B", accessor: "colB" },
    //         ],
    //         data: [
    //             { colA: "Data 2-1", colB: "Data 2-2" },
    //             { colA: "Data 2-3", colB: "Data 2-4" },
    //         ],
    //     },
    //     {
    //         name: "Table 4",
    //         columns: [
    //             { header: "Column A", accessor: "colA" },
    //             { header: "Column B", accessor: "colB" },
    //         ],
    //         data: [
    //             { colA: "Data 2-1", colB: "Data 2-2" },
    //             { colA: "Data 2-3", colB: "Data 2-4" },
    //         ],
    //     },
    // ];

    const requiredKeys = [
        "CL_REF", "COMP_NA", "DAREA", "DAREA_UNIT", "DATACODE", "DATANAME", "DCLOUD", "DCLOUD_UNIT",
        "DFORMAT", "DPRJ_TABLE", "DQLNAME", "DSNOW", "DSNOW_UNIT", "D_AQ_BITS", "D_NBANDS", "D_NBITS",
        "D_NCOLS", "D_NROWS", "D_NTILES", "D_PIXELX", "D_PR_BITS", "D_SIGN", "D_TYPE", "IMG_DAPROC",
        "IMG_DATE", "IMG_DATYPE", "SATT_NA", "SEN_NAME_1", "SEN_NAME_2", "ZIP_SIZE", "file_name_xml"
    ];

    /// this code make saprate table every rows
    // useEffect(() => {
    //     if (response) {
    //         const processedTables = response.map((item, index) => {
    //             // Filter the item to include only the required keys
    //             const filteredItem = Object.fromEntries(
    //                 Object.entries(item).filter(([key]) => requiredKeys.includes(key))
    //             );
    //             return {
    //                 name: `Table ${index + 1}`,
    //                 columns: requiredKeys.map(key => ({
    //                     header: key,
    //                     accessor: key
    //                 })),
    //                 data: [filteredItem]
    //             };
    //         });
    //         setTables(processedTables);
    //     }
    // }, [response]);

    const openModal = (row) => {
        // Your modal opening logic here
        alert(`Open modal for ${row.name}`);
    };
    const CustomComponent = ({ data }) => (
        <div>
            Custom Component for {data.name}
        </div>
    );
    // const tabless = [
    //     {
    //         name: 'Example Table',
    //         columns: [
    //             { header: 'Name', accessor: 'name' },
    //             {
    //                 header: 'Actions',
    //                 accessor: 'actions',
    //                 render: (row) => (
    //                     <button onClick={() => openModal(row)}>Open Modal</button>
    //                 )
    //             },
    //             {
    //                 header: 'Custom',
    //                 accessor: 'custom',
    //                 render: (row) => (
    //                     <CustomComponent data={row} />
    //                 )
    //             }
    //         ],
    //         data: [
    //             { name: 'John Doe' },
    //             { name: 'Jane Smith' }
    //         ]
    //     }
    // ];

    useEffect(() => {
        if (response) {
            const processedData = response.map(item => {
                // Filter the item to include only the required keys
                return Object.fromEntries(
                    Object.entries(item).filter(([key]) => requiredKeys.includes(key))
                );
            });
            const singleTable = {
                name: "Combined Table",
                columns: requiredKeys.map(key => ({
                    header: key,
                    accessor: key
                })),
                data: processedData
            };
            const secondtable = {
                name: "Table 3",
                columns: [
                    { header: "Column A", accessor: "colA" },
                    { header: "Column B", accessor: "colB" },
                ],
                data: [
                    { colA: "Data 2-1", colB: "Data 2-2" },
                    { colA: "Data 2-3", colB: "Data 2-4" },
                ],
            }

            setTables([singleTable, secondtable]);
        }
    }, [response]);


    const tablesss = [
        {
            "name": "Table 1",
            "columns": [
                { "header": "id", "accessor": "id" },
                { "header": "DATACODE", "accessor": "DATACODE" },
                { "header": "DATANAME", "accessor": "DATANAME" },
                { "header": "COMP_NA", "accessor": "COMP_NA" },
                { "header": "SATT_NA", "accessor": "SATT_NA" },
                { "header": "CL_REF", "accessor": "CL_REF" },
                { "header": "CL_ORDNA", "accessor": "CL_ORDNA" },
                { "header": "CL_PROJNA", "accessor": "CL_PROJNA" },
                { "header": "CL_PURPOSE", "accessor": "CL_PURPOSE" },
                { "header": "CL_ADDRESS1", "accessor": "CL_ADDRESS1" },
                { "header": "CL_ADDRESS2", "accessor": "CL_ADDRESS2" },
                { "header": "SEN_NAME", "accessor": "SEN_NAME" },
                { "header": "IMG_DATYPE", "accessor": "IMG_DATYPE" },
                { "header": "IMG_DAPROC", "accessor": "IMG_DAPROC" },
                { "header": "IMG_DATE", "accessor": "IMG_DATE" },
                { "header": "IMG_DT_RNG", "accessor": "IMG_DT_RNG" },
                { "header": "DLOCA_CY", "accessor": "DLOCA_CY" },
                { "header": "DLOCA_ST", "accessor": "DLOCA_ST" },
                { "header": "DLOCA_DT", "accessor": "DLOCA_DT" },
                { "header": "DLOCA_LOCA", "accessor": "DLOCA_LOCA" },
                { "header": "DAREA", "accessor": "DAREA" },
                { "header": "DSIZE", "accessor": "DSIZE" },
                { "header": "DQLNAME", "accessor": "DQLNAME" },
                { "header": "DFORMAT", "accessor": "DFORMAT" },
                { "header": "DCLOUD", "accessor": "DCLOUD" },
                { "header": "DSNOW", "accessor": "DSNOW" },
                { "header": "D_AQ_BITS", "accessor": "D_AQ_BITS" },
                { "header": "D_PR_BITS", "accessor": "D_PR_BITS" },
                { "header": "DPRJ_TABLE", "accessor": "DPRJ_TABLE" },
                { "header": "DPRJ_NAME", "accessor": "DPRJ_NAME" },
                { "header": "D_NROWS", "accessor": "D_NROWS" },
                { "header": "D_NCOLS", "accessor": "D_NCOLS" },
                { "header": "D_NBANDS", "accessor": "D_NBANDS" },
                { "header": "D_NTILES", "accessor": "D_NTILES" },
                { "header": "D_TYPE", "accessor": "D_TYPE" },
                { "header": "D_NBITS", "accessor": "D_NBITS" },
                { "header": "D_SIGN", "accessor": "D_SIGN" },
                { "header": "D_IN_ANGL", "accessor": "D_IN_ANGL" },
                { "header": "D_GSD_AXT", "accessor": "D_GSD_AXT" },
                { "header": "D_GSD_ALT", "accessor": "D_GSD_ALT" },
                { "header": "D_PIXELX", "accessor": "D_PIXELX" },
                { "header": "D_PIXELY", "accessor": "D_PIXELY" },
                { "header": "AL_DA_PATH", "accessor": "AL_DA_PATH" },
                { "header": "AL_SH_PATH", "accessor": "AL_SH_PATH" },
                { "header": "AL_QL_PATH", "accessor": "AL_QL_PATH" },
                { "header": "XML_FILE", "accessor": "XML_FILE" }
            ],
            "data": [
                {
                    "id": 1,
                    "DATACODE": "AB823728",
                    "DATANAME": "DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008910",
                    "CL_ORDNA": "gfg",
                    "CL_PROJNA": "gdg",
                    "CL_PURPOSE": "fgdg",
                    "CL_ADDRESS1": "dgg",
                    "CL_ADDRESS2": "dfgg",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "23-03-2019",
                    "IMG_DT_RNG": "ggf",
                    "DLOCA_CY": "dgd",
                    "DLOCA_ST": "dfdg",
                    "DLOCA_DT": "dfgg",
                    "DLOCA_LOCA": "fg",
                    "DAREA": 69.5517,
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_201903230538130_ORT_3917261101.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "0",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29372",
                    "D_NCOLS": "15407",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "26.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "dfgdg",
                    "AL_SH_PATH": "dg",
                    "AL_QL_PATH": "fgdg",
                    "XML_FILE": "DIM_PHR1B_PMS_201903230538130_ORT_3917261101.XML"
                },
                {
                    "id": 2,
                    "DATACODE": "AB340502",
                    "DATANAME": "PNEO3_202308040551179_PMS-FS_ORT",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PNEO",
                    "CL_REF": "A9-AOI",
                    "CL_ORDNA": "sadad",
                    "CL_PROJNA": "adasd",
                    "CL_PURPOSE": "adad",
                    "CL_ADDRESS1": "asdasd",
                    "CL_ADDRESS2": "asdasd",
                    "SEN_NAME": "PNEO 3",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS-FS",
                    "IMG_DATE": "04-08-2023",
                    "IMG_DT_RNG": "asdad",
                    "DLOCA_CY": "sdad",
                    "DLOCA_ST": "adad",
                    "DLOCA_DT": "asda",
                    "DLOCA_LOCA": "sdad",
                    "DAREA": "103.8210153",
                    "DSIZE": "8.8 GB",
                    "DQLNAME": "PREVIEW_PNEO3_202308040551179_PMS-FS_ORT_PWOI_000116673_1_2_F_1.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "64.74064722",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "16",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32644",
                    "D_NROWS": "34608",
                    "D_NCOLS": "34776",
                    "D_NBANDS": "6",
                    "D_NTILES": "4",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "31.67836468",
                    "D_GSD_AXT": "0.40711993",
                    "D_GSD_ALT": "0.343409747",
                    "D_PIXELX": "0.3",
                    "D_PIXELY": "0.3",
                    "AL_DA_PATH": "adad",
                    "AL_SH_PATH": "ads",
                    "AL_QL_PATH": "adsad",
                    "XML_FILE": "DIM_PNEO3_PMS-FS_202308040551179_ORTHO_PWOI_000116673_1_2_F_1.XML"
                },
                {
                    "id": 3,
                    "DATACODE": "AB123456",
                    "DATANAME": "DS_PHR1B_202106250537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008911",
                    "CL_ORDNA": "xyz",
                    "CL_PROJNA": "xyz",
                    "CL_PURPOSE": "xyz",
                    "CL_ADDRESS1": "abc",
                    "CL_ADDRESS2": "def",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "25-06-2021",
                    "IMG_DT_RNG": "xyz",
                    "DLOCA_CY": "xyz",
                    "DLOCA_ST": "xyz",
                    "DLOCA_DT": "xyz",
                    "DLOCA_LOCA": "xyz",
                    "DAREA": "50.1234",
                    "DSIZE": "1.2 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106250537361_ORT_3917261102.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "5",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29000",
                    "D_NCOLS": "15000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "25.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path1",
                    "AL_SH_PATH": "path2",
                    "AL_QL_PATH": "path3",
                    "XML_FILE": "DIM_PHR1B_PMS_202106250537361_ORT_3917261102.XML"
                },
                {
                    "id": 4,
                    "DATACODE": "AB654321",
                    "DATANAME": "DS_PHR1B_202106260537361_FR1_PX_E077N12_1123_01157",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008912",
                    "CL_ORDNA": "uvw",
                    "CL_PROJNA": "uvw",
                    "CL_PURPOSE": "uvw",
                    "CL_ADDRESS1": "ghi",
                    "CL_ADDRESS2": "jkl",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "26-06-2021",
                    "IMG_DT_RNG": "uvw",
                    "DLOCA_CY": "uvw",
                    "DLOCA_ST": "uvw",
                    "DLOCA_DT": "uvw",
                    "DLOCA_LOCA": "uvw",
                    "DAREA": "55.1234",
                    "DSIZE": "1.3 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106260537361_ORT_3917261103.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "6",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29500",
                    "D_NCOLS": "15200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "24.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path4",
                    "AL_SH_PATH": "path5",
                    "AL_QL_PATH": "path6",
                    "XML_FILE": "DIM_PHR1B_PMS_202106260537361_ORT_3917261103.XML"
                },
                {
                    "id": 5,
                    "DATACODE": "AB765432",
                    "DATANAME": "DS_PHR1B_202106270537361_FR1_PX_E077N12_1123_01158",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008913",
                    "CL_ORDNA": "rst",
                    "CL_PROJNA": "rst",
                    "CL_PURPOSE": "rst",
                    "CL_ADDRESS1": "mno",
                    "CL_ADDRESS2": "pqr",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "27-06-2021",
                    "IMG_DT_RNG": "rst",
                    "DLOCA_CY": "rst",
                    "DLOCA_ST": "rst",
                    "DLOCA_DT": "rst",
                    "DLOCA_LOCA": "rst",
                    "DAREA": "60.1234",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106270537361_ORT_3917261104.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "7",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30000",
                    "D_NCOLS": "15400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "23.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path7",
                    "AL_SH_PATH": "path8",
                    "AL_QL_PATH": "path9",
                    "XML_FILE": "DIM_PHR1B_PMS_202106270537361_ORT_3917261104.XML"
                },
                {
                    "id": 6,
                    "DATACODE": "AB987654",
                    "DATANAME": "DS_PHR1B_202106280537361_FR1_PX_E077N12_1123_01159",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008914",
                    "CL_ORDNA": "opq",
                    "CL_PROJNA": "opq",
                    "CL_PURPOSE": "opq",
                    "CL_ADDRESS1": "stu",
                    "CL_ADDRESS2": "vwx",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "28-06-2021",
                    "IMG_DT_RNG": "opq",
                    "DLOCA_CY": "opq",
                    "DLOCA_ST": "opq",
                    "DLOCA_DT": "opq",
                    "DLOCA_LOCA": "opq",
                    "DAREA": "65.1234",
                    "DSIZE": "1.5 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106280537361_ORT_3917261105.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "8",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30500",
                    "D_NCOLS": "15600",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "22.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path10",
                    "AL_SH_PATH": "path11",
                    "AL_QL_PATH": "path12",
                    "XML_FILE": "DIM_PHR1B_PMS_202106280537361_ORT_3917261105.XML"
                },
                {
                    "id": 7,
                    "DATACODE": "AB112233",
                    "DATANAME": "DS_PHR1B_202106290537361_FR1_PX_E077N12_1123_01160",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008915",
                    "CL_ORDNA": "klm",
                    "CL_PROJNA": "klm",
                    "CL_PURPOSE": "klm",
                    "CL_ADDRESS1": "yza",
                    "CL_ADDRESS2": "bcd",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "29-06-2021",
                    "IMG_DT_RNG": "klm",
                    "DLOCA_CY": "klm",
                    "DLOCA_ST": "klm",
                    "DLOCA_DT": "klm",
                    "DLOCA_LOCA": "klm",
                    "DAREA": "70.1234",
                    "DSIZE": "1.6 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106290537361_ORT_3917261106.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "9",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31000",
                    "D_NCOLS": "15800",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "21.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path13",
                    "AL_SH_PATH": "path14",
                    "AL_QL_PATH": "path15",
                    "XML_FILE": "DIM_PHR1B_PMS_202106290537361_ORT_3917261106.XML"
                },
                {
                    "id": 8,
                    "DATACODE": "AB223344",
                    "DATANAME": "DS_PHR1B_202106300537361_FR1_PX_E077N12_1123_01161",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008916",
                    "CL_ORDNA": "hij",
                    "CL_PROJNA": "hij",
                    "CL_PURPOSE": "hij",
                    "CL_ADDRESS1": "efg",
                    "CL_ADDRESS2": "hij",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "30-06-2021",
                    "IMG_DT_RNG": "hij",
                    "DLOCA_CY": "hij",
                    "DLOCA_ST": "hij",
                    "DLOCA_DT": "hij",
                    "DLOCA_LOCA": "hij",
                    "DAREA": "75.1234",
                    "DSIZE": "1.7 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106300537361_ORT_3917261107.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "10",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31500",
                    "D_NCOLS": "16000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "20.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path16",
                    "AL_SH_PATH": "path17",
                    "AL_QL_PATH": "path18",
                    "XML_FILE": "DIM_PHR1B_PMS_202106300537361_ORT_3917261107.XML"
                },
                {
                    "id": 9,
                    "DATACODE": "AB334455",
                    "DATANAME": "DS_PHR1B_202107010537361_FR1_PX_E077N12_1123_01162",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008917",
                    "CL_ORDNA": "efg",
                    "CL_PROJNA": "efg",
                    "CL_PURPOSE": "efg",
                    "CL_ADDRESS1": "klm",
                    "CL_ADDRESS2": "nop",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "01-07-2021",
                    "IMG_DT_RNG": "efg",
                    "DLOCA_CY": "efg",
                    "DLOCA_ST": "efg",
                    "DLOCA_DT": "efg",
                    "DLOCA_LOCA": "efg",
                    "DAREA": "80.1234",
                    "DSIZE": "1.8 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107010537361_ORT_3917261108.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "11",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32000",
                    "D_NCOLS": "16200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "19.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path19",
                    "AL_SH_PATH": "path20",
                    "AL_QL_PATH": "path21",
                    "XML_FILE": "DIM_PHR1B_PMS_202107010537361_ORT_3917261108.XML"
                },
                {
                    "id": 10,
                    "DATACODE": "AB445566",
                    "DATANAME": "DS_PHR1B_202107020537361_FR1_PX_E077N12_1123_01163",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008918",
                    "CL_ORDNA": "ghi",
                    "CL_PROJNA": "ghi",
                    "CL_PURPOSE": "ghi",
                    "CL_ADDRESS1": "qrs",
                    "CL_ADDRESS2": "tuv",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "02-07-2021",
                    "IMG_DT_RNG": "ghi",
                    "DLOCA_CY": "ghi",
                    "DLOCA_ST": "ghi",
                    "DLOCA_DT": "ghi",
                    "DLOCA_LOCA": "ghi",
                    "DAREA": "85.1234",
                    "DSIZE": "1.9 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107020537361_ORT_3917261109.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "12",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32500",
                    "D_NCOLS": "16400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "18.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path22",
                    "AL_SH_PATH": "path23",
                    "AL_QL_PATH": "path24",
                    "XML_FILE": "DIM_PHR1B_PMS_202107020537361_ORT_3917261109.XML"
                }
            ]
        },
        {
            "name": "Table 2",
            "columns": [
                { "header": "id", "accessor": "id" },
                { "header": "DATACODE", "accessor": "DATACODE" },
                { "header": "DATANAME", "accessor": "DATANAME" },
                { "header": "COMP_NA", "accessor": "COMP_NA" },
                { "header": "SATT_NA", "accessor": "SATT_NA" },
                { "header": "CL_REF", "accessor": "CL_REF" },
                { "header": "CL_ORDNA", "accessor": "CL_ORDNA" },
                { "header": "CL_PROJNA", "accessor": "CL_PROJNA" },
                { "header": "CL_PURPOSE", "accessor": "CL_PURPOSE" },
                { "header": "CL_ADDRESS1", "accessor": "CL_ADDRESS1" },
                { "header": "CL_ADDRESS2", "accessor": "CL_ADDRESS2" },
                { "header": "SEN_NAME", "accessor": "SEN_NAME" },
                { "header": "IMG_DATYPE", "accessor": "IMG_DATYPE" },
                { "header": "IMG_DAPROC", "accessor": "IMG_DAPROC" },
                { "header": "IMG_DATE", "accessor": "IMG_DATE" },
                { "header": "IMG_DT_RNG", "accessor": "IMG_DT_RNG" },
                { "header": "DLOCA_CY", "accessor": "DLOCA_CY" },
                { "header": "DLOCA_ST", "accessor": "DLOCA_ST" },
                { "header": "DLOCA_DT", "accessor": "DLOCA_DT" },
                { "header": "DLOCA_LOCA", "accessor": "DLOCA_LOCA" },
                { "header": "DAREA", "accessor": "DAREA" },
                { "header": "DSIZE", "accessor": "DSIZE" },
                { "header": "DQLNAME", "accessor": "DQLNAME" },
                { "header": "DFORMAT", "accessor": "DFORMAT" },
                { "header": "DCLOUD", "accessor": "DCLOUD" },
                { "header": "DSNOW", "accessor": "DSNOW" },
                { "header": "D_AQ_BITS", "accessor": "D_AQ_BITS" },
                { "header": "D_PR_BITS", "accessor": "D_PR_BITS" },
                { "header": "DPRJ_TABLE", "accessor": "DPRJ_TABLE" },
                { "header": "DPRJ_NAME", "accessor": "DPRJ_NAME" },
                { "header": "D_NROWS", "accessor": "D_NROWS" },
                { "header": "D_NCOLS", "accessor": "D_NCOLS" },
                { "header": "D_NBANDS", "accessor": "D_NBANDS" },
                { "header": "D_NTILES", "accessor": "D_NTILES" },
                { "header": "D_TYPE", "accessor": "D_TYPE" },
                { "header": "D_NBITS", "accessor": "D_NBITS" },
                { "header": "D_SIGN", "accessor": "D_SIGN" },
                { "header": "D_IN_ANGL", "accessor": "D_IN_ANGL" },
                { "header": "D_GSD_AXT", "accessor": "D_GSD_AXT" },
                { "header": "D_GSD_ALT", "accessor": "D_GSD_ALT" },
                { "header": "D_PIXELX", "accessor": "D_PIXELX" },
                { "header": "D_PIXELY", "accessor": "D_PIXELY" },
                { "header": "AL_DA_PATH", "accessor": "AL_DA_PATH" },
                { "header": "AL_SH_PATH", "accessor": "AL_SH_PATH" },
                { "header": "AL_QL_PATH", "accessor": "AL_QL_PATH" },
                { "header": "XML_FILE", "accessor": "XML_FILE" }
            ],
            "data": [
                {
                    "id": 1,
                    "DATACODE": "AB823728",
                    "DATANAME": "DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008910",
                    "CL_ORDNA": "gfg",
                    "CL_PROJNA": "gdg",
                    "CL_PURPOSE": "fgdg",
                    "CL_ADDRESS1": "dgg",
                    "CL_ADDRESS2": "dfgg",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "23-03-2019",
                    "IMG_DT_RNG": "ggf",
                    "DLOCA_CY": "dgd",
                    "DLOCA_ST": "dfdg",
                    "DLOCA_DT": "dfgg",
                    "DLOCA_LOCA": "fg",
                    "DAREA": "69.5517",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_201903230538130_ORT_3917261101.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "0",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29372",
                    "D_NCOLS": "15407",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "26.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "dfgdg",
                    "AL_SH_PATH": "dg",
                    "AL_QL_PATH": "fgdg",
                    "XML_FILE": "DIM_PHR1B_PMS_201903230538130_ORT_3917261101.XML"
                },
                {
                    "id": 2,
                    "DATACODE": "AB340502",
                    "DATANAME": "PNEO3_202308040551179_PMS-FS_ORT",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PNEO",
                    "CL_REF": "A9-AOI",
                    "CL_ORDNA": "sadad",
                    "CL_PROJNA": "adasd",
                    "CL_PURPOSE": "adad",
                    "CL_ADDRESS1": "asdasd",
                    "CL_ADDRESS2": "asdasd",
                    "SEN_NAME": "PNEO 3",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS-FS",
                    "IMG_DATE": "04-08-2023",
                    "IMG_DT_RNG": "asdad",
                    "DLOCA_CY": "sdad",
                    "DLOCA_ST": "adad",
                    "DLOCA_DT": "asda",
                    "DLOCA_LOCA": "sdad",
                    "DAREA": "103.8210153",
                    "DSIZE": "8.8 GB",
                    "DQLNAME": "PREVIEW_PNEO3_202308040551179_PMS-FS_ORT_PWOI_000116673_1_2_F_1.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "64.74064722",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "16",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32644",
                    "D_NROWS": "34608",
                    "D_NCOLS": "34776",
                    "D_NBANDS": "6",
                    "D_NTILES": "4",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "31.67836468",
                    "D_GSD_AXT": "0.40711993",
                    "D_GSD_ALT": "0.343409747",
                    "D_PIXELX": "0.3",
                    "D_PIXELY": "0.3",
                    "AL_DA_PATH": "adad",
                    "AL_SH_PATH": "ads",
                    "AL_QL_PATH": "adsad",
                    "XML_FILE": "DIM_PNEO3_PMS-FS_202308040551179_ORTHO_PWOI_000116673_1_2_F_1.XML"
                },
                {
                    "id": 3,
                    "DATACODE": "AB123456",
                    "DATANAME": "DS_PHR1B_202106250537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008911",
                    "CL_ORDNA": "xyz",
                    "CL_PROJNA": "xyz",
                    "CL_PURPOSE": "xyz",
                    "CL_ADDRESS1": "abc",
                    "CL_ADDRESS2": "def",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "25-06-2021",
                    "IMG_DT_RNG": "xyz",
                    "DLOCA_CY": "xyz",
                    "DLOCA_ST": "xyz",
                    "DLOCA_DT": "xyz",
                    "DLOCA_LOCA": "xyz",
                    "DAREA": "50.1234",
                    "DSIZE": "1.2 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106250537361_ORT_3917261102.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "5",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29000",
                    "D_NCOLS": "15000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "25.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path1",
                    "AL_SH_PATH": "path2",
                    "AL_QL_PATH": "path3",
                    "XML_FILE": "DIM_PHR1B_PMS_202106250537361_ORT_3917261102.XML"
                },
                {
                    "id": 4,
                    "DATACODE": "AB654321",
                    "DATANAME": "DS_PHR1B_202106260537361_FR1_PX_E077N12_1123_01157",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008912",
                    "CL_ORDNA": "uvw",
                    "CL_PROJNA": "uvw",
                    "CL_PURPOSE": "uvw",
                    "CL_ADDRESS1": "ghi",
                    "CL_ADDRESS2": "jkl",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "26-06-2021",
                    "IMG_DT_RNG": "uvw",
                    "DLOCA_CY": "uvw",
                    "DLOCA_ST": "uvw",
                    "DLOCA_DT": "uvw",
                    "DLOCA_LOCA": "uvw",
                    "DAREA": "55.1234",
                    "DSIZE": "1.3 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106260537361_ORT_3917261103.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "6",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29500",
                    "D_NCOLS": "15200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "24.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path4",
                    "AL_SH_PATH": "path5",
                    "AL_QL_PATH": "path6",
                    "XML_FILE": "DIM_PHR1B_PMS_202106260537361_ORT_3917261103.XML"
                },
                {
                    "id": 5,
                    "DATACODE": "AB765432",
                    "DATANAME": "DS_PHR1B_202106270537361_FR1_PX_E077N12_1123_01158",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008913",
                    "CL_ORDNA": "rst",
                    "CL_PROJNA": "rst",
                    "CL_PURPOSE": "rst",
                    "CL_ADDRESS1": "mno",
                    "CL_ADDRESS2": "pqr",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "27-06-2021",
                    "IMG_DT_RNG": "rst",
                    "DLOCA_CY": "rst",
                    "DLOCA_ST": "rst",
                    "DLOCA_DT": "rst",
                    "DLOCA_LOCA": "rst",
                    "DAREA": "60.1234",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106270537361_ORT_3917261104.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "7",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30000",
                    "D_NCOLS": "15400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "23.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path7",
                    "AL_SH_PATH": "path8",
                    "AL_QL_PATH": "path9",
                    "XML_FILE": "DIM_PHR1B_PMS_202106270537361_ORT_3917261104.XML"
                },
                {
                    "id": 6,
                    "DATACODE": "AB987654",
                    "DATANAME": "DS_PHR1B_202106280537361_FR1_PX_E077N12_1123_01159",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008914",
                    "CL_ORDNA": "opq",
                    "CL_PROJNA": "opq",
                    "CL_PURPOSE": "opq",
                    "CL_ADDRESS1": "stu",
                    "CL_ADDRESS2": "vwx",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "28-06-2021",
                    "IMG_DT_RNG": "opq",
                    "DLOCA_CY": "opq",
                    "DLOCA_ST": "opq",
                    "DLOCA_DT": "opq",
                    "DLOCA_LOCA": "opq",
                    "DAREA": "65.1234",
                    "DSIZE": "1.5 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106280537361_ORT_3917261105.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "8",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30500",
                    "D_NCOLS": "15600",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "22.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path10",
                    "AL_SH_PATH": "path11",
                    "AL_QL_PATH": "path12",
                    "XML_FILE": "DIM_PHR1B_PMS_202106280537361_ORT_3917261105.XML"
                },
                {
                    "id": 7,
                    "DATACODE": "AB112233",
                    "DATANAME": "DS_PHR1B_202106290537361_FR1_PX_E077N12_1123_01160",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008915",
                    "CL_ORDNA": "klm",
                    "CL_PROJNA": "klm",
                    "CL_PURPOSE": "klm",
                    "CL_ADDRESS1": "yza",
                    "CL_ADDRESS2": "bcd",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "29-06-2021",
                    "IMG_DT_RNG": "klm",
                    "DLOCA_CY": "klm",
                    "DLOCA_ST": "klm",
                    "DLOCA_DT": "klm",
                    "DLOCA_LOCA": "klm",
                    "DAREA": "70.1234",
                    "DSIZE": "1.6 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106290537361_ORT_3917261106.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "9",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31000",
                    "D_NCOLS": "15800",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "21.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path13",
                    "AL_SH_PATH": "path14",
                    "AL_QL_PATH": "path15",
                    "XML_FILE": "DIM_PHR1B_PMS_202106290537361_ORT_3917261106.XML"
                },
                {
                    "id": 8,
                    "DATACODE": "AB223344",
                    "DATANAME": "DS_PHR1B_202106300537361_FR1_PX_E077N12_1123_01161",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008916",
                    "CL_ORDNA": "hij",
                    "CL_PROJNA": "hij",
                    "CL_PURPOSE": "hij",
                    "CL_ADDRESS1": "efg",
                    "CL_ADDRESS2": "hij",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "30-06-2021",
                    "IMG_DT_RNG": "hij",
                    "DLOCA_CY": "hij",
                    "DLOCA_ST": "hij",
                    "DLOCA_DT": "hij",
                    "DLOCA_LOCA": "hij",
                    "DAREA": "75.1234",
                    "DSIZE": "1.7 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106300537361_ORT_3917261107.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "10",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31500",
                    "D_NCOLS": "16000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "20.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path16",
                    "AL_SH_PATH": "path17",
                    "AL_QL_PATH": "path18",
                    "XML_FILE": "DIM_PHR1B_PMS_202106300537361_ORT_3917261107.XML"
                },
                {
                    "id": 9,
                    "DATACODE": "AB334455",
                    "DATANAME": "DS_PHR1B_202107010537361_FR1_PX_E077N12_1123_01162",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008917",
                    "CL_ORDNA": "efg",
                    "CL_PROJNA": "efg",
                    "CL_PURPOSE": "efg",
                    "CL_ADDRESS1": "klm",
                    "CL_ADDRESS2": "nop",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "01-07-2021",
                    "IMG_DT_RNG": "efg",
                    "DLOCA_CY": "efg",
                    "DLOCA_ST": "efg",
                    "DLOCA_DT": "efg",
                    "DLOCA_LOCA": "efg",
                    "DAREA": "80.1234",
                    "DSIZE": "1.8 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107010537361_ORT_3917261108.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "11",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32000",
                    "D_NCOLS": "16200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "19.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path19",
                    "AL_SH_PATH": "path20",
                    "AL_QL_PATH": "path21",
                    "XML_FILE": "DIM_PHR1B_PMS_202107010537361_ORT_3917261108.XML"
                },
                {
                    "id": 10,
                    "DATACODE": "AB445566",
                    "DATANAME": "DS_PHR1B_202107020537361_FR1_PX_E077N12_1123_01163",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008918",
                    "CL_ORDNA": "ghi",
                    "CL_PROJNA": "ghi",
                    "CL_PURPOSE": "ghi",
                    "CL_ADDRESS1": "qrs",
                    "CL_ADDRESS2": "tuv",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "02-07-2021",
                    "IMG_DT_RNG": "ghi",
                    "DLOCA_CY": "ghi",
                    "DLOCA_ST": "ghi",
                    "DLOCA_DT": "ghi",
                    "DLOCA_LOCA": "ghi",
                    "DAREA": "85.1234",
                    "DSIZE": "1.9 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107020537361_ORT_3917261109.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "12",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32500",
                    "D_NCOLS": "16400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "18.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path22",
                    "AL_SH_PATH": "path23",
                    "AL_QL_PATH": "path24",
                    "XML_FILE": "DIM_PHR1B_PMS_202107020537361_ORT_3917261109.XML"
                }
            ]
        },
        {
            "name": "Table 3",
            "columns": [
                { "header": "id", "accessor": "id" },
                { "header": "DATACODE", "accessor": "DATACODE" },
                { "header": "DATANAME", "accessor": "DATANAME" },
                { "header": "COMP_NA", "accessor": "COMP_NA" },
                { "header": "SATT_NA", "accessor": "SATT_NA" },
                { "header": "CL_REF", "accessor": "CL_REF" },
                { "header": "CL_ORDNA", "accessor": "CL_ORDNA" },
                { "header": "CL_PROJNA", "accessor": "CL_PROJNA" },
                { "header": "CL_PURPOSE", "accessor": "CL_PURPOSE" },
                { "header": "CL_ADDRESS1", "accessor": "CL_ADDRESS1" },
                { "header": "CL_ADDRESS2", "accessor": "CL_ADDRESS2" },
                { "header": "SEN_NAME", "accessor": "SEN_NAME" },
                { "header": "IMG_DATYPE", "accessor": "IMG_DATYPE" },
                { "header": "IMG_DAPROC", "accessor": "IMG_DAPROC" },
                { "header": "IMG_DATE", "accessor": "IMG_DATE" },
                { "header": "IMG_DT_RNG", "accessor": "IMG_DT_RNG" },
                { "header": "DLOCA_CY", "accessor": "DLOCA_CY" },
                { "header": "DLOCA_ST", "accessor": "DLOCA_ST" },
                { "header": "DLOCA_DT", "accessor": "DLOCA_DT" },
                { "header": "DLOCA_LOCA", "accessor": "DLOCA_LOCA" },
                { "header": "DAREA", "accessor": "DAREA" },
                { "header": "DSIZE", "accessor": "DSIZE" },
                { "header": "DQLNAME", "accessor": "DQLNAME" },
                { "header": "DFORMAT", "accessor": "DFORMAT" },
                { "header": "DCLOUD", "accessor": "DCLOUD" },
                { "header": "DSNOW", "accessor": "DSNOW" },
                { "header": "D_AQ_BITS", "accessor": "D_AQ_BITS" },
                { "header": "D_PR_BITS", "accessor": "D_PR_BITS" },
                { "header": "DPRJ_TABLE", "accessor": "DPRJ_TABLE" },
                { "header": "DPRJ_NAME", "accessor": "DPRJ_NAME" },
                { "header": "D_NROWS", "accessor": "D_NROWS" },
                { "header": "D_NCOLS", "accessor": "D_NCOLS" },
                { "header": "D_NBANDS", "accessor": "D_NBANDS" },
                { "header": "D_NTILES", "accessor": "D_NTILES" },
                { "header": "D_TYPE", "accessor": "D_TYPE" },
                { "header": "D_NBITS", "accessor": "D_NBITS" },
                { "header": "D_SIGN", "accessor": "D_SIGN" },
                { "header": "D_IN_ANGL", "accessor": "D_IN_ANGL" },
                { "header": "D_GSD_AXT", "accessor": "D_GSD_AXT" },
                { "header": "D_GSD_ALT", "accessor": "D_GSD_ALT" },
                { "header": "D_PIXELX", "accessor": "D_PIXELX" },
                { "header": "D_PIXELY", "accessor": "D_PIXELY" },
                { "header": "AL_DA_PATH", "accessor": "AL_DA_PATH" },
                { "header": "AL_SH_PATH", "accessor": "AL_SH_PATH" },
                { "header": "AL_QL_PATH", "accessor": "AL_QL_PATH" },
                { "header": "XML_FILE", "accessor": "XML_FILE" }
            ],
            "data": [
                {
                    "id": 1,
                    "DATACODE": "AB823728",
                    "DATANAME": "DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008910",
                    "CL_ORDNA": "gfg",
                    "CL_PROJNA": "gdg",
                    "CL_PURPOSE": "fgdg",
                    "CL_ADDRESS1": "dgg",
                    "CL_ADDRESS2": "dfgg",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "23-03-2019",
                    "IMG_DT_RNG": "ggf",
                    "DLOCA_CY": "dgd",
                    "DLOCA_ST": "dfdg",
                    "DLOCA_DT": "dfgg",
                    "DLOCA_LOCA": "fg",
                    "DAREA": "69.5517",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_201903230538130_ORT_3917261101.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "0",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29372",
                    "D_NCOLS": "15407",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "26.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "dfgdg",
                    "AL_SH_PATH": "dg",
                    "AL_QL_PATH": "fgdg",
                    "XML_FILE": "DIM_PHR1B_PMS_201903230538130_ORT_3917261101.XML"
                },
                {
                    "id": 2,
                    "DATACODE": "AB340502",
                    "DATANAME": "PNEO3_202308040551179_PMS-FS_ORT",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PNEO",
                    "CL_REF": "A9-AOI",
                    "CL_ORDNA": "sadad",
                    "CL_PROJNA": "adasd",
                    "CL_PURPOSE": "adad",
                    "CL_ADDRESS1": "asdasd",
                    "CL_ADDRESS2": "asdasd",
                    "SEN_NAME": "PNEO 3",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS-FS",
                    "IMG_DATE": "04-08-2023",
                    "IMG_DT_RNG": "asdad",
                    "DLOCA_CY": "sdad",
                    "DLOCA_ST": "adad",
                    "DLOCA_DT": "asda",
                    "DLOCA_LOCA": "sdad",
                    "DAREA": "103.8210153",
                    "DSIZE": "8.8 GB",
                    "DQLNAME": "PREVIEW_PNEO3_202308040551179_PMS-FS_ORT_PWOI_000116673_1_2_F_1.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "64.74064722",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "16",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32644",
                    "D_NROWS": "34608",
                    "D_NCOLS": "34776",
                    "D_NBANDS": "6",
                    "D_NTILES": "4",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "31.67836468",
                    "D_GSD_AXT": "0.40711993",
                    "D_GSD_ALT": "0.343409747",
                    "D_PIXELX": "0.3",
                    "D_PIXELY": "0.3",
                    "AL_DA_PATH": "adad",
                    "AL_SH_PATH": "ads",
                    "AL_QL_PATH": "adsad",
                    "XML_FILE": "DIM_PNEO3_PMS-FS_202308040551179_ORTHO_PWOI_000116673_1_2_F_1.XML"
                },
                {
                    "id": 3,
                    "DATACODE": "AB123456",
                    "DATANAME": "DS_PHR1B_202106250537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008911",
                    "CL_ORDNA": "xyz",
                    "CL_PROJNA": "xyz",
                    "CL_PURPOSE": "xyz",
                    "CL_ADDRESS1": "abc",
                    "CL_ADDRESS2": "def",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "25-06-2021",
                    "IMG_DT_RNG": "xyz",
                    "DLOCA_CY": "xyz",
                    "DLOCA_ST": "xyz",
                    "DLOCA_DT": "xyz",
                    "DLOCA_LOCA": "xyz",
                    "DAREA": "50.1234",
                    "DSIZE": "1.2 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106250537361_ORT_3917261102.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "5",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29000",
                    "D_NCOLS": "15000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "25.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path1",
                    "AL_SH_PATH": "path2",
                    "AL_QL_PATH": "path3",
                    "XML_FILE": "DIM_PHR1B_PMS_202106250537361_ORT_3917261102.XML"
                },
                {
                    "id": 4,
                    "DATACODE": "AB654321",
                    "DATANAME": "DS_PHR1B_202106260537361_FR1_PX_E077N12_1123_01157",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008912",
                    "CL_ORDNA": "uvw",
                    "CL_PROJNA": "uvw",
                    "CL_PURPOSE": "uvw",
                    "CL_ADDRESS1": "ghi",
                    "CL_ADDRESS2": "jkl",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "26-06-2021",
                    "IMG_DT_RNG": "uvw",
                    "DLOCA_CY": "uvw",
                    "DLOCA_ST": "uvw",
                    "DLOCA_DT": "uvw",
                    "DLOCA_LOCA": "uvw",
                    "DAREA": "55.1234",
                    "DSIZE": "1.3 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106260537361_ORT_3917261103.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "6",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29500",
                    "D_NCOLS": "15200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "24.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path4",
                    "AL_SH_PATH": "path5",
                    "AL_QL_PATH": "path6",
                    "XML_FILE": "DIM_PHR1B_PMS_202106260537361_ORT_3917261103.XML"
                },
                {
                    "id": 5,
                    "DATACODE": "AB765432",
                    "DATANAME": "DS_PHR1B_202106270537361_FR1_PX_E077N12_1123_01158",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008913",
                    "CL_ORDNA": "rst",
                    "CL_PROJNA": "rst",
                    "CL_PURPOSE": "rst",
                    "CL_ADDRESS1": "mno",
                    "CL_ADDRESS2": "pqr",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "27-06-2021",
                    "IMG_DT_RNG": "rst",
                    "DLOCA_CY": "rst",
                    "DLOCA_ST": "rst",
                    "DLOCA_DT": "rst",
                    "DLOCA_LOCA": "rst",
                    "DAREA": "60.1234",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106270537361_ORT_3917261104.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "7",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30000",
                    "D_NCOLS": "15400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "23.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path7",
                    "AL_SH_PATH": "path8",
                    "AL_QL_PATH": "path9",
                    "XML_FILE": "DIM_PHR1B_PMS_202106270537361_ORT_3917261104.XML"
                },
                {
                    "id": 6,
                    "DATACODE": "AB987654",
                    "DATANAME": "DS_PHR1B_202106280537361_FR1_PX_E077N12_1123_01159",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008914",
                    "CL_ORDNA": "opq",
                    "CL_PROJNA": "opq",
                    "CL_PURPOSE": "opq",
                    "CL_ADDRESS1": "stu",
                    "CL_ADDRESS2": "vwx",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "28-06-2021",
                    "IMG_DT_RNG": "opq",
                    "DLOCA_CY": "opq",
                    "DLOCA_ST": "opq",
                    "DLOCA_DT": "opq",
                    "DLOCA_LOCA": "opq",
                    "DAREA": "65.1234",
                    "DSIZE": "1.5 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106280537361_ORT_3917261105.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "8",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30500",
                    "D_NCOLS": "15600",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "22.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path10",
                    "AL_SH_PATH": "path11",
                    "AL_QL_PATH": "path12",
                    "XML_FILE": "DIM_PHR1B_PMS_202106280537361_ORT_3917261105.XML"
                },
                {
                    "id": 7,
                    "DATACODE": "AB112233",
                    "DATANAME": "DS_PHR1B_202106290537361_FR1_PX_E077N12_1123_01160",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008915",
                    "CL_ORDNA": "klm",
                    "CL_PROJNA": "klm",
                    "CL_PURPOSE": "klm",
                    "CL_ADDRESS1": "yza",
                    "CL_ADDRESS2": "bcd",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "29-06-2021",
                    "IMG_DT_RNG": "klm",
                    "DLOCA_CY": "klm",
                    "DLOCA_ST": "klm",
                    "DLOCA_DT": "klm",
                    "DLOCA_LOCA": "klm",
                    "DAREA": "70.1234",
                    "DSIZE": "1.6 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106290537361_ORT_3917261106.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "9",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31000",
                    "D_NCOLS": "15800",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "21.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path13",
                    "AL_SH_PATH": "path14",
                    "AL_QL_PATH": "path15",
                    "XML_FILE": "DIM_PHR1B_PMS_202106290537361_ORT_3917261106.XML"
                },
                {
                    "id": 8,
                    "DATACODE": "AB223344",
                    "DATANAME": "DS_PHR1B_202106300537361_FR1_PX_E077N12_1123_01161",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008916",
                    "CL_ORDNA": "hij",
                    "CL_PROJNA": "hij",
                    "CL_PURPOSE": "hij",
                    "CL_ADDRESS1": "efg",
                    "CL_ADDRESS2": "hij",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "30-06-2021",
                    "IMG_DT_RNG": "hij",
                    "DLOCA_CY": "hij",
                    "DLOCA_ST": "hij",
                    "DLOCA_DT": "hij",
                    "DLOCA_LOCA": "hij",
                    "DAREA": "75.1234",
                    "DSIZE": "1.7 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106300537361_ORT_3917261107.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "10",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31500",
                    "D_NCOLS": "16000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "20.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path16",
                    "AL_SH_PATH": "path17",
                    "AL_QL_PATH": "path18",
                    "XML_FILE": "DIM_PHR1B_PMS_202106300537361_ORT_3917261107.XML"
                },
                {
                    "id": 9,
                    "DATACODE": "AB334455",
                    "DATANAME": "DS_PHR1B_202107010537361_FR1_PX_E077N12_1123_01162",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008917",
                    "CL_ORDNA": "efg",
                    "CL_PROJNA": "efg",
                    "CL_PURPOSE": "efg",
                    "CL_ADDRESS1": "klm",
                    "CL_ADDRESS2": "nop",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "01-07-2021",
                    "IMG_DT_RNG": "efg",
                    "DLOCA_CY": "efg",
                    "DLOCA_ST": "efg",
                    "DLOCA_DT": "efg",
                    "DLOCA_LOCA": "efg",
                    "DAREA": "80.1234",
                    "DSIZE": "1.8 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107010537361_ORT_3917261108.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "11",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32000",
                    "D_NCOLS": "16200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "19.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path19",
                    "AL_SH_PATH": "path20",
                    "AL_QL_PATH": "path21",
                    "XML_FILE": "DIM_PHR1B_PMS_202107010537361_ORT_3917261108.XML"
                },
                {
                    "id": 10,
                    "DATACODE": "AB445566",
                    "DATANAME": "DS_PHR1B_202107020537361_FR1_PX_E077N12_1123_01163",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008918",
                    "CL_ORDNA": "ghi",
                    "CL_PROJNA": "ghi",
                    "CL_PURPOSE": "ghi",
                    "CL_ADDRESS1": "qrs",
                    "CL_ADDRESS2": "tuv",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "02-07-2021",
                    "IMG_DT_RNG": "ghi",
                    "DLOCA_CY": "ghi",
                    "DLOCA_ST": "ghi",
                    "DLOCA_DT": "ghi",
                    "DLOCA_LOCA": "ghi",
                    "DAREA": "85.1234",
                    "DSIZE": "1.9 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107020537361_ORT_3917261109.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "12",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32500",
                    "D_NCOLS": "16400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "18.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path22",
                    "AL_SH_PATH": "path23",
                    "AL_QL_PATH": "path24",
                    "XML_FILE": "DIM_PHR1B_PMS_202107020537361_ORT_3917261109.XML"
                },
                {
                    "id": 11,
                    "DATACODE": "AB334455",
                    "DATANAME": "DS_PHR1B_202107010537361_FR1_PX_E077N12_1123_01162",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008917",
                    "CL_ORDNA": "efg",
                    "CL_PROJNA": "efg",
                    "CL_PURPOSE": "efg",
                    "CL_ADDRESS1": "klm",
                    "CL_ADDRESS2": "nop",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "01-07-2021",
                    "IMG_DT_RNG": "efg",
                    "DLOCA_CY": "efg",
                    "DLOCA_ST": "efg",
                    "DLOCA_DT": "efg",
                    "DLOCA_LOCA": "efg",
                    "DAREA": "80.1234",
                    "DSIZE": "1.8 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107010537361_ORT_3917261108.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "11",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32000",
                    "D_NCOLS": "16200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "19.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path19",
                    "AL_SH_PATH": "path20",
                    "AL_QL_PATH": "path21",
                    "XML_FILE": "DIM_PHR1B_PMS_202107010537361_ORT_3917261108.XML"
                },
                {
                    "id": 12,
                    "DATACODE": "AB445566",
                    "DATANAME": "DS_PHR1B_202107020537361_FR1_PX_E077N12_1123_01163",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008918",
                    "CL_ORDNA": "ghi",
                    "CL_PROJNA": "ghi",
                    "CL_PURPOSE": "ghi",
                    "CL_ADDRESS1": "qrs",
                    "CL_ADDRESS2": "tuv",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "02-07-2021",
                    "IMG_DT_RNG": "ghi",
                    "DLOCA_CY": "ghi",
                    "DLOCA_ST": "ghi",
                    "DLOCA_DT": "ghi",
                    "DLOCA_LOCA": "ghi",
                    "DAREA": "85.1234",
                    "DSIZE": "1.9 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202107020537361_ORT_3917261109.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "12",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "32500",
                    "D_NCOLS": "16400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "18.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path22",
                    "AL_SH_PATH": "path23",
                    "AL_QL_PATH": "path24",
                    "XML_FILE": "DIM_PHR1B_PMS_202107020537361_ORT_3917261109.XML"
                }
            ]
        },
        {
            "name": "Table 4",
            "columns": [
                { "header": "id", "accessor": "id" },
                { "header": "DATACODE", "accessor": "DATACODE" },
                { "header": "DATANAME", "accessor": "DATANAME" },
                { "header": "COMP_NA", "accessor": "COMP_NA" },
                { "header": "SATT_NA", "accessor": "SATT_NA" },
                { "header": "CL_REF", "accessor": "CL_REF" },
                { "header": "CL_ORDNA", "accessor": "CL_ORDNA" },
                { "header": "CL_PROJNA", "accessor": "CL_PROJNA" },
                { "header": "CL_PURPOSE", "accessor": "CL_PURPOSE" },
                { "header": "CL_ADDRESS1", "accessor": "CL_ADDRESS1" },
                { "header": "CL_ADDRESS2", "accessor": "CL_ADDRESS2" },
                { "header": "SEN_NAME", "accessor": "SEN_NAME" },
                { "header": "IMG_DATYPE", "accessor": "IMG_DATYPE" },
                { "header": "IMG_DAPROC", "accessor": "IMG_DAPROC" },
                { "header": "IMG_DATE", "accessor": "IMG_DATE" },
                { "header": "IMG_DT_RNG", "accessor": "IMG_DT_RNG" },
                { "header": "DLOCA_CY", "accessor": "DLOCA_CY" },
                { "header": "DLOCA_ST", "accessor": "DLOCA_ST" },
                { "header": "DLOCA_DT", "accessor": "DLOCA_DT" },
                { "header": "DLOCA_LOCA", "accessor": "DLOCA_LOCA" },
                { "header": "DAREA", "accessor": "DAREA" },
                { "header": "DSIZE", "accessor": "DSIZE" },
                { "header": "DQLNAME", "accessor": "DQLNAME" },
                { "header": "DFORMAT", "accessor": "DFORMAT" },
                { "header": "DCLOUD", "accessor": "DCLOUD" },
                { "header": "DSNOW", "accessor": "DSNOW" },
                { "header": "D_AQ_BITS", "accessor": "D_AQ_BITS" },
                { "header": "D_PR_BITS", "accessor": "D_PR_BITS" },
                { "header": "DPRJ_TABLE", "accessor": "DPRJ_TABLE" },
                { "header": "DPRJ_NAME", "accessor": "DPRJ_NAME" },
                { "header": "D_NROWS", "accessor": "D_NROWS" },
                { "header": "D_NCOLS", "accessor": "D_NCOLS" },
                { "header": "D_NBANDS", "accessor": "D_NBANDS" },
                { "header": "D_NTILES", "accessor": "D_NTILES" },
                { "header": "D_TYPE", "accessor": "D_TYPE" },
                { "header": "D_NBITS", "accessor": "D_NBITS" },
                { "header": "D_SIGN", "accessor": "D_SIGN" },
                { "header": "D_IN_ANGL", "accessor": "D_IN_ANGL" },
                { "header": "D_GSD_AXT", "accessor": "D_GSD_AXT" },
                { "header": "D_GSD_ALT", "accessor": "D_GSD_ALT" },
                { "header": "D_PIXELX", "accessor": "D_PIXELX" },
                { "header": "D_PIXELY", "accessor": "D_PIXELY" },
                { "header": "AL_DA_PATH", "accessor": "AL_DA_PATH" },
                { "header": "AL_SH_PATH", "accessor": "AL_SH_PATH" },
                { "header": "AL_QL_PATH", "accessor": "AL_QL_PATH" },
                { "header": "XML_FILE", "accessor": "XML_FILE" }
            ],
            "data": [
                {
                    "id": 1,
                    "DATACODE": "AB823728",
                    "DATANAME": "DS_PHR1B_201903230537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008910",
                    "CL_ORDNA": "gfg",
                    "CL_PROJNA": "gdg",
                    "CL_PURPOSE": "fgdg",
                    "CL_ADDRESS1": "dgg",
                    "CL_ADDRESS2": "dfgg",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "23-03-2019",
                    "IMG_DT_RNG": "ggf",
                    "DLOCA_CY": "dgd",
                    "DLOCA_ST": "dfdg",
                    "DLOCA_DT": "dfgg",
                    "DLOCA_LOCA": "fg",
                    "DAREA": "69.5517",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_201903230538130_ORT_3917261101.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "0",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29372",
                    "D_NCOLS": "15407",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "26.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "dfgdg",
                    "AL_SH_PATH": "dg",
                    "AL_QL_PATH": "fgdg",
                    "XML_FILE": "DIM_PHR1B_PMS_201903230538130_ORT_3917261101.XML"
                },
                {
                    "id": 2,
                    "DATACODE": "AB340502",
                    "DATANAME": "PNEO3_202308040551179_PMS-FS_ORT",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PNEO",
                    "CL_REF": "A9-AOI",
                    "CL_ORDNA": "sadad",
                    "CL_PROJNA": "adasd",
                    "CL_PURPOSE": "adad",
                    "CL_ADDRESS1": "asdasd",
                    "CL_ADDRESS2": "asdasd",
                    "SEN_NAME": "PNEO 3",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS-FS",
                    "IMG_DATE": "04-08-2023",
                    "IMG_DT_RNG": "asdad",
                    "DLOCA_CY": "sdad",
                    "DLOCA_ST": "adad",
                    "DLOCA_DT": "asda",
                    "DLOCA_LOCA": "sdad",
                    "DAREA": "103.8210153",
                    "DSIZE": "8.8 GB",
                    "DQLNAME": "PREVIEW_PNEO3_202308040551179_PMS-FS_ORT_PWOI_000116673_1_2_F_1.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "64.74064722",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "16",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32644",
                    "D_NROWS": "34608",
                    "D_NCOLS": "34776",
                    "D_NBANDS": "6",
                    "D_NTILES": "4",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "31.67836468",
                    "D_GSD_AXT": "0.40711993",
                    "D_GSD_ALT": "0.343409747",
                    "D_PIXELX": "0.3",
                    "D_PIXELY": "0.3",
                    "AL_DA_PATH": "adad",
                    "AL_SH_PATH": "ads",
                    "AL_QL_PATH": "adsad",
                    "XML_FILE": "DIM_PNEO3_PMS-FS_202308040551179_ORTHO_PWOI_000116673_1_2_F_1.XML"
                },
                {
                    "id": 3,
                    "DATACODE": "AB123456",
                    "DATANAME": "DS_PHR1B_202106250537361_FR1_PX_E077N12_1123_01156",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008911",
                    "CL_ORDNA": "xyz",
                    "CL_PROJNA": "xyz",
                    "CL_PURPOSE": "xyz",
                    "CL_ADDRESS1": "abc",
                    "CL_ADDRESS2": "def",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "25-06-2021",
                    "IMG_DT_RNG": "xyz",
                    "DLOCA_CY": "xyz",
                    "DLOCA_ST": "xyz",
                    "DLOCA_DT": "xyz",
                    "DLOCA_LOCA": "xyz",
                    "DAREA": "50.1234",
                    "DSIZE": "1.2 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106250537361_ORT_3917261102.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "5",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29000",
                    "D_NCOLS": "15000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "25.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path1",
                    "AL_SH_PATH": "path2",
                    "AL_QL_PATH": "path3",
                    "XML_FILE": "DIM_PHR1B_PMS_202106250537361_ORT_3917261102.XML"
                },
                {
                    "id": 4,
                    "DATACODE": "AB654321",
                    "DATANAME": "DS_PHR1B_202106260537361_FR1_PX_E077N12_1123_01157",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008912",
                    "CL_ORDNA": "uvw",
                    "CL_PROJNA": "uvw",
                    "CL_PURPOSE": "uvw",
                    "CL_ADDRESS1": "ghi",
                    "CL_ADDRESS2": "jkl",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "26-06-2021",
                    "IMG_DT_RNG": "uvw",
                    "DLOCA_CY": "uvw",
                    "DLOCA_ST": "uvw",
                    "DLOCA_DT": "uvw",
                    "DLOCA_LOCA": "uvw",
                    "DAREA": "55.1234",
                    "DSIZE": "1.3 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106260537361_ORT_3917261103.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "6",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "29500",
                    "D_NCOLS": "15200",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "24.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path4",
                    "AL_SH_PATH": "path5",
                    "AL_QL_PATH": "path6",
                    "XML_FILE": "DIM_PHR1B_PMS_202106260537361_ORT_3917261103.XML"
                },
                {
                    "id": 5,
                    "DATACODE": "AB765432",
                    "DATANAME": "DS_PHR1B_202106270537361_FR1_PX_E077N12_1123_01158",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008913",
                    "CL_ORDNA": "rst",
                    "CL_PROJNA": "rst",
                    "CL_PURPOSE": "rst",
                    "CL_ADDRESS1": "mno",
                    "CL_ADDRESS2": "pqr",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "27-06-2021",
                    "IMG_DT_RNG": "rst",
                    "DLOCA_CY": "rst",
                    "DLOCA_ST": "rst",
                    "DLOCA_DT": "rst",
                    "DLOCA_LOCA": "rst",
                    "DAREA": "60.1234",
                    "DSIZE": "1.4 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106270537361_ORT_3917261104.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "7",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30000",
                    "D_NCOLS": "15400",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "23.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path7",
                    "AL_SH_PATH": "path8",
                    "AL_QL_PATH": "path9",
                    "XML_FILE": "DIM_PHR1B_PMS_202106270537361_ORT_3917261104.XML"
                },
                {
                    "id": 6,
                    "DATACODE": "AB987654",
                    "DATANAME": "DS_PHR1B_202106280537361_FR1_PX_E077N12_1123_01159",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008914",
                    "CL_ORDNA": "opq",
                    "CL_PROJNA": "opq",
                    "CL_PURPOSE": "opq",
                    "CL_ADDRESS1": "stu",
                    "CL_ADDRESS2": "vwx",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "28-06-2021",
                    "IMG_DT_RNG": "opq",
                    "DLOCA_CY": "opq",
                    "DLOCA_ST": "opq",
                    "DLOCA_DT": "opq",
                    "DLOCA_LOCA": "opq",
                    "DAREA": "65.1234",
                    "DSIZE": "1.5 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106280537361_ORT_3917261105.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "8",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "30500",
                    "D_NCOLS": "15600",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "22.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path10",
                    "AL_SH_PATH": "path11",
                    "AL_QL_PATH": "path12",
                    "XML_FILE": "DIM_PHR1B_PMS_202106280537361_ORT_3917261105.XML"
                },
                {
                    "id": 7,
                    "DATACODE": "AB112233",
                    "DATANAME": "DS_PHR1B_202106290537361_FR1_PX_E077N12_1123_01160",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008915",
                    "CL_ORDNA": "klm",
                    "CL_PROJNA": "klm",
                    "CL_PURPOSE": "klm",
                    "CL_ADDRESS1": "yza",
                    "CL_ADDRESS2": "bcd",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "29-06-2021",
                    "IMG_DT_RNG": "klm",
                    "DLOCA_CY": "klm",
                    "DLOCA_ST": "klm",
                    "DLOCA_DT": "klm",
                    "DLOCA_LOCA": "klm",
                    "DAREA": "70.1234",
                    "DSIZE": "1.6 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106290537361_ORT_3917261106.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "9",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31000",
                    "D_NCOLS": "15800",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "21.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path13",
                    "AL_SH_PATH": "path14",
                    "AL_QL_PATH": "path15",
                    "XML_FILE": "DIM_PHR1B_PMS_202106290537361_ORT_3917261106.XML"
                },
                {
                    "id": 8,
                    "DATACODE": "AB223344",
                    "DATANAME": "DS_PHR1B_202106300537361_FR1_PX_E077N12_1123_01161",
                    "COMP_NA": "AIRBUS DS GEO",
                    "SATT_NA": "PLEIADES",
                    "CL_REF": "SO19008916",
                    "CL_ORDNA": "hij",
                    "CL_PROJNA": "hij",
                    "CL_PURPOSE": "hij",
                    "CL_ADDRESS1": "efg",
                    "CL_ADDRESS2": "hij",
                    "SEN_NAME": "PHR 1B",
                    "IMG_DATYPE": "ORTHO",
                    "IMG_DAPROC": "PMS",
                    "IMG_DATE": "30-06-2021",
                    "IMG_DT_RNG": "hij",
                    "DLOCA_CY": "hij",
                    "DLOCA_ST": "hij",
                    "DLOCA_DT": "hij",
                    "DLOCA_LOCA": "hij",
                    "DAREA": "75.1234",
                    "DSIZE": "1.7 GB",
                    "DQLNAME": "PREVIEW_PHR1B_PMS_202106300537361_ORT_3917261107.JPG",
                    "DFORMAT": "image/tiff",
                    "DCLOUD": "10",
                    "DSNOW": "0",
                    "D_AQ_BITS": "12",
                    "D_PR_BITS": "12",
                    "DPRJ_TABLE": "EPSG",
                    "DPRJ_NAME": "32643",
                    "D_NROWS": "31500",
                    "D_NCOLS": "16000",
                    "D_NBANDS": "4",
                    "D_NTILES": "2",
                    "D_TYPE": "INTEGER",
                    "D_NBITS": "16",
                    "D_SIGN": "UNSIGNED",
                    "D_IN_ANGL": "20.65226319",
                    "D_GSD_AXT": "0.784700042",
                    "D_GSD_ALT": "0.839099306",
                    "D_PIXELX": "0.5",
                    "D_PIXELY": "0.5",
                    "AL_DA_PATH": "path16",
                    "AL_SH_PATH": "path17",
                    "AL_QL_PATH": "path18",
                    "XML_FILE": "DIM_PHR1B_PMS_202106300537361_ORT_3917261107.XML"
                }
            ]
        }
    ]

    // setTables([tabless])
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        username: '',
        email: '',
        password: '',
        mobileNumber: ''
    });

    const [errors, setErrors] = useState({});

    const handleNEWInputChange = (event) => {
        const { name, value } = event.target;

        let newValue = value;

        // Restricting input for firstName, lastName, and middleName to letters only
        if (name === 'firstName' || name === 'lastName' || name === 'middleName') {
            newValue = value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
        }

        // Restricting input for mobileNumber to digits only
        if (name === 'mobileNumber') {
            newValue = value.replace(/\D/g, ''); // Allow only digits
        }

        setFormData((prevState) => ({
            ...prevState,
            [name]: newValue
        }));
    };

    const handleValidationError = (name, error) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Perform additional validation if needed
        // ...

        // Post form data to API
        try {
            const response = await axios.post('/api/submit-form', formData);
            console.log('Form submitted successfully:', response.data);
            // Handle success, e.g., show a success message or redirect
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error, e.g., show an error message
        }
    };

    return (
        <div className='mainbox'>
            <input type="file" accept=".zip" onChange={handleFileChange} multiple />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>
            {message && <p>{message}</p>}
            {downloadUrl && (
                <div>
                    <a href={downloadUrl} download="filtered_files.zip">
                        Download Processed Zip
                    </a>
                </div>
            )}
            {loading && <div className="loader"></div>}
            <style jsx>{`
                
                .loader {
                    width: 40px;
                    height: 40px;
                    position: relative;
                    left: 20px;
                    --c: no-repeat linear-gradient(#25b09b 0 0);
                    background:
                        var(--c) center/100% 10px,
                        var(--c) center/10px 100%;
                }
                .loader:before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        var(--c) 0 0,
                        var(--c) 100% 0,
                        var(--c) 0 100%,
                        var(--c) 100% 100%;
                    background-size: 15.5px 15.5px;
                    animation: l16 1.5s infinite cubic-bezier(0.3, 1, 0, 1);
                }
                @keyframes l16 {
                    33% { inset: -10px; transform: rotate(0deg); }
                    66% { inset: -10px; transform: rotate(90deg); }
                    100% { inset: 0; transform: rotate(90deg); }
                }
            `}</style>
            <h1>Centralized Table Example</h1>
            {/* <GeopicxTables columns={columns} data={data} /> */}
            {/* <GeopicxTables tables={tables} /> */}
            <GeopicxTables tables={tables} />
            <GeopicxTables tables={tablesss} />
            {/* <div>
                <form onSubmit={handleSubmit}>
                    <ArchivalValidationComponent
                        label="First Name"
                        validationRules={[
                            { required: true },
                            { maxLength: 50 },
                        ]}
                        type="text"
                        className="firstName"
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        maxLength="50"
                        value={formData.firstName}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('firstName', error)}
                    />
                    <ArchivalValidationComponent
                        label="Last Name"
                        validationRules={[
                            { required: true },
                            { maxLength: 50 },
                        ]}
                        type="text"
                        className="lastName"
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        maxLength="50"
                        value={formData.lastName}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('lastName', error)}
                    />
                    <ArchivalValidationComponent
                        label="Middle Name"
                        validationRules={[
                            { maxLength: 50 },
                        ]}
                        type="text"
                        className="middleName"
                        id="middleName"
                        name="middleName"
                        placeholder="M."
                        maxLength="50"
                        value={formData.middleName}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('middleName', error)}
                    />
                    <ArchivalValidationComponent
                        label="Username"
                        validationRules={[
                            { required: true },
                            { maxLength: 30 },
                        ]}
                        type="text"
                        className="username"
                        id="username"
                        name="username"
                        placeholder="johndoe"
                        maxLength="30"
                        value={formData.username}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('username', error)}
                    />
                    <ArchivalValidationComponent
                        label="Email"
                        validationRules={[
                            { required: true },
                            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                        ]}
                        type="email"
                        className="email"
                        id="email"
                        name="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('email', error)}
                    />
                    <ArchivalValidationComponent
                        label="Password"
                        validationRules={[
                            { required: true },
                            { minLength: 8 },
                        ]}
                        type="password"
                        className="password"
                        id="password"
                        name="password"
                        placeholder="********"
                        minLength="8"
                        value={formData.password}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('password', error)}
                    />
                    <ArchivalValidationComponent
                        label="Mobile Number"
                        validationRules={[
                            { required: true },
                            { maxLength: 10 },
                            { pattern: /^\d{10}$/ },
                        ]}
                        type="tel"
                        className="mobileNumber"
                        id="mobileNumber"
                        name="mobileNumber"
                        placeholder="1234567890"
                        maxLength="10"
                        value={formData.mobileNumber}
                        onChange={handleNEWInputChange}
                        onValidationError={(error) => handleValidationError('mobileNumber', error)}
                    />
                    <button type="submit">Submit</button>
                </form>
            </div> */}
        </div>
    );
};

export default ArchivalComponent;



