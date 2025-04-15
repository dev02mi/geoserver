// UnderConstruction.js
import React, { useState, useEffect } from "react";
import "./MarsHome.css";
import Card from "react-bootstrap/Card";
import { motion } from "framer-motion";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
const MarsHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a few seconds (you can adjust the timing)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="MarsHome">
      <div className="">
        <section class="section-one">
          <div class="container Mars">
            <h1 className="Headingforamars">
            <img
           
            src="/MARS_LOGO.png" // Dynamic alt text for accessibility
            className="nav-logo pb-2 "
            width="30px"
            // height="30px"
          
           
            style={{ marginRight: "5px" }} 
          />MARS</h1>
            
            <p className="paraforamars">  Certainly, the applications of{" "}
              <strong style={{ color: "#93c5c2" }}>MARS </strong>
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
            <a href="" class="home-button">Read More</a>
          </div>
        </section>
        {/* <motion.div
          animate={{ x: 0.1, scale: 1 }}
          initial={{ scale: 0 }}
          transition={{ delay: 1 }}
          className="Application-main-content mt-1">
          <h4 className="mt-5 px-auto ApplicationTextTitle">
            Certainly, the applications of{" "}
            <strong style={{ color: "crimson" }}>MARS </strong>{" "}
            <span style={{ fontStyle: "italic", color: "crimson" }}>
              (Micronet Archival and Retrieval System)
            </span>{" "}
            by Micronet Solutions are wide-ranging and versatile, making it a
            valuable tool for various industries and purposes. These
            applications highlight the versatility and significance of MARS in
            facilitating data-driven decision-making across a broad spectrum of
            industries and sectors. It plays a pivotal role in harnessing the
            potential of satellite technology to address real-world challenges
            and promote sustainable practices.
          </h4>
        </motion.div> */}
        {/* <div className="row mx-auto my-auto CardView">
          <motion.div
            animate={{ x: 20, scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ delay: 1 }} className="col ml-5">
            <Card style={{ width: "40rem" }}>
              <div className="row m-0 text-center py-5 fw-bold Archival-card-header">
                <div className="col-md-2"></div>
                <div className="col-md-8 ">
                  <img src="Archival_logo.png" class="Archival-logo" />
                  <h1 className="ArchivalCardText">Archival</h1>
                </div>
              </div>
              
              <Card.Body className="cardFashion">
               
                <Card.Text className="ApplicationText">
                  "MARS Archival" refers to the systematic collection, storage,
                  and preservation of data within the Micronet Archival and
                  Retrieval System. MARS Archival is essential for maintaining a
                  comprehensive and accessible repository of satellite data.
                </Card.Text>
                
              </Card.Body>
            </Card>
          </motion.div>

          <motion.div
            animate={{ x: 20, scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ delay: 1 }}
            className="col">
            <Card style={{ width: "40rem" }}>
              <div className="row  m-0 text-center py-5 fw-bold Retrieval-card-header">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                  <img src="Retrival_logo.png" class="Retrival-logo" />
                  <h1 className="RetrievalCardText">Retrieval</h1>
                </div>
              </div>
             
              <Card.Body className="cardFashion">
               
                <Card.Text className="ApplicationText">
                  "MARS Retrieval" involves the efficient and user-friendly
                  process of accessing specific satellite data from the Micronet
                  Archival and Retrieval System. Users can search, retrieve, and
                  utilize historical and real-time satellite imagery and related
                  information for a wide range of applications.
                </Card.Text>
                
              </Card.Body>
            </Card>
          </motion.div>
          <motion.div
            animate={{ x: 20, scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ delay: 1 }}
            className="col">
            <Card style={{ width: "40rem" }}>
              <div className="row m-0 text-center py-5 fw-bold Search-card-header">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                  <img src="Search_logo.png" class="Search-logo" />
                  <h1 className="SearchCardText">Search</h1>
                </div>
              </div>
             
              <Card.Body className="cardFashion">
               
                <Card.Text className="ApplicationText">
                  "MARS Search" is the user-friendly feature of the Micronet
                  Archival and Retrieval System (MARS) that enables users to
                  locate specific satellite data quickly and efficiently. Users
                  can input criteria such as date, location, or data type to
                  pinpoint the exact information they need from the extensive
                  satellite data archives.
                </Card.Text>
               
              </Card.Body>
            </Card>
          </motion.div>
        </div> */}



        {/* <p class="p-4 m-4">The lower version uses 3 columns instead of 4</p> */}
        <div className="CardOfmars">
          <div class="container ">
            <div class="row gy-4 my-5">


              <div class="col-lg-4 col-md-4 col-sm-6 sm-mb-3 col-12">
                <div class="flip-card">
                  <div class="flip-card-inner">

                    <div class="flip-card-front sm-my-5">
                      <img src="https://manual.giscloud.com/wp-content/uploads/2020/07/gis1.gif" alt="Random Image" class="img-fluid w-100 h-100" />
                      <div class="flip-text">Archival</div>
                    </div>

                    <div class="flip-card-back">
                      <div class="content-container">
                        <h5>MARS Archival</h5>
                        <p>"MARS Archival" refers to the systematic collection, storage,
                          and preservation of data within the Micronet Archival and
                          Retrieval System. MARS Archival is essential for maintaining a
                          comprehensive and accessible repository of satellite data.</p>
                        {/* <p> Rump sirloin andouille, brisket tri-tip shoulder capicola pork loin kevin short loin t-bone corned beef. Cow turducken jerky short loin tail buffalo tenderloin kevin drumstick porchetta cupim pastrami chuck chislic.</p> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div class="col-lg-4 col-md-4  col-sm-6 sm-mb-3  col-12">
                <div class="flip-card">
                  <div class="flip-card-inner">

                    <div class="flip-card-front sm-my-5">
                      <img src="https://mgtechsoft.com/wp-content/uploads/2023/01/Rectangle-169-25.png" alt="Random Image" class="img-fluid w-100 h-100" />
                      <div class="flip-text">Retrieval</div>
                    </div>

                    <div class="flip-card-back">
                      <div class="content-container">
                        <h5>MARS Retrieval</h5>
                        <p>"MARS Retrieval" involves the efficient and user-friendly
                          process of accessing specific satellite data from the Micronet
                          Archival and Retrieval System. Users can search, retrieve, and
                          utilize historical and real-time satellite imagery and related
                          information for a wide range of applications.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div class="col-lg-4 col-md-4  col-sm-6 sm-mb-3 col-12">
                <div class="flip-card">
                  <div class="flip-card-inner sm-mt-5">

                    <div class="flip-card-front ">
                      <img src="https://raw.githubusercontent.com/wiki/domlysz/blenderGIS/Blender28x/gif/bgis_demo_delaunay.gif" alt="Random Image" class="img-fluid w-100 h-100" />
                      <div class="flip-text"> Search</div>
                    </div>

                    <div class="flip-card-back">
                      <div class="content-container">
                        <h5>MARS Search</h5>
                        <p>"MARS Search" is the user-friendly feature of the Micronet
                          Archival and Retrieval System (MARS) that enables users to
                          locate specific satellite data quickly and efficiently. Users
                          can input criteria such as date, location, or data type to
                          pinpoint the exact information they need from the extensive
                          satellite data archives.</p>
                      </div>
                    </div>
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
  );
};

export default MarsHome;
