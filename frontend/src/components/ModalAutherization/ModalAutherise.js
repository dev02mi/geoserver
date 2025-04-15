// import React from 'react';
// import Modal from "react-modal";
// import AuthContent from '../AuthContent/AuthContent';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from "react-router-dom";
// import "./ModalAutherise.css"


// Modal.setAppElement("#root");
// const customStyles = {
//     content: {
//       top: "60%",
//       left: "50%",
//       right: "auto",
//       bottom: "auto",
//       marginRight: "-50%",
//       transform: "translate(-50%, -50%)",
//       color: "#ff0000",
      

//     },
//     overlay: {
//       backgroundColor: "rgba(0, 0, 0, 0.8)", // Adds a semi-transparent overlay
//     },
//   };


// const ModalAutherise = ({
//     isOpen,
//     onRequestClose,
//     onConfirm,
//     onCancel,
  
//     modalMessage,
//     modalBackgroundColor,
//   }) => {
//     const closeButtonStyle = {
//         position: "absolute",
//         top: "-3px",
//         right: "0px",
//         background: "none",
//         border: "none",
//         fontSize: "16px",
//         cursor: "pointer",
//         color: "#ff0000",
//         maxWidth: "90%",
//       };
//       const modalAnimation = {
//         hidden: { opacity: 0, y: -50 },
//         visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } },
//       };
      
//   return (
   
//        <Modal
//       isOpen={isOpen}
//       onRequestClose={onRequestClose}
//       style={customStyles}
//       contentLabel="Success Modal"
//     >
//          {/* <div className="modal-header"> */}
//          <button onClick={onRequestClose} style={closeButtonStyle}>
//         &#10006;
//       </button>
//          {/* </div> */}
    
     
      
//       <div className="d-flex justify-content-space-between my-auto mx-auto">
  
//       <h5>Login As a Autherise User</h5>
//       </div>
     
//       <div className='"d-flex justify-content-center modalbutton'>
//       <Link to="/AutheriseUser">
//           <button
//             style={{ backgroundColor: modalBackgroundColor }}
//             className="confirm-buttons"
//             onClick={onConfirm}
//           >
//             Confirm
//           </button>
//           </Link>
//         {/* <AuthContent/> */}
      
      
//       </div>
//     </Modal>
    
     
  
   
   
//   )
// }

// export default ModalAutherise


import React, { useState, useEffect  } from 'react';
import Modal from "react-modal";
import { Link, navigate, useNavigate } from "react-router-dom";
import axios from 'axios';

import "./ModalAutherise.css";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "60%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    color: "#ff0000",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
};

const closeButtonStyle = {
  position: "absolute",
  top: "-3px",
  right: "0px",
  background: "none",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  color: "#ff0000",
  maxWidth: "90%",
};

const modalAnimation = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } },
};

const ModalAutherise = ({
  isOpen,
  onRequestClose,
  modalBackgroundColor,
  userType, userName, userId,
  // refreshToken,
  // accessToken
  // refreshToken={refreshToken}
}) => {
  const [apiData, setApiData] = useState({});
  const [accessToken, setToken] = useState(null);
const navigate =useNavigate()



// useEffect(() => {
//   console.log('Refresh Token:', refreshToken);
//   const refreshAccessToken = async () => {
//     try {
//       console.log('Refreshing token...');
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/token/refresh/",
//         { refresh: refreshToken },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200 || response.status === 201) {
//         console.log('New Access Token:', newAccessToken);
//         const newAccessToken = response.data.access;
//         console.log('New Access Token:', newAccessToken);
//         setToken(newAccessToken);

//         sessionStorage.setItem("access_token", newAccessToken);
//         if (newAccessToken) {
//           sessionStorage.setItem("access_token", newAccessToken);
//         }
//       }
//     } catch (error) {
//       console.error("Token refresh failed:", error);
//     }
//   };

//   refreshAccessToken();

// }, [refreshToken]);




  // const handleConfirm = async () => {
  //   try {
  //     console.log('Access Token:', accessToken);
  //     console.log('Access Token before API request:', accessToken);
      
    
      
  //     const response = await axios.get('http://127.0.0.1:8000/general_signup/', {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //     const data = response.data.message;

    
  //     setApiData(data);
  //     console.log('Data received from the API:', data);
      
     
  //     if (response.status === 200) {
  //       navigate('/AuthContent', {
  //         state: {
  //           username: data.USERNAME,
  //           email: data.EMAIL,
  //           mobile: data.MOBILE_NO,
  //         },
  //       });
       
          
  //     } else {
  //       console.error('Unexpected API response:', response);
  //     }
  //     console.log('Data after navigation:', data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };



  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      // userName={userName} userType={userType} refreshToken={refreshToken}
      // accessToken={accessToken}
      contentLabel="Success Modal"
    >
      <button onClick={onRequestClose} style={closeButtonStyle}>
        &#10006;
      </button>

      <div className="d-flex justify-content-space-between my-auto mx-auto">
        <h5>Login As an Authorized User</h5>
      </div>

      <div className="d-flex justify-content-center modalbutton">
        <Link 
        to="/AutheriseUser"
        >
          <button
            style={{ backgroundColor: modalBackgroundColor }}
            className="confirm-buttons"
            // onClick={handleConfirm}
          >
            Confirm
          </button>
        </Link>
      </div>
    </Modal>
  );
};

export default ModalAutherise;
