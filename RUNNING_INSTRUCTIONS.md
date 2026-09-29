# CareConnect EHR - Running Guide: Connected Frontend & Backend

This guide explains how to run the **CareConnect Electronic Health Record (EHR)** application with both the **Spring Boot REST API backend** and the **React 19 / Vite frontend** connected and communicating seamlessly.

---

## Architecture Overview

```
 ┌────────────────────────────────────────┐
 │   React 19 / Vite Web Frontend        │
 │   URL: http://localhost:5173           │
 └──────────────────┬─────────────────────┘
                    │ REST API HTTP Calls (JSON)
                    ▼
 ┌────────────────────────────────────────┐
 │   Spring Boot 3.3.4 REST API Backend   │
 │   Port: 8080                           │
 │   Swagger UI: /swagger-ui.html         │
 └──────────────────┬─────────────────────┘
                    │ JPA / Hibernate
                    ▼
 ┌────────────────────────────────────────┐
 │   In-Memory H2 Database                │
 │   Web Console: /h2-console             │
 │   JDBC URL: jdbc:h2:mem:careconnectdb  │
 └────────────────────────────────────────┘
```

> [!NOTE]
> The frontend is equipped with **zero-downtime resilient failover**. If the backend is compiling or restarting, the frontend smoothly continues to operate with in-browser clinical state, automatically syncing with the REST API once the backend comes online.

---

## Method 1: 1-Click Master Launcher (Recommended)

A pre-configured launcher script has been created in your project directory that launches both servers in separate labeled command windows:

1. Open File Explorer to:
   ```
   C:\Users\faiza\.gemini\antigravity\scratch
   ```
2. Double-click:
   ```
   start-careconnect.bat
   ```
3. Two console windows will appear:
   - **CareConnect Backend (Port 8080)**: Boots Spring Boot REST API.
   - **CareConnect Frontend (Port 5173)**: Boots React Vite dev server.
4. Open your web browser at:
   **[http://localhost:5173](http://localhost:5173)**

---

## Method 2: Two Terminal Windows (Manual Command Line)

If you prefer to start each service individually in PowerShell or Command Prompt:

### Terminal 1: Backend (Spring Boot)
Open PowerShell:
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch
.\run-backend.bat
```
*Or using the portable Maven directly:*
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch\careconnect-backend
& "..\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
```
*Wait until you see:*
```
Started CareConnectApplication in X.XXX seconds (process running for X.XXX)
```

### Terminal 2: Frontend (React / Vite)
Open a second PowerShell window:
```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch\careconnect-react
npm run dev
```
*The terminal will output:*
```
  VITE v5.4.x  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Method 3: Java IDE (IntelliJ IDEA / VS Code / Eclipse)

1. Open your favorite Java IDE (e.g., **IntelliJ IDEA**, **Eclipse**, or **VS Code** with Extension Pack for Java).
2. Click **Open Project** and select:
   ```
   C:\Users\faiza\.gemini\antigravity\scratch\careconnect-backend
   ```
3. Allow the IDE to import the `pom.xml` dependencies.
4. Navigate to:
   ```
   src/main/java/com/careconnect/ehr/CareConnectApplication.java
   ```
5. Click the green **Run ▶** icon next to `public static void main(String[] args)`.
6. For the frontend, run `npm run dev` in the IDE's built-in terminal inside `careconnect-react`.

---

## System Access & Port Reference

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Full Patient, Doctor, and Admin EHR interface |
| **Backend REST API** | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | Spring Boot REST endpoints |
| **Swagger UI Documentation** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive OpenAPI 3.0 API explorer & test console |
| **H2 Database Web Console** | [http://localhost:8080/h2-console](http://localhost:8080/h2-console) | In-memory relational database console (`JDBC URL: jdbc:h2:mem:careconnectdb`, User: `sa`, Password: `password`) |

---

## Pre-Loaded Test Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Hospital Administrator** | `admin` | `Admin#2026` | Full administrative control, Doctor provisioning, user management, audit logs |
| **Attending Physician** | `dr.sharma` | `Doctor#2026` | Chief Cardiologist, clinical encounters, diagnostic lab orders, prescriptions |
| **Staff Doctor** | `dr.chen` | `Doctor#2026` | Neurologist |
| **Registered Patient** | `patient1` | `Patient#2026` | Patient (John Doe), appointment booking, prescriptions, clinical records |

> [!TIP]
> **Universal Account Settings**:
> Any logged-in user can click their profile in the top-right navbar and select **Account Settings** to change their username, display name, email, or password.

---

## Verifying Connected Functionality

### 1. Public Patient Registration
1. Go to `http://localhost:5173` and click **"Create Patient Account"**.
2. Fill out personal and medical demographics (DOB, Blood Group, Drug Allergies, Emergency Contact).
3. Sign in with the newly created patient credentials.

### 2. Administrator Provisions a Doctor
1. Sign in as `admin` (`Admin#2026`).
2. Go to **Hospital Admin Console** -> **"Staff & Provider Management"**.
3. Click **"Provision New Healthcare Provider"**.
4. Enter Full Name, Email, Username, Temporary Password, Specialty, and License Number.
5. Log out and immediately log in as the newly provisioned Doctor!

### 3. Schedule Conflict & Double-Booking Prevention
1. Sign in as `patient1` (`Patient#2026`).
2. Click **"Book Appointment"** and select Dr. Rajesh Sharma.
3. Observe live slot status:
   - Already-booked slots show 🔴 **Busy**.
   - Available slots show 🟢 **Open**.
4. If a busy slot is selected, the system triggers real-time collision detection:
   > *"Physician Schedule Conflict Detected: Dr. Rajesh Sharma is already booked at this time. This schedule is busy — please select an available time slot or change the date."*
5. Select an open slot to confirm the appointment.
