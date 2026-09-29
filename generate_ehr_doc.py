import sys
import os

try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn
except ImportError:
    print("python-docx is not yet available.")
    sys.exit(1)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_heading_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    run = h.runs[0]
    if level == 1:
        run.font.color.rgb = RGBColor(16, 44, 87) # Deep Navy
        run.font.size = Pt(18)
    elif level == 2:
        run.font.color.rgb = RGBColor(27, 85, 155) # Medical Blue
        run.font.size = Pt(14)
    elif level == 3:
        run.font.color.rgb = RGBColor(41, 128, 185) # Lighter Blue
        run.font.size = Pt(12)
    return h

def create_table_styled(doc, headers, rows_data, col_widths=None):
    table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "1F4E79") # Deep Blue
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(9.5)

    # Data Rows
    for r_idx, row in enumerate(rows_data):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F2F5F8" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            for run in p.runs:
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(40, 40, 40)

    # Column Widths
    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    return table

def add_callout(doc, title, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "EBF3FB")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border highlight
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="1B559B"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    run_title = p.add_run(f"Note: {title}\n")
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(27, 85, 155)
    run_title.font.size = Pt(10)
    
    run_body = p.add_run(text)
    run_body.font.size = Pt(9.5)
    run_body.font.color.rgb = RGBColor(40, 40, 40)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_document(output_path):
    doc = Document()

    # Configure Margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Document Header / Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_sub = title_p.add_run("CARECONNECT HEALTH SYSTEMS • TECHNICAL SPECIFICATION\n")
    run_sub.font.size = Pt(10)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(27, 85, 155)

    run_title = title_p.add_run("CareConnect: Patient-Provider EHR System")
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(16, 44, 87)

    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_before = Pt(2)
    desc_p.paragraph_format.space_after = Pt(12)
    run_desc = desc_p.add_run("Complete System Architecture, Clinical Use Cases with Input/Output Specifications, and Relational Data Models (Spring Boot + Angular + Oracle DB)")
    run_desc.font.size = Pt(11)
    run_desc.font.italic = True
    run_desc.font.color.rgb = RGBColor(100, 100, 100)

    # Divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_after = Pt(12)
    run_line = p_div.add_run("―" * 58)
    run_line.font.color.rgb = RGBColor(200, 210, 220)

    # Metadata Table
    create_table_styled(doc, ["Document Parameter", "Specification Detail"], [
        ["System Name", "CareConnect: Patient-Provider Electronic Health Record (EHR)"],
        ["Target Domain", "Healthcare & Life Sciences / Ambulatory & Clinical Care"],
        ["Backend Architecture", "Java 17/21, Spring Boot 3.x, Spring Data JPA, Spring Security (JWT)"],
        ["Frontend Architecture", "Angular 17+ (TypeScript, Reactive Forms, Standalone Components, Tailwind/Material)"],
        ["Database System", "Oracle Database 19c/21c/XE (Identity Columns, Sequences, Constraints, CLOBs)"],
        ["Regulatory Context", "HIPAA Security & Privacy Rule Compliance (RBAC, Audit Logging, PHI Protection)"],
        ["Target Delivery", "4-Day Accelerated Rapid Deployment Blueprint"]
    ], col_widths=[2.2, 4.3])

    # ==========================================
    # SECTION 1: SYSTEM ARCHITECTURE
    # ==========================================
    add_heading_styled(doc, "1. System Architecture & Topology", level=1)
    
    p = doc.add_paragraph(
        "CareConnect utilizes a modular, decoupled 3-tier architecture optimized for clinical responsiveness, "
        "strict data integrity, and role-based segregation of duties. The architecture guarantees high-availability "
        "access for clinical providers while isolating patient-facing interactions in a dedicated portal layer."
    )
    p.paragraph_format.space_after = Pt(6)

    add_heading_styled(doc, "1.1 Tiered Architectural Decomposition", level=2)
    create_table_styled(doc, ["Architectural Layer", "Technology Stack", "Responsibilities & Design Patterns"], [
        ["Presentation Layer", "Angular 17+, TypeScript, RxJS, Angular Router", "Single Page Application (SPA). Provides Doctor/Nurse clinical dashboard and Patient self-service portal. Features JWT HTTP Interceptors, Route Guards, and dynamic SOAP documentation forms."],
        ["API Gateway & Security", "Spring Security 6, JJWT (Nimbus), Servlet Filter", "Stateless bearer token authentication, Cross-Origin Resource Sharing (CORS) filter, RBAC (ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT, ROLE_ADMIN), request payload validation."],
        ["Business Logic Layer", "Spring Boot 3.x, Spring Services, Spring AOP", "Enforces clinical business rules: MRN auto-generation, drug-allergy contraindication checks, CPOE order workflow state transitions, and automatic HIPAA audit logging."],
        ["Persistence Layer", "Spring Data JPA, Hibernate ORM", "Transactional service boundary management (@Transactional), optimistic locking, entity mapping, CLOB streaming for clinical narratives."],
        ["Database Tier", "Oracle DB 19c/21c / Oracle XE", "Relational persistence, ACID compliance, foreign-key relational integrity, identity columns, index structures on MRN, Patient ID, and Encounter timestamps."]
    ], col_widths=[1.5, 1.6, 3.4])

    add_heading_styled(doc, "1.2 Security & HIPAA Compliance Architecture", level=2)
    doc.add_paragraph(
        "Because EHR systems manage Protected Health Information (PHI), CareConnect implements four defensive security safeguards:"
    )
    doc.add_paragraph("1. Role-Based Access Control (RBAC): Strict segregation prevents patients from viewing other patients' charts or placing clinical orders. Nurses have documentation/vitals rights; only licensed Physicians can sign off on CPOE orders and Prescriptions.", style='List Bullet')
    doc.add_paragraph("2. Stateless JWT Session Management: Tokens are issued upon cryptographically verified authentication (BCrypt hashing with work factor 12) with a configurable expiration window (e.g., 60 minutes).", style='List Bullet')
    doc.add_paragraph("3. HIPAA Audit Trail (AOP Interceptor): Every read, create, update, or delete on PHI records triggers an asynchronous audit record recording User ID, Action, Entity, Timestamp, and Client IP.", style='List Bullet')
    doc.add_paragraph("4. Data Validation & Sanitization: Strict Bean Validation (Hibernate Validator) prevents SQL injection, XSS in clinical narrative CLOBs, and invalid dosage inputs.", style='List Bullet')

    add_callout(doc, "Clinical Workflow Guardrail", 
                "In CareConnect, all clinical activities (Vitals recording, SOAP Notes, CPOE Orders, and Prescriptions) MUST be bound to a unique Encounter record. A patient cannot receive an order or medication without an active clinical encounter context.")

    # ==========================================
    # SECTION 2: USE CASES (WITH INPUT/OUTPUT)
    # ==========================================
    add_heading_styled(doc, "2. Detailed Clinical Use Cases (Input/Output Specifications)", level=1)
    doc.add_paragraph(
        "The following use case specifications detail the actor interactions, input payloads, processing rules, "
        "and return outputs across the clinical and patient-facing modules."
    )

    use_cases = [
        {
            "id": "UC-01",
            "name": "User Authentication & Role-Based Session Initiation",
            "actor": "Doctor, Nurse, Patient, System Administrator",
            "pre": "User has an active, non-locked account in APP_USERS.",
            "inputs": "• Username (String, e.g., 'dr_smith')\n• Password (String, plaintext via HTTPS)",
            "process": "1. Spring Security intercepts request via AuthFilter.\n2. Verifies credentials against BCrypt password_hash in APP_USERS.\n3. Resolves user roles and maps associated Patient ID (if actor is Patient).\n4. Generates signed HMAC-SHA256 JWT containing username, role, and userId claims.\n5. Logs successful login in AUDIT_LOGS.",
            "outputs": "• HTTP 200 OK\n• Body: {\"token\": \"eyJhbGci...\", \"userId\": 101, \"username\": \"dr_smith\", \"role\": \"ROLE_DOCTOR\", \"fullName\": \"Dr. Sarah Smith, MD\"}",
            "post": "Client stores JWT in memory/local storage; Angular router redirects to Provider Dashboard or Patient Portal depending on role."
        },
        {
            "id": "UC-02",
            "name": "Patient Registration & Unique MRN Generation",
            "actor": "Nurse, Front Desk Staff, Administrator",
            "pre": "Staff user is authenticated with write privileges.",
            "inputs": "• firstName: 'John'\n• lastName: 'Doe'\n• dateOfBirth: '1985-04-12'\n• gender: 'MALE'\n• bloodGroup: 'O+'\n• contactPhone: '+1-555-0199'\n• allergies: 'Penicillin, Shellfish'\n• emergencyContact: 'Jane Doe (+1-555-0198)'",
            "process": "1. Validate required fields and DOB sanity.\n2. Sequence generates unique Medical Record Number (e.g., 'MRN-2026-0042').\n3. Optionally provisions patient login account linked via user_id.\n4. Persists record in PATIENTS table.\n5. Writes 'CREATE_PATIENT' entry to AUDIT_LOGS.",
            "outputs": "• HTTP 201 Created\n• Body: {\"patientId\": 501, \"mrn\": \"MRN-2026-0042\", \"fullName\": \"John Doe\", \"age\": 41, \"allergies\": \"Penicillin, Shellfish\", \"createdAt\": \"2026-09-28T10:15:00\"}",
            "post": "Patient record is indexed and immediately searchable across clinic search bars."
        },
        {
            "id": "UC-03",
            "name": "Clinical Encounter Creation & SOAP Documentation",
            "actor": "Nurse (Vitals entry), Doctor (SOAP assessment & plan)",
            "pre": "Patient is registered; encounter initiated with status 'IN_PROGRESS'.",
            "inputs": "• encounterId: 1001\n• Vitals Input:\n   - systolicBp: 135, diastolicBp: 88 (mmHg)\n   - pulseBpm: 76 (beats/min)\n   - temperatureF: 98.6 (°F)\n   - spo2Percent: 99 (%)\n   - respiratoryRate: 16 (breaths/min)\n• SOAP Clinical Notes Input:\n   - subjective: 'Patient reports persistent dry cough for 5 days.'\n   - objective: 'Bilateral breath sounds clear, throat mildly erythematous.'\n   - assessment: 'Acute upper respiratory tract infection.'\n   - plan: 'Symptomatic therapy, hydration, follow-up if fever > 101F.'",
            "process": "1. Validate encounter exists and provider is authorized.\n2. Validate vital ranges (e.g., SpO2 between 50-100%).\n3. Upsert record into CLINICAL_NOTES (linked to encounterId).\n4. Update ENCOUNTERS status to 'IN_PROGRESS' or 'COMPLETED'.\n5. Record AUDIT_LOG with action 'DOCUMENT_SOAP'.",
            "outputs": "• HTTP 200 OK / 201 Created\n• Body: {\"noteId\": 701, \"encounterId\": 1001, \"vitalsSummary\": \"BP: 135/88 | HR: 76 | Temp: 98.6°F | SpO2: 99%\", \"assessment\": \"Acute upper respiratory tract infection.\", \"updatedAt\": \"2026-09-28T10:45:00\"}",
            "post": "SOAP note becomes part of legal medical record; vitals chart reflects new data point."
        },
        {
            "id": "UC-04",
            "name": "CPOE Diagnostic Order Placement (Computerized Physician Order Entry)",
            "actor": "Doctor (Physician)",
            "pre": "Active encounter exists; patient chart open.",
            "inputs": "• encounterId: 1001\n• patientId: 501\n• orderType: 'LAB' (Options: LAB, IMAGING, PROCEDURE)\n• orderName: 'Complete Blood Count (CBC) with Differential'\n• priority: 'STAT' (Options: ROUTINE, URGENT, STAT)\n• orderNotes: 'Rule out leukocytosis; patient febrile.'",
            "process": "1. Verify provider role equals 'ROLE_DOCTOR'.\n2. Insert record into CPOE_ORDERS with status 'PENDING'.\n3. If priority is 'STAT', flag notification queue for immediate lab triage.\n4. Log order generation in AUDIT_LOGS.",
            "outputs": "• HTTP 201 Created\n• Body: {\"orderId\": 3001, \"orderName\": \"Complete Blood Count (CBC)\", \"orderType\": \"LAB\", \"priority\": \"STAT\", \"status\": \"PENDING\", \"orderedAt\": \"2026-09-28T11:00:00\"}",
            "post": "Order appears on clinical worklist and Lab Dashboard awaiting specimen processing."
        },
        {
            "id": "UC-05",
            "name": "CPOE Order Result Entry & Fulfillment",
            "actor": "Lab Technician, Nurse, Doctor",
            "pre": "Order exists in 'PENDING' or 'IN_PROGRESS' status.",
            "inputs": "• orderId: 3001\n• status: 'COMPLETED'\n• resultValue: 'WBC: 11.2 K/uL (Normal: 4.5-11.0) [Mild elevation], RBC: 4.8 M/uL, Hemoglobin: 14.5 g/dL, Platelets: 250 K/uL. Impression: Mild leukocytosis.'\n• completedNotes: 'Specimen collected at 11:15 AM, processed without hemolysis.'",
            "process": "1. Verify order ID existence.\n2. Update status to 'COMPLETED' and set completed_at timestamp.\n3. Store structured narrative in result_value CLOB.\n4. Write 'FULFILL_ORDER' to AUDIT_LOGS.",
            "outputs": "• HTTP 200 OK\n• Body: {\"orderId\": 3001, \"status\": \"COMPLETED\", \"completedAt\": \"2026-09-28T11:45:00\", \"resultAvailable\": true}",
            "post": "Result is instantly visible in the Doctor's Encounter View and the Patient Portal."
        },
        {
            "id": "UC-06",
            "name": "Medication Management & e-Prescribing with Allergy Cross-Check",
            "actor": "Doctor (Physician)",
            "pre": "Active encounter exists; patient's allergies are retrieved.",
            "inputs": "• encounterId: 1001\n• patientId: 501\n• drugName: 'Amoxicillin 500mg'\n• dosage: '500 mg'\n• frequency: 'Every 8 hours (TID)'\n• route: 'ORAL'\n• durationDays: 7\n• instructions: 'Take with food and full glass of water.'",
            "process": "1. Fetch patient's recorded allergies from PATIENTS table (e.g. 'Penicillin, Shellfish').\n2. Run Clinical Decision Support (CDS) cross-check algorithm: Compare 'Amoxicillin' against known Penicillin-class cross-reactivity.\n3. If conflict detected:\n   - Return warning flag: 'CRITICAL ALLERGY ALERT: Patient has recorded allergy to Penicillin. Amoxicillin is a beta-lactam penicillin.'\n   - Require provider explicit override acknowledgement or cancellation.\n4. If clear or override approved: Insert record into PRESCRIPTIONS with status 'ACTIVE'.\n5. Log prescription issuance and any override in AUDIT_LOGS.",
            "outputs": "• HTTP 201 Created (or HTTP 409 Conflict if unacknowledged allergy)\n• Body: {\"prescriptionId\": 8001, \"drugName\": \"Amoxicillin 500mg\", \"status\": \"ACTIVE\", \"allergyAlert\": {\"warning\": true, \"allergenMatch\": \"Penicillin\", \"overridden\": true}, \"prescribedAt\": \"2026-09-28T11:05:00\"}",
            "post": "Medication appears on active medication list and synchronizes with Patient Portal."
        },
        {
            "id": "UC-07",
            "name": "Patient Portal - Unified Health Record Access",
            "actor": "Patient",
            "pre": "Patient is logged into portal with ROLE_PATIENT; JWT identifies user's patientId.",
            "inputs": "• HTTP GET /api/v1/portal/dashboard (Bearer JWT in Authorization Header)",
            "process": "1. Extract authenticated user ID from JWT SecurityContext.\n2. Query PATIENTS table where user_id = authenticated userId.\n3. Concurrently retrieve:\n   - Demographic profile & blood group\n   - Current active medications (status = 'ACTIVE')\n   - Recent diagnostic test results (status = 'COMPLETED')\n   - Encounter history with physician summaries\n4. Assemble into PatientHealthRecordDTO.\n5. Log 'VIEW_PORTAL_RECORD' in AUDIT_LOGS.",
            "outputs": "• HTTP 200 OK\n• Body: {\"patient\": {\"mrn\": \"MRN-2026-0042\", \"name\": \"John Doe\"}, \"activeMedications\": [{\"drug\": \"Amoxicillin\", \"dosage\": \"500mg\", \"frequency\": \"TID\"}], \"labResults\": [{\"test\": \"Complete Blood Count\", \"result\": \"Mild leukocytosis\", \"date\": \"2026-09-28\"}], \"encounters\": [{\"date\": \"2026-09-28\", \"provider\": \"Dr. Sarah Smith\", \"reason\": \"Cough and fever\"}]}",
            "post": "Angular Patient Portal renders responsive patient health dashboard."
        },
        {
            "id": "UC-08",
            "name": "HIPAA Audit Trail Querying & Verification",
            "actor": "System Administrator, Compliance Officer",
            "pre": "Authenticated user holds ROLE_ADMIN.",
            "inputs": "• startDate: '2026-09-28T00:00:00'\n• endDate: '2026-09-28T23:59:59'\n• targetEntity: 'PATIENT' (Optional filter)\n• entityId: 501 (Optional filter)",
            "process": "1. Verify administrator credentials.\n2. Query AUDIT_LOGS table with pagination.\n3. Return chronological sequence of security events.",
            "outputs": "• HTTP 200 OK\n• Body: [{\"logId\": 9001, \"username\": \"dr_smith\", \"action\": \"VIEW_RECORD\", \"entity\": \"PATIENT\", \"entityId\": 501, \"timestamp\": \"2026-09-28T10:18:22\"}]",
            "post": "Provides non-repudiable audit evidence for regulatory inspection."
        }
    ]

    for uc in use_cases:
        add_heading_styled(doc, f"{uc['id']}: {uc['name']}", level=2)
        uc_data = [
            ["Primary Actor", uc["actor"]],
            ["Preconditions", uc["pre"]],
            ["Input Parameters & Data", uc["inputs"]],
            ["System Processing Logic", uc["process"]],
            ["Output Data & Responses", uc["outputs"]],
            ["Postconditions", uc["post"]]
        ]
        create_table_styled(doc, ["Lifecycle Step", "Specification Description"], uc_data, col_widths=[1.8, 4.7])

    # ==========================================
    # SECTION 3: DATA MODELS & SCHEMA SPECIFICATION
    # ==========================================
    add_heading_styled(doc, "3. Relational Data Models & Oracle DB Specifications", level=1)
    doc.add_paragraph(
        "CareConnect utilizes Oracle Database relational schema structures designed with 3rd Normal Form (3NF) principles. "
        "Each table features primary keys generated via Oracle identity mechanisms, foreign-key cascade controls, "
        "and audit timestamps."
    )

    models = [
        {
            "name": "APP_USERS (User Identity & Role-Based Access)",
            "cols": [
                ["user_id", "NUMBER(19)", "PK, IDENTITY", "Unique surrogate key for system user"],
                ["username", "VARCHAR2(50)", "UNIQUE, NOT NULL", "Login handle (e.g., 'dr_smith')"],
                ["password_hash", "VARCHAR2(255)", "NOT NULL", "BCrypt hashed credential (cost 12)"],
                ["role", "VARCHAR2(20)", "NOT NULL", "Check: ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT"],
                ["full_name", "VARCHAR2(100)", "NOT NULL", "Provider or user display title (e.g. 'Dr. Sarah Smith')"],
                ["email", "VARCHAR2(100)", "UNIQUE, NOT NULL", "Official notification and correspondence email"],
                ["created_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "System account creation timestamp"]
            ]
        },
        {
            "name": "PATIENTS (Master Patient Index / Demographics)",
            "cols": [
                ["patient_id", "NUMBER(19)", "PK, IDENTITY", "Internal primary surrogate key"],
                ["user_id", "NUMBER(19)", "FK, UNIQUE, NULLABLE", "References APP_USERS(user_id) for portal login"],
                ["mrn", "VARCHAR2(30)", "UNIQUE, NOT NULL", "Medical Record Number (e.g., 'MRN-2026-0001')"],
                ["first_name", "VARCHAR2(50)", "NOT NULL", "Patient given name"],
                ["last_name", "VARCHAR2(50)", "NOT NULL", "Patient family name"],
                ["date_of_birth", "DATE", "NOT NULL", "Birth date for age and pediatric/geriatric dosing"],
                ["gender", "VARCHAR2(10)", "CHECK (MALE, FEMALE, OTHER)", "Administrative sex"],
                ["blood_group", "VARCHAR2(5)", "NULLABLE", "Blood type (e.g., 'O+', 'A-', 'AB+')"],
                ["contact_phone", "VARCHAR2(20)", "NULLABLE", "Primary contact telephone"],
                ["allergies", "VARCHAR2(500)", "NULLABLE", "Comma-separated known allergens for CDS check"],
                ["emergency_contact", "VARCHAR2(150)", "NULLABLE", "Next of kin name and telephone"],
                ["created_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Registration timestamp"]
            ]
        },
        {
            "name": "ENCOUNTERS (Clinical Visits & Sessions)",
            "cols": [
                ["encounter_id", "NUMBER(19)", "PK, IDENTITY", "Unique clinical encounter identifier"],
                ["patient_id", "NUMBER(19)", "FK, NOT NULL", "References PATIENTS(patient_id)"],
                ["provider_id", "NUMBER(19)", "FK, NOT NULL", "References APP_USERS(user_id) (Attending clinician)"],
                ["encounter_date", "TIMESTAMP", "NOT NULL", "Session scheduled/actual commencement time"],
                ["encounter_type", "VARCHAR2(30)", "DEFAULT 'OUTPATIENT'", "OUTPATIENT, EMERGENCY, INPATIENT, TELEHEALTH"],
                ["status", "VARCHAR2(20)", "CHECK", "SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"],
                ["reason_for_visit", "VARCHAR2(255)", "NULLABLE", "Chief complaint reported during check-in"]
            ]
        },
        {
            "name": "CLINICAL_NOTES (SOAP Documentation & Vital Signs)",
            "cols": [
                ["note_id", "NUMBER(19)", "PK, IDENTITY", "Primary note record key"],
                ["encounter_id", "NUMBER(19)", "FK, UNIQUE, NOT NULL", "1-to-1 relationship with ENCOUNTERS(encounter_id)"],
                ["systolic_bp", "NUMBER(3)", "CHECK (40-300)", "Systolic arterial pressure in mmHg"],
                ["diastolic_bp", "NUMBER(3)", "CHECK (20-200)", "Diastolic arterial pressure in mmHg"],
                ["pulse_bpm", "NUMBER(3)", "CHECK (30-250)", "Heart rate in beats per minute"],
                ["respiratory_rate", "NUMBER(3)", "CHECK (5-60)", "Respiration breaths per minute"],
                ["temperature_f", "NUMBER(4,1)", "CHECK (90.0-110.0)", "Body temperature in Fahrenheit"],
                ["spo2_percent", "NUMBER(3)", "CHECK (50-100)", "Blood oxygen saturation percentage"],
                ["subjective", "CLOB", "NULLABLE", "Patient's subjective symptomatic narrative"],
                ["objective", "CLOB", "NULLABLE", "Physical examination and clinical observations"],
                ["assessment", "CLOB", "NULLABLE", "Physician clinical assessment & working diagnosis"],
                ["plan", "CLOB", "NULLABLE", "Diagnostic, therapeutic, and follow-up plan"],
                ["updated_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Last modification timestamp"]
            ]
        },
        {
            "name": "CPOE_ORDERS (Diagnostic & Procedure Orders)",
            "cols": [
                ["order_id", "NUMBER(19)", "PK, IDENTITY", "Unique diagnostic order identifier"],
                ["encounter_id", "NUMBER(19)", "FK, NOT NULL", "References ENCOUNTERS(encounter_id)"],
                ["patient_id", "NUMBER(19)", "FK, NOT NULL", "References PATIENTS(patient_id)"],
                ["ordered_by", "NUMBER(19)", "FK, NOT NULL", "References APP_USERS(user_id) (Physician)"],
                ["order_type", "VARCHAR2(20)", "CHECK", "LAB, IMAGING, PROCEDURE"],
                ["order_name", "VARCHAR2(150)", "NOT NULL", "Clinical test nomenclature (e.g. 'Chest X-Ray')"],
                ["priority", "VARCHAR2(15)", "CHECK", "ROUTINE, URGENT, STAT"],
                ["status", "VARCHAR2(20)", "CHECK", "PENDING, IN_PROGRESS, COMPLETED, CANCELLED"],
                ["order_notes", "VARCHAR2(500)", "NULLABLE", "Special handling or clinical indication notes"],
                ["result_value", "CLOB", "NULLABLE", "Fulfillment narrative or quantitative result"],
                ["ordered_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Order placement timestamp"],
                ["completed_at", "TIMESTAMP", "NULLABLE", "Fulfillment sign-off timestamp"]
            ]
        },
        {
            "name": "PRESCRIPTIONS (Medication Management)",
            "cols": [
                ["prescription_id", "NUMBER(19)", "PK, IDENTITY", "Unique prescription identifier"],
                ["encounter_id", "NUMBER(19)", "FK, NOT NULL", "References ENCOUNTERS(encounter_id)"],
                ["patient_id", "NUMBER(19)", "FK, NOT NULL", "References PATIENTS(patient_id)"],
                ["prescribed_by", "NUMBER(19)", "FK, NOT NULL", "References APP_USERS(user_id)"],
                ["drug_name", "VARCHAR2(100)", "NOT NULL", "Generic or brand pharmaceutical name"],
                ["dosage", "VARCHAR2(50)", "NOT NULL", "Strength unit (e.g., '10 mg', '500 mg')"],
                ["frequency", "VARCHAR2(50)", "NOT NULL", "Administration schedule (e.g., 'Once daily', 'BID')"],
                ["route", "VARCHAR2(30)", "DEFAULT 'ORAL'", "ORAL, INTRAVENOUS, INTRAMUSCULAR, TOPICAL"],
                ["duration_days", "NUMBER(3)", "NULLABLE", "Therapy duration in integer days"],
                ["instructions", "VARCHAR2(300)", "NULLABLE", "Special administration guidance (e.g. 'Take with food')"],
                ["status", "VARCHAR2(20)", "CHECK", "ACTIVE, COMPLETED, DISCONTINUED"],
                ["prescribed_at", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "Prescription issue timestamp"]
            ]
        },
        {
            "name": "AUDIT_LOGS (HIPAA Compliance & Activity Trail)",
            "cols": [
                ["log_id", "NUMBER(19)", "PK, IDENTITY", "Immutable audit log event index"],
                ["user_id", "NUMBER(19)", "FK, NULLABLE", "References APP_USERS(user_id)"],
                ["action", "VARCHAR2(50)", "NOT NULL", "Event action (VIEW_RECORD, CREATE_ORDER, etc.)"],
                ["target_entity", "VARCHAR2(50)", "NOT NULL", "PATIENT, CLINICAL_NOTE, CPOE_ORDER, PRESCRIPTION"],
                ["entity_id", "NUMBER(19)", "NOT NULL", "Target entity record primary key"],
                ["details", "VARCHAR2(500)", "NULLABLE", "Contextual metadata or client network details"],
                ["timestamp", "TIMESTAMP", "DEFAULT CURRENT_TIMESTAMP", "High-precision immutable event timestamp"]
            ]
        }
    ]

    for model in models:
        add_heading_styled(doc, f"Table: {model['name']}", level=2)
        create_table_styled(doc, ["Column Name", "Oracle Datatype", "Constraint", "Description & Clinical Purpose"], 
                            model["cols"], col_widths=[1.5, 1.4, 1.6, 2.0])

    # ==========================================
    # SECTION 4: DATA TRANSFER OBJECTS (DTOs)
    # ==========================================
    add_heading_styled(doc, "4. REST API Data Transfer Objects (DTOs)", level=1)
    doc.add_paragraph(
        "To decouple internal database schemas from external web consumers and maintain encapsulation, "
        "CareConnect utilizes strict Spring Boot Java Record / POJO Data Transfer Objects:"
    )

    dtos = [
        ["AuthRequestDTO", "username: String\npassword: String", "Incoming login credentials payload."],
        ["AuthResponseDTO", "token: String\nuserId: Long\nusername: String\nrole: String\nfullName: String\npatientId: Long?", "JWT bearer token and authenticated user metadata."],
        ["PatientDTO", "patientId: Long?\nmrn: String?\nfirstName: String\nlastName: String\ndateOfBirth: LocalDate\ngender: String\nbloodGroup: String\nallergies: String\ncontactPhone: String", "Bidirectional patient demographic registration and retrieval."],
        ["EncounterCreateDTO", "patientId: Long\nencounterType: String\nreasonForVisit: String", "Payload to initiate a new patient visit."],
        ["SoapNoteDTO", "encounterId: Long\nvitals: VitalsDTO\nsubjective: String\nobjective: String\nassessment: String\nplan: String", "Combined vitals measurements and SOAP narrative note."],
        ["VitalsDTO", "systolicBp: Integer\ndiastolicBp: Integer\npulseBpm: Integer\ntemperatureF: Double\nspo2Percent: Integer\nrespiratoryRate: Integer", "Physiological vital measurements captured during triage."],
        ["CpoeOrderDTO", "orderId: Long?\nencounterId: Long\npatientId: Long\norderType: String\norderName: String\npriority: String\nstatus: String\norderNotes: String\nresultValue: String?", "Diagnostic and procedure order requisition and result fulfillment."],
        ["PrescriptionDTO", "prescriptionId: Long?\nencounterId: Long\npatientId: Long\ndrugName: String\ndosage: String\nfrequency: String\nroute: String\ndurationDays: Integer\ninstructions: String\nstatus: String", "e-Prescribing payload with dosage and duration parameters."],
        ["PatientPortalSummaryDTO", "patient: PatientDTO\nactiveMedications: List<PrescriptionDTO>\nrecentOrders: List<CpoeOrderDTO>\nencounters: List<EncounterSummaryDTO>", "Consolidated dashboard payload for logged-in patient self-service."]
    ]
    create_table_styled(doc, ["DTO Structure Name", "Key Fields & Types", "Functional Context"], dtos, col_widths=[1.8, 2.5, 2.2])

    # Save Document
    doc.save(output_path)
    print(f"Document successfully created at {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "CareConnect_EHR_Architecture_and_Use_Cases.docx"
    build_document(out)
