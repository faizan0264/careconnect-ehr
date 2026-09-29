# CareConnect: Patient-Provider Electronic Health Record (EHR)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Oracle SQL](https://img.shields.io/badge/Oracle-19c%2F21c-red.svg)](https://www.oracle.com/database/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, HIPAA-aligned **Electronic Health Record (EHR) and Patient Portal System** designed to bridge the communication gap between patients and healthcare providers.

---

## 🌟 Key Highlights

- **Role-Based Access Control (RBAC)**: Secure Doctor, Patient, and Admin portals with zero phantom logins and strict credential verification.
- **Doctor Clinical Workstation**:
  - Full Encounter Documentation (SOAP Notes & Vitals Tracking).
  - Computerized Physician Order Entry (CPOE) for Labs and Imaging.
  - e-Prescribing Engine with real-time **Drug Allergy Contraindication Alerts** and physician overrides.
  - Diagnostic Imaging & Lab Review Vault.
- **Interactive Patient Portal**:
  - Longitudinal Health Summary & After-Visit Summaries (AVS).
  - Doctor Appointment Booking with **Real-Time Schedule Collision Detection** and busy-slot prevention.
  - One-click prescription refill requests.
  - Outside medical record and lab scan upload.
- **Dual-Access Medical Report & Scan Vault**:
  - Both doctors and patients can upload PDFs and scan images (PNG/JPG up to 15MB).
  - Drag-and-drop file ingestion with automatic Base64 encoding.
  - In-browser scan preview, findings inspector, and document downloading.
- **HIPAA Security & Audit Trail**:
  - Immutable audit logs capturing every chart view, order creation, document upload, and deletion with user identity, role, IP address, and timestamp.
- **Administrator Console**:
  - Manage clinical staff and patient accounts.
  - Enforce password and username changes.
  - Audit trail inspection and compliance reporting.

---

## 🏗️ Architecture & Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, HTML5 Canvas / Drag-and-Drop |
| **Backend API** | Java 17+, Spring Boot 3.3.4, Spring Data JPA, Spring Validation, Lombok |
| **API Documentation** | OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`) |
| **Databases** | H2 in-memory (zero-dependency local development) & Oracle Database 19c/21c Enterprise DDL |
| **Containerization** | Docker multi-stage builds, Docker Compose, Nginx Alpine |

---

## 📁 Repository Structure

```text
careconnect-ehr/
├── careconnect-backend/             # Spring Boot 3 REST API Service
│   ├── src/main/java/com/careconnect/ehr/
│   │   ├── config/                  # Swagger OpenAPI & DataInitializer
│   │   ├── controller/              # Auth, Patient, Clinical, Report, Audit APIs
│   │   ├── model/                   # JPA Entities (User, Patient, Report, Audit...)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   └── service/                 # Clinical, Audit, and Auth business logic
│   ├── Dockerfile                   # Multi-stage production container
│   └── pom.xml                      # Maven dependencies
│
├── careconnect-react/               # React 19 + Vite Single Page Application
│   ├── src/
│   │   ├── components/              # Navbar, MedicalReportVaultModal, AccountSettings
│   │   ├── context/                 # EhrContext state management & persistence
│   │   ├── modules/                 # DoctorDashboard, PatientDashboard, AdminDashboard, AuthLogin
│   │   └── services/                # REST API client (api.js)
│   ├── Dockerfile                   # Nginx production container
│   ├── nginx.conf                   # SPA routing configuration
│   ├── vercel.json                  # Vercel deployment configuration
│   └── package.json
│
├── CareConnect_Oracle_Schema.sql    # Enterprise Oracle SQL 19c/21c DDL Script
├── docker-compose.yml               # Multi-container orchestration
├── DEPLOYMENT_GUIDE.md              # Cloud deployment instructions
└── README.md
```

---

## 🚀 Quick Cloud Deployment (Free & Instant)

### 1. Deploy Frontend to Vercel
1. Log into [Vercel](https://vercel.com).
2. Click **"Add New Project"** and import this GitHub repository.
3. Set **Root Directory** to `careconnect-react`.
4. Framework Preset: **Vite**.
5. Click **Deploy**. Your app will be live at `https://<your-project>.vercel.app`.

### 2. Deploy Backend to Render
1. Log into [Render](https://render.com).
2. Click **"New Web Service"** and connect this repository.
3. Set **Root Directory** to `careconnect-backend`.
4. Select **Docker** (Render detects the multi-stage `Dockerfile`).
5. Choose the **Free** tier and click **Create Web Service**.
6. Your backend and Swagger UI will be live at `https://<your-service>.onrender.com/swagger-ui.html`.

---

## 💻 Running Locally

### Prerequisites
- **Node.js**: v18+ (tested on Node 20 / 24)
- **Java**: JDK 17+
- **Maven**: 3.8+ (portable maven included or system installed)

### 1. Start the Backend API
```powershell
cd careconnect-backend
mvn spring-boot:run
```
- API Base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (`jdbc:h2:mem:careconnectdb`, user: `sa`, password: `password`)

### 2. Start the Frontend
```powershell
cd careconnect-react
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Doctor** | `doctor` | `Doctor123!` |
| **Patient** | `patient` | `Patient123!` |
| **Administrator** | `admin` | `Admin123!` |

*(Self-service registration is also available for new patients via the Sign-Up screen).*

---

## 🗄️ Oracle Database Integration
The file `CareConnect_Oracle_Schema.sql` contains the complete enterprise schema:
- **Tables**: `USERS`, `PATIENTS`, `APPOINTMENTS`, `ENCOUNTERS`, `DIAGNOSTIC_ORDERS`, `PRESCRIPTIONS`, `MEDICAL_REPORTS`, `AUDIT_LOGS`.
- **Integrity**: Primary Keys, Foreign Keys with cascading rules, check constraints, and unique constraints.
- **Indexes**: B-Tree performance indexes on MRNs, dates, and foreign keys.
- **Pre-seeded data**: Realistic clinical encounter history ready to execute in Oracle SQL Developer or SQL*Plus.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
