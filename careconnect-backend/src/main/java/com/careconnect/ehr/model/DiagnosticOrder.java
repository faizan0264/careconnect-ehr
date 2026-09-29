package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DIAGNOSTIC_ORDERS")
public class DiagnosticOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ID")
    private Long id;

    @Column(name = "ENCOUNTER_ID")
    private Long encounterId;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "DOCTOR_ID", nullable = false)
    private Long doctorId;

    @Column(name = "ORDER_TYPE", nullable = false, length = 50)
    private String type; // Laboratory, Radiology, Procedure

    @Column(name = "TEST_NAME", nullable = false, length = 150)
    private String name;

    @Column(name = "PRIORITY", nullable = false, length = 20)
    private String priority = "Routine"; // Routine, Urgent, STAT

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status = "Pending"; // Pending, Completed, Cancelled

    @Lob
    @Column(name = "RESULT_FINDINGS")
    private String result;

    @Column(name = "ORDERED_AT", nullable = false, length = 30)
    private String orderedAt;

    @Column(name = "FULFILLED_AT", length = 30)
    private String fulfilledAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DiagnosticOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getOrderedAt() { return orderedAt; }
    public void setOrderedAt(String orderedAt) { this.orderedAt = orderedAt; }

    public String getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(String fulfilledAt) { this.fulfilledAt = fulfilledAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
