// ==============================================================================
// CareConnect EHR - Unified API Client Service
// Automatically connects to Spring Boot REST API when available
// Gracefully falls back to local clinical state if backend is offline/sleeping
// ==============================================================================

// Auto-detect and normalize environment URL (supports VITE_API_BASE_URL, live Render cloud backend, and local fallback)
const getApiBaseUrl = () => {
  let rawUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  
  if (!rawUrl) {
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      // If deployed on Vercel or any non-localhost host, default to the live Render backend
      if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
        rawUrl = 'https://careconnect-backend-uim9.onrender.com/api/v1';
      }
    }
  }

  // Fallback to local development if not specified
  if (!rawUrl) {
    rawUrl = 'http://localhost:8080/api/v1';
  }

  let url = rawUrl.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const api = {
  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, { method: 'GET', headers: defaultHeaders });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth: Login
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 401 || res.status === 400 || res.status === 404) {
        const errData = await res.json().catch(() => null);
        return { 
          success: false, 
          message: errData?.message || 'Invalid username or password. Please check your credentials.' 
        };
      }
    } catch (err) {
      console.warn('Backend unavailable, using local auth verification.');
    }
    return null;
  },

  // Auth: Update Profile / Credentials (Username & Password)
  async updateProfile(profileData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(profileData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, profile updated locally.');
    }
    return null;
  },

  // Auth: Register Patient Account (User + MPI)
  async registerPatientAccount(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-patient`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          fullName: userData.fullName,
          username: userData.username,
          password: userData.password,
          email: userData.email,
          phone: userData.phone,
          department: 'Outpatient',
          role: 'ROLE_PATIENT'
        }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, patient registered locally.');
    }
    return null;
  },

  // Auth: Provision Staff (Admin)
  async provisionStaff(staffData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/provision-staff`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(staffData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, staff provisioned locally.');
    }
    return null;
  },

  // Auth: Remove User (Admin)
  async deleteUser(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Backend unavailable, user deleted locally.');
    }
    return false;
  },

  // Patients (MPI)
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local patients.');
    }
    return null;
  },

  async registerPatient(patientData, staffName) {
    try {
      const url = staffName ? `${API_BASE_URL}/patients?staffName=${encodeURIComponent(staffName)}` : `${API_BASE_URL}/patients`;
      const res = await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(patientData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, registered locally.');
    }
    return null;
  },

  async deletePatient(patientId, staffName) {
    try {
      const url = staffName ? `${API_BASE_URL}/patients/${patientId}?staffName=${encodeURIComponent(staffName)}` : `${API_BASE_URL}/patients/${patientId}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Backend unavailable, patient deleted locally.');
    }
    return false;
  },

  // Appointments
  async getAppointments() {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local appointments.');
    }
    return null;
  },

  async bookAppointment(appointmentData) {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(appointmentData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, booked locally.');
    }
    return null;
  },

  async cancelAppointment(appointmentId) {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: defaultHeaders,
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, cancelled locally.');
    }
    return null;
  },

  // Clinical: Orders
  async getOrders(patientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/orders/${patientId}`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local orders.');
    }
    return null;
  },

  async placeOrder(orderData, doctorName) {
    try {
      const url = doctorName ? `${API_BASE_URL}/clinical/orders?doctorName=${encodeURIComponent(doctorName)}` : `${API_BASE_URL}/clinical/orders`;
      const res = await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(orderData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, placed locally.');
    }
    return null;
  },

  async completeOrderResult(orderId, resultText) {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/orders/${orderId}/result`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ result: resultText }),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, updated locally.');
    }
    return null;
  },

  // Clinical: Prescriptions
  async getPrescriptions(patientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/prescriptions/${patientId}`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local prescriptions.');
    }
    return null;
  },

  async prescribe(prescriptionData, doctorName) {
    try {
      const url = doctorName ? `${API_BASE_URL}/clinical/prescriptions?doctorName=${encodeURIComponent(doctorName)}` : `${API_BASE_URL}/clinical/prescriptions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(prescriptionData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, prescribed locally.');
    }
    return null;
  },

  // HIPAA Audit Logs
  async getAuditLogs(action = 'ALL') {
    try {
      const res = await fetch(`${API_BASE_URL}/audit/logs?action=${action}`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local audit logs.');
    }
    return null;
  },

  // Medical Reports & Document Vault
  async getReports(patientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/patient/${patientId}`, { method: 'GET', headers: defaultHeaders });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, using local reports.');
    }
    return null;
  },

  async uploadReport(reportData) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/upload`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(reportData),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend unavailable, report saved in browser state.');
    }
    return null;
  },

  async deleteReport(reportId, deletedBy) {
    try {
      const url = deletedBy ? `${API_BASE_URL}/reports/${reportId}?deletedBy=${encodeURIComponent(deletedBy)}` : `${API_BASE_URL}/reports/${reportId}`;
      const res = await fetch(url, { method: 'DELETE', headers: defaultHeaders });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Backend unavailable, report removed locally.');
    }
    return false;
  }
};
