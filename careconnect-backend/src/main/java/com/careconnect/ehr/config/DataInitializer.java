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

        // 2. Initial Master Patient Index Records (60+ Patients)
        Patient p1 = new Patient("MRN-2026-0042", "John", "Doe", LocalDate.of(1985, 4, 12), 41, "Male", "O+", "+1 (555) 234-5678", "Jane Doe (Wife) - +1 (555) 234-5679", "Penicillin, NSAIDs (Aspirin/Ibuprofen)", "Exam Room 1", "In Consultation");
        patientRepository.save(p1);
        Patient p2 = new Patient("MRN-2026-0089", "Maria", "Gonzalez", LocalDate.of(1968, 11, 23), 57, "Female", "A+", "+1 (555) 876-5432", "Carlos (Son) - +1 (555) 876-5430", "Sulfa Antibiotics", "Exam Room 1", "Scheduled");
        patientRepository.save(p2);
        Patient p3 = new Patient("MRN-2026-0104", "Robert", "Chen", LocalDate.of(1995, 7, 8), 31, "Male", "B+", "+1 (555) 456-7890", "Lin Chen - +1 (555) 456-7891", "None (NKDA)", "Exam Room 1", "Discharged");
        patientRepository.save(p3);
        Patient p4 = new Patient("MRN-2026-5565", "David", "Miller", LocalDate.of(1976, 2, 14), 50, "Male", "A-", "+1 (555) 312-4567", "Sarah Miller (Wife) - +1 (555) 312-4560", "Codeine, Morphine", "Exam Room 1", "Admitted");
        patientRepository.save(p4);
        Patient p5 = new Patient("MRN-2026-9236", "Priya", "Sharma", LocalDate.of(1990, 8, 22), 36, "Female", "O+", "+1 (555) 654-7891", "Amit Sharma (Husband) - +1 (555) 654-7890", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p5);
        Patient p6 = new Patient("MRN-2026-8732", "Carlos", "Rodriguez", LocalDate.of(1982, 12, 5), 43, "Male", "O-", "+1 (555) 987-1234", "Elena Rodriguez (Sister) - +1 (555) 987-1230", "Amoxicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p6);
        Patient p7 = new Patient("MRN-2026-8823", "Emily", "Taylor", LocalDate.of(1998, 5, 19), 28, "Female", "B-", "+1 (555) 432-8765", "Mark Taylor (Father) - +1 (555) 432-8760", "Peanuts, Tree Nuts", "Exam Room 1", "Admitted");
        patientRepository.save(p7);
        Patient p8 = new Patient("MRN-2026-9403", "James", "Anderson", LocalDate.of(1961, 9, 17), 65, "Male", "AB-", "+1 (555) 876-2345", "Linda Anderson (Spouse) - +1 (555) 876-2340", "Aspirin, Contrast Dye", "Exam Room 1", "Admitted");
        patientRepository.save(p8);
        Patient p9 = new Patient("MRN-2026-9274", "Fatima", "Khan", LocalDate.of(1993, 11, 4), 32, "Female", "A+", "+1 (555) 543-9876", "Tariq Khan (Brother) - +1 (555) 543-9870", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p9);
        Patient p10 = new Patient("MRN-2026-9207", "Michael", "Brown", LocalDate.of(1979, 4, 29), 47, "Male", "O+", "+1 (555) 219-8765", "Susan Brown (Wife) - +1 (555) 219-8760", "Ciprofloxacin", "Exam Room 1", "Admitted");
        patientRepository.save(p10);
        Patient p11 = new Patient("MRN-2026-8260", "Sunita", "Gupta", LocalDate.of(1984, 6, 11), 42, "Female", "B+", "+1 (555) 678-1239", "Rajesh Gupta (Husband) - +1 (555) 678-1230", "Penicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p11);
        Patient p12 = new Patient("MRN-2026-7765", "William", "Wilson", LocalDate.of(1955, 3, 8), 71, "Male", "A+", "+1 (555) 789-6543", "Dorothy Wilson (Wife) - +1 (555) 789-6540", "Sulfa Drugs", "Exam Room 1", "Admitted");
        patientRepository.save(p12);
        Patient p13 = new Patient("MRN-2026-1322", "Ananya", "Reddy", LocalDate.of(2001, 1, 25), 25, "Female", "O+", "+1 (555) 890-4321", "Kavitha Reddy (Mother) - +1 (555) 890-4320", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p13);
        Patient p14 = new Patient("MRN-2026-9151", "Thomas", "Martinez", LocalDate.of(1973, 10, 18), 52, "Male", "B-", "+1 (555) 345-8765", "Maria Martinez (Wife) - +1 (555) 345-8760", "Ibuprofen, Naproxen", "Exam Room 1", "Admitted");
        patientRepository.save(p14);
        Patient p15 = new Patient("MRN-2026-1199", "Sofia", "Rossi", LocalDate.of(1996, 7, 30), 30, "Female", "AB+", "+1 (555) 901-2345", "Marco Rossi (Father) - +1 (555) 901-2340", "Latex, Shellfish", "Exam Room 1", "Admitted");
        patientRepository.save(p15);
        Patient p16 = new Patient("MRN-2026-5255", "Liam", "Johnson", LocalDate.of(1989, 12, 14), 36, "Male", "O-", "+1 (555) 456-1238", "Emma Johnson (Wife) - +1 (555) 456-1230", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p16);
        Patient p17 = new Patient("MRN-2026-1332", "Meera", "Nair", LocalDate.of(1981, 5, 2), 45, "Female", "A+", "+1 (555) 789-9876", "Gopal Nair (Spouse) - +1 (555) 789-9870", "Cephalosporins", "Exam Room 1", "Admitted");
        patientRepository.save(p17);
        Patient p18 = new Patient("MRN-2026-2575", "Daniel", "Davis", LocalDate.of(1967, 8, 20), 59, "Male", "O+", "+1 (555) 234-8765", "Barbara Davis (Wife) - +1 (555) 234-8760", "Penicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p18);
        Patient p19 = new Patient("MRN-2026-7926", "Jessica", "White", LocalDate.of(1994, 2, 17), 32, "Female", "B+", "+1 (555) 890-7654", "Kevin White (Brother) - +1 (555) 890-7650", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p19);
        Patient p20 = new Patient("MRN-2026-5660", "Rohan", "Joshi", LocalDate.of(1987, 11, 9), 38, "Male", "A-", "+1 (555) 678-5432", "Neha Joshi (Wife) - +1 (555) 678-5430", "Tetracycline", "Exam Room 1", "Admitted");
        patientRepository.save(p20);
        Patient p21 = new Patient("MRN-2026-3404", "Olivia", "Martin", LocalDate.of(2000, 9, 3), 26, "Female", "O+", "+1 (555) 321-6547", "Paul Martin (Father) - +1 (555) 321-6540", "Iodine, Shellfish", "Exam Room 1", "Admitted");
        patientRepository.save(p21);
        Patient p22 = new Patient("MRN-2026-5497", "Benjamin", "Clark", LocalDate.of(1970, 4, 15), 56, "Male", "AB+", "+1 (555) 987-6541", "Nancy Clark (Wife) - +1 (555) 987-6540", "Metformin intolerance", "Exam Room 1", "Admitted");
        patientRepository.save(p22);
        Patient p23 = new Patient("MRN-2026-3200", "Chloe", "Kim", LocalDate.of(1997, 6, 28), 29, "Female", "B-", "+1 (555) 456-3219", "Grace Kim (Sister) - +1 (555) 456-3210", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p23);
        Patient p24 = new Patient("MRN-2026-2301", "Ethan", "Lewis", LocalDate.of(1983, 3, 22), 43, "Male", "O-", "+1 (555) 789-2134", "Karen Lewis (Wife) - +1 (555) 789-2130", "Amoxicillin, Clavulanate", "Exam Room 1", "Admitted");
        patientRepository.save(p24);
        Patient p25 = new Patient("MRN-2026-2615", "Maya", "Desai", LocalDate.of(1991, 10, 12), 34, "Female", "A+", "+1 (555) 234-9012", "Vikram Desai (Brother) - +1 (555) 234-9010", "Sulfa Antibiotics", "Exam Room 1", "Admitted");
        patientRepository.save(p25);
        Patient p26 = new Patient("MRN-2026-2620", "Alexander", "Hall", LocalDate.of(1964, 1, 19), 62, "Male", "B+", "+1 (555) 890-1234", "Margaret Hall (Wife) - +1 (555) 890-1230", "Ace Inhibitors (Enalapril)", "Exam Room 1", "Admitted");
        patientRepository.save(p26);
        Patient p27 = new Patient("MRN-2026-1637", "Grace", "Allen", LocalDate.of(1986, 7, 14), 40, "Female", "AB-", "+1 (555) 678-9012", "Robert Allen (Husband) - +1 (555) 678-9010", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p27);
        Patient p28 = new Patient("MRN-2026-9224", "Lucas", "Young", LocalDate.of(1993, 4, 5), 33, "Male", "O+", "+1 (555) 345-1239", "Rachel Young (Mother) - +1 (555) 345-1230", "Codeine", "Exam Room 1", "Admitted");
        patientRepository.save(p28);
        Patient p29 = new Patient("MRN-2026-7781", "Sneha", "Mehta", LocalDate.of(1989, 8, 16), 37, "Female", "A-", "+1 (555) 901-8765", "Karan Mehta (Husband) - +1 (555) 901-8760", "Latex, Nickel", "Exam Room 1", "Admitted");
        patientRepository.save(p29);
        Patient p30 = new Patient("MRN-2026-1974", "Noah", "King", LocalDate.of(1978, 12, 29), 47, "Male", "B+", "+1 (555) 567-4321", "Hannah King (Wife) - +1 (555) 567-4320", "Penicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p30);
        Patient p31 = new Patient("MRN-2026-1133", "Isabella", "Wright", LocalDate.of(1999, 3, 11), 27, "Female", "O-", "+1 (555) 234-5432", "Donna Wright (Mother) - +1 (555) 234-5430", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p31);
        Patient p32 = new Patient("MRN-2026-6961", "Arjun", "Roy", LocalDate.of(1980, 5, 24), 46, "Male", "A+", "+1 (555) 890-6789", "Deepa Roy (Wife) - +1 (555) 890-6780", "Aspirin", "Exam Room 1", "Admitted");
        patientRepository.save(p32);
        Patient p33 = new Patient("MRN-2026-1073", "Zoe", "Scott", LocalDate.of(1995, 11, 19), 30, "Female", "AB+", "+1 (555) 456-7892", "James Scott (Father) - +1 (555) 456-7890", "Bactrim, Septra", "Exam Room 1", "Admitted");
        patientRepository.save(p33);
        Patient p34 = new Patient("MRN-2026-7170", "Samuel", "Green", LocalDate.of(1969, 9, 8), 57, "Male", "B-", "+1 (555) 789-3456", "Patricia Green (Wife) - +1 (555) 789-3450", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p34);
        Patient p35 = new Patient("MRN-2026-7664", "Layla", "Baker", LocalDate.of(2002, 2, 14), 24, "Female", "O+", "+1 (555) 321-9876", "Samir Baker (Father) - +1 (555) 321-9870", "Penicillin, Ampicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p35);
        Patient p36 = new Patient("MRN-2026-8234", "Henry", "Adams", LocalDate.of(1972, 6, 30), 54, "Male", "A+", "+1 (555) 987-4321", "Laura Adams (Wife) - +1 (555) 987-4320", "Morphine", "Exam Room 1", "Admitted");
        patientRepository.save(p36);
        Patient p37 = new Patient("MRN-2026-5849", "Harper", "Nelson", LocalDate.of(1992, 1, 21), 34, "Female", "O-", "+1 (555) 654-3218", "Brian Nelson (Husband) - +1 (555) 654-3210", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p37);
        Patient p38 = new Patient("MRN-2026-2724", "Sebastian", "Hill", LocalDate.of(1984, 10, 7), 41, "Male", "B+", "+1 (555) 432-1987", "Claire Hill (Sister) - +1 (555) 432-1980", "Sulfa Antibiotics", "Exam Room 1", "Admitted");
        patientRepository.save(p38);
        Patient p39 = new Patient("MRN-2026-6378", "Amara", "Campbell", LocalDate.of(1987, 4, 18), 39, "Female", "A-", "+1 (555) 876-5439", "David Campbell (Husband) - +1 (555) 876-5430", "Erythromycin", "Exam Room 1", "Admitted");
        patientRepository.save(p39);
        Patient p40 = new Patient("MRN-2026-6401", "Victor", "Mitchell", LocalDate.of(1965, 11, 26), 60, "Male", "O+", "+1 (555) 543-2198", "Helen Mitchell (Wife) - +1 (555) 543-2190", "Cefazolin", "Exam Room 1", "Admitted");
        patientRepository.save(p40);
        Patient p41 = new Patient("MRN-2026-1668", "Evelyn", "Roberts", LocalDate.of(1994, 8, 9), 32, "Female", "AB-", "+1 (555) 219-4567", "George Roberts (Father) - +1 (555) 219-4560", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p41);
        Patient p42 = new Patient("MRN-2026-7871", "Deepak", "Carter", LocalDate.of(1981, 1, 15), 45, "Male", "B+", "+1 (555) 765-8901", "Sunita Carter (Wife) - +1 (555) 765-8900", "Clindamycin", "Exam Room 1", "Admitted");
        patientRepository.save(p42);
        Patient p43 = new Patient("MRN-2026-7644", "Natalie", "Phillips", LocalDate.of(1998, 12, 3), 27, "Female", "O+", "+1 (555) 321-4569", "Thomas Phillips (Father) - +1 (555) 321-4560", "Latex", "Exam Room 1", "Admitted");
        patientRepository.save(p43);
        Patient p44 = new Patient("MRN-2026-3910", "Gabriel", "Evans", LocalDate.of(1975, 7, 27), 51, "Male", "A+", "+1 (555) 987-2134", "Martha Evans (Wife) - +1 (555) 987-2130", "Penicillin, Cephalexin", "Exam Room 1", "Admitted");
        patientRepository.save(p44);
        Patient p45 = new Patient("MRN-2026-3754", "Tara", "Turner", LocalDate.of(1990, 3, 9), 36, "Female", "B-", "+1 (555) 654-7893", "Siddharth Turner (Brother) - +1 (555) 654-7890", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p45);
        Patient p46 = new Patient("MRN-2026-2563", "Adrian", "Torres", LocalDate.of(1983, 9, 14), 43, "Male", "O-", "+1 (555) 432-6548", "Sofia Torres (Wife) - +1 (555) 432-6540", "Sulfa Drugs", "Exam Room 1", "Admitted");
        patientRepository.save(p46);
        Patient p47 = new Patient("MRN-2026-4796", "Mia", "Parker", LocalDate.of(2001, 5, 20), 25, "Female", "A+", "+1 (555) 876-1239", "Jonathan Parker (Father) - +1 (555) 876-1230", "Peanuts", "Exam Room 1", "Admitted");
        patientRepository.save(p47);
        Patient p48 = new Patient("MRN-2026-7360", "Ryan", "Collins", LocalDate.of(1977, 2, 11), 49, "Male", "AB+", "+1 (555) 543-8765", "Jessica Collins (Wife) - +1 (555) 543-8760", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p48);
        Patient p49 = new Patient("MRN-2026-5744", "Leela", "Edwards", LocalDate.of(1988, 6, 25), 38, "Female", "O+", "+1 (555) 219-6543", "Anand Edwards (Spouse) - +1 (555) 219-6540", "Aspirin, NSAIDs", "Exam Room 1", "Admitted");
        patientRepository.save(p49);
        Patient p50 = new Patient("MRN-2026-2696", "Matthew", "Stewart", LocalDate.of(1963, 10, 4), 62, "Male", "B+", "+1 (555) 765-4321", "Carol Stewart (Wife) - +1 (555) 765-4320", "Hydrocodone", "Exam Room 1", "Admitted");
        patientRepository.save(p50);
        Patient p51 = new Patient("MRN-2026-3643", "Sarah", "Morris", LocalDate.of(1996, 3, 18), 30, "Female", "A-", "+1 (555) 321-7890", "Philip Morris (Brother) - +1 (555) 321-7890", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p51);
        Patient p52 = new Patient("MRN-2026-3273", "Anil", "Kumar", LocalDate.of(1982, 8, 14), 44, "Male", "O+", "+1 (555) 345-6711", "Sunita Kumar (Wife) - +1 (555) 345-6710", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p52);
        Patient p53 = new Patient("MRN-2026-3642", "Jennifer", "Lopez", LocalDate.of(1991, 3, 27), 35, "Female", "A+", "+1 (555) 789-1234", "David Lopez (Husband) - +1 (555) 789-1230", "Penicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p53);
        Patient p54 = new Patient("MRN-2026-4683", "Brandon", "Taylor", LocalDate.of(1986, 11, 12), 39, "Male", "B-", "+1 (555) 456-9871", "Sarah Taylor (Wife) - +1 (555) 456-9870", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p54);
        Patient p55 = new Patient("MRN-2026-7081", "Ritu", "Agarwal", LocalDate.of(1997, 1, 30), 29, "Female", "AB+", "+1 (555) 890-2345", "Manish Agarwal (Brother) - +1 (555) 890-2340", "Sulfa Drugs", "Exam Room 1", "Admitted");
        patientRepository.save(p55);
        Patient p56 = new Patient("MRN-2026-4559", "Jason", "Reed", LocalDate.of(1974, 6, 18), 52, "Male", "O-", "+1 (555) 678-3456", "Emily Reed (Wife) - +1 (555) 678-3450", "Aspirin", "Exam Room 1", "Admitted");
        patientRepository.save(p56);
        Patient p57 = new Patient("MRN-2026-8832", "Divya", "Srinivasan", LocalDate.of(1993, 9, 5), 33, "Female", "A-", "+1 (555) 234-8901", "Karthik Srinivasan (Spouse) - +1 (555) 234-8900", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p57);
        Patient p58 = new Patient("MRN-2026-1656", "Christopher", "Harris", LocalDate.of(1968, 4, 22), 58, "Male", "B+", "+1 (555) 876-4321", "Carol Harris (Wife) - +1 (555) 876-4320", "Codeine", "Exam Room 1", "Admitted");
        patientRepository.save(p58);
        Patient p59 = new Patient("MRN-2026-4835", "Fatima", "Zahra", LocalDate.of(2000, 12, 11), 25, "Female", "O+", "+1 (555) 543-6789", "Omar Zahra (Father) - +1 (555) 543-6780", "Latex", "Exam Room 1", "Admitted");
        patientRepository.save(p59);
        Patient p60 = new Patient("MRN-2026-2286", "Andrew", "Jackson", LocalDate.of(1981, 10, 9), 44, "Male", "AB-", "+1 (555) 321-8765", "Beth Jackson (Wife) - +1 (555) 321-8760", "None (NKDA)", "Exam Room 1", "Admitted");
        patientRepository.save(p60);
        Patient p61 = new Patient("MRN-2026-6881", "Pooja", "Menon", LocalDate.of(1995, 2, 19), 31, "Female", "A+", "+1 (555) 987-5432", "Rahul Menon (Husband) - +1 (555) 987-5430", "Amoxicillin", "Exam Room 1", "Admitted");
        patientRepository.save(p61);

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
