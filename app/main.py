import os
import sys
from pathlib import Path
import threading
import webbrowser
import uvicorn

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.citas.rutas import router_citas, router_clientes, router_servicios, router_pagos


# ============================================================================
# HELPER PARA RESOLVER RUTAS DE RECURSOS EN PYINSTALLER
# ============================================================================
def obtener_ruta_recurso(ruta_relativa: str) -> Path:
    """
    Obtiene la ruta absoluta para recursos estáticos.
    Funciona tanto en desarrollo como empaquetado con PyInstaller (_MEIPASS).
    """
    if hasattr(sys, '_MEIPASS'):
        base_path = Path(sys._MEIPASS)
    else:
        base_path = Path(os.path.abspath("."))
    
    return base_path / ruta_relativa


# Inicializar tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Renova Studio Management",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los endpoints de la API
app.include_router(router_citas, prefix="/citas", tags=["Citas"])
app.include_router(router_clientes, prefix="/clientes", tags=["Clientes"])
app.include_router(router_servicios, prefix="/servicios", tags=["Servicios"])
app.include_router(router_pagos, prefix="/pagos", tags=["Pagos"])


# ============================================================================
# MONTAJE DEL FRONTEND COMPILADO (REACT / VITE)
# ============================================================================
ruta_dist = obtener_ruta_recurso("dist")

# Si existe la carpeta 'dist' (después de ejecutar npm run build), servir los estáticos
if ruta_dist.exists():
    # Servir assets estáticos (CSS, JS, imágenes de Vite/React)
    if (ruta_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=ruta_dist / "assets"), name="assets")

    # Manejo del enrutamiento SPA (React Router)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def servir_spa(full_path: str):
        # Evitar capturar peticiones a la API que devuelvan 404
        rutas_api = ("citas", "clientes", "servicios", "pagos", "docs", "openapi.json")
        if full_path.startswith(rutas_api):
            return FileResponse(status_code=404)
        
        archivo_solicitado = ruta_dist / full_path
        if archivo_solicitado.exists() and archivo_solicitado.is_file():
            return FileResponse(archivo_solicitado)
        
        # Redirigir cualquier otra ruta de navegación web al index.html
        return FileResponse(ruta_dist / "index.html")

else:
    # Ruta por defecto mientras estás solo en desarrollo de backend (sin carpeta dist)
    @app.get("/")
    def read_root():
        return {"mensaje": "Backend Renova Studio activo (sin carpeta dist de frontend)"}


if __name__ == "__main__":
    def abrir_modo_app():
        import subprocess
        url = "http://127.0.0.1:8000"
        
        # Intenta abrir en modo APP con Chrome o Edge
        try:
            # Comando para Windows
            subprocess.Popen(f'start msedge --app={url}', shell=True)
        except Exception:
            try:
                subprocess.Popen(f'start chrome --app={url}', shell=True)
            except Exception:
                # Si falla, cae al navegador por defecto
                webbrowser.open(url)

    threading.Timer(1.2, abrir_modo_app).start()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
