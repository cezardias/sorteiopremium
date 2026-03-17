import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-secondary border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black italic tracking-widest text-white mb-2">
              PREMIUM MULTIMARCAS
            </h3>
            <p className="text-primary font-bold uppercase tracking-tight text-sm">
              Realizando sonhos!
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="https://wa.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
            >
              <MessageCircle size={24} />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
            © {currentYear} Premium Multimarcas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
