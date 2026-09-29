package com.careconnect.ehr.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User profile and credentials update payload")
public class UpdateProfileRequest {

    @Schema(description = "User ID", example = "101")
    private Long userId;

    @Schema(description = "Current username for authentication", example = "dr_smith")
    private String currentUsername;

    @Schema(description = "New username", example = "dr_smith_md")
    private String newUsername;

    @Schema(description = "Current password for security validation", example = "password123")
    private String currentPassword;

    @Schema(description = "New password (optional)", example = "newStrongPass123!")
    private String newPassword;

    @Schema(description = "Updated full name", example = "Dr. Sarah Smith, MD")
    private String fullName;

    @Schema(description = "Updated hospital email", example = "dr.smith@careconnect.org")
    private String email;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(Long userId, String currentUsername, String newUsername, String currentPassword, String newPassword, String fullName, String email) {
        this.userId = userId;
        this.currentUsername = currentUsername;
        this.newUsername = newUsername;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCurrentUsername() {
        return currentUsername;
    }

    public void setCurrentUsername(String currentUsername) {
        this.currentUsername = currentUsername;
    }

    public String getNewUsername() {
        return newUsername;
    }

    public void setNewUsername(String newUsername) {
        this.newUsername = newUsername;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
