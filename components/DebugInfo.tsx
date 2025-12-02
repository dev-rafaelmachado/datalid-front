'use client';

import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

export default function DebugInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const deviceInfo = useMemo(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return {};
    }

    const nav = navigator as NavigatorWithMemory;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connectionType: nav.connection?.effectiveType,
      connectionDownlink: nav.connection?.downlink,
      connectionRTT: nav.connection?.rtt,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Mostrar informações de debug"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-auto">
      <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4" />
          Debug Info
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      <div className="p-4">
        <div className="space-y-2 text-xs">
          {Object.entries(deviceInfo).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {key}:
              </span>
              <span className="text-gray-600 dark:text-gray-400 break-all">
                {value !== undefined && value !== null ? String(value) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              console.log('=== DEVICE INFO ===');
              console.log(deviceInfo);
              console.log('===================');
              alert('Informações copiadas para o console (F12)');
            }}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Copiar para Console
          </button>
        </div>
      </div>
    </div>
  );
}
