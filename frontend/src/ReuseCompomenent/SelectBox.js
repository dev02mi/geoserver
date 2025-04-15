import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Validators from './validators';
import LabelBox from './LabelBox';

const SelectBox = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options,
    errorMessage,
    touched,
    className,
    type,
    onblur,
    maxLength,
    onChangeError,
    required,
    disabled,
    userType
}) => {

    return (
        <Form.Group className={`select-box`}>
            <LabelBox label={label} required={required} />
            <Validators
                errorMessage={errorMessage}
                value={value}
                type={type}
                onblur={onblur}
                maxLength={maxLength}
                onChangeError={onChangeError}
            />
            <Form.Control
                as="select"
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`${className} ${touched && errorMessage ? 'is-invalid' : ''}`}
            >
                {/* <option value="">{` ${value ? value : `Choose ${label}...`} `}</option> */}
                {/* <option value="">{ `Choose ${label}...`}</option> */}

                {['country', 'state', 'city'].includes(label.toLowerCase()) ? (
                    <option value="" >{` ${value ? value : `Choose ${label}...`} `}</option>
                ) : userType ?
                    (
                        //  for theme section add this
                        <option value="">{` ${value ? value : `Choose ${label}...`} `}</option>
                    )
                    : (
                        <option value="">{`Choose ${label}...`}</option>
                    )
                }

                {options?.map((option) => (
                    <option key={option?.value} value={option?.value}>
                        {option?.label}
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
    );
};

SelectBox.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    errorMessage: PropTypes.string,
    touched: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.string,
    onblur: PropTypes.func,
    maxLength: PropTypes.number,
    onChangeError: PropTypes.func,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
};

SelectBox.defaultProps = {
    value: '',
    onBlur: null,
    errorMessage: '',
    touched: false,
    className: '',
    type: '',
    onblur: null,
    maxLength: null,
    onChangeError: null,
    required: false,
    disabled: false,
};

export default SelectBox;
