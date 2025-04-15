import React, { useState } from "react";
import Modal from "react-modal";
import "./CreateSuperUser.css";

Modal.setAppElement("#root");

const UserModal = ({ errormsg, password, isOpen, handleSubmit, handlePasswordChange, preventPaste }) => {
    return (
        <Modal
            isOpen={isOpen}
            className="user-modal user_Modal-wrapper"
            overlayClassName="modal-overlay"
        >
            <div className="modal-content ">
                <h4 className="pop-heading">
                    <b>Enter Password to Submit</b>
                </h4>
                <form onSubmit={handleSubmit} className="">


                    <div className="mb-2">
                        <label className="password-label">
                            <span className="text-danger">*</span>Password
                        </label>
                        {errormsg && (
                            <span className="error-message ">{errormsg}</span>
                        )}

                    </div>

                    <input
                        type="password"
                        id="password"
                        className={`form-control ${errormsg ? "is-invalid" : ""}`}
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyDown={(e) => {
                            if (e.keyCode === 32) {
                                e.preventDefault();
                            }
                        }}
                        onPaste={preventPaste}
                    />


                    <div>
                        <button
                            type="submit"
                            className="btn btn_success"
                            size="sm"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default UserModal;
