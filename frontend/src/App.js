import React, { useState, useEffect, useRef } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
// import { MapProvider } from "../context/MapContext";
import { useLocation } from 'react-router-dom';
import Login from "./components/Login/Login";
import Dashboard from "./components/Dasboard/Dashboard";
import Navbar from "./components/Navbar/Navbar.js";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Authorized from "./components/RegistrationForm/Authorized";
import ContactForm from "./components/ContactForm/ContactForm";
import Service from "./components/Services/Service";
import Products from "./components/Products/Products";
import Application from "./components/Application/Application";
import CopyRightFooter from "./components/CopyRightFooter/CopyRightFooter";
import Onclicks from "./components/Onclicks/Onclicks";
import CarauselForHome from "./components/CarouselForHome/CarauselForHome";
import AutheriseUser from "./components/AutheriseUser/AutheriseUser";
import General from "./components/RegistrationForm/General";
import Testimonial from "./components/Testimonial/Testimonial";
import ResponseDisplay from "./components/Search/ResponseDisplay";
import ForgotPassword from "./components/Forgot/ForgotPassword.js";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import GenerateOTP from "./components/Forgot/GenerateOTP";
import UpdatePassword from "./components/Forgot/UpdatePassword";
import ProductInfo from "./components/Search/Results/ProductInfo";
import MapTools from "./components/Search/MapTools/MapTools";
import Loading from "./components/LoadingComponent/Loading";
import Vegitation from "./components/AgricultureHome/Vegitation";
import MaxLengthErrorMessage from "./components/MaxLengthErrorMessage/MaxLengthErrorMessage";
import Stacking from "./components/Stacking/Stacking";
import PrivacyPolicy from "./components/Policies/PrivacyPolicy.js";
import Disclaimer from "./components/Policies/Disclaimer.js";
import Termsacondition from "./components/Policies/Termsacondition.js";
// import SearchNew from "./components/R&D/SearchNew.js"
// import MapsComponent from "./components/AgricultureHome/MapsComponent";
// Transco
import Transco from "./components/Transco/Transco";

import "./App.css";
import { MapProvider } from './components/UseContext/MapContext.js'
// mars

import MarsHome from "./components/MarsHome/MarsHome";

import Archival from "./components/Archival/Archival";
import ArchivalComponent from "./components/Archival/ArchivalComponent.js"
import Retrival from "./components/Retrival/Retrival";
import Search from "./components/Search/Search";
// agriculture
import AgricultureHome from "./components/AgricultureHome/AgricultureHome";
import Ndvi from "./components/Ndvi/Ndvi";
import Stack from "./components/Stack/Stack";
import Classification from "./components/Classification/Classification";
// water management
import WaterHome from "./components/WaterHome/WaterHome";
import Flood from "./components/Flood/Flood";
import Drough from "./components/Drough/Drought";
import Ndwi from "./components/Ndwi/Ndwi";
import Minning from "./components/Minning/Minning";
import Defencence from "./components/Defencence/Defence";
// Defence
import Space from "./components/Defencence/Space";
import Military from "./components/Defencence/Military";
import Planet from "./components/Defencence/Planet";
// Minning
import Illegal from "./components/Minning/Illegal/Illegal";
import SiteMonitor from "./components/Minning/SiteMonitor/SiteMonitor";
import Stock from "./components/Minning/Stock";

// SuperUser
import SuHeader from "./components/SuDashboard/SuHeader/SuHeader";
import CreateAdmin from "./components/SuDashboard/CreateAdmin/CreateAdmin";
import SuEditUser from "./components/SuDashboard/EditUser/SuEditUser";
import AuHeader from "./components/AuDashboard/AuHeader/AuHeader";
import AuEditUser from "./components/AuDashboard/AuEditUser/AuEditUser";
import AuDashboard from "./components/AuDashboard/Dashboard/AuDashboard";
import SuDashboard from "./components/SuDashboard/Dashboard/SuDashboard";
import ViewUser from "./components/SuDashboard/ViewUser/ViewUser";

