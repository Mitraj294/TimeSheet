import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async action to fetch timesheets from API
export const fetchTimesheets = createAsyncThunk(
  'timesheet/fetchTimesheets',
  async () => {
    const response = await axios.get('http://localhost:5000/api/timesheets');
    return response.data;
  }
);

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default timesheetSlice.reducer;
