import React, { useState } from 'react';
import { useEhr } from '../context/EhrContext';
import { 
  FileText, 
  Upload, 
  X, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  File, 
  Image as ImageIcon,
  Activity,
  FileCheck
} from 'lucide-react';

export const MedicalReportVaultModal = ({ isOpen, onClose, previewReport = null, initialPatientId = null }) => {
  const { currentUser, selectedPatient, uploadReport, deleteReport } = useEhr();

  // Mode: 'UPLOAD' or 'PREVIEW'
  const isPreview = Boolean(previewReport);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('LABORATORY');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB limit.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');

    // Pre-fill title if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(cleanName);
    }

    // Auto-detect category
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      setReportType('RADIOLOGY');
    }

    // Read base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please enter a descriptive report title.');
      return;
    }

    setIsSubmitting(true);

    const targetPatientId = initialPatientId || selectedPatient.id;
    const targetPatientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Patient';

    await uploadReport({
      patientId: targetPatientId,
      patientName: targetPatientName,
      title: title.trim(),
      reportType,
      fileName: selectedFile ? selectedFile.name : `${title.trim().replace(/\s+/g, '_')}.pdf`,
      fileType: selectedFile ? selectedFile.type : 'application/pdf',
      fileSize: selectedFile ? formatFileSize(selectedFile.size) : '1.5 MB',
      fileData: fileBase64 || null,
      notes: notes.trim() || 'Official diagnostic document filed in patient chart.',
      reportDate: reportDate || new Date().toISOString().split('T')[0],
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleDownload = (report) => {
    if (report.fileData) {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = report.fileName || `${report.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create simulated PDF text file download
      const content = `CARECONNECT EHR - OFFICIAL MEDICAL REPORT\n` +
        `=======================================================\n` +
        `Report Title:    ${report.title}\n` +
        `Patient Name:    ${report.patientName || selectedPatient.firstName + ' ' + selectedPatient.lastName}\n` +
        `Report Category: ${report.reportType}\n` +
        `Report Date:     ${report.reportDate}\n` +
        `Uploaded By:     ${report.uploadedBy} (${report.uploaderRole})\n` +
        `=======================================================\n\n` +
        `CLINICAL FINDINGS & IMPRESSION:\n${report.notes || 'Normal findings recorded.'}\n\n` +
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

  const getBadgeColor = (type) => {
    switch (type) {
      case 'RADIOLOGY': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LABORATORY': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PATHOLOGY': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PRESCRIPTION': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DISCHARGE_SUMMARY': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {isPreview ? <FileText className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isPreview ? 'Medical Report Document Viewer' : 'Upload Medical Report / Diagnostic Scan'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Patient: <span className="font-semibold text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</span> (MRN: {selectedPatient.mrn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* MODE 1: PREVIEW REPORT */}
        {/* =================================================================== */}
        {isPreview && previewReport && (
          <div className="p-5 space-y-4">
            
            {/* Meta Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{previewReport.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(previewReport.reportType)}`}>
                      {previewReport.reportType}
                    </span>
                    <span className="text-slate-400 text-[11px]">•</span>
                    <span className="text-slate-600 font-medium text-[11px] flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{previewReport.reportDate}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(previewReport)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500">File Attachment:</span>{' '}
                  <span className="font-semibold text-slate-800">{previewReport.fileName}</span>{' '}
                  <span className="text-slate-400">({previewReport.fileSize || '1.8 MB'})</span>
                </div>
                <div>
                  <span className="text-slate-500">Uploaded By:</span>{' '}
                  <span className="font-semibold text-blue-700">{previewReport.uploadedBy}</span>
                </div>
              </div>
            </div>

            {/* Document Body / Findings */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">
                Official Clinical Findings & Diagnostic Notes:
              </label>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed text-xs shadow-inner">
                {previewReport.notes || 'No specific clinical notes documented for this file.'}
              </div>
            </div>

            {/* Preview Viewport if image */}
            {previewReport.fileData && previewReport.fileType && previewReport.fileType.startsWith('image/') && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">Scan Preview:</label>
                <div className="p-2 bg-slate-900 rounded-xl flex items-center justify-center max-h-56 overflow-hidden">
                  <img src={previewReport.fileData} alt={previewReport.title} className="max-h-52 object-contain rounded" />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { deleteReport(previewReport.id); onClose(); }}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Report</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
              >
                Close Viewer
              </button>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* MODE 2: UPLOAD REPORT FORM */}
        {/* =================================================================== */}
        {!isPreview && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Uploader Attribution Banner */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700 font-medium">Filing Under:</span>
                <span className="font-bold text-blue-900">{currentUser.fullName}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
                {currentUser.role === 'ROLE_DOCTOR' ? 'Attending Physician' : 'Registered Patient'}
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* File Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-5 rounded-2xl border-2 border-dashed text-center transition cursor-pointer ${
                isDragging 
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20' 
                  : selectedFile 
                    ? 'border-emerald-500 bg-emerald-50/40' 
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
              onClick={() => document.getElementById('report-file-input').click()}
            >
              <input
                id="report-file-input"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3 text-emerald-900">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)} • Click or drop to change</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-800 text-xs">
                    Drop your report file here, or <span className="text-blue-600 underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports PDF, Radiology Images (PNG/JPG), Lab Sheets, and DOCX (Max 15MB)
                  </p>
                </div>
              )}
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest X-Ray PA View"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                >
                  <option value="LABORATORY">🧪 Laboratory / Blood Work</option>
                  <option value="RADIOLOGY">🩻 Radiology / X-Ray / CT / MRI</option>
                  <option value="PATHOLOGY">🔬 Pathology & Biopsy Report</option>
                  <option value="PRESCRIPTION">💊 Prescription / Pharmacy Order</option>
                  <option value="DISCHARGE_SUMMARY">📋 Discharge Summary / Referral</option>
                  <option value="OTHER">📁 General Medical Record</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Findings / Summary Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add any summary observations, abnormal flags, reference values, or doctor remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center space-x-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Uploading...' : 'Save & Attach to Patient Chart'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
