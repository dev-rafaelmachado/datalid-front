import { getUserFriendlyErrorMessage } from './fetch-polyfill';
import { ProcessImageResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function processImage(file: File): Promise<ProcessImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('return_visualization', 'true');
  formData.append('return_crops', 'true');
  formData.append('return_full_ocr', 'true');
  formData.append('return_crop_images', 'true');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout

    const response = await fetch(`${API_URL}/process`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 400) {
        throw new Error('Arquivo inválido. Envie uma imagem válida (JPEG, PNG, BMP).');
      } else if (response.status === 413) {
        throw new Error('Imagem muito grande. O tamanho máximo é 10MB.');
      } else if (response.status === 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde.');
      } else {
        throw new Error(`Erro ao processar imagem: ${errorText}`);
      }
    }

    return response.json();
  } catch (error) {
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
}

export function compressImage(file: File, maxWidth: number = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Redimensionar se necessário
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Não foi possível comprimir a imagem'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/bmp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Use JPEG, PNG ou BMP.',
    };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Imagem muito grande. O tamanho máximo é 10MB.',
    };
  }
  
  return { valid: true };
}
