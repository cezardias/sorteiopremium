import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Settings, Edit, Plus } from 'lucide-react';
import GatewayEditModal from '../components/GatewayEditModal';
import { toast } from 'react-hot-toast';

const PaymentSettings = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/payment');
      if (response.data && response.data.success) {
        setGateways(response.data.data || []);
      } else {
        setGateways([]);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
      toast.error('Erro ao carregar configurações de pagamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleEditClick = (gateway) => {
    setSelectedGateway(gateway);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedGateway(null);
    setEditModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          <Settings className="text-gray-400" /> CONF. PAGAMENTO
        </h1>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 font-bold text-xs uppercase transition-colors"
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      <div className="bg-[#141523] rounded-lg border border-[#2a2d3e] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0f111a] border-b border-[#2a2d3e] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-bold text-center">Gateway</th>
              <th className="px-6 py-4 font-bold text-center">Nome</th>
              <th className="px-6 py-4 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Carregando gateways...</td>
              </tr>
            ) : gateways.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Nenhum gateway configurado.</td>
              </tr>
            ) : (
              gateways.map((gateway) => (
                <tr key={gateway.id} className="border-b border-[#2a2d3e]/50 hover:bg-[#1e2130]/50 transition-colors">
                  <td className="px-6 py-4 text-center font-medium uppercase text-gray-300">
                    {gateway.gateway}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 uppercase">{gateway.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleEditClick(gateway)}
                        className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold uppercase"
                      >
                        <Edit size={14} /> Editar
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
        <GatewayEditModal 
          gateway={selectedGateway} 
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => {
            fetchGateways();
            setEditModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

export default PaymentSettings;
