import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getEmployees } from "../../redux/actions/employeeActions";
import { getTimesheets } from "../../redux/actions/timesheetActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import {
  faUsers,
  faClock,
  faStopwatch,
  faUtensils,
  faCalendarAlt,
  faBriefcase,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import Chart from "chart.js/auto";
import "../../styles/Dashboard.scss";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const timesheets = useSelector((state) => state.timesheets?.timesheets || []);
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || "User";
  const chartRef = useRef(null);

  const [selectedEmployee, setSelectedEmployee] = useState({ value: "All", label: "All Employees" });
  const [viewType, setViewType] = useState({ value: "Weekly", label: "View by Weekly" });

  useEffect(() => {
    dispatch(getEmployees());
    dispatch(getTimesheets());
  }, [dispatch]);

  const employeeOptions = [
    { value: "All", label: "All Employees" },
    ...employees.map((emp) => ({ value: emp._id, label: emp.name })),
  ];

  const viewOptions = [
    { value: "Weekly", label: "View by Weekly" },
    { value: "Fortnightly", label: "View by Fortnightly" },
    { value: "Monthly", label: "View by Monthly" },
  ];

  const filteredEmployees =
    selectedEmployee.value === "All"
      ? employees
      : employees.filter((emp) => emp._id === selectedEmployee.value);

  const employeeTimesheets =
    selectedEmployee.value !== "All"
      ? timesheets.filter((t) => t.employeeId === selectedEmployee.value)
      : timesheets;

  // Calculate total and average hours
  const totalHours = employeeTimesheets.reduce((acc, t) => acc + (t.totalHours || 0), 0);
  const avgHours = employeeTimesheets.length > 0 ? (totalHours / employeeTimesheets.length).toFixed(1) : "N/A";

  // Calculate average lunch break
  const lunchBreakEntries = employeeTimesheets.filter((t) => t.lunchBreak === "Yes");
  const totalLunchDuration = lunchBreakEntries.reduce(
    (acc, t) => acc + (t.lunchDuration ? parseFloat(t.lunchDuration) : 0),
    0
  );
  const totalBreaks = lunchBreakEntries.length;
  const avgLunchBreak = totalBreaks > 0 ? (totalLunchDuration / totalBreaks).toFixed(2) : "N/A";

  const totalLeaves = filteredEmployees.reduce((acc, emp) => acc + (emp.leavesTaken || 0), 0);
  const projectsWorked = 0;
  const clientsWorked = 0;

  // Graph Data Preparation
  const getHoursForPeriod = (weeksAgo) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksAgo * 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const filtered = employeeTimesheets.filter((t) => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });

    return [1, 2, 3, 4, 5, 6, 7].map((_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayTotal = filtered
        .filter((t) => new Date(t.date).toDateString() === day.toDateString())
        .reduce((sum, t) => sum + (t.totalHours || 0), 0);
      return dayTotal;
    });
  };

  const thisWeekData = getHoursForPeriod(0);
  const lastWeekData = getHoursForPeriod(1);

  useEffect(() => {
    const ctx = document.getElementById("graphCanvas");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "This Week",
            data: thisWeekData,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Last Week",
            data: lastWeekData,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
    });
  }, [viewType, selectedEmployee, timesheets]);

  return (
    <div className="dashboard-container">
      {/* 1️ FILTERS SECTION */}
      <div className="dashboard-filters">
        <h4>Hello, {userName}!</h4>
        <p>Here is your current company status report.</p>

        <div className="filters">
          <div className="select-container">
            <label>Select Employee:</label>
            <Select
              options={employeeOptions}
              value={selectedEmployee}
              onChange={(option) => setSelectedEmployee(option)}
              className="custom-select"
            />
          </div>

          <div className="select-container">
            <label>Period of Time:</label>
            <Select
              options={viewOptions}
              value={viewType}
              onChange={(option) => setViewType(option)}
              className="custom-select"
            />
          </div>
        </div>
      </div>

      {/* 2 SUMMARY SECTION */}
      <div className="dashboard-grid">
        {selectedEmployee.value === "All" ? (
          <>
            <div className="dashboard-card">
              <h3>{employees.length || "N/A"}</h3>
              <p>Number of Employees</p>
              <FontAwesomeIcon icon={faUsers} className="dashboard-icon" />
            </div>

            <div className="dashboard-card">
              <h3>{totalHours || "N/A"}</h3>
              <p>Total Employee Hours</p>
              <FontAwesomeIcon icon={faClock} className="dashboard-icon" />
            </div>

            <div className="dashboard-card">
              <h3>{avgHours}</h3>
              <p>Avg. Employee Hours</p>
              <FontAwesomeIcon icon={faStopwatch} className="dashboard-icon" />
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-card">
              <h3>{avgLunchBreak} hrs</h3>
              <p>Avg. Lunch Break</p>
              <FontAwesomeIcon icon={faUtensils} className="dashboard-icon" />
            </div>

            <div className="dashboard-card">
              <h3>{totalLeaves || "N/A"}</h3>
              <p>Total Leaves Taken</p>
              <FontAwesomeIcon icon={faCalendarAlt} className="dashboard-icon" />
            </div>
          </>
        )}
      </div>

      {/* 3 GRAPH SECTION */}
      <div className="dashboard-card">
        <h4>{viewType.label} Graph (This vs Last {viewType.value})</h4>
        <canvas id="graphCanvas"></canvas>
      </div>
    </div>
  );
};

export default Dashboard;
