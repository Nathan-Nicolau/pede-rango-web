import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { OrderStats } from './components/OrderStats';
import { OrderCard } from './components/OrderCard';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { LogoutModal } from './components/LogoutModal';
import { CancelOrderModal } from './components/CancelOrderModal';
import { PaginationControls } from './components/PaginationControls';
import { ActiveDeliveryRidersCard } from './components/ActiveDeliveryRidersCard';
import { EntregadoresView } from './components/EntregadoresView';
import { CardapioView } from './components/CardapioView';
import { CancelamentosView } from './components/CancelamentosView';
import { EntregadorOrdersView } from './components/EntregadorOrdersView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { StoreConfigView } from './components/StoreConfigView';
import { NavigationTabs } from './components/NavigationTabs';
import { servicoAutenticacao, servicoPedidos, servicoConfiguracoes } from './services/api';
import { Search, Filter, RefreshCw, AlertTriangle, Plus, Sun, Moon, Package, Truck, UtensilsCrossed, XCircle, Users, UserCheck, History, TrendingUp, Volume2, VolumeX, Bell } from 'lucide-react';
import { LISTA_STATUS_PEDIDO } from './utils/statusLabels';
import { UsuariosView } from './components/UsuariosView';
import { ClientesView } from './components/ClientesView';
import { tocarAlertaNovoPedido } from './utils/audioNotification';

