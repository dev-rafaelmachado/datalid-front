'use client';

import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export default function ImagePreview({ imageUrl, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-contain"
        />
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors active:scale-95"
        aria-label="Remover imagem"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
