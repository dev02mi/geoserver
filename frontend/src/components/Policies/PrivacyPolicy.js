import React from 'react'
import "./PrivacyPolicies.css";
import { Link } from "react-router-dom";
const PrivacyPolicy = () => {
  return (
    <div className=''>
      <div className='  main-containOfPolicies mt-auto '>
        <div className='  headingOfCondition '>
          <div className='row  d-flex justify-content-center align-items-center'>
            <div className='col-lg-4 d-flex justify-content-center align-items-center pr-5'><img src="GEOPICX_LOGO.png" alt="Site Logo" width="40" height="40" /><h1 className=" privacypoliecisheading mt-4 ">GeoPicX</h1></div>
            <div className='col-lg-4 d-flex justify-content-center align-items-center '><h1 class="privacypoliecisheading mt-4">Privacy Policy</h1></div>
            <div
              className='col-lg-4 d-flex justify-content-center align-items-center'
            > <img src="MSOLU_10K.png" alt="Site Logo" width="40" height="40" /><h1 className="privacypoliecisheading mt-4">Micronet</h1></div>
          </div>
        </div>

        <hr style={{ border: "0.1px solid #6495ed" }}></hr>


        <div className='   Disclaimer mt-0    text-justify'>

          <p className='paragraphOfDisclaimer   '>By accessing this website and/or any Apps or any of its associate/group sites ("Website"), you have read, understood and agree to be legally bound by the terms of the following disclaimer and user agreement. <br></br>
            Micronet Solution is engaged in providing geospatial data and services in India. Further, it is not intended to advice user or provides an opinion with respect to the various geospatial analysis provided in the geoportal. No material /information contained on the Website constitutes or shall be interpreted as thematic advice or suggestion to the geospatial solution or commitment whatsoever. Micronet Solutions has taken due care and caution in the compilation of the data,
            process flow and the contents for its Geoportal. <br></br> </p>
          <p className='paragraphOfDisclaimer'><strong>General Disclaimer: </strong>The information provided on the GeoPortal website is intended for general informational purposes only. While we strive to ensure the accuracy, completeness, and timeliness of the data and information presented, we make no guarantees or warranties of any kind, express or implied, regarding the reliability, accuracy,
            or availability of the website or the information, services, or related graphics contained on the website for any purpose.
            Any reliance you place on such information is therefore strictly at your own risk. </p> <br></br>
          <p className='paragraphOfDisclaimer'><strong>No Professional Advice: </strong>The content of this website is not intended to serve as professional advice. Users should consult with appropriate professionals (e.g., geographers, cartographers, thematic and environmental scientists, legal experts) for advice specific to their particular circumstances before making any decisions based on the information available on this site. </p> <br></br>
          <p className='paragraphOfDisclaimer'><strong>Third-Party Content: </strong>The GeoPortal website may contain links to external websites or resources provided by third parties. These links are provided for your convenience only. We have no control over the nature, content, and availability of those sites or resources and do not endorse any information, products, or services provided by third parties. We assume no responsibility for the content, privacy practices, or actions of any third-party websites. </p><br></br>
          <p className='paragraphOfDisclaimer'><strong>Geospatial Data Disclaime: </strong>Geospatial data presented on this website is subject to change without notice. While efforts are made to ensure the accuracy of this data, discrepancies may exist. Users should verify critical data independently and use it at their own risk. The GeoPortal does not accept liability for any errors, omissions, or inaccuracies in the data provided.  </p><br></br>
          <p className='paragraphOfDisclaimer'><strong>Limitation of Liability: </strong> In no event shall the GeoPortal, its affiliates, partners, or employees be liable for any loss or damage, including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.  </p><br></br>
          <p className='paragraphOfDisclaimer'><strong>Changes to the Website:: </strong> We reserve the right to modify, update, or discontinue any part of the GeoPortal website, including this disclaimer, at any time without prior notice. It is the responsibility of the user to review this disclaimer periodically for any changes.   </p><br></br>
          <p className='paragraphOfDisclaimer'><strong>Jurisdiction and Governing Law: </strong> This disclaimer and the use of the GeoPortal website shall be governed by and construed in accordance with the laws of the jurisdiction in which the Geospatial Policy of India. Any disputes arising out of or relating to this website shall be subject to the exclusive jurisdiction of the courts in that jurisdiction. Micronet Solutions hereby expressly disclaims any implied warranties imputed by the laws of any jurisdiction. Micronet Solutions considers itself and intends to be governed by the exclusive jurisdiction of the courts of Nagpur City in India. If you don't agree with any of the disclaimers above, please do not read the material on any of the pages and exit the GeoPortal immediately. This Portal is specifically for users in the territory of India. Although access to users outside India is not denied, Micronet Solutions shall have no legal liabilities whatsoever in any laws of any jurisdiction other than India. Micronet Solutions reserves the right to make changes to its website, including but not limited to the Terms of Use, Disclaimers and Privacy Policy contained herein.  </p><br></br>
          <p className='paragraphOfDisclaimer'><strong>Contact Information: </strong>  If you have any questions or concerns about this disclaimer, please contact us at [insert contact information].   </p><br></br>
          <div className='d-flex justify-content-center align-items-center text-info pb-5 LinksOfPdT'>
            <Link to="/PrivacyPolicy"><span className="mx-3 LinksOfPdT">Privacy policy </span></Link>
            <Link to="/Disclaimer"><span className="mx-3 LinksOfPdT"> Disclaimer</span></Link>
            <Link to="/Termsacondition"><span className="mx-3 LinksOfPdT">Terms And Condition</span></Link>
          </div>
        </div>

      </div>


    </div>

  )
}

export default PrivacyPolicy