// src/components/Captcha.js
import React, { useState } from 'react';
import "./Captcha.css"

function Captcha() {
  const [captchaText, setCaptchaText] = useState(generateCaptcha());
  const [userInput, setUserInput] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [verificationClass, setVerificationClass] = useState('');


  function generateCaptcha() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let captcha = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      captcha += characters.charAt(randomIndex);
    }

    return captcha;
  }

  function handleInputChange(event) {
    setUserInput(event.target.value);
  }

  function verifyCaptcha() {
    if (userInput === captchaText) {
      setVerificationResult('CAPTCHA verified!');
      setVerificationClass('success');
    } else {
      setVerificationResult('captcha verification failed.Please try again.');
      setVerificationClass('failure');
    }
  }

  return (
    <div>
      <p className='required-field text-left ml-2'>Verify that you are a human:</p>
      <div className="captcha row mx-auto mt-0">
        <div className='col-md-2 captachtext  ml-0'>
        <span className="captcha-text" >{captchaText}</span>
        </div>
        <div className=' col-md-3 mx-auto ml-2'>
        <input
        style={{width:"128%", height:"47px"}}
        // style={{margin:"10px", fontSize: "15px" , padding:"7px"}}
        className='mt-4 '
          type="text"
          placeholder="Enter CAPTCHA"
          value={userInput}
          onChange={handleInputChange}
        />
        </div>
        <div className='col-md-3 '>
        <button className='buttn'  type='submit' onClick={verifyCaptcha}>Verify</button>

        </div>
        <div className='col-md-2'></div>

      </div>
      <div className={`verification-result ${verificationClass}`}>{verificationResult}</div>
    </div>
  );
}

export default Captcha;
