import React from 'react';
import { Users, Crown, FileText, Table, ChevronRight, GitBranch, UserPlus, Link2, Heart } from 'lucide-react';

interface UserSession {
  user_id: number;
  username: string;
  role: 'Admin' | 'Manager' | 'Staff';
}

interface PersonSummary {
  person_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string | null;
  is_living: boolean;
  paramountcy_id?: number | null;
  enstoolment_date?: string | null;
}

type DashboardView = 'tree' | 'reports' | 'stools' | 'table';

interface DashboardsProps {
  currentUser: UserSession;
  people: PersonSummary[];
  activePerson: PersonSummary | null;
  onNavigate: (view: DashboardView) => void;
  onAddPerson?: () => void;
  onAddRelationship?: () => void;
}

const sections: { view: DashboardView; title: string; body: string; icon: React.ReactNode }[] = [
  {
    view: 'table',
    title: 'Registrations',
    body: 'Every registered individual, with edit, copy and delete',
    icon: <Table size={18} strokeWidth={1.5} />
  },
  {
    view: 'tree',
    title: 'Family tree',
    body: 'Ancestors, descendants and immediate family of one person',
    icon: <GitBranch size={18} strokeWidth={1.5} />
  },
  {
    view: 'reports',
    title: 'Reports',
    body: 'Lineage reports, data integrity checks and biographies',
    icon: <FileText size={18} strokeWidth={1.5} />
  }
];

const roleNote: Record<UserSession['role'], string> = {
  Admin: 'You have full access, including reference data and system users under Settings.',
  Manager: 'You can edit and delete individual registrations and reports. Review family trees to keep lineage links accurate.',
  Staff: 'You can view registrations, lineage trees and reports. To change or delete a record, ask a Manager or Admin.'
};

export const Dashboards: React.FC<DashboardsProps> = ({
  currentUser, people, activePerson, onNavigate, onAddPerson, onAddRelationship
}) => {
  const living = people.filter(p => p.is_living).length;
  const officeHolders = people.filter(p => p.paramountcy_id || p.enstoolment_date).length;

  const stats = [
    { label: 'Registered', value: people.length },
    { label: 'Living', value: living },
    { label: 'Deceased', value: people.length - living },
    { label: 'Stool holders', value: officeHolders }
  ];

  return (
    <div className="view-scroll">
      <div className="dash-layout">
        <div className="stat-row">
          {stats.map(s => (
            <div key={s.label} className="stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="dash-main">
          {/* The moment: the stool register, carried by the Golden Stool itself */}
          <button type="button" onClick={() => onNavigate('stools')} className="dash-feature">
            <div className="dash-feature-text">
              <span className="dash-eyebrow">
                <Crown size={16} strokeWidth={1.5} /> Stools
              </span>
              <h2>The 69 paramount stools of Asanteman</h2>
              <p>Chiefs, Queen Mothers and military wings, from the Golden Stool down to divisional sub-stools</p>
              <div className="kente-rule" style={{ width: '48px', marginTop: '8px' }} />
            </div>
            <div className="dash-feature-image">
              <img src="/images/golden_stool.jpg" alt="" />
            </div>
          </button>

          <div className="glass-card dash-record">
            <div className="glass-card-header">
              <Users size={16} strokeWidth={1.5} />
              <span>Current record</span>
            </div>
            {activePerson ? (
              <>
                <div>
                  <div className="dash-record-name">{activePerson.first_name} {activePerson.last_name}</div>
                  <div className="dash-record-meta">
                    <Heart
                      size={12}
                      color={activePerson.is_living ? 'var(--success)' : 'var(--danger)'}
                      fill={activePerson.is_living ? 'var(--success)' : 'var(--danger)'}
                    />
                    {activePerson.is_living ? 'Living' : 'Deceased'} · {activePerson.gender}
                    {activePerson.birth_date ? ` · born ${new Date(activePerson.birth_date).getFullYear()}` : ''}
                  </div>
                </div>
                <div className="dash-record-actions">
                  <button className="btn-secondary" onClick={() => onNavigate('tree')}>
                    <GitBranch size={14} strokeWidth={1.5} /> Family tree
                  </button>
                  <button className="btn-secondary" onClick={() => onNavigate('reports')}>
                    <FileText size={14} strokeWidth={1.5} /> Report
                  </button>
                </div>
              </>
            ) : (
              <p className="dash-muted">No one selected. Find a person with the search above.</p>
            )}

            {(onAddPerson || onAddRelationship) && (
              <div className="dash-quick">
                {onAddPerson && (
                  <button className="btn-primary" onClick={onAddPerson}>
                    <UserPlus size={14} strokeWidth={1.5} /> Add individual
                  </button>
                )}
                {onAddRelationship && (
                  <button className="btn-secondary" onClick={onAddRelationship}>
                    <Link2 size={14} strokeWidth={1.5} /> Establish relationship
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dash-sections">
          {sections.map(s => (
            <button key={s.view} type="button" className="dash-card" onClick={() => onNavigate(s.view)}>
              <span className="dash-card-top">
                {s.icon}
                <ChevronRight size={16} strokeWidth={1.5} />
              </span>
              <span className="dash-card-title">{s.title}</span>
              <span className="dash-card-body">{s.body}</span>
            </button>
          ))}
        </div>

        <p className="dash-muted">
          Signed in as {currentUser.username} ({currentUser.role}). {roleNote[currentUser.role]}
        </p>
      </div>
    </div>
  );
};
