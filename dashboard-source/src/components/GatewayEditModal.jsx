import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { X, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GatewayEditModal = ({ gateway, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    gateway: 'Escale Cyber',
    name: '',
    api_client_id: '',
    public_key: '',
    billing_name: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gateway) {
      setFormData({
        id: gateway.id,
        gateway: gateway.gateway || 'Escale Cyber',
        name: gateway.name || '',
        api_client_id: gateway.api_client_id || '',
        public_key: gateway.public_key || '',
        billing_name: gateway.billing_name || ''
      });
    }
  }, [gateway]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let response;
      if (gateway) {
        response = await api.put('/admin/dashboard/payment/update', formData);
      } else {
        response = await api.post('/admin/dashboard/payment/make', formData);
      }

      if (response.data && response.data.success) {
        toast.success('Configurações atualizadas!');
        onSuccess();
      } else {
        toast.error(response.data.msg || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving gateway:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
      <div className="bg-[#141523] w-full max-w-sm rounded-xl border border-[#2a2d3e] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-[#2a2d3e] bg-[#0f111a]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1db954]">
            {gateway ? 'EDITAR GATEWAY' : 'NOVO GATEWAY'}
          </h2>
          <button onClick={onClose} className="bg-red-500/80 hover:bg-red-500 text-white p-1 rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gateway</label>
            <select 
              className="w-full bg-[#1e2130] border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              value={formData.gateway}
              onChange={(e) => setFormData({...formData, gateway: e.target.value})}
            >
              <option value="Escale Cyber">Escale Cyber</option>
              <option value="Mercado Pago">Mercado Pago</option>
              <option value="Paggue">Paggue</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full bg-[#1e2130] border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Api Client Id</label>
            <input 
              type="text" 
              className="w-full bg-[#1e2130] border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              value={formData.api_client_id}
              onChange={(e) => setFormData({...formData, api_client_id: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Client Key</label>
            <input 
              type="text" 
              className="w-full bg-[#1e2130] border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              value={formData.public_key}
              onChange={(e) => setFormData({...formData, public_key: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome na Fatura</label>
            <input 
              type="text" 
              className="w-full bg-[#1e2130] border border-[#2a2d3e] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              value={formData.billing_name}
              onChange={(e) => setFormData({...formData, billing_name: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-2 rounded font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
              Atualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GatewayEditModal;
