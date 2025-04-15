import React, { useState, useEffect, useMemo } from "react";

const MaxLengthErrorMessage = ({ isVisible, InputFields, onBlur }) => {
    const [showError, setShowError] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 3000); // Set the timeout to 3 seconds
            return () => clearTimeout(timer);
        } else {
            setShowError(false);
        }
    }, [isVisible]);
    return (
        <span className={`error-messageMaxlengthAU ${showError ? 'fade-in' : 'fade-out'}`}>
            Max {InputFields} Characters
        </span>
    );
};

export default MaxLengthErrorMessage;

