import React from 'react';
import Button from '../components/UI/Button';

interface LandingPageProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin, onShowRegister }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">CodeReviewer</div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors duration-200"
                onClick={onShowLogin}
              >
                Sign In
              </Button>
              <Button 
                className="bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
                onClick={onShowRegister}
              >
                Start for free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Smart <span className="text-orange-600">Code Review</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Revolutionize your code review process with advanced artificial intelligence. 
            Identify issues, improve quality, and accelerate your development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-orange-600 text-white hover:bg-orange-700 px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
              onClick={onShowRegister}
            >
              Start for free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-8 py-4 text-lg transition-colors duration-200"
              onClick={onShowLogin}
            >
              Already have an account?
            </Button>
          </div>
        </div>
      </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Why choose CodeReviewer?
          </h2>
          <p className="text-xl text-gray-600">
            Advanced tools for code analysis that your team needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:border-orange-300 transition-colors duration-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Advanced AI</h3>
            <p className="text-gray-600 leading-relaxed">
              Intelligent analysis that identifies complex issues and suggests improvements based on best practices
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:border-orange-300 transition-colors duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Lightning Fast</h3>
            <p className="text-gray-600 leading-relaxed">
              Results in seconds, not hours. Accelerate your development process without losing quality
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center hover:border-orange-300 transition-colors duration-200">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Detailed Metrics</h3>
            <p className="text-gray-600 leading-relaxed">
              Track comprehensive statistics and code quality evolution over time
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                Improve your code quality
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Bug Detection</h3>
                    <p className="text-gray-600">Identifies potential issues before code execution</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Security Analysis</h3>
                    <p className="text-gray-600">Identifies security vulnerabilities and provides solutions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Performance Optimization</h3>
                    <p className="text-gray-600">Suggestions to improve code efficiency and speed</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">✓</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Code Standards</h3>
                    <p className="text-gray-600">Ensures consistency and adherence to best practices</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-10">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600 mb-3">10x</div>
                <div className="text-gray-700 mb-8 text-lg">Faster than manual review</div>
                
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div className="p-6">
                    <div className="text-4xl font-bold text-gray-800">95%</div>
                    <div className="text-lg text-gray-600 mt-2">Detection accuracy</div>
                  </div>
                  <div className="p-6">
                    <div className="text-4xl font-bold text-gray-800">24/7</div>
                    <div className="text-lg text-gray-600 mt-2">Availability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-3">CodeReviewer</div>
            <p className="text-gray-300 text-lg">
              © 2025 CodeReviewer. Smart code review for modern developers.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Making code review faster, smarter, and more reliable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};