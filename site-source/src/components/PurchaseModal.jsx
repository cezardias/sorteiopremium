import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Loader2, QrCode, Copy, CheckCircle2, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const PurchaseModal = ({ isOpen, onClose, raffleId, initialQuantity = 1, startStep = 'selection' }) => {
  console.log("DEBUG: PurchaseModal Version 2.1 Loaded");
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState('selection'); // selection, payment, success
  const [paymentData, setPaymentData] = useState(null);
  const [buying, setBuying] = useState(false);
  const [statusPooling, setStatusPooling] = useState(false);

  useEffect(() => {
    if (isOpen && raffleId) {
      setQuantity(initialQuantity);
      setStep(startStep);
      fetchRaffle();
    } else {
        // Reset state when closing
        setStep('selection');
        setQuantity(1);
        setPaymentData(null);
        setStatusPooling(false);
    }
  }, [isOpen, raffleId, initialQuantity, startStep]);

  // Auto-trigger purchase if starting at payment step
  useEffect(() => {
    if (isOpen && step === 'payment' && raffle && !paymentData && !buying) {
      handleBuy();
    }
  }, [isOpen, step, raffle, paymentData, buying]);

  const fetchRaffle = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/produtos/detalhes/${raffleId}`);
      if (response.data?.success) {
        setRaffle(response.data.data.rifa);
      } else {
        toast.error('Erro ao buscar detalhes da rifa');
        onClose();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro de conexão');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (val) => {
    const max = raffle?.cota?.qntd_cota_max_order || 1000;
    setQuantity(Math.max(1, Math.min(val, max)));
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('client_token');
    const clientInfo = JSON.parse(localStorage.getItem('client_user') || '{}');

    if (!token || (!clientInfo.id && !clientInfo.phone && !clientInfo.cellphone)) {
      toast.error('Você precisa estar logado para comprar');
      return;
    }

    setBuying(true);
    try {
      const payload = {
        client_id: clientInfo.id,
        qntd_number: quantity,
        rifas_id: raffle.id,
        pacote_promo: 0,
        cotas_double: 0
      };

      const response = await api.post('/produtos/compra-rifas', payload);
      if (response.data?.success) {
        setPaymentData(response.data.data);
        setStep('payment');
        setStatusPooling(true);
      } else {
        toast.error(response.data?.msg || 'Erro ao processar compra');
      }
    } catch (error) {
        console.error('Purchase error:', error);
        const msg = error.response?.data?.msg;
        toast.error(typeof msg === 'string' ? msg : 'Erro ao realizar compra');
    } finally {
      setBuying(false);
    }
  };

  // Pooling for status
  useEffect(() => {
    let interval;
    if (statusPooling && paymentData?.id) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/produtos/compra-rifas-status/${paymentData.id}`);
          if (res.data?.success && res.data.status == 1) {
            setStatusPooling(false);
            setStep('success');
            toast.success('Pagamento Confirmado!');
            
            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
                window.location.href = '#/meus-pedidos';
            }, 3000);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [statusPooling, paymentData]);

  const checkManualStatus = async () => {
    if (!paymentData?.id) return;
    setBuying(true); // Re-use buying state for local loader if needed, or just let it spin
    try {
        const res = await api.get(`/produtos/compra-rifas-status/${paymentData.id}`);
        if (res.data?.success && res.data.status == 1) {
            setStatusPooling(false);
            setStep('success');
            toast.success('Pagamento Confirmado!');
            
            setTimeout(() => {
                onClose();
                window.location.href = '#/meus-pedidos';
            }, 3000);
        } else {
            toast.error('Pagamento ainda não detectado. Aguarde alguns instantes.');
        }
    } catch (e) {
        toast.error('Erro ao verificar status.');
    } finally {
        setBuying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para o seu clipboard!');
  };

  if (!isOpen) return null;

  const totalPrice = (parseFloat(raffle?.price || 0) * quantity).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-dark-secondary rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/5 bg-dark-accent/30">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
               <ShoppingBag className="text-primary" />
               {step === 'selection' ? 'Participar' : step === 'payment' ? 'Pagamento PIX' : 'Sucesso!'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-4 sm:p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando detalhes...</p>
              </div>
            ) : (
              <>
                {step === 'selection' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden glass border-white/5 flex-shrink-0">
                        <img 
                          src={raffle?.rifa_image?.[0]?.path ? `/api/img/rifas/${raffle.rifa_image[0].path}` : 'https://placehold.co/200?text=Rifa'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{raffle?.title}</h3>
                        <p className="text-primary font-black italic text-xl">R$ {raffle?.price || '0,00'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-dark rounded-2xl border border-white/5">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Bilhetes</span>
                        <div className="flex items-center gap-6">
                          <button onClick={() => handleQuantityChange(quantity - 1)} className="p-2 text-gray-400 hover:text-white transition-colors"><Minus size={18} /></button>
                          <span className="text-2xl font-black text-white w-8 text-center">{quantity}</span>
                          <button onClick={() => handleQuantityChange(quantity + 1)} className="p-2 text-gray-400 hover:text-white transition-colors"><Plus size={18} /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 50, 100].map(qty => (
                          <button
                            key={qty}
                            onClick={() => setQuantity(prev => prev + qty)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                                false ? "bg-primary text-black" : "bg-dark text-gray-500 border border-white/5"
                            }`}
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total a pagar</span>
                        <span className="text-3xl font-black text-white italic">{totalPrice}</span>
                      </div>
                      
                      <button 
                        onClick={handleBuy}
                        disabled={buying}
                        className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(29,185,84,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {buying ? <Loader2 className="animate-spin" /> : <>Continuar <ChevronRight size={18} /></>}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-8 text-center">
                    <div className="space-y-2">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Pedido #{paymentData?.id}</p>
                        <h3 className="text-2xl font-black text-white italic">R$ {paymentData?.value || '0,00'}</h3>
                    </div>

                    <div className="mx-auto w-48 h-48 bg-white p-2 rounded-3xl shadow-2xl relative">
                        {paymentData?.qr_code_base64 && (
                            <img src={paymentData.qr_code_base64} alt="QR Code PIX" className="w-full h-full" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group">
                            {/* Overlay if needed */}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => copyToClipboard(paymentData?.qr_code)}
                            className="w-full bg-dark-accent hover:bg-white/10 text-white font-black uppercase py-4 rounded-xl border border-white/5 flex items-center justify-center gap-3 transition-colors"
                        >
                            <Copy size={18} /> Copiar Código PIX
                        </button>

                        <button 
                            onClick={checkManualStatus}
                            className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_5px_15px_rgba(29,185,84,0.2)]"
                        >
                            <CheckCircle2 size={18} /> Já Paguei
                        </button>
                        
                        <div className="flex items-center justify-center gap-2 text-[#1db954] font-bold text-xs animate-pulse">
                            <Loader2 size={14} className="animate-spin" />
                            Aguardando pagamento...
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-100 flex items-start gap-3 text-left">
                        <AlertCircle className="flex-shrink-0 text-yellow-400" size={18} />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            Após o pagamento, esta janela fechará automaticamente. Não é necessário enviar comprovante.
                        </p>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="py-12 space-y-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-black"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                            Pagamento <span className="text-primary">Confirmado!</span>
                        </h3>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aproveite e boa sorte!</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-primary">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compra Segura</span>
                    </div>

                    <button 
                        onClick={onClose}
                        className="btn-primary w-full"
                    >
                        Fechar Janela
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
