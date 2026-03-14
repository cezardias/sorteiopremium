import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import ClientEditModal from '../components/ClientEditModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // In production, this should use dynamic API URL from environment variables
      const response = await axios.get('/api/v1/admin/dashboard/todos/clientes');
      if (response.data && response.data.status === 200) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
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

  const filteredClients = clients.filter(c => 
    searchPhone ? c.phone?.includes(searchPhone) : true
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Users className="text-gray-400" /> CLIENTES
        </h1>
        
        <div className="w-1/3">
          <label className="text-sm font-bold text-gray-500 block mb-2">Telefone:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Pesquise pelo telefone" 
              className="input-field"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
            <button className="bg-[#2a2d3e] hover:bg-[#32364a] text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
              <Search size={18} /> Filtrar
            </button>
          </div>
        </div>
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
                  <td className="px-6 py-4 text-gray-400">{client.phone}</td>
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
