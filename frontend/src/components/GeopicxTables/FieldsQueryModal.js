import React, { useState } from 'react';
import './FieldsQueryModal.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faClose } from "@fortawesome/free-solid-svg-icons";

const FieldsQueryModal = ({ onClose }) => { // Corrected here
    const [selectedField, setSelectedField] = useState('');
    const [operator, setOperator] = useState('');
    const [value, setValue] = useState('');
    const [whereClause, setWhereClause] = useState('');

    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
    };

    const handleOperatorChange = (event) => {
        setOperator(event.target.value);
    };

    const handleValueChange = (event) => {
        setValue(event.target.value);
    };

    const handleAddCondition = () => {
        const newCondition = `${selectedField} ${operator} ${value}`;
        setWhereClause((prevClause) => {
            if (prevClause) {
                return `${prevClause} AND ${newCondition}`;
            } else {
                return newCondition;
            }
        });
        setSelectedField('');
        setOperator('');
        setValue('');
    };

    const handleClear = () => {
        setWhereClause('');
        setSelectedField('');
        setOperator('');
        setValue('');
    };

    const handleApply = () => {
        // Implement logic to apply the WHERE clause here
        console.log('Applying WHERE clause:', whereClause);
    };

    return (
        <div className='FilesQueryModalBox'>
            <div className="fields-query-modal">
                <div className="FilesQueryModalBoxModal-header">
                    <span className="FilesQueryModalBoxModal-title">Select by Attributes</span>
                    <div className="FilesQueryModalBoxClose-button" onClick={onClose}><FontAwesomeIcon icon={faClose} /></div>
                </div>
                <div className="FilesQueryModalBoxModal-body">
                    <div className="FilesQueryModalBoxWhere-clause-section">
                        <p>Enter a WHERE clause to select records in the table window.</p>
                        <div className="field-select">
                            <label htmlFor="field-dropdown">Method:</label>
                            <select id="field-dropdown" value={selectedField} onChange={handleFieldChange}>
                                <option value="FID">FID</option>
                                <option value="STNCODE">STNCODE</option>
                                <option value="STENAME">STENAME</option>
                                <option value="DVNCODE">DVNCODE</option>
                                <option value="DVENAME">DVENAME</option>
                            </select>
                        </div>
                        <div className="operator-select">
                            <label htmlFor="operator-dropdown">Operator:</label>
                            <select id="operator-dropdown" value={operator} onChange={handleOperatorChange}>
                                <option value="=">=</option>
                                <option value="<>">
                                    <FontAwesomeIcon
                                        icon={faCaretLeft}
                                    />
                                    <FontAwesomeIcon
                                        icon={faCaretRight}
                                    />
                                </option>
                                <option value=">">
                                    <FontAwesomeIcon
                                        icon={faCaretRight}
                                    />
                                </option>
                                <option value=">=">
                                    <FontAwesomeIcon
                                        icon={faCaretRight}
                                    />
                                    =
                                </option>
                                <option value="<">
                                    <FontAwesomeIcon
                                        icon={faCaretLeft}
                                    />
                                </option>
                                <option value="<=">
                                    <FontAwesomeIcon
                                        icon={faCaretLeft}
                                    />
                                    =
                                </option>
                                <option value="Like">Like</option>
                                <option value="And">And</option>
                                <option value="Or">Or</option>
                                <option value="Not">Not</option>
                            </select>
                        </div>
                        <div className="value-input">
                            <label htmlFor="value-input">Value:</label>
                            <input type="text" id="value-input" value={value} onChange={handleValueChange} />
                        </div>
                        <button onClick={handleAddCondition}>Add Condition</button>
                    </div>
                    <div className="where-clause-output">
                        <p>WHERE:</p>
                        <textarea value={whereClause} readOnly />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={handleClear}>Clear</button>
                    <button onClick={handleApply}>Apply</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default FieldsQueryModal;
