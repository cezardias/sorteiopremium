import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Save, 
  TrendingUp, 
  AlertCircle,
  Layout,
  MousePointer2,
  CheckCircle2
} from 'lucide-react';

const RaffleUpsellModal = ({ raffle, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    rifas_id: raffle.id,
    qntd_cota: 1,
    price_cota: 0,
    price_total: 0,
    qntd_min: 1,
    qntd_max: 10,
    localizacao: 'checkout',
    status: 'ativo'
  });

  const fetchUpsell = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/admin/dashboard/upsell/${raffle.id}`);
      if (response.data && response.data.response && response.data.data) {
        const item = response.data.data[0] || {}; // Assuming one upsell per raffle as per current logic
        if (item.id) {
            setFormData({
                id: item.id,
                rifas_id: raffle.id,
                qntd_cota: item.qntd_cota || 1,
                price_cota: item.price_cota || 0,
                price_total: item.price_total || 0,
                qntd_min: item.qntd_min || 1,
                qntd_max: item.qntd_max || 10,
                localizacao: item.localizacao || 'checkout',
                status: item.status || 'ativo'
            });
        }
      }
    } catch (err) {
      console.error('Error fetching upsell:', err);
      // It's okay if not found, we start fresh
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUpsell();
  }, [raffle.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        // Auto-calculate total if cota or price changes
        if (name === 'qntd_cota' || name === 'price_cota') {
            newState.price_total = (newState.qntd_cota * newState.price_cota).toFixed(2);
        }
        return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // POST /admin/dashboard/upsell/cadastrar handles both new and edit via 'id' field in body
      const response = await api.post('/admin/dashboard/upsell/cadastrar', formData);
      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchUpsell();
      } else {
        setError(response.data?.msg || 'Erro ao salvar upsell.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <TrendingUp className="text-orange-500" /> Configuração de Upsell
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Sorteio: <span className="text-white">{raffle.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in duration-300">
              <CheckCircle2 size={18} /> Configuração salva com sucesso!
            </div>
          )}

          {fetching ? (
             <div className="text-center py-20 text-[10px] font-black text-gray-600 uppercase animate-pulse">Buscando configurações...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Quantidade de Cotas (Oferta)</label>
                        <input type="number" name="qntd_cota" value={formData.qntd_cota} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-orange-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-orange-500/50" required />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Valor Unitário no Upsell (R$)</label>
                        <input type="number" step="0.01" name="price_cota" value={formData.price_cota} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-green-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50" required />
                     </div>
                  </div>

                  <div className="p-6 bg-[#0f111a] rounded-3xl border border-[#2a2d3e] flex items-center justify-between">
                     <div>
                       <div className="text-[10px] font-black text-gray-600 uppercase mb-1">Total da Oferta Especial:</div>
                       <div className="text-2xl font-black text-white">R$ {parseFloat(formData.price_total).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                     </div>
                     <div className="bg-green-500/10 text-green-500 text-[10px] font-black uppercase px-4 py-2 rounded-xl">Desconto Aplicado</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#2a2d3e]">
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Localização da Oferta</label>
                        <select name="localizacao" value={formData.localizacao} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                           <option value="checkout">TELA DE CHECKOUT (CARRINHO)</option>
                           <option value="success_page">PÁGINA DE SUCESSO (PÓS-COMPRA)</option>
                           <option value="home">PÁGINA INICIAL (DESTAQUE)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Status do Upsell</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                           <option value="ativo">ATIVO & VISÍVEL</option>
                           <option value="inativo">DESATIVADO</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Quantidade Mínima p/ Exibir</label>
                        <input type="number" name="qntd_min" value={formData.qntd_min} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl" required />
                        <p className="text-[8px] text-gray-600 mt-2 uppercase font-bold tracking-tighter italic">O upsell só aparece se o usuário já tiver X cotas no carrinho.</p>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Quantidade Máxima p/ Exibir</label>
                        <input type="number" name="qntd_max" value={formData.qntd_max} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl" required />
                     </div>
                  </div>
               </div>

               <button type="submit" disabled={loading} className={`w-full bg-green-500 hover:bg-green-600 text-black font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-3xl transition-all shadow-xl shadow-green-500/10 flex items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-wait' : ''}`}>
                  <Save size={18} /> {loading ? 'Sincronizando...' : 'Salvar Configuração de Upsell'}
               </button>
            </form>
          )}
        </div>

        <div className="px-8 py-4 border-t border-[#2a2d3e] bg-[#0f111a]/50">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center leading-relaxed">
               O Upsell é uma poderosa ferramenta de faturamento. <br/>
               Ela oferece um pacote adicional de cotas com desconto no momento exato da compra.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RaffleUpsellModal;
