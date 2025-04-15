import React, { useState } from 'react';
import "./ContactForm.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import CopyRightFooter from '../CopyRightFooter/CopyRightFooter';


import { faInstagram, faTwitter, faLinkedin, faFacebook, } from '@fortawesome/free-brands-svg-icons';


const ContactForm = () => {
  const [formData, setFormData] = useState({
    customer_mail: "",
    customer_mobile_no: "",
    catagory: "",
    comment: "",
    name: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleContactUs = async (e) => {
    e.preventDefault();


    try {
      const response = await axios.patch(
        "http://127.0.0.1:8000/contact_us/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Your password reset suceessfully.", {
          position: "top-right",
          autoClose: 3000,
        });
        console.log("Form submitted successfully!");
      } else {
        console.error("API call failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during API call:", error.message);
    }
  };
  const iconStyle = {
    fontSize: '24px',
    color: '#6b5b95', // Icon color
    margin: '0 10px', // Spacing between icons and text
  };


  return (
    // ______________________________

    <div className='formbackground '>

      {/* <!-- Responsive Contact Page with Dark Mode and Form Validation (vanilla JS).

*Designed & built for desktop and tablets with viewport width >= 720px and in landscape orientation.  --> */}

      <div class="contact-container">
        <div class="left-col ">
          {/* <img class="logo" src="https://www.indonesia.travel/content/dam/indtravelrevamp/en/logo.png" /> */}

          <div className=''>
            <h5 class="contact_left_heading">We're excited to hear from you!
              Please fill out the form, and
              our team will be in touch shortly.</h5>


          </div>
        </div>
        <div class="right-col">

          <div className="imagecontact py-3">
            <img
              src="GEOPICX_LOGO.png "
              alt="Site Logo"
              width="40"
              height="40"
              style={{ marginTop: "-5px" }}
            />
            <h1 className="text_heading_contact">GeoPicX</h1>

          </div>

          <h1 class="contact-heading">Contact us</h1>
          {/* <p class="">Planning to visit Indonesia soon? Get insider tips on where to go, things to do and find best deals for your next adventure.</p> */}

          <form class="cont-us-form" id="contact-form" method="post">
            <label class="font-field" for="name">Full name</label>
            <input class="cont-input" type="text" id="name" name="name" placeholder="Your Full Name"
              value={formData.name}
              onChange={handleChange}

              required />

            <label class="font-field" for="email">Email Address</label>
            <input class="cont-input" type="email" id="name" name="customer_mail" placeholder="Your Email Address"
              value={formData.customer_mail}
              onChange={handleChange}
              required />

            <label class="font-field" for="email">Contact No.</label>
            <input class="cont-input" type="number" id="mobile" name="customer_mobile_no" placeholder="Your Contact No."
              value={formData.customer_mobile_no}
              onChange={handleChange}
              maxLength="10" pattern="\d{10}"
              required />

            <label class="font-field" for="email">Catagory</label>
            <input class="cont-input" type="text" id="mobile" name="catagory" placeholder="Your Catagory"
              value={formData.catagory}
              onChange={handleChange}
              required />

            <label class="font-field" for="message">Message</label>
            <textarea class="text-area-input" rows="4" placeholder="Your Message" id="comment" name="comment"
              onChange={handleChange}
              value={formData.comment}
              required></textarea>

            {/* <!--<a href="javascript:void(0)">--> */}


            <button class="cont-sub-btn" type="submit" id="submit" name="submit"
              onChange={handleContactUs}>Send</button>
            {/* <!--</a>--> */}

          </form>
          <div id="error"></div>
          <div id="success-msg"></div>
        </div>
      </div>

      {/* <!-- Image credit: Oliver Sjöström https://www.pexels.com/photo/body-of-water-near-green-mountain-931018/  --> */}



      {/* <!-- Jumbotron --> */}
      <div className='ml-0'>
        <CopyRightFooter />
      </div>

    </div>

  )
}

export default ContactForm;