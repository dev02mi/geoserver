import React, { useRef, useState, useEffect } from "react";
import { Navbar, Nav, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import "./AuHeader.css";
import {
  faHome,
  faInfo,
  faUser,
  faArrowRight,
  faSearch,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import "./AuHeader.css";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import UserProfileModal from "../../UserProfile/UserProfileModal";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { useDispatch, useSelector } from "react-redux";
import UpdateUserProfile from "../../UpdateUserProfile/UpdateUserProfile";
import { openModal } from "../../StoreContext/features/profile/modalReducer";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import Header from "../../Header/Header";
const AuHeader = ({
  userType,
  userName,
  THEME_OPT,
  userId,
  refreshToken,
  departmentType,
}) => {
  const isOpenprofile = useSelector((state) => state.modal.isModalOpen);
  const [userProfileData, setUserDatauserProfileData] = useState([]);
  const isUpdateProfileVisible = useSelector(
    (state) => state.updateProfile.isUpdateProfileVisible
  );

  const newaccessToken = useSelector((state) => state.auth.accessToken);
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [user, setUser] = useState("");
  const [show, setShow] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState("");

  // for popupModal//
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isApplication, setSelectedApplication] = useState("Home");
  const [isModalOpen, setModalOpen] = useState(false);
  const [authData, setAuthData] = useState([]);
  // const [accessToken, setToken] = useState(null);
  const navigate = useNavigate();
  // const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const [isAllDataStored, setIsAllDataStored] = useState(false);
  const [themeOption, setThemeOption] = useState(null);
  const [isSmallScreen, setSmallScreen] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleProfileClick = () => {
    setModalOpen((prevIsModalOpen) => !prevIsModalOpen);
  };

  const handleMouseEnters = () => {
    setIsHovered(true);
  };

  const handleMouseLeaves = () => {
    setIsHovered(false);
  };
  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShow(true);
  };

  const getUserNameFromsessionStorage = () => {
    const storedUserName = sessionStorage.getItem("userName");
    if (storedUserName) {
      setUser(storedUserName);
    }
  };
  useEffect(() => {
    // Store userType and userName in sessionStorage when they're available as props
    if (userType && userName && THEME_OPT) {
      sessionStorage.setItem("userType", userType);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("themeOption", THEME_OPT);
      //console.log("theme opt:" + THEME_OPT);
      setUser(userName);
      setThemeOption(THEME_OPT);
    } else {
      // If userName is not available as a prop, try to retrieve it from sessionStorage
      getUserNameFromsessionStorage();
    }
    const allDataStored = checkAllDataStored();
    setIsAllDataStored(allDataStored);
  }, [userName, userType, THEME_OPT]);
  //console.log("theme opt:" + THEME_OPT);

  const checkAllDataStored = () => {
    return (
      sessionStorage.getItem("userType") &&
      sessionStorage.getItem("userName") &&
      sessionStorage.getItem("themeOption")
    );
  };

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
    if (newaccessToken) {
      fetchUserGetData();
    }
  }, [newaccessToken]);

  const fetchUserGetData = async () => {
    let url = null;
    if (userType === "SU") {
      url = "http://127.0.0.1:8000/superuser_api/";
    } else if (userType === "AU") {
      url = "http://127.0.0.1:8000/admin_url/";
    } else if (userType === "UU") {
      url = "http://127.0.0.1:8000/authorized_singup/";
    } else {
      url = "http://127.0.0.1:8000/general_signup/";
    }

    try {
      const response = await axios.request({
        url,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newaccessToken}`,
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

        // setUpdateProfileVisible(true);
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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavbarOpen]);
  return (
    <>
      <header className="Au_Header">
        <Header />

        {/* <div className="Au_Image pl-3">
          <img src="GEOPICX_LOGO.png" alt="Site Logo" width="40" height="40" />
          <h1 className=" GeopicsHeading">GeoPicX</h1>
          <h4 className="text-geopicx">
            (Geographic picture Data Extended Analysis ){" "}
          </h4>
          <div>
            <span
         
              className={`LogoOfMicronet ${isHovered || isOpen ? "active" : ""}`}
              onClick={handleLogoClick}
              onMouseEnter={handleMouseEnters}
              onMouseLeave={handleMouseLeaves}
            >
              <img
                src="MSOLU_10K.png"
                alt="Site Logo"
                className="LogoMicronet"
              onMouseEnter={handleMouseHoverOpen}
              onMouseLeave={handleMouseClose}
              onClick={toggleCard}
              />
              {(isHovered || isOpen) && (
                <div className="card-content-au">
                  <p className="PopUpAboveMicronetLogo">
                    Micronet Solutions has been at the forefront of providing
                    geospatial solutions for more than two decades.
                  </p>
                  <div className="row">
                    <div className="col">
                    <button
                      className="LogoPopUpCancelButton" onClick={handleClose}>Close</button>
                  </div>
                    <div className="col">
                      <a
                        href="https://www.micronetsolutions.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button
                          className="LogoPopUpMoreButton"
                          onClick={handleConfirm}
                        >
                          More
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </span>

            <span>
              <div className="lang">
                <select
                  value={selectedLanguage}
                  className="langselect"
                  style={{ cursor: "pointer" }}
                  onChange={handleLanguageChange}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </span>
          </div>
        </div> */}
        <nav className="navbar_wraper" ref={navbarRef}>
          <div className="navbar-container">
            <div className="hamburger" onClick={toggleNavbar}>
              {isNavbarOpen ? (
                <FontAwesomeIcon icon={faTimes} />
              ) : (
                <FontAwesomeIcon icon={faBars} />
              )}
            </div>
            {/* Left side navigation links */}
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
                  //  className={`Au_nav_link ${
                  //   location.pathname === "/" ? "Au_App_Menu" : ""
                  // }`}
                  className={`nav-item d-flex justify-content-cenetr align-items-center ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                >
                  <Link to="/" onClick={toggleNavbar}>
                    <FontAwesomeIcon className="navbaricon" icon={faHome} />
                    &nbsp;Home
                  </Link>
                </li>
                <li
                  className={`nav-item d-flex justify-content-cenetr align-items-center formargin  ${
                    location.pathname === "/AuEditUser" ? "active" : ""
                  }`}
                  //  className={`Au_nav_link ${
                  //   location.pathname === "/AuEditUser"
                  //     ? "Au_App_Menu"
                  //     : ""
                  // }`}
                >
                  <Link to="/AuEditUser" onClick={toggleNavbar}>
                    &nbsp;View & Manage User
                  </Link>
                </li>
                <li
                  className={`nav-item d-flex justify-content-cenetr align-items-center ml-lg-5 ml-md-0 ${
                    location.pathname === "/AuDashboard" ? "active" : ""
                  }`}
                  //  className={`Au_nav_link ${
                  //   location.pathname === "/AuEditUser"
                  //     ? "Au_App_Menu"
                  //     : ""
                  // }`}
                >
                  <Link to="/AuDashboard" onClick={toggleNavbar}>
                    &nbsp;Dashboard
                  </Link>
                </li>

                {/* Dropdown for Applications */}

                {/* Dropdown for Other Applications */}
              </ul>
            </div>

            {/* Right side login button */}
          </div>
          <div className="col-3 d-flex justify-content-end">
            <div className="d-flex align-items-center">
              <span className="User_Profile d-flex generalusername">
                <span className="mr-2">
                  {" "}
                  {userName} ({departmentType == "WCADMIN" ? "WCAU" : "UDAU"}){" "}
                </span>
                <img
                  src="User.png"
                  alt="User"
                  width="21"
                  height="21"
                  className="  d-md-block"
                />
              </span>

              <div>
                <span
                  className="User_Profile"
                  onClick={() => dispatch(openModal())}
                >
                  <span>
                    <FontAwesomeIcon
                      icon={faEllipsisVertical}
                      className="User_PofileIcon mt-2"
                    />
                  </span>
                </span>
              </div>
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

        {/* <div>
          <Navbar
            bg="light"
            expand="md"
            className="Au-nav geopixnav p-0 m-0"
            variant="RED"
          >
            <Navbar.Toggle aria-controls="navbarResponsive Toggle-icon">
              {isSmallScreen && (
                <>
                  <FontAwesomeIcon className="geopicnaviconss" icon={faBars} />
                  <img
                    src="User.png"
                    alt="User"
                    width="30"
                    height="30"
                    className="geopicnaviconsu"
                  />
                </>
              )}
            </Navbar.Toggle>
            <Navbar.Collapse id="navbarResponsive" className="main_nav">
              <div className="row align-items-center ">
                <div className="col-2" style={{ color: "white" }}>
                  <div className="">
                    <Nav className="">
                      <NavLink
                        as={Link}
                        to="/"
                        className={`Au_nav_link ${
                          location.pathname === "/" ? "Au_App_Menu" : ""
                        }`}
                      >
                        <FontAwesomeIcon
                          className="geopicnavicon"
                          icon={faHome}
                        />
                        &nbsp; Home
                      </NavLink>
                    </Nav>
                  </div>
                </div>

                <div className="col-8">
                  <div>
                    <span className=" d-md-flex">
                      <NavLink
                        as={Link}
                        to="/AuEditUser"
                        className={`Au_nav_link ${
                          location.pathname === "/AuEditUser"
                            ? "Au_App_Menu"
                            : ""
                        }`}
                        // onClick={() => handleEditUserClick(userId)}
                      >
                        <span className="">View & Manage User</span>
                      </NavLink>

                      <NavLink
                        as={Link}
                        to="/AuDashboard"
                        className={`Au_nav_link ${
                          location.pathname === "/AuDashboard"
                            ? " Au_App_Menu "
                            : ""
                        } `}
                      >
                        <span className=""> Dashboard </span>
                      </NavLink>
                    </span>
                  </div>
                </div>

                <div className="col-2 d-flex justify-content-end">
                  <div className="d-flex align-items-center">
                    <span className="User_Profile d-flex generalusername">
                      <span className="mr-2">
                        {" "}
                        {userName} (
                        {departmentType == "WCADMIN" ? "WCAU" : "UDAU"}){" "}
                      </span>
                      <img
                        src="User.png"
                        alt="User"
                        width="21"
                        height="21"
                        className=" d-none d-sm-none d-md-block"
                      />
                    </span>

                    <div>
                      <span
                        className="User_Profile"
                        onClick={() => dispatch(openModal())}
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={faEllipsisVertical}
                            className="User_PofileIcon mt-2"
                          />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Navbar.Collapse>
          </Navbar>

          {isOpenprofile && (
            <UserProfileModal
              isOpen={isOpenprofile}
              userName={userName}
              userType={userType}
              userId={userId}
              refreshToken={refreshToken}
            />
          )}
        </div> */}
        {/* <div className="">
                    <span className="User_Profile d-flex generalusername">
                      <span className="mr-2">
                        {" "}
                        {userName} (
                        {departmentType == "WCADMIN" ? "WCAU" : "UDAU"}){" "}
                      </span>
                      <img
                        src="User.png"
                        alt="User"
                        width="21"
                        height="21"
                        className=" d-none d-sm-none d-md-block"
                      />
                    </span>

                    <div>
                      <span
                        className="User_Profile"
                        onClick={() => dispatch(openModal())}
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={faEllipsisVertical}
                            className="User_PofileIcon mt-2"
                          />
                        </span>
                      </span>
                    </div>
                  </div> */}
        {isOpenprofile && (
          <UserProfileModal
            isOpen={isOpenprofile}
            userName={userName}
            userType={userType}
            userId={userId}
            refreshToken={refreshToken}
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

export default AuHeader;
