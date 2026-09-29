import React from 'react';
import { useEhr, calculateAgeFromDob } from '../context/EhrContext';
import { AlertTriangle, CheckCircle2, User, Droplet, MapPin } from 'lucide-react';

export const PatientHeader = () => {
  const { activePatient, setCurrentView } = useEhr();

  if (!activePatient) return null;

  const hasAllergies = activePatient.allergies && !activePatient.allergies.includes('NKDA');

  return (
    <section className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Patient Identification & Demographics Profile */}
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-hospital-100 text-hospital-800 font-extrabold flex items-center justify-center text-sm border-2 border-hospital-600 shadow-sm flex-shrink-0 mt-0.5 sm:mt-0">
              {(activePatient.lastName || 'P')[0]}{(activePatient.firstName || 'P')[0]}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {activePatient.lastName || ''}, {activePatient.firstName || ''}
                </h1>
                
                {/* MRN Badge */}
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-300">
                  {activePatient.mrn}
                </span>

                {/* Age & Gender */}
                <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded border border-sky-200">
                  {(activePatient.dateOfBirth ? calculateAgeFromDob(activePatient.dateOfBirth, activePatient.age) : activePatient.age) || 30}y • {activePatient.gender}
                </span>

                {/* Blood Type */}
                <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-rose-50 text-rose-800 rounded border border-rose-200 flex items-center space-x-1">
                  <Droplet className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
                  <span>Type {activePatient.bloodGroup}</span>
                </span>

                {/* Room */}
                <span className="text-[11px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded hidden md:flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{activePatient.room}</span>
                </span>
              </div>

              {/* Contact & Demographic Detail Line */}
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>DOB: {activePatient.dateOfBirth}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Ph: {activePatient.contactPhone}</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Emerg: {activePatient.emergencyContact}</span>
              </p>
            </div>
          </div>

          {/* Right: ALLERGY ALERT BANNER & SWITCH BUTTON */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {hasAllergies ? (
              <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 px-2.5 py-1 rounded-xl shadow-sm flex items-center space-x-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-600 stroke-[2.5] flex-shrink-0" />
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 block leading-none">
                    ALLERGY ALERT
                  </span>
                  <span className="text-[11px] font-black text-rose-950 truncate max-w-[170px] sm:max-w-none block">
                    {activePatient.allergies}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NKDA</span>
              </div>
            )}

            <button
              onClick={() => setCurrentView('patients')}
              className="text-xs font-bold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition flex items-center space-x-1 flex-shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Patient</span>
              <span className="sm:hidden">Change</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
