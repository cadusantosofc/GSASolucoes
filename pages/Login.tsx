
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Smartphone, FileText, Search } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Recovery State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Search, 2: Code, 3: Reset
  const [searchQuery, setSearchQuery] = useState(''); // CPF, Email ou Phone
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao realizar login.');
        return;
      }

      // Salva o token e dados básicos de forma segura
      localStorage.setItem('gsa_token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  const startRecovery = () => {
    setRecoveryError('');
    // Busca por CPF, Email ou Telefone
    const user = users.find(u => 
      u.email === searchQuery || 
      u.document === searchQuery || 
      u.phone === searchQuery ||
      u.phone === '55' + searchQuery.replace(/\D/g, '')
    );

    if (user) {
      setFoundUser(user);
      setRecoveryStep(2);
      // Simulação SMTP/WhatsApp
      console.log(`Enviando código para ${user.email} e ${user.phone}`);
    } else {
      setRecoveryError('Nenhuma conta encontrada com este dado.');
    }
  };

  const verifyCode = () => {
    // Código fixo simulado
    if (recoveryCodeInput === '123456') {
      setRecoveryStep(3);
    } else {
      setRecoveryError('Código incorreto.');
    }
  };

  const resetPassword = () => {
    if (foundUser && newPassword.length >= 4) {
      foundUser.password = newPassword;
      setIsRecoveryOpen(false);
      setRecoveryStep(1);
      setSearchQuery('');
      setFoundUser(null);
      setError('Senha alterada com sucesso! Faça login.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] animate-in fade-in duration-700">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-black opacity-50"></div>
         <div className="relative z-10 text-white space-y-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
               <span className="text-4xl font-black">G</span>
            </div>
            <div className="space-y-4">
               <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">Explore a<br/>Inteligência<br/>de Dados</h1>
               <p className="text-blue-100/70 max-w-md font-medium text-lg">A plataforma SaaS líder em consultas com recuperação inteligente via CPF, E-mail ou Telefone.</p>
            </div>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Login GSA</h2>
            <p className="text-neutral-500 font-medium tracking-tight">Insira seus dados para acessar o painel administrativo.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-neutral-900 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-bold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="admin@gsa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Senha</label>
                <button 
                  type="button"
                  onClick={() => { setRecoveryStep(1); setIsRecoveryOpen(true); }}
                  className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-12 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              ENTRAR NO PAINEL <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center pt-10">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
              Ainda não é cliente?{' '}
              <Link to="/register" className="text-blue-500 hover:underline">Cadastre-se</Link>
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO INTELIGENTE */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                   <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Recuperar Conta</h3>
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                   {recoveryStep === 1 && "Identifique-se por CPF, E-mail ou Telefone"}
                   {recoveryStep === 2 && "Verificando dados de segurança"}
                   {recoveryStep === 3 && "Defina seu novo acesso"}
                </p>
             </div>

             {recoveryError && (
               <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest text-center rounded-lg border border-red-500/20">
                 {recoveryError}
               </div>
             )}

             {recoveryStep === 1 && (
               <div className="space-y-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-blue-500 w-5 h-5" />
                    <input 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-blue-500"
                        placeholder="CPF, E-mail ou WhatsApp"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <button 
                    onClick={startRecovery}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg"
                 >
                    Buscar Conta
                 </button>
               </div>
             )}

             {recoveryStep === 2 && foundUser && (
               <div className="space-y-6 text-center">
                 <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-neutral-600 uppercase">Enviamos um código para:</p>
                    <p className="text-xs font-bold text-white truncate">{foundUser.email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}</p>
                    <p className="text-xs font-bold text-blue-500">{foundUser.phone.replace(/(.{4})(.*)(.{2})/, "$1*****$3")}</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Digite o código (Simulado: 123456)</label>
                    <input 
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-center font-black text-2xl tracking-[10px] text-white outline-none focus:border-blue-500"
                        placeholder="000000"
                        maxLength={6}
                        value={recoveryCodeInput}
                        onChange={e => setRecoveryCodeInput(e.target.value)}
                    />
                 </div>
                 <button 
                    onClick={verifyCode}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg"
                 >
                    Verificar Código
                 </button>
               </div>
             )}

             {recoveryStep === 3 && (
               <div className="space-y-4">
                 <input 
                    type="password" 
                    placeholder="Nova Senha" 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                 />
                 <button 
                    onClick={resetPassword}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg"
                 >
                    Confirmar Nova Senha
                 </button>
               </div>
             )}

             <button 
               onClick={() => { setIsRecoveryOpen(false); setRecoveryStep(1); setFoundUser(null); setRecoveryError(''); }}
               className="w-full mt-6 py-3 text-[10px] font-black text-neutral-600 hover:text-white uppercase tracking-widest transition-colors"
             >
               Cancelar e Voltar
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
