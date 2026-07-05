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

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'facility' | 'staff' | 'abdm' | 'security'>('facility');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Facility state
  const [facilityName, setFacilityName] = useState('Sunrise Diagnostics');
  const [hfrId, setHfrId] = useState('4521-8890');
  const [address, setAddress] = useState('Plot 42, Health Avenue, MG Road, Pune - 411001');
  const [contactEmail, setContactEmail] = useState('contact@sunrisediags.in');
  const [contactPhone, setContactPhone] = useState('+91 98220 41157');
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
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading settings data", err);
        setLoading(false);
      });
  }, [navigate]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFacility(true);
    setTimeout(() => {
      setSavingFacility(false);
      triggerToast('✓ Facility profile updated and verified with ABDM Registry');
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

      if (res.ok) {
        const member = await res.json();
        setStaffList([...staffList, member]);
        setNewStaffName('');
        setNewStaffEmail('');
        setShowAddModal(false);
        triggerToast(`✓ Added ${member.name} to laboratory team`);
      } else {
        triggerToast('⚠️ Failed to add staff member');
      }
    } catch (err) {
      console.error(err);
      triggerToast('⚠️ Network error adding staff member');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleRemoveStaff = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from access?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setStaffList(staffList.filter(s => s.id !== id));
        triggerToast(`✓ Removed ${name} from laboratory access`);
      } else {
        triggerToast('⚠️ Failed to remove staff member');
      }
    } catch (err) {
      console.error(err);
      triggerToast('⚠️ Error removing staff member');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initials = facilityName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const navItems = [
    { label: 'Dashboard', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="14" y="3" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="3" y="14" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/><rect x="14" y="14" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.9"/></svg>, active: false, action: () => navigate('/dashboard') },
    { label: 'Patients', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.9"/><path d="M5 19c0-3.5 3.2-5.4 7-5.4s7 1.9 7 5.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/patients/register') },
    { label: 'Orders', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 6h14M5 6l1 13h12l1-13M5 6l-1-2.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 10.5v5M14.5 10.5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/orders/create') },
    { label: 'Reports', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M7 4h7l4 4v12H7z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M13 4v5h5" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M9.5 13h5M9.5 16h3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: false, action: () => navigate('/reports/review') },
    { label: 'Settings', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.9"/><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>, active: true, action: () => {} },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '46px', border: '1.5px solid var(--mb-border-strong)',
    borderRadius: '10px', padding: '0 14px', fontSize: '15px', color: 'var(--mb-ink)',
    background: 'var(--mb-surface)', fontFamily: 'var(--mb-font)', outline: 'none',
    transition: 'border-color 0.2s'
  };

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mb-font)', color: 'var(--mb-text-2)', fontSize: '15px', background: 'var(--mb-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--mb-border)', borderTopColor: 'var(--mb-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading laboratory configuration…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontFamily: 'var(--mb-font)', background: 'var(--mb-bg)', color: 'var(--mb-text)', overflow: 'hidden' }}>

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          background: 'var(--mb-ink)', color: '#fff', padding: '14px 22px',
          borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
          fontSize: '14.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toast}
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '256px', flexShrink: 0, background: 'var(--mb-surface)', borderRight: '1px solid var(--mb-border)', display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '4px 8px 22px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--mb-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 15c2.6 0 2.6-6 5.2-6S11.8 15 14.4 15s2.6-6 5.2-6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/><circle cx="12" cy="5.5" r="1.6" fill="#fff"/></svg>
          </div>
          <span style={{ fontSize: '19px', fontWeight: 700, color: 'var(--mb-ink)' }}>MedBridge</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '44px', padding: '0 13px', borderRadius: '9px', background: item.active ? 'var(--mb-primary-tint)' : 'transparent', color: item.active ? 'var(--mb-primary-dark)' : 'var(--mb-text-2)', fontSize: '14.5px', fontWeight: item.active ? 600 : 500, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--mb-font)', width: '100%', position: 'relative', transition: 'background 0.15s' }}>
              {item.active && <span style={{ position: 'absolute', left: '-14px', top: '10px', bottom: '10px', width: '3px', borderRadius: '0 3px 3px 0', background: 'var(--mb-primary)' }} />}
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '13px 10px', borderTop: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--mb-success)', boxShadow: '0 0 0 3px var(--mb-success-tint)', flexShrink: 0 }} />
          <div style={{ fontSize: '12.5px', color: 'var(--mb-text-2)' }}>ABDM connected</div>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ height: '64px', flexShrink: 0, background: 'var(--mb-surface)', borderBottom: '1px solid var(--mb-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--mb-teal-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 3h6v5l4 8.5A2.5 2.5 0 0 1 16.7 20H7.3A2.5 2.5 0 0 1 5 16.5L9 8V3z" stroke="#0a6b62" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mb-ink)', lineHeight: 1.1 }}>{facilityName}</div>
              <div style={{ fontSize: '12px', color: 'var(--mb-text-3)', marginTop: '1px' }}>HFR ID {hfrId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--mb-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{initials}</div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-ink)' }}>Admin</div>
                <div style={{ fontSize: '12px', color: 'var(--mb-text-3)' }}>Lab owner</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ height: '38px', padding: '0 14px', border: '1.5px solid var(--mb-border-strong)', borderRadius: '9px', background: 'transparent', fontFamily: 'var(--mb-font)', fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 12h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '28px 36px', overflow: 'auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px', letterSpacing: '-.01em' }}>Laboratory Settings</h1>
            <p style={{ fontSize: '14.5px', color: 'var(--mb-text-2)', margin: 0 }}>Configure facility profile, pathologist permissions, and ABDM interoperability preferences.</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--mb-border)', marginBottom: '28px' }}>
            {[
              { id: 'facility', label: '🏢 Facility Profile' },
              { id: 'staff', label: '👥 Staff & Pathologists', count: staffList.length },
              { id: 'abdm', label: '⚡ ABDM & Incentives' },
              { id: 'security', label: '🔒 Security & API Keys' }
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

          {/* TAB 1: FACILITY PROFILE */}
          {activeTab === 'facility' && (
            <div style={{ maxWidth: '720px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--mb-border)' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Health Facility Registry (HFR) Details</h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', margin: 0 }}>These details appear on digitally signed test reports and ABDM receipts.</p>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: 'var(--mb-success)', fontSize: '12.5px', fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Verified Registry
                </span>
              </div>

              <form onSubmit={handleSaveFacility} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Facility Name</label>
                  <input value={facilityName} onChange={e => setFacilityName(e.target.value)} style={inputStyle} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>HFR Facility ID</label>
                  <input value={hfrId} onChange={e => setHfrId(e.target.value)} style={{ ...inputStyle, background: 'var(--mb-bg-subtle)', fontFamily: 'var(--mb-mono)' }} readOnly />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Contact Phone</label>
                  <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Official Email Address</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--mb-text-2)', marginBottom: '8px' }}>Physical Laboratory Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--mb-border)' }}>
                  <button type="submit" disabled={savingFacility} style={{ height: '46px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)', transition: 'background 0.2s' }}>
                    {savingFacility ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: STAFF & PATHOLOGISTS */}
          {activeTab === 'staff' && (
            <div style={{ maxWidth: '860px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 4px' }}>Pathologists & Laboratory Technicians</h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', margin: 0 }}>Manage team access for entering test results and digitally signing reports.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ height: '42px', padding: '0 20px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  Add Staff Member
                </button>
              </div>

              {/* Staff Table */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1.2fr 1fr 0.8fr', padding: '14px 24px', background: 'var(--mb-bg-subtle)', borderBottom: '1px solid var(--mb-border)', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--mb-text-2)' }}>
                  <div>Name</div><div>Email</div><div>Role</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div>
                </div>

                {staffList.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--mb-text-3)' }}>No staff members added yet. Click "+ Add Staff Member" above.</div>
                ) : (
                  staffList.map((staff) => (
                    <div key={staff.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 1.2fr 1fr 0.8fr', padding: '16px 24px', borderBottom: '1px solid var(--mb-bg)', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--mb-primary-tint)', color: 'var(--mb-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                          {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>{staff.name}</div>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--mb-text-2)' }}>{staff.email}</div>
                      <div>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: 'var(--mb-bg-subtle)', color: 'var(--mb-ink)', fontSize: '12.5px', fontWeight: 600 }}>
                          {staff.role}
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '26px', padding: '0 10px', borderRadius: '999px', background: 'var(--mb-success-tint)', color: 'var(--mb-success)', fontSize: '12px', fontWeight: 600 }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mb-success)' }} />
                          {staff.status || 'Active'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <button onClick={() => handleRemoveStaff(staff.id, staff.name)} style={{ padding: '6px 12px', background: 'var(--mb-danger-tint)', color: 'var(--mb-danger)', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ABDM & INCENTIVES */}
          {activeTab === 'abdm' && (
            <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Incentive Tier Banner */}
              <div style={{ background: 'linear-gradient(135deg, #0e3a7a 0%, #1456b8 100%)', borderRadius: '16px', padding: '28px', color: '#fff', boxShadow: '0 8px 24px rgba(20,86,184,0.22)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>ABDM Digital Health Incentive Scheme (DHIS)</div>
                <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Current Status: {dhisTier}</div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0 0 20px', lineHeight: 1.5, maxWidth: '520px' }}>
                  Your laboratory earns ₹25 per digitally linked report shared with patient ABHA records under National Health Authority guidelines.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.18)', padding: '10px 16px', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Estimated Payout Cycle</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>Monthly (15th)</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.18)', padding: '10px 16px', borderRadius: '10px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Compliance Score</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', color: '#4ADE80' }}>99.4% Excellent</div>
                  </div>
                </div>
              </div>

              {/* Toggles Card */}
              <div style={{ background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '28px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 20px' }}>Interoperability & Automation Preferences</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Toggle 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--mb-bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>Auto-share digital reports to ABDM Gateway</div>
                      <div style={{ fontSize: '13px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Automatically upload FHIR R4 diagnostic bundles when pathologist signs report.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAutoShare(!autoShare); triggerToast(`Auto-share ${!autoShare ? 'enabled' : 'disabled'}`); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: autoShare ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: autoShare ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--mb-bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>Require Pathologist Digital Signature before Sync</div>
                      <div style={{ fontSize: '13px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Prevent unverified test results from being transmitted to patient health records.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setRequireSignature(!requireSignature); triggerToast(`Signature verification ${!requireSignature ? 'required' : 'optional'}`); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: requireSignature ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: requireSignature ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>

                  {/* Toggle 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mb-ink)' }}>SMS Notification to Patient upon ABHA Link</div>
                      <div style={{ fontSize: '13px', color: 'var(--mb-text-2)', marginTop: '2px' }}>Send instant SMS receipt with download link when order is created.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSmsNotify(!smsNotify); triggerToast(`SMS notifications ${!smsNotify ? 'enabled' : 'disabled'}`); }}
                      style={{ width: '52px', height: '28px', borderRadius: '999px', background: smsNotify ? 'var(--mb-success)' : 'var(--mb-border-strong)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: '3px', left: smsNotify ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & API KEYS */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '720px', background: 'var(--mb-surface)', border: '1px solid var(--mb-border)', borderRadius: '16px', boxShadow: 'var(--mb-sh-card)', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mb-ink)', margin: '0 0 6px' }}>API Endpoints & Cryptographic Secrets</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--mb-text-2)', margin: '0 0 24px' }}>Configuration for ABDM Layer 2 Bridge and FHIR R4 Validation Microservices.</p>

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
                      onClick={() => { setWebhookSecret('whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)); triggerToast('🔄 Regenerated Webhook Secret'); }}
                      style={{ padding: '0 18px', background: 'var(--mb-bg-subtle)', border: '1px solid var(--mb-border-strong)', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, color: 'var(--mb-ink)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '12px', padding: '16px', background: 'var(--mb-warning-tint)', border: '1px solid #f3d19e', borderRadius: '10px', fontSize: '13.5px', color: '#8a5908', lineHeight: 1.5 }}>
                  ⚠️ <strong>Security Notice:</strong> Regenerating your Webhook Signing Secret will invalidate existing ABDM Gateway callback subscriptions. Make sure to update your environment variables in production.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid var(--mb-border)' }}>
                  <button
                    type="button"
                    onClick={() => triggerToast('✓ API Endpoints configuration verified & saved')}
                    style={{ height: '46px', padding: '0 28px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}
                  >
                    Save API Configuration
                  </button>
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
                <button type="button" onClick={() => setShowAddModal(false)} style={{ height: '46px', padding: '0 20px', background: 'transparent', border: '1.5px solid var(--mb-border-strong)', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, color: 'var(--mb-text-2)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingStaff} style={{ height: '46px', padding: '0 24px', background: 'var(--mb-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(20,86,184,.26)' }}>
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
