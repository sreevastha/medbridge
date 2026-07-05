import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReportItem {
  id: number;
  txn_id_str: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_abha: string;
  test_name: string;
  status: string;
  created_at: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [labInfo, setLabInfo] = useState({ name: 'Sunrise Diagnostics', hfr_id: '4521-8890' });
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([labData, reportsList]) => {
        if (labData.facility_name) {
          setLabInfo({ name: labData.facility_name, hfr_id: labData.hfr_id });
        }
        setReports(reportsList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading reports", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleSign = async (id: number) => {
    setSigningId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${id}/sign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        // Update local status
        setReports(reports.map(r => r.id === id ? { ...r, status: 'shared' } : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mb-bg)' }}>
        Loading reports review queue…
      </div>
    );
  }

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
          <button onClick={() => navigate('/orders/create')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>Orders
          </button>
          <button onClick={() => navigate('/reports/review')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }}></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 4h7l4 4v12H7z" stroke="#0e3a7a" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M13 4v5h5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M9.5 13h5M9.5 16h3" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" />
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

      {/* Main Container */}
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

        <main style={{ flex: 1, padding: '30px 36px', overflow: 'auto' }}>
          <div style={{ marginBottom: '22px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Review & sign reports</h1>
            <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>Review pathologist test entries and digitally upload them to ABDM to claim incentives.</p>
          </div>

          <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.8fr 1fr 1.5fr', padding: '12px 22px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
              <div>Order ID</div><div>Patient</div><div>Test</div><div>Date</div><div style={{ textAlign: 'right' }}>Action</div>
            </div>

            {reports.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)' }}>No reports currently awaiting signature.</div>
            ) : (
              reports.map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.8fr 1fr 1.5fr', padding: '14px 22px', borderBottom: '1px solid var(--mb-bg)', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--mb-mono)' }}>{r.txn_id_str}</div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>{r.patient_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>{r.patient_gender} · {r.patient_age} yrs</div>
                  </div>
                  <div style={{ fontSize: '14px' }}>{r.test_name}</div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--mb-mono)' }}>{r.created_at}</div>
                  <div style={{ textAlign: 'right' }}>
                    {r.status === 'shared' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: 'var(--mb-success)', fontSize: '13px', fontWeight: 600 }}>Signed & Shared ✓</span>
                    ) : (
                      <button
                        onClick={() => handleSign(r.id)}
                        disabled={signingId === r.id}
                        style={{
                          height: '36px', padding: '0 16px', background: 'var(--mb-success)', color: '#fff',
                          border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        {signingId === r.id ? 'Signing…' : 'Sign & Share'}
                      </button>
                    )}
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

export default Reports;
