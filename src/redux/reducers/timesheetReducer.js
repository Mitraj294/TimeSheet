import { GET_TIMESHEETS, TIMESHEET_ERROR } from "../actions/types";

const initialState = {
  timesheets: [],
  loading: true,
  error: {},
};

export default function timesheetReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TIMESHEETS:
      return {
        ...state,
        timesheets: payload,
        loading: false,
      };

    case TIMESHEET_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };

    default:
      return state;
  }
}
