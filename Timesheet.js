import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faArrowLeft, faArrowRight, faPlus, faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { format } from 'date-fns';
import '../../styles/Timesheet.scss';

const Timesheet = () => {
  const [viewType, setViewType] = useState('Weekly');
  const [timesheets, setTimesheets] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTimesheets();
  }, [currentDate, viewType]);

  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found!');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/timesheets', config);
        setTimesheets(response.data);
    } catch (error) {
        console.error('Error fetching timesheets:', error.response?.data || error.message);
        alert('Failed to fetch timesheets, please try again later.');
    } finally {
        setIsLoading(false);
    }
};

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdate = (timesheet) => {
    navigate('/timesheet/create', { state: { timesheet } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timesheet?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication error! Please log in again.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/timesheets/${id}`, config);
      alert('Timesheet deleted successfully!');
      fetchTimesheets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting timesheet:', error.response?.data || error.message);
      alert('Failed to delete timesheet. Check console for details.');
    }
  };

  const adjustToMonday = (date) => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return new Date(date.setDate(date.getDate() + diff));
  };

  const handlePrev = () => {
    let newDate = new Date(currentDate);

    if (viewType === 'Daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === 'Weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === 'Fortnightly') {
      newDate.setDate(newDate.getDate() - 14);
    } else if (viewType === 'Monthly') {
      newDate.setMonth(newDate.getMonth() - 1);
    }

    setCurrentDate(adjustToMonday(newDate));
  };

  const handleNext = () => {
    let newDate = new Date(currentDate);

    if (viewType === 'Daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === 'Weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === 'Fortnightly') {
      newDate.setDate(newDate.getDate() + 14);
    } else if (viewType === 'Monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    setCurrentDate(adjustToMonday(newDate));
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generateDateColumns = useMemo(() => {
    let startDate = new Date(currentDate);
  
    if (viewType !== 'Daily') {
      startDate = adjustToMonday(startDate); // Start on the Monday of the week
    }
  
    if (viewType === 'Daily') {
      return [{ date: startDate, formatted: format(startDate, 'EEE, MMM dd') }];
    }
  
    if (viewType === 'Weekly') {
      return Array.from({ length: 7 }, (_, i) => {
        let day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        return { date: day, formatted: format(day, 'EEE') };
      }).map((day, index, days) => {
        // Get the start and end of the week
        const weekStart = days[0];
        const weekEnd = days[days.length - 1];
  
        const period = `${format(weekStart.date, 'MMM dd')} - ${format(weekEnd.date, 'MMM dd')}`;
        return { period, days };
      });
    }
  
    // Handling for other view types (Fortnightly and Monthly)
    return Array.from({ length: viewType === 'Fortnightly' ? 2 : 4 }, (_, i) => {
      let weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
  
      return {
        week: `Week ${i + 1}`,
        period: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
        days: Array.from({ length: 7 }, (_, j) => {
          let day = new Date(weekStart);
          day.setDate(weekStart.getDate() + j);
          return { date: day, formatted: format(day, 'EEE') };
        }),
      };
    });
  }, [currentDate, viewType]);
  
  const groupTimesheets = useMemo(() => {
    let grouped = {};

    timesheets.forEach((timesheet) => {
        const employeeName = timesheet.employeeId?.name || 'Unknown';

        if (!grouped[employeeName]) {
            grouped[employeeName] = {
                name: employeeName,
                hoursPerDay: {},
                details: [],
            };
            generateDateColumns.forEach(
                (day) => (grouped[employeeName].hoursPerDay[day.formatted] = 0)
            );
        }

        const date = new Date(timesheet.date);
        const formattedDate = format(date, 'EEE, MMM dd'); // Adjust date format as necessary

        if (grouped[employeeName].hoursPerDay[formattedDate] !== undefined) {
            grouped[employeeName].hoursPerDay[formattedDate] += parseFloat(timesheet.totalHours); // Ensure this is a number
        }

        grouped[employeeName].details.push(timesheet);
    });

    return Object.values(grouped);
}, [timesheets, generateDateColumns]);

const renderTableHeaders = () => {
  if (viewType === 'Daily') {
    return (
      <>
        <th>Expand</th>
        <th>Employee</th>
        <th>Day</th>
        <th>Date</th>
        <th>Total</th>
      </>
    );
  } else if (viewType === 'Weekly') {
    return (
      <>
        <th>Expand</th>
        <th>Employee</th>
        <th>Week Period</th>
        <th>Mon</th>
        <th>Tue</th>
        <th>Wed</th>
        <th>Thu</th>
        <th>Fri</th>
        <th>Sat</th>
        <th>Sun</th>
        <th>Total</th>
      </>
    );
  } else {
    return (
      <>
        <th>Expand</th>
        <th>Employee</th>
        <th>Week</th>
        <th>Date Period</th>
        <th>Mon</th>
        <th>Tue</th>
        <th>Wed</th>
        <th>Thu</th>
        <th>Fri</th>
        <th>Sat</th>
        <th>Sun</th>
        <th>Total</th>
      </>
    );
  }
};


  return (
    <div className='Timesheet-container'>
      <div className='timesheet-header'>
        <h3><FontAwesomeIcon icon={faPen} /> Timesheet</h3>
      </div>
      <div className='breadcrumb'>
        <Link to='/dashboard' className='breadcrumb-link'>Dashboard</Link> <span> / </span> <span>Timesheet</span>
      </div>

      <div className='timesheet-top-bar'>
      <div className='timesheet-period'>
  {generateDateColumns.length > 0 ? (
    viewType === 'Daily' ? (
      generateDateColumns[0].formatted // For Daily, show the single date (e.g., Mon, Mar 01)
    ) : viewType === 'Weekly' ? (
      `${generateDateColumns[0].period}` // For Weekly, show the period (e.g., Mon, Mar 01 - Sun, Mar 07)
    ) : viewType === 'Fortnightly' ? (
      // For Fortnightly, show a single 14-day period (e.g., Mar 24 - Apr 06)
      `${generateDateColumns[0].period}`
    ) : viewType === 'Monthly' ? (
      `${format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'MMM dd')} - ${format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'MMM dd')}` // For Monthly, show the full month range (e.g., Mar 01 - Mar 31)
    ) : (
      "No data"
    )
  ) : (
    "No data"
  )}
</div>





        <div className='view-type-container'>
          <button className='nav-button' onClick={handlePrev}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <select
            id='viewType'
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className='view-type-dropdown'
          >
            <option value='Daily'>Daily</option>
            <option value='Weekly'>Weekly</option>
            <option value='Fortnightly'>Fortnightly</option>
            <option value='Monthly'>Monthly</option>
          </select>
          <button className='nav-button' onClick={handleNext}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        <button className='create-timesheet-btn' onClick={() => navigate('/timesheet/create')}>
          <FontAwesomeIcon icon={faPlus} /> Create Timesheet
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className='timesheet-table'>
          <thead>
            <tr>
              {renderTableHeaders()}
            </tr>
          </thead>
          <tbody>
  {groupTimesheets.map((employee) => {
    const totalHours = formatHours(
      Object.values(employee.hoursPerDay).reduce((sum, h) => sum + h, 0)
    );

    if (viewType === 'Daily') {
      return (
        <tr key={employee.name}>
        <td>
          <button onClick={() => toggleExpand(employee.name)} className="expand-btn">
            <FontAwesomeIcon icon={expandedRows[employee.name] ? faChevronUp : faChevronDown} />
          </button>
        </td>
        <td>{employee.name}</td>
        <td>{generateDateColumns[0]?.formatted.split(',')[0] || 'N/A'}</td> {/* Only show the day */}
        <td>{generateDateColumns[0]?.date ? format(generateDateColumns[0].date, 'MMM dd') : 'N/A'}</td> {/* Display the full date */}
        <td>{totalHours}</td>
      </tr>
      
      );
    }

    if (viewType === 'Weekly') {
      return (
        <tr key={employee.name}>
          <td>
            <button onClick={() => toggleExpand(employee.name)} className="expand-btn">
              <FontAwesomeIcon icon={expandedRows[employee.name] ? faChevronUp : faChevronDown} />
            </button>
          </td>
          <td>{employee.name}</td>
          <td>{generateDateColumns[0]?.period || 'N/A'}</td> {/* Show Week Period */}
          {generateDateColumns.map((day) => (
            <td key={day.formatted}>
              {employee.hoursPerDay[day.formatted] > 0
                ? formatHours(employee.hoursPerDay[day.formatted])
                : '0:00'}
            </td>
          ))}
          <td>{totalHours}</td>
        </tr>
      );
    }

    // For Fortnightly and Monthly
    return (
      <>
        <tr key={`${employee.name}-week1`}>
          <td rowSpan={generateDateColumns.length}>
            <button onClick={() => toggleExpand(employee.name)} className="expand-btn">
              <FontAwesomeIcon icon={expandedRows[employee.name] ? faChevronUp : faChevronDown} />
            </button>
          </td>
          <td rowSpan={generateDateColumns.length}>{employee.name}</td>
          <td>{generateDateColumns[0].week}</td>
          <td>{generateDateColumns[0].period}</td>
          {generateDateColumns[0].days.map((day) => (
            <td key={day.formatted}>
              {employee.hoursPerDay[day.formatted] > 0
                ? formatHours(employee.hoursPerDay[day.formatted])
                : '0:00'}
            </td>
          ))}
          <td>{totalHours}</td>
        </tr>

        {generateDateColumns.slice(1).map((week, index) => (
          <tr key={`${employee.name}-week${index + 2}`}>
            <td>{week.week}</td>
            <td>{week.period}</td>
            {week.days.map((day) => (
              <td key={day.formatted}>
                {employee.hoursPerDay[day.formatted] > 0
                  ? formatHours(employee.hoursPerDay[day.formatted])
                  : '0:00'}
              </td>
            ))}
            <td>{totalHours}</td>
          </tr>
        ))}
      </>
    );
  })}
</tbody>


        </table>
      )}
    </div>
  );
};

export default Timesheet;
