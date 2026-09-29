import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';

const EhrContext = createContext(null);

export const useEhr = () => {
  const context = useContext(EhrContext);
  if (!context) {
    throw new Error('useEhr must be used within an EhrProvider');
  }
  return context;
};

// Storage keys for persistent state across browser refreshes
const STORAGE_KEY_AUTH = 'careconnect_auth_session';
const STORAGE_KEY_USERS = 'careconnect_users_data';
const STORAGE_KEY_PATIENTS = 'careconnect_patients_data';
const STORAGE_KEY_APPOINTMENTS = 'careconnect_appointments_data';
const STORAGE_KEY_AUDIT = 'careconnect_audit_logs';
const STORAGE_KEY_REPORTS = 'careconnect_reports_data';

const loadStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

export const EhrProvider = ({ children }) => {
  // Three Core Default Personas
  const defaultPersonas = {
    ROLE_DOCTOR: {
      id: 101,
      role: 'ROLE_DOCTOR',
      roleLabel: 'Doctor / Physician',
      username: 'dr_smith',
      fullName: 'Dr. Sarah Smith, MD',
      email: 'dr.smith@careconnect.org',
      department: 'Internal Medicine & Pulmonology',
    },
    ROLE_PATIENT: {
      id: 102,
      role: 'ROLE_PATIENT',
      roleLabel: 'Patient',
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      patientId: 1,
      mrn: 'MRN-2026-0042',
    },
    ROLE_ADMIN: {
      id: 103,
      role: 'ROLE_ADMIN',
      roleLabel: 'System Administrator',
      username: 'admin_alex',
      fullName: 'Alex Morgan',
      email: 'alex.admin@careconnect.org',
      department: 'Health Informatics & Compliance',
    }
  };

  const [personas, setPersonas] = useState(defaultPersonas);

  // Initial Seed System Users
  const initialSystemUsers = [
    { id: 101, name: 'Dr. Sarah Smith, MD', username: 'dr_smith', password: 'password123', email: 'dr.smith@careconnect.org', role: 'Doctor', department: 'Internal Medicine & Pulmonology', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 102, name: 'Nurse Emma Watson, RN', username: 'nurse_emma', password: 'password123', email: 'nurse.emma@careconnect.org', role: 'Nurse', department: 'Outpatient Triage', status: 'Active', lastLogin: 'Today, 08:15 AM' },
    { id: 103, name: 'Alex Morgan', username: 'admin_alex', password: 'password123', email: 'alex.admin@careconnect.org', role: 'Administrator', department: 'Health Informatics & Compliance', status: 'Active', lastLogin: 'Today, 09:00 AM' },
    { id: 104, name: 'John Doe', username: 'john_doe', password: 'password123', email: 'john.doe@gmail.com', role: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Yesterday, 04:20 PM' },
    { id: 105, name: 'Maria Gonzalez', username: 'maria_g', password: 'password123', email: 'maria.g@gmail.com', role: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 26, 2026' },
    { id: 106, name: 'System Administrator', username: 'admin', password: 'Admin#2026', email: 'admin@careconnect.org', role: 'Administrator', department: 'Hospital Administration', status: 'Active', lastLogin: 'Today, 09:00 AM' },
    { id: 107, name: 'Dr. Rajesh Sharma, MD', username: 'dr.sharma', password: 'Doctor#2026', email: 'dr.sharma@careconnect.org', role: 'Doctor', department: 'Cardiovascular Medicine', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 108, name: 'John Doe', username: 'patient1', password: 'Patient#2026', email: 'patient1@careconnect.org', role: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Yesterday, 04:20 PM' },
  ];

  // Initial Seed Patients Data
  const initialPatients = [
    {
      id: 1,
      mrn: 'MRN-2026-0042',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-04-12',
      age: 41,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 234-5678',
      allergies: 'Penicillin, NSAIDs (Aspirin/Ibuprofen)',
      emergencyContact: 'Jane Doe (Wife) - +1 (555) 234-5679',
      room: 'Exam Room 3',
      status: 'In Consultation',
    },
    {
      id: 2,
      mrn: 'MRN-2026-0089',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      dateOfBirth: '1968-11-23',
      age: 57,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 876-5432',
      allergies: 'Sulfa Antibiotics',
      emergencyContact: 'Carlos (Son) - +1 (555) 876-5430',
      room: 'Waiting Room',
      status: 'Scheduled',
    },
    {
      id: 3,
      mrn: 'MRN-2026-0104',
      firstName: 'Robert',
      lastName: 'Chen',
      dateOfBirth: '1995-07-08',
      age: 31,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 456-7890',
      allergies: 'None (NKDA)',
      emergencyContact: 'Lin Chen - +1 (555) 456-7891',
      room: 'Completed',
      status: 'Discharged',
    }
  ];

  // Initial Appointments
  const initialAppointments = [
    {
      id: 701,
      patientId: 1,
      patientName: 'John Doe',
      mrn: 'MRN-2026-0042',
      doctorId: 101,
      doctorName: 'Dr. Sarah Smith, MD',
      department: 'Internal Medicine & Pulmonology',
      date: '2026-10-14',
      timeSlot: '10:30 AM',
      reason: 'Follow-up: Blood Pressure & Bronchitis',
      status: 'Confirmed',
      room: 'Exam Room 3',
    },
    {
      id: 702,
      patientId: 2,
      patientName: 'Maria Gonzalez',
      mrn: 'MRN-2026-0089',
      doctorId: 101,
      doctorName: 'Dr. Sarah Smith, MD',
      department: 'Internal Medicine & Pulmonology',
      date: '2026-09-29',
      timeSlot: '02:00 PM',
      reason: 'Asthma inhaler refill evaluation',
      status: 'Confirmed',
      room: 'Exam Room 3',
    }
  ];

  // Initial Audit Logs
  const initialAuditLogs = [
    { id: 901, time: '09:50 AM', user: 'Dr. Sarah Smith', action: 'CREATE_ORDER', details: 'Ordered STAT Chest X-Ray for John Doe (MRN-2026-0042)' },
    { id: 902, time: '09:45 AM', user: 'Dr. Sarah Smith', action: 'CREATE_ORDER', details: 'Ordered STAT CBC for John Doe (MRN-2026-0042)' },
    { id: 903, time: '09:35 AM', user: 'Dr. Sarah Smith', action: 'VIEW_RECORD', details: 'Opened patient chart for John Doe' },
    { id: 904, time: '09:00 AM', user: 'Alex Morgan', action: 'ADMIN_LOGIN', details: 'Security login from IP 192.168.1.45' },
    { id: 905, time: '08:15 AM', user: 'Nurse Emma Watson', action: 'RECORD_VITALS', details: 'Recorded check-in vitals for Exam Room 3' },
  ];

  // Initial Medical Reports (Vault)
  const initialReports = [
    {
      id: 1,
      patientId: 1,
      patientName: 'John Doe',
      title: 'STAT Chest X-Ray PA & Lateral View',
      reportType: 'RADIOLOGY',
      fileName: 'Chest_XRay_PA_Lateral_2026.pdf',
      fileType: 'application/pdf',
      fileSize: '2.4 MB',
      fileData: null,
      notes: 'Impression: Mild peribronchial thickening consistent with acute bronchitis. Heart size normal. No acute focal consolidation.',
      uploadedBy: 'Dr. Sarah Smith, MD',
      uploaderRole: 'ROLE_DOCTOR',
      reportDate: '2026-09-29',
      uploadedAt: 'Today, 09:55 AM'
    },
    {
      id: 2,
      patientId: 1,
      patientName: 'John Doe',
      title: 'Comprehensive Metabolic Panel & CBC',
      reportType: 'LABORATORY',
      fileName: 'Lab_Results_CBC_CMP_Sept2026.pdf',
      fileType: 'application/pdf',
      fileSize: '1.1 MB',
      fileData: null,
      notes: 'WBC 11.2 (mild reactive leukocytosis). Hemoglobin 14.8 g/dL. Electrolytes and kidney function within normal reference limits.',
      uploadedBy: 'Dr. Rajesh Sharma, MD',
      uploaderRole: 'ROLE_DOCTOR',
      reportDate: '2026-09-28',
      uploadedAt: 'Sep 28, 2026'
    },
    {
      id: 3,
      patientId: 1,
      patientName: 'John Doe',
      title: 'Prior Outpatient Cardiology Evaluation',
      reportType: 'OTHER',
      fileName: 'Previous_Cardiology_Summary.pdf',
      fileType: 'application/pdf',
      fileSize: '850 KB',
      fileData: null,
      notes: 'Patient-uploaded historical consultation from St. Jude Memorial Hospital (2025). Echocardiogram showed EF 60%.',
      uploadedBy: 'John Doe (Patient)',
      uploaderRole: 'ROLE_PATIENT',
      reportDate: '2026-09-15',
      uploadedAt: 'Sep 15, 2026'
    }
  ];

  // Persistent Auth & Navigation state
  const savedAuth = loadStorage(STORAGE_KEY_AUTH, null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(savedAuth && savedAuth.isAuthenticated));
  const [currentUser, setCurrentUser] = useState(() => (savedAuth && savedAuth.currentUser) || defaultPersonas.ROLE_DOCTOR);
  const [activeTab, setActiveTab] = useState(() => (savedAuth && savedAuth.activeTab) || 'overview');

  // Persistent Collections
  const [systemUsers, setSystemUsers] = useState(() => loadStorage(STORAGE_KEY_USERS, initialSystemUsers));
  const [patients, setPatients] = useState(() => loadStorage(STORAGE_KEY_PATIENTS, initialPatients));
  const [appointments, setAppointments] = useState(() => loadStorage(STORAGE_KEY_APPOINTMENTS, initialAppointments));
  const [auditLogs, setAuditLogs] = useState(() => loadStorage(STORAGE_KEY_AUDIT, initialAuditLogs));
  const [reports, setReports] = useState(() => loadStorage(STORAGE_KEY_REPORTS, initialReports));

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveStorage(STORAGE_KEY_AUTH, { isAuthenticated, currentUser, activeTab });
  }, [isAuthenticated, currentUser, activeTab]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_USERS, systemUsers);
  }, [systemUsers]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_PATIENTS, patients);
  }, [patients]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_APPOINTMENTS, appointments);
  }, [appointments]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_AUDIT, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_REPORTS, reports);
  }, [reports]);

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState(1);
  const selectedPatient = useMemo(
    () => patients.find(p => p.id === selectedPatientId) || patients[0] || initialPatients[0],
    [patients, selectedPatientId]
  );

  // Encounter & SOAP Notes (for John Doe)
  const [encounter, setEncounter] = useState({
    id: 1001,
    patientId: 1,
    date: 'Sep 29, 2026 • 10:00 AM',
    doctor: 'Dr. Sarah Smith, MD',
    status: 'In Progress',
    chiefComplaint: 'Chest tightness and productive morning cough for 4 days.',
    vitals: {
      bpSystolic: 142,
      bpDiastolic: 92,
      heartRate: 86,
      temp: 99.1,
      spo2: 95,
      respRate: 18,
    },
    soap: {
      subjective: 'Patient reports persistent cough with yellowish sputum and mild chest tightness when walking briskly. Denies fever or chills.',
      objective: 'Lungs: Scattered mild expiratory wheezes at right base. Heart: Regular rhythm, S1/S2 present. BP elevated at 142/92.',
      assessment: '1. Acute Bronchitis (J20.9)\n2. Stage 2 Essential Hypertension (I10)',
      plan: '1. Order STAT Chest X-Ray and CBC.\n2. Prescribe Albuterol Inhaler (2 puffs q4-6h PRN).\n3. Prescribe Lisinopril 10mg daily for BP.\n4. Contraindication: Avoid Penicillin/Amoxicillin due to documented allergy.',
    },
    isSigned: false,
    signedAt: null,
  });

  // Diagnostic Orders
  const [orders, setOrders] = useState([
    {
      id: 301,
      patientId: 1,
      name: 'Complete Blood Count (CBC)',
      type: 'Laboratory',
      priority: 'STAT',
      status: 'Pending',
      orderedAt: '09:45 AM',
      result: null,
    },
    {
      id: 302,
      patientId: 1,
      name: 'Chest X-Ray (PA & Lateral)',
      type: 'Radiology',
      priority: 'Urgent',
      status: 'Completed',
      orderedAt: '09:50 AM',
      result: 'Normal heart size. Mild peribronchial thickening consistent with bronchitis. No pneumonia or pneumothorax.',
    }
  ]);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 501,
      patientId: 1,
      name: 'Albuterol Sulfate Inhaler',
      dosage: '90 mcg',
      frequency: '2 puffs every 4-6 hours as needed',
      duration: '14 days',
      status: 'Active',
      override: null,
    },
    {
      id: 502,
      patientId: 1,
      name: 'Lisinopril Oral Tablet',
      dosage: '10 mg',
      frequency: 'Once daily in the morning',
      duration: '30 days',
      status: 'Active',
      override: null,
    }
  ]);

  // Clinical Doctors List
  const [doctorsList, setDoctorsList] = useState([
    { id: 101, name: 'Dr. Sarah Smith, MD', specialty: 'Internal Medicine & Pulmonology', room: 'Exam Room 3' },
    { id: 102, name: 'Dr. Michael Chang, MD', specialty: 'Cardiology & Preventive Medicine', room: 'Clinic Suite B' },
    { id: 103, name: 'Dr. Emily Davis, MD', specialty: 'Family & General Practice', room: 'Exam Room 1' },
    { id: 107, name: 'Dr. Rajesh Sharma, MD', specialty: 'Cardiovascular Medicine', room: 'Clinic Suite C' },
  ]);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth: Strict Login (No ghost users, strictly verified credentials)
  const login = async (roleKey, customCredentials = null) => {
    if (!customCredentials || !customCredentials.username || !customCredentials.username.trim()) {
      showToast('Username is required to sign in.', 'error');
      return { success: false, message: 'Please enter your username.' };
    }

    if (!customCredentials.password || !customCredentials.password.trim()) {
      showToast('Password is required to sign in.', 'error');
      return { success: false, message: 'Please enter your password.' };
    }

    const enteredUser = customCredentials.username.trim().toLowerCase();
    const enteredPass = customCredentials.password.trim();
    let user = null;

    // 1. Attempt Spring Boot backend REST API authentication
    try {
      const beAuth = await api.login(customCredentials.username.trim(), enteredPass);
      if (beAuth) {
        if (beAuth.success) {
          const roleNormalized = beAuth.role || roleKey;
          
          // Role matching check
          if (roleKey === 'ROLE_PATIENT' && roleNormalized !== 'ROLE_PATIENT') {
            showToast('Access Denied: This account is registered as Hospital Staff, not a Patient.', 'error');
            return { success: false, message: 'Access denied: Please select the Doctor or Admin role tab.' };
          }
          if (roleKey === 'ROLE_DOCTOR' && roleNormalized !== 'ROLE_DOCTOR') {
            showToast('Access Denied: This account is not authorized as a Physician.', 'error');
            return { success: false, message: 'Access denied: Healthcare provider authorization required.' };
          }
          if (roleKey === 'ROLE_ADMIN' && roleNormalized !== 'ROLE_ADMIN') {
            showToast('Access Denied: Administrator security clearance required.', 'error');
            return { success: false, message: 'Access denied: Administrator clearance required.' };
          }

          user = {
            id: beAuth.userId || 101,
            role: roleNormalized,
            roleLabel: roleNormalized === 'ROLE_PATIENT' ? 'Patient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Doctor / Physician' : 'System Administrator'),
            username: beAuth.username,
            fullName: beAuth.fullName || beAuth.username,
            email: `${beAuth.username}@careconnect.org`,
            department: roleNormalized === 'ROLE_PATIENT' ? 'Outpatient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Clinical Care' : 'Hospital Administration'),
            token: beAuth.token,
          };
        } else {
          // Backend explicitly rejected credentials! Stop here!
          showToast(beAuth.message || 'Invalid username or password.', 'error');
          return { success: false, message: beAuth.message || 'Invalid username or password. Please verify your credentials or register.' };
        }
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, checking local registered directory:', err);
    }

    // 2. If backend was unreachable via network, check locally registered persistent systemUsers
    if (!user) {
      const found = systemUsers.find(u => 
        (u.username && u.username.toLowerCase() === enteredUser) ||
        (u.email && u.email.toLowerCase() === enteredUser)
      );

      if (!found) {
        // Account does NOT exist! Never auto-create!
        const msg = roleKey === 'ROLE_PATIENT' 
          ? `Account '${customCredentials.username}' not found. Please click 'Patient Sign Up' to register.` 
          : `Account '${customCredentials.username}' not found. Healthcare providers must be provisioned by Hospital Administration.`;
        showToast(msg, 'error');
        return { success: false, message: msg };
      }

      // Verify password strictly against stored user password
      if (!found.password || found.password !== enteredPass) {
        showToast('Incorrect password. Access denied.', 'error');
        return { success: false, message: 'Incorrect password. Access denied.' };
      }

      // Check role authorization
      const isDoc = found.role === 'Doctor' || found.role === 'ROLE_DOCTOR';
      const isPat = found.role === 'Patient' || found.role === 'ROLE_PATIENT';
      const isAdmin = found.role === 'Administrator' || found.role === 'ROLE_ADMIN';

      if (roleKey === 'ROLE_PATIENT' && !isPat) {
        showToast('Access Denied: This account is registered as Hospital Staff, not a Patient.', 'error');
        return { success: false, message: 'Access denied: Please switch to the Doctor or Admin tab.' };
      }
      if (roleKey === 'ROLE_DOCTOR' && !isDoc) {
        showToast('Access Denied: This account is not registered as a Physician.', 'error');
        return { success: false, message: 'Access denied: Physician credentials required.' };
      }
      if (roleKey === 'ROLE_ADMIN' && !isAdmin) {
        showToast('Access Denied: Administrator privileges required.', 'error');
        return { success: false, message: 'Access denied: Administrator clearance required.' };
      }

      user = {
        id: found.id,
        role: isDoc ? 'ROLE_DOCTOR' : (isPat ? 'ROLE_PATIENT' : 'ROLE_ADMIN'),
        roleLabel: isDoc ? 'Doctor / Physician' : (isPat ? 'Patient' : 'System Administrator'),
        username: found.username || found.email.split('@')[0],
        fullName: found.name || found.fullName,
        email: found.email,
        department: found.department || (isDoc ? 'Internal Medicine' : 'General Care'),
        patientId: found.patientId,
        mrn: found.mrn,
      };
    }

    if (!user) {
      showToast('Authentication failed. Please verify your credentials or register an account.', 'error');
      return { success: false, message: 'Authentication failed.' };
    }

    // Success: log in user
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('overview');
    showToast(`Signed in successfully as ${user.fullName}`, 'success');
    return { success: true, user };
  };

  // Auth: Patient Self-Registration
  const signup = async (formData) => {
    const cleanUsername = (formData.username && formData.username.trim()) || formData.email.split('@')[0];
    const cleanEmail = formData.email.trim();
    const cleanName = formData.fullName.trim();
    const cleanPassword = formData.password ? formData.password.trim() : 'Patient#2026';

    const suffix = Math.floor(1000 + Math.random() * 9000);
    const newUserId = Date.now();
    const newPatientId = patients.length + 1;
    const mrn = `MRN-2026-${suffix}`;

    const newPatient = {
      id: newPatientId,
      mrn: mrn,
      firstName: cleanName.split(' ')[0] || cleanName,
      lastName: cleanName.split(' ').slice(1).join(' ') || 'Patient',
      fullName: cleanName,
      dateOfBirth: formData.dateOfBirth || '1995-01-01',
      age: Number(formData.age) || 30,
      gender: formData.gender || 'Female',
      bloodGroup: formData.bloodGroup || 'O+',
      phone: formData.phone || '+1 (555) 000-0000',
      allergies: formData.allergies || 'None (NKDA)',
      emergencyContact: formData.emergencyContact || 'Family Emergency Contact',
      room: 'Outpatient Reception',
      status: 'Active',
    };

    const newUser = {
      id: newUserId,
      role: 'ROLE_PATIENT',
      roleLabel: 'Patient',
      username: cleanUsername,
      password: cleanPassword,
      fullName: cleanName,
      email: cleanEmail,
      phone: formData.phone || '+1 (555) 000-0000',
      department: 'Outpatient Portal',
      patientId: newPatientId,
      mrn: mrn,
    };

    // 1. Update React state and local persistence
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newPatientId);

    setSystemUsers(prev => [
      ...prev.filter(u => u.username?.toLowerCase() !== cleanUsername.toLowerCase() && u.email?.toLowerCase() !== cleanEmail.toLowerCase()),
      {
        id: newUserId,
        name: cleanName,
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        phone: formData.phone || '+1 (555) 000-0000',
        role: 'Patient',
        department: 'Outpatient Portal',
        status: 'Active',
        lastLogin: 'Just now',
        patientId: newPatientId,
        mrn: mrn,
      }
    ]);

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: cleanName,
      action: 'USER_REGISTRATION',
      details: `New Patient self-registered account: ${cleanName} (Username: ${cleanUsername}, MRN: ${mrn})`
    }, ...prev]);

    // 2. Transmit to Spring Boot REST API
    try {
      await api.registerPatientAccount({
        fullName: cleanName,
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        phone: formData.phone || '+1 (555) 000-0000',
      });
    } catch (err) {
      console.warn('Backend patient registration offline, registered in browser session.');
    }

    // 3. Establish active session
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveTab('overview');
    showToast(`Patient account created! Welcome to CareConnect, ${cleanName}.`, 'success');
    return { success: true, user: newUser };
  };

  // Auth: Logout
  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {}
    showToast('Signed out successfully.', 'info');
  };

  // Credentials Update: Change Username, Password, Name, Email
  const updateAccountCredentials = async ({ newUsername, newPassword, newFullName, newEmail, currentPassword }) => {
    const updatedName = (newFullName && newFullName.trim()) || currentUser.fullName;
    const updatedUsername = (newUsername && newUsername.trim()) || currentUser.username;
    const updatedEmail = (newEmail && newEmail.trim()) || currentUser.email;

    const oldUsername = currentUser.username;

    // 1. Update active user in state
    const updatedUser = {
      ...currentUser,
      username: updatedUsername,
      fullName: updatedName,
      email: updatedEmail,
    };
    setCurrentUser(updatedUser);

    // 2. Update in systemUsers directory (persisting the new username AND new password)
    setSystemUsers(prev => prev.map(u => {
      const isMatch = (u.id && u.id === currentUser.id) ||
                      (u.username && u.username.toLowerCase() === oldUsername.toLowerCase()) ||
                      (u.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (isMatch) {
        return {
          ...u,
          name: updatedName,
          fullName: updatedName,
          username: updatedUsername,
          email: updatedEmail,
          password: newPassword ? newPassword.trim() : u.password,
        };
      }
      return u;
    }));

    // 3. Update personas cache
    setPersonas(prev => {
      const role = currentUser.role;
      if (prev[role]) {
        return {
          ...prev,
          [role]: {
            ...prev[role],
            username: updatedUsername,
            fullName: updatedName,
            email: updatedEmail,
          }
        };
      }
      return prev;
    });

    // 4. Send to Backend REST API so Spring Boot & H2 DB persist changes
    try {
      await api.updateProfile({
        userId: currentUser.id,
        currentUsername: oldUsername,
        newUsername: updatedUsername,
        currentPassword: currentPassword || 'password123',
        newPassword: newPassword ? newPassword.trim() : null,
        fullName: updatedName,
        email: updatedEmail,
      });
    } catch (err) {
      console.warn('Backend profile update failed, updated in browser session.');
    }

    // 5. Log HIPAA audit trail
    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: updatedName,
      action: 'CREDENTIALS_UPDATED',
      details: `Account credentials updated for ${updatedUsername} (Password modified: ${Boolean(newPassword)})`
    }, ...prev]);

    showToast('Your username and password have been successfully updated!', 'success');
    return { success: true };
  };

  // Doctor actions
  const updateVitals = (newVitals) => {
    setEncounter(prev => ({ ...prev, vitals: { ...newVitals } }));
    showToast('Vitals saved successfully.', 'success');
  };

  const updateSoap = (newSoap) => {
    setEncounter(prev => ({ ...prev, soap: { ...newSoap } }));
    showToast('Clinical notes updated.', 'info');
  };

  const signEncounter = () => {
    setEncounter(prev => ({
      ...prev,
      status: 'Completed',
      isSigned: true,
      signedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    showToast('Encounter officially signed and closed.', 'success');
  };

  const addOrder = (order) => {
    const newOrd = {
      ...order,
      id: orders.length + 301,
      patientId: selectedPatient.id,
      status: 'Pending',
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      result: null,
    };
    setOrders([newOrd, ...orders]);
    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: newOrd.orderedAt,
      user: currentUser.fullName,
      action: 'CREATE_ORDER',
      details: `Ordered ${newOrd.name} (${newOrd.priority}) for ${selectedPatient.firstName} ${selectedPatient.lastName}`
    }, ...prev]);
    showToast(`Order placed: ${newOrd.name} (${newOrd.priority})`, 'success');
  };

  const completeOrderResult = (orderId, resultText) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Completed', result: resultText } : o));
    showToast('Diagnostic test result documented.', 'success');
  };

  const addPrescription = (prescription, overrideReason = null) => {
    const newRx = {
      ...prescription,
      id: prescriptions.length + 501,
      patientId: selectedPatient.id,
      status: 'Active',
      override: overrideReason,
    };
    setPrescriptions([newRx, ...prescriptions]);
    showToast(`Prescription saved: ${newRx.name}`, overrideReason ? 'warning' : 'success');
  };

  const discontinueRx = (id) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: 'Discontinued' } : p));
    showToast('Prescription marked as discontinued.', 'info');
  };

  const registerPatient = (patientData) => {
    const newId = patients.length + 1;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const newPatient = {
      ...patientData,
      id: newId,
      mrn: `MRN-2026-${suffix}`,
      status: 'Admitted',
    };
    setPatients([newPatient, ...patients]);
    setSelectedPatientId(newId);
    showToast(`Patient registered with ${newPatient.mrn}`, 'success');
  };

  const addSystemUser = async (userData) => {
    const newId = systemUsers.length + 101;
    const username = userData.username?.trim() || (userData.email ? userData.email.split('@')[0] : `user_${newId}`);
    const department = userData.department || userData.specialty || (userData.role === 'Doctor' ? 'Internal Medicine' : 'Hospital Operations');
    const password = userData.password ? userData.password.trim() : 'Doctor#2026';
    
    const newUser = {
      ...userData,
      id: newId,
      username: username,
      password: password,
      department: department,
      status: 'Active',
      lastLogin: 'Pending First Login',
    };
    setSystemUsers(prev => [...prev, newUser]);

    // If new user is a Doctor, dynamically add to the clinic doctors list for appointments
    if (userData.role === 'Doctor') {
      const suiteLetter = String.fromCharCode(65 + (doctorsList.length % 26));
      setDoctorsList(prev => [
        ...prev,
        {
          id: newId,
          name: userData.name,
          specialty: department,
          room: `Clinic Suite ${suiteLetter}`,
        }
      ]);
    }

    // Transmit to Backend API
    try {
      await api.provisionStaff({
        fullName: userData.name,
        username: username,
        password: password,
        email: userData.email,
        phone: userData.phone || '+1 (555) 100-0100',
        department: department,
        role: userData.role === 'Doctor' ? 'ROLE_DOCTOR' : (userData.role === 'Administrator' ? 'ROLE_ADMIN' : 'ROLE_NURSE')
      });
    } catch (err) {}

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'USER_PROVISIONED',
      details: `Admin provisioned ${userData.role} account: ${newUser.name} (Username: ${username}, Dept: ${department})`
    }, ...prev]);
    showToast(`${userData.role} ${newUser.name} provisioned! Login username: ${username}`, 'success');
  };

  const removeSystemUser = async (userId) => {
    const target = systemUsers.find(u => u.id === userId);
    setSystemUsers(prev => prev.filter(u => u.id !== userId));

    try {
      await api.deleteUser(userId);
    } catch (err) {}

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'USER_REMOVED',
      details: `Removed user account: ${target ? target.name : `User ID #${userId}`} (${target ? target.role : 'Staff'})`
    }, ...prev]);

    showToast(`User ${target ? target.name : 'account'} has been removed from system.`, 'info');
  };

  const bookAppointment = async (appointmentData) => {
    // 1. Schedule collision detection check (Double-booking prevention)
    const conflict = appointments.find(a => 
      Number(a.doctorId) === Number(appointmentData.doctorId) &&
      a.date === appointmentData.date &&
      a.timeSlot.trim().toLowerCase() === appointmentData.timeSlot.trim().toLowerCase() &&
      a.status !== 'Cancelled'
    );

    if (conflict) {
      const errorMsg = `Schedule Conflict: ${appointmentData.doctorName} is already busy on ${appointmentData.date} at ${appointmentData.timeSlot}. Please try another time slot or date.`;
      
      setAuditLogs(prev => [{
        id: prev.length + 901,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: currentUser.fullName,
        action: 'SCHEDULE_COLLISION_BLOCKED',
        details: `Booking rejected: ${appointmentData.doctorName} already has confirmed appointment on ${appointmentData.date} at ${appointmentData.timeSlot}`
      }, ...prev]);

      showToast(errorMsg, 'error');
      return { success: false, message: errorMsg };
    }

    const newId = appointments.length + 701;
    const newAppt = {
      ...appointmentData,
      id: newId,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      mrn: selectedPatient.mrn,
      status: 'Confirmed',
      room: appointmentData.room || 'Exam Room 3',
    };
    setAppointments([newAppt, ...appointments]);

    // Transmit to Backend API
    try {
      await api.bookAppointment({
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        doctorId: appointmentData.doctorId,
        doctorName: appointmentData.doctorName,
        department: appointmentData.department,
        appointmentDate: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        reason: appointmentData.reason
      });
    } catch (err) {}

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'APPOINTMENT_SCHEDULED',
      details: `Booked appointment with ${newAppt.doctorName} on ${newAppt.date} at ${newAppt.timeSlot} for ${selectedPatient.firstName} ${selectedPatient.lastName}`
    }, ...prev]);
    showToast(`Appointment confirmed with ${newAppt.doctorName} for ${newAppt.date} at ${newAppt.timeSlot}.`, 'success');
    return { success: true, appointment: newAppt };
  };

  const cancelAppointment = async (appointmentId) => {
    setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status: 'Cancelled' } : a));
    try {
      await api.cancelAppointment(appointmentId);
    } catch (err) {}
    showToast('Appointment cancelled.', 'info');
  };

  // Medical Reports & Document Vault
  const uploadReport = async (reportData) => {
    const newId = Date.now();
    const newReport = {
      ...reportData,
      id: newId,
      patientId: reportData.patientId || selectedPatient.id,
      patientName: reportData.patientName || `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      uploadedBy: currentUser.fullName,
      uploaderRole: currentUser.role,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setReports(prev => [newReport, ...prev]);

    // Send to Backend REST API
    try {
      await api.uploadReport(newReport);
    } catch (err) {
      console.warn('Backend report upload offline, saved locally in browser.');
    }

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: newReport.uploadedAt,
      user: currentUser.fullName,
      action: 'DOCUMENT_UPLOADED',
      details: `${currentUser.roleLabel || currentUser.role} uploaded ${newReport.reportType} report: '${newReport.title}' (${newReport.fileName})`
    }, ...prev]);

    showToast(`Medical report '${newReport.title}' uploaded successfully!`, 'success');
    return { success: true, report: newReport };
  };

  const deleteReport = async (reportId) => {
    const target = reports.find(r => r.id === reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));

    try {
      await api.deleteReport(reportId, currentUser.fullName);
    } catch (err) {}

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'DOCUMENT_DELETED',
      details: `Removed medical document: '${target ? target.title : `Report #${reportId}`}'`
    }, ...prev]);

    showToast('Medical report removed.', 'info');
  };

  return (
    <EhrContext.Provider
      value={{
        personas,
        isAuthenticated,
        currentUser,
        activeTab,
        setActiveTab,
        login,
        signup,
        logout,
        patients,
        selectedPatient,
        setSelectedPatientId,
        registerPatient,
        encounter,
        updateVitals,
        updateSoap,
        signEncounter,
        orders,
        addOrder,
        completeOrderResult,
        prescriptions,
        addPrescription,
        discontinueRx,
        doctorsList,
        appointments,
        bookAppointment,
        cancelAppointment,
        reports,
        uploadReport,
        deleteReport,
        systemUsers,
        addSystemUser,
        removeSystemUser,
        updateAccountCredentials,
        auditLogs,
        toast,
        showToast,
      }}
    >
      {children}
    </EhrContext.Provider>
  );
};
