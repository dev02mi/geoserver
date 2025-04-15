import React from 'react'

const LabelBox = ({ required, label, lableclassName }) => {
    return (
        <>
            {required && <span className="required-field">*</span>}
            {label && <label className={lableclassName || 'input_label'}>{label}</label>}
        </>
    )
}

export default LabelBox
