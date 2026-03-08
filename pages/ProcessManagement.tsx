
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface Process {
  id: string;
  type: string;
  status: string;
  description: string;
  setupFee: number;
  debtValue?: number;
  totalFee?: number;
  client: { name: string; email: string };
  owner: { name: string; role: string };
  createdAt: string;
}

export const ProcessManagement: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const currentUser = JSON.parse(localStorage.getItem('gsa_current_user') || '{}') as User;
  const isInternal = ['SUPER', 'ADMIN', 'GESTOR', 'VENDEDOR'].includes(currentUser.role?.toUpperCase());

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('gsa_token');
      const res = await fetch('http://localhost:3001/api/processes/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProcesses(await res.json());
      }
    } catch (err) {
      console.error('Erro ao buscar processos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'EM_ANDAMENTO': return <Clock className="text-blue-500 animate-pulse" size={18} />;
      case 'PENDENTE': return <AlertCircle className="text-yellow-500" size={18} />;
      default: return <FileText className="text-neutral-500" size={18} />;
    }
  };

  const filteredProcesses = processes.filter(p => {
    const matchesSearch = p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Gestão de Processos</h2>
          <p className="text-neutral-500 text-sm">Acompanhamento de Reabilitação, BACEN e Busca de Capital.</p>
        </div>
        {isInternal && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black transition-all shadow-xl shadow-blue-900/20 uppercase text-xs tracking-widest active:scale-95">
            <Plus size={16} /> Novo Processo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por cliente ou tipo de serviço..."
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <select 
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold uppercase text-[10px] tracking-widest appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ENVIADO">Enviado</option>
            <option value="PENDENTE">Pendente</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProcesses.length > 0 ? (
          filteredProcesses.map((p) => (
            <div key={p.id} className="group bg-[#0a0a0a] border border-neutral-900 hover:border-neutral-700 p-6 rounded-3xl transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center text-blue-500">
                    {getStatusIcon(p.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">{p.type.replace('_', ' ')}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-neutral-400 text-xs font-bold">{p.client.name}</p>
                      <span className="text-neutral-700">•</span>
                      <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-neutral-600 text-[9px] font-black uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         p.status === 'CONCLUIDO' ? 'bg-green-500/10 text-green-500' :
                         p.status === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-500' :
                         p.status === 'PENDENTE' ? 'bg-yellow-500/10 text-yellow-500' :
                         'bg-neutral-800 text-neutral-400'
                       }`}>
                         {p.status.replace('_', ' ')}
                       </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-neutral-600 text-[9px] font-black uppercase tracking-widest mb-1">Investimento</p>
                    <p className="text-white font-black text-sm">R$ {p.setupFee.toFixed(2)}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                    <ChevronRight size={18} className="text-neutral-700 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-neutral-900/20 border-2 border-dashed border-neutral-900 rounded-3xl p-20 text-center">
            <FileText className="mx-auto text-neutral-800 mb-4" size={48} />
            <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">Nenhum processo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
