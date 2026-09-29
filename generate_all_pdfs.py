import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Theme Palette
C_PRIMARY = colors.HexColor("#0F172A")    # Deep Navy
C_SECONDARY = colors.HexColor("#2563EB")  # Medical Blue
C_SUCCESS = colors.HexColor("#059669")    # Emerald
C_ALERT = colors.HexColor("#E11D48")      # Rose
C_TEXT = colors.HexColor("#1E293B")       # Slate 800
C_MUTED = colors.HexColor("#64748B")      # Slate 500
C_BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
C_BORDER = colors.HexColor("#CBD5E1")     # Slate 300
C_WHITE = colors.HexColor("#FFFFFF")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(C_MUTED)
        
        # Header rule & title
        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(40, self._pagesize[1] - 30, self._pagesize[0] - 40, self._pagesize[1] - 30)
        self.drawString(40, self._pagesize[1] - 25, "CareConnect: Patient-Provider Electronic Health Record (EHR)")
        self.drawRightString(self._pagesize[0] - 40, self._pagesize[1] - 25, "Confidential Protected Health Information (PHI) • HIPAA Aligned")
        
        # Footer rule & page number
        self.line(40, 35, self._pagesize[0] - 40, 35)
        self.drawString(40, 22, "CareConnect EHR Specification • Live at careconnect-ehr.vercel.app")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(self._pagesize[0] - 40, 22, page_str)
        self.restoreState()


