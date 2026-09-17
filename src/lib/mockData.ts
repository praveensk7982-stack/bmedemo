import type { Hospital, Doctor, Appointment, QueueToken, EmergencyService, NearbyFacility, HealthRecord, ChatMessage, UserSettings, Review } from '../types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: "apollo",
    name: "ABC Hospital",
    rating: 4.5,
    reviews: "2.8k",
    address: "21 Greams Road, Thousand Lights, Chennai - 600006",
    distance: "2.3 km",
    phone: "+91 44 2829 3333",
    open: "06:00 AM",
    close: "10:00 PM",
    depts: ["General", "Cardiology", "Orthopedics", "Neurology", "Pediatrics"],
    more: 8,
    wait: 28,
    queue: 12,
    tint: "#7fa8c9",
    accent: "#1f5f9e",
    city: "Chennai",
    alert: { title: "Emergency Case Arrived", text: "Waiting time may increase by 10 mins. Critical cases are being prioritized." },
    doctors: [
      {
        id: "doc-1",
        name: "Dr. S. Ramesh Babu",
        spec: "Cardiologist",
        hospital: "ABC Hospital",
        hospitalId: "apollo",
        qualification: "MBBS, MD, DM (Cardiology)",
        experienceYears: 18,
        rating: 4.8,
        reviewsCount: 342,
        fee: 900,
        available: true,
        when: "Today 10:00 AM - 04:00 PM",
        sex: "m",
        about: "Dr. S. Ramesh Babu is a renowned Senior Interventional Cardiologist with over 18 years of clinical experience in angioplasty, pacemaker insertion, and heart failure management.",
        education: ["MBBS - Madras Medical College (2004)", "MD (General Medicine) - AIIMS New Delhi", "DM (Cardiology) - Christian Medical College Vellore"],
        availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      {
        id: "doc-2",
        name: "Dr. Priya Nair",
        spec: "Orthopedic Specialist",
        hospital: "ABC Hospital",
        hospitalId: "apollo",
        qualification: "MBBS, MS (Ortho), Fellowship in Joint Replacement",
        experienceYears: 14,
        rating: 4.7,
        reviewsCount: 289,
        fee: 800,
        available: true,
        when: "Today 11:00 AM - 05:00 PM",
        sex: "f",
        about: "Dr. Priya Nair specializes in knee and hip joint replacements, keyhole arthroscopic surgery, and complex sports injury rehabilitations.",
        education: ["MBBS - Stanley Medical College", "MS Orthopedics - JIPMER Puducherry"],
        availableDays: ["Mon", "Wed", "Fri"]
      },
      {
        id: "doc-3",
        name: "Dr. Karthik V.",
        spec: "Neurologist",
        hospital: "ABC Hospital",
        hospitalId: "apollo",
        qualification: "MBBS, DM (Neurology)",
        experienceYears: 12,
        rating: 4.5,
        reviewsCount: 221,
        fee: 850,
        available: false,
        when: "Next available: Tomorrow 09:00 AM",
        sex: "m",
        about: "Expert in stroke management, epilepsy treatments, migraines, and neurodegenerative disorders.",
        education: ["MBBS - MMC Chennai", "DM Neurology - NIMHANS Bengaluru"],
        availableDays: ["Tue", "Thu", "Sat"]
      },
      {
        id: "doc-4",
        name: "Dr. Meenakshi Sundaram",
        spec: "General Physician",
        hospital: "ABC Hospital",
        hospitalId: "apollo",
        qualification: "MBBS, MD (Internal Medicine)",
        experienceYears: 20,
        rating: 4.6,
        reviewsCount: 410,
        fee: 650,
        available: true,
        when: "Today 08:00 AM - 02:00 PM",
        sex: "f",
        about: "Comprehensive primary healthcare, diabetes control, hypertension management, and preventive medical exams.",
        education: ["MBBS - Kilpauk Medical College", "MD Medicine - Madras Medical College"],
        availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
      }
    ]
  },
  {
    id: "miot",
    name: "MIOT International Hospital",
    rating: 4.4,
    reviews: "1.9k",
    address: "4/112 Mount Poonamallee Road, Manapakkam, Chennai - 600089",
    distance: "5.7 km",
    phone: "+91 44 4280 0000",
    open: "07:00 AM",
    close: "09:00 PM",
    depts: ["Orthopedics", "Cardiology", "Neurology", "Gastroenterology"],
    more: 6,
    wait: 42,
    queue: 18,
    tint: "#c2946a",
    accent: "#a35c3a",
    city: "Chennai",
    alert: null,
    doctors: [
      {
        id: "doc-5",
        name: "Dr. Anand Krishnan",
        spec: "Orthopedic Surgeon",
        hospital: "MIOT International Hospital",
        hospitalId: "miot",
        qualification: "MBBS, MS (Ortho), M.Ch (UK)",
        experienceYears: 16,
        rating: 4.7,
        reviewsCount: 412,
        fee: 950,
        available: true,
        when: "Today 09:30 AM - 03:00 PM",
        sex: "m",
        about: "Pioneer in minimal invasive joint surgeries, trauma care, and pediatric orthopedics.",
        education: ["MBBS - Sri Ramachandra University", "MS Ortho - MMC", "M.Ch - University of Liverpool"],
        availableDays: ["Mon", "Tue", "Thu", "Fri"]
      },
      {
        id: "doc-6",
        name: "Dr. Meera Raghav",
        spec: "Cardiologist",
        hospital: "MIOT International Hospital",
        hospitalId: "miot",
        qualification: "MBBS, MD, DNB (Cardiology)",
        experienceYears: 11,
        rating: 4.5,
        reviewsCount: 198,
        fee: 800,
        available: true,
        when: "Today 12:00 PM - 06:00 PM",
        sex: "f",
        about: "Specialized in echocardiography, cardiac stress testing, and coronary risk reduction therapies.",
        education: ["MBBS - MMC Chennai", "DNB Cardiology - Apollo Hospitals"],
        availableDays: ["Mon", "Wed", "Sat"]
      }
    ]
  },
  {
    id: "srm",
    name: "SRM Global Hospitals",
    rating: 4.2,
    reviews: "1.2k",
    address: "SRM Campus, Potheri, Kattankulathur, Chennai - 603203",
    distance: "12.4 km",
    phone: "+91 44 4741 1000",
    open: "09:00 AM",
    close: "09:00 PM",
    depts: ["General", "Pediatrics", "Gynecology", "Dermatology"],
    more: 5,
    wait: 18,
    queue: 5,
    tint: "#8fb3c8",
    accent: "#2d6f8e",
    city: "Chennai",
    alert: null,
    doctors: [
      {
        id: "doc-7",
        name: "Dr. Lakshmi Devi",
        spec: "Gynecologist",
        hospital: "SRM Global Hospitals",
        hospitalId: "srm",
        qualification: "MBBS, DGO, MD (OB-GYN)",
        experienceYears: 15,
        rating: 4.8,
        reviewsCount: 276,
        fee: 700,
        available: true,
        when: "Today 10:00 AM - 04:30 PM",
        sex: "f",
        about: "Specialist in maternal care, laparoscopic fetal surgeries, and reproductive medicine.",
        education: ["MBBS - SRM Medical College", "MD OB-GYN - MMC"],
        availableDays: ["Mon", "Wed", "Fri", "Sat"]
      },
      {
        id: "doc-8",
        name: "Dr. Arun Prakash",
        spec: "Pediatrician",
        hospital: "SRM Global Hospitals",
        hospitalId: "srm",
        qualification: "MBBS, DCH, MD (Pediatrics)",
        experienceYears: 10,
        rating: 4.4,
        reviewsCount: 154,
        fee: 600,
        available: true,
        when: "Today 02:00 PM - 08:00 PM",
        sex: "m",
        about: "Child immunization expert, pediatric nutrition, and neonatal intensive care specialist.",
        education: ["MBBS - Stanley Medical College", "MD Pediatrics - JIPMER"],
        availableDays: ["Mon", "Tue", "Thu", "Fri"]
      }
    ]
  },
  {
    id: "mmc",
    name: "Madras Medical College & Govt Hospital",
    rating: 4.1,
    reviews: "3.5k",
    address: "EVR Periyar Salai, Park Town, Chennai - 600003",
    distance: "4.8 km",
    phone: "+91 44 2530 5000",
    open: "24 Hours",
    close: "24 Hours",
    depts: ["General Surgery", "Internal Medicine", "Trauma Care", "ENT"],
    more: 12,
    wait: 35,
    queue: 22,
    tint: "#d9cdb4",
    accent: "#8a6f3d",
    city: "Chennai",
    alert: { title: "High Outpatient Volume", text: "Free outpatient registration counters are active until 01:00 PM." },
    doctors: [
      {
        id: "doc-9",
        name: "Dr. R. Balamurugan",
        spec: "General Surgeon",
        hospital: "Madras Medical College & Govt Hospital",
        hospitalId: "mmc",
        qualification: "MBBS, MS (General Surgery)",
        experienceYears: 22,
        rating: 4.6,
        reviewsCount: 512,
        fee: 400,
        available: true,
        when: "Today 08:00 AM - 02:00 PM",
        sex: "m",
        about: "Senior surgeon handling laparoscopic surgeries, emergency trauma repair, and abdominal procedures.",
        education: ["MBBS - MMC Chennai", "MS Surgery - MMC Chennai"],
        availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
      },
      {
        id: "doc-10",
        name: "Dr. Kavitha Menon",
        spec: "General Physician",
        hospital: "Madras Medical College & Govt Hospital",
        hospitalId: "mmc",
        qualification: "MBBS, MD (Medicine)",
        experienceYears: 13,
        rating: 4.3,
        reviewsCount: 187,
        fee: 400,
        available: true,
        when: "Today 10:00 AM - 04:00 PM",
        sex: "f",
        about: "Expert in infectious disease management, tropical fevers, and community health.",
        education: ["MBBS - Kilpauk Medical College", "MD Medicine - MMC"],
        availableDays: ["Mon", "Wed", "Fri"]
      }
    ]
  },
  {
    id: "sims",
    name: "SIMS Hospital, Vadapalani",
    rating: 4.6,
    reviews: "2.1k",
    address: "1 Jawaharlal Nehru Salai, Vadapalani, Chennai - 600026",
    distance: "6.2 km",
    phone: "+91 44 4921 1455",
    open: "08:00 AM",
    close: "10:00 PM",
    depts: ["Cardiology", "Oncology", "Nephrology", "Pulmonology"],
    more: 9,
    wait: 20,
    queue: 8,
    tint: "#7ebf9b",
    accent: "#1e7a4b",
    city: "Chennai",
    alert: null,
    doctors: [
      {
        id: "doc-11",
        name: "Dr. Rajesh Varma",
        spec: "Pulmonologist",
        hospital: "SIMS Hospital, Vadapalani",
        hospitalId: "sims",
        qualification: "MBBS, MD, DTCD",
        experienceYears: 17,
        rating: 4.8,
        reviewsCount: 305,
        fee: 850,
        available: true,
        when: "Today 09:00 AM - 03:00 PM",
        sex: "m",
        about: "Asthma, COPD, sleep apnea diagnosis, and lung rehabilitation expert.",
        education: ["MBBS - MMC", "MD Respiratory Medicine - CMC Vellore"],
        availableDays: ["Mon", "Tue", "Thu", "Fri", "Sat"]
      }
    ]
  }
];

