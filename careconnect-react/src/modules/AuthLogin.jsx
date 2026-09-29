import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  Stethoscope, 
  User, 
  Shield, 
  ArrowRight, 
  Lock, 
  Mail, 
  Phone, 
  Calendar, 
  Heart, 
  AlertTriangle,
  UserPlus,
  LogIn,
  ShieldAlert
} from 'lucide-react';

export const AuthLogin = () => {
  const { login, signup, personas } = useEhr();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  
  // Sign In state - strictly blank by default
  const [selectedRole, setSelectedRole] = useState('ROLE_PATIENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Patient Sign Up state (Public self-registration is strictly for Patients)
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  // Patient medical fields
  const [dob, setDob] = useState('1995-05-15');
  const [age, setAge] = useState(31);
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('None (NKDA)');
  const [emergencyContact, setEmergencyContact] = useState('Family - +1 (555) 999-0000');

  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    const res = await login(selectedRole, { username: username.trim(), password: password.trim() });
    if (res && res.success === false) {
      setErrorMessage(res.message || 'Invalid username or password.');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please fill in your full name, email, and password.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await signup({
      role: 'ROLE_PATIENT',
      fullName: fullName.trim(),
      email: signupEmail.trim(),
      username: (signupUsername && signupUsername.trim()) || signupEmail.split('@')[0],
      phone: signupPhone.trim(),
      password: signupPassword.trim(),
      dateOfBirth: dob,
      age: Number(age) || 30,
      gender,
      bloodGroup,
      allergies: allergies.trim() || 'None (NKDA)',
      emergencyContact: emergencyContact.trim() || 'Family Emergency Contact',
    });

    if (res && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-sm mb-3">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CareConnect EHR</h1>
        <p className="text-xs text-slate-500 mt-1">Patient-Provider Electronic Health Record Portal</p>
      </div>

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200">
          
          {/* Top Auth Mode Tabs: Sign In vs Sign Up */}
          <div className="flex border-b border-slate-200 mb-6 pb-1">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
              className={`flex-1 pb-2.5 text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 border-b-2 ${
                authMode === 'signin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
              className={`flex-1 pb-2.5 text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 border-b-2 ${
                authMode === 'signup'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Patient Sign Up</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: SIGN IN FORM */}
          {/* ================================================================= */}
          {authMode === 'signin' && (
            <div className="space-y-5">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Select Portal Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Doctor Button */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ROLE_DOCTOR')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                      selectedRole === 'ROLE_DOCTOR'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Doctor</span>
                  </button>

                  {/* Patient Button */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ROLE_PATIENT')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                      selectedRole === 'ROLE_PATIENT'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-700 font-semibold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <User className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Patient</span>
                  </button>

                  {/* Admin Button */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ROLE_ADMIN')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                      selectedRole === 'ROLE_ADMIN'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-700 font-semibold ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Admin</span>
                  </button>

                </div>
              </div>

              {/* Role Advisories */}
              {selectedRole === 'ROLE_PATIENT' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Patients sign in with your registered username and password.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                    className="font-bold underline text-emerald-800 hover:text-emerald-950 text-[11px] shrink-0 ml-2"
                  >
                    Sign up &rarr;
                  </button>
                </div>
              )}

              {selectedRole === 'ROLE_DOCTOR' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Attending Physicians must be provisioned and authorized by Hospital Administration.</span>
                </div>
              )}

              {selectedRole === 'ROLE_ADMIN' && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Hospital System Administrators sign in with security clearance credentials.</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {selectedRole === 'ROLE_DOCTOR' ? 'Physician Username / Hospital ID' : (selectedRole === 'ROLE_ADMIN' ? 'Admin Username' : 'Patient Username or Email')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium placeholder:text-slate-400 text-xs"
                      placeholder={selectedRole === 'ROLE_PATIENT' ? 'Enter your registered username or email' : 'Enter username'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium placeholder:text-slate-400 text-xs"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-xs ${
                      selectedRole === 'ROLE_DOCTOR' ? 'bg-blue-600 hover:bg-blue-700' :
                      selectedRole === 'ROLE_PATIENT' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <span>Sign In as {selectedRole === 'ROLE_PATIENT' ? 'Patient' : (selectedRole === 'ROLE_DOCTOR' ? 'Doctor / Physician' : 'Administrator')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Authorized Test Credentials Collapsible */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                  className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition flex items-center justify-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showDemoCredentials ? 'Hide Default Authorized Credentials' : 'View Default Authorized Credentials (Reference)'}</span>
                </button>

                {showDemoCredentials && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-2 text-slate-700 animate-in fade-in duration-150">
                    <p className="font-semibold text-slate-900 text-xs border-b border-slate-200 pb-1">
                      System Pre-Configured Accounts:
                    </p>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-purple-700">Administrator:</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Admin#2026</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedRole('ROLE_ADMIN'); setUsername('admin'); setPassword('Admin#2026'); }}
                        className="text-purple-600 hover:underline font-bold text-[10px] ml-1"
                      >
                        Fill
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-blue-700">Doctor (Cardiologist):</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">dr.sharma</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Doctor#2026</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedRole('ROLE_DOCTOR'); setUsername('dr.sharma'); setPassword('Doctor#2026'); }}
                        className="text-blue-600 hover:underline font-bold text-[10px] ml-1"
                      >
                        Fill
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-blue-700">Doctor (Pulmonologist):</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">dr_smith</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">password123</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedRole('ROLE_DOCTOR'); setUsername('dr_smith'); setPassword('password123'); }}
                        className="text-blue-600 hover:underline font-bold text-[10px] ml-1"
                      >
                        Fill
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <span className="font-bold text-emerald-700">Pre-seeded Patient:</span> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">patient1</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Patient#2026</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedRole('ROLE_PATIENT'); setUsername('patient1'); setPassword('Patient#2026'); }}
                        className="text-emerald-700 hover:underline font-bold text-[10px] ml-1"
                      >
                        Fill
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 italic pt-1">
                      * Or create your own real patient profile with the <strong>Patient Sign Up</strong> tab above.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Switch */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Are you a new patient?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Register a Patient Account
                </button>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: PATIENT SELF-REGISTRATION (Strictly Patients Only)         */}
          {/* ================================================================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
              
              {/* Doctor / Healthcare Provider Advisory Notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-amber-950 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Patient Self-Registration Only</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Self-registration is strictly for <strong>Patients</strong>. Healthcare Providers (Attending Doctors & Clinical Staff) must be provisioned and authorized by <strong>Hospital Administration</strong>.
                </p>
                <div className="pt-1 flex items-center space-x-1 text-[11px] font-semibold text-blue-700">
                  <span>Are you an Attending Doctor?</span>
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('signin'); setSelectedRole('ROLE_DOCTOR'); }}
                    className="underline hover:text-blue-900"
                  >
                    Sign in with your hospital credentials &rarr;
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-slate-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Username / Login ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. jdoe88"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-slate-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Patient-Specific Medical Fields */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px] block">
                  Medical Demographics (For Master Patient Index)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full p-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full p-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Documented Drug Allergies (or None)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa, or None (NKDA)"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full p-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Emergency Contact Information</label>
                  <input
                    type="text"
                    placeholder="e.g. Family - +1 (555) 999-0000"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full p-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Patient Account & Enter Portal</span>
                </button>
              </div>

              {/* Footer Switch */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Already have a registered account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign In here
                </button>
              </div>

            </form>
          )}

          {/* Compliance note */}
          <div className="mt-5 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Protected Health Information (PHI) • HIPAA Security Rule Encrypted
          </div>

        </div>
      </div>

    </div>
  );
};
