# Pede Rango WEB

Essa aplicação, desenvolvida com React + Vite, permite o acesso visual ao sistema do **Pede Rango** integrando com a API, com autenticação por login e adaptação de tela conforme o perfil do usuário.

Na versão base, a aplicação atendia os seguintes itens:
* Criar novos pedidos
* Visualizar pedidos e seus andamentos
* Visualizar os entregadores

### Funções da Aplicação e Perfis
* **Visão do Cliente** - Navegação pelo cardápio, criação de pedidos com escolha de forma de pagamento, acompanhamento do status em tempo real, repetição de pedido anterior com 1 clique e avaliação do pedido após a entrega.
* **Visão do Restaurante (Operação / Cozinha)** - Controle da fila de pedidos do dia, avanço de status de preparo, pausa rápida de itens esgotados no cardápio, alerta sonoro de novos pedidos e impressão de comanda.
* **Visão do Entregador** - Fila de pedidos prontos para entrega, confirmação de saída/entrega e botão de contato rápido com o cliente via WhatsApp.
* **Visão do Administrador** - Acesso completo à operação, gestão de cardápio, entregadores, clientes, usuários, configurações da loja e Dashboard com métricas.

### Melhorias e Adições Técnicas em relação à versão base

* **Cardápio Interativo e Sacola de Compras**  
  - Adicionada filtragem por categorias, busca de produtos, botão direto "Pedir Esse", observações por item e bloqueio visual quando um produto está pausado no dia ("Esgotado hoje").
* **Checkout com ViaCEP, Formas de Pagamento e Troco**  
  - Preenchimento automático do endereço ao digitar o CEP, exibição da taxa de entrega vigente e suporte a `Dinheiro` (com cálculo automático de troco), `PIX` (com cópia rápida da chave) e `Cartão`.
* **Linha do Tempo do Pedido (Stepper) e Reorder**  
  - Visualização clara das 5 etapas do pedido (`Recebido` até `Entregue`) com previsão dinâmica de horário, além da opção de refazer um pedido anterior em 1 clique.
* **Gestão de Expediente da Loja**  
  - Controle operacional para abrir o dia de trabalho, pausar temporariamente o recebimento de novos pedidos em momentos de pico e encerrar o expediente (bloqueando novos pedidos quando a loja está fechada).
* **Alerta Sonoro (Web Audio API) e Impressão de Comanda**  
  - Sincronização periódica em segundo plano com aviso sonoro quando chega pedido novo na cozinha, e gerador de comanda formatado para impressoras térmicas (80mm) ou folha comum.
* **Dashboard Administrativo e Exportação CSV**  
  - Painel gerencial com indicadores de faturamento, ticket médio, taxa de cancelamento, nota média de satisfação (1 a 5 estrelas) e exportação de relatório em arquivo CSV.
* **Tema Dark / Light e Responsividade**  
  - Identidade visual padronizada na cor do Pede Rango (`#D30101`), com alternância entre tema claro e escuro e layout responsivo para desktop e celular.

**React + Vite**  
Utilizados para construir uma interface rápida, modular e reativa, comunicando diretamente com a API REST e gerenciando a sessão do usuário via token JWT.

**Docker + Nginx**  
O projeto possui um `Dockerfile` multi-stage que realiza o build da aplicação React com Node e empacota os arquivos finais em um servidor Nginx Alpine leve, pronto para rodar em qualquer ambiente.

**Kubernetes (Kind + Helm)**  
Conta também com o script `./deploy-local.sh` para gerar a imagem Docker, importar no cluster Kubernetes local e atualizar o deployment automaticamente (em conjunto com o repositório `pede-rango-infra`).

### Executando

**Opção 1 — Rodando em modo de desenvolvimento local:**
Com a API rodando na porta `8100`, basta instalar as dependências e subir o servidor do Vite:
```shell
npm install
npm run dev
```
A aplicação ficará disponível em `http://localhost:5173`.

**Opção 2 — Rodando via Docker Compose (junto com API e Banco):**
Através do repositório `pede-rango-infra`, é possível subir todo o ambiente de uma vez:
```shell
docker compose up -d --build
```

**Opção 3 — Deploy no Cluster Kubernetes Local (Kind):**
Com o cluster ativo, basta executar na raiz deste projeto:
```shell
./deploy-local.sh
```

### Credenciais de Acesso Padrão
Ao subir a API, o banco já é populado automaticamente com os usuários abaixo para teste de cada visão do sistema (a senha padrão para todos é **`123456`**):

| Perfil | E-mail | Senha | O que testar na tela |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@pederango.com` | `123456` | Dashboard de métricas, configurações da loja, cardápio, entregadores, clientes e usuários |
| **Restaurante** | `restaurante@pederango.com` | `123456` | Abertura/pausa de expediente, fila de preparo de pedidos, alerta sonoro e impressão de comanda |
| **Entregador** | `entregador@pederango.com` | `123456` | Fila de entregas atribuídas, saída para entrega, conclusão e contato via WhatsApp |
| **Cliente** | `cliente@pederango.com` | `123456` | Cardápio, criação/repetição de pedidos, acompanhamento de status e avaliação de entregas |

### Gitflow para versionamento
 - Criação de branchs para Desenvolvimento contínuo, simulando um cenário real.
