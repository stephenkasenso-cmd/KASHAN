import React from 'react';
import { Shield, Users, Settings, Crown, MapPin, Tent, FileText, Table, ChevronRight, GitBranch } from 'lucide-react';

interface UserSession {
  user_id: number;
  username: string;
  role: 'Admin' | 'Manager' | 'Staff';
}

interface DashboardsProps {
  currentUser: UserSession;
  onNavigate: (view: 'tree' | 'reports' | 'stools' | 'table') => void;
  onOpenSettings?: (panel: 'paramountcies' | 'sub-stools' | 'regions' | 'users') => void;
}

const sections: { view: 'table' | 'tree' | 'reports'; title: string; body: string; icon: React.ReactNode }[] = [
  {
    view: 'table',
    title: 'Registrations',
    body: 'Every registered individual, with edit, copy and delete',
    icon: <Table size={18} strokeWidth={1.5} />
  },
  {
    view: 'tree',
    title: 'Lineage tree',
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

const settings: { key: 'paramountcies' | 'sub-stools' | 'regions' | 'users'; label: string; icon: React.ReactNode }[] = [
  { key: 'paramountcies', label: 'Paramountcies', icon: <Crown size={16} strokeWidth={1.5} /> },
  { key: 'sub-stools', label: 'Sub-stools', icon: <Tent size={16} strokeWidth={1.5} /> },
  { key: 'regions', label: 'Regions', icon: <MapPin size={16} strokeWidth={1.5} /> },
  { key: 'users', label: 'System users', icon: <Shield size={16} strokeWidth={1.5} /> }
];

export const Dashboards: React.FC<DashboardsProps> = ({ currentUser, onNavigate, onOpenSettings }) => {
  return (
    <div style={{ padding: '96px 32px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* The moment: the stool register, carried by the Golden Stool itself */}
        <button
          type="button"
          onClick={() => onNavigate('stools')}
          className="dash-feature"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '32px', textAlign: 'left', alignItems: 'flex-start' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-ink)' }}>
              <Crown size={16} strokeWidth={1.5} /> Stools
            </span>
            <h2 style={{ fontSize: '28px', lineHeight: 1.2, color: 'var(--text-primary)', maxWidth: '22rem' }}>
              The 69 paramount stools of Asanteman
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)', maxWidth: '26rem' }}>
              Chiefs, Queen Mothers and military wings, from the Golden Stool down to divisional sub-stools
            </p>
            <div className="kente-rule" style={{ width: '48px', marginTop: '8px' }} />
          </div>
          <div className="dash-feature-image">
            <img src="/images/golden_stool.jpg" alt="" />
          </div>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {sections.map(s => (
            <button key={s.view} type="button" className="dash-card" onClick={() => onNavigate(s.view)}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', color: 'var(--text-muted)' }}>
                {s.icon}
                <ChevronRight size={16} strokeWidth={1.5} />
              </span>
              <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.title}</span>
              <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{s.body}</span>
            </button>
          ))}
        </div>

        {currentUser.role === 'Admin' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <Settings size={16} strokeWidth={1.5} />
              <span>Settings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {settings.map(item => (
                <button
                  key={item.key}
                  className="btn-secondary"
                  style={{ justifyContent: 'flex-start', height: '40px', gap: '10px' }}
                  onClick={() => onOpenSettings?.(item.key)}
                >
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentUser.role === 'Manager' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <Users size={16} strokeWidth={1.5} />
              <span>Manager access</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              You can edit and delete individual registrations and reports. Review family trees to keep lineage links accurate.
            </p>
          </div>
        )}

        {currentUser.role === 'Staff' && (
          <div className="glass-card">
            <div className="glass-card-header">
              <Users size={16} strokeWidth={1.5} />
              <span>Staff access</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
              You can view registrations, lineage trees and reports. To change or delete a record, ask a Manager or Admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
