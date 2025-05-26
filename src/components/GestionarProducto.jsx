import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import Swal from 'sweetalert2';

const GestionarProducto = () => {
  const [ean, setEan] = useState('');
  const [producto, setProducto] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [diasVencimiento, setDiasVencimiento] = useState('');
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const limpiar = () => {
    setEan('');
    setDescripcion('');
    setDiasVencimiento('');
    setProducto(null);
    setBusquedaRealizada(false);
  };

  const buscarProducto = async () => {
    if (!ean) return;

    setBusquedaRealizada(true);

    try {
      const q = query(collection(db, 'productos'), where('ean', '==', ean));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0];
        const data = docRef.data();
        setProducto({ id: docRef.id, ...data });
        setDescripcion(data.descripcion);
        setDiasVencimiento(data.diasVencimiento);
      } else {
        setProducto(null);
        setDescripcion('');
        setDiasVencimiento('');
        Swal.fire('Producto nuevo', 'Podés registrar este PLU como nuevo.', 'info');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un error al buscar el producto.', 'error');
    }
  };

  const guardarProducto = async () => {
    if (!descripcion || !diasVencimiento || !ean) {
      Swal.fire('Faltan datos', 'Completá todos los campos.', 'warning');
      return;
    }

    try {
      const data = {
        ean,
        descripcion,
        diasVencimiento: parseInt(diasVencimiento),
      };

      if (producto) {
        await updateDoc(doc(db, 'productos', producto.id), data);
        Swal.fire('Actualizado', 'Producto actualizado correctamente.', 'success');
      } else {
        const nuevoRef = doc(collection(db, 'productos'));
        await setDoc(nuevoRef, data);
        Swal.fire('Creado', 'Producto creado correctamente.', 'success');
      }

      limpiar();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar el producto.', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Producto</h3>

      <div className="mb-3">
        <label className="form-label">PLU</label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
          />
          <button className="btn btn-primary me-2" onClick={buscarProducto}>Buscar</button>
         
        </div>
      </div>

      {busquedaRealizada && (
        <>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Días hasta vencimiento</label>
            <input
              type="number"
              className="form-control"
              value={diasVencimiento}
              onChange={(e) => setDiasVencimiento(e.target.value)}
            />
          </div>

          <button className="btn btn-success" onClick={guardarProducto}> 
         
            {producto ? 'Actualizar' : 'Crear'} Producto
          </button>
             {" "} <button className="btn btn-secondary" onClick={limpiar}>Cancelar</button>
        </>
      )}
    </div>
  );
};

export default GestionarProducto;
