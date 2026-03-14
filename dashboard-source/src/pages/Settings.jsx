import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Settings as SettingsIcon, 
  Save, 
  Globe, 
  Share2, 
  Image as ImageIcon, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Instagram,
  Facebook,
  Key
} from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    id: 1,
    site_name: '',
    plataform_name: '',
    whatsapp_link: '',
    instagram_link: '',
    url_logo_site: '',
    url_favicon_site: '',
    meta_pixel: '',
    gateway: 'cyber',
    cyber_public_key: '',
    cyber_secret_key: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/site-settings');
      if (response.data && response.data.success && response.data.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const response = await api.post('/admin/dashboard/site-settings/editar', config);
      if (response.data && response.data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações. Verifique os campos.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
        <p className="text-gray-500 font-black uppercase tracking-widest text-sm animate-pulse">Carregando Preferências...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <SettingsIcon className="text-green-500" /> CONFIGURAÇÕES DO SISTEMA
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Gerencie a identidade e integrações do seu site</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerts */}
        {message.text && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-500' 
            : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold uppercase tracking-wide">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sessão: Identidade */}
          <section className="bg-[#141523] rounded-3xl border border-[#2a2d3e] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex items-center gap-3 text-white">
              <Globe size={20} className="text-blue-400" />
              <h2 className="font-black text-sm uppercase tracking-widest">Identidade do Site</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Nome do Site</label>
                <input 
                  type="text" 
                  name="site_name"
                  value={config.site_name || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ex: Sorteio Premium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Nome da Plataforma (Exibição)</label>
                <input 
                  type="text" 
                  name="plataform_name"
                  value={config.plataform_name || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ex: Premium Multimarcas"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">URL da Logo</label>
                  <input 
                    type="text" 
                    name="url_logo_site"
                    value={config.url_logo_site || ''}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">URL do Favicon</label>
                  <input 
                    type="text" 
                    name="url_favicon_site"
                    value={config.url_favicon_site || ''}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sessão: Contato e Social */}
          <section className="bg-[#141523] rounded-3xl border border-[#2a2d3e] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex items-center gap-3 text-white">
              <Share2 size={20} className="text-purple-400" />
              <h2 className="font-black text-sm uppercase tracking-widest">Redes e Contato</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Link WhatsApp (Vendas/Suporte)</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                  <input 
                    type="text" 
                    name="whatsapp_link"
                    value={config.whatsapp_link || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Link Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={16} />
                  <input 
                    type="text" 
                    name="instagram_link"
                    value={config.instagram_link || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">ID do Meta Pixel (Facebook)</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                  <input 
                    type="text" 
                    name="meta_pixel"
                    value={config.meta_pixel || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Somente o número do ID"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sessão: Gateway de Pagamento */}
          <section className="bg-[#141523] rounded-3xl border border-[#2a2d3e] overflow-hidden shadow-xl lg:col-span-2">
            <div className="p-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex items-center gap-3 text-white">
              <ShieldCheck size={20} className="text-green-400" />
              <h2 className="font-black text-sm uppercase tracking-widest">Gateway de Pagamento (Cyber)</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-[#0f111a] p-4 rounded-2xl border border-yellow-500/20 text-yellow-500/80 text-[10px] uppercase font-bold tracking-widest flex items-center gap-3">
                <AlertCircle size={16} />
                Estes campos são fundamentais para o processamento de PIX automáticos via Cyber API.
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Public Key (Publica)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    name="cyber_public_key"
                    value={config.cyber_public_key || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10 font-mono text-[11px]"
                    placeholder="pub_..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Secret Key (Privada)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                  <input 
                    type="password" 
                    name="cyber_secret_key"
                    value={config.cyber_secret_key || ''}
                    onChange={handleInputChange}
                    className="input-field pl-10 font-mono text-[11px]"
                    placeholder="sk_..."
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-green-500 hover:bg-green-600 text-black px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-green-500/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Salvando Alterações...' : 'Salvar Todas as Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
