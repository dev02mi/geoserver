import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "react-bootstrap";
import MyCard from "../MyCard/MyCard";
import "./Home.css";
import styled, { keyframes } from "styled-components";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
import About from "../About/About";
import ContactForm from "../ContactForm/ContactForm";
import Service from "../Services/Service";
import handleLogin from "../Login/Login";
import { motion } from "framer-motion";
import Testimonial from "../Testimonial/Testimonial";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faPencilAlt,
  faCompass,
  faHardHat,
  faVectorSquare,
  faPlusSquare,
  faAngleDoubleDown,
  faArrowRight,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";




// const images = [
//   "FirstImg01.png?text=irbus Defence & Space (Airbus DS) has been a leading provider of satellite imagery for more than three decades. The Europe-headquartered company operates the largest constellation of optical and radar commercial earth observation satellites available in the market today.",
//   "cara001.png?text=Leading the way in global daily satellite imagery, American earth imaging company Planet Labs is driven by a mission to make global change accessible and actionable through daily monitoring. The company’s fleet of over 200 earth imaging satellites collects over 350 million square meter of earth land mass imagery daily.",
//   "cara002.png?text=Second",
//   "cara003.png?text=Third",
// ];


const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledCaption = styled.div`
  animation: ${fadeIn} 1s ease-in-out;

  h3 {
    animation: ${fadeInLeft} 1s ease-in-out 0.2s;
  }

  p {
    animation: ${fadeInRight} 1s ease-in-out 0.4s;
  }
`;
const StyledTransparentBox = styled.div`
background: linear-gradient(to right, #2E3192, #1BFFFF);
  /* Adjust the transparency as needed */
  padding: 20px;
  width: 50%;
  height: 50%;
  border-radius: 10px;
  animation: ${fadeInUp} 1s ease-in-out 0.1s; /* Adjust the delay as needed */
`;

