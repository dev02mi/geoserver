
import MARS from "../../asset/application_img/MARS_button_icon.png"
import AGRICULTURE from "../../asset/application_img/GAGRITECH_button_icon.png"
import GOLDENEYE from "../../asset/application_img/golden_eye_button_icon.png"
import Water from "../../asset/application_img/waterI.PNG"
import Defense from "../../asset/application_img/defence.PNG"
import Mining from "../../asset/application_img/Mining.png"

// themeImages.js
export const themeImages = {
    MARS: MARS,
    AGRICULTURE: AGRICULTURE,
    DEFENCE: Defense,
    WATER:Water,
    MINING: Mining,
    DEFAULT: "",
    GOLDENEYE: GOLDENEYE
};





export const GenderType = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Transgender', label: 'Transgender' },
    { value: 'Other', label: 'Other' },
];


export const securityQuestions = [
    { value: 1, label: "What's your birth year?" },
    { value: 2, label: "What is your mother's maiden name?" },
    { value: 3, label: "In which city were you born?" },
    { value: 4, label: "What is your favorite pet's name?" },
];

export const themeList = {
    Agriculture: "UU_AGRICULTURE",
    Mars: "UU_MARS",
    Water: "UU_WATER",
    Mining: "UU_MINING",
    Defence: "UU_DEFENCE",
};

export const adminList = {
    WCADMIN: "WCADMIN",
    UDADMIN: "UDADMIN",
};

const today = new Date();
const sixteenYearsAgo = new Date(today);
sixteenYearsAgo.setFullYear(today.getFullYear() - 16);
export const maxDateForDOBISO = sixteenYearsAgo.toISOString().split('T')[0];
const startSelectableYear = 1900;
const startSelectableDate = new Date(startSelectableYear, 0, 1);
export const startSelectableDateISO = startSelectableDate.toISOString().split('T')[0];




export const removeWarningMassege = (setTouched) => {
    setTouched({
        USERNAME: false,
        PASSWORD: false,
        EMAIL: false,
        USER_TYPE: false,
        FIRST_NAME: false,
        MIDDLE_NAME: false,
        LAST_NAME: false,
        AU_APRO_REM: false,
        DOB: false,
        MOBILE_NO: false,
        CITY: false,
        STATE: false,
        COUNTRY: false,
        PIN_CODE: false,
        ORGANIZATION: false,
        DESIGNATION: false,
        Theme_Section: false,
        DEPARTMENT: false,
        UU_REM: false,
        ADDRESS_1: false,
        ADDRESS_2: false,


    })
}
