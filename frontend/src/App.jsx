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
      <div className="flex bg-renova-bg min-h-screen">
        {/* Barra lateral fija */}
        <Sidebar />

        {/* Contenedor dinámico del contenido */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardAdmin />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pagos" element={<GestionPagos />} />
            <Route path="*" element={<DashboardAdmin />} />
            <Route path="/servicios" element={<Servicios />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

