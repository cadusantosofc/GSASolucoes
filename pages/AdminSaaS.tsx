
import React, { useState } from 'react';
import { User, Company } from '../types';
import { ICONS } from '../constants';
import { Users, Building2, Wallet, Plus, Settings2 } from 'lucide-react';

interface AdminSaaSProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  isGlobal?: boolean;
}

export const AdminSaaS: React.FC<AdminSaaSProps> = ({ users, setUsers, companies, setCompanies, isGlobal = true }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users'); // Altera padrão para users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [companyForm, setCompanyForm] = useState({ name: '', cnpj: '', phone: '', balance: 0 });
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    password: '123', // Senha padrão para novos usuários
    role: 'cliente' as User['role'], 
    companyId: '', 
    balance: 0, 
    phone: '', 
    document: '',
    region: '',
    isAtivo: false
  });

  const currentUser = JSON.parse(localStorage.getItem('gsa_current_user') || '{}') as User;
  const isSuper = currentUser.role?.toLowerCase() === 'super';
  const isAdmin = currentUser.role?.toLowerCase() === 'admin';
  const isGestor = currentUser.role?.toLowerCase() === 'gestor';
  const isVendedor = currentUser.role?.toLowerCase() === 'vendedor';

  // Forçar tab de usuários se não for Super ou não for modo Global
  React.useEffect(() => {
    if ((!isSuper || !isGlobal) && activeTab === 'companies') {
      setActiveTab('users');
    }
  }, [isSuper, isGlobal]);

  React.useEffect(() => {
    const fetchSubordinates = async () => {
      const token = localStorage.getItem('gsa_token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:3001/api/users/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Erro ao carregar subordinados:', err);
      }
    };

    fetchSubordinates();
  }, [setUsers]);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCo: Company = {
      id: crypto.randomUUID(),
      name: companyForm.name,
      cnpj: companyForm.cnpj,
      phone: companyForm.phone,
      balance: companyForm.balance,
      createdAt: Date.now()
    };
    setCompanies(prev => [...prev, newCo]);
    setIsModalOpen(false);
    setCompanyForm({ name: '', cnpj: '', phone: '', balance: 0 });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('gsa_token');

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userForm,
          parentId: currentUser.id,
          role: userForm.role.toUpperCase()
        })
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [...prev, newUser]);
        setIsModalOpen(false);
        setUserForm({ 
          name: '', email: '', password: '123', role: 'cliente', 
          companyId: '', balance: 0, phone: '', document: '', 
          region: '', isAtivo: false 
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            {isSuper && isGlobal ? 'GESTÃO DE PARCEIROS' : isAdmin ? 'ADMINISTRAÇÃO DA EMPRESA' : isGestor ? 'MINHA EQUIPE' : 'MEUS CLIENTES'}
          </h2>
          <p className="text-neutral-500 text-sm">
            {isSuper && isGlobal ? 'Controle centralizado de empresas parceiras e seus respectivos colaboradores.' : 'Gerencie seus membros e acompanhe o crescimento da sua rede.'}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-black transition-all shadow-xl uppercase text-xs tracking-widest active:scale-95"
        >
          <Plus size={16} /> {activeTab === 'companies' ? 'Nova Empresa' : 'Novo Usuário'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-neutral-900">
        {isSuper && isGlobal && (
          <button 
            onClick={() => setActiveTab('companies')}
            className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'companies' ? 'text-blue-500' : 'text-neutral-600 hover:text-neutral-400'}`}
          >
            Empresas ({companies.length})
            {activeTab === 'companies' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-in fade-in duration-300"></div>}
          </button>
        )}
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'users' ? 'text-blue-500' : 'text-neutral-600 hover:text-neutral-400'}`}
        >
          {isSuper && isGlobal ? 'Usuários Globais' : 'Membros da Equipe'} ({users.length})
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-in fade-in duration-300"></div>}
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[32px] overflow-hidden shadow-2xl overflow-x-auto">
        {activeTab === 'companies' ? (
          <table className="w-full text-left">
            <thead className="bg-neutral-900/50 border-b border-neutral-900">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Empresa / CNPJ</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Saldo Atual</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Contagem de Funcionários</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {companies.map(c => {
                const employeeCount = users.filter(u => u.companyId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-neutral-900/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-blue-500 border border-neutral-800">
                             <Building2 size={18} />
                          </div>
                          <div>
                             <p className="font-black text-white uppercase text-sm tracking-tight">{c.name}</p>
                             <p className="text-[10px] text-neutral-600 font-mono">{c.cnpj}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 font-black text-emerald-500 text-sm">
                          <Wallet size={14} className="opacity-50" />
                          R$ {(c.balance || 0).toFixed(2)}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg group-hover:border-blue-500/30 transition-all">
                          <Users size={12} className="text-blue-500" />
                          <span className="text-xs font-black text-white uppercase">{employeeCount}</span>
                          <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Membros</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white hover:border-neutral-700 transition-all">
                        <Settings2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-neutral-700 font-black uppercase tracking-widest text-[10px] italic">
                    Nenhum parceiro registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-neutral-900/50 border-b border-neutral-900">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Identificação</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Vínculo / Nível</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Recurso Individual</th>
                <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {users.map(u => {
                const company = companies.find(c => c.id === u.companyId);
                return (
                  <tr key={u.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center text-blue-500 font-black">
                            {u.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-black text-white uppercase text-sm">{u.name}</p>
                            <p className="text-[10px] text-neutral-600 font-medium">{u.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`w-fit text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                          u.role?.toLowerCase() === 'super' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          u.role?.toLowerCase() === 'admin' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' : 
                          u.role?.toLowerCase() === 'gestor' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' :
                          u.role?.toLowerCase() === 'vendedor' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {u.role}
                        </span>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">
                             📍 {u.region || 'Brasil'}
                           </p>
                           {u.isAtivo && (
                             <span className="text-[8px] bg-blue-500 text-white px-1.5 py-px rounded font-black">ATIVO</span>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-neutral-400 text-sm">
                        <p className="text-white text-xs">{u.document || '---'}</p>
                        <p className="text-[10px] text-neutral-600">R$ {(u.balance || 0).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white hover:border-neutral-700 transition-all">
                          <Settings2 size={16} />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-neutral-700 font-black uppercase tracking-widest text-[10px] italic">
                    Nenhum colaborador registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md rounded-[40px] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
               <div className="p-2 bg-blue-600 rounded-xl"><Plus size={20} /></div>
               {activeTab === 'companies' ? 'Nova Empresa' : 'Novo Usuário'}
            </h3>
            
            {activeTab === 'companies' ? (
              <form onSubmit={handleAddCompany} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Nome Fantasia / Parceiro</label>
                  <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} placeholder="Ex: GSA Tecnologia" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">CNPJ</label>
                  <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={companyForm.cnpj} onChange={e => setCompanyForm({...companyForm, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Telefone</label>
                  <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} placeholder="5511..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Saldo Inicial (R$)</label>
                  <input type="number" step="0.01" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all" value={companyForm.balance} onChange={e => setCompanyForm({...companyForm, balance: parseFloat(e.target.value)})} />
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-blue-600/10 active:scale-95 transition-all">
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Nome Completo</label>
                    <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">E-mail</label>
                    <input required type="email" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Senha</label>
                    <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Nível / Role</label>
                    <select className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 appearance-none uppercase text-[10px]" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>
                      {currentUser.role?.toLowerCase() === 'admin' || currentUser.role?.toLowerCase() === 'super' ? (
                        <>
                          <option value="admin">ADMINISTRADOR</option>
                          <option value="gestor">GESTOR</option>
                          <option value="vendedor">VENDEDOR</option>
                          <option value="cliente">CLIENTE</option>
                        </>
                      ) : currentUser.role?.toLowerCase() === 'gestor' ? (
                        <>
                          <option value="vendedor">VENDEDOR</option>
                          <option value="cliente">CLIENTE</option>
                        </>
                      ) : (
                        <option value="cliente">CLIENTE</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Documento (CPF/CNPJ)</label>
                    <input className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.document} onChange={e => setUserForm({...userForm, document: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">WhatsApp</label>
                    <input className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Região/Estado</label>
                    <input className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.region} onChange={e => setUserForm({...userForm, region: e.target.value})} placeholder="Ex: SP, MG..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Saldo Inicial (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={userForm.balance} onChange={e => setUserForm({...userForm, balance: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-neutral-800">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Cliente Ativo?</p>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase">Habilita o painel de acompanhamento</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUserForm({...userForm, isAtivo: !userForm.isAtivo})}
                    className={`w-12 h-6 rounded-full relative transition-all ${userForm.isAtivo ? 'bg-blue-600' : 'bg-neutral-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${userForm.isAtivo ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">
                    {isLoading ? 'Salvando...' : 'Salvar Usuário'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
