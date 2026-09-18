import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getStoredAdminSession, 
  setStoredAdminSession, 
  getHospitalTokens, 
  updateTokenStatus, 
  addWalkInToken, 
  getHospitalSummaryMetrics,
  ADMIN_HOSPITALS 
} from '../lib/adminAuth';
import type { AdminToken, AdminTokenStatus, AdminSession } from '../types';
import { 
  LogOut, 
  RefreshCw, 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck,
  Activity,
  Star,
  Lock,
  MessageSquareQuote
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Session state
  const [session, setSession] = useState<AdminSession | null>(getStoredAdminSession());

  // Tokens & metrics state
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(30);

  // Filters state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast / notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Issue Walk-in Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<string>('');
  const [newDoctorName, setNewDoctorName] = useState<string>('');

  // Check login session on mount
  useEffect(() => {
    const activeSession = getStoredAdminSession();
    if (!activeSession) {
      navigate('/admin/login');
    } else {
      setSession(activeSession);
      loadHospitalData(activeSession.hospitalId);
    }
  }, [navigate]);

  // Load tokens for current hospital
  const loadHospitalData = (hospId: string) => {
    const list = getHospitalTokens(hospId);
    setTokens(list);
    setLastSyncedTime(new Date().toLocaleTimeString());
  };

  // 30-second Auto Refresh Timer
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadHospitalData(session.hospitalId);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const handleManualSync = () => {
    if (!session) return;
    loadHospitalData(session.hospitalId);
    setRefreshCountdown(30);
    showToast("Live data force-refreshed from database.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    setStoredAdminSession(null);
    navigate('/admin/login');
  };

  // Status Action Handlers
  const handleAction = (tokenId: string, tokenNo: string, patientName: string, actionStatus: AdminTokenStatus) => {
    if (!session) return;

    const updated = updateTokenStatus(session.hospitalId, tokenId, actionStatus);
    setTokens(updated);

    if (actionStatus === 'In Progress') {
      showToast(`📢 Called Next: Token #${tokenNo} (${patientName}) sent to Consultation OPD.`);
    } else if (actionStatus === 'Completed') {
      showToast(`✅ Token #${tokenNo} (${patientName}) marked as COMPLETED.`);
    } else if (actionStatus === 'No-show') {
      showToast(`❌ Token #${tokenNo} (${patientName}) marked as CANCELLED / NO-SHOW.`);
    }
  };

  // Add Walk-in token handler
  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newPatientName.trim() || !newDepartment) return;

    const updated = addWalkInToken(session.hospitalId, newPatientName.trim(), newDepartment, newDoctorName.trim());
    setTokens(updated);
    setShowAddModal(false);
    setNewPatientName('');
    setNewDepartment('');
    setNewDoctorName('');
    showToast(`➕ New walk-in token issued for ${newPatientName}!`);
  };

  if (!session) return null;

  const currentHospitalConfig = ADMIN_HOSPITALS.find(h => h.id === session.hospitalId);
  const metrics = getHospitalSummaryMetrics(tokens);

  // Filtered Tokens List
  const filteredTokens = tokens.filter((tok) => {
    // Department filter
    if (selectedDepartment !== 'ALL' && tok.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'ALL' && tok.status !== selectedStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tok.patientName.toLowerCase().includes(q);
      const matchNo = tok.tokenNo.toLowerCase().includes(q);
      const matchDept = tok.department.toLowerCase().includes(q);
      const matchDoc = tok.doctorName.toLowerCase().includes(q);
      if (!matchName && !matchNo && !matchDept && !matchDoc) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f4f8fb', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div style={{ position: 'fixed', top: '80px', right: '24px', background: '#0e7c86', color: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(14, 124, 134, 0.3)', zIndex: 1000, fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn 0.2s ease' }}>
            <Volume2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #bcd3e4', padding: '16px 24px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(15, 39, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Hospivio Logo Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', color: '#fff', padding: '8px 14px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(22, 163, 174, 0.25)' }}>
              <Activity size={20} />
              <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px' }}>Hospivio</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Admin</span>
            </div>

            <div style={{ height: '28px', width: '1px', background: 'var(--line)' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: 'var(--ink)' }}>
                  {session.hospitalName}
                </h1>
                <span className="badge on" style={{ fontSize: '11px' }}>
                  <ShieldCheck size={12} /> Live Hospital Control
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>📍 Data Scoped: <b>{session.hospitalName} Only</b></span>
                <span>•</span>
                <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Sync Active ({refreshCountdown}s)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn ghost"
              onClick={handleManualSync}
              title="Force Sync Live Data"
              style={{ fontSize: '12.5px', height: '38px', padding: '0 14px', borderRadius: '8px' }}
            >
              <RefreshCw size={14} className={refreshCountdown === 30 ? "spin" : ""} />
              <span>Sync Live ({refreshCountdown}s)</span>
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => setShowAddModal(true)}
              style={{ fontSize: '12.5px', height: '38px', padding: '0 16px', borderRadius: '8px' }}
            >
              <Plus size={15} />
              <span>Issue Walk-in Token</span>
            </button>

            <button
              type="button"
              className="btn danger"
              onClick={handleLogout}
              style={{ fontSize: '12.5px', height: '38px', padding: '0 14px', borderRadius: '8px' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY CARDS AT TOP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          {/* Card 1: Total Appointments Today */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #bcd3e4', padding: '18px 20px', boxShadow: '0 2px 8px rgba(15, 39, 68, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Total Appointments Today</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef7f8', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
                <Calendar size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>{metrics.totalAppointmentsToday}</div>
            <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>Scheduled & Walk-ins Combined</div>
          </div>

          {/* Card 2: Total Tokens Issued Today */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #bcd3e4', padding: '18px 20px', boxShadow: '0 2px 8px rgba(15, 39, 68, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Total Tokens Issued Today</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a' }}>{metrics.totalTokensIssuedToday}</div>
            <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>{metrics.totalCompleted} Completed • {metrics.totalNoShow} No-shows</div>
          </div>

          {/* Card 3: Total Tokens Currently Waiting / In Queue */}
          <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbf0 100%)', borderRadius: '14px', border: '1px solid #f59e0b', padding: '18px 20px', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>Currently Waiting / In Queue</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#b45309' }}>{metrics.totalTokensWaiting}</div>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>{metrics.totalInProgress} Token(s) In Progress Now</div>
          </div>

          {/* Card 4: Average Waiting Time */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #bcd3e4', padding: '18px 20px', boxShadow: '0 2px 8px rgba(15, 39, 68, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Average Waiting Time</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#0284c7' }}>{metrics.avgWaitMins} <span style={{ fontSize: '14px', fontWeight: 600 }}>mins</span></div>
            <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>Real-time OPD Token Movement</div>
          </div>

        </div>

        {/* CONTROLS BAR: Filters & Search */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #bcd3e4', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
              <Search size={15} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search Patient Name or Token No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', borderRadius: '8px', fontSize: '12.5px' }}
              />
            </div>

            {/* Department Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--ink-2)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Dept:</span>
              <select
                className="form-control"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ height: '38px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, width: '170px' }}
              >
                <option value="ALL">All Departments</option>
                {currentHospitalConfig?.departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}>Status:</span>
              <select
                className="form-control"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ height: '38px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, width: '150px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Waiting">Waiting</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="No-show">No-show</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--ink-2)', fontWeight: 600 }}>
            Showing <b>{filteredTokens.length}</b> of <b>{tokens.length}</b> tokens
          </div>
        </div>

        {/* LIVE TABLE OF TODAY'S TOKENS */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #bcd3e4', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15, 39, 68, 0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Today's Tokens Live Queue ({session.hospitalName})</span>
            </h2>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>Last synced at {lastSyncedTime}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--line)', color: 'var(--ink-2)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Token No.</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Patient Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Age / Phone</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Department & Doctor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-2)' }}>
                      <Users size={32} color="var(--ink-3)" style={{ marginBottom: 8 }} />
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>No tokens found for current filter selection.</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: 4 }}>Try clearing search or department filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((tok) => {
                    const isWaiting = tok.status === 'Waiting';
                    const isInProgress = tok.status === 'In Progress';
                    const isCompleted = tok.status === 'Completed';
                    const isNoShow = tok.status === 'No-show';

                    return (
                      <tr 
                        key={tok.id} 
                        style={{ 
                          borderBottom: '1px solid var(--line)',
                          background: isInProgress ? '#f0fdf4' : isWaiting ? '#ffffff' : '#fafafa',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Token No. */}
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--ink)' }}>
                          <span style={{ background: '#eef7f8', border: '1px solid #cdeade', color: 'var(--teal)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                            {tok.tokenNo}
                          </span>
                        </td>

                        {/* Patient Name */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{tok.patientName}</div>
                        </td>

                        {/* Age / Phone */}
                        <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--ink-2)' }}>
                          <div>{tok.ageSex || 'N/A'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{tok.patientPhone}</div>
                        </td>

                        {/* Department & Doctor */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: '12.5px' }}>{tok.department}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--ink-3)' }}>{tok.doctorName}</div>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '14px 16px' }}>
                          {isWaiting && (
                            <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} /> Waiting
                            </span>
                          )}
                          {isInProgress && (
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Volume2 size={12} className="pulse" /> In Progress
                            </span>
                          )}
                          {isCompleted && (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> Completed
                            </span>
                          )}
                          {isNoShow && (
                            <span style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <XCircle size={12} /> No-show
                            </span>
                          )}
                        </td>

                        {/* ACTION BUTTONS */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            
                            {/* Action 1: Call Next */}
                            <button
                              type="button"
                              className="btn"
                              onClick={() => handleAction(tok.id, tok.tokenNo, tok.patientName, 'In Progress')}
                              disabled={isInProgress}
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                height: '30px',
                                background: isInProgress ? '#15803d' : undefined,
                                opacity: isInProgress ? 0.7 : 1
                              }}
                              title="Call patient into doctor consultation room"
                            >
                              <Volume2 size={12} />
                              <span>{isInProgress ? 'Called' : 'Call Next'}</span>
                            </button>

                            {/* Action 2: Mark Completed */}
                            <button
                              type="button"
                              className="btn"
                              onClick={() => handleAction(tok.id, tok.tokenNo, tok.patientName, 'Completed')}
                              disabled={isCompleted}
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                height: '30px',
                                background: '#16a34a',
                                opacity: isCompleted ? 0.5 : 1
                              }}
                              title="Mark consultation completed"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Completed</span>
                            </button>

                            {/* Action 3: Cancel / No-show */}
                            <button
                              type="button"
                              className="btn danger"
                              onClick={() => handleAction(tok.id, tok.tokenNo, tok.patientName, 'No-show')}
                              disabled={isNoShow}
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                height: '30px',
                                opacity: isNoShow ? 0.5 : 1
                              }}
                              title="Mark patient as No-show / Cancelled"
                            >
                              <XCircle size={12} />
                              <span>Cancel</span>
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* READ-ONLY PATIENT REVIEWS SECTION FOR ADMIN */}
        {(() => {
          const getActiveHospitalReviews = () => {
            if (!session) return [];
            try {
              const raw = localStorage.getItem(`hospivio_patient_reviews_${session.hospitalId}`);
              if (raw) return JSON.parse(raw);
            } catch (e) {}
            return [
              {
                id: 'rev-mock-1',
                hospitalId: session.hospitalId,
                patientName: 'Ramesh Kumar',
                rating: 5,
                date: 'Sep 18, 2026',
                comment: 'Excellent cardiology consultation and smooth OPD queue movement. Very polite staff.',
                isVoice: true
              },
              {
                id: 'rev-mock-2',
                hospitalId: session.hospitalId,
                patientName: 'Meena Sundaram',
                rating: 4,
                date: 'Sep 15, 2026',
                comment: 'Doctor explained everything clearly in Tamil. Good cleanliness and facility.',
                originalComment: 'மருத்துவர் மிக தெளிவாக விளக்கினார். நல்ல வசதிகள்.',
                originalLanguage: 'ta',
                isVoice: true
              }
            ];
          };
          const hospitalReviews = getActiveHospitalReviews();

          return (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #bcd3e4', padding: '20px 24px', marginTop: '24px', boxShadow: '0 4px 16px rgba(15, 39, 68, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MessageSquareQuote size={20} color="var(--teal)" />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
                      Patient Feedback & Reviews ({hospitalReviews.length})
                    </h2>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                      Authentic patient-submitted voice & text reviews for {session.hospitalName}
                    </div>
                  </div>
                </div>

                {/* Critical Admin Immutability Notice Badge */}
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} />
                  <span>Read-Only Mode: Hospital staff cannot edit, alter, or delete patient reviews</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {hospitalReviews.map((rev: any) => (
                  <div key={rev.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'grid', placeItems: 'center' }}>
                          {rev.patientName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{rev.patientName}</span>
                        {rev.isVoice && (
                          <span style={{ fontSize: '10px', background: '#ffe4e6', color: '#e11d48', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            🎙️ Voice
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{rev.date}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: '6px' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={rev.rating >= i + 1 ? '#f5a623' : 'none'} color="#f5a623" />
                      ))}
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink)', marginLeft: 4 }}>{rev.rating}.0 / 5.0</span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.45, fontWeight: 500 }}>
                      "{rev.comment}"
                    </div>

                    {rev.originalComment && (
                      <div style={{ marginTop: '8px', fontSize: '11px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', color: '#475569' }}>
                        🌐 Original ({rev.originalLanguage === 'ta' ? 'Tamil' : rev.originalLanguage}): "{rev.originalComment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* WALK-IN TOKEN MODAL */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 25, 46, 0.5)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: '16px' }}>
            <div style={{ background: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.2)', padding: '24px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>Issue Walk-in OPD Token</h3>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-3)' }}>
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAddWalkIn}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>Patient Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter patient full name..."
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    required
                    style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>Department *</label>
                  <select
                    className="form-control"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    required
                    style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                  >
                    <option value="">-- Select Department --</option>
                    {currentHospitalConfig?.departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>Doctor Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter attending doctor name..."
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn">Issue Token</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
