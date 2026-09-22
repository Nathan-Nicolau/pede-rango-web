/**
 * Utilitários para integração e abertura de conversas no WhatsApp
 */

export function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.toString().replace(/\D/g, '');
}

export function formatarNumeroWhatsapp(telefone) {
  const digitos = limparTelefone(telefone);
  if (!digitos) return '';
  // Se não tem código de país (55 para Brasil), adiciona
  if (digitos.length === 10 || digitos.length === 11) {
    return `55${digitos}`;
  }
  return digitos;
}

export function gerarLinkWhatsapp(telefone, mensagem = '') {
  const numeroFormatado = formatarNumeroWhatsapp(telefone);
  if (!numeroFormatado) return '#';
  const urlBase = `https://wa.me/${numeroFormatado}`;
  if (mensagem && mensagem.trim()) {
    return `${urlBase}?text=${encodeURIComponent(mensagem.trim())}`;
  }
  return urlBase;
}

export function abrirWhatsapp(telefone, mensagem = '') {
  const link = gerarLinkWhatsapp(telefone, mensagem);
  if (link && link !== '#') {
    window.open(link, '_blank', 'noopener,noreferrer');
  }
}
