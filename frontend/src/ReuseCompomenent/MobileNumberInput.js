import React from 'react';
import { Form } from 'react-bootstrap';

const MobileNumberInput = ({
    label,
    required,
    countryCodes,
    selectedCountryCode,
    handleCountryCodeChange,
    valueMobile,
    onChange,
    onBlur,
    errorMessage,
    name,
    maxLength,
    touched,
}) => {
    return (
        <div>
         
            <Form.Group className="d-flex">
                <select
                    className="input-group-text p-0 bg-white no-padding-left"
                    onChange={handleCountryCodeChange}
                    value={selectedCountryCode}
                >
                    {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.code}
                        </option>
                    ))}
                </select>
                <Form.Control
                    size="lg"
                    type="text"
                    name="MOBILE_NO"
                    value={valueMobile}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    className={`Input-Text ${touched && errorMessage ? 'is-invalid' : ''}`}
                />
            </Form.Group>

        </div>
    );
};

export default MobileNumberInput;
