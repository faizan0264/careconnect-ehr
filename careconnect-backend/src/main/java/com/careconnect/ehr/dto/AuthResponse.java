package com.careconnect.ehr.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String role;
    private String username;
    private String fullName;
    private Long userId;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, String token, String role, String username, String fullName, Long userId) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.role = role;
        this.username = username;
        this.fullName = fullName;
        this.userId = userId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
