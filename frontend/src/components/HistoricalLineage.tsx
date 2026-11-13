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

interface RoyalPerson {
  person_id: number;
  first_name: string;
  last_name: string;
  enstoolment_date?: string | null;
  birth_date?: string | null;
  death_date?: string | null;
  is_living: boolean;
  clan_id?: number | null;
}

interface ClanApi {
  id: number;
  name: string;
}

interface HistoricalLineageProps {
  titleType: 'CHIEF' | 'QUEEN_MOTHER';
}

export const HistoricalLineage: React.FC<HistoricalLineageProps> = ({ titleType }) => {
  const [lineage, setLineage] = useState<StoolOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const endpoint = titleType === 'CHIEF' ? '/api/people/royals/asantehenes' : '/api/people/royals/asantehemaas';
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(endpoint).then(r => {
        if (!r.ok) throw new Error('Failed to load lineage records');
        return r.json();
      }),
      fetch('/api/royal/clans').then(r => (r.ok ? r.json() : [])).catch(() => [])
    ])
      .then(([people, clans]: [RoyalPerson[], ClanApi[]]) => {
        if (cancelled) return;
        const clanById = new Map((Array.isArray(clans) ? clans : []).map(c => [c.id, c.name]));
        const entries: StoolOccupancy[] = (Array.isArray(people) ? people : []).map(p => {
          const clanName = p.clan_id != null ? clanById.get(p.clan_id) : undefined;
          return {
            id: p.person_id,
            stoolName: `${p.first_name} ${p.last_name}`.trim(),
            startDate: p.enstoolment_date || p.birth_date || '',
            endDate: p.is_living ? null : (p.death_date || null),
            isActive: p.is_living,
            person: {
              name: `${p.first_name} ${p.last_name}`.trim(),
              abusua: clanName ? { name: clanName } : undefined
            }
          };
        });
        // Most recent first; undated entries last
        entries.sort((a, b) => {
          const ta = a.startDate ? new Date(a.startDate).getTime() : -Infinity;
          const tb = b.startDate ? new Date(b.startDate).getTime() : -Infinity;
          return tb - ta;
        });
        setLineage(entries);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [titleType]);

  const formatYear = (dateString: string | null, fallback = 'Present') => {
    if (!dateString) return fallback;
    return new Date(dateString).getFullYear().toString();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lineage…</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--kente-clay-ink)' }}>{error}</div>;

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 500, marginBottom: '2rem' }}>
        <History size={20} style={{ color: 'var(--accent-primary)' }} />
        {titleType === 'CHIEF' ? 'Asantehene Lineage Ledger' : 'Asantehemaa Lineage Ledger'}
      </h3>

      {lineage.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No lineage records yet</p>
      )}

      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(239, 233, 222, 0.1)' }}>
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
              background: occ.isActive ? 'var(--accent-primary)' : 'rgba(239, 233, 222, 0.2)',
              border: '3px solid var(--bg-card)',
              zIndex: 1
            }}></div>
            
            <div style={{ 
              background: 'rgba(239, 233, 222, 0.02)', 
              border: occ.isActive ? '1px solid rgba(214, 164, 64, 0.3)' : '1px solid rgba(239, 233, 222, 0.05)',
              borderRadius: '8px', 
              padding: '1.5rem',
              boxShadow: 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 500, color: occ.isActive ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {occ.stoolName}
                  </h4>
                  {occ.person.name !== occ.stoolName && (
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      Biological Name: <span style={{ color: 'var(--text-primary)' }}>{occ.person.name}</span>
                    </div>
                  )}
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} style={{ color: occ.isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                  {formatYear(occ.startDate, '?')} – {occ.isActive ? 'Present' : formatYear(occ.endDate, '?')}
                </div>
              </div>

              {occ.person.abusua && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(239, 233, 222, 0.05)', borderRadius: '4px' }}>
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
