// UserProfileModal.js

import React, { useEffect, useState, useRef, useContext } from "react";
import "./UserProfileModal.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faRightFromBracket, faUserEdit, faLock } from "@fortawesome/free-solid-svg-icons";
import UpdateUserProfile from "../UpdateUserProfile/UpdateUserProfile.js";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from "../StoreContext/features/profile/modalReducer.js";
import { showUpdateProfile } from "../StoreContext/features/profile/updateProfileSlice.js";
import { ThemeToggleSwitch } from "../../ThemeContext.js";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


const UserProfileModal = ({ userName, userType }) => {

  // const { theme, toggleTheme } = useContext(ThemeContext);
  const isOpenprofile = useSelector((state) => state.modal.isModalOpen);
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const departmentType = sessionStorage.getItem('departmentType');


  const handleButtonClick = async () => {
    dispatch(showUpdateProfile());
    dispatch(closeModal())

  };


  const handleLogout = async () => {
    // Clear the session storage
    sessionStorage.clear();
    sessionStorage.clear();
    localStorage.clear();

    // Ensure specific keys are removed (optional, as sessionStorage.clear() should remove all keys)
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("testpradum");
    sessionStorage.removeItem("userType");
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("THEME_OPT");
    sessionStorage.removeItem("isApplication");
    sessionStorage.removeItem("isApplication");
    // navigate("/Login");
    window.location.href = "/Login";
  };


  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      // onClose();
      dispatch(closeModal())
    }
  };


  useEffect(() => {
    // Add event listener when the modal is open
    if (isOpenprofile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Clean up event listener when the modal is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenprofile]);

  //////////////////////////chhayas/////////////
  const handleChangePassword = () => {
    window.location.href = `/ChangePassword?username=${userName}&userType=${userType}`;
  };

  return (

    <>
      <div class={`card_waper  d-md-block `} ref={modalRef} >
        <div class="card-header">
          <button class="close-btn" onClick={() => dispatch(closeModal())}>×</button>
          <div class="avatar">{userName.charAt(0).toUpperCase()}</div>
          <h5 class=" userNane_text mb-1 text-white">{userName} </h5> ({userType === 'AU' ? (departmentType === 'WCADMIN' ? 'WCAU' : 'UDAU') : userType})
        </div>
        {/* <div class="card-body">
          <h5 class="card-title mb-1 text-dark">{userName}</h5>
          <p class="card-text text-muted">pradumm.microdev06@gmail.com</p>
        </div> */}
        <div class="card-body">
          <div
            className="d-flex flex-column "
          // class="other-profiles"
          >


            <Link className="profile_list_text text-left" onClick={handleButtonClick}>
              <FontAwesomeIcon icon={faUserEdit} className=" svg_icon text-dark mr-2" />
              <span>Update Profile</span>
            </Link>
            <Link onClick={handleChangePassword} className="profile_list_text text-left mt-3">
              <FontAwesomeIcon icon={faLock} className=" svg_icon text-dark mr-2" />
              <span> Change Password </span>
            </Link>
            <Link onClick={handleLogout} className=" svg_icon text-danger text-left mt-3">
              <FontAwesomeIcon icon={faSignOutAlt} className="text-danger ml-2 mr-2" />
              <span className="logout_text"> Logout </span>

            </Link>

            {/* <div className="mt-4">
              <p>Current Theme: {theme}</p>
              <ThemeToggleSwitch />
              <button onClick={toggleTheme}>Toggle Theme</button>

            </div> */}



            {/* <button class="btn btn-sm mt-2 btn-danger ml-2" onClick={handleLogout}>
              <i class="fas fa-sign-out-alt"></i> Logout
            </button> */}
          </div>
        </div>
      </div>

    </>
  );
};

export default UserProfileModal;
