import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend
} from 'recharts';

import { API_BASE_URL } from '../config';

// ============================================================================
// 1. CONFIGURACIÓN DE ENDPOINTS
// ============================================================================
const BASE_URL = API_BASE_URL;

const ENDPOINTS = {
  BUSCAR_CITAS: (fecha) => `${BASE_URL}/citas/citas/buscar?fecha=${fecha}`,
  PAGOS_COMPLETADOS: (fecha) => `${BASE_URL}/pagos/pagos/completados?fecha=${fecha}`,
  RESUMEN_CAJA: (fecha) => `${BASE_URL}/pagos/pagos/resumen-caja?fecha=${fecha}`,
  METRICAS_MES: `${BASE_URL}/pagos/pagos/metricas-mes`,
};

// ============================================================================
// 2. FUNCIONES DE PETICIÓN HTTP (Fetchers)
// ============================================================================
const fetchCitasPorFecha = async (fecha) => {
  const response = await fetch(ENDPOINTS.BUSCAR_CITAS(fecha));
  if (!response.ok) throw new Error('Error al obtener citas del día');
  return response.json();
};

const fetchResumenCaja = async (fecha) => {
  const response = await fetch(ENDPOINTS.RESUMEN_CAJA(fecha));
  if (!response.ok) throw new Error('Error al obtener el resumen de caja');
  return response.json();
};

const fetchMetricasMes = async () => {
  const response = await fetch(ENDPOINTS.METRICAS_MES);
  if (!response.ok) throw new Error('Error al obtener métricas mensuales');
  return response.json();
};

// Helper para formato local YYYY-MM-DD
const obtenerFechaLocal = (fechaObj) => {
  const año = fechaObj.getFullYear();
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================
function DashboardAdmin() {
  // Por defecto, iniciamos auditando la fecha de ayer
  const ayerObj = new Date();
  ayerObj.setDate(ayerObj.getDate() - 1);
  
  const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaLocal(ayerObj));

  // --------------------------------------------------------------------------
  // A. TANSTACK QUERY: Consultas HTTP Paralelas
  // --------------------------------------------------------------------------
  const { 
    data: listaCitas = [], 
    isLoading: cargandoCitas 
  } = useQuery({
    queryKey: ['citas-admin', fechaFiltro],
    queryFn: () => fetchCitasPorFecha(fechaFiltro),
  });

  const { 
    data: resumenCaja = { USD: 0.0, VES: 0.0 }, 
    isLoading: cargandoCaja 
  } = useQuery({
    queryKey: ['resumen-caja-admin', fechaFiltro],
    queryFn: () => fetchResumenCaja(fechaFiltro),
  });

  const { 
    data: datosGrafico = [], 
    isLoading: cargandoGrafico 
  } = useQuery({
    queryKey: ['metricas-mes'],
    queryFn: fetchMetricasMes,
  });

  const cargandoGeneral = cargandoCitas || cargandoCaja;

  // Cambiar día dinámicamente (-1 día, +1 día, hoy)
  const moverDia = (diferencia) => {
    const [a, m, d] = fechaFiltro.split('-').map(Number);
    const nuevaFecha = new Date(a, m - 1, d + diferencia);
    setFechaFiltro(obtenerFechaLocal(nuevaFecha));
  };

  return (
    <div className="min-h-screen bg-renova-bg p-8 text-renova-texto">
      
      {/* Encabezado del Panel */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium tracking-tight">Panel de Control</h1>
          <p className="text-sm text-renova-texto/60 mt-1 italic">
            Auditoría de caja y cierres diarios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-renova-texto text-white text-xs font-bold px-4 py-2.5 rounded-full uppercase tracking-wider shadow-sm">
            Vista Administrador 🔐
          </span>
        </div>
      </div>

      {/* Controles de Navegación de Fecha */}
      <div className="max-w-6xl mx-auto mb-8 bg-renova-tarjeta p-4 rounded-3xl border border-renova-borde flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-renova-texto/60">Auditando Día:</span>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="p-2 rounded-xl bg-renova-bg/40 border border-renova-borde text-xs font-medium text-renova-texto focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => moverDia(-1)}
            className="px-3.5 py-2 rounded-xl bg-renova-bg/60 border border-renova-borde text-xs font-medium hover:bg-renova-bg transition-all"
          >
            ⬅️ Día Anterior
          </button>
          <button
            onClick={() => setFechaFiltro(obtenerFechaLocal(new Date()))}
            className="px-3.5 py-2 rounded-xl bg-renova-bg/60 border border-renova-borde text-xs font-medium hover:bg-renova-bg transition-all"
          >
            Hoy 📅
          </button>
          <button
            onClick={() => moverDia(1)}
            className="px-3.5 py-2 rounded-xl bg-renova-bg/60 border border-renova-borde text-xs font-medium hover:bg-renova-bg transition-all"
          >
            Día Siguiente ➡️
          </button>
        </div>
      </div>

      {cargandoGeneral ? (
        <p className="text-center py-12 text-sm text-renova-texto/60">Sincronizando métricas con la base de datos...</p>
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Tarjetas de Métricas (Día Consultado) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Citas Totales */}
            <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-renova-texto/50 mb-1">Citas Registradas</h3>
                <p className="text-sm text-renova-texto/70 italic">Total para {fechaFiltro}</p>
              </div>
              <p className="text-5xl font-serif font-medium mt-4 text-renova-texto">
                {listaCitas.length}
              </p>
            </div>

            {/* Caja USD */}
            <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700/70 mb-1">Ingresos USD</h3>
                <p className="text-sm text-renova-texto/70 italic">Efectivo / Zelle acumulado</p>
              </div>
              <p className="text-5xl font-serif font-medium mt-4 text-emerald-600">
                ${(resumenCaja?.USD || 0.0).toFixed(2)}
              </p>
            </div>

            {/* Caja VES */}
            <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700/70 mb-1">Ingresos VES</h3>
                <p className="text-sm text-renova-texto/70 italic">Pago Móvil / Transferencias</p>
              </div>
              <p className="text-5xl font-serif font-medium mt-4 text-blue-600">
                {(resumenCaja?.VES || 0.0).toFixed(2)} <span className="text-lg font-sans font-bold">Bs.</span>
              </p>
            </div>

          </div>

          {/* Gráfico de Rendimiento del Mes */}
          <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-serif font-medium">📈 Rendimiento Histórico (Últimos 30 días)</h2>
                <p className="text-xs text-renova-texto/60 mt-0.5">Comparativa semanal de ingresos en USD y volumen de citas atendidas</p>
              </div>
            </div>

            {cargandoGrafico ? (
              <p className="text-center py-12 text-xs text-renova-texto/50">Cargando gráfico de rendimiento...</p>
            ) : datosGrafico.length === 0 ? (
              <p className="text-center py-12 text-xs text-renova-texto/50 italic">No hay suficientes registros en los últimos 30 días para proyectar el gráfico.</p>
            ) : (
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 10, fill: '#6B7280' }} 
                      tickLine={false} 
                      axisLine={{ stroke: '#E5E0D8' }} 
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#6B7280' }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FAF8F5', 
                        borderRadius: '16px', 
                        border: '1px solid #E5E0D8',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                      }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#374151' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="USD" fill="#10B981" radius={[6, 6, 0, 0]} name="Ingresos USD ($)" />
                    <Bar dataKey="citas" fill="#6366F1" radius={[6, 6, 0, 0]} name="Citas Atendidas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;