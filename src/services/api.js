const URL_BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8100';

export async function requisitarApi(endpoint, opcoes = {}) {
  const token = localStorage.getItem('token');

  const cabecalhos = {
    'Content-Type': 'application/json',
    ...(opcoes.headers || {}),
  };

  if (token) {
    cabecalhos['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${URL_BASE_API}${endpoint}`, {
    ...opcoes,
    headers: cabecalhos,
  });

  const tipoConteudo = resposta.headers.get('content-type');
  let dados = null;
  if (tipoConteudo && tipoConteudo.includes('application/json')) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    if (resposta.status === 403 || resposta.status === 401) {
      if (token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }

    let mensagemErro = dados?.mensagem || dados?.message;
    if (dados?.errosValidacao && typeof dados.errosValidacao === 'object') {
      const detalhesValidacao = Object.values(dados.errosValidacao).join('; ');
      if (detalhesValidacao) {
        mensagemErro = mensagemErro ? `${mensagemErro} (${detalhesValidacao})` : detalhesValidacao;
      }
    }
    if (!mensagemErro) {
      mensagemErro = dados?.erro || (typeof dados === 'string' ? dados : `Erro ${resposta.status}: Requisição inválida`);
    }

    throw new Error(mensagemErro);
  }

  return dados;
}

export const servicoAutenticacao = {
  entrar: async (email, senha) => {
    const dados = await requisitarApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email ? email.trim() : '', senha }),
    });
    if (dados && dados.token) {
      localStorage.setItem('token', dados.token);
      localStorage.setItem('user', JSON.stringify({
        nome: dados.email ? dados.email.split('@')[0] : 'Usuário',
        email: dados.email,
        perfil: dados.perfil
      }));
    }
    return dados;
  },

  cadastrar: async (nome, email, senha) => {
    const dados = await requisitarApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome: nome ? nome.trim() : '',
        email: email ? email.trim() : '',
        senha,
        perfil: 'CLIENTE'
      }),
    });
    if (dados && dados.token) {
      localStorage.setItem('token', dados.token);
      localStorage.setItem('user', JSON.stringify({
        nome: nome || (dados.email ? dados.email.split('@')[0] : 'Usuário'),
        email: dados.email,
        perfil: dados.perfil
      }));
    }
    return dados;
  },

  sair: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  obterUsuarioAtual: () => {
    const usuarioStr = localStorage.getItem('user');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  },

  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  },
};

export const servicoPedidos = {
  obterTodosPedidos: async () => {
    return await requisitarApi('/pedidos/listar-pedidos');
  },

  obterPedidoPorId: async (id) => {
    return await requisitarApi(`/pedidos/${id}`);
  },

  criarPedido: async (dadosPedido) => {
    return await requisitarApi('/pedidos', {
      method: 'POST',
      body: JSON.stringify(dadosPedido),
    });
  },

  atualizarStatusPedido: async (id, status) => {
    return await requisitarApi(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Aliases para compatibilidade
export const authService = servicoAutenticacao;
export const orderService = servicoPedidos;
export const apiFetch = requisitarApi;
