# Sistema Integrado de Marketing de Afiliados

Um sistema completo de automação para marketing de afiliados no TikTok, incluindo web scraping, geração automática de vídeos e upload automatizado.

## 🚀 Funcionalidades

### Web Scraping
- **Plataformas Suportadas**: Hotmart, Eduzz, KiwiPay
- **Coleta Automática**: Produtos, preços, descrições, links de afiliado
- **Monitoramento**: Mudanças de preço e disponibilidade
- **Validação**: Dados coletados antes do armazenamento
- **Rate Limiting**: Controle de requisições para evitar bloqueios

### Geração de Vídeos
- **Formato**: 9:16 (1080x1920px) otimizado para TikTok
- **Duração**: 15-60 segundos configurável
- **Elementos**:
  - Hook nos primeiros 3 segundos
  - Call-to-action no final
  - Música de fundo
  - Narração via TTS
  - Transições suaves
  - Thumbnails otimizadas

### Automação TikTok
- **Upload Automático**: Via TikTok API v2
- **Agendamento**: Horários estratégicos configuráveis
- **Métricas**: Monitoramento de engajamento
- **Hashtags**: Geração automática contextual
- **Descrições**: Templates personalizáveis

### Dashboard de Controle
- **Interface Web**: Controle completo do sistema
- **Métricas em Tempo Real**: Performance e status
- **Configurações**: Parâmetros de automação
- **Logs**: Monitoramento detalhado
- **Alertas**: Notificações de falhas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **Selenium WebDriver** para scraping
- **FFmpeg** para edição de vídeo
- **Canvas API** para geração de frames
- **Axios** para requisições HTTP
- **Winston** para logging
- **Node-cron** para agendamento

### Frontend
- **React** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Vite** como bundler

### APIs Externas
- **TikTok API v2** para upload
- **ElevenLabs/Google TTS** para narração
- **Plataformas de Afiliados** para links

## 📦 Instalação

### Pré-requisitos
```bash
# Node.js 18+
node --version

# FFmpeg
ffmpeg -version

# Chrome/Chromium (para Selenium)
google-chrome --version
```

### Configuração
```bash
# Clone o repositório
git clone <repository-url>
cd affiliate-marketing-automation

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Crie os diretórios necessários
mkdir -p data logs generated_videos temp
```

### Variáveis de Ambiente
```env
# TikTok API
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token

# IDs de Afiliado
HOTMART_AFFILIATE_ID=your_hotmart_id
EDUZZ_AFFILIATE_ID=your_eduzz_id
KIWIPAY_AFFILIATE_ID=your_kiwipay_id
```

## 🚀 Uso

### Iniciar o Sistema Completo
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

### Executar Componentes Individualmente

#### Web Scraping
```bash
# Scraping manual
npm run scraper "marketing digital" "curso online"

# Via API
curl -X POST http://localhost:3001/api/products/scrape \
  -H "Content-Type: application/json" \
  -d '{"searchTerms": ["marketing digital", "curso online"]}'
```

#### Geração de Vídeos
```bash
# Geração manual
npm run video-generator

# Via API
curl -X POST http://localhost:3001/api/videos/generate \
  -H "Content-Type: application/json" \
  -d '{"productId": "product_id_here"}'
```

#### Upload TikTok
```bash
# Upload manual
npm run tiktok-uploader

# Via API
curl -X POST http://localhost:3001/api/tiktok/upload \
  -H "Content-Type: application/json" \
  -d '{"videoId": "video_id_here"}'
```

### Automação Completa
```bash
# Iniciar automação
curl -X POST http://localhost:3001/api/automation/start

# Verificar status
curl http://localhost:3001/api/automation/status

# Parar automação
curl -X POST http://localhost:3001/api/automation/stop
```

## 📊 API Endpoints

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products/scrape` - Executar scraping
- `PUT /api/products/:id/status` - Atualizar status

### Vídeos
- `GET /api/videos` - Listar vídeos
- `POST /api/videos/generate` - Gerar vídeo

### TikTok
- `POST /api/tiktok/upload` - Upload imediato
- `POST /api/tiktok/schedule` - Agendar postagem
- `GET /api/tiktok/metrics/:id` - Métricas do vídeo

### Automação
- `GET /api/automation/status` - Status do sistema
- `POST /api/automation/start` - Iniciar automação
- `POST /api/automation/stop` - Parar automação

### Analytics
- `GET /api/analytics/overview` - Visão geral

## 🔧 Configuração Avançada

### Agendamento Personalizado
```javascript
// backend/scheduler/automation.js
const config = {
  scraping: {
    schedule: '0 */6 * * *', // A cada 6 horas
    searchTerms: ['marketing digital', 'curso online']
  },
  posting: {
    schedule: '0 9-21/3 * * *', // A cada 3h das 9h às 21h
    maxPostsPerDay: 8
  }
};
```

### Templates de Vídeo
```javascript
// backend/video/generator.js
const videoTemplates = {
  promotional: {
    duration: 30,
    style: 'energetic',
    callToAction: 'strong'
  },
  educational: {
    duration: 45,
    style: 'informative',
    callToAction: 'subtle'
  }
};
```

## 📈 Métricas de Performance

### Objetivos do Sistema
- ✅ **99.9% uptime** do sistema
- ✅ **< 5 minutos** tempo de geração de vídeo
- ✅ **< 1%** taxa de erro
- ✅ **20+ posts/dia** automáticos
- ✅ **< 200ms** tempo de resposta API

### Monitoramento
```bash
# Logs em tempo real
tail -f logs/combined.log

# Métricas específicas
tail -f logs/scraper.log
tail -f logs/video.log
tail -f logs/tiktok.log
```

## 🛡️ Segurança

### Medidas Implementadas
- **Criptografia** de credenciais de API
- **Rate limiting** para evitar bloqueios
- **HTTPS** para todas as conexões
- **Validação** rigorosa de inputs
- **Logs de auditoria** completos

### Boas Práticas
```javascript
// Rotação de User-Agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'
];

// Delays aleatórios
const delay = Math.random() * (4000 - 2000) + 2000;
```

## 🔍 Troubleshooting

### Problemas Comuns

#### Selenium WebDriver
```bash
# Instalar Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
apt-get update && apt-get install -y google-chrome-stable
```

#### FFmpeg
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Baixar de https://ffmpeg.org/download.html
```

#### Permissões de Arquivo
```bash
# Criar diretórios com permissões corretas
mkdir -p data logs generated_videos temp
chmod 755 data logs generated_videos temp
```

### Logs de Debug
```bash
# Ativar logs detalhados
export NODE_ENV=development
export DEBUG=*

# Verificar conectividade
curl -I https://hotmart.com
curl -I https://www.eduzz.com
curl -I https://kiwipay.com.br
```

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico:
- 📧 Email: support@example.com
- 💬 Discord: [Link do servidor]
- 📖 Documentação: [Link da documentação]

---

**⚠️ Aviso Legal**: Este sistema é para fins educacionais. Certifique-se de cumprir os termos de serviço das plataformas utilizadas e as leis locais sobre marketing de afiliados.