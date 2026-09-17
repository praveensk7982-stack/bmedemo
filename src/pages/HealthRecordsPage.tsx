import React, { useState } from 'react';
import type { HealthRecord } from '../types';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Plus
} from 'lucide-react';

interface HealthRecordsPageProps {
  records: HealthRecord[];
  searchQuery: string;
  onUploadRecord: () => void;
  onViewRecord: (record: HealthRecord) => void;
  onDownloadRecord: (record: HealthRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const HealthRecordsPage: React.FC<HealthRecordsPageProps> = ({
  records,
  searchQuery,
  onUploadRecord,
  onViewRecord,
  onDownloadRecord,
  onDeleteRecord,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Prescription', 'Lab Report', 'Scan Report', 'Doctor Note', 'Appointment Summary'];

  const filtered = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.doctorName.toLowerCase().includes(q) ||
      rec.hospitalName.toLowerCase().includes(q) ||
      (rec.notes && rec.notes.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'All' || rec.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1>Health Records & Documents</h1>
        <button className="btn" onClick={onUploadRecord}>
          <Upload size={15} /> Upload Record
        </button>
      </div>
      <p className="sub">
        Secure digital vault for your medical prescriptions, diagnostic scan reports, lab test results, and doctor notes.
      </p>

      {/* Category Filter Pills */}
      <div className="filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? '' : 'ghost'}`}
            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '12px' }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Records Data Table */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FileText size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>No medical records found</div>
            <div style={{ color: 'var(--ink-2)', fontSize: '12.5px', marginTop: '4px' }}>
              Upload your lab reports or prescriptions to keep your digital medical history organized.
            </div>
            <button className="btn" style={{ marginTop: '16px' }} onClick={onUploadRecord}>
              <Plus size={14} /> Upload First Record
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--line)', color: 'var(--ink-2)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Record Title</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Doctor & Hospital</th>
                  <th style={{ padding: '14px 18px' }}>Date</th>
                  <th style={{ padding: '14px 18px' }}>File Info</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{rec.title}</div>
                      {rec.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: '#eef7f8',
                          color: 'var(--teal)'
                        }}
                      >
                        {rec.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--ink-2)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{rec.doctorName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{rec.hospitalName}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                      {rec.date}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--ink-3)', fontSize: '12px' }}>
                      {rec.fileType} ({rec.fileSize})
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn ghost"
                          style={{ padding: '6px 10px', fontSize: '11.5px' }}
                          onClick={() => onViewRecord(rec)}
                          title="View Record"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          className="btn ghost"
                          style={{ padding: '6px 10px', fontSize: '11.5px' }}
                          onClick={() => onDownloadRecord(rec)}
                          title="Download File"
                        >
                          <Download size={13} /> Download
                        </button>
                        <button
                          className="btn outline-danger"
                          style={{ padding: '6px 10px', fontSize: '11.5px' }}
                          onClick={() => onDeleteRecord(rec.id)}
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
