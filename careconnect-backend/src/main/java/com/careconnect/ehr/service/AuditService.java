package com.careconnect.ehr.service;

import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByAction(String action) {
        if ("ALL".equalsIgnoreCase(action)) {
            return getAllAuditLogs();
        }
        return auditLogRepository.findByAction(action);
    }

    public AuditLog recordLog(AuditLog log) {
        return auditLogRepository.save(log);
    }
}
