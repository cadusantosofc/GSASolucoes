
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ICONS, API_URL } from '../constants';
import { User as UserType } from '../types';
import { X, CreditCard, Users, User, LogOut, Info, Settings, ChevronDown, Building, FileText } from 'lucide-react';
import { Company } from '../types';

interface SidebarProps {
  user: UserType;
  balance: number;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user: initialUser, balance: initialBalance, isOpen, onClose, onLogout }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [balance, setBalance] = useState(initialBalance);
  const [companies, setCompanies] = useState<Company[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const companyMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const systemVersion = "v3.1.0-Pro-Corporate";

  // Buscar dados atualizados do usuário a cada 10 segundos
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('gsa_token');
        const impId = localStorage.getItem('gsa_impersonate_id');
        if (!token) return;

        const headers: any = { 'Authorization': `Bearer ${token}` };
        if (impId) headers['X-Impersonate-Company-Id'] = impId;

        const response = await fetch(`${API_URL}/users/me`, { headers });

        if (!response.ok) return;

        const data = await response.json();
        setUser(data);
        
        // Calcular saldo (empresa ou individual)
        const newBalance = data.companyId && data.company 
          ? data.company.balance 
          : data.balance;
        setBalance(newBalance);

        // Atualizar localStorage também
        localStorage.setItem('gsa_current_user', JSON.stringify(data));
      } catch (err) {
        console.error('Erro ao atualizar dados do usuário:', err);
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Buscar todas as empresas se for SUPER
  useEffect(() => {
    if (user.role?.toUpperCase() === 'SUPER') {
      const fetchCompanies = async () => {
        try {
          const token = localStorage.getItem('gsa_token');
          const response = await fetch(`${API_URL}/users/companies`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            setCompanies(await response.json());
          }
        } catch (err) {
          console.error('Erro ao buscar empresas:', err);
        }
      };
      fetchCompanies();
    }
  }, [user.role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (companyMenuRef.current && !companyMenuRef.current.contains(event.target as Node)) {
        setIsCompanyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = (companyId: string | null) => {
    if (companyId) {
      localStorage.setItem('gsa_impersonate_id', companyId);
    } else {
      localStorage.removeItem('gsa_impersonate_id');
    }
    setIsCompanyMenuOpen(false);
    window.location.reload(); // Recarrega para aplicar o contexto global
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: ICONS.LayoutDashboard },
    { name: 'Consultas', path: '/consultations', icon: ICONS.Search },
    { name: 'Processos', path: '/processes', icon: <FileText className="w-5 h-5" /> },
    { name: 'Histórico', path: '/history', icon: ICONS.History },
    { name: 'Recarregar', path: '/recharge', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const isSuper = user.role?.toLowerCase() === 'super';
  const isAdmin = user.role?.toLowerCase() === 'admin';
  const isGestor = user.role?.toLowerCase() === 'gestor';
  const isVendedor = user.role?.toLowerCase() === 'vendedor';

  const systemManagementItems = [
    { name: 'Módulos', path: '/admin/modules', icon: ICONS.Settings },
    { name: 'Provedores/Bases', path: '/admin/bases', icon: ICONS.Database },
  ];

  return (
    <aside className={`
      fixed lg:sticky lg:top-0
      left-0 top-0
      h-full lg:h-screen
      w-64 shrink-0
      bg-[#080808] border-r border-neutral-900
      flex flex-col
      z-50 transition-transform duration-300
      lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-8 flex flex-col h-full overflow-hidden">
        {/* Header com Logo e Seleção de Empresa (para SUPER) */}
        <div className="mb-10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-900/20">G</div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 group cursor-pointer" onClick={() => isSuper && setIsCompanyMenuOpen(!isCompanyMenuOpen)}>
                  <h1 className="text-sm font-black text-white uppercase tracking-tighter">GSA Soluções</h1>
                  {isSuper && (
                    <div ref={companyMenuRef} className="relative">
                      <ChevronDown size={14} className={`text-blue-500 transition-transform ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
                      
                      {isCompanyMenuOpen && (
                        <div className="absolute top-full left-0 w-52 mt-4 bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-[60] max-h-60 overflow-y-auto custom-scrollbar">
                          <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest px-3 py-2 border-b border-neutral-900">Inspecionar Empresa</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSelectCompany(null); }}
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-900 text-[9px] font-bold text-neutral-400 hover:text-white transition-all uppercase"
                          >
                            Visão Global (Padrão)
                          </button>
                          {companies.map(c => (
                            <button 
                              key={c.id}
                              onClick={(e) => { e.stopPropagation(); handleSelectCompany(c.id); }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-900 text-[9px] font-bold transition-all uppercase flex items-center gap-2 ${user.companyId === c.id ? 'text-blue-500 bg-blue-500/5' : 'text-neutral-400'}`}
                            >
                              <Building className="w-3 h-3" />
                              <span className="truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {user.isImpersonating && (
                   <div className="flex items-center gap-1 bg-blue-600/10 border border-blue-500/20 rounded-md px-1.5 py-0.5 mt-0.5 w-fit">
                     <span className="text-[7px] font-black text-blue-500 uppercase animate-pulse">MODO INSPEÇÃO</span>
                   </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-neutral-500"><X size={20} /></button>
          </div>

          <div className="bg-neutral-900/40 rounded-3xl p-5 border border-neutral-800 shadow-inner">
            <p className="text-neutral-600 text-[9px] uppercase font-black tracking-widest mb-1">
              SALDO {user.companyId ? (user.isImpersonating ? 'EMPRESA (ALVO)' : 'EMPRESA') : 'INDIVAL'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-blue-500 font-bold">R$</span>
              <p className="text-2xl font-black text-white">{(balance || 0).toFixed(2)}</p>
            </div>
            {user.isImpersonating && (
              <p className="text-[8px] text-neutral-500 font-bold uppercase mt-1 truncate">🏢 {user.company?.name}</p>
            )}
          </div>
        </div>

        {/* Menu principal com Scroll */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-neutral-700 text-[9px] uppercase font-black tracking-widest px-4 mb-3">Navegação</p>
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => { if(window.innerWidth < 1024) onClose(); }} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-neutral-500 hover:bg-neutral-900/50'}`}>
              <div className="w-5 h-5">{item.icon}</div>
              <span className="font-bold text-xs uppercase tracking-wider">{item.name}</span>
            </NavLink>
          ))}

          {/* Administração da Empresa (ADMIN, SUPER, GESTOR, VENDEDOR) */}
          {['admin', 'super', 'gestor', 'vendedor'].includes(user.role?.toLowerCase()) && (
            <div className="pt-6">
              <p className="text-neutral-700 text-[9px] uppercase font-black tracking-widest px-4 mb-3">Administração</p>
              <NavLink to="/admin/team" onClick={() => { if(window.innerWidth < 1024) onClose(); }} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-neutral-500 hover:bg-neutral-900/40'}`}>
                <div className="w-5 h-5"><Users size={20} /></div>
                <span className="font-bold text-[10px] uppercase tracking-widest">Gerenciar Equipe</span>
              </NavLink>
            </div>
          )}

          {/* Gestão do Sistema (SOMENTE SUPER) */}
          {isSuper && (
            <div className="pt-6">
              <p className="text-neutral-700 text-[9px] uppercase font-black tracking-widest px-4 mb-3">Gestão do Sistema</p>
              <NavLink to="/admin/saas" onClick={() => { if(window.innerWidth < 1024) onClose(); }} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-neutral-500 hover:bg-neutral-900/40'}`}>
                <div className="w-5 h-5"><Settings size={20} /></div>
                <span className="font-bold text-[10px] uppercase tracking-widest">Parceiros & Usuários</span>
              </NavLink>
              {systemManagementItems.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={() => { if(window.innerWidth < 1024) onClose(); }} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-neutral-500 hover:bg-neutral-900/40'}`}>
                  <div className="w-5 h-5">{item.icon}</div>
                  <span className="font-bold text-[10px] uppercase tracking-widest">{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Perfil Fixo no Rodapé */}
        <div className="pt-6 border-t border-neutral-900 mt-auto shrink-0 relative" ref={menuRef}>
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-4 mb-2 p-2 hover:bg-neutral-900/50 rounded-2xl cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500 overflow-hidden shrink-0 group-hover:border-blue-500/50 transition-all">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-black text-white uppercase truncate tracking-tight">{user.name}</p>
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>

          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-[#0a0a0a] border border-neutral-800 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-2 animate-in slide-in-from-bottom-2 duration-200">
              <button 
                onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); if(window.innerWidth < 1024) onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 text-[10px] font-black uppercase transition-all"
              >
                <Settings className="w-4 h-4" /> Perfil
              </button>
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 text-[10px] font-black uppercase border-y border-neutral-900/50 my-1">
                <Info className="w-4 h-4" /> Versão: {systemVersion}
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase transition-all"
              >
                <LogOut className="w-4 h-4" /> Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
