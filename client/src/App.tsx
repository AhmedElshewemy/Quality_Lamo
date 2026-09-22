import React, { useState, useEffect } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (currentUser) {
      console.log('User logged in:', currentUser.name);
    }
  }, [currentUser]);

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
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            direction: 'rtl',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
