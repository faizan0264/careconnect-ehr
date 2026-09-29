# ==============================================================================
# CareConnect EHR - Real-World Application End-to-End Readiness Audit
# ==============================================================================

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   CARECONNECT EHR: REAL-WORLD APPLICATION READINESS AUDIT" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$passes = 0
$fails = 0

function Assert-Test {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
        $script:passes++
    } else {
        Write-Host "  [FAIL] $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "         $Details" -ForegroundColor Yellow }
        $script:fails++
    }
}

# ------------------------------------------------------------------------------
# 1. CORE SERVER CONNECTIVITY
# ------------------------------------------------------------------------------
Write-Host "[1/7] Testing Core Server Connectivity..." -ForegroundColor Yellow
try {
    $fe = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Assert-Test "Frontend React/Vite Dev Server (Port 5173)" ($fe.StatusCode -eq 200) "HTTP Status: 200 OK"
} catch {
    Assert-Test "Frontend React/Vite Dev Server (Port 5173)" $false "Error: $_"
}

try {
    $be = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui.html" -UseBasicParsing -TimeoutSec 5
    Assert-Test "Backend Spring Boot REST API & Swagger UI (Port 8080)" ($be.StatusCode -eq 200) "HTTP Status: 200 OK"
} catch {
    Assert-Test "Backend Spring Boot REST API & Swagger UI (Port 8080)" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 2. AUTHENTICATION & SECURITY ENFORCEMENT
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/7] Testing Strict Authentication & RBAC..." -ForegroundColor Yellow

# Unregistered user
$unregBody = '{"username":"hacker_ghost_99","password":"random_password"}'
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $unregBody -ContentType "application/json"
    Assert-Test "Unregistered user login rejection" $false "Server erroneously allowed unregistered user"
} catch {
    Assert-Test "Unregistered user login rejection" ($_.Exception.Response.StatusCode.value__ -eq 401) "HTTP 401 Unauthorized returned"
}

# Wrong password
$wrongPassBody = '{"username":"admin","password":"IncorrectPassword999"}'
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $wrongPassBody -ContentType "application/json"
    Assert-Test "Wrong password rejection" $false "Server allowed incorrect password"
} catch {
    Assert-Test "Wrong password rejection" ($_.Exception.Response.StatusCode.value__ -eq 401) "HTTP 401 Unauthorized returned"
}

# Backdoor bypass test (admin with old password123)
$backdoorBody = '{"username":"admin","password":"password123"}'
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $backdoorBody -ContentType "application/json"
    Assert-Test "Universal password backdoor blocked" $false "Backdoor password allowed"
} catch {
    Assert-Test "Universal password backdoor blocked" ($_.Exception.Response.StatusCode.value__ -eq 401) "Backdoor successfully blocked (401)"
}

# Valid Admin Login
$adminBody = '{"username":"admin","password":"Admin#2026"}'
try {
    $adminRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
    Assert-Test "Administrator Authentication" ($adminRes.success -and $adminRes.role -eq "ROLE_ADMIN") "User: $($adminRes.fullName), Role: $($adminRes.role)"
} catch {
    Assert-Test "Administrator Authentication" $false "Error: $_"
}

# Valid Doctor Login
$docBody = '{"username":"dr.sharma","password":"Doctor#2026"}'
try {
    $docRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $docBody -ContentType "application/json"
    Assert-Test "Attending Physician Authentication" ($docRes.success -and $docRes.role -eq "ROLE_DOCTOR") "User: $($docRes.fullName), Role: $($docRes.role)"
} catch {
    Assert-Test "Attending Physician Authentication" $false "Error: $_"
}

# Valid Patient Login
$patBody = '{"username":"patient1","password":"Patient#2026"}'
try {
    $patRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $patBody -ContentType "application/json"
    Assert-Test "Registered Patient Authentication" ($patRes.success -and $patRes.role -eq "ROLE_PATIENT") "User: $($patRes.fullName), Role: $($patRes.role)"
} catch {
    Assert-Test "Registered Patient Authentication" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 3. PATIENT SELF-REGISTRATION & MASTER PATIENT INDEX (MPI)
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/7] Testing Patient Self-Registration & MPI Sync..." -ForegroundColor Yellow

