import React, { useState, useEffect } from 'react';
import { Crown, Save, X } from 'lucide-react';

interface Abusua {
  id: number;
  name: string;
}

interface Jurisdiction {
  id: number;
  name: string;
  isParamountcy: boolean;
  parentId: number | null;
  regionName: string | null;
}

interface ParamountcyApi {
  id: number;
  name: string;
  region?: { name: string } | null;
}

interface SubStoolApi {
  id: number;
  name: string;
  paramountcy_id: number;
}

interface EnthronementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  userRole?: string;
}

export const EnthronementForm: React.FC<EnthronementFormProps> = ({ onSuccess, onCancel, userRole }) => {
  const [abusuas, setAbusuas] = useState<Abusua[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  
  const [name, setName] = useState('');
  const [stoolName, setStoolName] = useState('');
  const [abusuaId, setAbusuaId] = useState<string>('');
  const [titleType, setTitleType] = useState<'CHIEF' | 'QUEEN_MOTHER'>('CHIEF');
  
  const [selectedParamountcyId, setSelectedParamountcyId] = useState<string>('');
  const [selectedSubDivisionId, setSelectedSubDivisionId] = useState<string>('');
  
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Abusua = matrilineal clan; jurisdictions = paramountcies plus their sub-stools
    fetch('/api/royal/clans')
      .then(r => (r.ok ? r.json() : []))
      .then((data: Abusua[]) => setAbusuas(Array.isArray(data) ? data : []))
      .catch(() => {});

    Promise.all([
      fetch('/api/royal/paramountcies').then(r => (r.ok ? r.json() : [])),
      fetch('/api/royal/sub-stools').then(r => (r.ok ? r.json() : []))
    ])
      .then(([params, subs]: [ParamountcyApi[], SubStoolApi[]]) => {
        const regionById = new Map<number, string | null>();
        const list: Jurisdiction[] = [];
        (Array.isArray(params) ? params : []).forEach(p => {
          const regionName = p.region?.name ?? null;
          regionById.set(p.id, regionName);
          list.push({ id: p.id, name: p.name, isParamountcy: true, parentId: null, regionName });
        });
        (Array.isArray(subs) ? subs : []).forEach(s => {
          list.push({
            // Offset sub-stool ids so they never collide with paramountcy ids in the select values
            id: -s.id,
            name: s.name,
            isParamountcy: false,
            parentId: s.paramountcy_id,
            regionName: regionById.get(s.paramountcy_id) ?? null
          });
        });
        setJurisdictions(list);
      })
      .catch(() => {});
  }, []);

  const paramountcies = jurisdictions.filter(j => j.isParamountcy);
  const subdivisions = jurisdictions.filter(j => 
    !j.isParamountcy && j.parentId === parseInt(selectedParamountcyId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!name || !abusuaId || !stoolName || !selectedParamountcyId || !startDate) {
      setError("Please fill out all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const paramountcy = jurisdictions.find(j => j.isParamountcy && j.id === parseInt(selectedParamountcyId));
      const subDivision = selectedSubDivisionId
        ? jurisdictions.find(j => !j.isParamountcy && j.id === parseInt(selectedSubDivisionId))
        : undefined;
      const clan = abusuas.find(a => a.id === parseInt(abusuaId));
      const isSub = Boolean(subDivision);
      const rank = titleType === 'CHIEF'
        ? (isSub ? 'DIVISIONAL_CHIEF' : 'AMANHENE')
        : (isSub ? 'DIVISIONAL_QUEEN_MOTHER' : 'AMANHEMAA');
      const region = (paramountcy?.regionName || 'Ashanti').replace(/\s+Region$/i, '');
      const seat = subDivision?.name || paramountcy?.name || '';

      const response = await fetch('/api/traditional-stools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole || '',
        },
        body: JSON.stringify({
          stoolName,
          title: stoolName,
          town: seat,
          region,
          category: isSub ? 'DIVISIONAL_SUB' : 'REGIONAL_PARAMOUNT',
          rank,
          currentOccupant: name,
          clan: clan?.name || null,
          seatLocation: seat,
          enstoolmentDate: startDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enthrone leader");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', position: 'relative' }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        <X size={24} />
      </button>

      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.5rem' }}>
        <Crown size={24} style={{ color: 'var(--accent-primary)' }} />
        Enthrone Traditional Leader
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Biological Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stool Name (Title) *</label>
            <input type="text" value={stoolName} onChange={e => setStoolName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Title Type *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={titleType === 'CHIEF'} onChange={() => setTitleType('CHIEF')} /> Chief
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" checked={titleType === 'QUEEN_MOTHER'} onChange={() => setTitleType('QUEEN_MOTHER')} /> Queen Mother
              </label>
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Abusua (Matrilineal Clan) *</label>
            <select value={abusuaId} onChange={e => setAbusuaId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
              <option value="">-- Select Abusua --</option>
              {abusuas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paramountcy *</label>
            <select value={selectedParamountcyId} onChange={e => { setSelectedParamountcyId(e.target.value); setSelectedSubDivisionId(''); }} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
              <option value="">-- Select Paramountcy --</option>
              {paramountcies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sub-division (Optional)</label>
            <select value={selectedSubDivisionId} onChange={e => setSelectedSubDivisionId(e.target.value)} disabled={!selectedParamountcyId} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', opacity: !selectedParamountcyId ? 0.5 : 1 }}>
              <option value="">-- Apex / None --</option>
              {subdivisions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Start Date (Enstoolment) *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6b6b', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', background: 'var(--accent-primary)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} />
          {submitting ? 'Enthroning...' : 'Register Leader'}
        </button>
      </form>
    </div>
  );
};
