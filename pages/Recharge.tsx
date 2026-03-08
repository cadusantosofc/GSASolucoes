
import React, { useState } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';
import { CreditCard, QrCode, Copy, CheckCircle } from 'lucide-react';

interface RechargeProps {
  updateSaldo: (amount: number, userId: string) => void;
  currentUser: User;
}

export const Recharge: React.FC<RechargeProps> = ({ updateSaldo, currentUser }) => {
  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix'>('pix');
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConfirmRecharge = () => {
    updateSaldo(amount, currentUser.id);
    setSuccess(true);
    setShowCheckout(false);
    setTimeout(() => {
      setSuccess(false);
      setAmount(0);
    }, 3000);
  };

  const handleCopyPix = () => {
    const pixPayload = "00020101021226850014br.gov.bcb.pix0123gsa_solucoes_digital_pix5204000053039865405" + (amount || 0).toFixed(2) + "5802BR5913GSA SOLUCOES6009SAO PAULO62070503***6304E1F2";
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSaaS = !!currentUser.companyId;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pt-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-2xl">
          <CreditCard size={32} />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">RECARREGAR SALDO</h2>
        <p className="text-neutral-500 text-sm">O crédito será adicionado {isSaaS ? 'ao saldo da sua empresa' : 'ao seu saldo individual'}.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-500 text-xs font-black text-center uppercase tracking-widest animate-bounce z-20 relative">
            Pagamento Identificado! Créditos Adicionados.
          </div>
        )}

        <div className="space-y-4">
           <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">1. Escolha a Forma de Pagamento</label>
           <div className="grid grid-cols-1 gap-2">
              <button 
                 onClick={() => setPaymentMethod('pix')}
                 className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${paymentMethod === 'pix' ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
              >
                 <div className="flex items-center gap-4">
                    <QrCode className={paymentMethod === 'pix' ? 'text-blue-500' : ''} />
                    <div className="text-left">
                       <p className="font-black text-sm uppercase tracking-tighter">PIX</p>
                       <p className="text-[9px] font-bold uppercase opacity-60">Aprovação Instantânea</p>
                    </div>
                 </div>
                 {paymentMethod === 'pix' && <CheckCircle size={18} className="text-blue-500" />}
              </button>
           </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">2. Digite o Valor (R$)</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 font-black text-2xl">R$</span>
            <input 
              type="number" 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-16 pr-6 py-6 text-white font-black text-4xl outline-none focus:border-blue-500 transition-all"
              placeholder="0.00"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
             {[10, 50, 100, 500].map(val => (
                <button 
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-black text-neutral-400 hover:text-white hover:border-blue-500/50 transition-all uppercase"
                >
                  +{val}
                </button>
             ))}
          </div>
        </div>

        <button 
          onClick={() => amount > 0 && setShowCheckout(true)}
          disabled={amount <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white py-6 rounded-2xl font-black uppercase tracking-[2px] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95"
        >
          GERAR PAGAMENTO PIX
        </button>
      </div>

      {/* Modal de Checkout PIX */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="text-center space-y-6">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Pagamento PIX</h3>
                   <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Valor a pagar: <span className="text-blue-500">R$ {(amount || 0).toFixed(2)}</span></p>
                </div>

                <div className="bg-white p-6 rounded-3xl w-48 h-48 mx-auto flex items-center justify-center border-4 border-blue-600/20 shadow-inner">
                   {/* Simulação de QR Code */}
                   <QrCode size={140} className="text-black" />
                </div>

                <div className="space-y-3">
                   <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Ou utilize o código Copia e Cola:</p>
                   <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                      <div className="flex-1 px-4 py-3 text-[10px] text-neutral-500 font-mono truncate">
                         00020101021226850014br.gov.bcb.pix0123gsa_solucoes_digital_pix52040000...
                      </div>
                      <button 
                        onClick={handleCopyPix}
                        className="bg-blue-600 px-4 flex items-center justify-center text-white hover:bg-blue-700 transition-all"
                      >
                         {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                   </div>
                </div>

                <div className="pt-6 border-t border-neutral-900 flex flex-col gap-3">
                   <button 
                      onClick={handleConfirmRecharge}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-900/20"
                   >
                      Já realizei o pagamento
                   </button>
                   <button 
                      onClick={() => setShowCheckout(false)}
                      className="w-full py-3 text-[10px] font-black text-neutral-600 uppercase tracking-widest"
                   >
                      Cancelar e Voltar
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
