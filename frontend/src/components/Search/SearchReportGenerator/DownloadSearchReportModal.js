import React, { useState, useEffect } from 'react';
import './DownloadSearchReportModal.css';
import shpwrite from '@simwrapper/shp-write';

const DownloadSearchReportModal = ({ onClose, formData, responseData, screenshot, selectedRows, exportReport, setShowDropdown }) => {
  // State to manage the selected format
  const [format, setFormat] = useState('html');
  const [layerFormat, setLayerFormat] = useState('kml');

  // Define columns and data
  const columns = ['SR NO', 'Search Input', 'Selected Value'];
  const additionalTableColumns = ['SR NO', 'DATACODE', 'DATANAME', 'COMP_NA', 'SATT_NA', 'SEN_NAME', 'IMG_DATE', 'DSIZE', 'IMG_DAPROC', 'IMG_DATYPE'];
  const data = Object.entries(formData).map(([key, value]) => [key, value]);
  const column_Geometry = ['Index', 'Latitude', 'Longitude'];
  let coordinatesData;

  useEffect(() => {
    setShowDropdown(false); // Set showDropdown state to false when the component mounts
  }, [setShowDropdown]);

  // if (Array.isArray(formData.aoigeometry.coordinates[0])) {
  //   // If coordinates is an array of arrays
  //   coordinatesData = formData.aoigeometry.coordinates[0].map((coordinate, index) => [
  //     index,
  //     coordinate[0], // Latitude
  //     coordinate[1]  // Longitude
  //   ]);
  // } else {
  //   // If coordinates is just an array
  //   coordinatesData = [
  //     [0, formData.aoigeometry.coordinates[0], formData.aoigeometry.coordinates[1]]
  //   ];
  // }

  if (formData.aoigeometry && formData.aoigeometry.coordinates) {
    if (Array.isArray(formData.aoigeometry.coordinates[0])) {
      // If coordinates is an array of arrays
      coordinatesData = formData.aoigeometry.coordinates[0].map((coordinate, index) => [
        index,
        coordinate[0], // Latitude
        coordinate[1]  // Longitude
      ]);
    } else {
      // If coordinates is just an array
      coordinatesData = [
        [0, formData.aoigeometry.coordinates[0], formData.aoigeometry.coordinates[1]]
      ];
    }
  }
  // else {
  //   // Handle the case when aoigeometry or coordinates is not defined
  //   // or does not have the expected structure
  //   console.error("Error: 'aoigeometry.coordinates' is not defined or does not have the expected structure.");
  // }

  const placeholder = 'logo.png';
  // const { DATACODE, DATANAME, COMP_NA, SATT_NA, CL_REF, SEN_NAME, IMG_DAPROC, IMG_DATE, DAREA, DQLNAME, DFORMAT, DCLOUD, DSNOW, D_AQ_BITS, D_GSD_ALT, D_GSD_AXT, D_IN_ANGL, D_NBANDS, D_NBITS, D_NCOLS, D_NROWS, D_NTILES, D_PIXELX, D_PIXELY, D_PR_BITS, D_SIGN, D_TYPE, XML_FILE } = responseData.Data.marsmaintabledata[0];

  // Constructing properties object
  // const properties = {
  //   xmlFile: XML_FILE,
  //   dataCODE: DATACODE,
  //   dataName: DATANAME,
  //   compName: COMP_NA,
  //   satName: SATT_NA,
  //   clRef: CL_REF,
  //   senName: SEN_NAME,
  //   imgDataProcessLevel: IMG_DAPROC,
  //   imgDate: IMG_DATE,
  //   dArea: DAREA,
  //   dQLname: DQLNAME,
  //   dFormat: DFORMAT,
  //   dCloud: DCLOUD,
  //   dSnow: DSNOW,
  //   dAQrange: D_AQ_BITS,
  //   dGSDaxt: D_GSD_ALT,
  //   dGSDalt: D_GSD_AXT,
  //   dINangle: D_IN_ANGL,
  //   dBands: D_NBANDS,
  //   dBits: D_NBITS,
  //   dCols: D_NCOLS,
  //   dRows: D_NROWS,
  //   dTiles: D_NTILES,
  //   dPixelx: D_PIXELX,
  //   dPixely: D_PIXELY,
  //   dPRrange: D_PR_BITS,
  //   dSign: D_SIGN,
  //   dType: D_TYPE,
  // };


  // Function to handle export
  const handleExport = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Construct the base URL
    const baseUrl = `http://${hostname}:${port}`;
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    if (format === 'html') {
      // Convert formData to HTML content (replace this with your logic)
      const htmlContent = `
      <html>
      <head>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <style>
            body{
              overflow-y: auto;
              margin:auto;
              padding:auto;             
            }
            /* CSS styles for the screenshot image */
            .screenshot-img {
                width: 100%;
                height: auto; /* Maintain aspect ratio */
            }
            .tableStyle {
                border-collapse: collapse;
            }
            .search-table-font {
                font-size: 12px; /* Set font size to 12px */
                /* Define your font styles */
            }
            .Search-SRNO {
                font-size: 12px; /* Set font size to 12px */
                /* Define SR NO column styles */
            }
            /* Add any additional styles as needed */
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #ccc;
                height:7%;
                width:100%;
                background-color:#400c88;       
            }
            .company-name {
              position: absolute;
              top: 50px;
              left: 69px;
              color: white;
              font-size: 8px;
              font-weight: bold
        }
        .logo {
            width: 50px; /* Set width of the logo */
            height: auto; /* Maintain aspect ratio */
            background-image: url('logo.png');
        }
        .center-heading {
            text-align: center;
        }
        p{
          color: black;
          font-weight: 500;
        }
        .Dateofhtml{
          color: #FAF9F6;
          font-weight: bold;
          /* color: yellowgreen; */
          font-size: 15px;
        }
        .GeoHeading{
          position: absolute;
          left: 68px;
          top: -4px;
          font-style: italic;
          /* position: absolute; */
          /* left: 64px; */
          font-size: 45px;
          /* top: -3px; */
          color: white;
          font-style: italic;
          left: 64px color:white font-size:25px;
          font-style: italic;

        }
        .headingsearchReport{
          font-size: 2rem;
          color: #0c4088;
              }
              .HeadingOfhtml{
                font-size: 1.3rem;
          color: #0c8840;
              }
              .mainData{
                color: #88400c;
          font-weight: 500;
              }
              .reporgeneration{
                margin-left:5%;
                margin-bottom:20px
              }        
    </style>
      </head>
      <body> 
          <div class="header">
            <div class="company-info" style="background-image: url('logo.png';")>
                <img 
                src="${baseUrl}/logo.png"
                alt="Company Logo" class="logo" /> 
                <p class="GeoHeading">GeoPicX</p>
                <span class="company-name"> (Micronet Extended Geographic Picture (Data) Analysis System)</span>
            </div>         
          </div> 
          <div>
            <h1 style="text-align: center;" class="headingsearchReport my-auto ml-2">Search Report</h1>
          </div>
          <p class="ml-2 mb-0" style="text-align: left;">Exported on: ${currentDate} at ${currentTime}</p>
          <hr style="background-color: #880c40" class="mt-0"></hr>
          <div class="reporgeneration ">
          <div class=" mx-4 my-5" >
          <div class=" text-left mb-5">
          <table border="1" class=""style="border-collapse: separate;"  >             
          <h2 class="HeadingOfhtml" >Search Input:</h2>
              <thead class="p-2 text-center">
                  <tr class="text-center">
                      ${columns.map(column => `<th style="width: 120px;" class="headOftab">${column}</th>`).join('')}
                  </tr>
              </thead>
              <tbody>
                  ${data.map((row, rowIndex) => `
                      <tr class="">
                      <td class="text-center">${rowIndex + 1}</td>
                          ${row.map(cell => `<td>${cell}</td>`).join('')}
                      </tr>
                  `).join('')}
              </tbody>
          </table></div>
          <div class="mb-5 ">
          <table border="1" class="" style="border-collapse: separate;" >
          
                  
          <h2  class="HeadingOfhtml text-left" >Co-Ordinates:</h2>
              <thead>
                  <tr class="text-center">
                      ${column_Geometry.map(column_Geometry => `<th style="width: 120px;" class="headOftab ">${column_Geometry}</th>`).join('')}
                  </tr>
              </thead>
              <tbody>
                  ${coordinatesData ? coordinatesData.map((row, rowIndex) => `
                      <tr class="text-center">
                     
                          ${row.map(cell => `<td>${cell}</td>`).join('')}
                      </tr>
                  `).join('') : ""}
              </tbody>
          </table></div>
          
          <div class=" w-75  text-left  ">
              <h2 class="HeadingOfhtml">Screenshot Preview:</h2>
              <img src="${screenshot}" alt="Screenshot" class="screenshot-img" />
              <img src="${baseUrl}/footer.JPG" alt="footer" class="screenshot-img" />
          </div></div>
     
          <!-- Additional table -->
          <div class"text-center">
              <h2  class="HeadingOfhtml text-left ml-4">Search Response DataSearch Report:</h2>
          </div>
          <div class="text-left ml-4">
              <span class=" mainData">MAIN DATA TABLE</span><br />
              <table border="1" class=""  style="border-collapse: separate;" >
                  <thead>
                      <tr class="text-center">
                          ${additionalTableColumns.map(column => `<th style="width: 120px;" class="headOftab ">${column}</th>`).join('')}
                      </tr>
                  </thead>
                  <tbody>
                  ${selectedRows.length !== 0 ?
          // Display only selected rows
          selectedRows.map(row => `
                      <tr class="text-center">
                          <td class="search-table-font">${row + 1}</td>
                          <td class="search-table-font">${responseData[row].id}</td>
                          <td class="search-table-font" style="width: 25%;">${responseData[row].DATANAME.length > 400 ? `${responseData[row].DATANAME.slice(0, 400)}....` : responseData[row].DATANAME}</td>
                          <td class="search-table-font">${responseData[row].COMP_NA}</td>
                          <td class="search-table-font">${responseData[row].SATT_NA}</td>
                          <td class="search-table-font">${responseData[row].SEN_NAME}</td>
                          <td class="search-table-font">${responseData[row].IMG_DATE}</td>
                          <td class="search-table-font">${responseData[row].DSIZE}</td>
                          <td class="search-table-font">${responseData[row].IMG_DAPROC}</td>
                          <td class="search-table-font">${responseData[row].IMG_DATYPE}</td>
                      </tr>
                      `).join('') :
          // Display all responseData
          responseData && responseData.length > 0 ?
            responseData.map((item, index) => `
                          <tr class="text-center">
                          <td class="search-table-font">${index + 1}</td>
                          <td class="search-table-font">${item.id}</td>
                          <td class="search-table-font" style="width: 25%;">${item.DATANAME.length > 400 ? `${item.DATANAME.slice(0, 400)}....` : item.DATANAME}</td>
                          <td class="search-table-font">${item.COMP_NA}</td>
                          <td class="search-table-font">${item.SATT_NA}</td>
                          <td class="search-table-font">${item.SEN_NAME}</td>
                          <td class="search-table-font">${item.IMG_DATE}</td>
                          <td class="search-table-font">${item.DSIZE}</td>
                          <td class="search-table-font">${item.IMG_DAPROC}</td>
                          <td class="search-table-font">${item.IMG_DATYPE}</td>
                          </tr>
                        `).join('') :
            `<tr><td colspan="11" class="search-table-font">No data found.</td></tr>`
        }
                        </tbody>
                      </table>
                    </div>
                    </div>
                    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                </body>
            </html> 
          `;
      // Create a blob with HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Set the filename
      link.download = 'search_report.html';

      // Simulate a click on the link to trigger the download
      link.click();

      // Clean up
      window.URL.revokeObjectURL(link.href);

    } else if (format === 'csv') {

      let csvContent = columns.join(",") + "\n";

      // Add rows with index, column name, and cell value
      data.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          if (cellIndex === 0) {
            csvContent += `${rowIndex + 1},${cell},`;
          } else {
            csvContent += `${cell},`;
          }
        });
        csvContent += "\n";
      });
      // Add a blank line
      csvContent += "\n";

      // Add additional table data
      additionalTableColumns.forEach((column, columnIndex) => {
        if (columnIndex === 0) {
          csvContent += `${column},`;
        } else {
          csvContent += `${column},`;
        }
      });
      csvContent += "\n";


      // if (responseData && responseData.Data && responseData.Data.marsmaintabledata && responseData.Data.marsmaintabledata.length > 0) {
      //   responseData.Data.marsmaintabledata.forEach((item, index) => {
      //     csvContent += `${index + 1},`;
      //     additionalTableColumns.forEach(column => {
      //       csvContent += `${item[column] || ''},`;
      //     });
      //     csvContent += "\n";
      //   });
      // } else {
      //   csvContent += "No data found.\n";
      // }

      // if (selectedRows.length !== 0) {
      //   // Display only selected rows
      //   selectedRows.forEach((rowIndex, index) => {
      //     const rowData = responseData.Data.marsmaintabledata[rowIndex];
      //     csvContent += `${index + 1},`;
      //     additionalTableColumns.forEach(column => {
      //       csvContent += `${rowData[column] || ''},`;
      //     });
      //     csvContent += "\n";
      //   });
      // } else if (responseData && responseData.Data && responseData.Data.marsmaintabledata && responseData.Data.marsmaintabledata.length > 0) {
      //   // Display all responseData
      //   responseData.Data.marsmaintabledata.forEach((item, index) => {
      //     csvContent += `${index + 1},`;
      //     additionalTableColumns.forEach(column => {
      //       csvContent += `${item[column] || ''},`;
      //     });
      //     csvContent += "\n";
      //   });
      // } else {
      //   csvContent += "No data found.\n";
      // }


      if (selectedRows.length !== 0) {
        // Display only selected rows
        selectedRows.forEach((rowIndex, index) => {
          const rowData = responseData[rowIndex];
          csvContent += `${index + 1},${rowData.id || ''},${rowData.DATANAME || ''},${rowData.COMP_NA || ''},${rowData.SATT_NA || ''},${rowData.SEN_NAME || ''},${rowData.IMG_DATE || ''},${rowData.DSIZE || ''},${rowData.IMG_DAPROC || ''},${rowData.IMG_DATYPE || ''}\n`;
        });
      } else if (responseData && responseData.length > 0) {
        // Display all responseData
        responseData.forEach((item, index) => {
          csvContent += `${index + 1},${item.id || ''},${item.DATANAME || ''},${item.COMP_NA || ''},${item.SATT_NA || ''},${item.SEN_NAME || ''},${item.IMG_DATE || ''},${item.DSIZE || ''},${item.IMG_DAPROC || ''},${item.IMG_DATYPE || ''}\n`;
        });
      } else {
        csvContent += "No data found.\n";
      }
      // Create a blob with CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Set the filename
      link.download = 'search_report.csv';
      // Simulate a click on the link to trigger the download
      link.click();
      // Clean up
      window.URL.revokeObjectURL(link.href);
    }
  };


  // Example function to simulate file download
  const downloadFile = (blob, index, extension) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `geometry_${index}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportLayer = () => {
    try {
      const selectedFormat = layerFormat; // Assuming `layerFormat` is a state variable holding the selected format
      const geometry = formData.aoigeometry;

      // Ensure geometry has a 'type' property and coordinates
      if (!geometry.type || !geometry.coordinates) {
        throw new Error('Geometry data is not in the expected format');
      }

      let blob;
      let extension;
      let mimeType;

      // Check if geometry object has a 'type' property and handle accordingly
      if (geometry.type === 'Point') {
        // Handle Point geometry
        const pointCoordinates = geometry.coordinates;
        console.log('Point Coordinates:', pointCoordinates);

        if (selectedFormat === 'kml') {
          // Create KML for Point
          const kmlDocument = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
              <Document>
                <Placemark>
                  <Point>
                    <coordinates>${pointCoordinates.join(',')}</coordinates>
                  </Point>
                </Placemark>
              </Document>
            </kml>`;

          const kmlData = new XMLSerializer().serializeToString(new DOMParser().parseFromString(kmlDocument, 'text/xml'));
          blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
          extension = 'kml';
          mimeType = 'application/vnd.google-earth.kml+xml';
        } else if (selectedFormat === 'json') {
          // Create GeoJSON for Point
          const geoJSONData = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: pointCoordinates
            },
            properties: {}
          };

          const geoJSONString = JSON.stringify(geoJSONData);
          blob = new Blob([geoJSONString], { type: 'application/json' });
          extension = 'json';
          mimeType = 'application/json';
        } else if (selectedFormat === 'shp') {
          // Create Shapefile for Point
          const geoJSONData = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: pointCoordinates
              },
              properties: {}
            }]
          };

          const options = {
            folder: 'shapefiles',
            types: {
              point: 'points',
            }
          };

          shpwrite.download(geoJSONData, options);
          return; // Exit function as shpwrite handles the download
        } else {
          console.warn('Unsupported export format:', selectedFormat);
          return; // Skip unsupported export formats
        }

      } else if (geometry.type === 'LineString') {
        // Handle LineString geometry
        const lineStringCoordinates = geometry.coordinates;
        console.log('LineString Coordinates:', lineStringCoordinates);

        if (selectedFormat === 'kml') {
          // Create KML for LineString
          const kmlDocument = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
              <Document>
                <Placemark>
                  <LineString>
                    <coordinates>${lineStringCoordinates.map(point => point.join(',')).join(' ')}</coordinates>
                  </LineString>
                </Placemark>
              </Document>
            </kml>`;

          const kmlData = new XMLSerializer().serializeToString(new DOMParser().parseFromString(kmlDocument, 'text/xml'));
          blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
          extension = 'kml';
          mimeType = 'application/vnd.google-earth.kml+xml';
        } else if (selectedFormat === 'json') {
          // Create GeoJSON for LineString
          const geoJSONData = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: lineStringCoordinates
            },
            properties: {}
          };

          const geoJSONString = JSON.stringify(geoJSONData);
          blob = new Blob([geoJSONString], { type: 'application/json' });
          extension = 'json';
          mimeType = 'application/json';
        } else if (selectedFormat === 'shp') {
          // Create Shapefile for LineString
          const geoJSONData = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: lineStringCoordinates
              },
              properties: {}
            }]
          };

          const options = {
            folder: 'shapefiles',
            types: {
              line: 'lines',
            }
          };

          shpwrite.download(geoJSONData, options);
          return; // Exit function as shpwrite handles the download
        } else {
          console.warn('Unsupported export format:', selectedFormat);
          return; // Skip unsupported export formats
        }

      } else if (geometry.type === 'Polygon') {
        // Handle Polygon geometry
        const polygonCoordinates = geometry.coordinates;
        console.log('Polygon Coordinates:', polygonCoordinates);

        if (selectedFormat === 'kml') {
          // Create KML for Polygon
          const kmlDocument = `<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
              <Document>
                <Placemark>
                  <Polygon>
                    <outerBoundaryIs>
                      <LinearRing>
                        <coordinates>${polygonCoordinates[0].map(point => point.join(',')).join(' ')}</coordinates>
                      </LinearRing>
                    </outerBoundaryIs>
                  </Polygon>
                </Placemark>
              </Document>
            </kml>`;

          const kmlData = new XMLSerializer().serializeToString(new DOMParser().parseFromString(kmlDocument, 'text/xml'));
          blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
          extension = 'kml';
          mimeType = 'application/vnd.google-earth.kml+xml';
        } else if (selectedFormat === 'json') {
          // Create GeoJSON for Polygon
          const geoJSONData = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: polygonCoordinates
            },
            properties: {}
          };

          const geoJSONString = JSON.stringify(geoJSONData);
          blob = new Blob([geoJSONString], { type: 'application/json' });
          extension = 'json';
          mimeType = 'application/json';
        } else if (selectedFormat === 'shp') {
          // Create Shapefile for Polygon
          const geoJSONData = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: polygonCoordinates
              },
              properties: {}
            }]
          };

          const options = {
            folder: 'shapefiles',
            types: {
              polygon: 'polygons',
            }
          };

          shpwrite.download(geoJSONData, options);
          return; // Exit function as shpwrite handles the download
        } else {
          console.warn('Unsupported export format:', selectedFormat);
          return; // Skip unsupported export formats
        }

      } else {
        console.warn('Unsupported geometry type:', geometry.type);
        return; // Skip unsupported geometry types
      }

      // Simulate download function (replace with actual download logic)
      downloadFile(blob, 0, extension);
    } catch (error) {
      console.error('Error in exportLayer:', error);
      alert('An error occurred while exporting the layer: ' + error.message);
    }
  };

  return (
    <div >
      <div class="download-report-modal-dialog">
        <div class="download-report-modal-content">
          <div>
            <div>
              {exportReport ? (
                <>
                  <p className='DownloadReport'>Export AOI</p>
                  <span className='report-cancel-btn' onClick={onClose}>X</span>
                </>
              )
                : (
                  <>
                    <p className='DownloadReport'>Download Report</p>
                    <span className='report-cancel-btn' onClick={onClose}>X</span>
                  </>

                )}

              <div className=''>
                <div className=' '><label className='LAbelToSElectFile'>Select File Format:</label>
                  <br></br>
                  {exportReport ? (
                    <select className='SelectReport' value={layerFormat} onChange={(e) => setLayerFormat(e.target.value)}>
                      <option value="kml">.KML</option>
                      <option value="json">.JSON</option>
                      <option value="shp">.SHP</option>
                    </select>
                  ) : (
                    <select className='SelectReport' value={format} onChange={(e) => setFormat(e.target.value)}>
                      <option value="html">HTML</option>
                      <option value="csv">CSV</option>
                    </select>
                  )
                  }
                </div>
                <div className='row  buttonExportFile d-flex justify-content-center'>
                  <button className='Exportabutton mx-2 col-lg-3' onClick={exportReport ? exportLayer : handleExport}>Export</button>
                  {/* <button className='ExportCancel mx-2 col-lg-3' onClick={onClose}>Cancel</button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadSearchReportModal;
