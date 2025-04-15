import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './features/profile/modalReducer';
import updateProfileSlice from './features/profile/updateProfileSlice';
import dragSlice from './features/dragbox/dragboxReducer'
import authReducer from "./apirefresh/authSlice"

const store = configureStore({
  reducer: {
    modal: modalReducer,
    updateProfile: updateProfileSlice,
    auth: authReducer,
    drag: dragSlice
 
  },
});

export default store;
