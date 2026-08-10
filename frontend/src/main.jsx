import React from 'react'
import ReactDOM from 'react-dom/client'
// 1. Importa QueryClient y QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// 2. Crea una instancia del cliente fuera del componente
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Envuelve tu app con el QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)