package com.careconnect.ehr.controller;

import com.careconnect.ehr.model.DiagnosticOrder;
import com.careconnect.ehr.model.Encounter;
import com.careconnect.ehr.model.Prescription;
import com.careconnect.ehr.service.ClinicalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clinical")
@CrossOrigin(origins = "*")
@Tag(name = "Clinical Documentation & CPOE", description = "Endpoints for SOAP notes, triage vitals, CPOE orders, and e-prescriptions")
public class ClinicalController {

    @Autowired
    private ClinicalService clinicalService;

    // Encounters
    @GetMapping("/encounters/{patientId}")
    @Operation(summary = "Get encounters by patient", description = "Returns clinical encounter history including vitals and SOAP notes")
    public ResponseEntity<List<Encounter>> getEncounters(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalService.getEncountersByPatientId(patientId));
    }

    @PostMapping("/encounters")
    @Operation(summary = "Save encounter notes", description = "Saves or updates vitals and SOAP notes for current encounter")
    public ResponseEntity<Encounter> saveEncounter(@RequestBody Encounter encounter) {
        return ResponseEntity.ok(clinicalService.saveEncounter(encounter));
    }

    @PutMapping("/encounters/{id}/sign")
    @Operation(summary = "Sign and close encounter", description = "Clinically signs and locks the encounter under HIPAA compliance")
    public ResponseEntity<Encounter> signEncounter(@PathVariable Long id, @RequestParam(required = false) String doctorName) {
        return ResponseEntity.ok(clinicalService.signEncounter(id, doctorName));
    }

    // Diagnostic Orders (CPOE)
    @GetMapping("/orders/{patientId}")
    @Operation(summary = "Get diagnostic orders", description = "Returns lab, radiology, and procedure orders for patient")
    public ResponseEntity<List<DiagnosticOrder>> getOrders(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalService.getOrdersByPatientId(patientId));
    }

    @PostMapping("/orders")
    @Operation(summary = "Place diagnostic order", description = "Submits routine, urgent, or STAT CPOE orders")
    public ResponseEntity<DiagnosticOrder> placeOrder(@RequestBody DiagnosticOrder order, @RequestParam(required = false) String doctorName) {
        return ResponseEntity.status(201).body(clinicalService.placeOrder(order, doctorName));
    }

    @PutMapping("/orders/{id}/result")
    @Operation(summary = "Document lab result", description = "Enters diagnostic laboratory or radiology findings")
    public ResponseEntity<DiagnosticOrder> completeOrderResult(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String resultText = payload.getOrDefault("result", "Normal reference range.");
        return ResponseEntity.ok(clinicalService.completeOrderResult(id, resultText));
    }

    // e-Prescriptions
    @GetMapping("/prescriptions/{patientId}")
    @Operation(summary = "Get patient prescriptions", description = "Returns active and past medication regimens")
    public ResponseEntity<List<Prescription>> getPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalService.getPrescriptionsByPatientId(patientId));
    }

    @PostMapping("/prescriptions")
    @Operation(summary = "e-Prescribe medication", description = "Prescribes medication with CDS drug-allergy contraindication checks")
    public ResponseEntity<?> prescribeMedication(@RequestBody Prescription prescription, @RequestParam(required = false) String doctorName) {
        try {
            Prescription saved = clinicalService.prescribeMedication(prescription, doctorName);
            return ResponseEntity.status(201).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "contraindication", true));
        }
    }

    @PutMapping("/prescriptions/{id}/discontinue")
    @Operation(summary = "Discontinue medication", description = "Stops active medication regimen")
    public ResponseEntity<Prescription> discontinueRx(@PathVariable Long id) {
        return ResponseEntity.ok(clinicalService.discontinuePrescription(id));
    }
}
