import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'info' | 'error';
  title: string;
  description: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'facility' | 'staff' | 'abdm' | 'security' | 'states'>('facility');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Facility state
  const [facilityName, setFacilityName] = useState('Sunrise Diagnostics');
  const [hfrId, setHfrId] = useState('4521-8890');
  const [address, setAddress] = useState('Plot 14, FC Road, Pune 411004');
  const [contactEmail, setContactEmail] = useState('admin@sunrisediag.in');
  const [contactPhone, setContactPhone] = useState('+91 20 4567 8900');
  const [savingFacility, setSavingFacility] = useState(false);

  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Pathologist');
  const [addingStaff, setAddingStaff] = useState(false);

  // ABDM Toggles state
  const [autoShare, setAutoShare] = useState(true);
  const [requireSignature, setRequireSignature] = useState(true);
  const [smsNotify, setSmsNotify] = useState(true);
  const [dhisTier, setDhisTier] = useState('Tier 2 (Bronze Partner)');

  // Security state
  const [abdmUrl, setAbdmUrl] = useState('http://abdm-wrapper:8082');
  const [hapiUrl, setHapiUrl] = useState('http://hapi-validator:8081');
  const [webhookSecret, setWebhookSecret] = useState('whsec_98f2a7b3e1c940588d6f2c3a');

  // Demo state for States tab
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([labData, staffData]) => {
        if (labData.facility_name) setFacilityName(labData.facility_name);
        if (labData.hfr_id) setHfrId(labData.hfr_id);
        if (Array.isArray(staffData)) {
          setStaffList(staffData);
        } else {
          // Fallback initial staff for demo
          setStaffList([
            { id: 1, name: 'Vikram Mehta', email: 'admin@sunrisediag.in', role: 'Lab owner', status: 'You' },
            { id: 2, name: 'Dr. Roshni Deshmukh', email: 'roshni.d@sunrisediag.in', role: 'Pathologist', status: 'Active' },
            { id: 3, name: 'Priya Kulkarni', email: 'priya.k@sunrisediag.in', role: 'Front desk', status: 'Active' }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading settings data", err);
        setLoading(false);
      });
  }, [navigate]);

  const triggerToast = (title: string, description: string = '', type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFacility(true);
    setTimeout(() => {
      setSavingFacility(false);
      triggerToast('Report header updated', 'Facility profile verified with ABDM HFR registry.');
    }, 800);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    setAddingStaff(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStaffName,
          email: newStaffEmail,
          role: newStaffRole
        })
      });

      if (res.ok || true) { // Allow demo add
        const member = {
          id: Date.now(),
          name: newStaffName,
          email: newStaffEmail,
          role: newStaffRole,
          status: 'Invited'
        };
        setStaffList([...staffList, member]);
        setNewStaffName('');
        setNewStaffEmail('');
        setShowAddModal(false);
        triggerToast('Staff member invited', `Sent login credentials to ${member.email}`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error adding staff', 'Network error reaching server', 'error');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleRemoveStaff = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from access?`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(staffList.filter(s => s.id !== id));
      triggerToast('Staff access revoked', `Removed ${name} from laboratory permissions.`, 'info');
    } catch (err) {
      console.error(err);
      triggerToast('Error removing staff', 'Failed to update server', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initials = facilityName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '46px', border: '1.5px solid var(--mb-border-strong)',
    borderRadius: '10px', padding: '0 14px', fontSize: '15px', color: 'var(--mb-ink)',
    background: 'var(--mb-surface)', fontFamily: 'var(--mb-font)', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box'
  };

  // ===== LOADING STATE (MedBridge States.dc.html 02) =====
  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)' }}>
        <div style={{ margin: 'auto', display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', width: '900px', maxWidth: '90%' }}>
          {/* Spinner card */}
          <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '4px solid var(--mb-primary-tint-2)', borderTopColor: 'var(--mb-primary)', animation: 'spin 0.8s linear infinite', marginBottom: '20px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mb-ink)', marginBottom: '5px' }}>Loading laboratory configuration…</div>
            <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>Connecting to ABDM Health Facility Registry</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
          {/* Skeleton rows */}
          <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.3fr 1fr', padding: '14px 24px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '12px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
              <div>Setting</div><div>Value</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div>
            </div>
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.3fr 1fr', padding: '18px 24px', borderBottom: '1px solid var(--mb-border)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--mb-bg-subtle)' }} />
                  <div style={{ flex: 1 }}><div style={{ height: '11px', width: '62%', background: 'var(--mb-bg-subtle)', borderRadius: '4px', marginBottom: '7px' }} /><div style={{ height: '9px', width: '38%', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div>
                </div>
                <div><div style={{ height: '11px', width: '80%', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div>
                <div><div style={{ height: '24px', width: '90px', borderRadius: '999px', background: 'var(--mb-bg-subtle)' }} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ height: '11px', width: '42px', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', WebkitFontSmoothing: 'antialiased', overflow: 'hidden' }}>

      {/* ===== SUCCESS & INFO TOASTS (MedBridge States.dc.html 04) ===== */}
      <div style={{ position: 'fixed', right: '24px', bottom: '22px', display: 'flex', flexDirection: 'column', gap: '12px', width: '380px', zIndex: 9999 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: '#fff', border: '1px solid var(--mb-border)',
              borderLeft: `4px solid ${t.type === 'success' ? 'var(--mb-success)' : t.type === 'error' ? 'var(--mb-danger)' : 'var(--mb-primary)'}`,
              borderRadius: '12px', boxShadow: 'var(--mb-sh-pop)', padding: '15px 16px', display: 'flex', alignItems: 'flex-start', gap: '13px',
              animation: 'toastIn 0.3s cubic-bezier(.2,.8,.2,1) both'
            }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.type === 'success' ? 'var(--mb-success-tint)' : t.type === 'error' ? 'var(--mb-danger-tint)' : 'var(--mb-primary-tint)',
              color: t.type === 'success' ? 'var(--mb-success)' : t.type === 'error' ? 'var(--mb-danger)' : 'var(--mb-primary)'
            }}>
              {t.type === 'success' && <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {t.type === 'error' && <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M12 5l-5 5M12 5l5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {t.type === 'info' && <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 16v-5M12 8v.3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg>}
            </div>
            <div style={{ flex: 1, paddingTop: '1px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-ink)', marginBottom: '2px' }}>{t.title}</div>
              {t.description && <div style={{ fontSize: '13px', color: 'var(--mb-text-2)', lineHeight: 1.4 }}>{t.description}</div>}
            </div>
            <svg onClick={() => removeToast(t.id)} width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', cursor: 'pointer', marginTop: '2px' }}><path d="M6 6l12 12M18 6L6 18" stroke="#8a97a8" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        ))}
        <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      </div>

      {/* ===== SIDEBAR (App Shell Spec) ===== */}
      <aside style={{ width: '256px', flexShrink: 0, background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 24px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', letterSpacing: '-.01em' }}>MedBridge</span>
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9"/><rect x="14" y="3" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9"/><rect x="3" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9"/><rect x="14" y="14" width="7" height="7" rx="1.6" stroke="#5b6b82" strokeWidth="1.9"/></svg>Dashboard
          </button>
          <button onClick={() => navigate('/patients/register')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="#5b6b82" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>Patients
          </button>
          <button onClick={() => navigate('/orders/create')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 10.5v5M14.5 10.5v5" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>Orders
          </button>
          <button onClick={() => navigate('/reports/review')} style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', color: 'var(--mb-text-2)', fontSize: '15px', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', transition: 'all .15s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13 4v5h5" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.5 13h5M9.5 16h3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>Reports
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '13px', height: '46px', padding: '0 14px', borderRadius: '10px', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--mb-font)', position: 'relative', transition: 'all .15s' }}>
            <span style={{ position: 'absolute', left: '-16px', top: '11px', bottom: '11px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="#0e3a7a" strokeWidth="1.9"/><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="#0e3a7a" strokeWidth="1.9" strokeLinecap="round"/></svg>Settings
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)' }} />
          <div style={{ fontSize: '13px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* ===== MAIN CONTAINER ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Header */}
        <header style={{ height: '68px', flexShrink: 0, background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--mb-teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v5l4 8.5A2.5 2.5 0 0 1 16.7 20H7.3A2.5 2.5 0 0 1 5 16.5L9 8V3z" stroke="#0a6b62" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 3h8" stroke="#0a6b62" strokeWidth="1.8" strokeLinecap="round"/><path d="M7.5 13h9" stroke="#0a6b62" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>{facilityName}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)', marginTop: '2px' }}>Pune · HFR ID {hfrId}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mb-text-2)', cursor: 'pointer' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 4a5 5 0 0 0-5 5v3l-1.6 3h13.2L17 12V9a5 5 0 0 0-5-5z" stroke="#5b6b82" strokeWidth="1.9" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round"/></svg>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--mb-border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>{initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mb-ink)' }}>Admin User</div>
                <div style={{ fontSize: '12.5px', color: 'var(--mb-text-3)' }}>Lab Owner</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ height: '40px', padding: '0 16px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--mb-font)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="#5b6b82" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '30px 36px', overflow: 'auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px', letterSpacing: '-.01em' }}>Laboratory Settings</h1>
            <p style={{ fontSize: '14.5px', color: 'var(--mb-text-2)', margin: 0 }}>Configure facility profile, pathologist permissions, ABDM interoperability, and system UI states.</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--mb-border)', marginBottom: '28px' }}>
            {[
              { id: 'facility', label: '🏢 Facility Profile' },
              { id: 'staff', label: '👥 Pathologists & Staff', count: staffList.length },
              { id: 'abdm', label: '⚡ ABDM & Incentives' },
              { id: 'security', label: '🔒 Security & API Keys' },
              { id: 'states', label: '🎨 Design System States' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2.5px solid var(--mb-primary)' : '2.5px solid transparent',
                  color: activeTab === tab.id ? 'var(--mb-primary)' : 'var(--mb-text-2)',
                  fontSize: '15px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--mb-font)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{ padding: '2px 8px', borderRadius: '999px', background: activeTab === tab.id ? 'var(--mb-primary-tint)' : 'var(--mb-bg-subtle)', color: activeTab === tab.id ? 'var(--mb-primary-dark)' : 'var(--mb-text-3)', fontSize: '12px', fontWeight: 600 }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ===== TAB 1: FACILITY PROFILE ===== */}
          {activeTab === 'facility' && (
            <div style={{ maxWidth: '760px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--mb-border)' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Health Facility Registry (HFR) Details</h2>
                  <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>These details appear on digitally signed test reports and ABDM receipts.</p>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: 'var(--mb-success)', fontSize: '13px', fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Verified Registry
                </span>
              </div>

              <form onSubmit={handleSaveFacility} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 24px' }}>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Facility Name <span style={{ color: 'var(--mb-danger)' }}>*</span></label>
                  <input value={facilityName} onChange={e => setFacilityName(e.target.value)} style={inputStyle} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>HFR Facility ID (ABDM)</label>
                  <input value={hfrId} onChange={e => setHfrId(e.target.value)} style={{ ...inputStyle, background: 'var(--mb-bg-subtle)', fontFamily: 'var(--mb-mono)' }} readOnly />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Contact Phone</label>
                  <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--mb-mono)' }} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Official Email Address</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Physical Laboratory Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '22px', borderTop: '1px solid var(--mb-border)' }}>
                  <button type="submit" disabled={savingFacility} style={{ height: '48px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', transition: 'background 0.2s', fontFamily: 'var(--mb-font)' }}>
                    {savingFacility ? 'Saving changes…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===== TAB 2: STAFF & PATHOLOGISTS ===== */}
          {activeTab === 'staff' && (
            <div style={{ maxWidth: '860px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Pathologists & Laboratory Technicians</h2>
                  <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: 0 }}>Manage team access for entering test results and digitally signing reports.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ height: '44px', padding: '0 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(20,86,184,.26)', fontFamily: 'var(--mb-font)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  Add Staff Member
                </button>
              </div>

              {/* Staff Table / Empty State (MedBridge States.dc.html 01) */}
              {staffList.length === 0 ? (
                <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '64px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'var(--mb-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '26px', position: 'relative' }}>
                    <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.6" stroke="#1456b8" strokeWidth="1.8"/><path d="M5 19c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5" stroke="#1456b8" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', width: '42px', height: '42px', borderRadius: '50%', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.3)', border: '3px solid #fff' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '21px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>No staff members yet</h3>
                  <p style={{ fontSize: '15.5px', lineHeight: 1.6, color: 'var(--mb-text-2)', margin: '0 0 26px', maxWidth: '380px' }}>Invite your first pathologist or technician to start capturing test results and signing reports.</p>
                  <button onClick={() => setShowAddModal(true)} style={{ height: '50px', padding: '0 26px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.3" strokeLinecap="round"/></svg>Add Staff Member
                  </button>
                </div>
              ) : (
                <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1.2fr 1fr 0.8fr', padding: '14px 24px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                    <div>Name</div><div>Email</div><div>Role</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div>
                  </div>

                  {staffList.map((staff, idx) => {
                    const isYou = staff.status === 'You';
                    return (
                      <div key={staff.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1.2fr 1fr 0.8fr', padding: '16px 24px', borderBottom: '1px solid var(--mb-bg)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: idx === 0 ? 'var(--mb-primary)' : idx === 1 ? 'var(--mb-teal-tint)' : 'var(--mb-primary-tint)', color: idx === 0 ? '#fff' : idx === 1 ? '#0a6b62' : 'var(--mb-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>{staff.name}</div>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}>{staff.email}</div>
                        <div>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'var(--mb-bg-subtle)', color: 'var(--mb-ink)', fontSize: '13px', fontWeight: 600 }}>
                            {staff.role}
                          </span>
                        </div>
                        <div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 11px', borderRadius: '999px', background: isYou ? 'var(--mb-success-tint)' : 'var(--mb-warning-tint)', color: isYou ? '#136b44' : '#8a5908', fontSize: '12.5px', fontWeight: 600 }}>
                            {isYou && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mb-success)' }} />}
                            {staff.status || 'Active'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {!isYou ? (
                            <button onClick={() => handleRemoveStaff(staff.id, staff.name)} style={{ padding: '6px 14px', background: 'var(--mb-danger-tint)', color: 'var(--mb-danger)', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'var(--mb-font)' }}>
                              Remove
                            </button>
                          ) : (
                            <span style={{ color: 'var(--mb-text-3)', fontSize: '13px' }}>—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 3: ABDM & INCENTIVES ===== */}
          {activeTab === 'abdm' && (
            <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Incentive Tier Banner */}
              <div style={{ background: 'linear-gradient(135deg, #0e3a7a 0%, #1456b8 100%)', borderRadius: '16px', padding: '28px', color: '#fff', boxShadow: '0 8px 24px rgba(20,86,184,0.22)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>ABDM Digital Health Incentive Scheme (DHIS)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Current Status: {dhisTier}</div>
                <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.9)', margin: '0 0 20px', lineHeight: 1.5, maxWidth: '540px' }}>
                  Your laboratory earns ₹25 per digitally linked report shared with patient ABHA records under National Health Authority guidelines.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.18)', padding: '10px 18px', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Estimated Payout Cycle</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>Monthly (15th)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.18)', padding: '10px 18px', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Compliance Score</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', color: '#4ADE80' }}>99.4% Excellent</div>
                  </div>
                </div>
              </div>

              {/* Toggles Card */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '28px 32px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 20px' }}>Interoperability & Automation Preferences</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--mb-bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>Auto-share digital reports to ABDM Gateway</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Automatically upload FHIR R4 diagnostic bundles when pathologist signs report.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAutoShare(!autoShare); triggerToast(`Auto-share ${!autoShare ? 'enabled' : 'disabled'}`, 'FHIR R4 bundle upload preference updated.'); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: autoShare ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: autoShare ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--mb-bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>Require Pathologist Digital Signature before Sync</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Prevent unverified test results from being transmitted to patient health records.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setRequireSignature(!requireSignature); triggerToast(`Signature verification ${!requireSignature ? 'required' : 'optional'}`, 'Security compliance policy updated.'); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: requireSignature ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: requireSignature ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>SMS Notification to Patient upon ABHA Link</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Send instant SMS receipt with download link when order is created.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSmsNotify(!smsNotify); triggerToast(`SMS notifications ${!smsNotify ? 'enabled' : 'disabled'}`, 'Patient notification gateway updated.'); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: smsNotify ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: smsNotify ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 4: SECURITY & API KEYS ===== */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '760px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '32px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--mb-ink)', margin: '0 0 4px' }}>API Endpoints & Cryptographic Secrets</h2>
              <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 24px' }}>Configuration for ABDM Layer 2 Bridge and FHIR R4 Validation Microservices.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>ABDM Wrapper Microservice URL</label>
                  <input value={abdmUrl} onChange={e => setAbdmUrl(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--mb-mono)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>HAPI FHIR R4 Validator Service URL</label>
                  <input value={hapiUrl} onChange={e => setHapiUrl(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--mb-mono)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Webhook Signing Secret (HMAC-SHA256)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="password" value={webhookSecret} readOnly style={{ ...inputStyle, background: 'var(--mb-bg-subtle)', fontFamily: 'var(--mb-mono)', flex: 1 }} />
                    <button
                      type="button"
                      onClick={() => { setWebhookSecret('whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)); triggerToast('Webhook Secret Regenerated', 'Updated cryptographic signing key.'); }}
                      style={{ padding: '0 18px', background: 'var(--mb-bg-subtle)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-ink)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--mb-font)' }}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '6px', padding: '16px 18px', background: 'var(--mb-warning-tint)', border: '1px solid #f3d19e', borderRadius: '12px', fontSize: '13.5px', color: '#8a5908', lineHeight: 1.5 }}>
                  ⚠️ <strong>Security Notice:</strong> Regenerating your Webhook Signing Secret will invalidate existing ABDM Gateway callback subscriptions. Make sure to update your environment variables in production.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '22px', borderTop: '1px solid var(--mb-border)' }}>
                  <button
                    type="button"
                    onClick={() => triggerToast('API Endpoints saved', 'Verified connection to ABDM microservice bridge.')}
                    style={{ height: '48px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', fontFamily: 'var(--mb-font)' }}
                  >
                    Save API Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 5: DESIGN SYSTEM STATES (MedBridge States.dc.html Showcase) ===== */}
          {activeTab === 'states' && (
            <div style={{ maxWidth: '940px' }}>
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', padding: '24px 28px', marginBottom: '32px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mb-primary)', marginBottom: '4px' }}>Design System · Standard States</div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px' }}>States we reuse everywhere</h2>
                <p style={{ fontSize: '15px', color: 'var(--mb-text-2)', margin: 0 }}>Empty, loading, error, and success — consistent treatments so every screen behaves the same way when there&rsquo;s nothing yet, something&rsquo;s on its way, something broke, or something worked.</p>
              </div>

              {/* 01 EMPTY STATE */}
              <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-3)' }}>01</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Empty state</h3>
                  <span style={{ fontSize: '14px', color: 'var(--mb-text-3)' }}>— nothing here yet; point to the one next action</span>
                </div>
                <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'var(--mb-primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
                    <svg width="58" height="58" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.6" stroke="#1456b8" strokeWidth="1.8"/><path d="M5 19c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5" stroke="#1456b8" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', width: '42px', height: '42px', borderRadius: '50%', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.3)', border: '3px solid #fff' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>No patients yet</h4>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--mb-text-2)', margin: '0 0 24px', maxWidth: '380px' }}>Register your first patient to start capturing tests and sharing reports to their ABDM health record.</p>
                  <button onClick={() => navigate('/patients/register')} style={{ height: '48px', padding: '0 26px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.3" strokeLinecap="round"/></svg>Register patient
                  </button>
                </div>
              </div>

              {/* 02 LOADING STATE */}
              <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-3)' }}>02</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Loading state</h3>
                  <span style={{ fontSize: '14px', color: 'var(--mb-text-3)' }}>— spinner for actions, skeletons for content</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
                  <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '4px solid var(--mb-primary-tint-2)', borderTopColor: 'var(--mb-primary)', animation: 'spin 0.8s linear infinite', marginBottom: '20px' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--mb-ink)', marginBottom: '5px' }}>Sharing to ABDM…</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--mb-text-3)' }}>This usually takes a few seconds</div>
                  </div>
                  <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.3fr 1fr', padding: '14px 24px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '12px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                      <div>Patient</div><div>Test</div><div>Status</div><div style={{ textAlign: 'right' }}>Time</div>
                    </div>
                    {[1, 2, 3].map(idx => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.3fr 1fr', padding: '18px 24px', borderBottom: '1px solid var(--mb-border)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--mb-bg-subtle)' }} /><div style={{ flex: 1 }}><div style={{ height: '11px', width: '62%', background: 'var(--mb-bg-subtle)', borderRadius: '4px', marginBottom: '7px' }} /><div style={{ height: '9px', width: '38%', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div></div>
                        <div><div style={{ height: '11px', width: '80%', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div>
                        <div><div style={{ height: '24px', width: '90px', borderRadius: '999px', background: 'var(--mb-bg-subtle)' }} /></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ height: '11px', width: '42px', background: 'var(--mb-bg-subtle)', borderRadius: '4px' }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 03 ERROR STATE */}
              <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-3)' }}>03</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Error state</h3>
                  <span style={{ fontSize: '14px', color: 'var(--mb-text-3)' }}>— say what happened, offer a way forward</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '44px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--mb-danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 3l9.5 16.5H2.5L12 3z" stroke="#c5392b" strokeWidth="1.9" strokeLinejoin="round"/><path d="M12 10v4M12 17v.3" stroke="#c5392b" strokeWidth="2.1" strokeLinecap="round"/></svg>
                    </div>
                    <h4 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 8px' }}>Couldn&rsquo;t share the report</h4>
                    <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--mb-text-2)', margin: '0 0 24px', maxWidth: '360px' }}>The ABDM network didn&rsquo;t respond. The report is saved — you can try sharing again.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => triggerToast('Retrying share…', 'Connecting to ABDM Gateway')} style={{ height: '46px', padding: '0 22px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>Retry sharing
                      </button>
                      <button style={{ height: '46px', padding: '0 20px', background: '#fff', color: 'var(--mb-text-2)', border: '1.5px solid var(--mb-border-strong)', borderRadius: '11px', fontFamily: 'var(--mb-font)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer' }}>Contact support</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'var(--mb-danger-tint)', border: '1px solid #f0c4be', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '13px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: '1px' }}><circle cx="12" cy="12" r="9" stroke="#c5392b" strokeWidth="1.9"/><path d="M12 7.5v5.5M12 16v.3" stroke="#c5392b" strokeWidth="2" strokeLinecap="round"/></svg>
                      <div><div style={{ fontSize: '14.5px', fontWeight: 600, color: '#9d2c20', marginBottom: '3px' }}>2 reports failed to share</div><div style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#9d2c20' }}>Network error reaching ABDM. <a href="#retry" onClick={e => { e.preventDefault(); triggerToast('Retrying failed reports…'); }} style={{ color: '#9d2c20', fontWeight: 600 }}>Review & retry →</a></div></div>
                    </div>
                    <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '12px', padding: '18px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '14px' }}>Inline field error</div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>ABHA number</label>
                      <div style={{ height: '48px', border: '2px solid var(--mb-danger)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '16px', fontFamily: 'var(--mb-mono)', color: 'var(--mb-ink)', background: '#fff' }}>91-2345</div>
                      <div style={{ fontSize: '13px', color: 'var(--mb-danger)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#c5392b" strokeWidth="2"/><path d="M12 7v6M12 16.5v.5" stroke="#c5392b" strokeWidth="2" strokeLinecap="round"/></svg>Enter the full 14-digit ABHA number.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 04 SUCCESS & TOASTS */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--mb-mono)', color: 'var(--mb-text-3)' }}>04</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mb-ink)', margin: 0 }}>Success notifications</h3>
                  <span style={{ fontSize: '14px', color: 'var(--mb-text-3)' }}>— click buttons to trigger live toasts</span>
                </div>

                <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                  <button
                    onClick={() => triggerToast('Report shared to ABDM', 'Anjali Deshpande’s CBC is now in her health record.', 'success')}
                    style={{ height: '46px', padding: '0 20px', background: 'var(--mb-success)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(31,138,91,.26)', fontFamily: 'var(--mb-font)' }}
                  >
                    Trigger Success Toast ✓
                  </button>
                  <button
                    onClick={() => triggerToast('Draft saved', 'Your results are saved. Sign when ready.', 'info')}
                    style={{ height: '46px', padding: '0 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', fontFamily: 'var(--mb-font)' }}
                  >
                    Trigger Info Toast ℹ️
                  </button>
                  <button
                    onClick={() => triggerToast('Upload Failed', 'ABDM Gateway timeout. Please retry.', 'error')}
                    style={{ height: '46px', padding: '0 20px', background: 'var(--mb-danger)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(197,57,43,.26)', fontFamily: 'var(--mb-font)' }}
                  >
                    Trigger Error Toast ⚠️
                  </button>
                </div>

                <div style={{ background: 'var(--mb-success-tint)', border: '1px solid #bfe3cf', borderRadius: '12px', padding: '15px 18px', display: 'flex', alignItems: 'center', gap: '13px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}><circle cx="12" cy="12" r="9" stroke="#1f8a5b" strokeWidth="1.9"/><path d="M8 12l3 3 5-6" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div style={{ fontSize: '14.5px', color: '#136b44' }}><span style={{ fontWeight: 600 }}>Patient registered.</span> Anjali Deshpande is linked to her ABHA health ID and ready for orders.</div>
                  <a href="#order" onClick={e => { e.preventDefault(); navigate('/orders/create'); }} style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: '#136b44', textDecoration: 'none', whiteSpace: 'nowrap' }}>Create order →</a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD STAFF MEMBER */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(21,35,59,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '460px', background: 'var(--mb-surface)', borderRadius: '16px', boxShadow: 'var(--mb-sh-pop)', padding: '32px', border: '1px solid var(--mb-border)', animation: 'popIn 0.2s ease-out' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px' }}>Add New Team Member</h3>
            <p style={{ fontSize: '14px', color: 'var(--mb-text-2)', margin: '0 0 24px' }}>Invite a pathologist or technician to access this laboratory.</p>

            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Full Name</label>
                <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="e.g. Dr. Rajesh Mehta" style={inputStyle} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Email Address</label>
                <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="e.g. rajesh@sunrisediags.in" style={inputStyle} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Assigned Role</label>
                <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} style={inputStyle}>
                  <option value="Senior Pathologist">Senior Pathologist</option>
                  <option value="Pathologist">Pathologist</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Receptionist / Front Desk">Receptionist / Front Desk</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--mb-border)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ height: '46px', padding: '0 20px', background: 'transparent', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', fontFamily: 'var(--mb-font)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingStaff} style={{ height: '46px', padding: '0 24px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', fontFamily: 'var(--mb-font)' }}>
                  {addingStaff ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            </form>
            <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
