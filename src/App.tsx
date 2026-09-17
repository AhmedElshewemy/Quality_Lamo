import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import IssuesList from './pages/IssuesList';
import Reports from './pages/Reports';
import Branches from './pages/Branches';
import Staff from './pages/Staff';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'report-issue':
        return <ReportIssue />;
      case 'my-issues':
        return <IssuesList showAll={false} />;
      case 'all-issues':
        return <IssuesList showAll={true} />;
      case 'reports':
        return <Reports />;
      case 'branches':
        return <Branches />;
      case 'staff':
        return <Staff />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
