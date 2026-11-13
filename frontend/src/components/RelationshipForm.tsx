import React, { useState, useEffect } from 'react';
import { Link2, AlertCircle, Trash2, Crown, X, Check } from 'lucide-react';
import { EstablishRelationshipModal } from './EstablishRelationshipModal';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  is_living: boolean;
  fullName?: string | null;
  profession?: string | null;
  bio?: string | null;
  dynasticNumber?: number | null;
}

interface ExistingRelationship {
  relationship_id: number;
  person_id_1: number;
  person_id_2: number;
  relationship_type: string;
  subtype: string;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

interface RelationshipFormProps {
  people: Person[];
  onRelationshipCreated: () => void;
  userRole?: string;
  existingRelationship?: ExistingRelationship | null;
  onCancelEdit?: () => void;
}

export const RelationshipForm: React.FC<RelationshipFormProps> = ({
  people,
  onRelationshipCreated,
  userRole,
  existingRelationship,
  onCancelEdit
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [p1Query, setP1Query] = useState(() => {
    if (existingRelationship) {
      const p = people.find(p => p.person_id === existingRelationship.person_id_1);
      return p ? `${p.first_name} ${p.last_name}` : '';
    }
    return '';
  });
  const [selectedP1, setSelectedP1] = useState<Person | null>(() => {
    if (existingRelationship) {
      return people.find(p => p.person_id === existingRelationship.person_id_1) || null;
    }
    return null;
  });
  const [p1Focused, setP1Focused] = useState(false);

  const [p2Query, setP2Query] = useState(() => {
    if (existingRelationship) {
      const p = people.find(p => p.person_id === existingRelationship.person_id_2);
      return p ? `${p.first_name} ${p.last_name}` : '';
    }
    return '';
  });
  const [selectedP2, setSelectedP2] = useState<Person | null>(() => {
    if (existingRelationship) {
      return people.find(p => p.person_id === existingRelationship.person_id_2) || null;
    }
    return null;
  });
  const [p2Focused, setP2Focused] = useState(false);

  const [relationshipType, setRelationshipType] = useState(existingRelationship?.relationship_type || 'Parent-Child');
  const [subtype, setSubtype] = useState(existingRelationship?.subtype || 'Biological');
  const [status, setStatus] = useState(existingRelationship?.status || 'Active');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [localExistingRelationship, setLocalExistingRelationship] = useState<ExistingRelationship | null>(existingRelationship || null);

  // Sync prop changes
  useEffect(() => {
    setLocalExistingRelationship(existingRelationship || null);
    if (existingRelationship) {
      setRelationshipType(existingRelationship.relationship_type);
      setSubtype(existingRelationship.subtype);
      setStatus(existingRelationship.status || 'Active');
    }
  }, [existingRelationship]);

  // Auto-detect existing relationship when selectedP1 and selectedP2 change
  useEffect(() => {
    if (existingRelationship) return; // Prop overrides auto-detect

    if (selectedP1 && selectedP2) {
      const checkExisting = async () => {
        try {
          const res = await fetch(`/api/people/${selectedP1.person_id}/relationships`);
          if (res.ok) {
            const data: ExistingRelationship[] = await res.json();
            const found = data.find(rel => 
              (rel.person_id_1 === selectedP1.person_id && rel.person_id_2 === selectedP2.person_id) ||
              (rel.person_id_1 === selectedP2.person_id && rel.person_id_2 === selectedP1.person_id)
            );
            if (found) {
              setLocalExistingRelationship(found);
              setRelationshipType(found.relationship_type);
              setSubtype(found.subtype);
              setStatus(found.status || 'Active');
            } else {
              setLocalExistingRelationship(null);
            }
          }
        } catch (err) {
          console.error("Failed to check existing relationship:", err);
        }
      };
      checkExisting();
    } else {
      setLocalExistingRelationship(null);
    }
  }, [selectedP1, selectedP2, existingRelationship]);

  const handleDeleteLocal = async () => {
    const relId = localExistingRelationship?.relationship_id;
    if (!relId) return;
    if (!confirm('Are you sure you want to delete this relationship?')) return;
    try {
      const res = await fetch(`/api/relationships/${relId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole || '' }
      });
      if (res.ok) {
        setSuccess(true);
        setError(null);
        setP1Query('');
        setSelectedP1(null);
        setP2Query('');
        setSelectedP2(null);
        setLocalExistingRelationship(null);
        setRelationshipType('Parent-Child');
        setSubtype('Biological');
        setStatus('Active');
        onRelationshipCreated();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete relationship.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isReadOnly = userRole !== 'Admin';

  const filteredP1 = people.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(p1Query.toLowerCase())
  );

  const filteredP2 = people.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(p2Query.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (isReadOnly) {
      setError("Forbidden: Read-only access level. Only Admin accounts can configure relationships.");
      return;
    }

    // Auto-resolve Person 1
    let p1Obj = selectedP1;
    if (!p1Obj && p1Query.trim() !== '') {
      const matches = people.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase() === p1Query.trim().toLowerCase()
      );
      if (matches.length === 1) {
        p1Obj = matches[0];
      }
    }

    // Auto-resolve Person 2
    let p2Obj = selectedP2;
    if (!p2Obj && p2Query.trim() !== '') {
      const matches = people.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase() === p2Query.trim().toLowerCase()
      );
      if (matches.length === 1) {
        p2Obj = matches[0];
      }
    }

    if (!p1Obj || !p2Obj) {
      setError("Please select both individuals from the dropdown search.");
      return;
    }

    try {
      const isUpdate = !!existingRelationship;
      const url = isUpdate ? `/api/relationships/${existingRelationship!.relationship_id}` : '/api/relationships';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload: any = {
        relationship_type: relationshipType,
        subtype: ['Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'].includes(relationshipType) ? subtype : 'None',
        status: ['Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'].includes(relationshipType) ? null : status
      };

      if (!isUpdate) {
        payload.person_id_1 = p1Obj.person_id;
        payload.person_id_2 = p2Obj.person_id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole || '',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to link relationships.");
      }

      setP1Query('');
      setSelectedP1(null);
      setP2Query('');
      setSelectedP2(null);
      setRelationshipType('Parent-Child');
      setSubtype('Biological');
      setStatus('Active');
      setSuccess(true);
      onRelationshipCreated();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card">
      <div className="glass-card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link2 size={18} />
          <span>{localExistingRelationship ? 'Edit Relationship' : 'Establish Relationship'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="btn-secondary"
            title="Open the relationship wizard"
            style={{ padding: '4px 10px', fontSize: '12px', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Crown size={14} strokeWidth={1.5} style={{ color: 'var(--accent-ink)' }} />
            Wizard
          </button>
          {(existingRelationship || localExistingRelationship) && onCancelEdit && (
            <button
              onClick={() => {
                setP1Query('');
                setSelectedP1(null);
                setP2Query('');
                setSelectedP2(null);
                setLocalExistingRelationship(null);
                onCancelEdit();
              }}
              type="button"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(239, 233, 222, 0.06)', border: '1px solid rgba(239, 233, 222, 0.1)',
                color: 'var(--text-secondary)', borderRadius: '6px',
                padding: '0.25rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer',
              }}
            >
              <X size={14} strokeWidth={1.5} /> Cancel
            </button>
          )}
        </div>
      </div>

      <EstablishRelationshipModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        people={people}
        onRelationshipEstablished={() => {
          onRelationshipCreated();
        }}
        initialPerson1Id={selectedP1?.person_id}
        initialPerson2Id={selectedP2?.person_id}
      />

      <form onSubmit={handleSubmit}>
        {isReadOnly && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>Read-only Mode (Requires Admin Access)</span>
          </div>
        )}

        {/* Person 1 Search */}
        <div className="form-group search-container">
          <label>First Person (Parent / Spouse)</label>
          <input
            type="text"
            value={p1Query}
            onChange={e => {
              setP1Query(e.target.value);
              if (selectedP1) setSelectedP1(null);
            }}
            onFocus={() => setP1Focused(true)}
            onBlur={() => setTimeout(() => setP1Focused(false), 200)}
            placeholder="Search"
            required
            disabled={isReadOnly}
          />
          {p1Focused && p1Query.trim() !== '' && filteredP1.length > 0 && !isReadOnly && (
            <div className="search-results-dropdown">
              {filteredP1.map(p => (
                <div
                  key={p.person_id}
                  className="search-result-item"
                  onMouseDown={() => {
                    setSelectedP1(p);
                    setP1Query(`${p.first_name} ${p.last_name}`);
                  }}
                >
                  {p.first_name} {p.last_name} ({p.gender})
                </div>
              ))}
            </div>
          )}
          {selectedP1 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              <Check size={14} strokeWidth={1.5} /> Selected: {selectedP1.first_name} {selectedP1.last_name} (ID: {selectedP1.person_id})
            </div>
          )}
        </div>

        {/* Person 2 Search */}
        <div className="form-group search-container">
          <label>Second Person (Child / Spouse)</label>
          <input
            type="text"
            value={p2Query}
            onChange={e => {
              setP2Query(e.target.value);
              if (selectedP2) setSelectedP2(null);
            }}
            onFocus={() => setP2Focused(true)}
            onBlur={() => setTimeout(() => setP2Focused(false), 200)}
            placeholder="Search"
            required
            disabled={isReadOnly}
          />
          {p2Focused && p2Query.trim() !== '' && filteredP2.length > 0 && !isReadOnly && (
            <div className="search-results-dropdown">
              {filteredP2.map(p => (
                <div
                  key={p.person_id}
                  className="search-result-item"
                  onMouseDown={() => {
                    setSelectedP2(p);
                    setP2Query(`${p.first_name} ${p.last_name}`);
                  }}
                >
                  {p.first_name} {p.last_name} ({p.gender})
                </div>
              ))}
            </div>
          )}
          {selectedP2 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              <Check size={14} strokeWidth={1.5} /> Selected: {selectedP2.first_name} {selectedP2.last_name} (ID: {selectedP2.person_id})
            </div>
          )}
        </div>

        {/* Relationship Details */}
        <div className="form-group">
          <label>Relationship Type</label>
          <select
            value={relationshipType}
            onChange={e => {
              const newType = e.target.value;
              setRelationshipType(newType);
              // Set appropriate default subtype based on relationship type
              if (newType === 'Parent-Child') setSubtype('Biological');
              else if (newType === 'Traditional Command (Chiefs)') setSubtype('Asantehene -> Paramount Chief');
              else if (newType === 'Traditional Command (Queen Mothers)') setSubtype('Asantehemaa -> Paramount Queen Mother');
              else setSubtype(''); 
            }}
            disabled={isReadOnly}
          >
            <option value="Parent-Child">Parent-Child (P1 is Parent, P2 is Child)</option>
            <option value="Spouse">Spouse</option>
            <option value="Partner">Partner</option>
            <option value="Traditional Command (Chiefs)">Traditional Command (Chiefs)</option>
            <option value="Traditional Command (Queen Mothers)">Traditional Command (Queen Mothers)</option>
          </select>
        </div>

        {relationshipType === 'Parent-Child' ? (
          <div className="form-group">
            <label>Subtype</label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} disabled={isReadOnly}>
              <option value="Biological">Biological</option>
              <option value="Adoptive">Adoptive</option>
              <option value="Step">Step</option>
              <option value="Foster">Foster</option>
            </select>
          </div>
        ) : relationshipType === 'Traditional Command (Chiefs)' ? (
          <div className="form-group">
            <label>Reporting Line (Subtype)</label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} disabled={isReadOnly}>
              <option value="Asantehene -> Paramount Chief">Asantehene (Apex) &rarr; Paramount Chief</option>
              <option value="Paramount Chief -> Divisional Chief">Paramount Chief &rarr; Divisional Chief</option>
              <option value="Divisional Chief -> Sub-Chief">Divisional Chief &rarr; Sub-Chief</option>
            </select>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              * Person 1 is the superior, Person 2 is the subordinate.
            </div>
          </div>
        ) : relationshipType === 'Traditional Command (Queen Mothers)' ? (
          <div className="form-group">
            <label>Reporting Line (Subtype)</label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} disabled={isReadOnly}>
              <option value="Asantehemaa -> Paramount Queen Mother">Asantehemaa (Apex) &rarr; Paramount Queen Mother</option>
              <option value="Paramount Queen Mother -> Divisional Queen Mother">Paramount Queen Mother &rarr; Divisional Queen Mother</option>
              <option value="Divisional Queen Mother -> Sub Queen Mother">Divisional Queen Mother &rarr; Sub Queen Mother</option>
            </select>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              * Person 1 is the superior, Person 2 is the subordinate.
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} disabled={isReadOnly}>
              <option value="Active">Active</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        )}

        {localExistingRelationship && (
          <div style={{
            fontSize: '0.78rem',
            padding: '0.5rem',
            background: 'rgba(214, 164, 64, 0.1)',
            border: '1px solid rgba(214, 164, 64, 0.25)',
            borderRadius: '6px',
            color: 'var(--accent-ink)',
            marginBottom: '0.75rem',
            textAlign: 'center'
          }}>
            ℹ️ Editing existing relationship (ID: {localExistingRelationship.relationship_id})
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isReadOnly}>
            {isReadOnly ? 'Link Relationship (Restricted)' : (localExistingRelationship ? 'Save Changes' : 'Link Relationship')}
          </button>
          
          {localExistingRelationship && !isReadOnly && (
            <button
              type="button"
              onClick={handleDeleteLocal}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201, 83, 63, 0.15)',
                border: '1px solid rgba(201, 83, 63, 0.3)',
                color: 'var(--kente-clay-ink)',
                padding: '0 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Delete relationship link"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Relationship linked</span>
          </div>
        )}
      </form>
    </div>
  );
};
