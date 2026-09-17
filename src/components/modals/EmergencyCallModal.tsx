import React from 'react';
import { X, PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EmergencyCallModalProps {
  hospitalName?: string;
  phoneNumber: string;
  onClose: () => void;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  hospitalName = "Hospivio Central Emergency Dispatch",
  phoneNumber,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className="modal-header" style={{ border: 0, paddingBottom: 0 }}>
          <div />
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0 24px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fdf1f1',
              border: '1px solid #f7d4d4',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              color: '#d94a4a'
            }}
          >
            <PhoneCall size={32} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>
            Connecting Emergency Line
          </h2>

          <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '16px' }}>
            {hospitalName}
          </div>

          <div
            style={{
              background: '#0b2440',
              color: '#2fd0c8',
              fontSize: '24px',
              fontWeight: 700,
              padding: '14px',
              borderRadius: '12px',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}
          >
            {phoneNumber}
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid var(--line)', borderRadius: '10px', padding: '12px', textAlign: 'left', fontSize: '11.5px', color: 'var(--ink-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d94a4a', fontWeight: 700, marginBottom: 4 }}>
              <AlertTriangle size={14} /> Immediate Action Required?
            </div>
            <div>Stay calm. Keep line open and share location: <b>Greams Road Area, Chennai</b> with dispatcher.</div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn ghost" onClick={onClose}>End Call</button>
          <a href={`tel:${phoneNumber}`} className="btn danger" style={{ textDecoration: 'none' }}>
            <ShieldCheck size={16} /> Dial {phoneNumber} Now
          </a>
        </div>
      </div>
    </div>
  );
};
