import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AgregarProducto from "./components/AgregarProducto";
import CargarJSON from "./components/CargarJSON";
import GestionarProducto from './components/GestionarProducto';
import 'bootstrap/dist/css/bootstrap.min.css';
import BuscarProductoPorDescripcion from './components/BuscarProductoPorDescripcion';

const App = () => {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <span className="navbar-brand">Control de Vencimientos de Etiquetas</span>
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Pantalla Principal</Link>
          <Link to="/agregar" className="nav-link">Agregar Empaque</Link>
          <Link to="/carga" className="nav-link">Carga Masiva de Productos Nuevos</Link>
          <Link to="/gestionar" className="nav-link">Gestionar Producto</Link>
          <Link to="/buscar-producto" className="nav-link">Buscar Producto</Link> 
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agregar" element={<AgregarProducto />} />
          <Route path="/carga" element={<CargarJSON />} />
          <Route path="/gestionar" element={<GestionarProducto />} />
          <Route path="/buscar-producto" element={<BuscarProductoPorDescripcion />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
