#!/usr/bin/env bash
set -e

# ==============================================================================
# Script de Deploy Local - Pede Rango Web (React + Vite + Nginx)
# ==============================================================================

# Cores para saída no terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações do ambiente
CLUSTER_NAME="meu-cluster-local"
RELEASE_NAME="pede-rango-web"
CHART_DIR="./k8s-chart"
IMAGE_NAME="pede-rango-web"
DEFAULT_TAG="v3"

# Diretório base do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Função para exibir ajuda
show_help() {
  echo -e "${BLUE}Uso:${NC} ./deploy-local.sh [OPÇÃO | TAG]"
  echo ""
  echo -e "${YELLOW}Opções principais:${NC}"
  echo "  (sem argumentos)   Executa o ciclo completo (build, carga no Kind e deploy) usando a tag padrão '${DEFAULT_TAG}'"
  echo "  <TAG>              Executa o ciclo completo com uma tag específica (ex: ./deploy-local.sh v4)"
  echo ""
  echo -e "${YELLOW}Subcomandos utilitários:${NC}"
  echo "  status             Exibe o status dos pods, services e ingress do Frontend"
  echo "  logs               Acompanha os logs em tempo real do pod do Frontend"
  echo "  restart            Reinicia o deployment do Frontend forçadamente"
  echo "  uninstall          Remove o release Helm do cluster"
  echo "  help | -h | --help Exibe esta mensagem de ajuda"
}

# Tratamento de subcomandos
case "$1" in
  help|-h|--help)
    show_help
    exit 0
    ;;
  status)
    echo -e "${BLUE}==> Verificando status do Frontend no cluster Kind...${NC}"
    kubectl get pods,svc,ingress -l app=pede-rango-web
    exit 0
    ;;
  logs)
    echo -e "${BLUE}==> Acompanhando logs do Frontend (Ctrl+C para sair)...${NC}"
    kubectl logs -f -l app=pede-rango-web --tail=50
    exit 0
    ;;
  restart)
    echo -e "${BLUE}==> Reiniciando o deployment do Frontend...${NC}"
    kubectl rollout restart deployment/pede-rango-web
    kubectl rollout status deployment/pede-rango-web --timeout=60s
    exit 0
    ;;
  uninstall)
    echo -e "${YELLOW}==> Desinstalando release Helm '${RELEASE_NAME}'...${NC}"
    helm uninstall "$RELEASE_NAME"
    exit 0
    ;;
esac

TAG="${1:-$DEFAULT_TAG}"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE} Iniciando Build & Deploy: ${GREEN}${IMAGE_NAME}:${TAG}${NC}"
echo -e "${BLUE} Cluster Kind: ${YELLOW}${CLUSTER_NAME}${NC}"
echo -e "${BLUE} Release Helm: ${YELLOW}${RELEASE_NAME}${NC}"
echo -e "${BLUE}================================================================${NC}"

# 1. Build da Imagem Docker
echo -e "\n${BLUE}[1/4] Gerando imagem Docker (${IMAGE_NAME}:${TAG})...${NC}"
docker build -t "${IMAGE_NAME}:${TAG}" .

# 2. Carregando diretamente no cluster Kind via pipe stream
echo -e "\n${BLUE}[2/4] Transmitindo imagem para o nó do Kind '${CLUSTER_NAME}-control-plane'...${NC}"
docker save "${IMAGE_NAME}:${TAG}" | docker exec -i "${CLUSTER_NAME}-control-plane" ctr --namespace=k8s.io images import -

# 3. Deploy / Upgrade via Helm
echo -e "\n${BLUE}[3/4] Aplicando upgrade/install no Helm com a tag '${TAG}'...${NC}"
helm upgrade --install "$RELEASE_NAME" "$CHART_DIR" \
  --set web.image="$IMAGE_NAME" \
  --set web.tag="$TAG"

# 4. Verificação de Saúde do Rollout
echo -e "\n${BLUE}[4/4] Aguardando inicialização completa do Frontend...${NC}"
kubectl rollout restart deployment/pede-rango-web
kubectl rollout status deployment/pede-rango-web --timeout=60s

echo -e "\n${GREEN}✔ Deploy do Frontend concluído com sucesso!${NC}"
echo -e "Endpoint local: ${YELLOW}http://app.pede-rango.local${NC}"
