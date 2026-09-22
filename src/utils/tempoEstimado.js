/**
 * Utilitários para previsão e cálculo dinâmico de tempo de entrega
 */

/**
 * Calcula a janela de horário estimada de entrega (ex: "19:40 - 19:55 (30-45 min)")
 */
export function calcularJanelaEntrega(dataBase, tempoMinMinutos = 30, tempoMaxMinutos = 45) {
  const base = dataBase ? new Date(dataBase) : new Date();
  if (isNaN(base.getTime())) return `${tempoMinMinutos}-${tempoMaxMinutos} min`;

  const dataMin = new Date(base.getTime() + tempoMinMinutos * 60 * 1000);
  const dataMax = new Date(base.getTime() + tempoMaxMinutos * 60 * 1000);

  const formatarHoraMinuto = (d) => {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    janelaHorario: `${formatarHoraMinuto(dataMin)} - ${formatarHoraMinuto(dataMax)}`,
    tempoEstimadoMinutos: `${tempoMinMinutos}-${tempoMaxMinutos} min`,
    textoCompleto: `${formatarHoraMinuto(dataMin)} - ${formatarHoraMinuto(dataMax)} (${tempoMinMinutos}-${tempoMaxMinutos} min)`
  };
}

/**
 * Calcula o progresso e tempo decorrido de um pedido em produção/entrega
 */
export function calcularProgressoEntrega(criadoEm, tempoMaxMinutos = 45) {
  if (!criadoEm) return null;
  const inicio = new Date(criadoEm).getTime();
  if (isNaN(inicio)) return null;

  const agora = Date.now();
  const minutosDecorridos = Math.max(0, Math.floor((agora - inicio) / (60 * 1000)));
  const minutosRestantes = Math.max(0, tempoMaxMinutos - minutosDecorridos);
  const atrasado = minutosDecorridos > tempoMaxMinutos;
  const porcentagem = Math.min(100, Math.round((minutosDecorridos / tempoMaxMinutos) * 100));

  return {
    minutosDecorridos,
    minutosRestantes,
    atrasado,
    porcentagem
  };
}
