import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => setRegistered(true);
  const handleReset = () => setRegistered(false);
  const handleEnterManually = (e: React.MouseEvent) => {
    e.preventDefault();
    // In future: toggle manual entry mode
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      
      {/* ===================== SIDEBAR ===================== */}
      <aside style={{ width: '256px', flex: 'none', background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
              <path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
              <circle cx="12" cy="5.5" r="1.6" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="14" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="3" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="14" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
            </svg>Dashboard
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, textDecoration: 'none', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }}></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.6" stroke="#0e3a7a" strokeWidth="1.9" />
              <path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Patients
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 10.5v5M14.5 10.5v5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Orders
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 4h7l4 4v12H7z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M13 4v5h5" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M9.5 13h5M9.5 16h3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Reports
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.2" stroke="#5b6b82" strokeWidth="1.9" />
              <path d="M8.6 15.4c.6-1.5 2-2.1 3.4-2.1s2.8.6 3.4 2.1" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Admin
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.2" stroke="#5b6b82" strokeWidth="1.9" />
              <path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Settings
          </a>
        </nav>
        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)' }}></span>
          <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* ===================== MAIN ===================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top bar */}
        <header style={{ height: '68px', flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mb-teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M9 3h6v5l4 8.5A2.5 2.5 0 0 1 16.7 20H7.3A2.5 2.5 0 0 1 5 16.5L9 8V3z" stroke="#0a6b62" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 3h8" stroke="#0a6b62" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7.5 13h9" stroke="#0a6b62" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>Sunrise Diagnostics</div>
              <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>Pune · HFR ID 4521-8890</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mb-text-2)', cursor: 'pointer' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                <path d="M12 4a5 5 0 0 0-5 5v3l-1.6 3h13.2L17 12V9a5 5 0 0 0-5-5z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
                <path d="M10 19a2 2 0 0 0 4 0" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--mb-border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>PK</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>Priya Kulkarni</div>
                <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Front desk</div>
              </div>
            </div>
            <div onClick={handleLogout} style={{ height: '40px', padding: '0 16px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>Logout
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '30px 36px', overflow: 'auto', minHeight: 0 }}>
          
          {/* Breadcrumb + title */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span>Patients</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#8a97a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: 'var(--mb-text-2)', fontWeight: 600 }}>Register</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: 0, letterSpacing: '-.01em' }}>Register patient</h1>
          </div>

          {/* ====== FORM STATE ====== */}
          {!registered && (
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Left: QR scan card */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', padding: '28px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'var(--mb-teal-tint)', color: '#0a6b62', fontSize: '12.5px', fontWeight: 600, marginBottom: '18px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>Fastest way
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 6px' }}>Patient scans to share</h2>
                <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--mb-text-2)', margin: '0 0 22px' }}>Ask the patient to open their ABHA / health app and scan this code. Their details fill in automatically.</p>
                <div style={{ display: 'inline-block', padding: '16px', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=210x210&margin=0&data=abdm://share/sunrise-diagnostics/reg-2046" alt="Scan to share ABHA details" width="210" height="210" style={{ display: 'block', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '18px', fontSize: '13.5px', color: 'var(--mb-text-2)' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--mb-warning)', boxShadow: '0 0 0 3px var(--mb-warning-tint)' }}></span>Waiting for scan&hellip;
                </div>
                <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--mb-border)', fontSize: '13px', color: 'var(--mb-text-3)', lineHeight: 1.5 }}>Code refreshes every 60s · Token #REG-2046</div>
              </div>

              {/* Right: form card */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', padding: '28px 30px 30px' }}>
                
                {/* auto-fill / manual toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: '#136b44', fontSize: '13.5px', fontWeight: 600 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>Auto-filled from health app scan
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--mb-text-3)' }}>
                    or <a href="#" onClick={handleEnterManually} style={{ color: 'var(--mb-primary)', fontWeight: 600, textDecoration: 'none' }}>enter manually</a>
                  </span>
                </div>

                {/* fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 24px' }}>
                  {/* Full name */}
                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Full name</label>
                    <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '16px', color: 'var(--mb-ink)', background: 'var(--mb-success-tint)', borderColor: '#bfe3cf' }}>Anjali Deshpande</div>
                  </div>
                  {/* Age */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Age</label>
                    <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '16px', color: 'var(--mb-ink)', background: 'var(--mb-success-tint)', borderColor: '#bfe3cf' }}>34 years</div>
                  </div>
                  {/* Gender */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Gender</label>
                    <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '16px', color: 'var(--mb-ink)', background: 'var(--mb-success-tint)', borderColor: '#bfe3cf' }}>
                      Female
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="#5b6b82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {/* Mobile */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Mobile number</label>
                    <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)', background: 'var(--mb-success-tint)', borderColor: '#bfe3cf' }}>
                      <span style={{ color: 'var(--mb-text-3)' }}>+91</span>98220 41157
                    </div>
                  </div>
                  {/* ABHA */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>ABHA health ID</label>
                    <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '16px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)', background: 'var(--mb-success-tint)', borderColor: '#bfe3cf' }}>
                      91-2345-6789-0012
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* referring info row */}
                <div style={{ marginTop: '22px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Referring doctor <span style={{ fontWeight: 400, color: 'var(--mb-text-3)' }}>(optional)</span></label>
                  <div style={{ height: '48px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '16px', color: 'var(--mb-text-3)' }}>e.g. Dr. Khan, City Clinic</div>
                </div>

                {/* actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '30px', paddingTop: '24px', borderTop: '1px solid var(--mb-border)' }}>
                  <button onClick={handleRegister} style={{ height: '52px', padding: '0 30px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--mb-primary-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--mb-primary)'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>Register patient
                  </button>
                  <button style={{ height: '52px', padding: '0 22px', background: '#fff', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <div style={{ marginLeft: 'auto', fontSize: '13.5px', color: 'var(--mb-text-3)' }}>Next: create a test order.</div>
                </div>
              </div>
            </div>
          )}

          {/* ====== SUCCESS STATE ====== */}
          {registered && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
              <div style={{ width: '560px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '44px 44px 36px', textAlign: 'center' }}>
                <div style={{ width: '78px', height: '78px', borderRadius: '50%', background: 'var(--mb-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 0 0 8px rgba(31,138,91,.07)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>Registered &#10003;</h2>
                <p style={{ fontSize: '16px', color: 'var(--mb-text-2)', margin: '0 0 26px' }}>Anjali Deshpande has been added and linked to her ABHA health ID.</p>

                <div style={{ textAlign: 'left', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', borderRadius: '12px', padding: '18px 20px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                    <span style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}>Patient ID</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)' }}>#LB-2046</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                    <span style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}>ABHA health ID</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)' }}>91-2345-6789-0012</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}>ABDM link</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0a6b62' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>Linked
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                  <button style={{ height: '52px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', gap: '9px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--mb-primary-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--mb-primary)'}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>Create test order
                  </button>
                  <button onClick={handleReset} style={{ height: '52px', padding: '0 24px', background: '#fff', color: 'var(--mb-primary)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Register another</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default PatientRegistration;
