import React from "react";
import "./Space.css";

const Space= () => {
  return (
    <div className="SpaceHome mx-5">
      <div className="AgriCulTop">
        <div className="headingingOfAgri Text-Center">
          <div className="HeadingForDefence p-0">
            <p className="titleOfdefemce">Defence And Home</p>
          </div>
          <div className="headingingOfAgri">
            <img
              src="DefenceBanner.jpg"
              alt=""
              className="BannerOfDefence"
            ></img>
          </div>
          <div className="mx-5 mt-4">
            <p className=" ParaForAgri">
              Satellite imagery is crucial in both defense and space
              exploration. In defense, it provides critical intelligence for
              monitoring threats, assessing terrain, and planning strategic
              operations. Military forces rely on real-time, high-resolution
              satellite images to enhance situational awareness and execute
              precise maneuvers. In space exploration, these images play a key
              role in observing celestial bodies, mapping planetary surfaces,
              and conducting scientific research. The integration of satellite
              technology with defense and space efforts is essential for
              advancing national security and expanding our understanding of the
              cosmos
            </p>
          </div>

          <div>
           
            
            
            <div class="row mx-auto">
             
             
            </div>
            <p className="HeadingOfSpace text-left">SPACE</p>
            <div class="row mx-auto">
              
              
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center  HeadingOfCardDefence">
                    Space Traffic Management
                  </p>
                  <img
                    className="Dimg"
                    src="defence6.png"
                    alt="Photo of sunset"
                  />

                  <p class="cards-texts">
                    Satellite images assist in monitoring and managing space
                    debris and the position of satellites in Earth's orbit,
                    helping prevent collisions and ensure the sustainability of
                    space activities.
                  </p>
                </div>
              </div>
           
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Space;
