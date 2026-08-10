from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class servicios(Base):
    __tablename__= "servicios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=True)
    precio = Column(Float, nullable=False)
    duracion_minutos = Column(Integer, nullable=False)

class clientes(Base):
    __tablename__="clientes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=False)
    telefono = Column(String, nullable=False)

class citas(Base):
    __tablename__="citas"
    id = Column(Integer, primary_key=True, index=True)
    clientes_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    servicios_id = Column(Integer, ForeignKey("servicios.id"), nullable=False)

    fecha_hora = Column(DateTime, default=datetime.datetime.now, nullable=False)
    origen = Column(String, default="Whatsapp", nullable=False)
    estado = Column(String, default="pendiente", nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)
    
    cliente = relationship("clientes", backref="cita_cliente")
    servicio = relationship("servicios")


class Pagos(Base):
    __tablename__= "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    citas_id = Column(Integer, ForeignKey("citas.id"))
    monto_pagado = Column(Float, nullable=False)
    tipo_cambio = Column(String, nullable=False)
    metodo_pago = Column(String, nullable= False)