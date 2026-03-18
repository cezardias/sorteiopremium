import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  ShoppingCart, 
  BarChart, 
  Users, 
  RefreshCcw 
} from 'lucide-react';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

export default DashboardHome;
