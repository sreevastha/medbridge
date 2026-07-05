import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CatalogueTest { id: number; name: string; category: string; description: string; }
interface StaffRow { name: string; email: string; role: string; contact: string; }

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

  // Step 3 — Staff
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: ROLES[1], contact: '' });
  const [addingStaff, setAddingStaff] = useState(false);

  // Step 4 — Tests
  const [catalogueTests, setCatalogueTests] = useState<CatalogueTest[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
  const [loadingTests, setLoadingTests] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const steps = ['Facility Details', 'Branding & Logo', 'Staff', 'Tests & Panels'];

  // Fetch tests immediately on mount so database latency does not slow down step 4 navigation!
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
    setNewStaff({ name: '', email: '', role: ROLES[1], contact: '' });
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
        setError('Please fill in all required fields.');
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

  // Input styles
  const inputStyle: React.CSSProperties = {
    width: '100%', height: '46px', border: '1.5px solid var(--mb-border-strong)',
    borderRadius: '9px', padding: '0 14px', fontSize: '15px', color: 'var(--mb-ink)',
    background: 'var(--mb-surface)', fontFamily: 'var(--mb-font)', outline: 'none',
    boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--mb-text-2)', marginBottom: '6px'
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)' }}>

      {/* Top brand bar */}
      <div style={{ height: '64px', flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.5" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
        </div>
        <button onClick={() => navigate('/login')} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Already have an account? Login →</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 24px 60px' }}>

        {/* Step progress */}
        <div style={{ width: '100%', maxWidth: '780px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((s, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <React.Fragment key={n}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, background: done ? 'var(--mb-success)' : active ? 'var(--mb-primary)' : 'var(--mb-border)', color: done || active ? '#fff' : 'var(--mb-text-3)', marginBottom: '6px', transition: 'all .2s' }}>
                      {done ? '✓' : n}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: active ? 600 : 400, color: active ? 'var(--mb-primary)' : done ? 'var(--mb-success)' : 'var(--mb-text-3)', whiteSpace: 'nowrap' }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 2, height: '2px', background: done ? 'var(--mb-success)' : 'var(--mb-border)', marginBottom: '22px', transition: 'all .2s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: '780px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '32px 36px' }}>

          {/* ===== STEP 1: FACILITY DETAILS ===== */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Facility details</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 28px' }}>Tell us about your lab so we can connect it with ABDM.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Facility name <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="facility_name" value={formData.facility_name} onChange={handleChange} placeholder="e.g. Sunrise Diagnostics" />
                </div>
                <div>
                  <label style={labelStyle}>HFR ID <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="hfr_id" value={formData.hfr_id} onChange={handleChange} placeholder="e.g. 4521-8890" />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input style={inputStyle} name="address" value={formData.address} onChange={handleChange} placeholder="e.g. FC Road, Pune 411004" />
                </div>
                <div>
                  <label style={labelStyle}>Admin username <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="username" value={formData.username} onChange={handleChange} placeholder="e.g. admin" autoComplete="username" />
                </div>
                <div>
                  <label style={labelStyle}>Password <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input style={inputStyle} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password" />
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 2: BRANDING ===== */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Branding & logo</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 28px' }}>Customise how your lab appears on reports. You can update this later.</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 0' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: 'var(--mb-primary-tint)', border: '2px dashed var(--mb-border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1456b8" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: '12px', color: 'var(--mb-primary)', fontWeight: 600 }}>Upload logo</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--mb-text-3)', margin: 0 }}>PNG or JPG · Recommended 200×200px</p>
              </div>
              <div>
                <label style={labelStyle}>Lab tagline (optional)</label>
                <input style={inputStyle} placeholder="e.g. Trusted diagnostics since 2003" />
              </div>
            </>
          )}

          {/* ===== STEP 3: STAFF ===== */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Staff</h2>
                  <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>Invite the people who'll use MedBridge. You can change roles later.</p>
                </div>
                {!addingStaff && (
                  <button onClick={() => setAddingStaff(true)} style={{ height: '40px', padding: '0 16px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '9px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>Add staff
                  </button>
                )}
              </div>

              {/* Add staff form */}
              {addingStaff && (
                <div style={{ background: 'var(--mb-primary-tint)', border: '1.5px solid var(--mb-primary)', borderRadius: '12px', padding: '18px', marginBottom: '16px' }}>
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
                    <button onClick={() => { setAddingStaff(false); setNewStaff({ name: '', email: '', role: ROLES[1], contact: '' }); }} style={{ height: '38px', padding: '0 18px', background: 'var(--mb-surface)', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '8px', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Staff table */}
              <div style={{ border: '1px solid var(--mb-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.2fr 44px', padding: '10px 18px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11.5px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                  <div>Name</div><div>Email</div><div>Contact</div><div>Role</div><div />
                </div>
                {staffList.length === 0 && (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'var(--mb-text-3)', fontSize: '14px' }}>
                    No staff added yet. Click <strong>Add staff</strong> to invite team members.
                  </div>
                )}
                {staffList.map((m, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1.2fr 44px', padding: '12px 18px', borderBottom: idx < staffList.length - 1 ? '1px solid var(--mb-border)' : 'none', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                        {m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>{m.email}</div>
                    <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>{m.contact}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--mb-text)' }}>{m.role}</div>
                    <div style={{ textAlign: 'right' }}>
                      <button onClick={() => handleRemoveStaff(idx)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--mb-text-3)', display: 'flex', alignItems: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===== STEP 4: TESTS ===== */}
          {step === 4 && (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Tests & panels</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 22px' }}>Click to select the tests your lab offers. We'll preload standard reference ranges.</p>

              {loadingTests ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)', fontSize: '14px' }}>Loading tests from database…</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {catalogueTests.map(test => {
                    const selected = selectedTestIds.has(test.id);
                    return (
                      <button key={test.id} onClick={() => toggleTest(test.id)} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '15px 16px', border: selected ? '2px solid var(--mb-primary)' : '1.5px solid var(--mb-border-strong)', background: selected ? 'var(--mb-primary-tint)' : 'var(--mb-surface)', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'var(--mb-font)' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '7px', border: selected ? 'none' : '1.5px solid var(--mb-border-strong)', background: selected ? 'var(--mb-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                          {selected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{test.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)', marginTop: '2px' }}>{test.category}{test.description ? ` · ${test.description}` : ''}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {catalogueTests.length > 0 && (
                <div style={{ marginTop: '18px', fontSize: '13.5px', color: 'var(--mb-text-2)' }}>
                  <span style={{ fontWeight: 700, color: selectedTestIds.size > 0 ? 'var(--mb-primary)' : 'var(--mb-text-3)' }}>{selectedTestIds.size} selected</span>
                  {' '}· You can add more from the catalogue later.
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: '18px', padding: '12px 16px', background: 'var(--mb-danger-tint)', border: '1px solid var(--mb-danger)', borderRadius: '9px', fontSize: '14px', color: 'var(--mb-danger)' }}>
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--mb-border)' }}>
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} style={{ height: '44px', padding: '0 20px', background: 'var(--mb-surface)', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '9px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}>
              ← {step > 1 ? 'Back' : 'Home'}
            </button>
            <button onClick={handleNext} disabled={submitting} style={{ height: '44px', padding: '0 28px', background: submitting ? '#93b3e0' : 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '9px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.22)' }}>
              {submitting ? 'Saving…' : step < 4 ? 'Continue →' : 'Finish Setup ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabOnboarding;
