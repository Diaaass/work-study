import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { BookmarksProvider } from '@/context/BookmarksContext';
import App from './App';
import '@/i18n';
import '@/styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BookmarksProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BookmarksProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
