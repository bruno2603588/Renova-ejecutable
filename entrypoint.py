import os
import sys
import time
import threading
import webbrowser
import uvicorn

# Solución necesaria para PyInstaller al manejar hilos/subprocesos en Windows
import multiprocessing
multiprocessing.freeze_support()

def abrir_navegador():
    # Esperar 2 segundos a que Uvicorn inicie completamente el servidor
    time.sleep(2)
    url = "http://127.0.0.1:8000"
    
    # Intentar abrir con webbrowser
    if not webbrowser.open(url):
        # Si webbrowser falla en modo ejecutable, forzar la apertura en Windows
        if sys.platform == "win32":
            os.system(f'start {url}')

if __name__ == "__main__":
    # Iniciar el hilo que abrirá el navegador
    threading.Thread(target=abrir_navegador, daemon=True).start()
    
    # Iniciar el servidor Uvicorn
    # NOTA: Importante pasar el objeto 'app' directo o importar correctamente
    from app.main import app
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")
