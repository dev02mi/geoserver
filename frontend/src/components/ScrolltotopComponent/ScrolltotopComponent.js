// import React, {useEffect, useState} from 'react'
// import "./ScrolltotopComponent.css"
// const ScrolltotopComponent = () => {
//     const [isVisible, setIsVisible] = useState(false);

//     const toggleVisibility = () => {
//       if (window.pageYOffset > 100) {
//         setIsVisible(true);
//       } else {
//         setIsVisible(false);
//       }
//     };
  
//     const scrollToTop = () => {
//       window.scrollTo({
//         top: 0,
//         behavior: 'smooth',
//       });
//     };
  
//     useEffect(() => {
//       window.addEventListener('scroll', toggleVisibility);
//       return () => {
//         window.removeEventListener('scroll', toggleVisibility);
//       };
//     }, []);
//   return (
//     <div className="scroll-to-top">   {isVisible && (
//         <div onClick={scrollToTop} className="scroll-to-top-icon">
//           ↑
//         </div>
//       )}</div>
//   )
// }

// export default ScrolltotopComponent

// import React from "react";

// const ScrollToTopButton = () => {
//   const handleScrollToTop = () => {
//     const container = document.getElementById("MainContentOfAppId"); // Replace with your container's ID
//     if (container) {
//       container.scrollTo({
//         top: 0,
//         behavior: "smooth", 
//       });
//     }
//   };

//   return (
//     <div>
//        <button className="Scrolltotop" onClick={handleScrollToTop} style={{position:"absolute", top:"72%", left:"49%"}}>
//       Scroll to Top
//     </button>
//     </div>
   
//   );
// };

// export default ScrollToTopButton;
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faChevronUp, faAngleUp, faCaretUp,faRocket } from '@fortawesome/free-solid-svg-icons'; // Importing faArrowUp

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false); // State to manage button visibility
  const [isHovered, setIsHovered] = useState(false); 

  const handleScroll = () => {
    const container = document.getElementById("MainContentOfAppId");
    if (container) {
      const scrollTop = container.scrollTop || container.scrollY;
      setIsVisible(scrollTop > 200); // Adjust the value (200) to the scroll height at which you want the button to appear
    }
  };

  const handleScrollToTop = () => {
    const container = document.getElementById("MainContentOfAppId");
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = document.getElementById("MainContentOfAppId");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    isVisible && ( // Conditionally render the button
      <div>
        <button
          className="Scrolltotop text-center  text-center"
          onClick={handleScrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ position: "absolute", top: "90%", left: "94%", 
            width:"40px", height:"40px", border:"3px solid #8458B3", fontSize:"20px",  color: isHovered ? "white" : "#8458B3",
            backgroundColor: isHovered ? "#8458B3" : "white",
            transition: "background-color 0.3s ease, color 0.3s ease",
             borderRadius:"65px",display:"none" }}
        >
           <FontAwesomeIcon icon={faRocket}
            onClick={handleScrollToTop}
            style={{ 
              marginLeft:"-1px",
             verticalAlign:"middle",
              transform: 'rotate(311deg)' // Adjust the rotation here if needed
            }}  className="text-center" />
          {/* Scroll to Top */}
        </button>
      </div>
    )
  );
};

export default ScrollToTopButton;
