export interface PatientSession {
  email: string;
  mobileNumber?: string;
  name: string;
  role?: string;
  authProvider?: string;
  loggedInAt?: string;
}

const SESSION_KEY = 'caremesh_patient_session';

/**
 * Retrieves active patient session from sessionStorage, or defaults to standard active user context.
 */
export function getActivePatientSession(): PatientSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          name: parsed.name || parsed.fullName || parsed.full_name || 'Praveen Kumar',
          email: parsed.email || 'praveen.k@caremesh.org',
          mobileNumber: parsed.mobileNumber || parsed.mobile_number || '+91 98401 98765',
          role: parsed.role || 'Patient',
          authProvider: parsed.authProvider,
          loggedInAt: parsed.loggedInAt
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse patient session:', e);
  }

  return {
    name: 'Praveen Kumar',
    email: 'praveen.k@caremesh.org',
    mobileNumber: '+91 98401 98765',
    role: 'Patient'
  };
}

/**
 * Updates or sets the active patient session in sessionStorage.
 */
export function setActivePatientSession(session: PatientSession): void {
  try {
    const existing = getActivePatientSession();
    const updated: PatientSession = {
      ...existing,
      ...session,
      role: session.role || existing.role || 'Patient'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save patient session:', e);
  }
}
