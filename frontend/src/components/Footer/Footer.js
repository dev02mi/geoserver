import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";


const Footer = () => {
  return (
    <div className="footer ">
      {/* <footer className="copyright-footer"> */}
      {/* <div class=""> */}
      {/* <div className="FooterText"> */}
      {/* <p className="">Copyright © 2023 Micronet Solutions, All Rights Reserved.</p> */}
      {/* </div> */}

      {/* <div className="Footer-links"> */}
      {/* <p className=" FooterText">
              <Link to="/PrivacyPolicy"><span className="mx-3 textFooters">Privacy policy </span></Link>
              <Link to="/Disclaimer"><span className="mx-3 textFooters"> Disclaimer</span></Link>
              <Link to="/Termsacondition"><span className="mx-3 textFooters">Terms And Condition</span></Link>
            </p> */}
      {/* </div> */}

      {/* </div> */}
      {/* </footer> */}


      <footer className="copyright-footer">
        {/* <div className="footer-container"> */}
          <p className="footer-text-center">Copyright © 2023 Micronet Solutions, All Rights Reserved.</p>
          <p className="footer-links-right">
            <Link to="/PrivacyPolicy"><span className="mx-3 textFooters">Privacy policy</span></Link>
            <Link to="/Disclaimer"><span className="mx-3 textFooters">Disclaimer</span></Link>
            <Link to="/Termsacondition"><span className="mx-3 textFooters">Terms of use</span></Link>
          </p>
        {/* </div> */}
      </footer>

    </div>
  );
};

export default Footer;
