import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
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
    { id: 108, name: 'Aisha Patel', fullName: 'Aisha Patel', username: 'patient1', password: 'Patient#2026', email: 'patient1@careconnect.org', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Yesterday, 04:20 PM', patientId: 77, mrn: 'MRN-2026-0077' },
    { id: 109, name: 'Rahul Verma', fullName: 'Rahul Verma', username: 'patient2', password: 'Patient#2026', email: 'rahul.verma@example.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 27, 2026', patientId: 88, mrn: 'MRN-2026-0088' },
    { id: 110, name: 'Robert Chen', fullName: 'Robert Chen', username: 'robert_c', password: 'password123', email: 'robert.chen@gmail.com', role: 'Patient', roleLabel: 'Patient', department: 'Outpatient', status: 'Active', lastLogin: 'Sep 25, 2026', patientId: 3, mrn: 'MRN-2026-0104' },
    { id: 111, name: 'Dr. Michael Chang, MD', fullName: 'Dr. Michael Chang, MD', username: 'dr_chang', password: 'password123', email: 'dr.chang@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Cardiology & Preventive Medicine', status: 'Active', lastLogin: 'Today, 09:30 AM' },
    { id: 112, name: 'Dr. Emily Davis, MD', fullName: 'Dr. Emily Davis, MD', username: 'dr_emily', password: 'password123', email: 'dr.emily@careconnect.org', role: 'Doctor', roleLabel: 'Doctor / Physician', department: 'Family & General Practice', status: 'Active', lastLogin: 'Today, 09:30 AM' },
  ];

  // Initial Seed Patients Data (60+ Clinical Records)
  const initialPatients = [
    {
      id: 1,
      mrn: 'MRN-2026-0042',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      username: 'john_doe',
      email: 'john.doe@careconnect.org',
      dateOfBirth: '1985-04-12',
      age: 41,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 234-5678',
      contactPhone: '+1 (555) 234-5678',
      allergies: 'Penicillin, NSAIDs (Aspirin/Ibuprofen)',
      emergencyContact: 'Jane Doe (Wife) - +1 (555) 234-5679',
      room: 'Exam Room 1',
      status: 'In Consultation',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 2,
      mrn: 'MRN-2026-0089',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      fullName: 'Maria Gonzalez',
      username: 'maria_gonzalez',
      email: 'maria.gonzalez@careconnect.org',
      dateOfBirth: '1968-11-23',
      age: 57,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 876-5432',
      contactPhone: '+1 (555) 876-5432',
      allergies: 'Sulfa Antibiotics',
      emergencyContact: 'Carlos (Son) - +1 (555) 876-5430',
      room: 'Exam Room 1',
      status: 'Scheduled',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 3,
      mrn: 'MRN-2026-0104',
      firstName: 'Robert',
      lastName: 'Chen',
      fullName: 'Robert Chen',
      username: 'robert_chen',
      email: 'robert.chen@careconnect.org',
      dateOfBirth: '1995-07-08',
      age: 31,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 456-7890',
      contactPhone: '+1 (555) 456-7890',
      allergies: 'None (NKDA)',
      emergencyContact: 'Lin Chen - +1 (555) 456-7891',
      room: 'Exam Room 1',
      status: 'Discharged',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 4,
      mrn: 'MRN-2026-5565',
      firstName: 'David',
      lastName: 'Miller',
      fullName: 'David Miller',
      username: 'david_miller',
      email: 'david.miller@careconnect.org',
      dateOfBirth: '1976-02-14',
      age: 50,
      gender: 'Male',
      bloodGroup: 'A-',
      phone: '+1 (555) 312-4567',
      contactPhone: '+1 (555) 312-4567',
      allergies: 'Codeine, Morphine',
      emergencyContact: 'Sarah Miller (Wife) - +1 (555) 312-4560',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 5,
      mrn: 'MRN-2026-9236',
      firstName: 'Priya',
      lastName: 'Sharma',
      fullName: 'Priya Sharma',
      username: 'priya_sharma',
      email: 'priya.sharma@careconnect.org',
      dateOfBirth: '1990-08-22',
      age: 36,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 654-7891',
      contactPhone: '+1 (555) 654-7891',
      allergies: 'None (NKDA)',
      emergencyContact: 'Amit Sharma (Husband) - +1 (555) 654-7890',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 6,
      mrn: 'MRN-2026-8732',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      fullName: 'Carlos Rodriguez',
      username: 'carlos_rodriguez',
      email: 'carlos.rodriguez@careconnect.org',
      dateOfBirth: '1982-12-05',
      age: 43,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1 (555) 987-1234',
      contactPhone: '+1 (555) 987-1234',
      allergies: 'Amoxicillin',
      emergencyContact: 'Elena Rodriguez (Sister) - +1 (555) 987-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 7,
      mrn: 'MRN-2026-8823',
      firstName: 'Emily',
      lastName: 'Taylor',
      fullName: 'Emily Taylor',
      username: 'emily_taylor',
      email: 'emily.taylor@careconnect.org',
      dateOfBirth: '1998-05-19',
      age: 28,
      gender: 'Female',
      bloodGroup: 'B-',
      phone: '+1 (555) 432-8765',
      contactPhone: '+1 (555) 432-8765',
      allergies: 'Peanuts, Tree Nuts',
      emergencyContact: 'Mark Taylor (Father) - +1 (555) 432-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 8,
      mrn: 'MRN-2026-9403',
      firstName: 'James',
      lastName: 'Anderson',
      fullName: 'James Anderson',
      username: 'james_anderson',
      email: 'james.anderson@careconnect.org',
      dateOfBirth: '1961-09-17',
      age: 65,
      gender: 'Male',
      bloodGroup: 'AB-',
      phone: '+1 (555) 876-2345',
      contactPhone: '+1 (555) 876-2345',
      allergies: 'Aspirin, Contrast Dye',
      emergencyContact: 'Linda Anderson (Spouse) - +1 (555) 876-2340',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 9,
      mrn: 'MRN-2026-9274',
      firstName: 'Fatima',
      lastName: 'Khan',
      fullName: 'Fatima Khan',
      username: 'fatima_khan',
      email: 'fatima.khan@careconnect.org',
      dateOfBirth: '1993-11-04',
      age: 32,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 543-9876',
      contactPhone: '+1 (555) 543-9876',
      allergies: 'None (NKDA)',
      emergencyContact: 'Tariq Khan (Brother) - +1 (555) 543-9870',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 10,
      mrn: 'MRN-2026-9207',
      firstName: 'Michael',
      lastName: 'Brown',
      fullName: 'Michael Brown',
      username: 'michael_brown',
      email: 'michael.brown@careconnect.org',
      dateOfBirth: '1979-04-29',
      age: 47,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 219-8765',
      contactPhone: '+1 (555) 219-8765',
      allergies: 'Ciprofloxacin',
      emergencyContact: 'Susan Brown (Wife) - +1 (555) 219-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 11,
      mrn: 'MRN-2026-8260',
      firstName: 'Sunita',
      lastName: 'Gupta',
      fullName: 'Sunita Gupta',
      username: 'sunita_gupta',
      email: 'sunita.gupta@careconnect.org',
      dateOfBirth: '1984-06-11',
      age: 42,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+1 (555) 678-1239',
      contactPhone: '+1 (555) 678-1239',
      allergies: 'Penicillin',
      emergencyContact: 'Rajesh Gupta (Husband) - +1 (555) 678-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 12,
      mrn: 'MRN-2026-7765',
      firstName: 'William',
      lastName: 'Wilson',
      fullName: 'William Wilson',
      username: 'william_wilson',
      email: 'william.wilson@careconnect.org',
      dateOfBirth: '1955-03-08',
      age: 71,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '+1 (555) 789-6543',
      contactPhone: '+1 (555) 789-6543',
      allergies: 'Sulfa Drugs',
      emergencyContact: 'Dorothy Wilson (Wife) - +1 (555) 789-6540',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 13,
      mrn: 'MRN-2026-1322',
      firstName: 'Ananya',
      lastName: 'Reddy',
      fullName: 'Ananya Reddy',
      username: 'ananya_reddy',
      email: 'ananya.reddy@careconnect.org',
      dateOfBirth: '2001-01-25',
      age: 25,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 890-4321',
      contactPhone: '+1 (555) 890-4321',
      allergies: 'None (NKDA)',
      emergencyContact: 'Kavitha Reddy (Mother) - +1 (555) 890-4320',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 14,
      mrn: 'MRN-2026-9151',
      firstName: 'Thomas',
      lastName: 'Martinez',
      fullName: 'Thomas Martinez',
      username: 'thomas_martinez',
      email: 'thomas.martinez@careconnect.org',
      dateOfBirth: '1973-10-18',
      age: 52,
      gender: 'Male',
      bloodGroup: 'B-',
      phone: '+1 (555) 345-8765',
      contactPhone: '+1 (555) 345-8765',
      allergies: 'Ibuprofen, Naproxen',
      emergencyContact: 'Maria Martinez (Wife) - +1 (555) 345-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 15,
      mrn: 'MRN-2026-1199',
      firstName: 'Sofia',
      lastName: 'Rossi',
      fullName: 'Sofia Rossi',
      username: 'sofia_rossi',
      email: 'sofia.rossi@careconnect.org',
      dateOfBirth: '1996-07-30',
      age: 30,
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '+1 (555) 901-2345',
      contactPhone: '+1 (555) 901-2345',
      allergies: 'Latex, Shellfish',
      emergencyContact: 'Marco Rossi (Father) - +1 (555) 901-2340',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 16,
      mrn: 'MRN-2026-5255',
      firstName: 'Liam',
      lastName: 'Johnson',
      fullName: 'Liam Johnson',
      username: 'liam_johnson',
      email: 'liam.johnson@careconnect.org',
      dateOfBirth: '1989-12-14',
      age: 36,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1 (555) 456-1238',
      contactPhone: '+1 (555) 456-1238',
      allergies: 'None (NKDA)',
      emergencyContact: 'Emma Johnson (Wife) - +1 (555) 456-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 17,
      mrn: 'MRN-2026-1332',
      firstName: 'Meera',
      lastName: 'Nair',
      fullName: 'Meera Nair',
      username: 'meera_nair',
      email: 'meera.nair@careconnect.org',
      dateOfBirth: '1981-05-02',
      age: 45,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 789-9876',
      contactPhone: '+1 (555) 789-9876',
      allergies: 'Cephalosporins',
      emergencyContact: 'Gopal Nair (Spouse) - +1 (555) 789-9870',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 18,
      mrn: 'MRN-2026-2575',
      firstName: 'Daniel',
      lastName: 'Davis',
      fullName: 'Daniel Davis',
      username: 'daniel_davis',
      email: 'daniel.davis@careconnect.org',
      dateOfBirth: '1967-08-20',
      age: 59,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 234-8765',
      contactPhone: '+1 (555) 234-8765',
      allergies: 'Penicillin',
      emergencyContact: 'Barbara Davis (Wife) - +1 (555) 234-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 19,
      mrn: 'MRN-2026-7926',
      firstName: 'Jessica',
      lastName: 'White',
      fullName: 'Jessica White',
      username: 'jessica_white',
      email: 'jessica.white@careconnect.org',
      dateOfBirth: '1994-02-17',
      age: 32,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+1 (555) 890-7654',
      contactPhone: '+1 (555) 890-7654',
      allergies: 'None (NKDA)',
      emergencyContact: 'Kevin White (Brother) - +1 (555) 890-7650',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 20,
      mrn: 'MRN-2026-5660',
      firstName: 'Rohan',
      lastName: 'Joshi',
      fullName: 'Rohan Joshi',
      username: 'rohan_joshi',
      email: 'rohan.joshi@careconnect.org',
      dateOfBirth: '1987-11-09',
      age: 38,
      gender: 'Male',
      bloodGroup: 'A-',
      phone: '+1 (555) 678-5432',
      contactPhone: '+1 (555) 678-5432',
      allergies: 'Tetracycline',
      emergencyContact: 'Neha Joshi (Wife) - +1 (555) 678-5430',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 21,
      mrn: 'MRN-2026-3404',
      firstName: 'Olivia',
      lastName: 'Martin',
      fullName: 'Olivia Martin',
      username: 'olivia_martin',
      email: 'olivia.martin@careconnect.org',
      dateOfBirth: '2000-09-03',
      age: 26,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 321-6547',
      contactPhone: '+1 (555) 321-6547',
      allergies: 'Iodine, Shellfish',
      emergencyContact: 'Paul Martin (Father) - +1 (555) 321-6540',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 22,
      mrn: 'MRN-2026-5497',
      firstName: 'Benjamin',
      lastName: 'Clark',
      fullName: 'Benjamin Clark',
      username: 'benjamin_clark',
      email: 'benjamin.clark@careconnect.org',
      dateOfBirth: '1970-04-15',
      age: 56,
      gender: 'Male',
      bloodGroup: 'AB+',
      phone: '+1 (555) 987-6541',
      contactPhone: '+1 (555) 987-6541',
      allergies: 'Metformin intolerance',
      emergencyContact: 'Nancy Clark (Wife) - +1 (555) 987-6540',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 23,
      mrn: 'MRN-2026-3200',
      firstName: 'Chloe',
      lastName: 'Kim',
      fullName: 'Chloe Kim',
      username: 'chloe_kim',
      email: 'chloe.kim@careconnect.org',
      dateOfBirth: '1997-06-28',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B-',
      phone: '+1 (555) 456-3219',
      contactPhone: '+1 (555) 456-3219',
      allergies: 'None (NKDA)',
      emergencyContact: 'Grace Kim (Sister) - +1 (555) 456-3210',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 24,
      mrn: 'MRN-2026-2301',
      firstName: 'Ethan',
      lastName: 'Lewis',
      fullName: 'Ethan Lewis',
      username: 'ethan_lewis',
      email: 'ethan.lewis@careconnect.org',
      dateOfBirth: '1983-03-22',
      age: 43,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1 (555) 789-2134',
      contactPhone: '+1 (555) 789-2134',
      allergies: 'Amoxicillin, Clavulanate',
      emergencyContact: 'Karen Lewis (Wife) - +1 (555) 789-2130',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 25,
      mrn: 'MRN-2026-2615',
      firstName: 'Maya',
      lastName: 'Desai',
      fullName: 'Maya Desai',
      username: 'maya_desai',
      email: 'maya.desai@careconnect.org',
      dateOfBirth: '1991-10-12',
      age: 34,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 234-9012',
      contactPhone: '+1 (555) 234-9012',
      allergies: 'Sulfa Antibiotics',
      emergencyContact: 'Vikram Desai (Brother) - +1 (555) 234-9010',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 26,
      mrn: 'MRN-2026-2620',
      firstName: 'Alexander',
      lastName: 'Hall',
      fullName: 'Alexander Hall',
      username: 'alexander_hall',
      email: 'alexander.hall@careconnect.org',
      dateOfBirth: '1964-01-19',
      age: 62,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 890-1234',
      contactPhone: '+1 (555) 890-1234',
      allergies: 'Ace Inhibitors (Enalapril)',
      emergencyContact: 'Margaret Hall (Wife) - +1 (555) 890-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 27,
      mrn: 'MRN-2026-1637',
      firstName: 'Grace',
      lastName: 'Allen',
      fullName: 'Grace Allen',
      username: 'grace_allen',
      email: 'grace.allen@careconnect.org',
      dateOfBirth: '1986-07-14',
      age: 40,
      gender: 'Female',
      bloodGroup: 'AB-',
      phone: '+1 (555) 678-9012',
      contactPhone: '+1 (555) 678-9012',
      allergies: 'None (NKDA)',
      emergencyContact: 'Robert Allen (Husband) - +1 (555) 678-9010',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 28,
      mrn: 'MRN-2026-9224',
      firstName: 'Lucas',
      lastName: 'Young',
      fullName: 'Lucas Young',
      username: 'lucas_young',
      email: 'lucas.young@careconnect.org',
      dateOfBirth: '1993-04-05',
      age: 33,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 345-1239',
      contactPhone: '+1 (555) 345-1239',
      allergies: 'Codeine',
      emergencyContact: 'Rachel Young (Mother) - +1 (555) 345-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 29,
      mrn: 'MRN-2026-7781',
      firstName: 'Sneha',
      lastName: 'Mehta',
      fullName: 'Sneha Mehta',
      username: 'sneha_mehta',
      email: 'sneha.mehta@careconnect.org',
      dateOfBirth: '1989-08-16',
      age: 37,
      gender: 'Female',
      bloodGroup: 'A-',
      phone: '+1 (555) 901-8765',
      contactPhone: '+1 (555) 901-8765',
      allergies: 'Latex, Nickel',
      emergencyContact: 'Karan Mehta (Husband) - +1 (555) 901-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 30,
      mrn: 'MRN-2026-1974',
      firstName: 'Noah',
      lastName: 'King',
      fullName: 'Noah King',
      username: 'noah_king',
      email: 'noah.king@careconnect.org',
      dateOfBirth: '1978-12-29',
      age: 47,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 567-4321',
      contactPhone: '+1 (555) 567-4321',
      allergies: 'Penicillin',
      emergencyContact: 'Hannah King (Wife) - +1 (555) 567-4320',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 31,
      mrn: 'MRN-2026-1133',
      firstName: 'Isabella',
      lastName: 'Wright',
      fullName: 'Isabella Wright',
      username: 'isabella_wright',
      email: 'isabella.wright@careconnect.org',
      dateOfBirth: '1999-03-11',
      age: 27,
      gender: 'Female',
      bloodGroup: 'O-',
      phone: '+1 (555) 234-5432',
      contactPhone: '+1 (555) 234-5432',
      allergies: 'None (NKDA)',
      emergencyContact: 'Donna Wright (Mother) - +1 (555) 234-5430',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 32,
      mrn: 'MRN-2026-6961',
      firstName: 'Arjun',
      lastName: 'Roy',
      fullName: 'Arjun Roy',
      username: 'arjun_roy',
      email: 'arjun.roy@careconnect.org',
      dateOfBirth: '1980-05-24',
      age: 46,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '+1 (555) 890-6789',
      contactPhone: '+1 (555) 890-6789',
      allergies: 'Aspirin',
      emergencyContact: 'Deepa Roy (Wife) - +1 (555) 890-6780',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 33,
      mrn: 'MRN-2026-1073',
      firstName: 'Zoe',
      lastName: 'Scott',
      fullName: 'Zoe Scott',
      username: 'zoe_scott',
      email: 'zoe.scott@careconnect.org',
      dateOfBirth: '1995-11-19',
      age: 30,
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '+1 (555) 456-7892',
      contactPhone: '+1 (555) 456-7892',
      allergies: 'Bactrim, Septra',
      emergencyContact: 'James Scott (Father) - +1 (555) 456-7890',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 34,
      mrn: 'MRN-2026-7170',
      firstName: 'Samuel',
      lastName: 'Green',
      fullName: 'Samuel Green',
      username: 'samuel_green',
      email: 'samuel.green@careconnect.org',
      dateOfBirth: '1969-09-08',
      age: 57,
      gender: 'Male',
      bloodGroup: 'B-',
      phone: '+1 (555) 789-3456',
      contactPhone: '+1 (555) 789-3456',
      allergies: 'None (NKDA)',
      emergencyContact: 'Patricia Green (Wife) - +1 (555) 789-3450',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 35,
      mrn: 'MRN-2026-7664',
      firstName: 'Layla',
      lastName: 'Baker',
      fullName: 'Layla Baker',
      username: 'layla_baker',
      email: 'layla.baker@careconnect.org',
      dateOfBirth: '2002-02-14',
      age: 24,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 321-9876',
      contactPhone: '+1 (555) 321-9876',
      allergies: 'Penicillin, Ampicillin',
      emergencyContact: 'Samir Baker (Father) - +1 (555) 321-9870',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 36,
      mrn: 'MRN-2026-8234',
      firstName: 'Henry',
      lastName: 'Adams',
      fullName: 'Henry Adams',
      username: 'henry_adams',
      email: 'henry.adams@careconnect.org',
      dateOfBirth: '1972-06-30',
      age: 54,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '+1 (555) 987-4321',
      contactPhone: '+1 (555) 987-4321',
      allergies: 'Morphine',
      emergencyContact: 'Laura Adams (Wife) - +1 (555) 987-4320',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 37,
      mrn: 'MRN-2026-5849',
      firstName: 'Harper',
      lastName: 'Nelson',
      fullName: 'Harper Nelson',
      username: 'harper_nelson',
      email: 'harper.nelson@careconnect.org',
      dateOfBirth: '1992-01-21',
      age: 34,
      gender: 'Female',
      bloodGroup: 'O-',
      phone: '+1 (555) 654-3218',
      contactPhone: '+1 (555) 654-3218',
      allergies: 'None (NKDA)',
      emergencyContact: 'Brian Nelson (Husband) - +1 (555) 654-3210',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 38,
      mrn: 'MRN-2026-2724',
      firstName: 'Sebastian',
      lastName: 'Hill',
      fullName: 'Sebastian Hill',
      username: 'sebastian_hill',
      email: 'sebastian.hill@careconnect.org',
      dateOfBirth: '1984-10-07',
      age: 41,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 432-1987',
      contactPhone: '+1 (555) 432-1987',
      allergies: 'Sulfa Antibiotics',
      emergencyContact: 'Claire Hill (Sister) - +1 (555) 432-1980',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 39,
      mrn: 'MRN-2026-6378',
      firstName: 'Amara',
      lastName: 'Campbell',
      fullName: 'Amara Campbell',
      username: 'amara_campbell',
      email: 'amara.campbell@careconnect.org',
      dateOfBirth: '1987-04-18',
      age: 39,
      gender: 'Female',
      bloodGroup: 'A-',
      phone: '+1 (555) 876-5439',
      contactPhone: '+1 (555) 876-5439',
      allergies: 'Erythromycin',
      emergencyContact: 'David Campbell (Husband) - +1 (555) 876-5430',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 40,
      mrn: 'MRN-2026-6401',
      firstName: 'Victor',
      lastName: 'Mitchell',
      fullName: 'Victor Mitchell',
      username: 'victor_mitchell',
      email: 'victor.mitchell@careconnect.org',
      dateOfBirth: '1965-11-26',
      age: 60,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 543-2198',
      contactPhone: '+1 (555) 543-2198',
      allergies: 'Cefazolin',
      emergencyContact: 'Helen Mitchell (Wife) - +1 (555) 543-2190',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 41,
      mrn: 'MRN-2026-1668',
      firstName: 'Evelyn',
      lastName: 'Roberts',
      fullName: 'Evelyn Roberts',
      username: 'evelyn_roberts',
      email: 'evelyn.roberts@careconnect.org',
      dateOfBirth: '1994-08-09',
      age: 32,
      gender: 'Female',
      bloodGroup: 'AB-',
      phone: '+1 (555) 219-4567',
      contactPhone: '+1 (555) 219-4567',
      allergies: 'None (NKDA)',
      emergencyContact: 'George Roberts (Father) - +1 (555) 219-4560',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 42,
      mrn: 'MRN-2026-7871',
      firstName: 'Deepak',
      lastName: 'Carter',
      fullName: 'Deepak Carter',
      username: 'deepak_carter',
      email: 'deepak.carter@careconnect.org',
      dateOfBirth: '1981-01-15',
      age: 45,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 765-8901',
      contactPhone: '+1 (555) 765-8901',
      allergies: 'Clindamycin',
      emergencyContact: 'Sunita Carter (Wife) - +1 (555) 765-8900',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 43,
      mrn: 'MRN-2026-7644',
      firstName: 'Natalie',
      lastName: 'Phillips',
      fullName: 'Natalie Phillips',
      username: 'natalie_phillips',
      email: 'natalie.phillips@careconnect.org',
      dateOfBirth: '1998-12-03',
      age: 27,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 321-4569',
      contactPhone: '+1 (555) 321-4569',
      allergies: 'Latex',
      emergencyContact: 'Thomas Phillips (Father) - +1 (555) 321-4560',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 44,
      mrn: 'MRN-2026-3910',
      firstName: 'Gabriel',
      lastName: 'Evans',
      fullName: 'Gabriel Evans',
      username: 'gabriel_evans',
      email: 'gabriel.evans@careconnect.org',
      dateOfBirth: '1975-07-27',
      age: 51,
      gender: 'Male',
      bloodGroup: 'A+',
      phone: '+1 (555) 987-2134',
      contactPhone: '+1 (555) 987-2134',
      allergies: 'Penicillin, Cephalexin',
      emergencyContact: 'Martha Evans (Wife) - +1 (555) 987-2130',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 45,
      mrn: 'MRN-2026-3754',
      firstName: 'Tara',
      lastName: 'Turner',
      fullName: 'Tara Turner',
      username: 'tara_turner',
      email: 'tara.turner@careconnect.org',
      dateOfBirth: '1990-03-09',
      age: 36,
      gender: 'Female',
      bloodGroup: 'B-',
      phone: '+1 (555) 654-7893',
      contactPhone: '+1 (555) 654-7893',
      allergies: 'None (NKDA)',
      emergencyContact: 'Siddharth Turner (Brother) - +1 (555) 654-7890',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 46,
      mrn: 'MRN-2026-2563',
      firstName: 'Adrian',
      lastName: 'Torres',
      fullName: 'Adrian Torres',
      username: 'adrian_torres',
      email: 'adrian.torres@careconnect.org',
      dateOfBirth: '1983-09-14',
      age: 43,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1 (555) 432-6548',
      contactPhone: '+1 (555) 432-6548',
      allergies: 'Sulfa Drugs',
      emergencyContact: 'Sofia Torres (Wife) - +1 (555) 432-6540',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 47,
      mrn: 'MRN-2026-4796',
      firstName: 'Mia',
      lastName: 'Parker',
      fullName: 'Mia Parker',
      username: 'mia_parker',
      email: 'mia.parker@careconnect.org',
      dateOfBirth: '2001-05-20',
      age: 25,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 876-1239',
      contactPhone: '+1 (555) 876-1239',
      allergies: 'Peanuts',
      emergencyContact: 'Jonathan Parker (Father) - +1 (555) 876-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 48,
      mrn: 'MRN-2026-7360',
      firstName: 'Ryan',
      lastName: 'Collins',
      fullName: 'Ryan Collins',
      username: 'ryan_collins',
      email: 'ryan.collins@careconnect.org',
      dateOfBirth: '1977-02-11',
      age: 49,
      gender: 'Male',
      bloodGroup: 'AB+',
      phone: '+1 (555) 543-8765',
      contactPhone: '+1 (555) 543-8765',
      allergies: 'None (NKDA)',
      emergencyContact: 'Jessica Collins (Wife) - +1 (555) 543-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 49,
      mrn: 'MRN-2026-5744',
      firstName: 'Leela',
      lastName: 'Edwards',
      fullName: 'Leela Edwards',
      username: 'leela_edwards',
      email: 'leela.edwards@careconnect.org',
      dateOfBirth: '1988-06-25',
      age: 38,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 219-6543',
      contactPhone: '+1 (555) 219-6543',
      allergies: 'Aspirin, NSAIDs',
      emergencyContact: 'Anand Edwards (Spouse) - +1 (555) 219-6540',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 50,
      mrn: 'MRN-2026-2696',
      firstName: 'Matthew',
      lastName: 'Stewart',
      fullName: 'Matthew Stewart',
      username: 'matthew_stewart',
      email: 'matthew.stewart@careconnect.org',
      dateOfBirth: '1963-10-04',
      age: 62,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 765-4321',
      contactPhone: '+1 (555) 765-4321',
      allergies: 'Hydrocodone',
      emergencyContact: 'Carol Stewart (Wife) - +1 (555) 765-4320',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 51,
      mrn: 'MRN-2026-3643',
      firstName: 'Sarah',
      lastName: 'Morris',
      fullName: 'Sarah Morris',
      username: 'sarah_morris',
      email: 'sarah.morris@careconnect.org',
      dateOfBirth: '1996-03-18',
      age: 30,
      gender: 'Female',
      bloodGroup: 'A-',
      phone: '+1 (555) 321-7890',
      contactPhone: '+1 (555) 321-7890',
      allergies: 'None (NKDA)',
      emergencyContact: 'Philip Morris (Brother) - +1 (555) 321-7890',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 52,
      mrn: 'MRN-2026-3273',
      firstName: 'Anil',
      lastName: 'Kumar',
      fullName: 'Anil Kumar',
      username: 'anil_kumar',
      email: 'anil.kumar@careconnect.org',
      dateOfBirth: '1982-08-14',
      age: 44,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 345-6711',
      contactPhone: '+1 (555) 345-6711',
      allergies: 'None (NKDA)',
      emergencyContact: 'Sunita Kumar (Wife) - +1 (555) 345-6710',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 53,
      mrn: 'MRN-2026-3642',
      firstName: 'Jennifer',
      lastName: 'Lopez',
      fullName: 'Jennifer Lopez',
      username: 'jennifer_lopez',
      email: 'jennifer.lopez@careconnect.org',
      dateOfBirth: '1991-03-27',
      age: 35,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 789-1234',
      contactPhone: '+1 (555) 789-1234',
      allergies: 'Penicillin',
      emergencyContact: 'David Lopez (Husband) - +1 (555) 789-1230',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 54,
      mrn: 'MRN-2026-4683',
      firstName: 'Brandon',
      lastName: 'Taylor',
      fullName: 'Brandon Taylor',
      username: 'brandon_taylor',
      email: 'brandon.taylor@careconnect.org',
      dateOfBirth: '1986-11-12',
      age: 39,
      gender: 'Male',
      bloodGroup: 'B-',
      phone: '+1 (555) 456-9871',
      contactPhone: '+1 (555) 456-9871',
      allergies: 'None (NKDA)',
      emergencyContact: 'Sarah Taylor (Wife) - +1 (555) 456-9870',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 55,
      mrn: 'MRN-2026-7081',
      firstName: 'Ritu',
      lastName: 'Agarwal',
      fullName: 'Ritu Agarwal',
      username: 'ritu_agarwal',
      email: 'ritu.agarwal@careconnect.org',
      dateOfBirth: '1997-01-30',
      age: 29,
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '+1 (555) 890-2345',
      contactPhone: '+1 (555) 890-2345',
      allergies: 'Sulfa Drugs',
      emergencyContact: 'Manish Agarwal (Brother) - +1 (555) 890-2340',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 56,
      mrn: 'MRN-2026-4559',
      firstName: 'Jason',
      lastName: 'Reed',
      fullName: 'Jason Reed',
      username: 'jason_reed',
      email: 'jason.reed@careconnect.org',
      dateOfBirth: '1974-06-18',
      age: 52,
      gender: 'Male',
      bloodGroup: 'O-',
      phone: '+1 (555) 678-3456',
      contactPhone: '+1 (555) 678-3456',
      allergies: 'Aspirin',
      emergencyContact: 'Emily Reed (Wife) - +1 (555) 678-3450',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 57,
      mrn: 'MRN-2026-8832',
      firstName: 'Divya',
      lastName: 'Srinivasan',
      fullName: 'Divya Srinivasan',
      username: 'divya_srinivasan',
      email: 'divya.srinivasan@careconnect.org',
      dateOfBirth: '1993-09-05',
      age: 33,
      gender: 'Female',
      bloodGroup: 'A-',
      phone: '+1 (555) 234-8901',
      contactPhone: '+1 (555) 234-8901',
      allergies: 'None (NKDA)',
      emergencyContact: 'Karthik Srinivasan (Spouse) - +1 (555) 234-8900',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 58,
      mrn: 'MRN-2026-1656',
      firstName: 'Christopher',
      lastName: 'Harris',
      fullName: 'Christopher Harris',
      username: 'christopher_harris',
      email: 'christopher.harris@careconnect.org',
      dateOfBirth: '1968-04-22',
      age: 58,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1 (555) 876-4321',
      contactPhone: '+1 (555) 876-4321',
      allergies: 'Codeine',
      emergencyContact: 'Carol Harris (Wife) - +1 (555) 876-4320',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 59,
      mrn: 'MRN-2026-4835',
      firstName: 'Fatima',
      lastName: 'Zahra',
      fullName: 'Fatima Zahra',
      username: 'fatima_zahra',
      email: 'fatima.zahra@careconnect.org',
      dateOfBirth: '2000-12-11',
      age: 25,
      gender: 'Female',
      bloodGroup: 'O+',
      phone: '+1 (555) 543-6789',
      contactPhone: '+1 (555) 543-6789',
      allergies: 'Latex',
      emergencyContact: 'Omar Zahra (Father) - +1 (555) 543-6780',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 60,
      mrn: 'MRN-2026-2286',
      firstName: 'Andrew',
      lastName: 'Jackson',
      fullName: 'Andrew Jackson',
      username: 'andrew_jackson',
      email: 'andrew.jackson@careconnect.org',
      dateOfBirth: '1981-10-09',
      age: 44,
      gender: 'Male',
      bloodGroup: 'AB-',
      phone: '+1 (555) 321-8765',
      contactPhone: '+1 (555) 321-8765',
      allergies: 'None (NKDA)',
      emergencyContact: 'Beth Jackson (Wife) - +1 (555) 321-8760',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
    {
      id: 61,
      mrn: 'MRN-2026-6881',
      firstName: 'Pooja',
      lastName: 'Menon',
      fullName: 'Pooja Menon',
      username: 'pooja_menon',
      email: 'pooja.menon@careconnect.org',
      dateOfBirth: '1995-02-19',
      age: 31,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 987-5432',
      contactPhone: '+1 (555) 987-5432',
      allergies: 'Amoxicillin',
      emergencyContact: 'Rahul Menon (Husband) - +1 (555) 987-5430',
      room: 'Exam Room 1',
      status: 'Admitted',
      registeredDate: 'Sep 29, 2026',
    },
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
      patientId: 77,
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

  // Self-Healing Auto-Migration: Decouple mock seed patients (Aisha Patel -> ID 77, Rahul Verma -> ID 88)
  // so their IDs NEVER collide with backend autoincrement primary keys (1, 2, 3, 4, 5...)
  const migrateMockIds = () => {
    try {
      const savedPatients = loadStorage(STORAGE_KEY_PATIENTS, null);
      if (savedPatients && Array.isArray(savedPatients)) {
        let changed = false;
        const cleaned = savedPatients.map(p => {
          if ((p.mrn === 'MRN-2026-0077' || p.username === 'patient1' || p.fullName === 'Aisha Patel') && Number(p.id) === 4) {
            changed = true;
            return { ...p, id: 77 };
          }
          if ((p.mrn === 'MRN-2026-0088' || p.username === 'patient2' || p.fullName === 'Rahul Verma') && Number(p.id) === 5) {
            changed = true;
            return { ...p, id: 88 };
          }
          return p;
        });
        if (changed) saveStorage(STORAGE_KEY_PATIENTS, cleaned);
      }

      const savedUsers = loadStorage(STORAGE_KEY_USERS, null);
      if (savedUsers && Array.isArray(savedUsers)) {
        let changed = false;
        const cleaned = savedUsers.map(u => {
          if ((u.mrn === 'MRN-2026-0077' || u.username === 'patient1' || u.name === 'Aisha Patel') && Number(u.patientId) === 4) {
            changed = true;
            return { ...u, patientId: 77 };
          }
          if ((u.mrn === 'MRN-2026-0088' || u.username === 'patient2' || u.name === 'Rahul Verma') && Number(u.patientId) === 5) {
            changed = true;
            return { ...u, patientId: 88 };
          }
          return u;
        });
        if (changed) saveStorage(STORAGE_KEY_USERS, cleaned);
      }

      const savedAppts = loadStorage(STORAGE_KEY_APPOINTMENTS, null);
      if (savedAppts && Array.isArray(savedAppts)) {
        let changed = false;
        const cleaned = savedAppts.map(a => {
          if ((a.mrn === 'MRN-2026-0077' || a.patientName === 'Aisha Patel') && Number(a.patientId) === 4) {
            changed = true;
            return { ...a, patientId: 77 };
          }
          if ((a.mrn === 'MRN-2026-0088' || a.patientName === 'Rahul Verma') && Number(a.patientId) === 5) {
            changed = true;
            return { ...a, patientId: 88 };
          }
          return a;
        });
        if (changed) saveStorage(STORAGE_KEY_APPOINTMENTS, cleaned);
      }

      const savedEnc = loadStorage(STORAGE_KEY_ENCOUNTERS, null);
      if (savedEnc && typeof savedEnc === 'object') {
        let changed = false;
        const updatedEnc = { ...savedEnc };
        if (updatedEnc['4'] && (updatedEnc['4'].soap?.subjective?.includes('Aisha') || updatedEnc['4'].chiefComplaint?.includes('Cardiovascular'))) {
          updatedEnc['77'] = { ...updatedEnc['4'], patientId: 77 };
          delete updatedEnc['4'];
          changed = true;
        }
        if (updatedEnc['5'] && (updatedEnc['5'].soap?.subjective?.includes('Rahul') || updatedEnc['5'].chiefComplaint?.includes('allergies'))) {
          updatedEnc['88'] = { ...updatedEnc['5'], patientId: 88 };
          delete updatedEnc['5'];
          changed = true;
        }
        if (changed) saveStorage(STORAGE_KEY_ENCOUNTERS, updatedEnc);
      }

      const savedRx = loadStorage(STORAGE_KEY_PRESCRIPTIONS, null);
      if (savedRx && Array.isArray(savedRx)) {
        let changed = false;
        const cleaned = savedRx.map(r => {
          if (r.name?.includes('Vitamin D3') && Number(r.patientId) === 4) {
            changed = true;
            return { ...r, patientId: 77, mrn: 'MRN-2026-0077' };
          }
          if (r.name?.includes('Cetirizine') && Number(r.patientId) === 5) {
            changed = true;
            return { ...r, patientId: 88, mrn: 'MRN-2026-0088' };
          }
          return r;
        });
        if (changed) saveStorage(STORAGE_KEY_PRESCRIPTIONS, cleaned);
      }

      const savedOrders = loadStorage(STORAGE_KEY_ORDERS, null);
      if (savedOrders && Array.isArray(savedOrders)) {
        let changed = false;
        const cleaned = savedOrders.map(o => {
          if (o.name?.includes('Lipid Panel') && Number(o.patientId) === 4) {
            changed = true;
            return { ...o, patientId: 77, mrn: 'MRN-2026-0077' };
          }
          return o;
        });
        if (changed) saveStorage(STORAGE_KEY_ORDERS, cleaned);
      }
    } catch (e) {}
  };
  migrateMockIds();

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

  // Dual Cloud Synchronizer: Synchronizes both Master Patient Index and User Credentials from Spring Boot backend
  const [isSyncing, setIsSyncing] = useState(false);

  const syncCloudData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const deletedMrnsList = loadStorage(STORAGE_KEY_DELETED_PATIENTS, []);
      const deletedMrnSet = new Set(deletedMrnsList.map(m => (m || '').toLowerCase()));

      const [cloudPatients, cloudUsers] = await Promise.all([
        api.getPatients().catch(() => null),
        api.getUsers().catch(() => null),
      ]);

      let finalPatientsList = [];

      // 1. Sync Patients from Cloud
      if (Array.isArray(cloudPatients) && cloudPatients.length > 0) {
        setPatients(prev => {
          let updated = [...prev];
          for (const cp of cloudPatients) {
            if (!cp.mrn || deletedMrnSet.has(cp.mrn.toLowerCase())) continue;

            const rawName = cp.fullName || `${cp.firstName || ''} ${cp.lastName || ''}`.trim() || 'Patient';
            const calcAge = cp.dateOfBirth ? calculateAgeFromDob(cp.dateOfBirth, cp.age || 30) : (cp.age || 30);
            const formattedCp = {
              ...cp,
              fullName: rawName,
              age: calcAge,
              contactPhone: cp.phone || cp.contactPhone || '',
            };

            // Match by MRN, or by identical phone and first name
            const idx = updated.findIndex(p => 
              (p.mrn && cp.mrn && p.mrn.toLowerCase() === cp.mrn.toLowerCase()) ||
              (p.id && cp.id && Number(p.id) === Number(cp.id)) ||
              (p.phone && cp.phone && p.phone === cp.phone && p.firstName && cp.firstName && p.firstName.toLowerCase() === cp.firstName.toLowerCase())
            );

            if (idx !== -1) {
              updated[idx] = { 
                ...updated[idx], 
                ...formattedCp,
                allergies: formattedCp.allergies || updated[idx].allergies,
                bloodGroup: formattedCp.bloodGroup || updated[idx].bloodGroup,
                gender: formattedCp.gender || updated[idx].gender,
              };
            } else {
              // Ensure no conflicting patientId with a different mock/local patient (e.g. 77, 88)
              const clashIdx = updated.findIndex(p => Number(p.id) === Number(formattedCp.id) && p.mrn !== formattedCp.mrn);
              if (clashIdx !== -1) {
                updated[clashIdx] = { ...updated[clashIdx], id: 7000 + Math.floor(Math.random() * 1000) };
              }
              updated.push(formattedCp);
            }
          }
          finalPatientsList = updated;
          return updated;
        });
      }

      // 2. Sync System Users from Cloud Users & Cloud Patients
      setSystemUsers(prev => {
        let updatedUsers = [...prev];

        // A. Merge Cloud Users from backend /api/v1/auth/users
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          for (const cu of cloudUsers) {
            const normUsername = (cu.username || '').toLowerCase().trim();
            if (!normUsername) continue;

            const normRole = cu.role === 'ROLE_PATIENT' ? 'Patient'
              : cu.role === 'ROLE_DOCTOR' ? 'Doctor'
              : cu.role === 'ROLE_ADMIN' ? 'Administrator'
              : (cu.role ? cu.role.replace(/^ROLE_/, '') : 'Patient');

            const normRoleLabel = normRole === 'Patient' ? 'Patient'
              : normRole === 'Doctor' ? 'Doctor / Physician'
              : 'System Administrator';

            // Find matching patient record
            const patientPool = finalPatientsList.length > 0 ? finalPatientsList : (loadStorage(STORAGE_KEY_PATIENTS, []) || []);
            const matchPatient = patientPool.find(p => 
              (p.username && p.username.toLowerCase() === normUsername) ||
              (p.phone && cu.phone && p.phone === cu.phone) ||
              (p.fullName && cu.fullName && p.fullName.toLowerCase() === cu.fullName.toLowerCase()) ||
              (p.firstName && cu.fullName && p.firstName.toLowerCase() === cu.fullName.toLowerCase())
            );

            const formattedUser = {
              id: cu.id,
              name: cu.fullName || cu.username,
              fullName: cu.fullName || cu.username,
              username: cu.username,
              password: cu.password || cu.passwordHash || 'password123',
              email: cu.email || `${normUsername}@careconnect.org`,
              phone: cu.phone || matchPatient?.phone || '',
              role: normRole,
              roleLabel: normRoleLabel,
              department: cu.department || (normRole === 'Patient' ? 'Outpatient' : 'Hospital Operations'),
              status: cu.active !== false ? 'Active' : 'Inactive',
              lastLogin: cu.createdAt ? new Date(cu.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Cloud Synced',
              patientId: matchPatient ? matchPatient.id : (normRole === 'Patient' ? cu.id : undefined),
              mrn: matchPatient ? matchPatient.mrn : undefined,
              dateOfBirth: matchPatient?.dateOfBirth,
              age: matchPatient?.age,
            };

            const existingIdx = updatedUsers.findIndex(u => 
              (u.username && u.username.toLowerCase() === normUsername) ||
              (u.email && cu.email && u.email.toLowerCase() === cu.email.toLowerCase())
            );

            if (existingIdx !== -1) {
              updatedUsers[existingIdx] = {
                ...updatedUsers[existingIdx],
                ...formattedUser,
                password: formattedUser.password || updatedUsers[existingIdx].password,
                mrn: formattedUser.mrn || updatedUsers[existingIdx].mrn,
                patientId: formattedUser.patientId || updatedUsers[existingIdx].patientId,
                name: formattedUser.name || updatedUsers[existingIdx].name,
                fullName: formattedUser.fullName || updatedUsers[existingIdx].fullName,
              };
            } else {
              updatedUsers.push(formattedUser);
            }
          }
        }

        // B. Ensure EVERY registered patient in Master Patient Index is also in systemUsers
        const patientPool = finalPatientsList.length > 0 ? finalPatientsList : (loadStorage(STORAGE_KEY_PATIENTS, []) || []);
        for (const p of patientPool) {
          if (!p.mrn || deletedMrnSet.has(p.mrn.toLowerCase())) continue;
          const pName = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
          const pUsername = (p.username || p.firstName || '').toLowerCase().replace(/[^a-z0-9]/g, '') || `patient_${p.id}`;

          const userExists = updatedUsers.some(u => 
            (u.mrn && u.mrn.toLowerCase() === p.mrn.toLowerCase()) ||
            (u.patientId && Number(u.patientId) === Number(p.id)) ||
            (u.username && u.username.toLowerCase() === pUsername) ||
            (p.phone && u.phone && u.phone === p.phone)
          );

          if (!userExists) {
            updatedUsers.push({
              id: 8000 + (Number(p.id) || Math.floor(Math.random() * 1000)),
              name: pName,
              fullName: pName,
              username: pUsername,
              password: 'Patient#2026',
              email: p.email || `${pUsername}@careconnect.org`,
              phone: p.phone,
              role: 'Patient',
              roleLabel: 'Patient',
              department: 'Outpatient',
              status: 'Active',
              lastLogin: 'Registered',
              patientId: p.id,
              mrn: p.mrn,
              dateOfBirth: p.dateOfBirth,
              age: p.age,
            });
          }
        }

        return updatedUsers;
      });
    } catch (e) {
      console.warn('Backend sync failed or offline:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync to backend on mount, window focus, visibility change, and periodic intervals
  useEffect(() => {
    syncCloudData();

    const handleFocus = () => {
      syncCloudData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncCloudData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Background sync polling every 25 seconds
    const interval = setInterval(() => {
      syncCloudData();
    }, 25000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [syncCloudData]);

  // Selected Patient - dynamically resolves to logged-in patient if in Patient Portal!
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    const saved = loadStorage(STORAGE_KEY_SELECTED_PATIENT, null);
    return saved !== null && saved !== undefined ? saved : 1;
  });

  useEffect(() => {
    saveStorage(STORAGE_KEY_SELECTED_PATIENT, selectedPatientId);
  }, [selectedPatientId]);

  const selectedPatient = useMemo(() => {
    const list = Array.isArray(patients) && patients.length > 0 ? patients : initialPatients;

    // 1. PATIENT PORTAL: Strictly bind to the authenticated patient's profile. NEVER FALL BACK TO JOHN DOE OR list[0]!
    if (currentUser && (currentUser.role === 'ROLE_PATIENT' || currentUser.role === 'Patient')) {
      const match = list.find(p => 
        (currentUser.mrn && p.mrn && p.mrn.toLowerCase() === currentUser.mrn.toLowerCase()) ||
        (currentUser.patientId && Number(p.id) === Number(currentUser.patientId)) ||
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

    // 2. DOCTOR / ADMIN PORTAL: Resolves to selectedPatientId (by MRN first, then numeric ID, then name)
    let active = list.find(p => 
      (selectedPatientId && p.mrn && String(p.mrn).trim().toLowerCase() === String(selectedPatientId).trim().toLowerCase()) ||
      (selectedPatientId && Number(p.id) === Number(selectedPatientId))
    );
    
    // BUG-03 FIX: If ID/MRN lookup fails (happens when appointment stores a local Date.now() ID
    // that differs from backend ID after cloud sync), try to find via the patientName stored in appointments
    if (!active && selectedPatientId) {
      const apptForId = appointments.find(a =>
        a.patientId === selectedPatientId ||
        String(a.mrn).toLowerCase() === String(selectedPatientId).toLowerCase()
      );
      if (apptForId && apptForId.patientName) {
        active = list.find(p =>
          (p.fullName && p.fullName.toLowerCase() === apptForId.patientName.toLowerCase()) ||
          (`${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === apptForId.patientName.toLowerCase())
        );
      }
    }
    
    active = active || list[0] || initialPatients[0];
    if (active) {
      const resolvedAge = active.dateOfBirth ? calculateAgeFromDob(active.dateOfBirth, active.age || 30) : (active.age || 30);
      return { ...active, age: resolvedAge };
    }
    return active;
  }, [patients, appointments, selectedPatientId, currentUser]);

  // Keep selectedPatientId in sync with the active patient in the patient portal
  useEffect(() => {
    if (currentUser && (currentUser.role === 'ROLE_PATIENT' || currentUser.role === 'Patient')) {
      const activeIdentifier = selectedPatient?.mrn || selectedPatient?.id;
      if (activeIdentifier && selectedPatientId !== activeIdentifier) {
        setSelectedPatientId(activeIdentifier);
      }
    }
  }, [currentUser, selectedPatient?.id, selectedPatient?.mrn, selectedPatientId]);

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
    77: {
      id: 1077,
      patientId: 77,
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
    88: {
      id: 1088,
      patientId: 88,
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
      patientId: 77,
      mrn: 'MRN-2026-0077',
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
      mrn: 'MRN-2026-0042',
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
      mrn: 'MRN-2026-0042',
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
      mrn: 'MRN-2026-0089',
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
      mrn: 'MRN-2026-0089',
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
      mrn: 'MRN-2026-0104',
      name: 'Multivitamin Complete Formula',
      dosage: '1 tablet',
      frequency: 'Once daily with meals',
      duration: '90 days',
      status: 'Active',
      override: null,
    },
    {
      id: 506,
      patientId: 77,
      mrn: 'MRN-2026-0077',
      name: 'Vitamin D3 (Cholecalciferol)',
      dosage: '2000 IU',
      frequency: 'Once daily in the morning',
      duration: '60 days',
      status: 'Active',
      override: null,
    },
    {
      id: 507,
      patientId: 88,
      mrn: 'MRN-2026-0088',
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
    const mrnKey = selectedPatient?.mrn;
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

    if (encountersMap && typeof encountersMap === 'object') {
      const e = (mrnKey && encountersMap[mrnKey]) || encountersMap[pid];
      if (e) {
        return {
          ...e,
          vitals: { ...defaultVitals, ...(e.vitals || {}) },
          soap: { ...defaultSoap, ...(e.soap || {}) },
        };
      }
    }
    return {
      id: 1000 + (typeof pid === 'number' ? pid : 1),
      patientId: pid,
      mrn: mrnKey,
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
  }, [encountersMap, selectedPatient?.id, selectedPatient?.mrn, selectedPatient?.firstName, selectedPatient?.lastName, currentUser]);

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

        // Also try to find the matching patient record in the MPI for full demographics
        const patientMatch = patients.find(p =>
          (localUserMatch?.mrn && p.mrn && p.mrn.toLowerCase() === localUserMatch.mrn.toLowerCase()) ||
          (localUserMatch?.patientId && Number(p.id) === Number(localUserMatch.patientId)) ||
          (beAuth.username && p.username && p.username.toLowerCase() === beAuth.username.toLowerCase()) ||
          (beAuth.fullName && p.fullName && p.fullName.toLowerCase() === beAuth.fullName.toLowerCase()) ||
          (beAuth.fullName && `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === beAuth.fullName.toLowerCase())
        );

        user = {
          id: beAuth.userId || (localUserMatch ? localUserMatch.id : 101),
          role: roleNormalized,
          roleLabel: roleNormalized === 'ROLE_PATIENT' ? 'Patient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Doctor / Physician' : 'System Administrator'),
          username: beAuth.username,
          fullName: beAuth.fullName || (localUserMatch ? localUserMatch.fullName : beAuth.username),
          email: (localUserMatch && localUserMatch.email) || (patientMatch && patientMatch.email) || `${beAuth.username}@careconnect.org`,
          department: roleNormalized === 'ROLE_PATIENT' ? 'Outpatient' : (roleNormalized === 'ROLE_DOCTOR' ? 'Clinical Care' : 'Hospital Administration'),
          // CRITICAL: Carry all patient identity fields so selectedPatient memo can find them after refresh
          patientId: localUserMatch?.patientId || patientMatch?.id || (roleNormalized === 'ROLE_PATIENT' ? beAuth.userId : undefined),
          mrn: localUserMatch?.mrn || patientMatch?.mrn || undefined,
          dateOfBirth: localUserMatch?.dateOfBirth || patientMatch?.dateOfBirth || undefined,
          age: localUserMatch?.age || patientMatch?.age || undefined,
          phone: localUserMatch?.phone || patientMatch?.phone || undefined,
          gender: localUserMatch?.gender || patientMatch?.gender || undefined,
          bloodGroup: localUserMatch?.bloodGroup || patientMatch?.bloodGroup || undefined,
          allergies: localUserMatch?.allergies || patientMatch?.allergies || undefined,
          emergencyContact: localUserMatch?.emergencyContact || patientMatch?.emergencyContact || undefined,
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
        // Carry full demographics so selectedPatient memo can identify patient after refresh
        dateOfBirth: found.dateOfBirth,
        age: found.age,
        phone: found.phone,
        gender: found.gender,
        bloodGroup: found.bloodGroup,
        allergies: found.allergies,
        emergencyContact: found.emergencyContact,
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
      if (myNextAppt && (myNextAppt.mrn || myNextAppt.patientId)) {
        setSelectedPatientId(myNextAppt.mrn || myNextAppt.patientId);
      } else {
        setSelectedPatientId(1);
      }
    }

    // If logging in as patient, update selectedPatientId to match their patient record!
    if (user.role === 'ROLE_PATIENT') {
      const match = patients.find(p => 
        (user.mrn && p.mrn && p.mrn.toLowerCase() === user.mrn.toLowerCase()) ||
        (user.patientId && Number(p.id) === Number(user.patientId)) ||
        (user.username && p.username && p.username.toLowerCase() === user.username.toLowerCase()) ||
        (user.email && p.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.fullName && p.fullName && p.fullName.toLowerCase() === user.fullName.toLowerCase()) ||
        (user.fullName && `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase() === user.fullName.toLowerCase())
      );
      const chosenPatientId = match ? (match.mrn || match.id) : (user.mrn || user.patientId || user.id);
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
    const encKey = selectedPatient?.mrn || selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[encKey] || prev[selectedPatient?.id] || encounter;
      return {
        ...prev,
        [encKey]: {
          ...cur,
          patientId: selectedPatient?.id || cur.patientId,
          mrn: selectedPatient?.mrn || cur.mrn,
          hasEncounter: true,
          vitals: { ...cur.vitals, ...newVitals },
        }
      };
    });
    showToast('Vitals saved successfully.', 'success');
  };

  const updateSoap = (newSoap) => {
    const encKey = selectedPatient?.mrn || selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[encKey] || prev[selectedPatient?.id] || encounter;
      return {
        ...prev,
        [encKey]: {
          ...cur,
          patientId: selectedPatient?.id || cur.patientId,
          mrn: selectedPatient?.mrn || cur.mrn,
          hasEncounter: true,
          soap: { ...cur.soap, ...newSoap },
        }
      };
    });
    showToast('Clinical notes updated.', 'info');
  };

  const signEncounter = () => {
    const encKey = selectedPatient?.mrn || selectedPatient?.id || 1;
    setEncountersMap(prev => {
      const cur = prev[encKey] || prev[selectedPatient?.id] || encounter;
      return {
        ...prev,
        [encKey]: {
          ...cur,
          patientId: selectedPatient?.id || cur.patientId,
          mrn: selectedPatient?.mrn || cur.mrn,
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
      mrn: selectedPatient.mrn,
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
      mrn: selectedPatient.mrn,
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
    const patientFullName = selectedPatient.fullName || `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}`.trim() || 'Patient';
    const newAppt = {
      ...appointmentData,
      id: newId,
      patientId: selectedPatient.id,
      patientName: patientFullName,
      mrn: selectedPatient.mrn,
      status: 'Confirmed',
      room: appointmentData.room || 'Exam Room 3',
    };
    setAppointments([newAppt, ...appointments]);

    // Transmit to Backend API
    try {
      await api.bookAppointment({
        patientId: selectedPatient.id,
        patientName: patientFullName,
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
        syncCloudData,
        isSyncing,
      }}
    >
      {children}
    </EhrContext.Provider>
  );
};
