import React, { useState, useEffect } from 'react';
import { ShieldAlert, Award, Calendar, MapPin, AlertCircle, CheckCircle, Check } from 'lucide-react';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  is_living: boolean;
}

interface ReportsDashboardProps {
  activePerson: Person;
  onSelectPerson: (id: number) => void;
}

interface LineageReport {
  person_id: number;
  full_name: string;
  total_ancestors: number;
  total_descendants: number;
  max_ancestor_generation: number;
  max_descendant_generation: number;
  historical_locations: string[];
}

interface DataIntegrityReport {
  missing_birth_dates: { person_id: number; name: string }[];
  lacking_sources: { person_id: number; name: string }[];
  ambiguous_genders: { person_id: number; name: string; gender: string }[];
}

interface TimelineEvent {
  date: string;
  date_string: string;
  event_type: 'Birth' | 'Death' | 'Marriage' | 'Partnership' | 'Parent_Birth' | 'Parent_Death' | 'Child_Birth' | 'Child_Death';
  description: string;
  relative_name?: string;
  relative_relation?: string;
}

interface BiographicalReport {
  person_id: number;
  full_name: string;
  timeline: TimelineEvent[];
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  activePerson,
  onSelectPerson
}) => {
  const [subTab, setSubTab] = useState<'lineage' | 'integrity' | 'biography'>('lineage');
  
  const [lineage, setLineage] = useState<LineageReport | null>(null);
  const [integrity, setIntegrity] = useState<DataIntegrityReport | null>(null);
  const [biography, setBiography] = useState<BiographicalReport | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (subTab === 'lineage') {
          const res = await fetch(`/api/reports/lineage/${activePerson.person_id}`);
          if (!res.ok) {
            throw new Error(`Failed to load lineage report (HTTP ${res.status})`);
          }
          setLineage(await res.json());
        } else if (subTab === 'integrity') {
          const res = await fetch('/api/reports/integrity');
          if (!res.ok) {
            throw new Error(`Failed to load data integrity check (HTTP ${res.status})`);
          }
          setIntegrity(await res.json());
        } else if (subTab === 'biography') {
          const res = await fetch(`/api/reports/biography/${activePerson.person_id}`);
          if (!res.ok) {
            throw new Error(`Failed to load biography timeline (HTTP ${res.status})`);
          }
          setBiography(await res.json());
        }
      } catch (err: any) {
        console.error("Failed to fetch report data:", err);
        setError(err.message || "An unexpected error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activePerson.person_id, subTab]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'Birth':
      case 'Parent_Birth':
      case 'Child_Birth':
        return <CheckCircle size={14} color="var(--kente-green-ink)" />;
      case 'Death':
      case 'Parent_Death':
      case 'Child_Death':
        return <AlertCircle size={14} color="var(--kente-clay-ink)" />;
      case 'Marriage':
      case 'Partnership':
        return <Calendar size={14} color="var(--kente-rose-ink)" />;
      default:
        return <Calendar size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '5rem 2rem 2rem 2rem', overflowY: 'auto' }}>
      
      {/* Sub Tabs */}
      <div className="tab-navigation-bar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: 'var(--glass-border)', paddingBottom: '0.75rem' }}>
        <button
          className={`btn-tab ${subTab === 'lineage' ? 'active' : ''}`}
          onClick={() => setSubTab('lineage')}
          style={{
            background: subTab === 'lineage' ? 'var(--accent-gradient)' : 'rgba(239, 233, 222, 0.03)',
            color: 'var(--text-primary)',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}
        >
          Lineage Metrics
        </button>
        <button
          className={`btn-tab ${subTab === 'integrity' ? 'active' : ''}`}
          onClick={() => setSubTab('integrity')}
          style={{
            background: subTab === 'integrity' ? 'var(--accent-gradient)' : 'rgba(239, 233, 222, 0.03)',
            color: 'var(--text-primary)',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}
        >
          Data Integrity
        </button>
        <button
          className={`btn-tab ${subTab === 'biography' ? 'active' : ''}`}
          onClick={() => setSubTab('biography')}
          style={{
            background: subTab === 'biography' ? 'var(--accent-gradient)' : 'rgba(239, 233, 222, 0.03)',
            color: 'var(--text-primary)',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}
        >
          Biography Timeline
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-secondary)' }}>
          Loading Report...
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ margin: '1rem 0' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Sub Tab: Lineage Summary */}
          {subTab === 'lineage' && lineage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="report-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <Award size={24} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', uppercase: true } as any}>Total Ancestors</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{lineage.total_ancestors}</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <Award size={24} style={{ color: 'var(--accent-secondary)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', uppercase: true } as any}>Total Descendants</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{lineage.total_descendants}</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <ShieldAlert size={24} style={{ color: 'var(--info)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', uppercase: true } as any}>Max Ancestor Depth</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{lineage.max_ancestor_generation} gen</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <ShieldAlert size={24} style={{ color: 'var(--warning)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', uppercase: true } as any}>Max Descendant Depth</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>{lineage.max_descendant_generation} gen</span>
                </div>
              </div>

              <div className="glass-card">
                <div className="glass-card-header">
                  <MapPin size={18} />
                  <span>Branch Historical Locations</span>
                </div>
                {lineage.historical_locations.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {lineage.historical_locations.map(loc => (
                      <span key={loc} className="pill pill-full" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        {loc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No locations recorded for this branch</span>
                )}
              </div>
            </div>
          )}

          {/* Sub Tab: Data Integrity */}
          {subTab === 'integrity' && integrity && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <div className="glass-card-header">
                  <ShieldAlert size={18} style={{ color: 'var(--warning)' }} />
                  <span>Profiles Lacking Documentation Sources ({integrity.lacking_sources.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {integrity.lacking_sources.length > 0 ? (
                    integrity.lacking_sources.map(p => (
                      <div
                        key={p.person_id}
                        className="sibling-item"
                        onClick={() => onSelectPerson(p.person_id)}
                        style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{p.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to select</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} strokeWidth={1.5} /> All profiles cite a verified source</span>
                  )}
                </div>
              </div>

              <div className="glass-card">
                <div className="glass-card-header">
                  <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
                  <span>Missing Birth Dates ({integrity.missing_birth_dates.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {integrity.missing_birth_dates.length > 0 ? (
                    integrity.missing_birth_dates.map(p => (
                      <div
                        key={p.person_id}
                        className="sibling-item"
                        onClick={() => onSelectPerson(p.person_id)}
                        style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{p.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to select</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} strokeWidth={1.5} /> All profiles have a birth date</span>
                  )}
                </div>
              </div>

              <div className="glass-card">
                <div className="glass-card-header">
                  <ShieldAlert size={18} style={{ color: 'var(--info)' }} />
                  <span>Ambiguous Genders ({integrity.ambiguous_genders.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {integrity.ambiguous_genders.length > 0 ? (
                    integrity.ambiguous_genders.map(p => (
                      <div
                        key={p.person_id}
                        className="sibling-item"
                        onClick={() => onSelectPerson(p.person_id)}
                        style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>{p.name} ({p.gender})</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to select</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={14} strokeWidth={1.5} /> No profiles with an unclear gender</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Biography Timeline */}
          {subTab === 'biography' && biography && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div className="glass-card-header">
                <Calendar size={18} />
                <span>Life Event Chronology</span>
              </div>
              
              {biography.timeline.length > 0 ? (
                <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(239, 233, 222, 0.05)', marginLeft: '0.5rem' }}>
                  {biography.timeline.map((event, idx) => (
                    <div key={idx} className="timeline-event" style={{ position: 'relative' }}>
                      
                      {/* Bullet circle */}
                      <div className="timeline-bullet" style={{ position: 'absolute', left: '-2.05rem', top: '0.2rem', background: 'var(--bg-primary)', border: '2px solid rgba(239, 233, 222, 0.1)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                        {getTimelineIcon(event.event_type)}
                      </div>

                      {/* Content card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-primary)' }}>
                          {formatDate(event.date)}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {event.description}
                        </span>
                        {event.relative_name && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Relationship: {event.relative_relation} ({event.relative_name})
                          </span>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No timeline events yet. Add birth, marriage or death dates to build one.</span>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
};
