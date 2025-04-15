// src/ThemeContext.js
// import React, { createContext, useState, useEffect } from 'react';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(() => {
//     const savedTheme = localStorage.getItem('theme');
//     return savedTheme || 'day';
//   });

//   useEffect(() => {
//     document.body.className = theme;
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === 'day' ? 'night' : 'day'));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export default ThemeContext;
// src/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import './App.css';
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 // Ensure you have this CSS file

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'day';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'day' ? 'night' : 'day'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeToggleSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="d-flex align-items-center">
       <FontAwesomeIcon 
        icon={theme === 'night' ? faMoon : faSun} 
        className="mr-3 text-info" 
      />
    
      <label className="switch">
       
      <input 
     
        type="checkbox" 
        checked={theme === 'night'} 
        onChange={toggleTheme} 
        style={{height:"9px", width:"9px"}}
      />
      <span className="sliders round"></span>
    </label>
    </div>
    
  );
};
