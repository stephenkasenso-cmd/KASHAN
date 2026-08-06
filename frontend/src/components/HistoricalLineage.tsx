import React, { useEffect, useState } from 'react';
import { History, Shield } from 'lucide-react';

interface StoolOccupancy {
  id: number;
  stoolName: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  person: {
    name: string;
    abusua?: {
      name: string;
    };
  };
}

interface HistoricalLineageProps {
  jurisdictionId: number;
  titleType: 'CHIEF' | 'QUEEN_MOTHER';
}

export const HistoricalLineage: React.FC<HistoricalLineageProps> = ({ jurisdictionId, titleType }) => {
  const [lineage, setLineage] = useState<StoolOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Providing placeholder data to demonstrate UI structure since endpoint is not yet defined
    setTimeout(() => {
      setLineage([
        {
          id: 1,
          stoolName: titleType === 'CHIEF' ? 'Nana Osei Tutu II' : 'Nana Konadu Yiadom III',
          startDate: '1999-04-26',
          endDate: null,
          isActive: true,
          person: { name: 'Nana Barima Kwaku Duah', abusua: { name: 'Oyoko' } }
        },
        {
          id: 2,
          stoolName: titleType === 'CHIEF' ? 'Opoku Ware II' : 'Nana Afia Kobi Serwaa Ampem II',
          startDate: '1970-07-27',
          endDate: '1999-02-25',
          isActive: false,
          person: { name: 'Jacob Matthew Poku', abusua: { name: 'Oyoko' } }
        },
        {
          id: 3,
          stoolName: titleType === 'CHIEF' ? 'Osei Tutu Agyeman Prempeh II' : 'Nana Ama Serwaa Nyarko',
          startDate: '1931-06-22',
          endDate: '1970-05-27',
          isActive: false,
          person: { name: 'Kwame Kyeretwie', abusua: { name: 'Oyoko' } }
        }
      ]);
      setLoading(false);
    }, 500);
  }, [jurisdictionId, titleType]);

  const formatYear = (dateString: string | null) => {
    if (!dateString) return 'Present';
    return new Date(dateString).getFullYear().toString();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lineage...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ff6b6b' }}>{error}</div>;

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '2rem' }}>
        <History size={20} style={{ color: 'var(--accent-primary)' }} />
        Historical Lineage Ledger
      </h3>

      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
        {lineage.map((occ, index) => (
          <div key={occ.id} style={{ position: 'relative', marginBottom: index === lineage.length - 1 ? 0 : '2rem' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-1.5rem',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: occ.isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
              border: '3px solid var(--bg-card)',
              zIndex: 1
            }}></div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: occ.isActive ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px', 
              padding: '1.5rem',
              boxShadow: occ.isActive ? '0 0 20px rgba(234, 179, 8, 0.1)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: occ.isActive ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {occ.stoolName}
                  </h4>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Biological Name: <span style={{ color: 'var(--text-primary)' }}>{occ.person.name}</span>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} style={{ color: occ.isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                  {formatYear(occ.startDate)} – {formatYear(occ.endDate)}
                </div>
              </div>

              {occ.person.abusua && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    Abusua: <strong>{occ.person.abusua.name}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
