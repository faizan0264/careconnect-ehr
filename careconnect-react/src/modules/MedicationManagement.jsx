import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  FileEdit, 
  FlaskConical, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';

export const MedicationManagement = () => {
  const { 
    currentUser,
    prescriptions, 
    checkDrugAllergy, 
    prescribeMedication, 
    discontinueMedication, 
    setCurrentView 
  } = useEhr();

  const [newMed, setNewMed] = useState({
    drugName: '',
    dosage: '',
    frequency: 'Once daily in the morning',
    route: 'ORAL',
    durationDays: 7,
    instructions: 'Take after meals with a full glass of water.',
  });

  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [matchedAllergen, setMatchedAllergen] = useState('');
  const [overrideReason, setOverrideReason] = useState('Clinical benefit outweighs risk with close monitoring');
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

  const [medToDiscontinue, setMedToDiscontinue] = useState(null);
  const [discontinueReason, setDiscontinueReason] = useState('Therapy Course Completed');

  const handleSelectQuickDrug = (name, dose, freq, route, days, inst) => {
    setNewMed({
      drugName: name,
      dosage: dose,
      frequency: freq,
      route: route,
      durationDays: days,
      instructions: inst,
    });
  };

  const handlePrescribeAttempt = (e) => {
    e.preventDefault();
    if (!newMed.drugName.trim()) return;

    const check = checkDrugAllergy(1, newMed.drugName);
    if (check.conflict) {
      setMatchedAllergen(check.allergen);
      setShowAllergyModal(true);
      setOverrideConfirmed(false);
      return;
    }

    executePrescribe();
  };

  const executePrescribe = (override = null) => {
    prescribeMedication({
      encounterId: 1001,
      patientId: 1,
      drugName: newMed.drugName,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      route: newMed.route,
      durationDays: newMed.durationDays,
      instructions: newMed.instructions,
    }, override);

    setNewMed({
      drugName: '',
      dosage: '',
      frequency: 'Once daily in the morning',
      route: 'ORAL',
      durationDays: 7,
      instructions: 'Take after meals with a full glass of water.',
    });
  };

  const handleForceOverride = () => {
    executePrescribe(overrideReason);
    setShowAllergyModal(false);
  };

  const handleChooseAlternative = () => {
    setShowAllergyModal(false);
    handleSelectQuickDrug(
      'Azithromycin Oral Tablet',
      '250 mg',
      'Once daily',
      'ORAL',
      5,
      'Take 2 tablets on day 1, then 1 tablet on days 2-5. Safe macrolide alternative.'
    );
  };

  const handleConfirmDiscontinue = () => {
    if (medToDiscontinue) {
      discontinueMedication(medToDiscontinue.id, discontinueReason);
      setMedToDiscontinue(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Sub-Module Navigation */}
      <div className="border-b border-slate-200 flex items-center space-x-6 text-xs sm:text-sm font-bold pb-3 no-print">
        <button 
          onClick={() => setCurrentView('encounter')}
          className="border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-2.5 flex items-center space-x-2"
        >
          <FileEdit className="w-4 h-4 text-slate-400" />
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
          className="border-b-2 border-hospital-600 text-hospital-700 pb-2.5 flex items-center space-x-2"
        >
          <Pill className="w-4 h-4 text-hospital-600" />
          <span>Medications & Prescribing</span>
          <span className="bg-hospital-100 text-hospital-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-black">
            {prescriptions.length}
          </span>
        </button>
      </div>

      {/* Main Layout: Prescribe Composer + Active Medication Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: e-Prescribing Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Pill className="w-4 h-4 text-hospital-600" />
              <span>e-Prescribing Drug Composer</span>
            </h3>
            <p className="text-xs text-slate-400">Electronic ordering with real-time allergy cross-checking</p>
          </div>

          {/* Quick Test Drugs */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Quick Clinical Formulary:
            </label>
            <div className="flex flex-col gap-1.5 text-xs">
              
              {/* ALLERGY TEST BUTTON */}
              <button
                type="button"
                onClick={() => handleSelectQuickDrug('Amoxicillin Oral Capsule', '500 mg', 'Every 8 hours (TID)', 'ORAL', 7, 'Take after food with plentiful water.')}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border-2 border-rose-400 rounded-xl text-left font-bold transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Amoxicillin 500mg</span>
                  </div>
                  <div className="text-[10px] text-rose-600 font-normal">Triggers Penicillin Allergy CDS Alert</div>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-950 font-black px-2 py-0.5 rounded">
                  CDS WARNING
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDrug('Azithromycin Oral Tablet', '250 mg', 'Once daily', 'ORAL', 5, 'Take 2 tabs on day 1, then 1 tab days 2-5.')}
                className="p-2 bg-slate-50 hover:bg-hospital-50 text-slate-700 hover:text-hospital-700 border border-slate-200 rounded-xl font-medium transition text-left"
              >
                + Azithromycin 250mg (Safe Alternative)
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDrug('Prednisone Oral Tablet', '20 mg', 'Once daily with breakfast', 'ORAL', 5, 'Short taper course for reactive airway inflammation.')}
                className="p-2 bg-slate-50 hover:bg-hospital-50 text-slate-700 hover:text-hospital-700 border border-slate-200 rounded-xl font-medium transition text-left"
              >
                + Prednisone 20mg (Oral Steroid)
              </button>
            </div>
          </div>

          {/* Prescribe Form */}
          <form onSubmit={handlePrescribeAttempt} className="space-y-3.5 text-xs pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Medication / Formula *</label>
              <input
                type="text"
                required
                value={newMed.drugName}
                onChange={(e) => setNewMed({ ...newMed, drugName: e.target.value })}
                placeholder="e.g. Amoxicillin or Azithromycin"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage / Strength *</label>
                <input
                  type="text"
                  required
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g. 500 mg"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Route *</label>
                <select
                  value={newMed.route}
                  onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none bg-white font-medium"
                >
                  <option value="ORAL">ORAL</option>
                  <option value="INHALATION">INHALATION</option>
                  <option value="IV">INTRAVENOUS (IV)</option>
                  <option value="TOPICAL">TOPICAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Frequency *</label>
                <input
                  type="text"
                  required
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  placeholder="e.g. BID / TID / Daily"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={newMed.durationDays}
                  onChange={(e) => setNewMed({ ...newMed, durationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Patient Directions</label>
              <textarea
                rows={2}
                value={newMed.instructions}
                onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                placeholder="Take after meals..."
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Electronically Prescribe Drug</span>
            </button>
          </form>
        </div>

        {/* Right: Active Medication Profile & Reconciliation Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Active Medication Reconciliation Profile
              </h3>
              <p className="text-xs text-slate-400">Current pharmacotherapy regimen for Encounter #1001</p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full">
              Active Regimen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Pharmaceutical Agent</th>
                  <th className="px-4 py-3.5">Dosing & Frequency</th>
                  <th className="px-4 py-3.5">Administration Directions</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {prescriptions.map(med => (
                  <tr 
                    key={med.id} 
                    className={`hover:bg-slate-50/80 transition ${
                      med.status === 'DISCONTINUED' ? 'bg-slate-50/60 opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className={`font-extrabold text-slate-900 ${
                        med.status === 'DISCONTINUED' ? 'line-through text-slate-400' : ''
                      }`}>
                        {med.drugName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Rx #{med.id} • Issued at {med.prescribedAt} by {med.prescribedBy}
                      </div>
                      {med.allergyOverride && (
                        <div className="mt-1">
                          <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded border border-rose-300 inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>ALLERGY OVERRIDDEN: {med.allergyOverride}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-slate-900">{med.dosage}</div>
                      <div className="text-slate-500">{med.frequency} ({med.route})</div>
                      <div className="text-[10px] text-slate-400">{med.durationDays} days duration</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 max-w-xs leading-relaxed">
                      {med.instructions}
                    </td>
                    <td className="px-4 py-4">
                      {med.status === 'ACTIVE' ? (
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-300 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          DISCONTINUED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {med.status === 'ACTIVE' && (
                        <button
                          onClick={() => setMedToDiscontinue(med)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-300 rounded-lg text-xs transition inline-flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Discontinue</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CRITICAL DRUG-ALLERGY SAFETY OVERRIDE MODAL */}
      {showAllergyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-4 border-rose-500 space-y-4">
            
            <div className="flex items-center space-x-3.5 text-rose-600">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                <ShieldAlert className="w-8 h-8 text-rose-600 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-rose-950 uppercase tracking-tight">
                  CRITICAL ALLERGY ALERT
                </h3>
                <p className="text-xs text-rose-700 font-bold">
                  Clinical Decision Support (CDS) Contraindication Intercept
                </p>
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-300 space-y-2 text-xs">
              <p className="font-extrabold text-rose-950 text-sm">
                Prescribed Drug: <span className="underline">{newMed.drugName}</span>
              </p>
              <p className="text-rose-800">
                Patient <strong>John Doe</strong> has a documented high-risk allergy to: <br />
                <span className="inline-block mt-1 px-2.5 py-1 bg-rose-200 text-rose-950 font-mono font-bold rounded-lg border border-rose-300">
                  ⚠️ {matchedAllergen}
                </span>
              </p>
              <p className="text-rose-700 text-[11px] leading-relaxed italic">
                Administration of beta-lactam penicillins to a patient with a confirmed penicillin allergy carries significant risk of severe anaphylaxis, respiratory distress, or severe cutaneous reaction.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mandatory Physician Override Justification *
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Clinical benefit outweighs risk with close monitoring">
                    Clinical benefit outweighs risk with close monitoring
                  </option>
                  <option value="Patient previously tolerated with negative skin test">
                    Patient previously tolerated with negative skin test
                  </option>
                  <option value="No effective alternative antibiotic available">
                    No effective alternative antibiotic available
                  </option>
                </select>
              </div>

              <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="overrideAgreement"
                  checked={overrideConfirmed}
                  onChange={(e) => setOverrideConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <label htmlFor="overrideAgreement" className="text-[11px] text-slate-700 leading-snug cursor-pointer">
                  I, <strong>{currentUser?.fullName || 'Attending Physician'}</strong>, explicitly acknowledge this drug-allergy contraindication and take clinical responsibility for this electronic prescription override.
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleChooseAlternative}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition"
              >
                Cancel & Choose Safe Alternative
              </button>
              <button
                type="button"
                disabled={!overrideConfirmed}
                onClick={handleForceOverride}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md disabled:opacity-40 transition"
              >
                Force Override & Prescribe
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Discontinue Confirmation Modal */}
      {medToDiscontinue && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-base font-black text-slate-900">Discontinue Prescription</h3>
              <p className="text-xs text-slate-500">{medToDiscontinue.drugName} ({medToDiscontinue.dosage})</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Reason for Discontinuation *</label>
              <select
                value={discontinueReason}
                onChange={(e) => setDiscontinueReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none bg-white font-medium"
              >
                <option value="Therapy Course Completed">Therapy Course Completed</option>
                <option value="Adverse Reaction / Intolerance">Adverse Reaction / Intolerance</option>
                <option value="Condition Resolved">Condition Resolved</option>
                <option value="Switched to Alternative Agent">Switched to Alternative Agent</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setMedToDiscontinue(null)}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDiscontinue}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                Confirm Discontinuation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
