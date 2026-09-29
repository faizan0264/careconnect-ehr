import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { AccountSettingsModal } from './AccountSettingsModal';
import { 
  Stethoscope, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Users, 
  FileText, 
  FlaskConical, 
  Pill, 
  Shield, 
  BarChart3, 
  ScrollText,
  KeyRound,
  Settings
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, login, logout, activeTab, setActiveTab } = useEhr();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const role = currentUser?.role || '';
  const isDoctor = role === 'ROLE_DOCTOR' || role === 'Doctor';
  const isPatient = role === 'ROLE_PATIENT' || role === 'Patient';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'Administrator' || role === 'Admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base">CareConnect</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDoctor ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  isPatient ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {isDoctor ? 'Doctor Portal' :
                   isPatient ? 'Patient Portal' : 'Admin Console'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links by Role */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            
            {/* DOCTOR TABS */}
            {isDoctor && (
              <>
                <button
                  onClick={() => handleTabClick('overview')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Patients
                </button>
                <button
                  onClick={() => handleTabClick('soap')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'soap' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Clinical SOAP & Vitals
                </button>
                <button
                  onClick={() => handleTabClick('orders')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  CPOE Orders
                </button>
                <button
                  onClick={() => handleTabClick('prescriptions')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'prescriptions' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  e-Prescribing
                </button>
                <button
                  onClick={() => handleTabClick('reports')}
                  className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                    activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Diagnostic Reports</span>
                </button>
              </>
            )}

            {/* PATIENT TABS */}
            {isPatient && (
              <>
                <button
                  onClick={() => handleTabClick('overview')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Health Summary
                </button>
                <button
                  onClick={() => handleTabClick('meds')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'meds' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Medications
                </button>
                <button
                  onClick={() => handleTabClick('labs')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'labs' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Lab Results
                </button>
                <button
                  onClick={() => handleTabClick('reports')}
                  className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                    activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Reports & Vault</span>
                </button>
              </>
            )}

            {/* ADMIN TABS */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleTabClick('overview')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'overview' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Analytics & Stats
                </button>
                <button
                  onClick={() => handleTabClick('users')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'users' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  User Credentials & Roles
                </button>
                <button
                  onClick={() => handleTabClick('patients')}
                  className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                    activeTab === 'patients' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Master Patient Index (MPI)</span>
                </button>
                <button
                  onClick={() => handleTabClick('audit')}
                  className={`px-3 py-2 rounded-lg transition ${
                    activeTab === 'audit' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  HIPAA Audit Trail
                </button>
              </>
            )}

          </nav>

          {/* Right User & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">{currentUser.fullName}</div>
              <div className="text-[10px] text-slate-400">{currentUser.roleLabel}</div>
            </div>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
              title="Account Settings: Change Username & Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 text-sm font-medium">
          
          {isDoctor && (
            <>
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                Patients List
              </button>
              <button
                onClick={() => handleTabClick('soap')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'soap' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                Clinical SOAP & Vitals
              </button>
              <button
                onClick={() => handleTabClick('orders')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                CPOE Orders
              </button>
              <button
                onClick={() => handleTabClick('prescriptions')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'prescriptions' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                e-Prescribing
              </button>
              <button
                onClick={() => handleTabClick('reports')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                Diagnostic Reports & Scans
              </button>
            </>
          )}

          {isPatient && (
            <>
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
              >
                My Health Summary
              </button>
              <button
                onClick={() => handleTabClick('meds')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'meds' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
              >
                My Medications
              </button>
              <button
                onClick={() => handleTabClick('labs')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'labs' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
              >
                My Lab Results
              </button>
              <button
                onClick={() => handleTabClick('reports')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
              >
                Medical Reports & Vault
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => handleTabClick('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'}`}
              >
                Analytics & Stats
              </button>
              <button
                onClick={() => handleTabClick('users')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'}`}
              >
                User Credentials & Roles
              </button>
              <button
                onClick={() => handleTabClick('patients')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 ${activeTab === 'patients' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'}`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Master Patient Index (MPI)</span>
              </button>
              <button
                onClick={() => handleTabClick('audit')}
                className={`w-full text-left px-3 py-2 rounded-lg ${activeTab === 'audit' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'}`}
              >
                HIPAA Audit Trail
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => { setSettingsModalOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-purple-700 font-semibold flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 transition"
            >
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Account Settings & Password</span>
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg text-rose-600 font-semibold flex items-center space-x-2 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}

      {/* Universal Account & Security Settings Modal */}
      <AccountSettingsModal 
        isOpen={settingsModalOpen} 
        onClose={() => setSettingsModalOpen(false)} 
      />
    </header>
  );
};
