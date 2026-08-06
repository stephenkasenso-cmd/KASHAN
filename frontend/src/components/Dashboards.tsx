import React from 'react';
import { Shield, Users, Activity, Settings, Crown, MapPin, Tent, FileText, Table } from 'lucide-react';

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

export const Dashboards: React.FC<DashboardsProps> = ({ currentUser, onNavigate, onOpenSettings }) => {
  return (
    <div style={{ padding: '6rem 2rem 2rem 2rem', height: '100%', overflowY: 'auto' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Individual Registrations Table Card */}
        <div className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => onNavigate('table')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: '#818cf8' }}>
              <Table size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Individual Registrations</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Action Controls & Directory</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            Manage registration entries with Edit, Copy details, and Delete action controls.
          </p>
        </div>

        <div className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => onNavigate('tree')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '12px', color: '#38bdf8' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Family Tree</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Visual Lineage Canvas</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            Explore interactive family tree diagrams and immediate family connections.
          </p>
        </div>

        <div className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => onNavigate('reports')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '12px', color: '#f43f5e' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Reports & Analytics</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Data Integrity & Summaries</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            Generate comprehensive lineage reports, check data integrity, and view biographies.
          </p>
        </div>

        <div className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => onNavigate('stools')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '12px', color: '#eab308' }}>
              <Crown size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Paramount Stools</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Asanteman Royal Stools</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            Explore the 69 Paramount Stools of Asanteman, Golden Stool, and military wings.
          </p>
        </div>
      </div>

      {currentUser.role === 'Admin' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <Settings size={18} />
            <span>Settings & Administration</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Manage royal lineages, sub-stools, and system users.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => onOpenSettings?.('paramountcies')}>
              <Crown size={18} /> Manage Paramountcies
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => onOpenSettings?.('sub-stools')}>
              <Tent size={18} /> Manage Sub-Stools
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => onOpenSettings?.('regions')}>
              <MapPin size={18} /> Manage Regions
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }} onClick={() => onOpenSettings?.('users')}>
              <Shield size={18} /> System Users
            </button>
          </div>
        </div>
      )}

      {currentUser.role === 'Manager' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <Activity size={18} />
            <span>Manager Oversight</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Review family trees and ensure proper lineage mappings. You have full edit and deletion access to individual registrations and reports.
          </p>
        </div>
      )}

      {currentUser.role === 'Staff' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <Users size={18} />
            <span>Staff Portal</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You have read-only access to view individual registrations, lineage trees, and reports. For record modifications or deletions, please contact a Manager or Admin.
          </p>
        </div>
      )}
    </div>
  );
};
