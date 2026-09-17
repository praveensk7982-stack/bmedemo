import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

import { HospitalsPage } from './pages/HospitalsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { QueuePage } from './pages/QueuePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { NearbyPage } from './pages/NearbyPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { OperationsSimulatorPage } from './pages/OperationsSimulatorPage';
import { HealthRecordsPage } from './pages/HealthRecordsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LandingLoginPage } from './pages/LandingLoginPage';

import { BookAppointmentModal } from './components/modals/BookAppointmentModal';
import { DoctorProfileModal } from './components/modals/DoctorProfileModal';
import { UploadRecordModal } from './components/modals/UploadRecordModal';
import { EmergencyCallModal } from './components/modals/EmergencyCallModal';

import { 
  INITIAL_HOSPITALS, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_QUEUE_TOKEN, 
  EMERGENCY_SERVICES, 
  NEARBY_FACILITIES, 
  INITIAL_HEALTH_RECORDS, 
  INITIAL_USER_SETTINGS,
  INITIAL_CHAT_MESSAGES
} from './lib/mockData';

import type { Doctor, Hospital, Appointment, HealthRecord, ChatMessage, UserSettings } from './types';
import { CheckCircle2 } from 'lucide-react';

export function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Domain Data State
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [queueToken, setQueueToken] = useState(INITIAL_QUEUE_TOKEN);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [userSettings, setUserSettings] = useState<UserSettings>(INITIAL_USER_SETTINGS);

  // Modals state
  const [bookingModalState, setBookingModalState] = useState<{
    open: boolean;
    doctor?: Doctor | null;
    hospital?: Hospital | null;
  }>({ open: false });

  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<Doctor | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [emergencyCallState, setEmergencyCallState] = useState<{ open: boolean; hospitalName?: string; phone: string }>({ open: false, phone: '108' });

  // Toast notifications
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);

  const addToast = (text: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Handlers
  const handleBookAppointmentClick = (hospital?: Hospital | null, doctor?: Doctor | null) => {
    setBookingModalState({ open: true, hospital, doctor });
  };

  const handleCreateAppointment = (newAptData: any) => {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      ...newAptData,
      status: 'Upcoming',
    };

    setAppointments((prev) => [newApt, ...prev]);
    setBookingModalState({ open: false });
    addToast(`Appointment booked with ${newAptData.doctorName} for ${newAptData.date} at ${newAptData.time}!`);
  };

  const handleReschedule = (apt: Appointment) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):', apt.date);
    if (!newDate) return;
    const newTime = prompt('Enter new time slot (e.g. 11:30 AM):', apt.time) || apt.time;

    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, date: newDate, time: newTime } : a))
    );
    addToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
      );
      addToast('Appointment has been cancelled.');
    }
  };

  const handleRefreshQueue = () => {
    setQueueToken((prev) => {
      const currentToken = Math.min(prev.userToken, prev.currentToken + 1);
      const peopleWaiting = Math.max(0, prev.userToken - currentToken);
      return {
        ...prev,
        currentToken,
        peopleWaiting,
        estimatedWaitMins: peopleWaiting * 5,
        status: currentToken === prev.userToken ? 'Called' : 'In Queue',
      };
    });
    addToast('OPD Queue refreshed. Updated live token status!');
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let aiReply = "Thank you for your inquiry. For specific medical conditions, please consult one of our verified specialists on Hospivio.";
      const lower = text.toLowerCase();

      if (lower.includes('headache') || lower.includes('fever')) {
        aiReply = "Common causes for mild fever or headache include dehydration, viral infections, or stress. Drink plenty of water and rest. If symptoms exceed 101°F or persist past 48 hours, please consult a General Physician.";
      } else if (lower.includes('heart') || lower.includes('blood pressure') || lower.includes('cardio')) {
        aiReply = "High blood pressure can be managed with low-sodium diet, regular exercise, and stress reduction. You can book an appointment with Dr. S. Ramesh Babu (Senior Cardiologist at ABC Hospital) directly from our Doctors page.";
      } else if (lower.includes('emergency') || lower.includes('ambulance')) {
        aiReply = "If you are experiencing severe chest pain, breathing difficulty, or trauma, please use our 1-click Emergency Hotline (108) or visit the Emergency page immediately.";
      } else if (lower.includes('report') || lower.includes('download')) {
        aiReply = "You can view and download all your diagnostic lab reports and prescriptions under the Health Records menu item on the sidebar.";
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleUploadRecord = (record: HealthRecord) => {
    setHealthRecords((prev) => [record, ...prev]);
    setShowUploadModal(false);
    addToast(`Medical record "${record.title}" uploaded successfully!`);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this health record permanently?')) {
      setHealthRecords((prev) => prev.filter((r) => r.id !== id));
      addToast('Record removed from health vault.');
    }
  };

  const handleDownloadRecord = (record: HealthRecord) => {
    addToast(`Downloading "${record.title}.${record.fileType.toLowerCase()}"...`);
  };

  // Full-screen standalone routes for Landing Login, Admin Login, and Admin Dashboard
  const isAuthPage = location.pathname === '/' || location.pathname === '/admin/login';
  const isAdminDashboard = location.pathname === '/admin/dashboard';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    );
  }

  if (isAdminDashboard) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f8fb' }}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={userSettings.name}
        />

        <Routes>
          <Route path="/" element={<LandingLoginPage />} />
          <Route
            path="/hospitals"
            element={
              <HospitalsPage
                hospitals={hospitals}
                searchQuery={searchQuery}
                onBookAppointment={(h, d) => handleBookAppointmentClick(h, d)}
                onOpenDoctorProfile={(d) => setSelectedDoctorProfile(d)}
              />
            }
          />
          <Route
            path="/doctors"
            element={
              <DoctorsPage
                doctors={doctors}
                searchQuery={searchQuery}
                onViewProfile={(d) => setSelectedDoctorProfile(d)}
                onBookAppointment={(d) => handleBookAppointmentClick(null, d)}
              />
            }
          />
          <Route
            path="/appointments"
            element={
              <AppointmentsPage
                appointments={appointments}
                onBookNewAppointment={() => handleBookAppointmentClick()}
                onRescheduleAppointment={handleReschedule}
                onCancelAppointment={handleCancelAppointment}
                onViewDetails={(apt) => {
                  const doc = doctors.find((d) => d.id === apt.doctorId);
                  if (doc) setSelectedDoctorProfile(doc);
                  else addToast(`Viewing appointment details for ${apt.doctorName}`);
                }}
              />
            }
          />
          <Route
            path="/queue"
            element={
              <QueuePage
                queueToken={queueToken}
                onRefreshQueue={handleRefreshQueue}
              />
            }
          />
          <Route
            path="/emergency"
            element={
              <EmergencyPage
                emergencyServices={EMERGENCY_SERVICES}
                onTriggerEmergencyCall={(hName, phone) =>
                  setEmergencyCallState({ open: true, hospitalName: hName, phone })
                }
                onFindNearestHospital={() => {
                  navigate('/hospitals');
                  addToast('Showing nearby hospitals sorted by distance.');
                }}
              />
            }
          />
          <Route
            path="/nearby"
            element={
              <NearbyPage
                facilities={NEARBY_FACILITIES}
                searchQuery={searchQuery}
                onOpenDirections={(fac) =>
                  addToast(`Opening map navigation to ${fac.name} (${fac.distance})...`)
                }
              />
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <AiAssistantPage
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClearHistory={() => {
                  setChatMessages(INITIAL_CHAT_MESSAGES);
                  addToast('Chat history reset.');
                }}
              />
            }
          />
          <Route
            path="/operations-simulator"
            element={<OperationsSimulatorPage />}
          />
          <Route
            path="/health-records"
            element={
              <HealthRecordsPage
                records={healthRecords}
                searchQuery={searchQuery}
                onUploadRecord={() => setShowUploadModal(true)}
                onViewRecord={(rec) => addToast(`Viewing preview of "${rec.title}"`)}
                onDownloadRecord={handleDownloadRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                settings={userSettings}
                onSaveSettings={(updated) => {
                  setUserSettings(updated);
                  addToast('Settings & profile updated!');
                }}
                onLogout={() => {
                  if (window.confirm('Log out of your Hospivio session?')) {
                    addToast('Logged out successfully.');
                  }
                }}
              />
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </div>

      {/* Modals */}
      {bookingModalState.open && (
        <BookAppointmentModal
          doctor={bookingModalState.doctor}
          hospital={bookingModalState.hospital}
          doctorsList={doctors}
          hospitalsList={hospitals}
          onClose={() => setBookingModalState({ open: false })}
          onSuccess={handleCreateAppointment}
        />
      )}

      {selectedDoctorProfile && (
        <DoctorProfileModal
          doctor={selectedDoctorProfile}
          onClose={() => setSelectedDoctorProfile(null)}
          onBookAppointment={(d) => handleBookAppointmentClick(null, d)}
        />
      )}

      {showUploadModal && (
        <UploadRecordModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadRecord}
        />
      )}

      {emergencyCallState.open && (
        <EmergencyCallModal
          hospitalName={emergencyCallState.hospitalName}
          phoneNumber={emergencyCallState.phone}
          onClose={() => setEmergencyCallState({ open: false, phone: '108' })}
        />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <CheckCircle2 size={16} color="#2fd0c8" />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
