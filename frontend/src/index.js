import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import reportWebVitals from './reportWebVitals';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './components/StoreContext/Store';
import { ThemeProvider } from './ThemeContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider> 
    <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop />
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>

  </Provider>
  </ThemeProvider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
