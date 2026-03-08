import React, { useState } from 'react';
import { SearchHistory, SharedLink, User } from '../types';
import { ICONS } from '../constants';
import { X, Printer, Copy, Check, Share2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataRenderer } from '../components/DataRenderer';
import { printConsultation } from '../utils/printHelper';

interface HistoryPageProps {
  history: SearchHistory[];
  sharedLinks: SharedLink[];
  setSharedLinks: React.Dispatch<React.SetStateAction<SharedLink[]>>;
  currentUser: User;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ history, sharedLinks, setSharedLinks, currentUser }) => {
  const [viewingResult, setViewingResult] = useState<SearchHistory | null>(null);
  const [activeShareLink, setActiveShareLink] = useState<{link: SharedLink, doc: string} | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calcular Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistory = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenShare = (item: SearchHistory) => {
    const existingLink = sharedLinks.find(l => l.historyId === item.id && l.expiresAt > Date.now());
    
    if (existingLink) {
      setActiveShareLink({ link: existingLink, doc: item.doc });
      return;
    }

    const newLink: SharedLink = {
      id: crypto.randomUUID(),
      historyId: item.id,
      creatorName: currentUser.name,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };

    setSharedLinks(prev => [...prev, newLink]);
    setActiveShareLink({ link: newLink, doc: item.doc });
  };

  const copyToClipboard = () => {
    if (!activeShareLink) return;
    const fullUrl = `${window.location.origin}/#/share/${activeShareLink.link.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const getTimeRemaining = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m restantes`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">HISTÓRICO DE BUSCAS</h2>
          <p className="text-neutral-500 text-sm">Visualização de consultas realizadas e compartilhamento público.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-neutral-900/50 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Data / Autor</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Base</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Custo</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {currentHistory.map(item => (
                <tr key={item.id} className="hover:bg-neutral-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-neutral-400">{new Date(item.timestamp).toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase mt-1">{item.userName} {item.companyName ? `(${item.companyName})` : ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-tight">
                      {item.baseName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-neutral-300">{item.doc}</td>
                  <td className="px-6 py-4 font-black text-emerald-500">R$ {(item.cost || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounde-full rounded text-[10px] font-black uppercase tracking-widest ${item.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                       {item.status === 'success' ? 'SUCESSO' : 'ERRO'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === 'success' && (
                        <button 
                          onClick={() => setViewingResult(item)}
                          className="px-3 py-2 bg-blue-600/10 text-blue-500 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                        >
                          Ver Dados
                        </button>
                      )}
                      {item.status === 'success' && (
                        <button 
                          onClick={() => handleOpenShare(item)}
                          className="px-3 py-2 bg-emerald-600/10 text-emerald-500 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                          title="Compartilhar Link"
                        >
                          <Share2 className="w-3 h-3" />
                          Compartilhar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-neutral-600 uppercase font-black tracking-widest text-xs italic">Sem registros de busca.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-900/30">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de Compartilhamento */}
      {activeShareLink && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
              <button 
                onClick={() => setActiveShareLink(null)} 
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Compartilhar Consulta</h3>
                <p className="text-neutral-500 text-xs mt-2 uppercase tracking-tight">Doc: {activeShareLink.doc}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex items-center justify-between gap-3">
                   <code className="text-xs text-blue-400 truncate flex-1 font-mono">
                     {`${window.location.origin}/#/share/${activeShareLink.link.id}`}
                   </code>
                   <button 
                     onClick={copyToClipboard}
                     className={`p-2 rounded-lg transition-all ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                   >
                     {copyFeedback ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Expira em: {getTimeRemaining(activeShareLink.link.expiresAt)}</span>
                </div>

                <p className="text-[10px] text-center text-neutral-600 px-4">
                  Qualquer pessoa com este link poderá ver os detalhes desta consulta pelas próximas 24 horas.
                </p>
              </div>
           </div>
        </div>
      )}

      {/* Modal Visualização de Dados Salvos */}
      {viewingResult && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-4xl rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-start mb-8">
               <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">CONSULTA REALIZADA</h3>
                 <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">DOC: {viewingResult.doc} | {viewingResult.baseName}</p>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => printConsultation({
                     data: viewingResult.resultData,
                     documentNumber: viewingResult.doc,
                     baseName: viewingResult.baseName,
                     userName: viewingResult.userName,
                     companyName: viewingResult.companyName
                   })}
                   className="px-3 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                   title="Imprimir / PDF"
                 >
                   <Printer className="w-4 h-4" />
                   Imprimir / PDF
                 </button>
                 <button onClick={() => setViewingResult(null)} className="p-2 text-neutral-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
               </div>
             </div>

             <div className="bg-neutral-900/20 rounded-2xl p-6 md:p-8 border border-neutral-800">
                {viewingResult.resultData ? (
                  <>
                    {/* Renderização Hierárquica */}
                    <DataRenderer data={viewingResult.resultData} />

                     {/* JSON Fallback */}
                     <div className="mt-8 pt-6 border-t border-neutral-800">
                       <details>
                         <summary className="text-[10px] font-black text-neutral-600 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors">Ver dados originais (JSON)</summary>
                         <pre className="mt-4 p-4 bg-black rounded-xl text-[10px] text-emerald-500 font-mono overflow-x-auto border border-neutral-900">
                           {JSON.stringify(viewingResult.resultData, null, 2)}
                         </pre>
                       </details>
                     </div>
                  </>
                ) : (
                  <p className="text-neutral-500 italic">Dados não armazenados para esta consulta antiga.</p>
                )}
             </div>

             <div className="mt-8 flex justify-end gap-4">
               <button onClick={() => setViewingResult(null)} className="px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-black uppercase text-neutral-500 hover:text-white transition-colors">Fechar Visualização</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
