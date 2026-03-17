import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Filter, Search, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

const Products = () => {
  const [raffles, setRaffles] = useState([]);
  const [filter, setFilter] = useState('active'); // active, future, finished
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      try {
        const response = await api.get('/produtos', { params: { status: filter } });
        setRaffles(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching raffles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaffles();
  }, [filter]);

  const filteredRaffles = (raffles || []).filter(r => 
    (r?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterTabs = [
    { id: 'active', label: 'Ativos', icon: CheckCircle2 },
    { id: 'future', label: 'Em Breve', icon: Clock },
    { id: 'finished', label: 'Encerrados', icon: Calendar },
  ];

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                  isActive 
                    ? "bg-primary border-primary text-black shadow-[0_4px_15px_rgba(29,185,84,0.3)]" 
                    : "bg-dark-secondary border-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar sorteio..."
            className="w-full bg-dark-secondary border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-bold uppercase tracking-widest placeholder:text-gray-700" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Raffle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                tabIndex={-1}
                className="h-[450px] rounded-[32px] bg-dark-secondary animate-pulse" 
              />
            ))
          ) : filteredRaffles.length > 0 ? (
            filteredRaffles.map((raffle, idx) => (
              <motion.div
                key={raffle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                layout
                className="glass rounded-[32px] overflow-hidden group hover:border-primary/50 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={raffle.image || 'https://via.placeholder.com/800x600?text=Foto+do+Prêmio'} 
                    alt={raffle.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                      filter === 'active' ? 'bg-primary text-black' :
                      filter === 'future' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {filter === 'active' ? 'Ativo' : filter === 'future' ? 'Em Breve' : 'Finalizado'}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 line-clamp-1">{raffle.title}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest line-clamp-2 mb-8">{raffle.subtitle || raffle.description}</p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bilhete</span>
                        <span className="text-2xl font-black text-primary italic leading-none">R$ {raffle.price || '0,00'}</span>
                      </div>
                      <Link 
                        to={`/raffle/${raffle.id}`}
                        className="bg-white hover:bg-primary text-black font-black uppercase px-6 py-3 rounded-xl transition-all flex items-center gap-2 group/btn"
                      >
                        {filter === 'active' ? 'Comprar' : 'Ver Detalhes'}
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center glass rounded-[40px]"
            >
              <ShoppingBag className="mx-auto text-gray-800 mb-6" size={64} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tente ajustar seus filtros ou busca.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Products;
