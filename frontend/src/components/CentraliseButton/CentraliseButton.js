import React,{useState} from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Button.css'; // Import your CSS for styling

const CentraliseButton = ({
    text,
    onClick,
    icon,
    iconPosition = 'left',
    type = 'button',
    className = '',
    disabled = "",
    variant = 'transparent',
    fontAwesomeIcon,
    padding = '10px 20px', // Default padding
    hoverBgColor = '#ccc', // Default hover background color
    hoverTextColor = '#000', // Default hover text color
    hoverBorderColor = 'transparent', // Default hover border color
    textColor = '#fff', // Default text color
    borderColor = 'transparent', // Default border color
    width = null ,// Default width set to null
    margin = null,
    fontsize="18px", 
    ...props// Default margin set to null
    
}) => {

    const [isClicked, setIsClicked] = useState(false);

    const handleClick = (event) => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
        }, 200); // Reset the click effect after 200ms (adjust as needed)
        onClick && onClick(event);
    };
    const customStyles = {
        '--bg-color': variant,
        '--padding': padding,
        '--hover-bg-color': hoverBgColor,
        '--hover-text-color': hoverTextColor,
        '--hover-border-color': hoverBorderColor,
        '--text-color': textColor,
        '--border-color': borderColor,
        'width': width,
        'margin': margin,
        'font-size': fontsize,

        
    };
    return (
        <button
        type={type}
        className={`custom-button ${className} ${isClicked ? 'clicked' : ''} ${disabled ? 'disabled' : ''}`}
            // onClick={handleClick}
        // className={`custom-button ${className}`}
        // className={`custom-button ${variant} ${className}`}
        onClick={onClick}
        {...props}
        disabled={disabled}
        style={customStyles}
    >
         {icon && iconPosition === 'left' && !fontAwesomeIcon && <img src={icon} alt="icon" className="button-icon-left" />}
            {fontAwesomeIcon && iconPosition === 'left' && <FontAwesomeIcon icon={fontAwesomeIcon} className="button-icon-left" />}
            {text}
            {icon && iconPosition === 'right' && !fontAwesomeIcon && <img src={icon} alt="icon" className="button-icon-right" />}
            {fontAwesomeIcon && iconPosition === 'right' && <FontAwesomeIcon icon={fontAwesomeIcon} className="button-icon-right" />}
        {/* {icon && iconPosition === 'left' && <img src={icon} alt="icon" className="button-icon-left" />}
        {text}
        {icon && iconPosition === 'right' && <img src={icon} alt="icon" className="button-icon-right" />} */}
    </button>
    );
};

CentraliseButton.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.string,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    variant: PropTypes.string,
    fontAwesomeIcon: PropTypes.object,
    padding: PropTypes.string,
    hoverBgColor: PropTypes.string,
    hoverTextColor: PropTypes.string,
    hoverBorderColor: PropTypes.string,
    textColor: PropTypes.string,
    borderColor: PropTypes.string,
    width: PropTypes.string,
    margin: PropTypes.string,
    fontsize:PropTypes.string
};

export default CentraliseButton;
