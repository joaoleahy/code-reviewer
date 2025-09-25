import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Moon, Sun } from 'lucide-react';
import { getLanguageConfig } from '../../utils/helpers';
import { ProgrammingLanguage } from '../../types/api';
import Button from './Button';

interface CodeHighlightProps {
  code: string;
  language: ProgrammingLanguage | string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showThemeToggle?: boolean;
  maxHeight?: string;
  className?: string;
}

const CodeHighlight: React.FC<CodeHighlightProps> = ({
  code,
  language,
  showLineNumbers = true,
  showCopyButton = true,
  showThemeToggle = true,
  maxHeight = '400px',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  const languageConfig = getLanguageConfig(language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {languageConfig.label}
          </span>
          <span className="text-xs text-gray-500">
            {code.split('\n').length} lines
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {showThemeToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={isDarkTheme ? Sun : Moon}
              title={isDarkTheme ? 'Light theme' : 'Dark theme'}
            />
          )}
          
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              icon={copied ? Check : Copy}
              title={copied ? 'Copied!' : 'Copy code'}
              className={copied ? 'text-green-600' : ''}
            />
          )}
        </div>
      </div>

      <div 
        className="relative overflow-auto rounded-b-lg"
        style={{ maxHeight }}
      >
        <SyntaxHighlighter
          language={languageConfig.highlightLanguage}
          style={isDarkTheme ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '14px',
            lineHeight: '1.5',
            borderRadius: '0 0 8px 8px'
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDarkTheme ? '#6b7280' : '#9ca3af'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      
      {copied && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-10 flex items-center justify-center rounded-lg transition-opacity duration-200">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Check className="h-4 w-4" />
            <span>Copied!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const InlineCode: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <code className={`bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono ${className}`}>
    {children}
  </code>
);

export const CodeDiff: React.FC<{
  oldCode: string;
  newCode: string;
  language: ProgrammingLanguage | string;
}> = ({ oldCode, newCode, language }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Before</h4>
      <CodeHighlight 
        code={oldCode} 
        language={language} 
        showCopyButton={false}
        showThemeToggle={false}
      />
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">After</h4>
      <CodeHighlight 
        code={newCode} 
        language={language} 
        showCopyButton={false}
        showThemeToggle={false}
      />
    </div>
  </div>
);

export default CodeHighlight;