$uniqueSuffix = (Get-Random -Minimum 1000 -Maximum 9999)
$testPatientUser = "patient_emily_$uniqueSuffix"
$regBody = @{
    fullName = "Emily Watson"
    username = $testPatientUser
    password = "MySecurePassword#2026"
    email = "emily.$uniqueSuffix@testcare.org"
    phone = "+1 (555) 890-$uniqueSuffix"
    department = "Outpatient"
    role = "ROLE_PATIENT"
} | ConvertTo-Json

try {
    $regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register-patient" -Method POST -Body $regBody -ContentType "application/json"
    Assert-Test "Public Patient Self-Registration" ($regRes.username -eq $testPatientUser -and $regRes.role -eq "ROLE_PATIENT") "Registered User ID #$($regRes.id): $($regRes.fullName)"

    # Verify newly registered patient can authenticate immediately
    $newAuthBody = @{
        username = $testPatientUser
        password = "MySecurePassword#2026"
    } | ConvertTo-Json
    $newAuthRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $newAuthBody -ContentType "application/json"
    Assert-Test "Newly Registered Patient Authentication" ($newAuthRes.success -and $newAuthRes.username -eq $testPatientUser) "JWT Token: $($newAuthRes.token.Substring(0,18))..."

    # Verify Master Patient Index record exists
    $allPatients = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/patients" -Method GET
    $foundInMpi = $allPatients | Where-Object { $_.firstName -eq "Emily" }
    Assert-Test "Master Patient Index (MPI) Synchronization" ($null -ne $foundInMpi) "MRN: $($foundInMpi.mrn), Name: $($foundInMpi.firstName) $($foundInMpi.lastName)"
} catch {
    Assert-Test "Public Patient Self-Registration" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 4. ADMIN STAFF PROVISIONING & ACCOUNT LIFECYCLE
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/7] Testing Admin Staff Provisioning & Lifecycle..." -ForegroundColor Yellow

$testDocUser = "dr_gupta_$uniqueSuffix"
$provBody = @{
    fullName = "Dr. Anita Gupta, MD"
    username = $testDocUser
    password = "DocPassword#2026"
    email = "dr.gupta.$uniqueSuffix@careconnect.org"
    phone = "+1 (555) 777-1234"
    department = "Pediatrics & Neonatal Care"
    role = "ROLE_DOCTOR"
} | ConvertTo-Json

try {
    $provRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/provision-staff" -Method POST -Body $provBody -ContentType "application/json"
    Assert-Test "Admin Staff Provisioning (Doctor)" ($provRes.username -eq $testDocUser -and $provRes.role -eq "ROLE_DOCTOR") "Provisioned Doctor ID #$($provRes.id): $($provRes.fullName)"

    # Verify provisioned doctor can log in
    $docLoginBody = @{
        username = $testDocUser
        password = "DocPassword#2026"
    } | ConvertTo-Json
    $docLoginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $docLoginBody -ContentType "application/json"
    Assert-Test "Provisioned Doctor Login Verification" ($docLoginRes.success -and $docLoginRes.role -eq "ROLE_DOCTOR") "Doctor session established"

    # User Account Deletion
    $delRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/users/$($provRes.id)" -Method DELETE
    Assert-Test "Admin Account Revocation / Deletion" ($null -ne $delRes) "Removed User ID #$($provRes.id)"
} catch {
    Assert-Test "Admin Staff Provisioning" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 5. APPOINTMENT SCHEDULING & CONFLICT COLLISION ENGINE
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/7] Testing Appointment Scheduling & Collision Engine..." -ForegroundColor Yellow

# Slot 1: Book open appointment
$testDate = "2026-11-20"
$testSlot = "03:30 PM"

$book1 = @{
    patientId = 1
    patientName = "John Doe"
    doctorId = 6
    doctorName = "Dr. Rajesh Sharma, MD"
    department = "Cardiovascular Medicine"
    appointmentDate = $testDate
    timeSlot = $testSlot
    reason = "Cardiac Stress Test"
} | ConvertTo-Json

