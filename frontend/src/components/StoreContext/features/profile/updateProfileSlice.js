import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isUpdateProfileVisible: false,
};

const updateProfileSlice = createSlice({
  name: 'updateProfile',
  initialState,
  reducers: {
    showUpdateProfile: (state) => {
      state.isUpdateProfileVisible = true;
    },
    hideUpdateProfile: (state) => {
      state.isUpdateProfileVisible = false;
    },
  },
});

export const { showUpdateProfile, hideUpdateProfile } = updateProfileSlice.actions;
export default updateProfileSlice.reducer;
