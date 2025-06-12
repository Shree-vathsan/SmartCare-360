import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Activity, LogOut, Trash2, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    role: 'patient',
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, appointmentsRes] = await Promise.all([
        fetch('https://smartcare-api-bcp9.onrender.com/api/users', { headers }),
        fetch('https://smartcare-api-bcp9.onrender.com/api/appointments', { headers })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://smartcare-api-bcp9.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        setShowUserModal(false);
        setUserForm({
          email: '',
          password: '',
          role: 'patient',
          firstName: '',
          lastName: '',
          phone: '',
          specialization: '',
          licenseNumber: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`https://smartcare-api-bcp9.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getStats = () => {
    return {
      totalUsers: users.length,
      doctors: users.filter(u => u.role === 'doctor').length,
      patients: users.filter(u => u.role === 'patient').length,
      totalAppointments: appointments.length,
      scheduledAppointments: appointments.filter(a => a.status === 'scheduled').length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      chatbotBookings: appointments.filter(a => a.booking_method === 'chatbot').length
    };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user?.firstName} {user?.lastName}</p> 
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <button
                onClick={() => setActiveTab('overview')}
                className={activeTab === 'overview' ? 'active' : ''}
              >
                <Activity size={20} />
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={activeTab === 'users' ? 'active' : ''}
              >
                <Users size={20} />
                Manage Users
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('appointments')}
                className={activeTab === 'appointments' ? 'active' : ''}
              >
                <Calendar size={20} />
                All Appointments
              </button>
            </li>
            <li>
              <button onClick={logout}>
                <LogOut size={20} />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>System Overview and Management</p>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              <div className="card-grid">
                <div className="stat-card">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <h3>{stats.doctors}</h3>
                  <p>Doctors</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                  <h3>{stats.patients}</h3>
                  <p>Patients</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}>
                  <h3>{stats.totalAppointments}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                  <div className="card-header">
                    <h3>Appointment Statistics</h3>
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <span>Scheduled</span>
                      <span style={{ fontWeight: '600', color: '#2563eb' }}>{stats.scheduledAppointments}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <span>Completed</span>
                      <span style={{ fontWeight: '600', color: '#059669' }}>{stats.completedAppointments}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <span>Chatbot Bookings</span>
                      <span style={{ fontWeight: '600', color: '#7c3aed' }}>{stats.chatbotBookings}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>System Health</h3>
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', border: '1px solid rgba(167, 243, 208, 0.5)' }}>
                      <span>Database Status</span>
                      <span style={{ fontWeight: '600', color: '#065f46' }}>Online</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', border: '1px solid rgba(167, 243, 208, 0.5)' }}>
                      <span>API Status</span>
                      <span style={{ fontWeight: '600', color: '#065f46' }}>Healthy</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', border: '1px solid rgba(167, 243, 208, 0.5)' }}>
                      <span>Chatbot Service</span>
                      <span style={{ fontWeight: '600', color: '#065f46' }}>Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Booking Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 10).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patient_first_name} {appointment.patient_last_name}</td>
                          <td>Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</td>
                          <td>{appointment.appointment_date} at {appointment.appointment_time}</td>
                          <td>
                            <span className={`status-badge status-${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem',
                              backgroundColor: appointment.booking_method === 'chatbot' ? '#dbeafe' : '#f3f4f6',
                              color: appointment.booking_method === 'chatbot' ? '#1e40af' : '#374151'
                            }}>
                              {appointment.booking_method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header">
                <h3>User Management</h3>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add User
                </button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td>{userItem.first_name} {userItem.last_name}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            backgroundColor: 
                              userItem.role === 'admin' ? '#fee2e2' :
                              userItem.role === 'doctor' ? '#dbeafe' : '#d1fae5',
                            color:
                              userItem.role === 'admin' ? '#991b1b' :
                              userItem.role === 'doctor' ? '#1e40af' : '#065f46'
                          }}>
                            {userItem.role}
                          </span>
                        </td>
                        <td>{userItem.phone || 'N/A'}</td>
                        <td>{userItem.specialization || 'N/A'}</td>
                        <td>{new Date(userItem.created_at).toLocaleDateString()}</td>
                        <td>
                          {userItem.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="btn btn-danger"
                              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="card">
              <div className="card-header">
                <h3>All Appointments</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Booking Method</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_first_name} {appointment.patient_last_name}</td>
                        <td>Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</td>
                        <td>{appointment.appointment_date} at {appointment.appointment_time}</td>
                        <td>
                          <span className={`status-badge status-${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            backgroundColor: appointment.booking_method === 'chatbot' ? '#dbeafe' : '#f3f4f6',
                            color: appointment.booking_method === 'chatbot' ? '#1e40af' : '#374151'
                          }}>
                            {appointment.booking_method}
                          </span>
                        </td>
                        <td>{appointment.notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    className="form-input"
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  />
                </div>
                {userForm.role === 'doctor' && (
                  <>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userForm.specialization}
                        onChange={(e) => setUserForm({...userForm, specialization: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>License Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userForm.licenseNumber}
                        onChange={(e) => setUserForm({...userForm, licenseNumber: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;