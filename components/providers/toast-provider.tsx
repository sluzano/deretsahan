'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
        },
        success: {
          iconTheme: {
            primary: '#16A34A',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
