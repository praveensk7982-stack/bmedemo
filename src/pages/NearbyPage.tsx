import React, { useState } from 'react';
import type { NearbyFacility } from '../types';
import { MapPin, Navigation, Star, Clock, Phone, Building2, Stethoscope, Pill, Activity, Droplet } from 'lucide-react';

interface NearbyPageProps {
  facilities: NearbyFacility[];
  searchQuery: string;
  onOpenDirections: (facility: NearbyFacility) => void;
}

export const NearbyPage: React.FC<NearbyPageProps> = ({
  facilities,
  searchQuery,
  onOpenDirections,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Hospital', 'Clinic', 'Pharmacy', 'Diagnostic', 'Blood Bank'];

  const getCategoryIcon = (cat: NearbyFacility['category']) => {
    switch (cat) {
      case 'Hospital': return <Building2 size={16} color="var(--teal)" />;
      case 'Clinic': return <Stethoscope size={16} color="var(--teal)" />;
      case 'Pharmacy': return <Pill size={16} color="#12a06a" />;
      case 'Diagnostic': return <Activity size={16} color="#1f5f9e" />;
      case 'Blood Bank': return <Droplet size={16} color="#d94a4a" />;
    }
  };

  const filtered = facilities.filter((fac) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      fac.name.toLowerCase().includes(q) ||
      fac.location.toLowerCase().includes(q) ||
      fac.category.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'All' || fac.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="content">
      <h1>Nearby Healthcare Services</h1>
      <p className="sub">
        Explore hospitals, specialty clinics, 24x7 pharmacies, blood banks, and diagnostic centers near your current location.
      </p>

      {/* Category filter pills */}
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

      {/* Facilities Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--line)' }}>
            <MapPin size={36} color="var(--ink-3)" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>No nearby facilities found</div>
            <div style={{ color: 'var(--ink-2)', fontSize: '12.5px', marginTop: '4px' }}>Try switching categories or expanding your location search.</div>
          </div>
        ) : (
          filtered.map((fac) => (
            <div
              key={fac.id}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: 'var(--shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#eef7f8', display: 'grid', placeItems: 'center' }}>
                      {getCategoryIcon(fac.category)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--ink)' }}>{fac.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{fac.category}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      background: fac.isOpen ? '#e9f7f1' : '#f1f4f8',
                      color: fac.isOpen ? '#12a06a' : '#7d8fa3'
                    }}
                  >
                    {fac.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', color: 'var(--ink-2)', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} color="var(--teal)" /> {fac.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Navigation size={13} color="var(--teal)" /> {fac.distance}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--star)', fontWeight: 600 }}>
                      <Star size={13} fill="var(--star)" /> {fac.rating}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} color="var(--ink-3)" /> {fac.hours}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="var(--teal)" /> {fac.phone}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn"
                  style={{ fontSize: '11.5px', width: '100%' }}
                  onClick={() => onOpenDirections(fac)}
                >
                  <Navigation size={13} /> Get Directions
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
