// src/components/ProtectedRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedUserTypes }) => {
  const accessToken = useSelector((state) => state.auth.accessToken) || localStorage.getItem('accessToken');
  const refreshToken = useSelector((state) => state.auth.refreshToken) || localStorage.getItem('refreshToken');
  const userId = useSelector((state) => state.auth.userId);
  const userType = sessionStorage.getItem("userType"); 
  
  // console.log('ProtectedRoute element:', element); // Debugging line

  if 
  // ( accessToken && allowedUserTypes.includes(userType))
  ( refreshToken && allowedUserTypes.includes(userType)) {
    return element;
  }
  return <Navigate to="/login" replace />;

  // return accessToken ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;







