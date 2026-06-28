import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await api.get(`/tasks/report?year=${year}&month=${month}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tasks-report-${year}-${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const renderHeader = () => {
    const dateFormat = 'MMMM yyyy';
    return (
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <CalendarIcon className="text-primary" size={28} />
          <h2 className="fw-bold m-0">{format(currentDate, dateFormat)}</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft size={20} />
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight size={20} />
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={downloadReport}>
            <Download size={18} />
            <span className="d-none d-md-inline">Download Report</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEEE';
    const days = [];
    let startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col text-center fw-bold py-2 text-muted" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="row g-0 border-bottom mb-2 pb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Find tasks for this day
        const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), cloneDay));

        days.push(
          <div
            className={`col calendar-cell p-2 border ${!isSameMonth(day, monthStart) ? 'text-muted bg-light bg-opacity-10' : ''} ${isSameDay(day, new Date()) ? 'current-day' : ''}`}
            key={day}
            style={{ minHeight: '120px' }}
          >
            <div className="text-end mb-1">
              <span className={`fw-bold small ${isSameDay(day, new Date()) ? 'bg-primary text-white rounded-circle d-inline-block text-center' : ''}`} style={{width: isSameDay(day, new Date()) ? '24px' : 'auto', height: isSameDay(day, new Date()) ? '24px' : 'auto', lineHeight: isSameDay(day, new Date()) ? '24px' : 'auto'}}>
                {formattedDate}
              </span>
            </div>
            <div className="tasks-container">
              {dayTasks.slice(0, 3).map(task => (
                <div key={task.id} className={`task-badge bg-${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'info'} bg-opacity-10 text-${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'info'} rounded px-2 py-1 mb-1 small text-truncate`} title={task.title}>
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-muted small text-center">+{dayTasks.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row g-0" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="container-fluid p-0 pb-4">
      <div className="glass-card p-4">
        {renderHeader()}
        {renderDays()}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          renderCells()
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-cell {
          transition: background-color 0.2s;
        }
        .calendar-cell:hover {
          background-color: rgba(99, 102, 241, 0.05);
        }
        .current-day {
          border-color: var(--primary-color) !important;
          background-color: rgba(99, 102, 241, 0.02);
        }
        .task-badge {
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}} />
    </div>
  );
};

export default CalendarView;
