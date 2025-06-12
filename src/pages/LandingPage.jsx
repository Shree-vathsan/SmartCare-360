import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Heart, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-header">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '0rem' }}>
        <img src="/logo.png" height={375} width={500} />
        <p className="slogan" style={{gap:'0px'}} >Smart Healthcare at Your Fingertips</p>
      </div>

        
        <div className="role-buttons">
          <Link to="/login/doctor" className="role-button">
            <Stethoscope size={24} style={{ marginBottom: '0.5rem' }} />
            <div>
              <div>Doctor Login</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Manage patients & prescriptions</div>
            </div>
          </Link>
          <Link to="/login/patient" className="role-button">
            <Heart size={24} style={{ marginBottom: '0.5rem' }} />
            <div>
              <div>Patient Login</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Book appointments & view records</div>
            </div>
          </Link>
          <Link to="/login/admin" className="role-button">
            <Shield size={24} style={{ marginBottom: '0.5rem' }} />
            <div>
              <div>Admin Login</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>System management & oversight</div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* <div style={{ marginTop: '4rem', fontSize: '0.875rem', opacity: 0.7 }}>
        <p>Demo Credentials:</p>
        <p>Doctor: doctor@smartcare.com / doctor123</p>
        <p>Patient: patient@smartcare.com / patient123</p>
        <p>Admin: admin@smartcare.com / admin123</p>
      </div> */}
    </div>
  );
};

export default LandingPage;