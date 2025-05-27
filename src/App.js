import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AgregarProducto from "./components/AgregarProducto";
import CargarJSON from "./components/CargarJSON";
import GestionarProducto from "./components/GestionarProducto";
import BuscarProductoPorDescripcion from "./components/BuscarProductoPorDescripcion";
import CargarEmpaqueViejo from './components/CargarEmpaqueViejo';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const App = () => {
  const cerrarMenu = () => {
    const menu = document.getElementById('menuNav');
    if (menu && menu.classList.contains('show')) {
      const bsCollapse = new window.bootstrap.Collapse(menu, {
        toggle: true,
      });
      bsCollapse.hide();
    }
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/" onClick={cerrarMenu}>
          Control de Vencimientos de Etiquetas
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={cerrarMenu}>Pantalla Principal</Link>
            </li>
            <li className="nav-item">
              <Link to="/agregar" className="nav-link" onClick={cerrarMenu}>Agregar Empaque</Link>
            </li>
            <li className="nav-item">
              <Link to="/empaque-antiguo" className="nav-link" onClick={cerrarMenu}>Cargar Empaque Antiguo</Link>
            </li>
            <li className="nav-item">
              <Link to="/carga" className="nav-link" onClick={cerrarMenu}>Carga Masiva de Productos Nuevos</Link>
            </li>
            <li className="nav-item">
              <Link to="/gestionar" className="nav-link" onClick={cerrarMenu}>Gestionar Productos</Link>
            </li>
            <li className="nav-item">
              <Link to="/buscar-producto" className="nav-link" onClick={cerrarMenu}>Buscar Producto</Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agregar" element={<AgregarProducto />} />
          <Route path="/carga" element={<CargarJSON />} />
          <Route path="/gestionar" element={<GestionarProducto />} />
          <Route path="/buscar-producto" element={<BuscarProductoPorDescripcion />} />
          <Route path="/empaque-antiguo" element={<CargarEmpaqueViejo />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
