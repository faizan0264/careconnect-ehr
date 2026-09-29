package com.careconnect.ehr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ENCOUNTERS")
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENCOUNTER_ID")
    private Long id;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "DOCTOR_ID", nullable = false)
    private Long doctorId;

    @Column(name = "DOCTOR_NAME", nullable = false)
    private String doctorName;

    @Column(name = "CHIEF_COMPLAINT", nullable = false, length = 500)
    private String chiefComplaint;

    // Vitals
    @Column(name = "BP_SYSTOLIC", nullable = false)
    private int bpSystolic;

    @Column(name = "BP_DIASTOLIC", nullable = false)
    private int bpDiastolic;

    @Column(name = "HEART_RATE", nullable = false)
    private int heartRate;

    @Column(name = "TEMP_FAHRENHEIT", nullable = false)
    private double tempFahrenheit;

    @Column(name = "SPO2_PERCENT", nullable = false)
    private int spo2Percent;

    @Column(name = "RESP_RATE")
    private int respRate = 18;

    // SOAP Notes
    @Lob
    @Column(name = "SOAP_SUBJECTIVE", nullable = false)
    private String subjective;

    @Lob
    @Column(name = "SOAP_OBJECTIVE", nullable = false)
    private String objective;

    @Lob
    @Column(name = "SOAP_ASSESSMENT", nullable = false)
    private String assessment;

    @Lob
    @Column(name = "SOAP_PLAN", nullable = false)
    private String plan;

    @Column(name = "IS_SIGNED", nullable = false)
    private boolean signed = false;

    @Column(name = "SIGNED_AT")
    private String signedAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Encounter() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }

    public int getBpSystolic() { return bpSystolic; }
    public void setBpSystolic(int bpSystolic) { this.bpSystolic = bpSystolic; }

    public int getBpDiastolic() { return bpDiastolic; }
    public void setBpDiastolic(int bpDiastolic) { this.bpDiastolic = bpDiastolic; }

    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }

    public double getTempFahrenheit() { return tempFahrenheit; }
    public void setTempFahrenheit(double tempFahrenheit) { this.tempFahrenheit = tempFahrenheit; }

    public int getSpo2Percent() { return spo2Percent; }
    public void setSpo2Percent(int spo2Percent) { this.spo2Percent = spo2Percent; }

    public int getRespRate() { return respRate; }
    public void setRespRate(int respRate) { this.respRate = respRate; }

    public String getSubjective() { return subjective; }
    public void setSubjective(String subjective) { this.subjective = subjective; }

    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }

    public String getAssessment() { return assessment; }
    public void setAssessment(String assessment) { this.assessment = assessment; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public boolean isSigned() { return signed; }
    public void setSigned(boolean signed) { this.signed = signed; }

    public String getSignedAt() { return signedAt; }
    public void setSignedAt(String signedAt) { this.signedAt = signedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
