'use client';

import { OCRResult } from '@/lib/types';

interface CropComparisonProps {
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

export default function CropComparison({ ocrResults }: CropComparisonProps) {
  if (!ocrResults || ocrResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Comparação: Original vs Pré-processado
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Compare todas as detecções lado a lado para visualizar o efeito do pré-processamento
      </p>

      <div className="space-y-6">
        {ocrResults.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Detecção {index + 1}
              </span>
              <span className="text-xs text-gray-500">
                ({result.engine} - {(result.confidence * 100).toFixed(1)}% confiança)
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Original */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                <div className="bg-white rounded-lg p-2 border border-gray-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getBase64ImageSrc(result.crop_original_base64)}
                    alt={`Crop ${index + 1} - Original`}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-500 hidden md:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <div className="md:hidden w-full h-8 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>

              {/* Preprocessed */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pré-processado</p>
                <div className="bg-white rounded-lg p-2 border border-gray-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getBase64ImageSrc(result.crop_processed_base64)}
                    alt={`Crop ${index + 1} - Pré-processado`}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* OCR Text */}
            {result.text && (
              <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-800 mb-1">Texto Extraído:</p>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {result.text}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
