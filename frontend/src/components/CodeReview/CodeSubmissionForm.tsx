import React from 'react';
import { useForm } from 'react-hook-form';
import { Send, Code, FileText } from 'lucide-react';
import Button from '../UI/Button';
import { ProgrammingLanguage, CodeSubmission } from '../../types/api';
import { LANGUAGE_CONFIG, APP_CONFIG } from '../../utils/constants';
import { useCodeSubmission } from '../../hooks/useApi';
import { cn } from '../../utils/helpers';

interface CodeSubmissionFormProps {
  onSubmissionSuccess: (reviewId: string) => void;
  className?: string;
  isReviewInProgress?: boolean;
}

interface FormData {
  code: string;
  language: ProgrammingLanguage;
  description: string;
}

const CodeSubmissionForm: React.FC<CodeSubmissionFormProps> = ({
  onSubmissionSuccess,
  className = '',
  isReviewInProgress = false
}) => {
  const { submitCode, isSubmitting, submitError } = useCodeSubmission();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    defaultValues: {
      code: '',
      language: ProgrammingLanguage.PYTHON,
      description: ''
    }
  });

  const watchedCode = watch('code');
  const watchedLanguage = watch('language');

  const onSubmit = async (data: FormData) => {
    try {
      const submission: CodeSubmission = {
        code: data.code.trim(),
        language: data.language,
        description: data.description.trim() || undefined
      };

      const response = await submitCode(submission);
      onSubmissionSuccess(response.id);
      reset();
    } catch (error) {
      // Error already handled by hook
      console.error('Submission error:', error);
    }
  };

  const languageOptions = Object.entries(LANGUAGE_CONFIG).map(([value, config]) => ({
    value,
    label: `${config.label}`
  }));

  const codeLength = watchedCode?.length || 0;
  const isCodeTooLong = codeLength > APP_CONFIG.maxCodeLength;

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Code className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Submit code for review
            </h2>
            <p className="text-sm text-gray-600">
              Paste your code below and our AI will provide detailed feedback
            </p>
          </div>
        </div>


      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Language selection */}
        <div>
          <label htmlFor="language" className="form-label">
            Programming Language
          </label>
          <select
            id="language"
            {...register('language', { required: 'Select a language' })}
            className="form-input"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.language && (
            <p className="form-error">{errors.language.message}</p>
          )}
        </div>

        {/* Code field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="code" className="form-label">
              Your Code
            </label>
            <div className="flex items-center space-x-2 text-sm">
              <span className={cn(
                'font-medium',
                isCodeTooLong ? 'text-red-600' : 'text-gray-600'
              )}>
                {codeLength.toLocaleString('pt-BR')}
              </span>
              <span className="text-gray-400">
                / {APP_CONFIG.maxCodeLength.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          <textarea
            id="code"
            {...register('code', {
              required: 'Paste your code here',
              maxLength: {
                value: APP_CONFIG.maxCodeLength,
                message: `Code cannot exceed ${APP_CONFIG.maxCodeLength} characters`
              },
              validate: {
                notEmpty: (value) => value.trim().length > 0 || 'Code cannot be empty'
              }
            })}
            className={cn(
              'form-input font-mono text-sm resize-none',
              isCodeTooLong && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            rows={15}
            placeholder={`Paste your ${LANGUAGE_CONFIG[watchedLanguage]?.label} code here...

Example:
def calculate_average(numbers):
    return sum(numbers) / len(numbers)

result = calculate_average([])`}
          />

          {errors.code && (
            <p className="form-error">{errors.code.message}</p>
          )}
        </div>

        {/* Optional description */}
        <div>
          <label htmlFor="description" className="form-label">
            Description (optional)
          </label>
          <textarea
            id="description"
            {...register('description', {
              maxLength: {
                value: APP_CONFIG.maxDescriptionLength,
                message: `Description cannot exceed ${APP_CONFIG.maxDescriptionLength} characters`
              }
            })}
            className="form-input resize-none"
            rows={3}
            placeholder="Briefly describe what your code does or specific context for review..."
          />
          {errors.description && (
            <p className="form-error">{errors.description.message}</p>
          )}
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Optional: Helps AI provide more contextualized feedback</span>
            <span>
              {watch('description')?.length || 0} / {APP_CONFIG.maxDescriptionLength}
            </span>
          </div>
        </div>

        {/* Submission error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-red-800 font-medium">Submission error</h4>
                <p className="text-red-700 text-sm mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">  
          <Button
            type="submit"
            loading={isSubmitting}
            icon={Send}
            size="lg"
            disabled={isCodeTooLong || isReviewInProgress}
          >
            {isSubmitting 
              ? 'Sending...' 
              : isReviewInProgress 
                ? 'Review in Progress...' 
                : 'Send for Review'
            }
          </Button>
        </div>
      </form>

        {/* Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-2">Tips for better feedback:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Include complete and executable code when possible</li>
            <li>• Add comments in complex parts</li>
            <li>• Describe the context or purpose of the code</li>
            <li>• Provide examples of expected input and output</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeSubmissionForm;
