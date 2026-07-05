import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import PatientRegistration from './pages/PatientRegistration';
import LabOnboarding from './pages/LabOnboarding';
import AdminDashboard from './pages/AdminDashboard';
import CreateOrder from './pages/CreateOrder';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Optional: A small debug component just to keep the health check visible if needed
const HealthCheck = () => {
  const [health, setHealth] = useState<{ status?: string } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => console.error('Error fetching health status:', err));
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>ABDM Diagnostics Platform (Layer 1)</h1>
      <p>Status: {health ? health.status : 'Loading...'}</p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<LabOnboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/patients/register" element={<PatientRegistration />} />
        <Route path="/orders/create" element={<CreateOrder />} />
        <Route path="/reports/review" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/health" element={<HealthCheck />} />
      </Routes>
    </Router>
  );
}

export default App;
