import React, { useState, useEffect } from "react";

import { API_BASE_URL } from '../config';

function Servicios() {
  const [servicios, setServicios] = useState([]);

  const getServicios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/servicios/servicios/`);
      if (!response.ok) throw new Error("Error al conectar con la API");
      const datos = await response.json();
      setServicios(datos);
    } catch (error) {
      console.error("Error obteniendo servicios:", error);
    }
  };

  useEffect(() => {
    getServicios();
  }, []);

  return (
    // Fondo general beige claro del flyer
    <div className="min-h-screen bg-renova-bg p-8 text-renova-texto">
      
      {/* Título elegante. Usamos font-serif para simular el estilo de 'Lunes y Martes' */}
      <h1 className="text-4xl font-serif font-medium text-center text-renova-texto mb-2">
        Nuestros Servicios
      </h1>
      <p className="text-center text-renova-texto/80 mb-12 italic font-light">
        Renova Nails Salon - Estilo y Cuidado
      </p>

      {/* Contenedor de la lista. Limitamos el ancho para que parezca el flyer central */}
      <div className="max-w-3xl mx-auto space-y-6">
        
        {servicios.length === 0 ? (
          // Tarjeta de carga estilo flyer
          <div className="bg-renova-tarjeta p-6 rounded-3xl shadow-sm border border-renova-borde text-center">
            <p className="text-renova-texto/60 animate-pulse">Cargando la lista de servicios...</p>
          </div>
        ) : (
          servicios.map((srv, idx) => (
            // CADA SERVICIO: Imitando los botones redondeados del flyer
            <div 
              key={idx} 
              className="flex justify-between items-center bg-renova-tarjeta p-6 px-10 rounded-full shadow-sm border border-renova-borde transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Info del Servicio */}
              <div className="flex-1 pr-8">
                <h2 className="text-xl font-semibold text-renova-texto uppercase tracking-wide">
                  {srv.nombre}
                </h2>
                {/* Puedes añadir una descripción corta aquí si tu API la da */}
                <p className="text-sm text-renova-texto/70 mt-1 font-light">
                  {srv.descripcion || "(Sin descripción)"}
                </p>
              </div>
              
              {/* Precio: Grande, oscuro y elegante como en el flyer */}
              <div className="text-4xl font-serif font-medium text-renova-precio whitespace-nowrap">
                {srv.precio}$
              </div>
            </div>
          ))
        )}

        {/* Nota final estilo flyer */}
        <div className="pt-10 text-center text-renova-texto/60 text-sm italic font-light">
          (Todos los precios están sujetos a cambios sin previo aviso)
        </div>
      </div>
    </div>
  );
}

export default Servicios;