import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Shield, Zap, Target, Star, ChevronLeft, Plus, Minus, AlertCircle, Loader2 } from 'lucide-react';
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
      toast.error('Você precisa estar logado para comprar');
      navigate('/login', { state: { from: `/raffle/${id}` } });
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
              src={raffle.rifa_image?.[0]?.path ? `/api/img/rifas/${raffle.rifa_image[0].path}` : 'https://placehold.co/800x800?text=Foto+do+Prêmio'} 
              alt={raffle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                <img src={`/api/img/rifas/${img.path}`} alt="" className="w-full h-full object-cover" />
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
              <div className="flex items-center gap-4 bg-dark rounded-2xl p-2 border border-white/5">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <Minus size={20} />
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
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[5, 10, 50, 100].map(qty => (
                <button
                  key={qty}
                  onClick={() => handleQuantityChange(quantity + qty)}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    quantity === qty 
                      ? "bg-primary text-black shadow-lg" 
                      : "bg-dark hover:bg-white/5 text-gray-500 border border-white/5"
                  }`}
                >
                  +{qty} Bilhetes
                </button>
              ))}
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total a pagar</span>
                <span className="text-4xl font-black text-white italic">{totalPrice}</span>
              </div>
              
              <button 
                onClick={() => setModalOpen(true)}
                className="w-full bg-primary hover:bg-secondary text-black font-black uppercase py-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(29,185,84,0.3)] flex items-center justify-center gap-3 group"
              >
                  <ShoppingBag size={24} />
                  <span>Comprar Agora</span>
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
        </motion.div>
      </div>

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
        startStep="payment"
      />
    </div>
  );
};

export default RaffleDetail;
