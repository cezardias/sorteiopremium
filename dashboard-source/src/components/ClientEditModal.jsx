import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientEditModal = ({ client, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    cpf: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        surname: client.surname || '',
        phone: client.phone || '',
        cpf: client.cpf || '',
        email: client.email || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Replicating the backend's expected PUT requirement
      const response = await axios.put('/api/v1/admin/dashboard/editar/cliente', formData);
      
      if (response.data && response.data.status === 200) {
        onSuccess();
      } else {
        setError(response.data.msg || 'Erro ao atualizar o cliente.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Falha na comunicação com a API. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1c1f2e] w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#2a2d3e]">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            CLIENTE
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex justify-center items-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sobrenome</label>
              <input 
                type="text" 
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="input-field" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly
                className="input-field bg-[#141523] opacity-70 cursor-not-allowed" 
                title="A chavetelefone não pode ser editada"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-[#2a2d3e]">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> CPF
                </label>
                <input 
                  type="text" 
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="input-field border-[#1db954]/50 focus:border-[#1db954]" 
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> E-mail
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field border-[#1db954]/50 focus:border-[#1db954]" 
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? 'Salvando...' : 'Atualizar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientEditModal;
