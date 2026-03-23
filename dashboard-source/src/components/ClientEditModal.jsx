import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Fingerprint, 
  Phone,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const ClientEditModal = ({ client, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    surname: '',
    cellphone: '',
    cpf: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id || '',
        name: client.name || '',
        surname: client.surname || '',
        cellphone: client.cellphone || '',
        cpf: client.cpf || '',
        email: client.email || ''
      });
    } else {
      setFormData({
        id: '',
        name: '',
        surname: '',
        cellphone: '',
        cpf: '',
        email: ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const endpoint = client 
        ? '/admin/dashboard/editar/cliente' 
        : '/admin/dashboard/cadastrar/cliente';
      
      const response = client 
        ? await api.put(endpoint, formData)
        : await api.post(endpoint, formData);
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => {
            onSuccess();
        }, 1500);
      } else {
        setError(response.data.msg || 'Erro ao processar a solicitação.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.msg || 'Falha na comunicação com a API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <User className="text-blue-500" /> {client ? 'Editar Perfil' : 'Novo Cliente'}
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              {client ? `ID: #${formData.id}` : 'Cadastro Manual'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <CheckCircle2 size={18} /> {client ? 'Dados atualizados com sucesso!' : 'Cliente cadastrado com sucesso!'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                 <User size={12}/> Nome
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-blue-500/50 uppercase" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Sobrenome</label>
              <input 
                type="text" 
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-blue-500/50 uppercase" 
                required
              />
            </div>
          </div>

          <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                 <Phone size={12} className="text-green-500"/> Telefone {client && '(Não Editável)'}
              </label>
              <input 
                type="text" 
                name="cellphone"
                value={formData.cellphone}
                onChange={handleChange}
                readOnly={!!client}
                className={`w-full border border-[#2a2d3e] text-xs font-bold p-4 rounded-2xl ${client ? 'bg-black/40 text-gray-600 cursor-not-allowed' : 'bg-[#0f111a] text-white focus:border-blue-500/50'}`} 
                required
              />
          </div>

          <div className="space-y-6 pt-4 border-t border-[#2a2d3e]">
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                   <Fingerprint size={12} className="text-purple-500"/> CPF (Obrigatório)
                </label>
                <input 
                   type="text" 
                   name="cpf"
                   value={formData.cpf}
                   onChange={handleChange}
                   placeholder="000.000.000-00"
                   className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-purple-500/50" 
                   required
                />
             </div>
             
             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                   <Mail size={12} className="text-blue-500"/> E-mail (Obrigatório)
                </label>
                <input 
                   type="email" 
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   placeholder="cliente@exemplo.com"
                   className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-xs font-bold p-4 rounded-2xl focus:outline-none focus:border-blue-500/50 lowercase" 
                   required
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-3xl transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Save size={18} /> {loading ? 'Sincronizando...' : client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </form>

        <div className="px-8 py-4 border-t border-[#2a2d3e] bg-[#0f111a]/50">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center">
               Certifique-se de que o CPF e E-mail estão corretos para garantir a validade das premiações.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ClientEditModal;
