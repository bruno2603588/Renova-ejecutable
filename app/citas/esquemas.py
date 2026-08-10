from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ServicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    duracion_minutos: int
    

class ServicioCreate(ServicioBase):
    pass

class ServicioResponse(ServicioBase):
    id: int

    class Config:
        from_attributes = True


class clientesbase(BaseModel):
    nombre: str
    telefono: str


class clientecreate(clientesbase):
    pass

class clienteresponse(clientesbase):
    id: int

    class config:
        from_attributes = True


class citasBase(BaseModel):
    clientes_id: int
    servicios_id: int
    fecha_hora: datetime
    origen: Optional[str] = "Whatsapp"
    estado: Optional[str] = "Pendiente"

class citascreate(citasBase):
    pass

class citasresponse(citasBase):
    id: int

    class config:
        from_attributes = True

class CitaActualizarEstado(BaseModel):
    estado: str

# Apartado Pagos

class PagosBase(BaseModel):
    citas_id: int
    monto_pagado: float
    tipo_cambio: Optional [str] = "VES"
    metodo_pago: str

class pagoscreate(PagosBase):
    pass

class pagosresponse(PagosBase):
    id: int

    class config:
        from_attributes = True


class HistorialPagosResponse(BaseModel):
    cita_id: int
    servicio_id: int
    fecha_inicio: datetime
    estado_cita: str
    pago_id: int
    monto_pagado: float
    tipo_cambio: str
    metodo_pago: str

    class Config:
        from_attributes = True


class ResumenCajaResponse(BaseModel):
    USD: float
    VES: float


class CitaBusquedaResponse(BaseModel):
    id: int
    fecha: str
    monto: float
    cliente_id: int
    servicio_id: Optional[int] = None

    class Config:
        from_attributes = True