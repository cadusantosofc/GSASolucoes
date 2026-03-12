import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Module, Base, User, SearchHistory } from '../types';
import { ICONS } from '../constants';
import { DataRenderer } from '../components/DataRenderer';
import { printConsultation } from '../utils/printHelper';
import { Printer } from 'lucide-react';

interface ModuleDetailProps {
  modules: Module[];
  bases: Base[];
  user: User;
  balance: number;
  updateBalance: (amount: number) => void;
  addHistory: (item: SearchHistory) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ modules, bases, user, balance, updateBalance, addHistory }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const module = modules.find(m => m.slug === slug);
  const moduleBases = bases.filter(b => b.moduleId === module?.id && b.status?.toLowerCase() === 'active');

  const [selectedBaseId, setSelectedBaseId] = useState<string>('');
  const [document, setDocument] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!module) navigate('/consultations');
    if (moduleBases.length > 0 && !selectedBaseId) setSelectedBaseId(moduleBases[0].id);
  }, [module, moduleBases, selectedBaseId, navigate]);

  const selectedBase = moduleBases.find(b => b.id === selectedBaseId);

  const handleConsult = async () => {
    if (!selectedBase || !document) return;
    setError(null);
    setResult(null);

    if (balance < selectedBase.cost) {
      setError(`Saldo insuficiente! Custo: R$ ${(selectedBase.cost || 0).toFixed(2)} | Disponível: R$ ${(balance || 0).toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('gsa_token');
      
      const response = await fetch('https://api.gsacreditus.com.br/api/modules/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          baseId: selectedBase.id,
          document: document.trim()
        })
      });

      let data;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
      }

      data = await response.json();
      
      setResult(data);
      // Atualizar saldo no frontend (opcional, pois o próximo poll do sidebar já vai atualizar)
      updateBalance(-selectedBase.cost);
      
      // Histórico já é salvo no backend, mas podemos adicionar ao estado local se quisermos feedback instantâneo na lista (se houver)
      addHistory({
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.name,
        companyName: undefined,
        baseName: selectedBase.name,
        doc: document,
        cost: selectedBase.cost,
        timestamp: Date.now(),
        status: 'success',
        resultData: data
      });
    } catch (err: any) {
      setError(`Erro fatal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!module) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20">
      <div className="flex items-center gap-6 no-print">
        <button onClick={() => navigate('/consultations')} className="p-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl text-neutral-400 hover:text-white"><ICONS.ChevronRight.type className="rotate-180" /></button>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">BUSCA: {module.name}</h2>
          <p className="text-neutral-500 font-medium">Consumindo saldo de: <span className="text-blue-500">{user.companyId ? 'Empresa' : 'Individual'}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        <div className="lg:col-span-12">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex justify-between">Escolha o Provedor {selectedBase && <span className="text-emerald-500">R$ {(selectedBase.cost || 0).toFixed(2)}</span>}</label>
                <div className="space-y-2">
                  {moduleBases.map(b => {
                    const isFree = (b.cost || 0) === 0;
                    const isSelected = selectedBaseId === b.id;
                    const activeClass = isFree 
                      ? 'bg-emerald-600/10 border-emerald-600 text-white' 
                      : 'bg-blue-600/10 border-blue-600 text-white';
                    
                    return (
                      <button key={b.id} onClick={() => setSelectedBaseId(b.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? activeClass : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}>
                        <div className="text-left">
                          <span className="font-bold text-xs uppercase block">{b.name}</span>
                          {isSelected && b.description && <span className={`text-[9px] block ${isFree ? 'text-emerald-400' : 'text-blue-400'}`}>{b.description}</span>}
                        </div>
                        <span className={`text-[10px] font-black ${isFree ? 'text-emerald-500' : ''}`}>
                          {isFree ? 'GRÁTIS' : `R$ ${(b.cost || 0).toFixed(2)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Documento / Valor</label>
                <input type="text" value={document} onChange={e => setDocument(e.target.value)} placeholder="Digite aqui..." className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4 text-white text-xl font-black outline-none focus:border-blue-500" />
                <div className="p-4 bg-neutral-900/50 rounded-xl flex justify-between text-[10px] font-black uppercase tracking-widest border border-neutral-800">
                  <span className="text-neutral-500">Seu Saldo Disponível:</span>
                  <span className="text-white">R$ {(balance || 0).toFixed(2)}</span>
                </div>
                <button onClick={handleConsult} disabled={loading || !document} className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "CONSULTAR AGORA"}
                </button>
              </div>
            </div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-pulse">{error}</div>}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">RESULTADO DA BUSCA</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => printConsultation({ 
                  data: result, 
                  documentNumber: document, 
                  baseName: selectedBase?.name || 'Consulta',
                  userName: user?.name,
                  companyName: user?.company?.name
                })}
                className="px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir / PDF
              </button>
              <button onClick={() => setResult(null)} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-black uppercase text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all">Nova Consulta</button>
            </div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl">
             {/* Renderização Hierárquica */}
             <DataRenderer data={result} />

             {/* JSON bruto como fallback */}
             <div className="mt-8 pt-6 border-t border-neutral-900">
               <details>
                 <summary className="text-[10px] font-black text-neutral-600 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Ver dados brutos (JSON)</summary>
                 <pre className="mt-4 p-4 bg-black rounded-xl text-[10px] text-emerald-500 font-mono overflow-x-auto border border-neutral-900">
                   {JSON.stringify(result, null, 2)}
                 </pre>
               </details>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
