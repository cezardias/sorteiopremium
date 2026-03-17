import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error('Informe um telefone válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/client/login', { cellphone: phone });
      
      if (response.data?.access_token) {
        localStorage.setItem('client_token', response.data.access_token);
        
        // Use user data from response if available
        if (response.data.user) {
          localStorage.setItem('client_user', JSON.stringify(response.data.user));
        } else {
          // Fallback to fetch user info
          try {
            const configRes = await api.get('/client/pedidos', { params: { phone } });
            localStorage.setItem('client_user', JSON.stringify(configRes.data?.data?.client || {}));
          } catch (err) {
            console.error("Erro ao buscar dados do usuário", err);
          }
        }

        toast.success('Login realizado com sucesso!');
        navigate(from, { replace: true });
        // Force reload to update Navbar state simply
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast.error('Telefone não encontrado na base de dados.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 400) {
        toast.error('Telefone não cadastrado. Faça uma compra primeiro!');
      } else {
        toast.error('Erro ao realizar login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 md:p-12 rounded-[40px] space-y-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full -ml-16 -mb-16" />

          <div className="text-center space-y-3 relative">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
              <UserCheck size={32} />
            </div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Acessar <span className="text-primary italic">Conta</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Utilize seu telefone cadastrado para entrar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">WhatsApp / Celular</label>
              <div className="relative group">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" />
                <input 
                  type="tel" 
                  required
                  className="w-full bg-dark-secondary border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-800 text-white"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(29,185,84,0.3)] transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Entrar Agora</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4 relative">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-primary" />
              Ambiente 100% Seguro
            </div>
            <p className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter text-center leading-relaxed">
              Ao entrar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
