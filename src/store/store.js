import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slices/authSlice";
import alertReducer from "../redux/reducers/alertReducer";
import employeeReducer from "../redux/reducers/employeeReducer";
import timesheetReducer from "../redux/slices/timesheetSlice.js";


const store = configureStore({
  reducer: {
    alert: alertReducer,
    employees: employeeReducer,
    timesheet: timesheetReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});

export default store;
