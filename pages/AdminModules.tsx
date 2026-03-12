import React, { useState, useEffect } from 'react';
import { Module } from '../types';
import { ICONS, AVAILABLE_ICONS, API_URL } from '../constants';

interface AdminModulesProps {
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
}

export const AdminModules: React.FC<AdminModulesProps> = ({ modules, setModules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Search' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar módulos ao montar o componente
  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const token = localStorage.getItem('gsa_token');
      const response = await fetch('https://api.gsacreditus.com.br/api/modules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar módulos');

      const data = await response.json();
      setModules(data);
    } catch (err: any) {
      console.error('Erro ao carregar módulos:', err);
    }
  };

  const openAddModal = () => {
    setEditingModule(null);
    setFormData({ name: '', description: '', icon: 'Search' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (module: Module) => {
    setEditingModule(module);
    setFormData({ name: module.name, description: module.description, icon: module.icon });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('gsa_token');
      const slug = formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      const payload = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        slug
      };

      if (editingModule) {
        // Editar módulo existente
        const response = await fetch(`https://api.gsacreditus.com.br/api/modules/${editingModule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao atualizar módulo');
        }

        const updatedModule = await response.json();
        setModules(prev => prev.map(m => m.id === editingModule.id ? updatedModule : m));
      } else {
        // Criar novo módulo
        const response = await fetch(`${API_URL}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao criar módulo');
        }

        const newModule = await response.json();
        setModules(prev => [...prev, newModule]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (module: Module) => {
    setModuleToDelete(module);
    setConfirmDeleteText('');
    setError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete || confirmDeleteText.toUpperCase() !== 'EXCLUIR') return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('gsa_token');
      const response = await fetch(`https://api.gsacreditus.com.br/api/modules/${moduleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar módulo');
      }

      setModules(prev => prev.filter(m => m.id !== moduleToDelete.id));
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      setConfirmDeleteText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Gerenciar Módulos</h2>
          <p className="text-neutral-500 text-sm">Configure as categorias de consulta do sistema.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest"
        >
          {ICONS.Plus} Novo Módulo
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-neutral-900/50 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Ícone</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nome / Slug</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Descrição</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {modules.map((m) => (
              <tr key={m.id} className="hover:bg-neutral-900/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-blue-500 border border-neutral-800 group-hover:scale-110 transition-transform">
                    {AVAILABLE_ICONS.find(i => i.id === m.icon)?.icon || ICONS.Search}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-black text-white uppercase text-sm tracking-tight">{m.name}</p>
                  <p className="text-[10px] text-neutral-600 font-mono">/{m.slug}</p>
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500 max-w-xs truncate font-medium">
                  {m.description}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(m)}
                      className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 hover:text-blue-500 hover:border-blue-500/50 transition-all"
                      title="Editar"
                    >
                      {React.cloneElement(ICONS.Settings as React.ReactElement<any>, { className: "w-4 h-4" })}
                    </button>
                    <button 
                      onClick={() => openDeleteModal(m)}
                      className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-500 hover:border-red-500/50 transition-all"
                      title="Excluir"
                    >
                      {React.cloneElement(ICONS.Trash2 as React.ReactElement<any>, { className: "w-4 h-4" })}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-700 font-black uppercase tracking-widest text-xs italic">
                  Nenhum módulo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
               <span className="p-2 bg-blue-600 rounded-lg">{editingModule ? ICONS.Settings : ICONS.Plus}</span>
               {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nome do Módulo</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-black uppercase text-sm"
                  placeholder="Ex: CPF, CNPJ, PLACA"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Descrição</label>
                <textarea 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 text-xs font-bold"
                  placeholder="Para que serve este módulo?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Ícone</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map(i => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setFormData({...formData, icon: i.id})}
                      className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                        formData.icon === i.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-600 hover:bg-neutral-800'
                      }`}
                    >
                      {React.cloneElement(i.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 text-neutral-500 font-black hover:bg-neutral-900 uppercase text-[10px] tracking-widest disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Segurança Individual */}
      {isDeleteModalOpen && moduleToDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-red-500 mb-6">
               <div className="p-3 bg-red-500/10 rounded-xl">
                 {React.cloneElement(ICONS.AlertCircle as React.ReactElement<any>, { className: "w-8 h-8" })}
               </div>
               <div>
                 <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-tight">Remover Módulo</h3>
                 <p className="text-[10px] text-red-500/70 font-black uppercase tracking-widest">{moduleToDelete.name}</p>
               </div>
            </div>
            
            <p className="text-neutral-400 text-sm font-bold mb-6 leading-relaxed">
              Deseja realmente apagar este módulo? Digite <span className="text-red-500 font-black">EXCLUIR</span> para confirmar.
            </p>

            <div className="space-y-3 mb-8">
              <input 
                autoFocus
                type="text"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors text-center font-black tracking-[4px] uppercase"
                placeholder="---"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setModuleToDelete(null); setConfirmDeleteText(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 text-neutral-500 font-black hover:bg-neutral-900 uppercase text-[10px] tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={confirmDeleteText.toUpperCase() !== 'EXCLUIR'}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 disabled:opacity-10 text-white font-black hover:bg-red-700 uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-red-900/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
