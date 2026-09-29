package com.careconnect.ehr.service;

import com.careconnect.ehr.dto.BookAppointmentRequest;
import com.careconnect.ehr.model.Appointment;
import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.model.Patient;
import com.careconnect.ehr.model.User;
import com.careconnect.ehr.repository.AppointmentRepository;
import com.careconnect.ehr.repository.AuditLogRepository;
import com.careconnect.ehr.repository.PatientRepository;
import com.careconnect.ehr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public Appointment bookAppointment(BookAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Schedule Collision / Double-booking detection
        boolean isConflict = appointmentRepository.findAll().stream().anyMatch(a ->
            a.getDoctorId().equals(doctor.getId()) &&
            a.getAppointmentDate().equals(request.getAppointmentDate()) &&
            a.getTimeSlot().trim().equalsIgnoreCase(request.getTimeSlot().trim()) &&
            !"Cancelled".equalsIgnoreCase(a.getStatus())
        );

        if (isConflict) {
            AuditLog collisionLog = new AuditLog(
                patient.getFirstName() + " " + patient.getLastName(),
                "SCHEDULE_COLLISION_BLOCKED",
                "Attempted double-booking with " + doctor.getFullName() + " on " + request.getAppointmentDate() + " at " + request.getTimeSlot(),
                LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
            );
            auditLogRepository.save(collisionLog);
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "Schedule collision: " + doctor.getFullName() + " is already busy on " + request.getAppointmentDate() + " at " + request.getTimeSlot() + ". Please choose another schedule."
            );
        }

        Appointment appt = new Appointment(
            patient.getId(),
            patient.getFirstName() + " " + patient.getLastName(),
            patient.getMrn(),
            doctor.getId(),
            doctor.getFullName(),
            doctor.getDepartment() != null ? doctor.getDepartment() : "General Practice",
            request.getAppointmentDate(),
            request.getTimeSlot(),
            request.getReason(),
            "Confirmed",
            "Exam Room 3"
        );

        Appointment saved = appointmentRepository.save(appt);

        // Audit Log
        AuditLog log = new AuditLog(
            patient.getFirstName() + " " + patient.getLastName(),
            "APPOINTMENT_SCHEDULED",
            "Booked appointment with " + doctor.getFullName() + " for " + saved.getAppointmentDate() + " at " + saved.getTimeSlot(),
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return saved;
    }

    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus("Cancelled");
        return appointmentRepository.save(appt);
    }
}
