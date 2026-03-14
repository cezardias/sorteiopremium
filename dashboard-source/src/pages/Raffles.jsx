import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  RefreshCcw, 
  Search, 
  Edit, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  Layers,
  Trophy
} from 'lucide-react';
import RaffleEditModal from '../components/RaffleEditModal';
import DrawModal from '../components/DrawModal';

const Raffles = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/todas-rifas');
      if (response.data && response.data.success) {
        setRaffles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const action = currentStatus === 'ativas' ? 'finalizar' : 'ativar';
    const confirmMsg = currentStatus === 'ativas' 
      ? 'Deseja realmente FINALIZAR este sorteio?' 
      : 'Deseja realmente ATIVAR este sorteio?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint = currentStatus === 'ativas' 
        ? `/admin/dashboard/rifa/finalizar/${id}`
        : `/admin/dashboard/rifa/ativar/${id}`;
      
      const response = await api.get(endpoint); // Backend uses GET for these toggles
      if (response.data && response.data.response) {
        fetchRaffles();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Erro ao alterar status do sorteio.');
    }
  };

  const handleEditClick = (raffle) => {
    setSelectedRaffle(raffle);
    setEditModalOpen(true);
  };

  const handleDrawClick = (raffle) => {
    setSelectedRaffle(raffle);
    setDrawModalOpen(true);
  };

  const filteredRaffles = raffles.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      ativas: 'bg-green-500/10 text-green-500 border-green-500/20',
      finalizadas: 'bg-red-500/10 text-red-500 border-red-500/20',
      pausadas: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      futuras: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles.pausadas}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw className="text-green-500" /> SORTEIOS
        </h1>
        
        <div className="w-1/3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por título..." 
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest animate-pulse">
            Carregando sorteios...
          </div>
        ) : filteredRaffles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
            Nenhum sorteio encontrado.
          </div>
        ) : (
          filteredRaffles.map((raffle) => (
            <div key={raffle.id} className="bg-[#141523] rounded-xl border border-[#2a2d3e] overflow-hidden hover:border-green-500/50 transition-all group">
              {/* Header Card */}
              <div className="p-5 border-b border-[#2a2d3e] flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-200 uppercase text-sm mb-2 line-clamp-1">{raffle.title}</h3>
                  {getStatusBadge(raffle.status)}
                </div>
                <button 
                  onClick={() => handleEditClick(raffle)}
                  className="p-2 bg-[#1e2130] text-gray-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-gray-600"
                >
                  <Edit size={16} />
                </button>
              </div>

              {/* Stats Card */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f111a] p-3 rounded-lg border border-[#2a2d3e]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Total Faturado</span>
                    <span className="text-sm font-black text-green-500">
                      R$ {parseFloat(raffle.fat_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="bg-[#0f111a] p-3 rounded-lg border border-[#2a2d3e]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Hoje</span>
                    <span className="text-sm font-black text-blue-400">
                      R$ {parseFloat(raffle.fat_hoje || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-400">Progresso de Vendas</span>
                    <span className="text-green-500">{raffle.qntd_numeros} / {raffle.cota?.qntd_cota}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0f111a] rounded-full overflow-hidden border border-[#2a2d3e]">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                      style={{ width: `${Math.min(100, (raffle.qntd_numeros / (raffle.cota?.qntd_cota || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                    <span>Reservados: {raffle.qntd_numeros_reservado}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-4 bg-[#0f111a]/50 border-t border-[#2a2d3e] flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase italic">
                    {raffle.data_sortition ? new Date(raffle.data_sortition).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDrawClick(raffle)}
                    className="p-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg transition-all border border-yellow-500/20"
                    title="Realizar Sorteio"
                  >
                    <Trophy size={14} />
                  </button>
                  <button 
                    onClick={() => handleStatusToggle(raffle.id, raffle.status)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      raffle.status === 'ativas' 
                      ? 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white' 
                      : 'text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {raffle.status === 'ativas' ? (
                      <><XCircle size={14} /> Finalizar</>
                    ) : (
                      <><CheckCircle size={14} /> Ativar</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editModalOpen && (
        <RaffleEditModal 
          raffle={selectedRaffle} 
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => {
            setEditModalOpen(false);
            fetchRaffles();
          }} 
        />
      )}

      {drawModalOpen && (
        <DrawModal 
          raffle={selectedRaffle}
          isOpen={drawModalOpen}
          onClose={() => setDrawModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Raffles;
