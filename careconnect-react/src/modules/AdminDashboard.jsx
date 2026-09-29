import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
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
  Copy,
  Check,
  UserCheck,
  UserX,
  HeartHandshake
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
    setSelectedPatientId
  } = useEhr();

  // Local state for modals, filters, and credentials display
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [showCredentials, setShowCredentials] = useState(true); // Always VISIBLE by default for admin
  const [copiedId, setCopiedId] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [patientSearch, setPatientSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    username: '',
    password: 'password123',
    role: 'Doctor',
    department: 'Internal Medicine & Pulmonology',
    licenseNumber: 'MD-748920'
  });

  const copyToClipboard = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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

  const filteredUsers = systemUsers.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredPatients = patients.filter(p => {
    return (
      (p.fullName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.firstName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.lastName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.mrn || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(patientSearch.toLowerCase())
    );
  });

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            System Administration & Security Console
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Hospital System Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor healthcare metrics, manage user logins, inspect credentials, and manage patient records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
            <span className="text-slate-500">Users: </span>
            <strong className="text-purple-700 font-mono">{systemUsers.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
            <span className="text-slate-500">Patients: </span>
            <strong className="text-blue-700 font-mono">{patients.length}</strong>
          </div>
        </div>
      </div>

      {/* IN-PAGE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>User Credentials & Passwords</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'users' ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-700 font-mono'}`}>
            {systemUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patients')}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'patients'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Master Patient Index (MPI)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'patients' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700 font-mono'}`}>
            {patients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Operations & Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>HIPAA Audit Trail</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'audit' ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-700 font-mono'}`}>
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: METRICS OVERVIEW (Shown on overview) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('patients')}
              className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Patients</span>
              <div className="text-2xl font-black text-blue-600">{patients.length}</div>
              <span className="text-slate-500 text-[11px] flex items-center justify-between">
                <span>Master Patient Index</span>
                <span className="text-blue-600 font-bold">Manage &rarr;</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Staff & Users</span>
              <div className="text-2xl font-black text-purple-600">{systemUsers.length}</div>
              <span className="text-slate-500 text-[11px] flex items-center justify-between">
                <span>Credentials & Passwords</span>
                <span className="text-purple-600 font-bold">Inspect &rarr;</span>
              </span>
            </button>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Diagnostic Orders</span>
              <div className="text-2xl font-black text-amber-600">{orders.length}</div>
              <span className="text-slate-500 text-[11px]">CPOE Pipeline</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Active Regimens</span>
              <div className="text-2xl font-black text-emerald-600">{prescriptions.length}</div>
              <span className="text-slate-500 text-[11px]">e-Prescriptions</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: USER MANAGEMENT & CREDENTIAL ROSTER (Shown on users and overview) */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800 uppercase block text-sm">System Users & Security Credentials</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Master password and username inspector. Passwords and usernames are unmasked for administrator auditing.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showCredentials
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Toggle password visibility"
              >
                {showCredentials ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                <span>{showCredentials ? 'Mask Passwords' : 'Show All Passwords'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New Account</span>
              </button>
            </div>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name, username, email, or role..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-[11px]">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="ALL">All Roles ({systemUsers.length})</option>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
                <option value="Nurse">Nurse</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-purple-700">Login Username</th>
                  <th className="px-4 py-3 text-amber-700">Password</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {u.mrn ? `Patient MRN: ${u.mrn}` : (u.department || 'Clinical Operations')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          u.role === 'Doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          u.role === 'Patient' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                          u.role === 'Nurse' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <code className="bg-purple-50 text-purple-950 border border-purple-200 px-2.5 py-1 rounded-md font-mono font-bold text-xs select-all">
                            {u.username}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.username, `user-${u.id}`)}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded transition"
                            title="Copy username"
                          >
                            {copiedId === `user-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <code className="bg-amber-50 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-md font-mono font-bold text-xs select-all">
                            {showCredentials ? (u.password || 'password123') : '••••••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.password || 'password123', `pass-${u.id}`)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded transition"
                            title="Copy password"
                          >
                            {copiedId === `pass-${u.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
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
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-[11px] font-semibold border border-red-200"
                              title="Remove user account"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No user accounts found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: MASTER PATIENT INDEX (MPI) TAB */}
      {activeTab === 'patients' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 uppercase block text-sm">Master Patient Index (MPI) Registry</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Hospital patient identity directory. Total {patients.length} active registered patients. You can delete or manage patients directly below.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                {patients.length} Active Records
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search by patient name, MRN, phone, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Patients Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">MRN</th>
                  <th className="px-4 py-3">Patient Full Name</th>
                  <th className="px-4 py-3">Demographics</th>
                  <th className="px-4 py-3">Allergies</th>
                  <th className="px-4 py-3 text-purple-700">Portal Account</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const linkedUser = systemUsers.find(u => 
                      u.patientId === p.id || 
                      u.mrn === p.mrn ||
                      (u.username && p.username && u.username.toLowerCase() === p.username.toLowerCase())
                    );
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">{p.mrn}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{p.fullName || `${p.firstName} ${p.lastName}`}</div>
                          <div className="text-[10px] text-slate-400">DOB: {p.dateOfBirth}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.age}y • {p.gender} • <strong className="text-slate-800">{p.bloodGroup || 'O+'}</strong>
                        </td>
                        <td className="px-4 py-3">
                          {p.allergies && !p.allergies.includes('NKDA') ? (
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              ⚠️ {p.allergies}
                            </span>
                          ) : (
                            <span className="text-slate-400">NKDA</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {linkedUser ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-400 text-[10px]">User:</span>
                                <code className="bg-purple-50 text-purple-900 border border-purple-200 px-1.5 py-0.2 rounded font-mono font-bold text-[11px]">
                                  {linkedUser.username}
                                </code>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-400 text-[10px]">Pass:</span>
                                <code className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-mono font-bold text-[11px]">
                                  {linkedUser.password || 'password123'}
                                </code>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No portal account</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <div>{p.phone || p.contactPhone}</div>
                          <div className="text-[10px] text-slate-400">{p.email}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setPatientToDelete(p)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition text-xs font-semibold border border-red-200 shadow-xs"
                            title="Delete this patient record permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Patient</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: HIPAA AUDIT LOG TAB */}
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
                <option value="PATIENT_DELETED">Patient Deleted</option>
                <option value="USER_REMOVED">User Removed</option>
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
                {userToDelete.role === 'Patient' && ' Since this is a patient, this will also remove their entry from the Master Patient Index.'}
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

      {/* MODAL: CONFIRM PATIENT REMOVAL */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <UserX className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-sm text-slate-900">Permanently Remove Patient Record</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-800">{patientToDelete.fullName}</strong>?
                This will delete their record from the Master Patient Index, cancel all appointments, and delete their portal user account.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">MRN:</span>
                <span className="font-mono font-bold text-blue-600">{patientToDelete.mrn}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Demographics:</span>
                <span className="text-slate-700">{patientToDelete.age}y • {patientToDelete.gender}</span>
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
                onClick={() => {
                  removePatient(patientToDelete.id);
                  setPatientToDelete(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition"
              >
                Confirm Delete Patient
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
    </div>
  );
};
