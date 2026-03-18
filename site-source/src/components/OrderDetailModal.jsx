import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, QrCode, Copy, CheckCircle2, Ticket, AlertCircle, ShieldCheck, Clock, XCircle } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const OrderDetailModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusPooling, setStatusPooling] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setStatusPooling(false);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/client/pedido/${orderId}`);
      if (response.data?.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        
        // If it was pending but now it's approved/canceled, the backend already updated it.
        // If it's still pending, start polling.
        if (orderData.status == 0) {
            setStatusPooling(true);
        }
      } else {
        toast.error('Erro ao buscar detalhes do pedido');
        onClose();
      }
    } catch (error) {
      console.error('Fetch detail error:', error);
      toast.error('Erro de conexão ao buscar detalhes');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const checkManualStatus = async () => {
    if (!orderId) return;
    try {
        const res = await api.get(`/produtos/compra-rifas-status/${orderId}`);
        if (res.data?.success && res.data.status == 1) {
            setStatusPooling(false);
            setOrder(prev => ({ ...prev, status: 1, status_label: 'pago' }));
            toast.success('Pagamento Confirmado!');
            if (onSuccess) onSuccess();
            
            setTimeout(() => {
                onClose();
                window.location.reload(); // Hard reload to ensure all states sync
            }, 3000);
        } else {
            toast.error('Pagamento ainda não detectado. Aguarde alguns instantes.');
        }
    } catch (e) {
        toast.error('Erro ao verificar status.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para o seu clipboard!');
  };

  if (!isOpen) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return { icon: <CheckCircle2 className="text-primary" />, color: 'text-primary', label: 'Pago / Finalizado' };
      case 2:
        return { icon: <XCircle className="text-red-500" />, color: 'text-red-500', label: 'Cancelado' };
      default:
        return { icon: <Clock className="text-yellow-500" />, color: 'text-yellow-500', label: 'Aguardando Pagamento' };
    }
  };

  const statusInfo = getStatusInfo(order?.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-dark-secondary rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/5 bg-dark-accent/30">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
               <Ticket className="text-primary" />
               Detalhes do Pedido <span className="text-gray-500 text-sm">#{orderId}</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando seu bilhete...</p>
              </div>
            ) : order && (
              <div className="space-y-8">
                {/* Order Summary */}
                <div className="flex justify-between items-start bg-dark/50 p-6 rounded-3xl border border-white/5">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Produto</p>
                        <h3 className="text-white font-bold uppercase tracking-tight">{order.product_name}</h3>
                        <p className="text-gray-600 text-[10px] font-bold uppercase">{order.created_at}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valor Total</p>
                        <p className="text-primary font-black italic text-xl">R$ {order.total_amount}</p>
                    </div>
                </div>

                {/* Status Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    {statusInfo.icon}
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Situação</p>
                        <p className={`text-xs font-black uppercase tracking-tighter ${statusInfo.color}`}>{statusInfo.label}</p>
                    </div>
                </div>

                {/* Main Content based on status */}
                {order.status == 1 ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Ticket size={12} /> Seus Números ({order.qntd_number})
                             </p>
                             <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {JSON.parse(order.numbers || '[]').map((num, idx) => (
                                    <span key={idx} className="px-3 py-2 bg-primary text-black font-black text-xs rounded-lg shadow-[0_4px_10px_rgba(29,185,84,0.2)]">
                                        {num}
                                    </span>
                                ))}
                             </div>
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-start gap-3">
                            <ShieldCheck className="flex-shrink-0" size={18} />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Seus números já estão registrados em nosso sistema para o sorteio. Boa sorte!
                            </p>
                        </div>
                    </div>
                ) : order.status == 0 ? (
                    <div className="space-y-8 text-center animate-in fade-in duration-500">
                        <div className="mx-auto w-48 h-48 bg-white p-2 rounded-3xl shadow-2xl relative">
                            {order.qr_code_base64 && (
                                <img src={order.qr_code_base64} alt="QR Code PIX" className="w-full h-full" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => copyToClipboard(order.qr_code)}
                                className="w-full bg-dark-accent hover:bg-white/10 text-white font-black uppercase py-4 rounded-xl border border-white/5 flex items-center justify-center gap-3 transition-colors"
                            >
                                <Copy size={18} /> Copiar Código PIX
                            </button>

                            <button 
                                onClick={checkManualStatus}
                                className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_5px_15px_rgba(29,185,84,0.2)]"
                            >
                                <CheckCircle2 size={18} /> Já Paguei / Re-verificar
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs animate-pulse tracking-widest uppercase">
                                <Loader2 size={14} className="animate-spin" />
                                Aguardando pagamento...
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-100 flex items-start gap-3 text-left">
                            <AlertCircle className="flex-shrink-0 text-yellow-400" size={18} />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                O PIX expira em alguns minutos. Após o pagamento, esta janela atualizará automaticamente.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 space-y-4 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full mx-auto flex items-center justify-center text-red-500">
                            <XCircle size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-black uppercase">Pedido Cancelado</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Este pedido expirou ou foi cancelado pelo sistema.</p>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;
