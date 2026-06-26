import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, ...userData } = response.data;
      login(userData, token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="glass-card p-4 p-md-5 w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-5">
          <div className="bg-primary d-inline-flex p-3 rounded-4 mb-3">
            <LogIn size={32} className="text-white" />
          </div>
          <h2 className="fw-bold">Sign In</h2>
          <p className="text-muted">Welcome to TaskFlow Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control bg-transparent border-secondary"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">PASSWORD</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control bg-transparent border-secondary"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mb-4 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" /> : <LogIn size={20} />}
            <span>{loading ? 'Authenticating...' : 'Login'}</span>
          </button>
        </form>

        <p className="text-center text-muted mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary text-decoration-none fw-bold">
            Create account
          </Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .form-control:focus {
          background: transparent;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          color: white;
        }
        .input-group-text { border-right: none; }
        .form-control { border-left: none; }
      `}} />
    </div>
  );
};

export default Login;
