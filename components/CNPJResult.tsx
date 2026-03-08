import React from 'react';
import { Building2, Users, FileText, DollarSign, MapPin, Calendar, Shield, TrendingUp, Briefcase } from 'lucide-react';

interface CNPJResultProps {
  data: any;
}

export const CNPJResult: React.FC<CNPJResultProps> = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não informado';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Card Principal - Dados da Empresa */}
      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
              {data.razao_social || 'Não informado'}
            </h3>
            {data.nome_fantasia && (
              <p className="text-blue-400 font-bold text-sm uppercase tracking-wide">
                {data.nome_fantasia}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">CNPJ</p>
            <p className="text-white font-mono font-bold text-lg">{formatCNPJ(data.cnpj)}</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Situação</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              data.situacao_cadastral === 2 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {data.descricao_situacao_cadastral}
            </span>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Capital Social</p>
            <p className="text-emerald-400 font-black text-lg">{formatCurrency(data.capital_social)}</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Porte</p>
            <p className="text-white font-bold">{data.porte}</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Natureza Jurídica</p>
            <p className="text-white font-bold text-sm">{data.natureza_juridica}</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4 border border-neutral-800">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Início Atividade</p>
            <p className="text-white font-bold">{formatDate(data.data_inicio_atividade)}</p>
          </div>
        </div>
      </div>

      {/* Card de Endereço */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <MapPin className="w-6 h-6 text-purple-400" />
          </div>
          <h4 className="text-xl font-black text-white uppercase tracking-tight">Endereço</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Logradouro</p>
            <p className="text-white font-bold">
              {data.descricao_tipo_de_logradouro} {data.logradouro}, {data.numero}
            </p>
            {data.complemento && <p className="text-neutral-400 text-sm">{data.complemento}</p>}
          </div>
          
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Bairro</p>
            <p className="text-white font-bold">{data.bairro}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Município/UF</p>
            <p className="text-white font-bold">{data.municipio} - {data.uf}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">CEP</p>
            <p className="text-white font-mono font-bold">{data.cep?.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>
          </div>
        </div>

        {(data.ddd_telefone_1 || data.email) && (
          <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.ddd_telefone_1 && (
              <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Telefone</p>
                <p className="text-white font-mono font-bold">{data.ddd_telefone_1}</p>
              </div>
            )}
            {data.email && (
              <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Email</p>
                <p className="text-blue-400 font-bold">{data.email}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card de Atividades (CNAE) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-600/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-xl font-black text-white uppercase tracking-tight">Atividades Econômicas</h4>
        </div>

        <div className="space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
              CNAE Principal - {data.cnae_fiscal}
            </p>
            <p className="text-white font-bold">{data.cnae_fiscal_descricao}</p>
          </div>

          {data.cnaes_secundarios && data.cnaes_secundarios.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">
                CNAEs Secundários ({data.cnaes_secundarios.length})
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {data.cnaes_secundarios.map((cnae: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 hover:border-blue-500/30 transition-colors">
                    <p className="text-blue-400 font-mono text-xs font-bold mb-1">{cnae.codigo}</p>
                    <p className="text-neutral-300 text-sm font-medium">{cnae.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card de Quadro Societário (QSA) */}
      {data.qsa && data.qsa.length > 0 && (
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-600/20 rounded-lg">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">
              Quadro Societário ({data.qsa.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.qsa.map((socio: any, idx: number) => (
              <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-amber-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-white font-black uppercase text-sm mb-1">{socio.nome_socio}</p>
                    <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[10px] font-black uppercase tracking-widest">
                      {socio.qualificacao_socio}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">CPF:</span>
                    <span className="text-neutral-300 font-mono">{socio.cnpj_cpf_do_socio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">Faixa Etária:</span>
                    <span className="text-neutral-300">{socio.faixa_etaria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-bold">Entrada:</span>
                    <span className="text-neutral-300">{formatDate(socio.data_entrada_sociedade)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card de Regime Tributário */}
      {data.regime_tributario && data.regime_tributario.length > 0 && (
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Histórico Tributário</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {data.regime_tributario.map((regime: any, idx: number) => (
              <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-center">
                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  {regime.ano}
                </p>
                <p className="text-white font-bold text-xs">{regime.forma_de_tributacao}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
