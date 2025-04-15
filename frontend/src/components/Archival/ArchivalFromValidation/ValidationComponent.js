import React, { useState, useEffect } from 'react';

const validateMobile = (value) => {
    if (!value) {
        return "Field is required";
    }
    return ""; // No errors
};




const validateUserName = (value) => {

    const isEmpty = !value;
    const isTooShort = value.length < 6;
    const containsDot = /\./.test(value);
    const lacksAlphabet = !/[a-zA-Z]/.test(value);

    if (isEmpty) {
        return "Field is required";
    } else if (isTooShort) {
        return "Min 6 characters";
    } else if (containsDot) {
        return "Dot (.) is not allowed";
    } else if (lacksAlphabet) {
        return "Alphabet is required";
    }

    return ""; // No errors
};

const validateEmail = (value) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!value) {
        return "Field is required";
    } else if (value.length < 6) {
        return "Min 6 characters";
    } else if (value.length > 100) {
        return "Max 100 characters";
    } else if (!emailRegex.test(value)) {
        return "Invalid Email format";
    }
    return ""; // No errors
};

const validateCountry = (value) => {
    if (!value) {
        return "Field is required";
    }
    return ""; // No errors
};

const validateState = (value) => {
    if (!value) {
        return "Field is required";
    }
    return ""; // No errors
};

const validateCity = (value) => {
    if (!value) {
        return "Field is required";
    }
    return ""; // No errors
};

const validateFirstName = (value) => {
    if (!value) {
        return "Field is required";
    }
    return ""; // No errors
};

const validatemiddlename = (value) => {
    if (!value) {
        return;
    }
    return ""; // No errors
};

const validatelastName = (value) => {
    if (!value) {
        return "Field is required";
    }
    return "";
};

const validateFirstNameWarning = (value, maxLength) => {
    if (value.length >= maxLength) {
        return `Max ${maxLength} characters.`;
    }
    return "";
};

const validateOrganization = (value) => {
    if (!value) {
        return "Field is required";
    }
    return "";
};

const validateDesignation = (value) => {
    if (!value) {
        return "Field is required";
    }
    return "";
};

const validatePassword = (value) => {
    const errors = [];
    if (!value) {
        errors.push("Field is required");
    } else if (value.length < 8) {
        errors.push("Min 8 characters.");
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/.test(value)) {
        errors.push("[a-z,A-Z,0-9,!@#$%^&*].");
    }
    return errors;
};

const validateConfirmPassword = (password, confirmPassword) => {
    const errors = [];
    if (!confirmPassword) {
        errors.push("Field is required");
    } else if (password !== confirmPassword) {
        errors.push("Passwords do not match");
    }
    return errors;
};



const ValidationComponent = ({ value, type, onblur, maxLength, password, onChangeError }) => {
    const [error, setError] = useState('');
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        let validationError = '';
        let validationWarning = '';

        if (onblur) {
            switch (type) {
                case 'firstname':
                    validationError = validateFirstName(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'middlename':
                    validationError = validatemiddlename(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'lastname':
                    validationError = validatelastName(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'mobile':
                    validationError = validateMobile(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'organization':
                    validationError = validateOrganization(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'designation':
                    validationError = validateDesignation(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'email':
                    validationError = validateEmail(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'country':
                    validationError = validateCountry(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'state':
                    validationError = validateState(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'city':
                    validationError = validateCity(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'username':
                    validationError = validateUserName(value);
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'password':
                    const passwordErrors = validatePassword(value);
                    if (passwordErrors.length > 0) {
                        validationError = passwordErrors.join(', ');
                    }
                    validationWarning = validateFirstNameWarning(value, maxLength);
                    break;
                case 'confirm_password':
                    const confirmPasswordErrors = validateConfirmPassword(password, value);
                    if (confirmPasswordErrors.length > 0) {
                        validationError = confirmPasswordErrors.join(', ');
                    }
                    break;
                default:
                    break;
            }

            setError(validationError);
            onChangeError(validationError);

            if (!validationError && validationWarning) {
                setWarningMessage(validationWarning);
                const timeoutId = setTimeout(() => {
                    setWarningMessage('');
                }, 3000);

                return () => clearTimeout(timeoutId);
            } else {
                setWarningMessage('');
            }
        }
    }, [value, type, onblur, maxLength, password]);

    return (
        <>
            {onblur && error && <span className="error-message" style={{ color: '#f44336', fontSize: '12px', paddingLeft: "2px" }}>{error}</span>}
            {!error && warningMessage && <span className="warning-message" style={{ color: 'blue', fontSize: '12px', paddingLeft: "2px" }}>{warningMessage}</span>}
        </>
    );
};

export default ValidationComponent;