def build_modules_and_usecases_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_MUTED,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=C_SECONDARY,
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=C_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=C_TEXT,
        leftIndent=12,
        spaceAfter=3
    )

    badge_style = ParagraphStyle(
        'Badge',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=C_SECONDARY
    )

    tbl_head = ParagraphStyle('TblH', fontName='Helvetica-Bold', fontSize=8.5, leading=10, textColor=C_WHITE)
    tbl_cell = ParagraphStyle('TblC', fontName='Helvetica', fontSize=8.5, leading=11, textColor=C_TEXT)
    tbl_cell_bold = ParagraphStyle('TblCB', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=C_TEXT)

    story = []

    # Title & Metadata
    story.append(Paragraph("CareConnect: Patient-Provider Electronic Health Record (EHR)", title_style))
    story.append(Paragraph("<b>Comprehensive System Modules, Use Cases Specification & Technical Architecture</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_SECONDARY, spaceBefore=0, spaceAfter=12))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Document Version:</b>", tbl_cell_bold), Paragraph("2.0.0 (Production Verified)", tbl_cell),
         Paragraph("<b>Target Platform:</b>", tbl_cell_bold), Paragraph("Web (React 19 + Spring Boot 3)", tbl_cell)],
        [Paragraph("<b>Live Frontend:</b>", tbl_cell_bold), Paragraph("https://careconnect-ehr.vercel.app/", tbl_cell),
         Paragraph("<b>Live Backend API:</b>", tbl_cell_bold), Paragraph("https://careconnect-backend-uim9.onrender.com", tbl_cell)],
        [Paragraph("<b>GitHub Monorepo:</b>", tbl_cell_bold), Paragraph("https://github.com/faizan0264/careconnect-ehr", tbl_cell),
         Paragraph("<b>Database DDL:</b>", tbl_cell_bold), Paragraph("Oracle Database 19c/21c (CLOB/Cascades)", tbl_cell)]
    ]
    t_meta = Table(meta_data, colWidths=[1.4*inch, 2.3*inch, 1.4*inch, 2.3*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # Executive Overview
    story.append(Paragraph("1. Executive Overview & System Purpose", h1_style))
    story.append(Paragraph(
        "CareConnect EHR is an enterprise-grade hospital information and clinical consultation portal designed to bridge the systemic disconnect between healthcare providers and patients. "
        "The system enforces strict <b>Role-Based Access Control (RBAC)</b> across Doctors, Patients, and Administrators, while eliminating clinical blindspots through real-time "
        "<b>Drug-Allergy Interaction Checks</b>, <b>Physician Schedule Collision Prevention</b>, a dual-access <b>Medical Report & Diagnostic Document Vault</b>, and an immutable <b>HIPAA Audit Trail Engine</b>.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # Section 2: Complete Module Matrix
    story.append(Paragraph("2. System Modules Architecture Matrix", h1_style))
    
    modules_table_data = [
        [Paragraph("Module #", tbl_head), Paragraph("Module Name", tbl_head), Paragraph("Primary Actor", tbl_head), Paragraph("Key Functional Scope", tbl_head), Paragraph("Compliance / Standards", tbl_head)],
        [Paragraph("<b>MOD-01</b>", tbl_cell_bold), Paragraph("Authentication & Access Governance", tbl_cell), Paragraph("All (Doctor, Patient, Admin)", tbl_cell), Paragraph("Strict zero-phantom login, credential hashing, profile credential updates, session management.", tbl_cell), Paragraph("NIST 800-63B / HIPAA Access Control", tbl_cell)],
        [Paragraph("<b>MOD-02</b>", tbl_cell_bold), Paragraph("Doctor Clinical Workstation", tbl_cell), Paragraph("Doctor / Physician", tbl_cell), Paragraph("Clinic queue, longitudinal chart inspection, full SOAP notes (Subjective, Objective, Assessment, Plan), real-time vitals.", tbl_cell), Paragraph("HL7 CDA / SOAP Standard", tbl_cell)],
        [Paragraph("<b>MOD-03</b>", tbl_cell_bold), Paragraph("Computerized Physician Order Entry (CPOE)", tbl_cell), Paragraph("Doctor / Physician", tbl_cell), Paragraph("Electronic orders for Laboratory panels and Radiology scans with priority flags (Routine/STAT) and result fulfillment.", tbl_cell), Paragraph("ONC CPOE Certification Criteria", tbl_cell)],
        [Paragraph("<b>MOD-04</b>", tbl_cell_bold), Paragraph("e-Prescribing & Allergy Safety Engine", tbl_cell), Paragraph("Doctor / Physician", tbl_cell), Paragraph("Prescription dispatch with active allergy cross-referencing, critical contraindication modals, and formal override auditing.", tbl_cell), Paragraph("FDA Adverse Drug Safety Guidelines", tbl_cell)],
        [Paragraph("<b>MOD-05</b>", tbl_cell_bold), Paragraph("Patient Health Portal & AVS", tbl_cell), Paragraph("Patient", tbl_cell), Paragraph("Longitudinal health overview, After-Visit Summary (AVS) review with 1-click browser printing, pharmacy refill requests.", tbl_cell), Paragraph("Meaningful Use Stage 3 Patient Access", tbl_cell)],
        [Paragraph("<b>MOD-06</b>", tbl_cell_bold), Paragraph("Conflict-Free Appointment Scheduling", tbl_cell), Paragraph("Patient / Doctor", tbl_cell), Paragraph("Real-time physician schedule collision detection, busy-slot locking, appointment status updates, cancellation.", tbl_cell), Paragraph("ACID Transaction Isolation", tbl_cell)],
        [Paragraph("<b>MOD-07</b>", tbl_cell_bold), Paragraph("Medical Report & Diagnostic Vault", tbl_cell), Paragraph("Doctor & Patient", tbl_cell), Paragraph("Dual-access Base64 file upload (PDF/PNG/JPG up to 15MB), in-browser image preview, clinical findings, one-click file download.", tbl_cell), Paragraph("DICOM / CLOB Document Storage", tbl_cell)],
        [Paragraph("<b>MOD-08</b>", tbl_cell_bold), Paragraph("Admin Console & HIPAA Audit Trail", tbl_cell), Paragraph("Administrator", tbl_cell), Paragraph("User provisioning (add doctors/nurses), account deactivation, immutable HIPAA audit log capturing IP, user, action, and timestamp.", tbl_cell), Paragraph("45 CFR § 164.312(b) Audit Controls", tbl_cell)]
    ]
    t_mod = Table(modules_table_data, colWidths=[0.8*inch, 1.6*inch, 1.2*inch, 2.6*inch, 1.4*inch])
    t_mod.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_BG_LIGHT]),
    ]))
    story.append(t_mod)
    story.append(Spacer(1, 14))

    # Section 3: Detailed Use Cases
    story.append(Paragraph("3. Detailed Use Cases & Execution Workflows", h1_style))

    use_cases = [
        ("UC-01: Physician Drug-Allergy Safety Interception & Override", [
            "<b>Primary Actor:</b> Attending Physician (ROLE_DOCTOR)",
            "<b>Precondition:</b> Patient has documented drug allergies in chart (e.g., Penicillin for John Doe).",
            "<b>Trigger:</b> Physician prescribes contraindicated antibiotic (e.g., Amoxicillin 500mg).",
            "<b>Standard Flow:</b> 1. System detects therapeutic allergen match. 2. Halts order dispatch. 3. Displays Critical Allergy Alert modal. 4. Physician reviews risk, selects clinical justification ('Clinical benefit outweighs risk with close monitoring'), checks legal responsibility acknowledgment. 5. Order commits to e-Prescription log. 6. Audit engine writes DOCUMENT_ORDER event with override rationale.",
            "<b>Postcondition:</b> Safe clinical audit trail maintained; pharmacy alerted to monitored override."
        ]),
        ("UC-02: Patient Conflict-Free Appointment Scheduling", [
            "<b>Primary Actor:</b> Patient (ROLE_PATIENT)",
            "<b>Precondition:</b> Patient is logged into Portal; physician clinic schedule exists.",
            "<b>Trigger:</b> Patient selects physician, target date, and requested consultation time.",
            "<b>Standard Flow:</b> 1. Interface queries physician appointments for target date. 2. Occupied slots are dynamically flagged with 'Busy ●' and disabled. 3. If patient attempts selecting an occupied slot, an active Conflict Warning alert appears. 4. Patient selects an open slot and submits. 5. Backend validates concurrency and persists appointment. 6. HIPAA audit log captures APPOINTMENT_SCHEDULED.",
            "<b>Postcondition:</b> Double-booking is completely prevented across frontend and API layers."
        ]),
        ("UC-03: Dual-Access Medical Report Vault & File Ingestion", [
            "<b>Primary Actor:</b> Patient (ROLE_PATIENT) or Doctor (ROLE_DOCTOR)",
            "<b>Precondition:</b> User has a diagnostic document (PDF, PNG, JPG up to 15MB).",
            "<b>Trigger:</b> User clicks 'Upload Document' or 'Upload Scan / Report'.",
            "<b>Standard Flow:</b> 1. User drags and drops file or selects from filesystem. 2. HTML5 FileReader encodes file to Base64 CLOB. 3. System auto-categorizes document (Radiology, Lab, Pathology, etc.). 4. User adds clinical findings and date. 5. Document is stored in database with clear attribution tag ('Physician File' vs 'Patient Record'). 6. Both actors can inspect scan preview in-browser and download file.",
            "<b>Postcondition:</b> Document securely attached to chart; DOCUMENT_UPLOADED written to audit log."
        ]),
        ("UC-04: HIPAA Security Audit Trail Verification", [
            "<b>Primary Actor:</b> Hospital Compliance Officer / Administrator (ROLE_ADMIN)",
            "<b>Precondition:</b> Administrator is authenticated to the Admin Console.",
            "<b>Trigger:</b> Administrator accesses HIPAA Audit Trail tab.",
            "<b>Standard Flow:</b> 1. System queries immutable AUDIT_LOGS table. 2. Renders chronologically ordered security events capturing user identity, assigned role, client IP address, action type, and exact timestamp. 3. Administrator filters by action (VIEW_RECORD, CREATE_ORDER, DOCUMENT_UPLOADED, DOCUMENT_DELETED).",
            "<b>Postcondition:</b> Full forensic traceability for regulatory compliance audits."
        ])
    ]

    for uc_title, uc_points in use_cases:
        story.append(Paragraph(uc_title, h2_style))
        for pt in uc_points:
            story.append(Paragraph(f"• {pt}", bullet_style))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # Section 4: Oracle Database Schema Specification
    story.append(Paragraph("4. Oracle Database 19c/21c Enterprise Schema Specification", h1_style))
    story.append(Paragraph(
        "The relational schema is defined in <b>CareConnect_Oracle_Schema.sql</b>. It enforces strict referential integrity, check constraints, foreign keys with ON DELETE CASCADE, and performance B-Tree indexes.",
        body_style
    ))

    schema_table_data = [
        [Paragraph("Table Name", tbl_head), Paragraph("Primary Key", tbl_head), Paragraph("Foreign Keys", tbl_head), Paragraph("Key Columns & Data Types", tbl_head), Paragraph("Integrity Constraints", tbl_head)],
        [Paragraph("<b>USERS</b>", tbl_cell_bold), Paragraph("USER_ID (NUMBER)", tbl_cell), Paragraph("None", tbl_cell), Paragraph("USERNAME VARCHAR2(100), PASSWORD_HASH VARCHAR2(255), ROLE VARCHAR2(50), FULL_NAME VARCHAR2(150), EMAIL VARCHAR2(150)", tbl_cell), Paragraph("UNIQUE(USERNAME), CHECK(ROLE IN ('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN'))", tbl_cell)],
        [Paragraph("<b>PATIENTS</b>", tbl_cell_bold), Paragraph("PATIENT_ID (NUMBER)", tbl_cell), Paragraph("USER_ID -> USERS", tbl_cell), Paragraph("MRN VARCHAR2(50), FIRST_NAME VARCHAR2(100), LAST_NAME VARCHAR2(100), DOB DATE, ALLERGIES VARCHAR2(500), BLOOD_GROUP VARCHAR2(10)", tbl_cell), Paragraph("UNIQUE(MRN), ON DELETE CASCADE", tbl_cell)],
        [Paragraph("<b>APPOINTMENTS</b>", tbl_cell_bold), Paragraph("APPT_ID (NUMBER)", tbl_cell), Paragraph("PATIENT_ID -> PATIENTS, DOCTOR_ID -> USERS", tbl_cell), Paragraph("APPT_DATE VARCHAR2(20), TIME_SLOT VARCHAR2(20), REASON VARCHAR2(500), STATUS VARCHAR2(50)", tbl_cell), Paragraph("CHECK(STATUS IN ('Confirmed','Cancelled','Completed')), B-Tree Index on (DOCTOR_ID, APPT_DATE)", tbl_cell)],
        [Paragraph("<b>ENCOUNTERS</b>", tbl_cell_bold), Paragraph("ENCOUNTER_ID (NUMBER)", tbl_cell), Paragraph("PATIENT_ID -> PATIENTS", tbl_cell), Paragraph("DOCTOR_NAME VARCHAR2(150), VITALS_BP VARCHAR2(20), VITALS_HR NUMBER, SOAP_SUBJECTIVE CLOB, SOAP_PLAN CLOB", tbl_cell), Paragraph("ON DELETE CASCADE", tbl_cell)],
        [Paragraph("<b>DIAGNOSTIC_ORDERS</b>", tbl_cell_bold), Paragraph("ORDER_ID (NUMBER)", tbl_cell), Paragraph("PATIENT_ID -> PATIENTS", tbl_cell), Paragraph("ORDER_NAME VARCHAR2(255), ORDER_TYPE VARCHAR2(50), PRIORITY VARCHAR2(20), RESULT CLOB, STATUS VARCHAR2(50)", tbl_cell), Paragraph("CHECK(PRIORITY IN ('Routine','Urgent','STAT'))", tbl_cell)],
        [Paragraph("<b>PRESCRIPTIONS</b>", tbl_cell_bold), Paragraph("RX_ID (NUMBER)", tbl_cell), Paragraph("PATIENT_ID -> PATIENTS", tbl_cell), Paragraph("DRUG_NAME VARCHAR2(255), DOSAGE VARCHAR2(100), FREQUENCY VARCHAR2(100), OVERRIDE_REASON VARCHAR2(500), STATUS VARCHAR2(50)", tbl_cell), Paragraph("ON DELETE CASCADE", tbl_cell)],
        [Paragraph("<b>MEDICAL_REPORTS</b>", tbl_cell_bold), Paragraph("REPORT_ID (NUMBER)", tbl_cell), Paragraph("PATIENT_ID -> PATIENTS", tbl_cell), Paragraph("TITLE VARCHAR2(255), REPORT_TYPE VARCHAR2(50), FILE_NAME VARCHAR2(255), FILE_DATA CLOB, UPLOADED_BY VARCHAR2(150), UPLOADER_ROLE VARCHAR2(50)", tbl_cell), Paragraph("CHECK(REPORT_TYPE IN ('LABORATORY','RADIOLOGY','PATHOLOGY','PRESCRIPTION','DISCHARGE_SUMMARY','OTHER'))", tbl_cell)],
        [Paragraph("<b>AUDIT_LOGS</b>", tbl_cell_bold), Paragraph("LOG_ID (NUMBER)", tbl_cell), Paragraph("None (Independent)", tbl_cell), Paragraph("USER_NAME VARCHAR2(150), ACTION VARCHAR2(100), DETAILS VARCHAR2(1000), IP_ADDRESS VARCHAR2(50), TIMESTAMP TIMESTAMP", tbl_cell), Paragraph("B-Tree Index on (TIMESTAMP), Immutable Append-Only", tbl_cell)]
    ]
    t_sch = Table(schema_table_data, colWidths=[1.1*inch, 1.1*inch, 1.2*inch, 2.4*inch, 1.8*inch])
    t_sch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_BG_LIGHT]),
    ]))
    story.append(t_sch)
    story.append(Spacer(1, 14))

    # Section 5: REST API Specifications
    story.append(Paragraph("5. Spring Boot REST API Endpoint Directory", h1_style))
    
    api_table_data = [
        [Paragraph("Method", tbl_head), Paragraph("Endpoint URI", tbl_head), Paragraph("Controller", tbl_head), Paragraph("Payload / Parameters", tbl_head), Paragraph("Description & Audit Action", tbl_head)],
        [Paragraph("<b>POST</b>", tbl_cell_bold), Paragraph("/api/v1/auth/login", tbl_cell), Paragraph("AuthController", tbl_cell), Paragraph("{ username, password }", tbl_cell), Paragraph("Authenticates credentials; returns user profile.", tbl_cell)],
        [Paragraph("<b>POST</b>", tbl_cell_bold), Paragraph("/api/v1/auth/signup", tbl_cell), Paragraph("AuthController", tbl_cell), Paragraph("{ fullName, email, password, dob... }", tbl_cell), Paragraph("Registers new patient; generates unique MRN.", tbl_cell)],
        [Paragraph("<b>PUT</b>", tbl_cell_bold), Paragraph("/api/v1/auth/profile", tbl_cell), Paragraph("AuthController", tbl_cell), Paragraph("{ currentUsername, newUsername, newPassword }", tbl_cell), Paragraph("Updates credentials; logs security audit event.", tbl_cell)],
        [Paragraph("<b>GET</b>", tbl_cell_bold), Paragraph("/api/v1/patients", tbl_cell), Paragraph("PatientController", tbl_cell), Paragraph("None", tbl_cell), Paragraph("Retrieves all clinical patient records.", tbl_cell)],
        [Paragraph("<b>POST</b>", tbl_cell_bold), Paragraph("/api/v1/appointments/book", tbl_cell), Paragraph("AppointmentController", tbl_cell), Paragraph("{ patientId, doctorId, date, timeSlot }", tbl_cell), Paragraph("Enforces collision check; logs APPOINTMENT_SCHEDULED.", tbl_cell)],
        [Paragraph("<b>POST</b>", tbl_cell_bold), Paragraph("/api/v1/reports/upload", tbl_cell), Paragraph("MedicalReportController", tbl_cell), Paragraph("{ patientId, title, fileData, notes... }", tbl_cell), Paragraph("Stores Base64 scan; logs DOCUMENT_UPLOADED.", tbl_cell)],
        [Paragraph("<b>GET</b>", tbl_cell_bold), Paragraph("/api/v1/reports/patient/{id}", tbl_cell), Paragraph("MedicalReportController", tbl_cell), Paragraph("patientId", tbl_cell), Paragraph("Retrieves all diagnostic reports for chart.", tbl_cell)],
        [Paragraph("<b>DELETE</b>", tbl_cell_bold), Paragraph("/api/v1/reports/{id}", tbl_cell), Paragraph("MedicalReportController", tbl_cell), Paragraph("id, deletedBy", tbl_cell), Paragraph("Removes document; logs DOCUMENT_DELETED.", tbl_cell)],
        [Paragraph("<b>GET</b>", tbl_cell_bold), Paragraph("/api/v1/audit/logs", tbl_cell), Paragraph("AuditController", tbl_cell), Paragraph("action (optional)", tbl_cell), Paragraph("Returns HIPAA immutable audit events.", tbl_cell)],
        [Paragraph("<b>GET</b>", tbl_cell_bold), Paragraph("/swagger-ui.html", tbl_cell), Paragraph("OpenAPI / Swagger", tbl_cell), Paragraph("None (Interactive UI)", tbl_cell), Paragraph("Interactive live API sandbox and documentation.", tbl_cell)]
    ]
    t_api = Table(api_table_data, colWidths=[0.8*inch, 2.0*inch, 1.4*inch, 1.8*inch, 1.6*inch])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [C_WHITE, C_BG_LIGHT]),
    ]))
    story.append(t_api)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Specification PDF: {output_path}")


