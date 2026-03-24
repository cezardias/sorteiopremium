import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../api/api';
import { 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  AlertCircle,
  Upload,
  Camera,
  CheckCircle2
} from 'lucide-react';

const RaffleImagesModal = ({ raffle, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard/rifa/imagens/${raffle.id}`);
      if (response.data && response.data.success) {
        setImages(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Falha ao carregar galeria de imagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [raffle.id]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await api.post('/admin/dashboard/rifa/imagens/cadastrar', {
          rifas_id: raffle.id,
          img: reader.result
        });
        
        if (response.data && response.data.success) {
          fetchImages();
        } else {
          setError(response.data.msg || 'Erro no upload.');
        }
      } catch (err) {
        setError('Erro na comunicação com o servidor.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta imagem da galeria?')) return;
    try {
      const response = await api.delete(`/admin/dashboard/rifa/imagens/deletar/${id}`);
      if (response.data && response.data.success) {
        fetchImages();
      }
    } catch (err) {
      setError('Erro ao excluir imagem.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#141523] w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2d3e] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2a2d3e] bg-[#1c1f2e] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Camera className="text-pink-500" /> Galeria de Imagens
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Sorteio: <span className="text-white">{raffle.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex justify-center items-center rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {/* Upload Card */}
             <div className="relative group">
               <input 
                 type="file" 
                 onChange={handleUpload} 
                 className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                 disabled={uploading}
                 accept="image/*"
               />
               <div className={`aspect-square rounded-3xl border-2 border-dashed border-[#2a2d3e] flex flex-col items-center justify-center gap-2 transition-all group-hover:bg-pink-500/5 group-hover:border-pink-500/50 ${uploading ? 'animate-pulse bg-white/5' : ''}`}>
                  {uploading ? (
                    <Upload className="text-pink-500 animate-bounce" size={32} />
                  ) : (
                    <Plus className="text-gray-600 group-hover:text-pink-500" size={32} />
                  )}
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-pink-500">
                    {uploading ? 'Enviando...' : 'Adicionar Foto'}
                  </span>
               </div>
             </div>

             {/* Image List */}
             {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="aspect-square bg-[#1c1f2e] rounded-3xl animate-pulse"></div>
                ))
             ) : (
                images.map((img) => (
                  <div key={img.id} className="aspect-square rounded-3xl bg-[#0f111a] border border-[#2a2d3e] overflow-hidden relative group">
                    <img 
                      src={`${IMAGE_BASE_URL}/${img.img}`} 
                      alt="Gallery" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                         onClick={() => handleDelete(img.id)}
                         className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="px-8 py-6 border-t border-[#2a2d3e] bg-[#0f111a]/50">
            <div className="flex items-center gap-4">
               <div className="bg-pink-500/10 text-pink-500 p-3 rounded-2xl border border-pink-500/20">
                  <ImageIcon size={20} />
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Dica de Performance</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Use imagens em formato WEBP ou JPG otimizadas para carregamento rápido.<br/>
                    A galeria aceita até 12 fotos por sorteio.
                  </p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleImagesModal;
