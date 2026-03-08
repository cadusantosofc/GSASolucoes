
import React, { useState } from 'react';
import { User } from '../types';
import { Camera, User as UserIcon, Save, Key, Mail, Smartphone } from 'lucide-react';

interface ProfileProps {
  user: User;
  updateProfile: (updated: Partial<User>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, updateProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '55',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('55')) value = '55' + value;
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      profileImage: profileImage
    };
    if (formData.password) updates.password = formData.password;
    updateProfile(updates);
    setSuccess(true);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="flex items-center gap-4 mb-2">
         <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl">
            <UserIcon size={24} />
         </div>
         <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">MEU PERFIL</h2>
            <p className="text-neutral-500 text-sm">Gerencie suas informações pessoais e segurança.</p>
         </div>
      </div>

      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 text-xs font-black text-center uppercase tracking-widest">Perfil atualizado com sucesso!</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-black text-center uppercase tracking-widest">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
           <div className="relative w-32 h-32 mx-auto">
              <div className="w-full h-full rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-neutral-600 overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={48} />}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg active:scale-90 transition-all">
                 <Camera size={16} />
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
           </div>
           <div>
              <p className="text-xl font-black text-white uppercase tracking-tighter">{user.name}</p>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-1">{user.role}</p>
           </div>
           <div className="pt-4 border-t border-neutral-900">
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Documento: <span className="text-white">{user.document}</span></p>
           </div>
        </div>

        <div className="lg:col-span-2 bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 shadow-xl">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Nome Completo</label>
                    <input required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">WhatsApp (55...)</label>
                    <div className="relative">
                       <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 w-4 h-4" />
                       <input required className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-blue-500" value={formData.phone} onChange={handlePhoneChange} />
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">E-mail</label>
                 <input required type="email" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="pt-6 border-t border-neutral-900">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Key size={14} className="text-blue-500" /> Alterar Senha</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="password" placeholder="Nova Senha" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <input type="password" placeholder="Confirmar" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-blue-500" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                 </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg"><Save size={18} className="inline mr-2" /> Salvar Alterações</button>
           </form>
        </div>
      </div>
    </div>
  );
};
