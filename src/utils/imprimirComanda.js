export function imprimirComanda(pedido, nomeLoja = 'Pede Rango Delivery') {
  if (!pedido) return;

  const janela = window.open('', '_blank', 'width=380,height=600');
  if (!janela) return;

  const itens = pedido.itens || pedido.items || [];
  const itensHtml = itens.map(item => `
    <tr>
      <td style="padding: 4px 0; font-weight: bold;">${item.quantidade || item.quantity || 1}x ${item.nome || item.name}</td>
      <td style="padding: 4px 0; text-align: right; white-space: nowrap;">R$ ${Number(item.subtotal || ((item.quantidade || item.quantity || 1) * (item.precoUnitario || item.unitPrice || 0))).toFixed(2)}</td>
    </tr>
    ${item.observacao || item.observation ? `<tr><td colspan="2" style="font-size: 11px; color: #444; padding-left: 8px; padding-bottom: 4px;">• Obs: <i>"${item.observacao || item.observation}"</i></td></tr>` : ''}
  `).join('');

  const taxaEntrega = Number(pedido.taxaEntrega || 0);
  const valorTotal = Number(pedido.valorTotal || pedido.totalAmount || 0);
  const subtotalItens = valorTotal - taxaEntrega;
  const codigo = pedido.codigo || pedido.id;
  const clienteNome = pedido.nomeCliente || pedido.customerName || 'Cliente';
  const telefone = pedido.telefoneCliente || pedido.clienteTelefone || pedido.telefone || 'Não informado';
  const endereco = pedido.enderecoEntrega || pedido.deliveryAddress || 'Retirada no Balcão';
  const data = pedido.criadoEm ? new Date(pedido.criadoEm).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
  const entregadorNome = pedido.nomeEntregador || pedido.entregadorNome;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Comanda #${codigo} - ${nomeLoja}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 12px;
            line-height: 1.35;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: 16px; font-weight: 800; }
          .subtitle { font-size: 11px; text-transform: uppercase; margin-top: 2px; }
          .line { border-bottom: 1px dashed #000; margin: 8px 0; }
          .double-line { border-bottom: 2px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { padding: 6mm; }
          }
        </style>
      </head>
      <body>
        <div class="center title">${nomeLoja}</div>
        <div class="center subtitle">*** CONTROLE DE COZINHA & DELIVERY ***</div>
        <div class="double-line"></div>

        <div style="font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 6px;">
          PEDIDO #${codigo}
        </div>
        <div><strong>DATA/HORA:</strong> ${data}</div>
        <div><strong>STATUS:</strong> ${pedido.status}</div>

        <div class="line"></div>
        <div><strong>CLIENTE:</strong> ${clienteNome}</div>
        <div><strong>TELEFONE:</strong> ${telefone}</div>
        <div><strong>ENDEREÇO:</strong> ${endereco}</div>
        ${entregadorNome ? `<div><strong>ENTREGADOR:</strong> ${entregadorNome}</div>` : ''}

        <div class="double-line"></div>
        <div class="bold" style="margin-bottom: 4px; font-size: 13px;">ITENS DO PEDIDO:</div>
        <table>
          <tbody>
            ${itensHtml}
          </tbody>
        </table>

        <div class="line"></div>
        <table>
          <tr>
            <td>Subtotal Itens:</td>
            <td style="text-align: right;">R$ ${subtotalItens.toFixed(2)}</td>
          </tr>
          ${taxaEntrega > 0 ? `
          <tr>
            <td>Taxa de Entrega:</td>
            <td style="text-align: right;">+ R$ ${taxaEntrega.toFixed(2)}</td>
          </tr>` : ''}
          <tr style="font-weight: bold; font-size: 14px;">
            <td style="padding-top: 6px;">TOTAL A COBRAR:</td>
            <td style="padding-top: 6px; text-align: right;">R$ ${valorTotal.toFixed(2)}</td>
          </tr>
        </table>

        <div class="line"></div>
        <div><strong>PAGAMENTO:</strong> ${pedido.formaPagamento}</div>
        ${pedido.formaPagamento === 'DINHEIRO' && pedido.trocoPara ? `
          <div style="font-weight: bold; margin-top: 2px;">
            TROCO PARA: R$ ${Number(pedido.trocoPara).toFixed(2)} (LEVAR: R$ ${(Number(pedido.trocoPara) - valorTotal).toFixed(2)})
          </div>
        ` : ''}

        <div class="double-line"></div>
        <div class="center" style="font-size: 10px; margin-top: 8px;">
          Pede Rango Delivery • Sistema Operacional
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  janela.document.write(html);
  janela.document.close();
}
