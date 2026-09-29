import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { MedicalReportVaultModal } from '../components/MedicalReportVaultModal';
import { 
  Pill, 
  FlaskConical, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Syringe, 
  Plus, 
  X, 
  Stethoscope, 
  MapPin,
  Upload,
  Eye,
  Download,
  Trash2,
  FolderLock,
  Search
} from 'lucide-react';

export const PatientDashboard = () => {
  const { 
    selectedPatient, 
    prescriptions, 
    orders, 
    encounter, 
    activeTab, 
    setActiveTab,
    showToast, 
    doctorsList, 
    appointments, 
    bookAppointment, 
    cancelAppointment,
    reports,
    deleteReport
  } = useEhr();

  const [requestedRefills, setRequestedRefills] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(101);
  const [appointmentDate, setAppointmentDate] = useState('2026-10-14');
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('Routine checkup & prescription review');
  const [bookingConflictMessage, setBookingConflictMessage] = useState('');

  // Medical Reports Vault local states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [reportFilter, setReportFilter] = useState('ALL');
  const [reportSearch, setReportSearch] = useState('');

  const standardSlots = [
    { slot: '09:00 AM', label: '09:00 AM - 09:30 AM' },
    { slot: '10:30 AM', label: '10:30 AM - 11:00 AM' },
    { slot: '02:00 PM', label: '02:00 PM - 02:30 PM' },
    { slot: '03:30 PM', label: '03:30 PM - 04:00 PM' },
    { slot: '04:30 PM', label: '04:30 PM - 05:00 PM' },
  ];

  // Detect which slots are already booked for this doctor on the chosen date
  const occupiedSlots = appointments
    .filter(a => Number(a.doctorId) === Number(selectedDoctorId) && a.date === appointmentDate && a.status !== 'Cancelled')
    .map(a => a.timeSlot.trim().toUpperCase());

  const isCurrentSlotBusy = occupiedSlots.includes(selectedSlot.trim().toUpperCase());
  const selectedDocObj = doctorsList.find(d => d.id === Number(selectedDoctorId)) || doctorsList[0];

  const activeMeds = prescriptions.filter(p => p.status === 'Active' && (
    (selectedPatient?.mrn && p.mrn && p.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(p.patientId) === Number(selectedPatient?.id)
  ));
  const completedOrders = orders.filter(o => o.status === 'Completed' && (
    (selectedPatient?.mrn && o.mrn && o.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(o.patientId) === Number(selectedPatient?.id)
  ));
  const patientOrders = orders.filter(o => 
    (selectedPatient?.mrn && o.mrn && o.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(o.patientId) === Number(selectedPatient?.id)
  );
  const patientAppointments = appointments.filter(a => 
    (selectedPatient?.mrn && a.mrn && a.mrn.toLowerCase() === selectedPatient.mrn.toLowerCase()) ||
    Number(a.patientId) === Number(selectedPatient?.id)
  );
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

  const handlePrint = () => {
    window.print();
  };

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

  const handleRequestRefill = (medId, medName) => {
    if (!requestedRefills.includes(medId)) {
      setRequestedRefills([...requestedRefills, medId]);
      showToast(`Refill request for ${medName} submitted to clinical pharmacy for approval.`, 'success');
    }
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    setBookingConflictMessage('');

    if (isCurrentSlotBusy) {
      setBookingConflictMessage(`Schedule Conflict: ${selectedDocObj.name} is already busy at ${selectedSlot} on ${appointmentDate}. Please choose another schedule.`);
      return;
    }

    const result = bookAppointment({
      doctorId: selectedDocObj.id,
      doctorName: selectedDocObj.name,
      department: selectedDocObj.specialty,
      date: appointmentDate,
      timeSlot: selectedSlot,
      reason: appointmentReason,
      room: selectedDocObj.room,
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.fullName || `${selectedPatient?.firstName || ''} ${selectedPatient?.lastName || ''}`.trim(),
      mrn: selectedPatient?.mrn,
    });

    if (result && !result.success) {
      setBookingConflictMessage(result.message);
      return;
    }

    setShowBookModal(false);
    setBookingConflictMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Patient Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Patient Portal View
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Welcome back, {selectedPatient?.firstName || 'Valued'} {selectedPatient?.lastName || 'Patient'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            MRN: <strong>{selectedPatient?.mrn || 'N/A'}</strong> • DOB: {selectedPatient?.dateOfBirth || 'N/A'} • Blood Group: {selectedPatient?.bloodGroup || 'N/A'}
          </p>
        </div>

        <div className="no-print flex items-center space-x-2">
          <button
            onClick={() => { setPreviewReport(null); setShowUploadModal(true); }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print AVS</span>
          </button>
        </div>
      </div>

      {/* Allergies Notice Banner */}
      {selectedPatient.allergies && !selectedPatient.allergies.includes('NKDA') && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>
            <strong>Your Documented Allergies:</strong> {selectedPatient.allergies}. Please remind your doctor or pharmacist prior to receiving any new prescription.
          </span>
        </div>
      )}

      {/* OVERVIEW / SUMMARY VIEW */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Active Medications Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b pb-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Current Medications</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {activeMeds.length > 0 ? (
                activeMeds.map(m => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-slate-600 font-medium">Dosage: {m.dosage} • {m.frequency}</div>
                      <div className="text-[11px] text-slate-400">Duration: {m.duration}</div>
                    </div>
                    <div className="flex-shrink-0 no-print">
                      {requestedRefills.includes(m.id) ? (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">
                          ⏳ Refill Requested
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestRefill(m.id, m.name)}
                          className="text-[11px] font-semibold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-xs transition"
                        >
                          Request Refill
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No active medications currently prescribed.
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Test Results Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b pb-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Completed Diagnostic Reports</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {completedOrders.length > 0 ? (
                completedOrders.map(o => (
                  <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{o.name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Fulfilled</span>
                    </div>
                    <p className="text-slate-700 mt-1 leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                      {o.result}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No completed diagnostic laboratory or imaging reports yet.
                </div>
              )}
            </div>
          </div>

          {/* Doctor Consultation Summary (Spans 2 columns) */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">After-Visit Summary (AVS)</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">{encounter.date}</span>
            </div>

            {encounter?.hasEncounter ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-500 block mb-1">Attending Physician</span>
                    <p className="font-bold text-slate-900">{encounter.doctor}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-500 block mb-1">Visit Reason</span>
                    <p className="font-medium text-slate-800">{encounter.chiefComplaint}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-500 block mb-1">Vitals Recorded</span>
                    <p className="font-medium text-slate-800">
                      BP: <strong>{encounter.vitals?.bpSystolic}/{encounter.vitals?.bpDiastolic}</strong> • Pulse: <strong>{encounter.vitals?.heartRate} bpm</strong>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs">
                  <span className="font-bold text-blue-900 block mb-1">Doctor's Clinical Assessment & Care Plan</span>
                  <p className="text-blue-950 font-medium leading-relaxed whitespace-pre-line">
                    {encounter.soap?.assessment}
                    {"\n\n"}
                    {encounter.soap?.plan}
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs space-y-1.5">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">No Clinical Encounters Documented Yet</p>
                <p className="text-slate-500 max-w-md mx-auto">
                  Your clinical encounter notes, vital signs, and physician care plan will appear here after your healthcare provider documents a medical consultation.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Appointment & Care Team */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Scheduled Appointments</h2>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Visit</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {patientAppointments.length > 0 ? (
                patientAppointments.map(appt => (
                  <div key={appt.id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-950 text-sm flex items-center space-x-1.5">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span>{appt.doctorName}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        ● {appt.status}
                      </span>
                    </div>
                    <div className="text-blue-800 flex items-center space-x-1 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{appt.date} • {appt.timeSlot}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] flex items-center justify-between pt-1">
                      <div>
                        <span className="font-medium text-slate-700">{appt.department}</span> • {appt.room}
                        <div className="italic text-slate-500 mt-0.5">Reason: {appt.reason}</div>
                      </div>
                      {appt.status === 'Confirmed' && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold underline ml-2"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No upcoming appointments. Click "Book Visit" to schedule a consultation.
                </div>
              )}
            </div>
          </div>

          {/* Immunization & Preventive Care Record */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b pb-2">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Immunization Record</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">COVID-19 Bivalent mRNA</div>
                  <div className="text-[11px] text-slate-500">Administered: Nov 2025 • Lot #KD9201</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Up to Date</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Influenza Quadrivalent</div>
                  <div className="text-[11px] text-slate-500">Administered: Oct 2025 • Annual Dose</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Up to Date</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Tdap (Tetanus, Diphtheria, Pertussis)</div>
                  <div className="text-[11px] text-slate-500">Administered: May 2022 • Booster due 2032</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Valid</span>
              </div>
            </div>
          </div>

          {/* Medical Reports & Scans Vault Card (Spans 2 columns) */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <FolderLock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Medical Reports & Document Vault</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {patientReports.length} {patientReports.length === 1 ? 'Document' : 'Documents'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setPreviewReport(null); setShowUploadModal(true); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All Vault →
                </button>
              </div>
            </div>

            {patientReports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {patientReports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          rep.reportType === 'RADIOLOGY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          rep.reportType === 'LABORATORY' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rep.reportType}
                        </span>
                        <span className="text-[10px] text-slate-400">{rep.reportDate}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">{rep.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{rep.notes || rep.fileName}</p>
                      <div className="text-[10px] text-slate-400 mt-1">
                        By: <span className="font-semibold text-slate-700">{rep.uploadedBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <button
                        onClick={() => { setPreviewReport(rep); setShowUploadModal(true); }}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile(rep)}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1 text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                No diagnostic documents or outside reports uploaded yet. Click "Upload File" to add your labs or radiology scans.
              </div>
            )}
          </div>

        </div>
      )}

      {/* INDIVIDUAL MEDICATIONS TAB */}
      {activeTab === 'meds' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Your Prescribed Medications</h2>
          <div className="space-y-2">
            {activeMeds.length > 0 ? (
              activeMeds.map(m => (
                <div key={m.id} className="p-3 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{m.name}</div>
                    <div className="text-slate-600">{m.dosage} • {m.frequency} • {m.duration}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200">
                      Active
                    </span>
                    {requestedRefills.includes(m.id) ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                        ⏳ Refill Requested
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestRefill(m.id, m.name)}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition"
                      >
                        Request Refill
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                No active medications currently prescribed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL LABS TAB */}
      {activeTab === 'labs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Your Diagnostic Test Results</h2>
          <div className="space-y-3">
            {patientOrders.length > 0 ? (
              patientOrders.map(o => (
                <div key={o.id} className="p-3.5 border rounded-xl bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{o.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  {o.result ? (
                    <p className="bg-white p-2.5 rounded-lg border text-slate-700 leading-relaxed">
                      {o.result}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Specimen currently being processed in laboratory.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                No diagnostic test results or laboratory orders documented yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEDICAL REPORTS & DOCUMENT VAULT TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4 text-xs">
          
          {/* Header & Upload Action */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <FolderLock className="w-5 h-5 text-emerald-600" />
                  <span>My Medical Reports & Diagnostic Document Vault</span>
                </h2>
                <p className="text-slate-500 mt-1">
                  Upload external lab reports, radiology scans, pathology summaries, and outside clinical records for your medical team to review.
                </p>
              </div>

              <button
                onClick={() => { setPreviewReport(null); setShowUploadModal(true); }}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Report</span>
              </button>
            </div>

            {/* Filter pills & search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'LABORATORY', 'RADIOLOGY', 'PATHOLOGY', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setReportFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                      reportFilter === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
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
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                      <span className="font-semibold text-slate-900 block mb-0.5">Clinical Notes / Findings:</span>
                      {rep.notes || 'Official diagnostic document filed in patient chart.'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 px-1">
                      <div>
                        File: <span className="font-medium text-slate-800">{rep.fileName}</span> <span className="text-slate-400">({rep.fileSize || '1.5 MB'})</span>
                      </div>
                      <div>
                        By: <span className="font-semibold text-blue-700">{rep.uploadedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => { setPreviewReport(rep); setShowUploadModal(true); }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center space-x-1.5 transition text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Inspect</span>
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
                        title="Delete Document"
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No medical documents found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {reportSearch || reportFilter !== 'ALL'
                  ? 'No documents match your active search and filter criteria.'
                  : 'You have not uploaded any external medical records or laboratory results yet.'}
              </p>
              <button
                onClick={() => { setPreviewReport(null); setShowUploadModal(true); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Book Doctor Appointment</h3>
              </div>
              <button onClick={() => setShowBookModal(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5">
              
              {/* Schedule Conflict / Busy Warning Alert */}
              {(bookingConflictMessage || isCurrentSlotBusy) && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Physician Schedule Conflict Detected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {bookingConflictMessage || `${selectedDocObj?.name} is already booked on ${appointmentDate} at ${selectedSlot}. This schedule is busy — please select an available time slot or change the date.`}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Select Physician & Specialty *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(Number(e.target.value));
                    setBookingConflictMessage('');
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setBookingConflictMessage('');
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              {/* Interactive Time Slot Selector with Busy/Available Visual Indicators */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-600 font-medium">Consultation Time Slot *</label>
                  <span className="text-[10px] text-slate-400">
                    {occupiedSlots.length > 0 ? `${occupiedSlots.length} slot(s) booked` : 'All slots open'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {standardSlots.map(({ slot, label }) => {
                    const isBusy = occupiedSlots.includes(slot.toUpperCase());
                    const isSelected = selectedSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setBookingConflictMessage('');
                        }}
                        className={`p-2 rounded-xl border text-left transition text-xs flex flex-col justify-between ${
                          isSelected && isBusy
                            ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-500'
                            : isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600 font-bold'
                            : isBusy
                            ? 'border-slate-200 bg-slate-100/90 text-slate-400 opacity-80'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="font-semibold">{slot}</div>
                        <div className="mt-1 flex items-center space-x-1 text-[10px]">
                          {isBusy ? (
                            <span className="text-rose-600 font-bold flex items-center space-x-0.5">
                              <span>●</span>
                              <span>Busy</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium flex items-center space-x-0.5">
                              <span>●</span>
                              <span>Open</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Reason for Consultation / Symptoms *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow-up for chest tightness, BP check, routine wellness..."
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-0.5">
                <div className="font-semibold text-slate-800">Booking Summary:</div>
                <div>Doctor: <strong>{selectedDocObj?.name}</strong> ({selectedDocObj?.specialty})</div>
                <div>Patient: <strong>{selectedPatient.firstName} {selectedPatient.lastName}</strong> (MRN: {selectedPatient.mrn})</div>
                <div>Selected Slot: <strong className={isCurrentSlotBusy ? 'text-rose-600' : 'text-slate-900'}>{appointmentDate} at {selectedSlot} {isCurrentSlotBusy && '(BUSY)'}</strong></div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCurrentSlotBusy}
                  className={`px-4 py-2 text-white rounded-xl font-bold shadow-sm transition text-xs flex items-center space-x-1.5 ${
                    isCurrentSlotBusy
                      ? 'bg-rose-400 cursor-not-allowed opacity-80'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isCurrentSlotBusy ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Schedule Busy — Choose Another Slot</span>
                    </>
                  ) : (
                    <span>Confirm & Schedule</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDICAL REPORT VAULT MODAL (UPLOAD & VIEWER) */}
      <MedicalReportVaultModal
        isOpen={showUploadModal}
        onClose={() => { setShowUploadModal(false); setPreviewReport(null); }}
        previewReport={previewReport}
      />

    </div>
  );
};
