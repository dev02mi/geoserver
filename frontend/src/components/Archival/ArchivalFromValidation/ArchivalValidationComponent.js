//// this code is working without max length message showing good

// import React, { useState, useEffect } from 'react';

// const ArchivalValidationComponent = ({
//     label,
//     name,
//     value,
//     validationRules = [],
//     onChange,
//     className = '',
//     onValidationError,
//     maxLength,
//     ...inputProps
// }) => {
//     const [error, setError] = useState('');
//     const [maxLengthWarning, setMaxLengthWarning] = useState('');
//     const [focused, setFocused] = useState(false);

//     const blueBorderFields = [
//         'cl_orderna', 'cl_projna', 'cl_purpose', 'cl_address1', 'cl_address2',
//         'dloca_cy', 'dloca_st', 'dloca_dt', 'dloca_loca', 'al_da_path',
//         'al_sh_path', 'al_ql_path'
//     ];

//     useEffect(() => {
//         let validationError = '';

//         // Perform other validations
//         for (const rule of validationRules) {
//             if (rule.required && !value) {
//                 validationError = 'Field is required';
//                 break;
//             }
//             if (rule.pattern && !rule.pattern.test(value)) {
//                 validationError = rule.message || 'Invalid input.';
//                 break;
//             }
//         }

//         // Update error state and notify parent
//         if (error !== validationError) {
//             setError(validationError);
//             onValidationError(name, validationError);
//         }
//     }, [value, validationRules, onValidationError, name, error]);

//     useEffect(() => {
//         // Only show maxLength warning if no other validation errors are present
//         if (focused && !error && maxLength !== undefined) {
//             if (value.length >= maxLength) {
//                 setMaxLengthWarning(`Max ${maxLength} characters.`);
//             } else {
//                 setMaxLengthWarning('');
//             }
//         } else {
//             setMaxLengthWarning('');
//         }
//     }, [value, focused, maxLength, error]);

//     const handleFocus = () => setFocused(true);
//     const handleBlur = () => setFocused(false);

//     // Ensure value is truncated to maxLength if applicable
//     const handleChange = (e) => {
//         const newValue = e.target.value;
//         if (maxLength && newValue.length > maxLength) {
//             // Limit the value to maxLength
//             onChange({ target: { name, value: newValue.slice(0, maxLength) } });
//         } else {
//             onChange(e);
//         }
//     };

//     return (
//         <div>
//             <label htmlFor={name} className="ArchivalFormLable">
//                 {validationRules.some(rule => rule.required) && (
//                     <span style={{ color: 'red', fontSize: 'min(3vw, 12px)' }}>*</span>
//                 )}
//                 {label}
//                 <span className={`ArchivalFormValidationtooltip ${error || maxLengthWarning ? 'hasWarning' : ''}`}>
//                     {error && <span className="ArchivalFormValidationtooltiptext">{error}</span>}
//                     {maxLengthWarning && !error && (
//                         <span className="ArchivalmaxLengthError">{maxLengthWarning}</span>
//                     )}
//                 </span>
//             </label>
//             <input
//                 id={name}
//                 name={name}
//                 value={value}
//                 onChange={handleChange}
//                 onFocus={handleFocus}
//                 onBlur={handleBlur}
//                 {...inputProps}
//                 className={`${className} ${error ? 'ArchivalInvalidInput' : ''}`}
//                 style={{
//                     border: error
//                         ? '1px solid red'
//                         : blueBorderFields.includes(name)
//                             ? '1px solid blue'
//                             : '1px solid green', // Blue border for specific names, green border for valid input
//                 }}
//             />
//         </div>
//     );
// };

// export default ArchivalValidationComponent;



// this code is working properly with max length error also
import React, { useState, useEffect } from 'react';

const ArchivalValidationComponent = ({
    label,
    name,
    value,
    validationRules = [],
    onChange,
    className = '',
    onValidationError,
    maxLength,
    ...inputProps
}) => {
    const [error, setError] = useState('');
    const [maxLengthWarning, setMaxLengthWarning] = useState('');
    const [focused, setFocused] = useState(false);

    const blueBorderFields = [
        'cl_orderna', 'cl_projna', 'cl_purpose', 'cl_address1', 'cl_address2',
        'dloca_cy', 'dloca_st', 'dloca_dt', 'dloca_loca', 'al_da_path',
        'al_sh_path', 'al_ql_path'
    ];

    useEffect(() => {
        let validationError = '';

        // Perform other validations
        for (const rule of validationRules) {
            if (rule.required && !value) {
                validationError = 'Field is required';
                break;
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                validationError = rule.message || 'Invalid input.';
                break;
            }
        }

        // Update error state and notify parent
        if (error !== validationError) {
            setError(validationError);
            onValidationError(name, validationError);
        }
    }, [value, validationRules, onValidationError, name, error]);

    useEffect(() => {
        if (focused && !error && maxLength !== undefined) {
            if (value.length >= maxLength) {
                setMaxLengthWarning(`Max ${maxLength} characters.`);
                const timer = setTimeout(() => {
                    setMaxLengthWarning('');
                }, 3000); // Clear warning after 3 seconds

                // Cleanup timer on unmount or before setting a new timer
                return () => clearTimeout(timer);
            } else {
                setMaxLengthWarning('');
            }
        } else {
            setMaxLengthWarning('');
        }
    }, [value, focused, maxLength, error]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    // Ensure value is truncated to maxLength if applicable
    const handleChange = (e) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength) {
            // Limit the value to maxLength
            onChange({ target: { name, value: newValue.slice(0, maxLength) } });
        } else {
            onChange(e);
        }
    };

    return (
        <div>
            <label htmlFor={name} className="ArchivalFormLable">
                {validationRules.some(rule => rule.required) && (
                    <span style={{ color: 'red', fontSize: 'min(3vw, 12px)' }}>*</span>
                )}
                {label}
                <span className={`ArchivalFormValidationtooltip ${error || maxLengthWarning ? 'hasWarning' : ''}`}>
                    {error && <span className="ArchivalFormValidationtooltiptext">{error}</span>}
                    {maxLengthWarning && !error && (
                        <span className="ArchivalmaxLengthError">{maxLengthWarning}</span>
                    )}
                </span>
            </label>
            <input
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...inputProps}
                className={`${className} ${error ? 'ArchivalInvalidInput' : ''}`}
                style={{
                    border: error
                        ? '1px solid red'
                        : blueBorderFields.includes(name)
                            ? '1px solid blue'
                            : '1px solid green', // Blue border for specific names, green border for valid input
                }}
            />
        </div>
    );
};

export default ArchivalValidationComponent;
