import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    c_navy = RGBColor(15, 23, 42)      # #0F172A
    c_blue = RGBColor(37, 99, 235)     # #2563EB
    c_emerald = RGBColor(5, 150, 105)  # #059669
    c_slate_bg = RGBColor(248, 250, 252) # #F8FAFC
    c_card_bg = RGBColor(255, 255, 255)
    c_border = RGBColor(226, 232, 240) # #E2E8F0
    c_text_dark = RGBColor(30, 41, 59) # #1E293B
    c_text_muted = RGBColor(100, 116, 139) # #64748B
    c_white = RGBColor(255, 255, 255)
    c_rose = RGBColor(225, 29, 72)     # #E11D48

    def add_bg(slide, color=c_slate_bg):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text):
        # Tag
        tx_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.35))
        tf_tag = tx_tag.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = c_blue

        # Title
        tx_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.6))
        tf_title = tx_title.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = c_navy

        # Subtitle
        if subtitle_text:
            tx_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.5), Inches(0.4))
            tf_sub = tx_sub.text_frame
            tf_sub.word_wrap = True
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = c_text_muted

    def add_card(slide, left, top, width, height, title, body_lines, accent_color=c_blue):
        # Card container
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = c_card_bg
        card.line.color.rgb = c_border
        card.line.width = Pt(1)

        # Top accent bar
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left + 0.15), Inches(top + 0.15), Inches(width - 0.3), Inches(0.06))
        bar.fill.solid()
        bar.fill.fore_color.rgb = accent_color
        bar.line.fill.background()

        # Text Frame
        tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.3), Inches(width - 0.4), Inches(height - 0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = c_navy
        p_t.space_after = Pt(8)

        for line in body_lines:
            p_b = tf.add_paragraph()
            p_b.text = line
            p_b.font.size = Pt(11)
            p_b.font.color.rgb = c_text_dark
            p_b.space_after = Pt(4)

    # ==========================================
    # SLIDE 1: Title Slide (Dark Hero)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1, c_navy)

    # Accent pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(3.2), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(30, 58, 138)
    pill.line.fill.background()
    p_pill = pill.text_frame.paragraphs[0]
    p_pill.text = "HEALTHCARE INFORMATION SYSTEM"
    p_pill.font.size = Pt(10)
    p_pill.font.bold = True
    p_pill.font.color.rgb = RGBColor(147, 197, 253)
    p_pill.alignment = PP_ALIGN.CENTER

    # Main Title
    tx = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(1.4))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CareConnect: Patient-Provider EHR"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = c_white

    # Tagline
    tx2 = s1.shapes.add_textbox(Inches(0.8), Inches(3.2), Inches(11.5), Inches(0.8))
    tf2 = tx2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "Enterprise-Grade Electronic Health Record & Patient Portal with Real-Time Clinical Safety, Schedule Collision Prevention, and HIPAA Audit Governance"
    p2.font.size = Pt(15)
    p2.font.color.rgb = RGBColor(203, 213, 225)

    # 3 Meta Badges (Live URL, Tech Stack, Status)
    b1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.5), Inches(3.6), Inches(1.8))
    b1.fill.solid()
    b1.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b1.line.color.rgb = RGBColor(51, 65, 85)
    tf_b1 = b1.text_frame
    tf_b1.word_wrap = True
    p_b1_1 = tf_b1.paragraphs[0]
    p_b1_1.text = "LIVE CLOUD DEPLOYMENTS"
    p_b1_1.font.size = Pt(10)
    p_b1_1.font.bold = True
    p_b1_1.font.color.rgb = RGBColor(56, 189, 248)
    p_b1_2 = tf_b1.add_paragraph()
    p_b1_2.text = "• Web: careconnect-ehr.vercel.app\n• API: careconnect-backend-uim9.onrender.com\n• Swagger: /swagger-ui.html"
    p_b1_2.font.size = Pt(10)
    p_b1_2.font.color.rgb = c_white

    b2 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), Inches(4.5), Inches(3.6), Inches(1.8))
    b2.fill.solid()
    b2.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b2.line.color.rgb = RGBColor(51, 65, 85)
    tf_b2 = b2.text_frame
    tf_b2.word_wrap = True
    p_b2_1 = tf_b2.paragraphs[0]
    p_b2_1.text = "ENTERPRISE TECH STACK"
    p_b2_1.font.size = Pt(10)
    p_b2_1.font.bold = True
    p_b2_1.font.color.rgb = RGBColor(52, 211, 153)
    p_b2_2 = tf_b2.add_paragraph()
    p_b2_2.text = "• React 19 + Vite 6 + Tailwind CSS\n• Spring Boot 3.3.4 + Java 17+\n• Oracle 19c/21c Relational Schema\n• Docker Multi-Stage Packaging"
    p_b2_2.font.size = Pt(10)
    p_b2_2.font.color.rgb = c_white

    b3 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.8), Inches(4.5), Inches(3.7), Inches(1.8))
    b3.fill.solid()
    b3.fill.fore_color.rgb = RGBColor(30, 41, 59)
    b3.line.color.rgb = RGBColor(51, 65, 85)
    tf_b3 = b3.text_frame
    tf_b3.word_wrap = True
    p_b3_1 = tf_b3.paragraphs[0]
    p_b3_1.text = "SECURITY & COMPLIANCE"
    p_b3_1.font.size = Pt(10)
    p_b3_1.font.bold = True
    p_b3_1.font.color.rgb = RGBColor(251, 191, 36)
    p_b3_2 = tf_b3.add_paragraph()
    p_b3_2.text = "• HIPAA Security Rule Alignment\n• Role-Based Access Control (RBAC)\n• Immutable Audit Trail Logging\n• GitHub: faizan0264/careconnect-ehr"
    p_b3_2.font.size = Pt(10)
    p_b3_2.font.color.rgb = c_white

    # ==========================================
    # SLIDE 2: Problem Statement & Motivation
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "Clinical Need & Background", "The Problem: Fragmented Healthcare Systems", "Preventable medical errors and communication breakdowns cost thousands of lives every year.")

    add_card(s2, 0.8, 1.9, 3.6, 4.8, "1. Medical Errors & Fatalities", [
        "• Preventable adverse drug events (ADEs) cause over 250,000 deaths annually.",
        "• Physicians frequently lack immediate real-time allergy cross-checks at the moment of e-prescribing.",
        "• Critical contraindications (e.g. Penicillin allergies) are missed across siloed records."
    ], c_rose)

    add_card(s2, 4.8, 1.9, 3.6, 4.8, "2. Patient Disempowerment", [
        "• Patients lack access to their longitudinal health summaries, lab results, and visit plans.",
        "• Inability to securely upload outside radiology scans or prior hospital records.",
        "• Friction in medication refill requests leads to poor treatment adherence."
    ], c_blue)

    add_card(s2, 8.8, 1.9, 3.7, 4.8, "3. Scheduling Chaos & Collisions", [
        "• Double-booked appointments cause severe clinic delays and physician burnout.",
        "• Traditional web forms fail to check doctor availability before booking.",
        "• Absence of immutable HIPAA audit trails creates severe compliance vulnerabilities."
    ], c_emerald)

    # ==========================================
    # SLIDE 3: The CareConnect Solution
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "System Overview", "The CareConnect Solution: 3 Unified Portals", "Bridging patients, healthcare providers, and hospital governance within a single secure ecosystem.")

    add_card(s3, 0.8, 1.9, 3.6, 4.8, "Doctor Workstation", [
        "• Active clinic appointment queue.",
        "• Complete SOAP clinical documentation (Subjective, Objective, Assessment, Plan).",
        "• Real-time vital signs tracking & history.",
        "• Computerized Physician Order Entry (CPOE).",
        "• e-Prescribing with Allergy Safety Engine.",
        "• Diagnostic report & imaging review."
    ], c_blue)

    add_card(s3, 4.8, 1.9, 3.6, 4.8, "Patient Portal", [
        "• Longitudinal health summary & vitals.",
        "• Digital After-Visit Summary (AVS) + print.",
        "• Conflict-free appointment booking with real-time schedule busy-slot detection.",
        "• One-click prescription refill requests.",
        "• Medical report & lab scan vault upload.",
        "• Verified patient self-registration."
    ], c_emerald)

    add_card(s3, 8.8, 1.9, 3.7, 4.8, "Admin & Governance", [
        "• Comprehensive hospital statistics & census.",
        "• User provisioning (add doctors/nurses).",
        "• Inactive staff account removal.",
        "• System-wide credential management.",
        "• Immutable HIPAA security audit trail.",
        "• Real-time IP and timestamp logging."
    ], RGBColor(147, 51, 234))

    # ==========================================
    # SLIDE 4: Full-Stack Architecture
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "Engineering Design", "Multi-Tier Enterprise Architecture", "High performance, zero-dependency resilience, and separation of concerns.")

    add_card(s4, 0.8, 1.9, 2.7, 4.8, "Client Tier (React 19)", [
        "• React 19 + Vite 6",
        "• Tailwind CSS styling",
        "• Lucide React icon suite",
        "• Centralized EhrContext",
        "• HTML5 FileReader (Base64)",
        "• LocalStorage dual-sync",
        "• Vercel Edge CDN deploy"
    ], c_blue)

    add_card(s4, 3.8, 1.9, 2.8, 4.8, "API Tier (Spring Boot 3)", [
        "• Spring Boot 3.3.4 (Java 17+)",
        "• Spring MVC REST Controllers",
        "• Spring Data JPA Repositories",
        "• Hibernate 6 ORM engine",
        "• Jakarta input validation",
        "• OpenAPI 3.0 / Swagger UI",
        "• Render Docker Container"
    ], c_emerald)

    add_card(s4, 6.9, 1.9, 2.8, 4.8, "Data Tier (Oracle DDL)", [
        "• Oracle 19c/21c Schema",
        "• 8 relational tables",
        "• Cascading Foreign Keys",
        "• Check & Unique constraints",
        "• Performance B-Tree indexes",
        "• CLOB encrypted storage",
        "• H2 in-memory local dev"
    ], c_navy)

    add_card(s4, 10.0, 1.9, 2.5, 4.8, "DevOps Tier", [
        "• Git Monorepo (main)",
        "• Multi-stage Dockerfiles",
        "• Docker Compose setup",
        "• Nginx SPA routing",
        "• Vercel automated CD",
        "• Render cloud builds"
    ], RGBColor(217, 119, 6))

    # ==========================================
    # SLIDE 5: Oracle Database Schema (ERD)
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "Relational Data Modeling", "Oracle Database 19c/21c Schema Architecture", "Strict relational integrity, cascading constraints, and optimized index access paths.")

    add_card(s5, 0.8, 1.9, 5.6, 2.3, "Primary Entities", [
        "• USERS: USER_ID, USERNAME, PASSWORD_HASH, ROLE, FULL_NAME, EMAIL, DEPARTMENT",
        "• PATIENTS: PATIENT_ID, MRN (Unique), FIRST_NAME, LAST_NAME, DOB, ALLERGIES, BLOOD_GROUP",
        "• APPOINTMENTS: APPT_ID, PATIENT_ID (FK), DOCTOR_ID (FK), APPT_DATE, TIME_SLOT, STATUS"
    ], c_blue)

    add_card(s5, 6.8, 1.9, 5.7, 2.3, "Clinical & Diagnostic Entities", [
        "• ENCOUNTERS: ENCOUNTER_ID, PATIENT_ID (FK), DOCTOR_NAME, VITALS, SOAP_ASSESSMENT, PLAN",
        "• DIAGNOSTIC_ORDERS: ORDER_ID, PATIENT_ID (FK), ORDER_NAME, ORDER_TYPE, PRIORITY, RESULT",
        "• PRESCRIPTIONS: RX_ID, PATIENT_ID (FK), DRUG_NAME, DOSAGE, FREQUENCY, OVERRIDE_REASON"
    ], c_emerald)

    add_card(s5, 0.8, 4.5, 5.6, 2.2, "Medical Report Vault Entity", [
        "• MEDICAL_REPORTS: REPORT_ID, PATIENT_ID (FK), TITLE, REPORT_TYPE, FILE_NAME, FILE_SIZE, FILE_DATA (CLOB), NOTES, UPLOADED_BY, UPLOADER_ROLE, REPORT_DATE, UPLOADED_AT"
    ], RGBColor(147, 51, 234))

    add_card(s5, 6.8, 4.5, 5.7, 2.2, "Security & Governance Entity", [
        "• AUDIT_LOGS: LOG_ID, USER_NAME, ACTION (VIEW, ORDER, UPLOAD, DELETE), DETAILS, IP_ADDRESS, TIMESTAMP",
        "• Performance B-Tree Indexes: IDX_PATIENTS_MRN, IDX_APPT_DOC_DATE, IDX_REPORTS_PATIENT"
    ], c_navy)

    # ==========================================
    # SLIDE 6: Doctor Clinical Workstation
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "Clinical Workflow", "Doctor Clinical Workstation & SOAP Documentation", "Streamlining physician documentation and reducing administrative burden.")

    add_card(s6, 0.8, 1.9, 3.6, 4.8, "Clinic Queue & Chart", [
        "• Pinned patient banner showing active patient demographics, MRN, room, and status.",
        "• Visual Allergy Alert banner (e.g. Penicillin & NSAIDs) permanently visible in chart.",
        "• Clinic appointment queue with direct 'Open Chart' navigation."
    ], c_blue)

    add_card(s6, 4.8, 1.9, 3.6, 4.8, "Vitals Tracking", [
        "• Real-time vitals recording with standard unit metrics:",
        "  - Blood Pressure (Systolic/Diastolic)",
        "  - Heart Rate (BPM)",
        "  - Respiratory Rate (breaths/min)",
        "  - Body Temperature (°F)",
        "  - Oxygen Saturation (SpO2 %)"
    ], c_emerald)

    add_card(s6, 8.8, 1.9, 3.7, 4.8, "Full SOAP Notes", [
        "• Subjective: Patient chief complaint and history of present illness.",
        "• Objective: Physical examination findings and diagnostic observations.",
        "• Assessment: Primary diagnosis and differential clinical considerations.",
        "• Plan: Pharmacotherapy, orders, and follow-up consultation schedule."
    ], c_navy)

    # ==========================================
    # SLIDE 7: Clinical Safety & Allergy Engine
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, "Patient Safety", "e-Prescribing & Real-Time Allergy Safety Engine", "Preventing fatal adverse drug events at the point of care.")

    add_card(s7, 0.8, 1.9, 5.6, 4.8, "Allergy Contraindication Interception", [
        "1. Active Cross-Referencing: The moment an e-prescription is submitted, the engine scans the patient's documented allergy list.",
        "2. Interception: Prescribing 'Amoxicillin' or 'Penicillin' to a Penicillin-allergic patient triggers an immediate high-priority safety modal.",
        "3. Critical Safety Alert Modal:",
        "   - Highlights the exact allergen conflict in high-visibility rose warning styling.",
        "   - Blocks unauthorized order dispatch to the pharmacy.",
        "   - Mandates physician clinical justification override."
    ], c_rose)

    add_card(s7, 6.8, 1.9, 5.7, 4.8, "Clinical Override & Accountability", [
        "• Formal Clinical Justification:",
        "  - 'Clinical benefit outweighs risk with close monitoring'",
        "  - 'No effective therapeutic alternative available'",
        "• Legal Acknowledgment: Physician must check the signed confirmation checkbox.",
        "• HIPAA Audit Logging: Every override event is permanently written to the audit log with physician identity, drug name, and timestamp.",
        "• CPOE Integration: Seamless ordering of STAT Laboratory and Radiology tests alongside prescriptions."
    ], c_blue)

    # ==========================================
    # SLIDE 8: Conflict-Free Appointment Scheduling
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, "Patient Experience", "Patient Portal & Schedule Collision Prevention", "Eliminating double-booking and providing complete transparency.")

    add_card(s8, 0.8, 1.9, 5.6, 4.8, "Schedule Collision Detection", [
        "• Problem: Traditional healthcare portals allow simultaneous bookings on the same physician slot, leading to double-booked clinic bottlenecks.",
        "• CareConnect Solution:",
        "  - Real-time slot occupancy check cross-referencing physician ID and appointment date.",
        "  - Visual busy indicators on time slots (e.g. 10:30 AM marked 'Busy ●' with rose highlight).",
        "  - Automatic button disabling and active conflict alert message preventing submission."
    ], c_blue)

    add_card(s8, 6.8, 1.9, 5.7, 4.8, "Patient Self-Service Features", [
        "• After-Visit Summary (AVS): Direct access to doctor's diagnosis, treatment instructions, and 1-click physical printout.",
        "• Prescription Refill Requests: Submit 1-click refill approval requests to clinical pharmacy with live status tracking.",
        "• Diagnostic Results: Immediate access to fulfilled laboratory and radiology report findings.",
        "• Self-Registration: Secure patient onboarding generating unique MRNs automatically."
    ], c_emerald)

    # ==========================================
    # SLIDE 9: Medical Report & Scan Vault
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_header(s9, "Diagnostic Document Vault", "Dual-Access Medical Report & Scan Vault", "Unified document exchange for doctors and patients with zero external cloud dependencies.")

    add_card(s9, 0.8, 1.9, 3.6, 4.8, "Dual-Access Uploads", [
        "• Patient Uploads: Outside clinic records, external lab panels, past discharge summaries.",
        "• Doctor Uploads: Official hospital radiology scans, pathology impressions, verified panels.",
        "• Clear Attribution: Badges reflect 'Physician File' vs 'Patient Record' automatically."
    ], c_blue)

    add_card(s9, 4.8, 1.9, 3.6, 4.8, "Drag-and-Drop Ingestion", [
        "• Drag-and-drop dropzone supporting files up to 15 MB.",
        "• Asynchronous Base64 conversion via HTML5 FileReader.",
        "• Automatic categorization based on extension (PDF, JPG, PNG).",
        "• Clinical notes and observation tagging."
    ], c_emerald)

    add_card(s9, 8.8, 1.9, 3.7, 4.8, "Inspection & Download", [
        "• In-browser scan preview without external software.",
        "• Category filtering (Radiology, Lab, Pathology, Prescriptions).",
        "• One-click document downloading.",
        "• HIPAA audit tracking for every document upload and deletion."
    ], RGBColor(147, 51, 234))

    # ==========================================
    # SLIDE 10: Security & HIPAA Governance
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_header(s10, "Compliance & Security", "HIPAA Security Rule & Audit Trail Governance", "45 CFR § 164.312 Technical Safeguards compliance.")

    add_card(s10, 0.8, 1.9, 5.6, 4.8, "Technical Safeguards Implementation", [
        "• Access Control (RBAC): Strict boundaries between ROLE_DOCTOR, ROLE_PATIENT, and ROLE_ADMIN.",
        "• Zero-Phantom-Login Enforcement: Only verified database credentials permit portal entry.",
        "• Credential Self-Service: All users can safely update usernames and passwords via Account Settings.",
        "• Admin Authority: Only administrators can provision physicians or delete user accounts."
    ], c_navy)

    add_card(s10, 6.8, 1.9, 5.7, 4.8, "Immutable Audit Trail Engine", [
        "• Captures every security and clinical event:",
        "  - VIEW_RECORD (Chart access tracking)",
        "  - CREATE_ORDER (CPOE and lab requests)",
        "  - DOCUMENT_UPLOADED (Report vault additions)",
        "  - DOCUMENT_DELETED (Chart document removals)",
        "  - APPOINTMENT_SCHEDULED (Booking events)",
        "• Logs user identity, assigned role, client IP address, and exact ISO timestamp."
    ], c_emerald)

    # ==========================================
    # SLIDE 11: Live Cloud Deployment
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "Cloud Architecture", "Live Multi-Cloud Deployment & Verification", "Global reach, edge CDN caching, and automated container deployment.")

    add_card(s11, 0.8, 1.9, 5.6, 4.8, "Frontend: Vercel Edge Cloud", [
        "• Live URL: https://careconnect-ehr.vercel.app/",
        "• Framework: React 19 + Vite 6 production build.",
        "• Single Page Application (SPA) routing with vercel.json rewrites.",
        "• Automatic Environment Variable normalization for VITE_API_BASE_URL.",
        "• Zero-latency global content delivery network (CDN)."
    ], c_blue)

    add_card(s11, 6.8, 1.9, 5.7, 4.8, "Backend: Render Docker Container", [
        "• Live URL: https://careconnect-backend-uim9.onrender.com",
        "• Swagger UI: https://careconnect-backend-uim9.onrender.com/swagger-ui.html",
        "• Multi-stage Dockerfile packaging OpenJDK 17 + Spring Boot 3.3.4.",
        "• Dual-sync API client with local offline fallback.",
        "• Open permissive CORS configuration for cross-domain requests."
    ], c_emerald)

    # ==========================================
    # SLIDE 12: Conclusion & Q&A
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12, c_navy)

    tx_c = s12.shapes.add_textbox(Inches(0.8), Inches(1.0), Inches(11.5), Inches(1.0))
    tf_c = tx_c.text_frame
    p_c = tf_c.paragraphs[0]
    p_c.text = "Thank You! Questions & Discussion"
    p_c.font.size = Pt(32)
    p_c.font.bold = True
    p_c.font.color.rgb = c_white

    # Demo Credentials Card on Conclusion
    card_cred = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.5))
    card_cred.fill.solid()
    card_cred.fill.fore_color.rgb = RGBColor(30, 41, 59)
    card_cred.line.color.rgb = RGBColor(51, 65, 85)
    tf_cc = card_cred.text_frame
    tf_cc.word_wrap = True
    p_cc = tf_cc.paragraphs[0]
    p_cc.text = "EVALUATOR DEMO CREDENTIALS"
    p_cc.font.size = Pt(12)
    p_cc.font.bold = True
    p_cc.font.color.rgb = RGBColor(56, 189, 248)

    p_cc_lines = tf_cc.add_paragraph()
    p_cc_lines.text = (
        "\n• Doctor Portal:\n"
        "  User: dr_smith (or dr.sharma)\n"
        "  Pass: password123 (or Doctor#2026)\n\n"
        "• Patient Portal:\n"
        "  User: patient1 (or john_doe)\n"
        "  Pass: Patient#2026 (or password123)\n\n"
        "• Admin Console:\n"
        "  User: admin (or admin_alex)\n"
        "  Pass: Admin#2026 (or password123)"
    )
    p_cc_lines.font.size = Pt(11)
    p_cc_lines.font.color.rgb = c_white

    # Deliverables & Links Card
    card_deliv = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.2), Inches(5.7), Inches(4.5))
    card_deliv.fill.solid()
    card_deliv.fill.fore_color.rgb = RGBColor(30, 41, 59)
    card_deliv.line.color.rgb = RGBColor(51, 65, 85)
    tf_cd = card_deliv.text_frame
    tf_cd.word_wrap = True
    p_cd = tf_cd.paragraphs[0]
    p_cd.text = "PROJECT DELIVERABLES SUMMARY"
    p_cd.font.size = Pt(12)
    p_cd.font.bold = True
    p_cd.font.color.rgb = RGBColor(52, 211, 153)

    p_cd_lines = tf_cd.add_paragraph()
    p_cd_lines.text = (
        "\n• Live App: careconnect-ehr.vercel.app\n"
        "• Swagger UI: careconnect-backend-uim9.onrender.com/swagger-ui.html\n"
        "• GitHub Repo: github.com/faizan0264/careconnect-ehr\n"
        "• Oracle DDL: CareConnect_Oracle_Schema.sql\n"
        "• Specification Report: CareConnect_Modules_and_UseCases_Submission.docx\n"
        "• Standalone JAR: careconnect-backend-1.0.0.jar (58.9 MB)\n\n"
        "Ready for Live Demonstration & Technical Defense."
    )
    p_cd_lines.font.size = Pt(11)
    p_cd_lines.font.color.rgb = c_white

    prs.save(output_path)
    print(f"Successfully generated PowerPoint presentation: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "CareConnect_Project_Presentation.pptx"
    create_presentation(out)
