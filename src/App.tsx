import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthInitializer } from '@/components/AuthInitializer';

// ─── App ──────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                border: '1px solid #e4e3ff',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-color, #1a1829)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                duration: 6000,
              },
            }}
          />
        </AuthInitializer>
      </ThemeProvider>

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
};

export default App;
