import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Trophy, User, FileText, Menu, X, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../../api/api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('client_token');
  const isLoggedIn = !!token;
  const [logo, setLogo] = React.useState("https://api.sorteiospremiummultimarcas.com.br/img/logos/logo_dark_68ccdd8e977f5.png");

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/public-settings');
        if (response.data.success && response.data.data?.logo_dark) {
          setLogo(response.data.data.logo_dark);
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    window.location.href = '/';
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Produtos', path: '/produtos', icon: ShoppingBag },
    { name: 'Ganhadores', path: '/ganhadores', icon: Trophy },
    ...(isLoggedIn ? [
      { name: 'Meu Perfil', path: '/perfil', icon: User },
      { name: 'Meus Pedidos', path: '/pedidos', icon: FileText },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img src={logo} alt="Premium Multimarcas" className="h-14 w-auto transform hover:scale-105 transition-transform" />
              </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(29,185,84,0.15)]" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}
              
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest bg-primary text-black hover:bg-secondary transition-all shadow-lg shadow-primary/20"
                >
                  <User size={16} />
                  Entrar
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-accent hover:bg-accent/5 transition-all"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-secondary border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}

            {!isLoggedIn ? (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-black uppercase tracking-widest bg-primary text-black"
              >
                <User size={20} />
                Entrar
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold uppercase tracking-widest text-accent w-full text-left"
              >
                <LogOut size={20} />
                Sair da Conta
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
