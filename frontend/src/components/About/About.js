import React, { useState, useEffect } from "react";
import "./About.css"; // Corrected the import for the About component stylesheet
import { motion } from "framer-motion";
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
import CentraliseButton from "../CentraliseButton/CentraliseButton";
import CentralizedHeading from "../CentralizeHeading/CentralizedHeading";
import CentralizedPara from "../CentralizedPara/CentralizedPara";


const About = () => {
  const [index, setIndex] = useState(0);
  const [userType, setUserType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rotate, setRotate] = useState(false);
  useEffect(() => {
    // Set rotate to true after a delay (e.g., 1000 milliseconds or 1 second)
    const delay = 8000; // Set your desired delay in milliseconds
    const timeoutId = setTimeout(() => {
      setRotate(true);
    }, delay);

    // Cleanup: clear the timeout to avoid memory leaks
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const images = [
    "https://local-weather-app.netlify.com/images/clear-d.jpeg",
    "https://local-weather-app.netlify.com/images/cloudy-sky.jpg",
    "https://local-weather-app.netlify.com/images/fog.jpg"
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [images.length]);


  return (
    <div className="aboutmain">
      {/* <CentraliseButton text="Register"  variant="#2b6e5b" fontAwesomeIcon={faSignInAlt} />
      <CentraliseButton text="Register"  variant="danger" fontAwesomeIcon={faSignOutAlt} />
      <CentraliseButton text="Register"  variant="primary" />
      <CentraliseButton text="Register"  variant="warning" /> */}

      {/* _________________________________________________ */}

      <section class="hero" style={{backgroundImage: `linear-gradient(rgba(2,2,2,0.5), rgba(0,0,0,0.5)), url(About-Banner.jpg)`}}>
        <div class="about-container">
        <CentralizedHeading level={1} color="mt-4" >
        ABOUT US
            </CentralizedHeading>
            {/* <CentralizedPara  color="purple" className="custom-paragraph">hello</CentralizedPara> */}
           
          {/* <h1>ABOUT US</h1> */}
          {/* <p>Check out my work and get in touch!</p> */}
          <p>With its powerful visualization capabilities and source of valuable geospatial information, satellite imagery is emerging an indispensable tool in planning and decision making for society, environment, and economy. It can facilitate data-driven policies, monitor development plans and activities, provide information about available resources, enable powerful solutions to business enterprises, improve welfare, and much more. <br></br>

            At <b>Micronet Solutions</b>, it is our vision and mission to unlock the full potential of satellite-based information and bridge the gap between technology and applications. We are committed to bring world class satellite data to users in India and beyond, foster satellite-based applications, facilitate access and affordability, ease of buying, use and understanding, and provide value added services.<br></br>

            We aim to cater to users in diverse industries with high-resolution data, both in optical and radar imagery space.<br></br> <br></br>

            Micronet Solutions has been at the forefront of providing geospatial solutions in India for more than two decades.<br></br>

            We are the authorized distributors for leading global remote sensing data providers Airbus Defence & Space, Planet Labs, and MDA. We bring the highest resolution satellite imagery commercially available, including 30 cm and 50 cm. Our other range includes 1.5 m, 1 m, and 3 m.<br></br>

            We are one of the preferred partners for the public sector departments for project implementation, GIS mapping and remoter sensing services. We also have line production facilities to handle large volume of maps ensuring timely deliverables and quality outputs. Simplifying complex problems for geospatial database creation and ensuring industry standard benchmarks are our forte.</p>


          {/* <a href="#portfolio" class="cta-button">View Portfolio</a> */}
        </div>
      </section>

      {/* _________________________________________________ */}
      <div class="copyright_about">
        <CopyRightFooter />
      </div>

    </div>
  );
};

export default About;
