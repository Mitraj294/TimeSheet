import Timesheet from "../models/Timesheet.js";
import moment from "moment";

// Convert "hh:mm AM/PM" to 24-hour format
const convertTo24Hour = (time) => moment(time, "hh:mm A").format("HH:mm");

// Convert "HH:mm" to decimal hours
const convertToDecimalHours = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

// @desc Get all timesheets
export const getTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find().populate("employeeId", "name");
    res.status(200).json(timesheets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc Create a new timesheet
export const createTimesheet = async (req, res) => {
  try {
    let { employeeId, date, startTime, endTime, lunchBreak, lunchDuration } = req.body;

    startTime = convertTo24Hour(startTime);
    endTime = convertTo24Hour(endTime);

    let totalHours = convertToDecimalHours(endTime) - convertToDecimalHours(startTime);
    if (lunchBreak === "Yes" && lunchDuration) {
      totalHours -= convertToDecimalHours(lunchDuration);
    }
    totalHours = Math.max(0, totalHours);

    const newTimesheet = new Timesheet({
      employeeId,
      date,
      startTime,
      endTime,
      lunchBreak,
      lunchDuration,
      totalHours,
      ...req.body,
    });

    const savedTimesheet = await newTimesheet.save();
    res.status(201).json({ message: "Timesheet created successfully", data: savedTimesheet });
  } catch (error) {
    res.status(400).json({ message: "Error creating timesheet", error });
  }
};

// @desc Update a timesheet
export const updateTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    let { startTime, endTime, lunchBreak, lunchDuration } = req.body;

    startTime = convertTo24Hour(startTime);
    endTime = convertTo24Hour(endTime);

    let totalHours = convertToDecimalHours(endTime) - convertToDecimalHours(startTime);
    if (lunchBreak === "Yes" && lunchDuration) {
      totalHours -= convertToDecimalHours(lunchDuration);
    }
    totalHours = Math.max(0, totalHours);

    Object.assign(timesheet, req.body, { startTime, endTime, totalHours });
    await timesheet.save();

    res.json({ message: "Timesheet updated successfully", timesheet });
  } catch (error) {
    res.status(400).json({ message: "Error updating timesheet", error });
  }
};

// @desc Delete a timesheet
export const deleteTimesheet = async (req, res) => {
  try {
    const deletedTimesheet = await Timesheet.findByIdAndDelete(req.params.id);
    if (!deletedTimesheet) return res.status(404).json({ message: "Timesheet not found" });

    res.status(200).json({ message: "Timesheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
