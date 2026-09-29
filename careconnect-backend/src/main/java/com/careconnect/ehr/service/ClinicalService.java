package com.careconnect.ehr.service;

import com.careconnect.ehr.model.*;
import com.careconnect.ehr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ClinicalService {

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private DiagnosticOrderRepository orderRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // Encounters & SOAP Notes
    public List<Encounter> getEncountersByPatientId(Long patientId) {
        return encounterRepository.findByPatientId(patientId);
    }

    public Encounter saveEncounter(Encounter encounter) {
        return encounterRepository.save(encounter);
    }

    public Encounter signEncounter(Long encounterId, String doctorName) {
        Encounter enc = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new RuntimeException("Encounter not found"));
        enc.setSigned(true);
        enc.setSignedAt(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        
        // Audit log
        AuditLog log = new AuditLog(
            doctorName != null ? doctorName : enc.getDoctorName(),
            "ENCOUNTER_SIGNED",
            "Clinically signed and locked encounter #" + enc.getId(),
            enc.getSignedAt()
        );
        auditLogRepository.save(log);

        return encounterRepository.save(enc);
    }

    // Diagnostic Orders (CPOE)
    public List<DiagnosticOrder> getOrdersByPatientId(Long patientId) {
        return orderRepository.findByPatientId(patientId);
    }

    public DiagnosticOrder placeOrder(DiagnosticOrder order, String doctorName) {
        order.setStatus("Pending");
        order.setOrderedAt(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        DiagnosticOrder saved = orderRepository.save(order);

        // Audit log
        AuditLog log = new AuditLog(
            doctorName != null ? doctorName : "Attending Doctor",
            "CREATE_ORDER",
            "Ordered " + saved.getName() + " (" + saved.getPriority() + ") for Patient ID " + saved.getPatientId(),
            saved.getOrderedAt()
        );
        auditLogRepository.save(log);

        return saved;
    }

    public DiagnosticOrder completeOrderResult(Long orderId, String resultText) {
        DiagnosticOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("Completed");
        order.setResult(resultText);
        order.setFulfilledAt(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
        return orderRepository.save(order);
    }

    // e-Prescriptions
    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public Prescription prescribeMedication(Prescription prescription, String doctorName) {
        // Clinical Decision Support (CDS) Drug-Allergy Safety Check
        Optional<Patient> patientOpt = patientRepository.findById(prescription.getPatientId());
        if (patientOpt.isPresent()) {
            String allergies = patientOpt.get().getAllergies().toLowerCase();
            String med = prescription.getName().toLowerCase();
            if (allergies.contains("penicillin") && (med.contains("penicillin") || med.contains("amoxicillin"))) {
                if (prescription.getOverride() == null || prescription.getOverride().trim().isEmpty()) {
                    throw new IllegalArgumentException("CRITICAL ALLERGY ALERT: Patient is allergic to Penicillin. Clinical override reason is required.");
                }
            }
        }

        prescription.setStatus("Active");
        Prescription saved = prescriptionRepository.save(prescription);

        // Audit log
        AuditLog log = new AuditLog(
            doctorName != null ? doctorName : "Attending Doctor",
            "PRESCRIBE_MEDICATION",
            "Prescribed " + saved.getName() + " (" + saved.getDosage() + ") - Override: " + (saved.getOverride() != null ? saved.getOverride() : "None"),
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return saved;
    }

    public Prescription discontinuePrescription(Long prescriptionId) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        rx.setStatus("Discontinued");
        return prescriptionRepository.save(rx);
    }
}
