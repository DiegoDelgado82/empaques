import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const BuscarProductoPorDescripcion = () => {
  const [descripcionBuscada, setDescripcionBuscada] = useState('');
  const [coincidencias, setCoincidencias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productosTotales, setProductosTotales] = useState([]);

  useEffect(() => {
    // Cargar todos los productos al montar el componente
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, 'productos'));
      const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductosTotales(productos);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (descripcionBuscada.trim() === '') {
      setCoincidencias([]);
      setProductoSeleccionado(null);
      return;
    }

    const filtro = productosTotales.filter(p =>
      p.descripcion.toLowerCase().includes(descripcionBuscada.toLowerCase())
    );

    setCoincidencias(filtro);
    setProductoSeleccionado(null);
  }, [descripcionBuscada, productosTotales]);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setDescripcionBuscada(producto.descripcion);
    setCoincidencias([]);
  };

  return (
    <div className="container mt-4">
      <h3>Buscar producto por descripción</h3>

      <div className="mb-3 position-relative">
        <label className="form-label">Descripción</label>
        <input
          type="text"
          className="form-control"
          value={descripcionBuscada}
          onChange={(e) => setDescripcionBuscada(e.target.value)}
        />
        {coincidencias.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
            {coincidencias.map((p) => (
              <li
                key={p.id}
                className="list-group-item list-group-item-action"
                style={{ cursor: 'pointer' }}
                onClick={() => seleccionarProducto(p)}
              >
                {p.descripcion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {productoSeleccionado && (
        <div className="alert alert-info mt-3">
          <p><strong>PLU:</strong> {productoSeleccionado.ean}</p>
          <p><strong>Descripción:</strong> {productoSeleccionado.descripcion}</p>
          <p><strong>Días hasta vencimiento:</strong> {productoSeleccionado.diasVencimiento}</p>
        </div>
      )}
    </div>
  );
};

export default BuscarProductoPorDescripcion;
