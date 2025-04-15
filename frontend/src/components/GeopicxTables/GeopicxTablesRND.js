import React, { useState, useRef, useEffect } from "react";
import "./GeopicxTables.css";

const GeopicxTablesRND = ({ tables }) => {
    const [size, setSize] = useState({ width: 400, height: 400 });
    const [position, setPosition] = useState({ left: 0, top: 100 });
    const [activeTableIndex, setActiveTableIndex] = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [inputRow, setInputRow] = useState("1"); // State for user input
    const panelRef = useRef(null);
    const headerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentHandle, setCurrentHandle] = useState(null);
    const [showSelectedRows, setShowSelectedRows] = useState(false);
    const [viewMode, setViewMode] = useState('complete'); // 'complete' or 'selected'
    const [sortConfig, setSortConfig] = useState({ column: null, direction: 'ascending' });

    const { columns, data } = tables[activeTableIndex];
    const totalItems = data.length;

    // Function to handle column sorting
    const sortTable = (column) => {
        let direction = 'ascending';
        if (sortConfig.column === column && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ column, direction });

        const sortedData = [...data].sort((a, b) => {
            if (a[column] < b[column]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        tables[activeTableIndex].data = sortedData;
    };

    const handlePageChange = (direction) => {
        let newIndex = selectedRowIndex;

        if (direction === 'next' && newIndex < totalItems - 1) {
            newIndex += 1;
        } else if (direction === 'prev' && newIndex > 0) {
            newIndex -= 1;
        } else if (direction === 'first') {
            newIndex = 0;
        } else if (direction === 'last') {
            newIndex = totalItems - 1;
        }

        setSelectedRowIndex(newIndex);
        scrollToRow(newIndex);
        setInputRow(newIndex + 1); // Convert 0-based index to 1-based for input
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputRow(value);

        // Convert 1-based input value to 0-based index
        const rowIndex = Number(value) - 1;
        if (rowIndex >= 0 && rowIndex < totalItems) {
            setSelectedRowIndex(rowIndex);
            scrollToRow(rowIndex);
        }
    };

    const handleRowClick = (row) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(row)
                ? prevSelectedRows.filter((r) => r !== row)
                : [...prevSelectedRows, row]
        );
    };

    const handleShowSelectedClick = () => {
        setShowSelectedRows(prevShowSelectedRows => !prevShowSelectedRows);
    };

    const scrollToRow = (index) => {
        const rowElement = document.getElementById(`row-${index}`);
        if (rowElement) {
            rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !panelRef.current) return;

            const panelRect = panelRef.current.getBoundingClientRect();
            const minWidth = window.innerWidth * 0.2;
            const minHeight = window.innerHeight * 0.2;
            const newSize = { ...size };
            const newPosition = { ...position };

            if (currentHandle.includes("right")) {
                newSize.width = Math.max(e.clientX - panelRect.left, minWidth);
            }
            if (currentHandle.includes("left")) {
                const newWidth = Math.max(panelRect.right - e.clientX, minWidth);
                newPosition.left = Math.min(e.clientX, panelRect.right - minWidth);
                newSize.width = newWidth;
            }
            if (currentHandle.includes("bottom")) {
                newSize.height = Math.max(e.clientY - panelRect.top, minHeight);
            }
            if (currentHandle.includes("top")) {
                const newHeight = Math.max(panelRect.bottom - e.clientY, minHeight);
                newPosition.top = Math.min(e.clientY, panelRect.bottom - minHeight);
                newSize.height = newHeight;
            }

            newPosition.left = Math.max(0, Math.min(newPosition.left, window.innerWidth - newSize.width));
            newPosition.top = Math.max(0, Math.min(newPosition.top, window.innerHeight - newSize.height));

            setSize(newSize);
            setPosition(newPosition);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setCurrentHandle(null);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, currentHandle, size, position]);

    const handleMouseDown = (e, handle) => {
        e.preventDefault();
        setIsDragging(true);
        setCurrentHandle(handle);
    };

    useEffect(() => {
        const element = panelRef.current;
        const header = headerRef.current;

        const dragElement = (elmnt, headerElmnt) => {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

            const dragMouseDown = (e) => {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            };

            const elementDrag = (e) => {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;

                const newPosition = {
                    top: Math.max(0, Math.min(elmnt.offsetTop - pos2, window.innerHeight - size.height)),
                    left: Math.max(0, Math.min(elmnt.offsetLeft - pos1, window.innerWidth - size.width)),
                };

                setPosition(newPosition);
            };

            const closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };

            if (headerElmnt) {
                headerElmnt.onmousedown = dragMouseDown;
            } else {
                elmnt.onmousedown = dragMouseDown;
            }
        };

        if (element) {
            dragElement(element, header);
        }
    }, [size]);

    const handleTabClick = (index) => {
        setActiveTableIndex(index);
        setSelectedRowIndex(0); // Reset to first row when switching tables
    };

    // Function to toggle between 'complete' and 'selected' view
    const handleViewToggle = (view) => {
        setViewMode(view);
    };

    if (tables.length === 0) {
        return <div>No tables available</div>;
    }

    return (
        <div
            ref={panelRef}
            className="resizable-panel"
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                minWidth: "20vw",
                minHeight: "20vh",
                padding: "1rem",
                position: "absolute",
                left: `${position.left}px`,
                top: `${position.top}px`,
                boxSizing: "border-box",
            }}
        >
            <div className='GeopicxTablesfirstHeader' ref={headerRef}>
                <h5>Table</h5>
                <div className='GeopicxTablesfirstHeaderRightBox'>
                    <span>🈁</span>
                    <span>✖️</span>
                </div>
            </div>
            <div className='GeopicxTablesSecondHeaderLeftBox'>
                <div className='GeopicxTablesSecondHeaderLeftBoxitems'>
                    <span>🈁</span> |
                    <span>🈁</span> |
                    <span>🈁</span> |
                    <span>🈁</span>
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
                {viewMode === 'complete' && (
                    <table className="GeopicxTables">
                        <thead>
                            <tr>
                                <th></th>
                                {columns.map((column, colIndex) => (
                                    <th key={colIndex} onClick={() => sortTable(column.accessor)}>
                                        {column.header}
                                        {sortConfig.column === column.accessor && (
                                            sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}
                                    id={`row-${rowIndex}`}
                                    className={selectedRows.includes(row) ? 'selected' : ''}
                                >
                                    <td className="selectable" onClick={() => handleRowClick(row)}>
                                        {rowIndex === selectedRowIndex && (
                                            <span>▶</span>
                                        )}
                                    </td>
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex}>{row[column.accessor]}</td>
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
                                    <th></th>
                                    {columns.map((column, colIndex) => (
                                        <th key={colIndex} onClick={() => sortTable(column.accessor)}>
                                            {column.header}
                                            {sortConfig.column === column.accessor && (
                                                sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽'
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map((row, rowIndex) => (
                                    <tr key={rowIndex}
                                        id={`row-${rowIndex}`}
                                        className={selectedRows.includes(row) ? 'selected' : ''}
                                    >
                                        <td className="selectable">
                                            {rowIndex === selectedRowIndex && (
                                                <span>▶</span>
                                            )}
                                        </td>
                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex}>{row[column.accessor]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className='GeopicxTablesFooterContainer'>
                <div className='GeopicxTablesFooter'>
                    <button onClick={() => handlePageChange('first')} title="Move To Beginnig of Table">⏮</button>
                    <button onClick={() => handlePageChange('prev')} title="Move To Previous Record">◀</button>
                    <input
                        type="number"
                        value={inputRow}
                        onChange={handleInputChange}
                        placeholder="Enter row number"
                        min="1"
                        max={totalItems}
                    />
                    <button onClick={() => handlePageChange('next')} title="Move To Next Record">▶</button>
                    <button onClick={() => handlePageChange('last')} title="Move To End of Table">⏭</button>

                    <button
                        onClick={() => handleViewToggle('complete')}
                        className={viewMode === 'complete' ? 'active' : ''}
                        title="Show Complete Records"
                    >
                        🏢
                    </button>
                    <button
                        onClick={() => handleViewToggle('selected')}
                        className={`selected ${selectedRows.length === 0 ? 'disabled' : ''}`}
                        disabled={selectedRows.length === 0}
                        title="Show Selected Records"
                    >
                        🏣
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
            <div
                className="handle handle-right"
                onMouseDown={(e) => handleMouseDown(e, "right")}
            ></div>
            <div
                className="handle handle-left"
                onMouseDown={(e) => handleMouseDown(e, "left")}
            ></div>
            <div
                className="handle handle-top"
                onMouseDown={(e) => handleMouseDown(e, "top")}
            ></div>
            <div
                className="handle handle-bottom"
                onMouseDown={(e) => handleMouseDown(e, "bottom")}
            ></div>
            <div
                className="handle handle-top-left"
                onMouseDown={(e) => handleMouseDown(e, "top-left")}
            ></div>
            <div
                className="handle handle-top-right"
                onMouseDown={(e) => handleMouseDown(e, "top-right")}
            ></div>
            <div
                className="handle handle-bottom-left"
                onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
            ></div>
            <div
                className="handle handle-bottom-right"
                onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
            ></div>
        </div>
    );
};

export default GeopicxTablesRND;