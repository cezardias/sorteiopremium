import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  AlertCircle,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';

const RafflePackagesModal = ({ raffle, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [formData, setFormData] = useState({
    rifas_id: raffle.id,
    qntd_cota: '',
    value_cota: '',
    popular: 'nao',
    status: 'ativo'
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard/todos-pacotes/${raffle.id}`);
      if (response.data && response.data.success) {
        // Handle direct array or Laravel Paginator object
        const data = response.data.data;
        if (Array.isArray(data)) {
          setPackages(data);
        } else if (data && Array.isArray(data.data)) {
          setPackages(data.data);
        } else {
          setPackages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Falha ao carregar pacotes de desconto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
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
      if (editingPackage) {
        response = await api.put('/admin/dashboard/pacotes/editar', {
          ...formData,
          id: editingPackage.id
        });
      } else {
        response = await api.post('/admin/dashboard/pacote/cadastrar', formData);
      }

      if (response.data && response.data.success) {
        setShowAddForm(false);
        setEditingPackage(null);
        setFormData({
            rifas_id: raffle.id,
            qntd_cota: '',
            value_cota: '',
            popular: 'nao',
            status: 'ativo'
        });
        fetchPackages();
      } else {
        setError(response.data?.msg || 'Erro ao salvar pacote.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro na comunicação com o servidor.');
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      rifas_id: raffle.id,
      qntd_cota: pkg.qntd_cota,
      value_cota: pkg.value_cota,
      popular: pkg.popular,
      status: pkg.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este pacote de desconto?')) return;
    try {
        // DELETE /admin/dashboard/pacotes/deletar/{id}
      const response = await api.delete(`/admin/dashboard/pacotes/deletar/${id}`);
      if (response.data && response.data.success) {
        fetchPackages();
      }
    } catch (err) {
      setError('Erro ao excluir pacote.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Package className="text-purple-500" /> Pacotes de Desconto
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
                   {editingPackage ? 'Editar Pacote' : 'Novo Pacote de Desconto'}
                 </h3>
                 <button type="button" onClick={() => {setShowAddForm(false); setEditingPackage(null);}} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Cancelar</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Quantidade de Números</label>
                  <input 
                    type="number" 
                    name="qntd_cota" 
                    value={formData.qntd_cota} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f111a] border border-[#2a2d3e] text-purple-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-purple-500/50" 
                    placeholder="Ex: 100"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Valor Total do Combo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="value_cota" 
                    value={formData.value_cota} 
                    onChange={handleChange} 
                    className="w-full bg-[#0f111a] border border-[#2a2d3e] text-green-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50" 
                    placeholder="Ex: 50,00"
                    required 
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Destaque "Popular"?</label>
                   <select name="popular" value={formData.popular} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                      <option value="nao">NÃO</option>
                      <option value="sim">SIM (SELADO)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Status</label>
                   <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                      <option value="ativo">ATIVO</option>
                      <option value="inativo">INATIVO</option>
                   </select>
                </div>
              </div>

              <div className="bg-[#0f111a] p-4 rounded-2xl border border-[#2a2d3e]">
                 <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Preço unitário no pacote:</div>
                 <div className="text-xs font-black text-white">
                   {formData.qntd_cota > 0 && formData.value_cota > 0 
                     ? `R$ ${(formData.value_cota / formData.qntd_cota).toLocaleString('pt-BR', {minimumFractionDigits: 2})} cada cota`
                     : 'Aguardando valores...'}
                 </div>
              </div>

              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-black font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl transition-all shadow-lg shadow-green-500/10">
                {editingPackage ? 'Atualizar Pacote' : 'Salvar Pacote de Desconto'}
              </button>
            </form>
          ) : (
            <button onClick={() => setShowAddForm(true)} className="w-full border-2 border-dashed border-[#2a2d3e] hover:border-green-500/50 hover:bg-green-500/5 text-gray-500 hover:text-green-500 py-6 rounded-3xl transition-all flex flex-col items-center gap-2 mb-8 group">
               <Plus size={24} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cadastrar Novo Pacote de Desconto</span>
            </button>
          )}

          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Pacotes Ativos ({packages.length})</h3>
             
             {loading ? (
                <div className="text-center py-10 text-[10px] font-black text-gray-600 uppercase animate-pulse">Sincronizando...</div>
             ) : packages.length === 0 ? (
                <div className="text-center py-10 text-[10px] font-black text-gray-700 uppercase italic">Nenhum pacote de desconto cadastrado.</div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-[#1c1f2e] border border-[#2a2d3e] p-6 rounded-3xl group hover:border-purple-500/30 transition-all relative overflow-hidden">
                       {pkg.popular === 'sim' && (
                         <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[8px] font-black uppercase tracking-tighter rounded-bl-xl shadow-xl">Popular</div>
                       )}
                       
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <div className="text-2xl font-black text-white">{pkg.qntd_cota}</div>
                             <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Números</div>
                          </div>
                          <div className="text-right">
                             <div className="text-xl font-black text-green-500">R$ {parseFloat(pkg.value_cota).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                             <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">
                               R$ {(pkg.value_cota / pkg.qntd_cota).toLocaleString('pt-BR', {minimumFractionDigits: 2})} / un
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center pt-4 border-t border-[#2a2d3e]">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${pkg.status === 'ativo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                             {pkg.status}
                          </span>
                          <div className="flex gap-1">
                             <button onClick={() => handleEdit(pkg)} className="p-2 text-gray-500 hover:text-white transition-colors"><Edit size={14}/></button>
                             <button onClick={() => handleDelete(pkg.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-[#2a2d3e] bg-[#0f111a]/50 flex justify-center">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center leading-relaxed">
               Os pacotes facilitam a compra de grandes volumes e aumentam sua conversão.<br/>
               Destaque o pacote mais vendido com o selo "Popular".
            </p>
        </div>
      </div>
    </div>
  );
};

export default RafflePackagesModal;
