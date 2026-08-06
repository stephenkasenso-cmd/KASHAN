import React, { useState, useEffect } from 'react';
import { Crown, Link2, Users, AlertCircle, Info, Check, X } from 'lucide-react';

export interface PersonOption {
  person_id: number;
  first_name: string;
  last_name: string;
  fullName?: string | null;
  gender: string;
  profession?: string | null;
  bio?: string | null;
  dynasticNumber?: number | null;
}

export interface EstablishRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonOption[];
  onRelationshipEstablished: () => void;
  initialPerson1Id?: number | null;
  initialPerson2Id?: number | null;
}

export type CategoryTab = 'BIOLOGICAL' | 'ROYAL_PEER';

export const EstablishRelationshipModal: React.FC<EstablishRelationshipModalProps> = ({
  isOpen,
  onClose,
  people,
  onRelationshipEstablished,
  initialPerson1Id,
  initialPerson2Id
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('BIOLOGICAL');

  // Search & Selector State
  const [p1Query, setP1Query] = useState('');
  const [selectedP1, setSelectedP1] = useState<PersonOption | null>(null);
  const [p1Focused, setP1Focused] = useState(false);

  const [p2Query, setP2Query] = useState('');
  const [selectedP2, setSelectedP2] = useState<PersonOption | null>(null);
  const [p2Focused, setP2Focused] = useState(false);

  // Form State
  const [category, setCategory] = useState<string>('PARENT_CHILD');
  const [subtype, setSubtype] = useState<string>('Biological');
  const [traditionalRole, setTraditionalRole] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [recommendedCategories, setRecommendedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize selected entities from props
  useEffect(() => {
    if (initialPerson1Id) {
      const p1 = people.find(p => p.person_id === initialPerson1Id);
      if (p1) {
        setSelectedP1(p1);
        setP1Query(p1.fullName || `${p1.first_name} ${p1.last_name}`);
      }
    }
    if (initialPerson2Id) {
      const p2 = people.find(p => p.person_id === initialPerson2Id);
      if (p2) {
        setSelectedP2(p2);
        setP2Query(p2.fullName || `${p2.first_name} ${p2.last_name}`);
      }
    }
  }, [initialPerson1Id, initialPerson2Id, people]);

  // Fetch dynamic available/recommended types when P1 and P2 change
  useEffect(() => {
    if (selectedP1 && selectedP2) {
      const token = localStorage.getItem('token');
      fetch(`/api/relationships/available-types?p1=${selectedP1.person_id}&p2=${selectedP2.person_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.recommendedCategories) {
            setRecommendedCategories(data.recommendedCategories);
            if (data.recommendedCategories.includes('DYNASTIC_SUCCESSOR')) {
              setActiveTab('ROYAL_PEER');
              setCategory('DYNASTIC_SUCCESSOR');
            }
          }
        })
        .catch(() => {});
    }
  }, [selectedP1, selectedP2]);

  if (!isOpen) return null;

  const filteredP1List = people.filter(p => {
    const name = (p.fullName || `${p.first_name} ${p.last_name}`).toLowerCase();
    return name.includes(p1Query.toLowerCase());
  });

  const filteredP2List = people.filter(p => {
    const name = (p.fullName || `${p.first_name} ${p.last_name}`).toLowerCase();
    return name.includes(p2Query.toLowerCase()) && p.person_id !== selectedP1?.person_id;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedP1 || !selectedP2) {
      setError('Please select both Person A and Person B.');
      return;
    }

    if (selectedP1.person_id === selectedP2.person_id) {
      setError('Person A and Person B cannot be the same individual.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/relationships/establish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          person1Id: selectedP1.person_id,
          person2Id: selectedP2.person_id,
          category,
          subtype,
          traditionalRole: traditionalRole.trim() || null,
          startDate: startDate || null,
          endDate: endDate || null,
          notes: notes.trim() || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to establish relationship.');
      }

      setSuccessMsg('Relationship established successfully!');
      setTimeout(() => {
        onRelationshipEstablished();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '660px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(17, 24, 39, 0.8))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: '10px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f9fafb', margin: 0 }}>
                Establish Relationship Wizard
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, marginTop: '2px' }}>
                HCI-simplified workflow for biological ancestry and dynastic peer links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Feedback Banners */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#fca5a5',
              fontSize: '0.8rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#6ee7b7',
              fontSize: '0.8rem'
            }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Entity Selectors: Person A & Person B */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Person A Selector */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.35rem' }}>
                Person A (Origin / Predecessor)
              </label>
              <input
                type="text"
                value={p1Query}
                onChange={e => {
                  setP1Query(e.target.value);
                  setSelectedP1(null);
                }}
                onFocus={() => setP1Focused(true)}
                onBlur={() => setTimeout(() => setP1Focused(false), 200)}
                placeholder="Search Person A..."
                style={{
                  width: '100%',
                  backgroundColor: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.825rem',
                  outline: 'none'
                }}
              />
              {selectedP1 && (
                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Check size={12} /> {selectedP1.fullName || `${selectedP1.first_name} ${selectedP1.last_name}`}
                </div>
              )}
              {p1Focused && !selectedP1 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  backgroundColor: '#0e1726',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  {filteredP1List.map(p => (
                    <div
                      key={p.person_id}
                      onMouseDown={() => {
                        setSelectedP1(p);
                        setP1Query(p.fullName || `${p.first_name} ${p.last_name}`);
                      }}
                      style={{
                        padding: '0.55rem 0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{p.fullName || `${p.first_name} ${p.last_name}`}</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{p.profession || p.gender}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Person B Selector */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d1d5db', marginBottom: '0.35rem' }}>
                Person B (Target / Successor / Child)
              </label>
              <input
                type="text"
                value={p2Query}
                onChange={e => {
                  setP2Query(e.target.value);
                  setSelectedP2(null);
                }}
                onFocus={() => setP2Focused(true)}
                onBlur={() => setTimeout(() => setP2Focused(false), 200)}
                placeholder="Search Person B..."
                style={{
                  width: '100%',
                  backgroundColor: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.825rem',
                  outline: 'none'
                }}
              />
              {selectedP2 && (
                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Check size={12} /> {selectedP2.fullName || `${selectedP2.first_name} ${selectedP2.last_name}`}
                </div>
              )}
              {p2Focused && !selectedP2 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  backgroundColor: '#0e1726',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  {filteredP2List.map(p => (
                    <div
                      key={p.person_id}
                      onMouseDown={() => {
                        setSelectedP2(p);
                        setP2Query(p.fullName || `${p.first_name} ${p.last_name}`);
                      }}
                      style={{
                        padding: '0.55rem 0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <span style={{ fontWeight: 500, color: '#f3f4f6' }}>{p.fullName || `${p.first_name} ${p.last_name}`}</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{p.profession || p.gender}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '0.85rem' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('BIOLOGICAL');
                  setCategory('PARENT_CHILD');
                }}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'BIOLOGICAL' ? '2px solid #f59e0b' : '2px solid transparent',
                  color: activeTab === 'BIOLOGICAL' ? '#fbbf24' : '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Users size={14} />
                Biological & Family
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ROYAL_PEER');
                  setCategory('DYNASTIC_SUCCESSOR');
                }}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'ROYAL_PEER' ? '2px solid #f59e0b' : '2px solid transparent',
                  color: activeTab === 'ROYAL_PEER' ? '#fbbf24' : '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Crown size={14} />
                Royal & Peer Succession
                {recommendedCategories.includes('DYNASTIC_SUCCESSOR') && (
                  <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px' }}>
                    Recommended
                  </span>
                )}
              </button>
            </div>

            {/* Category Option Cards */}
            {activeTab === 'BIOLOGICAL' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setCategory('PARENT_CHILD')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'PARENT_CHILD' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'PARENT_CHILD' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'PARENT_CHILD' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Parent-Child</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Biological parent to child link</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('SIBLING')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'SIBLING' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'SIBLING' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'SIBLING' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Sibling</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Brother or sister relation</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('SPOUSE')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'SPOUSE' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'SPOUSE' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'SPOUSE' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Spouse</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Marriage or marital partner</div>
                </button>
              </div>
            )}

            {activeTab === 'ROYAL_PEER' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setCategory('DYNASTIC_SUCCESSOR')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'DYNASTIC_SUCCESSOR' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'DYNASTIC_SUCCESSOR' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'DYNASTIC_SUCCESSOR' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Dynastic Successor</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Horizontal peer link (Predecessor → Successor)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('QUEEN_MOTHER_STOOL_PAIR')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'QUEEN_MOTHER_STOOL_PAIR' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'QUEEN_MOTHER_STOOL_PAIR' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'QUEEN_MOTHER_STOOL_PAIR' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Stool Counterpart</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Male Chief & Female Queen Mother pair</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('FEKUO_SUB_STOOL')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: category === 'FEKUO_SUB_STOOL' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: category === 'FEKUO_SUB_STOOL' ? 'rgba(245, 158, 11, 0.1)' : '#0b0f19',
                    color: category === 'FEKUO_SUB_STOOL' ? '#fcd34d' : '#d1d5db',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>Divisional Wing</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Paramountcy to sub-stool link</div>
                </button>
              </div>
            )}
          </div>

          {/* Contextual Info Banner */}
          {category === 'DYNASTIC_SUCCESSOR' && (
            <div style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
              color: '#fcd34d',
              fontSize: '0.75rem'
            }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Dynastic Rule:</strong> Dynastic succession creates a horizontal peer connection on the Golden Stool without nesting under parent nodes.
              </span>
            </div>
          )}

          {category === 'PARENT_CHILD' && (
            <div style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
              color: '#93c5fd',
              fontSize: '0.75rem'
            }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Matrilineal Rule:</strong> Mother-child links automatically assign the mother's biological Abusua (Clan).
              </span>
            </div>
          )}

          {/* Metadata Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.25rem' }}>
                Role / Wing
              </label>
              <input
                type="text"
                value={traditionalRole}
                onChange={e => setTraditionalRole(e.target.value)}
                placeholder="e.g. Krontihene"
                style={{
                  width: '100%',
                  backgroundColor: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem',
                  color: '#fff',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.25rem' }}>
                Start / Reign Start
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem',
                  color: '#fff',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.25rem' }}>
                End / Reign End
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem',
                  color: '#fff',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.25rem' }}>
              Historical Notes / Customary Details
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Historical context, court rulings, or treaty notes..."
              style={{
                width: '100%',
                backgroundColor: '#0b0f19',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.5rem 0.65rem',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Modal Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.65rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#d1d5db',
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#000',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              <Link2 size={14} />
              {isSubmitting ? 'Establishing...' : 'Establish Relationship'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
