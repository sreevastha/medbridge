import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface TestItem {
  id: number;
  name: string;
  category: string;
  description: string;
}

interface Patient {
  id: number;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  abha_id?: string;
}

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patient_id');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [catalog, setCatalog] = useState<TestItem[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
  const [labInfo, setLabInfo] = useState({ name: 'Sunrise Diagnostics', hfr_id: '4521-8890' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load initial data
    Promise.all([
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/catalogue/tests').then(res => res.json())
    ])
      .then(([labData, patientsList, testsCatalog]) => {
        if (labData.facility_name) {
          setLabInfo({ name: labData.facility_name, hfr_id: labData.hfr_id });
        }
        setPatients(patientsList);
        setCatalog(testsCatalog);
        
        // Match target patient if passed via URL
        if (patientIdParam) {
          const matched = patientsList.find((p: Patient) => p.id === parseInt(patientIdParam));
          if (matched) setSelectedPatient(matched);
        } else if (patientsList.length > 0) {
          setSelectedPatient(patientsList[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading data", err);
        setLoading(false);
      });
  }, [navigate, patientIdParam]);

  const toggleTest = (id: number) => {
    const next = new Set(selectedTestIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTestIds(next);
  };

  const handleCreateOrder = async () => {
    if (!selectedPatient) {
      setError('Please select a patient.');
      return;
    }
    if (selectedTestIds.size === 0) {
      setError('Please select at least one test.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          test_ids: Array.from(selectedTestIds)
        })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Failed to place order');
      }
    } catch {
      setError('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mb-bg)' }}>
        Loading order configuration…
      </div>
    );
  }

  const selectedTests = catalog.filter(t => selectedTestIds.has(t.id));
  const subtotal = selectedTestIds.size * 350;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      
      {/* Sidebar - App Shell Spec */}
      <aside style={{ width: '256px', flex: 'none', background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 24px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
                <circle cx="12" cy="5.5" r="1.6" fill="#fff" />
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="14" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="3" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="14" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /></svg>Dashboard
          </button>
          <button onClick={() => navigate('/patients/register')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9" /><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Patients
          </button>
          <button onClick={() => navigate('/orders/create')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', position: 'relative', transition: 'all .15s' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }}></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 10.5v5M14.5 10.5v5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" /></svg>Orders
          </button>
          <button onClick={() => navigate('/reports/review')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" /><path d="M13 4v5h5" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" /><path d="M9.5 13h5M9.5 16h3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Reports
          </button>
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="#5b6b82" strokeWidth="1.9" /><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Settings
          </button>
        </nav>
        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)' }}></span>
          <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar - App Shell Spec */}
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
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>{labInfo.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>HFR ID {labInfo.hfr_id}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mb-text-2)', cursor: 'pointer' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 4a5 5 0 0 0-5 5v3l-1.6 3h13.2L17 12V9a5 5 0 0 0-5-5z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--mb-border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>{labInfo.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>Admin</div>
                <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Lab owner</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ height: '40px', padding: '0 16px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--mb-font)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '30px 36px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Breadcrumb + title */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span>Orders</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#8a97a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: 'var(--mb-text-2)', fontWeight: 600 }}>Create order</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: 0, letterSpacing: '-.01em' }}>Create order</h1>
          </div>

          {/* Selected patient banner */}
          <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', padding: '16px 22px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                {selectedPatient ? selectedPatient.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--mb-ink)' }}>{selectedPatient ? selectedPatient.name : 'No Patient Selected'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '24px', padding: '0 10px', borderRadius: '999px', background: '#fff', border: '1.5px solid var(--mb-teal)', color: '#0a6b62', fontSize: '12px', fontWeight: 600 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#0d9488" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {selectedPatient?.abha_id ? 'ABHA linked' : 'Patient selected'}
                  </span>
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)', marginTop: '3px' }}>
                  {selectedPatient?.gender || 'Female'} · {selectedPatient?.age || 34} · <span style={{ fontFamily: 'var(--mb-mono)' }}>#LB-{selectedPatient?.id || '0'}</span> · <span style={{ fontFamily: 'var(--mb-mono)' }}>{selectedPatient?.abha_id || 'No ABHA ID'}</span>
                </div>
              </div>
            </div>
            <div>
              <select
                value={selectedPatient?.id || ''}
                onChange={e => {
                  const pat = patients.find(p => p.id === parseInt(e.target.value));
                  if (pat) setSelectedPatient(pat);
                }}
                style={{ padding: '8px 14px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-primary)', background: 'transparent', cursor: 'pointer', outline: 'none', fontFamily: 'var(--mb-font)' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>Change: {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {success ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '560px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '44px 44px 36px', textAlign: 'center', boxShadow: 'var(--mb-sh-card)' }}>
                <div style={{ width: '78px', height: '78px', borderRadius: '50%', background: 'var(--mb-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 0 0 8px rgba(31,138,91,.07)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="var(--mb-success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>Order Placed!</h2>
                <p style={{ fontSize: '16px', color: 'var(--mb-text-2)', margin: '0 0 26px' }}>Transaction created in pending state. Direct the patient to wait for pathology results.</p>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                  <button onClick={() => navigate('/dashboard')} style={{ height: '52px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>Go to Dashboard</button>
                  <button onClick={() => { setSuccess(false); setSelectedTestIds(new Set()); }} style={{ height: '52px', padding: '0 24px', background: '#fff', color: 'var(--mb-primary)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Create Another</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', minHeight: 0 }}>
              
              {/* Left Column: Catalogue */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--mb-border)' }}>
                  <div style={{ height: '48px', background: 'var(--mb-bg)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="#8a97a8" strokeWidth="1.9"/><path d="M16 16l4 4" stroke="#8a97a8" strokeWidth="1.9" strokeLinecap="round"/></svg>
                    <span style={{ fontSize: '15px', color: 'var(--mb-text-3)' }}>Search tests & panels — e.g. CBC, lipid, thyroid</span>
                  </div>
                  <div style={{ display: 'flex', gap: '9px', marginTop: '14px' }}>
                    <div style={{ height: '30px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>Popular</div>
                    <div style={{ height: '30px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', color: 'var(--mb-text-2)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>Haematology</div>
                    <div style={{ height: '30px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', color: 'var(--mb-text-2)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>Biochemistry</div>
                    <div style={{ height: '30px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', color: 'var(--mb-text-2)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>Hormones</div>
                  </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
                  {catalog.map(test => {
                    const selected = selectedTestIds.has(test.id);
                    return (
                      <div key={test.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid var(--mb-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--mb-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-2)' }}>
                            {test.name.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{test.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--mb-text-3)', marginTop: '2px' }}>{test.category} · {test.description || 'same day'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text)' }}>₹350</div>
                          {selected ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px', borderRadius: '9px', background: '#e6f4ee', color: '#136b44', fontSize: '14px', fontWeight: 600 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Added
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleTest(test.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 16px', borderRadius: '9px', background: '#fff', border: '1.5px solid #cbd5e1', color: '#1456b8', fontFamily: 'var(--mb-font)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#1456b8" strokeWidth="2.2" strokeLinecap="round"/></svg>Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Summary */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Order summary</h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', height: '24px', padding: '0 8px', borderRadius: '999px', background: 'var(--mb-primary)', color: '#fff', fontSize: '13px', fontWeight: 600 }}>{selectedTestIds.size}</span>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                  {selectedTests.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '15px 22px', borderBottom: '1px solid var(--mb-border)' }}>
                      <div style={{ paddingRight: '12px' }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{t.name}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>{t.category}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 'none' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 600, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text)' }}>₹350</span>
                        <button onClick={() => toggleTest(t.id)} style={{ width: '26px', height: '26px', borderRadius: '7px', border: 'none', background: 'var(--mb-bg-subtle)', color: 'var(--mb-text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedTestIds.size === 0 && (
                    <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--mb-text-3)', fontSize: '14px' }}>No tests added to order yet.</div>
                  )}
                </div>

                {/* totals + action */}
                <div style={{ borderTop: '1px solid var(--mb-border)', padding: '18px 22px 20px', background: 'var(--mb-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--mb-text-2)', marginBottom: '9px' }}><span>Subtotal</span><span style={{ fontFamily: 'var(--mb-mono)' }}>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--mb-text-2)', marginBottom: '13px' }}><span>GST (incl.)</span><span style={{ fontFamily: 'var(--mb-mono)' }}>₹{gst.toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '13px', borderTop: '1px dashed var(--mb-border-strong)', marginBottom: '18px' }}><span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)' }}>Total</span><span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', fontFamily: 'var(--mb-mono)' }}>₹{total.toLocaleString('en-IN')}</span></div>
                  {error && <div style={{ color: 'var(--mb-danger)', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
                  <button onClick={handleCreateOrder} disabled={submitting} style={{ width: '100%', height: '52px', background: submitting ? '#93b3e0' : 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '16px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {submitting ? 'Creating Order…' : 'Create order'}
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--mb-text-3)', marginTop: '12px' }}>Next: collect sample & print label.</div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreateOrder;
