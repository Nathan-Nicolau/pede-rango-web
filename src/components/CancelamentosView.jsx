import React, { useState, useEffect } from 'react';
import { servicoCancelamentos } from '../services/api';
import { PaginationControls } from './PaginationControls';
import { XCircle, Search, Filter, Clock, User, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { labelStatus, labelMotivoCancelamento, MOTIVO_CANCELAMENTO_LABELS, formatarDataHora } from '../utils/statusLabels';

export function CancelamentosView() {
  const [cancelamentos, definirCancelamentos] = useState([]);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Paginação
  const [pagina, definirPagina] = useState(0);
  const [tamanho, definirTamanho] = useState(10);
  const [totalPaginas, definirTotalPaginas] = useState(1);
  const [totalElementos, definirTotalElementos] = useState(0);

  // Filtro
  const [motivoFiltro, definirMotivoFiltro] = useState('ALL');
  const [termoBusca, definirTermoBusca] = useState('');

  useEffect(() => {
    carregarCancelamentos();
  }, [pagina, tamanho, motivoFiltro]);

  const carregarCancelamentos = async () => {
    definirCarregando(true);
    definirErro(null);
    try {
      const dados = await servicoCancelamentos.obterPaginado(pagina, tamanho, motivoFiltro);
      definirCancelamentos(dados.content || []);
      definirTotalPaginas(dados.totalPages || 1);
      definirTotalElementos(dados.totalElements || 0);
    } catch (err) {
      definirErro(err.message || 'Erro ao carregar pedidos cancelados.');
    } finally {
      definirCarregando(false);
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    try {
      return new Date(dataStr).toLocaleString('pt-BR');
    } catch {
      return dataStr;
    }
  };


  const cancelamentosFiltrados = cancelamentos.filter(item => {
    const cliente = (item.nomeCliente || '').toLowerCase();
    const codigo = (item.codigo || item.id || '').toString().toLowerCase();
    const obs = (item.cancelamento?.observacoes || '').toLowerCase();
    const termo = termoBusca.toLowerCase();

    return cliente.includes(termo) || codigo.includes(termo) || obs.includes(termo);
  });

  return (
    <div>
      {/* Topo da Aba */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <XCircle size={26} color="var(--danger)" /> Registros de Pedidos Cancelados
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Histórico e motivos de cancelamento dos pedidos.
          </p>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <div className="search-input-wrapper" style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
          <input
            type="text"
            className="search-input-with-icon form-input"
            placeholder="Buscar por código, cliente ou observações de cancelamento..."
            value={termoBusca}
            onChange={(e) => definirTermoBusca(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select
              value={motivoFiltro}
              onChange={(e) => { definirMotivoFiltro(e.target.value); definirPagina(0); }}
              className="form-input"
              style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
            >
              <option value="ALL">Todos os Motivos</option>
              {Object.entries(MOTIVO_CANCELAMENTO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button onClick={carregarCancelamentos} className="btn-secondary" title="Atualizar cancelamentos">
            <RefreshCw size={16} className={carregando ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {erro && (
        <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.15)', border: '1px solid rgba(211, 1, 1, 0.4)', color: '#f87171', padding: '14px', borderRadius: '12px', marginBottom: '24px' }}>
          {erro}
        </div>
      )}

      {/* Grid de Pedidos Cancelados */}
      {carregando && cancelamentos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Carregando histórico de cancelamentos...
        </div>
      ) : cancelamentosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '6px' }}>Nenhum pedido cancelado encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Não há registros de cancelamento para os filtros selecionados.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {cancelamentosFiltrados.map((pedido) => {
            const canc = pedido.cancelamento;
            const codigo = pedido.codigo || pedido.id;
            const valorTotal = Number(pedido.valorTotal || 0).toFixed(2);

            return (
              <div
                key={pedido.id}
                className="glass-panel"
                style={{
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: '4px solid #ef4444'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    #{codigo}
                  </span>
                  <span className="status-badge status-CANCELADO">
                    {labelStatus('CANCELADO')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Cliente: {pedido.nomeCliente || 'Não informado'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Valor Total: <strong style={{ color: 'var(--primary-accent)' }}>R$ {valorTotal}</strong>
                  </span>
                </div>

                {/* Detalhes da Entidade CancelamentoPedido */}
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} /> Motivo: {labelMotivoCancelamento(canc?.motivo)}
                  </div>
                  {canc?.observacoes && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <FileText size={13} style={{ display: 'inline', marginRight: '4px' }} /> Obs: "{canc.observacoes}"
                    </div>
                  )}
                  {canc?.canceladoEm && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> <strong>Data de Cancelamento:</strong> {formatarDataHora(canc.canceladoEm)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      <PaginationControls
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        totalElementos={totalElementos}
        tamanhoPagina={tamanho}
        aoMudarPagina={(novaPagina) => definirPagina(novaPagina)}
        aoMudarTamanho={(novoTamanho) => { definirTamanho(novoTamanho); definirPagina(0); }}
      />
    </div>
  );
}
