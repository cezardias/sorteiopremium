import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { X, Save, AlertCircle } from 'lucide-react';

const RaffleEditModal = ({ raffle, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: 0,
    status: 'ativas',
    data_sortition: '',
    description_resume: '',
    description_sortition: '',
    description_product: '',
    description_role: '',
    emphasis: 'nao',
    show_top: 'nao',
    show_site: 1,
    img: '',
    cota: { 
      qntd_cota: 1000, 
      qntd_cota_min_order: 1, 
      qntd_cota_max_order: 100,
      qntd_cota_max_client: 1000 
    },
    rifa_payment: { 
      gateway: 'cyber',
      time_pay: 15
    }
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
        description_sortition: raffle.description_sortition || '',
        description_product: raffle.description_product || '',
        description_role: raffle.description_role || '',
        emphasis: raffle.emphasis || 'nao',
        show_top: raffle.show_top || 'nao',
        show_site: raffle.show_site ?? 1,
        img: raffle.img || '',
        cota: {
          qntd_cota: raffle.cota?.qntd_cota || 1000,
          qntd_cota_min_order: raffle.cota?.qntd_cota_min_order || 1,
          qntd_cota_max_order: raffle.cota?.qntd_cota_max_order || 100,
          qntd_cota_max_client: raffle.cota?.qntd_cota_max_client || 1000,
        },
        rifa_payment: {
          gateway: raffle.rifa_payment?.gateway || 'cyber',
          time_pay: raffle.rifa_payment?.time_pay || 15
        }
      });
    } else {
      setFormData({
        id: '',
        title: '',
        price: 0,
        status: 'ativas',
        data_sortition: '',
        description_resume: '',
        description_sortition: 'Regras do sorteio padrão.',
        description_product: 'Produto do sorteio.',
        description_role: 'Regras de participação.',
        emphasis: 'nao',
        show_top: 'nao',
        show_site: 1,
        img: '',
        cota: { qntd_cota: 1000, qntd_cota_min_order: 1, qntd_cota_max_order: 100, qntd_cota_max_client: 1000 },
        rifa_payment: { gateway: 'cyber', time_pay: 15 }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (formData.id) {
        response = await api.put(`/admin/dashboard/rifa/editar/${formData.id}`, formData);
      } else {
        response = await api.post('/admin/dashboard/rifas/cadastrar', formData);
      }
      
      if (response.data && response.data.success) {
        onSuccess();
      } else {
        setError(response.data.msg || 'Erro ao processar sorteio.');
      }
    } catch (err) {
      console.error('Save raffle error:', err);
      const serverMsg = err.response?.data?.msg || err.response?.data?.message || err.message;
      setError(serverMsg ? `Erro: ${serverMsg}` : 'Falha ao salvar dados. Verifique a conexão.');
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
              {raffle ? 'EDITAR SORTEIO' : 'NOVO SORTEIO'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {raffle ? `ID: #${raffle.id}` : 'Preencha os dados abaixo'}
            </p>
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

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">Imagem do Sorteio</label>
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 rounded-2xl bg-[#1c1f2e] border-2 border-dashed border-[#2a2d3e] flex items-center justify-center overflow-hidden group relative">
                  {formData.img ? (
                    <>
                      <img 
                        src={formData.img.startsWith('data:') ? formData.img : `https://sorteiospremiummultimarcas.com.br/api/public/img/rifas/${formData.img}`} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trocar</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-600 text-[10px] font-bold uppercase text-center p-2">Sem Imagem</div>
                  )}
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Clique na área ao lado para fazer upload da imagem principal do sorteio.<br/>
                    Formatos aceitos: <span className="text-green-500">JPG, PNG</span>.<br/>
                    Tamanho recomendado: <span className="text-green-500">800x800px</span>.
                  </p>
                  <button 
                    type="button"
                    onClick={() => document.querySelector('input[type="file"]').click()}
                    className="mt-4 px-4 py-2 bg-[#2a2d3e] hover:bg-[#32364a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                  >
                    Selecionar Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Description Resume */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Resumo da Descrição (Obrigatório)</label>
              <textarea 
                name="description_resume"
                value={formData.description_resume}
                onChange={handleChange}
                className="input-field py-3 font-medium min-h-[100px]"
                placeholder="Breve resumo para o card do sorteio..."
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

            {/* Max Quotas per Client */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Limite Cotas por Cliente</label>
              <input 
                type="number" 
                name="cota.qntd_cota_max_client"
                value={formData.cota.qntd_cota_max_client}
                onChange={handleChange}
                className="input-field py-3 font-bold text-purple-500"
                required
              />
            </div>

            {/* Total Quotas */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Quantidade Total de Cotas</label>
              <input 
                type="number" 
                name="cota.qntd_cota"
                value={formData.cota.qntd_cota}
                onChange={handleChange}
                className="input-field py-3 font-bold text-blue-500"
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

            {/* Show Top */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Mostrar no Topo</label>
              <select 
                name="show_top"
                value={formData.show_top}
                onChange={handleChange}
                className="input-field py-3 font-bold"
              >
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>

            {/* Time Pay */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Tempo Expiração Pix (Minutos)</label>
              <input 
                type="number" 
                name="rifa_payment.time_pay"
                value={formData.rifa_payment.time_pay}
                onChange={handleChange}
                className="input-field py-3 font-bold text-orange-500"
                required
              />
            </div>

            {/* Dummy hidden fields for other required descriptions if not visible yet */}
            <input type="hidden" name="description_sortition" value={formData.description_sortition} />
            <input type="hidden" name="description_product" value={formData.description_product} />
            <input type="hidden" name="description_role" value={formData.description_role} />
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
