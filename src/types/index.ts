export interface Doctor {
  id: string;
  name: string;
  spec: string;
  hospital: string;
  hospitalId: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  fee: number;
  available: boolean;
  when: string;
  sex: 'm' | 'f';
  about?: string;
  education?: string[];
  availableDays?: string[];
  photoUrl?: string;
}

export interface Review {
  id: string;
  hospitalId?: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
  originalComment?: string;
  originalLanguage?: 'en' | 'ta' | string;
  isVoice?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  rating: number;
  reviews: string;
  address: string;
  distance: string;
  phone: string;
  open: string;
  close: string;
  depts: string[];
  more: number;
  wait: number;
  queue: number;
  tint: string;
  accent: string;
  alert?: { title: string; text: string } | null;
  doctors: Doctor[];
  imageUrl?: string;
  city: string;
  patientReviews?: Review[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpec: string;
  doctorSex: 'm' | 'f';
  hospitalId: string;
  hospitalName: string;
  department: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  patientName: string;
  reason?: string;
  fee: number;
}

export interface QueueToken {
  id: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorName: string;
  currentToken: number;
  userToken: number;
  peopleWaiting: number;
  estimatedWaitMins: number;
  status: 'In Queue' | 'Called' | 'Completed' | 'Delayed';
}

export interface EmergencyService {
  id: string;
  hospitalName: string;
  distance: string;
  erPhone: string;
  ambulancePhone: string;
  erAvailability: 'Available' | 'High Demand' | 'Full';
  bloodBankAvailable: boolean;
  bloodGroupsAvailable: string[];
  address: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  category: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Diagnostic' | 'Blood Bank';
  distance: string;
  location: string;
  rating: number;
  isOpen: boolean;
  hours: string;
  phone: string;
}

export interface HealthRecord {
  id: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Scan Report' | 'Doctor Note' | 'Appointment Summary';
  date: string;
  doctorName: string;
  hospitalName: string;
  fileSize: string;
  fileType: 'PDF' | 'JPG' | 'PNG' | 'DOCX';
  notes?: string;
  fileUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserSettings {
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  emergencyContact: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
}

export type AdminTokenStatus = 'Waiting' | 'In Progress' | 'Completed' | 'No-show';

export interface AdminToken {
  id: string;
  tokenNo: string;
  hospitalId: string;
  patientName: string;
  department: string;
  doctorName: string;
  status: AdminTokenStatus;
  appointmentTime: string;
  issuedAt: string;
  patientPhone?: string;
  ageSex?: string;
}

export interface AdminHospitalConfig {
  id: string;
  name: string;
  passwordHash: string;
  defaultPasswordHint: string;
  departments: string[];
}

export interface AdminSession {
  hospitalId: string;
  hospitalName: string;
  loggedInAt: string;
}

