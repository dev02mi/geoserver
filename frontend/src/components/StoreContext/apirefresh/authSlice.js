import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import ModalManager from '../../GeopicxPopupModals/ModalManager';
// ---------changes by chhaya------refresh api to call onece---//
let isRefreshing = false; // Flag to track refresh token status
let subscribers = [];
// --------- End of changes by chhaya------refresh api to call onece---//
const initialState = {
    data: null,
    accessToken: sessionStorage.getItem('accessToken') ?? null,
    refreshToken: sessionStorage.getItem('refreshToken') ?? null,
    AdminStatus: null,
    theme: [],

};

function onRrefreshed(token) {
    subscribers.forEach((callback) => callback(token));
    subscribers = [];
}

// Add subscribers that will wait for refresh completion
function addSubscriber(callback) {
    subscribers.push(callback);
}




const authSlice = createSlice({

    name: 'auth',

    initialState,

    reducers: {

        setTokens: (state, action) => {

            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            // sessionStorage.setItem('accessToken', action.payload.accessToken);
            sessionStorage.setItem('refreshToken', action.payload.refreshToken);
        },

        clearTokens: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');

        },
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setAdminStatus: (state, action) => {
            state.AdminStatus = action.payload
        }

    },
    extraReducers: (builder) => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            // state.data = action.payload.html || action.payload;
        });
    },

});






// export const fetchData = createAsyncThunk('api/fetchData', async (_, { getState, dispatch }) => {
//     const refreshToken = sessionStorage.getItem('refreshToken');

//     try {
//         const response = await axios.post(
//             'http://127.0.0.1:8000/api/token/refresh/',
//             { refresh: refreshToken },
//             {
//                 headers: {
//                     'Authorization': `Bearer ${refreshToken}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

       
//         const data = response.data;
//         const currentAccessToken = sessionStorage.getItem('accessToken');

//         if (data.access !== currentAccessToken) {
//             dispatch(setTokens({
//                 accessToken: data.access,
//                 refreshToken: refreshToken, // Keep the same refreshToken
//             }));
//             return data.access;
//         }

//     } catch (error) {
//         // console.error('Error fetching data:', error);
//         dispatch(setAdminStatus(error.response?.data?.errors));
//         ModalManager.warning({
//             modalHeaderHeading: "Admin Block",
//             modalBodyHeading: "Error",
//             message: error.response.data.errors,
//             // redirectTo: '/Login' // Specify the URL to redirect to

//             confirmButtonText: "OK",
//             onConfirm: () => {
//                 sessionStorage.clear(); 
//                 // Redirect to login page
//                 window.location.href = '/Login';
//             },
//           });
          
//     }
// });


// ---------changes by chhaya------refresh api to call onece---//
export const fetchData = createAsyncThunk('api/fetchData', async (_, { getState, dispatch }) => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    const accessToken = sessionStorage.getItem('accessToken');

    if (!refreshToken) {
        // Handle missing refresh token case
        return;
    }

    if (!isRefreshing) {
        isRefreshing = true;

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/token/refresh/',
                { refresh: refreshToken },
                {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data;
            const newAccessToken = data.access;

            dispatch(setTokens({
                accessToken: newAccessToken,
                refreshToken: refreshToken, // Keep the same refreshToken
            }));

            // Notify all subscribers with the new token
            onRrefreshed(newAccessToken);

            isRefreshing = false;

            return newAccessToken;
        } catch (error) {
            dispatch(setAdminStatus(error.response?.data?.errors));
            ModalManager.warning({
                modalHeaderHeading: "Login",
                modalBodyHeading: "Error",
                message: error.response.data.errors,
                confirmButtonText: "OK",
                onConfirm: () => {
                    sessionStorage.clear();
                    localStorage.clear();

                    window.location.href = '/Login';
                },
            });

            isRefreshing = false; // Reset the flag on error
            return Promise.reject(error);
        }
    } else {
        // If already refreshing, add requests to the subscribers queue
        return new Promise((resolve) => {
            addSubscriber((token) => {
                resolve(token);
            });
        });
    }
});
// --------- End of changes by chhaya------refresh api to call onece---//

export const { setTokens, clearTokens, setTheme, setAdminStatus } = authSlice.actions;

export default authSlice.reducer;

