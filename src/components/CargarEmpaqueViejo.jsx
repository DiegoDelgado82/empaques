
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const CargarEmpaqueViejo = () => {
  const [ean, setEan] = useState('');
  const [fechaEnvasado, setFechaEnvasado] = useState('');
  const [productos, setProductos] = useState([]);
  const [coincidencias, setCoincidencias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, 'productos'));
      const lista = snapshot.docs.map(doc => doc.data());
      setProductos(lista);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (ean.trim() === '') {
      setCoincidencias([]);
      setProductoSeleccionado(null);
      return;
    }
    const filtro = productos.filter(p => p.ean.includes(ean));
    setCoincidencias(filtro);
  }, [ean, productos]);

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setEan(producto.ean);
    setCoincidencias([]);
  };

  const guardarEmpaque = async () => {
    if (!productoSeleccionado || !fechaEnvasado) {
      Swal.fire('Error', 'Seleccioná un producto y una fecha válida.', 'warning');
      return;
    }

    const fechaBase = dayjs(fechaEnvasado, 'YYYY-MM-DD');
    if (!fechaBase.isValid()) {
      Swal.fire('Fecha inválida', 'Revisá el formato de la fecha.', 'error');
      return;
    }

    const vencimiento = fechaBase.add(productoSeleccionado.diasVencimiento, 'day');

    const empaque = {
      descripcion: productoSeleccionado.descripcion,
      ean: productoSeleccionado.ean,
      fechaEnvasado: fechaBase.toDate(),
      fechaVencimiento: vencimiento.toDate(),
      estado: 'creado',
      diasVencimiento: productoSeleccionado.diasVencimiento
    };

    try {
      await addDoc(collection(db, 'empaques'), empaque);
      Swal.fire('Guardado', 'Empaque antiguo registrado correctamente.', 'success');
      setEan('');
      setFechaEnvasado('');
      setProductoSeleccionado(null);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al guardar el empaque.', 'error');
    }
  };

  return (
    <div className="container mt-4 position-relative">
      <h3>Cargar empaque antiguo</h3>

      <div className="mb-3">
        <label className="form-label">Código EAN</label>
        <input
          type="text"
          className="form-control"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
        {coincidencias.length > 0 && (
          <ul className="list-group position-absolute w-100" style={{ zIndex: 10 }}>
            {coincidencias.map((p, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                style={{ cursor: 'pointer' }}
                onClick={() => seleccionarProducto(p)}
              >
                {p.ean} - {p.descripcion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de envasado</label>
        <input
          type="date"
          className="form-control"
          value={fechaEnvasado}
          onChange={(e) => setFechaEnvasado(e.target.value)}
        />
      </div>

      {productoSeleccionado && (
        <div className="alert alert-info">
          <strong>Producto seleccionado:</strong><br />
          {productoSeleccionado.descripcion}<br />
          {productoSeleccionado.diasVencimiento} días hasta vencimiento
        </div>
      )}

      <button className="btn btn-primary" onClick={guardarEmpaque}>
        Guardar empaque
      </button>
    </div>
  );
};

export default CargarEmpaqueViejo;
