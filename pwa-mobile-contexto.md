# 📱 Contexto de Implementação: PWA & Mobile-First — Pede Rango WEB

Este documento registra todas as alterações de arquitetura, identidade visual, responsividade mobile e suporte a **Progressive Web App (PWA)** implementadas no projeto **Pede Rango WEB** (`pede-rango-web`).

---

## 🎯 1. Decisão de Arquitetura (Por que PWA & Mobile-First?)

Em vez de criar uma aplicação separada em React Native (que exigiria outro pipeline de build e rodaria fora do cluster Kubernetes), optou-se pela estratégia **Mobile-First / PWA**:
- **Base de Código Única**: O mesmo frontend React + Vite + Nginx atende Desktop e Smartphones.
- **Experiência Nativa sem Lojas de Apps**: Permite instalação na tela inicial (*Add to Home Screen*) no iOS (Safari) e Android (Chrome), abrindo em modo tela cheia (*standalone*) sem a barra de endereços do navegador.
- **Integração Total com Kubernetes**: Deploy mantido via Helm e Ingress NGINX no cluster local Kind.

---

## 🔥 2. Nova Identidade Visual (Pede Rango)

- **Nome da Marca**: `Pede Rango` com slogan *"Sabor & Entrega Rápida"*.
- **Novo Ícone de Marca**: Substituição do ícone de talheres genérico pelo ícone **`Flame` (Chama Estilizada)** em gradiente carmesim (`#FF2E2E` a `#900000`) com acentos dourados (`#FFD700`), transmitindo calor, dinamismo e apetite.
- **Novo Favicon Vetorial**: Criado em `public/favicon.svg` com alta definição e suporte a temas.
- **Renomeação de Projetos**:
  - `food-delivery-api` ➡️ `pede-rango-api`
  - `food-delivery-web` ➡️ `pede-rango-web`

---

## 📲 3. Estrutura do Progressive Web App (PWA)

### 📄 `public/manifest.json`
Define os metadados para instalação nos smartphones:
```json
{
  "short_name": "Pede Rango",
  "name": "Pede Rango — Sabor & Delivery",
  "description": "Aplicativo de Delivery e Gestão de Pedidos Pede Rango",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#121214",
  "theme_color": "#D30101",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "64x64 128x128 192x192 512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### ⚙️ `public/sw.js` (Service Worker)
- Estratégia de **Cache App Shell**: Pré-cacheia arquivos essenciais (`/`, `index.html`, `favicon.svg`, `manifest.json`).
- Estratégia **Network-First**: Garante que requisições de API (`/actuator/`, endpoints de pedidos) sempre consultem a rede em tempo real.
- Registro automático em `src/main.jsx`.

### 🌐 `index.html` (Meta Tags Mobile & iOS)
- `viewport-fit=cover` para adaptação aos cantos arredondados e notches de celulares modernos.
- `apple-mobile-web-app-capable` e `apple-mobile-web-app-status-bar-style: black-translucent`.

---

## 🧭 4. Navegação Mobile: Bottom Navigation Bar (`BottomNav.jsx`)

Para telas menores que `768px`, as abas superiores do topo são ocultadas (`.desktop-nav-tabs { display: none }`) e substituídas por uma **Barra de Navegação Inferior Fixa**:

```
┌────────────────────────────────────────────────────────┐
│ [LOGO] Pede Rango               (🌓 Tema) [👤 Perfil]  │  <-- Header Compacto
├────────────────────────────────────────────────────────┤
│                                                        │
│                  Conteúdo da Aplicação                 │
│                                                        │
├────────────────────────────────────────────────────────┤
│   📦         🍔          ➕          📜         👤    │  <-- BottomNav com FAB
│ Pedidos   Cardápio   Novo Pedido  Histórico   Perfil   │
└────────────────────────────────────────────────────────┘
```

### Comportamento Dinâmico por Perfil:
1. **CLIENTE**:
   - `📦 Pedidos`: Acompanhamento de pedidos ativos.
   - `🍔 Cardápio`: Navegação e escolha de produtos.
   - `➕ Botão FAB Central`: Botão flutuante em gradiente com destaque para solicitar novo pedido rapidamente.
   - `📜 Histórico`: Histórico completo de pedidos anteriores.
   - `👤 Perfil`: Acesso e edição de endereço padrão e telefone.
2. **ADMINISTRADOR**:
   - `📦 Pedidos`, `🚚 Entregadores`, `➕ Novo Pedido (FAB)`, `🍔 Cardápio` e `⚡ Mais` (abre *Bottom Sheet* com Cancelados, Usuários, Clientes e Perfil).
3. **ENTREGADOR**:
   - `🚚 Entregas`, `🍔 Cardápio`, `👤 Perfil`.

---

## 📐 5. Ajustes de CSS e Responsividade (`src/index.css`)

- **Touch Targets**: Botões e inputs com altura mínima de `44px` para toques precisos.
- **Safe Area Insets**: Suporte a `env(safe-area-inset-bottom)` garantindo espaçamento ideal em aparelhos com barra de navegação virtual (iPhones modernos e Androids com gestos).
- **Modais Adaptativos**:
  - Em telas pequenas, modais como `AuthModal`, `CreateOrderModal` e `OrderDetailModal` ocupam a largura total com rolagem suave, ocultando elementos decorativos secundários (ex: carrossel lateral) para focar na digitação.

---

## 🌐 6. Configuração de DNS e Ingress

- **Hosts Locais (`/etc/hosts`)**:
  - `127.0.0.1 app.pede-rango.local`
  - `127.0.0.1 api.pede-rango.local`
- **Variável de Ambiente Frontend (`.env`)**:
  - `VITE_API_URL=http://api.pede-rango.local`

---

## 🚀 7. Como Testar e Fazer Deploy

```bash
cd ~/Documentos/Projetos/pede-rango-web

# Executar build e deploy automático no cluster Kind:
./deploy-local.sh

# Acessar a aplicação no navegador ou inspecionar em modo celular (DevTools F12 -> Toggle Device):
# http://app.pede-rango.local
```
