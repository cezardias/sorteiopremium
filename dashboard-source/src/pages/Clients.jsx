import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Search, Eye, Edit, Trash2, Users } from 'lucide-react';
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
        // Use filter endpoint for search
        response = await api.post(`/admin/dashboard/todos/clientes/filtro?page=${page}`, {
          name: search,
          cellphone: search
        });
      } else {
        // Use regular endpoint for all
        response = await api.get(`/admin/dashboard/todos/clientes?page=${page}`);
      }

      if (response.data && response.data.success) {
        const data = response.data.data;
        // The data is now paginated, so it has a 'data' property with the actual items
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
    fetchClients();
    handleModalClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(1, searchQuery);
  };

  // We no longer need local filtering as it's done on the server
  const filteredClients = clients;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Users className="text-gray-400" /> CLIENTES
        </h1>
        
        <form onSubmit={handleSearch} className="w-1/3">
          <label className="text-sm font-bold text-gray-500 block mb-2">Buscar Cliente:</label>
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
              <th className="px-6 py-4 font-bold">#</th>
              <th className="px-6 py-4 font-bold">NOME</th>
              <th className="px-6 py-4 font-bold">TELEFONE</th>
              <th className="px-6 py-4 font-bold text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Carregando clientes...</td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado.</td>
              </tr>
            ) : (
              filteredClients.map((client, index) => (
                <tr key={client.id || index} className="border-b border-[#2a2d3e]/50 hover:bg-[#1e2130]/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{client.id || index + 1}</td>
                  <td className="px-6 py-4 font-medium uppercase text-gray-300">
                    {client.name} {client.surname}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{client.cellphone}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold">
                        <Eye size={14} /> VER
                      </button>
                      <button 
                        onClick={() => handleEditClick(client)}
                        className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold">
                        <Trash2 size={14} /> Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.last_page > 1 && (
        <div className="mt-6 flex justify-between items-center bg-[#141523] p-4 rounded-lg border border-[#2a2d3e]">
          <div className="text-sm text-gray-400">
            Mostrando <span className="text-gray-200 font-bold">{clients.length}</span> de <span className="text-gray-200 font-bold">{pagination.total}</span> clientes
          </div>
          <div className="flex gap-2">
            <button 
              disabled={pagination.current_page === 1}
              onClick={() => fetchClients(pagination.current_page - 1)}
              className={`px-4 py-2 rounded bg-[#2a2d3e] text-white text-xs font-bold transition-colors ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#32364a]'}`}
            >
              ANTERIOR
            </button>
            <div className="flex items-center px-4 text-sm font-bold text-gray-400 bg-[#0f111a] rounded border border-[#2a2d3e]">
              PÁGINA {pagination.current_page} DE {pagination.last_page}
            </div>
            <button 
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => fetchClients(pagination.current_page + 1)}
              className={`px-4 py-2 rounded bg-[#2a2d3e] text-white text-xs font-bold transition-colors ${pagination.current_page === pagination.last_page ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#32364a]'}`}
            >
              PRÓXIMO
            </button>
          </div>
        </div>
      )}

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
