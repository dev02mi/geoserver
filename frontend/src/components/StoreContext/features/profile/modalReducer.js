import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isModalOpen: false,
  isadminformOpen: false
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
    adminFormopen: (state) => {
      state.isadminformOpen = true;
    },
    adminFormClose: (state) => {
      state.isadminformOpen = false;
    }

  },
});

export const { openModal, closeModal, adminFormopen, adminFormClose } = modalSlice.actions;
export default modalSlice.reducer;
