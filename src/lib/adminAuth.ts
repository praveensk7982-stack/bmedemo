import bcrypt from 'bcryptjs';
import type { AdminHospitalConfig, AdminToken, AdminTokenStatus, AdminSession } from '../types';

// Pre-hashed bcrypt passwords for the 4 exact hospitals required
// Pre-calculated bcrypt hashes (salt 10) for:
// - Apollo: apollo123
// - MIOT: miot123
// - MMC: mmc123
// - SIMS: sims123
export const ADMIN_HOSPITALS: AdminHospitalConfig[] = [
  {
    id: "apollo",
    name: "ABC Hospital",
    passwordHash: bcrypt.hashSync("apollo123", 10),
    defaultPasswordHint: "apollo123",
    departments: ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "General Medicine"]
  },
  {
    id: "miot",
    name: "MIOT International Hospital",
    passwordHash: bcrypt.hashSync("miot123", 10),
    defaultPasswordHint: "miot123",
    departments: ["Orthopedics", "Cardiology", "Gastroenterology", "Neurology"]
  },
  {
    id: "mmc",
    name: "Madras Medical College & Govt Hospital",
    passwordHash: bcrypt.hashSync("mmc123", 10),
    defaultPasswordHint: "mmc123",
    departments: ["General Surgery", "Internal Medicine", "ENT", "Trauma Care"]
  },
  {
    id: "sims",
    name: "SIMS Hospital, Vadapalani",
    passwordHash: bcrypt.hashSync("sims123", 10),
    defaultPasswordHint: "sims123",
    departments: ["Cardiology", "Oncology", "Pulmonology", "Nephrology"]
  }
];

