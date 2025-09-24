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

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
    mutations: {
      retry: 1,
    },
  },
});

type AuthView = 'landing' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, login, register, error, clearError } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [authLoading, setAuthLoading] = useState(false);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show main app
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

  // Handle authentication
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      clearError();
      await login(email, password);
    } catch (err) {
      // Error is handled by AuthContext
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
      // Error is handled by AuthContext
    } finally {
      setAuthLoading(false);
    }
  };

  // Show authentication views
  if (authView === 'login') {
    return (
      <LoginForm
        onLogin={handleLogin}
        onShowRegister={() => setAuthView('register')}
        onBack={() => setAuthView('landing')}
        isLoading={authLoading}
        error={error || undefined}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegister}
        onShowLogin={() => setAuthView('login')}
        onBack={() => setAuthView('landing')}
        isLoading={authLoading}
        error={error || undefined}
      />
    );
  }

  // Show landing page
  return (
    <LandingPage
      onShowLogin={() => setAuthView('login')}
      onShowRegister={() => setAuthView('register')}
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

// 404 Page
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
