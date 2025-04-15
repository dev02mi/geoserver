import React from 'react';
import LabelBox from './LabelBox';
import Validators from './validators';
import InputBox from './InputBox';

const FormInputGroup = ({
    label,
    required,
    value,
    type,
    onBlur,
    onblur,
    maxLength,
    onChangeError,
    onChange,
    errorMessage,
    name,
    touched,
    inputType = 'text',
    countryCodes,
    handleCountryCodeChange,
    selectedCountryCode,
    placeHolder,
    disabled,
    password,
    max,
    min,
    lableclassName,
    inputboxClass
}) => {
    return (

        <>
            <div className=''>
                <LabelBox label={label} required={required} lableclassName={lableclassName} />
                <Validators
                    value={value}
                    type={type}
                    onblur={onblur}
                    maxLength={maxLength}
                    onChangeError={onChangeError}
                    password ={password}                    
                />
            </div>
            <div className="">
                <InputBox
                    label={label}
                    inputType={inputType}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    errorMessage={errorMessage}
                    name={name}
                    maxLength={maxLength}
                    touched={touched}
                    countryCodes={countryCodes}
                    handleCountryCodeChange={handleCountryCodeChange}
                    selectedCountryCode={selectedCountryCode}
                    placeHolder={placeHolder}
                    disabled={disabled}
                    max={max}
                    min={min}
                    inputboxClass={inputboxClass}
                />
            </div>
        </>

    );
};

export default FormInputGroup;
