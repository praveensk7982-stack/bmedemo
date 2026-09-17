import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  LogOut, 
  Save, 
  CheckCircle2
} from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onSaveSettings: (updated: UserSettings) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'preferences' | 'security'>('profile');
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (field: keyof UserSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="content">
      <h1>Settings & Account Control</h1>
      <p className="sub">
        Manage your profile details, notification preferences, privacy options, language & theme.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Settings Navigation Sidebar */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '8px', boxShadow: 'var(--shadow)' }}>
          <button
            className={`btn ${activeTab === 'profile' ? '' : 'ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Profile Settings
          </button>

          <button
            className={`btn ${activeTab === 'notifications' ? '' : 'ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} /> Notifications
          </button>

          <button
            className={`btn ${activeTab === 'privacy' ? '' : 'ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={16} /> Privacy & Data
          </button>

          <button
            className={`btn ${activeTab === 'preferences' ? '' : 'ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
            onClick={() => setActiveTab('preferences')}
          >
            <Globe size={16} /> Language & Theme
          </button>

          <button
            className={`btn ${activeTab === 'security' ? '' : 'ghost'}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 12 }}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={16} /> Change Password
          </button>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            <button
              className="btn outline-danger"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={onLogout}
            >
              <LogOut size={16} /> Logout Account
            </button>
          </div>
        </div>

        {/* Settings Form Body */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <form onSubmit={handleSave}>
            {activeTab === 'profile' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Profile Information</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Blood Group</label>
                    <select
                      className="form-control"
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Emergency Contact Line</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.emergencyContact}
                      onChange={(e) => handleChange('emergencyContact', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Notification Preferences</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    />
                    <span>Receive Email confirmations for appointment updates & lab reports</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    />
                    <span>Send SMS alerts for emergency & queue token changes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.appointmentReminders}
                      onChange={(e) => handleChange('appointmentReminders', e.target.checked)}
                    />
                    <span>Automatic 24-hour doctor consultation reminders</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Privacy & Data Controls</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Hospivio is fully HIPAA and DISHA compliant. Your health records and medical history are encrypted and shared exclusively with authorized doctors during consultations.
                </p>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginTop: '14px', fontSize: '12.5px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Doctor Record Access Policy</div>
                  <div style={{ color: 'var(--ink-3)', marginTop: 4 }}>Access is restricted to active appointment windows.</div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Language & Application Theme</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select
                      className="form-control"
                      value={formData.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>App Theme</label>
                    <select
                      className="form-control"
                      value={formData.theme}
                      onChange={(e) => handleChange('theme', e.target.value as any)}
                    >
                      <option value="light">Hospivio Light Blue (Default)</option>
                      <option value="dark">Dark Theme</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Change Password</h3>

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              {isSaved ? (
                <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Settings saved successfully!
                </span>
              ) : (
                <span />
              )}

              <button type="submit" className="btn">
                <Save size={15} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
