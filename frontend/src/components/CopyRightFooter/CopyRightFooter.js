import React from 'react';
import "./CopyRightFooter.css";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebook, faTwitter, faGoogle, faApple, faLinkedin, faInternetExplorer } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faMapMarker, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';


const CopyRightFooter = () => {

    const navigate = useNavigate();

    const handleNavigation = (link) => {
        navigate("/Application", { state: { someData: link } });
    };


    const handleNavigationService = (link) => {
        navigate("/Service", { state: { someData: link } });
    }

    return (
        <div class=" bg-footer" style={{ backgroundImage: `url(/footerbg.jpg)` }}>

            <div class=" Footer-content-row row pb-5 mb-0">
                {/* <div className='col-lg-1 mt-lg-5 ml-lg-5 mr-lg-0 d-flex justify-content-center align-items-center'>
                <img src="logo.png" alt="Site Logo"  />
                </div> */}

                <div className='col-lg-4 col-md-4 col-sm-12 '>
                    <h6 class="footer-heading text-uppercase text-white ">Industry</h6>
                    <ul class="list-unstyled footer-link mt-0 ParagraphOfFooter">

                        <li><a onClick={() => handleNavigation("mars")} ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Mars</a></li>

                        <li><a onClick={() => handleNavigation("agriculture")} > <FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Agriculture </a> </li>


                        <li><a onClick={() => handleNavigation("defense")}><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Defence and Security</a></li>

                        <li><a onClick={() => handleNavigation("water")}
                        ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Water Resources</a></li>


                        <li><a onClick={() => handleNavigation("mining")}><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Mining and Mineral Resource Mapping</a></li>

                    </ul>
                </div>
                {/* <div class="col-lg-6  ">
                    <div class="">
                        <h6 class="footer-heading text-uppercase text-white ">GEOPICX</h6>

                        <p align="justify" className="ParagraphOfFooter mr-5"> GeoPicX is a web-based platform and an online gateway that provides access to geospatial information, data, and services through a systematic process of spatial world data collection, storage and analysis. It serves as a centralized hub for discovering, accessing, and managing data both in the form of spatial (geographic information system (GIS) resources) and nonspatial data (Management Information System (MIS). GeoPicX is designed to facilitate the exploration and utilization of spatial data for various purposes, including research, analysis, decision-making, and public information. 

GeoPicX will be used by a variety of stakeholders, including government agencies, researchers, businesses, and the general public. It plays a crucial role in promoting the availability and accessibility of geospatial information (location-based information), contributing to informed decision-making and fostering collaboration in the field of geographic information systems. </p>
                    </div>
                </div> */}
                {/* <div class="col mb-5 mb-5"> */}
                {/* <div class="">
                        <h6 class="footer-heading text-uppercase text-white">Important Links</h6>
                        <ul class="list-unstyled footer-link">
                            <li><a href="">Pagess </a></li>
                            <li><a href="">About Us</a></li>
                            <li><a href="">Our Teams</a></li>
                            <li><a href="">Privacy Policy</a></li>
                        </ul>
                    </div> */}
                {/* </div> */}

                <div class="col-lg-4 col-md-4 col-sm-12 d-lg-flex justify-content-lg-center ">
                    <div>
                    <h6 class="footer-heading text-uppercase text-white ">Services</h6>
                    <ul class="list-unstyled footer-link mt-0 ParagraphOfFooter">


                        <li><a onClick={() => handleNavigationService("Digital Photogrammetr")} ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Digital Photogrammetry</a></li>
                        <li><a onClick={() => handleNavigationService("GIS")} > <FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> GIS</a></li>
                        <li><a onClick={() => handleNavigationService("3D Modelling")} ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> 3D Modelling</a></li>
                        <li><a onClick={() => handleNavigationService("Digitalization")} ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Aerial surveys</a></li>
                        <li><a onClick={() => handleNavigationService("Image Processing")} ><FontAwesomeIcon icon={faAngleDoubleRight} style={{ color: '#847f7f' }} /> Image Processing</a></li>
                    </ul>
                    </div>
                    {/* <div class=""> */}
                   
                    {/* </div> */}
                </div>


                <div class="col-lg-4 col-md-4 col-sm-12 d-lg-flex justify-content-lg-end align-items-lg-center">
                    <div class="">
                        <h6 class="footer-heading text-uppercase text-white">Contact Us</h6>
                        {/* <h6 class=" text-uppercase text-white ">GEOPICX</h6> */}

                        <div className="Footer-geopics ">
                            <img src="GEOPICX_LOGO.png" className="" alt="Site Logo" width="40" height="40" />
                            <h1 className="GeopicsHeadingInside-footer">GeoPicX</h1>
                        </div>

                        <p class="contact-info mt-3 ParagraphOfFooter "><FontAwesomeIcon icon={faMapMarker} className='mr-2' />Plot No.80 KT Nagar, <br></br> Katol road, Nagpur-440013</p>
                        <p class="contact-info ParagraphOfFooter"><FontAwesomeIcon icon={faPhone} className='mr-2' />+91 8446563560</p>
                        <p class="contact-info ParagraphOfFooter"><FontAwesomeIcon icon={faEnvelope} className='mr-2' />geopicx@gmail.com</p>

                        {/* <div class=""> */}
                        <ul class="list-inline mb-4 ParagraphOfFooter">
                            <li class="list-inline-item me-5">

                                <Link to="https://www.facebook.com/MicronetSolutionsNGP" target='_blank'>
                                    <FontAwesomeIcon icon={faFacebook} className="facebook footer-social-icon" />

                                </Link>
                            </li>
                            <li class="list-inline-item me-5">

                                <Link to="https://www.micronetsolutions.in/" target='_blank'>
                                    <FontAwesomeIcon icon={faGlobe} className="google footer-social-icon" />
                                </Link>
                            </li>
                            <li class="list-inline-item me-5">
                                <Link to="https://www.linkedin.com/company/micronet-solutions-authorized-reseller-of-airbus-defence-space/about/" target='_blank'>
                                    <FontAwesomeIcon icon={faLinkedin} className="apple footer-social-icon" />
                                </Link>

                            </li>
                        </ul>
                        {/* </div> */}
                    </div>
                </div>

            </div>



        </div >

    )
}

export default CopyRightFooter;