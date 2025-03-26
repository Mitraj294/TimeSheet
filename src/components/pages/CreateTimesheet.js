import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { getEmployees } from "../../redux/actions/employeeActions";
import axios from "axios";
import "../../styles/CreateTimesheet.scss";

const CreateTimesheet = ({ employees, getEmployees }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    startTime: "",
    endTime: "",
    lunchBreak: "No",
    lunchDuration: "00:00", // Default HH:MM
    leaveType: "None",
    description: "",
    hourlyWage: "",
    totalHours: 0,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getEmployees();

    if (location.state?.timesheet) {
      const timesheet = location.state.timesheet;
      setFormData({
        employeeId: timesheet.employeeId._id,
        date: timesheet.date,
        startTime: timesheet.startTime,
        endTime: timesheet.endTime,
        lunchBreak: timesheet.lunchBreak,
        lunchDuration: timesheet.lunchDuration || "00:00",
        leaveType: timesheet.leaveType,
        description: timesheet.description,
        hourlyWage: timesheet.hourlyWage,
        totalHours: timesheet.totalHours,
      });
      setIsEditing(true);
    }
  }, [location.state, getEmployees]);

  const handleChange = (e) => {
    let { name, value } = e.target;
  
    // If Employee is selected, fetch their hourly wage
    if (name === "employeeId") {
      const selectedEmp = employees.find((emp) => emp._id === value);
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
        hourlyWage: selectedEmp ? selectedEmp.wage || "N/A" : "N/A",
      }));
      return;
    }
  
    // If Leave Type is selected, block all time-related fields
    if (name === "leaveType") {
      const isLeave = ["Annual", "Public Holiday", "Paid"].includes(value);
  
      setFormData((prev) => ({
        ...prev,
        leaveType: value,
        startTime: isLeave ? "" : prev.startTime,
        endTime: isLeave ? "" : prev.endTime,
        lunchBreak: isLeave ? "No" : prev.lunchBreak,
        lunchDuration: isLeave ? "00:00" : prev.lunchDuration,
        totalHours: isLeave ? 0 : prev.totalHours,
      }));
      return;
    }
  
    // Format Lunch Duration as HH:MM
    if (name === "lunchDuration") {
      const [hour, minute] = value.split(":").map(Number);
      value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
  
    // Update the state for other fields
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    // Recalculate total hours if Start Time, End Time, or Lunch Duration is changed
    if (["startTime", "endTime", "lunchDuration"].includes(name)) {
      calculateHours();
    }
  };
  
  
  
  
  const calculateHours = () => {
    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(":").map(Number);
      const [endHour, endMinute] = formData.endTime.split(":").map(Number);
  
      const startTime = new Date(0, 0, 0, startHour, startMinute);
      const endTime = new Date(0, 0, 0, endHour, endMinute);
  
      if (endTime <= startTime) {
        setFormData((prev) => ({ ...prev, totalHours: 0 }));
        return;
      }
  
      let total = (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours
  
      if (formData.lunchBreak === "Yes" && formData.lunchDuration) {
        const [lunchHour, lunchMinute] = formData.lunchDuration.split(":").map(Number);
        const lunchDuration = lunchHour + lunchMinute / 60;
        total -= lunchDuration;
      }
  
      setFormData((prev) => ({ ...prev, totalHours: total > 0 ? total.toFixed(2) : 0 }));
    }
  };
  
  // Run calculation when component mounts or timesheet is preloaded
  useEffect(() => {
    calculateHours();
  }, [formData.startTime, formData.endTime, formData.lunchBreak, formData.lunchDuration]);
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in! Please log in first.");
        return;
      }
  
      // Create a copy of formData and remove `startTime` & `endTime` if leave type is selected
      let timesheetData = { ...formData };
  
      if (["Annual", "Public Holiday", "Paid"].includes(formData.leaveType)) {
        delete timesheetData.startTime;
        delete timesheetData.endTime;
        delete timesheetData.lunchBreak;
        delete timesheetData.lunchDuration;
        timesheetData.totalHours = 0; // Ensure total hours is 0 for leave
      }
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/timesheets/${location.state.timesheet._id}`,
          timesheetData,
          config
        );
        alert("Timesheet updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/timesheets", timesheetData, config);
        alert("Timesheet created successfully!");
      }
  
      navigate("/timesheet");
    } catch (error) {
      console.error("Error submitting timesheet:", error.response?.data || error.message);
      alert("Failed to submit timesheet. Check console for details.");
    }
  };
  
  return (
    <div className='create-timesheet-container'>
      <div className='timesheet-header'>
        <h1>
          <FontAwesomeIcon icon={faPen} /> {isEditing ? 'Edit' : 'Create'}{' '}
          Timesheet
        </h1>
      </div>

      <div className='breadcrumb'>
        <Link
          to='/dashboard'
          className='breadcrumb-link'
        >
          Dashboard
        </Link>
        <span> / </span>
        <Link
          to='/timesheet'
          className='breadcrumb-link'
        >
          Timesheet
        </Link>
        <span> / </span>
        <span>{isEditing ? 'Edit' : 'Create'} Timesheet</span>
      </div>

      <div className='form-container'>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Employee</label>
            <select
              name='employeeId'
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              <option value=''>Select Employee</option>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <option
                    key={emp._id}
                    value={emp._id}
                  >
                    {emp.name}
                  </option>
                ))
              ) : (
                <option>No Employees Found</option>
              )}
            </select>
          </div>

          <div className='form-group'>
            <label>Date</label>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label>Start Time</label>
            <input
              type='time'
              name='startTime'
              value={formData.startTime}
              onChange={handleChange}
              step='60'
              required
              disabled={["Annual", "Public Holiday", "Paid"].includes(formData.leaveType)}
  
            />
          </div>

          <div className='form-group'>
            <label>End Time</label>
            <input
              type='time'
              name='endTime'
              value={formData.endTime}
              onChange={handleChange}
              step='60'
              required
              disabled={["Annual", "Public Holiday", "Paid"].includes(formData.leaveType)}
  
            />
          </div>

          <div className='form-group'>
            <label>Lunch Break</label>
            <select
              name='lunchBreak'
              value={formData.lunchBreak}
              onChange={handleChange}
              disabled={["Annual", "Public Holiday", "Paid"].includes(formData.leaveType)}
  
            >
              <option value='No'>No</option>
              <option value='Yes'>Yes</option>
            </select>
          </div>
          {formData.lunchBreak === 'Yes' && (
            <div className='form-group'>
              <label>Lunch Break Duration (HH:MM)</label>
              <select
                name='lunchDuration'
                value={formData.lunchDuration}
                onChange={handleChange}
                required
                disabled={["Annual", "Public Holiday", "Paid"].includes(formData.leaveType)}
  
              >
                <option value='00:00'>00:00</option>
                <option value='00:15'>00:15</option>
                <option value='00:30'>00:30</option>
                <option value='00:45'>00:45</option>
                <option value='01:00'>01:00</option>
                <option value='01:30'>01:30</option>
                <option value='02:00'>02:00</option>
              </select>
            </div>
          )}

          <div className='form-group'>
            <label>Leave Type</label>
            <select
              name='leaveType'
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option value='None'>None</option>
              <option value='Annual'>Annual</option>
              <option value='Sick'>Sick</option>
              <option value='Public Holiday'>Public Holiday</option>
              <option value='Paid'>Paid</option>
              <option value='Unpaid'>Unpaid</option>
            </select>
          </div>

          <div className='form-group'>
            <label>Description</label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Add any notes'
            ></textarea>
          </div>

          <div className="form-group">
  <label>Hourly Wage</label>
  <input type="text" name="hourlyWage" value={formData.hourlyWage} readOnly />
</div>


          <div className='summary'>
            <strong>Total Hours Worked:</strong> {formData.totalHours} hours
          </div>

          <div className='form-buttons'>
            <button
              type='submit'
              className='submit-btn'
            >
              <FontAwesomeIcon icon={faSave} />{' '}
              {isEditing ? 'Save Changes' : 'Save Timesheet'}
            </button>
            <button
              type='button'
              className='cancel-btn'
              onClick={() => navigate('/timesheet')}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  employees: state.employees.employees,
});

export default connect(mapStateToProps, { getEmployees })(CreateTimesheet);
