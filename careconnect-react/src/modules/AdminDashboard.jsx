import React, { useState } from 'react';
import { useEhr, calculateAgeFromDob } from '../context/EhrContext';
import { 
  Shield, 
  Users, 
  FileText, 
  ScrollText, 
  CheckCircle2, 
  Activity, 
  UserPlus, 
  Search, 
  Filter, 
  X, 
  Trash2, 
  AlertTriangle, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Lock, 
  Edit3, 
  RotateCcw,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  HeartPulse,
  Plus,
  Check
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    patients, 
    encounter, 
    orders, 
    prescriptions, 
    systemUsers, 
    addSystemUser, 
    removeSystemUser, 
    removePatient,
    adminUpdateUser, 
    currentUser, 
    auditLogs, 
    activeTab, 
    setActiveTab,
    resetDemoData,
    syncCloudData,
    isSyncing,
    setSelectedPatientId,
    registerPatient
  } = useEhr();

  // Local state for modals, filters, and searches
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  // User Management filters
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'STAFF' | 'PATIENT'
  const [userSearch, setUserSearch] = useState('');

  // Patient Directory filter
  const [patientSearch, setPatientSearch] = useState('');

  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    username: '',
    password: 'password123',
    role: 'Doctor',
    department: 'Internal Medicine & Pulmonology',
    licenseNumber: 'MD-748920'
  });

  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1995-01-01',
    age: 31,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+1 (555) 000-0000',
    allergies: 'None (NKDA)',
    emergencyContact: 'Family - Emergency Contact',
    room: 'Outpatient Reception',
    status: 'Admitted',
    username: '',
    password: 'Patient#2026',
    email: '',
  });

  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const finalUsername = (newUser.username && newUser.username.trim()) || newUser.email.split('@')[0];
    addSystemUser({
      ...newUser,
      username: finalUsername,
      password: newUser.password || 'password123',
    });
    setNewUser({ 
      name: '', 
      email: '', 
      username: '',
      password: 'password123',
      role: 'Doctor',
      department: 'Internal Medicine & Pulmonology',
      licenseNumber: 'MD-' + Math.floor(100000 + Math.random() * 900000)
    });
    setShowAddUserModal(false);
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientData.firstName.trim()) return;
    await registerPatient({
      ...newPatientData,
      fullName: `${newPatientData.firstName.trim()} ${newPatientData.lastName.trim()}`.trim(),
    });
    setNewPatientData({
      firstName: '',
      lastName: '',
      dateOfBirth: '1995-01-01',
      age: 31,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 000-0000',
      allergies: 'None (NKDA)',
      emergencyContact: 'Family - Emergency Contact',
      room: 'Outpatient Reception',
      status: 'Admitted',
      username: '',
      password: 'Patient#2026',
      email: '',
    });
    setShowAddPatientModal(false);
  };

  const handleDeletePatientConfirm = async () => {
    if (!patientToDelete) return;
    await removePatient(patientToDelete.id);
    setPatientToDelete(null);
  };

  const staffUsers = systemUsers.filter(u => u.role !== 'Patient' && u.role !== 'ROLE_PATIENT');
  const patientUsers = systemUsers.filter(u => u.role === 'Patient' || u.role === 'ROLE_PATIENT');

  const filteredUsers = systemUsers.filter(u => {
    const isPat = u.role === 'Patient' || u.role === 'ROLE_PATIENT';
    if (userRoleFilter === 'STAFF' && isPat) return false;
    if (userRoleFilter === 'PATIENT' && !isPat) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mrn && u.mrn.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const filteredPatients = patients.filter(p => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return (
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.firstName && p.firstName.toLowerCase().includes(q)) ||
      (p.lastName && p.lastName.toLowerCase().includes(q)) ||
      (p.mrn && p.mrn.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.allergies && p.allergies.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  });

  // BUG-06 FIX: Deduplicate patients by MRN before counting to avoid inflated numbers from local+cloud merge
  const deduplicatedPatients = patients.filter((p, idx, arr) => 
    p.mrn ? arr.findIndex(x => x.mrn && x.mrn.toLowerCase() === p.mrn.toLowerCase()) === idx : true
  );
  const uniquePatientCount = deduplicatedPatients.length;

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = logFilter === 'ALL' || log.action === logFilter;
    const matchesSearch = 
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Admin Title Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            System Administration & Security Console
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Hospital System Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor healthcare metrics, manage user role access, review registered patients, and audit HIPAA Protected Health Information (PHI) events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Cloud Sync: Connected</span>
          </span>

          <button
            type="button"
            onClick={() => syncCloudData()}
            disabled={isSyncing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold shadow-xs transition"
            title="Sync all patients and registered users from live Render backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Data'}</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Analytics & Overview
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>User Credentials & Roles</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'users' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {systemUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('patients')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'patients'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Master Patient Index (MPI)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'patients' ? 'bg-purple-700 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {uniquePatientCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>HIPAA Audit Trail</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'audit' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* METRICS OVERVIEW */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div 
              onClick={() => setActiveTab('patients')}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition space-y-1 group"
              title="Click to view full Master Patient Index directory"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px] group-hover:text-blue-600 transition">Total Patients</span>
                <Users className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition" />
              </div>
              <div className="text-2xl font-black text-blue-600">{uniquePatientCount}</div>
              <span className="text-blue-600 text-[11px] font-semibold flex items-center space-x-1">
                <span>Master Patient Index</span>
                <span>→</span>
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Encounters</span>
              <div className="text-2xl font-black text-emerald-600">1</div>
              <span className="text-slate-500 text-[11px]">In consultation</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Diagnostic Orders</span>
              <div className="text-2xl font-black text-amber-600">{orders.length}</div>
              <span className="text-slate-500 text-[11px]">CPOE Pipeline</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Regimens</span>
              <div className="text-2xl font-black text-purple-600">{prescriptions.length}</div>
              <span className="text-slate-500 text-[11px]">e-Prescriptions</span>
            </div>
          </div>

          {/* User Accounts Overview Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 uppercase text-xs block">Staff & Registered User Directory</span>
                <span className="text-slate-500 text-[11px]">Active healthcare providers and patient accounts</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                  title="Reset Demo Data: Restore original clean accounts & patients"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    showCredentials
                      ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Admin Master Credential Inspector: Show or hide all passwords"
                >
                  {showCredentials ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{showCredentials ? 'Hide Passwords' : 'Show All Passwords & Usernames'}</span>
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Staff Member</span>
                </button>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setUserRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    userRoleFilter === 'ALL'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Users ({systemUsers.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('STAFF')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    userRoleFilter === 'STAFF'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Staff ({staffUsers.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('PATIENT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    userRoleFilter === 'PATIENT'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Patients ({patientUsers.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user, username, MRN..."
                  className="pl-8 pr-2.5 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-600 w-full sm:w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Role & MRN</th>
                    {showCredentials && (
                      <>
                        <th className="px-4 py-3 text-purple-700">Username</th>
                        <th className="px-4 py-3 text-amber-700">Password</th>
                      </>
                    )}
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-0.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold w-max ${
                            u.role === 'Patient' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            u.role === 'Doctor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            u.role === 'Administrator' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {u.role}
                          </span>
                          {u.mrn && (
                            <span className="font-mono text-[10px] text-blue-600 font-bold">
                              {u.mrn}
                            </span>
                          )}
                        </div>
                      </td>
                      {showCredentials && (
                        <>
                          <td className="px-4 py-3">
                            <code className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                              {u.username}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <code className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                              {u.password || 'password123'}
                            </code>
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3 text-slate-400">{u.lastLogin}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-700 font-bold text-[11px]">● {u.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingUser({ ...u, originalUsername: u.username, originalName: u.name, newPassword: u.password || '' })}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition text-[11px] font-semibold border border-blue-200"
                            title="Edit user credentials"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {u.email !== currentUser.email && u.name !== currentUser.fullName && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold"
                              title="Remove user from system"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <span className="font-bold text-slate-800 uppercase block">Manage System Credentials & Roles</span>
              <p className="text-slate-500 text-[11px] mt-0.5">RBAC Access Provisioning for Doctors, Nurses, Staff, and Registered Patients</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => syncCloudData()}
                disabled={isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                title="Sync users and patients from Render backend"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                title="Reset Demo Data: Restore original clean accounts & patients"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Demo Data</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  showCredentials
                    ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Admin Master Credential Inspector: Show or hide all passwords"
              >
                {showCredentials ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                <span>{showCredentials ? 'Hide Passwords' : 'Show All Passwords & Usernames'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Staff Account</span>
              </button>
            </div>
          </div>

          {/* Role Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUserRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  userRoleFilter === 'ALL'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Accounts ({systemUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('STAFF')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  userRoleFilter === 'STAFF'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Healthcare Providers ({staffUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('PATIENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  userRoleFilter === 'PATIENT'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Patient Accounts ({patientUsers.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user, email, username, MRN..."
                className="pl-8 pr-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-600 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role & MRN</th>
                  {showCredentials && (
                    <>
                      <th className="px-4 py-3 text-purple-700">Username</th>
                      <th className="px-4 py-3 text-amber-700">Password</th>
                    </>
                  )}
                  <th className="px-4 py-3">Email & Contact</th>
                  <th className="px-4 py-3">Last Login / Active</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{u.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-0.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold w-max ${
                          u.role === 'Patient' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.role === 'Doctor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          u.role === 'Administrator' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                        {u.mrn && (
                          <span className="font-mono text-[10px] text-blue-600 font-bold">
                            {u.mrn}
                          </span>
                        )}
                      </div>
                    </td>
                    {showCredentials && (
                      <>
                        <td className="px-4 py-3">
                          <code className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {u.username}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <code className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {u.password || 'password123'}
                          </code>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-slate-500">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-700 font-bold text-[11px]">● Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingUser({ ...u, originalUsername: u.username, originalName: u.name, newPassword: u.password || '' })}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition text-[11px] font-semibold border border-blue-200"
                          title="Edit user name, username, email, or password"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {u.email !== currentUser.email && u.name !== currentUser.fullName && (
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold"
                            title="Remove user account"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MASTER PATIENT INDEX (MPI) TAB */}
      {(activeTab === 'patients') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm uppercase">Master Patient Index (MPI Directory)</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Hospital-wide Master Patient Registry • {patients.length} Registered Patients
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => syncCloudData()}
                disabled={isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                title="Sync patients from Render cloud backend"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddPatientModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New Patient</span>
              </button>
            </div>
          </div>

          {/* Search & Summary Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                Total: {patients.length}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                Admitted: {patients.filter(p => p.status === 'Admitted' || p.status === 'In Consultation').length}
              </span>
              <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold">
                Outpatient: {patients.filter(p => p.status !== 'Admitted' && p.status !== 'In Consultation').length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search by name, MRN, phone, allergies..."
                className="pl-8 pr-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 w-full sm:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Age / Sex / DOB</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Allergies</th>
                  <th className="px-4 py-3">Portal Login</th>
                  <th className="px-4 py-3">Clinical Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const resolvedAge = p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth, p.age || 30) : (p.age || 30);
                    const matchingUser = systemUsers.find(u => 
                      (u.mrn && p.mrn && u.mrn.toLowerCase() === p.mrn.toLowerCase()) ||
                      (u.patientId && Number(u.patientId) === Number(p.id)) ||
                      (u.username && p.username && u.username.toLowerCase() === p.username.toLowerCase()) ||
                      (p.phone && u.phone && p.phone === u.phone)
                    );

                    return (
                      <tr key={p.id || p.mrn} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">
                          <code className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs">
                            {p.mrn}
                          </code>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="font-semibold text-slate-800">{resolvedAge}y • {p.gender}</div>
                          {p.dateOfBirth && <div className="text-[10px] text-slate-400">{p.dateOfBirth}</div>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {p.bloodGroup || 'O+'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{p.phone || p.contactPhone || '+1 (555) 000-0000'}</div>
                          {p.email && <div className="text-[10px] text-slate-400">{p.email}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {p.allergies && !p.allergies.includes('NKDA') ? (
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              ⚠️ {p.allergies}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">None (NKDA)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {matchingUser ? (
                            <div className="flex flex-col space-y-0.5">
                              <code className="bg-purple-50 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold w-max">
                                {matchingUser.username}
                              </code>
                              {showCredentials && (
                                <span className="font-mono text-[10px] text-amber-800 font-bold">
                                  {matchingUser.password || 'password123'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unlinked</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ● {p.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setPatientToDelete(p)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold border border-red-200"
                              title="Delete Patient from Master Patient Index"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HIPAA AUDIT LOG TAB */}
      {(activeTab === 'audit' || activeTab === 'all') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div className="flex items-center space-x-2">
              <ScrollText className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800 uppercase">HIPAA Security & Access Audit Trail</span>
            </div>
            
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs by user/action..."
                  className="pl-8 pr-2.5 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-600 w-48 sm:w-56"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="py-1 px-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
              >
                <option value="ALL">All Event Types</option>
                <option value="CREATE_ORDER">Orders Placed</option>
                <option value="VIEW_RECORD">Record Views</option>
                <option value="RECORD_VITALS">Vitals Saved</option>
                <option value="USER_PROVISIONED">Staff Provisioned</option>
                <option value="ADMIN_LOGIN">Admin Logins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User Identity</th>
                  <th className="px-4 py-3">Security Action</th>
                  <th className="px-4 py-3">Event Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-400">{log.time}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{log.user}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      No HIPAA audit records matched your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF MEMBER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Healthcare Staff Member</h3>
              <button onClick={() => setShowAddUserModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              
              {/* Provisioning Notice */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] flex items-start space-x-2">
                <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-purple-950">User Provisioning Console</strong>
                  Provision hospital providers (Doctors/Staff) or Patients. Once added here, the user can immediately log in on the Sign-In screen with their assigned credentials.
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">System Role (RBAC) *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                >
                  <option value="Doctor">Doctor / Attending Physician</option>
                  <option value="Patient">Patient</option>
                  <option value="Nurse">Registered Nurse (RN)</option>
                  <option value="Pharmacist">Clinical Pharmacist</option>
                  <option value="Lab Technician">Laboratory Specialist</option>
                  <option value="Administrator">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    {newUser.role === 'Doctor' ? 'Doctor Name & Degree *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newUser.role === 'Doctor' ? 'e.g. Dr. Robert Vance, MD' : 'e.g. Jessica Day, RN'}
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Hospital Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@careconnect.org"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Assigned Login Username</label>
                  <input
                    type="text"
                    placeholder="e.g. dr_vance"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Temporary Initial Password</label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>

              {newUser.role === 'Doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-blue-50/50 border border-blue-200 rounded-xl">
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium text-[11px]">Specialty & Department</label>
                    <select
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                    >
                      <option value="Internal Medicine & Pulmonology">Internal Medicine & Pulmonology</option>
                      <option value="Cardiology & Preventive Medicine">Cardiology & Preventive Medicine</option>
                      <option value="Family & General Practice">Family & General Practice</option>
                      <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Neurology & Neurosciences">Neurology & Neurosciences</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-medium text-[11px]">Medical License Number</label>
                    <input
                      type="text"
                      placeholder="MD-XXXXXX"
                      value={newUser.licenseNumber}
                      onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Provision Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM USER REMOVAL */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Revoke & Remove User Account</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800">{userToDelete.name}</strong> ({userToDelete.role})? 
                This will revoke their system access and record a HIPAA compliance audit event.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold text-purple-700">{userToDelete.role}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSystemUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / RESET USER CREDENTIALS */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Edit User Credentials</h3>
                  <p className="text-[11px] text-slate-500">Update account name, username, or password</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminUpdateUser({
                  ...editingUser,
                  password: editingUser.newPassword || editingUser.password,
                });
                setEditingUser(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || editingUser.fullName || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Password *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.newPassword || editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value, password: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">System Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition"
                >
                  Save Credential Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENROLL NEW PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Enroll Patient into Master Patient Index</h3>
                  <p className="text-[11px] text-slate-500">Auto-generates unique MRN and provisions Patient Portal credentials</p>
                </div>
              </div>
              <button onClick={() => setShowAddPatientModal(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita"
                    value={newPatientData.firstName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={newPatientData.lastName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatientData.dateOfBirth}
                    onChange={(e) => {
                      const dob = e.target.value;
                      const calculatedAge = calculateAgeFromDob(dob, newPatientData.age);
                      setNewPatientData({ ...newPatientData, dateOfBirth: dob, age: calculatedAge });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Gender</label>
                  <select
                    value={newPatientData.gender}
                    onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Blood Group</label>
                  <select
                    value={newPatientData.bloodGroup}
                    onChange={(e) => setNewPatientData({ ...newPatientData, bloodGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 7409318678"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@gmail.com"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Known Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, NSAIDs or None (NKDA)"
                  value={newPatientData.allergies}
                  onChange={(e) => setNewPatientData({ ...newPatientData, allergies: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <div className="font-semibold text-purple-900 text-[11px] flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>Portal Login Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. kavita"
                      value={newPatientData.username}
                      onChange={(e) => setNewPatientData({ ...newPatientData, username: e.target.value })}
                      className="w-full p-1.5 border border-purple-200 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Initial Password</label>
                    <input
                      type="text"
                      value={newPatientData.password}
                      onChange={(e) => setNewPatientData({ ...newPatientData, password: e.target.value })}
                      className="w-full p-1.5 border border-purple-200 rounded-lg bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Enroll Patient & Provision Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM PATIENT REMOVAL */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Remove Patient from Master Index</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800">{patientToDelete.fullName || `${patientToDelete.firstName} ${patientToDelete.lastName}`}</strong> ({patientToDelete.mrn})?
                This will delete their records and log a HIPAA audit event.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">MRN:</span>
                <span className="font-mono font-bold text-blue-600">{patientToDelete.mrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-700">{patientToDelete.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePatientConfirm}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition"
              >
                Confirm Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM FACTORY DEMO DATA RESET */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Restore Clean Factory Defaults</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                This will reset all user credentials, patients (MPI), appointments, and clinical data to fresh, consistent system defaults (<strong className="text-slate-800">Dr. Sarah Smith, MD</strong>, <strong className="text-slate-800">Alex Morgan</strong>, <strong className="text-slate-800">John Doe</strong>, and verified accounts).
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
              <div className="font-bold">What this fixes:</div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>Clears corrupted or renamed session profiles</li>
                <li>Restores all standard demo patients and providers</li>
                <li>Ensures all login tabs and dashboards match 100%</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  resetDemoData();
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-sm transition"
              >
                Confirm Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
