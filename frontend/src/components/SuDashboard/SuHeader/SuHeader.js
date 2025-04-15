import React, {useRef, useState, useEffect } from "react";
import { Navbar, Nav, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import {
  faHome,
  faInfo,
  faUser,
  faArrowRight,
  faSearch,
  faBars,
  faEdit,
  faChartBar,
  faListAlt,
  faUserPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import "./SuHeader.css";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import UserProfileModal from "../../UserProfile/UserProfileModal";
import axios from "axios";
import { useMediaQuery } from "react-responsive";

import { useSelector, useDispatch } from "react-redux";
import { openModal } from "../../StoreContext/features/profile/modalReducer";
import UpdateUserProfile from "../../UpdateUserProfile/UpdateUserProfile";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import Header from "../../Header/Header";

const SuHeader = ({ userType, userName, refreshToken, userId, THEME_OPT }) => {
  const isOpenprofile = useSelector((state) => state.modal.isModalOpen);
  const accessTokenslice = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [user, setUser] = useState("");
  const [clickedOnSmallScreen, setClickedOnSmallScreen] = useState(false);
  // for popupModal//
  const [isHovered, setIsHovered] = useState(false);
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isSmallScreen, setSmallScreen] = useState(false);
  const [isAllDataStored, setIsAllDataStored] = useState(false);
  const [themeOption, setThemeOption] = useState(null);
  const [userProfileData, setUserDatauserProfileData] = useState([]);
  const isUpdateProfileVisible = useSelector(
    (state) => state.updateProfile.isUpdateProfileVisible
  );

  const navLinks = [
    { title: "Create Admin", path: "/CreateAdmin", icon: faUserPlus },
    { title: "Manage User", path: "/SuEditUser", icon: faEdit },
    { title: "View User", path: "/ViewUser", icon: faListAlt },
    { title: "Dashboard", path: "/SuDashboard", icon: faChartBar },
  ];
  const handleMouseEnters = () => {
    setIsHovered(true);
  };

  const handleMouseLeaves = () => {
    setIsHovered(false);
  };
  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const getUserNameFromsessionStorage = () => {
    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
      setUser(storedUserName);
    }
  };

  useEffect(() => {
    // Store userType and userName in sessionStorage when they're available as props
    if (userType && userName) {
      sessionStorage.setItem("userType", userType);
      sessionStorage.setItem("userName", userName);
      setUser(userName);
    } else {
      // If userName is not available as a prop, try to retrieve it from sessionStorage
      getUserNameFromsessionStorage();
    }
  }, [userName, userType]);

  const handleLogout = async () => {
    sessionStorage.removeItem("userType");
    window.location.href = "/Login";
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handelSearchIcon = (event) => {
    setInputValue(event.target.value);
  };
  useEffect(() => {
    // Store userType and userName in sessionStorage when they're available as props
    if (userType && userName && THEME_OPT) {
      sessionStorage.setItem("userType", userType);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("themeOption", THEME_OPT);
      ////console.log("theme opt:" + THEME_OPT);
      setUser(userName);
      setThemeOption(THEME_OPT);
    } else {
      // If userName is not available as a prop, try to retrieve it from sessionStorage
      getUserNameFromsessionStorage();
    }
    const allDataStored = checkAllDataStored();
    setIsAllDataStored(allDataStored);
  }, [userName, userType, THEME_OPT]);
  ////console.log("theme opt:" + THEME_OPT);

  const checkAllDataStored = () => {
    return (
      sessionStorage.getItem("userType") &&
      sessionStorage.getItem("userName") &&
      sessionStorage.getItem("themeOption")
    );
  };
  const handleLogouts = async () => {
    sessionStorage.removeItem("userType", userType);
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("refresh_token", refreshToken);
    sessionStorage.removeItem("userName", userName);
    sessionStorage.removeItem("THEME_OPT", THEME_OPT);
    sessionStorage.removeItem("isApplication");
    // navigate("/Login");
    window.location.href = "/Login";
  };

  useEffect(() => {
    if (accessTokenslice) {
      fetchUserGetData();
    }
  }, [accessTokenslice]);

  const fetchUserGetData = async () => {
    let url = null;
    if (userType === "SU") {
      url = "http://127.0.0.1:8000/superuser_api/";
    } else if (userType === "AU") {
      url = "http://127.0.0.1:8000/admin_url/";
    }

    try {
      const response = await axios.request({
        url,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessTokenslice}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        let moduledata;
        if (userType === "AU" || userType === "UU") {
          moduledata = response.data.message[0];
        } else if (userType === "SU") {
          moduledata = response.data.message;
        } else {
          moduledata = response.data.message;
        }

        if (moduledata) {
          sessionStorage.setItem("moduledata", moduledata);
          setUserDatauserProfileData(moduledata);
        }
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("API request failed:", error);
    }
  };
  const toggleNavbar = () => {
    setNavbarOpen(!isNavbarOpen);
  };
  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.innerWidth <= 768); // Set the breakpoint for small screens (768px)
    };

    handleResize(); // Run once to check initial size

    window.addEventListener("resize", handleResize); // Add event listener to detect screen size change

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);


  // #############clicking#########ousie Event############//
  const navbarRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        toggleNavbar(false); // Close the navbar if click is outside
      }
    };

    if (isNavbarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavbarOpen]);
  return (
    <>
      <header className="SU_Header">
        <Header />
        <nav className="navbar_wraper" ref={navbarRef}>
          <div className="navbar-container">
            <div className="hamburger" onClick={toggleNavbar}>
              {isNavbarOpen ? (
                <FontAwesomeIcon icon={faTimes} />
              ) : (
                <FontAwesomeIcon icon={faBars} />
              )}
            </div>

            <div
              className={`navbar-links ${isNavbarOpen ? "show" : ""} ${
                isSmallScreen ? "small-screen" : ""
              }`}
              style={{
                display: isNavbarOpen || !isSmallScreen ? "block" : "none",
              }}
            >
              <ul className="nav-list">
                <li
                  className={`nav-item d-flex  align-items-center itemmargin ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                >
                  <Link to="/"  onClick={toggleNavbar}>
                    <FontAwesomeIcon className="navbaricon" icon={faHome} />
                    &nbsp;Home
                  </Link>
                </li>
                {navLinks.map((link, index) => (
                  <li
                    key={index}
                    className={`nav-item d-flex align-items-center ${
                      location.pathname === link.path ? "active" : ""
                    } ${index === 0 ? " formargin" : ""} ${
                      (index === 1, 2 ? " mr-lg-5 mr-md-0" : "mr-sm-0 ")
                    }`}
                  >
                    <Link to={link.path}  onClick={toggleNavbar}>
                      {link.title}{" "}
                      
                      <FontAwesomeIcon
                        className="navIcon mr-1"
                        icon={link.icon}
                       
                      />{" "}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side login button */}
          </div>
          <div className="col-3 d-flex justify-content-end">
            <div className=" d-flex align-items-center">
              <span className="User_Profile d-flex generalusername">
                <span className="mr-2">{user} (SU)</span>
                <img
                  src="User.png"
                  alt="User"
                  width="21"
                  height="21"
                  className=" d-md-block"
                />
              </span>
              <span
                className="User_Profile"
                onClick={() => dispatch(openModal())}
              >
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  className="User_PofileIcon mt-2"
                />
              </span>
            </div>
          </div>
          {/* {isUpdateProfileVisible && (
            <UpdateUserProfile
              isUpdateProfileVisible={isUpdateProfileVisible}
              userName={userName}
              userType={userType}
              userId={userId}
              userProfileData={userProfileData}
              fetchUserGetData={fetchUserGetData}
            />
          )} */}
        </nav>

        {/* <Navbar bg="light" className="nav  w-100 p-0 m-0">
           
            <Navbar.Collapse className="w-100">
              <div className="main_section row">
                <div className=" col-2 left-section">
                  <Nav className="SU_Navtext">
                    <Nav.Link
                      className={`navLink_wrap  ${
                        location.pathname === "/" ? "Su-Active-Link" : ""
                      }`}
                    >
                      <NavLink
                        to="/"
                        className={`Su_Link ${
                          location.pathname === "/" ? " " : ""
                        }`}
                      >
                        <FontAwesomeIcon
                          className="navIcon mr-1"
                          icon={faHome}
                        />
                        <span>Home</span>
                      </NavLink>
                    </Nav.Link>
                  </Nav>
                </div>

                <div className="col-8 center-section">
                  <Nav className="SU_Navtext">
                    {navLinks.map((link, index) => (
                      <Nav.Link
                        key={index}
                        className={`navLink_wrap  ${
                          location.pathname === link.path
                            ? "Su-Active-Link"
                            : ""
                        }`}
                      >
                        <NavLink
                          to={link.path}
                          className={`Su_Link ${
                            location.pathname === link.path ? " " : ""
                          }`}
                        >
                          <FontAwesomeIcon
                            className="navIcon mr-1"
                            icon={link.icon}
                          />{" "}
                          &nbsp;
                          <span>{link.title}</span>
                        </NavLink>
                      </Nav.Link>
                    ))}
                  </Nav>
                </div>

                <div className="col-2 right-section">
                  <div className="User_Profile">
                    <span className="mr-2">{user} (SU)</span>
                    <img
                      src="User.png"
                      alt="User"
                      width="21"
                      height="21"
                      className=""
                    />
                  </div>
                  <span
                    className="User_Profile"
                    onClick={() => dispatch(openModal())}
                  >
                    <FontAwesomeIcon
                      icon={faEllipsisVertical}
                      className="User_PofileIcon "
                    />
                  </span>
                </div>
              </div>
            </Navbar.Collapse>
          </Navbar> */}

        {isOpenprofile && (
          <UserProfileModal
            isOpen={isOpenprofile}
            userName={userName}
            userType={userType}
            userId={userId}
          />
        )}
      </header>
      {isUpdateProfileVisible && (
        <UpdateUserProfile
          isUpdateProfileVisible={isUpdateProfileVisible}
          userName={userName}
          userType={userType}
          userId={userId}
          userProfileData={userProfileData}
          fetchUserGetData={fetchUserGetData}
        />
      )}
    </>
  );
};

export default SuHeader;
