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
      setCurrentDate(newDate);
    } else {
      if (viewType === 'Weekly') newDate.setDate(newDate.getDate() - 7);
      else if (viewType === 'Fortnightly') newDate.setDate(newDate.getDate() - 14);
      else if (viewType === 'Monthly') newDate.setMonth(newDate.getMonth() - 1);

      setCurrentDate(adjustToMonday(newDate));
    }
  };

  const handleNext = () => {
    let newDate = new Date(currentDate);

    if (viewType === 'Daily') {
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    } else {
      if (viewType === 'Weekly') newDate.setDate(newDate.getDate() + 7);
      else if (viewType === 'Fortnightly') newDate.setDate(newDate.getDate() + 14);
      else if (viewType === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);

      setCurrentDate(adjustToMonday(newDate));
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generateDateColumns = useMemo(() => {
    let startDate = new Date(currentDate);

    if (viewType !== 'Daily') {
      startDate = adjustToMonday(startDate);
    }

    let daysCount =
      viewType === 'Daily' ? 1 :
      viewType === 'Weekly' ? 7 :
      viewType === 'Fortnightly' ? 14 : 28;

    return Array.from({ length: daysCount }, (_, i) => {
      let day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return {
        date: day,
        formatted: format(day, 'EEE, MMM dd'),
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
      const formattedDate = format(date, 'EEE, MMM dd');

      if (grouped[employeeName].hoursPerDay[formattedDate] !== undefined) {
        grouped[employeeName].hoursPerDay[formattedDate] += parseFloat(timesheet.totalHours);
      }
      grouped[employeeName].details.push(timesheet);
    });

    return Object.values(grouped);
  }, [timesheets, generateDateColumns]);

  const renderWeekColumn = (viewType) => {
    if (viewType === 'Fortnightly' || viewType === 'Monthly') {
      return (
        <>
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
    return null;
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
          {viewType === 'Daily'
            ? generateDateColumns[0].formatted
            : `${generateDateColumns[0].formatted} - ${generateDateColumns[generateDateColumns.length - 1].formatted}`}
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
              <th>Expand</th>
              <th>Employee</th>
              {renderWeekColumn(viewType)}
              {generateDateColumns.map((day) => (
                <th key={day.formatted}>{day.formatted}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {groupTimesheets.map((employee) => {
              const totalHours = formatHours(
                Object.values(employee.hoursPerDay).reduce((sum, h) => sum + h, 0)
              );

              let dayChunks = [];
              if (viewType === 'Fortnightly' || viewType === 'Monthly') {
                let chunkSize = 7;
                for (let i = 0; i < generateDateColumns.length; i += chunkSize) {
                  dayChunks.push(generateDateColumns.slice(i, i + chunkSize));
                }
              } else {
                dayChunks = [generateDateColumns];
              }

              return (
                <React.Fragment key={employee.name}>
                  {dayChunks.map((week, index) => {
                    const weekLabel = `Week ${index + 1}`;
                    const weekPeriod = `${week[0].formatted} - ${week[week.length - 1].formatted}`;

                    return (
                      <tr key={index}>
                        {index === 0 && (
                          <>
                            <td rowSpan={dayChunks.length}>
                              <button onClick={() => toggleExpand(employee.name)} className='expand-btn'>
                                <FontAwesomeIcon icon={expandedRows[employee.name] ? faChevronUp : faChevronDown} />
                              </button>
                            </td>
                            <td rowSpan={dayChunks.length}>{employee.name}</td>
                          </>
                        )}

                        {viewType === 'Fortnightly' || viewType === 'Monthly' ? (
                          <>
                            <td>{weekLabel}</td>
                            <td>{weekPeriod}</td>
                          </>
                        ) : null}

                        {week.map((day) => {
                          const dayHours = formatHours(employee.hoursPerDay[day.formatted]);
                          return (
                            <td key={day.formatted} className='timesheet-cell'>
                              {!expandedRows[employee.name] ? (
                                dayHours
                              ) : (
                                <div className='expanded-content'>
                                  <strong>{dayHours}</strong>
                                  {employee.details
                                    .filter((entry) => new Date(entry.date).toDateString() === day.date.toDateString())
                                    .map((entry, i) => (
                                      <div key={i} className='timesheet-entry'>
                                        <button className='icon-btn' onClick={() => handleUpdate(entry)}>
                                          <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button className='icon-btn delete-btn' onClick={() => handleDelete(entry._id)}>
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <p><b>Start Time:</b> {entry.startTime || 'N/A'}</p>
                                        <p><b>End Time:</b> {entry.endTime || 'N/A'}</p>
                                        <p><b>Lunch Break:</b> {entry.lunchBreak === 'Yes' ? `${entry.lunchDuration} mins` : 'No break'}</p>
                                        <p><b>Notes:</b> {entry.notes || 'None'}</p>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td>{totalHours}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Timesheet;
