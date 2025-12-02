'use client';

import { testServerConnection } from '@/lib/fetch-polyfill';
import { useState } from 'react';

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const testResult = await testServerConnection(apiUrl);
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar conexão'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        🔧 Teste de Conexão
      </h3>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
        Se estiver tendo problemas, clique no botão abaixo para testar a conexão com o servidor.
      </p>
      
      <button
        onClick={handleTest}
        disabled={testing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
      >
        {testing ? 'Testando...' : 'Testar Conexão'}
      </button>

      {result && (
        <div className={`mt-3 p-3 rounded text-sm ${
          result.success
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300'
        }`}>
          <p className="font-medium mb-1">
            {result.success ? '✅ Sucesso' : '❌ Falhou'}
          </p>
          <p className="text-xs">{result.message}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
        <p className="font-medium mb-1">Servidor configurado:</p>
        <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
          {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
        </code>
      </div>
    </div>
  );
}
