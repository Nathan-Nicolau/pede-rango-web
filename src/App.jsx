import React, { useState, useEffect } from 'react';
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
import { servicoAutenticacao, servicoPedidos } from './services/api';
import { Search, Filter, RefreshCw, AlertTriangle, Plus, Sun, Moon, Package, Truck, UtensilsCrossed, XCircle, Users, UserCheck, History } from 'lucide-react';
import { LISTA_STATUS_PEDIDO } from './utils/statusLabels';
import { UsuariosView } from './components/UsuariosView';
import { ClientesView } from './components/ClientesView';

export default function App() {
  const [usuario, definirUsuario] = useState(servicoAutenticacao.obterUsuarioAtual());
  const [estaAutenticado, definirEstaAutenticado] = useState(servicoAutenticacao.estaAutenticado());
  const [modalAuthAberto, definirModalAuthAberto] = useState(false);

  // Navegação por Abas
  const [abaAtiva, definirAbaAtiva] = useState('PEDIDOS');

  // Pedidos & Paginação
  const [pedidos, definirPedidos] = useState([]);
  const [pagina, definirPagina] = useState(0);
  const [tamanho, definirTamanho] = useState(10);
  const [totalPaginas, definirTotalPaginas] = useState(1);
  const [totalElementos, definirTotalElementos] = useState(0);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Filtros
  const [termoBusca, definirTermoBusca] = useState('');
  const [filtroStatus, definirFiltroStatus] = useState('ALL');

  // Modais
  const [modalCriacaoAberto, definirModalCriacaoAberto] = useState(false);
  const [modalLogoutAberto, definirModalLogoutAberto] = useState(false);
  const [pedidoSelecionado, definirPedidoSelecionado] = useState(null);
  const [pedidoParaCancelar, definirPedidoParaCancelar] = useState(null);

  // Estado do Tema (Light / Dark)
  const [tema, definirTema] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('theme', tema);
  }, [tema]);

  const aoAlternarTema = () => {
    definirTema((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (estaAutenticado && (abaAtiva === 'PEDIDOS' || abaAtiva === 'HISTORICO')) {
      carregarPedidos();
    }
  }, [estaAutenticado, abaAtiva, pagina, tamanho, filtroStatus]);

  const carregarPedidos = async () => {
    definirCarregando(true);
    definirErro(null);
    try {
      const dados = await servicoPedidos.obterTodosPedidosPaginado(pagina, tamanho, filtroStatus);
      const lista = Array.isArray(dados.content) ? dados.content : [];
      definirPedidos(lista);
      definirTotalPaginas(dados.totalPages || 1);
      definirTotalElementos(dados.totalElements || 0);
    } catch (err) {
      definirErro(err.message || 'Erro ao carregar lista de pedidos.');
    } finally {
      definirCarregando(false);
    }
  };

  const aoAutenticarComSucesso = () => {
    const usr = servicoAutenticacao.obterUsuarioAtual();
    definirUsuario(usr);
    definirEstaAutenticado(true);
    definirModalAuthAberto(false);
    if (usr?.perfil === 'ENTREGADOR') {
      definirAbaAtiva('ENTREGAS');
    } else {
      definirAbaAtiva('PEDIDOS');
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
        aoSair={() => definirModalLogoutAberto(true)}
        aoAbrirNovoPedido={() => definirModalCriacaoAberto(true)}
        tema={tema}
        aoAlternarTema={aoAlternarTema}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {!estaAutenticado ? (
          <AuthModal aoAutenticarComSucesso={aoAutenticarComSucesso} />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-card)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '28px', overflowX: 'auto' }}>
              {(usuario?.perfil === 'ADMIN' || !usuario?.perfil) && (
                <>
                  <button onClick={() => definirAbaAtiva('PEDIDOS')} className={`nav-tab-btn ${abaAtiva === 'PEDIDOS' ? 'active' : ''}`}><Package size={18} /> Pedidos</button>
                  <button onClick={() => definirAbaAtiva('ENTREGADORES')} className={`nav-tab-btn ${abaAtiva === 'ENTREGADORES' ? 'active' : ''}`}><Truck size={18} /> Entregadores</button>
                  <button onClick={() => definirAbaAtiva('CARDAPIO')} className={`nav-tab-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}><UtensilsCrossed size={18} /> Cardápio</button>
                  <button onClick={() => definirAbaAtiva('CANCELAMENTOS')} className={`nav-tab-btn ${abaAtiva === 'CANCELAMENTOS' ? 'active' : ''}`}><XCircle size={18} /> Pedidos Cancelados</button>
                  <button onClick={() => definirAbaAtiva('USUARIOS')} className={`nav-tab-btn ${abaAtiva === 'USUARIOS' ? 'active' : ''}`}><Users size={18} /> Usuários</button>
                  <button onClick={() => definirAbaAtiva('CLIENTES')} className={`nav-tab-btn ${abaAtiva === 'CLIENTES' ? 'active' : ''}`}><UserCheck size={18} /> Clientes</button>
                </>
              )}
              {usuario?.perfil === 'ENTREGADOR' && (
                <>
                  <button onClick={() => definirAbaAtiva('ENTREGAS')} className={`nav-tab-btn ${abaAtiva === 'ENTREGAS' ? 'active' : ''}`}><Truck size={18} /> Entregas</button>
                  <button onClick={() => definirAbaAtiva('CARDAPIO')} className={`nav-tab-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}><UtensilsCrossed size={18} /> Cardápio</button>
                </>
              )}
              {usuario?.perfil === 'CLIENTE' && (
                <>
                  <button onClick={() => definirAbaAtiva('PEDIDOS')} className={`nav-tab-btn ${abaAtiva === 'PEDIDOS' ? 'active' : ''}`}><Package size={18} /> Meus Pedidos</button>
                  <button onClick={() => definirAbaAtiva('HISTORICO')} className={`nav-tab-btn ${abaAtiva === 'HISTORICO' ? 'active' : ''}`}><History size={18} /> Histórico de Pedidos</button>
                  <button onClick={() => definirAbaAtiva('CARDAPIO')} className={`nav-tab-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}><UtensilsCrossed size={18} /> Cardápio de Produtos</button>
                </>
              )}
            </div>

            {abaAtiva === 'PEDIDOS' && (
              <>
                {/* Card Superior Exclusivo para Entregadores em Rota de Entrega */}
                <ActiveDeliveryRidersCard pedidos={pedidos} />

                {/* Resumo de Estatísticas */}
                <OrderStats pedidos={pedidos} />

                {/* Barra de Filtro e Busca */}
                <div style={{
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

                    <button
                      onClick={carregarPedidos}
                      className="btn-secondary"
                      style={{ padding: '10px 14px' }}
                      title="Atualizar lista"
                    >
                      <RefreshCw size={16} className={carregando ? 'spin' : ''} />
                    </button>

                    {usuario?.perfil === 'CLIENTE' && (
                      <button
                        onClick={() => definirModalCriacaoAberto(true)}
                        className="btn-primary"
                        style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
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
                      <button onClick={() => definirModalCriacaoAberto(true)} className="btn-primary">
                        <Plus size={18} /> Criar Primeiro Pedido
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '20px'
                    }}>
                      {pedidosFiltrados.map((pedido) => (
                        <OrderCard
                          key={pedido.id}
                          pedido={pedido}
                          usuario={usuario}
                          aoClicarCard={aoSelecionarPedido}
                          aoAtualizarStatus={aoAtualizarStatus}
                          aoCancelarPedido={aoAbrirCancelamento}
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
                  <button onClick={() => definirModalCriacaoAberto(true)} className="btn-primary">
                    <Plus size={18} /> Fazer Novo Pedido
                  </button>
                </div>

                {/* Barra de Filtro e Busca no Histórico */}
                <div style={{
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
                    <button onClick={() => definirModalCriacaoAberto(true)} className="btn-primary">
                      <Plus size={18} /> Fazer Primeiro Pedido
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {pedidosFiltrados.map((pedido) => (
                        <OrderCard
                          key={pedido.id}
                          pedido={pedido}
                          usuario={usuario}
                          aoClicarCard={aoSelecionarPedido}
                          aoAtualizarStatus={aoAtualizarStatus}
                          aoCancelarPedido={aoAbrirCancelamento}
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
              <CardapioView usuario={usuario} />
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
          </>
        )}
      </main>

      {/* Modais */}
      {modalCriacaoAberto && (
        <CreateOrderModal
          aoFechar={() => definirModalCriacaoAberto(false)}
          aoCriarPedido={aoCriarPedido}
          usuario={usuario}
        />
      )}

      {pedidoSelecionado && (
        <OrderDetailModal
          pedido={pedidoSelecionado}
          usuario={usuario}
          aoFechar={() => definirPedidoSelecionado(null)}
          aoAtualizarStatus={aoAtualizarStatus}
        />
      )}

      {pedidoParaCancelar && (
        <CancelOrderModal
          pedido={pedidoParaCancelar}
          aoFechar={() => definirPedidoParaCancelar(null)}
          aoCancelarComSucesso={aoCancelarComSucesso}
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

