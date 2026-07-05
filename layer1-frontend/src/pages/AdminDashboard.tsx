import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  facility_name: string;
  hfr_id: string;
  stats: { patients: number; orders: number; reports: number };
  mix: { name: string; count: number; pct: string; color: string }[];
  txns: { id: string; patient: string; test: string; time: string; inc: string; status: string; incColor: string; bg: string; fg: string; label: string }[];
}

const StatCard = ({ label, value, icon, sub, subColor }: { label: string; value: number | string; icon: React.ReactNode; sub?: string; subColor?: string }) => (
  <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', padding: '20px 22px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)' }}>{label}</span>
      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--mb-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '34px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1, fontFamily: 'var(--mb-mono)' }}>{value}</div>
    {sub && <div style={{ fontSize: '12.5px', color: subColor || 'var(--mb-text-3)', marginTop: '9px' }}>{sub}</div>}
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { localStorage.removeItem('token'); navigate('/login'); throw new Error('Unauthorized'); }
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mb-font)', color: 'var(--mb-text-2)', fontSize: '15px', background: 'var(--mb-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--mb-border)', borderTopColor: 'var(--mb-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        Loading dashboard…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mb-font)' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--mb-danger)', marginBottom: '16px' }}>Error: {error}</p>
        <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--mb-font)', fontWeight: 600 }}>Go to Login</button>
      </div>
    </div>
  );

  const mix = data?.mix || [];
  const txns = data?.txns || [];
  const stats = data?.stats || { patients: 0, orders: 0, reports: 0 };
  const initials = (data?.facility_name || 'Lab').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    { label: 'Dashboard', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="14" y="3" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="3" y="14" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="14" y="14" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/></svg>, active: true, action: () => {} },
    { label: 'Patients', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/patients/register') },
    { label: 'Orders', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 10.5v5M14.5 10.5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/orders/create') },
    { label: 'Reports', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13 4v5h5" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.5 13h5M9.5 16h3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/reports/review') },
    { label: 'Settings', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.9"/><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/settings') },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{ width: '256px', flexShrink: 0, background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '4px 8px 22px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '19px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '44px', padding: '0 13px', borderRadius: '9px', background: item.active ? 'var(--mb-primary-tint)' : 'transparent', color: item.active ? 'var(--mb-primary-dark)' : 'var(--mb-text-2)', fontSize: '14.5px', fontWeight: item.active ? 600 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--mb-font)', width: '100%', position: 'relative' }}>
              {item.active && <span style={{ position: 'absolute', left: '-14px', top: '10px', bottom: '10px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }} />}
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        {/* Register patient CTA */}
        <div style={{ marginTop: '20px', padding: '14px', background: 'var(--mb-primary-tint)', borderRadius: '11px', border: '1px dashed var(--mb-primary)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mb-ink)', marginBottom: '8px' }}>Register a patient</div>
          <div style={{ fontSize: '12px', color: 'var(--mb-text-2)', marginBottom: '12px' }}>Link ABHA ID and place a test order.</div>
          <button onClick={() => navigate('/patients/register')} style={{ width: '100%', height: '34px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--mb-font)' }}>+ Register patient</button>
        </div>

        <div style={{ marginTop: 'auto', padding: '13px 10px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)', flexShrink: 0 }} />
          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ height: '64px', flexShrink: 0, background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--mb-teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v5l4 8.5A2.5 2.5 0 0 1 16.7 20H7.3A2.5 2.5 0 0 1 5 16.5L9 8V3z" stroke="#0a6b62" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>{data?.facility_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--mb-text-3)', marginTop: '1px' }}>HFR ID {data?.hfr_id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{initials}</div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>Admin</div>
                <div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>Lab owner</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ height: '38px', padding: '0 14px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '9px', background: 'transparent', fontFamily: 'var(--mb-font)', fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 30px', overflow: 'auto' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px', letterSpacing: '-.01em' }}>Business overview</h1>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>ABDM activity and incentive earnings for your lab.</p>
            </div>
            <button onClick={() => navigate('/patients/register')} style={{ height: '40px', padding: '0 18px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '9px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
              Register patient
            </button>
          </div>

          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            <StatCard label="Reports shared" value={stats.reports} sub="+18% vs last month" subColor="var(--mb-success)"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="var(--mb-primary)" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="var(--mb-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            <StatCard label="Patients registered" value={stats.patients} sub="Linked to ABHA"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="var(--mb-teal)" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="var(--mb-teal)" strokeWidth="1.9" strokeLinecap="round"/></svg>} />
            <StatCard label="Estimated earnings" value={`₹${(stats.reports * 25).toLocaleString('en-IN')}`} sub="@ ₹25 per eligible txn"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 6h9M7 10h9M14 6c0 4-3 5-6 5l5 7" stroke="var(--mb-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            <StatCard label="Total orders" value={stats.orders} sub="All time"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="var(--mb-warning)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
          </div>

          {/* Test mix */}
          {mix.length > 0 && (
            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', padding: '22px 24px', marginBottom: '20px', boxShadow: 'var(--mb-sh-card)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 18px' }}>Top tests this month</h2>
              {mix.map((m, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13.5px', color: 'var(--mb-text)', fontWeight: 500 }}>{m.name}</span>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-2)' }}>{m.count}</span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--mb-bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: m.pct, background: m.color, borderRadius: '999px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transactions table */}
          <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px 12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Recent transactions</h2>
              <span style={{ fontSize: '13px', color: 'var(--mb-text-3)' }}>{txns.length} records</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 1.8fr 1.3fr 0.9fr 0.9fr', padding: '9px 22px', background: 'var(--mb-bg-subtle)', borderTop: '1px solid var(--mb-border)', borderBottom: '1px solid var(--mb-border)', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
              <div>Txn ID</div><div>Patient</div><div>Test</div><div>Date</div><div style={{ textAlign: 'right' }}>Incentive</div><div style={{ textAlign: 'right' }}>Status</div>
            </div>
            {txns.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)', fontSize: '14px' }}>
                No transactions yet. Register a patient and place a test order to get started.
              </div>
            ) : (
              txns.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 1.8fr 1.3fr 0.9fr 0.9fr', padding: '11px 22px', borderBottom: i < txns.length - 1 ? '1px solid var(--mb-border)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: '12.5px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-2)' }}>{t.id}</div>
                  <div style={{ fontSize: '14px', color: 'var(--mb-ink)', fontWeight: 500 }}>{t.patient}</div>
                  <div style={{ fontSize: '13px', color: 'var(--mb-text)' }}>{t.test}</div>
                  <div style={{ fontSize: '12.5px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-2)' }}>{t.time}</div>
                  <div style={{ textAlign: 'right', fontSize: '13px', fontFamily: 'var(--mb-mono)', fontWeight: 600, color: t.incColor }}>{t.inc}</div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '22px', padding: '0 9px', borderRadius: '999px', background: t.bg, color: t.fg, fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.fg }} />
                      {t.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
