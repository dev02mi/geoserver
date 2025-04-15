import React from 'react'
import "./AdminBlock.css"
import { Link } from 'react-router-dom';
// Optional: for styling if needed

const AdminBlock = ({ AdminStatus, onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2 className='text-danger'>{AdminStatus}</h2>
                <button className="popup-close-btn" onClick={onClose}>
                    <Link to="/login">Close</Link>
                </button>
            </div>
        </div>
    );
};

export default AdminBlock;
