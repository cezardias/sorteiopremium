import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Shield, Zap, Target, Star, ChevronLeft, Plus, Minus, AlertCircle, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import PurchaseModal from '../components/PurchaseModal';

const RaffleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showProductDesc, setShowProductDesc] = useState(false);
  const [showSorteioDesc, setShowSorteioDesc] = useState(false);
  const [awardedTab, setAwardedTab] = useState('ativas');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/produtos/detalhes/${id}`);
        if (response.data?.success) {
          setRaffle(response.data.data.rifa);
          setRanking(response.data.data.ranking || []);
        } else {
          toast.error('Sorteio não encontrado');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching raffle:', error);
        toast.error('Erro ao carregar detalhes');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleQuantityChange = (val) => {
    const newQty = Math.max(1, Math.min(val, raffle?.cota?.qntd_cota_max_order || 1000));
    setQuantity(newQty);
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('client_token');
    const clientData = JSON.parse(localStorage.getItem('client_user') || '{}');
    if (!token || (!clientData.id && !clientData.phone && !clientData.cellphone)) {
      setModalOpen(true);
      return;
    }

    setBuying(true);
    try {
      const payload = {
        client_id: clientData.id,
        qntd_number: quantity,
        rifas_id: raffle.id,
        pacote_promo: 0,
        cotas_double: 0
      };

      const response = await api.post('/produtos/comprar', payload);
      
      if (response.data?.success) {
        toast.success('Pedido gerado com sucesso!');
        // Se houver Link de pagamento, redirecionar ou mostrar info
        if (response.data.data?.payment_link) {
            window.location.href = response.data.data.payment_link;
        } else {
            navigate('/meus-pedidos');
        }
      } else {
        toast.error(response.data?.msg || 'Erro ao processar compra');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const msg = error.response?.data?.msg;
      toast.error(typeof msg === 'string' ? msg : 'Erro ao realizar compra. Tente novamente.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Carregando Detalhes...</p>
      </div>
    );
  }

  const totalPrice = (parseFloat(raffle.price || 0) * quantity).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <div className="space-y-12 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-black uppercase tracking-widest text-xs group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="aspect-square rounded-[40px] overflow-hidden glass border-white/5 relative group">
            <img 
              src={raffle.rifa_image?.[0]?.path ? `https://sorteiospremiummultimarcas.com.br/api/public/storage/${raffle.rifa_image[0].path}` : 'https://placehold.co/800x600?text=Foto+do+Prêmio'} 
              alt={raffle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.target.src = "https://placehold.co/800x800?text=Foto+do+Prêmio"; }}
            />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 rounded-full bg-primary text-black text-xs font-black uppercase tracking-widest shadow-xl">
                {raffle.status === 'ativas' ? 'Disponível' : 'Em Breve'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {raffle.rifa_image?.slice(1, 5).map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden glass border-white/5">
                <img src={`https://sorteiospremiummultimarcas.com.br/api/public/storage/${img.path}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Product Info & Purchase */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              {raffle.title}
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm leading-relaxed">
              {raffle.subtitle || raffle.description}
            </p>
          </div>

          <div className="glass p-8 rounded-[40px] border-primary/20 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Valor Unitário</span>
                <span className="text-3xl font-black text-primary italic">R$ {raffle.price || '0,00'}</span>
              </div>
              <div className="flex flex-col gap-6 bg-dark/30 rounded-3xl p-6 border border-white/5">
                <div className="flex items-center justify-between">
                  <input 
                    type="range" 
                    min={raffle?.cota?.qntd_cota_min_order || 1}
                    max={raffle?.cota?.qntd_cota_max_order || 1000}
                    step={1}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 10, 50, 100].map(val => (
                    <button 
                      key={val}
                      onClick={() => handleQuantityChange(quantity + val)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
                    >
                      +{val}
                    </button>
                  ))}
                  <button 
                    onClick={() => setQuantity(raffle?.cota?.qntd_cota_min_order || 1)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantidade</span>
                  <div className="flex items-center gap-4 bg-[#0f111a] rounded-2xl p-1 border border-white/5">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 bg-transparent text-center font-black text-xl text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {raffle.discount_package?.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={14} className="text-primary" /> Pacotes Promocionais
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {raffle.discount_package.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => {
                        setQuantity(parseInt(pkg.qntd_cota));
                        setModalOpen(true);
                      }}
                      className="relative glass p-4 rounded-2xl border-white/5 hover:border-primary/50 transition-all text-center group overflow-hidden"
                    >
                      {pkg.popular === 'sim' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-3 py-0.5 rounded-b-lg uppercase tracking-widest z-10 shadow-lg">
                          Mais Popular
                        </div>
                      )}
                      <div className="text-lg font-black text-white group-hover:text-primary transition-colors">{pkg.qntd_cota}</div>
                      <div className="text-[9px] font-black text-gray-500 line-through uppercase">R$ {(parseFloat(raffle.price) * pkg.qntd_cota).toFixed(2)}</div>
                      <div className="text-xs font-black text-primary italic">R$ {parseFloat(pkg.valor_total).toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total a pagar</span>
                <span className="text-4xl font-black text-white italic tracking-tighter">{totalPrice}</span>
              </div>
              
              <button 
                onClick={() => setModalOpen(true)}
                disabled={buying}
                className="w-full bg-primary hover:bg-[#1ed760] text-black font-black uppercase py-6 rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(29,185,84,0.25)] hover:shadow-[0_25px_50px_rgba(29,185,84,0.35)] flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
              >
                  <div className="flex items-center gap-3 relative z-10">
                    <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-lg tracking-wider">Comprar Agora</span>
                  </div>
                  <span className="text-[10px] opacity-70 relative z-10">PAGAMENTO SEGURO VIA PIX</span>
                  
                  {/* Glossy Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { icon: <Shield size={18} />, text: "Garantia Total" },
               { icon: <Zap size={18} />, text: "Sorteio Rápido" },
               { icon: <Target size={18} />, text: "Transparência" }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 p-4 glass rounded-2xl border-white/5">
                 <div className="text-primary">{item.icon}</div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.text}</span>
               </div>
             ))}
          </div>

          {/* Expandable Descriptions */}
          <div className="space-y-4">
             <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                <button 
                  onClick={() => setShowProductDesc(!showProductDesc)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                >
                   <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
                      <ShoppingBag size={18} className="text-primary" /> Descrição do Produto
                   </span>
                   {showProductDesc ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                <AnimatePresence>
                   {showProductDesc && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                         <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed font-bold whitespace-pre-wrap">
                            {raffle.description_product || 'Nenhuma descrição detalhada disponível.'}
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>

             <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                <button 
                  onClick={() => setShowSorteioDesc(!showSorteioDesc)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                >
                   <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
                      <Info size={18} className="text-primary" /> Detalhes do Sorteio
                   </span>
                   {showSorteioDesc ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                <AnimatePresence>
                   {showSorteioDesc && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                         <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed font-bold whitespace-pre-wrap">
                            {raffle.description_sortition || 'As regras gerais deste sorteio seguem os termos de uso do site.'}
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Awarded Tickets Section */}
      {raffle.awarded_quota?.length > 0 && (
        <section className="glass rounded-[40px] p-10 border-white/5">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                 <Star className="text-primary" fill="currentColor" /> Bilhetes <span className="text-gray-600">Premiados</span>
               </h2>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Achou? Levou na hora!</p>
            </div>
            <div className="flex bg-dark/50 p-1 rounded-2xl border border-white/5 self-start">
               <button 
                onClick={() => setAwardedTab('ativas')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${awardedTab === 'ativas' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
               >
                 Cotas Ativas
               </button>
               <button 
                onClick={() => setAwardedTab('resgatadas')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${awardedTab === 'resgatadas' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
               >
                 Resgatadas
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {raffle.awarded_quota
              .filter(award => awardedTab === 'ativas' ? !award.client : !!award.client)
              .map((award) => (
              <div 
                key={award.id} 
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  award.client ? 'bg-dark/40 border-gray-800 opacity-60' : 'bg-primary/5 border-primary/20 hover:scale-105'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${award.client ? 'text-gray-600' : 'text-primary animate-pulse'}`}>
                  <Star size={20} fill={award.client ? "transparent" : "currentColor"} />
                </div>
                <div className={`text-sm font-black uppercase tracking-tight ${award.client ? 'line-through text-gray-500' : 'text-white'}`}>
                  {award.number_cota}
                </div>
                <div className="text-[10px] font-black text-primary mt-1">
                  R$ {parseFloat(award.award).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                {award.client && (
                  <div className="text-[8px] font-black text-gray-600 uppercase mt-2 line-clamp-1 italic">
                    {award.client.name.split(' ')[0]}
                  </div>
                )}
              </div>
            ))}
            {raffle.awarded_quota.filter(award => awardedTab === 'ativas' ? !award.client : !!award.client).length === 0 && (
               <div className="col-span-full py-12 text-center text-[10px] font-black uppercase text-gray-600 tracking-[0.3em]">
                  Nenhum bilhete {awardedTab === 'ativas' ? 'disponível' : 'resgatado'} no momento
               </div>
            )}
          </div>
        </section>
      )}

      {/* Ranking / Ranking Section if needed */}
      {ranking.length > 0 && (
          <section className="glass rounded-[40px] p-10 border-white/5">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3 mb-8">
                <Star className="text-primary" fill="currentColor" /> Top <span className="text-gray-600">Compradores</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ranking.map((rank, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-dark/50 border border-white/5">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                              i === 0 ? 'bg-yellow-400 text-black' :
                              i === 1 ? 'bg-gray-400 text-black' :
                              i === 2 ? 'bg-orange-400 text-black' : 'bg-dark-secondary text-gray-500'
                          }`}>
                              {i + 1}
                          </div>
                          <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">{rank.client_name}</p>
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{rank.total_tickets} Bilhetes</p>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}
      <PurchaseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        raffleId={raffle.id} 
        initialQuantity={quantity}
        startStep="selection"
      />
    </div>
  );
};

export default RaffleDetail;
