"use client";

import React, { useState } from 'react';
import AdminNav from "@/components/AdminNav";
import { AdmissionCompletedTemplate } from "@/components/emails/AdmissionCompletedTemplate";
import { OTPTemplate } from "@/components/emails/OTPTemplate";
import { sendAdmissionEmail, sendOTPEmail } from "@/app/actions/emailActions";
import toast from "react-hot-toast";
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const EmailPreviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admission' | 'otp'>('admission');
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('John Doe');
  const [testAppNo, setTestAppNo] = useState('JN1234');
  const [testOTP, setTestOTP] = useState('123456');
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  React.useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Please enter a destination email");
      return;
    }

    setSending(true);
    try {
      let result;
      if (activeTab === 'admission') {
        // For testing purposes, we send a dummy base64 PDF
        const dummyPdf = "JVBERi0xLjcKJaaaa"; // Minimal dummy PDF content
        result = await sendAdmissionEmail(testEmail, testName, testAppNo, dummyPdf, "Rabbani");
      } else {
        result = await sendOTPEmail(testEmail, testOTP);
      }

      if (result.success) {
        toast.success("Test email sent successfully!");
      } else {
        toast.error("Error: " + result.error);
      }
    } catch (error: any) {
      toast.error("Failed to send: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />
      <main className={`flex-grow transition-all duration-300 p-6 md:p-10 ${sidebarCollapsed ? 'md:ml-0' : 'md:ml-[280px]'}`}>
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Template Preview</h1>
              <p className="text-gray-500 mt-2">Test and preview your email templates before going live.</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="Test destination email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none w-full sm:w-64"
                />
              </div>
              <button 
                onClick={handleSendTest}
                disabled={sending}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {sending ? 'Sending...' : <><Send size={18} /> Send Test</>}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar / Options */}
            <div className="w-full md:w-72 bg-gray-50 border-r border-gray-100 p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Template</label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveTab('admission')}
                    className={`px-4 py-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'admission' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Admission Complete
                  </button>
                  <button 
                    onClick={() => setActiveTab('otp')}
                    className={`px-4 py-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'otp' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    OTP Verification
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-200">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Variables</label>
                {activeTab === 'admission' ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">Name</span>
                      <input 
                        type="text" 
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">App No</span>
                      <input 
                        type="text" 
                        value={testAppNo}
                        onChange={(e) => setTestAppNo(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500">OTP Code</span>
                      <input 
                        type="text" 
                        value={testOTP}
                        onChange={(e) => setTestOTP(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Ensure <strong>RESEND_API_KEY</strong> is set in .env for actual sending.</p>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-grow bg-gray-200 p-4 md:p-12 overflow-auto max-h-[700px]">
              <div className="bg-white shadow-2xl rounded-xl mx-auto overflow-hidden">
                <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">Template Preview Window</div>
                  <div></div>
                </div>
                <div className="p-4 md:p-8">
                  {activeTab === 'admission' ? (
                    <AdmissionCompletedTemplate name={testName} applicationNo={testAppNo} courseName="Rabbani"/>
                  ) : (
                    <OTPTemplate otp={testOTP} />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailPreviewPage;
