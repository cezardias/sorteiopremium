import React, { useState, useEffect } from 'react';
import { FileText, Search, CreditCard, ChevronRight, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';
import OrderDetailModal from '../components/OrderDetailModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const clientData = JSON.parse(localStorage.getItem('client_user') || '{}');
        const phone = clientData.phone || clientData.cellphone;
        
        if (!phone) {
          setLoading(false);
          return;
        }

        const response = await api.get('/client/pedidos', { params: { phone } });
        setOrders(response.data?.data?.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'finalizado':
      case 'pago':
        return { 
          icon: <CheckCircle2 size={12} />, 
          bg: 'bg-green-500/10 text-green-500 border-green-500/30', 
          label: 'Finalizado' 
        };
      case 'pendente':
        return { 
          icon: <Clock size={12} />, 
          bg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', 
          label: 'Pendente' 
        };
      case 'cancelado':
        return { 
          icon: <XCircle size={12} />, 
          bg: 'bg-red-500/10 text-red-500 border-red-500/30', 
          label: 'Cancelado' 
        };
      default:
        return { 
          icon: <Clock size={12} />, 
          bg: 'bg-gray-500/10 text-gray-500 border-gray-500/30', 
          label: status || 'Processando' 
        };
    }
  };

  const filteredOrders = orders.filter(o => 
    String(o.id).includes(searchQuery) || 
    o.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Meus <span className="text-secondary italic">Pedidos</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Histórico completo de suas participações.</p>
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-secondary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código ou produto..."
            className="w-full bg-dark-secondary border border-white/5 rounded-[24px] pl-16 pr-6 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-secondary/50 transition-all placeholder:text-gray-800" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cod.</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Bilhetes</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Situação</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-10"><div className="h-6 bg-white/5 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={order.id} 
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <span className="text-white font-black italic tracking-tighter">#{order.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white font-bold uppercase tracking-tight text-sm">{order.product_name || 'Produto Premium'}</span>
                          <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{order.created_at || '13/03/2026'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-primary font-black italic text-lg tracking-tighter">R$ {order.total_amount || '0,00'}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-black text-white">{order.tickets_count || '0'} Qtd.</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center">
                          <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.bg}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setIsModalOpen(true);
                          }}
                          className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 group/btn"
                        >
                          <Eye size={18} className="group-hover/btn:rotate-12 transition-transform" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <FileText className="mx-auto text-gray-800 mb-4" size={48} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Você ainda não possui pedidos realizados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orderId={selectedOrderId} 
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default Orders;