def build_presentation_pdf(output_path):
    # Landscape Letter (11 x 8.5 inches) for slide format
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    slide_title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=C_PRIMARY,
        spaceAfter=4
    )

    slide_sub_style = ParagraphStyle(
        'SlideSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=C_MUTED,
        spaceAfter=12
    )

    card_head_style = ParagraphStyle(
        'CardH',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=C_PRIMARY,
        spaceAfter=4
    )

    card_body_style = ParagraphStyle(
        'CardB',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT
    )

    hero_title_style = ParagraphStyle(
        'HeroT',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=C_WHITE,
        spaceAfter=8
    )

    hero_sub_style = ParagraphStyle(
        'HeroSub',
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#CBD5E1"),
        spaceAfter=16
    )

    story = []

    # Slide 1: Hero Cover Slide
    cover_data = [
        [Paragraph("HEALTHCARE INFORMATION SYSTEM • CAPSTONE SUBMISSION", ParagraphStyle('CoverTag', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#38BDF8")))],
        [Paragraph("CareConnect: Patient-Provider Electronic Health Record", hero_title_style)],
        [Paragraph("Enterprise-Grade Full-Stack EHR System with Real-Time Drug-Allergy Safety Engine, Conflict-Free Scheduling, Medical Report Vault, and HIPAA Audit Governance", hero_sub_style)],
        [HRFlowable(width="100%", thickness=1, color=colors.HexColor("#334155"), spaceBefore=0, spaceAfter=14)],
        [Table([
            [Paragraph("<b>LIVE WEB APPLICATION</b><br/><font color='#38BDF8'>https://careconnect-ehr.vercel.app/</font><br/>React 19 + Vite + Tailwind CDN", ParagraphStyle('CoverMeta', fontName='Helvetica', fontSize=9, leading=12, textColor=C_WHITE)),
             Paragraph("<b>LIVE REST API & SWAGGER</b><br/><font color='#34D399'>https://careconnect-backend-uim9.onrender.com</font><br/>Spring Boot 3 + Java 17 + Docker", ParagraphStyle('CoverMeta2', fontName='Helvetica', fontSize=9, leading=12, textColor=C_WHITE)),
             Paragraph("<b>SOURCE CODE REPOSITORY</b><br/><font color='#FBBF24'>https://github.com/faizan0264/careconnect-ehr</font><br/>Oracle 19c/21c DDL + Monorepo", ParagraphStyle('CoverMeta3', fontName='Helvetica', fontSize=9, leading=12, textColor=C_WHITE))]
        ], colWidths=[3.2*inch, 3.5*inch, 3.2*inch])]
    ]
    t_cover = Table(cover_data, colWidths=[10*inch])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_PRIMARY),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
        ('RIGHTPADDING', (0,0), (-1,-1), 24),
    ]))
    story.append(t_cover)
    story.append(PageBreak())

    # Helper function for 3-column slides
    def add_slide_3col(title, subtitle, c1_title, c1_text, c2_title, c2_text, c3_title, c3_text, c1_color=C_SECONDARY, c2_color=C_SUCCESS, c3_color=C_PRIMARY):
        s_story = []
        s_story.append(Paragraph(title, slide_title_style))
        s_story.append(Paragraph(subtitle, slide_sub_style))
        s_story.append(HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceBefore=0, spaceAfter=12))

        col1_content = [Paragraph(f"<b>{c1_title}</b>", ParagraphStyle('C1H', parent=card_head_style, textColor=c1_color)), Spacer(1, 4), Paragraph(c1_text, card_body_style)]
        col2_content = [Paragraph(f"<b>{c2_title}</b>", ParagraphStyle('C2H', parent=card_head_style, textColor=c2_color)), Spacer(1, 4), Paragraph(c2_text, card_body_style)]
        col3_content = [Paragraph(f"<b>{c3_title}</b>", ParagraphStyle('C3H', parent=card_head_style, textColor=c3_color)), Spacer(1, 4), Paragraph(c3_text, card_body_style)]

        t_cols = Table([[col1_content, col2_content, col3_content]], colWidths=[3.3*inch, 3.3*inch, 3.4*inch])
        t_cols.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), C_BG_LIGHT),
            ('BACKGROUND', (1,0), (1,0), C_BG_LIGHT),
            ('BACKGROUND', (2,0), (2,0), C_BG_LIGHT),
            ('BOX', (0,0), (0,0), 1, C_BORDER),
            ('BOX', (1,0), (1,0), 1, C_BORDER),
            ('BOX', (2,0), (2,0), 1, C_BORDER),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        s_story.append(t_cols)
        s_story.append(PageBreak())
        return s_story

    # Slide 2: Problem & Motivation
    story.extend(add_slide_3col(
        "1. Problem Statement & Clinical Motivation",
        "Preventable medical errors and scheduling friction cost hundreds of thousands of lives and billions of dollars annually.",
        "Medical Errors & Siloed Charts",
        "• Over 250,000 deaths annually occur from preventable adverse drug events (ADEs).<br/>• Physicians lack instantaneous allergy cross-checks at the moment of electronic prescribing.<br/>• Crucial contraindications (e.g., Penicillin allergies) are buried in fragmented paper/PDF files.",
        "Patient Disempowerment",
        "• Patients lack real-time digital access to their longitudinal health history and visit plans.<br/>• Unable to securely transmit outside radiology scans or prior hospital records to treating doctors.<br/>• Significant friction in requesting prescription refills leads to therapy discontinuation.",
        "Scheduling Chaos & Collisions",
        "• Clinic double-booking causes severe physician burnout and multi-hour patient waiting times.<br/>• Traditional booking forms fail to check doctor availability before committing slots.<br/>• Lack of immutable HIPAA audit trails creates severe regulatory non-compliance risks.",
        c1_color=C_ALERT, c2_color=C_SECONDARY, c3_color=C_PRIMARY
    ))

    # Slide 3: CareConnect Solution & Portals
    story.extend(add_slide_3col(
        "2. The CareConnect Solution: 3 Unified Portals",
        "Connecting patients, physicians, and administrators within a synchronized, highly secure ecosystem.",
        "Doctor Clinical Workstation",
        "• Active clinic consultation queue with 1-click chart access.<br/>• Full SOAP clinical encounter notes (Subjective, Objective, Assessment, Plan).<br/>• Comprehensive vitals history tracking.<br/>• Computerized Physician Order Entry (CPOE) for Labs and Imaging.<br/>• e-Prescribing with real-time Allergy Safety Engine.<br/>• Diagnostic scan inspection and report review.",
        "Patient Self-Service Portal",
        "• Longitudinal health summary and vital signs history.<br/>• Digital After-Visit Summary (AVS) with 1-click physical printing.<br/>• Conflict-free appointment booking with real-time schedule busy-slot detection.<br/>• 1-click prescription refill requests with pharmacy tracking.<br/>• Medical Report Vault for outside record upload.<br/>• Self-registration with automatic MRN allocation.",
        "Admin Governance & HIPAA",
        "• Hospital-wide census and clinical volume analytics.<br/>• User provisioning: add verified physicians and nurses.<br/>• Staff account deactivation and credential updates.<br/>• Immutable HIPAA Audit Trail capturing every access, order, and document event with IP and timestamp.<br/>• Strict zero-phantom-login enforcement.",
        c1_color=C_SECONDARY, c2_color=C_SUCCESS, c3_color=C_PRIMARY
    ))

    # Slide 4: Multi-Tier Architecture
    story.extend(add_slide_3col(
        "3. System Architecture & Engineering Stack",
        "Built on modern enterprise standards ensuring separation of concerns, high throughput, and zero downtime.",
        "Client Tier: React 19 + Vite 6",
        "• <b>React 19</b> component-driven UI with modern hooks.<br/>• <b>Tailwind CSS</b> clinical design system.<br/>• <b>EhrContext</b> centralized state management.<br/>• <b>HTML5 FileReader</b> Base64 document encoding.<br/>• <b>LocalStorage</b> dual-sync for offline resilience.<br/>• <b>Vercel Edge Cloud</b> global CDN hosting.",
        "Server Tier: Spring Boot 3.3.4",
        "• <b>Java 17+ (LTS)</b> enterprise object-oriented runtime.<br/>• <b>Spring MVC</b> REST API controllers.<br/>• <b>Spring Data JPA</b> repository abstractions.<br/>• <b>Hibernate 6</b> ORM & schema management.<br/>• <b>OpenAPI 3.0 / Swagger UI</b> interactive API sandbox.<br/>• <b>Render Docker Container</b> microservice.",
        "Data Tier: Oracle 19c/21c DDL",
        "• <b>8 Relational Tables</b> with full foreign keys.<br/>• <b>ON DELETE CASCADE</b> referential rules.<br/>• <b>CHECK & UNIQUE Constraints</b> on roles & MRNs.<br/>• <b>B-Tree Indexes</b> on dates, MRNs, timestamps.<br/>• <b>CLOB Storage</b> for encrypted Base64 documents.<br/>• <b>H2 in-memory</b> zero-dependency fallback.",
        c1_color=C_SECONDARY, c2_color=C_SUCCESS, c3_color=C_PRIMARY
    ))

    # Slide 5: Star Feature - Allergy Safety & Conflict-Free Booking
    story.extend(add_slide_3col(
        "4. Star Features: Clinical Safety & Conflict-Free Scheduling",
        "Proprietary clinical intelligence algorithms protecting patients and optimizing clinic operations.",
        "Drug-Allergy Safety Engine",
        "• <b>Real-Time Interception:</b> When a doctor prescribes a drug, the engine cross-references patient allergies.<br/>• <b>Contraindication Modal:</b> Prescribing Amoxicillin to a Penicillin-allergic patient triggers an immediate high-priority warning.<br/>• <b>Override Accountability:</b> Requires formal clinical justification ('Benefit outweighs risk') and signed acknowledgment.<br/>• <b>Audit Trail:</b> Logged to HIPAA audit table.",
        "Schedule Collision Prevention",
        "• <b>Busy-Slot Detection:</b> Real-time check queries doctor appointments on selected date.<br/>• <b>Visual Busy Alerts:</b> Occupied slots (e.g. 10:30 AM) are highlighted in rose with 'Busy ●' tag.<br/>• <b>Booking Lock:</b> Submit button disables automatically with conflict message.<br/>• <b>API Isolation:</b> Backend enforces concurrency lock returning HTTP 409 if double-booked.",
        "Medical Report Vault",
        "• <b>Dual-Access:</b> Both patients and doctors upload files up to 15MB.<br/>• <b>HTML5 Ingestion:</b> Drag-and-drop file upload with Base64 CLOB persistence.<br/>• <b>In-Browser Preview:</b> Inspect radiology scans without third-party tools.<br/>• <b>Clear Attribution:</b> Tagged as 'Physician File' vs 'Patient Record'.<br/>• <b>Downloads:</b> One-click diagnostic downloads.",
        c1_color=C_ALERT, c2_color=C_SECONDARY, c3_color=C_SUCCESS
    ))

    # Slide 6: Live Deployment & Defense Credentials
    story.extend(add_slide_3col(
        "5. Live Deployment, Governance & Evaluator Credentials",
        "Live on Vercel and Render with interactive Swagger API docs and complete defense credentials.",
        "Doctor Persona Credentials",
        "• <b>Portal:</b> Doctor Portal<br/>• <b>Username:</b> <font color='#2563EB'><b>dr_smith</b></font> (or <i>dr.sharma</i>)<br/>• <b>Password:</b> <font color='#2563EB'><b>password123</b></font> (or <i>Doctor#2026</i>)<br/>• <b>Specialty:</b> Internal Medicine & Pulmonology<br/>• <b>Key Demo:</b> Open chart for John Doe, review vitals/SOAP, prescribe Amoxicillin to demonstrate Allergy Interception!",
        "Patient Persona Credentials",
        "• <b>Portal:</b> Patient Portal<br/>• <b>Username:</b> <font color='#059669'><b>patient1</b></font> (or <i>john_doe</i>)<br/>• <b>Password:</b> <font color='#059669'><b>Patient#2026</b></font> (or <i>password123</i>)<br/>• <b>MRN:</b> MRN-2026-0042 (Allergy: Penicillin)<br/>• <b>Key Demo:</b> Try booking Dr. Sarah Smith at 10:30 AM on Oct 14 to show Conflict Alert; upload outside lab report!",
        "Administrator Credentials",
        "• <b>Portal:</b> Admin Console<br/>• <b>Username:</b> <font color='#0F172A'><b>admin</b></font><br/>• <b>Password:</b> <font color='#0F172A'><b>Admin#2026</b></font><br/>• <b>Key Demo:</b> Open HIPAA Audit Trail tab to show real-time immutable logging of all chart views, orders, and uploads with IP address and timestamps.",
        c1_color=C_SECONDARY, c2_color=C_SUCCESS, c3_color=C_PRIMARY
    ))

    doc.build(story)
    print(f"Successfully generated Presentation PDF: {output_path}")

if __name__ == "__main__":
    out_spec = sys.argv[1] if len(sys.argv) > 1 else "CareConnect_Modules_and_UseCases_Specification.pdf"
    out_pres = sys.argv[2] if len(sys.argv) > 2 else "CareConnect_Project_Presentation.pdf"
    build_modules_and_usecases_pdf(out_spec)
    build_presentation_pdf(out_pres)
