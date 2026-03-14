import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/user/login', {
        email,
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError('Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.response || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141523] rounded-xl shadow-2xl overflow-hidden border border-[#2a2d3e] p-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2">
            PREMIUM MULTIMARCAS
          </h1>
          <p className="text-gray-400 text-sm uppercase font-bold tracking-widest">Painel Administrativo</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="w-full bg-[#1e2130] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full bg-[#1e2130] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black uppercase py-4 rounded-lg transition-colors tracking-widest ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? 'Acessando...' : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 text-xs uppercase tracking-widest font-bold">
          v2.0 Native React Build
        </div>
      </div>
    </div>
  );
};

export default Login;
