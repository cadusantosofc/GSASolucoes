
interface PrintOptions {
  data: any;
  documentNumber: string;
  baseName: string;
  userName?: string;
  companyName?: string;
}

export const printConsultation = ({ data, documentNumber, baseName, userName, companyName }: PrintOptions) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Permita popups para imprimir!');
    return;
  }

  // Função recursiva para gerar HTML (similar ao DataRenderer mas em string HTML)
  const generateParamsHTML = (obj: any, level = 0): string => {
    const actualData = obj.data || obj;
    let html = '';

    if (!actualData || typeof actualData !== 'object') return '';

    Object.entries(actualData).forEach(([key, value]) => {
      if (['code', 'status'].includes(key)) return;

      const label = key.replace(/_/g, ' ').toUpperCase();

      if (Array.isArray(value) && value.length > 0) {
        html += `
          <div class="section">
            <div class="section-title text-blue">${label} (${value.length})</div>
            <div class="array-container">
              ${value.map((item, idx) => `
                <div class="array-item">
                  <div class="item-label">ITEM ${idx + 1}</div>
                  ${typeof item === 'object' && item !== null ? generateParamsHTML(item, level + 1) : `<div class="value">${item}</div>`}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (typeof value === 'object' && value !== null) {
        html += `
          <div class="section">
            <div class="section-title text-green">${label}</div>
            <div class="nested-container">
              ${generateParamsHTML(value, level + 1)}
            </div>
          </div>
        `;
      } else if (value !== null && value !== undefined && value !== '') {
        html += `
          <div class="row">
            <span class="label">${label}</span>
            <span class="value">${value}</span>
          </div>
        `;
      }
    });

    return html;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Consulta ${documentNumber}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; font-size: 12px; color: #333; -webkit-print-color-adjust: exact; }
        .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 900; color: #000; margin-bottom: 5px; text-transform: uppercase; }
        .subtitle { font-size: 14px; color: #666; font-weight: bold; text-transform: uppercase; }
        .meta { margin-top: 10px; font-size: 10px; color: #999; text-transform: uppercase; }
        
        .row { display: flex; border-bottom: 1px solid #eee; padding: 8px 0; page-break-inside: avoid; }
        .label { width: 35%; font-weight: 900; color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
        .value { flex: 1; font-weight: 600; color: #000; word-break: break-word; }
        
        .section { margin-top: 20px; margin-bottom: 20px; page-break-inside: avoid; }
        .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-bottom: 10px; letter-spacing: 1px; color: white; }
        .text-blue { background-color: #2563eb; }
        .text-green { background-color: #10b981; }
        
        .nested-container { border-left: 2px solid #10b981; padding-left: 15px; margin-left: 5px; }
        
        .array-container { display: flex; flex-direction: column; gap: 10px; }
        .array-item { background: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; page-break-inside: avoid; }
        .item-label { font-size: 9px; font-weight: 900; color: #bbb; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }

        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Relatório de Consulta</div>
        <div class="subtitle">Documento: ${documentNumber} | Base: ${baseName}</div>
        <div class="meta">
          Gerado por: ${userName || 'N/A'} ${companyName ? `(${companyName})` : ''} em ${new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      <div class="content">
        ${generateParamsHTML(data)}
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
