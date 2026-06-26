import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      const { token, ...userData } = response.data;
      login(userData, token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && !errorData.error) {
          // It's a field validation error map (e.g. {password: "...", fullName: "..."})
          const messages = Object.values(errorData).join(', ');
          toast.error(messages || 'Registration failed');
        } else {
          toast.error(errorData.error || 'Registration failed');
        }
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="glass-card p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-5">
          <div className="bg-primary d-inline-flex p-3 rounded-4 mb-3">
            <UserPlus size={32} className="text-white" />
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Start managing your tasks efficiently</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">FULL NAME</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-muted">
                <User size={18} />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-secondary"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
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

          <div className="row">
            <div className="col-md-6 mb-3">
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
            <div className="col-md-6 mb-4">
              <label className="form-label text-muted small fw-bold">CONFIRM</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-secondary text-muted">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  className="form-control bg-transparent border-secondary"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mb-4 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" /> : <UserPlus size={20} />}
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <p className="text-center text-muted mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-primary text-decoration-none fw-bold">
            Sign In
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

export default Register;
