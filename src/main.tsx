
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
