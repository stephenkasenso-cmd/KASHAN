import React, { useState, useEffect } from 'react';
import { Search, MapPin, Shield, Crown, Plus, X, Upload, Trash2, Layers, History } from 'lucide-react';
import { EnthronementForm } from './EnthronementForm';
import { HistoricalLineage } from './HistoricalLineage';

interface UserSession {
  user_id: number;
  username: string;
  role: 'Admin' | 'Manager' | 'Staff';
}

interface TraditionalStool {
  id: number;
  stoolName: string;
  title: string;
  town: string;
  region: string;
  category: string;
  rank: string;
  currentOccupant: string | null;
  clan: string | null;
  palaceName: string | null;
  seatLocation: string | null;
  enstoolmentDate: string | null;
  imageUrl: string | null;
  militaryWing: string | null;
  parentStoolId: number | null;
  parentStool?: TraditionalStool | null;
  queenMotherStoolId: number | null;
  queenMotherStool?: TraditionalStool | null;
  chiefStool?: TraditionalStool | null;
  notes: string | null;
}

interface StoolsDashboardProps {
  currentUser: UserSession;
}

const CLANS = [
  'Aduana',
  'Agona',
  'Asakyiri',
  'Aseneɛ',
  'Asona',
  'Bretuo',
  'Ɛkoɔna',
  'Ɔyokoɔ',
  'Asogli',
  'Other / Akan'
];

const MILITARY_WINGS = [
  'Supreme Commander',
  'Krontihene',
  'Nifahene',
  'Benkumhene',
  'Adontenhene',
  'Gyaasehene',
  'Kyidomhene',
  'Ankobeahene',
  'Akwamuhene',
  'Sanaahene',
  'Oyokohene',
  'Other / Independent'
];

const RANKS = [
  { value: 'KING', label: 'King (e.g. Asantehene)' },
  { value: 'QUEEN_MOTHER_SUPREME', label: 'Queen Mother Supreme (e.g. Asantehemaa)' },
  { value: 'AMANHENE', label: 'Paramount Chief (Amanhene)' },
  { value: 'AMANHEMAA', label: 'Paramount Queen Mother (Amanhemaa)' },
  { value: 'DIVISIONAL_CHIEF', label: 'Divisional Chief (Ohene / Fekuo Head)' },
  { value: 'DIVISIONAL_QUEEN_MOTHER', label: 'Sub-Queen Mother / Fekuo Ohemaa' },
  { value: 'SUB_CHIEF', label: 'Sub-Chief' },
  { value: 'SUB_QUEEN_MOTHER', label: 'Sub-Queen Mother' }
];

const CATEGORIES = [
  { value: 'AMANTOO_FOUNDING', label: 'Founding Amantoo Stools' },
  { value: 'KUMASI_DIVISIONAL', label: 'Kumasi Divisional (Fekuo)' },
  { value: 'REGIONAL_PARAMOUNT', label: 'Regional Paramount' },
  { value: 'DIVISIONAL_SUB', label: 'Divisional Sub-Stool' },
  { value: 'GENERAL_GHANA_TRADITIONAL', label: 'General Ghana Traditional' }
];

const REGIONS = [
  'Ashanti',
  'Eastern',
  'Volta',
  'Greater Accra',
  'Central',
  'Western',
  'Bono',
  'Bono East',
  'Ahafo',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Oti',
  'Western North'
];

