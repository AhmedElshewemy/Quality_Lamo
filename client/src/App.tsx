import React, { Suspense, lazy, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { PageId } from './types';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ReportIssue = lazy(() => import('./pages/ReportIssue'));
const IssuesList = lazy(() => import('./pages/IssuesList'));
const Reports = lazy(() => import('./pages/Reports'));
const Branches = lazy(() => import('./pages/Branches'));
const Staff = lazy(() => import('./pages/Staff'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <p className="text-gray-400 text-sm">جاري التحميل...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

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
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
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
