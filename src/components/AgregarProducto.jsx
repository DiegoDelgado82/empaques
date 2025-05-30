import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const AgregarProducto = () => {
  const [ean, setEan] = useState("");
  const [productos, setProductos] = useState([]);
  const [coincidencias, setCoincidencias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const lista = snapshot.docs.map(doc => doc.data());
      setProductos(lista);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (ean.trim() === "") {
      setCoincidencias([]);
      setProductoSeleccionado(null);
      setBusquedaRealizada(false);
      return;
    }

    const filtro = productos.filter(p => p.ean.includes(ean));
    setCoincidencias(filtro);
    setBusquedaRealizada(true);
    setProductoSeleccionado(null); // Siempre resetear si cambia el EAN
  }, [ean, productos]);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setEan(producto.ean);
    setCoincidencias([]);
    setBusquedaRealizada(false);
  };

  const agregarEmpaque = async () => {
    if (!productoSeleccionado) {
      MySwal.fire("Faltan datos", "Debes seleccionar un producto válido de la lista", "warning");
      return;
    }

    const fechaEnvasado = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaEnvasado.getDate() + productoSeleccionado.diasVencimiento);

    try {
      await addDoc(collection(db, "empaques"), {
        ean: productoSeleccionado.ean,
        descripcion: productoSeleccionado.descripcion,
        fechaEnvasado,
        fechaVencimiento,
        estado: "creado"
      });

      MySwal.fire("Registrado", "El producto fue envasado exitosamente", "success");
      setEan("");
      setProductoSeleccionado(null);
    } catch (error) {
      console.error("Error al agregar empaque:", error);
      MySwal.fire("Error", "No se pudo registrar el producto", "error");
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <h3>Agregar Producto Envasado</h3>

      <div className="mb-3">
        <label htmlFor="ean" className="form-label">Código EAN</label>
        <input
          type="text"
          className="form-control"
          id="ean"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
        {coincidencias.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 10 }}>
            {coincidencias.map((p, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => seleccionarProducto(p)}
              >
                {p.ean} - {p.descripcion}
              </li>
            ))}
          </ul>
        )}
        {busquedaRealizada && coincidencias.length === 0 && (
          <div className="alert alert-warning mt-2">
            No se encontraron productos con ese código.
          </div>
        )}
      </div>

      {productoSeleccionado && (
        <div className="mb-3 alert alert-info">
          <p><strong>Descripción:</strong> {productoSeleccionado.descripcion}</p>
          <p><strong>Días hasta vencimiento:</strong> {productoSeleccionado.diasVencimiento}</p>
          <button onClick={agregarEmpaque} className="btn btn-success mt-2">Registrar Empaque</button>
        </div>
      )}
    </div>
  );
};

export default AgregarProducto;
