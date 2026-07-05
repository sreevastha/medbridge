import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CatalogueTest { id: number; name: string; category: string; description: string; }
interface StaffRow { name: string; email: string; role: string; contact: string; status?: string; }

const ROLES = ['Lab Owner', 'Pathologist', 'Technician', 'Front Desk', 'Receptionist'];

const LabOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Step 1 form data
  const [formData, setFormData] = useState({
    facility_name: '',
    hfr_id: '',
    address: '',
    username: '',
    password: '',
  });

  // Step 2 — Branding
  const [selectedBrandColor, setSelectedBrandColor] = useState('#1456b8');
  const brandColors = ['#1456b8', '#0d9488', '#0e3a7a', '#7a4ec2', '#b9770b'];

  // Step 3 — Staff
  const [staffList, setStaffList] = useState<StaffRow[]>([
    { name: 'Vikram Mehta', email: 'admin@sunrisediag.in', role: 'Lab owner', contact: '+91 98220 11223', status: 'You' },
    { name: 'Dr. Roshni Deshmukh', email: 'roshni.d@sunrisediag.in', role: 'Pathologist', contact: '+91 98220 44556', status: 'Invited' },
    { name: 'Priya Kulkarni', email: 'priya.k@sunrisediag.in', role: 'Front desk', contact: '+91 98220 77889', status: 'Invited' }
  ]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: ROLES[1], contact: '', status: 'Invited' });
  const [addingStaff, setAddingStaff] = useState(false);

  // Step 4 — Tests
  const [catalogueTests, setCatalogueTests] = useState<CatalogueTest[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
  const [loadingTests, setLoadingTests] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const steps = ['Facility details', 'Branding & logo', 'Staff', 'Tests'];

  // Fetch tests immediately on mount
  useEffect(() => {
    setLoadingTests(true);
    fetch('/api/catalogue/tests')
      .then(res => res.json())
      .then((data: CatalogueTest[]) => {
        setCatalogueTests(data);
        // Pre-select first 3 by default
        setSelectedTestIds(new Set(data.slice(0, 3).map(t => t.id)));
        setLoadingTests(false);
      })
      .catch(() => setLoadingTests(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.contact.trim()) return;
    setStaffList([...staffList, { ...newStaff }]);
    setNewStaff({ name: '', email: '', role: ROLES[1], contact: '', status: 'Invited' });
    setAddingStaff(false);
  };

  const handleRemoveStaff = (idx: number) => {
    setStaffList(staffList.filter((_, i) => i !== idx));
  };

  const toggleTest = (id: number) => {
    const next = new Set(selectedTestIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTestIds(next);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.facility_name || !formData.hfr_id || !formData.username || !formData.password) {
        setError('Please fill in all required fields (Facility name, HFR ID, Admin username, Password).');
        return;
      }
    }
    setError('');
    if (step < 4) { setStep(step + 1); return; }

    // Final submit
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.detail || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Input styles from .dc.html (.mb-in)
  const inputStyle: React.CSSProperties = {
    height: '48px', border: '1.5px solid var(--mb-border-strong)',
    borderRadius: '10px', padding: '0 14px', fontSize: '15.5px', color: 'var(--mb-ink)',
    background: '#fff', fontFamily: 'var(--mb-font)', outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s'
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--mb-text-2)', marginBottom: '8px'
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>

      {/* ===== TOP BRAND BAR ===== */}
      <div style={{ height: '64px', flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
          <span style={{ fontSize: '13px', color: 'var(--mb-text-3)', marginLeft: '6px', paddingLeft: '12px', borderLeft: '1px solid var(--mb-border)' }}>Lab setup</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <span style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>
            Need help? <a href="#help" onClick={e => e.preventDefault()} style={{ color: 'var(--mb-primary)', fontWeight: 600, textDecoration: 'none' }}>View setup guide</a>
          </span>
          <button onClick={() => navigate('/login')} style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mb-font)' }}>
            Save & exit →
          </button>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 32px 0' }}>
        <div style={{ width: '760px', maxWidth: '100%', paddingBottom: '40px' }}>

          {/* Intro */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '27px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px', letterSpacing: '-.01em' }}>Set up your lab on MedBridge</h1>
            <p style={{ fontSize: '15.5px', color: 'var(--mb-text-2)', margin: 0 }}>A few quick steps and you&rsquo;ll be ready to register patients and share reports to ABDM.</p>
          </div>

          {/* ===== STEP INDICATOR (STEPPER) ===== */}
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {steps.map((label, idx) => {
                const n = idx + 1;
                const done = n < step;
                const active = n === step;
                return (
                  <React.Fragment key={n}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 'none', cursor: 'pointer' }} onClick={() => done && setStep(n)}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700,
                        background: done ? 'var(--mb-success)' : active ? 'var(--mb-primary)' : '#fff',
                        color: (done || active) ? '#fff' : 'var(--mb-text-3)',
                        border: done || active ? 'none' : '1.5px solid var(--mb-border-strong)',
                        boxShadow: active ? '0 0 0 4px rgba(20,86,184,.14)' : 'none',
                        transition: 'all .2s'
                      }}>
                        {done ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : n}
                      </div>
                      <div style={{ marginLeft: '11px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: active ? 'var(--mb-primary)' : 'var(--mb-text-3)' }}>Step {n}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: (done || active) ? 'var(--mb-ink)' : 'var(--mb-text-3)', marginTop: '1px' }}>{label}</div>
                      </div>
                    </div>
                    {n < steps.length && (
                      <div style={{ flex: 1, height: '2px', margin: '0 16px', borderRadius: '2px', background: done ? 'var(--mb-success)' : 'var(--mb-border)', transition: 'all .2s' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ===== STEP 1: FACILITY DETAILS ===== */}
          {step === 1 && (
            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '30px 32px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Facility details</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 26px' }}>Tell us about your diagnostic lab. This appears on every report you share.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 24px' }}>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={labelStyle}>Lab name <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="facility_name" value={formData.facility_name} onChange={handleChange} placeholder="e.g. Sunrise Diagnostics" />
                </div>
                <div>
                  <label style={labelStyle}>Facility type</label>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--mb-text)', background: 'var(--mb-bg)' }}>
                    Diagnostic laboratory
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#5b6b82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>HFR / Facility ID <span style={{ fontWeight: 400, color: 'var(--mb-text-3)' }}>(ABDM) *</span></label>
                  <input style={{ ...inputStyle, fontFamily: 'var(--mb-mono)' }} name="hfr_id" value={formData.hfr_id} onChange={handleChange} placeholder="e.g. 4521-8890" />
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={labelStyle}>Street address</label>
                  <input style={inputStyle} name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Plot 14, FC Road, Pune 411004" />
                </div>
                <div>
                  <label style={labelStyle}>Admin username <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="username" value={formData.username} onChange={handleChange} placeholder="e.g. admin" autoComplete="username" />
                </div>
                <div>
                  <label style={labelStyle}>Admin password <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password" />
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2: BRANDING & LOGO ===== */}
          {step === 2 && (
            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '30px 32px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Branding & logo</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 26px' }}>Your logo and colour appear on the header of every report.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <label style={labelStyle}>Lab logo</label>
                  <div style={{ height: '150px', border: '2px dashed var(--mb-border-strong)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--mb-bg)', cursor: 'pointer' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 16V5m0 0L8 9m4-4l4 4" stroke="#8a97a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 16v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" stroke="#8a97a8" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <div style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}><span style={{ color: 'var(--mb-primary)', fontWeight: 600 }}>Upload a file</span> or drag here</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>PNG or SVG · up to 2 MB</div>
                  </div>
                  
                  <label style={{ ...labelStyle, margin: '22px 0 10px' }}>Brand colour</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {brandColors.map(col => (
                      <div
                        key={col}
                        onClick={() => setSelectedBrandColor(col)}
                        style={{
                          width: '38px', height: '38px', borderRadius: '9px', background: col, cursor: 'pointer',
                          boxShadow: selectedBrandColor === col ? `0 0 0 2px #fff, 0 0 0 4px ${col}` : 'none',
                          transition: 'all .15s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Report header preview</label>
                  <div style={{ border: '1px solid var(--mb-border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px', borderBottom: `2px solid ${selectedBrandColor}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: selectedBrandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="#fff"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)' }}>{formData.facility_name || 'Sunrise Diagnostics'}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--mb-text-2)' }}>{formData.address || 'Plot 14, FC Road, Pune 411004'}</div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px', background: 'var(--mb-bg)' }}>
                      <div style={{ height: '8px', width: '50%', background: 'var(--mb-border-strong)', borderRadius: '4px', marginBottom: '9px' }} />
                      <div style={{ height: '8px', width: '70%', background: 'var(--mb-border)', borderRadius: '4px', marginBottom: '9px' }} />
                      <div style={{ height: '8px', width: '40%', background: 'var(--mb-border)', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', margin: '12px 0 0', lineHeight: 1.5 }}>This is how your report header will look to patients and clinicians.</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: STAFF ===== */}
          {step === 3 && (
            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '30px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Staff</h2>
                  <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>Invite the people who&rsquo;ll use MedBridge. You can change roles later.</p>
                </div>
                {!addingStaff && (
                  <button onClick={() => setAddingStaff(true)} style={{ height: '42px', padding: '0 18px', background: '#fff', color: 'var(--mb-primary)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1456b8" strokeWidth="2.2" strokeLinecap="round"/></svg>Add staff
                  </button>
                )}
              </div>

              {/* Add Staff Form */}
              {addingStaff && (
                <div style={{ background: 'var(--mb-primary-tint)', border: '1.5px solid var(--mb-primary)', borderRadius: '12px', padding: '18px', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 160px', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Name</label>
                      <input style={inputStyle} value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input style={inputStyle} type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="email@lab.com" />
                    </div>
                    <div>
                      <label style={labelStyle}>Contact number</label>
                      <input style={inputStyle} value={newStaff.contact} onChange={e => setNewStaff({ ...newStaff, contact: e.target.value })} placeholder="e.g. 9876543210" />
                    </div>
                    <div>
                      <label style={labelStyle}>Role</label>
                      <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleAddStaff} style={{ height: '38px', padding: '0 18px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Add staff</button>
                    <button onClick={() => { setAddingStaff(false); setNewStaff({ name: '', email: '', role: ROLES[1], contact: '', status: 'Invited' }); }} style={{ height: '38px', padding: '0 18px', background: 'var(--mb-surface)', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '8px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Staff Table */}
              <div style={{ border: '1px solid var(--mb-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.3fr 60px', padding: '11px 18px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11.5px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                  <div>Name</div><div>Role</div><div>Status</div><div />
                </div>
                {staffList.map((m, idx) => {
                  const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const isYou = m.status === 'You';
                  return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.3fr 60px', padding: '13px 18px', borderBottom: idx < staffList.length - 1 ? '1px solid var(--mb-border)' : 'none', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: idx === 0 ? 'var(--mb-primary)' : idx === 1 ? 'var(--mb-teal-tint)' : 'var(--mb-primary-tint)', color: idx === 0 ? '#fff' : idx === 1 ? '#0a6b62' : 'var(--mb-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 700, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{m.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>{m.email}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--mb-text)' }}>{m.role}</div>
                      <div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '24px', padding: '0 10px', borderRadius: '999px', background: isYou ? 'var(--mb-success-tint)' : 'var(--mb-warning-tint)', color: isYou ? '#136b44' : '#8a5908', fontSize: '12.5px', fontWeight: 600 }}>
                          {m.status || 'Invited'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {!isYou ? (
                          <button onClick={() => handleRemoveStaff(idx)} title="Remove staff" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--mb-text-3)', display: 'inline-flex', alignItems: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2M8 7l1 12h6l1-12" stroke="#8a97a8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--mb-text-3)' }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== STEP 4: TESTS & PANELS ===== */}
          {step === 4 && (
            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '30px 32px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Tests & panels</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 22px' }}>Select the tests your lab offers. We&rsquo;ll preload standard reference ranges &mdash; edit pricing anytime.</p>
              
              {loadingTests ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)', fontSize: '14px' }}>Loading tests from database…</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {catalogueTests.map(test => {
                    const selected = selectedTestIds.has(test.id);
                    return (
                      <div
                        key={test.id}
                        onClick={() => toggleTest(test.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '15px 16px', border: selected ? '1.5px solid var(--mb-primary)' : '1.5px solid var(--mb-border-strong)', background: selected ? 'var(--mb-primary-tint)' : 'var(--mb-surface)', borderRadius: '11px', cursor: 'pointer', transition: 'all .15s' }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '7px', border: selected ? 'none' : '1.5px solid var(--mb-border-strong)', background: selected ? 'var(--mb-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', transition: 'all .15s' }}>
                          {selected && <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{test.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)' }}>{test.category}{test.description ? ` · ${test.description}` : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: '18px', fontSize: '13.5px', color: 'var(--mb-text-2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--mb-primary)' }}>{selectedTestIds.size} selected</span> · you can add more from the catalogue later.
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{ marginTop: '18px', padding: '12px 16px', background: 'var(--mb-danger-tint)', border: '1px solid var(--mb-danger)', borderRadius: '9px', fontSize: '14px', color: 'var(--mb-danger)', fontWeight: 500 }}>
              {error}
            </div>
          )}

        </div>
      </div>

      {/* ===== FOOTER NAV ===== */}
      <div style={{ flex: 'none', background: 'var(--mb-surface)', borderTop: '1px solid var(--mb-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ width: '760px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
            style={{
              height: '50px', padding: '0 24px', background: '#fff', color: step === 1 ? 'var(--mb-text-3)' : 'var(--mb-text-2)',
              border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', opacity: step === 1 ? 0.5 : 1,
              transition: 'all .15s'
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          
          <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>Step {step} of 4</div>
          
          <button
            onClick={handleNext}
            disabled={submitting}
            style={{
              height: '50px', padding: '0 30px', background: submitting ? '#93b3e0' : 'var(--mb-primary)', color: '#fff',
              border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15.5px', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex',
              alignItems: 'center', gap: '9px', transition: 'all .15s'
            }}
          >
            {submitting ? 'Saving…' : step === 4 ? 'Finish setup' : 'Next'}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default LabOnboarding;
