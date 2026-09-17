import React, { useState } from 'react';
import type { Appointment } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  FileText,
  RotateCcw
} from 'lucide-react';

interface AppointmentsPageProps {
  appointments: Appointment[];
  onBookNewAppointment: () => void;
  onRescheduleAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onViewDetails: (appointment: Appointment) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  appointments,
  onBookNewAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
  onViewDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');

  const filteredAppointments = appointments.filter((apt) => apt.status === activeTab);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming':
        return <span className="badge on"><Clock size={12} /> Confirmed</span>;
      case 'Completed':
        return <span className="badge on" style={{ background: '#e9f7f1', color: '#12a06a' }}><CheckCircle2 size={12} /> Completed</span>;
      case 'Cancelled':
        return <span className="badge off" style={{ background: '#fdf1f1', color: '#d94a4a' }}><XCircle size={12} /> Cancelled</span>;
    }
  };

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1>Appointments</h1>
        <button className="btn" onClick={onBookNewAppointment}>
          <Plus size={16} /> Book New Appointment
        </button>
      </div>
      <p className="sub">
        Manage your upcoming consultations, view previous appointment history, or reschedule booking slots.
      </p>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'Upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('Upcoming')}
        >
          Upcoming ({appointments.filter(a => a.status === 'Upcoming').length})
        </button>
        <button
          className={`tab ${activeTab === 'Completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('Completed')}
        >
          Completed ({appointments.filter(a => a.status === 'Completed').length})
        </button>
        <button
          className={`tab ${activeTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('Cancelled')}
        >
          Cancelled ({appointments.filter(a => a.status === 'Cancelled').length})
        </button>
      </div>

      {/* Appointment Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--line)' }}>
            <Calendar size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>No {activeTab.toLowerCase()} appointments</div>
            <div style={{ color: 'var(--ink-2)', fontSize: '12.5px', marginTop: '4px' }}>
              {activeTab === 'Upcoming' ? 'You have no scheduled upcoming doctor visits.' : `No ${activeTab.toLowerCase()} appointment records found.`}
            </div>
            {activeTab === 'Upcoming' && (
              <button className="btn" style={{ marginTop: '16px' }} onClick={onBookNewAppointment}>
                <Plus size={14} /> Book Appointment Now
              </button>
            )}
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#dbe6f1', overflow: 'hidden', flex: '0 0 50px' }}>
                  <svg viewBox="0 0 64 64" width="100%" height="100%">
                    <rect width="64" height="64" fill="#e4edf5" />
                    <circle cx="32" cy="26" r="12" fill={apt.doctorSex === 'f' ? '#e8bfa0' : '#dcae8c'} />
                  </svg>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{apt.doctorName}</span>
                    {getStatusBadge(apt.status)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, marginTop: '2px' }}>
                    {apt.doctorSpec} • {apt.department}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--ink-2)', marginTop: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color="var(--ink-3)" /> {apt.hospitalName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} color="var(--ink-3)" /> {apt.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="var(--ink-3)" /> {apt.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn ghost"
                  style={{ fontSize: '11.5px' }}
                  onClick={() => onViewDetails(apt)}
                >
                  <FileText size={13} /> View Details
                </button>

                {apt.status === 'Upcoming' && (
                  <>
                    <button
                      className="btn ghost"
                      style={{ fontSize: '11.5px' }}
                      onClick={() => onRescheduleAppointment(apt)}
                    >
                      <RotateCcw size={13} /> Reschedule
                    </button>
                    <button
                      className="btn outline-danger"
                      style={{ fontSize: '11.5px' }}
                      onClick={() => onCancelAppointment(apt.id)}
                    >
                      <XCircle size={13} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
