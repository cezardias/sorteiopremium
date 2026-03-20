import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  User,
  Phone,
  Mail,
  Fingerprint,
  MoreVertical
} from 'lucide-react';
import ClientEditModal from '../components/ClientEditModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const fetchClients = async (page = 1, search = searchQuery) => {
    try {
      setLoading(true);
      let response;
      
      if (search) {
        response = await api.post(`/admin/dashboard/todos/clientes/filtro?page=${page}`, {
          name: search,
          cellphone: search
        });
      } else {
        response = await api.get(`/admin/dashboard/todos/clientes?page=${page}`);
      }

      if (response.data && response.data.success) {
        const data = response.data.data;
        setClients(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total
        });
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
  }, []);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleClientUpdated = () => {
    fetchClients(pagination.current_page);
    handleModalClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(1, searchQuery);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação removerá o acesso dele ao sistema.')) return;
    try {
        // Assuming delete endpoint exists based on usual pattern
        const response = await api.delete(`/admin/dashboard/cliente/excluir/${id}`);
        if(response.data.success) fetchClients(pagination.current_page);
    } catch (err) {
        console.error('Delete client error:', err);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Base de Clientes</h1>
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] ml-5">Gerenciamento centralizado de usuários e compradores</p>
        </div>
        
        <div className="flex bg-[#1c1f2e] border border-[#2a2d3e] p-4 rounded-3xl items-center gap-4 transition-all hover:border-blue-500/30">
           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Total Registrado</p>
              <p className="text-xl font-black text-white leading-none">{pagination.total}</p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#141523] border border-[#2a2d3e] rounded-[40px] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Table Filters */}
        <div className="p-8 border-b border-[#2a2d3e] bg-[#1c1f2e]/50 flex flex-col md:flex-row justify-between items-center gap-6">
           <form onSubmit={handleSearch} className="relative w-full md:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="PROCURAR POR NOME OU TELEFONE..." 
                className="w-full bg-[#0f111a] border border-[#2a2d3e] text-white text-[10px] font-bold px-14 py-5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest placeholder:text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                FILTRAR
              </button>
           </form>
        </div>

        {/* Custom Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f111a]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-20">#</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contato</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Documento</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {loading ? (
                Array.from({length: 8}).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8 h-20 bg-white/5 opacity-20"></td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-32 text-center text-[10px] font-black text-gray-700 uppercase tracking-widest italic">
                      Nenhum cliente encontrado na base de dados.
                   </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 text-[10px] font-black text-gray-600 font-mono">#{client.id}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#2a2d3e] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                           <User size={20} />
                        </div>
                        <div>
                           <div className="text-sm font-black text-white uppercase tracking-tight">{client.name} {client.surname}</div>
                           <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                              <Mail size={10} className="text-blue-400" /> {client.email || 'SEM E-MAIL'}
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <div className="text-[10px] font-black text-gray-300 flex items-center gap-2">
                             <Phone size={12} className="text-green-500" /> {client.cellphone}
                          </div>
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Registrado em: {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'Desconhecido'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f111a] border border-[#2a2d3e]">
                          <Fingerprint size={12} className="text-purple-500" />
                          <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter">{client.cpf || 'SEM CPF'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(client)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-black transition-all group/btn"
                          >
                             <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(client.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black transition-all group/btn"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        {pagination.last_page > 1 && (
          <div className="mt-auto p-8 border-t border-[#2a2d3e] bg-[#0f111a]/50 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Página {pagination.current_page} de {pagination.last_page}</span>
             </div>
             <div className="flex gap-2">
                <button 
                  disabled={pagination.current_page === 1}
                  onClick={() => fetchClients(pagination.current_page - 1)}
                  className="w-12 h-12 flex justify-center items-center rounded-xl border border-[#2a2d3e] text-gray-600 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20}/>
                </button>
                
                <div className="flex gap-1">
                   {/* Simplified pagination dots/numbers could go here */}
                   <button className="w-12 h-12 flex justify-center items-center rounded-xl bg-blue-500 text-black font-black text-[10px] transition-all">{pagination.current_page}</button>
                </div>

                <button 
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => fetchClients(pagination.current_page + 1)}
                  className="w-12 h-12 flex justify-center items-center rounded-xl border border-[#2a2d3e] text-gray-600 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20}/>
                </button>
             </div>
          </div>
        )}
      </div>

      {editModalOpen && (
        <ClientEditModal 
          client={selectedClient} 
          onClose={handleModalClose} 
          onSuccess={handleClientUpdated} 
        />
      )}
    </div>
  );
};

export default Clients;
