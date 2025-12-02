'use client';

import { DetectionResult, ProcessImageResponse } from '@/lib/types';
import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CropComparison from './CropComparison';
import CropDisplay from './CropDisplay';

interface ResultDisplayProps {
  result: ProcessImageResponse;
  imageUrl: string;
}

export default function ResultDisplay({ result, imageUrl }: ResultDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropViewMode, setCropViewMode] = useState<'interactive' | 'comparison'>('interactive');

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    const drawBoundingBoxes = () => {
      // Set canvas size to match image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw masks and bounding boxes
      result.detections.forEach((detection: DetectionResult) => {
        const { bbox, confidence, class_name, has_mask, segmentation } = detection;

        // Determine color based on confidence
        let color = '#22c55e'; // green
        let rgbaColor = 'rgba(34, 197, 94, 0.3)'; // green with transparency
        if (confidence <= 0.5) {
          color = '#ef4444'; // red
          rgbaColor = 'rgba(239, 68, 68, 0.3)';
        } else if (confidence <= 0.7) {
          color = '#eab308'; // yellow
          rgbaColor = 'rgba(234, 179, 8, 0.3)';
        }

        // Draw segmentation mask if available
        if (has_mask && segmentation && segmentation.length > 0) {
          ctx.beginPath();
          
          // Move to first point
          const firstPoint = segmentation[0];
          ctx.moveTo(firstPoint[0], firstPoint[1]);
          
          // Draw lines to all other points
          for (let i = 1; i < segmentation.length; i++) {
            const point = segmentation[i];
            ctx.lineTo(point[0], point[1]);
          }
          
          // Close the path
          ctx.closePath();
          
          // Fill the mask with semi-transparent color
          ctx.fillStyle = rgbaColor;
          ctx.fill();
          
          // Draw the mask outline
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Draw rectangle if no mask available
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(bbox.x1, bbox.y1, bbox.width, bbox.height);
        }

        // Draw label background
        const label = `${class_name} ${(confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 16px Arial';
        const textMetrics = ctx.measureText(label);
        const textHeight = 20;
        const padding = 4;

        ctx.fillStyle = color;
        ctx.fillRect(
          bbox.x1,
          bbox.y1 - textHeight - padding,
          textMetrics.width + padding * 2,
          textHeight + padding
        );

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, bbox.x1 + padding, bbox.y1 - padding);
      });
    };

    if (img.complete) {
      drawBoundingBoxes();
    } else {
      img.onload = drawBoundingBoxes;
    }
  }, [result, imageUrl]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Data inválida';
    
    try {
      // Verificar se a data está no formato ISO (YYYY-MM-DD)
      const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
      }
      
      // Se não estiver no formato ISO, retornar a string original
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Image with bounding boxes */}
      <div className="relative w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Original"
          className="hidden"
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      {/* OCR Results Display */}
      {result.ocr_results && result.ocr_results.length > 0 && (
        <div className="space-y-4">
          {/* Toggle between view modes */}
          {result.ocr_results.length > 1 && (
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border-2 border-gray-300 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setCropViewMode('interactive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    cropViewMode === 'interactive'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  📱 Visualização Interativa
                </button>
                <button
                  onClick={() => setCropViewMode('comparison')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    cropViewMode === 'comparison'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  🔍 Comparação Lado a Lado
                </button>
              </div>
            </div>
          )}

          {/* Render appropriate view */}
          {cropViewMode === 'interactive' ? (
            <CropDisplay ocrResults={result.ocr_results} />
          ) : (
            <CropComparison ocrResults={result.ocr_results} />
          )}
        </div>
      )}

      {/* Best date card */}
      {result.best_date && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-500">
          <div className="flex items-start gap-3 mb-3">
            <Calendar className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Melhor Data Encontrada
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatDate(result.best_date.date)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {result.best_date.is_expired !== null && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  result.best_date.is_expired
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {result.best_date.is_expired ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Expirado
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Válido
                  </>
                )}
              </span>
            )}

            {result.best_date.days_until_expiry !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Clock className="w-4 h-4" />
                {result.best_date.days_until_expiry > 0
                  ? `${result.best_date.days_until_expiry} dias restantes`
                  : `Expirou há ${Math.abs(result.best_date.days_until_expiry)} dias`}
              </span>
            )}

            {result.best_date.format && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Formato: {result.best_date.format}
              </span>
            )}

            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Confiança: {(result.best_date.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* All dates */}
      {result.dates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Todas as Datas Encontradas ({result.dates.length})
          </h3>
          <div className="flex flex-col gap-3">
            {result.dates.map((date, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(date.date)}
                  </p>
                  {date.format && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {date.format}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {date.is_expired !== null && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        date.is_expired
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {date.is_expired ? 'Expirado' : 'Válido'}
                    </span>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {(date.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detections info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Detecções ({result.detections.length})
        </h3>
        <div className="flex flex-col gap-2">
          {result.detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {detection.class_name}
                </span>
                {detection.has_mask && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    ✓ Segmentação disponível
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(detection.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status message */}
      <div
        className={`p-4 rounded-lg ${
          result.status === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : result.status === 'partial'
            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}
      >
        <p className="text-sm font-medium">{result.message}</p>
        <p className="text-xs mt-1">
          Processado em: {new Date(result.processed_at).toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}
