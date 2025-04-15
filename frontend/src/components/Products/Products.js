import React, { useRef } from "react";
import "./Products.css";
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";

const Products = () => {



  // Create references for each section
  const airbusRef = useRef(null);
  const planetRef = useRef(null);
  const mdaRef = useRef(null);

  // Function to handle scroll
  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="heightProduct">

      <div className="ProductsDiv" style={{ background: "url(Product_BG.jpg)" }}>

        <div class="outter hero-video">
          <div class="video-container">

            <video preload="auto" playsinline="true" loop="true" muted="true" autoplay="true" class="img-fluid" poster="images/accesscontrolposter.jpg">
              <source src="geopicx/Products_file.mp4" type="video/mp4" />
            </video>

            <div class="callout">
              <div class="img-heading">
                <p >We deal always with better products</p>
                {/* <p>We deal always with better products</p> */}
              </div>


              {/* <a class="button" href="">AIRBUS</a>
            <a class="button" href="">PLANET</a>
            <a class="button" href="">MDA</a> */}


              <button onClick={() => scrollToSection(airbusRef)} className="button">AIRBUS</button>
              <button onClick={() => scrollToSection(planetRef)} className="button">PLANET</button>
              <button onClick={() => scrollToSection(mdaRef)} className="button">MDA</button>

            </div>

          </div>
        </div>

        {/* <header>

        <div id="inner_header_post_thumb">
          <video preload="auto" playsinline="true" loop="true" muted="true" autoplay="true" class="img-fluid" poster="images/accesscontrolposter.jpg">
            <source src="Products_file.mp4" type="video/mp4" />
          </video>
        </div>
      </header> */}



        {/*  */}
        <div class="wrapper" ref={airbusRef} >
          {/* <span class="corner"></span> */}
          <article>
            <header>
              {/* <h1>AIRBUS</h1> */}
              <img class="name-logo" src="Airbus_LAST.png" alt="Something" />
            </header>
            <img src="products.jpg" alt="Something" />
            <p>With proprietary access to
              <strong className="strssword"> Pléiades, SPOT, Vision-1 </strong>and
              <strong className="strssword"> DMC Constellation </strong>optical
              satellites as well as the<strong className="strssword"> Radar Constellation </strong>(consisting
              of TerraSAR-X, TanDEM-X and PAZ), our extensive portfolio spans
              the entire geo-information value chain and is unrivalled in the
              marketplace.

              And we are continuously expanding our constellation to deliver even
              better data solutions.<br /><br />With the launch of the
              <strong className="strssword"> Pléiades Neo </strong>constellation in
              2021, we are able to provide our customers  with evenmore coverage and
              high resolution at 30cm resolution and daily revisit.
            </p>
          </article>
        </div>

        <div class="wrapper" ref={planetRef}>
          <article>
            <header>
              {/* <h1>PLANET</h1> */}
              <img class="name-logo" src="planet_logo.png" alt="Something" />
            </header>
            <img src="Planet2.jpg" alt="Something" />
            <p>
              At <strong className="strssword">[Micronet Solutions]</strong>, we
              take pride in offering a diverse range of satellite products and data
              solutions that cater to a wide array of industries and applications.
              Our extensive portfolio is <strong>designed </strong> to meet the
              specific needs of our customers, providing them with invaluable
              insights into our ever-changing world. <br /><br />
              Our extensive portfolio of satellite products includes state-of-the-art satellite hardware and
              technology, such as advanced imaging and remote sensing equipment,
              communication systems, and satellite platforms. These products are
              designed to meet the highest industry standards, ensuring reliability
              and performance for our customers.

            </p>
          </article>
        </div>

        <div class="wrapper" ref={mdaRef}>
          <article>
            <header>
              {/* <h1>MDA</h1> */}
              <img class="name-logo" src="MDA_LOGO.png" alt="Something" />
            </header>
            <img src="MDA2.png" alt="Something" />
            <p>
              Airbus is proud to offer the <strong className="strssword"> MDA (Multi-Domain Awareness) satellite </strong>
              product, a cutting-edge solution that embodies our commitment to
              excellence in the field of satellite technology. The MDA satellite
              product is designed to cater to the specific needs of a wide array of
              industries and applications, providing invaluable insights into our
              ever-changing world. <br /> <br />
              The MDA satellite product is a testament to
              Airbus' expertise in the satellite industry. It is a versatile and
              adaptable platform that encompasses a range of advanced features and
              capabilities. This satellite product is a key element of Airbus'
              mission to provide comprehensive satellite solutions for businesses,
              governments, researchers, and organizations worldwide.
            </p>
          </article>
        </div>


        {/*  */}

        <div className='mt-4 mb-0 ml-0'>

        </div>

      </div >




      <CopyRightFooter />
    </div>
  );
};

export default Products;
