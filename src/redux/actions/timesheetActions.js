import axios from "axios";
import { GET_TIMESHEETS, TIMESHEET_ERROR } from "./types";

export const getTimesheets = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/timesheets");  // Ensure this endpoint returns the data with totalHours
    dispatch({
      type: GET_TIMESHEETS,
      payload: res.data,  // The response data should include totalHours for each timesheet
    });
  } catch (error) {
    dispatch({
      type: TIMESHEET_ERROR,
      payload: { msg: error.response?.statusText, status: error.response?.status },
    });
  }
};
