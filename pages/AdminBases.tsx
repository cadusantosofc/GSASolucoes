
import React, { useState, useEffect } from 'react';
import { Base, Module } from '../types';
import { ICONS } from '../constants';
import { VariableInserter } from '../components/VariableInserter';

interface AdminBasesProps {
  bases: Base[];
  setBases: React.Dispatch<React.SetStateAction<Base[]>>;
  modules: Module[];
}

export const AdminBases: React.FC<AdminBasesProps> = ({ bases, setBases, modules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [editingBase, setEditingBase] = useState<Base | null>(null);
  const [baseToDelete, setBaseToDelete] = useState<Base | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [curlText, setCurlText] = useState('');
  
  const [formData, setFormData] = useState<Partial<Base>>({
    name: '',
    description: '',
    moduleId: modules[0]?.id || '',
    cost: 1.50,
    status: 'active',
    baseUrl: 'https://api.servico.com/busca?doc={{doc}}&token={{token}}',
    method: 'GET',
    headers: {},
    bodyParams: {}
  });

  // Carregar bases ao montar o componente
  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      const token = localStorage.getItem('gsa_token');
      const response = await fetch('https://api.gsacreditus.com.br/api/bases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar bases');

      const data = await response.json();
      setBases(data);
    } catch (err: any) {
      console.error('Erro ao carregar bases:', err);
    }
  };

  const openAddModal = () => {
    setEditingBase(null);
    setFormData({
      name: '',
      description: '',
      moduleId: modules[0]?.id || '',
      cost: 1.50,
      status: 'active',
      baseUrl: 'https://api.servico.com/busca?doc={{doc}}&token={{token}}',
      method: 'GET',
      headers: {},
      bodyParams: {}
    });
    setShowAdvanced(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (base: Base) => {
    setEditingBase(base);
    setFormData({
      name: base.name,
      description: base.description || '',
      moduleId: base.moduleId,
      cost: base.cost,
      status: base.status,
      baseUrl: base.baseUrl,
      method: base.method || 'GET',
      headers: base.headers || {},
      bodyParams: base.bodyParams || {}
    });
    setShowAdvanced(!!base.headers || !!base.bodyParams || base.method === 'POST');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.moduleId || !formData.baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('gsa_token');
      
      const payload = {
        name: formData.name!,
        description: formData.description,
        moduleId: formData.moduleId!,
        cost: formData.cost!,
        status: formData.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        baseUrl: formData.baseUrl!,
        method: formData.method,
        headers: formData.headers,
        bodyParams: formData.bodyParams
      };

      if (editingBase) {
        // Editar base existente
        const response = await fetch(`https://api.gsacreditus.com.br/api/bases/${editingBase.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao atualizar base');
        }

        const updatedBase = await response.json();
        setBases(prev => prev.map(b => b.id === editingBase.id ? {
          ...updatedBase,
          status: updatedBase.status.toLowerCase()
        } : b));
      } else {
        // Criar nova base
        const response = await fetch('https://api.gsacreditus.com.br/api/bases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao criar base');
        }

        const newBase = await response.json();
        setBases(prev => [...prev, {
          ...newBase,
          status: newBase.status.toLowerCase()
        }]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (base: Base) => {
    setBaseToDelete(base);
    setConfirmDeleteText('');
    setError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!baseToDelete || confirmDeleteText.toUpperCase() !== 'EXCLUIR') return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('gsa_token');
      const response = await fetch(`https://api.gsacreditus.com.br/api/bases/${baseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar base');
      }

      setBases(prev => prev.filter(b => b.id !== baseToDelete.id));
      setIsDeleteModalOpen(false);
      setBaseToDelete(null);
      setConfirmDeleteText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseCurl = (curl: string) => {
    try {
      let url = '';
      let method = 'GET';
      const headers: Record<string, string> = {};
      let bodyParams: any = {};
  
      // Extract URL (basic extraction, looking for http/https)
      const urlMatch = curl.match(/'(https?:\/\/[^']+)'/);
      const urlMatchDouble = curl.match(/"(https?:\/\/[^"]+)"/);
      const urlMatchSimple = curl.match(/(https?:\/\/[^\s]+)/);
      
      if (urlMatch) url = urlMatch[1];
      else if (urlMatchDouble) url = urlMatchDouble[1];
      else if (urlMatchSimple) url = urlMatchSimple[1];
      
      // Auto-replace common variables to system standard
      url = url.replace(/\{\{?(cpf|cnpj)\}\}?/gi, '{{doc}}')
               .replace(/\{\{?user_token\}\}?/gi, '{{token}}')
               .replace(/\{\{?token\}\}?/gi, '{{token}}');
  
      // Extract Method
      const methodMatch = curl.match(/-X\s+([A-Z]+)/) || curl.match(/--request\s+([A-Z]+)/);
      if (methodMatch) method = methodMatch[1];
  
      // Extract Headers
      const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
      let headerMatch;
      while ((headerMatch = headerRegex.exec(curl)) !== null) {
        const [key, ...values] = headerMatch[1].split(':');
        if (key && values.length) {
          headers[key.trim()] = values.join(':').trim();
        }
      }
  
      // Extract Body
      const bodyMatch = curl.match(/--data-raw\s+'([^']+)'/) || 
                        curl.match(/--data\s+'([^']+)'/) || 
                        curl.match(/-d\s+'([^']+)'/);
      
      if (bodyMatch) {
         try {
            bodyParams = JSON.parse(bodyMatch[1]);
            method = 'POST'; // Force POST if body exists and method wasn't set
         } catch {
            // If not JSON, try to parse form data or keep as is? 
            // For now let's leave empty if not JSON or maybe string
         }
      }
  
      setFormData(prev => ({
        ...prev,
        baseUrl: url || prev.baseUrl,
        method,
        headers,
        bodyParams: Object.keys(bodyParams).length > 0 ? bodyParams : prev.bodyParams
      }));

      // Auto-open advanced settings if we have complex data
      if (Object.keys(headers).length > 0 || Object.keys(bodyParams).length > 0 || method === 'POST') {
        setShowAdvanced(true);
      }
  
      setIsCurlModalOpen(false);
      setCurlText('');
    } catch (err) {
      setError('Erro ao ler cURL. Verifique o formato.');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Gerenciar Provedores</h2>
          <p className="text-neutral-500 text-sm">Configure as APIs de busca para cada módulo.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-blue-900/20 uppercase text-xs tracking-widest"
        >
          {ICONS.Plus} Nova Base
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-neutral-900/50 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nome / API</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Módulo</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Custo</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {bases.map((b) => {
              const module = modules.find(m => m.id === b.moduleId);
              return (
                <tr key={b.id} className="hover:bg-neutral-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm uppercase tracking-tight">{b.name}</p>
                    <p className="text-[9px] text-neutral-600 font-mono truncate max-w-[200px]">{b.baseUrl}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded uppercase tracking-tighter border border-blue-500/20">
                      {module?.name || '??'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-500 text-sm tracking-tighter">
                    R$ {(b.cost || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                      b.status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {b.status.toUpperCase() === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(b)}
                        className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 hover:text-blue-500 hover:border-blue-500/50 transition-all"
                        title="Editar"
                      >
                        {React.cloneElement(ICONS.Settings as React.ReactElement<any>, { className: "w-4 h-4" })}
                      </button>
                      <button 
                        onClick={() => openDeleteModal(b)}
                        className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-500 hover:border-red-500/50 transition-all"
                        title="Excluir"
                      >
                        {React.cloneElement(ICONS.Trash2 as React.ReactElement<any>, { className: "w-4 h-4" })}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bases.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-neutral-600 font-bold uppercase tracking-widest text-xs italic">
                   Nenhuma base cadastrada.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl md:text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg">{editingBase ? ICONS.Settings : ICONS.Database}</span>
              {editingBase ? 'Editar Base' : 'Nova Base'}
            </h3>
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCurlModalOpen(true)}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-blue-600 transition-all flex items-center gap-2"
              >
                 <span>&lt;/&gt;</span> Importar cURL
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nome Provedor</label>
                  <input 
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-bold"
                    placeholder="Ex: API Governamental"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Módulo</label>
                  <select 
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none font-bold"
                    value={formData.moduleId}
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
                    ))}
                    {modules.length === 0 && <option disabled>Crie um módulo primeiro</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Descrição detalhada</label>
                <textarea 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm h-24"
                  placeholder="Descreva o que este provedor retorna (Ex: Score, Endereço, Telefones)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Custo (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-bold"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</label>
                  <div className="flex gap-4 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'active'})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}
                    >
                      ATIVO
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'inactive'})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status?.toUpperCase() === 'INACTIVE' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}
                    >
                      INATIVO
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                  URL da API
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600 normal-case">Variáveis:</span>
                    <VariableInserter onInsert={(val) => {
                       const input = document.getElementById('base-url-input') as HTMLInputElement;
                       if (input) {
                         const start = input.selectionStart || 0;
                         const end = input.selectionEnd || 0;
                         const text = formData.baseUrl || '';
                         const newText = text.substring(0, start) + val + text.substring(end);
                         setFormData({...formData, baseUrl: newText});
                         // Restore focus and cursor position after react render
                         setTimeout(() => {
                           input.focus();
                           input.setSelectionRange(start + val.length, start + val.length);
                         }, 0);
                       }
                    }} />
                  </div>
                </label>
                <input 
                  id="base-url-input"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs"
                  placeholder="https://api.provedor.com/search?q={{doc}}&key={{token}}"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                />
              </div>

              {/* Configurações Avançadas Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showAdvanced ? 'bg-blue-600' : 'bg-neutral-800'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showAdvanced ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  Configurações Avançadas (Headers, Método, Body)
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-6 animate-in slide-in-from-top-2">
                     <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Método HTTP</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, method: 'GET'})}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.method === 'GET' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}
                        >
                          GET
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, method: 'POST'})}
                          className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.method === 'POST' ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}
                        >
                          POST
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                         Headers da Requisição
                         <button 
                           type="button"
                           onClick={() => {
                             const currentHeaders = typeof formData.headers === 'object' ? {...formData.headers} : {};
                             // Adicionar nova chave temporária
                             const newKey = `novo_header_${Object.keys(currentHeaders).length + 1}`;
                             setFormData({
                               ...formData, 
                               headers: { ...currentHeaders, [newKey]: '' }
                             });
                           }}
                           className="text-xs text-blue-500 hover:text-blue-400 font-bold uppercase flex items-center gap-1"
                         >
                           {React.cloneElement(ICONS.Plus as React.ReactElement<any>, { className: "w-3 h-3" })} Adicionar Header
                         </button>
                       </label>
                       
                       <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                         {Object.entries(typeof formData.headers === 'object' && formData.headers ? formData.headers : {}).map(([key, value], idx) => (
                           <div key={idx} className="flex gap-2 items-center group/item">
                             <input 
                               className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
                               placeholder="Chave (ex: X-API-KEY)"
                               value={key.startsWith('novo_header_') ? '' : key}
                               onChange={(e) => {
                                 const newKey = e.target.value;
                                 const headers = {...(formData.headers as any)};
                                 const currentValue = headers[key];
                                 delete headers[key];
                                 if (newKey) headers[newKey] = currentValue;
                                 setFormData({...formData, headers});
                               }}
                             />
                             <span className="text-neutral-600 font-bold">:</span>
                             <div className="flex-1 relative">
                               <input 
                                 id={`header-val-${idx}`}
                                 className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-emerald-500 text-xs font-mono focus:border-blue-500 focus:outline-none pr-8"
                                 placeholder="Valor (ex: bearer-token...)"
                                 value={value as string}
                                 onChange={(e) => {
                                   const headers = {...(formData.headers as any)};
                                   headers[key] = e.target.value;
                                   setFormData({...formData, headers});
                                 }}
                               />
                               <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <VariableInserter onInsert={(val) => {
                                     const input = document.getElementById(`header-val-${idx}`) as HTMLInputElement;
                                     if (input) {
                                       const start = input.selectionStart || 0;
                                       const end = input.selectionEnd || 0;
                                       const text = (value as string) || '';
                                       const newText = text.substring(0, start) + val + text.substring(end);
                                       
                                       const headers = {...(formData.headers as any)};
                                       headers[key] = newText;
                                       setFormData({...formData, headers});
                                       
                                       setTimeout(() => {
                                         input.focus();
                                         input.setSelectionRange(start + val.length, start + val.length);
                                       }, 0);
                                     }
                                  }} className="bg-neutral-900" />
                               </div>
                             </div>
                             <button
                               type="button"
                               onClick={() => {
                                 const headers = {...(formData.headers as any)};
                                 delete headers[key];
                                 setFormData({...formData, headers});
                               }}
                               className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
                             >
                               {React.cloneElement(ICONS.Trash2 as React.ReactElement<any>, { className: "w-4 h-4" })}
                             </button>
                           </div>
                         ))}
                         {Object.keys(formData.headers || {}).length === 0 && (
                           <p className="text-center text-neutral-600 text-[10px] italic py-2">Nenhum header configurado.</p>
                         )}
                       </div>
                    </div>

                    {formData.method === 'POST' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex justify-between items-center">
                          Body JSON
                           <div className="flex items-center gap-2">
                             <span className="text-neutral-600 normal-case">Variáveis:</span>
                             <VariableInserter onInsert={(val) => {
                                const input = document.getElementById('body-params-input') as HTMLTextAreaElement;
                                if (input) {
                                  const start = input.selectionStart || 0;
                                  const end = input.selectionEnd || 0;
                                  const text = typeof formData.bodyParams === 'string' ? formData.bodyParams : JSON.stringify(formData.bodyParams || {}, null, 2);
                                  const newText = text.substring(0, start) + val + text.substring(end);
                                  
                                  try {
                                     // Tenta parsear se for JSON válido, senão salva como string temporariamente
                                     setFormData({...formData, bodyParams: JSON.parse(newText)});
                                  } catch {
                                     setFormData({...formData, bodyParams: newText as any});
                                  }

                                  setTimeout(() => {
                                    input.focus();
                                    input.setSelectionRange(start + val.length, start + val.length);
                                  }, 0);
                                }
                             }} />
                           </div>
                        </label>
                        <textarea 
                          id="body-params-input"
                          className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-amber-500 font-mono text-xs h-32 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder='{
  "documento": "{{doc}}",
  "tipo": "cpf_cnpj"
}'
                          value={typeof formData.bodyParams === 'string' ? formData.bodyParams : JSON.stringify(formData.bodyParams || {}, null, 2)}
                          onChange={(e) => {
                             try {
                                setFormData({...formData, bodyParams: JSON.parse(e.target.value)});
                             } catch {
                                setFormData({...formData, bodyParams: e.target.value as any});
                             }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
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

      {isDeleteModalOpen && baseToDelete && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-red-500 mb-6">
               <div className="p-3 bg-red-500/10 rounded-xl">
                 {React.cloneElement(ICONS.AlertCircle as React.ReactElement<any>, { className: "w-8 h-8" })}
               </div>
               <div>
                 <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-tight">Confirmar Exclusão</h3>
                 <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest truncate max-w-[200px]">{baseToDelete.name}</p>
               </div>
            </div>
            
            <p className="text-neutral-400 text-sm font-medium mb-6 leading-relaxed">
              Deseja remover este provedor? Digite <span className="text-red-500 font-bold">EXCLUIR</span> para confirmar.
            </p>

            <div className="space-y-3 mb-8">
              <input 
                autoFocus
                type="text"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-colors text-center font-black tracking-[4px]"
                placeholder="---"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setConfirmDeleteText(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 text-neutral-500 font-bold hover:bg-neutral-900 uppercase text-[10px] tracking-widest"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={confirmDeleteText.toUpperCase() !== 'EXCLUIR'}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 disabled:opacity-20 text-white font-black hover:bg-red-700 uppercase text-[10px] tracking-widest transition-all"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCurlModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">
              Importar cURL
            </h3>
            <p className="text-neutral-500 text-xs mb-6">
              Cole o comando cURL copiado do navegador (DevTools &gt; Network &gt; Copy as cURL).
            </p>

            <textarea 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-xs h-40 focus:outline-none focus:border-blue-500 transition-colors mb-6"
              placeholder="curl 'https://api.site.com/v1/...' -H 'User-Agent: ...'"
              value={curlText}
              onChange={(e) => setCurlText(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsCurlModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-neutral-800 text-neutral-500 font-bold hover:bg-neutral-900 uppercase text-[10px] tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={() => parseCurl(curlText)}
                disabled={!curlText.trim()}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
              >
                Processar e Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
