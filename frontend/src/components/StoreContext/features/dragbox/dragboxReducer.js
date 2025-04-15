import { createSlice } from '@reduxjs/toolkit';
import { enableMapSet } from "immer";
enableMapSet();
const initialState = {
  selected_pour_point: [], 
  groupSet : new Set(),
  FileName: [],
};

const dragSlice = createSlice({
  name: 'drag', 
  initialState,
  reducers: {   
    setpouringpoint: (state, action) => {    
      const { node = null, group = null, LI_LINKIDS = null } = action.payload || {};
      // const { node, group,  LI_LINKIDS} = action.payload;
      if (group !== null && !state.groupSet.has(group)){
          state.selected_pour_point.push({node, group, LI_LINKIDS});
          state.groupSet.add(group);
      } 
      else{
        const nodeExists  = state.selected_pour_point.find(item => item.node === node);
        state.selected_pour_point = state.selected_pour_point.filter(
          point => point.group !== group
        );
        if (!nodeExists){
          state.selected_pour_point.push({node, group, LI_LINKIDS});
        } 
      }
    },
    clearPouringPoint: (state) => {
      state.selected_pour_point = []; // Clears the value when needed
      console.log("FileName cleared");
    },                             
    removeporepoint :(state, action) =>{ 

      console.log("fff")
    },
    // closeModal: (state) => {
    //   state.isModalOpen = false;
    // },
    // adminFormopen: (state) => {
    //   state.isadminformOpen = true;
    // },
    // adminFormClose: (state) => {
    //   state.isadminformOpen = false;
    // }
    addFileName: (state, action) => {
      state.FileName.push(action.payload);
      console.log("Updated FileName:", [...state.FileName]);
    },
    clearFileName: (state) => {
      state.FileName = []; // Clears the value when needed
      console.log("FileName cleared");
    },

  },
});

export const { setpouringpoint, removeporepoint, addFileName, clearFileName, clearPouringPoint } = dragSlice.actions;   
export default dragSlice.reducer;