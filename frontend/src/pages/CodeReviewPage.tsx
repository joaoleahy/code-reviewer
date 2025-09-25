import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import CodeSubmissionForm from '../components/CodeReview/CodeSubmissionForm';
import ReviewResult from '../components/CodeReview/ReviewResult';
import { useReview, useReviewPolling } from '../hooks/useApi';
import { StatusProgress } from '../components/UI/StatusBadge';

const CodeReviewPage: React.FC = () => {
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const { review, isLoading, error, refresh } = useReview(currentReviewId || '');
  const { pollingReview, startPolling, isPolling, reset } = useReviewPolling();

  const handleSubmissionSuccess = async (reviewId: string) => {
    setCurrentReviewId(reviewId);
    
    // Reset previous state
    reset();
    
    // Start polling if review is not complete
    try {
      await startPolling(reviewId);
    } catch (error) {
      console.error('Polling error:', error);
      // Manual refresh in case of polling error
      refresh();
    }
  };

  const currentReview = pollingReview || review;
  const showLoading = isLoading || isPolling;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Code Reviewer
          </h1>
          <p className="text-lg text-gray-600">
            Submit your code and receive detailed feedback from our specialized AI code reviewer
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Submission form */}
          <div className="space-y-6">
            <CodeSubmissionForm 
              onSubmissionSuccess={handleSubmissionSuccess}
              isReviewInProgress={showLoading && currentReviewId !== null}
            />

            {/* Code examples */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🚀 Test Examples
              </h3>
              <div className="space-y-4">
                <ExampleCode
                  title="Python with Issue"
                  language="Python"
                  code={`def calculate_average(numbers):
    return sum(numbers) / len(numbers)

result = calculate_average([])`}
                  description="Unhandled division by zero"
                />
                
                <ExampleCode
                  title="JavaScript with Improvements"
                  language="JavaScript"
                  code={`function fetchUserData(userId) {
    fetch('/api/users/' + userId)
        .then(response => response.json())
        .then(data => console.log(data));
}`}
                  description="Missing error handling and async/await"
                />
              </div>
            </div>
          </div>

          {/* Review result */}
          <div className="space-y-6">
            {currentReviewId && (
              <>
                {/* Progress indicator */}
                {currentReview && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Review Status
                    </h3>
                    <StatusProgress 
                      currentStatus={currentReview.status}
                    />
                    <div className="mt-4 text-sm text-gray-600">
                      Review ID: <code className="bg-gray-100 px-2 py-1 rounded">
                        {currentReviewId}
                      </code>
                    </div>
                  </div>
                )}

                <ReviewResult
                  review={currentReview}
                  isLoading={showLoading}
                  error={error || undefined}
                  onRetry={refresh}
                />
              </>
            )}

            {!currentReviewId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Waiting for code
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Submit your code in the form to receive detailed analysis
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Our AI analyzes:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Code quality and structure</li>
                      <li>Security vulnerabilities</li>
                      <li>Optimization opportunities</li>
                      <li>Language best practices</li>
                      <li>Potential bugs</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Code examples component
const ExampleCode: React.FC<{
  title: string;
  language: string;
  code: string;
  description: string;
}> = ({ title, language, code, description }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
        {language}
      </span>
    </div>
    <pre className="text-sm bg-gray-50 p-3 rounded border text-gray-700 overflow-x-auto">
      <code>{code}</code>
    </pre>
    <p className="text-xs text-gray-600 mt-2">{description}</p>
  </div>
);

export default CodeReviewPage;
