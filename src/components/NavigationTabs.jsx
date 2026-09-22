import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { TrendingUp, Package, Users, UserCheck, Truck, XCircle, UtensilsCrossed, History, Store } from 'lucide-react';

export function NavigationTabs({ perfil, abaAtiva, aoSelecionarAba }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const abasPorPerfil = {
    ADMIN: [
      { id: 'DASHBOARD', label: 'Dashboard & BI', icon: TrendingUp },
      { id: 'PEDIDOS', label: 'Pedidos', icon: Package },
      { id: 'CARDAPIO', label: 'Cardápio', icon: UtensilsCrossed },
      { id: 'USUARIOS', label: 'Usuários & Clientes', icon: Users },
      { id: 'CANCELAMENTOS', label: 'Cancelamentos', icon: XCircle },
      { id: 'CONFIGURACOES', label: 'Operações & Loja', icon: Store },
    ],
    RESTAURANTE: [
      { id: 'PEDIDOS', label: 'Pedidos em Tempo Real', icon: Package },
      { id: 'CARDAPIO', label: 'Gestão do Cardápio', icon: UtensilsCrossed },
      { id: 'CANCELAMENTOS', label: 'Pedidos Cancelados', icon: XCircle },
      { id: 'CONFIGURACOES', label: 'Operações & Loja', icon: Store },
    ],
    ENTREGADOR: [
      { id: 'ENTREGAS', label: 'Entregas', icon: Truck },
      { id: 'CARDAPIO', label: 'Cardápio', icon: UtensilsCrossed },
    ],
    CLIENTE: [
      { id: 'CARDAPIO', label: 'Cardápio / Fazer Pedido', icon: UtensilsCrossed },
      { id: 'PEDIDOS', label: 'Meus Pedidos', icon: Package },
      { id: 'HISTORICO', label: 'Histórico', icon: History },
    ],
  };

  const abas = abasPorPerfil[perfil] || abasPorPerfil.CLIENTE;

  const atualizarIndicador = () => {
    const el = tabRefs.current[abaAtiva];
    const container = containerRef.current;
    if (el && container) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  };

  useLayoutEffect(() => {
    atualizarIndicador();
  }, [abaAtiva, perfil]);

  useEffect(() => {
    atualizarIndicador();
    const handleResize = () => atualizarIndicador();
    window.addEventListener('resize', handleResize);

    const timeout = setTimeout(atualizarIndicador, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [abaAtiva, perfil]);

  return (
    <div
      ref={containerRef}
      className="nav-tabs-container desktop-nav-tabs"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--bg-card)',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '28px',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Sliding Pill Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          bottom: '6px',
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
          borderRadius: '12px',
          transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 14px rgba(211, 1, 1, 0.4)',
          opacity: indicatorStyle.opacity,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {abas.map((aba) => {
        const Icone = aba.icon;
        const estaAtiva = abaAtiva === aba.id;

        return (
          <button
            key={aba.id}
            ref={(el) => {
              if (el) tabRefs.current[aba.id] = el;
            }}
            onClick={() => aoSelecionarAba(aba.id)}
            type="button"
            className="nav-tab-btn-animated"
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: estaAtiva ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: estaAtiva ? 700 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.25s ease',
            }}
          >
            <Icone size={18} />
            <span>{aba.label}</span>
          </button>
        );
      })}
    </div>
  );
}
