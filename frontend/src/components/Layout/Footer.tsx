import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { APP_CONFIG, LINKS } from '../../utils/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo e informações */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Feito com</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>para desenvolvedores</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {APP_CONFIG.description} • v{APP_CONFIG.version}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href={LINKS.docs}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Documentação</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <a
              href={LINKS.api}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>API</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <a
              href={LINKS.support}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Suporte</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400">
            © 2023 AI Code Reviewer. Todos os direitos reservados.
          </div>
        </div>

        {/* Tech stack info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>React + TypeScript</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>FastAPI + Python</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>MongoDB</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>OpenAI GPT</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
