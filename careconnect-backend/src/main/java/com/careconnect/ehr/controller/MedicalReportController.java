package com.careconnect.ehr.controller;

import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.model.MedicalReport;
import com.careconnect.ehr.repository.AuditLogRepository;
import com.careconnect.ehr.repository.MedicalReportRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*")
@Tag(name = "Medical Document & Report Vault", description = "Endpoints for uploading, previewing, and managing diagnostic reports and clinical documents")
public class MedicalReportController {

    @Autowired
    private MedicalReportRepository reportRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get medical reports by patient", description = "Retrieves all diagnostic reports, scans, and documents for a specific patient")
    public ResponseEntity<List<MedicalReport>> getReportsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportRepository.findByPatientIdOrderByUploadedAtDesc(patientId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report details", description = "Retrieves specific medical report including document payload")
    public ResponseEntity<MedicalReport> getReportById(@PathVariable Long id) {
        return reportRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload medical report", description = "Allows Doctor or Patient to upload diagnostic lab report, radiology scan, or clinical document")
    public ResponseEntity<MedicalReport> uploadReport(@RequestBody MedicalReport report) {
        if (report.getTitle() == null || report.getTitle().isBlank()) {
            report.setTitle("Medical Document");
        }
        if (report.getReportType() == null || report.getReportType().isBlank()) {
            report.setReportType("LABORATORY");
        }
        if (report.getUploadedBy() == null || report.getUploadedBy().isBlank()) {
            report.setUploadedBy("Authorized User");
        }

        MedicalReport saved = reportRepository.save(report);

        // Record HIPAA audit log
        AuditLog log = new AuditLog(
            saved.getUploadedBy(),
            "DOCUMENT_UPLOADED",
            "Uploaded " + saved.getReportType() + " report: '" + saved.getTitle() + "' (" + saved.getFileName() + ") for Patient ID #" + saved.getPatientId(),
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete medical report", description = "Removes a medical report from the patient chart with audit logging")
    public ResponseEntity<?> deleteReport(@PathVariable Long id, @RequestParam(required = false) String deletedBy) {
        return reportRepository.findById(id).map(report -> {
            reportRepository.delete(report);

            AuditLog log = new AuditLog(
                deletedBy != null ? deletedBy : "Clinical Staff",
                "DOCUMENT_DELETED",
                "Removed medical document: '" + report.getTitle() + "' for Patient ID #" + report.getPatientId(),
                LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
            );
            auditLogRepository.save(log);

            return ResponseEntity.ok().body("{\"message\": \"Medical report removed successfully.\"}");
        }).orElse(ResponseEntity.notFound().build());
    }
}
