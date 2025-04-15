import React from 'react';
import PropTypes from 'prop-types';
import './CentralizedHeading.css'; // Import your CSS file for styling

const CentralizedHeading = ({ level, children, color, className }) => {
    const Tag = `h${level}`;

    const style = {
        color: color,
        // Add other styles such as fontSize, fontWeight, etc. as needed
    };

    return (
        <Tag className={`centralized-heading h${level} ${className}`} style={style}>
            <span className="centered-text">{children}</span>
        </Tag>
    );
};

CentralizedHeading.propTypes = {
    level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
    children: PropTypes.node.isRequired,
    color: PropTypes.string,
    className: PropTypes.string,
    // Add more PropTypes for other styling options if needed
};

export default CentralizedHeading;