export const StoolsDashboard: React.FC<StoolsDashboardProps> = ({ currentUser }) => {
  const [stools, setStools] = useState<TraditionalStool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chiefs' | 'queenMothers' | 'lineage'>('chiefs');
  const [isEnthroneOpen, setIsEnthroneOpen] = useState(false);
  
  // Search & Filters
  const [filterClan, setFilterClan] = useState('');
  const [filterSeat, setFilterSeat] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStoolId, setEditingStoolId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form States
  const [stoolName, setStoolName] = useState('');
  const [title, setTitle] = useState('');
  const [town, setTown] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [category, setCategory] = useState(CATEGORIES[2].value); // Default REGIONAL_PARAMOUNT
  const [rank, setRank] = useState(RANKS[2].value); // Default AMANHENE
  const [currentOccupant, setCurrentOccupant] = useState('');
  const [clan, setClan] = useState(CLANS[0]);
  const [palaceName, setPalaceName] = useState('');
  const [seatLocation, setSeatLocation] = useState('');
  const [enstoolmentDate, setEnstoolmentDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [militaryWing, setMilitaryWing] = useState(MILITARY_WINGS[1]); // Default Krontihene
  const [parentStoolId, setParentStoolId] = useState<string>('');
  const [queenMotherStoolId, setQueenMotherStoolId] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStools();
  }, []);

  const fetchStools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/traditional-stools');
      if (response.ok) {
        const data = await response.json();
        setStools(data);
      }
    } catch (err) {
      console.error("Failed to fetch traditional stools:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError("Image file is too large (max 8MB).");
        return;
      }
      
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'x-user-role': currentUser.role
          },
          body: formData
        });

        const data = await response.json();
        if (response.ok) {
          setImageUrl(data.imageUrl);
        } else {
          setError(data.error || "Failed to upload image");
        }
      } catch (err) {
        setError("Network error uploading image");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const openAddModal = () => {
    setEditingStoolId(null);
    setStoolName('');
    setTitle('');
    setTown('');
    setRegion(REGIONS[0]);
    setCategory(activeTab === 'chiefs' ? 'REGIONAL_PARAMOUNT' : 'AMANTOO_FOUNDING');
    setRank(activeTab === 'chiefs' ? 'AMANHENE' : 'AMANHEMAA');
    setCurrentOccupant('');
    setClan(CLANS[0]);
    setPalaceName('');
    setSeatLocation('');
    setEnstoolmentDate('');
    setImageUrl(null);
    setMilitaryWing(MILITARY_WINGS[1]);
    setParentStoolId('');
    setQueenMotherStoolId('');
    setIsModalOpen(true);
  };

  const openEditModal = (stool: TraditionalStool) => {
    setEditingStoolId(stool.id);
    setStoolName(stool.stoolName);
    setTitle(stool.title);
    setTown(stool.town);
    setRegion(stool.region);
    setCategory(stool.category);
    setRank(stool.rank);
    setCurrentOccupant(stool.currentOccupant || '');
    setClan(stool.clan || CLANS[0]);
    setPalaceName(stool.palaceName || '');
    setSeatLocation(stool.seatLocation || '');
    setEnstoolmentDate(stool.enstoolmentDate ? new Date(stool.enstoolmentDate).toISOString().split('T')[0] : '');
    setImageUrl(stool.imageUrl);
    setMilitaryWing(stool.militaryWing || MILITARY_WINGS[1]);
    setParentStoolId(stool.parentStoolId?.toString() || '');
    setQueenMotherStoolId(stool.queenMotherStoolId?.toString() || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStoolId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!stoolName || !title || !town || !region || !rank) {
      setError("Please fill out all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const url = editingStoolId ? `/api/traditional-stools/${editingStoolId}` : '/api/traditional-stools';
      const method = editingStoolId ? 'PUT' : 'POST';

      const bodyData: any = {
        stoolName,
        title,
        town,
        region,
        category,
        rank,
        currentOccupant: currentOccupant || null,
        clan: clan || null,
        palaceName: palaceName || null,
        seatLocation: seatLocation || null,
        enstoolmentDate: enstoolmentDate || null,
        imageUrl,
        militaryWing: militaryWing || null,
        parentStoolId: parentStoolId ? parseInt(parentStoolId, 10) : null,
        queenMotherStoolId: queenMotherStoolId ? parseInt(queenMotherStoolId, 10) : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save Traditional Stool");

      handleCloseModal();
      await fetchStools();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStool = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this traditional stool? This will sever all nested relationships.")) return;
    try {
      const response = await fetch(`/api/traditional-stools/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role
        }
      });
      if (response.ok) {
        await fetchStools();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete traditional stool");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isWriteAllowed = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isAdmin = currentUser.role === 'Admin';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Grouping & Filtering Stools
  let filteredStools = stools;
  if (filterClan) filteredStools = filteredStools.filter(s => s.clan?.toLowerCase().includes(filterClan.toLowerCase()));
  if (filterSeat) filteredStools = filteredStools.filter(s => (s.seatLocation || s.town).toLowerCase().includes(filterSeat.toLowerCase()));
  if (filterRegion) filteredStools = filteredStools.filter(s => s.region === filterRegion);
  if (filterCategory) filteredStools = filteredStools.filter(s => s.category === filterCategory);

  // Split into Chiefs and Queen Mothers based on Rank
  const chiefRanks = ['KING', 'AMANHENE', 'DIVISIONAL_CHIEF', 'SUB_CHIEF'];
  const qmRanks = ['QUEEN_MOTHER_SUPREME', 'AMANHEMAA', 'DIVISIONAL_QUEEN_MOTHER', 'SUB_QUEEN_MOTHER'];

  const displayedStools = filteredStools.filter(s => 
    activeTab === 'chiefs' ? chiefRanks.includes(s.rank) : qmRanks.includes(s.rank)
  );

  // Grouped by Category for structured rendering
  const groupedStools: Record<string, TraditionalStool[]> = {};
  CATEGORIES.forEach(cat => {
    groupedStools[cat.value] = displayedStools.filter(s => s.category === cat.value);
  });

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = stools.find(s => s.id === parentId);
    return parent ? `${parent.title} (${parent.town})` : 'Superior Stool';
  };

  if (loading) {
    return <div style={{ padding: '6rem 2rem 2rem 2rem', color: 'var(--text-secondary)' }}>Loading Universal Traditional Councils...</div>;
  }

  // Find partner candidates (for dropdown selects)
  const chiefStoolsList = stools.filter(s => chiefRanks.includes(s.rank));
  const qmStoolsList = stools.filter(s => qmRanks.includes(s.rank));

  return (
    <div style={{ padding: '6rem 2rem 2rem 2rem', height: '100%', overflowY: 'auto' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Crown style={{ color: 'var(--accent-primary)' }} />
            Traditional Leadership & Councils
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Unified register of Monarchs, Paramount stools, Queen Mothers, and Divisional Wings across all traditional areas in Ghana.
          </p>
        </div>
        {isWriteAllowed && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setIsEnthroneOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crown size={18} /> Enthrone Leader
            </button>
            <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Add Traditional Stool
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('chiefs')}
          className={`tab-btn ${activeTab === 'chiefs' ? 'active' : ''}`}
          style={{
            background: activeTab === 'chiefs' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            color: activeTab === 'chiefs' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Crown size={18} /> Chiefs & Paramount Rulers
        </button>
        <button 
          onClick={() => setActiveTab('queenMothers')}
          className={`tab-btn ${activeTab === 'queenMothers' ? 'active' : ''}`}
          style={{
            background: activeTab === 'queenMothers' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            color: activeTab === 'queenMothers' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Shield size={18} /> Queen Mothers & Matriarchs
        </button>
        <button 
          onClick={() => setActiveTab('lineage')}
          className={`tab-btn ${activeTab === 'lineage' ? 'active' : ''}`}
          style={{
            background: activeTab === 'lineage' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            color: activeTab === 'lineage' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <History size={18} /> Historical Lineage
        </button>
      </div>

      {activeTab === 'lineage' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <HistoricalLineage titleType="CHIEF" />
          <HistoricalLineage titleType="QUEEN_MOTHER" />
        </div>
      ) : (<>

      {/* Filters Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Clan..."
            value={filterClan}
            onChange={(e) => setFilterClan(e.target.value)}
          />
        </div>
        <div className="search-bar">
          <MapPin size={18} />
          <input
            type="text"
            placeholder="Search by Town/Location..."
            value={filterSeat}
            onChange={(e) => setFilterSeat(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <select 
            value={filterRegion} 
            onChange={(e) => setFilterRegion(e.target.value)}
            style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', padding: '0.5rem' }}
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', padding: '0.5rem' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Hero context for Queen Mothers role (Mandatory knowledge integration) */}
      {activeTab === 'queenMothers' && (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          padding: '2rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#f472b6' }}>
            <Crown size={24} />
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: '#fbcfe8' }}>
              Customary Authority & Matriarchal Governance of Queen Mothers (Ahemaa)
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Ahemaa (Queen Mothers) are direct custodians of matrilineal lineage (*Abusua*) and traditional rulers. They exercise critical constitutional responsibilities including:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <h4 style={{ color: '#f472b6', marginBottom: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>1. Stool Nomination</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Holding the exclusive customary right to nominate and present the successor for a vacant chief stool to the traditional council.
              </p>
            </div>
            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <h4 style={{ color: '#c084fc', marginBottom: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>2. Customary Judicial Power</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Presiding over local traditional courts, resolving domestic, marital, ethical, and inheritance conflicts according to customary law.
              </p>
            </div>
            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>3. Guardians of Lineage</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Serving as official genealogists, safeguarding royal family registries, and authenticating lineages (*Abusua*) to ensure legitimate successions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Render Stools Grouped by Category */}
      {CATEGORIES.map(cat => {
        const catStools = groupedStools[cat.value];
        if (catStools.length === 0) return null;

        return (
          <div key={cat.value} style={{ marginBottom: '3rem' }}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <Layers size={20} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
                {cat.label}
              </h3>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                {catStools.length}
              </span>
            </div>

            {/* Stool Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {catStools.map(stool => {
                const parentName = getParentName(stool.parentStoolId);
                const partnerStool = stool.queenMotherStool || stool.chiefStool;

                return (
                  <div 
                    key={stool.id} 
                    className="glass-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1rem', 
                      minHeight: '220px', 
                      borderLeft: `4px solid ${activeTab === 'chiefs' ? 'var(--accent-primary)' : '#ec4899'}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      {stool.imageUrl ? (
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={stool.imageUrl} alt={stool.stoolName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {activeTab === 'chiefs' ? <Crown size={24} style={{ color: 'var(--accent-primary)' }} /> : <Shield size={24} style={{ color: '#f472b6' }} />}
                        </div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                          {stool.title}
                        </div>
                        <div style={{ color: activeTab === 'chiefs' ? 'var(--accent-primary)' : '#f472b6', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.15rem' }}>
                          {stool.currentOccupant || 'Vacant / Unoccupied'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {stool.town}, {stool.region} Region
                        </div>
                      </div>
                    </div>

                    {/* Hierarchy Breadcrumbs / Path */}
                    {parentName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <span style={{ fontWeight: 600 }}>Under:</span>
                        <span>{parentName}</span>
                      </div>
                    )}

                    {/* Details list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stool:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{stool.stoolName}</span>
                      </div>
                      {stool.clan && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Clan / Abusua:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{stool.clan}</span>
                        </div>
                      )}
                      {partnerStool && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Counterpart:</span>
                          <span style={{ color: activeTab === 'chiefs' ? '#f472b6' : 'var(--accent-primary)', fontWeight: 500 }}>
                            {partnerStool.title} ({partnerStool.currentOccupant || 'Vacant'})
                          </span>
                        </div>
                      )}
                      {stool.enstoolmentDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Enstoolment:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{formatDate(stool.enstoolmentDate)}</span>
                        </div>
                      )}
                      {stool.notes && (
                        <div style={{ color: '#facc15', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                          • {stool.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isWriteAllowed && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          className="btn-outline" 
                          onClick={() => openEditModal(stool)}
                          style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          Edit Stool
                        </button>
                        {isAdmin && (
                          <button 
                            className="btn-outline" 
                            onClick={() => handleDeleteStool(stool.id)}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.4rem 0.6rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      </>)}

      {/* Enthronement Modal */}
      {isEnthroneOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <EnthronementForm
              userRole={currentUser.role}
              onCancel={() => setIsEnthroneOpen(false)}
              onSuccess={async () => { setIsEnthroneOpen(false); await fetchStools(); }}
            />
          </div>
        </div>
      )}

      {/* Unified Create / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.5rem' }}>
              {editingStoolId ? 'Edit Traditional Stool' : 'Add Traditional Stool'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Stool Name *</label>
                  <input 
                    type="text" 
                    value={stoolName} 
                    onChange={e => setStoolName(e.target.value)} 
                    placeholder="e.g. Amaniampong Silver Stool" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Title / Office *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Mamponhene, Mamponhemaa" 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Traditional Rank *</label>
                  <select value={rank} onChange={e => setRank(e.target.value)} required>
                    {RANKS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stool Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Town / City *</label>
                  <input 
                    type="text" 
                    value={town} 
                    onChange={e => setTown(e.target.value)} 
                    placeholder="e.g. Mampong" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Traditional Region *</label>
                  <select value={region} onChange={e => setRegion(e.target.value)} required>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Occupant (Name)</label>
                  <input 
                    type="text" 
                    value={currentOccupant} 
                    onChange={e => setCurrentOccupant(e.target.value)} 
                    placeholder="e.g. Daasebre Osei Bonsu II" 
                  />
                </div>
                <div className="form-group">
                  <label>Royal Clan (Abusua)</label>
                  <select value={clan} onChange={e => setClan(e.target.value)}>
                    {CLANS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Palace Name</label>
                  <input 
                    type="text" 
                    value={palaceName} 
                    onChange={e => setPalaceName(e.target.value)} 
                    placeholder="e.g. Amaniampong Palace" 
                  />
                </div>
                <div className="form-group">
                  <label>Seat Location Details</label>
                  <input 
                    type="text" 
                    value={seatLocation} 
                    onChange={e => setSeatLocation(e.target.value)} 
                    placeholder="e.g. Mampong, Ashanti Region" 
                  />
                </div>
              </div>

              {/* Hierarchical Parent Linking & Pairing */}
              <div className="form-row">
                <div className="form-group">
                  <label>Superior / Parent Stool (Hierarchical Council)</label>
                  <select value={parentStoolId} onChange={e => setParentStoolId(e.target.value)}>
                    <option value="">None (Independent / Supreme)</option>
                    {stools
                      .filter(s => s.id !== editingStoolId)
                      .map(s => <option key={s.id} value={s.id}>{s.title} ({s.town})</option>)
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Direct Counterpart Pairing (Chief/Queen Stool)</label>
                  <select value={queenMotherStoolId} onChange={e => setQueenMotherStoolId(e.target.value)}>
                    <option value="">None</option>
                    {/* If editing chief, counterpart list should be Queen Mothers, and vice-versa */}
                    {(chiefRanks.includes(rank) ? qmStoolsList : chiefStoolsList)
                      .filter(s => s.id !== editingStoolId)
                      .map(s => <option key={s.id} value={s.id}>{s.title} ({s.town})</option>)
                    }
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Military Wing (Divisional Rulers only)</label>
                  <select value={militaryWing} onChange={e => setMilitaryWing(e.target.value)}>
                    <option value="">None</option>
                    {MILITARY_WINGS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Enstoolment Date</label>
                  <input 
                    type="date" 
                    value={enstoolmentDate} 
                    onChange={e => setEnstoolmentDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stool Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <Upload size={16} /> Choose File
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {imageUrl && (
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setImageUrl(null)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '14px', height: '14px' }}><X size={10} /></button>
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
              
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }} 
                disabled={submitting || uploadingImage}
              >
                {submitting ? 'Saving...' : editingStoolId ? 'Update Traditional Stool' : 'Create Traditional Stool'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
