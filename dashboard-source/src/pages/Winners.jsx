import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Trophy, 
  Trash2, 
  Plus, 
  Trophy as TrophyIcon,
  Ticket,
  User,
  ExternalLink,
  RefreshCcw,
  Calendar
} from 'lucide-react';
import WinnerModal from '../components/WinnerModal';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Public endpoint for listing (as seen in routes)
      const response = await api.get('/produtos/todos/ganhadores');
      
      // Load raffles for the modal
      const rafflesRes = await api.get('/admin/dashboard/todas-rifas');
      
      if (response.data && response.data.success) {
        setWinners(response.data.data);
      }
      if (rafflesRes.data && rafflesRes.data.success) {
        setRaffles(rafflesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este ganhador do histórico?')) return;
    try {
      const response = await api.delete(`/admin/dashboard/delete/ganhador/${id}`);
      if (response.data && response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting winner:', error);
      alert('Erro ao excluir ganhador.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <TrophyIcon className="text-yellow-500" /> HISTÓRICO DE GANHADORES
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total de {winners.length} vencedores registrados</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
        >
          <Plus size={16} /> Novo Ganhador
        </button>
      </div>

      {loading && winners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCcw className="animate-spin text-green-500 mb-4" size={40} />
          <p className="text-gray-500 font-black uppercase tracking-widest text-sm animate-pulse">Buscando Hall da Fama...</p>
        </div>
      ) : winners.length === 0 ? (
        <div className="bg-[#141523] rounded-3xl border border-[#2a2d3e] p-20 text-center">
          <div className="w-16 h-16 bg-[#1c1f2e] text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2a2d3e]">
            <Trophy size={32} />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Nenhum ganhador registrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {winners.map((winner) => (
            <div key={winner.id} className="group bg-[#141523] rounded-3xl border border-[#2a2d3e] overflow-hidden hover:border-green-500/30 transition-all duration-500 hover:scale-[1.02] shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={`/api/public/img/rifas/${winner.img}`} 
                  alt={winner.client?.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400/141523/52525b?text=SEM+FOTO';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0f111a] to-transparent">
                  <span className="px-2 py-1 bg-yellow-500 text-black text-[9px] font-black uppercase rounded-lg shadow-lg">
                    Vencedor
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(winner.id)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <User size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                      {winner.client?.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{winner.client?.cellphone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#0f111a] rounded-xl border border-[#2a2d3e]">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sorteio</span>
                    <span className="text-[10px] font-bold text-white uppercase line-clamp-1 text-right max-w-[120px]">
                      {winner.rifa?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0f111a] rounded-xl border border-[#2a2d3e]">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cota</span>
                    <span className="flex items-center gap-1 text-[11px] font-black text-green-500">
                      <Ticket size={12} /> {winner.ticket}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  {new Date(winner.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WinnerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        raffles={raffles}
      />
    </div>
  );
};

export default Winners;
