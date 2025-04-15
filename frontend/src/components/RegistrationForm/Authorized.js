import React, { useState, useEffect } from "react";
import "./Registration.css";
import "react-toastify/dist/ReactToastify.css";
import General from "./General";
import { ToastContainer, toast } from "react-toastify";
//  Palash
import SuccessModal from "../Modal/SuccessModal";
import { useNavigate, useParams } from "react-router-dom";
import AutheriseUser from "../AutheriseUser/AutheriseUser";
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody";
import CentraliseButtonForActivestatus from "../CentraliseButton/CentraliseButtonForActivestatus";

// import LoginUserIcon from '../../../public/LoginPage_LOGO_10k_purple.svg'


const Authorized = ({ }) => {

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [userType, setUserType] = useState("GU");

  const [disabledType, setDisabledType] = useState("");


  useEffect(() => {
    const storedData = localStorage.getItem('guData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserType(parsedData.isUserType);
      setDisabledType('GU');
    }
  }, []);

  const navigate = useNavigate();

  const handleUserTypeChange = (value) => {
    setUserType(value);
    // if (value == "GU") {

    // } else {
    //   setDisabledType('UU');
    // }
  };


  const handleBackButtonClick = () => {
    navigate('/login');
  };
  return (
    <div className="mainboxAuthorise" >
      <div>
        <ToastContainer />

        <div className=" p-3">
          {showSuccessModal && (
            <SuccessModal
              isOpen={showSuccessModal}
              onRequestClose={() => setShowSuccessModal(false)}
              contentLabel="Confirmation Modal"
            />
          )}
          <div className="d-flex justify-content-center align-items-center  "
          >
            <div className=" " style={{
              // background: "url(https://img.freepik.com/free-vector/white-abstract-background-design_23-2148825582.jpg?size=626&ext=jpg&ga=GA1.1.1413502914.1719964800&semt=ais_user)",
              // backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundAttachment: "fixed", backgroundPosition: "center",
            }} >
              <CentraliseheaderBody
                header="Registration"
                logo='LoginPage_LOGO_10k_purple.svg'
                headerBgColor="rgb(64 37 136)"        // Set your desired header background color
                headerTextColor="white"
                onClose={handleBackButtonClick}
              >


                <div className="Create-admin-button my-3">
                  <CentraliseButtonForActivestatus
                    text=" GENERAL USER"
                    onClick={() => handleUserTypeChange("GU")}
                    // disabled={disabledType === 'GU'}
                    isActive={userType === "GU"}
                    // disabled={adminType === params.selectedAdminType}
                    activeVariant="green"
                    inactiveVariant="#808080a8"
                    padding="6px 6px"
                    //  textColor="black"
                  
                    fontsize="15px"
                    className={`btn AU_Toogle_btnG  my-1  ${userType === "GU" ? 'btn-success' : 'btn_outline_primary'}`}

                  />

                  <CentraliseButtonForActivestatus
                    text=" AUTHORIZED USER"
                    onClick={() => handleUserTypeChange("UU")}
                    isActive={userType === "UU"}
                    // disabled={disabledType === 'UU'}
                    // disabled={adminType === params.selectedAdminType}
                    activeVariant="green"
                    inactiveVariant="#808080a8"
                    // variant="#808080a8" 
                    // hoverBgColor="skyblue" 
                    // hoverTextColor="white" 
                    padding="6px 6px" // Padding
                    //  textColor="black"
                   
                    fontsize="15px" // Font size
                    className={`btn AU_Toogle_btnA  my-1  ${userType === "UU" ? 'btn-success' : 'btn_outline_primary'}`}
                  />
                </div>


                <div>
                  {userType === "GU" && (
                    <div>
                      <General
                        userType={userType}
                      />

                    </div>
                  )}

                  {userType === "UU" && (
                    <div>
                      <AutheriseUser
                        userType={userType}
                      />

                    </div>
                  )}
                </div>
                <br />
              </CentraliseheaderBody>

            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
      {/* <!-- Footer --> */}
      {/* <div className='Authorized-footer'>
        <CopyRightFooter />
      </div> */}
    </div>
  );
};

export default Authorized;
