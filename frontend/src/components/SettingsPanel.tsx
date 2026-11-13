import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Tent, MapPin, Shield, Loader, Plus, Edit2, Trash2 } from 'lucide-react';

interface SettingsPanelProps {
  view: 'paramountcies' | 'sub-stools' | 'regions' | 'users';
  onBack: () => void;
  currentUser: { user_id: number; username: string; role: string };
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ view, onBack, currentUser }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Lookups for dropdowns
  const [regions, setRegions] = useState<any[]>([]);
  const [paramountcies, setParamountcies] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (view) {
        case 'paramountcies': endpoint = '/api/royal/paramountcies'; break;
        case 'sub-stools': endpoint = '/api/royal/sub-stools'; break;
        case 'regions': endpoint = '/api/royal/regions'; break;
        case 'users': endpoint = '/api/users'; break;
      }

      const headers: Record<string, string> = {
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.user_id.toString()
      };

      const response = await fetch(endpoint, { headers });
      if (!response.ok) throw new Error(`Error fetching ${view}: ${response.statusText}`);
      const json = await response.json();
      setData(json);

      // Fetch lookups if needed
      if (view === 'paramountcies') {
        const res = await fetch('/api/royal/regions', { headers });
        if (res.ok) setRegions(await res.json());
      }
      if (view === 'sub-stools') {
        const res = await fetch('/api/royal/paramountcies', { headers });
        if (res.ok) setParamountcies(await res.json());
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let endpoint = '';
      switch (view) {
        case 'paramountcies': endpoint = '/api/royal/paramountcies'; break;
        case 'sub-stools': endpoint = '/api/royal/sub-stools'; break;
        case 'regions': endpoint = '/api/royal/regions'; break;
        case 'users': endpoint = '/api/users'; break;
      }

      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `${endpoint}/${editItem.id || editItem.user_id}` : endpoint;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.user_id.toString()
      };

      const response = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save record`);
      }
      
      setIsEditing(false);
      setEditItem(null);
      setFormData({});
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      let endpoint = '';
      switch (view) {
        case 'paramountcies': endpoint = '/api/royal/paramountcies'; break;
        case 'sub-stools': endpoint = '/api/royal/sub-stools'; break;
        case 'regions': endpoint = '/api/royal/regions'; break;
        case 'users': endpoint = '/api/users'; break;
      }
      const headers: Record<string, string> = {
        'x-user-role': currentUser.role,
        'x-user-id': currentUser.user_id.toString()
      };
      const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE', headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete record`);
      }
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openForm = (item: any = null) => {
    setEditItem(item);
    setFormData(item || {});
    setIsEditing(true);
  };

  const renderForm = () => {
    return (
      <form onSubmit={handleSave} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 233, 222, 0.03)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editItem ? 'Edit Record' : 'Add New Record'}</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          
          {view === 'users' ? (
            <>
              <input type="text" className="input-field" placeholder="Username" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} required />
              <select className="input-field" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} required>
                <option value="">Select Role</option>
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <input type="password" className="input-field" placeholder={editItem ? "Leave blank to keep current" : "Password"} value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required={!editItem} />
            </>
          ) : (
            <input type="text" className="input-field" placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
          )}

          {view === 'paramountcies' && (
            <select className="input-field" value={formData.regionId || ''} onChange={e => setFormData({...formData, regionId: e.target.value})} required>
              <option value="">Select Region</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}

          {view === 'sub-stools' && (
            <select className="input-field" value={formData.paramountcyId || ''} onChange={e => setFormData({...formData, paramountcyId: e.target.value})} required>
              <option value="">Select Paramountcy</option>
              {paramountcies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      </form>
    );
  };

  const renderHeader = () => {
    switch (view) {
      case 'paramountcies': return <><Crown size={24} /> Manage Paramountcies</>;
      case 'sub-stools': return <><Tent size={24} /> Manage Sub-Stools</>;
      case 'regions': return <><MapPin size={24} /> Manage Regions</>;
      case 'users': return <><Shield size={24} /> System Users</>;
    }
  };

  const renderTable = () => {
    if (data.length === 0) return <p style={{ color: 'var(--text-secondary)' }}>No records yet</p>;

    const renderActions = (item: any, idField: string) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="icon-btn" onClick={() => openForm(item)} title="Edit"><Edit2 size={16} /></button>
        <button className="icon-btn" style={{ color: 'var(--kente-clay-ink)' }} onClick={() => handleDelete(item[idField])} title="Delete"><Trash2 size={16} /></button>
      </div>
    );

    if (view === 'paramountcies') {
      return (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Stool Name</th><th>Region</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.region?.name || 'Unknown'}</td>
                <td>{renderActions(p, 'id')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (view === 'sub-stools') {
      return (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Sub-Stool Name</th><th>Paramountcy</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.paramountcy?.name || 'Unknown'}</td>
                <td>{renderActions(s, 'id')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (view === 'regions') {
      return (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Region Name</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{renderActions(r, 'id')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (view === 'users') {
      return (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {data.map(u => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.username}</td>
                <td>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    background: u.role === 'Admin' ? 'rgba(214, 164, 64, 0.2)' : 'rgba(239, 233, 222, 0.1)',
                    color: u.role === 'Admin' ? 'var(--accent-ink)' : 'white',
                    fontSize: '0.8rem' 
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{renderActions(u, 'user_id')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div style={{ padding: '6rem 2rem 2rem 2rem', height: '100%', overflowY: 'auto' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card" style={{ minHeight: '400px' }}>
        <div className="glass-card-header" style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {renderHeader()}
          </div>
          {!isEditing && (
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => openForm()}>
              <Plus size={16} /> Add New
            </button>
          )}
        </div>

        {error && <div style={{ color: 'var(--kente-clay-ink)', marginBottom: '1rem', padding: '1rem', background: 'rgba(201, 83, 63, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        {isEditing && renderForm()}

        {!isEditing && (
          loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
              <Loader size={32} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            renderTable()
          )
        )}
      </div>

      <style>{`
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .data-table th {
          background: rgba(239, 233, 222, 0.05);
          padding: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(239, 233, 222, 0.1);
        }
        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(239, 233, 222, 0.05);
          color: var(--text-primary);
        }
        .data-table tr:hover td {
          background: rgba(239, 233, 222, 0.02);
        }
        .icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }
        .icon-btn:hover {
          background: rgba(239, 233, 222, 0.1);
          color: white;
        }
      `}</style>
    </div>
  );
};
