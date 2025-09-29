import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import CodeReviewPage from './pages/CodeReviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';

import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

type AuthView = 'landing' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login, register, error, successMessage, clearError, clearSuccess } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [authLoading, setAuthLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<CodeReviewPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    );
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      clearError();
      await login(email, password);
    } catch (err) {
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, name: string, password: string) => {
    try {
      setAuthLoading(true);
      clearError();
      await register(email, name, password);
    } catch (err) {
    } finally {
      setAuthLoading(false);
    }
  };

  if (authView === 'login') {
    return (
      <LoginForm
        onLogin={handleLogin}
        onShowRegister={() => {
          clearError();
          clearSuccess();
          setAuthView('register');
        }}
        onBack={() => {
          clearError();
          clearSuccess();
          setAuthView('landing');
        }}
        isLoading={authLoading}
        error={error || undefined}
        successMessage={successMessage || undefined}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegister}
        onShowLogin={() => {
          clearError();
          clearSuccess();
          setAuthView('login');
        }}
        onBack={() => {
          clearError();
          clearSuccess();
          setAuthView('landing');
        }}
        isLoading={authLoading}
        error={error || undefined}
        successMessage={successMessage || undefined}
      />
    );
  }

  return (
    <LandingPage
      onShowLogin={() => {
        clearError();
        clearSuccess();
        setAuthView('login');
      }}
      onShowRegister={() => {
        clearError();
        clearSuccess();
        setAuthView('register');
      }}
    />
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}

const NotFoundPage: React.FC = () => (
  <Layout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="space-x-4">
          <a
            href="/"
            className="btn btn-primary"
          >
            Back to Home
          </a>
          <a
            href="/analytics"
            className="btn btn-outline"
          >
            View Analytics
          </a>
        </div>
      </div>
    </div>
  </Layout>
);

export default App;
