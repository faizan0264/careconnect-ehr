import React, { useState, useEffect } from 'react';
import { useEhr, calculateAgeFromDob } from '../context/EhrContext';
import { MedicalReportVaultModal } from '../components/MedicalReportVaultModal';
import { 
  Users, 
  Search, 
  Plus, 
  AlertTriangle, 
  Activity, 
  Heart, 
  Wind, 
  Thermometer, 
  FileText, 
  Save, 
  CheckCircle, 
  Clock, 
  Pill, 
  X, 
  ShieldAlert,
  Calendar,
  Upload,
  Eye,
  Download,
  Trash2,
  FolderLock,
  FileCheck,
  Stethoscope,
  User
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { 
    currentUser,
    activeTab, 
    setActiveTab, 
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
    appointments,
    reports,
    deleteReport
  } = useEhr();

  // Reports Vault State
  const [showReportModal, setShowReportModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('ALL');
  const [reportSearch, setReportSearch] = useState('');

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: 'Patient#2026',
    email: '',
    dateOfBirth: '1995-01-01',
    age: 30,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+1 (555) 123-4567',
    allergies: 'None (NKDA)',
    emergencyContact: 'Family - +1 (555) 999-0000',
    room: 'Exam Room 2',
  });

  // Vitals & SOAP local edit states with safe default fallbacks
  const defaultVitals = {
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 72,
    temp: 98.6,
    spo2: 99,
    respRate: 16,
  };
  const defaultSoap = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  };

  const [vitals, setVitals] = useState(() => encounter?.vitals || defaultVitals);
  const [soap, setSoap] = useState(() => encounter?.soap || defaultSoap);

  // Sync vitals and SOAP whenever selected patient changes
  useEffect(() => {
    setVitals(encounter?.vitals || defaultVitals);
    setSoap(encounter?.soap || defaultSoap);
  }, [selectedPatient?.id, encounter]);

  // CPOE state
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderType, setNewOrderType] = useState('Laboratory');
  const [newOrderPriority, setNewOrderPriority] = useState('Routine');
  const [activeResultOrder, setActiveResultOrder] = useState(null);
  const [resultText, setResultText] = useState('');

  // Prescription state & Allergy Alert modal
  const [rxDrug, setRxDrug] = useState('');
  const [rxDose, setRxDose] = useState('500 mg');
  const [rxFreq, setRxFreq] = useState('Every 8 hours');
  const [rxDuration, setRxDuration] = useState('7 days');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Clinical benefit outweighs risk with close monitoring');
  const [overrideAck, setOverrideAck] = useState(false);

  // Doctor appointment schedule filtering
  const [scheduleFilter, setScheduleFilter] = useState('MY_SCHEDULE');
  const myAppointments = appointments.filter(a => 
    a.status !== 'Cancelled' && (
      a.doctorName === currentUser?.fullName ||
      a.doctorId === currentUser?.id ||
      // Also match by username in case the doctor name differs slightly between local and backend
      (currentUser?.username && a.doctorName && a.doctorName.toLowerCase().includes(
        (currentUser.username || '').replace(/^dr[_.]?/, '').replace(/_/g, ' ').toLowerCase()
      ))
    )
  );
  const allClinicAppointments = appointments.filter(a => a.status !== 'Cancelled');
  const displayedAppointments = scheduleFilter === 'MY_SCHEDULE' 
    ? (myAppointments.length > 0 ? myAppointments : allClinicAppointments) 
    : allClinicAppointments;

  // Filter orders and prescriptions strictly by active patient chart
  const patientOrders = orders.filter(o => 
    (selectedPatient?.mrn && o.mrn && o.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(o.patientId) === Number(selectedPatient?.id)
  );
  const patientPrescriptions = prescriptions.filter(p => 
    (selectedPatient?.mrn && p.mrn && p.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(p.patientId) === Number(selectedPatient?.id)
  );

  // Filtered patients
  const filteredPatients = patients.filter(p => 
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.firstName || !newPatient.lastName) return;
    await registerPatient(newPatient);
    setShowAddPatientModal(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      username: '',
      password: 'Patient#2026',
      email: '',
      dateOfBirth: '1995-01-01',
      age: 30,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1 (555) 123-4567',
      allergies: 'None (NKDA)',
      emergencyContact: 'Family - +1 (555) 999-0000',
      room: 'Exam Room 2',
    });
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!newOrderName.trim()) return;
    addOrder({
      name: newOrderName,
      type: newOrderType,
      priority: newOrderPriority,
    });
    setNewOrderName('');
  };

  const handlePrescribeSubmit = (e) => {
    e.preventDefault();
    if (!rxDrug.trim()) return;

    // Check allergy conflict
    const lowerDrug = rxDrug.toLowerCase();
    const lowerAllergies = (selectedPatient?.allergies || '').toLowerCase();
    if (lowerDrug.includes('amoxicillin') || lowerDrug.includes('penicillin')) {
      if (lowerAllergies.includes('penicillin')) {
        setShowAllergyModal(true);
        setOverrideAck(false);
        return;
      }
    }

    addPrescription({
      name: rxDrug,
      dosage: rxDose,
      frequency: rxFreq,
      duration: rxDuration,
    });
    setRxDrug('');
  };

  const handleForceOverride = () => {
    addPrescription({
      name: rxDrug,
      dosage: rxDose,
      frequency: rxFreq,
      duration: rxDuration,
    }, overrideReason);
    setShowAllergyModal(false);
    setRxDrug('');
  };

  const patientReports = (reports || []).filter(r => 
    (selectedPatient?.mrn && r.mrn && r.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(r.patientId) === Number(selectedPatient?.id)
  );
  const filteredReports = patientReports.filter(r => {
    const matchesFilter = reportFilter === 'ALL' || r.reportType === reportFilter;
    const matchesSearch = !reportSearch.trim() || 
      (r.title && r.title.toLowerCase().includes(reportSearch.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(reportSearch.toLowerCase())) ||
      (r.uploadedBy && r.uploadedBy.toLowerCase().includes(reportSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDownloadFile = (report) => {
    if (report.fileData) {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = report.fileName || `${report.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `CARECONNECT EHR - OFFICIAL MEDICAL REPORT\n` +
        `=======================================================\n` +
        `Report Title:    ${report.title}\n` +
        `Patient:         ${selectedPatient.firstName} ${selectedPatient.lastName} (MRN: ${selectedPatient.mrn})\n` +
        `Category:        ${report.reportType}\n` +
        `Date:            ${report.reportDate}\n` +
        `Uploaded By:     ${report.uploadedBy} (${report.uploaderRole})\n` +
        `=======================================================\n\n` +
        `CLINICAL FINDINGS & IMPRESSION:\n${report.notes || 'Normal clinical findings.'}\n\n` +
        `HIPAA Security Verified • Digitally Signed`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.fileName ? report.fileName.replace(/\.pdf$/, '.txt') : `${report.title}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Attending Physician Session Banner */}
      <div className="bg-linear-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
            <Stethoscope className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                {currentUser?.fullName || 'Dr. Sarah Smith, MD'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/40 border border-blue-400/50 text-blue-100 uppercase tracking-wider">
                Attending Physician
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-0.5">
              {currentUser?.department || 'Internal Medicine & Pulmonology'} • Provider ID: <span className="font-mono text-white/90">{currentUser?.username || 'dr_smith'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
            <span className="text-blue-200 text-[10px] block uppercase font-semibold">In-Care Patient Chart</span>
            <span className="font-bold text-white truncate max-w-[200px] block">
              {selectedPatient?.lastName || 'Patient'}, {selectedPatient?.firstName || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Pinned Patient Record Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-200 shrink-0">
            {(selectedPatient?.lastName || 'P')[0]}{(selectedPatient?.firstName || 'P')[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Patient Record
              </span>
              <span className="font-bold text-slate-900 text-sm">
                Patient: {selectedPatient?.lastName || 'Patient'}, {selectedPatient?.firstName || ''}
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                {selectedPatient?.mrn || 'N/A'}
              </span>
              <span className="text-xs text-slate-500">
                {(selectedPatient?.dateOfBirth ? calculateAgeFromDob(selectedPatient.dateOfBirth, selectedPatient.age) : selectedPatient?.age) || 30}y • {selectedPatient?.gender || 'Unknown'} • Type {selectedPatient?.bloodGroup || 'O+'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Location: {selectedPatient?.room || 'Outpatient Clinic'} • Status: {selectedPatient?.status || 'Active'}
            </div>
          </div>
        </div>

        {/* Action Controls & Allergy Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedPatient?.allergies && !selectedPatient?.allergies?.includes('NKDA') ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>Allergy: {selectedPatient?.allergies}</span>
            </div>
          ) : (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
              NKDA
            </span>
          )}

          <button
            onClick={() => { setPreviewReport(null); setShowReportModal(true); }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Scan / Report</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              activeTab === 'reports'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-blue-600" />
            <span>Reports ({patientReports.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PATIENTS DIRECTORY */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Clinic Appointment Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase text-slate-800">Clinic Appointment & Consultation Queue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setScheduleFilter('MY_SCHEDULE')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      scheduleFilter === 'MY_SCHEDULE'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Schedule ({myAppointments.length})
                  </button>
                  <button
                    onClick={() => setScheduleFilter('ALL_CLINIC')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      scheduleFilter === 'ALL_CLINIC'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Clinic ({allClinicAppointments.length})
                  </button>
                </div>
              </div>
            </div>

            {displayedAppointments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {displayedAppointments.map(a => (
                  <div
                    key={a.id}
                    onClick={() => { setSelectedPatientId(a.mrn || a.patientId); setActiveTab('soap'); }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                      (a.mrn && selectedPatient?.mrn && a.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
                      Number(a.patientId) === Number(selectedPatient?.id)
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{a.patientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {a.timeSlot}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <div>{a.mrn} • {a.room}</div>
                      <div className="text-slate-500 italic mt-0.5 truncate">Reason: {a.reason}</div>
                      <div className="text-blue-700 font-medium text-[10px] mt-0.5">Physician: {a.doctorName}</div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-blue-600 font-semibold">{a.date}</span>
                      <span className="text-blue-700 font-bold hover:underline">Open Chart →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No scheduled consultations found in this view. Switch to "All Clinic" or select a registered patient below from the Master Patient Index.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or MRN..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddPatientModal(true)}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase text-slate-800">
                  Master Patient Index (MPI Directory: {filteredPatients.length} Registered Patients)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any row or button to load their clinical chart & encounter
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">MRN</th>
                    <th className="px-5 py-3">Patient Name</th>
                    <th className="px-5 py-3">Age / Sex</th>
                    <th className="px-5 py-3">Allergies</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map(p => (
                    <tr 
                      key={p.mrn || p.id}
                      onClick={() => { setSelectedPatientId(p.mrn || p.id); setActiveTab('soap'); }}
                      className={`hover:bg-slate-50 cursor-pointer transition ${
                        (p.mrn && selectedPatient?.mrn && p.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
                        Number(p.id) === Number(selectedPatient?.id) ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{p.mrn}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{p.lastName}, {p.firstName}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {(p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth, p.age) : p.age) || 30}y • {p.gender}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.allergies && !p.allergies.includes('NKDA') ? (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            ⚠️ {p.allergies}
                          </span>
                        ) : (
                          <span className="text-slate-400">NKDA</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{p.phone}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPatientId(p.mrn || p.id); setActiveTab('soap'); }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                        >
                          <span>Open Chart →</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CLINICAL SOAP NOTES & VITALS */}
      {activeTab === 'soap' && (
        <div className="space-y-5">
          
          {/* Vitals Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Triage Physiological Vitals</span>
              <button
                onClick={() => updateVitals(vitals)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Save Vitals
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Blood Pressure (mmHg)</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={vitals?.bpSystolic ?? 120}
                    onChange={(e) => setVitals(prev => ({ ...(prev || {}), bpSystolic: Number(e.target.value) }))}
                    className="w-14 px-2 py-1 bg-white text-slate-900 border border-slate-300 rounded font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-slate-500 font-bold">/</span>
                  <input
                    type="number"
                    value={vitals?.bpDiastolic ?? 80}
                    onChange={(e) => setVitals(prev => ({ ...(prev || {}), bpDiastolic: Number(e.target.value) }))}
                    className="w-14 px-2 py-1 bg-white text-slate-900 border border-slate-300 rounded font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                {(vitals?.bpSystolic ?? 120) >= 140 && (
                  <span className="text-[10px] text-rose-600 font-bold block mt-1">⚠️ High BP Alert</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Heart Rate (bpm)</span>
                <input
                  type="number"
                  value={vitals?.heartRate ?? 72}
                  onChange={(e) => setVitals(prev => ({ ...(prev || {}), heartRate: Number(e.target.value) }))}
                  className="w-full px-2 py-1 bg-white text-slate-900 border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">SpO2 Oxygen (%)</span>
                <input
                  type="number"
                  value={vitals?.spo2 ?? 99}
                  onChange={(e) => setVitals(prev => ({ ...(prev || {}), spo2: Number(e.target.value) }))}
                  className="w-full px-2 py-1 bg-white text-slate-900 border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Temperature (°F)</span>
                <input
                  type="number"
                  step="0.1"
                  value={vitals?.temp ?? 98.6}
                  onChange={(e) => setVitals(prev => ({ ...(prev || {}), temp: Number(e.target.value) }))}
                  className="w-full px-2 py-1 bg-white text-slate-900 border border-slate-300 rounded font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* SOAP Note Textareas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-xs font-bold uppercase text-slate-800">Clinical SOAP Notes</span>
                <p className="text-[11px] text-slate-400">Subjective, Objective, Assessment, and Plan</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateSoap(soap)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Notes
                </button>
                {!encounter.isSigned ? (
                  <button
                    onClick={signEncounter}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Sign & Close Visit
                  </button>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
                    ✓ Signed by {encounter.doctor || currentUser?.fullName || 'Attending Physician'} at {encounter.signedAt}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1">
                <span className="font-bold text-blue-700">S — Subjective</span>
                <textarea
                  rows={3}
                  value={soap?.subjective ?? ''}
                  onChange={(e) => setSoap(prev => ({ ...(prev || {}), subjective: e.target.value }))}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1">
                <span className="font-bold text-blue-700">O — Objective</span>
                <textarea
                  rows={3}
                  value={soap?.objective ?? ''}
                  onChange={(e) => setSoap(prev => ({ ...(prev || {}), objective: e.target.value }))}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700">A — Assessment (Diagnosis)</span>
                  <span className="text-[10px] text-slate-400">ICD-10 Quick-Insert:</span>
                </div>
                <div className="flex flex-wrap gap-1 pb-1">
                  {[
                    { code: 'J20.9', label: 'Bronchitis' },
                    { code: 'I10', label: 'Hypertension' },
                    { code: 'E11.9', label: 'Type 2 Diabetes' },
                    { code: 'J45.909', label: 'Asthma' },
                    { code: 'R05.9', label: 'Cough' },
                  ].map(diag => (
                    <button
                      key={diag.code}
                      type="button"
                      onClick={() => {
                        const addition = `${diag.label} (${diag.code})`;
                        setSoap(prev => ({
                          ...(prev || {}),
                          assessment: prev?.assessment ? `${prev.assessment}\n• ${addition}` : `• ${addition}`
                        }));
                      }}
                      className="text-[10px] px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 font-medium transition"
                    >
                      + {diag.code}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={soap?.assessment ?? ''}
                  onChange={(e) => setSoap(prev => ({ ...(prev || {}), assessment: e.target.value }))}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1">
                <span className="font-bold text-blue-700">P — Plan</span>
                <textarea
                  rows={3}
                  value={soap?.plan ?? ''}
                  onChange={(e) => setSoap(prev => ({ ...(prev || {}), plan: e.target.value }))}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Previous Encounters History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold uppercase text-slate-700">Previous Clinical Encounters (Continuity of Care)</span>
              <span className="text-[11px] text-slate-400 font-medium">{selectedPatient?.firstName || ''} {selectedPatient?.lastName || ''}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">Annual Wellness Exam & Preventive Care</div>
                  <div className="text-[11px] text-slate-500">Aug 12, 2026 • Attending: Dr. Sarah Smith, MD • Exam Room 2</div>
                  <div className="text-[11px] text-slate-600 mt-1">Diagnosis: Essential Hypertension (I10) • Normal EKG • Lipid Panel Ordered</div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[10px] self-start sm:self-center">
                  ✓ Closed & Signed
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">Outpatient Consultation & Allergy Workup</div>
                  <div className="text-[11px] text-slate-500">Jul 03, 2026 • Attending: Dr. Michael Chang, MD • Clinic Suite B</div>
                  <div className="text-[11px] text-slate-600 mt-1">Diagnosis: Adverse Drug Reaction (T88.7XXA) • Confirmed Penicillin Allergy</div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[10px] self-start sm:self-center">
                  ✓ Closed & Signed
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: CPOE DIAGNOSTIC ORDERS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          
          {/* Order Placement Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="font-bold text-slate-800 uppercase block">Place Diagnostic Order</span>
            
            <form onSubmit={handleOrderSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Test Type</label>
                <select
                  value={newOrderType}
                  onChange={(e) => setNewOrderType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Laboratory">Laboratory (Blood/Urine)</option>
                  <option value="Radiology">Radiology (X-Ray/CT)</option>
                  <option value="Procedure">Procedure (ECG)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC)"
                  value={newOrderName}
                  onChange={(e) => setNewOrderName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Priority</label>
                <select
                  value={newOrderPriority}
                  onChange={(e) => setNewOrderPriority(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="STAT">🚨 STAT (High Priority)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Place Order
              </button>
            </form>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-800 uppercase block">Diagnostic Orders Worklist</span>
              <span className="text-xs text-slate-500 font-medium">Chart: <strong className="text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.mrn})</strong></span>
            </div>
            
            <div className="space-y-2.5">
              {patientOrders.length > 0 ? (
                patientOrders.map(o => (
                  <div key={o.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{o.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {o.type} • Priority: <strong className={o.priority === 'STAT' ? 'text-rose-600' : 'text-slate-700'}>{o.priority}</strong> • Ordered: {o.orderedAt}
                      </div>
                      {o.result && (
                        <div className="mt-1 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] border border-emerald-200">
                          <strong>Result:</strong> {o.result}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {o.status === 'Pending' ? (
                        <button
                          onClick={() => { setActiveResultOrder(o); setResultText('Normal reference values.'); }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium"
                        >
                          Enter Result
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold">✓ Fulfilled</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No diagnostic laboratory or radiology orders placed for {selectedPatient.firstName} {selectedPatient.lastName} yet.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 4: e-PRESCRIBING & MEDICATION MANAGEMENT */}
      {activeTab === 'prescriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          
          {/* Prescribe Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="font-bold text-slate-800 uppercase block">e-Prescribe Medication</span>
            
            {/* Clinical Allergy Reference */}
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Clinical Safety Alert Reference:</span>
              <button
                type="button"
                onClick={() => setRxDrug('Amoxicillin Oral Capsule')}
                className="w-full text-left text-xs text-rose-900 font-semibold underline"
              >
                + Select Amoxicillin (Cross-reacts with Penicillin allergy)
              </button>
            </div>

            <form onSubmit={handlePrescribeSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Drug Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Albuterol or Amoxicillin"
                  value={rxDrug}
                  onChange={(e) => setRxDrug(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Dosage</label>
                <input
                  type="text"
                  value={rxDose}
                  onChange={(e) => setRxDose(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Frequency</label>
                <input
                  type="text"
                  value={rxFreq}
                  onChange={(e) => setRxFreq(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Prescribe Drug
              </button>
            </form>
          </div>

          {/* Active Medications List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-800 uppercase block">Active Patient Medications</span>
              <span className="text-xs text-slate-500 font-medium">Chart: <strong className="text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.mrn})</strong></span>
            </div>
            
            <div className="space-y-2.5">
              {patientPrescriptions.length > 0 ? (
                patientPrescriptions.map(p => (
                  <div key={p.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.dosage} • {p.frequency} • {p.duration}
                      </div>
                      {p.override && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                          ⚠️ Overridden: {p.override}
                        </span>
                      )}
                    </div>

                    {p.status === 'Active' ? (
                      <button
                        onClick={() => discontinueRx(p.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs"
                      >
                        Discontinue
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Discontinued</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No active prescriptions documented for {selectedPatient.firstName} {selectedPatient.lastName} yet.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 5: DIAGNOSTIC REPORTS & SCANS */}
      {activeTab === 'reports' && (
        <div className="space-y-4 text-xs">
          
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Clinical Document Vault
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center space-x-2">
                  <FolderLock className="w-5 h-5 text-blue-600" />
                  <span>Diagnostic Reports & Scans — {selectedPatient.lastName}, {selectedPatient.firstName}</span>
                </h2>
                <p className="text-slate-500 mt-0.5 text-xs">
                  Review verified laboratory results, radiology DICOM scans, pathology impressions, and outside patient records.
                </p>
              </div>

              <button
                onClick={() => { setPreviewReport(null); setShowReportModal(true); }}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Report / Scan</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Total Documents</span>
                <span className="text-base font-bold text-slate-900">{patientReports.length}</span>
              </div>
              <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl">
                <span className="text-purple-600 text-[11px] block">Radiology / Scans</span>
                <span className="text-base font-bold text-purple-900">
                  {patientReports.filter(r => r.reportType === 'RADIOLOGY').length}
                </span>
              </div>
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <span className="text-blue-600 text-[11px] block">Laboratory & Pathology</span>
                <span className="text-base font-bold text-blue-900">
                  {patientReports.filter(r => ['LABORATORY', 'PATHOLOGY'].includes(r.reportType)).length}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-emerald-700 text-[11px] block">Patient Uploads</span>
                <span className="text-base font-bold text-emerald-900">
                  {patientReports.filter(r => r.uploaderRole === 'ROLE_PATIENT').length}
                </span>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'RADIOLOGY', 'LABORATORY', 'PATHOLOGY', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setReportFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                      reportFilter === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Search reports or notes..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map(rep => (
                <div key={rep.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          rep.reportType === 'RADIOLOGY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          rep.reportType === 'LABORATORY' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          rep.reportType === 'PATHOLOGY' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rep.reportType}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">{rep.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{rep.reportDate}</span>
                    </div>

                    <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                      <span className="font-semibold text-slate-900 block mb-0.5">Clinical Findings & Impression:</span>
                      {rep.notes || 'Official diagnostic document filed in patient chart.'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 px-1">
                      <div>
                        File: <span className="font-medium text-slate-800">{rep.fileName}</span> <span className="text-slate-400">({rep.fileSize || '1.8 MB'})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {rep.uploaderRole === 'ROLE_PATIENT' ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Patient Record ({rep.uploadedBy})
                          </span>
                        ) : (
                          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Physician File ({rep.uploadedBy})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => { setPreviewReport(rep); setShowReportModal(true); }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center space-x-1.5 transition text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Document</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadFile(rep)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold flex items-center space-x-1.5 transition text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => deleteReport(rep.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No diagnostic reports found for this patient</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {reportSearch || reportFilter !== 'ALL'
                  ? 'No documents match the current filter or search criteria.'
                  : 'There are no radiology scans, laboratory reports, or patient-uploaded records on file yet.'}
              </p>
              <button
                onClick={() => { setPreviewReport(null); setShowReportModal(true); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Clinical Report</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* MODAL: DRUG ALLERGY WARNING (Clinical Safety) */}
      {showAllergyModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border-2 border-rose-500 text-xs">
            <div className="flex items-center space-x-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">CRITICAL ALLERGY ALERT</h3>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              Patient <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong> has a documented allergy to <strong>{selectedPatient.allergies}</strong>.
              <p className="mt-1 text-slate-600">Prescribing {rxDrug} is contraindicated.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Override Reason:</label>
              <select
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Clinical benefit outweighs risk with close monitoring">Clinical benefit outweighs risk with monitoring</option>
                <option value="No effective alternative available">No effective alternative available</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ack"
                checked={overrideAck}
                onChange={(e) => setOverrideAck(e.target.checked)}
              />
              <label htmlFor="ack" className="text-slate-700">I confirm clinical responsibility for this override</label>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowAllergyModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={!overrideAck}
                onClick={handleForceOverride}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-40"
              >
                Override & Prescribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENTER TEST RESULT */}
      {activeResultOrder && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold text-sm text-slate-900">Document Lab Result</h3>
            <p className="text-slate-500">{activeResultOrder.name}</p>

            <textarea
              rows={3}
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter laboratory findings..."
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveResultOrder(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { completeOrderResult(activeResultOrder.id, resultText); setActiveResultOrder(null); }}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-3.5 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Register New Patient & Provision Portal</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Enrolls into EHR Master Patient Index & activates patient login credentials.</p>
              </div>
              <button onClick={() => setShowAddPatientModal(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handlePatientSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aisha"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => {
                      const dobVal = e.target.value;
                      setNewPatient({ ...newPatient, dateOfBirth: dobVal, age: calculateAgeFromDob(dobVal, newPatient.age || 30) });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Patient Email</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Documented Allergies *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penicillin, NSAIDs or None (NKDA)"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Login Credentials Box */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-900 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Patient Portal Sign-In Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Assigned Username</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if blank"
                      value={newPatient.username}
                      onChange={(e) => setNewPatient({ ...newPatient, username: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Initial Password</label>
                    <input
                      type="text"
                      placeholder="Patient#2026"
                      value={newPatient.password}
                      onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-blue-700">The patient can sign into the Patient Portal immediately using this username and password.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Patient & Create Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDICAL REPORT VAULT MODAL (UPLOAD & VIEWER) */}
      <MedicalReportVaultModal
        isOpen={showReportModal}
        onClose={() => { setShowReportModal(false); setPreviewReport(null); }}
        previewReport={previewReport}
      />

    </div>
  );
};
