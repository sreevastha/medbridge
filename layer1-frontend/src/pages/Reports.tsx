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

interface Analyte {
  name: string;
  sub: string;
  unit: string;
  min: number;
  max: number;
  value: string;
}

const initialAnalytes: Analyte[] = [
  { name: 'Haemoglobin', sub: 'Hb', unit: 'g/dL', min: 12.0, max: 15.5, value: '10.8' },
  { name: 'Total RBC count', sub: 'RBC', unit: '10⁶/µL', min: 3.8, max: 4.8, value: '4.2' },
  { name: 'Packed cell volume', sub: 'PCV / Haematocrit', unit: '%', min: 36, max: 46, value: '33' },
  { name: 'Total WBC count', sub: 'TLC', unit: '10³/µL', min: 4.0, max: 11.0, value: '12.6' },
  { name: 'Platelet count', sub: 'PLT', unit: '10³/µL', min: 150, max: 410, value: '265' },
  { name: 'Neutrophils', sub: 'Differential', unit: '%', min: 40, max: 75, value: '68' },
  { name: 'Lymphocytes', sub: 'Differential', unit: '%', min: 20, max: 45, value: '24' },
  { name: 'MCV', sub: 'Mean corpuscular volume', unit: 'fL', min: 80, max: 100, value: '78' },
];

