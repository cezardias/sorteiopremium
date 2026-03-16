import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Settings, Globe, Shield, MessageSquare, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SiteSettings = () => {
  const [formData, setFormData] = useState({
    // CONFIGURAÇÕES
    site_name: '',
    url_logo_site: null,
    url_logo_site_white: null,
    footer_company: '',
    google_analytics: '',
    webhook_url: '',
    product_title: '',
    product_subtitle: '',
    
    // SEO
    author: '',
    site_keywords: '',
    social_share_title: '',
    social_share_image: null,
    description: '',
    
    // SUPORTE / CONTATO
    whatsapp_number: '',
    whatsapp_group_url: '',
    instagram_link: '',
    helpdesk_url: '',
    email: ''
  });

  const [previews, setPreviews] = useState({
    url_logo_site: null,
    url_logo_site_white: null,
    social_share_image: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard/site-settings');
        if (response.data && response.data.success) {
          const data = response.data.data;
          setFormData({
            ...formData,
            site_name: data.site_name || '',
            footer_company: data.footer_company || '',
            google_analytics: data.google_analytics || '',
            webhook_url: data.webhook_url || '',
            product_title: data.product_title || '',
            product_subtitle: data.product_subtitle || '',
            author: data.author || '',
            site_keywords: data.site_keywords || '',
            social_share_title: data.social_share_title || '',
            description: data.description || '',
            whatsapp_number: data.whatsapp_number || '',
            whatsapp_group_url: data.whatsapp_group_url || '',
            instagram_link: data.instagram_link || '',
            helpdesk_url: data.helpdesk_url || '',
            email: data.email || ''
          });
          setPreviews({
            url_logo_site: data.url_logo_site || null,
            url_logo_site_white: data.url_logo_site || null, // Fallback if no white logo
            social_share_image: data.social_share_image || null
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
      setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await api.post('/admin/dashboard/site-settings/editar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.success) {
        toast.success('Configurações salvas!');
      } else {
        toast.error(response.data.msg || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-gray-500 animate-pulse uppercase font-black tracking-widest text-xs">Carregando Configurações do Site...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2 mb-8">
        <Settings className="text-gray-400" /> CONFIGURAÇÕES DO SITE
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
          <div className="bg-[#141523] rounded-lg border border-[#2a2d3e] flex flex-col">
            <div className="p-4 border-b border-[#2a2d3e] bg-[#0f111a]">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Configurações</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Título do Site</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.site_name} onChange={(e) => setFormData({...formData, site_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Logo (para fundo escuro)</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" className="text-[10px] text-gray-500" onChange={(e) => handleFileChange(e, 'url_logo_site')} />
                    {previews.url_logo_site && <img src={previews.url_logo_site} alt="Logo Dark" className="h-8 object-contain bg-black/20 p-1 rounded" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Logo (para fundo branco)</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" className="text-[10px] text-gray-500" onChange={(e) => handleFileChange(e, 'url_logo_site_white')} />
                    {previews.url_logo_site_white && <img src={previews.url_logo_site_white} alt="Logo Light" className="h-8 object-contain bg-white/20 p-1 rounded" />}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Empresa no rodapé</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.footer_company} onChange={(e) => setFormData({...formData, footer_company: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Google Analytics</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.google_analytics} onChange={(e) => setFormData({...formData, google_analytics: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">URL Webhook</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.webhook_url} onChange={(e) => setFormData({...formData, webhook_url: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Produto Título</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.product_title} onChange={(e) => setFormData({...formData, product_title: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Produto Subtítulo</label>
                <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.product_subtitle} onChange={(e) => setFormData({...formData, product_subtitle: e.target.value})} />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: SEO & SUPORTE */}
          <div className="space-y-8">
            {/* SEO */}
            <div className="bg-[#141523] rounded-lg border border-[#2a2d3e] flex flex-col">
              <div className="p-4 border-b border-[#2a2d3e] bg-[#0f111a]">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">SEO</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Autor</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Tags</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.site_keywords} onChange={(e) => setFormData({...formData, site_keywords: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Título Compartilhamento</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.social_share_title} onChange={(e) => setFormData({...formData, social_share_title: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Imagem Compartilhamento</label>
                  <div className="flex flex-col gap-2">
                    <input type="file" className="text-[10px] text-gray-500" onChange={(e) => handleFileChange(e, 'social_share_image')} />
                    {previews.social_share_image && <img src={previews.social_share_image} alt="SEO Share" className="h-20 object-cover rounded border border-[#2a2d3e]" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Descrição Compartilhamento</label>
                  <textarea className="input-field-small min-h-[80px] resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SUPORTE / CONTATO */}
            <div className="bg-[#141523] rounded-lg border border-[#2a2d3e] flex flex-col">
              <div className="p-4 border-b border-[#2a2d3e] bg-[#0f111a]">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Suporte / Contato</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">WhatsApp (Somente números)</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.whatsapp_number} onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Grupo Whatsapp (URL)</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.whatsapp_group_url} onChange={(e) => setFormData({...formData, whatsapp_group_url: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Instagram</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.instagram_link} onChange={(e) => setFormData({...formData, instagram_link: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">Helpdesk (URL)</label>
                  <input type="text" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.helpdesk_url} onChange={(e) => setFormData({...formData, helpdesk_url: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase">E-mail</label>
                  <input type="email" className="w-full bg-transparent border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50 transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-4 rounded font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'ADICIONAR'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
