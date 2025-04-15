import React from 'react';
import PropTypes from 'prop-types';
import "./CentralizePara.css"

const CentralizedPara = ({ children, color, 
  className,
  fontSize,
  fontWeight,
  textAlign,
  lineHeight,
  margin,
  padding,
  fontFamily,
  textDecoration
 }) => {
    const style = {
      color: color,
      fontSize: fontSize,
      fontWeight: fontWeight,
      textAlign: textAlign,
      lineHeight: lineHeight,
      margin: margin,
      padding: padding,
      fontFamily: fontFamily,
      textDecoration: textDecoration,
        // Additional styles can be added here if needed
    };
    
  return (
    <p className={`centralized-paragraph ${className}`} style={style}>
    {children}
</p>
  )
}
CentralizedPara.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  className: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.string,
  textAlign: PropTypes.oneOf(['left', 'right', 'center', 'justify']),
  lineHeight: PropTypes.string,
  margin: PropTypes.string,
  padding: PropTypes.string,
  fontFamily: PropTypes.string,
  textDecoration: PropTypes.oneOf(['none', 'underline', 'line-through', 'overline']),
};
CentralizedPara.defaultProps = {
  color: 'black',
  fontSize: '16px',
  fontWeight: 'normal',
  textAlign: 'left',
  lineHeight: 'normal',
  margin: '0',
  padding: '0',
  textDecoration: 'none',
  fontFamily: 'Arial, sans-serif', 
};
export default CentralizedPara