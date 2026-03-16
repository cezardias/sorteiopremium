import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserEditModal = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cellphone: '',
    role: 'ADMIN',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        cellphone: user.cellphone || '',
        role: user.role || 'ADMIN',
        password: '' // Keep password empty unless changing
      });
    } else {
      setFormData({
        name: '',
        email: '',
        cellphone: '',
        role: 'ADMIN',
        password: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let response;
      if (user) {
        // Edit existing user
        response = await api.put('/admin/dashboard/usuarios/editar', formData);
      } else {
        // Create new user (using the signup or admin creation endpoint if available)
        // For now, I'll check if storeUser exists in AdminController or similar
        // Based on api.php, there might not be a direct "create user" for admin yet, but let's check storeUser from legacy
        response = await api.post('/admin/dashboard/usuario/store', formData);
      }

      if (response.data && response.data.success) {
        toast.success(user ? 'Usuário atualizado!' : 'Usuário criado!');
        onSuccess();
      } else {
        toast.error(response.data.msg || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141523] w-full max-w-md rounded-xl border border-[#2a2d3e] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2d3e] bg-[#0f111a]">
          <h2 className="text-lg font-bold uppercase tracking-widest text-[#1db954]">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Nome Completo</label>
            <input 
              type="text" 
              required
              className="input-field" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
            <input 
              type="email" 
              required
              className="input-field" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Telefone</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="(00) 00000-0000"
              value={formData.cellphone}
              onChange={(e) => setFormData({...formData, cellphone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Perfil / Cargo</label>
            <select 
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERADMIN">SUPER ADMIN</option>
              <option value="MODERADOR">MODERADOR</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              {user ? 'Senha (deixe em branco para não alterar)' : 'Senha'}
            </label>
            <input 
              type="password" 
              required={!user}
              className="input-field" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-transparent border border-[#2a2d3e] text-gray-400 py-3 rounded-lg font-bold text-xs uppercase hover:bg-[#1e2130] transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-green-500 text-black py-3 rounded-lg font-black text-xs uppercase hover:bg-green-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
