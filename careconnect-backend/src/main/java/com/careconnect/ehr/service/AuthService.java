package com.careconnect.ehr.service;

import com.careconnect.ehr.dto.AuthResponse;
import com.careconnect.ehr.dto.LoginRequest;
import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.model.User;
import com.careconnect.ehr.repository.AuditLogRepository;
import com.careconnect.ehr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AuthResponse authenticate(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Invalid username or password.", null, null, null, null, null);
        }

        User user = userOpt.get();

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return new AuthResponse(false, "Password cannot be blank.", null, null, null, null, null);
        }

        // Strict password matching against user's stored password
        boolean isValid = (user.getPasswordHash() != null && request.getPassword().equals(user.getPasswordHash())) ||
                          (user.getPassword() != null && request.getPassword().equals(user.getPassword()));

        if (!isValid) {
            return new AuthResponse(false, "Invalid credentials. Incorrect password.", null, null, null, null, null);
        }

        // Generate demo JWT token
        String token = "jwt_" + UUID.randomUUID().toString().replace("-", "");

        // Log HIPAA Login Event
        AuditLog log = new AuditLog(
            user.getFullName(),
            "USER_LOGIN",
            "Successful authentication as " + user.getRole(),
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return new AuthResponse(
            true,
            "Authentication successful.",
            token,
            user.getRole(),
            user.getUsername(),
            user.getFullName(),
            user.getId()
        );
    }

    public boolean deleteUser(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return false;
        }
        User user = userOpt.get();
        userRepository.delete(user);

        AuditLog log = new AuditLog(
            "System Admin",
            "USER_DELETED",
            "Removed user account: " + user.getFullName() + " (" + user.getRole() + ", " + user.getEmail() + ")",
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);
        return true;
    }

    public AuthResponse updateProfile(com.careconnect.ehr.dto.UpdateProfileRequest request) {
        Optional<User> userOpt = Optional.empty();
        if (request.getUserId() != null) {
            userOpt = userRepository.findById(request.getUserId());
        }
        if (userOpt.isEmpty() && request.getCurrentUsername() != null) {
            userOpt = userRepository.findByUsername(request.getCurrentUsername());
        }

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User account not found.", null, null, null, null, null);
        }

        User user = userOpt.get();

        if (request.getNewUsername() != null && !request.getNewUsername().isBlank()) {
            user.setUsername(request.getNewUsername().trim());
        }
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPasswordHash(request.getNewPassword().trim());
        }

        userRepository.save(user);

        AuditLog log = new AuditLog(
            user.getFullName(),
            "CREDENTIALS_UPDATED",
            "Updated username & credentials for user: " + user.getUsername(),
            LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        auditLogRepository.save(log);

        return new AuthResponse(
            true,
            "Credentials updated successfully.",
            null,
            user.getRole(),
            user.getUsername(),
            user.getFullName(),
            user.getId()
        );
    }
}
