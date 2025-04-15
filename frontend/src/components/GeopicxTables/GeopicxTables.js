import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./GeopicxTables.css";
import { ReactComponent as SelectedRecord } from './SelectedRecord.svg';
import { ReactComponent as CompleteRecord } from './completerecord.svg';
import FieldVisibilityModal from './FieldVisibilityModal';
import FieldsQueryModal from "./FieldsQueryModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForwardStep, faBackwardStep, faCaretLeft, faCaretRight, faFilter, faSliders } from "@fortawesome/free-solid-svg-icons";

const GeopicxTables = ({ tables, openModal, CustomComponent }) => {
    const [activeTableIndex, setActiveTableIndex] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [inputRow, setInputRow] = useState("1");
    const [viewMode, setViewMode] = useState('complete');
    const [Tableloading, setTableloading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [FieldsQueryShowModal, setFieldsQueryShowModal] = useState(false);
    const [fields, setFields] = useState([]);
    const [columnWidths, setColumnWidths] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [dragging, setDragging] = useState(false);
    const [dragStartIndex, setDragStartIndex] = useState(null);
    const [shiftKey, setShiftKey] = useState(false);
    const [ctrlKey, setCtrlKey] = useState(false);

    useEffect(() => {
        if (tables.length > 0) {
            const initialFields = tables[activeTableIndex].columns.map(col => ({
                name: col.header,
                visible: true
            }));
            setFields(initialFields);
        }
    }, [tables, activeTableIndex]);

    const { columns, data } = tables[activeTableIndex] || { columns: [], data: [] };
    const totalItems = data.length;

    // const sortedData = useMemo(() => {
    //     if (sortConfig.key) {
    //         return [...data].sort((a, b) => {
    //             if (a[sortConfig.key] < b[sortConfig.key]) {
    //                 return sortConfig.direction === 'asc' ? -1 : 1;
    //             }
    //             if (a[sortConfig.key] > b[sortConfig.key]) {
    //                 return sortConfig.direction === 'asc' ? 1 : -1;
    //             }
    //             return 0;
    //         });
    //     }
    //     return data;
    // }, [data, sortConfig]);
    const sortedData = useMemo(() => {
        if (sortConfig.key) {
            return [...data].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [data, sortConfig]);

    const sortedSelectedRows = useMemo(() => {
        if (sortConfig.key) {
            return [...selectedRows].sort((a, b) => {
                const aValue = tables[activeTableIndex].data[a][sortConfig.key];
                const bValue = tables[activeTableIndex].data[b][sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return selectedRows;
    }, [selectedRows, sortConfig, tables, activeTableIndex]);



    const handleRecordChange = (direction) => {
        let newIndex = selectedRowIndex;
        if (direction === 'next' && newIndex < totalItems - 1) newIndex += 1;
        else if (direction === 'prev' && newIndex > 0) newIndex -= 1;
        else if (direction === 'first') newIndex = 0;
        else if (direction === 'last') newIndex = totalItems - 1;

        setSelectedRowIndex(newIndex);
        scrollToRow(newIndex);
        setInputRow(newIndex + 1);
    };

    const scrollToRow = (index) => {
        const rowElement = document.getElementById(`row-${index}`);
        if (rowElement) rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputRow(value);

        const rowIndex = Number(value) - 1;
        if (rowIndex >= 0 && rowIndex < totalItems) {
            // setSelectedRows([rowIndex]);
            setSelectedRowIndex(rowIndex);
            scrollToRow(rowIndex);
        }
    };

    const handleRowClick = (rowIndex) => {
        if (ctrlKey) {
            setSelectedRows((prevSelectedRows) => {
                const newSelection = new Set(prevSelectedRows);
                if (newSelection.has(rowIndex)) {
                    newSelection.delete(rowIndex);
                } else {
                    newSelection.add(rowIndex);
                }
                return Array.from(newSelection);
            });
        } else if (shiftKey) {
            if (selectedRows.length > 0) {
                const start = Math.min(selectedRows[0], rowIndex);
                const end = Math.max(selectedRows[0], rowIndex);
                const newSelection = [];
                for (let i = start; i <= end; i++) {
                    newSelection.push(i);
                }
                setSelectedRows(newSelection);
            } else {
                setSelectedRows([rowIndex]);
            }
        } else {
            setSelectedRows([rowIndex]);
        }
    };

    const handleMouseDown = (e, rowIndex) => {
        e.preventDefault();
        setDragging(true);
        setDragStartIndex(rowIndex);
    };

    const handleMouseMove = useCallback((e) => {
        if (dragging) {
            const rowElement = e.target.closest('tr');
            if (rowElement) {
                const index = parseInt(rowElement.getAttribute('data-index'), 10);
                if (index !== undefined) {
                    const newSelectedRows = Array.from({ length: Math.abs(index - dragStartIndex) + 1 }, (_, i) =>
                        Math.min(dragStartIndex, index) + i
                    );
                    setSelectedRows(newSelectedRows);
                }
            }
        }
    }, [dragging, dragStartIndex]);

    const handleMouseUp = () => {
        setDragging(false);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift') setShiftKey(true);
            if (e.key === 'Control') setCtrlKey(true);
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Shift') setShiftKey(false);
            if (e.key === 'Control') setCtrlKey(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleTabClick = (index) => {
        setActiveTableIndex(index);
        setSelectedRows([]);
        setSelectedRowIndex(0);
    };

    const handleViewToggle = (view) => {
        setViewMode(view);
    };

    const handleToggleModal = () => {
        setShowModal(!showModal);
        setFieldsQueryShowModal(false);
    };
    const handlesetFieldsQueryShowModal = () => {
        setFieldsQueryShowModal(!FieldsQueryShowModal);
        setShowModal(false);
    }
    const handleClose = () => {
        setFieldsQueryShowModal(false);
    };

    const handleApplyChanges = (updatedFields) => {
        setFields(updatedFields);
        handleToggleModal();
    };

    const handleToggleField = (index) => {
        const newFields = [...fields];
        newFields[index].visible = !newFields[index].visible;
        setFields(newFields);
    };

    const handleMouseDownResize = (e, columnIndex) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[columnIndex] || 100;

        const handleMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            setColumnWidths((prevWidths) => ({
                ...prevWidths,
                [columnIndex]: Math.max(newWidth, 50)
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const visibleColumns = fields.filter((col, index) => fields[index]?.visible);

    const getAlignmentStyle = (value) => {
        // Helper function to check if a string represents a date
        const isDateString = (str) => {
            const dateFormats = [
                /^\d{2}-\d{2}-\d{4}$/, // dd-mm-yyyy
                /^\d{4}-\d{2}-\d{2}$/, // yyyy-mm-dd
                /^\d{2}\/\d{2}\/\d{4}$/ // mm/dd/yyyy
            ];
            return dateFormats.some(format => format.test(str));
        };

        // Helper function to check if a string represents a number
        const isNumberString = (str) => !isNaN(str) && !isNaN(parseFloat(str));

        // Helper function to check if a string represents a boolean
        const isBooleanString = (str) => str.toLowerCase() === 'true' || str.toLowerCase() === 'false';

        // Handle cases where value is a string
        if (typeof value === 'string') {
            if (isDateString(value)) {
                return { textAlign: 'right' }; // Align dates to the right
            }
            if (isBooleanString(value) || isNumberString(value)) {
                return { textAlign: 'right' };
            }
            return { textAlign: 'left' };
        }

        // Handle other types
        if (typeof value === 'number' || typeof value === 'boolean') {
            return { textAlign: 'right' };
        }

        return { textAlign: 'left' };
    };



    return (
        <div className="GeopicxTablesMainBoxContainer">
            <div className='GeopicxTablesfirstHeader'>
                <h5>Table</h5>
                <div className='GeopicxTablesfirstHeaderRightBox'>
                    <span>✖️</span>
                </div>
            </div>
            <div className='GeopicxTablesSecondHeaderLeftBox'>
                <div className='GeopicxTablesSecondHeaderLeftBoxitems'>
                    <button className="GeopicxTablesRecordBtn" onClick={handleToggleModal}>
                        <FontAwesomeIcon icon={faFilter} />
                    </button>
                    <button className="GeopicxTablesRecordBtn" onClick={handlesetFieldsQueryShowModal}>
                        <FontAwesomeIcon icon={faSliders} />
                    </button>
                </div>
            </div>
            <div className='GeopicxTablesContainerBodyHeader'>
                <h5>
                    {tables.map((table, index) => (
                        <span
                            key={index}
                            className={`geopicxtableactivename ${index === activeTableIndex ? 'active' : ''}`}
                            onClick={() => handleTabClick(index)}
                        >
                            {index === activeTableIndex && table.name}
                        </span>
                    ))}
                </h5>
                <div className='GeopicxTablesContainerBodyHeaderRightBox'>
                    <span>✖️</span>
                </div>
            </div>
            <div className="GeopicxTablesMainBoxBody">
                {Tableloading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {viewMode === 'complete' && visibleColumns.length > 0 && (
                            <table className="GeopicxTables">
                                <thead>
                                    <tr>
                                        <th className="selectable" style={{ width: '20px' }} />
                                        {visibleColumns.map((column, colIndex) => (
                                            <th
                                                key={colIndex}
                                                style={{ width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : '100px' }}
                                                onMouseDown={(e) => handleMouseDownResize(e, colIndex)}
                                                onDoubleClick={() => handleSort(column.name)}
                                            >
                                                {column.name}
                                                {sortConfig.key === column.name && (
                                                    sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽'
                                                )}
                                                <div
                                                    className="resizer"
                                                    onMouseDown={(e) => handleMouseDownResize(e, colIndex)}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            data-index={rowIndex}
                                            className={selectedRows.includes(rowIndex) ? 'selected' : ''}
                                        // onMouseDown={(e) => handleMouseDown(e, rowIndex)}
                                        // onClick={() => handleRowClick(rowIndex)}
                                        >
                                            <td className="selectable" onMouseDown={(e) => handleMouseDown(e, rowIndex)} onClick={() => handleRowClick(rowIndex)}>
                                                {rowIndex === selectedRowIndex && <span>▶</span>}
                                            </td>
                                            {visibleColumns.map((column, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    style={{
                                                        width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : '100px',
                                                        ...getAlignmentStyle(row[column.name])
                                                    }}
                                                >
                                                    {column.render ? column.render(row) : row[column.name]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {viewMode === 'selected' && selectedRows.length > 0 && (
                            <div className="selected-rows">
                                <table className="GeopicxTables">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '20px' }}></th>
                                            {visibleColumns.map((column, colIndex) => (
                                                <th
                                                    key={colIndex}
                                                    style={{ width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : '100px' }}
                                                    onMouseDown={(e) => handleMouseDownResize(e, colIndex)}
                                                    onDoubleClick={() => handleSort(column.name)}
                                                >
                                                    {column.name}
                                                    {sortConfig.key === column.name && (
                                                        sortConfig.direction === 'asc' ? '🔼' : '🔽'
                                                    )}
                                                    <div
                                                        className="resizer"
                                                        onMouseDown={(e) => handleMouseDownResize(e, colIndex)}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedSelectedRows.map((rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                id={`row-${rowIndex}`}
                                                className={selectedRows.includes(rowIndex) ? 'selected' : ''}
                                            >
                                                <td className="selectable">
                                                    {rowIndex === selectedRowIndex && <span>▶</span>}
                                                </td>
                                                {visibleColumns.map((column, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        style={{ width: columnWidths[colIndex] ? `${columnWidths[colIndex]}px` : '100px' }}
                                                    >
                                                        {tables[activeTableIndex].data[rowIndex][column.name] || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className='GeopicxTablesFooterContainer'>
                <div className='GeopicxTablesFooter'>
                    <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('first')} title="Move To Beginning of Table">
                        <FontAwesomeIcon
                            icon={faBackwardStep}
                        />
                    </button>
                    <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('prev')} title="Move To Previous Record">
                        <FontAwesomeIcon
                            icon={faCaretLeft}
                        />
                    </button>
                    <input
                        className="GeopicxHandleRecord"
                        type="number"
                        value={inputRow}
                        onChange={handleInputChange}
                        placeholder="Enter row number"
                        min="1"
                        max={totalItems}
                    />
                    <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('next')} title="Move To Next Record">
                        <FontAwesomeIcon
                            icon={faCaretRight}
                        />
                    </button>
                    <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('last')} title="Move To End of Table">
                        <FontAwesomeIcon
                            icon={faForwardStep}
                        />
                    </button>
                    <button
                        onClick={() => handleViewToggle('complete')}
                        className={viewMode === 'complete' ? 'active' : ''}
                        title="Show Complete Records"
                        id="GeopicxTablesRecordComplete"
                    >
                        {/* <FontAwesomeIcon
                            icon={faList}
                        /> */}
                        <SelectedRecord />
                    </button>
                    <button
                        onClick={() => handleViewToggle('selected')}
                        className={`selected ${selectedRows.length === 0 ? 'disabled' : ''}`}
                        disabled={selectedRows.length === 0}
                        title="Show Selected Records"
                        id="GeopicxTablesRecordSeletced"
                    >
                        {/* <FontAwesomeIcon
                            icon={faListCheck}
                        /> */}
                        <CompleteRecord />
                    </button>
                    <span>({selectedRows.length} out of {totalItems} Selected)</span>
                </div>
            </div>
            <div className='GeopicxTablesTapsNumberofTable'>
                {tables.map((table, index) => (
                    <span
                        key={index}
                        className={`geopicx-tab ${index === activeTableIndex ? 'active' : ''}`}
                        onClick={() => handleTabClick(index)}
                    >
                        {table.name}
                    </span>
                ))}
            </div>
            {showModal && (
                <FieldVisibilityModal
                    fields={fields}
                    onClose={handleToggleModal}
                    onToggleField={handleToggleField}
                    onApplyChanges={handleApplyChanges}
                />
            )}
            {
                FieldsQueryShowModal && (
                    <FieldsQueryModal
                        onClose={handleClose}
                    />
                )
            }
        </div>
    );
};

export default GeopicxTables;






















// import React, { useState, useEffect } from "react";
// import "./GeopicxTables.css";
// import { ReactComponent as SelectedRecord } from './SelectedRecord.svg';
// import { ReactComponent as CompleteRecord } from './completerecord.svg';

// import FieldVisibilityModal from './FieldVisibilityModal';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//     faForwardStep, faBackwardStep, faCaretLeft, faCaretRight, faList, faListCheck, faFilter
// } from "@fortawesome/free-solid-svg-icons";


// const GeopicxTables = ({ tables, openModal, CustomComponent }) => {
//     const [activeTableIndex, setActiveTableIndex] = useState(0);
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [selectedRowIndex, setSelectedRowIndex] = useState(0);
//     const [inputRow, setInputRow] = useState("1");
//     const [viewMode, setViewMode] = useState('complete');
//     const [Tableloading, setTableloading] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [fields, setFields] = useState([]);

//     useEffect(() => {
//         if (tables.length > 0) {
//             const initialFields = tables[activeTableIndex].columns.map(col => ({
//                 name: col.header,
//                 visible: true
//             }));
//             setFields(initialFields);
//         }
//     }, [tables, activeTableIndex]);

//     if (tables.length === 0) {
//         return <div>No tables available</div>;
//     }

//     const { columns, data } = tables[activeTableIndex];
//     const totalItems = data.length;

//     const handleRecordChange = (direction) => {
//         let newIndex = selectedRowIndex;
//         if (direction === 'next' && newIndex < totalItems - 1) newIndex += 1;
//         else if (direction === 'prev' && newIndex > 0) newIndex -= 1;
//         else if (direction === 'first') newIndex = 0;
//         else if (direction === 'last') newIndex = totalItems - 1;

//         setSelectedRowIndex(newIndex);
//         scrollToRow(newIndex);
//         setInputRow(newIndex + 1);
//     };

//     const handleInputChange = (e) => {
//         const value = e.target.value;
//         setInputRow(value);

//         const rowIndex = Number(value) - 1;
//         if (rowIndex >= 0 && rowIndex < totalItems) {
//             setSelectedRowIndex(rowIndex);
//             scrollToRow(rowIndex);
//         }
//     };

//     const handleRowClick = (row) => {
//         setSelectedRows((prevSelectedRows) =>
//             prevSelectedRows.includes(row)
//                 ? prevSelectedRows.filter((r) => r !== row)
//                 : [...prevSelectedRows, row]
//         );
//     };

//     const scrollToRow = (index) => {
//         const rowElement = document.getElementById(`row-${index}`);
//         if (rowElement) rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     };

//     const handleTabClick = (index) => {
//         setActiveTableIndex(index);
//         setSelectedRowIndex(0);
//     };

//     const handleViewToggle = (view) => {
//         setViewMode(view);
//     };

//     const handleToggleModal = () => {
//         setShowModal(!showModal);
//     };

//     const handleApplyChanges = (updatedFields) => {
//         setFields(updatedFields);
//         handleToggleModal();
//     };
//     console.log("fields ", fields)

//     const handleToggleField = (index) => {
//         const newFields = [...fields];
//         newFields[index].visible = !newFields[index].visible;
//         setFields(newFields);
//     };

//     const visibleColumns = fields.filter((col, index) => fields[index]?.visible);
//     console.log("visibleColumns ", visibleColumns)


//     return (
//         <div className="GeopicxTablesMainBoxContainer">
//             <div className='GeopicxTablesfirstHeader'>
//                 <h5>Table</h5>
//                 <div className='GeopicxTablesfirstHeaderRightBox'>
//                     <span>✖️</span>
//                 </div>
//             </div>
//             <div className='GeopicxTablesSecondHeaderLeftBox'>
//                 <div className='GeopicxTablesSecondHeaderLeftBoxitems'>
//                     <button className="GeopicxTablesRecordBtn" onClick={handleToggleModal}>
//                         <FontAwesomeIcon
//                             icon={faFilter}
//                         />
//                     </button>
//                 </div>
//             </div>
//             <div className='GeopicxTablesContainerBodyHeader'>
//                 <h5>
//                     {tables.map((table, index) => (
//                         <span
//                             key={index}
//                             className={`geopicxtableactivename ${index === activeTableIndex ? 'active' : ''}`}
//                             onClick={() => handleTabClick(index)}
//                         >
//                             {index === activeTableIndex && table.name}
//                         </span>
//                     ))}
//                 </h5>
//                 <div className='GeopicxTablesContainerBodyHeaderRightBox'>
//                     <span>✖️</span>
//                 </div>
//             </div>
//             <div className="GeopicxTablesMainBoxBody">
//                 {Tableloading ? (
//                     <table>
//                         <tbody>{/* ...table skeleton loading... */}</tbody>
//                     </table>
//                 ) : (
//                     <>
//                         {viewMode === 'complete' && (
//                             <table className="GeopicxTables">
//                                 <thead>
//                                     <tr>
//                                         <th></th>
//                                         {visibleColumns.map((column, colIndex) => (
//                                             <th key={colIndex}>{column.name}</th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {data.map((row, rowIndex) => (
//                                         <tr
//                                             key={rowIndex}
//                                             id={`row-${rowIndex}`}
//                                             className={selectedRows.includes(row) ? 'selected' : ''}
//                                         >
//                                             <td className="selectable" onClick={() => handleRowClick(row)}>
//                                                 {rowIndex === selectedRowIndex && <span>▶</span>}
//                                             </td>
//                                             {visibleColumns.map((column, colIndex) => (
//                                                 <td key={colIndex}>
//                                                     {column.render ? column.render(row) : row[column.name]}
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}
//                         {viewMode === 'selected' && selectedRows.length > 0 && (
//                             <div className="selected-rows">
//                                 <table className="GeopicxTables">
//                                     <thead>
//                                         <tr>
//                                             <th></th>
//                                             {visibleColumns.map((column, colIndex) => (
//                                                 <th key={colIndex}>{column.header}</th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {selectedRows.map((row, rowIndex) => (
//                                             <tr
//                                                 key={rowIndex}
//                                                 id={`row-${rowIndex}`}
//                                                 className={selectedRows.includes(row) ? 'selected' : ''}
//                                             >
//                                                 <td className="selectable">
//                                                     {rowIndex === selectedRowIndex && <span>▶</span>}
//                                                 </td>
//                                                 {visibleColumns.map((column, colIndex) => (
//                                                     <td key={colIndex}>
//                                                         {column.render ? column.render(row) : row[column.accessor]}
//                                                     </td>
//                                                 ))}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//             <div className='GeopicxTablesFooterContainer'>
//                 <div className='GeopicxTablesFooter'>
//                     <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('first')} title="Move To Beginning of Table">
//                         <FontAwesomeIcon
//                             icon={faBackwardStep}
//                         />
//                     </button>
//                     <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('prev')} title="Move To Previous Record">
//                         <FontAwesomeIcon
//                             icon={faCaretLeft}
//                         />
//                     </button>
//                     <input
//                         className="GeopicxHandleRecord"
//                         type="number"
//                         value={inputRow}
//                         onChange={handleInputChange}
//                         placeholder="Enter row number"
//                         min="1"
//                         max={totalItems}
//                     />
//                     <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('next')} title="Move To Next Record">
//                         <FontAwesomeIcon
//                             icon={faCaretRight}
//                         />
//                     </button>
//                     <button className="GeopicxTablesRecordBtn" onClick={() => handleRecordChange('last')} title="Move To End of Table">
//                         <FontAwesomeIcon
//                             icon={faForwardStep}
//                         />
//                     </button>
//                     <button
//                         onClick={() => handleViewToggle('complete')}
//                         className={viewMode === 'complete' ? 'active' : ''}
//                         title="Show Complete Records"
//                         id="GeopicxTablesRecordComplete"
//                     >
//                         {/* <FontAwesomeIcon
//                             icon={faList}
//                         /> */}
//                         <SelectedRecord />
//                     </button>
//                     <button
//                         onClick={() => handleViewToggle('selected')}
//                         className={`selected ${selectedRows.length === 0 ? 'disabled' : ''}`}
//                         disabled={selectedRows.length === 0}
//                         title="Show Selected Records"
//                         id="GeopicxTablesRecordSeletced"
//                     >
//                         {/* <FontAwesomeIcon
//                             icon={faListCheck}
//                         /> */}
//                         <CompleteRecord />
//                     </button>
//                     <span>({selectedRows.length} out of {totalItems} Selected)</span>
//                 </div>
//             </div>
//             <div className='GeopicxTablesTapsNumberofTable'>
//                 {tables.map((table, index) => (
//                     <span
//                         key={index}
//                         className={`geopicx-tab ${index === activeTableIndex ? 'active' : ''}`}
//                         onClick={() => handleTabClick(index)}
//                     >
//                         {table.name}
//                     </span>
//                 ))}
//             </div>
//             {showModal && (
//                 <FieldVisibilityModal
//                     fields={fields}
//                     onClose={handleToggleModal}
//                     onToggleField={handleToggleField}
//                     onApplyChanges={handleApplyChanges}
//                 />
//             )}
//         </div>
//     );
// };

// export default GeopicxTables;