// import Products from './components/Prodvdgrdfducts/Products';
// import MapComponent from "./components/AgricultureHome/MapsComponent";
import Agriproject from "./components/AgricultureHome/CreateProject/Agriproject/Agriproject";
import CreateAgriculture from "./components/CreateAgriculture/CreateAgriculture";
import CreateProject from "./components/AgricultureHome/CreateProject/CreateProject";
import Sidebar from "./components/AgricultureHome/CreateProject/Sidebar";

import NdviComponent from "./components/Agri_Applications/NDVI/NdviComponent.js";
import CreateSuperUser from "./components/SuDashboard/createSuperUser/CreateSuperUser.js";
import PageNotFound from './components/404/PageNotFound.js';


import { fetchData } from "./components/StoreContext/apirefresh/authSlice.js";
import { useDispatch, useSelector } from 'react-redux';
import FormComponent from "./ReuseCompomenent/FormComponent.js";
// import FourInputFields from "./ReuseCompomenent/FormComponent.js";
import { setTheme } from "./components/StoreContext/apirefresh/authSlice.js";
import ProtectedRoute from "./ProtectedRoute.js";
// import Dummy from "./components/dummyfolder/Dummy.js";
import ScrollToTopButton from "./components/ScrolltotopComponent/ScrolltotopComponent.js";
import BlockedAdmin from "../../frontend/src/components/BlockedUser/BlockedAdmin.js";
import Loader from "./components/Preloader/Loader.js";
import AdminBlockPopup from "./components/SuDashboard/AdminSratus/AdminBlock.jsx";
// import OtherApp from "./components/OtherApp/OtherApp.js"

import MyLayoutComponent from "./components/DraggingBox/MyLayoutComponent.js";
import PolygoneSelection from "./PolygoneSelection/polygoneSelection.jsx";


// Function to check if the string contains HTML
const isHtml = (str) => /<[^>]+>/g.test(str);


