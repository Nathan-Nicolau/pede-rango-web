import React, { useState } from 'react';
import { Package, UtensilsCrossed, Plus, History, Truck, User, MoreHorizontal, XCircle, Users, LogOut, Sun, Moon, TrendingUp, Store } from 'lucide-react';

export function BottomNav({
  usuario,
  abaAtiva,
  definirAbaAtiva,
  aoAbrirNovoPedido,
  aoAbrirPerfil,
  aoSair,
  tema,
  aoAlternarTema
}) {
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const perfil = usuario?.perfil || 'CLIENTE';

  if (!usuario) return null;

  const aoClicarAba = (nomeAba) => {
    definirAbaAtiva(nomeAba);
    setMenuMaisAberto(false);
  };

  return (
    <>
      {/* Menu 'Mais' / Bottom Sheet no Mobile */}
      {menuMaisAberto && (
        <div 
          className="bottom-sheet-overlay"
          onClick={() => setMenuMaisAberto(false)}
        >
          <div 
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bottom-sheet-drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Opções de Gestão
              </h3>
              <button
                type="button"
                onClick={aoAlternarTema}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {tema === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#a855f7" />}
                {tema === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {perfil === 'ADMIN' && (
                <>
                  <button
                    type="button"
                    onClick={() => aoClicarAba('DASHBOARD')}
                    className={`sheet-menu-item ${abaAtiva === 'DASHBOARD' ? 'active' : ''}`}
                  >
                    <TrendingUp size={22} color="var(--primary-accent)" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => aoClicarAba('USUARIOS')}
                    className={`sheet-menu-item ${abaAtiva === 'USUARIOS' ? 'active' : ''}`}
                  >
                    <Users size={22} color="var(--info)" />
                    <span>Usuários</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => aoClicarAba('CANCELAMENTOS')}
                    className={`sheet-menu-item ${abaAtiva === 'CANCELAMENTOS' ? 'active' : ''}`}
                  >
                    <XCircle size={22} color="var(--danger)" />
                    <span>Cancelados</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => aoClicarAba('CONFIGURACOES')}
                    className={`sheet-menu-item ${abaAtiva === 'CONFIGURACOES' ? 'active' : ''}`}
                  >
                    <Store size={22} color="#f59e0b" />
                    <span>Operações</span>
                  </button>
                </>
              )}

              {perfil === 'RESTAURANTE' && (
                <>
                  <button
                    type="button"
                    onClick={() => aoClicarAba('CANCELAMENTOS')}
                    className={`sheet-menu-item ${abaAtiva === 'CANCELAMENTOS' ? 'active' : ''}`}
                  >
                    <XCircle size={22} color="var(--danger)" />
                    <span>Cancelados</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => aoClicarAba('CONFIGURACOES')}
                    className={`sheet-menu-item ${abaAtiva === 'CONFIGURACOES' ? 'active' : ''}`}
                  >
                    <Store size={22} color="#f59e0b" />
                    <span>Operações</span>
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setMenuMaisAberto(false); aoAbrirPerfil(); }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <User size={16} /> Meu Perfil
              </button>
              <button
                type="button"
                onClick={() => { setMenuMaisAberto(false); aoSair(); }}
                className="btn-danger"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior Fixa (Mobile) */}
      <nav className="mobile-bottom-nav">
        {perfil === 'CLIENTE' && (
          <>
            <button
              type="button"
              onClick={() => aoClicarAba('PEDIDOS')}
              className={`bottom-nav-btn ${abaAtiva === 'PEDIDOS' ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('CARDAPIO')}
              className={`bottom-nav-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}
            >
              <UtensilsCrossed size={20} />
              <span>Cardápio</span>
            </button>

            {/* Botão Central de Novo Pedido (FAB) */}
            <button
              type="button"
              onClick={aoAbrirNovoPedido}
              className="bottom-nav-fab"
              title="Pedir Agora"
            >
              <Plus size={24} color="#ffffff" strokeWidth={3} />
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('HISTORICO')}
              className={`bottom-nav-btn ${abaAtiva === 'HISTORICO' ? 'active' : ''}`}
            >
              <History size={20} />
              <span>Histórico</span>
            </button>

            <button
              type="button"
              onClick={aoAbrirPerfil}
              className="bottom-nav-btn"
            >
              <User size={20} />
              <span>Perfil</span>
            </button>
          </>
        )}

        {perfil === 'ADMIN' && (
          <>
            <button
              type="button"
              onClick={() => aoClicarAba('PEDIDOS')}
              className={`bottom-nav-btn ${abaAtiva === 'PEDIDOS' ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('USUARIOS')}
              className={`bottom-nav-btn ${abaAtiva === 'USUARIOS' ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Usuários</span>
            </button>

            {/* Botão Central de Novo Pedido (FAB) */}
            <button
              type="button"
              onClick={aoAbrirNovoPedido}
              className="bottom-nav-fab"
              title="Novo Pedido"
            >
              <Plus size={24} color="#ffffff" strokeWidth={3} />
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('CARDAPIO')}
              className={`bottom-nav-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}
            >
              <UtensilsCrossed size={20} />
              <span>Cardápio</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuMaisAberto(!menuMaisAberto)}
              className={`bottom-nav-btn ${menuMaisAberto ? 'active' : ''}`}
            >
              <MoreHorizontal size={20} />
              <span>Mais</span>
            </button>
          </>
        )}

        {perfil === 'RESTAURANTE' && (
          <>
            <button
              type="button"
              onClick={() => aoClicarAba('PEDIDOS')}
              className={`bottom-nav-btn ${abaAtiva === 'PEDIDOS' ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('CARDAPIO')}
              className={`bottom-nav-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}
            >
              <UtensilsCrossed size={20} />
              <span>Cardápio</span>
            </button>

            {/* Botão Central de Novo Pedido (FAB) */}
            <button
              type="button"
              onClick={aoAbrirNovoPedido}
              className="bottom-nav-fab"
              title="Novo Pedido"
            >
              <Plus size={24} color="#ffffff" strokeWidth={3} />
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('CONFIGURACOES')}
              className={`bottom-nav-btn ${abaAtiva === 'CONFIGURACOES' ? 'active' : ''}`}
            >
              <Store size={20} />
              <span>Loja</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuMaisAberto(!menuMaisAberto)}
              className={`bottom-nav-btn ${menuMaisAberto ? 'active' : ''}`}
            >
              <MoreHorizontal size={20} />
              <span>Mais</span>
            </button>
          </>
        )}

        {perfil === 'ENTREGADOR' && (
          <>
            <button
              type="button"
              onClick={() => aoClicarAba('ENTREGAS')}
              className={`bottom-nav-btn ${abaAtiva === 'ENTREGAS' ? 'active' : ''}`}
            >
              <Truck size={22} />
              <span>Entregas</span>
            </button>

            <button
              type="button"
              onClick={() => aoClicarAba('CARDAPIO')}
              className={`bottom-nav-btn ${abaAtiva === 'CARDAPIO' ? 'active' : ''}`}
            >
              <UtensilsCrossed size={22} />
              <span>Cardápio</span>
            </button>

            <button
              type="button"
              onClick={aoAbrirPerfil}
              className="bottom-nav-btn"
            >
              <User size={22} />
              <span>Meu Perfil</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
}