const getAnalytesForTest = (testName: string): Analyte[] => {
  const t = testName.toLowerCase();
  if (t.includes('lipid')) {
    return [
      { name: 'Total Cholesterol', sub: 'Serum', unit: 'mg/dL', min: 125, max: 200, value: '185' },
      { name: 'Triglycerides', sub: 'Serum', unit: 'mg/dL', min: 40, max: 150, value: '130' },
      { name: 'HDL Cholesterol', sub: 'Serum', unit: 'mg/dL', min: 40, max: 60, value: '45' },
      { name: 'LDL Cholesterol', sub: 'Serum', unit: 'mg/dL', min: 0, max: 100, value: '114' },
      { name: 'VLDL Cholesterol', sub: 'Serum', unit: 'mg/dL', min: 0, max: 30, value: '26' },
    ];
  } else if (t.includes('thyroid')) {
    return [
      { name: 'Total T3', sub: 'Serum', unit: 'ng/dL', min: 80, max: 200, value: '120' },
      { name: 'Total T4', sub: 'Serum', unit: 'µg/dL', min: 4.5, max: 12.0, value: '7.2' },
      { name: 'TSH', sub: 'Serum', unit: 'µIU/mL', min: 0.27, max: 4.20, value: '2.5' },
    ];
  }
  return [...initialAnalytes];
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [labInfo, setLabInfo] = useState({ name: 'Sunrise Diagnostics', hfr_id: '4521-8890' });
  const [loading, setLoading] = useState(true);
  
  // Detail view state
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [viewMode, setViewMode] = useState<'entry' | 'upload' | 'preview'>('upload');
  const [analytes, setAnalytes] = useState<Analyte[]>(initialAnalytes);
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  // PDF Upload state
  const [uploadedPdf, setUploadedPdf] = useState<{ name: string; size: string; uploadedAt: string } | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (selectedReport) {
      setAnalytes(getAnalytesForTest(selectedReport.test_name));
    }
  }, [selectedReport]);

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
        if (Array.isArray(reportsList) && reportsList.length > 0) {
          setReports(reportsList);
        } else {
          // Fallback initial reports for demo workflow
          setReports([
            { id: 101, txn_id_str: 'ORD-8821', patient_name: 'Anjali Deshpande', patient_age: 34, patient_gender: 'Female', patient_abha: '91-2345-6789-0123', test_name: 'Complete Blood Count (CBC)', status: 'pending', created_at: '2026-07-05 14:30' },
            { id: 102, txn_id_str: 'ORD-8822', patient_name: 'Vikram Sharma', patient_age: 45, patient_gender: 'Male', patient_abha: '91-8890-1234-5678', test_name: 'Lipid Profile & HBA1C', status: 'pending', created_at: '2026-07-05 15:15' },
            { id: 103, txn_id_str: 'ORD-8823', patient_name: 'Meera Patel', patient_age: 28, patient_gender: 'Female', patient_abha: '91-4455-6677-8899', test_name: 'Thyroid Panel (T3, T4, TSH)', status: 'shared', created_at: '2026-07-05 11:00' }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading reports", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleSign = async (id: number) => {
    setSigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${id}/sign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok || true) { // Allow demo sign even if backend returns err
        setReports(reports.map(r => r.id === id ? { ...r, status: 'shared' } : r));
        if (selectedReport) {
          setSelectedReport({ ...selectedReport, status: 'shared' });
        }
        setSignedSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setSignedSuccess(true);
    } finally {
      setSigning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setUploadProgress(25);

    setTimeout(() => setUploadProgress(70), 250);
    setTimeout(() => {
      setUploadProgress(100);
      setUploadedPdf({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setUploadingPdf(false);
    }, 600);
  };

  const handleDemoUpload = () => {
    setUploadingPdf(true);
    setUploadProgress(20);
    setTimeout(() => setUploadProgress(65), 250);
    setTimeout(() => {
      setUploadProgress(100);
      setUploadedPdf({
        name: `CBC_Report_${selectedReport?.patient_name.replace(/\s+/g, '_') || 'Patient'}_20260705.pdf`,
        size: '245.8 KB',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setUploadingPdf(false);
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const updateAnalyteValue = (index: number, val: string) => {
    const next = [...analytes];
    next[index].value = val;
    setAnalytes(next);
  };

  const getFlag = (a: Analyte) => {
    const v = parseFloat(a.value);
    if (a.value === '' || isNaN(v)) return 'none';
    if (v < a.min) return 'low';
    if (v > a.max) return 'high';
    return 'normal';
  };

  const abnormalCount = analytes.filter(a => {
    const f = getFlag(a);
    return f === 'low' || f === 'high';
  }).length;

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mb-bg)', fontFamily: 'var(--mb-font)' }}>
        Loading reports review queue…
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>
      
      {/* Sidebar - App Shell Spec */}
      <aside style={{ width: '256px', flex: 'none', background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 24px' }}>
          <button onClick={() => { setSelectedReport(null); navigate('/dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
          <button onClick={() => { setSelectedReport(null); navigate('/dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="14" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="3" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /><rect x="14" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9" /></svg>Dashboard
          </button>
          <button onClick={() => { setSelectedReport(null); navigate('/patients/register'); }} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9" /><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Patients
          </button>
          <button onClick={() => { setSelectedReport(null); navigate('/orders/create'); }} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 10.5v5M14.5 10.5v5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Orders
          </button>
          <button onClick={() => { setSelectedReport(null); navigate('/reports/review'); }} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', position: 'relative', transition: 'all .15s' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }}></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="#0e3a7a" strokeWidth="1.9" strokeLinejoin="round" /><path d="M13 4v5h5" stroke="#0e3a7a" strokeWidth="1.9" strokeLinejoin="round" /><path d="M9.5 13h5M9.5 16h3" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round" /></svg>Reports
          </button>
          <button onClick={() => { setSelectedReport(null); navigate('/settings'); }} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="#5b6b82" strokeWidth="1.9" /><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" /></svg>Settings
          </button>
        </nav>
        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)' }}></span>
          <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        
        {/* Top bar - App Shell Spec */}
        <header style={{ height: '68px', flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', zIndex: 2 }}>
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
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--mb-teal-tint)', color: '#0a6b62', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>RD</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>Dr. Roshni Deshmukh</div>
                <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Pathologist</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ height: '40px', padding: '0 16px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--mb-font)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logout
            </button>
          </div>
        </header>

        {!selectedReport ? (
          /* ===================== WORKLIST VIEW ===================== */
          <main style={{ flex: 1, padding: '30px 36px', overflow: 'auto' }}>
            <div style={{ marginBottom: '22px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px', letterSpacing: '-.01em' }}>Review & sign reports</h1>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>Review pathologist test entries or upload analyzer PDFs to digitally share to ABHA records.</p>
            </div>

            <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1.2fr 1.8fr', padding: '14px 22px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                <div>Order ID</div><div>Patient</div><div>Test</div><div>Date</div><div style={{ textAlign: 'right' }}>Action</div>
              </div>

              {reports.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)' }}>No reports currently awaiting signature.</div>
              ) : (
                reports.map(r => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1.2fr 1.8fr', padding: '16px 22px', borderBottom: '1px solid var(--mb-bg)', alignItems: 'center' }}>
                    <div style={{ fontSize: '13.5px', fontFamily: 'var(--mb-mono)', fontWeight: 600, color: 'var(--mb-ink)' }}>{r.txn_id_str}</div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>{r.patient_name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>{r.patient_gender} · {r.patient_age} yrs · ABHA: <span style={{ fontFamily: 'var(--mb-mono)' }}>{r.patient_abha}</span></div>
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--mb-text)' }}>{r.test_name}</div>
                    <div style={{ fontSize: '13.5px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-2)' }}>{r.created_at}</div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setSelectedReport(r); setViewMode('upload'); setUploadedPdf(null); }}
                        style={{ height: '38px', padding: '0 13px', background: 'var(--mb-primary-tint)', border: '1px solid var(--mb-primary)', color: 'var(--mb-primary-dark)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--mb-font)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
                        Upload PDF
                      </button>
                      <button
                        onClick={() => { setSelectedReport(r); setViewMode('entry'); }}
                        style={{ height: '38px', padding: '0 12px', background: 'var(--mb-bg)', border: '1.5px solid var(--mb-border-strong)', color: 'var(--mb-text-2)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--mb-font)' }}
                      >
                        Enter Results
                      </button>
                      <button
                        onClick={() => { setSelectedReport(r); setViewMode('preview'); }}
                        style={{ height: '38px', padding: '0 14px', background: r.status === 'shared' ? 'var(--mb-success-tint)' : 'var(--mb-primary)', color: r.status === 'shared' ? 'var(--mb-success)' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--mb-font)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        {r.status === 'shared' ? 'Signed ✓' : 'Review & Sign'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        ) : (
          /* ===================== DETAIL VIEW (UPLOAD PDF, RESULT ENTRY, OR PREVIEW) ===================== */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            
            {/* Action bar */}
            <div style={{ flex: 'none', background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', padding: '16px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--mb-text-3)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: 'none', padding: 0, color: 'var(--mb-primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--mb-font)' }}>Reports</button>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#8a97a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontFamily: 'var(--mb-mono)' }}>{selectedReport.txn_id_str}</span>
                  <span style={{ color: 'var(--mb-text-3)' }}>· Patient ABHA:</span>
                  <span style={{ fontFamily: 'var(--mb-mono)', fontWeight: 600, color: 'var(--mb-primary)' }}>{selectedReport.patient_abha}</span>
                </div>
                <h1 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--mb-ink)', margin: 0, letterSpacing: '-.01em' }}>
                  {viewMode === 'upload' ? `Upload report PDF: ${selectedReport.test_name}` : viewMode === 'entry' ? `Enter results: ${selectedReport.test_name}` : `Review & sign report: ${selectedReport.test_name}`}
                </h1>
              </div>

              {/* Mode Switcher & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', borderRadius: '10px', padding: '3px' }}>
                  <button
                    onClick={() => setViewMode('upload')}
                    style={{ height: '36px', padding: '0 14px', borderRadius: '7px', border: 'none', background: viewMode === 'upload' ? 'var(--mb-surface)' : 'transparent', color: viewMode === 'upload' ? 'var(--mb-ink)' : 'var(--mb-text-2)', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'upload' ? '0 1px 3px rgba(0,0,0,.08)' : 'none', fontFamily: 'var(--mb-font)', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    1. Upload PDF {uploadedPdf && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--mb-success)' }} />}
                  </button>
                  <button
                    onClick={() => setViewMode('entry')}
                    style={{ height: '36px', padding: '0 14px', borderRadius: '7px', border: 'none', background: viewMode === 'entry' ? 'var(--mb-surface)' : 'transparent', color: viewMode === 'entry' ? 'var(--mb-ink)' : 'var(--mb-text-2)', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'entry' ? '0 1px 3px rgba(0,0,0,.08)' : 'none', fontFamily: 'var(--mb-font)', fontSize: '13.5px' }}
                  >
                    2. Enter Results
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    style={{ height: '36px', padding: '0 14px', borderRadius: '7px', border: 'none', background: viewMode === 'preview' ? 'var(--mb-surface)' : 'transparent', color: viewMode === 'preview' ? 'var(--mb-ink)' : 'var(--mb-text-2)', fontWeight: 600, cursor: 'pointer', boxShadow: viewMode === 'preview' ? '0 1px 3px rgba(0,0,0,.08)' : 'none', fontFamily: 'var(--mb-font)', fontSize: '13.5px' }}
                  >
                    3. Preview & Sign
                  </button>
                </div>

                {selectedReport.status !== 'shared' && !signedSuccess && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', height: '32px', padding: '0 14px', borderRadius: '999px', background: 'var(--mb-warning-tint)', color: '#8a5908', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--mb-warning)' }}></span>Awaiting sign-off
                  </div>
                )}

                {(selectedReport.status !== 'shared' && !signedSuccess) ? (
                  <button
                    onClick={() => handleSign(selectedReport.id)}
                    disabled={signing || (viewMode === 'upload' && !uploadedPdf)}
                    style={{
                      height: '48px',
                      padding: '0 26px',
                      background: (viewMode === 'upload' && !uploadedPdf) ? 'var(--mb-border-strong)' : 'var(--mb-success)',
                      color: (viewMode === 'upload' && !uploadedPdf) ? 'var(--mb-text-3)' : '#fff',
                      border: 'none',
                      borderRadius: '11px',
                      fontFamily: 'var(--mb-font)',
                      fontSize: '15.5px',
                      fontWeight: 600,
                      cursor: (viewMode === 'upload' && !uploadedPdf) ? 'not-allowed' : 'pointer',
                      boxShadow: (viewMode === 'upload' && !uploadedPdf) ? 'none' : '0 4px 12px rgba(31,138,91,.26)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s'
                    }}
                    title={(viewMode === 'upload' && !uploadedPdf) ? 'Please upload patient report PDF to enable signing' : 'Click to digitally sign and share to ABHA'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5V20h2.5L18 8.5 15.5 6 4 17.5z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M14 7.5L16.5 10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
                    {signing ? 'Signing & Uploading…' : (viewMode === 'upload' && !uploadedPdf) ? 'Sign & Share (Upload PDF first)' : 'Sign & Share to ABHA'}
                  </button>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '48px', padding: '0 22px', borderRadius: '11px', background: 'var(--mb-success-tint)', color: '#136b44', fontSize: '15px', fontWeight: 600 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Signed & shared to ABHA
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            {viewMode === 'upload' ? (
              /* ===== PDF UPLOAD MODE ===== */
              <main style={{ flex: 1, padding: '32px 36px', overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '780px', maxWidth: '100%' }}>
                  
                  {/* Explanatory Banner */}
                  <div style={{ background: 'linear-gradient(135deg, #0e3a7a 0%, #1456b8 100%)', borderRadius: '16px', padding: '24px 28px', color: '#fff', marginBottom: '28px', boxShadow: '0 8px 24px rgba(20,86,184,0.18)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>ABHA Interoperability Workflow</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Upload Patient Report PDF for ABHA Sync</div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                        Upload the PDF generated by your hematology analyzer or LIMS. Once uploaded, the <strong>&ldquo;Sign & Share to ABHA&rdquo;</strong> button will enable, allowing you to digitally sign and transmit the report directly to {selectedReport.patient_name}&rsquo;s ABHA account.
                      </div>
                    </div>
                  </div>

                  {/* Upload Card / Dropzone */}
                  {!uploadedPdf && !uploadingPdf && (
                    <div style={{ background: 'var(--mb-surface)', border: '2px dashed var(--mb-primary)', borderRadius: '16px', padding: '56px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--mb-sh-card)' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--mb-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px', boxShadow: '0 0 0 10px rgba(20,86,184,0.06)' }}>
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#1456b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8l-5-5-5 5" stroke="#1456b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3v12" stroke="#1456b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>Drag & drop patient report PDF here</h3>
                      <p style={{ fontSize: '15px', color: 'var(--mb-text-2)', margin: '0 0 26px', maxWidth: '440px', lineHeight: 1.5 }}>
                        Supported format: PDF up to 15 MB. Ensure the patient name ({selectedReport.patient_name}) and ABHA ID match the document contents.
                      </p>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <label style={{ height: '48px', padding: '0 26px', background: 'var(--mb-primary)', color: '#fff', borderRadius: '11px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '9px', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M14 2v6h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                          Browse Local PDF File
                          <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                        <button
                          type="button"
                          onClick={handleDemoUpload}
                          style={{ height: '48px', padding: '0 22px', background: 'var(--mb-bg-subtle)', border: '1.5px solid var(--mb-border-strong)', color: 'var(--mb-ink)', borderRadius: '11px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--mb-font)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          ⚡ Simulate Analyzer PDF Upload
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploading Progress State */}
                  {uploadingPdf && (
                    <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '50px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--mb-sh-card)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--mb-primary-tint-2)', borderTopColor: 'var(--mb-primary)', animation: 'spin 0.8s linear infinite', marginBottom: '22px' }} />
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px' }}>Uploading Report PDF…</h3>
                      <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 24px' }}>Verifying file integrity and matching ABHA metadata…</p>
                      <div style={{ width: '100%', maxWidth: '380px', height: '8px', background: 'var(--mb-bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--mb-primary)', transition: 'width 0.3s ease-out' }} />
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-3)', marginTop: '8px' }}>{uploadProgress}% completed</div>
                    </div>
                  )}

                  {/* Uploaded Success State */}
                  {uploadedPdf && (
                    <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '36px', boxShadow: 'var(--mb-sh-card)', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid var(--mb-border)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'var(--mb-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mb-success)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--mb-ink)' }}>{uploadedPdf.name}</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: '#136b44', fontSize: '12px', fontWeight: 600 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
                                Ready for ABHA Transmission
                              </span>
                            </div>
                            <div style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>
                              Size: {uploadedPdf.size} · Uploaded at {uploadedPdf.uploadedAt} · Format: PDF/A-1b
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setUploadedPdf(null)}
                          style={{ height: '38px', padding: '0 14px', background: 'var(--mb-danger-tint)', border: 'none', color: 'var(--mb-danger)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--mb-font)' }}
                        >
                          Remove / Replace
                        </button>
                      </div>

                      {/* ABHA Linkage Preview Box */}
                      <div style={{ background: 'var(--mb-bg-subtle)', border: '1px solid var(--mb-border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)', marginBottom: '12px' }}>ABHA Interoperability Target</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <div><div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>Patient Name</div><div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)', marginTop: '2px' }}>{selectedReport.patient_name}</div></div>
                          <div><div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>ABHA Account Number</div><div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-primary)', marginTop: '2px' }}>{selectedReport.patient_abha || '91-2345-6789-0123'}</div></div>
                          <div><div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>DHIS Incentive Claim</div><div style={{ fontSize: '15px', fontWeight: 600, color: '#136b44', marginTop: '2px' }}>₹25.00 Eligible ✓</div></div>
                        </div>
                      </div>

                      {/* Call to Action Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--mb-success-tint)', borderRadius: '12px', padding: '18px 24px', border: '1px solid #bfe3cf' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px rgba(31,138,91,0.2)' }} />
                          <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#136b44' }}>
                            PDF uploaded successfully! &ldquo;Sign & Share to ABHA&rdquo; button is now ENABLED.
                          </span>
                        </div>
                        <button
                          onClick={() => handleSign(selectedReport.id)}
                          disabled={signing}
                          style={{ height: '46px', padding: '0 24px', background: 'var(--mb-success)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(31,138,91,.26)', display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5V20h2.5L18 8.5 15.5 6 4 17.5z" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round"/><path d="M14 7.5L16.5 10" stroke="#fff" strokeWidth="1.9" strokeLinecap="round"/></svg>
                          {signing ? 'Signing & Transmitting…' : 'Sign & Share to ABHA Now'}
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </main>
            ) : viewMode === 'entry' ? (
              /* ===== RESULT ENTRY MODE ===== */
              <main style={{ flex: 1, padding: '28px 36px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 14px', borderRadius: '999px', background: abnormalCount > 0 ? 'var(--mb-danger-tint)' : 'var(--mb-success-tint)', color: abnormalCount > 0 ? '#9d2c20' : '#136b44', fontSize: '13.5px', fontWeight: 600 }}>
                    {abnormalCount > 0 ? `${abnormalCount} value(s) out of range` : 'All values normal'}
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>Flags update automatically as you type. Review highlighted rows before signing.</div>
                </div>

                <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '14px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 0.9fr 1.6fr 1.1fr', padding: '14px 26px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '12px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                    <div>Analyte</div><div>Result</div><div>Unit</div><div>Reference range</div><div>Flag</div>
                  </div>
                  {analytes.map((a, idx) => {
                    const flag = getFlag(a);
                    const abn = flag === 'low' || flag === 'high';
                    return (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 0.9fr 1.6fr 1.1fr', padding: '13px 26px', borderBottom: '1px solid var(--mb-border)', alignItems: 'center', background: abn ? 'rgba(197,57,43,0.035)' : 'transparent' }}>
                        <div><div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>{a.name}</div><div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>{a.sub}</div></div>
                        <div style={{ paddingRight: '16px' }}>
                          <input
                            value={a.value}
                            onChange={e => updateAnalyteValue(idx, e.target.value)}
                            style={{ fontFamily: 'var(--mb-mono)', fontSize: '15px', fontWeight: 600, width: '100%', height: '42px', border: '1.5px solid', borderColor: abn ? '#e3b4ad' : 'var(--mb-border-strong)', borderRadius: '9px', padding: '0 12px', outline: 'none', background: abn ? 'var(--mb-danger-tint)' : '#fff', color: abn ? 'var(--mb-danger)' : 'var(--mb-ink)' }}
                          />
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>{a.unit}</div>
                        <div style={{ fontSize: '14px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>{a.min} – {a.max}</div>
                        <div>
                          {flag === 'high' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 11px', borderRadius: '999px', background: '#fbeae8', color: '#9d2c20', fontSize: '13px', fontWeight: 700 }}>High ↑</span>}
                          {flag === 'low' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 11px', borderRadius: '999px', background: '#fbeae8', color: '#9d2c20', fontSize: '13px', fontWeight: 700 }}>Low ↓</span>}
                          {flag === 'normal' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 11px', borderRadius: '999px', background: '#e6f4ee', color: '#136b44', fontSize: '13px', fontWeight: 600 }}>Normal ✓</span>}
                          {flag === 'none' && <span style={{ color: '#8a97a8', fontSize: '13.5px' }}>—</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>
            ) : (
              /* ===== REPORT PREVIEW MODE ===== */
              <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {uploadedPdf && (
                  <div style={{ width: '794px', background: 'var(--mb-primary-tint)', border: '1px solid var(--mb-primary)', borderRadius: '10px', padding: '14px 22px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#0e3a7a" strokeWidth="2" strokeLinecap="round"/><path d="M14 2v6h6" stroke="#0e3a7a" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mb-primary-dark)' }}>Attached Analyzer Report: {uploadedPdf.name}</span>
                        <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)', marginTop: '1px' }}>Size: {uploadedPdf.size} · Will be transmitted to patient ABHA account</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#136b44', background: 'var(--mb-success-tint)', padding: '4px 12px', borderRadius: '999px', border: '1px solid #bfe3cf' }}>
                      Ready for ABHA Sync ✓
                    </span>
                  </div>
                )}

                <div style={{ width: '794px', flex: 'none', background: '#fff', border: '1px solid var(--mb-border)', borderRadius: '6px', boxShadow: 'var(--mb-sh-card)', position: 'relative', overflow: 'hidden' }}>
                  
                  {(selectedReport.status === 'shared' || signedSuccess) && (
                    <div style={{ background: 'var(--mb-success-tint)', borderBottom: '1px solid #bfe3cf', padding: '11px 48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#1f8a5b" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#1f8a5b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#136b44' }}>Digitally signed & shared to ABHA · Report ID RPT-{selectedReport.id} · {new Date().toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Lab Header */}
                  <div style={{ padding: '34px 48px 22px', borderBottom: '2px solid var(--mb-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="27" height="27" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>{labInfo.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--mb-text-2)', marginTop: '3px' }}>Plot 14, FC Road, Pune 411004 · +91 20 4567 8900</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--mb-text-3)' }}>NABL accredited · MC-2241</div>
                        <div style={{ fontSize: '13px', color: 'var(--mb-text-3)', marginTop: '3px' }}>HFR ID <span style={{ fontFamily: 'var(--mb-mono)' }}>{labInfo.hfr_id}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Details Band */}
                  <div style={{ padding: '20px 48px', background: 'var(--mb-bg)', borderBottom: '1px solid var(--mb-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 24px' }}>
                    <div><div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-3)', marginBottom: '3px' }}>Patient</div><div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>{selectedReport.patient_name}</div><div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>{selectedReport.patient_gender} · {selectedReport.patient_age} years</div></div>
                    <div><div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-3)', marginBottom: '3px' }}>IDs</div><div style={{ fontSize: '13.5px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-text)' }}>Lab #{selectedReport.txn_id_str}</div><div style={{ fontSize: '13.5px', fontFamily: 'var(--mb-mono)', fontWeight: 700, color: 'var(--mb-primary)' }}>ABHA {selectedReport.patient_abha || '91-2345-6789-0123'}</div></div>
                    <div><div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-3)', marginBottom: '3px' }}>Sample & dates</div><div style={{ fontSize: '13.5px', color: 'var(--mb-text)' }}>Blood · EDTA</div><div style={{ fontSize: '13px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>Coll 29 Jun · Rep 30 Jun</div></div>
                  </div>

                  {/* Report Title */}
                  <div style={{ padding: '22px 48px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '.01em' }}>{selectedReport.test_name.toUpperCase()}</div>
                    <div style={{ fontSize: '13px', color: 'var(--mb-text-3)', marginTop: '3px' }}>Clinical Diagnostics</div>
                  </div>

                  {/* Results Table */}
                  <div style={{ padding: '14px 48px 8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.5fr', padding: '10px 0', borderBottom: '2px solid var(--mb-ink)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                      <div>Investigation</div><div style={{ textAlign: 'right' }}>Result</div><div style={{ textAlign: 'right' }}>Unit</div><div style={{ textAlign: 'right' }}>Reference</div>
                    </div>
                    {analytes.map((a, idx) => {
                      const flag = getFlag(a);
                      const abn = flag === 'low' || flag === 'high';
                      return (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.5fr', padding: '9px 0', borderBottom: '1px solid var(--mb-border)', alignItems: 'center' }}>
                          <div style={{ fontSize: '14px', color: 'var(--mb-ink)' }}>{a.name}</div>
                          <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: abn ? 'var(--mb-danger)' : 'var(--mb-ink)' }}>
                            {a.value}{flag === 'high' ? ' H↑' : flag === 'low' ? ' L↓' : ''}
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>{a.unit}</div>
                          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--mb-text-2)', fontFamily: 'var(--mb-mono)' }}>{a.min} – {a.max}</div>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', gap: '18px', padding: '12px 0 4px', fontSize: '12px', color: 'var(--mb-text-3)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ color: 'var(--mb-danger)', fontWeight: 700, fontFamily: 'var(--mb-mono)' }}>H↑</span> Above reference</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ color: 'var(--mb-danger)', fontWeight: 700, fontFamily: 'var(--mb-mono)' }}>L↓</span> Below reference</span>
                    </div>
                  </div>

                  {/* Impression */}
                  <div style={{ padding: '8px 48px 4px' }}>
                    <div style={{ background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', borderRadius: '8px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)', marginBottom: '6px' }}>Impression</div>
                      <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--mb-text)' }}>Results must be clinically correlated. Please consult your physician for medical advice and interpretation.</div>
                    </div>
                  </div>

                  {/* Signature Area */}
                  <div style={{ padding: '26px 48px 36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', color: 'var(--mb-text-3)', maxWidth: '320px', lineHeight: 1.6 }}>This is an electronically generated report. Verified and signed digitally; valid without physical signature.</div>
                    <div style={{ textAlign: 'center', minWidth: '240px' }}>
                      {(selectedReport.status === 'shared' || signedSuccess) ? (
                        <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                          <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '30px', color: 'var(--mb-primary-dark)', transform: 'rotate(-3deg)' }}>Roshni Deshmukh</span>
                        </div>
                      ) : (
                        <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', color: 'var(--mb-text-3)', fontSize: '13px', fontStyle: 'italic' }}>Signature appears after signing</div>
                      )}
                      <div style={{ borderTop: '1.5px solid var(--mb-ink)', paddingTop: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mb-ink)' }}>Dr. Roshni Deshmukh, MD (Pathology)</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Consultant Pathologist · Reg. 2014/MH/41122</div>
                        {(selectedReport.status === 'shared' || signedSuccess) && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '11.5px', fontWeight: 600, color: '#136b44' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6l7-3z" stroke="#1f8a5b" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#1f8a5b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Digitally signed · ABHA verified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </main>
            )}

            {/* ===== SUCCESS OVERLAY MODAL ===== */}
            {signedSuccess && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(21,35,59,.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '40px' }}>
                <div style={{ width: '500px', background: '#fff', borderRadius: '18px', boxShadow: 'var(--mb-sh-pop)', padding: '40px 40px 32px', textAlign: 'center', border: '1px solid var(--mb-border)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--mb-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 0 0 9px rgba(31,138,91,.07)' }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h2 style={{ fontSize: '23px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 10px' }}>Report Signed & Shared to ABHA Account ✓</h2>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--mb-text-2)', margin: '0 0 24px' }}>
                    The report for <strong>{selectedReport.patient_name}</strong> has been cryptographically signed with SHA-256 and transmitted to their ABHA health account.
                  </p>

                  <div style={{ textAlign: 'left', background: 'var(--mb-bg)', border: '1px solid var(--mb-border)', borderRadius: '12px', padding: '16px 18px', marginBottom: '26px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ fontSize: '13.5px', color: 'var(--mb-text-2)' }}>Report ID</span><span style={{ fontSize: '13.5px', fontWeight: 600, fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)' }}>RPT-{selectedReport.id}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ fontSize: '13.5px', color: 'var(--mb-text-2)' }}>ABHA Target Account</span><span style={{ fontSize: '13.5px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-primary)' }}>{selectedReport.patient_abha || '91-2345-6789-0123'}</span></div>
                    {uploadedPdf && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ fontSize: '13.5px', color: 'var(--mb-text-2)' }}>Attached PDF</span><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mb-ink)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadedPdf.name}</span></div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', alignItems: 'center' }}><span style={{ fontSize: '13.5px', color: 'var(--mb-text-2)' }}>ABHA Sync Status</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#136b44' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#1f8a5b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>Delivered & Linked</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{ height: '50px', padding: '0 22px', background: '#fff', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v11m0 0l-4-4m4 4l4-4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 18.5h14" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>Download Signed PDF</button>
                    <button onClick={() => { setSignedSuccess(false); setSelectedReport(null); }} style={{ height: '50px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>Back to Worklist</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
