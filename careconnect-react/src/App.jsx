import React from 'react';
import { EhrProvider, useEhr } from './context/EhrContext';
import { Navbar } from './components/Navbar';
import { AuthLogin } from './modules/AuthLogin';
import { DoctorDashboard } from './modules/DoctorDashboard';
import { PatientDashboard } from './modules/PatientDashboard';
import { AdminDashboard } from './modules/AdminDashboard';
import { Shield, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, currentUser, toast } = useEhr();

  // If not logged in, render the clean Login page
  if (!isAuthenticated) {
    return <AuthLogin />;
  }

  const role = currentUser?.role || '';
  const isDoctor = role === 'ROLE_DOCTOR' || role === 'Doctor';
  const isPatient = role === 'ROLE_PATIENT' || role === 'Patient';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'Administrator' || role === 'Admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Toast Notification (Simple, clean, floating) */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 flex items-center space-x-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />}
          <span className="font-medium text-slate-800">{toast.message}</span>
        </div>
      )}

      {/* Simple, Responsive Navigation Bar */}
      <Navbar />

      {/* Role-Specific Workspace View */}
      <main className="flex-grow">
        {isDoctor && <DoctorDashboard />}
        {isPatient && <PatientDashboard />}
        {isAdmin && <AdminDashboard />}
        {!isDoctor && !isPatient && !isAdmin && <DoctorDashboard />}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-xs text-slate-400 no-print mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <strong className="text-slate-700">CareConnect EHR</strong> • Hospital Information System
          </div>
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Confidential Protected Health Information (PHI) • HIPAA Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <EhrProvider>
      <AppContent />
    </EhrProvider>
  );
}
