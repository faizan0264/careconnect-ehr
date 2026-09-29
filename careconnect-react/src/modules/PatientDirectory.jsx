import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  Search, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  X
} from 'lucide-react';

export const PatientDirectory = () => {
  const { patients, selectPatient, registerPatient, setCurrentView } = useEhr();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1992-06-15',
    age: 34,
    gender: 'FEMALE',
    bloodGroup: 'A+',
    contactPhone: '+1 (555) 345-6789',
    allergies: 'Penicillin, Sulfa',
    emergencyContact: 'Michael (Husband) - +1 (555) 345-6780',
    room: 'Triage Room 2',
  });

  const filteredPatients = patients.filter(p => {
    if (filterMode === 'ALLERGIES' && (!p.allergies || p.allergies.includes('NKDA'))) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q)
    );
  });

  const handleOpenChart = (patientId) => {
    selectPatient(patientId);
    setCurrentView('encounter');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    const birthYear = new Date(formData.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;

    await registerPatient({
      ...formData,
      age: calculatedAge,
    });
    setShowModal(false);
    setCurrentView('encounter');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-hospital-700 uppercase tracking-widest bg-hospital-100 px-2.5 py-0.5 rounded">
              Module 02 • Master Patient Index
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Patient Demographics & Medical Records
          </h2>
          <p className="text-xs text-slate-500">
            Search patient records, examine longitudinal charts, or enroll new patients with automated MRN generation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register New Patient</span>
        </button>
      </div>

      {/* Search & Category Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Live Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name or MRN (e.g. 0042, Doe)..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterMode === 'ALL'
                ? 'bg-hospital-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilterMode('ALLERGIES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 border ${
              filterMode === 'ALLERGIES'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Documented Allergies Only</span>
          </button>
        </div>
      </div>

      {/* Master Patient Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4">MRN / Identifier</th>
                <th className="px-6 py-4">Patient Full Name</th>
                <th className="px-6 py-4">Age & Gender</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Recorded Allergies (CDS)</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4 text-right">Chart Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredPatients.map(patient => {
                const hasAllergies = patient.allergies && !patient.allergies.includes('NKDA');
                return (
                  <tr
                    key={patient.id}
                    onClick={() => handleOpenChart(patient.id)}
                    className="hover:bg-hospital-50/50 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-hospital-700">
                      {patient.mrn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 text-sm group-hover:text-hospital-700 transition">
                        {patient.lastName}, {patient.firstName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Enrolled: {patient.registeredDate} • {patient.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasAllergies ? (
                        <span className="bg-rose-50 text-rose-800 font-extrabold px-2.5 py-1 rounded-lg border border-rose-200 text-[11px] inline-flex items-center space-x-1.5 shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{patient.allergies}</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-1 rounded text-[11px] inline-flex items-center space-x-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>NKDA</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div>{patient.contactPhone}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{patient.emergencyContact}</div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenChart(patient.id)}
                        className="px-3.5 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-lg shadow-sm text-xs transition inline-flex items-center space-x-1"
                      >
                        <span>Open Chart</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">New Patient Enrollment</h3>
                <p className="text-xs text-slate-500">Auto-assigns unique MRN sequence into Master Patient Index</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Jane"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Miller"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-rose-700 mb-1">
                  Recorded Drug Allergies (Vital for Clinical Decision Support) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, NSAIDs (or write 'NKDA')"
                  className="w-full px-3 py-2 border-2 border-rose-300 bg-rose-50/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact (Next of Kin)</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Spouse / Parent - +1 (555) 999-1234"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-hospital-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-md"
                >
                  Generate MRN & Open Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
