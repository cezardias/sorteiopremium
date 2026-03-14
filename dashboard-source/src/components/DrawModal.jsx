import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Search, 
  Trophy, 
  User, 
  Hash, 
  Check, 
  AlertCircle,
  RefreshCcw,
  UserPlus,
  ArrowRight
} from 'lucide-react';

const DrawModal = ({ isOpen, onClose, raffle }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [winner, setWinner] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const [forceWinnerMode, setForceWinnerMode] = useState(false);
  const [forcePhone, setForcePhone] = useState('');
  const [forcing, setForcing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTicketNumber('');
      setWinner(null);
      setError(null);
      setForceWinnerMode(false);
      setForcePhone('');
    }
  }, [isOpen]);

  const handleSearchWinner = async () => {
    if (!ticketNumber) return;
    try {
      setSearching(true);
      setError(null);
      setWinner(null);
      setForceWinnerMode(false);
      
      const response = await api.post('/admin/dashboard/rifa/procurar-numero-premiado/procurar-ganhador', {
        numeroWinner: ticketNumber,
        rifa_id: raffle.id
      });
      
      if (response.data && response.data.success) {
        setWinner(response.data.data);
      }
    } catch (error) {
      console.error('Error searching winner:', error);
      if (error.response?.status === 404) {
        setError('Este número ainda não foi vendido ou não tem um proprietário ativo.');
      } else {
        setError('Ocorreu um erro ao buscar o ganhador.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleForceWinner = async (e) => {
    e.preventDefault();
    if (!forcePhone) return;
    
    if (!window.confirm(`Isso irá trocar os números e forçar que o cliente do telefone ${forcePhone} seja o dono do número ${ticketNumber}. Deseja continuar?`)) return;

    try {
      setForcing(true);
      const response = await api.post('/admin/dashboard/rifa/definir-ganhador', {
        numeroSorteado: ticketNumber,
        novoGanhadorPhone: forcePhone,
        rifa_id: raffle.id
      });
      
      if (response.data && response.data.success) {
        alert('Ganhador definido com sucesso!');
        handleSearchWinner(); // Refresh to show the new winner
      }
    } catch (error) {
      console.error('Error forcing winner:', error);
      alert(error.response?.data?.msg || 'Erro ao definir ganhador.');
    } finally {
      setForcing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#141523] w-full max-w-lg rounded-3xl border border-[#2a2d3e] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#1c1f2e]">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Realizar Sorteio
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{raffle?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Insira o Número Sorteado (Loteria Federal)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="number" 
                  placeholder="Ex: 12345" 
                  className="input-field pl-10 py-3 text-xs"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                />
              </div>
              <button 
                onClick={handleSearchWinner}
                disabled={searching || !ticketNumber}
                className="bg-green-500 hover:bg-green-600 text-black px-6 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {searching ? <RefreshCcw className="animate-spin" size={16} /> : <Search size={16} />} 
                {searching ? 'Buscando...' : 'Buscar Ganhador'}
              </button>
            </div>
          </div>

          <div className="min-h-[120px] flex items-center justify-center border border-dashed border-[#2a2d3e] rounded-3xl p-6 bg-[#0f111a]">
            {!winner && !error && !searching && (
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center">
                Aguardando número para consulta...
              </p>
            )}

            {winner && (
              <div className="w-full animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                    <User size={30} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{winner.client?.name} {winner.client?.surname}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Check size={12} /> Ganhador Identificado
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                      TEL: {winner.client?.cellphone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tighter">#{ticketNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-2 text-yellow-500">
                  <AlertCircle size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px] leading-relaxed">
                    {error}
                  </p>
                </div>
                {!forceWinnerMode && (
                  <button 
                    onClick={() => setForceWinnerMode(true)}
                    className="text-[9px] font-black text-green-500 uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto"
                  >
                    <UserPlus size={14} /> Forçar Ganhador Manualmente
                  </button>
                )}
              </div>
            )}
          </div>

          {forceWinnerMode && (
            <form onSubmit={handleForceWinner} className="space-y-4 pt-4 border-t border-[#2a2d3e] animate-in slide-in-from-top-4 duration-500">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Celular do Novo Ganhador</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    required
                    type="text" 
                    placeholder="DDD + Telefone (Somente números)" 
                    className="input-field pl-10 py-3 text-xs border-green-500/30"
                    value={forcePhone}
                    onChange={(e) => setForcePhone(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={forcing || !forcePhone}
                  className="bg-white hover:bg-gray-200 text-black px-6 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {forcing ? <RefreshCcw className="animate-spin" size={16} /> : <Check size={16} />}
                  Confirmar Troca
                </button>
              </div>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                * Aviso: A lógica do sistema irá substituir o número sorteado (#{ticketNumber}) no cadastro deste cliente para garantir a vitória legal conforme sua ação.
              </p>
            </form>
          )}

          {winner && (
            <div className="pt-4 border-t border-[#2a2d3e] flex justify-center">
              <button 
                onClick={() => {
                  /* Lógica opcional para enviar zap ou similar */
                  alert('Notificação enviada ao cliente! (Simulação)');
                }}
                className="text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-green-500 flex items-center gap-2 transition-colors"
              >
                Notificar Ganhador <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawModal;
