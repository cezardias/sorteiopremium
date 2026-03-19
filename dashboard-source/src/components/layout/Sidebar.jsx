import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, 
  ShoppingCart, 
  RefreshCcw, 
  Users, 
  Award, 
  Gift, 
  Settings, 
  LogOut,
  Share2 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#141523] h-screen fixed left-0 top-0 border-r border-[#2a2d3e] flex flex-col">
      <div className="p-6 border-b border-[#2a2d3e] mb-6 flex justify-center">
        <Link to="/dashboard">
          <img src="/assets/images/logos/logo.png" alt="Premium Multimarcas" className="h-12 w-auto" />
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <NavLink to="/dashboard" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <BarChart size={18} /> DASHBOARD
        </NavLink>
        <NavLink to="/dashboard/vendas" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <ShoppingCart size={18} /> VENDAS
        </NavLink>
        <NavLink to="/dashboard/sorteios" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <RefreshCcw size={18} /> SORTEIOS
        </NavLink>
        <NavLink to="/dashboard/pedidos" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <ShoppingCart size={18} /> PEDIDOS
        </NavLink>
        <NavLink to="/dashboard/clientes" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Users size={18} /> CLIENTES
        </NavLink>
        <NavLink to="/dashboard/ranking" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Award size={18} /> RANKING
        </NavLink>
        <NavLink to="/dashboard/ganhadores" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Gift size={18} /> GANHADORES
        </NavLink>
        <NavLink to="/dashboard/afiliados" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Share2 size={18} /> AFILIADOS
        </NavLink>
        <div className="pt-4 pb-2 px-4">
          <p className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">Configurações</p>
        </div>
        <NavLink to="/dashboard/usuarios" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Users size={18} /> USUÁRIOS
        </NavLink>
        <NavLink to="/dashboard/site" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Settings size={18} /> SITE
        </NavLink>
        <NavLink to="/dashboard/pagamentos" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Settings size={18} /> CONF. PAGAMENTOS
        </NavLink>
        <NavLink to="/dashboard/perfil" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Users size={18} /> MEUS DADOS
        </NavLink>
        <NavLink to="/dashboard/whatsapp" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs tracking-widest transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <ShoppingCart size={18} /> ENVIAR MENSAGENS VIA WHATSAPP
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-[#2a2d3e]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-xs tracking-widest uppercase"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
