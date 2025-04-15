// MyContext.js

import { createContext, useContext } from 'react';

const MyContext = createContext();

export function MyContextProvider({ children }) {
  const value = {
    basename: 'your-value-here',
    // other context properties
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

export function useMyContext() {
  return useContext(MyContext);
}
