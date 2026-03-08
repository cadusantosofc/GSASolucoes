
import React from 'react';
import { User, Module, Base, SearchHistory } from '../types';
import { ICONS } from '../constants';
import { CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  user: User;
  balance: number;
  modules: Module[];
  bases: Base[];
  history: SearchHistory[];
}

// Added the balance prop to Dashboard component to ensure correct SaaS/Individual balance display
export const Dashboard: React.FC<DashboardProps> = ({ user, balance, modules, bases, history }) => {
  const stats = [
    { label: 'Saldo Atual', value: `R$ ${(balance || 0).toFixed(2)}`, icon: ICONS.CreditCard, color: 'text-blue-500' },
    { label: 'Módulos Ativos', value: modules.length, icon: ICONS.LayoutDashboard, color: 'text-purple-500' },
    { label: 'Provedores', value: bases.length, icon: ICONS.Database, color: 'text-emerald-500' },
    { label: 'Total Consultas', value: history.length, icon: ICONS.History, color: 'text-orange-500' },
  ];

  const recentHistory = history.slice(0, 5);

  const chartData = [
    { name: 'Seg', val: 12 },
    { name: 'Ter', val: 24 },
    { name: 'Qua', val: 18 },
    { name: 'Qui', val: 35 },
    { name: 'Sex', val: 28 },
    { name: 'Sab', val: 15 },
    { name: 'Dom', val: 10 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tighter">GSA Soluções - Painel</h2>
        <p className="text-neutral-500 text-sm md:text-base">Confira o resumo das suas atividades e saldo hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-neutral-800 p-5 md:p-6 rounded-2xl hover:border-neutral-700 transition-all group shadow-lg">
            <div className={`p-3 rounded-xl bg-neutral-900 w-fit mb-4 transition-transform group-hover:scale-110 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-neutral-500 text-[10px] md:text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-neutral-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Atividade Semanal</h3>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-blue-500"></span>
               <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Consultas Realizadas</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 10}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px'}}
                  itemStyle={{color: '#3b82f6', fontSize: '12px', fontWeight: 'bold'}}
                  cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg md:text-xl font-black text-white mb-6 uppercase tracking-tighter">Últimas Consultas</h3>
          <div className="space-y-4">
            {recentHistory.length > 0 ? (
              recentHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {ICONS.Search}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-black text-white truncate uppercase tracking-tight">{item.baseName}</p>
                      <p className="text-[10px] text-neutral-600 font-bold uppercase">{new Date(item.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-red-500 shrink-0">-{(item.cost || 0).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-neutral-700">
                <p className="text-xs italic uppercase font-black tracking-widest">Sem movimentações</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