export const INITIAL_DOCTORS: Doctor[] = INITIAL_HOSPITALS.flatMap(h => h.doctors);

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-101",
    doctorId: "doc-1",
    doctorName: "Dr. S. Ramesh Babu",
    doctorSpec: "Cardiologist",
    doctorSex: "m",
    hospitalId: "apollo",
    hospitalName: "ABC Hospital",
    department: "Cardiology",
    date: "2026-09-20",
    time: "10:30 AM",
    status: "Upcoming",
    patientName: "John (You)",
    reason: "Annual Heart Checkup & ECG Review",
    fee: 900
  },
  {
    id: "apt-102",
    doctorId: "doc-5",
    doctorName: "Dr. Anand Krishnan",
    doctorSpec: "Orthopedic Surgeon",
    doctorSex: "m",
    hospitalId: "miot",
    hospitalName: "MIOT International Hospital",
    department: "Orthopedics",
    date: "2026-09-25",
    time: "02:00 PM",
    status: "Upcoming",
    patientName: "John (You)",
    reason: "Right Knee Pain Consultation",
    fee: 950
  },
  {
    id: "apt-103",
    doctorId: "doc-4",
    doctorName: "Dr. Meenakshi Sundaram",
    doctorSpec: "General Physician",
    doctorSex: "f",
    hospitalId: "apollo",
    hospitalName: "ABC Hospital",
    department: "General",
    date: "2026-08-14",
    time: "09:00 AM",
    status: "Completed",
    patientName: "John (You)",
    reason: "Seasonal Allergy & Routine Blood Work",
    fee: 650
  },
  {
    id: "apt-104",
    doctorId: "doc-7",
    doctorName: "Dr. Lakshmi Devi",
    doctorSpec: "Gynecologist",
    doctorSex: "f",
    hospitalId: "srm",
    hospitalName: "SRM Global Hospitals",
    department: "Gynecology",
    date: "2026-07-10",
    time: "11:00 AM",
    status: "Cancelled",
    patientName: "Family Member",
    reason: "Schedule Conflict - Rescheduled Elsewhere",
    fee: 700
  }
];

