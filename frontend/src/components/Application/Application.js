import { React, useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { motion } from "framer-motion";
import "./Application.css";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
import { useLocation } from 'react-router-dom';
const Application = () => {

  const agricultureRef = useRef(null);
  const miningRef = useRef(null);
  const gisRef = useRef(null);
  const defenseRef = useRef(null);
  const marsRef = useRef(null)
  const waterRef = useRef(null)

  const [showMoreContent1, setShowMoreContent1] = useState(false);
  const toggleShowMoreContent1 = () => {
    setShowMoreContent1(!showMoreContent1);
  };


  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  let background = document.querySelector(".background");
  let person = document.querySelector(".person");
  let mountain = document.querySelector(".mountain");
  let smoke1 = document.querySelector(".smoke1");
  let smoke2 = document.querySelector(".smoke2");
  let text = document.querySelector("h1");
  let cover = document.querySelector(".cover");
  let header = document.querySelector("header");

  const scrollHandle = (e) => {
    let scroll = window.scrollY;

    text.style.transform = `translate(-50%, -50%) translate3d(0, ${scroll * 0.85
      }px, 0)`;
    background.style.transform = `translate3d(0, ${scroll * 0.9}px, 0)`;
    mountain.style.transform = `translate3d(0, ${scroll * 0.85}px, 0)`;
    smoke1.style.transform = `translate3d(0, ${scroll * 0.7}px, 0)`;
    smoke2.style.transform = `translate3d(0, ${scroll * 0.3}px, 0)`;
    person.style.transform = `translate3d(0, ${scroll * 0.25}px, 0)`;
  };

  window.addEventListener("scroll", scrollHandle);

  // //////////////
  useEffect(() => {
    const showSlide = (e) => {
      let slideId = e.currentTarget.dataset.slide;
      let currentSlide = document.querySelector(`.custom-slide[data-slide="${slideId}"`);
      let slides = document.querySelectorAll('.custom-slide');
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
      let currentSlide = document.querySelector('.custom-slide.show');
      let slides = document.querySelectorAll('.custom-slide');
      let slideCount = slides.length;

      if (currentSlide) {
        let currentSlideId = currentSlide.dataset.slide;
        let nextSlideId = currentSlideId >= slideCount ? 1 : parseInt(currentSlideId) + 1;

        currentSlide.classList.remove('show');

        let nextSlide = document.querySelector(`.custom-slide[data-slide="${nextSlideId}"`);

        if (nextSlide) {
          nextSlide.classList.add('show');
        }

        resetSlideShow();
      }
    };

    const prevSlide = () => {
      let currentSlide = document.querySelector('.custom-slide.show');
      let slides = document.querySelectorAll('.custom-slide');
      let slideCount = slides.length;

      if (currentSlide) {
        let currentSlideId = currentSlide.dataset.slide;
        let prevSlideId = currentSlideId <= 1 ? slideCount : parseInt(currentSlideId) - 1;

        currentSlide.classList.remove('show');

        let prevSlide = document.querySelector(`.custom-slide[data-slide="${prevSlideId}"`);

        if (prevSlide) {
          prevSlide.classList.add('show');
        }

        resetSlideShow();
      }
    };

    const resetSlideShow = () => {
      clearInterval(slideshow);
      slideshow = setInterval(nextSlide, nextSlideTimer);
    };

    let nextSlideBtn = document.querySelector('.custom-slide-btn.next');
    let prevSlideBtn = document.querySelector('.custom-slide-btn.prev');
    let nextSlideTimer = 3000;
    let slideshow = setInterval(nextSlide, nextSlideTimer);

    nextSlideBtn.addEventListener('click', nextSlide);
    prevSlideBtn.addEventListener('click', prevSlide);

    let thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', showSlide);
    });

    return () => {
      nextSlideBtn.removeEventListener('click', nextSlide);
      prevSlideBtn.removeEventListener('click', prevSlide);

      thumbnails.forEach(thumbnail => {
        thumbnail.removeEventListener('click', showSlide);
      });

      clearInterval(slideshow);
    };
  }, []);
  // let slides = document.querySelectorAll('.slide');
  // let thumbnails = document.querySelectorAll('.thumbnail');
  // let currentSlide = document.querySelector('.slide.show');
  // let slideCount = slides.length;
  // let currentSlideId = currentSlide ? currentSlide.dataset.slide : null; // Check if currentSlide is not null before accessing dataset.slide
  // let nextSlideBtn = document.querySelector('.slide-btn.next');
  // let prevSlideBtn = document.querySelector('.slide-btn.prev');
  // let nextSlideTimer = 3000;

  // thumbnails.forEach(thumbnail => {
  //     thumbnail.addEventListener('click', showSlide);
  // });

  // nextSlideBtn.addEventListener('click', nextSlide);
  // prevSlideBtn.addEventListener('click', prevSlide);

  // let slideshow = setInterval(nextSlide, nextSlideTimer);

  // function showSlide(e) {
  //     let slideId = e.currentTarget.dataset.slide;

  //     if (currentSlide) {
  //         currentSlide.classList.remove('show');
  //     }

  //     currentSlide = document.querySelector(`.slide[data-slide="${slideId}"`);

  //     if (currentSlide) {
  //         currentSlide.classList.add('show');
  //         currentSlideId = currentSlide.dataset.slide;
  //     }

  //     resetSlideShow();
  // }

  // function nextSlide() {
  //     if (currentSlideId && currentSlideId >= slideCount) {
  //         return;
  //     }

  //     if (currentSlide) {
  //         currentSlide.classList.remove('show');
  //     }

  //     let nextSlideId = currentSlideId ? parseInt(currentSlideId) + 1 : 1;

  //     currentSlide = document.querySelector(`.slide[data-slide="${nextSlideId}"`);

  //     if (currentSlide) {
  //         currentSlide.classList.add('show');
  //         currentSlideId = currentSlide.dataset.slide;
  //     }

  //     resetSlideShow();
  // }

  // function prevSlide() {
  //     if (currentSlideId && currentSlideId <= 1) {
  //         return;
  //     }

  //     if (currentSlide) {
  //         currentSlide.classList.remove('show');
  //     }

  //     let prevSlideId = currentSlideId ? parseInt(currentSlideId) - 1 : slideCount;

  //     currentSlide = document.querySelector(`.slide[data-slide="${prevSlideId}"`);

  //     if (currentSlide) {
  //         currentSlide.classList.add('show');
  //         currentSlideId = currentSlide.dataset.slide;
  //     }

  //     resetSlideShow();
  // }

  // function resetSlideShow() {
  //     clearInterval(slideshow);
  //     slideshow = setInterval(nextSlide, nextSlideTimer);
  // }
  // const scrollToRef = (ref) => {
  //   if (ref.current) {
  //     window.scrollTo({
  //       top: ref.current.offsetTop,
  //       behavior: 'smooth'
  //     });
  //   }
  // };


  const location = useLocation();
  const stateData = location.state?.someData;

  useEffect(() => {

    const scrollOptions = { behavior: 'smooth', block: 'center' };

    switch (stateData) {
      case 'agriculture':
        if (agricultureRef.current) {
          agricultureRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'mining':
        if (miningRef.current) {
          miningRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'gis':
        if (gisRef.current) {
          gisRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'defense':
        if (defenseRef.current) {
          defenseRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'mars':
        if (marsRef.current) {
          marsRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'water':
        if (waterRef.current) {
          waterRef.current.scrollIntoView(scrollOptions);
        }
        break;
      default:
        break;
    }
  }, [stateData]);





  return (
    //   <div className="Mainbody-of-application mt-3">
    //         <h3 className="text-center HeadingOfApplicationGis mt-5">
    //           DIFFERENT APPLICATIONS OF GIS
    //         </h3>
    //         <div className="img-fluid">
    //           <img className="BannerApplication img-fluid" src="GisBanner1.jpg" />
    //         </div>

    //       <div class="mx-4">
    //         <p align="center" className="ParaForApplication mx-4 mt-4">
    //           Geographic Information Systems (GIS) have many different applications in business and everyday life. And with the technological advancements that have come about through the years, GIS data has been utilised more and more as companies see how they can benefit from the information GIS can provide. A geographic information system is a tool that captures, stores, checks, and displays demographic, topographic, and environmental data. Companies in various industries can use this data to make informed decisions in their business processes. The uses of GIS continue to grow every day. In this article, we will look at the different ways that businesses and governments can use GIS.
    //         </p>
    //       </div>

    // {/* ____________________________________________________ */}

    // <hr class="featurette-divider"></hr>

    //       <div class="row featurette mx-4 align-items-center">
    //         <div class="col-md-7 order-md-2">
    //           <h1 className="ApllicationOfMinning">Mars</h1>
    //           <p align="justify" className=" ParaForAGri">
    //             Our innovative and rigorous methodology maximizes your projects’
    //             economic benefits; by focusing on the deposit within the greater
    //             mining context, we help you select a suitable mining method and
    //             create a robust plan for your mine. Our experts recognize the need
    //             to continuously adapt to commodity price and cost changes with
    //             appropriate mining operation responses, such as reducing operating
    //             and/or capital costs when prices fall and increasing capacity when
    //             prices rise. By producing practical mine designs and schedules, we
    //             ensure efficient use of mine capital. Taking advantage of
    //             technological advances in underground mining, we offer highly
    //             mechanized and automated solutions using software packages such as
    //             Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.
    //           </p>
    //         </div>
    //           <div  class="col-md-5 order-md-1 mb-4 img-fluid-p">
    //             <img className="ImageOfApplication img-fluid" src="airbusCard.jpg"/>
    //           </div>
    //       </div>{/* featurette div */}
    // {/* ___________________________________________________ */}

    //         <div class="row featurette mx-4 align-items-center">
    //           <div class="col-md-7 ">
    //           <h1 className="ApllicationOfAgri">Agriculture</h1>
    //           <p align="justify" className="ParaForAGri">
    //             Agriculture is one of the most important industries utilising GIS
    //             technology. Without it, we wouldn’t have food, clothing, or shelter.
    //             There are many ways that GIS technology can aid governments and
    //             farmers. Not only can GIS data identify drought areas, but it can
    //             also predict pest and rodent attacks, provide a land and soil
    //             analysis, and even use population data to help governments and
    //             farmers plan their crops. This vital information can ensure that the
    //             farmers plant enough crops to sustain the surrounding population.
    //           </p>

    //           </div>
    //           <div class="col-md-5 img-fluid-p mb-2">

    //           <img
    //             className="ImageOfApplication img-fluid"
    //             src="AgricultureApplication.jpg"
    //           />

    //           </div>
    //         </div>{/* featurette div */}

    //     <div class="row featurette mx-4 align-items-center">

    //       {/* <div className="row mx-3"> */}

    //         <div class="col-md-7 order-md-2">
    //         <h1 className="ApllicationOfWater ">Water</h1>
    //             <p align="justify" className=" ParaForAGri">
    //               GIS (Geographic Information System) is an essential tool for
    //               managing water supplies, as it helps to visualize and assess spatial
    //               data related to water resources. This includes creating detailed
    //               maps of water treatment plants, reservoirs, pipelines, and
    //               distribution networks, assessing population density, and other
    //               useful data. With IGiS, authorities can monitor the performance of
    //               the entire water system, identify areas with high demand or
    //               potential leakage, and decide on the best locations for new
    //               infrastructure. Additionally, IGiS can be used to analyse water
    //               supply scenarios like the demand for water in a particular area for
    //               giving insight to develop effective strategies for managing water
    //               sources. Ultimately, IGiS plays a major role in ensuring the
    //               sustainable management of water resources.
    //             </p>
    //         </div>

    //         <div class="col-md-5 order-md-1 img-fluid-a">
    //         <img
    //               className="ImageOfApplication img-fluid" src="WaterManagementApplication.jpg"
    //             />
    //         </div>
    //       {/* </div> */}
    //     </div> {/* featurette div */}

    //     <div class="row featurette mx-4 align-items-center">
    //         <div class="col-md-7">

    //         <h1 className="ApllicationOfMinning">Mining</h1>
    //           <p align="justify" className=" ParaForAGri ">
    //             Our innovative and rigorous methodology maximizes your projects’
    //             economic benefits; by focusing on the deposit within the greater
    //             mining context, we help you select a suitable mining method and
    //             create a robust plan for your mine. Our experts recognize the need
    //             to continuously adapt to commodity price and cost changes with
    //             appropriate mining operation responses, such as reducing operating
    //             and/or capital costs when prices fall and increasing capacity when
    //             prices rise. By producing practical mine designs and schedules, we
    //             ensure efficient use of mine capital. Taking advantage of
    //             technological advances in underground mining, we offer highly
    //             mechanized and automated solutions using software packages such as
    //             Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.
    //           </p>

    //         </div>
    //         <div  class="col-md-5 img-fluid-p">
    //         <img className="ImageOfApplication img-fluid" src="MinningApplication.jpg"/>

    //         </div>
    //     </div>{/* featurette div */}

    //     <div class="row featurette mx-4 my-1 align-items-center">
    //         <div class="col-md-7 order-md-2">
    //         <h1 className="ApllicationOfMilitary">Defence</h1>
    //           <p align="justify" className=" ParaForAGri ">
    //             Agriculture is one of the most important industries utilising GIS
    //             technology. Without it, we wouldn’t have food, clothing, or shelter.
    //             There are many ways that GIS technology can aid governments and
    //             farmers. Not only can GIS data identify drought areas, but it can
    //             also predict pest and rodent attacks, provide a land and soil
    //             analysis, and even use population data to help governments and
    //             farmers plan their crops. This vital information can ensure that the
    //             farmers plant enough crops to sustain the surrounding population.
    //           </p>

    //         </div>
    //           <div  class="col-md-5 order-md-1 mb-4 img-fluid-p">
    //           <img className="ImageOfApplication img-fluid" src="MilitaryApplication.jpg" />
    //           </div>
    //       </div>{/* featurette div */}

    //       <div>
    //         <CopyRightFooter/>
    //       </div>

    //   </div>

    <div className="Mainbody-of-application">
      {/* <div>
        <img className="BannerApplication " src="https://media.licdn.com/dms/image/D4D12AQFJwUlc20XLgQ/article-cover_image-shrink_600_2000/0/1704698363447?e=2147483647&v=beta&t=qxYe38ZRt3e-Taqfs24I4l8y9ViNrBVfHQh-3ca1LzU"/>

      

          <div className="App-Heading">
            <p >Application</p>
          </div>

          <p className="text-dark App-button" onClick={() => scrollToRef(marsRef)}>MARS</p>
          <p className="text-dark App-button" onClick={() => scrollToRef(agricultureRef)}>AGRICULTURE</p>
          <p className="text-dark App-button" onClick={() => scrollToRef(waterRef)}>WATER</p>
          <p className="text-dark App-button" onClick={() => scrollToRef(miningRef)}>MINNING</p>
          <p className="text-dark App-button" onClick={() => scrollToRef(defenceRef)}>DEFENCE</p>


      

      </div> */}


      {/* <div class="ParaForApplication">
        <p align="center" className="">
          {" "}
          Geographic Information Systems (GIS) have many different applications
          in business and everyday life. And with the technological advancements
          that have come about through the years, GIS data has been utilised
          more and more as companies see how they can benefit from the
          information GIS can provide. A geographic information system is a tool
          that captures, stores, checks, and displays demographic, topographic,
          and environmental data. Companies in various industries can use this
          data to make informed decisions in their business processes. The uses
          of GIS continue to grow every day. In this article, we will look at
          the different ways that businesses and governments can use GIS.
        </p>
      </div> */}
      {/* <h3 className="text-center HeadingOfApplicationGis mt-5">
         DIFFERENT APPLICATIONS OF GIS
        </h3>
<div class="fixedWrapper "style={{ backgroundImage: `url(/Application.jpg)` }}>
</div> */}
      {/* <div
        ref={marsRef}
        class="fixedWrapper"
        style={{
          backgroundImage: `url(/airbusCard.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1 className="  text-center ApplicationDR" style={{color:"#162d56"}}>MARS</h1>
        
      
        

        <div class="contentA">
          Our innovative and rigorous methodology maximizes your projects’
          economic benefits; by focusing on the deposit within the greater
          mining context, we help you select a suitable mining method and create
          a robust plan for your mine. Our experts recognize the need to
          continuously adapt to commodity price and cost changes with
          appropriate mining operation responses, such as reducing operating
          and/or capital costs when prices fall and increasing capacity when
          prices rise. By producing practical mine designs and schedules, we
          ensure efficient use of mine capital. Taking advantage of
          technological advances in underground mining, we offer highly
          mechanized and automated solutions using software packages such as
          Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.
        </div>
      </div> */}
      {/* <div
        ref={agricultureRef}
        class="fixedWrapper"
        style={{
          background:'url(https://www.mytechmag.com/wp-content/uploads/2022/03/agritech-trends-in-2022.jpg)',
          // backgroundImage: `url(/AgricultureApplication.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1 className="  text-center ApplicationDR" style={{color:"#0591b2"}}>AGRICULTURE
        </h1>
        <div class="contentA">
          Agriculture is one of the most important industries utilising GIS
          technology. Without it, we wouldn’t have food, clothing, or shelter.
          There are many ways that GIS technology can aid governments and
          farmers. Not only can GIS data identify drought areas, but it can also
          predict pest and rodent attacks, provide a land and soil analysis, and
          even use population data to help governments and farmers plan their
          crops. This vital information can ensure that the farmers plant enough
          crops to sustain the surrounding population.
        </div>
      </div> */}
      {/* <div
        ref={waterRef}
        class="fixedWrapper"
        style={{
          backgroundImage:`url(https://dusp.mit.edu/sites/default/files/styles/large/public/news-images/mekong_delta_noaa.jpg?h=cc083cad&itok=h-8GQQ9w)`,
          // backgroundImage: `url(/WaterManagementApplication.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1 className="  text-center ApplicationDR" style={{color:"#927d57"}}>WATER</h1>
        <div class="contentA">
          GIS (Geographic Information System) is an essential tool for managing
          water supplies, as it helps to visualize and assess spatial data
          related to water resources. This includes creating detailed maps of
          water treatment plants, reservoirs, pipelines, and distribution
          networks, assessing population density, and other useful data. With
          IGiS, authorities can monitor the performance of the entire water
          system, identify areas with high demand or potential leakage, and
          decide on the best locations for new infrastructure. Additionally,
          IGiS can be used to analyse water supply scenarios like the demand for
          water in a particular area for giving insight to develop effective
          strategies for managing water sources. Ultimately, IGiS plays a major
          role in ensuring the sustainable management of water resources.
        </div>
      </div> */}
      {/* <div
        ref={miningRef}
        class="fixedWrapper"
        style={{
          background:`url(https://content.satimagingcorp.com/static/galleryimages/aster-arizona-morenci-mine.jpg)`,
         
          // backgroundImage: `url(/MinningApplication.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1 className="  text-center ApplicationDR">MINING</h1>
        <div class="contentA">
          {" "}
          Our innovative and rigorous methodology maximizes your projects’
          economic benefits; by focusing on the deposit within the greater
          mining context, we help you select a suitable mining method and create
          a robust plan for your mine. Our experts recognize the need to
          continuously adapt to commodity price and cost changes with
          appropriate mining operation responses, such as reducing operating
          and/or capital costs when prices fall and increasing capacity when
          prices rise. By producing practical mine designs and schedules, we
          ensure efficient use of mine capital. Taking advantage of
          technological advances in underground mining, we offer highly
          mechanized and automated solutions using software packages such as
          Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.
        </div>
      </div> */}
      {/* <div
        ref={defenceRef}
        class="fixedWrapper"
        style={{
          backgroundImage: `url(/MilitaryApplication.jpg)`,
          backgroundSize: "cover",
        }}
      >
        <h1 className="  text-center ApplicationDR " style={{color:"#081822"}}>DEFENCE</h1>
        <div class="contentA">
          Our innovative and rigorous methodology maximizes your projects’
          economic benefits; by focusing on the deposit within the greater
          mining context, we help you select a suitable mining method and create
          a robust plan for your mine. Our experts recognize the need to
          continuously adapt to commodity price and cost changes with
          appropriate mining operation responses, such as reducing operating
          and/or capital costs when prices fall and increasing capacity when
          prices rise. By producing practical mine designs and schedules, we
          ensure efficient use of mine capital. Taking advantage of
          technological advances in underground mining, we offer highly
          mechanized and automated solutions using software packages such as
          Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.
        </div>
      </div> */}
      {/* <div class="fixedWrapper"style={{ backgroundImage: `url(/Application.jpg)` }}>
  <h1 className="  text-center">MARS</h1>
	<div class="contentA">Our innovative and rigorous methodology maximizes your projects’
            economic benefits; by focusing on the deposit within the greater
             mining context, we help you select a suitable mining method and
             create a robust plan for your mine. Our experts recognize the need
             to continuously adapt to commodity price and cost changes with
             appropriate mining operation responses, such as reducing operating
             and/or capital costs when prices fall and increasing capacity when
            prices rise. By producing practical mine designs and schedules, we
             ensure efficient use of mine capital. Taking advantage of
            technological advances in underground mining, we offer highly
            mechanized and automated solutions using software packages such as
           Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.</div>
</div> */}

      {/* <section class="container1">
  <img class="background" src="https://raw.githubusercontent.com/nonstopper0/codepen-images/main/4.png" />
  <img class="mountain" src="https://raw.githubusercontent.com/nonstopper0/codepen-images/main/3.png" />
  <img class="smoke1" src="https://raw.githubusercontent.com/nonstopper0/codepen-images/main/2.png" />
  <h1>MANITEES<span>&trade;</span></h1>
  <img class="person" src="https://raw.githubusercontent.com/nonstopper0/codepen-images/main/1.png" />
  <img class="smoke2" src="https://raw.githubusercontent.com/nonstopper0/codepen-images/main/2.png" />
</section> */}
      <div id="slideshow">
        <div id="slides">
          <div class="custom-slide show" data-slide="1">
            <img src="/airbusCard.jpg"
            className="cara-Img img-fluid d-block w-100"
              alt="" />

            <div class="contentAp">
              <span class="title">Mars</span>

              <p class="description">

                GIS plays a pivotal role in Mars exploration by analyzing spatial data collected
                from orbiters and rovers, aiding in the mapping of surface features, geological formations, and potential landing sites. It enables scientists to understand Martian terrain, plan missions, and navigate rovers effectively, contributing to our
                understanding of the planet's geology and potential habitability.
              </p>
            </div>
          </div>

          <div class="custom-slide" data-slide="2">
            <img src="https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2022/01/MAR-7834-body-image-BP_GIS-in-Agriculture_UPD-Featured-1.jpg" className="cara-Img img-fluid d-block w-100" alt="" />

            <div class="contentAp">
              <span class="title">Agricultural</span>

              <p class="description">
                GIS is instrumental in modern agriculture for optimizing land use, crop management,
                and resource allocation. It helps farmers make informed decisions by analyzing
                spatial data on soil types, topography, weather patterns, and crop yields, leading
                to improved crop productivity, efficient irrigation, and sustainable farming practices.
                Additionally, GIS facilitates precision agriculture techniques such as variable
                rate application of fertilizers and pesticides, minimizing
                input costs and environmental impact while maximizing yield.
              </p>
            </div>
          </div>

          <div class="custom-slide" data-slide="3">
            <img src="https://dusp.mit.edu/sites/default/files/styles/large/public/news-images/mekong_delta_noaa.jpg?h=cc083cad&itok=h-8GQQ9w"
            className="cara-Img img-fluid d-block w-100"
             alt="" />

            <div class="contentAp">
              <span class="title">Water</span>

              <p class="description">
                GIS is indispensable for mapping water resources and infrastructure, optimizing management strategies, and enhancing decision-making in water-related sectors. Its integration with hydrological modeling enables accurate prediction and assessment
                of water dynamics, crucial for sustainable water management practices.
              </p>
            </div>
          </div>

          <div class="custom-slide" data-slide="4">
            <img src="https://wp-cdn.apollomapping.com/web_assets/user_uploads/2020/08/06152603/hobart_factory_ge1_50cm-scaled.jpg"
            className="cara-Img img-fluid d-block w-100"
             alt="" />

            <div class="contentAp">
              <span class="title">Mining</span>

              <p class="description">

                GIS is extensively used in mining for exploration, resource assessment, and mine planning. It helps in analyzing spatial data such as geological maps, satellite imagery, and drilling data to identify prospective areas for mineral exploration, assess the quantity and quality of mineral deposits, and optimize mine site selection. Additionally, GIS aids in monitoring environmental impacts, managing land use conflicts,
                and ensuring regulatory compliance throughout the mining lifecycle.




              </p>
            </div>
          </div>

          <div class="custom-slide" data-slide="5">
            <img src="/MilitaryApplication.jpg"
              alt="" />

            <div class="contentAp">
              <span class="title">Defence</span>

              <p class="description">
                GIS in defense enhances situational awareness, operational efficiency, and decision-making capabilities through spatial analysis
                and visualization, crucial for national security.GIS empowers defense operations with precise spatial analysis and real-time visualization, crucial for strategic planning and tactical execution, ensuring national security.

              </p>
            </div>
          </div>

          <div class="custom-slide-btn next">
            <span>&raquo;</span>
          </div>

          <div class="custom-slide-btn prev">
            <span>&laquo;</span>
          </div>
        </div>

        <div id="gallery">
          <div class="thumbnail" data-slide="1">
            <img src="/airbusCard.jpg"
              alt="" />

            <div class="contentAp">
              <span class="title">Mars</span>

              <p class="description">

                GIS on Mars is essential for analyzing spatial data gathered by orbiters and rovers
              </p>
            </div>
          </div>

          <div class="thumbnail" data-slide="2">
            <img src="https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2022/01/MAR-7834-body-image-BP_GIS-in-Agriculture_UPD-Featured-1.jpg"
            className="cara-Img img-fluid d-block w-100"
             alt="" />

            <div class="contentAp">
              <span class="title">Agriculture</span>

              <p class="description">
                GIS revolutionizes agriculture by integrating spatial data to enhance
              </p>
            </div>
          </div>
          <div class="thumbnail" data-slide="3">
            <img src="https://dusp.mit.edu/sites/default/files/styles/large/public/news-images/mekong_delta_noaa.jpg?h=cc083cad&itok=h-8GQQ9w"
            className="cara-Img img-fluid d-block w-100" alt="" />

            <div class="contentAp">
              <span class="title">Water</span>

              <p class="description">
                GIS is pivotal in water resource management, offering a comprehensive toolset for mapping
              </p>
            </div>
          </div>

         

         

          <div class="thumbnail" data-slide="5">
            <img src="/MilitaryApplication.jpg"
            className="cara-Img img-fluid d-block w-100"
              alt="" />

            <div class="contentAp">
              <span class="title">Defence</span>

              <p class="description">
                In defense, GIS serves as a vital tool for spatial intelligence, facilitating the analysis of terrain
              </p>
            </div>
          </div>
          <div class="thumbnail" data-slide="4">
            <img src="https://wp-cdn.apollomapping.com/web_assets/user_uploads/2020/08/06152603/hobart_factory_ge1_50cm-scaled.jpg" className="cara-Img img-fluid d-block w-100" alt="" />

            <div class="contentAp">
              <span class="title">Mining</span>

              <p class="description">
                GIS is indispensable in the mining industry, providing spatial analysis tools for exploration
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="body pb-4">



        <div class="body-1" ref={marsRef}>
          <div>
            <h1>Mars</h1>
            <p>Certainly, the applications of{" "}
            <strong style={{ color: "#93c5c2" }}>MARS </strong>{" "}
            <span style={{ fontStyle: "italic", color: "#93c5c2" }}>
              (Micronet Archival and Retrieval System)
            </span>{" "}
            by Micronet Solutions are wide-ranging and versatile, making it a
            valuable tool for various industries and purposes. These
            applications highlight the versatility and significance of MARS in
            facilitating data-driven decision-making across a broad spectrum of
            industries and sectors. It plays a pivotal role in harnessing the
            potential of satellite technology to address real-world challenges
            and promote sustainable practices..</p>
          </div>
          <aside className="Marsbg">
            <img src="/airbusCard.jpg" />

          </aside>
        </div>

        <div class="body-2" ref={agricultureRef}>
          <aside className="AgriBgborder">
            <img src="https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2022/01/MAR-7834-body-image-BP_GIS-in-Agriculture_UPD-Featured-1.jpg" />

          </aside>
          <div>
            <h1>Agriculture</h1>
            <p> Agriculture is one of the most important industries utilising GIS
              technology. Without it, we wouldn’t have food, clothing, or shelter.
              There are many ways that GIS technology can aid governments and
              farmers. Not only can GIS data identify drought areas, but it can also
              predict pest and rodent attacks, provide a land and soil analysis, and
              even use population data to help governments and farmers plan their
              crops. This vital information can ensure that the farmers plant enough
              crops to sustain the surrounding population.</p>
          </div>

        </div>

       
        <div class="body-5"
         ref={waterRef}
         
        //  ref={defenseRef}
         >
          <div>
            <h1>Water</h1>
            <p> GIS (Geographic Information System) is an essential tool for managing
              water supplies, as it helps to visualize and assess spatial data
              related to water resources. This includes creating detailed maps of
              water treatment plants, reservoirs, pipelines, and distribution
              networks, assessing population density, and other useful data. With
              IGiS, authorities can monitor the performance of the entire water
              system, identify areas with high demand or potential leakage, and
              decide on the best locations for new infrastructure. Additionally,
              IGiS can be used to analyse water supply scenarios like the demand for
              water in a particular area for giving insight to develop effective
              strategies for managing water sources. Ultimately, IGiS plays a major
              role in ensuring the sustainable management of water resources.</p>
          </div>
          <aside className="waterbg">
          <img src="https://dusp.mit.edu/sites/default/files/styles/large/public/news-images/mekong_delta_noaa.jpg?h=cc083cad&itok=h-8GQQ9w" />

            {/* <img src="/MilitaryApplication.jpg" /> */}

          </aside>
        </div>

        <div class="body-3"
        //  ref={waterRef}
        ref={defenseRef}
         >

        <aside className="Defencebg">
           <img src="/MilitaryApplication.jpg" />
            {/* <img src="https://dusp.mit.edu/sites/default/files/styles/large/public/news-images/mekong_delta_noaa.jpg?h=cc083cad&itok=h-8GQQ9w" /> */}

          </aside>
          <div>
            <h1 className="water">Defence</h1>
            <p> GIS is used in defense for strategic planning purposes. Military planners can overlay maps with various layers of information such as terrain data, troop locations, infrastructure, and potential threat areas. By analyzing these spatial relationships, decision-makers can develop strategic plans for deploying forces, establishing defensive positions, and identifying potential areas of vulnerability or risk.</p>

          </div>
         
        </div>


        <div class="body-4" ref={miningRef}>
         
          <div>
            <h1 className="pl-4 Minning">Mining</h1>
            <p>Our innovative and rigorous methodology maximizes your projects’
              economic benefits; by focusing on the deposit within the greater
              mining context, we help you select a suitable mining method and create
              a robust plan for your mine. Our experts recognize the need to
              continuously adapt to commodity price and cost changes with
              appropriate mining operation responses, such as reducing operating
              and/or capital costs when prices fall and increasing capacity when
              prices rise. By producing practical mine designs and schedules, we
              ensure efficient use of mine capital. Taking advantage of
              technological advances in underground mining, we offer highly
              mechanized and automated solutions using software packages such as
              Deswik, Datamine, Gemcom, Vulcan, Minesight, and Mine Works Planner.</p>
          </div>

          <aside className="MiningbgBorder">
            <img src="https://wp-cdn.apollomapping.com/web_assets/user_uploads/2020/08/06152603/hobart_factory_ge1_50cm-scaled.jpg" />

          </aside>

        </div>



        {/* <div class="body-2">
    <div>
    <aside>
      <img src="https://images.unsplash.com/photo-1535941339077-2dd1c7963098?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1956&q=80" />
      
    </aside>
      <h1>World class Craftsmanship</h1>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde similique dignissimos quae omnis ipsum laboriosam sed, minima, animi, accusantium delectus tempore autem sit qui earum dolorum error maxime. Perspiciatis, modi?</p>
    </div>
  </div>  */}

      </div>

      <div>
        <CopyRightFooter />
      </div>
    </div>




  );
};

export default Application;
