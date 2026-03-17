import React, { useState, useEffect } from 'react';
import { User, Mail, CreditCard, AlertCircle, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', cpf: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/config').catch(() => ({ data: JSON.parse(localStorage.getItem('client_user') || '{}') }));
        setUser(response.data || { name: '', email: '', cpf: '', phone: '' });
      } catch (error) {
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user.cpf || !user.email) {
      toast.error('CPF e E-mail são obrigatórios para continuar!');
      return;
    }
    setSaving(true);
    try {
      await api.post('/client/update-profile', user);
      toast.success('Perfil atualizado com sucesso!');
      localStorage.setItem('client_user', JSON.stringify(user));
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const isProfileIncomplete = !user.cpf || !user.email;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Meu <span className="text-primary italic">Perfil</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Gerencie suas informações e mantenha sua conta segura.</p>
      </div>

      <AnimatePresence>
        {isProfileIncomplete && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-accent/10 border border-accent/30 p-6 rounded-[32px] flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Ação Necessária!</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
                Você precisa cadastrar seu <span className="text-accent underline">CPF e E-mail</span> para poder realizar compras e resgatar seus prêmios. 
                Sua segurança é nossa prioridade.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[40px] text-center space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary relative">
              <User size={48} />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dark border-2 border-dark-secondary flex items-center justify-center">
                <CheckCircle2 size={16} className={isProfileIncomplete ? 'text-gray-600' : 'text-primary'} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{user.name || 'Usuário'}</h3>
              <p className="text-primary font-bold uppercase tracking-widest text-[10px]">Cliente Premium</p>
            </div>
            <button className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
              <LogOut size={14} /> Sair da Conta
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass p-8 md:p-12 rounded-[40px] space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Nome Completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    className="w-full bg-dark-secondary border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-800"
                    placeholder="Seu nome"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">WhatsApp / Telefone</label>
                <div className="relative opacity-60">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    disabled
                    className="w-full bg-dark-secondary border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-widest cursor-not-allowed"
                    value={user.phone}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">E-mail <span className="text-accent">*</span></label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="email" 
                    required
                    className={`w-full bg-dark-secondary border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none transition-all placeholder:text-gray-800 ${!user.email ? 'border-accent/40 focus:border-accent' : 'border-white/5 focus:border-primary/50'}`}
                    placeholder="exemplo@email.com"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">CPF <span className="text-accent">*</span></label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    required
                    className={`w-full bg-dark-secondary border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none transition-all placeholder:text-gray-800 ${!user.cpf ? 'border-accent/40 focus:border-accent' : 'border-white/5 focus:border-primary/50'}`}
                    placeholder="000.000.000-00"
                    value={user.cpf}
                    onChange={(e) => setUser({...user, cpf: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(29,185,84,0.3)] transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Dados do Perfil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
