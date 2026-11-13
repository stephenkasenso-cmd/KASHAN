import React, { useState } from 'react';
import { KeyRound, User, AlertCircle, GitBranch, ChevronRight } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { readJson, errorMessage } from '../lib/api';

export interface UserSession {
  user_id: number;
  username: string;
  email?: string | null;
  role: 'Admin' | 'Manager' | 'Staff';
  avatar_url?: string | null;
  token?: string;
}

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Enter your username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await readJson(response);

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, 'Could not reach the server'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in returned no credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const google_id = decoded.sub;
      const name = decoded.name;
      const avatar_url = decoded.picture;

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, google_id, name, avatar_url }),
      });

      const data = await readJson(response);

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(errorMessage(err, 'Google sign-in failed, try again'));
    } finally {
      setLoading(false);
    }
  };

  // Mock Google OAuth sign-in fallback for local testing
  const handleMockGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockEmail = 'google_user@familytree.org';
      const mockGoogleId = 'google_oauth_123456789';
      const mockName = 'Google Authenticated User';

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          google_id: mockGoogleId,
          name: mockName,
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user'
        }),
      });

      const data = await readJson(response);
      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Google auth failed.');
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, 'Could not reach the server'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickUsername: string) => {
    setLoading(true);
    setError(null);
    setUsername(quickUsername);
    const quickPassword = `${quickUsername}pass`;
    setPassword(quickPassword);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: quickUsername, password: quickPassword }),
      });

      const data = await readJson(response);

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Quick login failed.');
      }
    } catch (err) {
      console.error(err);
      setError(errorMessage(err, 'Could not reach the server'));
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts: { username: string; role: string; dot: string }[] = [
    { username: 'admin1', role: 'Admin', dot: 'var(--accent-primary)' },
    { username: 'manager1', role: 'Manager', dot: 'var(--kente-rose)' },
    { username: 'staff1', role: 'Staff', dot: 'var(--kente-green)' }
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px 0 36px',
    fontSize: '14px'
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'
  };

  return (
    <div className="login-shell">
      {/* The moment: the Golden Stool, the seat every lineage in this register answers to */}
      <div className="login-visual">
        <img src="/images/golden_stool.jpg" alt="The Golden Stool of Asante" />
        <div className="login-visual-shade" />
        <div style={{ position: 'absolute', left: '40px', right: '40px', bottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="kente-rule" style={{ width: '64px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1.2, color: 'var(--text-primary)', maxWidth: '28rem' }}>
            Royal families, stools and enstoolments, kept in one register
          </p>
          <span className="mono" style={{ color: 'var(--text-secondary)' }}>Sika Dwa Kofi, the Golden Stool</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              <GitBranch size={18} strokeWidth={1.5} style={{ color: 'var(--accent-primary)' }} />
              Family Tree Manager
            </div>
            <h1 style={{ fontSize: '32px', lineHeight: 1.15, color: 'var(--text-primary)' }}>
              Sign in to the register
            </h1>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginTop: 0, alignItems: 'center' }}>
              <AlertCircle size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="login-username">Username or email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  style={inputStyle}
                />
                <User size={16} strokeWidth={1.5} style={iconStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={inputStyle}
                />
                <KeyRound size={16} strokeWidth={1.5} style={iconStyle} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ height: '44px', fontSize: '14px', marginTop: '4px' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Google */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed to initialize')}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                text="signin_with"
              />
            </div>
            <button
              type="button"
              onClick={handleMockGoogleLogin}
              disabled={loading}
              style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', padding: '4px' }}
            >
              Use demo Google sign-in
            </button>
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Demo accounts</span>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
              {demoAccounts.map((acc, i) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username)}
                  disabled={loading}
                  className="demo-row"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: acc.dot }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{acc.username}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {acc.role}
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
