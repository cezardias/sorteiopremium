import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  ShoppingCart, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  Calendar,
  Ticket,
  Filter,
  RefreshCcw,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async (filterData = null) => {
    try {
      setLoading(true);
      const response = filterData 
        ? await api.post('/admin/dashboard/pedidos/filtro', filterData)
        : await api.get('/admin/dashboard/pedidos');
      
      if (response.data && response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (action, id) => {
    const confirmMessages = {
      approve: 'Deseja realmente APROVAR este pedido manualmente?',
      cancel: 'Deseja realmente CANCELAR este pedido?',
      delete: 'AVISO: Esta ação é IRREVERSÍVEL. Deseja realmente EXCLUIR permanentEMENTE este pedido?'
    };

    if (!window.confirm(confirmMessages[action])) return;

    try {
      let response;
      if (action === 'approve') {
        response = await api.put(`/admin/dashboard/aprovar/pedido/${id}`);
      } else if (action === 'cancel') {
        response = await api.put(`/admin/dashboard/deletar/pedido/${id}`);
      } else if (action === 'delete') {
        response = await api.post(`/admin/dashboard/deletar/pedido/${id}`);
      }

      if (response && response.data && (response.data.success || response.data.data === "Compra cancelada")) {
        fetchOrders();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert('Erro ao realizar ação no pedido.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const term = search.toLowerCase();
    const matchesSearch = 
      order.client?.name?.toLowerCase().includes(term) || 
      order.client?.cellphone?.includes(term) ||
      order.rifa?.title?.toLowerCase().includes(term) ||
      order.cod?.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && order.status === 1) ||
      (statusFilter === 'pending' && order.status === 0);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 1) return (
      <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
        Pago/Aprovado
      </span>
    );
    return (
      <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
        Pendente
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <ShoppingCart className="text-green-500" /> GERENCIAR PEDIDOS
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Total de {filteredOrders.length} pedidos encontrados</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[120px] py-2 text-[10px] font-black uppercase"
          >
            <option value="all">TODOS STATUS</option>
            <option value="approved">APROVADOS</option>
            <option value="pending">PENDENTES</option>
          </select>

          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Nome, Celular, Rifa ou Código..." 
              className="input-field pl-10 py-2 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => fetchOrders()}
            className="p-2 bg-[#141523] border border-[#2a2d3e] text-gray-400 hover:text-white rounded-lg transition-all"
            title="Recarregar"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-[#141523] rounded-2xl border border-[#2a2d3e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1c1f2e] border-b border-[#2a2d3e]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cliente / Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rifa</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Cotas / Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                    Buscando pedidos nos registros...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                    Nenhum pedido condizente com a busca.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-[#1f2130] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-200 uppercase tracking-tight line-clamp-1">{order.client?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 font-bold">{order.client?.cellphone}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold">
                              <Calendar size={10} />
                              {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-block text-left">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide leading-tight max-w-[150px] line-clamp-1">
                          {order.rifa?.title}
                        </p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">COD: {order.cod}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <p className="text-xs font-black text-white flex items-center justify-center gap-1">
                          <Ticket size={12} className="text-blue-500" /> {order.qntd_number}
                        </p>
                        <p className="text-[11px] font-black text-green-500 mt-1">
                          R$ {parseFloat(order.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 0 && (
                          <button 
                            onClick={() => handleAction('approve', order.id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                            title="Aprovar Manualmente"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction('cancel', order.id)}
                          className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all border border-yellow-500/20"
                          title="Cancelar Pedido"
                        >
                          <XCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction('delete', order.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
