import React from "react";
import "./Testimonial.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
// import '@fortawesome/fontawesome-free/css/all.min.css';

const Testimonial = () => {
  return (
    <div class="container TestimonialCon">
      <div id="demo" class="carousel slide" data-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="carouselcaption">
              <p>
                We are Excited To work with GeoPic-x that combination of imagery
                and analytics available at the scale to Our customers and to
                Decision make all around the world{" "}
              </p>{" "}
              <img src="https://i.imgur.com/lE89Aey.jpg" />
              <div id="image-caption">Nick Doe</div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="carouselcaption">
              <p>
                Thanks to Geopic-x services We were able to identify the location of capsized Maxi Banque populaire 
                IX which missing off the Portuguese coast
              </p>{" "}
              <img src="https://i.imgur.com/QptVdsp.jpg" class="img-fluid" />
              <div id="image-caption">Cromption Greves</div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="carouselcaption">
              <p>
               By enabling Us to identify every smallholder coffee plot Through High-Resolution imagery
               the Living Library will help to solve the problem of supply chain transparency
               in the cofee sector.
              </p>{" "}
              <img src="https://i.imgur.com/jQWThIn.jpg" class="img-fluid" />
              <div id="image-caption">Harry Mon</div>
            </div>
          </div>
        </div>
        <a class="carousel-control-prev">
          {" "}
          <FontAwesomeIcon icon={faArrowLeft} className="Icon " href="#demo" data-slide="prev" />{" "}
        </a>{" "}
        <a class="carousel-control-next" >
          {" "}
          <FontAwesomeIcon icon={faArrowRight} className="Icon" href="#demo" data-slide="next" />{" "}
        </a>
      </div>
    </div>
  );
};

export default Testimonial;
