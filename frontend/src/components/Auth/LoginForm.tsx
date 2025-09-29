import React, { useState } from 'react';
import Button from '../UI/Button';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onShowRegister: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onShowRegister, 
  onBack, 
  isLoading = false, 
  error,
  successMessage 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-orange-600 hover:text-orange-500 flex items-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              or{' '}
              <button
                onClick={onShowRegister}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                create a new account
              </button>
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{successMessage}</div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                emailError ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors duration-200`}
              placeholder="your@email.com"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                passwordError ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors duration-200`}
              placeholder="Your password"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full py-3 text-lg font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};