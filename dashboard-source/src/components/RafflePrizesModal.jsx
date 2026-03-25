import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Trophy, 
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  CheckCircle2
} from 'lucide-react';

const RafflePrizesModal = ({ raffle, onClose }) => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  const [formData, setFormData] = useState({
    rifas_id: raffle.id,
    qntd_cota: '',
    award: '',
    show_site: 'sim',
    status: 'disponivel'
  });

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard/bilhete-premiado/all/${raffle.id}`);
      if (response.data && response.data.success) {
        // Handle direct array or Laravel Paginator object
        const data = response.data.data;
        if (Array.isArray(data)) {
          setPrizes(data);
        } else if (data && Array.isArray(data.data)) {
          setPrizes(data.data);
        } else {
          setPrizes([]);
        }
      }
    } catch (err) {
      console.error('Error fetching prizes:', err);
      setError('Falha ao carregar bilhetes premiados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, [raffle.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let response;
      if (editingPrize) {
        response = await api.put('/admin/dashboard/bilhete-premiado/editar', {
          ...formData,
          id: editingPrize.id
        });
      } else {
        response = await api.post('/admin/dashboard/bilhete-premiado/cadastrar', formData);
      }

      if (response.data && response.data.success) {
        setShowAddForm(false);
        setEditingPrize(null);
        setFormData({
          rifas_id: raffle.id,
          qntd_cota: '',
          award: '',
          show_site: 'sim',
          status: 'disponivel'
        });
        fetchPrizes();
      } else {
        setError(response.data?.msg || 'Erro ao salvar bilhete.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro na comunicação com o servidor.');
    }
  };

  const handleEdit = (prize) => {
    setEditingPrize(prize);
    setFormData({
      rifas_id: raffle.id,
      qntd_cota: prize.number_cota,
      award: prize.award,
      show_site: prize.show_site,
      status: prize.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este bilhete premiado?')) return;
    try {
      const response = await api.delete(`/admin/dashboard/bilhete-premiado/delete/${id}/${raffle.id}`);
      if (response.data && response.data.success) {
        fetchPrizes();
      }
    } catch (err) {
      setError('Erro ao excluir bilhete.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Trophy className="text-yellow-500" /> Bilhetes Premiados
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

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6 mb-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
                   {editingPrize ? 'Editar Bilhete' : 'Novo Bilhete Premiado'}
                 </h3>
                 <button type="button" onClick={() => {setShowAddForm(false); setEditingPrize(null);}} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Cancelar</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Número da Cota</label>
                  <input 
                    type="number" 
                    name="qntd_cota" 
                    value={formData.qntd_cota} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f111a] border border-[#2a2d3e] text-yellow-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-yellow-500/50" 
                    placeholder="000000"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Prêmio / Descrição</label>
                  <input 
                    type="text" 
                    name="award" 
                    value={formData.award} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" 
                    placeholder="Ex: iPhone 15 Pro Max"
                    required 
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Exibir no Site?</label>
                   <select name="show_site" value={formData.show_site} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                      <option value="sim">SIM (PÚBLICO)</option>
                      <option value="nao">NÃO (OCULTO)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Status Inicial</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                      <option value="disponivel">DISPONÍVEL</option>
                      <option value="premiado">JÁ PREMIADO</option>
                   </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl transition-all shadow-lg shadow-green-500/10">
                {editingPrize ? 'Atualizar Bilhete' : 'Salvar Bilhete Premiado'}
              </button>
            </form>
          ) : (
            <button onClick={() => setShowAddForm(true)} className="w-full border-2 border-dashed border-[#2a2d3e] hover:border-green-500/50 hover:bg-green-500/5 text-gray-500 hover:text-green-500 py-6 rounded-3xl transition-all flex flex-col items-center gap-2 mb-8 group">
               <Plus size={24} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Novo Bilhete</span>
            </button>
          )}

          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Bilhetes Cadastrados ({prizes.length})</h3>
             
             {loading ? (
                <div className="text-center py-10 text-[10px] font-black text-gray-600 uppercase animate-pulse">Consultando banco de dados...</div>
             ) : prizes.length === 0 ? (
                <div className="text-center py-10 text-[10px] font-black text-gray-700 uppercase italic">Nenhum bilhete premiado configurado.</div>
             ) : (
                <div className="space-y-3">
                  {prizes.map((prize) => (
                    <div key={prize.id} className="bg-[#1c1f2e] border border-[#2a2d3e] p-5 rounded-2xl flex items-center justify-between group hover:border-[#3a3d5e] transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-xl bg-[#0f111a] flex items-center justify-center border border-[#2a2d3e]">
                             <span className="text-yellow-500 font-black text-xs">{prize.number_cota}</span>
                          </div>
                          <div>
                             <div className="text-xs font-black text-white uppercase truncate max-w-[200px]">{prize.award}</div>
                             <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${prize.status === 'premiado' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                   {prize.status}
                                </span>
                                {prize.show_site === 'sim' ? <Eye size={12} className="text-gray-500" title="Visível no site" /> : <EyeOff size={12} className="text-red-500" title="Oculto" />}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <button onClick={() => handleEdit(prize)} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Editar">
                             <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(prize.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all" title="Excluir">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-[#2a2d3e] bg-[#0f111a]/50 flex justify-center">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center leading-relaxed">
               As cotas premiadas são reservadas automaticamente no momento que alguém<br/>
               comprar o número correspondente.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RafflePrizesModal;
