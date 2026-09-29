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
const STORAGE_KEY_ENCOUNTERS = 'careconnect_encounters_data';
const STORAGE_KEY_ORDERS = 'careconnect_orders_data';
const STORAGE_KEY_PRESCRIPTIONS = 'careconnect_prescriptions_data';
const STORAGE_KEY_AUDIT = 'careconnect_audit_logs';
const STORAGE_KEY_REPORTS = 'careconnect_reports_data';
const STORAGE_KEY_DELETED_PATIENTS = 'careconnect_deleted_patients';
const STORAGE_KEY_SELECTED_PATIENT = 'careconnect_selected_patient_id';

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

export const calculateAgeFromDob = (dobString, fallback = 30) => {
  if (!dobString && dobString !== 0) return fallback;
  if (typeof dobString === 'number') return dobString;

  const str = String(dobString).trim();
  let birthYear, birthMonth, birthDay;

  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        birthYear = parseInt(parts[0], 10);
        birthMonth = parseInt(parts[1], 10) - 1;
        birthDay = parseInt(parts[2], 10);
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY or MM-DD-YYYY
        birthYear = parseInt(parts[2], 10);
        birthMonth = parseInt(parts[1], 10) - 1;
        birthDay = parseInt(parts[0], 10);
      }
    }
  } else if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // M/D/YYYY or MM/DD/YYYY or DD/MM/YYYY
        birthYear = parseInt(parts[2], 10);
        birthMonth = parseInt(parts[0], 10) - 1;
        birthDay = parseInt(parts[1], 10);
      } else if (parts[0].length === 4) {
        birthYear = parseInt(parts[0], 10);
        birthMonth = parseInt(parts[1], 10) - 1;
        birthDay = parseInt(parts[2], 10);
      }
    }
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  if (birthYear && !isNaN(birthYear) && birthYear > 1900 && birthYear <= currentYear) {
    let age = currentYear - birthYear;
    if (birthMonth !== undefined && !isNaN(birthMonth)) {
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < (birthDay || 1))) {
        age--;
      }
    }
    return Math.max(0, age);
  }

  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return fallback;
  let computedAge = currentYear - birth.getFullYear();
  const m = currentMonth - birth.getMonth();
  if (m < 0 || (m === 0 && currentDay < birth.getDate())) {
    computedAge--;
  }
  return computedAge >= 0 ? computedAge : fallback;
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
    { id: 101, name: 'Dr. Sarah Smith, MD', fullName: 'Dr. Sarah Smith, MD', username: 'dr_smith', password: 'password123', email: 'dr.smith@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Internal Medicine & Pulmonology', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 102, name: 'Nurse Emma Watson, RN', fullName: 'Nurse Emma Watson, RN', username: 'nurse_emma', password: 'password123', email: 'nurse.emma@careconnect.org', role: 'Nurse', roleLabel: 'Registered Nurse', department: 'Outpatient Triage', status: 'Active', lastLogin: 'Today, 08:15 AM' },
    { id: 103, name: 'Alex Morgan', fullName: 'Alex Morgan', username: 'admin_alex', password: 'password123', email: 'alex.admin@careconnect.org', role: 'Administrator', roleLabel: 'System Administrator', department: 'Health Informatics & Compliance', status: 'Active', lastLogin: 'Today, 09:00 AM' },
    { id: 104, name: 'John Doe', fullName: 'John Doe', username: 'john_doe', password: 'password123', email: 'john.doe@gmail.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Yesterday, 04:20 PM', patientId: 1, mrn: 'MRN-2026-0042' },
    { id: 105, name: 'Maria Gonzalez', fullName: 'Maria Gonzalez', username: 'maria_g', password: 'password123', email: 'maria.g@gmail.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 26, 2026', patientId: 2, mrn: 'MRN-2026-0089' },
    { id: 106, name: 'Hospital Administrator', fullName: 'Hospital Administrator', username: 'admin', password: 'Admin#2026', email: 'admin@careconnect.org', role: 'Administrator', roleLabel: 'System Administrator', department: 'Hospital Administration', status: 'Active', lastLogin: 'Today, 09:00 AM' },
    { id: 107, name: 'Dr. Rajesh Sharma, MD', fullName: 'Dr. Rajesh Sharma, MD', username: 'dr.sharma', password: 'Doctor#2026', email: 'dr.sharma@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Cardiovascular Medicine', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 108, name: 'Aisha Patel', fullName: 'Aisha Patel', username: 'patient1', password: 'Patient#2026', email: 'patient1@careconnect.org', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Yesterday, 04:20 PM', patientId: 4, mrn: 'MRN-2026-0077' },
    { id: 109, name: 'Rahul Verma', fullName: 'Rahul Verma', username: 'patient2', password: 'Patient#2026', email: 'rahul.verma@example.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 27, 2026', patientId: 5, mrn: 'MRN-2026-0088' },
    { id: 110, name: 'Robert Chen', fullName: 'Robert Chen', username: 'robert_c', password: 'password123', email: 'robert.chen@gmail.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 25, 2026', patientId: 3, mrn: 'MRN-2026-0104' },
    { id: 111, name: 'Dr. Michael Chang, MD', fullName: 'Dr. Michael Chang, MD', username: 'dr_chang', password: 'password123', email: 'dr.chang@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Cardiology & Preventive Medicine', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 112, name: 'Dr. Emily Davis, MD', fullName: 'Dr. Emily Davis, MD', username: 'dr_emily', password: 'password123', email: 'dr.emily@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Family & General Practice', status: 'Active', lastLogin: 'Today, 09:30 AM' },
  ];

  // Initial Seed Patients Data
  const initialPatients = [
    {
      id: 1,
      mrn: 'MRN-2026-0042',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      username: 'john_doe',
      email: 'john.doe@gmail.com',
      dateOfBirth: '1985-04-12',
      age: 41,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 234-5678',
      contactPhone: '+1 (555) 234-5678',
      allergies: 'Penicillin, NSAIDs (Aspirin/Ibuprofen)',
      emergencyContact: 'Jane Doe (Wife) - +1 (555) 234-5679',
      room: 'Exam Room 3',
      status: 'In Consultation',
      registeredDate: 'Sep 20, 2026',
    },
    {
      id: 2,
      mrn: 'MRN-2026-0089',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      fullName: 'Maria Gonzalez',
      username: 'maria_g',
      email: 'maria.g@gmail.com',
      dateOfBirth: '1968-11-23',
      age: 57,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 876-5432',
      contactPhone: '+1 (555) 876-5432',
      allergies: 'Sulfa Antibiotics',
      emergencyContact: 'Carlos (Son) - +1 (555) 876-5430',
      room: 'Waiting Room',
      status: 'Scheduled',
      registeredDate: 'Sep 22, 2026',
    },
    {
      id: 3,
      mrn: 'MRN-2026-0104',
      firstName: 'Robert',
      lastName: 'Chen',
      fullName: 'Robert Chen',
      username: 'robert_c',
      email: 'robert.chen@gmail.com',
      dateOfBirth: '1995-07-08',
      age: 31,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 456-7890',
      contactPhone: '+1 (555) 456-7890',
      allergies: 'None (NKDA)',
      emergencyContact: 'Lin Chen - +1 (555) 456-7891',
      room: 'Completed',
      status: 'Discharged',
      registeredDate: 'Sep 25, 2026',
    },
    {
      id: 4,
      mrn: 'MRN-2026-0077',
      firstName: 'Aisha',
      lastName: 'Patel',
      fullName: 'Aisha Patel',
      username: 'patient1',
      email: 'patient1@careconnect.org',
      dateOfBirth: '1992-03-15',
      age: 34,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+1 (555) 345-6789',
      contactPhone: '+1 (555) 345-6789',
      allergies: 'None (NKDA)',
      emergencyContact: 'Sanjay Patel (Brother) - +1 (555) 345-6780',
      room: 'Outpatient Suite',
      status: 'Active',
      registeredDate: 'Sep 24, 2026',
    },
    {
      id: 5,
      mrn: 'MRN-2026-0088',
      firstName: 'Rahul',
      lastName: 'Verma',
      fullName: 'Rahul Verma',
      username: 'patient2',
      email: 'rahul.verma@example.com',
      dateOfBirth: '1988-10-30',
      age: 37,
      gender: 'Male',
      bloodGroup: 'AB+',
      phone: '+1 (555) 789-0123',
      contactPhone: '+1 (555) 789-0123',
      allergies: 'Latex',
      emergencyContact: 'Pooja Verma (Spouse) - +1 (555) 789-0120',
      room: 'Outpatient Clinic',
      status: 'Active',
      registeredDate: 'Sep 27, 2026',
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
    },
    {
      id: 703,
      patientId: 4,
      patientName: 'Aisha Patel',
      mrn: 'MRN-2026-0077',
      doctorId: 107,
      doctorName: 'Dr. Rajesh Sharma, MD',
      department: 'Cardiovascular Medicine',
      date: '2026-09-29',
      timeSlot: '03:30 PM',
      reason: 'Cardiovascular risk evaluation and ECG review',
      status: 'Confirmed',
      room: 'Clinic Suite C',
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

  // Persistent Collections (Strictly preserves existing saved user and patient modifications)
  const [systemUsers, setSystemUsers] = useState(() => {
    const saved = loadStorage(STORAGE_KEY_USERS, null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      const missing = initialSystemUsers.filter(iu => 
        !saved.some(su => 
          (su.username && iu.username && su.username.toLowerCase() === iu.username.toLowerCase()) ||
          (su.name && iu.name && su.name.toLowerCase() === iu.name.toLowerCase()) ||
          (su.email && iu.email && su.email.toLowerCase() === iu.email.toLowerCase())
        )
      );
      return missing.length > 0 ? [...saved, ...missing] : saved;
    }
    return initialSystemUsers;
  });

  const [patients, setPatients] = useState(() => {
    const saved = loadStorage(STORAGE_KEY_PATIENTS, null);
    const savedUsers = loadStorage(STORAGE_KEY_USERS, null);
    
    // Pool of all known patients (saved + initial)
    const patientPool = (saved && Array.isArray(saved) && saved.length > 0)
      ? [...saved, ...initialPatients.filter(ip => !saved.some(sp => sp.id === ip.id || sp.mrn === ip.mrn))]
      : initialPatients;
    
    // If systemUsers is saved, synchronize patients directly from the active patient users
    if (savedUsers && Array.isArray(savedUsers)) {
      const activePatientUsers = savedUsers.filter(u => u.role === 'Patient' || u.role === 'ROLE_PATIENT');
      if (activePatientUsers.length > 0) {
        // Unblock active MRNs from deleted storage if they were previously cascaded by accident
        const activeMrnSet = new Set(activePatientUsers.filter(u => u.mrn).map(u => u.mrn.toLowerCase()));
        const deletedMrnsList = loadStorage(STORAGE_KEY_DELETED_PATIENTS, []);
        const cleanedDeleted = deletedMrnsList.filter(m => !activeMrnSet.has(m.toLowerCase()));
        if (cleanedDeleted.length !== deletedMrnsList.length) {
          saveStorage(STORAGE_KEY_DELETED_PATIENTS, cleanedDeleted);
        }

        const syncedPatients = [];
        const seenKeys = new Set();
        
        for (const user of activePatientUsers) {
          const key = (user.username || user.name || user.email || '').toLowerCase();
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);
          
          let match = patientPool.find(p => 
            (user.patientId && Number(p.id) === Number(user.patientId)) ||
            (user.mrn && p.mrn && p.mrn.toLowerCase() === user.mrn.toLowerCase()) ||
            (p.username && user.username && p.username.toLowerCase() === user.username.toLowerCase()) ||
            (p.fullName && user.name && p.fullName.toLowerCase() === user.name.toLowerCase()) ||
            (`${p.firstName} ${p.lastName}`.toLowerCase() === (user.name || '').toLowerCase())
          );
          
          if (!match && user.mrn) {
            match = patientPool.find(p => p.mrn && p.mrn.toLowerCase() === user.mrn.toLowerCase());
          }
          
          if (match) {
            syncedPatients.push({
              ...match,
              age: match.dateOfBirth ? calculateAgeFromDob(match.dateOfBirth, match.age || 30) : (match.age || 30),
              fullName: user.name || user.fullName || match.fullName,
              username: user.username || match.username,
              email: user.email || match.email,
            });
          } else {
            const parts = (user.name || user.fullName || 'Patient User').split(' ');
            const seedDob = '1985-04-12';
            syncedPatients.push({
              id: user.patientId || user.id || Date.now(),
              mrn: user.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              firstName: parts[0] || 'Patient',
              lastName: parts.slice(1).join(' ') || 'User',
              fullName: user.name || user.fullName || 'Patient User',
              username: user.username,
              email: user.email,
              dateOfBirth: seedDob,
              age: calculateAgeFromDob(seedDob, 40),
              gender: 'Male',
              bloodGroup: 'O+',
              phone: user.phone || '+1 (555) 234-5678',
              contactPhone: user.phone || '+1 (555) 234-5678',
              allergies: 'None (NKDA)',
              emergencyContact: 'Family Emergency Contact',
              room: 'Outpatient Clinic',
              status: 'Active',
              registeredDate: 'Sep 20, 2026',
            });
          }
        }
        
        if (syncedPatients.length > 0) {
          const unmapped = patientPool
            .filter(p => !syncedPatients.some(sp => sp.id === p.id || (p.mrn && sp.mrn && sp.mrn.toLowerCase() === p.mrn.toLowerCase())))
            .map(p => ({
              ...p,
              age: p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth, p.age || 30) : (p.age || 30),
            }));
          return [...syncedPatients, ...unmapped];
        }
      }
    }
    
    return patientPool.map(p => ({
      ...p,
      age: p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth, p.age || 30) : (p.age || 30),
    }));
  });

  const [appointments, setAppointments] = useState(() => loadStorage(STORAGE_KEY_APPOINTMENTS, initialAppointments));
  const [auditLogs, setAuditLogs] = useState(() => loadStorage(STORAGE_KEY_AUDIT, initialAuditLogs));
  const [reports, setReports] = useState(() => loadStorage(STORAGE_KEY_REPORTS, initialReports));

  // Sync state to local storage
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      saveStorage(STORAGE_KEY_AUTH, { isAuthenticated, currentUser, activeTab });
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      } catch (e) {}
    }
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

  // Sync to backend on mount if online
  useEffect(() => {
    let isMounted = true;
    const syncCloudData = async () => {
      try {
        const deletedMrnsList = loadStorage(STORAGE_KEY_DELETED_PATIENTS, []);
        const deletedMrnSet = new Set(deletedMrnsList.map(m => (m || '').toLowerCase()));
        const cloudPatients = await api.getPatients();
        if (isMounted && Array.isArray(cloudPatients) && cloudPatients.length > 0) {
          setPatients(prev => {
            const existingMrns = new Set(prev.map(p => (p.mrn || '').toLowerCase()));
            const newOnes = cloudPatients
              .filter(cp => 
                cp.mrn && 
                !existingMrns.has(cp.mrn.toLowerCase()) && 
                !deletedMrnSet.has(cp.mrn.toLowerCase())
              )
              .map(cp => ({
                ...cp,
                fullName: cp.fullName || `${cp.firstName || ''} ${cp.lastName || ''}`.trim() || 'Patient',
                age: cp.dateOfBirth ? calculateAgeFromDob(cp.dateOfBirth, cp.age || 30) : (cp.age || 30),
              }));
            return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
          });
        }
      } catch (e) {}
    };
    syncCloudData();
    return () => { isMounted = false; };
  }, []);

  // Selected Patient - dynamically resolves to logged-in patient if in Patient Portal!
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    const saved = loadStorage(STORAGE_KEY_SELECTED_PATIENT, null);
    return saved ? Number(saved) : 1;
  });

  useEffect(() => {
    saveStorage(STORAGE_KEY_SELECTED_PATIENT, selectedPatientId);
  }, [selectedPatientId]);

  const selectedPatient = useMemo(() => {
    const list = Array.isArray(patients) && patients.length > 0 ? patients : initialPatients;

    // 1. PATIENT PORTAL: Strictly bind to the authenticated patient's profile. NEVER FALL BACK TO JOHN DOE OR list[0]!
    if (currentUser && (currentUser.role === 'ROLE_PATIENT' || currentUser.role === 'Patient')) {
      const match = list.find(p => 
        (currentUser.patientId && Number(p.id) === Number(currentUser.patientId)) ||
        (currentUser.mrn && p.mrn && p.mrn.toLowerCase() === currentUser.mrn.toLowerCase()) ||
        (currentUser.username && p.username && p.username.toLowerCase() === currentUser.username.toLowerCase()) ||
        (currentUser.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.fullName && p.fullName && p.fullName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
        (currentUser.fullName && `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === currentUser.fullName.toLowerCase()) ||
        (currentUser.name && p.fullName && p.fullName.toLowerCase() === currentUser.name.toLowerCase()) ||
        (currentUser.phone && p.phone && p.phone === currentUser.phone)
      );
      if (match) {
        const resolvedAge = match.dateOfBirth ? calculateAgeFromDob(match.dateOfBirth, match.age || 30) : (match.age || 30);
        return { ...match, age: resolvedAge };
      }

      // If registered patient is not yet in the list (e.g. storage sync delay),
      // synthesize patient profile directly from the authenticated currentUser!
      const nameStr = currentUser.fullName || currentUser.name || currentUser.username || 'Patient User';
      const parts = nameStr.split(' ');
      const userDob = currentUser.dateOfBirth || '1995-01-01';
      return {
        id: currentUser.patientId || currentUser.id || Date.now(),
        mrn: currentUser.mrn || `MRN-2026-${String(currentUser.id || Math.floor(1000 + Math.random() * 9000)).slice(-4)}`,
        firstName: parts[0] || 'Patient',
        lastName: parts.slice(1).join(' ') || 'User',
        fullName: nameStr,
        username: currentUser.username,
        email: currentUser.email || `${currentUser.username || 'patient'}@careconnect.org`,
        dateOfBirth: userDob,
        age: calculateAgeFromDob(userDob, currentUser.age || 30),
        gender: currentUser.gender || 'Other',
        bloodGroup: currentUser.bloodGroup || 'O+',
        phone: currentUser.phone || '+1 (555) 000-0000',
        contactPhone: currentUser.phone || '+1 (555) 000-0000',
        allergies: currentUser.allergies || 'None (NKDA)',
        emergencyContact: currentUser.emergencyContact || 'Family Emergency Contact',
        room: 'Outpatient Reception',
        status: 'Active',
        registeredDate: currentUser.registeredDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    // 2. DOCTOR / ADMIN PORTAL: Resolves to selectedPatientId
    const active = list.find(p => Number(p.id) === Number(selectedPatientId)) || list[0] || initialPatients[0];
    if (active) {
      const resolvedAge = active.dateOfBirth ? calculateAgeFromDob(active.dateOfBirth, active.age || 30) : (active.age || 30);
      return { ...active, age: resolvedAge };
    }
    return active;
  }, [patients, selectedPatientId, currentUser]);

  // Keep selectedPatientId in sync with the active patient in the patient portal
  useEffect(() => {
    if (currentUser && (currentUser.role === 'ROLE_PATIENT' || currentUser.role === 'Patient')) {
      if (selectedPatient && selectedPatient.id && Number(selectedPatientId) !== Number(selectedPatient.id)) {
        setSelectedPatientId(selectedPatient.id);
      }
    }
  }, [currentUser, selectedPatient?.id, selectedPatientId]);

  // Initial Clinical Encounters (per-patient baseline)
  const initialEncounters = {
    1: {
      id: 1001,
      patientId: 1,
      hasEncounter: true,
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
    },
    2: {
      id: 1002,
      patientId: 2,
      hasEncounter: true,
      date: 'Sep 29, 2026 • 02:00 PM',
      doctor: 'Dr. Sarah Smith, MD',
      status: 'In Progress',
      chiefComplaint: 'Asthma controller checkup and maintenance inhaler refill evaluation.',
      vitals: {
        bpSystolic: 122,
        bpDiastolic: 78,
        heartRate: 72,
        temp: 98.6,
        spo2: 98,
        respRate: 16,
      },
      soap: {
        subjective: 'Maria presents for scheduled asthma checkup. Reports occasional mild morning chest tightness in air conditioning. Adherent with medications.',
        objective: 'Lungs clear to auscultation bilaterally. No wheezing or rhonchi. Heart regular rate and rhythm.',
        assessment: '1. Moderate Persistent Asthma (J45.40)\n2. Allergic Rhinitis (J30.9)',
        plan: '1. Refill Fluticasone Propionate daily inhaler.\n2. Continue Montelukast 10mg at bedtime.\n3. Sulfa allergy alert maintained in chart.',
      },
      isSigned: false,
      signedAt: null,
    },
    3: {
      id: 1003,
      patientId: 3,
      hasEncounter: true,
      date: 'Sep 25, 2026 • 11:30 AM',
      doctor: 'Dr. Michael Chang, MD',
      status: 'Completed',
      chiefComplaint: 'Post-discharge follow-up and annual preventive health review.',
      vitals: {
        bpSystolic: 118,
        bpDiastolic: 74,
        heartRate: 68,
        temp: 98.4,
        spo2: 99,
        respRate: 14,
      },
      soap: {
        subjective: 'Robert reports feeling healthy with no acute physical complaints. Regular exercise 4x/week.',
        objective: 'Physical exam unremarkable. Clear lung fields, normal heart sounds, abdomen soft and non-tender.',
        assessment: '1. Routine General Medical Examination (Z00.00)',
        plan: '1. Annual preventative checkup complete. Follow up in 12 months.\n2. Maintain active lifestyle and balanced diet.',
      },
      isSigned: true,
      signedAt: '11:55 AM',
    },
    4: {
      id: 1004,
      patientId: 4,
      hasEncounter: true,
      date: 'Sep 24, 2026 • 09:15 AM',
      doctor: 'Dr. Rajesh Sharma, MD',
      status: 'In Progress',
      chiefComplaint: 'Cardiovascular screening and routine lipid profile check.',
      vitals: {
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRate: 70,
        temp: 98.6,
        spo2: 98,
        respRate: 16,
      },
      soap: {
        subjective: 'Aisha reports no chest pain, palpitations, or shortness of breath. Active lifestyle.',
        objective: 'Cardiovascular: Regular rate and rhythm, normal S1/S2, no murmurs. Lungs clear.',
        assessment: '1. Cardiovascular Risk Screening - Low Risk',
        plan: '1. Ordered fasting lipid panel.\n2. Prescribe Vitamin D3 supplement.',
      },
      isSigned: false,
      signedAt: null,
    },
    5: {
      id: 1005,
      patientId: 5,
      hasEncounter: true,
      date: 'Sep 27, 2026 • 03:00 PM',
      doctor: 'Dr. Rajesh Sharma, MD',
      status: 'In Progress',
      chiefComplaint: 'Mild seasonal allergies and skin irritation evaluation.',
      vitals: {
        bpSystolic: 126,
        bpDiastolic: 82,
        heartRate: 76,
        temp: 98.8,
        spo2: 98,
        respRate: 16,
      },
      soap: {
        subjective: 'Rahul reports mild seasonal nasal congestion and itchy eyes for 1 week. Denies fever.',
        objective: 'Nasal mucosa mildly erythematous. Lungs clear to auscultation.',
        assessment: '1. Allergic Rhinitis (J30.9)',
        plan: '1. Prescribe Cetirizine 10mg as needed.\n2. Latex allergy precautions verified.',
      },
      isSigned: false,
      signedAt: null,
    }
  };

  // Initial Diagnostic Orders
  const initialOrders = [
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
    },
    {
      id: 303,
      patientId: 2,
      name: 'Spirometry & Pulmonary Function Test',
      type: 'Laboratory',
      priority: 'Routine',
      status: 'Completed',
      orderedAt: '01:30 PM',
      result: 'Post-bronchodilator FEV1/FVC ratio 78%. FEV1 improved by 14% post-inhaler.',
    },
    {
      id: 304,
      patientId: 4,
      name: 'Lipid Panel & Fasting Glucose',
      type: 'Laboratory',
      priority: 'Routine',
      status: 'Completed',
      orderedAt: '09:00 AM',
      result: 'Total Cholesterol 185 mg/dL, HDL 55 mg/dL, LDL 105 mg/dL, Fasting Glucose 92 mg/dL. All optimal.',
    }
  ];

  // Initial Prescriptions
  const initialPrescriptions = [
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
    },
    {
      id: 503,
      patientId: 2,
      name: 'Fluticasone Propionate Inhaler',
      dosage: '110 mcg',
      frequency: '2 puffs twice daily',
      duration: '30 days',
      status: 'Active',
      override: null,
    },
    {
      id: 504,
      patientId: 2,
      name: 'Montelukast Sodium Tablet',
      dosage: '10 mg',
      frequency: 'Once daily at bedtime',
      duration: '30 days',
      status: 'Active',
      override: null,
    },
    {
      id: 505,
      patientId: 3,
      name: 'Multivitamin Complete Formula',
      dosage: '1 tablet',
      frequency: 'Once daily with meals',
      duration: '90 days',
      status: 'Active',
      override: null,
    },
    {
      id: 506,
      patientId: 4,
      name: 'Vitamin D3 (Cholecalciferol)',
      dosage: '2000 IU',
      frequency: 'Once daily in the morning',
      duration: '60 days',
      status: 'Active',
      override: null,
    },
    {
      id: 507,
      patientId: 5,
      name: 'Cetirizine Hydrochloride',
      dosage: '10 mg',
      frequency: 'Once daily as needed for allergy symptoms',
      duration: '30 days',
      status: 'Active',
      override: null,
    }
  ];

  const [encountersMap, setEncountersMap] = useState(() => loadStorage(STORAGE_KEY_ENCOUNTERS, initialEncounters));
  const [orders, setOrders] = useState(() => loadStorage(STORAGE_KEY_ORDERS, initialOrders));
  const [prescriptions, setPrescriptions] = useState(() => loadStorage(STORAGE_KEY_PRESCRIPTIONS, initialPrescriptions));

  useEffect(() => {
    saveStorage(STORAGE_KEY_ENCOUNTERS, encountersMap);
  }, [encountersMap]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveStorage(STORAGE_KEY_PRESCRIPTIONS, prescriptions);
  }, [prescriptions]);

  // Dynamically resolve the active patient's encounter
  const encounter = useMemo(() => {
    const pid = selectedPatient?.id || 1;
    const defaultVitals = {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 72,
      temp: 98.6,
      spo2: 99,
      respRate: 16,
    };
    const defaultSoap = {
      subjective: `Patient ${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''} registered in CareConnect clinical portal. Ready for physician documentation.`,
      objective: 'Baseline initial intake. Vitals documented.',
      assessment: '1. Routine General Health Examination (Z00.00)',
      plan: '1. Complete clinical workup and baseline laboratory profiling.\n2. Formulate ongoing care plan.',
    };

    if (encountersMap && typeof encountersMap === 'object' && encountersMap[pid]) {
      const e = encountersMap[pid];
      return {
        ...e,
        vitals: { ...defaultVitals, ...(e.vitals || {}) },
        soap: { ...defaultSoap, ...(e.soap || {}) },
      };
    }
    return {
      id: 1000 + pid,
      patientId: pid,
      hasEncounter: false,
      date: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • 10:00 AM`,
      doctor: (currentUser?.role === 'ROLE_DOCTOR' || currentUser?.role === 'Doctor') ? currentUser.fullName : 'Dr. Sarah Smith, MD',
      status: 'Intake / New',
      chiefComplaint: 'Outpatient clinical intake and preliminary assessment.',
      vitals: defaultVitals,
      soap: defaultSoap,
      isSigned: false,
      signedAt: null,
    };
  }, [encountersMap, selectedPatient?.id, selectedPatient?.firstName, selectedPatient?.lastName, currentUser]);

  // Clinical Doctors List
  const [doctorsList, setDoctorsList] = useState([
    { id: 101, name: 'Dr. Sarah Smith, MD', specialty: 'Internal Medicine & Pulmonology', room: 'Exam Room 3' },
    { id: 107, name: 'Dr. Rajesh Sharma, MD', specialty: 'Cardiovascular Medicine', room: 'Clinic Suite C' },
    { id: 111, name: 'Dr. Michael Chang, MD', specialty: 'Cardiology & Preventive Medicine', room: 'Clinic Suite B' },
    { id: 112, name: 'Dr. Emily Davis, MD', specialty: 'Family & General Practice', room: 'Exam Room 1' },
  ]);

  // Keep doctorsList dynamically synchronized with any doctors in systemUsers
  useEffect(() => {
    const doctorUsers = systemUsers.filter(u => u.role === 'Doctor' || u.role === 'ROLE_DOCTOR');
    if (doctorUsers.length > 0) {
      setDoctorsList(prev => {
        const merged = [...prev];
        for (const doc of doctorUsers) {
          const docName = doc.name || doc.fullName || 'Doctor';
          const docSpecialty = doc.department || 'General Medicine';
          const suiteLetter = String.fromCharCode(65 + (merged.length % 26));
          const docRoom = doc.room || `Clinic Suite ${suiteLetter}`;
          const existingIdx = merged.findIndex(d => 
            d.id === doc.id || 
            (d.name && d.name.toLowerCase() === docName.toLowerCase())
          );
          if (existingIdx >= 0) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              id: doc.id || merged[existingIdx].id,
              name: docName,
              specialty: docSpecialty,
            };
          } else {
            merged.push({
              id: doc.id || Date.now(),
              name: docName,
              specialty: docSpecialty,
              room: docRoom,
            });
          }
        }
        return merged;
      });
    }
  }, [systemUsers]);

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
      if (beAuth && beAuth.success) {
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

        const localUserMatch = systemUsers.find(u => 
          (u.username && u.username.toLowerCase() === enteredUser) ||
          (u.email && u.email.toLowerCase() === enteredUser)
        );

        user = {
          id: beAuth.userId || (localUserMatch ? localUserMatch.id : 101),
          role: roleNormalized,
          roleLabel: roleNormalized === 'ROLE_PATIENT' ? 'Patient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Doctor / Physician' : 'System Administrator'),
          username: beAuth.username,
          fullName: beAuth.fullName || (localUserMatch ? localUserMatch.fullName : beAuth.username),
          email: (localUserMatch && localUserMatch.email) || `${beAuth.username}@careconnect.org`,
          department: roleNormalized === 'ROLE_PATIENT' ? 'Outpatient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Clinical Care' : 'Hospital Administration'),
          patientId: localUserMatch ? localUserMatch.patientId : (roleNormalized === 'ROLE_PATIENT' ? beAuth.userId : undefined),
          mrn: localUserMatch ? localUserMatch.mrn : undefined,
          token: beAuth.token,
        };
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, checking local registered directory:', err);
    }

    // 2. If backend didn't authenticate, check locally registered persistent systemUsers
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
        username: found.username || (found.email ? found.email.split('@')[0] : 'user'),
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

    // If logging in as doctor, set active patient to doctor's next scheduled appointment
    if (user.role === 'ROLE_DOCTOR') {
      const myNextAppt = appointments.find(a => 
        (a.doctorName === user.fullName || a.doctorId === user.id) && a.status !== 'Cancelled'
      );
      if (myNextAppt && myNextAppt.patientId) {
        setSelectedPatientId(myNextAppt.patientId);
      } else {
        setSelectedPatientId(1);
      }
    }

    // If logging in as patient, update selectedPatientId to match their patient record!
    if (user.role === 'ROLE_PATIENT') {
      const match = patients.find(p => 
        (user.patientId && Number(p.id) === Number(user.patientId)) ||
        (user.mrn && p.mrn && p.mrn.toLowerCase() === user.mrn.toLowerCase()) ||
        (user.username && p.username && p.username.toLowerCase() === user.username.toLowerCase()) ||
        (user.email && p.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.fullName && p.fullName && p.fullName.toLowerCase() === user.fullName.toLowerCase()) ||
        (user.fullName && `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === user.fullName.toLowerCase())
      );
      const chosenPatientId = match ? match.id : (user.patientId || user.id);
      setSelectedPatientId(chosenPatientId);
      saveStorage(STORAGE_KEY_SELECTED_PATIENT, chosenPatientId);
    }

    saveStorage(STORAGE_KEY_AUTH, { isAuthenticated: true, currentUser: user, activeTab: 'overview' });
    showToast(`Signed in successfully as ${user.fullName}`, 'success');
    return { success: true, user };
  };

  // Auth: Patient Self-Registration
  const signup = async (formData) => {
    const cleanUsername = (formData.username && formData.username.trim()) || formData.email.split('@')[0];
    const cleanEmail = formData.email.trim();
    const cleanName = formData.fullName.trim();
    const cleanPassword = formData.password ? formData.password.trim() : 'Patient#2026';
    const cleanDob = formData.dateOfBirth || '1995-01-01';
    const resolvedAge = calculateAgeFromDob(cleanDob, Number(formData.age) || 30);

    const suffix = Math.floor(1000 + Math.random() * 9000);
    const newUserId = Date.now();
    const maxPatientId = patients.reduce((max, p) => Math.max(max, Number(p.id) || 0), 100);
    const newPatientId = maxPatientId + 1;
    const mrn = `MRN-2026-${suffix}`;

    const newPatient = {
      id: newPatientId,
      mrn: mrn,
      firstName: cleanName.split(' ')[0] || cleanName,
      lastName: cleanName.split(' ').slice(1).join(' ') || 'Patient',
      fullName: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      dateOfBirth: cleanDob,
      age: resolvedAge,
      gender: formData.gender || 'Female',
      bloodGroup: formData.bloodGroup || 'O+',
      phone: formData.phone || '+1 (555) 000-0000',
      contactPhone: formData.phone || '+1 (555) 000-0000',
      allergies: formData.allergies || 'None (NKDA)',
      emergencyContact: formData.emergencyContact || 'Family Emergency Contact',
      room: 'Outpatient Reception',
      status: 'Active',
      registeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
      dateOfBirth: cleanDob,
      age: resolvedAge,
    };

    const updatedPatients = [newPatient, ...patients];
    const updatedUsers = [
      ...systemUsers.filter(u => u.username?.toLowerCase() !== cleanUsername.toLowerCase() && u.email?.toLowerCase() !== cleanEmail.toLowerCase()),
      {
        id: newUserId,
        name: cleanName,
        fullName: cleanName,
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
        dateOfBirth: cleanDob,
        age: resolvedAge,
      }
    ];

    // 1. Update React state
    setPatients(updatedPatients);
    setSelectedPatientId(newPatientId);
    setSystemUsers(updatedUsers);

    // 2. Synchronously write to local storage so page refresh preserves new patient immediately
    saveStorage(STORAGE_KEY_PATIENTS, updatedPatients);
    saveStorage(STORAGE_KEY_USERS, updatedUsers);
    saveStorage(STORAGE_KEY_SELECTED_PATIENT, newPatientId);
    saveStorage(STORAGE_KEY_AUTH, { isAuthenticated: true, currentUser: newUser, activeTab: 'overview' });

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: cleanName,
      action: 'USER_REGISTRATION',
      details: `New Patient self-registered account: ${cleanName} (Username: ${cleanUsername}, MRN: ${mrn}, Age: ${resolvedAge}y)`
    }, ...prev]);

    // 3. Transmit to Spring Boot REST API
    try {
      await api.registerPatientAccount({
        fullName: cleanName,
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        phone: formData.phone || '+1 (555) 000-0000',
      });
      // Also register into backend Master Patient Index with exact date of birth and age
      await api.registerPatient({
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        dateOfBirth: cleanDob,
        age: resolvedAge,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: newPatient.phone,
        emergencyContact: newPatient.emergencyContact,
        allergies: newPatient.allergies,
        assignedRoom: newPatient.room,
        status: 'Admitted',
      }, 'Patient Self-Registration');
    } catch (err) {
      console.warn('Backend patient registration offline, registered in browser session.');
    }

    // 4. Establish active session
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveTab('overview');
    showToast(`Patient account created! Welcome to CareConnect, ${cleanName}.`, 'success');
    return { success: true, user: newUser };
  };

  // Auth: Logout
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(defaultPersonas.ROLE_DOCTOR);
    setSelectedPatientId(1);
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

    // 3. Update in patients directory so welcome banners, charts, and directories immediately reflect new name
    setPatients(prev => prev.map(p => {
      const isMatch = (currentUser.patientId && p.id === currentUser.patientId) ||
                      (currentUser.mrn && p.mrn === currentUser.mrn) ||
                      (p.username && p.username.toLowerCase() === oldUsername.toLowerCase()) ||
                      (p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                      (p.fullName && p.fullName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
                      (`${p.firstName} ${p.lastName}`.toLowerCase() === currentUser.fullName.toLowerCase());
      if (isMatch) {
        const parts = updatedName.split(' ');
        const first = parts[0] || p.firstName;
        const last = parts.slice(1).join(' ') || p.lastName;
        return {
          ...p,
          firstName: first,
          lastName: last,
          fullName: updatedName,
          username: updatedUsername,
          email: updatedEmail,
        };
      }
      return p;
    }));

    // 4. Update in clinical doctors list if Doctor
    if (currentUser.role === 'ROLE_DOCTOR') {
      setDoctorsList(prev => prev.map(d => {
        if (d.id === currentUser.id || d.name === currentUser.fullName || d.name === updatedName) {
          return { ...d, name: updatedName };
        }
        return d;
      }));
      setEncountersMap(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(pid => {
          if (next[pid] && next[pid].doctor === currentUser.fullName) {
            next[pid] = { ...next[pid], doctor: updatedName };
          }
        });
        return next;
      });
    }

    // 5. Update appointment lists
    setAppointments(prev => prev.map(a => {
      if (a.patientName === currentUser.fullName) {
        return { ...a, patientName: updatedName };
      }
      if (a.doctorName === currentUser.fullName) {
        return { ...a, doctorName: updatedName };
      }
      return a;
    }));

    // 6. Update personas cache
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

    // 7. Send to Backend REST API so Spring Boot & H2 DB persist changes
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

    // 8. Log HIPAA audit trail
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

  // Admin Override: Edit any user's Name, Username, Role, or Password directly
  const adminUpdateUser = async (targetUser) => {
    const updatedName = (targetUser.name || targetUser.fullName || '').trim();
    const updatedUsername = (targetUser.username || '').trim().toLowerCase();
    const updatedPassword = (targetUser.password || '').trim();
    const updatedEmail = (targetUser.email || '').trim();
    const updatedRole = targetUser.role;

    const originalUsername = (targetUser.originalUsername || updatedUsername).toLowerCase();
    const originalName = targetUser.originalName || updatedName;

    // 1. Update in systemUsers directory
    setSystemUsers(prev => prev.map(u => {
      const isTarget = u.id === targetUser.id || 
                       (u.username && u.username.toLowerCase() === originalUsername);
      if (isTarget) {
        return {
          ...u,
          name: updatedName,
          fullName: updatedName,
          username: updatedUsername,
          password: updatedPassword || u.password,
          email: updatedEmail,
          role: updatedRole || u.role,
        };
      }
      return u;
    }));

    // 2. If it matches current logged in user, update active session
    if (currentUser && (currentUser.id === targetUser.id || (currentUser.username && currentUser.username.toLowerCase() === originalUsername))) {
      setCurrentUser(prev => ({
        ...prev,
        fullName: updatedName,
        username: updatedUsername,
        email: updatedEmail,
      }));
    }

    // 3. If patient, update in patients collection
    setPatients(prev => prev.map(p => {
      const isTargetPatient = (targetUser.patientId && p.id === targetUser.patientId) ||
                              (targetUser.mrn && p.mrn === targetUser.mrn) ||
                              (p.username && p.username.toLowerCase() === originalUsername) ||
                              (p.fullName && p.fullName.toLowerCase() === originalName.toLowerCase());
      if (isTargetPatient) {
        const parts = updatedName.split(' ');
        return {
          ...p,
          firstName: parts[0] || p.firstName,
          lastName: parts.slice(1).join(' ') || p.lastName,
          fullName: updatedName,
          username: updatedUsername,
          email: updatedEmail,
        };
      }
      return p;
    }));

    // 4. If doctor, update in clinic roster
    if (updatedRole === 'Doctor') {
      setDoctorsList(prev => prev.map(d => {
        if (d.id === targetUser.id || d.name === originalName || d.name === updatedName) {
          return { ...d, name: updatedName };
        }
        return d;
      }));
    }

    // 5. Update matching appointments
    setAppointments(prev => prev.map(a => {
      if (a.patientName === originalName) {
        return { ...a, patientName: updatedName };
      }
      if (a.doctorName === originalName) {
        return { ...a, doctorName: updatedName };
      }
      return a;
    }));

    // 6. Send to Backend REST API
    try {
      await api.updateProfile({
        userId: targetUser.id,
        currentUsername: originalUsername,
        newUsername: updatedUsername,
        currentPassword: 'password123',
        newPassword: updatedPassword || null,
        fullName: updatedName,
        email: updatedEmail,
      });
    } catch (err) {}

    // 7. Audit log
    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'ADMIN_CREDENTIAL_OVERRIDE',
      details: `Admin updated account for ${updatedUsername} (${updatedName}) - Password modified: ${Boolean(updatedPassword)}`
    }, ...prev]);

    showToast(`Account for ${updatedName} updated successfully!`, 'success');
  };

  // Doctor actions
  const updateVitals = (newVitals) => {
    const pid = selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[pid] || encounter;
      return {
        ...prev,
        [pid]: {
          ...cur,
          hasEncounter: true,
          vitals: { ...cur.vitals, ...newVitals },
        }
      };
    });
    showToast('Vitals saved successfully.', 'success');
  };

  const updateSoap = (newSoap) => {
    const pid = selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[pid] || encounter;
      return {
        ...prev,
        [pid]: {
          ...cur,
          hasEncounter: true,
          soap: { ...cur.soap, ...newSoap },
        }
      };
    });
    showToast('Clinical notes updated.', 'info');
  };

  const signEncounter = () => {
    const pid = selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[pid] || encounter;
      return {
        ...prev,
        [pid]: {
          ...cur,
          hasEncounter: true,
          doctor: currentUser?.fullName || cur.doctor,
          status: 'Completed',
          isSigned: true,
          signedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      };
    });
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

  const registerPatient = async (patientData) => {
    const newId = Date.now();
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const firstName = (patientData.firstName || '').trim() || 'Patient';
    const lastName = (patientData.lastName || '').trim() || 'New';
    const fullName = patientData.fullName || `${firstName} ${lastName}`.trim();
    const mrn = patientData.mrn || `MRN-2026-${suffix}`;
    
    // Auto-generate or use provided username and password for login!
    const generatedUsername = (patientData.username && patientData.username.trim().toLowerCase()) ||
      (patientData.email ? patientData.email.split('@')[0].toLowerCase() : `${firstName.toLowerCase()}_${suffix}`);
    
    const generatedPassword = (patientData.password && patientData.password.trim()) || 'Patient#2026';
    const cleanEmail = (patientData.email && patientData.email.trim()) || `${generatedUsername}@careconnect.org`;
    const phone = patientData.phone || patientData.contactPhone || '+1 (555) 000-0000';

    const newPatient = {
      ...patientData,
      id: newId,
      mrn: mrn,
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      dateOfBirth: patientData.dateOfBirth || '1995-01-01',
      age: patientData.dateOfBirth ? calculateAgeFromDob(patientData.dateOfBirth, Number(patientData.age) || 30) : (Number(patientData.age) || 30),
      gender: patientData.gender || 'Female',
      bloodGroup: patientData.bloodGroup || 'O+',
      phone: phone,
      contactPhone: phone,
      email: cleanEmail,
      username: generatedUsername,
      allergies: patientData.allergies || 'None (NKDA)',
      emergencyContact: patientData.emergencyContact || 'Family Emergency Contact',
      room: patientData.room || 'Triage Room 1',
      status: patientData.status || 'Admitted',
      registeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    // 1. Add to patients state
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);

    // 2. CRITICAL: Add a user login account to systemUsers so they CAN LOG IN!
    const newSystemUser = {
      id: newId,
      name: fullName,
      fullName: fullName,
      username: generatedUsername,
      password: generatedPassword,
      email: cleanEmail,
      phone: phone,
      role: 'Patient',
      roleLabel: 'Patient',
      department: 'Outpatient Portal',
      status: 'Active',
      lastLogin: 'Pending First Login',
      patientId: newId,
      mrn: mrn,
    };

    setSystemUsers(prev => [
      ...prev.filter(u => (u.username || '').toLowerCase() !== generatedUsername.toLowerCase() && (u.email || '').toLowerCase() !== cleanEmail.toLowerCase()),
      newSystemUser
    ]);

    // 3. Log audit event
    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser ? currentUser.fullName : fullName,
      action: 'PATIENT_ENROLLED',
      details: `Enrolled patient ${fullName} (${mrn}). Login provisioned: '${generatedUsername}'`
    }, ...prev]);

    // 4. Send to backend REST API
    try {
      await api.registerPatient({
        mrn: mrn,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: newPatient.dateOfBirth,
        age: newPatient.age,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: phone,
        emergencyContact: newPatient.emergencyContact,
        allergies: newPatient.allergies,
        room: newPatient.room,
        status: newPatient.status
      }, currentUser?.fullName);
    } catch (err) {
      console.warn('Backend patient sync offline, saved locally.');
    }

    try {
      await api.registerPatientAccount({
        fullName: fullName,
        username: generatedUsername,
        password: generatedPassword,
        email: cleanEmail,
        phone: phone,
      });
    } catch (err) {
      console.warn('Backend patient account sync offline, saved locally.');
    }

    showToast(`Patient ${fullName} registered (${mrn})! Portal Login: ${generatedUsername} / ${generatedPassword}`, 'success');
    return { success: true, patient: newPatient, user: newSystemUser };
  };

  const addSystemUser = async (userData) => {
    const newId = Date.now();
    const role = userData.role || 'Doctor';
    const isPatientRole = role === 'Patient' || role === 'ROLE_PATIENT';
    const fullName = userData.name?.trim() || userData.fullName?.trim() || 'New User';
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = userData.username?.trim().toLowerCase() || (userData.email ? userData.email.split('@')[0].toLowerCase() : `user_${suffix}`);
    const department = userData.department || userData.specialty || (role === 'Doctor' ? 'Internal Medicine' : (isPatientRole ? 'Outpatient Portal' : 'Hospital Operations'));
    const password = userData.password ? userData.password.trim() : (isPatientRole ? 'Patient#2026' : 'Doctor#2026');
    const phone = userData.phone || '+1 (555) 100-0100';
    const email = userData.email || `${username}@careconnect.org`;
    
    let patientRecord = null;
    let mrn = null;

    // If role is Patient, also create the patient profile in patients so they show in clinical records!
    if (isPatientRole) {
      mrn = `MRN-2026-${suffix}`;
      const parts = fullName.split(' ');
      const first = parts[0] || 'Patient';
      const last = parts.slice(1).join(' ') || 'User';

      patientRecord = {
        id: newId,
        mrn: mrn,
        firstName: first,
        lastName: last,
        fullName: fullName,
        dateOfBirth: userData.dateOfBirth || '1995-01-01',
        age: userData.dateOfBirth ? calculateAgeFromDob(userData.dateOfBirth, Number(userData.age) || 30) : (Number(userData.age) || 30),
        gender: userData.gender || 'Female',
        bloodGroup: userData.bloodGroup || 'O+',
        phone: phone,
        contactPhone: phone,
        email: email,
        username: username,
        allergies: userData.allergies || 'None (NKDA)',
        emergencyContact: userData.emergencyContact || 'Family Emergency Contact',
        room: 'Outpatient Clinic',
        status: 'Active',
        registeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setPatients(prev => [patientRecord, ...prev]);

      // Save to backend
      try {
        await api.registerPatient({
          mrn: mrn,
          firstName: first,
          lastName: last,
          dateOfBirth: patientRecord.dateOfBirth,
          age: patientRecord.age,
          gender: patientRecord.gender,
          bloodGroup: patientRecord.bloodGroup,
          phone: phone,
          emergencyContact: patientRecord.emergencyContact,
          allergies: patientRecord.allergies,
          room: patientRecord.room,
          status: patientRecord.status
        }, currentUser?.fullName);
      } catch (err) {}

      try {
        await api.registerPatientAccount({
          fullName: fullName,
          username: username,
          password: password,
          email: email,
          phone: phone,
        });
      } catch (err) {}
    }

    const newUser = {
      ...userData,
      id: newId,
      name: fullName,
      fullName: fullName,
      username: username,
      password: password,
      role: isPatientRole ? 'Patient' : role,
      roleLabel: isPatientRole ? 'Patient' : (role === 'Doctor' ? 'Doctor / Physician' : role),
      department: department,
      status: 'Active',
      lastLogin: 'Pending First Login',
      patientId: patientRecord ? newId : undefined,
      mrn: mrn || undefined,
      email: email,
      phone: phone,
    };
    setSystemUsers(prev => [...prev, newUser]);

    // If new user is a Doctor, dynamically add to the clinic doctors list for appointments
    if (role === 'Doctor') {
      const suiteLetter = String.fromCharCode(65 + (doctorsList.length % 26));
      setDoctorsList(prev => [
        ...prev,
        {
          id: newId,
          name: fullName,
          specialty: department,
          room: `Clinic Suite ${suiteLetter}`,
        }
      ]);

      // Transmit to Backend API
      try {
        await api.provisionStaff({
          fullName: fullName,
          username: username,
          password: password,
          email: email,
          phone: phone,
          department: department,
          role: 'ROLE_DOCTOR'
        });
      } catch (err) {}
    } else if (!isPatientRole) {
      try {
        await api.provisionStaff({
          fullName: fullName,
          username: username,
          password: password,
          email: email,
          phone: phone,
          department: department,
          role: role === 'Administrator' ? 'ROLE_ADMIN' : 'ROLE_NURSE'
        });
      } catch (err) {}
    }

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'USER_PROVISIONED',
      details: `Admin provisioned ${role} account: ${fullName} (Username: ${username}, Password: ${password})`
    }, ...prev]);
    showToast(`${role} ${fullName} provisioned! Login username: ${username}`, 'success');
  };

  const removePatient = async (patientId) => {
    const targetPatient = patients.find(p => p.id === patientId);
    if (!targetPatient) return;

    // Track deleted MRN so cloud sync will never resurrect it
    if (targetPatient.mrn) {
      const deletedMrnsList = loadStorage(STORAGE_KEY_DELETED_PATIENTS, []);
      if (!deletedMrnsList.includes(targetPatient.mrn)) {
        saveStorage(STORAGE_KEY_DELETED_PATIENTS, [...deletedMrnsList, targetPatient.mrn]);
      }
    }

    // 1. Remove from patients collection
    setPatients(prev => {
      const remaining = prev.filter(p => p.id !== patientId);
      if (selectedPatientId === patientId && remaining.length > 0) {
        setSelectedPatientId(remaining[0].id);
      }
      return remaining;
    });

    // 2. Remove matching user account from systemUsers (strict match by patientId or target username)
    setSystemUsers(prev => prev.filter(u => 
      u.patientId !== patientId &&
      u.id !== patientId &&
      (targetPatient.username ? (u.username || '').toLowerCase() !== targetPatient.username.toLowerCase() : true)
    ));

    // 3. Remove appointments
    setAppointments(prev => prev.filter(a => 
      a.patientId !== patientId && 
      a.patientName !== targetPatient.fullName &&
      (targetPatient.mrn ? a.mrn !== targetPatient.mrn : true)
    ));

    // 4. Send to backend REST API
    try {
      await api.deletePatient(patientId, currentUser?.fullName);
    } catch (e) {}

    // 5. Log HIPAA audit trail
    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser?.fullName || 'Administrator',
      action: 'PATIENT_DELETED',
      details: `Permanently removed patient record: ${targetPatient.fullName} (${targetPatient.mrn})`
    }, ...prev]);

    showToast(`Patient ${targetPatient.fullName} (${targetPatient.mrn}) removed from system.`, 'info');
  };

  const removeSystemUser = async (userId) => {
    const target = systemUsers.find(u => u.id === userId);
    if (!target) return;

    // 1. Remove from systemUsers
    setSystemUsers(prev => prev.filter(u => u.id !== userId));

    // 2. If this account is a patient, remove ONLY the matching patient record (by username, name, or patientId)
    if (target.role === 'Patient' || target.patientId) {
      setPatients(prev => {
        const remaining = prev.filter(p => {
          const isSameId = target.patientId && p.id === target.patientId;
          const isSameUsername = target.username && p.username && p.username.toLowerCase() === target.username.toLowerCase();
          const isSameName = target.name && p.fullName && p.fullName.toLowerCase() === target.name.toLowerCase();
          return !(isSameId || isSameUsername || isSameName);
        });
        if (remaining.length > 0 && !remaining.some(p => p.id === selectedPatientId)) {
          setSelectedPatientId(remaining[0].id);
        }
        return remaining;
      });

      setAppointments(prev => prev.filter(a => 
        (target.patientId ? a.patientId !== target.patientId : true) && 
        (target.name ? a.patientName !== target.name : true)
      ));
    }

    try {
      await api.deleteUser(userId);
    } catch (err) {}

    setAuditLogs(prev => [{
      id: prev.length + 901,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.fullName,
      action: 'USER_REMOVED',
      details: `Removed user account: ${target.name} (${target.role})`
    }, ...prev]);

    showToast(`User ${target.name} has been removed from system.`, 'info');
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

  // Self-Healing: Reset all system users, patients, and clinical records to clean factory defaults
  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_PATIENTS);
      localStorage.removeItem(STORAGE_KEY_DELETED_PATIENTS);
      localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
      localStorage.removeItem(STORAGE_KEY_REPORTS);
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_ENCOUNTERS);
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      localStorage.removeItem(STORAGE_KEY_PRESCRIPTIONS);
    } catch (e) {}
    setSystemUsers(initialSystemUsers);
    setPatients(initialPatients);
    setAppointments(initialAppointments);
    setAuditLogs(initialAuditLogs);
    setReports(initialReports);
    setEncountersMap(initialEncounters);
    setOrders(initialOrders);
    setPrescriptions(initialPrescriptions);
    setCurrentUser(defaultPersonas.ROLE_DOCTOR);
    setSelectedPatientId(1);
    setIsAuthenticated(false);
    showToast('System demo data successfully restored to factory defaults.', 'success');
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
        resetDemoData,
        patients,
        selectedPatient,
        setSelectedPatientId,
        registerPatient,
        removePatient,
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
        adminUpdateUser,
        auditLogs,
        toast,
        showToast,
      }}
    >
      {children}
    </EhrContext.Provider>
  );
};
