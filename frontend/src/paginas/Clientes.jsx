import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { API_BASE_URL } from '../config';
// ============================================================================
// 1. PETICIONES A LA API (FastAPI)
// ============================================================================

const buscarClientePorTelefono = async (telefono) => {
  const respuesta = await fetch(`${API_BASE_URL}/clientes/clientes/buscar-por-telefono/{telefono}`.replace('{telefono}', encodeURIComponent(telefono)));
  if (!respuesta.ok) {
    if (respuesta.status === 404) throw new Error("CLIENTE_NO_ENCONTRADO");
    throw new Error("Error en la consulta");
  }
  return respuesta.json(); // Devuelve { id, nombre, telefono }
};

const registrarClienteRequest = async (nuevoCliente) => {
  const respuesta = await fetch(`${API_BASE_URL}/clientes/clientes/nuevo-cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoCliente),
  });
  if (!respuesta.ok) throw new Error("No se pudo registrar el cliente");
  return respuesta.json(); // Devuelve { id, nombre, telefono }
};

// ============================================================================
// 2. TARJETA A: BUSCADOR DE CLIENTE POR TELÉFONO
// ============================================================================

const BuscadorClienteCard = ({ onClienteSeleccionado }) => {
  const queryClient = useQueryClient();
  const [telefono, setTelefono] = useState('');
  const [nombreExpress, setNombreExpress] = useState('');

  const { data: cliente, isLoading, isError, error } = useQuery({
    queryKey: ['cliente', telefono],
    queryFn: () => buscarClientePorTelefono(telefono.trim()),
    enabled: telefono.trim().length >= 10,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const es404 = isError && error?.message === "CLIENTE_NO_ENCONTRADO";

  const mutacionExpress = useMutation({
    mutationFn: registrarClienteRequest,
    onSuccess: (clienteCreado) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.setQueryData(['cliente', clienteCreado.telefono], clienteCreado);
      if (onClienteSeleccionado) onClienteSeleccionado(clienteCreado);
      setNombreExpress('');
      setTelefono('');
    },
  });

  const guardarExpress = (e) => {
    e.preventDefault();
    if (!nombreExpress.trim()) return;
    mutacionExpress.mutate({ nombre: nombreExpress.trim(), telefono: telefono.trim() });
  };

  return (
    <div className="bg-renova-tarjeta w-full max-w-md p-8 rounded-3xl shadow-sm border border-renova-borde text-renova-texto space-y-5">
      <div className="text-center">
        <span className="text-3xl">🔍</span>
        <h2 className="text-2xl font-serif font-medium mt-2">Buscar Cliente</h2>
        <p className="text-xs text-renova-texto/60 mt-1 italic">Consulta por número telefónico</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1.5">
          Teléfono / Contacto
        </label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej. 04141234567"
          className="w-full p-3.5 rounded-xl bg-renova-bg/40 border border-renova-borde focus:outline-none focus:ring-1 focus:ring-renova-texto text-sm text-renova-texto transition-all"
        />
      </div>

      {isLoading && (
        <p className="text-center text-xs text-renova-texto/60 animate-pulse">Buscando en la base de datos...</p>
      )}

      {/* Muestra datos + ID del cliente encontrado */}
      {cliente && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Registrado</span>
              <span className="bg-emerald-200 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                ID: #{cliente.id}
              </span>
            </div>
            <p className="text-base font-serif font-medium mt-0.5">{cliente.nombre}</p>
            <p className="text-xs opacity-75">{cliente.telefono}</p>
          </div>
          <button
            type="button"
            onClick={() => onClienteSeleccionado && onClienteSeleccionado(cliente)}
            className="bg-emerald-800 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-emerald-900 transition-all shadow-sm active:scale-95"
          >
            Seleccionar ✓
          </button>
        </div>
      )}

      {es404 && (
        <form onSubmit={guardarExpress} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <p className="text-xs text-amber-800 font-medium">⚡ Teléfono no registrado. Ingrese el nombre para crearlo:</p>
          <input
            type="text"
            required
            value={nombreExpress}
            onChange={(e) => setNombreExpress(e.target.value)}
            placeholder="Nombre completo"
            className="w-full p-2.5 text-sm rounded-xl border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          />
          <button
            type="submit"
            disabled={mutacionExpress.isPending}
            className="w-full bg-renova-texto text-white py-2.5 rounded-xl text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {mutacionExpress.isPending ? "Guardando..." : "Guardar y Seleccionar 💾"}
          </button>
        </form>
      )}
    </div>
  );
};

// ============================================================================
// 3. TARJETA B: CREAR CLIENTE MANUAL
// ============================================================================

const CrearClienteCard = () => {
  const queryClient = useQueryClient();
  const [formulario, setFormulario] = useState({ nombre: '', telefono: '' });
  const [clienteGuardado, setClienteGuardado] = useState(null);
  const [mensajeError, setMensajeError] = useState('');

  const mutacion = useMutation({
    mutationFn: registrarClienteRequest,
    onSuccess: (data) => {
      setClienteGuardado(data); // Guarda la respuesta que contiene el ID
      setMensajeError('');
      setFormulario({ nombre: '', telefono: '' });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (err) => {
      setMensajeError(err.message || 'Error al conectar con el servidor');
      setClienteGuardado(null);
    }
  });

  const manejarEnvio = (e) => {
    e.preventDefault();
    setMensajeError('');
    setClienteGuardado(null);
    mutacion.mutate(formulario);
  };

  return (
    <div className="bg-renova-tarjeta w-full max-w-md p-8 rounded-3xl shadow-sm border border-renova-borde text-renova-texto space-y-5">
      <div className="text-center">
        <span className="text-3xl">👤</span>
        <h2 className="text-2xl font-serif font-medium mt-2">Nuevo Cliente</h2>
        <p className="text-xs text-renova-texto/60 mt-1 italic">Registro manual directo</p>
      </div>

      {/* Muestra mensaje de éxito + ID asignado */}
      {clienteGuardado && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
          <p className="text-xs font-bold text-emerald-700">¡Cliente registrado con éxito!</p>
          <p className="text-sm font-medium">{clienteGuardado.nombre}</p>
          <span className="inline-block bg-emerald-200 text-emerald-800 text-xs font-mono px-2.5 py-1 rounded-md font-bold mt-1">
            ID Asignado: #{clienteGuardado.id}
          </span>
        </div>
      )}

      {mensajeError && (
        <div className="p-3 rounded-xl text-xs font-medium text-center bg-rose-50 border border-rose-200 text-rose-800">
          {mensajeError}
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1.5">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            placeholder="Ej. María Delgado"
            className="w-full p-3.5 rounded-xl bg-renova-bg/40 border border-renova-borde focus:outline-none focus:ring-1 focus:ring-renova-texto text-sm text-renova-texto transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-renova-texto/60 mb-1.5">
            Teléfono / Contacto *
          </label>
          <input
            type="text"
            required
            value={formulario.telefono}
            onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
            placeholder="Ej. 04141234567"
            className="w-full p-3.5 rounded-xl bg-renova-bg/40 border border-renova-borde focus:outline-none focus:ring-1 focus:ring-renova-texto text-sm text-renova-texto transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={mutacion.isPending}
          className="w-full bg-renova-texto text-white p-4 rounded-full font-medium text-sm transition-all shadow-sm hover:opacity-95 disabled:opacity-50"
        >
          {mutacion.isPending ? "Registrando..." : "Guardar Cliente 💾"}
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// 4. VISTA PRINCIPAL
// ============================================================================

export default function SeccionClientes({ onClienteSeleccionado }) {
  return (
    <div className="min-h-screen bg-renova-bg flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl">
        <BuscadorClienteCard onClienteSeleccionado={onClienteSeleccionado} />
        <CrearClienteCard />
      </div>
    </div>
  );
}