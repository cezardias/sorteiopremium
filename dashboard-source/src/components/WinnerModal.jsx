import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Upload, 
  Search, 
  Trophy, 
  User, 
  Phone, 
  Ticket, 
  Camera,
  Check
} from 'lucide-react';

const WinnerModal = ({ isOpen, onClose, onSuccess, raffles }) => {
  const [formData, setFormData] = useState({
    rifas_id: '',
    cellphone: '',
    ticket: '',
    img: ''
  });
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ rifas_id: '', cellphone: '', ticket: '', img: '' });
      setClient(null);
      setPreview(null);
    }
  }, [isOpen]);

  const handleSearchClient = async () => {
    if (!formData.cellphone) return;
    try {
      setSearching(true);
      const response = await api.post('/admin/dashboard/client/procurar/pelo-telefone', { 
        cellphone: formData.cellphone 
      });
      if (response.data && response.data.success) {
        setClient(response.data.data);
      } else {
        setClient(null);
      }
    } catch (error) {
      console.error('Error searching client:', error);
      setClient(null);
    } finally {
      setSearching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client) return alert('Por favor, selecione um cliente válido.');
    if (!formData.img) return alert('Por favor, faça upload da foto do ganhador.');

    try {
      setLoading(true);
      const response = await api.post('/admin/dashboard/cadastrar/ganhador', formData);
      if (response.data && response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error registering winner:', error);
      alert(error.response?.data?.msg || 'Erro ao registrar ganhador.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#141523] w-full max-w-lg rounded-3xl border border-[#2a2d3e] shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#1c1f2e]">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Novo Ganhador
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Vincular cota premiada a um cliente</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Client Search */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Localizar Cliente</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="DDD + Telefone" 
                  className="input-field pl-10 py-3 text-xs"
                  value={formData.cellphone}
                  onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                />
              </div>
              <button 
                type="button"
                onClick={handleSearchClient}
                disabled={searching}
                className="bg-green-500 hover:bg-green-600 text-black px-4 rounded-xl font-black text-[10px] uppercase transition-all disabled:opacity-50"
              >
                {searching ? <RefreshCcw className="animate-spin" size={16} /> : 'Buscar'}
              </button>
            </div>

            {client && (
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{client.name} {client.surname}</p>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Cliente Localizado</p>
                </div>
                <Check className="ml-auto text-green-500" size={20} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Sorteio</label>
              <select 
                required
                className="input-field py-3 text-xs uppercase font-bold"
                value={formData.rifas_id}
                onChange={(e) => setFormData({ ...formData, rifas_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {raffles.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Cota Ganhadora</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  required
                  type="number" 
                  placeholder="Ex: 12345" 
                  className="input-field pl-10 py-3 text-xs"
                  value={formData.ticket}
                  onChange={(e) => setFormData({ ...formData, ticket: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">4. Foto do Ganhador</label>
            <div 
              onClick={() => document.getElementById('winner-img').click()}
              className="group cursor-pointer border-2 border-dashed border-[#2a2d3e] hover:border-green-500/50 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all bg-[#0f111a] relative overflow-hidden h-48"
            >
              {preview ? (
                <>
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Preview" />
                  <div className="relative z-10 flex flex-col items-center">
                    <Camera className="text-white drop-shadow-lg" size={32} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest mt-2 drop-shadow-lg">Alterar Foto</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Clique para subir a foto</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">JPG ou PNG (Recomendado 800x800)</p>
                  </div>
                </>
              )}
            </div>
            <input 
              id="winner-img"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !client}
            className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-xs uppercase transition-all shadow-lg shadow-green-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCcw className="animate-spin" size={18} />
            ) : (
              <>
                <Check size={18} /> Registrar Ganhador 
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WinnerModal;
