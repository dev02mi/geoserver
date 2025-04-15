import React, { useState } from 'react';

function Onclicks() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCard = () => {
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <span
      className={`logo-card ${isHovered || isOpen ? 'active' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src="Logo_m.png"
        alt="Logo"
        style={{height:"25px"}}
        onClick={toggleCard}
      />
      {(isHovered || isOpen) && (
        <div className="card-content">
          {/* Add your card content here */}
          <h1>Hello</h1>
        </div>
      )}
    </span>
  );
}

export default  Onclicks;
