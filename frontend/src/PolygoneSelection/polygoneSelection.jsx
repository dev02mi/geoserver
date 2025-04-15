import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import MapComp from "../components/DraggingBox/MapPanel/MapComp";

const PolygoneSelection = () => {
  // const [usls, setUrls] = React.useState([]);
  const mapContainerRef = useRef(null);
  const functionFrommap = useRef(null);
  const mapRef = useRef(null);
  const [Geometrydata, setGeometrydata] = useState(null);
  const fileLayersMap = useRef(new Map());
  const [sharedData, setSharedData] = useState("");
  const [ActivePourPoint, setActivePourPoint] = useState(false);
  const [urls, seturls] = useState({});
  const backgroundC = "lightblue"; // or use a state variable
  console.log("____________________________________________nnnnnnnnnnnnn");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");
  const [input4, setInput4] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);
const [isZip, setIsZip] = useState(false);

const [khasraNumbers, setKhasraNumbers] = useState([]);
const [selectedKhasra, setSelectedKhasra] = useState("");


//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]); // Store the selected file
//   };

// const handleFileChange = (event) => {
//     const file = event.target.files[0];

//     if (file && file.name.toLowerCase().endsWith(".zip")) {
//         setSelectedFile(file);
//         setIsZip(true);
//       } else {
//         setSelectedFile(null);
//         setIsZip(false);
//         alert("Please upload a valid ZIP file.");
//       }
//   };

  // const handleUpload = () => {
  //   if (selectedFile) {
  //     // Add your upload logic here (e.g., send file to backend)
  //     console.log("Uploading:", selectedFile);
  //   }
  // };

 useEffect(() => {
    const fetchKhasraNumbers = async () => {
      try {
        const response = await fetch( `http://127.0.0.1:8000/Polygone_selection/?Khasra_no=${encodeURIComponent(selectedKhasra)}`, 
          {
            method: "GET",
            credentials:'include',
            // headers: {
            //   credentials: 'include',
            // },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        else{
          if (data && data.unique_khasra_nums) {
            console.log("Fetched khasra numbers: ALLL CALLL__________");
            setKhasraNumbers(data.unique_khasra_nums);
          }
          else {
            console.error("specific khasra calll_____________", data);
            
          }
        }
        // setKhasraNumbers(data.unique_khasra_nums);
      } catch (error) {
        console.error("Error fetching khasra numbers:", error);
      }
    };

    fetchKhasraNumbers();
  }, [selectedKhasra]);



  return (<div style={{ display: "flex", height: "100vh", width: "100%" }}>
  {/* Left Section: Map */}
  <div style={{ flex: 2 }}>
    <MapComp
      ref={functionFrommap}
      mapContainerRef={mapContainerRef}
      datavalue={Geometrydata}
      fileLayersMap={fileLayersMap}
      sent_datav={sharedData}
      ActivePourPoint={ActivePourPoint}
      urls_1={urls}
    />
  </div>

  {/* Right Section: Input Fields */}

  {/* <div style={{ flex: 1, padding: "20px", backgroundColor: "#f8f9fa" }}>
        <h3>Upload a File</h3>
        <input type="file" onChange={handleFileChange} />

        {selectedFile && (
          <p>
            Selected File: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </div> */}
       <div style={{ flex: 1, padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h3>List OF KHASRA NO</h3>
      {/* <input type="file" accept=".zip" style={{display:"block"}}  /> */}

      {/* {selectedFile && (
        <p>
          Selected File: <strong>{selectedFile.name}</strong>
        </p>
      )} */}

        {khasraNumbers.length > 0 && (
        <div>
          <label>Select Khasra Number:</label>
          <select
            value={selectedKhasra}
            onChange={(e) => setSelectedKhasra(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="">-- Select --</option>
            {khasraNumbers.map((num, index) => (
              <option key={index} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      )}
   
  

      <button
        // onClick={handleUpload}
        disabled={!isZip}
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: isZip ? "#28a745" : "#ccc",
          color: "white",
          border: "none",
          cursor: isZip ? "pointer" : "not-allowed",
        }}
      >
        {/* Upload ZIP File */}
      </button>
    </div>

</div>
);
};

export default PolygoneSelection;
