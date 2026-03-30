import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trophy, MessageCircle, ArrowRight, Zap, Target, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import PurchaseModal from '../components/PurchaseModal';

const Home = () => {
  const [raffles, setRaffles] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRaffleId, setSelectedRaffleId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rafflesRes, winnersRes] = await Promise.all([
          api.get('/produtos').catch(() => ({ data: [] })),
          api.get('/produtos/todos/ganhadores').catch(() => ({ data: [] }))
        ]);
        const allRaffles = rafflesRes.data?.data || [];
        setRaffles(allRaffles.filter(r => r.status === 'ativas'));
        setWinners(winnersRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero / Banners Section */}
      <section className="relative h-[400px] md:h-[500px] rounded-[40px] overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md"
          >
            Sorteios Exclusivos
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none"
          >
            Sua Sorte Começa <span className="text-primary italic">Aqui</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-xl"
          >
            Participe das melhores ações entre amigos com total transparência e prêmios incríveis.
          </motion.p>
        </div>
      </section>

      {/* Featured Products (Produtos) */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
              <Star className="text-primary" fill="currentColor" /> Produtos <span className="text-gray-600">Destaques</span>
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Escolha sua sorte e participe!</p>
          </div>
          <button className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
            Ver todos <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-dark-secondary animate-pulse" />
            ))
          ) : raffles.length > 0 ? (
            raffles.map(raffle => (
              <div key={raffle.id} className="glass rounded-[32px] overflow-hidden group hover:border-primary/50 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl shadow-black/50">
                <div className="h-64 overflow-hidden relative cursor-pointer" onClick={() => navigate(`/raffle/${raffle.id}`)}>
                  <img 
                    src={(raffle.rifaImage || raffle.rifa_image)?.[0]?.path ? `/api/img/rifas/${(raffle.rifaImage || raffle.rifa_image)[0].path}` : 'https://placehold.co/800x600?text=Foto+do+Prêmio'} 
                    alt={raffle.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      raffle.status === 'ativas' ? 'bg-primary text-black' :
                      raffle.status === 'futuras' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {raffle.status === 'ativas' ? 'Ativo' : raffle.status === 'futuras' ? 'Em Breve' : 'Finalizado'}
                    </span>
                    {raffle.featured && (
                      <span className="px-3 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest">Destaque</span>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  <h3 
                    className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/raffle/${raffle.id}`)}
                  >
                    {raffle.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest line-clamp-2 mb-6">{raffle.subtitle || raffle.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bilhete</span>
                      <span className="text-2xl font-black text-primary italic leading-none">R$ {parseFloat(raffle?.price || raffle?.price_cota || (raffle.discountPackage || raffle.discount_package)?.[0]?.value_cota || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedRaffleId(raffle.id);
                        setModalOpen(true);
                      }}
                      className="bg-primary hover:bg-secondary text-black font-black uppercase px-8 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(29,185,84,0.3)]"
                    >
                      Comprar
                    </button>

                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass rounded-3xl">
              <ShoppingBag className="mx-auto text-gray-700 mb-4" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest">Nenhum produto em destaque no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Help Section */}
      <section className="bg-dark-secondary rounded-[40px] p-8 md:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-500/10 blur-[100px] rounded-full" />
        <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
            <span className="text-3xl">🤔</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Dúvidas? <span className="text-gray-500">Fale conosco!</span></h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm leading-relaxed">
            Estamos prontos para te ajudar em todas as etapas da sua participação. Entre em contato agora pelo WhatsApp.
          </p>
          <a 
            href="#" 
            className="flex items-center gap-3 bg-[#25d366] hover:bg-[#22c35e] text-black font-black uppercase px-10 py-5 rounded-2xl transition-all shadow-[0_10px_25px_rgba(37,211,102,0.3)] transform hover:scale-105"
          >
            <MessageCircle size={24} fill="currentColor" />
            <span>Falar no Whatsapp</span>
          </a>
        </div>
      </section>

      {/* Winners Section (Ganhadores) */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
               <Trophy className="text-accent" fill="currentColor" /> Ganhadores <span className="text-gray-600">Sortudos</span>
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Veja quem já levou prêmios pra casa!</p>
          </div>
          <button className="text-gray-400 hover:text-accent transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
            Ver histórico <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
             [1, 2].map(i => (
              <div key={i} className="h-32 rounded-3xl bg-dark-secondary animate-pulse" />
            ))
          ) : winners.length > 0 ? (
            winners.map(winner => (
              <div key={winner.id} className="glass p-6 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 group hover:border-accent/40 transition-all duration-300">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img 
                    src={winner.img ? `/api/img/rifas/${winner.img}` : 'https://placehold.co/200?text=Avatar'} 
                    alt={winner.client?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">
                    {winner.client?.name} {winner.client?.surname}
                  </h4>
                  <p className="text-accent font-bold uppercase tracking-widest text-[10px] break-words">{winner.rifa?.title || 'Prêmio Conquistado'}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Bilhete</span>
                      <span className="text-sm font-black text-primary italic">#{winner.ticket || '000000'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Data</span>
                      <span className="text-sm font-bold text-gray-400">
                        {winner.rifa?.end_rifa ? new Date(winner.rifa.end_rifa).toLocaleDateString('pt-BR') : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center glass rounded-3xl">
              <Trophy className="mx-auto text-gray-700 mb-4" size={40} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Ainda estamos preparando os novos sorteios.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
        {[
          { icon: <Zap size={20} />, text: 'Entrega Rápida' },
          { icon: <Target size={20} />, text: 'Total Transparência' },
          { icon: <Shield size={20} />, text: 'Compra Segura' },
          { icon: <Star size={20} />, text: 'Suporte VIP' },
        ].map((badge, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-3 p-6 glass rounded-[32px] text-center">
            <div className="text-primary">{badge.icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{badge.text}</span>
          </div>
        ))}
      </section>

      <PurchaseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        raffleId={selectedRaffleId} 
      />
    </div>
  );
};

export default Home;
