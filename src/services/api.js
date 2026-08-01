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
    const mensagemErro = dados?.message || (typeof dados === 'string' ? dados : 'Erro na requisição');
    throw new Error(mensagemErro);
  }

  return dados;
}

export const servicoAutenticacao = {
  entrar: async (email, senha) => {
    const dados = await requisitarApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
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
        nome,
        email,
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
    return await requisitarApi('/orders');
  },

  obterPedidoPorId: async (id) => {
    return await requisitarApi(`/orders/${id}`);
  },

  criarPedido: async (dadosPedido) => {
    return await requisitarApi('/orders', {
      method: 'POST',
      body: JSON.stringify(dadosPedido),
    });
  },

  atualizarStatusPedido: async (id, status) => {
    return await requisitarApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Aliases para compatibilidade se necessário
export const authService = servicoAutenticacao;
export const orderService = servicoPedidos;
export const apiFetch = requisitarApi;
