import React,{useState} from 'react'

const CentraliseSearchButton = (
    {
        label,
        onClick,
        isActive,
        width,
        height,
        bgColor,
        activeColor,
        inactiveColor,
        textColor,
        disabled,
        icon,
        className,
        style,
        textWidth,
        textShadow,
        borderColor,
        borderWidth,
        borderRadius,
        fontWeight,
        FontFamily,
        hoverBgColor,
      }
) => {
  const [active, setActive] = useState(isActive);
  const handleClick = (e) => {
    if (onClick) onClick(e); 
  };

  // const handleClick = (e) => {
  //   setActive(!active); 
  //   if (onClick) onClick(e);
  // };
  // const boxShadow = isActive
  // ? "inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0)" // Pronounced inset shadow when active
  // : "8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.6)";
  // "5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0)"; 
  // const boxShadow = isActive
  // ? "inset 0 2px 4px rgba(0, 0, 0, 0.4)" 
  // :" 0px 3px 10px rgb(0 0 0 / 51%) ";
  //  "0 2px 5px rgba(0, 0, 0, 0.2)"; 
    const buttonStyles = {
        backgroundColor: isActive ? activeColor : inactiveColor,
        width: width || 'auto',
        height: height || 'auto',
        color: textColor || '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        textShadow: textShadow || 'none', // Add text shadow
        borderColor: borderColor || 'transparent',
        borderWidth: borderWidth || '0',
        borderRadius: borderRadius || '4px',
        fontWeight: fontWeight || 'bold', 
        // boxShadow: isActive
        // ? ` 2px 2px 4px #000000,
        // inset -3px -3px 5px 1px #a96b01,
        // inset 3px 3px 4px 1px #fdf3e2; ` 
        // : ` 2px 2px 4px #000000,
        // inset 3px 3px 5px 2px #8f5a00,
        // inset -3px -3px 5px 1px #fed27b; `, 
      //     boxShadow: active
      // ? 
      // '-2px -2px 5px #ffffff,  2px 2px 5px #5f5f5f, inset 5px 5px 10px #545454, inset -5px -5px 10px #fff'
      // ' inset 5px 5px 10px rgba(0, 0, 0, 0.6), inset -5px -5px 10px rgba(255, 255, 255, 0)'
      // : 
      // '-2px -2px 5px #ffffff, 2px 2px 5px #5f5f5f, inset -5px -5px 10px #545454, inset 5px 5px 10px #fff',
      // '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0)',
        fontFamily:
        FontFamily ||
      "Trebuchet MS",
      transition: "box-shadow 0.2s, transform 0.3s", // Smooth transition for 3D effect
      transform: isActive ? "translateY(0.2px)" : "translateY(-0.2px)", 
      // boxShadow: boxShadow,
        ...style, // Allow custom styles to be passed
      };
    
      const labelStyles = {
        width: textWidth || 'auto',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: textShadow || 'none',
        fontFamily:
        FontFamily ||
      "Trebuchet MS",
        
      };
  return (
    <div><button
    onClick={ handleClick}
    style={buttonStyles}
    className={`centralize-button ${className} ${active ? 'but3' : 'but2'}`}
    // className={`centralize-button ${className} ${isActive ? 'active' : ''}`}
    // className={`centralize-button ${className} ${active ? 'active' : ''}`}
    // className={`centralize-buttonSearch ${className}`}
    disabled={disabled}
  >
    {icon && <span className="button-icon">{icon}</span>}
    <span style={labelStyles}>{label}</span>
  </button>
  </div>
);
};



export default CentraliseSearchButton