import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trophy, 
  Layers, 
  Package, 
  TrendingUp, 
  Image as ImageIcon,
  Pause,
  Play,
  Trash2,
  Users,
  Target,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

import RaffleEditModal from '../components/RaffleEditModal';
import RafflePrizesModal from '../components/RafflePrizesModal';
import RafflePackagesModal from '../components/RafflePackagesModal';
import RaffleUpsellModal from '../components/RaffleUpsellModal';
import RaffleImagesModal from '../components/RaffleImagesModal';
import RaffleNumbersModal from '../components/RaffleNumbersModal';
import DrawModal from '../components/DrawModal';

const Raffles = () => {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRifa, setSelectedRifa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Sub-Modals states
  const [isPrizesOpen, setIsPrizesOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [isNumbersOpen, setIsNumbersOpen] = useState(false);
  const [isDrawOpen, setIsDrawOpen] = useState(false);

  const fetchRifas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/todas-rifas');
      if (response.data && response.data.success) {
        setRifas(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar rifas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRifas();
    
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const confirmMsg = currentStatus === 'ativas' 
      ? 'Deseja realmente FINALIZAR este sorteio?' 
      : 'Deseja realmente ATIVAR este sorteio?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint = currentStatus === 'ativas' 
        ? `/admin/dashboard/rifa/finalizar/${id}`
        : `/admin/dashboard/rifa/ativar/${id}`;
      
      const response = await api.put(endpoint, {});
      if (response.data && (response.data.success || response.data.response)) {
        fetchRifas();
      }
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
    setOpenMenuId(null);
  };

  const handleEdit = (rifa) => {
    setSelectedRifa(rifa);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta rifa? Esta ação é irreversível.')) {
      try {
        await api.delete(`/admin/dashboard/rifa/excluir/${id}`);
        fetchRifas();
      } catch (error) {
        console.error('Erro ao excluir rifa:', error);
      }
    }
    setOpenMenuId(null);
  };

  const filteredRifas = rifas.filter(rifa => 
    rifa.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      ativas: 'bg-green-500/10 text-green-500 border-green-500/20',
      pausadas: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      finalizadas: 'bg-red-500/10 text-red-500 border-red-500/20',
      futuras: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.ativas}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-green-500 rounded-full"></div>
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em]">{rifas.length > 0 ? 'Gestão de Sorteios' : 'Novo Projeto'}</h1>
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] ml-5">Painel administrativo de alta performance</p>
        </div>
        <button 
          onClick={() => { setSelectedRifa(null); setIsModalOpen(true); }}
          className="bg-green-500 hover:bg-green-600 text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:scale-105"
        >
          <Plus size={18} strokeWidth={3} /> Criar Campanha
        </button>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Campanhas', value: rifas.length, icon: <BarChart3/>, color: 'blue' },
           { label: 'Ativas Agora', value: rifas.filter(r => r.status === 'ativas').length, icon: <Play/>, color: 'green' },
           { label: 'Sorteios/Mês', value: 0, icon: <Calendar/>, color: 'orange' },
           { label: 'Valor em Prêmios', value: 'R$ 0,00', icon: <Trophy/>, color: 'yellow' }
         ].map((stat, i) => (
           <div key={i} className="bg-[#1c1f2e] border border-[#2a2d3e] p-6 rounded-3xl flex items-center justify-between group hover:border-green-500/30 transition-all shadow-xl">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:rotate-12 transition-transform`}>
                 {React.cloneElement(stat.icon, { size: 24 })}
              </div>
           </div>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-[#141523] border border-[#2a2d3e] rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Table Filters */}
        <div className="p-8 border-b border-[#2a2d3e] bg-[#1c1f2e]/50 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative w-full md:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="LOCALIZAR CAMPANHA PELO TÍTULO..." 
                className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-[10px] font-bold px-14 py-5 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all uppercase tracking-widest placeholder:text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-[#2a2d3e]">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sincronização em tempo real</span>
              </div>
           </div>
        </div>

        {/* Custom Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f111a]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center w-20">ID</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Sorteio</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Faturamento</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center w-[250px]">Engajamento</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-10 h-24 bg-white/5 opacity-10"></td>
                  </tr>
                ))
              ) : filteredRifas.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-600">
                         <Search size={48} className="opacity-20" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum sorteio localizado</span>
                      </div>
                   </td>
                </tr>
              ) : filteredRifas.map((rifa) => (
                <tr key={rifa.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6 text-center">
                     <span className="text-[10px] font-black text-gray-600 font-mono">#{rifa.id}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#0f111a] border border-[#2a2d3e] overflow-hidden group-hover:border-green-500/50 transition-all duration-500">
                        <img 
                          src={rifa.img ? `https://sorteiospremiummultimarcas.com.br/api/public/img/rifas/${rifa.img}` : `https://via.placeholder.com/64?text=RIFA`} 
                          alt={rifa.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{rifa.title}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-black text-green-500">R$ {parseFloat(rifa.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                           <div className="w-1 h-1 rounded-full bg-gray-800"></div>
                           <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                             <Calendar size={10} /> {rifa.data_sortition ? new Date(rifa.data_sortition).toLocaleDateString('pt-BR') : 'A DEFINIR'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {getStatusBadge(rifa.status)}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-white">R$ {parseFloat(rifa.revenue_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                       <span className="text-[9px] font-black text-green-500/50 uppercase tracking-widest mt-1">Acumulado</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="w-full">
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Vendas:</span>
                          <span className="text-[10px] font-black text-green-500">{rifa.vendas_percent || 0}%</span>
                       </div>
                       <div className="w-full h-2 bg-black/40 border border-[#2a2d3e] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-[2000ms]" 
                            style={{ width: `${rifa.vendas_percent || 0}%` }}
                          />
                       </div>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-[8px] font-bold text-gray-600 uppercase italic">#{rifa.total_vendas || 0} confirmadas</span>
                          <span className="text-[8px] font-bold text-gray-600 uppercase italic">#{rifa.total_reservas || 0} reservas</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === rifa.id ? null : rifa.id);
                      }}
                      className={`w-12 h-12 flex justify-center items-center rounded-2xl transition-all duration-300 ${openMenuId === rifa.id ? 'bg-green-500 text-black rotate-90 scale-110 shadow-2xl' : 'bg-[#1c1f2e] text-white hover:bg-white/5'}`}
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {openMenuId === rifa.id && (
                      <div 
                        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 bg-[#141523] border border-[#2a2d3e] rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-3 w-72 backdrop-blur-2xl animate-in fade-in slide-in-from-right-8 duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {[
                            { label: 'Editar Campanha', icon: <Edit size={16}/>, onClick: () => handleEdit(rifa), color: 'blue' },
                            { label: 'Realizar Sorteio', icon: <Trophy size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsDrawOpen(true); setOpenMenuId(null); }, color: 'green' },
                            { label: 'Bilhetes Premiados', icon: <Trophy size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsPrizesOpen(true); setOpenMenuId(null); }, color: 'yellow' },
                            { label: 'Consultar Cota', icon: <Layers size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsNumbersOpen(true); setOpenMenuId(null); }, color: 'blue' },
                            { label: 'Pacotes de Desconto', icon: <Package size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsPackagesOpen(true); setOpenMenuId(null); }, color: 'purple' },
                            { label: 'Ofertas de Upsell', icon: <TrendingUp size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsUpsellOpen(true); setOpenMenuId(null); }, color: 'orange' },
                            { label: 'Galeria de Fotos', icon: <ImageIcon size={16}/>, onClick: () => { setSelectedRifa(rifa); setIsImagesOpen(true); setOpenMenuId(null); }, color: 'pink' },
                            { label: rifa.status === 'ativas' ? 'Interromper Sorteio' : 'Ativar Sorteio', icon: rifa.status === 'ativas' ? <Pause size={16}/> : <Play size={16}/>, onClick: () => handleToggleStatus(rifa.id, rifa.status), color: rifa.status === 'ativas' ? 'orange' : 'green' },
                            { label: 'Remover Permanentemente', icon: <Trash2 size={16}/>, onClick: () => handleDelete(rifa.id), color: 'red' },
                          ].map((item, idx) => (
                            <button 
                              key={idx}
                              onClick={item.onClick}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group/item"
                            >
                              <div className={`p-2 rounded-xl bg-${item.color}-500/10 text-${item.color}-500 group-hover/item:scale-125 transition-transform duration-300`}>
                                {item.icon}
                              </div>
                              <span className="text-[10px] font-black text-gray-400 group-hover/item:text-white uppercase tracking-widest">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        <div className="p-8 border-t border-[#2a2d3e] bg-[#0f111a]/50 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Base de Dados: {rifas.length} registros</span>
           </div>
           <div className="flex gap-2">
              <button className="w-12 h-12 flex justify-center items-center rounded-2xl border border-[#2a2d3e] text-gray-600 hover:text-white transition-all"><ChevronLeft size={20}/></button>
              <button className="w-12 h-12 flex justify-center items-center rounded-2xl bg-white text-black font-black text-[10px] shadow-xl">1</button>
              <button className="w-12 h-12 flex justify-center items-center rounded-2xl border border-[#2a2d3e] text-gray-600 hover:text-white transition-all"><ChevronRight size={20}/></button>
           </div>
        </div>
      </div>

      {/* MODALS PERSISTENCE LAYER */}
      {isModalOpen && (
        <RaffleEditModal 
          raffle={selectedRifa} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchRifas(); }} 
        />
      )}

      {isPrizesOpen && selectedRifa && (
        <RafflePrizesModal 
          raffle={selectedRifa} 
          onClose={() => setIsPrizesOpen(false)} 
        />
      )}

      {isPackagesOpen && selectedRifa && (
        <RafflePackagesModal 
          raffle={selectedRifa} 
          onClose={() => setIsPackagesOpen(false)} 
        />
      )}

      {isUpsellOpen && selectedRifa && (
        <RaffleUpsellModal 
          raffle={selectedRifa} 
          onClose={() => setIsUpsellOpen(false)} 
        />
      )}

      {isImagesOpen && selectedRifa && (
        <RaffleImagesModal 
          raffle={selectedRifa} 
          onClose={() => setIsImagesOpen(false)} 
        />
      )}

      {isNumbersOpen && selectedRifa && (
        <RaffleNumbersModal 
          raffle={selectedRifa} 
          onClose={() => setIsNumbersOpen(false)} 
        />
      )}

      {isDrawOpen && selectedRifa && (
        <DrawModal 
          isOpen={isDrawOpen}
          onClose={() => setIsDrawOpen(false)}
          raffle={selectedRifa}
        />
      )}

    </div>
  );
};

export default Raffles;
