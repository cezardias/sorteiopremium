import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Shield, Zap, Target, Star, ChevronLeft, Plus, Minus, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import toast from 'react-hot-toast';
import PurchaseModal from '../components/PurchaseModal';

const RaffleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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
          const minOrder = response.data.data.rifa?.cota?.qntd_cota_min_order || 1;
          setQuantity(minOrder);
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
    const min = raffle?.cota?.qntd_cota_min_order || 1;
    const max = raffle?.cota?.qntd_cota_max_order || 99999;
    setQuantity(Math.max(min, Math.min(val, max)));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Carregando Detalhes...</p>
      </div>
    );
  }

  if (!raffle) return null;

  const pricePerCota = parseFloat(raffle?.price || (raffle?.discountPackage || raffle?.discount_package)?.[0]?.value_cota || 0);
  const totalPrice = (pricePerCota * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cotasAtivas = ((raffle.awardedQuota || raffle.awarded_quota) || []).filter(a =>
    a.status === 'imediato' || a.status === 'bloqueada'
  );
  const cotasResgatadas = ((raffle.awardedQuota || raffle.awarded_quota) || []).filter(a => a.status === 'resgatada');
  const currentAwards = awardedTab === 'ativas' ? cotasAtivas : cotasResgatadas;

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s\s+/g, ' ').trim();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-black uppercase tracking-widest text-xs group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>

      {/* Hero Image */}
      <div className="w-full rounded-[32px] overflow-hidden aspect-video relative">
        <img
          src={(raffle.rifaImage || raffle.rifa_image)?.[0]?.path
            ? `/api/img/rifas/${(raffle.rifaImage || raffle.rifa_image)[0].path}`
            : 'https://placehold.co/800x450?text=Foto+do+Prêmio'}
          alt={raffle.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://placehold.co/800x450?text=Foto+do+Prêmio'; }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-4 py-2 rounded-full bg-primary text-black text-xs font-black uppercase tracking-widest shadow-xl">
            {raffle.status === 'ativas' ? 'Disponível' : 'Em Breve'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">
          {raffle.title}
        </h1>
        {raffle.subtitle && (
          <p className="text-gray-400 font-bold text-sm mt-1">{raffle.subtitle}</p>
        )}
      </div>

      {/* Purchase Widget */}
      <div className="glass rounded-[32px] border border-white/10 p-6 space-y-6">

        {/* Quantity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Quantidade · max {(raffle?.cota?.qntd_cota_max_order || 1000).toLocaleString('pt-BR')}</span>
          </div>

          {/* Big +/- controls matching reference */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all text-2xl font-black"
            >
              <Minus size={22} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="flex-1 h-14 bg-dark border border-white/10 rounded-2xl text-center font-black text-2xl text-white outline-none focus:border-red-600/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all font-black"
            >
              <Plus size={22} />
            </button>
            <button
              onClick={() => handleQuantityChange(quantity + 5)}
              className="px-4 h-14 rounded-2xl bg-dark border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all font-black text-sm"
            >
              +5
            </button>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={raffle?.cota?.qntd_cota_min_order || 1}
            max={raffle?.cota?.qntd_cota_max_order || 1000}
            step={1}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Promotional Packages */}
        {(raffle.discountPackage || raffle.discount_package)?.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={12} className="text-red-600" /> Pacotes Promocionais
            </p>
            <div className="grid grid-cols-4 gap-3">
              {(raffle.discountPackage || raffle.discount_package).map((pkg) => {
                const isSelected = quantity === parseInt(pkg.qntd_cota);
                const isPopular = pkg.popular === 'sim';
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setQuantity(parseInt(pkg.qntd_cota))}
                    className={`relative flex flex-col items-center justify-center p-3 pt-6 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-600/15 shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                        : isPopular
                          ? 'border-red-600/60 bg-dark hover:border-red-500'
                          : 'border-white/10 bg-dark hover:border-white/30'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg z-10 whitespace-nowrap">
                        Mais popular
                      </div>
                    )}
                    <span className={`text-base font-black leading-tight ${isSelected ? 'text-red-600' : 'text-white'}`}>
                      {parseInt(pkg.qntd_cota).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[9px] font-black text-red-600/70 line-through leading-none">
                      R$ {(pricePerCota * parseInt(pkg.qntd_cota)).toFixed(2)}
                    </span>
                    <span className={`text-xs font-black leading-none ${isSelected ? 'text-white' : 'text-red-600'}`}>
                      R$ {parseFloat(pkg.valor_total).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price + Buy Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preço Unit:</span>
            <span className="text-xl font-black text-red-600 italic">
              R$ {pricePerCota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase py-4 rounded-full transition-all shadow-[0_10px_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group"
          >
            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
            Comprar por {totalPrice}
          </button>
        </div>
      </div>

      {/* Cotas Premiadas */}
      {raffle.awarded_quota?.length > 0 && (
        <div className="glass rounded-[32px] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Star size={16} className="text-primary" fill="currentColor" /> Cotas Premiadas!
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Achou? Levou na hora!</p>
            </div>
            <div className="flex gap-1 bg-dark p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setAwardedTab('ativas')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  awardedTab === 'ativas' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                Cotas Ativas ({cotasAtivas.length})
              </button>
              <button
                onClick={() => setAwardedTab('resgatadas')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  awardedTab === 'resgatadas' ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                Cotas Resgatadas ({cotasResgatadas.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {currentAwards.map((award) => (
              <div
                key={award.id}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1 ${
                  awardedTab === 'resgatadas'
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-white/10 bg-dark'
                }`}
              >
                <Star
                  size={20}
                  className={awardedTab === 'resgatadas' ? 'text-primary' : 'text-primary animate-pulse'}
                  fill={awardedTab === 'resgatadas' ? 'currentColor' : 'none'}
                />
                <div className="text-xs font-black text-white">{award.number_cota?.toLocaleString('pt-BR')}</div>
                <div className="text-[9px] font-black text-primary">
                  R$ {parseFloat(award.award || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                {award.client && (
                  <div className="text-[8px] text-gray-500 font-bold truncate w-full text-center italic">
                    {award.client.name?.split(' ')[0]}
                  </div>
                )}
              </div>
            ))}
            {currentAwards.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                Nenhuma cota {awardedTab === 'ativas' ? 'ativa' : 'resgatada'} no momento
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description Accordions */}
      <div className="space-y-3">
        {raffle.description_product && (
          <div className="glass rounded-[24px] border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowProductDesc(!showProductDesc)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
              <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
                <ShoppingBag size={16} className="text-primary" /> Descrição do Produto
              </span>
              {showProductDesc ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </button>
            <AnimatePresence>
              {showProductDesc && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {stripHtml(raffle.description_product)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {raffle.description_role && (
          <div className="glass rounded-[24px] border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowSorteioDesc(!showSorteioDesc)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
              <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
                <Info size={16} className="text-primary" /> Descrição do Sorteio
              </span>
              {showSorteioDesc ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </button>
            <AnimatePresence>
              {showSorteioDesc && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                    {stripHtml(raffle.description_role)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

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
