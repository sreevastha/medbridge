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

  const inputContainerStyle: React.CSSProperties = {
    height: '50px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px',
    padding: '0 14px', display: 'flex', alignItems: 'center', gap: '11px', background: 'var(--mb-surface)',
    transition: 'border-color .15s, box-shadow .15s',
  };

  const inputStyle: React.CSSProperties = {
    border: 'none', outline: 'none', background: 'transparent', flex: 1,
    fontSize: '16px', color: 'var(--mb-ink)', fontFamily: 'var(--mb-font)',
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--mb-bg)', fontFamily: 'var(--mb-font)', color: 'var(--mb-text)' }}>
      {/* Soft brand wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(900px 520px at 50% -8%, #eaf1fb 0%, rgba(234,241,251,0) 62%)', pointerEvents: 'none' }} />

      {/* Optional minimal header to keep onboarding navigation intact */}
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

      {/* Centered column */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: '40px 24px' }}>

        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '30px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(20,86,184,.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
        </div>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: '432px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '18px', boxShadow: 'var(--mb-sh-pop)', padding: '40px 40px 36px', boxSizing: 'border-box' }}>

          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px', textAlign: 'center' }}>Log in to your lab</h1>
          <p style={{ fontSize: '15px', color: 'var(--mb-text-2)', margin: '0 0 30px', textAlign: 'center' }}>Sign in to register patients and manage reports.</p>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ marginBottom: '20px', padding: '11px 14px', background: 'var(--mb-danger-tint)', border: '1px solid var(--mb-danger)', borderRadius: '9px', fontSize: '13.5px', color: 'var(--mb-danger)' }}>
                {error}
              </div>
            )}

            {/* Username */}
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Username</label>
            <div style={{ ...inputContainerStyle, marginBottom: '20px' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#8a97a8" strokeWidth="1.9"/><path d="M5 19c0-3.4 3.1-5.2 7-5.2s7 1.8 7 5.2" stroke="#8a97a8" strokeWidth="1.9" strokeLinecap="round"/></svg>
              <input
                style={inputStyle}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. roshni.d"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Password</label>
            <div style={{ ...inputContainerStyle, marginBottom: '10px' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2.2" stroke="#5b6b82" strokeWidth="1.9"/><path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="#5b6b82" strokeWidth="1.9"/></svg>
              <input
                style={inputStyle}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mb-text-3)', padding: '2px', display: 'flex', alignItems: 'center' }}>
                {showPw
                  ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.5 10.68A3 3 0 0 0 13.32 13.5M6.4 6.4A10 10 0 0 0 2.5 12s3.5 6.5 9.5 6.5a10 10 0 0 0 4.59-1.1M9 5.4A10 10 0 0 1 21.5 12s-1 2-3 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="#8a97a8" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="#8a97a8" strokeWidth="1.8"/></svg>
                }
              </button>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: '26px' }}>
              <a href="#" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-primary)', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            {/* Primary action */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '52px', background: loading ? '#93b3e0' : 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', transition: 'background .15s' }}
              onMouseOver={e => !loading && (e.currentTarget.style.background = 'var(--mb-primary-hover)')}
              onMouseOut={e => !loading && (e.currentTarget.style.background = 'var(--mb-primary)')}
            >
              {loading ? 'Signing in…' : 'Log in'}
              {!loading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0l-5-5m5 5l-5 5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </form>
        </div>

        {/* ABDM trust line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '24px', padding: '8px 14px', borderRadius: '999px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>Securely connected to India's ABDM health network</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', padding: '0 0 26px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--mb-text-3)' }}>MedBridge · Sunrise Diagnostics, Pune &nbsp;·&nbsp; Need help? Contact your lab admin</div>
      </div>
    </div>
  );
};

export default Login;
