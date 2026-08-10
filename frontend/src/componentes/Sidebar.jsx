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
    <div className="w-64 h-screen bg-renova-tarjeta border-r border-renova-borde flex flex-col justify-between p-6 sticky top-0">
      
      {/* Zona Superior: Branding */}
      <div>
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-serif font-medium tracking-wide text-renova-texto">
            Renova
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-renova-texto/40 mt-1">
            Studio Management
          </p>
        </div>

        {/* Links de Navegación */}
        <nav className="space-y-2">
          {menuOpciones.map((opcion) => {
            const activo = location.pathname === opcion.ruta;
            return (
              <Link
                key={opcion.ruta}
                to={opcion.ruta}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                  activo
                    ? 'bg-renova-texto text-white shadow-sm'
                    : 'text-renova-texto/80 hover:bg-renova-bg/40'
                }`}
              >
                {/* Icono */}
                <span className={`text-lg transition-transform group-hover:scale-110 ${activo ? 'text-white' : ''}`}>
                  {opcion.icono}
                </span>

                {/* Textos */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">
                    {opcion.nombre}
                  </span>
                  <span className={`text-[10px] mt-0.5 ${activo ? 'text-white/70' : 'text-renova-texto/40'}`}>
                    {opcion.descripcion}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Zona Inferior: Información del Programador / Sistema */}
      <div className="pt-4 border-t border-renova-borde/60 px-2 text-left">
        <p className="text-[11px] font-medium text-renova-texto/50">
          Entorno de Desarrollo
        </p>
        <p className="text-[10px] font-mono text-renova-texto/30 mt-0.5">
          v1.0.0 • FastAPI + React
        </p>
      </div>

    </div>
  );
}

export default Sidebar;