import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, LogOut, Plus } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
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

      const [patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        fetch('https://smartcare-api-bcp9.onrender.com/api/users/patients', { headers }),
        fetch('https://smartcare-api-bcp9.onrender.com/api/appointments', { headers }),
        fetch('https://smartcare-api-bcp9.onrender.com/api/prescriptions', { headers })
      ]);

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }

      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const response = await fetch('https://smartcare-api-bcp9.onrender.com/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          ...prescriptionForm
        })
      });

      if (response.ok) {
        setShowPrescriptionModal(false);
        setSelectedPatient(null);
        setPrescriptionForm({
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await fetch(`https://smartcare-api-bcp9.onrender.com/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Dr. {user?.firstName} {user?.lastName}</h2>
          <p>{user?.specialization}</p>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <button
                onClick={() => setActiveTab('overview')}
                className={activeTab === 'overview' ? 'active' : ''}
              >
                <Calendar size={20} />
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('patients')}
                className={activeTab === 'patients' ? 'active' : ''}
              >
                <Users size={20} />
                My Patients
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('appointments')}
                className={activeTab === 'appointments' ? 'active' : ''}
              >
                <Calendar size={20} />
                Appointments
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={activeTab === 'prescriptions' ? 'active' : ''}
              >
                <FileText size={20} />
                Prescriptions
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
          <h1>Doctor Dashboard</h1>
          <p>Welcome back, <span style={{fontWeight : "bolder", fontSize : "20px"}} >{user?.firstName}!</span></p>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              <div className="card-grid">
                <div className="stat-card">
                  <h3>{patients.length}</h3>
                  <p>Total Patients</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <h3>{appointments.filter(a => a.status === 'scheduled').length}</h3>
                  <p>Upcoming Appointments</p>
                </div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                  <h3>{prescriptions.length}</h3>
                  <p>Prescriptions Written</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Recent Appointments</h3>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patient_first_name} {appointment.patient_last_name}</td>
                          <td>{appointment.appointment_date} at {appointment.appointment_time}</td>
                          <td>
                            <span className={`status-badge status-${appointment.status}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>
                            {appointment.status === 'scheduled' && (
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="btn btn-success"
                                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'patients' && (
            <div className="card">
              <div className="card-header">
                <h3>My Patients</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>{patient.first_name} {patient.last_name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.phone}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPrescriptionModal(true);
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                          >
                            <Plus size={14} style={{ marginRight: '0.25rem' }} />
                            Prescribe
                          </button>
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
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_first_name} {appointment.patient_last_name}</td>
                        <td>{appointment.appointment_date} at {appointment.appointment_time}</td>
                        <td>
                          <span className={`status-badge status-${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>{appointment.notes || 'No notes'}</td>
                        <td>
                          {appointment.status === 'scheduled' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="btn btn-success"
                                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="btn btn-danger"
                                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="card">
              <div className="card-header">
                <h3>Prescriptions</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Date Prescribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td>{prescription.patient_first_name} {prescription.patient_last_name}</td>
                        <td>{prescription.medication}</td>
                        <td>{prescription.dosage}</td>
                        <td>{prescription.frequency}</td>
                        <td>{prescription.duration}</td>
                        <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>New Prescription for {selectedPatient?.first_name} {selectedPatient?.last_name}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setSelectedPatient(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePrescription}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medication</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPatient(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;