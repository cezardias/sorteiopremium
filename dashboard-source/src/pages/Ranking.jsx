import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Trophy, 
  Search, 
  Filter, 
  RefreshCcw, 
  User, 
  Phone, 
  Ticket, 
  Calendar,
  Medal,
  Crown
} from 'lucide-react';
import { clsx } from 'clsx';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rifas_id: '',
    startDate: '',
    endDate: '',
    total_numbers: ''
  });

  const fetchData = async (isFilter = false) => {
    try {
      setLoading(true);
      
      // Load raffles list once
      if (raffles.length === 0) {
        const rafflesRes = await api.get('/admin/dashboard/todas-rifas');
        if (rafflesRes.data && rafflesRes.data.success) {
          setRaffles(rafflesRes.data.data);
        }
      }

      const endpoint = isFilter ? '/admin/dashboard/ranking-geral/filtro' : '/admin/dashboard/ranking-geral';
      const response = isFilter 
        ? await api.post(endpoint, filters)
        : await api.get(endpoint);

      if (response.data && response.data.success) {
        const data = response.data.data;
        setRanking(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData(true);
  };

  const getRankStyle = (index) => {
    if (index === 0) return {
      container: 'bg-yellow-500/10 border-yellow-500/30',
      icon: <Crown className="text-yellow-500" size={24} />,
      text: 'text-yellow-500',
      tag: '1º Lugar'
    };
    if (index === 1) return {
      container: 'bg-slate-300/10 border-slate-300/30',
      icon: <Medal className="text-slate-300" size={22} />,
      text: 'text-slate-300',
      tag: '2º Lugar'
    };
    if (index === 2) return {
      container: 'bg-orange-400/10 border-orange-400/30',
      icon: <Medal className="text-orange-400" size={20} />,
      text: 'text-orange-400',
      tag: '3º Lugar'
    };
    return {
      container: 'bg-[#1c1f2e] border-[#2a2d3e]',
      icon: <span className="text-gray-500 font-black italic">{index + 1}º</span>,
      text: 'text-gray-400',
      tag: `${index + 1}º Lugar`
    };
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Trophy className="text-yellow-500" /> RANKING DE COMPRADORES
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Identifique os clientes mais engajados</p>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 bg-[#141523] p-4 rounded-xl border border-[#2a2d3e] w-full lg:w-auto">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Sorteio Específico</label>
            <select 
              className="input-field py-1.5 text-[10px] font-bold uppercase"
              value={filters.rifas_id}
              onChange={(e) => setFilters({...filters, rifas_id: e.target.value})}
            >
              <option value="">TODOS OS SORTEIOS</option>
              {raffles.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Início</label>
            <input 
              type="date" 
              className="input-field py-1.5 text-[10px] font-bold"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div className="w-32">
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Fim</label>
            <input 
              type="date" 
              className="input-field py-1.5 text-[10px] font-bold"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-black h-[35px] px-6 rounded-lg font-black text-[10px] uppercase transition-all flex items-center gap-2"
          >
            <Search size={14} /> Filtrar
          </button>
          <button 
            type="button"
            onClick={() => {
              setFilters({rifas_id: '', startDate: '', endDate: '', total_numbers: ''});
              fetchData();
            }}
            className="h-[35px] w-[35px] flex items-center justify-center bg-[#1c1f2e] border border-[#2a2d3e] text-gray-400 hover:text-white rounded-lg transition-all"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Trophy className="animate-bounce text-yellow-500/20 mb-4" size={48} />
          <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse text-sm">Calculando Ranking...</p>
        </div>
      ) : ranking.length === 0 ? (
        <div className="bg-[#141523] rounded-2xl border border-[#2a2d3e] p-20 text-center">
          <p className="text-gray-500 font-black uppercase tracking-widest">Nenhum dado encontrado para o filtro selecionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ranking.map((item, index) => {
            const style = getRankStyle(index);
            return (
              <div 
                key={index} 
                className={clsx(
                  "flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border transition-all hover:scale-[1.01] duration-300",
                  style.container
                )}
              >
                {/* Position and Icon */}
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                  {style.icon}
                  <span className={clsx("text-[10px] font-black uppercase tracking-widest mt-2", style.text)}>
                    {style.tag}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0f111a] border border-[#2a2d3e] flex items-center justify-center">
                      <User className="text-gray-500" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-1">
                        {item.client?.name} {item.client?.surname}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold">
                          <Phone size={12} className="text-green-500" /> {item.client?.cellphone}
                        </span>
                        {item.client?.email && (
                          <span className="text-[11px] text-gray-600 font-bold lowercase">
                            {item.client?.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider - Tablet/Desktop only */}
                  <div className="hidden md:block w-px h-10 bg-[#2a2d3e]"></div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-8 flex-1 w-full md:w-auto">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase block mb-1 tracking-widest">Total Comprado</span>
                      <div className="flex items-center gap-2">
                        <Ticket className="text-blue-500" size={16} />
                        <span className="text-xl font-black text-white">{item.total_numbers}</span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Cotas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge for High Performers */}
                {index < 3 && (
                  <div className={clsx(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    index === 0 ? "bg-yellow-500 text-black border-yellow-400" :
                    index === 1 ? "bg-slate-300 text-black border-slate-200" :
                    "bg-orange-500 text-black border-orange-400"
                  )}>
                    TOP VIP
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Ranking;
