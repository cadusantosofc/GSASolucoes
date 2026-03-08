import React from 'react';

interface DataRendererProps {
  data: any;
  level?: number;
}

export const DataRenderer: React.FC<DataRendererProps> = ({ data, level = 0 }) => {
  // Ignorar campos de metadados comuns
  const shouldIgnore = (key: string) => ['code', 'status'].includes(key);

  // Renderizar valor primitivo (string, number, boolean, null)
  const renderPrimitive = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;
    
    return (
      <div key={key} className="flex border-b border-neutral-900 py-2 hover:bg-neutral-900/30 transition-colors">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest w-1/3 flex-shrink-0">
          {key.replace(/_/g, ' ')}
        </span>
        <span className="text-white font-bold text-sm flex-1 break-words">
          {String(value)}
        </span>
      </div>
    );
  };

  // Renderizar array
  const renderArray = (key: string, arr: any[]) => {
    if (!arr || arr.length === 0) return null;

    return (
      <div key={key} className="my-4">
        <div className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded"></span>
          {key.replace(/_/g, ' ')} ({arr.length} {arr.length === 1 ? 'item' : 'itens'})
        </div>
        <div className="ml-4 space-y-3">
          {arr.map((item, idx) => (
            <div key={idx} className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-4">
              <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-2">
                Item {idx + 1}
              </div>
              {typeof item === 'object' && item !== null ? (
                <DataRenderer data={item} level={level + 1} />
              ) : (
                <span className="text-white text-sm">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar objeto aninhado
  const renderObject = (key: string, obj: any) => {
    return (
      <div key={key} className="my-4">
        <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500 rounded"></span>
          {key.replace(/_/g, ' ')}
        </div>
        <div className="ml-4 bg-neutral-900/20 border border-neutral-800 rounded-lg p-4">
          <DataRenderer data={obj} level={level + 1} />
        </div>
      </div>
    );
  };

  // Processar dados
  if (!data || typeof data !== 'object') {
    return <span className="text-neutral-500 italic">Sem dados</span>;
  }

  // Extrair o objeto 'data' se existir (para APIs que retornam { code, data: {...} })
  const actualData = data.data || data;

  return (
    <div className="space-y-1">
      {Object.entries(actualData).map(([key, value]) => {
        if (shouldIgnore(key)) return null;

        // Array
        if (Array.isArray(value)) {
          return renderArray(key, value);
        }

        // Objeto aninhado
        if (typeof value === 'object' && value !== null) {
          return renderObject(key, value);
        }

        // Primitivo
        return renderPrimitive(key, value);
      })}
    </div>
  );
};
