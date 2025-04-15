import React from "react";
import "./Defence.css";

const Defence = () => {
  return (
    <div className="DefenceHome mx-5">
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
           
            <p className="HeadingOfdefemce text-left">DEFENCE</p>
            <div class="row mx-auto">
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center HeadingOfCardDefence">
                    Surveillance and Reconnaissance
                  </p>
                  <img
                    className="Dimg"
                    src="defence1.png"
                    alt="Photo of sunset"
                  />
                  <div>
                    <p class="cards-texts">
                      Satellites provide real-time, high-resolution imagery for
                      military intelligence, allowing for continuous
                      surveillance of potential threats and monitoring
                      activities in specific regions .
                    </p>{" "}
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center  HeadingOfCardDefence">
                   Military Strategic Planning
                  </p>
                  <img
                    className="Dimg"
                    src="Defence2.png"
                    alt="Photo of sunset"
                  />
                  <div>
                    <p class="cards-texts">
                      Military forces use satellite images to analyze terrain,
                      infrastructure, and enemy positions, aiding in strategic
                      planning and decision-making.
                    </p>{" "}
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center  HeadingOfCardDefence">
                    Strategic Planning
                  </p>
                  <img
                    className="Dimg"
                    src="defence3.png"
                    alt="Photo of sunset"
                  />

                  <p class="cards-texts">
                    Satellite images are instrumental in disaster management,
                    helping military forces respond quickly to natural disasters
                    or humanitarian crises by assessing the extent of damage and
                    identifying areas that need assistance.
                  </p>
                </div>
              </div>
            </div>
            <p className="HeadingOfSpace text-left">SPACE</p>
            <div class="row mx-auto">
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center  HeadingOfCardDefence">
                    Planetary Exploration
                  </p>
                  <img
                    className="Dimg"
                    src="defence4.jpg"
                    alt="Photo of sunset"
                  />
                  <div>
                    <p class="cards-texts">
                      Satellites capture images of celestial bodies, aiding in
                      the study of planets, moons, and other celestial objects.
                      They provide valuable data for scientists and astronomers
                      to understand the composition and features of distant
                      worlds. 
                    </p>{" "}
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6 items mx-auto">
                <div class="cardD items-cards card-block">
                  <p className="text-center  HeadingOfCardDefence">
                    Earth Observation
                  </p>
                  <img
                    className="Dimg"
                    src="Defence5.png"
                    alt="Photo of sunset"
                  />
                  <div>
                    <p class="cards-texts">
                      Satellites contribute to Earth monitoring for climate
                      studies, environmental changes, and weather forecasting.
                      This data is vital for understanding global phenomena and
                      improving our ability to respond to climate-related
                      challenges.
                    </p>{" "}
                  </div>
                </div>
              </div>
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

export default Defence;