const Home = ({ refreshToken }) => {
  const [accessToken, setToken] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  // const slides = [
  //   {
  //     id: 'slide1',
  //     heading: 'GEOPICX 1',
  //     text: "WELCOME",
  //     imageUrl: 'https://www.wallpapertip.com/wmimgs/42-427771_world-wide-web-hd.jpg',
  //   },
  //   {
  //     id: 'slide2',
  //     heading: 'AIRBUS 2',
  //     text: "Airbus Defence & Space (Airbus DS) has been a leading provider of satellite imagery for more than three decades. The Europe-headquartered company operates the largest constellation of optical and radar commercial earth observation satellites available in the market today.",
  //     imageUrl: 'FirstImg.jpg',
  //   },
  //   {
  //     id: 'slide3',
  //     heading: 'THIS 3',
  //     text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit...',
  //     imageUrl: 'Planet_lab_Mumbai_Cro.jpg',
  //   },
  //   {
  //     id: 'slide4',
  //     heading: 'THIS 4',
  //     text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit...',
  //     imageUrl: 'C-Image-03.png',
  //   },
  //   {
  //     id: 'slide5',
  //     heading: 'THIS 5',
  //     text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit...',
  //     imageUrl: 'C-Image-04.png',
  //   },
  // ];

  // const totalSlides = slides.length;
  // let slideInterval;

  // const showSlide = (n) => {
  //   setCurrentSlide((n + totalSlides) % totalSlides);
  // };

  // const nextSlide = () => showSlide(currentSlide + 1);

  // const prevSlide = () => showSlide(currentSlide - 1);

  // const startSlideShow = () => (slideInterval = setInterval(nextSlide, 5000)); // Change slide every 5 seconds

  // const stopSlideShow = () => clearInterval(slideInterval);

  // useEffect(() => {
  //   showSlide(currentSlide);
  //   startSlideShow();

  //   return () => stopSlideShow();
  // }, [currentSlide]);

  const [index, setIndex] = useState(0);
  // const [userType, setUserType] = useState(null);
  // const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(() => {
    return sessionStorage.getItem("userName") || null;
  });
  const [userType, setUserType] = useState(() => {
    return sessionStorage.getItem("userType") || null;
  });
  console.log(userType);
  console.log(userName)

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  useEffect(() => {
    const showSlide = (e) => {
      let slideId = e.currentTarget.dataset.slide;
      let currentSlide = document.querySelector(`.custom-slideh[data-slide="${slideId}"`);
      let slides = document.querySelectorAll('.custom-slideh');
      let slideCount = slides.length;

      if (currentSlide) {
        let currentSlideId = currentSlide.dataset.slide;

        slides.forEach(slide => {
          slide.classList.remove('show');
        });

        currentSlide.classList.add('show');
      }

      resetSlideShow();
    };

    const nextSlide = () => {
      let currentSlide = document.querySelector('.custom-slideh.show');
      let slides = document.querySelectorAll('.custom-slideh');
      let slideCount = slides.length;

      if (currentSlide) {
        let currentSlideId = currentSlide.dataset.slide;
        let nextSlideId = currentSlideId >= slideCount ? 1 : parseInt(currentSlideId) + 1;

        currentSlide.classList.remove('show');

        let nextSlide = document.querySelector(`.custom-slideh[data-slide="${nextSlideId}"`);

        if (nextSlide) {
          nextSlide.classList.add('show');
        }

        resetSlideShow();
      }
    };

    const prevSlide = () => {
      let currentSlide = document.querySelector('.custom-slideh.show');
      let slides = document.querySelectorAll('.custom-slideh');
      let slideCount = slides.length;

      if (currentSlide) {
        let currentSlideId = currentSlide.dataset.slide;
        let prevSlideId = currentSlideId <= 1 ? slideCount : parseInt(currentSlideId) - 1;

        currentSlide.classList.remove('show');

        let prevSlide = document.querySelector(`.custom-slideh[data-slide="${prevSlideId}"`);

        if (prevSlide) {
          prevSlide.classList.add('show');
        }

        resetSlideShow();
      }
    };

    const resetSlideShow = () => {
      clearInterval(slideshowH);
      slideshowH = setInterval(nextSlide, nextSlideTimer);
    };

    let nextSlideBtn = document.querySelector('.custom-slideh-btn.next');
    let prevSlideBtn = document.querySelector('.custom-slideh-btn.prev');
    let nextSlideTimer = 3000;
    let slideshowH = setInterval(nextSlide, nextSlideTimer);

    // nextSlideBtn.addEventListener('click', nextSlide);
    // prevSlideBtn.addEventListener('click', prevSlide);

    let thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', showSlide);
    });

    return () => {
      // nextSlideBtn.removeEventListener('click', nextSlide);
      // prevSlideBtn.removeEventListener('click', prevSlide);

      thumbnails.forEach(thumbnail => {
        thumbnail.removeEventListener('click', showSlide);
      });

      clearInterval(slideshowH);
    };
  }, []);
  // useEffect(() => {
  //   const refreshAccessToken = async () => {
  //     try {
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

  //   // const intervalId = setInterval(refreshAccessToken, 300);
  //   // return () => clearInterval(intervalId);
  // }, [refreshToken]);

  // useEffect(() => {
  //   const performLogin = async () => {

  //     try {

  //       const response = await handleLogin();
  //       console.log("Login Response:", response);


  //       const { user_type, userName } = response.data;
  //       setUserType(user_type);
  //       setUserName(userName);
  //       setIsLoggedIn(true);
  //     } catch (error) {
  //       console.error("Login failed", error);

  //     }
  //   };

  //   performLogin();
  // }, []);




  // const handleUsername = async () => {
  //   try {
  //     // Perform login logic and get the response
  //     const response = handleLogin(); // Replace with your login function
  //     const { user_type } = response.data;

  //     // Set the user type in the state
  //     setUserType(user_type);
  //   } catch (error) {
  //     console.error("Login failed", error);
  //     // Handle login failure
  //   }
  // };

  // Use useEffect to automatically trigger handleLogin when the component mounts
  // useEffect(() => {

  //   handleUsername();
  // }, []);

  return (

    <div className="HomeContainer">
      {/* ______________________________________________________________________________________ */}
      {/* <div className="slider-container-CR">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`slide-CR ${currentSlide === index ? 'active' : ''}`} id={slide.id}>
            <div className="text-box-CR">
              <h2>{slide.heading}</h2>
              <p>{slide.text}</p>
              <a href="#" className="btn-CR">
                Read More
              </a>
            </div>
            <img className="img-CR" src={slide.imageUrl} alt={`Slide-CR ${index + 1}`} />
          </div>
        ))}

      
        <i className="arrow-CR " id="prevBtn" onClick={prevSlide}><FontAwesomeIcon
                      className=""
                      icon={faArrowLeft}
                    /></i>
        <i className="arrow-CR " id="nextBtn" onClick={nextSlide}><FontAwesomeIcon
                      className=""
                      icon={faArrowRight}
                    /></i>
      </div> */}


      {/* ___________________________________________________________________________________________________________________ */}

      {/* <div id="carouselExample" className="carousel slide carousel-fade cara-head" data-ride="carousel">
      
        <ol className="carousel-indicators">
          <li data-target="#carouselExample" data-slide-to="0" className="active"></li>
          <li data-target="#carouselExample" data-slide-to="1"></li>
          <li data-target="#carouselExample" data-slide-to="2"></li>
          <li data-target="#carouselExample" data-slide-to="3"></li>
          <li data-target="#carouselExample" data-slide-to="4"></li>
        </ol>
      
        <div className="carousel-inner ">
          <div className="carousel-item active">
            <img src="GEOPICX_Banner.jpg" className="cara-Img img-fluid d-block w-100" alt="Welcome to Geopicx" />


            
          </div>

          <div className="carousel-item">
            <img src="geo-2.png" className="cara-Img img-fluid d-block w-100" alt="1" />

          </div>

          <div className="carousel-item ">
            <img src="Geo-3.png" className="cara-Img img-fluid d-block w-100" alt="2" />

          </div>


          <div className="carousel-item">
            <img src="Geo-4.png" className="cara-Img img-fluid d-block w-100" alt="3" />

          </div>


          <div className="carousel-item">
            <img src="Geo-Analysis-image.jpg" className="cara-Img img-fluid d-block w-100" alt="4" />

          </div>

          <div className="carousel-item">
            <img src="Geo-1.jpg " className="cara-Img img-fluid d-block w-100" alt="5" />

          </div>

          <div className="carousel-item">
            <img src="Mining-geo.jpg" className="cara-Img img-fluid d-block w-100" alt="6" />

          </div>

         
        </div>
       
        <a className="carousel-control-prev" href="#carouselExample" data-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </a>
        <a className="carousel-control-next" href="#carouselExample" data-slide="next">
          <span className="carousel-control-next-icon"></span>
        </a>
      </div> */}
      {/* <div class="slider--container">
		<div class="slider--heading px-auto ml-5">
			<h1 class="mt-5 HeadingOfcarousel">GeoPicX</h1>
			<p className="Textaofcraousel-Container px-auto mx-3 pt-5">GeoPicX is a web-based platform and an online gateway that provides access to geospatial information, data, and services through a systematic process of spatial world data collection, storage and analysis. It serves as a centralized hub for discovering, accessing, and managing data both in the form of spatial (geographic information system (GIS) resources) and nonspatial data (Management Information System (MIS). GeoPicX is designed to facilitate the exploration and utilization of spatial data for various purposes, including research, analysis, decision-making, and public information. <br></br><br></br>

GeoPicX will be used by a variety of stakeholders, including government agencies, researchers, businesses, and the general public. It plays a crucial role in promoting the availability and accessibility of geospatial information (location-based information), contributing to informed decision-making and fostering collaboration in the field of geographic information systems.</p>
		</div>
    <div>
      	<img class="slider--image" src="geo-2.png" alt="winter-01" />
		<img class="slider--image" src="geo-3.png" alt="winter-02" />
		<img class="slider--image" src="geo-4.png" alt="winter-03" />
    <img class="slider--image" src="Mining-geo.jpg" alt="winter-04" />
    <img class="slider--image" src="Mining-geo.jpg" alt="winter-05" />
    </div>
	
	</div> */}
      <div id="slideshowH" className="HomeSlideSow">
        <div id="galleryOfHome">
          <strong className="d-flex justify-content-start mt-2 mb-2 HighlighthomeSpan mx-3">Welcome to . . .</strong>

          <div className="Home-geopics ">

            <img src="GEOPICX_LOGO.png" className="" alt="Site Logo" width="40" height="40" />
            <h1 className="GeopicsHeadingInsideCrausel">GeoPicX</h1>
            {/*  */}
          </div>
          <p className="d-flex mx-3 Gateway mt-0 pt-0 pl-0">Your gateway to transformative geospatial intelligence with cutting-edge satellite imagery.</p>
          <div>
            <p className=" mx-3 Textaofcraousel-Container mt-3 mb-5">
              GeoPicX is a web-based platform and an online gateway that provides access to geospatial information, data, and services through a systematic process of spatial world data collection, storage and analysis. It serves as a centralized hub for discovering, accessing, and managing data both in the form of spatial (geographic information system (GIS) resources) and nonspatial data (Management Information System (MIS). GeoPicX is designed to facilitate the exploration and utilization of spatial data for various purposes, including research, analysis, decision-making, and public information. <br></br><br></br>

              GeoPicX will be used by a variety of stakeholders, including government agencies, researchers, businesses, and the general public. It plays a crucial role in promoting the availability and accessibility of geospatial information (location-based information), contributing to informed decision-making and fostering collaboration in the field of geographic information systems.
            </p>
            {/* <div className="mt-5">
              <div><strong className="d-flex justify-content-start HighlighthomeSpan mx-3">Developed by </strong>
                <p className="d-flex justify-content-start align-items-center BlowSpan mx-3">  Micronet Solutions, Nagpur</p>
              </div>
              <div><strong className="d-flex justify-content-start HighlighthomeSpan mx-3">Office </strong>
                <p className="d-flex justify-content-start align-items-center BlowSpan mx-3"> Plot No. 80, Khare Tarkunde Nagar, <br></br>Katol Road, Nagpur – 440013, Maharashtra   </p>
              </div>
            </div> */}

          </div>
        </div>
        <div id="slides">
          <div class="custom-slideh show" data-slide="1">
            <img src="https://www.bifold.berlin/fileadmin/user_upload/News/Destination_Earth.jpg"
              className="cara-Img img-fluid d-block w-100"
              alt="" />

            <div class="contentHome d-flex p-2 m-0">
              <span class="titleHome ml-2">Mars:</span>

              <p class="descriptionHome ml-2 mb-0">

                GIS plays a pivotal role in Mars exploration by analyzing spatial data collected.
              </p>
            </div>
          </div>

          <div class="custom-slideh" data-slide="2">
            <img src="https://static.producer.com/wp-content/uploads/2022/09/07132307/38-5-col-Organic-Valley-1.jpg" className="cara-Img img-fluid d-block w-100" alt="" />

            <div class="contentHome d-flex p-2 m-0">
              <span class="titleHome ml-2">Agriculture:</span>

              <p class="descriptionHome ml-2 mb-0">
                GIS is instrumental in modern agriculture for optimizing land use, crop management, and resource allocation.
              </p>
            </div>
          </div>

          <div class="custom-slideh" data-slide="3">
            <img src="https://developers.google.com/static/earth-engine/images/datasets/landsat.jpg"
              className="cara-Img img-fluid d-block w-100"
              alt="" />

            <div class="contentHome d-flex p-2 m-0">
              <span class="titleHome ml-2">Water:</span>

              <p class="descriptionHome ml-2 mb-0">
                GIS is indispensable for mapping water resources and infrastructure, optimizing management strategies, and enhancing decision-making in water-related sector.
              </p>
            </div>
          </div>

          <div class="custom-slideh" data-slide="4">
            <img src="/Mining-geo.jpg"
              className="cara-Img img-fluid d-block w-100"
              alt="" />

            <div class="contentHome d-flex p-2 m-0">
              <span class="titleHome ml-2">Mining:</span>

              <p class="descriptionHome ml-2 mb-0">

                GIS is extensively used in mining for exploration, resource assessment, and mine planning. It helps in analyzing spatial data such as geological maps.




              </p>
            </div>
          </div>

          <div class="custom-slideh" data-slide="5">
            <img src="https://www.esri.com/content/dam/esrisites/en-us/industries/2021/national-gov-defense-sector/defense/assets/overview/industry-defense-5050.jpg"
              alt="" />

            <div class="contentHome d-flex p-2 m-0">
              <span class="titleHome ml-2">Defence:</span>

              <p class="descriptionHome ml-2 mb-0">
                GIS in defense enhances situational awareness, operational efficiency, and decision-making capabilities through spatial analysis.

              </p>
            </div>
          </div>




        </div>


      </div>
      {/* ___________________________________________________________________________________________________________________ */}
      {/* _________________CARD________________________ */}

      <div className="content-inside-home">
        <div className="pl-5 pr-5 pb-5 pt-0">
          <MyCard userType={userType}
            userName={userName}

          />
        </div>
      </div>



      {/* -----------Products Sections------- */}

      <motion.h1
        className="text-card mt-4 my-4 container-fluid" >
        Products
      </motion.h1>

      <div class="  text-center d-flex  ">
        <p align="center" class="prod-para" >Geopicx has partnered with leading satellite imagery providers from across the globe. Our partners are at the forefront of providing updated, latest, and the highest resolutions satellite imagery available in the market today. The satellite data is easy to use, and can be easily integrated into your various processes.</p>
      </div>



      {/* ___________________NEW_________________________ */}

      <section class=" section-background parallax  d-flex align-items-end" style={{ backgroundImage: "url(https://static.wixstatic.com/media/59da6a_debd7538b9334aaa8c00589b1239ca43~mv2.jpg/v1/fill/w_1903,h_857,al_t,q_85,usm_0.66_1.00_0.01,enc_auto/59da6a_debd7538b9334aaa8c00589b1239ca43~mv2.jpg)" }}>

        <div class="img_heading d-flex align-items-end ">
          <motion.div
            initial={{ opacity: 0.1, rotateY: 270 }} // Initial position, opacity, and rotation
            animate={{ x: 0, opacity: 1, rotateY: 360 }}           // Target position, opacity, and rotation
            transition={{ duration: 2, delay: 2 }}
            className=""
          >
            <p align="justify" className="ParaForProduct align-text-bottom">
              With proprietary access to
              <strong className=""> Pléiades, SPOT, Vision-1</strong>
              and <strong className="">DMC Constellation</strong> optical
              satellites as well as the <strong className="">Radar Constellation</strong>
              (consisting of TerraSAR-X, TanDEM-X and PAZ), our extensive portfolio spans the entire geo-information value chain and
              is unrivalled in the marketplace.
              <br></br>
              And we are continuously expanding our constellation to deliver
              even better data solutions. With the launch of the <strong className="">Pléiades Neo </strong> constellation
              in 2021, we are able to provide our customers with even more coverage and high resolution at 30cm resolution and daily revisit.
            </p>
          </motion.div>


        </div>


      </section>
      <section class="section-background parallax1  d-flex align-items-end" style={{ backgroundImage: "url(https://static.wixstatic.com/media/59da6a_5dfc5d81b9164ebcb4bb54c8f8b204a5~mv2.jpg/v1/fill/w_1903,h_880,al_t,q_85,usm_0.66_1.00_0.01,enc_auto/59da6a_5dfc5d81b9164ebcb4bb54c8f8b204a5~mv2.jpg)" }}>
        {/* <h2 class="img_heading">Planet</h2> */}

        <div class="img_heading d-flex align-items-end">
          <motion.div
            className=""
            initial={{ opacity: 0.1, rotateY: 270 }} // Initial position, opacity, and rotation
            animate={{ x: 0, opacity: 1, rotateY: 360 }}           // Target position, opacity, and rotation
            transition={{ duration: 3, delay: 4.5 }}
          >
            <p align="justify" className=" ParaForProduct">
              Planet revolutionized the earth observation industry with the
              highest frequency satellite data commercially available. Planet’s
              data is transforming the way companies and governments use satellite imagery data, delivering insights at the daily pace of
              change on earth. This differentiated data set powers
              decision-making in a myriad of industries including agriculture,
              forestry, mapping, and government. Our fleet of over 200 earth
              imaging satellites, the largest in history, images the whole Earth
              land mass daily.
            </p>
          </motion.div>

        </div>


      </section>

      <section class="section-background parallax2  d-flex align-items-end" style={{ backgroundImage: "url(https://cloudfront-us-east-1.images.arcpublishing.com/tgam/4BOTUOND55FC5GWL74VO4L6AU4.JPG)" }}>
        {/* <h2 class="img_heading">MDA</h2> */}
        <div class="img_heading d-flex align-items-end">
          <motion.div
            initial={{ opacity: 0.1, rotateY: 270 }} // Initial position, opacity, and rotation
            animate={{ x: 0, opacity: 1, rotateY: 360 }} // Target position, opacity, and rotation
            transition={{ duration: 4, delay: 4.5 }}
            className=""
          >
            <p align="justify" className="ParaForProduct " >
              Airbus is proud to offer the{" "}
              <strong className="">
                MDA (Multi-Domain Awareness) satellite
              </strong>
              product, a cutting-edge solution that embodies our commitment to
              excellence in the field of satellite technology. The MDA satellite
              product is designed to cater to the specific needs of a wide array
              of industries and applications, providing invaluable insights into
              our ever-changing world. <br />
              The MDA satellite product is a testament to Airbus' expertise in
              the satellite industry. It is a versatile and adaptable platform
              that encompasses a range of advanced features and capabilities.
              This satellite product is a key element of Airbus' mission to
              provide comprehensive satellite solutions for businesses,
              governments, researchers, and organizations worldwide.
            </p>
          </motion.div>
        </div>

      </section>

      {/* <section class="text-bloc">
        <motion.div
          initial={{ opacity: 0.1, rotateY: 270 }} // Initial position, opacity, and rotation
          animate={{ x: 0, opacity: 1, rotateY: 360 }} // Target position, opacity, and rotation
          transition={{ duration: 4, delay: 4.5 }}
          className=""
        >
          <p align="justify" className=" ParaForProduct">
            Airbus is proud to offer the{" "}
            <strong className="strssword">
              {" "}
              MDA (Multi-Domain Awareness) satellite{" "}
            </strong>
            product, a cutting-edge solution that embodies our commitment to
            excellence in the field of satellite technology. The MDA satellite
            product is designed to cater to the specific needs of a wide array
            of industries and applications, providing invaluable insights into
            our ever-changing world. <br />
            The MDA satellite product is a testament to Airbus' expertise in
            the satellite industry. It is a versatile and adaptable platform
            that encompasses a range of advanced features and capabilities.
            This satellite product is a key element of Airbus' mission to
            provide comprehensive satellite solutions for businesses,
            governments, researchers, and organizations worldwide.
          </p>
        </motion.div>
      </section> */}

      {/* <section class="section-background parallax3" style={{backgroundImage:"url(products.jpg)"}}>
    <h2>Galaxy</h2>
  </section> */}


      {/* ______________________NEW______________________ */}

      {/* ___________<About />___________ */}
      <section class="aboutUS" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(About-Home-ban.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        mixBlendMode: 'multiply'


      }} >
        <div class="container">
          <div class="heading text-center">
            <h2>About
              <span>Us</span></h2>
            <p>MICRONET SOLUTIONS
            </p>
          </div>
          <div class="row">
            <div class="col-lg-6">
              <img src="Company.jpg" alt="about" class="img-fluid h-100" width="100%" />
            </div>
            <div class="col-lg-6">
              <p>With its powerful visualization capabilities and source of valuable geospatial information, satellite imagery is emerging an indispensable tool in planning and decision making for society, environment, and economy. It can facilitate data-driven policies, monitor development plans and activities, provide information about available resources, enable powerful solutions to business enterprises, improve ...
              </p>
              {/* Button */}
              <a class="animated-button mb-4" href="/About">
                <svg xmlns="http://www.w3.org/2000/svg" class="arr-2" viewBox="0 0 24 24">
                  <path
                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                  ></path>
                </svg>
                <span class="text">Read More..</span>
                <span class="circle"></span>
                <svg xmlns="http://www.w3.org/2000/svg" class="arr-1" viewBox="0 0 24 24">
                  <path
                    d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                  ></path>
                </svg>
              </a>

              <div class="row">
                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faChartLine}
                    /></i><a href="/Service">Image Analysis</a></h4>
                </div>

                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faPencilAlt}
                    /></i>
                    <a href="/Service">Creative Design</a></h4>
                </div>

                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faCompass}
                    /></i><a href="/Service">Urban Mapping & GIS</a></h4>
                </div>

                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faHardHat}
                    /></i>
                    <a href="/Service">Mineral Exploration</a></h4>
                </div>

                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faVectorSquare}
                    /></i><a href="/Service">Cadastral Surveus</a></h4>
                </div>
                <div class="col-md-6 service-lnk">
                  <h4 class="services-link">
                    <i class=""><FontAwesomeIcon
                      className="geopicnavicon"
                      icon={faAngleDoubleDown}
                    /></i><a href="/Service">More...</a></h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ___________<About />___________ */}

      {/* <div className=""></div> */}

      {/* Testimonial Page Render */}
      {/* <h2 className="Testimonial my-4 text-center">What Our Customer Says</h2>

      <div class="container-flex">
        <Testimonial />
      </div> */}

      {/* <div class="container">
            <Carousel />
          </div> */}

      {/* CopyRight Footer Section */}
      <div class="CopyRightFooter ">
        <CopyRightFooter />
      </div>

    </div>
  );
};

export default Home;
