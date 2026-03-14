import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Calendar, 
  Filter,
  RefreshCcw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';

const Sales = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchSalesData = async (filter = false) => {
    try {
      setLoading(true);
      const endpoint = filter 
        ? '/admin/dashboard/vendas/filtro'
        : '/admin/dashboard/vendas';
      
      const response = filter
        ? await api.post(endpoint, dateRange)
        : await api.get(endpoint);

      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchSalesData(true);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCcw className="animate-spin text-green-500 mb-4 mx-auto" size={40} />
          <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Carregando Analytics...</p>
        </div>
      </div>
    );
  }

  // Prep data for charts
  const hourlyData = data?.horaDoDia ? Object.entries(data.horaDoDia).map(([hour, value]) => ({
    name: `${hour}h`,
    value: parseFloat(value)
  })) : [];

  const weeklyData = data?.faturamentoSemanal 
    ? (typeof data.faturamentoSemanal === 'object' && !Array.isArray(data.faturamentoSemanal)
        ? Object.entries(data.faturamentoSemanal).map(([day, value]) => ({
            name: day,
            value: parseFloat(value)
          }))
        : [{ name: 'Total Período', value: parseFloat(data.faturamentoSemanal) }]
      )
    : [];

  const dailyData = data?.faturamentoDiario ? Object.entries(data.faturamentoDiario).map(([date, stats]) => ({
    name: date.split('/')[0] + '/' + date.split('/')[1],
    value: parseFloat(stats.totalAprovado),
    pedidos: stats.totalPedidos
  })) : [];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, isCurrency = true }) => (
    <div className="bg-[#141523] p-6 rounded-2xl border border-[#2a2d3e] relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={color.replace('bg-', 'text-')} size={20} />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-white">
            {isCurrency ? formatCurrency(value || 0) : value}
          </h3>
          {trend && (
            <span className={`text-[10px] font-bold flex items-center ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-[9px] text-gray-500 font-bold uppercase mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="text-green-500" /> VENDAS & ANALYTICS
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Desempenho Geral da Plataforma</p>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 bg-[#141523] p-4 rounded-xl border border-[#2a2d3e]">
          <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Início</label>
            <input 
              type="date" 
              className="bg-[#0f111a] border border-[#2a2d3e] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-green-500"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 tracking-widest">Fim</label>
            <input 
              type="date" 
              className="bg-[#0f111a] border border-[#2a2d3e] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-green-500"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all flex items-center gap-2"
          >
            <Filter size={14} /> Filtrar
          </button>
        </form>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Faturamento Total" 
          value={data?.totalPedido} 
          icon={DollarSign} 
          color="bg-green-500"
          isCurrency={true}
          subtitle="Total acumulado em vendas"
        />
        <StatCard 
          title="Pedidos Aprovados" 
          value={data?.pedidosAprovados} 
          icon={ShoppingCart} 
          color="bg-blue-500"
          isCurrency={false}
          subtitle="Vendas confirmadas com sucesso"
        />
        <StatCard 
          title="Aguardando Pagamento" 
          value={data?.totalPedidoAguardando} 
          icon={Clock} 
          color="bg-yellow-500"
          isCurrency={true}
          subtitle={`${data?.pedidosAguardando || 0} pedidos pendentes`}
        />
        <StatCard 
          title="Faturamento Hoje" 
          value={data?.faturamentoDoDia} 
          icon={Calendar} 
          color="bg-purple-500"
          isCurrency={true}
          subtitle="Performance nas últimas 24h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Chart */}
        <div className="bg-[#141523] p-8 rounded-2xl border border-[#2a2d3e]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Faturamento por Hora</h3>
            <div className="px-2 py-1 bg-green-500/10 rounded text-[10px] text-green-500 font-bold uppercase tracking-widest">Pico de Vendas</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1db954" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1db954" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2130" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f111a', border: '1px solid #2a2d3e', borderRadius: '8px' }}
                  itemStyle={{ color: '#1db954', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#52525b', fontSize: '10px', marginBottom: '4px' }}
                  formatter={(value) => [`R$ ${parseFloat(value).toLocaleString('pt-BR')}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="value" stroke="#1db954" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-[#141523] p-8 rounded-2xl border border-[#2a2d3e]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Faturamento Semanal</h3>
            <div className="px-2 py-1 bg-blue-500/10 rounded text-[10px] text-blue-500 font-bold uppercase tracking-widest">Últimos 7 dias</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2130" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  cursor={{fill: '#1f2130'}}
                  contentStyle={{ backgroundColor: '#0f111a', border: '1px solid #2a2d3e', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#52525b', fontSize: '10px', marginBottom: '4px' }}
                  formatter={(value) => [`R$ ${parseFloat(value).toLocaleString('pt-BR')}`, 'Vendido']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === weeklyData.length - 1 ? '#3b82f6' : '#1e3a8a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Progress Table/List */}
        <div className="bg-[#141523] lg:col-span-2 p-8 rounded-2xl border border-[#2a2d3e]">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Performance Diária (Últimos dias)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2a2d3e]">
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Data</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 text-center">Pedidos</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 text-right">Faturamento</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.reverse().map((day, i) => (
                  <tr key={i} className="group hover:bg-[#1f2130] transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white">{day.name}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-black px-2 py-1 bg-[#0f111a] border border-[#2a2d3e] rounded text-gray-400 group-hover:text-blue-400 transition-colors">
                        {day.pedidos}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-black text-green-500">
                        R$ {day.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-1.5 bg-[#0f111a] rounded-full overflow-hidden border border-[#2a2d3e]">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (day.value / (data.totalPedido / 30 || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
