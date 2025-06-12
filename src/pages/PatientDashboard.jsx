import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, FileText, LogOut, Send, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PatientDashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your SmartCare assistant. I can help you book appointments with doctors. Type 'book appointment' to get started!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Chat flow control
  const [chatStage, setChatStage] = useState(null);
  const [chatBooking, setChatBooking] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [doctorsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        fetch('https://smartcare-api-bcp9.onrender.com/api/users/doctors', { headers }),
        fetch('https://smartcare-api-bcp9.onrender.com/api/appointments', { headers }),
        fetch('https://smartcare-api-bcp9.onrender.com/api/prescriptions', { headers })
      ]);

      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.text();
        setDoctors(doctorsData ? JSON.parse(doctorsData) : []);
      }
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.text();
        setAppointments(appointmentsData ? JSON.parse(appointmentsData) : []);
      }
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.text();
        setPrescriptions(prescriptionsData ? JSON.parse(prescriptionsData) : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData, bookingMethod = 'form') => {
    try {
      const response = await fetch('https://smartcare-api-bcp9.onrender.com/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...appointmentData, booking_method: bookingMethod })
      });
      if (response.ok) {
        setShowAppointmentModal(false);
        setAppointmentForm({
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          notes: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleCreateAppointmentViaChat = (booking) => {
    const newAppointment = {
      doctorId: booking.doctorId,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      notes: booking.notes,
    };
    handleCreateAppointment(newAppointment, 'chatbot');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      text: chatInput,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    const inputLower = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';

      switch (chatStage) {
        case null:
          if (inputLower.includes('book')) {
            botResponse = "Great! I'll help you book an appointment. Here are the available doctors:\n\n"
              + doctors.map((doc, i) => `${i + 1}. Dr. ${doc.first_name} ${doc.last_name} - ${doc.specialization}`).join('\n')
              + "\n\nPlease enter the number of the doctor you'd like to book with.";
            setChatStage('doctor');
          } else {
            botResponse = "Hello! I'm your SmartCare assistant. I can help you book appointments with doctors. Type 'book appointment' to get started!";
          }
          break;

        case 'doctor':
          const index = parseInt(inputLower) - 1;
          if (!isNaN(index) && doctors[index]) {
            const sel = doctors[index];
            setChatBooking(prev => ({ ...prev, doctorId: sel.id }));
            botResponse = `Selected Dr. ${sel.first_name} ${sel.last_name}. Please enter the appointment date (YYYY-MM-DD).`;
            setChatStage('date');
          } else {
            botResponse = "Invalid number. Please enter a valid doctor number from the list.";
          }
          break;

        case 'date':
          if (/^\d{4}-\d{2}-\d{2}$/.test(inputLower)) {
            setChatBooking(prev => ({ ...prev, appointmentDate: inputLower }));
            botResponse = "Got it. Enter appointment time (HH:MM).";
            setChatStage('time');
          } else {
            botResponse = "Invalid format. Please use YYYY-MM-DD.";
          }
          break;

        case 'time':
          if (/^\d{2}:\d{2}$/.test(inputLower)) {
            setChatBooking(prev => ({ ...prev, appointmentTime: inputLower }));
            botResponse = "Any notes? Type 'no' to skip.";
            setChatStage('notes');
          } else {
            botResponse = "Invalid format. Please use HH:MM (24‑hour).";
          }
          break;

        case 'notes':
          const notesVal = inputLower === 'no' ? '' : chatInput;
          const finalBooking = { ...chatBooking, notes: notesVal };
          handleCreateAppointmentViaChat(finalBooking);
          botResponse = "Your appointment has been booked! ✅";
          setChatStage(null);
          setChatBooking({ doctorId: '', appointmentDate: '', appointmentTime: '', notes: '' });
          break;

        default:
          botResponse = "Sorry, I didn't understand that. Type 'book appointment' to get started.";
          setChatStage(null);
      }

      const botMessage = {
        id: chatMessages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 800);
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
          <h2>{user?.firstName} {user?.lastName}</h2>
          <p>Patient Portal</p>
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li><button onClick={() => setActiveTab('overview')} className={activeTab==='overview'?'active':''}><Calendar size={20}/>Overview</button></li>
            <li><button onClick={() => setActiveTab('appointments')} className={activeTab==='appointments'?'active':''}><Calendar size={20}/>Appointments</button></li>
            <li><button onClick={() => setActiveTab('prescriptions')} className={activeTab==='prescriptions'?'active':''}><FileText size={20}/>Prescriptions</button></li>
            <li><button onClick={() => setActiveTab('chatbot')} className={activeTab==='chatbot'?'active':''}><MessageCircle size={20}/>AI Assistant</button></li>
            <li><button onClick={logout}><LogOut size={20}/>Logout</button></li>
          </ul>
        </nav>
      </div>
      
      
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Patient Dashboard</h1>
          <p>Welcome back, <span style={{fontWeight : "bolder", fontSize : "20px"}} >{user?.firstName}!</span></p>
        </div>

        {activeTab==='overview' && (
          <div className="dashboard-content">
            <div className="card-grid">
              <div className="stat-card"><h3>{appointments.filter(a=>a.status==='scheduled').length}</h3><p>Upcoming Appointments</p></div>
              <div className="stat-card" style={{background:'linear-gradient(135deg,#059669,#10b981)'}}><h3>{appointments.length}</h3><p>Total Appointments</p></div>
              <div className="stat-card" style={{background:'linear-gradient(135deg,#dc2626,#ef4444)'}}><h3>{prescriptions.length}</h3><p>Active Prescriptions</p></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
              <div className="card">
                <div className="card-header"><h3>Book New Appointment</h3><button onClick={()=>setShowAppointmentModal(true)} className="btn btn-primary"><Plus size={16} style={{marginRight:'0.5rem'}}/>Book Appointment</button></div>
                <p>Schedule appointments with our qualified doctors...</p>
              </div>
              <div className="card">
                <div className="card-header"><h3>Recent Prescriptions</h3></div>
                {prescriptions.slice(0,3).map(p => (
                  <div key={p.id} style={{marginBottom:'1rem',padding:'1rem',backgroundColor:'rgba(248,250,252,0.8)',borderRadius:'12px',border:'1px solid rgba(226,232,240,0.5)'}}>
                    <div style={{fontWeight:'600'}}>{p.medication}</div>
                    <div style={{fontSize:'0.875rem',color:'#64748b'}}>{p.dosage} ‒ {p.frequency}</div>
                    <div style={{fontSize:'0.75rem',color:'#64748b'}}>Dr. {p.doctor_first_name} {p.doctor_last_name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        

        {/* Appointments */}
        {activeTab==='appointments' && (
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header"><h3>My Appointments</h3><button onClick={()=>setShowAppointmentModal(true)} className="btn btn-primary"><Plus size={16} style={{marginRight:'0.5rem'}}/>Book New Appointment</button></div>
              <div className="table-container">
                <table className="table"><thead><tr><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Status</th><th>Booking Method</th><th>Notes</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td>Dr. {a.doctor_first_name} {a.doctor_last_name}</td>
                      <td>{a.specialization}</td>
                      <td>{a.appointment_date} at {a.appointment_time}</td>
                      <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                      <td><span style={{
                        padding:'0.25rem 0.5rem',
                        borderRadius:'4px',
                        fontSize:'0.75rem',
                        backgroundColor: a.booking_method==='chatbot'? '#dbeafe':'#f3f4f6',
                        color: a.booking_method==='chatbot'? '#1e40af':'#374151'
                      }}>{a.booking_method}</span></td>
                      <td>{a.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions */}
        {activeTab==='prescriptions' && (
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header"><h3>My Prescriptions</h3></div>
              <div className="table-container">
                <table className="table"><thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Prescribed By</th><th>Date</th><th>Instructions</th></tr></thead>
                <tbody>{prescriptions.map(p => (
                  <tr key={p.id}>
                    <td style={{fontWeight:'600'}}>{p.medication}</td><td>{p.dosage}</td><td>{p.frequency}</td><td>{p.duration}</td><td>Dr. {p.doctor_first_name} {p.doctor_last_name}</td><td>{new Date(p.created_at).toLocaleDateString()}</td><td>{p.instructions||'None'}</td>
                  </tr>
                ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot */}
        {activeTab==='chatbot' && (
          <div className="dashboard-content" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
            <div className="card">
              <div className="card-header"><h3>AI Assistant</h3><p style={{fontSize:'0.875rem',color:'#64748b',marginTop:'0.5rem'}}>Chat with our AI assistant to book appointments</p></div>
              <div className="chatbot-container">
                <div className="chatbot-header">SmartCare AI Assistant</div>
                <div className="chatbot-messages">
                  {chatMessages.map(m => (
                    <div key={m.id} className={`message ${m.sender}`}>{m.text}</div>
                  ))}
                </div>
                <form className="chatbot-input" onSubmit={handleChatSubmit}>
                  <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type your message..." />
                  <button type="submit"><Send size={16} /></button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>Quick Actions</h3></div>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <button onClick={()=>setShowAppointmentModal(true)} className="btn btn-primary"><Plus size={16} style={{marginRight:'0.5rem'}}/>Book Appointment (Form)</button>
                <button onClick={()=>{
                  const message = "book appointment";
                  setChatInput(message);
                  const userMsg = { id: chatMessages.length+1, text: message, sender:'user', timestamp:new Date() };
                  setChatMessages(prev=>[...prev, userMsg]);
                  // trigger chatbot logic
                  setTimeout(()=>handleChatSubmit({ preventDefault: ()=>{} }), 100);
                }} className="btn btn-secondary">
                  <MessageCircle size={16} style={{marginRight:'0.5rem'}}/>Book via Chatbot
                </button>
                <div style={{padding:'1rem', backgroundColor:'rgba(248,250,252,0.8)',borderRadius:'12px',border:'1px solid rgba(226,232,240,0.5)'}}>
                  <h4 style={{fontSize:'1rem', marginBottom:'0.5rem'}}>Available Doctors</h4>
                  {doctors.map(doc=><div key={doc.id} style={{fontSize:'0.875rem',marginBottom:'0.25rem'}}>Dr. {doc.first_name} {doc.last_name} - {doc.specialization}</div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Book New Appointment</h3>
                <button className="modal-close" onClick={()=>setShowAppointmentModal(false)}>×</button>
              </div>
              <form onSubmit={e=>{e.preventDefault();handleCreateAppointment(appointmentForm);}}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Doctor</label>
                    <select className="form-input" value={appointmentForm.doctorId} onChange={e=>setAppointmentForm(prev=>({...prev,doctorId:e.target.value}))} required>
                      <option value="">Choose a doctor...</option>
                      {doctors.map(doc=><option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name} - {doc.specialization}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Appointment Date</label>
                    <input type="date" className="form-input" value={appointmentForm.appointmentDate}
                      onChange={e=>setAppointmentForm(prev=>({...prev,appointmentDate:e.target.value}))}
                      min={new Date().toISOString().split('T')[0]} required/>
                  </div>
                  <div className="form-group">
                    <label>Appointment Time</label>
                    <input type="time" className="form-input" value={appointmentForm.appointmentTime}
                      onChange={e=>setAppointmentForm(prev=>({...prev,appointmentTime:e.target.value}))} required/>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea className="form-input" rows={3} value={appointmentForm.notes}
                    onChange={e=>setAppointmentForm(prev=>({...prev,notes:e.target.value}))}
                    placeholder="Any additional..."/>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowAppointmentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Book Appointment</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;
