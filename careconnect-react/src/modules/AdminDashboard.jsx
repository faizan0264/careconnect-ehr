import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { Shield, Users, FileText, ScrollText, CheckCircle2, Activity, UserPlus, Search, Filter, X, Trash2, AlertTriangle, KeyRound, Eye, EyeOff, Lock, Edit3 } from 'lucide-react';

export const AdminDashboard = () => {
  const { patients, encounter, orders, prescriptions, systemUsers, addSystemUser, removeSystemUser, adminUpdateUser, currentUser, auditLogs, activeTab } = useEhr();

  // Local state for staff modal, delete modal, edit modal, and audit log filter
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showCredentials, setShowCredentials] = useState(true);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    username: '',
    password: 'password123',
    role: 'Doctor',
    department: 'Internal Medicine & Pulmonology',
    licenseNumber: 'MD-748920'
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
            Monitor healthcare metrics, manage user role access, and audit HIPAA Protected Health Information (PHI) events.
          </p>
        </div>
      </div>

      {/* METRICS OVERVIEW */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Patients</span>
              <div className="text-2xl font-black text-blue-600">{patients.length}</div>
              <span className="text-slate-500 text-[11px]">Master Patient Index</span>
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
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-xs block">Staff & User Directory</span>
              <div className="flex items-center space-x-2">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Role</th>
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
                  {systemUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
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
              <p className="text-slate-500 text-[11px] mt-0.5">RBAC Access Provisioning for Doctors, Nurses, and Staff</p>
            </div>
            <div className="flex items-center space-x-2">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  {showCredentials && (
                    <>
                      <th className="px-4 py-3 text-purple-700">Username</th>
                      <th className="px-4 py-3 text-amber-700">Password</th>
                    </>
                  )}
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {systemUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{u.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {u.role}
                      </span>
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
    </div>
  );
};
