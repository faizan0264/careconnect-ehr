package com.careconnect.ehr.service;

import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.model.Patient;
import com.careconnect.ehr.repository.AuditLogRepository;
import com.careconnect.ehr.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public List<Patient> searchPatients(String query) {
        if (query == null || query.trim().isEmpty()) {
            return patientRepository.findAll();
        }
        return patientRepository.findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrMrnContainingIgnoreCase(query, query, query);
    }

    public Patient registerPatient(Patient patient, String staffName) {
        int suffix = 1000 + new Random().nextInt(9000);
        patient.setMrn("MRN-2026-" + suffix);
        patient.setStatus("Admitted");

        Patient saved = patientRepository.save(patient);

        // Audit Trail
        AuditLog log = new AuditLog(
            staffName != null ? staffName : "Attending Doctor",
            "PATIENT_REGISTERED",
            "Registered new patient " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getMrn() + ")",
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return saved;
    }

    public boolean deletePatient(Long id, String staffName) {
        return patientRepository.findById(id).map(patient -> {
            patientRepository.delete(patient);
            AuditLog log = new AuditLog(
                staffName != null ? staffName : "System Administrator",
                "PATIENT_DELETED",
                "Removed patient record: " + patient.getFirstName() + " " + patient.getLastName() + " (" + patient.getMrn() + ")",
                LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
            );
            auditLogRepository.save(log);
            return true;
        }).orElse(false);
    }
}
