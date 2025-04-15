import React, { useRef, useEffect, useState, } from "react";
import "./ViewProfile.css";
import CentraliseheaderBody from "../Centraliseheaderbody/CentraliseheaderBody";

function ViewProfile({ isOpen, selectedUser, onClose, userType }) {
  const modalRef = useRef(null);
  function formatDate(dateString) {
    const dateObject = new Date(dateString);

    // Options for formatting the date
    const options = { year: "numeric", month: "numeric", day: "numeric" };

    // Use toLocaleDateString() to format the date
    return dateObject.toLocaleDateString(undefined, options);
  }
  const handleClickOutside = (event) => {
    if (!modalRef.current.contains(event.target)) {
      onClose();
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      {isOpen && selectedUser && (



        <div className="View-ProfileModal mt-5 row justify-content-center" ref={modalRef}>
          <CentraliseheaderBody
            header="User Information"
            logo="GEOPICX_LOGO.png"
            headerBgColor="rgb(64 37 136)"        // Set your desired header background color
            headerTextColor="white"
            onClose={onClose}
          // onClose={handleBackButtonClick}
          >
            <table className="View-Table ">
              <tbody>
                <tr>
                  <td>
                    <b>User Id:</b>
                  </td>
                  <td>{selectedUser.USERID}</td>
                </tr>
                <tr>
                  <td>
                    <b>First Name:</b>
                  </td>
                  <td>{selectedUser.FIRST_NAME}</td>
                </tr>
                <tr>
                  <td>
                    <b>Middle Name:</b>
                  </td>
                  <td>{selectedUser.MIDDLE_NAME}</td>
                </tr>
                <tr>
                  <td>
                    <b>Last Name:</b>
                  </td>
                  <td>{selectedUser.LAST_NAME}</td>
                </tr>
                {userType === "UU" && (
                  <>
                    <tr>
                      <td>
                        <b>Gender:</b>
                      </td>
                      <td>{selectedUser.GENDER}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Date Of Birth:</b>
                      </td>
                      <td>{selectedUser.DOB}</td>
                    </tr>{" "}
                  </>
                )}


                <tr>
                  <td>
                    <b>Organization:</b>
                  </td>
                  <td>{selectedUser.ORGANIZATION}</td>
                </tr>
                <tr>
                  <td>
                    <b>Designation:</b>
                  </td>
                  <td>{selectedUser.DESIGNATION}</td>
                </tr>
                <tr>
                  <td>
                    <b>Theme Section:</b>
                  </td>
                  <td>{selectedUser.Theme_Section.charAt(0).toUpperCase() + selectedUser.Theme_Section.slice(1).toLowerCase()}</td>
                </tr>
                <tr>
                  <td>
                    <b>Country:</b>
                  </td>
                  <td>{selectedUser.COUNTRY}</td>
                </tr>
                <tr>
                  <td>
                    <b>State:</b>
                  </td>
                  <td>{selectedUser.STATE}</td>
                </tr>
                <tr>
                  <td>
                    <b>City:</b>
                  </td>
                  <td>{selectedUser.CITY}</td>
                </tr>
                {userType === "UU" && (
                  <>
                    <tr>
                      <td>
                        <b>Address 1:</b>
                      </td>
                      <td>{selectedUser.ADDRESS_1}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Address 2:</b>
                      </td>
                      <td>{selectedUser.ADDRESS_2}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Pin Code:</b>
                      </td>
                      <td>{selectedUser.PIN_CODE}</td>
                    </tr>
                  </>
                )}
                {userType !== "UU" && (
                  <>
                    <tr>
                      <td>
                        <b>Phone (LAN):</b>
                      </td>
                      <td>{selectedUser.LAN_LINE}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Location:</b>
                      </td>
                      <td>{selectedUser.OFF_LOCA}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td>
                    <b>User Name:</b>
                  </td>
                  <td>{selectedUser.USERNAME}</td>
                </tr>
                <tr>
                  <td>
                    <b>Email Id:</b>
                  </td>
                  <td>{selectedUser.EMAIL}</td>
                </tr>
                <tr>
                  <td>
                    <b>Mobile No:</b>
                  </td>
                  <td>{selectedUser.MOBILE_NO}</td>
                </tr>
                {userType !== "UU" && (
                  <tr>
                    <td>
                      <b>Email Id (ALT):</b>
                    </td>
                    <td>{selectedUser.ALT_EMAIL}</td>
                  </tr>
                )}
                <tr>
                  <td>
                    <b>User Type:</b>
                  </td>
                  <td>{userType === "UU" ? "Authorized" : "Admin"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Su Status:</b>
                  </td>
                  <td>{selectedUser.SU_APRO_STAT.charAt(0).toUpperCase() + selectedUser.SU_APRO_STAT.slice(1).toLowerCase()}</td>               
                </tr>
                <tr>
                  <td>
                    <b>Su Remark:</b>
                  </td>
                  <td>{selectedUser.SU_APRO_REM}</td>
                </tr>
                {userType === "UU" && (
                  <>
                    <tr>
                      <td>
                        <b>Au Status:</b>
                      </td>
                      <td>{selectedUser.AU_APRO_STAT.charAt(0).toUpperCase() + selectedUser.AU_APRO_STAT.slice(1).toLowerCase()}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Au Remark:</b>
                      </td>
                      <td>{selectedUser.AU_APRO_REM}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Uu Remark:</b>
                      </td>
                      <td>{selectedUser.UU_REM}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td>
                    <b>Creation Date:</b>
                  </td>
                  <td>{formatDate(selectedUser.CREATION_DATE)}</td>
                </tr>
                <tr>
                  <td>
                    <b>Action Date:</b>
                  </td>
                  <td>
                    {selectedUser?.APRO_DATE
                      ? formatDate(selectedUser.APRO_DATE)
                      : null}
                  </td>
                </tr>
                {/* ... other fields ... */}
              </tbody>
            </table>

          </CentraliseheaderBody >
        </div>



      )
      }
    </div >
  );
}

export default ViewProfile;
