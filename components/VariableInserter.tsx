import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';

interface VariableInserterProps {
  onInsert: (value: string) => void;
  className?: string;
}

export const VariableInserter: React.FC<VariableInserterProps> = ({ onInsert, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const variables = [
    { key: '{{doc}}', desc: 'Documento pesquisado (CPF, CNPJ, etc)' },
    { key: '{{token}}', desc: 'Seu token interno' },
    { key: '{{user_id}}', desc: 'ID do usuário atual' },
    { key: '{{company_id}}', desc: 'ID da empresa atual' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1 group"
        title="Inserir Variável"
      >
        <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] border border-current rounded-sm group-hover:border-white">
          {'{ }'}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-neutral-800 bg-neutral-900/50">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center">Variáveis Disponíveis</p>
          </div>
          <div className="p-1">
            {variables.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  onInsert(v.key);
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-neutral-800 rounded-lg group transition-colors flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-mono text-xs font-bold">{v.key}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black uppercase text-neutral-500 tracking-widest transition-opacity">+ INSERIR</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-tight">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
