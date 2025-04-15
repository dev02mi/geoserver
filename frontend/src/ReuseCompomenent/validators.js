import React, { useState, useEffect } from 'react';

const validateMobile = (value) => {
  if (!value) {
    return "Field is required";
  } else if (value.charAt(0) === '0') {
    return "Mobile number does not start with 0";
  } else if (value.length < 10) {
    return "10 digits required";
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

const validateEmail = (value, type) => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;

  if (!value) {
    return type === "EMAIL_ALT" ? "" : "Field is required";
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

const WarningMessage = (value, maxLength) => {
  if (!value) {
    return "";
  }
  if (value.length >= maxLength) {
    return `Max ${maxLength} characters`;
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
const validateTheme = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateDepartment = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateaddress1 = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};


const validateQuestion1 = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateQuestion2 = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateAns1 = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateAns2 = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
const validateoldpassword = (value) => {
  if (!value) {
    return "Field is required";
  }
  return "";
};
// pincode////
const validatePinCode = (value, type) => {
  if (!value) {
    return type === "PHONE_LAN" ? "" : "Field is required";
  } else if (value.length < 6) {
    return '6 digit required';
  }
};







const validatePassword = (value) => {
  const errors = [];
  if (!value) {
    errors.push("Field is required");
  } else {
    if (value.length < 8) {
      errors.push("Min 8 characters");
    } else if (!/[a-z]/.test(value)) {
      errors.push("At least one lowercase");
    } else if (!/[A-Z]/.test(value)) {
      errors.push("At least one uppercase");
    } else if (!/[0-9]/.test(value)) {
      errors.push("At least one number");
    } else if (!/[!@#$%^&*]/.test(value)) {
      errors.push("Special char (!@#$%^&*)");
    }
  }
  return errors;
};



const validateConfirmPassword = (password, confirmPassword) => {



  const errors = [];
  if (!confirmPassword) {
    errors.push("Field is required");
  } else if (password !== confirmPassword) {
    errors.push("Password not match");
  }
  return errors;
};





const Validators = ({ value, type, onblur, maxLength, password, onChangeError, errorMessage }) => {

  const [error, setError] = useState("");
  const [warningMessage, setWarningMessage] = useState('');


  useEffect(() => {
    let validationError = '';
    let validationWarning = '';

    if (onblur) {
      switch (type) {
        case 'firstname':
          validationError = validateFirstName(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'middlename':
          validationError = validatemiddlename(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'lastname':
          validationError = validatelastName(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'mobile':
          validationError = validateMobile(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'organization':
          validationError = validateOrganization(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'designation':
          validationError = validateDesignation(value);
          validationWarning = WarningMessage(value, maxLength);
          break;

        case 'theme':
          validationError = validateTheme(value);
          break;
        case 'department':
          validationError = validateDepartment(value);
          break;

        case 'email':
          validationError = validateEmail(value, 'EMAIL');;
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'EMAIL_ALT':
          validationError = validateEmail(value, 'EMAIL_ALT');
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'country':
          validationError = validateCountry(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'state':
          validationError = validateState(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'city':
          validationError = validateCity(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'username':
          validationError = validateUserName(value);
          validationWarning = WarningMessage(value, maxLength);
          break;

        case 'pincode':
          validationError = validatePinCode(value, "pincode");
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'PHONE_LAN':
          validationError = validatePinCode(value, "PHONE_LAN");
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'address1':
          validationError = validateaddress1(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'address2':
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'Remark':
          validationWarning = WarningMessage(value, maxLength);
          break;

        case 'Question1':
          validationError = validateQuestion1(value);
          break;
        case 'Question2':
          validationError = validateQuestion2(value);
          break;
        case 'ans1':
          validationError = validateAns1(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'ans2':
          validationError = validateAns2(value);
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'oldpassword':
          validationError = validateoldpassword(value);
          break;
        case 'password':
          const passwordErrors = validatePassword(value);
          if (passwordErrors.length > 0) {
            validationError = passwordErrors.join(', ');
          }
          validationWarning = WarningMessage(value, maxLength);
          break;
        case 'confirm_password':
          const confirmPasswordErrors = validateConfirmPassword(password, value);
          if (confirmPasswordErrors.length > 0) {
            validationError = confirmPasswordErrors.join(', ');
          }
          break;
        case 'Location':
          validationWarning = WarningMessage(value, maxLength);
          break;
        default:
          break;
      }

      setError(validationError || errorMessage);
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
  }, [value, type, onblur, maxLength, password, errorMessage]);

  return (
    <>
      {!errorMessage ? (
        onblur && error && (
          <span className="error-message" style={{ color: '#f44336', fontSize: '12px', paddingLeft: "2px" }}>
            {error}
          </span>
        )
      ) : (
        <span className="error-message" style={{ color: '#f44336', fontSize: '12px', paddingLeft: "2px" }}>
          {errorMessage}
        </span>
      )}

      {!error && warningMessage && <span className="warning-message" style={{ color: 'blue', fontSize: '12px', paddingLeft: "5px", fontStyle: "italic" }}>{warningMessage}</span>}



    </>
  );
};

export default Validators;