import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { API_BASE_URL } from '../config';
// ============================================================================
// 1. CONFIGURACIÓN DE ENDPOINTS (Rutas exactas de tu FastAPI)
// ============================================================================
const BASE_URL = "http://localhost:8000";

const ENDPOINTS = {
  // GET: Búsqueda por fecha o listado completo
  BUSCAR_CITAS: (fecha) => 
    fecha 
      ? `${BASE_URL}/citas/citas/buscar?fecha=${fecha}` 
      : `${BASE_URL}/citas/citas/`,
  
  // POST: Agendar nueva cita
  AGENDAR: `${BASE_URL}/citas/citas/agendar`,
  
  // PUT: Cambiar estado
  CAMBIAR_ESTADO: (citaId) => `${BASE_URL}/citas/citas/estado?cita_id=${citaId}`
};

// ============================================================================
// 2. FUNCIONES DE PETICIÓN HTTP (Fetchers)
// ============================================================================

// GET: Obtener Citas
const fetchCitas = async (fecha) => {
  const response = await fetch(ENDPOINTS.BUSCAR_CITAS(fecha));
  
  if (!response.ok) {
    // Si FastAPI devuelve 404 significa que simplemente no hay citas registradas ese día
    if (response.status === 404) return []; 
    throw new Error(`Error en el servidor: Status ${response.status}`);
  }
  
  return response.json();
};

