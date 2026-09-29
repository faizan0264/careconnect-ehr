import React from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  HeartHandshake, 
  Pill, 
  FlaskConical, 
  Printer, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';

export const PatientPortal = () => {
  const { activePatient, prescriptions, cpoeOrders, encounters } = useEhr();

  const activeMeds = prescriptions.filter(p => p.status === 'ACTIVE');
  const completedLabs = cpoeOrders.filter(o => o.status === 'COMPLETED');
  const pendingLabs = cpoeOrders.filter(o => o.status === 'PENDING');
  const recentEncounter = encounters.find(e => e.patientId === activePatient.id) || encounters[0];

  const handlePrintAVS = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Portal Brand Header Banner */}
      <div className="bg-gradient-to-r from-hospital-950 via-hospital-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-hospital-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-black px-3 py-1 rounded-full border border-teal-400/30 uppercase tracking-widest flex items-center space-x-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
              <span>Patient Health Portal</span>
            </span>
            <span className="text-xs font-mono text-hospital-200 font-bold bg-white/10 px-2 py-0.5 rounded">
              {activePatient.mrn}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome to Your Health Chart, {activePatient.firstName}
          </h1>
          <p className="text-xs text-hospital-200 max-w-xl leading-relaxed">
            Review your verified medical records, active doctor-prescribed medications, completed laboratory results, and download your personalized After-Visit Summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 no-print">
          <button
            onClick={handlePrintAVS}
            className="px-4 py-2.5 bg-white text-hospital-950 hover:bg-slate-100 font-black text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-hospital-700" />
            <span>Print After-Visit Summary (AVS)</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Active Prescriptions
          </span>
          <div className="text-2xl font-black text-hospital-700">
            {activeMeds.length}
          </div>
          <span className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Current daily regimens</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Diagnostic Reports
          </span>
          <div className="text-2xl font-black text-teal-700">
            {completedLabs.length}
          </div>
          <span className="text-slate-500 font-semibold text-[11px]">
            {pendingLabs.length} test specimen in laboratory
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Documented Allergies
          </span>
          <div className="text-sm font-extrabold text-rose-600 truncate mt-1">
            {activePatient.allergies}
          </div>
          <span className="text-slate-400 text-[10px] block">
            Verified with Care Team
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Attending Physician
          </span>
          <div className="text-sm font-extrabold text-slate-800 truncate mt-1">
            {recentEncounter.provider}
          </div>
          <span className="text-hospital-600 text-[11px] font-semibold">
            CareConnect Ambulatory Pulmonology
          </span>
        </div>
      </div>

      {/* Two-Column Primary Clinical View: Medications + Diagnostic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: MY ACTIVE MEDICATIONS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-hospital-100 flex items-center justify-center text-hospital-700">
                <Pill className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">My Active Medications</h2>
                <p className="text-xs text-slate-400">Current doctor-prescribed treatment schedule</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Active Regimen
            </span>
          </div>

          <div className="space-y-3.5">
            {activeMeds.map(med => (
              <div
                key={med.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{med.drugName}</h3>
                    <div className="text-xs font-bold text-hospital-700 mt-0.5">
                      {med.dosage} • {med.frequency}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {med.route}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
                  <span className="text-hospital-600 font-bold flex-shrink-0">Directions:</span>
                  <span className="font-medium leading-relaxed">{med.instructions}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Prescribed by {med.prescribedBy}</span>
                  <span>Duration: {med.durationDays} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: MY DIAGNOSTIC LAB & RADIOLOGY RESULTS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                <FlaskConical className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Diagnostic Reports & Results</h2>
                <p className="text-xs text-slate-400">Official findings signed off by clinical team</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">Auto-synced</span>
          </div>

          <div className="space-y-4">
            {completedLabs.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-teal-200 bg-teal-50/20 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-black px-2.5 py-0.5 rounded-full uppercase">
                      {order.orderType} REPORT
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">{order.orderName}</h3>
                  </div>
                  <span className="text-xs font-bold text-teal-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed & Reviewed</span>
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Radiologist / Physician Impression:
                  </span>
                  <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {order.resultValue}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Ordered at {order.orderedAt}</span>
                  <span>Fulfilled at {order.completedAt}</span>
                </div>
              </div>
            ))}

            {pendingLabs.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 opacity-80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <h3 className="text-xs font-bold text-slate-800">{order.orderName}</h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Specimen in Laboratory Analysis
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Specimen collected. Official findings will automatically populate here upon fulfillment.
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 3: AFTER-VISIT SUMMARY (AVS) & CONSULTATION DETAIL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
        <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Latest Clinical Consultation & After-Visit Summary (AVS)
            </h2>
            <p className="text-xs text-slate-400">
              Encounter on {recentEncounter.encounterDate} with {recentEncounter.provider}
            </p>
          </div>
          <span className="text-xs font-bold text-hospital-800 bg-hospital-50 px-3 py-1 rounded-full border border-hospital-200 inline-flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-hospital-600" />
            <span>Verified Medical Record</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Reason for Consultation
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {recentEncounter.reasonForVisit}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Triage Vitals Captured
            </span>
            <p className="text-slate-800 font-medium">
              Blood Pressure: <strong>{recentEncounter.vitals.systolicBp}/{recentEncounter.vitals.diastolicBp} mmHg</strong>
            </p>
            <p className="text-slate-800 font-medium">
              Pulse: <strong>{recentEncounter.vitals.pulseBpm} bpm</strong> • SpO2: <strong>{recentEncounter.vitals.spo2Percent}%</strong>
            </p>
          </div>

          <div className="p-4 bg-hospital-50/60 rounded-2xl border border-hospital-200 space-y-1">
            <span className="font-bold text-hospital-900 block uppercase tracking-wider text-[10px]">
              Clinical Assessment & Diagnosis
            </span>
            <p className="text-hospital-950 font-extrabold leading-relaxed">
              Acute Bronchitis with reactive bronchospasm (J20.9). Stage 2 Essential Hypertension (I10).
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
