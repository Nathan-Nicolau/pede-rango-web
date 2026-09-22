import React, { useState, useEffect } from 'react';
import { servicoRelatorios } from '../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Users, 
  Truck, 
  Calendar, 
  RefreshCw, 
  Award, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  Star
} from 'lucide-react';

const PERIODOS_FILTRO = [
  { id: 'HOJE', label: 'Hoje' },
  { id: 'ONTEM', label: 'Ontem' },
  { id: 'SEMANA', label: 'Últimos 7 Dias' },
  { id: 'QUINZENA', label: 'Últimos 15 Dias' },
  { id: 'MES', label: 'Mês Atual' },
  { id: 'CUSTOM', label: 'Personalizado' }
];

export function AdminDashboardView() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('SEMANA');
  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [exportandoCsv, setExportandoCsv] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  // Estados para filtro customizado
  const [dataInicioCustom, setDataInicioCustom] = useState('');
  const [dataFimCustom, setDataFimCustom] = useState('');

  const carregarDashboard = async (tipoPeriodo = 'SEMANA', inicio = null, fim = null) => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await servicoRelatorios.obterDashboard(tipoPeriodo, inicio, fim);
      setDadosDashboard(dados);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar métricas do dashboard');
    } finally {
      setCarregando(false);
    }
  };

  const aoExportarCsv = async () => {
    setExportandoCsv(true);
    setErro(null);
    try {
      await servicoRelatorios.exportarCsv(
        periodoSelecionado,
        dataInicioCustom ? `${dataInicioCustom}T00:00:00` : null,
        dataFimCustom ? `${dataFimCustom}T23:59:59` : null
      );
      setMensagemSucesso('✔ Relatório analítico CSV exportado e baixado com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err) {
      setErro(err.message || 'Erro ao exportar arquivo CSV');
    } finally {
      setExportandoCsv(false);
    }
  };

  useEffect(() => {
    if (periodoSelecionado !== 'CUSTOM') {
      carregarDashboard(periodoSelecionado);
    }
  }, [periodoSelecionado]);

  const aplicarFiltroCustomizado = (e) => {
    e.preventDefault();
    if (!dataInicioCustom || !dataFimCustom) {
      setErro('Informe as datas de início e fim para o filtro personalizado.');
      return;
    }
    const inicioIso = `${dataInicioCustom}T00:00:00`;
    const fimIso = `${dataFimCustom}T23:59:59`;
    carregarDashboard('CUSTOM', inicioIso, fimIso);
  };

  // Encontra o maior faturamento diário para escala do gráfico
  const maiorFaturamentoDia = dadosDashboard?.faturamentoPorDia?.reduce(
    (max, d) => Math.max(max, Number(d.faturamento || 0)), 0
  ) || 0;

  // Encontra maior quantidade vendida para escala dos top produtos
  const maiorQtdTopProduto = dadosDashboard?.topProdutos?.reduce(
    (max, p) => Math.max(max, p.quantidadeVendida), 0
  ) || 0;

  return (
    <div className="view-container">
      
      {/* Topo: Título & Botões de Ação */}
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="view-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', fontWeight: 800 }}>
            <TrendingUp size={28} color="var(--primary-accent)" /> Dashboard Executivo & BI
          </h1>
          <p className="view-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Painel de governança administrativa, faturamento, eficiência operacional e análise de vendas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={aoExportarCsv}
            className="btn-secondary"
            disabled={exportandoCsv || carregando}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}
            title="Baixar planilha CSV com os pedidos e faturamento do período"
          >
            <Download size={16} />
            {exportandoCsv ? 'Exportando CSV...' : 'Exportar CSV'}
          </button>

          <button
            type="button"
            onClick={() => carregarDashboard(periodoSelecionado, dataInicioCustom ? `${dataInicioCustom}T00:00:00` : null, dataFimCustom ? `${dataFimCustom}T23:59:59` : null)}
            className="btn-secondary"
            disabled={carregando}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}
          >
            <RefreshCw size={16} className={carregando ? 'spin' : ''} />
            {carregando ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
        </div>
      </div>

      {/* Barra de Filtros Temporais (Dia, Semana, Quinzena, Mês, Custom) */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
            <Calendar size={18} color="var(--primary-accent)" /> Período de Análise:
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PERIODOS_FILTRO.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPeriodoSelecionado(f.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: periodoSelecionado === f.id ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                  backgroundColor: periodoSelecionado === f.id ? 'var(--primary-accent-glow)' : 'var(--bg-input)',
                  color: periodoSelecionado === f.id ? 'var(--primary-accent)' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de Data para Período Personalizado */}
        {periodoSelecionado === 'CUSTOM' && (
          <form onSubmit={aplicarFiltroCustomizado} style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Data Inicial</label>
              <input
                type="date"
                className="form-input"
                value={dataInicioCustom}
                onChange={e => setDataInicioCustom(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px' }}
              />
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Data Final</label>
              <input
                type="date"
                className="form-input"
                value={dataFimCustom}
                onChange={e => setDataFimCustom(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
              Filtrar Período
            </button>
          </form>
        )}
      </div>

      {mensagemSucesso && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} /> {mensagemSucesso}
        </div>
      )}

      {erro && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {erro}
        </div>
      )}

      {/* Cards de KPIs Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* KPI 1: Faturamento Total */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Faturamento Entregue</span>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <DollarSign size={18} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
            R$ {dadosDashboard ? Number(dadosDashboard.faturamentoTotal || 0).toFixed(2) : '0.00'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Baseado em <strong>{dadosDashboard?.pedidosEntregues || 0}</strong> pedidos concluídos
          </span>
        </div>

        {/* KPI 2: Ticket Médio */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ticket Médio</span>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} color="#60a5fa" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa' }}>
            R$ {dadosDashboard ? Number(dadosDashboard.ticketMedio || 0).toFixed(2) : '0.00'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Gasto médio por pedido finalizado
          </span>
        </div>

        {/* KPI 3: Volume Total de Pedidos */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total de Pedidos</span>
            <div style={{ backgroundColor: 'rgba(211, 1, 1, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <ShoppingBag size={18} color="var(--primary-accent)" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {dadosDashboard?.totalPedidos || 0}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#34d399' }}>✔ {dadosDashboard?.pedidosEntregues || 0}</span>
            <span style={{ color: '#fbbf24' }}>⏳ {dadosDashboard?.pedidosEmAndamento || 0}</span>
            <span style={{ color: '#f87171' }}>✖ {dadosDashboard?.pedidosCancelados || 0}</span>
          </div>
        </div>

        {/* KPI 4: Tempo Médio de Entrega */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tempo Médio Entrega</span>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <Clock size={18} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
            {dadosDashboard && dadosDashboard.tempoMedioEntregaMinutos > 0
              ? `${Math.round(dadosDashboard.tempoMedioEntregaMinutos)} min`
              : 'N/A'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Do recebimento até a entrega ao cliente
          </span>
        </div>

        {/* KPI 5: Satisfação dos Clientes (Avaliações ⭐) */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Satisfação Clientes</span>
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', padding: '6px', borderRadius: '8px' }}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {dadosDashboard && dadosDashboard.notaMediaAvaliacoes > 0
              ? `${Number(dadosDashboard.notaMediaAvaliacoes).toFixed(1)} / 5.0`
              : '5.0 ⭐'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Baseado em <strong>{dadosDashboard?.totalAvaliacoes || 0}</strong> avaliações registradas
          </span>
        </div>

      </div>

      {/* Linha 2: Gráfico de Barras de Faturamento Diário & Top Produtos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Gráfico de Faturamento por Dia */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--primary-accent)" /> Faturamento por Dia no Período
            </h3>
            {dadosDashboard?.faturamentoPorDia && dadosDashboard.faturamentoPorDia.length > 7 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-input)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ↔ Deslize para ver todos os dias
              </span>
            )}
          </div>

          {dadosDashboard?.faturamentoPorDia && dadosDashboard.faturamentoPorDia.length > 0 ? (
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: dadosDashboard.faturamentoPorDia.length > 7 ? 'flex-start' : 'space-around',
                gap: dadosDashboard.faturamentoPorDia.length > 10 ? '12px' : '8px',
                minWidth: dadosDashboard.faturamentoPorDia.length > 7 ? `${dadosDashboard.faturamentoPorDia.length * 48}px` : '100%',
                height: '210px',
                paddingTop: '20px',
                paddingRight: '12px',
                paddingLeft: '12px',
                borderBottom: '1px solid var(--border-color)',
                boxSizing: 'border-box'
              }}>
                {dadosDashboard.faturamentoPorDia.map((dia, idx) => {
                  const valor = Number(dia.faturamento || 0);
                  const alturaPercent = maiorFaturamentoDia > 0 ? Math.max(10, Math.round((valor / maiorFaturamentoDia) * 100)) : 10;
                  
                  return (
                    <div key={idx} style={{ flex: dadosDashboard.faturamentoPorDia.length > 7 ? '0 0 44px' : '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', color: valor > 0 ? 'var(--text-main)' : 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap', minHeight: '16px' }}>
                        {valor > 0 ? `R$${Math.round(valor)}` : ''}
                      </span>
                      <div
                        title={`${dia.diaSemana}, ${dia.data}: R$ ${valor.toFixed(2)} (${dia.quantidadePedidos} pedidos)`}
                        style={{
                          width: '100%',
                          maxWidth: '32px',
                          height: `${alturaPercent}%`,
                          backgroundColor: valor > 0 ? 'var(--primary-accent)' : 'var(--bg-input)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.3s ease, background-color 0.2s ease',
                          cursor: 'pointer',
                          boxShadow: valor > 0 ? '0 4px 12px rgba(211, 1, 1, 0.3)' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {dia.data}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {dia.diaSemana}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Nenhum dado de faturamento no período selecionado.
            </div>
          )}
        </div>

        {/* Top 5 Produtos Mais Vendidos */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#fbbf24" /> Top Produtos Mais Vendidos
          </h3>

          {dadosDashboard?.topProdutos && dadosDashboard.topProdutos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {dadosDashboard.topProdutos.map((prod, idx) => {
                const percentual = maiorQtdTopProduto > 0 ? Math.round((prod.quantidadeVendida / maiorQtdTopProduto) * 100) : 0;

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        #{idx + 1} {prod.nome} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({prod.categoria})</span>
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>
                        {prod.quantidadeVendida} un • R$ {Number(prod.totalFaturado).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentual}%`, height: '100%', backgroundColor: 'var(--primary-accent)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Nenhuma venda registrada no período selecionado.
            </div>
          )}
        </div>

      </div>

      {/* Linha 3: Formas de Pagamento & Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Distribuição por Forma de Pagamento */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#38bdf8" /> Formas de Pagamento
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {dadosDashboard?.distribuicaoPagamento?.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.formaPagamento === 'PIX' ? <QrCode size={15} color="#06b6d4" /> :
                   item.formaPagamento === 'DINHEIRO' ? <Banknote size={15} color="#10b981" /> :
                   <CreditCard size={15} color="#3b82f6" />}
                  {item.label}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                  R$ {Number(item.total).toFixed(2)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.quantidade} {item.quantidade === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por Status */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} color="#a855f7" /> Status dos Pedidos
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dadosDashboard?.distribuicaoStatus?.map((st, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {st.label}
                </span>
                <span className="status-badge" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  {st.quantidade} {st.quantidade === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
