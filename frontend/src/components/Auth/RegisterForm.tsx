import React, { useState } from 'react';
import Button from '../UI/Button';

interface RegisterFormProps {
  onRegister: (email: string, name: string, password: string) => void;
  onShowLogin: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onShowLogin, 
  onBack, 
  isLoading = false, 
  error,
  successMessage 
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const validateName = (name: string): boolean => {
    if (!name) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
      return false;
    }
    setNameError('');
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
    if (!/[A-Za-z]/.test(password)) {
      setPasswordError('Password must contain at least one letter');
      return false;
    }
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Password confirmation is required');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Za-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { strength: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { strength: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score === 3) return { strength: 'Good', color: 'bg-orange-500', width: '75%' };
    return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isNameValid = validateName(name);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    if (isEmailValid && isNameValid && isPasswordValid && isConfirmPasswordValid) {
      onRegister(email, name, password);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

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
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              or{' '}
              <button
                onClick={onShowLogin}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
              >
                sign in to your existing account
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) validateName(e.target.value);
              }}
              onBlur={() => validateName(name)}
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                nameError ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors duration-200`}
              placeholder="Your full name"
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
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
              autoComplete="new-password"
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
              placeholder="Minimum 8 characters"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
            
            {password && passwordStrength && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Password strength:</span>
                  <span className={passwordStrength.color.replace('bg-', 'text-')}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  • Minimum 8 characters • At least 1 letter • At least 1 number
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) validateConfirmPassword(e.target.value);
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                confirmPasswordError ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors duration-200`}
              placeholder="Enter password again"
            />
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};