import { useState, useEffect } from 'react';
import { FamilyTree } from './components/FamilyTree';
import { PersonDetails } from './components/PersonDetails';
import { PersonForm } from './components/PersonForm';
import { RelationshipForm } from './components/RelationshipForm';
import { ReportsDashboard } from './components/ReportsDashboard';
import { Dashboards } from './components/Dashboards';
import { StoolsDashboard } from './components/StoolsDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { IndividualRegistrationTable } from './components/IndividualRegistrationTable';
import { Login } from './components/Login';
import { GitBranch, Search, AlertCircle, LogOut, Table as TableIcon } from 'lucide-react';

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

interface TreeNode {
  person: Person;
  generation: number;
  childId?: number | null;
  parentId?: number | null;
}

interface UserSession {
  user_id: number;
  username: string;
  email?: string | null;
  role: 'Admin' | 'Manager' | 'Staff';
  avatar_url?: string | null;
  token?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const stored = localStorage.getItem('family_tree_session');
    return stored ? JSON.parse(stored) : null;
  });

  const [people, setPeople] = useState<Person[]>([]);
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [ancestors, setAncestors] = useState<TreeNode[]>([]);
  const [descendants, setDescendants] = useState<TreeNode[]>([]);
  const [immediateFamily, setImmediateFamily] = useState<ImmediateFamily | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'tree' | 'reports' | 'stools' | 'table'>('dashboard');
  const [activeSettingsView, setActiveSettingsView] = useState<'paramountcies' | 'sub-stools' | 'regions' | 'users' | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const [personRelationships, setPersonRelationships] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('family_tree_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('family_tree_session');
    }
  }, [currentUser]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch list of all people
  const fetchPeopleList = async () => {
    try {
      const response = await fetch('/api/people');
      const data = await response.json();
      if (response.ok) {
        setPeople(data);
        if (data.length > 0 && !activePerson) {
          setActivePerson(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch people list:", error);
    }
  };

  // Fetch details of active person
  const fetchActivePersonTree = async (personId: number) => {
    try {
      const [familyRes, ancestorsRes, descendantsRes] = await Promise.all([
        fetch(`/api/people/${personId}/family`),
        fetch(`/api/people/${personId}/ancestors?generations=5`),
        fetch(`/api/people/${personId}/descendants?generations=5`)
      ]);

      const familyData = await familyRes.json();
      const ancestorsData = await ancestorsRes.json();
      const descendantsData = await descendantsRes.json();

      if (familyRes.ok) setImmediateFamily(familyData);
      if (ancestorsRes.ok) setAncestors(ancestorsData);
      if (descendantsRes.ok) setDescendants(descendantsData);
    } catch (error) {
      console.error("Failed to fetch family tree data:", error);
    }
  };

  useEffect(() => {
    fetchPeopleList();
  }, []);

  useEffect(() => {
    if (activePerson) {
      fetchActivePersonTree(activePerson.person_id);
      fetchPersonRelationships(activePerson.person_id);
      setEditingRelationship(null);
    }
  }, [activePerson]);

  const handlePersonCreated = (newPerson: Person) => {
    fetchPeopleList();
    setActivePerson(newPerson);
  };

  const handlePersonUpdated = (updated: Person) => {
    setPeople(prev => prev.map(p => p.person_id === updated.person_id ? updated : p));
    if (activePerson?.person_id === updated.person_id) {
      setActivePerson(updated);
    }
  };

  const handlePersonDeleted = (personId: number) => {
    setPeople(prev => {
      const nextList = prev.filter(p => p.person_id !== personId);
      if (activePerson?.person_id === personId) {
        setActivePerson(nextList.length > 0 ? nextList[0] : null);
      }
      return nextList;
    });
  };

  const handleRelationshipCreated = () => {
    setEditingRelationship(null);
    if (activePerson) {
      fetchActivePersonTree(activePerson.person_id);
      fetchPersonRelationships(activePerson.person_id);
    }
  };

  const fetchPersonRelationships = async (personId: number) => {
    try {
      const res = await fetch(`/api/people/${personId}/relationships`);
      if (res.ok) {
        const data = await res.json();
        setPersonRelationships(data);
      }
    } catch (err) {
      console.error('Failed to fetch relationships:', err);
    }
  };

  const handleDeleteRelationship = async (relId: number) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return;
    try {
      const res = await fetch(`/api/relationships/${relId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || '' }
      });
      if (res.ok) {
        handleRelationshipCreated();
      }
    } catch (err) {
      console.error('Failed to delete relationship:', err);
    }
  };

  const handleNodeClick = (personId: number) => {
    const selected = people.find(p => p.person_id === personId);
    if (selected) {
      setActivePerson(selected);
    }
  };

  const filteredSearch = people.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) {
    return <Login onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Left: Forms */}
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={20} strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Family Tree Manager
          </span>
        </div>

        {/* User Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '12px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                background: 'var(--bg-raised)',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '13px',
                fontWeight: 500
              }}>
                {currentUser.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  background: currentUser.role === 'Admin' ? 'var(--accent-primary)' : currentUser.role === 'Manager' ? 'var(--kente-rose)' : 'var(--kente-green)'
                }} />
                {currentUser.role}{currentUser.email ? ` · ${currentUser.email}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            title="Sign out"
            aria-label="Sign out"
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px' }}
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>

        <PersonForm onPersonCreated={handlePersonCreated} userRole={currentUser.role} />
        <RelationshipForm
          key={editingRelationship?.relationship_id || 'new'}
          people={people}
          onRelationshipCreated={handleRelationshipCreated}
          userRole={currentUser.role}
          existingRelationship={editingRelationship}
          onCancelEdit={() => setEditingRelationship(null)}
        />
      </div>

      {/* Center Stage Canvas */}
      <div className="canvas-container">
        <div className="canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="canvas-title">
              {activeView === 'tree' ? 'Lineage tree' : 
               activeView === 'table' ? 'Registrations' :
               activeView === 'stools' ? 'Stools' :
               activeView === 'reports' ? 'Reports' : 'Dashboard'}
            </div>
            <div className="view-tabs" role="tablist">
              {([
                ['dashboard', 'Dashboard'],
                ['table', 'Registrations'],
                ['tree', 'Lineage tree'],
                ['reports', 'Reports'],
                ['stools', 'Stools']
              ] as const).map(([view, label]) => (
                <button
                  key={view}
                  role="tab"
                  aria-selected={activeView === view && !activeSettingsView}
                  className={`view-tab ${activeView === view && !activeSettingsView ? 'active' : ''}`}
                  onClick={() => { setActiveView(view); setActiveSettingsView(null); }}
                >
                  {view === 'table' && <TableIcon size={14} strokeWidth={1.5} />}
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Canvas Search */}
          <div className="search-container" style={{ width: '220px', pointerEvents: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search people"
                style={{ paddingLeft: '2rem' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
              />
            </div>
            {isSearchFocused && searchQuery.trim() !== '' && filteredSearch.length > 0 && (
              <div className="search-results-dropdown">
                {filteredSearch.map(p => (
                  <div
                    key={p.person_id}
                    className="search-result-item"
                    onMouseDown={() => {
                      setActivePerson(p);
                      setSearchQuery('');
                    }}
                  >
                    {p.first_name} {p.last_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {activeSettingsView ? (
          <SettingsPanel 
            view={activeSettingsView} 
            onBack={() => setActiveSettingsView(null)} 
            currentUser={currentUser} 
          />
        ) : activeView === 'table' ? (
          <IndividualRegistrationTable
            people={people}
            userRole={currentUser.role}
            onPersonCreated={handlePersonCreated}
            onPersonUpdated={handlePersonUpdated}
            onPersonDeleted={handlePersonDeleted}
            onSelectPerson={(person) => {
              setActivePerson(person);
              setActiveView('tree');
            }}
          />
        ) : activeView === 'dashboard' ? (
          <Dashboards 
            currentUser={currentUser} 
            onNavigate={(view) => { setActiveView(view); setActiveSettingsView(null); }} 
            onOpenSettings={setActiveSettingsView}
          />
        ) : activeView === 'stools' ? (
          <StoolsDashboard currentUser={currentUser} />
        ) : activePerson && immediateFamily ? (
          activeView === 'reports' ? (
            <ReportsDashboard activePerson={activePerson} onSelectPerson={handleNodeClick} />
          ) : (
            <div className="canvas-wrapper">
              <FamilyTree
                activePerson={activePerson}
                ancestors={ancestors}
                descendants={descendants}
                immediateFamily={immediateFamily}
                onNodeClick={handleNodeClick}
              />
            </div>
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '0.95rem' }}>No individuals yet. Add the first person from the left panel</p>
          </div>
        )}
      </div>

      {/* Sidebar Right: Vitals details panel */}
      {activePerson && immediateFamily ? (
        <PersonDetails
          person={activePerson}
          immediateFamily={immediateFamily}
          onNodeClick={handleNodeClick}
          onPersonUpdated={handlePersonUpdated}
          userRole={currentUser.role}
          relationships={personRelationships}
          people={people}
          onEditRelationship={(rel: any) => setEditingRelationship(rel)}
          onDeleteRelationship={handleDeleteRelationship}
        />
      ) : (
        <div className="sidebar-right" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.85rem' }}>Select a person to see their record</p>
        </div>
      )}
    </div>
  );
}

export default App;
