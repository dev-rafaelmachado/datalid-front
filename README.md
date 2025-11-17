# 📱 Detector de Validade - Mobile First

Aplicação web mobile-first para detecção automática de datas de validade em produtos usando inteligência artificial.

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (ícones)

## ⚙️ Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (ou edite o existente):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Importante:** Certifique-se de que sua API backend está rodando na porta 8000.

### 3. Executar o servidor de desenvolvimento

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado.

## 📁 Estrutura do Projeto

```
├── app/
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout root
│   └── globals.css       # Estilos globais (Tailwind)
├── components/
│   ├── ImageUploader.tsx    # Componente de upload/câmera
│   ├── ImagePreview.tsx     # Preview da imagem
│   ├── LoadingSpinner.tsx   # Indicador de carregamento
│   └── ResultDisplay.tsx    # Exibição de resultados com bounding boxes
├── lib/
│   ├── api.ts           # Funções de API e utilitários
│   └── types.ts         # Tipos TypeScript
└── .env.local           # Variáveis de ambiente (não commitado)
```

## 🎯 Funcionalidades

### ✨ Interface Mobile-First
- Design responsivo otimizado para celular
- Interface limpa e intuitiva
- Botões grandes e fáceis de tocar
- Suporte a dark mode

### 📸 Captura de Imagem
- **Tirar foto:** Usa a câmera do dispositivo
- **Escolher da galeria:** Seleciona foto existente
- **Preview:** Visualização antes de processar
- **Compressão automática:** Redimensiona para max 1920px
- **Validação:** JPEG, PNG, BMP (max 10MB)

### 🔍 Processamento
- Envia imagem para API via POST `/process`
- Loading visual durante processamento
- Tratamento de erros (400, 413, 500)

### 📊 Exibição de Resultados
- **Bounding boxes coloridos:**
  - 🟢 Verde: confidence > 70%
  - 🟡 Amarelo: confidence 50-70%
  - 🔴 Vermelho: confidence < 50%
- **Melhor data destacada** com badge de status
- **Todas as datas encontradas** listadas
- **Informações de detecção** com confidence
- **Status de expiração** (dias até expirar)

## 🔌 API Backend

### Endpoint Principal

```
POST http://localhost:8000/process
Content-Type: multipart/form-data
```

### Parâmetros

```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('return_visualization', 'false');
formData.append('return_crops', 'false');
formData.append('return_full_ocr', 'false');
```

### Resposta Esperada

```typescript
{
  status: 'success' | 'partial' | 'failed',
  message: string,
  detections: DetectionResult[],
  dates: ParsedDate[],
  best_date: ParsedDate | null,
  processed_at: string
}
```

## 🎨 Personalização

### Alterar URL da API

Edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://sua-api.com
```

### Estilos

Os estilos usam Tailwind CSS v4. Edite:
- `app/globals.css` - Variáveis CSS e temas
- Componentes individuais - Classes Tailwind inline

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Executar build
pnpm start

# Lint
pnpm lint
```

## 🐛 Resolução de Problemas

### API não responde
- Verifique se o backend está rodando em `localhost:8000`
- Confirme o `NEXT_PUBLIC_API_URL` no `.env.local`

### Erro de CORS
- Configure CORS no backend para aceitar `http://localhost:3000`

### Imagem não processa
- Verifique o formato (JPEG, PNG, BMP)
- Confirme que o tamanho é < 10MB
- Teste com uma imagem menor primeiro

## 📄 Licença

Projeto desenvolvido para TCC - Detecção de Datas de Validade
