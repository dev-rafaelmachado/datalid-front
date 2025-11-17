'use client';

import { OCRResult } from '@/lib/types';
import { useState } from 'react';

interface CropDisplayProps {
  ocrResults: OCRResult[];
}

// Helper function to ensure base64 images have the correct format
function getBase64ImageSrc(base64String: string): string {
  if (!base64String) {
    return '';
  }
  // If the string already starts with data:image, return as is
  if (base64String.startsWith('data:image')) {
    return base64String;
  }
  // Otherwise, add the prefix
  return `data:image/png;base64,${base64String}`;
}

export default function CropDisplay({ ocrResults }: CropDisplayProps) {
  const [selectedCrop, setSelectedCrop] = useState<number>(0);
  const [showPreprocessed, setShowPreprocessed] = useState(false);

  if (!ocrResults || ocrResults.length === 0) {
    return null;
  }

  const currentResult = ocrResults[selectedCrop];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Pipeline de Processamento
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Visualize os crops detectados e o pré-processamento aplicado antes da leitura OCR
      </p>

      {/* Seletor de Crops */}
      {ocrResults.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detecção Selecionada ({ocrResults.length} encontrada{ocrResults.length > 1 ? 's' : ''})
          </label>
          <div className="flex gap-2 flex-wrap">
            {ocrResults.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedCrop(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCrop === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Crop {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle entre Original e Pré-processado */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
          <button
            onClick={() => setShowPreprocessed(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !showPreprocessed
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setShowPreprocessed(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              showPreprocessed
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pré-processado
          </button>
        </div>
      </div>

      {/* Exibição da Imagem do Crop */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {showPreprocessed ? 'Imagem Pré-processada' : 'Imagem Original'}
              </span>
              <span className="text-xs text-gray-500">
                Crop {selectedCrop + 1} de {ocrResults.length}
              </span>
            </div>
            <div className="bg-white rounded-lg p-2 shadow-inner">
              <div className="relative w-full" style={{ minHeight: '150px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getBase64ImageSrc(showPreprocessed ? currentResult.crop_processed_base64 : currentResult.crop_original_base64)}
                  alt={showPreprocessed ? 'Crop pré-processado' : 'Crop original'}
                  className="w-full h-auto rounded border border-gray-200"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', e);
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const errorMsg = document.createElement('div');
                      errorMsg.className = 'text-red-500 text-sm p-4 text-center';
                      errorMsg.textContent = 'Erro ao carregar imagem';
                      parent.appendChild(errorMsg);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Informações do OCR */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-2">Informações do OCR</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-gray-600">Engine:</span>{' '}
                <span className="font-mono font-medium text-black">{currentResult.engine}</span>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <span className="text-gray-600">Confiança:</span>{' '}
                <span className="font-mono font-medium text-black">{(currentResult.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-white rounded px-2 py-1 col-span-2">
                <span className="text-gray-600">Tempo:</span>{' '}
                <span className="font-mono font-medium text-black">{currentResult.processing_time.toFixed(3)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Texto OCR Extraído */}
        <div className="space-y-3">
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 h-full">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium text-green-800">Texto Extraído (OCR)</span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-inner min-h-[150px]">
              {currentResult.text ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {currentResult.text}
                </pre>
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhum texto detectado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparação lado a lado (opcional) */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => setShowPreprocessed(!showPreprocessed)}
          className="w-full bg-linear-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
        >
          {showPreprocessed ? '← Ver Imagem Original' : 'Ver Imagem Pré-processada →'}
        </button>
      </div>
    </div>
  );
}
