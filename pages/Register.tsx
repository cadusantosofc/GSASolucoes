
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Company } from '../types';
import { User as UserIcon, Building2, Smartphone, Mail, Lock, CheckCircle2, FileText } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: User) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, setUsers, setCompanies }) => {
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '55',
    document: '', // CPF ou CNPJ
    companyName: ''
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('55')) {
      value = '55' + value;
    }
    setFormData({ ...formData, phone: value });
  };

  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://api.gsacreditus.com.br/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          document: formData.document,
          companyName: accountType === 'company' ? formData.companyName : undefined,
          cnpj: accountType === 'company' ? formData.document : undefined,
          role: 'USER', // Default role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao realizar cadastro.');
        return;
      }

      // Após registrar, fazemos o login automático ou redirecionamos
      // Aqui vamos apenas setar o usuário e prosseguir
      onRegister(data);
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a] border border-neutral-800 rounded-[40px] overflow-hidden shadow-2xl">
         
         <div className="bg-neutral-900/50 p-10 md:p-16 flex flex-col justify-between space-y-12">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">G</div>
               <span className="text-white font-black uppercase tracking-tighter text-sm">GSA Soluções</span>
            </div>

            <div className="space-y-6">
               <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-[0.9]">Crie sua<br/>Conta de<br/>Acesso</h2>
               <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                     <CheckCircle2 className="text-blue-500 mt-1" size={20} />
                     <p className="text-neutral-400 text-sm font-medium">Bônus de R$ 5,00 para novos usuários testarem a plataforma.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                     <CheckCircle2 className="text-blue-500 mt-1" size={20} />
                     <p className="text-neutral-400 text-sm font-medium">Cadastro obrigatório com CPF para segurança total.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                     <CheckCircle2 className="text-blue-500 mt-1" size={20} />
                     <p className="text-neutral-400 text-sm font-medium">WhatsApp formatado (55) para notificações futuras.</p>
                  </div>
               </div>
            </div>

            <div className="text-neutral-600 text-[10px] font-black uppercase tracking-[3px]">© 2025 GSA Soluções Digitais</div>
         </div>

         <div className="p-10 md:p-16 space-y-8">
            <div className="flex p-1 bg-neutral-900 border border-neutral-800 rounded-2xl">
               <button 
                  onClick={() => setAccountType('individual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'individual' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}
               >
                  <UserIcon size={14} /> Individual (CPF)
               </button>
               <button 
                  onClick={() => setAccountType('company')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accountType === 'company' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}
               >
                  <Building2 size={14} /> Empresa (CNPJ)
               </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
               {error && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black text-center uppercase tracking-widest">
                   {error}
                 </div>
               )}
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Nome Completo {accountType === 'company' && 'ou Razão Social'}</label>
                  <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>

               {accountType === 'company' && (
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Nome Fantasia da Empresa</label>
                    <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">{accountType === 'individual' ? 'CPF (Obrigatório)' : 'CNPJ'}</label>
                     <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 w-4 h-4" />
                        <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-blue-500" placeholder={accountType === 'individual' ? "000.000.000-00" : "00.000.000/0001-00"} value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">WhatsApp (55...)</label>
                     <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 w-4 h-4" />
                        <input required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-blue-500" placeholder="55119..." value={formData.phone} onChange={handlePhoneChange} />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">E-mail</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 w-4 h-4" />
                     <input type="email" required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
               </div>

               <div className="space-y-2 pb-4">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Defina sua Senha</label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 w-4 h-4" />
                     <input type="password" required className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
               </div>

               <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]">
                  CRIAR CONTA AGORA
               </button>

               <p className="text-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest pt-4">
                  Já possui conta? <Link to="/login" className="text-blue-500">Faça login</Link>
               </p>
            </form>
         </div>
      </div>
    </div>
  );
};
