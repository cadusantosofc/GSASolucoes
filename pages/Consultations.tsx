
import React from 'react';
import { Link } from 'react-router-dom';
import { Module, Base } from '../types';
import { ICONS, AVAILABLE_ICONS } from '../constants';

interface ConsultationsProps {
  modules: Module[];
  bases: Base[];
}

export const Consultations: React.FC<ConsultationsProps> = ({ modules, bases }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase">CONSULTAS</h2>
          <p className="text-neutral-500 mt-1">Selecione um módulo para iniciar sua pesquisa.</p>
        </div>
        <Link 
          to="/admin/modules"
          className="text-xs font-bold text-neutral-500 hover:text-blue-500 transition-colors uppercase tracking-widest flex items-center gap-2"
        >
          {ICONS.Settings} Gerenciar Módulos
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((module) => {
          const moduleBases = bases.filter(b => b.moduleId === module.id && b.status?.toLowerCase() === 'active');
          const iconObj = AVAILABLE_ICONS.find(i => i.id === module.icon) || AVAILABLE_ICONS[0];

          return (
            <Link
              key={module.id}
              to={`/consultations/${module.slug}`}
              className="group bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl hover:border-blue-500/50 hover:bg-neutral-900/40 transition-all relative flex flex-col min-h-[220px]"
            >
              <div className="w-14 h-14 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {React.cloneElement(iconObj.icon as React.ReactElement<any>, { className: "w-7 h-7" })}
              </div>

              <div className="mt-auto">
                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">
                  {module.name}
                </h3>
                <p className="text-neutral-500 text-sm line-clamp-2">
                  {module.description}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    {moduleBases.length} Provedores Ativos
                  </span>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all">
                    {ICONS.ChevronRight}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-20 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-3xl">
          <p className="text-neutral-600 font-bold uppercase tracking-widest text-sm">Nenhum módulo cadastrado</p>
          <Link to="/admin/modules" className="text-blue-500 text-xs font-bold mt-2 hover:underline inline-block">Clique aqui para criar o primeiro</Link>
        </div>
      )}
    </div>
  );
};
