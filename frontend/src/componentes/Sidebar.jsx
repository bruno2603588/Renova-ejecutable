import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  // Configuración de los botones de navegación del sistema
  const menuOpciones = [
    {
      nombre: 'Panel Admin',
      ruta: '/admin',
      icono: '🔐',
      descripcion: 'Cierre de caja y auditoría'
    },
    {
      nombre: 'Agenda',
      ruta: '/citas',
      icono: '📅',
      descripcion: 'Control de turnos'
    },
    {
      nombre: 'Clientes',
      ruta: '/clientes',
      icono: '👤',
      descripcion: 'Registro de usuarios'
    },
    {
      nombre: 'Caja y Pagos',
      ruta: '/pagos',
      icono: '💵',
      descripcion: 'Flujo multimoneda'
    },
    {
      nombre: 'Servicios',
      ruta: '/servicios',
      icono: '💇',
      descripcion: 'Catálogo de servicios'
    },
  ];

  return (
    <aside className="w-full md:w-64 md:h-screen bg-renova-tarjeta border-b md:border-b-0 md:border-r border-renova-borde flex flex-col justify-between p-4 md:p-6 sticky top-0 shrink-0 z-50">
      
      {/* Zona Superior: Branding + Links */}
      <div className="w-full">
        {/* Branding */}
        <div className="mb-3 md:mb-10 px-2 flex justify-between items-center md:block">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-medium tracking-wide text-renova-texto">
              Renova
            </h2>
            <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-renova-texto/40 mt-0.5 md:mt-1">
              Studio Management
            </p>
          </div>
        </div>

        {/* Links de Navegación */}
        {/* En Móvil: Fila horizontal deslizable | En PC: Columna vertical */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 space-y-0 md:space-y-2">
          {menuOpciones.map((opcion) => {
            const activo = location.pathname === opcion.ruta;
            return (
              <Link
                key={opcion.ruta}
                to={opcion.ruta}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 md:gap-4 p-2.5 md:p-3.5 rounded-2xl transition-all group whitespace-nowrap ${
                  activo
                    ? 'bg-renova-texto text-white shadow-sm'
                    : 'text-renova-texto/80 hover:bg-renova-bg/40'
                }`}
              >
                {/* Icono */}
                <span className={`text-base md:text-lg transition-transform group-hover:scale-110 ${activo ? 'text-white' : ''}`}>
                  {opcion.icono}
                </span>

                {/* Textos */}
                <div className="flex flex-col text-left">
                  <span className="text-xs md:text-sm font-medium">
                    {opcion.nombre}
                  </span>
                  {/* La descripción se oculta en celulares para ahorrar pantalla útil */}
                  <span className={`hidden md:block text-[10px] mt-0.5 ${activo ? 'text-white/70' : 'text-renova-texto/40'}`}>
                    {opcion.descripcion}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Zona Inferior: Información del Programador / Sistema */}
      {/* Oculto en celulares, visible únicamente en computadoras */}
      <div className="hidden md:block pt-4 border-t border-renova-borde/60 px-2 text-left">
        <p className="text-[11px] font-medium text-renova-texto/50">
          Entorno de Desarrollo
        </p>
        <p className="text-[10px] font-mono text-renova-texto/30 mt-0.5">
          v1.0.0 • FastAPI + React
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;
