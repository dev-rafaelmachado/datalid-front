# 🧪 Guia de Teste - Exibição de Crops

## 📋 Pré-requisitos

1. Backend rodando em `http://localhost:8000`
2. Frontend rodando em `http://localhost:3000` (ou porta configurada)
3. API configurada para retornar `crop_original_base64` e `crop_processed_base64`

## 🧪 Cenários de Teste

### Teste 1: Upload Básico

**Passos:**
1. Acesse a aplicação
2. Faça upload de uma imagem com data de validade
3. Clique em "Processar Imagem"

**Resultado Esperado:**
- ✅ Imagem processada com sucesso
- ✅ Componente "Pipeline de Processamento" visível
- ✅ Crops originais e pré-processados carregados

### Teste 2: Toggle Original ↔ Pré-processado

**Passos:**
1. Após processar uma imagem
2. Localize o toggle "Original" / "Pré-processado"
3. Clique para alternar entre as visualizações

**Resultado Esperado:**
- ✅ Imagem muda suavemente entre original e pré-processada
- ✅ Botão ativo tem cor azul
- ✅ Texto indicativo correto ("Imagem Original" ou "Imagem Pré-processada")

### Teste 3: Múltiplos Crops

**Passos:**
1. Use uma imagem com múltiplas datas de validade
2. Processe a imagem

**Resultado Esperado:**
- ✅ Botões de seleção de crops aparecem (Crop 1, Crop 2, etc.)
- ✅ Ao clicar em cada botão, a imagem e texto OCR mudam
- ✅ Contador "Crop X de Y" atualiza corretamente

### Teste 4: Modo Comparação

**Passos:**
1. Após processar imagem com múltiplos crops
2. Clique no toggle "🔍 Comparação Lado a Lado"

**Resultado Esperado:**
- ✅ Interface muda para mostrar todas as detecções
- ✅ Cada detecção mostra Original → Pré-processado lado a lado
- ✅ Setas indicativas entre as imagens
- ✅ Texto OCR de cada detecção exibido

### Teste 5: Informações do OCR

**Passos:**
1. Após processar uma imagem
2. Verifique o card de informações do OCR

**Resultado Esperado:**
- ✅ Engine exibida (easyocr, tesseract, etc.)
- ✅ Confiança em porcentagem (ex: 95.0%)
- ✅ Tempo de processamento em segundos (ex: 0.523s)

### Teste 6: Texto Extraído

**Passos:**
1. Após processar uma imagem
2. Localize o card "Texto Extraído (OCR)"

**Resultado Esperado:**
- ✅ Texto formatado em fonte mono (monospace)
- ✅ Quebras de linha preservadas
- ✅ Background verde claro
- ✅ Se não houver texto, mostra "Nenhum texto detectado"

### Teste 7: Pipeline Visual

**Passos:**
1. Após processar uma imagem
2. Localize o card "Pipeline de Processamento"

**Resultado Esperado:**
- ✅ 5 etapas listadas:
  1. Detecção da região de interesse
  2. Crop da área detectada
  3. Pré-processamento (binarização, denoising)
  4. Extração de texto via OCR
  5. Parsing de data e validação
- ✅ Bullets roxos para cada etapa

### Teste 8: Erros de Carregamento

**Passos:**
1. Simule um erro (base64 inválido ou vazio)
2. Verifique o comportamento

**Resultado Esperado:**
- ✅ Mensagem de erro aparece no console
- ✅ Imagem não quebra a interface
- ✅ Mensagem "Erro ao carregar imagem" exibida (se aplicável)

### Teste 9: Responsividade

**Passos:**
1. Redimensione a janela do navegador
2. Teste em diferentes tamanhos

**Resultado Esperado:**
- ✅ Layout se adapta a telas pequenas (mobile)
- ✅ Grid de 2 colunas vira 1 coluna em mobile
- ✅ Botões e textos legíveis em todas as resoluções

### Teste 10: Dark Mode (se configurado)

**Passos:**
1. Ative o dark mode do sistema
2. Recarregue a aplicação

**Resultado Esperado:**
- ✅ Cores se adaptam ao dark mode
- ✅ Contraste adequado
- ✅ Textos legíveis

## 🐛 Depuração

### Se as imagens não carregarem:

1. **Verifique o console do navegador:**
   ```javascript
   // Deve aparecer algo como:
   // "Erro ao carregar imagem: ..."
   ```

2. **Verifique a resposta da API:**
   - Abra as DevTools (F12)
   - Vá em "Network" → Encontre a requisição `/process`
   - Verifique se `ocr_results` contém `crop_original_base64` e `crop_processed_base64`

3. **Verifique o formato do base64:**
   ```javascript
   // No console:
   console.log(result.ocr_results[0].crop_original_base64.substring(0, 50));
   // Deve começar com "iVBORw0KGgo..." ou "data:image/png;base64,iVBORw0KGgo..."
   ```

4. **Teste a string base64 manualmente:**
   - Copie a string base64 da resposta
   - Cole em um validador online (ex: https://codebeautify.org/base64-to-image-converter)
   - Verifique se a imagem é válida

### Problemas Comuns:

| Problema | Possível Causa | Solução |
|----------|---------------|---------|
| Imagem não aparece | Base64 inválido | Verifique resposta da API |
| Texto "undefined" | API não retornou texto | Verifique campo `text` em `ocr_results` |
| Sem crops | API não retornou crops | Verifique `return_crop_images=true` |
| Layout quebrado | Classes Tailwind incorretas | Verifique console por erros CSS |
| Erro de tipo | Tipagem incorreta | Verifique `lib/types.ts` |

## ✅ Checklist de Teste

- [ ] Upload e processamento funcionam
- [ ] Toggle Original/Pré-processado funciona
- [ ] Seletor de múltiplos crops funciona
- [ ] Modo comparação funciona
- [ ] Informações do OCR exibidas corretamente
- [ ] Texto OCR formatado corretamente
- [ ] Pipeline visual exibida
- [ ] Tratamento de erros funciona
- [ ] Layout responsivo
- [ ] Performance adequada

## 📊 Resultado Esperado Final

Após processar uma imagem, você deve ver:

```
┌─────────────────────────────────────────┐
│ [Imagem com Bounding Boxes]             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Pipeline de Processamento               │
│                                         │
│ [Crop 1] [Crop 2]                       │
│ [Original] [Pré-processado]             │
│                                         │
│ ┌──────────┐  ┌─────────────────┐      │
│ │  Crop    │  │ Texto OCR:      │      │
│ │  Image   │  │ VALIDADE:       │      │
│ │          │  │ 20/12/2025      │      │
│ └──────────┘  └─────────────────┘      │
│                                         │
│ Engine: easyocr | Confiança: 95%       │
│ Tempo: 0.523s                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Melhor Data Encontrada                  │
│ 20/12/2025                              │
│ [Válido] [365 dias restantes]           │
└─────────────────────────────────────────┘
```

---

**Dica**: Use imagens de teste com diferentes qualidades e múltiplas datas para testar todos os cenários!