// Initial mock data pre-filled for all 4 hospitals
const INITIAL_ADMIN_TOKENS: Record<string, AdminToken[]> = {
  apollo: [
    { id: "aptk-101", tokenNo: "TK-101", hospitalId: "apollo", patientName: "Ramesh Kumar", department: "Cardiology", doctorName: "Dr. S. Ramesh Babu", status: "In Progress", appointmentTime: "09:30 AM", issuedAt: "09:00 AM", patientPhone: "+91 98401 12345", ageSex: "45M" },
    { id: "aptk-102", tokenNo: "TK-102", hospitalId: "apollo", patientName: "Priya Sundaram", department: "Orthopedics", doctorName: "Dr. Priya Nair", status: "Waiting", appointmentTime: "10:00 AM", issuedAt: "09:15 AM", patientPhone: "+91 98402 23456", ageSex: "38F" },
    { id: "aptk-103", tokenNo: "TK-103", hospitalId: "apollo", patientName: "Anand V.", department: "Neurology", doctorName: "Dr. Karthik V.", status: "Waiting", appointmentTime: "10:15 AM", issuedAt: "09:20 AM", patientPhone: "+91 98403 34567", ageSex: "52M" },
    { id: "aptk-104", tokenNo: "TK-104", hospitalId: "apollo", patientName: "Meena S.", department: "General Medicine", doctorName: "Dr. Meenakshi Sundaram", status: "Waiting", appointmentTime: "10:30 AM", issuedAt: "09:30 AM", patientPhone: "+91 98404 45678", ageSex: "29F" },
    { id: "aptk-105", tokenNo: "TK-105", hospitalId: "apollo", patientName: "K. Vijay", department: "Cardiology", doctorName: "Dr. S. Ramesh Babu", status: "Waiting", appointmentTime: "10:45 AM", issuedAt: "09:40 AM", patientPhone: "+91 98405 56789", ageSex: "61M" },
    { id: "aptk-106", tokenNo: "TK-106", hospitalId: "apollo", patientName: "Sunita Patel", department: "Pediatrics", doctorName: "Dr. Arun Prakash", status: "Waiting", appointmentTime: "11:00 AM", issuedAt: "09:45 AM", patientPhone: "+91 98406 67890", ageSex: "6F" },
    { id: "aptk-107", tokenNo: "TK-107", hospitalId: "apollo", patientName: "Dinesh Raj", department: "Orthopedics", doctorName: "Dr. Priya Nair", status: "Completed", appointmentTime: "09:00 AM", issuedAt: "08:30 AM", patientPhone: "+91 98407 78901", ageSex: "41M" },
    { id: "aptk-108", tokenNo: "TK-108", hospitalId: "apollo", patientName: "Kavitha M.", department: "General Medicine", doctorName: "Dr. Meenakshi Sundaram", status: "Completed", appointmentTime: "09:15 AM", issuedAt: "08:45 AM", patientPhone: "+91 98408 89012", ageSex: "34F" },
    { id: "aptk-109", tokenNo: "TK-109", hospitalId: "apollo", patientName: "Rajesh Sharma", department: "Neurology", doctorName: "Dr. Karthik V.", status: "No-show", appointmentTime: "09:30 AM", issuedAt: "09:00 AM", patientPhone: "+91 98409 90123", ageSex: "48M" },
    { id: "aptk-110", tokenNo: "TK-110", hospitalId: "apollo", patientName: "Arthi Swaminathan", department: "Cardiology", doctorName: "Dr. S. Ramesh Babu", status: "Waiting", appointmentTime: "11:15 AM", issuedAt: "10:00 AM", patientPhone: "+91 98410 01234", ageSex: "50F" },
    { id: "aptk-111", tokenNo: "TK-111", hospitalId: "apollo", patientName: "Harish N.", department: "Orthopedics", doctorName: "Dr. Priya Nair", status: "Waiting", appointmentTime: "11:30 AM", issuedAt: "10:10 AM", patientPhone: "+91 98411 12345", ageSex: "33M" },
    { id: "aptk-112", tokenNo: "TK-112", hospitalId: "apollo", patientName: "Deepa R.", department: "General Medicine", doctorName: "Dr. Meenakshi Sundaram", status: "Waiting", appointmentTime: "11:45 AM", issuedAt: "10:15 AM", patientPhone: "+91 98412 23456", ageSex: "27F" }
  ],
  miot: [
    { id: "miotk-201", tokenNo: "TK-201", hospitalId: "miot", patientName: "Suresh Pillai", department: "Orthopedics", doctorName: "Dr. Anand Krishnan", status: "In Progress", appointmentTime: "09:30 AM", issuedAt: "09:05 AM", patientPhone: "+91 97101 11111", ageSex: "49M" },
    { id: "miotk-202", tokenNo: "TK-202", hospitalId: "miot", patientName: "Meera Raghavan", department: "Cardiology", doctorName: "Dr. Meera Raghav", status: "Waiting", appointmentTime: "10:00 AM", issuedAt: "09:15 AM", patientPhone: "+91 97102 22222", ageSex: "42F" },
    { id: "miotk-203", tokenNo: "TK-203", hospitalId: "miot", patientName: "Karthik Balan", department: "Gastroenterology", doctorName: "Dr. V. Subramaniam", status: "Waiting", appointmentTime: "10:15 AM", issuedAt: "09:25 AM", patientPhone: "+91 97103 33333", ageSex: "36M" },
    { id: "miotk-204", tokenNo: "TK-204", hospitalId: "miot", patientName: "Divya Prasad", department: "Neurology", doctorName: "Dr. S. Natarajan", status: "Waiting", appointmentTime: "10:30 AM", issuedAt: "09:35 AM", patientPhone: "+91 97104 44444", ageSex: "31F" },
    { id: "miotk-205", tokenNo: "TK-205", hospitalId: "miot", patientName: "Balaji Swamy", department: "Orthopedics", doctorName: "Dr. Anand Krishnan", status: "Waiting", appointmentTime: "10:45 AM", issuedAt: "09:45 AM", patientPhone: "+91 97105 55555", ageSex: "55M" },
    { id: "miotk-206", tokenNo: "TK-206", hospitalId: "miot", patientName: "Revathi N.", department: "Cardiology", doctorName: "Dr. Meera Raghav", status: "Completed", appointmentTime: "09:00 AM", issuedAt: "08:30 AM", patientPhone: "+91 97106 66666", ageSex: "58F" },
    { id: "miotk-207", tokenNo: "TK-207", hospitalId: "miot", patientName: "Gokul K.", department: "Gastroenterology", doctorName: "Dr. V. Subramaniam", status: "Completed", appointmentTime: "09:15 AM", issuedAt: "08:40 AM", patientPhone: "+91 97107 77777", ageSex: "40M" },
    { id: "miotk-208", tokenNo: "TK-208", hospitalId: "miot", patientName: "Janaki R.", department: "Orthopedics", doctorName: "Dr. Anand Krishnan", status: "No-show", appointmentTime: "09:30 AM", issuedAt: "08:50 AM", patientPhone: "+91 97108 88888", ageSex: "63F" },
    { id: "miotk-209", tokenNo: "TK-209", hospitalId: "miot", patientName: "Mohan Das", department: "Neurology", doctorName: "Dr. S. Natarajan", status: "Waiting", appointmentTime: "11:00 AM", issuedAt: "10:00 AM", patientPhone: "+91 97109 99999", ageSex: "47M" },
    { id: "miotk-210", tokenNo: "TK-210", hospitalId: "miot", patientName: "Shobha R.", department: "Cardiology", doctorName: "Dr. Meera Raghav", status: "Waiting", appointmentTime: "11:15 AM", issuedAt: "10:10 AM", patientPhone: "+91 97110 00000", ageSex: "35F" }
  ],
  mmc: [
    { id: "mmctk-301", tokenNo: "TK-301", hospitalId: "mmc", patientName: "Balamurugan R.", department: "General Surgery", doctorName: "Dr. R. Balamurugan", status: "In Progress", appointmentTime: "08:30 AM", issuedAt: "08:00 AM", patientPhone: "+91 96001 11111", ageSex: "50M" },
    { id: "mmctk-302", tokenNo: "TK-302", hospitalId: "mmc", patientName: "Kavitha Menon", department: "Internal Medicine", doctorName: "Dr. Kavitha Menon", status: "Waiting", appointmentTime: "09:00 AM", issuedAt: "08:15 AM", patientPhone: "+91 96002 22222", ageSex: "44F" },
    { id: "mmctk-303", tokenNo: "TK-303", hospitalId: "mmc", patientName: "Thangavelu P.", department: "ENT", doctorName: "Dr. S. Murugan", status: "Waiting", appointmentTime: "09:15 AM", issuedAt: "08:25 AM", patientPhone: "+91 96003 33333", ageSex: "62M" },
    { id: "mmctk-304", tokenNo: "TK-304", hospitalId: "mmc", patientName: "Mariyappan S.", department: "Trauma Care", doctorName: "Dr. K. Vijayakumar", status: "Waiting", appointmentTime: "09:30 AM", issuedAt: "08:35 AM", patientPhone: "+91 96004 44444", ageSex: "28M" },
    { id: "mmctk-305", tokenNo: "TK-305", hospitalId: "mmc", patientName: "Chitra Devi", department: "Internal Medicine", doctorName: "Dr. Kavitha Menon", status: "Waiting", appointmentTime: "09:45 AM", issuedAt: "08:45 AM", patientPhone: "+91 96005 55555", ageSex: "39F" },
    { id: "mmctk-306", tokenNo: "TK-306", hospitalId: "mmc", patientName: "Kannan M.", department: "General Surgery", doctorName: "Dr. R. Balamurugan", status: "Waiting", appointmentTime: "10:00 AM", issuedAt: "08:55 AM", patientPhone: "+91 96006 66666", ageSex: "46M" },
    { id: "mmctk-307", tokenNo: "TK-307", hospitalId: "mmc", patientName: "Selvam K.", department: "ENT", doctorName: "Dr. S. Murugan", status: "Completed", appointmentTime: "08:00 AM", issuedAt: "07:30 AM", patientPhone: "+91 96007 77777", ageSex: "53M" },
    { id: "mmctk-308", tokenNo: "TK-308", hospitalId: "mmc", patientName: "Lakshmi M.", department: "Internal Medicine", doctorName: "Dr. Kavitha Menon", status: "Completed", appointmentTime: "08:15 AM", issuedAt: "07:45 AM", patientPhone: "+91 96008 88888", ageSex: "57F" },
    { id: "mmctk-309", tokenNo: "TK-309", hospitalId: "mmc", patientName: "Ganesan P.", department: "Trauma Care", doctorName: "Dr. K. Vijayakumar", status: "No-show", appointmentTime: "08:30 AM", issuedAt: "08:00 AM", patientPhone: "+91 96009 99999", ageSex: "35M" },
    { id: "mmctk-310", tokenNo: "TK-310", hospitalId: "mmc", patientName: "Saravanan B.", department: "General Surgery", doctorName: "Dr. R. Balamurugan", status: "Waiting", appointmentTime: "10:15 AM", issuedAt: "09:10 AM", patientPhone: "+91 96010 00000", ageSex: "41M" },
    { id: "mmctk-311", tokenNo: "TK-311", hospitalId: "mmc", patientName: "Vimala R.", department: "ENT", doctorName: "Dr. S. Murugan", status: "Waiting", appointmentTime: "10:30 AM", issuedAt: "09:20 AM", patientPhone: "+91 96011 11111", ageSex: "33F" }
  ],
  sims: [
    { id: "simstk-401", tokenNo: "TK-401", hospitalId: "sims", patientName: "Rajesh Varma", department: "Pulmonology", doctorName: "Dr. Rajesh Varma", status: "In Progress", appointmentTime: "09:30 AM", issuedAt: "09:00 AM", patientPhone: "+91 95001 11111", ageSex: "48M" },
    { id: "simstk-402", tokenNo: "TK-402", hospitalId: "sims", patientName: "Nithya Swaminathan", department: "Oncology", doctorName: "Dr. S. Jayaraman", status: "Waiting", appointmentTime: "10:00 AM", issuedAt: "09:15 AM", patientPhone: "+91 95002 22222", ageSex: "51F" },
    { id: "simstk-403", tokenNo: "TK-403", hospitalId: "sims", patientName: "Venkatraman K.", department: "Cardiology", doctorName: "Dr. P. Ramakrishnan", status: "Waiting", appointmentTime: "10:15 AM", issuedAt: "09:25 AM", patientPhone: "+91 95003 33333", ageSex: "64M" },
    { id: "simstk-404", tokenNo: "TK-404", hospitalId: "sims", patientName: "Anitha Rao", department: "Nephrology", doctorName: "Dr. G. Chandrasekhar", status: "Waiting", appointmentTime: "10:30 AM", issuedAt: "09:35 AM", patientPhone: "+91 95004 44444", ageSex: "43F" },
    { id: "simstk-405", tokenNo: "TK-405", hospitalId: "sims", patientName: "Sangeetha M.", department: "Pulmonology", doctorName: "Dr. Rajesh Varma", status: "Waiting", appointmentTime: "10:45 AM", issuedAt: "09:45 AM", patientPhone: "+91 95005 55555", ageSex: "37F" },
    { id: "simstk-406", tokenNo: "TK-406", hospitalId: "sims", patientName: "Vikram S.", department: "Cardiology", doctorName: "Dr. P. Ramakrishnan", status: "Completed", appointmentTime: "09:00 AM", issuedAt: "08:30 AM", patientPhone: "+91 95006 66666", ageSex: "56M" },
    { id: "simstk-407", tokenNo: "TK-407", hospitalId: "sims", patientName: "Uma Maheshwari", department: "Oncology", doctorName: "Dr. S. Jayaraman", status: "Completed", appointmentTime: "09:15 AM", issuedAt: "08:45 AM", patientPhone: "+91 95007 77777", ageSex: "60F" },
    { id: "simstk-408", tokenNo: "TK-408", hospitalId: "sims", patientName: "Christopher D.", department: "Nephrology", doctorName: "Dr. G. Chandrasekhar", status: "No-show", appointmentTime: "09:30 AM", issuedAt: "08:55 AM", patientPhone: "+91 95008 88888", ageSex: "45M" },
    { id: "simstk-409", tokenNo: "TK-409", hospitalId: "sims", patientName: "Preethi K.", department: "Pulmonology", doctorName: "Dr. Rajesh Varma", status: "Waiting", appointmentTime: "11:00 AM", issuedAt: "10:00 AM", patientPhone: "+91 95009 99999", ageSex: "29F" },
    { id: "simstk-410", tokenNo: "TK-410", hospitalId: "sims", patientName: "Narayanan B.", department: "Oncology", doctorName: "Dr. S. Jayaraman", status: "Waiting", appointmentTime: "11:15 AM", issuedAt: "10:15 AM", patientPhone: "+91 95010 00000", ageSex: "58M" }
  ]
};