export const INITIAL_QUEUE_TOKEN: QueueToken = {
  id: "q-1001",
  hospitalId: "apollo",
  hospitalName: "ABC Hospital",
  department: "Cardiology OPD - Counter 3",
  doctorName: "Dr. S. Ramesh Babu",
  currentToken: 14,
  userToken: 19,
  peopleWaiting: 4,
  estimatedWaitMins: 20,
  status: "In Queue"
};

export const EMERGENCY_SERVICES: EmergencyService[] = [
  {
    id: "emg-1",
    hospitalName: "ABC Hospital ER Trauma Care",
    distance: "2.3 km",
    erPhone: "044 2829 0200",
    ambulancePhone: "1066",
    erAvailability: "Available",
    bloodBankAvailable: true,
    bloodGroupsAvailable: ["A+", "B+", "O+", "AB+", "O-", "A-"],
    address: "21 Greams Lane, Thousand Lights, Chennai"
  },
  {
    id: "emg-2",
    hospitalName: "MIOT International 24x7 Emergency",
    distance: "5.7 km",
    erPhone: "044 4280 1111",
    ambulancePhone: "10578",
    erAvailability: "High Demand",
    bloodBankAvailable: true,
    bloodGroupsAvailable: ["O+", "B+", "A+", "AB+"],
    address: "Mount Poonamallee Road, Manapakkam"
  },
  {
    id: "emg-3",
    hospitalName: "Madras Medical College Govt ER",
    distance: "4.8 km",
    erPhone: "044 2530 5108",
    ambulancePhone: "108",
    erAvailability: "Available",
    bloodBankAvailable: true,
    bloodGroupsAvailable: ["A+", "B+", "O+", "AB+", "B-", "AB-", "O-"],
    address: "Park Town, Opp. Chennai Central"
  }
];

