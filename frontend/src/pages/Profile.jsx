import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const updates = { fullName: formData.fullName };
      if (formData.password) updates.password = formData.password;
      
      const response = await api.put('/profile', updates);
      login(response.data, localStorage.getItem('token'));
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Profile Settings</h2>
        <p className="text-muted m-0">Manage your personal information</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="glass-card p-4 text-center">
            <div className="bg-primary bg-opacity-10 d-inline-flex p-4 rounded-circle mb-4 border border-primary border-opacity-25">
              <User size={64} className="text-primary" />
            </div>
            <h4 className="fw-bold m-0">{user?.fullName}</h4>
            <p className="text-muted small">{user?.email}</p>
            <div className="badge bg-primary bg-opacity-10 text-primary p-2 px-3 mt-2">
              <ShieldCheck size={14} className="me-1" /> Verified User
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="glass-card p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <User size={18} className="text-primary" /> Personal Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">FULL NAME</label>
                    <input
                      type="text"
                      className="form-control bg-transparent border-secondary"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-control bg-transparent border-secondary text-muted"
                      value={formData.email}
                      disabled
                    />
                    <div className="form-text text-muted smaller">Email cannot be changed</div>
                  </div>
                </div>
              </div>

              <div className="mb-4 border-top border-secondary pt-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Lock size={18} className="text-primary" /> Change Password
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">NEW PASSWORD</label>
                    <input
                      type="password"
                      className="form-control bg-transparent border-secondary"
                      placeholder="Leave blank to keep current"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold">CONFIRM NEW PASSWORD</label>
                    <input
                      type="password"
                      className="form-control bg-transparent border-secondary"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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
        .smaller { font-size: 0.7rem; }
      `}} />
    </div>
  );
};

export default Profile;
