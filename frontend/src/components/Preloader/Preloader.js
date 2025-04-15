import React from 'react';
import "./Preloader.css"

const Preloader = ({ loading, progress }) => {

    
    return (
        loading && (
            <div className="preloader-overlay">
                <div className="preloader-spinner"></div>
                <div className="percentage-container">
                    <div className="percentage">{progress}%</div>
                </div>
            </div>
        )
    );
};

export default Preloader;
