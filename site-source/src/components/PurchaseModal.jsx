import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Loader2, Copy, CheckCircle2, ChevronRight, AlertCircle, ShieldCheck, ChevronDown, ChevronUp, Star, Smile, Zap } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const PurchaseModal = ({ isOpen, onClose, raffleId, initialQuantity = 1, startStep = 'selection' }) => {
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [step, setStep] = useState('selection');
  const [authMode, setAuthMode] = useState('register');
  const [paymentData, setPaymentData] = useState(null);
  const [buying, setBuying] = useState(false);
  const [statusPooling, setStatusPooling] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [awardedTab, setAwardedTab] = useState('ativas');
  const [showProductDesc, setShowProductDesc] = useState(false);
  const [showSorteioDesc, setShowSorteioDesc] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    cellphone: '',
    email: '',
    cpf: ''
  });

  const [loadingAuth, setLoadingAuth] = useState(false);
 
  const fetchRaffle = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/produtos/detalhes/${raffleId}`);
      if (response.data?.success) {
        const fetchedRaffle = response.data.data.rifa;
        setRaffle(fetchedRaffle);
        
        const minOrder = parseInt(fetchedRaffle?.cota?.qntd_cota_min_order) || 1;
        setQuantity(minOrder);
      } else {
        toast.error('Sorteio não encontrado');
      }
    } catch (error) {
      console.error('Error fetching raffle:', error);
      toast.error('Erro ao carregar detalhes da rifa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && raffleId) {
      setQuantity(initialQuantity || 1);
      setStep(startStep);
      setAwardedTab('ativas');
      setShowProductDesc(false);
      setShowSorteioDesc(false);
      fetchRaffle();
      
      const clientInfo = JSON.parse(localStorage.getItem('client_user') || '{}');
      if (clientInfo.id) {
          setFormData(prev => ({
              ...prev,
              name: clientInfo.name || '',
              surname: clientInfo.surname || '',
              cellphone: clientInfo.cellphone || clientInfo.phone || '',
              email: clientInfo.email || '',
              cpf: clientInfo.cpf || ''
          }));
      }
    } else {
        setStep('selection');
        setQuantity(initialQuantity || 1);
        setPaymentData(null);
        setStatusPooling(false);
    }
  }, [isOpen, raffleId, initialQuantity, startStep]);

  const handleQuantityChange = (newQty) => {
    const min = parseInt(raffle?.cota?.qntd_cota_min_order) || 1;
    const max = parseInt(raffle?.cota?.qntd_cota_max_order) || 99999;
    let finalQty = parseInt(newQty);
    
    if (isNaN(finalQty)) return;
    
    if (finalQty < min) {
      finalQty = min;
      toast.error(`A quantidade mínima é ${min}`, { id: 'min-qty' });
    } else if (finalQty > max) {
      finalQty = max;
      toast.error(`A quantidade máxima é ${max}`, { id: 'max-qty' });
    }
    
    setQuantity(finalQty);
  };

  const maskPhone = (value) => {
    const numbers = value.replace(/\D/g, '').substring(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    if (numbers.length <= 10) return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
  };

  const handlePhoneChange = (e) => {
    setFormData({ ...formData, cellphone: maskPhone(e.target.value) });
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('client_token');
    const clientInfo = JSON.parse(localStorage.getItem('client_user') || '{}');

    if (!token || !clientInfo.id) {
      setStep('auth');
      return;
    }
    
    if (!clientInfo.cpf || !clientInfo.email) {
      setFormData(prev => ({
        ...prev,
        name: clientInfo.name || '',
        surname: clientInfo.surname || '',
        cellphone: clientInfo.cellphone || '',
        email: clientInfo.email || '',
        cpf: clientInfo.cpf || ''
      }));
      setAuthMode('register');
      setStep('auth');
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
        if (error.response?.status === 401) {
            localStorage.removeItem('client_token');
            localStorage.removeItem('client_user');
            setStep('auth');
            toast.error('Sessão expirada. Por favor, entre novamente.');
        } else {
            toast.error(error.response?.data?.msg || 'Erro ao realizar compra');
        }
    } finally {
      setBuying(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      if (authMode === 'register') {
          if (!termsAccepted) {
              toast.error('Você precisa aceitar os termos');
              return;
          }
          const response = await api.post('/client/cadastro', formData);
          if (response.data?.message === 'Novo cliente criado.' || response.status === 201) {
              toast.success('Cadastro realizado!');
              const normalizedPhone = formData.cellphone.replace(/\D/g, '');
              const loginRes = await api.post('/client/login', { cellphone: normalizedPhone });
              if (loginRes.data?.access_token) {
                  localStorage.setItem('client_token', loginRes.data.access_token);
                  localStorage.setItem('client_user', JSON.stringify(loginRes.data.user));
                  handleBuy();
              }
          } else {
              toast.error(response.data?.message || 'Erro no cadastro. Verifique se o telefone já existe.');
          }
      } else {
          const normalizedPhone = formData.cellphone.replace(/\D/g, '');
          const response = await api.post('/client/login', { cellphone: normalizedPhone });
          if (response.data?.access_token) {
              localStorage.setItem('client_token', response.data.access_token);
              localStorage.setItem('client_user', JSON.stringify(response.data.user));
              
              const user = response.data.user;
              if (!user.cpf || !user.email) {
                  setFormData({
                    ...formData,
                    name: user.name || '',
                    surname: user.surname || '',
                    cellphone: user.cellphone || user.phone || '',
                    cpf: user.cpf || '',
                    email: user.email || ''
                  });
                  toast.success('Login realizado! Por favor, complete seu cadastro.');
                  setAuthMode('register');
              } else {
                toast.success('Bem-vindo de volta!');
                handleBuy();
              }
          } else {
              toast.error('Telefone não encontrado');
          }
      }
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erro na autenticação. Verifique os dados.';
        toast.error(errorMsg);
    } finally {
        setLoadingAuth(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const clientInfo = JSON.parse(localStorage.getItem('client_user') || '{}');
    
    setLoadingAuth(true);
    try {
      const response = await api.post('/client/update-profile', {
        ...formData,
        client_id: clientInfo.id
      });

      if (response.data?.success) {
        toast.success('Perfil atualizado com sucesso!');
        localStorage.setItem('client_user', JSON.stringify(response.data.client));
        handleBuy();
      } else {
        toast.error(response.data?.msg || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao salvar dados');
    } finally {
      setLoadingAuth(false);
    }
  };

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
    setBuying(true);
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
            toast.error('Pagamento ainda não detectado. O Pix pode levar até 2 minutos para confirmar. Por favor, aguarde um momento e tente novamente.');
        }
    } catch (e) {
        toast.error('Não foi possível verificar agora. Se você já pagou, aguarde 1 minuto ou verifique a seção "Meus Pedidos" no menu principal.');
    } finally {
        setBuying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para o seu clipboard!');
  };

  if (!isOpen) return null;

  const pricePerCota = parseFloat(raffle?.price || (raffle?.discountPackage || raffle?.discount_package)?.[0]?.value_cota || 0);
  const totalPriceValue = pricePerCota * quantity;
  const totalPrice = totalPriceValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const cotasAtivas = ((raffle?.awardedQuota || raffle?.awarded_quota) || []).filter(q => q.status === 'imediato' || q.status === 'bloqueada');
  const cotasResgatadas = ((raffle?.awardedQuota || raffle?.awarded_quota) || []).filter(q => q.status === 'resgatada');

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
  };

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
          className="relative w-full max-w-lg bg-dark-secondary rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/5 bg-dark-accent/30 flex-shrink-0">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
               <ShoppingBag className="text-primary" />
                {step === 'selection' ? 'Participar' : step === 'auth' ? (authMode === 'register' ? 'Cadastro' : 'Acesse sua Conta') : step === 'payment' ? 'Pagamento PIX' : 'Sucesso!'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando detalhes...</p>
                </div>
              ) : (
                <>
                {/* ===== STEP: AUTH ===== */}
                {step === 'auth' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">
                            {authMode === 'register' ? 'Registrar Conta' : 'Fazer Login'}
                        </h3>
                        <button 
                            type="button"
                            onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                        >
                            {authMode === 'register' ? 'Já sou cliente!' : 'Quero me registrar'}
                        </button>
                    </div>

                    <form onSubmit={authMode === 'register' ? handleAuth : handleAuth} className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-3xl space-y-4 border border-white/5">
                            {authMode === 'register' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                                            <input 
                                                type="text" 
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="Nome"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sobrenome</label>
                                            <input 
                                                type="text" 
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                                                placeholder="Sobrenome"
                                                value={formData.surname}
                                                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp / Celular</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                            placeholder="(00) 00000-0000"
                                            value={formData.cellphone}
                                            onChange={handlePhoneChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                        <input 
                                            type="email" 
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                                            placeholder="000.000.000-00"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp / Celular</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                                        placeholder="(00) 00000-0000"
                                        value={formData.cellphone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Valor do pedido:</span>
                            <span className="text-lg font-black text-white italic">{totalPrice}</span>
                        </div>

                        {authMode === 'register' && (
                            <div className="bg-yellow-400/5 border border-yellow-400/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${termsAccepted ? 'bg-primary border-primary' : 'border-yellow-400/50 bg-black/40'}`}>
                                        {termsAccepted && <CheckCircle2 size={12} className="text-black" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                        Aceito os termos e condições de uso
                                    </span>
                                </div>
                                <button type="button" className="mt-2 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                                    Ver Termos e Condições
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                type="button"
                                onClick={() => setStep('selection')}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs rounded-xl transition-all"
                            >
                                Voltar
                            </button>
                            <button 
                                type="submit"
                                disabled={loadingAuth || (authMode === 'register' && !termsAccepted)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 font-black uppercase text-xs rounded-xl transition-all ${
                                    (authMode === 'register' && !termsAccepted) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-[0_5px_15px_rgba(29,185,84,0.2)]'
                                }`}
                            >
                                {loadingAuth ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        {authMode === 'register' ? 'Quero participar' : 'Acesse sua Conta'}
                                        <CheckCircle2 size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                  </div>
                )}

                {/* ===== STEP: SELECTION ===== */}
                {step === 'selection' && (
                  <div className="space-y-6">
                    {/* Raffle Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden glass border border-white/10 flex-shrink-0">
                        <img 
                          src={(raffle?.rifaImage || raffle?.rifa_image)?.[0]?.path ? `/api/img/rifas/${(raffle.rifaImage || raffle.rifa_image)[0].path}` : 'https://placehold.co/200?text=Rifa'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">{raffle?.title}</h3>
                        <p className="text-primary font-black italic text-lg">
                          {pricePerCota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / cota
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-dark rounded-2xl border border-white/5">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Bilhetes</span>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleQuantityChange(quantity - 1)} 
                            className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors border border-primary/20"
                          >
                            <Minus size={20} />
                          </button>
                          <span className="text-2xl font-black text-white w-12 text-center">{quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors border border-primary/20"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Quick add buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 50, 100].map(qty => (
                          <button
                            key={qty}
                            onClick={() => handleQuantityChange(quantity + qty)}
                            className="py-2.5 bg-dark text-gray-400 border border-white/5 rounded-xl text-[10px] font-black uppercase hover:border-primary/50 transition-all hover:text-white"
                          >
                            +{qty}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Promotional Packages */}
                    {(raffle?.discountPackage || raffle?.discount_package)?.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={12} className="text-primary" /> Pacotes Promocionais
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {(raffle.discountPackage || raffle.discount_package).map(pkg => {
                            const isSelected = quantity === parseInt(pkg.qntd_cota);
                            const isPopular = pkg.popular === 'sim';
                            return (
                              <button
                                key={pkg.id}
                                onClick={() => setQuantity(parseInt(pkg.qntd_cota))}
                                className={`relative flex flex-col items-center justify-center p-2 pt-5 rounded-xl border text-center transition-all ${
                                  isSelected
                                    ? 'border-primary bg-primary/10 shadow-[0_0_10px_var(--color-primary)]'
                                    : isPopular
                                      ? 'border-primary/50 bg-white/5 hover:border-primary'
                                      : 'border-white/5 bg-dark hover:border-white/20'
                                }`}
                              >
                                {isPopular && (
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-lg">
                                    Mais popular
                                  </div>
                                )}
                                <span className={`text-[13px] font-black leading-tight ${isSelected ? 'text-primary' : 'text-white'}`}>
                                  {parseInt(pkg.qntd_cota).toLocaleString('pt-BR')}
                                </span>
                                <span className="text-[7px] font-black text-primary/70 line-through leading-none">
                                  R$ {(pricePerCota * parseInt(pkg.qntd_cota)).toFixed(2)}
                                </span>
                                <span className={`text-[10px] font-black leading-none ${isSelected ? 'text-white' : 'text-primary'}`}>
                                  R$ {parseFloat(pkg.valor_total).toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Total + Continuar */}
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total a pagar</span>
                        <span className="text-3xl font-black text-white italic">{totalPrice}</span>
                      </div>
                      
                      <button 
                        onClick={handleBuy}
                        disabled={buying}
                        className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-5 rounded-full transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {buying ? <Loader2 className="animate-spin" /> : <>Continuar <ChevronRight size={18} /></>}
                      </button>
                    </div>

                    {/* Cotas Premiadas */}
                    {raffle?.awarded_quota?.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">🏆 Cotas Premiadas</h4>
                        {/* Tabs */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAwardedTab('ativas')}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                              awardedTab === 'ativas' ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            Cotas Ativas ({cotasAtivas.length})
                          </button>
                          <button
                            onClick={() => setAwardedTab('resgatadas')}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                              awardedTab === 'resgatadas' ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            Cotas Resgatadas ({cotasResgatadas.length})
                          </button>
                        </div>

                        {/* Cotas Grid */}
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                          {(awardedTab === 'ativas' ? cotasAtivas : cotasResgatadas).map(cota => (
                            <div
                              key={cota.id}
                              className={`p-3 rounded-xl border text-center space-y-1 ${
                                awardedTab === 'resgatadas' 
                                  ? 'border-primary/30 bg-primary/5' 
                                  : 'border-white/10 bg-dark'
                              }`}
                            >
                              <div className="text-lg">😊</div>
                              {cota.client && (
                                <p className="text-[10px] font-black text-white truncate">
                                  {cota.client.name} {cota.client.surname?.charAt(0)}.
                                </p>
                              )}
                              <p className="text-xs font-black text-primary">{cota.award}</p>
                              <p className="text-[9px] text-gray-500 font-bold">Nº {cota.number_cota?.toLocaleString('pt-BR')}</p>
                            </div>
                          ))}
                          {(awardedTab === 'ativas' ? cotasAtivas : cotasResgatadas).length === 0 && (
                            <div className="col-span-2 py-4 text-center text-gray-600 text-xs font-bold">
                              Nenhuma cota nesta categoria
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description Accordions */}
                    {raffle?.description_product && (
                      <div className="border border-white/10 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setShowProductDesc(!showProductDesc)}
                          className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-xs font-black text-white uppercase tracking-widest">📦 Descrição do Produto</span>
                          {showProductDesc ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                        {showProductDesc && (
                          <div className="p-4 text-xs text-gray-400 leading-relaxed whitespace-pre-line bg-dark/50">
                            {stripHtml(raffle.description_product)}
                          </div>
                        )}
                      </div>
                    )}

                    {raffle?.description_role && (
                      <div className="border border-white/10 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setShowSorteioDesc(!showSorteioDesc)}
                          className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-xs font-black text-white uppercase tracking-widest">📋 Descrição do Sorteio</span>
                          {showSorteioDesc ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                        {showSorteioDesc && (
                          <div className="p-4 text-xs text-gray-400 leading-relaxed whitespace-pre-line bg-dark/50">
                            {stripHtml(raffle.description_role)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== STEP: PAYMENT ===== */}
                {step === 'payment' && (
                  <div className="space-y-8 text-center">
                    <div className="space-y-2">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Pedido #{paymentData?.id}</p>
                        <h3 className="text-2xl font-black text-white italic">R$ {parseFloat(paymentData?.value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                    </div>

                    <div className="mx-auto w-48 h-48 bg-white p-2 rounded-3xl shadow-2xl relative">
                        {paymentData?.qr_code_base64 && (
                            <img src={paymentData.qr_code_base64} alt="QR Code PIX" className="w-full h-full" />
                        )}
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

                {/* ===== STEP: SUCCESS ===== */}
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
                        className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-5 rounded-2xl transition-all"
                    >
                        Fechar Janela
                    </button>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PurchaseModal;
