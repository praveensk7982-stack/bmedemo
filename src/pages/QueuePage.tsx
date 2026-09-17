import React, { useState } from 'react';
import type { QueueToken } from '../types';
import { RefreshCw, Ticket } from 'lucide-react';

interface QueuePageProps {
  queueToken: QueueToken;
  onRefreshQueue: () => void;
}

export const QueuePage: React.FC<QueuePageProps> = ({ queueToken, onRefreshQueue }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshQueue();
      setIsRefreshing(false);
    }, 600);
  };

  const progressPercent = Math.min(100, Math.round((queueToken.currentToken / queueToken.userToken) * 100));

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1>Live OPD Queue & Waiting Tracker</h1>
        <button className="btn ghost" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          {isRefreshing ? 'Updating...' : 'Refresh Token Status'}
        </button>
      </div>
      <p className="sub">
        Track real-time OPD token numbers and estimated waiting duration for your scheduled hospital visit.
      </p>

      {/* Main Token Ticket Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b2440 0%, #0e7c86 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(11, 36, 64, 0.2)',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2fd0c8', fontSize: '12px', fontWeight: 600 }}>
              <Ticket size={16} /> LIVE OPD QUEUE TICKET
            </div>
            <h2 style={{ margin: '6px 0 2px', fontSize: '20px', fontWeight: 700 }}>{queueToken.hospitalName}</h2>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>{queueToken.department} • {queueToken.doctorName}</div>
          </div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span className="dot" style={{ background: '#2fd0c8' }} /> {queueToken.status}
          </span>
        </div>

        {/* Big Numbers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '24px 0 20px', background: 'rgba(0, 0, 0, 0.15)', padding: '16px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>Current Token Serving</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#2fd0c8', margin: '4px 0' }}>#{queueToken.currentToken}</div>
            <div style={{ fontSize: '10.5px', opacity: 0.8 }}>Inside Consultation Room</div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>Your Token Number</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '4px 0' }}>#{queueToken.userToken}</div>
            <div style={{ fontSize: '10.5px', opacity: 0.8 }}>Cardiology Counter 3</div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>People Ahead</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffe699', margin: '4px 0' }}>{queueToken.peopleWaiting}</div>
            <div style={{ fontSize: '10.5px', opacity: 0.8 }}>Patients in waiting room</div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>Est. Waiting Time</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#2fd0c8', margin: '4px 0' }}>~{queueToken.estimatedWaitMins}m</div>
            <div style={{ fontSize: '10.5px', opacity: 0.8 }}>Approx. 5 mins per patient</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px', opacity: 0.9 }}>
            <span>OPD Queue Progress</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#2fd0c8',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Visual Queue Cards */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px' }}>Live Token Progression Flow</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const tokNum = queueToken.currentToken + idx;
          const isUser = tokNum === queueToken.userToken;
          const isServing = idx === 0;

          return (
            <div
              key={idx}
              style={{
                background: isUser ? '#eef7f8' : '#fff',
                border: isUser ? '2px solid var(--teal)' : '1px solid var(--line)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: 'var(--shadow)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: isUser ? 'var(--teal)' : 'var(--ink-3)' }}>
                {isServing ? 'NOW SERVING' : (isUser ? 'YOUR TOKEN' : `WAITING STEP ${idx}`)}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: isServing ? 'var(--green)' : 'var(--ink)', margin: '6px 0' }}>
                #{tokNum}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-2)' }}>
                {isServing ? 'In Doctor Chamber' : (isUser ? 'Prepare to enter soon' : `~${idx * 5} mins wait`)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
