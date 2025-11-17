'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Processando...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}
