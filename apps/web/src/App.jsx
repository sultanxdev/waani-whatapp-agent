import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Header } from './components/Header.jsx';
import { Overview } from './pages/Overview.jsx';
import { Conversations } from './pages/Conversations.jsx';
import { Leads } from './pages/Leads.jsx';
import { Appointments } from './pages/Appointments.jsx';
import { Services } from './pages/Services.jsx';
import { Doctors } from './pages/Doctors.jsx';
import { Faqs } from './pages/Faqs.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { WhatsAppSimulator } from './pages/WhatsAppSimulator.jsx';
import { Settings } from './pages/Settings.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { api } from './services/api.js';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingHandoffs, setPendingHandoffs] = useState(0);

  useEffect(() => {
    async function checkHandoffs() {
      try {
        const data = await api.getAnalytics();
        setPendingHandoffs(data.overview?.pendingHandoffs || 0);
      } catch (err) {
        // quiet error
      }
    }
    checkHandoffs();
    const interval = setInterval(checkHandoffs, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={(tab) => setActiveTab(tab)} />;
      case 'conversations':
        return <Conversations />;
      case 'leads':
        return <Leads />;
      case 'appointments':
        return <Appointments />;
      case 'services':
        return <Services />;
      case 'doctors':
        return <Doctors />;
      case 'faqs':
        return <Faqs />;
      case 'analytics':
        return <Analytics />;
      case 'simulator':
        return <WhatsAppSimulator />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onOpenSimulator={() => setActiveTab('simulator')}
          pendingHandoffCount={pendingHandoffs}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
