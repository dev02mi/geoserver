import React, { useState, useEffect } from "react";
import "./CreateSuperUser.css";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import Preloader from "../../Preloader/Preloader";
import { useNavigate } from "react-router-dom";
import ModalManager from "../../GeopicxPopupModals/ModalManager";
import FormInputGroup from "../../../ReuseCompomenent/FormInputGroup";
import CustomPasswordStrengthBar from "../../../ReuseCompomenent/CustomPasswordStrengthBar";
import CentraliseheaderBody from "../../Centraliseheaderbody/CentraliseheaderBody";
import CentraliseButton from "../../CentraliseButton/CentraliseButton";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import Navbar from "../../Navbar/Navbar";


function CreateSuperUser() {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [suTime, setSuTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    // const [showPopup, setShowPopup] = useState(() => {
    //     const savedPopupState = localStorage.getItem('showPopup');
    //     return savedPopupState !== null ? JSON.parse(savedPopupState) : true;
    // });

    const [showPopup, setShowPopup] = useState(true);
    const location = useLocation();
    const [suToken, setSuToken] = useState("");
    const [userType, setUserType] = useState("");
    const [adminType, setAdminType] = useState("");


    //console.log("showPopup....", localStorage.getItem('showPopup'));
    useEffect(() => {
    }, [showPopup]);



    useEffect(() => {
        let token = new URLSearchParams(location.search).get('token');
        if (token) {
            // Remove any '$' symbol from the token
            token = token.replace('$', '');
            setSuToken(token);
            fetchTokenApi(token);
            //localStorage.removeItem('showPopup');
        }
    }, []);

    const fetchTokenApi = async (token) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/superuser/?token=${(token)}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                setUsername(data.USERNAME);
                setEmail(data.EMAIL);
                setUserType(data.USER_TYPE);
                setAdminType(data.admin_type_short);
                //console.log("usssssssss", data.USER_TYPE)
                const adjustedTime = data.timer;
                setSuTime(adjustedTime);

                if (data.timer <= 2) {
                    //setShowPopup(false);
                }
                else {
                    setShowPopup(true);
                }
            }
        } catch (error) {
            setShowPopup(false);
            // console.error("API request failed:", error);
        }
    };

    useEffect(() => {
        if (suTime > 0) {
            setTimeLeft(suTime * 60);
            const intervalId = setInterval(() => {
                setTimeLeft((prevTimeLeft) => {
                    if (prevTimeLeft <= 1) {
                        clearInterval(intervalId);
                        setShowPopup(false);
                        setSuTime(0);
                        localStorage.setItem('showPopup', JSON.stringify(false));
                        return 0;
                    }
                    return prevTimeLeft - 1;
                });
            }, 1000);
            return () =>
                clearInterval(intervalId);
        }
    }, [suTime]);


    //ChangePassword
    const initialFormState = {
        PASSWORD: "",
        CONFIRM_PASSWORD: "",
        // OLD_PASSWORD: "",
    };

    const [formData, setFormData] = useState(initialFormState);

    const [touched, setTouched] = useState({
        PASSWORD: false,
        CONFIRM_PASSWORD: false,
        // OLD_PASSWORD: false,
    });

    const [errors, setErrors] = useState({
        PASSWORD: "",
        CONFIRM_PASSWORD: "",
        // OLD_PASSWORD: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "PASSWORD" || name === "CONFIRM_PASSWORD") {
            const filteredValue = value.replace(/[^a-zA-Z0-9!@#$%^&*]/g, "");

            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: filteredValue,
            }));

            setTouched((prevTouched) => ({
                ...prevTouched,
                [name]: true,
            }));

            return;
        }

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

        setTouched((prevTouched) => ({
            ...prevTouched,
            [name]: true,
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const handleChangeError = (name, error) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };

    const handleForm = async (event) => {
        event.preventDefault();

        setTouched({
            PASSWORD: true,
            // OLD_PASSWORD: true,
            CONFIRM_PASSWORD: true,
        });

        // Check for errors
        const filteredErrors = Object.fromEntries(
            Object.entries(errors).filter(([_, value]) => value)
        );

        if (
            Object.keys(filteredErrors).length === 0 &&
            username &&
            // formData.OLD_PASSWORD &&
            formData.PASSWORD &&
            formData.CONFIRM_PASSWORD
        ) {
            const initialValues = {
                USERNAME: username,
                PASSWORD: formData.PASSWORD,
                // OLD_PASSWORD: formData.OLD_PASSWORD,
                ...(userType !== 'SU' && { NEW_PASSWORD: formData.CONFIRM_PASSWORD }),
                ...(userType === 'SU' && { EMAIL: email }),
            };

            try {
                const confirmAction = await ModalManager.confirm({
                    modalHeaderHeading: 'Change Password',
                    modalBodyHeading: 'Confirmation',
                    message: 'Are you sure you want to proceed?',
                    confirmButtonText: 'OK',
                    showCancelButton: true,
                });
                if (!confirmAction.isConfirmed) {
                    return; // Do not proceed with API call if not confirmed
                }
                setLoading(true);
                setProgress(0);
                // Simulating progress
                const steps = 10; // Define the number of steps
                const stepDuration = 500; // Define the duration for each step (in milliseconds)
                for (let i = 1; i <= steps; i++) {
                    await new Promise((resolve) => setTimeout(resolve, stepDuration));
                    const progressPercentage = (i / steps) * 100;
                    setProgress(progressPercentage);
                }
                let url;
                let method;

                if (userType !== 'SU') {
                    url = `http://127.0.0.1:8000/change_password/?token=${suToken}`;
                    method = 'patch';
                } else {
                    url = `http://127.0.0.1:8000/superuser/?token=${suToken}`;
                    method = 'post';
                }

                const response = await axios[method](
                    url, initialValues);

                // Handle the response
                if (response.status === 200 || response.status === 201) {
                    const message = response.data.message;

                    ModalManager.success({
                        modalHeaderHeading: "Change Password",
                        modalBodyHeading: "Success",
                        message: message,
                        onConfirm: () => {
                            sessionStorage.clear();
                            navigate("/Login");
                        },
                        confirmButtonText: "OK",
                    }).then(() => {
                        window.location.href = "/Login";
                    });
                } else {
                    setErrorMessage("Failed to change password. Please try again.");
                    setSuccessMessage("");
                }
            } catch (errors) {
                if (errors.response) {
                    console.error("Error response:", errors.response.data);
                    ModalManager.error({
                        modalHeaderHeading: "Change Password",
                        modalBodyHeading: "Error",
                        message: errors.response.data.errors,
                        confirmButtonText: "OK",
                    });
                }
                console.error("Error changing password:", errors);
            } finally {
                setLoading(false);
                setProgress(100);
            }
        } else {
            setErrors(filteredErrors);
            console.log("Form contains errors", filteredErrors);
        }
    };

    const adminDepartmentType = () => {
        return adminType === 'WCADMIN' ? 'WorkCenter' : 'UserDepartment';
    };

    return (
        <>
            <Navbar />
            {(showPopup && (suTime && timeLeft > 0)) ?
                (
                    <div
                    // style={{
                    //     backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://media.istockphoto.com/id/1064161204/photo/mount-rainier-3d-render-topographic-map-color.jpg?s=612x612&w=0&k=20&c=4cyVfQY9V-wSKy0Zx4jHdPRnhImnF9LP6PqqBhbUans=')`,
                    //     backgroundSize: "cover",
                    //     backgroundRepeat: "no-repeat",
                    //     backgroundPosition: "center center",
                    //     minHeight: "100vh",
                    // }}
                    >
                        <div className=" mx-4 mb-1">
                            <Preloader loading={loading} progress={progress} />
                            <div>

                                <div className="d-flex justify-content-center align-items-center pt-5">
                                    <div>
                                        <h3 className="CSU-Timer text-right mb-0 mr-1">
                                            {`Time Left: ${Math.floor(timeLeft / 60)} minutes ${Math.floor(timeLeft % 60).toString().padStart(2, '0')} seconds`}
                                        </h3>


                                        <CentraliseheaderBody
                                            header="Change Password"
                                            logo="GEOPICX_LOGO.png"
                                            headerBgColor="rgb(64 37 136)"
                                            headerTextColor="white"
                                            onClose={() => {
                                                localStorage.clear();
                                                window.close(); // Close the current tab or window
                                            }}
                                        >
                                            <form
                                                action=""
                                                method="post"
                                                name="signupForm"
                                                id="signupForm"
                                                className="changepass-resetForm"
                                            >
                                                <fieldset className="the-fieldset mb-4">
                                                    <legend className="the-legendSuEditUse">Create Your Password </legend>

                                                    <div class="d-flex justify-content-center mt-2">
                                                        <h5 className="text-center text-su m-0 p-0 ">
                                                            Hello {username} ({userType === 'SU' ? userType : adminType}) User
                                                        </h5>
                                                    </div>

                                                    <div class="form-group mx-4">
                                                        {/* <FormInputGroup
                                                        label="Old Password"
                                                        required
                                                        type="oldpassword"
                                                        value={formData.OLD_PASSWORD}
                                                        onBlur={handleBlur}
                                                        onblur={touched.OLD_PASSWORD}
                                                        maxLength={40}
                                                        onChangeError={(error) =>
                                                            handleChangeError("OLD_PASSWORD", error)
                                                        }
                                                        onChange={(e) => setFormData({ ...formData, OLD_PASSWORD: e.target.value.trim() })}
                                                        // errorMessage={errors.OLD_PASSWORD}
                                                        // onChange={handleChange}
                                                        errorMessage={errors.OLD_PASSWORD}
                                                        name="OLD_PASSWORD"
                                                        touched={touched.OLD_PASSWORD}
                                                        inputType="password"
                                                        placeHolder="Enter Your Password"
                                                    /> */}

                                                        <FormInputGroup
                                                            label="New Password"
                                                            required
                                                            value={formData.PASSWORD}
                                                            type="password"
                                                            onBlur={handleBlur}
                                                            onblur={touched.PASSWORD}
                                                            maxLength={40}
                                                            onChangeError={(error) =>
                                                                handleChangeError("PASSWORD", error)
                                                            }
                                                            onChange={handleChange}
                                                            errorMessage={errors.PASSWORD}
                                                            name="PASSWORD"
                                                            touched={touched.PASSWORD}
                                                            inputType="password"
                                                            placeHolder="New Password"
                                                            inputboxClass='passwordInput'


                                                        />
                                                        <div class="form-group Confirmpassword mb-1 mx-4">
                                                            <CustomPasswordStrengthBar
                                                                className="mb-0"
                                                                password={formData.PASSWORD}
                                                            />
                                                        </div>

                                                        <FormInputGroup
                                                            label="Confirm Password"
                                                            required
                                                            value={formData.CONFIRM_PASSWORD}
                                                            type="confirm_password"
                                                            onBlur={handleBlur}
                                                            onblur={touched.CONFIRM_PASSWORD}
                                                            maxLength={40}
                                                            onChangeError={(error) =>
                                                                handleChangeError("CONFIRM_PASSWORD", error)
                                                            }
                                                            onChange={handleChange}
                                                            errorMessage={errors.CONFIRM_PASSWORD}
                                                            name="CONFIRM_PASSWORD"
                                                            touched={touched.CONFIRM_PASSWORD}
                                                            inputType="password"
                                                            placeHolder="Confirm Password "
                                                            password={formData.PASSWORD}
                                                            inputboxClass='passwordInput'

                                                        />
                                                    </div>
                                                </fieldset>

                                                <div className="changepass_btn_div d-flex justify-content-center align-items-center">
                                                    <CentraliseButton
                                                        className=""
                                                        type="submit"
                                                        text="SUBMIT"
                                                        onClick={handleForm}
                                                        variant="#2b6e5b"
                                                        hoverBgColor="#2b6e5bcf"
                                                        hoverTextColor="white"
                                                        fontsize="16px"
                                                        padding="3px 6px"
                                                        width="150px"
                                                    />

                                                    <CentraliseButton
                                                        className="ml-5  my-sm-2"
                                                        type="button"
                                                        text="CANCEL"
                                                        onClick={() => {
                                                            localStorage.clear();
                                                            window.close(); // Close the current tab or window
                                                        }}
                                                        variant="#ab683f"
                                                        padding="3px 3px"
                                                        // hoverBgColor="#bd0a0b"
                                                        hoverTextColor="white"
                                                        width="150px"
                                                        fontsize="15px"
                                                    />
                                                </div>

                                                <div>
                                                    <ol className="text-success changepass-Info">
                                                        <li className="m-0 p-0 text-left">
                                                            Must be at least 8 characters long.
                                                        </li>
                                                        <li className="m-0 p-0 text-left">
                                                            Must include special characters like <b>!@#$%^&*</b>
                                                        </li>
                                                        <li className="m-0 p-0 text-left">
                                                            Must include  numbers.
                                                        </li>
                                                        <li className="m-0 p-0 text-left">
                                                            Must include at least one uppercase letter and one lowercase letter.
                                                        </li>
                                                    </ol>
                                                </div>
                                            </form>
                                        </CentraliseheaderBody>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                : showPopup === false &&
                (
                    <div>
                        <div className="popup-overlay-su-create">
                            <div className="popup-content-su-create">
                                <p> Your Link is Expired..... ! </p>

                                <div className=" d-flex justify-content-center align-items-center ">
                                    <CentraliseButton
                                        className="ml-5  my-sm-2"
                                        type="button"
                                        text="CANCEL"
                                        onClick={() => {
                                            localStorage.clear();
                                            window.close(); // Close the current tab or window
                                        }}
                                        variant="#ab683f"
                                        padding="3px 3px"
                                        // hoverBgColor="#bd0a0b"
                                        hoverTextColor="white"
                                        width="150px"
                                        fontsize="15px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <Footer />
        </>


    );
}

export default CreateSuperUser;
