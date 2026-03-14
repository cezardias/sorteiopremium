import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { X, Save, AlertCircle } from 'lucide-react';

const RaffleEditModal = ({ raffle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: 0,
    status: '',
    data_sortition: '',
    description_resume: '',
    emphasis: 'nao',
    show_site: 1,
    // Add sub-objects to match RifaService.php expectations
    cota: { qntd_cota: 0, qntd_cota_min_order: 1, qntd_cota_max_order: 100 },
    rifa_payment: { gateway: 'cyber' }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (raffle) {
      setFormData({
        id: raffle.id,
        title: raffle.title || '',
        price: raffle.price || 0,
        status: raffle.status || 'ativas',
        data_sortition: raffle.data_sortition ? raffle.data_sortition.substring(0, 16) : '',
        description_resume: raffle.description_resume || '',
        emphasis: raffle.emphasis || 'nao',
        show_site: raffle.show_site ?? 1,
        cota: {
          qntd_cota: raffle.cota?.qntd_cota || 0,
          qntd_cota_min_order: raffle.cota?.qntd_cota_min_order || 1,
          qntd_cota_max_order: raffle.cota?.qntd_cota_max_order || 100,
        },
        rifa_payment: {
          gateway: raffle.rifa_payment?.gateway || 'cyber'
        }
      });
    }
  }, [raffle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put(`/admin/dashboard/rifa/editar/${formData.id}`, formData);
      if (response.data && response.data.success) {
        onSuccess();
      } else {
        setError(response.data.msg || 'Erro ao atualizar sorteio.');
      }
    } catch (err) {
      console.error('Update raffle error:', err);
      setError('Falha ao salvar dados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141523] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#2a2d3e] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2d3e] bg-[#1c1f2e]">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">
              EDITAR SORTEIO
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{raffle?.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex justify-center items-center rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Título do Sorteio</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field py-3 font-bold"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Valor da Cota (R$)</label>
              <input 
                type="number" 
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field py-3 font-bold text-green-500"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Data do Sorteio</label>
              <input 
                type="datetime-local" 
                name="data_sortition"
                value={formData.data_sortition}
                onChange={handleChange}
                className="input-field py-3 font-bold"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Status Inicial</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field py-3 font-bold"
              >
                <option value="ativas">Ativas</option>
                <option value="pausadas">Pausadas</option>
                <option value="finalizadas">Finalizadas</option>
                <option value="futuras">Futuras</option>
              </select>
            </div>

            {/* emphasis */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Destaque (Home)</label>
              <select 
                name="emphasis"
                value={formData.emphasis}
                onChange={handleChange}
                className="input-field py-3 font-bold"
              >
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#2a2d3e] flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-400 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black px-10 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-green-500/20 ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaffleEditModal;