// POST: Registrar Cita
const agendarCitaRequest = async (payload) => {
  const response = await fetch(ENDPOINTS.AGENDAR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const datos = await response.json();
  if (!response.ok) {
    throw new Error(datos.detail || 'Error al agendar la cita');
  }

  return datos;
};

// PUT: Actualizar Estado
const cambiarEstadoRequest = async ({ citaId, nuevoEstado }) => {
  const response = await fetch(ENDPOINTS.CAMBIAR_ESTADO(citaId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  const datos = await response.json();
  if (!response.ok) {
    throw new Error(datos.detail || 'Error al cambiar el estado');
  }

  return datos;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================
function Citas() {
  const queryClient = useQueryClient();

  // Fecha actual en formato YYYY-MM-DD
  const hoyStr = new Date().toISOString().split('T')[0];
  const [filtroFecha, setFiltroFecha] = useState(hoyStr);

  // Estado local para el formulario
  const [formulario, setFormulario] = useState({
    clientes_id: '',
    servicios_id: '',
    fecha_hora: '',
    origen: 'Presencial'
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --------------------------------------------------------------------------
  // A. TANSTACK QUERY: Consulta de Citas (GET)
  // --------------------------------------------------------------------------
  const { 
    data: citas = [], 
    isLoading: cargandoCitas, 
    isError, 
    error: errorCitas 
  } = useQuery({
    queryKey: ['citas', filtroFecha],
    queryFn: () => fetchCitas(filtroFecha),
  });

  // --------------------------------------------------------------------------
  // B. TANSTACK MUTATION: Agendar Cita (POST)
  // --------------------------------------------------------------------------
  const agendarMutation = useMutation({
    mutationFn: agendarCitaRequest,
    onSuccess: () => {
      setMensaje({ texto: '¡Cita agendada con éxito! 📅', tipo: 'exito' });
      setFormulario({ clientes_id: '', servicios_id: '', fecha_hora: '', origen: 'Presencial' });
      
      // Invalida la caché para que TanStack Query refresque la lista sola
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
    onError: (error) => {
      setMensaje({ texto: `Error: ${error.message}`, tipo: 'error' });
    }
  });

  // --------------------------------------------------------------------------
  // C. TANSTACK MUTATION: Cambiar Estado (PUT)
  // --------------------------------------------------------------------------
  const cambiarEstadoMutation = useMutation({
    mutationFn: cambiarEstadoRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
    onError: (error) => {
      alert(`Ocurrió un error al cambiar el estado: ${error.message}`);
    }
  });

  // Manejadores de Interfaz
  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const cambiarDiaFiltro = (diasDiferencia) => {
    const fechaBase = filtroFecha ? new Date(filtroFecha) : new Date();
    fechaBase.setDate(fechaBase.getDate() + diasDiferencia);
    const nuevaFecha = fechaBase.toISOString().split('T')[0];
    setFiltroFecha(nuevaFecha);
  };

  const agendarCita = (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    const payload = {
      clientes_id: parseInt(formulario.clientes_id, 10),
      servicios_id: parseInt(formulario.servicios_id, 10),
      fecha_hora: formulario.fecha_hora,
      origen: formulario.origen
    };

    agendarMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-renova-bg p-8 text-renova-texto">
      <h1 className="text-4xl font-serif font-medium text-center mb-2">Agenda de Citas</h1>
      <p className="text-center text-renova-texto/70 mb-10 italic">Control y estados de turnos de Renova</p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO CREAR CITA (POST) */}
        <div className="bg-renova-tarjeta p-6 rounded-3xl shadow-sm border border-renova-borde h-fit">
          <h2 className="text-xl font-serif font-medium mb-6">📅 Nueva Cita</h2>
          
          {mensaje.texto && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-medium text-center border ${
              mensaje.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={agendarCita} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">ID del Cliente *</label>
              <input
                type="number"
                name="clientes_id"
                required
                value={formulario.clientes_id}
                onChange={manejarCambio}
                placeholder="Ej. 1"
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">ID del Servicio *</label>
              <input
                type="number"
                name="servicios_id"
                required
                value={formulario.servicios_id}
                onChange={manejarCambio}
                placeholder="Ej. 2"
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Fecha y Hora *</label>
              <input
                type="datetime-local"
                name="fecha_hora"
                required
                value={formulario.fecha_hora}
                onChange={manejarCambio}
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1">Origen</label>
              <select
                name="origen"
                value={formulario.origen}
                onChange={manejarCambio}
                className="w-full p-3 rounded-xl bg-renova-bg/30 border border-renova-borde focus:outline-none text-sm text-renova-texto"
              >
                <option value="Presencial">Presencial</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={agendarMutation.isPending}
              className={`w-full bg-renova-texto text-white p-3.5 rounded-full font-medium text-sm transition-all shadow-sm ${
                agendarMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-95'
              }`}
            >
              {agendarMutation.isPending ? "Guardando..." : "Agendar Cita 💾"}
            </button>
          </form>
        </div>

        {/* COLUMNA 2 Y 3: LISTADO Y FILTROS (GET / PUT) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Barra de Filtro de Fecha */}
          <div className="bg-renova-tarjeta p-4 rounded-3xl border border-renova-borde flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtrar por día:</span>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="p-2 rounded-xl bg-renova-bg/40 border border-renova-borde text-xs text-renova-texto focus:outline-none font-medium cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => cambiarDiaFiltro(-1)}
                className="px-3 py-1.5 rounded-xl bg-renova-bg/60 border border-renova-borde text-xs font-medium hover:bg-renova-bg transition-all"
              >
                ⬅️ Ayer
              </button>
              <button
                type="button"
                onClick={() => setFiltroFecha(hoyStr)}
                className="px-3 py-1.5 rounded-xl bg-renova-bg/60 border border-renova-borde text-xs font-medium hover:bg-renova-bg transition-all"
              >
                Hoy 📅
              </button>
              <button
                type="button"
                onClick={() => setFiltroFecha('')}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-renova-texto/60 hover:text-renova-texto transition-all"
              >
                Ver Todas
              </button>
            </div>
          </div>

          <h2 className="text-xl font-serif font-medium mb-4">
            {filtroFecha ? `Citas para el ${filtroFecha}` : "Todas las Citas"}
          </h2>
          
          {/* Renderizado de los datos */}
          {cargandoCitas ? (
            <p className="text-center py-8">Cargando citas...</p>
          ) : isError ? (
            <p className="text-center py-8 text-rose-500 font-medium">
              Error al conectar con el servidor: {errorCitas.message}
            </p>
          ) : citas.length === 0 ? (
            <p className="text-center py-8 text-renova-texto/50">No hay citas registradas para esta fecha.</p>
          ) : (
            citas.map((cita) => (
              <div key={cita.id} className="bg-renova-tarjeta p-5 rounded-3xl border border-renova-borde flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-renova-bg px-3 py-1 rounded-full uppercase text-renova-texto/80">
                      Cita #{cita.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      cita.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      cita.estado === 'atendido' || cita.estado === 'atendida' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {cita.estado}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm text-renova-texto/80">
                    <p>👤 ID Cliente: <span className="font-semibold">#{cita.clientes_id}</span></p>
                    <p>💇 ID Servicio: <span className="font-semibold">#{cita.servicios_id}</span></p>
                    <p className="text-xs text-renova-texto/60">📅 {new Date(cita.fecha_hora).toLocaleString()} • 🌐 {cita.origen}</p>
                  </div>
                </div>
                
                {/* Selector de Estado Rápido (PUT) */}
                <div className="flex flex-col items-start sm:items-end gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-renova-texto/50">Cambiar Estado</label>
                  <select
                    value={cita.estado}
                    disabled={cambiarEstadoMutation.isPending}
                    onChange={(e) => cambiarEstadoMutation.mutate({ citaId: cita.id, nuevoEstado: e.target.value })}
                    className="p-2 rounded-xl bg-renova-bg/40 border border-renova-borde text-xs text-renova-texto focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="atendido">✓ Atendido</option>
                    <option value="cancelada">✕ Cancelada</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Citas;
