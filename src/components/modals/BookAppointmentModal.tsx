import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building2, Stethoscope, CheckCircle2 } from 'lucide-react';
import type { Doctor, Hospital } from '../../types';
import { getActivePatientSession } from '../../lib/userAuth';

interface BookAppointmentModalProps {
  doctor?: Doctor | null;
  hospital?: Hospital | null;
  doctorsList: Doctor[];
  hospitalsList: Hospital[];
  onClose: () => void;
  onSuccess: (appointment: {
    doctorId: string;
    doctorName: string;
    doctorSpec: string;
    doctorSex: 'm' | 'f';
    hospitalId: string;
    hospitalName: string;
    department: string;
    date: string;
    time: string;
    patientName: string;
    reason: string;
    fee: number;
  }) => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  doctor,
  hospital,
  doctorsList,
  hospitalsList,
  onClose,
  onSuccess,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    doctor?.hospitalId || hospital?.id || hospitalsList[0]?.id || ''
  );
  
  const availableDoctors = doctorsList.filter(d => d.hospitalId === selectedHospitalId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctor?.id || availableDoctors[0]?.id || ''
  );
  
  const activeDoctor = doctorsList.find(d => d.id === selectedDoctorId) || doctor || doctorsList[0];
  const activeHospital = hospitalsList.find(h => h.id === selectedHospitalId) || hospital || hospitalsList[0];

  const [date, setDate] = useState('2026-09-22');
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [patientName, setPatientName] = useState(() => getActivePatientSession().name);
  const [reason, setReason] = useState('General Consultation & Checkup');

  const timeSlots = ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !activeHospital) return;
    
    onSuccess({
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorSpec: activeDoctor.spec,
      doctorSex: activeDoctor.sex,
      hospitalId: activeHospital.id,
      hospitalName: activeHospital.name,
      department: activeDoctor.spec,
      date,
      time: timeSlot,
      patientName,
      reason,
      fee: activeDoctor.fee,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Medical Appointment</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label><Building2 size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Hospital</label>
              <select
                className="form-control"
                value={selectedHospitalId}
                onChange={(e) => {
                  setSelectedHospitalId(e.target.value);
                  const docs = doctorsList.filter(d => d.hospitalId === e.target.value);
                  if (docs.length > 0) setSelectedDoctorId(docs[0].id);
                }}
              >
                {hospitalsList.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label><Stethoscope size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Doctor & Specialty</label>
              <select
                className="form-control"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {availableDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.spec} (₹{d.fee})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label><Calendar size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Appointment Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min="2026-09-17"
                  required
                />
              </div>

              <div className="form-group">
                <label><Clock size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Time Slot</label>
                <select
                  className="form-control"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label><User size={14} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Patient Name</label>
              <input
                type="text"
                className="form-control"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason for Visit</label>
              <textarea
                className="form-control"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for appointment..."
              />
            </div>

            {activeDoctor && (
              <div style={{ background: '#eef7f8', border: '1px solid #cdeade', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#4f7d6b', fontWeight: 600 }}>Total Consultation Fee</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>₹{activeDoctor.fee}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal)', fontSize: '12px', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Instant Confirmation
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">Confirm & Book Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
