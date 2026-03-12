import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SharedLink, SearchHistory } from '../types';
import { DataRenderer } from '../components/DataRenderer';
import { printConsultation } from '../utils/printHelper';
import { Printer, Download } from 'lucide-react';

interface SharedResultProps {
  sharedLinks: SharedLink[];
  history: SearchHistory[];
}

export const SharedResult: React.FC<SharedResultProps> = ({ sharedLinks, history }) => {
  const { shareId } = useParams();
  const [timeLeft, setTimeLeft] = useState('');
  
  const link = sharedLinks.find(l => l.id === shareId);
  const data = history.find(h => h.id === link?.historyId);
  
  const isExpired = link ? Date.now() > link.expiresAt : true;

  useEffect(() => {
    if (!link || isExpired) return;

    const timer = setInterval(() => {
      const diff = link.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft('EXPIRADO');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [link, isExpired]);

  if (!link || isExpired) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-4xl">⚠️</div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">LINK EXPIRADO OU INVÁLIDO</h2>
        <p className="text-neutral-500 max-w-md">Este link de consulta pública expirou após o prazo de 24 horas ou nunca existiu.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs">Voltar ao Sistema</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 font-black text-9xl select-none">GSA</div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Consulta Compartilhada</h1>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">
              Gerado por: {link.creatorName} | Doc: {data?.doc}
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl text-center">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Expira em:</p>
            <p className="text-2xl font-black text-white font-mono">{timeLeft}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            DADOS DA CONSULTA ({data?.baseName})
          </h3>

          <button 
             onClick={() => printConsultation({ 
               data: data?.resultData, 
               documentNumber: data?.doc || '', 
               baseName: data?.baseName || '',
               userName: link.creatorName
             })}
             className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>

        <div className="bg-neutral-900/20 rounded-2xl p-2 border border-neutral-800/50">
          {data?.resultData ? (
             <DataRenderer data={data.resultData} />
          ) : (
            <p className="text-neutral-500 italic p-4">Estrutura de dados não disponível.</p>
          )}
        </div>

        <div className="pt-6 border-t border-neutral-900 text-center">
          <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-[4px]">GSA Créditus • SISTEMA DE BUSCAS SEGURO</p>
        </div>
      </div>
    </div>
  );
};
