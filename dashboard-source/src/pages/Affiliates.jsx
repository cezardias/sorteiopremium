import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Search, Users, DollarSign, ExternalLink, Share2, Percent } from 'lucide-react';

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAffiliates = async (search = searchQuery) => {
    try {
      setLoading(true);
      let response;
      
      if (search) {
        response = await api.post('/admin/dashboard/afiliado/filtro/', {
          name: search,
          cellphone: search
        });
      } else {
        response = await api.get('/admin/dashboard/todos/afiliados/');
      }

      if (response.data && response.data.success) {
        setAffiliates(response.data.data || []);
      } else {
        setAffiliates([]);
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAffiliates(searchQuery);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Share2 className="text-gray-400" /> AFILIADOS
        </h1>
        
        <form onSubmit={handleSearch} className="w-1/3">
          <label className="text-sm font-bold text-gray-500 block mb-2">Buscar Afiliado:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome ou Telefone" 
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-[#2a2d3e] hover:bg-[#32364a] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
              <Search size={18} /> Filtrar
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#141523] rounded-lg border border-[#2a2d3e] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0f111a] border-b border-[#2a2d3e] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-bold">NOME/CLIENTE</th>
              <th className="px-6 py-4 font-bold text-center">COMISSÃO (%)</th>
              <th className="px-6 py-4 font-bold text-center">PEDIDOS</th>
              <th className="px-6 py-4 font-bold text-center">FATURAMENTO</th>
              <th className="px-6 py-4 font-bold text-center">GANHOS</th>
              <th className="px-6 py-4 font-bold text-center">LINK</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Carregando afiliados...</td>
              </tr>
            ) : affiliates.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhum afiliado encontrado.</td>
              </tr>
            ) : (
              affiliates.map((afiliado, index) => (
                <tr key={afiliado.id || index} className="border-b border-[#2a2d3e]/50 hover:bg-[#1e2130]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium uppercase text-gray-300">
                        {afiliado.client?.name} {afiliado.client?.surname}
                      </span>
                      <span className="text-xs text-gray-500">{afiliado.cellphone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                      {afiliado.porcent}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 font-bold">
                    {afiliado.totalPedidos}
                  </td>
                  <td className="px-6 py-4 text-center text-green-500 font-bold">
                    {formatCurrency(afiliado.faturamento)}
                  </td>
                  <td className="px-6 py-4 text-center text-yellow-500 font-bold">
                    {formatCurrency(afiliado.comissao)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => window.open(`https://sorteiospremiummultimarcas.com.br/afiliado/${afiliado.link}`, '_blank')}
                        className="bg-purple-600/20 text-purple-500 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold"
                      >
                        <ExternalLink size={14} /> LINK
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Affiliates;
