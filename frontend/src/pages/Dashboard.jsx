import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CheckCircle, 
  Clock, 
  CircleAlert, 
  ListTodo,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: 'primary' },
    { title: 'Completed', value: stats.completedTasks, icon: CheckCircle, color: 'success' },
    { title: 'Pending', value: stats.pendingTasks, icon: Clock, color: 'warning' },
    { title: 'High Priority', value: stats.highPriorityTasks, icon: CircleAlert, color: 'danger' },
  ];

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted m-0">Your task overview for today</p>
        </div>
        <div className="glass-card px-3 py-2 d-flex align-items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <span className="fw-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="col-md-6 col-xl-3">
              <div className="glass-card p-4 h-100 transition-all hover-up">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`bg-${card.color} bg-opacity-10 p-3 rounded-3`}>
                    <Icon className={`text-${card.color}`} size={24} />
                  </div>
                  <TrendingUp size={16} className="text-muted" />
                </div>
                <h3 className="fw-bold mb-1">{card.value}</h3>
                <p className="text-muted small fw-bold m-0 text-uppercase">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4">Completion Progress</h5>
            <div className="d-flex align-items-center gap-4 mb-4">
              <div className="progress-circle" style={{ '--percent': completionRate }}>
                <div className="progress-value">{completionRate}%</div>
              </div>
              <div>
                <h4 className="fw-bold m-0">{completionRate}% of tasks finished</h4>
                <p className="text-muted small m-0">Keep going! You're doing great today.</p>
              </div>
            </div>
            
            <div className="progress-bar-container mt-5">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Efficiency Status</span>
                <span className="text-primary small fw-bold">Active</span>
              </div>
              <div className="progress rounded-pill bg-secondary bg-opacity-10" style={{height: 12}}>
                <div 
                  className="progress-bar rounded-pill bg-primary progress-bar-animated" 
                  style={{width: `${completionRate}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4">Quick Insights</h5>
            <ul className="list-unstyled">
              <li className="mb-4 d-flex gap-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle h-fit">
                  <CheckCircle size={18} className="text-success" />
                </div>
                <div>
                  <p className="m-0 fw-bold small">Productivity Peak</p>
                  <p className="m-0 text-muted smaller">You finish most tasks before 2 PM</p>
                </div>
              </li>
              <li className="mb-4 d-flex gap-3">
                <div className="bg-warning bg-opacity-10 p-2 rounded-circle h-fit">
                  <Clock size={18} className="text-warning" />
                </div>
                <div>
                  <p className="m-0 fw-bold small">Upcoming Deadlines</p>
                  <p className="m-0 text-muted smaller">3 tasks due in next 24 hours</p>
                </div>
              </li>
              <li className="d-flex gap-3">
                <div className="bg-danger bg-opacity-10 p-2 rounded-circle h-fit">
                  <CircleAlert size={18} className="text-danger" />
                </div>
                <div>
                  <p className="m-0 fw-bold small">Priority Focus</p>
                  <p className="m-0 text-muted smaller">Focus on High Priority tasks first</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-up:hover {
          transform: translateY(-5px);
          border-color: var(--primary-color);
        }
        .progress-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(var(--primary-color) calc(var(--percent) * 1%), var(--border-color) 0);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .progress-circle::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          background: var(--bg-card);
          border-radius: 50%;
        }
        .progress-value {
          position: relative;
          z-index: 1;
          font-weight: bold;
          font-size: 1.5rem;
        }
        .h-fit { height: fit-content; }
        .smaller { font-size: 0.75rem; }
      `}} />
    </div>
  );
};

export default Dashboard;
