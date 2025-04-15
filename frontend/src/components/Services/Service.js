import { React, useEffect, useRef, useState } from "react";
import "./Service.css";
import { motion } from "framer-motion";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
import {
  faSatellite, faLayerGroup, faSatelliteDish, faCamera, faGlobe, faIndustry, faDatabase, faMapMarkedAlt, faCity,
  faLandmark, faHiking, faTree, faClipboardList, faMap, faCompass, faFlask, faGem, faMountain, faServer, faPuzzlePiece, faNetworkWired, faExchangeAlt
  , faLocationArrow, faPlane, faCircleNotch, faVideo, faRoad, faDigitalTachograph, faAddressBook, faDesktop, faProjectDiagram, faArrowLeft, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from "react-router-dom";
const Service = () => {
  // useEffect(() => {
  //   const slider = document.querySelector('.slider');


  //   function activate(e) {
  //     const items = document.querySelectorAll('.item');
  //     e.target.matches('.next') && slider.append(items[0])
  //     e.target.matches('.prev') && slider.prepend(items[items.length-1]);
  //   }
  //   const interval = setInterval(() => {
  //     slider.dispatchEvent(new Event('click', { 'target': { matches: () => true }}));
  //   }, 2000);

  //   document.addEventListener('click', activate, false);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener('click', activate, false);
  //   };
  // }, [])

  useEffect(() => {
    const slider = document.querySelector('.slider');
    let timer; // Variable to store the timer reference

    function activate(e) {
      const items = document.querySelectorAll('.item');
      if (e.target.matches('.next')) {
        slider.append(items[0]);
      } else if (e.target.matches('.prev')) {
        slider.prepend(items[items.length - 1]);
      }

      // Reset the timer when a button is clicked
      clearTimeout(timer);
      startTimer();
    }

    // Initialize the timer when the component mounts
    startTimer();

    // Function to start the timer for automatic slide change
    function startTimer() {
      timer = setTimeout(() => {
        slider.dispatchEvent(new Event('click', { 'target': { matches: () => true } }));
      }, 2000); // Adjust the interval as needed
    }

    // Add event listener for button clicks
    document.addEventListener('click', activate, false);

    // Clean up the event listener and timer when the component unmounts
    return () => {
      document.removeEventListener('click', activate, false);
      clearTimeout(timer);
    };
  }, []);





  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };


  const serviceRef = useRef(null)

  const location = useLocation();

  const stateData = location.state?.someData;

  useEffect(() => {

    const scrollOptions = { behavior: 'smooth', block: 'center' };

    switch (stateData) {
      case 'GIS':
        if (serviceRef.current) {
          handleTabClick('tab2')
          serviceRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'Digital Photogrammetr':
        if (serviceRef.current) {
          serviceRef.current.scrollIntoView(scrollOptions);
          handleTabClick('tab1')
        }
        break;
      case '3D Modelling':
        if (serviceRef.current) {
          handleTabClick('tab3')
          serviceRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'Digitalization':
        if (serviceRef.current) {
          handleTabClick('tab4')
          serviceRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'Image Processing':
        if (serviceRef.current) {
          handleTabClick('tab5')
          serviceRef.current.scrollIntoView(scrollOptions);
        }
        break;
      case 'water':
        if (serviceRef.current) {
          serviceRef.current.scrollIntoView(scrollOptions);
        }
        break;
      default:
        break;
    }
  }, [stateData]);



  return (
    <div className=" ServiceMain">
      <main>
        <ul class='slider'>
          <li class='item' style={{ backgroundImage: `url(https://www.accucities.com/wp-content/uploads/2017/AccuCities-3D-London-subscription-upgraded-with-textures.gif)` }}>
            <div class='contentsOfServices'>
              <h2 class='title'>" 3D  Modelling"</h2>
              <p class='descriptions'> In GIS, 3D modeling is crucial for visualizing and analyzing geographical features and landscapes in three dimensions, enabling better understanding and decision-making.  </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
          <li class='item' style={{ backgroundImage: `url(/serv6.jpg)` }}>
            <div class='contentsOfServices'>
              <h2 class='title'>"Satellite Image Processing"</h2>
              <p class='descriptions'> Satellite image processing plays a pivotal role in
                extracting valuable insights from vast amounts of spatial data, enabling informed
                decision-making across various domains.   </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
          <li class='item' style={{ backgroundImage: `url(https://www.esri.com/arcgis-blog/wp-content/uploads/2023/01/S2LCX_StepAnimate.gif)`, backgroundSize: "2391px" }}>
            <div class='contentsOfServices'>
              <h2 class='title'>"Land Use Land Cover Mapping"</h2>
              <p class='descriptions'>
                Land use land cover mapping involves
                integration of remote sensing data, spatial analysis techniques, and geographic information to classify and depict different
                land cover types   </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
          <li class='item' style={{ backgroundImage: `url(https://www.esri.com/about/newsroom/wp-content/uploads/2019/12/mountainpasslitho-card.jpg)` }}>
            <div class='contentsOfServices'>
              <h2 class='title'>"Mineral Exploration"</h2>
              <p class='descriptions'>
                Mineral exploration involves utilization of spatial data , geological information and remote sensing imagery to identify potential mineral deposits and delineate exploration
              </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
          <li class='item' style={{ backgroundImage: `url(https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2016/12/agricultural_monitoring_in_spain/16580115-1-eng-GB/Agricultural_monitoring_in_Spain.gif)` }}>
            <div class='contentsOfServices'>
              <h2 class='title'>"agricultural monitoring"</h2>
              <p class='descriptions'>
                Agricultural monitoring in GIS entails the use of satellite imagery, spatial analysis, and geographic data to assess crop health, monitor land use changes, and optimize agricultural practices.
              </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
          <li class='item' style={{ backgroundImage: `url(https://static.wixstatic.com/media/3ef7b8_95b3a70ee5f943b48fd16dad5f850534~mv2.jpg/v1/fill/w_1000,h_556,al_c,q_90/3ef7b8_95b3a70ee5f943b48fd16dad5f850534~mv2.jpg)` }}>
            <div class='contentsOfServices'>
              <h2 class='title'>"Aerial surveys"</h2>
              <p class='descriptions'>
                Aerial surveys in GIS involve the collection of high-resolution imagery or LiDAR data from aircraft to capture detailed information about the Earth's surface.  </p>
              {/* <button>Read More</button> */}
            </div>
          </li>
        </ul>
        <nav class='navser'>
          <ion-icon class='btnser prev' name="arrow-back-outline"><FontAwesomeIcon icon={faArrowLeft} className="prev" /></ion-icon>
          <ion-icon class='btnser next' name="arrow-forward-outline"><FontAwesomeIcon icon={faArrowRight} className="next" /></ion-icon>
        </nav>
      </main>
      {/* servive */}
      <div class="dd_heading">
        <p class='text2'>Professional Services Offered</p>
        {/* <h2 class="text-center">Card Design</h2>
<h3 class="text-center">Designed by : <strong>Dhruval Desai</strong></h3> */}
      </div>
      <div class="page-content">
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">
            <h2 class="heading"> Image Analysis</h2>
            <i class="bi bi-key-fill"><FontAwesomeIcon icon={faCamera} /></i>
            {/* <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={faSatellite} className=" fontOfSate" />Satellite Image Processing</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faLayerGroup} className="  fontOfSate" />GCP Survey and Library Creation</li>
        </ul> */}
            {/* <p class="data-content">image analysis refers to the process of analyzing  </p> */}
          </div>
        </div>
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">

            <h2 class="heading">Natural Resources</h2>
            <i class="bi bi-hdd-network-fill"><FontAwesomeIcon icon={faGlobe} /></i>

            {/* <p class="data-content"> It involves using geospatial data 
       </p> */}
          </div>
        </div>
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">

            <h2 class="heading">  Mineral Exploration </h2>
            <i class="bi bi-camera2"><FontAwesomeIcon icon={faIndustry} /></i>
            {/* <p class="data-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p> */}
          </div>
        </div>
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">

            <h2 class="heading"> Spatial Database</h2>
            <i class="bi bi-brush-fill"> <FontAwesomeIcon icon={faDatabase} /></i>
            {/* <p class="data-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p> */}
          </div>
        </div>
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">

            <h2 class="heading"> Topographical</h2>
            <i class="bi bi-envelope-fill"><FontAwesomeIcon icon={faMapMarkedAlt} /></i>

            {/* <p class="data-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p> */}
          </div>
        </div>
        <div class="d_card">
          {/* <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div> */}
          <div class="contentNew">
            <h2 class="heading"> Urban Mapping</h2>
            <i class="bi bi-people-fill"><FontAwesomeIcon icon={faCity} /></i>
            {/* <p class="data-content">Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p> */}
          </div>
        </div>
      </div>

      {/* end services */}
      {/* <div class="services-container">

<p class='text2'>Professional Services Offered</p>



  <div id="services-top-row">

    <div class="services-glass-card">
    <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>

      

      <div class="service-card-info">

        <i class="bi bi-key-fill"><FontAwesomeIcon icon={ faCamera}  /></i>

        <h2>
        Image Analysis
        </h2>
        <br></br>
        <br></br>
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={faSatellite} className="mr-3 fontOfSate" />Satellite Image Processing</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faLayerGroup} className="mr-3  fontOfSate" />GCP Survey and Library Creation</li>
        </ul>

        

      </div>

      <div class="service-card-video">

        <div class="tool-tip-container">

          

        </div>
        <figure class="effect-ming">
          <img src="sate.png" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
        
      </div>

    </div>

    <div class="services-glass-card">
    <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>

    

      <div class="service-card-info">

        <i class="bi bi-hdd-network-fill"><FontAwesomeIcon icon={faGlobe }  /></i>

        <h2>
        Natural Resources <br></br> Management
        </h2>
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={ faLandmark} className="mr-3 fontOfSate" />Land Use Land Cover Mapping</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={ faTree} className="mr-3  fontOfSate" />Forestry Mapping</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={ faClipboardList} className="mr-3  fontOfSate" />Resource Inventory</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faMap} className="mr-3  fontOfSate" />Environmental Impact Assessment  </li>
        </ul>
        
      </div>

      <div class="service-card-video">
        <div class="tool-tip-container">

        

        </div>
        <figure class="effect-ming">
          <img src="natural.jpeg" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
      </div>

    </div>

    <div class="services-glass-card">
    <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>
     

      <div class="service-card-info">

        <i class="bi bi-camera2"><FontAwesomeIcon icon={ faIndustry}  /></i>

        <h2>
       
        Mineral Exploration 
        </h2>
        <br></br>
       
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={faCompass} className="mr-3 fontOfSate" />Geological Mapping</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faFlask} className="mr-3  fontOfSate" />Geo chemical Survey</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faMountain} className="mr-3  fontOfSate" />Heavy mineral separation</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faGem} className="mr-3  fontOfSate" />Exploration for Gold & Diamond</li>
        </ul>
      
       
      </div>

      <div class="service-card-video">
        <div class="tool-tip-container">

         

        </div>
        <figure class="effect-ming">
          <img src="mineral.jpg" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
       
      </div>

    </div>

  </div>

  <div id="services-bottom-row">

    <div class="services-glass-card">

      <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>

      <div class="service-card-info">

        <i class="bi bi-brush-fill"> <FontAwesomeIcon icon={faDatabase }  /></i>

        <h2>
        Spatial Database <br></br> Creation
        </h2>
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={faServer} className="mr-3 fontOfSate" />ORACLE SPATIAL, SQL & SPATIAL</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faPuzzlePiece} className="mr-3  fontOfSate" />3D Visualization and Modeling</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faNetworkWired} className="mr-3  fontOfSate" />Seamless Country Level Database</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faExchangeAlt} className="mr-3  fontOfSate" />Integrated Information Systems </li>
          
        </ul>
       

      </div>

      <div class="service-card-video">
        <div class="tool-tip-container">

        

        </div>
        <figure class="effect-ming">
          <img src="database.jpg" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
      </div>

    </div>

    <div class="services-glass-card">

      <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>

      <div class="service-card-info">

        <i class="bi bi-envelope-fill"><FontAwesomeIcon icon={faMapMarkedAlt}  /></i>

        <h2>
        Topographical <br></br> Surveys
        </h2>
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={ faLocationArrow} className="mr-3 fontOfSate" />GPS & Total Station Surveys</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={ faPlane} className="mr-3  fontOfSate" />Aerial surveys</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faVideo} className="mr-3  fontOfSate" />360 degree panoramic video mapping</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faRoad} className="mr-3  fontOfSate" />Utilities Mapping </li>
         
        </ul>
      

      </div>

      <div class="service-card-video">
        <div class="tool-tip-container">

         

        </div>
        <figure class="effect-ming">
          <img src="topo.jpg" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
      </div>

    </div>

    <div class="services-glass-card">

      <div class="gear-container">
        <div class="arrow-placeholder"></div>
        <div class="arrow-circle"></div>
        <div class="gear">
          <div class="tooth-1"></div>
          <div class="tooth-2"></div>
          <div class="tooth-3"></div>
          <div class="tooth-4"></div>
          <div class="tooth-5"></div>
          <div class="tooth-6"></div>
          <div class="tooth-7"></div>
          <div class="tooth-8"></div>
          <div class="tooth-9"></div>
          <div class="tooth-10"></div>
          <div class="tooth-11"></div>
          <div class="tooth-12"></div>
        </div>
      </div>

      <div class="service-card-info">

        <i class="bi bi-people-fill"><FontAwesomeIcon icon={ faCity}  /></i>
       
        <h2>
        Urban Mapping & <br></br> GIS
        </h2>
        <ul className="ListOfImgPro">
          <li className="List_1_2"><FontAwesomeIcon icon={faDigitalTachograph} className="mr-3 fontOfSate" />Digital Door Numbering</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={ faAddressBook} className="mr-3  fontOfSate" />Detailed Contact Survey</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={faDesktop} className="mr-3  fontOfSate" />Customized GIS Applications</li>
          <li className="List_1_2"> <FontAwesomeIcon icon={ faProjectDiagram} className="mr-3  fontOfSate" />Comprehensive GIS Developmen </li>
        
        </ul>
       

      </div>

      <div class="service-card-video">
        <div class="tool-tip-container">

          

        </div>
        <figure class="effect-ming">
          <img src="urban.png" alt="img09" class="img-fluids" />
          <figcaption>
            <p>VIEW PAGE</p>
            <a href="/security/access-control" rel="noopener">View more</a>
          </figcaption>
        </figure>
      
      </div>

    </div>

  </div>

</div> */}

      <div class="bg-section" id="service" ref={serviceRef}>
        <div class="sectionh1">
          <h1 className="text2">Services</h1>
          <hr class="hrh1" />
        </div>
        <div class="container-fluid">
          <div class="row slideanim Serviceslide mb-4">
            <div class="tabpanel" role="tabpanel">
              <div class="col-md-3 col-sm-12">
                <ul class="nav d-block nav-pills brand-pills nav-stacked" role="tablist" style={{ marginTop: "0px", color: "blue" }}>
                  <li role="presentation" className={`brand-nav ${activeTab === 'tab1' ? 'active' : ''}`}><a href="#tab1" aria-controls="tab1" role="tab" data-toggle="tab" aria-expanded="false" onClick={() => handleTabClick('tab1')}>Photogrammetry Services</a></li>
                  <li role="presentation" className={`brand-nav ${activeTab === 'tab2' ? 'active' : ''}`}><a href="#tab2" aria-controls="tab2" role="tab" data-toggle="tab" aria-expanded="false" onClick={() => handleTabClick('tab2')}>Geological Mapping</a></li>
                  <li role="presentation" className={`brand-nav ${activeTab === 'tab3' ? 'active' : ''}`}><a href="#tab3" aria-controls="tab3" role="tab" data-toggle="tab" aria-expanded="false" onClick={() => handleTabClick('tab3')}>3D Visualization and Modeling</a></li>
                  <li role="presentation" className={`brand-nav ${activeTab === 'tab4' ? 'active' : ''}`}><a href="#tab4" aria-controls="tab4" role="tab" data-toggle="tab" aria-expanded="false" onClick={() => handleTabClick('tab4')}>Aerial surveys</a></li>

                  <li role="presentation" className={`brand-nav ${activeTab === 'tab5' ? 'active' : ''}`}><a href="#tab5" aria-controls="tab5" role="tab" data-toggle="tab" aria-expanded="false" onClick={() => handleTabClick('tab5')}>Image Processing</a></li>
                </ul>
              </div>
              <div class="col-md-9 col-sm-12" >
                <div class="tab-content mb-4" >
                  <div role="tabpanel" class={`tab-pane slideanimleft slideleft  ${activeTab === 'tab1' ? 'active' : ''}`} id="tab1" >
                    <h3 class="laws">Photogrammetry Services</h3>
                    <hr class="laws-hr" />
                    <p className="Servicep">
                      Photogrammetry services involve the use of aerial or terrestrial imagery to generate accurate 3D models, maps, and measurements of objects, terrain, or structures. This technology relies on the principles of triangulation and stereoscopic vision to extract spatial information from overlapping photographs. In aerial photogrammetry, images are typically captured using drones, aircraft, or satellites, while terrestrial photogrammetry involves capturing images from ground-based platforms. These images are processed using specialized software to reconstruct 3D models and maps, leveraging features such as tie points, keypoints, and image matching algorithms to align and stitch together the images.
                    </p>
                    <p className="Servicep">
                      One of the primary applications of photogrammetry services is in the fields of surveying, mapping, and cartography. By utilizing photogrammetric techniques, surveyors and cartographers can create highly accurate and detailed maps of terrain, land cover, and infrastructure. These maps are invaluable for urban planning, land management, environmental monitoring, and infrastructure development projects. Additionally, photogrammetry services are widely used in industries such as agriculture, forestry, and archaeology, where accurate spatial information is essential for decision-making and analysis.
                    </p>
                  </div>
                  <div role="tabpanel" class={`tab-pane slideanimleft slideleft  ${activeTab === 'tab2' ? 'active' : ''}`} id="tab2">
                    <h3 class="laws">Geological Mapping</h3>
                    <hr class="laws-hr" />
                    <p className="Servicep">
                      Once field data is collected, it is analyzed and interpreted to delineate different geological units and structures. Geologists use a combination of field observations, geological principles, and supplementary data such as aerial imagery, satellite data, and geophysical surveys to refine their understanding of the geological context. This information is then synthesized to produce geological maps, which visually represent the spatial distribution of geological units, faults, folds, and other significant features. These maps are essential tools for understanding the geological history and resources of an area, aiding in mineral exploration, land-use planning, environmental management, and hazard assessment.
                    </p>
                    <p className="Servicep">
                      Geological mapping plays a crucial role in various scientific, economic, and environmental applications. In addition to providing valuable insights into the Earth's history and evolution, geological maps serve as essential tools for resource exploration and exploitation. By identifying potential mineral deposits, groundwater resources, and geological hazards, these maps inform decision-making processes in industries such as mining, energy extraction, and infrastructure development. Furthermore, geological maps are vital for land-use planning and environmental conservation, helping to mitigate risks associated with geological hazards such as landslides, earthquakes, and groundwater contamination.
                    </p>
                  </div>
                  <div role="tabpanel"class={`tab-pane slideanimleft slideleft  ${activeTab === 'tab3' ? 'active' : ''}`}id="tab3">
                    <h3 class="laws">3D Visualization and Modeling</h3>
                    <hr class="laws-hr" />
                    <p className="Servicep">
                      3D visualization and modeling is a powerful technique used to create immersive representations of objects, landscapes, and environments within a digital space. Beginning with data acquisition from sources like aerial surveys, LiDAR scans, or satellite imagery, this process involves meticulously processing and converting the data into a format compatible with 3D modeling software. Once the foundational data is prepared, the actual modeling phase commences, where specialized software is employed to construct digital replicas of physical entities. From buildings to natural terrains, these models are sculpted with varying degrees of complexity to accurately reflect their real-world counterparts.
                    </p>
                    <p className="Servicep">
                      Texture mapping enhances the realism of these 3D models by applying textures derived from photographs or other sources onto their surfaces. Lighting and rendering further contribute to creating lifelike visualizations, with intricate calculations simulating the interaction of light with the model's surfaces. This ensures that shadows, reflections, and other lighting effects accurately mimic those found in reality. Additionally, animation and interactive features can be incorporated into the models, allowing for dynamic simulations and user engagement, enabling exploration from different viewpoints and angles.
                    </p>
                  </div>

                  <div role="tabpanel" class={`tab-pane slideanimleft slideleft  ${activeTab === 'tab4' ? 'active' : ''}`} id="tab4">
                    <h3 class="laws">Aerial surveys</h3>
                    <hr class="laws-hr" />
                    <p className="Servicep">

                      Aerial survey in GIS, or Geographic Information Systems, involves using aerial imagery or data collected from aircraft or satellites to gather information about the Earth's surface. This data is then processed and analyzed within GIS software to create maps, models, and other spatial representations.
                    </p>
                    <p>
                      Aerial surveys can capture various types of information such as land cover, terrain elevation, infrastructure, vegetation health, and more. They are used in various fields including urban planning, agriculture, environmental monitoring, disaster management, and natural resource management.
                    </p>
                    <p className="Servicep">
                      By integrating aerial survey data into GIS, analysts can visualize spatial patterns, detect changes over time, and make informed decisions based on accurate geospatial information. This helps organizations and governments to better understand their surroundings and plan accordingly.
                    </p>
                  </div>

                  <div role="tabpanel" class={`tab-pane slideanimleft slideleft  ${activeTab === 'tab5' ? 'active' : ''}`} id="tab5">
                    <h3 class="laws">Image Processing</h3>
                    <hr class="laws-hr" />
                    <p className="Servicep">

                      Digital image processing is the use of a digital computer to process digital images through an algorithm. As a subcategory or field of digital signal processing, digital image processing has many advantages over analog image processing.                    </p>
                    <p>
                      It allows a much wider range of algorithms to be applied to the input data and can avoid problems such as the build-up of noise and distortion during processing. Since images are defined over two dimensions (perhaps more) digital image processing may be modeled in the form of multidimensional systems.                    </p>
                    <p className="Servicep">
                      The generation and development of digital image processing are mainly affected by three factors: first, the development of computers; second, the development of mathematics (especially the creation and improvement of discrete mathematics theory); third, the demand for a wide range of applications in environment, agriculture, military, industry and medical science has increased.                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>



      <div>


        <CopyRightFooter />
      </div>
    </div>
    //   <div className="mt-5 ServiceMain">

    //     <motion.h1
    //       initial={{ y: "-20%" }} // Initial position (left side)
    //       animate={{ y: 0 }}      // Target position (center)
    //       transition={{ duration: 1, delay: 1 }}
    //       className="HeadingOfServices ml-5 text-center">Professional Services Offered</motion.h1>


    //     <div className="row Services justify-content-around">

    //       <motion.div
    //         initial={{ x: "-100%" }} // Initial position (left side)
    //         animate={{ x: 0 }}      // Target position (center)
    //         transition={{ duration: 1, delay: 1 }} // Transition duration
    //         className="col-4  " style={{ marginLeft: "" }}>

    //         <h3 className="serviceHeading">Image Analysis</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices"> Satellite Image Processing</li>
    //           <li className="ListOfServices"> GCP Survey and Library Creation</li>
    //         </ul>
    //         {/* 2nd */}
    //         <h3 className="serviceHeading">Natural Resources Management</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">Land Use Land Cover Mapping</li>
    //           <li className="ListOfServices"> Forestry Mapping</li>
    //           <li className="ListOfServices"> Resource Inventory</li>
    //           <li className="ListOfServices">Environmental Impact Assessment Studies</li>
    //         </ul>
    //         {/* 3rd */}
    //         <h3 className="serviceHeading">Mineral Exploration</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">Geological Mapping</li>
    //           <li className="ListOfServices">Geo chemical Survey</li>
    //           <li className="ListOfServices">Heavy mineral separation</li>
    //           <li className="ListOfServices">Exploration for Gold & Diamond </li>
    //         </ul>
    //         {/* 4th */}
    //         <h3 className="serviceHeading">Spatial Database Creation</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">ORACLE SPATIAL, SQL & SPATIAL</li>
    //           <li className="ListOfServices">3D Visualization and Modeling</li>
    //           <li className="ListOfServices">Seamless Country Level Database Development</li>
    //           <li className="ListOfServices">Integrated Information Systems Development</li>
    //           <li className="ListOfServices">SDI Portal Creation and maintenance</li>
    //         </ul>
    //         {/* 4th */}
    //         <h3 className="serviceHeading">Urban Mapping & GIS</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">Mapping using UAV Photo/Sat Images</li>
    //           <li className="ListOfServices">Municipal Mapping, Property Tax Mapping</li>
    //           <li className="ListOfServices">Digital Door Numbering</li>
    //           <li className="ListOfServices">Detailed Contact Surveys</li>
    //           <li className="ListOfServices">Comprehensive GIS Development</li>
    //           <li className="ListOfServices">Customized GIS Applications</li>
    //         </ul>
    //       </motion.div>


    //       <motion.div
    //         initial={{ x: "200%" }} // Initial position (left side)
    //         animate={{ x: 0 }}      // Target position (center)
    //         transition={{ duration: 1, delay: 1 }} // Transition duration
    //         className="col-4 RightServices ">
    //         {/* <h1 className="ml-auto">hello</h1> */}
    //         <h3 className="serviceHeading">Topographical Surveys</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices" >GPS & Total Station Surveys</li>
    //           <li className="ListOfServices">Aerial surveys</li>
    //           <li className="ListOfServices">360 degree panoramic video mapping</li>
    //           <li className="ListOfServices">Utilities Mapping</li>
    //           <li className="ListOfServices">Site Investigations</li>
    //           <li className="ListOfServices">Alignment Surveys</li>
    //         </ul>
    //         {/* 2nd */}
    //         <h3 className="serviceHeading">Cadastral Surveys</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">Computerization of Land Records</li>
    //           <li className="ListOfServices">Survey of Land Holdings </li>
    //           <li className="ListOfServices">Total Station/GPS/Drone/Manned Aerial</li>
    //           <li className="ListOfServices">Preparation of Village / Regional Maps</li>
    //         </ul>
    //         {/* 3rd */}
    //         <h3 className="serviceHeading">Photogrammetry Services</h3>

    //         <ul class="my-4">
    //           <li className="ListOfServices">Aerial Data Capture Manned/Unmanned</li>
    //           <li className="ListOfServices">Aerial triangulation</li>
    //           <li className="ListOfServices">Orthophoto generation</li>
    //           <li className="ListOfServices">DEM / DTM</li>
    //           <li className="ListOfServices">Contouring</li>
    //           <li className="ListOfServices">2D & 3D mapping</li>
    //           <li className="ListOfServices">3D City Modelling</li>
    //           <li className="ListOfServices">Custom Software Development for 3D Cities</li>
    //           <li className="ListOfServices">Smart City Solutions</li>
    //           <li className="ListOfServices"> ERP integrated GIS Services</li>
    //           <li className="ListOfServices">Telecom ERP solutions</li>
    //           <li className="ListOfServices">Electrical ERP solutions</li>
    //           <li className="ListOfServices">Water ERP Solutions and services</li>
    //         </ul>
    //         {/* 4th */}
    //       </motion.div>
    //     </div>
    //         <div>
    //           <CopyRightFooter />
    //       </div>
    // </div>
  );
};

export default Service;
