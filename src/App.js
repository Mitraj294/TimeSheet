import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Provider } from "react-redux";
import store from "./store/store"; 

import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Alert from "./components/layout/Alert";
import { SidebarProvider } from "./context/SidebarContext";


import Login from "./components/auth/Login"; 
import Register from "./components/auth/Register";

import Dashboard from "./components/pages/Dashboard";
import Employees from "./components/pages/Employees";
import EmployeeForm from "./components/pages/EmployeeForm";
import Clients from "./components/pages/Clients"; 
import Map from "./components/pages/Map"; 
import Timesheet from "./components/pages/Timesheet"; 
import CreateTimesheet from "./components/pages/CreateTimesheet";
import EditEmployee from "./components/pages/updateEmployee";

import "./styles/App.css";  


const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Provider store={store}>
      <SidebarProvider>
        <Router>
          {isAuthenticated && <Navbar />}
          {isAuthenticated && <Sidebar />}
          <div className={`main-content ${isAuthenticated ? "authenticated" : "auth-page"}`}>
            <Alert />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/employees" element={<PrivateRoute element={<Employees />} />} />
              <Route path="/employees/add" element={<PrivateRoute element={<EmployeeForm />} />} />
              <Route path="/employees/add/:id" element={<PrivateRoute element={<EmployeeForm />} />} />
              <Route path="/employees/edit/:id" element={<PrivateRoute element={<EditEmployee />} />} />

              <Route path="/clients" element={<PrivateRoute element={<Clients />} />} />
              <Route path="/map" element={<PrivateRoute element={<Map />} />} />
              <Route path="/timesheet" element={<PrivateRoute element={<Timesheet />} />} />
              <Route path="timesheet/create" element={<PrivateRoute element={<CreateTimesheet />} />} />
            </Routes>
          </div>
        </Router>
      </SidebarProvider>
    </Provider>
  );
}

export default App;
