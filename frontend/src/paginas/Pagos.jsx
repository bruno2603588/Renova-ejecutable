import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { API_BASE_URL } from '../config';
// ============================================================================
// 1. CONFIGURACIÓN DE ENDPOINTS
// ============================================================================
const BASE_URL = API_BASE_URL;

// Ajusta las rutas según los prefixes de tu router en FastAPI
const ENDPOINTS = {
COMPLETADOS: `${BASE_URL}/pagos/pagos/completados`,
  RESUMEN_CAJA: `${BASE_URL}/pagos/pagos/resumen-caja`,
  REGISTRAR_PAGO: `${BASE_URL}/pagos/pagos/registrar`,
};

// ============================================================================
// 2. FUNCIONES DE PETICIÓN HTTP (Fetchers)
// ============================================================================

// GET: Historial de Pagos Completados
const fetchHistorial = async () => {
  const response = await fetch(ENDPOINTS.COMPLETADOS);
  if (!response.ok) {
    throw new Error('Error al obtener el historial de pagos');
  }
  return response.json();
};

// GET: Resumen de Balances en Caja (USD / VES)
const fetchResumenCaja = async () => {
  const response = await fetch(ENDPOINTS.RESUMEN_CAJA);
  if (!response.ok) {
    throw new Error('Error al obtener el resumen de caja');
  }
  return response.json();
};

// POST: Registrar Nuevo Pago
const registrarPagoRequest = async (payload) => {
  const response = await fetch(ENDPOINTS.REGISTRAR_PAGO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const datos = await response.json();
  if (!response.ok) {
    throw new Error(datos.detail || 'No se pudo procesar el pago');
  }
  return datos;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================
function GestionPagos() {
  const queryClient = useQueryClient();

  // Estado del Formulario
  const [formulario, setFormulario] = useState({
    citas_id: '',
    monto_pagado: '',
    tipo_cambio: 'USD',
    metodo_pago: 'Efectivo'
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --------------------------------------------------------------------------
  // A. TANSTACK QUERY: Obtener Historial y Resumen de Caja
  // --------------------------------------------------------------------------
  const { 
    data: historial = [], 
    isLoading: cargandoHistorial 
  } = useQuery({
    queryKey: ['pagos-historial'],
    queryFn: fetchHistorial,
  });

  const { 
    data: resumenCaja = { USD: 0.0, VES: 0.0 }, 
    isLoading: cargandoCaja 
  } = useQuery({
    queryKey: ['pagos-resumen'],
    queryFn: fetchResumenCaja,
  });

  // --------------------------------------------------------------------------
  // B. TANSTACK MUTATION: Registrar Pago (POST)
  // --------------------------------------------------------------------------
  const pagoMutation = useMutation({
    mutationFn: registrarPagoRequest,
    onSuccess: (data, variables) => {
      setMensaje({ 
        texto: `¡Pago de la cita #${variables.citas_id} registrado con éxito!`, 
        tipo: 'exito' 
      });
      setFormulario({ citas_id: '', monto_pagado: '', tipo_cambio: 'USD', metodo_pago: 'Efectivo' });

      // Invalida las dos consultas para recargar totales e historial al instante
      queryClient.invalidateQueries({ queryKey: ['pagos-historial'] });
      queryClient.invalidateQueries({ queryKey: ['pagos-resumen'] });
    },
    onError: (error) => {
      setMensaje({ texto: `Error: ${error.message}`, tipo: 'error' });
    }
  });

  // Handlers
  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const manejarEnvioPago = (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    const payload = {
      citas_id: parseInt(formulario.citas_id, 10),
      monto_pagado: parseFloat(formulario.monto_pagado),
      tipo_cambio: formulario.tipo_cambio,
      metodo_pago: formulario.metodo_pago
    };

    pagoMutation.mutate(payload);
  };

  const cargandoGeneral = cargandoHistorial || cargandoCaja;

  return (
    <div className="min-h-screen bg-renova-bg p-8 text-renova-texto">
      <h1 className="text-4xl font-serif font-medium text-center mb-2">Módulo de Caja</h1>
      <p className="text-center text-renova-texto/70 mb-10 italic">Conciliación contable multimoneda de Renova</p>

      {/* Indicadores de balances en la parte superior */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Total Acumulado USD</h3>
          <p className="text-4xl font-serif font-medium text-emerald-600">
            ${(resumenCaja?.USD || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Total Acumulado VES</h3>
          <p className="text-4xl font-serif font-medium text-blue-600">
            {(resumenCaja?.VES || 0).toFixed(2)} Bs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Pago (POST) */}
        <div className="bg-renova-tarjeta p-6 rounded-3xl shadow-sm border border-renova-borde h-fit">
          <h2 className="text-xl font-serif font-medium mb-6">💵 Registrar Transacción</h2>
          
          {mensaje.texto && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-medium text-center border ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={manejarEnvioPago} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">ID de la Cita *</label>
              <input
                type="number"
                name="citas_id"
                required
                value={formulario.citas_id}
                onChange={manejarCambio}
                placeholder="Ej. 1"
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Monto Cobrado *</label>
              <input
                type="number"
                step="0.01"
                name="monto_pagado"
                required
                value={formulario.monto_pagado}
                onChange={manejarCambio}
                placeholder="0.00"
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Tipo de Moneda</label>
              <select
                name="tipo_cambio"
                value={formulario.tipo_cambio}
                onChange={manejarCambio}
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              >
                <option value="USD">USD (Divisas)</option>
                <option value="VES">VES (Bolívares)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Método de Pago</label>
              <select
                name="metodo_pago"
                value={formulario.metodo_pago}
                onChange={manejarCambio}
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Zelle">Zelle</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={pagoMutation.isPending}
              className={`w-full bg-renova-texto text-white p-3.5 rounded-full font-medium text-sm transition-all mt-2 ${
                pagoMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-95'
              }`}
            >
              {pagoMutation.isPending ? "Registrando..." : "Confirmar Pago ✓"}
            </button>
          </form>
        </div>

        {/* Historial de Transacciones (GET) */}
        <div className="lg:col-span-2 bg-renova-tarjeta p-6 rounded-3xl border border-renova-borde shadow-sm h-fit">
          <h2 className="text-xl font-serif font-medium mb-4">📈 Transacciones Completadas</h2>
          
          {cargandoGeneral ? (
            <p className="text-center py-6 text-sm text-renova-texto/60">Sincronizando cuentas contables...</p>
          ) : historial.length === 0 ? (
            <p className="text-center py-6 text-sm text-renova-texto/50">No hay movimientos registrados en caja.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-renova-borde text-xs font-semibold uppercase tracking-wider text-renova-texto/60">
                    <th className="py-3 px-2">Cita</th>
                    <th className="py-3 px-2">Método</th>
                    <th className="py-3 px-2">Estado Cita</th>
                    <th className="py-3 px-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-renova-borde/40 text-xs">
                  {historial.map((pago) => (
                    <tr key={pago.pago_id || pago.id} className="hover:bg-renova-bg/10">
                      <td className="py-3 px-2 font-medium">#{pago.cita_id || pago.citas_id}</td>
                      <td className="py-3 px-2 text-renova-texto/80">{pago.metodo_pago}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          pago.estado_cita === 'atendido' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {pago.estado_cita || 'Completado'}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-serif font-medium text-sm ${
                        pago.tipo_cambio === 'USD' ? 'text-emerald-600' : 'text-blue-600'
                      }`}>
                        {Number(pago.monto_pagado).toFixed(2)} {pago.tipo_cambio}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default GestionPagos;