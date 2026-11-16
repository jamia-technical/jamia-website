import * as React from 'react';

interface AdmissionCompletedTemplateProps {
  name: string;
  applicationNo: string;
  courseName: string;
}

export const AdmissionCompletedTemplate: React.FC<Readonly<AdmissionCompletedTemplateProps>> = ({ name, applicationNo, courseName }) => (
  <div style={{
    fontFamily: 'Inter, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    color: '#333'
  }}>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://jamiamadeenathunnoor.org/images/LOGO-5.png" alt="Jamia Logo" style={{ width: '120px', height: 'auto', marginBottom: '16px' }} />
      <h1 style={{ color: '#047857', fontSize: '28px', fontWeight: 'bold', margin: '0' }}>Registration Completed!</h1>
    </div>

    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #f3f4f6'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Assalamu Alaikum, {name}</h2>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563', marginBottom: '24px' }}>
        We are pleased to inform you that your registration for <strong>J-NET Exam</strong>({courseName}) has been successfully completed. 
      </p>

      <div style={{
        backgroundColor: '#f0fdf4',
        borderLeft: '4px solid #10b981',
        padding: '20px',
        marginBottom: '24px',
        borderRadius: '8px'
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Application Number</p>
        <p style={{ margin: '8px 0 0', fontSize: '24px', color: '#047857', fontWeight: 'bold' }}>{applicationNo}</p>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563', marginBottom: '8px' }}>
        Your <strong>Hall Ticket</strong> is attached to this email. Please download and keep it safe, as it is required for your entrance examination.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563', marginBottom: '32px' }}>
        For further updates, schedules, and important announcements, please ensure you have joined the official WhatsApp group mentioned during the registration process.
      </p>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Best regards,</p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '4px 0' }}>Jamia Madeenathunnoor Admission Office</p>
      </div>
    </div>

    <div style={{ textAlign: 'center', marginTop: '32px' }}>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
        &copy; {new Date().getFullYear()} Jamia Madeenathunnoor. All rights reserved.
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0' }}>
        You are receiving this email because you registered on the Jamia Madeenathunnoor portal.
      </p>
    </div>
  </div>
);

export default AdmissionCompletedTemplate;
