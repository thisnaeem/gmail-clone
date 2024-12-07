'use client';

import { ThemeProvider } from '../context/ThemeContext';
import AuthProvider from '../context/AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
} 