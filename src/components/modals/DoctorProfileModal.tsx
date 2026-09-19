import React, { useState } from 'react';
import { X, Star, Calendar, Award, GraduationCap, MapPin, CheckCircle2, Clock } from 'lucide-react';
import type { Doctor, Review } from '../../types';
import { MOCK_REVIEWS } from '../../lib/mockData';
import { InlineReviewForm } from '../reviews/InlineReviewForm';

interface DoctorProfileModalProps {
  doctor: Doctor;
  onClose: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onBookAppointment,
}) => {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [doctorReviews, setDoctorReviews] = useState<Review[]>(() => {
    try {
      const raw = localStorage.getItem(`hospivio_doctor_reviews_${doctor.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MOCK_REVIEWS;
  });

  const handleAddReview = (newReview: Review) => {
    const updated = [newReview, ...doctorReviews];
    setDoctorReviews(updated);
    try {
      localStorage.setItem(`hospivio_doctor_reviews_${doctor.id}`, JSON.stringify(updated));
    } catch (e) {}
    setShowInlineForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h2>Doctor Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header section */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#dbe6f1', flex: '0 0 80px', border: '3px solid #eef4f9' }}>
              <svg viewBox="0 0 64 64" width="100%" height="100%">
                <rect width="64" height="64" fill="#e4edf5" />
                <circle cx="32" cy="26" r="12" fill={doctor.sex === 'f' ? '#e8bfa0' : '#dcae8c'} />
                <circle cx="27.5" cy="27" r="1.5" fill="#2b2b2b" />
                <circle cx="36.5" cy="27" r="1.5" fill="#2b2b2b" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>{doctor.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '2px' }}>{doctor.qualification}</div>
                  <div style={{ display: 'inline-block', background: '#eef7f8', color: 'var(--teal)', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', marginTop: '6px' }}>
                    {doctor.spec}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>₹{doctor.fee}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ink-3)' }}>Per Consultation</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--ink-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} color="var(--teal)" /> {doctor.hospital}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={14} color="var(--teal)" /> {doctor.experienceYears} Years Exp.
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="var(--star)" color="var(--star)" /> {doctor.rating} ({doctorReviews.length + 200} reviews)
                </span>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--line)' }} />

          {/* About Doctor */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>About Doctor</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {doctor.about || `${doctor.name} is a highly qualified specialist at ${doctor.hospital} with over ${doctor.experienceYears} years of medical experience in advanced clinical diagnostics and treatment.`}
            </p>
          </div>

          {/* Education & Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--line)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: 'var(--ink)' }}>
                <GraduationCap size={16} color="var(--teal)" /> Education & Qualifications
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--ink-2)' }}>
                {doctor.education?.map((edu, idx) => <li key={idx} style={{ marginBottom: 4 }}>{edu}</li>) || <li>{doctor.qualification}</li>}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--line)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: 'var(--ink)' }}>
                <Clock size={16} color="var(--teal)" /> Availability & Hours
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-2)' }}>
                <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="var(--teal)" /> Days: {doctor.availableDays?.join(', ') || 'Mon - Sat'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} color={doctor.available ? 'var(--green)' : 'var(--ink-3)'} /> {doctor.when}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Reviews */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Recent Patient Reviews</h4>
              <button
                type="button"
                className="btn"
                onClick={() => setShowInlineForm((prev) => !prev)}
                style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Star size={12} fill="#fff" />
                {showInlineForm ? 'Close Form' : 'Leave a Review'}
              </button>
            </div>

            {/* Inline Review Form (Accordion expand/collapse) */}
            {showInlineForm && (
              <InlineReviewForm
                targetId={doctor.id}
                targetName={doctor.name}
                targetType="doctor"
                onClose={() => setShowInlineForm(false)}
                onSuccess={handleAddReview}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doctorReviews.map((rev) => (
                <div key={rev.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>{rev.patientName}</span>
                      {rev.isVoice && (
                        <span style={{ fontSize: '10px', background: '#ffe4e6', color: '#e11d48', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          🎙️ Voice Review
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{rev.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--star)', marginBottom: '6px' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="var(--star)" color="var(--star)" />
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{rev.comment}</div>
                  {rev.originalComment && (
                    <div style={{ marginTop: '6px', fontSize: '10.5px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569' }}>
                      🌐 Original ({rev.originalLanguage === 'ta' ? 'Tamil' : rev.originalLanguage}): "{rev.originalComment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn ghost" onClick={onClose}>Close</button>
          <button type="button" className="btn" onClick={() => { onClose(); onBookAppointment(doctor); }}>
            <Calendar size={15} /> Book Appointment (₹{doctor.fee})
          </button>
        </div>
      </div>
    </div>
  );
};
