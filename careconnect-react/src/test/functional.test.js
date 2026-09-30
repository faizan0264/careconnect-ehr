/**
 * =========================================================
 * FUNCTIONAL TESTS — CareConnect EHR
 * Tests: calculateAgeFromDob, login validation, signup validation,
 *        patient identity, appointment conflict detection,
 *        prescription filter, report filter, admin analytics
 * =========================================================
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateAgeFromDob } from '../context/EhrContext.jsx';

// ─────────────────────────────────────────────
// 1. calculateAgeFromDob — Core Age Utility
// ─────────────────────────────────────────────
describe('calculateAgeFromDob()', () => {
  it('returns correct age for YYYY-MM-DD format', () => {
    const dob = '1996-09-29'; // Faizan's DOB
    const age = calculateAgeFromDob(dob);
    expect(age).toBeGreaterThanOrEqual(29);
    expect(age).toBeLessThanOrEqual(31);
  });

  it('returns correct age for 1985-04-12 (John Doe)', () => {
    const age = calculateAgeFromDob('1985-04-12');
    expect(age).toBeGreaterThanOrEqual(40);
    expect(age).toBeLessThanOrEqual(42);
  });

  it('returns correct age for 1992-03-15 (Aisha Patel)', () => {
    const age = calculateAgeFromDob('1992-03-15');
    expect(age).toBeGreaterThanOrEqual(33);
    expect(age).toBeLessThanOrEqual(34);
  });

  it('handles M/D/YYYY format correctly', () => {
    const age = calculateAgeFromDob('1/2/2001');
    expect(age).toBeGreaterThanOrEqual(24);
    expect(age).toBeLessThanOrEqual(26);
  });

  it('returns fallback for null DOB', () => {
    expect(calculateAgeFromDob(null)).toBe(30);
    expect(calculateAgeFromDob(undefined)).toBe(30);
    expect(calculateAgeFromDob('')).toBe(30);
  });

  it('returns fallback for invalid string', () => {
    expect(calculateAgeFromDob('not-a-date')).toBe(30);
    expect(calculateAgeFromDob('abc/xyz/zzz')).toBe(30);
  });

  it('returns 0 for future date (newborn scenario)', () => {
    const futureDate = `${new Date().getFullYear() + 1}-01-01`;
    expect(calculateAgeFromDob(futureDate)).toBe(0);
  });

  it('passes through numeric age directly', () => {
    expect(calculateAgeFromDob(35)).toBe(35);
    expect(calculateAgeFromDob(0)).toBe(0);
  });

  it('accepts custom fallback value', () => {
    expect(calculateAgeFromDob(null, 99)).toBe(99);
    expect(calculateAgeFromDob('', 25)).toBe(25);
  });
});

// ─────────────────────────────────────────────
// 2. Login Validation Rules
// ─────────────────────────────────────────────
describe('Login Validation Rules', () => {
  const validateLogin = (username, password) => {
    if (!username || !username.trim()) return 'Username is required';
    if (!password || !password.trim()) return 'Password is required';
    if (username.trim().length < 3) return 'Username too short';
    if (password.trim().length < 6) return 'Password must be at least 6 characters';
    return null; // valid
  };

  it('rejects empty username', () => {
    expect(validateLogin('', 'password123')).toBe('Username is required');
    expect(validateLogin('   ', 'password123')).toBe('Username is required');
  });

  it('rejects empty password', () => {
    expect(validateLogin('malik', '')).toBe('Password is required');
    expect(validateLogin('malik', '   ')).toBe('Password is required');
  });

  it('rejects short username (< 3 chars)', () => {
    expect(validateLogin('ab', 'password123')).toBe('Username too short');
  });

  it('rejects short password (< 6 chars)', () => {
    expect(validateLogin('malik', '123')).toBe('Password must be at least 6 characters');
  });

  it('passes valid credentials', () => {
    expect(validateLogin('malik', '897937')).toBeNull();
    expect(validateLogin('admin', 'Admin#2026')).toBeNull();
    expect(validateLogin('dr_emily', 'password123')).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 3. Signup Validation Rules
// ─────────────────────────────────────────────
describe('Signup Validation Rules', () => {
  const validateSignup = ({ fullName, email, password, confirmPassword }) => {
    if (!fullName || !fullName.trim()) return 'Full name is required';
    if (!email || !email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    if (!password || password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  it('rejects empty full name', () => {
    expect(validateSignup({ fullName: '', email: 'a@b.com', password: 'abc123', confirmPassword: 'abc123' })).toBe('Full name is required');
  });

  it('rejects invalid email (no @)', () => {
    expect(validateSignup({ fullName: 'Jane', email: 'invalidemail', password: 'abc123', confirmPassword: 'abc123' })).toBe('Invalid email format');
  });

  it('rejects password shorter than 6 chars', () => {
    expect(validateSignup({ fullName: 'Jane', email: 'j@b.com', password: '123', confirmPassword: '123' })).toBe('Password must be at least 6 characters');
  });

  it('rejects mismatched passwords', () => {
    expect(validateSignup({ fullName: 'Jane', email: 'j@b.com', password: 'abc123', confirmPassword: 'xyz789' })).toBe('Passwords do not match');
  });

  it('accepts valid signup data', () => {
    expect(validateSignup({ fullName: 'Mohd Faizan', email: 'faizan@test.com', password: 'secure123', confirmPassword: 'secure123' })).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 4. Patient Identity Resolution
// ─────────────────────────────────────────────
describe('Patient Identity Resolution', () => {
  const patients = [
    { id: 1, mrn: 'MRN-2026-0042', fullName: 'John Doe', username: 'john_doe', email: 'john.doe@gmail.com', phone: '+1 (555) 234-5678' },
    { id: 4, mrn: 'MRN-2026-3156', fullName: 'Mohd Faizan Malik', username: 'malik', email: 'faizan0264@gmail.com', phone: '+91 7409310676' },
    { id: 7, mrn: 'MRN-2026-2024', fullName: 'Kavita Singh', username: 'kavita', email: 'kavita@test.com', phone: '+91 9876543210' },
    { id: 77, mrn: 'MRN-2026-0077', fullName: 'Aisha Patel', username: 'patient1', email: 'patient1@careconnect.org', phone: '+1 (555) 345-6789' },
    { id: 88, mrn: 'MRN-2026-0088', fullName: 'Rahul Verma', username: 'patient2', email: 'rahul.verma@example.com', phone: '+1 (555) 789-0123' },
  ];

  const resolvePatient = (currentUser) => {
    if (!currentUser) return null;
    return patients.find(p =>
      (currentUser.mrn && p.mrn && p.mrn.toLowerCase() === currentUser.mrn.toLowerCase()) ||
      (currentUser.patientId && Number(p.id) === Number(currentUser.patientId)) ||
      (currentUser.username && p.username && p.username.toLowerCase() === currentUser.username.toLowerCase()) ||
      (currentUser.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.fullName && p.fullName && p.fullName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
      (currentUser.phone && p.phone && p.phone === currentUser.phone)
    ) || null;
  };

  it('resolves patient by MRN (primary key)', () => {
    const user = { mrn: 'MRN-2026-3156', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.fullName).toBe('Mohd Faizan Malik');
  });

  it('resolves patient by patientId', () => {
    const user = { patientId: 77, role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.fullName).toBe('Aisha Patel');
  });

  it('resolves patient by username', () => {
    const user = { username: 'kavita', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.fullName).toBe('Kavita Singh');
  });

  it('resolves patient by email (case-insensitive)', () => {
    const user = { email: 'JOHN.DOE@GMAIL.COM', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.fullName).toBe('John Doe');
  });

  it('resolves patient by fullName fallback', () => {
    const user = { fullName: 'Rahul Verma', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.id).toBe(88);
  });

  it('resolves patient by phone number', () => {
    const user = { phone: '+91 7409310676', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)?.username).toBe('malik');
  });

  it('returns null for unknown user', () => {
    const user = { username: 'ghost', email: 'ghost@nowhere.com', role: 'ROLE_PATIENT' };
    expect(resolvePatient(user)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(resolvePatient(null)).toBeNull();
    expect(resolvePatient(undefined)).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 5. Appointment Conflict Detection
// ─────────────────────────────────────────────
describe('Appointment Conflict Detection', () => {
  const appointments = [
    { id: 701, doctorId: 101, date: '2026-10-14', timeSlot: '10:30 AM', status: 'Confirmed' },
    { id: 702, doctorId: 101, date: '2026-10-14', timeSlot: '02:00 PM', status: 'Confirmed' },
    { id: 703, doctorId: 101, date: '2026-10-14', timeSlot: '09:00 AM', status: 'Cancelled' },
    { id: 704, doctorId: 102, date: '2026-10-14', timeSlot: '10:30 AM', status: 'Confirmed' },
  ];

  const isSlotBooked = (doctorId, date, slot) => {
    const occupied = appointments
      .filter(a => Number(a.doctorId) === Number(doctorId) && a.date === date && a.status !== 'Cancelled')
      .map(a => a.timeSlot.trim().toUpperCase());
    return occupied.includes(slot.trim().toUpperCase());
  };

  it('detects booked slot correctly', () => {
    expect(isSlotBooked(101, '2026-10-14', '10:30 AM')).toBe(true);
    expect(isSlotBooked(101, '2026-10-14', '02:00 PM')).toBe(true);
  });

  it('cancelled slot is NOT booked', () => {
    expect(isSlotBooked(101, '2026-10-14', '09:00 AM')).toBe(false);
  });

  it('free slot is not booked', () => {
    expect(isSlotBooked(101, '2026-10-14', '03:30 PM')).toBe(false);
    expect(isSlotBooked(101, '2026-10-14', '04:30 PM')).toBe(false);
  });

  it('different doctor same slot is not a conflict', () => {
    expect(isSlotBooked(102, '2026-10-14', '10:30 AM')).toBe(true); // doc 102 has it
    expect(isSlotBooked(103, '2026-10-14', '10:30 AM')).toBe(false); // doc 103 free
  });

  it('same doctor different date is free', () => {
    expect(isSlotBooked(101, '2026-10-15', '10:30 AM')).toBe(false);
  });

  it('slot comparison is case-insensitive', () => {
    expect(isSlotBooked(101, '2026-10-14', '10:30 am')).toBe(true);
    expect(isSlotBooked(101, '2026-10-14', '10:30 Am')).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Prescription Filter (Patient Dashboard)
// ─────────────────────────────────────────────
describe('Prescription Filter by MRN or patientId', () => {
  const prescriptions = [
    { id: 1, patientId: 1, mrn: 'MRN-2026-0042', name: 'Albuterol', status: 'Active' },
    { id: 2, patientId: 1, mrn: 'MRN-2026-0042', name: 'Lisinopril', status: 'Active' },
    { id: 3, patientId: 2, mrn: 'MRN-2026-0089', name: 'Metformin', status: 'Active' },
    { id: 4, patientId: 4, mrn: 'MRN-2026-3156', name: 'Paracetamol', status: 'Completed' },
    { id: 5, patientId: 4, mrn: 'MRN-2026-3156', name: 'Cetirizine', status: 'Active' },
  ];

  const getPatientMeds = (patient) =>
    prescriptions.filter(p =>
      p.status === 'Active' && (
        (patient?.mrn && p.mrn && p.mrn.toLowerCase() === patient.mrn.toLowerCase()) ||
        Number(p.patientId) === Number(patient?.id)
      )
    );

  it('returns active meds for John Doe by MRN', () => {
    const patient = { id: 1, mrn: 'MRN-2026-0042' };
    const meds = getPatientMeds(patient);
    expect(meds).toHaveLength(2);
    expect(meds.map(m => m.name)).toContain('Albuterol');
    expect(meds.map(m => m.name)).toContain('Lisinopril');
  });

  it('returns only active meds (excludes Completed)', () => {
    const patient = { id: 4, mrn: 'MRN-2026-3156' };
    const meds = getPatientMeds(patient);
    expect(meds).toHaveLength(1);
    expect(meds[0].name).toBe('Cetirizine');
  });

  it('returns empty array for patient with no active meds', () => {
    const patient = { id: 99, mrn: 'MRN-2026-UNKNOWN' };
    expect(getPatientMeds(patient)).toHaveLength(0);
  });

  it('handles null/undefined patient gracefully', () => {
    expect(getPatientMeds(null)).toHaveLength(0);
    expect(getPatientMeds(undefined)).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// 7. Admin Patient Deduplication (uniquePatientCount)
// ─────────────────────────────────────────────
describe('Admin Patient Deduplication (uniquePatientCount)', () => {
  const deduplicateByMrn = (patients) => {
    const seen = new Set();
    return patients.filter(p => {
      const key = p.mrn?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  it('removes duplicate MRN entries', () => {
    const patients = [
      { id: 1, mrn: 'MRN-2026-0042' },
      { id: 2, mrn: 'MRN-2026-0042' }, // dup
      { id: 3, mrn: 'MRN-2026-0089' },
    ];
    expect(deduplicateByMrn(patients)).toHaveLength(2);
  });

  it('deduplication is case-insensitive', () => {
    const patients = [
      { id: 1, mrn: 'mrn-2026-0042' },
      { id: 2, mrn: 'MRN-2026-0042' }, // same, different case
    ];
    expect(deduplicateByMrn(patients)).toHaveLength(1);
  });

  it('excludes entries without MRN', () => {
    const patients = [
      { id: 1, mrn: 'MRN-2026-0042' },
      { id: 2 }, // no mrn
      { id: 3, mrn: null },
    ];
    expect(deduplicateByMrn(patients)).toHaveLength(1);
  });

  it('returns all patients when all MRNs are unique', () => {
    const patients = [
      { id: 1, mrn: 'MRN-2026-0042' },
      { id: 2, mrn: 'MRN-2026-0089' },
      { id: 3, mrn: 'MRN-2026-0104' },
    ];
    expect(deduplicateByMrn(patients)).toHaveLength(3);
  });

  it('handles empty array', () => {
    expect(deduplicateByMrn([])).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────
// 8. Role-Based Dashboard Routing
// ─────────────────────────────────────────────
describe('Role-Based Dashboard Routing Logic', () => {
  const getDashboardForRole = (role) => {
    const isDoctor = role === 'ROLE_DOCTOR' || role === 'Doctor';
    const isPatient = role === 'ROLE_PATIENT' || role === 'Patient';
    const isAdmin = role === 'ROLE_ADMIN' || role === 'Administrator' || role === 'Admin';
    if (isDoctor) return 'DoctorDashboard';
    if (isPatient) return 'PatientDashboard';
    if (isAdmin) return 'AdminDashboard';
    return 'DoctorDashboard'; // fallback
  };

  it('ROLE_DOCTOR → DoctorDashboard', () => expect(getDashboardForRole('ROLE_DOCTOR')).toBe('DoctorDashboard'));
  it('ROLE_PATIENT → PatientDashboard', () => expect(getDashboardForRole('ROLE_PATIENT')).toBe('PatientDashboard'));
  it('ROLE_ADMIN → AdminDashboard', () => expect(getDashboardForRole('ROLE_ADMIN')).toBe('AdminDashboard'));
  it('Doctor (normalized) → DoctorDashboard', () => expect(getDashboardForRole('Doctor')).toBe('DoctorDashboard'));
  it('Patient (normalized) → PatientDashboard', () => expect(getDashboardForRole('Patient')).toBe('PatientDashboard'));
  it('Administrator (normalized) → AdminDashboard', () => expect(getDashboardForRole('Administrator')).toBe('AdminDashboard'));
  it('unknown role → DoctorDashboard (fallback)', () => expect(getDashboardForRole('UNKNOWN')).toBe('DoctorDashboard'));
});

// ─────────────────────────────────────────────
// 9. MRN Generation & Format Validation
// ─────────────────────────────────────────────
describe('MRN Format Validation', () => {
  const MRN_PATTERN = /^MRN-\d{4}-\d{4,}$/;

  it('valid MRN passes format check', () => {
    expect(MRN_PATTERN.test('MRN-2026-0042')).toBe(true);
    expect(MRN_PATTERN.test('MRN-2026-3156')).toBe(true);
    expect(MRN_PATTERN.test('MRN-2026-2024')).toBe(true);
  });

  it('invalid MRN fails format check', () => {
    expect(MRN_PATTERN.test('MRN-26-42')).toBe(false);
    expect(MRN_PATTERN.test('mrn-2026-0042')).toBe(false);
    expect(MRN_PATTERN.test('RANDOM')).toBe(false);
    expect(MRN_PATTERN.test('')).toBe(false);
  });

  it('generated MRN matches pattern', () => {
    const generateMrn = () => {
      const suffix = 1000 + Math.floor(Math.random() * 9000);
      return `MRN-2026-${suffix}`;
    };
    for (let i = 0; i < 20; i++) {
      expect(MRN_PATTERN.test(generateMrn())).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// 10. Doctor Queue Filter
// ─────────────────────────────────────────────
describe('Doctor Queue Filter (myAppointments)', () => {
  const appointments = [
    { id: 1, doctorId: 7, doctorName: 'Dr. Emily Davis, MD', patientName: 'Mohd Faizan Malik', status: 'Confirmed' },
    { id: 2, doctorId: 112, doctorName: 'Dr. Emily Davis, MD', patientName: 'John Doe', status: 'Confirmed' },
    { id: 3, doctorId: 1, doctorName: 'Dr. Sarah Smith, MD', patientName: 'Maria Gonzalez', status: 'Confirmed' },
    { id: 4, doctorId: 7, doctorName: 'Dr. Emily Davis, MD', patientName: 'Kavita Singh', status: 'Cancelled' },
  ];

  const getMyAppointments = (currentUser) => {
    const usernameFirstName = (currentUser.username || '').replace(/^dr[_.]?/i, '').toLowerCase();
    return appointments.filter(a => {
      const matchById = Number(a.doctorId) === Number(currentUser.id);
      const matchByName = currentUser.fullName && a.doctorName &&
        a.doctorName.toLowerCase() === currentUser.fullName.toLowerCase();
      const matchByUsername = usernameFirstName && a.doctorName &&
        a.doctorName.toLowerCase().includes(usernameFirstName);
      return (matchById || matchByName || matchByUsername) && a.status !== 'Cancelled';
    });
  };

  it('Emily (backend id=7) sees her appointments', () => {
    const user = { id: 7, username: 'dr_emily', fullName: 'Dr. Emily Davis, MD' };
    const appts = getMyAppointments(user);
    expect(appts.length).toBeGreaterThanOrEqual(1);
    expect(appts.every(a => a.doctorName === 'Dr. Emily Davis, MD')).toBe(true);
  });

  it('excludes cancelled appointments', () => {
    const user = { id: 7, username: 'dr_emily', fullName: 'Dr. Emily Davis, MD' };
    const appts = getMyAppointments(user);
    expect(appts.every(a => a.status !== 'Cancelled')).toBe(true);
  });

  it('Dr. Sarah Smith sees only her appointments', () => {
    const user = { id: 1, username: 'dr_smith', fullName: 'Dr. Sarah Smith, MD' };
    const appts = getMyAppointments(user);
    expect(appts).toHaveLength(1);
    expect(appts[0].patientName).toBe('Maria Gonzalez');
  });

  it('doctor with no appointments sees empty queue', () => {
    const user = { id: 999, username: 'dr_unknown', fullName: 'Dr. Unknown Doc, MD' };
    expect(getMyAppointments(user)).toHaveLength(0);
  });
});
