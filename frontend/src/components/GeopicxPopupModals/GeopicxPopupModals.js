import React, { useState, useEffect } from 'react';
import './GeopicxPopupModals.css';



const GeopicxPopupModals = ({ isOpen, type, logo, icon, modalHeaderHeading, modalBodyHeading, children, message, onClose, onConfirm, onCancel, confirmButtonText = "CONFIRM", cancelButtonText = "CANCEL" }) => {

    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Match the animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const renderButtons = () => {
        if (type === 'confirm') {
            return (
                <>
                    <button className="GeopicxModalConfirmButton" onClick={onConfirm}>{confirmButtonText}</button>
                    <button className="GeopicxModalCancelButton" onClick={onCancel}>{cancelButtonText}</button>
                </>
            );
        }
        return <button className="GeopicxModalConfirmButton" onClick={onConfirm}>{confirmButtonText}</button>;
    };

    return (
        <div className={`GeopicxModalOverlay ${!isOpen ? 'fadeOut' : ''}`}>
            <div className={`GeopicxModal GeopicxModal--${type} ${!isOpen ? 'slideOut' : ''}`}>
                <div className="GeopicxModalHeader">


                    {logo && <img src={logo} alt="Logo" className="GeopicxModalLogo" />}
                    <h2 className="GeopicxModalTitle">{modalHeaderHeading}</h2>
                    {type !== 'success' && <button className="GeopicxCloseButton" onClick={onClose}>&times;</button>}
                </div>
                <div className="GeopicxModalBody ">
                    {icon && <img src={icon} alt={`${type} icon`} className="GeopicxModalIcon" />}
                    <h2 className="GeopicxModalHeading">{modalBodyHeading}</h2>
                    <div className="GeopicxModalMessageBox">
                        <div className="GeopicxModalMessage " dangerouslySetInnerHTML={{ __html: message }} />


                    </div>
                </div>
                <div className="GeopicxModalFooter">
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default GeopicxPopupModals;
