
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'cookies' | 'responsibility';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const content = {
    terms: {
      title: "Termos de Uso",
      text: `Ao acessar e utilizar o sistema GSA Créditus, você concorda em cumprir estes termos. O sistema é destinado exclusivamente ao uso profissional por pessoas físicas devidamente cadastradas e empresas parceiras.
      
      1. LICENÇA DE USO: Concedemos uma licença limitada e intransferível para acessar nossas ferramentas de busca.
      2. RESTRIÇÕES: É proibida a revenda ou sublicenciamento do acesso, bem como o uso de robôs ou scripts para consultas em massa sem autorização prévia.
      3. CRÉDITOS: Os créditos adquiridos são de uso exclusivo na plataforma e não possuem valor de resgate em moeda corrente após 7 dias da compra.
      4. SIGILO: O usuário é responsável por manter o sigilo de sua senha e dados de acesso.`
    },
    privacy: {
      title: "Política de Privacidade",
      text: `A GSA Créditus preza pela proteção dos seus dados. Coletamos informações como CPF/CNPJ, E-mail e Telefone exclusivamente para fins de autenticação, faturamento e segurança da conta.
      
      1. COLETA: Seus dados são armazenados em servidores seguros com criptografia de ponta a ponta.
      2. COMPARTILHAMENTO: Nunca vendemos seus dados para terceiros. Informações de consulta são mantidas em sigilo absoluto.
      3. SEGURANÇA: Implementamos protocolos SSL e logs de auditoria para garantir que apenas você acesse seu histórico.`
    },
    cookies: {
      title: "Política de Cookies",
      text: `Utilizamos cookies para melhorar sua experiência de navegação e manter sua sessão ativa.
      
      1. COOKIES ESSENCIAIS: Necessários para o funcionamento do login e das preferências de segurança.
      2. COOKIES DE PERFORMANCE: Ajudam-nos a entender como os usuários interagem com a plataforma para correções de bugs e otimização de velocidade.
      3. VOCÊ PODE DESATIVAR: Nas configurações do seu navegador, mas isso pode impedir o login no sistema.`
    },
    responsibility: {
      title: "Termo de Responsabilidade",
      text: `O sistema GSA Créditus atua como um agregador de dados de diversas fontes e APIs.
      
      1. VERACIDADE: Não nos responsabilizamos pela veracidade das informações retornadas pelas APIs de terceiros, atuando apenas como intermediário técnico.
      2. USO INDEVIDO: O usuário assume total responsabilidade civil e criminal pelo uso dos dados obtidos na plataforma, devendo respeitar a LGPD e demais legislações vigentes.
      3. DISPONIBILIDADE: Reservamo-nos o direito de suspender provedores para manutenção ou por instabilidade do fornecedor original sem aviso prévio.`
    }
  };

  const current = content[type];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans">
      <nav className="fixed top-0 w-full z-[100] bg-black/50 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
            <ChevronLeft size={16} /> Voltar ao Início
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">G</div>
            <span className="font-black text-sm uppercase tracking-tighter">GSA Créditus</span>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4">
             <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <ShieldCheck size={32} />
             </div>
             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{current.title}</h1>
             <p className="text-neutral-500 text-xs font-black uppercase tracking-widest">Última atualização: Janeiro de 2025</p>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[32px] p-8 md:p-12 shadow-2xl">
             <div className="prose prose-invert max-w-none">
                {current.text.split('\n').map((line, i) => (
                  <p key={i} className="text-neutral-400 leading-relaxed font-medium mb-6">
                    {line.trim()}
                  </p>
                ))}
             </div>
          </div>

          <div className="flex justify-center pt-10">
             <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                Concordar e Criar Conta
             </Link>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-neutral-900 text-center text-neutral-600 text-[10px] font-black uppercase tracking-[4px]">
        GSA Créditus Digitais • Segurança e Transparência
      </footer>
    </div>
  );
};
