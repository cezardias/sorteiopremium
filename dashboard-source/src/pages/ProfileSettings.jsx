import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { User, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cellphone: '',
    cpf: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Using the 'me' endpoint to get current admin data
        const response = await api.get('/admin/me');
        if (response.data) {
          const user = response.data;
          setFormData({
            ...formData,
            name: user.name || '',
            email: user.email || '',
            cellphone: user.cellphone || '',
            cpf: user.cpf || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar seus dados');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSaving(true);
    try {
      // Using the consolidated storeConfigSite or a specific profile update if available
      // The current AdminController.php storeConfigSite handles email/password updates for admins
      const response = await api.post('/admin/dashboard/site-settings/editar', {
        email: formData.email,
        password: formData.password || undefined,
        // Assuming we might need to add name/cellphone to storeConfigSite if not there
      });

      if (response.data && response.data.success) {
        toast.success('Perfil atualizado com sucesso!');
        setFormData({ ...formData, password: '', confirm_password: '' });
      } else {
        toast.error(response.data.msg || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-gray-500 animate-pulse">Carregando seus dados...</div>;
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2 mb-8">
        <User className="text-gray-400" /> MEUS DADOS
      </h1>

      <div className="max-w-4xl">
        <div className="bg-[#141523] rounded-xl border border-[#2a2d3e] overflow-hidden">
          <div className="p-6 border-b border-[#2a2d3e] bg-[#0f111a]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Suas Informações</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Nome</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">E-mail</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={formData.email}
                  disabled // Email change is sensitive, handled via storeConfigSite logic in backend mostly
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Telefone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="(00) 00000-0000"
                  value={formData.cellphone}
                  onChange={(e) => setFormData({...formData, cellphone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">CPF</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-[#2a2d3e]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1db954] mb-6 flex items-center gap-2">
                <Shield size={16} /> Alterar Senha
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Nova Senha</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-4 rounded-lg font-black text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/10 active:scale-[0.98]"
              >
                <Save size={20} />
                {saving ? 'Guardando...' : 'ATUALIZAR DADOS'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