export const NEARBY_FACILITIES: NearbyFacility[] = [
  {
    id: "nb-1",
    name: "ABC Hospital",
    category: "Hospital",
    distance: "2.3 km",
    location: "Greams Road, Thousand Lights",
    rating: 4.8,
    isOpen: true,
    hours: "24 Hours Open",
    phone: "044 2829 3333"
  },
  {
    id: "nb-2",
    name: "Apollo Pharmacy 24x7",
    category: "Pharmacy",
    distance: "0.8 km",
    location: "Nungambakkam High Rd",
    rating: 4.6,
    isOpen: true,
    hours: "24 Hours Open",
    phone: "044 2833 1234"
  },
  {
    id: "nb-3",
    name: "Metropolis Diagnostics & Lab",
    category: "Diagnostic",
    distance: "1.4 km",
    location: "Cathedral Road, Gopalapuram",
    rating: 4.5,
    isOpen: true,
    hours: "06:30 AM - 09:30 PM",
    phone: "044 4567 8900"
  },
  {
    id: "nb-4",
    name: "MedPlus Wellness Clinic & Pharmacy",
    category: "Clinic",
    distance: "1.1 km",
    location: "Kodambakkam High Road",
    rating: 4.3,
    isOpen: true,
    hours: "08:00 AM - 10:00 PM",
    phone: "044 2811 5566"
  },
  {
    id: "nb-5",
    name: "Rotary Central Blood Bank",
    category: "Blood Bank",
    distance: "3.2 km",
    location: "Egmore, Chennai",
    rating: 4.7,
    isOpen: true,
    hours: "24 Hours Open",
    phone: "044 2819 0456"
  }
];

