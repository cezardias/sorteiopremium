import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  ShoppingCart, 
  RefreshCcw, 
  Users, 
  Award, 
  Gift, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#141523] h-screen fixed left-0 top-0 border-r border-[#2a2d3e] flex flex-col">
      <div className="p-6 border-b border-[#2a2d3e] mb-6 flex justify-center">
        {/* Mock Logo Space */}
        <h1 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
          PREMIUM MULTIMARCAS
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/dashboard" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <BarChart size={20} /> DASHBOARD
        </NavLink>
        <NavLink to="/dashboard/vendas" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <ShoppingCart size={20} /> VENDAS
        </NavLink>
        <NavLink to="/dashboard/sorteios" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <RefreshCcw size={20} /> SORTEIOS
        </NavLink>
        <NavLink to="/dashboard/pedidos" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <ShoppingCart size={20} /> PEDIDOS
        </NavLink>
        <NavLink to="/dashboard/clientes" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Users size={20} /> CLIENTES
        </NavLink>
        <NavLink to="/dashboard/ranking" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Award size={20} /> RANKING
        </NavLink>
        <NavLink to="/dashboard/ganhadores" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Gift size={20} /> GANHADORES
        </NavLink>
        <NavLink to="/dashboard/configurações" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#1db954] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1e2130]'}`}>
          <Settings size={20} /> CONFIGURAÇÕES
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-[#2a2d3e]">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
          <LogOut size={20} /> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
