package com.careconnect.ehr.config;

import com.careconnect.ehr.model.*;
import com.careconnect.ehr.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EncounterRepository encounterRepository;

    @Autowired
    private DiagnosticOrderRepository orderRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Users
        User doc = new User("dr_smith", "password123", "ROLE_DOCTOR", "Dr. Sarah Smith, MD", "dr.smith@careconnect.org", "+1 (555) 100-0101", "Internal Medicine & Pulmonology");
        User patientUser = new User("john_doe", "password123", "ROLE_PATIENT", "John Doe", "john.doe@gmail.com", "+1 (555) 234-5678", "Outpatient");
        User admin = new User("admin_alex", "password123", "ROLE_ADMIN", "Alex Morgan", "alex.admin@careconnect.org", "+1 (555) 300-0303", "Health Informatics & Security");
        User doc2 = new User("dr_chang", "password123", "ROLE_DOCTOR", "Dr. Michael Chang, MD", "dr.chang@careconnect.org", "+1 (555) 100-0102", "Cardiology & Preventive Medicine");
        User adminAlias = new User("admin", "Admin#2026", "ROLE_ADMIN", "System Administrator", "admin@careconnect.org", "+1 (555) 300-0300", "Hospital Administration");
        User docAlias = new User("dr.sharma", "Doctor#2026", "ROLE_DOCTOR", "Dr. Rajesh Sharma, MD", "dr.sharma@careconnect.org", "+1 (555) 100-0103", "Cardiovascular Medicine");
        User doc3 = new User("dr_emily", "password123", "ROLE_DOCTOR", "Dr. Emily Davis, MD", "dr.emily@careconnect.org", "+1 (555) 100-0104", "Family & General Practice");
        User patientAlias = new User("patient1", "Patient#2026", "ROLE_PATIENT", "John Doe", "patient1@careconnect.org", "+1 (555) 234-5678", "Outpatient");

        userRepository.save(doc);
        userRepository.save(patientUser);
        userRepository.save(admin);
        userRepository.save(doc2);
        userRepository.save(adminAlias);
        userRepository.save(docAlias);
        userRepository.save(doc3);
        userRepository.save(patientAlias);

        // 2. Patients
        Patient p1 = new Patient("MRN-2026-0042", "John", "Doe", LocalDate.of(1985, 4, 12), 41, "Male", "O+", "+1 (555) 234-5678", "Jane Doe (Wife) - +1 (555) 234-5679", "Penicillin, NSAIDs (Aspirin/Ibuprofen)", "Exam Room 3", "In Consultation");
        Patient p2 = new Patient("MRN-2026-0089", "Maria", "Gonzalez", LocalDate.of(1968, 11, 23), 57, "Female", "A+", "+1 (555) 876-5432", "Carlos (Son) - +1 (555) 876-5430", "Sulfa Antibiotics", "Waiting Room", "Scheduled");
        Patient p3 = new Patient("MRN-2026-0104", "Robert", "Chen", LocalDate.of(1995, 7, 8), 31, "Male", "B+", "+1 (555) 456-7890", "Lin Chen - +1 (555) 456-7891", "None (NKDA)", "Completed", "Discharged");

        patientRepository.save(p1);
        patientRepository.save(p2);
        patientRepository.save(p3);

        // 3. Appointments
        Appointment a1 = new Appointment(p1.getId(), "John Doe", p1.getMrn(), doc.getId(), doc.getFullName(), doc.getDepartment(), LocalDate.of(2026, 10, 14), "10:30 AM", "Follow-up Consultation: Blood Pressure & Bronchitis", "Confirmed", "Exam Room 3");
        Appointment a2 = new Appointment(p2.getId(), "Maria Gonzalez", p2.getMrn(), doc.getId(), doc.getFullName(), doc.getDepartment(), LocalDate.of(2026, 9, 29), "02:00 PM", "Asthma inhaler refill evaluation", "Confirmed", "Exam Room 3");
        appointmentRepository.save(a1);
        appointmentRepository.save(a2);

        // 4. Encounters & SOAP
        Encounter enc = new Encounter();
        enc.setPatientId(p1.getId());
        enc.setDoctorId(doc.getId());
        enc.setDoctorName(doc.getFullName());
        enc.setChiefComplaint("Chest tightness and productive morning cough for 4 days.");
        enc.setBpSystolic(142);
        enc.setBpDiastolic(92);
        enc.setHeartRate(86);
        enc.setTempFahrenheit(99.1);
        enc.setSpo2Percent(95);
        enc.setRespRate(18);
        enc.setSubjective("Patient reports persistent cough with yellowish sputum and mild chest tightness when walking briskly. Denies fever or chills.");
        enc.setObjective("Lungs: Scattered mild expiratory wheezes at right base. Heart: Regular rhythm, S1/S2 present. BP elevated at 142/92.");
        enc.setAssessment("1. Acute Bronchitis (J20.9)\n2. Stage 2 Essential Hypertension (I10)");
        enc.setPlan("1. Order STAT Chest X-Ray and CBC.\n2. Prescribe Albuterol Inhaler (2 puffs q4-6h PRN).\n3. Prescribe Lisinopril 10mg daily for BP.\n4. Contraindication: Avoid Penicillin/Amoxicillin due to documented allergy.");
        enc.setSigned(false);
        encounterRepository.save(enc);

        // 5. Diagnostic Orders (CPOE)
        DiagnosticOrder o1 = new DiagnosticOrder();
        o1.setPatientId(p1.getId());
        o1.setDoctorId(doc.getId());
        o1.setType("Laboratory");
        o1.setName("Complete Blood Count (CBC)");
        o1.setPriority("STAT");
        o1.setStatus("Pending");
        o1.setOrderedAt("09:45 AM");
        orderRepository.save(o1);

        DiagnosticOrder o2 = new DiagnosticOrder();
        o2.setPatientId(p1.getId());
        o2.setDoctorId(doc.getId());
        o2.setType("Radiology");
        o2.setName("Chest X-Ray (PA & Lateral)");
        o2.setPriority("Urgent");
        o2.setStatus("Completed");
        o2.setOrderedAt("09:50 AM");
        o2.setFulfilledAt("10:15 AM");
        o2.setResult("Normal heart size. Mild peribronchial thickening consistent with bronchitis. No pneumonia or pneumothorax.");
        orderRepository.save(o2);

        // 6. Prescriptions
        Prescription rx1 = new Prescription();
        rx1.setPatientId(p1.getId());
        rx1.setDoctorId(doc.getId());
        rx1.setName("Albuterol Sulfate Inhaler");
        rx1.setDosage("90 mcg");
        rx1.setFrequency("2 puffs every 4-6 hours as needed");
        rx1.setDuration("14 days");
        rx1.setStatus("Active");
        prescriptionRepository.save(rx1);

        Prescription rx2 = new Prescription();
        rx2.setPatientId(p1.getId());
        rx2.setDoctorId(doc.getId());
        rx2.setName("Lisinopril Oral Tablet");
        rx2.setDosage("10 mg");
        rx2.setFrequency("Once daily in the morning");
        rx2.setDuration("30 days");
        rx2.setStatus("Active");
        prescriptionRepository.save(rx2);

        // 7. Medical Reports (Uploaded Documents)
        medicalReportRepository.save(new MedicalReport(
            p1.getId(), "John Doe", "STAT Chest X-Ray PA & Lateral View", "RADIOLOGY",
            "Chest_XRay_PA_Lateral_2026.pdf", "application/pdf", "2.4 MB", null,
            "Impression: Mild peribronchial thickening consistent with acute bronchitis. Heart size normal.",
            "Dr. Sarah Smith, MD", "ROLE_DOCTOR", "2026-09-29"
        ));

        medicalReportRepository.save(new MedicalReport(
            p1.getId(), "John Doe", "Comprehensive Metabolic Panel & CBC", "LABORATORY",
            "Lab_Results_CBC_CMP_Sept2026.pdf", "application/pdf", "1.1 MB", null,
            "WBC 11.2 (mild elevation). Hemoglobin 14.8 g/dL. Electrolytes within normal reference range.",
            "Dr. Rajesh Sharma, MD", "ROLE_DOCTOR", "2026-09-28"
        ));

        medicalReportRepository.save(new MedicalReport(
            p1.getId(), "John Doe", "Prior Outpatient Cardiology Evaluation", "OTHER",
            "Previous_Cardiology_Summary.pdf", "application/pdf", "850 KB", null,
            "Patient-uploaded outside record from St. Jude Memorial Hospital (2025).",
            "John Doe (Patient)", "ROLE_PATIENT", "2026-09-15"
        ));

        // 8. Audit Logs
        auditLogRepository.save(new AuditLog("Dr. Sarah Smith", "APPOINTMENT_SCHEDULED", "Booked appointment with Dr. Sarah Smith on 2026-10-14 at 10:30 AM for John Doe", "10:30 AM"));
        auditLogRepository.save(new AuditLog("Dr. Sarah Smith", "CREATE_ORDER", "Ordered STAT Chest X-Ray for John Doe (MRN-2026-0042)", "09:50 AM"));
        auditLogRepository.save(new AuditLog("Dr. Sarah Smith", "CREATE_ORDER", "Ordered STAT CBC for John Doe (MRN-2026-0042)", "09:45 AM"));
        auditLogRepository.save(new AuditLog("Dr. Sarah Smith", "VIEW_RECORD", "Opened patient chart for John Doe", "09:35 AM"));
        auditLogRepository.save(new AuditLog("Alex Morgan", "ADMIN_LOGIN", "Security login from IP 192.168.1.45", "09:00 AM"));
    }
}
