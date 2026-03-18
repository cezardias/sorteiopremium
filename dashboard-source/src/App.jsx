import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Clients from './pages/Clients';
import Raffles from './pages/Raffles';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import Ranking from './pages/Ranking';
import Winners from './pages/Winners';
import SiteSettings from './pages/SiteSettings';
import Users from './pages/Users';
import PaymentSettings from './pages/PaymentSettings';
import ProfileSettings from './pages/ProfileSettings';
import WhatsAppCampaign from './pages/WhatsAppCampaign';
import Affiliates from './pages/Affiliates';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardHome = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-20 text-center text-green-500 font-bold tracking-widest animate-pulse">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          Geral do Painel <span className="text-green-500 ml-2">●</span>
        </h2>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Acompanhamento em tempo real da Premium Multimarcas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Vendas Totais', value: stats?.totalOrders || 0, icon: <ShoppingCart />, color: 'from-blue-500 to-indigo-600' },
          { label: 'Faturamento', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue || 0), icon: <BarChart />, color: 'from-green-400 to-emerald-600' },
          { label: 'Clientes', value: stats?.totalClients || 0, icon: <Users />, color: 'from-purple-500 to-pink-600' },
          { label: 'Rifas Ativas', value: stats?.activeRaffles || 0, icon: <RefreshCcw />, color: 'from-orange-400 to-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141523] border border-[#2a2d3e] p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex flex-col gap-4">
              <div className="text-gray-500 flex items-center gap-2">
                {React.cloneElement(stat.icon, { size: 16, className: "opacity-50" })}
                <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white tracking-tighter">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Orders */}
      <div className="bg-[#141523] border border-[#2a2d3e] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2d3e] flex items-center justify-between">
            <h3 className="font-black uppercase tracking-widest text-xs text-gray-400">Últimos Pedidos</h3>
            <a href="/dashboard/pedidos" className="text-green-500 text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2a2d3e] bg-[#0f111a]/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">COD</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Rifa</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {stats?.latestOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-[#1e2130]/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-green-500">#{order.cod}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white uppercase">{order.client?.name}</span>
                      <span className="text-[10px] text-gray-500">{order.client?.cellphone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">{order.rifa?.title}</td>
                  <td className="px-6 py-4 font-black text-xs text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase border ${
                      order.status === 1 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {order.status === 1 ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PlaceholderPage = ({title}) => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold text-gray-700 uppercase tracking-widest">{title}</h2>
    <p className="text-gray-500 mt-4 font-bold tracking-widest">Página em fase de migração para o novo sistema nativo.</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-gray-400">
    <h1 className="text-6xl font-bold text-red-500/50">404</h1>
    <p className="text-xl mt-4 opacity-70 font-bold uppercase tracking-widest">Rota não encontrada</p>
    <a href="/dashboard" className="mt-6 text-green-500 underline uppercase text-sm font-bold tracking-widest">Voltar para início</a>
  </div>
);

function App() {
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<div className="p-20 text-center text-green-500 font-bold tracking-widest animate-pulse">Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="sorteios" element={<Raffles />} />
            <Route path="vendas" element={<Sales />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="ganhadores" element={<Winners />} />
            <Route path="afiliados" element={<Affiliates />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="site" element={<SiteSettings />} />
            <Route path="pagamentos" element={<PaymentSettings />} />
            <Route path="perfil" element={<ProfileSettings />} />
            <Route path="whatsapp" element={<WhatsAppCampaign />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
