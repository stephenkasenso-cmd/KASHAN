import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Copy, 
  Trash2, 
  Search, 
  Plus, 
  Check, 
  AlertTriangle, 
  X, 
  UserCheck, 
  UserX, 
  Phone, 
  CreditCard, 
  MapPin, 
  Calendar,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { PersonForm } from './PersonForm';

export interface Person {
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

interface IndividualRegistrationTableProps {
  people: Person[];
  userRole: 'Admin' | 'Manager' | 'Staff';
  onPersonUpdated: (updatedPerson: Person) => void;
  onPersonDeleted: (personId: number) => void;
  onPersonCreated: (newPerson: Person) => void;
  onSelectPerson?: (person: Person) => void;
}

export const IndividualRegistrationTable: React.FC<IndividualRegistrationTableProps> = ({
  people,
  userRole,
  onPersonUpdated,
  onPersonDeleted,
  onPersonCreated,
  onSelectPerson
}) => {
  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reference Data State
  const [clans, setClans] = useState<{ id: number; name: string }[]>([]);
  const [paramountcies, setParamountcies] = useState<{ id: number; name: string }[]>([]);
  const [subStools, setSubStools] = useState<{ id: number; name: string }[]>([]);

  // Action Modals State
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [duplicatePerson, setDuplicatePerson] = useState<Person | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/royal/clans').then(r => r.json()).then(setClans).catch(console.error);
    fetch('/api/royal/paramountcies').then(r => r.json()).then(setParamountcies).catch(console.error);
    fetch('/api/royal/sub-stools').then(r => r.json()).then(setSubStools).catch(console.error);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Action Handler: Copy to Clipboard & Duplicate Option
  const handleCopyRecord = (person: Person) => {
    const clanName = clans.find(c => c.id === person.clan_id)?.name || 'N/A';
    const stoolName = paramountcies.find(p => p.id === person.paramountcy_id)?.name || 'N/A';

    const copyText = `
INDIVIDUAL REGISTRATION RECORD #${person.person_id}
Name: ${person.first_name} ${person.last_name} ${person.maiden_name ? `(née ${person.maiden_name})` : ''}
Gender: ${person.gender}
Status: ${person.is_living ? 'Living' : 'Deceased'}
Birth Date: ${formatDate(person.birth_date)} | Place: ${person.birth_place || 'N/A'}
${!person.is_living ? `Death Date: ${formatDate(person.death_date)} | Place: ${person.death_place || 'N/A'}\n` : ''}
Abusua (Clan): ${clanName}
Stool / Paramountcy: ${stoolName}
Ghana Card: ${person.ghana_card || 'N/A'}
Phone: ${person.phone || 'N/A'}
GPS Address: ${person.gps_address || 'N/A'}
`.trim();

    navigator.clipboard.writeText(copyText);
    setCopiedId(person.person_id);
    showToast(`Copied ${person.first_name} ${person.last_name}'s details to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDuplicateRecord = (person: Person) => {
    // Open creation modal populated with duplicate fields (excluding person_id & ghana_card)
    const cloneData = {
      ...person,
      person_id: 0,
      first_name: `${person.first_name} (Copy)`,
      ghana_card: ''
    };
    setDuplicatePerson(cloneData);
    setIsCreating(true);
    showToast(`Pre-filled duplicate registration form for ${person.first_name}`);
  };

  // Action Handler: Delete Execution
  const confirmDeleteRecord = async () => {
    if (!deletingPerson) return;
    setIsSubmittingDelete(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/people/${deletingPerson.person_id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole }
      });

      const data = await response.json();

      if (response.ok) {
        onPersonDeleted(deletingPerson.person_id);
        showToast(`Successfully deleted ${deletingPerson.first_name} ${deletingPerson.last_name}`);
        setDeletingPerson(null);
      } else {
        setActionError(data.error || 'Failed to delete record.');
      }
    } catch (err: any) {
      setActionError('Network error while requesting deletion.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Filtered List Computation
  const filteredPeople = people.filter(p => {
    const fullName = `${p.first_name} ${p.last_name} ${p.maiden_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          (p.ghana_card && p.ghana_card.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.phone && p.phone.includes(searchQuery));
    
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'LIVING' && p.is_living) || 
                          (statusFilter === 'DECEASED' && !p.is_living);

    return matchesSearch && matchesGender && matchesStatus;
  });

  const canEditOrDelete = userRole === 'Admin' || userRole === 'Manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--accent-gradient)',
          color: 'white',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0 }}>
            Individual Registration Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Manage, edit, copy, and maintain lineage registration entries ({filteredPeople.length} total)
          </p>
        </div>

        <button
          onClick={() => { setDuplicatePerson(null); setIsCreating(true); }}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
          disabled={userRole === 'Staff'}
        >
          <Plus size={16} /> Register New Individual
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, Ghana Card, or phone..."
            style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
            <option value="ALL">All Statuses</option>
            <option value="LIVING">Living Only</option>
            <option value="DECEASED">Deceased Only</option>
          </select>
        </div>
      </div>

      {/* Main Registrations Data Table */}
      <div className="glass-card registration-table-wrapper" style={{ padding: 0, maxHeight: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '100%', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>ID & Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gender / Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dates & Birthplace</th>
                <th style={{ padding: '0.85rem 1rem' }}>Abusua (Clan) & Stool</th>
                <th style={{ padding: '0.85rem 1rem' }}>Identifiers & Contact</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center', minWidth: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No registration records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPeople.map(p => {
                  const clanName = clans.find(c => c.id === p.clan_id)?.name;
                  const stoolName = paramountcies.find(param => param.id === p.paramountcy_id)?.name;

                  return (
                    <tr 
                      key={p.person_id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s',
                        cursor: onSelectPerson ? 'pointer' : 'default'
                      }}
                      className="table-row-hover"
                    >
                      {/* Name & ID */}
                      <td style={{ padding: '0.85rem 1rem' }} onClick={() => onSelectPerson?.(p)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: p.gender === 'Female' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: p.gender === 'Female' ? '#f472b6' : '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0
                          }}>
                            #{p.person_id}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {p.first_name} {p.last_name}
                            </div>
                            {p.maiden_name && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                née {p.maiden_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gender & Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span>{p.gender}</span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            width: 'fit-content',
                            background: p.is_living ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: p.is_living ? '#34d399' : '#f87171'
                          }}>
                            {p.is_living ? <UserCheck size={12} /> : <UserX size={12} />}
                            {p.is_living ? 'Living' : 'Deceased'}
                          </span>
                        </div>
                      </td>

                      {/* Dates & Birthplace */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                            <Calendar size={12} /> {formatDate(p.birth_date)}
                          </span>
                          {p.birth_place && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                              <MapPin size={12} /> {p.birth_place}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Clan & Stool */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {clanName ? (
                            <span className="pill pill-half" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.72rem' }}>
                              Clan: {clanName}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Clan</span>}

                          {stoolName && (
                            <span className="pill pill-half" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.72rem' }}>
                              {stoolName}
                            </span>
                          )}
                          {p.sub_stool_id && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Sub: {subStools.find(s => s.id === p.sub_stool_id)?.name || 'Stool'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Identifiers */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {p.ghana_card && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CreditCard size={12} style={{ color: 'var(--accent-primary)' }} /> {p.ghana_card}
                            </span>
                          )}
                          {p.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Phone size={12} style={{ color: 'var(--success)' }} /> {p.phone}
                            </span>
                          )}
                          {!p.ghana_card && !p.phone && <span style={{ color: 'var(--text-muted)' }}>None recorded</span>}
                        </div>
                      </td>

                      {/* ACTIONS COLUMN (Feature 1 Requirement) */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                          
                          {/* 1. EDIT BUTTON */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingPerson(p); }}
                            title="Edit individual details"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: canEditOrDelete ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              border: canEditOrDelete ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: canEditOrDelete ? '#a5b4fc' : 'var(--text-muted)',
                              cursor: canEditOrDelete ? 'pointer' : 'not-allowed',
                              transition: 'transform 0.15s, background 0.15s'
                            }}
                            disabled={!canEditOrDelete}
                          >
                            <Pencil size={15} />
                          </button>

                          {/* 2. COPY / DUPLICATE BUTTON */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyRecord(p); }}
                            onContextMenu={(e) => { e.preventDefault(); handleDuplicateRecord(p); }}
                            title="Click to copy details / Right-click to duplicate"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: copiedId === p.person_id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                              border: copiedId === p.person_id ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
                              color: copiedId === p.person_id ? '#34d399' : '#38bdf8',
                              cursor: 'pointer',
                              transition: 'transform 0.15s, background 0.15s'
                            }}
                          >
                            {copiedId === p.person_id ? <Check size={15} /> : <Copy size={15} />}
                          </button>

                          {/* 3. DELETE BUTTON */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingPerson(p); }}
                            title="Delete individual record"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: canEditOrDelete ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              border: canEditOrDelete ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              color: canEditOrDelete ? '#f87171' : 'var(--text-muted)',
                              cursor: canEditOrDelete ? 'pointer' : 'not-allowed',
                              transition: 'transform 0.15s, background 0.15s'
                            }}
                            disabled={!canEditOrDelete}
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL DIALOG */}
      {editingPerson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <button
              onClick={() => setEditingPerson(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <PersonForm
              existingPerson={editingPerson}
              userRole={userRole}
              onPersonCreated={(updated) => {
                onPersonUpdated(updated);
                setEditingPerson(null);
                showToast(`Updated ${updated.first_name} ${updated.last_name}`);
              }}
            />
          </div>
        </div>
      )}

      {/* CREATE / DUPLICATE MODAL DIALOG */}
      {isCreating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <button
              onClick={() => { setIsCreating(false); setDuplicatePerson(null); }}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <PersonForm
              existingPerson={duplicatePerson || undefined}
              userRole={userRole}
              onPersonCreated={(newPerson) => {
                onPersonCreated(newPerson);
                setIsCreating(false);
                setDuplicatePerson(null);
                showToast(`Registered ${newPerson.first_name} ${newPerson.last_name}`);
              }}
            />
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {deletingPerson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                Confirm Record Deletion
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deletingPerson.first_name} {deletingPerson.last_name}</strong> (ID #{deletingPerson.person_id})?
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                This action is permanent and will cascade to associated relationships.
              </div>
            </div>

            {actionError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <ShieldAlert size={14} />
                <span>{actionError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDeletingPerson(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
                disabled={isSubmittingDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteRecord}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  opacity: isSubmittingDelete ? 0.6 : 1
                }}
                disabled={isSubmittingDelete}
              >
                {isSubmittingDelete ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
