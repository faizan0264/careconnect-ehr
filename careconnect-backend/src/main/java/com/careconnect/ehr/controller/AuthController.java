package com.careconnect.ehr.controller;

import com.careconnect.ehr.dto.AuthResponse;
import com.careconnect.ehr.dto.LoginRequest;
import com.careconnect.ehr.model.Patient;
import com.careconnect.ehr.model.User;
import com.careconnect.ehr.repository.PatientRepository;
import com.careconnect.ehr.repository.UserRepository;
import com.careconnect.ehr.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication & RBAC", description = "Endpoints for user login, credentials verification, and staff directory")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Verifies credentials for Doctor, Patient, or Admin personas")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticate(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all system users", description = "Returns active staff and patients for directory and admin console")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get attending physicians", description = "Returns list of doctors and clinical departments")
    public ResponseEntity<List<User>> getDoctors() {
        return ResponseEntity.ok(userRepository.findByRole("ROLE_DOCTOR"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Remove user account", description = "Admin endpoint to revoke user access and delete account")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        boolean deleted = authService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body("{\"message\": \"User removed successfully\"}");
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user credentials", description = "Allows Doctor, Patient, or Admin to update username, password, or contact details")
    public ResponseEntity<AuthResponse> updateProfile(@RequestBody com.careconnect.ehr.dto.UpdateProfileRequest request) {
        AuthResponse response = authService.updateProfile(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/provision-staff")
    @Operation(summary = "Provision staff account (Admin Only)", description = "Admin endpoint to provision healthcare providers like Doctors and Nurses")
    public ResponseEntity<User> provisionStaff(@RequestBody User user) {
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("ROLE_DOCTOR");
        } else if (!user.getRole().startsWith("ROLE_")) {
            user.setRole("ROLE_" + user.getRole().toUpperCase());
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            if (user.getPassword() != null && !user.getPassword().isBlank()) {
                user.setPasswordHash(user.getPassword());
            } else {
                user.setPasswordHash("Doctor#2026");
            }
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/register-patient")
    @Operation(summary = "Patient self-registration", description = "Public self-service endpoint restricted strictly to patients")
    public ResponseEntity<User> registerPatient(@RequestBody User user) {
        user.setRole("ROLE_PATIENT");
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            if (user.getPassword() != null && !user.getPassword().isBlank()) {
                user.setPasswordHash(user.getPassword());
            } else {
                user.setPasswordHash("Patient#2026");
            }
        }
        User saved = userRepository.save(user);

        // Also create entry in Master Patient Index
        try {
            String mrn = "MRN-2026-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
            String fullName = user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername();
            String[] parts = fullName.split(" ", 2);
            String first = parts[0];
            String last = parts.length > 1 ? parts[1] : "";
            Patient p = new Patient(mrn, first, last, java.time.LocalDate.now().minusYears(30), 30, "Other", "O+", user.getPhone() != null ? user.getPhone() : "+1 (555) 000-0000", "Emergency Contact", "None (NKDA)", "Outpatient", "Registered");
            patientRepository.save(p);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }
}
