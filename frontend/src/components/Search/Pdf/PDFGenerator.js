import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class PDFGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.generatePDF = this.generatePDF.bind(this);
  }

  generatePDF() {
    const { formData, responseData } = this.props;

    // Create a new PDF instance
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(12);
    // Define title text and its height
    const titleText = 'Search Analysis Report';
    const titleTextHeight = 7; // Adjust this value as needed
    const titleDateHeight = 5;


    // Add title text
    doc.text(titleText, 105, titleTextHeight, { align: 'center' });

    // Calculate the width and position for the line below the title
    const lineWidth = doc.internal.pageSize.width - 40; // Subtracting margins
    const lineY = 8; // You can adjust this value for spacing

    // Get current date and format it as "MM/DD/YYYY"
    const currentDate = new Date();
    const formattedDate = ('0' + (currentDate.getMonth() + 1)).slice(-2) + '/' + ('0' + currentDate.getDate()).slice(-2) + '/' + currentDate.getFullYear();

    // Add formatted date below title
    doc.setFontSize(8);
    doc.text('Date: ' + formattedDate, 200, titleDateHeight, { align: 'right' });

    // Add horizontal line below title
    doc.setLineWidth(0.1);
    doc.line(2, lineY, 38 + lineWidth, lineY);

    // // Add page border
    // const margin = 10; // Adjust this value to set the margin

    // Calculate adjusted coordinates
    // const x = margin;
    // const y = margin;
    // const width = doc.internal.pageSize.width - 2 * margin;
    // const height = doc.internal.pageSize.height - 2 * margin;

    // Set draw color and line width
    doc.setDrawColor(0); // Black color
    doc.setLineWidth(0.5); // Border width

    // Draw rectangle with adjusted coordinates
    // doc.rect(x, y, width, height, 'S');

    // Draw horizontal line inside the border at the top
    // const lineHeight = 15; // Adjust the height of the line as needed
    // doc.line(x, y + lineHeight, x + width, y + lineHeight);

    // Add text to the horizontal line
    // const titleText = 'Search Analysis Report';
    // const fontSize = 16;
    // doc.setFontSize(fontSize);
    // const textWidth = doc.getStringUnitWidth(titleText) * fontSize / doc.internal.scaleFactor;
    // const textX = (doc.internal.pageSize.width - textWidth) / 2;
    // doc.text(titleText, textX, y + lineHeight + fontSize + 3);

















    // //Search INPUT 

    // // Add title for form data table
    doc.setFontSize(10);
    doc.text('Search Input Data', 5, 12);

    // Define columns for form data table
    const columnsFormData = ['Key', 'Value'];

    // Extract form data and convert it to an array of arrays
    doc.setFontSize(8);
    const formDataArray = Object.entries(formData).map(([key, value]) => [key, value]);

    // Add form data table
    doc.autoTable({
      startX: 5,
      startY: 15, // Adjust the startY position as needed
      head: [columnsFormData],
      body: formDataArray,
      columnStyles: { 0: { columnWidth: 40 }, 1: { columnWidth: 30 } }, // Adjust column widths
      margin: { top: 35, left: 5 }, // Adjust margin to increase row height
      rowStyles: { fontSize: 8, cellPadding: 2 }, // Adjust row height and cell padding
      drawHeaderRow: function (row) {
        // Add horizontal line below each cell in the header row
        doc.setDrawColor(0); // Black color
        doc.setLineWidth(3); // Line width
        doc.line(row.x, row.y + row.height, row.x + row.width, row.y + row.height); // Draw line below the cell
      }
    });







    // Define columns for coordinates table
    const columnsCoordinates = ['Index', 'Latitude', 'Longitude'];

    // Extract coordinates data
    let coordinatesData;
    if (formData.aoigeometry && formData.aoigeometry.coordinates) {
      if (Array.isArray(formData.aoigeometry.coordinates[0])) {
        coordinatesData = formData.aoigeometry.coordinates[0].map((coordinate, index) => [
          index,
          coordinate[0], // Latitude
          coordinate[1], // Longitude
        ]);
      } else {
        coordinatesData = [
          [0, formData.aoigeometry.coordinates[0], formData.aoigeometry.coordinates[1]],
        ];
      }
      // Add title for coordinates table
      //doc.setFontSize(10);
      doc.text('Coordinates', 14, doc.lastAutoTable.finalY + 20);
      // Add coordinates table
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 30,
        head: [columnsCoordinates],
        body: coordinatesData,
      })
    };

    // Add title for response data table
    //doc.setFontSize(10);
    doc.text('Search Response Data', 14, doc.lastAutoTable.finalY + 20);

    // Extract response data
    const responseDataArray = Object.entries(responseData).flatMap(([key, value]) => {
      // If the value is an array, flatten it to a string
      if (Array.isArray(value)) {
        value = value.map(item => JSON.stringify(item)).join(', ');
      }
      return key !== 'IMG_PREVIEW' && key !== 'coordinates' && key !== 'marsbandinformation_set' ? [[key, value]] : [];
    });

    // Add response data table
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 30,
      head: [columnsFormData],
      body: responseDataArray,
    });

    // Add tables for coordinates or marsbandinformation_set
    Object.entries(responseData).forEach(([key, value]) => {
      if (Array.isArray(value) && (key === "coordinates" || key === "marsbandinformation_set")) {
        let columns, data;
        if (key === "coordinates") {
          columns = ['Index', 'Longitude', 'Latitude'];
          data = value[0].map((coordinate, index) => [index, coordinate[0], coordinate[1]]);
        } else {
          columns = ['Band Name', 'Start Spectrum', 'End Spectrum'];
          data = value.map(item => [item.BAND_NAME, item.BAND_S_SPEC, item.BAND_E_SPEC]);
        }

        doc.text(`${key} Data`, 14, doc.lastAutoTable.finalY + 20);
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 30,
          head: [columns],
          body: data,
        });
      }
    });

    doc.text('Preview Image', 14, doc.lastAutoTable.finalY + 15);
    // Add the image if key is "IMG_PREVIEW" and value exists
    const imgPreview = responseData["IMG_PREVIEW"];
    if (imgPreview) {
      const imageData = `data:image/jpeg;base64,${imgPreview}`;
      const imageYPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 40; // Check if lastAutoTable exists
      const imageWidth = 60; // Set the width of the image
      const imageHeight = 60; // Set the height of the image
      doc.addImage(imageData, 'JPEG', 15, imageYPosition, imageWidth, imageHeight);
    }

    // Save the PDF
    doc.save('search_data.pdf');

  }

  render() {
    return null;
  }
}

export default PDFGenerator;
