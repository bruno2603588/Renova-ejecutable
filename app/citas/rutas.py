from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from sqlalchemy import text
import typing
import datetime
from datetime import date, timedelta

from starlette import status

from app.database import SessionLocal
from app.citas import modelos, esquemas
from app.citas.modelos import servicios, clientes, citas, Pagos

router_servicios = APIRouter(
    prefix="/servicios",
    tags=["Servicios"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router_servicios.post("/", response_model=esquemas.ServicioResponse)
def crear_servicio(servicio: esquemas.ServicioCreate, db: Session = Depends(get_db)):
    db_servicio = db.query(modelos.servicios).filter(modelos.servicios.nombre == servicio.nombre).first()
    if db_servicio:
        raise HTTPException(status_code=400, detail="el servicio ya existe")
    nuevo_servicio = modelos.servicios(
        nombre=servicio.nombre,
        descripcion=servicio.descripcion,
        precio=servicio.precio,
        duracion_minutos=servicio.duracion_minutos
    )
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    return nuevo_servicio

@router_servicios.get("/", response_model=list[esquemas.ServicioResponse])
def listar_servicios(db: Session= Depends(get_db)):
    servicios = db.query(modelos.servicios).all()
    return servicios


@router_servicios.get("/{id_servicios}", response_model=esquemas.ServicioResponse)
def obtener_servicio(id_servicios: int, db: Session =Depends(get_db)):
    servicio = db.query(modelos.servicios).filter(modelos.servicios.id == id_servicios).first()

    if not servicio:
        raise HTTPException(status_code=400, detail="el servicio no existe")
    return servicio

@router_servicios.delete("/{id_servicios}")
def eliminar_servicio(id_servicios: int, db: Session = Depends(get_db)):
    servicios = db.query(modelos.servicios).filter(modelos.servicios.id == id_servicios).first()
    if not servicios:
        raise HTTPException(status_code=404, detail="el servicio que intentas eliminar no existe")
    
    db.delete(servicios)
    db.commit()

    return {"mensaje": f"El servicio '{servicios.nombre}' fue eliminado correctamente"}



router_clientes = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

@router_clientes.post("/nuevo-cliente", response_model=esquemas.clienteresponse)
def crear_cliente(cliente_in: esquemas.clientecreate, db: Session = Depends(get_db)):
    cliente = db.query(modelos.clientes).filter(modelos.clientes.nombre == cliente_in.nombre).first()
    if cliente:
        raise HTTPException(status_code=409, detail="el cliente ya existe")
    nuevo_cliente = modelos.clientes(
        nombre = cliente_in.nombre,
        telefono = cliente_in.telefono
    )
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return nuevo_cliente

@router_clientes.get("/buscar-por-telefono/{telefono}")
def buscar_cliente_por_telefono(telefono: str, db: Session = Depends(get_db)):
    # Limpiar espacios en blanco o guiones
    telefono_limpio = telefono.strip()
    
    # 1. Usar la clase del modelo (ej: modelos.Cliente o modelos.Clientes)
    cliente = db.query(modelos.clientes).filter(modelos.clientes.telefono == telefono_limpio).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado con este número de teléfono"
        )
    
    # 2. Retornar las propiedades del objeto 'cliente' encontrado
    return {
        "id": cliente.id,
        "nombre": cliente.nombre,
        "telefono": cliente.telefono
    }

router_citas = APIRouter(
    prefix="/citas",
    tags=["Citas"]
)

@router_citas.post("/agendar", response_model=esquemas.citasresponse, status_code=201)
def crear_cita(cita_in: esquemas.citascreate, db: Session = Depends(get_db)):
    cliente = db.query(modelos.clientes).filter(modelos.clientes.id == cita_in.clientes_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="el cliente expecificado no existe")
    
    servicio = db.query(modelos.servicios).filter(modelos.servicios.id == cita_in.servicios_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="el servicio expecificado no existe")
    

    nueva_cita = modelos.citas(
        clientes_id = cita_in.clientes_id,
        servicios_id = cita_in.servicios_id,
        fecha_hora = cita_in.fecha_hora,
        origen = cita_in.origen
    )

    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)

    return nueva_cita


