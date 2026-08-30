import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './componentes/Sidebar';
import DashboardAdmin from './paginas/DashboardAdmin';
import Citas from './paginas/Citas';
import Clientes from './paginas/Clientes';
import GestionPagos from './paginas/Pagos';
import Servicios from './paginas/Servicios';

function App() {
  return (
    <Router>
      {/* 
        CAMBIO CLAVE: 
        - flex-col: En celulares se apila (Sidebar arriba, Contenido abajo).
        - md:flex-row: En computadoras (pantallas de más de 768px) se pone lado a lado.
      */}
      <div className="flex flex-col md:flex-row bg-renova-bg min-h-screen w-full overflow-x-hidden">
        {/* Barra lateral */}
        <Sidebar />

        {/* Contenedor dinámico del contenido */}
        <main className="flex-1 w-full min-w-0 p-4 md:p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardAdmin />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pagos" element={<GestionPagos />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="*" element={<DashboardAdmin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
