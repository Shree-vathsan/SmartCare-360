import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Stethoscope, Shield, User } from 'lucide-react';

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleIcon = () => {
    switch (role) {
      case 'doctor': return <Stethoscope size={32} />;
      case 'patient': return <Heart size={32} />;
      case 'admin': return <Shield size={32} />;
      default: return <User size={32} />;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://smartcare-api-bcp9.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Important
        body: JSON.stringify({ ...formData, role }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // ✅ Fetch current user info using token from httpOnly cookie
      const meRes = await fetch('https://smartcare-api-bcp9.onrender.com/api/auth/me', {
        credentials: 'include',
      });

      const user = await meRes.json();
      setUser(user); // store user in context (no token)

      // ✅ Navigate based on role
      switch (user.role) {
        case 'doctor': navigate('/doctor/dashboard'); break;
        case 'patient': navigate('/patient/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div style={{ color: '#667eea', marginBottom: '1rem' }}>
            {getRoleIcon()}
          </div>
          <h2>{getRoleTitle()} Login</h2>
          <p>Welcome to SmartCare</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
