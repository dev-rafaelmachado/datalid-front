import { getUserFriendlyErrorMessage } from './fetch-polyfill';
import { ProcessImageResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Detecta se está rodando no iOS/iPhone
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Detecta se está rodando no Safari
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Log info do dispositivo para debug
function logDeviceInfo() {
  if (typeof navigator === 'undefined') return;
  
  interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
  }
  
  console.log('[DeviceInfo]', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isIOS: isIOS(),
    isSafari: isSafari(),
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as NavigatorWithMemory).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints
  });
}

export async function processImage(file: File): Promise<ProcessImageResponse> {
  logDeviceInfo();
  
  console.log('[processImage] Iniciando processamento:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    timestamp: new Date().toISOString(),
    apiUrl: API_URL,
    isIOS: isIOS(),
    isSafari: isSafari()
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('return_visualization', 'true');
  formData.append('return_crops', 'true');
  formData.append('return_full_ocr', 'true');
  formData.append('return_crop_images', 'true');

  console.log('[processImage] FormData criado, iniciando fetch');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('[processImage] TIMEOUT após 60s');
      controller.abort();
    }, 60000); // 60 segundos timeout

    console.log('[processImage] Enviando requisição para:', `${API_URL}/process`);

    const response = await fetch(`${API_URL}/process`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    console.log('[processImage] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[processImage] Erro na resposta:', {
        status: response.status,
        errorText
      });
      
      if (response.status === 400) {
        throw new Error('Arquivo inválido. Envie uma imagem válida.');
      } else if (response.status === 413) {
        throw new Error('Imagem muito grande. O tamanho máximo é 10MB.');
      } else if (response.status === 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde.');
      } else {
        throw new Error(`Erro ao processar imagem: ${errorText}`);
      }
    }

    console.log('[processImage] Parseando JSON da resposta');
    const result = await response.json();
    console.log('[processImage] Sucesso! Resposta parseada:', {
      hasVisualization: !!result.visualization_image,
      cropsCount: result.crops?.length || 0
    });

    return result;
  } catch (error) {
    console.error('[processImage] Erro capturado:', {
      error,
      errorName: (error as Error)?.name,
      errorMessage: (error as Error)?.message,
      errorStack: (error as Error)?.stack
    });

    const friendlyMessage = getUserFriendlyErrorMessage(error);
    console.error('[processImage] Mensagem amigável:', friendlyMessage);
    throw new Error(friendlyMessage);
  }
}

export function compressImage(file: File, maxWidth: number = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    logDeviceInfo();
    
    console.log('[compressImage] Iniciando compressão:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      maxWidth,
      timestamp: new Date().toISOString(),
      isIOS: isIOS(),
      isSafari: isSafari()
    });

    // Para iOS, se o arquivo for HEIC/HEIF ou não tiver tipo definido,
    // tentamos processar mesmo assim
    if (isIOS() && (!file.type || file.type === '' || file.type.includes('heic') || file.type.includes('heif'))) {
      console.warn('[compressImage] iOS detectado com formato especial:', file.type || 'sem tipo');
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('[compressImage] FileReader.onload - Arquivo lido com sucesso');
      
      const img = new Image();
      
      // Adicionar timeout para detecção de problemas
      const timeoutId = setTimeout(() => {
        console.error('[compressImage] TIMEOUT ao carregar imagem após 30s');
        reject(new Error('Timeout ao processar imagem. Tente com uma imagem menor.'));
      }, 30000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('[compressImage] Image.onload - Imagem carregada:', {
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });

        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Redimensionar se necessário
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
            console.log('[compressImage] Redimensionando para:', { width, height });
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: false 
          });
          
          if (!ctx) {
            console.error('[compressImage] Erro ao criar contexto do canvas');
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }
          
          // Preencher fundo branco (importante para transparências)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Desenhar imagem
          ctx.drawImage(img, 0, 0, width, height);
          
          console.log('[compressImage] Imagem desenhada no canvas, iniciando conversão para blob');
          
          // Sempre converte para JPEG para garantir compatibilidade
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error('[compressImage] canvas.toBlob retornou null');
                reject(new Error('Não foi possível comprimir a imagem'));
                return;
              }
              
              console.log('[compressImage] Blob criado:', {
                blobSize: blob.size,
                blobType: blob.type,
                originalSize: file.size,
                compression: ((1 - blob.size / file.size) * 100).toFixed(2) + '%'
              });
              
              // Gera nome de arquivo com extensão .jpg
              const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              
              try {
                const compressedFile = new File([blob], fileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                console.log('[compressImage] File criado com sucesso:', {
                  name: compressedFile.name,
                  type: compressedFile.type,
                  size: compressedFile.size
                });
                
                resolve(compressedFile);
              } catch (error) {
                console.error('[compressImage] Erro ao criar File:', error);
                // Fallback: retornar arquivo original se falhar
                console.warn('[compressImage] Retornando arquivo original como fallback');
                resolve(file);
              }
            },
            'image/jpeg',
            0.9
          );
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[compressImage] Erro durante processamento:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('[compressImage] Image.onerror - Erro ao carregar imagem:', error);
        console.error('[compressImage] Detalhes do erro:', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          error
        });
        reject(new Error('Erro ao carregar imagem. Tente com outra imagem.'));
      };
      
      const dataUrl = e.target?.result as string;
      console.log('[compressImage] Definindo img.src com dataURL (primeiros 100 chars):', 
        dataUrl?.substring(0, 100));
      img.src = dataUrl;
    };
    
    reader.onerror = (error) => {
      console.error('[compressImage] FileReader.onerror:', error);
      console.error('[compressImage] Detalhes do erro do FileReader:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        error: reader.error
      });
      reject(new Error('Erro ao ler arquivo. Tente novamente.'));
    };
    
    console.log('[compressImage] Iniciando leitura do arquivo com FileReader');
    
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[compressImage] Erro ao chamar readAsDataURL:', error);
      reject(error);
    }
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  console.log('[validateImageFile] Validando arquivo:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  // Lista de extensões comuns de imagem (incluindo HEIC do iPhone)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif'];
  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  
  // Aceita qualquer tipo de imagem ou arquivos com extensões válidas
  // (iPhone às vezes não define o MIME type corretamente)
  const hasImageMimeType = file.type.startsWith('image/');
  const hasValidExtension = validExtensions.includes(fileExtension);
  const hasNoType = file.type === '';
  
  console.log('[validateImageFile] Validação de tipo:', {
    hasImageMimeType,
    hasValidExtension,
    hasNoType,
    fileExtension
  });
  
  if (!hasImageMimeType && !hasValidExtension && !hasNoType) {
    console.error('[validateImageFile] Tipo de arquivo inválido');
    return {
      valid: false,
      error: 'Por favor, selecione um arquivo de imagem.',
    };
  }
  
  // Verifica se o arquivo tem tamanho
  if (file.size === 0) {
    console.error('[validateImageFile] Arquivo vazio');
    return {
      valid: false,
      error: 'O arquivo está vazio.',
    };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    console.error('[validateImageFile] Arquivo muito grande:', file.size);
    return {
      valid: false,
      error: 'Imagem muito grande. O tamanho máximo é 10MB.',
    };
  }
  
  console.log('[validateImageFile] ✓ Arquivo válido');
  return { valid: true };
}