export default function App() {
  const [usuario, definirUsuario] = useState(servicoAutenticacao.obterUsuarioAtual());
  const [estaAutenticado, definirEstaAutenticado] = useState(servicoAutenticacao.estaAutenticado());
  const [modalAuthAberto, definirModalAuthAberto] = useState(false);

  // Navegação por Abas (Admin inicia no Dashboard, Restaurante na fila de pedidos)
  const [abaAtiva, definirAbaAtiva] = useState(() => {
    const usr = servicoAutenticacao.obterUsuarioAtual();
    if (usr?.perfil === 'ADMIN') return 'DASHBOARD';
    if (usr?.perfil === 'RESTAURANTE') return 'PEDIDOS';
    if (usr?.perfil === 'ENTREGADOR') return 'ENTREGAS';
    return 'CARDAPIO';
  });

  // Pedidos & Paginação
  const [pedidos, definirPedidos] = useState([]);
  const [pagina, definirPagina] = useState(0);
  const [tamanho, definirTamanho] = useState(10);
  const [totalPaginas, definirTotalPaginas] = useState(1);
  const [totalElementos, definirTotalElementos] = useState(0);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Configuração Operacional do Estabelecimento
  const [configuracao, definirConfiguracao] = useState(null);

  // Filtros
  const [termoBusca, definirTermoBusca] = useState('');
  const [filtroStatus, definirFiltroStatus] = useState('ALL');

  // Modais & Repetição de Pedido
  const [modalCriacaoAberto, definirModalCriacaoAberto] = useState(false);
  const [itensParaRepetir, definirItensParaRepetir] = useState(null);
  const [modalLogoutAberto, definirModalLogoutAberto] = useState(false);
  const [modalPerfilAberto, definirModalPerfilAberto] = useState(false);
  const [pedidoSelecionado, definirPedidoSelecionado] = useState(null);
  const [pedidoParaCancelar, definirPedidoParaCancelar] = useState(null);

  // Alerta Sonoro & Polling Automático
  const [somHabilitado, definirSomHabilitado] = useState(() => {
    return localStorage.getItem('pede_rango_sound') !== 'false';
  });
  const pedidosAnterioresIdsRef = useRef(new Set());
  const primeiraCargaPedidosRef = useRef(true);

  // Estado do Tema (Light / Dark)
  const [tema, definirTema] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('theme', tema);
  }, [tema]);

  const aoAlternarSom = () => {
    definirSomHabilitado(prev => {
      const novo = !prev;
      localStorage.setItem('pede_rango_sound', String(novo));
      if (novo) {
        tocarAlertaNovoPedido();
      }
      return novo;
    });
  };

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      const dados = await servicoConfiguracoes.obter();
      definirConfiguracao(dados);
    } catch {
      // Falha silenciosa ou default
    }
  };

  const aoAlternarTema = () => {
    definirTema((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const estaLojaAberta = Boolean(configuracao?.operacionalmenteAbertaHoje);

  const aoTentarAbrirNovoPedido = (itensPreSelecionados = null) => {
    if (usuario?.perfil === 'CLIENTE' && !estaLojaAberta) {
      alert('O estabelecimento está temporariamente fechado para novos pedidos. Consulte o cardápio e volte logo!');
      return;
    }
    definirItensParaRepetir(itensPreSelecionados);
    definirModalCriacaoAberto(true);
  };

  const aoRepetirPedido = (pedido) => {
    if (!pedido) return;
    if (usuario?.perfil === 'CLIENTE' && !estaLojaAberta) {
      alert('O estabelecimento está temporariamente fechado para novos pedidos.');
      return;
    }
    const isFinalizado = pedido.status === 'ENTREGUE' || pedido.status === 'CANCELADO';
    if (!isFinalizado) {
      alert('Apenas pedidos finalizados podem ser repetidos.');
      return;
    }
    const itens = (pedido.itens || pedido.items || []).map(item => ({
      produtoId: item.produtoId || item.id,
      nome: item.nome || item.name,
      quantidade: item.quantidade || item.quantity || 1,
      precoUnitario: item.precoUnitario || item.unitPrice || 0,
      observacao: item.observacao || item.observation || ''
    }));
    aoTentarAbrirNovoPedido(itens);
  };

  const aoPedirItemDireto = (produto) => {
    if (!produto) return;
    if (usuario?.perfil === 'CLIENTE' && !estaLojaAberta) {
      alert('O estabelecimento está temporariamente fechado para novos pedidos.');
      return;
    }
    const item = [{
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: 1,
      precoUnitario: produto.preco,
      observacao: ''
    }];
    aoTentarAbrirNovoPedido(item);
  };

  useEffect(() => {
    if (estaAutenticado && (abaAtiva === 'PEDIDOS' || abaAtiva === 'HISTORICO')) {
      carregarPedidos(false);
    }
  }, [estaAutenticado, abaAtiva, pagina, tamanho, filtroStatus]);

  // Polling automático a cada 10 segundos
  useEffect(() => {
    if (!estaAutenticado) return;
    const intervalo = setInterval(() => {
      carregarConfiguracao();
      if (abaAtiva === 'PEDIDOS' || abaAtiva === 'HISTORICO') {
        carregarPedidos(true);
      }
    }, 10000);
    return () => clearInterval(intervalo);
  }, [estaAutenticado, abaAtiva, pagina, tamanho, filtroStatus, somHabilitado]);

  const carregarPedidos = async (silencioso = false) => {
    if (!silencioso) {
      definirCarregando(true);
      definirErro(null);
    }
    try {
      let dados;
      if (usuario?.perfil === 'CLIENTE') {
        dados = await servicoPedidos.obterMeusPedidosPaginado(pagina, tamanho, filtroStatus);
      } else {
        dados = await servicoPedidos.obterTodosPedidosPaginado(pagina, tamanho, filtroStatus);
      }
      const lista = Array.isArray(dados.content) ? dados.content : [];
      
      // Detecção de novos pedidos RECEBIDO para alerta sonoro (Cozinha/Admin)
      const novosRecebidos = lista.filter(p => p.status === 'RECEBIDO' && !pedidosAnterioresIdsRef.current.has(p.id));
      if (!primeiraCargaPedidosRef.current && novosRecebidos.length > 0 && somHabilitado && (usuario?.perfil === 'RESTAURANTE' || usuario?.perfil === 'ADMIN')) {
        tocarAlertaNovoPedido();
      }

      pedidosAnterioresIdsRef.current = new Set(lista.map(p => p.id));
      primeiraCargaPedidosRef.current = false;

      definirPedidos(lista);
      definirTotalPaginas(dados.totalPages || 1);
      definirTotalElementos(dados.totalElements || 0);
    } catch (err) {
      if (!silencioso) {
        definirErro(err.message || 'Erro ao carregar lista de pedidos.');
      }
    } finally {
      if (!silencioso) {
        definirCarregando(false);
      }
    }
  };

  const aoAutenticarComSucesso = () => {
    const usr = servicoAutenticacao.obterUsuarioAtual();
    definirUsuario(usr);
    definirEstaAutenticado(true);
    definirModalAuthAberto(false);
    if (usr?.perfil === 'ADMIN') {
      definirAbaAtiva('DASHBOARD');
    } else if (usr?.perfil === 'RESTAURANTE') {
      definirAbaAtiva('PEDIDOS');
    } else if (usr?.perfil === 'ENTREGADOR') {
      definirAbaAtiva('ENTREGAS');
    } else {
      definirAbaAtiva('CARDAPIO');
    }
  };

  const aoConfirmarSair = () => {
    servicoAutenticacao.sair();
    definirUsuario(null);
    definirEstaAutenticado(false);
    definirPedidos([]);
    definirModalLogoutAberto(false);
  };

  const aoSelecionarPedido = (pedido) => {
    definirPedidoSelecionado(pedido);
  };

  const aoAbrirCancelamento = (pedido) => {
    definirPedidoParaCancelar(pedido);
  };

  const aoAtualizarStatus = async (idPedido, novoStatus) => {
    try {
      const pedidoAtualizado = await servicoPedidos.atualizarStatusPedido(idPedido, novoStatus);
      const listaSegura = Array.isArray(pedidos) ? pedidos : [];
      definirPedidos(listaSegura.map(p => p.id === idPedido ? pedidoAtualizado : p));
      if (pedidoSelecionado && pedidoSelecionado.id === idPedido) {
        definirPedidoSelecionado(pedidoAtualizado);
      }
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const aoCriarPedido = () => {
    carregarPedidos();
  };

  const aoCancelarComSucesso = () => {
    definirPedidoParaCancelar(null);
    carregarPedidos();
  };

  const listaSeguraPedidos = Array.isArray(pedidos) ? pedidos : [];
  const pedidosFiltrados = listaSeguraPedidos.filter(pedido => {
    const nomeCliente = pedido.nomeCliente || pedido.customerName || '';
    const endereco = pedido.enderecoEntrega || pedido.deliveryAddress || '';
    const codigo = (pedido.codigo || pedido.id || '').toString();
    const termoLower = termoBusca.toLowerCase();

    return nomeCliente.toLowerCase().includes(termoLower) ||
           endereco.toLowerCase().includes(termoLower) ||
           codigo.toLowerCase().includes(termoLower);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
      <Navbar
        usuario={usuario}
        configuracao={configuracao}
        aoSair={() => definirModalLogoutAberto(true)}
        aoAbrirNovoPedido={() => aoTentarAbrirNovoPedido(null)}
        tema={tema}
        aoAlternarTema={aoAlternarTema}
        modalPerfilAberto={modalPerfilAberto}
        aoAbrirPerfil={() => definirModalPerfilAberto(true)}
        aoFecharPerfil={() => definirModalPerfilAberto(false)}
      />

      <main className="app-main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {!estaAutenticado ? (
          <AuthModal aoAutenticarComSucesso={aoAutenticarComSucesso} tema={tema} />
        ) : (
          <>
            <NavigationTabs
              perfil={usuario?.perfil}
              abaAtiva={abaAtiva}
              aoSelecionarAba={definirAbaAtiva}
            />

            {/* Aba Exclusiva do Dashboard Executivo / BI para ADMIN */}
            {abaAtiva === 'DASHBOARD' && usuario?.perfil === 'ADMIN' && (
              <AdminDashboardView />
            )}

            {abaAtiva === 'PEDIDOS' && (
              <>
                {/* Card Superior Exclusivo para Entregadores em Rota de Entrega */}
                <ActiveDeliveryRidersCard pedidos={pedidos} usuario={usuario} />

                {/* Resumo de Estatísticas */}
                <OrderStats pedidos={pedidos} />

                {/* Barra de Filtro e Busca */}
                <div className="filter-bar-container" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px',
                  backgroundColor: 'var(--bg-card)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)'
                }}>
                  {/* Input de Busca */}
                  <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar por ID, código, cliente ou endereço..."
                      value={termoBusca}
                      onChange={(e) => definirTermoBusca(e.target.value)}
                      style={{ paddingLeft: '40px', width: '100%' }}
                    />
                  </div>

                  {/* Dropdown de Filtro de Status & Atualizar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Filter size={16} color="var(--text-secondary)" />
                      <select
                        value={filtroStatus}
                        onChange={(e) => { definirFiltroStatus(e.target.value); definirPagina(0); }}
                        className="form-input"
                        style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
                      >
                        <option value="ALL">Todos os Status</option>
                        {LISTA_STATUS_PEDIDO.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botão de Som de Novo Pedido (Cozinha/Admin) */}
                    {(usuario?.perfil === 'RESTAURANTE' || usuario?.perfil === 'ADMIN') && (
                      <button
                        onClick={aoAlternarSom}
                        className="btn-secondary"
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: somHabilitado ? '#34d399' : 'var(--text-secondary)',
                          border: somHabilitado ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--border-color)',
                          backgroundColor: somHabilitado ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)'
                        }}
                        title={somHabilitado ? 'Som de novo pedido ativado (Clique para silenciar)' : 'Som de novo pedido desativado (Clique para ativar)'}
                      >
                        {somHabilitado ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {somHabilitado ? 'Som Ativo' : 'Mudo'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => carregarPedidos(false)}
                      className="btn-secondary"
                      style={{ padding: '10px 14px' }}
                      title="Atualizar lista"
                    >
                      <RefreshCw size={16} className={carregando ? 'spin' : ''} />
                    </button>

                    {usuario?.perfil === 'CLIENTE' && (
                      <button
                        onClick={() => aoTentarAbrirNovoPedido(null)}
                        disabled={!estaLojaAberta}
                        className="btn-primary"
                        style={{
                          padding: '10px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: !estaLojaAberta ? 0.5 : 1,
                          cursor: !estaLojaAberta ? 'not-allowed' : 'pointer',
                          filter: !estaLojaAberta ? 'grayscale(0.6)' : 'none'
                        }}
                        title={!estaLojaAberta ? 'Estabelecimento fechado para novos pedidos no momento' : 'Fazer novo pedido'}
                      >
                        <Plus size={18} /> Fazer Novo Pedido
                      </button>
                    )}
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                  <div style={{
                    backgroundColor: 'rgba(211, 1, 1, 0.15)',
                    border: '1px solid rgba(211, 1, 1, 0.4)',
                    color: '#f87171',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={20} />
                      <span>{erro}</span>
                    </div>
                    <button onClick={carregarPedidos} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {/* Grid de Pedidos */}
                {carregando && pedidos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    Carregando pedidos da API...
                  </div>
                ) : pedidosFiltrados.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <Package size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                      Nenhum pedido encontrado
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      {termoBusca || filtroStatus !== 'ALL'
                        ? 'Tente alterar os filtros de busca para encontrar pedidos.'
                        : 'Crie seu primeiro pedido para visualizar no painel!'}
                    </p>
                    {!termoBusca && filtroStatus === 'ALL' && (
                      <button
                        onClick={() => aoTentarAbrirNovoPedido(null)}
                        disabled={!estaLojaAberta}
                        className="btn-primary"
                        style={{
                          opacity: !estaLojaAberta ? 0.5 : 1,
                          cursor: !estaLojaAberta ? 'not-allowed' : 'pointer'
                        }}
                        title={!estaLojaAberta ? 'Estabelecimento fechado para novos pedidos' : 'Criar Primeiro Pedido'}
                      >
                        <Plus size={18} /> Criar Primeiro Pedido
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="orders-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '20px'
                    }}>
                      {pedidosFiltrados.map((pedido) => (
                        <OrderCard
                          key={pedido.id}
                          pedido={pedido}
                          usuario={usuario}
                          configuracao={configuracao}
                          aoClicarCard={aoSelecionarPedido}
                          aoAtualizarStatus={aoAtualizarStatus}
                          aoCancelarPedido={aoAbrirCancelamento}
                          aoRepetirPedido={aoRepetirPedido}
                        />
                      ))}
                    </div>

                    <PaginationControls
                      paginaAtual={pagina}
                      totalPaginas={totalPaginas}
                      totalElementos={totalElementos}
                      tamanhoPagina={tamanho}
                      aoMudarPagina={(nova) => definirPagina(nova)}
                      aoMudarTamanho={(novoTamanho) => { definirTamanho(novoTamanho); definirPagina(0); }}
                    />
                  </>
                )}
              </>
            )}

            {/* Aba de Histórico de Pedidos para o Cliente */}
            {abaAtiva === 'HISTORICO' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      <History size={26} color="var(--primary-accent)" /> Histórico de Pedidos Realizados
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Consulte seus pedidos anteriores, comprovantes e acompanhe suas solicitações já finalizadas.
                    </p>
                  </div>
                  <button
                    onClick={() => aoTentarAbrirNovoPedido(null)}
                    disabled={!estaLojaAberta}
                    className="btn-primary"
                    style={{
                      opacity: !estaLojaAberta ? 0.5 : 1,
                      cursor: !estaLojaAberta ? 'not-allowed' : 'pointer',
                      filter: !estaLojaAberta ? 'grayscale(0.6)' : 'none'
                    }}
                    title={!estaLojaAberta ? 'Estabelecimento fechado para novos pedidos no momento' : 'Fazer novo pedido'}
                  >
                    <Plus size={18} /> Fazer Novo Pedido
                  </button>
                </div>

                {/* Barra de Filtro e Busca no Histórico */}
                <div className="filter-bar-container" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                  flexWrap: 'wrap', marginBottom: '24px', backgroundColor: 'var(--bg-card)',
                  padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)'
                }}>
                  <div style={{ position: 'relative', flex: '1 1 280px' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Buscar por código, itens ou endereço..."
                      value={termoBusca}
                      onChange={(e) => definirTermoBusca(e.target.value)}
                      style={{ paddingLeft: '40px', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={filtroStatus}
                      onChange={(e) => { definirFiltroStatus(e.target.value); definirPagina(0); }}
                      className="form-input"
                      style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
                    >
                      <option value="ALL">Todos os Históricos</option>
                      <option value="ENTREGUE">Entregues</option>
                      <option value="CANCELADO">Cancelados</option>
                    </select>

                    <button onClick={carregarPedidos} className="btn-secondary" style={{ padding: '10px 14px' }}>
                      <RefreshCw size={16} className={carregando ? 'spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* Grid do Histórico */}
                {carregando && pedidos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    Carregando histórico...
                  </div>
                ) : pedidosFiltrados.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <History size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '8px' }}>Nenhum pedido no histórico</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Você ainda não realizou pedidos no sistema.</p>
                    <button
                      onClick={() => aoTentarAbrirNovoPedido(null)}
                      disabled={!estaLojaAberta}
                      className="btn-primary"
                      style={{
                        opacity: !estaLojaAberta ? 0.5 : 1,
                        cursor: !estaLojaAberta ? 'not-allowed' : 'pointer'
                      }}
                      title={!estaLojaAberta ? 'Estabelecimento fechado para novos pedidos' : 'Fazer Primeiro Pedido'}
                    >
                      <Plus size={18} /> Fazer Primeiro Pedido
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {pedidosFiltrados.map((pedido) => (
                        <OrderCard
                          key={pedido.id}
                          pedido={pedido}
                          usuario={usuario}
                          configuracao={configuracao}
                          aoClicarCard={aoSelecionarPedido}
                          aoAtualizarStatus={aoAtualizarStatus}
                          aoCancelarPedido={aoAbrirCancelamento}
                          aoRepetirPedido={aoRepetirPedido}
                        />
                      ))}
                    </div>

                    <PaginationControls
                      paginaAtual={pagina}
                      totalPaginas={totalPaginas}
                      totalElementos={totalElementos}
                      tamanhoPagina={tamanho}
                      aoMudarPagina={(nova) => definirPagina(nova)}
                    />
                  </>
                )}
              </div>
            )}

            {/* Aba de Entregas e Aceite de Pedidos */}
            {abaAtiva === 'ENTREGAS' && (
              <EntregadorOrdersView usuario={usuario} />
            )}

            {/* Aba de Entregadores */}
            {abaAtiva === 'ENTREGADORES' && (
              <EntregadoresView />
            )}

            {/* Aba de Cardápio / Itens Padrão */}
            {abaAtiva === 'CARDAPIO' && (
              <CardapioView
                usuario={usuario}
                configuracao={configuracao}
                aoFazerPedido={() => aoTentarAbrirNovoPedido(null)}
                aoPedirItem={aoPedirItemDireto}
              />
            )}

            {/* Aba de Pedidos Cancelados */}
            {abaAtiva === 'CANCELAMENTOS' && (
              <CancelamentosView />
            )}

            {/* Aba de Usuários por Perfil */}
            {abaAtiva === 'USUARIOS' && (
              <UsuariosView />
            )}

            {/* Aba de Clientes */}
            {abaAtiva === 'CLIENTES' && (
              <ClientesView />
            )}

            {/* Aba de Operações & Loja (ADMIN e RESTAURANTE) */}
            {abaAtiva === 'CONFIGURACOES' && (
              <StoreConfigView aoAtualizarConfig={(novaCfg) => definirConfiguracao(novaCfg)} />
            )}
          </>
        )}
      </main>

      {/* Modais */}
      {modalCriacaoAberto && (
        <CreateOrderModal
          aoFechar={() => {
            definirModalCriacaoAberto(false);
            definirItensParaRepetir(null);
          }}
          aoCriarPedido={aoCriarPedido}
          usuario={usuario}
          configuracao={configuracao}
          itensPreSelecionados={itensParaRepetir}
        />
      )}

      {pedidoSelecionado && (
        <OrderDetailModal
          pedido={pedidoSelecionado}
          usuario={usuario}
          configuracao={configuracao}
          aoFechar={() => definirPedidoSelecionado(null)}
          aoAtualizarStatus={aoAtualizarStatus}
          aoRepetirPedido={aoRepetirPedido}
          aoCancelarPedido={aoAbrirCancelamento}
        />
      )}

      {pedidoParaCancelar && (
        <CancelOrderModal
          pedido={pedidoParaCancelar}
          aoFechar={() => definirPedidoParaCancelar(null)}
          aoCancelarComSucesso={aoCancelarComSucesso}
          usuario={usuario}
        />
      )}

      {modalLogoutAberto && (
        <LogoutModal
          aoFechar={() => definirModalLogoutAberto(false)}
          aoConfirmarSair={aoConfirmarSair}
        />
      )}
    </div>
  );
}

