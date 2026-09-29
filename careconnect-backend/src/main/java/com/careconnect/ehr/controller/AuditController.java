package com.careconnect.ehr.controller;

import com.careconnect.ehr.model.AuditLog;
import com.careconnect.ehr.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@CrossOrigin(origins = "*")
@Tag(name = "HIPAA Security & Audit Trail", description = "Endpoints for HIPAA audit logs, security event queries, and compliance reports")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/logs")
    @Operation(summary = "Get audit logs", description = "Retrieves HIPAA access and modification security logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(required = false, defaultValue = "ALL") String action) {
        return ResponseEntity.ok(auditService.getLogsByAction(action));
    }
}
