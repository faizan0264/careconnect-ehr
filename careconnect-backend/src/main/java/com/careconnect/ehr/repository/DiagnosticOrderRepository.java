package com.careconnect.ehr.repository;

import com.careconnect.ehr.model.DiagnosticOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiagnosticOrderRepository extends JpaRepository<DiagnosticOrder, Long> {
    List<DiagnosticOrder> findByPatientId(Long patientId);
    List<DiagnosticOrder> findByDoctorId(Long doctorId);
    List<DiagnosticOrder> findByStatus(String status);
}
