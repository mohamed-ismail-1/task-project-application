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
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0,
    mediumPriorityTasks: 0,
    lowPriorityTasks: 0
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
        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4">Task Status Distribution</h5>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: stats.completedTasks },
                      { name: 'Pending', value: stats.pendingTasks }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="var(--bs-success)" />
                    <Cell fill="var(--bs-warning)" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                    itemStyle={{ color: 'var(--text-color)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="d-flex justify-content-center gap-4 mt-3">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-success" style={{width: 12, height: 12}}></div>
                <span className="small text-muted fw-bold">Completed</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-warning" style={{width: 12, height: 12}}></div>
                <span className="small text-muted fw-bold">Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4">Tasks by Priority</h5>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'High', tasks: stats.highPriorityTasks },
                    { name: 'Medium', tasks: stats.mediumPriorityTasks },
                    { name: 'Low', tasks: stats.lowPriorityTasks }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="tasks" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
