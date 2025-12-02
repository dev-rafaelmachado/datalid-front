'use client';

import { Camera, Image as ImageIcon } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        disabled={disabled}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <button
        onClick={() => cameraInputRef.current?.click()}
        disabled={disabled}
        className="flex items-center justify-center gap-3 w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors active:scale-95"
      >
        <Camera className="w-6 h-6" />
        <span>Tirar Foto</span>
      </button>

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
