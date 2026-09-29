package com.careconnect.ehr.controller;

import com.careconnect.ehr.dto.BookAppointmentRequest;
import com.careconnect.ehr.model.Appointment;
import com.careconnect.ehr.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@CrossOrigin(origins = "*")
@Tag(name = "Appointments & Scheduling", description = "Endpoints for booking doctor consultations and managing clinic queues")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    @Operation(summary = "Get appointments", description = "Retrieves all appointments or filters by patient/doctor")
    public ResponseEntity<List<Appointment>> getAppointments(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId) {
        
        if (patientId != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
        }
        if (doctorId != null) {
            return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
        }
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PostMapping
    @Operation(summary = "Book appointment", description = "Schedules a new clinical appointment for patient with a doctor")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody BookAppointmentRequest request) {
        Appointment booked = appointmentService.bookAppointment(request);
        return ResponseEntity.status(201).body(booked);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel appointment", description = "Marks appointment as cancelled")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        Appointment cancelled = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(cancelled);
    }
}
