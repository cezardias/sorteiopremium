import React, { useState } from 'react';
import api from '../api/api';

const AffiliateAddModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    cellphone: '',
    porcent: 10,
    type: 'padrao'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/admin/dashboard/afiliado/create', formData);
      
      if (response.data && response.data.success) {
        onSuccess();
      } else {
        setError(response.data.msg || 'Erro ao cadastrar afiliado.');
      }
    } catch (err) {
      console.error('Create affiliate error:', err);
      // Backend returns 500 when client not found or affiliate exists
      setError(err.response?.data?.msg || 'Falha na comunicação com a API. Verifique se o cliente existe.');
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
            CADASTRAR AFILIADO
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
              <label className="block text-sm font-medium text-gray-300 mb-1 italic">
                O cliente já deve estar cadastrado no sistema.
              </label>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone do Cliente (com DDD)</label>
              <input 
                type="text" 
                name="cellphone"
                value={formData.cellphone}
                onChange={handleChange}
                placeholder="Ex: 11999999999"
                className="input-field" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Comissão (%)</label>
                <input 
                  type="number" 
                  name="porcent"
                  value={formData.porcent}
                  onChange={handleChange}
                  className="input-field" 
                  required
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field bg-[#141523]"
                >
                  <option value="padrao">Padrão</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary w-full py-3 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? 'Cadastrando...' : 'CADASTRAR AFILIADO'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AffiliateAddModal;
