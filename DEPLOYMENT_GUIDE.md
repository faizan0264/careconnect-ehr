# CareConnect EHR - Deployment & Execution Guide
**Target Deadline: October 1, 2026 • 2:55 PM**

This project consists of two clean, production-ready modules:
1. **Frontend**: React 19 + Vite (`careconnect-react/`)
2. **Backend**: Spring Boot 3 + Java + Spring Data JPA + Swagger UI (`careconnect-backend/`)
3. **Database Schema**: Oracle SQL 19c/21c DDL (`CareConnect_Oracle_Schema.sql`)
4. **Orchestration**: Docker & Docker Compose (`docker-compose.yml`)

---

## 1. Quick Free Deployment (Live URL for Evaluation)

### A. Deploy Frontend to Vercel (60 Seconds)
1. Push `careconnect-react` to GitHub (or use the [Vercel CLI](https://vercel.com/docs/cli)).
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository, choose root directory `careconnect-react`.
4. Framework Preset: **Vite**.
5. Click **Deploy**.
6. **Result**: You will immediately get a live HTTPS URL (e.g. `https://careconnect-ehr.vercel.app`).
   *(The included `vercel.json` already handles SPA routing so page refreshes never 404).*

---

### B. Deploy Backend to Render (3 Minutes)
1. Push `careconnect-backend` to GitHub.
2. Log in to [Render](https://render.com) and click **"New Web Service"**.
3. Connect your repository and select directory `careconnect-backend`.
4. Environment: **Docker** (Render will automatically detect the multi-stage `Dockerfile`).
5. Choose the **Free** instance tier.
6. Click **Create Web Service**.
7. **Result**: Your backend will be live with Swagger UI at `https://<your-render-app>.onrender.com/swagger-ui.html`.

---

## 2. Running Locally on Your Machine

### Option A: Running the React Frontend Standalone
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch\careconnect-react
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.
- Instant 1-click persona switching (Doctor, Patient, Admin) in the top bar.
- Pre-loaded with realistic clinical data (MRNs, Vitals, SOAP notes, CPOE orders, drug allergies).
- Book appointments, place STAT lab orders, and request medication refills.

---

### Option B: Running the Spring Boot Backend API
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch\careconnect-backend
mvn spring-boot:run
```
*(If Maven is not installed globally in PATH, you can run via IntelliJ IDEA, Eclipse, VS Code Spring Tools, or Docker).*

- **Swagger UI Interactive API Docs**: `http://localhost:8080/swagger-ui.html`
- **H2 Database Web Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:careconnectdb`
  - User: `sa` | Password: `password`

---

### Option C: 1-Click Launch with Docker Compose
If Docker Desktop is installed:
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch
docker compose up --build
```
- Frontend available at `http://localhost`
- Backend API available at `http://localhost:8080`

---

## 3. Submitting the Oracle Database Deliverable
- The file [`CareConnect_Oracle_Schema.sql`](file:///C:/Users/faiza/.gemini/antigravity/scratch/CareConnect_Oracle_Schema.sql) contains the complete Oracle SQL DDL script:
  - Tables: `USERS`, `PATIENTS`, `APPOINTMENTS`, `ENCOUNTERS`, `DIAGNOSTIC_ORDERS`, `PRESCRIPTIONS`, `AUDIT_LOGS`.
  - Integrity Constraints: Foreign Keys, Cascade rules, Check constraints, and Unique keys.
  - Performance B-Tree Indexes on MRNs, patient IDs, and timestamps.
  - Realistic seed records ready to run in Oracle SQL Developer or SQL*Plus.
