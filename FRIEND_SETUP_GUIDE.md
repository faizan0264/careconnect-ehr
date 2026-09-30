# 🚀 Quick Start Guide for Friends & Teammates
## CareConnect EHR — Enterprise Electronic Health Record System

Welcome! Follow this quick 3-step guide to run the **CareConnect EHR** project on your machine in **Visual Studio Code**.

---

## 🛠️ Step 0: Prerequisites (Only Needed Once)

Make sure you have these installed:
1. **[Visual Studio Code](https://code.visualstudio.com/)**
2. **[Node.js (v18 or higher)](https://nodejs.org/)** — Check with `node -v` in terminal
3. *(Optional)* **[Java JDK 17 or higher](https://www.oracle.com/java/technologies/downloads/)** — Only if you want to run the Spring Boot backend locally (the frontend is already connected to the live cloud backend by default!).

---

## 📥 Step 1: Download or Clone the Project

Open your terminal or command prompt and run:

```bash
git clone https://github.com/faizan0264/careconnect-ehr.git
cd careconnect-ehr
```

*(Or download the ZIP from GitHub, extract it, and open that folder).*

---

## 💻 Step 2: Open in Visual Studio Code

1. Open **VS Code**.
2. Go to **File** ➔ **Open Workspace from File...**
3. Select `careconnect.code-workspace` from the root of the project.
   *(This automatically mounts both the React frontend and Java backend cleanly in your sidebar).*
4. If VS Code asks: *"Do you want to install the recommended extensions for this repository?"*, click **Install All**.

---

## ▶️ Step 3: Run the Project (Choose ANY Method)

### Method A: Single-Click Script (Easiest)
In Windows File Explorer, just **double-click** the file:
```
start-careconnect.bat
```
This automatically boots both Frontend (`http://localhost:5173`) and Backend (`http://localhost:8080`) in separate windows!

---

### Method B: Directly Inside VS Code (Recommended)
1. In VS Code, press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac).
2. Type: **`Tasks: Run Task`** and press **Enter**.
3. Select: **`🚀 Run Full Stack (Frontend + Backend)`**
   *(Or select `Frontend: Start Dev Server` if you just want to run the web app).*

---

### Method C: Using the VS Code Terminal
Open the integrated terminal in VS Code (`Ctrl + ~`) and run:

```bash
# 1. Start the React Frontend:
cd careconnect-react
npm install
npm run dev
```

The web app will open instantly at: **`http://localhost:5173`** 🎉

---

## 🌐 Application URLs

| Service | Local URL | Cloud / Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | http://localhost:5173 | https://careconnect-ehr.vercel.app |
| **Backend REST API** | http://localhost:8080/api/v1 | https://careconnect-backend-uim9.onrender.com/api/v1 |
| **Swagger API Docs** | http://localhost:8080/swagger-ui.html | https://careconnect-backend-uim9.onrender.com/swagger-ui.html |
| **H2 Database Console** | http://localhost:8080/h2-console | — |

---

## 🔑 Demo Login Credentials (Ready to Test)

Use any of these pre-configured accounts:

### 1. 👨‍⚕️ Doctor / Physician Portal
* **Username:** `dr_emily`  |  **Password:** `password123`
* **Username:** `dr_smith`  |  **Password:** `password123`
* **Username:** `dr.sharma` |  **Password:** `Doctor#2026`

### 2. 👤 Patient Portal
* **Username:** `malik`     |  **Password:** `897937`
* **Username:** `kavita`    |  **Password:** `897937`
* **Username:** `patient1`  |  **Password:** `Patient#2026`
* *(Or click **"Patient Sign Up"** on the login page to register yourself!)*

### 3. 🛡️ System Administrator Portal
* **Username:** `admin`       |  **Password:** `Admin#2026`
* **Username:** `admin_alex`  |  **Password:** `password123`

---

## ❓ Troubleshooting

1. **Frontend says `node_modules` missing?**  
   Run `cd careconnect-react && npm install`.
2. **Port 5173 or 8080 already in use?**  
   Close any other node or Java processes in Task Manager, or change the port in `careconnect-react/vite.config.js`.
3. **Want to switch between Local and Cloud backend?**  
   Edit `careconnect-react/.env`:
   - Cloud: `VITE_API_BASE_URL=https://careconnect-backend-uim9.onrender.com/api/v1`
   - Local: `VITE_API_BASE_URL=http://localhost:8080/api/v1`
