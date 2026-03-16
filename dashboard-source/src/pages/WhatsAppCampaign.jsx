import React, { useState } from 'react';
import api from '../api/api';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WhatsAppCampaign = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    if (!window.confirm('Deseja realmente enviar esta mensagem para TODOS os usuários com telefone cadastrado?')) {
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const response = await api.post('/admin/dashboard/whatsapp/send', { message });
      if (response.data) {
        setResult(response.data);
        toast.success(response.data.success || 'Mensagens enviadas!');
      }
    } catch (error) {
      console.error('Error sending WhatsApp messages:', error);
      toast.error('Erro ao enviar mensagens');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2 mb-8">
        <MessageSquare className="text-gray-400" /> ENVIAR MENSAGENS VIA WHATSAPP
      </h1>

      <div className="max-w-4xl">
        <div className="bg-[#141523] rounded-xl border border-[#2a2d3e] overflow-hidden">
          <div className="p-6 border-b border-[#2a2d3e] bg-[#0f111a] flex items-center gap-2">
            <AlertCircle className="text-yellow-500" size={20} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Campanha de Mensagens</h2>
          </div>
          
          <div className="p-8">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-8 text-xs text-yellow-200/80 leading-relaxed">
              <p className="font-bold flex items-center gap-2 mb-2 uppercase tracking-wider">
                <AlertCircle size={14} /> Atenção
              </p>
              Esta funcionalidade enviará a mensagem abaixo para <strong>TODOS</strong> os usuários/clientes que possuem um número de celular válido cadastrado no sistema. Use com cautela para evitar bloqueios no WhatsApp.
            </div>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Conteúdo da Mensagem</label>
                <textarea 
                  className="input-field min-h-[200px] resize-none py-4" 
                  placeholder="Olá! Temos uma novidade para você..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-4 rounded-lg font-black text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {sending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processando Envios...
                    </div>
                  ) : (
                    <>
                      <Send size={20} />
                      Iniciar Disparo de Mensagens
                    </>
                  )}
                </button>
              </div>
            </form>

            {result && (
              <div className="mt-10 pt-10 border-t border-[#2a2d3e] animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#1db954] mb-4">Relatório de Envio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0f111a] p-4 rounded border border-[#2a2d3e]">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Status</p>
                    <p className="text-sm font-bold text-gray-300">Concluído</p>
                  </div>
                  <div className="bg-[#0f111a] p-4 rounded border border-[#2a2d3e]">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Total com Erro</p>
                    <p className="text-sm font-bold text-red-500">{result.invalid_numbers?.length || 0}</p>
                  </div>
                  <div className="bg-[#0f111a] p-4 rounded border border-[#2a2d3e]">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Outros Erros</p>
                    <p className="text-sm font-bold text-gray-400">{result.other_errors?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppCampaign;