function App() {
  const [authorized, setAuthorized] = useState(true);

  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem("userName") || null;
  });
  const [userType, setUserType] = useState(() => {
    return sessionStorage.getItem("userType") || null;
  });
  const [auDepartmentType, setDepartmentType] = useState(() => {
    return sessionStorage.getItem("departmentType") || null;
  });
  const [refreshToken, setrefreshToken] = useState(() => {
    return sessionStorage.getItem("refreshToken") || null;
  });
  const [userId, setUserID] = useState(() => {
    return sessionStorage.getItem("userId") || null;
  });

  const [suToken, setSuToken] = useState("");
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Initially set loading to true

  const handleLogin = (userType, userName, refreshToken, userId, departmentType) => {
    setUserType(userType);
    setUserName(userName);
    setrefreshToken(refreshToken);
    setUserID(userId);
    setDepartmentType(departmentType);


    sessionStorage.setItem("userType", userType);
    sessionStorage.setItem("userName", userName);
    // sessionStorage.setItem("refresh_token", refreshToken);
    sessionStorage.setItem("userId", userId);
    sessionStorage.setItem("departmentType", departmentType);
  };

  useEffect(() => {
    const storedUserType = sessionStorage.getItem("userType");
    const storedUserName = sessionStorage.getItem("userName");
    const storedRefreshToken = sessionStorage.getItem("refresh_token");
    const storedUserId = sessionStorage.getItem("userId");
    const auDepartment = sessionStorage.getItem("departmentType");

    if (storedUserType) {
      setUserType(storedUserType);
      setUserName(storedUserName);
      setrefreshToken(storedRefreshToken);
      setUserID(storedUserId);
      setDepartmentType(auDepartment);
    }
  }, []);

  // console.log("WOOOWOWWOWOWOWOWOWO....", refreshToken);

  const dispatch = useDispatch();

  const refreshTokenx = useSelector((state) => state.auth.refreshToken);
  const AdminStatus = useSelector((state) => state.auth.AdminStatus);
  // const { refreshTokenx, AdminStatus } = useSelector((state) => state.auth);



  const intervalRef = useRef(null);
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // If refreshTokenx is not available, do nothing
    if (!refreshTokenx) {
      return;
    }

    // Function to fetch data and set interval
    const fetchDataAndSetInterval = () => {
      // Fetch data immediately
      dispatch(fetchData());

      intervalRef.current = setInterval(() => {
        dispatch(fetchData());
      }, 180000); // 180000 ms = 3 minutes
    };


    fetchDataAndSetInterval();

    // Cleanup function to clear the interval
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [dispatch, refreshTokenx, AdminStatus]);


  useEffect(() => {
    // Extract the token from the URL parameters
    let token = new URLSearchParams(location.search).get('token');
    if (token) {
      // Remove any '$' symbol from the token
      token = token.replace('$', '');
      setSuToken(token);
    }
  }, [location]);


  // theme value 
  const fetchThemeData = async () => {
    try {
      let url;
      url = 'http://127.0.0.1:8000/themes_value/';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      dispatch(setTheme(data));
      return data;
    } catch (error) {
      console.error('Error fetching data:', error.message);

    }
  };

  useEffect(() => {
    if (userType) {
      fetchThemeData()
    }
  }, [userType]);



  useEffect(() => {
    // Function to simulate async operation
    const simulateAsyncOperation = async () => {
      try {
        if (suToken) {
          // Simulate token validation
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating a delay
        }
        // Operation completed
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        //setLoading(false); // Ensure loading state is turned off even if there's an error
      }
    };

    simulateAsyncOperation();
  }, [suToken]);


  return (
    <>
      {loading ? (
        <Loader />
      ) :
        suToken ? (
          <CreateSuperUser
            userType={userType}
            userName={userName}
            refreshToken={refreshToken}
          />
        ) :

          (
            <div className="App">

              {/* {htmlContent && (
                  <BlockedAdmin htmlContent={htmlContent} /> // Render BlockedAdmin with HTML
                )} */}

              {/* <Header={userType} userName={userName}  setAuthorized={setAuthorized} authorized={authorized} /> */}
              {userType === "SU" ? (
                <SuHeader userType={userType} userName={userName} userId={userId} />
              ) :
                userType === "AU" ? (
                  <AuHeader
                    userType={userType}
                    userName={userName}
                    refreshToken={refreshToken}
                    userId={userId}
                    departmentType={auDepartmentType}
                  />
                ) : (
                  <Navbar
                    userType={userType}
                    userName={userName}
                    refreshToken={refreshToken}
                    userId={userId}
                  />
                )}
              <div className="MainContentOfApp" id="MainContentOfAppId">

                <Routes basename="/geopicx">

                  <Route path="/" element={<Home />} />
                  <Route
                    path="login"
                    element={
                      userType ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
                    } />
                  <Route
                    path="/Dash"
                    element={
                      userType ? <Home userType={userType} /> : <Navigate to="/" />
                    }
                  />

                  <Route path="/GenerateOTP" element={<GenerateOTP />} />

                  {/* <Route path="/Authorized" element={<Authorized/>}/> */}
                  {/* <Route path="/Authorized" element={<Authorized authorized={true} />} /> */}
                  <Route
                    path="/Signup"
                    element={
                      <Authorized authorized={authorized} setAuthorized={false} />
                    }
                  />

                  <Route path="/About" element={<About />} />
                  <Route path="/ContactForm" element={<ContactForm />} />
                  <Route path="/Service" element={<Service />} />
                  <Route path="/Products" element={<Products />} />
                  <Route path="/Application" element={<Application />} />
                  <Route path="/CopyRightFooter" element={<CopyRightFooter />} />
                  <Route path="/Onclicks" element={<Onclicks />} />
                  <Route path="/CarauselForHome" element={<CarauselForHome />} />
                  <Route path="/Testimonial" element={<Testimonial />} />
                  <Route path="/ResponseDisplay" element={<ResponseDisplay />} />
                  <Route path="/Transco" element={<Transco />} />
                  <Route path="/Loading" element={<Loading />} />
                  <Route path="/ForgotPassword" element={<ForgotPassword />} />
                  <Route path="/ChangePassword" element={<ChangePassword />} />
                  <Route path="/UpdatePassword" element={<UpdatePassword />} />
                  <Route path="/MaxLengthErrorMessage" element={<MaxLengthErrorMessage />} />
                  {/* <Route path="/MapsComponent" element={<MapsComponent />} /> */}

                  <Route path="/ProductInfo" element={<ProductInfo />} />
                  <Route path="/MapTools" element={<MapTools />} />

                  <Route
                    path="/Dashboard"
                    // element={<ProtectedRoute element={<Dashboard/>}  allowedUserTypes={['UU']}/>}
                    element={<Dashboard userType={userType} />}
                  />

                  {/* Application Routes */}

                  <Route path="/MarsHome"
                    // element={<ProtectedRoute element={<MarsHome />} allowedUserTypes={['UU']} />}
                    element={<MarsHome />}
                  />
                  <Route path="/Archival"
                    element={<Archival />}
                  // element={<ProtectedRoute element={<Archival />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/ArchivalComponent"
                    //  element={<ProtectedRoute element={<ArchivalComponent />}  allowedUserTypes={['UU']}/>}
                    element={<ArchivalComponent />}

                  />
                  <Route path="/Retrival"
                    element={<ProtectedRoute element={<Retrival />} allowedUserTypes={['UU']} />}
                  // element={<Retrival />} 
                  />
                  <Route path="/Search"
                    // element={<ProtectedRoute element={<Search />} allowedUserTypes={['UU']} />}
                    element={<Search />}
                  />

                  {/* Agriculture */}
                  <Route path="/AgricultureHome"
                    element={<ProtectedRoute element={<AgricultureHome />} allowedUserTypes={['UU']} />}
                  // element={<AgricultureHome />}
                  />
                  <Route path="/Ndvi"
                    // element={<Ndvi />}
                    element={<ProtectedRoute element={<Ndvi />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Stack"
                    // element={<Stack />} 
                    element={<ProtectedRoute element={<Stack />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Classification" element={<Classification />} />

                  {/* Water */}
                  <Route path="/WaterHome"
                    // element={<WaterHome />} 
                    element={<ProtectedRoute element={<WaterHome />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Defencence"
                    element={<ProtectedRoute element={<Defencence />} allowedUserTypes={['UU']} />}
                  // element={<Defencence />} 
                  />
                  <Route path="/Minning"
                    element={<ProtectedRoute element={<Minning />} allowedUserTypes={['UU']} />}
                  // element={<Minning />} 
                  />
                  <Route path="/Flood"
                    // element={<Flood />} 
                    element={<ProtectedRoute element={<Flood />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Drough"
                    // element={<Drough />} 
                    element={<ProtectedRoute element={<Drough />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Ndwi"
                    // element={<Ndwi />} 
                    element={<ProtectedRoute element={<Ndwi />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/AutheriseUser" element={<AutheriseUser />} />
                  <Route path="/General" element={<General />} />
                  {/* Defence */}

                  <Route path="/Military"
                    // element={<Military />}
                    element={<ProtectedRoute element={<Military />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Space"
                    element={<Space />}
                  />
                  <Route path="/Planet"
                    //  element={<Planet />} 
                    element={<ProtectedRoute element={<Planet />} allowedUserTypes={['UU']} />}
                  />

                  {/* Minning */}
                  <Route path="/Illegal"
                    //  element={<Illegal />} 
                    element={<ProtectedRoute element={<Illegal />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/SiteMonitor"
                    // element={<SiteMonitor />} 
                    element={<ProtectedRoute element={<SiteMonitor />} allowedUserTypes={['UU']} />}
                  />
                  <Route path="/Stock"
                    // element={<Stock />} 
                    element={<ProtectedRoute element={<Stock />} allowedUserTypes={['UU']} />}
                  />

                  {/* SuperUser Dashboard */}
                  <Route
                    path="/CreateAdmin"
                    // element={
                    //   <CreateAdmin
                    //     userType={userType}
                    //     userName={userName}
                    //     refreshToken={refreshToken}
                    //   />
                    // }
                    element={<ProtectedRoute element={<CreateAdmin
                      userType={userType}
                      userName={userName}
                      refreshToken={refreshToken}

                    />} allowedUserTypes={['SU']} />}
                  />


                  <Route
                    path="/SuEditUser"
                    // element={
                    //   <SuEditUser
                    //     userType={userType}
                    //     userName={userName}
                    //     refreshToken={refreshToken}

                    //   />
                    // }
                    element={<ProtectedRoute element={<SuEditUser
                      userType={userType}
                      userName={userName}
                      refreshToken={refreshToken}

                    />} allowedUserTypes={['SU']} />}
                  />
                  <Route path="/SuDashboard"
                    // element={<SuDashboard />} 
                    element={<ProtectedRoute element={<SuDashboard />} allowedUserTypes={['SU']} />}
                  />
                  <Route path="/ViewUser"
                    // element={<ViewUser />}
                    element={<ProtectedRoute element={<ViewUser />} allowedUserTypes={['SU']} />}
                  />
                  <Route path="/Vegitation" element={<Vegitation />} />
                  {/* AdminUser Dashboard */}
                  <Route
                    path="/AuEditUser"
                    // element={
                    //   <AuEditUser
                    //     userType={userType}
                    //     userName={userName}
                    //     refreshToken={refreshToken}
                    //     userId={userId}
                    //   />
                    // }
                    element={<ProtectedRoute element={<AuEditUser
                      userType={userType}
                      userName={userName}
                      refreshToken={refreshToken}

                    />} allowedUserTypes={['AU']} />}
                  />
                  <Route path="/AuDashboard"
                    //  element={<AuDashboard />} 
                    element={<ProtectedRoute element={<AuDashboard />} allowedUserTypes={['AU']} />}
                  />
                  <Route path="/CreateAgriculture" element={<CreateAgriculture />} />
                  <Route path="/CreateProject" element={<CreateProject />} />
                  <Route path="/Agricultureportal" element={<Sidebar />} />
                  <Route path="/stacking" element={<Stacking />} />
                  <Route path="/NdviComponent" element={<NdviComponent />} />
                  <Route path="*" element={<PageNotFound />} />
                  <Route path="/testform" element={<FormComponent />} />
                  <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                  <Route path="/Disclaimer" element={<Disclaimer />} />
                  <Route path="/Termsacondition" element={<Termsacondition />} />
                  {/* <Route path="/OtherApp" element={<OtherApp />} /> */}
                  {/* <Route path="/SearchNew" element={<SearchNew />} /> */}
                  <Route path="/Polygone" element={
                    <MapProvider>
                    <PolygoneSelection />
                    </MapProvider>
                    } />
      
                    
                    



                  <Route path="/MyLayoutComponent"
                    element={
                      <MapProvider>
                        <MyLayoutComponent />
                      </MapProvider>
                    }
                  // element={<ProtectedRoute element={<Archival />} allowedUserTypes={['UU']} />}
                  />

                </Routes>





                <div>
                  < ScrollToTopButton className="AppContain" />
                </div>

              </div>
              <Footer />
            </div>
          )
      }


      {/* {AdminStatus && (
        //  <BlockedAdmin htmlContent={htmlContent} />
        <AdminBlockPopup AdminStatus={AdminStatus} />
      )} */}

    </>




  );
}

export default App;
