const hostname = window.location.hostname;

// Puerto de FastAPI
const BACKEND_PORT = "8000";

export const API_BASE_URL = `http://${hostname}:${BACKEND_PORT}`;