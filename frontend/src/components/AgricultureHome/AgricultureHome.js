// UnderConstruction.js
import React, { useState, useEffect } from "react";
import "./AgricultureHome.css";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";

const AgricultureHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const slides = [
    {
      id: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2021&q=80",
      quote:
        "The world is a book, and those who do not travel read only one page.",
      author: "Saint Augustine",
    },
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
      quote: "We travel not to escape life, but for life not to escape us.",
      author: "Anonymous",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
      quote: "A journey is best measured in friends, rather than miles.",
      author: "Tim Cahill",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="AgriCultureHome">
      <div className=" mx-5">
        <div className="AgriCulTop">
          <div className="headingingOfAgri Text-Center">
            <div className="HeadingForAgriculture p-0">
              <button className="titleOfAgriculture m-5 btn  rounded-pill p-2">
                agriculture And Home
              </button>
            </div>
            <div className="headingingOfAgri">
              <img
                src="https://giffiles.alphacoders.com/101/10178.gif"
                alt=""
                className="BannerOfAgri"
              ></img>
            </div>

            {/* <h1>Forest Meditation Center</h1> */}
            {/* <video id="video" autoplay muted loop poster="https://github.com/Ledene/landing-page/blob/master/images/forest_Moment.jpg?raw=true">
               <source src="https://ledene.github.io/landing-page/videos/forest.mp4" type="video/mp4"/>
               <img src="https://github.com/Ledene/landing-page/blob/master/images/forest_Moment.jpg?raw=true" title="Sorry, your browser doesn't support embedded videos"/>
            </video> */}
            {/* <video preload="auto" playsinline="true" loop="true" muted="true" autoplay="true" class="img-fluid" poster="images/accesscontrolposter.jpg">
            <source src="https://ledene.github.io/landing-page/videos/forest.mp4" type="video/mp4"/>
            <img src="https://github.com/Ledene/landing-page/blob/master/images/forest_Moment.jpg?raw=true" title="Sorry, your browser doesn't support embedded videos"/>
           
          </video> */}
            {/* <section id="home" class="container hero">
                <h1 className="AriFor">Forest Meditation Center</h1>
                <p>Close your eyes and allow every worry, task and negative thought to float away. Breathe in and let the forest to fill you with its peace and harmony.</p>
            </section> */}

            {/* <form id="form" action="https://www.freecodecamp.com/email-submit">
                    <div class="item-1">
                        <p>Join the tribe and get notifications of upcoming events</p>
                    </div>
                    <div class="item-2">
                      <label for="email">E-mail</label>
                      <input type="email" id="email" name="email" placeholder="Enter your email">
                      <input type="submit" id="submit" value="Join">
                    </div>
                </form> */}
            {/* <div className="main"style={{ width: '100%', height: '400px' }}>
      <div className="slide-container">
        {slides.map((slide, index) => (
          <div key={index} className={`slide ${index === currentIndex ? 'current' : ''}`}>
            <div className="slide-image" style={{backgroundImage: `url(${slide.imageUrl})`,
             transform: `translateX(-${currentIndex * 100}%)`,
             transition: 'transform 0.9s  ease-in-out 1s'
            }}
            ></div>
          </div>
        ))}
      </div>
      <div className="slide-texts-container">
        {slides.map((slide, index) => (
          <h2 key={index} className={`title slide ${index === currentIndex ? 'current' : ''}`}>
            <q>&nbsp;{slide.quote}&nbsp;</q>
            <br /><span className="author">– {slide.author}</span>
          </h2>
        ))}
      </div>

      <ul className="slide-buttons">
        <li className="btn-left" onClick={prevSlide}>
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </li>
        <li className="btn-right" onClick={nextSlide}>
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </li>
      </ul>
    </div>
        */}

            <div className="mx-lg-5 mt-4 mx-sm-0">
              <p className=" ParaForAgri">
                1.Remote sensing in agriculture involves using satellite or
                aerial imagery to gather information about crops and land
                conditions. By capturing images from a distance, farmers and
                agricultural experts can monitor the health of crops, assess
                soil moisture levels, and identify areas that may need special
                attention. This technology enables timely decision-making, such
                as adjusting irrigation, applying fertilizers, or detecting
                potential pest infestations. Remote sensing provides a valuable
                tool for optimizing crop management, increasing yields, and
                reducing environmental impact by allowing farmers to target
                interventions precisely where they are needed. Overall, it
                enhances the efficiency and sustainability of agricultural
                practices through the utilization of advanced imaging technology
                from afar. <br></br> <br></br>
                2.Agriculture is the practice of cultivating the soil, growing
                crops, and raising livestock for food and other products.
                Farmers play a crucial role in this process, using various tools
                and techniques to ensure a successful harvest. They prepare the
                soil, plant seeds, and nurture the crops through watering,
                fertilizing, and pest control. Livestock, such as cows and
                chickens, are also raised for meat, milk, and other products.
                Weather conditions, soil quality, and sustainable farming
                practices are essential factors for a thriving agricultural
                system. In addition to providing food, agriculture contributes
                to the economy and supports livelihoods around the world.
              </p>
            </div>

            <div className="row mx-auto py-5 ForFirAgri">
              <div className="col-lg-5 col-md-12 col-sm-12 ">
                <h1>Agriculture</h1>
                <img
                  className="mainName w-100"
                  src="https://static.wixstatic.com/media/59da6a_f2d7416235e149c6918cb426f14ed26b~mv2.png/v1/crop/x_0,y_9,w_910,h_491/fill/w_695,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/AGRI_PNG.png"
                />
              </div>
              <div className="col-lg-4 col-md-12 col-sm-12 mt-5  d-flex justify-content-center align-items-center">
                <p className="AgricultureParaofimage">
                  Satellite-based reliable, timely data, easy data access and
                  innovative digital services to forecast changes, keep track of
                  conditions, monitor changes, and make informed decisions for
                  farm management and institutional practices. Our partners have
                  been leaders in driving data-driven agriculture and
                  transforming agricultural practices. Remote sensing in
                  agriculture involves using satellite or aerial imagery to
                  gather information about crops and land conditions. By
                  capturing images from a distance, farmers and agricultural
                  experts can monitor the health of crops, assess soil moisture
                  levels, and identify areas that may need special attention.
                  This technology enables timely decision-making, such as
                  adjusting irrigation, applying fertilizers, or detecting
                  potential pest infestations. Remote sensing provides a
                  valuable tool for optimizing crop management, increasing
                  yields, and reducing environmental impact by allowing farmers
                  to target interventions precisely where they are needed.
                  Overall, it enhances the efficiency and sustainability of
                  agricultural practices through the utilization of advanced
                  imaging technology from afar.
                </p>
              </div>
              <div className="col-lg-3 col-md-12 col-sm-12">
                <h5 className="HeadingOfndvi">Ndvi</h5>
                <div className="row text-align-center justify-content-center align-items-center centered-column">
                  <img
                    className=" w-75"
                    src="https://static.wixstatic.com/media/59da6a_ad0fd7eed2b54ab18e2aa68f5fbea7ca~mv2.jpg/v1/fill/w_305,h_172,al_c,lg_1,q_80,enc_auto/NDVI.jpg://static.wixstatic.com/media/59da6a_f2d7416235e149c6918cb426f14ed26b~mv2.png/v1/crop/x_0,y_9,w_910,h_491/fill/w_695,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/AGRI_PNG.png"
                  />
                </div>
                <div className="row mx-4  justify-content-center align-items-center centered-column">
                  <p className="Ndvi-text mx-5">
                    Normalized Difference Vegetation Index (NDVI) is a key
                    metric in agriculture and remote sensing. It measures plant
                    health by analyzing the difference between near-infrared and
                    red light reflectance, providing valuable insights into
                    vegetation vigor and helping monitor crop conditions.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div>
                <div class="we-are-block mb-4">
                  <div id="about-us-section">
                    <div class="about-us-image">
                      <img
                        src="LayerStackingImage.jpg"
                        width="808"
                        height="458"
                        alt="Lobby Image"
                      />
                    </div>

                    <div class="about-us-info">
                      <h2 className="headingOfaaagriahome"> Layer Stacking</h2>

                      <p>
                        {" "}
                        Layer stacking in agriculture involves strategically
                        planting multiple crops on the same piece of land in a
                        specific order or arrangement. This method optimizes
                        space and resources, promoting efficient land use and
                        enhancing overall crop yield.
                      </p>

                      {/* <a href="#" title="About Us Button">ABOUT US</a> */}
                    </div>
                  </div>

                  <div id="history-section">
                    <div class="history-image">
                      <img
                        src="ImageClassificationPic.png"
                        width="951"
                        height="471"
                        alt="Building Pic"
                      />
                    </div>

                    <div class="history-info">
                      <h2 className="headingOfaaagriahome">
                        Image Classification
                      </h2>

                      <p>
                        Image classification involves analyzing data captured by
                        satellites to categorize and label specific features on
                        Earth's surface, such as land cover, vegetation, urban
                        areas, and agriculture. This process aids in various
                        fields like environmental monitoring, land-use planning,
                        and disaster response, providing valuable insights for
                        sustainable agriculture practices.
                      </p>

                      {/* <a href="#" title="History Button">HISTORY</a> */}
                    </div>
                  </div>

                  <div id="about-us-section">
                    <div class="about-us-image">
                      <img
                        src="ImageAnalysisPic.jpg"
                        width="808"
                        height="458"
                        alt="Lobby Image"
                      />
                    </div>

                    <div class="about-us-info">
                      <h2 className="headingOfaaagriahome"> Image Analysis</h2>

                      <p>
                        {" "}
                        The analysis involves interpreting and understanding the
                        identified land cover types. This information aids in
                        monitoring environmental changes, assessing agricultural
                        patterns, and facilitating urban planning, providing
                        valuable insights for decision-making in various fields.
                      </p>

                      {/* <a href="#" title="About Us Button">ABOUT US</a> */}
                    </div>
                  </div>
                  <div id="history-section">
                    <div class="history-image">
                      <img
                        src="CropYieldPic.png"
                        width="951"
                        height="471"
                        alt="Building Pic"
                      />
                    </div>

                    <div class="history-info">
                      <h2 className="headingOfaaagriahome"> Crop Acreage</h2>

                      <p>
                        Image classification involves analyzing data captured by
                        satellites to categorize and label specific features on
                        Earth's surface, such as land cover, vegetation, urban
                        areas, and agriculture. This process aids in various
                        fields like environmental monitoring, land-use planning,
                        and disaster response, providing valuable insights for
                        sustainable agriculture practices.
                      </p>

                      {/* <a href="#" title="History Button">HISTORY</a> */}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div class="row mx-auto my-5">
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center HeadingOfCardAgriculture">NDVI</p>
                    <img className="Dimg" src="NdviPic.jpg" alt="NdviPic.jpg" />
                    <div>
                      <p class="CardForAgriculture">
                        {" "}
                        Normalized Difference Vegetation Index (NDVI) is a key
                        metric in agriculture and remote sensing. It measures
                        plant health by analyzing the difference between
                        near-infrared and red light reflectance, providing
                        valuable insights into vegetation vigor and helping
                        monitor crop conditions .
                      </p>{" "}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center  HeadingOfCardAgriculture">
                      Layer Stacking
                    </p>
                    <img
                      className="Dimg"
                      src="LayerStackingImage.jpg"
                      alt="Photo of sunset"
                    />
                    <div>
                      <p class="CardForAgriculture">
                        {" "}
                        Layer stacking in agriculture involves strategically planting multiple crops on the same piece of land in a specific order or arrangement. This method optimizes space and resources, promoting efficient land use and enhancing overall crop yield.

                      </p>{" "}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center  HeadingOfCardAgriculture">
                      Image Classification
                    </p>
                    <img
                      className="Dimg"
                      src="ImageClassificationPic.png"
                      alt="ImageClassificationPic.png"
                    />

                    <p class="CardForAgriculture">
                      Image classification involves analyzing data captured by
                      satellites to categorize and label specific features on
                      Earth's surface, such as land cover, vegetation, urban
                      areas, and agriculture. This process aids in various
                      fields like environmental monitoring, land-use planning,
                      and disaster response, providing valuable insights for
                      sustainable agriculture practices.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* <div class="row mx-auto my-5">
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center  HeadingOfCardAgriculture">
                      Image Analysis
                    </p>
                    <img
                      className="Dimg"
                      src="ImageAnalysisPic.jpg"
                      alt="ImageAnalysisPic.jpg"
                    />
                    <div>
                      <p class="CardForAgriculture">
                        {" "}
                        The analysis involves interpreting and understanding the
                        identified land cover types. This information aids in
                        monitoring environmental changes, assessing agricultural
                        patterns, and facilitating urban planning, providing
                        valuable insights for decision-making in various fields.
                      </p>{" "}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center  HeadingOfCardAgriculture">
                      Crop Acreage
                    </p>
                    <img
                      className="Dimg"
                      src="CropAveragePic.jpg"
                      alt="CropAveragePic.jpg"
                    />
                    <div>
                      <p class="CardForAgriculture">
                        {" "}
                        Crop acreage refers to the total land area dedicated to
                        growing a specific crop. It is a key metric in
                        agricultural planning, helping farmers optimize planting
                        and resource allocation. Efficient management of crop
                        acreage contributes to higher yields and sustainable
                        farming practices
                      </p>{" "}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-sm-6 items mx-auto">
                  <div class="cardD items-cards card-block">
                    <p className="text-center HeadingOfCardAgriculture">
                      Crop Yield
                    </p>
                    <img
                      className="Dimg"
                      src="CropYieldPic.png"
                      alt="CropYieldPic.png"
                    />

                    <p class="CardForAgriculture">
                      Crop yield refers to the quantity of crops harvested per
                      unit of land over a specific period. It is a key measure
                      of agricultural productivity, influenced by factors like
                      soil quality, climate, and farming practices. Maximizing
                      crop yield is crucial for ensuring food security and
                      sustainable agriculture{" "}
                    </p>
                  </div>
                </div>
              </div> */}
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

export default AgricultureHome;
