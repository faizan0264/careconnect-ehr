import React, { useState, useEffect } from 'react';
import { useEhr } from '../context/EhrContext';
import { KeyRound, User, Mail, Shield, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { currentUser, updateAccountCredentials } = useEhr();

  const [username, setUsername] = useState(currentUser.username || '');
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setUsername(currentUser.username || '');
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Username cannot be empty.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }

    // If attempting to change password
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMessage('Please enter your current password to authorize security updates.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        return;
      }
    }

    updateAccountCredentials({
      newUsername: username.trim(),
      newPassword: newPassword ? newPassword.trim() : null,
      newFullName: fullName.trim(),
      newEmail: email.trim(),
      currentPassword: currentPassword ? currentPassword.trim() : null,
    });

    onClose();
  };

  const roleBadgeStyle = 
    currentUser.role === 'ROLE_DOCTOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
    currentUser.role === 'ROLE_PATIENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account Settings & Security</h2>
              <p className="text-[11px] text-slate-500">Update your username, email, and password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Current Role Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 font-semibold">Active Role Profile:</span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}>
              {currentUser.roleLabel || currentUser.role}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Username & Profile Details */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              1. Profile Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="w-full pl-8 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Full Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Smith or John Doe"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Hospital / Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@careconnect.org"
                  className="w-full pl-8 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Password Security */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                2. Change Password (Optional)
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center space-x-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Current Password <span className="text-slate-400">(Required if setting new password)</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
