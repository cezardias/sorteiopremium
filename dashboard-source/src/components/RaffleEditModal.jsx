import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../api/api';
import { 
  X, 
  Save, 
  AlertCircle, 
  Info, 
  Layers, 
  Trophy, 
  Target, 
  CreditCard, 
  Globe, 
  Camera,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

const RaffleEditModal = ({ raffle, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    price: 0,
    status: 'ativas',
    data_sortition: '',
    initial_sale: '',
    description_resume: '',
    description_sortition: '',
    description_product: '',
    description_role: '',
    description_order_approve: '',
    video: '',
    img: '',
    cota: { 
      qntd_cota: 1000, 
      qntd_cota_digit: 0,
      qntd_cota_min_order: 1, 
      qntd_cota_max_order: 1000,
      qntd_cota_max_client: 1000 
    },
    rifa_awarded: {
      cotas_double: 'nao',
      text_cotas_double: '',
      title_cotas_awarded: '',
      description_cotas_awarded: '',
      title_upsell: '',
      description_upsell: ''
    },
    rifa_others: {
      facebook_pixel: '',
      facebook_token: '',
      tiktok_pixel: '',
      whatsapp_group: '',
      link_ebook: '',
      nota_fiscal: ''
    },
    rifa_payment: { 
      gateway: 'cyber',
      time_pay: 15,
      service_charge: 0,
      text_service_charge: ''
    }
  });

  useEffect(() => {
    if (raffle) {
      setFormData({
        id: raffle.id,
        title: raffle.title || '',
        price: raffle.price || 0,
        status: raffle.status || 'ativas',
        data_sortition: raffle.data_sortition ? raffle.data_sortition.substring(0, 16) : '',
        initial_sale: raffle.initial_sale ? raffle.initial_sale.substring(0, 16) : '',
        description_resume: raffle.description_resume || '',
        description_sortition: raffle.description_sortition || '',
        description_product: raffle.description_product || '',
        description_role: raffle.description_role || '',
        description_order_approve: raffle.description_order_approve || '',
        video: raffle.video || '',
        img: raffle.img || '',
        cota: {
          qntd_cota: raffle.cota?.qntd_cota || 1000,
          qntd_cota_digit: raffle.cota?.qntd_cota_digit || 0,
          qntd_cota_min_order: raffle.cota?.qntd_cota_min_order || 1,
          qntd_cota_max_order: raffle.cota?.qntd_cota_max_order || 1000,
          qntd_cota_max_client: raffle.cota?.qntd_cota_max_client || 1000,
        },
        rifa_awarded: {
          cotas_double: (raffle.rifaAwarded || raffle.rifa_awarded)?.cotas_double || 'nao',
          text_cotas_double: (raffle.rifaAwarded || raffle.rifa_awarded)?.text_cotas_double || '',
          title_cotas_awarded: (raffle.rifaAwarded || raffle.rifa_awarded)?.title_cotas_awarded || '',
          description_cotas_awarded: (raffle.rifaAwarded || raffle.rifa_awarded)?.description_cotas_awarded || '',
          title_upsell: (raffle.rifaAwarded || raffle.rifa_awarded)?.title_upsell || '',
          description_upsell: (raffle.rifaAwarded || raffle.rifa_awarded)?.description_upsell || ''
        },
        rifa_others: {
          facebook_pixel: (raffle.rifaOthers || raffle.rifa_others)?.facebook_pixel || '',
          facebook_token: (raffle.rifaOthers || raffle.rifa_others)?.facebook_token || '',
          tiktok_pixel: (raffle.rifaOthers || raffle.rifa_others)?.tiktok_pixel || '',
          whatsapp_group: (raffle.rifaOthers || raffle.rifa_others)?.whatsapp_group || '',
          link_ebook: (raffle.rifaOthers || raffle.rifa_others)?.link_ebook || '',
          nota_fiscal: (raffle.rifaOthers || raffle.rifa_others)?.nota_fiscal || ''
        },
        rifa_payment: {
          gateway: (raffle.rifaPayment || raffle.rifa_payment)?.gateway || 'cyber',
          time_pay: (raffle.rifaPayment || raffle.rifa_payment)?.time_pay || 15,
          service_charge: (raffle.rifaPayment || raffle.rifa_payment)?.service_charge || 0,
          text_service_charge: (raffle.rifaPayment || raffle.rifa_payment)?.text_service_charge || ''
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
      setError(err.response?.data?.msg || 'Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: <Info size={14} /> },
    { id: 'cotas', label: 'Cotas', icon: <Layers size={14} /> },
    { id: 'premios', label: 'Premiação', icon: <Trophy size={14} /> },
    { id: 'winners', label: 'Cotas Premiadas', icon: <Trophy size={14} className="text-yellow-500" /> },
    { id: 'retro', label: 'Rastreio', icon: <Target size={14} /> },
    { id: 'pagamento', label: 'Pagamento', icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e]">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">{raffle ? 'Editar Sorteio' : 'Novo Sorteio'}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{raffle ? `ID: #${raffle.id}` : 'CRIAÇÃO DE CAMPANHA'}</span>
               <div className="w-1 h-1 rounded-full bg-gray-700"></div>
               <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{tabs.find(t => t.id === activeTab).label}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all group">
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0f111a] p-2 gap-2 border-b border-[#2a2d3e]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/10' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* TAB: INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Título da Campanha</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all" required />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Mídia Principal</label>
                  <div className="flex gap-8 items-start bg-[#1c1f2e] p-6 rounded-3xl border border-[#2a2d3e]">
                    <div className="w-40 h-40 rounded-3xl bg-[#0f111a] border-2 border-dashed border-[#2a2d3e] flex items-center justify-center overflow-hidden group relative">
                      {formData.img ? (
                        <>
                          <img src={formData.img.startsWith('data:') ? formData.img : `${IMAGE_BASE_URL}/${formData.img}`} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Trocar</span>
                          </div>
                        </>
                      ) : (
                        <Camera className="text-gray-700" size={32} />
                      )}
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                    <div className="flex-1 space-y-4">
                       <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed tracking-wider">
                         Upload de imagem principal (Capa).<br/>
                         Recomendado: <span className="text-green-500">1000x1000px</span>.
                       </p>
                       <div>
                         <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-tighter">URL do Vídeo (YouTube/Vimeo)</label>
                         <input type="text" name="video" value={formData.video} onChange={handleChange} placeholder="https://..." className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-[10px] p-3 rounded-xl focus:outline-none focus:border-green-500/50 transition-all font-bold" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Resumo para Listagem (Card)</label>
                  <textarea name="description_resume" value={formData.description_resume} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all min-h-[80px]" required />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Descrição do Produto</label>
                  <textarea name="description_product" value={formData.description_product} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all min-h-[120px]" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Descrição do Sorteio</label>
                  <textarea name="description_sortition" value={formData.description_sortition} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all min-h-[120px]" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Valor Unitário (R$)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-green-500 text-sm font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all" required />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all appearance-none">
                    <option value="ativas">ATIVAS</option>
                    <option value="pausadas">PAUSADAS</option>
                    <option value="finalizadas">FINALIZADAS</option>
                    <option value="futuras">FUTURAS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Início das Vendas (Opcional)</label>
                  <input type="datetime-local" name="initial_sale" value={formData.initial_sale} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-[10px] font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all uppercase" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Previsão do Sorteio</label>
                  <input type="datetime-local" name="data_sortition" value={formData.data_sortition} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-[10px] font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all uppercase" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Mensagem de Sucesso (Pós-Aprovação)</label>
                  <input type="text" name="description_order_approve" value={formData.description_order_approve} onChange={handleChange} className="w-full bg-[#1c1f2e] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all" placeholder="Parabéns! Sua compra foi confirmada." />
                </div>
              </div>
            </div>
          )}

          {/* TAB: COTAS */}
          {activeTab === 'cotas' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl flex items-start gap-4">
                 <AlertCircle className="text-yellow-500 shrink-0" size={20} />
                 <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest leading-relaxed">
                   Atenção: A quantidade total de cotas define o limite de bilhetes gerados pelo sistema. 
                   Certifique-se de que os limites por pedido e cliente estejam em harmonia com sua estratégia de vendas.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-[#1c1f2e] p-6 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Quantidade Total de Cotas</label>
                      <input type="number" name="cota.qntd_cota" value={formData.cota.qntd_cota} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-blue-500 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-gray-600 uppercase mb-2">Mínimo p/ Compra</label>
                          <input type="number" name="cota.qntd_cota_min_order" value={formData.cota.qntd_cota_min_order} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-green-500/50" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-600 uppercase mb-2">Máximo p/ Compra</label>
                          <input type="number" name="cota.qntd_cota_max_order" value={formData.cota.qntd_cota_max_order} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-green-500/50" />
                        </div>
                    </div>
                 </div>

                 <div className="bg-[#1c1f2e] p-6 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Limite por CPF (Acumulado)</label>
                      <input type="number" name="cota.qntd_cota_max_client" value={formData.cota.qntd_cota_max_client} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Dígitos Visíveis</label>
                      <select name="cota.qntd_cota_digit" value={formData.cota.qntd_cota_digit} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                        <option value="0">AUTOMÁTICO</option>
                        <option value="3">3 DÍGITOS (000)</option>
                        <option value="4">4 DÍGITOS (0000)</option>
                        <option value="5">5 DÍGITOS (00000)</option>
                        <option value="6">6 DÍGITOS (000000)</option>
                      </select>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* TAB: PREMIAÇÃO */}
          {activeTab === 'premios' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Cotas Premiadas (Double)</h3>
                      <div className="flex bg-[#0f111a] p-1 rounded-xl">
                         <button type="button" onClick={() => setFormData(p => ({...p, rifa_awarded: {...p.rifa_awarded, cotas_double: 'sim'}}))} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${formData.rifa_awarded.cotas_double === 'sim' ? 'bg-green-500 text-black' : 'text-gray-500'}`}>SIM</button>
                         <button type="button" onClick={() => setFormData(p => ({...p, rifa_awarded: {...p.rifa_awarded, cotas_double: 'nao'}}))} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${formData.rifa_awarded.cotas_double === 'nao' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>NÃO</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Texto de Destaque (Double)</label>
                      <textarea name="rifa_awarded.text_cotas_double" value={formData.rifa_awarded.text_cotas_double} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 min-h-[60px]" />
                    </div>
                 </div>

                 <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest border-l-2 border-green-500 pl-4">Configuração Geral de Prêmios</h3>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Título da Seção de Prêmios</label>
                      <input type="text" name="rifa_awarded.title_cotas_awarded" value={formData.rifa_awarded.title_cotas_awarded} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Descrição detalhada</label>
                      <textarea name="rifa_awarded.description_cotas_awarded" value={formData.rifa_awarded.description_cotas_awarded} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 min-h-[60px]" />
                    </div>
                 </div>

                 <div className="md:col-span-2 bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <TrendingUp className="text-blue-500" size={16} />
                       <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Configuração do Carrinho (Upsell)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Título do Upsell</label>
                         <input type="text" name="rifa_awarded.title_upsell" value={formData.rifa_awarded.title_upsell} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                       </div>
                       <div>
                         <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Chamada p/ Ação (CTA)</label>
                         <input type="text" name="rifa_awarded.description_upsell" value={formData.rifa_awarded.description_upsell} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* TAB: RASTREAMENTO */}
          {activeTab === 'retro' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <Globe className="text-blue-500" size={16} />
                       <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Pixel Meta (Facebook)</h3>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Pixel ID</label>
                      <input type="text" name="rifa_others.facebook_pixel" value={formData.rifa_others.facebook_pixel} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Access Token (Conversões API)</label>
                      <textarea name="rifa_others.facebook_token" value={formData.rifa_others.facebook_token} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-[10px] font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 min-h-[80px]" />
                    </div>
                  </div>

                  <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <Globe className="text-red-500" size={16} />
                       <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Outros Pixels & Grupos</h3>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">TikTok Pixel ID</label>
                      <input type="text" name="rifa_others.tiktok_pixel" value={formData.rifa_others.tiktok_pixel} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                    </div>
                    <div className="mt-auto pt-6 border-t border-[#2a2d3e]">
                       <label className="block text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Grupo WhatsApp Exclusivo</label>
                       <input type="text" name="rifa_others.whatsapp_group" value={formData.rifa_others.whatsapp_group} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50 font-mono" />
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Link do Ebook (Entrega Digital)</label>
                        <input type="text" name="rifa_others.link_ebook" value={formData.rifa_others.link_ebook} onChange={handleChange} placeholder="https://..." className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Nota Fiscal / Informações Legais</label>
                        <input type="text" name="rifa_others.nota_fiscal" value={formData.rifa_others.nota_fiscal} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: PAGAMENTO */}
          {activeTab === 'pagamento' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Gateway & Tempo</h3>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Gateway de Pagamento</label>
                      <select name="rifa_payment.gateway" value={formData.rifa_payment.gateway} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-sm font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50 appearance-none">
                        <option value="cyber">ESCALE CYBER (PIX + CPF)</option>
                        <option value="mercado_pago">MERCADO PAGO</option>
                        <option value="paggue">PAGGUE</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Tempo p/ Expiração (Minutos)</label>
                       <div className="flex items-center gap-4">
                          <input type="number" name="rifa_payment.time_pay" value={formData.rifa_payment.time_pay} onChange={handleChange} className="w-32 bg-[#0f111a] border border-[#2a2d3e] text-white text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-green-500/50 text-center" />
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Minutos p/ Cancelar Automático</span>
                       </div>
                    </div>
                  </div>

                  <div className="bg-[#1c1f2e] p-8 rounded-3xl border border-[#2a2d3e] space-y-6 flex flex-col justify-center">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest border-l-2 border-red-500 pl-4 mb-4">Taxas de Serviço</h3>
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Valor da Taxa (Fixo R$)</label>
                       <input type="number" step="0.01" name="rifa_payment.service_charge" value={formData.rifa_payment.service_charge} onChange={handleChange} className="w-full bg-[#0f111a] border border-[#2a2d3e] text-red-400 text-lg font-black p-4 rounded-2xl focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Texto Descritivo da Taxa</label>
                        <input type="text" name="rifa_payment.text_service_charge" value={formData.rifa_payment.text_service_charge} onChange={handleChange} placeholder="Ex: Taxa de processamento" className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-green-500/50" />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: COTAS PREMIADAS (INSTRUÇÕES) */}
          {activeTab === 'winners' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col justify-center">
               <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-[40px] flex flex-col items-center text-center gap-6 max-w-lg mx-auto">
                 <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <Trophy size={40} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Central de Prêmios Instantâneos</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                      Gerencie aqui os números que já dão prêmios ao serem comprados.<br/>
                      <span className="text-yellow-500">Salve as alterações da campanha primeiro.</span>
                    </p>
                 </div>

                 {!formData.id ? (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[9px] font-black uppercase tracking-widest">
                      Você precisa salvar a rifa antes de cadastrar prêmios.
                   </div>
                 ) : (
                   <button 
                     type="button"
                     onClick={() => {
                        onClose();
                        // Delay pequeno para garantir que o modal de edição fechou antes de abrir o de prêmios no pai
                        setTimeout(() => {
                          const event = new CustomEvent('openRafflePrizes', { detail: { id: formData.id, title: formData.title } });
                          window.dispatchEvent(event);
                        }, 100);
                     }}
                     className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                   >
                     <Plus size={20} /> Cadastrar Cotas Premiadas
                   </button>
                 )}
               </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#2a2d3e] bg-[#1c1f2e] flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-green-500/20 flex items-center gap-2">
                 <CheckCircle2 size={12} /> Dados verificados
              </div>
           </div>
           <div className="flex gap-4 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all"
              >
                Descartar
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-black px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={18} /> {loading ? 'Sincronizando...' : 'Salvar Campanha'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleEditModal;
