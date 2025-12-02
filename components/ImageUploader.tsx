'use client';

import { AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { ChangeEvent, useMemo, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Detecta se é iOS
  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('[ImageUploader] Arquivo selecionado:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isFromCamera: e.target === cameraInputRef.current
      });
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isIOS}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Botão de câmera - desabilitado no iOS */}
      {isIOS ? (
        <div className="flex flex-col gap-2 w-full p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">
              Câmera desabilitada no iPhone
            </span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Para melhor compatibilidade, use o botão &quot;Escolher da Galeria&quot; abaixo.
            Você pode tirar a foto pelo app de câmera do iPhone e depois selecioná-la.
          </p>
        </div>
      ) : (
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center justify-center gap-3 w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors active:scale-95"
        >
          <Camera className="w-6 h-6" />
          <span>Tirar Foto</span>
        </button>
      )}

      <button
        onClick={() => galleryInputRef.current?.click()}
        disabled={disabled}
        className="flex items-center justify-center gap-3 w-full h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors active:scale-95"
      >
        <ImageIcon className="w-6 h-6" />
        <span>Escolher da Galeria</span>
      </button>
    </div>
  );
}
