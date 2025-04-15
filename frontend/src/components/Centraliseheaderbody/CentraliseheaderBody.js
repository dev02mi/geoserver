import React from 'react';
import "./Centralised.css";

const CentraliseheaderBody = ({ header, logo, children, headerBgColor, headerTextColor,  onClose,  className,}) => {
  return (
    <div
    className={`centralized-formB ${className}`} 
    // className="centralized-formB"
    >
    <div 
      className="form-headerB" 
      style={{ 
        backgroundColor: headerBgColor, 
        color: headerTextColor 
      }}
    >
      <div className="header-left">
          {logo && (
            <div className="form-logo">
              <img src={logo} alt="Logo" />
            </div>
          )}
          {header && <h6 className="Header-textB ml-3">{header}</h6>}
        </div>
        
      {/* {logo && (
        <div className="form-logo">
          <img src={logo} alt="Logo" />
        </div>
      )}
      {header && <h6 className="Header-text">{header}</h6>} */}
      {onClose && (
          <button className="close-buttonH" onClick={onClose}>
            &times;
          </button>
        )}
    </div>
   
    <div className="form-bodyB">{children}</div>
  </div>
  )
}

export default CentraliseheaderBody