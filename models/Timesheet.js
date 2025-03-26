import mongoose from "mongoose";

const TimesheetSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true }, // Store date as "yyyy-mm-dd"
    startTime: { type: String, required: true }, // Store time in "hh:mm AM/PM"
    endTime: { type: String, required: true }, // Store time in "hh:mm AM/PM"
    lunchBreak: { type: String, enum: ["Yes", "No"], default: "No" },
    lunchDuration: { type: String, default: "00:00" }, // Store as "HH:MM"
    totalHours: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Timesheet", TimesheetSchema);
