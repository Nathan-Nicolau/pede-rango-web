import React, { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone, Flame } from 'lucide-react';

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [exibirPrompt, setExibirPrompt] = useState(false);
  const [ehIos, setEhIos] = useState(false);
  const [ehModoStandalone, setEhModoStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando instalado como App Standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setEhModoStandalone(isStandalone);

    if (isStandalone) return;

    // Detecta se foi dispensado recentemente
    const dispensado = localStorage.getItem('pede_rango_pwa_dismissed');
    if (dispensado && Date.now() - parseInt(dispensado, 10) < 1000 * 60 * 60 * 24 * 3) {
      // Dispensado nos últimos 3 dias
      return;
    }

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setEhIos(isIosDevice);

    // Captura evento de instalação nativo (Chrome / Android / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setExibirPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // No iOS, se não for standalone, exibe o prompt após 3 segundos
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setExibirPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const aoInstalar = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setExibirPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const aoDispensar = () => {
    setExibirPrompt(false);
    localStorage.setItem('pede_rango_pwa_dismissed', Date.now().toString());
  };

  if (!exibirPrompt || ehModoStandalone) return null;

  return (
    <div className="pwa-install-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="pwa-install-icon">
          <Flame size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Instalar Pede Rango
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {ehIos 
              ? 'Toque no ícone Compartilhar ⎋ e "Adicionar à Tela de Início"'
              : 'Acesse mais rápido direto da sua tela inicial'
            }
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!ehIos && deferredPrompt && (
          <button 
            onClick={aoInstalar}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
          >
            <Download size={14} /> Instalar
          </button>
        )}
        <button
          onClick={aoDispensar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dispensar"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
