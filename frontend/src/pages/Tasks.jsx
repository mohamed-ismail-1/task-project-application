import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Calendar,
  CheckCircle,
  Circle,
  ListTodo
} from 'lucide-react';
import { toast } from 'react-toastify';
import TaskModal from '../components/TaskModal';
import { format } from 'date-fns';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ priority: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [search, filter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.status) params.append('status', filter.status);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const openAddModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'bg-danger',
      MEDIUM: 'bg-warning',
      LOW: 'bg-success'
    };
    return <span className={`badge ${colors[priority]} bg-opacity-10 text-${priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'success'} border border-${priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'success'}`}>{priority}</span>;
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Tasks</h2>
          <p className="text-muted m-0">Manage and track your productivity</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
          <Plus size={20} />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-muted">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-secondary text-white"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <select 
              className="form-select bg-transparent border-secondary text-white"
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            >
              <option value="" className="bg-dark">All Priorities</option>
              <option value="HIGH" className="bg-dark">High</option>
              <option value="MEDIUM" className="bg-dark">Medium</option>
              <option value="LOW" className="bg-dark">Low</option>
            </select>
          </div>
          <div className="col-md-4 col-lg-3">
            <select 
              className="form-select bg-transparent border-secondary text-white"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="" className="bg-dark">All Status</option>
              <option value="PENDING" className="bg-dark">Pending</option>
              <option value="COMPLETED" className="bg-dark">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="row g-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-secondary bg-opacity-10 d-inline-flex p-4 rounded-circle mb-3">
              <ListTodo size={48} className="text-muted" />
            </div>
            <h4>No tasks found</h4>
            <p className="text-muted">Try adjusting your filters or add a new task</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="col-12">
              <div className={`glass-card p-3 task-item transition-all ${task.status === 'COMPLETED' ? 'opacity-75' : ''}`}>
                <div className="d-flex align-items-start gap-3">
                  <button 
                    onClick={() => handleToggleStatus(task)}
                    className={`btn p-0 border-0 ${task.status === 'COMPLETED' ? 'text-success' : 'text-muted'}`}
                  >
                    {task.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <h5 className={`mb-1 text-truncate ${task.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                        {task.title}
                      </h5>
                      <div className="d-flex gap-1 align-items-center">
                        {getPriorityBadge(task.priority)}
                        <div className="dropdown">
                          <button className="btn btn-sm text-muted" data-bs-toggle="dropdown">
                            <MoreVertical size={18} />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end border-secondary shadow">
                            <li>
                              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => openEditModal(task)}>
                                <Edit size={14} /> Edit
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => handleDelete(task.id)}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted small mb-3 text-truncate-2">
                      {task.description || 'No description provided'}
                    </p>
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <Calendar size={14} />
                        <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}</span>
                      </div>
                      <div className={`small fw-bold ${task.status === 'COMPLETED' ? 'text-success' : 'text-warning'}`}>
                        {task.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks}
        task={selectedTask}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .task-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--primary-color);
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dropdown-item:active {
          background-color: var(--primary-color);
        }
      `}} />
    </div>
  );
};

export default Tasks;
