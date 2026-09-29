package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICAL_REPORTS")
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REPORT_ID")
    private Long id;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "PATIENT_NAME", length = 100)
    private String patientName;

    @Column(name = "TITLE", nullable = false, length = 150)
    private String title;

    @Column(name = "REPORT_TYPE", nullable = false, length = 50)
    private String reportType; // LABORATORY, RADIOLOGY, PATHOLOGY, PRESCRIPTION, DISCHARGE_SUMMARY, OTHER

    @Column(name = "FILE_NAME", nullable = false, length = 200)
    private String fileName;

    @Column(name = "FILE_TYPE", length = 80)
    private String fileType; // application/pdf, image/png, image/jpeg, etc.

    @Column(name = "FILE_SIZE", length = 30)
    private String fileSize; // e.g. "1.8 MB"

    @Lob
    @Column(name = "FILE_DATA", columnDefinition = "CLOB")
    private String fileData; // Base64 data URI for instant rendering and download

    @Column(name = "NOTES", length = 500)
    private String notes;

    @Column(name = "UPLOADED_BY", nullable = false, length = 100)
    private String uploadedBy;

    @Column(name = "UPLOADER_ROLE", nullable = false, length = 30)
    private String uploaderRole; // ROLE_DOCTOR, ROLE_PATIENT, ROLE_ADMIN

    @Column(name = "REPORT_DATE", length = 30)
    private String reportDate;

    @Column(name = "UPLOADED_AT", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public MedicalReport() {}

    public MedicalReport(Long patientId, String patientName, String title, String reportType, 
                         String fileName, String fileType, String fileSize, String fileData, 
                         String notes, String uploadedBy, String uploaderRole, String reportDate) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.title = title;
        this.reportType = reportType;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.fileData = fileData;
        this.notes = notes;
        this.uploadedBy = uploadedBy;
        this.uploaderRole = uploaderRole;
        this.reportDate = reportDate;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getFileData() { return fileData; }
    public void setFileData(String fileData) { this.fileData = fileData; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploaderRole() { return uploaderRole; }
    public void setUploaderRole(String uploaderRole) { this.uploaderRole = uploaderRole; }

    public String getReportDate() { return reportDate; }
    public void setReportDate(String reportDate) { this.reportDate = reportDate; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
