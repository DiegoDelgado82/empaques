import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  getDoc
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [alertaMostrada, setAlertaMostrada] = useState(false);
  
  const obtenerProductos = async () => {
    const q = query(collection(db, 'empaques'));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map(doc => {
      const data = doc.data();

      if (!data.fechaVencimiento || !data.fechaEnvasado) {
        console.warn(`Documento ${doc.id} sin fechas`);
        return null;
      }

      const vencimientoDate = data.fechaVencimiento.toDate();
      const envasadoDate = data.fechaEnvasado.toDate();
      const diasRestantes = dayjs(vencimientoDate).diff(dayjs(), 'day');

      return {
  id: doc.id,
  ...data,
  _rawFechaVencimiento: data.fechaVencimiento.toDate(),
  fechaVencimiento: dayjs(data.fechaVencimiento.toDate()).format('DD/MM/YYYY'),
  fechaEnvasado: dayjs(data.fechaEnvasado.toDate()).format('DD/MM/YYYY'),
  diasRestantes
};
    });

    setProductos(lista.filter(Boolean));
  };

  const actualizarVencidos = async () => {
    const hoy = dayjs().startOf('day');

    for (let p of productos) {
     const vencimiento = dayjs(p._rawFechaVencimiento).startOf('day');
      if (p.estado === 'creado' && vencimiento.isBefore(hoy)) {
        const productoRef = doc(db, 'empaques', p.id);
        await updateDoc(productoRef, { estado: 'vencido' });
      }
    }

    obtenerProductos();
  };

  const lanzarAlertas = () => {
    const criticos = productos.filter(p => p.estado === 'creado' && p.diasRestantes <= 3);

    if (criticos.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Productos por vencer!',
        html: `Tenés <b>${criticos.length}</b> productos que vencen en 3 días o menos.`,
        confirmButtonText: 'Ver ahora'
      });
    }
  };

  const marcarComoRevisado = async (id) => {
    const ref = doc(db, 'empaques', id);
    const docSnap = await getDoc(ref);

    if (!docSnap.exists()) {
      Swal.fire('Error', 'No se encontró el documento.', 'error');
      return;
    }

    await updateDoc(ref, { estado: 'revisado' });
    Swal.fire('Revisado', 'Producto marcado como revisado.', 'success');
    obtenerProductos();
  };

  const getColor = (dias) => {
    if (dias <= 3) return 'table-danger';
    if (dias <= 7) return 'table-warning';
    return 'table-success';
  };

const cancelarEmpaque = async (id) => {
  const confirmar = await Swal.fire({
    title: '¿Cancelar empaque?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No'
  });

  if (confirmar.isConfirmed) {
    const ref = doc(db, 'empaques', id);
    await updateDoc(ref, { estado: 'cancelado' });
    setProductos(prev => prev.filter(p => p.id !== id));
    Swal.fire('Cancelado', 'El empaque fue cancelado.', 'success');
  }
};


  const productosFiltrados = productos.filter(p => {
    if (filtroEstado === 'todos') return p.estado !== 'cancelado' && p.estado !== 'revisado';
    return p.estado === filtroEstado;
  });

  useEffect(() => {
    obtenerProductos();
  }, []);

 useEffect(() => {
  if (productos.length > 0) {
    actualizarVencidos();

    if (!alertaMostrada) {
      lanzarAlertas();
      setAlertaMostrada(true);
    }
  }
}, [productos]);

  return (
    <div className="container mt-4">
      <h2>Control de Productos Etiquetados</h2>

      <div className="mb-3">
        <label>Filtrar por estado:</label>
        <select
          className="form-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos (excepto cancelados)</option>
          <option value="creado">Creados</option>
          <option value="revisado">Revisados</option>
          <option value="vencido">Vencidos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Descripción</th>
            <th>PLU</th>
            <th>Envasado</th>
            <th>Vencimiento</th>
            <th>Días restantes</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p) => (
            <tr key={p.id} className={getColor(p.diasRestantes)}>
              <td>{p.descripcion}</td>
              <td>{p.ean}</td>
              <td>{p.fechaEnvasado}</td>
              <td>{p.fechaVencimiento}</td>
              <td>{p.diasRestantes}</td>
              <td>{p.estado}</td>
              <td>
  {p.estado === 'creado' && (
    <>
      {/* Mostrar solo si está dentro del umbral de revisión */}
      {(
        (p.diasRestantes <= 5) 
      ) && (
        <button
          className="btn btn-outline-primary btn-sm me-2"
          onClick={() => marcarComoRevisado(p.id)}
        >
          <FaEye /> Revisar
        </button>
      )}

      {/* Siempre se puede cancelar mientras esté en "creado" */}
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => cancelarEmpaque(p.id)}
      >
        Cancelar
      </button>
    </>
  )}
  {p.estado === 'vencido' && (
    <button
      className="btn btn-outline-primary btn-sm"
      onClick={() => marcarComoRevisado(p.id)}
    >
      <FaEye /> Revisar Vencido
    </button>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
