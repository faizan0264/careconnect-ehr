package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AUDIT_LOGS")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOG_ID")
    private Long id;

    @Column(name = "USER_NAME", nullable = false, length = 100)
    private String user;

    @Column(name = "ACTION_TYPE", nullable = false, length = 50)
    private String action; // CREATE_ORDER, RECORD_VITALS, VIEW_RECORD, USER_PROVISIONED, ADMIN_LOGIN, APPOINTMENT_SCHEDULED

    @Column(name = "EVENT_DETAILS", nullable = false, length = 500)
    private String details;

    @Column(name = "IP_ADDRESS", length = 50)
    private String ipAddress = "192.168.1.100";

    @Column(name = "TIME_STR", length = 30)
    private String time;

    @Column(name = "EVENT_TIMESTAMP", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(String user, String action, String details, String time) {
        this.user = user;
        this.action = action;
        this.details = details;
        this.time = time;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
