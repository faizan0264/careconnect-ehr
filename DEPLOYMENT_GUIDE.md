# CareConnect EHR - Deployment & Hosting Guide

This guide walks you through deploying **CareConnect EHR** from GitHub to the cloud for free with live public URLs.

---

## Step 1: Create Repository on GitHub & Push

1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. Enter Repository Name: **`careconnect-ehr`** (or any name you prefer)
3. Choose **Public** (or **Private**)
4. **IMPORTANT**: Leave **"Add a README file"**, **".gitignore"**, and **"Choose a license"** **UNCHECKED** (our local repo already contains them).
5. Click **"Create repository"**.
6. On your computer, open PowerShell or Command Prompt, and run:

```powershell
cd C:\Users\faiza\.gemini\antigravity\scratch
git remote add origin https://github.com/faizan0264/careconnect-ehr.git
git branch -M main
git push -u origin main
```
*(Alternatively, you can just double-click **`push-to-github.bat`** in `C:\Users\faiza\.gemini\antigravity\scratch`)*

---

## Step 2: Deploy Frontend to Vercel (Free • 60 Seconds)

1. Go to **[https://vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Locate **`careconnect-ehr`** from your repository list and click **"Import"**.
4. In the configuration screen:
   - **Root Directory**: Click *Edit* and select **`careconnect-react`**.
   - **Framework Preset**: **Vite** (auto-detected).
   - **Build Command**: `npm run build` (auto-detected).
   - **Output Directory**: `dist` (auto-detected).
5. Click **"Deploy"**.
6. **Result**: Within 45 seconds, your frontend will be live on an official HTTPS domain (e.g. `https://careconnect-ehr.vercel.app`).
   *(SPA client-side routing is already configured in `vercel.json` so direct links and page refreshes work seamlessly).*

---

## Step 3: Deploy Backend to Render (Free • 3 Minutes)

1. Go to **[https://render.com](https://render.com)** and log in with your GitHub account.
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select **`careconnect-ehr`**.
4. Configure the Web Service settings:
   - **Name**: `careconnect-backend`
   - **Region**: Choose the closest region (e.g. Oregon, Frankfurt, Singapore)
   - **Root Directory**: `careconnect-backend`
   - **Runtime / Environment**: **Docker** *(Render will automatically build using our multi-stage `careconnect-backend/Dockerfile` with Maven and OpenJDK 17)*.
   - **Instance Type**: **Free**.
5. Click **"Deploy Web Service"**.
6. **Result**: Your backend will be built and launched at `https://careconnect-backend.onrender.com`.
   - **Interactive Swagger UI**: `https://careconnect-backend.onrender.com/swagger-ui.html`
   - **Health / API Base**: `https://careconnect-backend.onrender.com/api/v1/auth/me`

---

## Step 4: Link Frontend to Render Backend (Optional)

In your Vercel project settings:
1. Go to **Settings** > **Environment Variables**.
2. Add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://careconnect-backend.onrender.com/api/v1`
3. Click **Save** and trigger a redeploy.
*(Note: CareConnect is already equipped with dual-sync fallback so it works immediately even before cloud backend linking!)*

---

## Step 5: Containerized Deployment via Docker Compose

If you have a Linux server (AWS EC2, DigitalOcean Droplet, Linode) or Docker Desktop:
```bash
docker compose up -d --build
```
- Nginx Frontend: `http://<server-ip>`
- Spring Boot API: `http://<server-ip>:8080`
- Swagger UI: `http://<server-ip>:8080/swagger-ui.html`

---

## Step 6: Oracle Enterprise Database Schema

The file `CareConnect_Oracle_Schema.sql` is ready to execute directly into **Oracle Cloud Autonomous Database (ATP)**, **Oracle XE**, or on-premise Oracle 19c/21c:
1. Open Oracle SQL Developer or SQL*Plus.
2. Connect to your database schema.
3. Run the script:
   ```sql
   @CareConnect_Oracle_Schema.sql;
   ```
4. All tables (`USERS`, `PATIENTS`, `APPOINTMENTS`, `ENCOUNTERS`, `DIAGNOSTIC_ORDERS`, `PRESCRIPTIONS`, `MEDICAL_REPORTS`, `AUDIT_LOGS`), constraints, and seed data will be created with 100% compliance.
