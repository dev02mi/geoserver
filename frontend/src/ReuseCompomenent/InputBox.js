import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Form } from 'react-bootstrap';
import "./InputBox.css";

const InputBox = ({
  inputType,
  value,
  onChange,
  onBlur,
  errorMessage,
  name,
  maxLength,
  touched,
  countryCodes,
  handleCountryCodeChange,
  selectedCountryCode,
  placeHolder,
  disabled,
  min,
  max,
  inputboxClass
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const preventPaste = (e) => {
    e.preventDefault();
  };
  return (
    <div className="mb-2">
      {name === 'MOBILE_NO' && countryCodes ? (
        <div className="d-flex">
          <select
            className="input-group-text p-0 bg-white no-padding-left"
            onChange={handleCountryCodeChange}
            value={selectedCountryCode}
            disabled
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code}
              </option>
            ))}
          </select>
          <Form.Control
            size="lg"
            type="tel"
            name="MOBILE_NO"
            placeholder={placeHolder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            className={`  ${inputboxClass || "inputBox_wraper"}   ${touched && errorMessage ? 'is-invalid' : ''}`}
            disabled={disabled}
          />
        </div>
      ) : (
        <Form.Group className="position-relative">
          <Form.Control
            size="lg"
            disabled={disabled}
            type={
              name === 'PASSWORD'
                ? showPassword
                  ? 'text'
                  : 'password'
                : name === 'CONFIRM_PASSWORD'
                  ? showConfirmPassword
                    ? 'text'
                    : 'password'
                  : inputType
            }
            name={name}
            value={value}
            placeholder={placeHolder}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}

            min={name === 'DOB' ? min : undefined}
            max={name === 'DOB' ? max : undefined}


            onPaste={(e) => {
              if (name === 'PASSWORD' || name === 'CONFIRM_PASSWORD') {
                preventPaste(e);
              }
            }}
            className={`  ${inputboxClass || "inputBox_wraper"}   ${touched && errorMessage ? 'is-invalid' : ''}`}
          />
          {(name === 'PASSWORD' || name === 'CONFIRM_PASSWORD') && (
            <FontAwesomeIcon
              icon={name === 'PASSWORD' ? (showPassword ? faEye : faEyeSlash) : showConfirmPassword ? faEye : faEyeSlash}
              onClick={name === 'PASSWORD' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
              className="password-icon"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
            />
          )}
        </Form.Group>
      )}
    </div>
  );
};

export default InputBox;
