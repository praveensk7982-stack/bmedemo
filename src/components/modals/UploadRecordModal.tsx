import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import type { HealthRecord } from '../../types';

interface UploadRecordModalProps {
  onClose: () => void;
  onSuccess: (record: HealthRecord) => void;
}

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HealthRecord['category']>('Prescription');
  const [doctorName, setDoctorName] = useState('Dr. S. Ramesh Babu');
  const [hospitalName, setHospitalName] = useState('ABC Hospital');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSuccess({
      id: `rec-${Date.now()}`,
      title,
      category,
      date: new Date().toISOString().split('T')[0],
      doctorName,
      hospitalName,
      fileSize: fileSize || '1.2 MB',
      fileType: fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') ? 'JPG' : 'PDF',
      notes,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Health Record</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Record Document / File</label>
              <div
                style={{
                  border: '2px dashed var(--line)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload size={28} color="var(--teal)" style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                  {fileName ? fileName : 'Click to choose file or drag & drop'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: 4 }}>
                  Supports PDF, JPG, PNG, DOCX up to 25 MB
                </div>
                <input
                  id="file-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Record Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Annual Echocardiogram Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HealthRecord['category'])}
                >
                  <option value="Prescription">Prescription</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Scan Report">Scan Report</option>
                  <option value="Doctor Note">Doctor Note</option>
                  <option value="Appointment Summary">Appointment Summary</option>
                </select>
              </div>

              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Hospital / Clinic Name</label>
              <input
                type="text"
                className="form-control"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Doctor Notes / Remarks</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Add optional notes or lab values..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn">
              <FileText size={15} /> Upload & Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
