import { useState, useEffect } from 'react';
import { readJson } from './lib/api';
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
import {
  GitBranch, Search, AlertCircle, LogOut, Table as TableIcon, LayoutDashboard, Crown, FileText,
  Settings, UserPlus, Link2, X, Shield, MapPin, Tent, ChevronRight
} from 'lucide-react';

type View = 'dashboard' | 'tree' | 'reports' | 'stools' | 'table' | 'settings';
type SettingsView = 'paramountcies' | 'sub-stools' | 'regions' | 'users';

const NAV: { view: View; label: string; short: string; icon: typeof GitBranch; adminOnly?: boolean }[] = [
  { view: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { view: 'table', label: 'Registrations', short: 'Records', icon: TableIcon },
  { view: 'tree', label: 'Family tree', short: 'Tree', icon: GitBranch },
  { view: 'stools', label: 'Stools', short: 'Stools', icon: Crown },
  { view: 'reports', label: 'Reports', short: 'Reports', icon: FileText },
  { view: 'settings', label: 'Settings', short: 'Settings', icon: Settings, adminOnly: true }
];

const SETTINGS_ITEMS: { key: SettingsView; label: string; body: string; icon: typeof GitBranch }[] = [
  { key: 'paramountcies', label: 'Paramountcies', body: 'Paramount stools and their seats', icon: Crown },
  { key: 'sub-stools', label: 'Sub-stools', body: 'Divisional and town stools under each paramountcy', icon: Tent },
  { key: 'regions', label: 'Regions', body: 'Administrative regions used for addresses', icon: MapPin },
  { key: 'users', label: 'System users', body: 'Accounts, roles and access', icon: Shield }
];

const VIEW_SUBTITLE: Record<View, string> = {
  dashboard: 'Overview of the register',
  table: 'Every registered individual',
  tree: 'Ancestors, descendants and immediate family',
  stools: 'Chiefs, Queen Mothers and divisional wings',
  reports: 'Lineage metrics, integrity checks and biographies',
  settings: 'Reference data and system users'
};

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
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [activeSettingsView, setActiveSettingsView] = useState<SettingsView | null>(null);
  const [drawer, setDrawer] = useState<'person' | 'relationship' | null>(null);
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
      const data = await readJson(response);
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

      const familyData = await readJson(familyRes);
      const ancestorsData = await readJson(ancestorsRes);
      const descendantsData = await readJson(descendantsRes);

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

  // Created from the drawer: close it and show the new record beside its tree
  const handleDrawerPersonCreated = (newPerson: Person) => {
    handlePersonCreated(newPerson);
    setDrawer(null);
    goTo('tree');
  };

  const goTo = (view: View) => {
    setActiveView(view);
    setActiveSettingsView(null);
  };

  const closeDrawer = () => {
    setDrawer(null);
    setEditingRelationship(null);
  };

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

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
    setDrawer(null);
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

  const canWrite = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const navItems = NAV.filter(item => !item.adminOnly || currentUser.role === 'Admin');
  const currentNav = NAV.find(item => item.view === activeView) ?? NAV[0];
  const settingsLabel = activeSettingsView ? SETTINGS_ITEMS.find(s => s.key === activeSettingsView)?.label : null;
  const pageTitle = settingsLabel ?? currentNav.label;
  const pageSubtitle = settingsLabel ? 'Settings' : VIEW_SUBTITLE[activeView];

  const personRecord = activePerson && immediateFamily ? (
    <PersonDetails
      person={activePerson}
      immediateFamily={immediateFamily}
      onNodeClick={handleNodeClick}
      onPersonUpdated={handlePersonUpdated}
      userRole={currentUser.role}
      relationships={personRelationships}
      people={people}
      onEditRelationship={(rel: any) => { setEditingRelationship(rel); setDrawer('relationship'); }}
      onDeleteRelationship={handleDeleteRelationship}
    />
  ) : null;

  const emptyRegister = people.length > 0 ? (
    <div className="empty-state">
      <p>{activePerson ? 'Loading record…' : 'Find a person with the search above to see their record.'}</p>
    </div>
  ) : (
    <div className="empty-state">
      <AlertCircle size={40} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
      <p>No individuals yet.</p>
      {canWrite && (
        <button className="btn-primary" onClick={() => setDrawer('person')}>
          <UserPlus size={16} strokeWidth={1.5} /> Add the first individual
        </button>
      )}
    </div>
  );

  const renderView = () => {
    if (activeSettingsView) {
      return (
        <SettingsPanel
          view={activeSettingsView}
          onBack={() => setActiveSettingsView(null)}
          currentUser={currentUser}
        />
      );
    }
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboards
            currentUser={currentUser}
            people={people}
            activePerson={activePerson}
            onNavigate={goTo}
            onAddPerson={canWrite ? () => setDrawer('person') : undefined}
            onAddRelationship={canWrite ? () => setDrawer('relationship') : undefined}
          />
        );
      case 'table':
        return (
          <div className="view-scroll">
            <IndividualRegistrationTable
              people={people}
              userRole={currentUser.role}
              onPersonCreated={handlePersonCreated}
              onPersonUpdated={handlePersonUpdated}
              onPersonDeleted={handlePersonDeleted}
              onSelectPerson={(person) => {
                setActivePerson(person);
                goTo('tree');
              }}
            />
          </div>
        );
      case 'stools':
        return <StoolsDashboard currentUser={currentUser} />;
      case 'settings':
        return (
          <div className="view-scroll">
            <div className="settings-grid">
              {SETTINGS_ITEMS.map(item => (
                <button key={item.key} type="button" className="dash-card" onClick={() => setActiveSettingsView(item.key)}>
                  <span className="dash-card-top">
                    <item.icon size={18} strokeWidth={1.5} />
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </span>
                  <span className="dash-card-title">{item.label}</span>
                  <span className="dash-card-body">{item.body}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'reports':
        return activePerson && immediateFamily
          ? <ReportsDashboard activePerson={activePerson} onSelectPerson={handleNodeClick} />
          : emptyRegister;
      case 'tree':
        return activePerson && immediateFamily ? (
          <div className="tree-layout">
            <div className="tree-canvas">
              <FamilyTree
                activePerson={activePerson}
                ancestors={ancestors}
                descendants={descendants}
                immediateFamily={immediateFamily}
                onNodeClick={handleNodeClick}
              />
            </div>
            {personRecord}
          </div>
        ) : emptyRegister;
    }
  };

  return (
    <div className="app-shell">
      {/* Primary navigation: a rail on desktop, a bottom tab bar on phones */}
      <nav className="app-nav" aria-label="Primary">
        <div className="brand">
          <GitBranch size={20} strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
          <span>Family Tree Manager</span>
        </div>

        <div className="nav-list">
          {navItems.map(item => {
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                className={`nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => goTo(item.view)}
              >
                <item.icon size={18} strokeWidth={1.5} />
                <span className="nav-label">{item.label}</span>
                <span className="nav-short">{item.short}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-user">
          {currentUser.avatar_url ? (
            <img className="avatar" src={currentUser.avatar_url} alt="" />
          ) : (
            <div className="avatar">{currentUser.username.slice(0, 1).toUpperCase()}</div>
          )}
          <div className="nav-user-text">
            <div className="nav-user-name">{currentUser.username}</div>
            <div className="nav-user-role">
              <span className={`role-dot role-${currentUser.role.toLowerCase()}`} />
              {currentUser.role}
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={() => setCurrentUser(null)}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <main className="app-main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>

          <div className="topbar-actions">
            <div className="search-container topbar-search">
              <Search size={16} strokeWidth={1.5} className="search-icon" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Find a person"
                aria-label="Find a person"
              />
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="search-results-dropdown">
                  {filteredSearch.length === 0 ? (
                    <div className="search-result-empty">No one matches “{searchQuery}”</div>
                  ) : filteredSearch.map(p => (
                    <div
                      key={p.person_id}
                      className="search-result-item"
                      onMouseDown={() => {
                        setActivePerson(p);
                        setSearchQuery('');
                        if (activeView !== 'reports') goTo('tree');
                      }}
                    >
                      {p.first_name} {p.last_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {canWrite && (
              <>
                <button
                  className="btn-secondary topbar-btn"
                  title="Establish relationship"
                  onClick={() => { setEditingRelationship(null); setDrawer('relationship'); }}
                >
                  <Link2 size={16} strokeWidth={1.5} />
                  <span className="topbar-btn-label">Relationship</span>
                </button>
                <button className="btn-primary topbar-btn" title="Add individual" onClick={() => setDrawer('person')}>
                  <UserPlus size={16} strokeWidth={1.5} />
                  <span className="topbar-btn-label">Add individual</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="view-area">
          {renderView()}
        </div>
      </main>

      {drawer && (
        <div className="drawer-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeDrawer(); }}>
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={drawer === 'person' ? 'Add individual' : 'Relationship'}
          >
            <button className="icon-btn drawer-close" onClick={closeDrawer} aria-label="Close">
              <X size={18} strokeWidth={1.5} />
            </button>
            {drawer === 'person' ? (
              <PersonForm onPersonCreated={handleDrawerPersonCreated} userRole={currentUser.role} />
            ) : (
              <RelationshipForm
                key={editingRelationship?.relationship_id || 'new'}
                people={people}
                onRelationshipCreated={handleRelationshipCreated}
                userRole={currentUser.role}
                existingRelationship={editingRelationship}
                onCancelEdit={closeDrawer}
              />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
