/**
 * =========================================================
 * END-TO-END (E2E) SIMULATION TESTS — CareConnect EHR
 * Simulates full user journeys: register → login → view data
 * → book appointment → doctor views patient → admin analytics
 * =========================================================
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateAgeFromDob } from '../context/EhrContext.jsx';

// ─────────────────────────────────────────────
// Shared test fixtures
// ─────────────────────────────────────────────
const mockPatients = [
  { id: 1, mrn: 'MRN-2026-0042', firstName: 'John', lastName: 'Doe', fullName: 'John Doe', username: 'john_doe', email: 'john.doe@gmail.com', phone: '+1 (555) 234-5678', dateOfBirth: '1985-04-12', age: 41, gender: 'Male', bloodGroup: 'O+', allergies: 'Penicillin, NSAIDs', emergencyContact: 'Jane Doe - +1 (555) 234-5679', status: 'In Consultation' },
  { id: 4, mrn: 'MRN-2026-3156', firstName: 'Mohd Faizan', lastName: 'Malik', fullName: 'Mohd Faizan Malik', username: 'malik', email: 'faizan0264@gmail.com', phone: '+91 7409310676', dateOfBirth: '1996-09-29', age: 30, gender: 'Male', bloodGroup: 'O+', allergies: 'None (NKDA)', emergencyContact: 'Family - +91 7409310670', status: 'Active' },
  { id: 7, mrn: 'MRN-2026-2024', firstName: 'Kavita', lastName: 'Singh', fullName: 'Kavita Singh', username: 'kavita', email: 'kavita@test.com', phone: '+91 9876543210', dateOfBirth: '1995-05-15', age: 31, gender: 'Female', bloodGroup: 'B+', allergies: 'None (NKDA)', emergencyContact: 'Family - +91 9876543200', status: 'Active' },
  { id: 77, mrn: 'MRN-2026-0077', firstName: 'Aisha', lastName: 'Patel', fullName: 'Aisha Patel', username: 'patient1', email: 'patient1@careconnect.org', phone: '+1 (555) 345-6789', dateOfBirth: '1992-03-15', age: 34, gender: 'Female', bloodGroup: 'B+', allergies: 'None (NKDA)', emergencyContact: 'Sanjay Patel - +1 (555) 345-6780', status: 'Active' },
  { id: 88, mrn: 'MRN-2026-0088', firstName: 'Rahul', lastName: 'Verma', fullName: 'Rahul Verma', username: 'patient2', email: 'rahul.verma@example.com', phone: '+1 (555) 789-0123', dateOfBirth: '1988-10-30', age: 37, gender: 'Male', bloodGroup: 'AB+', allergies: 'Latex', emergencyContact: 'Pooja Verma - +1 (555) 789-0120', status: 'Active' },
];

const mockUsers = [
  { id: 1, username: 'dr_smith', fullName: 'Dr. Sarah Smith, MD', role: 'ROLE_DOCTOR', password: 'password123' },
  { id: 7, username: 'dr_emily', fullName: 'Dr. Emily Davis, MD', role: 'ROLE_DOCTOR', password: 'password123' },
  { id: 5, username: 'admin', fullName: 'System Administrator', role: 'ROLE_ADMIN', password: 'Admin#2026' },
  { id: 3, username: 'admin_alex', fullName: 'Alex Morgan', role: 'ROLE_ADMIN', password: 'password123' },
  { id: 2, username: 'john_doe', fullName: 'John Doe', role: 'ROLE_PATIENT', password: 'password123', patientId: 1, mrn: 'MRN-2026-0042', dateOfBirth: '1985-04-12', age: 41 },
  { id: 9, username: 'malik', fullName: 'Mohd Faizan Malik', role: 'ROLE_PATIENT', password: '897937', patientId: 4, mrn: 'MRN-2026-3156', dateOfBirth: '1996-09-29', age: 30, phone: '+91 7409310676' },
  { id: 10, username: 'kavita', fullName: 'Kavita Singh', role: 'ROLE_PATIENT', password: '897937', patientId: 7, mrn: 'MRN-2026-2024', dateOfBirth: '1995-05-15', age: 31 },
  { id: 8, username: 'patient1', fullName: 'Aisha Patel', role: 'ROLE_PATIENT', password: 'Patient#2026', patientId: 77, mrn: 'MRN-2026-0077', dateOfBirth: '1992-03-15', age: 34 },
];

const mockAppointments = [
  { id: 701, patientId: 1, patientName: 'John Doe', mrn: 'MRN-2026-0042', doctorId: 1, doctorName: 'Dr. Sarah Smith, MD', date: '2026-10-14', timeSlot: '10:30 AM', reason: 'Follow-up: Blood Pressure', status: 'Confirmed' },
  { id: 702, patientId: 4, patientName: 'Mohd Faizan Malik', mrn: 'MRN-2026-3156', doctorId: 7, doctorName: 'Dr. Emily Davis, MD', date: '2026-10-15', timeSlot: '09:00 AM', reason: 'General Consultation', status: 'Confirmed' },
  { id: 703, patientId: 77, patientName: 'Aisha Patel', mrn: 'MRN-2026-0077', doctorId: 7, doctorName: 'Dr. Emily Davis, MD', date: '2026-10-16', timeSlot: '02:00 PM', reason: 'Routine Checkup', status: 'Confirmed' },
];

const mockPrescriptions = [
  { id: 1, patientId: 1, mrn: 'MRN-2026-0042', name: 'Albuterol Inhaler', dosage: '90 mcg', frequency: '2 puffs q4-6h PRN', status: 'Active' },
  { id: 2, patientId: 1, mrn: 'MRN-2026-0042', name: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily', status: 'Active' },
  { id: 3, patientId: 4, mrn: 'MRN-2026-3156', name: 'Cetirizine', dosage: '10 mg', frequency: 'Once nightly', status: 'Active' },
];

// ─────────────────────────────────────────────
// E2E JOURNEY 1: Patient Registration Flow
// ─────────────────────────────────────────────
describe('E2E: Patient Registration Journey', () => {
  let registeredUsers = [...mockUsers];
  let registeredPatients = [...mockPatients];

  const registerNewPatient = (signupData) => {
    // Validate required fields
    if (!signupData.fullName || !signupData.email || !signupData.password) {
      return { success: false, error: 'Missing required fields' };
    }
    if (signupData.password.length < 6) {
      return { success: false, error: 'Password too short' };
    }
    if (signupData.password !== signupData.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    // Check duplicate username
    const existing = registeredUsers.find(u => u.username === signupData.username);
    if (existing) {
      return { success: false, error: 'Username already taken' };
    }

    const newId = registeredUsers.length + 100;
    const mrn = `MRN-2026-${1000 + newId}`;
    const age = calculateAgeFromDob(signupData.dateOfBirth, 30);

    const newUser = { id: newId, username: signupData.username, fullName: signupData.fullName, role: 'ROLE_PATIENT', password: signupData.password, mrn, dateOfBirth: signupData.dateOfBirth, age };
    const newPatient = { id: newId, mrn, firstName: signupData.fullName.split(' ')[0], lastName: signupData.fullName.split(' ').slice(1).join(' '), fullName: signupData.fullName, username: signupData.username, email: signupData.email, phone: signupData.phone, dateOfBirth: signupData.dateOfBirth, age, gender: signupData.gender, bloodGroup: signupData.bloodGroup, allergies: signupData.allergies || 'None (NKDA)', status: 'Active' };

    registeredUsers.push(newUser);
    registeredPatients.push(newPatient);
    return { success: true, user: newUser, patient: newPatient };
  };

  it('successfully registers a new patient', () => {
    const result = registerNewPatient({
      fullName: 'New Test Patient',
      email: 'testpatient@example.com',
      username: 'test_patient_new',
      password: 'Test#123',
      confirmPassword: 'Test#123',
      dateOfBirth: '2000-06-15',
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1 (555) 999-1234',
    });
    expect(result.success).toBe(true);
    expect(result.patient.fullName).toBe('New Test Patient');
    expect(result.patient.mrn).toMatch(/^MRN-2026-\d+$/);
  });

  it('new patient MRN is unique from existing ones', () => {
    const existingMrns = mockPatients.map(p => p.mrn);
    const result = registerNewPatient({ fullName: 'Another Patient', email: 'another@test.com', username: 'another_patient', password: 'pass123', confirmPassword: 'pass123', dateOfBirth: '1990-01-01' });
    expect(existingMrns).not.toContain(result.patient?.mrn);
  });

  it('rejects registration with mismatched passwords', () => {
    const result = registerNewPatient({ fullName: 'Jane', email: 'jane@test.com', username: 'jane_test', password: 'abc123', confirmPassword: 'xyz789', dateOfBirth: '1990-01-01' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Passwords do not match');
  });

  it('rejects duplicate username', () => {
    const result = registerNewPatient({ fullName: 'John Copy', email: 'john2@test.com', username: 'john_doe', password: 'abc123', confirmPassword: 'abc123', dateOfBirth: '1990-01-01' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Username already taken');
  });

  it('calculates DOB correctly during registration', () => {
    const result = registerNewPatient({ fullName: 'Young Person', email: 'young@test.com', username: 'young_test_xyz', password: 'abc123', confirmPassword: 'abc123', dateOfBirth: '2001-01-02' });
    expect(result.success).toBe(true);
    expect(result.patient.age).toBeGreaterThanOrEqual(24);
    expect(result.patient.age).toBeLessThanOrEqual(26);
  });
});

// ─────────────────────────────────────────────
// E2E JOURNEY 2: Patient Login & Identity
// ─────────────────────────────────────────────
describe('E2E: Patient Login → Identity Resolution Journey', () => {
  const login = (username, password) => {
    const user = mockUsers.find(u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password
    );
    if (!user) return { success: false, message: 'Invalid credentials' };
    // Resolve patient record
    const patient = mockPatients.find(p =>
      (user.mrn && p.mrn === user.mrn) ||
      (user.patientId && Number(p.id) === Number(user.patientId)) ||
      (p.username === user.username) ||
      (p.fullName.toLowerCase() === user.fullName.toLowerCase())
    );
    return { success: true, user: { ...user }, patient: patient || null };
  };

  it('malik logs in and resolves to Mohd Faizan Malik', () => {
    const result = login('malik', '897937');
    expect(result.success).toBe(true);
    expect(result.patient?.fullName).toBe('Mohd Faizan Malik');
    expect(result.patient?.mrn).toBe('MRN-2026-3156');
    expect(result.user.role).toBe('ROLE_PATIENT');
  });

  it('kavita logs in and resolves to Kavita Singh', () => {
    const result = login('kavita', '897937');
    expect(result.success).toBe(true);
    expect(result.patient?.fullName).toBe('Kavita Singh');
    expect(result.patient?.gender).toBe('Female');
  });

  it('patient1 resolves to Aisha Patel (seed patient)', () => {
    const result = login('patient1', 'Patient#2026');
    expect(result.success).toBe(true);
    expect(result.patient?.fullName).toBe('Aisha Patel');
    expect(result.patient?.mrn).toBe('MRN-2026-0077');
  });

  it('john_doe resolves to John Doe', () => {
    const result = login('john_doe', 'password123');
    expect(result.success).toBe(true);
    expect(result.patient?.fullName).toBe('John Doe');
    expect(result.patient?.bloodGroup).toBe('O+');
    expect(result.patient?.allergies).toContain('Penicillin');
  });

  it('after login, patient age is calculated from DOB (not hardcoded)', () => {
    const result = login('malik', '897937');
    const resolvedAge = calculateAgeFromDob(result.patient?.dateOfBirth, result.user.age);
    expect(resolvedAge).toBeGreaterThanOrEqual(29);
    expect(resolvedAge).toBeLessThanOrEqual(31);
  });

  it('wrong password returns failure', () => {
    const result = login('malik', 'wrongpassword');
    expect(result.success).toBe(false);
  });

  it('non-existent user returns failure', () => {
    const result = login('ghost_user', 'password');
    expect(result.success).toBe(false);
  });

  it('admin login returns ROLE_ADMIN (no patient resolution)', () => {
    const result = login('admin', 'Admin#2026');
    expect(result.success).toBe(true);
    expect(result.user.role).toBe('ROLE_ADMIN');
    expect(result.patient).toBeNull();
  });
});

// ─────────────────────────────────────────────
// E2E JOURNEY 3: Patient Books Appointment
// ─────────────────────────────────────────────
describe('E2E: Patient Appointment Booking Journey', () => {
  let appointments = [...mockAppointments];

  const bookAppointment = (currentUser, patient, doctorId, date, slot, reason) => {
    if (!patient) return { success: false, error: 'No patient profile found' };
    if (!date || !slot) return { success: false, error: 'Date and time slot are required' };
    if (!reason || !reason.trim()) return { success: false, error: 'Reason is required' };

    // Conflict check
    const conflict = appointments.find(a =>
      Number(a.doctorId) === Number(doctorId) &&
      a.date === date &&
      a.timeSlot.toUpperCase() === slot.toUpperCase() &&
      a.status !== 'Cancelled'
    );
    if (conflict) return { success: false, error: `Slot ${slot} is already booked` };

    const doctor = mockUsers.find(u => u.id === Number(doctorId));
    const newAppt = {
      id: Date.now(),
      patientId: patient.id,
      patientName: patient.fullName,
      mrn: patient.mrn,
      doctorId: Number(doctorId),
      doctorName: doctor?.fullName || 'Unknown Doctor',
      date,
      timeSlot: slot,
      reason: reason.trim(),
      status: 'Confirmed',
    };
    appointments.push(newAppt);
    return { success: true, appointment: newAppt };
  };

  it('patient can book a free slot', () => {
    const patient = mockPatients.find(p => p.username === 'kavita');
    const result = bookAppointment({ username: 'kavita' }, patient, 1, '2026-10-20', '09:00 AM', 'General checkup');
    expect(result.success).toBe(true);
    expect(result.appointment.patientName).toBe('Kavita Singh');
    expect(result.appointment.status).toBe('Confirmed');
  });

  it('booking fails on already-occupied slot', () => {
    const patient = mockPatients.find(p => p.username === 'malik');
    // slot 10:30 AM is taken by John Doe for Dr. Sarah Smith
    const result = bookAppointment({ username: 'malik' }, patient, 1, '2026-10-14', '10:30 AM', 'Follow-up');
    expect(result.success).toBe(false);
    expect(result.error).toContain('already booked');
  });

  it('booking fails without reason', () => {
    const patient = mockPatients.find(p => p.username === 'john_doe');
    const result = bookAppointment({ username: 'john_doe' }, patient, 7, '2026-10-20', '03:30 PM', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Reason is required');
  });

  it('booked appointment appears in patient appointment list', () => {
    const patient = mockPatients.find(p => p.username === 'patient2') || mockPatients[4]; // Rahul Verma
    bookAppointment({ username: 'patient2' }, patient, 7, '2026-10-17', '04:30 PM', 'Annual physical');
    const myAppts = appointments.filter(a => a.mrn === patient?.mrn && a.status !== 'Cancelled');
    expect(myAppts.length).toBeGreaterThanOrEqual(1);
  });

  it('different patients can book same slot with different doctors', () => {
    const patient = mockPatients.find(p => p.username === 'kavita');
    // slot 10:30 AM with doc 7 (Emily) — different doctor from doc 1
    const result = bookAppointment({ username: 'kavita' }, patient, 7, '2026-10-14', '10:30 AM', 'Routine');
    expect(result.success).toBe(true); // doc 7 not booked that slot
  });
});

// ─────────────────────────────────────────────
// E2E JOURNEY 4: Doctor Views Patient Record
// ─────────────────────────────────────────────
describe('E2E: Doctor Dashboard — Patient Lookup Journey', () => {
  const getPatientByAppointment = (appointment, patients) => {
    if (!appointment) return null;
    return patients.find(p =>
      (appointment.mrn && p.mrn && p.mrn === appointment.mrn) ||
      Number(p.id) === Number(appointment.patientId) ||
      (appointment.patientName && p.fullName && p.fullName.toLowerCase() === appointment.patientName.toLowerCase())
    ) || null;
  };

  it('Dr. Emily sees Faizan Malik\'s appointment and resolves his record', () => {
    const appt = mockAppointments.find(a => a.patientName === 'Mohd Faizan Malik');
    const patient = getPatientByAppointment(appt, mockPatients);
    expect(patient).not.toBeNull();
    expect(patient?.fullName).toBe('Mohd Faizan Malik');
    expect(patient?.bloodGroup).toBe('O+');
    expect(patient?.allergies).toBe('None (NKDA)');
  });

  it('Dr. Emily sees Aisha Patel\'s appointment', () => {
    const appt = mockAppointments.find(a => a.patientName === 'Aisha Patel');
    const patient = getPatientByAppointment(appt, mockPatients);
    expect(patient?.fullName).toBe('Aisha Patel');
    expect(patient?.mrn).toBe('MRN-2026-0077');
    expect(patient?.gender).toBe('Female');
  });

  it('getPatientByAppointment handles null appointment', () => {
    expect(getPatientByAppointment(null, mockPatients)).toBeNull();
  });

  it('doctor prescription view filters by patient MRN', () => {
    const patient = mockPatients.find(p => p.mrn === 'MRN-2026-0042');
    const patientRx = mockPrescriptions.filter(rx =>
      (patient?.mrn && rx.mrn?.toLowerCase() === patient.mrn.toLowerCase()) ||
      Number(rx.patientId) === Number(patient?.id)
    );
    expect(patientRx).toHaveLength(2);
    expect(patientRx.map(r => r.name)).toContain('Albuterol Inhaler');
    expect(patientRx.map(r => r.name)).toContain('Lisinopril');
  });

  it('doctor can distinguish John Doe allergy (Penicillin) from Faizan (NKDA)', () => {
    const johnDoe = mockPatients.find(p => p.mrn === 'MRN-2026-0042');
    const faizan = mockPatients.find(p => p.mrn === 'MRN-2026-3156');
    expect(johnDoe?.allergies).toContain('Penicillin');
    expect(faizan?.allergies).toBe('None (NKDA)');
  });
});

// ─────────────────────────────────────────────
// E2E JOURNEY 5: Admin Dashboard Analytics
// ─────────────────────────────────────────────
describe('E2E: Admin Dashboard Analytics Journey', () => {
  const computeAnalytics = (patients, appointments, users) => {
    const seen = new Set();
    const uniquePatients = patients.filter(p => {
      const key = p.mrn?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const activeToday = appointments.filter(a => a.status !== 'Cancelled').length;
    const doctorCount = users.filter(u => u.role === 'ROLE_DOCTOR').length;
    const adminCount = users.filter(u => u.role === 'ROLE_ADMIN').length;
    return { totalPatients: uniquePatients.length, activeAppointments: activeToday, doctorCount, adminCount };
  };

  it('admin sees correct unique patient count', () => {
    const analytics = computeAnalytics(mockPatients, mockAppointments, mockUsers);
    expect(analytics.totalPatients).toBe(5); // 5 unique MRNs in mockPatients
  });

  it('admin sees correct active appointment count', () => {
    const analytics = computeAnalytics(mockPatients, mockAppointments, mockUsers);
    expect(analytics.activeAppointments).toBe(3); // all confirmed
  });

  it('admin sees correct doctor count', () => {
    const analytics = computeAnalytics(mockPatients, mockAppointments, mockUsers);
    expect(analytics.doctorCount).toBe(2); // dr_smith and dr_emily
  });

  it('admin sees correct admin count', () => {
    const analytics = computeAnalytics(mockPatients, mockAppointments, mockUsers);
    expect(analytics.adminCount).toBe(2); // admin and admin_alex
  });

  it('duplicate patient MRNs are not double-counted', () => {
    const withDuplicates = [
      ...mockPatients,
      { id: 999, mrn: 'MRN-2026-0042', fullName: 'John Doe Duplicate' }, // dup
    ];
    const analytics = computeAnalytics(withDuplicates, mockAppointments, mockUsers);
    expect(analytics.totalPatients).toBe(5); // still 5 unique
  });

  it('cancelled appointments are excluded from active count', () => {
    const withCancelled = [...mockAppointments, { id: 900, status: 'Cancelled', doctorName: 'Dr. Emily Davis, MD' }];
    const analytics = computeAnalytics(mockPatients, withCancelled, mockUsers);
    expect(analytics.activeAppointments).toBe(3); // only 3 confirmed
  });
});

// ─────────────────────────────────────────────
// E2E JOURNEY 6: Appointment Cancellation Flow
// ─────────────────────────────────────────────
describe('E2E: Appointment Cancellation Journey', () => {
  let appointments = [...mockAppointments];

  const cancelAppointment = (apptId, currentUser) => {
    const idx = appointments.findIndex(a => a.id === apptId);
    if (idx === -1) return { success: false, error: 'Appointment not found' };
    const appt = appointments[idx];
    if (appt.status === 'Cancelled') return { success: false, error: 'Already cancelled' };
    // Patient can only cancel own; doctor/admin can cancel any
    if (currentUser.role === 'ROLE_PATIENT' && appt.mrn !== currentUser.mrn) {
      return { success: false, error: 'Cannot cancel another patient\'s appointment' };
    }
    appointments[idx] = { ...appt, status: 'Cancelled' };
    return { success: true };
  };

  it('patient can cancel their own appointment', () => {
    const user = { role: 'ROLE_PATIENT', mrn: 'MRN-2026-0042' };
    const result = cancelAppointment(701, user);
    expect(result.success).toBe(true);
    expect(appointments.find(a => a.id === 701)?.status).toBe('Cancelled');
  });

  it('patient cannot cancel another patient\'s appointment', () => {
    appointments = [...mockAppointments]; // reset
    const user = { role: 'ROLE_PATIENT', mrn: 'MRN-2026-0042' };
    const result = cancelAppointment(702, user); // Faizan's appointment
    expect(result.success).toBe(false);
  });

  it('admin can cancel any appointment', () => {
    appointments = [...mockAppointments]; // reset
    const admin = { role: 'ROLE_ADMIN' };
    const result = cancelAppointment(703, admin);
    expect(result.success).toBe(true);
  });

  it('cancelling non-existent appointment fails', () => {
    const admin = { role: 'ROLE_ADMIN' };
    expect(cancelAppointment(9999, admin).success).toBe(false);
  });

  it('already cancelled appointment cannot be cancelled again', () => {
    appointments = [{ ...mockAppointments[0], status: 'Cancelled' }, ...mockAppointments.slice(1)];
    const admin = { role: 'ROLE_ADMIN' };
    const result = cancelAppointment(701, admin);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Already cancelled');
  });
});
