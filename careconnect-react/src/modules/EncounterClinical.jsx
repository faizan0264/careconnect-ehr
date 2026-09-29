import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  Heart, 
  Activity, 
  Wind, 
  Thermometer, 
  Clock, 
  ShieldCheck, 
  FileEdit, 
  Save, 
  CheckCircle,
  FlaskConical,
  Pill
} from 'lucide-react';

export const EncounterClinical = () => {
  const { 
    encounters, 
    activePatient, 
    updateVitals, 
    updateSoapNotes, 
    completeEncounter, 
    setCurrentView 
  } = useEhr();

  const currentEncounter = encounters.find(e => e.patientId === activePatient.id) || encounters[0];

  const [vitals, setVitals] = useState(currentEncounter.vitals);
  const [soap, setSoap] = useState(currentEncounter.soap);

  const calculateMAP = () => {
    return Math.round(vitals.diastolicBp + (vitals.systolicBp - vitals.diastolicBp) / 3);
  };

  const handleSaveVitals = () => {
    updateVitals(currentEncounter.id, vitals);
  };

  const handleSaveSoap = () => {
    updateSoapNotes(currentEncounter.id, soap);
  };

  const handleCompleteVisit = () => {
    handleSaveSoap();
    handleSaveVitals();
    completeEncounter(currentEncounter.id);
  };

  const isCompleted = currentEncounter.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Clinical Encounter Ribbon & Sub-Module Tabs */}
      <div className="border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 no-print">
        
        {/* Clinical Workflow Tabs */}
        <div className="flex space-x-6 text-xs sm:text-sm font-bold">
          <button 
            onClick={() => setCurrentView('encounter')}
            className="border-b-2 border-hospital-600 text-hospital-700 pb-2.5 flex items-center space-x-2"
          >
            <FileEdit className="w-4 h-4 text-hospital-600" />
            <span>Clinical Documentation (SOAP)</span>
          </button>

          <button 
            onClick={() => setCurrentView('cpoe')}
            className="border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-2.5 flex items-center space-x-2"
          >
            <FlaskConical className="w-4 h-4 text-slate-400" />
            <span>CPOE Diagnostic Orders</span>
            <span className="bg-hospital-100 text-hospital-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-black">
              2
            </span>
          </button>

          <button 
            onClick={() => setCurrentView('medications')}
            className="border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-2.5 flex items-center space-x-2"
          >
            <Pill className="w-4 h-4 text-slate-400" />
            <span>Medications & Prescribing</span>
            <span className="bg-hospital-100 text-hospital-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-black">
              2
            </span>
          </button>
        </div>

        {/* Visit Status & Finalize Button */}
        <div className="flex items-center space-x-3">
          {!isCompleted ? (
            <span className="bg-sky-50 text-hospital-700 border border-sky-300 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-hospital-600 mr-2 animate-ping"></span>
              ENCOUNTER IN PROGRESS
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              COMPLETED & LOCKED
            </span>
          )}

          {!isCompleted && (
            <button
              onClick={handleCompleteVisit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign & Finalize Visit</span>
            </button>
          )}
        </div>
      </div>

      {/* Chief Complaint Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs">
        <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-900 uppercase tracking-wide">
            Encounter Session: {currentEncounter.encounterDate} • Attending: {currentEncounter.provider}
          </span>
          <p className="text-amber-800 mt-1 font-medium leading-relaxed">
            <strong>Chief Complaint:</strong> {currentEncounter.reasonForVisit}
          </p>
        </div>
      </div>

      {/* SECTION 1: TRIAGE VITALS TELEMETRY GRID */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-hospital-600" />
              <span>Physiological Vital Signs & Triage Panel</span>
            </h3>
            <p className="text-xs text-slate-400">Captured at triage with real-time abnormal alert flags</p>
          </div>
          <button
            onClick={handleSaveVitals}
            disabled={isCompleted}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition border border-slate-300 disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Vitals</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
          
          {/* Blood Pressure Card */}
          <div className={`p-3.5 rounded-xl border ${
            vitals.systolicBp >= 140 
              ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="block font-bold text-slate-600 mb-1 flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>BP (mmHg)</span>
            </label>
            <div className="flex items-center space-x-1 mt-1">
              <input
                type="number"
                disabled={isCompleted}
                value={vitals.systolicBp}
                onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                className="w-14 px-2 py-1 border rounded-lg text-center font-black bg-white"
              />
              <span className="text-slate-400 font-bold">/</span>
              <input
                type="number"
                disabled={isCompleted}
                value={vitals.diastolicBp}
                onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                className="w-14 px-2 py-1 border rounded-lg text-center font-black bg-white"
              />
            </div>
            {vitals.systolicBp >= 140 ? (
              <div className="text-[10px] text-rose-700 font-black mt-1.5 flex items-center space-x-1">
                <span>⚠️ Stage 2 HTN</span>
              </div>
            ) : (
              <div className="text-[10px] text-emerald-600 font-bold mt-1.5">
                ✓ Normal Pressure
              </div>
            )}
          </div>

          {/* Heart Rate Card */}
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200">
            <label className="block font-bold text-slate-600 mb-1 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-hospital-600" />
              <span>Pulse (bpm)</span>
            </label>
            <input
              type="number"
              disabled={isCompleted}
              value={vitals.pulseBpm}
              onChange={(e) => setVitals({ ...vitals, pulseBpm: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded-lg font-black bg-white mt-1"
            />
            <div className="text-[10px] text-slate-400 mt-1.5">Norm: 60-100</div>
          </div>

          {/* SpO2 Oxygen Card */}
          <div className={`p-3.5 rounded-xl border ${
            vitals.spo2Percent < 95 
              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="block font-bold text-slate-600 mb-1 flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              <span>SpO2 (%)</span>
            </label>
            <input
              type="number"
              disabled={isCompleted}
              value={vitals.spo2Percent}
              onChange={(e) => setVitals({ ...vitals, spo2Percent: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded-lg font-black bg-white mt-1"
            />
            {vitals.spo2Percent < 95 ? (
              <div className="text-[10px] text-amber-700 font-black mt-1.5">
                ⚠️ Mild Hypoxia
              </div>
            ) : (
              <div className="text-[10px] text-emerald-600 font-bold mt-1.5">
                ✓ Normal O2
              </div>
            )}
          </div>

          {/* Temperature Card */}
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200">
            <label className="block font-bold text-slate-600 mb-1 flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>Temp (°F)</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isCompleted}
              value={vitals.temperatureF}
              onChange={(e) => setVitals({ ...vitals, temperatureF: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded-lg font-black bg-white mt-1"
            />
            <div className="text-[10px] text-slate-400 mt-1.5">Norm: 97.8 - 99.0</div>
          </div>

          {/* Respiration Rate Card */}
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200">
            <label className="block font-bold text-slate-600 mb-1">Resp. (/min)</label>
            <input
              type="number"
              disabled={isCompleted}
              value={vitals.respiratoryRate}
              onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded-lg font-black bg-white mt-1"
            />
            <div className="text-[10px] text-slate-400 mt-1.5">Norm: 12-20</div>
          </div>

          {/* Calculated MAP */}
          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 flex flex-col justify-between">
            <label className="block font-bold text-slate-600 mb-1">Calculated MAP</label>
            <div className="text-base font-black text-slate-900 font-mono">
              {calculateMAP()} <span className="text-xs text-slate-400 font-normal">mmHg</span>
            </div>
            <div className="text-[10px] text-slate-400">Mean Arterial Pres.</div>
          </div>

        </div>
      </div>

      {/* SECTION 2: STRUCTURED SOAP CLINICAL DOCUMENTATION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <FileEdit className="w-4 h-4 text-hospital-600" />
              <span>Standard Clinical Documentation (SOAP Framework)</span>
            </h3>
            <p className="text-xs text-slate-400">Official legal chart record for this encounter</p>
          </div>
          <button
            onClick={handleSaveSoap}
            disabled={isCompleted}
            className="px-4 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-lg text-xs shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save SOAP Notes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* S: Subjective */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-hospital-800 text-sm">S — Subjective</span>
              <span className="text-[10px] text-slate-400">Patient's narrative & symptoms</span>
            </div>
            <textarea
              rows={4}
              disabled={isCompleted}
              value={soap.subjective}
              onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>

          {/* O: Objective */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-hospital-800 text-sm">O — Objective</span>
              <span className="text-[10px] text-slate-400">Physical exam & clinical findings</span>
            </div>
            <textarea
              rows={4}
              disabled={isCompleted}
              value={soap.objective}
              onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>

          {/* A: Assessment */}
          <div className="border border-hospital-300 rounded-xl p-4 bg-sky-50/30 space-y-2 ring-1 ring-hospital-200">
            <div className="flex items-center justify-between">
              <span className="font-black text-hospital-800 text-sm">A — Assessment</span>
              <span className="text-[10px] text-hospital-700 font-bold">Primary Diagnosis (ICD-10)</span>
            </div>
            <textarea
              rows={4}
              disabled={isCompleted}
              value={soap.assessment}
              onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>

          {/* P: Plan */}
          <div className="border border-hospital-300 rounded-xl p-4 bg-sky-50/30 space-y-2 ring-1 ring-hospital-200">
            <div className="flex items-center justify-between">
              <span className="font-black text-hospital-800 text-sm">P — Plan</span>
              <span className="text-[10px] text-hospital-700 font-bold">Orders, Prescriptions, Follow-Up</span>
            </div>
            <textarea
              rows={4}
              disabled={isCompleted}
              value={soap.plan}
              onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium leading-relaxed"
            />
          </div>

        </div>

        {/* Electronic Signature Stamp */}
        {currentEncounter.isSigned && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black uppercase tracking-wider text-emerald-900">
                  ELECTRONICALLY SIGNED & VERIFIED
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Signed by {currentEncounter.signedBy} at {currentEncounter.signedAt} • Legal Record Locked
                </div>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-white px-2.5 py-1 rounded border border-emerald-200 font-bold">
              SHA-256 SECURED
            </span>
          </div>
        )}

      </div>

    </div>
  );
};