// Persistence keys
const STORAGE_KEY_TOKENS = 'caremesh_admin_tokens_v2';
const STORAGE_KEY_SESSION = 'caremesh_admin_session_v2';

// Get current session from sessionStorage or localStorage
export function getStoredAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setStoredAdminSession(session: AdminSession | null) {
  if (session) {
    sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  }
}

// Get tokens store
function getTokensStore(): Record<string, AdminToken[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(INITIAL_ADMIN_TOKENS));
      return INITIAL_ADMIN_TOKENS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_ADMIN_TOKENS;
  }
}

function saveTokensStore(store: Record<string, AdminToken[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save tokens to localStorage', e);
  }
}

// Authenticate hospital admin using bcrypt
export function verifyHospitalPassword(hospitalId: string, plainPasswordInput: string): { success: boolean; error?: string; session?: AdminSession } {
  const hospital = ADMIN_HOSPITALS.find(h => h.id === hospitalId);
  if (!hospital) {
    return { success: false, error: "Please select a hospital first." };
  }

  // Validate entered password against THAT specific hospital's bcrypt hash
  const isValid = bcrypt.compareSync(plainPasswordInput.trim(), hospital.passwordHash);

  if (!isValid) {
    return { success: false, error: "Invalid password for selected hospital" };
  }

  const session: AdminSession = {
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    loggedInAt: new Date().toISOString()
  };

  setStoredAdminSession(session);
  return { success: true, session };
}

