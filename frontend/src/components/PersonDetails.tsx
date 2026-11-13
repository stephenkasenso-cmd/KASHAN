import React, { useState } from 'react';
import { User, Calendar, MapPin, Heart, BookOpen, Pencil, X, Save, Phone, CreditCard, Navigation, Link2, Trash2 } from 'lucide-react';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  maiden_name?: string | null;
  gender: string;
  birth_date?: string | null;
  birth_place?: string | null;
  death_date?: string | null;
  death_place?: string | null;
  is_living: boolean;
  bio?: string | null;
  ghana_card?: string | null;
  gps_address?: string | null;
  phone?: string | null;
  enstoolment_date?: string | null;
  clan_id?: number | null;
  paramountcy_id?: number | null;
  sub_stool_id?: number | null;
}

interface SiblingNode {
  person: Person;
  type: 'Full-Sibling' | 'Half-Sibling';
}

interface ImmediateFamily {
  parents: Person[];
  children: Person[];
  spouses: Person[];
  partners: Person[];
  siblings: SiblingNode[];
}

interface PersonDetailsProps {
  person: Person;
  immediateFamily: ImmediateFamily;
  onNodeClick: (id: number) => void;
  onPersonUpdated: (updated: Person) => void;
  userRole?: 'Admin' | 'Manager' | 'Staff';
  relationships?: any[];
  people?: Person[];
  onEditRelationship?: (rel: any) => void;
  onDeleteRelationship?: (relId: number) => void;
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({
  person,
  immediateFamily,
  onNodeClick,
  onPersonUpdated,
  userRole,
  relationships = [],
  people = [],
  onEditRelationship,
  onDeleteRelationship,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Person>(person);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clans, setClans] = useState<{ id: number; name: string }[]>([]);
  const [paramountcies, setParamountcies] = useState<{ id: number; name: string }[]>([]);
  const [subStools, setSubStools] = useState<{ id: number; name: string; paramountcyId: number }[]>([]);

  // Fetch reference lists
  React.useEffect(() => {
    fetch('/api/royal/clans').then(r => r.json()).then(setClans).catch(console.error);
    fetch('/api/royal/paramountcies').then(r => r.json()).then(setParamountcies).catch(console.error);
    fetch('/api/royal/sub-stools').then(r => r.json()).then(setSubStools).catch(console.error);
  }, []);

  // Keep form in sync when a different person is selected
  React.useEffect(() => {
    setFormData(person);
    setIsEditing(false);
    setError(null);
  }, [person.person_id]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/people/${person.person_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole || '',
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated: Person = await res.json();
        onPersonUpdated(updated);
        setIsEditing(false);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? 'Failed to save changes.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(person);
    setIsEditing(false);
    setError(null);
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    type: 'text' | 'date' | 'textarea' | 'select' = 'text',
    options?: { value: string; label: string }[]
  ) => (
    <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
        />
      ) : type === 'select' && options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', fontSize: '0.85rem' }}>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', fontSize: '0.85rem' }}
        />
      )}
    </div>
  );

  return (
    <div className="record-panel">
      {/* ── Vital Statistics Card ── */}
      <div className="glass-card">
        <div className="glass-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} />
            <span>Vital Statistics</span>
          </div>
          {!isEditing && (userRole === 'Admin' || userRole === 'Manager') ? (
            <button
              onClick={() => setIsEditing(true)}
              title="Edit profile"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(239, 233, 222, 0.06)', border: '1px solid rgba(239, 233, 222, 0.1)',
                color: 'var(--text-secondary)', borderRadius: '6px',
                padding: '0.25rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer',
              }}
            >
              <Pencil size={12} /> Edit
            </button>
          ) : isEditing ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                form="edit-form"
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'var(--accent-primary)', border: 'none',
                  color: 'var(--text-primary)', borderRadius: '6px',
                  padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Save size={12} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'rgba(239, 233, 222, 0.06)', border: '1px solid rgba(239, 233, 222, 0.1)',
                  color: 'var(--text-secondary)', borderRadius: '6px',
                  padding: '0.25rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                <X size={12} /> Cancel
              </button>
            </div>
          ) : null}
        </div>

        {error && (
          <div style={{
            marginTop: '0.5rem', padding: '0.5rem 0.75rem',
            background: 'rgba(201, 83, 63, 0.12)', border: '1px solid rgba(201, 83, 63, 0.3)',
            borderRadius: '6px', fontSize: '0.8rem', color: 'var(--kente-clay-ink)',
          }}>
            {error}
          </div>
        )}

        {isEditing ? (
          <form id="edit-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
            {field('First Name', formData.first_name, v => setFormData(f => ({ ...f, first_name: v })))}
            {field('Last Name', formData.last_name, v => setFormData(f => ({ ...f, last_name: v })))}
            {field('Maiden Name', formData.maiden_name ?? '', v => setFormData(f => ({ ...f, maiden_name: v || null })))}
            {field('Gender', formData.gender, v => setFormData(f => ({ ...f, gender: v })), 'select', [
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ])}
            {field('Birth Date', formData.birth_date?.split('T')[0] ?? '', v => setFormData(f => ({ ...f, birth_date: v || null })), 'date')}
            {field('Birth Place', formData.birth_place ?? '', v => setFormData(f => ({ ...f, birth_place: v || null })))}
            {field('Living Status', formData.is_living ? 'true' : 'false', v => setFormData(f => ({ ...f, is_living: v === 'true' })), 'select', [
              { value: 'true', label: 'Living' },
              { value: 'false', label: 'Deceased' },
            ])}
            {!formData.is_living && (
              <>
                {field('Death Date', formData.death_date?.split('T')[0] ?? '', v => setFormData(f => ({ ...f, death_date: v || null })), 'date')}
                {field('Death Place', formData.death_place ?? '', v => setFormData(f => ({ ...f, death_place: v || null })))}
              </>
            )}
            {field('Ghana Card No.', formData.ghana_card ?? '', v => setFormData(f => ({ ...f, ghana_card: v || null })))}
            {field('Phone', formData.phone ?? '', v => setFormData(f => ({ ...f, phone: v || null })))}
            {field('GPS Address', formData.gps_address ?? '', v => setFormData(f => ({ ...f, gps_address: v || null })))}
            {field('Clan', formData.clan_id?.toString() ?? '', v => setFormData(f => ({ ...f, clan_id: v ? parseInt(v) : null })), 'select', [
              { value: '', label: '-- None --' },
              ...clans.map(c => ({ value: c.id.toString(), label: c.name }))
            ])}
            {field('Paramountcy', formData.paramountcy_id?.toString() ?? '', v => setFormData(f => ({ ...f, paramountcy_id: v ? parseInt(v) : null, sub_stool_id: null })), 'select', [
              { value: '', label: '-- None --' },
              ...paramountcies.map(p => ({ value: p.id.toString(), label: p.name }))
            ])}
            {field('Sub-Stool / Town', formData.sub_stool_id?.toString() ?? '', v => setFormData(f => ({ ...f, sub_stool_id: v ? parseInt(v) : null })), 'select', [
              { value: '', label: '-- None --' },
              ...subStools
                .filter(s => !formData.paramountcy_id || s.paramountcyId === formData.paramountcy_id)
                .map(s => ({ value: s.id.toString(), label: s.name }))
            ])}
            {field('Enstoolment Date', formData.enstoolment_date?.split('T')[0] ?? '', v => setFormData(f => ({ ...f, enstoolment_date: v || null })), 'date')}
            {field('Biography', formData.bio ?? '', v => setFormData(f => ({ ...f, bio: v || null })), 'textarea')}
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                {person.first_name} {person.last_name}
              </h2>
              {person.maiden_name && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  née {person.maiden_name}
                </div>
              )}
              {/* Display Clan, Paramountcy, Sub-Stool if available */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {person.clan_id && (
                  <span className="pill pill-half" style={{ background: 'rgba(214, 164, 64, 0.15)', color: 'var(--accent-ink)', border: '1px solid rgba(214, 164, 64, 0.3)' }}>
                    Clan: {clans.find(c => c.id === person.clan_id)?.name || '…'}
                  </span>
                )}
                {person.paramountcy_id && (
                  <span className="pill pill-half" style={{ background: 'rgba(214, 164, 64, 0.15)', color: 'var(--accent-ink)', border: '1px solid rgba(214, 164, 64, 0.3)' }}>
                    {paramountcies.find(p => p.id === person.paramountcy_id)?.name || '…'}
                  </span>
                )}
                {person.sub_stool_id && (
                  <span className="pill pill-half" style={{ background: 'rgba(63, 158, 107, 0.15)', color: 'var(--kente-green-ink)', border: '1px solid rgba(63, 158, 107, 0.3)' }}>
                    Stool: {subStools.find(s => s.id === person.sub_stool_id)?.name || '…'}
                  </span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">{person.gender}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} color={person.is_living ? 'var(--success)' : 'var(--danger)'} fill={person.is_living ? 'var(--success)' : 'var(--danger)'} />
                {person.is_living ? 'Living' : 'Deceased'}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Birth Date</div>
              <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} />
                {formatDate(person.birth_date)}
              </div>
            </div>

            {person.birth_place && (
              <div className="detail-item">
                <div className="detail-label">Birth Place</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} />
                  {person.birth_place}
                </div>
              </div>
            )}

            {person.phone && (
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} />
                  {person.phone}
                </div>
              </div>
            )}

            {person.ghana_card && (
              <div className="detail-item">
                <div className="detail-label">Ghana Card</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CreditCard size={14} />
                  {person.ghana_card}
                </div>
              </div>
            )}

            {person.gps_address && (
              <div className="detail-item">
                <div className="detail-label">GPS Address</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Navigation size={14} />
                  {person.gps_address}
                </div>
              </div>
            )}

            {person.enstoolment_date && (
              <div className="detail-item">
                <div className="detail-label">Enstoolment Date</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} />
                  {formatDate(person.enstoolment_date)}
                </div>
              </div>
            )}

            {!person.is_living && (
              <>
                <div className="detail-item">
                  <div className="detail-label">Death Date</div>
                  <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    {formatDate(person.death_date)}
                  </div>
                </div>
                {person.death_place && (
                  <div className="detail-item">
                    <div className="detail-label">Death Place</div>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} />
                      {person.death_place}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Biography Card (read-only, always visible) ── */}
      {person.bio && !isEditing && (
        <div className="glass-card">
          <div className="glass-card-header">
            <BookOpen size={18} />
            <span>Biography</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {person.bio}
          </p>
        </div>
      )}

      {/* ── Siblings Card ── */}
      {immediateFamily.siblings.length > 0 && (
        <div className="glass-card">
          <div className="glass-card-header">
            <User size={18} />
            <span>Siblings</span>
          </div>
          <div>
            {immediateFamily.siblings.map(sib => (
              <div
                key={sib.person.person_id}
                className="sibling-item"
                onClick={() => onNodeClick(sib.person.person_id)}
              >
                <span>{sib.person.first_name} {sib.person.last_name}</span>
                <span className={`pill ${sib.type === 'Full-Sibling' ? 'pill-full' : 'pill-half'}`}>
                  {sib.type === 'Full-Sibling' ? 'Full' : 'Half'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ── Relationships Card (Edit/Delete) ── */}
      {relationships.length > 0 && (
        <div className="glass-card">
          <div className="glass-card-header">
            <Link2 size={18} />
            <span>Relationships ({relationships.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {relationships.map((rel: any) => {
              const isP1 = rel.person_id_1 === person.person_id;
              const otherId = isP1 ? rel.person_id_2 : rel.person_id_1;
              const otherPerson = people.find(p => p.person_id === otherId);
              const otherName = otherPerson
                ? `${otherPerson.first_name} ${otherPerson.last_name}`
                : `Person #${otherId}`;

              return (
                <div
                  key={rel.relationship_id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.6rem',
                    background: 'rgba(239, 233, 222, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 233, 222, 0.06)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => onNodeClick(otherId)}
                    >
                      {otherName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {rel.relationship_type}
                      {rel.subtype && rel.subtype !== 'None' ? ` · ${rel.subtype}` : ''}
                      {rel.status ? ` · ${rel.status}` : ''}
                    </div>
                  </div>
                  {(userRole === 'Admin') && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                      {onEditRelationship && (
                        <button
                          onClick={() => onEditRelationship(rel)}
                          title="Edit relationship"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: 'rgba(214, 164, 64, 0.15)', border: '1px solid rgba(214, 164, 64, 0.3)',
                            color: 'var(--accent-ink)', cursor: 'pointer',
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      {onDeleteRelationship && (
                        <button
                          onClick={() => onDeleteRelationship(rel.relationship_id)}
                          title="Delete relationship"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: 'rgba(201, 83, 63, 0.15)', border: '1px solid rgba(201, 83, 63, 0.3)',
                            color: 'var(--kente-clay-ink)', cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
