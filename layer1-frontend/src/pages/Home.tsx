import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      title: 'ABDM Integration',
      desc: "Seamlessly connect to India's Ayushman Bharat Digital Mission. Create and link ABHA IDs for patients in seconds.",
      bg: 'var(--mb-teal-tint)',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 6h9M7 10h9M14 6c0 4-3 5-6 5l5 7" stroke="#1f8a5b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      title: 'Earn Incentives',
      desc: "Get ₹25 per eligible report shared digitally via ABDM. Track your earnings on the dashboard in real-time.",
      bg: 'var(--mb-success-tint)',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="#1456b8" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13 4v5h5" stroke="#1456b8" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.5 13h5M9.5 16h3" stroke="#1456b8" strokeWidth="1.9" strokeLinecap="round"/></svg>,
      title: 'Digital Reports',
      desc: "Share structured, FHIR-compliant diagnostic reports with patients and doctors instantly — no paper needed.",
      bg: 'var(--mb-primary-tint)',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>,
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
      <header style={{ height: '68px', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/login')} style={{ height: '40px', padding: '0 20px', background: 'transparent', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            Login
          </button>
          <button onClick={() => navigate('/onboarding')} style={{ height: '40px', padding: '0 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', transition: 'background .15s' }}>
            Onboard your lab →
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '88px 40px 72px', textAlign: 'center', background: 'radial-gradient(1000px 600px at 50% -10%, #eaf1fb 0%, rgba(234,241,251,0) 70%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 16px', borderRadius: '999px', background: 'var(--mb-teal-tint)', border: '1px solid rgba(13,148,136,.2)', marginBottom: '26px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-teal)' }} />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-teal)' }}>ABDM Layer 1 Certified Platform</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 auto 22px', maxWidth: '760px', lineHeight: 1.12, letterSpacing: '-.02em' }}>
          The fastest way to connect your lab to{' '}
          <span style={{ color: 'var(--mb-primary)' }}>India&apos;s ABDM</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--mb-text-2)', maxWidth: '600px', margin: '0 auto 44px', lineHeight: 1.6 }}>
          Onboard in minutes. Share digital reports. Earn government incentives. MedBridge handles the ABDM compliance so you can focus on patients.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <button onClick={() => navigate('/onboarding')} style={{ height: '52px', padding: '0 34px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '12px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 6px 20px rgba(20,86,184,.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Onboard your lab free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0l-5-5m5 5l-5 5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => navigate('/login')} style={{ height: '52px', padding: '0 30px', background: 'var(--mb-surface)', color: 'var(--mb-ink)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '12px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--mb-sh-card)' }}>
            Login to dashboard
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--mb-ink)', padding: '36px 40px', display: 'flex', justifyContent: 'center', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, maxWidth: '240px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.12)' : 'none', padding: '0 24px' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#fff', fontFamily: 'var(--mb-mono)', letterSpacing: '-.01em' }}>{s.value}</div>
            <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,.6)', marginTop: '6px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '34px', fontWeight: 700, color: 'var(--mb-ink)', textAlign: 'center', marginBottom: '10px', letterSpacing: '-.01em' }}>Everything your lab needs</h2>
        <p style={{ fontSize: '16.5px', color: 'var(--mb-text-2)', textAlign: 'center', marginBottom: '52px' }}>Built specifically for small and mid-size diagnostic labs in India.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '18px', padding: '32px', boxShadow: 'var(--mb-sh-card)', display: 'flex', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--mb-ink)', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '14.5px', color: 'var(--mb-text-2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'var(--mb-primary)', margin: '0 40px 64px', borderRadius: '20px', padding: '52px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', boxShadow: '0 12px 34px rgba(20,86,184,.24)' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-.01em' }}>Ready to go digital?</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.8)', margin: 0 }}>Join thousands of labs already earning ABDM incentives with MedBridge.</p>
        </div>
        <button onClick={() => navigate('/onboarding')} style={{ height: '52px', padding: '0 34px', background: '#fff', color: 'var(--mb-primary)', border: 'none', borderRadius: '12px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
          Start for free →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--mb-border)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--mb-surface)' }}>
        <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>© 2026 MedBridge. <span style={{ color: 'var(--mb-text-2)' }}>Securely connected to India&apos;s ABDM health network</span>.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--mb-text-2)', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)' }} />
          All systems operational
        </div>
      </footer>
    </div>
  );
};

export default Home;
