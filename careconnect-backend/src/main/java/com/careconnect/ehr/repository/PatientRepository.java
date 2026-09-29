package com.careconnect.ehr.repository;

import com.careconnect.ehr.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByMrn(String mrn);
    List<Patient> findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrMrnContainingIgnoreCase(String lastName, String firstName, String mrn);
}
