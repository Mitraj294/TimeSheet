import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEmployees, deleteEmployee } from "../../redux/actions/employeeActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faIdCard, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Employees.scss";

const Employees = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth); // Get logged-in user

  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      dispatch(deleteEmployee(id));
    }
  };

  return (
    <div className="employees-container">
      {/* Header Section */}
      <div className="employees-header">
        <div className="title-breadcrumb">
          <h2>
            <FontAwesomeIcon icon={faIdCard} /> Employees
          </h2>
          <div className="breadcrumb">
            <Link to="/dashboard" className="breadcrumb-link">
              Dashboard
            </Link>
            <span> / </span>
            <span>Employees</span>
          </div>
        </div>

        {/* Show Add Employee Button only for Employers */}
        {user?.role === "employer" && (
          <button className="add-employee-btn" onClick={() => navigate("/employees/add")}>
            <FontAwesomeIcon icon={faPlus} /> Add Employee
          </button>
        )}
      </div>

      {/* Employee Table */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee Code</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Overtime</th>
            <th>Expected Hours</th>
            <th>Holiday Multiplier</th>
            <th>Wage</th>
            {user?.role === "employer" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.employeeCode}</td>
              <td>{emp.email}</td>
              <td>{emp.isAdmin ? "Yes" : "No"}</td>
              <td>{emp.overtime ? "Yes" : "No"}</td>
              <td>{emp.expectedHours} hrs</td>
              <td>{emp.holidayMultiplier}</td>
              <td>${emp.wage}/hr</td>
              
              {/* Only Employers Can Edit/Delete Employees */}
              {user?.role === "employer" && (
                <td>
                  <button className="edit-btn" onClick={() => navigate(`/employees/edit/${emp._id}`)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(emp._id)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
