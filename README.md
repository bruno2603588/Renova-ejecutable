# 📄 Sistema de Gestión Renova — Studio Management

Este repositorio contiene el código fuente de **Renova**, un ecosistema de software modularizado de extremo a extremo (End-to-End) diseñado específicamente para optimizar la administración de salones de estilismo y estética. El sistema automatiza el flujo completo de reservas, el control de clientes, catálogos de servicios y consolidación financiera multimoneda en caliente.

---

## 🚀 Arquitectura y Tecnologías Utilizadas

La aplicación implementa una separación limpia de responsabilidades (Decoupled Architecture) estructurada de la siguiente manera:

* **Backend (API RESTful):** Desarrollado en `Python 3.12` utilizando el framework de alta velocidad `FastAPI`. Toda la persistencia, mapeo relacional de datos y ejecución de consultas complejas unificadas (INNER JOINs) se realiza mediante `SQLAlchemy ORM` y sentencias SQL puras bajo el servidor ASGI `Uvicorn`.
* **Frontend (SPA):** Construido sobre `React.js` (`JavaScript ES6+`), empleando peticiones asíncronas optimizadas (`Async/Await` / `Fetch API`) para el consumo dinámico de endpoints y una arquitectura ágil basada en estados para asegurar una interfaz interactiva y fluida. Estilizado con `Tailwind CSS`.
* **Entorno de Infraestructura:** Aislamiento de entornos locales y orquestación de almacenamiento gestionado opcionalmente bajo contenedores de `Podman` para asegurar la portabilidad y resolver conflictos de virtualización en entornos de desarrollo.

---

## 📦 Dependencias del Sistema

### Backend (Python Ecosystem)
Para levantar el servidor de FastAPI, asegúrate de tener las siguientes dependencias instaladas en tu entorno virtual:

| Dependencia | Versión Mínima | Propósito Principal en Renova |
| :--- | :--- | :--- |
| `fastapi` | `0.111.x` | Enrutamiento asíncrono, inyección de dependencias y control de excepciones HTTP. |
| `uvicorn[standard]`| `0.30.x` | Servidor web de interfaz de puerta de enlace asíncrona (ASGI) de alto rendimiento. |
| `pydantic` | `2.7.x` | Esquemas estrictos de validación de datos de entrada/salida (Data Transfer Objects). |
| `sqlalchemy` | `2.0.x` | Motor ORM para abstracción de tablas relacionales y ejecución segura de SQL Puro. |

### Frontend (Node Core)
Módulos clave configurados en el archivo `package.json`:

| Módulo | Versión Mínima | Aplicación Funcional |
| :--- | :--- | :--- |
| `react` / `react-dom` | `18.x` | Estructura de la interfaz basada en componentes independientes y renderizado del DOM virtual. |
| `react-router-dom` | `6.x` | Manejador de rutas del lado del cliente para la barra lateral estática (`Sidebar Navigation`). |
| `tailwindcss` | `3.x` | Framework de diseño utilitario para la paleta cromática minimalista de la marca. |

---

## 📂 Estructura de Endpoints de la API

El backend se encuentra segmentado en enrutadores independientes (`APIRouter`) alineados a las reglas de normalización de la base de datos:

### 1. Módulo de Clientes (`@router_clientes`)
* `POST /clientes/nuevo-cliente`: Inserta un nuevo cliente validando unicidad por nombre completo (`esquemas.clientecreate`). Retorna `409 Conflict` si el registro ya existe.

### 2. Módulo de Citas (`@router_citas`)
* `POST /citas/`: Agenda una nueva cita asociando claves foráneas válidas. Valida existencia de cliente y servicio emitiendo `404 Not Found` si no existen.
* `PUT /citas/{cita_id}/estado`: Actualiza de forma estricta el estado del turno (`pendiente`, `atendido`, `atendida`, `cancelada`) procesando cadenas en minúsculas.

### 3. Módulo de Finanzas y Caja (`@router_pagos`)
* `POST /pagos/pagos`: Registra una transacción económica vinculada a una cita. Soporta entornos contables multimoneda.
* `GET /pagos/completados`: Historial unificado mediante consultas complejas en SQL Puro cruzando datos operativos de citas y pagos realizados.
* `GET /pagos/resumen-caja`: Mapeo agregador automático de balances acumulados segregados estrictamente por tipo de cambio (`USD` y `VES`).

---

## ⚙️ Optimizaciones de Rendimiento del Motor de Datos

Para mitigar retrasos por volumen de transacciones concurrentes en entornos SQLite, el sistema cuenta con:
1. **Modo WAL (Write-Ahead Logging):** Eventos de conexión en SQLAlchemy configurados con `PRAGMA journal_mode=WAL;` y `PRAGMA synchronous=NORMAL;`, permitiendo que las lecturas y escrituras ocurran concurrentemente sin bloqueos de archivo.
2. **Indexación Crítica:** Declaración explícita de índices en columnas de búsqueda intensiva y JOINs: `citas.estado`, `citas.fecha_hora` y llaves foráneas para garantizar consultas instantáneas en el Dashboard del Administrador al calcular el cierre del "día anterior".

---

## 💻 Instrucciones de Ejecución Rápida

### Backend:
```bash
# Activar entorno virtual de Python
source venv/bin/activate

# Ejecutar servidor Uvicorn con recarga automática
uvicorn main:app --reload