export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: "rec-1",
    title: "Cardiology ECG & Echo Report",
    category: "Scan Report",
    date: "2026-08-14",
    doctorName: "Dr. S. Ramesh Babu",
    hospitalName: "ABC Hospital",
    fileSize: "2.4 MB",
    fileType: "PDF",
    notes: "Normal sinus rhythm. Ejection fraction 62%. No wall motion abnormality."
  },
  {
    id: "rec-2",
    title: "Comprehensive Lipid & Blood Profile",
    category: "Lab Report",
    date: "2026-08-12",
    doctorName: "Dr. Meenakshi Sundaram",
    hospitalName: "ABC Hospital",
    fileSize: "1.1 MB",
    fileType: "PDF",
    notes: "Total Cholesterol: 185 mg/dL, HDL: 48 mg/dL, Fasting Glucose: 92 mg/dL."
  },
  {
    id: "rec-3",
    title: "Post-Consultation Prescription Note",
    category: "Prescription",
    date: "2026-08-14",
    doctorName: "Dr. S. Ramesh Babu",
    hospitalName: "ABC Hospital",
    fileSize: "450 KB",
    fileType: "PDF",
    notes: "Tab Telmisartan 40mg once daily in the morning for 30 days."
  },
  {
    id: "rec-4",
    title: "Physiotherapy Recommendation Note",
    category: "Doctor Note",
    date: "2026-06-20",
    doctorName: "Dr. Priya Nair",
    hospitalName: "ABC Hospital",
    fileSize: "680 KB",
    fileType: "DOCX",
    notes: "Recommended 5 sessions of hamstring strengthening and quadriceps balance."
  }
];

export const INITIAL_USER_SETTINGS: UserSettings = {
  name: "John Doe",
  email: "john.doe@caremesh.org",
  phone: "+91 98765 43210",
  bloodGroup: "O+",
  emergencyContact: "+91 98765 00000 (Wife)",
  language: "English",
  theme: "light",
  emailNotifications: true,
  smsNotifications: true,
  appointmentReminders: true
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "assistant",
    text: "Hello! I am your Hospivio AI Health Assistant. How can I help you today? You can ask me about common symptoms, finding specialists, appointment scheduling guidance, or health tips.\n\n*Please note: I am an AI assistant and not a substitute for professional medical advice or emergency care.*",
    timestamp: "10:00 AM"
  }
];

export const SUGGESTED_QUESTIONS: string[] = [
  "What are the symptoms of high blood pressure?",
  "How do I prepare for a Cardiology consultation?",
  "What emergency services are available near me?",
  "How can I download my latest lab report?"
];

export const MOCK_REVIEWS: Review[] = [
  { id: "rev-1", patientName: "Rajesh Kumar", rating: 5, date: "2 weeks ago", comment: "Very polite doctor. Explained my cardiac report thoroughly and patiently." },
  { id: "rev-2", patientName: "Anita Sharma", rating: 5, date: "1 month ago", comment: "Minimal wait time at ABC Hospital. Great diagnosis and clear prescription." },
  { id: "rev-3", patientName: "Venkatesh P.", rating: 4, date: "2 months ago", comment: "Doctor is highly experienced. The hospital staff managed the queue efficiently." }
];
