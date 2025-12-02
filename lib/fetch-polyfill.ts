// Polyfill e helpers para melhor compatibilidade cross-browser

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed') ||
      error.name === 'TypeError' && error.message.includes('fetch')
    );
  }
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.message.includes('timeout');
  }
  return false;
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isTimeoutError(error)) {
    return 'Tempo limite excedido. A imagem pode ser muito grande ou o servidor está lento. Tente com uma imagem menor.';
  }
  
  if (isNetworkError(error)) {
    return 'Erro de conexão. Verifique: 1) Sua conexão com a internet, 2) Se você está usando HTTPS, 3) Se o servidor está acessível.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido ao processar a imagem.';
}

// Função para testar conectividade com o servidor
export async function testServerConnection(apiUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { success: true, message: 'Servidor acessível' };
    } else {
      return { success: false, message: `Servidor retornou erro ${response.status}` };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, message: 'Timeout ao conectar com o servidor' };
    }
    return { success: false, message: 'Não foi possível conectar com o servidor' };
  }
}
