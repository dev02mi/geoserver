import React from 'react';
import './CustomPasswordStrengthBar.css'; // Assuming you have a CSS file for styling

const CustomPasswordStrengthBar = ({ password }) => {
  const getValidationScore = (value) => {
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[!@#$%^&*]/.test(value)) score += 1;

    return score;
  };

  // Calculate score only if password has a value
  const score = password ? getValidationScore(password) : 0;

  // Mapping score to categories
  // <5 -> weak, all conditions met but length <= 10 -> good, all conditions met and length > 10 -> strong
  let normalizedScore;
  if (score < 5) {
    normalizedScore = 0; // weak
  } else if (score === 5 && password.length <= 10) {
    normalizedScore = 1; // good
  } else if (score === 5 && password.length > 10) {
    normalizedScore = 2; // strong
  }

  const scoreWords = ['Weak', 'Good', 'Strong'];
  const scoreColors = ['red', 'orange', 'green']; // Default color is white

  return (
    <div className="password-strength-container">
      <div className="password-strength-bar">
        {/* Always render the bar structure, conditionally render the fill */}
        <div
          className="password-strength-bar-fill"
          style={{
            width: password ? `${(normalizedScore + 1) * 33.33}%` : '0%',
            backgroundColor: password ? scoreColors[normalizedScore] : 'transparent',
          }}
        ></div>
      </div>
      <div className="password-strength-text">
        {password ? scoreWords[normalizedScore] : 'Strength'}
      </div>
    </div>
  );
};

export default CustomPasswordStrengthBar;
