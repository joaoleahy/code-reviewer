import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, BarChart3, Settings, Github, LogIn } from 'lucide-react';
import { APP_CONFIG } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../Auth/UserMenu';
import LoginModal from '../Auth/LoginModal';
import Button from '../UI/Button';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigation = [
    { name: 'Code Review', href: '/', icon: Code2, current: location.pathname === '/' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, current: location.pathname === '/analytics' },
    { name: 'History', href: '/history', icon: Settings, current: location.pathname === '/history' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{APP_CONFIG.name}</h1>
                <p className="text-xs text-gray-500">v{APP_CONFIG.version}</p>
              </div>
            </Link>
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200
                    ${item.current 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>

            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">API Online</span>
            </div>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                variant="primary"
                size="sm"
                className="flex items-center"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200
                  ${item.current
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
};

export default Header;
