// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';

import './ImageModal.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRefresh
} from "@fortawesome/free-solid-svg-icons";

import ZoomInIcon from '../../../asset/SVG_ICONS_128/NAZoom_In128.svg'
import ZoomOutIcon from '../../../asset/SVG_ICONS_128/NAZoom_Out128.svg'
import ClosedIcon from '../../../asset/SVG_ICONS_128/GNCancel128.svg'


const ImageModal = ({ image }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState({ src: '', alt: '' });
    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const [imgWidth, setImgWidth] = useState('auto');
    const [isPanning, setIsPanning] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1); // Initial scale for zoom

    const getImageSrc = () => {
        if (image && image['IMG_PREVIEW']) {
            return image['IMG_PREVIEW'].startsWith('data:image') ? image['IMG_PREVIEW'] : `data:image/jpg;base64,${image['IMG_PREVIEW']}`;
        } else if (image && image['image_data']) {
            return image['image_data'].startsWith('data:image') ? image['image_data'] : `data:image/jpg;base64,${image['image_data']}`;
        } else {
            //console.log('No valid image source found.');
            return ''; // Fallback if no valid source is found
        }
    };

    const getImageAlt = () => {
        if (image && image['DQLNAME']) {
            return image['DQLNAME'];
        } else if (image && image['file_path']) {
            return image['file_path'];
        } else {
            //console.log('No valid alt text found.');
            return 'Preview Image'; // Default alt text
        }
    };

    const openModal = () => {
        const imageSrc = getImageSrc();
        const imageAlt = getImageAlt();
        setCurrentImage({ src: imageSrc, alt: imageAlt });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        resetSize()
    };

    // ____________________________
    // *8*********

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Increase scale but limit to a max of 3
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Decrease scale but limit to a min of 0.5
    };


    // Reset zoom and panning position
    const resetSize = () => {
        setScale(1); // Reset to default scale
        setOffsetX(0); // Reset panning offset
        setOffsetY(0); // Reset panning offset
    };


    const handleMouseDown = (e) => {
        setIsPanning(true);
        setStartX(e.clientX - offsetX);
        setStartY(e.clientY - offsetY);
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;

        const container = containerRef.current;
        const img = imgRef.current;

        // Calculate new offsets
        const x = e.clientX - startX;
        const y = e.clientY - startY;

        // Calculate the container boundaries
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        // Apply constraints to keep the image within the container
        const constrainedX = Math.min(
            Math.max(x, containerRect.width - imgRect.width),
            0
        );
        const constrainedY = Math.min(
            Math.max(y, containerRect.height - imgRect.height),
            0
        );

        setOffsetX(constrainedX);
        setOffsetY(constrainedY);
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };
    // **********
    // Handle scroll zoom
    const handleWheel = (e) => {
        e.preventDefault(); // Prevent default scroll behavior

        // Adjust scale based on scroll direction (up = zoom in, down = zoom out)
        const zoomIntensity = 0.1;
        const newScale = scale + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);

        // Set the new scale, ensuring it doesn't go below a certain level (e.g., 0.5) or above max (e.g., 3)
        setScale(Math.min(Math.max(newScale, 0.5), 3));
    };

    const imageStyle = {
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transformOrigin: 'top left',
        transition: isPanning ? 'none' : 'transform 0.1s ease-out',
    };

    // ____________________________

    return (
        <div>
            <img
                src={getImageSrc()}
                alt={getImageAlt()}
                style={{ width: '100%', maxWidth: '15px', height: '100%', maxHeight: '15px', borderRadius: '5px', cursor: 'pointer', transition: '0.3s' }}
                onClick={openModal} />
            {modalOpen && (
                <div className='ArchivalMyModalMainBackground'>
                    <div className='ArchivalModal-Image'>
                        <div className="Caption-closed-btn-div">
                            <div className='view-Image-Name'>
                                <img src="MARS_LOGO.png" alt="Logo" class="img-View-logo"></img>
                                <span id="ArchivalCaption">{currentImage.alt.split('/').pop()}</span>
                            </div>
                            <div>
                                <span className="plus" onClick={zoomIn} title="ZoomIn"> <img src={ZoomInIcon} alt="Icon" width="30" height="30" /></span>
                                <span className="minus" onClick={zoomOut} title="ZoomOut"><img src={ZoomOutIcon} alt="Icon" width="30" height="30" /></span>
                                <span className="reset" onClick={resetSize} title="Reset"><FontAwesomeIcon icon={faRefresh} aria-hidden="true" /></span>

                                <span className="closebtn" onClick={closeModal} title="Close"><img src={ClosedIcon} alt="Icon" width="25" height="25" /></span>
                            </div>
                        </div>
                        <div id="ArchivalMyModal" className="ArchivalModal">
                            <div
                                ref={containerRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp} // Stops panning if mouse leaves container
                                onWheel={handleWheel} // Listen for scroll event to handle zoom
                                style={{
                                    overflow: 'hidden',
                                    cursor: isPanning ? 'grabbing' : 'grab',
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(0,0,0,0.1)' // Optional: for better visibility of panning
                                }}>
                                <img
                                    ref={imgRef}
                                    className="ArchivalModal-content"
                                    id="ArchivalImg01"
                                    src={currentImage.src}
                                    alt={currentImage.alt}
                                    style={{
                                        ...imageStyle,
                                        width: imgWidth, // If imgWidth is used to control original size
                                        maxWidth: 'none', // Ensures image scales freely without max constraints
                                        position: 'absolute' // Ensures proper panning positioning
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageModal;




// import React, { useState } from 'react';
// import './ImageModal.css';

// const ImageModal = ({ image }) => {
//     const [modalOpen, setModalOpen] = useState(false);
//     const [currentImage, setCurrentImage] = useState({ src: '', alt: '' });

//     const openModal = () => {
//         setCurrentImage({ src: `data:image/jpg;base64,${image.IMG_PREVIEW}`, alt: image.DQLNAME || image.DATANAME || 'Preview Image' });
//         setModalOpen(true);
//     };

//     const closeModal = () => {
//         setModalOpen(false);
//     };

//     return (
//         <div>
//             <img
//                 src={`data:image/jpg;base64,${image.IMG_PREVIEW}`}
//                 alt={image.DQLNAME || 'Image'}
//                 style={{ width: '100%', maxWidth: '15px', height: '100%', maxHeight: '15px', borderRadius: '5px', cursor: 'pointer', transition: '0.3s' }}
//                 onClick={openModal}
//             />
//             {modalOpen && (
//                 <div className='ArchivalMyModalMainBackground'>
//                     <div id="ArchivalMyModal" className="ArchivalModal">
//                         <span className="ArchivalClose" onClick={closeModal}>&times;</span>
//                         <span id="ArchivalCaption">{currentImage.alt}</span>
//                         <img className="ArchivalModal-content" id="ArchivalImg01" src={currentImage.src} alt={currentImage.alt} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ImageModal;


