import React from 'react';
import ReactDOM from 'react-dom';
import GeopicxPopupModals from './GeopicxPopupModals';
import ErrorIcon from "../../asset/modelImg/Cross-error-icon.png";
import right_icon from "../../asset/modelImg/right-icon.PNG";
import confirmIcon from "../../asset/modelImg/confirmIcon.png";
import warningIcon from "../../asset/modelImg/sign-warning.png";

const modalRoot = document.getElementById('modal-root') || document.body;

const openModal = (config) => {
    return new Promise((resolve) => {
        const modalDiv = document.createElement('div');
        modalRoot.appendChild(modalDiv);

        const closeModal = (result) => {
            ReactDOM.unmountComponentAtNode(modalDiv);
            modalRoot.removeChild(modalDiv);
            resolve(result);
        };

        const handleConfirm = async () => {
            if (config.onConfirm) {
                await config.onConfirm(); // Await the function if it returns a promise
            }
            closeModal({ isConfirmed: true });
        };

        const handleCancel = () => {
            if (config.onCancel) config.onCancel();
            closeModal({ isConfirmed: false });
        };

        ReactDOM.render(
                <GeopicxPopupModals
                    isOpen={true}
                    type={config.type}
                    logo={config.logo}
                    icon={config.icon}
                    modalHeaderHeading={config.modalHeaderHeading}
                    modalBodyHeading={config.modalBodyHeading}
                    message={config.message}
                    children={config.children}
                    onClose={handleCancel}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    confirmButtonText={config.confirmButtonText}
                    cancelButtonText={config.cancelButtonText}
                />,
                modalDiv
        );
    });
};

const ModalManager = {
    SimpleModal: (config) => {
        return openModal({
            type: 'SimpleModal',
            modalHeaderHeading: config.modalHeaderHeading || 'Something!',
            modalBodyHeading: config.modalBodyHeading,
            message: config.message,
            redirectTo: config.redirectTo,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: config.cancelButtonText,
            ...config,
        });
    },
    success: (config) => {
        return openModal({
            type: 'success',
            logo: config.logo || 'GEOPICX_LOGO.png',
            icon: config.icon || right_icon,
            modalHeaderHeading: config.modalHeaderHeading || 'Success!',
            modalBodyHeading: config.modalBodyHeading,
            message: config.message,
            redirectTo: config.redirectTo,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: config.cancelButtonText,
            ...config,
        });
    },
    error: (config) => {
        return openModal({
            type: 'error',
            logo: config.logo || 'GEOPICX_LOGO.png',
            icon: config.icon || ErrorIcon,
            modalHeaderHeading: config.modalHeaderHeading || 'Error!',
            modalBodyHeading: config.modalBodyHeading,
            message: config.message,
            redirectTo: config.redirectTo,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: config.cancelButtonText,
            ...config,
        });
    },
    warning: (config) => {
        return openModal({
            type: 'warning',
            logo: config.logo || 'GEOPICX_LOGO.png',
            icon: config.icon || warningIcon,
            modalHeaderHeading: config.modalHeaderHeading || 'Warning!',
            modalBodyHeading: config.modalBodyHeading,
            message: config.message,
            redirectTo: config.redirectTo,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: config.cancelButtonText,
            ...config,
        });
    },
    confirm: (config) => {
        return openModal({
            type: 'confirm',
            logo: config.logo || 'GEOPICX_LOGO.png',
            icon: config.icon || confirmIcon,
            modalHeaderHeading: config.modalHeaderHeading || 'Are you sure?',
            modalBodyHeading: config.modalBodyHeading,
            message: config.message,
            children: config.children,
            redirectTo: config.redirectTo,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText,
            cancelButtonText: config.cancelButtonText,
            ...config,
        });
    },
};

export default ModalManager;