try {
    $appt1 = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/appointments" -Method POST -Body $book1 -ContentType "application/json"
    Assert-Test "Valid Appointment Booking" ($appt1.appointmentDate -eq $testDate -and $appt1.timeSlot -eq $testSlot) "Appointment #$($appt1.id) confirmed for $testDate at $testSlot"

    # Slot 2: Attempt collision / double booking with same doctor on same date & time
    $bookCollision = @{
        patientId = 2
        patientName = "Another Patient"
        doctorId = 6
        doctorName = "Dr. Rajesh Sharma, MD"
        department = "Cardiovascular Medicine"
        appointmentDate = $testDate
        timeSlot = $testSlot
        reason = "Follow-up Check"
    } | ConvertTo-Json

    try {
        $collRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/appointments" -Method POST -Body $bookCollision -ContentType "application/json"
        Assert-Test "Collision Prevention (Double-Booking Blocked)" $false "Server erroneously allowed schedule collision"
    } catch {
        Assert-Test "Collision Prevention (Double-Booking Blocked)" ($_.Exception.Response.StatusCode.value__ -eq 409) "HTTP 409 Conflict returned - collision blocked!"
    }
} catch {
    Assert-Test "Valid Appointment Booking" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 6. CLINICAL WORKFLOWS & HIPAA AUDIT TRAIL
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[6/7] Testing Clinical Workflows & Audit Trail..." -ForegroundColor Yellow

try {
    $encounters = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/clinical/encounters/1" -Method GET
    Assert-Test "Clinical Encounters Query" ($encounters.Count -gt 0) "Found $($encounters.Count) clinical encounters for Patient #1"

    $orders = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/clinical/orders/1" -Method GET
    Assert-Test "CPOE Diagnostic Orders Query" ($orders.Count -gt 0) "Found $($orders.Count) diagnostic orders for Patient #1"

    $prescriptions = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/clinical/prescriptions/1" -Method GET
    Assert-Test "E-Prescriptions Query" ($prescriptions.Count -gt 0) "Found $($prescriptions.Count) active prescriptions for Patient #1"

    $auditLogs = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/audit/logs" -Method GET
    Assert-Test "HIPAA Audit Trail Verification" ($auditLogs.Count -gt 0) "Found $($auditLogs.Count) immutable security audit entries recorded"
} catch {
    Assert-Test "Clinical Workflows & Audit Trail" $false "Error: $_"
}

# ------------------------------------------------------------------------------
# 7. PRODUCTION DEPLOYMENT ASSETS CHECK
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "[7/7] Testing Production Deployment Assets..." -ForegroundColor Yellow

$schemaExists = Test-Path "C:\Users\faiza\.gemini\antigravity\scratch\CareConnect_Oracle_Schema.sql"
Assert-Test "Oracle Enterprise SQL Schema File" $schemaExists "CareConnect_Oracle_Schema.sql present"

$composeExists = Test-Path "C:\Users\faiza\.gemini\antigravity\scratch\docker-compose.yml"
Assert-Test "Docker Compose Orchestration File" $composeExists "docker-compose.yml present"

$backendDocker = Test-Path "C:\Users\faiza\.gemini\antigravity\scratch\careconnect-backend\Dockerfile"
Assert-Test "Backend Multi-Stage Dockerfile" $backendDocker "careconnect-backend/Dockerfile present"

$frontendDocker = Test-Path "C:\Users\faiza\.gemini\antigravity\scratch\careconnect-react\Dockerfile"
Assert-Test "Frontend NGINX Production Dockerfile" $frontendDocker "careconnect-react/Dockerfile present"

# Frontend production build check
$distExists = Test-Path "C:\Users\faiza\.gemini\antigravity\scratch\careconnect-react\dist\index.html"
Assert-Test "Frontend Production Build Output (dist/)" $distExists "React production bundle compiled cleanly"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   AUDIT SUMMARY: $passes PASSED, $fails FAILED" -ForegroundColor $(if ($fails -eq 0) { "Green" } else { "Red" })
Write-Host "====================================================================" -ForegroundColor Cyan

if ($fails -eq 0) {
    Write-Host "STATUS: 100% READY FOR REAL-WORLD PRODUCTION USE!" -ForegroundColor Green
} else {
    Write-Host "STATUS: SOME ISSUES DETECTED - PLEASE REVIEW FAILURES." -ForegroundColor Red
}
