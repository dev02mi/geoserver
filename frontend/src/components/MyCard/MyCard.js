import React from "react";
import "./MyCard.css";
import ModalAutherise from "../ModalAutherization/ModalAutherise";
import Modal from "react-modal";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModalManager from '../GeopicxPopupModals/ModalManager';
import { useSelector } from "react-redux";
Modal.setAppElement("#root");

const MyCard = ({ refreshToken }) => {

  const newaccessToken = useSelector((state) => state.auth.accessToken);

  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const [userType, setUserType] = useState(() => {
    // Initialize userType from sessionStorage or set to null if not found
    return sessionStorage.getItem("userType") || null;
  });

  // Add a delay to initiate the animation after the component is mounted
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleConfirm = async (link) => {
    if (userType === 'GU') {
      try {
        // Display a SweetAlert confirmation
        // const result = await Swal.fire({
        //   title: 'If You Want To acess this Application Login As AUtherise user',
        //   text: 'You want to proceed with this action!',
        //   icon: 'question',
        //   showCancelButton: true,
        //   confirmButtonColor: '#3085d6',
        //   cancelButtonColor: '#d33',
        //   confirmButtonText: 'Yes, proceed!',
        // });

        const result = await ModalManager.confirm({
          modalHeaderHeading: 'GU to UU Conversion',
          modalBodyHeading: 'Confirmation',
          message: 'Are you sure you want to proceed?',
          confirmButtonText: 'OK',
          showCancelButton: true,
        });


        if (result.isConfirmed) {
          const response = await axios.get('http://127.0.0.1:8000/general_signup/', {
            headers: {
              Authorization: `Bearer ${newaccessToken}`,
            },
          });

          if (response.status === 200) {
            const data = response.data.message[0];
            const newdata = {
              username: data.USERNAME,
              email: data.EMAIL,
              mobile: data.MOBILE_NO,
              password: data.PASSWORD,
              userId: data.USERID,
              isUserType: 'UU'
            };

            localStorage.setItem('guData', JSON.stringify(newdata));
            navigate('/Signup');
          } else {
            console.error('Unexpected API response:', response);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else if (userType === 'UU') {
      navigate("/Application");
    }

  };
  const handleNavigation = (link) => {
    navigate("/Application", { state: { someData: link } });
  };


  return (
    <>
      {userType === "GU" && (
        <ModalAutherise
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Confirmation Modal"
          modalMessage={"Successfully submit Authorized Form"}
          refreshToken={refreshToken}
        />
      )}


      <div class="row justify-content-center">
        <div class="col-12">
          <div class="section-title text-center mb-4 pb-2">
            <h1 className="text-card my-4 container-fluid ">Applications</h1>
            <p
              className="text-mars-home text-justify App-para"
            >
              GeoPicX stands at the forefront of geospatial technology, offering
              cutting-edge solutions that redefine the landscape of location-based
              services. Our software seamlessly integrates powerful mechanisms,
              providing a robust platform for diverse geospatial applications. With a
              commitment to innovation, GeoPicX delivers services that empower users
              with advanced spatial insights and analytical capabilities. Experience
              the next level of geospatial intelligence with GeoPicX, where precision
              meets efficiency to unlock new possibilities in the realm of spatial
              data management. Elevate your geospatial experience with our dynamic
              solutions tailored to meet the evolving demands of the modern world.
            </p>
          </div>
        </div>
      </div>


      <div class="card-deck  products-cards justify-content-center ">

        <div class="card-res d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">

          <div class="tpn_card" onClick={handleConfirm}>
            <img src="airbusCard1.jpg" class="w-100 mb-4 inner-img" />
            <h5>Mars</h5>
            <p>Enjoy this clean styling.</p>
            <a onClick={() => handleNavigation("mars")} class="Exp-btn">Explore</a>
          </div>

          <div class="tpn_card " onClick={handleConfirm}>
            <img src="AgricultureHome1.jpg" class="w-100 mb-4 inner-img" />
            <h5>Agriculture</h5>
            <p>Enjoy this clean styling.</p>
            <a onClick={() => handleNavigation("agriculture")} class="Exp-btn">Explore</a>
          </div>

          <div class="tpn_card" onClick={handleConfirm}>
            <img src="waterbannerImg1.jpg" class="w-100 mb-4 inner-img" />
            <h5>Water</h5>
            <p>Enjoy this clean styling.</p>
            <a onClick={() => handleNavigation("water")} class="Exp-btn">Explore</a>
          </div>

          <div class="tpn_card" onClick={handleConfirm}>
            <img src="DefenceBanner1.jpg" class="w-100 mb-4 inner-img" />
            <h5>Defence</h5>
            <p>Enjoy this clean styling.</p>
            <a onClick={() => handleNavigation("defense")} class="Exp-btn">Explore</a>
          </div>

          <div class="tpn_card" onClick={handleConfirm}>
            <img src="MinningBannerImage1.jpg" class="w-100 mb-4 inner-img" />
            <h5>Minning</h5>
            <p>Enjoy this clean styling.</p>
            <a onClick={() => handleNavigation("mining")} class="Exp-btn">Explore</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCard;
