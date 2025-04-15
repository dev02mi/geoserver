// UnderConstruction.js
import React, { useState, useEffect } from 'react';
import './Retrival.css';
import Card from "react-bootstrap/Card";
import { motion } from "framer-motion";

const Retrival = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a few seconds (you can adjust the timing)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  return (
      <div className="">
        <div className="">
          <motion.div
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
          </motion.div>
          <div className="row mx-auto my-auto CardView" >
            <motion.div
              animate={{ x: 20, scale: 1 }}
              initial={{ scale: 0 }}
              transition={{ delay: 1 }}
              className="col" style={{display:'flex',justifyContent:'center'}}>
              <Card style={{ width: "40rem" }}>
                <div className="row  m-0 text-center py-5 fw-bold Retrieval-card-header">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    <img src="Retrival_logo.png" class="Retrival-logo" />
                    <h1 className="RetrievalCardText">Retrieval</h1>
                  </div>
                </div>
                {/* <Card.Img variant="top" src="Contactus1.jpg" /> */}
                <Card.Body className="cardFashion">
                  {/* <Card.Title>Card Title</Card.Title> */}
                  <Card.Text className="ApplicationText">
                    "MARS Retrieval" involves the efficient and user-friendly
                    process of accessing specific satellite data from the Micronet
                    Archival and Retrieval System. Users can search, retrieve, and
                    utilize historical and real-time satellite imagery and related
                    information for a wide range of applications.
                  </Card.Text>
                  {/* <Button variant="primary">Go somewhere</Button> */}
                </Card.Body>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default Retrival;
