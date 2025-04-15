import React,{useState} from 'react';
import { PropTypes } from 'prop-types';

const CentraliseButtonForActivestatus = ({
  text,
  onClick,
  icon,
  iconPosition = 'left',
  type = 'button',
  className = '',
  disabled = false,
  isActive = false,
  activeVariant = 'green',
  inactiveVariant = '#808080a8',
  padding = '10px 20px',
  hoverBgColor = '#ccc',
  hoverTextColor = '#000',
  hoverBorderColor = 'transparent',
  textColor = '#fff',
  borderColor = 'transparent',
  width = 'auto',
  margin = null,
  fontsize = "18px",

  ...props
}) => {
  const [isClickeds, setIsClickeds] = useState(false);

    const handleClick = (event) => {
        if (!disabled) {
            setIsClickeds(true);
            setTimeout(() => {
                setIsClickeds(false);
            }, 200);
            onClick && onClick(event);
        }
    };
    
    const customStyles = {
      backgroundColor: isActive ? activeVariant : inactiveVariant,
      '--padding': padding,
      '--hover-bg-color': hoverBgColor,
      '--hover-text-color': hoverTextColor,
      '--hover-border-color': hoverBorderColor,
      '--text-color': textColor,
      '--border-color': borderColor,
      width: width,
      margin: margin,
      fontSize: fontsize,
     
  };
  const  inactiveStyles= {
    ... customStyles,
    backgroundColor:"#d2dce3",
     textColor:'white',
    // backgroundColor: 'rgb(252,186,3)',
    boxShadow: `
      2px 2px 4px #000000,
      inset -3px -3px 5px 1px rgb(169 107 1 / 18%),
      inset 3px 3px 4px 1px  rgb(253 243 226)`,
  };

  const activeStyles = {
    ... customStyles,
    // backgroundColor: 'rgb(244,141,5)',
    backgroundColor:'rgb(70 133 88)',
     textColor:'#fff',
    // boxShadow: `
    //   2px 2px 4px #000000,
    //   inset 3px 3px 5px 2px #8f5a00,
    //   inset -3px -3px 5px 1px #fed27b`,
    boxShadow: `rgb(205 184 184) 2px 2px 4px, 
    rgb(37 47 44 / 37%) 3px 3px 5px 2px inset, 
    rgb(58 69 57 / 44%) -3px -3px 5px 1px inset`
    ,

  };
  // rgb(37 47 44 / 37%) 3px 3px 5px 2px inset, rgb(58 69 57 / 44%) -3px -3px 5px 1px inset;
//   element.style {
  // rgb(169 107 1 / 18%) -3px -3px 5px 1px inset, rgb(253 243 226) 3px 3px 4px 1px inset;
//     background-color: rgb(70 133 88);
//     --padding: 6px 6px;
//     --hover-bg-color: #ccc;
//     --hover-text-color: #000;
//     --hover-border-color: transparent;
//     --text-color: #fff;
//     --border-color: transparent;
//     width: auto;
//     font-size: 15px;
//     box-shadow: rgb(205 184 184) 2px 2px 4px, rgb(37 47 44) 3px 3px 5px 2px inset, rgb(58 69 57) -3px -3px 5px 1px inset;
// }
  return (
    <div><button
    type={type}
    className={`Active-button ${className} ${isClickeds ? 'clickeds' : ''} ${disabled ? 'disabled' : ''}`}
    onClick={handleClick}
    disabled={disabled}
    // style={customStyles}
    style={isActive ? activeStyles : inactiveStyles}
    {...props}
>
    {icon && iconPosition === 'left' && <img src={icon} alt="icon" className="button-icon-left" />}
    {text}
    {icon && iconPosition === 'right' && <img src={icon} alt="icon" className="button-icon-right" />}
</button></div>
  )
}
CentraliseButtonForActivestatus.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  activeVariant: PropTypes.string,
  inactiveVariant: PropTypes.string,
  padding: PropTypes.string,
  hoverBgColor: PropTypes.string,
  hoverTextColor: PropTypes.string,
  hoverBorderColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,
  width: PropTypes.string,
  margin: PropTypes.string,
  fontsize: PropTypes.string,
};


export default CentraliseButtonForActivestatus;