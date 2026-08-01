import React from 'react';
import { Utensils, LogOut, Plus, User } from 'lucide-react';

export function Navbar({ usuario, aoSair, aoAbrirNovoPedido }) {
  const nomeExibicao = usuario?.nome || usuario?.name || usuario?.email || 'Usuário';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #D30101 0%, #9e0000 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(211, 1, 1, 0.3)'
          }}>
            <Utensils color="#ffffff" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>
              FoodDelivery <span style={{ color: 'var(--primary-accent)', fontSize: '0.9rem', fontWeight: 600 }}>WEB</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Gestão de Pedidos em Tempo Real</p>
          </div>
        </div>

        {/* Controles de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {usuario ? (
            <>
              <button onClick={aoAbrirNovoPedido} className="btn-primary">
                <Plus size={18} /> Novo Pedido
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '16px',
                borderLeft: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-accent)',
                    fontWeight: 'bold'
                  }}>
                    <User size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{nomeExibicao}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{usuario.email}</span>
                  </div>
                </div>

                <button
                  onClick={aoSair}
                  title="Sair da conta"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#D30101'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
