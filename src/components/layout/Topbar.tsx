import React, { useState } from 'react';
import { Search, Bell, Mic, Menu, ChevronDown, CheckCircle2, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userName: string;
  userRole?: string;
}

// Helper to convert Tamil or alias search terms for hospital search
function interpretTamilHospitalSearch(query: string): string {
  const q = query.toLowerCase().trim();
  if (!q) return '';
  if (q.includes('அப்போலோ') || q.includes('அப்பல்லோ') || q.includes('abc')) return 'ABC Hospital';
  if (q.includes('மியாட்') || q.includes('மையாட்') || q.includes('மியாயாட்')) return 'MIOT International Hospital';
  if (q.includes('எஸ்ஆர்எம்') || q.includes('எஸ் ஆர் எம்') || q.includes('எஸ்.ஆர்.எம்')) return 'SRM Global Hospitals';
  if (q.includes('மெட்ராஸ்') || q.includes('எம்எம்சி') || q.includes('எம்.எம்.சி') || q.includes('அரசு மருத்துவமனை')) return 'Madras Medical College';
  if (q.includes('சிம்ஸ்')) return 'SIMS Hospital';
  if (q.includes('காவேரி')) return 'Kauvery Hospital';
  if (q.includes('போர்டிஸ்')) return 'Fortis Hospital';
  return query;
}

export const Topbar: React.FC<TopbarProps> = ({
  onMenuToggle,
  searchQuery,
  onSearchChange,
  userName,
  userRole = 'Patient',
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [inputVal, setInputVal] = useState(searchQuery);

  React.useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Independent Global Speech Recognition State
  const [isListeningGlobal, setIsListeningGlobal] = useState(false);
  const [globalSpeechError, setGlobalSpeechError] = useState<string | null>(null);
  const [globalLang, setGlobalLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');

  const notifications = [
    { id: 1, title: "Appointment Reminder", text: "Dr. S. Ramesh Babu consultation on Sep 20, 10:30 AM", time: "10m ago" },
    { id: 2, title: "Lab Report Ready", text: "Comprehensive Lipid Profile report is ready to view", time: "2h ago" },
    { id: 3, title: "Queue Update", text: "Token #19 for Cardiology OPD is currently 4 tokens away", time: "5h ago" }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interpreted = interpretTamilHospitalSearch(inputVal);
    onSearchChange(interpreted || inputVal);
  };

  const startGlobalVoiceSearch = () => {
    setGlobalSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setGlobalSpeechError('Web Speech API is not supported on this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = globalLang;

      recognition.onstart = () => {
        setIsListeningGlobal(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const interpreted = interpretTamilHospitalSearch(transcript);
          setInputVal(interpreted || transcript);
          onSearchChange(interpreted || transcript);
        }
        setIsListeningGlobal(false);
      };

      recognition.onerror = (event: any) => {
        setIsListeningGlobal(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setGlobalSpeechError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          setGlobalSpeechError(`Voice search error (${event.error}). Please click mic to try again.`);
        }
      };

      recognition.onend = () => {
        setIsListeningGlobal(false);
      };

      recognition.start();
    } catch (err) {
      setIsListeningGlobal(false);
      setGlobalSpeechError('Microphone permission check failed.');
    }
  };

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuToggle} aria-label="Open menu">
        <Menu size={18} />
      </button>

      <form className="search" onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search className="ic l" size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
        <input
          id="q"
          type="search"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            onSearchChange(e.target.value);
          }}
          placeholder={isListeningGlobal ? "Listening... Speak now in Tamil or English" : "Search hospitals, doctors, departments, or records..."}
          style={{ paddingLeft: '36px', paddingRight: '160px', height: '40px' }}
        />

        {/* Right Controls: Language Selector + Voice Mic + GREEN Search Button */}
        <div style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 5 }}>
          <button
            type="button"
            onClick={() => setGlobalLang(globalLang === 'ta-IN' ? 'en-IN' : 'ta-IN')}
            title={`Switch Global Voice Language (Current: ${globalLang === 'ta-IN' ? 'Tamil' : 'English'})`}
            style={{ fontSize: '10px', fontWeight: 700, color: 'var(--teal)', background: '#eef7f8', border: '1px solid #cdeade', padding: '3px 6px', borderRadius: '5px', cursor: 'pointer' }}
          >
            {globalLang === 'ta-IN' ? 'தமிழ்' : 'EN'}
          </button>
          
          <button
            type="button"
            onClick={startGlobalVoiceSearch}
            title={isListeningGlobal ? "Global Voice Search: Listening..." : "Global Voice Search (Tamil / English)"}
            style={{
              background: isListeningGlobal ? '#d94a4a' : '#eef7f8',
              color: isListeningGlobal ? '#fff' : 'var(--teal)',
              border: '1px solid #cdeade',
              borderRadius: '6px',
              padding: '5px 7px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: isListeningGlobal ? '0 0 0 3px rgba(217, 74, 74, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isListeningGlobal ? <Volume2 size={14} className="pulse" /> : <Mic size={14} />}
          </button>

          {/* Top Search Button - Blue style matching 'Find Hospitals' button */}
          <button
            type="submit"
            className="btn"
            title="Search"
            style={{
              height: '32px',
              padding: '0 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Search size={14} />
            <span>Search</span>
          </button>
        </div>

        {globalSpeechError && (
          <div style={{ position: 'absolute', top: '46px', left: 0, right: 0, background: '#fdf1f1', color: '#d94a4a', border: '1px solid #f7d4d4', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', zIndex: 110 }}>
            {globalSpeechError}
          </div>
        )}
      </form>

      <div className="topbar-right">
        <div style={{ position: 'relative' }}>
          <button
            className="bell"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="badge">{notifications.length}</span>
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '320px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(11, 36, 64, 0.15)',
                border: '1px solid var(--line)',
                zIndex: 100,
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ display: 'flex', gap: '10px', fontSize: '12px', padding: '8px', borderRadius: '8px', background: '#f8fafc' }}>
                    <CheckCircle2 size={16} color="var(--teal)" style={{ flex: '0 0 16px', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{n.title}</div>
                      <div style={{ color: 'var(--ink-2)', fontSize: '11px', marginTop: '2px' }}>{n.text}</div>
                      <div style={{ color: 'var(--ink-3)', fontSize: '10px', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="user" onClick={() => navigate('/settings')}>
          <span className="avatar">
            <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
              <rect width="64" height="64" fill="#cfe0ee" />
              <circle cx="32" cy="25" r="11" fill="#7f96ab" />
              <path d="M8 62c2-14 12-21 24-21s22 7 24 21z" fill="#5b7085" />
              <path d="M22 44c3 6 17 6 20 0l-4-3H26z" fill="#e9eff5" />
            </svg>
          </span>
          <span>
            <span className="n" style={{ display: 'block' }}>{userName}</span>
            <span className="r" style={{ display: 'block' }}>{userRole || 'Patient'}</span>
          </span>
          <ChevronDown size={14} color="#8296ab" />
        </div>
      </div>
    </header>
  );
};
