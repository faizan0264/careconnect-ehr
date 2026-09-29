package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PRESCRIPTIONS")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRESCRIPTION_ID")
    private Long id;

    @Column(name = "ENCOUNTER_ID")
    private Long encounterId;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "DOCTOR_ID", nullable = false)
    private Long doctorId;

    @Column(name = "MEDICATION_NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "DOSAGE", nullable = false, length = 50)
    private String dosage;

    @Column(name = "FREQUENCY", nullable = false, length = 100)
    private String frequency;

    @Column(name = "DURATION", nullable = false, length = 50)
    private String duration;

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status = "Active"; // Active, Discontinued, Completed

    @Column(name = "OVERRIDE_REASON", length = 300)
    private String override;

    @Column(name = "PRESCRIBED_AT", nullable = false)
    private LocalDateTime prescribedAt = LocalDateTime.now();

    public Prescription() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOverride() { return override; }
    public void setOverride(String override) { this.override = override; }

    public LocalDateTime getPrescribedAt() { return prescribedAt; }
    public void setPrescribedAt(LocalDateTime prescribedAt) { this.prescribedAt = prescribedAt; }
}
