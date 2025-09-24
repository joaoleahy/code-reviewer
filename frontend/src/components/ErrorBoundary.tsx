import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, Bug, Home } from 'lucide-react';
import Button from './UI/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Em produção, você enviaria este erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementar logging para serviços externos
    console.log('Logging error to external service:', { error, errorInfo });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private goHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                <Bug className="h-12 w-12 text-red-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Oops! Algo deu errado
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
              <div className="space-y-4">
                <Button
                  onClick={this.handleReload}
                  icon={RefreshCcw}
                  fullWidth
                >
                  Recarregar Página
                </Button>
                
                <Button
                  onClick={this.goHome}
                  icon={Home}
                  variant="outline"
                  fullWidth
                >
                  Voltar ao Início
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={this.handleReset}
                    variant="ghost"
                    fullWidth
                    className="text-sm"
                  >
                    Tentar Novamente (Dev)
                  </Button>
                )}
              </div>

              {/* Detalhes do erro apenas em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 pt-6 border-t border-gray-200">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Erro:</h4>
                      <pre className="text-sm bg-red-50 p-3 rounded border border-red-200 overflow-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">Stack Trace:</h4>
                        <pre className="text-sm bg-red-50 p-3 rounded border border-red-200 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