@router_citas.put("/estado", response_model=esquemas.citasresponse)
def actualizar_estado_cita(cita_id: int, estado_in: esquemas.CitaActualizarEstado, db: Session = Depends(get_db)):
    cita = db.query(modelos.citas).filter(modelos.citas.id == cita_id).first()

    if not cita:
        raise HTTPException(status_code=404, detail="la cita no fue encotrada")
    estados_validos = ["pendiente", "atendido","atendida", "cancelada"]

    if estado_in.estado.lower() not in estados_validos:
        raise HTTPException(status_code=404, detail=f"Estado inválido. Use: {', '.join(estados_validos)}")
    
    cita.estado = estado_in.estado.lower() # type: ignore

    db.commit()
    db.refresh(cita)

    return cita

@router_citas.get("/buscar", response_model=typing.List[esquemas.citasresponse])
def buscar_citas_por_fecha(fecha: str, db: Session = Depends(get_db)):
    fecha_limpia = fecha.replace("/", "-").strip()
    
    # Filtra convirtiendo la fecha y hora a solo fecha (YYYY-MM-DD)
    citas = db.query(modelos.citas).filter(
        func.date(modelos.citas.fecha_hora) == fecha_limpia
    ).all()
    
    return citas

@router_citas.get("/", response_model=list[esquemas.citasresponse])
def listar_citas(db: Session= Depends(get_db)):
    citas = db.query(modelos.citas).all()
    return citas

router_pagos = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)
@router_pagos.post("/registrar", response_model=esquemas.pagosresponse)
def registrar_pago(pago: esquemas.pagoscreate, db: Session = Depends(get_db)):
    try:
        nuevo_pago = modelos.Pagos(
            citas_id = pago.citas_id,
            monto_pagado = pago.monto_pagado,
            tipo_cambio = pago.tipo_cambio,
            metodo_pago = pago.metodo_pago
        )
        
        db.add(nuevo_pago)
        db.commit()
        db.refresh(nuevo_pago)
        return nuevo_pago

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al registrar pago: {str(e)}")


@router_pagos.get("/completados", response_model=typing.List[esquemas.HistorialPagosResponse])
def listar_pagos_y_citas_realizadas(
    fecha: typing.Optional[str] = Query(
        None, 
        description="Fecha en formato YYYY-MM-DD. Si no se provee, consulta el día de hoy."
    ),
    db: Session = Depends(get_db)
):
    try:
        # 1. Si no envían fecha desde el frontend, tomar el día actual del servidor
        fecha_consulta = fecha if fecha else date.today().strftime("%Y-%m-%d")

        # 2. SQL con DATE() para ignorar la hora y param :fecha_filtro para evitar inyecciones SQL
        query_sql = text("""
            SELECT 
                c.id AS cita_id, 
                c.servicios_id AS servicio_id, 
                c.fecha_hora AS fecha_inicio,
                c.estado AS estado_cita,
                p.id AS pago_id, 
                p.monto_pagado AS monto_pagado, 
                p.tipo_cambio AS tipo_cambio, 
                p.metodo_pago AS metodo_pago
            FROM citas c
            INNER JOIN pagos p ON p.citas_id = c.id
            WHERE (c.estado = 'pendiente' OR c.estado = 'atendido')
              AND DATE(c.fecha_hora) = :fecha_filtro
        """)
    
        # 3. Pasar la variable dentro del dictionary en execute()
        resultados = db.execute(query_sql, {"fecha_filtro": fecha_consulta}).mappings().all()
        
        if not resultados:
            return []
            
        respuesta = []
        for fila in resultados:
            respuesta.append({
                "cita_id": fila["cita_id"],
                "servicio_id": fila["servicio_id"],
                "fecha_inicio": str(fila["fecha_inicio"]),
                "estado_cita": fila["estado_cita"],
                "pago_id": fila["pago_id"],
                "monto_pagado": float(fila["monto_pagado"]),
                "tipo_cambio": fila["tipo_cambio"],
                "metodo_pago": fila["metodo_pago"]
            })
            
        return respuesta

    except Exception as e:
        # Es recomendable registrar o manejar el error en lugar de silenciarlo
        raise e

    except Exception as e:
        print(f"Error en SQL Puro: {str(e)}") 
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")





