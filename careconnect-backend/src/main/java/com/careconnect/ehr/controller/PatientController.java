package com.careconnect.ehr.controller;

import com.careconnect.ehr.model.Patient;
import com.careconnect.ehr.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*")
@Tag(name = "Master Patient Index (MPI)", description = "Patient registration, search, and demographics management")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    @Operation(summary = "Get all patients", description = "Retrieves complete Master Patient Index list")
    public ResponseEntity<List<Patient>> getAllPatients(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(patientService.searchPatients(search));
        }
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID", description = "Retrieves clinical demographics and allergies for a specific patient")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Register new patient", description = "Generates new MRN and admits patient into EHR system")
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient, @RequestParam(required = false) String staffName) {
        Patient registered = patientService.registerPatient(patient, staffName);
        return ResponseEntity.status(201).body(registered);
    }
}
