import React, { useState, useEffect, useRef } from "react";
import { Navbar as BootstrapNavbar, Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

import { useMediaQuery } from 'react-responsive';
import {
  faShoppingBag, faChartBar
} from "@fortawesome/free-solid-svg-icons";
import {
  faHome,
  faTasks,
  faUser,
  faCircleChevronLeft,
  faCircleInfo,
  faBars,
  faChartLine,
  faCog,
  faEnvelope,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "react-bootstrap/Dropdown";
import UserProfileModal from "../UserProfile/UserProfileModal";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../StoreContext/features/profile/modalReducer";
import UpdateUserProfile from "../UpdateUserProfile/UpdateUserProfile";
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import dashbordImage from "../../asset/navImage/dashboard_white.png"
import ApplictionImage from "../../asset/navImage/appliction.png"
import { themeImages } from "../Constant";
import Header from "../Header/Header";


const Navbar = ({ userType, userName, refreshToken, userId }) => {
  const navbarRef = useRef(null);
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [inputValue, setInputValue] = useState("");
  // const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  // for popupModal//
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isOpenprofile = useSelector((state) => state.modal.isModalOpen);
  const [userProfileData, setUserDatauserProfileData] = useState([]);
  const isUpdateProfileVisible = useSelector((state) => state.updateProfile.isUpdateProfileVisible);
  const newaccessToken = useSelector((state) => state.auth.accessToken);
  const [themeSelected, setThemeGetSelected] = useState("");

  const [isSmallScreen, setSmallScreen] = useState(false);
  


  const [themeListSelected, setThemeListSelected] = useState(() => {
    const savedTheme = localStorage.getItem('themeListSelected');
    return savedTheme ? savedTheme : "Home";
  });

  const [modulePerimission, setModulePerimission] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const themeList = useSelector((state) => state.auth.theme);







  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleItemClick = (value) => {
    if (
      location.pathname === "/MarsHome" ||
      location.pathname === "/AgricultureHome" ||
      location.pathname === "/WaterHome" ||
      location.pathname === "/MiningHome" ||
      location.pathname === "/Defencence"
    ) {
      // If the path matches, handle it as a 'Home' click
      setThemeListSelected(value);
  
      if (value === 'Home') {
        localStorage.clear();
      }
    } else {
      // Navigate back for other paths
      navigate(-1);
    }
    // setSelectedApplication(value);
    // setThemeListSelected(value);

    // if (value === 'Home') {
    //   localStorage.clear();
    // }
  };

  useEffect(() => {
    localStorage.setItem('themeListSelected', themeListSelected);
    return () => {
      localStorage.removeItem('themeListSelected');
    };
  }, [themeListSelected]);

  const [permission, setPermission] = useState({});
  const [activeModules, setActiveModules] = useState([]);
  const [inactiveModules, setInactiveModules] = useState([]);
  const [activeTheme, setactiveTheme] = useState("")

  useEffect(() => {
    if (!permission) return;

    const active = [];
    const inactive = [];

    Object.keys(permission).forEach((key) => {
      if (permission[key] === true) {
        active.push(key);
      } else if (permission[key] === null) {
        inactive.push(key);
      }
    });

    setActiveModules(active);
    setInactiveModules(inactive);
  }, [permission]);


  useEffect(() => {
    if (newaccessToken) {
      fetchUserGetData()
    }
  }, [newaccessToken])


  const fetchUserGetData = async () => {
    let url = null;
    if (userType === 'UU') {
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
        if (userType === 'UU') {
          moduledata = response.data.message[0];
          setThemeGetSelected(moduledata.Theme_Section);
          setactiveTheme(moduledata.Theme_Section)
          setModulePerimission(moduledata.PERMISSION);
          setPermission(moduledata.PERMISSION)

        } else {
          moduledata = response.data.message[0];
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

  useEffect(() => {
    if (themeListSelected === "MARS") {
      navigate('/MarsHome');
    }
    else if (themeListSelected === "AGRICULTURE") {
      navigate('/AgricultureHome');
    }
    else if (themeListSelected === "MINING") {
      navigate('/Minning');
    }
    else if (themeListSelected === "WATER") {
      navigate('/WaterHome');
    }
    else if (themeListSelected === "DEFENCE") {
      navigate('/Defencence');
    }
  }, [themeListSelected]);



  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Reference for the Applications dropdown

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown && showDropdown) {
      setShowDropdown(false);
      setActiveDropdown(null);
    } else {
      setShowDropdown(true);
      setActiveDropdown(dropdown);
    }
  };

  useEffect(() => {
    setShowDropdown(false);
    setActiveDropdown(null);
  }, [showDropdown, activeDropdown]);


  const userAppliction = (theme) => {
    if (userType === "GU") {
      //  return alert("vfxvxvj")
      console.log("SDkfsdjkfsjdk.")
    } else {
      setThemeListSelected(theme)
    }
  }

  const userActiveHomePage = (activeTheme) => {

    if (activeTheme === "MARS") {
      localStorage.setItem('themeListSelected', "MarsHome");
      navigate("/MarsHome");
    } else if (activeTheme === "AGRICULTURE") {
      localStorage.setItem('themeListSelected', "AgricultureHome");
      navigate("/AgricultureHome");
    } else if (activeTheme === "WATER") {
      localStorage.setItem('themeListSelected', "WaterHome");
      navigate("/WaterHome");
    } else if (activeTheme === "MINING") {
      localStorage.setItem('themeListSelected', "MiningHome");
      navigate("/MiningHome");
    } else if (activeTheme === "DEFENCE") {
      localStorage.setItem('themeListSelected', "Defencence");
      navigate("/Defencence");
    }
  };


  const getWelcomeSpan = () => {
    if (userType === "UU") {
      return <span className="d-flex justify-content-center align-items-center">
        <span className=" User_Profile text-white  mr-2">  {userName} (UU)</span>
        <img src="User.png" alt="User" width="21" height="21" className=" d-none d-sm-none d-md-block" />
      </span>

    } else {

      return <span className="d-flex justify-content-center align-items-center">
        <span className=" User_Profile text-white mr-2">  {userName} (GU)</span>
        <img src="User.png" alt="User" width="21" height="21" className=" d-none d-sm-none d-md-block" />
      </span>

    }
  };
  const iconMapping = [
    faTasks,
    faCircleInfo,   // Icon for index 0
    faChartLine,   // Icon for index 1
    faCog     // Icon for index 2
    // Add more icons as needed
  ];

  const [isNavbarOpen, setNavbarOpen] = useState(false);


  const toggleNavbar = () => {
   
    setNavbarOpen(!isNavbarOpen);
  };
  useEffect(() => {
    // Close the navbar when route changes
    setNavbarOpen(false);
  }, [location.pathname]);
  // useEffect(() => {
  //   if (navbarRef.current) {
  //     if (isNavbarOpen) {
  //       navbarRef.current.style.height = `${navbarRef.current.scrollHeight}px`; // Set height to its full height
  //     } else {
  //       navbarRef.current.style.height = '0'; // Collapse height
  //     }
  //   }
  // }, [isNavbarOpen]);
  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.innerWidth <= 768); // Set the breakpoint for small screens (768px)
    };

    handleResize(); // Run once to check initial size

    window.addEventListener('resize', handleResize); // Add event listener to detect screen size change

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on unmount
    };
  }, []);

  const logoMapping = {
    MarsHome: "/MARS_LOGO.png", 
    ARCHIVAL: "/MARS_LOGO.png",
    RETRIVAL: "/MARS_LOGO.png",
    SEARCH: "/MARS_LOGO.png",
    NDVI: "/agrilogonew.png",
    STACK:"/agrilogonew.png",
    CLASSIFICATION:"/agrilogonew.png",
    AgricultureHome: "/agrilogonew.png", // Agriculture Logo
    WaterHome: "/path/to/water-logo.png", // Water Logo
    MiningHome: "/path/to/mining-logo.png", // Mining Logo
    Defencence: "/path/to/defense-logo.png",
     // Defence Logo
  };
  
  // Get the current theme based on location.pathname
  const currentTheme = location.pathname.split("/").pop();
  console.log('Current Theme:', currentTheme); 
  const [isNavbarOpenApp, setIsNavbarOpenApp] = useState(false);

  // Toggle the state of the Navbar
  const toggleNavbarApp = () => {
    setIsNavbarOpenApp(!isNavbarOpenApp);
  };

  // ##################################################clicking#########ousie Event############//
 
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
      <Header />
      <header className="header">
        {/* <div className="image pl-3">
          <img src="GEOPICX_LOGO.png" alt="Site Logo" width="40" height="40" />
          <h1 className="GeopicsHeading">GeoPicX</h1>
          <h4 className="text-geopicx">
            Geographic Picture (Data) Extended Analysis
          </h4>
          <div className="d-flex align-items-end justify-contend-end">
            <span
              // className="LogoOfMicronet"
              className={`LogoOfMicronet ${isHovered || isOpen ? "active" : ""}`}
              // onClick={handleLogoClick}
              onMouseEnter={handleMouseEnters}
              onMouseLeave={handleMouseLeaves}
            >
              <img
                src="MSOLU_10K.png"
                alt="Site Logo"
                className="LogoMicronet W-25 H-25"
              />
              {(isHovered || isOpen) && (
                <div className="card-content">
                  <p className="PopUpAboveMicronetLogo">
                    Micronet Solutions has been at the forefront of providing
                    geospatial solutions for more than two decades.
                  </p>
                  <div className="row">

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

          </div>
        </div> */}

        <div>
       
          
          {themeListSelected === "Home" ? (
            <nav className="navbar_wraper"ref={navbarRef}>
             
              <div className="navbar-container">
              <div className="hamburger" onClick={toggleNavbar}>
              {isNavbarOpen ? (
            <FontAwesomeIcon icon={faTimes} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
     
      </div>
                {/* Left side navigation links */}
                <div className={`navbar-links ${isNavbarOpen ? 'show' : ''} ${isSmallScreen ? 'small-screen' : ''}`}
                           style={{ display: isNavbarOpen || !isSmallScreen ? 'block' : 'none' }} // Only hide on small screens
 >
                  <ul className="nav-list">
                    <li className={`nav-item d-flex justify-content-cenetr align-items-center ${location.pathname === '/' ? 'active' : ''}`}>
                      <Link to="/" onClick={toggleNavbar} >
                        <FontAwesomeIcon className="navbaricon"  icon={faHome} />
                        &nbsp;Home
                      </Link>
                    </li>
                    <li className={`nav-item  d-flex justify-content-cenetr align-items-center ${location.pathname === '/About' ? 'active' : ''}`}>
                      <Link to="/About" onClick={toggleNavbar}>
                        <FontAwesomeIcon className="navbaricon" icon={faCircleInfo} />
                        &nbsp;About Us
                      </Link>
                    </li>
                    <li className={`nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/Products' ? 'active' : ''}`}>
                      <Link to="/Products" onClick={toggleNavbar}>
                        <FontAwesomeIcon className="navbaricon" icon={faShoppingBag} />
                        &nbsp;Products
                      </Link>
                    </li>
                    <li className={`nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/Service' ? 'active' : ''}`}>
                      <Link to="/Service" onClick={toggleNavbar}>
                        <FontAwesomeIcon className="navbaricon" icon={faTasks} />
                        &nbsp;Services
                      </Link>
                    </li>
                    <li className={`nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/ContactForm' ? 'active' : ''}`}>
                      <Link to="/ContactForm" onClick={toggleNavbar}>
                        <FontAwesomeIcon className="navbaricon" icon={faUser} />
                        &nbsp;Contact Us
                      </Link>
                    </li>

                    

                    <li className={`nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/Dashboard' ? 'active' : ''}`}>
                      <Link to="/Dashboard" onClick={toggleNavbar}>

                        <img
                          src={dashbordImage}
                          alt="dashbord"
                          className="img-fluid"
                          width="18px"
                          height="18px"
                        />

                        &nbsp;Dashboard
                      </Link>
                    </li>


                    <li class="verticle_line_home">
                    </li>

                    {/* Dropdown for Applications */}
                    <li className={`dropdown nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/Application' ? 'active' : ''}`}
                      onMouseEnter={() => toggleDropdown('applications')}
                      onMouseLeave={() => toggleDropdown(null)}>

                      <Link to="/Application" className="nav-item" >

                        <img
                          src={ApplictionImage}
                          alt="dashbord"
                          className="img-fluid"
                          width="18px"
                          height="18px"
                        />
                        &nbsp;Applications

                      </Link>

                      <div ref={dropdownRef}>
                        <ul className={`dropdown_menu ${activeDropdown === 'applications' && showDropdown ? 'show' : ''}`}>

                          {themeList.length === 0 ? (
                            <div className="Notification_BG">
                              <span className="notification_text">Please login to view the application</span>
                            </div>
                          ) : (
                            <div className="theme_dropdown">
                              {[...themeList]
                                .sort((a, b) => a.localeCompare(b))
                                .map((theme, index) => (
                                  <React.Fragment key={index}>
                                    <div className="grid_container">
                                      <span
                                        className={`grid-item ${userType === "GU" || (themeSelected && theme !== themeSelected) ? "disabled-li" : ""}`}
                                        onClick={() => userAppliction(theme)}
                                      >
                                        {/* Theme image */}
                                        <img src={themeImages[theme]} alt={`${theme}-logo`} className="img-fluid" />
                                      </span>

                                      {/* Vertical line for specific positions within each row */}

                                      {((index + 1) % 3 !== 0) && themeImages[theme] && (<span className="vertical_line_Img"></span>)}
                                    </div>
                                  </React.Fragment>
                                ))}
                            </div>

                          )}


                        </ul>
                      </div>

                    </li>

                    {/* Dropdown for Other Applications */}
                    <li className="nav-item d-flex justify-content-cenetr align-items-center dropdown"
                      onMouseEnter={() => toggleDropdown('otherApps')}
                      onMouseLeave={() => toggleDropdown(null)}>
                      <img
                        src={ApplictionImage}
                        alt="dashbord"
                        className="img-fluid"
                        width="18px"
                        height="18px"
                      />
                      <span className="nav-item">Other Applications</span>
                      <ul className={`dropdown_menu ${activeDropdown === 'otherApps' ? 'show' : ''}`}>
                        <div className="grid-container">

                          <li className="grid_item_other">
                            <Link
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open("http://192.168.1.154:8056/", "_blank", "noopener noreferrer");
                              }}
                              className="itmesofHEaderDropdown"
                            >
                              <div className="row">
                                <img

                                  src={themeImages.GOLDENEYE}
                                  className=" img-fluid col "
                                />
                              </div>
                              {/* <span className="vertical_line_Img"></span> */}
                            </Link>
                          </li>

                          <li className="grid_item_other">
                            <Link
                              to="/MyLayoutComponent"
                              className="itmesofHEaderDropdown"
                            >
                              <div className="row dragg-opt-nav">
                              <img
                                  src="/logo.png"
                                  className="grid-item-icon"
                                  width={"22px"}
                                  height={"22px"}
                                />
                                {/* <img src={themeImages.GOLDENEYE} className=" img-fluid col "/> */}
                                Dragging Layout
                              </div>
                              {/* <span className="vertical_line_Img"></span> */}
                            </Link>
                          </li>
                          
                           {/* <li className="grid_item_other">
                            <Link to="/Transco">
                              <div className="row">
                                <img
                                  src="/logo.png"
                                  className="grid-item-icon"
                                  width={"22px"}
                                  height={"22px"}
                                />
                                <span className="itmesofHEaderDropdown">
                                  Dragging Layout
                                  </span>
                              </div>
                            </Link>
                          </li> */}
                          {/* <li className="grid_item_other">
                            <Link to="#">
                              <div className="row pl-3">
                                <img
                                  src="/logo.png"
                                  className="grid-item-icon"
                                  width={"22px"}
                                  height={"22px"}
                                />
                                <span className="itmesofHEaderDropdown">MICRONET</span>
                              </div>
                            </Link>
                          </li>  */}
                        </div>

                      </ul>
                    </li>

                    <li className={`nav-item d-flex justify-content-cenetr align-items-center  ${location.pathname === '/Polygone' ? 'active' : ''}`}>
                      <Link to="/Polygone" onClick={toggleNavbar}>
                        <FontAwesomeIcon className="navbaricon" icon={faUser} />
                        &nbsp;Polygone
                      </Link>
                    </li>


                  </ul>
                </div>

                {/* Right side login button */}
                <div className="d-flex justify-content-end">
                  {/* <div className="d-none d-sm-none d-md-block ml-lg-5 ml-xl-5"> */}

                  {userType === "GU" ? (
                    getWelcomeSpan()
                  ) : userType === "UU" &&
                  getWelcomeSpan()
                  }
                  {/* </div> */}
              

                  <div className="d-sm-flex justify-content-sm-between align-items-sm-center  d-md-block">
                    {/* Logged IN & OUT */}
                    {userType === "GU" ||
                      userType === "UU" ? (
                      <>
                        <span
                          className="User_Profile"
                          onClick={() => dispatch(openModal())}
                        >
                          <span>
                            <FontAwesomeIcon icon={faEllipsisVertical} className="User_PofileIcon mt-2" />
                          </span>

                        </span>

                      </>
                    ) : (
                      <div className="navbar-user">
                        <Link to="/Login">
                          <button className="btn btn-danger">
                            <FontAwesomeIcon  className="navbaricon" icon={faUser} />
                            &nbsp;LOGIN
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </nav>
          )
            : themeListSelected && (
              <>
                <nav className="navbar_wraper"ref={navbarRef}>
             
             <div className="navbar-container">
             <div className="hamburger" onClick={toggleNavbar}>
             {isNavbarOpen ? (
           <FontAwesomeIcon icon={faTimes} />
         ) : (
           <FontAwesomeIcon icon={faBars} />
         )}
    
     </div>
               {/* Left side navigation links */}
               <div className={`navbar-links ${isNavbarOpen ? 'show' : ''} ${isSmallScreen ? 'small-screen' : ''}`}
                          style={{ display: isNavbarOpen || !isSmallScreen ? 'block' : 'none' }} // Only hide on small screens
>
                 <ul className="nav-list">
                 <li className={`nav-item d-flex justify-content-cenetr align-items-center ${location.pathname === '/' ? 'active' : ''}`}>
                     <Link to="/"   onClick={() => handleItemClick("Home")} >
                       <FontAwesomeIcon 
                       className="BackIcon"
                       icon={faCircleChevronLeft}
                       />
                  
                     </Link>
                     
                   </li>
                  
                   <span
  onClick={() => userActiveHomePage(activeTheme)}
  as={Link}
  className={`nav_link_home ApplicationHome ${
    location.pathname === "/MarsHome" ||
    location.pathname === "/AgricultureHome" ||
    location.pathname === "/WaterHome" ||
    location.pathname === "/MiningHome" ||
    location.pathname === "/Defencence"
      ? "active_nav_link_home"
      : ""
  }`}
  // style={{ margin: "0px 114px 0px 10px" , paddingLeft:"4px",width: "fit-content"}}
  
>
{logoMapping[currentTheme] && (
          <img
            src={logoMapping[currentTheme]}
            alt={`${currentTheme} Logo`} // Dynamic alt text for accessibility
            className="nav-logo  "
            width="30px"
            height="30px"
           
            style={{ marginRight: "5px" }} 
          />
        )}
  {/* Conditional rendering for the text based on the current pathname */}
  {location.pathname === "/MarsHome" && "Mars Home"}
  {location.pathname === "/AgricultureHome" && "Agriculture Home"}
  {location.pathname === "/WaterHome" && "Water Home"}
  {location.pathname === "/MiningHome" && "Mining Home"}
  {location.pathname === "/Defencence" && "Defence Home"}

  {/* Fallback if none of the above conditions match */}
  {!(
    location.pathname === "/MarsHome" ||
    location.pathname === "/AgricultureHome" ||
    location.pathname === "/WaterHome" ||
    location.pathname === "/MiningHome" ||
    location.pathname === "/Defencence"
  ) &&  `${activeTheme} Home`}
</span>

                 
{
                          activeModules?.map((item, index) => {
                            return (
                              <NavLink
                              as={Link}
                                key={index}
                                to={`/${item}`}
                                className={`nav_link_home ${location.pathname === `/${item}` ? "active_nav_link_home" : ""}`}
                                style={{width:"fit-content"}}

                              >
                                <FontAwesomeIcon
                                  className="marsnavicon"
                                  icon={iconMapping[index] ? iconMapping[index] : faChartLine}
                                  // icon={faHome}
                                />
                                &nbsp; {item}
                              </NavLink>
                            )
                          })
                        }
                 
                 </ul>
               </div>

               {/* Right side login button */}
               <div className="d-flex justify-content-end">
                 {/* <div className="d-none d-sm-none d-md-block ml-lg-5 ml-xl-5"> */}

                 {userType === "GU" ? (
                   getWelcomeSpan()
                 ) : userType === "UU" &&
                 getWelcomeSpan()
                 }
                 {/* </div> */}
             

                 <div className="d-sm-flex justify-content-sm-between align-items-sm-center  d-md-block">
                   {/* Logged IN & OUT */}
                   {userType === "GU" ||
                     userType === "UU" ? (
                     <>
                       <span
                         className="User_Profile"
                         onClick={() => dispatch(openModal())}
                       >
                         <span>
                           <FontAwesomeIcon icon={faEllipsisVertical} className="User_PofileIcon mt-2" />
                         </span>

                       </span>

                     </>
                   ) : (
                     <div className="navbar-user">
                       <Link to="/Login">
                         <button className="btn btn-danger">
                           <FontAwesomeIcon  className="navbaricon" icon={faUser} />
                           &nbsp;LOGIN
                         </button>
                       </Link>
                     </div>
                   )}
                 </div>

               </div>
             </div>
           </nav>
             
              </>
            )

          }
          <div className="Profile-Hr-Model mt-0">
            {isOpenprofile && (
              <UserProfileModal
                isOpen={isOpenprofile}
                userName={userName}
                userType={userType}
                userId={userId}
              />
            )}
          </div>
        </div>
        
      </header>

      {isUpdateProfileVisible && (
        <UpdateUserProfile
          isUpdateProfileVisible={isUpdateProfileVisible}
          userName={userName}
          userType={userType}
          userId={userId}
          refreshToken={refreshToken}
          userProfileData={userProfileData}
          fetchUserGetData={fetchUserGetData}

        />
      )}
    </>
  );
};

export default Navbar;

