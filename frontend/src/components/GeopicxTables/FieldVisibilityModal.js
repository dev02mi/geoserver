import React, { useState, useEffect } from 'react';
import './GeopicxTables.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faListCheck, faUpLong, faDownLong, faCaretDown, faClose, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const DropdownBox = ({ isVisible, toggleVisibility, options, onOptionClick }) => (
    <>
        <span className="GeopicxTablesModalHeaderMoveToDown" onClick={toggleVisibility}><FontAwesomeIcon icon={faCaretDown} /></span>
        {isVisible && (
            <div className="GeopicxTablesModalBox">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="GeopicxTablesModalBoxOption"
                        onClick={() => onOptionClick(index)}
                    >
                        {option}
                    </div>
                ))}
            </div>
        )}
    </>
);

const FieldVisibilityModal = ({ fields, onClose, onToggleField, onApplyChanges }) => {
    const [isBoxVisibleUp, setIsBoxVisibleUp] = useState(false);
    const [isBoxVisibleDown, setIsBoxVisibleDown] = useState(false);
    const [isOptionsBoxVisible, setIsOptionsBoxVisible] = useState(false);
    const [tempFields, setTempFields] = useState(fields);
    const [originalFields, setOriginalFields] = useState(fields);
    const [areAllFieldsChecked, setAreAllFieldsChecked] = useState(true);
    const [selectedField, setSelectedField] = useState(fields[0] || null);

    // State to track the currently open collapsible section and details
    const [openCollapsible, setOpenCollapsible] = useState(null);
    const [details, setDetails] = useState('');
    useEffect(() => {
        if (tempFields.length > 0 && !selectedField) {
            setSelectedField(tempFields[0]);
        }
    }, [tempFields, selectedField]);

    const toggleBoxVisibilityUp = () => {
        setIsBoxVisibleUp(!isBoxVisibleUp);
        setIsBoxVisibleDown(false);
        setIsOptionsBoxVisible(false);
    };

    const toggleBoxVisibilityDown = () => {
        setIsBoxVisibleDown(!isBoxVisibleDown);
        setIsBoxVisibleUp(false);
        setIsOptionsBoxVisible(false);
    };

    const toggleOptionsBoxVisibility = () => {
        setIsOptionsBoxVisible(!isOptionsBoxVisible);
        setIsBoxVisibleUp(false);
        setIsBoxVisibleDown(false);
    };

    const moveFieldToTop = () => {
        if (selectedField) {
            const index = tempFields.findIndex(field => field.name === selectedField.name);
            if (index > 0) {
                const updatedFields = [...tempFields];
                const [movedField] = updatedFields.splice(index, 1);
                updatedFields.unshift(movedField);
                setTempFields(updatedFields);
                setSelectedField(updatedFields[0]);
                scrollToField(0); // Scroll to the top field
            }
        }
    };

    const moveFieldToBottom = () => {
        if (selectedField) {
            const index = tempFields.findIndex(field => field.name === selectedField.name);
            if (index < tempFields.length - 1) {
                const updatedFields = [...tempFields];
                const [movedField] = updatedFields.splice(index, 1);
                updatedFields.push(movedField);
                setTempFields(updatedFields);
                setSelectedField(updatedFields[updatedFields.length - 1]);
                scrollToField(updatedFields.length - 1); // Scroll to the bottom field
            }
        }
    };

    const moveFieldUp = () => {
        if (selectedField) {
            const index = tempFields.findIndex(field => field.name === selectedField.name);
            if (index > 0) {
                const updatedFields = [...tempFields];
                const [movedField] = updatedFields.splice(index, 1);
                updatedFields.splice(index - 1, 0, movedField);
                setTempFields(updatedFields);
                setSelectedField(updatedFields[index - 1]);
                scrollToField(index - 1); // Scroll to the moved-up field
            }
        }
    };

    const moveFieldDown = () => {
        if (selectedField) {
            const index = tempFields.findIndex(field => field.name === selectedField.name);
            if (index < tempFields.length - 1) {
                const updatedFields = [...tempFields];
                const [movedField] = updatedFields.splice(index, 1);
                updatedFields.splice(index + 1, 0, movedField);
                setTempFields(updatedFields);
                setSelectedField(updatedFields[index + 1]);
                scrollToField(index + 1); // Scroll to the moved-down field
            }
        }
    };


    const scrollToField = (index) => {
        const rowElement = document.getElementById(`field-${index}`);
        if (rowElement) rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleCheckboxChange = (index) => {
        const updatedFields = tempFields.map((field, i) =>
            i === index ? { ...field, visible: !field.visible } : field
        );
        setTempFields(updatedFields);
    };

    const handleCheckAll = () => {
        const updatedFields = tempFields.map(field => ({ ...field, visible: true }));
        setTempFields(updatedFields);
        setAreAllFieldsChecked(true);
    };

    const handleUncheckAll = () => {
        const updatedFields = tempFields.map(field => ({ ...field, visible: false }));
        setTempFields(updatedFields);
        setAreAllFieldsChecked(false);
    };

    const handleApplyChanges = () => {
        tempFields.forEach((field, index) => {
            if (field.visible !== fields[index].visible) {
                onToggleField(index);
            }
        });
        onApplyChanges(tempFields);
    };

    const handleFieldClick = (index) => {
        setSelectedField(tempFields[index]);
    };

    const handleHighlightChange = (highlight) => {
        if (selectedField) {
            const updatedFields = tempFields.map(field =>
                field.name === selectedField.name ? { ...field, highlight } : field
            );
            setTempFields(updatedFields);
            setSelectedField({ ...selectedField, highlight });
        }
    };

    const handleSortAscending = () => {
        const sortedFields = [...tempFields].sort((a, b) => a.name.localeCompare(b.name));
        setTempFields(sortedFields);
    };

    const handleSortDescending = () => {
        const sortedFields = [...tempFields].sort((a, b) => b.name.localeCompare(a.name));
        setTempFields(sortedFields);
    };

    const handleResetFieldOrder = () => {
        setTempFields(originalFields);
    };

    const Collapsible = ({ title, children, id }) => {
        const [isOpen, setIsOpen] = useState(true);

        return (
            <div className="GeopicxTablecollapsible-container">
                <div className="GeopicxTablecollapsible-containerbox">
                    <span className="GeopicxTablecollapsible-icon" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />}
                    </span>
                    <div className="GeopicxTablecollapsible-button" onClick={() => handleCollapsibleClick(id)}>
                        {title}
                    </div>
                </div>
                {isOpen && <span className="GeopicxTablecollapsible-content">{children}</span>}
            </div>
        );
    };

    const handleCollapsibleClick = (section) => {
        setOpenCollapsible(section);
        switch (section) {
            case 'appearance':
                setDetails(
                    `<span class="collapesTitle">Appearance</span><br/><span>Properties that control the display of field information</span>`
                );
                break;
            case 'alias':
                setDetails(
                    `<span class="collapesTitle">Alias</span><br/><span>Descriptive name for the field</span>`
                );
                break;
            case 'highlight':
                setDetails(
                    `<span class="collapesTitle">Highlight</span><br/><span>Determine if the field is accentuated when displayed</span>`
                );
                break;
            case 'field-details':
                setDetails(
                    `<span class="collapesTitle">Field Details</span><br/><span>Properties defined by the table fields</span>`
                );
                break;
            case 'data-type':
                setDetails(
                    `<span class="collapesTitle">Data Type</span><br/><span>Type of information stored in the field</span>`
                );
                break;
            case 'length':
                setDetails(
                    `<span class="collapesTitle">Length</span><br/><span>Maximum length of string allowed</span>`
                );
                break;
            case 'name':
                setDetails(
                    `<span class="collapesTitle">Name</span><br/><span>Name of the field defined in the table</span>`
                );
                break;
            default:
                setDetails('');
                break;
        }
    };
    return (
        <div className="GeopicxTablesModalMainContainer">
            <div className="GeopicxTablesmodal">
                <div className="GeopicxTablesmodal-content">
                    <div className='GeopicxTablesmodal-contentTopHeader'>
                        <div className='Geopicxtopheadertext'>Field Properties</div>
                        <div className='GeopicxClosebtn' onClick={onClose}><FontAwesomeIcon icon={faClose} /></div>
                    </div>
                    <div style={{ border: ' 1px solid gray', padding: '0px 5px 10px 5px' }}>
                        <div className="GeopicxTablesModalFieldsHeader">
                            <span className="GeopicxTablesModalHeaderChecklist" onClick={handleCheckAll} title='Turn all fields on'>
                                <FontAwesomeIcon icon={faList} />
                            </span>
                            <span className="GeopicxTablesModalHeaderUnChecklist" onClick={handleUncheckAll} title='Turn all fields off'>
                                <FontAwesomeIcon icon={faListCheck} />
                            </span>
                            |
                            <span className="GeopicxTablesModalHeaderDirectionUp" title='Move Up'>
                                <span className="GeopicxTablesModalHeaderMoveUp" onClick={moveFieldUp} >
                                    <FontAwesomeIcon icon={faUpLong} />
                                </span>
                                <DropdownBox
                                    isVisible={isBoxVisibleUp}
                                    toggleVisibility={toggleBoxVisibilityUp}
                                    options={['Move Up', 'Move To Top']}
                                    onOptionClick={(index) => {
                                        if (index === 0) moveFieldUp();
                                        else if (index === 1) moveFieldToTop();
                                    }}
                                />
                            </span>
                            |
                            <span className="GeopicxTablesModalHeaderDirectionDown" title='Move Down'>
                                <span className="GeopicxTablesModalHeaderMoveDown" onClick={moveFieldDown} >
                                    <FontAwesomeIcon icon={faDownLong} />
                                </span>
                                <DropdownBox
                                    isVisible={isBoxVisibleDown}
                                    toggleVisibility={toggleBoxVisibilityDown}
                                    options={['Move Down', 'Move To Bottom']}
                                    onOptionClick={(index) => {
                                        if (index === 0) moveFieldDown();
                                        else if (index === 1) moveFieldToBottom();
                                    }}
                                />
                            </span>
                            |
                            <span className="GeopicxTablesModalHeaderOptionsBtn" title='Options'>
                                <span className="GeopicxTablesModalHeaderOptionsTxt" >Options</span>
                                <DropdownBox
                                    isVisible={isOptionsBoxVisible}
                                    toggleVisibility={toggleOptionsBoxVisibility}
                                    // options={['Sort Ascending', 'Sort Descending', 'Reset Field Order', 'Show Field Name', 'Show Field Aliases']}
                                    options={['Sort Ascending', 'Sort Descending', 'Reset Field Order']}
                                    onOptionClick={(index) => {
                                        if (index === 0) handleSortAscending();
                                        else if (index === 1) handleSortDescending();
                                        else if (index === 2) handleResetFieldOrder();
                                        // Add logic for 'Show Field Name' and 'Show Field Aliases' if needed
                                    }}
                                />
                            </span>
                        </div>
                        <div className='GeopicxTablesfieldlistMainBox'>
                            <div className="GeopicxTablesfield-listLeftbox">
                                <div className='GeopicxTablesfield-listLeftboxFixed'>Choose which fields will be visible</div>
                                {tempFields.map((field, index) => (
                                    <div
                                        id={`field-${index}`} // Add ID for scrolling
                                        key={index}
                                        className={`GeopicxTablesfield-item ${selectedField && selectedField.name === field.name ? 'selected' : ''}`}
                                        onClick={() => handleFieldClick(index)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={field.visible}
                                            onChange={() => handleCheckboxChange(index)}
                                        />
                                        <label>
                                            {field.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="GeopicxTablesModalFieldsRightBox">
                                <div className="GeopicxTablesModalFieldsRightBoxApperance">
                                    <Collapsible title="Appearance" id="appearance">
                                        {selectedField && (
                                            <div className="GeopicxTablesModalFieldsRightBoxApperancerow">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td title='alias' onClick={() => handleCollapsibleClick('alias')}>Alias</td>
                                                            <td>{selectedField.name || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td onClick={() => handleCollapsibleClick('highlight')}>Highlight</td>
                                                            <td>
                                                                <select
                                                                    value={selectedField.highlight || 'no'}
                                                                    onChange={(e) => handleHighlightChange(e.target.value)}
                                                                >
                                                                    <option value="yes">Yes</option>
                                                                    <option value="no">No</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </Collapsible>
                                    <Collapsible title="Field Details" id="field-details">
                                        {selectedField && (
                                            <div className="GeopicxTablesModalFieldsRightBoxApperancerow">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td onClick={() => handleCollapsibleClick('data-type')}>Data Type</td>
                                                            <td>{typeof (selectedField.name) || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td onClick={() => handleCollapsibleClick('length')}>Length</td>
                                                            <td>{selectedField.name.length || 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td onClick={() => handleCollapsibleClick('name')}>Name</td>
                                                            <td>{selectedField.name}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </Collapsible>
                                </div>
                                <div className="GeopicxTablesModalFieldsRightBoxApperancerowdetailsbox">
                                    <span dangerouslySetInnerHTML={{ __html: details }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='GeopicxTableBtnBox'>
                        <button onClick={handleApplyChanges}>Apply</button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldVisibilityModal;
