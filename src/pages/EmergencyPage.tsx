import React from 'react';
import type { EmergencyService } from '../types';
import { 
  PhoneCall, 
  MapPin, 
  Navigation, 
  Ambulance, 
  Droplet, 
  ShieldAlert
} from 'lucide-react';

interface EmergencyPageProps {
  emergencyServices: EmergencyService[];
  onTriggerEmergencyCall: (hospitalName: string, phone: string) => void;
  onFindNearestHospital: () => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({
  emergencyServices,
  onTriggerEmergencyCall,
  onFindNearestHospital,
}) => {
  return (
    <div className="content">
      {/* Red Alert Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #d94a4a 0%, #a82e2e 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(217, 74, 74, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <ShieldAlert size={18} /> 24/7 National Emergency Hotline
          </div>
          <h2 style={{ margin: '6px 0 4px', fontSize: '24px', fontWeight: 800 }}>Medical Emergency Support</h2>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            For immediate life-threatening medical care, trauma response, or urgent ambulance dispatch.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{ background: '#fff', color: '#d94a4a', fontWeight: 700, fontSize: '13.5px', padding: '12px 20px', borderRadius: '10px' }}
            onClick={() => onTriggerEmergencyCall('Hospivio Emergency Central Hotline', '108')}
          >
            <PhoneCall size={16} /> Call Emergency (108)
          </button>
          <button
            className="btn"
            style={{ background: 'rgba(0,0,0,0.25)', color: '#fff', fontWeight: 600, fontSize: '13px', padding: '12px 18px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px' }}
            onClick={onFindNearestHospital}
          >
            <Navigation size={16} /> Find Nearest ER Hospital
          </button>
        </div>
      </div>

      <h1>Nearby Emergency Hospitals & Trauma Care</h1>
      <p className="sub">
        Real-time emergency department availability, direct ER phone numbers, ambulance lines, and blood bank lookup.
      </p>

      {/* Emergency Hospitals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
        {emergencyServices.map((emg) => (
          <div
            key={emg.id}
            style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: '14px',
              padding: '18px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{emg.hospitalName}</h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '12px',
                    background: emg.erAvailability === 'Available' ? '#e9f7f1' : '#fdf1f1',
                    color: emg.erAvailability === 'Available' ? '#12a06a' : '#d94a4a',
                    border: `1px solid ${emg.erAvailability === 'Available' ? '#cdeade' : '#f7d4d4'}`
                  }}
                >
                  ER Status: {emg.erAvailability}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-2)', marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} color="var(--teal)" /> {emg.address}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Navigation size={14} color="var(--teal)" /> {emg.distance} away
                </span>
              </div>

              {/* Blood Bank Info */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11.5px' }}>
                <Droplet size={14} color="#d94a4a" />
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Blood Bank Stock:</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {emg.bloodGroupsAvailable.map((grp) => (
                    <span key={grp} style={{ background: '#fdf1f1', color: '#d94a4a', fontWeight: 700, fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                      {grp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn ghost"
                onClick={() => onTriggerEmergencyCall(`${emg.hospitalName} Ambulance`, emg.ambulancePhone)}
              >
                <Ambulance size={14} /> Ambulance ({emg.ambulancePhone})
              </button>
              <button
                className="btn danger"
                onClick={() => onTriggerEmergencyCall(emg.hospitalName, emg.erPhone)}
              >
                <PhoneCall size={14} /> Call ER ({emg.erPhone})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ambulance & Blood Bank quick info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#e9f7f1', color: '#12a06a', display: 'grid', placeItems: 'center' }}>
              <Ambulance size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>Hospivio Ambulance Network</div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>Average Dispatch Time: &lt;8 mins</div>
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Equipped with Advanced Life Support (ALS), ICU oxygen systems, and trained paramedics on call.
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#fdf1f1', color: '#d94a4a', display: 'grid', placeItems: 'center' }}>
              <Droplet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>24/7 Blood Bank Registry</div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>Live inventory updated hourly</div>
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Verified donor network with immediate release for emergency surgery or transfusion needs.
          </div>
        </div>
      </div>
    </div>
  );
};
