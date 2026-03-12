import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Consultations } from './pages/Consultations';
import { AdminModules } from './pages/AdminModules';
import { AdminBases } from './pages/AdminBases';
import { AdminSaaS } from './pages/AdminSaaS';
import { Recharge } from './pages/Recharge';
import { HistoryPage } from './pages/HistoryPage';
import { ModuleDetail } from './pages/ModuleDetail';
import { SharedResult } from './pages/SharedResult';
import { Profile } from './pages/Profile';
import { ProcessManagement } from './pages/ProcessManagement';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LandingPage } from './pages/LandingPage';
import { LegalPage } from './pages/Legal';
import { Module, Base, SearchHistory, User, Company, SharedLink } from './types';
import { Menu } from 'lucide-react';
import { API_URL, ICONS } from './constants'; // Added ICONS and API_URL import

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('gsa_auth') === 'true');
  
  const [modules, setModules] = useState<Module[]>(() => JSON.parse(localStorage.getItem('gsa_modules') || '[]'));
  const [bases, setBases] = useState<Base[]>(() => JSON.parse(localStorage.getItem('gsa_bases') || '[]'));
  const [history, setHistory] = useState<SearchHistory[]>(() => JSON.parse(localStorage.getItem('gsa_history') || '[]'));
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>(() => JSON.parse(localStorage.getItem('gsa_shared') || '[]'));
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gsa_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('gsa_modules', JSON.stringify(modules));
    localStorage.setItem('gsa_bases', JSON.stringify(bases));
    localStorage.setItem('gsa_history', JSON.stringify(history));
    localStorage.setItem('gsa_companies', JSON.stringify(companies));
    localStorage.setItem('gsa_users', JSON.stringify(users));
    localStorage.setItem('gsa_shared', JSON.stringify(sharedLinks));
    localStorage.setItem('gsa_current_user', JSON.stringify(currentUser));
    localStorage.setItem('gsa_auth', String(isAuthenticated));
  }, [modules, bases, history, companies, users, sharedLinks, currentUser, isAuthenticated]);

  // Carregar dados iniciais da API ao autenticar
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        const token = localStorage.getItem('gsa_token');
        const impId = localStorage.getItem('gsa_impersonate_id');
        if (!token) return;
        
        try {
          const headers: any = { Authorization: `Bearer ${token}` };
          if (impId) headers['X-Impersonate-Company-Id'] = impId;

          // Paralelizar requisições para performance
          const [modsRes, basesRes, userRes] = await Promise.all([
             fetch(`${API_URL}/modules`, { headers }),
             fetch(`${API_URL}/bases`, { headers }),
             // Usar /api/users/me conforme userRoutes
             fetch(`${API_URL}/users/me`, { headers })
          ]);

          if (modsRes.ok) setModules(await modsRes.json());
          if (basesRes.ok) setBases(await basesRes.json());
          
          // Atualizar usuário atual com dados frescos (saldo, etc)
          if (userRes.ok) {
             const userData = await userRes.json();
             setCurrentUser(userData);
          }
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error);
        }
      };
      
      fetchData();
    }
  }, [isAuthenticated]);

  const getUserBalance = (user: User) => {
    if (user.companyId) {
      const company = companies.find(c => c.id === user.companyId);
      return company ? company.balance : 0;
    }
    return user.balance;
  };

  const updateSaaSSaldo = (amount: number, userId: string) => {
    if (!currentUser) return;
    const user = userId === currentUser.id ? currentUser : users.find(u => u.id === userId);
    if (!user) return;

    if (user.companyId) {
      setCompanies(prev => prev.map(c => c.id === user.companyId ? { ...c, balance: Number(((c.balance || 0) + amount).toFixed(2)) } : c));
    } else {
      if (userId === currentUser.id) {
        setCurrentUser(prev => prev ? ({ ...prev, balance: Number(((prev.balance || 0) + amount).toFixed(2)) }) : null);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: Number(((u.balance || 0) + amount).toFixed(2)) } : u));
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gsa_auth');
    localStorage.removeItem('gsa_token');
    localStorage.removeItem('gsa_current_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Páginas Jurídicas */}
        <Route path="/termos-de-uso" element={<LegalPage type="terms" />} />
        <Route path="/privacidade" element={<LegalPage type="privacy" />} />
        <Route path="/cookies" element={<LegalPage type="cookies" />} />
        <Route path="/responsabilidade" element={<LegalPage type="responsibility" />} />

        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} users={users} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register onRegister={handleLogin} setUsers={setUsers} setCompanies={setCompanies} /> : <Navigate to="/dashboard" />} />
        <Route path="/share/:shareId" element={<SharedResult sharedLinks={sharedLinks} history={history} />} />
        
        <Route path="/*" element={
          isAuthenticated && currentUser ? (
            <div className="flex min-h-screen bg-[#050505] text-neutral-200">
              {/* Overlay mobile */}
              {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
              )}

              {/* Sidebar — no desktop ocupa espaço no flex, no mobile é fixed overlay */}
              <Sidebar 
                user={currentUser} 
                balance={getUserBalance(currentUser)}
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
              />

              {/* Conteúdo principal — flex-1 pega o espaço que sobra após o sidebar */}
              <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Header mobile */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">G</div>
                    <span className="font-black tracking-tighter text-white uppercase text-sm">GSA Créditus</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-neutral-400 hover:text-white"><Menu /></button>
                </header>

                {/* Área das páginas */}
                <main className="flex-1 p-4 md:p-8">
                  <div className="max-w-[1600px] mx-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard user={currentUser} balance={getUserBalance(currentUser)} modules={modules} history={history} bases={bases} />} />
                      <Route path="/consultations" element={<Consultations modules={modules} bases={bases} />} />
                      <Route path="/consultations/:slug" element={
                        <ModuleDetail 
                          modules={modules} 
                          bases={bases} 
                          user={currentUser} 
                          balance={getUserBalance(currentUser)}
                          updateBalance={(amt) => updateSaaSSaldo(amt, currentUser.id)}
                          addHistory={(item) => {
                            const company = currentUser.companyId ? companies.find(c => c.id === currentUser.companyId) : null;
                            setHistory(prev => [{ ...item, companyName: company?.name }, ...prev]);
                          }}
                        />
                      } />
                      <Route path="/history" element={<HistoryPage history={history} sharedLinks={sharedLinks} setSharedLinks={setSharedLinks} currentUser={currentUser} />} />
                      <Route path="/processes" element={<ProcessManagement />} />
                      <Route path="/recharge" element={<Recharge updateSaldo={updateSaaSSaldo} currentUser={currentUser} />} />
                      <Route path="/profile" element={<Profile user={currentUser} updateProfile={(upd) => {
                        setCurrentUser(prev => prev ? ({...prev, ...upd}) : null);
                        setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, ...upd} : u));
                      }} />} />
                      <Route path="/admin/saas" element={<AdminSaaS users={users} setUsers={setUsers} companies={companies} setCompanies={setCompanies} isGlobal={true} />} />
                      <Route path="/admin/team" element={<AdminSaaS users={users} setUsers={setUsers} companies={companies} setCompanies={setCompanies} isGlobal={false} />} />
                      <Route path="/admin/modules" element={<AdminModules modules={modules} setModules={setModules} />} />
                      <Route path="/admin/bases" element={<AdminBases bases={bases} setBases={setBases} modules={modules} />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
};

export default App;
