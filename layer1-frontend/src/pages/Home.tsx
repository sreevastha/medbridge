import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      title: 'ABDM Integration',
      desc: "Seamlessly connect to India's Ayushman Bharat Digital Mission. Create and link ABHA IDs for patients in seconds.",
      bg: 'var(--mb-teal-tint)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 6h9M7 10h9M14 6c0 4-3 5-6 5l5 7" stroke="#1f8a5b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      title: 'Earn Incentives',
      desc: "Get ₹25 per eligible report shared digitally via ABDM. Track your earnings on the dashboard in real-time.",
      bg: 'var(--mb-success-tint)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="#1456b8" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13 4v5h5" stroke="#1456b8" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.5 13h5M9.5 16h3" stroke="#1456b8" strokeWidth="1.9" strokeLinecap="round"/></svg>,
      title: 'Digital Reports',
      desc: "Share structured, FHIR-compliant diagnostic reports with patients and doctors instantly — no paper needed.",
      bg: 'var(--mb-primary-tint)',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>,
      title: 'Patient Registry',
      desc: "Register patients, link their ABHA ID, and maintain a complete record of all orders and test history.",
      bg: 'var(--mb-bg-subtle)',
    },
  ];

  const stats = [
    { value: '2,400+', label: 'Labs onboarded' },
    { value: '18 L+', label: 'Reports shared' },
    { value: '₹4.5 Cr', label: 'Incentives earned' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)' }}>

      {/* Navbar */}
      <header style={{ height: '64px', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.3)' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '19px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate('/login')} style={{ height: '38px', padding: '0 18px', background: 'transparent', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '8px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Login
          </button>
          <button onClick={() => navigate('/onboarding')} style={{ height: '38px', padding: '0 18px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.28)' }}>
            Onboard your lab →
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 40px 64px', textAlign: 'center', background: 'linear-gradient(160deg, #eaf1fb 0%, #f6f8fb 60%)' }}>
        <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse, rgba(20,86,184,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '30px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-teal-tint)', border: '1px solid rgba(13,148,136,.2)', marginBottom: '24px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--mb-teal)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mb-teal)' }}>ABDM Layer 1 Certified Platform</span>
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 auto 20px', maxWidth: '720px', lineHeight: 1.12, letterSpacing: '-.02em' }}>
          The fastest way to connect your lab to{' '}
          <span style={{ color: 'var(--mb-primary)' }}>India's ABDM</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--mb-text-2)', maxWidth: '580px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Onboard in minutes. Share digital reports. Earn government incentives. MedBridge handles the ABDM compliance so you can focus on patients.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/onboarding')} style={{ height: '52px', padding: '0 32px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 6px 20px rgba(20,86,184,.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Onboard your lab free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0l-5-5m5 5l-5 5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => navigate('/login')} style={{ height: '52px', padding: '0 28px', background: 'var(--mb-surface)', color: 'var(--mb-ink)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '12px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
            Login to dashboard
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--mb-ink)', padding: '32px 40px', display: 'flex', justifyContent: 'center', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, maxWidth: '220px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.1)' : 'none', padding: '0 24px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', fontFamily: 'var(--mb-mono)' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: '72px 40px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--mb-ink)', textAlign: 'center', marginBottom: '8px', letterSpacing: '-.01em' }}>Everything your lab needs</h2>
        <p style={{ fontSize: '16px', color: 'var(--mb-text-2)', textAlign: 'center', marginBottom: '48px' }}>Built specifically for small and mid-size diagnostic labs in India.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--mb-sh-card)', display: 'flex', gap: '18px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)', marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '14px', color: 'var(--mb-text-2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'var(--mb-primary)', margin: '0 40px 60px', borderRadius: '20px', padding: '48px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-.01em' }}>Ready to go digital?</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.75)', margin: 0 }}>Join thousands of labs already earning ABDM incentives with MedBridge.</p>
        </div>
        <button onClick={() => navigate('/onboarding')} style={{ height: '50px', padding: '0 32px', background: '#fff', color: 'var(--mb-primary)', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Start for free →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--mb-border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', color: 'var(--mb-text-3)' }}>© 2026 MedBridge. <span style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Securely connected to India&apos;s ABDM health network</span>.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--mb-text-3)' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--mb-success)' }} />
          All systems operational
        </div>
      </footer>
    </div>
  );
};

export default Home;
