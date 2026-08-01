import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { OrderStats } from './components/OrderStats';
import { OrderCard } from './components/OrderCard';
import { CreateOrderModal } from './components/CreateOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { servicoAutenticacao, servicoPedidos } from './services/api';
import { Search, Filter, RefreshCw, AlertTriangle, Plus } from 'lucide-react';

export default function App() {
  const [usuario, definirUsuario] = useState(servicoAutenticacao.obterUsuarioAtual());
  const [estaAutenticado, definirEstaAutenticado] = useState(servicoAutenticacao.estaAutenticado());
  const [pedidos, definirPedidos] = useState([]);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState(null);

  // Filtros
  const [termoBusca, definirTermoBusca] = useState('');
  const [filtroStatus, definirFiltroStatus] = useState('ALL');

  // Modais
  const [modalCriacaoAberto, definirModalCriacaoAberto] = useState(false);
  const [pedidoSelecionado, definirPedidoSelecionado] = useState(null);

  useEffect(() => {
    if (estaAutenticado) {
      carregarPedidos();
    }
  }, [estaAutenticado]);

  const carregarPedidos = async () => {
    definirCarregando(true);
    definirErro(null);
    try {
      const dados = await servicoPedidos.obterTodosPedidos();
      definirPedidos(dados || []);
    } catch (err) {
      definirErro(err.message || 'Erro ao carregar lista de pedidos.');
    } finally {
      definirCarregando(false);
    }
  };

  const aoAutenticarComSucesso = () => {
    definirUsuario(servicoAutenticacao.obterUsuarioAtual());
    definirEstaAutenticado(true);
  };

  const aoSair = () => {
    servicoAutenticacao.sair();
    definirUsuario(null);
    definirEstaAutenticado(false);
    definirPedidos([]);
  };

  const aoAtualizarStatus = async (idPedido, novoStatus) => {
    try {
      const pedidoAtualizado = await servicoPedidos.atualizarStatusPedido(idPedido, novoStatus);
      definirPedidos(pedidos.map(p => p.id === idPedido ? pedidoAtualizado : p));
      if (pedidoSelecionado && pedidoSelecionado.id === idPedido) {
        definirPedidoSelecionado(pedidoAtualizado);
      }
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const aoCriarPedido = (novoPedido) => {
    definirPedidos([novoPedido, ...pedidos]);
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const nomeCliente = pedido.nomeCliente || pedido.customerName || '';
    const endereco = pedido.enderecoEntrega || pedido.deliveryAddress || '';
    const codigo = (pedido.codigo || pedido.id || '').toString();
    const termoLower = termoBusca.toLowerCase();

    const combinaBusca = nomeCliente.toLowerCase().includes(termoLower) ||
                          endereco.toLowerCase().includes(termoLower) ||
                          codigo.toLowerCase().includes(termoLower);
    const combinaStatus = filtroStatus === 'ALL' || pedido.status === filtroStatus;
    return combinaBusca && combinaStatus;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <Navbar
        usuario={usuario}
        aoSair={aoSair}
        aoAbrirNovoPedido={() => definirModalCriacaoAberto(true)}
      />

      {/* Conteúdo Principal */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {!estaAutenticado ? (
          <AuthModal aoAutenticarComSucesso={aoAutenticarComSucesso} />
        ) : (
          <>
            {/* Estatísticas */}
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
                    onChange={(e) => definirFiltroStatus(e.target.value)}
                    className="form-input"
                    style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '10px' }}
                  >
                    <option value="ALL">Todos os Status</option>
                    <option value="RECEBIDO">RECEBIDO</option>
                    <option value="EM_PREPARO">EM_PREPARO</option>
                    <option value="SAIU_PARA_ENTREGA">SAIU_PARA_ENTREGA</option>
                    <option value="ENTREGUE">ENTREGUE</option>
                    <option value="CANCELADO">CANCELADO</option>
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
                  <span>{erro} (Certifique-se de que a API Spring Boot está rodando em http://localhost:8100)</span>
                </div>
                <button onClick={carregarPedidos} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Grid de Pedidos */}
            {carregando && pedidos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                Carregando pedidos...
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {pedidosFiltrados.map((pedido) => (
                  <OrderCard
                    key={pedido.id}
                    pedido={pedido}
                    aoClicar={(p) => definirPedidoSelecionado(p)}
                    aoAtualizarStatus={aoAtualizarStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modais */}
      {modalCriacaoAberto && (
        <CreateOrderModal
          aoFechar={() => definirModalCriacaoAberto(false)}
          aoCriarPedido={aoCriarPedido}
        />
      )}

      {pedidoSelecionado && (
        <OrderDetailModal
          pedido={pedidoSelecionado}
          aoFechar={() => definirPedidoSelecionado(null)}
          aoAtualizarStatus={aoAtualizarStatus}
        />
      )}
    </div>
  );
}
