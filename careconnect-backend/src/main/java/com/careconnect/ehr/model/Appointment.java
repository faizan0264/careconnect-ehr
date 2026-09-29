package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "APPOINTMENTS")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "APPOINTMENT_ID")
    private Long id;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "PATIENT_NAME", nullable = false)
    private String patientName;

    @Column(name = "PATIENT_MRN", nullable = false)
    private String patientMrn;

    @Column(name = "DOCTOR_ID", nullable = false)
    private Long doctorId;

    @Column(name = "DOCTOR_NAME", nullable = false)
    private String doctorName;

    @Column(name = "DEPARTMENT", nullable = false)
    private String department;

    @Column(name = "APPOINTMENT_DATE", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "TIME_SLOT", nullable = false, length = 30)
    private String timeSlot; // e.g. "10:30 AM"

    @Column(name = "REASON_FOR_VISIT", nullable = false, length = 255)
    private String reason;

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status = "Confirmed"; // Confirmed, Completed, Cancelled

    @Column(name = "ROOM_NUMBER", length = 50)
    private String room = "Exam Room 3";

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Appointment() {}

    public Appointment(Long patientId, String patientName, String patientMrn, Long doctorId, String doctorName, String department, LocalDate appointmentDate, String timeSlot, String reason, String status, String room) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientMrn = patientMrn;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.department = department;
        this.appointmentDate = appointmentDate;
        this.timeSlot = timeSlot;
        this.reason = reason;
        this.status = status;
        this.room = room;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientMrn() { return patientMrn; }
    public void setPatientMrn(String patientMrn) { this.patientMrn = patientMrn; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
