import React, { useState, useEffect } from "react";

import Validators from "./validators";
import "./InputBox.css"

import CentraliseButton from "../components/CentraliseButton/CentraliseButton";
import {
 
  faAngleDoubleLeft,  faHome
} from "@fortawesome/free-solid-svg-icons";
 
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
} from "react-bootstrap";
import axios from "axios";

import { Country, State, City } from 'country-state-city';
import PasswordStrengthBar from "react-password-strength-bar";

import SelectBox from "./SelectBox";


import FormInputGroup from "./FormInputGroup";

function FormComponent() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const countryCodes = [
  
    { code: '+91', name: 'India' },

  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0].code);

  const handleCountryCodeChange = (e) => {
    setSelectedCountryCode(e.target.value);
  }

  const [gender, setGender] = useState('male');
  const handleChangeGender = (event) => {
    setGender(event.target.value); // Update the gender state
  };



  const initialFormState = {
    FIRST_NAME: '',
    MIDDLE_NAME: '',
    LAST_NAME: '',
    ORGANIZATION: '',
    DESIGNATION: '',
    COUNTRY: '',
    STATE: '',
    CITY: '',
    USERNAME: '',
    EMAIL: '',
    MOBILE_NO: '',
    PASSWORD: '',
    CONFIRM_PASSWORD: '',
    DOB: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const [touched, setTouched] = useState({
    FIRST_NAME: false,
    MIDDLE_NAME: false,
    LAST_NAME: false,
    ORGANIZATION: false,
    DESIGNATION: false,
    COUNTRY: false,
    STATE: false,
    CITY: false,
    USERNAME: false,
    EMAIL: false,
    MOBILE_NO: false,
    PASSWORD: "",
    CONFIRM_PASSWORD: "",
    DOB: "",
  });


  const [errors, setErrors] = useState({
    FIRST_NAME: "",
    MIDDLE_NAME: "",
    LAST_NAME: "",
    ORGANIZATION: "",
    DESIGNATION: "",
    COUNTRY: "",
    STATE: "",
    CITY: "",
    USERNAME: "",
    EMAIL: "",
    MOBILE_NO: "",
    PASSWORD: "",
    CONFIRM_PASSWORD: "",
    DOB: "",
  });



  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);

  const [isModalOpensuper, setisModalOpensuper] = useState(true);
  const [password, setPassword] = useState("");





 


  const handleChange = (e) => {
    const { name, value } = e.target;
  
    const letterRegex = /^[A-Za-z]*$/;
    const emailRegex = /^[a-z0-9.@]*$/;
    const usernameRegex = /[^@%&*_\-a-zA-Z0-9]/g;
  
    if (name === 'FIRST_NAME' || name === 'MIDDLE_NAME' || name === 'LAST_NAME') {
      if (!letterRegex.test(value)) {
        return;
      }
  
      const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: formattedValue,
      }));
  
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));
  
      return;
    }
  
    if (name === 'EMAIL') {
      if (!emailRegex.test(value.toLowerCase())) {
        return;
      }
  
      const formattedValue = value.toLowerCase();
  
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: formattedValue,
      }));
  
      setTouched((prevTouched) => ({
        ...prevTouched,
        [name]: true,
      }));
  
      return;
    }
  
    if (name === 'USERNAME') {
      if (usernameRegex.test(value)) {
        return;
      }
    }
  
    if (name === 'MOBILE_NO') {
      if (value.charAt(0) === '0' || !/^\d*$/.test(value)) {
        return;
      }
    }
  
    if (name === 'PASSWORD' || name === 'CONFIRM_PASSWORD') {
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

  }





  const getCountryName = (isoCode) => {
    const country = Country.getAllCountries().find(
      (c) => c.isoCode === isoCode
    );
    return country ? country.name : "";
  };
  // Helper function to get the state name from ISO code
  const getStateName = (countryIsoCode, stateIsoCode) => {
    const states = State.getStatesOfCountry(countryIsoCode);
    const state = states.find((s) => s.isoCode === stateIsoCode);
    return state ? state.name : "";
  };



  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setFormData({
      ...formData,
      COUNTRY: country,
      STATE: '',
      CITY: '',
    });
    setSelectedState('');
    setCities([]);

    setErrors((prevErrors) => ({
      ...prevErrors,
      STATE: 'State is required',
      CITY: 'City is required',
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      STATE: true,
      CITY: true,
    }));
  }
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setFormData({
      ...formData,
      STATE: state,
      CITY: '',
    });
    setCities(City.getCitiesOfState(selectedCountry, state));
  };

  const closeModalsuper = () => {
    setisModalOpensuper(false);
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };
  // super usser form api 

  const [isConfirmed, setisConfirmed] = useState(false)


  const handleSuperUser = async (event) => {
    event.preventDefault();

    setTouched({
      FIRST_NAME: true,
      MIDDLE_NAME: true,
      LAST_NAME: true,
      ORGANIZATION: true,
      DESIGNATION: true,
      COUNTRY: true,
      STATE: true,
      CITY: true,
      USERNAME: true,
      EMAIL: true,
      MOBILE_NO: true,
      PASSWORD: true,
      CONFIRM_PASSWORD: true
    });

    // Check for errors
    const filteredErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    console.log(filteredErrors, "filteredErrors");

    if (
      Object.keys(filteredErrors).length === 0 &&
      formData.EMAIL &&
      formData.FIRST_NAME &&
      formData.PASSWORD &&
      formData.USERNAME &&
      formData.ORGANIZATION &&
      formData.COUNTRY &&
      formData.CITY &&
      formData.LAST_NAME &&
      formData.STATE
    ) {

      alert("fj")

    } else {
      setErrors(filteredErrors);
      console.log("Form contains errors", filteredErrors);
    }
  };

 


  return (
    <Container fluid className="super_user_bg">

      <Row className="justify-content-center align-items-center mt-1 " style={{ height: "90vh" }}>
        <Card className=" Super-Card-Body">

          <Card.Body className="px-4">
            <div className="container-flex justify-content-start">
              <h4 className="heading_top mb-3">Create Super User</h4>
            </div>

            <Form onSubmit={handleSuperUser} onReset={resetForm} >
              <h4 className="heading_h4">Personal Information</h4>
              <hr className="HorizontalLine"></hr>

              <Row className="">
                <Col md="4">

                  <FormInputGroup
                    label="First Name"
                    required
                    value={formData.FIRST_NAME}
                    type="firstname"
                    onBlur={handleBlur}
                    onblur={touched.FIRST_NAME}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('FIRST_NAME', error)}
                    onChange={handleChange}
                    errorMessage={errors.FIRST_NAME}
                    name="FIRST_NAME"
                    touched={touched.FIRST_NAME}
                    inputType="text" // Specifying inputType
                  />

                </Col>

                <Col md="4">

                  <FormInputGroup
                    label="Middle Name"
                    value={formData.MIDDLE_NAME}
                    type="middle"
                    onBlur={handleBlur}
                    onblur={touched.MIDDLE_NAME}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('MIDDLE_NAME', error)}
                    onChange={handleChange}
                    errorMessage={errors.MIDDLE_NAME}
                    name="MIDDLE_NAME"
                    touched={touched.MIDDLE_NAME}
                    inputType="text" // Specifying inputType
                  />

                </Col>



                <Col md="4">

                  <FormInputGroup
                    label="Mobile"
                    required
                    value={formData.MOBILE_NO}
                    type="mobile"
                    onBlur={handleBlur}
                    onblur={touched.MOBILE_NO}
                    maxLength={10}
                    onChangeError={(error) => handleChangeError('MOBILE_NO', error)}
                    onChange={handleChange}
                    errorMessage={errors.MOBILE_NO}
                    name="MOBILE_NO"
                    touched={touched.MOBILE_NO}
                    inputType="text"
                    countryCodes={countryCodes}
                    selectedCountryCode={selectedCountryCode}
                    handleCountryCodeChange={handleCountryCodeChange}
                  />



                </Col>

                <Col md="4">
                  <FormInputGroup
                    label="Last Name"
                    required
                    value={formData.LAST_NAME}
                    type="lastname"
                    onBlur={handleBlur}
                    onblur={touched.LAST_NAME}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('LAST_NAME', error)}
                    onChange={handleChange}
                    errorMessage={errors.LAST_NAME}
                    name="LAST_NAME"
                    touched={touched.LAST_NAME}
                    inputType="text"
                  />

                </Col>


                <Col md="4">
                  <SelectBox
                    label="Gender"
                    name="Gender"
                    value={gender}
                    onChange={handleChangeGender}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}

                  />

                </Col>

                <Col sm={4}>

                  <FormInputGroup
                    label="Date Of Birth"
                    value={formData.DOB}
                    type="DOB"
                    onBlur={handleBlur}
                    onblur={touched.DOB}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('DOB', error)}
                    onChange={handleChange}
                    errorMessage={errors.DOB}
                    name="DOB"
                    touched={touched.DOB}
                    inputType="date" 
                  />

                </Col>

              </Row>

              <h4 className="heading_h4">Address Information</h4>
              <hr className="HorizontalLine"></hr>

              <Row className="">
                <Col md="4">


                  <SelectBox
                    label="Country"
                    required
                    name="COUNTRY"
                    value={formData.COUNTRY}
                    onChange={handleCountryChange}
                    onBlur={handleBlur}
                    options={Country.getAllCountries().map((country) => ({
                      value: country.isoCode,
                      label: country.name
                    }))}
                    errorMessage={errors.COUNTRY}
                    touched={touched.COUNTRY}
                    type="country"
                    onblur={touched.COUNTRY}
                    maxLength={30}
                    onChangeError={(error) => handleChangeError('COUNTRY', error)}
                  />


                </Col>

                <Col md="4">

                  <SelectBox
                    required
                    label="State"
                    name="STATE"
                    value={formData.STATE}
                    onChange={handleStateChange}
                    onBlur={handleBlur}
                    options={State.getStatesOfCountry(selectedCountry).map((state) => ({
                      value: state.isoCode,
                      label: state.name
                    }))}
                    errorMessage={errors.STATE}
                    touched={touched.STATE}
                    type="state"
                    onblur={touched.STATE}
                    maxLength={30}
                    onChangeError={(error) => handleChangeError('STATE', error)}

                  />

                </Col>

                <Col md="4">
                  <SelectBox
                    label="City"
                    name="CITY"
                    value={formData.CITY}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={cities.map((city) => ({
                      value: city.name,
                      label: city.name
                    }))}
                    errorMessage={errors.CITY}
                    touched={touched.CITY}
                    type="city"
                    onblur={touched.CITY}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('CITY', error)}
                  />


                </Col>

              </Row>

              <h4 className="heading_h4">Authorized User Credential</h4>
              <hr className="HorizontalLine"></hr>

              <Row className="">

                <Col md={4}>


                  <FormInputGroup
                    label="User Name"
                    required
                    value={formData.USERNAME}
                    type="username"
                    onBlur={handleBlur}
                    onblur={touched.USERNAME}
                    maxLength={20}
                    onChangeError={(error) => handleChangeError('USERNAME', error)}
                    onChange={handleChange}
                    errorMessage={errors.USERNAME}
                    name="USERNAME"
                    touched={touched.USERNAME}
                    inputType="text"
                  />

                </Col>

                <Col md={4}>

                  <FormInputGroup
                    label="Email Id"
                    required
                    value={formData.EMAIL}
                    type="email"
                    onBlur={handleBlur}
                    onblur={touched.EMAIL}
                    maxLength={100}
                    onChangeError={(error) => handleChangeError('EMAIL', error)}
                    onChange={handleChange}
                    errorMessage={errors.EMAIL}
                    name="EMAIL"
                    touched={touched.EMAIL}
                    inputType="email"
                  />

                </Col>

                <Col md="4">

                  <FormInputGroup
                    label="Password"
                    required
                    value={formData.PASSWORD}
                    type="password"
                    onBlur={handleBlur}
                    onblur={touched.PASSWORD}
                    maxLength={40}
                    onChangeError={(error) => handleChangeError('PASSWORD', error)}
                    onChange={handleChange}
                    errorMessage={errors.PASSWORD}
                    name="PASSWORD"
                    touched={touched.PASSWORD}
                    inputType="password"
                    placeHolder=""
                  />


                  <div class=" mx-4">
                    <PasswordStrengthBar className="" password={formData.PASSWORD} />
                  </div>
                </Col>
                {/* 
                <Col md="4">



                  <div className="input_container">
                    <div className="input-box">
                      <InputBox
                        label="confirm Password"
                        inputType="password"
                        value={formData.CONFIRM_PASSWORD}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        errorMessage={errors.CONFIRM_PASSWORD}
                        name="CONFIRM_PASSWORD"
                        maxLength={40}
                        touched={touched.CONFIRM_PASSWORD}
                        onKeyDown={(e) => {
                          if (e.keyCode === 32) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={preventPaste}
                      />
                    </div>
                    <div className="validation-component">
                      <Validators
                        value={formData.CONFIRM_PASSWORD}
                        type="confirm_password"
                        onblur={touched.CONFIRM_PASSWORD}
                        maxLength={40}
                        onChangeError={(error) => handleChangeError('CONFIRM_PASSWORD', error)}

                      />
                    </div>
                  </div>



        
                </Col> */}







              </Row>

           
              <CentraliseButton
                text="Create super user "
                onClick=""
                icon="user"
                iconPosition=""
                type="submit"
                className={""}
                disabled=""
                variant="green"
                fontAwesomeIcon={faHome}
                padding=""

              />


              <CentraliseButton
                text="Login "
                type="submit"
                variant="blue"
                fontAwesomeIcon={faHome}
                padding=""

              />

            </Form>
          </Card.Body>
        </Card>
      </Row >


    </Container >
  );
}

export default FormComponent;
