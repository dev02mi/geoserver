import React, { useState, useEffect } from 'react';
import './NdviComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

const NdviComponent = () => {
  const [inputImage, setInputImage] = useState(null);
  const [outputFolder, setOutputFolder] = useState('');
  const [formula, setFormula] = useState('NDVI = (NIR - RED) / (NIR + RED)');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState('Select');
  const [selectedNIR, setSelectedNIR] = useState(null);
  const [selectedRED, setSelectedRED] = useState(null);

  const handleInputFolderSelect = (e) => {
    setInputImage(e.target.files[0]);
  };

  const handleOutputFolderSelect = (e) => {
    const file = e.target.files[0];
    const outputPath = file ? file.path : '';
    setOutputFolder(outputPath);
  };

  useEffect(() => {
    if (selectedSensor === "Pleaides NEO") {
      setSelectedNIR("Band 3");
      setSelectedRED("Band 4");
    } else if (selectedSensor === "Pleaides") {
      setSelectedNIR("Band 3");
      setSelectedRED("Band 4");
    } else if (selectedSensor === "SPOT") {
      setSelectedNIR("Band 3");
      setSelectedRED("Band 4");
    }
  }, [selectedSensor]);

  const handleIndexChange = (e) => {
    const index = parseInt(e.target.value);
    setSelectedIndex(index);
    if (index === 1) {
      setFormula('NDVI = (NIR - RED) / (NIR + RED)');
    } else if (index === 2) {
      setFormula('NDWI = (Green - NIR) / (Green + NIR)');
    }
  };

  const sensorBandWavelengths = {
    "Pleaides NEO": {
      "Band 1": "400-450 nm",
      "Band 2": "450-520 nm",
      "Band 3": "530-590 nm",
      "Band 4": "620-690 nm",
      "Band 5": "700-750 nm",
      "Band 6": "770-880 nm"
    },
    "Pleaides": {
      "Band 1": "430-550 nm",
      "Band 2": "490-610 nm",
      "Band 3": "600-720 nm",
      "Band 4": "750-950 nm"
    },
    "SPOT": {
      "Band 1": "0.455–0.525 µm",
      "Band 2": "0.530–0.590 µm",
      "Band 3": "0.625–0.695 µm",
      "Band 4": "0.760–0.890 µm"
    }
  };

  const handleSensorChange = (event) => {
    setSelectedSensor(event.target.value);
    setSelectedNIR(null);
    setSelectedRED(null);
  };

  const handleCategory = (e) => {

  };

  const handleBandSelection = (band, column) => {
    if (column === 'NIR') {
      if (selectedNIR === band) {
        setSelectedNIR(null);
      } else {
        setSelectedNIR(band);
      }
    } else if (column === 'RED') {
      if (selectedRED === band) {
        setSelectedRED(null);
      } else {
        setSelectedRED(band);
      }
    }
  };

  return (
    <Container className="mt-5 p-4 border rounded bg-light w-50">
      <h2 className="text-center mb-4 Nvdi_title">NDVI Calculation</h2>
      <hr />
      <Form className='p-4'>
        <Row className="mb-2">
          <Form.Group as={Col} sm={6} controlId="input-folder">
            <Form.Label className='Lable-Input'>Input Image:</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="file"
                accept=".tif,.tiff"
                onChange={handleInputFolderSelect}
                style={{ display: 'none' }}
                id="input-file"
              />
              <Form.Control
                type="text"
                value={inputImage ? inputImage.name : ''}
                readOnly
                placeholder="No file selected"
                className="mr-2 "
                style={{padding:"0px !important"}}
              />
              <Button variant="primary" as="label" htmlFor="input-file" className="ml-2" style={{marginTop:"-2px"}}>
                <FontAwesomeIcon icon={faFileUpload} /> Choose File
              </Button>
            </div>
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="output-folder">
            <Form.Label className='Lable-Output'>Output Folder:</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="file"
                directory=""
                webkitdirectory="false"
                onChange={handleOutputFolderSelect}
                style={{ display: 'none' }}
                id="output-file"
              />
              <Form.Control
                type="text"
                value={outputFolder}
                readOnly
                placeholder="Select output folder"
                className="mr-2"
                style={{padding:"0px !important"}}
              />
              <Button variant="primary" as="label" htmlFor="output-file" className="ml-2 " style={{marginTop:"-2px"}}>
                <FontAwesomeIcon icon={faFileUpload} /> Choose Folder
              </Button>
            </div>
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} sm={6}>
            <Form.Label>Sensor Type:</Form.Label>
            <Form.Control  as="select" onChange={handleSensorChange}>
              <option value="Select">Select the Sensor</option>
              <option value="Pleaides NEO">Pleaides Neo</option>
              <option value="Pleaides">Pleaides</option>
              <option value="SPOT">Spot</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} sm={6}>
            <Form.Label>Category:</Form.Label>
            <Form.Control as="select" onChange={handleCategory}>
              <option value="All">All</option>
              <option value="Water">Water</option>
              <option value="Soil">Soil</option>
              <option value="Vegetation">Vegetation</option>
            </Form.Control>
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} sm={6}>
            <Form.Label>Index:</Form.Label>
            <Form.Control as="select" onChange={handleIndexChange}>
              <option value="1">NDVI-Normalized Difference Vegetation Index</option>
              <option value="2">NDWI-Normalized Difference Water Index</option>
              <option value="3">EVI-Enhanced Vegetation Index</option>
              <option value="4">SAVI-Soil Adjusted Vegetation Index</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} sm={6}>
            <Form.Label className='Lable-Formula'>Formula:</Form.Label>
            <Form.Control
              type="text"
              value={formula}
              readOnly
              placeholder="Formula"
            />
          </Form.Group>
        </Row>
      </Form>
      <h4 className="mt-4">Bands Selections :</h4>
      <br/>
      <Table striped bordered hover  className="BandsTable mt-3 w-50">
        <thead>
          <tr>
            <th>Band</th>
            <th>Wavelength</th>
            <th>NIR</th>
            <th>RED</th>
          </tr>
        </thead>
        <tbody>
          {selectedSensor === 'Select' ? (
            <tr className='Select-table'>
            </tr>
          ) : (
            Object.entries(sensorBandWavelengths[selectedSensor]).map(([band, wavelength], index) => (
              <tr key={index}>
                <td>{band}</td>
                <td>{wavelength}</td>
                <td className="NIRColumn" onClick={() => handleBandSelection(band, 'NIR')}>
                  {selectedNIR === band ? '✔️' : ''}
                </td>
                <td className="RedColumn" onClick={() => handleBandSelection(band, 'RED')}>
                  {selectedRED === band ? '✔️' : ''}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default NdviComponent;
