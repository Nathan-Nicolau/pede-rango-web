// Utilitário de Alerta Sonoro usando Web Audio API (sem dependência de arquivos externos)

let audioCtx = null;

function obterAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Desbloqueia o AudioContext no primeiro clique do usuário na página
if (typeof window !== 'undefined') {
  const desbloquearAudio = () => {
    try {
      const ctx = obterAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch {}
    window.removeEventListener('click', desbloquearAudio);
    window.removeEventListener('keydown', desbloquearAudio);
    window.removeEventListener('touchstart', desbloquearAudio);
  };

  window.addEventListener('click', desbloquearAudio, { once: true });
  window.addEventListener('keydown', desbloquearAudio, { once: true });
  window.addEventListener('touchstart', desbloquearAudio, { once: true });
}

/**
 * Toca um sinal sonoro agradável e nítido de novo pedido (Chime de cozinha 3 notas)
 */
export function tocarAlertaNovoPedido() {
  try {
    const ctx = obterAudioContext();
    if (!ctx) return;

    const agora = ctx.currentTime;
    const notas = [
      { freq: 587.33, inicio: 0, duracao: 0.15 },    // D5
      { freq: 739.99, inicio: 0.15, duracao: 0.15 }, // F#5
      { freq: 880.00, inicio: 0.30, duracao: 0.45 }, // A5
    ];

    notas.forEach(({ freq, inicio, duracao }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, agora + inicio);

      // Envelope de amplitude (Ataque rápido e decaimento suave)
      gain.gain.setValueAtTime(0.001, agora + inicio);
      gain.gain.exponentialRampToValueAtTime(0.3, agora + inicio + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + inicio + duracao);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(agora + inicio);
      osc.stop(agora + inicio + duracao + 0.05);
    });
  } catch (err) {
    console.warn('Não foi possível reproduzir som de alerta de pedido:', err);
  }
}
