// Versão temporária para evitar erro de build enquanto jspdf não é instalado
interface PDFExportOptions {
  data: any;
  documentNumber: string;
  baseName: string;
  userName?: string;
  companyName?: string;
}

export const generatePDF = async ({ data, documentNumber, baseName, userName, companyName }: PDFExportOptions) => {
  const message = `⚠️ BIBLIOTECA FALTANDO\n\nPara gerar o PDF, você precisa instalar a biblioteca jspdf.\n\nExecute no seu terminal:\npnpm add jspdf\n\nApós instalar, me avise para eu ativar o código completo!`;
  
  alert(message);
  console.log('Dados para PDF:', { documentNumber, baseName, data });
};
