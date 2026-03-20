import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Search, 
  User, 
  Hash, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const RaffleNumbersModal = ({ raffle, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setError('');
    
    try {
      // Endpoint typically returns information about the participant who owns the number
      const response = await api.get(`/admin/dashboard/consulta-cota/${raffle.id}?number=${searchTerm}`);
      if (response.data && response.data.success) {
        setResults(response.data.data);
      } else {
        setResults(null);
        setError(response.data?.msg || 'Número não encontrado ou disponível.');
      }
    } catch (err) {
      console.error('Search number error:', err);
      setError('Erro ao consultar número. Verifique se o número existe.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Hash className="text-blue-500" /> Consulta de Cotas
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Sorteio: <span className="text-white">{raffle.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
           {/* Search Input */}
           <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="number" 
                placeholder="DIGITE O NÚMERO DA COTA (EX: 1234)..."
                className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-black px-16 py-6 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={loading || !searchTerm}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Consultar'}
              </button>
           </form>

           {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
           )}

           {results ? (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#0f111a] flex items-center justify-center border border-[#2a2d3e]">
                         <Hash className="text-green-500" size={24} />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Número Consultado:</div>
                         <div className="text-2xl font-black text-white">{searchTerm}</div>
                      </div>
                   </div>
                   <div className="px-6 py-2 rounded-full bg-green-500 text-black text-[10px] font-black uppercase tracking-widest">
                      Pago & Confirmado
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-[#1c1f2e] p-6 rounded-3xl border border-[#2a2d3e] space-y-4">
                      <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <User size={14} /> Dados do Comprador
                      </h3>
                      <div>
                         <div className="text-xs font-black text-white uppercase">{results.client_name || 'Usuário'}</div>
                         <div className="text-[10px] font-bold text-gray-500 mt-1">{results.client_phone || '(00) 00000-0000'}</div>
                      </div>
                      <div className="pt-4 border-t border-[#2a2d3e]">
                         <div className="text-[8px] font-black text-gray-600 uppercase mb-1">E-mail:</div>
                         <div className="text-[10px] font-bold text-gray-400 break-all">{results.client_email || 'n/a'}</div>
                      </div>
                   </div>

                   <div className="bg-[#1c1f2e] p-6 rounded-3xl border border-[#2a2d3e] space-y-4">
                      <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <Clock size={14} /> Informações da Reserva
                      </h3>
                      <div>
                         <div className="text-[10px] font-black text-white uppercase">Pedido #{results.order_id || '0000'}</div>
                         <div className="flex items-center gap-2 mt-2">
                            <Calendar size={12} className="text-gray-600" />
                            <span className="text-[10px] font-bold text-gray-500">{results.created_at ? new Date(results.created_at).toLocaleString('pt-BR') : '--/--/--'}</span>
                         </div>
                      </div>
                      <div className="pt-4 border-t border-[#2a2d3e]">
                         <div className="text-[8px] font-black text-gray-600 uppercase mb-1">Gateway:</div>
                         <div className="text-[10px] font-black text-blue-400 uppercase">{results.gateway || 'PIX'}</div>
                      </div>
                   </div>
                </div>
             </div>
           ) : !loading && !error && (
             <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Search size={64} className="text-gray-600" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                   Aguardando consulta de número...
                </p>
             </div>
           )}
        </div>

        <div className="px-8 py-4 border-t border-[#2a2d3e] bg-[#0f111a]/50">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center leading-relaxed">
               Use esta ferramenta para identificar ganhadores ou verificar a validade de bilhetes físicos.<br/>
               Apenas números pagos aparecerão nesta consulta.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RaffleNumbersModal;
