import React, { useState, useEffect } from 'react';
import { Trophy, Search, Star, Calendar, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/api';

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await api.get('/produtos/todos/ganhadores');
        setWinners(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching winners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  const filteredWinners = (winners || []).filter(w => 
    (w?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w?.prize_title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-3 rounded-2xl bg-accent/20 text-accent border border-accent/30 mb-2"
        >
          <Trophy size={32} fill="currentColor" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">Galeria de <span className="text-accent italic">Ganhadores</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Transformando vidas através da sorte e transparência.</p>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-xl mx-auto w-full">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou prêmio..."
          className="w-full bg-dark-secondary border border-white/5 rounded-[32px] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-accent/40 transition-all font-bold uppercase tracking-widest placeholder:text-gray-700 shadow-xl" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-[40px] bg-dark-secondary animate-pulse" />
          ))
        ) : filteredWinners.length > 0 ? (
          filteredWinners.map((winner, idx) => (
            <motion.div
              key={winner.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[40px] flex flex-col sm:flex-row items-center gap-8 group hover:border-accent/50 transition-all duration-500 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Quote size={80} fill="currentColor" className="text-accent" />
              </div>

              <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 border-2 border-white/5 group-hover:border-accent/30 transition-colors shadow-2xl">
                <img 
                  src={winner.avatar || 'https://via.placeholder.com/400?text=Ganhador'} 
                  alt={winner.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left space-y-4">
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{winner.name}</h4>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-accent">
                    <Star size={12} fill="currentColor" />
                    <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">{winner.prize_title || 'Grande Prêmio'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Star size={10} /> Bilhete
                    </span>
                    <span className="text-lg font-black text-primary italic leading-none">#{winner.ticket_number || '000000'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Calendar size={10} /> Sorteio em
                    </span>
                    <span className="text-base font-bold text-gray-400 italic leading-none">{winner.draw_date || 'Março 2026'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass rounded-[40px]">
            <Trophy className="mx-auto text-gray-800 mb-6" size={64} />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Nenhum ganhador encontrado</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Seja o próximo a aparecer nesta lista!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Winners;
