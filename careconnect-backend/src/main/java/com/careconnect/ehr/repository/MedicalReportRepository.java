package com.careconnect.ehr.repository;

import com.careconnect.ehr.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientIdOrderByUploadedAtDesc(Long patientId);
    List<MedicalReport> findAllByOrderByUploadedAtDesc();
}
