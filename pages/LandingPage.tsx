
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Zap, 
  BarChart3, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header / Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-black/50 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-900/40">G</div>
            <span className="font-black text-xl uppercase tracking-tighter">GSA Créditus</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            <a href="#" className="text-white">Início</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest px-6 py-3 hover:text-blue-500 transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-95">Começar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500 mb-8 animate-bounce">
            <Zap size={14} /> Sistema Corporativo de Alta Performance
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Consultas <br /> <span className="text-blue-600">Estratégicas</span> em Segundos
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12">
            Plataforma robusta para gestão de dados empresariais, parceiros e faturamento automatizado. Segurança e rapidez para o seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20 transition-all text-sm group">
              Criar Conta <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-neutral-800 text-sm">
              Acessar Painel
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] border border-neutral-800 p-10 rounded-[40px] space-y-6 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Search size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Pesquisa Avançada</h3>
              <p className="text-neutral-500 font-medium">Motores de busca otimizados para retornar dados precisos em milissegundos.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-neutral-800 p-10 rounded-[40px] space-y-6 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-purple-600/10 text-purple-500 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Gestão Corporativa</h3>
              <p className="text-neutral-500 font-medium">Hierarquia de usuários e controle de saldo para todas as suas empresas parceiras.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-neutral-800 p-10 rounded-[40px] space-y-6 hover:border-blue-500/30 transition-all group">
              <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Dados Blindados</h3>
              <p className="text-neutral-500 font-medium">Criptografia de ponta a ponta e auditoria completa de todas as requisições.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-neutral-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Consumo Inteligente</h2>
            <p className="text-neutral-500 font-medium">Recargas instantâneas via PIX. Pague apenas pelo volume que sua empresa necessita.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual */}
            <div className="bg-[#0a0a0a] border border-neutral-800 p-10 rounded-[40px] relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-neutral-900 rounded-full text-blue-500 border border-neutral-800">Uso Individual</span>
                  </div>
                  <div>
                    <h4 className="text-4xl font-black uppercase tracking-tighter">Flexível</h4>
                    <p className="text-neutral-500 text-sm mt-2">Ideal para profissionais autônomos.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      <CheckCircle2 size={16} className="text-blue-500" /> Histórico Completo
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      <CheckCircle2 size={16} className="text-blue-500" /> Acesso a Todos os Módulos
                    </li>
                  </ul>
                  <Link to="/register" className="block w-full text-center bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Criar Perfil</Link>
               </div>
            </div>

            {/* Corporate */}
            <div className="bg-blue-600 p-10 rounded-[40px] relative overflow-hidden shadow-2xl shadow-blue-600/20">
               <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                  <Cpu size={120} />
               </div>
               <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full text-white backdrop-blur-md">Parceria Corporativa</span>
                  </div>
                  <div>
                    <h4 className="text-4xl font-black uppercase tracking-tighter text-white">Empresas</h4>
                    <p className="text-blue-100/70 text-sm mt-2 font-medium">Solução de alta escala para parceiros de negócio.</p>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-white">
                      <CheckCircle2 size={16} /> Saldo Centralizado por CNPJ
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-white">
                      <CheckCircle2 size={16} /> Relatórios de Consumo por Usuário
                    </li>
                  </ul>
                  <Link to="/register" className="block w-full text-center bg-white text-blue-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:shadow-xl active:scale-95">Registrar Empresa</Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-900 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">G</div>
              <span className="font-black uppercase tracking-tighter text-xl text-white">GSA Créditus</span>
            </div>
            <p className="text-neutral-500 max-w-sm font-medium">Desenvolvendo as ferramentas do futuro para o gerenciamento de dados hoje.</p>
            <div className="text-[10px] font-black uppercase tracking-[3px] text-neutral-700">© 2025 GSA Créditus Digitais</div>
          </div>
          <div className="space-y-4">
             <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Navegação</h5>
             <ul className="space-y-2 text-neutral-500 text-xs font-bold uppercase tracking-tighter">
                <li><Link to="/login" className="hover:text-blue-500 transition-colors">Acessar Painel</Link></li>
                <li><Link to="/register" className="hover:text-blue-500 transition-colors">Criar Conta</Link></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Início</a></li>
             </ul>
          </div>
          <div className="space-y-4">
             <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Jurídico</h5>
             <ul className="space-y-2 text-neutral-500 text-xs font-bold uppercase tracking-tighter">
                <li><Link to="/termos-de-uso" className="hover:text-blue-500 transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-blue-500 transition-colors">Política de Privacidade</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-500 transition-colors">Política de Cookies</Link></li>
                <li><Link to="/responsabilidade" className="hover:text-blue-500 transition-colors">Responsabilidade</Link></li>
             </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
