import React, { useState, useEffect, useRef } from "react";
import HeaderImage from "../../asset/navImage/Geopicx_banner_new.jpg";
import "./Header.css";

const Header = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleMouseEnters = () => {
    setIsHovered(true);
  };

  const handleMouseLeaves = () => {
    setIsHovered(false);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div
      className="image pl-3 responsive-background img-fluid"
      style={{
        background: `url(${HeaderImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width:"100%",
        position: "relative",
        // height:"auto",
        backgroundRepeat: "no-repeat",
        /* background-repeat: no-repeat; */
      }}
    >
      <img src="GEOPICX_LOGO.png" alt="Site Logo" width="40" height="40" />
      <h1 className="GeopicsHeading">GeoPicX</h1>
      <h4 className="text-geopicx">
        Geographic Picture (Data) Extended Analysis
      </h4>
      <div className="d-flex align-items-end justify-contend-end">
        <span
          className={`LogoOfMicronet ${isHovered ? "active" : ""}`}
          onMouseEnter={handleMouseEnters}
          onMouseLeave={handleMouseLeaves}
        >
          <img
            src="MSOLU_10K.png"
            alt="Site Logo"
            className="LogoMicronet W-25 H-25"
          />
          {isHovered && (
            <div className="header-micronet-popup">
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
    </div>
  );
};

export default Header;