@router_pagos.get("/resumen-caja", response_model=esquemas.ResumenCajaResponse)
def obtener_resumen_caja(
    fecha: typing.Optional[str] = Query(
        None, 
        description="Fecha YYYY-MM-DD. Si no se provee, consulta el día de hoy."
    ),
    db: Session = Depends(get_db)
):
    try:
        # 1. Definir la fecha de consulta (parámetro o el día actual del servidor)
        fecha_consulta = fecha if fecha else date.today().strftime("%Y-%m-%d")

        # 2. Agregar el filtro de fecha sobre la cita asociada
        query_sql = text("""
            SELECT 
                p.tipo_cambio AS moneda,
                SUM(p.monto_pagado) AS total_acumulado
            FROM pagos p
            INNER JOIN citas c ON p.citas_id = c.id
            WHERE (c.estado = 'pendiente' OR c.estado = 'atendido')
              AND DATE(c.fecha_hora) = :fecha_filtro
            GROUP BY p.tipo_cambio
        """)
        
        # 3. Pasar el parámetro :fecha_filtro de manera segura
        resultados = db.execute(query_sql, {"fecha_filtro": fecha_consulta}).mappings().all()
        
        resumen = {
            "USD": 0.0,
            "VES": 0.0
        }
        
        for fila in resultados:
            moneda = fila["moneda"]
            total = fila["total_acumulado"]
            
            if moneda in resumen:
                resumen[moneda] = float(total) if total is not None else 0.0
                
        return resumen

    except Exception as e:
        print(f"Error al calcular resumen de caja: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error en el servidor al calcular totales: {str(e)}"
        )




@router_pagos.get("/metricas-mes")
def obtener_metricas_mes(db: Session = Depends(get_db)):
    try:
        # Calcular hace 30 días desde Python
        fecha_hace_30_dias = (date.today() - timedelta(days=30)).strftime("%Y-%m-%d")

        query_sql = text("""
            SELECT 
                DATE(c.fecha_hora) AS fecha,
                SUM(CASE WHEN p.tipo_cambio = 'USD' THEN p.monto_pagado ELSE 0 END) AS total_usd,
                SUM(CASE WHEN p.tipo_cambio = 'VES' THEN p.monto_pagado ELSE 0 END) AS total_ves,
                COUNT(DISTINCT c.id) AS total_citas
            FROM citas c
            LEFT JOIN pagos p ON p.citas_id = c.id
            WHERE DATE(c.fecha_hora) >= :fecha_limite
              AND (c.estado = 'atendido' OR c.estado = 'atendida' OR c.estado = 'pendiente')
            GROUP BY DATE(c.fecha_hora)
            ORDER BY fecha ASC
        """)
        
        resultados = db.execute(query_sql, {"fecha_limite": fecha_hace_30_dias}).mappings().all()
        
        datos_grafico = []
        for fila in resultados:
            datos_grafico.append({
                "fecha": str(fila["fecha"]),
                "USD": float(fila["total_usd"] or 0.0),
                "VES": float(fila["total_ves"] or 0.0),
                "citas": int(fila["total_citas"] or 0)
            })
            
        return datos_grafico

    except Exception as e:
        print(f"--- ERROR EN METRICAS MES ---: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error en el servidor al calcular métricas: {str(e)}"
        )