// Get hospital tokens scoped strictly to logged in hospitalId
export function getHospitalTokens(hospitalId: string): AdminToken[] {
  const store = getTokensStore();
  return store[hospitalId] || [];
}

// Update token status
export function updateTokenStatus(hospitalId: string, tokenId: string, newStatus: AdminTokenStatus): AdminToken[] {
  const store = getTokensStore();
  const hospitalTokens = store[hospitalId] || [];
  
  const updatedTokens = hospitalTokens.map(tok => {
    if (tok.id === tokenId) {
      return { ...tok, status: newStatus };
    }
    return tok;
  });

  store[hospitalId] = updatedTokens;
  saveTokensStore(store);
  return updatedTokens;
}

// Issue new token dynamically (walk-in patient)
export function addWalkInToken(hospitalId: string, patientName: string, department: string, doctorName: string): AdminToken[] {
  const store = getTokensStore();
  const hospitalTokens = store[hospitalId] || [];
  
  const nextNum = 101 + hospitalTokens.length;
  const newToken: AdminToken = {
    id: `walkin-${Date.now()}`,
    tokenNo: `TK-${nextNum}`,
    hospitalId,
    patientName,
    department,
    doctorName: doctorName || 'Duty Specialist',
    status: 'Waiting',
    appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    patientPhone: '+91 99000 Walkin',
    ageSex: '30M'
  };

  const updatedTokens = [newToken, ...hospitalTokens];
  store[hospitalId] = updatedTokens;
  saveTokensStore(store);
  return updatedTokens;
}

// Calculate hospital dashboard metrics
export function getHospitalSummaryMetrics(tokens: AdminToken[]) {
  const totalAppointmentsToday = tokens.length;
  const totalTokensIssuedToday = tokens.length;
  const totalTokensWaiting = tokens.filter(t => t.status === 'Waiting').length;
  const totalInProgress = tokens.filter(t => t.status === 'In Progress').length;
  const totalCompleted = tokens.filter(t => t.status === 'Completed').length;
  const totalNoShow = tokens.filter(t => t.status === 'No-show').length;
  
  // Calculate average waiting time (e.g. 5 mins per waiting token, average ~18-25 mins)
  const avgWaitMins = Math.max(12, totalTokensWaiting * 5 + 8);

  return {
    totalAppointmentsToday,
    totalTokensIssuedToday,
    totalTokensWaiting,
    totalInProgress,
    totalCompleted,
    totalNoShow,
    avgWaitMins
  };
}
