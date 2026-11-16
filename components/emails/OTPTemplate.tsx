import * as React from 'react';

interface OTPTemplateProps {
  otp: string;
}

export const OTPTemplate: React.FC<Readonly<OTPTemplateProps>> = ({ otp }) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px'
  }}>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h1 style={{ color: '#047857' }}>Jamia Manager</h1>
    </div>
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h2 style={{ color: '#111827', marginTop: '0' }}>Verification Code</h2>
      <p style={{ color: '#4b5563', fontSize: '16px' }}>
        Please use the following code to verify your identity. This code will expire soon.
      </p>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '15px',
        textAlign: 'center',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <span style={{
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '5px',
          color: '#047857'
        }}>{otp}</span>
      </div>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        If you did not request this code, please ignore this email.
      </p>
    </div>
    <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
      <p style={{ color: '#9ca3af', fontSize: '12px' }}>
        &copy; {new Date().getFullYear()} Jamia Madeenathunnoor. All rights reserved.
      </p>
    </div>
  </div>
);

export default OTPTemplate;
