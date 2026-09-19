import React, { useState } from 'react';
import type { Doctor, Review } from '../types';
import { InlineReviewForm } from '../components/reviews/InlineReviewForm';
import { 
  Star, 
  MapPin, 
  Award, 
  Clock, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface DoctorsPageProps {
  doctors: Doctor[];
  searchQuery: string;
  onViewProfile: (doctor: Doctor) => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  searchQuery,
  onViewProfile,
  onBookAppointment,
}) => {
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [activeReviewDoctorId, setActiveReviewDoctorId] = useState<string | null>(null);

  // Unique specializations list
  const specializations = ['All', ...Array.from(new Set(doctors.map((d) => d.spec)))];
  const hospitalNames = ['All', ...Array.from(new Set(doctors.map((d) => d.hospital)))];

  const filteredDoctors = doctors.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.spec.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q) ||
      d.qualification.toLowerCase().includes(q);

    const matchesSpec = selectedSpec === 'All' || d.spec === selectedSpec;
    const matchesHospital = selectedHospital === 'All' || d.hospital === selectedHospital;
    const matchesAvail =
      selectedAvailability === 'All' ||
      (selectedAvailability === 'Available' && d.available) ||
      (selectedAvailability === 'Busy' && !d.available);

    return matchesSearch && matchesSpec && matchesHospital && matchesAvail;
  });

  return (
    <div className="content">
      <h1>Doctors & Medical Specialists</h1>
      <p className="sub">
        Consult top doctors across leading hospitals. Book online or walk-in appointments instantly.
      </p>

      {/* Filters row */}
      <div className="filters">
        <div className="select">
          <select value={selectedSpec} onChange={(e) => setSelectedSpec(e.target.value)}>
            <option value="All">All Specializations</option>
            {specializations.filter(s => s !== 'All').map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="select">
          <select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)}>
            <option value="All">All Hospitals</option>
            {hospitalNames.filter(h => h !== 'All').map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="select">
          <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)}>
            <option value="All">All Availability</option>
            <option value="Available">Available Today</option>
            <option value="Busy">Next Available</option>
          </select>
        </div>
      </div>

      {/* Doctor cards grid */}
      <div className="doctors-grid">
        {filteredDoctors.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--line)' }}>
            <UserCheck size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>No doctors found matching criteria</div>
            <div style={{ color: 'var(--ink-2)', fontSize: '12.5px', marginTop: '4px' }}>Try selecting a different specialization or hospital filter.</div>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-head">
                <div className="doctor-photo">
                  <svg viewBox="0 0 64 64" width="100%" height="100%">
                    <rect width="64" height="64" fill="#e4edf5" />
                    <circle cx="32" cy="26" r="12" fill={doc.sex === 'f' ? '#e8bfa0' : '#dcae8c'} />
                    <path d="M20 24c0-9 6-13 12-13s12 4 12 13" fill={doc.sex === 'f' ? '#3a2a22' : '#2f2a26'} />
                  </svg>
                </div>

                <div className="doctor-info">
                  <div className="doctor-name">{doc.name}</div>
                  <div className="doctor-qual">{doc.qualification}</div>
                  <div className="doctor-spec">{doc.spec}</div>
                </div>
              </div>

              <div className="doctor-body">
                <div className="doctor-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="var(--teal)" /> {doc.hospital}
                  </span>
                </div>

                <div className="doctor-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Award size={13} color="var(--teal)" /> {doc.experienceYears} Years Experience
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--star)', fontWeight: 600 }}>
                    <Star size={13} fill="var(--star)" /> {doc.rating} ({doc.reviewsCount})
                  </span>
                </div>

                <div className="doctor-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} color="var(--ink-3)" /> {doc.when}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '13px' }}>
                    ₹{doc.fee}
                  </span>
                </div>

                <div className="doctor-row">
                  <span className={`badge ${doc.available ? 'on' : 'off'}`}>
                    {doc.available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {doc.available ? 'Available Online & Clinic' : 'Busy / Next Available'}
                  </span>
                </div>
              </div>

              <div className="doctor-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setActiveReviewDoctorId((prev) => (prev === doc.id ? null : doc.id))}
                  style={{ fontSize: '11px', padding: '6px 10px', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Star size={12} fill="var(--star)" color="var(--star)" />
                  {activeReviewDoctorId === doc.id ? 'Close Form' : 'Leave Review'}
                </button>

                <button
                  className="btn ghost"
                  onClick={() => onViewProfile(doc)}
                >
                  View Profile
                </button>
                <button
                  className="btn"
                  onClick={() => onBookAppointment(doc)}
                >
                  <Calendar size={13} /> Book Appointment
                </button>
              </div>

              {/* Inline Expandable Review Form for Doctor Card */}
              {activeReviewDoctorId === doc.id && (
                <div style={{ padding: '0 12px 12px' }}>
                  <InlineReviewForm
                    targetId={doc.id}
                    targetName={doc.name}
                    targetType="doctor"
                    onClose={() => setActiveReviewDoctorId(null)}
                    onSuccess={(newReview) => {
                      try {
                        const raw = localStorage.getItem(`hospivio_doctor_reviews_${doc.id}`);
                        const existing: Review[] = raw ? JSON.parse(raw) : [];
                        const updated = [newReview, ...existing];
                        localStorage.setItem(`hospivio_doctor_reviews_${doc.id}`, JSON.stringify(updated));
                      } catch (e) {}
                      setActiveReviewDoctorId(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
