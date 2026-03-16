import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Search, UserPlus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import UserEditModal from '../components/UserEditModal';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async (query = searchQuery) => {
    try {
      setLoading(true);
      let response;
      if (query) {
        response = await api.post('/admin/dashboard/todos/usuarios/filtro', { query });
      } else {
        response = await api.get('/admin/dashboard/todos/usuarios');
      }

      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setEditModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const response = await api.delete(`/admin/dashboard/usuarios/deletar/${id}`);
      if (response.data && response.data.success) {
        toast.success('Usuário excluído com sucesso');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
            <UsersIcon className="text-gray-400" /> USUÁRIOS
          </h1>
          <button 
            onClick={handleAddNew}
            className="mt-4 bg-[#1db954] hover:bg-[#17a34a] text-black px-4 py-2 rounded-md flex items-center gap-2 font-bold text-xs uppercase transition-colors"
          >
            <UserPlus size={18} /> Novo Usuário
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-1/3">
          <label className="text-sm font-bold text-gray-500 block mb-2">Filtros de Busca</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nome ou E-mail" 
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
              <th className="px-6 py-4 font-bold">NOME</th>
              <th className="px-6 py-4 font-bold">TELEFONE</th>
              <th className="px-6 py-4 font-bold">EMAIL</th>
              <th className="px-6 py-4 font-bold">PERFIL</th>
              <th className="px-6 py-4 font-bold">CRIADO EM</th>
              <th className="px-6 py-4 font-bold text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Carregando usuários...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[#2a2d3e]/50 hover:bg-[#1e2130]/50 transition-colors">
                  <td className="px-6 py-4 font-medium uppercase text-gray-300">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{user.cellphone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-400 uppercase">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-600/30">
                      {user.role || 'ADMIN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors text-xs font-bold"
                      >
                        <Trash2 size={14} /> Excluir
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
        <UserEditModal 
          user={selectedUser} 
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => {
            fetchUsers();
            setEditModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

export default Users;
