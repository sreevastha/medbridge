import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Incorrect username or password.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%', height: '50px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px',
    padding: '0 14px', fontSize: '15.5px', color: 'var(--mb-ink)', background: 'var(--mb-surface)',
    fontFamily: 'var(--mb-font)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--mb-bg)' }}>
      {/* Background wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(900px 520px at 50% -8%, #eaf1fb 0%, rgba(234,241,251,0) 62%)', pointerEvents: 'none' }} />

      {/* Minimal nav */}
      <header style={{ position: 'relative', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid var(--mb-border)', background: 'var(--mb-surface)' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
        </button>
        <button onClick={() => navigate('/onboarding')} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          New lab? Onboard here →
        </button>
      </header>

      {/* Centered card */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px' }}>Log in to your lab</h1>
            <p style={{ fontSize: '15px', color: 'var(--mb-text-2)', margin: 0 }}>Sign in to manage reports and register patients.</p>
          </div>

          <form onSubmit={handleLogin} style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '18px', padding: '32px', boxShadow: 'var(--mb-sh-pop)' }}>

            {error && (
              <div style={{ marginBottom: '20px', padding: '11px 14px', background: 'var(--mb-danger-tint)', border: '1px solid var(--mb-danger)', borderRadius: '9px', fontSize: '13.5px', color: 'var(--mb-danger)' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '7px' }}>Username</label>
              <input
                style={field}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                autoComplete="username"
                required
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '7px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...field, paddingRight: '44px' }}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mb-text-3)', padding: '2px' }}>
                  {showPw
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.5 10.68A3 3 0 0 0 13.32 13.5M6.4 6.4A10 10 0 0 0 2.5 12s3.5 6.5 9.5 6.5a10 10 0 0 0 4.59-1.1M9 5.4A10 10 0 0 1 21.5 12s-1 2-3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8"/></svg>
                  }
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <a href="#" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mb-primary)', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '50px', background: loading ? '#93b3e0' : 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--mb-font)', fontSize: '15.5px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0l-5-5m5 5l-5 5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </form>

          {/* ABDM trust badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Securely connected to India's ABDM health network</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
