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
  const estimatedCost = selectedTestIds.size * 350; // Mock price of 350 per test

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '256px', flex: 'none', background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 24px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
                <circle cx="12" cy="5.5" r="1.6" fill="#fff" />
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="14" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="3" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
              <rect x="14" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" />
            </svg>Dashboard
          </button>
          <button onClick={() => navigate('/patients/register')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9" />
              <path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Patients
          </button>
          <button onClick={() => navigate('/orders/create')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }}></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 10.5v5M14.5 10.5v5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Orders
          </button>
          <button onClick={() => navigate('/reports/review')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 4h7l4 4v12H7z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M13 4v5h5" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M9.5 13h5M9.5 16h3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Reports
          </button>
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.2" stroke="#5b6b82" strokeWidth="1.9" />
              <path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" />
            </svg>Settings
          </button>
        </nav>
      </aside>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '68px', flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mb-teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M9 3h6v5l4 8.5A2.5 2.5 0 0 1 16.7 20H7.3A2.5 2.5 0 0 1 5 16.5L9 8V3z" stroke="#0a6b62" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>{labInfo.name}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>HFR ID {labInfo.hfr_id}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ height: '40px', padding: '0 16px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', background: 'none' }}>Logout</button>
        </header>

        <main style={{ flex: 1, padding: '30px 36px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)', marginBottom: '8px' }}>Orders · Create order</div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: 0 }}>Create order</h1>
          </div>

          {success ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '460px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '36px', textAlign: 'center', boxShadow: 'var(--mb-sh-card)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--mb-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="var(--mb-success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>Order Placed!</h2>
                <p style={{ fontSize: '14.5px', color: 'var(--mb-text-2)', margin: '0 0 24px' }}>Transaction created in pending state. Direct the patient to wait for pathology results.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => navigate('/dashboard')} style={{ height: '44px', padding: '0 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 600, cursor: 'pointer' }}>Go to Dashboard</button>
                  <button onClick={() => { setSuccess(false); setSelectedTestIds(new Set()); }} style={{ height: '44px', padding: '0 20px', background: '#fff', color: 'var(--mb-primary)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '9px', fontWeight: 600, cursor: 'pointer' }}>Create Another</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', minHeight: 0 }}>
              
              {/* Left Column: Catalogue */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--mb-border)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Select Patient</label>
                    <select
                      value={selectedPatient?.id || ''}
                      onChange={e => {
                        const pat = patients.find(p => p.id === parseInt(e.target.value));
                        if (pat) setSelectedPatient(pat);
                      }}
                      style={{ width: '100%', height: '46px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '9px', padding: '0 14px', fontSize: '15px', outline: 'none' }}
                    >
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (ABHA: {p.abha_id || 'None'})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>Test Catalog</div>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                  {catalog.map(test => {
                    const selected = selectedTestIds.has(test.id);
                    return (
                      <div key={test.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid var(--mb-border)' }}>
                        <div>
                          <div style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{test.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>{test.category} · {test.description || 'Reference ranges loaded'}</div>
                        </div>
                        <button
                          onClick={() => toggleTest(test.id)}
                          style={{
                            height: '36px', padding: '0 16px', borderRadius: '8px', border: 'none',
                            background: selected ? 'var(--mb-primary-tint)' : 'var(--mb-primary)',
                            color: selected ? 'var(--mb-primary-dark)' : '#fff',
                            fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          {selected ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Summary */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--mb-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mb-ink)' }}>Order summary</span>
                  <span style={{ background: 'var(--mb-primary)', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontSize: '13px', fontWeight: 700 }}>{selectedTestIds.size}</span>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}>
                  {selectedTests.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--mb-bg)' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>{t.category}</div>
                      </div>
                      <button onClick={() => toggleTest(t.id)} style={{ border: 'none', background: 'none', color: 'var(--mb-danger)', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                    </div>
                  ))}
                  {selectedTestIds.size === 0 && (
                    <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--mb-text-3)' }}>No tests added to order yet.</div>
                  )}
                </div>

                <div style={{ padding: '20px 22px', borderTop: '1px solid var(--mb-border)', background: 'var(--mb-bg-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 600 }}>Estimated price:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--mb-mono)' }}>₹{estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  {error && <div style={{ color: 'var(--mb-danger)', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
                  <button onClick={handleCreateOrder} disabled={submitting} style={{ width: '100%', height: '48px', background: submitting ? '#93b3e0' : 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                    {submitting ? 'Creating Order…' : 'Place Order & Link ABDM'}
                  </button>
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
