'use client';

import ImagePreview from '@/components/ImagePreview';
import ImageUploader from '@/components/ImageUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultDisplay from '@/components/ResultDisplay';
import { compressImage, processImage, validateImageFile } from '@/lib/api';
import { ProcessImageResponse } from '@/lib/types';
import { AlertTriangle, RotateCcw, ScanLine } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessImageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido');
      return;
    }

    // Compress image
    try {
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(compressedFile);
      setImageUrl(url);
      setResult(null);
    } catch (err) {
      setError('Erro ao processar a imagem. Tente novamente.');
      console.error(err);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await processImage(selectedFile);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setSelectedFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScanLine className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Detector de Validade
            </h1>
          </div>
          {(selectedFile || result) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!selectedFile && !result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Envie uma Foto
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tire uma foto ou selecione da galeria para detectar datas de validade
              </p>
            </div>
            <ImageUploader onImageSelect={handleImageSelect} disabled={isProcessing} />
          </div>
        )}

        {/* Preview and Process Section */}
        {selectedFile && imageUrl && !result && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Imagem Selecionada
              </h2>
              <ImagePreview imageUrl={imageUrl} onRemove={handleReset} />
            </div>

            {!isProcessing && (
              <button
                onClick={handleProcess}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors active:scale-95 flex items-center justify-center gap-3"
              >
                <ScanLine className="w-6 h-6" />
                <span>Processar Imagem</span>
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isProcessing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <LoadingSpinner message="Analisando a imagem..." />
          </div>
        )}

        {/* Results */}
        {result && imageUrl && !isProcessing && (
          <div className="space-y-6">
            <ResultDisplay result={result} imageUrl={imageUrl} />
            
            <button
              onClick={handleReset}
              className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg rounded-lg shadow-lg transition-colors active:scale-95 flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Processar Nova Imagem</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Detector de Validade - Identifique datas de validade em produtos</p>
      </footer>
    </div>
  );
}
